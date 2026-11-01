# Jeesup/svd-safety-shifted-l3_utility_remove0.4_rho0.001

## Resumen

`Jeesup/svd-safety-shifted-l3_utility_remove0.4_rho0.001` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct` mediante compresión SVD con desplazamiento de seguridad (*safety-shifted SVD*). Lo publica el usuario Jeesup como parte de un piloto unidireccional que combina eliminación de parámetros de proyección con un objetivo de utilidad y otro de identidad, sin fine-tuning de recuperación posterior. El modelo conserva la arquitectura y el tamaño nominal de Llama 3 8B Instruct (8.030.261.248 parámetros) pero con una fracción realizada de parámetros factoriales de 0,652173 respecto al modelo original, es decir, una eliminación nominal del 40 % de los parámetros de proyección.

El interés del checkpoint es metodológico más que práctico: sirve para estudiar cómo afecta la compresión SVD a las métricas de seguridad (AdvBench/HarmBench, XSTest, OR-Bench con WildGuard) y a la perplejidad en WikiText-2, manteniendo simultáneamente un objetivo de utilidad. El autor advierte explícitamente de que se trata de un piloto y que las mediciones no constituyen una garantía de seguridad.

No es un modelo listo para producción: los pesos se publican como matrices densas plegadas (*folded dense*) para facilitar la evaluación, y el propio autor indica que la representación de bajo rango subyacente no se ofrece como inferencia factorizada ni se demuestra una aceleración. La licencia es Llama 3, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), pesos densos plegados tras compresión SVD |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del base Llama 3 8B Instruct: 8.192 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | No disponible; el repo contiene safetensors en precisión original |
| Idiomas soportados | No disponibles en la model card |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | safetensors (matrices densas plegadas) |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Meta-Llama-3-8B-Instruct`, un transformer decoder-only con normalización RMSNorm, RoPE y atención causal estándar. Sobre ese checkpoint se aplica una compresión SVD con eliminación nominal del 40 % de los parámetros de proyección, resultando en una fracción realizada de parámetros factoriales de 0,652173 sobre el total del modelo. No hay fine-tuning de recuperación tras la compresión.

El proceso de selección de qué eliminar usa un objetivo mixto: una métrica de entrada basada en momentos de WikiText-2 combinada con 0,1 veces los momentos de pares prompt dañino/respuesta segura, y una métrica de salida de identidad. Los hiperparámetros declarados son un desplazamiento relativo rho de 0,001, un lambda global de 0,0013767206634182495 y un ridge de 1e-05. El gradiente se calcula con 128 ejemplos dañinos y 40 benignos, y la validación de entropía cruzada usa 32 y 12 ejemplos separados respectivamente; el autor aclara que, al ser el corpus de métrica mixta más amplio, estos son ejemplos retenidos del gradiente, no ejemplos de calibración completamente no vistos. El objetivo pondera por igual la CE de respuesta segura ante prompts dañinos y la CE de respuesta útil ante prompts benignos. El autor califica el método como piloto unidireccional y no como SVD completo con conciencia de Fisher.

## Capacidades

- Generación de texto conversacional, heredada de Llama 3 8B Instruct.
- Razonamiento y respuesta a instrucciones en formato chat de Llama 3.
- Capacidad multilingüe no documentada en esta model card; se desconoce el impacto de la compresión sobre idiomas distintos del inglés.
- No se documenta soporte de tool calling, function calling ni uso agéntico específico en este checkpoint.
- No se documenta visión, audio ni modo de razonamiento explícito (*thinking*).
- El propósito principal del checkpoint es la evaluación de seguridad y compresión, no el despliegue funcional.

## Casos de uso

- Investigación en compresión de modelos: servir como punto de comparación frente al Llama 3 8B Instruct original para medir la degradación de perplejidad en WikiText-2 tras eliminar el 40 % nominal de parámetros de proyección.
- Evaluación de seguridad post-compresión: reproducir los experimentos con AdvBench, HarmBench, XSTest y OR-Bench (primeros 500 prompts juzgados con WildGuard) para estudiar si la compresión SVD altera la tasa de éxito de ataques (ASR).
- Estudio de alineación y utilidad: analizar el equilibrio entre CE de respuestas seguras y CE de respuestas útiles bajo el objetivo mixto declarado, usando los ficheros de `experiment/`.
- Auditoría de metodologías SVD: comparar este piloto unidireccional con implementaciones completas con conciencia de Fisher y con variantes de rho y lambda distintas.
- Docencia e investigación académica: material de partida para trabajos sobre eliminación de parámetros y su efecto en comportamientos de seguridad.
- Validación de pipelines de evaluación: usar los ficheros de evaluación incluidos (PPL, generaciones, juicios) como referencia para probar herramientas de *benchmarking* de seguridad.
- No recomendado para atención al cliente, generación de código en producción ni despliegues comerciales, dado su carácter de checkpoint de investigación sin garantías.

## Benchmarks y rendimiento

La model card menciona que los ficheros de evaluación contienen PPL de WikiText-2, generaciones de AdvBench con juicios de HarmBench, y XSTest más los primeros 500 prompts de OR-Bench juzgados con WildGuard. Sin embargo, no se proporcionan los valores numéricos de estos resultados en la información disponible, por lo que no es posible presentar una tabla comparativa.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 18-20 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB; en 4 bits, en torno a 5-6 GB (estimaciones basadas en el tamaño de parámetros, no verificadas para este checkpoint).
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para fp16 sin cuantizar; RTX 4090 (24 GB) para fp16 con contextos cortos o cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantización; en RTX 4080/4070 Ti Super (16 GB) solo con cuantización agresiva.
- Opciones de despliegue: al ser pesos densos en safetensors compatibles con la arquitectura Llama 3, deberían funcionar vLLM, TGI, llama.cpp (tras conversión a GGUF) y Ollama (tras conversión), aunque no se documenta soporte explícito para este checkpoint.
- Latencia y throughput: no disponibles. El autor indica que el upload no proporciona inferencia factorizada ni establece una aceleración respecto al modelo original.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este checkpoint (svd-safety-shifted l3) | 8,03 B (fracción factorial 0,652173) | No disponible | llama3 | Piloto de compresión SVD con desplazamiento de seguridad, sin fine-tuning de recuperación |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B | 8.192 tokens | llama3 | Modelo base sin comprimir; referencia de utilidad y seguridad |
| Alternativas de compresión SVD de Llama 3 8B | No disponible | No disponible | Variable | No se dispone de datos de otros checkpoints comparables en la información proporcionada |

No se dispone de datos de rendimiento numérico de este checkpoint ni de alternativas directas en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y naturaleza del artefacto.

## Limitaciones y advertencias

- Checkpoint de investigación: el autor declara explícitamente que es un piloto unidireccional y que las mediciones no establecen una garantía de seguridad.
- Sin fine-tuning de recuperación: la eliminación del 40 % nominal de parámetros de proyección puede degradar la coherencia y la calidad de las respuestas; el autor recomienda inspeccionar la coherencia y las fracciones puntuadas junto con el ASR.
- Riesgo de alucinación: no evaluado específicamente en la información disponible; se desconoce el impacto de la compresión sobre la factualidad.
- Sesgos: no documentados; se heredan los del modelo base, potencialmente amplificados o alterados por la compresión.
- Idiomas: no se documenta el impacto de la compresión sobre idiomas distintos del inglés.
- Licencia Llama 3: restricciones de uso comercial y de redistribución según la Llama 3 Community License; requiere cumplir los términos de Meta.
- Sin aceleración demostrada: los pesos se publican como matrices densas plegadas y el autor indica que el upload no proporciona inferencia factorizada ni establece una mejora de velocidad.
- Corpus de validación limitado: los ejemplos de validación (32 dañinos, 12 benignos) son retenidos del gradiente pero no completamente no vistos, lo que limita la generalización de las conclusiones.
- No apto para producción: sin pipeline declarado, sin idiomas documentados y con métricas de seguridad no concluyentes.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-shifted-l3_utility_remove0.4_rho0.001
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia Llama 3: https://llama.meta.com/llama3/license/
- Ficheros de experimento y diagnóstico: disponibles en el repositorio (`experiment/`, `compression.json`) según la model card.
