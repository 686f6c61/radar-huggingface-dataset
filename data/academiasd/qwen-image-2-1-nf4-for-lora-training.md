# AcademiaSD/Qwen-Image-2.1-NF4-for-LoRA-Training

## Resumen

Qwen-Image-2.1-NF4-for-LoRA-Training es un paquete de pesos pre-cuantizados del modelo de difusión Qwen-Image 2.1, publicado por AcademiaSD para alimentar su herramienta LoRAlab, un entrenador de LoRAs orientado a GPUs de consumo desde 8 GB de VRAM. No se trata de un checkpoint de inferencia: el transformer se almacena como una caché NF4 por capas que la herramienta reconstruye directamente y que no carga con `from_pretrained`. Para generar imágenes debe usarse el modelo original de Qwen o su release para ComfyUI.

El paquete incluye el transformer DiT de 7B cuantizado a NF4 (3,87 GB), el text encoder Qwen3-VL-8B-Instruct en tres variantes de precisión (BF16 exacto de 16,29 GB, INT8 de 8,78 GB y NF4 de 5,45 GB), el VAE original de 64 canales RGBA (1,35 GB) y el Turbo LoRA de Viggle para previews de entrenamiento en 4 pasos. Su relevancia actual radica en que reduce el coste de entrenamiento de LoRAs sobre un modelo de imagen de última generación a hardware de consumo, manteniendo una fidelidad numérica alta respecto al transformer en BF16.

La conversión la firma AcademiaSD, mientras que el modelo base y el text encoder son de Qwen (Alibaba). La licencia es la Qwen Research License, que restringe el uso a investigación y evaluación, sin fines comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) de 32 bloques con atencion y MLP; text encoder Qwen3-VL-8B-Instruct; VAE de 64 canales RGBA |
| Parametros totales | 7B en el transformer DiT; 8B en el text encoder Qwen3-VL |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 con doble cuantizacion (bitsandbytes) en el transformer; BF16, INT8 (LLM.int8) y NF4 en el text encoder |
| Idiomas soportados | no disponible |
| Licencia | Qwen Research License (solo uso no comercial: investigacion o evaluacion) |
| Formato de pesos | safetensors (cache NF4 por capas + `others.safetensors` en BF16; no compatible con `from_pretrained`) |

## Arquitectura y entrenamiento

El transformer es un DiT de 7B con 32 bloques. Cada capa lineal de atención y MLP está cuantizada a NF4 con doble cuantizacion de bitsandbytes (224 capas NF4), mientras que los componentes críticos para la precisión se mantienen en BF16: `img_in`, `txt_in`, la `modulation` compartida, el embedder de timesteps, `norm_out` y `proj_out`. Frente al transformer en BF16 con las mismas entradas, la conversión alcanza una similitud coseno de 0,998–0,9996 en la velocidad predicha, con una pérdida prácticamente idéntica. Carga en unos 2 segundos y ocupa aproximadamente 3,9 GB de VRAM sin necesidad de mantener una copia en BF16.

El text encoder es exactamente Qwen3-VL-8B-Instruct, verificado tensor a tensor contra el repositorio oficial, y solo se emplea durante el pre-caché, nunca durante el entrenamiento. La variante BF16 con offload a CPU es la opción por defecto y reparte capas a RAM según la VRAM libre; la variante BF16 completa requiere unos 15,5 GB, la INT8 unos 8,5 GB con un error de aproximadamente el 9 % por token frente a BF16, y la NF4 unos 5,5 GB con un error de en torno al 24 %. La variante NF4 incluye `lm_head` y se usa además como auto-captioner del dataset (unos 6 GB de pico). El paquete no documenta el volumen de tokens ni la composición del dataset de entrenamiento del modelo base, ni si hubo RLHF o DPO; esa información corresponde a la model card de Qwen-Image 2.1, no incluida en la información disponible.

## Capacidades

- Entrenamiento de LoRAs de personajes, objetos y estilos a partir de un par imagen-caption por muestra.
- Entrenamiento de LoRAs de edición mediante pares `name_before` / `name_after` con una instrucción imperativa; la imagen "before" se codifica con Qwen3-VL junto a la instrucción y se antepone como latentes limpios, replicando el nodo `TextEncodeQwenImage21` de ComfyUI.
- Pre-caché de condicionamiento con el text encoder exacto en BF16, de modo que el LoRA entrena con la misma condición que verá en inferencia.
- Auto-captioning del dataset mediante la variante NF4 del text encoder, que conserva `lm_head`.
- Exportación de LoRAs en formato de claves diffusers/PEFT con `alpha` por capa, cargables directamente en ComfyUI (verificado con el loader propio de ComfyUI).
- Previews rápidos de entrenamiento con el Viggle Turbo LoRA a 4 pasos.
- No soporta generación de imágenes por sí mismo: no es un checkpoint de inferencia.

## Casos de uso

- Entrenamiento de LoRAs de personajes en GPUs de consumo: con el transformer NF4 ocupando unos 3,9 GB de VRAM y el text encoder en offload a CPU, el flujo cabe en tarjetas desde 8 GB, lo que permite ajustar un personaje concreto sin alquilar hardware de datacenter.
- LoRAs de estilo artístico: un conjunto de imágenes con caption por muestra basta para capturar una estética; el pre-caché con BF16 exacto garantiza que el estilo aprendido se reproduzca igual al generar en ComfyUI.
- LoRAs de edición de imagen: los pares antes/después con instrucción permiten enseñar transformaciones como cambios de estilo o de atributos, aprovechando el mismo mecanismo de condicionamiento que usa el nodo de ComfyUI en producción.
- Investigación sobre cuantización y entrenamiento: la similitud coseno de 0,998–0,9996 frente a BF16 y las tres variantes del text encoder con errores medidos (0 %, 9 %, 24 %) permiten estudiar el impacto de la precisión del condicionamiento en la calidad del LoRA resultante.
- Prototipado rápido con previews de 4 pasos: el Viggle Turbo LoRA incluido permite validar visualmente el progreso del entrenamiento sin esperar a una inferencia completa.
- Auto-etiquetado de datasets: la variante NF4 con `lm_head` actúa como captioner automático (unos 6 GB de pico), lo que simplifica la preparación de datasets en el mismo equipo de entrenamiento.
- Evaluación académica de modelos de difusión: al ser uso no comercial, encaja en entornos de investigación que necesitan reproducir experimentos con Qwen-Image 2.1 sin disponer de GPUs de 80 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos cuantitativos aportados son métricas internas de fidelidad de la cuantización y de consumo de VRAM:

| Metrica | Valor |
|---|---|
| Similitud coseno vs transformer BF16 (velocidad predicha) | 0,998–0,9996 |
| VRAM del transformer NF4 | ~3,9 GB |
| Tiempo de carga del transformer | ~2 s |
| Pico de VRAM del text encoder BF16 con offload | se adapta a la VRAM libre |
| Pico de VRAM del text encoder BF16 | ~15,5 GB |
| Pico de VRAM del text encoder INT8 | ~8,5 GB |
| Pico de VRAM del text encoder NF4 | ~5,5 GB (~6 GB como auto-captioner) |
| Error por token del text encoder INT8 vs BF16 | ~9 % |
| Error por token del text encoder NF4 vs BF16 | ~24 % |

## Requisitos de hardware

- VRAM mínima del transformer: aproximadamente 3,9 GB en NF4, sin copia en BF16.
- VRAM del text encoder: desde unos 5,5 GB en NF4 hasta unos 15,5 GB en BF16; la configuración por defecto usa offload a CPU y se adapta a la VRAM libre.
- GPU objetivo: el LoRAlab está diseñado para GPUs de consumo desde 8 GB; con 16 GB o más puede usarse el text encoder en BF16 sin offload.
- Cabe en GPUs de consumo: sí, desde 8 GB según el autor, combinando transformer NF4 y text encoder con offload o en NF4.
- Despliegue: exclusivamente mediante la herramienta AcademiaSD Qwen-Image 2.1 LoRAlab; el transformer no carga con `from_pretrained` ni con pipelines estándar de diffusers. Para inferencia deben usarse el modelo original o su release para ComfyUI.
- Latencia y throughput: no disponibles, salvo el tiempo de carga del transformer (~2 s) y las previews de 4 pasos del Viggle Turbo LoRA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Uso previsto |
|---|---|---|---|---|---|
| AcademiaSD/Qwen-Image-2.1-NF4-for-LoRA-Training | 7B DiT + 8B text encoder | no disponible | safetensors NF4 (cache por capas) | Qwen Research (no comercial) | Entrenamiento de LoRAs en GPUs de consumo |
| Qwen/Qwen-Image-2.1 | 7B DiT + 8B text encoder | no disponible | safetensors BF16 | Qwen Research (no comercial) | Inferencia y edición de imágenes |
| Release de Qwen-Image 2.1 para ComfyUI | 7B DiT + 8B text encoder | no disponible | safetensors para ComfyUI | Qwen Research (no comercial) | Inferencia en ComfyUI |
| Viggle/Qwen-Image-2.1-viggle-turbo | no disponible | no disponible | LoRA | Qwen Research (no comercial) | Aceleración a 4 pasos |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es un checkpoint de inferencia: el transformer es una caché NF4 que solo reconstruye el LoRAlab y no funciona con `from_pretrained`.
- Licencia Qwen Research: uso exclusivamente no comercial (investigación o evaluación), tanto para esta conversión como para el Viggle Turbo LoRA incluido.
- La variante NF4 del text encoder introduce un error de aproximadamente el 24 % por token frente a BF16 y la INT8 de aproximadamente el 9 %; usar NF4 para pre-caché degrada el condicionamiento respecto al que verá el modelo en inferencia con BF16.
- La variante BF16 completa exige unos 15,5 GB de VRAM; por debajo de esa cifra hay que recurrir al offload a CPU, con la penalización de velocidad correspondiente.
- El paquete no documenta sesgos, tasas de alucinación ni cobertura idiomática; esa información depende de Qwen-Image 2.1 y no está disponible aquí.
- El tamaño del repositorio (36,1 GB) implica una descarga considerable; el LoRAlab descarga solo la variante del text encoder seleccionada.
- Dependencia de la herramienta propietaria del flujo: los LoRAs exportados usan claves diffusers/PEFT con `alpha` por capa y se han verificado en ComfyUI, pero el entrenamiento queda ligado al LoRAlab de AcademiaSD.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AcademiaSD/Qwen-Image-2.1-NF4-for-LoRA-Training
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Viggle Turbo LoRA: https://huggingface.co/Viggle/Qwen-Image-2.1-viggle-turbo
- Organización Qwen en Hugging Face: https://huggingface.co/Qwen
- Organización Viggle en Hugging Face: https://huggingface.co/Viggle
- YouTube de AcademiaSD: https://www.youtube.com/@Academia_SD
- X de AcademiaSD: https://twitter.com/Academia_S_D
- Discord de AcademiaSD: https://discord.gg/Syuaduy678
- Ko-Fi de AcademiaSD: https://ko-fi.com/academiasd
