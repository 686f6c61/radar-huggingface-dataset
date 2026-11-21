# Jongbin-kr/llama3.1-8b-instruct_convfinqa_RFT-random_k10_lora-r16a32_lr1e-4_ep3_ratio0.2

## Resumen

Este repositorio contiene un adaptador LoRA (no un modelo completo) entrenado sobre `meta-llama/Llama-3.1-8B-Instruct` mediante *rejection-sampling fine-tuning* (RFT) sin etiquetas, es decir, utilizando muestras generadas por el propio modelo base. Lo publica el usuario Jongbin-kr como artefacto de investigación para un experimento comparativo sobre estrategias de selección de muestras en tareas de razonamiento financiero conversacional (ConvFinQA). El adaptador `random` es una de las cinco variantes del estudio (junto con `sc`, `llm-choice`, `jev-choice` y `gold`), y en este caso selecciona la primera de diez muestras generadas por problema.

El interés del artefacto no reside en su rendimiento absoluto —de hecho, el adaptador `random` obtiene 59,5 % de exactitud frente al 60,0 % del modelo base sin ajuste—, sino en que documenta de forma reproducible un pipeline de autoentrenamiento con métricas de precisión de datos y comparación entre métodos de selección. El adaptador `jev-choice` del mismo estudio alcanza 64,8 %, lo que evidencia que la selección de muestras importa más que el volumen de datos en este régimen.

Se trata de un adaptador pequeño (0,2 GB en el repositorio), con rango LoRA 16 y alpha 32, pensado para cargarse junto al modelo base de 8 000 millones de parámetros. No incorpora pesos completos ni vocabulario propio, y hereda las capacidades, el contexto de 128 000 tokens y las limitaciones del Llama 3.1 8B Instruct original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Llama 3.1 8B Instruct |
| Parametros totales | 8 000 millones (modelo base); el adaptador LoRA añade un subconjunto no especificado |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 000 tokens (heredada del modelo base; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (el adaptador se entrenó en bf16; el modelo base admite cuantizaciones estándar de Llama 3.1) |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA / alpha / dropout | r=16 / alpha=32 / 0.05 |
| Modulos objetivo | todas las proyecciones lineales |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct |
| Dataset de entrenamiento | ssunggun2/LG_ConvFin_MCQ (revision 5669718b), 2 174 de 10 874 filas (20 %, seed 42) |
| Hiperparametros SFT | lr 1e-4 coseno, warmup 3 %, 3 épocas, batch efectivo 32, completion-only loss, bf16, seed 42 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama 3.1 8B Instruct, un transformer decoder-only denso de 8 000 millones de parámetros con atención por grupos (GQA) y RoPE, sin modificaciones estructurales. El ajuste es un LoRA de rango 16 sobre todas las proyecciones lineales, con alpha 32 y dropout 0,05, entrenado en bf16 con pérdida restringida a la completación (completion-only loss) y optimizador con scheduler coseno, warmup del 3 % y 3 épocas.

El pipeline de datos es el núcleo del experimento. Para cada uno de los 2 174 problemas (muestra uniforme del 20 % del dataset ConvFinQA-style `LG_ConvFin_MCQ`), se generaron 10 muestras del modelo base con temperatura 0,7 y top_p 1,0, usando un system prompt de analista financiero y un turno de usuario que combina contexto del informe (texto y tabla), historial de conversación, pregunta e instrucción de responder con el formato `<think>…</think><answer>…</answer>`. La variante `random` selecciona la primera muestra del lote (orden aleatorio), sin ningún filtro de corrección. La precisión de datos resultante es del 57,7 %, frente al 73,0 % del método `jev-choice` o el 100 % del conjunto `gold`. El entrenamiento se ejecutó una sola vez por variante, por lo que el autor advierte que diferencias inferiores a 2-3 puntos pueden ser ruido.

## Capacidades

- Generación de texto conversacional multi-turno en el dominio financiero (análisis de informes con tablas y texto).
- Razonamiento aritmético sobre tablas financieras, con salida estructurada en bloques `<think>` y `<answer>`.
- Respuesta a preguntas de tipo ConvFinQA (extracción y cálculo sobre estados financieros).
- Hereda del modelo base: tool calling, razonamiento multi-paso, generación de código y capacidades multilingües (no verificadas específicamente para este adaptador).
- No se documentan capacidades de visión, audio ni modo thinking nativo más allá del formato `<think>` inducido por prompt.

## Casos de uso

- Investigación sobre autoentrenamiento y RFT: reproducir el pipeline de generación de 10 muestras por problema y comparar estrategias de selección (`random`, `sc`, `llm-choice`, `jev-choice`, `gold`) con la misma semilla y los mismos hiperparámetros.
- Análisis de calidad de datos sintéticos: usar la métrica de precisión de datos (57,7 % en esta variante) como línea base para estudiar el impacto del filtrado en el rendimiento final.
- Extracción de respuestas numéricas de informes financieros: el adaptador está especializado en el formato de respuesta `<think>…</answer>` sobre contexto tabular, útil para prototipos de asistentes de análisis de estados financieros.
- Evaluación comparativa de adaptadores LoRA: servir como control negativo en experimentos donde se mide el efecto de la selección de muestras frente al ajuste supervisado con etiquetas gold (62,7 %).
- Docencia y formación: ejemplo reproducible de un pipeline PEFT completo (generación, selección, SFT con completion-only loss) para cursos de ajuste fino eficiente.
- Base para experimentos de destilación o self-training en dominios verticales: el mismo esquema (muestreo múltiple + selección + LoRA) es trasladable a otros dominios con datasets de preguntas y respuestas verificables.

## Benchmarks y rendimiento

Evaluación sobre ConvFinQA validation (`AdaptLLM/ConvFinQA`, 1 490 turnos), decodificación greedy; respuesta correcta si coincide por math-verify, exact match normalizado o coincidencia numérica (tolerancia relativa 1e-3, decimal↔porcentaje).

| Selección | Ejemplos SFT | Precisión de datos (%) | Exactitud eval (%) |
|---|---|---|---|
| base (sin SFT) | — | — | 60,0 |
| **random (este adaptador)** | 2 174 | 57,7 | 59,5 |
| sc | 2 174 | 67,5 | 60,6 |
| llm-choice | 2 174 | 62,3 | 58,9 |
| jev-choice | 2 174 | 73,0 | 64,8 |
| gold | 1 850 | 100,0 | 62,7 |

Una sola semilla de entrenamiento por selección; diferencias inferiores a 2-3 puntos pueden ser ruido.

## Requisitos de hardware

- VRAM estimada para inferencia: ~16 GB en bf16/fp16 para el modelo base de 8B; ~8-10 GB en cuantización de 8 bits; ~5-6 GB en 4 bits (estimaciones estándar para Llama 3.1 8B, no publicadas en la model card).
- GPU recomendadas: A100 40/80 GB, H100, L40S para servicio en bf16; RTX 4090 (24 GB) suficiente para bf16 y para fine-tuning LoRA ligero.
- Cabe en GPU de consumo: sí, RTX 3090/4090 (24 GB) en bf16, y GPUs de 8-12 GB con cuantización 4/8 bits.
- Despliegue: transformers + peft (carga del adaptador), vLLM (con soporte LoRA), TGI, llama.cpp/Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Exactitud ConvFinQA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (random) | 8B + LoRA r16 | 128k (heredado) | 59,5 % | llama3.1 | Hugging Face (PEFT) |
| Adaptador jev-choice (mismo estudio) | 8B + LoRA r16 | 128k (heredado) | 64,8 % | llama3.1 | Hugging Face (PEFT) |
| Llama 3.1 8B Instruct (base) | 8B | 128k | 60,0 % | llama3.1 | Hugging Face |
| Fine-tuning con gold (mismo estudio) | 8B + LoRA r16 | 128k (heredado) | 62,7 % | llama3.1 | Hugging Face (PEFT) |

## Limitaciones y advertencias

- El adaptador `random` no supera al modelo base en la evaluación principal (59,5 % frente a 60,0 %); no debe presentarse como una mejora.
- La selección aleatoria de muestras produce un 42,3 % de ejemplos con respuesta final incorrecta (precisión de datos 57,7 %), lo que introduce ruido en el ajuste.
- Entrenado con una sola semilla por variante; las diferencias entre métodos pueden estar dentro del ruido estadístico (±2-3 puntos según el autor).
- Dominio muy restringido: preguntas y respuestas sobre informes financieros en formato ConvFinQA; el rendimiento fuera de ese dominio no está evaluado.
- Idiomas soportados no declarados; el dataset de entrenamiento parece estar en inglés, por lo que el rendimiento en castellano no está verificado.
- Riesgo de alucinación en cálculos numéricos y en la extracción de cifras de tablas, especialmente con contextos largos.
- Licencia Llama 3.1 Community License: restricciones de uso comercial, obligación de atribución y cláusulas de uso aceptable; revisar antes de cualquier despliegue en producción.
- No es un modelo autónomo: requiere cargar el modelo base `meta-llama/Llama-3.1-8B-Instruct` y el adaptador por separado con PEFT.
- Sin descargas ni validación comunitaria (0 descargas, 0 likes en el momento de la consulta); no hay evidencia de uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Jongbin-kr/llama3.1-8b-instruct_convfinqa_RFT-random_k10_lora-r16a32_lr1e-4_ep3_ratio0.2
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/ssunggun2/LG_ConvFin_MCQ
- Dataset de evaluación: https://huggingface.co/datasets/AdaptLLM/ConvFinQA
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
- Librería PEFT: https://github.com/huggingface/peft
