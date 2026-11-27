# briskVLA/shallow_8L_early

## Resumen

briskVLA/shallow_8L_early es un checkpoint de investigación derivado de lerobot/smolvla_libero, un modelo de visión-lenguaje-acción (VLA) orientado a robótica manipulativa. Lo publica el autor briskVLA como parte de una línea de trabajo centrada en reducir la profundidad del "action expert" de SmolVLA: en lugar de mantener el número completo de capas del experto original, este checkpoint conserva únicamente 8 capas (`[0, 1, 2, 3, 4, 5, 6, 7]`) bajo un diseño de rol `shallow` y un layout canónico `early`. El objetivo es evaluar si un experto de acción menos profundo mantiene la competencia en tareas de manipulación LIBERO reduciendo coste computacional y latencia de inferencia.

El modelo se distribuye en formato safetensors con 400.923.616 parámetros y un repositorio de 0,8 GB, lo que lo sitúa en la gama de modelos pequeños, aptos para despliegue en hardware modesto. La arquitectura subyacente combina un backbone visión-lenguaje con un experto de acción de tipo transformer, siguiendo el esquema de SmolVLA, y el ancho de la FFN del experto se mantiene en el valor por defecto (2048). Es relevante ahora porque la compresión de VLAs mediante destilación y poda de capas es una línea activa para llevar políticas robóticas a entornos con recursos limitados sin perder tasa de éxito.

No obstante, se trata de un artefacto de investigación: no hay model card extendida con datos de entrenamiento, benchmarks publicados ni licencia declarada, y el número de descargas y likes es cero en el momento de la consulta. Su interés es, por tanto, evaluativo y comparativo dentro de la familia briskVLA, no como modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en SmolVLA con action expert transformer reducido (rol `shallow`, layout `early`, 8 capas) |
| Parametros totales | 400.923.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

El checkpoint deriva de lerobot/smolvla_libero (commit `a24f1f380461`), un modelo SmolVLA ajustado para la suite de tareas LIBERO. La modificación principal respecto al profesor es la profundidad del experto de acción: se retienen 8 capas identificadas explícitamente como `[0, 1, 2, 3, 4, 5, 6, 7]`, con un rol etiquetado como `shallow` y un layout canónico `early`. El ancho de la FFN del experto permanece en el valor por defecto de 2048, de modo que la reducción de parámetros se produce por profundidad y no por anchura.

La model card no documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste por imitación más allá de lo heredado del modelo base. Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal. El flujo de trabajo previsto incluye evaluación en LIBERO con K=10 y K=1, medición de latencia y la posibilidad de continuar la destilación o compresión (por ejemplo, de 8L a 4L) mediante los scripts `distill_student.py` y `build_student.py` del proyecto briskvla.

## Capacidades

- Control robótico de manipulación: genera acciones a partir de observaciones visuales e instrucciones en lenguaje, orientado a las tareas de la suite LIBERO.
- Política visión-lenguaje-acción: integra percepción visual y comprensión de instrucciones para producir comandos motores.
- Evaluación multi-horizonte: el flujo de evaluación soporta K=10 y K=1, lo que permite medir comportamiento con distintos horizontes de acción.
- Compresión adicional: sirve como punto de partida para destilación y reducción de capas (8L a 4L) mediante las herramientas del proyecto.
- Medición de latencia: incluye soporte para perfilar el coste de inferencia del checkpoint.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Evaluación comparativa de profundidad del experto de acción: usar este checkpoint junto con variantes de más capas para medir el impacto de la poda en la tasa de éxito sobre LIBERO, con los scripts de evaluación K=10 y K=1.
- Investigación en compresión de VLAs: emplearlo como estudiante inicial en `distill_student.py` para explorar la destilación desde el profesor smolvla_libero hacia expertos más pequeños.
- Benchmarking de latencia en robótica: ejecutar `latency.py` para cuantificar el coste de inferencia de un experto de 8 capas frente a alternativas más profundas en el mismo hardware.
- Prototipado de políticas en hardware de gama baja: al tener 400 M de parámetros y 0,8 GB de pesos, permite experimentar con políticas VLA en estaciones con GPU consumer.
- Estudio de layouts de experto: comparar el layout `early` con otras variantes de la familia briskVLA para analizar cómo afecta la disposición de capas al rendimiento en manipulación.
- Base para posteriores reducciones: servir de fuente en `build_student.py` con `--group 2 --keep alternate --ffn fuse` para generar un estudiante de 4 capas y estudiar la degradación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 400,9 M de parámetros, los pesos en FP32 ocupan aproximadamente 1,6 GB y en FP16/BF16 unos 0,8 GB, a lo que hay que sumar activaciones y el backbone visual.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder alojar el modelo en precisión reducida.
- GPU consumer: previsiblemente cabe en tarjetas como RTX 3060, RTX 4060 o superiores, aunque no hay confirmación del autor.
- Opciones de despliegue: el ecosistema indicado es lerobot; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; el repositorio incluye un script de medición (`latency.py`) para obtenerlos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| briskVLA/shallow_8L_early | 400.923.616 | no disponible | no disponible | no disponible | Hugging Face (lerobot) |
| lerobot/smolvla_libero (profesor) | no disponible | no disponible | no disponible | no disponible | Hugging Face (lerobot) |
| Otras variantes briskVLA (p. ej. 4L) | no disponible | no disponible | no disponible | no disponible | Hugging Face (lerobot) |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se puede asumir permiso para uso comercial; es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- Modelo de investigación con cero descargas y cero likes: no hay validación comunitaria ni evidencia de robustez fuera del entorno de evaluación previsto.
- Sin benchmarks publicados: no hay métricas de tasa de éxito en LIBERO ni comparaciones cuantitativas con el profesor.
- La reducción a 8 capas del experto de acción puede degradar la precisión en tareas de manipulación de mayor complejidad; no se documenta el delta respecto al modelo completo.
- Específico del dominio LIBERO: no se garantiza generalización a otros entornos, robots o tareas fuera de la suite de evaluación.
- Sin información sobre sesgos, idiomas soportados ni riesgo de alucinación en instrucciones de lenguaje.
- No se documentan requisitos de seguridad para operar el robot; cualquier uso físico requiere supervisión y salvaguardas externas.
- Los datos de entrenamiento y el proceso de ajuste no están descritos, lo que dificulta auditar el comportamiento del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/briskVLA/shallow_8L_early
- Modelo base: https://huggingface.co/lerobot/smolvla_libero
