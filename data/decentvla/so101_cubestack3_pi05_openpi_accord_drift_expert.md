# DecentVLA/so101_cubestack3_pi05_openpi_accord_drift_expert

## Resumen

`so101_cubestack3_pi05_openpi_accord_drift_expert` es un ajuste fino completo (full fine-tune) del modelo vision-language-action (VLA) π0.5 de Physical Intelligence, implementado sobre el stack JAX de openpi. Lo publica el proyecto DecentVLA dentro de su línea de investigación sobre aprendizaje federado en robótica, y está entrenado sobre tres sitios de datos SO-101 con la tarea CubeStack (apilar un cubo de color sobre otro). El modelo no es de propósito general: es un experto de política robótica para un robot de bajo coste SO-101 con dos cámaras y un espacio de acciones de 6 grados de libertad.

La relevancia técnica está en el método de entrenamiento: agregación federada FedAvg con el simulador NVFlare 2.8.1 y un esquema de co-entrenamiento entre clientes llamado ACCORD-C, que libera entre sitios un "pool" de acciones y lo incorpora al entrenamiento local mediante dos compuertas (drift y expert). El checkpoint publicado es el modelo servidor tras la ronda 30, con 3,35 mil millones de parámetros en bf16 y un repositorio de 5,3 GB.

Al ser un modelo de robótica y no un LLM, sus especificaciones (contexto, idiomas, cuantizaciones) no siguen los parámetros habituales de un modelo de lenguaje: la entrada es multimodal (imágenes 224×224, estado articular y prompt textual) y la salida es una secuencia de 50 acciones articulares absolutas a 30 fps.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA π0.5 (PaliGemma + action expert), implementación JAX de openpi |
| Parametros totales | 3,35 B (3.350 millones) |
| Parametros activos | no aplica (no es MoE); el banco de gradiente del co-entrenamiento toca 0,43 B de 3,35 B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos almacenados en bf16; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (prompts de entrenamiento en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint Orbax en formato openpi (`params/`), más `norm_stats.json` y metadatos JSON/YAML |
| Entrada | 2 cámaras (`front` → `base_0_rgb`, `wrist` → `left_wrist_0_rgb`), redimensionadas con pad a 224×224; tercer slot en cero y enmascarado; estado de 6 DOF en grados de servo como tokens discretos en el prompt |
| Salida | chunk de 50 acciones, 6 objetivos articulares absolutos (sin transformación delta), recortado a `[..., :6]`, a 30 fps |
| Normalización | quantile norm de openpi, estadísticas agrupadas de los tres clientes (`assets/so101_cubestack3/norm_stats.json`) |
| Tamaño del repositorio | 5,3 GB |

## Arquitectura y entrenamiento

El modelo parte de `pi05_base` (openpi JAX) y se ajusta de forma completa sobre datos de tres sitios. La arquitectura es la de π0.5: un backbone PaliGemma que procesa las imágenes y el prompt, más un "action expert" que genera el chunk de acciones. El estado articular se inyecta como tokens discretos dentro del prompt (`discrete_state_input`), y las acciones se emiten como objetivos articulares absolutos en lugar de deltas.

El entrenamiento usó el simulador NVFlare 2.8.1 con 4× GH200 (servidor más una GPU por cliente), 30 rondas × 250 pasos locales (7.500 pasos por cliente), batch de 32 por cliente más 16 muestras del banco por paso cuando la compuerta se abre, optimizador AdamW con lr 5e-5 (1k de warmup y luego prácticamente constante), betas (0,9; 0,95) y grad clip 1.0. La agregación es FedAvg uniforme sobre 3 clientes. La partición de datos es: c0 (sitio harry) con `Cube_Green_on_Orange` y `Cube_Orange_on_Green`, 55.870 frames; c1 (manuka) con `Cube_Green_on_Blue_manuka` y `Cube_Blue_on_Green_manuka`, 57.370 frames; c2 (kevin) con `Cube_Orange_on_Blue_kevin` y `Cube_Blue_on_Orange_kevin`, 35.554 frames. Cada repositorio es una tarea única con el prompt "Put the {x} cube on top of the {y} cube."; los repos de Kevin se re-promptearon el 2026-07-31.

La innovación está en ACCORD-C: cada cliente co-entrena con el pool de acciones que los otros sitios liberan en cada ronda, y ese co-entrenamiento se controla con dos compuertas. La compuerta **drift** fija el peso de co-entrenamiento por ronda según una sonda de deriva, `w = clip(δ/floor − 1, 0, 1)`. La compuerta **expert** restringe el gradiente del banco únicamente al action expert (`PaliGemma/llm/*_1/*`, `action_in/out_proj`, `time_mlp_in/out`), es decir, 19 de 51 tensores y 0,43 B de 3,35 B de parámetros. El checkpoint publicado es el modelo servidor tras la ronda 30 (`server_round_0030.pt`, contador interno 0-indexado que marca 29).

## Capacidades

- Control robótico de manipulación: genera chunks de 50 acciones articulares absolutas de 6 DOF a 30 fps para el robot SO-101.
- Ejecución de la tarea CubeStack: apilar un cubo de color sobre otro siguiendo el prompt "Put the {x} cube on top of the {y} cube.".
- Percepción multimodal con dos vistas: cámara frontal y cámara de muñeca, ambas procesadas a 224×224 con pad.
- Condicionamiento por estado: incorpora el estado articular de 6 DOF (grados de servo) como tokens discretos en el prompt.
- Generalización entre sitios mediante aprendizaje federado: el modelo servidor integra datos de tres particiones con pares de colores distintos.
- Co-entrenamiento ACCORD-C con compuertas de drift y expert, que modula qué parte del modelo recibe el gradiente del banco de acciones.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento general, matemáticas, visión general ni audio; el modelo es específico de política robótica.

## Casos de uso

- Manipulación de cubos en laboratorio con SO-101: desplegar el modelo como política de control para apilar cubos de colores concretos (verde sobre naranja, naranja sobre verde, verde sobre azul, azul sobre verde, naranja sobre azul, azul sobre naranja) usando las dos cámaras y el estado articular como entrada.
- Investigación en aprendizaje federado: usar el checkpoint como referencia del modelo servidor tras 30 rondas de FedAvg con ACCORD-C para comparar frente a entrenamiento centralizado o FedAvg estándar.
- Reproducción de experimentos: el repositorio incluye `run_config.yaml`, `train_config.json`, `partition_manifest.json` y `train_rounds.log`, lo que permite auditar la configuración y el registro por ronda del entrenamiento.
- Punto de partida para ajuste fino en nuevos sitios: al ser un full fine-tune con licencia Apache 2.0, se puede reentrenar sobre datos de otro robot SO-101 o de nuevas tareas de apilado.
- Servicio de política por red: envolver la política en `openpi.serving.websocket_policy_server.WebsocketPolicyServer` para exponer la inferencia a un cliente robótico remoto.
- Evaluación de robustez entre dominios: comparar el rendimiento del modelo agregado frente a políticas entrenadas por sitio para medir la transferencia entre particiones con pares de colores distintos.
- Docencia y prototipado en robótica de bajo coste: el SO-101 es una plataforma económica y el stack openpi/JAX permite reproducir el pipeline de inferencia con el fragmento de código de la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 5,3 GB en bf16; se necesita al menos esa cantidad de memoria para los pesos, más overhead de activaciones y del backbone PaliGemma. No se documenta una cifra oficial de VRAM.
- GPU de entrenamiento documentadas: 4× GH200 (servidor más una GPU por cliente) en el simulador NVFlare.
- GPU recomendadas para inferencia: no disponibles de forma explícita; por tamaño en bf16, una GPU con 16-24 GB o más es un punto de partida razonable, pero no está confirmado por el autor.
- ¿Cabe en GPU de consumo? No confirmado. El tamaño de pesos (5,3 GB) sugiere que podría caber en GPUs de consumo con suficiente VRAM, pero no hay datos publicados de latencia ni de funcionamiento en tarjetas concretas.
- Opciones de despliegue: openpi (JAX) mediante `policy_config.create_trained_policy` con la config `pi05_so101` de decent-vla (rama `feat/openpi-so101-cubestack3`); servidor websocket con `openpi.serving.websocket_policy_server.WebsocketPolicyServer`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La salida es un chunk de 50 acciones a 30 fps, pero no se publican medidas de tiempo de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (π0.5 SO-101 CubeStack, ACCORD-C) | 3,35 B | no disponible | Política VLA para SO-101 CubeStack | Apache 2.0 | Hugging Face, openpi JAX |
| π0.5 base (`pi05_base`, openpi) | 3,35 B (misma familia) | no disponible | VLA de propósito general | no disponible en la información | openpi |
| Brazos centralizado y FedAvg del paper DecentVLA (backend lerobot/PyTorch) | 3,35 B | no disponible | Misma tarea CubeStack SO-101 | no disponible | Referencia del paper, no publicados aquí |

La comparación directa con los brazos del paper es imperfecta: según la propia model card, los brazos centralizado y FedAvg usaron el backend lerobot (PyTorch) con lr 2,5e-5 coseno y los prompts antiguos de Kevin, mientras que este modelo usa openpi JAX, lr 5e-5 y los prompts actualizados. Comparten presupuesto, partición, datos, espacio de acciones y normalizador agrupado, pero difieren en backend, tasa de aprendizaje y prompts.

## Limitaciones y advertencias

- Modelo específico de tarea: solo se ha entrenado para CubeStack con seis pares de colores concretos; no es un VLA de propósito general ni un LLM.
- Dependencia de la configuración: la línea `serve` de `export_info.json` asume que `pi05_so101` está registrado en openpi, y no lo está; hay que usar la config de decent-vla en la rama `feat/openpi-so101-cubestack3`.
- Comparación no equivalente con el paper: backend, tasa de aprendizaje y prompts de Kevin difieren de los brazos centralizado y FedAvg publicados, por lo que las comparaciones de rendimiento deben hacerse con cautela.
- Riesgo de sobreajuste a la partición: al ser un modelo servidor agregado de tres sitios, el comportamiento en un robot o entorno distinto no está garantizado.
- Sin datos de benchmarks, latencia ni VRAM: no hay evidencia publicada de rendimiento cuantitativo ni de requisitos de hardware para inferencia.
- Idiomas no disponibles: los prompts de entrenamiento están en inglés y no se documenta soporte multilingüe.
- Sesgos y alucinaciones: no se documentan sesgos conocidos; en robótica, el riesgo equivalente es la ejecución de acciones erróneas o inseguras fuera de la distribución de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo se distribuye tal cual.

## Enlaces

- Hugging Face: https://huggingface.co/DecentVLA/so101_cubestack3_pi05_openpi_accord_drift_expert
- Dataset `DecentVLA/Cube_Green_on_Orange`: https://huggingface.co/datasets/DecentVLA/Cube_Green_on_Orange
- Dataset `DecentVLA/Cube_Orange_on_Green`: https://huggingface.co/datasets/DecentVLA/Cube_Orange_on_Green
- Dataset `DecentVLA/Cube_Green_on_Blue_manuka`: https://huggingface.co/datasets/DecentVLA/Cube_Green_on_Blue_manuka
- Dataset `DecentVLA/Cube_Blue_on_Green_manuka`: https://huggingface.co/datasets/DecentVLA/Cube_Blue_on_Green_manuka
- Dataset `DecentVLA/Cube_Orange_on_Blue_kevin`: https://huggingface.co/datasets/DecentVLA/Cube_Orange_on_Blue_kevin
- Dataset `DecentVLA/Cube_Blue_on_Orange_kevin`: https://huggingface.co/datasets/DecentVLA/Cube_Blue_on_Orange_kevin
- openpi (repositorio de Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- NVFlare: https://github.com/NVIDIA/NVFlare
- LeRobot: https://github.com/huggingface/lerobot
- Paper DecentVLA: no disponible en la información proporcionada
- Repositorio decent-vla (rama `feat/openpi-so101-cubestack3`): no disponible como URL en la información proporcionada
