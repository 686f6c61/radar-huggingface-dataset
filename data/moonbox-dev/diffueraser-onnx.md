# moonbox-dev/diffuEraser-ONNX

## Resumen

DiffuEraser ONNX es la conversión a formato ONNX del modelo DiffuEraser, desarrollado originalmente por Alibaba Tongyi Lab, publicada por moonbox-dev (Moonbox) para su uso en dispositivo mediante ONNX Runtime con backend CPU, CUDA o DirectML. DiffuEraser es un modelo de inpainting de vídeo y eliminación de objetos que trabaja a partir de máscaras por fotograma, refinando el resultado de un primer paso de inpainting previo generado por ProPainter. El repositorio empaqueta el modelo como cuatro grafos ONNX (BrushNet, UNet, VAE encoder y VAE decoder) más un script `pipeline.py` en numpy que reproduce el `DiffuEraser.forward` original.

La relevancia de esta conversión reside en que elimina la dependencia de PyTorch en producción y permite ejecutar el modelo en entornos heterogéneos, incluidos equipos Windows con DirectML, servidores sin GPU dedicada y pipelines donde ONNX Runtime ya está integrado. El repositorio ocupa 8,1 GB e incluye dos precisiones: fp16 (calidad casi idéntica al original) e int8 (MatMuls en 8 bits con convoluciones en fp16, con pérdida de calidad medible).

El modelo base es de tipo difusión sobre Stable Diffusion con el adaptador BrushNet, orientado a la edición de vídeo. No es un modelo de lenguaje: no genera texto ni razona, sino que rellena regiones enmascaradas de fotogramas de vídeo de forma temporalmente coherente. La licencia de los pesos es Apache-2.0, pero el modelo de prior que consume (ProPainter) es de uso no comercial, lo que condiciona el despliegue comercial del pipeline completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion (Stable Diffusion + adaptador BrushNet) para inpainting de video |
| Parametros totales | No disponible (repo de 8,1 GB con pesos en fp16 e int8) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision por fotograma) |
| Tipos de cuantizacion | fp16 e int8 (MatMuls 8 bits, convoluciones fp16) |
| Idiomas soportados | No disponible (modelo de imagen/video, no linguistico) |
| Licencia | Apache-2.0 (pesos DiffuEraser); ProPainter, modelo de prior, es no comercial |
| Formato de pesos | ONNX (grafos `.onnx` + `.onnx.data`) y `text_embeds.npy` |

## Arquitectura y entrenamiento

DiffuEraser es un modelo de difusion para inpainting de video construido sobre Stable Diffusion con el adaptador BrushNet, que inyecta la informacion de la mascara y del fotograma en el UNet. El pipeline refina un prior: recibe el video tal como lo dejo un primer paso de inpainting (ProPainter) y lo perfecciona fotograma a fotograma con coherencia temporal. La conversion ONNX reproduce el `DiffuEraser.forward` del repositorio original con los ajustes de `run_diffueraser.py`: LoRA PCM de 2 pasos, guidance 0 y dilatacion de mascara de 8.

La publicacion no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO, por lo que esos datos no estan disponibles. La innovacion tecnica de esta ficha es la propia conversion: cuatro grafos ONNX independientes (BrushNet, UNet, VAE encoder, VAE decoder) mas un runtime en numpy que gestiona el preprocesado de imagen, el bucle de fotogramas y el manejo de mascaras. El benchmark del autor mide PSNR en la region inpintada frente al modelo PyTorch original sobre los mismos clips y mascaras.

## Capacidades

- Inpainting de video: rellena regiones enmascaradas de forma temporalmente coherente a lo largo de los fotogramas.
- Eliminacion de objetos: borra objetos marcados con mascara por fotograma y reconstruye el fondo.
- Refinamiento de un prior: parte del resultado de ProPainter y mejora la calidad del relleno.
- Ejecucion en ONNX Runtime con backends CPU, CUDA y DirectML.
- Dos precisiones intercambiables: fp16 (calidad alta) e int8 (menor huella, calidad reducida).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades linguisticas: es un modelo puramente visual.

## Casos de uso

- Eliminacion de objetos en postproduccion de video: se marca el objeto con mascaras por fotograma y el modelo reconstruye el fondo de forma coherente; adecuado por su naturaleza de inpainting temporal y su integracion en ONNX Runtime.
- Limpieza de metraje de archivo: retirada de marcas de agua, subtitulos quemados o elementos no deseados fotograma a fotograma, refinando el resultado de ProPainter.
- Edicion en dispositivo con DirectML: ejecucion en equipos Windows sin CUDA mediante el backend DirectML, util para estaciones de trabajo de edicion.
- Pipelines de produccion sin PyTorch: integracion en servicios donde ONNX Runtime ya es la dependencia estandar, evitando anadir el stack de PyTorch.
- Prototipado rapido en CPU: la version int8 permite probar el pipeline en hardware modesto antes de escalar a GPU.
- Investigacion en inpainting de video: reproduccion del forward original con grafos exportados, util para comparar variantes de cuantizacion y medir PSNR en la region inpintada.

## Benchmarks y rendimiento

El autor publica un benchmark de PSNR en la region inpintada frente al modelo PyTorch original, sobre los mismos clips y mascaras, con tiempos por clip en CUDA.

| Precision | PSNR medio (region inpintada) | Peor fotograma | Tiempo por clip (CUDA) |
|---|---|---|---|
| fp16 | 57,0 / 55,0 dB | 52,4 dB | 67 / 73 s (original: 44 / 47 s) |
| int8 | 53,9 / 49,0 dB | 48,0 dB | 67 / 73 s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo de inpainting de video.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio pesa 8,1 GB e incluye ambas precisiones. La version int8 reduce el UNet de 2,63 GB a 1,97 GB.
- GPU recomendadas: no disponibles en la informacion; el autor reporta tiempos con backend CUDA.
- Compatibilidad con GPU de consumo: no confirmada; la existencia de backend DirectML y CPU sugiere viabilidad en equipos sin GPU dedicada, aunque sin datos de latencia.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML) con el `pipeline.py` incluido; requiere ProPainter como primer paso (builds ONNX en moonbox-dev/ProPainter-ONNX).
- Latencia y throughput: 67-73 s por clip en CUDA para ambas precisiones, frente a 44-47 s del original PyTorch; la conversion es mas lenta que el modelo de referencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| DiffuEraser ONNX (este) | Inpainting de video (SD + BrushNet) | No disponible | No aplica | Apache-2.0 (prior ProPainter no comercial) | ONNX |
| DiffuEraser (original, lixiaowen) | Inpainting de video (SD + BrushNet) | No disponible | No aplica | Apache-2.0 | PyTorch |
| ProPainter | Inpainting de video (primer paso) | No disponible | No aplica | No comercial | PyTorch / ONNX |

La comparativa con modelos de lenguaje no aplica por la naturaleza del modelo. Frente al DiffuEraser original, la version ONNX mantiene la calidad en fp16 (PSNR medio 57,0 / 55,0 dB) a costa de mayor tiempo por clip (67-73 s frente a 44-47 s). Frente a ProPainter, DiffuEraser actua como refinador del prior que este genera, no como sustituto.

## Limitaciones y advertencias

- La licencia Apache-2.0 cubre los pesos de DiffuEraser, pero el modelo de prior que consume (ProPainter) es de uso no comercial; el pipeline completo no es apto para uso comercial sin revisar esa restriccion.
- La version int8 pierde calidad de forma medible: PSNR medio de 53,9 / 49,0 dB frente a 57,0 / 55,0 dB en fp16, con peor fotograma de 48,0 dB.
- La conversion es mas lenta que el modelo PyTorch original (67-73 s frente a 44-47 s por clip en CUDA).
- Depende de un primer paso de inpainting (ProPainter); no funciona de forma autonoma sobre el video original.
- No se han publicado datos sobre sesgos, tasas de alucinacion visual ni limitaciones de idioma en la informacion disponible.
- Requiere mascaras por fotograma correctas; la calidad del resultado depende de la precision de la mascara y de la dilatacion aplicada (8 en la configuracion por defecto).
- No es un modelo de lenguaje: no admite prompts textuales libres ni tool calling.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/diffuEraser-ONNX
- Modelo base: https://huggingface.co/lixiaowen/diffuEraser
- ProPainter ONNX (prior): https://huggingface.co/moonbox-dev/ProPainter-ONNX
- Paper (arXiv:2501.10018): https://arxiv.org/abs/2501.10018
