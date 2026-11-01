# Jeesup/svd-safety-shifted-l2_mixed_remove0.4_rho0.001

## Resumen

El modelo `Jeesup/svd-safety-shifted-l2_mixed_remove0.4_rho0.001` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf` mediante descomposición en valores singulares (SVD) con un sesgo explícito hacia la seguridad. Lo publica el usuario Jeesup en HuggingFace como parte de un estudio piloto sobre compresión de modelos y su efecto en el comportamiento de seguridad. No es un modelo pensado para producción, sino un artefacto experimental para evaluar cómo la eliminación de componentes de bajo rango afecta a la alineación de un modelo ya ajustado con RLHF.

La intervención consiste en eliminar nominalmente un 40% de los parámetros de proyección, lo que se traduce en una fracción real de parámetros factoriales de 0,615424 sobre el modelo completo. La métrica de entrada es mixta (momentos de WikiText combinados con momentos de prompts dañinos y respuestas seguras), mientras que la métrica de salida es la identidad, con un desplazamiento relativo rho de 0,001. No hay fine-tuning de recuperación posterior a la compresión, de modo que el checkpoint refleja el efecto puro de la poda SVD sobre los pesos de Llama-2-7b-chat.

Su relevancia es metodológica: permite estudiar si la compresión SVD desplaza la frontera de seguridad de un modelo alineado, y si ese desplazamiento puede dirigirse mediante la elección de la métrica. El autor advierte explícitamente que es un piloto unilateral, no un SVD completo con información de Fisher, y que las mediciones no constituyen una garantía de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2) |
| Parametros totales | 6.738.415.616 (~6,74 mil millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada de Llama-2-7b-chat: 4096 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | No disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | No disponible |
| Licencia | Llama 2 Community License (llama2) |
| Formato de pesos | safetensors (matrices densas plegadas para evaluación) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat: un transformer decoder-only con atención causal, normalización RMSNorm y activación SwiGLU, entrenado originalmente por Meta con ajuste supervisado y RLHF. Sobre esos pesos, el autor aplica una descomposición SVD con una métrica de entrada mixta que combina momentos de segundo orden de WikiText con 0,1 veces los momentos de un corpus de prompts dañinos y respuestas seguras. La métrica de salida es la identidad, y el objetivo pondera por igual la entropía cruzada de respuestas seguras ante prompts dañinos y la de respuestas útiles ante prompts benignos.

El gradiente se calcula con 128 ejemplos dañinos y 40 benignos, y la validación de entropía cruzada usa 32 y 12 ejemplos separados respectivamente. El autor señala que, al ser el corpus de métrica mixta más amplio, estos ejemplos están retenidos del gradiente pero no son completamente ajenos a la calibración. Se elimina nominalmente un 40% de los parámetros de proyección, con un desplazamiento relativo rho de 0,001, un lambda global de 0,03375972210921948 y un ridge de 1e-05. No hay fine-tuning de recuperación. Los pesos se publican como matrices densas plegadas, de modo que el repositorio no ofrece inferencia factorizada ni demuestra una ganancia de velocidad.

## Capacidades

- Generación de texto conversacional, heredada de Llama-2-7b-chat.
- Razonamiento de propósito general y respuesta a instrucciones en formato chat.
- Capacidad de seguir el formato de plantilla de Llama 2 (system prompt, turnos de usuario y asistente).
- Evaluación de seguridad: el checkpoint incluye artefactos para medir PPL en WikiText-2, generaciones en AdvBench con juicios de HarmBench, y XSTest más los primeros 500 prompts de OR-Bench juzgados con WildGuard.
- No se documentan capacidades de tool calling, function calling, agentes ni razonamiento multi-paso específicas.
- No se documentan capacidades multimodales (visión, audio) ni modo de pensamiento explícito.
- El soporte multilingüe no está documentado en la model card; se desconoce el alcance real más allá del inglés.

## Casos de uso

- Investigación sobre compresión y alineación: usar el checkpoint para medir cómo la poda SVD con sesgo de seguridad altera la tasa de éxito de ataques (ASR) en AdvBench frente al modelo base sin comprimir.
- Estudio de la frontera seguridad-utilidad: comparar la entropía cruzada en respuestas seguras y benignas con la del Llama-2-7b-chat original para cuantificar el coste de la compresión en utilidad.
- Reproducción de experimentos: el código y la configuración exacta están en `experiment/`, y los diagnósticos por matriz en `compression.json`, lo que permite replicar el pipeline SVD con otras métricas de entrada.
- Evaluación de robustez de salvaguardas: emplear XSTest y OR-Bench con juicios de WildGuard para analizar falsos rechazos y respuestas excesivamente permisivas tras la compresión.
- Análisis de coherencia post-compresión: usar WikiText-2 PPL para detectar degradación del lenguaje antes de interpretar métricas de seguridad, tal como recomienda el autor.
- Baseline en estudios de poda: servir como punto de comparación para métodos de compresión más sofisticados (por ejemplo, SVD con información de Fisher) en la misma familia Llama-2-7b-chat.
- Docencia y experimentación académica: al ser un checkpoint pequeño (13,5 GB en safetensors) y con licencia Llama 2, es viable en entornos de investigación con una sola GPU de 24 GB en precisión reducida.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card menciona que los archivos de evaluación contienen PPL de WikiText-2, generaciones de AdvBench con juicios de HarmBench, y XSTest más los primeros 500 prompts de OR-Bench juzgados por WildGuard, pero no incluye las cifras en el texto proporcionado. El autor indica que deben inspeccionarse la coherencia y las fracciones puntuadas junto con la ASR, y que estas mediciones piloto no establecen una garantía de seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 16-18 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 7-8 GB de pesos; en 4 bits, unos 4-5 GB, aunque el repositorio no publica versiones cuantizadas.
- GPU recomendadas: A100 40/80 GB o H100 para evaluación a gran escala con lotes grandes; RTX 4090 (24 GB) o RTX A6000 (48 GB) para inferencia en FP16 con comodidad.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en FP16; en GPUs de 12-16 GB requeriría cuantización, que no está publicada.
- Opciones de despliegue: transformers con safetensors; vLLM, TGI o llama.cpp son viables si se convierten los pesos, pero el repositorio no incluye GGUF ni configuraciones de servido.
- Latencia y throughput: no disponibles; el autor advierte que el upload no proporciona inferencia factorizada ni establece una ganancia de velocidad pese a la reducción de rango subyacente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Jeesup/svd-safety-shifted-l2_mixed_remove0.4_rho0.001 | 6,74 B | No disponible | Llama 2 | HuggingFace (16 descargas) | Checkpoint de investigación con poda SVD y sesgo de seguridad |
| meta-llama/Llama-2-7b-chat-hf | 6,74 B | 4096 tokens | Llama 2 | HuggingFace (ampliamente disponible) | Modelo base sin comprimir, alineado con RLHF |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128k tokens | Llama 3.1 | HuggingFace | Alternativa moderna con contexto mucho mayor y mejor rendimiento general |
| mistralai/Mistral-7B-Instruct-v0.2 | 7,24 B | 32k tokens | Apache 2.0 | HuggingFace | Alternativa de licencia permisiva y contexto extendido |

La comparación directa con el modelo base es la más relevante para el propósito del checkpoint: misma arquitectura y mismos parámetros, pero con una fracción factorial efectiva de 0,615424 y sin fine-tuning de recuperación. Frente a Llama-3.1-8B-Instruct o Mistral-7B-Instruct, el checkpoint de Jeesup no compite en capacidades generales ni en contexto, sino en el eje específico de estudio de seguridad bajo compresión.

## Limitaciones y advertencias

- No es un modelo para producción: es un piloto de investigación de una sola pasada, no un SVD completo con información de Fisher, según el propio autor.
- No hay fine-tuning de recuperación, por lo que es esperable una degradación de coherencia y utilidad respecto al modelo base; debe comprobarse la PPL de WikiText-2 antes de interpretar métricas de seguridad.
- Las mediciones de seguridad incluidas no constituyen una garantía; el autor lo advierte explícitamente y recomienda revisar la coherencia y las fracciones puntuadas junto con la ASR.
- Los ejemplos de validación están retenidos del gradiente pero no son completamente ajenos a la calibración, lo que puede inflar la aparente calidad del ajuste.
- El repositorio publica matrices densas plegadas; no ofrece inferencia factorizada ni demuestra ganancia de velocidad pese a la reducción de rango.
- Sesgos conocidos: hereda los sesgos de Llama-2-7b-chat, no documentados ni mitigados en este checkpoint.
- Riesgo de alucinación: no evaluado en la información disponible; la compresión puede agravarlo al degradar la coherencia.
- Idiomas: no documentados; se desconoce si la compresión afecta de forma desigual a lenguas distintas del inglés.
- Licencia Llama 2: restricciones de uso comercial y de redistribución según los términos de Meta; requiere aceptar la licencia y cumplir la política de uso aceptable.
- El número de descargas (16) y la ausencia de likes indican que no ha sido validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-shifted-l2_mixed_remove0.4_rho0.001
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
- Referencia de AdvBench: https://github.com/llm-attacks/llm-attacks
- Referencia de HarmBench: https://www.harmbench.org/
- Referencia de XSTest: https://github.com/paul-rottger/xstest
- Referencia de OR-Bench: https://huggingface.co/datasets/bench-llm/or-bench
- Referencia de WildGuard: https://huggingface.co/allenai/wildguard
- Referencia de WikiText-2: https://huggingface.co/datasets/wikitext
