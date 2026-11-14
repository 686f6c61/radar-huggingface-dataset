# arxohq/Arxo-Materia-0.8B-MedCalc-0.1

## Resumen

Arxo-Materia-0.8B-MedCalc-0.1 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por arxohq, especializado en resolver cálculos médicos a partir de notas clínicas. El modelo lee una nota de paciente, extrae los valores relevantes y aplica la fórmula o escala correspondiente (aclaramiento de creatinina, CHA2DS2-VASc, APACHE II, entre otras) mostrando el desarrollo paso a paso y terminando con la respuesta en formato JSON. Resuelve un problema muy concreto: la aplicación fiable de calculadoras clínicas sobre texto libre, una tarea donde los modelos generalistas fallan con frecuencia por errores de extracción de datos y de sustitución en fórmulas.

El modelo se distribuye como adaptador PEFT (LoRA) de pequeño tamaño (el repositorio ocupa 0,1 GB) y requiere cargar el modelo base Qwen3.5-0.8B mediante `AutoModelForImageTextToText`. Está entrenado y evaluado exclusivamente en inglés sobre el conjunto MedCalc-Bench Verified (1.100 casos de test), cubriendo las 55 calculadoras de dicho benchmark.

Su relevancia actual radica en que demuestra que un modelo de 0,8B de parámetros, con un único entrenamiento LoRA, supera a alternativas mucho mayores en una tarea clínica acotada: alcanza un 70,9% de precisión sin herramientas, frente al 31,5% del modelo base sin entrenar y por encima de Qwen3-8B con SFT directo (69,46%). Es un lanzamiento de investigación, no un dispositivo médico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-0.8B; se carga con `AutoModelForImageTextToText` |
| Parametros totales | 0,8B (modelo base); el adaptador LoRA añade un subconjunto no especificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos del adaptador se distribuyen en safetensors; el modelo base admite las cuantizaciones habituales de Qwen3.5-0.8B) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado sobre Qwen/Qwen3.5-0.8B, un transformer de 0,8B de parámetros. El adaptador se aplica sobre el modelo base cargado con `AutoModelForImageTextToText` (no con `AutoModelForCausalLM`), lo que condiciona el pipeline de carga. El entrenamiento se realizó con un system prompt específico que instruye al modelo a razonar paso a paso: extraer valores de la nota, hacer conversiones de unidades, sustituir en cada fórmula operación a operación y, en el caso de escalas de puntuación, emitir una línea por ítem con la cita de respaldo o `not mentioned`, la decisión y los puntos. La salida termina siempre con una línea `{"answer": "<value>"}`.

El conjunto de entrenamiento es nsk7153/MedCalc-Bench-Verified y la evaluación se realizó sobre su split de test (1.100 casos) con el evaluador propio del benchmark, en decodificación greedy, sin thinking y con un límite de 2.500 tokens nuevos. La model card indica que se trata de "one training run" (una única ejecución de entrenamiento) y no detalla el número de tokens, la composición exacta del dataset ni si hubo RLHF o DPO. No se documentan innovaciones arquitectónicas más allá del ajuste LoRA y del formato de razonamiento paso a paso inducido por prompt.

## Capacidades

- Generación de texto especializada en razonamiento clínico estructurado: desarrollo paso a paso de cálculos médicos.
- Aplicación de las 55 calculadoras de MedCalc-Bench: fórmulas (p. ej. aclaramiento de creatinina por Cockcroft-Gault) y escalas de puntuación (p. ej. CHA2DS2-VASc, APACHE II).
- Extracción de valores numéricos y cualitativos desde notas clínicas en texto libre.
- Conversión de unidades dentro del razonamiento.
- Salida estructurada final en JSON (`{"answer": "<value>"}`), apta para parseo automático.
- Modo de razonamiento controlable: la evaluación se hizo con `enable_thinking=False`; el modelo base soporta el flag de chat template.
- Capacidad multilingüe: limitada al inglés (único idioma declarado).
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes multi-paso: no documentado; el modelo está diseñado para responder de forma autónoma sin herramientas.
- Visión, audio: no documentado (aunque se carga mediante una clase `AutoModelForImageTextToText`, no se declaran capacidades multimodales en la model card).

## Casos de uso

- Cálculo automático de aclaramiento de creatinina en informes de laboratorio: el modelo lee la nota, extrae edad, peso, creatinina sérica y sexo, aplica Cockcroft-Gault y devuelve el valor en mL/min con el desarrollo intermedio, lo que permite auditar el resultado.
- Estratificación de riesgo tromboembólico: a partir de una nota de ingreso, computa CHA2DS2-VASc ítem a ítem citando la evidencia textual de cada criterio, útil para sistemas de apoyo a la decisión en cardiología.
- Puntuación de gravedad en UCI: cálculo de APACHE II sobre notas de ingreso, con desglose por variable y puntos, adecuado para pipelines de triaje que requieren trazabilidad.
- Preprocesamiento de historiales clínicos para investigación: extracción estructurada de índices clínicos (escalas y fórmulas) desde grandes volúmenes de notas en inglés, alimentando bases de datos analíticas.
- Validación cruzada de cálculos introducidos manualmente: el modelo actúa como segundo evaluador que reproduce el cálculo paso a paso y señala discrepancias con el valor registrado por el clínico.
- Generación de documentación clínica explicable: producción de justificaciones textuales con citas de la nota para cada ítem de una escala, aprovechable en informes que exigen auditoría del razonamiento.
- Integración en asistentes de historia clínica electrónica: al devolver JSON parseable y requerir solo 0,8B de parámetros, puede desplegarse en infraestructura modesta para calcular índices bajo demanda.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre MedCalc-Bench Verified (split de test, 1.100 casos, evaluador del propio benchmark, sin herramientas, decodificación greedy, thinking desactivado, máximo 2.500 tokens nuevos):

| Modelo | Entrenado en la tarea | Precisión global | Fórmulas (720 casos) | Escalas (380 casos) |
|---|---|---|---|---|
| Arxo Materia 0.1 (0.8B), este adaptador | sí | 780/1100 (70,9%) | 589 (81,8%) | 191 (50,3%) |
| Qwen3.5-0.8B sin entrenar, un ejemplo en el prompt | no | 346/1100 (31,5%) | 283 (39,3%) | 63 (16,6%) |

Comparativa publicada en la model card frente a otros sistemas sobre el mismo conjunto:

| Sistema | Entrenado en la tarea | Precisión | Fuente |
|---|---|---|---|
| Arxo Materia 0.1 + Arxo | sí | 90,2% | arxo.io/research/materia-0-1 (Arxo en acceso anticipado) |
| Qwen3-8B extrae entradas, calculadoras escritas por GPT-5.5 | sí | 86,73% | arXiv 2610.21477, tabla II |
| Claude Sonnet 4.6, agente de código con Python | no | 86,24% | arXiv 2610.21477 |
| Arxo Materia 0.1 (4B), sin herramientas | sí | 82,2% | arxohq/Arxo-Materia-4B-MedCalc-0.1 (media de tres entrenamientos) |
| Nemotron 3.5 Super VL (120B) + LoRA, respuesta directa | sí | 72,45% | model card de Fastino |
| Arxo Materia 0.1 (0.8B), sin herramientas | sí | 70,9% | este modelo |
| Qwen3-8B, SFT, respuesta directa | sí | 69,46% | arXiv 2610.21477, tabla II |
| Qwen3-8B, RL, respuesta directa | sí | 64,2% | arXiv 2512.19691, apéndice E (snapshot de diciembre de 2025) |
| Qwen3-8B, un ejemplo en el prompt | no | 62,73% | arXiv 2610.21477, tabla II |
| GLM-4.6V, respuesta directa | no | 51,9% | arXiv 2603.02222, tabla 3 |
| Qwen2.5-32B, respuesta directa desde la nota | no | 28,67% | arXiv 2609.10728, tabla 1 (primeras 120 palabras) |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,8B en bfloat16 requiere aproximadamente 1,6 GB de pesos, más overhead de activaciones y caché KV; en la práctica cabe holgadamente en GPUs de 4-8 GB. El adaptador LoRA añade un consumo marginal (repositorio de 0,1 GB).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090) es suficiente; para despliegue en servidor, A100 o H100 no son necesarias por tamaño, aunque pueden usarse para alto throughput.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs con 4 GB o más de VRAM.
- Opciones de despliegue: la model card solo documenta el flujo con `transformers` + `peft` (`AutoModelForImageTextToText` + `PeftModel`). No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI; al ser un adaptador LoRA sobre Qwen3.5-0.8B, la viabilidad en esos motores depende del soporte del modelo base y de la fusión previa del adaptador, no verificada en la información disponible.
- Latencia y throughput: no disponibles. La configuración de referencia usa greedy decoding y un límite de 2.500 tokens nuevos, lo que da una idea del presupuesto de generación por caso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión MedCalc-Bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arxo-Materia-0.8B-MedCalc-0.1 | 0,8B (LoRA) | no disponible | 70,9% sin herramientas | Apache-2.0 | Hugging Face (adaptador) |
| Arxo-Materia-4B-MedCalc-0.1 | 4B | no disponible | 82,2% sin herramientas (media de 3 entrenamientos) | no disponible en la información | Hugging Face (arxohq) |
| Qwen3-8B con SFT directo | 8B | no disponible | 69,46% | no disponible en la información | Referencia en arXiv 2610.21477 |
| Qwen3.5-0.8B sin entrenar | 0,8B | no disponible | 31,5% con un ejemplo en el prompt | no disponible en la información | Hugging Face (Qwen) |

La comparación relevante es doble: frente a su propio modelo base, el adaptador multiplica por más de dos la precisión (31,5% a 70,9%) con un coste de parámetros nulo en la práctica; frente a Qwen3-8B con SFT, un modelo diez veces mayor, lo supera ligeramente en respuesta directa (70,9% frente a 69,46%). Queda por debajo de la variante de 4B del mismo proyecto (82,2%) y muy lejos de sistemas con herramientas o agentes de código (86-90%).

## Limitaciones y advertencias

- Cobertura acotada a las 55 calculadoras de MedCalc-Bench; en cualquier otra calculadora o tipo de nota el comportamiento no está probado.
- Las escalas de puntuación son notablemente más difíciles que las fórmulas: 50,3% frente a 81,8% de precisión, lo que desaconseja su uso en escalas sin supervisión.
- Entrenado y evaluado únicamente en inglés; no se declara ni evalúa soporte de otros idiomas.
- Es un lanzamiento de investigación: no es un dispositivo médico y no debe usarse para decisiones clínicas.
- Riesgo de alucinación en la extracción de valores: si un dato no aparece en la nota, el formato prevé `not mentioned`, pero no hay garantía de que el modelo no invente cifras o citas.
- Resultados basados en una única ejecución de entrenamiento ("one training run"), sin intervalo de confianza ni media de varias semillas para esta variante de 0,8B.
- La precisión del 90,2% solo se alcanza emparejando el modelo con Arxo, un componente externo en acceso anticipado y no incluido en este repositorio.
- La licencia Apache-2.0 se hereda del modelo base; conviene verificar las condiciones de Qwen3.5-0.8B para uso comercial en producción.
- El adaptador debe cargarse con `AutoModelForImageTextToText` y con el system prompt exacto de entrenamiento; desviarse de ese formato puede degradar el rendimiento de forma no cuantificada.
- Sesgos: no se documenta ningún análisis de sesgo demográfico, de género o étnico en las notas clínicas de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arxohq/Arxo-Materia-0.8B-MedCalc-0.1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Variante de 4B: https://huggingface.co/arxohq/Arxo-Materia-4B-MedCalc-0.1
- Página de investigación de Arxo Materia 0.1: https://www.arxo.io/research/materia-0-1/
- Repositorio con salidas y puntuaciones del benchmark: https://github.com/arxohq/arxo-medcalc-bench
- Dataset de evaluación: https://huggingface.co/datasets/nsk7153/MedCalc-Bench-Verified
- Paper arXiv 2610.21477: https://arxiv.org/abs/2610.21477
- Paper arXiv 2512.19691: https://arxiv.org/abs/2512.19691
- Paper arXiv 2603.02222: https://arxiv.org/abs/2603.02222
- Paper arXiv 2609.10728: https://arxiv.org/abs/2609.10728
- Model card de Fastino (Nemotron 3.5 Super VL Healthcare): https://huggingface.co/fastino/Fastino-Nemotron-3.5-Super-VL-Healthcare
