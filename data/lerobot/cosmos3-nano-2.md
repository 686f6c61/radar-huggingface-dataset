# lerobot/Cosmos3-Nano

## Resumen

Cosmos3-Nano es un modelo fundacional de NVIDIA para IA física, publicado originalmente en el repositorio `nvidia/Cosmos3-Nano` y redistribuido aquí por el equipo de LeRobot en formato compatible con su framework de aprendizaje robótico. Se trata de una política robótica (visión-lenguaje-acción) que, a partir de imágenes de cámara y una instrucción en lenguaje natural, predice simultáneamente los fotogramas de vídeo futuros y el siguiente bloque de acciones de control. Con 16.500 millones de parámetros totales (de los que 7.000 millones se entrenan por defecto), está pensado como checkpoint base para ajuste fino en tareas de manipulación.

La arquitectura es un Mixture-of-Transformers derivado de Qwen3-VL, con 36 capas y tamaño oculto de 4096, en el que una vía de comprensión procesa el texto y una vía de generación procesa los latentes de vídeo y las acciones, compartiendo atención. El tokenizador de vídeo es el VAE de Wan2.2. Esta separación de vías permite que el modelo combine razonamiento multimodal con generación de vídeo predictivo, una innovación relevante para el control robótico basado en modelos del mundo.

Su relevancia actual radica en que ofrece, bajo licencia OpenMDW 1.1, un modelo de mundo multimodal de gran escala listo para fine-tuning con LeRobot, lo que reduce la barrera para investigadores que quieran entrenar políticas robóticas con predicción de vídeo en lugar de enfoques puramente reactivos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Transformers (derivada de Qwen3-VL), 36 capas, hidden size 4096 |
| Parámetros totales | 16.454.213.580 (16,5B) |
| Parámetros activos | no disponible (no se especifica si es MoE disperso; se indica que 6.982.401.216 (7,0B) se entrenan por defecto) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16, timestep embedding en float32) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (openmdw1.1-license) |
| Formato de pesos | safetensors (repo de 33,0 GB) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Mixture-of-Transformers con dos vías diferenciadas: una vía de comprensión que lee el prompt de texto y una vía de generación que procesa los latentes de vídeo y las acciones, ambas convergentes en una atención compartida. El backbone deriva de Qwen3-VL, con 36 capas y dimensión oculta de 4096. La tokenización de vídeo corre a cargo del VAE de Wan2.2. Los pesos se distribuyen en bfloat16, salvo el embedding de timestep, que se mantiene en float32.

No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El proceso de ajuste fino documentado utiliza FSDP2 con precisión mixta bfloat16, gradient checkpointing y sharding de datos sobre al menos 4 GPU de 80 GB (el ejemplo oficial emplea 8 procesos sobre LIBERO-10, 16.000 pasos y batch de 32). Las cámaras, dimensiones de acción y frecuencia de fotogramas se toman del dataset de entrenamiento.

## Capacidades

- Predicción conjunta de vídeo futuro y bloques de acciones a partir de imágenes de cámara e instrucciones en lenguaje natural.
- Comprensión multimodal de texto e imagen mediante la vía derivada de Qwen3-VL.
- Generación de vídeo predictivo como modelo del mundo, útil para planificación y evaluación de políticas.
- Control robótico de manipulación (políticas de imitación) mediante ajuste fino supervisado.
- Ajuste fino completo con LeRobot, incluyendo la posibilidad de reinicializar los módulos de acción (`load_action_modules=false`).
- Inferencia en bfloat16 para evaluación (`--policy.dtype=bfloat16`).
- Soporte de tool calling, agentes multi-paso, capacidades multilingües específicas o modos de razonamiento extendido: no disponible en la información proporcionada.

## Casos de uso

- Manipulación robótica en laboratorio: ajuste fino sobre LIBERO-10 para que el modelo prediga acciones de brazo a partir de demostraciones, usando el checkpoint base como inicialización y FSDP2 sobre 8 GPU de 80 GB.
- Modelado del mundo para planificación: emplear la predicción de fotogramas futuros para simular el resultado de una acción antes de ejecutarla, lo que permite filtrar trayectorias inseguras en entornos de manipulación.
- Investigación en políticas viso-lenguaje-acción: comparar enfoques reactivos (ACT, difusión de políticas) frente a políticas con predicción de vídeo usando el mismo dataset y el mismo framework LeRobot.
- Evaluación de generalización en benchmarks robóticos: reentrenar sobre DROID o LIBERO y medir la transferencia entre configuraciones de cámara y brazos.
- Prototipado de asistentes físicos con instrucciones en lenguaje natural: el modelo acepta comandos textuales junto a la observación visual, lo que simplifica la interfaz de usuario en robots de servicio.
- Docencia y formación en IA física: el repo de 33 GB y las recetas de fine-tuning documentadas permiten montar prácticas reproducibles sobre GPU de centro de datos.
- Generación de datos sintéticos de vídeo para aumentar datasets de robótica antes de entrenar políticas más ligeras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: al menos 33 GB solo para pesos, más activaciones y latentes de vídeo; en la práctica, se recomienda una GPU de 80 GB para evaluación cómoda.
- Ajuste fino completo: FSDP2 sobre un mínimo de 4 GPU de 80 GB; la receta oficial usa 8 procesos.
- GPU recomendadas: A100 80 GB, H100 80 GB y, en general, aceleradores de centro de datos con 80 GB por dispositivo. No se documenta soporte en GPU de consumo.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en tarjetas de 48 GB sin cuantización agresiva, que no está documentada.
- Opciones de despliegue: LeRobot (`lerobot-train` con `--policy.type=cosmos3_nano`) y Accelerate con FSDP2. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3-Nano (esta ficha) | 16,5B (7,0B entrenables por defecto) | no disponible | Política VLA con modelo del mundo (Mixture-of-Transformers) | OpenMDW 1.1 | Hugging Face, formato LeRobot |
| Políticas ACT / difusión en LeRobot | típicamente decenas de millones a cientos de millones | no aplica | Políticas de imitación sin modelo del mundo | MIT/Apache según implementación | Hugging Face, LeRobot |
| Modelos VLA de código abierto de escala similar | no disponible | no disponible | VLA | variable | variable |

No se dispone de datos de benchmarks ni de especificaciones comparables suficientes para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es un checkpoint base para ajuste fino, no una política lista para producción: requiere entrenamiento sobre el dataset de la tarea concreta.
- El coste de ajuste fino es elevado: FSDP2 sobre al menos 4 GPU de 80 GB y 16.000 pasos en el ejemplo de LIBERO-10.
- No se documentan sesgos, tasas de alucinación ni comportamiento multilingüe, por lo que no pueden evaluarse a priori.
- La licencia OpenMDW 1.1 impone obligaciones de retención de avisos y del fichero NOTICE al redistribuir; conviene revisar los términos antes de uso comercial.
- El uso previsto y las limitaciones del modelo original se remiten a la model card de NVIDIA, que no se incluye aquí en detalle.
- La predicción de vídeo futuro puede generar trayectorias plausibles pero incorrectas físicamente; debe validarse en el robot real antes de desplegar.
- El tamaño del repo (33 GB) y la ausencia de cuantizaciones documentadas dificultan pruebas rápidas en hardware modesto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lerobot/Cosmos3-Nano
- Modelo original de NVIDIA: https://huggingface.co/nvidia/Cosmos3-Nano
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Documentación de Cosmos3 en LeRobot: https://huggingface.co/docs/lerobot/cosmos3
- Documentación general de LeRobot: https://huggingface.co/docs/lerobot/index
- Pull request de la política Cosmos3 en LeRobot: https://github.com/huggingface/lerobot/pull/5134
- Informe técnico (arXiv): https://arxiv.org/abs/2606.02800
- Informe técnico (PDF): https://research.nvidia.com/labs/cosmos-lab/cosmos3/technical-report.pdf
- Checkpoint ajustado LIBERO: https://huggingface.co/lerobot/Cosmos3-Nano-Policy-LIBERO
- Checkpoint ajustado LIBERO-10: https://huggingface.co/lerobot/Cosmos3-Nano-Policy-LIBERO_10
- Dataset LIBERO-Cosmos3: https://huggingface.co/datasets/lerobot/LIBERO-Cosmos3
- Dataset LIBERO_10-Cosmos3: https://huggingface.co/datasets/lerobot/LIBERO_10-Cosmos3
