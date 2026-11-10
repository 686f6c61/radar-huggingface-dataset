# rahulsah089/truelens-models

## Resumen

TrueLens-models es un repositorio de modelos ONNX cuantizados publicado por el usuario rahulsah089, pensado para ejecutar deteccion de imagenes generadas por IA directamente en el navegador mediante onnxruntime-web. No es un modelo entrenado desde cero, sino un paquete de tres exportaciones ONNX derivadas de detectores publicos de terceros: CommunityForensics-DeepfakeDet-ViT, haywoodsloan/ai-image-detector-deploy y SMOGY-Ai-images-detector. El repositorio actua como artefacto de despliegue del Space TrueLens, no como modelo original.

El paquete incluye tres variantes con distintos compromisos de precision y coste computacional: cf.onnx en int8 con entrada de 384x384, swinv2.onnx en 4 bits (MatMulNBits) con entrada de 256x256 y smogy.onnx en int8 dinamico con entrada de 224x224. Cada una mantiene su propio preprocesado y formato de salida, por lo que no son intercambiables sin adaptar el codigo de inferencia.

Su relevancia es practica: demuestra un patron de despliegue de clasificadores de imagen en el cliente (navegador) sin backend, util para moderacion de contenido, verificacion de autenticidad y prototipos de deteccion de deepfakes. La informacion publica es escasa: cero descargas, cero likes y una licencia "other" sin terminos detallados en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (tres detectores de imagen subyacentes: ViT/CLIP-like en cf, SwinV2 en swinv2, no especificada en smogy) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (clasificacion de imagen) |
| Tipos de cuantizacion | int8 (cf), 4-bit MatMulNBits (swinv2), int8 dinamico (smogy) |
| Idiomas soportados | No disponible (no aplica; clasificador de imagen) |
| Licencia | other (terminos no detallados; se remite a los autores originales) |
| Formato de pesos | ONNX (.onnx) |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo: agrupa tres exportaciones ONNX cuantizadas de detectores de imagenes IA de terceros. cf.onnx proviene de buildborderless/CommunityForensics-DeepfakeDet-ViT, que el autor indica que ya incluia su propia exportacion int8; la entrada es de 384x384 con redimensionado del lado corto a 440 y recorte central, normalizacion CLIP mean/std, y salida de un unico logit al que se aplica sigmoid para obtener P(AI). swinv2.onnx deriva de haywoodsloan/ai-image-detector-deploy, usa entrada de 256x256, normalizacion ImageNet mean/std y salida softmax donde el indice 0 corresponde a "artificial"; se cuantiza a 4 bits con MatMulNBits. smogy.onnx procede de Smogy/SMOGY-Ai-images-detector, con entrada de 224x224, normalizacion ImageNet y salida softmax con indice 0 = "artificial", cuantizado a int8 dinamico.

No se dispone de informacion sobre los datos de entrenamiento de los modelos originales, el numero de tokens o imagenes, ni sobre si se aplicaron tecnicas de alineacion. La innovacion tecnica del repositorio es de despliegue: empaquetar los tres detectores en formatos ONNX optimizados para onnxruntime-web, de modo que la inferencia se ejecute en el navegador del usuario sin enviar imagenes a un servidor.

## Capacidades

- Clasificacion binaria de imagenes: distingue imagenes generadas por IA frente a imagenes reales (o "artificial" frente a la otra clase, segun la salida de cada modelo).
- Deteccion de deepfakes y contenido sintetico en el contexto de los modelos de origen (CommunityForensics, SMOGY, ai-image-detector).
- Inferencia en navegador mediante onnxruntime-web, sin backend.
- Tres variantes con distintos tamanos de entrada y cuantizacion para ajustar precision y coste.
- No soporta generacion de texto, codigo, matematicas, tool calling, agentes ni capacidades multilingues.
- No dispone de modo thinking, vision generativa, audio ni funcionalidades multimodales mas alla de la clasificacion de imagen.

## Casos de uso

- Moderacion de contenido en el cliente: integrar los ONNX en una web o extension para marcar imagenes potencialmente generadas por IA antes de subirlas, sin enviar el contenido a un servidor y preservando la privacidad.
- Verificacion de autenticidad en plataformas de noticias o redes sociales: ejecutar la deteccion en el navegador del usuario para etiquetar imagenes sospechosas con una probabilidad (sigmoid en cf, softmax en swinv2 y smogy).
- Prototipado rapido de deteccion de deepfakes: usar el paquete como base para demos y pruebas de concepto con onnxruntime-web, comparando las tres variantes sobre el mismo conjunto de imagenes.
- Filtrado previo en pipelines de subida de imagenes: descartar o marcar contenido sintetico antes de almacenarlo, usando smogy.onnx (224x224, int8 dinamico) como primera pasada barata.
- Educacion y divulgacion: el Space TrueLens sirve para mostrar al publico como funcionan los detectores de imagenes IA y sus limitaciones, con inferencia local.
- Investigacion comparativa de detectores: evaluar en un mismo entorno las tres exportaciones para estudiar diferencias de calibracion y sensibilidad entre arquitecturas y cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el tamano total del repositorio es de 0,2 GB, por lo que los tres ONNX juntos ocupan ese orden de magnitud y la inferencia es viable en CPU.
- GPU recomendadas: no disponibles; el diseno apunta a ejecucion en navegador (WebGPU/WebAssembly via onnxruntime-web), no a GPU de servidor.
- Cabe en GPU consumer: si, en la practica cualquier GPU consumer moderna puede ejecutar estos modelos; el objetivo declarado es la ejecucion en el cliente.
- Opciones de despliegue: onnxruntime-web (navegador), y en general cualquier runtime compatible con ONNX (ONNX Runtime en CPU/GPU).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rahulsah089/truelens-models | No disponible | No aplica | Clasificacion imagen IA (ONNX) | other | Hugging Face, 0 descargas |
| buildborderless/CommunityForensics-DeepfakeDet-ViT | No disponible | No aplica | Deteccion de imagenes IA/deepfake | No disponible | Hugging Face (modelo de origen de cf.onnx) |
| haywoodsloan/ai-image-detector-deploy | No disponible | No aplica | Deteccion de imagenes IA | No disponible | Hugging Face (modelo de origen de swinv2.onnx) |
| Smogy/SMOGY-Ai-images-detector | No disponible | No aplica | Deteccion de imagenes IA | No disponible | Hugging Face (modelo de origen de smogy.onnx) |

## Limitaciones y advertencias

- El repositorio no aporta modelos propios: cualquier merito o defecto de deteccion corresponde a los autores originales.
- Licencia "other" sin terminos detallados en la model card; para uso comercial es imprescindible revisar las licencias de los tres modelos de origen.
- No hay informacion sobre sesgos, tasas de falsos positivos/negativos ni robustez frente a imagenes manipuladas, comprimidas o adversariales.
- La deteccion de imagenes IA es inherentemente falible y puede fallar con generadores nuevos o con imagenes reales procesadas; no debe usarse como unica prueba en decisiones criticas.
- Cada ONNX tiene su propio preprocesado y formato de salida; mezclarlos sin respetar la normalizacion y el indice de clase produce resultados incorrectos.
- Sin datos de benchmarks ni de validacion publicados; cero descargas y cero likes, por lo que no hay evidencia de uso en produccion.
- El repositorio es un artefacto de despliegue para un Space concreto; no se garantiza mantenimiento ni actualizaciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rahulsah089/truelens-models
- Space TrueLens: https://huggingface.co/spaces/rahulsah089/truelens
- Modelo de origen cf.onnx: https://huggingface.co/buildborderless/CommunityForensics-DeepfakeDet-ViT
- Modelo de origen swinv2.onnx: https://huggingface.co/haywoodsloan/ai-image-detector-deploy
- Modelo de origen smogy.onnx: https://huggingface.co/Smogy/SMOGY-Ai-images-detector
