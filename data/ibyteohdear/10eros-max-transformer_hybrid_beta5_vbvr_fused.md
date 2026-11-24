# ibyteohdear/10Eros-Max-Transformer_hybrid_beta5_VBVR_FUSED

## Resumen

10Eros-Max-Transformer_hybrid_beta5_VBVR_FUSED es un modelo de difusion para generacion de video (text-to-video, image-to-video y audio-video) publicado por el usuario ibyteohdear en Hugging Face. Se trata de un checkpoint derivado de la familia MiniMax-H3, concretamente un finetune del modelo base `ibyteohdear/10Eros-Max-Transformer_8stepTURBO_beta7`, sobre el que se ha fusionado (baked) la LoRA `H3_VBVR_Pro-V2` con fuerza 1 directamente en los pesos. El resultado es un unico fichero de pesos que no requiere cargar ni mezclar LoRA en tiempo de inferencia.

El modelo tiene 20.111.462.920 parametros (unos 20,1 mil millones) en formato safetensors y un repositorio de 42,7 GB. Esta disenado para muestreo en 8 pasos gracias al delta TURBO ya incorporado en los pesos, lo que reduce el coste de inferencia frente a un modelo de difusion convencional de 50 pasos. La model card advierte explicitamente de que no debe apilarse otra LoRA turbo encima, ya que el delta se aplicaria dos veces.

La relevancia de este checkpoint radica en su caracter "todo en uno": al fusionar la LoRA y el delta TURBO en los pesos, simplifica el pipeline de despliegue para generacion de video con audio. No obstante, la informacion publica es limitada en cuanto a licencia, idiomas y benchmarks, y el modelo esta etiquetado como `not-for-all-audiences`, lo que condiciona su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (familia MiniMax-H3), con VAE de video y VAE de audio; componentes de pipeline modular en diffusers |
| Parametros totales | 20.111.462.920 (aprox. 20,1 B) |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible de forma explicita; el codigo de ejemplo usa cuantizacion Int8 weight-only (torchao) para el text encoder |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria diffusers) |
| Tamano del repositorio | 42,7 GB |
| Modelo base | ibyteohdear/10Eros-Max-Transformer_8stepTURBO_beta7 |
| LoRA fusionada | ibyteohdear/h3Lora/H3_VBVR_Pro-V2.safetensors, fuerza 1 |
| Tensores fusionados | 312 |
| Fecha de fusion | 2026-11-04 |

## Arquitectura y entrenamiento

El modelo pertenece a la familia MiniMax-H3, una arquitectura de difusion para generacion conjunta de video y audio implementada en la libreria diffusers mediante un pipeline modular (`diffusers.modular_pipelines.minimax_h3`). El pipeline incluye etapas separadas de preparacion de latentes y layout, codificacion de texto, denoising y decodificacion mediante dos autoencoders: `AutoencoderKLMiniMaxH3` para video y `AutoencoderKLMiniMaxH3Audio` para audio. El text encoder empleado en el codigo de ejemplo es un Qwen3-VL (variantes de 8B o 32B), lo que sugiere capacidad de condicionamiento multimodal texto-imagen.

El checkpoint es un finetune del modelo base TURBO de 8 pasos, sobre el que se ha fusionado la LoRA `H3_VBVR_Pro-V2` con fuerza 1 (alpha/rank x strength, con rank 128 y alpha por clave de 208). La fusion se realizo desde pesos pristinos, afecto a 312 tensores y se verifico antes de la subida: conjunto de claves exacto respecto al base, dtypes por clave sin cambios y tensores no fusionados identicos bit a bit. La model card menciona una tabla AdaLN de rank 8 que es exacta en la rejilla de 1025 pasos del sampler y aproximada fuera de ella, por lo que recomienda muestrear en la rejilla. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO.

## Capacidades

- Generacion de video a partir de texto (text-to-video).
- Generacion de video a partir de una imagen (image-to-video), que es el pipeline declarado en la ficha de Hugging Face.
- Generacion conjunta de video y audio (audio-video), con un VAE de audio dedicado en el pipeline.
- Muestreo en 8 pasos gracias al delta TURBO integrado en los pesos.
- Condicionamiento mediante text encoder Qwen3-VL, lo que permite entrada de texto e imagen en el codigo de ejemplo.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico.
- No se documenta soporte multilingue explicito; los idiomas no estan disponibles.
- No se documenta modo thinking ni otras capacidades de razonamiento.

## Casos de uso

- Generacion de clips promocionales a partir de una imagen de producto: usando el pipeline image-to-video, se puede animar una fotografia estatica de catalogo en un clip corto con movimiento y audio, adecuado para redes sociales.
- Creacion de video de stock sintetico: el modo text-to-video permite generar escenas bajo demanda sin depender de bancos de footage, con el coste de inferencia reducido por el muestreo en 8 pasos.
- Prototipado rapido de storyboards audiovisuales: guionistas y disenadores pueden convertir descripciones textuales en clips con audio para validar una secuencia antes de producirla.
- Animacion de ilustracion y arte digital: el modo image-to-video permite dar movimiento a ilustraciones fijas, util en produccion de contenido para videojuegos o editorial.
- Generacion de audio-video sincronizado para demos de producto: el VAE de audio integrado permite obtener una pista sonora junto al video en una sola pasada del pipeline.
- Investigacion en difusion de video: el checkpoint sirve como referencia para estudiar el efecto de fusionar LoRA y deltas TURBO en pesos, con metadatos de fusion verificables (`fusion_metadata.txt`).
- Despliegue en espacios de Hugging Face con GPU limitada: el codigo de ejemplo incluye decoradores de Zero-GPU y cuantizacion Int8 del text encoder, lo que facilita demos publicas con recursos acotados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con 20,1 B de parametros, en bfloat16 los pesos del transformer ocupan aproximadamente 40 GB, a los que hay que sumar los VAE de video y audio, el text encoder Qwen3-VL y los latentes de video. El repo completo pesa 42,7 GB.
- GPU recomendadas: no disponibles en la informacion. Por volumen de pesos en bf16, se requiere al menos una GPU de 80 GB (A100, H100) para el transformer completo; configuraciones con offloading de grupos (`apply_group_offloading`) pueden reducir el pico de memoria.
- GPU de consumo: no cabe en GPUs de consumo de 24 GB en bf16 sin cuantizacion agresiva u offloading a CPU; no se documentan recetas para RTX 4090 u otras consumer.
- Opciones de despliegue: diffusers con pipeline modular MiniMax-H3 y `trust_remote_code=True`; el codigo de ejemplo usa `torchao` para cuantizacion Int8 weight-only del text encoder y `apply_group_offloading` para descarga de modulos. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusion de este tipo).
- Latencia y throughput: no disponibles. El muestreo en 8 pasos reduce el numero de evaluaciones del transformer frente a samplers de 50 pasos, pero no se publican cifras de tiempo por clip.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 10Eros-Max beta5 VBVR FUSED | 20,1 B | no disponible | Difusion video+audio (MiniMax-H3) | no disponible | Hugging Face, diffusers |
| ibyteohdear/10Eros-Max-Transformer_8stepTURBO_beta7 | no disponible | no disponible | Difusion video (base sin fusionar) | no disponible | Hugging Face |
| MiniMax-H3 (familia base) | no disponible | no disponible | Difusion video+audio | no disponible | diffusers |
| larryvrh/MiniMax-H3-Turbo-Lora | no aplica (LoRA) | no aplica | LoRA turbo para MiniMax-H3 | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La fuerza de la LoRA esta fijada en los pesos: no existe un parametro para reducirla en tiempo de inferencia. Si el efecto es demasiado intenso, hay que usar otro repositorio, no ajustar un slider.
- No debe apilarse otra LoRA turbo (por ejemplo `larryvrh/MiniMax-H3-Turbo-Lora` o variantes `lightx2v`) encima, porque el delta TURBO ya esta aplicado y se duplicaria.
- La tabla AdaLN de rank 8 es exacta solo en la rejilla de 1025 pasos del sampler; fuera de ella es una aproximacion, por lo que conviene muestrear en la rejilla.
- El modelo esta etiquetado como `not-for-all-anudiences`: puede generar contenido para adultos o no apto para todo publico, lo que exige moderacion y filtros en cualquier despliegue publico.
- Licencia no disponible: no se puede confirmar el permiso para uso comercial; debe verificarse antes de integrarlo en produccion.
- Idiomas no disponibles: no se documenta el soporte multilingue de los prompts.
- Riesgo de alucinacion visual y artefactos propios de la difusion de video: no se documentan tasas de fallo ni evaluaciones de calidad.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas.
- Requiere `trust_remote_code=True` y codigo personalizado en el repositorio, lo que implica revisar el codigo antes de ejecutarlo en entornos sensibles.
- El repositorio depende de componentes externos (text encoder Qwen3-VL, ClipProj de NicoLab28), lo que anade dependencias y posibles roturas de version.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ibyteohdear/10Eros-Max-Transformer_hybrid_beta5_VBVR_FUSED
- Modelo base: https://huggingface.co/ibyteohdear/10Eros-Max-Transformer_8stepTURBO_beta7
- LoRA fusionada: https://huggingface.co/ibyteohdear/h3Lora
- ClipProj MiniMax-H3: https://huggingface.co/NicoLab28/ClipProj-MiniMax-H3
- Text encoder de ejemplo (8B): https://huggingface.co/prithivMLmods/Qwen3-VL-8B-Instruct-c_abliterated-v3
- Text encoder de ejemplo (32B): https://huggingface.co/prithivMLmods/Qwen3-VL-32B-Instruct-abliterated-v1
- LoRA turbo alternativa (no apilar): https://huggingface.co/larryvrh/MiniMax-H3-Turbo-Lora
