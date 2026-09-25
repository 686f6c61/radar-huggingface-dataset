# SeanWang0027/qwen3-1.7b-textcraft-tcod-b2f-qwen3-32b-step49

## Resumen

El modelo `SeanWang0027/qwen3-1.7b-textcraft-tcod-b2f-qwen3-32b-step49` es un checkpoint de destilación experimental construido sobre `Qwen/Qwen3-1.7B`. Se trata de un estudiante de 2.031.739.904 parámetros (aproximadamente 2,03 mil millones, según los pesos en safetensors) que ha sido entrenado para imitar el comportamiento de un profesor mucho mayor, `Qwen/Qwen3-32B` en bf16, en el entorno TextCraft. El autor lo publica tal cual salió del entrenamiento (paso global 49) y advierte que los pesos no se han modificado respecto a la copia local.

La relevancia de esta ficha es doble. Por un lado, ilustra una técnica concreta de destilación, TCOD (backward-to-forward, con prefijo dorado decreciente y `checkpoint_steps` 5), aplicada a un modelo pequeño de la familia Qwen3. Por otro, demuestra que un modelo de 1,7 B puede adquirir competencia en una tarea agéntica acotada, el crafteo en TextCraft, con el modo de razonamiento desactivado (`thinking off`) y un formato conversacional ReAct de múltiples turnos. No es un modelo de propósito general afinado para conversación abierta, sino una pieza de investigación reproducible dentro de un pipeline de destilación.

El checkpoint procede del directorio `textcraft_tcod_b2f/global_step_49` y se subió para liberar espacio local. La evaluación declarada se realizó sobre las 100 tareas oficiales de test de TextCraft, con avg@4, 30 turnos, temperatura 0,4, 512 tokens por turno y razonamiento desactivado, aunque no se publican las puntuaciones obtenidas. Se desconoce la licencia y los idiomas declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (hereda la de Qwen/Qwen3-1.7B); detalles de capas, atencion y dimensiones no disponibles en la informacion proporcionada |
| Parametros totales | 2.031.739.904 (segun safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no publicados por el autor; al ser safetensors en bf16, admite cuantizacion posterior a 8 y 4 bits con herramientas externas |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-1.7B`, un transformer decoder-only denso. No se documentan en la informacion disponible cambios estructurales sobre esa base, por lo que se asume que la arquitectura es la del modelo original y que la intervencion se realiza exclusivamente a nivel de pesos mediante destilacion. El profesor es `Qwen/Qwen3-32B` en bf16, y en todo el proceso se trabaja con el razonamiento desactivado (`thinking off`), lo que implica que el estudiante no fue entrenado para generar cadenas de pensamiento largas.

La innovacion tecnica es el metodo TCOD (backward-to-forward), en el que el prefijo dorado se va acortando progresivamente con `checkpoint_steps` 5. Segun la documentacion de modelos hermanos del mismo autor, el entrenamiento se apoya en el codigo `kokolerk/TCOD` con un overlay `FutureBridge-OPD` sobre `trinity-rft`. En el caso concreto de esta ficha solo se indica que el checkpoint corresponde al paso global 49 de un run denominado `textcraft_tcod_b2f`. El formato de interaccion es ReAct multi-turno: la instruccion de entorno de AgentGym como primer turno de usuario, un acuse de recibo prefabricado del asistente y un turno de usuario por cada observacion, con respuestas del tipo `Thought:\n...\n\nAction:\n<una accion>`. El renderizado debe hacerse con la plantilla de chat de Qwen3 y `enable_thinking=False`.

## Capacidades

- Generacion de texto en formato ReAct: produce bloques `Thought` seguidos de una unica `Action` por turno.
- Razonamiento agéntico multi-turno limitado a 30 turnos en la configuracion de evaluacion.
- Resolucion de tareas de TextCraft (crafteo a partir de recetas y componentes disponibles en el entorno).
- Soporte de tool calling en sentido amplio: la accion emitida funciona como invocacion de una herramienta del entorno, aunque no se documenta un esquema formal de function calling.
- Seguimiento de instrucciones de entorno inyectadas como primer turno de usuario (formato AgentGym).
- Capacidades generales heredadas de Qwen3-1.7B: no verificadas ni documentadas en esta ficha.
- Capacidades multilingues: no disponibles.
- Modo de razonamiento explicito: desactivado por diseno (`thinking off`); no se documenta soporte de thinking mode.
- Vision y audio: no disponibles (el modelo base no es multimodal).

## Casos de uso

- Reproduccion de experimentos de destilacion: el checkpoint permite analizar el efecto del metodo TCOD y del paso 49 sobre el rendimiento en TextCraft, comparandolo con los checkpoints de las series BabyAI del mismo autor.
- Agente de referencia en el benchmark TextCraft: sirve como baseline de estudiante de 1,7 B frente a otros metodos de destilacion o de ajuste supervisado (por ejemplo, la variante `textcraft-sft-qwen3-32b-traj`).
- Generacion de trayectorias sinteticas para entornos de crafteo: las rollouts del directorio `runs/eval/` pueden reutilizarse como datos de arranque para entrenamientos posteriores o para anotacion.
- Prototipado de agentes ReAct en local: al ocupar aproximadamente 4,1 GB en bf16, se puede ejecutar en una GPU de consumo y validar rapidamente un bucle de agente con herramientas antes de escalar a un modelo mayor.
- Investigacion sobre formato conversacional: el par `messages buggy` y la variante con trayectorias de Qwen3-32B permiten estudiar como afecta la representacion de la conversacion (turnos frente a mensajes) al aprendizaje por destilacion.
- Evaluacion de pipelines de RL y distillation frameworks: al integrarse en un flujo con `trinity-rft` y el overlay `FutureBridge-OPD`, es util para verificar la infraestructura de entrenamiento antes de lanzar runs mas costosos.
- Sustituto de bajo coste del profesor en inferencia: para tareas de TextCraft ya vistas, el estudiante evita depender de Qwen3-32B en produccion o en evaluaciones a gran escala, reduciendo drasticamente los requisitos de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente describe el protocolo de evaluacion empleado: 100 tareas oficiales de test de TextCraft, avg@4, 30 turnos, temperatura 0,4, 512 tokens por turno y razonamiento desactivado, con las rollouts almacenadas en `runs/eval/` del repositorio de entrenamiento. No se incluyen cifras de exito ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 4,1 GB solo para los pesos, mas activaciones y cache KV; en la practica conviene disponer de 8 GB o mas de VRAM.
- VRAM estimada cuantizado: en torno a 2 GB en 8 bits y cerca de 1,2 GB en 4 bits, aunque el autor no publica pesos cuantizados.
- GPU recomendadas: cualquier GPU con 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070) para inferencia comoda; A100, H100 o L40S para servir en produccion con lotes grandes.
- Cabe en GPU de consumo: si, en modelos con al menos 8 GB de VRAM en bf16 y en practicamente cualquier GPU moderna de 6 GB o mas si se cuantiza a 4 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM y otros servidores compatibles con safetensors. No se incluyen archivos GGUF, por lo que llama.cpp y Ollama requeririan una conversion previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-1.7b-textcraft-tcod-b2f-qwen3-32b-step49 | 2,03 B (safetensors) | no disponible | no publicado | no disponible | HuggingFace (0 descargas, 0 likes) |
| Qwen/Qwen3-1.7B (modelo base) | 1,7 B | no disponible en esta ficha | no aplica a esta tarea | Apache 2.0 (segun el modelo original; verificar) | HuggingFace |
| SeanWang0027/qwen3-1.7b-textcraft-sft-qwen3-32b-traj | misma base, ~2 B | no disponible | no publicado | no disponible | HuggingFace |
| SeanWang0027/qwen3-1.7b-babyai-tcod-b2f-qwen3-32b-ep1/ep2/ep3 | misma base, ~2 B | no disponible | no publicado | no disponible | HuggingFace |

Los tres modelos alternativos de la tabla pertenecen al mismo autor y a la misma familia de experimentos, por lo que la comparacion directa es la mas informativa: comparten base, profesor (Qwen3-32B en bf16) y metodo TCOD, y solo cambian el entorno (TextCraft frente a BabyAI) o el tipo de ajuste (destilacion TCOD frente a SFT sobre trayectorias).

## Limitaciones y advertencias

- Modelo de investigacion: es un checkpoint intermedio (paso 49) subido para liberar espacio local, sin una model card orientada a uso en produccion.
- Licencia no especificada: no se indica la licencia del modelo, lo que impide determinar si se permite el uso comercial. Debe aclararse con el autor antes de cualquier despliegue comercial.
- Idiomas no declarados: se desconoce que idiomas soporta y con que calidad, mas alla del ingles presente en las instrucciones de AgentGym y en el formato ReAct.
- Dominio muy acotado: el entrenamiento esta orientado al entorno TextCraft; el rendimiento fuera de ese entorno (conversacion general, codigo, matematicas) no se ha evaluado y probablemente se haya degradado respecto al base.
- Razonamiento desactivado: no se entreno con thinking mode, por lo que no cabe esperar cadenas de razonamiento largas ni mejoras por `enable_thinking=True`.
- Riesgo de alucinacion: en tareas de agente, la generacion de acciones inexistentes o de componentes no disponibles en el entorno es un fallo tipico; el autor reconoce que las trayectorias de entrenamiento incluyen episodios fallidos ("nothing filtered").
- Formato de prompt fragil: requiere la plantilla de chat de Qwen3, `enable_thinking=False` y el esquema exacto `Thought:\n...\n\nAction:\n<una accion>`; desviarse de ese formato degrada la salida.
- Sin cuantizaciones oficiales: al publicarse solo safetensors, cualquier GGUF o cuantizacion debe generarla el usuario y asumir la perdida de calidad correspondiente.
- Sin benchmarks publicados: no hay evidencia numerica de rendimiento, por lo que no se puede comparar objetivamente con alternativas.
- Fecha de creacion inusual en los metadatos (2026-09-24), sin descargas ni likes: modelo practicamente sin validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SeanWang0027/qwen3-1.7b-textcraft-tcod-b2f-qwen3-32b-step49
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Variante SFT sobre trayectorias de Qwen3-32B: https://huggingface.co/SeanWang0027/qwen3-1.7b-textcraft-sft-qwen3-32b-traj
- Variante SFT con formato de mensajes: https://huggingface.co/SeanWang0027/qwen3-1.7b-textcraft-sft-qwen3-32b-messages-buggy
- Serie BabyAI TCOD-B2F, epoca 1: https://huggingface.co/SeanWang0027/qwen3-1.7b-babyai-tcod-b2f-qwen3-32b-ep1
- Serie BabyAI TCOD-B2F, epoca 2: https://huggingface.co/SeanWang0027/qwen3-1.7b-babyai-tcod-b2f-qwen3-32b-ep2
- Serie BabyAI TCOD-B2F, epoca 3: https://huggingface.co/SeanWang0027/qwen3-1.7b-babyai-tcod-b2f-qwen3-32b-ep3
- Codigo del metodo TCOD (referenciado en la documentacion del autor): https://github.com/kokolerk/TCOD
- Documentacion del port de BabyAI y del overlay FutureBridge-OPD (repositorio `online-rose`, rama `tcod-babyai`, archivo `docs/TCOD_BABYAI.md`): URL no disponible
- Entorno TextCraft / AgentGym (referenciado en la model card, sin enlace directo): URL no disponible
