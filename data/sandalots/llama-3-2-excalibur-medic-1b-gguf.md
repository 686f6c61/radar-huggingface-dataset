# Sandalots/Llama-3.2-EXCALIBUR-Medic-1B-GGUF

## Resumen

Llama-3.2-EXCALIBUR-Medic-1B-GGUF es un modelo de 1B parámetros especializado en respuesta a preguntas clínicas de referencia, desarrollado por Sandy MacDonald (Sandalots) como parte de su tesis de máster en la Universidad de Aberdeen. Se trata de un fine-tune de `meta-llama/Llama-3.2-1B-Instruct` mediante destilación de conocimiento desde un modelo profesor de 8B (`Llama3-OpenBioLLM-8B`), orientado a un caso de uso muy concreto: inferencia offline en dispositivos de borde de 2 GB, como una Raspberry Pi 5.

La característica diferencial del modelo es que no está diseñado para responder de memoria, sino para responder a partir de un pasaje de referencia recuperado (RAG). El autor proporciona además un runtime de inferencia en su repositorio de GitHub que localiza el pasaje fuente, aplica cinco comprobaciones de seguridad y rechaza responder cuando no existe una fuente adecuada. El modelo se distribuye únicamente en formato GGUF cuantizado a Q4_K_M (807 MB).

Con 1.235.814.432 parámetros y una ventana de contexto de trabajo de 2.048 tokens, el modelo es relevante por su enfoque en eficiencia extrema y seguridad en el dominio médico, no por su capacidad bruta. Es un ejemplo de destilación hacia modelos pequeños con un protocolo de uso estricto (temperatura 0, formato etiquetado, respuesta anclada a fuente).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), fine-tune con LoRA fusionado |
| Parametros totales | 1.235.814.432 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (configuración de despliegue recomendada) |
| Tipos de cuantizacion | Q4_K_M con importance matrix (imatrix); KV cache q8_0 en el despliegue de referencia |
| Idiomas soportados | en (inglés) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | GGUF (`excalibur-medic-1b-Q4_K_M.gguf`, 807 MB) |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Llama-3.2-1B-Instruct` (cargado vía `mlx-community/Llama-3.2-1B-Instruct-bf16`) y se entrena con LoRA sobre razonamientos y respuestas generados por el profesor `aaditya/Llama3-OpenBioLLM-8B` en 4 bits. El ajuste consistió en 2.500 pasos con 11,3 millones de parámetros entrenables (0,9 % del total). Los datos de entrenamiento son 4.900 ejemplos del profesor que pasaron un filtro de calidad (de 6.000 generados se conservaron 5.485), más 160 ejemplos de rechazo y aclaración. Las preguntas fuente provienen de MedQuAD (NIH), divididas por condición para que ninguna condición aparezca simultáneamente en entrenamiento y test.

El modelo se entrena para responder en dos bloques etiquetados, `<reasoning>` y `<answer>`, a partir de un pasaje de referencia incluido en el mensaje de usuario. Tras el entrenamiento, el adaptador LoRA se fusiona en el modelo base, se convierte a GGUF y se cuantiza a Q4_K_M usando una importance matrix. Todo el proceso se realizó en un MacBook Pro M3 Pro (18 GB) con Apple MLX. La innovación principal no es arquitectónica sino de protocolo: formato de salida etiquetado, anclaje estricto a la fuente y comportamiento de rechazo entrenado explícitamente.

## Capacidades

- Generación de respuestas a preguntas clínicas de referencia a partir de un pasaje recuperado.
- Razonamiento breve estructurado dentro de etiquetas `<reasoning>` antes de la respuesta en `<answer>`.
- Citación y anclaje al texto fuente: el modelo fue entrenado para responder solo desde el material de referencia proporcionado.
- Rechazo y aclaración: 16 de 16 rechazos correctos en preguntas fuera de tema o personales no vistas en entrenamiento, con 0 de 40 falsos rechazos en preguntas respondibles.
- Cumplimiento de formato: 97,5 % de respuestas en el formato requerido frente a 0 de 40 del modelo base.
- Inferencia offline en dispositivos de borde (Raspberry Pi 5 de 2 GB).
- No soporta tool calling ni function calling (no documentado).
- No soporta agentes ni razonamiento multi-paso más allá del bloque de razonamiento único.
- Multilingüe: no, solo inglés.
- No dispone de visión, audio ni modo thinking extendido.

## Casos de uso

- Asistencia clínica de referencia offline en entornos sin conectividad: el modelo responde a preguntas que nombran una condición o un fármaco usando un pasaje recuperado localmente, con un consumo de ~5,4 W y sin throttling térmico en pruebas de 40 minutos sobre Raspberry Pi 5.
- Despliegue en dispositivos de borde con 2 GB de RAM: con 1.638 MB de memoria pico y 2.048 tokens de contexto, cabe en hardware de bajo coste para consulta de referencia en campo (clínicas rurales, ambulancias, entornos aislados).
- Investigación en destilación y RAG médico: sirve como banco de pruebas reproducible para estudiar el anclaje a fuente en modelos pequeños, con métricas de grounding publicadas (0,314 sin retrieval, 0,705 con retrieval, 0,716 con pasaje correcto).
- Filtrado y rechazo seguro en pipelines de QA clínica: los 160 ejemplos de rechazo y aclaración y las cinco comprobaciones de seguridad del runtime permiten integrarlo como primera capa que deriva a un clínico cuando la pregunta requiere exploración, imagen o analíticas.
- Extracción de posología y advertencias de etiquetas FDA: el runtime del autor realiza citas literales de dosis y advertencias de etiquetas de fármacos, lo que permite construir un buscador de referencia con trazabilidad de la fuente.
- Docencia y demostraciones de IA médica responsable: el modelo y su tesis documentan un caso completo de extremo a extremo (destilación, cuantización, evaluación de seguridad y despliegue en borde) útil para formación en ingeniería de IA clínica.
- Prototipado de asistentes de referencia con temperatura 0: al usar decodificación greedy se evita la degradación observada a temperaturas mayores (pérdida de elementos de listas, como nombres de fármacos), lo que lo hace adecuado para demos deterministas.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Respuestas en formato `<reasoning>`/`<answer>` (base vs. este modelo) | 0 de 40 → 97,5 % |
| Grounding sin retrieval | 0,314 |
| Grounding con retrieval | 0,705 |
| Grounding con pasaje correcto | 0,716 |
| Rechazos en preguntas fuera de tema y personales no vistas | 16 de 16 |
| Falsos rechazos en preguntas respondibles | 0 de 40 |
| Respuestas con números no presentes en la fuente (n=40) | 1 de 40 |
| Respuestas que contradicen la fuente (n=40) | 0 de 40 |
| Generación en Raspberry Pi 5 (2 GB) | ~14,6 tokens/s |
| Memoria pico en Raspberry Pi 5 (contexto 2.048, KV cache q8_0) | 1.638 MB |
| Consumo durante generación | ~5,4 W |
| Estabilidad térmica | sin throttling en pruebas de 40 minutos |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: ~1,6 GB con cuantización Q4_K_M y contexto de 2.048 tokens con KV cache q8_0 (medido: 1.638 MB pico).
- Cabe en GPUs consumer de gama baja y en hardware integrado; el despliegue de referencia es una Raspberry Pi 5 de 2 GB.
- GPU recomendadas: no se especifican en la documentación; cualquier GPU con ≥2 GB de memoria libre es suficiente en teoría, aunque no hay datos medidos en GPU.
- Despliegue: `llama.cpp` mediante `llama-server` con `-c 2048 -t 2 -tb 4 --jinja --temp 0`; también compatible con el runtime `excalibur_inference.py` del repositorio del autor, que añade retrieval y comprobaciones de seguridad.
- Latencia y throughput: ~14,6 tokens/s en Raspberry Pi 5; no hay datos de latencia ni throughput en GPU.
- No se documenta soporte para vLLM, TGI ni Ollama en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| EXCALIBUR-Medic-1B | 1,24B | 2.048 | QA médica con RAG en borde | Llama 3.2 Community | GGUF Q4_K_M |
| Llama-3.2-1B-Instruct (base) | 1,24B | 128K (modelo base) | Instrucciones generales | Llama 3.2 Community | safetensors, GGUF |
| Llama3-OpenBioLLM-8B (profesor) | 8B | no disponible | Dominio biomédico | Meta Llama 3 Community | safetensors, GGUF |

El modelo base Llama-3.2-1B-Instruct ofrece una ventana de contexto mucho mayor (128K según la documentación de Meta) pero no cumple el formato etiquetado (0 de 40) ni está entrenado para anclaje a fuente. El profesor OpenBioLLM-8B tiene mayor conocimiento médico pero requiere ~8 veces más parámetros y no está pensado para dispositivos de 2 GB. No se dispone de datos de benchmarks comparativos adicionales en la información proporcionada.

## Limitaciones y advertencias

- El grounding mide solapamiento con el texto fuente, no corrección médica; ningún clínico ha revisado las salidas.
- Los conjuntos de evaluación son pequeños: 40 preguntas respondibles y 16 no respondibles.
- Las fuentes de entrenamiento y recuperación son de EE. UU. (NIH, FDA, MedlinePlus), lo que puede introducir sesgo geográfico y de práctica clínica.
- Solo admite un turno: no tiene memoria de preguntas anteriores.
- Sin retrieval, produce texto médico fluido pero poco fiable.
- A temperatura mayor que 0 se observó degradación: omisión de elementos de listas de la fuente (por ejemplo, nombres de fármacos en una lista de tratamiento). Se recomienda decodificación greedy.
- No es un dispositivo médico: no debe usarse para diagnóstico, decisiones de tratamiento, triaje ni preguntas sobre personas concretas; sus respuestas no han sido validadas clínicamente.
- Riesgo de alucinación en dosis y estadísticas si se usa fuera del protocolo de referencia; el modelo fue entrenado para no inventarlas, pero solo se midió 1 de 40 respuestas con números no presentes en la fuente.
- Licencia Llama 3.2 Community: uso comercial permitido con condiciones, sujeto además a la Acceptable Use Policy de Meta; los ejemplos de entrenamiento derivan de Llama 3 (Meta Llama 3 Community License) y las preguntas de MedQuAD (CC BY 4.0).
- Solo inglés; sin soporte multilingüe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sandalots/Llama-3.2-EXCALIBUR-Medic-1B-GGUF
- Repositorio GitHub (código, tesis y demostración en vídeo): https://github.com/Sandalots/excalibur-medic
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Modelo profesor: https://huggingface.co/aaditya/Llama3-OpenBioLLM-8B
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Política de uso aceptable Llama 3.2: https://www.llama.com/llama3_2/use-policy/
- Licencia Meta Llama 3: https://www.llama.com/llama3/license/
- MedQuAD (CC BY 4.0): https://creativecommons.org/licenses/by/4.0/
- ORCID del autor: https://orcid.org/0009-0002-6153-7592
