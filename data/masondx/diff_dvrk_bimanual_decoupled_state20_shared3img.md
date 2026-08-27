# masondx/diff_dvrk_bimanual_decoupled_state20_shared3img

## Resumen

El modelo `masondx/diff_dvrk_bimanual_decoupled_state20_shared3img` es una política de control robótico bimanual entrenada con la librería LeRobot de Hugging Face. Está diseñada específicamente para el sistema da Vinci Research Kit (dVRK), un robot quirúrgico de investigación basado en el da Vinci de primera generación. El modelo implementa una arquitectura de difusión desacoplada para controlar los dos brazos del robot de forma independiente, utilizando como entrada el estado del sistema (20 variables) y tres imágenes de cámaras compartidas.

Con 552,7 millones de parámetros y un tamaño de repositorio de 2,2 GB, este modelo se publica bajo licencia Apache 2.0 y en formato safetensors. Su relevancia radica en que aborda el problema del control bimanual en robótica quirúrgica mediante aprendizaje por imitación, un área con aplicaciones potenciales en automatización de tareas quirúrgicas y teleoperación asistida. El modelo fue creado por el usuario masondx y subido al Hub en agosto de 2026, aunque no se han publicado métricas de rendimiento ni detalles de entrenamiento más allá de los proporcionados por la plantilla estándar de LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoupled bimanual diffusion (política de difusión desacoplada) |
| Parametros totales | 552.657.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de control robótico, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una política de difusión desacoplada para control bimanual, entrenada con LeRobot. La arquitectura exacta no está documentada en la model card, pero por el nombre y el contexto se trata de un modelo de difusión que genera acciones de control para los dos brazos del dVRK de forma independiente, condicionado a un estado de 20 dimensiones y a tres imágenes de cámaras (probablemente dos endoscópicas y una externa). El término "decoupled" sugiere que cada brazo tiene su propio proceso de generación, en lugar de un modelo conjunto.

El entrenamiento se realizó sobre el dataset `masondx/dvrk_bimanual_three_camera_state20`, que contiene demostraciones de tareas bimanuales con tres cámaras y estado de 20 variables. No se han publicado detalles sobre el número de tokens, composición del dataset, ni si se usó RLHF o DPO (no aplica a este tipo de modelo). La política se entrena mediante aprendizaje por imitación, probablemente con una pérdida de denoising estándar de difusión. No se documentan innovaciones técnicas específicas más allá del desacoplamiento de los brazos.

## Capacidades

- Control bimanual de robots: genera comandos de articulación para dos brazos del dVRK de forma simultánea pero desacoplada.
- Percepción visual multi-cámara: procesa tres imágenes de entrada (compartidas entre ambos brazos) para condicionar la generación de acciones.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones humanas o teleoperadas.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y despliegue de LeRobot.
- No soporta generación de texto, razonamiento, código, matemáticas, visión general ni tool calling, al ser un modelo de control robótico especializado.

## Casos de uso

- Automatización de tareas quirúrgicas en investigación: el modelo puede ejecutar maniobras bimanuales como sutura o manipulación de tejidos en entornos de laboratorio con dVRK, reduciendo la carga del cirujano en tareas repetitivas.
- Teleoperación asistida: puede usarse como asistente en teleoperación, sugiriendo o completando movimientos de los brazos a partir del estado y las imágenes, mejorando la precisión en procedimientos delicados.
- Entrenamiento de cirujanos: el modelo puede generar trayectorias de referencia para simular escenarios quirúrgicos, permitiendo practicar sin paciente real.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el desacoplamiento de políticas bimanuales y su transferencia a otros robots.
- Desarrollo de sistemas de control autónomo: integrable en pipelines de robótica quirúrgica para explorar autonomía parcial en tareas específicas.
- Benchmarking de políticas de difusión: al ser un modelo de tamaño medio, puede usarse para comparar arquitecturas de difusión en control bimanual con otros enfoques.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas de éxito en tareas, precisión de seguimiento de trayectoria ni comparaciones con otros modelos. El autor no ha documentado ningún experimento cuantitativo en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: con 552,7 M de parámetros, en FP32 se necesitan ~2,2 GB de VRAM; en FP16 ~1,1 GB; en int8 ~0,55 GB. Sin embargo, el modelo de difusión requiere además memoria para las imágenes de entrada y el proceso de denoising iterativo, por lo que se recomienda al menos 4 GB de VRAM para operar con comodidad.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 3060, o superiores. Para entrenamiento se recomienda una GPU con 8 GB o más (RTX 3070, RTX 4080, A100, etc.).
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo modernas con cuantización o incluso en FP16.
- Opciones de despliegue: LeRobot proporciona scripts de inferencia y evaluación. También puede usarse con PyTorch directamente. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible. Depende del número de pasos de denoising y del hardware.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El autor tiene otros modelos similares en el Hub, como `masondx/diff_dvrk_bimanual_zero` y `masondx/decoupled_new_tension_cut_rot_real_clean_shared_state`, ambos con la misma arquitectura de difusión desacoplada, pero no se han publicado métricas comparativas. No hay modelos de referencia establecidos para esta tarea específica en la literatura pública consultada.

## Limitaciones y advertencias

- Modelo de investigación: no ha sido validado para uso clínico real. No debe utilizarse en pacientes ni en entornos quirúrgicos sin supervisión humana.
- Sesgos y alucinaciones: al ser un modelo de control, puede generar acciones incorrectas o inseguras si las condiciones de entrada difieren de las del dataset de entrenamiento. No hay evaluación de robustez.
- Dependencia del dataset: el rendimiento está limitado a las tareas y configuraciones presentes en `dvrk_bimanual_three_camera_state20`. No se garantiza generalización a otros robots o entornos.
- Falta de documentación: no se han publicado detalles sobre el proceso de entrenamiento, hiperparámetros, ni métricas de rendimiento, lo que dificulta la reproducibilidad y la evaluación objetiva.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe asumir la responsabilidad de su uso y verificar la seguridad en aplicaciones críticas.
- Requisitos de hardware específicos: el despliegue requiere un sistema dVRK real o un simulador compatible, lo que limita su uso fuera de laboratorios especializados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masondx/diff_dvrk_bimanual_decoupled_state20_shared3img
- LeRobot (librería de entrenamiento): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- da Vinci Research Kit (dVRK): https://github.com/jhu-dvrk
- Documentación de dVRK: https://dvrk.readthedocs.io/main/
- Paper relacionado (DIF de manipulación bimanual, ICCV 2025): https://github.com/iSEE-Laboratory/DIF-of-Bimanual-Robotic-Manipulation
