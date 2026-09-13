# INCModel3/DeepSeek-V4.1-Flash-W4A16

# DeepSeek-V4.1-Flash-W4A16 (INCModel3)

## Resumen

DeepSeek-V4.1-Flash-W4A16 es una version cuantizada a 4 bits del modelo multimodal DeepSeek-V4.1-Flash, publicada por el usuario INCModel3 (no por DeepSeek AI). Se trata de un Mixture-of-Experts (MoE) multimodal de arquitectura Causal Encoder-Decoder (CED) con 40 capas, que procesa de forma nativa imagenes y texto y genera texto de forma autorregresiva. La model card declara un backbone de 552B parametros, mientras que los metadatos de safetensors del repositorio cuantizado registran 295.268.445.394 parametros (~295B); esta discrepancia no queda explicada en la informacion disponible.

El modelo destaca por su estrategia de compresion agresiva de la cache KV: la model card afirma una huella de 890 bytes por token, aproximadamente una cuarta parte de la de DeepSeek-V4-Flash y 437 veces menor que la de DeepSeek-V1. Ademas, activa solo 8B parametros por token durante el prefill y 16B durante el decode, lo que reduce el coste de los flujos con mucho input (cargas agenticas, documentos largos) frente a modelos densos de tamano comparable.

La relevancia de esta publicacion concreta es doble: por un lado, permite evaluar la arquitectura DeepSeek-V4.1-Flash en formatos de 4 bits para pesos (W4A16) generados con auto-round; por otro, es un repositorio con 0 descargas y 0 likes en el momento de la consulta, con un README copiado de la model card oficial, por lo que debe tratarse como una conversion no oficial pendiente de validacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Encoder-Decoder (CED): transformer de 40 capas (20 capas de encoder causal + 20 de decoder), MoE con 1 experto compartido y 384 expertos enrutados por capa |
| Parametros totales | 295.268.445.394 (~295B) segun metadatos de safetensors del repo; la model card declara 552B en el backbone (incluyendo 196B de memoria condicional Engram) |
| Parametros activos | 8B por token en prefill y 16B por token en decode; 6 expertos enrutados activados por token |
| Longitud de contexto | Hasta 1.000.000 tokens (atencion dispersa entrenada a 64K y extendida a 1M durante el preentrenamiento) |
| Tipos de cuantizacion | Pesos en 4 bits y activaciones en 16 bits (W4A16) generados con auto-round; cache KV principal en FP4 (formato E2M1 con una escala E4M3 cada 16 canales) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (tamano del repo: 543,8 GB) |

## Arquitectura y entrenamiento

DeepSeek-V4.1-Flash se construye sobre una arquitectura Causal Encoder-Decoder en la que el decoder proyecta su cache KV global desde los estados ocultos finales del encoder, en lugar de derivarla de los estados de cada capa del decoder. Esta separacion es la que permite activar solo 8B parametros por token en prefill y 16B en decode. A esto se suma SWA Bounded Replay, que reconstruye los estados KV de ventana deslizante ausentes replicando unicamente los ultimos n_win tokens, evitando persistir esa cache en SSD y reduciendo la huella persistente a aproximadamente 1/8 de la de DeepSeek-V4-Flash.

La atencion usa Compressed Sparse Attention 2 (CSA2), con tres modos estaticos por capa (Full, Reindex y Reuse) que permiten compartir la KV principal y la K del indexador entre capas y reutilizar indices Top-K. En el decoder, un indexador disperso jerarquico restringe las capas de indexacion posteriores a un pool de candidatos construido por la primera capa en modo Full, acotando el coste del indexador independientemente de la longitud de contexto. El modelo incorpora ademas Single-Pass mHC (mezcla del flujo residual con un kernel Mega-mHC), memoria condicional Engram (196B parametros con acceso disperso por lookup basado en token), decodificacion especulativa DSpark (generacion de borradores semiautorregresiva con verificacion programada por confianza) y un encoder de vision DeepSeek-ViT entrenado desde cero con 2D-RoPE y downsampling 3x3 pixel-unshuffle, seguido de un proyector MLP de dos capas.

El preentrenamiento se realizo desde cero sobre un corpus multimodal de 45T tokens, con la atencion dispersa entrenada a 64K y laextension de contexto hasta 1M tokens a partir de los 34T tokens. El post-entrenamiento sigue el paradigma SFT → RL → destilacion on-policy (OPD) sin modificaciones algoritmicas, con el esfuerzo puesto en la sintesis automatica a gran escala de tareas y entornos de agente. El modelo expone un ajuste de esfuerzo de razonamiento continuo (entero de 1 a 100) que intercambia coste de inferencia por precision. Esta variante concreta es una conversion W4A16 de los pesos mediante auto-round.

## Capacidades

- Generacion de texto autorregresiva con razonamiento ajustable mediante un parametro de esfuerzo de razonamiento continuo entre 1 y 100.
- Procesamiento multimodal de imagen y texto de forma nativa (pipeline image-text-to-text), con embeddings visuales procesados conjuntamente con el texto desde el inicio del preentrenamiento.
- Contextos de hasta 1M tokens, adecuados para documentos extensos, repositorios de codigo y trazas largas de agentes.
- Flujos agenticos: la model card describe sintesis de tareas y entornos de agente durante el post-entrenamiento, orientados a cargas con mucho input.
- Decodificacion especulativa integrada (DSpark), con generacion de borradores y verificacion programada.
- Cuantizacion lista para despliegue en 4 bits (W4A16) sobre transformers y safetensors, con tag endpoints_compatible.
- No se especifica en la informacion disponible si existe soporte explicito de tool calling o function calling, ni la lista de idiomas soportados.

## Casos de uso

- Analisis de documentacion tecnica extensa: con 1M tokens de contexto, el modelo puede ingerir manuales, normativas o expedientes completos sin chunking, y responder preguntas que requieren cruzar informacion entre secciones distantes.
- Agentes de navegacion y automatizacion: el post-entrenamiento con entornos de agente sinteticos y su bajo coste de prefill (8B parametros activos) lo hacen apto para bucles multi-paso con muchos tokens de entrada y salidas cortas.
- Revision de codigo en repositorios completos: la ventana de 1M tokens permite pasar varios ficheros o un arbol de proyecto para detectar inconsistencias, aunque la ausencia confirmada de tool calling obliga a validar esa integracion antes de llevarla a produccion.
- Procesamiento de documentos con imagenes: al aceptar entrada image-text-to-text, sirve para extraer informacion de facturas, informes escaneados o diagramas junto con su texto asociado.
- Generacion asistida con control de coste: el parametro de esfuerzo de razonamiento (1-100) permite ajustar por peticion el gasto de inferencia, usando valores bajos en clasificacion o resumen y valores altos en problemas matematicos o de planificacion.
- Despliegue en infraestructura limitada respecto al modelo original: la cuantizacion W4A16 reduce el peso en disco a 543,8 GB, lo que abre la puerta a servir el modelo donde la version de precision completa no cabria.
- Investigacion sobre compresion de cache KV: el modelo es un caso de estudio utilizable para reproducir y medir las cifras declaradas de 890 bytes por token y la reduccion de 4x frente a DeepSeek-V4-Flash.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye un apartado de "Evaluation Results" con una seccion de modelo base y referencias a una figura de rendimiento agentico, pero el texto proporcionado se interrumpe antes de incluir cualquier cifra, y los resultados de busqueda web disponibles no contienen informacion sobre el modelo. No se deben asumir valores concretos de MMLU, HumanEval u otros.

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa 543,8 GB en safetensors, por lo que se necesita ese espacio libre mas margen para cache de conversion o despliegue.
- Peso en memoria de los pesos cuantizados: con W4A16, el peso teorico de los ~295B parametros ronda los 148 GB solo en pesos, sin contar escalas, buffers ni activaciones.
- VRAM estimada para inferencia: 2xH100 80GB (160 GB) es el minimo teorico muy ajustado; 4xH100 80GB o 8xH100/H200 es el rango recomendable para margen de activaciones y concurrencia.
- Cache KV: partiendo de los 890 bytes por token declarados, una secuencia de 1M tokens ocuparia aproximadamente 890 MB de cache KV global por peticion. Aunque es bajo en terminos relativos, la concurrencia multiplica ese valor.
- GPU de consumo: no cabe en una unica RTX 4090 (24 GB) ni en configuraciones consumer habituales. Solo seria viable con offload agresivo a RAM o SSD, con una penalizacion severa de latencia que no se ha cuantificado.
- Opciones de despliegue: el repositorio usa transformers y safetensors y lleva el tag endpoints_compatible. No se especifica en la informacion disponible compatibilidad verificada con vLLM, SGLang, TGI, llama.cpp, Ollama u otros motores; dado que la arquitectura declarada es deepseek_v41, conviene comprobar el soporte del motor antes de planificar el despliegue.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cache KV | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-W4A16 (INCModel3) | 295B segun safetensors; 552B declarados en el backbone | 1M tokens | 890 bytes/token | MIT | Repositorio de terceros, 0 descargas |
| DeepSeek-V4.1-Flash (oficial) | 552B en el backbone, 8B activos en prefill y 16B en decode | 1M tokens | 890 bytes/token | MIT | Modelo de referencia de DeepSeek AI |
| DeepSeek-V4-Flash | no disponible | no disponible | Aproximadamente 4x mayor que V4.1-Flash | no disponible | no disponible |
| DeepSeek-V1 | no disponible | no disponible | Aproximadamente 437x mayor que V4.1-Flash | no disponible | no disponible |

Los multiplicadores de cache KV de DeepSeek-V4-Flash y DeepSeek-V1 proceden de la figura 1 de la model card. No se dispone de parametros, contexto ni licencia de esos dos modelos en la informacion proporcionada, por lo que la comparativa se limita a lo declarado por el autor.

## Limitaciones y advertencias

- Conversion no oficial: el autor del repositorio es INCModel3, no DeepSeek AI, y la model card es una copia de la oficial. No hay evidencia en la informacion disponible de validacion de la calidad de la cuantizacion W4A16.
- Riesgo de degradacion por cuantizacion: la cuantizacion a 4 bits de pesos puede afectar a tareas sensibles a la precision numerica, como matematicas o razonamiento de varios pasos. No se han publicado evaluaciones comparativas frente al modelo sin cuantizar.
- Discrepancia de parametros: los metadatos registran 295B parametros y la model card declara 552B, sin explicacion disponible. Conviene verificar la integridad del checkpoint antes de usarlo.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Idiomas: no se especifica la cobertura linguistica del modelo ni la de la version cuantizada.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible, a pesar de que el modelo se postula para cargas agenticas.
- Licencia MIT: permite uso comercial y modificacion, pero al tratarse de una redistribucion de terceros conviene revisar la licencia y los terminos del modelo original de DeepSeek antes de usarlo en produccion.
- Alucinacion: no hay datos publicados sobre tasas de alucinacion de esta version cuantizada.
- Requisitos de infraestructura: 543,8 GB de pesos implican un coste de despliegue elevado y descartan el uso en hardware de consumo sin offload.
- Resultados de busqueda web no relevantes: las consultas realizadas devolvieron unicamente paginas sobre una atraccion turistica en Moscu, sin ninguna relacion con el modelo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/INCModel3/DeepSeek-V4.1-Flash-W4A16
- Informe tecnico referenciado en la model card: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
- Sitio de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Organizacion de DeepSeek en HuggingFace: https://huggingface.co/deepseek-ai
- Herramienta de cuantizacion indicada en los tags del repositorio: auto-round (sin URL confirmada en la informacion disponible)
- No se han encontrado otros enlaces relevantes en la busqueda web.
