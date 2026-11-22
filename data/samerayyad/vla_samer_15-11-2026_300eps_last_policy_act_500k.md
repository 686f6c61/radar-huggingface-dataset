# SamerAyyad/VLA_Samer_15.11.2026_300eps_Last_policy_ACT_500k

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice trozos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora las tasas de éxito en tareas de manipulación. Este repositorio concreto, publicado por el usuario SamerAyyad, contiene una política ACT entrenada con LeRobot sobre el dataset `SamerAyyad/VLA_Samer_15.11.2026_300eps_Last`, con 300 episodios de demostraciones teleoperadas y un checkpoint a 500 000 pasos de entrenamiento.

El modelo tiene 51 670 663 parámetros (aproximadamente 51,7 M) y se distribuye en formato safetensors con un tamaño de repositorio de 0,2 GB, lo que lo hace muy ligero y apto para inferencia en hardware de consumo. Está etiquetado como `pipeline_tag: robotics` y diseñado para controlar robots tipo SO-100/SO-101 a través del stack LeRobot.

Su relevancia radica en que ejemplifica el flujo completo de entrenamiento y despliegue de políticas robóticas open source con licencia Apache 2.0: desde la captura de datos teleoperados hasta la evaluación en robot real mediante `lerobot-record`. Es un artefacto de investigación reproducible más que un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer encoder-decoder con cabeza de predicción de chunks de acciones |
| Parametros totales | 51.670.663 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control; ventana de observación definida por la configuración de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT se basa en un transformer encoder-decoder que, a partir de observaciones (típicamente imágenes de cámaras e información de estado de las articulaciones), predice un chunk de acciones futuras en lugar de una única acción. Esta estrategia de "action chunking" reduce el error de compounding y permite movimientos más suaves y coherentes. El modelo incorpora una variante de CVAE (conditional VAE) para modelar la variabilidad de las demostraciones humanas, según el paper original (arXiv:2304.13705).

El entrenamiento se realizó con LeRobot sobre el dataset `SamerAyyad/VLA_Samer_15.11.2026_300eps_Last`, compuesto por 300 episodios de teleoperación, y el checkpoint corresponde a 500 000 pasos de entrenamiento. No se dispone de información sobre composición exacta del dataset, número de tokens, resolución de cámaras ni si se aplicaron técnicas de aumento de datos o regularización adicionales.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones (chunks) para robots manipuladores a partir de observaciones visuales y de estado.
- Aprendizaje a partir de demostraciones teleoperadas: reproduce tareas enseñadas mediante teleoperación.
- Predicción de acciones multi-paso: emite chunks que mejoran la estabilidad frente a políticas paso a paso.
- Integración con el ecosistema LeRobot: entrenamiento, evaluación e inferencia mediante `lerobot-train` y `lerobot-record`.
- Compatible con robots SO-100/SO-101 (según los ejemplos de la model card).
- No soporta tool calling, agentes, razonamiento multi-step lingüístico ni capacidades multilingües: es una política de control, no un LLM.

## Casos de uso

- Manipulación robótica de precisión en laboratorio: la política puede ejecutar tareas de pick-and-place entrenadas con 300 episodios, aprovechando los chunks de acción para movimientos suaves.
- Reproducción de tareas domésticas simples: con un SO-100/SO-101, se puede desplegar para tareas como recoger objetos o abrir cajones, siempre que el entorno coincida con el del dataset de entrenamiento.
- Investigación en aprendizaje por imitación: sirve como baseline reproducible para comparar variantes de ACT, cambios en el dataset o hiperparámetros.
- Prototipado rápido en robótica de bajo coste: al tener ~51,7 M de parámetros y 0,2 GB, se puede ejecutar en GPUs de consumo y en estaciones de trabajo modestas.
- Evaluación de pipelines LeRobot: útil para validar el flujo completo de entrenamiento y evaluación en robot real con `lerobot-record`.
- Docencia y formación: ejemplo práctico de entrenamiento de políticas con datos teleoperados y despliegue en hardware asequible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (51,7 M de parámetros), por lo que cabe holgadamente en cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son más que suficientes. Para entrenamiento se recomienda al menos una RTX 3090/4090 por comodidad.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPUs consumer recientes (GTX 1660, RTX 20xx/30xx/40xx).
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), PyTorch nativo; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a políticas robóticas).
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerá del hardware y de la frecuencia de control del robot.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SamerAyyad/VLA_Samer_15.11.2026_300eps_Last_policy_ACT_500k | 51,7 M | no disponible | no disponible | Apache 2.0 | Hugging Face (LeRobot) |
| ACT original (paper arXiv:2304.13705) | no disponible | no disponible | tasas de éxito reportadas en el paper | código abierto (repositorio original) | GitHub / paper |
| Otras políticas LeRobot (p. ej. Diffusion Policy, TDMPC) | variable | no disponible | no disponible | variable | Hugging Face (LeRobot) |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: la política está entrenada para un robot y un conjunto de tareas concretos; no generaliza a otros robots, entornos o tareas sin reentrenamiento.
- Dependencia del dataset: el rendimiento está ligado a la calidad y cobertura de los 300 episodios de teleoperación; cambios en iluminación, posición de cámara u objetos pueden degradar el comportamiento.
- Sin datos de benchmarks: no hay métricas publicadas de tasa de éxito, por lo que no se puede evaluar su rendimiento de forma objetiva sin ejecutar evaluaciones propias.
- Riesgo de alucinación en el sentido de acciones incorrectas: como toda política de imitación, puede generar acciones fuera de distribución ante observaciones no vistas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías; conviene revisar las dependencias de LeRobot y del dataset.
- Sin soporte lingüístico ni multilingüe: no es un modelo de lenguaje; las etiquetas de idioma no aplican.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/SamerAyyad/VLA_Samer_15.11.2026_300eps_Last_policy_ACT_500k
- Dataset: https://huggingface.co/datasets/SamerAyyad/VLA_Samer_15.11.2026_300eps_Last
- Paper ACT: https://huggingface.co/papers/2304.13705
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
