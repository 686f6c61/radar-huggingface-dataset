# Edoigtrd/Mirave-4.2B-xlm-roberta-xl

## Resumen

Mirave 4.2B es un adaptador PEFT construido sobre el encoder multilingue `facebook/xlm-roberta-xl` que implementa una **cabeza de decision tipada** con un *pointer head*. Dado un contexto (`state`), una `question` y una lista de `options`, devuelve una distribucion de probabilidad calibrada sobre esas opciones en un unico forward pass. No genera texto ni usa una capa de salida de tamano fijo: el numero de opciones a puntuar no tiene limite superior, y las mismas pesos puntuan 2 o 20 alternativas sin reentrenar ni rellenar la capa de salida. Lo desarrolla el usuario Edoigtrd como reproduccion abierta de Jev, el "System One Model" de TypeSafe AI, cuyos pesos y metodologia de entrenamiento no son publicos.

El modelo combina tres piezas: un backbone XLM-RoBERTa-XL congelado de 3,48B parametros (36 capas, hidden size 2560), un conjunto de adaptadores LoRA (rank 16, alpha 32, dropout 0.05) aplicados a `query`/`key`/`value`/`dense` en cada bloque de atencion y feed-forward (~26,6M parametros), y una tabla de embeddings de tokens ajustada por completo (~640,0M parametros). Sobre ese conjunto se anade un `PointerHead` de ~13,1M parametros con dos proyecciones `Linear(2560, 2560)`. El total cargado ronda los 4,16B parametros, de los cuales ~679,8M son entrenables.

Es relevante porque propone una alternativa a los dos patrones habituales para "elegir entre N opciones": la clasificacion con cabeza de tamano fijo (que obliga a reentrenar si cambia el numero de clases) y la generacion autoregresiva del texto de la opcion (lenta y cuya probabilidad no es una distribucion limpia sobre el conjunto candidato). El entrenamiento completo las 3 epocas (7.419 pasos) sin divergencia, y los pesos publicados corresponden al checkpoint `best` por perdida de validacion en el paso 7.250/7.419. El repositorio acumula 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (XLM-RoBERTa-XL, preentrenado con MLM) + `PointerHead` con proyecciones query/key, sobre adaptadores LoRA |
| Parametros totales | ~4,16B cargados (3,48B de backbone congelado + ~679,8M entrenables) |
| Parametros activos | No aplica (no es un modelo de mezcla de expertos) |
| Parametros del adaptador LoRA | ~26,6M (rank 16, alpha 32, dropout 0.05, sobre `query`/`key`/`value`/`dense` en cada bloque de atencion y feed-forward) |
| Parametros de la tabla de embeddings | ~640,0M (ajuste completo, no LoRA) |
| Parametros de la cabeza | ~13,1M (`PointerHead`: dos `Linear(2560, 2560)` para query y key) |
| Capas del backbone | 36 |
| Dimensión oculta | 2560 |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (la model card no documenta cuantizaciones; pesos en safetensors) |
| Idiomas soportados | Multilingue (capacidad heredada del preentrenamiento de XLM-R en 100 idiomas); etiquetas del repositorio: `multilingual`, `en`. La cobertura real del conjunto de fine-tuning no se detalla en el extracto disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT + cabeza) |
| Modelo base | `facebook/xlm-roberta-xl` |
| Vocabulario anadido | 8 tokens especiales: `<kind>`, `</kind>`, `<state>`, `</state>`, `<question>`, `</question>`, `<opt>`, `</opt>` |
| Dataset de entrenamiento | `ZefanCai/Open-Jev` |
| Tamano del repositorio | 7,9 GB |
| Pipeline declarado | `other` |

## Arquitectura y entrenamiento

La eleccion del backbone no es accidental. `xlm-roberta-xl` es bidireccional por preentrenamiento (masked language modeling, no causal), lo que permite que cada opcion vea el contexto completo y todas las demas opciones a traves de la misma self-attention, sin asimetria de orden entre "la primera opcion" y "la ultima". Un decoder causal no tiene esa propiedad sin cirugia arquitectonica. La entrada se serializa como una secuencia plana: `<s> <kind>choice</kind> <state>...</state> <question>...</question> <opt>option A</opt> <opt>option B</opt> ... </s>`. Se reutiliza un unico par `<opt>`/`</opt>` para todas las opciones, sin tokens `<opt1>`, `<opt2>`, etc., de modo que el modelo no puede aprender un atajo que correlacione el rango de una opcion con su probabilidad de ser correcta y el numero de opciones no queda incrustado en el vocabulario ni en los pesos. El token `<s>` se usa como primer token porque su embedding ya es significativo tras el preentrenamiento.

En el forward pass, el estado oculto en `<s>` (posicion 0) se proyecta a un vector **query**; el estado oculto en el `</opt>` de cada opcion se proyecta a un vector **key**; el logit de cada opcion es el producto escalar de query por su key; y un softmax sobre los logits validos (excluyendo padding) produce la distribucion de salida. Como el numero de logits es simplemente el numero de tokens `</opt>` presentes en el prompt, la misma parametrizacion puntua 2 o 20 opciones sin reentrenar ni rellenar la capa de salida.

En cuanto a la receta de entrenamiento, el backbone permanece congelado y se entrenan los adaptadores LoRA, la tabla de embeddings completa y la cabeza. Se completaron 3 epocas (7.419 pasos) con mejora esencialmente monotona de la perdida de validacion y de la exactitud top-1, sin divergencia. No se especifican en el extracto disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo fases de RLHF o DPO; dado que se trata de una cabeza de decision supervisada y no de un modelo generativo, es razonable esperar entrenamiento puramente supervisado, pero ese extremo no se confirma en la informacion proporcionada.

## Capacidades

- Decision tipada en un unico forward pass: recibe `state`, `question` y `options`, y devuelve una distribucion de probabilidad sobre las opciones.
- Numero de opciones variable sin reentrenamiento: la misma parametrizacion puntua desde 2 hasta un numero arbitrario de alternativas (20 en los ejemplos de la model card).
- Simetria entre opciones: al reutilizar el mismo par `<opt>`/`</opt>` y usar atencion bidireccional, no hay sesgo de posicion aprendido.
- Probabilidades calibradas: el softmax sobre logits validos produce una distribucion normalizada, apta para umbralizar o comparar (etiqueta `calibration` del repositorio).
- Enrutamiento (routing): la salida puede interpretarse como seleccion de una rama o especialista entre varias opciones declaradas.
- Capacidad multilingue heredada del preentrenamiento de XLM-R en 100 idiomas, con las reservas sobre la cobertura real del fine-tuning.
- No genera texto: la salida es exclusivamente la distribucion sobre las opciones proporcionadas.
- No se documenta soporte de tool calling / function calling nativo ni orquestacion de agentes multi-paso; el modelo puede actuar como componente de decision dentro de un agente, pero no como agente por si mismo.
- No se documentan capacidades de vision, audio ni modo "thinking".

## Casos de uso

- Enrutamiento de consultas en sistemas multi-agente: se declara como `state` el historial de conversacion y como `options` los especialistas disponibles (`sql`, `rag`, `calculo`, `chitchat`); el modelo devuelve en un solo paso la probabilidad de cada uno y el orquestador envia la peticion al que supere el umbral. Adecuado porque el numero de especialistas puede cambiar en caliente sin reentrenar la cabeza.
- Clasificacion de intenciones con taxonomia variable: en lugar de mantener un clasificador de tamano fijo por cliente, se enumeran las etiquetas como opciones en la propia peticion, lo que permite anadir o retirar categorias por configuracion.
- Triaje de tickets de soporte: el `state` es el cuerpo del ticket y las `options` son niveles de severidad o equipos responsables; la distribucion calibrada permite fijar un umbral de derivacion automatica y dejar el resto a revision humana.
- Seleccion de herramienta previa a la llamada: dado el estado del agente y la descripcion de cada herramienta como opcion, el modelo produce una probabilidad por herramienta que puede alimentar una politica de `tool routing`. Encaja porque no depende de que la herramienta se llame igual que un token del vocabulario.
- Reranking de respuestas candidatas: se toman N respuestas generadas por otro LLM, se colocan como opciones y se selecciona la de mayor probabilidad; al ser un forward pass unico y no una generacion, el coste por candidato es bajo comparado con pedir al generador que se autoevalue.
- Moderacion y etiquetado con confianza: clasificar un texto en categorias de politica como opciones y usar la probabilidad como senal de confianza para decidir entre accion automatica o revision humana.
- Decision en simulaciones y entornos con estado: elegir la siguiente accion de un conjunto discreto dado el estado del entorno, util como cabecera de politica ligera o como baseline frente a metodos de RL.
- Anotacion asistida con puntuaciones: pre-anotar conjuntos de datos de eleccion multiple o etiquetado donde interesa guardar la probabilidad completa y no solo la etiqueta ganadora.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica unicamente que hasta la fecha solo se ha evaluado el split `test` y que los numeros de `validation`, `ood` y `calibration` no se incluyen en la ficha del modelo. Los datos de rendimiento del entrenamiento se limitan a la progresion de la perdida de validacion y de la exactitud top-1 (mejora esencialmente monotona a lo largo de 3 epocas y 7.419 pasos, sin divergencia), sin valores absolutos publicados en el extracto disponible.

## Requisitos de hardware

Las cifras de VRAM que se indican a continuacion son **estimaciones derivadas del recuento de parametros (~4,16B)** y no valores publicados por el autor.

| Precision | Peso aproximado de los pesos | VRAM total estimada |
|---|---|---|
| fp32 | ~16,6 GB | ~18-20 GB |
| fp16 / bf16 | ~8,3 GB | ~10-12 GB |
| int8 | ~4,2 GB | ~6 GB |
| int4 | ~2,1 GB | ~3-4 GB |

- GPU profesionales recomendadas: A100 40/80 GB, H100, L40S, A6000. En fp16 la huella es pequena para estos aceleradores y permiten lotes grandes o varias instancias por GPU.
- GPU de consumo: cabe en una RTX 4090 (24 GB) en fp16 sin problemas; en una RTX 4080 (16 GB) en fp16 con margen ajustado, y comodamente en int8; una RTX 3080 de 10 GB requiere int8 o int4.
- Despliegue: **no** hay soporte documentado en vLLM, TGI, llama.cpp, Ollama ni en el `AutoModel.from_pretrained(...)` estandar de `transformers`, porque el `PointerHead` no es una arquitectura que `transformers` conozca de forma nativa. El autor mantiene deliberadamente el codigo y los pesos separados: este repositorio aloja los pesos y el codigo de carga vive en `github.com/edoigtrd/Mirave`.
- No se documentan cifras de latencia ni de throughput.
- Al ser un encoder de 36 capas y ~4,16B parametros con un unico forward pass por consulta (sin decodificacion autoregresiva), la latencia por decision es previsiblemente muy inferior a la de un modelo generativo de tamano comparable, pero no hay mediciones publicadas que lo confirmen.

## Comparativa con modelos similares

| Modelo | Backbone | Parametros cargados | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Mirave-4.2B-xlm-roberta-xl | `facebook/xlm-roberta-xl` | ~4,16B (3,48B congelados + ~679,8M entrenables) | No disponible | Distribucion sobre opciones, forward pass unico | MIT | Pesos publicos en HuggingFace, codigo en GitHub |
| Mirave-0.6B-xlm-roberta-large | `FacebookAI/xlm-roberta-large` | ~560M de backbone (misma cabeza y formato de prompt) | No disponible | Distribucion sobre opciones, forward pass unico | MIT | Pesos publicos en HuggingFace |
| `facebook/xlm-roberta-xl` (base) | XLM-RoBERTa-XL | ~3,5B | No disponible | Embeddings de encoder / MLM | MIT | Pesos publicos en HuggingFace |
| Jev (TypeSafe AI) | No publico | No disponible | No disponible | Decisiones tipadas, forward pass unico | No publica | Pesos y metodologia no publicos |

No se conocen en la informacion disponible otros modelos abiertos con cabeza de decision pointer sobre opciones declaradas en el prompt, mas alla de la propia familia Mirave. La comparacion con Jev es asimetrica por definicion: Mirave reproduce el comportamiento externamente observable y el objetivo de diseno, pero no los pesos ni la metodologia originales.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, resumenes, codigo ni respuestas abiertas. Solo puntua opciones que se le proporcionan.
- Ausencia total de benchmarks publicados: no hay numeros de `test`, `validation`, `ood` ni `calibration` en la model card, por lo que no es posible validar externamente la calidad ni la calibracion real de las probabilidades.
- La model card advierte que solo se ha evaluado el split `test` hasta la fecha.
- Longitud de contexto no documentada: no se indica el maximo de tokens del `state`, `question` y conjunto de opciones.
- Cobertura linguistica del fine-tuning no documentada en el extracto disponible. Aunque el backbone herede 100 idiomas del preentrenamiento de XLM-R, eso no garantiza que la cabeza de decision funcione igual de bien fuera de los idiomas representados en `ZefanCai/Open-Jev`.
- Sesgos: hereda los sesgos del corpus de preentrenamiento de XLM-R y de `ZefanCai/Open-Jev`. El autor no documenta analisis de sesgo especifico.
- Riesgo de sobreconfianza: aunque la etiqueta del repositorio es `calibration`, sin datos publicados de calibracion no se puede asumir que las probabilidades sean fiables fuera de la distribucion de entrenamiento. Conviene validar con datos propios antes de usar umbrales fijos en produccion.
- Restricciones de licencia: MIT, heredada del modelo base, lo que en principio permite uso comercial. Conviene verificar los terminos del backbone `facebook/xlm-roberta-xl` y del dataset `ZefanCai/Open-Jev` de forma independiente.
- Falta de integracion estandar: al no existir un `modeling_*.py` en el repositorio de HuggingFace ni soporte en `transformers`, vLLM, TGI, llama.cpp u Ollama, la puesta en produccion exige integrar el codigo de carga del repositorio de GitHub, lo que anade coste de mantenimiento y riesgo de deriva entre versiones.
- Adopcion nula: 0 descargas y 0 likes en el repositorio, sin validacion por parte de la comunidad.
- Es una reproduccion no oficial: el comportamiento puede diferir del de Jev en aspectos no observables externamente, y las decisiones de diseno (LoRA mas tabla de embeddings entrenable sobre un backbone bidireccional) son propias de este proyecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Edoigtrd/Mirave-4.2B-xlm-roberta-xl
- Variante menor (Mirave-0.6B-xlm-roberta-large): https://huggingface.co/Edoigtrd/Mirave-0.6B-xlm-roberta-large
- Repositorio de codigo (entrenamiento, carga y servidor de inferencia compatible con la API de Jev): https://github.com/edoigtrd/Mirave
- Modelo base: https://huggingface.co/facebook/xlm-roberta-xl
- Modelo base de la variante -large: https://huggingface.co/FacebookAI/xlm-roberta-large
- Dataset de entrenamiento: https://huggingface.co/datasets/ZefanCai/Open-Jev
- Blog de TypeSafe AI presentando Jev y los "System One Models": https://typesafe.ai/blog/introducing-system-one-models-and-jev
- Busqueda web: las consultas realizadas no han devuelto fuentes tecnicas relevantes sobre este modelo (los resultados fueron paginas genericas de Google Books, Google Earth, Google Gemini, Google Images y Google Chrome).
