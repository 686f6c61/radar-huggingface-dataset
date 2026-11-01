# Jeesup/svd-safety-shifted-l3_utility_remove0.5_rho0.001

## Resumen

El modelo `Jeesup/svd-safety-shifted-l3_utility_remove0.5_rho0.001` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct` mediante compresión por descomposición en valores singulares (SVD) con un sesgo deliberado hacia la utilidad y un desplazamiento de identidad controlado. Lo publica el usuario Jeesup como parte de un piloto sobre compresión de modelos y evaluación de seguridad, y no está pensado como un modelo listo para producción, sino como un artefacto experimental para estudiar cómo la eliminación de parámetros afecta simultáneamente a la perplejidad y a las respuestas ante prompts dañinos.

El checkpoint aplica una eliminación nominal del 50 % de los parámetros de proyección, lo que se traduce en una fracción real de parámetros factoriales de 0,565216 sobre el modelo completo, sin fine-tuning de recuperación posterior. Mantiene la arquitectura transformer decoder-only de Llama 3 8B Instruct, con 8.030.261.248 parámetros totales y los pesos plegados en matrices densas para facilitar la evaluación, aunque la representación subyacente es de bajo rango.

Su relevancia es metodológica: introduce una métrica mixta que combina momentos de entrada de WikiText con momentos de prompts dañinos y respuestas seguras, y publica evaluaciones de perplejidad en WikiText-2, generaciones en AdvBench con juicios de HarmBench, y XSTest más los primeros 500 prompts de OR-Bench juzgados por WildGuard. Es, por tanto, un punto de partida para investigar la relación entre compresión, utilidad y alineación de seguridad, no un modelo con garantías de seguridad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), pesos plegados en matrices densas |
| Parámetros totales | 8.030.261.248 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada de Llama 3 8B Instruct, no confirmada) |
| Tipos de cuantización | No disponible; el repo contiene safetensors en precisión original |
| Idiomas soportados | No disponible |
| Licencia | Llama 3 (llama3) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Meta-Llama-3-8B-Instruct y aplica una compresión SVD con eliminación nominal del 50 % de los parámetros de proyección, resultando en una fracción de parámetros factoriales de 0,565216 sobre el total del modelo. No hay fine-tuning de recuperación tras la compresión. El proceso usa una métrica de entrada basada en utilidad y una métrica de salida basada en identidad, con un desplazamiento relativo rho de 0,001, un lambda global de 0,0013767206634182495 y un ridge de 1e-05. La métrica mixta combina momentos de WikiText con 0,1 veces los momentos de prompts dañinos y respuestas seguras, usando las mismas respuestas de referencia (incluidas respuestas del profesor Llama-2) renderizadas con sus propias plantillas de chat y perfiladas con sus propios pesos densos.

El autor describe explícitamente el trabajo como un piloto unilateral, no como un SVD completo consciente de Fisher. La función objetivo pondera por igual la entropía cruzada (CE) de respuestas seguras ante prompts dañinos y la CE de respuestas útiles ante prompts benignos. El gradiente se calcula con 128 ejemplos dañinos y 40 benignos; la validación CE usa 32 y 12 ejemplos separados, respectivamente. Dado que el corpus de la métrica mixta es más amplio, estos ejemplos están retenidos del gradiente pero no son completamente invisibles a la calibración. Los pesos se publican plegados en matrices densas de Hugging Face por comodidad de evaluación; el presupuesto de rango describe la representación de bajo rango subyacente, pero este upload no ofrece inferencia factorizada ni establece una ganancia de velocidad.

## Capacidades

- Generación de texto y razonamiento conversacional heredados de Llama 3 8B Instruct, sujetos a la degradación introducida por la compresión SVD sin recuperación.
- Respuesta a prompts instructivos con plantilla de chat de Llama 3.
- Evaluación de seguridad: el checkpoint incluye material para medir tasas de respuesta dañina (AdvBench/HarmBench) y comportamiento de rechazo (XSTest, OR-Bench con WildGuard).
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso específicas en la información disponible; deben asumirse las del modelo base, mermadas por la compresión.
- Capacidades multilingües no documentadas en la información proporcionada.
- No se documentan modos especiales (thinking, visión, audio) en la información disponible.

## Casos de uso

- Investigación sobre compresión de modelos: sirve como punto de comparación para medir cómo una eliminación del 50 % de parámetros de proyección afecta a la perplejidad en WikiText-2 frente al modelo base, usando los ficheros de evaluación incluidos.
- Estudio de alineación y seguridad: permite analizar la tasa de éxito de ataques (ASR) en AdvBench con juicios de HarmBench y compararla con checkpoints de otras configuraciones de rho y lambda.
- Análisis de calibración de rechazos: los resultados en XSTest y en los primeros 500 prompts de OR-Bench juzgados por WildGuard permiten estudiar falsos rechazos y respuestas inseguras de forma conjunta.
- Reproducibilidad metodológica: el código fuente, los ajustes exactos y las pérdidas de validación están en `experiment/`, y los diagnósticos por matriz en `compression.json`, lo que facilita replicar el pipeline SVD con métrica mixta.
- Docencia y formación: útil en cursos de eficiencia de modelos para ilustrar el compromiso entre tamaño, utilidad y comportamiento de seguridad en un transformer de 8B.
- Baseline para técnicas de recuperación: al no incluir fine-tuning de recuperación, sirve como referencia inferior frente a variantes con destilación o ajuste posterior.
- Auditoría de licencias y despliegue: permite probar pipelines de evaluación internos sobre un checkpoint con licencia Llama 3 antes de invertir en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card indica que los ficheros de evaluación contienen perplejidad en WikiText-2, generaciones en AdvBench con juicios de HarmBench, y XSTest más los primeros 500 prompts de OR-Bench juzgados por WildGuard, pero no se proporcionan los valores en el material facilitado. El autor advierte que estas mediciones piloto no establecen una garantía de seguridad y recomienda inspeccionar la coherencia y las fracciones puntuadas junto con la ASR.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 18-24 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB de pesos; en 4 bits, alrededor de 4,5-5,5 GB, aunque no se documentan cuantizaciones publicadas para este checkpoint.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para evaluación cómoda en fp16; RTX 4090 (24 GB) para fp16 con contexto limitado; RTX 3090/4080 para cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en fp16 con contexto moderado y en GPUs de 12-16 GB si se cuantiza, aunque el repo solo distribuye safetensors densos.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama son compatibles con arquitectura Llama, pero requerirían conversión a GGUF o cuantización propia; el upload no incluye artefactos factorizados ni formatos alternativos.
- Latencia y throughput: no disponibles. El autor señala que el upload no proporciona inferencia factorizada ni establece una ganancia de velocidad, por lo que el rendimiento esperado es el de un Llama 3 8B denso estándar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeesup/svd-safety-shifted-l3_utility_remove0.5_rho0.001 | 8,03 B | No disponible | Compresión SVD con métrica mixta de utilidad y seguridad | Llama 3 | Hugging Face, 16 descargas |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B | 8.192 tokens (modelo base) | Instruct generalista sin compresión | Llama 3 | Hugging Face, ampliamente disponible |
| Checkpoints SVD de Llama 3 con otras configuraciones de rho y lambda (familia Jeesup) | ~8 B | No disponible | Variantes del mismo piloto | Llama 3 | Hugging Face, disponibilidad limitada |
| Modelos comprimidos tipo SliceGPT o SparseGPT sobre Llama 3 8B | ~8 B con poda | No disponible | Poda estructurada o semiestructurada | Según modelo base | Repos de investigación |

La comparación directa de rendimiento no es posible porque no se han publicado cifras de benchmarks en la información disponible. Frente al modelo base, la diferencia clave es la eliminación del 50 % de parámetros de proyección sin recuperación, lo que previsiblemente degrada la perplejidad y la coherencia; frente a otras técnicas de compresión, este checkpoint destaca por incorporar una métrica de seguridad en el objetivo de compresión, aunque el propio autor lo califica de piloto unilateral.

## Limitaciones y advertencias

- Checkpoint de investigación: el autor indica explícitamente que las mediciones piloto no establecen una garantía de seguridad.
- Compresión sin recuperación: la eliminación del 50 % de parámetros de proyección sin fine-tuning posterior puede degradar coherencia, fluidez y seguimiento de instrucciones; debe inspeccionarse la coherencia junto con las métricas de seguridad.
- Sesgo metodológico: el objetivo pondera por igual CE de respuestas seguras y CE de respuestas útiles, con solo 128 ejemplos dañinos y 40 benignos para el gradiente, y 32 y 12 para validación; el corpus mixto es más amplio, por lo que la validación no es completamente ciega.
- No es un SVD consciente de Fisher: el autor lo describe como piloto unilateral, lo que limita las conclusiones sobre optimalidad de la compresión.
- Sin inferencia factorizada: los pesos se distribuyen plegados en matrices densas; no se puede esperar ahorro de memoria ni ganancia de velocidad por el rango bajo.
- Idiomas y contexto no documentados: no se confirman capacidades multilingües ni la longitud de contexto efectiva tras la compresión.
- Riesgo de alucinación: inherente a los modelos de 8B y potencialmente agravado por la compresión; no hay evaluación específica de factualidad en la información disponible.
- Licencia Llama 3: el uso comercial está sujeto a los términos de la licencia de Meta, incluidos requisitos de atribución y restricciones de uso aceptable; debe revisarse antes de cualquier despliegue.
- Disponibilidad limitada: 16 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni demo asociada.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-shifted-l3_utility_remove0.5_rho0.001
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia Llama 3: https://llama.meta.com/llama3/license/
- Ficheros de evaluación y código fuente: disponibles en el repositorio bajo `experiment/` y `compression.json` (según la model card)
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
