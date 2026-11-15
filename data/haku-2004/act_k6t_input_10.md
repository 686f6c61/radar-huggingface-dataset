# Haku-2004/act_k6t_input_10

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. Este repositorio, `Haku-2004/act_k6t_input_10`, contiene una política ACT entrenada con LeRobot sobre el dataset `Haku-2004/k6_4seg`, orientada a control robótico de manipulación. El modelo lo publica el usuario Haku-2004 y se distribuye bajo licencia Apache 2.0.

Se trata de un modelo pequeño (51.671.174 parámetros, unos 0,2 GB de pesos en safetensors) pensado para inferencia en tiempo real sobre robots tipo SO-100/SO-101 con LeRobot. No es un modelo de lenguaje: no procesa texto ni tiene capacidades generativas generales, sino que mapea observaciones visuales y estado del robot a comandos de acción. Su relevancia está en que ejemplifica el flujo estándar de LeRobot para entrenar y desplegar políticas de imitación con un solo comando.

La ficha cubre exclusivamente los datos disponibles en la model card y los metadatos de Hugging Face; cualquier especificación no documentada se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.671.174 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política robótica, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Dataset de entrenamiento | Haku-2004/k6_4seg |
| Tamano del repo | 0,2 GB |
| Pipeline | robotics |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño ACT introducido en el paper arXiv:2304.13705: un transformer que combina un codificador de imágenes (observaciones de cámara), un codificador del estado de las articulaciones y un decodificador que predice un chunk de acciones futuras de longitud fija. Esta predicción por chunks reduce el error de compounding respecto a políticas que predicen un solo paso, y es lo que permite alcanzar tasas de éxito altas con datos de teleoperación.

El entrenamiento se realizó con LeRobot sobre el dataset `Haku-2004/k6_4seg`, compuesto presumiblemente por episodios de teleoperación grabados con un robot de la familia SO. La model card no documenta el número de episodios, tokens, composición del dataset ni si se aplicaron técnicas de RLHF/DPO (no aplicables a imitación supervisada). No hay información sobre aumentación de datos ni sobre hiperparámetros de entrenamiento.

## Capacidades

- Predicción de chunks de acción para control de robot manipulador a partir de observaciones visuales y estado de articulaciones.
- Aprendizaje por imitación a partir de datos de teleoperación.
- Inferencia en tiempo real mediante `lerobot-record` con `--policy.path`.
- Entrenamiento reproducible desde cero con `lerobot-train --policy.type=act`.
- Integración con el ecosistema LeRobot (SO-100 follower, datasets en Hub, checkpoints).
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingües ni modo thinking: no es un modelo de lenguaje.

## Casos de uso

- Manipulación robótica con SO-100/SO-101: la política se despliega con `lerobot-record` sobre un robot follower para ejecutar tareas de picking y colocación aprendidas del dataset `k6_4seg`.
- Reproducción de experimentos de imitación: sirve como checkpoint de referencia para comparar variantes de ACT entrenadas con distintos datasets o hiperparámetros.
- Evaluación de pipelines LeRobot: permite validar el flujo completo de entrenamiento, subida al Hub e inferencia con `--episodes=10` antes de escalar a políticas mayores.
- Base para fine-tuning: al ser un modelo pequeño (51,7 M parámetros), puede reentrenarse o ajustarse sobre nuevos datasets de teleoperación con recursos modestos.
- Prototipado en laboratorio: útil para validar hardware, calibración de cámaras y latencia de control antes de invertir en políticas más grandes.
- Docencia y divulgación: ejemplo canónico de política ACT para explicar action chunking y aprendizaje por imitación en robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que ACT "often achieves high success rates", pero no aporta tasas de éxito, número de episodios de evaluación ni métricas concretas para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M parámetros en safetensors (0,2 GB de repo) la huella es muy reducida y cabe holgadamente en GPUs consumer.
- GPU recomendadas: cualquier GPU CUDA compatible con PyTorch; el comando de entrenamiento de referencia usa `--policy.device=cuda`.
- Cabe en GPU consumer: sí, por tamaño de parámetros; se recomienda verificar compatibilidad de CUDA y drivers con la versión de LeRobot instalada.
- Opciones de despliegue: LeRobot (`lerobot-record` para inferencia, `lerobot-train` para entrenamiento). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haku-2004/act_k6t_input_10 | 51.671.174 | no aplica | no disponible | apache-2.0 | Hugging Face |
| Otras políticas ACT en LeRobot Hub | variable | no aplica | variable, no documentado aquí | variable | Hugging Face |
| Políticas Diffusion Policy | no disponible | no aplica | no disponible | variable | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparables para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Es una política de imitación específica para el dataset `k6_4seg` y el robot con el que se teleoperó; generaliza mal fuera de esa distribución.
- No es un modelo de lenguaje: no procesa texto, no responde preguntas y no tiene capacidades conversacionales.
- Riesgo de fallo en condiciones de iluminación, posición de cámara o estado inicial distintos de los vistos en entrenamiento.
- No se documentan sesgos, dataset de evaluación ni tasas de éxito; cualquier uso en producción requiere validación empírica propia.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Repositorio con 0 descargas y 0 likes: sin comunidad de validación, sin issues conocidos y sin evidencia de robustez.
- Fecha de creación y actualización en 2026-11-15, posterior a la fecha habitual de publicación; conviene verificar la integridad del checkpoint antes de desplegarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Haku-2004/act_k6t_input_10
- Paper ACT: https://huggingface.co/papers/2304.13705
- LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k6_4seg
