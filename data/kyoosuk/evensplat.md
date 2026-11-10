# kyoosuk/EvenSplat

## Resumen

EvenSplat es un modelo de reconstruccion y sintesis de vistas novedosas (novel view synthesis) desarrollado por Kyoosuk Hwang y Junyoung Kwon en la Universidad Nacional de Ciencia y Tecnologia de Seul (SeoulTech), como parte de un proyecto de fin de carrera (Capstone Design 2026). El modelo parte de dos imagenes sin poses conocidas (pose-free) y genera representaciones 3D Gaussian Splatting compactas, reduciendo el numero de Gaussianas por pixel entre un 25% y un 75% respecto a su modelo base NoPoSplat, manteniendo una calidad de render competitiva.

La contribucion principal es una estrategia de poda uniforme por celdas 2x2: se conserva la misma fraccion de Gaussianas en cada celda de pixel, descartando primero las de menor fiabilidad, y el modelo se reentrena con esa poda integrada en el bucle de entrenamiento (pruning in the loop). Esto reduce drasticamente el uso de memoria en render (de 167 MB a 87 MB al 50% de retencion) y el numero de Gaussianas (de 131K a 66K), lo que lo hace relevante para despliegue en entornos con recursos limitados.

Es un modelo feed-forward, sin optimizacion por escena, entrenado sobre RealEstate10K a resolucion 256x256. No es un modelo de lenguaje: es un modelo de vision 3D especializado en reconstruccion a partir de imagenes, por lo que las secciones habituales sobre contexto, idiomas o tool calling no aplican y se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Feed-forward 3D Gaussian Splatting (basada en NoPoSplat, que a su vez parte de pixelSplat, DUSt3R y CroCo) |
| Parametros totales | no disponible (el repo pesa 7.4 GB e incluye tres checkpoints de aproximadamente 2.45 GB cada uno) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de dos vistas de imagen a 256x256) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | MIT |
| Formato de pesos | checkpoints PyTorch (`.ckpt`), sin estado del optimizador |

## Arquitectura y entrenamiento

EvenSplat es un modelo feed-forward que predice Gaussianas 3D a partir de dos imagenes de entrada sin poses de camara conocidas. Hereda la arquitectura de NoPoSplat y la adapta mediante una poda estructurada: en cada celda de 2x2 pixeles se mantiene una fraccion fija de Gaussianas (25%, 50% o 75%), eliminando en primer lugar las de menor puntuacion de fiabilidad (r_filter). Los tres checkpoints publicados se obtuvieron por fine-tuning desde el checkpoint base `kyoosuk/noposplat-olp-rel-re10k` (`epoch_1-step_75000.ckpt`), durante 10K pasos a su ratio respectivo, con celdas 2x2, umbral r de 0.35, batch de 1 con 4 acumulaciones y learning rate 2e-5.

El entrenamiento y evaluacion se realizan sobre RealEstate10K (re10k), un dataset de secuencias de interiores inmobiliarios. La evaluacion reportada cubre el conjunto de test completo con 5.590 escenas evaluables a 256x256, usando duas vistas de contexto y alineacion de poses activada. La innovacion tecnica destacable es la poda uniforme por celda combinada con fine-tuning en el bucle, que permite reducir el numero de Gaussianas sin degradar significativamente PSNR, SSIM o LPIPS.

## Capacidades

- Sintesis de vistas novedosas (novel view synthesis) a partir de dos imagenes sin poses.
- Reconstruccion 3D implicita mediante Gaussian Splatting con numero controlado de Gaussianas por pixel.
- Control explicito del compromiso entre calidad y compactitud mediante tres ratios de retencion (25%, 50%, 75%).
- Inferencia feed-forward en una sola pasada, sin optimizacion por escena.
- Reduccion de memoria de render (de 167 MB a 87 MB al 50% de retencion).
- No dispone de generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni capacidades multilingues: es exclusivamente un modelo de vision 3D.

## Casos de uso

- Reconstruccion 3D de interiores a partir de fotografias: el modelo genera representaciones Gaussianas de escenas inmobiliarias a partir de dos imagenes, util para visualizacion de espacios en portales de compraventa o alquiler.
- Renderizado en dispositivos con memoria limitada: al retener el 50% de las Gaussianas, la memoria de render cae a 87 MB, lo que permite ejecutar la sintesis en GPUs de gama media o entornos embebidos.
- Prototipado rapido de pipelines de vision 3D: su naturaleza feed-forward y pose-free simplifica la integracion en sistemas que no dispongan de calibracion de camara.
- Generacion de contenido para turismo virtual: sintesis de vistas intermedias de espacios a partir de un par de fotografias, sin necesidad de captura multi-vista.
- Investigacion academica en compresion de representaciones 3D: los tres checkpoints permiten estudiar el compromiso calidad-compactitud de forma controlada y reproducible.
- Evaluacion comparativa de metodos de Gaussian Splatting: el modelo sirve como referencia de poda uniforme frente a metodos que retienen el 100% de las Gaussianas.
- Docencia en vision por computador: el repositorio incluye guias de metodo y reproduccion, lo que facilita su uso en practicas de reconstruccion 3D.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el conjunto de test completo de RealEstate10K (5.590 escenas evaluables), 256x256, dos vistas de contexto y alineacion de poses activada:

| Modelo | Gaussianas retenidas | Numero de Gaussianas | PSNR | SSIM | LPIPS |
|---|---|---|---|---|---|
| EvenSplat r25 | 25% | 33K | 24.62 | 0.817 | 0.184 |
| EvenSplat r50 | 50% | 66K | 25.01 | 0.829 | 0.169 |
| EvenSplat r75 | 75% | 98K | 25.26 | 0.837 | 0.161 |
| NoPoSplat (reportado) | 100% | 131K | 25.03 | 0.838 | 0.160 |

Al 50% de retencion, la memoria pico de render baja de 167 MB a 87 MB. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; la model card solo reporta memoria pico de render (167 MB con el 100% de Gaussianas y 87 MB al 50%).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el modelo es pequeno en memoria de render, pero no se especifican requisitos de VRAM de inferencia.
- Opciones de despliegue: el repositorio oficial proporciona scripts de evaluacion (`scripts/run_retention.py`) y descarga via `hf download`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | PSNR (re10k) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EvenSplat | no disponible | dos imagenes 256x256 sin poses | 25.01 (r50) | MIT | Hugging Face y GitHub |
| NoPoSplat | no disponible | dos imagenes sin poses | 25.03 | no disponible en la informacion | GitHub (cvg/NoPoSplat) |
| pixelSplat | no disponible | dos imagenes | no disponible | no disponible en la informacion | GitHub (dcharatan/pixelsplat) |

No se dispone de datos de benchmarks de pixelSplat ni de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente de vision 3D: no procesa texto, no razona, no genera codigo ni mantiene conversaciones.
- Evaluado unicamente sobre RealEstate10K (escenas de interiores inmobiliarios); el rendimiento en otros dominios (exteriores, objetos, rostros) no esta documentado.
- Resolucion de evaluacion limitada a 256x256, lo que puede ser insuficiente para aplicaciones de alta fidelidad.
- Los checkpoints estan pensados para evaluacion; para reentrenar hay que partir del checkpoint base `kyoosuk/noposplat-olp-rel-re10k`.
- El modelo base NoPoSplat y sus dependencias (pixelSplat, DUSt3R, CroCo) tienen sus propias condiciones de uso que deben verificarse por separado.
- Riesgo de artefactos en vistas sintetizadas fuera de la distribucion de entrenamiento; no se documentan sesgos especificos.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantias ni soporte; el repositorio registra 0 descargas y 0 likes en el momento de la consulta.
- No se publican datos sobre latencia, VRAM de inferencia ni compatibilidad con frameworks de despliegue estandar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kyoosuk/EvenSplat
- Checkpoint base: https://huggingface.co/kyoosuk/noposplat-olp-rel-re10k
- Repositorio de codigo: https://github.com/junyoung6215/EvenSplat
- Documentacion del metodo: https://github.com/junyoung6215/EvenSplat/blob/main/docs/METHOD.md
- Guia de reproduccion: https://github.com/junyoung6215/EvenSplat/blob/main/docs/REPRODUCE.md
- NoPoSplat (modelo base): https://github.com/cvg/NoPoSplat
- pixelSplat: https://github.com/dcharatan/pixelsplat
- DUSt3R: https://github.com/naver/dust3r
- CroCo: https://github.com/naver/croco
