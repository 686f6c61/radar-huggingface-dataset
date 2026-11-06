# 2264K/ktransfer-27b-kd-lam005-s150

## Resumen

ktransfer-27b-kd-lam005-s150 es un checkpoint de investigación publicado por el usuario 2264K en Hugging Face, derivado de un estudio exploratorio sobre destilación de conocimiento entre tokenizadores distintos (cross-tokenizer knowledge distillation) para la adaptación al coreano del modelo Qwen3.8-27B. El modelo parte del checkpoint base Qwen/Qwen3.8-27B, al que se le aplica un ajuste fino completo (full fine-tuning) combinando entropía cruzada (CE) con una KL proyectada entre tokenizadores (X-Token-style P-KL), usando como profesor a google/gemma-4-31B-it. El resultado es un modelo de 27.356.728.560 parámetros (unos 27,36 mil millones) con licencia Apache-2.0.

La relevancia de esta ficha no reside en el rendimiento del modelo como producto, sino en su valor como artefacto de reproducibilidad: el autor lo publica explícitamente para replicar las tablas de un paper (incluidos resultados negativos), y advierte que no se trata de un modelo de propósito general mejorado. El checkpoint corresponde a la ejecución `lam005_27b` con un peso estático de KD de λ=0.05 en el paso 150, sobre una mezcla de datos coreano/inglés de aproximadamente 14 millones de caracteres.

El modelo está orientado a generación de texto conversacional en coreano e inglés, con un tamaño de repositorio de 54,7 GB en formato safetensors. Dado su carácter de checkpoint de investigación, con una sola semilla, un único par de modelos y presupuestos de entrenamiento cortos, debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.8-27B); no se detalla en la model card |
| Parámetros totales | 27.356.728.560 (≈27,36 B) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repo contiene safetensors en bf16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Coreano (ko) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.8-27B |
| Profesor (KD) | google/gemma-4-31B-it |
| Tamaño del repositorio | 54,7 GB |
| Pasos de entrenamiento | 150 (run `lam005_27b`) |
| Batch efectivo | 33 secuencias × longitud máxima 1024 |
| Optimizador / LR | adamw8bit / 5e-06, warmup 0.05, weight decay 0.1 |
| Hardware de entrenamiento | 3× A100-80GB, FSDP, bf16 |
| Semilla | 42 |

## Arquitectura y entrenamiento

El modelo hereda la pila de texto de Qwen/Qwen3.8-27B; según la model card, se entrenó únicamente el stack de texto y se congelaron los módulos no textuales. No se especifica en la información disponible si la arquitectura subyacente es un transformer denso, MoE o híbrida, ni detalles de atención (por ejemplo, atención lineal o decodificación especulativa). El ajuste fino es completo (no LoRA) sobre el checkpoint base, con FSDP en 3× A100-80GB y precisión bf16.

La innovación técnica del run es la destilación cross-tokenizer: se combina la pérdida de entropía cruzada estándar con una KL proyectada (X-Token-style P-KL) sobre el top-2048 del soporte del profesor, con un peso estático λ=0.05. La señal del profesor (google/gemma-4-31B-it) se precomputó como logits top-k, lo que permite alinear distribuciones entre tokenizadores distintos sin necesidad de un vocabulario compartido. El KD se desactiva en el dominio de replay en inglés. Los datos de entrenamiento consisten en una mezcla de ~14 millones de caracteres: un corpus privado de diálogo de personajes (~30% de los caracteres), Wikipedia en coreano, Namuwiki, texto web y noticias coreanas, y un replay de FineWeb-Edu en inglés (15%). El dataset no se publica. No se documenta RLHF ni DPO en la información proporcionada.

## Capacidades

- Generación de texto conversacional en coreano e inglés, con especial énfasis en registro de diálogo de personajes por la composición del corpus privado.
- Comprensión lectora y conocimiento factual en coreano, evaluado mediante HRM8K y KMMLU (ver sección de benchmarks).
- Modelado de lenguaje general (perplejidad) en coreano e inglés.
- Capacidades heredadas del modelo base Qwen3.8-27B, cuyo alcance exacto (código, matemáticas, tool calling, agentes, visión) no se detalla en la model card; no disponible la confirmación de soporte de function calling o multi-step reasoning en este checkpoint.
- No se documentan modos especiales (thinking mode, audio, visión) específicos de este run.
- El autor advierte que las capacidades no textuales del base quedan congeladas y que el modelo no está safety-tuned más allá del base.

## Casos de uso

- Reproducción de experimentos académicos: el checkpoint sirve para replicar las tablas del paper "Anchor or Transfer?", incluidos los resultados negativos, comparando el paso 150 con λ=0.05 frente a otras configuraciones del estudio.
- Investigación en destilación cross-tokenizer: permite analizar el efecto de la P-KL proyectada sobre top-2048 del profesor en la adaptación lingüística al coreano, aislando la contribución del KD frente a CE solo.
- Estudio de adaptación lingüística al coreano: útil para medir cómo un ajuste fino breve (~14M caracteres) desplaza el comportamiento del base hacia registros coreanos (Wikipedia, Namuwiki, noticias, diálogo).
- Evaluación de degradación por KD: el propio autor señala más repetición bajo sampling en los runs con KD; el checkpoint permite caracterizar ese fenómeno con decodificación estocástica.
- Generación de diálogo de personajes en coreano en entornos de investigación: el corpus privado de diálogo (~30% de caracteres) imprime un estilo conversacional que puede estudiarse, aunque no recomendarse para producción.
- Baseline para comparativas de perplejidad: con ko PPL 29,16 y en PPL 9,85 sobre texto retenido, sirve como referencia para futuros runs de adaptación al coreano sobre Qwen3.8-27B.
- Análisis de olvido catastrófico en inglés: el diseño con replay de FineWeb-Edu (15%) y KD desactivado en inglés permite estudiar la retención del dominio inglés tras el ajuste.

## Benchmarks y rendimiento

Resultados reportados en el borrador del paper, según la model card. Las métricas de exactitud provienen de subconjuntos de 200 ítems con decodificación greedy y calificación automática, y el autor las marca como provisionales (pendientes de re-adjudicación manual).

| Benchmark | Resultado |
|---|---|
| HRM8K (acc) | 0,755 |
| KMMLU (acc) | 0,495 |
| Perplejidad coreano (ko PPL) | 29,16 |
| Perplejidad inglés (en PPL) | 9,85 |

No se proporcionan resultados comparativos frente a otros modelos en la información disponible, ni cifras de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 54,7 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica requiere GPUs de 80 GB (A100-80GB, H100-80GB) o múltiples GPUs menores con paralelismo de tensor.
- Cuantización a 8 bits: ~27 GB de pesos, viable en una RTX 4090 de 24 GB solo con cuantización más agresiva o descarga parcial; no se documentan pesos cuantizados oficiales.
- Cuantización a 4 bits: ~14 GB de pesos, podría caber en GPUs consumer de 16-24 GB (RTX 4080/4090), aunque no hay artefactos GGUF/AWQ/GPTQ publicados en el repo.
- El entrenamiento se realizó con 3× A100-80GB con FSDP; el ajuste fino completo requiere ese orden de magnitud de memoria.
- Opciones de despliegue: al ser safetensors de un modelo tipo Qwen, es compatible con stacks habituales (vLLM, TGI, transformers) siempre que la arquitectura del base esté soportada; llama.cpp/Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Naturaleza | Disponibilidad |
|---|---|---|---|---|---|
| ktransfer-27b-kd-lam005-s150 | ≈27,36 B | No disponible | Apache-2.0 | Checkpoint de investigación (KD cross-tokenizer) | Hugging Face, safetensors |
| Qwen/Qwen3.8-27B (base) | ≈27 B (según base) | No disponible | Apache-2.0 (según base) | Modelo base de propósito general | Hugging Face |
| google/gemma-4-31B-it (profesor) | ≈31 B (según nombre) | No disponible | Apache-2.0 (según model card) | Modelo instructivo usado como profesor | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; la comparativa se limita a parámetros, licencia y naturaleza del artefacto.

## Limitaciones y advertencias

- Checkpoint de investigación: el autor declara explícitamente que no es un modelo de propósito general mejorado y que se publica para reproducibilidad, incluidos resultados negativos.
- Una sola semilla (42), un único par estudiante-profesor y presupuestos de entrenamiento cortos (150 pasos), lo que limita la generalización de cualquier conclusión.
- Mayor repetición bajo decodificación por sampling en los runs con KD en comparación con CE solo.
- Métricas de exactitud provisionales: subconjuntos de 200 ítems, calificación automática y re-adjudicación manual pendiente; los números pueden cambiar ligeramente.
- No safety-tuned más allá del modelo base; los outputs pueden reflejar el estilo del corpus privado de diálogo de personajes.
- Datos de entrenamiento no publicados, lo que impide auditoría completa del dataset y de posibles sesgos.
- Idiomas limitados a coreano e inglés; no se documenta soporte de otros idiomas.
- Longitud de contexto no documentada; no debe asumirse la del base sin verificación.
- Licencia Apache-2.0 permite uso comercial, pero el carácter experimental y la falta de evaluación de seguridad desaconsejan producción sin validación adicional.
- Riesgo de alucinación no cuantificado en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/2264K/ktransfer-27b-kd-lam005-s150
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Profesor: https://huggingface.co/google/gemma-4-31B-it
- Paper "Anchor or Transfer?": TBA (no disponible)
