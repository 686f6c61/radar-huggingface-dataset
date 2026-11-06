# mysterium99/ev01_stage2_newtasks_to_manufacturing

## Resumen

EVO1 es una política de tipo Vision-Language-Action (VLA) orientada a robótica de manipulación, construida sobre el backbone InternVL3 y una cabeza de acción basada en flow matching continuo. El modelo consume imágenes de cámara junto con una instrucción en lenguaje natural y predice secuencias de acciones (chunks) para controlar un robot. Esta versión concreta, `ev01_stage2_newtasks_to_manufacturing`, es un ajuste fino publicado por el usuario `mysterium99` sobre un dataset de manufactura con 150 episodios y 218.964 fotogramas a 30 FPS.

El modelo resuelve el problema de mapear percepción visual y lenguaje a acciones motoras de bajo nivel en tareas de ensamblaje y manipulación de hardware (tornillos, tuercas, componentes). Es relevante porque demuestra el flujo completo de LeRobot para entrenar políticas VLA con flow matching y desplegarlas en robots reales de tipo `follow`, con tres cámaras de observación (gripper, top y side) y un estado propioceptivo de 6 dimensiones.

Con 776.139.440 parámetros totales y un tamaño de repositorio de 1,8 GB, se trata de un modelo de escala media pensado para inferencia en tiempo real sobre hardware de consumo o estaciones de trabajo con GPU. La licencia Apache 2.0 facilita su reutilización comercial, aunque la ausencia de resultados de evaluación publicados limita la confianza en su rendimiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA): backbone InternVL3 + cabeza de acción con flow matching continuo |
| Parametros totales | 776.139.440 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación, no modelo de lenguaje conversacional) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; LeRobot no documenta cuantizaciones oficiales para esta política) |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés: "Take hardware from human and put in taped area", "put nuts in red cup and bolts in blue bucket", "Put all hardware in bucket") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

EVO1 combina un backbone vision-language InternVL3, que codifica conjuntamente las imágenes de cámara y la instrucción de lenguaje, con una cabeza de acción que genera chunks de acciones futuras mediante flow matching continuo. Esta aproximación modela la distribución de acciones como un flujo continuo en lugar de una regresión directa, lo que permite representar multimodalidad en las trayectorias motoras. La política recibe tres cámaras (`gripper`, `newtop`, `newside`) a resolución 480x640 y un vector de estado de 6 dimensiones, y produce una acción de 6 dimensiones por paso.

El ajuste fino se realizó sobre el dataset `manufacturing_finetune` (150 episodios, 218.964 fotogramas, 30 FPS) con 20.000 pasos de entrenamiento, batch size 8, optimizador AdamW y learning rate 1e-5, semilla 0, usando LeRobot 0.6.1. No se documenta el número total de tokens de entrenamiento del backbone, la composición completa del dataset original de EVO1 ni si hubo etapas de RLHF o DPO; la información disponible corresponde únicamente al ajuste fino de imitación supervisada. No se reportan innovaciones adicionales como decodificación especulativa o atención lineal en la información proporcionada.

## Capacidades

- Control robótico de manipulación mediante imitación: predice acciones de 6 dimensiones a partir de observaciones visuales y estado propioceptivo.
- Comprensión de instrucciones en lenguaje natural en inglés para seleccionar la tarea a ejecutar entre las entrenadas.
- Percepción multi-cámara: integra tres vistas simultáneas (gripper, top, side) a 480x640.
- Generación de chunks de acciones mediante flow matching continuo, adecuada para control en tiempo real a 30 FPS.
- Ejecución de tareas de ensamblaje y clasificación de hardware: recoger componentes de un operario y depositarlos en zona delimitada, separar tuercas y tornillos en recipientes de colores, agrupar todo el hardware en un cubo.
- Integración con el ecosistema LeRobot para entrenamiento, rollout y evaluación.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito; el modelo es una política motora, no un asistente conversacional.

## Casos de uso

- Automatización de líneas de ensamblaje de hardware: el modelo puede recibir componentes de un operario y depositarlos en zonas delimitadas mediante cinta, usando las tres cámaras para localizar objetos y planificar la trayectoria de la pinza.
- Clasificación de tornillería en entornos de manufactura: separa tuercas y tornillos en recipientes de colores distintos, tarea entrenada explícitamente y adecuada para estaciones de control de calidad.
- Recogida y consolidación de piezas sueltas: agrupa todo el hardware disperso en un cubo, útil en tareas de limpieza y organización de puestos de trabajo.
- Investigación en aprendizaje por imitación: sirve como base para estudiar flow matching aplicado a políticas VLA y comparar con alternativas de regresión directa.
- Prototipado rápido de nuevas tareas con LeRobot: el pipeline `lerobot-train` permite reajustar la política sobre datasets propios de pocos cientos de episodios, como demuestra este ajuste con 150 episodios.
- Despliegue en robots de bajo coste tipo `follow`: al tener 776 M de parámetros y pesos en safetensors de 1,8 GB, puede ejecutarse en estaciones con GPU de consumo para tareas de laboratorio o demostración.
- Benchmark interno de manipulación multi-cámara: permite evaluar la contribución de cada vista (gripper, top, side) al éxito de la tarea en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 776 M de parámetros en fp16 se requieren aproximadamente 1,6 GB solo para pesos, más memoria para activaciones de InternVL3 y las tres cámaras a 480x640. En la práctica se recomienda al menos 8-12 GB de VRAM para margen operativo.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en RTX 3090, RTX 4090, A100 y H100; también en GPUs de 8 GB con cuantización, aunque no se documentan cuantizaciones oficiales.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090, aunque no hay confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia en robot, `lerobot-train` para reentrenamiento). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles. El entrenamiento usó 30 FPS de captura; el rendimiento de inferencia en tiempo real no está reportado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Evaluación publicada |
|---|---|---|---|---|---|
| ev01_stage2_newtasks_to_manufacturing | 776 M | no aplica | VLA (InternVL3 + flow matching) | Apache 2.0 | No |
| Políticas ACT de LeRobot | no disponible | no aplica | Imitación (transformer) | Apache 2.0 | Depende del checkpoint |
| Políticas Diffusion Policy | no disponible | no aplica | Imitación (difusión) | MIT/Apache según implementación | Depende del checkpoint |
| OpenVLA | ~7 B | no disponible | VLA | Apache 2.0 (con restricciones) | Sí, en papers originales |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; los datos de modelos comparables no se han verificado en esta ficha.

## Limitaciones y advertencias

- No hay resultados de evaluación publicados: se desconoce la tasa de éxito real en las tareas entrenadas.
- El modelo está ajustado a un robot concreto de tipo `follow` y a tres cámaras con nombres específicos (`gripper`, `newtop`, `newside`); cambiar la configuración de hardware requiere reentrenamiento.
- Las instrucciones de tarea están en inglés y limitadas a las tres tareas del dataset; no se documenta generalización a instrucciones nuevas.
- Riesgo de sobreajuste al dataset de 150 episodios y a las condiciones de iluminación, posiciones de objetos y operarios concretos del entorno de grabación.
- No se documentan sesgos específicos, pero al ser una política de imitación puede reproducir sesgos presentes en las demostraciones humanas.
- Riesgo de alucinación en el sentido de acciones no válidas o inseguras cuando la observación se aleja de la distribución de entrenamiento; se recomienda supervisión humana en producción.
- Licencia Apache 2.0 permite uso comercial, pero la model card no incluye garantías ni condiciones adicionales de seguridad para despliegue en robots reales.
- No se documenta soporte multilingüe ni cuantizaciones oficiales, lo que limita el despliegue en hardware muy restringido.

## Enlaces

- Hugging Face: https://huggingface.co/mysterium99/ev01_stage2_newtasks_to_manufacturing
- Repositorio EVO1: https://github.com/MINT-SJTU/Evo-1
- LeRobot: https://github.com/huggingface/lerobot
- Guía LeRobot para EVO1: https://huggingface.co/docs/lerobot/main/en/evo1
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Dataset de entrenamiento: https://huggingface.co/datasets/manufacturing_finetune
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=manufacturing_finetune
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
