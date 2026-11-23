# lerobot/cosmos3-edge

## Resumen

Cosmos3-Edge es un modelo de política robótica (vision-language-action, VLA) desarrollado originalmente por NVIDIA y redistribuido por el equipo de LeRobot en formato nativo de la librería LeRobot. Se trata del checkpoint base de NVIDIA Cosmos3-Edge adaptado para su uso como política de robot: recibe imágenes de cámara y una instrucción en lenguaje natural, y predice conjuntamente los fotogramas de vídeo futuros y el siguiente bloque de acciones motrices. Su relevancia radica en que unifica generación de vídeo y predicción de acciones en un único backbone, lo que permite entrenar políticas robóticas con un objetivo de mundo (world model) en lugar de solo imitación directa.

El modelo emplea una arquitectura Mixture-of-Transformers: una vía de comprensión que procesa el prompt de texto y una vía de generación que procesa los latentes de vídeo y las acciones, ambas unidas mediante atención compartida. El backbone es un transformer denso de 2B parámetros con 28 capas y tamaño oculto de 2048, sobre el que se montan módulos de acción y un tokenizador de vídeo basado en el VAE de Wan2.2. El total de parámetros asciende a 4.563.688.396 (4,6B), de los cuales 1.423.383.232 (1,4B) se entrenan por defecto al hacer fine-tuning.

Es relevante ahora porque NVIDIA ha liberado la familia Cosmos 3 como modelos de mundo omnimodales para IA física, y LeRobot ofrece la integración práctica para fine-tuning sobre datasets como LIBERO o DROID con un único GPU de 80 GB. Esto baja la barrera para investigadores que quieran adaptar un modelo de mundo a su propio robot sin partir de cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Transformers (vía de comprensión + vía de generación con atención compartida); backbone transformer denso de 28 capas, hidden size 2048 |
| Parametros totales | 4.563.688.396 (4,6B) |
| Parametros activos | No aplica (no es MoE); 1.423.383.232 (1,4B) entrenables por defecto en fine-tuning |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en bfloat16, timestep embedding en float32) |
| Idiomas soportados | No disponible |
| Licencia | OpenMDW 1.1 (license_name: openmdw1.1-license) |
| Formato de pesos | safetensors (formato LeRobot) |

## Arquitectura y entrenamiento

La arquitectura es una Mixture-of-Transformers con dos vías diferenciadas que comparten atención. La vía de comprensión lee el prompt de texto; la vía de generación procesa los latentes de vídeo y las acciones. El backbone es un transformer denso de 2B parámetros con 28 capas y tamaño oculto 2048. El tokenizador de vídeo es el VAE de Wan2.2. Los pesos se almacenan en bfloat16, con el timestep embedding en float32, y el `config.json` mantiene `dtype: float32` para los pesos maestros durante el entrenamiento.

El modelo se distribuye como checkpoint base para fine-tuning como política robótica, no como modelo listo para inferencia directa. En el fine-tuning por defecto se entrenan 1,4B de los 4,6B parámetros totales; con `--policy.load_action_modules=false` los módulos de acción arrancan desde su inicialización, replicando el post-entrenamiento nativo de NVIDIA. El entrenamiento completo cabe en un único GPU de 80 GB (unos 47 GB con 32 muestras por GPU y gradient checkpointing). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO.

## Capacidades

- Predicción conjunta de fotogramas de vídeo futuros y del siguiente bloque de acciones (chunk) a partir de imágenes de cámara y una instrucción en lenguaje natural.
- Comprensión de instrucciones en lenguaje natural como condicionamiento de la política.
- Modelado de mundo: genera la evolución visual esperada de la escena, lo que aporta una señal de entrenamiento más rica que la imitación pura.
- Fine-tuning como política robótica sobre datasets en formato LeRobot (por ejemplo, LIBERO, LIBERO-10, DROID).
- Soporte de entrenamiento con precisión mixta bf16 y gradient checkpointing.
- Inferencia y evaluación en bfloat16.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): predicción de vídeo futuro (visión generativa); sin audio ni thinking mode documentados.

## Casos de uso

- Fine-tuning de políticas de manipulación sobre LIBERO-10: el modelo se entrena con `--policy.type=cosmos3_edge` y `--policy.pretrained_path=lerobot/Cosmos3-Edge` para obtener un checkpoint de política específico de la tarea, partiendo de un modelo de mundo preentrenado en lugar de una inicialización aleatoria.
- Investigación en world models para robótica: al predecir fotogramas futuros junto con las acciones, permite estudiar cómo la señal generativa de vídeo mejora la calidad de la política en entornos con contacto físico complejo.
- Adaptación a un robot propio con hardware de un solo nodo: el fine-tuning completo cabe en un GPU de 80 GB, lo que permite a un laboratorio con una sola A100/H100 adaptar el modelo a su plataforma sin clúster.
- Evaluación de políticas en simulación: los checkpoints derivados (por ejemplo, `lerobot/Cosmos3-Edge-Policy-LIBERO`) sirven como referencia para comparar recetas de entrenamiento sobre el mismo backbone.
- Prototipado de instrucciones en lenguaje natural para control de brazos manipuladores: el modelo acepta un prompt textual y lo traduce en una secuencia de acciones condicionada por la imagen de cámara.
- Reproducción de recetas de post-entrenamiento: con `--policy.load_action_modules=false` se puede replicar el procedimiento nativo de NVIDIA para validar resultados publicados.
- Integración en pipelines de LeRobot: al estar en formato nativo, se conecta con `lerobot-train` y los datasets `lerobot/LIBERO-Cosmos3` y `lerobot/LIBERO_10-Cosmos3` sin conversión adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint pesa 9,2 GB en el repositorio (bfloat16), por lo que la inferencia requiere al menos esa cantidad más overhead de activaciones.
- Fine-tuning completo: cabe en un único GPU de 80 GB (aproximadamente 47 GB con 32 muestras por GPU y gradient checkpointing).
- GPU recomendadas: A100 80 GB o H100 80 GB para fine-tuning completo.
- GPU de consumo: no se documenta que el fine-tuning quepa en GPU de consumo; para inferencia en bfloat16 el peso de 9,2 GB sugiere que podría caber en GPUs con 16-24 GB, aunque no se confirma en la información disponible.
- Opciones de despliegue: LeRobot (`lerobot-train`), con instalación `pip install -e ".[cosmos3,training]"` desde el PR huggingface/lerobot#5134. Otras opciones (vLLM, llama.cpp, Ollama, TGI) no están documentadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Cosmos3-Edge (LeRobot) | 4,6B (1,4B entrenables) | No disponible | OpenMDW 1.1 | Hugging Face (lerobot) | Formato LeRobot, fine-tuning en un GPU de 80 GB |
| nvidia/Cosmos3-Edge | No disponible | No disponible | OpenMDW 1.1 | Hugging Face (nvidia) | Checkpoint original de NVIDIA, mismo backbone |
| Cosmos3-Edge-Policy-LIBERO | No disponible | No disponible | OpenMDW 1.1 | Hugging Face (lerobot) | Checkpoint ya fine-tuneado sobre LIBERO |

No se dispone en la información proporcionada de datos de rendimiento de modelos alternativos de la misma categoría (VLA / world models para robótica), por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Es un checkpoint base, no un modelo listo para producción: requiere fine-tuning como política robótica antes de su uso operativo.
- No se documentan sesgos conocidos; al ser un modelo de robótica condicionado por imágenes y texto, puede heredar sesgos de los datasets de entrenamiento de NVIDIA, no detallados en la información disponible.
- Riesgo de alucinación: no cuantificado; la predicción de vídeo futuro puede generar fotogramas plausibles pero incorrectos, lo que afecta a la señal de entrenamiento.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están disponibles.
- Licencia OpenMDW 1.1: es una licencia "other" que exige conservar la licencia y los avisos del fichero NOTICE al redistribuir los materiales; conviene revisar los términos completos antes de uso comercial.
- El uso previsto y las limitaciones del modelo original se describen en la model card de NVIDIA, no en la de LeRobot.
- Los requisitos de hardware para inferencia y despliegue en producción no están documentados.

## Enlaces

- Hugging Face (LeRobot): https://huggingface.co/lerobot/cosmos3-edge
- Modelo original de NVIDIA: https://huggingface.co/nvidia/Cosmos3-Edge
- Documentación de Cosmos3 en LeRobot: https://huggingface.co/docs/lerobot/cosmos3
- PR de integración en LeRobot: https://github.com/huggingface/lerobot/pull/5134
- Checkpoint fine-tuneado LIBERO: https://huggingface.co/lerobot/Cosmos3-Edge-Policy-LIBERO
- Checkpoint fine-tuneado LIBERO-10: https://huggingface.co/lerobot/Cosmos3-Edge-Policy-LIBERO_10
- Dataset LIBERO-Cosmos3: https://huggingface.co/datasets/lerobot/LIBERO-Cosmos3
- Dataset LIBERO_10-Cosmos3: https://huggingface.co/datasets/lerobot/LIBERO_10-Cosmos3
- Informe técnico (arXiv): https://arxiv.org/abs/2606.02800
- Informe técnico (PDF NVIDIA): https://research.nvidia.com/labs/cosmos-lab/cosmos3/technical-report.pdf
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
