# rghosh8/gsm8k-grpo-deepseek-r1-distill-qwen-1.5b-seed-1234-G-16_merged

## Resumen

`gsm8k-grpo-deepseek-r1-distill-qwen-1.5b-seed-1234-G-16_merged` es un modelo de lenguaje de 1.777 millones de parametros publicado por el usuario rghosh8 en Hugging Face. Se trata de un ajuste fino (fine-tuning) del modelo `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` de DeepSeek, entrenado especificamente sobre el conjunto de datos GSM8K (problemas matematicos de nivel escolar) mediante GRPO (Group Relative Policy Optimization), una variante de aprendizaje por refuerzo. El sufijo del nombre indica la semilla utilizada (1234) y el numero de generaciones por prompt (G=16), parametros propios del algoritmo GRPO.

La relevancia de este modelo es experimental: forma parte de una coleccion de variantes (GSM8k-GRPO) que exploran el efecto de GRPO sobre un modelo destilado pequeno y orientado a razonamiento matematico. El repositorio contiene los pesos fusionados (merged), es decir, el adaptador LoRA ya integrado en el modelo base, lo que permite cargarlo directamente con `transformers` sin necesidad de aplicar el adaptador por separado.

Al tratarse de un modelo derivado de Qwen2, hereda la arquitectura transformer decoder-only de dicha familia, con aproximadamente 1.500 millones de parametros en el modelo base y 1.777 millones en esta version fusionada (la diferencia puede deberse a la inclusion de los pesos del adaptador o a redondeos en el recuento de safetensors). No se dispone de informacion publicada sobre licencia, idiomas soportados ni resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (repo de 3,6 GB) |

## Arquitectura y entrenamiento

El modelo base `DeepSeek-R1-Distill-Qwen-1.5B` es un destilado de DeepSeek-R1 sobre la arquitectura Qwen2 de 1.500 millones de parametros, orientado a tareas de razonamiento y matematicas. Sobre el se aplico un ajuste fino con GRPO (Group Relative Policy Optimization), un algoritmo de aprendizaje por refuerzo que genera multiples respuestas por prompt (en este caso G=16), las puntua con una funcion de recompensa y actualiza la politica para favorecer las respuestas de mayor recompensa. El conjunto de datos utilizado es GSM8K, compuesto por problemas matematicos de aritmetica de nivel escolar con solucion paso a paso.

El resultado del entrenamiento se ha fusionado con el modelo base (de ahi el sufijo `_merged`), de modo que los pesos del adaptador LoRA estan integrados en los pesos principales y el modelo puede cargarse directamente como un `AutoModelForCausalLM` estandar. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, hiperparametros de GRPO (tasa de aprendizaje, KL penalty, clipping) ni sobre si se aplicaron etapas adicionales de SFT o DPO. La semilla 1234 y el valor G=16 son los unicos hiperparametros documentados en la model card.

## Capacidades

- Generacion de texto autoregresiva en formato conversacional (pipeline `text-generation`).
- Razonamiento matematico orientado a problemas de aritmetica de nivel escolar, reforzado mediante GRPO sobre GSM8K.
- Razonamiento paso a paso (chain-of-thought), heredado del proceso de destilacion de DeepSeek-R1.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; el modelo base tiene capacidades limitadas por su tamano.
- Capacidades multilingues: no disponibles; el modelo base Qwen2 tiene soporte multilingue, pero no se documenta en esta ficha.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Compatibilidad con text-generation-inference (tag `text-generation-inference`) y `endpoints_compatible`.

## Casos de uso

- Evaluacion de tecnicas de RLHF/GRPO: el modelo sirve como referencia reproducible (semilla 1234, G=16) para estudiar el impacto de GRPO en modelos pequenos destilados, comparando con otras variantes de la misma coleccion.
- Investigacion sobre destilacion de razonamiento: permite analizar como se transfiere la capacidad de chain-of-thought de DeepSeek-R1 a un modelo Qwen2 de 1.500 millones de parametros tras el ajuste con GRPO.
- Generacion de soluciones paso a paso para problemas aritmeticos: util en entornos educativos o de prototipado donde se necesita un modelo ligero que explique el razonamiento, no solo la respuesta final.
- Baseline en experimentos de matematicas: al estar entrenado especificamente en GSM8K, puede emplearse como punto de comparacion frente a modelos no ajustados en tareas de aritmetica basica.
- Despliegue en hardware limitado: con 1.777 millones de parametros y pesos en safetensors de 3,6 GB, es viable en GPUs de consumo para pruebas de inferencia y generacion de respuestas matematicas.
- Fine-tuning posterior: al estar en formato `transformers` estandar, puede servir como punto de partida para nuevos ajustes con LoRA o QLoRA en dominios matematicos relacionados.
- Integracion en pipelines de evaluacion automatica: su compatibilidad con text-generation-inference permite desplegarlo como endpoint para generar soluciones que luego se validan con un corrector automatico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud en GSM8K, MMLU, HumanEval ni comparaciones con el modelo base u otras variantes de la coleccion.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,6 GB solo para pesos, mas overhead de activaciones y cache KV (estimacion orientativa de 5-7 GB en funcion de la longitud de contexto).
- VRAM estimada en cuantizacion 8 bits: alrededor de 2 GB para pesos; en 4 bits, alrededor de 1 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070); A100/H100 no son necesarias por el tamano del modelo.
- Cabe en GPU de consumo: si, en modelos como RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080 y RTX 4090.
- Opciones de despliegue: `transformers` (soporte nativo documentado), text-generation-inference (tag presente), y previsiblemente llama.cpp/Ollama si se generan cuantizaciones GGUF (no publicadas en el repo).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gsm8k-grpo-deepseek-r1-distill-qwen-1.5b-seed-1234-G-16_merged | 1.777 M | No disponible | GRPO sobre GSM8K | No disponible | Hugging Face (0 descargas) |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1.500 M aprox. | No disponible | Destilacion de DeepSeek-R1 | No disponible en esta ficha | Hugging Face (modelo base) |
| rghosh8/gsm8k-deepseek-r1-distill-qwen-1.5B-seed-1234-G-16 | No disponible | No disponible | GRPO sobre GSM8K (adaptador LoRA) | No disponible | Hugging Face |
| Qwen2-1.5B (base de la familia) | 1.500 M aprox. | No disponible en esta ficha | Preentrenamiento general | No disponible en esta ficha | Hugging Face |

La comparativa se limita a variantes del mismo linaje, ya que no se dispone de datos de rendimiento que permitan contrastar con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- Especializacion estrecha: el ajuste con GRPO sobre GSM8K puede degradar capacidades generales del modelo base (olvido catastrofico) fuera del dominio matematico.
- Riesgo de alucinacion: como todo modelo generativo, puede producir pasos de razonamiento plausibles pero incorrectos, especialmente en problemas fuera de la distribucion de GSM8K.
- Sesgos conocidos: no documentados; al heredar el modelo base, puede reproducir sesgos presentes en los datos de preentrenamiento de Qwen2 y DeepSeek-R1.
- Limitaciones de contexto e idioma: no disponibles; la ausencia de documentacion impide garantizar un comportamiento adecuado en castellano u otros idiomas.
- Restricciones de licencia: la licencia no esta disponible en la informacion proporcionada, por lo que no se puede confirmar el uso comercial; debe verificarse en el repositorio antes de cualquier despliegue en produccion.
- Madurez: el repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-06), lo que sugiere un artefacto de investigacion sin validacion externa.
- Ausencia de benchmarks: no hay evidencia publicada de mejora frente al modelo base, por lo que no debe asumirse una ganancia de rendimiento sin evaluacion propia.
- Trazabilidad limitada: no se documentan hiperparametros de entrenamiento ni el proceso de fusion de pesos, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rghosh8/gsm8k-grpo-deepseek-r1-distill-qwen-1.5b-seed-1234-G-16_merged
- Adaptador LoRA: https://huggingface.co/rghosh8/gsm8k-grpo-deepseek-r1-distill-qwen-1.5b-seed-1234-G-16
- Coleccion GSM8k-GRPO: https://huggingface.co/collections/rghosh8/gsm8k-grpo
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Variante relacionada (sin `_merged`): https://huggingface.co/rghosh8/gsm8k-deepseek-r1-distill-qwen-1.5B-seed-1234-G-16
- Discusiones de la variante relacionada: https://huggingface.co/rghosh8/gsm8k-deepseek-r1-distill-qwen-1.5B-seed-1234-G-16/discussions
