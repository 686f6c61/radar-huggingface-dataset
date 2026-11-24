# lerobot/cosmos3-nano

## Resumen

Cosmos3-Nano es un modelo fundacional de NVIDIA para IA física, publicado originalmente en el repositorio `nvidia/Cosmos3-Nano` y redistribuido aquí por el equipo de LeRobot en formato compatible con la librería LeRobot. Se trata de un checkpoint base pensado para ajuste fino como política robótica: recibe imágenes de cámara y una instrucción en lenguaje natural, y predice tanto los fotogramas futuros de vídeo como el siguiente bloque de acciones motrices. Es, por tanto, un modelo de mundo omnímodal orientado a control de robots, no un LLM conversacional al uso.

La arquitectura es un Mixture-of-Transformers derivado de Qwen3-VL, con 36 capas y dimensión oculta de 4096. El modelo combina una vía de comprensión (que procesa el prompt de texto) y una vía de generación (que procesa los latentes de vídeo y las acciones), unidas mediante atención compartida. El tokenizador de vídeo es el VAE de Wan2.2. El total de parámetros asciende a 16.454.213.580 (16,5B), de los cuales 6.982.401.216 (7,0B) se entrenan por defecto en el ajuste fino.

Su relevancia actual radica en que ofrece un pipeline abierto (licencia OpenMDW 1.1) para entrenar políticas robóticas con predicción de vídeo futuro, una línea de investigación activa en IA física. La integración con LeRobot facilita el ajuste fino sobre datasets como LIBERO y DROID, y existen ya checkpoints derivados publicados por el propio equipo de LeRobot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Transformers (derivada de Qwen3-VL), 36 capas, hidden size 4096 |
| Parámetros totales | 16.454.213.580 (16,5B) |
| Parámetros activos | no disponible (no es MoE clásico; 7,0B entrenables por defecto) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16, timestep embedding en float32) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | safetensors (repo de 33,0 GB) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Mixture-of-Transformers con dos vías diferenciadas que comparten atención: una vía de comprensión que lee el prompt textual y una vía de generación que procesa los latentes de vídeo y las acciones. El backbone deriva de Qwen3-VL con 36 capas y dimensión oculta 4096, y el tokenizador de vídeo es el VAE de Wan2.2. Los pesos se distribuyen en bfloat16, con la excepción del timestep embedding en float32.

El checkpoint es un modelo base para post-entrenamiento como política robótica: la receta nativa de NVIDIA inicializa los módulos de acción desde cero (`load_action_modules=false`) y ajusta el modelo sobre datos de demostración. En LeRobot, el ajuste fino completo utiliza FSDP2 sobre al menos 4 GPU de 80 GB, con gradient checkpointing y precisión mixta bfloat16. No se detalla en la información disponible el volumen de tokens de entrenamiento ni la composición exacta del dataset original, aunque el informe técnico de Cosmos 3 (arXiv:2606.02800) es la referencia para esos detalles.

## Capacidades

- Predicción de fotogramas futuros de vídeo a partir de observaciones de cámara y una instrucción en lenguaje natural.
- Predicción de bloques de acciones motrices (chunks) para control de robots manipuladores.
- Comprensión de instrucciones en lenguaje natural como condicionamiento de la política.
- Procesamiento multimodal: entrada conjunta de imágenes de cámara y texto.
- Modelo de mundo: genera rollouts visuales que pueden usarse para planificación o evaluación.
- Ajuste fino como política robótica sobre datasets de demostración (LIBERO, DROID).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no disponible como tal; la política opera por chunks de acción.
- Capacidades multilingües: no disponibles (no se documentan idiomas).

## Casos de uso

- Ajuste fino de políticas de manipulación en simulación: usar el checkpoint base con el dataset `lerobot/LIBERO_10-Cosmos3` para entrenar una política que ejecute tareas de manipulación en el benchmark LIBERO-10, aprovechando la predicción de vídeo futuro como señal auxiliar.
- Manipulación robótica en entornos reales con DROID: la documentación de LeRobot incluye recetas de ajuste fino sobre DROID, lo que permite adaptar el modelo a un robot físico con cámaras reales e instrucciones en lenguaje natural.
- Investigación en modelos de mundo: el modelo puede generar rollouts visuales condicionados por acciones, útiles para estudiar la dinámica aprendida y evaluar la coherencia de las predicciones antes de desplegar en hardware.
- Evaluación comparativa de políticas: al ser un checkpoint base abierto, sirve como referencia para comparar arquitecturas de política robótica en tareas estandarizadas como LIBERO.
- Prototipado de control por lenguaje natural: permite construir demos en las que un operador describe la tarea en texto y el modelo genera el bloque de acciones correspondiente, sin ingeniería de control manual.
- Investigación académica en IA física: la licencia OpenMDW 1.1 y la integración con LeRobot facilitan reproducir experimentos y publicar checkpoints derivados, como ya han hecho los propios autores con `Cosmos3-Nano-Policy-LIBERO`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 16,5B parámetros en bfloat16 los pesos ocupan aproximadamente 33 GB, por lo que se necesita al menos una GPU de 40 GB para inferencia sin cuantización.
- Ajuste fino completo: FSDP2 sobre al menos 4 GPU de 80 GB (por ejemplo A100 80 GB o H100 80 GB), con gradient checkpointing y precisión mixta bfloat16.
- GPU consumer: no cabe en GPU de consumo de 24 GB en bfloat16; no se documentan opciones de cuantización para reducir requisitos.
- Opciones de despliegue: LeRobot (`lerobot-train` con `policy.type=cosmos3_nano`), aceleración con `accelerate` y FSDP2. No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Cosmos3-Nano (este) | 16,5B (7,0B entrenables) | no disponible | OpenMDW 1.1 | Hugging Face, formato LeRobot |
| Cosmos3-Nano (original NVIDIA) | 16,5B | no disponible | OpenMDW 1.1 | Hugging Face (`nvidia/Cosmos3-Nano`) |
| Cosmos3-Nano-Policy-LIBERO | no disponible | no disponible | OpenMDW 1.1 | Hugging Face (checkpoint ajustado) |
| Cosmos3-Nano-Policy-LIBERO_10 | no disponible | no disponible | OpenMDW 1.1 | Hugging Face (checkpoint ajustado) |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint base, no una política lista para producción: requiere ajuste fino sobre datos propios antes de su uso real.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado con datos de vídeo y texto, puede heredar sesgos de esas fuentes.
- Riesgo de alucinación visual: la predicción de fotogramas futuros puede divergir de la dinámica real del entorno, especialmente fuera de la distribución de entrenamiento.
- Limitaciones de contexto e idioma: no disponibles; no se especifican idiomas soportados ni longitud de contexto.
- Restricciones de licencia: OpenMDW 1.1 exige conservar la licencia y los avisos del fichero NOTICE al redistribuir los materiales; conviene revisar los términos completos antes de uso comercial.
- Requisitos de hardware elevados: el ajuste fino completo exige al menos 4 GPU de 80 GB, lo que limita su uso a entornos con infraestructura considerable.
- La model card original de NVIDIA describe el uso previsto y las limitaciones del modelo base; se recomienda consultarla antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lerobot/cosmos3-nano
- Modelo original de NVIDIA: https://huggingface.co/nvidia/Cosmos3-Nano
- Informe técnico de Cosmos 3: https://arxiv.org/abs/2606.02800
- Informe técnico (PDF): https://research.nvidia.com/labs/cosmos-lab/cosmos3/technical-report.pdf
- Documentación de Cosmos3 en LeRobot: https://huggingface.co/docs/lerobot/cosmos3
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Pull request de integración de la política Cosmos3: https://github.com/huggingface/lerobot/pull/5134
- Checkpoint ajustado LIBERO: https://huggingface.co/lerobot/Cosmos3-Nano-Policy-LIBERO
- Checkpoint ajustado LIBERO_10: https://huggingface.co/lerobot/Cosmos3-Nano-Policy-LIBERO_10
- Dataset LIBERO-Cosmos3: https://huggingface.co/datasets/lerobot/LIBERO-Cosmos3
- Dataset LIBERO_10-Cosmos3: https://huggingface.co/datasets/lerobot/LIBERO_10-Cosmos3
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
