# parkaipro/qwen3-1.7b-gyeongsang

## Resumen

`parkaipro/qwen3-1.7b-gyeongsang` es un modelo de generacion de texto derivado de la familia Qwen3, publicado en Hugging Face por el usuario `parkaipro`. El identificador sugiere un ajuste fino (fine-tuning) del modelo base Qwen3 de 1.700 millones de parametros orientado al dialecto gyeongsang (경상도), una de las variantes regionales del coreano hablado en el sureste de la peninsula (Busan, Daegu, Ulsan y alrededores). Se trata, por tanto, de un modelo de nicho linguistico: un LLM pequeno especializado en una variante dialectal concreta.

El repositorio contiene pesos en formato safetensors compatibles con la libreria `transformers`, con un total de 1.720.574.976 parametros reales (aproximadamente 1,7 mil millones) y un tamano de repositorio de 3,5 GB, lo que es coherente con pesos en precision bf16/fp16. El pipeline declarado es `text-generation` y los tags incluyen `conversational`, `text-generation-inference` y `endpoints_compatible`, lo que indica que puede desplegarse mediante TGI o endpoints compatibles con la API de Hugging Face.

La relevancia de este modelo es limitada pero concreta: demuestra el uso de fine-tuning sobre modelos pequenos para preservar y generar variantes dialectales del coreano, un caso de uso poco cubierto por los modelos generalistas. La model card esta practicamente vacia (plantilla autogenerada por Hugging Face sin rellenar), por lo que la mayor parte de los datos tecnicos (datos de entrenamiento, licencia, idiomas, benchmarks) no estan disponibles. El modelo registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3, segun tags) |
| Parametros totales | 1.720.574.976 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE segun el tamano) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos originales en safetensors; cuantizacion GGUF/AWQ no publicada por el autor) |
| Idiomas soportados | no disponible (el identificador sugiere coreano, dialecto gyeongsang) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia Qwen3, tal como indican los tags del repositorio (`qwen3`). Con 1.720.574.976 parametros, se corresponde con la variante densa de 1,7B de Qwen3. No se dispone de informacion sobre el numero de capas, dimensiones ocultas, cabezas de atencion ni sobre el mecanismo de atencion exacto (GQA, atencion lineal u otras optimizaciones presentes en la familia Qwen3).

Respecto al entrenamiento, la model card no aporta ningun dato: no se especifica el numero de tokens de fine-tuning, la composicion del dataset dialectal, si se empleo RLHF, DPO o SFT supervisado, ni los hiperparametros utilizados. El nombre `gyeongsang` sugiere que el ajuste se realizo sobre un corpus en dialecto gyeongsang, pero no hay documentacion que lo confirme. Tampoco se indica el checkpoint exacto de Qwen3 del que parte ni si se aplicaron tecnicas como LoRA o full fine-tuning.

## Capacidades

- Generacion de texto conversacional en coreano, presumiblemente con sesgo hacia el dialecto gyeongsang por el fine-tuning.
- Generacion de texto general heredada del modelo base Qwen3-1.7B (razonamiento basico, codigo, matematicas a escala de 1,7B).
- Soporte de conversacion multi-turno (tag `conversational`).
- Compatibilidad con `text-generation-inference` y endpoints compatibles con la API de Hugging Face.
- Tool calling / function calling: no disponible (no documentado; el modelo base Qwen3 lo soporta, pero no se confirma en este fine-tuning).
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas en la model card).
- Capacidades especiales (vision, audio, modo thinking): no disponible.

## Casos de uso

- Generacion de dialogos en dialecto gyeongsang para doblaje o subtitulado: el modelo puede producir lineas de guion en la variante regional, util para producciones audiovisuales ambientadas en Busan o Daegu.
- Chatbots de atencion al cliente para empresas del sureste de Corea: un asistente que responda en el dialecto local puede mejorar la cercania percibida por usuarios mayores o de zonas rurales.
- Preservacion linguistica y corpus dialectales: generacion de texto sintetico en gyeongsang para enriquecer datasets de investigacion en linguistica coreana.
- Prototipado rapido en local: con 1,7B de parametros, el modelo cabe en GPU de consumo (por ejemplo, RTX 3060/4060 en cuantizacion de 8 bits) y permite iterar sin infraestructura cloud.
- Educacion y divulgacion del dialecto: aplicaciones que expliquen diferencias entre coreano estandar y gyeongsang mediante ejemplos generados.
- Investigacion sobre fine-tuning dialectal: sirve como referencia para estudiar como un modelo pequeno adapta su estilo a una variante regional y cuanto retiene del modelo base.
- Traduccion estilistica coreano estandar a gyeongsang: adaptacion de textos para hacerlos mas naturales en contextos regionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion rellenada ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 3,5 GB solo para pesos, mas overhead de activaciones y cache KV (estimacion tipica de 5-6 GB para contextos moderados).
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 2 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 1 GB de pesos.
- GPU recomendadas: cualquier GPU con 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 4070) para bf16; A10G, L4 o A100 para despliegue en servidor.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 8 GB o mas; incluso en 4 bits podria ejecutarse en GPUs con 4-6 GB.
- Opciones de despliegue: `transformers` (nativo), `text-generation-inference` (TGI), vLLM, llama.cpp/Ollama (previa conversion a GGUF, no publicada por el autor), endpoints de Hugging Face.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| parkaipro/qwen3-1.7b-gyeongsang | 1,72B | no disponible | no disponible | Fine-tuning dialectal (gyeongsang) |
| Qwen/Qwen3-1.7B (base) | 1,7B | no disponible en esta ficha | Apache 2.0 (segun familia Qwen3) | Modelo generalista |
| Modelos dialectales coreanos publicos | no disponible | no disponible | no disponible | No se dispone de alternativas documentadas en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre este modelo y el base, ni de otros fine-tunings dialectales del coreano con los que contrastarlo.

## Limitaciones y advertencias

- Model card vacia: no hay documentacion sobre datos de entrenamiento, sesgos, evaluacion ni uso previsto; esto dificulta cualquier evaluacion de calidad.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; hay que contactar con el autor antes de usarlo en produccion.
- Riesgo de alucinacion: como cualquier LLM de 1,7B, la tasa de alucinacion es alta, especialmente en tareas de conocimiento factual.
- Capacidad limitada por tamano: 1,7B parametros restringen el razonamiento complejo, las matematicas avanzadas y el codigo frente a modelos de mayor escala.
- Posible sobreajuste al dialecto: el fine-tuning puede degradar el rendimiento en coreano estandar o en otros idiomas si el corpus dialectal era pequeno.
- Idiomas no declarados: no se confirma el soporte de castellano ni de otros idiomas distintos del coreano.
- Sin cuantizaciones publicadas: no hay GGUF ni AWQ oficiales, lo que obliga a convertirlas manualmente para despliegue en llama.cpp/Ollama.
- Cero adopcion: 0 descargas y 0 likes implican ausencia de validacion por parte de la comunidad; no hay evidencia externa de calidad.
- Fecha de creacion futura en los metadatos (2026-11-17): puede indicar un error de configuracion del repositorio o una fecha de sistema incorrecta; conviene verificarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/parkaipro/qwen3-1.7b-gyeongsang
- Paper de referencia citado en la model card (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
- Familia Qwen3 (modelo base, referencia): https://huggingface.co/Qwen
