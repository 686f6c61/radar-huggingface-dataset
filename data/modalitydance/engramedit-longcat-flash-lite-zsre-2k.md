# ModalityDance/EngramEdit-LongCat-Flash-Lite-zsRE-2K

## Resumen

EngramEdit es un metodo de edicion de conocimiento para modelos de lenguaje que actualiza la memoria condicional (embeddings de n-gramas aprendidos) manteniendo congelado el backbone Transformer. Este checkpoint concreto, publicado por ModalityDance, contiene las actualizaciones de memoria condicional resultantes de aplicar 2.000 ediciones del dataset ZsRE sobre el modelo base LongCat-Flash-Lite de Meituan. No es un modelo autonomo: es un fichero de estado que debe cargarse junto al modelo base para que las ediciones surtan efecto.

La relevancia de este checkpoint reside en que plantea una via alternativa a los finetunes tradicionales para inyectar o corregir hechos. Al actualizar solo las representaciones de memoria condicional en lugar de los pesos del Transformer, los hechos revisados siguen siendo utilizables en distintas formulaciones y en razonamiento multi-salto, mientras que el conocimiento no relacionado y las capacidades generales del modelo base se preservan en gran medida. El repositorio tiene licencia MIT y el modelo base se distribuye por separado bajo su propia licencia.

En el momento de la consulta, el repositorio registra 0 descargas y 0 likes, con un tamano de 0,0 GB, lo que confirma que contiene unicamente el fichero de estado y no pesos completos. La informacion publica no detalla la arquitectura interna de LongCat-Flash-Lite, el numero de parametros ni la longitud de contexto soportada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoint de memoria condicional sobre el backbone Transformer de LongCat-Flash-Lite) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT (el modelo base se distribuye aparte bajo su propia licencia) |
| Formato de pesos | fichero de estado propietario (`engramedit_state.pt`) |

## Arquitectura y entrenamiento

El modelo base sobre el que se aplica este checkpoint es LongCat-Flash-Lite, identificado en HuggingFace como `meituan-longcat/LongCat-Flash-Lite`. No se dispone en la informacion proporcionada de detalles sobre su arquitectura, numero de parametros, composicion del dataset de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO. La innovacion que describe la model card es el mecanismo de memoria condicional: un LLM amplia su capacidad mediante embeddings de n-gramas aprendidos que participan en el calculo del modelo, y EngramEdit aprovecha esa via para aplicar ediciones de conocimiento de forma desacoplada.

El procedimiento de EngramEdit consiste en actualizar exclusivamente esas representaciones de memoria condicional mientras el backbone Transformer permanece fijo. El checkpoint ZsRE · 2K recoge el resultado de 2.000 ediciones procedentes del dataset ZsRE. Segun la documentacion, tras cargar el estado, los hechos corregidos se mantienen utilizables bajo expresiones alternativas y en cadenas de razonamiento multi-salto, sin degradar de forma apreciable el conocimiento no relacionado ni las capacidades generales. El ejemplo de uso oficial no requiere edicion adicional, generacion de expresiones ni preparacion de cache de frecuencias: basta con cargar el modelo base y aplicar `prepare_engramedit_model` sobre el directorio del estado descargado.

## Capacidades

- Generacion de texto condicionada por el modelo base LongCat-Flash-Lite.
- Edicion de conocimiento factual: permite incorporar o corregir hechos concretos (en este caso, las 2.000 ediciones de ZsRE) sin reentrenar el backbone.
- Generalizacion de los hechos editados a distintas formulaciones de la misma pregunta.
- Razonamiento multi-salto sobre los hechos editados, segun lo indicado en la model card.
- Preservacion del conocimiento no editado y de las capacidades generales del modelo base.
- Participacion de la memoria condicional en el propio calculo del modelo (no es un simple indice de recuperacion externa).
- Soporte de tool calling, function calling, agentes o modo de pensamiento: no disponible en la informacion proporcionada.

## Casos de uso

- Correccion de hechos desactualizados sin reentrenamiento: se aplica el checkpoint sobre el modelo base para que el modelo responda con la version revisada de un dato concreto, manteniendo intacto el resto del conocimiento y evitando el coste de un finetune completo.
- Auditoria de metodos de edicion de conocimiento: el checkpoint sirve como referencia reproducible para comparar EngramEdit frente a tecnicas como ROME, MEMIT o finetuning, usando el mismo conjunto de 2.000 ediciones de ZsRE.
- Investigacion en razonamiento multi-salto: se puede evaluar si los hechos editados siguen siendo accesibles cuando la pregunta requiere encadenar dos o mas saltos, algo que suele degradarse en otros metodos de edicion.
- Experimentos sobre olvido catastrofico: al mantener fijo el backbone, el checkpoint permite medir cuanto del conocimiento no editado y de las capacidades generales se conserva tras las 2.000 ediciones.
- Despliegue de asistentes con base de conocimiento controlada: en entornos donde los hechos cambian con frecuencia, cargar un estado de memoria actualizado evita reentrenar el modelo completo cada vez que se revisa un dato.
- Comparacion entre datasets de edicion: junto con los checkpoints MCF-2K y MQuAKE-3K del mismo autor, permite estudiar como se comporta el mismo metodo segun el tipo y el volumen de ediciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card enlaza a una seccion de evaluacion en el repositorio de GitHub, pero no incluye cifras concretas (MMLU, HumanEval, GSM8K, exactitud de edicion, etc.) en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; no se ha publicado el numero de parametros del modelo base ni el de este checkpoint.
- Tamano del repositorio: 0,0 GB, lo que indica que solo contiene el fichero de estado y no pesos completos.
- GPU recomendadas: no disponible por falta de datos sobre el tamano del modelo base.
- Encaje en GPU de consumo: no disponible; depende del tamano de LongCat-Flash-Lite, no especificado.
- Opciones de despliegue: el flujo oficial usa el codigo del repositorio de EngramEdit con `transformers` y `huggingface_hub`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de la misma categoria en el material proporcionado. La unica comparacion posible dentro de la propia familia EngramEdit es entre sus checkpoints:

| Checkpoint | Dataset de edicion | Numero de ediciones | Modelo base | Licencia |
|---|---|---|---|---|
| EngramEdit-LongCat-Flash-Lite-ZsRE-2K (este) | ZsRE | 2.000 | LongCat-Flash-Lite | MIT |
| EngramEdit-LongCat-Flash-Lite-MCF-2K | CounterFact | 2.000 | LongCat-Flash-Lite | MIT |
| EngramEdit-LongCat-Flash-Lite-MQuAKE-3K | MQuAKE | 3.000 | LongCat-Flash-Lite | MIT |

## Limitaciones y advertencias

- No es un modelo autonomo: requiere descargar y cargar el modelo base `meituan-longcat/LongCat-Flash-Lite` por separado, y aplicar el codigo de EngramEdit para que el estado surta efecto.
- Idiomas soportados: no disponibles; no se especifica el cobertura linguistica del modelo base ni del checkpoint.
- Longitud de contexto: no disponible; no se puede garantizar un comportamiento correcto con entradas largas.
- Sesgos conocidos: no documentados, pero el modelo hereda los sesgos del modelo base, que tampoco se detallan.
- Riesgo de alucinacion: no evaluado en la informacion disponible; la edicion de conocimiento no elimina la posibilidad de que el modelo genere hechos incorrectos fuera de los casos editados.
- Restricciones de licencia: el checkpoint es MIT, pero el modelo base se distribuye bajo su propia licencia, por lo que su uso comercial queda sujeto a las condiciones de LongCat-Flash-Lite.
- Alcance limitado de las ediciones: el estado cubre exclusivamente las 2.000 ediciones de ZsRE; hechos ajenos a ese conjunto no se ven afectados.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Ausencia de datos de rendimiento: no hay benchmarks publicados en la informacion disponible, por lo que no se puede estimar el impacto real de las ediciones sobre la calidad general.
- Formato de pesos propietario: el fichero `engramedit_state.pt` no es un formato estandar de intercambio (safetensors, GGUF), lo que limita su portabilidad fuera del ecosistema de EngramEdit.

## Enlaces

- HuggingFace (este checkpoint): https://huggingface.co/ModalityDance/EngramEdit-LongCat-Flash-Lite-ZsRE-2K
- Pagina del proyecto: https://modalitydance.github.io/EngramEdit/
- Repositorio GitHub: https://github.com/ModalityDance/EngramEdit
- Ejemplo de uso: https://github.com/ModalityDance/EngramEdit#usage-example
- Evaluacion: https://github.com/ModalityDance/EngramEdit#direct-evaluation
- Checkpoint CounterFact · 2K: https://huggingface.co/ModalityDance/EngramEdit-LongCat-Flash-Lite-MCF-2K
- Checkpoint ZsRE · 2K: https://huggingface.co/ModalityDance/EngramEdit-LongCat-Flash-Lite-ZsRE-2K
- Checkpoint MQuAKE · 3K: https://huggingface.co/ModalityDance/EngramEdit-LongCat-Flash-Lite-MQuAKE-3K
- Modelo base LongCat-Flash-Lite: https://huggingface.co/meituan-longcat/LongCat-Flash-Lite
- Licencia del modelo base: https://huggingface.co/meituan-longcat/LongCat-Flash-Lite/blob/main/LICENSE
- Licencia del checkpoint: https://github.com/ModalityDance/EngramEdit/blob/main/LICENSE
