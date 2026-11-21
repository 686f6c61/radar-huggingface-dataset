# Jongbin-kr/llama3.1-8b-instruct_convfinqa_RFT-jev-choice_k10_lora-r16a32_lr1e-4_ep3_ratio0.2

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA para `meta-llama/Llama-3.1-8B-Instruct`, desarrollado por el usuario Jongbin-kr. El adaptador se ha entrenado mediante rejection-sampling fine-tuning (RFT) sin etiquetas de referencia, es decir, seleccionando entre las propias muestras generadas por el modelo base aquellas cuya respuesta final es correcta y usándolas como datos de supervisión. El dominio de aplicación es ConvFinQA, una tarea de razonamiento numérico sobre conversaciones con informes financieros que combinan texto y tablas.

La relevancia técnica del artefacto no reside en el modelo base, sino en la metodología de selección de muestras: el autor compara varias estrategias de selección (aleatoria, self-consistency, elección por LLM y una selección propia denominada `jev-choice`) sobre el mismo conjunto de 10 muestras por problema generadas por Llama-3.1-8B-Instruct. La variante publicada aquí, `jev-choice`, obtiene una precisión de datos del 73,0 % y una exactitud de evaluación del 64,8 % en el conjunto de validación de ConvFinQA, frente al 60,0 % del modelo base sin ajuste.

El adaptador es de tamano reducido (0,2 GB en el repositorio) y emplea LoRA con rango 16 sobre todas las proyecciones lineales. Al ser un adaptador PEFT, requiere cargar el modelo base completo de 8.000 millones de parametros para su uso, lo que condiciona los requisitos de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Llama 3.1 8B |
| Parametros totales | no disponible (adaptador LoRA r=16, alpha=32, dropout 0,05, sobre todas las proyecciones lineales) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Llama 3.1 8B Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se entrenó en bf16; el modelo base admite las cuantizaciones habituales de Llama 3.1) |
| Idiomas soportados | no disponible en la informacion proporcionada (heredados del modelo base) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `meta-llama/Llama-3.1-8B-Instruct`, un transformer decoder-only de 8.000 millones de parametros con atención causal estándar. La configuración LoRA utilizada es r=16, alpha=32, dropout 0,05, aplicada a todas las proyecciones lineales del modelo. El entrenamiento emplea pérdida solo sobre la completación (completion-only loss), precisión bf16, optimizador con learning rate 1e-4 y schedule coseno con 3 % de warmup, batch efectivo de 32, 3 épocas y semilla 42, en una única ejecución.

Los datos de entrenamiento provienen de `ssunggun2/LG_ConvFin_MCQ` (revisión 5669718b), del cual se tomó una muestra uniforme del 20 % (semilla 42), es decir, 2.174 de 10.874 filas. Para cada problema se generaron 10 muestras con Llama-3.1-8B-Instruct (temperatura 0,7, top_p 1,0), usando un system prompt de analista financiero y un turno de usuario que incluye el contexto del informe (texto y tabla), el historial de conversación, la pregunta y una instrucción para responder con el formato `<think>…</think><answer>…</answer>`. La innovación metodológica es la selección `jev-choice` (TypeSafe jev Choice): lee las 10 muestras (incluidos duplicados), suma probabilidades por respuesta final, elige la respuesta más probable y, dentro de ella, la muestra con mayor probabilidad individual. El resultado es un conjunto de datos con 73,0 % de precisión de respuesta final, superior al 67,5 % de self-consistency y al 62,3 % de la selección por LLM, y cercano al 100 % del conjunto con anotaciones gold (que solo aporta 1.850 ejemplos).

## Capacidades

- Generación de texto conversacional y razonamiento numérico sobre informes financieros con contexto textual y tabular.
- Resolución de preguntas de tipo ConvFinQA con formato explícito de razonamiento (`<think>…</think>`) y respuesta final (`<answer>…</answer>`).
- Razonamiento multi-turno: el prompt de entrenamiento incorpora el historial de conversación.
- Cálculo aritmético y comparación de cifras financieras (porcentajes, decimales, variaciones).
- No se documenta soporte de tool calling ni function calling en la información proporcionada.
- No se documenta soporte de agentes ni multi-step reasoning más allá del formato think/answer.
- No se documentan capacidades de visión, audio ni thinking mode extendido.
- Capacidades multilingües: no disponibles en la información proporcionada (dependen del modelo base).

## Casos de uso

- Análisis de informes financieros conversacionales: el adaptador responde preguntas sobre tablas y texto de informes anuales o trimestrales manteniendo el historial de la conversación, aprovechando el formato think/answer para auditar el razonamiento.
- Extracción de métricas y variaciones: dado un contexto con cifras, el modelo calcula diferencias, ratios y porcentajes, útil para asistentes de analistas que necesitan respuestas numéricas verificables.
- Evaluación de pipelines de RFT: sirve como referencia reproducible para comparar estrategias de selección de muestras (random, self-consistency, llm-choice, jev-choice) en tareas de razonamiento numérico.
- Investigación en self-training sin etiquetas: el adaptador demuestra que la selección type-safe de muestras propias puede superar al ajuste con etiquetas gold en exactitud de validación (64,8 % frente a 62,7 %), lo que lo hace útil como baseline en experimentos de autoentrenamiento.
- Asistente de soporte a auditoría financiera: con contexto largo de informes y preguntas encadenadas, el modelo puede responder consultas de seguimiento sobre cifras ya mencionadas en turnos anteriores.
- Prototipado de QA sobre dominios tabulares: la metodología y el formato de prompt son trasladables a otros dominios con texto y tablas (por ejemplo, informes técnicos o presupuestos), reutilizando el adaptador como punto de partida.

## Benchmarks y rendimiento

Evaluación sobre validación de ConvFinQA (`AdaptLLM/ConvFinQA`, 1.490 turnos), decodificación greedy. Una respuesta se considera correcta si coincide por math-verify, exact match normalizado o coincidencia numérica (tolerancia relativa 1e-3, decimal↔porcentaje).

| Selección | Ejemplos SFT | Precisión de datos (%) | Exactitud de evaluación (%) |
|---|---|---|---|
| base (sin SFT) | — | — | 60,0 |
| random | 2.174 | 57,7 | 59,5 |
| sc (self-consistency) | 2.174 | 67,5 | 60,6 |
| llm-choice | 2.174 | 62,3 | 58,9 |
| **jev-choice** | 2.174 | 73,0 | 64,8 |
| gold | 1.850 | 100,0 | 62,7 |

El autor advierte que solo hay una semilla de entrenamiento por selección y que las diferencias inferiores a 2-3 puntos pueden ser ruido.

## Requisitos de hardware

- El adaptador pesa 0,2 GB, pero requiere cargar el modelo base Llama-3.1-8B-Instruct completo (aproximadamente 16 GB en bf16/fp16).
- VRAM estimada para inferencia en bf16: alrededor de 16-18 GB solo para pesos, más KV cache y activaciones; en la práctica, 20-24 GB para contextos moderados.
- GPU recomendadas: A100 40/80 GB, H100, L40S; en consumer, RTX 4090 (24 GB) puede ejecutar el modelo base en bf16 con contexto limitado.
- Cuantización del modelo base a 8 bits (aproximadamente 8-9 GB) o 4 bits (aproximadamente 5-6 GB) permite su ejecución en GPUs consumer como RTX 3090, RTX 4070 Ti o RTX 4080; el adaptador LoRA puede aplicarse sobre el modelo cuantizado con PEFT.
- Opciones de despliegue: `transformers` + `peft` (como en el ejemplo de la model card), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, y llama.cpp/Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exactitud ConvFinQA (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Este adaptador (jev-choice)** | 8B (base) + LoRA r=16 | no disponible | 64,8 % | llama3.1 | Hugging Face (adaptador PEFT) |
| Llama-3.1-8B-Instruct (base) | 8B | no disponible | 60,0 % | llama3.1 | Hugging Face |
| Adaptador random (misma base) | 8B (base) + LoRA r=16 | no disponible | 59,5 % | llama3.1 | Hugging Face |
| Adaptador gold (misma base) | 8B (base) + LoRA r=16 | no disponible | 62,7 % | llama3.1 | Hugging Face |

No se dispone de datos de benchmarks de otros modelos comparables (por ejemplo, variantes de 7-8B ajustadas específicamente para ConvFinQA) en la información proporcionada.

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente sobre una muestra del 20 % de ConvFinQA; su generalización fuera del dominio financiero no está evaluada.
- Solo se realizó una semilla de entrenamiento por estrategia de selección; las diferencias de 2-3 puntos pueden no ser estadísticamente significativas.
- La precisión de datos del conjunto de entrenamiento es del 73,0 %, por lo que aproximadamente el 27 % de los ejemplos de SFT contienen respuestas finales incorrectas, lo que puede introducir errores sistemáticos.
- La evaluación usa coincidencia por math-verify y tolerancia numérica, no una verificación semántica completa; puede haber respuestas correctas por coincidencia parcial.
- Riesgo de alucinación en cifras y cálculos: el modelo puede generar respuestas numéricamente plausibles pero incorrectas, especialmente con tablas grandes o preguntas ambiguas.
- Sesgos: no documentados en la información proporcionada; hereda los sesgos del modelo base Llama 3.1.
- Restricciones de licencia: uso sujeto a la Llama 3.1 Community License, que incluye condiciones de atribución y restricciones para usos prohibidos; revisar antes de uso comercial.
- El adaptador no es un modelo autónomo: requiere el modelo base, lo que implica aceptar también su licencia y sus requisitos de hardware.
- Idiomas soportados no documentados; el entrenamiento se realizó presumiblemente en inglés financiero, por lo que el rendimiento en castellano no está garantizado.

## Enlaces

- Hugging Face: https://huggingface.co/Jongbin-kr/llama3.1-8b-instruct_convfinqa_RFT-jev-choice_k10_lora-r16a32_lr1e-4_ep3_ratio0.2
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/ssunggun2/LG_ConvFin_MCQ
- Dataset de evaluación: https://huggingface.co/datasets/AdaptLLM/ConvFinQA
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
