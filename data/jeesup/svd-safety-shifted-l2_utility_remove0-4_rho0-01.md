# Jeesup/svd-safety-shifted-l2_utility_remove0.4_rho0.01

## Resumen

Este repositorio contiene un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf` mediante una técnica de compresión basada en descomposición en valores singulares (SVD) con un sesgo explícito hacia la seguridad. El autor, Jeesup, lo publica como piloto de un experimento más amplio sobre compresión de modelos que preserva (o desplaza) determinadas métricas de comportamiento tras eliminar parámetros de proyección. No es un modelo pensado para uso en producción, sino un artefacto de evaluación para estudiar cómo afecta la compresión SVD a la utilidad y a la seguridad de un LLM.

El checkpoint elimina nominalmente un 40% de los parámetros de proyección, lo que se traduce en una fracción de parámetros factoriales de 0,615424 sobre el modelo completo. Se aplica un desplazamiento relativo de métrica (rho = 0,01) con un objetivo que combina la perplejidad sobre WikiText-2 con un término de seguridad derivado de respuestas seguras a prompts dañinos. No hay fine-tuning de recuperación posterior a la compresión.

Su relevancia es metodológica: permite a investigadores inspeccionar si la compresión SVD con sesgo de seguridad degrada la coherencia del modelo o altera su tasa de éxito frente a ataques de jailbreak. El modelo tiene 6.738.415.616 parámetros y un tamaño de repositorio de 13,5 GB en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), pesos densos fusionados tras compresión SVD |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama-2-7b-chat-hf, no declarada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | llama2 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Llama-2-7b-chat-hf, un transformer decoder-only con atención causal estándar. Sobre esa arquitectura se aplica una compresión por SVD de las matrices de proyección: se elimina nominalmente un 40% de los parámetros de proyección, dando una fracción de parámetros factoriales de 0,615424 sobre el total del modelo. Los pesos publicados son matrices densas de Hugging Face con los factores fusionados, pensadas para facilitar la evaluación; el repositorio no ofrece inferencia factorizada ni demuestra una aceleración real.

El entrenamiento no incluye fine-tuning de recuperación. El objetivo de compresión combina una métrica de utilidad (momentos de entrada de WikiText-2) con una métrica de identidad/seguridad que mezcla momentos de prompts dañinos con respuestas seguras, ponderada a 0,1 veces la parte de utilidad. Se usa un desplazamiento relativo rho = 0,01, un lambda global de 0,21182246274867614 y una regularización ridge de 1e-05. El gradiente emplea 128 ejemplos dañinos y 40 benignos; la validación de entropía cruzada usa 32 y 12 ejemplos separados. El autor advierte que se trata de un piloto unilateral, no de un SVD completo con conciencia de Fisher, y que el corpus de métrica mixta es más amplio, por lo que los ejemplos de validación no son completamente no vistos.

## Capacidades

- Generación de texto conversacional heredada de Llama-2-7b-chat-hf, sujeta a la degradación introducida por la compresión SVD.
- Razonamiento y respuesta a instrucciones en formato chat de Llama 2, sin garantías de calidad tras la eliminación del 40% de parámetros de proyección.
- Evaluación de seguridad: el checkpoint está diseñado para medir tasa de éxito de ataques (ASR) frente a prompts de AdvBench, con juicios de HarmBench.
- Evaluación de sobre-rechazo mediante XSTest y los primeros 500 prompts de OR-Bench juzgados con WildGuard.
- Medición de perplejidad sobre WikiText-2 para controlar la coherencia.
- No se declaran capacidades de tool calling, agentes, visión, audio ni modo thinking; no disponible.
- Cobertura multilingüe no declarada; no disponible.

## Casos de uso

- Investigación sobre compresión SVD: usar el checkpoint para comparar la perplejidad en WikiText-2 frente al modelo base y a otras variantes de compresión del mismo autor, aislando el efecto del desplazamiento de métrica rho.
- Estudio de alineación y seguridad: ejecutar AdvBench y HarmBench sobre las generaciones del modelo para medir cómo cambia la tasa de éxito de ataques cuando se comprime con un objetivo sesgado hacia respuestas seguras.
- Análisis de sobre-rechazo: evaluar XSTest y OR-Bench con WildGuard para detectar si la compresión orientada a seguridad incrementa los rechazos ante prompts benignos.
- Reproducibilidad de experimentos: el repositorio incluye `experiment/` con ajustes exactos, pérdidas de validación y código fuente, y `compression.json` con diagnósticos por matriz, lo que permite replicar el pipeline de compresión.
- Docencia y formación: servir como ejemplo práctico de cómo se mide el compromiso entre utilidad y seguridad en modelos comprimidos, usando los artefactos de evaluación incluidos.
- Auditoría de artefactos de compresión: inspeccionar la fracción de parámetros factoriales (0,615424) y los diagnósticos por matriz para estudiar qué capas concentran la pérdida de capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que los archivos de evaluación contienen perplejidad de WikiText-2, generaciones de AdvBench con juicios de HarmBench, y XSTest más los primeros 500 prompts de OR-Bench juzgados con WildGuard, pero no se proporcionan los valores numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 16-18 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 7 GB de pesos; en 4 bits, alrededor de 3,5-4 GB, aunque el autor no declara cuantizaciones soportadas ni validadas.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para fp16. En consumer GPU de 16 GB (RTX 4080, 4070 Ti Super) puede caber en fp16 con cuidado, y en 8-12 GB solo con cuantización.
- Opciones de despliegue: al ser pesos densos en safetensors compatibles con el formato de Hugging Face, pueden cargarse con transformers, vLLM o TGI; llama.cpp y Ollama requerirían conversión a GGUF, no verificada por el autor.
- Latencia y throughput: no disponibles. El autor advierte explícitamente que la representación de bajo rango subyacente no implica aceleración en esta subida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeesup/svd-safety-shifted-l2_utility_remove0.4_rho0.01 | 6.738.415.616 | no disponible | Compresión SVD con sesgo de seguridad sobre Llama-2-7b-chat | llama2 | Hugging Face, 16 descargas |
| meta-llama/Llama-2-7b-chat-hf | ~6.740 millones | 4.096 tokens (estándar Llama 2) | Modelo base conversacional sin comprimir | llama2 | Hugging Face, ampliamente disponible |
| Otras variantes del mismo autor (Jeesup) | no disponible | no disponible | Distintos valores de rho y fracción de eliminación | llama2 | Hugging Face |

La comparación directa con alternativas de compresión de terceros no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo listo para producción; el autor lo describe como piloto unilateral y no como SVD completo con conciencia de Fisher.
- No hay fine-tuning de recuperación tras la compresión, por lo que la calidad conversacional puede estar degradada de forma no caracterizada.
- Los pesos están fusionados como matrices densas: no se ofrece inferencia factorizada ni se demuestra ninguna ganancia de velocidad o memoria en esta subida.
- Las mediciones de seguridad del autor no establecen una garantía de seguridad; deben interpretarse junto con la coherencia y las fracciones puntuadas, no solo con la tasa de éxito de ataques.
- Los ejemplos de validación no son completamente no vistos, ya que el corpus de métrica mixta es más amplio que el conjunto de validación.
- Riesgo de alucinación y sesgos: no documentados específicamente para este checkpoint; hereda los del modelo base Llama-2-7b-chat, no disponibles en la información proporcionada.
- Idiomas soportados no declarados; no se garantiza cobertura multilingüe más allá de la del modelo base.
- Licencia llama2: el uso comercial está sujeto a los términos de la licencia de Llama 2 de Meta, que imponen restricciones y obligaciones de atribución; revisar antes de cualquier despliegue.
- Solo 16 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-shifted-l2_utility_remove0.4_rho0.01
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
