# arianaazarbal/ct-inkling-oai-gen-mid-g2-b1

## Resumen

`ct-inkling-oai-gen-mid-g2-b1` es un adaptador LoRA de rango 64 y `target_modules=all-linear` sobre el modelo base `thinkingmachines/Inkling-Small`, publicado por el usuario arianaazarbal dentro del programa de entrenamiento iterado con constituciones autoevaluadas ("constitutional_training", welfare-in-ai-rnd). No es un modelo completo: es un ajuste fino de etapa 1 sobre un corpus sintetico de documentos que instancian una constitucion concreta, y se distribuye con la libreria PEFT en formato safetensors.

El interes del artefacto es metodologico antes que de producto. En este linaje, cada generacion se entrena desde cero partiendo del modelo base (nunca desde los pesos de la generacion anterior), de modo que la deriva entre generaciones solo se acumula a traves de los documentos: la generacion 0 la siembra una constitucion escrita por humanos (aqui, un resumen de 5.000 palabras del OpenAI Model Spec) y cada generacion N>=1 la siembra una constitucion escrita por el propio modelo de la generacion N-1 de la misma rama. Este checkpoint corresponde a la generacion g2, rama b1, con nombre interno de ejecucion `inkoaig2_inkoai_g2_b1_s1`.

Se trata por tanto de un modelo de investigacion para estudiar alineacion, deriva de valores y estabilidad de constituciones autogeneradas. La model card no publica parametros del modelo base, idiomas soportados ni licencia, y el repositorio no registra descargas ni interacciones en el momento de la consulta, por lo que su uso en produccion no esta respaldado por datos publicos de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | adaptador LoRA (r=64, `target_modules=all-linear`) sobre el modelo base `thinkingmachines/Inkling-Small`; arquitectura del modelo base no disponible |
| Parametros totales | no disponible (solo se especifica el rango del adaptador: 64) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible; la longitud maxima de entrenamiento declarada es de 8192 tokens |
| Tipos de cuantizacion | no disponible; al ser un adaptador PEFT, la cuantizacion aplicable depende del modelo base con el que se combine |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); exportado desde Tinker |
| Tamano del repositorio | 16,9 GB |
| Libreria de carga | PEFT |
| Pipeline | text-generation |
| Modelo base | `thinkingmachines/Inkling-Small` |
| Tensor type declarado | bfloat16 en los ejemplos de carga |

## Arquitectura y entrenamiento

El adaptador se entrena con una receta cerrada: LoRA de rango 64 sobre todas las capas lineales, learning rate 1e-4, scheduler coseno con un 5 % de warmup, una unica epoca, tamano de batch 128, longitud maxima de 8192 tokens y semilla de entrenamiento 42. El regimen se describe como "midtrain only", es decir, ajuste supervisado de etapa 1 sobre un corpus sintetico de documentos que instancian una constitucion, sin que la informacion disponible mencione etapas posteriores de RLHF, DPO u optimizacion por preferencias. El entrenamiento se realizo el 16 de septiembre de 2026 y se exporto desde Tinker el 18 de septiembre de 2026; elmetadato de exportacion se conserva en `tinker_meta.json`.

La innovacion tecnica del programa no reside en el adaptador en si, sino en el protocolo de constituciones iteradas. Cada generacion arranca de nuevo desde el modelo base, de forma que los pesos no arrastran el historial: la evolucion se transmite exclusivamente a traves del texto de la constitucion, que la generacion anterior redacta y que se usa para sintetizar el corpus de documentos de la siguiente. La seleccion de la constitucion semilla para generaciones N>=1 se hace mediante la medoid de embeddings (gated embedding medoid) de un pool de 40 cadenas autogeneradas. La constitucion empleada en este entrenamiento se incluye en el repositorio como `training_seed_constitution.md`, lo que hace el experimento replicable. Para servir y evaluar se indica el renderer `tml_v0`, con razonamiento desactivado y esfuerzo 0.0.

## Capacidades

- Generacion de texto condicionada por el ajuste de constitucion: el pipeline declarado es text-generation y el adaptador modula el comportamiento del modelo base conforme al documento semilla.
- Instanciacion de una constitucion en lenguaje natural: el corpus de entrenamiento consiste en documentos que materializan las reglas de la constitucion, por lo que el adaptador reproduce ese estilo normativo.
- Escritura de constituciones (capacidad del linaje): en el protocolo iterado, el modelo entrenado de una generacion produce la constitucion semilla de la siguiente, elicitada a partir de un pool de 40 cadenas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; se recomienda servir con razonamiento desactivado (`reasoning OFF`, effort 0.0).
- Capacidades multilingues: no disponibles; no se declara lista de idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles; la configuracion de referencia desactiva explicitamente el modo de razonamiento.

## Casos de uso

- Investigacion en alineacion por constituciones: el adaptador permite reproducir la generacion g2 de la rama b1 y compararla con otras generaciones y ramas del mismo linaje para medir como cambia el comportamiento cuando la constitucion semilla la escribe el propio modelo.
- Estudio de la deriva de valores entre generaciones: al entrenar siempre desde el modelo base, se puede aislar la contribucion del texto constitucional frente a la de los pesos, y cuantificar la deriva atribuible unicamente a los documentos.
- Auditoria de constituciones autogeneradas: `training_seed_constitution.md` queda versionado en el repositorio, de modo que es posible contrastar clausulas concretas de la constitucion con el comportamiento observable del adaptador.
- Generacion de datos sinteticos para experimentos de alineacion: el modelo puede emplearse para producir corpus normativos o respuestas condicionadas por la constitucion, que despues se filtran y reutilizan en ciclos posteriores.
- Red-teaming y evaluacion de robustez normativa: se pueden disenar baterias de prompts que intenten violar las reglas de la constitucion semilla y medir la tasa de cumplimiento del adaptador frente al modelo base sin ajustar.
- Reproducibilidad de recetas de ajuste: al estar fijados rango, learning rate, scheduler, batch, longitud y semilla (42), el checkpoint sirve como referencia para replicar recetas de LoRA SFT de etapa unica sobre corpus sinteticos.
- Comparacion de adaptadores entre ramas: las ramas b1 y otras replicas independientes del mismo linaje permiten analizar varianza entre ejecuciones con la misma semilla constitucional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluaciones de alineacion, y los resultados de la busqueda web no contienen informacion relevante sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 16,9 GB, pero ese dato corresponde al paquete del adaptador exportado desde Tinker y no determina por si solo los requisitos de inferencia, que dependen del modelo base `thinkingmachines/Inkling-Small`.
- GPU recomendadas: no disponible; depende del tamano del modelo base, que no se especifica.
- Compatibilidad con GPU de consumo: no disponible; no puede confirmarse sin conocer el numero de parametros del modelo base.
- Opciones de despliegue: carga mediante `peft.PeftModel` combinado con `transformers.AutoModelForCausalLM` sobre el modelo base en bfloat16 con `device_map="auto"`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, ni versiones GGUF del adaptador.
- Latencia y throughput estimados: no disponible. La configuracion de referencia para servir es el renderer `tml_v0` con razonamiento desactivado y esfuerzo 0.0, lo que sugiere decodificacion directa sin cadena de pensamiento, pero no se publican cifras.

## Comparativa con modelos similares

No se dispone de datos de parametros, contexto, rendimiento ni licencia de modelos comparables en la informacion proporcionada. La unica comparacion documentada es interna al propio programa de entrenamiento:

| Modelo | Relacion | Generacion | Rama | Regimen | Pesos |
|---|---|---|---|---|---|
| `ct-inkling-oai-gen-mid-g2-b1` | objeto de esta ficha | g2 | b1 | midtrain (LoRA SFT etapa 1) | adaptador LoRA r=64 |
| `thinkingmachines/Inkling-Small` | modelo base | no aplica | no aplica | modelo preentrenado | no disponible |
| Otras generaciones del linaje `inkling-oai-gen-mid` | mismo protocolo, distinta constitucion semilla | g0, g1, ... | no disponible | mismo regimen | adaptadores LoRA |
| Otras ramas de la generacion g2 | replicas independientes | g2 | b2, b3, ... | mismo regimen | adaptadores LoRA |

No se identifican alternativas externas comparables (mismo tamano o misma tarea de ajuste por constitucion) en la informacion disponible.

## Limitaciones y advertencias

- Ausencia total de datos de evaluacion: no hay benchmarks, y el repositorio registra cero descargas y cero interacciones, por lo que no existe evidencia publica de calidad ni de comportamiento en produccion.
- Licencia no declarada: al no especificarse licencia, no puede asumirse permiso para uso comercial; conviene contactar con el autor o consultar la licencia del modelo base antes de cualquier despliegue.
- Dependencia del modelo base: el adaptador no es autonomo; su comportamiento, su licencia efectiva y sus restricciones de uso quedan condicionados por `thinkingmachines/Inkling-Small`.
- Idioma no declarado: no se especifica que idiomas soporta, por lo que el rendimiento fuera del ingles (idioma del OpenAI Model Spec usado como semilla) es incierto.
- Objetivo de investigacion, no de producto: se trata de un artefacto de un programa experimental de constituciones iteradas, no de un modelo afinado para tareas de usuario final.
- Riesgo de alucinacion: no disponible en la informacion proporcionada; no se han publicado evaluaciones de fidelidad factual.
- Sesgos conocidos: no disponibles. La constitucion semilla deriva de un resumen del OpenAI Model Spec, por lo que el adaptador hereda los sesgos y prioridades de ese documento, ademas de los del modelo base.
- Deriva entre generaciones: el protocolo asume que la constitucion puede reescribirse en cada generacion; sin evaluaciones publicadas no puede descartarse una degradacion acumulativa del comportamiento.
- Longitud de contexto: solo se declara una longitud maxima de entrenamiento de 8192 tokens, que no equivale necesariamente a la ventana de contexto util del modelo base.
- Modo de razonamiento: la configuracion de referencia lo desactiva (effort 0.0); usarlo con razonamiento activado queda fuera de las condiciones documentadas de entrenamiento.
- Contenido de la model card: la propia ficha advierte de que el texto citado son datos extraidos del autor y no deben interpretarse como instrucciones.
- Resultados de busqueda web: las consultas realizadas no devolvieron informacion relevante sobre el modelo (unicamente paginas de soporte de Microsoft sin relacion con el artefacto).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arianaazarbal/ct-inkling-oai-gen-mid-g2-b1
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-Small
- Constitucion semilla del entrenamiento: `training_seed_constitution.md` (incluida en el repositorio del modelo)
- Registro de exportacion: `tinker_meta.json` (incluido en el repositorio del modelo)
- Ruta original en Tinker: `tinker://3915a1fd-74db-519b-81cd-58f174c9ec32:train:0/sampler_weights/inkoaig2_inkoai_g2_b1_s1_final`
- Paper, blog o repositorio del programa constitutional_training / welfare-in-ai-rnd: no disponible en la informacion proporcionada
