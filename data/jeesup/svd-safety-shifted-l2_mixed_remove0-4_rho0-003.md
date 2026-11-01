# Jeesup/svd-safety-shifted-l2_mixed_remove0.4_rho0.003

## Resumen

`Jeesup/svd-safety-shifted-l2_mixed_remove0.4_rho0.003` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf` mediante compresión por descomposición en valores singulares (SVD) con un sesgo explícito hacia la seguridad. Lo publica el usuario Jeesup como parte de un piloto sobre compresión de modelos y evaluación de seguridad, no como un modelo listo para producción. El objetivo del experimento es medir qué ocurre con el comportamiento de rechazo y la utilidad conversacional cuando se elimina un porcentaje nominal del 40% de los parámetros de proyección y se aplica una perturbación relativa de rango (`rho = 0.003`) sobre una métrica mixta que combina momentos de WikiText con momentos de prompts dañinos y respuestas seguras.

El modelo conserva la arquitectura Transformer decoder-only de Llama 2 con 6.738.415.616 parámetros reales en pesos densos, pero internamente representa una fracción de factor de modelo completo de 0,615424 respecto al original. No hay fine-tuning de recuperación tras la compresión, de modo que el checkpoint mide el efecto puro del truncamiento SVD sesgado. La relevancia actual es metodológica: propone una vía para estudiar si la compresión puede desplazar la frontera entre utilidad y seguridad en modelos alineados, un aspecto poco explorado frente a la compresión puramente orientada a perplexity.

La licencia es Llama 2, heredada del modelo base, y el repositorio ocupa 13,5 GB en formato safetensors. No se declaran idiomas soportados ni pipeline en la información disponible. Es, por tanto, un artefacto de evaluación con fines de investigación, no un modelo recomendado para despliegue comercial o aplicaciones de usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), pesos densos con representación subyacente de bajo rango vía SVD |
| Parametros totales | 6.738.415.616 (pesos densos); fracción de factor de modelo completo: 0,615424 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada de Llama 2; no se especifica en la model card) |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors densos) |
| Idiomas soportados | No disponibles |
| Licencia | llama2 |
| Formato de pesos | safetensors (matrices densas de Hugging Face, no factorizadas) |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Llama-2-7b-chat-hf`, un Transformer decoder-only con atención causal estándar. Sobre ese checkpoint se aplica una compresión SVD con eliminación nominal del 40% de los parámetros de proyección. La métrica de entrada es mixta: combina momentos de entrada de WikiText con 0,1 veces los momentos de prompts dañinos y respuestas seguras. La métrica de salida es la identidad. Los hiperparámetros del piloto son `rho = 0.003`, `lambda` global = 0,10127916632765845 y ridge = 1e-05.

El objetivo de la perturbación pondera por igual la entropía cruzada (CE) de respuestas seguras ante prompts dañinos y la CE de respuestas útiles ante prompts benignos. El gradiente se calcula con 128 ejemplos dañinos y 40 benignos; la validación CE usa 32 y 12 ejemplos separados respectivamente. El autor advierte que el corpus de la métrica mixta es más amplio, por lo que estos ejemplos son retenidos del gradiente, no completamente ajenos a la calibración. Se trata de un piloto unilateral, no de un SVD completo con información de Fisher. No hubo fine-tuning de recuperación tras la compresión.

Los pesos publicados son matrices densas plegadas para facilitar la evaluación. El presupuesto de rango describe la representación de bajo rango subyacente, pero el repositorio no ofrece inferencia factorizada ni demuestra una ganancia de velocidad. Los archivos de evaluación incluyen PPL de WikiText-2, generaciones de AdvBench con juicios de HarmBench, y XSTest junto con los primeros 500 prompts de OR-Bench juzgados por WildGuard.

## Capacidades

- Generación de texto conversacional heredada de Llama 2 Chat, sujeta a la degradación introducida por la compresión SVD.
- Razonamiento y respuesta multi-turno según el comportamiento del modelo base, sin garantías tras la perturbación de seguridad.
- Comportamiento de rechazo potencialmente desplazado: el checkpoint está diseñado para estudiar cómo varía la tasa de rechazo ante prompts dañinos.
- Evaluación de seguridad: incluye artefactos para medir ASR (attack success rate) en AdvBench con HarmBench y respuestas a XSTest y OR-Bench con WildGuard.
- Evaluación de calidad lingüística: permite medir perplexity en WikiText-2 para cuantificar la degradación por compresión.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de pensamiento explícito.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre compresión y alineación: el checkpoint sirve para estudiar si el truncamiento SVD sesgado hacia seguridad preserva o degrada la tasa de rechazo ante prompts dañinos, comparando AdvBench/HarmBench con el modelo base sin comprimir.
- Análisis de la frontera utilidad-seguridad: permite medir simultáneamente PPL en WikiText-2 y ASR en AdvBench para trazar el compromiso entre calidad lingüística y comportamiento seguro bajo distintos niveles de compresión.
- Reproducción de experimentos de SVD: el directorio `experiment/` y `compression.json` permiten replicar los diagnósticos por matriz y las pérdidas de validación con los mismos hiperparámetros (`rho`, `lambda`, ridge).
- Evaluación con XSTest y OR-Bench: útil para comprobar si la compresión provoca rechazos excesivos en prompts benignos o respuestas inseguras en prompts ambiguos, usando WildGuard como juez.
- Estudio de calibración con métricas mixtas: sirve para analizar cómo influye ponderar momentos de WikiText con momentos de seguridad en la representación de bajo rango resultante.
- Baseline para métodos de recuperación: al no incluir fine-tuning de recuperación, actúa como referencia inferior frente a variantes que sí apliquen recuperación tras la compresión.
- Docencia y experimentación académica: adecuado para cursos o papers sobre compresión de modelos y evaluación de seguridad, dado su carácter de piloto reproducible.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card indica que los archivos de evaluación contienen PPL de WikiText-2, generaciones de AdvBench con juicios de HarmBench, y XSTest más los primeros 500 prompts de OR-Bench juzgados por WildGuard, pero no se proporcionan los valores concretos en el texto disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, se recomienda al menos 16-24 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 7 GB de pesos; en 4 bits, alrededor de 3,5-4 GB, aunque no se publican versiones cuantizadas oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para fp16 sin cuantización.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en fp16 con margen ajustado; en RTX 3080 (10-12 GB) requeriría cuantización, no publicada por el autor.
- Opciones de despliegue: al ser pesos densos en safetensors compatibles con Hugging Face Transformers, puede cargarse con `transformers`, vLLM o TGI; llama.cpp/Ollama requerirían conversión a GGUF no incluida en el repositorio.
- Latencia y throughput: no disponibles. El autor advierte explícitamente que el upload no proporciona inferencia factorizada ni establece una ganancia de velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeesup/svd-safety-shifted-l2_mixed_remove0.4_rho0.003 | 6.738.415.616 (fracción de factor 0,615424) | No disponible | Compresión SVD sesgada a seguridad, sin recuperación | llama2 | Hugging Face, 17 descargas |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 | 4.096 tokens (según Llama 2) | Modelo base alineado con RLHF | llama2 | Hugging Face, ampliamente disponible |
| Variantes de compresión SVD de Llama 2 sin sesgo de seguridad | Variable según ratio | Heredado de Llama 2 | Compresión orientada a perplexity | llama2 | Depende del autor; no disponible en esta búsqueda |

La comparación directa con alternativas concretas de compresión sesgada a seguridad no está disponible en la información proporcionada. El modelo base Llama 2 Chat es la referencia natural para medir la degradación introducida.

## Limitaciones y advertencias

- El autor indica explícitamente que las mediciones del piloto no establecen una garantía de seguridad.
- Es un piloto unilateral, no un SVD completo con información de Fisher; los resultados pueden no generalizar a otros regímenes de compresión.
- No hay fine-tuning de recuperación, por lo que se espera degradación de calidad y coherencia respecto al modelo base.
- Los ejemplos de validación CE son retenidos del gradiente, pero no completamente ajenos a la calibración, lo que puede inflar ligeramente las métricas.
- Riesgo de alucinación y pérdida de coherencia no cuantificado en la información disponible; se recomienda inspeccionar la fracción de respuestas puntuadas junto al ASR.
- Sesgos conocidos: no documentados específicamente; hereda los del modelo base Llama 2 Chat.
- Idiomas soportados: no disponibles; probablemente limitado a los del modelo base, pero sin confirmación.
- Licencia Llama 2: restricciones de uso comercial según los términos de Meta; requiere aceptar la licencia y cumplir la política de uso aceptable.
- Los pesos son densos y no factorizados: no se debe asumir ahorro de memoria ni aceleración por el presupuesto de rango.
- No apto para producción ni para aplicaciones de usuario final sin una evaluación adicional exhaustiva.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-shifted-l2_mixed_remove0.4_rho0.003
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
