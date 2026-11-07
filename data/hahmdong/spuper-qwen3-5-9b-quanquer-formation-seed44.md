# Hahmdong/SPUPER-qwen3.5-9b-quanquer-formation-seed44

## Resumen

SPUPER-qwen3.5-9b-quanquer-formation-seed44 es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-9B, desarrollado por el usuario Hahmdong. Se trata de un modelo multimodal de tipo image-text-to-text, es decir, acepta entradas que combinan imagen y texto y genera texto como salida. El entrenamiento se ha realizado mediante SFT (Supervised Fine-Tuning) utilizando la librería TRL en su versión 0.27.1, con un conjunto de datos no especificado en la model card.

El modelo cuenta con 9.409.813.744 parámetros totales (aproximadamente 9,4 mil millones) y un repositorio de 18,8 GB, lo que sugiere pesos en precisión BF16/F32. La nomenclatura "quanquer-formation-seed44" apunta a un experimento de ajuste con semilla 44, probablemente parte de una serie de variantes del mismo autor (se han encontrado otros repositorios como "quanquer-add-quanter1" y "quanquer-add-act-ai"). No se dispone de información sobre el dataset de entrenamiento, la licencia ni los idiomas soportados.

La relevancia de esta ficha es limitada: se trata de un modelo de investigación con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentación técnica detallada. Resulta útil únicamente como referencia de un experimento de fine-tuning sobre la familia Qwen3.5, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen3.5-9B; detalles internos no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no es MoE, segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo contiene safetensors en F32/BF16; no se documentan GGUF ni otros formatos) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen/Qwen3.5-9B, un transformer multimodal de la familia Qwen3.5 orientado a tareas image-text-to-text. No se dispone de detalles sobre el número de capas, dimensiones ocultas, mecanismo de atención ni estrategia de fusión de modalidades, ya que la model card no los documenta. El tag `qwen3_5` y la pipeline `image-text-to-text` confirman la naturaleza multimodal del modelo base.

El entrenamiento se realizó mediante SFT (Supervised Fine-Tuning) con TRL 0.27.1, Transformers 5.9.0, PyTorch 2.11.0+cu129, Datasets 4.0.0 y Tokenizers 0.22.2. El run de entrenamiento está registrado en Weights & Biases bajo el proyecto "SPUPER-SFT" del autor (dyhahm, Korea Advanced Institute of Science and Technology). No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO posteriores. El sufijo "seed44" sugiere que se fijó la semilla 44 para reproducibilidad, pero no se aporta más contexto.

## Capacidades

- Generación de texto condicionada por imagen y texto (pipeline image-text-to-text).
- Conversación multi-turno: la model card incluye un ejemplo con formato de mensajes `[{"role": "user", "content": ...}]`.
- Razonamiento y generación de lenguaje natural heredados del modelo base Qwen3.5-9B (no verificados de forma independiente en este fine-tune).
- Capacidades multimodales (visión) heredadas del modelo base, si bien no se documentan tareas concretas ni métricas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Experimentación académica con fine-tuning multimodal: el modelo sirve como punto de partida para reproducir el pipeline SFT con TRL sobre Qwen3.5-9B, dado que se documentan las versiones exactas de las librerías y el run de W&B.
- Investigación sobre reproducibilidad de semillas: el sufijo "seed44" permite comparar esta variante con otras del mismo autor (por ejemplo, "quanquer-add-quanter1" o "quanquer-add-act-ai") para estudiar el efecto de la semilla en el ajuste.
- Descripción de imágenes en entornos controlados: al ser un modelo image-text-to-text, puede emplearse para generar descripciones de imágenes, aunque sin benchmarks que avalen su calidad frente al modelo base.
- Asistente conversacional con entrada visual: el formato de chat documentado permite integrarlo en prototipos de conversación donde el usuario adjunta una imagen y formula preguntas.
- Evaluación comparativa de fine-tunes: útil como baseline en estudios que comparen variantes de ajuste sobre Qwen3.5-9B con el mismo dataset y distintas semillas o configuraciones.
- Docencia y formación en SFT: el repositorio incluye un ejemplo mínimo de `pipeline` de Transformers que puede usarse en talleres prácticos de ajuste fino con TRL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 18,8 GB solo para los pesos (9,4 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomiendan 24 GB o más.
- VRAM estimada en cuantización de 8 bits: alrededor de 10-12 GB (estimación teórica, no verificada para este modelo).
- VRAM estimada en cuantización de 4 bits: alrededor de 6-8 GB (estimación teórica; no se distribuyen pesos GGUF en el repo).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16; RTX 3090/4090 para cuantizaciones de 8 o 4 bits.
- ¿Cabe en GPU de consumo? En BF16, no de forma holgada en tarjetas de 16 GB; sí en RTX 4090 (24 GB) o con cuantización en GPUs de 8-16 GB.
- Opciones de despliegue: transformers (pipeline documentado), vLLM y TGI si el modelo base Qwen3.5-9B es compatible; llama.cpp/Ollama requerirían conversión a GGUF, no incluida en el repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SPUPER-qwen3.5-9b-quanquer-formation-seed44 | 9,4 B | No disponible | Image-text-to-text | No disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-9B (base) | ~9 B | No disponible en esta ficha | Image-text-to-text | Segun Qwen (no verificada aqui) | Hugging Face |
| Hahmdong/SPUPER-qwen3.5-9b-quanquer-add-quanter1 | ~9 B | No disponible | No disponible | No disponible | Hugging Face |
| Hahmdong/SPUPER-qwen3.5-9b-quanquer-add-act-ai | ~9 B | No disponible | No disponible | No disponible | Hugging Face (7 descargas) |

No se dispone de datos de rendimiento (benchmarks) para ninguno de los modelos de la comparativa en la información proporcionada, por lo que la comparación se limita a parámetros, modalidad y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas que permitan evaluar si el fine-tune mejora o degrada las capacidades del modelo base.
- Dataset de entrenamiento no documentado: se desconoce la composición, el tamaño y la procedencia de los datos, lo que impide evaluar sesgos y calidad.
- Licencia ambigua: la model card indica "licence: license" sin especificar términos; no se puede confirmar el uso comercial. Además, la licencia del modelo base Qwen3.5-9B debe respetarse, pero no se detalla aquí.
- Idiomas no declarados: no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas distintos del que se usó en el entrenamiento (desconocido).
- Riesgo de alucinación: inherente a los modelos generativos; sin evaluación específica, no se puede acotar.
- Sesgos: no documentados; al desconocerse el dataset, no se pueden identificar sesgos de género, etnia o dominio.
- Contexto desconocido: no se especifica la longitud de contexto, lo que impide planificar su uso en tareas de contexto largo.
- Modelo de investigación con 0 descargas y 0 likes: sin validación por parte de la comunidad, no recomendable para producción sin una evaluación propia previa.
- El ejemplo de la model card usa `model="None"`, lo que sugiere que la documentación no se revisó; conviene verificar el identificador correcto antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Hahmdong/SPUPER-qwen3.5-9b-quanquer-formation-seed44
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Run de entrenamiento en W&B: https://wandb.ai/dyhahm-Korea%20Advanced%20Institute%20of%20Science%20and%20Technology/SPUPER-SFT/runs/my8h89u2
- Repositorio TRL: https://github.com/huggingface/trl
- Variante relacionada: https://huggingface.co/Hahmdong/SPUPER-qwen3.5-9b-quanquer-add-quanter1
- Variante relacionada: https://huggingface.co/Hahmdong/SPUPER-qwen3.5-9b-quanquer-add-act-ai
