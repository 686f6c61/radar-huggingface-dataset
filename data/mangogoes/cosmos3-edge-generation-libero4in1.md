# MangoGoes/Cosmos3-edge-generation-libero4in1

## Resumen

Cosmos3-edge-generation-libero4in1 es un checkpoint de fine-tuning supervisado (SFT) de la política de acción Cosmos3-Edge Policy de NVIDIA, especializado en el benchmark de robótica LIBERO 4in1. El modelo ha sido entrenado por el usuario MangoGoes sobre el backbone pre-entrenado Cosmos3-Edge Policy DROID, que combina el modelo omni-modal OmniMoT con el tokenizador latente Wan2.2-VAE y un razonador Nemotron-3 de 3B parámetros (3.4B en total con la cabeza de lenguaje). El objetivo es la generación de acciones robóticas mediante flujo rectificado (rectified flow), un enfoque de aprendizaje por imitación que convierte observaciones visuales y de estado en comandos de acción para brazos robóticos.

El repositorio publica dos snapshots de entrenamiento en formato Megatron-Core Distributed Checkpoint (DCP), correspondientes a las iteraciones 2000 y 2800, junto con la configuración de entrenamiento resuelta y la curva de pérdida actualizada. El modelo está pensado para investigadores y desarrolladores que trabajan en aprendizaje por imitación para robótica y necesitan evaluar políticas de acción pre-entrenadas sobre LIBERO sin reproducir el costoso entrenamiento desde cero. La relevancia actual radica en que LIBERO es uno de los benchmarks estándar para políticas de manipulación robótica, y este checkpoint ofrece una alternativa fine-tuned que puede servir como punto de partida para experimentos posteriores o para inferencia directa en entornos simulados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OmniMoTModel (backbone) + Wan2.2 VAE (tokenizador latente) + Nemotron-3 Dense VL MoT 3B (razonador, ~3.4B total con lm_head) |
| Parametros totales | ~3.4B (3B backbone + lm_head) |
| Parametros activos | no disponible (no es un MoE declarado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenado en bfloat16, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (el modelo procesa instrucciones en texto, pero no se especifican idiomas) |
| Licencia | no disponible |
| Formato de pesos | Megatron-Core Distributed Checkpoint (DCP) con shards `__0_0.distcp` y `.metadata` |

## Arquitectura y entrenamiento

El modelo se construye sobre el backbone Cosmos3-Edge Policy, que integra tres componentes principales: el modelo OmniMoT (`cosmos_framework.model.generator.omni_mot_model`) como backbone generativo, el tokenizador latente Wan2.2 VAE (`Wan2.2_VAE.pth`) para codificar los frames de video de entrada, y el LLM razonador `nvidia/Cosmos3-Edge-Reasoner` (Nemotron-3 Dense VL MoT, 3B de backbone más lm_head, total ~3.4B). La cabeza de acción añade un embed de modalidad de acción y dos MLPs de proyección (`action2llm` y `llm2action`) que se entrenan con un multiplicador de learning rate ×5. La generación de acciones sigue un esquema de flujo rectificado con timestep logitnormal y tabla de shift en entrenamiento, todo en precisión bfloat16 y con distribución FSDP.

El entrenamiento SFT se realizó sobre el dataset LIBERO 4in1, que combina las cuatro suites (`libero_spatial`, `libero_object`, `libero_goal`, `libero_10`) con aproximadamente 1700 episodios en total. Las observaciones se pre-codificaron con Wan2.2-VAE a 256×256 píxeles y 20 FPS, almacenadas en una caché latente compartida. La representación de acciones es `frame_wise_relative` con rotación en 6D y normalización `quantile_rot`, con dimensión 10. El optimizador es FusedAdam (betas 0.9/0.99, wd 0.05) con learning rate 5e-5, scheduler LambdaLinear con 200 pasos de warm-up y ciclo coseno de 16000 pasos, batch efectivo de 2048 (16 grad-accum × 128 muestras) y 5000 iteraciones máximas. El entrenamiento reanudó desde el checkpoint `iter_000000450` del backbone DROID pre-entrenado.

## Capacidades

- Generación de acciones robóticas para manipulación: el modelo produce comandos de acción (posición, rotación 6D, etc.) a partir de observaciones visuales y una instrucción en texto.
- Aprendizaje por imitación (imitation learning): el SFT con rectified flow permite clonar comportamientos de demostraciones humanas en el benchmark LIBERO.
- Procesamiento de video latente: utiliza el VAE de Wan2.2 para codificar secuencias de video a 20 FPS en un espacio latente compacto, lo que permite manejar observaciones multi-frame.
- Razonamiento multimodal: al integrar un LLM Nemotron-3 de 3B, el modelo puede interpretar instrucciones textuales y vincularlas con la entrada visual para decidir la siguiente acción.
- Fine-tuning específico de dominio: los checkpoints están ajustados para las tareas de LIBERO (spatial, object, goal y long-horizon), lo que los hace directamente evaluables en ese benchmark.
- Inferencia con servidor dedicado: se proporciona un script de servidor (`scripts/action_policy_server_libero.py`) para desplegar el modelo en modo inferencia con argumentos como `--no-use-ema-weights` y `--checkpoint-path`.

## Casos de uso

- Evaluación de políticas de manipulación en LIBERO: el caso más directo es cargar los checkpoints y evaluar el rendimiento en las cuatro suites de LIBERO, comparando contra la política base DROID o contra otros fine-tunes. El modelo ya está pre-entrenado para este benchmark, por lo que se puede usar como línea base en experimentos de aprendizaje por refuerzo o de aprendizaje por imitación.
- Punto de partida para fine-tuning adicional: dado que el repo incluye el estado del optimizador y del scheduler en los checkpoints DCP, se puede reanudar el entrenamiento desde la iteración 2000 o 2800 para adaptar el modelo a un nuevo conjunto de tareas robóticas, manteniendo el conocimiento adquirido en LIBERO.
- Investigación en aprendizaje por imitación con flujos rectificados: el modelo sirve como referencia para estudiar el efecto del objetivo de flujo rectificado (rectified flow) en la generación de acciones robóticas, con una pérdida de acción ponderada a 10.0 y un batch efectivo de 2048.
- Desarrollo de servidores de inferencia robótica: el script `launch_action_server_libero_edge_all.sh` permite desplegar el modelo como un servicio de inferencia que recibe observaciones y devuelve acciones, útil para integrarlo en un bucle de control simulado o en un entorno de prueba.
- Comparación de arquitecturas de políticas: al estar basado en Cosmos3-Edge, se puede comparar contra políticas alternativas (por ejemplo, basadas en diffusion policy o en transformers de acción) en términos de precisión de acción y latencia en LIBERO.
- Generación de datos sintéticos para entrenamiento de robots: aunque no está documentado explícitamente, la capacidad de generar acciones a partir de observaciones puede usarse para crear trayectorias de demostración sintéticas que complementen los datos reales de LIBERO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de éxito de LIBERO (por ejemplo, tasa de éxito por suite), ni comparaciones con otras políticas. La única evidencia de rendimiento es la curva de pérdida de entrenamiento (`flow_matching_loss_action` + `flow_matching_loss_vision`) que se adjunta como imagen en el repositorio, pero no se proporcionan valores numéricos concretos.

## Requisitos de hardware

- El modelo tiene ~3.4B parámetros en bfloat16, lo que requiere aproximadamente 6.8 GB de VRAM solo para los pesos en fp16/bf16, más los estados de optimizador si se reanuda el entrenamiento (el checkpoint incluye optim y scheduler, lo que aumenta significativamente el consumo).
- Para inferencia, una GPU con al menos 8-12 GB de VRAM debería ser suficiente para el modelo en bfloat16, pero el uso del VAE Wan2.2 y la ventana de video de 20 FPS a 256×256 añade carga adicional de memoria y cómputo.
- GPU recomendadas: RTX 3090/4090 (24 GB) para inferencia con margen; para entrenamiento o reanudación, una GPU con 40 GB o más (A100, H100) o varias GPUs con FSDP, dado que el batch efectivo es 2048 y el entrenamiento usa grad-accum.
- El checkpoint DCP está diseñado para cargarse con Megatron-Core DistributedCheckpointer y soporta FSDP; el ejemplo de carga single-rank funciona, pero la arquitectura está pensada para entrenamiento distribuido.
- Opciones de despliegue: el script de servidor `scripts/action_policy_server_libero.py` es la vía principal; no se documentan integraciones con vLLM, llama.cpp o Ollama, ya que es un modelo de robótica con pipeline propio.
- Latencia y throughput: no disponibles. Depende de la GPU, el número de pasos de difusión (NUM_STEPS=30 en el ejemplo) y el guidance (GUIDANCE=1.0).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Especialidad |
|---|---|---|---|---|---|
| Cosmos3-Edge Policy DROID (nvidia/Cosmos-Reason1-Edge) | ~3.4B | no disponible | no disponible | HuggingFace | Política base pre-entrenada en DROID, sobre la que se hace SFT |
| Cosmos3-Nano-Policy-DROID | 16B | no disponible | no disponible | HuggingFace (colección nvidia/cosmos3) | Variante Nano de política DROID |
| Cosmos3-Super-Policy | 64B | no disponible | no disponible | HuggingFace (colección nvidia/cosmos3) | Variante Super de política DROID |
| MangoGoes/Cosmos3-edge-generation-libero4in1 | ~3.4B | no disponible | no disponible | HuggingFace | Fine-tuning específico para LIBERO 4in1 |

No hay datos públicos de benchmarks para comparar rendimiento entre estas variantes. La comparativa se limita a tamaño y disponibilidad, ya que no se publican métricas de éxito en LIBERO para ninguna de ellas en la información disponible.

## Limitaciones y advertencias

- Licencia no especificada: la model card no declara licencia, lo que impide conocer si se permite uso comercial o restricciones de redistribución. Se debe contactar con el autor o revisar el repositorio fuente de NVIDIA antes de usar en producción.
- Sesgos de datos de LIBERO: el modelo se entrena solo con los datos de LIBERO 4in1 (1700 episodios), que son simulaciones con objetos y escenarios limitados. No generaliza a entornos reales o a otras tareas fuera de la distribución de LIBERO sin fine-tuning adicional.
- Riesgo de alucinación en acciones: como modelo generativo de acciones, puede producir acciones no válidas o inconsistentes con la física del entorno, especialmente si las observaciones difieren de las de entrenamiento.
- Limitación de contexto visual: la entrada es una ventana de video de 20 FPS a 256×256, lo que limita la resolución espacial y temporal de las observaciones; no está diseñado para alta fidelidad visual ni para secuencias muy largas.
- Formato de checkpoint propietario: los checkpoints DCP requieren el framework `cosmos_framework` de NVIDIA y no son directamente cargables con librerías estándar como Transformers o Diffusers; la integración en otros pipelines requiere adaptación.
- Sin soporte de cuantización publicado: no se ofrecen versiones GGUF o cuantizadas, por lo que la inferencia en edge hardware (que es el objetivo de Cosmos3-Edge) requerirá trabajo adicional de conversión.
- El modelo es un checkpoint intermedio de entrenamiento (iteraciones 2000 y 2800 de 5000 máximas), por lo que puede no haber convergido completamente; el entrenamiento se puede reanudar para mejorar el rendimiento.
- Dependencia de cachés latentes: para reentrenar o reproducir, se necesita el dataset pre-codificado con Wan2.2-VAE (53.19 GB en HuggingFace), lo que añade una dependencia externa.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/MangoGoes/Cosmos3-edge-generation-libero4in1
- Dataset de caché latente Wan2.2-VAE: https://huggingface.co/datasets/MangoGoes/libero4in1_wan2.2vae_latent_dataset
- Dataset LIBERO original: https://huggingface.co/datasets/Lifelong-Robot-Learning/LIBERO
- Backbone Cosmos3-Edge Policy (nvidia/Cosmos-Reason1-Edge): https://huggingface.co/nvidia/Cosmos-Reason1-Edge
- Colección Cosmos3 de NVIDIA en HuggingFace: https://huggingface.co/collections/nvidia/cosmos3
- Página del proyecto Cosmos 3 (NVIDIA Research): https://research.nvidia.com/labs/cosmos-lab/cosmos3/
- Repositorio de NVIDIA Cosmos en GitHub (cookbooks/cosmos3): https://github.com/NVIDIA/cosmos/tree/main/cookbooks/cosmos3
- Documentación de referencia de modelos Cosmos 3: https://docs.nvidia.com/cosmos/latest/cosmos3/model_reference.html
