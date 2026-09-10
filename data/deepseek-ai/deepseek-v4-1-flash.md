# deepseek-ai/DeepSeek-V4.1-Flash

## Resumen

DeepSeek-V4.1-Flash es un modelo multimodal de tipo Mixture-of-Experts (MoE) desarrollado por DeepSeek AI, publicado en Hugging Face con licencia MIT. Su rasgo diferencial es la compresión agresiva de la caché KV: el autor declara una huella de 890 bytes por token, aproximadamente una cuarta parte de la de DeepSeek-V4-Flash y unas 437 veces menor que la de DeepSeek-V1. Procesa de forma nativa imagenes y texto, y genera texto de forma autorregresiva.

La arquitectura se denomina Causal Encoder-Decoder (CED): 40 capas de Transformer organizadas en 20 capas de encoder causal seguidas de 20 capas de decoder. La caché KV global del decoder se proyecta desde los estados ocultos finales del encoder en lugar de derivarse de cada capa del decoder, lo que permite activar solo 8B parametros por token en prefill y 16B en decode. El modelo declara soportar contextos de hasta un millon de tokens.

El modelo se entreno desde cero sobre un corpus multimodal de 45T tokens. El repositorio ocupa 510,3 GB y los pesos safetensors suman 484.619.644.114 parametros (unos 484,6B), una cifra que difiere de los 552B de backbone que menciona la model card. Es relevante ahora porque ataca el cuello de botella economico de las cargas agénticas con entradas muy largas: el coste de prefill y el almacenamiento de la caché KV.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) multimodal con arquitectura Causal Encoder-Decoder (CED); 40 capas (20 de encoder causal + 20 de decoder) |
| Parametros totales | 552B declarados como backbone en la model card; 484.619.644.114 (484,6B) contabilizados en los pesos safetensors publicados |
| Parametros activos | 8B por token en prefill, 16B por token en decode; 6 expertos enrutados activados por token de 384, mas 1 experto compartido |
| Longitud de contexto | Hasta 1.000.000 tokens (atencion dispersa entrenada a 64K y extendida a 1M durante el preentrenamiento) |
| Tipos de cuantizacion | FP8 / 8-bit segun las etiquetas del repositorio; cache KV principal en FP4 (formato E2M1, una escala E4M3 por cada 16 canales). No se menciona GGUF |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El bloque central es CED, un Transformer de 40 capas que separa encoder causal y decoder. La caché KV global del decoder se proyecta desde los estados finales del encoder, en lugar de calcularse capa a capa, lo que reduce el coste de prefill. Sobre esa base se anaden varios mecanismos: SWA Bounded Replay reconstruye los estados KV de ventana deslizante que faltan reproduciendo solo los ultimos n_win tokens, evitando persistir esa caché en SSD y bajando la huella persistente a aproximadamente 1/8 de la de DeepSeek-V4-Flash. Compressed Sparse Attention 2 (CSA2) asigna a cada capa de atencion uno de tres modos estaticos (Full, Reindex o Reuse) para compartir la KV principal y las K del indexador entre capas y reutilizar indices Top-K. En el decoder, un Hierarchical Sparse Indexer restringe las capas de indexado posteriores a un conjunto de candidatos construido por la primera capa en modo Full, acotando el coste del indexador independientemente de la longitud del contexto. La caché KV principal en FP4 (E2M1, una escala E4M3 por cada 16 canales) completa el diseno que lleva la huella a 890 bytes por token. Ademas, el modelo incorpora Single-Pass mHC (mezcla del flujo residual con el kernel Mega-mHC), Engram conditional memory (196B parametros de acceso disperso mediante lookup por token) y DSpark, una decodificacion especulativa con generacion de borradores semiautorregresiva y verificacion programada por confianza.

Para la parte multimodal, un encoder de vision DeepSeek-ViT entrenado desde cero con 2D-RoPE y downsampling de pixel-unshuffle 3x3, junto con un proyector MLP de dos capas, convierte las imagenes en embeddings visuales que se procesan conjuntamente con los embeddings de texto desde el inicio del preentrenamiento del modelo de lenguaje. El preentrenamiento se hizo desde cero sobre 45T tokens multimodales; el postentrenamiento sigue el paradigma SFT, RL y destilacion on-policy (OPD) sin modificaciones algoritmicas, con el esfuerzo puesto en la sintesis automatizada a gran escala de tareas y entornos agénticos. El modelo expone un ajuste de esfuerzo de razonamiento continuo y controlable (entero de 1 a 100) que intercambia coste de inferencia por precision.

## Capacidades

- Generacion de texto autorregresiva a partir de entradas de texto, de imagen o mixtas (pipeline image-text-to-text).
- Comprension multimodal nativa de imagenes: el encoder DeepSeek-ViT genera embeddings visuales que se integran con el texto durante todo el preentrenamiento, no como un adaptador posterior.
- Contexto largo de hasta 1.000.000 tokens, con atencion dispersa entrenada especificamente para sostenerlo.
- Razonamiento con esfuerzo controlable: el ajuste entero de 1 a 100 permite regular el coste de inferencia frente a la precision segun la tarea.
- Cargas agénticas y de multiples pasos: el postentrenamiento se centro en la sintesis de tareas y entornos agénticos, y la model card presenta benchmarks de rendimiento agéntico.
- Decodificacion especulativa integrada (DSpark) que acelera la generacion mediante borradores semiautorregresivos y verificacion programada por confianza.
- Eficiencia de prefill especialmente orientada a entradas largas, con solo 8B parametros activos por token en esa fase.
- La model card no detalla capacidades especificas de codigo, matematicas ni una lista de idiomas soportados, por lo que no se pueden confirmar. No se menciona soporte explicito de tool calling o function calling.

## Casos de uso

- Analisis de repositorios o corpus documentales completos: con hasta 1M tokens de contexto, el modelo puede ingerir un repositorio de codigo, un expediente o un conjunto de informes en una sola pasada sin fragmentar en trozos, manteniendo coherencia global.
- Agentes autonomos de multiples pasos: el coste de prefill de 8B parametros activos por token hace viable mantener conversaciones agénticas largas con muchas iteraciones de contexto sin disparar el gasto de computo.
- Atencion al cliente multi-turno de larga duracion: la ventana de 1M tokens permite conservar el historial completo de una interaccion o de varias sesiones relacionadas sin resumen intermedio.
- Procesamiento de documentos escaneados y formularios con imagen y texto combinados: al ser nativamente multimodal, puede leer capturas, diagramas o fotos junto al texto asociado en la misma peticion.
- RAG de gran escala con coste de memoria contenido: la caché KV de 890 bytes por token reduce drasticamente el almacenamiento necesario para servir muchas sesiones concurrentes con contextos largos, lo que abarata el despliegue en produccion.
- Analisis de trazas, logs o telemetria de sistemas extensos: la combinacion de contexto de 1M tokens y prefill barato permite volcar ventanas amplias de eventos y pedir correlaciones o diagnostico en una unica llamada.
- Extraccion estructurada sobre lotes masivos de documentos: el ajuste de esfuerzo de razonamiento (1-100) permite bajar el coste por documento en tareas simples y subirlo solo en los casos ambiguos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card anuncia una seccion de resultados de evaluacion para el modelo base, con imagenes de rendimiento agéntico y de tamano de cache KV por token, pero los valores concretos no aparecen en el contenido proporcionado. La unica cifra comparativa disponible es la reduccion de cache KV: aproximadamente 4 veces menor que DeepSeek-V4-Flash y 437 veces menor que DeepSeek-V1.

## Requisitos de hardware

- Tamano del repositorio: 510,3 GB. Los pesos safetensors suman 484.619.644.114 parametros, lo que a 8 bits (FP8) se corresponde con unos 485 GB, coherente con el tamano del repo.
- VRAM estimada: por debajo de unos 500-510 GB solo para pesos en la precision publicada, mas cache KV y activaciones. La cache KV consume 890 bytes por token, es decir, unos 890 MB por cada millon de tokens de contexto por secuencia.
- GPU recomendadas: se necesita un despliegue multi-GPU. Ocho H100 de 80 GB (640 GB) u ocho A100 de 80 GB serian el punto de partida razonable; en configuraciones mas ajustadas habria que recurrir a cuantizacion adicional (fp8 ya esta contemplado en las etiquetas).
- No cabe en GPU de consumo: ni una RTX 4090 (24 GB) ni una RTX 5090 podrian alojar el modelo completo, ni siquiera repartiendo por varios equipos domesticos.
- Opciones de despliegue: la etiqueta endpoints_compatible y la libreria transformers indican compatibilidad con el stack de Hugging Face; es esperable el uso de motores de servido multi-GPU como vLLM o TGI. La model card menciona kernels propios (Mega-mHC) y decodificacion especulativa DSpark, lo que sugiere soporte en implementaciones especificas. No se confirma soporte en llama.cpp ni Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Contexto | Cache KV por token | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash | Hasta 1M tokens | 890 bytes (referencia) | 552B backbone declarados / 484,6B en safetensors | MIT | Publico en Hugging Face |
| DeepSeek-V4-Flash | no disponible | Aprox. 4 veces mayor que V4.1-Flash (unos 3.560 bytes por token, calculado a partir del factor declarado) | no disponible | no disponible | no disponible en la informacion proporcionada |
| DeepSeek-V1 | no disponible | Aprox. 437 veces mayor que V4.1-Flash (unos 389 KB por token, calculado a partir del factor declarado) | no disponible | no disponible | no disponible en la informacion proporcionada |

No se dispone de datos de parametros, contexto ni rendimiento de los modelos comparados en la informacion proporcionada; la unica magnitud comparable es el tamano de la cache KV por token.

## Limitaciones y advertencias

- El tamano (484,6B parametros reales, 552B declarados de backbone) obliga a infraestructura multi-GPU; no es desplegable en hardware de consumo.
- Existe una discrepancia entre los 552B de backbone que declara la model card y los 484.619.644.114 parametros contabilizados en los safetensors. Conviene verificar cual es la cifra aplicable al despliegue.
- No se especifican los idiomas soportados ni el reparto de datos por idioma, por lo que no se puede garantizar un rendimiento uniforme fuera del ingles o el chino.
- No hay resultados de benchmarks publicados en la informacion disponible, lo que impide validar las afirmaciones de rendimiento agéntico de forma independiente.
- La cache KV en FP4 (E2M1 con una escala E4M3 por cada 16 canales) es una cuantizacion agresiva que puede introducir perdida de precision en contextos muy largos; conviene medir el impacto en tareas sensibles al detalle.
- El uso de indices de atencion dispersa y modos estaticos por capa (Full, Reindex, Reuse) implica que el modelo depende de implementaciones de kernel especificas; el rendimiento puede degradarse en runtimes que no las soporten.
- La model card no documenta sesgos conocidos ni evaluaciones de seguridad.
- Riesgo de alucinacion inherente a los modelos generativos, agravado en tareas de contexto muy largo donde la informacion relevante queda diluida.
- La licencia MIT permite uso comercial, pero conviene revisar el repositorio completo y los terminos del proveedor antes de un despliegue en produccion.
- El modelo acumula 658 likes pero solo 6 descargas, lo que sugiere poca validacion practica por parte de la comunidad hasta la fecha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Informe tecnico (PDF): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
- Organizacion DeepSeek AI en Hugging Face: https://huggingface.co/deepseek-ai
- Sitio oficial de DeepSeek: https://deepseek.com/en/index.html
- Interfaz de chat de DeepSeek: https://chat.deepseek.com/
- Repositorio GitHub de DeepSeek-V2 (referenciado en la model card para recursos graficos): https://github.com/deepseek-ai/DeepSeek-V2
