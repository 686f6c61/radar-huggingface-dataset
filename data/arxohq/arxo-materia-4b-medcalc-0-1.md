# arxohq/Arxo-Materia-4B-MedCalc-0.1

## Resumen

Arxo-Materia-4B-MedCalc-0.1 es un adaptador LoRA publicado por arxohq sobre el modelo base Qwen/Qwen3.5-4B. Su tarea es especializada y acotada: leer una nota clínica y resolver calculadoras médicas (aclaramiento de creatinina por Cockcroft-Gault, CHA2DS2-VASc, APACHE II y otras), escribiendo el desarrollo paso a paso y terminando con una línea `{"answer": "<valor>"}`. El nombre remite a *materia medica*, el corpus de conocimiento médico que se usó durante siglos.

El modelo resuelve un problema concreto de los sistemas clínicos: no basta con responder un número, hace falta trazar de dónde sale cada valor de la nota, aplicar conversiones de unidades y sustituir en la fórmula. El adaptador se entrenó con un system prompt específico y se evalúa sobre MedCalc-Bench Verified (1.100 casos de test), donde declara un 82,1 % de acierto sin herramientas, frente al 65,7 % del base sin entrenar.

Es relevante por su relación tamaño/rendimiento: con 4B de parámetros supera en la comparativa publicada a sistemas mucho mayores y a agentes de código con Python, y se queda a 4,5 puntos del mejor sistema entrenado en la tarea (Qwen3-8B con calculadoras escritas por GPT-5.5, 86,73 %). Es un lanzamiento de investigación, no un dispositivo médico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-4B; se carga con `AutoModelForImageTextToText` |
| Parametros totales | 4B (modelo base); el adaptador LoRA se distribuye aparte (repo de 0,3 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el base admite las cuantizaciones habituales de Qwen3.5-4B) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA, librería `peft`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA sobre Qwen3.5-4B, un transformer denso de 4.000 millones de parámetros. La model card no detalla la composición del dataset de entrenamiento ni el número de tokens; sí indica que se usó el system prompt que aparece en la tarjeta y que la evaluación se hizo con decodificación greedy, *thinking* desactivado (`enable_thinking=False`) y un límite de 2.500 tokens nuevos. El entrenamiento se repitió tres veces: las ejecuciones puntúan 900, 909 y 903 de 1.100 casos (82,2 ± 0,4 %), y el adaptador publicado es el más cercano a la media.

La innovación destacable no está en la arquitectura sino en el formato de salida: el modelo fue entrenado para razonar de forma explícita y verificable, enumerando los valores extraídos de la nota, las conversiones de unidades, cada fórmula con los números sustituidos y, en el caso de escalas de puntuación, una línea por ítem con la cita de soporte o `not mentioned`, la decisión y los puntos. Ese desarrollo trazable es lo que permite auditar el resultado, algo crítico en dominio clínico.

## Capacidades

- Generación de texto especializada en cálculo clínico a partir de notas de paciente.
- Resolución paso a paso de fórmulas médicas con conversión de unidades y sustitución explícita de valores.
- Resolución de escalas de puntuación clínicas ítem a ítem, con cita textual de la nota o marca `not mentioned`.
- Salida estructurada final en una línea JSON: `{"answer": "<valor>"}`.
- Cobertura de las 55 calculadoras de MedCalc-Bench.
- Funciona sin herramientas externas ni intérprete de código (respuesta directa).
- No se documenta soporte de tool calling, agentes, visión, audio ni modo de razonamiento extendido; el modelo se evaluó con *thinking* desactivado.
- Capacidad multilingüe: solo inglés declarado.

## Casos de uso

- **Cálculo de aclaramiento de creatinina en revisión de prescripción**: el modelo lee la nota, extrae edad, peso, creatinina sérica y sexo, aplica Cockcroft-Gault y devuelve el valor en mL/min con el desarrollo visible, lo que permite al farmacéutico verificar cada dato de entrada.
- **Estratificación de riesgo tromboembólico**: cálculo de CHA2DS2-VASc ítem a ítem, con la cita de la nota que justifica cada punto (insuficiencia cardíaca, hipertensión, edad, ictus previo, etc.), útil en consultas de cardiología para documentar la decisión.
- **Puntuación de gravedad en UCI**: APACHE II y escalas similares a partir de notas de ingreso, con una línea por criterio y su evidencia textual; el formato facilita la revisión por el intensivista antes de registrarlo.
- **Auditoría retrospectiva de historiales**: procesamiento por lotes de notas para recalcular puntuaciones ya registradas y detectar discrepancias, usando la salida JSON final para comparación automatizada.
- **Extracción estructurada para pipelines de datos clínicos**: el par nota + pregunta produce un valor numérico delimitado, lo que permite integrarlo en un ETL que alimente un registro de variables calculadas.
- **Asistencia a codificación clínica y facturación**: cálculo de índices documentados (p. ej. función renal) para justificar ajustes de dosis o categorías diagnósticas, con la traza de valores como soporte de auditoría.
- **Investigación en NLP clínico**: como baseline reproducible y ligero (4B) sobre MedCalc-Bench Verified, con salidas por caso y sumas de verificación publicadas en el repositorio de GitHub.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre MedCalc-Bench Verified (split test, 1.100 casos, evaluador propio del benchmark, respuesta directa sin herramientas):

| Modelo | Entrenado en la tarea | Accuracy | Fórmulas (720) | Escalas (380) |
|---|---|---|---|---|
| Arxo Materia 0.1 + Arxo (early access) | sí | 90,2 % | no disponible | no disponible |
| Qwen3-8B extrae entradas + calculadoras de GPT-5.5 | sí | 86,73 % | no disponible | no disponible |
| Claude Sonnet 4.6, agente de código con Python | no | 86,24 % | no disponible | no disponible |
| **Arxo Materia 0.1 (4B), sin herramientas** | sí | **82,2 %** (media de 3 ejecuciones) | 662 (91,9 %) | 241 (63,4 %) |
| Nemotron 3.5 Super VL (120B) + LoRA, respuesta directa | sí | 72,45 % | no disponible | no disponible |
| Arxo Materia 0.1 (0,8B), sin herramientas | sí | 70,9 % | no disponible | no disponible |
| Qwen3-8B, SFT, respuesta directa | sí | 69,46 % | no disponible | no disponible |
| Qwen3-8B, RL, respuesta directa | sí | 64,2 % | no disponible | no disponible |
| Qwen3-8B, un ejemplo en el prompt | no | 62,73 % | no disponible | no disponible |
| GLM-4.6V, respuesta directa | no | 51,9 % | no disponible | no disponible |
| Qwen2.5-32B, respuesta directa desde la nota | no | 28,67 % | no disponible | no disponible |
| Qwen3.5-4B base, un ejemplo en el prompt | no | 65,7 % | 574 (79,7 %) | 149 (39,2 %) |

Desglose del adaptador publicado (ejecución de 903/1.100): 91,9 % en fórmulas y 63,4 % en escalas de puntuación, que son claramente la parte más difícil para el modelo.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,3 GB; el peso real está en el base Qwen3.5-4B.
- VRAM estimada para el base en bf16: en torno a 8-9 GB solo para pesos, más caché KV y activaciones; en la práctica, 12-16 GB para comodidad con 2.500 tokens de generación.
- En cuantización de 4 bits, el base cabe en GPUs de consumo de 8 GB (RTX 3060 Ti, RTX 4060, RTX 3070) con margen ajustado; 12 GB (RTX 3060 12 GB, RTX 4070) es una opción holgada.
- GPU de datacenter (A100, H100, L40S) para despliegue concurrente o procesamiento por lotes de notas.
- El adaptador se carga con `peft` sobre `AutoModelForImageTextToText` de Transformers; la model card no documenta vLLM, llama.cpp, Ollama ni TGI para esta versión.
- Decodificación greedy, sin *thinking*, con `max_new_tokens=2500`; son los ajustes con los que se obtuvieron las puntuaciones reportadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MedCalc-Bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arxo-Materia-4B-MedCalc-0.1 | 4B (+ LoRA) | no disponible | 82,2 % (sin herramientas) | Apache-2.0 | Hugging Face, abierto |
| Arxo-Materia-0.8B-MedCalc-0.1 | 0,8B | no disponible | 70,9 % | no disponible | Hugging Face, abierto |
| Qwen3-8B (SFT en la tarea) | 8B | no disponible | 69,46 % | no disponible | referencia en paper |
| Nemotron 3.5 Super VL (120B) + LoRA | 120B | no disponible | 72,45 % | no disponible | Hugging Face (Fastino) |
| Claude Sonnet 4.6 (agente de código) | no disponible | no disponible | 86,24 % | propietaria | API |

La comparación relevante es que un adaptador de 4B supera a un modelo de 120B con LoRA y a Qwen3-8B afinado en la misma tarea, y queda por debajo de sistemas que combinan extracción de entradas con calculadoras externas o de un agente de código con Python.

## Limitaciones y advertencias

- Solo cubre las 55 calculadoras de MedCalc-Bench; en otras calculadoras y en notas de otro tipo no está probado.
- Las escalas de puntuación son su punto débil: 63,4 % frente al 91,9 % en fórmulas.
- Es un lanzamiento de investigación; no es un dispositivo médico y no debe usarse para decisiones clínicas.
- Riesgo de alucinación en la extracción de valores de la nota: el desarrollo paso a paso ayuda a detectarlo, pero no lo elimina.
- Solo inglés declarado; no se documenta rendimiento en castellano ni en otros idiomas.
- El adaptador exige el system prompt de entrenamiento y la carga vía `AutoModelForImageTextToText`; usarlo con `AutoModelForCausalLM` o con otro prompt puede degradar los resultados.
- La puntuación de 82,1 % es la de una única ejecución; la media de tres es 82,2 ± 0,4 %, con variación entre ejecuciones.
- El resultado de 90,2 % requiere el sistema Arxo, en acceso anticipado y no disponible abiertamente.
- Licencia Apache-2.0, la del modelo base; no se documentan restricciones adicionales para uso comercial, pero la advertencia de no uso clínico se mantiene.
- No se han publicado datos de sesgos, contexto máximo ni robustez ante notas mal formateadas.

## Enlaces

- Hugging Face: https://huggingface.co/arxohq/Arxo-Materia-4B-MedCalc-0.1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Variante 0,8B: https://huggingface.co/arxohq/Arxo-Materia-0.8B-MedCalc-0.1
- Resultados y sumas de verificación: https://github.com/arxohq/arxo-medcalc-bench
- Arxo + Materia 0.1 (acceso anticipado): https://www.arxo.io/research/materia-0-1/
- Dataset de evaluación: https://huggingface.co/datasets/nsk7153/MedCalc-Bench-Verified
- Paper arXiv 2610.21477: https://arxiv.org/abs/2610.21477
- Paper arXiv 2512.19691: https://arxiv.org/abs/2512.19691
- Paper arXiv 2603.02222: https://arxiv.org/abs/2603.02222
- Paper arXiv 2609.10728: https://arxiv.org/abs/2609.10728
- Modelo comparativo Fastino: https://huggingface.co/fastino/Fastino-Nemotron-3.5-Super-VL-Healthcare
