# robopark/dexjoco-pretrian-checkpoints

## Resumen

DexJoCo Pick Bucket es un conjunto de checkpoints preentrenados para robótica de manipulación con mano antropomórfica, publicado por el usuario `robopark` bajo el identificador `robopark/dexjoco-pretrian-checkpoints`. No se trata de un modelo de lenguaje, sino de dos artefactos complementarios de una política de control entrenada por imitación: una política de *behavior cloning* (BC) con *flow matching* que consume imágenes de cámara frontal y de muñeca, y un códec denominado HandChord que comprime secuencias de acciones de la mano en un espacio latente de baja dimensión. Ambos forman parte del marco DICE-RL y se entrenaron sobre el conjunto de datos de 98 demostraciones de la tarea Pick Bucket (recoger un cubo con una mano robótica).

El repositorio tiene un tamaño de 0,7 GB y contiene exclusivamente pesos en formato PyTorch (`.pt`), junto con ficheros de configuración Hydra, estadísticas de normalización y un manifiesto con sumas de verificación SHA-256. No incluye pesos en safetensors ni GGUF, ni tokenizador, ni vocabulario: es un artefacto de investigación para robótica, no un modelo generativo de texto. La nomenclatura del repositorio conserva deliberadamente la errata `pretrian` solicitada por el autor.

Su relevancia es acotada pero concreta: ofrece checkpoints reproducibles (semilla 42, dataset procesado documentado) para evaluar políticas de manipulación diestra con *flow matching* y para estudiar la compresión de acciones de mano mediante códecs latentes. La información pública disponible es escasa: no hay licencia declarada, no hay idiomas, no hay benchmarks publicados en la model card y el repositorio no registra descargas ni valoraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de behavior cloning con flow matching (visión + propiocepción) y códec HandChord de acciones de mano |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; horizonte de predicción de 16 pasos y episodios de evaluación limitados a 700 pasos |
| Tipos de cuantizacion | no disponible (pesos PyTorch sin cuantizar) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (checkpoint completo con optimizador, scheduler, EMA y estado RNG); configuración `.hydra/config.yaml` y `normalization.npz` |
| Entradas de la política | Imágenes frontal y de muñeca de 96 x 96 píxeles; propiocepción de 23 dimensiones |
| Salidas de la política | Acciones de 22 dimensiones; horizonte 16; 10 pasos de flow |
| Códec HandChord | 16 articulaciones de mano, horizonte 16, 8 escalares latentes por chunk |
| Dataset de entrenamiento | 98 demostraciones de la tarea Pick Bucket (`robopark/dexjoco-single-arm-data`) |
| Semilla | 42 |
| Tamaño del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

La política principal es un modelo de *behavior cloning* que combina percepción visual (dos cámaras: frontal y de muñeca, a resolución 96 x 96) con un vector de propiocepción de 23 dimensiones, y genera acciones de 22 dimensiones mediante *flow matching* con 10 pasos de integración y un horizonte de predicción de 16. El checkpoint seleccionado corresponde a la época 2000 (`state_2000.pt`) y conserva el estado completo del entrenamiento (optimizador, scheduler, media móvil exponencial de pesos y estado del generador aleatorio), lo que permite reanudar el ajuste fino además de la inferencia. La configuración de evaluación guardada fija un límite de 700 pasos por episodio.

El segundo componente, HandChord, es un códec que comprime secuencias de 16 articulaciones de la mano a lo largo de un horizonte de 16 en 8 escalares latentes por chunk, partiendo del estado inicial medido de la mano. El checkpoint corresponde al paso final 20000 (`codec.pt`). La model card reporta un error absoluto medio (MAE) de validación de 1,7779712973625925 grados en el paso 20000; se trata de una métrica registrada durante el entrenamiento, no de una reevaluación independiente. No se documentan en la información disponible el número de tokens, la composición detallada del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco probables en este dominio, donde el paradigma es imitación supervisada).

## Capacidades

- Control de manipulación robótica de un brazo con mano antropomórfica en la tarea Pick Bucket, a partir de observaciones visuales y propioceptivas.
- Generación de trayectorias de acción multimodales mediante *flow matching* condicionado en imágenes y estado del robot.
- Predicción de acciones con horizonte de 16 pasos y 10 pasos de integración de flujo.
- Compresión y reconstrucción de secuencias de articulaciones de la mano mediante el códec HandChord (8 latentes por chunk).
- Reanudación de entrenamiento: el checkpoint BC incluye optimizador, scheduler, EMA y estado RNG.
- Evaluación reproducible en MuJoCo (backend EGL) mediante el script `script/eval_pretrain_checkpoint.py`.
- No soporta *tool calling*, agentes conversacionales, generación de texto, visión general, audio ni capacidades multilingües: es un artefacto específico de robótica.

## Casos de uso

- Evaluación de políticas de imitación en Pick Bucket: cargar `state_2000.pt` con el script de evaluación oficial y ejecutar 10 episodios en 10 entornos paralelos para medir la tasa de éxito de la política sobre el simulador MuJoCo.
- Punto de partida para *fine-tuning*: al conservar el optimizador, el scheduler y el estado EMA, el checkpoint permite reanudar el entrenamiento sobre nuevas demostraciones sin reiniciar desde cero.
- Investigación en códecs de acción: usar HandChord para comprimir secuencias de 16 articulaciones en 8 latentes y estudiar la fidelidad de reconstrucción (MAE de validación reportado de 1,78 grados) frente a alternativas de cuantización discreta.
- Reproducibilidad de experimentos: el `manifest.json` con rutas de origen, tamaños y sumas SHA-256 permite verificar que los bytes de los checkpoints no se han alterado, útil en publicaciones y revisiones.
- *Baseline* para comparativas de *flow matching* en robótica: sirve como referencia entrenada con semilla fija (42) y dataset documentado para comparar variantes de arquitectura o de número de pasos de flujo.
- Integración en pipelines de simulación a gran escala: al ser pesos PyTorch estándar, se pueden cargar en entornos de evaluación paralela con MuJoCo EGL para barridos de hiperparámetros o de condiciones iniciales.
- Estudio de transferencia sim-a-real: el par política + códec puede emplearse como punto de partida para experimentos de destilación o adaptación de dominio, siempre que se resuelva la ausencia de licencia declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica numérica presente en la model card es el MAE de validación de HandChord (1,7779712973625925 grados en el paso 20000), que es una métrica de reconstrucción registrada durante el entrenamiento y no una evaluación comparativa frente a otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio completo ocupa 0,7 GB, por lo que la política y el códec caben holgadamente en GPUs de consumo, pero el tamaño exacto de los tensores no se documenta.
- GPU recomendadas: no disponible. Por el tamaño del artefacto, cualquier GPU con al menos unos pocos GB de VRAM debería ser suficiente; una RTX 4090 o superior permitiría ejecutar evaluaciones con 10 entornos paralelos sin cuello de botella de memoria.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU moderna con soporte CUDA; el límite práctico vendrá del renderizado MuJoCo y del número de entornos paralelos, no de los pesos.
- Opciones de despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje). El despliegue se realiza cargando los `.pt` en PyTorch y ejecutando el script de evaluación de DICE-RL con `MUJOCO_GL=egl`.
- Latencia y throughput: no disponibles. La evaluación de referencia usa `--num_eval_episodes 10 --eval_n_envs 10` con episodios de hasta 700 pasos, pero no se publican tiempos medidos.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos de robótica comparables ni datos de rendimiento que permitan establecer una comparación rigurosa con alternativas de la misma categoría (por ejemplo, otras políticas de imitación para manos diestras o códecs de acción). Cualquier comparación numérica requeriría ejecutar la evaluación oficial en el mismo entorno y con el mismo dataset.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican condiciones de uso comercial, redistribución ni modificación; en producción esto es un bloqueo legal hasta que el autor la defina.
- Especialización extrema: la política está entrenada únicamente para la tarea Pick Bucket con 98 demostraciones y una morfología concreta de mano y brazo; no generaliza a otras tareas sin reentrenamiento.
- Sin datos de benchmarks ni de tasa de éxito: la model card no reporta el rendimiento de la política en la tarea, solo la métrica de reconstrucción del códec.
- Métrica de HandChord no reevaluada: el MAE de 1,78 grados procede del registro de entrenamiento y no de una evaluación independiente.
- Riesgo de sobreajuste y de fallo fuera de distribución: con solo 98 demostraciones y entradas visuales de 96 x 96, la política puede degradarse ante cambios de iluminación, textura o posiciones iniciales no representadas.
- Dependencia de infraestructura específica: requiere el repositorio DICE-RL, sus dependencias de DexJoCo y MuJoCo con backend EGL; no es un artefacto autónomo.
- Sin soporte multilingüe ni de texto: no debe evaluarse con criterios de modelos de lenguaje (MMLU, HumanEval, GSM8K).
- Repositorio sin tracción: 0 descargas y 0 valoraciones en el momento de la consulta, lo que reduce la validación externa disponible.
- Errata en el nombre del repositorio (`pretrian` en lugar de `pretrain`): conviene fijar el identificador exacto en scripts y pipelines para evitar fallos de resolución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/robopark/dexjoco-pretrian-checkpoints
- Dataset de entrenamiento: https://huggingface.co/datasets/robopark/dexjoco-single-arm-data
- Repositorio DICE-RL (referenciado en la model card, sin URL explícita): no disponible
- Paper, blog o demo del modelo: no disponible
