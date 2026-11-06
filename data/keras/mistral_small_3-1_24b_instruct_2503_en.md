# keras/mistral_small_3.1_24b_instruct_2503_en

## Resumen

Mistral3 es el nombre que KerasHub da a la arquitectura multimodal decoder-only publicada por Mistral AI, que combina un codificador de visión de estilo Pixtral con un decodificador de texto Mistral. Este checkpoint concreto, `keras/mistral_small_3.1_24b_instruct_2503_en`, es la conversión a KerasHub del modelo Mistral Small 3.1 Instruct de 24 mil millones de parámetros publicado en marzo de 2025, con pesos en formato Keras y licencia Apache 2.0.

El modelo resuelve el problema de unificar comprensión de texto e imagen en un único transformer causal de 40 capas, con una ventana de contexto de 128 000 tokens y el tokenizador Tekken de 131 000 entradas. Es relevante porque permite a los usuarios de Keras 3 (sobre JAX, TensorFlow o PyTorch) cargar y ajustar un modelo multimodal de 24B sin salir del ecosistema Keras, algo que hasta ahora requería recurrir a `transformers` o a vLLM.

La ficha se centra en el checkpoint de KerasHub, pero los datos técnicos proceden de la model card original de Mistral AI enlazada desde el repositorio, ya que la model card de KerasHub reutiliza esa información.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (Pixtral vision encoder + Mistral text decoder) |
| Parametros totales | 24,01 B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 000 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el ejemplo de la model card carga en `bfloat16`) |
| Idiomas soportados | Docenas, incluyendo ingles, frances, aleman, espanol, portugues, italiano, japones, coreano, ruso, chino, arabe e hindi |
| Licencia | Apache 2.0 (pesos); codigo Keras bajo Apache 2.0 |
| Formato de pesos | Keras (pesos nativos KerasHub); tamano del repo 48,9 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 40 capas con 24,01 mil millones de parametros, acoplado a un codificador de vision de estilo Pixtral que procesa imagenes y las proyecta al espacio de tokens del decodificador de texto. El modelo usa el tokenizador Tekken con un vocabulario de 131 000 entradas y admite una ventana de contexto de 128 000 tokens, lo que permite introducir documentos largos o multiples imagenes en una misma conversacion. La model card no detalla el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esa informacion no esta disponible en los materiales proporcionados.

La innovacion principal del checkpoint de KerasHub no esta en el modelo en si, sino en la implementacion: es una conversion de los pesos originales de Mistral AI a la API de KerasHub (`Mistral3CausalLM`, `Mistral3Backbone`, `Mistral3Tokenizer`), lo que permite ejecutar el modelo sobre cualquiera de los backends de Keras 3 (JAX, TensorFlow, PyTorch) y ajustarlo con `fit()`. La model card menciona que Mistral Small 3.2 (version 2506) es una actualizacion menor de 3.1 con mejor seguimiento de instrucciones, menos generaciones repetitivas y una plantilla de function calling mas robusta; el checkpoint de esta ficha es la version 3.1 (2503).

## Capacidades

- Generacion de texto conversacional multi-turno con formato de prompt `[INST] ... [/INST]`.
- Comprension de imagenes: acepta una o varias imagenes por prompt mediante marcadores `[IMG]`, con una lista de imagenes por cada prompt.
- Razonamiento sobre documentos largos gracias a la ventana de 128 000 tokens.
- Function calling y salida en JSON, segun la model card original de Mistral AI.
- Razonamiento en programacion y matematicas (indicado en la model card como uso previsto).
- Capacidades multilingues en docenas de idiomas, incluyendo espanol, frances, aleman, portugues, italiano, japones, coreano, ruso, chino, arabe e hindi.
- Generacion por lotes (batched prompts) y muestreo configurable (greedy, top-k con temperatura).
- Ajuste fino supervisado mediante `fit()` sobre el backbone o el modelo causal completo.

## Casos de uso

- Atencion al cliente multimodal: el modelo puede gestionar conversaciones multi-turno con contexto largo (128k tokens) e incorporar capturas de pantalla o fotos del producto enviadas por el usuario, respondiendo en el mismo hilo.
- Extraccion de datos de documentos escaneados: introducir una imagen de una factura o un formulario junto con instrucciones en `[INST]` para obtener una salida JSON estructurada, aprovechando la capacidad de function calling y salida JSON descrita en la model card.
- Asistente de programacion en produccion: integrado en un pipeline de CI/CD o en un IDE, el modelo puede generar parches, explicar errores y llamar a herramientas mediante function calling; su contexto de 128k permite incluir varios ficheros de un repositorio en la misma peticion.
- Analisis de documentos legales o academicos: resumir contratos, articulos o informes de decenas de miles de tokens en una sola pasada sin trocear el texto, con salida en el idioma del usuario.
- Investigacion y ajuste fino en Keras: cargar `Mistral3Backbone` o `Mistral3CausalLM` con `from_preset()` y ajustar sobre un dataset propio con `fit()`, aprovechando la portabilidad entre JAX, TensorFlow y PyTorch de Keras 3.
- Traduccion y localizacion multilingue: al cubrir docenas de idiomas, incluido el espanol, puede emplearse para traducir documentacion tecnica o contenido de producto manteniendo el contexto completo del documento.
- Descripcion y etiquetado automatico de imagenes: usar el marcador `[IMG]` para generar descripciones, etiquetas o metadatos de imagenes en lote dentro de un pipeline de gestion de activos digitales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de KerasHub remite a la model card original de Mistral AI (`mistralai/Mistral-Small-3.1-24B-Instruct-2503`) para consultar benchmarks, fuentes de datos y casos de uso previstos, pero esos datos no se incluyen en los materiales proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia en `bfloat16`: aproximadamente 48 GB solo para los pesos (24,01B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomienda al menos 60-80 GB de VRAM para contexto largo.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 24 GB solo para pesos; en 4 bits, alrededor de 12-14 GB, aunque la model card no detalla que formatos de cuantizacion estan soportados en KerasHub.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para `bfloat16` con contexto completo; multiples RTX 4090 (24 GB) en paralelo o una RTX 6000 Ada (48 GB) para `bfloat16` con contexto reducido.
- En GPU de consumo: cabe en una RTX 4090 de 24 GB solo si se cuantiza a 8 o 4 bits y se reduce el contexto; en `bfloat16` no cabe en una sola GPU de consumo.
- Opciones de despliegue: KerasHub sobre JAX, TensorFlow o PyTorch; la model card no menciona integracion directa con vLLM, llama.cpp, Ollama o TGI para este checkpoint concreto, aunque los pesos originales de Mistral Small 3.1 si estan soportados por esas herramientas.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `keras/mistral_small_3.1_24b_instruct_2503_en` (este) | 24,01 B | 128k | Texto + imagen | Apache 2.0 | KerasHub |
| `mistralai/Mistral-Small-3.1-24B-Instruct-2503` | 24 B | 128k | Texto + imagen | Apache 2.0 | Hugging Face (`transformers`) |
| `keras/mistral_small_3.2_24b_instruct_2506_en` | 24,01 B | 128k | Texto + imagen | Apache 2.0 | KerasHub |
| `mistral_small_3.1_24b_base_2503_en` | 24,01 B | 128k | Texto + imagen | Apache 2.0 | KerasHub |

La diferencia principal entre este checkpoint y el original de Mistral AI es el formato de pesos y el runtime: el de KerasHub se carga con `from_preset()` y se ejecuta sobre los backends de Keras 3, mientras que el original requiere `transformers`. La version 3.2 (2506) incorpora mejor seguimiento de instrucciones, menos repeticiones y una plantilla de function calling mas robusta segun la model card.

## Limitaciones y advertencias

- La model card de KerasHub no documenta sesgos conocidos ni evaluaciones de seguridad; se desconoce el comportamiento del modelo en dominios sensibles.
- Riesgo de alucinacion inherente a los modelos generativos de 24B; la model card no proporciona tasas de alucinacion ni evaluaciones de fidelidad.
- El checkpoint esta etiquetado `_en` y la model card lo describe como orientado a ingles; aunque soporta docenas de idiomas, el rendimiento en espanol no esta cuantificado en la informacion disponible.
- Aunque los pesos son Apache 2.0, conviene revisar los terminos de la model card original de Mistral AI para confirmar condiciones de uso comercial y atribucion.
- El repositorio tiene 48,9 GB, lo que exige almacenamiento y ancho de banda considerables; la carga en `bfloat16` necesita al menos 48 GB de VRAM.
- La model card advierte de que los checkpoints se estaban subiendo en el momento de su publicacion ("Checkpoints are being uploaded"), por lo que la disponibilidad de algunos presets puede ser incompleta.
- El ejemplo de la model card con URI de Hugging Face (`hf://`) aparece truncado, por lo que no se puede confirmar el formato exacto de carga remota.
- No se documentan en la informacion proporcionada los formatos de cuantizacion soportados por KerasHub para este checkpoint.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/keras/mistral_small_3.1_24b_instruct_2503_en
- Model card original de Mistral AI: https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Instruct-2503
- Anuncio de Mistral Small 3.1: https://mistral.ai/news/mistral-small-3-1
- KerasHub Getting Started: https://keras.io/guides/keras_hub/getting_started/
- KerasHub Model Publishing Guide: https://keras.io/guides/keras_hub/upload/
- Keras: https://keras.io/
- Keras 3: https://keras.io/keras_3/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia del codigo KerasHub: https://github.com/keras-team/keras-hub/blob/master/LICENSE
- PR de KerasHub con los presets registrados: KerasHub PR #3020 (referenciado en la model card, sin URL directa en la informacion proporcionada)
