# lerobot/Cosmos3-Edge

## Resumen

Cosmos3-Edge es un modelo de política robótica (vision-language-action, VLA) desarrollado por NVIDIA y redistribuido en formato LeRobot por el equipo de Hugging Face. Parte del checkpoint base `nvidia/Cosmos3-Edge` y está pensado como punto de arranque para fine-tuning como política de robot: recibe imágenes de cámara y una instrucción en lenguaje natural, y predice conjuntamente los fotogramas de vídeo futuros y el siguiente bloque de acciones motrices. Emplea una arquitectura Mixture-of-Transformers con un transformer denso de 2B parámetros (28 capas, dimensión oculta 2048) y un tokenizador de vídeo basado en el VAE de Wan2.2.

El modelo totaliza 4.563.688.396 parámetros (4,6B), de los cuales 1.423.383.232 (1,4B) se entrenan por defecto, lo que reduce el coste de adaptación a un dominio robótico concreto. Los pesos se distribuyen en bfloat16 (con el embedding de timestep en float32). Es relevante porque combina predicción de vídeo futuro y generación de acciones en un único backbone, una formulación de "world model" aplicada a IA física, y porque el ecosistema LeRobot ya ofrece recetas de fine-tuning y checkpoints derivados para benchmarks como LIBERO.

La licencia es OpenMDW 1.1, lo que condiciona el uso comercial y la redistribución. El modelo está orientado a investigación y despliegue en robótica, no a tareas de texto general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Transformers (transformer denso de 2B, 28 capas, hidden size 2048) con tokenizador de vídeo Wan2.2 VAE |
| Parametros totales | 4.563.688.396 (4,6B) |
| Parametros activos | 1.423.383.232 (1,4B) entrenados por defecto |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; timestep embedding en float32) |
| Idiomas soportados | no disponible (instrucciones en lenguaje natural; idiomas no declarados) |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

Cosmos3-Edge se basa en la arquitectura Mixture-of-Transformers descrita en el informe técnico de Cosmos 3 (arXiv:2606.02800). El diseño separa dos rutas que comparten atención: una ruta de comprensión que procesa el prompt de texto y una ruta de generación que procesa los latentes de vídeo y las acciones. El backbone es un transformer denso de 2B parámetros con 28 capas y dimensión oculta 2048, y el vídeo se tokeniza mediante el VAE de Wan2.2. La salida combina fotogramas futuros predichos y un bloque de acciones, lo que convierte al modelo en una política predictiva con componente de world model.

El checkpoint redistribuido en LeRobot está preparado para fine-tuning: por defecto solo se entrenan 1,4B de los 4,6B parámetros totales, y la receta oficial permite entrenamiento completo en una única GPU de 80 GB (unos 47 GB para 32 muestras por GPU con gradient checkpointing). El entrenamiento nativo incluye una fase de post-entrenamiento en la que los módulos de acción se inicializan desde cero (`load_action_modules=false`). No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Predicción de acciones robóticas a partir de imágenes de cámara e instrucciones en lenguaje natural (visión-lenguaje-acción).
- Predicción de fotogramas de vídeo futuros junto con el siguiente bloque de acciones (world model).
- Comprensión de instrucciones en lenguaje natural para condicionar la política.
- Soporte de múltiples cámaras, dimensiones de acción y frecuencias de fotogramas definidas por el dataset de entrenamiento.
- Fine-tuning completo o parcial sobre datasets robóticos (LIBERO, DROID, entre otros).
- Capacidad de operar con precisión mixta bf16 en inferencia y float32 en entrenamiento.
- No se documentan en la información disponible capacidades de tool calling, agentes multi-paso, audio ni thinking mode.

## Casos de uso

- Manipulación robótica en laboratorio: fine-tuning sobre LIBERO-10 para evaluar políticas de manipulación con instrucciones en lenguaje natural, aprovechando la receta oficial con 16.000 pasos y batch de 32.
- Investigación en world models: usar la predicción de vídeo futuro para estudiar la planificación implícita del modelo y su correlación con las acciones generadas.
- Adaptación a dominios concretos: partir del checkpoint base y entrenar solo los 1,4B parámetros por defecto para reducir coste computacional en una única GPU de 80 GB.
- Benchmarking reproducible: comparar políticas VLA sobre los checkpoints derivados `Cosmos3-Edge-Policy-LIBERO` y `Cosmos3-Edge-Policy-LIBERO_10`.
- Prototipado de políticas multi-cámara: el modelo toma las cámaras, dimensiones de acción y frecuencia del dataset, lo que facilita experimentar con configuraciones de sensores distintas.
- Despliegue en robótica de investigación con datasets tipo DROID: fine-tuning sobre datos reales de robot para tareas de manipulación generalista.
- Evaluación de precisión mixta: usar `--policy.dtype=bfloat16` en inferencia para medir el impacto en latencia y calidad frente a float32.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4,6B parámetros en bfloat16 los pesos ocupan aproximadamente 9,2 GB (tamaño del repo), más memoria para latentes de vídeo y activaciones.
- Fine-tuning completo: una GPU de 80 GB (por ejemplo A100 80 GB o H100 80 GB), con unos 47 GB para 32 muestras por GPU usando gradient checkpointing.
- GPU consumer: no se documenta soporte en GPUs consumer; el entrenamiento completo no cabe en una RTX 4090 (24 GB) según los requisitos indicados.
- Opciones de despliegue: LeRobot con extras `cosmos3` y `training` (`pip install -e ".[cosmos3,training]"`); no se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3-Edge (este) | 4,6B (1,4B entrenables) | no disponible | VLA / world model robótico | OpenMDW 1.1 | Hugging Face (lerobot) |
| Cosmos3-Edge-Policy-LIBERO | no disponible | no disponible | Política fine-tuned LIBERO | OpenMDW 1.1 | Hugging Face (lerobot) |
| Cosmos3-Edge-Policy-LIBERO_10 | no disponible | no disponible | Política fine-tuned LIBERO-10 | OpenMDW 1.1 | Hugging Face (lerobot) |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas externas en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en robótica: no está pensado para generación de texto general ni para tareas fuera del dominio visión-lenguaje-acción.
- Idiomas soportados no declarados: no hay garantía de comportamiento multilingüe en las instrucciones.
- Longitud de contexto no disponible: se desconoce el límite de tokens de texto y de fotogramas de vídeo.
- Riesgo de alucinación en la predicción de vídeo futuro y de acciones: la calidad depende en gran medida del dataset de fine-tuning.
- Licencia OpenMDW 1.1: es necesario conservar la licencia y los avisos del fichero NOTICE al redistribuir; revisar las condiciones para uso comercial antes de desplegar en producción.
- Requisitos de hardware elevados para entrenamiento completo (GPU de 80 GB).
- El checkpoint base no incluye módulos de acción entrenados por defecto (`load_action_modules=false`), por lo que requiere fine-tuning antes de su uso como política.
- No se documentan sesgos conocidos en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lerobot/Cosmos3-Edge
- Modelo original de NVIDIA: https://huggingface.co/nvidia/Cosmos3-Edge
- Informe técnico de Cosmos 3: https://arxiv.org/abs/2606.02800
- Documentación de Cosmos3 en LeRobot: https://huggingface.co/docs/lerobot/cosmos3
- Pull request de LeRobot con la política Cosmos3: https://github.com/huggingface/lerobot/pull/5134
- Checkpoint fine-tuned LIBERO: https://huggingface.co/lerobot/Cosmos3-Edge-Policy-LIBERO
- Checkpoint fine-tuned LIBERO-10: https://huggingface.co/lerobot/Cosmos3-Edge-Policy-LIBERO_10
- Dataset LIBERO-Cosmos3: https://huggingface.co/datasets/lerobot/LIBERO-Cosmos3
- Dataset LIBERO_10-Cosmos3: https://huggingface.co/datasets/lerobot/LIBERO_10-Cosmos3
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
