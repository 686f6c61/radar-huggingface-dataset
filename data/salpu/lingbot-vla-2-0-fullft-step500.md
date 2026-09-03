# salpu/lingbot-vla-2.0-fullft-step500

## Resumen

LingBot-VLA 2.0 (fullft step 500) es un modelo de vision-lenguaje-accion (VLA) para robotica, desarrollado por el autor "salpu" como parte de la competicion de simulacion 2 del subnet 80 de Bittensor (OpenRoboto). Se trata de un fine-tuning completo (sin capas congeladas) del checkpoint base `openroboto-ai/lingbot-vla-v2-6b-libero`, entrenado sobre el dataset LIBERO de LeRobot (1693 episodios, 273465 frames). El modelo cuenta con aproximadamente 6,38 mil millones de parametros y emplea una arquitectura de mezcla de expertos (MoE) con 32 expertos y seleccion top-4, sobre la base del procesador Qwen3-VL-4B-Instruct.

La relevancia de este checkpoint reside en su caracter de experimento de fine-tuning completo: el autor documenta la deriva de pesos respecto al base (2,431 % en L2 relativa al paso 500) y advierte explicitamente de que no ha sido evaluado en LIBERO, por lo que su tasa de exito real es desconocida. Es un modelo de investigacion, no un artefacto listo para produccion, y su publicacion forma parte de un ecosistema de competicion descentralizada de robotica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA MoE (32 expertos, top-4) sobre Qwen3-VL-4B-Instruct |
| Parametros totales | 6.375.907.511 (~6,38 B) |
| Parametros activos | no disponible (MoE 32 expertos, top-4) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors, entrenado en bf16) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un VLA (Vision-Language-Action) que combina un codificador visual-lenguaje basado en Qwen3-VL-4B-Instruct con un modulo de mezcla de expertos (32 expertos, seleccion top-4). El entrenamiento se realizo como fine-tuning completo (sin capas congeladas) partiendo del checkpoint de OpenRoboto LIBERO (paso 6000 del base). Se emplearon 2x NVIDIA H100 PCIe 80GB con FSDP2 full-shard, precision bf16 con pesos maestros fp32, optimizador muon con tasa de aprendizaje 5e-5 en decaimiento coseno hasta 5e-6 y warmup del 2 %. El batch global fue de 64 (micro 8 x grad-accum 4 x 2 GPUs). Se activaron perdidas de alineacion de profundidad y video (profesores MoGe, MDM y DINO-video). El entrenamiento completo de 1500 pasos tardo 5 horas y 13 minutos (12,55 s/paso), con una perdida que descendio de 0,1544 a aproximadamente 0,085.

## Capacidades

- Generacion de acciones de robot (posiciones de articulaciones o poses del efector) a partir de instrucciones en lenguaje natural y observaciones visuales.
- Razonamiento visual-lenguaje gracias a la base Qwen3-VL-4B-Instruct.
- Ejecucion de tareas de manipulacion en simulacion LIBERO (recoger, colocar, abrir, etc.).
- Procesamiento de secuencias de video gracias a las perdidas de alineacion con profesores DINO-video y MDM.
- No se documentan capacidades de tool calling, agentes, modo thinking ni soporte multimodal adicional en la informacion disponible.

## Casos de uso

- Investigacion en robotica manipulativa: el modelo puede usarse como punto de partida para estudiar el efecto del fine-tuning completo en VLAs, comparando la deriva de pesos y el rendimiento en LIBERO.
- Evaluacion de politicas de robot en simulacion: permite probar pipelines de inferencia VLA en entornos LIBERO con el stack de OpenRoboto, aunque el autor no ha publicado resultados de evaluacion.
- Desarrollo de competiciones de robotica descentralizada: al estar integrado en el subnet 80 de Bittensor, sirve como candidato en competiciones de simulacion.
- Estudio de la dinamica de entrenamiento MoE: los datos de deriva de pesos (saturacion entre pasos 1000 y 1500) son utiles para investigar la convergencia de expertos y el sobreajuste en fine-tuning completo.
- Benchmarking de infraestructura de entrenamiento: el registro de 12,55 s/paso en 2x H100 con FSDP2 y optimizador muon sirve como referencia para optimizar pipelines de fine-tuning VLA.
- Reproducibilidad de experimentos: al publicar el codigo de entrenamiento, la configuracion y los hashes de los datasets, permite replicar el fine-tuning completo sobre LIBERO y verificar la deriva de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el checkpoint no ha sido evaluado en LIBERO y que una perdida de entrenamiento decreciente no es evidencia de una mejor politica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el checkpoint pesa 24,3 GB (segun `openroboto check`), por lo que se requiere al menos 32 GB de VRAM para cargar los pesos completos en bf16.
- GPU recomendadas: H100 80GB, A100 80GB o RTX 4090/6000 Ada con 24 GB o mas (posiblemente con cuantizacion, no documentada).
- No cabe en GPUs de consumo de 8-16 GB sin cuantizacion, que no esta publicada.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el stack de OpenRoboto es la via principal de uso.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos para este checkpoint. Como referencia cualitativa, se enmarca en la familia de VLAs de ~7B:

| Modelo | Parametros | Licencia | Contexto | Evaluacion LIBERO |
|---|---|---|---|---|
| LingBot-VLA 2.0 (este) | 6,38 B | Apache 2.0 | no disponible | no evaluado |
| OpenVLA | 7 B | Apache 2.0 | no disponible | publicada por el autor |
| RT-2 (Google) | ~55 B | propietaria | no disponible | publicada por el autor |

Los datos de contexto y rendimiento de las alternativas no estan disponibles en la informacion proporcionada; la comparacion es solo estructural.

## Limitaciones y advertencias

- No ha sido evaluado en LIBERO: la tasa de exito real es desconocida.
- La perdida de entrenamiento decreciente no implica una mejor politica, como advierte el propio autor.
- Los pasos 1000 y 1500 son casi duplicados (deriva de pesos saturada), por lo que el paso 500 puede no representar el mejor punto de control.
- Deriva de pesos del 2,4 % respecto al base, lo que puede alterar el comportamiento del modelo original.
- No se documentan idiomas soportados ni longitudes de contexto.
- Sin cuantizaciones publicadas, lo que limita el despliegue en hardware de consumo.
- Modelo de investigacion, no validado para uso en robotica fisica real.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere una adopcion aun muy limitada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/salpu/lingbot-vla-2.0-fullft-step500
- Checkpoint base: https://huggingface.co/openroboto-ai/lingbot-vla-v2-6b-libero
- Codigo de entrenamiento: https://github.com/Robbyant/lingbot-vla-v2
- Dataset LIBERO: https://huggingface.co/datasets/lerobot/libero
- Procesador base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Metricas de entrenamiento (W&B): https://wandb.ai/atomyuri46-weights-biases/sn80-lingbot-fullft
