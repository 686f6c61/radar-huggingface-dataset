# gguf-org/pig-clip

## Resumen

pig-clip es un modelo de codificador de texto (text encoder) de propósito específico desarrollado por gguf-org, diseñado para sustituir a codificadores de texto grandes como T5-XXL o UMT5-XXL en pipelines de difusión (generación de imágenes y vídeo). Con aproximadamente 596 millones de parámetros, su función no es conversacional ni de razonamiento: actúa como puente entre el prompt del usuario y el generador de difusión, entregando una representación textual precisa y compacta. El autor lo describe como un CLIP multipropósito entrenado de forma nativa para el motor `gk engine`, con el objetivo declarado de ser entre un 80 y un 90 % más pequeño y eficiente que los codificadores T5 equivalentes.

La relevancia del modelo reside en su enfoque de "adaptadores": un único backbone pig-clip se combina con adaptadores específicos (t5, umt5, qwen3, qwen3vl, llada, ming) para emular el comportamiento del codificador original de cada pipeline de difusión. Esto permite reducir drásticamente la VRAM necesaria para el codificador de texto sin reentrenar el modelo generativo. El repositorio se distribuye en formato GGUF con licencia MIT y acumula 4700 descargas y 7 likes en Hugging Face.

La información pública disponible es limitada: la model card no detalla la arquitectura interna, los datos de entrenamiento ni los idiomas soportados, y se centra en instrucciones de uso con pipelines concretos (PixArt, SD-Lite, Wan 2.1/2.2, Krea2, Fibo2, Flux3, Qwen-Image 2.1, entre otros).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (descrito como "CLIP multipropósito" para el motor gk engine) |
| Parámetros totales | 596.049.920 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF en varias precisiones (se citan nvfp4 y f16 en los ejemplos) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors como dato de parámetros en el repo) |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna más allá de describirlo como un "CLIP multipropósito entrenado de forma nativa" para el motor gk engine. Por el tamaño (596 M de parámetros) y su función como codificador de texto para difusión, se trata de un modelo compacto orientado a producir embeddings de prompt, no a generar texto libre. El autor justifica explícitamente este diseño: en un modelo de difusión, el LLM actúa esencialmente como codificador de texto y su objetivo es entregar el prompt al generador con precisión, sin conversación, sin razonamiento profundo y sin respuestas largas.

El entrenamiento se detuvo cuando la similitud alcanzó 0,95 o tras 20 000 ciclos, con un umbral mínimo de similitud de 0,75. La model card reporta métricas de similitud comparando el codificador original ("stock") frente a pig-clip con distintos adaptadores, con deltas positivos en todos los casos: t5 (+0,0040), t5 a 20k ciclos (+0,0167), umt5 (+0,0100), qwen3 (+0,0022), qwen3vl (+0,0082), qwen3vl layerwise (+0,0029), qwen3vl fibo2 (+0,0298), qwen3vl 4b it (+0,0542), qwen3vl 8b (+0,0046), qwen3.5 9b (+0,0281), qwen3.5 9b plus (+0,0515), llada (+0,0149) y ming (+0,0094). No se detalla la composición del dataset, el número de tokens de entrenamiento ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Codificación de prompts de texto para pipelines de difusión de imagen y vídeo, sustituyendo a T5-XXL y UMT5-XXL.
- Compatibilidad mediante adaptadores con múltiples familias de codificadores: t5, umt5, qwen3, qwen3vl (incluidas variantes layerwise y fibo2), qwen3.5 9b, llada y ming.
- Soporte de adaptadores de visión opcionales (`mmproj-qwen3vl-4b-it-f16.gguf`) para edición de imagen con imagen de referencia en algunos pipelines.
- Integración con pipelines concretos: PixArt, SD-Lite, Wan 2.1, Wan 2.2, Krea2, Fibo2, X-Image, Mageflow, Flux3 y Qwen-Image 2.1.
- Ejecución con cuantización nvfp4 y f16, orientada a bajo consumo de VRAM.
- No es un modelo conversacional: no se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling ni agentes.

## Casos de uso

- Generación de imágenes con PixArt en equipos de VRAM limitada: se reemplaza `--t5xxl t5xxl.gguf` por `--llm pig_clip-nvfp4.gguf --llm-adapter pig_t5_adapter-f16.gguf`, reduciendo el peso del codificador de texto entre un 80 y un 90 % según el autor.
- Pipeline SD-Lite con muestreo rápido: con 8 pasos, `--cfg-scale 1`, método euler y `--clip-on-cpu`, el modelo permite ejecutar el codificador en CPU y liberar VRAM para el modelo de difusión.
- Generación de vídeo con Wan 2.1 o Wan 2.2: mediante el adaptador umt5 y `--offload-to-cpu`, se puede generar vídeo de 480x480 con 14 fotogramas en hardware modesto.
- Edición de imagen con Fibo2: usando el adaptador qwen3vl-fibo2 y, opcionalmente, el proyector de visión, se puede pasar una imagen de referencia (`--ref-image`) junto con el prompt de edición.
- Edición de imagen con Flux3: el adaptador qwen3vl-4b-it permite edición con imagen de referencia sin necesidad de proyector de visión adicional.
- Generación de imágenes artísticas con X-Image o Mageflow: el adaptador qwen3-4b o qwen3vl-4b permite prompts largos y detallados con 8 pasos y `--offload-to-cpu`.
- Sustitución de codificadores T5/UMT5 en despliegues existentes: al ser un GGUF de ~596 M de parámetros, se integra en flujos que ya usan el motor gk engine sin cambiar el modelo de difusión.

## Benchmarks y rendimiento

La model card no presenta benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), sino métricas de similitud entre el codificador original y pig-clip con cada adaptador:

| Adaptador | Stock | pig-clip | Delta |
|---|---|---|---|
| t5 | 0,7872 | 0,7913 | +0,0040 |
| t5 (20k) | 0,7913 | 0,8080 | +0,0167 |
| umt5 | 0,7533 | 0,7634 | +0,0100 |
| qwen3 | 0,9649 | 0,9671 | +0,0022 |
| qwen3vl | 0,9296 | 0,9378 | +0,0082 |
| qwen3vl (layerwise) | 0,9475 | 0,9504 | +0,0029 |
| qwen3vl (fibo2) | 0,8288 | 0,8586 | +0,0298 |
| qwen3vl 4b it | 0,7977 | 0,8519 | +0,0542 |
| qwen3vl 8b | 0,9385 | 0,9431 | +0,0046 |
| qwen3.5 9b | 0,7658 | 0,7939 | +0,0281 |
| qwen3.5 9b (plus) | 0,7568 | 0,8083 | +0,0515 |
| llada | 0,9502 | 0,9651 | +0,0149 |
| ming | 0,9175 | 0,9269 | +0,0094 |

No se especifica la métrica exacta de similitud empleada ni el conjunto de evaluación. No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; con ~596 M de parámetros, en f16 ocuparía aproximadamente 1,2 GB y en nvfp4 alrededor de 0,3-0,4 GB, aunque el autor no publica cifras oficiales.
- GPU recomendadas: no disponible. Los ejemplos usan `--offload-to-cpu` y `--clip-on-cpu`, lo que sugiere que el modelo está pensado para ejecutarse en CPU o en GPU con VRAM limitada.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del modelo, aunque no se confirma en la documentación.
- Opciones de despliegue: motor `gk engine` (comandos `gguf`), con soporte de archivos GGUF y adaptadores separados en f16.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Formato |
|---|---|---|---|---|---|
| pig-clip | 596 M | no disponible | Codificador de texto para difusión | MIT | GGUF |
| T5-XXL | ~4,7 B | no disponible | Codificador de texto para difusión | Apache 2.0 | safetensors, GGUF |
| UMT5-XXL | ~4,7 B | no disponible | Codificador de texto para difusión (multilingüe) | Apache 2.0 | safetensors, GGUF |
| Qwen3VL-4B | ~4 B | no disponible | Codificador multimodal | Apache 2.0 | safetensors, GGUF |

La comparación se basa en el tamaño y la función declarada; no hay datos de rendimiento comparables publicados para pig-clip frente a estos modelos en tareas estándar.

## Limitaciones y advertencias

- No es un modelo de propósito general: no genera texto, no razona y no responde preguntas; su uso está restringido a la codificación de prompts en pipelines de difusión.
- La model card no documenta sesgos, idiomas soportados ni comportamiento multilingüe.
- Riesgo de alucinación no aplicable en el sentido habitual, pero sí de representaciones de prompt imprecisas fuera de los dominios cubiertos por los adaptadores.
- El entrenamiento se detuvo con un umbral de similitud de 0,75, lo que implica que algunos adaptadores pueden degradar la fidelidad del prompt frente al codificador original.
- Los ejemplos dependen del motor `gk engine` y de archivos auxiliares (VAE, adaptadores, proyectores de visión) alojados en repos separados; la reproducibilidad depende de su disponibilidad.
- Licencia MIT permite uso comercial, pero no se especifican garantías ni limitaciones adicionales.
- No se documentan requisitos de hardware oficiales ni latencias, lo que dificulta planificar despliegues en producción.

## Enlaces

- Hugging Face: https://huggingface.co/gguf-org/pig-clip
- PixArt GGUF: https://huggingface.co/gguf-org/pixart-gguf/tree/main
- SD-Lite / diffusion: https://huggingface.co/gguf-org/diffusion/tree/main
- Wan 2.1 GGUF: https://huggingface.co/calcuis/wan-gguf/tree/main
- Wan 2.2 GGUF: https://huggingface.co/calcuis/wan2-gguf/tree/main
- Krea2 GGUF: https://huggingface.co/gguf-org/krea-2-gguf/tree/main
- Fibo2 GGUF: https://huggingface.co/gguf-org/fibo2-gguf/tree/main
- X-Image GGUF: https://huggingface.co/gguf-org/x-image-gguf/tree/main
- Mageflow GGUF: https://huggingface.co/gguf-org/mageflow-gguf/tree/main
- Flux3 GGUF: https://huggingface.co/gguf-org/flux3-image-klein-gguf/tree/main
- Qwen-Image 2.1 GGUF: https://huggingface.co/gguf-org/qwen-image-2.1-gguf/tree/main
