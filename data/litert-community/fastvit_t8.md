# litert-community/fastvit_t8

## Resumen

FastViT-T8 es un modelo de clasificacion de imagenes de tipo híbrido (convolucional + transformer) desarrollado originalmente por Apple y publicado en el paper "FastViT: A Fast Hybrid Vision Transformer using Structural Reparameterization" (ICCV 2023). Esta ficha concreta corresponde a la version convertida a formato LiteRT/TFLite por el usuario litert-community, partiendo del checkpoint `timm/fastvit_t8.apple_in1k` del repositorio timm. El modelo clasifica imagenes de 256x256 pixeles en las 1000 clases de ImageNet-1K.

El modelo es relevante en el contexto de despliegue en dispositivos (edge computing, movil, navegador) porque su diseño prioriza la eficiencia: apenas 4,0 millones de parametros y 0,7 GMACs por inferencia, lo que lo situa en el rango de modelos extremadamente ligeros para vision. La conversion a LiteRT permite ejecutarlo en runtimes de Google optimizados para CPU, GPU y aceleradores NPU en Android y otros entornos embebidos.

Esta ficha documenta exclusivamente la version convertida a TFLite; para detalles de entrenamiento original conviene remitirse al paper y al repositorio de Apple. La informacion disponible no incluye resultados de benchmarks del checkpoint convertido ni datos sobre la licencia del artefacto LiteRT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastViT (hibrida conv + transformer con reparameterization estructural) |
| Parametros totales | 4,0 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, entrada fija 256x256) |
| Tipos de cuantizacion | no disponible (el artefacto publicado es float32) |
| Idiomas soportados | no disponible (clasificacion de imagenes, sin capacidades linguisticas) |
| Licencia | no disponible |
| Formato de pesos | TFLite (`model.tflite`) |
| Entrada | tensor float32 NCHW `[1, 3, 256, 256]` |
| Salida | logits ImageNet-1K `[1, 1000]` |
| GMACs | 0,7 |
| Activaciones | 8,6 M |
| Dataset de entrenamiento | ImageNet-1K |
| Modelo base | timm/fastvit_t8.apple_in1k |

## Arquitectura y entrenamiento

FastViT es una arquitectura hibrida que combina bloques convolucionales y atencion tipo transformer, empleando reparameterization estructural: durante el entrenamiento se usan ramas auxiliares (por ejemplo, convoluciones paralelas o kernels expandidos) que se fusionan en una unica operacion en tiempo de inferencia. Esto reduce el coste computacional sin sacrificar precision, y es la innovacion central del paper. La variante T8 es la mas pequena de la familia, con 4,0 M de parametros y 0,7 GMACs a 256x256.

El checkpoint original (`timm/fastvit_t8.apple_in1k`) fue entrenado por Apple sobre ImageNet-1K. La informacion disponible no detalla el numero de tokens/imagenes vistas, la composicion exacta del dataset mas alla de ImageNet-1K, ni si se aplicaron tecnicas de destilacion, augmentacion especifica o ajuste fino adicional. No se documenta RLHF/DPO (irrelevante en clasificacion de imagenes). La version LiteRT es una conversion directa del checkpoint timm, sin datos sobre recalibracion, pruning o cuantizacion posterior.

## Capacidades

- Clasificacion de imagenes en 1000 clases de ImageNet-1K a resolucion 256x256.
- Extraccion de features / backbone: la model card indica que el modelo puede usarse como "feature backbone", util para transfer learning en tareas de vision downstream.
- Inferencia en dispositivos via runtime LiteRT/TFLite (CPU, GPU delegada y aceleradores compatibles).
- Entrada float32 en layout NCHW; requiere preprocesado explicito (redimensionado a 256x256 y normalizacion segun convenciones de timm/ImageNet).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No tiene capacidades multilingues ni modos de "thinking"; es un clasificador puro.
- No se documentan capacidades de deteccion, segmentacion ni vision-lenguaje.

## Casos de uso

- Clasificacion de imagenes en movil o embedded: el modelo cabe holgadamente en memoria de un smartphone (4 M parametros, ~8,6 M activaciones) y puede ejecutarse con LiteRT en CPU o GPU delegada para tareas como categorizar fotos en galeria o etiquetar contenido subido por el usuario.
- Pre-filtrado en pipelines de vision: usar FastViT-T8 como primer clasificador barato (0,7 GMACs) para descartar imagenes irrelevantes antes de invocar modelos mayores (por ejemplo, un ViT-L o un detector), reduciendo coste computacional en servidores.
- Backbone para transfer learning: congelar o ajustar el modelo como extractor de features para tareas downstream con datasets pequenos (clasificacion medica, defectos industriales, especies animales), aprovechando su bajo coste y su origen en timm.
- Moderacion de contenido basica: clasificar imagenes subidas a una plataforma en categorias amplias de ImageNet como paso preliminar, combinado con reglas o clasificadores especificos.
- Aplicaciones offline en navegador o apps de escritorio: al ser TFLite y muy ligero, permite clasificacion local sin enviar imagenes a la nube, lo que ayuda con privacidad y latencia.
- Prototipado rapido en investigacion: comparar rapidamente arquitecturas hibridas ligeras en entornos con recursos limitados (Raspberry Pi, Coral, moviles de gama baja) sin necesidad de infraestructura GPU.
- Etiquetado automatico de datasets: pre-anotar grandes colecciones de imagenes con las 1000 clases de ImageNet para acelerar revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta version LiteRT. El paper original reporta metricas de exactitud y latencia para la familia FastViT, pero no se dispone aqui de cifras concretas del checkpoint convertido ni de comparaciones verificables. No se inventan numeros.

## Requisitos de hardware

- VRAM/RAM estimada: el artefacto float32 ocupa aproximadamente 16 MB para los pesos (4 M parametros x 4 bytes) mas activaciones (~8,6 M elementos). Cabe en cualquier dispositivo con decenas de MB de memoria.
- GPU recomendadas: innecesarias para este tamano; funciona bien en CPU. En moviles, la GPU delegada de LiteRT (OpenCL/OpenGL ES) o NPU (via NNAPI/NeuroPilot) puede acelerar la inferencia.
- Consumer GPU: cabe en cualquier GPU consumer (RTX 3050, GTX 1650, incluso iGPU), aunque su uso tipico es en edge.
- Opciones de despliegue: LiteRT/TFLite (runtime nativo), LiteRT en Android/iOS, TensorFlow Lite Interpreter en Python/C++, y potencialmente conversion a otros runtimes. No se documenta soporte oficial para vLLM, llama.cpp, Ollama o TGI (no aplica a vision).
- Latencia y throughput: no disponibles en la informacion proporcionada. Dado el perfil (0,7 GMACs), se espera latencia de milisegundos en CPU moderna, pero no hay cifras verificables.

## Comparativa con modelos similares

| Modelo | Parametros | GMACs | Entrada | Contexto/tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| FastViT-T8 (esta ficha, LiteRT) | 4,0 M | 0,7 | 256x256 | Clasificacion ImageNet-1K | no disponible | Hugging Face (litert-community) |
| MobileNetV3-Small | ~2,5 M | ~0,06 | 224x224 | Clasificacion ImageNet-1K | Apache 2.0 (tipico en timm) | Amplia (timm, TF, TFLite) |
| EfficientNet-B0 | ~5,3 M | ~0,39 | 224x224 | Clasificacion ImageNet-1K | Apache 2.0 (tipico en timm) | Amplia |
| DeiT-Tiny | ~5,7 M | ~1,3 | 224x224 | Clasificacion ImageNet-1K | Apache 2.0 (tipico en timm) | Amplia |

Nota: los datos de parametros y GMACs de los modelos comparados provienen de sus especificaciones publicas habituales; no se dispone de comparaciones de exactitud verificables en la informacion proporcionada, por lo que no se comparan metricas de rendimiento. La licencia del artefacto LiteRT concreto figura como "no disponible".

## Limitaciones y advertencias

- Solo clasifica en las 1000 clases de ImageNet-1K; no es un modelo generativo ni un detector, y no puede describir imagenes en lenguaje natural.
- Riesgo de sesgos heredados de ImageNet-1K (representacion desigual de clases, sesgos geograficos y culturales en las categorias).
- Sensibilidad a la distribucion de entrada: requiere redimensionado a 256x256 y normalizacion con las estadisticas de entrenamiento de timm; un preprocesado incorrecto degrada la precision.
- Posibles errores en clases visualmente similares y en imagenes fuera de distribucion (dominio medico, industrial, satelital), donde la precision esperada cae.
- La licencia del artefacto LiteRT no esta indicada; antes de uso comercial conviene verificar la licencia del checkpoint base (`timm/fastvit_t8.apple_in1k`) y del codigo original de Apple.
- No hay datos publicados sobre cuantizacion int8 del artefacto ni sobre precision tras conversion; validar en el dispositivo objetivo antes de produccion.
- Modelo de vision sin capacidades linguisticas ni multilingues; no apto para tareas de texto, agentes o tool calling.
- El repositorio figura con 0,0 GB en Hugging Face y 39 descargas, lo que sugiere poca validacion comunitaria; conviene reproducir la inferencia y comparar con el checkpoint timm original.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/fastvit_t8
- Modelo base en timm: https://huggingface.co/timm/fastvit_t8.apple_in1k
- Paper FastViT: https://arxiv.org/abs/2303.14189
- Repositorio oficial Apple: https://github.com/apple/ml-fastvit
- LiteRT (documentacion): https://ai.google.dev/edge/litert
- Repositorio timm: https://github.com/huggingface/pytorch-image-models
