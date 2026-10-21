# alegauss/photo-boost-models

## Resumen

`alegauss/photo-boost-models` no es un modelo único, sino un paquete de seis modelos ONNX en FP32 que la aplicación de escritorio PhotoBoost descarga para su modo de alta calidad. El repositorio actúa como espejo verificado de pesos upstream: cada fichero se exporta desde los pesos originales de su proyecto de origen, se contrasta contra la implementación de referencia en PyTorch mediante `scripts/export-and-quantize.py` y se registra en `manifest.json` con su tamano y su hash SHA-256, de forma que la aplicación rechaza cualquier fichero que no coincida.

El conjunto cubre cuatro tareas de restauración de imagen: superresolución x4 y x2 (Real-ESRGAN x4plus y x2plus), restauración facial (GFPGAN v1.4), restauración y eliminación de ruido (SCUNet color real PSNR), matting de alta calidad (ViTMatte small composition-1k) y eliminación de fondo (RMBG-1.4, este último no alojado aquí sino referenciado en el repositorio de BRIA en un commit fijado).

Su relevancia es de ingeniería más que de investigación: proporciona un pipeline reproducible y con verificación de integridad para modelos de restauración que de otro modo habría que exportar y validar a mano, y explicita la licencia de cada componente por separado, incluyendo dos casos con restricciones no comerciales. No es un modelo de lenguaje: no tiene ventana de contexto, no genera texto y no soporta tool calling. El repositorio completo ocupa 0,7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no describe la arquitectura de cada red; son modelos de restauración de imagen exportados desde los repositorios upstream) |
| Parametros totales | no disponible (no se desglosa por modelo; el repositorio completo ocupa 0,7 GB en FP32) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | FP32 en ONNX. El repositorio incluye `scripts/export-and-quantize.py`, lo que indica que el pipeline contempla cuantización, pero no se publican variantes cuantizadas |
| Idiomas soportados | no aplica (modelos de imagen); no disponible |
| Licencia | por modelo: BSD-3-Clause (Real-ESRGAN x4plus y x2plus), Apache-2.0 con términos de terceros (GFPGAN v1.4), Apache-2.0 (SCUNet color real PSNR y ViTMatte small composition-1k), licencia no comercial de BRIA (RMBG-1.4) |
| Formato de pesos | ONNX (FP32) |
| Numero de modelos | 6 (5 alojados en el repositorio, 1 referenciado upstream) |
| Verificacion de integridad | `manifest.json` con tamano y SHA-256 por fichero; la aplicación rechaza ficheros que no coinciden |
| Escalas de superresolucion | x4 y x2 (Real-ESRGAN x4plus y x2plus) |
| Pipeline de HuggingFace | no disponible |

## Arquitectura y entrenamiento

Este repositorio no entrena ningún modelo: es un artefacto de distribución. Cada red se exporta desde los pesos publicados por su proyecto de origen y se valida numéricamente contra la implementación de referencia en PyTorch, de modo que el grafo ONNX debe reproducir las mismas salidas que el modelo original. Esa comprobación de paridad es el único control de calidad documentado en la información disponible; no se publican métricas de calidad de imagen (PSNR, SSIM, LPIPS) ni detalles de los datasets de entrenamiento de cada red.

Los modelos subyacentes pertenecen a tres familias de tareas distintas: superresolución y restauración generativa (Real-ESRGAN, GFPGAN), restauración/denoising (SCUNet) y segmentación densa con salida de matte o máscara (ViTMatte, RMBG-1.4). Al ser FP32 y ONNX, el despliegue se apoya en ONNX Runtime y no en stacks de inferencia de lenguaje. No hay información sobre RLHF, DPO ni ajuste alguno por parte del autor del repositorio.

## Capacidades

- Superresolución x4 de imágenes con Real-ESRGAN x4plus.
- Superresolución x2 con Real-ESRGAN x2plus.
- Restauración de rostros degradados con GFPGAN v1.4, pensada para integrarse tras un upscaler.
- Restauración y eliminación de ruido con SCUNet color real PSNR, con salida en color.
- Matting de imagen (alpha matte de alta calidad) con ViTMatte small composition-1k, adecuado para objetos con detalles finos como pelo.
- Eliminación de fondo / segmentación de sujeto con RMBG-1.4 (referenciado upstream, no alojado).
- Ejecución portable mediante ONNX, sin dependencia obligatoria de PyTorch en tiempo de inferencia.
- Verificación de integridad de pesos por hash SHA-256 antes de cargar el modelo.
- No soporta generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni capacidades multilingües: no aplica a este tipo de modelos.

## Casos de uso

- Restauración de fotografías antiguas o escaneos: aplicar SCUNet para reducir ruido y compresión, seguido de Real-ESRGAN x4plus para aumentar resolución y GFPGAN v1.4 para recuperar rasgos faciales; el orden y la cadena son reproducibles gracias al manifiesto con hashes.
- Reimpresión y ampliación para soportes físicos: usar Real-ESRGAN x2plus cuando se parte de una imagen ya razonablemente nítida y solo se necesita duplicar resolución sin forzar un factor x4 que introduzca artefactos.
- Recuperación de retratos en fotos de grupo: GFPGAN v1.4 está pensado específicamente para caras pequeñas o degradadas dentro de imágenes más grandes, un escenario típico de fotografía familiar antigua.
- Composición y cambio de fondo en producción gráfica: ViTMatte small composition-1k proporciona un matte con canal alfa que permite recortar objetos con bordes complejos (pelo, tejidos) y recolocarlos sobre un fondo nuevo.
- Automatización de fondo blanco para catálogo de producto: RMBG-1.4 genera la máscara del sujeto, pero su licencia de BRIA es no comercial, así que solo es válido en proyectos internos, investigación o uso personal.
- Pipeline de escritorio offline con verificación de integridad: al estar en ONNX y acompañado de `manifest.json`, el conjunto se puede empaquetar en una aplicación que descargue pesos, compruebe SHA-256 y ejecute en CPU o GPU mediante ONNX Runtime sin depender de PyTorch.
- Preprocesado de datasets de visión por computador: limpieza y sobre-resolución de imágenes de entrenamiento antes de alimentar un pipeline de detección o segmentación, manteniendo fija la versión de cada modelo mediante el hash registrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El único mecanismo de validación documentado es la comprobación de paridad numérica frente a PyTorch en el proceso de exportación (`scripts/export-and-quantize.py`), que certifica equivalencia de salida, no calidad perceptual ni velocidad.

## Requisitos de hardware

- El repositorio completo en FP32 ocupa 0,7 GB en disco, repartidos entre seis modelos; el espacio en disco no es un cuello de botella en equipos actuales.
- VRAM estimada para inferencia: no disponible de forma oficial. Al tratarse de redes de restauración de imagen en FP32, el consumo depende críticamente de la resolución de entrada y del mosaico (tiling) aplicado, no solo del tamano del modelo; no hay cifras publicadas.
- GPU recomendadas: no disponible. Cualquier GPU con soporte de ONNX Runtime (CUDA EP, DirectML, TensorRT EP) o incluso CPU puede ejecutar estos modelos; la elección depende del throughput requerido.
- Cabe en GPU de consumo: previsiblemente sí para los seis modelos, dado el tamano total del repositorio, pero no hay confirmación oficial ni cifras de VRAM por modelo.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML, TensorRT, OpenVINO). No aplican vLLM, llama.cpp, Ollama ni TGI, que son stacks para modelos de lenguaje.
- Latencia y throughput: no disponible. En superresolución, el coste escala con el número de píxeles de salida, por lo que el factor x4 es sustancialmente más caro que el x2.

## Comparativa con modelos similares

Comparativa interna de los seis componentes incluidos:

| Modelo | Funcion | Salida | Licencia | Alojamiento |
|---|---|---|---|---|
| realesrgan-x4plus | Superresolucion | x4 | BSD-3-Clause | Este repositorio |
| realesrgan-x2plus | Superresolucion | x2 | BSD-3-Clause | Este repositorio |
| gfpgan-v1.4 | Restauracion facial | No disponible | Apache-2.0 con terminos de terceros (no comercial en la practica) | Este repositorio |
| scunet-color-real-psnr | Restauracion y denoising | Sin cambio de escala | Apache-2.0 | Este repositorio |
| vitmatte-small-composition-1k | Matting | Alpha matte | Apache-2.0 | Este repositorio |
| rmbg-1.4 | Eliminacion de fondo | Mascara | Licencia no comercial de BRIA | Upstream (commit fijado) |

Alternativa natural: los pesos PyTorch originales de cada proyecto upstream (Real-ESRGAN, GFPGAN, SCUNet, ViTMatte, RMBG). Frente a ellos, este repositorio ofrece formato ONNX listo para ONNX Runtime, verificación por hash y una única fuente de descarga, a cambio de depender de un tercero para las actualizaciones y de no publicar versiones cuantizadas.

Otras herramientas de escritorio de superresolución basadas en los mismos modelos upstream existen en el ecosistema, pero no se dispone en la informacion proporcionada de datos verificables para comparar parametros, contexto o rendimiento con ellas.

## Limitaciones y advertencias

- Licencia no comercial en dos componentes: GFPGAN v1.4 incorpora código derivado de StyleGAN2 bajo la NVIDIA Source Code License y código derivado de DFDNet bajo CC BY-NC-SA 4.0, por lo que el uso comercial no está autorizado. RMBG-1.4 está licenciado por BRIA solo para uso no comercial.
- RMBG-1.4 no se aloja en este repositorio: se referencia el repositorio de BRIA en un commit fijado. Si ese fichero desaparece o cambia de disponibilidad, el modo de alta calidad queda incompleto.
- Licencia agregada "per-model": no existe una licencia única para el repositorio. Cualquier uso en produccion exige revisar la licencia de cada componente por separado.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, repositorio creado y actualizado el mismo dia. No hay comunidad, issues ni garantia de mantenimiento a largo plazo.
- Ausencia de benchmarks: no se publican metricas de calidad perceptual ni comparaciones con alternativas, solo paridad numérica con PyTorch.
- Falta de documentacion tecnica: no se detallan arquitecturas, numero de parametros, datasets de entrenamiento ni resoluciones de entrada recomendadas.
- Sin variantes cuantizadas publicadas: quien necesite INT8 o FP16 tendra que generarlas con el script incluido y validar la perdida de calidad por su cuenta.
- Riesgo de artefactos propio de la familia: los modelos de superresolucion y restauracion facial de tipo generativo pueden producir detalles plausibles pero inexistentes (rasgos faciales inventados, texturas sinteticas). No hay evaluacion en este repositorio que lo cuantifique; en contextos forenses o documentales conviene tratar la salida como reconstruccion, no como evidencia.
- Ambito limitado a imagen: no sirve para texto, codigo, dialogo ni tareas de agente; no tiene contexto, tool calling ni capacidades multilingues.
- Idiomas no documentados: al no ser un modelo de lenguaje, el campo de idiomas no aplica, pero tampoco se documenta el comportamiento con texto dentro de la imagen (rotulos, documentos).

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/alegauss/photo-boost-models
- Proyecto PhotoBoost (aplicacion): https://github.com/Japode/photo-boost
- Licencia de Real-ESRGAN (BSD-3-Clause): https://github.com/xinntao/Real-ESRGAN/blob/master/LICENSE
- Licencia de GFPGAN: https://github.com/TencentARC/GFPGAN/blob/master/LICENSE
- Licencia de SCUNet (commit fijado): https://github.com/cszn/SCUNet/blob/52e440a80a655b01e0b41e9dd9bfe599bc11625e/LICENSE
- Model card de ViTMatte small composition-1k (commit fijado): https://huggingface.co/hustvl/vitmatte-small-composition-1k/blob/6a58ad7646403c1df626fbd746900aec7361ea1d/README.md
- Pesos ONNX de RMBG-1.4 en el repositorio de BRIA (commit fijado): https://huggingface.co/briaai/RMBG-1.4/resolve/2ceba5a5efaec153162aedea169f76caf9b46cf8/onnx/model.onnx
- Licencia de BRIA RMBG 1.4 (uso no comercial): https://bria.ai/bria-huggingface-model-license-agreement/
- Sitio comercial de PhotoBoost AI (producto independiente, no es este repositorio): https://photoboost.ai/
- Boost.photos (producto independiente de mejora de fotos): https://boost.photos/
