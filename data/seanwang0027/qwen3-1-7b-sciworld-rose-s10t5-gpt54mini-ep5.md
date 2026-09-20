# SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep5

## Resumen

Este modelo es un ajuste fino de Qwen/Qwen3-1.7B desarrollado por el usuario SeanWang0027 para actuar como agente autonomo en ScienceWorld, un entorno simulado de experimentos cientificos. Se trata de un modelo denso (no MoE) de 2.031.739.904 parametros entrenado con la tecnica ROSE (online multi-turn) para imitar el comportamiento de un profesor externo, `gpt-5.4-mini`, que resuelve tareas del entorno mientras el alumno interactua con el simulador. El checkpoint corresponde a la epoca 5 del estudio y es, segun la model card, el mejor de toda la serie.

El problema que aborda es concreto: los modelos pequenos fallan de forma sistematica al operar entornos interactivos con acciones validas. El Qwen3-1.7B base obtiene un 0.12% de exito en el test de ScienceWorld, mientras que este checkpoint alcanza un 25,75% ± 1,30 (media de 4 pasadas independientes). Parte de la mejora respecto a alternativas SFT se explica por la desaparicion casi total de un artefacto de imitacion: la accion literal `open/close OBJ` que el profesor emitia en un 29,89% de sus turnos y que el simulador rechaza siempre. En este checkpoint ese habito solo aparece en el 2,77% de los turnos de test, frente al 74,20% del SFT de la epoca 2.

Es relevante ahora porque documenta un caso de destilacion on-policy sobre un modelo de 2.000 millones de parametros con resultados medibles, y porque la propia model card publica los numeros de todas las epocas, incluidas las que empeoran. El modelo esta publicado bajo licencia Apache 2.0 y con soporte de `transformers` y de TGI, aunque no se han publicado cuantizaciones oficiales ni datos sobre idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen3-1.7B); no se detallan capas ni cabezas en la model card |
| Parametros totales | 2.031.739.904 (2,03 B), medidos sobre los safetensors del repositorio |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No especificada en la model card de este fine-tune. El modelo base Qwen3-1.7B declara 32.768 tokens nativos. El entrenamiento uso 512 tokens por turno |
| Tipos de cuantizacion | No disponible. El autor solo publica pesos en safetensors (bf16); no hay GGUF, AWQ ni GPTQ oficiales |
| Idiomas soportados | No disponible. La model card no los declara; el entrenamiento y la evaluacion se hicieron en ingles sobre ScienceWorld |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors, cargables con `transformers` (repo de 4,1 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-1.7B sin modificaciones estructurales: un transformer decoder-only denso de aproximadamente 2.000 millones de parametros. Lo relevante de esta ficha no es la topologia, sino el procedimiento de entrenamiento, denominado ROSE (online multi-turn) en la model card. En cada episodio el alumno juega los 10 primeros turnos en un entorno ScienceWorld real; despues, el profesor (`gpt-5.4-mini` via API de OpenAI, con `reasoning_effort=medium`) continua ese mismo entorno durante un maximo de 5 turnos. Solo los turnos del profesor son objetivo de entrenamiento (entropia cruzada); los turnos del alumno y todas las observaciones forman parte del contexto, y unicamente se usa la respuesta visible del profesor, no su razonamiento interno.

El corpus consta de 2.059 variaciones de tarea, con 32 episodios por paso y 64 pasos por epoca, generando prefijos de alumno y continuaciones de profesor nuevos en cada epoca. El optimizador es AdamW con learning rate constante de 1e-5, precision bf16, thinking desactivado y 512 tokens por turno. Este checkpoint no arranca del modelo base: se inicializa desde los pesos de la epoca 3 (paso 192 de la ejecucion original) con un estado de AdamW reinicializado, y corresponde al paso 128 de esa continuacion. La innovacion destacable es metodologica: al alternar turnos reales del alumno con turnos del profesor se obtiene una senal de destilacion on-policy, y el estudio documenta que el principal artefacto aprendido (la plantilla `open/close OBJ`) oscila a lo largo del entrenamiento en lugar de decrecer de forma monotona.

## Capacidades

- Generacion de texto en formato ReAct estricto: el modelo responde con `Thought:\n...\n\nAction:\n<un comando>`, un unico comando por turno.
- Ejecucion de tareas interactivas multi-turno en el entorno ScienceWorld (manipulacion de objetos, medicion, mezclas, uso de instrumentos de laboratorio simulado).
- Razonamiento encadenado breve (thinking desactivado por diseno durante el entrenamiento).
- Interpretacion de observaciones del entorno devueltas como turnos de usuario.
- Tool calling / function calling: no disponible; no se documenta soporte de esquemas de herramientas genericos, la interfaz es texto plano con un comando por accion.
- Soporte de agentes y razonamiento multi-paso: si, es su proposito principal, hasta 30 rondas por episodio en la evaluacion.
- Capacidades multilingues: no documentadas; el entrenamiento es en ingles.
- Capacidades especiales: modo agente ReAct con `enable_thinking=False`; no hay vision, audio ni modo thinking.

## Casos de uso

- Investigacion en destilacion on-policy: reproducir el pipeline ROSE usando este checkpoint como referencia del mejor resultado de la serie (25,75% de exito) y comparar contra las epocas 3 y 6 para estudiar la oscilacion del artefacto `open/close OBJ`.
- Evaluacion de agentes en entornos textuales: servir como linea base reproducible en ScienceWorld con la configuracion exacta de la model card (temperatura 0,4, 512 tokens por turno, maximo 30 rondas, 4 pasadas).
- Desarrollo de frameworks de agentes: integrar el modelo en un bucle ReAct propio para validar parsers de acciones, gestion de memoria de episodio y politicas de reintento, dado que el formato de salida es rigido y facil de parsear.
- Generacion de datos sinteticos de trayectorias: usar el modelo para producir rollouts completos que despues se filtren por exito y se utilicen como material de entrenamiento para modelos mayores o para aprendizaje por refuerzo.
- Docencia y demostraciones de IA agentica: un modelo de 2.000 millones de parametros que cabe en una GPU de consumo permite mostrar en clase un agente que interactua con un simulador cientifico sin depender de APIs externas.
- Pruebas de robustez ante artefactos de imitacion: el checkpoint permite medir directamente el impacto de un sesgo de imitacion heredado del profesor (2,77% de turnos con `open/close`) y comparar contra checkpoints con tasas del 17,98% o 26,59%.
- Prototipado de asistentes cientificos educativos: como componente de un sistema mayor que traduzca lenguaje natural del estudiante a acciones validas sobre un laboratorio virtual.

## Benchmarks y rendimiento

Los unicos resultados disponibles son los del propio estudio, evaluados sobre el test de ScienceWorld con 200 variaciones de tarea, media de 4 pasadas independientes a temperatura 0,4, 512 tokens por turno, maximo 30 rondas, thinking desactivado y sin turno de sistema.

| Metodo | Epoca | Tasa de exito | Avg@1 | Turnos con `open/close ...` literal |
|---|---|---|---|---|
| Qwen3-1.7B base | — | 0,12% | — | — |
| SFT | 2 | 13,25% ± 2,56 | 0,1574 | 74,20% |
| SFT | 3 | 12,88% ± 1,24 | 0,1557 | 74,88% |
| ROSE 10+5 | 2 | 7,75% ± 1,92 | 0,1455 | 62,68% |
| ROSE 10+5 | 3 | 17,50% ± 2,29 (re-ejecucion: 15,38% ± 1,43) | 0,2942 (0,2512) | 35,22% |
| ROSE 10+5 | 4 | 20,25% ± 2,25 | 0,3433 | 17,98% |
| ROSE 10+5 | 5 (este modelo) | 25,75% ± 1,30 | 0,3692 | 2,77% |
| ROSE 10+5 | 6 | 20,75% ± 1,82 | 0,2946 | 26,59% |

Segun la model card, este checkpoint supera a la epoca 3 en 8,25 puntos (IC 95% [4,75; 12,00]) y al SFT con el mismo profesor en 12,88 puntos (IC 95% [8,50; 17,62]). La propia autoria advierte que la re-evaluacion de la epoca 3 con 4 pasadas nuevas movio su resultado de 17,50% a 15,38%, por lo que diferencias inferiores a unos 3 puntos quedan dentro del ruido de evaluacion. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: unos 4,1 GB en bf16/fp16, en torno a 2,1 GB en cuantizacion de 8 bits y 1,2-1,3 GB en 4 bits (estimaciones a partir de 2,03 B de parametros; el autor no publica cuantizaciones).
- VRAM adicional por cache KV: depende del contexto efectivo. En los escenarios de la model card (512 tokens por turno, hasta 30 rondas) la huella es pequena; con contextos de decenas de miles de tokens la cache pasa a dominar el consumo.
- GPU recomendadas: una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 son suficientes en bf16 para los regimenes de contexto del estudio. Para servicio concurrente con lotes grandes se recomienda A100 40/80 GB, H100 o L40S.
- Cabe en GPU de consumo: si, en cualquier tarjeta con 8 GB o mas en bf16, y en 6 GB o menos con cuantizacion de 8 o 4 bits.
- Opciones de despliegue: `transformers` con safetensors (ruta oficial documentada), TGI (la etiqueta `text-generation-inference` aparece en el repositorio) y vLLM. `llama.cpp` y Ollama requieren convertir previamente los pesos a GGUF, ya que no hay GGUF publicado.
- Latencia y throughput: no disponible. La model card no reporta tiempos de inferencia ni tokens por segundo.

## Comparativa con modelos similares

La informacion disponible solo permite comparar contra variantes del mismo estudio y contra el modelo base. No hay datos publicados de otros agentes de tamano similar.

| Modelo | Parametros | Contexto | Tasa de exito en ScienceWorld | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ROSE ep5) | 2,03 B | no especificado en la ficha; base Qwen3-1.7B con 32.768 tokens | 25,75% ± 1,30 | Apache 2.0 | HuggingFace, safetensors |
| ROSE ep3 | 2,03 B | idem | 17,50% ± 2,29 (15,38% en re-evaluacion) | Apache 2.0 | HuggingFace, safetensors |
| ROSE ep6 | 2,03 B | idem | 20,75% ± 1,82 | Apache 2.0 | HuggingFace, safetensors |
| SFT ep3 (mismo profesor) | 2,03 B | idem | 12,88% ± 1,24 | Apache 2.0 | HuggingFace, safetensors |
| Qwen3-1.7B base | 2,03 B | 32.768 tokens nativos | 0,12% | Apache 2.0 | HuggingFace, safetensors |

Comparativa con modelos de otras familias o con agentes genericos: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Ambito muy restringido: el modelo esta especializado en el formato ReAct y en las tareas de ScienceWorld. Fuera de ese entorno no hay garantia de comportamiento util.
- Artefacto de imitacion heredado: el profesor emitia la plantilla `open/close OBJ` en el 29,89% de sus turnos y el simulador la rechaza siempre. En este checkpoint la tasa baja al 2,77%, pero en otras epocas del mismo estudio llega al 26,59%, lo que indica que el sesgo persiste y puede reaparecer con otros prompts.
- Ruido de evaluacion: diferencias inferiores a unos 3 puntos porcentuales no son significativas, segun la propia re-evaluacion del checkpoint de la epoca 3.
- Riesgo de alucinacion: el modelo genera `Thought` en lenguaje natural antes de cada accion; esos razonamientos no estan verificados contra el estado real del entorno y pueden justificar acciones invalidas con explicaciones plausibles.
- Idioma: entrenado y evaluado en ingles; no se declaran idiomas soportados, por lo que el rendimiento en castellano es desconocido.
- Contexto: el entrenamiento uso 512 tokens por turno y ventanas de 10+5 turnos. El comportamiento con contextos muy largos no esta documentado para este fine-tune.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones aplicables a los datos generados por el profesor `gpt-5.4-mini` a traves de la API de OpenAI antes de un despliegue comercial.
- Advertencia de produccion: se trata de un checkpoint de investigacion con 0 descargas y 0 likes en el momento de la consulta, sin versionado semantico ni garantias de mantenimiento.
- Modo thinking desactivado: debe invocarse con `enable_thinking=False` y la plantilla de chat de Qwen3; usar other configuracion puede degradar el formato de salida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep5
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Checkpoint ROSE ep1: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep1
- Checkpoint ROSE ep2: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep2
- Checkpoint ROSE ep3: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-3ep
- Checkpoint ROSE ep4: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep4
- Checkpoint ROSE ep6: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep6
- Checkpoint SFT ep1: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-sft-gpt54mini-ep1
- Checkpoint SFT ep2: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-sft-gpt54mini-ep2
- Checkpoint SFT ep3: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-sft-gpt54mini-3ep
- Paper, blog o repositorio del metodo ROSE: no disponible en la informacion proporcionada.
- Documentacion de ScienceWorld o AgentGym: no disponible en la informacion proporcionada.
- Nota sobre la busqueda web: los resultados devueltos no guardan relacion con el modelo (contenido sobre parques acuaticos y videojuegos), por lo que no se incluye ningun enlace adicional.
