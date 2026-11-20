# DmitryDB/Wan-ComfyUI-Quants

## Resumen
Este repositorio, publicado por DmitryDB, no es un modelo entrenado desde cero, sino una coleccion de checkpoints de difusion cuantizados a int8 para su uso en ComfyUI, junto con los ficheros auxiliares necesarios para ejecutar los modelos Wan 2.1 y Wan 2.2 de generacion de video. El autor indica explicitamente que no se trata de releases oficiales de upstream y que la subida no incluye nuevas pruebas de inferencia ni de rendimiento. Su relevancia practica es la de reducir el peso en VRAM de checkpoints de 14B y 5B para poder ejecutarlos en GPUs de consumo dentro de flujos ComfyUI, manteniendo los nombres y bytes originales de los checkpoints.

La coleccion cubre text-to-video (T2V), image-to-video (I2V), TI2V 5B, Animate, S2V, y derivados Fun (Camera, Control, Inpaint, VACE), ademas de ediciones de la comunidad (Bernini-R, ChronoEdit, Remix, SmoothMix, SVICam) y LoRAs opcionales de DPO y relight para SCAIL-2. Los modelos Wan originales son difusiones de video de 14B (y variantes de 5B) publicadas por Wan-AI y reempaquetadas por Comfy-Org; este repositorio solo redistribuye copias cuantizadas.

La informacion disponible es fundamentalmente logistica: lista de ficheros, tamanos, emparejamiento de VAE y text encoders, y grafos de condicionamiento requeridos. No hay datos de arquitectura interna, entrenamiento, benchmarks ni licencia concreta mas alla de "other", por lo que muchos campos de esta ficha quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | difusion para generacion de video (variantes Wan 2.1 y Wan 2.2); detalles internos no disponibles |
| Parametros totales | 14B (variantes 14B) y 5B (variantes TI2V y Fun 5B); no disponible para derivados comunitarios |
| Parametros activos | no disponible (no se documenta si hay MoE; Wan 2.2 14B usa pareja high/low noise como dos expertos separados, no un MoE en un solo checkpoint) |
| Longitud de contexto | no disponible (modelo de difusion de video, no LLM) |
| Tipos de cuantizacion | int8 (sufijo `int8`, `int8-lean-Convrot`, y algunos derivados `from-fp8`); bf16 en text encoder, VAE y LoRAs |
| Idiomas soportados | no disponible (prompts gestionados por UMT5-XXL; idiomas no declarados) |
| Licencia | other (sin terminos concretos en la informacion disponible) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
Los checkpoints pertenecen a la familia Wan de modelos de difusion para video. Wan 2.1 incluye T2V 14B, I2V 14B 720p y SCAIL-2 (transferencia de movimiento con condicionamiento de pose). Wan 2.2 introduce variantes 14B T2V e I2V que se ejecutan como pareja de expertos high noise / low noise, con el modelo high aplicado primero en el schedule, y una variante TI2V 5B de un solo checkpoint. Tambien existen derivados Fun (Camera, Control, Inpaint, VACE) en 14B y 5B, Animate, S2V y ediciones comunitarias.

No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF/DPO en los modelos base. El repositorio unicamente aplica cuantizacion int8 (con variantes "lean" y "Convrot") sobre pesos ya publicados, y en algunos casos parte de fp8. Las LoRAs incluidas para SCAIL-2 (DPO y relight) son bf16 y opcionales. El autor advierte que las notas incluidas son historicas y no constituyen resultados de validacion.

## Capacidades
- Generacion de video a partir de texto (T2V) con variantes Wan 2.1 y Wan 2.2 de 14B.
- Generacion de video a partir de imagen (I2V), incluida la variante 720p de Wan 2.1 y las parejas high/low de Wan 2.2.
- Generacion combinada texto+imagen a video (TI2V) con el checkpoint unico de 5B.
- Transferencia de movimiento con SCAIL-2 (Wan 2.1) usando condicionamiento de pose.
- Animacion y reenactment con Wan 2.2 Animate y S2V (este ultimo requiere Wav2Vec2).
- Control fino mediante derivados Fun: Camera (control de camara), Control (señales de control), Inpaint (relleno de regiones) y VACE (edicion y composicion).
- Edicion y variantes comunitarias: Bernini-R, ChronoEdit, Remix I2V, SmoothMix T2V, SVICam.
- LoRAs opcionales de DPO y relight sobre SCAIL-2.
- No se documentan tool calling, agentes, thinking mode, vision sobre imagenes estaticas ni audio generativo; el audio se limita al encoder Wav2Vec2 usado por S2V.

## Casos de uso
- Generacion de clips publicitarios a partir de un brief de texto: usar la pareja T2V high/low de Wan 2.2 14B en ComfyUI, aplicando primero el high noise en el schedule para obtener videos coherentes de varios segundos.
- Animacion de fotografia de producto o retrato: emplear I2V 720p de Wan 2.1 con CLIP Vision H y el workflow de condicionamiento por imagen, util para catalogos y demos.
- Transferencia de movimiento para VFX o danza: usar SCAIL-2 con el grafo de condicionamiento de pose, apoyandose en las LoRAs de DPO y relight para ajustar estilo e iluminacion.
- Control de camara en previsualizacion cinematografica: desplegar los checkpoints Fun Camera high/low de 14B para generar tomas con movimientos de camara especificos sin rodaje.
- Relleno y edicion de video (inpainting): usar Fun Inpaint 5B o 14B para eliminar objetos o reconstruir regiones en material ya rodado, aprovechando la cuantizacion int8 para reducir VRAM.
- Reenactment con audio: combinar S2V 14B con Wav2Vec2 para sincronizar movimiento labial y gestos con una pista de voz, en prototipos de avatares.
- Iteracion rapida en estaciones de trabajo modestas: cargar TI2V 5B int8 (4,7 GiB) en GPUs de consumo para pruebas de concepto antes de escalar a los 14B.
- Composicion y edicion guiada por video de referencia: usar Fun VACE 14B high/low para recomposicion y edicion condicionada en pipelines de postproduccion.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que la subida no constituye nueva inferencia ni pruebas de rendimiento, y que las notas son historicas y no resultados de validacion.

## Requisitos de hardware
- VRAM estimada: los checkpoints int8 de 14B ocupan entre 13,3 y 16,4 GiB por fichero, y las parejas high/low requieren cargar dos checkpoints (aproximadamente 27-33 GiB en total si se mantienen ambos en VRAM); los 5B int8 ocupan alrededor de 4,7 GiB.
- Ficheros auxiliares: UMT5-XXL bf16 pesa 10,6 GiB, CLIP Vision H 1,2 GiB, Wav2Vec2 0,6 GiB, VAE Wan 2.1 0,24 GiB y VAE Wan 2.2 1,3 GiB; hay que sumarlos al presupuesto de VRAM.
- GPU recomendadas: A100 80 GB o H100 para las parejas 14B high/low sin offloading; RTX 4090 (24 GB) puede alojar un checkpoint 14B int8 mas text encoder con tecnicas de offloading; GPUs de 8-12 GB pueden ejecutar los 5B int8 con gestion cuidadosa.
- Cabe en GPU de consumo: si para los 5B int8 y, con offloading, para un unico 14B int8; las parejas high/low de 14B exigen mas VRAM o descarga parcial a RAM.
- Despliegue: ComfyUI es el entorno previsto; los checkpoints estan pensados para los loaders de ComfyUI con soporte de la cuantizacion int8 correspondiente. No se documentan opciones vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusion de video en este formato).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan 2.1 / 2.2 (este repositorio, int8) | 14B y 5B | no disponible | no disponible (sin benchmarks) | other | Hugging Face, ComfyUI |
| Wan-AI/Wan2.1-I2V-14B-720P (upstream) | 14B | no disponible | no disponible en esta informacion | no disponible | Hugging Face |
| Wan-AI/Wan2.2-I2V-A14B (upstream) | 14B (pareja high/low) | no disponible | no disponible en esta informacion | no disponible | Hugging Face |
| Comfy-Org/Wan_2.2_ComfyUI_Repackaged | 14B y 5B | no disponible | no disponible en esta informacion | no disponible | Hugging Face |

La diferencia principal frente a los upstream es el formato: este repositorio entrega pesos int8 listos para ComfyUI, mientras que los originales se distribuyen en precision completa o fp8. No hay datos para comparar calidad o velocidad.

## Limitaciones y advertencias
- No son releases oficiales: el autor lo declara explicitamente; la responsabilidad de validacion recae en el usuario.
- Sin benchmarks ni pruebas de rendimiento: no hay evidencia publicada de calidad o velocidad tras la cuantizacion int8.
- Licencia "other" sin terminos concretos: antes de uso comercial hay que consultar las licencias de los modelos upstream (Wan-AI) y de Comfy-Org, no solo este repositorio.
- Riesgo de incompatibilidad de workflows: mezclar parejas high/low de variantes distintas, usar el VAE equivocado (Wan 2.1 frente a Wan 2.2) o sustituir checkpoints Fun sin revisar el grafo puede producir resultados incorrectos.
- Dependencia de encoders externos: UMT5-XXL, CLIP Vision H, Wav2Vec2 y VAEs deben emparejarse segun la variante; su ausencia o version incorrecta rompe la inferencia.
- Contenido para adultos: algunos derivados comunitarios incluyen etiquetas NSFW; revisar politicas antes de desplegar.
- Idiomas no declarados: la cobertura multilingue de los prompts depende de UMT5-XXL y no esta documentada aqui.
- Riesgo de alucinacion visual: los modelos de difusion pueden generar artefactos, incoherencias temporales o detalles no solicitados; no se documentan sesgos conocidos.
- Fechas de creacion y actualizacion (2026) y contadores de descargas/likes a cero: tratar con cautela cualquier expectativa de soporte o comunidad activa.

## Enlaces
- Repositorio: https://huggingface.co/DmitryDB/Wan-ComfyUI-Quants
- Wan 2.1 I2V 14B 720P upstream: https://huggingface.co/Wan-AI/Wan2.1-I2V-14B-720P
- Comfy-Org Wan 2.1 repackaged: https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged
- Comfy-Org SCAIL-2: https://huggingface.co/Comfy-Org/SCAIL-2
- Wan 2.2 I2V A14B upstream: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
- Comfy-Org Wan 2.2 repackaged: https://huggingface.co/Comfy-Org/Wan_2.2_ComfyUI_Repackaged
- Comfy-Org Bernini-R: https://huggingface.co/Comfy-Org/Bernini-R
- NVIDIA ChronoEdit 14B: https://huggingface.co/nvidia/ChronoEdit-14B-Diffusers
- SCAIL-2 (zai-org): https://huggingface.co/zai-org/SCAIL-2
