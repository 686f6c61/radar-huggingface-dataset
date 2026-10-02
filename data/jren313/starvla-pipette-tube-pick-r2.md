# jren313/starvla-pipette-tube-pick-r2

## Resumen

`jren313/starvla-pipette-tube-pick-r2` es un checkpoint de politica Vision-Language-Action (VLA) especializado en una unica fase de un flujo de trabajo de pipeteo en banco. Se trata de un ajuste fino completo del modelo base `nvidia/GR00T-N1.7-3B` (aproximadamente 3.000 millones de parametros), realizado con el framework starVLA sobre el modelo `CosmosGR00TN1d7`, y orientado a un manipulador humanoide Unitree G1 equipado con manos Inspire. La tarea concreta de esta fase es "coger el tubo de la gradilla azul de la izquierda con la mano izquierda", mientras la mano derecha mantiene la pipeta durante todo el proceso.

El modelo resuelve el problema de generar acciones motoras de 32 dimensiones a partir de dos flujos de camara (RGB de cabeza y muñeca izquierda), una frase de tarea en lenguaje natural y un vector de estado de 59 dimensiones. Su relevancia es doble: por un lado, forma parte de una familia de siete checkpoints por fase publicados por el mismo autor para el mismo flujo de pipeteo; por otro, sirve como evidencia de ingenieria sobre el ajuste fino de GR00T N1.7 con starVLA, senalando explicitamente que sus checkpoints por fase superan a las cabezas QwenOFT entrenadas sobre los mismos splits, aunque todavia no completan su fase de forma fiable.

Es, por tanto, un checkpoint de investigacion ("research checkpoint"), sin licencia declarada, con 0 descargas y 0 likes en el momento de la consulta, y con un unico cambio respecto a la ronda 1: el pulgar izquierdo pasa a ser relativo al chunk de accion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en GR00T-N1.7: VLM Cosmos-Reason2-2B (`select_layer` 16) + cabeza DiT de flow-matching de 32 capas con atencion alterna VL, 4 pasos de inferencia, slot de embodiment 25 |
| Parametros totales | Aproximadamente 3.000 millones (heredados del base `nvidia/GR00T-N1.7-3B`); el numero exacto no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos servidos son un checkpoint PyTorch, no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible a nivel declarado; las frases de tarea estan en ingles |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`): `gr00t/checkpoints/steps_1000_pytorch_model.pt` y `gr00t/final_model/pytorch_model.pt` |
| Modelo base | `nvidia/GR00T-N1.7-3B` (fine-tune completo) |
| Tamano del repositorio | 19,1 GB |
| Dataset de entrenamiento | `jren313/g1-pipette-2view-teleop0925-5task-eerel` (237 episodios teleoperados, 60 Hz) |
| Espacio de accion | 32-D: muñecas relativas al chunk + pulgar izquierdo relativo + mano derecha absoluta + 14 articulaciones absolutas de brazo |
| Chunk de accion | 30 pasos (0,5 s a 60 Hz) |
| Estado de entrada | 59-D (29 articulaciones, pose6 de muñeca izquierda/derecha medida y comandada, `thumb_bend` izquierdo comandado y 5 registros de mano derecha) |
| Camaras | Cabecera RGB 1280x720 y `wrist_left` eye-in-hand 1080x1080, redimensionadas a 270 y recortadas a 256 |
| Pipeline declarado | `robotics` |

## Arquitectura y entrenamiento

El modelo se inicializa desde `nvidia/GR00T-N1.7-3B` dentro del wrapper `CosmosGR00TN1d7` de starVLA, con los 1.031 tensores cargando 1:1. La pila combina un VLM Cosmos-Reason2-2B que procesa las imagenes y la frase de tarea, y una cabeza de accion DiT de 32 capas con atencion alterna vision-lenguaje y formulacion de flow-matching con 4 pasos de inferencia. El ajuste es completo, activando `tune_llm` y `tune_visual`, con gradient checkpointing. La observacion incluye dos camaras, la sentencia de tarea y el vector de estado de 59 dimensiones, con un `state dropout` de 0,8: el vector completo se pone a cero en el 80% de las muestras de entrenamiento, forzando a la cabeza a leer las camaras en lugar de memorizar el estado.

La formulacion de la accion usa chunks de 30 pasos (0,5 s a 60 Hz). Las muñecas se expresan de forma relativa al chunk respecto a la pose comandada en el primer paso (diferencia de posicion y rotacion compuesta en el marco del ancla), las manos se codifican como registros Inspire y las 14 articulaciones absolutas de brazo solo sirven para inicializar el IK del bridge. Las estadisticas de normalizacion se calculan por fase sobre sus propios episodios, sin compartirse entre espacios de accion.

Los datos proceden del dataset de captura en banco de cinco pasos, con 237 episodios teleoperados a 60 Hz y una frase objetivo por paso. Cada fase se entrena en solitario con los episodios de su paso y un split train/test a nivel de grabacion, de modo que las mitades de pick y return de una misma grabacion quedan en el mismo lado. Se aplica un filtro de pausa que descarta anclas de entrenamiento si ninguna muñeca comandada se mueve 1 mm durante su chunk. La optimizacion usa AdamW paginado de 8 bits con betas (0,9; 0,95), weight decay 0, LR 2e-5 para el backbone e interfaz VL y 2e-4 para la cabeza de accion, scheduler coseno hasta 1e-6 tras 100 pasos de warmup, recorte de gradiente 1,0, batch 128 (32 x 4 GPU, sin acumulacion), 10 epocas y semilla 42. La seleccion del checkpoint servido se hace por MSE de holdout sobre una rebanada fija de 480 muestras de los episodios de test (4 ranks x 10 batches x 12), comparando en unidades fisicas (mm, grados, registros) contra un baseline de "permanecer quieto".

## Capacidades

- Generacion de comandos motores de 32 dimensiones para un humanoide Unitree G1 con manos Inspire, a partir de imagenes de dos camaras y una instruccion textual.
- Manipulacion bimanual coordinada en una fase concreta: la mano izquierda coge el tubo y la derecha mantiene la pipeta.
- Condicionamiento por lenguaje natural: la politica acepta una frase de tarea ("Pick up the tube from the blue rack on the left with the left hand") que define el objetivo del chunk.
- Percepcion visual multi-camara: fusion de una vista de cabecera a 1280x720 con una vista de muñeca izquierda a 1080x1080.
- Robustez parcial a la perdida de estado: gracias al `state dropout` de 0,8, la cabeza esta entrenada para operar leyendo camaras cuando el vector de estado no es informativo.
- Ejecucion en modo chunk: emite 30 pasos de accion (0,5 s a 60 Hz) por inferencia, lo que reduce la frecuencia de llamada al modelo.
- No se declara soporte de tool calling, function calling, agentes multi-paso, audio ni razonamiento textual general: es una politica de robot, no un asistente conversacional.

## Casos de uso

- Automatizacion de pipeteo en banco: el checkpoint cubre la fase 2 (coger el tubo de la gradilla) de un flujo de cinco pasos, y encadenado con los checkpoints de las fases 1, 3, 4 y 5 permite construir una politica completa de transferencia de liquidos en laboratorio.
- Orquestacion multi-politica en un mismo robot: al estar los cinco checkpoints publicados por separado con el mismo espacio de accion en las rondas mas recientes, se pueden conmutar segun la fase activa y comparar el comportamiento de cada uno de forma aislada.
- Investigacion en ajuste fino de VLA: sirve como caso reproducible de fine-tune completo de GR00T-N1.7-3B con starVLA, con configuracion, log de entrenamiento y estadisticas de normalizacion incluidos en el repositorio.
- Estudio del efecto del `state dropout`: al estar declarado el valor 0,8, permite analizar cuanto depende la politica de la propriocepcion frente a la vision en una tarea de precision.
- Evaluacion de abstracciones de accion relativa: la diferencia clave respecto a la ronda 1 (pulgar izquierdo relativo al chunk) permite medir el impacto de representar el pulgar de forma relativa en lugar de absoluta en tareas de agarre fino.
- Recogida de datos por teleoperacion: el dataset asociado (237 episodios a 60 Hz) y el pipeline de entrenamiento documentado sirven de plantilla para capturar nuevas tareas con el mismo hardware.
- Validacion de infraestructura de inferencia robotica: dado que el checkpoint servido es el de menor perdida de holdout entre los guardados (paso 1000 de 1351), es util para medir latencia y estabilidad del stack de despliegue de GR00T antes de invertir en datos adicionales.
- Benchmark interno de cabezas de accion: el autor indica que estos checkpoints GR00T por fase funcionan claramente mejor en robot que las cabezas QwenOFT entrenadas sobre los mismos splits, por lo que el modelo resulta util como referencia en comparaciones de arquitectura de cabeza.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. El autor describe la metodologia de evaluacion (MSE de holdout sobre una rebanada fija de 480 muestras de los episodios de test, con 4 ranks x 10 batches x 12, comparada en unidades fisicas —mm, grados, registros— contra un baseline de "permanecer quieto"), pero los valores concretos no aparecen en el texto disponible. El estado del modelo se declara explicitamente como "research checkpoint": en el robot, los checkpoints GR00T por fase funcionan claramente mejor que las cabezas QwenOFT entrenadas sobre los mismos splits, pero todavia no completan su fase de forma fiable.

## Requisitos de hardware

- VRAM de inferencia (estimacion a partir de los aproximadamente 3.000 millones de parametros del base): en torno a 8-12 GB en bf16/fp16 contando pesos, cache de activaciones de las dos torres de vision y del DiT de 4 pasos. No es un dato publicado por el autor: no disponible.
- Entrenamiento: los logs indican 4 GPU con batch 32 por GPU, sin acumulacion, gradient checkpointing y AdamW de 8 bits. El modelo concreto de GPU no esta declarado: no disponible. Por el tamano del modelo y el batch total de 128, se requiere un nodo multi-GPU de gama alta (clase A100/H100 o equivalente).
- GPU de consumo: con cuantizacion o en bf16, un modelo de 3.000 millones de parametros es candidato a caber en tarjetas de 16-24 GB (por ejemplo, RTX 4090, RTX 5090 o A6000). No confirmado por el autor: no disponible.
- Opciones de despliegue: el repositorio esta orientado al stack de starVLA/GR00T (checkpoint PyTorch mas `config.yaml`, `dataset_statistics.json` y el YAML de entrenamiento). No se declaran rutas de despliegue alternativas como vLLM, TGI, llama.cpp, Ollama o ONNX Runtime; al tratarse de una politica robotica con cabeza de flow-matching, estas herramientas de servir LLM no son aplicables directamente.
- Detalle critico de despliegue: el autor advierte que debe servirse con exactamente el fichero de estadisticas de normalizacion incluido (`gr00t/dataset_statistics.json`), ya que las estadisticas se calculan por fase y no se comparten entre espacios de accion.
- Latencia y throughput: no disponible. La cabeza usa 4 pasos de inferencia y emite chunks de 30 pasos equivalentes a 0,5 s a 60 Hz, pero no se publican tiempos de inferencia medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Espacio de accion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jren313/starvla-pipette-tube-pick-r2` (este) | ~3B (base GR00T-N1.7-3B) | no disponible | 32-D: muñecas rel + pulgar izq. rel + mano der. abs + articulaciones | no disponible | HuggingFace, 0 descargas, 0 likes |
| `jren313/starvla-pipette-tube-pick-r1` (fase 2, superado) | ~3B | no disponible | 32-D: muñecas rel + manos abs + articulaciones | no disponible | HuggingFace; checkpoint servido en paso 875 |
| `nvidia/GR00T-N1.7-3B` (base sin ajustar) | ~3B | no disponible | no disponible (modelo generalista) | no disponible en la informacion proporcionada | HuggingFace (modelo base del que parte este fine-tune) |
| `jren313/starvla-pipette-pick-r3` (fase 1) | ~3B | no disponible | 32-D: muñecas rel + manos abs + articulaciones | no disponible | HuggingFace; checkpoint servido en paso 2000 |

No se dispone de datos de rendimiento comparativos entre estos checkpoints (ni MMLU, ni HumanEval, ni equivalentes para robotica) en la informacion proporcionada, por lo que la comparacion se limita a parametros, espacio de accion y disponibilidad.

## Limitaciones y advertencias

- Estado declarado como "research checkpoint": el propio autor indica que los checkpoints por fase no completan su tarea de forma fiable en el robot, por lo que no es apto para produccion sin validacion adicional.
- Alcance funcional muy estrecho: el modelo ejecuta una unica fase (coger el tubo de la gradilla azul con la mano izquierda) y depende de que la mano derecha mantenga la pipeta; no es una politica generalista.
- Sin licencia declarada: al no especificarse licencia, el uso comercial y la redistribucion quedan en un limbo legal que debe resolverse con el autor antes de cualquier despliegue.
- Sesgos conocidos: no disponible. No se documentan analisis de sesgo, y al tratarse de datos de teleoperacion de un solo operador y un solo montaje, la politica puede sobrerrepresentar las estrategias motoras de esa persona y ese entorno.
- Riesgo de alucinacion motora: no aplica en el sentido textual, pero existe riesgo de acciones fisicamente invalidas o inseguras en configuraciones fuera de distribucion, especialmente con el `state dropout` de 0,8 activo en entrenamiento, que puede producir comportamientos que ignoran la propriocepcion.
- Sensibilidad a la normalizacion: servir con un fichero de estadisticas distinto al publicado (`gr00t/dataset_statistics.json`) degrada o invalida la salida, porque las estadisticas se calculan por fase y no son intercambiables entre espacios de accion.
- Dependencia de la frase de tarea exacta: la politica se entrena con una sentencia objetivo por paso; parafrasear o cambiar el idioma de la instruccion no esta evaluado.
- Limitaciones de camara: la observacion asume exactamente dos vistas concreta (cabecera RGB 1280x720 y `wrist_left` 1080x1080 con recorte central a 256); cambiar la configuracion de sensores invalida el checkpoint.
- Empaquetado del repositorio: los 19,1 GB incluyen varios checkpoints (servido y final), configuraciones y logs; conviene descargar solo el fichero servido para reducir el consumo de disco.
- Idiomas soportados: no disponibles. Las sentencias de tarea estan en ingles, por lo que el comportamiento con instrucciones en castellano no esta verificado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jren313/starvla-pipette-tube-pick-r2
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Dataset de entrenamiento: https://huggingface.co/datasets/jren313/g1-pipette-2view-teleop0925-5task-eerel
- Fase 1, ronda 2: https://huggingface.co/jren313/starvla-pipette-pick-r2
- Fase 1, ronda 3 (ronda mas reciente de la fase 1): https://huggingface.co/jren313/starvla-pipette-pick-r3
- Fase 2, ronda 1 (superada): https://huggingface.co/jren313/starvla-pipette-tube-pick-r1
- Fase 3, ronda 1: https://huggingface.co/jren313/starvla-pipette-aim-r1
- Fase 4, ronda 1: https://huggingface.co/jren313/starvla-pipette-tube-return-r1
- Fase 5, ronda 1: https://huggingface.co/jren313/starvla-pipette-return-r1
- Perfil del autor: https://huggingface.co/jren313
- Repositorio starVLA: https://github.com/starVLA/starVLA
- Paper de starVLA: https://arxiv.org/abs/2604.05014
