# nakas/gpttrace-img-flag-pec-v3-onnx

## Resumen

GPTTrace image detector (flag-pec-v3) es un clasificador binario de imagenes que distingue entre fotografias reales e imagenes generadas por IA. Lo desarrolla el autor independiente nakas y se distribuye en formato ONNX. El modelo se usa en produccion para el escaneo de imagenes de la nube en gpttrace.com y en la API de GPTTrace. Su relevancia actual radica en la explosion de generadores de imagen (FLUX, Midjourney v6, DALL-E, generadores de Rapidata 2024-26) y en la necesidad de herramientas de deteccion de deepfakes y contenido sintetico con tasas de falsos positivos controladas.

Arquitectura: un Vision Transformer Perception Encoder PE-Core-L/14 (backbone de Meta, licencia Apache-2.0) afinado completamente a 448 px, con una cabeza de clasificacion consistente en LayerNorm mas una capa Linear sobre la concatenacion de [CLS; media de tokens de patch]. El modelo procesa dos vistas por imagen (recorte central y marco completo) y promedia los logits.

El modelo se entrena exclusivamente con datos con licencias permisivas (743k muestras) e incorpora una cadena de robustez frente a JPEG, redimensionado, desenfoque, ruido, recodificaciones de redes sociales y codecs neuronales. Se distribuye como un unico fichero ONNX fp32 de 1,24 GB; las variantes int8 perdieron 0,01-0,02 AUC y no se publicaron.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (Perception Encoder PE-Core-L/14), fine-tuning completo a 448 px; cabeza LayerNorm + Linear sobre [CLS; media de tokens de patch] |
| Parametros totales | no disponible (backbone ViT-L/14, aproximadamente 300 M, no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen 448x448 px, dos vistas por inferencia) |
| Tipos de cuantizacion | Solo fp32 publicado; se probaron variantes int8 que perdieron 0,01-0,02 AUC y no se distribuyen |
| Idiomas soportados | no disponible (clasificador de imagen, sin procesamiento de texto) |
| Licencia | CC BY-SA 4.0 (el backbone PE-Core es Apache-2.0) |
| Formato de pesos | ONNX (`onnx/model_fp32.onnx`, 1,24 GB); entrada `pixel_values` float32 `[2, 3, 448, 448]`, salida un logit por vista |

## Arquitectura y entrenamiento

El modelo parte del backbone Perception Encoder PE-Core-L/14 de Meta (via timm, `vit_pe_core_large_patch14_336.fb`), un ViT con parches de 14x14 originalmente preentrenado a 336 px. El autor lo afina completamente a 448 px y anade una cabeza de clasificacion binaria: LayerNorm seguido de una capa Linear aplicada sobre la concatenacion del token [CLS] y la media de los tokens de patch. En inferencia se generan dos vistas por imagen (recorte central y marco completo redimensionado), se promedian los logits y se resta un offset de 3,562, punto de operacion calibrado para que el 3 % de las fotos reales (promediado sobre los conjuntos reales) se marquen como IA.

El entrenamiento usa 743k muestras con licencias permisivas. Las clases reales incluyen fotos CC0/dominio publico (megalith, PD12M, Wikimedia Commons, con fotos de movil posteriores a 2022 y arte de dominio publico anterior a 2021). Las clases IA incluyen round-trips VAE y ediciones locales de fotos CC0, generadores de Rapidata 2024-26 (48 modelos, CDLA permisiva), DRAGON, ELSA, open-image-preferences, nano-banana, ShareGPT-4o-Image, DiffusionDB, recaps de Midjourney v6 y Z-Image. Se aplica una cadena de robustez con JPEG, redimensionado, desenfoque, ruido, recodificaciones de redes sociales y codecs neuronales. No se menciona RLHF ni DPO (no aplica a un clasificador).

## Capacidades

- Clasificacion binaria imagen real vs. imagen generada por IA, con un unico logit por vista (positivo = IA).
- Deteccion de deepfakes y contenido sintetico de multiples generadores (Rapidata 2024-26, DRAGON, nano-banana, Midjourney v6, DiffusionDB, Z-Image, entre otros).
- Robustez frente a recompresion JPEG, redimensionado, desenfoque, ruido, recodificaciones de redes sociales y codecs neuronales.
- Sistema de tres zonas: IA por encima del offset, "no se puede determinar" entre 0 y el offset, probablemente real por debajo de 0.
- Inferencia via ONNX Runtime en CPU (`CPUExecutionProvider`) o GPU.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues (es un clasificador de imagen, no un modelo generativo).
- No dispone de modo thinking, vision general, audio ni generacion de texto.

## Casos de uso

- Moderacion de contenido en plataformas: integrado como filtro previo en pipelines de subida de imagenes para marcar contenido potencialmente sintetico antes de la revision humana, usando el offset calibrado (3 % FPR sobre fotos reales) para limitar falsos positivos.
- Verificacion periodistica: comprobacion de autenticidad de imagenes recibidas de agencias o redes sociales, aprovechando la robustez frente a recodificaciones de redes sociales y la deteccion de generadores como Midjourney v6 o nano-banana.
- Deteccion de fraude documental: analisis de fotos de documentos o productos enviadas en procesos KYC o de reclamaciones, donde las ediciones con inpainting son un vector de fraude (con la advertencia de que las ediciones de fotos reales son un punto debil conocido).
- Escaneo de imagenes en la nube: el modelo ya alimenta el escaneo de imagenes de gpttrace.com y la API de GPTTrace, por lo que puede desplegarse como servicio de clasificacion via ONNX Runtime en CPU sin GPU dedicada.
- Investigacion en forense digital: evaluacion de la capacidad de deteccion frente a nuevos generadores usando los benchmarks publicados (AIGIBench, OpenFake, NTIRE 2026) como linea base.
- Filtrado en datasets de entrenamiento: limpieza de corpus de imagenes para eliminar contenido sintetico antes de entrenar otros modelos, con el offset ajustable segun la tolerancia a falsos positivos.

## Benchmarks y rendimiento

Resultados propios del autor (imagenes limpias, promedio de las dos vistas servidas). AUC es independiente de umbral; FPR y recall usan el offset publicado (3,562). Los benchmarks sin imagenes reales solo reportan recall.

| Benchmark | AUC | FPR real @ offset | Recall IA @ offset |
|---|---|---|---|
| AIGIBench | 0,997 | 0,8 % | 98,3 % |
| Community Forensics eval | 0,988 | 0,4 % | 86,6 % |
| Mirage-Test | 0,994 | 1,2 % | 93,3 % |
| OpenFake | 0,984 | 0,0 % | 82,1 % |
| NTIRE 2026 val (distorted) | 0,969 | 1,8 % | 83,8 % |
| NTIRE 2026 hard | 0,948 | 4,2 % | 78,0 % |
| NTIRE 2026 test | 0,907 | 6,3 % | 68,7 % |
| DailyBench | 0,948 | 6,2 % | 85,1 % |
| DailyBench (edits) | 0,887 | 8,8 % | 60,2 % |
| RealChain | 0,952 | 4,4 % | 86,4 % |
| So-Fake-OOD | 0,948 | 2,1 % | 74,9 % |
| DRAGON test | – | – | 98,5 % |
| nano-banana | – | – | 98,3 % |
| Rapidata 2026 generators (48 modelos) | – | – | 95,0 % |
| Held-out generators (ERNIE Image, MAI-Image 2.5) | – | – | 99,9 % |

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero ONNX fp32 ocupa 1,24 GB; en GPU cabe en cualquier tarjeta con al menos 2-3 GB de VRAM libre para el modelo y los tensores de entrada `[2, 3, 448, 448]` en float32.
- GPU recomendadas: cualquier GPU moderna con soporte ONNX Runtime (CUDA o TensorRT); para lotes grandes se recomienda A100, H100 o RTX 4090. El modelo es lo bastante pequeno para ejecutarse en CPU.
- Cabe en GPU consumer: si, en cualquier GPU consumer reciente (RTX 3060 o superior) y tambien en CPU (`CPUExecutionProvider`), como muestra el ejemplo de la model card.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), con conversion opcional a TensorRT u OpenVINO. No se distribuyen pesos GGUF ni safetensors, por lo que llama.cpp u Ollama no aplican.
- Latencia y throughput: no disponibles en la informacion proporcionada. La inferencia implica dos pases de un ViT-L/14 a 448 px por imagen.

## Comparativa con modelos similares

No se dispone de datos de otros detectores de imagenes generadas por IA en la informacion proporcionada para establecer una comparativa cuantitativa fiable. Como referencia estructural, el modelo se apoya en el backbone PE-Core-L/14 de Meta (Apache-2.0), pero no se han publicado comparaciones directas con alternativas como CLIP-based detectors o clasificadores especializados en la model card.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GPTTrace flag-pec-v3 (este modelo) | no disponible (ViT-L/14) | no aplica (imagen 448 px) | AUC 0,887-0,997 en benchmarks propios | CC BY-SA 4.0 | ONNX en Hugging Face |
| Alternativas de deteccion de IA | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Punto debil conocido en ediciones de fotos reales (inpainting, ediciones por instrucciones): el recall cae al 60,2 % en DailyBench (edits) y el FPR sube al 8,8 %.
- Generadores no cubiertos o con deteccion debil: GPT-Image 1.5/2, nano-banana 2, FLUX.2 klein y Qwen-Image 2.1.
- Fotos reales muy procesadas o comprimidas con codecs neuronales pueden clasificarse erroneamente como IA.
- El offset de 3,562 esta calibrado para un 3 % de FPR sobre los conjuntos reales de entrenamiento; en dominios distintos el FPR puede desviarse (hasta 8,8 % en DailyBench edits).
- Las puntuaciones deben tratarse como evidencia, no como prueba definitiva; el propio autor lo advierte.
- Licencia CC BY-SA 4.0: impone obligaciones de compartir bajo la misma licencia las obras derivadas y puede ser incompatible con usos comerciales cerrados; el backbone PE-Core es Apache-2.0, pero los datos de entrenamiento incluyen material CC BY-SA.
- No apto para clasificacion de texto ni tareas multimodales mas alla de la deteccion binaria de imagenes.
- Sesgos conocidos: no se documentan sesgos demograficos o de dominio en la model card; la composicion del dataset (fotos CC0, arte de dominio publico) puede limitar la generalizacion a otros dominios visuales.

## Enlaces

- Hugging Face: https://huggingface.co/nakas/gpttrace-img-flag-pec-v3-onnx
- Dataset de entrenamiento: https://huggingface.co/datasets/nakas/gpttrace-img-v2
- Backbone PE-Core-L/14: https://huggingface.co/timm/vit_pe_core_large_patch14_336.fb
- Codigo: https://github.com/andrewnakas/gpttrace
- Demo / servicio: https://gpttrace.com
