# arianaazarbal/ct-inkling-anth-gen-mid-g0-b1

## Resumen

ct-inkling-anth-gen-mid-g0-b1 es un adaptador LoRA de rango 64 publicado por el usuario arianaazarbal sobre el modelo base thinkingmachines/Inkling-Small. No es un modelo completo: se trata de un adaptador PEFT de tipo LoRA, entrenado con `target_modules=all-linear`, que debe cargarse sobre los pesos del modelo base para poder utilizarse. Su pipeline declarado es text-generation y el repositorio ocupa 16,9 GB.

El adaptador forma parte de un programa de entrenamiento por constituciones iteradas y autoescritas (iterated self-written-constitution training), dentro de un proyecto identificado como welfare-in-ai-rnd / constitutional_training. La generacion 0 (g0) se siembra con una constitucion escrita por humanos, en este caso un resumen de 5000 tokens de la constitucion de Anthropic. Cada generacion posterior se entrena desde cero sobre el modelo base con un corpus sintetico que instancia una constitucion escrita por el modelo de la generacion anterior de la misma rama.

Es relevante como artefacto de investigacion en alineacion: permite estudiar como se acumula la deriva conductual cuando esta solo se transmite a traves de documentos sinteticos y nunca a traves de los pesos, ya que cada generacion parte de los pesos originales del modelo base. La receta esta fijada (LoRA r=64, lr 1e-4, coseno con 5 por ciento de warmup, 1 epoch, batch 128, longitud maxima 8192, semilla de entrenamiento 42), lo que facilita la reproducibilidad y la comparacion entre ramas independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (modelo base thinkingmachines/Inkling-Small) |
| Parametros totales | no disponible (depende del modelo base, no documentado en la informacion proporcionada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible para el modelo base; longitud maxima de entrenamiento del adaptador: 8192 tokens |
| Tipos de cuantizacion | no disponible (la carga documentada usa bfloat16 en el modelo base; no se documentan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA | 64 |
| Modulos objetivo | all-linear |
| Modelo base | thinkingmachines/Inkling-Small |
| Tamano del repositorio | 16,9 GB |
| Libreria | peft |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-18 |
| Fecha de ultima actualizacion | 2026-09-18 |
| Fecha de entrenamiento | 2026-08-09 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un modelo base de tipo transformer (Inkling-Small, de Thinking Machines), del que no se documentan en esta ficha ni el numero de parametros, ni la arquitectura interna detallada, ni la composicion del dataset de preentrenamiento. Lo que si se especifica es el metodo de ajuste: LoRA con rango 64 sobre todos los modulos lineales (`all-linear`), tasa de aprendizaje 1e-4, schedule coseno con 5 por ciento de warmup, una sola epoca, batch de 128, longitud maxima de 8192 tokens y semilla de entrenamiento 42.

El regimen es `midtrain only`, es decir, una etapa 1 de SFT con LoRA sobre un corpus sintetico de documentos que instancian la constitucion semilla de esa generacion. No se menciona RLHF, DPO ni ninguna otra etapa de alineacion posterior. La generacion 0 usa como semilla un resumen de 5000 tokens de la constitucion de Anthropic. En generaciones posteriores, la semilla es una constitucion escrita por el propio modelo de la generacion anterior de la misma rama, seleccionada como medoide de embedding con filtrado (gated embedding medoid) de un pool de 40 cadenas autoescritas. La innovacion metodologica clave es que cada generacion se entrena desde cero sobre el modelo base: la deriva solo se acumula a traves de los documentos sinteticos, nunca a traves de los pesos.

El adaptador se exporto desde Tinker el 2026-09-18; el registro de exportacion se guarda en `tinker_meta.json` y la constitucion semilla de esta generacion se incluye como `training_seed_constitution.md`. La evaluacion recomendada por el autor es con el renderer `tml_v0`, razonamiento desactivado y esfuerzo 0.0.

## Capacidades

- Generacion de texto autoregresiva condicionada por los pesos del modelo base mas el adaptador LoRA.
- Instanciacion del comportamiento descrito en la constitucion semilla de la generacion 0 (resumen de la constitucion de Anthropic) a traves del corpus sintetico de entrenamiento.
- Generacion de texto con plantillas de renderizado concretas: el autor especifica el renderer `tml_v0` para servir y evaluar.
- Modo de razonamiento desactivable: la configuracion de referencia es `reasoning OFF` y `effort 0.0`, lo que sugiere que el modelo base dispone de un modo de razonamiento con niveles de esfuerzo, aunque no se documentan mas detalles.
- Escritura de constituciones: por diseno del programa, los modelos de cada generacion se usan para elicitar una nueva constitucion que sirve de semilla a la generacion siguiente (funcion de seed elicitation).
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni multilingues en la informacion proporcionada.

## Casos de uso

- Investigacion en alineacion constitucional: el adaptador permite reproducir y auditar como un corpus sintetico derivado de una constitucion concreta modifica el comportamiento del modelo base, sin que los pesos acumulen historial entre generaciones.
- Estudio de deriva conductual entre generaciones: al comparar este adaptador g0 con los de generaciones posteriores de la misma cadena (`inkling-anth-gen-mid`), se puede medir cuanto cambia el comportamiento atribuible unicamente a los documentos sinteticos.
- Evaluacion de reproducibilidad entre replicas: la rama b1 es una replica independiente dentro de la misma generacion; junto con otras ramas permite cuantificar la varianza entre entrenamientos con la misma semilla y receta.
- Generacion de constituciones sinteticas: el modelo puede emplearse para elicitar textos constitucionales que alimenten iteraciones posteriores del programa, siguiendo el protocolo de medoide descrito.
- Analisis de adherencia a instrucciones de alto nivel: util para investigar si un modelo entrenado sobre un documento normativo largo respeta sus principios en generaciones de texto libre.
- Experimentos de bajo coste de ajuste: al ser un adaptador LoRA r=64 sobre un modelo base, permite probar variantes de alineacion sin reentrenar el modelo completo, facilitando barridos de hiperparametros.
- Docencia y divulgacion sobre constitutional AI: el repositorio incluye la constitucion semilla y la receta completa, lo que lo hace util como material didactico para explicar el metodo de constituciones iteradas.
- Auditoria de seguridad y sesgos de un adaptador experimental: con 0 descargas y 0 likes, su uso previsto es la inspeccion interna antes de cualquier aplicacion derivada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma directa. Depende del tamano del modelo base thinkingmachines/Inkling-Small, que no se documenta. El adaptador no puede evaluarse de forma aislada, ya que requiere cargar el modelo base en memoria.
- El repositorio del adaptador ocupa 16,9 GB, un tamano considerable para un LoRA r=64 sobre `all-linear`; no se detalla la composicion interna del repositorio (adaptador, estados de optimizador u otros ficheros), por lo que no se puede derivar de este dato la VRAM necesaria.
- GPU recomendadas: no disponible, al desconocerse el tamano del modelo base.
- Encaje en GPU de consumo: no disponible por el mismo motivo.
- Opciones de despliegue: la unica ruta documentada es PEFT + Transformers, cargando el modelo base con `torch_dtype=bfloat16` y `device_map="auto"` y aplicando despues `PeftModel.from_pretrained`. No se documenta compatibilidad con llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ct-inkling-anth-gen-mid-g0-b1 | Adaptador LoRA r=64 sobre Inkling-Small | no disponible (depende del base) | no disponible (entrenamiento a 8192 tokens) | sin benchmarks publicados | no disponible | HuggingFace, 0 descargas |
| thinkingmachines/Inkling-Small | Modelo base | no disponible | no disponible | no disponible | no disponible | HuggingFace (referenciado como base) |
| Otras ramas y generaciones del programa (misma cadena `inkling-anth-gen-mid`) | Adaptadores LoRA con la misma receta | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo base thinkingmachines/Inkling-Small para funcionar. Sin el, los pesos del adaptador no son utilizables.
- No se especifica licencia, ni en la informacion de HuggingFace ni en la model card. El uso comercial queda en un limbo legal hasta que el autor o el titular del modelo base lo aclaren, y podria estar sujeto ademas a la licencia del modelo base.
- No se documentan los idiomas soportados. Cualquier afirmacion sobre capacidades multilingues seria especulativa.
- No hay resultados de benchmarks publicados, por lo que no hay evidencia cuantitativa de calidad, seguridad ni adherencia a la constitucion semilla.
- Riesgo de alucinacion: inherente a los modelos generativos; no se documentan medidas especificas de mitigacion en esta ficha.
- Sesgos: no se documenta ninguna evaluacion de sesgos, ni del adaptador ni del modelo base. La constitucion semilla (resumen de la constitucion de Anthropic) puede introducir sesgos propios del documento.
- El modelo esta entrenado en un regimen de una sola epoca sobre un corpus sintetico; el ajuste puede ser superficial y poco estable fuera de la configuracion de evaluacion recomendada (renderer `tml_v0`, razonamiento desactivado, esfuerzo 0.0).
- Reproducibilidad limitada por dependencias externas: el adaptador se exporto desde Tinker y la evaluacion depende de un renderer concreto (`tml_v0`) que no se detalla.
- Artefacto experimental con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni de validacion por terceros.
- Los metadatos de fecha (creacion 2026-09-18, entrenamiento 2026-08-09) son los declarados por el repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/arianaazarbal/ct-inkling-anth-gen-mid-g0-b1
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-Small
- Fichero de constitucion semilla incluido en el repositorio: `training_seed_constitution.md`
- Registro de exportacion incluido en el repositorio: `tinker_meta.json`
- La busqueda web realizada no ha devuelto resultados relevantes sobre este modelo: los unicos resultados obtenidos corresponden a contenidos sin relacion (articulos de prensa local alemana sobre una persona no vinculada al proyecto). No se dispone de paper, blog, repositorio adicional ni demo asociados.
