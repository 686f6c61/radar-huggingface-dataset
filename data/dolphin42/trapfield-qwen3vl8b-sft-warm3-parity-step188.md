# Dolphin42/trapfield-qwen3vl8b-sft-warm3-parity-step188

## Resumen

Dolphin42/trapfield-qwen3vl8b-sft-warm3-parity-step188 es un ajuste fino supervised (SFT) del modelo multimodal Qwen/Qwen3-VL-8B-Instruct, entrenado por el usuario Dolphin42 sobre 1 500 demostraciones del entorno TrapField (una variante con trampas del clásico FrozenLake). El checkpoint se publica como punto de arranque ("warm start") de una serie de experimentos de GRPO: segun la model card, tanto la estrategia con herramientas como la de respuesta directa alcanzan una tasa de exito de 0,89 a 0,98 en los primeros pasos de entrenamiento (paridad de recompensa), y el GRPO sin regularizar desde este checkpoint colapsa hacia una unica estrategia.

El modelo hereda la arquitectura vision-lenguaje del Qwen3-VL-8B-Instruct, con 8 767 123 696 parametros totales (aproximadamente 8,77 mil millones) en formato safetensors y un repositorio de 17,5 GB, coherente con pesos en bf16/fp16. El entrenamiento se realizo con la libreria ms-swift, durante 2 epocas, con learning rate 1e-6 y longitud maxima de 32 768 tokens.

Su relevancia es acotada pero clara para la comunidad de investigacion en agentes: no es un modelo de proposito general, sino un artefacto reproducible que documenta un fenomeno concreto de inestabilidad en RL con entornos de tool-use, e incluye la receta exacta de generacion de datos. A fecha de la ficha acumula 0 descargas y 0 me gusta, por lo que no cuenta con validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision-lenguaje), etiqueta `qwen3_vl`; derivado de Qwen/Qwen3-VL-8B-Instruct |
| Parametros totales | 8 767 123 696 (aproximadamente 8,77 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32 768 tokens (longitud maxima usada en el SFT); no se documenta la ventana final del checkpoint |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; sin GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponibles (no se declaran en la model card ni en las etiquetas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-VL-8B-Instruct |
| Metodo de ajuste | SFT con ms-swift (2 epocas, lr 1e-6, max length 32k) |
| Tamano del repositorio | 17,5 GB |
| Fecha de publicacion | 2026-09-18 |

## Arquitectura y entrenamiento

El checkpoint parte del Qwen3-VL-8B-Instruct, un transformer denso multimodal que procesa texto e imagen mediante un codificador visual y un decodificador de lenguaje. Este ajuste concreto no modifica la topologia del modelo base: se aplica SFT sobre los pesos heredados, por lo que conserva la torre de vision y la ventana de contexto larga del original, aunque la model card solo garantiza el entrenamiento hasta 32 768 tokens. No se documentan cambios en el mecanismo de atencion ni innovaciones arquitectonicas propias.

Los datos de entrenamiento consisten en 1 500 demostraciones del entorno TrapField, extraidas del split de entrenamiento del dataset AIcell/SPAgent-NonFrozenLake-2K, restringidas a tableros cuya longitud optima de solucion es menor o igual a 10. La mezcla incluye 600 trayectorias multi-turno con uso de herramientas y 900 respuestas directas cuyo razonamiento ejecuta comprobaciones de vecinos paso a paso sobre la rejilla de texto. La receta declarada es `nonfrozenlake/make_sft.py --env trapfield --n 1500 --tool-frac 0.4 --max-len 10 --direct-style verbose --seed 3`, seguida del script `_sft_nonfrozenl.sbatch` con `EPOCHS=2`. No se menciona RLHF ni DPO en esta fase; el RL posterior (GRPO) se describe como trabajo derivado, no como parte de este checkpoint.

## Capacidades

- Generacion de texto y razonamiento paso a paso, con estilo de respuesta "verbose" heredado de las demostraciones de entrenamiento.
- Tool calling y uso de herramientas en trayectorias multi-turno: 600 de las 1 500 demostraciones del SFT pertenecen a esta modalidad.
- Razonamiento sobre rejillas de texto con verificacion de vecinos paso a paso (comprobacion local del estado antes de decidir la accion).
- Respuesta directa sin herramientas para el mismo tipo de tareas de planificacion (900 demostraciones).
- Capacidades multimodales heredadas del Qwen3-VL-8B-Instruct (vision), si bien no se documenta validacion de las mismas tras el SFT.
- Capacidades multilingues: no disponibles; no se declaran idiomas en la model card.
- Modo "thinking" explicito: no disponible.
- Soporte de agentes multi-paso: unicamente en el dominio del entorno TrapField para el que fue entrenado.

## Casos de uso

- Punto de arranque para RL con GRPO: el checkpoint esta disenado explicitamente como inicializacion en paridad de recompensa, de modo que un equipo de investigacion puede lanzar sus propias ejecuciones de GRPO y comparar el colapso de politica descrito por el autor.
- Reproduccion de experimentos de agentes en entornos tipo gridworld: sirve para replicar la receta de SFT declarada (dataset, `tool-frac`, `seed`, numero de epocas) y auditar la variabilidad entre semillas.
- Generacion de trayectorias sinteticas de tool-use: el modelo puede producir cadenas multi-turno con llamadas a herramientas y comprobaciones de vecinos, utiles como datos de partida para otros ajustes o para aumentar un dataset de agentes.
- Evaluacion de robustez pre-RL: permite medir cuanto de la capacidad final proviene del SFT y cuanto del RL, comparando la tasa de exito de este checkpoint con la de los checkpoints posteriores de GRPO.
- Investigacion sobre colapso de estrategia en RL: al partir de una politica que resuelve el entorno por dos vias (herramientas y respuesta directa), es un banco de pruebas para estudiar por que el GRPO sin regularizar converge a una sola de ellas.
- Formacion y prototipado en ms-swift: sirve como ejemplo completo de pipeline SFT (script de datos mas sbatch) para equipos que quieran montar flujos equivalentes con modelos vision-lenguaje.
- Evaluacion comparativa de politicas multimodales en tareas de planificacion: el modelo permite comprobar si la torre de vision aporta ventaja frente a una politica puramente textual en entornos con representacion en rejilla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato cuantitativo recogido en la model card es la paridad de recompensa del GRPO posterior: ambas estrategias alcanzan entre 0,89 y 0,98 de exito en los primeros pasos de entrenamiento desde este checkpoint. Ese valor no es un benchmark de capacidades generales y no debe presentarse como tal.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 17,5 GB solo de pesos, mas activaciones y cache KV; en la practica conviene reservar 22-24 GB para contexto moderado.
- VRAM estimada en int8: alrededor de 9-10 GB de pesos.
- VRAM estimada en int4: alrededor de 5-6 GB de pesos, con perdida de calidad no medida en este checkpoint.
- GPU de datacenter recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB para servicio concurrente.
- GPU de consumo: si cabe en RTX 4090 y RTX 3090 (24 GB) en bf16, y en RTX 4060 Ti 16 GB o RTX 4080 con cuantizacion int8/int4. El modelo base tambien puede ejecutarse en GPUs de 12 GB solo con cuantizacion agresiva.
- Opciones de despliegue: vLLM, SGLang o TGI para inferencia en GPU; llama.cpp u Ollama requieren conversion a GGUF y soporte de la torre de vision (no publicada en este repositorio); ms-swift para entrenamiento y evaluacion.
- Latencia y throughput: no disponibles; no se publican mediciones.
- Nota: al ser un modelo vision-lenguaje, el consumo de memoria incluye el codificador visual, no solo el decodificador de texto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| trapfield-qwen3vl8b-sft-warm3-parity-step188 | 8,77 B | 32 768 tokens (SFT) | Apache-2.0 | SFT de tool-use sobre el entorno TrapField |
| Qwen/Qwen3-VL-8B-Instruct | aproximadamente 8,77 B (mismo backbone) | no disponible | Apache-2.0 | Modelo vision-lenguaje de proposito general, con instrucciones |
| Qwen2.5-VL-7B-Instruct | no disponible | no disponible | no disponible | Modelo vision-lenguaje de proposito general |
| InternVL3-8B | no disponible | no disponible | no disponible | Modelo vision-lenguaje de proposito general |

Los datos de los modelos comparativos no figuran en la informacion proporcionada y la busqueda web realizada no devolvio resultados tecnicos relevantes (unicamente paginas comerciales sin relacion con el modelo), por lo que se marcan como no disponibles. La diferencia funcional principal frente al modelo base es que este checkpoint esta especializado en un unico entorno de agentes y no debe considerarse un modelo de proposito general.

## Limitaciones y advertencias

- Modelo de investigacion, no de proposito general: fue ajustado exclusivamente sobre demostraciones del entorno TrapField y su comportamiento fuera de ese dominio no esta caracterizado.
- Riesgo de sobreajuste al formato de las demostraciones: el estilo de respuesta "verbose" y la verificacion de vecinos paso a paso pueden reproducirse de forma espuria en contextos ajenos al entorno.
- Colapso de politica documentado: el autor indica que el GRPO sin regularizar desde este checkpoint converge a una unica estrategia, lo que limita su uso como politica final sin control adicional.
- Sin benchmarks publicados ni evaluacion de alucinacion: no hay datos de fiabilidad factual.
- Idiomas no documentados: no se puede asumir un comportamiento multilingue correcto.
- Capacidades de vision no verificadas tras el SFT: aunque hereda la torre visual del modelo base, la model card no reporta evaluacion multimodal de este checkpoint.
- Sin cuantizaciones oficiales: no hay GGUF, AWQ ni GPTQ publicados, lo que anade trabajo de conversion para despliegues en CPU o GPUs pequenas.
- Revision escasa: 0 descargas y 0 me gusta en el momento de redactar la ficha; no hay validacion independiente de los resultados declarados.
- Licencia Apache-2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base y del dataset de origen antes de un despliegue en produccion.
- Formato de pesos unico (safetensors) con un repositorio de 17,5 GB: el almacenamiento y la transferencia deben planificarse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dolphin42/trapfield-qwen3vl8b-sft-warm3-parity-step188
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Dataset de origen de las demostraciones: https://huggingface.co/datasets/AIcell/SPAgent-NonFrozenLake-2K
- Libreria de entrenamiento ms-swift: https://github.com/modelscope/ms-swift
- Paper, blog o demo adicionales: no disponibles (la busqueda web no devolvio resultados relacionados con el modelo)
