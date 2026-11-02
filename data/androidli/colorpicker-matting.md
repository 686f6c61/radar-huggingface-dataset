# androidli/colorpicker-matting

## Resumen

MODNet · INT8 ONNX es una exportación cuantizada del modelo de matting de retratos MODNet, publicada por el usuario androidli bajo el identificador `androidli/colorpicker-matting`. Se trata de una conversión a formato ONNX con cuantización INT8 (q8) del port para transformers.js de Xenova, que a su vez adapta el modelo original ZHKKKe/MODNet. El resultado es un artefacto de apenas 6,6 MB pensado para ejecutarse íntegramente en el navegador (client-side) sin necesidad de backend.

El modelo resuelve el problema de la extracción de sujeto en imágenes de retrato (portrait matting): genera una máscara alfa que separa a la persona del fondo, algo útil en herramientas de edición fotográfica, generación de recortes o composición de imágenes. Frente a una segmentación binaria, el matting produce valores alfa continuos que permiten conservar detalles finos como el pelo o los bordes semitransparentes.

Su relevancia actual radica en la combinación de tres factores: licencia Apache-2.0, tamaño reducido (6,6 MB) y ejecución local en el navegador mediante ONNX Runtime y transformers.js. Esto lo hace adecuado para aplicaciones web que necesitan privacidad (la imagen no sale del dispositivo) y bajo coste de infraestructura. No es un modelo de lenguaje ni un transformer generativo: es una red de segmentación de imágenes especializada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MODNet (red de matting de retratos; no es un transformer de lenguaje) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | INT8 (q8) sobre ONNX |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/model_quantized.onnx`, 6,6 MB) |

## Arquitectura y entrenamiento

El modelo subyacente es MODNet, una red neuronal convolucional diseñada específicamente para matting de retratos, no una arquitectura transformer. La model card no proporciona detalles sobre el dataset de entrenamiento, el número de imágenes, la composición del mismo ni si se aplicaron técnicas de refinamiento posteriores. Tampoco se documentan innovaciones técnicas internas más allá de la propia arquitectura MODNet original, que se caracteriza por combinar una rama de predicción de matte con mecanismos de consistencia semántica y de detalle para producir alfas precisos en tiempo real.

La contribución concreta de esta ficha es la exportación a ONNX con cuantización INT8, que reduce el peso del modelo a 6,6 MB y permite su ejecución en entornos JavaScript mediante transformers.js. El preprocesado definido en `preprocessor_config.json` redimensiona la imagen al lado más corto de 512 píxeles, con dimensiones divisibles por 32 y normalización con media y desviación de 0,5. El repositorio incluye un `manifest.json` con hashes SHA-256 y tamaños de cada fichero, lo que facilita la verificación de integridad en despliegues.

## Capacidades

- Generación de máscaras alfa (matting) para retratos: separa al sujeto del fondo con valores de transparencia continuos.
- Segmentación de imagen orientada a recorte de personas: produce un canal alfa utilizable para composición.
- Ejecución client-side en el navegador mediante transformers.js y ONNX Runtime.
- Procesamiento de imágenes de entrada con redimensionado automático al lado más corto de 512 píxeles.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo de razonamiento (thinking mode), visión general, audio ni otras modalidades más allá del matting de retratos.

## Casos de uso

- Herramientas de edición fotográfica en el navegador: el modelo genera la máscara alfa del retrato directamente en el cliente, de modo que la imagen del usuario nunca se envía a un servidor. Es adecuado por su tamaño de 6,6 MB y su licencia permisiva.
- Selectores de color y utilidades de diseño web: tal como indica el nombre del repositorio (`colorpicker-matting`), se emplea para aislar al sujeto en herramientas de selección de color y composición, permitiendo al usuario aplicar colores o fondos solo a la figura recortada.
- Generación de avatares y fotos de perfil: recorte automático del sujeto para producir imágenes con fondo transparente o sustituido, sin infraestructura de servidor.
- Aplicaciones de videollamada o webcam en el navegador: sustitución de fondo en tiempo real para retratos, aprovechando la ligereza del modelo INT8 y su ejecución local.
- Composición de imágenes para comercio electrónico: extracción de modelos o productos con contornos suaves (pelo, bordes) para catálogos y fichas de producto.
- Prototipado rápido y demos: al ejecutarse con transformers.js y publicarse en un repositorio de 0,0 GB, se integra en demos estáticas sin backend ni coste de GPU.
- Preprocesado en pipelines de visión: generación de máscaras alfa como paso previo a tareas de composición, recoloreado o segmentación en aplicaciones web.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; el modelo pesa 6,6 MB en INT8 y está pensado para ejecutarse en CPU o GPU integrada del navegador mediante WebGL/WebGPU o WASM.
- GPU recomendadas: no requiere GPU dedicada; funciona en cualquier dispositivo capaz de ejecutar ONNX Runtime en el navegador.
- Cabe en cualquier GPU de consumo e incluso en dispositivos móviles, dado su tamaño reducido.
- Opciones de despliegue: transformers.js (librería declarada), ONNX Runtime Web; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Formato | Licencia | Ejecucion en navegador |
|---|---|---|---|---|---|
| androidli/colorpicker-matting | MODNet INT8 | 6,6 MB | ONNX q8 | Apache-2.0 | Si (transformers.js) |
| Xenova/modnet | MODNet (port transformers.js) | no disponible | ONNX | Apache-2.0 (heredada) | Si |
| ZHKKKe/MODNet (original) | MODNet | no disponible | PyTorch | Apache-2.0 | No (requiere backend) |

La comparativa se limita a las variantes del mismo modelo base, ya que la información disponible no incluye otros modelos de matting con datos verificables. No se dispone de cifras de rendimiento comparadas entre estas variantes.

## Limitaciones y advertencias

- Especializado exclusivamente en matting de retratos: su rendimiento en otros tipos de sujetos (animales, objetos, paisajes) no está documentado y probablemente sea inferior.
- Resolución de trabajo limitada: el preprocesado fija el lado más corto en 512 píxeles, lo que puede perder detalle en imágenes de alta resolución.
- Riesgo de artefactos en bordes complejos (pelo muy fino, transparencias, movimiento) inherente a la cuantización INT8 y al propio modelo.
- No se documentan sesgos concretos, pero al ser un modelo entrenado con retratos puede presentar diferencias de calidad según tonos de piel, iluminación o tipos de fondo.
- No procesa texto ni lenguaje, por lo que las consideraciones de alucinación lingüística no aplican; el riesgo es de máscaras incorrectas o incompletas.
- Licencia Apache-2.0: permite uso comercial y modificación, siempre que se conserve el aviso de licencia y atribución correspondiente.
- El repositorio tiene un tamaño declarado de 0,0 GB y muy pocas descargas (23), lo que sugiere un uso limitado y poca validación comunitaria en producción.
- Depende del ecosistema transformers.js y ONNX Runtime; cambios de versión en estas librerías pueden requerir ajustes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/androidli/colorpicker-matting
- Modelo base (port transformers.js): https://huggingface.co/Xenova/modnet
- Repositorio original MODNet: https://github.com/ZHKKKe/MODNet
- Librería transformers.js: https://github.com/xenova/transformers.js
