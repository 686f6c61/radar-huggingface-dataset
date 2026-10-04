# kurtholes/PE-T2I-9B-NVFP4-W4A16-MAX

## Resumen

PE-T2I 9B NVFP4 (W4A16) MAX es una cuantización de 4 bits del modelo Qwen/Qwen-Image-2.1-PE-T2I, el reescritor de prompts oficial de Qwen-Image 2.1. Lo publica el usuario kurtholes y no es un modelo nuevo: es una conversión del original en bf16 a pesos NVFP4 con activaciones en bf16 (W4A16), generada con NVIDIA ModelOpt 0.43.0. Su función es convertir una petición breve de imagen en un prompt largo y detallado en inglés, más una relación de aspecto, devuelto como JSON después de un bloque de razonamiento (`think`).

El problema que resuelve es puramente de despliegue: el original en bf16 ocupa 18,82 GB en disco y 16,8 GiB en memoria de vLLM, mientras que esta variante baja a 6,76 GB en disco y 6,2 GiB en memoria, con un aumento medido de velocidad de decodificación de 3,1x en flujo único (36,6 tok/s frente a 11,8 tok/s) sobre una NVIDIA GB10 (DGX Spark). Cada capa `nn.Linear` está cuantizada: MLPs del modelo de lenguaje, todas las proyecciones de atención y atención lineal, `lm_head` y el vision tower; solo los embeddings de tokens, las normas y vectores pequeños permanecen en bf16.

Es relevante ahora porque demuestra que se puede servir un reescritor de prompts multimodal en hardware modesto con vLLM, a costa de una degradación medible de fidelidad con respecto al bf16. La licencia es Qwen Research License, de uso exclusivamente no comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia qwen3_5 (etiqueta del repo) con proyecciones de atención completa y de atención lineal, más vision tower; modelo base Qwen/Qwen-Image-2.1-PE-T2I (commit `f3ed7985`) |
| Parametros totales | 5.216.412.912 (~5,22 mil millones) segun safetensors; el nombre del repositorio indica 9B, discrepancia no aclarada en la informacion disponible |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible como valor nativo; el ejemplo de servicio usa `--max-model-len 20480`, con hasta 16256 tokens nuevos y un limite de 8192 tokens para el bloque `think` |
| Tipos de cuantizacion | NVFP4 W4A16 (pesos FP4, activaciones bf16), block size 16, escalas de bloque e4m3, una escala global fp32 por tensor, algoritmo `max`, sobre 359 modulos `nn.Linear`; etiquetado como 8-bit en HuggingFace y 4-bit en la model card |
| Idiomas soportados | No disponible (el prompt de salida es en ingles segun la model card) |
| Licencia | `other` / qwen-research (Qwen Research License), solo uso no comercial |
| Formato de pesos | safetensors (model.safetensors), con config.json y hf_quant_config.json de ModelOpt; detectado por vLLM como checkpoint `W4A16_NVFP4` |

## Arquitectura y entrenamiento

No hay entrenamiento: es una conversión de pesos del modelo base. El proceso se hizo con NVIDIA ModelOpt 0.43.0 en modo NVFP4 weight-only, con tamaño de bloque 16, escalas de bloque en e4m3 y una escala global fp32 por tensor, aplicado a los 359 módulos `nn.Linear` del modelo. La calibración usó 64 prompts en el formato de chat real, más una pasada weight-only para que el vision tower (al que la calibración de texto nunca llega) obtuviera sus escalas. Tras la exportación se verificó que los tensores no cuantizados eran idénticos bit a bit al original y que vLLM enrutaba el checkpoint a las 263 lineales fusionadas mediante su propio código de configuración.

La arquitectura subyacente combina atención completa y proyecciones de atención lineal, e incluye un vision tower dentro del mismo checkpoint. La innovación técnica reseñable no está en el modelo, sino en la cuantización: es la cuantización de 4 bits más pequeña que los autores pudieron producir y seguir sirviendo, y la primera de su serie que cuantiza también `lm_head` y el vision tower, no solo los MLP. Limitación importante del enfoque: las velocidades publicadas se midieron por la ruta de dequantización (kernel Marlin weight-only, que deconvierte a bf16), no por la ruta nativa FP4, porque la build de vLLM empleada (0.27.2rc0 para sm121) no reportaba soporte FP4 nativo en GB10.

## Capacidades

- Reescritura de prompts para texto a imagen: transforma una petición corta en un prompt largo, detallado y en inglés, devolviendo además la relación de aspecto.
- Salida estructurada: genera JSON válido con las claves `rewritten_prompt` y `wh_ratio` después de cerrar el bloque `think`.
- Modo de razonamiento explícito: usa un bloque `think` previo a la respuesta, servido con la plantilla de chat oficial y thinking activado.
- Generación de texto conversacional: la pipeline declarada es `text-generation` con soporte de plantilla de chat.
- Capacidad multimodal potencial: el checkpoint conserva un vision tower cuantizado, aunque en la práctica se sirve en modo solo texto.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el prompt de salida es en inglés.

## Casos de uso

- Servicio de reescritura de prompts en producción: desplegado con vLLM y `--language-model-only`, convierte las peticiones de los usuarios en prompts detallados antes de pasarlos al modelo de difusión de imagen, con 36,6 tok/s en flujo único y 239,8 tok/s agregados a 16 peticiones concurrentes.
- Backend de una interfaz de generación de imágenes: el JSON de salida (`rewritten_prompt` y `wh_ratio`) se puede consumir directamente para elegir la relación de aspecto y alimentar el generador, sin post-procesado complejo.
- Inferencia en hardware de gama media: con 6,2 GiB de pesos en memoria de vLLM, cabe en GPUs de consumo con 12-16 GB de VRAM, lo que permite montar un nodo de reescritura dedicado junto al servidor de difusión.
- Enriquecimiento por lotes de datasets de imagen: procesar un catálogo de peticiones cortas para generar prompts largos y relaciones de aspecto, acelerando el preprocesado de pipelines de entrenamiento o de generación masiva.
- Experimentación académica con cuantización: sirve como caso de estudio reproducible de NVFP4 W4A16 con ModelOpt sobre un modelo multimodal, con métricas de acuerdo de tokens y tests ciegos publicados.
- Despliegue en edge o en nodos con una sola GPU: gracias al tamaño reducido (6,76 GB en disco) y a la ausencia de requisitos de multi-GPU, es viable en una DGX Spark o en una estación de trabajo con una GPU Blackwell de consumo.
- Nodo intermedio en un pipeline de agentes gráficos: el modelo puede actuar como planificador de prompts para una etapa de generación, siempre que se imponga un `max_tokens` y se trate un bloque `think` sin cerrar como reintento.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos sobre una NVIDIA GB10 (DGX Spark) con vLLM, mismos flags en todas las variantes, 50 prompts a 1:1. La barra de aceptación se fijó antes de ejecutar el test.

| Test | bf16 | MLP-only quant | MAX | Barra | Resultado |
|---|---|---|---|---|---|
| JSON valido + bloque think cerrado, greedy | 100% / 100% | 100% / 100% | 100% / 100% | dentro de 2 puntos | PASS |
| JSON valido + think cerrado, muestreado (receta oficial, 3 semillas x 50) | 150/150 | 150/150 | 150/150 | (extra) | - |
| Test ciego de imagen: 12 prompts, ambas reescrituras renderizadas con la misma semilla, juzgadas sin saber cual era cual | 3,00 estrellas, 4 victorias | - | 2,92 estrellas, 3 victorias (5 empates) | no peor por mas de 0,25 | PASS |
| Acuerdo de tokens con bf16 (teacher forcing) | 98,83% (bf16 consigo mismo) | 93,54% | 89,88% | 90% | FAIL |
| Velocidad de decodificacion, flujo unico | 11,8 tok/s | 17,8 tok/s | 36,6 tok/s (3,1x) | 1,8x | PASS |
| Velocidad de decodificacion, agregada a 16 concurrentes | 144,5 tok/s | 188,2 tok/s | 239,8 tok/s | superar al MLP-only | PASS |
| Pesos en memoria de vLLM | 16,8 GiB | 10,33 GiB | 6,2 GiB | - | - |

El fallo de la barra de acuerdo de tokens significa que, en cualquier posición dada, la primera opción de MAX difiere de la del bf16 aproximadamente una vez de cada diez; la mayoría son empates cercanos del tipo "patches" frente a "streaks". Las reescrituras resultantes tienen la misma longitud y las imágenes renderizadas no fueron juzgadas como peores.

## Requisitos de hardware

- VRAM para pesos: 6,2 GiB en memoria de vLLM para esta variante, frente a 10,33 GiB de la cuantización solo-MLP y 16,8 GiB del bf16 original. Hay que añadir la caché KV (el ejemplo usa `--kv-cache-dtype fp8`).
- GPU validadas: una NVIDIA GB10 (DGX Spark), con una build de vLLM 0.27.2rc0 para sm121.
- GPU de consumo: por tamaño de pesos, cabe en GPUs de 12 GB o más (por ejemplo RTX 3060 12 GB, RTX 4070 Ti, RTX 4090), pero el soporte de kernel FP4 en sm120 no está confirmado en la información disponible.
- Ruta de ejecución: los pesos se sirvieron por el kernel Marlin weight-only de vLLM, que deconvierte a bf16; no se probó la ruta nativa FP4 con tensor cores, que requeriría un stack orientado a sm_121a y probablemente una cuantización con activaciones FP4 (W4A4).
- Despliegue recomendado: vLLM, con el comando `vllm serve kurtholes/PE-T2I-9B-NVFP4-W4A16-MAX --language-model-only --max-model-len 20480 --kv-cache-dtype fp8`. Ambos servidores se ejecutaron con `--enforce-eager`.
- Carga con transformers: no probada según la model card. No hay datos de llama.cpp, Ollama, TGI ni GGUF.
- Latencia y throughput medidos: 36,6 tok/s en flujo único y 239,8 tok/s agregados a 16 concurrentes, ambos sobre GB10 y por la ruta de dequantización.
- El vision tower está cuantizado pero no probado: con visión activada, el kernel Marlin FP4 de vLLM rechaza las formas de los MLP de visión, de ahí el flag `--language-model-only`.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano en disco | Pesos en vLLM | Velocidad flujo unico | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| kurtholes/PE-T2I-9B-NVFP4-W4A16-MAX | 5,22 mil millones (safetensors) | 6,76 GB | 6,2 GiB | 36,6 tok/s | qwen-research (no comercial) | HuggingFace, 0 descargas, 0 likes |
| kurtholes/PE-T2I-9B-NVFP4-W4A16 (solo MLP) | No disponible | 11,87 GB | 10,33 GiB | 17,8 tok/s | No disponible | HuggingFace |
| Qwen/Qwen-Image-2.1-PE-T2I (bf16 original) | No disponible | 18,82 GB | 16,8 GiB | 11,8 tok/s | qwen-research (no comercial) | HuggingFace |

No se dispone de datos de otros reescritores de prompts comparables en la información proporcionada.

## Limitaciones y advertencias

- No supera el umbral de fidelidad fijado por sus propios autores: 89,88% de acuerdo de tokens con el bf16 frente a una barra del 90%, con divergencias en aproximadamente 1 de cada 10 posiciones.
- Bucle potencial en el bloque `think`: en 1 de cada 100 ejecuciones greedy (una repetición con el orden del lote invertido) un prompt quedó en bucle hasta alcanzar el límite de 8192 tokens. Se recomienda fijar `max_tokens` y tratar un bloque `think` sin cerrar como reintento.
- Vision tower no validado: está cuantizado pero nunca se carga en el servicio de solo texto, y con visión activada el kernel Marlin FP4 de vLLM rechaza las formas de sus MLP.
- Las cifras de velocidad corresponden a la ruta de dequantización, no a FP4 nativo; el rendimiento en una ruta FP4 real no ha sido probado.
- Licencia Qwen Research License: uso exclusivamente no comercial, heredada del modelo original. No apta para producción comercial sin revisión legal.
- Idioma: el prompt generado es en inglés; no hay información sobre capacidades en otros idiomas.
- Riesgo de alucinación de detalles en el prompt reescrito: el modelo añade descripciones largas que no estaban en la petición original del usuario, algo inherente a su función pero que puede introducir elementos no deseados en la imagen final.
- Sesgos: no disponibles en la información proporcionada.
- Repositorio con 0 descargas y 0 likes; creado y actualizado el mismo día (2026-10-03), sin validación externa por parte de la comunidad.
- Requiere vLLM con soporte de checkpoints ModelOpt `W4A16_NVFP4`; la carga con transformers no está probada y no hay soporte GGUF.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kurtholes/PE-T2I-9B-NVFP4-W4A16-MAX
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-PE-T2I
- Cuantización solo MLP de la misma serie: https://huggingface.co/kurtholes/PE-T2I-9B-NVFP4-W4A16
- Licencia Qwen Research License (archivo LICENSE del repositorio): https://huggingface.co/kurtholes/PE-T2I-9B-NVFP4-W4A16-MAX/blob/main/LICENSE
- NOTICE con los cambios respecto al original: https://huggingface.co/kurtholes/PE-T2I-9B-NVFP4-W4A16-MAX/blob/main/NOTICE
- Resultados de la búsqueda web: no se encontró ningún enlace relevante al modelo (los resultados devueltos corresponden a resultados no relacionados con IA).
