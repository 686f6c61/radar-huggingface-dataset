# jren313/starvla-pipette-pick-r2

## Resumen

starvla-pipette-pick-r2 es un checkpoint de politica robotica (Vision-Language-Action, VLA) publicado por el usuario jren313 (Jiming Ren) en HuggingFace. Se trata de un ajuste fino del modelo nvidia/GR00T-N1.7-3B realizado con el framework starVLA, y esta especializado en una unica fase de un flujo de pipeteo de cinco pasos sobre un robot humanoide Unitree G1 equipado con manos Inspire. La tarea concreta de esta version es "coger la pipeta del soporte de la derecha con la mano derecha", con la mano izquierda inactiva.

Tecnicamente, el modelo parte de la implementacion starVLA `CosmosGR00TN1d7`, que combina un VLM Cosmos-Reason2-2B con un cabezal de difusion (DiT) de 32 capas con flow-matching para generar acciones. El ajuste es completo (tune_llm y tune_visual) sobre 1.031 tensores que se cargan 1:1 desde el modelo base. La observacion usa dos camaras (RGB de cabeza y wrist_left), una frase de tarea y un vector de estado de 59 dimensiones, con un dropout de estado del 0,8, lo que fuerza al modelo a depender principalmente de las imagenes.

El autor lo declara explicitamente como un checkpoint de investigacion ("research checkpoint"), no listo para produccion: en el robot, los checkpoints GR00T por fase funcionan claramente mejor que los cabezales QwenOFT entrenados sobre los mismos splits, pero todavia no completan su fase de forma fiable. Su relevancia es, por tanto, metodologica: ilustra un flujo reproducible de ajuste fino de politicas VLA por fases para manipulacion humanoide de precision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA: VLM Cosmos-Reason2-2B (select_layer 16) + cabezal DiT de 32 capas con flow-matching (alternate-VL), 4 pasos de inferencia, embodiment slot 25; implementacion starVLA `CosmosGR00TN1d7` |
| Parametros totales | ~3B (heredados del modelo base nvidia/GR00T-N1.7-3B); la model card no desglosa el recuento exacto |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (.pt): `gr00t/checkpoints/steps_2000_pytorch_model.pt` (servido) y `gr00t/final_model/pytorch_model.pt` |

Otros datos de interes: tamano del repositorio 19,1 GB; espacio de accion de 18 dimensiones (munecas relativas al chunk + manos absolutas); chunks de accion de 30 pasos (0,5 s a 60 Hz); estado de 59 dimensiones (29 articulaciones + pose6 de muneca medida izquierda/derecha + pose6 de muneca comandada izquierda/derecha + pulgar izquierdo comandado (1) + mano derecha (5)).

## Arquitectura y entrenamiento

El modelo es un VLA construido sobre GR00T-N1.7-3B mediante el framework starVLA. La arquitectura combina un backbone de vision-lenguaje (Cosmos-Reason2-2B) que procesa la observacion multimodal, y un cabezal de accion basado en un transformer de difusion (DiT) de 32 capas con formulacion de flow-matching y "alternate-VL" que genera los chunks de accion en 4 pasos de inferencia. El ajuste fino es completo (se actualizan `tune_llm` y `tune_visual`) con gradient checkpointing, y los 1.031 tensores del modelo base cargan 1:1. El espacio de acciones de 18 dimensiones codifica munecas relativas al chunk (diferencia de posicion y rotacion compuesta en el marco del ancla) y registros absolutos de las manos Inspire.

La observacion incluye dos camaras (RGB de cabeza a 1280x720 y `wrist_left` eye-in-hand a 1080x1080, redimensionadas a 270 y recortadas a 256 en el servicio), una frase de tarea y el vector de estado de 59 dimensiones. Se aplica un dropout de estado de 0,8 (el vector completo se pone a cero en el 80 % de las muestras), lo que obliga al modelo a leer las camaras. Los datos provienen del dataset `jren313/g1-pipette-2view-teleop0925-5task-eerel`: 237 episodios teleoperados a 60 Hz, con una frase de objetivo por paso; cada fase se entrena en solitario sobre los episodios de su paso, con un split a nivel de grabacion. La optimizacion usa AdamW 8-bit paginado, betas (0,9; 0,95), weight decay 0, LR 2e-5 para el backbone y la interfaz VL y 2e-4 para el cabezal de accion, cosine hasta 1e-6 tras 100 pasos de warmup, grad-norm clip 1.0, batch 128 (32 x 4 GPUs), 10 epocas y semilla 42. La seleccion del checkpoint servido se hace por MSE de holdout sobre una rebanada fija de 480 muestras.

## Capacidades

- Generacion de acciones roboticas para manipulacion de precision: produce chunks de 30 pasos (0,5 s a 60 Hz) para las munecas y las manos del humanoide.
- Control bimodal de manos: munecas en espacio relativo al chunk y manos expresadas como registros Inspire absolutos.
- Percepcion visual multi-camara: fusiona una vista de cabeza y una vista eye-in-hand (`wrist_left`) para guiar la politica.
- Condicionamiento por lenguaje: responde a una frase de tarea ("Pick up the pipette from the holder on the right with the right hand").
- Robustez a la ausencia de estado propio: gracias al dropout de estado de 0,8 durante el entrenamiento, la politica aprende a basarse en las camaras.
- Ejecucion de tareas de un solo paso dentro de un flujo mayor (fase 1 de 5); requiere coordinacion externa entre fases.
- Tool calling / function calling: no disponible (no es un modelo de lenguaje conversacional).
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): vision (camaras de robot); no se documentan audio ni modo de razonamiento explicito.

## Casos de uso

- Investigacion en politicas VLA para humanoides: sirve como punto de partida o referencia para reproducir el flujo de ajuste fino de starVLA sobre GR00T-N1.7-3B, comparando con los cabezales QwenOFT y con las rondas posteriores (r3).
- Automatizacion de laboratorio por fases: integrado en un orquestador de cinco pasos, este checkpoint cubre la recogida de la pipeta; el resto de fases se cubren con los checkpoints hermanos (tube-pick, aim, tube-return, return).
- Recoleccion y aumento de datos de teleoperacion: al ejecutar la fase de pick de forma autonoma se pueden generar episodios adicionales que amplien el dataset de pipeteo.
- Benchmarking de politicas roboticas: la metodologia de evaluacion en unidades fisicas (mm, grados, registros) frente a una linea base "hold still" permite comparar variantes de espacio de accion (18-D frente a 32-D con articulaciones).
- Estudio de robustez perceptual: el dropout de estado permite analizar cuanto depende la politica de la vision frente a la propiocepcion en tareas de agarre fino.
- Transferencia sim-to-real y validacion en gemelo digital: el checkpoint puede evaluarse en simulacion antes de desplegarlo en el Unitree G1 real.
- Formacion de pipelines de manipulacion precisa: como modulo especializado de "pick" reutilizable en cadenas de tareas que compartan los mismos sensores y espacio de acciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe unicamente la metodologia de evaluacion: MSE de holdout sobre una rebanada fija de 480 muestras (4 rangos x 10 lotes x 12) evaluada aproximadamente una vez por epoca, y comparacion en unidades fisicas (mm, grados, registros) contra las etiquetas reales y frente a una linea base "hold still". No se proporcionan cifras concretas de MMLU, HumanEval, GSM8K ni de exito en la tarea. El autor indica cualitativamente que los checkpoints GR00T por fase superan a los cabezales QwenOFT sobre los mismos splits, pero que todavia no completan su fase de forma fiable.

## Requisitos de hardware

- VRAM estimada para inferencia: no indicada en la model card. Como estimacion derivada del tamano (unos 3B parametros, ajuste completo): aproximadamente 6-8 GB en bf16/fp16 y 12-14 GB en fp32, sin contar memoria de activaciones del VLM y del cabezal DiT.
- GPU recomendadas: no disponibles en la informacion proporcionada. El entrenamiento se realizo con 4 GPUs (32 x 4, batch 128), pero no se especifica el modelo.
- Compatibilidad con GPU de consumo: probable en tarjetas con 16 GB o mas de VRAM (por ejemplo, RTX 4080/4090) usando bf16, segun la estimacion anterior; no confirmado por el autor.
- Opciones de despliegue: los pesos se sirven como checkpoint PyTorch (`pytorch_model.pt`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. El despliegue se realiza a traves del stack starVLA.
- Latencia y throughput: no disponibles. El cabezal usa 4 pasos de inferencia de flow-matching y genera chunks de 30 pasos (0,5 s a 60 Hz), lo que define la frecuencia de control del chunk.
- Nota importante: para servir el modelo debe usarse exactamente el archivo `gr00t/dataset_statistics.json` para las estadisticas de normalizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Espacio de accion | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| starvla-pipette-pick-r2 (este) | ~3B | no disponible | 18-D: munecas rel + manos abs | no disponible | HuggingFace | Fase 1, ronda 2 linea GR00T |
| starvla-pipette-pick-r3 | ~3B | no disponible | 32-D: munecas rel + manos abs + articulaciones | no disponible | HuggingFace | Fase 1, ronda mas reciente |
| starvla-qwenoft-pipette-eerel-crop | no disponible | no disponible | no disponible | no disponible | HuggingFace | Cabezal QwenOFT, rendimiento inferior segun el autor |
| nvidia/GR00T-N1.7-3B | ~3B | no disponible | no disponible | no disponible | HuggingFace | Modelo base sin ajustar |

No se dispone de datos de benchmark comparativos entre estas variantes; la comparacion recogida en la model card es cualitativa.

## Limitaciones y advertencias

- Checkpoint de investigacion: el propio autor advierte de que los checkpoints por fase no completan su tarea de forma fiable en el robot.
- Especializacion extrema: el modelo esta entrenado para una unica frase de tarea ("Pick up the pipette from the holder on the right with the right hand"); no generaliza a otras tareas ni objetos.
- Dependencia de la fase siguiente: es solo el paso 1 de un flujo de cinco; su utilidad practica requiere los demas checkpoints y un orquestador externo.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinacion: no aplica en el sentido conversacional, pero si existe riesgo de generar acciones incorrectas (agarre fallido) en entornos no vistos.
- Limitaciones de contexto o idioma: no se especifican idiomas soportados; el condicionamiento de lenguaje se limita a frases de tarea cortas en ingles.
- Restricciones de licencia: la licencia no esta disponible, por lo que no puede confirmarse su uso comercial.
- Datos desproporcionados: el dropout de estado del 0,8 puede provocar que la politica ignore la propiocepcion cuando esta disponible, lo que seria suboptimo en situaciones con oclusion visual.
- Configuracion sensible: las estadisticas de normalizacion son especificas por fase y no deben compartirse entre espacios de accion; servir el modelo con otros valores invalida el comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jren313/starvla-pipette-pick-r2
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Dataset de entrenamiento: https://huggingface.co/datasets/jren313/g1-pipette-2view-teleop0925-5task-eerel
- Checkpoint hermano (fase 1, ronda 3): https://huggingface.co/jren313/starvla-pipette-pick-r3
- Checkpoint hermano (fase 2): https://huggingface.co/jren313/starvla-pipette-tube-pick-r2
- Checkpoint hermano (fase 3): https://huggingface.co/jren313/starvla-pipette-aim-r1
- Checkpoint hermano (fase 4): https://huggingface.co/jren313/starvla-pipette-tube-return-r1
- Checkpoint hermano (fase 5): https://huggingface.co/jren313/starvla-pipette-return-r1
- Variante QwenOFT: https://huggingface.co/jren313/starvla-qwenoft-pipette-eerel-crop
- Perfil del autor: https://huggingface.co/jren313
- Repositorio starVLA: https://github.com/starVLA/starVLA
- Documentacion starVLA: https://starvla.github.io/docs/
- Sitio de starVLA: https://starvla.github.io/
