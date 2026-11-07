# Myungkyu/rldx_b2d_ur5_rh56dfx_3_nomask_b128_60k

## Resumen

`rldx_b2d_ur5_rh56dfx_3_nomask_b128_60k` es un modelo de visión-lenguaje-acción (VLA) para robótica, publicado por el usuario Myungkyu en Hugging Face. Se trata de un fine-tuning del modelo base RLWRLD/RLDX-1-PT sobre el conjunto de datos Bench2Dex/teleopdata, en la configuración de evaluación `ur5_rh56dfx_3`, que combina un brazo robótico UR5 con una mano diestra RH56DFX. El modelo consume imágenes de tres cámaras (cabeza y dos muñecas), un vector de estado articular de 14 dimensiones y una instrucción de tarea en lenguaje natural, y produce como salida 14 objetivos articulares absolutos.

La relevancia de esta ficha no reside en el modelo como producto final, sino como ablación controlada dentro de un proyecto de investigación. Concretamente, el autor lo etiqueta como "ablation (no padding-dim noise mask)": se entrena sin enmascarado de ruido en las dimensiones de relleno (`action_noise_mask_dim=0`) y con un dropout de estado de 0.5, lo que permite aislar el efecto de esa decisión de diseño frente a la línea base "vanilla" publicada en un repositorio hermano. El entrenamiento se realizó con batch de 128 durante 60.000 pasos, y se publican checkpoints intermedios en los pasos 15.000, 30.000 y 45.000.

El modelo tiene 6.912.896.320 parámetros (aproximadamente 6,9 mil millones) según los pesos en safetensors, y el repositorio ocupa 165,9 GB, un tamaño que refleja la inclusión de múltiples checkpoints y del backbone completo. La arquitectura subyacente, RLDX-1-PT, procesa vídeo con longitud 4 y stride 2, tres vistas de cámara y un horizonte de acción de 50 pasos. No se dispone de información sobre licencia ni sobre idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RLDX-1-PT (modelo visión-lenguaje-acción, backbone transformer multimodal con tokenizador y cabecera de acciones; vídeo longitud 4 / stride 2, tres vistas de cámara, horizonte de acción 50) |
| Parametros totales | 6.912.896.320 (según safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | RLWRLD/RLDX-1-PT (fine-tuning) |
| Dataset de entrenamiento | Bench2Dex/teleopdata (exportación LeRobot del autor) |
| Configuración de evaluación | ur5_rh56dfx_3 (UR5 + mano RH56DFX, demos de replay-generalization, 4 vistas, orden articular canónico del registro) |
| Entradas | Imágenes de cabeza + muñeca izquierda + muñeca derecha, estado articular de 14 dimensiones, instrucción de tarea |
| Salidas | 14 objetivos articulares absolutos |
| Hiperparámetros | Batch 128, 60.000 pasos, `action_noise_mask_dim=0`, dropout de estado 0.5 |
| Checkpoints publicados | Final (paso 60.000) + intermedios en pasos 15.000, 30.000 y 45.000 (sin estado del optimizador) |
| Tamaño del repositorio | 165,9 GB |
| Código | RLWRLD/RLDX, rama `myungkyu/jitter-patch`, commit 21f674b4 |

## Arquitectura y entrenamiento

El modelo se construye sobre RLDX-1-PT, un backbone VLA que combina un codificador visual multi-cámara con un modelo de lenguaje y una cabecera de predicción de acciones. La configuración declarada en la model card especifica un procesamiento de vídeo con longitud de 4 fotogramas y stride 2, tres vistas de cámara simultáneas (cabeza, muñeca izquierda y muñeca derecha) y un horizonte de acción de 50 pasos, es decir, el modelo predice secuencias de 50 acciones articulares por inferencia. Las configuraciones referencian el backbone y el tokenizador por su identificador de hub, de modo que los pesos publicados contienen únicamente el fine-tuning y delegan el resto al modelo base.

El entrenamiento es un fine-tuning supervisado sobre Bench2Dex/teleopdata, en la exportación LeRobot preparada por el autor, con batch de 128 y 60.000 pasos. La innovación metodológica de esta variante es deliberadamente negativa: se elimina el enmascarado de ruido en las dimensiones de relleno del vector de acción (`action_noise_mask_dim=0`) y se aplica un dropout de estado de 0.5. El objetivo es medir el impacto de esa decisión frente a la línea base "vanilla" del mismo autor, que sí emplea la máscara de ruido. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron etapas de RLHF o DPO; dado que se trata de un modelo de robótica con salidas continuas, no cabe esperar alineamiento por preferencias humanas en el sentido de los LLM.

## Capacidades

- Control robótico de manipulación diestra: genera objetivos articulares absolutos de 14 dimensiones para un brazo UR5 equipado con mano RH56DFX.
- Percepción visual multi-cámara: integra simultáneamente imágenes de cabeza y de ambas muñecas para condicionar la acción.
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica mediante texto, lo que permite reutilizar el mismo modelo para distintas habilidades sin reentrenar.
- Generalización a demostraciones de replay: la configuración `ur5_rh56dfx_3` está pensada para evaluar generalización sobre demos de replay-generalization.
- Predicción de horizontes largos de acción: horizonte de 50 pasos, útil para ejecución con control a mayor frecuencia que la del modelo.
- Robustez parcial a la pérdida de estado: el dropout de estado de 0.5 durante el entrenamiento busca que el modelo no dependa exclusivamente del vector de estado articular.
- No disponible: soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües, modo thinking, visión general de imágenes naturales o audio. Es un modelo especializado en robótica, no un asistente conversacional.

## Casos de uso

- Investigación en ablaciones de VLA: este checkpoint sirve para comparar, contra la línea base `rldx_b2d_ur5_rh56dfx_3_b128_60k`, el efecto de eliminar el enmascarado de ruido en dimensiones de relleno; se usaría fijando el mismo protocolo de evaluación en Bench2Dex y midiendo la tasa de éxito en tareas de manipulación.
- Manipulación con mano diestra en laboratorio: el modelo produce 14 objetivos articulares absolutos para UR5 + RH56DFX, por lo que puede integrarse en un bucle de control que reciba las tres imágenes de cámara y el estado articular y emita comandos de posición.
- Evaluación de generalización a demos de replay: al haberse entrenado sobre demos de replay-generalization, es adecuado para medir cuánto generaliza el modelo cuando las trayectorias de evaluación difieren de las de entrenamiento.
- Estudio de robustez ante pérdida de estado: el dropout de 0.5 permite analizar el comportamiento del modelo cuando el vector de estado articular es ruidoso o incompleto, un escenario realista con encoders imperfectos.
- Reentrenamiento y ajuste fino posterior: al publicarse checkpoints intermedios (15k, 30k, 45k) sin estado del optimizador, se pueden usar para estudiar la curva de aprendizaje o como inicialización de nuevos fine-tunings.
- Reproducción de experimentos: con el código en el commit `21f674b4` y la exportación LeRobot del dataset, un grupo de investigación puede reproducir el entrenamiento y verificar los resultados publicados.
- Docencia y formación en VLA: como ejemplo de configuración completa de un pipeline visión-lenguaje-acción con tres cámaras y salidas continuas, útil en cursos de robótica aprendida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error articular ni comparaciones numéricas con la línea base; solo describe la configuración de entrenamiento y los checkpoints publicados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 6,9 mil millones de parámetros, en precisión completa (fp32) el peso de los parámetros ronda los 27,6 GB; en bf16/fp16, unos 13,8 GB; en cuantización de 8 bits, unos 6,9 GB; en 4 bits, unos 3,5 GB. A estas cifras hay que sumar el backbone y el tokenizador referenciados por hub id, así como el coste de procesar tres flujos de vídeo.
- GPU recomendadas: para bf16 se recomienda una GPU con al menos 24 GB de VRAM (RTX 4090, L4, A10G); para fp32 o para lotes grandes, A100 40/80 GB o H100.
- ¿Cabe en GPU de consumo? En bf16 sí cabe en una RTX 4090 (24 GB), aunque con margen ajustado al añadir el backbone y las tres cámaras; en cuantización de 8 o 4 bits cabría en GPUs de 12-16 GB, si bien no se documentan recetas de cuantización para este modelo.
- Opciones de despliegue: no se documentan en la model card. Al ser un modelo de robótica con salidas continuas y dependencias del código RLDX, el despliegue previsible pasa por cargar los pesos con las utilidades del repositorio RLWRLD/RLDX y el commit indicado, más que por servidores de inferencia de texto como vLLM o TGI. Para el backbone y el tokenizador sí aplican las herramientas habituales de Hugging Face.
- Latencia y throughput: no disponibles. Dependen del hardware, de la resolución de las tres cámaras y de la frecuencia de control del robot; el horizonte de 50 acciones permite amortizar la inferencia ejecutando varios pasos por cada llamada al modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Configuración | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rldx_b2d_ur5_rh56dfx_3_nomask_b128_60k` (este) | 6,9 B | no disponible | UR5 + RH56DFX, sin máscara de ruido, dropout 0.5 | no disponible | Hugging Face, 92 descargas |
| `Myungkyu/rldx_b2d_ur5_rh56dfx_3_b128_60k` | no disponible (mismo backbone) | no disponible | UR5 + RH56DFX, línea base vanilla con máscara de ruido | no disponible | Hugging Face |
| `Myungkyu/rldx2_rldx_b2d_ur5_rh56dfx_3_nomask_b128_60k` | no disponible | no disponible | UR5 + RH56DFX, ablación sin máscara para el proyecto RLDX-2 | no disponible | Hugging Face |

Los tres modelos comparten el backbone RLDX-1-PT y el dataset Bench2Dex/teleopdata, y se diferencian en la decisión de enmascarado de ruido y en el proyecto al que pertenecen. No se dispone de datos de rendimiento comparativo entre ellos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación, no de producción: es una ablación diseñada para comparar decisiones de entrenamiento, no un checkpoint validado para despliegue comercial.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; hay que consultar el repositorio del modelo base RLWRLD/RLDX-1-PT y el código RLDX antes de cualquier uso productivo.
- Dependencia del modelo base y del código: las configuraciones referencian backbone y tokenizador por hub id, y el entrenamiento requiere el commit `21f674b4` de la rama `myungkyu/jitter-patch`; cambios en esos artefactos pueden romper la reproducibilidad.
- Especialización estrecha: entrenado para una configuración concreta (UR5 + RH56DFX, 14 dimensiones articulares, tres cámaras); no es transferible sin más a otros robots, otras cámaras u otras dimensiones de acción.
- Riesgo de sobreajuste a las demos de replay: la configuración se basa en demos de replay-generalization, por lo que el rendimiento fuera de esa distribución no está caracterizado.
- Sin datos de sesgos, alucinación o seguridad: al no ser un modelo de lenguaje conversacional, las categorías habituales de sesgo y alucinación no aplican igual, pero tampoco se documentan evaluaciones de seguridad física para el robot.
- Idiomas no disponibles: no se especifica qué lenguas entiende en las instrucciones de tarea, lo que impide garantizar el funcionamiento en castellano.
- Checkpoints intermedios sin estado del optimizador: no permiten reanudar el entrenamiento exactamente, solo inicializar nuevos ajustes.
- Tamaño del repositorio: 165,9 GB, con descarga selectiva mediante `allow_patterns` o `ignore_patterns`; hay que planificar el almacenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Myungkyu/rldx_b2d_ur5_rh56dfx_3_nomask_b128_60k
- Línea base vanilla: https://huggingface.co/Myungkyu/rldx_b2d_ur5_rh56dfx_3_b128_60k
- Ablación para el proyecto RLDX-2: https://huggingface.co/Myungkyu/rldx2_rldx_b2d_ur5_rh56dfx_3_nomask_b128_60k
- Modelo base: https://huggingface.co/RLWRLD/RLDX-1-PT
- Código (rama y commit indicados en la model card): RLWRLD/RLDX, rama `myungkyu/jitter-patch`, commit `21f674b4`
- Dataset: Bench2Dex/teleopdata (exportación LeRobot del autor)
