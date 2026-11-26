# sinanelms/Qwen3-4B-Turkish-Legal-QA-v1

## Resumen

Qwen3-4B-Turkish-Legal-QA-v1 es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3-4B, desarrollado por el usuario sinanelms, orientado a la respuesta de preguntas sobre derecho turco. El modelo parte de la arquitectura transformer densa de Qwen3 con 4.022.468.096 parámetros y una ventana de contexto de 40.960 posiciones, y ha sido especializado mediante QLoRA sobre un corpus de 278.550 pares pregunta-respuesta jurídicos en turco. Su relevancia actual radica en que cubre un nicho poco atendido por los modelos generalistas: la consulta legal en turco con citas precisas de artículos de ley.

El ajuste se realizó con cuantización 4-bit NF4 (r=64, alpha=128) sobre los módulos de atención y MLP, y los pesos resultantes se fusionaron en bfloat16 para su distribución. El autor reporta una evaluación con separación estricta entre preguntas cuyo artículo legal sí aparecía en entrenamiento (in_domain) y preguntas sobre artículos nunca vistos (unseen_statute), lo que permite medir la capacidad de generalización a normativa no memorizada.

La ficha se basa exclusivamente en la model card y los metadatos publicados en Hugging Face. No hay información sobre benchmarks estándar (MMLU, HumanEval, GSM8K) ni sobre evaluación por terceros. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y la fecha de creación indicada (2026-11-25) es posterior a la redacción de esta ficha, por lo que se reproduce tal cual aparece en los metadatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), 36 capas, `max_position_embeddings: 40960` |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 40.960 tokens (heredada del modelo base) |
| Tipos de cuantizacion | GGUF Q4_K_M, Q5_K_M, Q8_0 (repo separado); pesos base en bfloat16; entrenamiento en 4-bit NF4 |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF en repositorio aparte |

## Arquitectura y entrenamiento

El modelo es un transformer denso decoder-only de la familia Qwen3, con 36 capas y 4.022 millones de parámetros. Sobre el modelo base en bfloat16 se aplicó un ajuste QLoRA de 4 bits NF4 con r=64, alpha=128 y dropout de 0,05, dirigido a los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, lo que supone 132.120.576 parámetros entrenables. El entrenamiento consistió en 1 época (4.352 pasos) con batch efectivo de 64, learning rate de 1e-4 con scheduler cosine, longitud máxima de secuencia de 1.024 tokens y AdamW fused. No se registraron pasos con NaN. El cómputo se repartió entre una RTX 5070 (pasos 0 a 3500) y una NVIDIA L4 (pasos 3500 a 4352), con un tiempo total de 8.664,19 segundos.

Los datos de entrenamiento provienen del dataset sinanelms/hukukisorularV2, con 278.550 ejemplos de entrenamiento, 2.000 de validación (1.000 in_domain y 1.000 unseen_statute) y 1.000 de test. El autor declara cero solapamiento de preguntas y cero filtración de artículos no vistos entre splits. Una innovación destacable es que se desactivó el modo de razonamiento de Qwen3 (`enable_thinking=False`) para que el modelo genere directamente explicación jurídica y referencia normativa, sin bloques `<think>`. El autor reporta 0/100 casos de fuga de caracteres CJK, cirílicos o etiquetas `<think>` en las versiones de 4B. No se documenta uso de RLHF ni DPO; el ajuste es supervisado sobre pares pregunta-respuesta.

## Capacidades

- Generación de respuestas jurídicas en turco con explicación y cita de ley y artículo (por ejemplo, TMK m. 557).
- Respuesta directa sin modo de razonamiento visible: el modelo está entrenado para omitir los bloques `<think>` de Qwen3.
- Manejo de preguntas de tipo sí/no sobre normativa, con precisión semántica reportada del 72,22% en el conjunto de test de 100 preguntas (versión Q8_0).
- Generalización parcial a artículos legales no vistos en entrenamiento (split unseen_statute), con Exact Article F1 de 0,564 según el autor.
- Contexto de hasta 40.960 tokens heredado del modelo base, aunque el ajuste se entrenó con secuencias de 1.024 tokens.
- Capacidad multilingüe limitada: el modelo está especializado y declarado únicamente para turco; no se documenta rendimiento en otros idiomas.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Asistencia a la consulta legal preliminar: un despacho turco podría desplegar el modelo como primer nivel de respuesta a preguntas frecuentes sobre derecho civil, con cita de artículos, y derivar los casos complejos a un abogado. Es adecuado por su especialización y por el formato de respuesta con referencia normativa.
- Búsqueda asistida de normativa: dado un supuesto de hecho en turco, el modelo genera la explicación y el artículo aplicable (por ejemplo, TMK m. 506 para porciones legitimarias), lo que sirve como punto de partida para que el profesional verifique la cita.
- Formación de estudiantes de derecho: el modelo puede generar explicaciones de instituciones jurídicas turcas con referencia a la ley, útil en entornos de estudio donde se requiere respuesta directa sin razonamiento visible.
- Clasificación y triaje de consultas jurídicas: con su capacidad de responder preguntas de sí/no y de identificar la rama del derecho implicada, puede integrarse en un sistema de enrutamiento de consultas hacia el especialista correspondiente.
- Generación de borradores de fichas normativas: para despachos que necesitan resúmenes de artículos concretos, el modelo produce texto en turco con la referencia de ley y artículo, que después se revisa manualmente.
- Despliegue en local para confidencialidad: al ser un modelo de 4B con licencia Apache 2.0 y versiones GGUF, puede ejecutarse en hardware de consumo (por ejemplo, RTX 5070 según las pruebas del autor) sin enviar datos de clientes a servicios externos, algo relevante en el ámbito legal.
- Evaluación comparativa de ajustes jurídicos: sirve como referencia para investigadores que comparan modelos pequeños especializados en derecho turco frente a modelos base de mayor tamaño.

## Benchmarks y rendimiento

El autor publica una evaluación propia sobre un conjunto de test de 100 preguntas (50 in_domain y 50 unseen_statute, 18 de sí/no, `n_predict=384`, `temperature=0.0`). No hay resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Modelo / versión | Tamano (MB) | Velocidad (t/s) | Token F1 (global / in / unseen) | Law F1 | Exact Article F1 | Precision si/no (semantica) | Repeticiones / cortes a 384 |
|---|---:|---:|---|---:|---:|---:|---:|
| Qwen3-0.6B (FT 278k, Q4_K_M, CPU) | 461,8 | 78,36 | 0,238 (0,256 / 0,219) | 0,736 | 0,488 | 77,78% | 14 / 8 |
| Qwen3-1.7B (FT 278k, Q4_K_M, CPU) | 1.056,1 | 27,22 | 0,283 (0,311 / 0,255) | 0,821 | 0,535 | 88,89% | 5 / 4 |
| Qwen3-1.7B (FT 278k, Q8_0, CPU) | 1.749,4 | 17,05 | 0,287 (0,324 / 0,251) | 0,842 | 0,539 | 94,44% | 5 / 4 |
| Qwen3-4B-v1 (Q4_K_M, CPU) | 2.381,6 | 14,94 | 0,304 (0,338 / 0,270) | 0,848 | 0,606 | 61,11% (13/18) | 2 / 1 |
| Qwen3-4B-v1 (Q4_K_M, RTX 5070) | 2.381,6 | 160,32 | 0,305 (0,340 / 0,270) | 0,848 | 0,573 | 66,67% (13/18) | 1 / 3 |
| Qwen3-4B-v1 (Q5_K_M, RTX 5070) | 2.755,7 | 143,47 | 0,299 (0,334 / 0,265) | 0,862 | 0,565 | 66,67% (13/18) | 3 / 4 |
| Qwen3-4B-v1 (Q8_0, RTX 5070) | 4.082,1 | 112,60 | 0,311 (0,349 / 0,273) | 0,823 | 0,574 (0,712 in) | 72,22% (14/18) | 0 / 0 |

Además, el autor reporta la evolución de la pérdida de validación: 2,5450 en el modelo base, 0,9460 al final del QLoRA (paso 4352) y 0,9817 tras fusionar en bfloat16, con perplejidad de 12,74 en base y 2,67 en el modelo fusionado. La pérdida en unseen_statute baja de 2,5540 a 0,9844 durante el ajuste.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 8 GB solo para pesos (4.022 millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda al menos 10-12 GB para contexto moderado.
- VRAM estimada en cuantización Q8_0: alrededor de 4,1 GB de pesos según el tamaño reportado (4.082,1 MB), más overhead; cabe en GPUs de 8 GB.
- VRAM estimada en Q4_K_M: alrededor de 2,4 GB de pesos (2.381,6 MB), apto para GPUs de consumo de 6-8 GB.
- GPU recomendadas: el autor probó RTX 5070 (Q4_K_M, Q5_K_M y Q8_0) y NVIDIA L4 para el entrenamiento. Para inferencia en producción se puede usar A100, H100 o L4; para consumo, RTX 4090, RTX 3090 o RTX 5070.
- Cabe en GPU de consumo: sí, en RTX 5070 y previsiblemente en RTX 3060 de 12 GB o superiores con cuantizaciones Q4/Q5/Q8.
- Opciones de despliegue: transformers (pesos safetensors), llama.cpp y Ollama mediante los GGUF publicados en el repositorio sinanelms/Qwen3-4B-Turkish-Legal-QA-v1-GGUF, y text-generation-inference (el modelo está etiquetado como endpoints_compatible).
- Rendimiento reportado por el autor en RTX 5070: 160,32 t/s con Q4_K_M, 143,47 t/s con Q5_K_M y 112,60 t/s con Q8_0. En CPU, 14,94 t/s con Q4_K_M.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-Turkish-Legal-QA-v1 | 4.022 M | 40.960 | QA juridica en turco (QLoRA sobre Qwen3-4B) | Apache 2.0 | Hugging Face, GGUF aparte |
| Qwen3-1.7B (ajuste del mismo autor, 278k) | 1.700 M aprox. | 40.960 (heredado) | QA juridica en turco, mismo dataset | Apache 2.0 | Hugging Face (referenciado en la model card) |
| Qwen3-0.6B (ajuste del mismo autor, 278k) | 600 M aprox. | 40.960 (heredado) | QA juridica en turco, mismo dataset | Apache 2.0 | Hugging Face (referenciado en la model card) |
| Qwen/Qwen3-4B (modelo base) | 4.022 M | 40.960 | Modelo generalista multilingue con modo thinking | Apache 2.0 | Hugging Face |

La comparación se limita a las variantes del mismo autor y al modelo base, porque no se dispone de datos sobre otros ajustes jurídicos turcos comparables en la información proporcionada. En la tabla de evaluación del autor, el 4B supera al 1.7B y al 0.6B en Token F1 global (0,311 frente a 0,287 y 0,238 en Q8_0/Q4_K_M) y en Exact Article F1 (0,574 frente a 0,539 y 0,488), aunque el 1.7B en Q8_0 obtiene mejor precisión en preguntas de sí/no (94,44% frente a 72,22%).

## Limitaciones y advertencias

- Especialización monoidioma: el modelo está declarado únicamente para turco; no se ha evaluado su comportamiento en castellano ni en otros idiomas, y es previsible que degrade fuera del turco.
- Riesgo de alucinación jurídica: aunque el autor reporta mejoras en la cita exacta de artículos, el Exact Article F1 en unseen_statute es de 0,564, lo que implica que una parte significativa de las referencias normativas puede ser incorrecta. No debe usarse como fuente legal sin verificación humana.
- Precisión limitada en preguntas de sí/no: el 72,22% en la versión Q8_0 (14/18) indica que aproximadamente una de cada cuatro respuestas binarias puede ser errónea.
- Sesgos de los datos: el corpus hukukisorularV2 procede de una única fuente y no se documenta su composición, cobertura por ramas del derecho ni procesos de anonimización; pueden existir sesgos de selección o desactualización normativa.
- Contexto efectivo menor que el nominal: aunque el modelo base soporta 40.960 tokens, el ajuste se entrenó con `max_seq_len=1024`, por lo que el rendimiento en contextos largos no está validado.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre la exactitud jurídica; la responsabilidad del uso recae en el desplegador.
- Madurez: el modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, sin evaluación independiente conocida.
- Repositorio de 8,6 GB: incluye pesos bfloat16 y adaptadores LoRA, lo que requiere espacio de almacenamiento considerable frente a las versiones GGUF.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sinanelms/Qwen3-4B-Turkish-Legal-QA-v1
- Versiones GGUF: https://huggingface.co/sinanelms/Qwen3-4B-Turkish-Legal-QA-v1-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/sinanelms/hukukisorularV2
- Informe técnico del autor: https://huggingface.co/sinanelms/Qwen3-4B-Turkish-Legal-QA-v1/blob/main/reports/TEKNIK_ANALIZ_RAPORU.md
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
