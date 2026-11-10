# adidukrembzuai/MedChain-R1-9B

## Resumen

MedChain-R1-9B es un modelo vision-lenguaje de 9.409.813.744 parámetros (aproximadamente 9,4 mil millones) desarrollado por el usuario adidukrembzuai, un fine-tuning del modelo base Qwen/Qwen3.5-9B. Está especializado en *grounding* médico secuencial: dado un conjunto de imágenes médicas (típicamente dos o más) y una pregunta, el modelo genera un razonamiento breve entre etiquetas `<think>…</think>` y devuelve una única caja delimitadora en coordenadas de píxel dentro de `<answer>(x1,y1),(x2,y2)</answer>`. Resuelve el problema de localizar regiones anatómicas o patológicas en imágenes de radiología, resonancia magnética (MRI) y tomografía computarizada (CT), incluyendo tareas de comparación entre estudios.

El modelo se entrena en dos etapas sobre el corpus MedChain: primero un *chain-of-thought supervised fine-tuning* (CoT-SFT) sobre 152.396 secuencias de entrenamiento MedSG, cada una con una justificación condicionada a la caja anotada, y después un ajuste con GRPO (Group Relative Policy Optimization) usando una recompensa de IoU sobre un conjunto reservado de 30.000 prompts. El resultado es un modelo que combina razonamiento explícito con localización visual precisa, algo poco habitual en modelos médicos multimodales de este tamaño.

Su relevancia actual radica en que supera a modelos generales mucho más grandes (Qwen2.5-VL 72B, InternVL3 78B) y a modelos médicos especializados (HuatuoGPT-Vision 34B, Migician 7B) en la mayoría de tareas de MedSG-Bench, con 77,54 mIoU y 84,87 Acc@0.5. La licencia Apache 2.0 y el tamaño de 9B lo hacen viable para despliegue en infraestructura moderada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje transformer (base Qwen3.5-9B) con torre visual congelada durante GRPO |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en bf16/safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer multimodal con torre visual y proyector hacia el espacio de lenguaje, y se especializa mediante dos etapas. La primera es un CoT-SFT sobre el corpus MedChain, compuesto por 152.396 secuencias de entrenamiento MedSG; cada secuencia incluye una justificación condicionada a la caja anotada, generada por un borrador de FlemingVL-38B y refinada por Qwen3.5-397B-A17B usando la caja anotada como entrada privilegiada. Esta etapa enseña al modelo a producir un razonamiento breve antes de emitir la caja. El checkpoint publicado corresponde a la etapa CoT-SFT (checkpoint-2500).

La segunda etapa aplica GRPO con una recompensa basada en IoU sobre un pool reservado de 30.000 prompts (3.750 por tarea), con 8 rollouts por prompt y la torre visual congelada. El checkpoint final corresponde a dos épocas de GRPO sobre RL30K (paso 2500 de la segunda época, semilla 45). La innovación principal es el uso de razonamiento explícito encadenado con localización secuencial multi-imagen, donde el modelo debe identificar la imagen objetivo y la región correcta entre varias entradas. No se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de razonamiento explícito en etiquetas `<think>…</think>` antes de la respuesta.
- Localización visual (*grounding*) de regiones mediante cajas delimitadoras en coordenadas de píxel.
- Razonamiento secuencial sobre múltiples imágenes en una misma consulta.
- *Grounding* de diferencias entre estudios registrados y no registrados.
- *Grounding* multi-vista: localizar la misma estructura desde otra perspectiva.
- Seguimiento de objetos (lesiones o estructuras) a través de cortes o puntos temporales.
- *Grounding* de conceptos descritos textualmente entre imágenes.
- Localización de un parche (*patch*) dado dentro de la imagen objetivo.
- *Grounding* cross-modal: localizar el mismo hallazgo en otra modalidad (por ejemplo, FLAIR a DWI).
- *Grounding* referencial a partir de una descripción textual.
- Procesamiento de imágenes médicas en múltiples modalidades (radiología, MRI, CT).
- Soporte de conversación multi-turno vía plantilla de chat.
- No se documenta soporte de *tool calling*, *function calling* ni modo agente multi-paso.

## Casos de uso

- Comparación de estudios longitudinales: el modelo recibe dos exploraciones del mismo paciente y localiza la región que ha cambiado entre ambas, útil para seguimiento de lesiones en oncología o neurología.
- Seguimiento de lesiones entre cortes: en un volumen de MRI o CT, el modelo puede localizar la misma estructura o lesión a través de cortes consecutivos, facilitando la delineación asistida.
- Correspondencia cross-modal: dado un hallazgo en FLAIR, localizar la región equivalente en DWI, lo que apoya la correlación entre secuencias en neurorradiología.
- Anotación asistida de datasets: generar cajas candidatas para revisión humana en pipelines de etiquetado de imágenes médicas, reduciendo el coste de anotación manual.
- Recuperación visual guiada por texto: localizar la región que corresponde a una descripción clínica concreta ("la lesión hiperintensa en el lóbulo frontal"), útil en sistemas de búsqueda dentro de estudios.
- Verificación de coherencia entre vistas: comprobar que una estructura identificada en una vista aparece en la posición esperada en otra vista del mismo estudio.
- Asistencia a la docencia radiológica: señalar regiones de interés sobre imágenes para explicar hallazgos con cajas concretas.
- Preprocesado para pipelines de visión médica: generar regiones de interés que alimenten clasificadores o segmentadores posteriores.

## Benchmarks y rendimiento

Resultados en MedSG-Bench (8 tareas, 10 modalidades, 9.630 ejemplos de test), decodificación greedy, batch size 1, bf16, 1.200 tokens nuevos, evaluado en GPUs AMD MI210:

| Modelo | Tamaño | Avg IoU | Acc@0.5 |
|---|---:|---:|---:|
| Qwen2.5-VL | 72B | 13,35 | 6,12 |
| InternVL3 | 78B | 6,44 | 2,90 |
| Migician | 7B | 20,29 | 11,39 |
| HuatuoGPT-Vision | 34B | 8,57 | 2,09 |
| MedSeq-Grounder | 7B | 72,55 | 79,71 |
| Qwen3.5 (zero-shot) | 4B / 9B / 27B | 4,4–4,5 | 3,0–3,2 |
| MedChain-R1-9B (solo CoT-SFT) | 9B | 76,60 | 83,42 |
| MedChain-R1-4B | 4B | 75,97 | 83,67 |
| MedChain-R1-9B (este modelo) | 9B | 77,54 | 84,87 |

Desglose por tarea del modelo final (IoU): RDG 84,4; NRDG 83,5; MV 58,4; OT 68,5; Concept 75,5; Patch 91,3; Cross-modal 84,8; Referring 72,0.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 18,8 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 24 GB para una sola GPU con margen.
- GPU recomendadas: A100 40/80 GB, H100, L40S, AMD MI210 (usada en la evaluación oficial). En consumer, una RTX 4090 (24 GB) puede alojar los pesos en bf16 con margen ajustado; una RTX 3090 (24 GB) también es viable con cuidado en la longitud de contexto.
- Cuantización: no se documentan pesos GGUF ni cuantizaciones oficiales; para GPUs de menor VRAM habría que convertir manualmente a 8 o 4 bits.
- Opciones de despliegue: transformers (versión 5.2.0 según la model card) con `AutoModelForImageTextToText` y `qwen-vl-utils` 0.0.14. No se documenta compatibilidad oficial con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La model card indica generar un ejemplo a la vez, ya que la generación por lotes produjo salidas degeneradas en algunos checkpoints.
- Nota importante: se requiere añadir la instrucción de formato (`<think>…</think>` y `<answer>(x1,y1),(x2,y2)</answer>`) a cada pregunta, ya que es el prompt de entrenamiento y evaluación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MedSG-Bench mIoU / Acc@0.5 | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| MedChain-R1-9B | 9,4B | No disponible | 77,54 / 84,87 | Apache 2.0 | Hugging Face |
| MedChain-R1-4B | 4B | No disponible | 75,97 / 83,67 | Apache 2.0 | Hugging Face |
| MedSeq-Grounder | 7B | No disponible | 72,55 / 79,71 | No disponible | No disponible |
| Migician | 7B | No disponible | 20,29 / 11,39 | No disponible | No disponible |
| Qwen2.5-VL | 72B | No disponible | 13,35 / 6,12 | No disponible | No disponible |

MedChain-R1-9B mejora a su variante de 4B en 1,57 puntos de mIoU y 1,2 de Acc@0.5, y supera a MedSeq-Grounder (entrenado en MedSG-188K) en 4,99 puntos de mIoU. Frente a modelos generales mucho mayores (Qwen2.5-VL 72B, InternVL3 78B) la diferencia es de más de 60 puntos de mIoU, lo que refleja la especialización en *grounding* médico secuencial.

## Limitaciones y advertencias

- Modelo de investigación: no se documentan validaciones clínicas ni regulatorias; no debe usarse para diagnóstico sin supervisión profesional.
- Riesgo de alucinación: como todo modelo generativo, puede producir cajas plausibles pero incorrectas, especialmente en tareas con IoU bajo (MV 58,4 y OT 68,5 son las más débiles).
- Generación por lotes inestable: la model card advierte que la generación batched produjo salidas degeneradas en algunos checkpoints; se debe generar un ejemplo a la vez.
- Dependencia de la instrucción de formato: omitir el prompt de entrenamiento puede degradar la calidad de las cajas.
- Idiomas soportados no documentados; se desconoce el comportamiento fuera del inglés.
- Longitud de contexto no documentada; no se puede planificar el número máximo de imágenes por consulta.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-9B.
- Sesgos: no se documentan evaluaciones de sesgo demográfico, de modalidad ni de equipamiento; los datos provienen de un corpus médico con posible sobrerrepresentación de ciertas poblaciones o protocolos.
- Sin cuantizaciones oficiales: el despliegue en hardware de gama baja requiere conversión manual y validación adicional.
- Fecha de creación futura (2026-11-09) y cero descargas/likes en el momento de la consulta: modelo muy reciente y sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/adidukrembzuai/MedChain-R1-9B
- Variante 4B: https://huggingface.co/adidukrembzuai/MedChain-R1-4B
- Repositorio de código: https://github.com/adinathdukre/MedChain-R1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
