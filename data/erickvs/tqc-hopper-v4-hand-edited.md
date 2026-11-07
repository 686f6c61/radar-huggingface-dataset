# erickvs/tqc-Hopper-v4-hand-edited

## Resumen

`erickvs/tqc-Hopper-v4-hand-edited` es un agente de aprendizaje por refuerzo para el entorno `Hopper-v4` de MuJoCo, derivado de `sb3/tqc-Hopper-v3` del RL Baselines3 Zoo. No es un modelo de lenguaje ni un transformer generativo: es una política neuronal (actor-crítico TQC) empaquetada como checkpoint de Stable-Baselines3, pensada para control continuo de un robot bípedo simulado. Su relevancia no reside en un reentrenamiento, sino en una intervención quirúrgica sobre los pesos: el autor modificó únicamente los sesgos de la primera capa del actor con una fórmula de una línea, sin gradientes ni datos de entrenamiento nuevos.

La edición consiste en sumar `0.1 * W[:, 5]` al vector de sesgos de `actor.latent_pi.0`, de modo que la red percibe su velocidad frontal (observación 5, velocidad del torso) como 0.1 m/s superior a la real. Este sesgo artificial corrige un fallo observado en el simulador actual, donde el hopper del zoo cae en aproximadamente un tercio de los episodios por una dinámica de velocidad que se descontrola salto a salto. El resultado declarado por el autor es una tasa de caídas del 0 % en 2.000 episodios y una recompensa media de 3.688,24, por encima de todos los hoppers entrenados del zoo.

El interés técnico del artefacto es doble: por un lado, demuestra que ediciones de pesos dirigidas y verificables pueden superar a políticas entrenadas en entornos con patologías concretas; por otro, sirve como caso de estudio de metodología experimental (selección sobre semillas de desarrollo, validación en semillas retenidas, intervalos bootstrap). El modelo es de nicho, con 0 descargas y 0 likes en el momento de la ficha, y su valor es fundamentalmente académico y reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor-crítico TQC (Truncated Quantile Critics) con políticas MLP, implementado en Stable-Baselines3 / sb3-contrib |
| Parametros totales | no disponible (no se declara el recuento; el tamaño del repo es 0.0 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de control continuo; observación de dimensión fija de Hopper-v4) |
| Tipos de cuantizacion | no disponible (checkpoint `.zip` de SB3; no se publican variantes GGUF ni cuantizadas) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `.zip` de Stable-Baselines3 (`tqc-Hopper-v4-hand-edited.zip`), cargable con `sb3_contrib.TQC.load` |

## Arquitectura y entrenamiento

La política subyacente es un TQC estándar del RL Baselines3 Zoo: un actor determinista con extractor MLP (`actor.latent_pi`) que mapea la observación de `Hopper-v4` a una acción continua de 3 dimensiones (torques en las tres articulaciones), y un conjunto de críticos que estiman cuantiles truncados de la distribución de retorno. El checkpoint base `sb3/tqc-Hopper-v3` fue entrenado por el equipo de SB3 con el pipeline habitual del zoo; este repositorio no incluye información sobre el número de pasos, la composición del dataset de transiciones ni hiperparámetros de entrenamiento.

La innovación no está en el entrenamiento sino en la edición post-hoc: el autor no reentrenó ni hizo fine-tuning. Aplicó una única transformación lineal sobre los sesgos de la primera capa del actor, `sd["actor.latent_pi.0.bias"] += 0.1 * sd["actor.latent_pi.0.weight"][:, 5]`, que equivale a desplazar la lectura de la velocidad frontal en +0.1 m/s. El procedimiento de selección fue pre-registrado: tres magnitudes candidatas (+0.1, +0.2 y +0.3 m/s) evaluadas en 1.500 episodios de desarrollo, elección sobre 1.000 semillas retenidas y puntuación final en 2.000 semillas no vistas. Según la model card, el rango útil es estrecho: +0.1 m/s dio 3.689 sin caídas, +0.2 dio 3.630 con 0,2 % de caídas y +0.3 provocó caídas en el 91 % de los episodios. La misma edición redujo caídas en los hoppers SAC y Walker2d del zoo, pero no tuvo efecto en el Ant, lo que sugiere que el fallo corregido es específico de la dinámica de locomoción bípeda.

## Capacidades

- Control continuo de locomoción bípeda en `Hopper-v4` de Gymnasium/MuJoCo: genera acciones de torque a partir de observaciones proprioceptivas.
- Política determinista apta para evaluación con acciones deterministas, tal como se reportan los resultados.
- Robustez declarada frente a ruido de arranque: con 10 veces el ruido de inicio por defecto mantiene 3.684 de retorno sin caídas.
- Robustez en episodios largos: en episodios de 3.000 pasos alcanza 11.372 de retorno sin caídas.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico: no es un modelo de lenguaje.
- No tiene capacidades multilingües, de visión ni de audio.
- No dispone de modo "thinking" ni de decodificación especulativa; la inferencia es un forward pass del actor MLP.

## Casos de uso

- **Investigación en edición de pesos de políticas RL**: sirve como referencia reproducible para estudiar cómo una perturbación lineal de los sesgos de entrada altera el comportamiento de una política entrenada, con métricas de caída y retorno sobre semillas fijas.
- **Benchmark de robustez en MuJoCo**: útil como baseline editado frente a `sb3/tqc-Hopper-v3` y `sb3/td3-Hopper-v3` en experimentos que midan sensibilidad a ruido de inicio y horizonte de episodio, gracias a los protocolos publicados de 2.000 semillas.
- **Docencia en aprendizaje por refuerzo**: ejemplo compacto de actor-crítico TQC cargable con `sb3_contrib.TQC.load` en unas pocas líneas, adecuado para prácticas de evaluación determinista y análisis de fallos de locomoción.
- **Estudio de patologías de simulación**: el caso documenta cómo un cambio en la dinámica del simulador (MuJoCo actual) degrada políticas antiguas del zoo y cómo compensarlo sin reentrenar, lo que resulta útil para equipos que migran versiones de MuJoCo.
- **Validación de pipelines de evaluación**: la model card describe un flujo completo (registro del modelo, 15.000 episodios de baseline, análisis automático, selección en semillas retenidas) que puede reutilizarse como plantilla de evaluación estadística con intervalos bootstrap.
- **Prueba de herramientas de edición de modelos**: el autor lo vincula a WSP Lab, una herramienta para que agentes de IA editen pesos de forma verificable; este checkpoint sirve como caso de prueba de extremo a extremo de ese tipo de flujo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente; `verified: false` en el model-index). Evaluación en 2.000 episodios de `Hopper-v4`, semillas 2.000.000 a 2.001.999, acciones deterministas:

| Modelo | Retorno medio | Caídas | Velocidad frontal |
|---|---|---|---|
| **Este modelo** | **3.688** | **0 %** | 2,69 m/s |
| `erickvs/sac-Hopper-v4-hand-edited` | 3.654 | 0 % | 2,66 m/s |
| `sb3/td3-Hopper-v3` (mejor hopper del zoo) | 3.535 | 0 % | 2,54 m/s |
| `sb3/tqc-Hopper-v3` sin editar | 3.328 | 34,6 % | 2,67 m/s |
| `sb3/sac-Hopper-v3` sin editar | 1.171 | 98,4 % | 2,68 m/s |

Diferencias pareadas en las mismas semillas con intervalos bootstrap del 95 %: +360 (+338 a +383) frente al TQC sin editar; +152,8 (+152,1 a +153,5) frente a TD3, con puntuación superior en los 2.000 episodios.

Robustez en 500 semillas no usadas para elegir la edición:

| Prueba | Este modelo | TD3 | TQC sin editar |
|---|---|---|---|
| Ruido de inicio ×10 | 3.684, sin caídas | 3.530, sin caídas | 3.317, 33 % caídas |
| Episodios de 3.000 pasos | 11.372, sin caídas | 10.902, sin caídas | 6.271, 82 % caídas |

El model-index declara `mean_reward` de 3.688,24 ± 10,57. La evaluación del autor en float64 se contrastó con la carga vía sb3-contrib en float32: 3.688,7 sin caídas en las semillas 2.000.000 a 2.000.499, frente a 3.688,5 en WSP Lab; float32 altera episodios individuales hasta 27 puntos pero no la media.

## Requisitos de hardware

- El artefacto es un checkpoint MLP de tamaño reducido (repo de 0.0 GB); la inferencia es un forward pass de una red pequeña por paso de simulación.
- VRAM estimada: no disponible de forma explícita; por la naturaleza del modelo (MLP de control) es del orden de decenas de MB, muy por debajo de cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU consumer (por ejemplo, RTX 4090) es sobredimensionada para el modelo, aunque puede acelerar el renderizado de MuJoCo.
- Cabe en cualquier GPU consumer y en CPU; el cuello de botella es el simulador MuJoCo, no la red.
- Opciones de despliegue: `sb3_contrib.TQC.load` con Stable-Baselines3 y Gymnasium; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles. El autor reporta tiempos del flujo de edición (20 s para puntuar tres magnitudes en 1.500 episodios de desarrollo y elegir en 1.000 semillas retenidas; 10 s para la puntuación final en 2.000 semillas) en un Apple M5 Max, pero no se declara throughput de inferencia por paso.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Retorno medio (2.000 semillas) | Caídas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `erickvs/tqc-Hopper-v4-hand-edited` | TQC editado a mano | Hopper-v4 | 3.688 | 0 % | MIT | Hugging Face |
| `erickvs/sac-Hopper-v4-hand-edited` | SAC editado a mano | Hopper-v4 | 3.654 | 0 % | no disponible en la información | Hugging Face |
| `sb3/td3-Hopper-v3` | TD3 entrenado | Hopper-v3/v4 | 3.535 | 0 % | no disponible en la información | Hugging Face (zoo) |
| `sb3/tqc-Hopper-v3` | TQC entrenado (base) | Hopper-v3/v4 | 3.328 | 34,6 % | no disponible en la información | Hugging Face (zoo) |

## Limitaciones y advertencias

- Resultados no verificados de forma independiente: el model-index marca `verified: false` y todas las cifras provienen del autor.
- El modelo está especializado exclusivamente en `Hopper-v4`; no es reutilizable en otras tareas ni entornos sin reentrenamiento.
- La edición depende de la dinámica del simulador actual; un cambio de versión de MuJoCo o de parámetros físicos puede invalidar el sesgo de +0.1 m/s.
- El rango de la corrección es estrecho: +0.3 m/s provoca caídas en el 91 % de los episodios, lo que indica fragilidad ante variaciones de la magnitud.
- No corrige el fallo del Ant del zoo, según el propio autor, porque la causa de sus caídas es distinta.
- Al ser una política determinista, no incorpora exploración ni adaptación en línea.
- Riesgo de sobreajuste a las semillas de evaluación: aunque se usan semillas retenidas, el protocolo no ha sido replicado por terceros.
- Licencia MIT, que permite uso comercial y modificación, pero el artefacto no está pensado para producción robótica real sin validación adicional en hardware.
- No aplican sesgos lingüísticos ni de alucinación propios de modelos de lenguaje; los riesgos son de generalización y de estabilidad del control.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/erickvs/tqc-Hopper-v4-hand-edited
- Modelo base: https://huggingface.co/sb3/tqc-Hopper-v3
- Modelo relacionado (SAC editado): https://huggingface.co/erickvs/sac-Hopper-v4-hand-edited
- Vídeo comparativo (semilla 2.000.000): https://huggingface.co/erickvs/tqc-Hopper-v4-hand-edited/resolve/main/videos/original_vs_edited_seed_2000000.mp4
- Vídeo comparativo con TD3 (semilla 2.000.001): https://huggingface.co/erickvs/tqc-Hopper-v4-hand-edited/resolve/main/videos/original_edited_td3_seed_2000001.mp4
- RL Baselines3 Zoo: https://github.com/DLR-RM/rl-baselines3-zoo
- Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
- sb3-contrib: https://github.com/Stable-Baselines-Team/stable-baselines3-contrib
- WSP Lab: no disponible (el autor indica "coming soon")
