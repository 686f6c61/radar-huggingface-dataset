# Jeesup/svd-safety-shifted-l2_mixed_remove0.5_rho0.00000001

## Resumen

Este checkpoint es un experimento de compresión de modelos aplicado sobre `meta-llama/Llama-2-7b-chat-hf`. El autor, Jeesup, parte del modelo conversacional de 7 000 millones de parámetros de Meta y le aplica una descomposición en valores singulares (SVD) con un objetivo de "desplazamiento de seguridad": en lugar de comprimir minimizando solo el error de reconstrucción sobre texto genérico, incorpora momentos estadísticos derivados de prompts dañinos y respuestas seguras. El resultado es un modelo denso con matrices plegadas, listo para evaluar con Hugging Face Transformers, en el que se ha eliminado nominalmente el 50 % de los parámetros de proyección.

La relevancia es metodológica más que práctica: se trata de un piloto unidireccional ("one-sided pilot") que explora si es posible comprimir un modelo alineado preservando o modificando su comportamiento de seguridad. El autor advierte explícitamente de que no es un SVD completo con información de Fisher, de que no hay fine-tuning de recuperación y de que las mediciones no constituyen una garantía de seguridad. Con 12 descargas y 0 likes, es un artefacto de investigación de nicho, no un modelo para producción.

El modelo conserva la arquitectura y el tokenizador de Llama 2 Chat, con 6 738 415 616 parámetros reales en safetensors y un repositorio de 13,5 GB. La fracción de parámetros de factor realizada en todo el modelo es 0,519340, es decir, algo más de la mitad de los parámetros de proyección originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), con matrices densas plegadas tras compresión SVD |
| Parametros totales | 6 738 415 616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Llama 2 usa 4096 tokens) |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene safetensors en precisión original |
| Idiomas soportados | no disponible (heredados del modelo base Llama 2, principalmente inglés) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors (matrices densas plegadas, compatibles con Hugging Face) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B Chat: un transformer decoder-only con atención causal, RoPE y normalización RMSNorm. Sobre esa base, el autor aplica una compresión por SVD con una métrica de entrada mixta: momentos de WikiText combinados con 0,1 veces los momentos de prompts dañinos y respuestas seguras. La métrica de salida es la identidad. Los hiperparámetros declarados son un desplazamiento relativo rho de 1e-08, un lambda global de 3,375972210921948e-07 y un ridge de 1e-05. La eliminación nominal de parámetros de proyección es del 50 %, con una fracción realizada de parámetros de factor de 0,519340 en todo el modelo.

El objetivo pondera por igual la entropía cruzada (CE) de respuestas seguras ante prompts dañinos y la CE de respuestas útiles ante prompts benignos. El gradiente se calcula con 128 ejemplos dañinos y 40 benignos; la validación CE usa 32 y 12 ejemplos separados. El autor aclara que, al ser el corpus de la métrica mixta más amplio, estos son ejemplos retenidos del gradiente, no ejemplos de calibración completamente no vistos. No hay fine-tuning de recuperación tras la compresión. Los pesos subidos son matrices densas plegadas para facilitar la evaluación; el presupuesto de rango describe la representación de bajo rango subyacente, pero el upload no proporciona inferencia factorizada ni demuestra una aceleración.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Llama 2 7B Chat.
- Razonamiento y respuesta a instrucciones en inglés, con el estilo de alineación del modelo base.
- No se documentan capacidades de tool calling, function calling ni agentes en la información proporcionada.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidades multilingües no documentadas; el modelo base está orientado principalmente al inglés.
- El propósito declarado del checkpoint es la evaluación de seguridad (AdvBench, HarmBench, XSTest, OR-Bench con juicios de WildGuard) y la perplejidad en WikiText-2, no el uso generalista.

## Casos de uso

- Investigación sobre compresión y alineación: analizar cómo una perturbación de bajo rango en los pesos afecta a la tasa de éxito de ataques (ASR) en AdvBench y a los juicios de HarmBench, usando los ficheros de evaluación incluidos en `experiment/`.
- Estudio de la relación entre perplejidad y seguridad: comparar la PPL en WikiText-2 con las métricas de seguridad para determinar si la degradación de la coherencia correlaciona con cambios en el comportamiento dañino.
- Reproducibilidad de experimentos SVD: el repositorio incluye `compression.json` con diagnósticos por matriz y el código fuente en `experiment/`, lo que permite replicar la proyección y comparar variantes de rho y lambda.
- Evaluación de sobre-rechazo: los resultados de XSTest y de los primeros 500 prompts de OR-Bench con juicios de WildGuard sirven para medir si la compresión incrementa los rechazos excesivos en peticiones benignas.
- Línea base para métodos de compresión conscientes de seguridad: sirve como punto de comparación frente a SVD estándar o técnicas con información de Fisher, al ser un piloto unidireccional declarado como tal.
- Docencia y divulgación técnica: ilustra de forma concreta cómo se pliega una representación de bajo rango en matrices densas y qué artefactos de evaluación acompañan a un checkpoint de investigación.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card indica que los ficheros de evaluación contienen PPL de WikiText-2, generaciones de AdvBench con juicios de HarmBench, XSTest y los primeros 500 prompts de OR-Bench juzgados por WildGuard, pero no se proporcionan los valores en el texto facilitado. El autor recomienda inspeccionar la coherencia y las fracciones puntuadas junto con la ASR, y advierte de que estas mediciones piloto no establecen una garantía de seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 16 GB o más.
- VRAM estimada en cuantización de 8 bits: alrededor de 7 GB de pesos; en 4 bits, alrededor de 4 GB, aunque el repositorio no incluye versiones GGUF ni cuantizadas.
- GPU recomendadas: A100 40/80 GB o H100 para evaluación por lotes; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en fp16 de una sola instancia.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en fp16 y en GPUs de 8-12 GB si se cuantiza manualmente, aunque no se ofrecen pesos pre-cuantizados.
- Opciones de despliegue: Hugging Face Transformers (formato nativo safetensors); vLLM, TGI y llama.cpp/Ollama serían viables tras convertir los pesos, pero no están documentados ni verificados por el autor.
- Latencia y throughput: no disponibles. El autor señala explícitamente que el upload no proporciona inferencia factorizada ni establece una aceleración, por lo que no debe esperarse ninguna mejora de rendimiento frente al modelo base.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Jeesup) | 6 738 415 616 | no disponible (base: 4096) | Compresión SVD con métrica mixta de seguridad | llama2 | Hugging Face, 12 descargas |
| meta-llama/Llama-2-7b-chat-hf | 6 738 415 616 | 4096 | Modelo conversacional alineado con RLHF | llama2 | Hugging Face, ampliamente usado |
| Variantes SVD estándar de Llama 2 | variable | 4096 | Compresión minimizando error de reconstrucción | llama2 | Depende del autor |
| Mistral-7B-Instruct-v0.2 | 7 241 000 000 | 32 768 | Modelo instructivo con ventana larga | Apache 2.0 | Hugging Face |

La comparación directa con alternativas de compresión es limitada porque no se han publicado resultados de benchmarks para este checkpoint. Frente al modelo base, la diferencia principal es la reducción de parámetros de proyección y la alteración deliberada de la métrica de compresión; frente a Mistral-7B-Instruct, la diferencia relevante es la licencia (llama2 frente a Apache 2.0) y el contexto, mucho mayor en Mistral.

## Limitaciones y advertencias

- El autor declara explícitamente que es un piloto unidireccional y no un SVD completo con información de Fisher; los resultados no deben generalizarse a otras variantes.
- No hay fine-tuning de recuperación tras la compresión, por lo que es esperable cierta degradación de coherencia y calidad conversacional.
- Las mediciones de seguridad (AdvBench, HarmBench, XSTest, OR-Bench) no constituyen una garantía de seguridad; el autor recomienda inspeccionar la coherencia y las fracciones puntuadas junto con la ASR.
- Los ejemplos de validación CE son retenidos del gradiente, pero no completamente no vistos respecto al corpus de calibración de la métrica mixta, lo que puede inflar ligeramente las métricas.
- Sesgos conocidos: no documentados específicamente para este checkpoint; hereda los del modelo base Llama 2 7B Chat.
- Riesgo de alucinación: no cuantificado en la información disponible; previsiblemente igual o superior al del modelo base por la compresión sin recuperación.
- Limitaciones de contexto e idioma: no documentadas; el modelo base tiene 4096 tokens de contexto y está orientado principalmente al inglés.
- Restricciones de licencia: la Llama 2 Community License impone condiciones para uso comercial (umbral de 700 millones de usuarios mensuales, atribución y restricciones de uso aceptable); debe revisarse antes de cualquier despliegue.
- El repositorio no ofrece pesos cuantizados, inferencia factorizada ni aceleración demostrada; el tamaño de 13,5 GB corresponde a matrices densas plegadas.
- Es un artefacto de investigación con 12 descargas y 0 likes; no hay evidencia de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-shifted-l2_mixed_remove0.5_rho0.00000001
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código o demos adicionales asociados a este checkpoint.
