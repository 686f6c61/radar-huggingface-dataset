# chomeed/dinov2-latent-wm-265d-threading-d0

## Resumen

El modelo `chomeed/dinov2-latent-wm-265d-threading-d0` es un world model latente para robótica, desarrollado por el usuario `chomeed`. Está diseñado para predecir la evolución de un estado latente comprimido a partir de observaciones de dos cámaras, con el objetivo de ser utilizado como componente de un sistema de aprendizaje por refuerzo (RL) en tareas de manipulación. El modelo se entrena sobre el dataset MimicGen, concretamente en la tarea `threading_d0` (inserción de una pieza en un orificio), y utiliza un encoder de visión DINOv2-small congelado para extraer características de imágenes de 224x224 píxeles.

La arquitectura es un modelo de dinámica latente con un cuello de botella de 265 dimensiones, que predice el siguiente estado latente dado un chunk de acciones de 8 pasos (8x7) y la propriocepción (9 dimensiones). El estado resultante para RL es de 274 dimensiones (265 de latente + 9 de propriocepción). El modelo es una variante "ancha" de un modelo hermano de 56 dimensiones, y la conclusión principal del autor es que ampliar el bottleneck de 56 a 265 dimensiones apenas mejora el rendimiento, mientras que añadir una tercera cámara con mejor información visual sí lo hace. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World model latente: encoder convolucional + dinámica residual MLP + decoder (tokens DINOv2 o segdepth/RGB) |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión con horizonte de 8 pasos de acción) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión y robótica, no de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue un pipeline de dos etapas. Primero, dos imágenes de 224x224 píxeles (cámaras `agentview` y `robot0_eye_in_hand`) pasan por un DINOv2-small congelado, produciendo un grid de características de 16x16 con 384 canales por imagen (con un token de prefijo, resultando en `(B,2,256,384)`). Después, un encoder convolucional con LayerNorm proyecta estas características a un vector latente `z` de 265 dimensiones. La dinámica se modela como `z_{t+1} = z_t + MLP([z_t, action_chunk(8x7), proprio(9)])`, donde `action_chunk` es un bloque de 8 acciones de 7 dimensiones y `proprio` es un vector de 9 dimensiones de propriocepción. El estado para RL es la concatenación de `z` y `proprio`, resultando en 274 dimensiones.

El entrenamiento se realiza sobre el dataset MimicGen `threading_d0`, con `n=40000` muestras, 25.000 pasos y 2 cámaras. El modelo se entrena con tres objetivos simultáneos: reconstrucción de los tokens DINOv2 congelados, dinámica latente y predicción de propriocepción futura. El decoder puede reconstruir tokens o, en la variante más fuerte, `{segmentación, profundidad, RGB}` a 56x56 píxeles. No se menciona RLHF ni DPO; el entrenamiento es puramente auto-supervisado, sin supervisión directa sobre la pose del objeto, que se lee posteriormente con una sonda solo para evaluación.

## Capacidades

- Predicción de estados latentes futuros: dado un chunk de acciones de 8 pasos y propriocepción, el modelo predice el siguiente estado latente, permitiendo simular la dinámica de la tarea.
- Reconstrucción visual: puede reconstruir tokens DINOv2 o, en la variante `segdepth`, mapas de segmentación, profundidad y RGB a 56x56 píxeles.
- Predicción de propriocepción futura: el modelo incluye un `pose_probe` que predice la pose del objeto, aunque solo se usa para evaluación.
- Soporte para aprendizaje por refuerzo: el estado latente compacto (274 dimensiones) está diseñado para almacenarse en un replay buffer, reduciendo el coste de memoria frente a mapas de características completos.
- Integración con MimicGen: el modelo está entrenado específicamente en la tarea `threading_d0`, por lo que captura la dinámica de esa manipulación.
- No soporta tool calling, generación de texto, ni capacidades multilingües, al ser un modelo de visión y robótica.

## Casos de uso

- Aprendizaje por refuerzo para inserción de piezas: el modelo predice el siguiente estado latente dado un chunk de acciones, lo que permite entrenar una política con RL sin necesidad de reconstruir píxeles completos, reduciendo coste computacional.
- Planificación de movimiento en tareas de ensamblaje: usando el modelo como simulador de dinámica, se puede planificar una secuencia de acciones de 8 pasos y evaluar el resultado en el espacio latente antes de ejecutarla.
- Entrenamiento de políticas con datos de demostración: el modelo puede usarse para aprender un world model a partir de demostraciones de MimicGen, y luego emplearse como base para imitación o RL.
- Simulación de escenarios para control predictivo: la predicción de propriocepción futura permite estimar el estado del robot tras una secuencia de acciones, útil para controladores basados en modelo.
- Compresión de observaciones para RL: el bottleneck de 265 dimensiones condensa la información de dos cámaras en un vector pequeño, permitiendo manejar buffers de replay de 51 MB a 100k de capacidad, en lugar de mapas de características de 37 GB.
- Evaluación de arquitecturas de world models: este modelo sirve como referencia para comparar el efecto de ampliar el bottleneck (56 vs 265 dimensiones) y de añadir cámaras adicionales, como muestra el autor en sus resultados.

## Benchmarks y rendimiento

El autor proporciona resultados en milímetros para la tarea `threading_d0`, comparando el modelo de 265 dimensiones con el de 56, y dos objetivos de reconstrucción (tokens y segdepth). Los datos son los siguientes:

| Latente | Objetivo | Needle | Tripod | Offset | flow_success | flow_failure |
|---|---|---|---:|---:|---:|---:|---:|
| 56 | tokens | 2.14 | 1.45 | 2.83 | 4.23 | 20.40 |
| 265 | tokens | 2.13 | 1.16 | 2.67 | 3.63 | 19.94 |
| 56 | segdepth | 1.67 | 0.88 | 1.96 | 3.03 | 18.85 |
| 265 | segdepth | 1.72 | 0.69 | 1.92 | 2.87 | 18.91 |

El autor señala que ampliar el bottleneck de 56 a 265 dimensiones mejora el error de offset en un 6% en el objetivo de tokens (2.83 → 2.67 mm) y en un 2% en segdepth (1.96 → 1.92 mm), lo que está dentro de la variación por semilla de σ ≈ 0.15 mm. La mejora real se concentra en el término "tripod" (0.88 → 0.69 mm), mientras que "needle" empeora ligeramente. El autor también advierte que la métrica `ratio` no es comparable entre anchuras de latente, y que el modelo de 265 dimensiones con dos cámaras (2.67 mm) es superado por un modelo de 56 dimensiones con tres cámaras (2.27 mm).

No se han publicado resultados de benchmarks en la información disponible más allá de estos datos de la tarea específica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible.
- El modelo utiliza un encoder DINOv2-small congelado y un MLP ligero, por lo que se espera un consumo bajo, pero no hay cifras oficiales.
- El estado latente de 274 dimensiones y un replay buffer de 51 MB a 100k de capacidad sugieren que el modelo puede ejecutarse en GPUs modestas, pero no se especifica.
- Opciones de despliegue: los pesos se guardan en formato safetensors, por lo que pueden cargarse con PyTorch o cualquier framework compatible. No se mencionan vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Bottleneck | Cámaras | Error offset (mm) | Licencia | Disponibilidad |
|---|---|---|---|---:|---|---|
| `chomeed/dinov2-latent-wm-56d-threading-d0` | 56 | 2 | 2.83 (tokens) / 1.96 (segdepth) | MIT | HuggingFace |
| `chomeed/dinov2-latent-wm-265d-threading-d0` | 265 | 2 | 2.67 (tokens) / 1.92 (segdepth) | MIT | HuggingFace |
| `chomeed/dinov2-latent-wm-3cam-threading-d0` | 56 | 3 | 2.27 | MIT | HuggingFace |

El modelo de 265 dimensiones es una variante ancha del de 56, con el mismo encoder, datos, dinámica, horizonte y número de pasos. La comparación muestra que añadir una tercera cámara con mejor información visual es más eficaz que ampliar el bottleneck. No se conocen otros modelos comparables en la información disponible.

## Limitaciones y advertencias

- Los resultados se basan en una sola semilla por configuración; la diferencia entre 265 y 56 en el objetivo segdepth (1.92 vs 1.96 mm) es menor que la variación por semilla medida (σ ≈ 0.15 mm), por lo que debe tratarse como un resultado nulo.
- El estado para RL crece de 65 a 274 dimensiones, y el replay buffer pasa de 11 MB a 51 MB a 100k de capacidad, lo que supone un coste mayor sin una mejora significativa.
- El modelo no está supervisado en la pose del objeto; la predicción de pose se realiza con una sonda posterior y solo para evaluación, por lo que no debe usarse directamente como estimador de pose en producción.
- No se han evaluado sesgos, ya que es un modelo de visión y no se proporciona información al respecto.
- Al ser un modelo de visión, no es aplicable a tareas de lenguaje ni soporta generación de texto.
- La licencia MIT permite uso comercial, pero no hay garantías de rendimiento ni soporte oficial.
- El modelo está entrenado específicamente en la tarea `threading_d0` de MimicGen; su generalización a otras tareas de manipulación no está evaluada.

## Enlaces

- Modelo: https://huggingface.co/chomeed/dinov2-latent-wm-265d-threading-d0
- Modelo hermano (56-d): https://huggingface.co/chomeed/dinov2-latent-wm-threading-d0
- Modelo con 3 cámaras (56-d): https://huggingface.co/chomeed/dinov2-latent-wm-3cam-threading-d0
- Documentación de DINOv2: https://huggingface.co/docs/transformers/model_doc/dinov2
