# juwon1105/RLCR-llama32-3B-bigmathdigits5000

## Resumen

RLCR-llama32-3B-bigmathdigits5000 es un modelo de lenguaje de 3,2 mil millones de parametros desarrollado por juwon1105, basado en Llama-3.2-3B-Instruct de Meta. Se entrena con RLCR (Reinforcement Learning with Calibration Rewards), una tecnica que anade una recompensa basada en el Brier score sobre la confianza verbalizada del modelo, junto con la recompensa de correccion por exactitud, para optimizar conjuntamente el razonamiento y la calibracion de la confianza. El checkpoint acompania el paper *"Confidence as Curriculum: Reinforcement Learning for Joint Reasoning and Calibration"*, actualmente bajo revision.

El modelo se entrena sobre el dataset Big-Math-digits con 5.000 muestras de entrenamiento y 1.000 de evaluacion, utilizando GRPO con LoRA sobre las proyecciones q_proj y v_proj. Su objetivo principal es que el modelo no solo resuelva problemas aritmeticos, sino que tambien verbalice niveles de confianza bien calibrados, de modo que una respuesta incorrecta no vaya acompanada de una confianza alta.

La relevancia de este modelo radica en que aborda un problema poco explorado en la optimizacion por refuerzo de LLMs: la calibracion de la confianza. Mientras que la mayoria de los enfoques optimizan unicamente la exactitud, RLCR introduce una senal de recompensa adicional que penaliza la discrepancia entre la confianza expresada y la correccion real, lo cual es critico para aplicaciones donde las respuestas erroneas con alta confianza pueden tener consecuencias graves.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) |
| Parametros totales | 3.212.749.824 (~3,2B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens en el modelo base Llama-3.2-3B-Instruct; no especificada en la model card del fine-tune |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Llama-3.2-3B-Instruct, un transformer decoder-only con 3,2B parametros y ventana de contexto de 128K tokens. El entrenamiento utiliza RLCR, que combina la recompensa de correccion (exact match sobre la respuesta final extraida mediante reglas) con una recompensa basada en el Brier score sobre la confianza verbalizada. Esto permite optimizar simultaneamente la exactitud del razonamiento y la calibracion de la confianza, de forma que el modelo aprenda a expresar su incertidumbre de manera fiable.

El entrenamiento se realiza con GRPO (Group Relative Policy Optimization) durante 1 epoca, con batch size por dispositivo de 1, KL penalty β = 0, AdamW de 8 bits y grad norm maximo de 1,0. Se aplica LoRA sobre q_proj y v_proj con rank 16, alpha 32 y dropout 0,05. Los rollouts se generan con vLLM a temperatura 0,7, con 32 generaciones por prompt y un rollout batch efectivo de 1.024. El learning rate es 5e-6 con schedule lineal y warmup de 0,20. La longitud maxima de respuesta es de 1.024 tokens. El entrenamiento se realizo en una unica RTX 3090 durante 16-36 horas GPU.

## Capacidades

- Razonamiento matematico: entrenado especificamente sobre problemas de aritmetica con digitos grandes (Big-Math-digits), con exactitud del 28,7% en el conjunto held-out.
- Calibracion de confianza: el modelo verbaliza su nivel de confianza y esta entrenado para que dicha confianza este bien calibrada, con ECE de 0,185, PCE de 0,171 y Brier score de 0,242.
- Generacion de texto: hereda las capacidades de generacion de Llama-3.2-3B-Instruct, incluyendo formato instruct y respuestas conversacionales.
- Conversacion multi-turno: al derivar de un modelo instruct-tuned, mantiene capacidades de dialogo.
- Tool calling y function calling: no especificado en la informacion disponible.
- Capacidades multilingues: no especificadas en la model card, aunque el modelo base Llama-3.2-3B-Instruct soporta multiples idiomas.

## Casos de uso

- Evaluacion de incertidumbre en modelos de razonamiento: el modelo puede usarse como referencia para estudiar como los LLMs expresan y calibran su confianza en tareas de razonamiento, gracias a su entrenamiento especifico con recompensas de calibracion.
- Investigacion en RLHF y GRPO: sirve como checkpoint de referencia para investigaciones sobre recompensas compuestas (exactitud + calibracion) y curricula de entrenamiento, como se describe en el paper que lo acompania.
- Sistemas de QA con confianza: en aplicaciones donde se necesita que el modelo indique su nivel de certeza, como triage de consultas, filtrado de respuestas o escalado a humanos cuando la confianza es baja.
- Benchmarking de calibracion: util para comparar metricas de calibracion (ECE, PCE, Brier score, AUROC) entre modelos de tamano similar entrenados con distintos objetivos.
- Educacion en IA: como ejemplo didactico de entrenamiento con recompensas basadas en calibracion y de aplicacion de GRPO con LoRA sobre un modelo base de tamano medio.
- Prototipos de agentes con autoevaluacion: el modelo puede integrarse en pipelines donde la confianza verbalizada se usa para decidir si consultar una fuente externa, delegar en un modelo mayor o abstener una respuesta.

## Benchmarks y rendimiento

Segun la model card, los resultados en el conjunto held-out (1.000 muestras) son:

| Metrica | Valor |
|---|---|
| Accuracy (held-out) | 0,287 |
| ECE (Expected Calibration Error) | 0,185 |
| PCE (Pearson Calibration Error) | 0,171 |
| Brier score | 0,242 |
| AUROC | 0,583 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. La model card indica que estos datos corresponden a la tabla 4 del paper, que compara curricula RLCC para Llama-3.2-3B.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 3,2B parametros. En FP16, los pesos ocupan aproximadamente 6,4 GB; en cuantizacion de 8 bits, unos 3,2 GB; en 4 bits, unos 1,6 GB. Con KV cache y activaciones, se recomienda al menos 8 GB de VRAM para FP16.
- GPU recomendadas: el entrenamiento se realizo en una RTX 3090 (24 GB), por lo que cualquier GPU con 8 GB o mas puede ejecutar inferencia. Modelos como RTX 3060 (12 GB), RTX 4070, RTX 4090 o A100 son adecuados.
- Compatibilidad con GPUs de consumo: si, cabe en GPUs de consumo con 8 GB o mas de VRAM.
- Opciones de despliegue: vLLM (usado para rollouts durante el entrenamiento), transformers, llama.cpp, Ollama, TGI.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| RLCR-llama32-3B-bigmathdigits5000 | 3,2B | 128K (base) | other (no especificada) | Fine-tune con RLCR para calibracion y razonamiento |
| Llama-3.2-3B-Instruct (base) | 3,2B | 128K | Llama 3.2 Community License | Modelo base sin entrenamiento RLCR |
| Qwen3-4B (mencionado en el paper) | 4B | No disponible | No disponible | Usado en el paper como comparativa de curricula RLCC |

Nota: la comparativa con Qwen3-4B se menciona en la seccion de compute de la model card, pero no se proporcionan datos de rendimiento comparativos en la informacion disponible.

## Limitaciones y advertencias

- Exactitud limitada: el modelo alcanza solo un 28,7% de accuracy en el conjunto held-out, lo que indica un rendimiento modesto en problemas matematicos.
- Dataset especifico: entrenado exclusivamente sobre Big-Math-digits, por lo que su generalizacion a otros dominios o tipos de problemas no esta garantizada.
- Licencia "other" no especificada: la licencia no esta detallada, lo que puede limitar su uso comercial. Se recomienda contactar al autor antes de desplegarlo en produccion.
- Idiomas no especificados: no se indica que idiomas soporta, aunque al derivar de Llama-3.2-3B-Instruct probablemente herede sus capacidades multilingues.
- Modelo de investigacion: el checkpoint acompania un paper bajo revision anonima, por lo que su estabilidad y robustez en entornos de produccion no estan validadas.
- Riesgo de alucinacion: como cualquier LLM, puede generar respuestas incorrectas con alta confianza; el entrenamiento RLCR busca mitigarlo, pero no lo elimina.
- Longitud de respuesta limitada: la longitud maxima de respuesta durante el entrenamiento fue de 1.024 tokens, lo que puede limitar su capacidad para tareas de razonamiento extenso o generacion de documentos largos.
- Sin garantias de reproducibilidad: los detalles completos del dataset y del pipeline de entrenamiento solo estan disponibles en el paper, que aun no es publico.

## Enlaces

- HuggingFace: https://huggingface.co/juwon1105/RLCR-llama32-3B-bigmathdigits5000
- Dataset Big-Math-digits: https://huggingface.co/datasets/mehuldamani/big-math-digits
- Modelo base Llama-3.2-3B-Instruct: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
