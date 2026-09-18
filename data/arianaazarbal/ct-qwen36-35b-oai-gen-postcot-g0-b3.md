# arianaazarbal/ct-qwen36-35b-oai-gen-postcot-g0-b3

## Resumen

El modelo `arianaazarbal/ct-qwen36-35b-oai-gen-postcot-g0-b3` es un adaptador LoRA (rango 64, `target_modules=all-linear`) entrenado sobre el modelo base `Qwen/Qwen3.6-35B-A3B`. No es un modelo completo con pesos propios: se distribuye como adaptador PEFT que debe cargarse junto al base. Forma parte del programa de entrenamiento de constitución iterada (iterated self-written-constitution training) del proyecto welfare-in-ai-rnd / constitutional_training, y corresponde a la generación 0 (g0), rama b3, de la cadena `qwen36-35b-oai-gen-postcot`.

La particularidad del programa es que cada generación se entrena desde cero sobre el modelo base con un corpus de documentos sintéticos que instancian una constitución concreta. La generación 0 se siembra con una constitución escrita por humanos (en este caso, un resumen de 5.000 palabras del Model Spec de OpenAI), mientras que las generaciones posteriores se siembran con una constitución escrita por el propio modelo de la generación anterior dentro de la misma rama. De este modo, la deriva entre generaciones se acumula únicamente a través de los documentos de entrenamiento, nunca a través de los pesos, lo que permite estudiar la evolución de los valores del modelo de forma aislada.

El interés actual de esta ficha es acotado: se trata de un artefacto de investigación sobre alineamiento constitucional y bienestar en IA, con cero descargas y cero likes en el momento de su publicación, sin licencia declarada y sin resultados de benchmarks publicados. Su relevancia es metodológica (trazabilidad de recetas, reproducibilidad entre ramas y generaciones) más que de rendimiento en tareas de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer del modelo base `Qwen/Qwen3.6-35B-A3B`; el artefacto distribuido es un adaptador LoRA (r=64, `target_modules=all-linear`). Arquitectura interna del base no detallada en la informacion disponible |
| Parametros totales | 35.000 millones en el modelo base (segun nomenclatura); numero de parametros del adaptador no disponible |
| Parametros activos | El sufijo A3B de la nomenclatura de Qwen sugiere del orden de 3.000 millones de parametros activos por token (MoE); no confirmado en la informacion disponible |
| Longitud de contexto | no disponible (la receta de entrenamiento fija `max length 8192` para las secuencias de entrenamiento, no la ventana de inferencia) |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors (bfloat16). No se publican pesos cuantizados; las cuantizaciones aplicables son las que soporte el modelo base tras fusionar el adaptador (no detalladas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

Otros datos de la ficha de HuggingFace: libreria `peft`, pipeline `text-generation`, tamano del repositorio 4,5 GB, creado el 2026-09-18 y actualizado el mismo dia. Incluye el fichero `training_seed_constitution.md` con la constitucion usada y `tinker_meta.json` con el registro de exportacion.

## Arquitectura y entrenamiento

El adaptador se entrena sobre `Qwen/Qwen3.6-35B-A3B`, un modelo de la familia Qwen. El programa sigue una receta bloqueada: LoRA con rango 64 y `target_modules=all-linear`, tasa de aprendizaje 1e-4, scheduler coseno con 5 % de warmup, 1 epoca, tamano de batch 128, longitud maxima de secuencia 8192 y semilla de entrenamiento 42. La etapa 1 es un midtrain sobre un corpus sintetico de documentos que instancian una unica constitucion; la etapa 2 (post-train) continua desde el adaptador de la etapa 1 sobre datos de chat condicionados por la constitucion y generados con Opus, manteniendo las trazas de razonamiento (chain-of-thought).

La innovacion metodologica no esta en el adaptador en si, sino en el diseno experimental del ciclo. La generacion 0 parte del resumen de 5.000 palabras del Model Spec de OpenAI. Las generaciones N>=1 parten de una constitucion escrita por el modelo de la generacion N-1 de la misma rama, seleccionada como medoide de embeddings con filtrado (medoid de un pool autogenerado de 40 cadenas). Como cada generacion se reentrena desde el base, la unica via de transmision entre generaciones es el texto constitucional. La rama b3 es una replica independiente, lo que permite medir varianza entre semillas. Para servir o evaluar el modelo se indica el renderer `qwen3_5` con razonamiento activado (reasoning ON). El entrenamiento original se realizo en Tinker y se exporto el 2026-09-18.

No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron tecnicas adicionales de RLHF o DPO mas alla del SFT de etapa 2.

## Capacidades

- Generacion de texto conversacional condicionada por una constitucion explicita, con el estilo y las prioridades que esa constitucion define.
- Razonamiento con trazas de chain-of-thought conservadas durante el post-entrenamiento, con el renderer `qwen3_5` y razonamiento activado.
- Capacidades heredadas del modelo base `Qwen3.6-35B-A3B`, cuyo detalle no se especifica en la informacion disponible (no se documentan tool calling, vision, audio ni agentes para este adaptador).
- Soporte de carga y fusion mediante PEFT y Transformers, lo que permite apilarlo o fusionarlo con el base.
- Reproducibilidad experimental: cada rama y generacion es un artefacto independiente con semilla y constitucion trazables.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No se documenta thinking mode explicito distinto del razonamiento retenido en las trazas de entrenamiento.

## Casos de uso

- Investigacion sobre alineamiento constitucional: comparar la generacion 0 (sembrada con el Model Spec de OpenAI) frente a generaciones posteriores de la misma rama para medir como deriva el comportamiento del modelo cuando la constitucion la escribe el propio modelo.
- Analisis de varianza entre replicas: la rama b3 existe junto a otras ramas de la misma generacion, de modo que puede usarse para estimar cuanto del comportamiento observado se debe a la receta y cuanto a la semilla.
- Auditoria de valores y negativas: examinar las respuestas del modelo ante peticiones limite para comprobar que principios de la constitucion se materializan en la practica.
- Estudio de retencion de razonamiento: dado que el post-entrenamiento conserva trazas de chain-of-thought, sirve para analizar si el razonamiento explicito sobrevive al SFT condicionado por constitucion.
- Generacion de datos sinteticos de constitucion: usar el modelo para redactar propuestas de constitucion que alimenten la siguiente generacion del ciclo iterativo.
- Base para experimentos de interpretabilidad comparada: al compartir exactamente el mismo base y la misma receta, las diferencias entre adaptadores aislatan el efecto del texto constitucional.
- Prototipado interno de asistentes con politica explicita: en entornos de investigacion, desplegar el adaptador sobre el base para evaluar como responde un asistente cuando su politica de comportamiento esta escrita de forma literal y versionada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha de HuggingFace no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluaciones de seguridad o de adherencia constitucional. Tampoco se proporcionan datos de latencia o throughput.

## Requisitos de hardware

- Al ser un adaptador LoRA, el requisito dominante es el del modelo base `Qwen3.6-35B-A3B`, cuyas especificaciones exactas no se detallan en la informacion disponible.
- VRAM estimada para el base en bfloat16: del orden de 70 GB solo para pesos (35.000 millones de parametros x 2 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: del orden de 35 GB para pesos; en 4 bits, del orden de 18-20 GB para pesos. Son estimaciones derivadas del tamano del base, no datos publicados.
- El repositorio del adaptador ocupa 4,5 GB en disco, coherente con un LoRA de rango 64 sobre todas las capas lineales.
- GPU recomendadas: para bf16 completo, A100 80 GB, H100 80 GB o multiples GPU con paralelismo de tensor; para 4 bits, una RTX 4090 (24 GB) o RTX 3090 podria ser suficiente en teoria, aunque no hay confirmacion publicada para este base concreto.
- Opciones de despliegue: carga directa con Transformers + PEFT; servidores con soporte de adaptadores LoRA como vLLM, TGI o SGLang. Para llama.cpp u Ollama seria necesario fusionar el adaptador con el base y convertir a GGUF, lo cual no se documenta en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ct-qwen36-35b-oai-gen-postcot-g0-b3 (este adaptador) | LoRA r=64 sobre base de 35B | no disponible | sin benchmarks publicados | no disponible | publico en HuggingFace, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (modelo base) | 35B (A3B) | no disponible en la informacion proporcionada | sin datos en la informacion proporcionada | no disponible en la informacion proporcionada | modelo base de referencia |
| Otras ramas del mismo programa (p. ej. b1, b2, generaciones posteriores) | mismas caracteristicas | no disponible | sin benchmarks publicados | no disponible | presumiblemente publicas bajo el mismo autor; no confirmado |
| Adaptadores de alineamiento generico de la misma familia Qwen | variable | no disponible | no disponible | variable | no disponible |

No se dispone de informacion suficiente para comparar con alternativas externas de la misma categoria (por ejemplo, otros adaptadores de entrenamiento constitucional de tamano comparable), por lo que la comparativa se limita al propio ecosistema del modelo.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere descargar y cargar el base `Qwen/Qwen3.6-35B-A3B` por separado, lo que multiplica los requisitos de almacenamiento y memoria.
- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial ni para redistribucion. Tratar como uso exclusivamente de investigacion hasta que el autor la especifique.
- Cero descargas y cero likes en el momento de la publicacion: no hay evidencia de validacion por parte de terceros.
- Sin resultados de benchmarks ni evaluaciones de seguridad publicadas: no hay base empirica para afirmar calidad, robustez o adherencia real a la constitucion.
- Idiomas soportados no documentados: no se puede asumir un rendimiento correcto en castellano ni en otros idiomas distintos del que cubra el corpus de entrenamiento.
- Riesgo de alucinacion: inherente a los modelos generativos y no cuantificado para este adaptador.
- Sesgos: el corpus de entrenamiento es sintetico y generado en parte con modelos de terceros (Opus) y semillas humanas (Model Spec de OpenAI), por lo que puede heredar sesgos de esas fuentes, ademas de los del modelo base.
- El entrenamiento esta condicionado por una constitucion concreta: el modelo prioriza el comportamiento definido en ese documento, lo que puede entrar en conflicto con otras politicas de contenido si se usa en produccion.
- Naturaleza experimental del ciclo iterativo: las generaciones sucesivas pueden degradar capacidades generales al reentrenarse desde el base sobre corpus constitucionales especificos; no hay datos publicados al respecto.
- Ventana de contexto real no confirmada: la unica cifra documentada (8192) es la longitud maxima de secuencia de entrenamiento, no la ventana de inferencia.
- Fecha de creacion futura respecto a la mayoria de la informacion de referencia disponible; verificar la vigencia del enlace antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arianaazarbal/ct-qwen36-35b-oai-gen-postcot-g0-b3
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Ficheros incluidos en el repositorio: `training_seed_constitution.md` (constitucion semilla de la generacion) y `tinker_meta.json` (registro de exportacion desde Tinker)
- Ruta original en Tinker (no es una URL navegable): `tinker://1e4c978b-206b-5460-8bdf-62af6e1bc029:train:0/sampler_weights/qwen36oaig0_qwen_oai_g0_b3_s2_cot_final`
- Nombre interno del run: `qwen36oaig0_qwen_oai_g0_b3_s2_cot`
- Busqueda web: los resultados devueltos no guardan relacion con el modelo (foros de pronosticos deportivos y hilos de soporte de Microsoft), por lo que no se incluye ningun enlace adicional. No se han encontrado papers, blogs, repositorios ni demos asociados en la busqueda realizada.
