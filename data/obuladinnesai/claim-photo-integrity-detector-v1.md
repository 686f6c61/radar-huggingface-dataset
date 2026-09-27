# obuladinnesai/claim-photo-integrity-detector-v1

## Resumen

Claim Photo Integrity Detector v1 es un clasificador de imagen binario publicado en HuggingFace por el usuario obuladinnesai bajo licencia Apache 2.0. Su funcion es determinar si una fotografia procede de una camara real o ha sido generada sinteticamente por un modelo de difusion, con un enfoque de aplicacion muy concreto: la verificacion de integridad de fotografias en flujos de siniestros de seguros. La idea es actuar como una primera barrera de confianza (triage "trust-first" en la fase de FNOL, First Notice of Loss) antes de evaluar la severidad del dano o predecir una perdida total.

Tecnicamente es un Vision Transformer de unos 85,8 millones de parametros, derivado de google/vit-base-patch16-224 y ajustado con una cabeza de clasificacion de dos clases. La entrada es una imagen de 224x224 pixeles dividida en parches de 16x16, y la salida son dos etiquetas: real o ai_generated, con sus puntuaciones de probabilidad. No procesa texto ni audio, por lo que no tiene idiomas ni ventana de contexto en el sentido habitual de los LLM.

Es relevante ahora porque el fraude con imagenes generadas por IA en siniestros y verificaciones documentales esta creciendo, y este modelo ofrece una via de codigo abierto, ligera y autoalojable para insertar una senal de integridad en un pipeline de tramitacion. Sus propios autores advierten de que no es una prueba legal de fraude, sino una senal de triaje para que un ajustador humano decida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-base, patch 16, resolucion 224x224) |
| Parametros totales | 85.800.194 (85,8 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de imagen de 224x224 px, equivalente a 196 parches de 16x16 |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors en su precision original) |
| Idiomas soportados | no disponible (clasificacion de imagen, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | image-classification |
| Tamano del repositorio | 0,3 GB |
| Clases de salida | 2 (real, ai_generated) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint google/vit-base-patch16-224, un transformer de vision con mecanismo de auto-atencion sobre parches de imagen, y anade una cabeza de clasificacion de dos clases para la tarea binaria real frente a generada. El ajuste fino se realizo sobre un subconjunto equilibrado del dataset Defactify (Rajarshi-Roy-research/Defactify_Image_Dataset), compuesto por fotografias reales de MS-COCO por un lado e imagenes sinteticas generadas por Stable Diffusion 2.1, SDXL, Stable Diffusion 3, DALL-E 3 y Midjourney v6 por el otro. No se documenta en la model card el numero exacto de tokens o imagenes de entrenamiento, la composicion final del conjunto ni si se aplicaron tecnicas de RLHF o DPO, algo poco habitual en clasificacion.

La model card indica de forma explicita que el script de entrenamiento contiene la configuracion exacta y las metricas, pero esa informacion no se ha facilitado en los datos disponibles. No se describe ninguna innovacion tecnica mas alla del ajuste fino supervisado con etiquetas de dos clases: no hay decodificacion especulativa, atencion lineal ni modulos hibridos.

## Capacidades

- Clasificacion binaria de imagenes: distingue entre fotografia autentica de camara y imagen generada por IA.
- Deteccion de imagenes sinteticas procedentes de generadores de difusion populares (SD 2.1, SDXL, SD 3, DALL-E 3, Midjourney v6), que son los usados en el entrenamiento.
- Salida con puntuacion de confianza por clase, lo que permite fijar umbrales de decision ajustables segun el riesgo asumido.
- Integracion directa con la libreria transformers mediante el pipeline de clasificacion de imagen.
- Inferencia ligera apta para despliegue en CPU o GPU de gama baja, dado su tamano de 85,8 M de parametros.
- No dispone de soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision multimodal conversacional ni modo de pensamiento. Es exclusivamente un clasificador de imagen.

## Casos de uso

- Triaje de siniestros en seguros (FNOL): el modelo se situa como primer filtro que marca las fotografias sospechosas de ser generadas antes de que un ajustador evalue el dano, reduciendo el trabajo manual sobre expedientes fraudulentos.
- Verificacion documental en peritajes: antes de estimar severidad o perdida total, se comprueba la integridad de cada imagen aportada por el asegurado y se derivan a revision humana las que superen un umbral de probabilidad de sintesis.
- Moderacion de contenido en plataformas: clasificacion automatica de imagenes subidas por usuarios para senalar posibles generaciones artificiales en foros, marketplaces o redes sociales.
- Curación de datasets y control de calidad: filtrar imagenes sinteticas que hayan podido colarse en conjuntos de datos que se presuponen reales, usando el modelo como etiquetador auxiliar.
- Forense de medios y periodismo: senal complementaria para redacciones y verificadores que necesiten un primer indicio sobre la autenticidad de una imagen antes de aplicar analisis mas profundos (PRNU, metadatos, C2PA).
- Deteccion de identidad sintetica en alta de clientes: en procesos KYC con foto de documento o selfi, sirve como capa adicional para detectar imagenes generadas por difusion antes de pasar a la verificacion biometrica.
- Automatizacion de pipelines de respuesta ante fraude: integrado como microservicio en un flujo de tramitacion que marque, registre y priorice expedientes segun la probabilidad de imagen generada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al script de entrenamiento para consultar configuracion y metricas, pero esos datos no se han facilitado, por lo que no se pueden presentar cifras de accuracy, precision, recall, F1 ni comparaciones numericas con otros detectores.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32 los pesos ocupan aproximadamente 344 MB; en FP16, unos 172 MB; en INT8, unos 86 MB. Con activaciones y sobrecarga del framework, el consumo real se situa en torno a 0,5-1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Funciona sin problema en RTX 3060, RTX 4060, RTX 4090, A100 o H100, aunque estas dos ultimas estan sobredimensionadas para este modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna e incluso en modelos integrados. Tambien es viable la inferencia en CPU para cargas moderadas.
- Opciones de despliegue: pipeline de transformers (image-classification), exportacion a ONNX Runtime y empaquetado como microservicio (FastAPI, TorchServe). No procede el uso de vLLM, TGI, llama.cpp ni Ollama, orientados a modelos generativos de lenguaje.
- Latencia y throughput estimados: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

No se han encontrado en la informacion disponible modelos de codigo abierto comparables con datos publicados de rendimiento. La busqueda web devuelve principalmente servicios comerciales de deteccion de imagenes IA, no modelos abiertos con pesos descargables. Se incluye una comparacion cualitativa con lo que si aparece documentado.

| Alternativa | Tipo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Claim Photo Integrity Detector v1 | Modelo abierto (ViT) | 85,8 M | Imagen 224x224 | Apache 2.0 | Pesos en HuggingFace |
| google/vit-base-patch16-224 | Modelo base abierto | 86 M aprox. | Imagen 224x224 | Apache 2.0 | Pesos en HuggingFace; clasificacion ImageNet, no deteccion de IA |
| zerogpt.com AI Image Detector | Servicio web | no disponible | no disponible | propietaria | Solo via web |
| wedetect.ai AI Image Checker | Servicio web | no disponible | no disponible | propietaria | Solo via web |
| aiphotocheck.com | Servicio web | no disponible | no disponible | propietaria | Solo via web |
| wasitai.io | Servicio web | no disponible | no disponible | propietaria | Solo via web |

## Limitaciones y advertencias

- La version v1 esta entrenada con escenas generales, no con fotografias de danos concretos. Los propios autores planean una v2 especializada en fotos de siniestros reales frente a manipuladas.
- Como cualquier detector de imagenes IA, la precision se degrada frente a generadores posteriores a los datos de entrenamiento (por ejemplo, modelos de difusion mas recientes o nuevos generadores no vistos).
- El modelo no constituye prueba legal de fraude. Es una senal de triaje que debe ser confirmada por un ajustador humano.
- Sesgos conocidos: no disponible. No se documenta el desglose demografico, geografico ni de dominio del conjunto de entrenamiento.
- Riesgo de falsos positivos y falsos negativos inherente a un clasificador binario de 85,8 M de parametros; la puntuacion debe calibrarse con umbrales propios del caso de uso.
- Limitaciones de idioma: no aplica en sentido linguistico, pero si existe una limitacion de dominio, ya que el entrenamiento se basa en MS-COCO y en imagenes de difusion, sin cubrir necesariamente otros dominios visuales (documentos, radiografias, imagenes tecnicas).
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indiquen los cambios. No hay clausulas de uso adicionales documentadas.
- Caveat de produccion: al tratarse de una version v1 con cero descargas y cero likes en el momento del analisis, no existe validacion externa ni evidencia de uso en produccion. Conviene evaluarlo con un conjunto propio antes de desplegarlo en un flujo real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/obuladinnesai/claim-photo-integrity-detector-v1
- Variante referenciada en el ejemplo de codigo: https://huggingface.co/obuladinnesai/claim-photo-integrity-detector
- Dataset de entrenamiento: https://huggingface.co/datasets/Rajarshi-Roy-research/Defactify_Image_Dataset
- Modelo base: https://huggingface.co/google/vit-base-patch16-224
- zerogpt AI Image Detector: https://www.zerogpt.com/ai-image-detector
- wedetect.ai AI Image Checker: https://wedetect.ai/ai-image-checker
- aiphotocheck.com AI Image Detector: https://aiphotocheck.com/
- wasitai.io AI Image Detector: https://wasitai.io/
