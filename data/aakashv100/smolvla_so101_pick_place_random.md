# aakashv100/smolvla_so101_pick_place_random

## Resumen

SmolVLA SO-101 pick-and-place (random cube positions) es un modelo de vision-lenguaje-accion (VLA) orientado al control de robots, desarrollado por el usuario aakashv100 y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un ajuste fino del modelo base lerobot/smolvla_base sobre el dataset aakashv100/so101-pick-place-random-trimmed, y resuelve una tarea robotica concreta: recoger un cubo y colocarlo dentro de una caja cuando el cubo aparece en posiciones aleatorias.

El modelo hereda la arquitectura de SmolVLA, que combina un encoder visual SigLIP, un modelo de lenguaje SmolLM2 y un experto de accion; segun la documentacion de referencia, en el ajuste fino solo se entrenan aproximadamente 50 M de parametros (el experto de accion y las proyecciones), mientras que el encoder visual y el modelo de lenguaje permanecen congelados. El repositorio contiene 450.046.176 parametros (unos 450 M) y ocupa 0.9 GB en disco.

Es relevante para desarrolladores de robotica porque demuestra un flujo completo de ajuste fino de un VLA para una tarea de manipulacion real sobre el brazo SO-101, con artefactos reproducibles (checkpoint, registro en Weights & Biases y conjunto de evaluacion) y una licencia permisiva apta para uso comercial. Su alcance es deliberadamente estrecho: es una politica especializada, no un modelo generativo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) derivada de SmolVLA: encoder visual SigLIP + modelo de lenguaje SmolLM2 + experto de accion |
| Parametros totales | 450.046.176 (aprox. 450 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas; solo pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de lerobot/smolvla_base, un VLA que procesa observaciones visuales y estado de articulaciones para emitir acciones de robot. Segun la documentacion de referencia consultada, SmolVLA emplea un encoder visual SigLIP y un modelo de lenguaje SmolLM2 congelados, y durante el ajuste fino solo se entrenan aproximadamente 50 M de parametros correspondientes al experto de accion y a las proyecciones. El modelo aqui descrito tiene 450 M de parametros totales.

El ajuste fino se realizo sobre el dataset aakashv100/so101-pick-place-random-trimmed (copia recortada de tramos inactivos). Los hiperparametros reportados son: 20.000 pasos, batch de 16, semilla 1000 y checkpoint 020000. Se usaron 45 episodios de entrenamiento y conjuntos de validacion de 47, 45, 37, 42 y 39 episodios. La perdida de validacion fue de 0,097 en el paso 20.000, con un minimo de 0,090 entre los pasos 6.000 y 10.000 (lo que sugiere un ligero sobreajuste a partir de ese punto). La tarea se define mediante la cadena exacta "Pick up the cube and place it in the box", y se emplean dos camaras con un renombrado fijo: top_cam a camera1 y gripper_cam a camera2, que debe replicarse en inferencia. El job de entrenamiento se registro en Weights & Biases con el identificador jjn8scoc.

## Capacidades

- Generacion de acciones de control para el brazo robotico SO-101 a partir de observaciones visuales y del estado de las articulaciones.
- Ejecucion de la tarea pick-and-place condicionada por la cadena de instruccion "Pick up the cube and place it in the box".
- Procesamiento simultaneo de dos flujos de camara (top_cam y gripper_cam) con un mapeo de nombres concreto.
- Generalizacion a posiciones aleatorias del cubo dentro del dominio de entrenamiento.
- Soporte de tool calling o function calling: no disponible (no es una capacidad de este tipo de modelo).
- Soporte de agentes y razonamiento multi-paso: no aplica en el sentido de agentes de texto; la politica ejecuta una secuencia motora de pick-and-place.
- Capacidades multilingues: no disponible.
- Capacidades especiales: control de robot (VLA); no incluye modo de razonamiento explicito, vision general, audio ni generacion de texto libre.

## Casos de uso

- Automatizacion de pick-and-place en laboratorio o linea de montaje: la politica recoge un cubo en posicion aleatoria y lo deposita en una caja, adecuada para tareas repetitivas de recogida y colocacion en entornos controlados.
- Robotica educativa con SO-101: sirve como ejemplo reproducible de ajuste fino de un VLA sobre demostraciones de teleoperacion, con checkpoint y registro de entrenamiento publicados.
- Base para nuevo ajuste fino: al derivar de smolvla_base y liberarse con Apache 2.0, puede reentrenarse sobre otros objetos o contenedores partiendo de este checkpoint.
- Evaluacion comparativa de politicas: util para contrastar SmolVLA frente a alternativas como ACT en la misma tarea, reutilizando el conjunto de evaluacion aakashv100/eval_sanity-smolvla-random-places.
- Recogida y clasificacion en logistica ligera: con nuevo ajuste fino podria adaptarse a depositar objetos en distintas ubicaciones, siempre dentro de un espacio de trabajo acotado y con camaras fijas.
- Pruebas de robustez ante variacion de posicion: el entrenamiento con posiciones aleatorias del cubo permite analizar la generalizacion posicional de una politica VLA.
- Prototipado de manipulacion en investigacion: como punto de partida para estudiar el efecto de datos recortados (idle-trimmed) y del numero de episodios en el rendimiento final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica cuantitativa reportada es la perdida de validacion durante el entrenamiento, que no constituye un benchmark estandar de robotica:

| Metrica | Valor |
|---|---|
| Perdida de validacion en el paso 20.000 | 0,097 |
| Perdida de validacion minima (pasos 6.000-10.000) | 0,090 |
| Pasos de entrenamiento | 20.000 |
| Batch | 16 |
| Semilla | 1000 |
| Episodios de entrenamiento | 45 |
| Episodios de validacion | 47, 45, 37, 42, 39 |

No se dispone de tasas de exito, MMLU, HumanEval, GSM8K ni metricas equivalentes, ya que no son aplicables a un modelo de control robotico.

## Requisitos de hardware

- Tamano de pesos: el repositorio ocupa 0.9 GB con 450 M de parametros en safetensors, coherente con pesos en precision de 16 bits (aproximadamente 0,9 GB); en fp32 serian unos 1,8 GB.
- VRAM estimada para inferencia: del orden de 1 a 2 GB para los pesos, mas el consumo de activaciones y del procesamiento de dos flujos de imagen; el dato exacto no esta disponible.
- GPU recomendadas: cualquier GPU moderna con suficiente VRAM; durante el ajuste fino la documentacion de referencia asociada a tareas similares emplea equipos como NVIDIA DGX. Para inferencia no se especifica modelo de GPU.
- GPU de consumo: si, cabe en GPUs de consumo (por ejemplo, series RTX) e incluso en plataformas embebidas tipo NVIDIA Jetson, aunque no se documenta una configuracion concreta.
- Opciones de despliegue: LeRobot, mediante --policy.path=aakashv100/smolvla_so101_pick_place_random. vLLM, llama.cpp, Ollama y TGI no son aplicables a este tipo de modelo (no es un LLM de texto).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| smolvla_so101_pick_place_random | 450 M | VLA ajustado (pick-and-place SO-101) | no disponible | no disponible (solo perdida de validacion 0,097) | apache-2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible (el blog de referencia cita mas de 500 M para SmolVLA) | VLA base | no disponible | no disponible | no disponible | Hugging Face |
| ACT (Action Chunking Transformer) | no disponible | Transformer de chunking de acciones | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos verificables de rendimiento entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Alcance muy reducido: el modelo esta especializado en una unica tarea (recoger un cubo y colocarlo en una caja) y no generaliza a otros objetos, tareas o entornos fuera de su distribucion de entrenamiento.
- Dependencia de la cadena de tarea exacta: en inferencia debe pasarse literalmente "Pick up the cube and place it in the box"; variaciones pueden degradar el comportamiento.
- Dependencia de la configuracion de camaras: es obligatorio replicar el renombrado top_cam a camera1 y gripper_cam a camera2 en inferencia.
- Sobreajuste probable: la perdida de validacion minima (0,090) se alcanza entre los pasos 6.000 y 10.000, mientras que el checkpoint final (paso 20.000) marca 0,097, lo que indica un ligero deterioro.
- Dataset de entrenamiento pequeno: solo 45 episodios de entrenamiento, lo que limita la robustez ante variaciones de iluminacion, oclusiones o cambios de disposicion.
- Adopcion nula: el repositorio registra 0 descargas y 0 me gusta, por lo que no cuenta con validacion de la comunidad.
- Idiomas soportados: no disponible; no es un modelo multilingue de texto.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero la politica puede producir acciones incorrectas ante escenas fuera de distribucion.
- Licencia: Apache 2.0 permite uso comercial y modificacion, siempre que se respeten las condiciones de atribucion de la licencia.
- No se documentan variantes cuantizadas ni requisitos de hardware concretos, lo que dificulta estimar el rendimiento en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aakashv100/smolvla_so101_pick_place_random
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/aakashv100/so101-pick-place-random-trimmed
- Dataset original: https://huggingface.co/datasets/aakashv100/so101-pick-place-random
- Conjunto de evaluacion de cordura: https://huggingface.co/datasets/aakashv100/eval_sanity-smolvla-random-places
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/aakashvardhan-madabhushi-san-jose-state-university/so101-smolvla/runs/jjn8scoc
- Dataset de evaluacion relacionado: https://huggingface.co/datasets/aakashv100/eval_so101-pick-cube-v2-smolvla-fixed
- Dataset de evaluacion relacionado (v2): https://huggingface.co/datasets/aakashv100/eval_so101-pick-cube-v2-smolvla-fixed-v2
- Blog sobre ajuste fino de SmolVLA para SO-101: https://ggando.com/blog/smolvla-so101/
- Repositorio GitHub de referencia SO-101 / smolVLA: https://github.com/nourel123/SO101-smolVLA
- Guia de ARM para ajustar SmolVLA en un NVIDIA DGX: https://learn.arm.com/learning-paths/laptops-and-desktops/finetune-smolvla-lerobot/
