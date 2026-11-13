# 96kevinli29/DeepSeek-Math-7B-SFT-hybrid-ep3

## Resumen

DeepSeek-Math-7B-SFT-hybrid-ep3 es un checkpoint de investigación publicado por 96kevinli29 (Hongyang Li y colaboradores, con el mantenimiento de la comunidad Sea-Fill) que parte de `deepseek-ai/deepseek-math-7b-base` y aplica tres épocas de ajuste supervisado (SFT) de parámetros completos sobre 90.000 soluciones matemáticas formateadas con un bloque `<think> … </think>` seguido de una respuesta final en `\boxed{}`. El objetivo es dotar a un modelo base especializado en matemáticas de un modo de razonamiento explícito tipo cadena de pensamiento, sin recurrir a RL, y ofrecer un contrapunto de otra familia (DeepSeek) a los checkpoints de SFT matemático basados en Qwen3 publicados por el mismo autor.

El modelo conserva la arquitectura transformer causal de la familia DeepSeek Math de 7B, con 6.910.365.696 parámetros reales según los pesos en safetensors, y hereda la limitación de contexto de 4.096 tokens del modelo base, que condiciona tanto el entrenamiento como la inferencia. El repositorio ocupa 13,8 GB y se distribuye en formato safetensors compatible con `transformers` y con text-generation-inference.

Su relevancia es acotada pero clara: es un artefacto de investigación reproducible (código de entrenamiento en `base-model-sft-verl`, FSDP sobre el clúster MeluXina de LuxProvide) que permite estudiar cómo se comporta un modelo matemático de 7B cuando se le fuerza un formato de razonamiento explícito mediante SFT puro, y sirve como línea base para comparar con pipelines que sí incluyen RL. No se han publicado evaluaciones en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (familia DeepSeek Math), decoder-only |
| Parametros totales | 6.910.365.696 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors; no se documentan GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | inglés (en) |
| Licencia | other, license_name: deepseek (DeepSeek Model License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only causal de aproximadamente 6,9 mil millones de parámetros, inicializado desde `deepseek-ai/deepseek-math-7b-base`. El ajuste es un SFT de parámetros completos (full-parameter) durante 3 épocas, ejecutado con la librería verl sobre FSDP en el clúster MeluXina (LuxProvide). No hay etapa de RL, DPO ni preferencias: es SFT puro sobre datos matemáticos.

El conjunto de entrenamiento es híbrido y suma 90.200 ejemplos: 30.371 trazas largas de razonamiento procedentes de `open-r1/OpenR1-Math-220k`, filtradas para que quepan en 3.900 tokens (por debajo del límite de 4.096 del modelo base), y 59.829 soluciones de AMC/AIME de `AI-MO/NuminaMath-CoT` reenvueltas en el mismo formato `<think>`. El autor advierte explícitamente que dos tercios de las soluciones de entrenamiento son soluciones convencionales cortas envueltas como razonamiento, no trazas largas genuinas, lo que diluye el efecto del formato de pensamiento. La plantilla de chat usada en entrenamiento es `User: … / Assistant: <think> … </think> answer`, y se distribuye en el repositorio.

## Capacidades

- Generación de texto y razonamiento matemático con cadena de pensamiento explícita en bloques `<think> … </think>`.
- Resolución de problemas de competición (AMC/AIME) y aritmética simbólica, con respuesta final encapsulada en `\boxed{}`.
- Generación de soluciones paso a paso en formato conversacional de un solo turno (plantilla User/Assistant).
- Soporte de decodificación con muestreo (temperatura 0,7 en el ejemplo de la model card) y generación de hasta 3.000 tokens nuevos.
- Capacidades multilingües: limitadas al inglés según la metadata del modelo.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado; el contexto de 4.096 tokens limita cadenas largas).
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Investigación sobre SFT matemático: el checkpoint sirve como línea base controlada para medir cuánto aporta el formato `<think>` sin RL, comparándolo con los checkpoints Qwen3-SFT del mismo autor y con el modelo base sin ajustar.
- Generación de soluciones paso a paso para problemas de competición: se le puede pedir un problema tipo AMC/AIME y el modelo produce una traza razonada seguida de la respuesta en `\boxed{}`, útil para construir datasets sintéticos de razonamiento.
- Destilación de trazas de razonamiento: sus salidas en formato `<think>` pueden filtrarse y reutilizarse para entrenar modelos más pequeños, dado que el formato es consistente con el usado en OpenR1.
- Evaluación de robustez de formatos de razonamiento: al ser SFT puro sobre datos híbridos, permite estudiar cómo afecta la proporción de trazas largas frente a soluciones cortas al comportamiento del modelo.
- Reproducción de pipelines de entrenamiento: junto con `base-model-sft-verl` y verl/FSDP, sirve para validar recetas de SFT de parámetros completos en hardware de clúster.
- Prototipado de asistentes matemáticos de un solo turno: con prompts que quepan en 4.096 tokens, puede integrarse en demos de resolución de ejercicios con respuesta final verificable mediante el contenido de `\boxed{}`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que es un checkpoint de investigación sin evaluación reportada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 14 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 16-20 GB según longitud de secuencia.
- VRAM estimada en cuantización de 8 bits: alrededor de 7-8 GB de pesos; en 4 bits, alrededor de 4-5 GB (no hay cuantizaciones oficiales publicadas, habría que generarlas).
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento o inferencia en bf16 con lotes; RTX 4090 (24 GB) suficiente para inferencia en bf16 de una sola petición.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) en bf16, y en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: `transformers` (safetensors nativo), text-generation-inference (el repo está marcado como endpoints_compatible), y potencialmente vLLM o llama.cpp si se generan pesos GGUF, aunque no se documentan.
- Latencia y throughput: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-Math-7B-SFT-hybrid-ep3 | 6,91 B | 4.096 | SFT 3 épocas sobre 90K soluciones híbridas | DeepSeek Model License | Hugging Face |
| deepseek-math-7b-base | ~7 B | 4.096 | Preentrenamiento + ajuste matemático del autor original | DeepSeek Model License | Hugging Face |
| Qwen3-4B-SFT-Math (mismo autor) | ~4 B | no disponible en la información | SFT matemático | no disponible en la información | Hugging Face |
| Qwen3-8B-SFT (SeaFill2025) | ~8 B | no disponible en la información | SFT matemático | no disponible en la información | Hugging Face |

La comparación se limita a la familia y a los checkpoints citados en la propia model card; no se dispone de datos de rendimiento comparativo porque ninguno de ellos publica benchmarks en la información proporcionada.

## Limitaciones y advertencias

- Contexto de solo 4.096 tokens: prompt y respuesta deben caber conjuntamente, lo que limita problemas largos y conversaciones multi-turno.
- Dos tercios de los datos de entrenamiento son soluciones convencionales cortas reenvueltas como razonamiento, no trazas largas reales; el formato `<think>` puede no reflejar razonamiento genuinamente extendido.
- SFT puro sin etapa de RL: no hay optimización por recompensa ni preferencias, por lo que la calidad de las trazas depende enteramente de los datos de imitación.
- Modelo solo en inglés; no se documenta soporte multilingüe.
- Checkpoint de investigación sin evaluación publicada: no hay evidencia de rendimiento en MMLU, GSM8K, MATH ni similares.
- Riesgo de alucinación en pasos intermedios y en la respuesta final; el formato `\boxed{}` no garantiza corrección.
- Licencia DeepSeek Model License (no estándar): hay que revisar sus términos antes de cualquier uso comercial.
- Sin cuantizaciones oficiales ni pesos GGUF publicados; el despliegue en entornos de bajos recursos requiere conversión manual.
- Sesgos: no documentados por el autor; al entrenarse solo con datos matemáticos en inglés, el comportamiento fuera de dominio es incierto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/96kevinli29/DeepSeek-Math-7B-SFT-hybrid-ep3
- Modelo base: https://huggingface.co/deepseek-ai/deepseek-math-7b-base
- Licencia del modelo base: https://github.com/deepseek-ai/DeepSeek-Math/blob/main/LICENSE-MODEL
- Código de entrenamiento del autor: https://github.com/96kevinli29/base-model-sft-verl
- Librería verl: https://github.com/volcengine/verl
- Dataset OpenR1-Math-220k: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Dataset NuminaMath-CoT: https://huggingface.co/datasets/AI-MO/NuminaMath-CoT
- Checkpoint Qwen3-4B-SFT-Math del mismo autor: https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math
- Checkpoint Qwen3-8B-SFT de SeaFill: https://huggingface.co/SeaFill2025/Qwen3-8B-SFT
- Comunidad Sea-Fill: https://huggingface.co/SeaFill2025
