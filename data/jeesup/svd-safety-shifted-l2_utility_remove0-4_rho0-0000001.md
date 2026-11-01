# Jeesup/svd-safety-shifted-l2_utility_remove0.4_rho0.0000001

## Resumen

Este repositorio contiene un checkpoint de investigación derivado de meta-llama/Llama-2-7b-chat-hf, publicado por el usuario Jeesup bajo el paraguas de un experimento de compresión de modelos y evaluación de seguridad. No se trata de un modelo nuevo entrenado desde cero, sino de una variante de Llama 2 Chat de 7B en la que se han aplicado técnicas de descomposición en valores singulares (SVD) para eliminar nominalmente un 40% de los parámetros de proyección, con el objetivo declarado de estudiar cómo afecta esa compresión a las métricas de utilidad y a las de identidad/seguridad.

El checkpoint forma parte de un piloto denominado "safety-shifted SVD", en el que se combinan momentos de WikiText con momentos de pares prompt-dañino/respuesta-segura para construir una métrica mixta. El autor indica explícitamente que se trata de un piloto unilateral, no de un SVD completo con información de Fisher, y que los pesos se han plegado de vuelta a matrices densas de Hugging Face para facilitar la evaluación, por lo que el upload no proporciona inferencia factorizada ni demuestra una aceleración real.

Es relevante ahora porque documenta un intento de cuantificar el compromiso entre compresión agresiva y degradación de salvaguardas en un modelo ampliamente desplegado como Llama 2 Chat. Los resultados deben interpretarse como mediciones piloto que no establecen ninguna garantía de seguridad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), pesos plegados a matrices densas tras compresión SVD |
| Parámetros totales | 6.738.415.616 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Llama 2 Chat) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | llama2 |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Fracción de parámetros de factor realizados | 0,615424 |
| Eliminación nominal de parámetros de proyección | 40% |
| Tamaño del repo | 13,5 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 Chat de 7B: un transformer decoder-only con atención causal y normalización RMSNorm, del que se han derivado los pesos mediante un procedimiento de compresión basado en SVD. El autor aplica una proyección de bajo rango y posteriormente pliega los factores resultantes en matrices densas para su evaluación con Hugging Face. La eliminación nominal de parámetros de proyección es del 40%, mientras que la fracción realizada de parámetros de factor sobre el modelo completo es de 0,615424. No hay fine-tuning de recuperación posterior a la compresión.

El entrenamiento o calibración del procedimiento utiliza una métrica mixta: momentos de entrada de WikiText combinados con 0,1 veces los momentos de pares prompt-dañino/respuesta-segura. Ambas familias emplean los mismos textos de respuesta de referencia, incluidos los del profesor Llama 2, renderizados con sus propias plantillas de chat y perfilados con sus propios pesos densos. El objetivo pondera por igual la entropía cruzada de respuestas seguras ante prompts dañinos y la de respuestas útiles ante prompts benignos. El gradiente se calcula con 128 ejemplos dañinos y 40 benignos, y la validación de entropía cruzada usa 32 y 12 ejemplos separados respectivamente. El autor advierte que el corpus de la métrica mixta es más amplio, por lo que estos ejemplos son retenidos del gradiente, no completamente no vistos para la calibración. Los hiperparámetros declarados incluyen un desplazamiento relativo rho de 1e-07, un lambda global de 2,118224627486761e-06 y un ridge de 1e-05.

## Capacidades

- Generación de texto conversacional heredada de Llama 2 Chat de 7B, sujeta a la degradación introducida por la compresión SVD.
- Razonamiento y respuesta a instrucciones en formato chat, con la plantilla original de Llama 2.
- Evaluación de seguridad: el checkpoint incluye artefactos para medir WikiText-2 PPL, generaciones en AdvBench con juicios HarmBench, XSTest y los primeros 500 prompts de OR-Bench juzgados con WildGuard.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio, modo thinking ni multilingüismo específico en la información proporcionada.
- El autor no garantiza ninguna capacidad de seguridad; las mediciones son piloto y deben inspeccionarse junto con la coherencia y las fracciones puntuadas, no solo con la tasa de éxito de ataque (ASR).

## Casos de uso

- Investigación sobre compresión de modelos: sirve como punto de comparación para estudiar cómo la eliminación de un 40% de parámetros de proyección afecta a la perplejidad en WikiText-2 y a la calidad de generación en un Llama 2 Chat de 7B.
- Auditoría de seguridad de modelos comprimidos: los ficheros de evaluación permiten reproducir las mediciones de AdvBench/HarmBench, XSTest y OR-Bench con WildGuard para analizar si la compresión degrada las salvaguardas.
- Estudio de métricas mixtas de calibración: el checkpoint documenta una receta concreta (momentos de WikiText más 0,1 veces momentos dañino/seguro) que puede replicarse o contrastarse en otros experimentos de SVD.
- Análisis de compromiso utilidad-seguridad: útil para investigadores que necesiten un caso concreto de desplazamiento de seguridad ("safety shift") medido con un rho de 1e-07 y un lambda global de 2,118224627486761e-06.
- Reproducibilidad de experimentos: el repositorio incluye ajustes exactos, pérdidas de validación y código fuente bajo `experiment/`, además de diagnósticos por matriz en `compression.json`, lo que facilita la replicación.
- Docencia y formación: como ejemplo didáctico de pipeline de compresión SVD con plegado de pesos y evaluación de seguridad en un modelo abierto de 7B.
- No se recomienda su uso en producción como asistente conversacional, dado que es un checkpoint de investigación sin fine-tuning de recuperación y sin garantías de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. El autor menciona que los ficheros de evaluación contienen WikiText-2 PPL, generaciones en AdvBench con juicios HarmBench, XSTest y los primeros 500 prompts de OR-Bench juzgados con WildGuard, pero no se proporcionan los valores concretos en la información accesible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 16-24 GB.
- En cuantización de 8 bits: alrededor de 7 GB de pesos; en 4 bits: alrededor de 3,5-4 GB, aunque no se documentan cuantizaciones oficiales para este checkpoint.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para fp16; RTX 3090/4080 para cuantizaciones de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090, 3090, 4080 y potencialmente en GPUs de 12-16 GB con cuantización de 8 o 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama, siempre que se conviertan los pesos safetensors al formato correspondiente; el autor no documenta soporte específico.
- Latencia y throughput: no disponibles. El autor advierte explícitamente que el upload no proporciona inferencia factorizada ni establece una aceleración, por lo que no debe esperarse una mejora de rendimiento derivada de la compresión.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Jeesup/svd-safety-shifted-l2_utility_remove0.4_rho0.0000001 | 6.738.415.616 | no disponible | llama2 | Hugging Face, 10 descargas | Checkpoint de investigación con SVD y evaluación de seguridad |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 | 4.096 tokens (según especificación de Llama 2) | llama2 | Hugging Face, ampliamente disponible | Modelo base sin compresión |
| Variantes de compresión de Llama 2 de la literatura (p. ej., SVD-LLM, SliceGPT) | variable | variable | según implementación | repositorios de investigación | No disponibles en la información proporcionada |

## Limitaciones y advertencias

- Checkpoint de investigación: no es un modelo listo para producción y no ha pasado por fine-tuning de recuperación tras la compresión.
- El autor declara explícitamente que las mediciones piloto no establecen ninguna garantía de seguridad.
- El procedimiento es un piloto unilateral, no un SVD completo con información de Fisher, lo que limita la generalidad de las conclusiones.
- Los ejemplos de validación están retenidos del gradiente pero no son completamente no vistos para la calibración, ya que el corpus de la métrica mixta es más amplio.
- Riesgo de alucinación y degradación de coherencia: debe inspeccionarse la coherencia y las fracciones puntuadas junto con el ASR, no solo este último.
- Los pesos están plegados a matrices densas, por lo que no se obtiene ninguna ventaja de velocidad o memoria respecto al modelo base.
- Licencia llama2: el uso comercial está sujeto a los términos de la licencia de Llama 2, que incluyen restricciones y obligaciones de atribución.
- No se documentan idiomas soportados ni sesgos específicos más allá de los heredados de Llama 2 Chat.
- Solo 10 descargas y 0 likes en el momento de la consulta, lo que sugiere una validación comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-shifted-l2_utility_remove0.4_rho0.0000001
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Paper de Llama 2: https://arxiv.org/abs/2307.09288
- AdvBench: https://github.com/llm-attacks/llm-attacks
- HarmBench: https://github.com/centerforaisafety/HarmBench
- XSTest: https://github.com/paul-rottger/xstest
- OR-Bench: https://huggingface.co/datasets/bench-llm/or-bench
- WildGuard: https://huggingface.co/allenai/wildguard
- WikiText-2: https://huggingface.co/datasets/wikitext
