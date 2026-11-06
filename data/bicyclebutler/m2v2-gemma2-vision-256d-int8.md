# BicycleButler/m2v2-gemma2-vision-256d-int8

## Resumen

M2V2 Gemma-2 Vision 256d INT8 es un modelo de extraccion de caracteristicas visuales publicado por BicycleButler como complemento oficial de su ecosistema de busqueda zero-knowledge. No es un modelo generativo: se trata de un codificador visual derivado directamente de Google embeddinggemma-2, del que se han extraido el `vision_tower` (un ViT de tipo SigLIP) y la proyeccion `embed_vision.embedding_projection`. Su funcion es convertir imagenes en vectores unitarios de 256 dimensiones que comparten espacio de coordenadas con el modelo de texto del mismo ecosistema (`BicycleButler/m2v2-gemma2-256d-int4`), de modo que el producto escalar entre un vector de texto y uno de imagen mide directamente relevancia semantico-visual.

La propuesta de valor es arquitectonica: todo el calculo ocurre en el dispositivo del usuario, via WebGPU o WASM en el navegador, o mediante un demonio local de escritorio (`meaty` en `127.0.0.1:11435`). El servidor en la nube nunca ejecuta inferencia, lo que permite busqueda multimodal sin enviar fotos ni datos a terceros. Los pesos se distribuyen cuantizados a INT8, con una precision de recuperacion declarada del 99,1 % respecto a FP16.

Es un modelo de nicho, orientado a integradores del SDK `@wiltermoodj/search`, no a uso general. La informacion publica disponible es muy limitada: el repositorio ocupa 0,0 GB, no tiene descargas ni likes, y la model card no documenta datos de entrenamiento, benchmarks publicos ni detalles del proceso de cuantizacion mas alla de la cifra de retencion de precision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) de tipo SigLIP, extraido del `vision_tower` de google/embeddinggemma-2, con proyeccion de embedding a 256 dimensiones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de extraccion de caracteristicas, no de texto) |
| Tipos de cuantizacion | INT8 (unica variante publicada en este repo) |
| Idiomas soportados | en (la salida es un vector; el idioma afecta al espacio compartido con el modelo de texto) |
| Licencia | Apache-2.0, sujeta a los Terminos de Uso de Gemma de Google |
| Formato de pesos | no disponible (los tags mencionan ONNX y WebGPU; el repo no detalla los ficheros) |
| Dimension del embedding | 256 dimensiones, vector unitario |
| Pipeline | image-feature-extraction |
| Modelo base | google/embeddinggemma-2 |
| Tamano del repo | 0,0 GB |

## Arquitectura y entrenamiento

El modelo no se entrena desde cero: es una extraccion quirurgica de dos componentes de google/embeddinggemma-2, el `vision_tower` basado en ViT/SigLIP y la cabeza `embed_vision.embedding_projection`, que reduce la representacion visual a un vector unitario de 256 dimensiones. La innovacion declarada es la alineacion de ese espacio de 256 dimensiones con el del modelo de texto hermano (`m2v2-gemma2-256d-int4`), lo que habilita busqueda cross-modal por producto escalar sin necesidad de un modelo de similitud adicional.

No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF/DPO o ajuste contrastivo propio. Tampoco se detalla el procedimiento de cuantizacion INT8 (calibracion, granularidad por canal o por tensor). La unica metrica de calidad publicada es la retencion del 99,1 % de precision de recuperacion frente a FP16.

## Capacidades

- Extraccion de caracteristicas visuales: codifica fotos de camara, imagenes de producto y fotografias de servicio de bicicleta en vectores Float32Array de 256 dimensiones.
- Busqueda cross-modal texto-imagen: el producto escalar entre un vector de texto y uno de imagen mide relevancia semantico-visual en un espacio compartido.
- Inferencia 100 % local: ejecucion en el dispositivo via WebGPU o WASM, o mediante el demonio local `meaty` en `127.0.0.1:11435`.
- Integracion como SDK: clase `Gemma2VisionEngine` con metodos `init()` y `embedImage(canvasOrImageBitmap)` en `@wiltermoodj/search/vision`.
- Optimizacion para despliegue web: cuantizacion INT8 y soporte WebGPU/ONNX orientados a entornos de navegador.
- No soporta generacion de texto, tool calling, razonamiento multi-paso ni capacidades de agente: es exclusivamente un codificador de imagenes.

## Casos de uso

- Busqueda visual en aplicaciones de bicicletas: el usuario fotografia una pieza o un componente y el sistema recupera productos o servicios similares comparando el vector de imagen con vectores de texto e imagen indexados, todo en local.
- Catalogacion de imagenes de producto en comercio electronico: generacion de embeddings de 256 dimensiones para cada foto de catalogo, con coste de almacenamiento bajo y capacidad de busqueda por similitud en el navegador.
- Asistencia tecnica en taller: el cliente envia una foto de una averia y el sistema la confronta con una base de casos y guias indexadas semanticamente, sin que la imagen salga del dispositivo.
- Moderacion y deduplicacion de imagenes subidas por usuarios: deteccion de imagenes duplicadas o visualmente proximas mediante distancia en el espacio de 256 dimensiones.
- Recomendacion de accesorios y equipamiento: combinacion de preferencias textuales del usuario con historial visual para sugerir productos afines.
- Busqueda privada en aplicaciones de mensajeria o diarios personales: indexacion local de fotos para recuperacion por descripcion textual, manteniendo la arquitectura zero-cloud.
- Filtrado previo en pipelines de vision: uso como extractor ligero para clasificacion o clustering de imagenes antes de modelos mas pesados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica declarada por el autor es la retencion del 99,1 % de precision de recuperacion de la variante INT8 frente a FP16.

| Metrica | Valor | Referencia |
|---|---|---|
| Precision de recuperacion (INT8 vs FP16) | 99,1 % | Declarado en la model card |
| MMLU, HumanEval, GSM8K u otros | no disponible | No aplica (modelo no generativo) |

## Requisitos de hardware

- VRAM estimada: no disponible con precision al no publicarse el numero de parametros. Por la cuantizacion INT8 y el tamano de repo declarado (0,0 GB), se trata de un modelo ligero apto para entornos con recursos limitados.
- GPU recomendadas: no disponibles en la informacion proporcionada. El diseno apunta a ejecucion en navegador con WebGPU, lo que incluye GPUs integradas y dedicadas de consumo.
- Compatibilidad con GPU de consumo: si, por diseno (WebGPU/WASM); no se especifican modelos concretos.
- Opciones de despliegue: WebGPU, WASM, ONNX Runtime y el demonio local `meaty` en `127.0.0.1:11435`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un codificador visual de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Dimension del embedding | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BicycleButler/m2v2-gemma2-vision-256d-int8 | ViT SigLIP + proyeccion, INT8 | 256 | no aplica | Apache-2.0 (Terminos Gemma) | Hugging Face, 0 descargas |
| google/embeddinggemma-2 | Modelo multimodal de embeddings (origen) | no disponible | no disponible | Terminos Gemma | Hugging Face |
| BicycleButler/m2v2-gemma2-256d-int4 | Modelo de texto del mismo ecosistema | 256 | no disponible | Apache-2.0 | Hugging Face |
| CLIP / SigLIP estandar | Codificadores vision-lenguaje | 512-768 tipico | no aplica | MIT / Apache-2.0 (segun variante) | Amplia |

La comparativa con codificadores genericos como CLIP o SigLIP es solo orientativa: este modelo esta disenado para un espacio de 256 dimensiones especifico y no es intercambiable con ellos sin reindexar todo el corpus.

## Limitaciones y advertencias

- Modelo de nicho: solo tiene sentido dentro del ecosistema BicycleButler y del SDK `@wiltermoodj/search`; no es un codificador visual de proposito general.
- Sin documentacion de entrenamiento: no se detallan datos, proceso de cuantizacion ni metodologia de evaluacion, lo que dificulta auditar sesgos o robustez.
- Sesgos desconocidos: al derivar de embeddinggemma-2, hereda los sesgos de su dataset de entrenamiento, no documentados en esta ficha.
- Riesgo de falsos positivos en recuperacion: la similitud en un espacio de solo 256 dimensiones puede confundir imagenes visualmente parecidas pero semanticamente distintas.
- Cobertura linguistica limitada: el tag de idioma es solo `en`; el rendimiento cross-modal en castellano no esta documentado.
- Licencia con condiciones: Apache-2.0 pero sujeta a los Terminos de Uso de Gemma de Google, que imponen restricciones adicionales al uso comercial que deben revisarse antes de produccion.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; sin evidencia de uso en produccion ni soporte comunitario.
- Formato de pesos no confirmado: los tags mencionan ONNX y WebGPU, pero no se detalla que ficheros contiene el repositorio, lo que complica la integracion fuera del SDK previsto.
- Sin garantias de latencia: no se publican mediciones de rendimiento en dispositivos concretos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BicycleButler/m2v2-gemma2-vision-256d-int8
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Modelo de texto del ecosistema: https://huggingface.co/BicycleButler/m2v2-gemma2-256d-int4
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Terminos de Uso de Gemma: no disponible en la informacion proporcionada
- Paper, blog o repositorio del autor: no disponible en la informacion proporcionada
