# Kaylee0501/SwAP-7B-theta0.1

## Resumen

SwAP-7B-theta0.1 es un ajuste fino del modelo DeepSeek-R1-Distill-Qwen-7B, desarrollado por Kaylee0501, que aplica la técnica SwAP (Step-wise Adaptive Penalization) descrita en el artículo de NeurIPS 2026 "Stepwise Penalization for Length-Efficient Chain-of-Thought Reasoning". El objetivo del modelo es reducir la longitud de las cadenas de razonamiento (chain-of-thought) sin sacrificar precisión en tareas de matemáticas y razonamiento científico.

El modelo parte de una arquitectura transformer Qwen2 con 7.615.616.512 parámetros totales (aproximadamente 7,6 mil millones) y hereda el contexto y las capacidades del modelo base DeepSeek-R1-Distill-Qwen-7B. La innovación principal reside en el entrenamiento con GRPO y una ventaja combinada de resultado y proceso que penaliza los pasos de razonamiento de baja importancia, logrando reducir la longitud media de respuesta de 8.102 a 4.970 tokens manteniendo una precisión media prácticamente idéntica (64,8 frente a 64,5).

Es relevante ahora porque aborda uno de los principales costes de los modelos de razonamiento: la verbosidad excesiva en las cadenas de pensamiento, que incrementa la latencia y el coste de inferencia. El checkpoint publicado corresponde al paso 390 de entrenamiento y se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2), ajuste fino del DeepSeek-R1-Distill-Qwen-7B |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se detallan cuantizaciones oficiales) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso basado en Qwen2, inicializado desde DeepSeek-R1-Distill-Qwen-7B, que a su vez es un destilado de razonamiento de DeepSeek-R1 sobre la familia Qwen2. El ajuste fino se realiza con GRPO (Group Relative Policy Optimization) sobre el dataset DeepScaleR, compuesto por 40.000 problemas de matemáticas de competición. La innovación técnica es la ventaja combinada de resultado y proceso: A = beta * A_outcome + theta * 1[correct] * A_process, con beta = 1 y theta = 0,1 en este checkpoint.

El proceso de entrenamiento estima la importancia de cada paso de razonamiento a partir de la mejora de log-probabilidad on-policy hacia la respuesta correcta. Los pasos se segmentan en tramos de aproximadamente 350 tokens, con un máximo de 20 pasos. La recompensa de paso se pondera a 0,5, la penalización de paso a 0,3, el coeficiente de penalización de longitud a 1,0 y la penalización máxima por paso a 0,15. La optimización usa batch de 64 prompts, mini-batch PPO de 32, tasa de aprendizaje 1e-6, pérdida KL de 1e-3 (KL de baja varianza), temperatura de rollout 1,0 y longitud máxima de respuesta de 12.000 tokens, con 16 rollouts por prompt. El framework empleado es verl y el checkpoint publicado es el paso 390.

## Capacidades

- Generación de texto y razonamiento paso a paso (chain-of-thought) con formato de respuesta final en `\boxed{}`.
- Razonamiento matemático de competición: aritmética, álgebra, teoría de números y problemas tipo MATH-500, AMC y AIME.
- Razonamiento científico de nivel avanzado, evaluado en GPQA-Diamond.
- Razonamiento eficiente: cadenas de pensamiento más cortas que el modelo base con precisión comparable.
- Conversación multi-turno mediante la plantilla de chat heredada del modelo base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso autónomo: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales: modo de razonamiento largo con muestreo a temperatura 0,8 y top-p 0,95; sin visión ni audio.

## Casos de uso

- Resolución de problemas matemáticos de competición: el modelo está entrenado sobre DeepScaleR y mantiene un 93,5 % en MATH-500 con la mitad de tokens que el base, lo que lo hace adecuado para pipelines de evaluación y generación de soluciones paso a paso con menor coste.
- Tutoría matemática automatizada: la reducción de longitud (de 8.102 a 4.970 tokens de media) abarata la generación de explicaciones detalladas en plataformas educativas, manteniendo la precisión en problemas de nivel AMC y AIME.
- Evaluación de razonamiento científico: su rendimiento en GPQA-Diamond (49,5 %) permite usarlo en entornos de verificación de respuestas de física, química y biología de nivel posgrado.
- Generación de datos sintéticos de razonamiento: al producir cadenas de pensamiento más concisas, es útil para crear datasets de entrenamiento con menor huella de tokens y mayor densidad informativa.
- Inferencia en producción con restricciones de latencia: su menor longitud media de respuesta reduce el tiempo de generación en despliegues con vLLM, lo que encaja en servicios interactivos donde el coste por consulta es crítico.
- Investigación sobre eficiencia de razonamiento: sirve como checkpoint de referencia para estudiar el equilibrio entre longitud y precisión en métodos de penalización por pasos, comparándolo con el modelo base sin ajustar.
- Despliegue en hardware de gama media: con 7,6 mil millones de parámetros, puede servirse en GPUs con suficiente VRAM para cuantizaciones de 16 y 8 bits, facilitando prototipos y pruebas locales.

## Benchmarks y rendimiento

Datos de la model card (pass@1 en % / longitud media de respuesta en tokens; muestreo con temperatura 0,8, top-p 0,95, máximo 16.384 tokens nuevos, 16 muestras por problema):

| Modelo | MATH-500 | AMC23 | AIME24 | AIME25 | GPQA-Diamond | Media |
|---|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-7B | 93,5 / 4009 | 90,6 / 6012 | 51,7 / 10642 | 40,0 / 11425 | 48,0 / 8422 | 64,8 / 8102 |
| SwAP-7B-theta0.1 | 93,5 / 1932 | 89,1 / 3277 | 52,7 / 6881 | 37,5 / 7251 | 49,5 / 5509 | 64,5 / 4970 |

## Requisitos de hardware

- VRAM estimada para inferencia (no publicada oficialmente; estimación a partir del tamaño de parámetros): aproximadamente 15,2 GB en FP16/BF16, unos 8 GB en cuantización de 8 bits y unos 4-5 GB en cuantización de 4 bits.
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB) para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 o 8 bits; RTX 3090 (24 GB) y GPUs de 16 GB para cuantizaciones de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y tarjetas con 16 GB o más en cuantizaciones de 8 bits; en 4 bits podría caber en GPUs de 8 GB.
- Opciones de despliegue: vLLM (usado en el ejemplo de la model card), transformers, text-generation-inference (etiqueta TGI presente); llama.cpp y Ollama no están confirmados en la información proporcionada.
- Latencia y throughput estimados: no disponibles. La reducción de longitud media de respuesta (de 8.102 a 4.970 tokens) implica un menor tiempo de generación frente al modelo base, aunque no se publican cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión media (benchmarks de la card) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SwAP-7B-theta0.1 | 7,6 mil millones | no disponible | 64,5 % / 4.970 tokens | MIT | Hugging Face |
| DeepSeek-R1-Distill-Qwen-7B | 7,6 mil millones | no disponible | 64,8 % / 8.102 tokens | MIT (modelo base) | Hugging Face |
| Alternativas de 7B con razonamiento eficiente | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa disponible es con el modelo base DeepSeek-R1-Distill-Qwen-7B, del que SwAP-7B-theta0.1 reduce la longitud media en un 38,7 % (de 8.102 a 4.970 tokens) con una caída de precisión media de 0,3 puntos. No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la model card; al derivar del modelo base, puede heredar sesgos de los datos de entrenamiento originales.
- Riesgo de alucinación: presente como en cualquier modelo generativo; en razonamiento matemático puede producir cadenas plausibles pero incorrectas, especialmente en problemas de alta dificultad (AIME25 cae a 37,5 %).
- Limitaciones de contexto e idioma: solo se declara soporte de inglés; la longitud de contexto no se especifica y conviene verificar la del modelo base antes de usos con ventanas largas.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificación y redistribución con atribución; no obstante, deben revisarse las condiciones del modelo base y del dataset DeepScaleR.
- Caveats para producción: el checkpoint corresponde al paso 390 y no hay información sobre validación externa; el formato de respuesta requiere instrucciones explícitas (razonamiento paso a paso y respuesta en `\boxed{}`) para obtener los resultados reportados; no se confirman capacidades de tool calling ni de agentes.
- El modelo está especializado en matemáticas y razonamiento científico; su rendimiento en tareas generales de conversación no está evaluado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kaylee0501/SwAP-7B-theta0.1
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Framework de entrenamiento verl: https://github.com/volcengine/verl
- Artículo (referencia de la model card): Li et al., "Stepwise Penalization for Length-Efficient Chain-of-Thought Reasoning", NeurIPS 2026 (no se proporciona URL del paper).
