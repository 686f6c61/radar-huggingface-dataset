# RyanL22/pi05-anyh2r-rh56f1-frozen-aug-20k

## Resumen

pi05-anyh2r-rh56f1-frozen-aug-20k es un checkpoint de política robótica de tipo visión-lenguaje-acción (VLA) derivado de `lerobot/pi05_base` y publicado por el usuario RyanL22. Se distribuye en formato LeRobot-native y está especializado en el control de un brazo OpenArm con manos RH56F1, entrenado sobre una mezcla de datos denominada anyh2r compuesta por 12 celdas sintéticas/IDM generadas a partir de vídeo humano y 4 celdas de teleoperación real. Los pesos suman 4.143.404.816 parámetros (4,14B) y el repositorio ocupa 9,4 GB.

No es un LLM de propósito general: recibe dos vistas de cámara ZED de 288x512 y un vector de estado de 28 dimensiones, y emite fragmentos de 50 acciones a 20 fps (2,5 s de horizonte). Su rasgo distintivo frente al checkpoint anterior del mismo autor es que congela el codificador visual SigLIP (412,4M de parámetros) y aplica aumento fotométrico y afín replicando un único sorteo sobre el par estéreo, con el objetivo de eliminar la dependencia del dominio de imagen en la amplitud de las acciones predichas.

El checkpoint corresponde al paso 20.000 de un entrenamiento de 60.000 pasos, por lo que es una instantánea intermedia y no un modelo final. Resulta relevante para equipos que trabajan en manipulación robótica con LeRobot y quieren evaluar el efecto del congelado del codificador visual sobre la transferencia entre imágenes sintéticas y reales. En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 likes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (visión-lenguaje-acción) de la familia pi05, LeRobot-native; la model card no detalla la arquitectura interna completa |
| Parámetros totales | 4.143.404.816 (4,14B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Codificador visual | SigLIP congelado, 412,4M de parámetros (`freeze_vision_encoder=true`) |
| Longitud de contexto | No aplica; horizonte de acción (chunk) de 50 pasos a 20 fps (2,5 s) |
| Tipos de cuantización | No disponible (no se documentan cuantizaciones; pesos en safetensors) |
| Idiomas soportados | No aplica / no disponible (el modelo produce acciones, no texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |
| Entradas | `observation.images.base_0_rgb` (vista ZED izquierda, 288x512), `observation.images.left_wrist_0_rgb` (vista ZED derecha, 288x512), `observation.state` de 28 dimensiones |
| Dimensiones del estado | 28: neck(2) \| left_arm(7) \| right_arm(7) \| left_hand(6) \| right_hand(6) |
| Frecuencia de control | 20 fps |
| Tamaño del repositorio | 9,4 GB |

## Arquitectura y entrenamiento

La información proporcionada describe un modelo pi05 en formato LeRobot-native afinado desde `lerobot/pi05_base`. El único componente arquitectónico detallado en la model card es el codificador visual, un SigLIP de 412,4M de parámetros que en esta ejecución se mantiene congelado, a diferencia del checkpoint anterior del mismo autor, donde se afinaba. El modelo consume dos flujos de imagen de 288x512 píxeles procedentes de cámaras ZED y un vector propioceptivo de 28 dimensiones que descompone cuello (2), brazos izquierdo y derecho (7 cada uno) y manos izquierda y derecha (6 cada una), y produce fragmentos de 50 acciones a 20 fps. No se especifican en el material disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon etapas de RLHF, DPO o similares.

Los datos de entrenamiento corresponden a la mezcla anyh2r del 13 de septiembre de 2026, con 12 celdas sintéticas/IDM derivadas de vídeo humano y 4 celdas de teleoperación real. La innovación técnica declarada es doble: por un lado, el reparto de celdas es proporcional a la raíz cuadrada del número de fotogramas (`∝ sqrt(frames)`), lo que reduce la dispersión de exposición por fotograma de 4,59x a 2,14x; por otro, el aumento de imagen (fotométrico y afín) se sortea una sola vez y se replica sobre el par estéreo para mantener la consistencia entre ambas vistas. El entrenamiento se detuvo en el paso 20.000 de 60.000, y se mantiene el aumento de espejo con probabilidad 0,5.

## Capacidades

- Generación de acciones de manipulación robótica en bloques (chunks) de 50 pasos a 20 fps.
- Control bimanual coordinado: dos brazos de 7 grados de libertad y dos manos de 6 grados de libertad cada una.
- Percepción estéreo mediante dos vistas ZED simultáneas de 288x512, con normalización a un punto de vista canónico (`base_0_rgb`) y una vista de muñeca (`left_wrist_0_rgb`).
- Fusión de percepción visual con estado propioceptivo de 28 dimensiones.
- Transferencia entre dominios de imagen: el congelado del codificador visual busca que la amplitud de la acción no dependa de si la imagen es sintética o real (sondas cross-domain entre 0,91x y 1,16x).
- No genera texto abierto: la salida es una secuencia de acciones.
- No se documenta soporte de tool calling, function calling ni uso como agente multi-paso.
- No se documentan capacidades de thinking mode, audio ni visión general fuera del contexto de control robótico.
- Capacidades multilingües: no aplica.

## Casos de uso

- Manipulación bimanual en laboratorio: el modelo controla un OpenArm de dos brazos con manos RH56F1 a partir de dos cámaras y del estado propioceptivo, lo que permite ejecutar tareas de agarre y colocación con ambas manos en un banco de pruebas.
- Investigación sobre transferencia sim-a-real: la congelación del codificador visual está pensada explícitamente para que la política reproduzca el mismo movimiento tanto sobre fotogramas sintéticos como sobre imagen real de cámara, lo que lo hace útil como objeto de estudio de robustez cross-domain.
- Punto de partida para nuevos ajustes finos: al declarar `base_model: lerobot/pi05_base`, el checkpoint puede reutilizarse como inicialización para mezclas de datos adicionales sobre el mismo embodiment.
- Evaluación comparada de estrategias de aumento de datos: sirve para medir el efecto de replicar el mismo sorteo de aumento sobre el par estéreo frente a sortear por vista, algo relevante para pipelines de visión robótica.
- Control de manos de 6 grados de libertad: la dimensión de estado dedicada a cada mano permite entrenar y desplegar políticas de prensión fina en tareas que requieren coordinación dedo a dedo.
- Integración en pipelines LeRobot: al ser un checkpoint LeRobot-native, se puede cargar directamente en los flujos de entrenamiento e inferencia de esa librería sin conversión de formato.
- Prototipado de políticas de horizonte corto: con chunks de 2,5 s, encaja en bucles de control a 20 fps donde se consulta la política periódicamente y se ejecutan las acciones devueltas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de una política robótica. La model card sí incluye una sonda de dominio cruzado que mide el factor de cambio en la amplitud de la acción al mantener el estado fijo e intercambiar la fuente de imagen:

| Sonda cross-domain (mismo estado, fuente de imagen intercambiada) | Checkpoint anterior (20k) | Este checkpoint (20k) |
|---|---|---|
| ball | 1,48x | 1,16x |
| bottle | 1,87x | 0,91x |
| box | 1,93x | 1,00x |
| doll | 1,35x | 1,01x |

Datos adicionales declarados por el autor:

| Métrica | Valor |
|---|---|
| Reproducción de chunk in-distribution (este checkpoint) | 0,85-1,09 respecto al ground truth |
| Reproducción de movimiento en rollouts sobre imagen real (checkpoint anterior) | 27-65% del movimiento entrenado |
| Dispersión de exposición por fotograma | 4,59x (anterior) -> 2,14x (esta ejecución) |
| Paso de entrenamiento | 20.000 de 60.000 |

## Requisitos de hardware

Estimaciones calculadas a partir del recuento de parámetros (4,14B); el autor no publica requisitos de hardware.

- VRAM estimada, solo pesos: bf16 ~8,3 GB; fp32 ~16,6 GB; int8 ~4,1 GB; int4 ~2,1 GB.
- VRAM estimada en inferencia real: en torno a 10-13 GB en bf16 sumando activaciones y buffers de las dos imágenes de 288x512 y del codificador SigLIP de 412,4M de parámetros.
- GPU recomendadas: NVIDIA A100 40/80 GB, H100, L40S o A6000 para despliegue con margen; RTX 4090 y RTX 3090 (24 GB) son suficientes para este tamaño en bf16.
- GPU de consumo: sí cabe en tarjetas de 24 GB (RTX 3090, 4090) en bf16, y en tarjetas de 16 GB si se recurre a cuantización o a un lote de una sola observación.
- Opciones de despliegue: la librería lerobot (PyTorch) con pesos safetensors. vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Como referencia de diseño, el bucle de control declarado es de 20 fps con chunks de 50 pasos (2,5 s).

## Comparativa con modelos similares

| Modelo | Parámetros | Codificador visual | Checkpoint | Licencia | Rendimiento cross-domain |
|---|---|---|---|---|---|
| pi05-anyh2r-rh56f1-frozen-aug-20k (este) | 4,14B | SigLIP congelado (412,4M) | 20.000/60.000 | apache-2.0 | 0,91x-1,16x |
| Checkpoint anterior del mismo autor (`...-wristik-grasp-mirror-20k`) | No disponible | SigLIP afinado | 20.000 | No disponible | 1,35x-1,93x |
| lerobot/pi05_base | No disponible en la información | No disponible | Modelo base | No disponible en la información | No disponible |

No se dispone de datos de benchmarks que permitan comparar este checkpoint con alternativas de otros autores de la misma categoría (políticas VLA para manipulación bimanual), por lo que esa comparación se marca como no disponible.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 20.000 de 60.000); su calidad puede no reflejar la de la ejecución completa.
- Está ajustado a un embodiment concreto (OpenArm con manos RH56F1 y cámaras ZED a 288x512); fuera de esa configuración de hardware y de esas dimensiones de estado y acción no es directamente utilizable.
- No genera lenguaje: no sirve como modelo de chat, razonamiento textual ni generación de código.
- No se documentan sesgos ni evaluaciones de seguridad; el autor no publica análisis de fallos más allá de la sonda cross-domain.
- El riesgo de alucinación en el sentido clásico no aplica, pero sí existe riesgo de acciones incorrectas o inseguras: una política robótica puede producir movimientos erróneos ante entradas fuera de distribución.
- La mezcla de entrenamiento combina vídeo humano transformado por IDM con teleoperación real; el reparto de celdas proporcional a la raíz del número de fotogramas altera la distribución efectiva de los datos y puede introducir sesgos hacia las celdas con más fotogramas.
- El repositorio presenta 0 descargas y 0 likes, y proviene de un autor individual sin validación externa conocida: conviene tratar los resultados declarados como no verificados de forma independiente.
- Licencia apache-2.0 en este checkpoint, pero el modelo base `lerobot/pi05_base` puede tener condiciones propias que conviene revisar antes de un uso comercial.
- No se documentan cuantizaciones oficiales ni requisitos de hardware, por lo que cualquier estimación de VRAM es aproximada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RyanL22/pi05-anyh2r-rh56f1-frozen-aug-20k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Librería LeRobot: https://github.com/huggingface/lerobot
- No se han proporcionado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
