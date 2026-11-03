# nallaworks/qwen3.8-27b-leaf-symptoms-lora

## Resumen

El modelo `nallaworks/qwen3.8-27b-leaf-symptoms-lora` es un adaptador LoRA sobre el modelo base Qwen/Qwen3.8-27B, un vision-language model de 27.000 millones de parámetros. Lo desarrolla el autor A. L. R. Siriani en el marco de un estudio académico sobre la brecha entre laboratorio y campo en la lectura estructurada de síntomas foliares, financiado por la FAPESP (grant #2026/18049-6) y vinculado a la Fatec Pompeia. El adaptador convierte una fotografía de hoja en un objeto JSON con especie, estado, condición y confianza, sobre un espacio cerrado de 27 clases y 13 especies.

El problema que aborda es la adaptación de dominio de un VLM generalista a una tarea agronómica muy específica, midiendo explícitamente la degradación de rendimiento cuando se pasa de imágenes de laboratorio (PlantVillage) a imágenes de campo (PlantDoc, PlantWild, CCMT). Es relevante porque publica resultados separados por dominio y libera todos los adaptadores del estudio, lo que permite reproducir el análisis de transferencia.

El adaptador es pequeño (0,4 GB en el repositorio) y se aplica sobre el modelo base en bfloat16, que requiere unos 55 GB de VRAM. El entrenamiento se hizo en una NVIDIA DGX Spark durante 8,2 horas con una sola época sobre 6.390 imágenes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre un transformer vision-language (Qwen3.8-27B) |
| Parámetros totales | no disponible (el adaptador LoRA es de rango 16; el base es de 27B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el autor reporta uso en bfloat16) |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 aplicado sobre Qwen/Qwen3.8-27B, un modelo de la familia Qwen con capacidad image-text-to-text. No se modifican los pesos del modelo base; se entrenan únicamente las matrices de bajo rango. La tarea se formula como generación de un JSON estructurado con cuatro campos (`species`, `status`, `condition`, `confidence`) restringido a 27 clases.

El entrenamiento consistió en una época sobre 6.390 imágenes, combinando PlantVillage (imágenes de laboratorio) y PlantDoc (imágenes de campo), condición denominada "PV+PD". Se usó una tasa de aprendizaje de 1e-4 y el proceso completo tardó 8,2 horas en una NVIDIA DGX Spark. Las imágenes se redimensionaron de modo que el lado más largo quedase en 768 píxeles. No se reporta uso de RLHF ni DPO; el ajuste es supervisado sobre pares imagen-respuesta JSON. Los detalles de entrenamiento están en `train_meta.json` y `train_log.jsonl` del repositorio.

## Capacidades

- Lectura de síntomas foliares a partir de una imagen y salida en JSON estructurado.
- Clasificación sobre 27 clases de enfermedad/estado y 13 especies (apple, bell pepper, blueberry, cherry, corn, grape, peach, potato, raspberry, soybean, squash, strawberry, tomato).
- Salida de una puntuación de confianza autodeclarada (no calibrada).
- Procesamiento de imágenes de laboratorio y de campo (entrenado en ambas).
- Capacidad image-text-to-text heredada del modelo base Qwen3.8-27B.
- No se documenta soporte de tool calling, agentes ni multi-step reasoning específico para este adaptador.
- Capacidades multilingües: solo inglés.

## Casos de uso

- Triaje agronómico asistido: el adaptador genera un JSON con especie y condición que un técnico puede revisar antes de decidir un tratamiento; adecuado porque la salida estructurada se integra directamente en un sistema de gestión de cultivos.
- Investigación sobre adaptación de dominio: permite reproducir el experimento lab-to-field del estudio y comparar con los adaptadores PlantVillage-only y PlantDoc-only publicados en el mismo repositorio Zenodo.
- Etiquetado semiautomático de imágenes de campo: con revisión humana, puede preetiquetar lotes de fotografías de hojas para acelerar la anotación de nuevos datasets.
- Aplicaciones móviles de apoyo al agricultor: el adaptador es ligero (0,4 GB) y se puede servir junto al base en infraestructura con GPU de 55 GB, ofreciendo una respuesta estructurada sobre 13 cultivos frecuentes.
- Control de calidad en invernadero: integrado en un pipeline de captura de imágenes, permite detectar cambios de condición en hojas de tomate, patata o vid, siempre con validación humana.
- Docencia y formación agronómica: sirve para ilustrar cómo un VLM generalista se especializa con LoRA y para discutir sus límites en condiciones reales de campo.

## Benchmarks y rendimiento

Resultados de precisión (%) reportados por el autor:

| Conjunto de test | Precisión |
|---|---|
| PlantVillage (laboratorio) | 92,2 |
| PlantDoc (campo) | 80,1 |
| PlantDoc leaf crops | 70,9 |
| PlantWild (externo) | 73,2 |
| CCMT (fotos de granja) | 49,9 |
| iNaturalist (solo especie) | 79,6 |

Tamaños de los conjuntos: PlantVillage 540, PlantDoc 236, crops 422, PlantWild 1.256 (27 clases), CCMT 395 (4 clases), iNaturalist 240 fotografías posteriores a septiembre de 2026 (12 especies). La mayoría de los errores restantes son confusiones entre enfermedades de la misma especie. No se proporcionan comparaciones numéricas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: unos 55 GB en bfloat16 para el modelo base más el adaptador.
- GPU recomendadas: NVIDIA A100 80 GB, H100, o cualquier GPU con al menos 55 GB de memoria; el autor entrenó en una NVIDIA DGX Spark.
- No cabe en GPU de consumo convencionales (RTX 4090 con 24 GB, RTX 3090 con 24 GB) en bfloat16; se requeriría cuantización, no documentada por el autor.
- Opciones de despliegue: transformers con PEFT (`PeftModel.from_pretrained`) y `AutoModelForImageTextToText`; no se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión campo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.8-27b-leaf-symptoms-lora (este) | 27B base + LoRA r16 | no disponible | 80,1 % PlantDoc | Apache 2.0 | HuggingFace |
| Adaptadores PlantVillage-only del mismo estudio | 27B base + LoRA | no disponible | no disponible en esta ficha | Apache 2.0 | Zenodo |
| Adaptadores PlantDoc-only del mismo estudio | 27B base + LoRA | no disponible | no disponible en esta ficha | Apache 2.0 | Zenodo |
| Modelos más pequeños del mismo estudio | no disponible | no disponible | no disponible en esta ficha | Apache 2.0 | Zenodo |

No se dispone de datos de benchmarks de modelos externos comparables en la información proporcionada.

## Limitaciones y advertencias

- Espacio de etiquetas cerrado: 27 clases sin opción "other" ni "unknown"; enfermedades o cultivos fuera de la lista (por ejemplo, roya de la soja, cítricos, café, caña de azúcar) se fuerzan a una de las clases existentes.
- La confianza autodeclarada no está calibrada.
- La precisión en campo está lejos de ser perfecta; en fotografías reales de granja (CCMT) baja a aproximadamente el 50 %.
- PlantDoc y PlantWild son conjuntos recopilados de la web, con posibles sesgos de recolección.
- Uso previsto: investigación y triaje con revisión humana, no diagnóstico autónomo ni decisiones de tratamiento.
- Requiere exactamente el prompt de entrenamiento (`prompt.txt`) y redimensionado a 768 px en el lado más largo; desviarse de ello puede degradar la salida.
- Solo inglés.
- El modelo base Qwen3.8-27B debe descargarse por separado y cumple su propia licencia.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/nallaworks/qwen3.8-27b-leaf-symptoms-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio del estudio (código, predicciones y adaptadores): https://doi.org/10.5281/zenodo.23898477
- Prompt de entrenamiento: `prompt.txt` en el repositorio de HuggingFace
- Metadatos de entrenamiento: `train_meta.json` y `train_log.jsonl` en el repositorio de HuggingFace
- Cita: Siriani, A. L. R. (2026). *Does the lab-to-field gap hold for vision-language models? Zero-shot and LoRA benchmarks of open VLMs for structured leaf-symptom reading on PlantVillage, PlantDoc and PlantWild*. Enviado a *Computers and Electronics in Agriculture*.
