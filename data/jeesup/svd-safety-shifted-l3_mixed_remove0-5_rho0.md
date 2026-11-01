# Jeesup/svd-safety-shifted-l3_mixed_remove0.5_rho0

## Resumen

Jeesup/svd-safety-shifted-l3_mixed_remove0.5_rho0 es un checkpoint de investigación derivado de meta-llama/Meta-Llama-3-8B-Instruct mediante compresión por descomposición en valores singulares (SVD) con un sesgo explícito hacia la seguridad. Lo publica el usuario Jeesup como parte de un piloto sobre compresión de modelos y evaluación de seguridad, y no como un modelo listo para producción. El objetivo es estudiar si es posible eliminar una fracción relevante de los parámetros de proyección de un transformer preservando a la vez la coherencia del modelo y su comportamiento ante prompts dañinos.

El checkpoint elimina nominalmente el 50 % de los parámetros de proyección, lo que se traduce en una fracción real de parámetros factoriales de 0,565216 sobre el modelo completo. No se aplicó fine-tuning de recuperación posterior a la compresión. La métrica de entrada es mixta (momentos de WikiText combinados con 0,1 veces los momentos de prompts dañinos y respuestas seguras), mientras que la métrica de salida es la identidad, con un desplazamiento relativo rho de 0,0 y lambda global de 0,0.

Es relevante ahora porque la compresión agresiva de modelos abiertos de 8B parámetros es una línea activa de investigación para reducir costes de inferencia, y este checkpoint aporta una evaluación empírica concreta (perplejidad en WikiText-2, generaciones en AdvBench con juicios HarmBench y evaluación en XSTest y OR-Bench con WildGuard) sobre el compromiso entre compresión y alineación de seguridad. Los pesos subidos son matrices densas plegadas para facilitar la evaluación, no una representación factorizada optimizada para velocidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), pesos densos plegados tras compresión SVD |
| Parámetros totales | 8.030.261.248 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Llama 3 8B Instruct soporta 8.192 tokens) |
| Tipos de cuantización | no disponible (el repo solo contiene safetensors en precisión original) |
| Idiomas soportados | no disponible |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Meta-Llama-3-8B-Instruct: un transformer decoder-only con atención por cabezas agrupadas (GQA) y 8.030 millones de parámetros. Sobre ese modelo se aplica una compresión por SVD de las matrices de proyección, con una eliminación nominal del 50 % de los parámetros de proyección y una fracción factorial realizada de 0,565216 sobre el total del modelo. La métrica de entrada es mixta: momentos de segundo orden calculados sobre WikiText más 0,1 veces los momentos de un corpus de prompts dañinos con respuestas seguras. La métrica de salida es la identidad, con rho = 0,0 y lambda global = 0,0, y una regularización ridge de 1e-05.

El proceso de calibración usa 128 ejemplos dañinos y 40 benignos para el cálculo del gradiente, con una función objetivo que pondera por igual la entropía cruzada de respuestas seguras ante prompts dañinos y la de respuestas útiles ante prompts benignos. La validación usa 32 y 12 ejemplos separados, aunque el autor advierte que el corpus de la métrica mixta es más amplio, por lo que estos ejemplos están retenidos respecto al gradiente pero no son completamente ajenos a la calibración. No hubo fine-tuning de recuperación. El autor describe explícitamente el método como un piloto unilateral y no como un SVD completo con información de Fisher. Los pesos publicados son matrices densas plegadas; el presupuesto de rango describe la representación de bajo rango subyacente, pero esta subida no proporciona inferencia factorizada ni demuestra una aceleración.

## Capacidades

- Generación de texto y razonamiento conversacional heredados del modelo base Llama 3 8B Instruct, sujetos a la degradación introducida por la compresión.
- Seguimiento de instrucciones en formato chat de Llama 3 (el checkpoint conserva el tokenizador y las plantillas del modelo base).
- Evaluación de seguridad: el checkpoint está diseñado para medir la tasa de éxito de ataques (ASR) en AdvBench con juicios HarmBench, así como el comportamiento en XSTest y en los primeros 500 prompts de OR-Bench juzgados por WildGuard.
- Capacidad multilingüe: no disponible como dato verificado para este checkpoint; el modelo base soporta varios idiomas, pero la compresión puede afectar de forma desigual a idiomas con menos representación en la calibración.
- Tool calling y function calling: no documentado para este checkpoint; el modelo base Llama 3 8B Instruct incluye soporte de tool calling, pero no hay evidencia de que se preserve tras la compresión.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación sobre compresión de modelos: usar el checkpoint como referencia para medir cuánto degrada la eliminación del 50 % de parámetros de proyección en perplejidad y coherencia, comparando con el modelo base sin comprimir.
- Auditoría de alineación de seguridad: ejecutar los conjuntos de evaluación incluidos (AdvBench con HarmBench, XSTest, OR-Bench con WildGuard) para estudiar si la compresión SVD sesgada hacia seguridad reduce o aumenta la tasa de respuestas dañinas frente al modelo base.
- Estudio del compromiso seguridad-utilidad: comparar la entropía cruzada en respuestas seguras y en respuestas útiles para cuantificar el coste de utilidad que impone el objetivo de seguridad ponderado.
- Reproducción de experimentos: el repositorio incluye los ajustes exactos, las pérdidas de validación y el código fuente bajo `experiment/`, además de diagnósticos por matriz en `compression.json`, lo que permite replicar el pipeline de compresión.
- Análisis de robustez de salvaguardas: emplear el checkpoint como modelo "debilitado" en pruebas de red teaming para evaluar si los filtros de entrada y salida de un sistema de producción detectan respuestas degradadas o inseguras.
- Docencia y formación: ilustrar en cursos de compresión de modelos y seguridad de IA el efecto de eliminar parámetros de proyección sobre la coherencia y la alineación, con métricas concretas y reproducibles.

## Benchmarks y rendimiento

El autor indica que los archivos de evaluación contienen perplejidad en WikiText-2, generaciones en AdvBench con juicios HarmBench, y resultados en XSTest y los primeros 500 prompts de OR-Bench juzgados por WildGuard. Sin embargo, en la información proporcionada no se incluyen los valores numéricos de estos resultados.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de pesos densos de 8.030 millones de parámetros, en FP16 se requieren aproximadamente 16 GB de VRAM; en BF16, lo mismo. En cuantización de 8 bits, unos 8-9 GB; en 4 bits, unos 4-5 GB. Estas cifras son estimaciones basadas en el tamaño del checkpoint, no datos publicados por el autor.
- GPU recomendadas: A100 40 GB o H100 para inferencia en FP16 sin cuantizar con contexto largo; RTX 4090 (24 GB) o RTX 3090 (24 GB) para FP16 con contexto moderado; GPUs consumer de 8-12 GB solo con cuantización de 8 o 4 bits.
- ¿Cabe en GPU consumer? Sí, en tarjetas de 24 GB en FP16 y en tarjetas de 8-12 GB con cuantización, siempre que se generen pesos cuantizados a partir de los safetensors.
- Opciones de despliegue: los pesos son safetensors densos compatibles con transformers; para servir el modelo pueden usarse vLLM, TGI o llama.cpp/Ollama tras convertir a GGUF. El autor advierte que esta subida no proporciona inferencia factorizada ni establece una aceleración, por lo que no debe esperarse un rendimiento superior al de un Llama 3 8B denso.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Jeesup/svd-safety-shifted-l3_mixed_remove0.5_rho0 | 8.030 M | no disponible | llama3 | HuggingFace, 15 descargas | Checkpoint de investigación comprimido por SVD, sin fine-tuning de recuperación |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.030 M | 8.192 tokens | llama3 | HuggingFace, ampliamente disponible | Modelo base sin comprimir; referencia de coherencia y seguridad |
| Modelos Llama 3 8B comprimidos por poda o cuantización (por ejemplo, variantes GGUF/AWQ) | ~8.030 M | 8.192 tokens | llama3 | HuggingFace | Alternativas de compresión orientadas a despliegue; no equivalentes metodológicamente a este piloto SVD |

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo listo para producción; el autor lo describe como un piloto unilateral y no como un SVD completo con información de Fisher.
- La eliminación del 50 % de parámetros de proyección con una fracción factorial realizada de 0,565216 implica una degradación de capacidad no cuantificada en la información disponible; debe inspeccionarse la coherencia junto con la tasa de éxito de ataques (ASR).
- Las mediciones del piloto no establecen una garantía de seguridad; los resultados de AdvBench, XSTest y OR-Bench son indicativos, no concluyentes.
- Los ejemplos de validación (32 dañinos y 12 benignos) están retenidos respecto al gradiente, pero el corpus de la métrica mixta es más amplio, por lo que no son ejemplos completamente no vistos.
- Los pesos son matrices densas plegadas; no hay inferencia factorizada ni aceleración demostrada, por lo que el checkpoint no aporta ventajas de eficiencia frente al modelo base.
- La licencia llama3 impone restricciones de uso comercial y obligaciones de atribución; debe revisarse la Llama 3 Community License antes de cualquier despliegue.
- Riesgo de alucinación y sesgos: no documentados específicamente para este checkpoint; hereda los del modelo base y pueden amplificarse por la compresión.
- Idiomas soportados: no disponibles; la compresión puede afectar de forma desigual a idiomas con poca presencia en la calibración.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-shifted-l3_mixed_remove0.5_rho0
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia Llama 3: https://llama.meta.com/llama3/license/
