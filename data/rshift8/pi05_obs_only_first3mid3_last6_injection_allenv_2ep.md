# rshift8/pi05_obs_only_first3mid3_last6_injection_allenv_2ep

## Resumen

El modelo `pi05_obs_only_first3mid3_last6_injection_allenv_2ep` es un ajuste fino (fine-tune) de 2 épocas de un modelo de robótica denominado RoboPRO, basado en π₀.₅, desarrollado por el usuario `rshift8`. El objetivo es adaptar el modelo preentrenado para que preste atención únicamente a los obstáculos, desactivando la atención al objetivo y al destino. El ajuste se realizó con JAX/orbax, supervisando las capas 0, 1, 2, 7, 8 y 9, e inyectando las últimas 6 capas (12 a 17). El entrenamiento consta de 230.934 pasos (2 × 115.467) con batch 32 y paralelismo de datos en 2 GPUs.

No se dispone de información sobre la arquitectura exacta, el número de parámetros ni la longitud de contexto en los datos proporcionados. El modelo está diseñado para tareas de robótica, probablemente relacionadas con navegación y manipulación en entornos con obstáculos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | JAX/orbax (params/) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de un modelo preentrenado llamado `mzxuan/robopro_jax_30000`, que a su vez parece ser una implementación JAX de π₀.₅. El entrenamiento se llevó a cabo durante 2 épocas, con un total de 230.934 pasos, utilizando un batch de 32 y paralelismo de datos en 2 GPUs. El esquema de ajuste supervisa las capas iniciales y medias (0, 1, 2, 7, 8, 9) e inyecta las últimas 6 capas (12, 13, 14, 15, 16, 17). La atención está configurada para observar únicamente los obstáculos, dejando desactivada la atención al objetivo y al destino.

No se proporcionan detalles sobre la composición del dataset de entrenamiento, el número de tokens ni la aplicación de técnicas como RLHF o DPO. Cada directorio de checkpoint contiene los pesos, el estado del optimizador, los assets de normalización y la configuración de entrenamiento necesaria para reanudar el entrenamiento o evaluar el modelo.

## Capacidades

- Generación de acciones para robótica: el modelo está afinado para atender a obstáculos en el entorno, lo que sugiere capacidades de evitación y navegación.
- No se dispone de información documentada sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento.
- Al ser un modelo basado en π₀.₅, podría heredar capacidades de visión-lenguaje-acción, pero no hay confirmación en los datos disponibles.

## Casos de uso

- Navegación de robots móviles en entornos con obstáculos: el modelo podría integrarse en un sistema de control para que un robot evite colisiones, ya que la atención está centrada en los obstáculos.
- Manipulación robótica en espacios de trabajo desordenados: al desactivar la atención al destino y al objetivo, el modelo podría priorizar la detección de obstáculos durante la planificación de movimientos.
- Simulación de robótica para entrenamiento de políticas de control: el modelo puede usarse en entornos simulados para probar comportamientos de evitación de obstáculos.
- Investigación en modelos de atención selectiva: el esquema de capas supervisadas e inyectadas permite estudiar cómo afecta la atención selectiva a la política de acción.
- Reanudación de entrenamiento: gracias a los checkpoints guardados, se puede continuar el entrenamiento desde el paso 25k, 50k, etc., para experimentar con diferentes configuraciones.
- Evaluación de políticas en robótica: los checkpoints incluyen el estado de entrenamiento y la configuración, lo que facilita la evaluación del modelo en benchmarks de robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponibles.
- No se indica si el modelo cabe en GPU de consumo.
- El repositorio tiene un tamaño de 136.3 GB, que incluye múltiples checkpoints de entrenamiento, por lo que no se puede estimar el tamaño real del modelo a partir de este dato.
- Opciones de despliegue: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. Existe otro ajuste fino similar en Hugging Face, `rshift8/pi05_obs_only_firstandlast3_injection_allenv_2ep`, que también es un ajuste de 2 épocas con atención solo a obstáculos, pero no se aportan datos de rendimiento para comparar.

## Limitaciones y advertencias

- No se ha documentado la evaluación de sesgos ni de seguridad del modelo.
- Al no haber benchmarks públicos, se desconoce la fiabilidad del modelo en entornos reales.
- La licencia no está especificada, por lo que no se puede confirmar si permite uso comercial.
- El entrenamiento se realizó con una configuración muy específica (atención solo a obstáculos, capas concretas), por lo que el modelo podría no generalizar a otros entornos o tareas.
- No se dispone de información sobre la composición de los datos de entrenamiento, lo que limita la evaluación de posibles sesgos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rshift8/pi05_obs_only_first3mid3_last6_injection_allenv_2ep
- Modelo base (`mzxuan/robopro_jax_30000`): https://huggingface.co/mzxuan/robopro_jax_30000
- Fine-tune similar: https://huggingface.co/rshift8/pi05_obs_only_firstandlast3_injection_allenv_2ep
