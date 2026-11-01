# Jeesup/svd-safety-shifted-l2_mixed_remove0.4_rho0

## Resumen

`Jeesup/svd-safety-shifted-l2_mixed_remove0.4_rho0` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf` mediante compresión por descomposición en valores singulares (SVD) con un sesgo hacia la seguridad. Lo publica el usuario Jeesup como parte de un piloto sobre eliminación de parámetros de proyección en modelos Llama 2. El modelo no es un asistente listo para producción, sino un artefacto experimental para estudiar cómo afecta la compresión low-rank al comportamiento de seguridad de un LLM.

La intervención elimina nominalmente el 40 % de los parámetros de proyección, aunque la fracción efectiva de parámetros factorizados en el modelo completo es de 0,615424. El objetivo de la SVD mezcla momentos de entrada de WikiText con un 0,1 de momentos de prompts dañinos y respuestas seguras, y se aplica sin fine-tuning de recuperación posterior. Los pesos se publican como matrices densas plegadas para facilitar la evaluación, no como representación factorizada.

El checkpoint resulta relevante para quienes investigan compresión de modelos y alineación: permite medir si una SVD guiada por un criterio de seguridad degrada menos las capacidades de rechazo que una compresión estándar, a costa de posibles pérdidas de coherencia. Con 6.738.415.616 parámetros reales en safetensors y un repo de 13,5 GB, mantiene la arquitectura y el tokenizador de Llama 2 7B chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), pesos densos plegados tras SVD |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (hereda la de Llama 2 7B chat: 4.096 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se documentan GGUF ni AWQ) |
| Idiomas soportados | no disponible |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors (matrices densas plegadas) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Llama 2 7B chat: transformer decoder-only con atención multi-cabeza, RoPE y normalización RMSNorm. Sobre esa base se aplica una compresión SVD con eliminación nominal del 40 % de los parámetros de proyección, guiada por una métrica mixta de entrada. Esa métrica combina los momentos de entrada de WikiText con 0,1 veces los momentos de prompts dañinos y respuestas seguras, usando los mismos textos de respuesta de referencia (incluidas respuestas del profesor Llama 2) renderizados con sus propias plantillas de chat y perfilados con sus propios pesos densos.

El objetivo pondera por igual la entropía cruzada (CE) de respuestas seguras ante prompts dañinos y la CE de respuestas útiles ante prompts benignos. El gradiente se calcula con 128 ejemplos dañinos y 40 benignos; la validación CE usa 32 y 12 ejemplos separados, que son held-out respecto al gradiente pero no necesariamente respecto a la calibración. Los hiperparámetros incluyen desplazamiento relativo rho = 0,0, lambda global = 0,0 y ridge = 1e-05. No hay fine-tuning de recuperación. El autor lo describe explícitamente como un piloto unilateral, no como una SVD completa con información de Fisher.

## Capacidades

- Generación de texto conversacional heredada de Llama 2 7B chat, sujeta a la degradación introducida por la compresión SVD.
- Razonamiento y respuesta a instrucciones en formato chat de Llama 2.
- Evaluación de seguridad: el checkpoint está pensado para medir tasas de rechazo y coherencia bajo ataques de jailbreak.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües no documentadas; el modelo base Llama 2 está predominantemente entrenado en inglés.
- No dispone de modo thinking, visión ni audio.
- No se documenta decodificación especulativa ni optimizaciones de inferencia.

## Casos de uso

- Investigación en compresión de modelos: comparar la perplejidad en WikiText-2 y la coherencia de este checkpoint frente a una SVD estándar sin sesgo de seguridad, usando los ficheros de evaluación incluidos.
- Evaluación de alineación bajo compresión: ejecutar AdvBench y HarmBench sobre las generaciones del modelo para medir la tasa de éxito de ataques (ASR) y comprobar si el sesgo de la métrica mixta preserva los rechazos.
- Estudios de sobre-rechazo: usar los prompts de XSTest y los primeros 500 de OR-Bench con juicios de WildGuard para detectar si la compresión incrementa los falsos rechazos en peticiones benignas.
- Reproducibilidad de experimentos SVD: el directorio `experiment/` y `compression.json` permiten replicar ajustes, pérdidas de validación y diagnósticos por matriz en un entorno controlado.
- Análisis de robustez de salvaguardas: comparar la distribución de respuestas seguras y dañinas entre el modelo base y este checkpoint para estudiar la relación entre rango efectivo y comportamiento de seguridad.
- Docencia y divulgación: ilustrar en un curso o artículo cómo una intervención de bajo rango afecta a métricas de seguridad y coherencia, sin necesidad de entrenar desde cero.
- No se recomienda su uso como asistente en producción, atención al cliente ni generación de código, dado su carácter de piloto sin garantías.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card indica que los ficheros de evaluación contienen perplejidad en WikiText-2, generaciones de AdvBench con juicios de HarmBench, XSTest y los primeros 500 prompts de OR-Bench juzgados por WildGuard, pero no se proporcionan los valores en el texto facilitado. El autor advierte que estas mediciones piloto no establecen una garantía de seguridad y que deben inspeccionarse junto con la coherencia y las fracciones puntuadas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, alrededor de 15-16 GB.
- VRAM estimada en cuantización de 8 bits: unos 7 GB de pesos; en 4 bits, unos 3,5-4 GB, aunque no se publican ficheros cuantizados oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para fp16; RTX 3090/4080 (16-24 GB) para fp16 con contexto reducido.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 en fp16; en GPUs de 8-12 GB requeriría cuantización no oficial.
- Opciones de despliegue: transformers con safetensors; vLLM o TGI para servir en fp16; llama.cpp u Ollama solo si se generan conversiones GGUF propias, no incluidas en el repo.
- Latencia y throughput: no disponibles; el autor señala que la representación low-rank subyacente no implica por sí misma una aceleración en esta subida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeesup/svd-safety-shifted-l2_mixed_remove0.4_rho0 | 6,74 B (densos plegados) | no disponible | SVD con sesgo de seguridad sobre Llama 2 7B chat | llama2 | HuggingFace, 16 descargas |
| meta-llama/Llama-2-7b-chat-hf | 6,74 B | 4.096 tokens | Modelo base sin comprimir | llama2 | HuggingFace, ampliamente usado |
| Variantes SVD estándar de Llama 2 7B | variable | 4.096 tokens | Compresión low-rank sin sesgo de seguridad | llama2 | Depende del autor; no disponible en esta búsqueda |
| Modelos 7B comprimidos tipo TinyLlama o similares | ~1,1 B | 2.048 tokens | Entrenamiento desde cero con destilación | Apache 2.0 | HuggingFace |

La comparación directa con alternativas de compresión SVD de Llama 2 no está disponible en la información proporcionada. Frente al modelo base, la diferencia principal es la reducción de parámetros efectivos y la orientación de la métrica hacia respuestas seguras, sin datos públicos de rendimiento que permitan cuantificar la pérdida.

## Limitaciones y advertencias

- Checkpoint de investigación: el autor indica explícitamente que es un piloto unilateral y no una SVD completa con información de Fisher.
- Sin fine-tuning de recuperación: la compresión puede degradar coherencia y calidad de generación; hay que inspeccionar las generaciones antes de cualquier uso.
- No establece garantía de seguridad: las métricas de ASR y rechazo son mediciones piloto y no deben interpretarse como alineación robusta.
- Sesgos heredados de Llama 2 7B chat, incluidos sesgos de género, raza y religión documentados en el modelo base.
- Riesgo de alucinación propio de un modelo de 7B, potencialmente agravado por la compresión.
- Idiomas no documentados; el comportamiento fuera del inglés no está validado.
- Licencia llama2: el uso comercial está sujeto a la Llama 2 Community License, con restricciones para empresas con más de 700 millones de usuarios mensuales y obligaciones de atribución.
- No se publican ficheros GGUF, AWQ ni GPTQ; el despliegue en hardware limitado requiere conversión propia.
- El repo no incluye inferencia factorizada ni demuestra aceleración; los pesos son matrices densas plegadas.
- Fecha de creación y actualización poco habitual (2026), lo que sugiere un artefacto de investigación sin mantenimiento previsto.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-shifted-l2_mixed_remove0.4_rho0
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
- Paper de Llama 2: https://arxiv.org/abs/2307.09288
- AdvBench: https://github.com/llm-attacks/llm-attacks
- HarmBench: https://github.com/centerforaisafety/HarmBench
- XSTest: https://github.com/paul-rottger/xstest
- OR-Bench: https://huggingface.co/datasets/bench-llm/or-bench
- WildGuard: https://huggingface.co/allenai/wildguard
- WikiText-2: https://huggingface.co/datasets/wikitext
