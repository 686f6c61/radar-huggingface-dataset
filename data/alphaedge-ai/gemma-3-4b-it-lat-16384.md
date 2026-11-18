# alphaedge-ai/gemma-3-4b-it-lat-16384

## Resumen

`alphaedge-ai/gemma-3-4b-it-lat-16384` es una variante recortada (trimmed) del modelo multimodal `google/gemma-3-4b-it` de Google, publicada por el usuario alphaedge-ai. La intervencion no consiste en un reentrenamiento ni en un fine-tuning, sino en una reduccion del vocabulario del tokenizer: se pasa de 262.144 tokens a 16.384, eliminando los tokens poco frecuentes en latin. El resultado es un modelo un 14,63% mas pequeno en parametros (3.670.770.032 frente a 4.300.079.472) y con una huella de memoria notablemente inferior.

El modelo conserva la arquitectura original de Gemma 3 (transformer decoder-only con atencion multimodal imagen-texto) y el contexto nativo de la familia, pero su vocabulario queda practicamente restringido al latin. Segun la model card, el rendimiento deberia ser similar al original en esa lengua, aunque degradara su comportamiento en cualquier otro idioma, ya que los tokens no presentes en el corpus de minado han sido eliminados.

Es relevante para quienes necesitan desplegar un modelo Gemma 3 de 4B en entornos con VRAM ajustada y cuyo caso de uso sea exclusivamente latin (procesamiento de textos clasicos, humanidades digitales, investigacion linguistica). No es un modelo de proposito general: la reduccion del vocabulario lo inutiliza para la mayoria de idiomas modernos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (Gemma 3), derivado de google/gemma-3-4b-it |
| Parametros totales | 3.670.770.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Gemma 3 4B IT) |
| Tipos de cuantizacion | no disponible (repo en safetensors con `torch_dtype="auto"`); compatible con cuantizacion estandar de transformers |
| Idiomas soportados | latin (la) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 7,3 GB |
| Vocabulario | 16.384 tokens (original: 262.144; reduccion del 93,75%) |
| Dataset de minado | lbourdois/fineweb-2-trimming (200.000 textos) |
| Libreria | transformers |
| Pipeline | text-generation (tambien image-text-to-text por herencia) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-4b-it`, un transformer decoder-only de la familia Gemma 3 con capacidad multimodal imagen-texto. Sobre esa base no se ha realizado ningun entrenamiento adicional: la unica transformacion es el recorte del vocabulario mediante la tecnica de trimming descrita en el blog de Hugging Face "Introduction to Trimming". El proceso identifica los tokens del tokenizer original que no aparecen (o aparecen con muy baja frecuencia) en un corpus de 200.000 textos en latin procedentes del dataset `lbourdois/fineweb-2-trimming`, y elimina las filas correspondientes de la matriz de embeddings y de la capa de salida (LM head), reduciendo el vocabulario de 262.144 a 16.384 entradas.

No se documentan en la informacion disponible detalles sobre el numero de tokens de entrenamiento original de Gemma 3, la composicion completa del dataset ni las etapas de RLHF/DPO del modelo base; esos datos corresponden al informe tecnico de Gemma 3 (arXiv:2503.19786) y no se reproducen aqui. La innovacion tecnica del modelo es, por tanto, exclusivamente la reduccion de vocabulario: no hay decodificacion especulativa, atencion lineal ni modificaciones arquitectonicas propias. El ahorro de parametros (unos 629 millones) procede casi integramente de las matrices de embedding y de la LM head, que escalan con el tamano del vocabulario.

## Capacidades

- Generacion de texto conversacional en latin, con plantilla de chat via `apply_chat_template`.
- Razonamiento y generacion de texto general, heredados del modelo base Gemma 3 4B IT, en la medida en que el vocabulario recortado lo permita.
- Capacidad multimodal imagen-texto por herencia del modelo base (tag `image-text-to-text`), aunque la model card no documenta ni valida este uso tras el trimming.
- Soporte de tool calling / function calling: no documentado en la informacion disponible para esta variante.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: limitadas al latin; el propio autor advierte que el modelo puede no funcionar bien en otros idiomas.
- Capacidad especial de "thinking mode": no documentada en la informacion disponible.

## Casos de uso

- Procesamiento de textos clasicos y humanidades digitales: el modelo puede generar resumenes, traducciones explicativas o comentarios sobre pasajes en latin, aprovechando que su vocabulario esta optimizado para esa lengua y reduciendo el coste de inferencia frente al Gemma 3 original.
- Investigacion linguistica sobre latin: util para tareas de normalizacion, lematizacion asistida o generacion de variantes textuales en corpus latinos, donde el vocabulario recortado cubre la practica totalidad de los tokens relevantes.
- Despliegue en hardware con VRAM limitada: al tener un 14,63% menos de parametros y un vocabulario 93,75% menor, cabe en GPUs de consumo que el modelo base no aprovecharia con la misma holgura, siempre que el caso de uso sea en latin.
- Generacion de material didactico de latin: creacion de ejercicios, glosas o textos de practica a partir de indicaciones en latin, con la ventaja de un modelo mas ligero para servir en un entorno educativo.
- Prototipado rapido de pipelines de NLP en latin: integracion en flujos de transformers con `device_map="auto"` para experimentar con generacion condicionada por chat antes de invertir en modelos mayores.
- Filtrado y clasificacion de corpus latinos: uso como generador auxiliar para etiquetar o reescribir fragmentos de un corpus, con un coste de memoria inferior al del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta la comparativa de tamano (vocabulario y parametros) frente al modelo original, sin metricas de calidad (MMLU, HumanEval, GSM8K u otras).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia, el repo pesa 7,3 GB en safetensors, lo que sugiere que en fp16 el modelo ocupa del orden de 7,3 GB de pesos; en cuantizacion de 8 bits o 4 bits la huella se reduce aproximadamente a la mitad o a un cuarto, respectivamente.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano (3,67B parametros), es desplegable en GPUs de consumo con suficiente VRAM; el modelo base de 4,3B ya es apto para GPUs de gama alta de consumo.
- Cabe en GPU de consumo: previsiblemente si, en funcion de la cuantizacion y de la longitud de contexto; no se aportan cifras concretas.
- Opciones de despliegue: transformers (documentado en la model card), text-generation-inference (tag `text-generation-inference`), y por compatibilidad con el ecosistema Gemma, herramientas como vLLM o llama.cpp, aunque no se confirma su soporte en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| alphaedge-ai/gemma-3-4b-it-lat-16384 | 3.670.770.032 | 16.384 | no disponible | latin | gemma | Hugging Face |
| google/gemma-3-4b-it | 4.300.079.472 | 262.144 | no disponible en la informacion | multilingue | gemma | Hugging Face |
| Otras variantes trimmed de Gemma 3 4B IT | no disponible | no disponible | no disponible | segun variante | gemma | no disponible |

La comparativa directa mas relevante es con el modelo base: la variante trimmed reduce parametros un 14,63% y vocabulario un 93,75%, a cambio de perder cobertura multilingue. No se dispone de datos de rendimiento comparado en benchmarks.

## Limitaciones y advertencias

- El vocabulario recortado elimina tokens no frecuentes en latin; el modelo puede fallar o degradarse gravemente en cualquier otro idioma, incluido el castellano.
- Riesgo de alucinacion inherente a los modelos generativos; no se documenta mitigacion especifica en esta variante.
- No se han publicado evaluaciones de sesgo ni de seguridad para esta variante trimmed.
- La licencia es la Gemma Terms of Use, heredada del modelo base; el uso comercial esta sujeto a dichos terminos y el modelo no esta afiliado ni respaldado por Google.
- El tag `image-text-to-text` sugiere capacidad multimodal, pero la model card no valida el comportamiento de vision tras el trimming; conviene tratarlo como no garantizado.
- No se documentan la longitud de contexto efectiva, el soporte de tool calling ni el rendimiento en tareas de codigo o matematicas para esta variante.
- El numero de descargas (15) y de likes (0) indica una adopcion muy baja; no hay evidencia comunitaria de calidad en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/gemma-3-4b-it-lat-16384
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog "Introduction to Trimming": https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Informe tecnico de Gemma 3: https://arxiv.org/abs/2503.19786
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
