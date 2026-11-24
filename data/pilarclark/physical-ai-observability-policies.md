# pilarclark/physical-ai-observability-policies

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un conjunto de seis checkpoints de políticas ACT (*Action Chunking Transformer*) entrenadas con LeRobot para tareas de manipulación robótica. Lo publica el usuario pilarclark como material de reproducción del artículo «Toward Observability in Physical AI: Offline Diagnostics for Imitation-Learning Policies in Robotics», y su propósito es servir de base para el análisis de diagnóstico offline de políticas de aprendizaje por imitación, no para inferencia conversacional.

Las políticas cubren dos entornos: introducir una bola en un agujero (`ball-in-the-hole`, con y sin aumento de datos de imagen) y meter pan en una tostadora (`bread-in-toaster`, entrenada con 2, 8, 29 y 58 demostraciones). Todos los checkpoints están guardados a 20.000 pasos de entrenamiento con semilla 1000, en formato safetensors y con licencia Apache 2.0.

Su relevancia es metodológica: proporciona un conjunto controlado de políticas con distinto volumen de datos y distintas condiciones de entrenamiento para estudiar cómo se degradan las representaciones internas y qué señales permiten detectar fallos antes del despliegue físico. No hay información sobre arquitectura detallada, parámetros ni contexto porque no aplica: es un modelo de robótica, no un LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), implementado en LeRobot |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: política de control robótico) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoints LeRobot) |

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder diseñado para aprendizaje por imitación en robótica: codifica observaciones (imágenes de cámara y estado del robot) y decodifica secuencias de acciones (*action chunks*) de forma autorregresiva, lo que reduce el error de acumulación frente a políticas paso a paso. Los checkpoints de este repositorio se entrenaron con LeRobot durante 20.000 pasos con semilla 1000, y el conjunto incluye variantes con y sin aumento de imágenes y con cuatro volúmenes de demostraciones (2, 8, 29 y 58 episodios) para la tarea de la tostadora.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta de los datasets, ni si se aplicaron técnicas de RLHF o DPO (no procede en este dominio). La innovación destacable es el propio diseño experimental: variaciones controladas de datos y aumentación que permiten estudiar la relación entre cobertura de demostraciones y calidad de la política, así como diagnosticar fallos de forma offline.

## Capacidades

- Control robótico por imitación para tareas de manipulación de precisión (bola en agujero, pan en tostadora).
- Predicción de secuencias de acciones (*action chunking*) a partir de observaciones visuales y de estado.
- Robustez parcial a variaciones visuales mediante la variante con aumento de imágenes (`ball-augmented`).
- Evaluación de escalado de datos: cuatro políticas comparables entrenadas con 2, 8, 29 y 58 demostraciones.
- Diagnóstico offline de políticas: el conjunto está pensado para analizar representaciones internas y detectar modos de fallo sin despliegue físico.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Investigación en diagnóstico de políticas de imitación: usar los seis checkpoints como banco de pruebas para comparar métricas offline (error de acción, divergencia de representaciones) con el rendimiento real en el robot.
- Estudio del escalado de datos en robótica: comparar las políticas de 2, 8, 29 y 58 demostraciones para cuantificar cuántos episodios son necesarios antes de que la política deje de mejorar.
- Evaluación de aumento de datos: contrastar `ball-020000` con `ball-augmented-020000` para medir el efecto de la aumentación de imagen en la generalización visual.
- Reproducción de resultados académicos: los checkpoints a 20.000 pasos y semilla 1000 permiten replicar exactamente los experimentos del artículo asociado.
- Docencia y formación en aprendizaje por imitación: servir de ejemplo canónico de pipeline LeRobot con políticas ACT entrenadas y listas para inspección.
- Desarrollo de herramientas de observabilidad: integrar estos checkpoints en utilidades que extraigan activaciones y detecten anomalías antes de un despliegue en producción.
- Punto de partida para *fine-tuning* en tareas de manipulación similares con pocos datos, dado que ya están en formato LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; ACT es un modelo pequeño comparado con LLM, pero no se especifican parámetros ni tamaño de los checkpoints.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; por la naturaleza de ACT y LeRobot es plausible en GPUs consumer, pero no hay datos que lo respalden.
- Opciones de despliegue: LeRobot (librería nativa del modelo); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tarea | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| physical-ai-observability-policies (este) | ACT / LeRobot | Manipulación (bola, tostadora) | 2 a 58 demos, 20k pasos, semilla 1000 | Apache 2.0 | Hugging Face |
| act-ball-in-the-hole (mismo autor) | ACT / LeRobot | Bola en agujero | Política fallida de primera ejecución (2 pasos) | no disponible | Hugging Face |
| Otras políticas ACT en LeRobot Hub | ACT / LeRobot | Manipulación variada | no disponible | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no admite prompts textuales, generación de texto ni razonamiento simbólico.
- Entrenado exclusivamente para dos tareas concretas; no generaliza a otros entornos sin reentrenamiento o *fine-tuning*.
- El volumen de demostraciones es muy bajo en algunas variantes (2 episodios), lo que implica alta varianza y riesgo de sobreajuste.
- Sesgos conocidos: no documentados; en robótica por imitación es habitual el sesgo hacia las condiciones visuales y de iluminación de las demostraciones.
- Riesgo de fallo silencioso en despliegue: precisamente el artículo asociado aborda la necesidad de diagnóstico offline, lo que sugiere que estas políticas pueden fallar sin señales evidentes.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrecen garantías ni soporte.
- No se especifican requisitos de seguridad para operar el robot; cualquier despliegue físico requiere protocolos de parada de emergencia y validación independiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/pilarclark/physical-ai-observability-policies
- Política fallida de primera ejecución: https://huggingface.co/pilarclark/act-ball-in-the-hole
- Código y reproducción: https://github.com/sameershah21/physical-ai-observability
- Artículo (DOI): https://doi.org/10.5281/zenodo.24496519
