# kabilanKB/cosmos_nano_policy_so101

## Resumen

cosmos_nano_policy_so101 es una politica de accion (vision-lenguaje-accion, VLA) de 6 grados de libertad para el brazo robotico SO-101, especializada en colocar objetos dentro de un contenedor de plastico. La publica el usuario kabilanKB como post-entrenamiento del modelo base nvidia/Cosmos3-Nano (15.173.136.576 parametros, unos 15,2 mil millones) mediante adaptadores LoRA y cabezas de accion entrenadas desde cero. El checkpoint distribuido corresponde a la iteracion 3750 de un entrenamiento de 4000 iteraciones, con los adaptadores LoRA ya fusionados en los pesos base y exportado como safetensors consolidados.

El modelo resuelve una tarea muy concreta: a partir de una instruccion de texto, una observacion visual concatenada (camara de muneca frontal superpuesta sobre una camara cenital, 480p) y el estado articular actual, predice un chunk de 32 pasos de acciones absolutas en espacio `joint_pos` a 30 fps. Su relevancia es metodologica: documenta el flujo completo de post-entrenamiento de Cosmos3-Nano como politica robotica sobre una unica GPU (RTX PRO 6000 de 96 GB) e incluye el pipeline abierto de entrenamiento, fusion, exportacion, serving y evaluacion.

Se trata de un checkpoint de investigacion con una tasa de exito declarada del 3,1% en simulacion, entrenado y evaluado exclusivamente en el gemelo digital de Isaac Lab. No es un modelo listo para produccion ni ha sido probado en un SO-101 fisico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA derivada de Cosmos3-Nano: backbone de lenguaje de Qwen3-VL-8B-Instruct, capas de generacion con componentes MoE (`q/k/v/o_proj_moe_gen`) y cabezas de accion (`action2llm`, `llm2action`, `action_modality_embed`) |
| Parametros totales | 15.173.136.576 (unos 15,2 mil millones) |
| Parametros activos | no disponible (el modelo base incluye capas con sufijo `_moe_gen`, pero no se publica el reparto de parametros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene safetensors consolidados en precision completa, sin variantes GGUF ni cuantizadas publicadas |
| Idiomas soportados | no disponible; las instrucciones de entrenamiento estan en ingles y el backbone (Qwen3-VL-8B-Instruct) es multilingue, pero la politica no se ha evaluado en otros idiomas |
| Licencia | OpenMDW License 1.1 (`openmdw1.1-license`), heredada de NVIDIA Cosmos3-Nano |
| Formato de pesos | safetensors (con `custom_code`, requiere `trust_remote_code`); tamano de repositorio 31,5 GB |
| Modelo base | nvidia/Cosmos3-Nano |
| Libreria | cosmos |
| Pipeline | robotics (politica de accion robotica) |
| Espacio de accion | `joint_pos` absoluto de 6 dimensiones (5 articulaciones del brazo mas pinza), unidades `.pos` de LeRobot; chunk de 32 pasos a 30 fps |
| Normalizacion | minmax contra los limites de calibracion: articulaciones [-100, 100], pinza [0, 100] (`so101_lerobot_stats.json`) |
| Dominio de encarnacion | domain id 22 (`so101`) |

## Arquitectura y entrenamiento

El modelo parte de Cosmos3-Nano, cuyo backbone de lenguaje deriva de Qwen/Qwen3-VL-8B-Instruct (Apache 2.0). Sobre esa base se anaden cabezas de accion especificas (`action2llm`, `llm2action` y `action_modality_embed`), entrenadas desde inicializacion aleatoria, y se aplica LoRA de rango 16 y alpha 32 sobre las proyecciones `q/k/v/o_proj_moe_gen`. Los adaptadores se fusionan despues en los pesos base. La entrada visual es una vista concatenada `concat_view`: la mitad superior corresponde a la camara de muneca frontal y la inferior a la camara cenital fija, a 480p (960x640). La observacion incluye ademas 5 valores de posicion articular y 1 de pinza.

El entrenamiento forma parte del experimento `action_policy_so101_nano_focus5`, sobre cosmos-framework `5e67049` con soporte local anadido para SO-101. Los datos son `so101_bench_sim_6`, restringidos a 5 instrucciones de un solo objeto (zapatos verdes, caja de carton, recipiente de altoids, maceta y cuchara de cocina) con la plantilla "Place the X in the plastic bin". Se usaron 97 episodios, 87 de ellos para entrenamiento. La programacion fue: batch global 32, learning rate 1e-4 (5x para las cabezas de accion), 200 pasos de warm-up y decaimiento lineal a lo largo de 4000 iteraciones, de las que la 3750 (4,17 epocas) es el checkpoint publicado. No se documenta RLHF ni DPO.

## Capacidades

- Generacion de acciones motoras: predice chunks de 32 acciones absolutas de 6 dimensiones (5 articulaciones de brazo mas pinza) para el SO-101.
- Percepcion visual multimodal: consume una vista concatenada de camara de muneca y camara cenital a 480p.
- Seguimiento de instrucciones en lenguaje natural: acepta un `prompt` textual del tipo "Place the X in the plastic bin", con cinco objetos soportados.
- Condicionamiento por estado: usa la posicion articular y de pinza actual (fila 0 del estado) como contexto para la prediccion.
- Seleccion de objeto por color o categoria en escenas de un solo objeto.
- Serving mediante websocket: expone un servidor tipo openpi (`action_policy_server_robolab`) que devuelve acciones por peticion.
- No dispone de tool calling, function calling, modo de razonamiento explicito, agentes multi-paso, audio ni generacion de texto general: es una politica de accion, no un modelo conversacional.

## Casos de uso

- Investigacion en post-entrenamiento de VLA: sirve como referencia reproducible de como adaptar Cosmos3-Nano a una tarea robotica concreta mediante LoRA y cabezas de accion, con el pipeline completo documentado.
- Baseline para nuevos checkpoints SO-101: sus 17 exitos sobre 542 episodios (3,1%) y la desagregacion por lado de la mesa permiten medir si una nueva politica mejora la manipulacion en lado cercano y resuelve el lado lejano.
- Desarrollo de infraestructura de serving robotico: el flag set obligatorio del servidor (`--arm-joint-dim`, `--no-flip-gripper`, `--action-normalization`, `--view-description`) permite validar integraciones websocket y detectar fallos silenciosos de configuracion.
- Evaluacion en gemelo digital: integrable en `so101_bench` (Isaac Lab, tarea `So101Bench-Bin-v0`) para lanzar barridos de evaluacion de 100 episodios de 25 s con 32 acciones por inferencia.
- Estudio de sensibilidad al horizonte de accion: el modelo permite comparar configuraciones de chunk (horizonte 32 frente a 16) sobre las mismas escenas, un eje poco explorado en politicas VLA pequenas.
- Analisis de causas de fallo en politicas de manipulacion: dado que casi todos los fallos son time-outs en los que el objeto nunca se levanta, es util para estudiar modos de fallo de agarre y planificacion a corto plazo.
- Docencia y practicas de robotica: como ejemplo abierto y de bajo coste computacional relativo (una sola GPU de 96 GB para entrenar) del ciclo completo simulacion-entrenamiento-evaluacion.

## Benchmarks y rendimiento

Evaluacion en el gemelo digital de Isaac Lab, tarea `So101Bench-Bin-v0`: 100 episodios de un solo objeto (`tasks/focus5.jsonl`), 25 s por episodio, 32 acciones ejecutadas por llamada de inferencia.

| Escenario | Exitos / episodios | Tasa de exito |
|---|---:|---:|
| Un solo objeto, todas las ejecuciones hasta 2026-09-13 | 17 / 542 | 3,1% |
| Objeto en el mismo lado de la mesa que el contenedor (layout fijo) | 13 / 252 | 5,2% |
| Objeto en el lado opuesto de la mesa (layout fijo) | 0 / 187 | 0% |
| Escenas desordenadas con 4 objetos | 0 / 48 | 0% |

Datos adicionales declarados por el autor:

| Comparacion | Resultado |
|---|---|
| Checkpoint 3500 | 0 / 20 |
| Checkpoint 4000 (menor perdida de entrenamiento) | 0 / 20 |
| Checkpoint 3750 con horizonte de accion 32 | 4 / 70 |
| Checkpoint 3750 con horizonte de accion 16 | 0 / 63 |

Todos los exitos se produjeron con el objeto en el mismo lado de la mesa que el contenedor; la mitad lejana de la tarea queda sin resolver. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes de robotica como LIBERO) en la informacion disponible.

## Requisitos de hardware

- Parametros totales: 15.173.136.576. El repositorio pesa 31,5 GB, coherente con pesos consolidados en precision de 16 bits (unos 30 GB de pesos).
- VRAM estimada para inferencia, calculada a partir del numero de parametros (el autor no publica cifras): en bf16/fp16, del orden de 32 GB o mas, incluyendo activaciones de vision a 480p y el chunk de 32 acciones; en int8, en torno a 16-18 GB; en 4 bits, en torno a 9-10 GB. Son estimaciones, no datos confirmados.
- GPU de entrenamiento documentada: una RTX PRO 6000 de 96 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB o RTX PRO 6000 96 GB para precision completa. No cabe en GPUs de consumo de 24 GB (RTX 4090, 3090) en bf16; requeriria cuantizacion no documentada.
- Opciones de despliegue: la unica via documentada es el servidor websocket `cosmos_framework.scripts.action_policy_server_robolab` (estilo openpi), con flags obligatorios especificos de SO-101. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- El soporte de SO-101 usado (`--arm-joint-dim`, `--no-flip-gripper`, `--action-normalization`, `--view-description`) no esta en el cosmos-framework upstream `5e67049`.
- Latencia y throughput: no disponibles. La evaluacion se ejecuta a 30 fps de condicionamiento y 32 acciones por llamada de inferencia, pero no se publican tiempos por inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cosmos_nano_policy_so101 | 15,17 mil millones | no disponible | 3,1% en `So101Bench-Bin-v0` (17/542) | OpenMDW 1.1 | HuggingFace, safetensors, `custom_code` |
| nvidia/Cosmos3-Nano (modelo base) | 15,17 mil millones | no disponible | no disponible | OpenMDW 1.1 | HuggingFace |
| Otras politicas VLA para SO-101 (LeRobot, openpi, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de resultados de benchmarks de terceros para establecer una comparacion cuantitativa con OpenVLA, pi0, GR00T N1 u otras politicas VLA en la informacion proporcionada. La unica comparacion fiable es contra los propios checkpoints del mismo entrenamiento (3500 y 4000), que obtuvieron 0/20 cada uno.

## Limitaciones y advertencias

- Tasa de exito muy baja: 3,1% global (17 de 542 episodios). El propio autor lo describe como un checkpoint de investigacion.
- Mitad de la tarea sin resolver: 0% de exito cuando el objeto esta en el lado opuesto de la mesa al contenedor, y 0% en escenas desordenadas con 4 objetos.
- Solo probado en simulacion. No ha sido validado en un brazo SO-101 fisico, por lo que no hay garantia de transferencia sim-to-real.
- Cobertura de tareas minima: cinco objetos y una unica familia de instrucciones ("Place the X in the plastic bin"), con 18-25 demostraciones por instruccion.
- Muestreo estocastico: el servidor genera una semilla nueva en cada peticion y ninguna escena ha tenido exito de forma fiable, lo que introduce alta varianza entre ejecuciones.
- La perdida de entrenamiento no predice el exito: la iteracion 4000 tiene la menor perdida y obtuvo 0/20.
- Sensibilidad al horizonte de accion: horizonte 32 dio 4/70 frente a 0/63 con horizonte 16 en las mismas escenas, lo que hace fragil la configuracion de despliegue.
- Riesgo de fallo silencioso en el serving: si falta cualquiera de los flags obligatorios de SO-101, el servidor arranca pero devuelve acciones incorrectas.
- Licencia OpenMDW 1.1 heredada de Cosmos3-Nano; al ser una licencia "other", conviene revisar sus terminos antes de cualquier uso comercial. El backbone de lenguaje deriva de Qwen3-VL-8B-Instruct (Apache 2.0).
- Riesgo de alucinacion en el sentido de ejecucion de acciones sin sentido sobre estados fuera de distribucion: el modelo esta entrenado con limites de normalizacion muy concretos (articulaciones [-100, 100], pinza [0, 100]) y puede producir valores fuera de rango si el estado observado se sale de esos limites.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kabilanKB/cosmos_nano_policy_so101
- Modelo base en HuggingFace: https://huggingface.co/nvidia/Cosmos3-Nano
- Repositorio del pipeline (entrenamiento, fusion, exportacion, serving y evaluacion): https://github.com/kabilankb/so101-cosmos-nano-policy
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Backbone de lenguaje: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Los resultados de la busqueda web proporcionada no contienen informacion relevante sobre este modelo (corresponden a resultados de agencias de viaje sobre Palma de Mallorca y se han descartado).
