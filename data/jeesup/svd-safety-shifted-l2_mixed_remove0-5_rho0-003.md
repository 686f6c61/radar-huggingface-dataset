# Jeesup/svd-safety-shifted-l2_mixed_remove0.5_rho0.003

## Resumen

El modelo `Jeesup/svd-safety-shifted-l2_mixed_remove0.5_rho0.003` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`, publicado por el usuario Jeesup. No se trata de un modelo entrenado desde cero, sino de una compresión mediante descomposición en valores singulares (SVD) en la que se elimina aproximadamente el 50 % de los parámetros de proyección nominales (fracción realizada de parámetros factoriales de 0,519340 sobre el modelo completo). El objetivo declarado es estudiar cómo afecta esa compresión a las propiedades de seguridad del modelo, sin aplicar fine-tuning de recuperación posterior.

El checkpoint forma parte de un piloto de "safety-shifted SVD": se usa una métrica mixta de entrada que combina momentos de WikiText con 0,1 veces los momentos de pares prompt-dañino/respuesta-segura, y se aplica un desplazamiento relativo `rho = 0,003` con un `lambda` global de 0,10127916632765845 y regularización ridge de 1e-5. El autor lo describe explícitamente como un piloto unilateral, no como un SVD completo consciente de la información de Fisher.

Es relevante ahora porque aborda una pregunta poco explorada en la literatura de compresión: si reducir el rango de las matrices de un modelo alineado altera de forma medible su tasa de éxito ante ataques de jailbreak (ASR) y su comportamiento en benchmarks de seguridad como AdvBench, HarmBench, XSTest y OR-Bench. El modelo tiene 6.738.415.616 parámetros y un repositorio de 13,5 GB en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), con matrices densas plegadas tras compresión SVD |
| Parametros totales | 6.738.415.616 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de Llama-2-7b-chat-hf, no confirmada en la model card) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | No disponible |
| Licencia | llama2 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat-hf: un transformer decoder-only con atención multi-cabeza y normalización RMSNorm. Sobre esa base, el autor aplica una compresión por SVD de las matrices de proyección, eliminando nominalmente el 50 % de los parámetros de proyección y dejando una fracción realizada de parámetros factoriales de 0,519340 en el modelo completo. Las matrices resultantes se pliegan de nuevo en forma densa ("folded dense Hugging Face matrices") para facilitar la evaluación, de modo que el checkpoint cargado no ofrece inferencia factorizada ni un ahorro de cómputo demostrado.

El proceso de selección de direcciones singulares a eliminar usa una métrica mixta de entrada: momentos de segundo orden calculados sobre WikiText más 0,1 veces los momentos de pares prompt-dañino/respuesta-segura. Ambas familias de datos se renderizan con sus propias plantillas de chat y se perfilan con sus propios pesos densos; las respuestas de referencia incluyen las del propio profesor Llama-2. El objetivo pondera por igual la entropía cruzada de respuestas seguras ante prompts dañinos y la de respuestas útiles ante prompts benignos. El gradiente se calcula con 128 ejemplos dañinos y 40 benignos, y la validación con 32 y 12 ejemplos separados respectivamente. No hay fine-tuning de recuperación tras la compresión.

## Capacidades

- Generación de texto conversacional, heredada de Llama-2-7b-chat-hf.
- Razonamiento de propósito general y respuesta a instrucciones en formato chat.
- Generación de código y resolución de problemas matemáticos básicos (capacidades propias del modelo base, no reevaluadas en esta ficha).
- Soporte de tool calling: no disponible de forma nativa en Llama-2-7b-chat-hf; no se documenta en este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; la model card no especifica idiomas.
- Capacidades especiales: no hay modo thinking, visión ni audio. El interés del checkpoint es exclusivamente la evaluación de seguridad tras compresión.

## Casos de uso

- Investigación sobre compresión y alineación: permite estudiar si la eliminación de componentes de bajo rango degrada selectivamente la robustez frente a jailbreaks, comparando la ASR con la del modelo base sin comprimir.
- Auditoría de seguridad de modelos comprimidos: sirve como referencia para pipelines que evalúan AdvBench, HarmBench, XSTest y OR-Bench con jueces automáticos como WildGuard.
- Estudio de la relación entre perplejidad y seguridad: al publicar WikiText-2 PPL junto a las métricas de seguridad, permite analizar si la pérdida de coherencia correlaciona con el aumento de respuestas dañinas.
- Reproducción de experimentos de SVD selectivo: el repositorio incluye `experiment/` con ajustes exactos, pérdidas de validación y código fuente, y `compression.json` con diagnósticos por matriz, lo que facilita replicar el método.
- Análisis de métodos de selección de direcciones singulares: el uso de una métrica mixta (WikiText más momentos de seguridad) frente a métricas puramente de lenguaje permite comparar estrategias de poda espectral.
- Docencia y formación en seguridad de IA: como ejemplo didáctico de cómo una intervención aparentemente neutra en los pesos puede tener efectos medibles en el comportamiento de rechazo.

## Benchmarks y rendimiento

La model card menciona que los archivos de evaluación contienen WikiText-2 PPL, generaciones de AdvBench con juicios de HarmBench, XSTest y los primeros 500 prompts de OR-Bench juzgados por WildGuard. Sin embargo, no se proporcionan los valores numéricos de esos resultados en la información disponible.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 16-20 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 7-8 GB de pesos; en 4 bits, alrededor de 4-5 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: A100 40/80 GB, H100 para evaluación a gran escala; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para fp16 en inferencia de una sola secuencia.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en fp16 y en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: al ser matrices densas en safetensors, es compatible con vLLM, TGI, llama.cpp (tras conversión a GGUF) y Ollama (tras conversión), así como con transformers.
- Latencia y throughput: no disponibles; el autor advierte explícitamente que el checkpoint no proporciona inferencia factorizada ni establece una mejora de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeesup/svd-safety-shifted-l2_mixed_remove0.5_rho0.003 | 6.738.415.616 | No disponible | Compresión SVD con métrica mixta de seguridad | llama2 | Hugging Face, 14 descargas |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 | 4.096 tokens (estándar Llama 2) | Modelo base alineado con RLHF | llama2 | Hugging Face, ampliamente disponible |
| Variantes de poda SVD de Llama 2 | Variable según ratio | 4.096 tokens | Poda espectral sin conciencia de seguridad | llama2 | Depende del autor |

La comparación directa con alternativas de compresión es difícil porque el autor no publica métricas numéricas que permitan contrastar el rendimiento frente a otros métodos de poda o destilación. La principal diferencia frente al modelo base es la eliminación de aproximadamente la mitad de los parámetros de proyección, con el consiguiente riesgo de degradación de coherencia y de comportamiento de rechazo.

## Limitaciones y advertencias

- El propio autor advierte que las mediciones del piloto no establecen ninguna garantía de seguridad; los resultados deben interpretarse como indicios, no como conclusiones firmes.
- Es un piloto unilateral, no un SVD completo consciente de la información de Fisher, por lo que el método de selección de direcciones singulares es una aproximación.
- No hay fine-tuning de recuperación, de modo que la degradación de capacidades y de alineación puede ser sustancial.
- Las matrices están plegadas en forma densa: no se ofrece inferencia factorizada ni se demuestra una mejora de velocidad o de memoria en producción.
- Los ejemplos de validación no son completamente invisibles para la calibración, ya que el corpus de la métrica mixta es más amplio que el conjunto de validación.
- Riesgo de alucinación y de pérdida de coherencia no cuantificado en la información disponible; el autor recomienda inspeccionar la coherencia y las fracciones puntuadas junto a la ASR.
- Sesgos conocidos: no documentados específicamente para este checkpoint; hereda los del modelo base Llama-2-7b-chat-hf.
- Restricciones de licencia: la licencia llama2 impone condiciones de uso comercial y de redistribución que deben revisarse antes de cualquier despliegue en producción.
- Idiomas soportados no documentados; no se recomienda asumir un rendimiento multilingüe sin evaluación previa.
- El número de descargas (14) y de likes (0) indica que es un artefacto de investigación con validación comunitaria mínima.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-shifted-l2_mixed_remove0.5_rho0.003
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
