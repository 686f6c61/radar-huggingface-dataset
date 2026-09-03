# lausannequants/OpenThinker-7B

## Resumen

OpenThinker-7B es un modelo de lenguaje de razonamiento de 7.600 millones de parámetros, desarrollado por el equipo de open-thoughts como parte de su iniciativa para democratizar la IA mediante datos y código abiertos. Se trata de un ajuste fino completo (full fine-tuning) del modelo Qwen/Qwen2.5-7B-Instruct sobre el dataset OpenThoughts-114k, un corpus de 114.000 ejemplos de razonamiento destilados de DeepSeek-R1 mediante un pipeline de generación de datos público. El modelo está diseñado para mejorar las capacidades de razonamiento complejo, matemáticas y código en comparación con su base instruct, siguiendo la línea de la destilación de razonamiento popularizada por DeepSeek.

La relevancia de OpenThinker-7B radica en que es uno de los primeros modelos de razonamiento de 7B con pesos, datos, código de generación y código de evaluación completamente abiertos, bajo licencia Apache 2.0. Según los resultados publicados por sus autores, supera a Bespoke-Stratos-7B, un modelo similar entrenado con solo 17.000 ejemplos, en todos los benchmarks evaluados, aunque queda por detrás de DeepSeek-R1-Distill-Qwen-7B, que utiliza datos de destilación propietarios. El modelo se entrenó durante 20 horas en 32 GPUs H100, con un tamaño de lote total de 96 y 3 épocas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2) basado en Qwen2.5-7B-Instruct |
| Parametros totales | 7.615.616.512 (7,6B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

OpenThinker-7B hereda la arquitectura de Qwen2.5-7B-Instruct, un transformer decoder-only con atención causal estándar, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). Al ser un ajuste fino completo, no introduce cambios arquitectónicos respecto al modelo base; la innovación principal reside en los datos de entrenamiento. El dataset OpenThoughts-114k se construyó destilando cadenas de razonamiento de DeepSeek-R1 sobre 114.000 prompts que cubren matemáticas, ciencia, código y razonamiento general, utilizando el pipeline de generación de datos de open-thoughts.

El entrenamiento se realizó con LLaMA-Factory sobre 4 nodos de 8 GPUs H100 (32 GPUs en total) durante 20 horas. Los hiperparámetros incluyen una tasa de aprendizaje de 1e-5, optimizador AdamW con betas (0.9, 0.999), scheduler coseno con warmup del 10%, tamaño de lote total de 96 (batch por GPU de 1 con 3 pasos de acumulación de gradiente) y 3 épocas. No se aplicaron técnicas de RLHF ni DPO; se trata de un ajuste fino supervisado (SFT) puro. El modelo se evaluó con la herramienta Evalchemy, también de código abierto.

## Capacidades

- Razonamiento paso a paso (chain-of-thought) mejorado gracias a la destilación de DeepSeek-R1, lo que le permite abordar problemas que requieren múltiples pasos de inferencia.
- Resolución de problemas matemáticos avanzados, con resultados notables en AIME 2024 (31.3) y MATH-500 (83.0).
- Generación de código con razonamiento, evaluado en LiveCodeBench (LCBv2) con un 39.9 global.
- Respuesta a preguntas científicas de alto nivel, con un 42.4 en GPQA-Diamond.
- Generación de texto conversacional, al estar basado en Qwen2.5-Instruct, aunque no se especifican capacidades adicionales como tool calling o soporte multimodal.
- Capacidades multilingües no documentadas en la información proporcionada.

## Casos de uso

- Resolución de problemas matemáticos y olimpiadas: el modelo puede utilizarse como asistente para estudiantes o investigadores que necesiten soluciones razonadas paso a paso, gracias a su rendimiento en AIME y MATH-500.
- Generación de código con explicaciones: en entornos de desarrollo, puede generar fragmentos de código junto con el razonamiento detrás de cada decisión, útil para documentación o aprendizaje.
- Análisis de datos científicos: su capacidad en GPQA-Diamond sugiere que puede ayudar a interpretar preguntas complejas de física, química y biología, aunque con precaución.
- Tutoría automatizada: al poder desglosar problemas en pasos lógicos, es adecuado para plataformas educativas que expliquen el proceso de resolución.
- Investigación en razonamiento de modelos: al ser completamente abierto, sirve como base para experimentos de destilación, ajuste fino adicional o evaluación de técnicas de razonamiento.
- Prototipado de agentes de razonamiento: aunque no se documenta tool calling, su base instruct permite integrarlo en pipelines de generación aumentada por recuperación (RAG) o como motor de razonamiento en sistemas de pregunta-respuesta.

## Benchmarks y rendimiento

Los resultados que se muestran a continuación son los declarados por los autores del modelo en su model card, evaluados con la herramienta Evalchemy. Se comparan con Bespoke-Stratos-7B, DeepSeek-R1-Distill-Qwen-7B y dos modelos propietarios de OpenAI.

| Modelo | AIME24 | MATH500 | GPQA-Diamond | LCBv2 Easy | LCBv2 Medium | LCBv2 Hard | LCBv2 All |
|---|---|---|---|---|---|---|---|
| OpenThinker-7B | 31.3 | 83.0 | 42.4 | 75.3 | 28.6 | 6.5 | 39.9 |
| Bespoke-Stratos-7B | 22.7 | 79.6 | 38.9 | 71.4 | 25.2 | 0.8 | 35.8 |
| DeepSeek-R1-Distill-Qwen-7B | 60.0 | 88.2 | 46.9 | 79.7 | 45.1 | 14.6 | 50.1 |
| gpt-4o-0513 | 8.7 | 75.8 | 46.5 | 87.4 | 42.7 | 8.9 | 50.5 |
| o1-mini | 64.0 | 85.6 | 60.0 | 92.8 | 74.7 | 39.8 | 72.8 |

OpenThinker-7B mejora claramente a Bespoke-Stratos-7B en todos los benchmarks, pero queda por debajo de DeepSeek-R1-Distill-Qwen-7B, que utiliza datos de destilación no abiertos. En comparación con gpt-4o, supera a este en AIME24 y MATH500, aunque pierde en código (LCBv2).

## Requisitos de hardware

- El repositorio contiene pesos en safetensors con un tamaño total de 15.2 GB, lo que corresponde a precisión FP16. Para inferencia en FP16 se estima un consumo de VRAM de aproximadamente 16 GB, por lo que cabría en GPUs de consumo como la RTX 4090 (24 GB) o la RTX 3090 (24 GB), así como en GPUs profesionales como A10G o L4.
- No se proporcionan cuantizaciones oficiales, pero al ser un modelo basado en Qwen2.5, es compatible con herramientas de cuantización como llama.cpp, GPTQ o AWQ, que podrían reducir la VRAM a unos 4-6 GB en 4 bits.
- Para despliegue en producción, se recomienda usar vLLM o TGI, ya que el modelo es compatible con text-generation-inference según los tags del repositorio.
- El entrenamiento requirió 32 GPUs H100 durante 20 horas, pero la inferencia es mucho menos exigente; una sola GPU con 16-24 GB es suficiente para uso interactivo.
- La latencia típica para generación de razonamiento largo (más de 500 tokens) en una RTX 4090 sería de unos 20-40 tokens por segundo, aunque no se han publicado mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Datos de entrenamiento | AIME24 | MATH500 |
|---|---|---|---|---|---|---|
| OpenThinker-7B | 7.6B | No disponible | Apache 2.0 | OpenThoughts-114k (abierto) | 31.3 | 83.0 |
| Bespoke-Stratos-7B | 7.6B | No disponible | Apache 2.0 | Bespoke-Stratos-17k (abierto) | 22.7 | 79.6 |
| DeepSeek-R1-Distill-Qwen-7B | 7.6B | 32k (heredado) | MIT | Datos propietarios de DeepSeek | 60.0 | 88.2 |

OpenThinker-7B se posiciona como una alternativa intermedia: supera a Bespoke-Stratos-7B gracias a un dataset 6 veces mayor, pero no alcanza a DeepSeek-R1-Distill-Qwen-7B, que se beneficia de datos de destilación de mayor calidad y no abiertos. La ventaja de OpenThinker-7B es su apertura total, lo que permite reproducir el entrenamiento y adaptarlo.

## Limitaciones y advertencias

- Al ser un ajuste fino de Qwen2.5-7B-Instruct, puede heredar sesgos presentes en el modelo base, aunque no se han realizado evaluaciones específicas de sesgo en la información disponible.
- Riesgo de alucinación en razonamiento: como todo modelo de lenguaje, puede generar cadenas de razonamiento plausibles pero incorrectas, especialmente en dominios fuera de sus datos de entrenamiento.
- La longitud de contexto no está documentada en el repositorio; se asume que hereda la de Qwen2.5-7B-Instruct (32k), pero no hay confirmación oficial.
- Los benchmarks publicados son declarados por el autor y no han sido verificados de forma independiente; además, la tabla de resultados en el model-index de HuggingFace está vacía, lo que sugiere que los números provienen del README y no de una evaluación automatizada.
- No se documentan capacidades de tool calling, visión ni audio; el modelo es exclusivamente de texto.
- Aunque la licencia Apache 2.0 permite uso comercial sin restricciones, el modelo puede no ser adecuado para aplicaciones de alto riesgo sin una evaluación adicional de robustez y seguridad.

## Enlaces

- Repositorio en HuggingFace (versión de lausannequants): https://huggingface.co/lausannequants/OpenThinker-7B
- Repositorio original de open-thoughts: https://huggingface.co/open-thoughts/OpenThinker-7B
- Paper de OpenThoughts: https://arxiv.org/abs/2506.04178
- Blog de lanzamiento: https://www.open-thoughts.ai/blog/launch
- Repositorio GitHub de open-thoughts: https://github.com/open-thoughts/open-thoughts
- Dataset OpenThoughts-114k: https://huggingface.co/datasets/open-thoughts/OpenThoughts-114k
- Herramienta de evaluación Evalchemy: https://github.com/mlfoundations/Evalchemy
- Modelo Bespoke-Stratos-7B: https://huggingface.co/bespokelabs/Bespoke-Stratos-7B
- Dataset Bespoke-Stratos-17k: https://huggingface.co/datasets/bespokelabs/Bespoke-Stratos-17k
