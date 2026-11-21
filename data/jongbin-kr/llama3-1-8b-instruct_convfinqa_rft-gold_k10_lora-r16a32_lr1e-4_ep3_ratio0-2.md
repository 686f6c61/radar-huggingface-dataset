# Jongbin-kr/llama3.1-8b-instruct_convfinqa_RFT-gold_k10_lora-r16a32_lr1e-4_ep3_ratio0.2

## Resumen

Este repositorio contiene un adaptador LoRA (no un modelo completo) para `meta-llama/Llama-3.1-8B-Instruct`, entrenado por Jongbin-kr mediante fine-tuning con rejection sampling (RFT) sobre muestras generadas por el propio modelo base. El objetivo es especializar el modelo en tareas de razonamiento financiero conversacional, concretamente en el estilo del dataset ConvFinQA, donde el modelo debe responder preguntas numéricas a partir de contexto textual y tabular de informes financieros, manteniendo historial de conversación.

El adaptador se generó a partir de una muestra del 20 % (2.174 de 10.874 filas) del dataset `ssunggun2/LG_ConvFin_MCQ`. Para cada problema se muestrearon 10 respuestas del modelo base (temperatura 0,7, top_p 1,0) y se seleccionaron las correctas según etiquetas (variante "gold", que actúa como cota superior). El adaptador final se entrenó sobre 1.850 ejemplos con precisión de datos del 100 %.

Es relevante como caso de estudio metodológico: compara cinco estrategias de selección de muestras (random, sc, llm-choice, jev-choice, gold) sobre el mismo conjunto de candidatos, mostrando que la selección basada en etiquetas (gold) no es la que mejor generaliza en validación (62,7 % frente al 64,8 % de jev-choice). El adaptador es pequeño (0,2 GB) y se distribuye bajo licencia Llama 3.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Llama 3.1 8B Instruct |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base soporta 128k tokens) |
| Tipos de cuantizacion | no disponible (el adaptador se entrena en bf16; no se documentan cuantizaciones del adaptador) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA | r=16, alpha=32, dropout 0,05 |
| Modulos adaptados | todas las proyecciones lineales |
| Tamano del repo | 0,2 GB |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama 3.1 8B Instruct, un transformer decoder-only con atención por grupos (GQA) y RoPE. El entrenamiento LoRA usa r=16, alpha=32, dropout 0,05, aplicado a todas las proyecciones lineales, con optimizador de tasa de aprendizaje 1e-4 y scheduler coseno, warmup del 3 %, 3 épocas, batch efectivo de 32, pérdida solo sobre la completion (completion-only loss) y precisión bf16. Semilla 42 y una única ejecución.

El pipeline de RFT parte de 2.174 problemas de ConvFinQA (muestra uniforme del 20 %, semilla 42, del dataset `ssunggun2/LG_ConvFin_MCQ`, revisión 5669718b). Para cada problema se generan 10 muestras del modelo base con temperatura 0,7 y top_p 1,0, usando un system prompt de analista financiero y un turno de usuario con contexto del informe (texto y tabla), historial de conversación, pregunta e instrucción de responder con el formato `<think>…</think><answer>…</answer>`. La variante "gold" selecciona la primera muestra calificada como correcta según etiquetas; los problemas sin ninguna muestra correcta se descartan, quedando 1.850 ejemplos de entrenamiento con precisión de datos del 100 %.

## Capacidades

- Generación de texto conversacional en formato multi-turno, con contexto de informe financiero (texto y tabla) e historial de conversación.
- Razonamiento numérico sobre tablas y texto: cálculo de métricas financieras, variaciones porcentuales y comparaciones interanuales.
- Emisión de trazas de razonamiento explícitas mediante el formato `<think>…</think>` seguido de `<answer>…</answer>`.
- Respuesta a preguntas de opción múltiple y de respuesta abierta en el dominio ConvFinQA.
- Herencia de las capacidades generales del modelo base Llama 3.1 8B Instruct (generación, código, matemáticas básicas, multilingüismo), aunque el adaptador no las refuerza específicamente.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información proporcionada.

## Casos de uso

- Análisis de informes financieros: dado un fragmento de memoria anual con tablas, el adaptador responde preguntas del tipo "¿cuál fue la variación porcentual de los ingresos entre 2022 y 2023?" usando el formato think/answer, adecuado para pipelines de extracción de métricas.
- Asistentes de Q&A sobre documentación contable: integrado en un sistema RAG que recupere tablas y párrafos, el adaptador genera respuestas numéricas verificables y con traza de razonamiento auditable.
- Evaluación de metodologías de self-training: sirve como referencia ("gold", cota superior) para comparar estrategias de selección de muestras en experimentos de RFT sobre dominios especializados.
- Generación de datos sintéticos financieros: al producir razonamientos estructurados, puede emplearse para crear pares pregunta-respuesta con justificación en dominios contables.
- Prototipado de asistentes de banca o finanzas personales: para consultas multi-turno sobre estados financieros, con la ventaja de que el adaptador es pequeño (0,2 GB) y se puede cargar junto al modelo base en una sola GPU.
- Investigación en razonamiento numérico: como baseline especializado en ConvFinQA para estudiar el efecto del filtrado de datos por precisión frente a la accuracy en validación.

## Benchmarks y rendimiento

Evaluación sobre validación de ConvFinQA (`AdaptLLM/ConvFinQA`, 1.490 turnos), decodificación greedy; respuesta correcta si coincide por math-verify, exact match normalizado o match numérico (tolerancia relativa 1e-3, decimal↔porcentaje).

| Selección | Ejemplos SFT | Precisión de datos (%) | Accuracy en validación (%) |
|---|---|---|---|
| base (sin SFT) | — | — | 60,0 |
| random | 2.174 | 57,7 | 59,5 |
| sc | 2.174 | 67,5 | 60,6 |
| llm-choice | 2.174 | 62,3 | 58,9 |
| jev-choice | 2.174 | 73,0 | 64,8 |
| **gold (este adaptador)** | 1.850 | 100,0 | 62,7 |

El autor advierte que se trata de una única semilla de entrenamiento por selección y que diferencias inferiores a 2-3 puntos pueden ser ruido.

## Requisitos de hardware

- El adaptador pesa 0,2 GB; requiere cargar el modelo base Llama 3.1 8B Instruct (unos 16 GB en bf16).
- VRAM estimada para inferencia en bf16: aproximadamente 16-18 GB (pesos del modelo base más caché KV para contextos moderados).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090 (24 GB) también es viable.
- En GPUs consumer de 16 GB (RTX 4080, 4070 Ti Super) es necesario cuantizar el modelo base (por ejemplo, 8 bits o 4 bits con bitsandbytes) o usar GGUF.
- Despliegue: al ser un adaptador PEFT, se puede fusionar con el modelo base y servir con vLLM o TGI; también es posible exportarlo a GGUF para llama.cpp u Ollama, aunque no se documenta un procedimiento específico en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (LoRA sobre Llama 3.1 8B) | 8B (base) + LoRA r=16 | no disponible | Especialización ConvFinQA vía RFT | llama3.1 | Hugging Face (0 descargas) |
| Llama 3.1 8B Instruct (base) | 8B | 128k | Modelo generalista con instrucciones | llama3.1 | Hugging Face (ampliamente disponible) |
| Adaptadores ConvFinQA alternativos del mismo autor | 8B (base) + LoRA | no disponible | Variantes random/sc/llm-choice/jev-choice | llama3.1 | Hugging Face |
| Modelos especializados en finanzas de mayor tamaño (p. ej., familias 70B) | 70B | variable | Dominio financiero general | variable | variable |

No se dispone de datos de benchmarks comparativos con otros modelos financieros en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: requiere descargar y cargar `meta-llama/Llama-3.1-8B-Instruct` y aceptar su licencia.
- La variante "gold" usa etiquetas para seleccionar muestras, por lo que no es aplicable en escenarios sin supervisión; además, su accuracy en validación (62,7 %) es inferior a la de jev-choice (64,8 %), lo que sugiere sobreajuste a la distribución filtrada.
- Los resultados provienen de una única semilla de entrenamiento; el propio autor indica que diferencias de 2-3 puntos pueden deberse al ruido.
- Riesgo de alucinación en cifras y cálculos: aunque el formato think/answer facilita la verificación, no hay garantía de corrección numérica fuera de ConvFinQA.
- Dominio muy restringido (ConvFinQA y estilo de informes financieros); el rendimiento en otros dominios no está evaluado.
- Idiomas soportados no documentados; el entrenamiento se realizó sobre un dataset en inglés, por lo que el rendimiento en castellano no está validado.
- Licencia Llama 3.1 Community License: restricciones para uso comercial (umbral de 700 millones de usuarios mensuales), obligación de atribución y de mantener la denominación "Llama" en productos derivados.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad ni mantenimiento documentado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Jongbin-kr/llama3.1-8b-instruct_convfinqa_RFT-gold_k10_lora-r16a32_lr1e-4_ep3_ratio0.2
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/ssunggun2/LG_ConvFin_MCQ
- Dataset de evaluación: https://huggingface.co/datasets/AdaptLLM/ConvFinQA
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
- Librería PEFT: https://github.com/huggingface/peft
