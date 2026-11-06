# kinster/IMLE-VLA

## Resumen

IMLE-VLA es un conjunto de checkpoints para políticas vision-language-action (VLA) orientadas a control robótico, presentado en el artículo "IMLE-VLA: Fast Single-Step Action Generation for Vision-Language-Action Policies" (IROS 2026). Lo desarrolla un equipo académico liderado por Kian Hosseinkhani y Ke Li, y se publica bajo licencia Apache 2.0. El modelo parte de π₀.₅ (openpi, Physical Intelligence) y sustituye su cabeza de acciones basada en flow matching de 10 pasos por un generador de un solo paso entrenado con el objetivo Conditional IMLE (Implicit Maximum Likelihood Estimation).

El problema que resuelve es la latencia en la generación de acciones: π₀.₅ necesita 10 pasos de integración por cada chunk de acciones, lo que limita la frecuencia de control a 15 Hz en una NVIDIA L40S. IMLE-VLA mantiene el backbone VLM congelado y entrena únicamente el experto de acciones con cIMLE, logrando un único forward pass por chunk y alcanzando 55 Hz en el mismo hardware, lo que habilita tareas reactivas con objetivos en movimiento.

El repositorio incluye el checkpoint del modelo real de DROID (JAX/orbax y una conversión a un motor Triton de un solo paso), así como checkpoints LeRobot para los suites de LIBERO con horizontes de ejecución 10 y 30. El tamaño total del repo es de 133,5 GB, aunque los pesos individuales del modelo DROID ocupan 6,6 GB (JAX) y 6,3 GB (Triton).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLM backbone congelado (PaliGemma) + experto de acciones transformer con generador de un solo paso (cIMLE); sustituye la cabeza flow matching de π₀.₅ |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors y formato orbax; conversión a pkl para motor Triton) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (backbone PaliGemma sujeto a Gemma Terms of Use) |
| Formato de pesos | safetensors, orbax (JAX), pkl (motor Triton), LeRobot checkpoints (LIBERO) |

## Arquitectura y entrenamiento

IMLE-VLA reutiliza el backbone VLM de π₀.₅ (PaliGemma) completamente congelado y entrena solo el experto de acciones. La innovación central es reemplazar la cabeza de flow matching de 10 pasos por un generador de un solo paso optimizado con Conditional IMLE (cIMLE), con un factor de muestreo m = 2. El modelo DROID se ha afinado sobre el dataset DROID con espacio de acciones de posición articular, chunks de 16 pasos y dos vistas de cámara (una exterior y una de muñeca). La configuración de entrenamiento indicada es `16_horrizon_05_lr_2_factor_96_batch`, step 57000.

El resultado es un único forward pass por chunk de acciones, lo que multiplica por aproximadamente 3,7 la frecuencia de control (de 15 Hz a 55 Hz en una L40S) sin cambiar el backbone. Se proporcionan además checkpoints LeRobot para LIBERO entrenados con horizontes de ejecución 10 y 30, por suite (spatial, object, goal, long) y agregado.

## Capacidades

- Generación de acciones robóticas de un solo paso por chunk (single-step action generation) a partir de observaciones visuales y lenguaje.
- Control reactivo a alta frecuencia (55 Hz en L40S con horizonte de ejecución 12), adecuado para objetivos en movimiento.
- Manipulación de mesa con brazo Franka Emika Panda: tareas de intercambio de objetos, colocación en recipiente y colocación en armario.
- Política entrenada sobre DROID con dos vistas de cámara (exterior y muñeca).
- Checkpoints para evaluación en simulación con los suites de LIBERO (spatial, object, goal, long) a horizontes 10 y 30.
- Servido mediante `serve_policy.py` (JAX) y motor Triton (`serve_triton.sh`).
- Validación contra acciones ground-truth de DROID mediante `validate_triton_droid.py`.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo thinking; es un modelo específico de robótica.

## Casos de uso

- Manipulación reactiva con objetivos móviles: el modelo puede seguir un objeto que se desplaza (por ejemplo, un plato sobre un coche teledirigido) gracias a sus 55 Hz de frecuencia de control, frente a los 15 Hz de π₀.₅, que falla en la misma tarea según los vídeos del autor.
- Pick-and-place de mesa con Franka Panda: tareas como intercambiar una piña y un cubo, depositar la piña en un bol o introducirla en un armario, usando el checkpoint DROID servido por JAX o Triton.
- Investigación en generación de acciones de un solo paso: base para comparar cIMLE frente a flow matching y regresión directa en políticas VLA, con código y pesos reproducibles.
- Evaluación en simulación con LIBERO: uso de los checkpoints LeRobot por suite y horizonte para medir éxito en tareas espaciales, de objeto, de meta y de horizonte largo.
- Integración en pipelines openpi: el checkpoint se sirve con la infraestructura existente de openpi (`policy:checkpoint`, `--env=DROID`), lo que facilita sustituir π₀.₅ por IMLE-VLA sin reescribir el cliente robótico.
- Validación offline de políticas: `validate_triton_droid.py` permite puntuar la política servida contra las acciones ground-truth de DROID antes de desplegarla en el robot.
- Despliegue en hardware de laboratorio: el motor Triton de un solo paso reduce el coste computacional por acción, lo que permite operar con una sola GPU L40S en lugar de requerir múltiples pasos de integración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos (tasas de éxito, MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor únicamente reporta la comparación cualitativa y de frecuencia: 55 Hz frente a 15 Hz en NVIDIA L40S, y éxito en la tarea reactiva de la piña sobre plato móvil donde π₀.₅ falla, según los vídeos de la model card. No se inventan cifras adicionales.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; los pesos del modelo DROID ocupan 6,6 GB (JAX) y 6,3 GB (Triton), por lo que la inferencia requiere al menos esa cantidad más overhead del runtime y del backbone PaliGemma.
- GPU recomendadas: NVIDIA L40S es el hardware de referencia del artículo (55 Hz). No se especifican otras GPU.
- GPU de consumo: no se documenta si cabe en RTX 4090 u otras consumer; no disponible.
- Opciones de despliegue: servidor openpi (`scripts/serve_policy.py` con JAX), motor Triton (`scripts/serve_triton.sh`) y LeRobot para los checkpoints LIBERO.
- Latencia y throughput: 55 Hz con horizonte de ejecución 12 en L40S para el checkpoint DROID con motor Triton; 15 Hz para π₀.₅ en el mismo hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Frecuencia de control | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IMLE-VLA (DROID) | no disponible | no disponible | 55 Hz (L40S, horizonte 12) | Apache 2.0 | Hugging Face `kinster/IMLE-VLA` |
| π₀.₅ (openpi) | no disponible | no disponible | 15 Hz (L40S) | Apache 2.0 | openpi (Physical Intelligence) |
| Otros VLA (no especificados) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa disponible es con π₀.₅, del que IMLE-VLA hereda el backbone y el dataset de ajuste (DROID); la diferencia medida es la frecuencia de control (55 Hz frente a 15 Hz) y el comportamiento en la tarea reactiva. No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo específico de robótica: no es un LLM de propósito general; no se documentan capacidades de texto, código, matemáticas ni visión general.
- Entrenado sobre DROID y validado en tareas de mesa con Franka Emika Panda; la generalización a otros robots, morfologías o entornos no está documentada.
- Los benchmarks numéricos de éxito no se publican en la model card; la evidencia es principalmente cualitativa (vídeos).
- El backbone PaliGemma está sujeto a los Gemma Terms of Use, que pueden imponer restricciones adicionales al uso comercial aunque los pesos del ajuste sean Apache 2.0.
- El repositorio es grande (133,5 GB) y requiere descarga selectiva por subcarpetas (`droid/jax/*`, `droid/triton/*`, `libero/*`).
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas; al ser un modelo de acciones, el riesgo relevante es de fallo físico en el robot, no de texto.
- Requiere la infraestructura openpi y el cliente DROID para su despliegue; no es plug-and-play fuera de ese ecosistema.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; madurez de la comunidad no contrastada.

## Enlaces

- Hugging Face: https://huggingface.co/kinster/IMLE-VLA
- Paper (arXiv): https://arxiv.org/abs/2609.10915
- Página del proyecto: https://kianhk6.github.io/IMLE-VLA/
- Código: https://github.com/kianhk6/IMLE-VLA
- Carpeta LeRobot del repositorio: https://github.com/kianhk6/IMLE-VLA/tree/main/lerobot
- openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
