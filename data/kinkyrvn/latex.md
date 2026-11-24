# kinkyrvn/latex

## Resumen

Latex v1 es un modelo de segmentación de piel en tiempo real desarrollado por KinkyRaven, un estudio independiente centrado en herramientas de control parental y moderación de contenido. El modelo genera una máscara binaria de probabilidad que identifica qué píxeles de una imagen corresponden a piel humana, con el objetivo de permitir el desenfoque o censura selectiva de zonas corporales en aplicaciones de uso cotidiano como videojuegos, reproducción de vídeo o uso general del ordenador. Es el componente de segmentación de piel que emplea la aplicación Sub Control del mismo autor.

Técnicamente, Latex v1 no es un modelo de lenguaje ni un transformer: es una red convolucional de segmentación semántica construida sobre backbones MobileNetV4 de la librería `timm`, exportada a ONNX para inferencia ligera. Se distribuye en cinco niveles de tamaño (tiny, small, medium, big, huge/epic/unfathomable) que comparten arquitectura pero varían en resolución de entrada y backbone, desde MobileNetV4 conv small a conv large. El repositorio ocupa 4,4 GB e incluye variantes fp16 y fp32, además de tres "mixes" de entrenamiento según el tipo de contenido (fotos reales, dibujos anime y arte antropomórfico).

Su relevancia actual radica en la eficiencia: modelos de 2,6 MB (tiny fp16) capaces de segmentar piel a resoluciones de hasta 3840x2176 en tiempo real, lo que permite desplegarlo en hardware de consumo sin GPU dedicada. La licencia es propietaria (KinkyRaven Latex License 1.0) y el autor comercializa una versión superior, Latex 2, con mejor rendimiento en detalles intrincados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN de segmentación (encoder MobileNetV4 + cabeza de segmentación), exportada a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantización | fp16 y fp32 (pesos); no se documentan otras cuantizaciones |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | KinkyRaven Latex License 1.0 (propietaria, "other") |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

Latex v1 emplea backbones MobileNetV4 en configuración convolucional, finetuneados desde los checkpoints de `timm` (`mobilenetv4_conv_small.e2400_r224_in1k`, `mobilenetv4_conv_medium.e500_r256_in1k` y `mobilenetv4_conv_large.e600_r384_in1k`). Sobre el encoder se añade una cabeza de segmentación que produce un mapa de probabilidad por píxel (1x1xHxW, valores 0-1). La entrada es RGB normalizada a 0-1 y letterboxed con gris 114; la salida es una máscara de piel con umbral 0,5. Los pesos se exportan a ONNX en fp16 y fp32, con entrada y salida en float32 incluso en la variante fp16.

El entrenamiento se realizó sobre tres "mixes" de datos: `real` (fotos, fotogramas de juegos y capturas de pantalla), `real_anime` (añade personas dibujadas) y `all` (añade arte antropomórfico, donde el pelaje cuenta como piel). No se documenta el número de tokens ni el volumen exacto del dataset, ni si hubo etapas de RLHF/DPO (no aplica en segmentación). La innovación destacable es la escalabilidad por resolución: los tiers big, huge, epic y unfathomable comparten los mismos pesos de MobileNetV4 conv large, variando únicamente la resolución de entrada (desde 1024 hasta 3840x2176), lo que permite reutilizar un único modelo para distintos niveles de detalle.

## Capacidades

- Segmentación semántica de piel por píxel con salida de probabilidad continua (0-1).
- Detección de labios, lenguas, ojos, uñas, tatuajes, pezones, genitales y vello púbico como piel; el pelo, la ropa y las joyas no se consideran piel.
- Funcionamiento en tiempo real en resoluciones de hasta 4K (3840x2176) con los pesos de big.
- Tres variantes de contenido: fotos reales, dibujos anime y arte antropomórfico.
- Inferencia ligera vía ONNX Runtime, sin necesidad de GPU.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).

## Casos de uso

- Censura selectiva en videojuegos: el modelo procesa fotogramas en tiempo real y desenfoca las zonas de piel detectadas, integrándose en un pipeline de captura de pantalla con ONNX Runtime y umbral 0,5.
- Moderación de contenido en plataformas: permite filtrar o marcar imágenes con desnudez parcial o total usando la máscara de piel como señal previa, con la variante `real` o `all` según el contenido.
- Control parental en reproducción de vídeo: el modelo se ejecuta por fotograma y aplica un desenfoque dinámico sobre la piel, con la variante `real` y el tier small (14,6 MB fp16) para latencia baja.
- Anonimización de imágenes para datasets: enmascara rostros, manos y cuerpos antes de publicar capturas, reduciendo el riesgo de reidentificación.
- Preprocesado para pipelines de visión artificial: la máscara de piel sirve como entrada auxiliar para modelos de pose, reconocimiento de gestos o segmentación de ropa.
- Filtros de realidad aumentada: el modelo genera máscaras de piel en tiempo real para aplicar maquillaje virtual, tatuajes o efectos sobre la piel en aplicaciones móviles o de escritorio.
- Herramientas de accesibilidad: detección de zonas de piel para control por gestos o seguimiento de manos en entornos con poca iluminación controlada.

## Benchmarks y rendimiento

IoU sobre imágenes held-out, por mix y tier (extracto de la model card):

| Mix | Tier | All | Studio | Amateur | COCO | Stock | Screenshots | Games | Anime | Anthro | Negativos |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Real | tiny | 0,892 | 0,965 | 0,915 | 0,702 | 0,750 | 0,757 | 0,509 | — | — | 0,24% |
| Real | small | 0,919 | 0,974 | 0,919 | 0,765 | 0,886 | 0,791 | 0,571 | — | — | 0,02% |
| Real | medium | 0,909 | 0,969 | 0,943 | 0,733 | 0,873 | 0,802 | 0,578 | — | — | 0,11% |
| Real | big | 0,917 | 0,968 | 0,936 | 0,756 | 0,874 | 0,864 | 0,597 | — | — | 0,03% |
| Real + Anime | big | 0,818 | 0,976 | 0,941 | 0,660 | 0,902 | 0,859 | 0,590 | 0,659 | — | 0,11% |
| Everything | big | 0,765 | 0,972 | 0,943 | 0,692 | 0,893 | 0,873 | 0,611 | 0,660 | 0,643 | 0,13% |

Tamaño de los conjuntos: studio 231, amateur 16, COCO 134, stock 15, screenshots 15, games 385, anime 292, anthro 235, negatives 264. Los tiers huge, epic y unfathomable puntúan igual que big al compartir pesos y variar solo la resolución.

## Requisitos de hardware

- VRAM estimada: no aplica en la mayoría de tiers; los modelos ONNX de 2,6 MB (tiny fp16) a 60,5 MB (big fp16) caben en memoria RAM y se ejecutan en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte ONNX Runtime (CUDA o DirectML) acelera la inferencia, pero el diseño está pensado para CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer e incluso en iGPU; el tier tiny (2,6 MB) es apto para dispositivos de bajos recursos.
- Opciones de despliegue: ONNX Runtime (principal), con posibilidad de exportar a otros runtimes compatibles con ONNX; no se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI (no aplica).
- Latencia y throughput: no se publican cifras concretas; el autor indica que está entrenado para "tiempo real" en gaming, vídeo y uso general del ordenador, lo que sugiere latencias por debajo del frame time en CPU moderna para los tiers pequeños.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto/resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Latex v1 (KinkyRaven) | Segmentación de piel (CNN MobileNetV4) | no disponible | hasta 3840x2176 | Propietaria (KinkyRaven Latex 1.0) | Hugging Face, ONNX |
| Latex 2 (KinkyRaven) | Segmentación de piel (sucesor) | no disponible | no disponible | Comercial | Contacto directo con el autor |
| MobileNetV4 (timm) | Backbone de clasificación/segmentación | no disponible | 224-384 px típico | Apache 2.0 (timm) | Hugging Face, timm |
| Segment Anything (SAM) | Segmentación general | 632M (ViT-H) | 1024 px | Apache 2.0 | Meta AI, Hugging Face |

No se dispone de comparativas publicadas con otros modelos específicos de segmentación de piel en la información proporcionada.

## Limitaciones y advertencias

- Las medias de rejilla (fishnets) y los detalles intrincados se pierden; el autor lo reconoce y lo corrige en Latex 2.
- Las fotos con poca luz y las imágenes en blanco y negro oscuras producen máscaras irregulares.
- El rendimiento en personas dibujadas, arte antropomórfico y fotogramas de juegos es inferior al de fotos reales (IoU de 0,61-0,66 frente a 0,89-0,92 en real).
- Los objetos de color similar a la piel (osos de peluche, fruta, comida pálida) se enmascaran a veces como piel.
- No se ha medido la precisión por tono de piel ni por tipo corporal, lo que supone un riesgo de sesgo no cuantificado.
- La licencia es propietaria y restrictiva; el uso comercial requiere revisar los términos de la KinkyRaven Latex License 1.0 y, para la versión superior, contactar con el autor.
- El modelo está etiquetado como NSFW/not-for-all-audiences; su despliegue en productos públicos debe considerar la moderación de contenido y las implicaciones legales.
- No es un modelo de lenguaje: no soporta texto, tool calling ni razonamiento; cualquier caso de uso debe plantearse como componente de un pipeline de visión.

## Enlaces

- Hugging Face: https://huggingface.co/kinkyrvn/latex
- Licencia: https://huggingface.co/kinkyrvn/latex/blob/main/LICENSE
- Aplicación Sub Control: https://subcontrol.kinkyraven.com/
- Paper de MobileNetV4 (arXiv:2404.10518): https://arxiv.org/abs/2404.10518
- Backbone en timm: https://huggingface.co/timm/mobilenetv4_conv_large.e600_r384_in1k
- Contacto comercial (Latex 2): mailto:hey@kinkyraven.com
