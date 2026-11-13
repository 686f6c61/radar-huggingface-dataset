# KosmoResearch/Kosmo-GFM

## Resumen

Kosmo-GFM es un modelo fundacional de geometría (Geometry Foundation Model) desarrollado por Kosmo Research, orientado a la reconstrucción 3D multi-vista, la estimación de poses de cámara, el seguimiento de puntos, el scene flow y el emparejamiento de imágenes (image matching). A diferencia de los modelos de lenguaje, se trata de un modelo de visión por computador que predice parámetros de cámara, mapas de profundidad, correspondencias entre vistas y puntos 3D dinámicos a partir de imágenes y vídeos, usando un codificador multi-vista compartido con decodificadores específicos por tarea.

La familia se compone de cuatro configuraciones de inferencia sobre un backbone ViT-g: GFM (1,66B parámetros, profundidad, cámaras y nubes de puntos), Camera Condition GFM (1,77B, acepta extrínsecos e intrínsecos de cámara), GFM 4D (1,65B, geometría y movimiento entre fotogramas) y GFM + MVLoMA (1,73B, añade una cabeza de matching de 75,9M parámetros). El repositorio de Hugging Face ocupa 20,6 GB y distribuye los pesos como checkpoints PyTorch (`.pth`).

Su relevancia radica en unificar en un solo modelo tareas que tradicionalmente se resolvían con pipelines separados (SfM, MVS, estimación monocular de profundidad, tracking), con licencia Apache 2.0 y pesos abiertos. No obstante, el pipeline completo PoseEngine y Gaussian Splatting descrito en el informe técnico no se incluye en el repositorio de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT-g multi-vista con decodificadores específicos por tarea |
| Parametros totales | 1,66B (GFM) / 1,77B (Camera Condition GFM) / 1,65B (GFM 4D) / 1,73B (GFM + MVLoMA) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen checkpoints PyTorch en precisión nativa) |
| Idiomas soportados | en (inglés; el modelo procesa imágenes, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pth` (checkpoints PyTorch) |

## Arquitectura y entrenamiento

El modelo se basa en un backbone ViT-g compartido que procesa múltiples vistas de forma conjunta, alimentando decodificadores especializados para geometría (profundidad y nubes de puntos), estimación de pose de cámara, movimiento 4D y emparejamiento de imágenes. La variante Camera Condition GFM incorpora extrínsecos e intrínsecos de cámara como entrada, lo que permite reconstrucción con poses conocidas. La cabeza MVLoMA añade 75,9M parámetros sobre el codificador GFM para matching entre pares de imágenes, y requiere al menos dos imágenes para operar.

La información proporcionada no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF/DPO (poco habituales en modelos de visión). Tampoco se especifican innovaciones como decodificación especulativa o atención lineal. El informe técnico está referenciado en arXiv (2611.16840) pero su contenido no se incluye en la información disponible.

## Capacidades

- Estimación de profundidad (depth estimation) a partir de imágenes, con mapas de confianza asociados.
- Estimación de parámetros de cámara (poses) desde imágenes y vídeos.
- Reconstrucción 3D multi-vista y generación de nubes de puntos (exportables a PLY/GLB con dependencias opcionales).
- Reconstrucción condicionada por cámara: acepta extrínsecos (`[N,4,4]` o `[N,3,4]`, convención OpenCV world-to-camera) e intrínsecos (`[N,3,3]`), con soporte de convención c2w.
- Movimiento 4D y scene flow: predicción de geometría y movimiento entre fotogramas (GFM 4D).
- Seguimiento de puntos y puntos 3D dinámicos.
- Emparejamiento de imágenes (image matching) mediante la cabeza MVLoMA, con exportación de correspondencias y opción `--all-pairs`.
- Procesamiento por chunks (`--chunk-size`) para controlar el consumo de memoria en la decodificación de consultas.
- No dispone de tool calling, function calling, capacidades de agente ni generación de texto: es un modelo puramente visual.

## Casos de uso

- Reconstrucción 3D de escenas estáticas: a partir de un conjunto de imágenes de un mismo entorno, GFM estima cámaras, profundidad y nubes de puntos, útil para digitalización de espacios, patrimonio o inspección industrial.
- Fotogrametría y modelado de entornos: el pipeline `infer_3d.py` con exportación PLY/GLB permite generar mallas y nubes de puntos listas para visores 3D o motores de render.
- Reconstrucción con poses conocidas: Camera Condition GFM se emplea cuando se dispone de extrínsecos e intrínsecos calibrados (por ejemplo, de un rig multi-cámara o un dron con telemetría), mejorando la coherencia geométrica al fijar la escala de pose.
- Análisis de movimiento en vídeo: GFM 4D predice scene flow y puntos dinámicos entre fotogramas, aplicable a seguimiento de objetos, análisis de tráfico o estudio de movimiento en secuencias.
- Emparejamiento de imágenes para localización visual: la variante con MVLoMA genera correspondencias entre pares de imágenes, útil en relocalización, SLAM visual o verificación de solapamiento entre capturas.
- Preprocesado para pipelines de Gaussian Splatting o NeRF: las poses y profundidades estimadas por GFM pueden alimentar etapas posteriores de reconstrucción neuronal (aunque el pipeline Gaussian Splatting completo no se incluye en el repositorio).
- Automatización de anotación geométrica: generación de profundidad y correspondencias para datasets de visión, reduciendo el etiquetado manual en tareas de estereo o flujo óptico.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre SpatialBench (profundidad). Mayor es mejor en ↑; menor es mejor en ↓. Precisión y AUC en escala 0–1.

| Setting | AbsRel↓ | SqRel↓ | RMSE↓ | δ1.03↑ | δ1.05↑ | δ1.10↑ |
|---|---|---|---|---|---|---|
| Sparse | 0.0630 | 0.1093 | 0.6207 | 0.6696 | 0.7810 | 0.8816 |
| Medium | 0.0594 | 0.0884 | 0.5822 | 0.6895 | 0.8077 | 0.9025 |

La información proporcionada se interrumpe en la sección de benchmarks (tras la tabla de profundidad), por lo que no se dispone de resultados completos de otras tareas (cámaras, matching, scene flow) ni de comparaciones con modelos similares en la información disponible.

## Requisitos de hardware

- GPU CUDA obligatoria: la instalación requiere Python 3.10+ y una GPU con CUDA; no se documenta soporte CPU.
- VRAM estimada: no disponible de forma explícita. Con ~1,65–1,77B parámetros en precisión nativa (fp32/fp16), el peso de los pesos ronda los 3,3–7 GB según precisión, a lo que se suma memoria de activaciones para múltiples vistas y decodificación de consultas.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cabría esperar GPUs de gama alta (A100, H100) para lotes multi-vista grandes, y posiblemente RTX 4090 para configuraciones reducidas, aunque no se confirma.
- Ajuste en GPU de consumo: no confirmado; el control de memoria vía `--chunk-size` sugiere que la decodificación puede ser intensiva en memoria.
- Opciones de despliegue: scripts de inferencia del repositorio (`tools/infer_3d.py`, `infer_3d_camera_cond.py`, `infer_4d.py`, `infer_3d_with_mvloma.py`) sobre PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han proporcionado datos de benchmarks ni especificaciones de modelos comparables en la información disponible. Por categoría (modelos fundacionales de geometría multi-vista), podrían considerarse alternativas como DUSt3R, MASt3R o VGGT, pero no se dispone de datos verificados en esta ficha para establecer una comparación rigurosa de parámetros, contexto, rendimiento y licencia.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kosmo-GFM | 1,65–1,77B | no disponible | Apache 2.0 | Pesos en HF (`.pth`) |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo puramente visual: no genera texto, no soporta tool calling ni razonamiento en lenguaje natural; los tags de idioma ("en") no implican capacidades lingüísticas.
- El pipeline completo PoseEngine y Gaussian Splatting descrito en el informe técnico no está incluido en el repositorio; solo se ofrece inferencia standalone de las cuatro configuraciones.
- GFM 4D exporta resultados a escala relativa de escena, no a escala métrica absoluta, salvo que se aporten cámaras calibradas.
- La variante con MVLoMA requiere al menos dos imágenes y ambos checkpoints (`gfm_3d.pth` y `mvloma.pth`).
- No se documentan sesgos, tasas de alucinación geométrica ni degradación en dominios fuera de distribución; en producción conviene validar con datos propios.
- No se especifican límites de número de vistas, resolución máxima de entrada ni comportamiento con secuencias muy largas.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar los términos de los datasets de entrenamiento (no documentados) por posibles restricciones subyacentes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica adopción temprana y poca validación comunitaria.
- La información de benchmarks está incompleta en la fuente, lo que limita la evaluación objetiva frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/KosmoResearch/Kosmo-GFM
- Paper: https://arxiv.org/abs/2611.16840
- Proyecto: https://kosmoresearch.github.io/Kosmo-GFM/
- Código: https://github.com/KosmoResearch/Kosmo-GFM
- Checkpoints: https://huggingface.co/KosmoResearch/Kosmo-GFM/tree/main
- Guía de descarga de Hugging Face: https://huggingface.co/docs/huggingface_hub/en/guides/download
