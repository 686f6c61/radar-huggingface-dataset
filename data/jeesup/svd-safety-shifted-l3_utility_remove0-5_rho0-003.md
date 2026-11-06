# Jeesup/svd-safety-shifted-l3_utility_remove0.5_rho0.003

## Resumen

El modelo `Jeesup/svd-safety-shifted-l3_utility_remove0.5_rho0.003` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct` mediante compresión por descomposición en valores singulares (SVD). Lo publica el usuario Jeesup en Hugging Face y su propósito no es el uso general, sino el estudio experimental de cómo la compresión de pesos afecta simultáneamente a la utilidad del modelo (perplejidad) y a su comportamiento de seguridad (tasa de éxito de ataques adversarios). Se trata, por tanto, de un artefacto de evaluación de safety y compresión, no de un modelo listo para producción.

Técnicamente parte de la arquitectura Llama 3 de 8.030.261.248 parámetros (~8B) con ventana de contexto de 8.192 tokens, y le aplica una eliminación nominal del 50% de los parámetros de proyección mediante SVD, con una fracción real de parámetros factoriales de 0,565216 sobre el modelo completo. No hay fine-tuning de recuperación posterior: los pesos se presentan como matrices densas plegadas (folded dense) para facilitar la evaluación, aunque el presupuesto de rango describe una representación de bajo rango subyacente.

Su relevancia es metodológica: introduce un desplazamiento controlado de seguridad (`rho = 0.003`) mediante una métrica mixta que combina momentos de WikiText con momentos de prompts dañinos y respuestas seguras, y publica artefactos de evaluación (perplejidad en WikiText-2, generaciones en AdvBench, juicios HarmBench, XSTest y OR-Bench con WildGuard). Es un piloto unilateral, no un SVD completo con información de Fisher, y el propio autor advierte que no establece ninguna garantía de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), pesos densos plegados tras compresión SVD |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (heredada de Llama 3 8B Instruct; no verificada en la model card) |
| Tipos de cuantizacion | No disponible (el repo solo contiene safetensors en precisión original) |
| Idiomas soportados | No disponible (heredados del modelo base, sin declaración explícita) |
| Licencia | Llama 3 Community License (`llama3`) |
| Formato de pesos | safetensors (matrices densas plegadas) |

Parámetros adicionales del experimento: eliminación nominal de parámetros de proyección del 50%; fracción real de parámetros factoriales del modelo completo 0,565216; `rho` (desplazamiento relativo) 0,003; `lambda` global 0,004130161990254748; ridge 1e-05; métrica de entrada: utilidad; métrica de salida: identidad.

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3 8B Instruct: un transformer decoder-only con atención causal, RoPE y normalización RMSNorm, sin mezcla de expertos. Sobre esos pesos, el autor aplica una compresión SVD que elimina componentes de las matrices de proyección según un presupuesto de rango. La innovación del checkpoint no está en el entrenamiento sino en el criterio de compresión: en lugar de minimizar únicamente el error de reconstrucción o la perplejidad, se construye una métrica mixta que pondera los momentos de activación de WikiText junto con 0,1 veces los momentos de prompts dañinos emparejados con respuestas seguras. Ambas familias usan los mismos textos de respuesta de referencia (incluidas respuestas del profesor Llama-2) renderizados con sus propias plantillas de chat y perfilados con sus propios pesos densos.

El objetivo pondera por igual la entropía cruzada (CE) de respuestas seguras ante prompts dañinos y la CE de respuestas útiles ante prompts benignos. El gradiente se calcula con 128 ejemplos dañinos y 40 benignos; la validación CE usa 32 y 12 ejemplos separados, respectivamente. El autor aclara que, al ser el corpus de métrica mixta más amplio, estos son ejemplos retenidos del gradiente, no ejemplos de calibración completamente no vistos. No hay RLHF, DPO ni fine-tuning de recuperación tras la compresión; el checkpoint es el resultado directo del plegado de las matrices de bajo rango en forma densa.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Llama 3 8B Instruct.
- Razonamiento y respuesta a instrucciones en formato chat (plantilla de Llama 3).
- Generación de código y matemáticas a nivel del modelo base (no reevaluado en este checkpoint).
- Soporte de tool calling y function calling heredado del modelo base (no verificado tras la compresión).
- Capacidades multilingües heredadas del modelo base (no documentadas para este checkpoint).
- No incluye visión, audio ni modo de razonamiento extendido (thinking mode).
- El interés principal del checkpoint es su comportamiento medible en seguridad: ASR en AdvBench/HarmBench y sobre-rechazo en XSTest y OR-Bench.

## Casos de uso

- Investigación en compresión de modelos: medir la degradación conjunta de perplejidad y seguridad al eliminar parámetros por SVD, usando los ficheros de `experiment/` y `compression.json` como referencia reproducible.
- Evaluación de safety comparada: ejecutar AdvBench y HarmBench sobre este checkpoint y sobre el Llama 3 8B Instruct original para cuantificar el efecto del desplazamiento `rho = 0.003` en la tasa de éxito de ataques.
- Estudio de sobre-rechazo: analizar XSTest y los primeros 500 prompts de OR-Bench con juicios WildGuard para detectar si la compresión incrementa los rechazos ante peticiones benignas.
- Análisis de robustez de la alineación: usar el checkpoint como caso de estudio de cómo la eliminación de componentes de bajo rango afecta a las direcciones de activación asociadas a seguridad.
- Benchmarking de pipelines de evaluación: servir el modelo con vLLM o TGI y validar la coherencia de las generaciones y las fracciones puntuadas junto al ASR, tal como recomienda el autor.
- Docencia y divulgación: ilustrar en un curso o artículo el compromiso entre utilidad y seguridad en técnicas de compresión post-entrenamiento, con un artefacto público y licencia Llama 3.

## Benchmarks y rendimiento

La model card indica que los ficheros de evaluación contienen perplejidad en WikiText-2, generaciones en AdvBench con juicios HarmBench, XSTest y los primeros 500 prompts de OR-Bench juzgados por WildGuard. Sin embargo, no se proporcionan los valores numéricos en la información disponible.

| Benchmark | Resultado |
|---|---|
| WikiText-2 PPL | No disponible (ficheros referenciados, valores no publicados en la información) |
| AdvBench / HarmBench ASR | No disponible |
| XSTest | No disponible |
| OR-Bench (primeros 500, WildGuard) | No disponible |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16 GB solo para pesos, más overhead de KV cache; el repo ocupa 16,1 GB en safetensors.
- VRAM estimada en cuantización de 8 bits: ~8-9 GB; en 4 bits: ~5-6 GB (estimaciones para un modelo de 8B, no verificadas para este checkpoint).
- GPU recomendadas para FP16: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para una sola instancia.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) en FP16 con contexto moderado, y en GPUs de 12-16 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama tras convertir los pesos densos a GGUF; al ser pesos densos plegados, no se obtiene la ganancia de memoria de la representación de bajo rango.
- Latencia y throughput: no disponibles; el autor advierte explícitamente que este upload no proporciona inferencia factorizada ni establece una mejora de velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Jeesup, SVD safety-shifted) | 8,03B | 8.192 (heredado) | Compresión SVD con métrica mixta utilidad/seguridad | Llama 3 | Hugging Face, 15 descargas |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03B | 8.192 | Modelo base alineado con instrucciones | Llama 3 | Hugging Face, ampliamente usado |
| Meta-Llama-3.1-8B-Instruct | 8,03B | 131.072 | Generación posterior con contexto extendido | Llama 3.1 | Hugging Face |
| Mistral-7B-Instruct-v0.3 | ~7,25B | 32.768 | Alternativa abierta de tamaño similar | Apache 2.0 | Hugging Face |

La comparación de rendimiento con estas alternativas no está disponible: el checkpoint no publica cifras numéricas de benchmarks en la información proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que las mediciones del piloto no establecen ninguna garantía de seguridad.
- Es un piloto unilateral, no un SVD completo con información de Fisher; los resultados pueden no generalizar a otros presupuestos de rango o métricas.
- Los ejemplos de validación CE son retenidos del gradiente, pero no completamente no vistos respecto al corpus de calibración mixta.
- Riesgo de alucinación y degradación de coherencia tras eliminar el 50% nominal de parámetros de proyección; el autor recomienda inspeccionar la coherencia junto al ASR.
- No se documentan sesgos específicos de este checkpoint; hereda los del modelo base Llama 3 8B Instruct.
- Idiomas soportados no declarados; el comportamiento multilingüe tras la compresión no está verificado.
- Licencia Llama 3 Community License: impone restricciones de uso comercial, obligaciones de atribución ("Built with Meta Llama 3") y política de uso aceptable; revisar antes de cualquier despliegue.
- No apto para producción: es un artefacto de investigación con 15 descargas y sin pipeline declarado.
- Los pesos son densos plegados; no se obtiene ahorro de memoria ni aceleración de la representación de bajo rango en inferencia estándar.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-shifted-l3_utility_remove0.5_rho0.003
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia Llama 3: https://llama.meta.com/llama3/license/
- Artefactos del experimento: carpeta `experiment/` y `compression.json` dentro del repositorio de Hugging Face
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información disponible.
