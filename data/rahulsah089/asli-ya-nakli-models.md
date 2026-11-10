# rahulsah089/asli-ya-nakli-models

## Resumen

Asli Ya Nakli es un repositorio que agrupa tres detectores de imagenes generadas por IA convertidos a ONNX y cuantizados, pensados para ejecutarse integramente en el navegador mediante onnxruntime-web. No es un modelo original: el autor, rahulsah089, publica copias optimizadas de tres detectores publicos (CommunityForensics-DeepfakeDet-ViT, ai-image-detector-deploy y SMOGY-Ai-images-detector) para alimentar su Space de demostracion "Asli Ya Nakli".

El problema que resuelve es la deteccion binaria de imagenes sinteticas frente a reales. Cada fichero ONNX expone una clasificacion de dos clases o un unico logit sigmoide, segun el modelo de origen, con preprocesados especificos (resolucion de entrada, normalizacion y recorte) que el integrador debe respetar para obtener resultados correctos.

Su relevancia actual es practica: demuestra como llevar detectores de deepfakes a entornos sin GPU y sin backend, reduciendo el coste de despliegue. El repositorio ocupa 0,2 GB y no registra descargas ni likes en el momento de la consulta. La licencia se declara como "other", heredada de los modelos fuente, y no se documentan idiomas ni contexto, al tratarse de un modelo de vision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tres clasificadores de imagen independientes en ONNX: ViT (cf.onnx), SwinV2 (swinv2.onnx) y detector SMOGY (smogy.onnx) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | int8 (cf.onnx), 4-bit MatMulNBits (swinv2.onnx), int8 dinamica (smogy.onnx) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | other (terminos de los autores originales) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo: empaqueta tres detectores preexistentes en formato ONNX. El primero, `cf.onnx`, deriva de CommunityForensics-DeepfakeDet-ViT, un transformer de vision con exportacion int8 propia; espera entradas de 384x384 obtenidas recortando el centro tras redimensionar el lado corto a 440, con media y desviacion tipica de CLIP, y devuelve un unico logit cuya sigmoide se interpreta como probabilidad de que la imagen sea generada por IA.

El segundo, `swinv2.onnx`, procede de haywoodsloan/ai-image-detector-deploy, una arquitectura SwinV2 cuantizada a 4 bits mediante MatMulNBits, con entrada de 256x256 y normalizacion ImageNet; su salida es una softmax en la que el indice 0 corresponde a "artificial". El tercero, `smogy.onnx`, es una copia int8 dinamica de Smogy/SMOGY-Ai-images-detector, con entrada de 224x224 y normalizacion ImageNet, y la misma convencion de softmax (indice 0 = artificial). No se documentan datos de entrenamiento, numero de tokens ni tecnicas de alineacion, ya que corresponden a los modelos fuente.

## Capacidades

- Clasificacion binaria de imagenes: distingue contenido generado por IA de contenido real.
- Deteccion de deepfakes y de imagenes sinteticas en tres variantes con arquitecturas y preprocesados distintos.
- Inferencia en navegador mediante onnxruntime-web, sin backend ni GPU dedicada.
- Salida calibrada de forma distinta por fichero: logit con sigmoide en `cf.onnx`, softmax de dos clases en `swinv2.onnx` y `smogy.onnx`.
- No soporta generacion de texto, codigo, matematicas, vision descriptiva, tool calling ni razonamiento multi-paso.
- No dispone de capacidades multilingues ni de modo thinking.

## Casos de uso

- Moderacion de contenido en el navegador: el integrador puede cargar `smogy.onnx` con onnxruntime-web y clasificar imagenes subidas por el usuario antes de enviarlas al servidor, reduciendo coste de backend y latencia percibida.
- Verificacion de autenticidad en plataformas de noticias: usar `cf.onnx` con su recorte a 384x384 y normalizacion CLIP para marcar imagenes sospechosas de ser sinteticas en un pipeline editorial.
- Filtrado en formularios de perfil: ejecutar `swinv2.onnx` (4 bits, 256x256) en el cliente para rechazar avatares generados por IA sin necesidad de infraestructura GPU.
- Ensembles de deteccion: combinar las tres salidas (logit sigmoide y dos softmax) para reducir falsos positivos, ya que cada detector tiene arquitectura y preprocesado independientes.
- Demos educativas y de investigacion: el Space asociado sirve como referencia de como cuantizar y desplegar detectores de deepfakes en el navegador.
- Procesamiento por lotes offline: cargar los ONNX en onnxruntime (Python o C++) para auditar grandes colecciones de imagenes en un servidor sin GPU, aprovechando las cuantizaciones int8 y 4 bits.
- Integracion en extensiones de navegador: analizar imagenes de una pagina web en el propio cliente y mostrar una advertencia al usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al ser modelos de vision pequenos y cuantizados, la inferencia cabe en CPU y en GPUs consumer de gama baja.
- GPU recomendadas: no se especifican; el destino principal es CPU y navegador via onnxruntime-web (WebAssembly/WebGPU).
- Cabe en GPU consumer: si, al tratarse de clasificadores de imagen cuantizados a int8 y 4 bits; no se detalla el modelo minimo.
- Opciones de despliegue: onnxruntime-web en navegador, onnxruntime en Python/C++ para servidor, y cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Asli Ya Nakli (este repo) | Paquete de 3 detectores ONNX | 224², 256², 384² | int8, 4-bit, int8 dinamica | other | Hugging Face, 0 descargas |
| buildborderless/CommunityForensics-DeepfakeDet-ViT | ViT detector | 384² | exportacion int8 propia | no disponible | Hugging Face |
| haywoodsloan/ai-image-detector-deploy | SwinV2 detector | 256² | no especificada en origen | no disponible | Hugging Face |
| Smogy/SMOGY-Ai-images-detector | Detector de imagenes IA | 224² | no especificada en origen | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo original: los pesos y la licencia pertenecen a los autores de los modelos fuente; el uso comercial depende de los terminos de cada uno, no documentados aqui.
- La licencia "other" no aclara condiciones de redistribucion ni de uso comercial; es necesario revisar las paginas de origen.
- Cada fichero exige un preprocesado distinto (resolucion, recorte y normalizacion); aplicar el equivocado degrada la deteccion sin aviso.
- Las convenciones de salida difieren: `cf.onnx` devuelve un logit (aplicar sigmoide), mientras que `swinv2.onnx` y `smogy.onnx` devuelven softmax con indice 0 = artificial.
- Riesgo de falsos positivos y negativos inherente a los detectores de IA, especialmente ante imagenes editadas, comprimidas o de dominios no vistos.
- Sin datos publicados de benchmarks, sesgos ni evaluacion independiente en este repositorio.
- Sin soporte de texto, contexto ni idiomas; no apto para tareas de NLP.
- Repositorio sin descargas ni validacion comunitaria; tratar como material de demostracion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rahulsah089/asli-ya-nakli-models
- Space de demostracion: https://huggingface.co/spaces/rahulsah089/asli-ya-nakli
- Modelo fuente cf.onnx: https://huggingface.co/buildborderless/CommunityForensics-DeepfakeDet-ViT
- Modelo fuente swinv2.onnx: https://huggingface.co/haywoodsloan/ai-image-detector-deploy
- Modelo fuente smogy.onnx: https://huggingface.co/Smogy/SMOGY-Ai-images-detector
