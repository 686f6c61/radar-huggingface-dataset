# Jeesup/svd-safety-shifted-l3_utility_remove0.5_rho0.00000001

## Resumen

Este checkpoint es un experimento de investigación publicado por el usuario Jeesup que parte de `meta-llama/Meta-Llama-3-8B-Instruct` y le aplica una compresión mediante descomposición en valores singulares (SVD) con un sesgo deliberado hacia la "seguridad". El objetivo declarado es estudiar si es posible reducir parámetros del modelo mientras se desplaza su comportamiento hacia respuestas más seguras, sin un reentrenamiento posterior de recuperación ("no recovery fine-tuning"). Se trata, por tanto, de un artefacto de evaluación de seguridad y compresión, no de un modelo listo para producción.

Técnicamente, el autor elimina nominalmente el 50 % de los parámetros de proyección, aunque la fracción real de parámetros del modelo completo resultante es de 0,565216 (es decir, conserva aproximadamente un 56,5 % de los factores). El ajuste se guía por una métrica mixta que combina momentos de WikiText con momentos de pares prompt dañino/respuesta segura, ponderados por un factor de 0,1, y con un desplazamiento relativo `rho` de 1e-08. Los pesos se publican como matrices densas "plegadas" (folded) en formato Hugging Face, no como representación factorizada explícita.

Su relevancia es acotada y metodológica: sirve para reproducir y auditar un piloto de compresión con sesgo de seguridad, con métricas de perplejidad en WikiText-2, generaciones en AdvBench y juicios en HarmBench, XSTest y OR-Bench (juzgados con WildGuard). El propio autor advierte que no es un SVD completo con información de Fisher y que las mediciones no constituyen una garantía de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Meta-Llama-3-8B-Instruct), con matrices densas plegadas tras compresión SVD |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Llama 3 8B Instruct soporta 8.192 tokens, dato no confirmado para este checkpoint) |
| Tipos de cuantizacion | No disponible (el repo solo contiene safetensors en precisión original; no se listan GGUF ni cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | safetensors (matrices densas plegadas, no factorizadas) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer decoder-only de Llama 3 8B Instruct. Sobre esa base, el autor aplica una compresión por SVD guiada por una métrica mixta: por un lado, momentos de activación calculados sobre WikiText (métrica de utilidad); por otro, momentos calculados sobre pares de prompt dañino y respuesta segura, ponderados por 0,1. El gradiente se estima con 128 ejemplos dañinos y 40 benignos, y la validación de entropía cruzada usa 32 y 12 ejemplos separados respectivamente. Los hiperparámetros clave son `rho = 1e-08`, `lambda` global de 1,3767206634182494e-08 y ridge de 1e-05.

La innovación declarada es el desplazamiento ("shift") del objetivo de compresión hacia la seguridad: la función de pérdida pondera por igual la entropía cruzada de respuestas seguras ante prompts dañinos y la de respuestas útiles ante prompts benignos. El autor es explícito en que se trata de un piloto unilateral y no de un SVD completo con información de Fisher. No hay fine-tuning de recuperación posterior a la compresión. Los pesos se publican plegados en matrices densas para facilitar la evaluación, de modo que el checkpoint no ofrece inferencia factorizada ni demuestra por sí mismo una ganancia de velocidad.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Llama 3 8B Instruct.
- Razonamiento y respuesta a instrucciones en formato chat (el modelo base emplea plantilla de chat de Llama 3).
- Generación de código y matemáticas a nivel del modelo base (no se han publicado evaluaciones específicas para este checkpoint).
- Capacidades multilingües heredadas del modelo base (no documentadas en esta ficha).
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico específico para este checkpoint; cualquier capacidad de este tipo provendría del modelo base y no está validada tras la compresión.
- El propósito principal del checkpoint es servir como objeto de evaluación de seguridad (ASR, coherencia, fracciones puntuadas), no como asistente desplegable.

## Casos de uso

- Auditoría de compresión con sesgo de seguridad: usar el checkpoint junto con los ficheros de `experiment/` para reproducir las métricas de WikiText-2 PPL, AdvBench y HarmBench y comparar con el modelo base sin comprimir.
- Investigación en compresión de modelos: estudiar el efecto de eliminar el 50 % nominal de parámetros de proyección (56,5 % real de factores) sobre la perplejidad y la coherencia, sin recuperación posterior.
- Evaluación de robustez frente a prompts dañinos: emplear las generaciones en AdvBench y los juicios de HarmBench para medir la tasa de éxito de ataque (ASR) y contrastarla con XSTest y OR-Bench.
- Análisis de calibración de métricas: comparar los momentos de WikiText con los momentos mixtos (0,1 × pares dañino/seguro) para entender cómo el desplazamiento del objetivo afecta a la distribución de activaciones.
- Estudio de seguridad en modelos comprimidos: analizar si la compresión sesgada reduce respuestas dañinas a costa de utilidad, inspeccionando conjuntamente ASR, coherencia y fracciones puntuadas.
- Reproducibilidad metodológica: servir de referencia para futuros pilotos de SVD con información de Fisher, ya que el autor documenta explícitamente las limitaciones del enfoque unilateral.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card menciona que los ficheros de evaluación contienen WikiText-2 PPL, generaciones en AdvBench con juicios de HarmBench, y XSTest más los primeros 500 prompts de OR-Bench juzgados con WildGuard, pero no se incluyen los valores en el texto proporcionado. El autor advierte que estas mediciones piloto no establecen una garantía de seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión original (FP16/BF16): aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 18-24 GB para contextos moderados.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16 con contexto limitado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en RTX 3090 (24 GB); en GPUs de 16 GB requeriría cuantización, que no se distribuye en este repo.
- Opciones de despliegue: al ser safetensors densos compatibles con Hugging Face Transformers, puede cargarse con `transformers`, vLLM o TGI; no se proporcionan GGUF, por lo que llama.cpp u Ollama requerirían conversión manual.
- Latencia y throughput: no disponibles; el autor indica explícitamente que este upload no proporciona inferencia factorizada ni establece una mejora de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Jeesup/svd-safety-shifted-l3_utility_remove0.5_rho0.00000001 | 8.030.261.248 | No disponible | llama3 | Hugging Face (11 descargas) | Checkpoint de investigación con compresión SVD sesgada a seguridad |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.030.261.248 | 8.192 tokens | llama3 | Hugging Face (ampliamente disponible) | Modelo base sin comprimir; referencia de utilidad y seguridad |
| Alternativas de compresión SVD de Llama 3 8B | No disponible | No disponible | No disponible | No disponible | No se han identificado en la información proporcionada |

## Limitaciones y advertencias

- El autor declara explícitamente que es un piloto unilateral y no un SVD completo con información de Fisher; los resultados no deben generalizarse.
- No hay fine-tuning de recuperación tras la compresión, por lo que es esperable una degradación de utilidad y coherencia respecto al modelo base.
- Las mediciones de seguridad (AdvBench, HarmBench, XSTest, OR-Bench) no constituyen una garantía de seguridad; el autor recomienda inspeccionar coherencia y fracciones puntuadas junto al ASR.
- Los ejemplos de calibración del corpus mixto son retenidos del gradiente, pero no completamente invisibles, lo que puede inflar ligeramente las métricas.
- Los pesos se publican plegados como matrices densas; no se ofrece representación factorizada ni se demuestra una ganancia de velocidad real.
- Riesgo de alucinación y sesgos: no documentados específicamente para este checkpoint; heredados del modelo base y potencialmente alterados por la compresión.
- Restricciones de licencia: sujeto a la Llama 3 Community License, con las obligaciones de atribución y las restricciones de uso comercial que esta impone.
- Idiomas soportados no documentados; el comportamiento multilingüe tras la compresión no está validado.
- No apto para producción sin una evaluación propia exhaustiva de coherencia, seguridad y calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-shifted-l3_utility_remove0.5_rho0.00000001
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia Llama 3: https://llama.meta.com/llama3/license/
- Ficheros de experimento y diagnóstico: disponibles en el repositorio del modelo bajo `experiment/` y `compression.json` (no se proporcionan URLs directas adicionales en la información disponible).
