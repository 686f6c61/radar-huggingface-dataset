# oku006/bussing-whiteboard-act

## Resumen

`bussing-whiteboard-act` es un modelo de política de control robótico (policy) desarrollado por Orhan Kaan UYANIK (oku006) en el marco del proyecto INSAIT whiteboard. Está diseñado para la tarea de recogida de mesas (table-bussing) en un robot manipulador FR3, donde debe predecir velocidades articulares y posición del gripper a partir de observaciones visuales y de estado. El modelo se basa en un Action Chunking Transformer (ACT) personalizado, distinto del ACT estándar de LeRobot, con un encoder DINOv2-base congelado y un transformer encoder-decoder de 4 capas de encoder y 7 de decoder. Cuenta con 142,3 millones de parámetros, de los cuales solo 55,7 millones son entrenables.

El modelo se entrenó sobre el registro FR3 de demostraciones de table-bussing y está optimizado para ejecutarse a 5 Hz, prediciendo chunks de 8 ticks de acciones. La revisión actual incorpora una derivación de velocidad mediante un stride de 3 frames en los datos, lo que elimina la necesidad de escalar velocidades en tiempo de ejecución. Se han verificado los resultados en episodios held-out, mostrando una tasa de éxito de 8/10 en escenas frías y buenos cosenos de fase en las distintas etapas de la manipulación. Es relevante porque representa un caso práctico de aplicación de arquitecturas transformer a control robótico de manipulación con datos reales, y está disponible públicamente en Hugging Face.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2-base encoder (congelado) + transformer encoder-decoder (4 capas encoder, 7 capas decoder) |
| Parametros totales | 142.279.304 (142,3 M) |
| Parametros activos | 55,7 M (entrenables) |
| Longitud de contexto | no disponible (modelo de vision-accion, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo combina un encoder visual DINOv2-base congelado que procesa dos imágenes (cámara principal y cámara de muñeca) con un transformer encoder-decoder de 4 capas en el encoder y 7 en el decoder. La salida es un chunk de 8 ticks de acciones, donde cada tick contiene 7 velocidades articulares (en rad/s) y una posición de gripper en convención RAW (1.0 = abierto). El espacio de acciones es de 8 dimensiones en total.

El entrenamiento se realizó sobre el registro FR3 de table-bussing, que incluye 292 eventos de agarre. Una innovación clave de esta revisión es que las velocidades objetivo se derivan con un stride de 3 frames, calculando `(q[t+3]-q[t])/0.2`, lo que integra la aceleración en los datos y elimina la necesidad de un factor de escala posterior. Además, se aplica un mecanismo de "idle-window dropping" que protege los frames alrededor de las transiciones de gripper, ya que 107 de los 292 eventos de agarre coincidían con periodos de inactividad articular. Se probaron variantes con chunk de 16 ticks y stride-2, pero obtuvieron peores resultados, por lo que se optó por el chunk de 8 ticks con stride-3.

## Capacidades

- Control robótico de manipulación: predice 7 velocidades articulares y posición de gripper a 5 Hz.
- Percepción visual con dos cámaras: procesa imágenes de cámara principal y de muñeca mediante DINOv2.
- Generación de trayectorias por chunking: produce secuencias de 8 ticks de acciones que pueden ejecutarse de forma autoregresiva.
- Manejo de transiciones de gripper: incluye protección de frames alrededor de eventos de agarre para mejorar la precisión temporal.
- Generalización a escenas frías: verificado con 8/10 aciertos en episodios held-out no vistos durante el entrenamiento.
- No es un modelo de lenguaje ni de generación de texto; sus capacidades se limitan al control de un robot manipulador específico.

## Casos de uso

- Recogida de mesas en hostelería: el modelo puede controlar un robot FR3 para retirar bandejas y cubiertos de una mesa, integrando percepción visual y control articular en tiempo real.
- Automatización de tareas de manipulación repetitivas: cualquier tarea que requiera recoger objetos de una superficie y depositarlos en otro lugar puede adaptarse con un fine-tuning sobre datos propios.
- Investigación en aprendizaje por demostración: sirve como referencia para estudiar el efecto del stride en la derivación de velocidades y el chunking en políticas ACT.
- Evaluación de políticas de control en robótica: su verificación en held-out permite comparar métricas de coseno de fase y errores de timing con otros modelos.
- Integración en pipelines de robótica con LeRobot: aunque no es el ACT estándar, puede integrarse mediante adaptadores de despliegue (por ejemplo, la rama `whiteboard-joint-velocity` del repositorio `sombit888/robot_evals`).
- Desarrollo de sistemas de control basados en visión: su arquitectura con DINOv2 congelado es un ejemplo de cómo combinar representaciones visuales preentrenadas con transformers para acciones motoras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU o HumanEval) porque el modelo no es de lenguaje. Sin embargo, la model card reporta métricas de verificación en episodios held-out:

| Metrica | Valor |
|---|---|
| Escenas frías (cold scenes) | 8/10 movimientos correctos y bien orientados |
| Coseno de fase - approach | 0,55 |
| Coseno de fase - grasp | 0,76 |
| Coseno de fase - transport | 0,50 |
| Coseno de fase - release | 0,61 |
| Error de timing en transiciones de gripper | 1 tick (mediana) |
| Transiciones de gripper no predichas | 18/45 (40 %) |
| Excursiones fuera de límites articulares | 0 en 8 ticks integrados desde cada inicio held-out |

## Requisitos de hardware

- VRAM estimada: no especificada por el autor, pero dado el tamaño de 142,3 M de parámetros y el encoder DINOv2-base, se estima que requiere al menos 8-12 GB de VRAM para inferencia en FP32; con cuantización podría reducirse.
- GPU recomendadas: una GPU consumer como RTX 3060/4060 o superior sería suficiente; para entrenamiento completo se recomienda una GPU con 16 GB o más (por ejemplo, RTX 4090, A100).
- Despliegue en consumer GPU: sí, es factible en GPUs de gama media-alta.
- Opciones de despliegue: el modelo se carga mediante la clase `BussingActPolicy` desde Python, usando PyTorch y CUDA. No aplican herramientas como vLLM o llama.cpp porque no es un modelo de texto.
- Latencia y throughput: no disponibles; la frecuencia de ejecución objetivo es de 5 Hz (0,2 s por tick), lo que sugiere que la inferencia debe completarse en menos de 200 ms.

## Comparativa con modelos similares

No se dispone de información pública sobre otros modelos de la misma categoría (políticas ACT para table-bussing) con los que comparar directamente. Las alternativas más cercanas son:

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oku006/bussing-whiteboard-act (este) | DINOv2-base + transformer 4/7 capas | 142,3 M totales, 55,7 M entrenables | 8 ticks de acciones | no disponible | Hugging Face |
| oku006/bussing-whiteboard-act-gripper | Misma arquitectura, variante con normalización del gripper | 142,3 M | 8 ticks | no disponible | Hugging Face |
| LeRobot ACT estándar | ResNet + transformer | típicamente 80-100 M | chunks variables | Apache 2.0 | Hugging Face |

La variante `gripper` es un ajuste del mismo modelo donde el canal del gripper se normaliza junto con las velocidades, en lugar de dejarlo en bruto. No hay datos de rendimiento comparativos publicados entre estas variantes.

## Limitaciones y advertencias

- Licencia no especificada: no se indica una licencia en la model card, lo que genera incertidumbre sobre el uso comercial y la redistribución. Se debe contactar al autor antes de usar en producción.
- Entrenado para una tarea específica: el modelo solo ha sido entrenado para la tarea de table-bussing en el robot FR3; no generaliza a otras tareas de manipulación sin fine-tuning.
- Dependencia de la configuración del robot: las velocidades articulares y la convención del gripper están ligadas al robot FR3; adaptarlo a otro hardware requiere recalibración.
- Punto débil conocido: 18 de 45 transiciones de gripper dentro del chunk no se predicen correctamente, lo que puede causar errores de agarre en ejecución.
- Sesgos de datos: entrenado con un único registro de demostraciones (FR3), lo que puede limitar la robustez ante variaciones en iluminación, disposición de objetos o estilo de demostración.
- Sin soporte de cuantización documentado: no se han publicado versiones cuantizadas (GGUF, etc.), por lo que el despliegue en hardware limitado puede requerir trabajo adicional.
- Fecha de creación futura: el modelo fue creado en agosto de 2026, lo que sugiere que es un artefacto reciente; se recomienda verificar la compatibilidad con las versiones de LeRobot o PyTorch antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/oku006/bussing-whiteboard-act
- Variante con gripper ponderado: https://huggingface.co/oku006/bussing-whiteboard-act-gripper
- Perfil del autor: https://huggingface.co/oku006
- Repositorio de despliegue (rama `whiteboard-joint-velocity`): `sombit888/robot_evals` (mencionado en la model card)
