# SharadhNaiduTrains/resenh

## Resumen

resenh es un sistema de restauracion y mejora de imagenes en condiciones de baja luminosidad desarrollado por Sharadh Naidu (equipo V-Max, T46) y publicado bajo licencia MIT. No se trata de un modelo de lenguaje, sino de un pipeline de vision por computador que combina un procesado clasico adaptativo (Retinex, CLAHE y denoising con preservacion de bordes) con una red neuronal Retinexformer de 1,6 millones de parametros, fusionando ambas ramas mediante un controlador de calidad que decide la mezcla foto a foto.

El problema que aborda es la restauracion de fotografias tomadas con poca luz, donde el ruido, la perdida de detalle en sombras y el desequilibrio cromatico degradan la imagen. La propuesta es relevante porque no depende de un unico checkpoint: ofrece pesos especificos por benchmark (LOL-v1, LOL-v2 Real, LOL-v2 Synthetic y LSRW) ademas de un modelo general hibrido, y exporta los pesos a ONNX (opset 17, tamano dinamico) para ejecucion en navegador mediante ONNX Runtime Web.

El repositorio ocupa 0,1 GB, incluye los checkpoints oficiales de Retinexformer (Cai et al., ICCV 2023) como respaldo y verifica la integridad de cada archivo mediante SHA-256. La latencia declarada es de 0,49 s para la red y 1,9 s para el pipeline hibrido completo sobre una foto de 1 MP en una RTX 4070 para portatiles, y unos 6 s en navegador con WebGPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Retinexformer (transformer de restauracion basado en Retinex) con extension de stem para priors clasicos; pipeline hibrido con rama clasica adaptativa |
| Parametros totales | 1,6 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen a imagen) |
| Tipos de cuantizacion | no disponible; exportacion ONNX (opset 17, tamano dinamico) para ONNX Runtime Web |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | .pth (PyTorch) y .onnx (ONNX) |

## Arquitectura y entrenamiento

La red principal es Retinexformer, un transformer de restauracion de imagenes que modela la iluminacion segun el marco Retinex. Sobre esta arquitectura, resenh anade una extension de stem inicializada a cero que inyecta dos priors calculados por la rama clasica: el mapa de iluminacion y la salida Retinex. El pipeline completo ejecuta en paralelo la rama clasica (Retinex, CLAHE y denoising con preservacion de bordes) y la red, y un controlador de calidad pondera la fusion de ambas por imagen. El modelo general se entreno sobre LOL y LSRW deduplicados, con pesos adicionales ajustados por benchmark.

El entrenamiento emplea una perdida compuesta por Charbonnier, 0,2·(1−SSIM) y 0,02 de perdida perceptual VGG-19, envuelta en la denominada GT-mean loss. La receta incluye parches progresivos (128→256→384), EMA con factor 0,999, aumento de datos con gamma y ruido, y particiones de validacion agrupadas por escena para evitar fugas entre train y validacion. Los pesos ajustados por benchmark usan la GT-mean loss y mejoran SSIM y LPIPS a costa de un PSNR plano mas bajo.

## Capacidades

- Mejora de imagenes con baja iluminacion y restauracion de detalle en sombras.
- Reduccion de ruido con preservacion de bordes mediante la rama clasica.
- Correccion de color e iluminacion basada en el modelo Retinex.
- Fusion adaptativa por imagen: el controlador de calidad selecciona la mezcla entre rama clasica y red.
- Ejecucion en GPU (PyTorch) y en navegador (ONNX Runtime Web con WebGPU).
- Pesos especializados por benchmark: LOL-v1, LOL-v2 Real, LOL-v2 Synthetic y LSRW, ademas de un modelo general hibrido.
- Procesado de imagenes de tamano dinamico en la exportacion ONNX.
- Verificacion de integridad de pesos mediante SHA-256 fijado en el paquete.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo estrictamente de imagen a imagen.

## Casos de uso

- Fotografia nocturna en aplicaciones moviles: el modelo puede integrarse mediante ONNX Runtime para mejorar capturas con poca luz en el dispositivo, con un coste de unos 6 s por imagen en navegador con WebGPU o menos en GPU dedicada.
- Postprocesado de fotografia profesional: la rama hibrida permite recuperar sombras y reducir ruido en RAW convertidos a 8 bits, con control por imagen gracias al controlador de calidad.
- Videovigilancia y camaras de seguridad: la mejora de imagenes con baja luminosidad facilita la identificacion de objetos y personas en grabaciones nocturnas, usando los pesos generales entrenados sobre LOL y LSRW.
- Preprocesado para pipelines de vision artificial: las imagenes restauradas pueden alimentar detectores o clasificadores que rinden peor con poca luz, aprovechando la mejora de PSNR observada en LSRW (19,26 dB frente a 17,19 dB de la red sola).
- Restauracion de archivos fotograficos: digitalizacion de negativos o fotos antiguas subexpuestas, con la rama clasica como respaldo cuando la red no aporta mejoras.
- Demostraciones web interactivas: la exportacion ONNX permite ofrecer una demo en el navegador sin backend, como el sitio resenh.sharadh.blog.
- Investigacion en restauracion de imagenes: los checkpoints por benchmark y el harness de evaluacion reproducible facilitan la comparacion con otros metodos sobre LOL-v1, LOL-v2 y LSRW.

## Benchmarks y rendimiento

PSNR (dB) sobre imagen de 8 bits guardada, sin correccion de brillo ground-truth ni ajuste por imagen:

| PSNR (dB) | LOL-v1 (15) | LOL-v2-Real (100) | LOL-v2-Syn (100) | LSRW test (50) |
|---|---|---|---|---|
| Rama clasica | 16,75 | 17,44 | 16,83 | 16,15 |
| Retinexformer, solo red | 25,15 | 22,79 | 25,67 | 17,19 |
| resenh hibrido | 25,13 | 22,82 | 25,35 | 19,26 |

Metricas completas sobre LOL-v2-Real test:

| LOL-v2-Real test | PSNR | SSIM | LPIPS | NIQE |
|---|---|---|---|---|
| Rama clasica | 17,44 | 0,724 | 0,417 | 4,83 |
| Retinexformer, solo red | 22,79 | 0,840 | 0,171 | 3,59 |
| resenh hibrido | 22,82 | 0,840 | 0,171 | 3,59 |

Los pesos ajustados por benchmark mejoran SSIM y LPIPS (LOL-v2-Real: 0,852 / 0,139) pero obtienen un PSNR plano inferior (20,82 dB). Latencia declarada: 0,49 s para la red y 1,9 s para el hibrido completo en una foto de 1 MP sobre RTX 4070 para portatiles; unos 6 s en navegador con WebGPU.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 1,6 M de parametros el modelo es muy ligero (del orden de decenas de MB en FP32), por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: RTX 4070 (latencia medida por el autor); cualquier GPU con soporte CUDA es suficiente dada la baja huella del modelo.
- Cabe en GPU consumer: si, incluidas GPU de gama baja y portatiles; tambien en navegador con WebGPU mediante ONNX Runtime Web.
- Opciones de despliegue: paquete Python `resenh` (extra `[dl]`), PyTorch, ONNX Runtime Web y ejecucion en navegador.
- Latencia y throughput: 0,49 s (red) y 1,9 s (hibrido) por imagen de 1 MP en RTX 4070 para portatiles; unos 6 s en navegador con WebGPU. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PSNR LOL-v2-Real | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| resenh (hibrido) | 1,6 M | no aplica | 22,82 dB | MIT | Hugging Face, PyPI, ONNX |
| Retinexformer (oficial) | 1,6 M | no aplica | 22,79 dB | MIT | Checkpoints incluidos en resenh |
| Rama clasica (Retinex + CLAHE) | no aplica | no aplica | 17,44 dB | MIT (dentro de resenh) | Incluida en el paquete |

No se dispone de datos de otros modelos comparables (por ejemplo, variantes de retinex o redes de mejora de baja luz como Zero-DCE) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de vision de proposito especifico: no procesa texto, audio ni otras modalidades.
- El PSNR del hibrido es practicamente identico al de la red sola en LOL-v1 y LOL-v2-Syn; la mejora sustancial solo aparece en LSRW (19,26 frente a 17,19 dB).
- Los pesos ajustados por benchmark priorizan SSIM y LPIPS sobre PSNR plano, lo que puede no ser deseable en aplicaciones que midan fidelidad por PSNR.
- La evaluacion se realiza sobre imagenes de 8 bits guardadas; no hay correccion de brillo ground-truth ni ajuste por imagen, lo que limita la comparabilidad con otros trabajos.
- Riesgo de artefactos o sobreprocesado en escenas que no sean de baja luminosidad, dado el diseno especifico del pipeline.
- No se han publicado datos sobre sesgos demograficos o de contenido; el modelo opera sobre imagenes sin semantica explicita.
- Licencia MIT: permite uso comercial, pero los pesos de Retinexformer pertenecen a sus autores (tambien MIT) y deben conservarse sus avisos.
- El pipeline hibrido es mas lento que la red sola (1,9 s frente a 0,49 s por imagen de 1 MP en la GPU de referencia).
- Creado y actualizado en noviembre de 2026; con 37 descargas y 0 likes, la validacion por la comunidad es practicamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SharadhNaiduTrains/resenh
- Repositorio del proyecto: https://github.com/SharadhNaidu/resen
- Informe tecnico (PDF): https://github.com/SharadhNaidu/resen/blob/main/report/resenh_report_T46.pdf
- Tablas de evaluacion: https://github.com/SharadhNaidu/resen/blob/main/eval_P1_T46.md
- Ablation de pesos ajustados: https://github.com/SharadhNaidu/resen/blob/main/docs/ablation.md
- Demo en navegador: https://resenh.sharadh.blog
- Retinexformer (paper original, Cai et al., ICCV 2023): no disponible en la informacion proporcionada
