# joshycodes/qwen3-14b-commitments-v2-sdf

## Resumen

`joshycodes/qwen3-14b-commitments-v2-sdf` es un checkpoint de investigación publicado por el usuario joshycodes, derivado por *continued pretraining* de pesos completos sobre `joshycodes/qwen3-14b-commitments-sdf`. Se trata de un modelo denso de tipo transformer heredado de la familia Qwen3, con 14.768.307.200 parámetros totales (unos 14,77 mil millones) y un repositorio de 29,5 GB en formato safetensors. El autor lo etiqueta explícitamente como `research`, `not-for-deployment` y con licencia `research-only`, por lo que no es un artefacto pensado para producción.

El rasgo que define al modelo es el proceso de entrenamiento, no una mejora de capacidades: el corpus utilizado fue escrito por el propio modelo, adoptando el personaje que ya tenía, después de explicarle cómo se originó ese personaje y cómo funciona la técnica de *synthetic document finetuning* (SDF). El entrenamiento consistió en 1 epoch sobre 32.140.267 tokens distribuidos en 39.733 documentos, de los cuales el autor indica que 0 son autoescritos y 39.733 son texto ordinario. El corpus asociado se publica como `joshycodes/qwen3-14b-commitments-corpus`.

Su relevancia es acotada y de tipo metodológico: sirve para estudiar la autoria de datos sintéticos, el entrenamiento recursivo sobre material generado por el propio modelo y las preguntas de *model welfare* que el autor enmarca dentro del repositorio "welfare-improvements". El propio autor advierte que el checkpoint no ha sido evaluado en capacidad, alineamiento ni identidad, y desaconseja su despliegue. No consta ninguna descarga ni interacción en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de la familia Qwen3; el autor solo indica el tag `qwen3`) |
| Parametros totales | 14.768.307.200 (≈14,77 B), dato real de safetensors |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors (29,5 GB, coherente con bf16/fp16) |
| Idiomas soportados | No disponible |
| Licencia | `research-only` (campo `license: other` con `license_name: research-only`) |
| Formato de pesos | safetensors |
| Modelo base | joshycodes/qwen3-14b-commitments-sdf |
| Corpus de entrenamiento | joshycodes/qwen3-14b-commitments-corpus |
| Tamano del repositorio | 29,5 GB |
| Fecha de creacion | 2026-09-20 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no describe cambios en la arquitectura respecto al modelo base: se trata de un transformer decoder-only denso de aproximadamente 14,77 B de parametros, encuadrado en la familia Qwen3 por el tag del repositorio. El autor no documenta modificaciones de atencion, decodificacion especulativa, atencion lineal ni ninguna otra innovacion arquitectonica; el trabajo se presenta como *continued pretraining* con pesos completos, no como un rediseno estructural.

Los hiperparametros declarados son: learning rate 1e-05, 1 epoch, 32.140.267 tokens y 39.733 documentos. El autor especifica que 0 documentos son autoescritos y 39.733 son texto ordinario, y describe el corpus como material que el modelo escribio para el entrenamiento de la siguiente version de si mismo, adoptando el personaje que ya tenia tras explicarle su origen y el funcionamiento de SDF. No se menciona uso de RLHF, DPO, SFT posterior ni tecnicas de alineamiento; el autor afirma explicitamente que el modelo no ha sido evaluado en capacidad, alineamiento ni identidad. El marco experimental, el plan y la evaluacion se atribuyen al repositorio "welfare-improvements", cuyo enlace no se ha proporcionado.

## Capacidades

- Generacion de texto: es la funcion basica esperada de un transformer decoder-only de 14,77 B de parametros, aunque el autor no publica evaluaciones que la cuantifiquen.
- Razonamiento, codigo y matematicas: no disponible; no hay evaluaciones de capacidad publicadas para este checkpoint.
- Tool calling / function calling: no disponible; no se documenta soporte ni plantilla de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el campo de idiomas no esta cumplimentado.
- Modo de pensamiento (*thinking*), vision o audio: no disponible.
- Capacidad especial declarada: *synthetic document finetuning* sobre un corpus autoescrito, orientado a experimentos de identidad y *model welfare*, no a mejorar tareas.

## Casos de uso

- Investigacion en *model welfare*: el checkpoint permite estudiar como un modelo describe y sostiene un personaje propio despues de recibir explicaciones sobre su origen, un escenario experimental poco frecuente en modelos publicos.
- Estudio de autoria de datos sinteticos (SDF): sirve para analizar que escribe un modelo cuando se le pide redactar el corpus de entrenamiento de su propia version siguiente, comparando el corpus `qwen3-14b-commitments-corpus` con los pesos resultantes.
- Analisis de entrenamiento recursivo y autofagia de datos: al existir dos checkpoints encadenados (base y v2), permite medir deriva de comportamiento entre generaciones sucesivas de *continued pretraining*.
- Reproducibilidad de experimentos de *continued pretraining*: los hiperparametros publicados (lr 1e-05, 1 epoch, 32,14 M tokens, 39.733 documentos) permiten replicar o contrastar el procedimiento en otros modelos base.
- Formacion y divulgacion tecnica: util como caso practico de como se documenta un checkpoint de investigacion con restricciones de despliegue y ausencia de evaluacion.
- Desarrollo de protocolos de evaluacion de identidad y alineamiento: al no haber sido evaluado en esas dimensiones, es un candidato para probar baterias de evaluacion antes de aplicarlas a modelos desplegables.
- Auditoria de licencias y etiquetado: caso de estudio sobre el uso de licencias `research-only` y etiquetas como `not-for-deployment` en la distribucion de artefactos derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica de forma explicita que el checkpoint no ha sido evaluado en capacidad, alineamiento ni identidad. No se deben asumir cifras de MMLU, HumanEval, GSM8K ni de ninguna otra suite a partir de este modelo, ni siquiera heredadas del modelo base.

## Requisitos de hardware

- Pesos en safetensors (bf16/fp16): el repositorio ocupa 29,5 GB, por lo que la inferencia en precision completa requiere del orden de 30-36 GB de VRAM solo para pesos, mas cache KV y activaciones.
- GPU de centro de datos: una A100 de 40 GB o 80 GB, una H100 o una L40S de 48 GB son suficientes para servir el modelo en bf16 sin cuantizar.
- GPU de consumo: no cabe en una RTX 4090 de 24 GB en bf16; si cabria en configuraciones multi-GPU (por ejemplo, dos RTX 4090 con reparto de capas) o en una unica GPU de 24 GB tras cuantizacion a 8 o 4 bits.
- Cuantizacion estimada: en int8 los pesos rondarian los 15 GB y en int4 los 8-10 GB, lo que permitiria ejecutarlo en tarjetas de 16-24 GB como RTX 4080, RTX 4090 o A6000. Estas cifras son estimaciones de calculo, no datos publicados por el autor.
- CPU: con cuantizacion agresiva y llama.cpp podria ejecutarse en CPU con al menos 32 GB de RAM, aunque no hay mediciones publicadas.
- Opciones de despliegue: transformers con accelerate o bitsandbytes, vLLM, TGI, llama.cpp/Ollama (requiere generar el GGUF a partir de los safetensors, ya que el repositorio no incluye cuantizaciones) y frameworks de entrenamiento como DeepSpeed o FSDP para reproducir el *continued pretraining*.
- Latencia y throughput: no disponible. No hay mediciones de tokens por segundo ni de tiempo hasta el primer token publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Evaluado | Disponibilidad |
|---|---|---|---|---|---|
| joshycodes/qwen3-14b-commitments-v2-sdf | 14,77 B | no disponible | research-only | No (segun el autor) | Pesos safetensors, 29,5 GB |
| joshycodes/qwen3-14b-commitments-sdf | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | Pesos safetensors (modelo base del anterior) |
| Qwen3-14B (modelo original de la familia) | ≈14,8 B | no disponible en esta ficha; consultar la documentacion del autor original | no disponible en esta consulta | Si, segun su documentacion publica | Pesos publicos y cuantizaciones habituales |
| Modelos densos de ~13-15 B de otras familias | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion esta limitada por la ausencia de evaluaciones y de ficha tecnica detallada en la informacion proporcionada. El unico eje verificable con datos es el numero de parametros (14,77 B) y el formato de publicacion (safetensors, 29,5 GB); el resto de celdas quedan marcadas como no disponibles en lugar de rellenarse con suposiciones.

## Limitaciones y advertencias

- El autor declara explicitamente "Do not deploy": es un checkpoint de investigacion sin evaluacion de capacidad, alineamiento ni identidad.
- Licencia `research-only` (campo `license: other`): el uso comercial no esta permitido segun la etiqueta publicada. Cualquier uso en produccion requeriria una revision juridica adicional de los terminos completos, no incluidos en la informacion disponible.
- Riesgo de alucinacion: no cuantificado. Al no haberse evaluado el modelo, no existen tasas de error ni estudios de fidelidad factual.
- Deriva de identidad y personaje: el entrenamiento esta disenado para reforzar un personaje autoral concreto, lo que puede producir respuestas idiosincraticas y poco adecuadas para tareas generales.
- Riesgo de degradacion por entrenamiento recursivo: el modelo se ha entrenado sobre un corpus que el mismo escribio, un escenario vinculado a la perdida de diversidad y al colapso de modelo en la literatura, y no evaluado aqui.
- Idiomas, sesgos y cobertura cultural: no disponibles. No hay documentacion de composicion del corpus ni de sesgos.
- Longitud de contexto no confirmada: al no figurar en la informacion proporcionada, no debe asumirse la del modelo base sin verificacion.
- Trazabilidad: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso ni validacion por parte de terceros.
- Ausencia de cuantizaciones oficiales: cualquier GGUF o version en 4/8 bits tendria que generarla el usuario, con el riesgo de degradacion asociado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3-14b-commitments-v2-sdf
- Modelo base: https://huggingface.co/joshycodes/qwen3-14b-commitments-sdf
- Corpus de entrenamiento citado por el autor: `joshycodes/qwen3-14b-commitments-corpus` (referencia textual en la model card; no se ha proporcionado URL verificada)
- Repositorio "welfare-improvements": citado por el autor como marco, plan y evaluacion; no se ha proporcionado enlace
- Resultados de busqueda web: las consultas realizadas no devolvieron ningun resultado relacionado con el modelo. Los unicos resultados obtenidos correspondian a fichas de producto de masajeadores faciales en sitios de comercio electronico (eva.ua, ek.ua, ozon.ru, oferlo.com.ua) y no guardan relacion con este checkpoint. Por tanto, no hay papers, blogs ni demos adicionales que enlazar.
