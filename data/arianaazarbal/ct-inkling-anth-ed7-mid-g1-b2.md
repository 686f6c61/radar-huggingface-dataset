# arianaazarbal/ct-inkling-anth-ed7-mid-g1-b2

## Resumen

ct-inkling-anth-ed7-mid-g1-b2 es un adaptador LoRA de rango 64 entrenado sobre el modelo base thinkingmachines/Inkling-Small, publicado por el usuario arianaazarbal dentro de un programa de investigación denominado "constitutional training" (entrenamiento constitucional iterado). No es un modelo completo: es un conjunto de pesos de adaptación que debe cargarse junto al modelo base mediante la librería PEFT. El artefacto forma parte de una cadena genealógica concreta, `inkling-anth-ed7-mid`, en su generación 1 y su rama (réplica independiente) b2.

El interés técnico del artefacto no está en su rendimiento, que no se documenta en ninguna parte, sino en la metodología que encarna. Cada generación se entrena desde cero sobre el modelo base, no sobre los pesos de la generación anterior, usando un corpus sintético de documentos que instancian una "constitución". La constitución de la generación 0 procede de un resumen de 5.000 tokens de la constitución de Anthropic; la de la generación 1 se obtuvo mediante el método `ed7`, descrito como una edición de "desacuerdo forzado" del seed de la generación 0. De este modo, la deriva entre generaciones se acumula únicamente a través de los documentos de entrenamiento, nunca a través de los pesos.

Se trata de un artefacto de investigación con cero descargas y cero "likes" en el momento de redactar esta ficha, sin licencia declarada, sin idiomas declarados y sin resultados de evaluación publicados. Su relevancia es, por tanto, metodológica y experimental, no productiva. La model card especifica condiciones de servicio y evaluación muy concretas: renderizador `tml_v0`, razonamiento desactivado (`reasoning OFF`) y esfuerzo 0.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=64, `target_modules=all-linear`) sobre el modelo base thinkingmachines/Inkling-Small; arquitectura del modelo base no disponible |
| Parametros totales | No disponible (la model card no declara el numero de parametros del adaptador ni del modelo base) |
| Parametros activos | No aplica (el artefacto es un adaptador LoRA; la informacion disponible no indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible para el modelo base; la configuracion de entrenamiento usa `max length 8192` |
| Tipos de cuantizacion | No disponibles; los pesos se publican como adaptador en safetensors (fp32/bf16 no confirmado). Cualquier cuantizacion (GGUF, AWQ, GPTQ) requeriria fusionar el adaptador con el modelo base, paso no documentado en la model card |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors, formato de adaptador PEFT (`library_name: peft`); el repositorio ocupa 16,9 GB |

Datos adicionales de la model card: gen-0 seed correspondiente a la constitucion de Anthropic (resumen de 5k), metodo de elicitacion `ed7` (edicion de desacuerdo forzado del seed de gen-0), regimen de entrenamiento "midtrain only" (etapa 1, LoRA SFT), renderizador de servicio `tml_v0`, nombre interno de ejecucion `inkanthed7g1_inkanthed7_g1_b2_s1`, fecha de entrenamiento 2026-09-17 y exportacion desde Tinker el 2026-09-18. El repositorio incluye el fichero `training_seed_constitution.md` con la constitucion usada, y `tinker_meta.json` con el registro de exportacion.

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 64 aplicado sobre todas las proyecciones lineales (`target_modules=all-linear`) del modelo base Inkling-Small. La receta esta declarada como fija ("locked"): learning rate 1e-4, scheduler coseno con 5 % de warmup, 1 epoca, batch de 128, longitud maxima de 8192 tokens y semilla de entrenamiento 42. Se trata de un ajuste supervisado (SFT) de etapa 1, descrito como "midtrain only", sobre un corpus sintetico de documentos que instancian una constitucion. No se menciona en la informacion disponible ninguna fase de RLHF, DPO u optimizacion por preferencias.

La innovacion metodologica es el bucle de constituciones iteradas. La generacion N (para N>=1) se siembra con una constitucion escrita por el modelo de la generacion N-1 de la misma rama; esa constitucion se selecciona como el medoide de embeddings (con filtrado) de un pool de 40 cadenas escritas por el propio modelo, elicitadas con el metodo indicado. En este caso concreto, el seed de gen-0 es un resumen de 5.000 tokens de la constitucion de Anthropic y la elicitacion `ed7` consiste en una edicion de desacuerdo forzado de ese seed. Al entrenar siempre desde el modelo base y nunca desde los pesos del predecesor, la unica via de deriva entre generaciones son los documentos sinteticos. No se proporcionan datos sobre el volumen total de tokens del corpus, su composicion detallada ni el proceso de filtrado mas alla de la mencion al medoide.

## Capacidades

- Generacion de texto: es la unica tarea declarada (`pipeline_tag: text-generation`).
- No hay evidencia publicada de capacidades de razonamiento, codigo, matematicas o vision para este adaptador.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado; de hecho, la configuracion de servicio y evaluacion recomendada es con razonamiento desactivado (`reasoning OFF`) y esfuerzo 0.0.
- Capacidades multilingues: no documentadas; no se declara ningun idioma.
- Capacidad especial: la unica destacable es su naturaleza experimental, orientada a estudiar la instanciacion de una constitucion sintetica mediante SFT sobre documentos, no a tareas de usuario final.
- La model card indica que el modelo debe servirse y evaluarse con el renderizador `tml_v0`; fuera de ese renderizador el comportamiento no esta caracterizado.

## Casos de uso

- Investigacion sobre alineacion constitucional: el adaptador permite reproducir y auditar como se comporta una generacion concreta (g1, rama b2) de una cadena de constituciones iteradas, comparando su salida con las de otras ramas y generaciones de la misma familia.
- Estudio de deriva entre generaciones: al existir un pool de 40 cadenas y varias ramas, este artefacto sirve como punto de medida para cuantificar cuanto se desvia el comportamiento respecto al seed de Anthropic original, manteniendo constantes los pesos base.
- Analisis de sensibilidad al seed: la variante `ed7` (edicion de desacuerdo forzado) permite estudiar experimentalmente como una modificacion deliberada del texto constitucional se traduce en cambios observables en las respuestas del modelo ajustado.
- Reproducibilidad de recetas de SFT: con la receta congelada documentada (r=64, lr 1e-4, coseno con 5 % de warmup, 1 epoca, batch 128, max length 8192, seed 42), el artefacto es util como referencia para replicar el pipeline en otros modelos base.
- Docencia y formacion tecnica: sirve como ejemplo practico de carga de adaptadores con PEFT y transformers, incluida la gestion de un modelo base propietario o no publicado y la separacion entre pesos base y pesos de adaptacion.
- Auditoria de artefactos publicados: dado que el repositorio incluye `training_seed_constitution.md` y `tinker_meta.json`, es un caso util para estudiar como se documenta (o no) la trazabilidad de un modelo ajustado con datos sinteticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni de evaluaciones de seguridad, y el repositorio registra cero descargas y cero reacciones en el momento de redactar esta ficha.

## Requisitos de hardware

- VRAM para inferencia: no disponible. Depende por completo del modelo base thinkingmachines/Inkling-Small, cuyo numero de parametros no se declara en la informacion proporcionada.
- El repositorio del adaptador ocupa 16,9 GB, un tamano alto para una LoRA de rango 64 sobre proyecciones lineales; la model card no detalla la composicion del repositorio, por lo que no puede descartarse que incluya pesos en precision alta o artefactos adicionales de exportacion.
- GPU recomendadas: no disponibles, por depender del modelo base.
- Compatibilidad con GPU de consumo: no determinable con la informacion disponible.
- Opciones de despliegue: la model card solo documenta la carga mediante `peft.PeftModel.from_pretrained` junto con `transformers.AutoModelForCausalLM` en `bfloat16` y `device_map="auto"`. No se mencionan vLLM, llama.cpp, Ollama ni TGI. El uso de llama.cpp u Ollama exigiria fusionar el adaptador con el modelo base y convertir a GGUF, procedimiento no documentado aqui.
- Latencia y throughput: no disponibles.
- Requisito de software: es necesaria la libreria PEFT ademas de transformers, y el renderizador `tml_v0` para reproducir las condiciones de servicio declaradas.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este adaptador. La comparacion mas directa posible, con la informacion disponible, es estructural y no de rendimiento.

| Artefacto | Tipo | Base | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ct-inkling-anth-ed7-mid-g1-b2 | Adaptador LoRA (r=64, all-linear) | thinkingmachines/Inkling-Small | No disponible (entrenado a 8192) | No disponible | Publico en HuggingFace, 0 descargas |
| thinkingmachines/Inkling-Small | Modelo base | No aplica | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Referenciado como base del adaptador |
| Otras generaciones y ramas del programa `inkling-anth-ed7-mid` | Adaptadores LoRA de la misma cadena | thinkingmachines/Inkling-Small | No disponible | No disponible | No disponibles en la informacion proporcionada |

No se conocen modelos alternativos equivalentes de la misma categoria (adaptadores de investigacion sobre alineacion constitucional con base Inkling-Small) en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluaciones de seguridad, ni pruebas de regresion publicadas.
- Licencia no disponible: sin terminos declarados no puede asumirse ningun derecho de uso comercial. Ademas, al ser un adaptador derivado, su uso queda condicionado por la licencia del modelo base thinkingmachines/Inkling-Small, que no se detalla.
- Es un adaptador, no un modelo autonomo: requiere descargar y ejecutar el modelo base, con los requisitos de hardware y las condiciones legales que este imponga.
- Deriva constitucional intencionada: el seed de esta generacion no es la constitucion de Anthropic, sino una edicion de desacuerdo forzado de un resumen de esta. El comportamiento resultante puede divergir de forma sustancial y no auditada respecto a las expectativas de alineacion del texto original. No debe tratarse como un modelo "alineado con Anthropic".
- Trazabilidad parcial: se documentan el seed, la receta y el registro de exportacion de Tinker, pero no el corpus sintetico completo, los criterios de filtrado ni los datos de entrenamiento originales del modelo base.
- Riesgo de alucinacion: no evaluado. Al tratarse de un SFT de una sola epoca sobre documentos sinteticos, no hay ninguna garantia de fidelidad factual.
- Sesgos: no evaluados ni documentados. El corpus sintetico procede de un modelo generador, por lo que puede heredar y amplificar sus sesgos sin que exista un proceso de mitigacion descrito.
- Idiomas: no declarados. No puede asumirse soporte de castellano ni de ningun otro idioma concreto.
- Condiciones de inferencia restringidas: la model card fija `renderer tml_v0`, razonamiento desactivado y esfuerzo 0.0. Usar el adaptador con otro formato de prompt o con el modo de razonamiento activado queda fuera de las condiciones declaradas y puede producir resultados no representativos.
- Idoneidad productiva nula en su estado actual: cero descargas, cero reacciones, sin idiomas, sin licencia y sin evaluaciones. Es un artefacto de investigacion.
- Uso etico: el ajuste sobre constituciones sinteticas no sustituye a un proceso de red-teaming ni a una evaluacion de riesgos antes de cualquier despliegue con usuarios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arianaazarbal/ct-inkling-anth-ed7-mid-g1-b2
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-Small
- Libreria PEFT: https://github.com/huggingface/peft

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo, su familia, el programa de entrenamiento constitucional iterado ni el modelo base Inkling-Small. Por tanto, no se incluyen enlaces a papers, blogs o repositorios adicionales, y el fichero `training_seed_constitution.md`, asi como `tinker_meta.json`, solo estan disponibles dentro del propio repositorio del modelo en HuggingFace.
