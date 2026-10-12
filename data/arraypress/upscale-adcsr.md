# arraypress/upscale-adcsr

## Resumen

AdcSR x4 es un super-resolutor de difusion de un solo paso, publicado en HuggingFace por el usuario arraypress como `arraypress/upscale-adcsr` y empaquetado en formato Core AI (`adcsr_x4_float32.aimodel`) para su ejecucion en Apple Silicon. Se trata de la republicacion sin cambios de la conversion comunitaria `mlboydaisuke/AdcSR-CoreAI`, que a su vez porta el modelo AdcSR presentado en CVPR 2025: una compresion por difusion adversarial de un super-resolutor basado en el UNet de Stable Diffusion 2.1, podado y reducido a una unica evaluacion del UNet.

Su particularidad es explicita y el propio autor la advierte: no se limita a reconstruir la senal de baja resolucion, sino que **anade detalle plausible que nunca existio** (textura en pelo, follaje, tejidos). Eso lo hace muy competitivo en imagenes generadas y fotografia casual, y desaconsejable para material donde la fidelidad es un requisito (pruebas, documentos, caras que deben reconocerse, mediciones). Por ese motivo, la herramienta `upscale` del mismo autor lo ofrece solo como modo opcional `--detail`, siendo SwinIR-L (`arraypress/upscale-swinir-l-real`) el modo por defecto.

El modelo opera por tiles de `128x128` píxeles y devuelve `512x512` (factor x4), con emparejamiento de color por tile ya incorporado. El checkpoint pesa aproximadamente 1,8 GB en float32 y solo funciona correctamente en esa precision: en float16 el UNet podado produce NaN en tiles lisos. El repositorio no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Super-resolucion por difusion de un solo paso (one-step); UNet podado derivado de Stable Diffusion 2.1 (AdcSR, compresion por difusion adversarial) |
| Parametros totales | no disponible (el autor no publica el recuento de parametros del UNet podado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen; entrada por tiles de 128x128) |
| Tipos de cuantizacion | solo float32; no se soporta float16 (produce NaN en tiles lisos) |
| Idiomas soportados | no aplica (modelo de imagen a imagen); sin campos de idioma en el repositorio |
| Licencia | Codigo y pesos de AdcSR: Apache-2.0. Derivado de Stable Diffusion 2.1: CreativeML Open RAIL++-M (24 de noviembre de 2022, © Stability AI), incluida la restriccion de uso del Anexo A. El tag del repositorio en HuggingFace indica `openrail++` |
| Formato de pesos | `.aimodel` (Core AI / Core ML, `adcsr_x4_float32.aimodel`), float32, ~1,8 GB |
| Entrada | `lr` `[1,3,128,128]` en rango `[-1,1]` |
| Salida | `sr` `[1,3,512,512]` en rango `[-1,1]` (factor x4, con emparejamiento de color por tile) |
| Pipeline | image-to-image (super-resolution) |

## Arquitectura y entrenamiento

AdcSR es un super-resolutor de difusion de un solo paso construido sobre el UNet de Stable Diffusion 2.1 mediante compresion por difusion adversarial (Adversarial Diffusion Compression), la tecnica presentada en el paper de CVPR 2025 del mismo nombre. El modelo resultante esta podado y condensado para que la generacion de alta resolucion se resuelva en una unica evaluacion del UNet, en lugar del proceso iterativo tipico de los modelos de difusion. La conversion a Core AI mantiene un unico archivo float32 de aproximadamente 1,8 GB con la entrada y la salida normalizadas en `[-1,1]` y el ajuste de color por tile horneado en el propio grafo.

No se dispone de informacion sobre el numero de tokens o imagenes de entrenamiento, la composicion del dataset, ni sobre si se aplicaron etapas de RLHF o DPO (no aplicables en un modelo de restauracion de imagen). Tampoco se detalla si hubo destilacion adicional mas alla de la compresion adversarial descrita. La model card indica que la paridad con la referencia PyTorch no pudo reverificarse: habria requerido `stabilityai/stable-diffusion-2-1-base`, que Stability AI retiro de Hugging Face, de modo que ni la exportacion desde cero ni una comparacion lado a lado fueron posibles. La unica verificacion disponible es la reportada por el conversor original (`mlboydaisuke/AdcSR-CoreAI`), que declara una similitud coseno de 1,000012 frente a la referencia.

## Capacidades

- Super-resolucion de imagen a imagen con factor de ampliacion x4 por tile, de `128x128` a `512x512`.
- Generacion de detalle sintetico plausible: textura de pelo, follaje, tejidos y superficies rugosas donde la imagen de entrada no aporta informacion.
- Emparejamiento de color por tile ya integrado, pensado para procesar imagenes grandes por parches sin costuras de color visibles.
- Robustez medida frente a degradaciones (desenfoque, ruido y compresion JPEG) en imagenes reales.
- Ejecucion en Apple Silicon mediante la libreria Core AI, sin dependencia de un runtime de difusion multi-paso.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente visual.
- No dispone de modo thinking, capacidades de audio ni procesamiento de lenguaje.
- No hay capacidades multilingues aplicables ni campos de idioma declarados.

## Casos de uso

- **Escalado de imagenes generadas por IA**: es el escenario donde el modelo rinde mejor (LPIPS 0,181 en el banco de pruebas del autor, el mejor de siete upscalers sobre imagenes generadas). Se usaria como paso final de un pipeline de text-to-image para subir de 1024 a 4096 píxeles antes de publicar o imprimir.
- **Produccion de assets para videojuegos y arte conceptual**: al inventar textura coherente en follaje, telas y superficies, resulta util para generar mapas de detalle de prototipado rapido donde la fidelidad literal no es critica.
- **Previsualizacion de impresion en gran formato**: partiendo de un render o una ilustracion, permite comprobar como quedaria una ampliacion a tamano poster, asumiendo que el detalle anadido es sintetico y no una recuperacion de informacion real.
- **Restauracion estetica de fotografias casuales danadas**: en el subconjunto con desenfoque, ruido y artefactos JPEG, el autor reporta el mejor LPIPS (0,262) de los siete modelos comparados, lo que lo hace adecuado para mejorar recuerdos familiares o fotos de movil.
- **Procesado por lotes en local sobre Mac**: con Core AI sobre un M3 Max, el autor mide 26,6 s para pasar de 1024 a 4096 píxeles en GPU, lo que permite montar un flujo offline de escalado sin enviar imagenes a servicios en la nube.
- **Aumento de resolucion previo a tecnicas de estilizado o inpainting**: al entregar una imagen x4 con detalle coherente, sirve como entrada de mayor calidad para pasos posteriores de edicion generativa, donde el detalle inventado se reinterpretara de todos modos.
- **Investigacion sobre super-resolucion por difusion de un solo paso**: al ser una implementacion de AdcSR en formato Core AI, resulta util para reproducir y comparar tecnicas de compresion adversarial frente a super-resolutores fieles tipo SwinIR.
- **Escenarios donde NO debe usarse**: analisis forense, documentacion de evidencias, digitalizacion de documentos, identificacion de personas y cualquier medicion sobre la imagen, porque el modelo introduce contenido que no estaba en el original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (PSNR, SSIM, MMLU u otros) en la informacion disponible mas alla de las mediciones LPIPS realizadas por el propio publicador. La model card no incluye comparaciones con modelos de super-resolucion de referencia mas alla del banco de siete upscalers ejecutado por el autor.

| Metrica | Resultado | Contexto |
|---|---|---|
| LPIPS (menor es mejor), imagenes generadas | 0,181 | Mejor de siete upscalers en el banco del autor |
| LPIPS, fotografias reales | 0,241 | Conjunto de cinco fotos de stock |
| LPIPS, reales con desenfoque, ruido y JPEG | 0,262 | Mejor resultado del banco en este subconjunto |
| PSNR | 3-4 dB por debajo de los upscalers fieles | No se publican valores absolutos; la caida es atribuida al detalle inventado |
| Tiempo de inferencia | 26,6 s para 1024 -> 4096 | Apple M3 Max, ejecucion en GPU |
| Paridad con la referencia PyTorch | Similitud coseno 1,000012 | Reportada por el conversor original, no reverificada por este repositorio |

## Requisitos de hardware

- Pesos en float32 con un peso de archivo de aproximadamente 1,8 GB; es necesario disponer de esa cantidad de memoria ademas del espacio para activaciones.
- Precision obligatoria float32: en float16 el UNet podado produce NaN en tiles lisos, por lo que no existe una ruta de despliegue en media precision.
- VRAM estimada para inferencia: no publicada oficialmente. A partir del tamano del checkpoint y del procesado por tiles de 128x128, se puede estimar un requisito en el entorno de 2-4 GB, lo que lo situaria al alcance de GPUs de consumo; se trata de una estimacion a partir del tamano de archivo, no de un dato del autor.
- Hardware de referencia: Apple Silicon. La unica medicion publicada se hizo en un M3 Max, con 26,6 s para una ampliacion de 1024 a 4096 píxeles.
- Rendimiento en GPUs NVIDIA, AMD o en CPU: no disponible.
- Despliegue: libreria Core AI (formato `.aimodel`) para Apple Silicon. Para la version original en PyTorch existe el repositorio de AdcSR. Frameworks como vLLM, llama.cpp, Ollama o TGI no aplican, ya que no se trata de un modelo de lenguaje.
- Throughput por lotes y latencia en otras plataformas: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Factor | Enfoque | Rendimiento (LPIPS) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AdcSR x4 (`arraypress/upscale-adcsr`) | Difusion de un solo paso sobre SD 2.1 podado | x4 | Inventa detalle | 0,181 en generadas; 0,241 en reales; 0,262 con degradaciones | Apache-2.0 (AdcSR) + CreativeML Open RAIL++-M (SD 2.1) | HuggingFace, formato Core AI |
| SwinIR-L (`arraypress/upscale-swinir-l-real`) | Super-resolucion fiel basada en transformer | x4 | Reconstruye, no inventa | No disponible en esta informacion; segun la model card, su PSNR supera a AdcSR en 3-4 dB | no disponible | HuggingFace |
| Referencia PyTorch de AdcSR | Difusion de un solo paso | x4 | Inventa detalle | Paridad declarada con la conversion Core AI (coseno 1,000012) | Apache-2.0 | GitHub (Guaishou74851/AdcSR) |

No se dispone de datos de parametros, contexto ni licencia de SwinIR-L en la informacion proporcionada, mas alla de que es el upscaler fiel por defecto de la herramienta `upscale` del mismo autor. No se han facilitado comparaciones con otras familias de super-resolucion (por ejemplo, modelos GAN de escalado) en la informacion disponible.

## Limitaciones y advertencias

- **Inventa detalle de forma deliberada**: la propia model card advierte que el modelo anade textura que no estaba en la imagen original. Esto invalida su uso en contextos donde la fidelidad es un requisito legal, cientifico o forense (evidencias, documentos, identificacion de caras, mediciones).
- **Riesgo de alucinacion visual**: el termino se aplica aqui en sentido literal; el detalle generado puede no corresponder a la realidad y no debe interpretarse como recuperacion de informacion.
- **PSNR inferior a los super-resolutores fieles**: entre 3 y 4 dB por debajo, precisamente por el detalle sintetico. Si la metrica objetivo es la fidelidad, no es la herramienta adecuada.
- **Sin cuantizacion posible**: float16 provoca NaN en tiles lisos, de modo que no se puede reducir el consumo de memoria por media precision ni desplegar en hardware con soporte limitado de float32.
- **Paridad no reverificada**: la comprobacion frente a la referencia PyTorch no pudo repetirse porque `stabilityai/stable-diffusion-2-1-base` ya no esta disponible en Hugging Face. La unica garantia es la declarada por el conversor original.
- **Licencia con restricciones heredadas**: la CreativeML Open RAIL++-M incluye el Anexo A con restricciones de uso que se transmiten a cualquiera que use o redistribuya el modelo. El uso comercial esta permitido dentro de esos limites, pero conviene revisarlos antes de integrarlo en un producto.
- **Procedencia del repositorio**: se trata de una republicacion sin cambios de una conversion de terceros, no de una exportacion propia del autor original de AdcSR. Conviene fijar el commit `39ae70aeebbe09b7cc2740c81bfc5fd71c084f41` si se necesita trazabilidad.
- **Sin adopcion verificable**: cero descargas y cero interacciones en el momento de redactar la ficha, por lo que no existe validacion independiente por parte de la comunidad.
- **Sin informacion de sesgos**: no hay datos publicados sobre sesgos demograficos o de contenido en la generacion de detalle.
- **Ambito limitado a imagen**: no procesa texto, audio ni secuencias; no admite tool calling ni razonamiento multi-paso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arraypress/upscale-adcsr
- Conversion Core AI de origen: https://huggingface.co/mlboydaisuke/AdcSR-CoreAI
- Repositorio y paper de AdcSR (CVPR 2025): https://github.com/Guaishou74851/AdcSR
- Super-resolutor fiel por defecto del mismo autor: https://huggingface.co/arraypress/upscale-swinir-l-real
- Modelo base retirado de HuggingFace (referencia de licencia y arquitectura): https://huggingface.co/stabilityai/stable-diffusion-2-1-base
