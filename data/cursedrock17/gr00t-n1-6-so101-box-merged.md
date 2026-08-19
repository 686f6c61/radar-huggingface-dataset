# CursedRock17/gr00t-n1.6-so101-box-merged

## Resumen

El modelo `CursedRock17/gr00t-n1.6-so101-box-merged` es un ajuste fino del modelo de visión-lenguaje-acción (VLA) NVIDIA GR00T-N1.6-3B, especializado en la tarea de recoger y colocar bloques SO-101 dentro de una caja usando un brazo robótico SO-101. Lo ha desarrollado CursedRock17 (Lucas Wendland) como parte de un experimento de co-entrenamiento sim2real, combinando 125 episodios simulados y 5 reales en el dataset `CursedRock17/so101-teleop-box-merged-1`. El modelo se publica con dos checkpoints: uno en el paso 27000 (recomendado para comparaciones por menor riesgo de sobreajuste) y otro en el paso 45000 (el final, con pérdida de entrenamiento más baja pero posible sobreajuste a los episodios reales).

La relevancia de este modelo radica en ser un ejemplo práctico de cómo ajustar un VLA de NVIDIA para tareas robóticas específicas con datos mixtos simulados y reales, un enfoque cada vez más común en la investigación de manipulación robótica. Al estar basado en GR00T-N1.6-3B, hereda la arquitectura de 3 mil millones de parámetros con entrada multimodal (imágenes y lenguaje) y salida de acciones. El repositorio incluye solo los pesos (sin estado de optimizador) y ocupa 19.6 GB en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en GR00T-N1.6-3B con action head DiT y projector/adapter |
| Parametros totales | 3 mil millones (3B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo se centra en instrucciones de tarea en inglés, pero no se especifica) |
| Licencia | other (no se detallan terminos especificos; probablemente hereda la licencia de NVIDIA GR00T) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en NVIDIA GR00T-N1.6-3B, un VLA que combina un codificador de vision, un modelo de lenguaje y una cabeza de acciones basada en un transformer de difusion (DiT). En el ajuste fino, segun el playbook de NVIDIA, se congelan la mayoria de los pesos del VLM de 3B y se entrenan principalmente la cabeza de acciones (DiT) y las rutas de proyeccion/adaptacion que mapean las observaciones al espacio de acciones. Se aplican regularizacion de estado fuerte, aumento de datos y co-entrenamiento con datos de preentrenamiento para evitar sobreajuste.

El entrenamiento se realizo durante 45.000 pasos con un batch global de 32, sobre un dataset de 130 episodios (125 simulados y 5 reales). El checkpoint final alcanza una perdida de entrenamiento de aproximadamente 0.022. Se publican dos checkpoints: `checkpoint-27000` (~43 epocas) y `checkpoint-45000` (final). Las observaciones de entrada son dos camaras: `observation.images.front` y `observation.images.wrist`, con la instruccion unica "Pick up the block and place in the box".

## Capacidades

- Manipulacion robotica de precision: recoger y colocar bloques en una caja con un brazo SO-101.
- Entrada multimodal: procesa imagenes de camara frontal y de muñeca junto con una instruccion en lenguaje natural.
- Co-entrenamiento sim2real: entrenado con datos simulados y reales para mejorar la transferencia al mundo fisico.
- Ejecucion de tareas de un solo paso (pick-and-place) con control de acciones continuas.
- No incluye capacidades de generacion de texto, tool calling ni agentes; es un modelo de politica puramente para control robotico.

## Casos de uso

- Automatizacion de pick-and-place en lineas de produccion: el modelo puede controlar un brazo SO-101 para recoger piezas de una cinta y colocarlas en contenedores, reduciendo la necesidad de programacion manual por tarea.
- Investigacion en sim2real: permite estudiar como el co-entrenamiento con datos simulados y reales afecta la robustez de una politica VLA, sirviendo como punto de partida para experimentos con mas episodios reales.
- Prototipado rapido de tareas de manipulacion: con solo 130 episodios de demostracion, se puede ajustar el modelo para una nueva tarea en menos de un dia, acelerando la validacion de conceptos en laboratorios de robotica.
- Educacion en robotica: como modelo de referencia para ensenar a estudiantes como se entrena y despliega un VLA en un brazo real, dado que los checkpoints y el dataset estan publicamente disponibles.
- Evaluacion de regularizacion y sobreajuste: el checkpoint de 27000 pasos sirve para comparar el efecto de la regularizacion frente al de 45000, util para estudios de metodos de regularizacion en VLA.
- Integracion en pipelines de robotica con Isaac GR00T: el modelo se carga con el stack de GR00T, lo que facilita su uso en entornos de simulacion como Isaac Sim o en robots reales con ROS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta metricas de exito en la tarea (por ejemplo, tasa de exito en episodios reales o simulados), ni comparaciones con otros modelos. Solo se indica la perdida de entrenamiento final (0.022) y el numero de pasos.

## Requisitos de hardware

- El modelo tiene 3B parametros, por lo que la inferencia requiere al menos 6 GB de VRAM en precision FP16 (los pesos ocupan ~6 GB), aunque el repositorio completo pesa 19.6 GB por incluir ambos checkpoints.
- GPU recomendadas: una RTX 3090/4090 (24 GB VRAM) es suficiente para inferencia en FP16; para entrenamiento se recomienda una GPU con al menos 24 GB o multiples GPUs (el entrenamiento original uso batch global 32, probablemente con varias GPUs).
- No se especifican requisitos de VRAM para el despliegue en tiempo real; se asume que el modelo se ejecuta en el stack de GR00T de NVIDIA, que puede usar vLLM o TGI para el VLM, aunque la cabeza de acciones DiT requiere ejecucion en tiempo real.
- Opciones de despliegue: el stack de NVIDIA Isaac GR00T (launch_finetune.py, scripts de inferencia), posiblemente compatible con ROS y simuladores como Isaac Sim. No se menciona compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CursedRock17/gr00t-n1.6-so101-box-merged | 3B | no disponible | VLA para pick-and-place SO-101 | other | HuggingFace |
| NVIDIA GR00T-N1.6-3B (base) | 3B | no disponible | VLA generalista para manipulacion | NVIDIA Open License (probablemente) | HuggingFace, NVIDIA |
| OpenVLA (por referencia) | 7B | no disponible | VLA generalista para manipulacion | MIT | HuggingFace |

La comparativa se limita al modelo base GR00T-N1.6-3B, del cual este es un ajuste fino. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas. El modelo de CursedRock17 se diferencia por estar especializado en una tarea concreta y por el co-entrenamiento sim2real con datos limitados.

## Limitaciones y advertencias

- Sobreajuste potencial: el checkpoint final (45000 pasos) puede sobreajustar los 5 episodios reales, reduciendo la generalizacion a nuevas poses o condiciones de iluminacion. Se recomienda usar el checkpoint de 27000 para aplicaciones reales.
- Dataset reducido: solo 130 episodios, de los cuales solo 5 son reales. La politica puede fallar ante variaciones no vistas (diferentes posiciones de la caja, color del bloque, etc.).
- Sesgos y alucinaciones: como VLA, puede generar acciones inconsistentes si las observaciones difieren del dominio de entrenamiento; no se han evaluado sesgos sistematicos.
- Licencia restrictiva: la licencia "other" no detalla los terminos; probablemente hereda la licencia de NVIDIA GR00T, que puede tener restricciones para uso comercial. Es imprescindible revisar la licencia original antes de cualquier uso en produccion.
- Idiomas: no se especifica soporte multilingue; la instruccion esta en ingles y es probable que el modelo solo entienda comandos en ese idioma.
- Sin soporte para otras tareas: el modelo esta especializado en pick-and-place de bloques SO-101; no sirve para otras tareas de manipulacion sin reentrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CursedRock17/gr00t-n1.6-so101-box-merged
- Dataset usado: https://huggingface.co/CursedRock17/so101-teleop-box-merged-1 (inferido del README, no verificado)
- Pagina de NVIDIA GR00T N1.6: https://research.nvidia.com/labs/gear/gr00t-n1_6/
- Repositorio Isaac GR00T en GitHub: https://github.com/NVIDIA/Isaac-GR00T
- Playbook de fine-tuning en DGX Station: https://build.nvidia.com/station/gr00t
