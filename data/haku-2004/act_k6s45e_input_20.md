# Haku-2004/act_k6s45e_input_20

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para control robótico que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. Este repositorio concreto, `Haku-2004/act_k6s45e_input_20`, es una política ACT entrenada con LeRobot sobre el dataset `Haku-2004/k6_4seg` y publicada en Hugging Face con licencia Apache 2.0. No es un modelo de lenguaje: es una política visomotora que mapea observaciones (imágenes de cámara y estado de las articulaciones) a comandos de control de un brazo robótico.

El modelo resuelve el problema del error de compounding en tareas de manipulación: al predecir secuencias de acciones coherentes en lugar de pasos aislados, reduce la acumulación de errores y mejora la tasa de éxito en tareas de imitación. Con 51.671.174 parámetros y un tamaño de repositorio de 0,2 GB, es una política compacta que puede ejecutarse en hardware modesto, lo que la hace relevante para prototipado rápido en robótica de bajo coste.

La relevancia actual radica en su integración con el ecosistema LeRobot de Hugging Face, que estandariza el entrenamiento, la evaluación y el despliegue de políticas robóticas. Este checkpoint concreto corresponde a un entrenamiento específico (identificador `k6s45e_input_20`) sobre un dataset de 4 segmentos, orientado presumiblemente a una tarea de manipulación con el robot SO-100.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con CVAE |
| Parametros totales | 51.671.174 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; procesa observaciones por paso) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | Haku-2004/k6_4seg |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT se basa en un transformer encoder-decoder con un componente de autoencoder variacional condicional (CVAE). El encoder procesa las observaciones (imágenes de las cámaras y el estado de las articulaciones) y el decoder genera un chunk de acciones futuras de forma paralela, en lugar de autoregresiva. Esta predicción por chunks es la innovación central del método: reduce el horizonte efectivo de decisión y mitiga el error de compounding típico de las políticas paso a paso. El componente CVAE modela la variabilidad de las demostraciones humanas, lo que ayuda a capturar la multimodalidad de las trayectorias de teleoperación.

El entrenamiento se realizó con LeRobot (`lerobot-train`) sobre el dataset `Haku-2004/k6_4seg`, que contiene demostraciones teleoperadas. No se dispone de información sobre el número exacto de episodios, la composición del dataset ni si se aplicaron técnicas de aumento de datos. El método original ACT se describe en el paper arXiv:2304.13705, donde se reportan altas tasas de éxito en tareas de manipulación fina. No se ha publicado información sobre RLHF, DPO ni ajuste posterior en este checkpoint concreto.

## Capacidades

- Control robótico visomotor: genera comandos de acción para un brazo robótico a partir de observaciones de cámara y estado de articulaciones.
- Predicción de action chunks: emite secuencias cortas de acciones coherentes, lo que mejora la estabilidad frente a políticas paso a paso.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas.
- Integración con el ecosistema LeRobot: entrenamiento, evaluación y despliegue mediante `lerobot-train` y `lerobot-record`.
- Compatibilidad con robots SO-100: la model card incluye un ejemplo de evaluación con `so100_follower`.
- No soporta tool calling, agentes, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento: es una política de control, no un modelo generativo de texto.

## Casos de uso

- Manipulación robótica de precisión en laboratorio: la política predice chunks de acciones que permiten ejecutar tareas de agarre y colocación aprendidas de demostraciones, con mayor estabilidad que políticas paso a paso.
- Prototipado rápido con SO-100: al ser un checkpoint compacto (0,2 GB) y compatible con LeRobot, se puede desplegar en un robot de bajo coste para validar tareas de pick-and-place en horas.
- Investigación en aprendizaje por imitación: sirve como línea base reproducible para comparar variantes de ACT, cambios en el dataset o estrategias de aumento de datos.
- Evaluación de políticas en entornos controlados: el comando `lerobot-record` permite ejecutar episodios de evaluación y medir tasas de éxito de forma estandarizada.
- Automatización de tareas repetitivas de ensamblaje: para tareas de 4 segmentos (según el dataset `k6_4seg`), la política puede reproducir secuencias de manipulación previamente teleoperadas.
- Docencia y formación en robótica: el modelo y su pipeline de entrenamiento son un ejemplo completo y abierto de un flujo de trabajo de imitación con licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de posición ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión FP32 para 51,7 M de parámetros; en la práctica, el cuello de botella es el procesamiento de imágenes, no los pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060 o superior es adecuada. Para entrenamiento se recomienda una GPU con 8-16 GB (RTX 3090, RTX 4090, A100).
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1660, RTX 2060, RTX 3060, RTX 4090).
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte para `cuda` o CPU. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (este checkpoint) | 51,7 M | no aplica | no disponible | Apache 2.0 | Hugging Face |
| Diffusion Policy | no disponible | no aplica | no disponible | MIT (implementación de referencia) | Repositorios académicos |
| RT-1 | ~35 M | no aplica | no disponible | no disponible | No público |
| VQ-BeT | no disponible | no aplica | no disponible | MIT | Repositorios académicos |

La comparación cuantitativa no está disponible en la información proporcionada. ACT se distingue por su simplicidad, su integración con LeRobot y su licencia permisiva, frente a alternativas como Diffusion Policy (más costosa computacionalmente en inferencia) o RT-1 (no público).

## Limitaciones y advertencias

- Sesgos conocidos: la política reproduce los sesgos de las demostraciones teleoperadas; si el dataset tiene una distribución limitada de posiciones u objetos, el modelo fallará fuera de esa distribución.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero la política puede generar acciones incorrectas o inseguras en estados no vistos durante el entrenamiento.
- Limitaciones de contexto o idioma: no procesa texto ni lenguaje; su "contexto" es la observación visual y propioceptiva por paso.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en entornos reales.
- Caveats para producción: no se han publicado métricas de robustez, tasas de éxito ni análisis de fallos; el checkpoint tiene 0 descargas y 0 likes, por lo que no hay validación comunitaria. El identificador `k6s45e_input_20` sugiere un experimento concreto sin documentación adicional. No se recomienda su uso en entornos de producción sin una evaluación exhaustiva en el robot objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k6s45e_input_20
- Paper ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k6_4seg
