# Jeesup/svd-safety-shifted-l3_utility_remove0.5_rho0.0000001

## Resumen

Este repositorio contiene un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct` mediante una técnica de compresión basada en descomposición en valores singulares (SVD) con un sesgo explícito hacia la seguridad. El autor, identificado como Jeesup, aplica una eliminación nominal del 50% de los parámetros de proyección, lo que se traduce en una fracción real de parámetros del modelo completo de 0,565216, sin fine-tuning de recuperación posterior. El objetivo del experimento es evaluar si una proyección de bajo rango guiada por métricas mixtas (utilidad y seguridad) puede reducir comportamientos dañinos sin degradar en exceso la perplejidad sobre WikiText-2.

La relevancia de este checkpoint es metodológica más que práctica. Se trata de un piloto unilateral que combina momentos de entrada de WikiText con momentos de pares prompt dañino/respuesta segura, ponderados al 0,1, y que emplea un objetivo de entropía cruzada que equilibra respuestas seguras a prompts dañinos y respuestas útiles a prompts benignos. El autor advierte explícitamente de que no es un SVD completo con conciencia de Fisher y de que las mediciones no constituyen una garantía de seguridad.

El modelo se distribuye con matrices densas plegadas en formato Hugging Face para facilitar la evaluación, no como una representación factorizada lista para inferencia rápida. No se publican datos de arquitectura propios distintos de los del modelo base, ni idiomas soportados más allá de los heredados de Llama 3, ni resultados de benchmarks estándar de capacidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Meta-Llama-3-8B-Instruct) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Llama 3 8B Instruct soporta 8.192 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | safetensors (matrices densas plegadas) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3 8B Instruct: un transformer decoder-only con atención por cabezas agrupadas y normalización RMSNorm, sin modificaciones estructurales declaradas por el autor. La intervención consiste en una compresión por SVD sobre matrices de proyección, con un presupuesto de rango que elimina nominalmente el 50% de los parámetros de proyección y deja una fracción de parámetros del modelo completo de 0,565216. Los pesos resultantes se han plegado de nuevo a matrices densas para su evaluación, por lo que el repositorio no ofrece inferencia factorizada ni demuestra aceleración alguna.

El proceso de calibración usa un objetivo de entropía cruzada que pondera por igual la respuesta segura ante prompts dañinos y la respuesta útil ante prompts benignos. El gradiente se calcula con 128 ejemplos dañinos y 40 benignos, y la validación de entropía cruzada usa 32 y 12 ejemplos separados, respectivamente; el autor aclara que estos son ejemplos retenidos del gradiente, no un conjunto de calibración completamente no visto. La métrica mixta combina momentos de entrada de WikiText con 0,1 veces los momentos de pares prompt dañino/respuesta segura, usando los mismos textos de referencia (incluidas respuestas del profesor Llama-2) renderizados con sus propias plantillas de chat y perfilados con sus propios pesos densos. Los hiperparámetros declarados son: desplazamiento relativo rho = 1e-07, lambda global = 1,3767206634182493e-07 y ridge = 1e-05.

## Capacidades

- Generación de texto y razonamiento conversacional heredados del modelo base Llama 3 8B Instruct.
- Seguimiento de instrucciones en formato chat, con la plantilla de Llama 3.
- Razonamiento multi-turno dentro de la ventana de contexto del modelo base.
- Capacidad multilingüe heredada del modelo base (no verificada en este checkpoint).
- El autor no documenta soporte explícito de tool calling, function calling ni modo de razonamiento extendido en este checkpoint.
- El propósito declarado del checkpoint es la evaluación de seguridad, no el despliegue como asistente de producción.

## Casos de uso

- Investigación en compresión de modelos: servir como punto de comparación para estudiar cómo afecta una proyección SVD sesgada hacia la seguridad a la perplejidad y a las tasas de respuesta dañina, usando los ficheros de evaluación incluidos.
- Evaluación de seguridad reproducible: el repositorio incluye generaciones sobre AdvBench con juicios HarmBench, XSTest y los primeros 500 prompts de OR-Bench juzgados con WildGuard, lo que permite replicar el protocolo y comparar variantes de rho y lambda.
- Estudio de alineación post-hoc sin fine-tuning: analizar si una intervención puramente espectral puede reducir la tasa de éxito de ataques sin reentrenar, y documentar sus límites.
- Análisis de coherencia bajo compresión: inspeccionar la perplejidad en WikiText-2 junto con las fracciones evaluadas para detectar degradación lingüística inducida por el recorte de rango.
- Docencia y divulgación: ilustrar en cursos de seguridad y eficiencia de LLM el compromiso entre utilidad y rechazo de contenido dañino en un checkpoint de 8B parámetros.
- Base para experimentos de destilación o recuperación: partir de este checkpoint para probar fine-tuning de recuperación y medir cuánto del sesgo de seguridad se conserva tras el ajuste.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. El autor indica que los ficheros de evaluación contienen perplejidad en WikiText-2, generaciones sobre AdvBench con juicios HarmBench, XSTest y los primeros 500 prompts de OR-Bench juzgados con WildGuard, pero no se proporcionan los valores en la model card ni en los metadatos consultados.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 16 GB para los 8.030.261.248 parámetros, más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: del orden de 8-9 GB; en 4 bits, del orden de 4,5-5,5 GB (estimaciones basadas en el tamaño paramétrico, no verificadas para este checkpoint).
- GPU recomendadas para FP16: A100 40 GB, H100 80 GB, L40S 48 GB; en consumer, RTX 4090 24 GB o RTX 3090 24 GB con margen para contexto moderado.
- GPU consumer: cabe en tarjetas de 24 GB en FP16 con contexto limitado, y en tarjetas de 12-16 GB si se cuantiza.
- Opciones de despliegue: al ser matrices densas en safetensors con arquitectura Llama 3, es compatible con vLLM, TGI, llama.cpp (previa conversión a GGUF), Ollama y Transformers.
- Latencia y throughput: no disponibles; el autor advierte que este upload no proporciona inferencia factorizada ni establece ninguna aceleración respecto al modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeesup/svd-safety-shifted-l3_utility_remove0.5_rho0.0000001 | 8,03 B | No disponible (base: 8.192) | Compresión SVD con sesgo de seguridad, sin recuperación | llama3 | Hugging Face, 15 descargas |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B | 8.192 | Modelo base alineado con instrucciones | llama3 | Hugging Face, ampliamente disponible |
| meta-llama/Meta-Llama-3-8B | 8,03 B | 8.192 | Modelo base preentrenado | llama3 | Hugging Face, ampliamente disponible |
| Modelos de poda/SVD comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento de este checkpoint que permitan una comparación cuantitativa con alternativas; la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- El autor declara explícitamente que es un piloto unilateral y no un SVD completo con conciencia de Fisher; los resultados no deben generalizarse.
- Las mediciones de seguridad presentadas no constituyen una garantía de seguridad; deben inspeccionarse la coherencia y las fracciones puntuadas junto con la tasa de éxito de ataques.
- Los ejemplos de validación son retenidos del gradiente, pero no completamente no vistos respecto al corpus de calibración de la métrica mixta, lo que puede inflar la aparente calidad de la calibración.
- No hay fine-tuning de recuperación, por lo que es esperable cierta degradación de capacidad respecto al modelo base; el grado exacto no se cuantifica en la información disponible.
- Los pesos se distribuyen como matrices densas plegadas; no se ofrece inferencia factorizada ni se demuestra aceleración, pese al presupuesto de rango subyacente.
- La licencia llama3 impone restricciones de uso comercial y obligaciones de atribución; debe revisarse la Llama 3 Community License antes de cualquier despliegue.
- Riesgo de alucinación y sesgos: no evaluados en la información proporcionada; se heredan los del modelo base sin cuantificar.
- Idiomas soportados: no declarados; se asumen los del modelo base, sin verificación en este checkpoint.
- El checkpoint está fechado en 2026-10-30 y cuenta con 15 descargas y 0 likes, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-shifted-l3_utility_remove0.5_rho0.0000001
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia Llama 3: https://llama.meta.com/llama3/license/
- No se han encontrado en la búsqueda web papers, blogs, repositorios o demos adicionales asociados a este checkpoint.
