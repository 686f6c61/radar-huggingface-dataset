# chenjinrong/ED-Former

## Resumen

ED-Former es un transformer extremadamente ligero para la eliminación de niebla en imágenes individuales (single-image dehazing), desarrollado por Jinrong Chen y colaboradores y publicado en *Signal Processing: Image Communication* en 2026. El modelo combina tres innovaciones principales: un muestreador jerárquico sensible a la frecuencia (FHS), una red de avance con atención adaptativa (AAFFN) y una pérdida de invarianza jerárquica (HILoss), que en conjunto permiten preservar detalles de alta frecuencia manteniendo el modelo por debajo del millón de parámetros. Con 0,866 millones de parámetros y 7,36 G MACs para entradas de 256 × 256, alcanza 75,2 FPS en una NVIDIA RTX 4060 Ti, lo que lo hace adecuado para aplicaciones en tiempo real. Su relevancia radica en ofrecer un equilibrio entre calidad de restauración y eficiencia computacional, superando a métodos previos en benchmarks como SOTS y RS-Haze con una fracción de los recursos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con FHS, AAFFN y HILoss |
| Parametros totales | 0,866 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (procesamiento de imágenes) |
| Licencia | other (no especificada en detalle) |
| Formato de pesos | no disponible (código PyTorch, probablemente .pth) |

## Arquitectura y entrenamiento

ED-Former es un transformer de visión de bajo nivel diseñado específicamente para dehazing. Su arquitectura se basa en tres componentes clave: el Frequency-aware Hierarchical Sampler (FHS) utiliza descomposición y reconstrucción basada en wavelets para reducir la pérdida de información durante el redimensionado de características; la Attention-Adaptive Feed-Forward Network (AAFFN) refina dinámicamente las características ricas en detalles mediante una puerta de atención ligera; y la Hierarchical Invariance Loss (HILoss) emplea una programación coseno para desplazar el objetivo de entrenamiento desde la estructura perceptual hacia la fidelidad píxel a píxel. El modelo se entrena con datasets sintéticos como RESIDE (ITS, OTS y SOTS) y RS-Haze, y se evalúa también en O-HAZE para probar la transferencia a niebla real sin ajuste fino. No se han publicado detalles sobre el número exacto de tokens de entrenamiento ni sobre el uso de RLHF o DPO, ya que se trata de un modelo de restauración de imágenes supervisado.

## Capacidades

- Eliminación de niebla en imágenes individuales, tanto sintéticas como reales.
- Preservación de detalles de alta frecuencia gracias al FHS y la AAFFN.
- Inferencia en tiempo real: 75,2 FPS a 256 × 256 en una RTX 4060 Ti.
- Transferencia a dominios reales sin ajuste fino (evaluado en O-HAZE con 15,78 dB PSNR).
- Restauración de imágenes con mejora de nitidez y contraste.
- No soporta tool calling, agentes ni razonamiento multimodal; es un modelo puramente de imagen a imagen.

## Casos de uso

- Fotografía y videografía profesional: limpieza de imágenes con niebla o calima para su uso en postproducción, mejorando la calidad visual sin necesidad de hardware especializado.
- Conducción autónoma y asistencia a la conducción: preprocesamiento de imágenes de cámaras en vehículos para mejorar la visibilidad en condiciones meteorológicas adversas, con latencia de 13,3 ms que permite integración en tiempo real.
- Vigilancia y seguridad: restauración de imágenes de cámaras de vigilancia en exteriores afectadas por niebla, facilitando la identificación de objetos o personas.
- Fotografía aérea y satelital: mejora de imágenes capturadas desde drones o satélites en presencia de bruma, útil para cartografía, agricultura de precisión o monitorización ambiental.
- Restauración de imágenes históricas: recuperación de fotografías antiguas o digitalizaciones con pérdida de contraste debida a la niebla, preservando detalles finos.
- Preprocesamiento para otros modelos de visión: uso como etapa previa en pipelines de detección de objetos, segmentación o reconocimiento, donde la eliminación de niebla mejora el rendimiento de los modelos aguas abajo.

## Benchmarks y rendimiento

Los resultados publicados en el paper para ED-Former son los siguientes:

| Dataset | PSNR (dB) | SSIM |
|:--|--:|--:|
| SOTS-indoor (RESIDE-IN) | 38,21 | 0,9942 |
| SOTS-outdoor (RESIDE-OUT) | 33,92 | 0,9827 |
| RS-Haze | 39,61 | 0,9715 |
| O-HAZE (zero-shot) | 15,78 | 0,702 |

Comparación de eficiencia con otros métodos (medida en RTX 4060 Ti, entrada 256 × 256):

| Metodo | Latencia (ms) | FPS | Parametros (M) | MACs (G) |
|:--|--:|--:|--:|--:|
| GridDehazeNet | 15,3 | 65,2 | 0,956 | 21,49 |
| MSBDN | 19,9 | 50,2 | 31,35 | 41,54 |
| FFA-Net | 93,5 | 10,7 | 4,456 | 287,8 |
| DehazeFormer-s | 18,7 | 53,5 | 1,283 | 13,13 |
| Dehamer | 19,0 | 52,7 | 132,4 | 48,93 |
| **ED-Former** | **13,3** | **75,2** | **0,866** | **7,36** |

No se han publicado resultados de benchmarks adicionales más allá de los incluidos en el paper.

## Requisitos de hardware

- VRAM estimada: no disponible en la documentación, pero dado el tamaño de 0,866 M de parámetros y 7,36 G MACs, es previsible que quepa en GPUs con 4 GB o menos; sin embargo, no hay datos oficiales.
- GPU recomendada: el paper utiliza una NVIDIA RTX 4060 Ti para las mediciones de rendimiento; cualquier GPU CUDA con al menos 4 GB de VRAM debería ser suficiente para inferencia.
- Compatibilidad con GPUs de consumo: sí, es adecuado para tarjetas como RTX 3060, RTX 4060, RTX 4070, etc.
- Opciones de despliegue: el código oficial está en PyTorch; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: 13,3 ms por imagen (75,2 FPS) en RTX 4060 Ti, según el paper.

## Comparativa con modelos similares

| Modelo | Parametros (M) | MACs (G) | PSNR SOTS-indoor (dB) | PSNR SOTS-outdoor (dB) | Licencia |
|:--|--:|--:|--:|--:|:--|
| ED-Former | 0,866 | 7,36 | 38,21 | 33,92 | other |
| DehazeFormer-s | 1,283 | 13,13 | no disponible | no disponible | no disponible |
| FFA-Net | 4,456 | 287,8 | no disponible | no disponible | no disponible |
| GridDehazeNet | 0,956 | 21,49 | no disponible | no disponible | no disponible |

Los valores de PSNR para los modelos comparados no se han extraído de la información disponible; solo se conocen los datos de eficiencia. ED-Former destaca por su menor número de parámetros y MACs, con un rendimiento competitivo en los benchmarks reportados.

## Limitaciones y advertencias

- El modelo se entrena principalmente con datos sintéticos (RESIDE, RS-Haze); aunque muestra transferencia a niebla real en O-HAZE, el rendimiento en condiciones extremas o con tipos de niebla no representados puede degradarse.
- La licencia se indica como "other" sin especificar términos concretos; es necesario contactar con los autores o revisar el repositorio para conocer las restricciones de uso comercial.
- No se han documentado sesgos específicos, pero al ser un modelo de visión, su comportamiento depende de la distribución de los datos de entrenamiento; podría tener dificultades con imágenes de muy baja resolución o con artefactos no relacionados con la niebla.
- El código requiere Python 3.7 y una GPU CUDA; no se proporcionan versiones para CPU o entornos sin GPU.
- No se dispone de información sobre cuantización, lo que limita su despliegue en dispositivos con restricciones de memoria o potencia.

## Enlaces

- HuggingFace: https://huggingface.co/chenjinrong/ED-Former
- Paper (ScienceDirect): https://doi.org/10.1016/j.image.2026.117634
- Repositorio GitHub: https://github.com/2697166190a-beep/ED-Former
- Página del artículo en ScienceDirect: https://www.sciencedirect.com/science/article/pii/S0923596526001578
- Semantic Scholar: https://www.semanticscholar.org/paper/ED-Former%3A-Efficient-dehazing-transformer-with-Chen-He/619f8ba28312bed4ae56a701634a143b057f2d02
