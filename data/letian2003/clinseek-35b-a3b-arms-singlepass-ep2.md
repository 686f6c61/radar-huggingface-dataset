# Letian2003/ClinSeek-35B-A3B-armS-singlepass-ep2

## Resumen
ClinSeek-35B-A3B es un modelo de lenguaje de 35.951.822.704 parámetros (35,95 B) obtenido por ajuste fino de parámetros completos (SFT) sobre `Qwen/Qwen3.5-35B-A3B`, un transformer con mezcla de expertos (MoE) de la familia Qwen3.5. Lo publica el usuario Letian2003 como parte de un experimento comparativo de datos de entrenamiento para agentes clínicos que consultan registros de salud electrónicos (EHR). El modelo resuelve el problema de razonamiento agéntico sobre datos clínicos estructurados: razona, emite una batería de llamadas a herramientas EHR, vuelve a razonar sobre los resultados y responde.

Esta ficha concreta es el "arm S" (single-pass) de una comparación de dos brazos: se entrena con 2.472 trayectorias de recuperación de un solo pase (más 49 de validación) generadas por un profesor (GPT-5.6 Sol) sobre el split de entrenamiento de AgentEHR-Bench. El brazo alternativo, "arm C", usa el mismo profesor, herramientas, prompt de sistema y receta, pero un protocolo de recuperación multironda. Ambos brazos reejecutan la receta SFT del artículo ClinSeekAgent (arXiv 2605.20176) sobre 8 × H200.

Es relevante ahora porque demuestra un patrón de entrenamiento agéntico reproducible para dominios clínicos con licencia restringida, y porque expone explícitamente los solapamientos entre splits de entrenamiento y evaluación, algo poco habitual en model cards. No es la release oficial `UCSC-VLAA/ClinSeek-35B-A3B`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Qwen3_5MoeForConditionalGeneration` (transformer MoE, familia Qwen3.5) |
| Parámetros totales | 35.951.822.704 (35,95 B) |
| Parámetros activos | no disponible (el nombre "A3B" sugiere ~3 B activos, no confirmado en la información) |
| Longitud de contexto | 52.000 tokens de secuencia máxima en entrenamiento; contexto nativo del modelo base no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bf16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | `physionet-credentialed-derivative` (licencia "other", vinculada al DUA de MIMIC-IV 3.1 de PhysioNet) |
| Formato de pesos | safetensors, bf16 |
| Modelo base | `Qwen/Qwen3.5-35B-A3B` |
| Checkpoint | fin de época 2 de 3, `global_step_154` |
| Tamaño del repositorio | 71,9 GB |
| Pipeline | text-generation (etiquetado también como image-text-to-text) |

## Arquitectura y entrenamiento
El modelo parte de un transformer MoE de Qwen3.5 (clase `Qwen3_5MoeForConditionalGeneration`) y se ajusta con SFT de parámetros completos usando verl + Megatron-core 0.16.1 + mbridge. El entrenamiento se ejecuta en 1 nodo con 8 × H200, con paralelismo tensor 2, experto 8 (expert-tensor 1), pipeline 1, contexto 1, lo que da un data parallel de 4. El batch global es de 32 secuencias por paso de optimizador, micro batch 1 por GPU y sin padding; hay 77 pasos por época (drop_last) y 231 pasos en total sobre 3 épocas. La longitud máxima de secuencia es de 52.000 tokens, con los datos prefiltrados a ≤ 52K.

Los datos son 2.472 trayectorias de entrenamiento y 49 de validación, generadas por el profesor GPT-5.6 Sol (esfuerzo de razonamiento alto) sobre 2.681 preguntas del split de entrenamiento de AgentEHR-Bench, con 16 herramientas `ehr.*` y una política temporal estricta (solo eventos hasta el momento de predicción de cada caso). La distribución por tareas es: diagnósticos (CCS) 456, traslados 451, microbiología 429, laboratorio 398, procedimientos (CCS) 397 y prescripciones 341. Cada trayectoria tiene una mediana de 10 llamadas a herramientas (máximo 26), 2 bloques de pensamiento y una mediana de 14,0K tokens (máximo 51,9K). En el formateo, los turnos de solo pensamiento y sus respuestas de herramienta se eliminan y su texto pasa al bloque nativo `<think>…</think>` del siguiente turno del asistente; se elimina el bloque de protocolo de razonamiento del prompt de sistema y las llamadas usan el formato nativo de Qwen3.5 con nombres punteados (`ehr.load_ehr`, etc.). La pérdida se calcula solo sobre tokens del asistente (bloques de pensamiento, llamadas y respuesta final).

Hiperparámetros: Adam (β1 = 0,9, β2 = 0,999) con pesos maestros y estados en fp32 en GPU, learning rate 2e-5 con 10 pasos de calentamiento y decaimiento coseno hasta 2e-6, weight decay 0,1, grad clipping 1,0, bf16 en parámetros, activaciones y reducción de gradientes, recomputación de activaciones completa (1 capa), validación cada 25 pasos y en el último, semilla 42. Coeficientes MoE: aux-loss 0,01 y z-loss 0,001; con esta versión de mbridge el tipo de balanceo de carga del router es `none`, por lo que solo el z-loss está activo. Software: torch 2.10.0 (CUDA 13.0), transformers 5.4.0, Transformer Engine 2.12, flash-attn 2.8.3, mbridge 4cfd6f5.

## Capacidades
- Razonamiento clínico agéntico sobre EHR: razona, emite una batería única de llamadas paralelas a herramientas `ehr.*`, razona de nuevo sobre los resultados y responde.
- Llamada a herramientas (tool calling / function calling) en formato nativo de Qwen3.5, con nombres punteados y cierre mediante `ehr.finish`.
- Canal de pensamiento nativo (`<think>…</think>`) entrenado para sustituir los turnos `ehr.think` del profesor.
- Consulta de seis familias de tareas clínicas: diagnósticos (CCS), procedimientos (CCS), pruebas de laboratorio, pruebas de microbiología, prescripciones y traslados.
- Cumplimiento de política temporal estricta: solo utiliza eventos anteriores al momento de predicción de cada caso.
- Generación de texto conversacional y respuesta a preguntas clínicas en inglés.
- Capacidad multimodal potencial heredada del modelo base (etiqueta `image-text-to-text`), no documentada ni evaluada en esta release.
- Capacidades multilingües: no disponibles; la model card declara únicamente inglés.

## Casos de uso
- Recuperación de evidencia clínica en un solo pase: el modelo lanza una batería de llamadas paralelas a las tablas EHR y sintetiza la respuesta, lo que encaja en pipelines donde la latencia impide iteraciones múltiples de consulta.
- Preguntas de cohorte sobre diagnósticos y procedimientos: con las herramientas de carga y esquema (`load_ehr`, `get_table_names`, `get_column_names`) puede construir consultas sobre las tablas de MIMIC-IV y devolver recuentos o listados por paciente.
- Revisión de prescripciones y traslados: dado un caso y un instante de predicción, el agente consulta el historial previo y responde sobre medicación activa o movimientos entre unidades, respetando la política temporal.
- Extracción de resultados de laboratorio y microbiología: útil para resumir analíticas y cultivos previos a una decisión clínica dentro de un asistente de historia clínica.
- Base para un asistente de investigación clínica: al estar entrenado con tool calling nativo, se puede integrar en un orquestador que exponga las mismas herramientas `ehr.*` sobre un almacén de datos institucional.
- Punto de partida para ajuste adicional en dominios clínicos concretos: al ser un fine-tune completo en bf16 con safetensors, sirve como inicialización para SFT sobre trayectorias propias, siempre que se respete la licencia derivada de PhysioNet.
- Estudio comparativo de protocolos de recuperación: su valor inmediato es metodológico, como brazo S frente al brazo C multironda con idénticos profesor, herramientas y receta.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente "Evaluation: not evaluated in this release". La referencia externa a "94,4 % de su rendimiento" corresponde a la release oficial `UCSC-VLAA/ClinSeek-35B-A3B`, no a este checkpoint, y no se acompaña de la tabla de resultados.

Advertencia de solapamiento declarada por el autor (contada sobre las 3.000 preguntas de entrenamiento, antes del filtro de longitud): en el split `common` hay 10 identificadores de pregunta y 58 pacientes compartidos; en `rare`, 10 identificadores y 47 pacientes; en `sample`, ninguno. El subconjunto entrenado puede contener menos; hay que comprobar el solapamiento antes de evaluar en `common` o `rare`.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible en la información. Como referencia de orden de magnitud, los pesos en bf16 ocupan aproximadamente 71,9 GB, por lo que la inferencia en bf16 requiere más de 80 GB de VRAM solo para pesos, sin caché KV.
- GPU recomendadas: el entrenamiento se hizo en 8 × H200; para inferencia en bf16 hacen falta GPUs de 80 GB o más (H100, H200, A100 80 GB) o reparto multi-GPU.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en bf16; requeriría cuantización, cuyos formatos no están documentados en esta release.
- Opciones de despliegue: transformers (librería declarada) y endpoints compatibles (etiqueta `endpoints_compatible`). No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ClinSeek-35B-A3B arm S (este) | 35,95 B | 52K en entrenamiento | Fine-tune SFT de Qwen3.5-35B-A3B, trayectorias de un solo pase | `physionet-credentialed-derivative` | Hugging Face, 0 descargas |
| ClinSeek-35B-A3B arm C | 35,95 B (base idéntica) | 52K en entrenamiento | Mismo profesor y receta, protocolo multironda | `physionet-credentialed-derivative` | Hugging Face |
| UCSC-VLAA/ClinSeek-35B-A3B | 35 B (según nombre) | no disponible | Release oficial del artículo ClinSeekAgent | no disponible en la información | Hugging Face |
| Qwen/Qwen3.5-35B-A3B | 35,95 B | no disponible | Modelo base MoE generalista | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias
- No evaluado: esta release no incluye ninguna evaluación, por lo que no hay evidencia publicada de su calidad frente al modelo base ni frente al brazo C.
- Solapamiento train/eval: el split de entrenamiento de AgentEHR-Bench no es totalmente disjunto de los splits de evaluación; hay preguntas y pacientes compartidos en `common` y `rare`.
- Licencia restrictiva: los pesos derivan de datos de MIMIC-IV bajo DUA de PhysioNet con acceso acreditado; el uso comercial y la redistribución están sujetos a esas condiciones, no a una licencia permisiva.
- Datos no liberados: las 2.472 trayectorias de entrenamiento no se publican por contener registros de MIMIC-IV, lo que impide reproducir el ajuste exacto.
- Idioma: solo inglés declarado; no hay soporte multilingüe documentado.
- Dominio acotado: entrenado exclusivamente para consultas EHR con 16 herramientas `ehr.*` y política temporal estricta; fuera de ese esquema su comportamiento no está caracterizado.
- Riesgo de alucinación clínica: no se documentan mitigaciones, evaluaciones de seguridad ni tasas de error; no debe usarse en decisiones clínicas sin supervisión humana.
- Sesgos: no se documenta ningún análisis de sesgos demográficos, de subgrupos ni de calidad de datos.
- Herramientas ausentes: no se incluyen los servidores de herramientas `ehr.*`; hay que aportarlos desde el repositorio de código.
- Estado del checkpoint: es el paso 154 (fin de época 2 de 3), no el modelo final de la receta.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Letian2003/ClinSeek-35B-A3B-armS-singlepass-ep2
- Brazo C (comparación): https://huggingface.co/Letian2003/ClinSeek-35B-A3B-armC-multiround-ep2
- Release oficial: https://huggingface.co/UCSC-VLAA/ClinSeek-35B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Artículo: https://arxiv.org/abs/2605.20176
- Código: https://github.com/UCSC-VLAA/ClinSeekAgent
- Dataset de preguntas: https://huggingface.co/datasets/BlueZeros/AgentEHR-Bench
- DUA de MIMIC-IV: https://physionet.org/content/mimiciv/view-dua/3.1/
- Resumen externo: https://www.emergentmind.com/topics/clinseek-35b-a3b
