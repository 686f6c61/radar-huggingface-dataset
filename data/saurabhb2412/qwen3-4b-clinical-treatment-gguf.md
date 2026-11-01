# saurabhb2412/qwen3-4b-clinical-treatment-gguf

## Resumen

qwen3-4b-clinical-treatment-gguf es una exportación en formato GGUF de un ajuste fino del modelo Qwen3-4B de Alibaba, orientado a la generación de planes de tratamiento clínico y a la asignación de especialidad médica a partir de un caso de paciente y un diagnóstico diferencial ya ordenado. Lo publica el usuario saurabhb2412 en HuggingFace y se distribuye con licencia Apache 2.0. El resultado esperado es un objeto JSON con el plan de tratamiento y la especialización recomendada, lo que lo convierte en un artefacto de investigación para prototipos de apoyo a la decisión clínica más que en un producto sanitario.

El modelo parte de la arquitectura transformer densa de Qwen3-4B, con 4.022.468.096 parámetros totales y la ventana de contexto nativa de la familia Qwen3, aunque la model card no documenta explícitamente ni el contexto ni los idiomas soportados. Se ofrece en dos cuantizaciones: Q4_K_M (2,5 GB, pensada para CPU y portátiles) y F16 (8,0 GB, como referencia de máxima fidelidad). El repositorio completo ocupa 10,5 GB.

Su relevancia actual es doble: por un lado, demuestra el patrón de especialización de modelos pequeños (4B) mediante ajuste fino y empaquetado GGUF para despliegue local sin GPU dedicada; por otro, ilustra los riesgos de publicar modelos clínicos con evaluación limitada (120 pares) y sin validación clínica independiente. Las cifras de evaluación declaradas por el autor (100 % de validez JSON, 100 % de coincidencia en diagnóstico top-1 y 64,2 % en especialidad) corresponden al adaptador antes de la cuantización y no se han replicado sobre los ficheros GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3); detalles de capas y atención no disponibles |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Qwen3-4B) |
| Tipos de cuantizacion | Q4_K_M (2,5 GB) y F16 (8,0 GB); el autor sugiere Q6_K como alternativa si falla el parseo JSON |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (exportación de un merge adaptador + base; los pesos originales en safetensors no se incluyen en este repo) |

## Arquitectura y entrenamiento

El modelo es un merge del adaptador `saurabhb2412/qwen3-4b-clinical-treatment` sobre la base Qwen/Qwen3-4B, seguido de conversión a GGUF. La arquitectura subyacente es la de Qwen3-4B: un transformer denso de 4.022 millones de parámetros con el tokenizador y la plantilla de chat de la familia Qwen3 (formato ChatML con etiquetas `<|im_start|>` y `<|im_end|>`). La model card no detalla el número de capas, la configuración de atención ni el tamaño de la ventana de contexto, por lo que estos datos deben tomarse de la ficha del modelo base.

No se documentan ni el volumen de tokens de entrenamiento, ni la composición del dataset clínico, ni si hubo RLHF o DPO. La única información de evaluación es la del adaptador antes de cuantizar, medida sobre un conjunto canónico de 120 pares: validez del JSON del 100 %, coincidencia del diagnóstico top-1 del 100 % y coincidencia de especialidad del 64,2 %. El autor advierte explícitamente que la versión cuantizada no se ha reevaluado y que el 4-bit puede degradar el cumplimiento estricto del esquema JSON. La innovación técnica destacable es de empaquetado, no de arquitectura: plantilla de chat Qwen3, temperatura 0 recomendada y system prompt fijo que define la tarea de salida estructurada.

## Capacidades

- Generación de texto con salida estructurada en JSON: produce un plan de tratamiento y una especialidad médica a partir de un caso de paciente y un diagnóstico diferencial ordenado.
- Razonamiento clínico acotado: la tarea está restringida a la transformación caso + diferencial → plan + especialidad, no a diagnóstico abierto.
- Cumplimiento de esquema JSON: el autor reporta un 100 % de validez JSON en el adaptador sin cuantizar; en Q4_K_M puede degradarse.
- Conversación multi-turno: el repositorio está etiquetado como `conversational` y usa la plantilla de chat de Qwen3.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse en infraestructuras de inferencia compatibles con la API de HuggingFace.
- Capacidades multilingües: no documentadas en la información disponible; se heredarían, en su caso, de Qwen3-4B.
- Tool calling, function calling, agentes, visión y audio: no documentados en la información disponible.

## Casos de uso

- Prototipado de apoyo a la decisión clínica: dado un caso sintético o anonimizado y un diferencial ya priorizado por un clínico, el modelo genera un borrador de plan de tratamiento en JSON que puede revisarse manualmente antes de cualquier uso.
- Enrutamiento a especialidad: el campo de especialización del JSON permite clasificar casos en un servicio hospitalario o en un sistema de triaje administrativo, siempre con validación humana y sin sustituir el juicio clínico.
- Investigación en NLP clínico: sirve como línea base reproducible de un modelo de 4B ajustado para generación estructurada, útil para comparar técnicas de ajuste fino, merges y cuantización.
- Evaluación de robustez de salidas estructuradas: permite medir cómo afecta la cuantización Q4_K_M frente a F16 al parseo de JSON en un pipeline real, un caso de estudio frecuente en ingeniería de despliegue.
- Despliegue local en entornos con recursos limitados: los 2,5 GB de Q4_K_M permiten ejecutarlo en CPU o en portátiles para demos docentes y pruebas de concepto sin GPU.
- Integración en pipelines de extracción de datos clínicos: como paso de generación de JSON validable con un esquema, encadenado a un validador y a una cola de revisión humana.
- Formación y docencia: ejemplo didáctico de ajuste fino de un modelo pequeño, empaquetado GGUF y despliegue con llama.cpp u Ollama mediante un Modelfile.

## Benchmarks y rendimiento

Los únicos datos disponibles son la evaluación del adaptador antes de la cuantización, sobre un conjunto canónico de 120 pares. No hay comparación con otros modelos ni resultados en benchmarks estándar (MMLU, HumanEval, GSM8K).

| Metrica | Resultado (adaptador, pre-cuantizacion) | Conjunto |
|---|---|---|
| Validez del JSON | 100 % | 120 pares canonicos |
| Coincidencia diagnostico top-1 | 100 % | 120 pares canonicos |
| Coincidencia de especialidad | 64,2 % | 120 pares canonicos |

No se han publicado resultados de benchmarks estándar en la información disponible, ni evaluaciones de las versiones GGUF Q4_K_M o F16.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5 GB en Q4_K_M y 8,0 GB en F16, más el overhead de contexto y del runtime (no cuantificado en la información disponible).
- GPU recomendadas: no especificadas por el autor. Por tamaño, Q4_K_M cabe en GPUs de consumo con 4-6 GB de VRAM; F16 requiere alrededor de 10-12 GB, lo que encaja en RTX 4080/4090, A10, L4 o superiores.
- Cabe en GPU de consumo: sí, Q4_K_M en tarjetas de 4 GB o más; F16 en tarjetas de 12 GB o más. También es viable en CPU.
- Opciones de despliegue: llama.cpp (`llama-server` con `--chat-template qwen3`), Ollama mediante Modelfile con plantilla ChatML y temperatura 0, y cualquier runtime compatible con GGUF. El autor no documenta vLLM ni TGI para estos ficheros.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| qwen3-4b-clinical-treatment-gguf | 4,02 B | No disponible | GGUF (Q4_K_M, F16) | Apache 2.0 | Ajuste fino clínico con salida JSON |
| Qwen/Qwen3-4B (base) | 4,02 B | No disponible en esta ficha | Safetensors, GGUF de la comunidad | Apache 2.0 | Modelo generalista multilingüe |
| Adaptador `saurabhb2412/qwen3-4b-clinical-treatment` | 4,02 B (base + adaptador) | No disponible | Adaptador (PEFT) | Apache 2.0 | Mismo ajuste fino, sin cuantizar |
| Alternativas clínicas de 4B en GGUF | No disponible | No disponible | GGUF | Variable | No se dispone de datos comparables en la información proporcionada |

La comparación cuantitativa de rendimiento frente a alternativas no está disponible: no hay benchmarks comunes ni evaluaciones independientes.

## Limitaciones y advertencias

- No es un producto sanitario: el propio autor lo califica de artefacto de investigación; no debe usarse para decisiones clínicas sin supervisión de un profesional titulado.
- Evaluación muy limitada: 120 pares canónicos, sin conjunto de test independiente, sin validación externa y sin reevaluación tras la cuantización.
- Coincidencia de especialidad del 64,2 %: aproximadamente uno de cada tres casos asignaría una especialidad incorrecta en la evaluación declarada.
- Degradación por cuantización: el autor advierte que Q4_K_M puede romper el cumplimiento estricto del JSON; si el parseo falla, recomienda F16 o Q6_K.
- Riesgo de alucinación: al ser un modelo de 4B especializado en dominios de alto riesgo, puede generar tratamientos o especialidades plausibles pero incorrectos, incluidos fármacos o dosis no sustentados.
- Sesgos: no documentados; se heredarían los de Qwen3-4B y los del dataset de ajuste, que no se describe.
- Idiomas: no especificados; el comportamiento fuera del inglés no está evaluado.
- Contexto: no documentado; casos clínicos largos podrían truncarse sin aviso.
- Licencia Apache 2.0: permite uso comercial, pero ello no exime de las obligaciones regulatorias sanitarias (MDR, FDA) ni de la responsabilidad profesional.
- Datos de pacientes: el modelo no incorpora garantías de privacidad; no debe introducirse información identificable sin un marco de cumplimiento (RGPD) y anonimización previa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/saurabhb2412/qwen3-4b-clinical-treatment-gguf
- Adaptador base del ajuste: https://huggingface.co/saurabhb2412/qwen3-4b-clinical-treatment
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
