# LeeYG/test_lact

## Resumen

`LeeYG/test_lact` es un checkpoint de investigación de síntesis de vistas noveles (novel-view synthesis, NVS) basado en la arquitectura LaCT (Large-Chunk Test-Time Training). Lo publica el usuario LeeYG y no es el checkpoint oficial del proyecto LaCT: se trata de un entrenamiento desde cero sobre el conjunto de datos DL3DV con una receta de vistas de contexto dispersas (2 a 6 vistas), a resolución 256×256. El modelo resuelve el problema de reconstruir y renderizar una escena a partir de un puñado de imágenes de entrada con sus cámaras asociadas, generando nuevas vistas desde posiciones arbitrarias.

La arquitectura es `LaCTLVSM` sin modificar, con configuración `lact_l24_d768_ttt2x`: 24 bloques transformer, dimensión 768 y 312,3 millones de parámetros en fp32. La innovación central de LaCT es el test-time training por bloques grandes, que adapta el modelo en tiempo de inferencia a la escena concreta. Este checkpoint concreto es relevante como referencia reproducible de un entrenamiento barato (unas 24 horas en una B300) y como punto de partida para experimentos con pocas vistas, pero sus métricas quedan muy por debajo de las del modelo oficial del paper.

El repositorio incluye pesos, configuración de modelo y de entrenamiento, el wrapper de codificación/decodificación de cámaras, el log completo de entrenamiento y los resultados de evaluación cada 5.000 iteraciones. Todo ello bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LaCTLVSM (transformer con test-time training por bloques, `lact_l24_d768_ttt2x`) |
| Parametros totales | 312.298.056 (~312,3 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (acepta 2-6 vistas de contexto de 256×256) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32; inferencia con autocast bf16) |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, fp32) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura `LaCTLVSM` del repositorio `a1600012888/LaCT` (commit `a648340`), un transformer de 24 bloques con dimensión 768 que implementa test-time training sobre bloques grandes de contexto. La entrada son imágenes de contexto con sus parámetros intrínsecos (`fxfycxcy` en píxeles a 256×256) y matrices de cámara-a-mundo (`c2w`, convención OpenCV); la salida son imágenes renderizadas de 256×256 con valores en [0, 1]. El wrapper `encoder_decoder_lact.py` traduce las entradas de cámara del código de entrenamiento (w2c + K) al formato que espera LaCT.

El entrenamiento se hizo desde cero sobre DL3DV, usando la versión `images_8` (480×270, distorsionada, tal como se publica), redimensionada y recortada a 256×256. Cada muestra contiene entre 2 y 6 vistas de contexto (pesos 2:8, 3:2, 4:8, 5:2, 6:8) más 8 vistas objetivo; las vistas de contexto se separan 10-20 fotogramas con jitter, y los objetivos se muestrean dentro del intervalo de contexto extendido un espaciado por cada lado. Se optimizó con AdamW (lr 4e-4, betas 0,9/0,95, weight decay 0,05), warmup de 3.000 iteraciones y decaimiento coseno hasta 65.000, con recorte de gradiente 3,0. La pérdida combina L2 más 0,5 × pérdida perceptual. El entrenamiento usó una única GPU B300 con autocast bf16, checkpointing de activaciones en los primeros 12 bloques y `torch.compile` por bloque, durante aproximadamente 24 horas. Las poses se normalizan re-centrando la escena en la primera cámara de contexto y dividiendo las traslaciones por 1,35 × la máxima distancia de las cámaras de contexto a la primera.

## Capacidades

- Síntesis de vistas noveles a partir de 2 a 6 imágenes de contexto con sus cámaras, renderizando vistas objetivo en 256×256.
- Reconstrucción de escenas 3D implícita mediante test-time training, adaptándose a cada escena en inferencia.
- Entrada multimodal geométrica: imágenes RGB más intrínsecos de cámara (`fxfycxcy`) y extrínsecos (`c2w`).
- Renderizado por lotes de múltiples vistas objetivo (`[B, T, 3, 256, 256]`).
- Inferencia en bf16 con `torch.autocast`; compatible con `torch.compile` (la primera llamada compila).
- No soporta tool calling, agentes, generación de texto, código, matemáticas ni audio: es un modelo puramente visual y geométrico.
- Capacidades multilingües: no aplica.

## Casos de uso

- Reconstrucción de escenas a partir de capturas móviles: con 2-6 fotos de un entorno y sus poses, el modelo renderiza vistas intermedias para visualización o revisión, útil cuando no se dispone de un rig de captura denso.
- Prototipado de pipelines de NVS en investigación: sirve como checkpoint de referencia para comparar recetas de vistas dispersas frente al modelo oficial de LaCT, con resultados de evaluación cada 5.000 iteraciones ya incluidos.
- Generación de datos sintéticos para aumento de datasets: renderizar vistas adicionales de una escena a partir de pocas imágenes puede ampliar conjuntos de entrenamiento de tareas de percepción, aunque con la calidad limitada que indican sus métricas.
- Pruebas de integración de LaCT: al incluir configuración, wrapper de cámaras y log de entrenamiento, permite validar el pipeline completo de `LaCTLVSM` en una sola GPU antes de escalar.
- Experimentos de test-time training: base para estudiar cómo afecta el número de vistas de contexto (2, 4, 6) a la calidad del renderizado, con curvas PSNR/SSIM/LPIPS ya medidas.
- Docencia y reproducción de resultados: el repositorio documenta la receta completa (datos, hiperparámetros, hardware y normalización de poses), lo que facilita reproducir el entrenamiento en entornos académicos.
- Evaluación comparativa de métodos de NVS: punto de partida para medir la brecha entre un entrenamiento de bajo presupuesto y los checkpoints oficiales del paper.

## Benchmarks y rendimiento

Resultados sobre 140 escenas del benchmark DL3DV a 256×256, con índices fijos de vistas de contexto y objetivo. "Nv" indica N vistas de contexto.

| iter | 2v PSNR | 4v PSNR | 6v PSNR | 2v / 4v / 6v SSIM | 2v / 4v / 6v LPIPS |
|---|---|---|---|---|---|
| 5k | 16,14 | 17,67 | 18,24 | 0,416 / 0,440 / 0,448 | 0,665 / 0,642 / 0,637 |
| 25k | 16,86 | 19,05 | 20,02 | 0,464 / 0,526 / 0,556 | 0,533 / 0,453 / 0,421 |
| 45k | 17,42 | 20,20 | 21,24 | 0,493 / 0,584 / 0,619 | 0,491 / 0,381 / 0,345 |
| 65k | 17,65 | 20,68 | 21,78 | 0,504 / 0,607 / 0,644 | 0,475 / 0,358 / 0,320 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. El propio autor advierte que estas cifras son muy inferiores a las del paper de LaCT, cuyos modelos de escena usan 32-64 vistas de entrada, batch 768 y mucho más cómputo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 312,3 M parámetros en fp32, los pesos ocupan aproximadamente 1,25 GB; en bf16, unos 0,62 GB. A ello hay que sumar activaciones y el coste del test-time training por bloques, que eleva el consumo real por encima del de un transformer del mismo tamaño.
- GPU recomendadas: el entrenamiento se hizo en una NVIDIA B300. Para inferencia se espera que funcione en GPUs con soporte de bf16 y `torch.compile`; no se documentan requisitos mínimos.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible. El tamaño de pesos sugiere que cabría en GPUs de consumo con suficiente VRAM, pero el pico de memoria durante el test-time training no está documentado.
- Opciones de despliegue: el código de referencia es PyTorch puro (`LaCTLVSM` del repositorio LaCT, commit `a648340`) con `torch.compile`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La primera llamada incluye la compilación de `torch.compile`.

## Comparativa con modelos similares

| Modelo | Parametros | Vistas de entrada | Resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `LeeYG/test_lact` (este) | 312,3 M | 2-6 | 256×256 | MIT | Hugging Face |
| LaCT oficial (checkpoints de escena del paper) | no disponible | 32-64 | no disponible | MIT (código) | Repositorio LaCT |
| Alternativas NVS de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de los checkpoints oficiales de LaCT ni de otros modelos comparables en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- No es el checkpoint oficial de LaCT: sus métricas (PSNR 17,65 con 2 vistas, 21,78 con 6 vistas) están muy por debajo de las del paper, según advierte el propio autor.
- Entrenado solo a 256×256 sobre DL3DV `images_8` (480×270, distorsionada); la generalización a otras resoluciones, dominios o datasets no está validada.
- Requiere replicar exactamente la normalización de poses del entrenamiento (re-centrado en la primera cámara y división por 1,35 × distancia máxima); un error en este paso degrada el renderizado.
- Solo acepta 2-6 vistas de contexto; no está diseñado para configuraciones densas de 32-64 vistas como los modelos oficiales.
- Riesgo de artefactos y alucinación geométrica en regiones no observadas de la escena, inherente a la síntesis de vistas noveles con entradas dispersas.
- Sesgos de dominio: al entrenarse únicamente con DL3DV, puede comportarse peor en escenas con características muy distintas (interiores, objetos aislados, iluminación extrema).
- Licencia MIT: permite uso comercial, pero el código base de LaCT conserva su propia licencia MIT (`LICENSE-LaCT`); conviene revisar las condiciones del repositorio original.
- No incluye estado del optimizador ni receta de reanudación más allá del log y las configuraciones.
- No apto para tareas de lenguaje, código o agentes; cualquier uso fuera de NVS carece de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LeeYG/test_lact
- Repositorio LaCT: https://github.com/a1600012888/LaCT
- Commit de referencia de LaCT: `a648340` (https://github.com/a1600012888/LaCT/tree/a648340)
