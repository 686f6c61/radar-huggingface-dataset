# Dexmal/DM05-MEM-Robodojo-Sim

## Resumen

DM05-MEM-Robodojo-Sim es un checkpoint de Dexmal, un modelo de visión-lenguaje-acción (VLA) de mundo abierto para control robótico, ajustado específicamente para la evaluación en el simulador RoboDojo-Sim con el robot bimanual ARX X5. Este modelo se basa en DM0.5, el modelo fundacional VLA de Dexmal que utiliza un backbone de visión-lenguaje Gemma 3 4B junto con un Action Expert de 680 millones de parámetros, alcanzando un total de 5.829.112.208 parámetros.

La principal característica de este checkpoint es su capacidad de memoria: consume hasta 20 fotogramas históricos de la cámara de cabeza muestreados a 1 FPS, además de las vistas actuales de la cabeza y las muñecas izquierda y derecha. El modelo genera chunks de acciones de posición articular absoluta de 14 dimensiones con una longitud de 50 pasos, de los cuales se ejecutan los primeros 25. Según la instantánea del leaderboard oficial de RoboDojo del 24 de agosto de 2026, el modelo obtiene una puntuación media de 24,90 y una tasa de éxito media del 19,34 %.

Este checkpoint está diseñado exclusivamente para investigación y evaluación en RoboDojo-Sim con la configuración específica de observación/acción del ARX X5, estadísticas de normalización, orden de cámaras y política de historial de entrada. Utiliza la licencia Gemma y se distribuye en formato safetensors con un tamaño de repositorio de 23,4 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) con backbone Gemma 3 4B + Action Expert |
| Parametros totales | 5.829.112.208 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (ventana de historial de 20 fotogramas de cabeza a 1 FPS) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Gemma |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | robotics |
| Modelo base | Dexmal/DM05 |

## Arquitectura y entrenamiento

DM05-MEM-Robodojo-Sim es un modelo de visión-lenguaje-acción que combina un backbone de visión-lenguaje basado en Gemma 3 4B con un Action Expert de 680 millones de parámetros para generar acciones continuas del robot. El modelo se ajustó a partir del checkpoint generalista DM0.5 de Dexmal, un modelo fundacional de mundo abierto para inteligencia encarnada que soporta manipulación por lenguaje natural, generalización zero-shot, ajuste fino eficiente, contexto histórico de largo horizonte y transferencia entre cuerpos robóticos.

El entrenamiento de este checkpoint se realizó específicamente para la simulación RoboDojo-Sim con la embodiment bimanual ARX X5. El modelo consume las vistas RGB actuales de la cabeza y las muñecas izquierda y derecha, junto con hasta 20 fotogramas históricos de la cámara de cabeza muestreados a 1 FPS. Durante el calentamiento de la episodio, los slots de historial no disponibles se rellenan por la izquierda (left-padding) hasta que se recogen suficientes observaciones.

El modelo genera chunks de acciones de posición articular absoluta de 14 dimensiones con longitud de 50 pasos. El adaptador de evaluación de RoboDojo ejecuta las primeras 25 acciones de cada chunk predicho. La política de entrada de historial, el orden de cámaras y el modo de acción deben mantenerse fijos para obtener resultados comparables. No se han publicado detalles sobre el número total de tokens de entrenamiento ni la composición exacta del dataset de ajuste fino en la información disponible.

## Capacidades

- Generación de acciones de control robótico continuo en 14 dimensiones para el robot bimanual ARX X5.
- Procesamiento multimodal de visión y lenguaje natural para instrucciones de manipulación de mundo abierto.
- Memoria de contexto de largo plazo: consume hasta 20 fotogramas históricos de la cabeza de cámara a 1 FPS.
- Generación de chunks de acciones de longitud 50 con ejecución de los primeros 25 pasos.
- Generalización zero-shot a partir de instrucciones en lenguaje natural.
- Capacidad de ajuste fino eficiente para tareas de manipulación específicas.
- Transferencia entre diferentes cuerpos robóticos (según la descripción del modelo base DM0.5).
- Robustez frente a perturbaciones dinámicas y tareas de horizonte largo (según el modelo base).
- Soporte de evaluación en simulación RoboDojo-Sim con protocolo de evaluación oficial.

## Casos de uso

- **Evaluación de políticas robóticas en simulación**: el modelo puede evaluarse directamente en RoboDojo-Sim con la embodiment ARX-5, siguiendo el flujo de trabajo oficial de evaluación rápida con XPolicyLab y el protocolo de publicación de leaderboard.
- **Investigación en memoria de contexto para VLA**: su capacidad de consumir hasta 20 fotogramas históricos a 1 FPS permite estudiar cómo la memoria visual de largo plazo afecta al rendimiento en tareas de largo horizonte, como se refleja en la puntuación de 47,74 en la categoría Memory del benchmark.
- **Desarrollo de políticas de manipulación bimanual**: el modelo genera acciones articulares de 14 dimensiones adecuadas para el robot ARX X5, permitiendo investigar estrategias de manipulación con dos brazos en entornos simulados.
- **Benchmarking y comparación de modelos VLA**: al estar publicado en el leaderboard de RoboDojo, sirve como referencia para comparar el rendimiento de otros modelos VLA en las categorías de generalización estándar y aleatorizada, precisión, largo horizonte, memoria y mundo abierto.
- **Investigación en generalización de mundo abierto**: su capacidad de operar con instrucciones de lenguaje natural y de generalizar a configuraciones aleatorizadas (Gen-Rand) lo hace útil para estudiar límites de la generalización de modelos VLA en robótica.
- **Despliegue de políticas en entornos de producción simulados**: con una sola GPU A100/H100/H20, el modelo puede ejecutarse en modo de inferencia para servir políticas robóticas en tiempo real en simulación, útil para pipelines de entrenamiento y validación de datos.

## Benchmarks y rendimiento

Resultados en el leaderboard oficial de RoboDojo (instantánea del 24 de agosto de 2026):

| Metrica | Gen-Std | Gen-Rand | Precision | Long-Horizon | Memory | Open | Average |
|---|---|---|---|---|---|---|---|
| Score | 23,49 | 8,06 | 24,82 | 33,70 | 47,74 | 2,43 | 24,90 |
| Success Rate (%) | 18,00 | 4,00 | 16,75 | 19,50 | 47,44 | 2,08 | 19,34 |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no se ha especificado oficialmente, pero considerando los 5,83 mil millones de parámetros en safetensors (23,4 GB del repositorio), se estima que requiere al menos 24-32 GB de VRAM para inferencia con precisión completa, y menos con cuantización.
- **GPU recomendadas**: A100, H100, H20. Según la documentación, una sola GPU es suficiente para la inferencia de despliegue.
- **GPU de consumo**: no se recomienda explícitamente ninguna GPU de consumo; las GPUs recomendadas son todas de la gama de centro de datos. Con cuantización, una RTX 4090 (24 GB) podría ser viable, pero no está confirmado.
- **Opciones de despliegue**: Docker con NVIDIA Container Toolkit, instalación local con conda y PyTorch con CUDA 12.8, flash-attn, y el repositorio OpenDM de Dexmal.
- **Latencia y throughput**: no se han publicado datos de latencia o throughput en la información disponible.
- **Sistema**: Ubuntu 20.04/22.04, GPU NVIDIA con driver, Docker y NVIDIA Container Toolkit.

## Comparativa con modelos similares

No se dispone de información suficiente en la documentación proporcionada para comparar este checkpoint con otros modelos VLA similares en términos de rendimiento. Los modelos comparables serían otros VLA de mundo abierto como OpenVLA, RT-2, o modelos de Dexmal como DM0, pero no se han encontrado datos de benchmarks comparativos en la información disponible.

## Limitaciones y advertencias

- **Restricción de embodiment**: este checkpoint está diseñado exclusivamente para el robot ARX X5 bimanual en RoboDojo-Sim. Usar una embodiment diferente, orden de estado/acción, disposición de cámaras, modo de acción o estrategia de muestreo de historial puede reducir sustancialmente el rendimiento.
- **Restricción de entorno**: está diseñado específicamente para el entorno de simulación RoboDojo-Sim; no se ha validado para otros simuladores o entornos del mundo real.
- **Rendimiento en generalización aleatoria**: la tasa de éxito en el escenario Gen-Rand es del 4,00 %, lo que indica una baja robustez a variaciones aleatorias del entorno.
- **Rendimiento en mundo abierto**: la tasa de éxito en la categoría Open es del 2,08 %, lo que sugiere limitaciones significativas en escenarios de mundo abierto no vistos.
- **Dependencia de configuración fija**: cualquier cambio en la orden de cámaras, el modo de acción, el horizonte de acción o la política de historial requiere una adaptación de la configuración y puede degradar el rendimiento.
- **Licencia Gemma**: la licencia Gemma puede tener restricciones específicas de uso comercial que deben revisarse antes de su despliegue en producción.
- **Idiomas**: no se han especificado los idiomas soportados; se asume que el soporte lingüístico es el del modelo base Gemma 3 4B, pero no está confirmado.
- **Riesgo de alucinación**: como todo modelo de lenguaje, puede generar acciones o interpretaciones incorrectas en situaciones no vistas o con instrucciones ambiguas.
- **Sin cuantizaciones publicadas**: no se han publicado versiones cuantizadas oficiales, lo que limita las opciones de despliegue en hardware con menos VRAM.

## Enlaces

- [HuggingFace: Dexmal/DM05-MEM-Robodojo-Sim](https://huggingface.co/Dexmal/DM05-MEM-Robodojo-Sim)
- [GitHub: dexmal/opendm](https://github.com/dexmal/opendm)
- [HuggingFace: Dexmal/DM05](https://huggingface.co/Dexmal/DM05)
- [HuggingFace: DM05 Collection](https://huggingface.co/collections/Dexmal/dm05)
- [GitHub: RoboDojo-Benchmark/RoboDojo](https://github.com/robodojo-benchmark/RoboDojo)
- [RoboDojo Leaderboard](https://robodojo-benchmark.com/leaderboard)
- [RoboDojo Documentation](https://robodojo-benchmark.com/doc/usage/install-and-download/)
- [RoboDojo Protocol](https://robodojo-benchmark.com/leaderboard/protocol)
- [XPolicyLab PR #101](https://github.com/XPolicyLab/XPolicyLab/pull/101)
- [Tech Blog de Dexmal](https://www.dexmal.com/blog/dm0.5/index_en.html)
- [MaaS de Dexmal](https://maas.dexmal.com/)
