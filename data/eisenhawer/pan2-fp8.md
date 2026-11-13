# Eisenhawer/PAN2-FP8

## Resumen

PAN2-FP8 es una cuantización comunitaria en FP8 del modelo de mundo PAN 2, desarrollado por el Institute of Foundation Models (IFM) de la Universidad Mohamed bin Zayed de Inteligencia Artificial (MBZUAI). Se trata de un diffusion transformer de 29.205.961.920 parámetros (aproximadamente 29B) orientado a la generación de vídeo a partir de texto e imagen (text-to-video e image-to-video), con capacidad declarada de modelado del estado del mundo. Esta conversión concreta, publicada por el usuario Eisenhawer, no está hecha ni respaldada por IFM ni por MBZUAI.

El problema que resuelve esta variante es práctico: el transformer original en BF16 ocupa 67,4 GB, lo que impide su despliegue en hardware de consumo. La cuantización reduce el transformer a 43,8 GB y, junto con una receta de servicio basada en vLLM-Omni que mantiene la modulación adaLN en RAM del host, permite ejecutar el modelo en 48 GB de VRAM repartidos en dos GPUs de 24 GB (por ejemplo, dos RTX 4090) o en una única GPU de 48 GB. Es relevante ahora porque acerca un modelo de mundo de casi 30B a estaciones de trabajo con GPUs consumer, un segmento tradicionalmente excluido de este tipo de modelos.

La arquitectura es un diffusion transformer con 528 bloques conjuntos de atención y FFN cuantizados, un text encoder Qwen3.5-9B y un VAE Wan 2.2. El contexto y los idiomas se limitan al inglés según la model card. La licencia es Apache 2.0, lo que facilita el uso comercial, aunque las limitaciones del modelo base siguen aplicando.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (world model) con 528 bloques conjuntos de atención y FFN; text encoder Qwen3.5-9B; VAE Wan 2.2 |
| Parametros totales | 29.205.961.920 (aproximadamente 29B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 E4M3 con una escala FP32 por canal de salida (ModelOpt FP8_PER_CHANNEL_PER_TOKEN); alternativa ConvRot INT8 sobre los pesos BF16 originales |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería diffusers); repositorio de 62,5 GB, transformer de 43,8 GB |

## Arquitectura y entrenamiento

El modelo base PAN 2 es un diffusion transformer concebido como world model: genera vídeo condicionado por texto o por imagen inicial, modelando implícitamente la evolución del estado del mundo en la escena. La pila completa incluye un text encoder Qwen3.5-9B, un VAE Wan 2.2 y el transformer de difusión, que concentra los 29B de parámetros. La model card de esta conversión no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; esos datos corresponden al modelo original IFM/PAN2 y no se reproducen aquí.

La innovación técnica de esta variante es la receta de servicio. Los 44 lineales de modulación adaLN (4,43B parámetros en FP32, 17,7 GB) se replican en cada GPU bajo paralelismo tensorial, pero su entrada depende únicamente del timestep; la rama `pan2-host-modulation` de vLLM-Omni calcula la tabla de modulación de cada paso (4,3 MB) en CPU desde el checkpoint mapeado en memoria y mantiene esos pesos fuera de las GPUs. El resultado es exacto: los latentes son idénticos bit a bit a la ruta original en modo eager. Además, la receta activa offload a CPU a nivel de modelo (text encoder y transformer se turnan en las GPUs), decodificación VAE por tiles y en paralelo de parches, y guardrails de seguridad en CPU. La conversión FP8 se realizó con un script CPU-only incluido en el repositorio.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con prompts estructurados en JSON de estado del mundo.
- Generación de vídeo a partir de una imagen inicial (image-to-video), incluyendo primer fotograma de referencia.
- Modelado de estado del mundo: el modelo está entrenado sobre captions estructurados que describen la escena y su evolución.
- Control de resolución y duración: la receta documenta clips de 121 fotogramas (5 s) y 241 fotogramas (10 s) a 704×1248 y 24 fps.
- Prompt negativo para guiar la generación.
- Safety checker integrado (ejecutable en CPU en la receta de 48 GB).
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código, visión general, audio ni modo thinking.

## Casos de uso

- Previsualización de vídeo en estaciones de trabajo con dos RTX 4090: la receta permite generar clips de 5 s a 704×1248 en unos 9,5 minutos con 19,4 GiB de pico por GPU, lo que habilita iterar sobre prompts sin depender de clústeres.
- Prototipado de image-to-video para equipos de producto: partiendo de un fotograma fijo (por ejemplo, un render de un inmueble o un producto), el modelo anima la escena y permite evaluar conceptos antes de invertir en producción con modelos mayores.
- Investigación en world models: el modelo genera secuencias condicionadas por captions de estado del mundo, útil para estudiar cómo un diffusion transformer representa la dinámica de una escena y comparar fidelidad entre FP8 y ConvRot INT8.
- Generación de material de demostración para documentación técnica: clips cortos de 5 s a 24 fps con resolución 704×1248 que ilustran conceptos sin requerir un estudio de animación.
- Evaluación de pipelines de serving con vLLM-Omni: la receta incluye perfiles para 2×24 GB, 1×48 GB y 2×48 GB, lo que sirve para medir throughput, latencia y consumo de memoria en configuraciones de paralelismo tensorial 2.
- Pruebas de cuantización en producción: el repositorio incluye el conversor CPU-only y un informe de fidelidad, de modo que un equipo puede reproducir la conversión FP8 y comparar contra la alternativa ConvRot INT8 antes de fijar un formato.
- Generación de vídeo en una única GPU de 48 GB (por ejemplo, A6000 o L40S) para equipos que no quieren gestionar paralelismo multi-GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos medidos son de rendimiento de inferencia en 2× RTX 4090 (24 GB, PCIe) con TP=2, a 704×1248, 24 fps, 50 pasos, CFG 2.5 y modo eager:

| Clip | Formato | Tiempo total | Denoising | Memoria pico por GPU |
|---|---|---|---|---|
| 5 s (121 fotogramas) | FP8 | 9,5 min | 8,4 min | 19,4 GiB |
| 5 s (121 fotogramas) | ConvRot INT8 | 9,5 min | 7,9 min | 19,4 GiB |
| 10 s (241 fotogramas) | FP8 | 28,9 min | 21,0 min | 22,9 GiB |
| 10 s (241 fotogramas) | ConvRot INT8 | 34,4 min | 20,1 min | 23,0 GiB |

A 480×832, 33 fotogramas y 8 pasos, ConvRot INT8 es aproximadamente un 30% más rápido que FP8 (35 s frente a 51 s), porque el rendimiento de tensor INT8 duplica al de FP8 en GeForce Ada. A 720p domina la atención y ambos formatos rinden de forma similar. Los clips de 20 s (481 fotogramas) a 720p no caben en 2×24 GB.

## Requisitos de hardware

- VRAM estimada: 48 GB en total para el perfil mínimo documentado (2×24 GB o 1×48 GB). El transformer FP8 ocupa 43,8 GB, de los cuales 17,7 GB son modulación FP32 que la receta mantiene en RAM del host; quedan unos 13 GB de pesos del transformer por GPU en la configuración de dos GPUs.
- GPUs recomendadas: 2× RTX 4090 (24 GB, probado), 1× GPU de 48 GB (perfil soportado por el script, no probado según la model card), 2× RTX 3090 (24 GB, Ampere; perfil no probado, misma memoria que 2×4090, pero sin tensor cores FP8, por lo que vLLM ejecuta el checkpoint como pesos FP8 con cómputo de 16 bits).
- Cabe en GPU consumer: sí, en 2× RTX 4090; no cabe en una sola GPU consumer de 24 GB.
- Opciones de despliegue: vLLM 0.33.0 con vLLM-Omni y la rama `Eisenh/vllm-omni@pan2-host-modulation`; el script `recipe/pan2_serve.sh` automatiza setup, serve y cliente, y autodetecta los perfiles 2×24 GB, 1×48 GB y 2×48 GB. La librería declarada es diffusers.
- Latencia y throughput: 9,5 min para un clip de 5 s a 704×1248 (50 pasos) y 28,9 min para 10 s en 2×4090; 51 s para 33 fotogramas a 480×832 con 8 pasos en FP8 (35 s con ConvRot INT8). La carga del repositorio de 59 GB tarda unos 85 s; la variante ConvRot descarga 86 GB y carga en unos 130 s. Por defecto, cualquier clip que supere los 10 minutos falla salvo que se ajusten los timeouts.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y memoria | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PAN2-FP8 (esta ficha) | 29,2B | No disponible | FP8, 43,8 GB de transformer; 48 GB de VRAM en 2×24 GB | Apache 2.0 | Hugging Face (comunidad) |
| IFM/PAN2 (BF16 original) | 29,2B | No disponible | BF16, 67,4 GB de transformer; 86 GB de repo | Apache 2.0 | Hugging Face (IFM) |
| PAN2 con ConvRot INT8 | 29,2B | No disponible | INT8 rotado sobre BF16, cuantización al cargar | Apache 2.0 | Mismo repo, perfil alternativo de la receta |

No se dispone en la información proporcionada de comparaciones con otros modelos de vídeo de tamaño similar (por ejemplo, familias Wan, HunyuanVideo o CogVideoX); esos datos no están disponibles.

## Limitaciones y advertencias

- Es una conversión comunitaria independiente: no está hecha ni respaldada por IFM ni por MBZUAI, y todas las limitaciones, usos previstos y guías de seguridad del modelo original IFM/PAN2 siguen aplicando.
- Idiomas: solo inglés declarado; no se documenta soporte multilingüe.
- Los prompts de una sola línea producen vídeo de baja calidad; el modelo espera captions JSON estructurados de estado del mundo generados con el rewriter de PAN 2. Ignorar este formato degrada gravemente el resultado.
- Riesgo de alucinación visual y de inconsistencias temporales inherente a los diffusion transformers; no se documentan métricas de fidelidad semántica en la información disponible.
- Sesgos: no se detallan sesgos conocidos en la model card de esta conversión; deben consultarse los del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la receta depende de vLLM-Omni y de una rama no upstream (`pan2-host-modulation`), lo que introduce riesgo de mantenimiento en producción.
- Memoria: los clips de 20 s a 720p no caben en 2×24 GB; los perfiles de 1×48 GB y 2×48 GB no han sido probados según la model card.
- Timeouts: por defecto, cualquier clip de más de 10 minutos falla; requiere ajuste manual.
- La rama de vLLM-Omni aplica parches específicos (modulación en host, guardrails en CPU, correcciones de carga FP8 en CPU y de atención con batch mayor que 1); actualizar vLLM sin verificar estos parches puede romper el despliegue.
- El perfil en Ampere (2×3090) ejecuta el checkpoint como pesos FP8 con cómputo de 16 bits, con el coste de rendimiento que ello implica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Eisenhawer/PAN2-FP8
- Modelo base: https://huggingface.co/IFM/PAN2
- Repositorio de PAN 2 (incluye el prompt rewriter): https://github.com/ifm-ai/PAN2
- vLLM-Omni: https://github.com/vllm-project/vllm-omni
- Rama con los parches de PAN 2: https://github.com/Eisenh/vllm-omni/tree/pan2-host-modulation
- Paper de ConvRot: https://arxiv.org/abs/2512.03673
- Paper de referencia del modelo (arXiv 2512.03673, según tags): https://arxiv.org/abs/2512.03673
