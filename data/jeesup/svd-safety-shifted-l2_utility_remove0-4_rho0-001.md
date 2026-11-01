# Jeesup/svd-safety-shifted-l2_utility_remove0.4_rho0.001

## Resumen

Este repositorio contiene un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf` mediante una técnica de compresión basada en descomposición en valores singulares (SVD) con un sesgo explícito hacia la seguridad. El autor, Jeesup, lo publica como un piloto de "SVD con desplazamiento de seguridad": se elimina nominalmente un 40 % de los parámetros de proyección de la representación de bajo rango, lo que se traduce en una fracción real de parámetros factoriales de 0,615424 sobre el modelo completo, sin fine-tuning de recuperación posterior.

El modelo no es un modelo conversacional pensado para producción, sino un artefacto de evaluación para estudiar cómo afecta la compresión SVD al equilibrio entre utilidad (perplejidad en WikiText-2) e identidad/safety (tasa de éxito de ataques en AdvBench, XSTest y OR-Bench). Emplea una métrica mixta que combina momentos de entrada de WikiText con 0,1 veces los momentos de prompts dañinos con respuestas seguras, y un objetivo que pondera por igual la entropía cruzada de respuestas seguras ante prompts dañinos y la de respuestas útiles ante prompts benignos.

Es relevante ahora porque la compresión agresiva de modelos es una práctica habitual para reducir costes de despliegue, y este checkpoint documenta de forma explícita el coste en seguridad de ese proceso. El autor advierte que se trata de un piloto unilateral, no de un SVD completo con información de Fisher, y que las mediciones no constituyen una garantía de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), pesos densos plegados tras compresión SVD |
| Parametros totales | 6.738.415.616 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de Llama 2, no confirmada en la información) |
| Tipos de cuantizacion | No disponible (repo en safetensors de precisión completa) |
| Idiomas soportados | No disponible |
| Licencia | llama2 |
| Formato de pesos | safetensors (13,5 GB de repositorio) |

## Arquitectura y entrenamiento

El modelo parte de Llama-2-7b-chat-hf, un transformer decoder-only con atención causal estándar y normalización RMSNorm, y aplica una compresión SVD sobre las matrices de proyección. La eliminación nominal de parámetros de proyección es del 40 %, con una fracción real de parámetros factoriales de 0,615424 sobre el modelo completo. Los pesos subidos son matrices densas plegadas de Hugging Face para facilitar la evaluación: el presupuesto de rango describe la representación de bajo rango subyacente, pero el repositorio no ofrece inferencia factorizada ni establece una aceleración real.

No hay fine-tuning de recuperación tras la compresión. El desplazamiento de seguridad se controla con un desplazamiento relativo rho de 0,001, un lambda global de 0,021182246274867613 y una regularización ridge de 1e-05. La métrica mixta combina momentos de entrada de WikiText con 0,1 veces los momentos de prompts dañinos con respuestas seguras; ambas familias usan los mismos textos de respuesta de referencia (incluidas respuestas del profesor Llama-2), renderizados con sus propias plantillas de chat y perfilados con sus propios pesos densos. El gradiente se calcula con 128 ejemplos dañinos y 40 benignos, y la validación de entropía cruzada usa 32 y 12 ejemplos separados; el corpus de la métrica mixta es más amplio, por lo que se trata de ejemplos retenidos del gradiente, no de calibración completamente no vista.

## Capacidades

- Generación de texto conversacional heredada de Llama-2-7b-chat, sujeta a la degradación introducida por la compresión SVD.
- Razonamiento y respuesta a instrucciones en formato chat de Llama 2.
- Evaluación de seguridad: el checkpoint incluye archivos de evaluación con generaciones en AdvBench, juicios de HarmBench, XSTest y los primeros 500 prompts de OR-Bench juzgados por WildGuard.
- Medición de utilidad mediante perplejidad en WikiText-2.
- No se documenta soporte de tool calling, function calling, agentes ni multi-step reasoning en la información disponible.
- No se documenta capacidad multilingüe específica ni modo de pensamiento, visión o audio.
- No se documenta una pipeline de inferencia en HuggingFace (`pipeline: no disponible`).

## Casos de uso

- Investigación sobre compresión de modelos: usar el checkpoint para medir la degradación de perplejidad en WikiText-2 al eliminar un 40 % nominal de parámetros de proyección, comparando con el modelo base sin comprimir.
- Auditoría de seguridad post-compresión: ejecutar AdvBench y HarmBench sobre las generaciones del modelo para cuantificar la tasa de éxito de ataques (ASR) y contrastarla con la del Llama-2-7b-chat original.
- Estudio de calibración de métricas: reproducir la métrica mixta (momentos de WikiText más 0,1 veces momentos de prompts dañinos con respuestas seguras) y analizar cómo el desplazamiento rho y el lambda global afectan al equilibrio utilidad-seguridad.
- Evaluación de sobre-rechazo: emplear XSTest para medir si la compresión y el sesgo de seguridad incrementan los rechazos ante prompts benignos, un riesgo habitual en modelos ajustados por seguridad.
- Análisis de coherencia: inspeccionar las generaciones y las fracciones puntuadas junto al ASR, tal como recomienda el autor, para detectar si la compresión produce texto incoherente que invalide las métricas de seguridad.
- Reproducibilidad de experimentos: el repositorio incluye los ajustes exactos, las pérdidas de validación y el código fuente en `experiment/`, además de diagnósticos por matriz en `compression.json`, lo que permite replicar el pipeline SVD.
- Línea base para métodos de compresión conscientes de seguridad: servir como referencia de un piloto unilateral frente a futuros SVD completos con información de Fisher.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card indica que los archivos de evaluación contienen perplejidad en WikiText-2, generaciones en AdvBench con juicios de HarmBench, XSTest y los primeros 500 prompts de OR-Bench juzgados por WildGuard, pero no se proporcionan los valores en el material consultado.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, más memoria para activaciones y caché KV; en la práctica, 16 GB es el mínimo ajustado y 24 GB es cómodo.
- VRAM estimada en cuantización de 8 bits: alrededor de 7 GB de pesos; en 4 bits, alrededor de 4 GB, aunque no se documentan cuantizaciones publicadas para este checkpoint.
- GPU recomendadas: A100 40/80 GB o H100 para evaluación por lotes a gran escala; RTX 4090 (24 GB) para inferencia en fp16 de una sola instancia; RTX 3090 (24 GB) como alternativa consumer.
- Cabe en GPU consumer de 24 GB en fp16 y en GPUs de 8-12 GB si se cuantiza, siempre que se genere la cuantización a partir de los safetensors.
- Opciones de despliegue: al ser pesos densos en formato Hugging Face, es compatible con transformers, vLLM y TGI; llama.cpp y Ollama requerirían conversión a GGUF, no incluida en el repositorio.
- Latencia y throughput: no disponibles. El autor advierte explícitamente que el repositorio no proporciona inferencia factorizada ni establece una aceleración sobre el modelo denso original.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Jeesup/svd-safety-shifted-l2_utility_remove0.4_rho0.001 | 6.738.415.616 | No disponible | llama2 | HuggingFace, 14 descargas | Checkpoint de investigación con compresión SVD y sesgo de seguridad |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 | 4096 tokens (según la documentación original de Llama 2) | llama2 | HuggingFace, ampliamente disponible | Modelo base sin comprimir; referencia de utilidad y seguridad |
| Modelos comprimidos por poda o cuantización de la familia Llama 2 | Variable | Variable | Según modelo base | Variable | No se dispone de datos comparativos concretos en la información proporcionada |

No se dispone de resultados de benchmarks de este checkpoint que permitan una comparación cuantitativa de rendimiento con las alternativas.

## Limitaciones y advertencias

- El propio autor indica que las mediciones del piloto no establecen una garantía de seguridad; el sesgo hacia respuestas seguras no equivale a robustez frente a ataques.
- La compresión elimina un 40 % nominal de parámetros de proyección sin fine-tuning de recuperación, lo que puede degradar la coherencia del texto; hay que inspeccionar las generaciones y las fracciones puntuadas junto al ASR antes de extraer conclusiones.
- El método es un piloto unilateral, no un SVD completo con información de Fisher, por lo que los resultados no se generalizan a otros regímenes de compresión.
- Los ejemplos de validación (32 dañinos y 12 benignos) están retenidos del gradiente, pero el corpus de la métrica mixta es más amplio; no son ejemplos de calibración completamente no vistos.
- Los pesos son matrices densas plegadas: no hay inferencia factorizada ni aceleración demostrada, así que no debe esperarse una ventaja de rendimiento sobre el modelo base.
- Riesgo de alucinación y sesgos: no documentados específicamente para este checkpoint; se heredan los del modelo base Llama-2-7b-chat, no caracterizados en la información disponible.
- Idiomas soportados: no disponibles; no se confirma cobertura multilingüe más allá de la del modelo base.
- Licencia llama2: el uso comercial está sujeto a los términos de la licencia de Llama 2 de Meta, que incluyen restricciones de escala de usuarios y obligaciones de atribución; conviene revisarla antes de cualquier despliegue en producción.
- El modelo tiene 14 descargas y 0 likes, lo que sugiere una validación comunitaria mínima; no debe tratarse como un artefacto estable para producción.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-shifted-l2_utility_remove0.4_rho0.001
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Repositorio de Llama 2 (Meta): https://github.com/facebookresearch/llama
- Artículo de Llama 2: https://arxiv.org/abs/2307.09288
- WikiText-2: https://huggingface.co/datasets/wikitext
- AdvBench: https://github.com/llm-attacks/llm-attacks
- HarmBench: https://github.com/centerforaisafety/HarmBench
- XSTest: https://github.com/paul-rottger/xstest
- OR-Bench: https://huggingface.co/datasets/bench-llm/or-bench
- WildGuard: https://huggingface.co/allenai/wildguard
