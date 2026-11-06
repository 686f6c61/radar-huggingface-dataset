# romplle/vlm-minigrid-rl-adapters

## Resumen

`romplle/vlm-minigrid-rl-adapters` es una coleccion de adaptadores LoRA publicados sobre el modelo vision-lenguaje `lusxvr/nanoVLM-222M`, un VLM de 222 millones de parametros. Los adaptadores han sido entrenados para una tarea muy concreta: dado un fotograma en primera persona de un entorno MiniGrid Empty, el modelo debe seleccionar una de tres acciones discretas (`left`, `right`, `forward`). El entrenamiento combina una fase de ajuste supervisado (SFT) sobre trayectorias generadas por un experto BFS y una fase posterior de aprendizaje por refuerzo con GRPO.

El interes del artefacto no reside en sus capacidades generales de VLM, sino en su valor como material reproducible para investigacion en RL aplicado a modelos pequenos: el repositorio incluye multiples variantes de adaptadores (distintos tamanos de rejilla 8x8 y 16x16, distintas epocas de SFT, varias semillas de GRPO, configuraciones de color de objetivo y de reinicio lejano) que permiten analizar la sensibilidad del RL a la inicializacion y al protocolo de evaluacion.

La licencia es MIT y el formato es PEFT/LoRA en safetensors, por lo que se carga sobre el modelo base mediante la libreria `peft`. El repositorio ocupa 0,8 GB. No se declaran idiomas soportados ni se publican resultados de benchmarks en la informacion disponible; la evaluacion se remite al README del repositorio de GitHub del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM base (nanoVLM-222M) con adaptadores LoRA; sin detalle de la arquitectura interna del base en la informacion disponible |
| Parametros totales | 222M en el modelo base; los adaptadores LoRA son adicionales (r=64) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se publican como adaptadores LoRA en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es `lusxvr/nanoVLM-222M`, un VLM de 222M de parametros. Sobre el se aplican adaptadores LoRA con rango 64 y alpha 64 sobre los modulos de atencion `q_proj`, `k_proj`, `v_proj` y `out_proj`. El pipeline declarado es `reinforcement-learning` y la libreria `peft`.

El entrenamiento se realiza en dos etapas. Primero, SFT sobre trayectorias de un experto BFS en MiniGrid Empty, con configuraciones para rejillas 8x8 y 16x16 y distintas duraciones (3, 8, 9 y 10 epocas segun la variante). Despues, GRPO sobre el adaptador SFT correspondiente, con el adaptador GRPO cargado de forma conjunta al de SFT (`--sft-adapter-path` y `--grpo-adapter-path`). El repositorio incluye variantes con multiples semillas (seed123, seed456), entrenamiento con color de objetivo mixto, reinicio desde posicion lejana (far-reset) y GRPO tras SFT corto. Los horizontes de evaluacion indicados son 12 pasos en 8x8 y 40 pasos en 16x16, pasados explicitamente mediante `--max-steps`.

## Capacidades

- Seleccion de accion discreta en MiniGrid Empty: el modelo elige entre `left`, `right` y `forward` a partir de un fotograma egocentrico.
- Percepcion visual de un unico frame de entorno de rejilla (entrada vision-lenguaje del VLM base).
- Razonamiento de politica a corto plazo, limitado al horizonte de evaluacion definido (12 o 40 pasos).
- No se documenta soporte de tool calling, function calling ni comportamiento agentico general.
- No se documenta capacidad multilingue ni modo de razonamiento extendido (thinking mode).
- No se documenta soporte de audio ni de vision general fuera del dominio MiniGrid.

## Casos de uso

- Investigacion en RL con modelos pequenos: reproducir el pipeline SFT + GRPO sobre un VLM de 222M para estudiar como varia el rendimiento con la epoca de SFT, la semilla y el tamano de rejilla, usando los adaptadores publicados como punto de partida.
- Analisis de sensibilidad a la inicializacion: comparar los adaptadores `grpo_adapter_8x8_handoff_from_e10_e{1,5,9}` para medir el efecto de la calidad del SFT previo en el resultado del RL.
- Estudio de robustez visual: usar la variante `grpo_adapter_8x8_c1train_color_from_e10_e9` para evaluar el comportamiento con color de objetivo mixto en lugar de fijo.
- Evaluacion de generalizacion a entornos mayores: emplear los adaptadores 16x16 con horizonte de 40 pasos para analizar el escalado del aprendizaje a rejillas mas grandes.
- Reproducibilidad de experimentos: los adaptadores estan organizados replicando la carpeta local `checkpoints/`, lo que permite ejecutar `scripts/test_models.py` del repositorio sin modificaciones.
- Docencia y formacion: material didactico para explicar la transicion de SFT a GRPO en un dominio controlado y de bajo coste computacional.
- Baseline para comparaciones: servir como referencia de politica aprendida en MiniGrid Empty frente a heuristicas BFS o agentes tabulares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite explicitamente al README del repositorio `romplle/vlm-minigrid-rl` para las cifras y el protocolo de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con un modelo base de 222M de parametros y adaptadores LoRA de rango 64, la huella es reducida y cabe holgadamente en GPUs de consumo, aunque no se publican cifras concretas.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano del base (222M), es plausible su ejecucion en GPUs consumer, pero no se confirma.
- Cabe en consumer GPU: previsiblemente si, dado el tamano del modelo base; sin confirmacion documentada.
- Opciones de despliegue: carga mediante `peft` sobre el modelo base `lusxvr/nanoVLM-222M`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| romplle/vlm-minigrid-rl-adapters | 222M (base) + LoRA | no disponible | Politica de acciones en MiniGrid | MIT | Hugging Face (adaptadores) |
| lusxvr/nanoVLM-222M | 222M | no disponible | VLM general | no disponible en la informacion | Hugging Face (modelo base) |
| Alternativas de VLM pequenos para RL | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en MiniGrid Empty con tres acciones discretas; no es un VLM de proposito general.
- No se declaran idiomas soportados, por lo que no puede asumirse capacidad multilingue.
- No se publican benchmarks ni metricas de rendimiento en la informacion disponible; la evaluacion depende del README del repositorio.
- Riesgo de alucinacion y de comportamiento fuera de distribucion si se aplica a entornos, tamanos de rejilla o acciones distintos de los entrenados.
- Los adaptadores GRPO requieren cargarse junto con su adaptador SFT correspondiente; un uso aislado puede no reproducir los resultados esperados.
- La licencia MIT permite uso comercial, pero el modelo base `lusxvr/nanoVLM-222M` tiene su propia licencia, que debe verificarse por separado antes de un uso en produccion.
- No se documentan sesgos especificos; al tratarse de un dominio sintetico, los riesgos de sesgo social son limitados, pero no se han evaluado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion externa por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/romplle/vlm-minigrid-rl-adapters
- Modelo base: https://huggingface.co/lusxvr/nanoVLM-222M
- Repositorio del proyecto: https://github.com/romplle/vlm-minigrid-rl
