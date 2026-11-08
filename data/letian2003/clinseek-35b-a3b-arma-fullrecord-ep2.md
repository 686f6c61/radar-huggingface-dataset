# Letian2003/ClinSeek-35B-A3B-armA-fullrecord-ep2

## Resumen

ClinSeek-35B-A3B (arm A, full-record, epoch 2) es un ajuste fino de parámetros completos del modelo base `Qwen/Qwen3.5-35B-A3B`, desarrollado por el usuario Letian2003 en el marco del proyecto ClinSeekAgent de UCSC-VLAA. El modelo está especializado en razonamiento clínico sobre registros de historia clínica electrónica (EHR): recibe el registro completo del paciente embebido en un único turno de usuario y produce una cadena de razonamiento en un bloque `<think>` seguida de la respuesta final en un bloque `<answer>`. No utiliza herramientas externas, a diferencia de las otras dos variantes de la comparación (arm C y arm S).

El modelo resuelve tareas de predicción clínica sobre seis familias: diagnósticos (CCS), procedimientos (CCS), pruebas de laboratorio, pruebas de microbiología, prescripciones y traslados. Se entrena con 2.628 muestras de la partición de entrenamiento de AgentEHR-Bench, destiladas de un profesor (GPT-5.6 Sol con esfuerzo de razonamiento alto). La innovación principal es el modo de entrada: en lugar de recuperar evidencia con herramientas EHR, el registro completo del paciente se inserta en el prompt con un presupuesto máximo de 45.000 tokens.

Es relevante porque forma parte de un estudio controlado de tres brazos sobre datos de entrenamiento para agentes clínicos, y porque demuestra que un modelo de 35B parámetros totales con arquitectura MoE puede abordar contextos clínicos largos (mediana de 27,4K tokens por muestra) sin recuperación externa. No es la versión oficial de ClinSeek-35B-A3B y no ha sido evaluado en esta publicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5MoeForConditionalGeneration` (MoE, transformer con mezcla de expertos) |
| Parametros totales | 35.951.822.704 (35,95B) |
| Parametros activos | no disponible (el modelo base es MoE con etiqueta A3B, pero no se detalla el número exacto de parámetros activos en la información proporcionada) |
| Longitud de contexto | presupuesto de prompt de 45.000 tokens; muestras de hasta 52K tokens; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | `physionet-credentialed-derivative` (derivada de MIMIC-IV, acuerdo de acceso restringido de PhysioNet) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo se basa en `Qwen/Qwen3.5-35B-A3B`, una arquitectura MoE de tipo `Qwen3_5MoeForConditionalGeneration` con 35,95B parámetros totales. El ajuste es de parámetros completos (full-parameter SFT) sobre 2.628 muestras de entrenamiento y 53 de validación, con una receta idéntica a la del paper ClinSeekAgent: verl + Megatron-core 0.16.1 + mbridge, un nodo de 8 × H200, paralelismo tensorial 2, de expertos 8 (expert-tensor 1), pipeline 1, contexto 1, resultando en paralelismo de datos 4. El checkpoint publicado corresponde al final de la época 2 de 3 (`global_step_164`).

Los datos de entrenamiento son las 2.681 preguntas de la partición de entrenamiento de AgentEHR-Bench, con respuestas destiladas de GPT-5.6 Sol (esfuerzo de razonamiento alto). Cada muestra contiene un único turno de usuario con la instrucción de la tarea, la información del paciente con la hora actual, el registro EHR completo en CSV (recortado a 45.000 tokens, eliminando primero los eventos más antiguos; el 34,9 % de los registros se truncaron), las respuestas candidatas cuando la tarea las tiene y un párrafo de cierre que solicita la respuesta en `<answer>`. El razonamiento del profesor se convierte en el bloque nativo `<think>` del turno del asistente. La pérdida se calcula únicamente sobre tokens del asistente (bloques think y answer). No hay mensaje de sistema ni herramientas. La mediana de longitud es de 27,4K tokens por muestra (máximo 45,7K, todas ≤ 52K) y la mediana de razonamiento es de 658 caracteres por muestra.

## Capacidades

- Generación de texto con razonamiento clínico explícito en un bloque `<think>` antes de la respuesta final en `<answer>`.
- Predicción de diagnósticos codificados con CCS a partir del registro EHR completo del paciente.
- Predicción de procedimientos codificados con CCS.
- Predicción de resultados de pruebas de laboratorio.
- Predicción de resultados de pruebas de microbiología.
- Predicción de prescripciones.
- Predicción de traslados de paciente.
- Procesamiento de contextos clínicos largos: hasta 45.000 tokens de registro EHR en un solo turno (mediana de 27,4K).
- Manejo de registros con política temporal estricta: solo eventos hasta el momento de predicción del caso.
- Generación de múltiples respuestas, una por línea, dentro del bloque `<answer>`.
- Capacidades multilingües: únicamente inglés.
- No soporta tool calling ni function calling: el modelo se entrena explícitamente sin herramientas y sin mensaje de sistema.
- No soporta agentes multi-paso ni recuperación iterativa de evidencia (eso corresponde a los brazos C y S).

## Casos de uso

- Predicción de diagnósticos a partir de historia clínica completa: el modelo ingiere el registro EHR del paciente (hasta 45.000 tokens) y emite los códigos CCS de diagnóstico probables, razonando previamente en el bloque `<think>`. Adecuado para entornos de investigación clínica donde se dispone del registro completo y no se quiere montar infraestructura de recuperación.
- Predicción de procedimientos realizados o pendientes: dado el registro hasta el momento de predicción, el modelo genera los códigos CCS de procedimiento, útil para auditoría de codificación y planificación de recursos.
- Predicción de resultados de laboratorio: el modelo anticipa valores o categorías de pruebas analíticas a partir de la evolución clínica previa, aplicable en sistemas de alerta temprana en investigación.
- Predicción de resultados microbiológicos: con el registro completo del paciente, el modelo estima el resultado de cultivos o pruebas microbiológicas, útil para estudios retrospectivos de cohortes.
- Predicción de prescripciones: el modelo sugiere medicamentos o clases terapéuticas a partir del historial, aplicable en investigación sobre patrones de prescripción y detección de desviaciones.
- Predicción de traslados de paciente: anticipa si el paciente será trasladado (por ejemplo, a unidad de cuidados intensivos) según la evolución registrada, útil en modelos de ocupación hospitalaria a nivel de investigación.
- Evaluación comparativa de estrategias de datos para agentes clínicos: al ser el brazo A de un estudio controlado de tres brazos, sirve como referencia para medir el efecto de sustituir recuperación con herramientas por inyección del registro completo en el prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "Evaluation: not evaluated in this release". No se dispone de cifras de MMLU, HumanEval, GSM8K ni de las tareas de AgentEHR-Bench para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 72 GB solo para pesos (35,95B parámetros × 2 bytes), más overhead de activaciones y caché KV; se recomienda al menos 80 GB por GPU o reparto multi-GPU.
- GPU recomendadas: H200 (usada en el entrenamiento), H100 80GB, A100 80GB. Para bf16 se necesita al menos una GPU de 80 GB o tensor parallelism en varias.
- Cabe en GPU de consumo: no en bf16. Con cuantización a 4 bits los pesos ocuparían en torno a 18-20 GB, lo que podría caber en una RTX 4090 (24 GB) o RTX 5090, aunque la información proporcionada no publica pesos cuantizados ni confirma compatibilidad.
- Opciones de despliegue: transformers (librería declarada), con soporte de endpoints compatibles (`endpoints_compatible`); vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles. El contexto de entrada es muy largo (mediana 27,4K tokens), lo que implica un coste de prefill significativo no cuantificado en la información.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Entrada | Herramientas | Licencia | Evaluación publicada |
|---|---|---|---|---|---|---|
| ClinSeek-35B-A3B arm A (este) | 35,95B | ≤ 45K tokens de prompt | Registro completo inline | No | physionet-credentialed-derivative | No evaluado |
| ClinSeek-35B-A3B arm C | no disponible | no disponible | Trayectorias multi-ronda con herramientas EHR | Sí | physionet-credentialed-derivative | No disponible en la información |
| ClinSeek-35B-A3B arm S | no disponible | no disponible | Trayectorias de recuperación de un solo paso | Sí | physionet-credentialed-derivative | No disponible en la información |
| UCSC-VLAA/ClinSeek-35B-A3B (oficial) | no disponible | no disponible | Agéntico con herramientas | Sí | no disponible | Sí (paper arXiv 2605.20176) |

Los tres brazos comparten modelo base, preguntas, partición y profesor; solo cambia el modo de entrada. La versión oficial de UCSC-VLAA es la referencia publicada en el paper y no debe confundirse con este checkpoint.

## Limitaciones y advertencias

- No evaluado: el autor declara explícitamente que este release no ha sido evaluado; no hay métricas de rendimiento clínico.
- Solapamiento con evaluación: la partición de entrenamiento de AgentEHR-Bench no es completamente disjunta de las particiones de evaluación. Sobre las 3.000 preguntas de entrenamiento totales, `common` comparte 10 ids de pregunta y 58 pacientes, y `rare` comparte 10 ids y 47 pacientes; `sample` no comparte ninguno. Es imprescindible comprobar el solapamiento antes de evaluar en `common` o `rare`.
- Licencia restrictiva: `physionet-credentialed-derivative`, derivada de MIMIC-IV (PhysioNet credentialed access). Requiere cumplir el acuerdo de uso de datos de PhysioNet; no es apta para uso comercial sin verificar los términos.
- Datos no publicados: las 2.628 muestras de entrenamiento no se liberan porque contienen registros de MIMIC-IV.
- Solo inglés: el modelo está entrenado y etiquetado únicamente para inglés.
- Sin herramientas: no soporta tool calling ni function calling; las instrucciones de tarea incluyen referencias a herramientas del agente que el modelo no puede invocar, lo que puede generar confusión.
- Truncamiento de registros: el 34,9 % de los registros se recortaron a 45.000 tokens eliminando primero los eventos más antiguos, lo que puede perder información clínica relevante en pacientes con historiales muy largos.
- Respuestas vacías: 79 muestras de entrenamiento (78 de microbiología, 1 de prescripciones) tienen el bloque de respuesta vacío y se mantuvieron sin cambios, lo que puede inducir respuestas vacías en tareas de microbiología.
- Riesgo de alucinación clínica: es un modelo de lenguaje ajustado por SFT, sin verificación factual ni salvaguardas clínicas específicas; no debe usarse para decisiones médicas reales.
- Sesgos: no se documentan análisis de sesgo; los datos provienen de una única base (MIMIC-IV) con la distribución demográfica y de codificación de un sistema hospitalario concreto.
- Checkpoint intermedio: corresponde al final de la época 2 de 3, no al modelo final del entrenamiento.
- No es la versión oficial: no debe citarse como el release oficial de ClinSeek-35B-A3B.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/Letian2003/ClinSeek-35B-A3B-armA-fullrecord-ep2
- Brazo C (multi-ronda): https://huggingface.co/Letian2003/ClinSeek-35B-A3B-armC-multiround-ep2
- Brazo S (single-pass): https://huggingface.co/Letian2003/ClinSeek-35B-A3B-armS-singlepass-ep2
- Modelo oficial: https://huggingface.co/UCSC-VLAA/ClinSeek-35B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Paper: https://arxiv.org/abs/2605.20176
- Repositorio de código: https://github.com/UCSC-VLAA/ClinSeekAgent
- Dataset AgentEHR-Bench: https://huggingface.co/datasets/BlueZeros/AgentEHR-Bench
- Acuerdo de uso de MIMIC-IV: https://physionet.org/content/mimiciv/view-dua/3.1/
- Resumen en Emergent Mind: https://www.emergentmind.com/topics/clinseek-35b-a3b
