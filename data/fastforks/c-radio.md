# fastforks/c-radio

## Resumen

C-RADIOv3 y C-RADIOv4 son familias de Vision Transformers aglomerativos desarrollados por NVIDIA (v3 en 2025, v4 en 2026) y distribuidos en este repositorio por el proyecto fastforks. El modelo resuelve la extraccion de caracteristicas visuales densas y globales: dado un unico imagen RGB de entrada, produce tokens de parche (dense patch features) y un embedding pooled de imagen, lo que lo hace util como backbone para tareas de vision por computador aguas abajo. Su relevancia radica en que destila el conocimiento de varios profesores de referencia (CLIP, SigLIP 2, DINOv2, DINOv3 y SAM) en un unico ViT con licencia comercial.

La innovacion principal es la destilacion aglomerativa multi-profesor: la version v3 combina tres profesores (SigLIP 2, DINOv2 y SAM) y la v4 combina dos (SigLIP 2-g, DINOv3-7B y SAM 3), segun la variante. El modelo opera con patch de 16 pixeles y acepta imagenes de cualquier tamano hasta 2048 px, manteniendo tanto caracteristicas densas por parche como un resumen global. Esta disponible en tamanos ViT-B, L, H, g y SO400M.

Este repositorio concreto (fastforks/c-radio) no aloja pesos: es unicamente una model card que documenta las variantes, sus enlaces a los pesos originales de NVIDIA y los hashes SHA-256 para verificacion. El codigo de fastforks descarga los pesos de los repositorios del autor y los valida, ofreciendo dos backends de ejecucion (`portable` y `kernels`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) aglomerativo, patch 16 |
| Parametros totales | no disponible (variantes ViT-B, L, H, g, SO400M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen de cualquier H x W >= 1, hasta 2048 px) |
| Tipos de cuantizacion | fp16 (probado); otras no disponibles |
| Idiomas soportados | no aplica (modelo de vision, sin capacidades de texto) |
| Licencia | NVIDIA Open Model License (permite uso comercial) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un Vision Transformer con patch de 16 pixeles que produce simultaneamente tokens densos por parche y un embedding pooled de imagen. La familia v3 se destila de tres profesores: DFN CLIP ViT-H/14, SigLIP 2 (So400m, o g para la variante H), DINOv2-g y SAM ViT-H. La familia v4 se destila de SigLIP 2-g, DINOv3-7B y SAM 3. El entrenamiento utiliza el dataset NV-CC-Img-Text-Dataset de NVIDIA, con 700 millones de imagenes web, que no ha sido publicado. No se dispone de informacion sobre el numero exacto de tokens de entrenamiento ni sobre el uso de RLHF o DPO (no aplicable a un extractor de caracteristicas).

La innovacion tecnica destacable es la aglomeracion de profesores heterogeneos (contrastivos como CLIP/SigLIP, auto-supervisados como DINO, y de segmentacion como SAM) en un unico backbone, ademas de la capacidad de procesar imagenes de resolucion arbitraria con redimensionado o padding interno. El repositorio fastforks implementa dos backends: `portable` (basado en el VisionTransformer de timm) y `kernels` (kernels optimizados), con aceleraciones de hasta 4,2x frente a la implementacion original en fp32.

## Capacidades

- Extraccion de caracteristicas visuales densas (tokens por parche) y globales (pooled embedding) a partir de una imagen RGB.
- Salidas multiples: `last_hidden_state`, `pooler_output` y `hidden_states`.
- Procesamiento de imagenes de cualquier tamano H x W >= 1, con redimensionado o padding interno, hasta 2048 px.
- Doble backend de ejecucion: `portable` y `kernels`, con aceleracion significativa en el segundo.
- Verificacion de integridad de pesos mediante SHA-256.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un extractor de caracteristicas de imagen.
- No tiene capacidades multilingues ni de audio.

## Casos de uso

- Busqueda visual y recuperacion de imagenes: el embedding pooled de imagen permite indexar y comparar imagenes por similitud en un espacio vectorial, adecuado por su resumen global y su capacidad de procesar resoluciones variables.
- Segmentacion y deteccion aguas abajo: los tokens densos por parche sirven como entrada a cabezas de segmentacion o deteccion, aprovechando la destilacion de SAM en el entrenamiento.
- Clasificacion de imagenes con pocos datos: el backbone congelado y sus caracteristicas de alta calidad permiten entrenar clasificadores lineales o con pocos ejemplos sobre el pooled output.
- Vision por computador en pipelines de produccion: la licencia comercial de NVIDIA Open Model License y la verificacion SHA-256 facilitan su integracion en entornos industriales con requisitos de trazabilidad.
- Procesamiento de imagenes de alta resolucion: la capacidad de aceptar hasta 2048 px y de manejar tamanos arbitrarios lo hace util para imagenes medicas, satelitales o de inspeccion industrial, con consumo de memoria controlado (por ejemplo, 1,7 GiB pico para v3-b a 3000x4000 en fp16).
- Destilacion de modelos propios: al ser un backbone destilado de multiples profesores, puede emplearse como profesor o alumno en pipelines de destilacion para tareas visuales especificas.
- Extraccion de caracteristicas para sistemas de recomendacion visual: el embedding de imagen permite construir representaciones vectoriales de productos o contenido para motores de recomendacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precision (MMLU, HumanEval, etc.) en la informacion disponible, ya que no aplican a un extractor de caracteristicas. Si se documentan metricas de velocidad y memoria en la model card:

| Modelo | Tiempo 224x224 (ms, kernels) | Aceleracion vs original | Memoria pico (MiB, kernels) | Memoria pico a 3000x4000 (GiB, fp16) |
|---|---|---|---|---|
| c-radio-v3-b | 1,36 | 4,2x | 214 / 248 | 1,7 |
| c-radio-v3-g | 10,7 | 2,8x | 2263 / 2310 | 4,8 |
| c-radio-v3-h | 7,43 | 2,3x | 1286 / 1308 | 3,5 |
| c-radio-v3-l | 3,28 | 3,3x | 645 / 706 | 2,5 |
| c-radio-v4-h | 7,41 | 2,3x | 1289 / 1308 | 3,4 |
| c-radio-v4-so400m | 4,25 | 2,7x | 864 / 908 | 2,7 |

## Requisitos de hardware

- VRAM estimada para inferencia: desde 214 MiB (v3-b a 224x224 en fp16 con backend kernels) hasta 2263 MiB (v3-g en las mismas condiciones). Para imagenes de 3000x4000, el pico oscila entre 1,7 GiB (v3-b) y 4,8 GiB (v3-g).
- GPU recomendadas: el autor probo en una RTX 5060 Ti de 16 GB. Para produccion a alta resolucion con las variantes mayores (v3-g, v4-h) se recomienda al menos 8-16 GB de VRAM; para variantes pequenas basta con GPUs consumer de 6-8 GB.
- Cabe en GPU consumer: si, todas las variantes caben en GPUs consumer modernas, incluso a resoluciones de hasta 3000x4000 con las variantes pequenas y medianas.
- Opciones de despliegue: el repositorio fastforks con backends `portable` (timm) y `kernels`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un extractor de vision).
- Latencia y throughput: tiempos de 1,36 ms (v3-b) a 10,7 ms (v3-g) por imagen 224x224 en backend kernels; el arranque y primera llamada se documentan en la model card pero el contenido esta truncado en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| C-RADIOv3/v4 (este) | ViT-B, L, H, g, SO400M | imagen hasta 2048 px | NVIDIA Open Model License (comercial) | pesos en repos de NVIDIA, card en fastforks |
| CLIP ViT-H/14 | ViT-H | imagen fija (224/336 px tipico) | licencia MIT (segun variante) | ampliamente disponible |
| DINOv2-g | ViT-g | imagen fija | Apache 2.0 | ampliamente disponible |
| SigLIP 2 (So400m) | ViT-SO400M | imagen fija | Apache 2.0 | ampliamente disponible |

La ventaja de C-RADIO frente a estos profesores individuales es la combinacion de sus capacidades en un unico backbone con licencia comercial explicita y soporte de resolucion arbitraria. No se dispone de datos de benchmarks comparativos de precision en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, codigo ni razonamiento; su unico cometido es la extraccion de caracteristicas visuales.
- El dataset de entrenamiento (NV-CC-Img-Text-Dataset, 700 M imagenes web) no es publico, lo que limita la auditoria de sesgos y la reproducibilidad.
- Los datos de entrenamiento de los profesores (CLIP, SigLIP 2, DINOv2, DINOv3, SAM) no se transfieren como terminos, por lo que las obligaciones de sus licencias originales deben revisarse por separado.
- La model card indica que el paquete es de uso experimental ("Tier: experimental") y que las cadenas de licencia del codigo original deben comprobarse antes de cualquier otro uso.
- Este repositorio no aloja pesos: depende de la disponibilidad de los repositorios de NVIDIA y de la verificacion SHA-256.
- No se documentan sesgos especificos ni tasas de alucinacion (no aplica al no ser generativo), pero al ser un extractor visual puede heredar sesgos de representacion de los datos web de entrenamiento.
- El uso comercial esta permitido por la NVIDIA Open Model License, pero se recomienda revision legal de los terminos completos antes de produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fastforks/c-radio
- Codigo fastforks: https://github.com/kleinicke/fastforks
- Kernels: https://huggingface.co/fastforks/kernels
- Pesos originales v3-B: https://huggingface.co/nvidia/C-RADIOv3-B
- Pesos originales v3-H: https://huggingface.co/nvidia/C-RADIOv3-H
- Pesos originales v3-L: https://huggingface.co/nvidia/C-RADIOv3-L
- Pesos originales v3-g: https://huggingface.co/nvidia/C-RADIOv3-g
- Pesos originales v4-H: https://huggingface.co/nvidia/C-RADIOv4-H
- Pesos originales v4-SO400M: https://huggingface.co/nvidia/C-RADIOv4-SO400M
- Licencia (evidencia v3-B): https://huggingface.co/nvidia/C-RADIOv3-B/blob/44653a0482cf460bb4f12595fc3cc3dfecc403d1/README.md
- Licencia (evidencia v4-SO400M): https://huggingface.co/nvidia/C-RADIOv4-SO400M/blob/c0457f5dc26ca145f954cd4fc5bb6114e5705ad8/README.md
