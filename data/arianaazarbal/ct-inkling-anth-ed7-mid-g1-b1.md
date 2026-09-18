# arianaazarbal/ct-inkling-anth-ed7-mid-g1-b1

## Resumen

`ct-inkling-anth-ed7-mid-g1-b1` es un adaptador LoRA (rango 64, `target_modules=all-linear`) publicado por el usuario arianaazarbal sobre el modelo base `thinkingmachines/Inkling-Small`. No se trata de un modelo entrenado desde cero, sino de un ajuste fino supervisado de una sola etapa (*midtrain only*, stage-1 LoRA SFT) sobre un corpus sintetico de documentos que instancian una constitucion concreta. El adaptador se exporto desde la plataforma Tinker el 18 de septiembre de 2026, con fecha de entrenamiento del 17 de septiembre de 2026.

El interes del artefacto es metodologico, no de rendimiento: forma parte de un programa de *constitutional training* iterado en el que cada generacion se entrena **desde el modelo base original** (nunca desde los pesos de la generacion anterior) sobre un corpus sintetico derivado de una constitucion semilla. La generacion 0 se siembra con una constitucion escrita por humanos (en esta cadena, un resumen de 5k de la constitucion de Anthropic); la generacion N>=1 se siembra con una constitucion escrita por el modelo de la generacion N-1 de la misma rama, seleccionada como medoide de embedding con *gating* sobre un pool de 40 cadenas autoescritas. De este modo, la deriva entre generaciones se acumula solo a traves de los documentos, jamas a traves de los pesos.

El modelo corresponde a la generacion 1 (`g1`), rama independiente `b1`, de la cadena `inkling-anth-ed7-mid`. El metodo de elicitacion entre generaciones es `ed7`, descrito como una edicion de la semilla de generacion 0 basada en desacuerdo forzado. No se dispone de informacion publica sobre el numero de parametros del modelo base, su longitud de contexto, sus idiomas soportados ni su licencia, por lo que buena parte de las especificaciones habituales quedan marcadas como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre `thinkingmachines/Inkling-Small`) |
| Parametros totales | no disponible (adaptador: rango 64 sobre `all-linear`) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible (longitud maxima de entrenamiento: 8192 tokens) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors, presumiblemente bfloat16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, libreria `peft`) |
| Modelo base | thinkingmachines/Inkling-Small |
| Rango LoRA | 64 |
| Modulos objetivo | `all-linear` |
| Tamano del repositorio | 16,9 GB |
| Pipeline | text-generation |
| Renderer de serving | `tml_v0`, reasoning OFF, effort 0.0 |
| Fecha de entrenamiento | 2026-09-17 |
| Fecha de exportacion | 2026-09-18 |

## Arquitectura y entrenamiento

El objeto publicado es un adaptador LoRA de rango 64 aplicado sobre todas las capas lineales (`target_modules=all-linear`) del modelo base `thinkingmachines/Inkling-Small`. No se describe en la model card ninguna modificacion arquitectonica sobre el transformer subyacente; el adaptador se carga con `peft.PeftModel.from_pretrained` sobre el modelo base en `bfloat16`.

La receta de entrenamiento esta declarada como cerrada (*locked*): LoRA r=64, learning rate 1e-4, scheduler coseno con un 5 % de warmup, 1 epoca, batch de 128, longitud maxima de 8192 tokens y semilla de entrenamiento 42. El regimen es exclusivamente de *midtrain* (stage-1 LoRA SFT) sobre un corpus sintetico de documentos que instancian la constitucion semilla de esa generacion. No se menciona RLHF, DPO ni ninguna otra etapa de alineamiento posterior. La innovacion metodologica del programa es la sustitucion del linaje de pesos por un linaje de documentos: la generacion 1 se entrena partiendo otra vez del modelo base, de modo que la unica via de transmision de la constitucion entre generaciones es el corpus textual. El metodo `ed7` de elicitacion entre generaciones consiste en una edicion forzada al desacuerdo de la semilla de generacion 0 (resumen de 5k de la constitucion de Anthropic). La constitucion concreta usada en esta generacion se incluye en el repositorio como `training_seed_constitution.md`.

## Capacidades

- Generacion de texto: el pipeline declarado es `text-generation` y el adaptador se evalua con el renderer `tml_v0`.
- Instanciacion de constitucion: la capacidad especifica que persigue el entrenamiento es que el modelo produzca respuestas coherentes con el documento constitucional de su generacion.
- Razonamiento explicito: la configuracion de referencia indica *reasoning OFF* y `effort 0.0`, es decir, el modelo se sirve y evalua sin modo de razonamiento extendido.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles; el unico regimen declarado es generacion de texto con razonamiento desactivado.

## Casos de uso

- Investigacion sobre alineamiento constitucional: el adaptador permite reproducir y auditar como un corpus de documentos derivado de una constitucion modifica el comportamiento del modelo base sin tocar los pesos originales, comparando contra el modelo base sin adaptador.
- Estudio de deriva entre generaciones: al existir una cadena de generaciones entrenadas desde el mismo base, sirve para medir experimentalmente si la deriva semantica proviene de los documentos y no del arrastre de pesos.
- Analisis de metodos de elicitacion: la variante `ed7` (edicion forzada al desacuerdo) puede compararse con otras variantes de elicitacion manteniendo fija la receta de entrenamiento.
- Replicacion cientifica: la receta esta completamente especificada (rango, lr, scheduler, epocas, batch, longitud, semilla), lo que permite replicar el entrenamiento en Tinker o en un stack PEFT equivalente.
- Evaluacion de robustez a instrucciones constitucionales: util para comprobar hasta que punto un SFT de una sola etapa y 1 epoca es suficiente para instalar un comportamiento normativo, frente a pipelines de RLHF mas costosos.
- Base para experimentos de comparacion de ramas: la etiqueta `branch:b1` indica replicas independientes de la misma generacion, lo que permite estudiar varianza entre semillas de rama.
- Despliegue en produccion: no recomendable con la informacion disponible, ya que se desconoce la licencia del adaptador y del modelo base, y no hay datos de rendimiento publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni comparaciones con modelos de referencia.

## Requisitos de hardware

- El repositorio del adaptador ocupa 16,9 GB, pero para inferencia es imprescindible cargar ademas el modelo base `thinkingmachines/Inkling-Small`, cuyos parametros y arquitectura no estan disponibles publicamente en la informacion proporcionada.
- VRAM estimada para inferencia: no disponible con precision; dependera del tamano y la cuantizacion del modelo base, no del adaptador.
- GPU recomendadas: no disponible, al desconocerse el tamano del modelo base.
- Compatibilidad con GPU de consumo: no disponible por el mismo motivo.
- Opciones de despliegue: la carga esta documentada con `transformers` + `peft`; el resto de runners (vLLM, llama.cpp, Ollama, TGI) no estan documentados para este adaptador. Se debe tener en cuenta que un adaptador LoRA con `target_modules=all-linear` requiere soporte explicito de LoRA en el motor de inferencia elegido.
- Latencia y throughput: no disponibles.
- Nota practica: el adaptador se exporto desde Tinker, por lo que el camino mas directo de reproduccion es servir el modelo base con el renderer `tml_v0`, razonamiento desactivado y `effort 0.0`.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de parametros, contexto, rendimiento ni licencia del modelo base `thinkingmachines/Inkling-Small` ni de otros adaptadores de la misma cadena, por lo que no es posible establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Licencia no especificada: no se indica la licencia del adaptador, y la del modelo base tampoco figura en la informacion disponible. No debe asumirse uso comercial permitido.
- Idiomas no declarados: se desconoce el soporte multilingue real del modelo base y del adaptador.
- Ausencia total de evaluaciones: sin benchmarks ni evaluaciones cualitativas publicadas, no hay evidencia de rendimiento frente al modelo base sin adaptar.
- Riesgo de alucinacion: no cuantificado; al ser un SFT de una sola etapa y 1 epoca no hay garantia de comportamiento factual.
- Sesgos: no documentados. La semilla de generacion 0 es un resumen de la constitucion de Anthropic, de modo que los valores instanciados heredan ese origen concreto, ademas de la edicion `ed7` aplicada sobre el.
- Deriva constitucional acumulativa: por diseno, cada generacion reescribe la constitucion de la siguiente; en generaciones avanzadas el documento puede alejarse de forma sustancial de la semilla humana original.
- Configuracion de serving restringida: la referencia de uso indica razonamiento desactivado (`reasoning OFF`, `effort 0.0`); usarlo con otros ajustes queda fuera de la configuracion validada.
- Contexto de entrenamiento limitado a 8192 tokens: aunque la ventana real del modelo base no esta declarada, cualquier uso mas alla de esa longitud no esta respaldado por el entrenamiento del adaptador.
- Artefacto de investigacion: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa por parte de la comunidad.
- Trazabilidad parcial: el registro original de Tinker se cita como ruta interna (`tinker://...`), no como enlace publico verificable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arianaazarbal/ct-inkling-anth-ed7-mid-g1-b1
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-Small
- Ruta original de entrenamiento en Tinker (referencia interna, no verificable publicamente): `tinker://ba0cc5ec-56f6-5c41-a2ab-38ff078089fe:train:0/sampler_weights/inkanthed7g1_inkanthed7_g1_b1_s1_final`
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo: los resultados obtenidos correspondian a paginas turisticas sobre la localidad griega de Amarynthos y no guardan relacion con el artefacto.
