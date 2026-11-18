# Kujira/Qwen3.8-27B-GSQ-RCO-IQ2_XS-mtp-CHiPS-Abliterated-v1

## Resumen

Qwen3.8-27B-GSQ-RCO-IQ2_XS-mtp-CHiPS-Abliterated-v1 es una versión modificada del modelo Qwen3.8-27B, publicado originalmente por el equipo Qwen, en su cuantización GSQ-RCO de ISTA DASLab (Instituto de Ciencia y Tecnología de Austria). El autor de esta ficha, Kujira, ha aplicado una técnica denominada CHiPS (Causal Head-isolated Projection Steering) para reducir drásticamente el comportamiento de rechazo del modelo original, pasando de un 88,5% a un 1% en un conjunto de peticiones dañinas, manteniendo el resto de tensores byte-idénticos al archivo original.

El modelo conserva la arquitectura del Qwen3.8-27B original (27.320.697.856 parámetros, transformer denso, sin datos de contexto disponibles en la información proporcionada) y mantiene la cabeza MTP (multi-token prediction) para decodificación especulativa. La cuantización IQ2_XS reduce el peso a 8,8 GB, lo que permite su despliegue en hardware de consumo. La licencia es Apache-2.0.

La relevancia de esta ficha radica en que documenta un caso de modificación quirúrgica de comportamiento (abliteración) sobre un modelo de gran tamaño, con métricas de evaluación detalladas que comparan el original, una build alternativa (Heretic) y esta versión, incluyendo pruebas de rechazo, tareas largas, tool calling y perplejidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8-27B), con cabeza MTP para decodificación especulativa |
| Parámetros totales | 27.320.697.856 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | IQ2_XS (único archivo publicado, 8,8 GB) |
| Idiomas soportados | No disponibles (evaluación en inglés y japonés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer denso de 27.320 millones de parámetros. La versión aquí documentada parte de la cuantización GSQ-RCO de ISTA DASLab, que aplica cuantización GSQ (probablemente "Grouped Scaling Quantization") y RCO (probablemente "Rotation-based Calibration Optimization", según los tags y referencias arXiv:2604.18556 y arXiv:2605.00649). El archivo incluye la cabeza MTP (multi-token prediction) para decodificación especulativa, lo que permite generar varios tokens por paso y reducir latencia.

La modificación CHiPS (Causal Head-isolated Projection Steering) actúa sobre un subconjunto muy pequeño de tensores, dejando el resto byte-idénticos al original. Según la model card, la receta no está publicada y las mediciones del artículo se realizaron sobre otros modelos. No se dispone de información sobre el dataset de entrenamiento original (número de tokens, composición, RLHF/DPO) en la información proporcionada.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso (thinking mode habilitado en las evaluaciones).
- Tool calling / function calling: evaluado con 40 tareas, con un 97% de acierto en nombre de herramienta y 100% en argumentos.
- Seguimiento de tareas largas: 24 tareas multi-paso evaluadas, con una media de 2.083 tokens generados.
- Capacidades multilingües: evaluación en inglés y japonés; no se dispone de lista completa de idiomas.
- Decodificación especulativa mediante cabeza MTP.
- Visión: el proyector visual (mmproj) no está incluido en este repositorio; no se ha probado el uso con visión.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de rechazo y su modificación quirúrgica, comparando con el original y con la build Heretic en conjuntos de peticiones dañinas y benignas.
- Generación de código en pipelines: con tool calling fiable (97% nombre correcto, 100% argumentos) y perplejidad en código de 3,982, puede integrarse en asistentes de programación que requieran ejecución de herramientas.
- Atención al cliente automatizada: aunque no se probaron conversaciones multi-turno ni system prompts, el modelo soporta generación conversacional y puede gestionar respuestas largas (media de 2.083 tokens en tareas largas).
- Despliegue en hardware de consumo: el archivo GGUF de 8,8 GB con cuantización IQ2_XS permite ejecución local en GPUs con 12-16 GB de VRAM mediante llama.cpp.
- Evaluación de robustez de cuantizaciones: sirve como referencia para comparar el impacto de la abliteración en perplejidad (diferencias <0,3% en inglés, japonés, código y corpus general).
- Generación de contenido creativo sin restricciones de rechazo: para usuarios que necesiten respuestas a peticiones que el modelo original rechazaría, con la advertencia de que puede producir contenido dañino o inexacto.
- Pruebas de decodificación especulativa: la cabeza MTP incluida permite medir aceleración en inferencia con llama.cpp.

## Benchmarks y rendimiento

Los datos de la model card comparan tres archivos de la misma cuantización IQ2_XS-mtp: original, Heretic y este modelo.

| Métrica | Original | Heretic | Este modelo |
|---|---|---|---|
| Rechazo en peticiones dañinas | 88,5% | 1% | 1% |
| Rechazo en peticiones benignas | 4% | 1% | 1% |
| Bucles (dañinas / benignas) | 0% / 1% | 1% / 1% | 0% / 0% |
| Respuestas vacías (dañinas / benignas) | 0% / 2% | 1% / 2% | 2% / 2% |
| Tareas largas: límite de tokens | 8% | 21% | 12% |
| Tareas largas: bucles | 0% | 0% | 4% (1 tarea) |
| Tareas largas: salida vacía | 4% | 4% | 4% |
| Tareas largas: tokens medios | 2.151 | 2.260 | 2.083 |
| Tool calls: nombre / argumentos correctos | 97% / 100% | 100% / 100% | 97% / 100% |
| Sin tool call cuando no se necesita | 90% | 100% | 90% |
| Turno de seguimiento tras resultado | 100% | 100% | 100% |

Perplejidad (teacher-forced, chunks de 512 tokens, textos internos):

| Corpus | Original | Este modelo |
|---|---|---|
| Inglés | 5,553 | 5,546 |
| Japonés | 18,333 | 18,355 |
| Código | 3,978 | 3,982 |
| Corpus general | 4,161 | 4,161 |

Las diferencias de perplejidad están dentro del 0,3%. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8,8 GB para el archivo GGUF IQ2_XS, más overhead de contexto KV (q8_0 en las evaluaciones). Con contexto moderado, cabe en GPUs de 12 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090, A100, H100. Para mayor throughput, GPUs con más VRAM permiten mayor contexto y batch.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB o superiores con cuantización IQ2_XS.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama (si se convierte el GGUF), y cualquier runtime compatible con GGUF. No se mencionan vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles en la información proporcionada. La cabeza MTP permite decodificación especulativa, pero no se aportan cifras de aceleración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.8-27B CHiPS Abliterated) | 27,3B | No disponible | Apache-2.0 | GGUF IQ2_XS | Rechazo 1% en dañinas, perplejidad casi idéntica al original |
| Qwen3.8-27B-GSQ-RCO original (ISTA DASLab) | 27,3B | No disponible | Apache-2.0 | GGUF IQ2_XS-mtp | Rechazo 88,5% en dañinas |
| Qwen3.8-27B-Heretic (0bserverx) | 27,3B | No disponible | Apache-2.0 | GGUF | Rechazo 1%, pero 21% de tareas largas alcanzan límite de tokens |
| Qwen3.8-27B (Qwen team) | 27,3B | No disponible | Apache-2.0 | Safetensors (original) | Modelo base sin cuantizar |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos, pero al ser una abliteración, el modelo puede producir contenido ofensivo, dañino o inexacto con mayor frecuencia que el original.
- Riesgo de alucinación: no se han publicado métricas de veracidad; la perplejidad se mantiene similar al original, pero la eliminación de rechazos puede aumentar respuestas inventadas ante peticiones dañinas.
- Limitaciones de contexto o idioma: no se dispone de longitud de contexto oficial; la evaluación solo cubrió inglés y japonés, y no se probaron conversaciones multi-turno ni system prompts.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el autor advierte que el usuario es responsable de cumplir las leyes aplicables y de añadir salvaguardas antes de usar el modelo con terceros.
- Caveats para producción: la evaluación de rechazos se hizo por coincidencia de frases, sin revisión humana; los conjuntos son pequeños (1 petición ≈ 1%); solo se probaron peticiones de un turno sin system prompt; no se probó visión; el único archivo disponible es IQ2_XS-mtp, lo que limita la calidad frente a cuantizaciones mayores.

## Enlaces

- Hugging Face: https://huggingface.co/Kujira/Qwen3.8-27B-GSQ-RCO-IQ2_XS-mtp-CHiPS-Abliterated-v1
- Modelo base cuantizado: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Build Heretic: https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-GSQ-RCO-GGUF
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Artículo sobre CHiPS: https://balaena01.github.io/chips-steering/
- Paper GSQ (arXiv:2604.18556): https://arxiv.org/abs/2604.18556
- Paper RCO (arXiv:2605.00649): https://arxiv.org/abs/2605.00649
