# padiredd/groot-blockpick-dr-defaultaug

## Resumen

`groot-blockpick-dr-defaultaug` es un ajuste fino (fine-tune) del modelo fundacional de robotica `nvidia/GR00T-N1.7-3B`, publicado por el usuario `padiredd` en HuggingFace. Se trata de un modelo vision-language-action (VLA) especializado en una unica tarea de manipulacion: un pick top-down de un bloque verde lima con el brazo izquierdo del robot ROBOTIS FFW SG2 en el simulador Isaac Lab. El modelo parte de la arquitectura GR00T N1.7 de NVIDIA, que combina un backbone Cosmos-Reason2-2B (congelado durante el fine-tune) con un proyector y una cabeza de accion de tipo diffusion.

La relevancia de esta publicacion es acotada y muy practica: sirve como artefacto reproducible de un experimento de domain randomization sobre una tarea concreta de pick-and-place, con cinco checkpoints intermedios (20k, 40k, 60k, 80k y 100k pasos) y una receta de entrenamiento documentada. No es un modelo de proposito general ni un chatbot: es un checkpoint de investigacion para evaluar robustez frente a variaciones visuales en simulacion.

El repositorio ocupa 42,9 GB e incluye pesos en fp32 (12,6 GB por checkpoint), configuracion de normalizacion, metadatos de embodiment y el estado del entrenador, aunque no los estados del optimizador ni del scheduler. La licencia figura como "other", heredada del modelo base de NVIDIA, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en GR00T N1.7: backbone Cosmos-Reason2-2B congelado + proyector + cabeza de accion diffusion |
| Parametros totales | 3B (modelo base); 1,62B entrenables en el fine-tune |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos subidos en fp32) |
| Idiomas soportados | no disponible (instruccion de lenguaje en ingles: "pick up the lime green block with the left arm") |
| Licencia | other (heredada de nvidia/GR00T-N1.7-3B) |
| Formato de pesos | safetensors (shards fp32, 12,6 GB por checkpoint) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GR00T N1.7 de NVIDIA: un backbone vision-language Cosmos-Reason2-2B que permanece congelado, sobre el que se entrenan un proyector y una cabeza de accion basada en diffusion. En este fine-tune concreto se ajustaron 1,62B parametros durante 100.000 pasos planificados con batch global de 32, optimizador AdamW con learning rate 1e-4 y scheduler coseno con warmup del 5 %, weight decay 1e-5 y pesos en fp32. El entrenamiento se ejecuto en una A100 de 80 GB con un coste aproximado de 0,68 s por paso.

Los datos de entrenamiento son un conjunto de 500 demostraciones con domain randomization (`pick-cube-topdown-25cm-dr-500-3cam`): 84.111 frames a 240x240 desde tres camaras, con pose inicial fija y el bloque muestreado uniformemente en x 0,23-0,48 m e y 0,065-0,315 m. Cada episodio aleatoriza el fondo, el aspecto de la mesa, las luces, los montajes de camara, el color del bloque y el timing de las demostraciones. La aumentacion de imagen aplicada es la del repositorio (brightness 0,3, contrast 0,4, saturation 0,5, hue 0,08 mas recorte aleatorio), sin ruido de estado y con state dropout de 0,2. La accion se representa como 16 objetivos articulares absolutos (8 del brazo izquierdo + 8 del derecho) con chunk de 16.

## Capacidades

- Generacion de acciones motoras para un robot manipulador: produce 16 objetivos articulares absolutos por paso, con horizonte de chunk de 16.
- Percepcion visual multi-camara: consume tres flujos de imagen de 240x240.
- Condicionamiento por lenguaje: acepta una instruccion textual fija ("pick up the lime green block with the left arm").
- Ejecucion de una tarea especifica de pick-and-place top-down sobre un bloque verde lima.
- Robustez ante variaciones visuales de simulacion: fondos, iluminacion, aspecto de mesa, montajes de camara y color del bloque aleatorizados en entrenamiento.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento generico: es un modelo de politica robotica, no un LLM conversacional.
- Capacidades multilingues: no disponibles; la unica instruccion documentada esta en ingles.

## Casos de uso

- Evaluacion de robustez visual en simulacion: cargar cada checkpoint (`step-20000` a `step-100000`) y ejecutar los 50 rollouts del protocolo del autor para medir como evoluciona la tasa de exito con el domain randomization.
- Baseline para comparativas de politicas: usar este GR00T ajustado como referencia frente a las diffusion policies de `padiredd/dp-blockpick-*` en la misma tarea y protocolo de evaluacion.
- Estudio de transferencia sim-to-real: el modelo esta entrenado con aleatorizacion agresiva de apariencia, lo que lo hace candidato para probar transferencia a un FFW SG2 fisico antes de reentrenar.
- Investigacion sobre cabezas de accion diffusion: al mantener el backbone congelado, permite aislar el efecto del proyector y de la cabeza de accion en el rendimiento final.
- Generacion de datos sinteticos de politica: usar los rollouts del modelo para aumentar un dataset de demostraciones o para inicializar otro fine-tune sobre la misma tarea.
- Docencia y reproduccion de experimentos: la receta completa (hiperparametros, hardware, aumentacion y estructura de checkpoints) permite reproducir el entrenamiento en un entorno Isaac Lab con el fork de Isaac-GR00T indicado.
- Pruebas de integracion de pipelines de robotica: validar el bucle `Gr00tPolicy` + `groot_server.py` + `rollout_policy.py` antes de escalar a tareas mas complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los rollouts en simulacion (50 picks, mismo protocolo que las diffusion policies de `padiredd/dp-blockpick-*`) se ejecutan con `data_collection/rollout_policy.py --policy groot` contra `groot_server.py`, y que los resultados se anadiran a medida que esten disponibles. En el momento de la consulta no hay cifras de tasa de exito publicadas.

## Requisitos de hardware

- VRAM estimada para inferencia: cada checkpoint pesa 12,6 GB en fp32, por lo que se necesita al menos 16 GB de VRAM para cargar un checkpoint completo sin cuantizar; con cuantizacion a fp16/bf16 el requisito bajaría a unos 7-8 GB, aunque no se documentan pesos cuantizados.
- GPU recomendadas: el entrenamiento se realizo en una NVIDIA A100 de 80 GB; para inferencia son suficientes GPUs con 16 GB o mas, como RTX 4090, RTX A6000, L40S o A100/H100.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y potencialmente en RTX 4080/3090 (16-24 GB) cargando un unico checkpoint en fp32; no se documenta soporte para GPUs de 8 GB.
- Opciones de despliegue: el autor indica el fork `omkarpatil18/Isaac-GR00T-n1.7` (commit e81d02b) con `Gr00tPolicy(embodiment_tag="new_embodiment", model_path=<folder>)` y el servidor `groot_server.py`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Solo se conoce el coste de entrenamiento (aproximadamente 0,68 s por paso en A100 80 GB).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| groot-blockpick-dr-defaultaug | 3B (1,62B entrenables) | no disponible | Pick top-down FFW SG2 en Isaac Lab | other | HuggingFace, 0 descargas |
| nvidia/GR00T-N1.7-3B (base) | 3B | no disponible | VLA fundacional de robotica | otra licencia de NVIDIA | HuggingFace (modelo base) |
| padiredd/dp-blockpick-* | no disponible | no disponible | Misma tarea con diffusion policies | no disponible | HuggingFace (mismo autor) |

La comparativa se limita a estos tres artefactos porque la informacion proporcionada no incluye datos de otros modelos VLA comparables (por ejemplo, variantes de OpenVLA u otros checkpoints de GR00T). No se dispone de cifras de rendimiento para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Especializacion extrema: el modelo solo sabe ejecutar un pick top-down de un bloque verde lima con el brazo izquierdo; no generaliza a otras tareas, objetos ni configuraciones del robot.
- Dependencia de la instruccion: el condicionamiento por lenguaje esta practicamente fijado a una unica frase en ingles; no hay evidencia de generalizacion a otras ordenes.
- Entrenado exclusivamente en simulacion (Isaac Lab): no hay validacion sim-to-real publicada, y el domain randomization no garantiza transferencia al robot fisico.
- Sin benchmarks publicados: no hay tasa de exito ni curvas de aprendizaje disponibles, por lo que no se puede evaluar objetivamente la calidad de los checkpoints.
- Licencia "other" heredada del modelo base: es imprescindible revisar los terminos de NVIDIA/GR00T antes de cualquier uso comercial; la model card no aclara restricciones adicionales.
- Repositorio de 42,9 GB con cinco checkpoints en fp32: el almacenamiento y la carga son costosos, y no se incluyen estados de optimizador ni scheduler, lo que impide reanudar el entrenamiento tal cual.
- Riesgo de sobreajuste a la apariencia del simulador pese a la aleatorizacion: fondos, luces y colores se randomizan, pero la fisica, el robot y la camara siguen siendo los de Isaac Lab.
- Cero descargas y cero likes en el momento de la consulta: no hay senales de validacion por parte de la comunidad ni reportes independientes de uso.
- El modelo base Cosmos-Reason2-2B puede arrastrar sesgos de sus datos de preentrenamiento, aunque su impacto en una politica robotica acotada es dificil de caracterizar sin evaluacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/padiredd/groot-blockpick-dr-defaultaug
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Fork de Isaac-GR00T usado para cargar los checkpoints: https://github.com/omkarpatil18/Isaac-GR00T-n1.7 (commit e81d02b)
- Repositorio Isaac-GR00T de NVIDIA (referencia): https://github.com/NVIDIA/Isaac-GR00T
- Isaac Lab: https://github.com/isaac-sim/IsaacLab
- Diffusion policies del mismo autor (referencia de comparacion): https://huggingface.co/padiredd/dp-blockpick-*
