# Letian2003/ClinSeek-35B-A3B-armC-multiround-ep2

## Resumen

ClinSeek-35B-A3B-armC-multiround-ep2 es un ajuste fino de parámetro completo del modelo base Qwen/Qwen3.5-35B-A3B, desarrollado por el autor Letian2003 en el marco del proyecto ClinSeekAgent (UCSC-VLAA). El modelo está especializado en razonamiento clínico agéntico sobre registros de salud electrónicos (EHR): en cada ronda el agente razona, recupera evidencia específica del paciente mediante herramientas y repite el ciclo hasta emitir una respuesta. Este checkpoint concreto corresponde al brazo C de una comparación de datos de entrenamiento, entrenado sobre 2.628 trayectorias multi-ronda y detenido al final de la época 2 de 3.

El modelo hereda la arquitectura MoE de Qwen3.5 (Qwen3_5MoeForConditionalGeneration) con 35B parámetros totales y 3B activos, y se entrena con la receta de SFT del artículo ClinSeekAgent (arXiv 2605.20176) sobre 8 × H200. Es relevante porque aborda un problema real de los sistemas de soporte clínico: en lugar de asumir que la evidencia ya está curada y entregada al modelo, el agente debe buscarla activamente, planificar de forma iterativa y sintetizar información heterogénea bajo una política temporal estricta que solo permite ver eventos hasta el momento de predicción de cada caso.

Se trata de una release de investigación, no de la publicación oficial UCSC-VLAA/ClinSeek-35B-A3B, y no incluye evaluación propia. Las trayectorias de entrenamiento no se publican por contener datos de MIMIC-IV bajo acceso acreditado de PhysioNet.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForConditionalGeneration (transformer MoE) |
| Parámetros totales | 35B |
| Parámetros activos | 3B (MoE) |
| Longitud de contexto | 52.000 tokens (longitud máxima de secuencia en entrenamiento; contexto nativo del base no disponible) |
| Tipos de cuantización | no disponible (pesos publicados en bf16) |
| Idiomas soportados | en |
| Licencia | physionet-credentialed-derivative (other) |
| Formato de pesos | safetensors (transformers, bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-35B-A3B, un transformer con mezcla de expertos (MoE) de 35B parámetros totales y 3B activos, y se somete a un ajuste fino supervisado de parámetro completo con verl + Megatron-core 0.16.1 + mbridge. El entrenamiento se ejecutó en 1 nodo con 8 × H200, con paralelismo tensor 2, experto 8 y pipeline 1 (data parallel 4), batch global de 32 secuencias por paso de optimizador, micro batch 1 por GPU sin padding, 82 pasos por época (drop_last) y 246 pasos totales en 3 épocas. Se usa Adam (β1 = 0,9, β2 = 0,999) con pesos maestros y estados en fp32 en GPU, learning rate 2e-5 con 10 pasos de warmup y decaimiento coseno hasta 2e-6, weight decay 0,1, gradient clipping 1,0 y precisión bfloat16 en parámetros, activaciones y reducción de gradientes. Se aplica recomputación de activaciones completa uniforme de 1 capa y semilla 42.

Los datos de entrenamiento son 2.628 trayectorias multi-ronda del split de entrenamiento de AgentEHR-Bench (3.000 preguntas sobre seis familias de tareas: diagnósticos CCS, procedimientos CCS, pruebas de laboratorio, pruebas de microbiología, prescripciones y traslados), generadas por el profesor GPT-5.6 Sol con esfuerzo de razonamiento alto usando las 16 herramientas `ehr.*` bajo la política temporal estricta. Las trayectorias completas terminan con `ehr.finish`; tras el filtro de longitud ≤ 52K tokens quedan 2.681, divididas en 2.628 de entrenamiento y 53 de validación. La media de rondas de razonamiento por trayectoria es 9,0 (máximo 16) y el volumen de tokens de entrenamiento es de 57,4 M (mediana 19,3K, máximo 51,9K por trayectoria). En el formateo se eliminan los turnos exclusivos de pensamiento y sus respuestas de herramienta, y su texto pasa al bloque nativo `<think>` del siguiente turno del asistente; se elimina el bloque de protocolo de razonamiento del system prompt y las llamadas a herramientas usan el formato nativo de Qwen3.5 con nombres punteados. La pérdida se calcula solo sobre tokens del asistente (bloques de pensamiento, llamadas a herramientas y respuesta final). Los datos presentan solapamiento parcial con los splits de evaluación de AgentEHR-Bench: 10 ids de pregunta y 58 pacientes compartidos en `common`, 10 ids y 47 pacientes en `rare`, y ninguno en `sample`.

## Capacidades

- Generación de texto y razonamiento clínico multi-ronda con canal de pensamiento nativo `<think>`.
- Llamada a herramientas (tool calling) en formato nativo de Qwen3.5, con nombres punteados como `ehr.load_ehr`.
- Razonamiento agéntico iterativo: planificación, recuperación de evidencia del EHR y síntesis hasta la respuesta final (`ehr.finish`).
- Uso de 16 herramientas específicas de EHR bajo política temporal estricta (solo eventos hasta el momento de predicción).
- Resolución de tareas clínicas sobre seis familias: diagnósticos (CCS), procedimientos (CCS), pruebas de laboratorio, pruebas de microbiología, prescripciones y traslados.
- Capacidades multilingües: solo inglés.
- No se documentan capacidades de visión, audio ni decodificación especulativa en la información disponible.

## Casos de uso

- Soporte a la codificación clínica: el modelo puede responder preguntas de diagnóstico y procedimiento (CCS) consultando el EHR del paciente mediante las herramientas `ehr.*`, lo que encaja con flujos de codificación retrospectiva donde la evidencia debe extraerse del registro en lugar de estar precurada.
- Predicción de resultados de laboratorio y microbiología: dado un caso con política temporal estricta, el agente recupera resultados previos y eventos relevantes hasta el momento de predicción y sintetiza una respuesta, útil en pipelines de analítica clínica retrospectiva.
- Revisión de prescripciones y traslados: el modelo puede rastrear la historia de medicación y movimientos del paciente a través de rondas de recuperación, adecuado para auditorías internas de seguridad de prescripción.
- Investigación en agentes clínicos: sirve como estudiante SFT en experimentos de destilación de trayectorias de un profesor de razonamiento (GPT-5.6 Sol), comparable con el brazo S (single-pass) para estudiar el efecto del protocolo de recuperación.
- Evaluación de agentes sobre EHR: puede desplegarse contra AgentEHR-Bench para medir F1 medio por familia de tareas, con la advertencia de comprobar el solapamiento de pacientes antes de evaluar en los splits `common` y `rare`.
- Generación de trayectorias de razonamiento clínico para anotación asistida: el canal `<think>` nativo permite inspeccionar la cadena de razonamiento y las llamadas a herramientas, lo que facilita la revisión por parte de clínicos en entornos de investigación.
- Integración en pipelines de transformers: al publicarse en formato safetensors con `transformers` y pipeline `text-generation`, puede servirse con las herramientas estándar del ecosistema para prototipos de agentes clínicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este checkpoint. La model card indica explícitamente «Evaluation: not evaluated in this release». El artículo asociado reporta para el modelo oficial ClinSeek-35B-A3B un F1 medio de 35,6 en AgentEHR-Bench (+16,1 sobre su modelo base) y un 94,4 % del rendimiento de su profesor, pero esos datos corresponden a la release oficial UCSC-VLAA, no a este ajuste del brazo C.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia de orden de magnitud, un modelo MoE de 35B en bf16 requiere del orden de 70 GB solo para pesos, además de caché KV y overhead; con cuantización a 8 bits o 4 bits el requisito baja proporcionalmente, pero no se han publicado mediciones para este checkpoint.
- GPU recomendadas: el entrenamiento se realizó en 8 × H200; para inferencia se requieren GPUs con memoria suficiente para 35B en bf16 (A100 80 GB, H100 80 GB, H200) o configuraciones multi-GPU.
- GPU de consumo: no confirmado. Un MoE de 35B con 3B activos es candidato a ejecutarse en GPUs de consumo con cuantización agresiva, pero no hay datos publicados que lo verifiquen para este checkpoint.
- Opciones de despliegue: transformers (librería declarada); el resto de opciones (vLLM, llama.cpp, Ollama, TGI) no están documentadas en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ClinSeek-35B-A3B-armC-multiround-ep2 (este) | 35B totales / 3B activos | 52K (entrenamiento) | no evaluado en esta release | physionet-credentialed-derivative | Hugging Face |
| ClinSeek-35B-A3B-armS-singlepass-ep2 | 35B totales / 3B activos | 52K (entrenamiento) | no evaluado en esta release | no disponible | Hugging Face |
| UCSC-VLAA/ClinSeek-35B-A3B (oficial) | 35B totales / 3B activos | no disponible | 35,6 F1 medio en AgentEHR-Bench | no disponible | Hugging Face |
| Qwen/Qwen3.5-35B-A3B (base) | 35B totales / 3B activos | no disponible | 19,5 F1 medio en AgentEHR-Bench (implícito: 35,6 − 16,1) | no disponible | Hugging Face |

## Limitaciones y advertencias

- No evaluado: este checkpoint no incluye evaluación propia; no debe asumirse que iguala al modelo oficial ClinSeek-35B-A3B.
- Solapamiento de evaluación: el split de entrenamiento de AgentEHR-Bench no es totalmente disjunto de los splits de evaluación; hay 10 ids de pregunta y 58 pacientes compartidos en `common`, y 10 ids y 47 pacientes en `rare`. Es obligatorio comprobar el solapamiento antes de evaluar en esos splits.
- Licencia restrictiva: la licencia `physionet-credentialed-derivative` está vinculada al acuerdo de uso de MIMIC-IV (PhysioNet credentialed access). El uso comercial no está permitido por defecto y requiere revisión legal específica.
- Datos no publicados: las trayectorias de entrenamiento no se liberan por contener datos de MIMIC-IV bajo acceso acreditado, lo que impide reproducir el entrenamiento exacto.
- Idioma: solo inglés; no hay soporte multilingüe documentado.
- Dominio muy específico: el modelo está entrenado exclusivamente para tareas de EHR con las 16 herramientas `ehr.*`; su comportamiento fuera de ese protocolo no está caracterizado.
- Riesgo de alucinación: no se han publicado análisis de fiabilidad ni tasas de error en producción; en un dominio clínico esto exige validación externa antes de cualquier uso asistencial.
- Sesgos: no se documentan análisis de sesgos demográficos o clínicos en la información disponible.
- Checkpoint intermedio: corresponde a la época 2 de 3 (global_step_164), no al modelo final del entrenamiento.
- Configuración MoE: con la versión de mbridge usada, el tipo de balanceo de carga del router es `none`, por lo que solo está activa la z-loss; conviene tenerlo en cuenta al reproducir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Letian2003/ClinSeek-35B-A3B-armC-multiround-ep2
- Brazo S (single-pass): https://huggingface.co/Letian2003/ClinSeek-35B-A3B-armS-singlepass-ep2
- Release oficial: https://huggingface.co/UCSC-VLAA/ClinSeek-35B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Artículo: https://arxiv.org/abs/2605.20176
- Artículo (HTML): https://arxiv.org/html/2605.20176
- Repositorio de código: https://github.com/UCSC-VLAA/ClinSeekAgent
- Dataset AgentEHR-Bench: https://huggingface.co/datasets/BlueZeros/AgentEHR-Bench
- Licencia PhysioNet MIMIC-IV DUA: https://physionet.org/content/mimiciv/view-dua/3.1/
- Resumen en Emergent Mind: https://www.emergentmind.com/topics/clinseek-35b-a3b
