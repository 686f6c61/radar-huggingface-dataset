# aacudad/AnomalyThink-Qwen3-VL-8B-SFT

## Resumen

AnomalyThink-Qwen3-VL-8B-SFT es un ajuste fino supervisado de Qwen/Qwen3-VL-8B-Instruct (8.767.123.696 parámetros) especializado en detección de anomalías industriales explicable sobre imágenes cenitales de producto. Lo publica el autor "aacudad" como artefacto de investigación derivado de su tesis de máster en la TU Delft, "Reasoning-Enhanced Vision-Language Models for Explainable Industrial Anomaly Detection" (2026). El modelo resuelve una tarea binaria de inspección (pieza anómala o normal) y, cuando detecta un defecto, emite además el tipo, la localización y una cadena de razonamiento en formato estructurado.

El interés técnico está en el formato de salida y en el protocolo de evaluación: el modelo genera `<think>...</think>` seguido de `<location>`, `<type>` y `<answer>Yes</answer>` o `<answer>No</answer>`, con decodificación greedy y un mensaje de sistema de una línea ("Please answer by yes or no"). Se entrenó sobre las 6.000 trazas de Gemini 2.5-Flash del corpus anominythink_6k (3.000 anómalas y 3.000 normales, 30 productos Real-IAD, vista cenital) y alcanza 80.31 de balanced accuracy en el subconjunto DS-MVTec de MMAD y 67.32 en VisA, frente a 78.68 y 64.45 del modelo base sin ajustar.

Es relevante ahora porque acompaña a otros dos checkpoints de la misma familia (SFT-GRPO y KCR) entrenados tras la presentación de la tesis, y porque publica junto a los pesos los ficheros de evaluación por muestra (`eval_*.json`), lo que permite reproducir y auditar cada cifra. El repositorio no registra descargas ni "likes" en el momento de la consulta y no incluye resultados de benchmarks generales, solo las dos métricas de MMAD.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (familia Qwen3-VL); fine-tuning completo del modelo de lenguaje y del proyector con el codificador visual congelado |
| Parámetros totales | 8.767.123.696 (dato real de safetensors) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponible (el repositorio publica pesos en bf16; no se listan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible (la model card solo documenta prompts en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), más carpeta `transformers4_vllm/` con ficheros de tokenizer y processor de Qwen3-VL-8B-Instruct y un config con `rope_theta` dentro de `text_config` |
| Modelo base | Qwen/Qwen3-VL-8B-Instruct |
| Pipeline | image-text-to-text |
| Tamaño del repositorio | 17,6 GB |
| Biblioteca | transformers (checkpoint guardado con transformers 5.0.0) |
| Dataset de entrenamiento | aacudad/AnomalyThink (`anomalythink_6k/combined_6k_train.json`) |
| Fecha de publicación | 18 de septiembre de 2026 (actualizado el mismo día) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-8B-Instruct, un transformer multimodal imagen-texto, y aplica un fine-tuning supervisado completo sobre el modelo de lenguaje y el proyector, manteniendo congelado el codificador de visión. La receta usa learning rate 1e-5 con schedule coseno y 20 pasos de warmup, batch efectivo de 32, precisión bf16, imágenes limitadas a 262.144 píxeles y 4 épocas sobre dos RTX A6000 con DeepSpeed ZeRO-3 y offload a CPU. El checkpoint publicado corresponde a la época 1 (paso 188), que fue la mejor en DS-MVTec; las cuatro épocas puntuaron 80.31/67.32, 77.61/67.50, 78.07/62.91 y 79.41/62.35 en DS-MVTec/VisA.

El corpus de entrenamiento son 6.000 trazas generadas con Gemini 2.5-Flash, equilibradas (3.000 anómalas y 3.000 normales) y procedentes de 30 productos Real-IAD en vista cenital. La tesis define además el método Keep-Correct-Revise (KCR), que no se aplica a este checkpoint pero sí al hermano AnomalyThink-Qwen3-VL-8B-KCR: se muestrea ocho veces una política SFT+GRPO sobre cada imagen de entrenamiento, se conservan las trazas con veredicto correcto y razonamiento validado por un juez Gemini-3-Flash, se corrigen con el profesor las que fallaron por completo y se revisan aquellas con veredicto correcto pero razonamiento poco fundamentado, para después reentrenar desde los pesos base sobre el corpus curado. El patrón que reproduce la tesis es que GRPO aporta sobre todo en DS-MVTec y el corpus corregido aporta en VisA.

## Capacidades

- Inspección binaria de anomalías en imágenes de producto: responde `Yes` (anómala) o `No` (normal) mediante la etiqueta `<answer>`.
- Razonamiento explícito en modo "thinking": emite un bloque `<think>` antes del veredicto, lo que permite auditar la justificación de cada decisión.
- Localización del defecto: para piezas anómalas emite `<location>` junto con `<type>`, es decir, posición y tipología del defecto.
- Comprensión de imagen y texto: pipeline image-text-to-text con capacidad de conversación de un turno con imagen y prompt de instrucciones.
- Seguimiento de formato estricto: el protocolo de evaluación exige que una generación sin `<answer>` parseable cuente como incorrecta, lo que el modelo cumple de forma consistente según los ficheros de evaluación publicados.
- Compatibilidad con endpoints: el repositorio incluye el tag `endpoints_compatible`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada (el "thinking" documentado es de un único turno por imagen).
- Capacidades multilingües: no disponibles; toda la documentación y los prompts de evaluación están en inglés.
- Capacidades especiales: razonamiento textual trazable; no se documentan visión de vídeo, audio ni otros dominios.

## Casos de uso

- Inspección de calidad en línea de producción: el modelo clasifica cada pieza fotografiada en vista cenital como conforme o defectuosa en una sola llamada, con salida parseable (`<answer>Yes</answer>` / `<answer>No</answer>`) que se puede conectar directamente a un PLC o a un sistema MES para aceptar o rechazar la pieza.
- Clasificación del tipo de defecto: gracias a las etiquetas `<type>` y `<location>`, permite enrutar automáticamente cada rechazo a la estación de retrabajo o al proveedor correspondiente, en lugar de limitarse a una señal binaria.
- Generación de informes de no conformidad: el bloque `<think>` sirve como justificación textual que se puede adjuntar al expediente de calidad de cada lote, lo que reduce el trabajo manual de documentación en auditorías.
- Pre-anotación de datasets de inspección: usar el modelo como etiquetador preliminar sobre imágenes nuevas de la misma familia de productos y reservar la revisión humana para los casos con baja confianza, dado que el veredicto viene acompañado de razonamiento verificable.
- Asistencia a operarios de planta: con un despliegue en vLLM y la ruta de un solo turno, un operario puede subir la foto de una pieza dudosa y recibir veredicto, tipo y ubicación del defecto en lenguaje natural.
- Investigación reproducible en detección de anomalías con VLM: el repositorio incluye los ficheros `eval_*.json` por muestra y el protocolo exacto (greedy, 1.024 tokens nuevos, 262.144 píxeles), lo que permite replicar las cifras de DS-MVTec y VisA y comparar contra los checkpoints hermanos SFT-GRPO y KCR.
- Experimentos de destilación de profesor a alumno: dado que el corpus se generó con Gemini 2.5-Flash y el método KCR usa un juez Gemini-3-Flash, el checkpoint sirve como punto de partida para estudiar cómo se transfiere el razonamiento de un modelo grande a un VLM de 8B con supervisión pura.
- Validación cruzada en dominios adyacentes con reentrenamiento: el modelo se entrenó sobre 30 productos Real-IAD, por lo que cualquier aplicación en textil, metalurgia o electrónica distinta exige fine-tuning adicional y reevaluación propia antes de considerarse fiable.

## Benchmarks y rendimiento

Resultados publicados por el autor en los subconjuntos DS-MVTec (1.670 imágenes) y VisA (2.141 imágenes) de MMAD, con balanced accuracy (media de sensibilidad y especificidad), scoring estricto (una generación sin `<answer>` parseable cuenta como error), decodificación greedy, un máximo de 1.024 tokens nuevos, imágenes limitadas a 262.144 píxeles y generación con vLLM.

| Modelo | DS-MVTec | VisA |
|---|---|---|
| Qwen3-VL-8B-Instruct base, zero-shot | 78.68 | 64.45 |
| AnomalyThink-Qwen3-VL-8B-SFT (este modelo, 6K trazas Gemini, época 1) | 80.31 | 67.32 |
| AnomalyThink-Qwen3-VL-8B-SFT-GRPO (época 1, prompt de entrenamiento) | 87.14 | 72.39 |
| AnomalyThink-Qwen3-VL-8B-KCR (rollouts corregidos propios, época 2) | 84.39 | 76.63 |
| Referencia de tesis: Qwen2.5-VL entrenado sobre el corpus KCR | 85.82 | 76.45 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible, ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 17,5 GB solo de pesos (8.767.123.696 parámetros × 2 bytes), más caché KV y tokens de imagen; en la práctica conviene reservar 20-24 GB. Es una estimación aritmética a partir del número de parámetros declarado, no un dato publicado.
- Cuantización a int8: aproximadamente 9-10 GB de pesos, lo que abre el despliegue en GPU de 16 GB con margen ajustado. Estimación propia; el repositorio no publica checkpoints cuantizados.
- Cuantización a 4 bits: aproximadamente 5-6 GB de pesos. Estimación propia; requiere convertir los pesos, ya que no se distribuyen ficheros GGUF, AWQ ni GPTQ.
- GPU recomendadas: el entrenamiento se realizó con dos RTX A6000 (48 GB) con DeepSpeed ZeRO-3 y offload a CPU; para inferencia son adecuadas A100 40/80 GB, H100, L40S y, en bf16, tarjetas de 24 GB como RTX 4090 o RTX 3090 siempre que la longitud de generación y el tamaño de imagen se controlen.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) con bf16 y margen limitado, o en GPU de 16 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: transformers >= 5.0 con `AutoProcessor` y `AutoModelForImageTextToText`; para transformers 4.57 o vLLM 0.10.x hay que usar los ficheros de la carpeta `transformers4_vllm/` junto a `model.safetensors` (es la configuración con la que se produjeron todas las cifras de la tabla). No hay soporte publicado para llama.cpp u Ollama sin conversión previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | DS-MVTec | VisA | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AnomalyThink-Qwen3-VL-8B-SFT (este modelo) | 8,77 B | no disponible | 80.31 | 67.32 | apache-2.0 | HuggingFace (0 descargas registradas) |
| AnomalyThink-Qwen3-VL-8B-SFT-GRPO | no disponible (mismo backbone) | no disponible | 87.14 | 72.39 | no disponible | HuggingFace, mismo autor |
| AnomalyThink-Qwen3-VL-8B-KCR | no disponible (mismo backbone) | no disponible | 84.39 | 76.63 | no disponible | HuggingFace, mismo autor |
| Qwen/Qwen3-VL-8B-Instruct (base, zero-shot) | 8 B aprox. | no disponible | 78.68 | 64.45 | apache-2.0 según los tags del repositorio | HuggingFace, público |
| Qwen2.5-VL con corpus KCR (resultado de tesis) | no disponible | no disponible | 85.82 | 76.45 | no disponible | Documentado en la tesis, no enlazado a pesos |

La comparación con alternativas externas a la familia (otros VLM de 7-9 B aplicados a detección de anomalías industriales) no está disponible en la información proporcionada: no se aportan cifras de terceros bajo el mismo protocolo de evaluación.

## Limitaciones y advertencias

- Artefacto de investigación post-submission: los tres modelos Qwen3-VL-8B de la familia se entrenaron en septiembre de 2026, después de entregar la tesis, y no forman parte de sus resultados; se publican para reproducibilidad.
- Semilla única: no hay repeticiones con distintas semillas, por lo que no se conoce la varianza de las métricas publicadas.
- Evaluación de las explicaciones: no se realizó evaluación humana de los razonamientos generados; el bloque `<think>` es plausible, pero su corrección no está validada por anotadores.
- Selección de checkpoint sesgada a una métrica: la época 1 se eligió por ser la mejor en DS-MVTec, y VisA se reporta en el mismo checkpoint, no en su propio óptimo.
- Contaminación potencial del benchmark: las imágenes públicas de MMAD podrían haberse visto durante el preentrenamiento del backbone, algo que el autor señala que no puede descartarse para ningún modelo de la comparación.
- Riesgo de alucinación: el modelo genera localización (`<location>`) y tipo de defecto que pueden ser incorrectos aunque el veredicto binario sea acertado; una generación sin `<answer>` parseable se puntúa como error, lo que indica que el formato no es infalible.
- Alcance restringido: entrenado con 30 productos Real-IAD en vista cenital, con prompts en inglés y un mensaje de sistema fijo ("Please answer by yes or no"); no hay datos de rendimiento en otros dominios, idiomas ni ángulos de cámara.
- Dependencia de versión: el checkpoint se guardó con transformers 5.0.0 y, con transformers 4.57 o vLLM 0.10.x, exige usar los ficheros de `transformers4_vllm/`; ignorar esta ruta puede alterar los resultados.
- Licencia: apache-2.0 en el repositorio, lo que en principio permite uso comercial, pero al derivar de Qwen3-VL-8B-Instruct conviene verificar las condiciones del modelo base y de los datos de entrenamiento antes de un despliegue en producción.
- Sin cuantizaciones oficiales ni soporte declarado en llama.cpp u Ollama: cualquier despliegue en CPU o en GPU de gama baja requiere conversión propia y reevaluación.
- Métricas modestas en VisA: 67.32 frente a 76.63 del checkpoint KCR de la misma familia, lo que limita su uso en escenarios con mayor variabilidad de producto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aacudad/AnomalyThink-Qwen3-VL-8B-SFT
- Checkpoint hermano SFT-GRPO: https://huggingface.co/aacudad/AnomalyThink-Qwen3-VL-8B-SFT-GRPO
- Checkpoint hermano KCR: https://huggingface.co/aacudad/AnomalyThink-Qwen3-VL-8B-KCR
- Dataset de entrenamiento: https://huggingface.co/datasets/aacudad/AnomalyThink
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Tesis (TU Delft, 2026): https://resolver.tudelft.nl/uuid:65c62420-79c0-447f-b095-7fb11d4474fc
- Búsqueda web: no se recuperaron resultados relevantes sobre este modelo; los enlaces devueltos por el buscador (EcoleDirecte y su aplicación móvil) no guardan relación con el modelo ni con detección de anomalías industriales.
