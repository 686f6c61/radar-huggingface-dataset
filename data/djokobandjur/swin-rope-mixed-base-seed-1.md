# djokobandjur/swin-rope-mixed-base-seed-1

## Resumen

El modelo `swin-rope-mixed-base-seed-1` es un checkpoint de investigación de un Swin Transformer Base con embeddings posicionales rotatorios (RoPE) mixtos, entrenado desde cero sobre ImageNet-1k por Đoko Banđur y Miloš Banđur. Forma parte de una familia de seis checkpoints entrenados de forma independiente para estudiar el efecto de parámetros de frecuencia rotatoria aprendidos en representaciones de transformers de visión. La arquitectura combina la configuración de ventanas desplazadas de Swin Transformer con la implementación de RoPE para ViT propuesta por Heo et al. (ECCV 2024), sustituyendo los sesgos posicionales relativos por frecuencias rotatorias mixtas.

El checkpoint registra una precisión top-1 del 83,860 % sobre las 50.000 imágenes de validación de ImageNet-1k, con un fichero de pesos de 1.054.162.173 bytes (~1,1 GB) en formato PyTorch nativo. No es un paquete de Hugging Face Transformers: requiere instanciar la implementación RoPE-ViT correspondiente antes de cargar los pesos, y el autor advierte que el checkpoint puede contener estado de optimizador.

La relevancia del modelo es estrictamente investigadora: se publica como artefacto reproducible con SHA-256 verificado, orientado al estudio de esquemas posicionales alternativos en vision transformers. No está pensado como modelo de producción ni como base para fine-tuning generalista, y no dispone de ejemplos de carga end-to-end validados en el momento de su publicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin Transformer Base con ventanas desplazadas y RoPE mixto (learned RoPE-Mixed) |
| Parametros totales | no disponible (repo de 1,1 GB, consistente con Swin Base ~88M, pero no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de clasificación de imágenes; resolución de entrada no especificada en la model card) |
| Tipos de cuantizacion | no disponible (solo se publica el checkpoint PyTorch original `final_checkpoint.pth`) |
| Idiomas soportados | no disponible (tarea de visión, sin capacidades lingüísticas) |
| Licencia | BSD 3-Clause (aplica a `final_checkpoint.pth`) |
| Formato de pesos | PyTorch nativo (`.pth`), no compatible con `AutoModel.from_pretrained` |

## Arquitectura y entrenamiento

El modelo sigue la configuración Swin Transformer Base con ventanas desplazadas, en la que la atención se calcula dentro de ventanas locales que se desplazan entre capas para permitir interacción entre regiones vecinas. Sobre esta base, se sustituye el esquema posicional original por RoPE mixto: frecuencias rotatorias aprendidas que codifican la posición relativa mediante rotaciones en el espacio de embeddings, siguiendo la formulación de Heo, Park, Han y Yun (ECCV 2024). El término "mixed" indica la combinación de frecuencias rotatorias de distinta naturaleza, aunque la model card no detalla la composición exacta del vector de frecuencias.

El entrenamiento se realizó sobre ImageNet-1k hasta la época 299, con semilla aleatoria registrada `2078666210` y selección del checkpoint final (`PRIMARY_FINAL`). No se documentan en la información disponible el número total de tokens vistos, la composición exacta del dataset más allá de ImageNet-1k, ni si se aplicaron técnicas de regularización específicas como mixup, cutmix o EMA. Tampoco se especifica si hubo fases de preentrenamiento adicionales o ajuste fino. El autor publica un vector de referencia de frecuencias con SHA-256 propio (`043f5e50…`), archivado por separado y no incluido en el repositorio, lo que sugiere que el estudio se centra en la reproducibilidad de los parámetros rotatorios aprendidos.

## Capacidades

- Clasificación de imágenes en 1.000 categorías de ImageNet-1k.
- Extracción de representaciones visuales intermedias mediante la implementación RoPE-ViT correspondiente.
- Estudio de esquemas posicionales alternativos (RoPE mixto aprendido frente a sesgos relativos clásicos de Swin).
- Reproducibilidad numérica verificable mediante SHA-256 del checkpoint y del vector de frecuencias.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de capacidades multilingües, generación de texto, código, matemáticas, visión general (VQA, captioning) ni audio.
- No incorpora modo "thinking" ni decodificación especulativa.

## Casos de uso

- Investigación sobre esquemas posicionales en vision transformers: el checkpoint permite comparar el rendimiento de RoPE mixto aprendido frente a sesgos relativos en una configuración Swin Base, controlando la semilla y el número de épocas.
- Reproducción de experimentos académicos: el SHA-256 del checkpoint y del vector de frecuencias permite verificar que los resultados publicados corresponden exactamente a estos pesos, algo poco habitual en checkpoints de investigación.
- Análisis de representaciones internas: al ser un checkpoint final de entrenamiento, puede usarse para extraer mapas de atención y estudiar cómo las frecuencias rotatorias mixtas distribuyen la información posicional entre capas.
- Baseline en estudios de ablation: sirve como referencia para evaluar variantes de RoPE (frecuencias fijas, aprendidas, mixtas) manteniendo constante el resto de la configuración Swin.
- Docencia y formación en visión por computador: permite ilustrar de forma práctica la diferencia entre codificación posicional absoluta, relativa y rotatoria en arquitecturas con ventanas desplazadas.
- Clasificación de imágenes en entornos de investigación controlados: con la implementación adecuada, puede aplicarse a conjuntos de imágenes propios para estudiar transferibilidad, aunque sin garantías de rendimiento fuera de ImageNet-1k.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado |
|---|---|---|
| ImageNet-1k validation (50.000 imágenes) | Top-1 accuracy | 83,860 % (41.930 aciertos) |

No se han publicado en la información disponible resultados de otros benchmarks (top-5, robustez a corrupción, transferencia a otras tareas) ni comparaciones directas con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con un checkpoint de ~1,1 GB y arquitectura Swin Base, la inferencia en fp32 requiere del orden de 3-4 GB de VRAM, pero esta cifra no está confirmada por el autor.
- GPU recomendadas: no especificadas en la model card. Por tamaño, cabría en GPUs consumer tipo RTX 3090, RTX 4090 o superiores, así como en A100/H100 para entrenamiento o evaluación a gran escala.
- Compatibilidad con GPU consumer: probable por tamaño de pesos, pero no verificada en la documentación disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (son herramientas orientadas a modelos de lenguaje). El autor indica que se requiere la implementación RoPE-ViT correspondiente y que el ejemplo de carga end-to-end se publicará tras validar la configuración de inferencia y preprocesado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| swin-rope-mixed-base-seed-1 | no disponible (~Swin Base) | clasificación ImageNet-1k | Top-1 83,860 % | BSD 3-Clause | Hugging Face (checkpoint `.pth`) |
| Swin Transformer Base (Liu et al., ICCV 2021) | ~88M | clasificación ImageNet-1k | Top-1 ~83,5 % (referencia publicada) | MIT (código) / licencias variables en pesos | Amplia, integrado en timm y HF Transformers |
| DeiT-Base con RoPE (Heo et al., ECCV 2024) | ~86M | clasificación ImageNet-1k | Resultados publicados en el paper de referencia | Licencia del proyecto NAVER AI | Código y pesos en el repositorio naver-ai/rope-vit |

La comparación con Swin Base clásico y DeiT con RoPE es la más directa por configuración y tarea, pero la model card no incluye una tabla comparativa propia; los valores de las alternativas provienen de sus publicaciones originales y no de una evaluación conjunta en las mismas condiciones.

## Limitaciones y advertencias

- Checkpoint de investigación: no es un paquete de Hugging Face Transformers y requiere la implementación RoPE-ViT correspondiente para cargarse; no funciona con `AutoModel.from_pretrained`.
- El fichero `final_checkpoint.pth` puede contener estado de optimizador además de los pesos, lo que incrementa el tamaño y complica la carga en inferencia.
- Riesgo de seguridad: los checkpoints PyTorch basados en pickle pueden ejecutar código arbitrario durante la deserialización; el autor recomienda cargar solo desde fuentes de confianza y usar modos de carga seguros cuando sea compatible.
- Sin ejemplo de carga end-to-end validado en el momento de la publicación; el preprocesado exacto (resolución, normalización, augmentación de test) no está documentado.
- Evaluación limitada a ImageNet-1k clean; no se han publicado resultados de robustez, distribución fuera de dominio ni transferencia.
- Sesgos: no documentados; al entrenarse solo con ImageNet-1k, hereda los sesgos de clases y representación de ese dataset.
- Riesgo de alucinación: no aplica en el sentido de modelos generativos, pero sí existe riesgo de clasificaciones erróneas con alta confianza en imágenes fuera de distribución.
- Licencia BSD 3-Clause aplica únicamente a `final_checkpoint.pth`; no relicencia el código ni los pesos upstream de NAVER/Meta, cuyas condiciones deben respetarse por separado.
- La cita académica es recomendada pero no constituye una condición adicional de la licencia.
- Sin garantías de soporte, mantenimiento ni actualizaciones por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/djokobandjur/swin-rope-mixed-base-seed-1
- Revisión original de los pesos: https://huggingface.co/djokobandjur/swin-rope-mixed-base-seed-1/tree/3194db62b3238cbca489b2c58c553528b7320ea2
- Paper de referencia RoPE para ViT (Heo et al., ECCV 2024): https://arxiv.org/abs/2403.13298
- Código fuente NAVER AI RoPE-ViT: https://github.com/naver-ai/rope-vit
- Paper original de Swin Transformer (Liu et al., ICCV 2021): https://openaccess.thecvf.com/content/ICCV2021/html/Liu_Swin_Transformer_Hierarchical_Vision_Transformer_Using_Shifted_Windows_ICCV_2021_paper.html
- Archivo de reproducibilidad en Zenodo: https://doi.org/10.5281/zenodo.24055154
- Dataset ImageNet-1k: https://huggingface.co/datasets/ILSVRC/imagenet-1k
