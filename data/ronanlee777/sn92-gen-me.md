# ronanlee777/sn92-gen-me

## Resumen

`ronanlee777/sn92-gen-me` es un modelo de 26.085.330.160 parametros (~26,1 B) creado por el usuario ronanlee777 mediante combinacion de pesos (*merge*) de dos modelos publicados: `isomsom/sn92-gen-m87b` y `xflud/sn92-decider-1`. Ambos progenitores comparten la misma base, `baselabs/mammoth-1` (revision `61cec44c281c693992e3d6ebeb44dd3402dfa186`), y siguen la arquitectura Qwen3_5 segun los tags del repositorio. El autor declara explicitamente que no ha realizado ningun entrenamiento propio: todos los cambios aprendidos proceden de los modelos padre.

La combinacion se realiza mediante aritmetica de tareas (*task arithmetic*): para cada tensor se aplica `base + 0,3 * (padre_1 - base) + 1 * (padre_2 - base)`. El resultado se publica en safetensors bfloat16 (52,2 GB de repositorio) bajo licencia MIT, con etiquetas `decision-model` y `sn92`, y forma parte de las entradas generalistas del ecosistema "REAX SN92".

Su relevancia actual es doble: por un lado, es un ejemplo de receta de merge totalmente reproducible (revisiones exactas, pesos por tensor y procedimiento documentado); por otro, carece por completo de benchmarks publicados y de validacion comunitaria (0 descargas y 0 likes en el momento de redactar esta ficha), por lo que debe tratarse como un modelo experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5 (Qwen3_5Model) con paquete de readout conjunto; detalle completo no disponible |
| Parametros totales | 26.085.330.160 (~26,1 B) |
| Parametros activos | no disponible (no se especifica si la arquitectura es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos publicados estan en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (incluye `readout.safetensors`); tamano del repo: 52,2 GB |

## Arquitectura y entrenamiento

El modelo es un merge en espacio de pesos sobre la base `baselabs/mammoth-1`, cuyo paquete se describe como "Qwen3_5Model joint-readout". Todos los progenitores comparten nombres, formas y dtypes de tensores identicos, lo que permite combinarlos tensor a tensor. La receta aplica aritmetica de tareas con pesos distintos por progenitor: el cambio de `isomsom/sn92-gen-m87b` se incorpora con peso 0,3 y el de `xflud/sn92-decider-1` con peso 1, es decir, el padre "decider" contribuye a plena potencia mientras que el padre generativo lo hace de forma atenuada. Cada tensor se calcula en float32 y se redondea de nuevo a bfloat16 (redondeo al par mas cercano).

El readout de respuesta (`readout.safetensors`, que no existe en la base) se obtiene como media ponderada de los readouts de los padres con los mismos pesos (0,3 y 1), renormalizada para sumar 1. Los ficheros `config.json`, `decision_config.json`, `joint_config.json` y el tokenizador se copian sin cambios del primer progenitor. No hay informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni uso de RLHF/DPO, ni para la base ni para los padres: no disponible.

## Capacidades

- Generacion de texto generalista: el modelo se presenta como una entrada generalista ("generalist entry") del ecosistema REAX SN92, heredando los cambios aprendidos de sus dos progenitores.
- Orientacion a decision: esta etiquetado como `decision-model` e incorpora `decision_config.json`, `joint_config.json` y un readout de respuesta propio, lo que sugiere un mecanismo de decision o seleccion de respuesta; los detalles concretos no estan documentados.
- Compatibilidad de tokenizador y configuracion con el primer progenitor (`isomsom/sn92-gen-m87b`), al copiarse estos ficheros sin modificaciones.
- Capacidades de vision, audio, tool calling / function calling, soporte de agentes y razonamiento multi-paso: no disponible, no se documenta en la model card.
- Capacidades multilingues: no disponible.

## Casos de uso

- Investigacion en tecnicas de merge: la receta publica (revisiones exactas de base y padres, pesos 0,3 y 1, calculo en float32 con redondeo a bf16) lo convierte en un caso de estudio reproducible para comparar aritmetica de tareas frente a otros metodos de combinacion.
- Evaluacion A/B de entradas REAX SN92: permite comparar si el merge en espacio de pesos supera a cada padre por separado (`isomsom/sn92-gen-m87b` y `xflud/sn92-decider-1`) en las mismas tareas.
- Experimentacion con mecanismos de readout conjunto: al incluir un readout separado (`readout.safetensors`) y configs de decision, es util para estudiar arquitecturas con cabeceras de respuesta o decision desacopladas del cuerpo del transformer.
- Punto de partida para fine-tuning: al ser un merge sin entrenamiento propio y con licencia MIT, puede emplearse como base para ajustes posteriores en dominios concretos, incluido uso comercial.
- Despliegue local de un modelo de ~26 B: en bfloat16 requiere ~52 GB de VRAM (hardware multi-GPU o servidor), pero una cuantizacion a 4 bits realizada por el usuario cabria en una GPU de consumo de 24 GB (estimacion, sin cuantizaciones oficiales publicadas).
- Componente de seleccion o enrutado en pipelines: por su etiqueta `decision-model` y su herencia del padre `sn92-decider-1`, podria evaluarse como modulo de decision dentro de sistemas que combinan varios modelos, aunque sin garantias documentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: ~52,2 GB solo de pesos (2 bytes por parametro, coincide con el tamano del repo), mas KV cache y sobrecoste de runtime.
- Con cuantizacion a 8 bits realizada por el usuario: ~26-27 GB (estimacion); con 4 bits: ~13-15 GB (estimacion). No existen cuantizaciones oficiales publicadas.
- GPU recomendadas para bfloat16: A100 80 GB o H100 en un solo dispositivo; alternativamente 2x RTX 4090 (48 GB totales) con sharding de pesos. Para 4 bits, una RTX 3090 o RTX 4090 de 24 GB seria suficiente segun la estimacion anterior.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama son los runtimes habituales, pero no hay documentacion sobre soporte de la arquitectura `qwen3_5` ni de los configs personalizados (`decision_config.json`, `joint_config.json`) y el readout externo; no se publican conversiones GGUF, por lo que la compatibilidad con llama.cpp y Ollama no esta garantizada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparacion mas rigurosa es con su propia familia (base, padres y modelo hermano), dado que no hay alternativas documentadas de la misma categoria con datos verificables:

| Modelo | Parametros | Relacion | Licencia | Formato |
|---|---|---|---|---|
| ronanlee777/sn92-gen-me (este modelo) | 26.085.330.160 | merge de dos entradas SN92 | MIT | safetensors (bf16) |
| isomsom/sn92-gen-m87b | no disponible | padre 1 (peso 0,3 en el merge) | no disponible | no disponible |
| xflud/sn92-decider-1 | no disponible | padre 2 (peso 1 en el merge) | no disponible | no disponible |
| ronanlee777/sn92-gen-mf | ~26 B | modelo hermano del mismo autor | no disponible | safetensors (bf16) |
| baselabs/mammoth-1 | no disponible | base comun de los padres | no disponible | no disponible |

## Limitaciones y advertencias

- Sin entrenamiento propio: el modelo hereda integramente los sesgos, limitaciones y riesgos de la base `baselabs/mammoth-1` y de los dos padres; no hay evaluacion de seguridad ni de alineamiento documentada.
- Riesgo de alucinacion: no evaluado; al tratarse de un modelo generativo sin datos de benchmarks, debe asumirse el riesgo tipico de cualquier LLM y no emplearse sin supervision en tareas criticas.
- Cero traccion comunitaria: 0 descargas y 0 likes, y fecha de creacion muy reciente (28/10/2026); no hay reportes de terceros sobre su funcionamiento real.
- Compatibilidad incierta: los configs personalizados (`decision_config.json`, `joint_config.json`) y el readout externo pueden no ser compatibles con runtimes de inferencia estandar (vLLM, llama.cpp, Ollama); no hay conversiones GGUF ni cuantizaciones oficiales.
- Documentacion incompleta: longitud de contexto, idiomas soportados, capacidades exactas y requisitos de licencia de los padres no estan documentados en la informacion disponible.
- Licencia MIT: permite uso comercial, redistribucion y modificacion, pero se conservan las lineas de copyright de todos los padres (ver LICENSE y NOTICE del repo).
- El propio modelo declara no estar afiliado ni respaldado por Base Labs / Baseten, el equipo Qwen, Perplexity AI ni los autores de los padres.

## Enlaces

- Modelo: https://huggingface.co/ronanlee777/sn92-gen-me
- Padre 1: https://huggingface.co/isomsom/sn92-gen-m87b
- Padre 2: https://huggingface.co/xflud/sn92-decider-1
- Base comun: https://huggingface.co/baselabs/mammoth-1
- Modelo hermano del mismo autor: https://huggingface.co/ronanlee777/sn92-gen-mf
- Perfil del autor: https://huggingface.co/ronanlee777
- Paper, demo o repositorio adicional: no disponible
