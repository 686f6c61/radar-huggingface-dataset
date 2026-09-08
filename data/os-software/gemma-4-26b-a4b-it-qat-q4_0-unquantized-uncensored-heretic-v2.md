# OS-Software/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic-v2

## Resumen

Este modelo es una variante manipulada del modelo Gemma 4 de Google DeepMind, concretamente de la versión `google/gemma-4-26B-A4B-it-qat-q4_0-unquantized`, a la que se le ha aplicado una técnica de ablación conocida como *abliteration* mediante la herramienta Heretic v2.0.0.dev0+custom. El objetivo declarado por el autor es reducir de forma sustancial la alineación de seguridad del modelo para eliminar los rechazos (refusals) y permitir un comportamiento menos censurado. Este modelo no es un desarrollo independiente, sino un *fine-tuning* derivado del original, mantenido por el usuario OS-Software y alojado en HuggingFace.

La arquitectura subyacente es un Transformer multimodal con Mixture of Experts (MoE), con un total de 25.805.933.872 parámetros (aproximadamente 25,8 mil millones) y unos 4.000 millones de parámetros activos por token, tal y como indica el sufijo A4B. El modelo base soporta una ventana de contexto de hasta 256.000 tokens y es multilingüe en más de 140 idiomas. La licencia del repositorio es Apache 2.0, heredada del modelo original.

Dado que el proceso de ablación altera capas específicas (12 a 20) y componentes concretos del modelo, esta variante es especialmente relevante en el campo de la investigación en alineación, seguridad e interpretabilidad. Su principal valor no es el rendimiento en tareas convencionales, sino servir como herramienta para estudiar cómo los mecanismos de seguridad interna pueden ser mitigados y cómo se comporta un modelo sin dichas restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con Mixture of Experts (MoE) |
| Parametros totales | 25.805.933.872 (~25,8B) |
| Parametros activos | ~4B activos por token (denominacion A4B del modelo base) |
| Longitud de contexto | Hasta 256K tokens |
| Tipos de cuantizacion | QAT Q4_0 unquantized (pesos half-precision extraidos del pipeline QAT); el modelo base es compatible con cuantizacion GGUF Q4_0, formato movil wNa8o8 y compressed-tensors w4a16 |
| Idiomas soportados | Mas de 140 idiomas (segun la model card del modelo base; la metadata de este repositorio no especifica idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (half-precision) |

## Arquitectura y entrenamiento

El modelo base Gemma 4 es un Transformer multimodal que procesa entradas de texto e imagen y genera texto, con arquitecturas tanto Dense como MoE. La variante que nos ocupa presenta un total de 25.805.933.872 parametros, de los cuales aproximadamente 4.000 millones se activan por token, lo que la clasifica como MoE. Aunque la informacion disponible no detalla el corpus de entrenamiento del modelo base ni el proceso de preentrenamiento, el ajuste posterior se centra exclusivamente en la tecnica de abliteracion aplicada con Heretic v2.0.0.dev0+custom.

El proceso de abliteracion se aplica sobre las capas 12 a 20 del modelo y actua sobre los componentes `attn.o_proj` y `mlp.down_proj`. Los parametros utilizados incluyen un `preserve_good_behavior_weight` de 1.0 y un `steer_bad_behavior_weight` de 0.0001, lo que indica una intervencion agresiva para reducir el comportamiento de rechazo mientras se intenta mantener la calidad de generacion. Otras configuraciones relevantes son un `lora_rank` de 128 y un `max_weight_change` de 1.0. El autor reporta una divergencia KL de 0.0101 respecto al modelo original, lo que sugiere que la modificacion introduce cambios limitados en la distribucion de salida, aunque suficientes para eliminar los rechazos en el conjunto de pruebas utilizado.

## Capacidades

- Generacion de texto, razonamiento y codigo, heredadas del modelo base Gemma 4.
- Multimodalidad: acepta imagenes y texto como entrada y genera texto como salida.
- Razonamiento configurable (thinking mode) segun la model card del modelo base.
- Soporte multilingue en mas de 140 idiomas, conservado tras la abliteracion.
- Sin alineacion de seguridad: la evaluacion del autor registra 0 rechazos (refusals) en 100 prompts, frente a los 100/100 del modelo original.
- Soporte de tool calling / function calling: no especificado en la documentacion disponible para esta variante; habria que consultar la documentacion oficial de Gemma 4 para confirmar si el modelo base lo incluye.

## Casos de uso

- Investigacion en alineacion y seguridad de modelos: el modelo se puede comparar con la version original para estudiar como la abliteracion de las capas 12-20 reduce los rechazos y que efectos colaterales produce sobre el comportamiento general.
- Red-teaming de sistemas de moderacion: al generar contenido que supera los filtros convencionales, sirve como herramienta para probar clasificadores, pipelines de moderacion y API de validacion de contenido en entornos controlados.
- Analisis de interpretabilidad: ejecutando el modelo con instrumentacion intermedia, se puede analizar como los componentes `attn.o_proj` y `mlp.down_proj` de las capas alteradas codifican la negativa o el rechazo, lo que es util en estudios de mecanistica interpretability.
- Generacion de datos para deteccion de contenido danino: este modelo permite obtener respuestas sin restricciones para crear conjuntos de datos etiquetados destinados a entrenar clasificadores de contenido inseguro o para evaluar la robustez de sistemas de moderacion.
- Evaluacion de sesgos y comportamiento discriminatorio: al eliminar los filtros de alineacion, es posible identificar sesgos latentes del modelo base de forma mas directa, lo que resulta relevante en investigacion de equidad y justicia algoritmica.
- Prototipado creativo en sandbox: en un entorno aislado, con supervision humana y sin exposicion publica, se puede utilizar para explorar generacion de contenido libre en terminos de estilo o tematica, aunque con la advertencia explicita de no desplegarlo en servicios de cara al usuario.

## Benchmarks y rendimiento

El autor no ha publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, Tulu, etc.) en la informacion disponible. La unica evaluacion incluida en la model card es la comparacion de rechazos y divergencia KL:

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Refusals | 0/100 | 100/100 |
| KL divergence | 0.0101 | 0 (por definicion) |

No se han publicado resultados de benchmarks de capacidad general en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en half-precision (bf16/fp16), se requieren aproximadamente 52 GB de VRAM para cargar todos los parametros. Con cuantizacion GGUF Q4_0, los pesos ocupan entre 13 y 15 GB, mas el overhead de KV cache y activaciones.
- GPU recomendadas: A100 80GB o H100 80GB para ejecucion completa sin cuantizar. Para versiones cuantizadas, una RTX 4090 (24GB) es viable, aunque con poco margen.
- Compatibilidad con GPUs de consumo: si, con cuantizacion Q4_0 se puede ejecutar en una RTX 4090 o RTX 3090 (24GB) utilizando offloading parcial de capas. GPUs de 12GB o 16GB no son recomendables sin tecnicas agresivas de compresion.
- Opciones de despliegue: Transformers, vLLM, llama.cpp, Ollama y TGI. El repositorio incluye la etiqueta `endpoints_compatible`, lo que indica compatibilidad con endpoints de inferencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Refusals | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OS-Software/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic-v2 | 25.8B (4B activos) | 256K | 0/100 | Apache 2.0 | HuggingFace |
| google/gemma-4-26B-A4B-it-qat-q4_0-unquantized | 25.8B (4B activos) | 256K | 100/100 | Apache 2.0 | HuggingFace |
| OS-Software/gemma-4-26B-A4B-it-qat-q4_0-unquantized-heretic-ja | 25.8B (4B activos) | 256K | 0/100 | Apache 2.0 | HuggingFace |

La comparacion se limita a las variantes de abliteracion y al modelo original, ya que no se dispone de benchmarks de capacidad mas amplios en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo ha sido sometido a una reduccion sustancial de su alineacion de seguridad, lo que aumenta significativamente la probabilidad de generar contenido danino, sesgado, ofensivo o inapropiado, tal y como advierte el propio autor en la model card.
- La model card desaconseja explicitamente su despliegue en servicios publicos o de cara al usuario. Esta orientado exclusivamente a investigacion y experimentacion, incluyendo estudios de seguridad, alineacion y red-teaming.
- Todas las salidas deben tratarse como no confiables y verificarse de forma independiente antes de cualquier uso, especialmente si se extrapolan a otros contextos.
- No se han publicado evaluaciones independientes sobre sesgos, alucinaciones, comportamiento multilingue o rendimiento en tareas especificas para esta variante concreta.
- Aunque la licencia Apache 2.0 permite el uso comercial, el autor rechaza el despliegue publico y no asume responsabilidad alguna por los danos o consecuencias legales derivadas del uso. El usuario es responsable de cumplir con las leyes, regulaciones y estandares eticos aplicables.
- La metadata de HuggingFace no especifica los idiomas soportados ni ofrece benchmarks de capacidades generales.

## Enlaces

- Repositorio del modelo: https://huggingface.co/OS-Software/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic-v2
- Modelo base original: https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized
- Variante heretic para japonés: https://huggingface.co/OS-Software/gemma-4-26B-A4B-it-qat-q4_0-unquantized-heretic-ja
- Variante GGUF heretic: https://huggingface.co/OS-Software/gemma-4-26B-A4B-it-qat-q4_0-heretic-ja-GGUF
- Coleccion Gemma 4 QAT en HuggingFace: https://huggingface.co/collections/google/gemma-4-qat-q4-0
- Proyecto Heretic: https://heretic-project.org
- GitHub de p-e-w: https://github.com/p-e-w
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Documentacion de Gemma: https://ai.google.dev/gemma/docs/core
- Blog de lanzamiento de Gemma 4 QAT: https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- Reporte tecnico: https://arxiv.org/abs/2607.02770
