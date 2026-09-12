# 0xTank/DeepSeek-V4.1-Flash

## Resumen

DeepSeek-V4.1-Flash es un modelo multimodal de tipo Mixture-of-Experts (MoE) desarrollado por DeepSeek, con un backbone declarado de 552.000 millones de parametros y soporte de contextos de hasta un millon de tokens. Procesa de forma nativa imagenes y texto, y genera texto de manera autorregresiva. Su rasgo diferencial es la compresion agresiva de la cache KV: la atencion dispersa CSA2 y el cacheo en FP4 reducen la huella global de KV a 890 bytes por token, aproximadamente una cuarta parte de la de DeepSeek-V4-Flash. El repositorio analizado, 0xTank/DeepSeek-V4.1-Flash, no es el modelo original, sino un espejo de conveniencia de los pesos oficiales (88 archivos, 510.313.353.565 bytes, unos 510,3 GB) publicado por el usuario 0xTank, que conserva la licencia MIT y la atribucion de DeepSeek.

La relevancia tecnica del modelo esta en su arquitectura Causal Encoder-Decoder (CED) de 40 capas (20 de encoder causal y 20 de decoder), que proyecta la cache KV global del decoder a partir de los estados ocultos finales del encoder en lugar de derivarla de cada capa del decoder. Esto permite activar solo 8.000 millones de parametros por token en fase de prefill y 16.000 millones en fase de decode, lo que abarata las cargas de trabajo con muchas entradas y pocas salidas, tipicas de agentes. La segunda innovacion es SWA Bounded Replay, que reconstruye los estados KV de ventana deslizante que faltan replicando unicamente los ultimos n_win tokens, evitando persistir esos estados en SSD y reduciendo la cache KV persistente a aproximadamente 1/8 de la de DeepSeek-V4-Flash.

El espejo de 0xTank anade valor practico porque documenta una receta de despliegue en cuatro equipos NVIDIA GB10 con vLLM, runtime DSpark K3 y una configuracion de 600K de contexto, con resultados de benchmark propios enlazados desde el repositorio. Es, por tanto, un punto de partida util para equipos que quieran evaluar el modelo en hardware de gama de escritorio profesional en lugar de en un cluster de GPU de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Causal Encoder-Decoder (CED) multimodal con MoE; 40 capas (20 encoder causal + 20 decoder) |
| Parametros totales | 763.205.315.794 (~763B) segun los safetensors del repositorio; la model card del original declara 552B en el backbone y 196B en la memoria condicional Engram |
| Parametros activos | 8B por token en prefill y 16B por token en decode (dato del original) |
| Longitud de contexto | Hasta 1.000.000 tokens; el material de despliegue de 0xTank menciona una configuracion de 600K |
| Tipos de cuantizacion | Pesos en 8-bit/FP8 (tags del repositorio); cache KV principal en FP4 (formato E2M1 con una escala E4M3 por cada 16 canales) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 510.313.353.565 bytes (unos 510,3 GB), 88 archivos |
| Pipeline declarado | image-text-to-text |
| Composición MoE | 1 experto compartido y 384 expertos enrutados por capa; 6 expertos enrutados activados por token |

## Arquitectura y entrenamiento

El modelo usa una arquitectura Causal Encoder-Decoder de 40 capas Transformer, dividida en 20 capas de encoder causal y 20 de decoder. En lugar de calcular la cache KV global del decoder a partir de los estados ocultos de cada capa del decoder, CED la proyecta desde los estados ocultos finales del encoder. El resultado es un coste de activacion de 8B por token en prefill y 16B por token en decode. La atencion se gestiona con Compressed Sparse Attention 2 (CSA2), que asigna a cada capa de atencion uno de tres modos estaticos (Full, Reindex o Reuse) para compartir la KV principal y la K del indexador entre capas y reutilizar los indices Top-K de atencion dispersa. En el decoder, un indexador disperso jerarquico restringe las capas de indexado posteriores a un conjunto de candidatos construido por la primera capa en modo Full, acotando el coste del indexado en profundidad con independencia de la longitud de contexto. El cacheo de la KV principal en FP4 (E2M1, con una escala E4M3 por cada 16 canales) deja la huella global de KV en 890 bytes por token, aproximadamente 1/4 de la de DeepSeek-V4-Flash.

Otros componentes reseñados son Single-Pass mHC (mezcla revisada del flujo residual, con el kernel eficiente Mega-mHC), la memoria condicional Engram de 196B parametros de acceso disperso mediante lookup por token, y la decodificacion especulativa DSpark, que combina generacion de borradores semiautorregresiva con verificacion programada por confianza. La parte multimodal la aporta un encoder de vision DeepSeek-ViT, entrenado desde cero con 2D-RoPE y downsampling 3x3 de pixel-unshuffle, junto con un proyector MLP de dos capas que convierte las imagenes en embeddings visuales procesados conjuntamente con los embeddings de texto desde el inicio del preentrenamiento del modelo de lenguaje. El preentrenamiento se hizo desde cero sobre un corpus multimodal de 45T tokens, con la atencion dispersa entrenada a una longitud de secuencia de 64K y el contexto extendido hasta 1M tokens a partir de los 34T tokens. El post-entrenamiento sigue la receta SFT, RL y destilacion on-policy (el fragmento disponible de la model card se corta en "on-policy di").

## Capacidades

- Generacion de texto autorregresiva sobre contextos de hasta 1.000.000 tokens.
- Comprension de imagenes combinada con texto (pipeline image-text-to-text): el encoder DeepSeek-ViT y el proyector MLP inyectan embeddings visuales procesados junto al texto.
- Eficiencia en cargas con muchas entradas y pocas salidas, gracias a los 8B parametros activos por token en prefill.
- Decodificacion especulativa integrada mediante DSpark, orientada a reducir la latencia de generacion.
- Memoria condicional Engram de 196B parametros accedida por lookup disperso por token.
- Atencion dispersa de ventana deslizante con SWA Bounded Replay para reconstruir estados KV sin persistirlos en SSD.
- Soporte de tool calling / function calling: no documentado en el material disponible.
- Soporte de agentes y razonamiento multi-paso: el material menciona cargas agenticas como caso de uso objetivo, pero no detalla capacidades especificas de agente.
- Capacidades multilingues: no disponibles; el repositorio no declara idiomas.
- Modo thinking explicito, audio o video: no disponible en el material consultado.

## Casos de uso

- Analisis de repositorios de codigo completos: con 1M tokens de contexto, el modelo puede ingerir arboles de directorios extensos con documentacion y ficheros de configuracion en una sola pasada, apoyandose en el bajo coste de prefill (8B parametros activos) para cargas con muchas entradas y pocas salidas.
- Agentes autonomos con historial largo: la combinacion de contexto de 1M tokens y cache KV de 890 bytes por token permite mantener trazas de herramientas, observaciones y estados intermedios de muchos pasos sin agotar memoria, un escenario que el propio model card identifica como objetivo de diseño.
- Atencion al cliente automatizada: conversaciones multi-turno con historial practicamente ilimitado gracias a la ventana de 1M tokens y a la reduccion de la cache KV, que hace viable mantener sesiones largas en servidores con memoria unificada.
- Analisis documental multimodal: facturas, informes escaneados, planos o capturas con texto incrustado pueden procesarse combinando el encoder de vision con el contexto largo, extrayendo y relacionando informacion de cientos de paginas.
- Busqueda aumentada (RAG) sobre corpus corporativos: el modelo puede recibir grandes lotes de fragmentos recuperados en una sola ventana, reduciendo la perdida de contexto que se produce al trocear la informacion en consultas cortas.
- Investigacion y razonamiento sobre literatura cientifica: ingesta de articulos completos con figuras y tablas, cruzando referencias entre documentos dentro de un unico contexto de 1M tokens.
- Despliegue en laboratorio o edge profesional: con la receta de cuatro GB10 y vLLM documentada por 0xTank, un equipo pequeno puede servir el modelo a 600K de contexto sin acceder a un cluster de GPU de datacenter.
- Generacion y revision de codigo en pipelines internos: el modelo puede integrarse como componente de un flujo de revision si se confirma el soporte de tool calling, algo que el material disponible no documenta; conviene validarlo antes de llevarlo a produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de 0xTank enlaza una receta de despliegue en cuatro GB10 con vLLM, runtime DSpark K3 y configuracion de 600K, y afirma incluir resultados de benchmark propios en esa pagina, pero los valores numericos no forman parte del material analizado.

## Requisitos de hardware

- Pesos: el repositorio ocupa 510,3 GB en 88 archivos safetensors, por lo que se necesita al menos ese espacio en memoria para servirlo en el formato publicado (8-bit/FP8), mas overhead de runtime y cache.
- GPU recomendadas: el material referencia un despliegue en cuatro NVIDIA GB10 (familia DGX Spark, 128 GB de memoria unificada por unidad, 512 GB agregados) con vLLM y el runtime DSpark K3. Para el modelo completo no se documentan otras configuraciones.
- No cabe en GPU de consumo: con 510 GB de pesos en 8-bit, no entra en una RTX 4090 (24 GB) ni en una RTX 5090 (32 GB), ni siquiera con cuantizaciones mas agresivas no publicadas en este repositorio.
- Cache KV: a 890 bytes por token en FP4, un contexto de 1M tokens ocupa aproximadamente 0,89 GB de cache KV global, ademas de la cache KV persistente de ventana deslizante, reducida a cerca de 1/8 de la de DeepSeek-V4-Flash.
- Opciones de despliegue: vLLM con el runtime y los kernels empaquetados por 0xTank, y la libreria transformers para carga de pesos. La receta base proviene del repositorio de Tech2Wild/Kai (tonyd2wild) sobre DGX Spark.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cache KV global | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash | 763B totales en safetensors (552B de backbone + 196B Engram) | 1M tokens | 890 bytes por token (FP4) | MIT | Pesos en HuggingFace (original y espejo) |
| DeepSeek-V4-Flash | no disponible | no disponible | aproximadamente 4x la de V4.1-Flash segun la model card | no disponible | Referenciado como modelo anterior de la familia |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion cuantitativa presente en el material es la reduccion de cache KV y de cache KV persistente frente a DeepSeek-V4-Flash. No se dispone de datos de parametros, contexto ni rendimiento de otros modelos comparables en la informacion consultada.

## Limitaciones y advertencias

- El repositorio analizado es un espejo de terceros (0xTank), no la publicacion oficial de DeepSeek. La model card declara que los archivos de pesos no se han modificado y que los hashes se verificaron contra la revision fijada dba1be0a40aa45a94ad051997016db3960a90277, pero la verificacion independiente corre por cuenta del usuario.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (12 de septiembre de 2026), por lo que no existe historial de uso que respalde su fiabilidad como artefacto de distribucion.
- La revision de descarga indicada en el propio README (39a872b296d3570e4a5bbb27138bbfa1a9755e50) corresponde al espejo, no a la revision del modelo original; conviene fijar ambas al reproducir un despliegue.
- No hay resultados de benchmarks publicados en el material disponible, ni datos de evaluacion independiente del modelo original en esta ficha.
- No se declaran los idiomas soportados; el rendimiento en castellano no puede darse por supuesto.
- No se documentan capacidades de tool calling, modo thinking, audio o video; cualquier integracion que dependa de ellas debe validarse antes de llevarla a produccion.
- La model card del original esta truncada en la seccion de post-entrenamiento, de modo que la receta completa (SFT, RL y destilacion on-policy) no puede reproducirse a partir de este material.
- Riesgo de alucinacion: no se aportan tasas de error ni evaluaciones de fidelidad; en tareas facturadas o de atencion al cliente se recomienda verificacion externa.
- Sesgos conocidos: no documentados en la informacion disponible. Al ser un modelo entrenado sobre un corpus web multimodal de 45T tokens, es razonable esperar sesgos de ese origen, pero no hay mediciones publicadas en este material.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero el despliegue debe conservar el aviso de copyright de DeepSeek y el de la anotacion del espejo.
- Coste de hardware muy elevado: el modelo completo exige del orden de 510 GB solo para pesos, lo que descarta el despliegue en GPU de consumo y limita las opciones reales a configuraciones multi-dispositivo tipo cuatro GB10 o superiores.

## Enlaces

- Espejo en HuggingFace: https://huggingface.co/0xTank/DeepSeek-V4.1-Flash
- Modelo original: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Receta de despliegue y benchmarks de 0xTank (vLLM, 4x GB10): https://huggingface.co/0xTank/DeepSeek-V4.1-Flash-vLLM-4x-GB10-Recipe
- Receta base de despliegue en DGX Spark (Tech2Wild/Kai): https://github.com/tonyd2wild/DeepSeek-V4.1-Flash-vLLM-DGX-Spark
- Informe tecnico: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
- Web oficial de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Organizacion de DeepSeek en HuggingFace: https://huggingface.co/deepseek-ai
- Cuenta de X/Twitter de DeepSeek: https://twitter.com/deepseek_ai
- Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo: los unicos enlaces obtenidos correspondian a subreddits y consultas sin relacion con DeepSeek-V4.1-Flash.
