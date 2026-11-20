# apple/DepthPro2-S

## Resumen

Depth Pro 2 es un modelo de estimación de profundidad monocular métrica desarrollado por Apple, publicado en noviembre de 2026 junto con un informe técnico (arXiv:2611.26603). La variante S que nos ocupa es la más pequena de la familia, con 24,3 millones de parámetros y un peso de repositorio de 0,1 GB, lo que la convierte en una opción extremadamente ligera para inferencia en produccion. Resuelve el problema de obtener mapas de profundidad en metros a partir de una sola imagen o de un clip de vídeo, sin necesidad de calibración por escena.

La principal novedad frente a la generacion anterior es la consistencia temporal: el modelo procesa clips de vídeo de 32 fotogramas en una unica llamada a resolucion nativa y produce mapas de profundidad que no parpadean entre fotogramas. Ademas, se apoya en un estimador de distancia focal separado (`apple/DepthPro2-focal`, 23,5 M de parámetros) que permite trabajar con imagenes sin metadatos EXIF.

Es relevante ahora porque demuestra que un modelo de 24 M de parámetros puede alcanzar 347 fps en VGA sobre una NVIDIA B200 y mantener 44,8 fps en 1080p, con un pico de memoria de 8 GiB. Eso abre la puerta a profundidad métrica en tiempo real en pipelines de vídeo, robótica o realidad aumentada, aunque su licencia restringe el uso a investigación no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de estimación de profundidad; librería `depth-pro-2`) |
| Parametros totales | 24.310.497 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa clips de 32 fotogramas) |
| Tipos de cuantizacion | no disponible (el model card solo documenta bfloat16) |
| Idiomas soportados | no disponible (tarea de visión; no procesa texto) |
| Licencia | Apple Machine Learning Research Model License (apple-amlr), solo investigación no comercial |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El model card no detalla la arquitectura interna más allá de que se trata de un modelo de estimación de profundidad monocular métrica con soporte de vídeo y que se distribuye a través de la librería propia `depth-pro-2`. El repositorio ocupa 0,1 GB y los pesos están en safetensors, lo que sugiere un diseno compacto y probablemente una red convolucional o un transformer ligero, pero no se especifica en la informacion proporcionada.

Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon técnicas de RLHF o DPO (poco probables en una tarea de regresion densa como esta). La innovacion técnica destacable que si aparece en el model card es la consistencia temporal en vídeo: el modelo procesa 32 fotogramas en una sola llamada y a resolucion nativa, lo que evita el flickering típico de aplicar un modelo por imagen. Tambien se menciona un estimador de distancia focal independiente que se carga junto al modelo de profundidad.

## Capacidades

- Estimación de profundidad monocular métrica: devuelve un mapa de profundidad en metros con forma `(H, W)` a partir de una imagen RGB.
- Estimación de profundidad en vídeo: procesa clips de 32 fotogramas en una unica llamada manteniendo consistencia temporal.
- Estimación de distancia focal: mediante el modelo auxiliar `apple/DepthPro2-focal` (23,5 M de parámetros), para imagenes o vídeos sin focal EXIF.
- Soporte de resoluciones variables: desde VGA (640×480) hasta 4K, con 720p y 1080p en 16:9.
- Uso de focal EXIF cuando está disponible (`f_px`) y fallback al estimador cuando no lo está.
- Inferencia en bfloat16 y modo eager de PyTorch (sin compilacion) segun los benchmarks publicados.
- No soporta tool calling, agentes, texto ni razonamiento multimodal: es un modelo puramente de visión y regresion densa.

## Casos de uso

- Reconstruccion 3D y fotogrametria: el mapa de profundidad métrica en metros permite alimentar pipelines deStructure-from-Motion o de nubes de puntos sin reescalado manual, gracias a que la salida ya está en unidades físicas.
- Vídeo en tiempo real para robótica: con 44,8 fps en 1080p sobre una B200 y 8 GiB de pico, se puede integrar en bucles de percepcion de robots móviles o drones que necesitan profundidad densa por fotograma.
- Realidad aumentada y oclusion: la consistencia temporal en clips de 32 fotogramas evita el parpadeo al superponer objetos virtuales sobre vídeo en directo, algo crítico en aplicaciones de AR móvil.
- Edicion de vídeo y postproduccion: generacion de mapas de profundidad para desenfoque selectivo, rotoscopia o composicion, con la ventaja de que el modelo procesa el clip completo en una sola pasada.
- Analitica de escenas y conteo de personas: la profundidad métrica permite estimar distancias reales a objetos detectados, util para aforo, seguridad o analisis de flujos en retail.
- Automocion y ADAS de bajo coste: como modulo de profundidad auxiliar en vehiculos o simuladores, donde el presupuesto de computo es limitado y un modelo de 24 M de parámetros es viable en GPUs embebidas.
- Fotografia computacional: desenfoque de fondo basado en profundidad real (no estimada heuristicamente) en apps de camara, usando el estimador de focal cuando la imagen no trae EXIF.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los de throughput y memoria en una NVIDIA B200, en bfloat16 y PyTorch eager, procesando un clip de 32 fotogramas a resolucion nativa:

| Resolucion | Throughput (fps) | Pico de memoria (GiB) |
|---|---:|---:|
| VGA (640×480) | 347,0 | 1,9 |
| 720p (16:9) | 143,9 | 3,8 |
| 1080p (16:9) | 44,8 | 8,0 |
| 4K (16:9) | 3,6 | 31,9 |

No se han publicado resultados de benchmarks de calidad (como RMSE, δ1 o AbsRel) en la informacion disponible, ni comparaciones con otros modelos de profundidad.

## Requisitos de hardware

- VRAM estimada: 1,9 GiB en VGA, 3,8 GiB en 720p, 8,0 GiB en 1080p y 31,9 GiB en 4K, medidos como pico reservado por PyTorch en una B200.
- GPU recomendadas: NVIDIA B200 para los datos publicados; por el perfil de memoria, una RTX 4090 (24 GB) cubre hasta 1080p con holgura y se queda corta en 4K.
- Cabe en GPU de consumo: sí para VGA, 720p y 1080p en tarjetas con 8 GB o más (por ejemplo, RTX 3060 Ti, RTX 4060, RTX 4070). Para 4K se necesita una GPU de 32 GB o más, lo que excluye las consumer actuales.
- Opciones de despliegue: la librería oficial `depth-pro-2` (instalable via `pip install "git+https://github.com/apple-aiml-research/ml-depth-pro-2"`), con carga de pesos mediante `safetensors` y `huggingface_hub`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión de este tipo).
- Latencia y throughput: 347 fps en VGA, 143,9 fps en 720p, 44,8 fps en 1080p y 3,6 fps en 4K sobre B200 en bfloat16 sin compilacion.

## Comparativa con modelos similares

No se dispone de datos de otros modelos de profundidad monocular métrica en la informacion proporcionada, por lo que no es posible establecer una comparativa con cifras verificables.

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DepthPro2-S (apple) | 24,3 M | clips de 32 fotogramas, hasta 4K | 347 fps VGA / 44,8 fps 1080p en B200 | apple-amlr (solo investigación) | Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia restrictiva: la Apple Machine Learning Research Model License permite unicamente investigación científica no comercial y desarrollo académico. Cualquier uso comercial requiere licencia aparte.
- Sin datos de sesgos: el model card no documenta sesgos conocidos ni evaluación de equidad, lo que impide valorar su comportamiento en escenas o demografias subrepresentadas.
- Riesgo de alucinacion de profundidad: como todo modelo monocular, puede producir mapas plausibles pero incorrectos en superficies reflectantes, transparentes, texturas repetitivas o escenas con iluminacion extrema.
- Dependencia de la focal: sin EXIF ni el estimador `DepthPro2-focal`, la escala métrica puede degradarse; el estimador auxiliar anade 23,5 M de parámetros y memoria adicional.
- Limitacion de entrada: el soporte de vídeo está fijado a clips de 32 fotogramas, sin que se documente el comportamiento con secuencias más largas o con cambios bruscos de escena.
- Resolucion 4K costosa: 31,9 GiB de pico de memoria la hacen inviable en GPUs de consumo.
- Sin soporte de texto ni multimodalidad: no es un modelo de lenguaje; no admite prompts, tool calling ni razonamiento.
- Idiomas: no aplica ni se documenta, al ser un modelo puramente visual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/apple/DepthPro2-S
- Repositorio GitHub: https://github.com/apple-aiml-research/ml-depth-pro-2
- Informe técnico (arXiv): https://arxiv.org/abs/2611.26603
- Pagina del proyecto: https://apple-aiml-research.github.io/ml-depth-pro-2/
- Familia completa de tamanos: https://huggingface.co/apple/DepthPro2
- Estimador de focal: https://huggingface.co/apple/DepthPro2-focal
- Licencia del modelo: https://github.com/apple-aiml-research/ml-depth-pro-2/blob/main/LICENSE_MODEL
