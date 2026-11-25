# jungwook2358/Qwen3.5-4B-wsp-exp0028-p2-p3s40-interim

## Resumen

Qwen3.5-4B-wsp-exp0028-p2-p3s40-interim es una variante experimental del modelo multimodal Qwen3.5-4B de Alibaba Qwen, publicada por el usuario jungwook2358 en Hugging Face. No se trata de un modelo entrenado, sino de un checkpoint de Qwen3.5-4B al que se le ha aplicado una edicion directa de pesos (weight editing) mediante una actualizacion de bajo rango de rango 1 sobre una unica matriz del modelo. El autor la describe explicitamente como un resultado intermedio de una sesion de edicion que aun estaba en curso en el momento de la subida.

El modelo conserva intactos la configuracion, el tokenizer, la plantilla de chat y los preprocesadores de imagen del Qwen3.5-4B original (revision 851bf6e8), por lo que carga como un Qwen3.5-4B estandar, vision incluida. La unica diferencia respecto al base es el tensor `model.language_model.layers.31.mlp.down_proj.weight`, modificado con una actualizacion low-rank `W + U V^T` de rango 1 que afecta a 11.776 parametros de patch y altera 21.136.490 de los 23.592.960 valores bf16 almacenados en ese tensor. Los otros 737 tensores del checkpoint son byte-identicos al modelo base.

La relevancia de esta ficha es acotada y debe interpretarse con cautela: el autor advierte que el modelo no ha pasado ninguna comprobacion de aceptacion, no se ha evaluado en los episodios de confirmacion reservados ni en LIBERO-PRO ni en ningun rollout de simulador, y no hay evidencia publicada de que la edicion mejore nada. Es un artefacto de investigacion sobre edicion de pesos orientada a comportamiento agente en tareas de robotica code-as-policy, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) heredada de Qwen3.5-4B; el autor no detalla la arquitectura interna en la informacion disponible |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con license_link al LICENSE de Qwen/Qwen3.5-4B) |
| Formato de pesos | safetensors (dos shards: `model.safetensors-00001-of-00002.safetensors` y `model.safetensors-00002-of-00002.safetensors`) |
| Tamano del repo | 9,3 GB |
| Modelo base | Qwen/Qwen3.5-4B, revision 851bf6e8 |
| Pipeline | image-text-to-text |
| Libreria | transformers |
| Tensor editado | `model.language_model.layers.31.mlp.down_proj.weight` (2560 x 9216) |
| Tipo de edicion | Actualizacion low-rank `W + U V^T`, rango 1 |
| Parametros del patch | 11.776 |
| Valores bf16 modificados | 21.136.490 de 23.592.960 (cambio maximo almacenado 0,1499) |
| Tensores sin cambios | 737 de 738 byte-identicos al base |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado. Segun la model card, no se realizo ningun paso de entrenamiento ni de gradiente: un agente de edicion (Claude Opus 5.5 en Claude Code) leyo el comportamiento y las activaciones del modelo base sobre una tarea de robotica code-as-policy (LIBERO, con el arnes PyRUA-Lean) y escribio directamente valores de pesos usando unicamente minimos cuadrados en forma cerrada y ridge. La edicion se aplica sobre una sola matriz del bloque 31 del modelo de lenguaje, mediante una actualizacion de rango 1 que modifica aproximadamente el 89,6 % de los valores almacenados de ese tensor.

La hipotesis del editor, tal como aparece en el patch, es que en turnos de "a punto de agarrar u operar" la frase de plan tiende a re-verificar o mirar en lugar de ejecutar la habilidad, y que un detector de etapa en la capa 31 redirige un empuje hacia verbos de accion y lo aleja de verbos de mirar o comprobar (manteniendo fijos los tokens de codigo, herramienta y percepcion) para que el turno use la habilidad. El objetivo de comportamiento declarado es que, en turnos donde un agente profesor actua (usa una habilidad de agarre o mueve el robot), el modelo sin editar a menudo mira o re-verifica en lugar de actuar. La nota tecnica sobre como se construyeron los dos factores esta en `wsp-patch/patch.json` (`meta.note`).

La arquitectura subyacente, los datos de entrenamiento del modelo base, el numero de tokens vistos y el proceso de alineacion (RLHF/DPO) no se detallan en la informacion proporcionada; corresponden al Qwen3.5-4B original y no se reproducen aqui.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen3.5-4B.
- Procesamiento de imagen y texto (pipeline image-text-to-text): el checkpoint incluye ambos ficheros de preprocesador y el componente de vision del base.
- Razonamiento y codigo en el marco de tareas code-as-policy, que es el dominio sobre el que se diseno la edicion (LIBERO).
- Capacidad de agente con uso de habilidades y acciones sobre un robot en el entorno de evaluacion descrito (arnes PyRUA-Lean).
- Soporte de tool calling / function calling: no confirmado de forma explicita en la informacion disponible; se asume el del modelo base, pero no se documenta aqui.
- Capacidades multilingues: no disponibles.
- Modo thinking, audio u otras capacidades especiales: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion sobre edicion de pesos: el caso de uso principal es estudiar como una actualizacion de rango 1 sobre una unica matriz de la capa 31 altera el comportamiento de seleccion de accion en tareas de robotica; sirve como referencia reproducible junto con `wsp-patch/patch.json` y `verify.json`.
- Analisis de atribucion de comportamiento por capas: comparar las activaciones y salidas de este checkpoint con las del Qwen3.5-4B base en los mismos prompts permite aislar el efecto del detector de etapa de la capa 31 sobre la eleccion entre verbos de accion y de verificacion.
- Reproduccion de experimentos code-as-policy: cargar el checkpoint en el arnes PyRUA-Lean y ejecutar los episodios de confirmacion reservados (que el autor no ha probado) para validar o refutar la hipotesis del patch.
- Base para iteraciones de edicion posteriores: al ser un resultado intermedio, sirve como punto de partida para sesiones de edicion que reemplacen o descarten este patch, comparando el estado del tensor editado con el base.
- Estudio de robustez de checkpoints editados: evaluar si una modificacion del 89,6 % de los valores de un tensor con cambio maximo de 0,1499 degrada capacidades generales del modelo base (texto, vision) fuera del dominio de robotica.
- Docencia y divulgacion tecnica: ilustrar de forma concreta que es una actualizacion low-rank de rango 1 aplicada a un transformer multimodal real, con los ficheros de codigo (`patch.py`, `write_patched_checkpoint.py`) como material de ejemplo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo no ha pasado ninguna comprobacion de aceptacion, no se ha probado en los episodios de confirmacion reservados y no se ha evaluado en LIBERO-PRO ni en ningun rollout de simulador.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud para un modelo de 4,66 mil millones de parametros, en bf16 los pesos ocupan aproximadamente 9,3 GB (coincide con el tamano del repo); en cuantizaciones de 8 bits o 4 bits el requisito seria considerablemente menor, pero no se documentan cuantizaciones soportadas para este checkpoint.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, cabria en GPUs de consumo con suficiente VRAM para el checkpoint completo en bf16, pero el autor no publica requisitos ni pruebas.
- Cabe en consumer GPU: no confirmado por el autor; el tamano de pesos en bf16 (unos 9,3 GB) es el dato objetivo disponible.
- Opciones de despliegue: la model card solo declara compatibilidad con la libreria `transformers` y el tag `endpoints_compatible`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Estado |
|---|---|---|---|---|---|
| Qwen3.5-4B-wsp-exp0028-p2-p3s40-interim | 4.659.865.088 | no disponible | Checkpoint editado (weight editing) | apache-2.0 | Resultado intermedio, sin evaluar |
| Qwen/Qwen3.5-4B (base) | no disponible en la informacion | no disponible | Modelo multimodal image-text-to-text | apache-2.0 | Modelo publicado por el autor original |
| Otras variantes de edicion de pesos de Qwen3.5-4B | no disponible | no disponible | Ediciones experimentales | no disponible | no disponible |

La comparativa con alternativas de la misma categoria no esta disponible en la informacion proporcionada; solo se conoce con certeza el modelo base, del que este checkpoint difiere en un unico tensor.

## Limitaciones y advertencias

- Resultado intermedio: el autor declara que es un resultado no terminado y que la sesion de edicion podria reemplazar o descartar este patch.
- Sin validacion: no ha pasado ninguna comprobacion de aceptacion, no se ha probado en episodios de confirmacion reservados ni en LIBERO-PRO ni en ningun rollout de simulador; nada indica que la edicion mejore el comportamiento.
- Alcance muy acotado: la edicion se diseno para turnos concretos de una tarea de robotica code-as-policy; su efecto fuera de ese dominio no esta caracterizado.
- Riesgo de degradacion: se modifican 21.136.490 de 23.592.960 valores bf16 de un tensor del bloque 31 (cambio maximo 0,1499), lo que podria afectar a capacidades generales del modelo base sin que se haya medido.
- Sesgos conocidos: no disponibles; no se documentan evaluaciones de sesgo para este checkpoint.
- Riesgo de alucinacion: no cuantificado en la informacion disponible.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia: apache-2.0, con enlace al LICENSE de Qwen/Qwen3.5-4B; las condiciones de uso comercial heredan las del modelo base y no se detallan mas alla en la model card.
- Uso en produccion: no recomendado; el propio autor lo presenta como artefacto de investigacion sin evidencia de mejora.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jungwook2358/Qwen3.5-4B-wsp-exp0028-p2-p3s40-interim
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Ficheros del patch (en el repo): `wsp-patch/patch.json`, `wsp-patch/factors.safetensors`, `wsp-patch/patch.py`, `wsp-patch/write_patched_checkpoint.py`, `wsp-patch/verify.json`, `wsp-patch/wsp-patched-checkpoint.json`
- Papers, blogs, repos o demos adicionales: no disponibles en la informacion proporcionada.
