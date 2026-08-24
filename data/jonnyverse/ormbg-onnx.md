# JONNYVERSE/ormbg-ONNX

## Resumen

El modelo JONNYVERSE/ormbg-ONNX es una conversión a formato ONNX del modelo original `schirrmacher/ormbg`, un sistema de segmentación de imágenes especializado en la eliminación de fondo (background removal). Está basado en la arquitectura ISNet (Image Segmentation Network), diseñada para obtener máscaras de alta calidad con bordes precisos y bajo coste computacional. Esta versión ONNX está preparada para ejecutarse directamente en el navegador o en entornos Node.js mediante la librería Transformers.js, lo que facilita su integración en aplicaciones web sin necesidad de servidores dedicados.

El modelo resuelve el problema de separar el sujeto principal de una imagen de su fondo, una tarea habitual en edición fotográfica, comercio electrónico, videoconferencia o diseño gráfico. Su relevancia actual radica en que ofrece una solución ligera y portable, con licencia Apache 2.0, que puede desplegarse en clientes web con aceleración por GPU (WebGPU) o CPU. El repositorio contiene pesos en formato ONNX (model.onnx, model_fp16.onnx, model_bnb4.onnx) y está pensado para usarse con el pipeline `background-removal` de Transformers.js.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ISNet (Image Segmentation Network) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | FP32, FP16, BNB4 (model_bnb4.onnx) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (safetensors no aplica) |

## Arquitectura y entrenamiento

El modelo original `schirrmacher/ormbg` emplea la arquitectura ISNet, una red de segmentación que combina un encoder basado en ResNet con un decoder que incorpora mecanismos de atención para refinar los bordes de la máscara. ISNet se entrena con una pérdida específica que penaliza los errores en los contornos, lo que produce máscaras más nítidas que las de modelos como U2-Net o MODNet. La versión ONNX es una conversión directa de los pesos originales, sin reentrenamiento, realizada para ser compatible con el runtime de Transformers.js. No se dispone de información sobre el dataset de entrenamiento ni el número de tokens (al ser un modelo de vision, estos datos no aplican). Tampoco se conocen detalles sobre técnicas de alineación como RLHF o DPO, que no son habituales en modelos de segmentación.

## Capacidades

- Segmentacion de imagenes para eliminar el fondo, generando una mascara binaria o alfa.
- Deteccion precisa de bordes gracias a la arquitectura ISNet, especialmente en contornos finos (pelo, objetos con geometria compleja).
- Ejecucion en navegador y Node.js mediante Transformers.js, sin necesidad de backend.
- Soporte para entrada de imagenes en formato URL, blob o tensor.
- Salida configurable: guardar como PNG, convertir a canvas o blob.
- Compatible con aceleracion WebGPU en navegadores modernos para inferencia en tiempo real.
- No incluye capacidades de generacion de texto, tool calling ni agentes, al ser un modelo puramente visual.

## Casos de uso

- Edicion fotografica en aplicaciones web: el usuario sube una imagen y el modelo genera una mascara de recorte que puede aplicarse para cambiar el fondo o aislar el sujeto. Gracias a su ejecucion en el cliente, no se envian imagenes a un servidor, lo que mejora la privacidad y reduce latencia.
- Comercio electronico: generacion automatica de imagenes de producto con fondo blanco o transparente para catalogos. El modelo puede integrarse en un flujo de subida de imagenes en una tienda online, procesando cada foto al instante.
- Videoconferencia y streaming: uso en tiempo real para difuminar o sustituir el fondo en aplicaciones de videollamada. Con WebGPU, la inferencia puede alcanzar tasas suficientes para video en resolucion moderada.
- Diseno grafico y marketing: creacion de composiciones con recortes limpios para carteles, banners o publicaciones en redes sociales. El modelo puede usarse como herramienta dentro de un editor grafico basado en canvas.
- Automatizacion de flujos de trabajo: integracion en pipelines de Node.js para procesar lotes de imagenes, por ejemplo en un script que recorta el fondo de todas las fotos de un directorio.
- Aplicaciones de realidad aumentada: separacion del sujeto para superponerlo en entornos virtuales, aprovechando la mascara de alta calidad para efectos de croma sin fondo fisico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo original `schirrmacher/ormbg` no incluye tablas comparativas en su model card, y la version ONNX tampoco reporta metricas como IoU o F1 sobre datasets estandar (PPM-100, etc.). Se recomienda evaluar el modelo en el caso de uso concreto antes de desplegarlo en produccion.

## Requisitos de hardware

- VRAM estimada: no disponible. El modelo ONNX pesa 176 MB en FP32 y 88 MB en FP16, por lo que puede ejecutarse en GPU con al menos 2 GB de VRAM, aunque el consumo real depende de la resolucion de entrada.
- GPU recomendadas: cualquier GPU compatible con WebGPU (por ejemplo, integradas Intel, AMD o NVIDIA) para inferencia en navegador. En Node.js, se puede usar ONNX Runtime con ejecucion en CPU o GPU (CUDA).
- En CPU: puede ejecutarse en cualquier maquina moderna, aunque la latencia sera mayor. Para imagenes de 1024x1024, se esperan tiempos de 1-3 segundos en CPU y menos de 0.5 segundos en GPU.
- Opciones de despliegue: Transformers.js (navegador o Node.js), ONNX Runtime Web, ONNX Runtime Node, o cualquier runtime compatible con ONNX.
- Latencia y throughput: no se han publicado mediciones oficiales. Depende del hardware y de la resolucion de entrada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Formato | Licencia | Uso en navegador |
|---|---|---|---|---|---|
| JONNYVERSE/ormbg-ONNX | ISNet | no disponible | ONNX | Apache 2.0 | Si (Transformers.js) |
| schirrmacher/ormbg | ISNet | no disponible | PyTorch | Apache 2.0 | No directo |
| U2-Net (u2net) | U2-Net | 44 M aprox. | PyTorch/ONNX | Apache 2.0 | Si (con conversion) |
| MODNet | MODNet | 25 M aprox. | PyTorch/ONNX | Apache 2.0 | Si (con conversion) |

La principal ventaja de esta version ONNX es su integracion inmediata con Transformers.js, evitando pasos de conversion. Frente a U2-Net o MODNet, ISNet suele ofrecer mejores bordes, pero no se dispone de comparativas cuantitativas en esta ficha.

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos del modelo. Al ser un modelo de segmentacion, puede fallar en imagenes con multiples sujetos, fondos complejos o condiciones de iluminacion extremas.
- Riesgo de alucinacion: no aplica, al ser un modelo discriminativo de vision, pero puede generar mascaras incorrectas en casos ambiguos (por ejemplo, objetos semitransparentes).
- Limitaciones de contexto: la resolucion de entrada no esta documentada. Se recomienda probar con resoluciones de 512x512 a 1024x1024.
- Licencia Apache 2.0 permite uso comercial, pero se debe atribuir al autor original (schirrmacher/ormbg) y a esta conversion.
- El modelo no soporta otros idiomas ni texto, es exclusivamente para imagenes.
- Para produccion, es necesario validar el rendimiento en el hardware objetivo, especialmente si se usa WebGPU, ya que la compatibilidad varia entre navegadores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JONNYVERSE/ormbg-ONNX
- Modelo original: https://huggingface.co/schirrmacher/ormbg
- Repositorio de la comunidad ONNX (misma conversion): https://huggingface.co/onnx-community/ormbg-ONNX
- Documentacion de Transformers.js: https://huggingface.co/docs/transformers.js
- ONNX (formato): https://onnx.ai/
- ONNX Model Zoo: https://github.com/onnx/models
