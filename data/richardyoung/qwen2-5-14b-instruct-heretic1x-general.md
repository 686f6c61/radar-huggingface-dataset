# richardyoung/Qwen2.5-14B-Instruct-heretic1x-general

## Resumen

Qwen2.5-14B-Instruct-heretic1x-general es una variante "abliterated" (con el mecanismo de rechazo suprimido) del modelo Qwen/Qwen2.5-14B-Instruct de Alibaba, desarrollada por Richard J. Young. El modelo se ha generado mediante Heretic 1.x (heretic-llm 1.4.0), una herramienta que aplica una edicion LoRA de rango 1 sobre las proyecciones `o_proj` y `down_proj` para reducir la tasa de rechazo ante peticiones consideradas daninas, fusionando despues los pesos resultantes en bf16. No se trata de un modelo de proposito general, sino de un artefacto de investigacion para estudiar la abliteracion y su evaluacion.

El modelo conserva la arquitectura y el tamano del base: un transformer denso de 14.770.033.664 parametros (aproximadamente 14,8 mil millones), con contexto de 32.768 tokens heredado de la familia Qwen2.5. La intervencion es quirurgica y de baja dimensionalidad, de modo que las capacidades del modelo original se mantienen practicamente intactas: el cambio medio de capacidad en cinco benchmarks es de -0,13 puntos porcentuales.

Su relevancia es metodologica mas que practica. Forma parte de un estudio (paper 30 de Richard J. Young) que evalua la abliteracion con conjuntos de validacion retenidos y un juez externo (WildGuard), y que documenta que la regla de seleccion de trials puede invertir las comparaciones entre modelos abliterated. El modelo se distribuye bajo Apache-2.0 con las restricciones de uso de OpenRAIL++ v1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2), con edicion LoRA de rango 1 sobre `o_proj` y `down_proj` fusionada en bf16 |
| Parametros totales | 14.770.033.664 (~14,8 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredado de Qwen2.5-14B-Instruct) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en bf16; compatibles con cuantizacion estandar de transformers/GGUF, pero no se documentan variantes) |
| Idiomas soportados | Ingles (declarado en la model card y en los tags) |
| Licencia | Apache-2.0 (licencia del base) con restricciones de uso de OpenRAIL++ v1.0; prevalece la licencia base en caso de conflicto |
| Formato de pesos | Safetensors (bf16); repo de 29,6 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-14B-Instruct: un transformer decoder-only denso con atencion por grupos (GQA), RoPE y las mejoras de la familia Qwen2.5 (normalizacion RMSNorm, activacion SwiGLU, tokenizer multilingue). El modelo base fue entrenado por Alibaba con un corpus de gran escala y posteriormente ajustado con instrucciones y preferencias (SFT y optimizacion de preferencias), aunque la model card de esta variante no detalla el volumen de tokens ni la composicion del dataset original.

La modificacion consiste en una busqueda de 200 trials de Optuna con los valores por defecto de Heretic 1.x, usando como prompts daninos `mlabonne/harmful_behaviors` y como prompts benignos `mlabonne/harmless_alpaca`. Cada trial aplica una edicion LoRA de rango 1 sobre `o_proj` y `down_proj`. La regla de seleccion de Heretic 1.x escoge el trial con menos rechazos en el conjunto de desarrollo entre aquellos con divergencia KL de desarrollo menor o igual a 0,01. El trial seleccionado fue el numero 27, con 91/100 rechazos en desarrollo y una divergencia KL de 0,0081. Los pesos resultantes se fusionaron en bf16 y se publican con un `tensor_hashes.json` que verifica la integridad tensor a tensor.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, con el mismo nivel de calidad que el Qwen2.5-14B-Instruct original.
- Razonamiento y conocimiento general (MMLU-Pro), matematicas (GSM8K) y codigo (HumanEval, MBPP) con cambios de capacidad minimos respecto al base.
- Seguimiento de instrucciones (IFEval) ligeramente mejorado (+1,7 pp) segun la evaluacion del paper.
- Reduccion de la tasa de rechazo: 58,2% frente al 77,6% del original con el juez WildGuard, y 63,6% frente a 78,0% con marcadores de palabras clave.
- Menor sobre-rechazo en prompts benignos: 0,3% frente al 4,0% del original.
- Soporte de tool calling y function calling heredado del base Qwen2.5 (no verificado de forma independiente en esta variante).
- Capacidad de razonamiento multi-paso y uso como agente, heredada del base.
- No incluye modo thinking explicito, vision ni audio.

## Casos de uso

- Investigacion sobre abliteration: el modelo sirve como punto de comparacion reproducible (con hashes de tensores y registros de ejecucion) para estudiar como la regla de seleccion y la divergencia KL afectan a las tasas de rechazo.
- Evaluacion de seguridad de modelos: util para medir la eficacia de los mecanismos de rechazo y calibrar jueces automaticos como WildGuard sobre conjuntos retenidos de prompts daninos.
- Analisis de robustez de filtros: permite estudiar como responden los clasificadores de contenido ante un modelo con rechazo parcialmente suprimido.
- Generacion de texto creativo sin restricciones excesivas: para tareas de escritura donde el sobre-rechazo del modelo original resulta problematico, con la advertencia de que no hay ajuste de seguridad adicional.
- Experimentos de destilacion y comparacion de divergencia: util para medir el impacto de ediciones LoRA de bajo rango sobre las capacidades de un modelo de 14 B.
- Reproducibilidad de papers: al publicarse los hashes y el codigo, permite replicar los resultados del paper 30 en entornos de investigacion.
- Evaluacion comparativa de herramientas de abliteracion: sirve como referencia frente a Heretic 2.0, herramientas externas y releases de la comunidad sobre la misma familia Qwen2.5.

## Benchmarks y rendimiento

Evaluacion retenida del paper 30 sobre 972 prompts daninos no usados en la busqueda, con juez WildGuard, y cinco benchmarks de capacidad (cambio en puntos porcentuales respecto al original):

| Metrica | Este modelo | Original |
|---|---|---|
| Tasa de rechazo (juez WildGuard) [IC 95%] | 58,2% [55,1%, 61,3%] | 77,6% |
| Tasa de rechazo (marcadores de palabras clave) | 63,6% | 78,0% |
| Sobre-rechazo en prompts benignos (WildGuard) | 0,3% | 4,0% |
| Cambio medio de capacidad | -0,13 pp | 0 |

| Benchmark | Cambio (pp) |
|---|---|
| MMLU-Pro | -1,7 |
| GSM8K | +1,2 |
| IFEval | +1,7 |
| HumanEval | -1,2 |
| MBPP | -0,6 |

No se han publicado resultados absolutos por benchmark en la informacion disponible; solo se documentan los deltas respecto al modelo original.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 30 GB solo para pesos, mas cache KV; se recomienda un minimo de 40 GB para contexto corto y 48-80 GB para contexto largo.
- GPU recomendadas en bf16: A100 80 GB, H100 80 GB, o configuraciones multi-GPU (2x A6000 48 GB, 2x RTX 4090 24 GB con tensor parallelism).
- Cuantizacion a 8 bits: cabe en una sola GPU de 24 GB (RTX 3090/4090) con contexto moderado; a 4 bits, en GPUs de 16-24 GB, aunque no se documentan variantes GGUF oficiales en la informacion disponible.
- Consumer GPU: si, mediante cuantizacion (RTX 4090, RTX 3090, o GPUs de 16 GB con 4 bits y contexto reducido).
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y previsiblemente llama.cpp/Ollama/vLLM tras conversion a los formatos correspondientes, aunque no se confirma en la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tasa de rechazo (WildGuard) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-14B-Instruct-heretic1x-general | ~14,8 B | 32.768 | 58,2% | Apache-2.0 + OpenRAIL++ | Hugging Face |
| Qwen/Qwen2.5-14B-Instruct (original) | ~14,8 B | 32.768 | 77,6% | Apache-2.0 | Hugging Face |
| Heretic 2.0 sobre Qwen2.5 (paper 30) | No disponible | No disponible | No disponible en la informacion | No disponible | No disponible |
| Herramientas externas de abliteration sobre Qwen2.5 (paper 30) | No disponible | No disponible | No disponible en la informacion | No disponible | No disponible |

La comparativa cuantitativa con otras variantes abliterated del paper 30 no se detalla en la informacion proporcionada; el paper senala que la variacion entre busquedas es grande (desviacion estandar de ruido de semilla de aproximadamente 9 pp), por lo que las diferencias entre modelos individuales no deben sobreinterpretarse.

## Limitaciones y advertencias

- El rechazo se reduce, no se elimina: el modelo puede seguir generando contenido danino y no tiene ajuste de seguridad adicional.
- No esta pensado como asistente de proposito general; su uso previsto es la investigacion sobre abliteration y su evaluacion.
- Los resultados provienen de una unica busqueda sobre un unico modelo base; la variacion entre semillas es alta (SD de aproximadamente 9 pp), por lo que no deben extrapolarse.
- La regla de seleccion importa: en Qwen2.5-32B, reseleccionar con KL de desarrollo menor o igual a 0,1 en lugar de 0,01 redujo el rechazo residual en 61,7 pp; las comparaciones solo son validas con la misma regla y divergencia realizada.
- Riesgo de alucinacion y sesgos: heredados del modelo base Qwen2.5-14B-Instruct; no se documentan evaluaciones especificas de sesgo en esta variante.
- Idiomas: solo se declara ingles; el soporte multilingue del base no esta verificado en esta variante.
- Restricciones de licencia: Apache-2.0 con las restricciones de uso de OpenRAIL++ v1.0; no debe desplegarse para los usos prohibidos por dicha licencia, y en caso de conflicto prevalece la licencia base.
- Uso comercial: permitido por Apache-2.0, pero sujeto a las restricciones de OpenRAIL++; conviene revisar `LICENSE_OpenRAIL++.md` antes de un despliegue en produccion.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-14B-Instruct-heretic1x-general
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Licencia del base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct/blob/main/LICENSE
- Repositorio de codigo y registros: GitHub `ricyoung/abliteration-studies` (se publica junto con el paper)
- Paper 30: Richard J. Young, *The Selection Rule Can Reverse Abliteration Comparisons: A Held-Out, Judge-Based Case Study of Heretic 1.x, Heretic 2.0, External Tools and Community Releases on Qwen2.5* (enlace arXiv pendiente de anadir segun la model card)
- Heretic (herramienta): heretic-llm 1.4.0, git tag v1.4.0, commit `6ea3b8d`
