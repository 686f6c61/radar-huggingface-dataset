# sameer-s1/physical-ai-observability-policies

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un conjunto de seis políticas de control robótico entrenadas con el algoritmo ACT (Action Chunking with Transformers) dentro del ecosistema LeRobot. El autor, `sameer-s1`, las publica como material de reproducibilidad del artículo *Toward Observability in Physical AI: Offline Diagnostics for Imitation-Learning Policies in Robotics*, cuyo objetivo es estudiar cómo diagnosticar de forma offline el comportamiento de políticas de imitación antes de desplegarlas en un robot real.

Las políticas cubren dos tareas de manipulación: introducir una bola en un agujero (`ball-in-the-hole`) y meter pan en una tostadora (`bread-in-toaster`). La variante `ball-augmented` se entrena con aumento de datos de imagen, mientras que las cuatro variantes `toaster` se entrenan con 2, 8, 29 y 58 demostraciones respectivamente, lo que permite analisar el efecto del volumen de datos de demostración sobre el rendimiento.

El interés de este artefacto es metodológico más que de producto: cada checkpoint está guardado a 20 000 pasos de entrenamiento con semilla 1000, de modo que las comparaciones entre variantes sean controladas. El repositorio pesa 1,2 GB y usa formato `safetensors` con la librería `lerobot`, lo que facilita cargar las políticas con las herramientas estándar del ecosistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación para robótica |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de control robótico, sin salida de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoints LeRobot) |

## Arquitectura y entrenamiento

Las políticas siguen la arquitectura ACT, un transformer que predice secuencias de acciones (*action chunks*) a partir de observaciones visuales y del estado del robot, entrenado por imitación supervisada sobre demostraciones de teleoperación. El repositorio incluye seis checkpoints, todos detenidos a 20 000 pasos de entrenamiento con semilla 1000 para mantener comparabilidad entre variantes experimentales.

Las variantes difieren en el régimen de entrenamiento: `ball-augmented` aplica aumento de datos de imagen sobre la tarea de la bola, mientras que las cuatro variantes `toaster` se entrenan con 2, 8, 29 y 58 demostraciones, respectivamente. No se documentan en la model card ni el número de tokens, ni la composición exacta de los datasets, ni si se aplicaron técnicas de regularización adicionales más allá del aumento de imagen.

## Capacidades

- Control robótico por imitación en tareas de manipulación específicas (`ball-in-the-hole` y `bread-in-toaster`).
- Predicción de secuencias de acciones (*action chunking*) a partir de observaciones visuales.
- Variante con aumento de datos de imagen (`ball-augmented`) pensada para evaluar robustez frente a variaciones visuales.
- Variantes entrenadas con distinto volumen de demostraciones (2, 8, 29, 58) para estudiar el efecto del tamaño del dataset.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües ni generación de texto.

## Casos de uso

- Reproducción de experimentos de diagnóstico offline: cargar los seis checkpoints y ejecutar las métricas del artículo para verificar los resultados publicados.
- Estudio del efecto del volumen de demostraciones: comparar las cuatro variantes `toaster` (2, 8, 29, 58 demos) para medir cómo escala el rendimiento con más datos de imitación.
- Evaluación de aumento de datos: contrastar `ball-020000` con `ball-augmented-020000` para analisar si el aumento de imagen mejora la generalización visual.
- Investigación en observabilidad de políticas: usar estos checkpoints como base para desarrollar herramientas de diagnóstico offline (análisis de activaciones, detección de modos de fallo, etc.).
- Baseline para nuevas políticas ACT: servir como referencia controlada (20 000 pasos, semilla 1000) al comparar variantes propias sobre las mismas tareas.
- Docencia y formación en imitación robótica: usar los checkpoints como ejemplo práctico de entrenamiento LeRobot con distintas configuraciones de datos.
- Análisis de fallos: comparar el checkpoint fallido de primera ejecución (`act-ball-in-the-hole`, 2 pasos) con las políticas completas para estudiar modos de fallo tempranos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al artículo (DOI 10.5281/zenodo.24496519) para los resultados experimentales, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el tamaño del repositorio (1,2 GB) incluye seis checkpoints, por lo que cada política individual es previsiblemente mucho menor.
- GPU recomendadas: no disponible; ACT es una arquitectura ligera y suele ejecutarse en GPUs de gama media, pero no se documentan requisitos concretos.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: librería `lerobot` (formato nativo de los checkpoints); no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Tareas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sameer-s1/physical-ai-observability-policies` | ACT (LeRobot) | ball-in-the-hole, bread-in-toaster | no aplica | Apache 2.0 | Hugging Face |
| `sameer-s1/act-ball-in-the-hole` | ACT (LeRobot) | ball-in-the-hole (fallido, 2 pasos) | no aplica | no disponible en la información | Hugging Face |
| Otras políticas ACT del ecosistema LeRobot | ACT (LeRobot) | variables | no aplica | variables | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada.

## Limitaciones y advertencias

- Las políticas están entrenadas para tareas muy específicas (`ball-in-the-hole` y `bread-in-toaster`); no generalizan a otras tareas sin reentrenamiento.
- Las variantes `toaster` con 2 y 8 demostraciones probablemente tienen rendimiento limitado por escasez de datos; no se documentan cifras.
- No hay información sobre sesgos, tasas de alucinación (concepto no aplicable a políticas de control) ni modos de fallo documentados en la model card.
- No se especifican los entornos robóticos, cámaras ni hardware de teleoperación usados en el entrenamiento, lo que dificulta la reproducción exacta.
- La licencia Apache 2.0 permite uso comercial, pero no se documentan restricciones adicionales ni garantías de seguridad para despliegue físico.
- No se documentan limitaciones idiomáticas porque el modelo no procesa lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/sameer-s1/physical-ai-observability-policies
- Checkpoint fallido de primera ejecución: https://huggingface.co/sameer-s1/act-ball-in-the-hole
- Código y reproducción: https://github.com/sameershah21/physical-ai-observability
- Artículo (DOI): https://doi.org/10.5281/zenodo.24496519
