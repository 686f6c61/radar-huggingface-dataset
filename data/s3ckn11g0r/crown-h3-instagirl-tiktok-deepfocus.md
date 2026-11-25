# S3ckn11g0r/CROWN-H3-InstaGirl-TikTok-DeepFocus

## Resumen

CROWN-H3-InstaGirl-TikTok-DeepFocus es un adaptador LoRA para el modelo de generación de vídeo MiniMax-H3, desarrollado por el usuario NineCrowns (S3ckn11g0r) y publicado en Hugging Face. No es un modelo fundacional, sino un ajuste fino de bajo rango que modifica el comportamiento estilístico del modelo base MiniMax-H3 en tareas de texto-a-vídeo, con especial énfasis en la estética de vídeo vertical grabado con móvil (formato TikTok, Douyin y Shorts).

El LoRA aborda tres problemas concretos del modelo base: la iluminación de estudio sintética por defecto, el aspecto de piel plástico o aceitoso y el desenfoque de fondo tipo bokeh con apertura amplia. Para ello fuerza una profundidad de campo profunda (equivalente a f/8.0 de un iPhone 16 Pro), textura de piel mate con microdetalle y movimiento corporal natural de tipo "outfit check" con giros de 45 grados del rostro. El disparador es el token `crown_instagirl_real`.

El peso del adaptador ocupa 910 MB en un único archivo safetensors (rango 64, alpha 64) y se entrenó sobre bloques de vídeo específicos (10 a 49) del transformer de MiniMax-H3. Su relevancia es acotada: es una pieza de estilo para pipelines de generación de vídeo vertical fotorrealista, no una alternativa a modelos generalistas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer de difusión de vídeo MiniMax-H3 |
| Parametros totales | no disponible (adaptador de 910 MB; el modelo base no se detalla) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base MiniMax-H3) |
| Tipos de cuantizacion | no disponible para el LoRA; el base se usa en bf16 (transformer y text encoder) y VAE en fp32 |
| Idiomas soportados | no disponible (el prompt se procesa con el text encoder Qwen3-VL 32B del base) |
| Licencia | bespoke-lora-license (licencia personalizada, enlace a Civitai del autor) |
| Formato de pesos | safetensors (`CROWN_H3_InstaGirl_TikTok_DeepFocus_V1_r64.safetensors`) |
| Rango / alpha | 64 / 64 |
| Bloques objetivo | bloques de vídeo 10 a 49 (video-only) |
| Resolucion de entrenamiento | 768×1344 (o 1344×768) |
| Tamano del repo | 1.0 GB |
| Modelo base | MiniMaxAI/MiniMax-H3 (relacion: adapter) |
| Pipeline | text-to-video |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 y alpha 64 aplicado exclusivamente a los bloques de vídeo 10 a 49 del transformer de MiniMax-H3, según la model card. Se entrenó con el "Ostris De-Distillation Adapter", un componente de terceros que el autor menciona pero no detalla. El entrenamiento se realizó en un clúster de 8 GPU NVIDIA B200.

Los datos de entrenamiento, según el autor, son 100 % metraje real sin marca de agua, nativo en 1080p/4K, procedente de vídeos verticales de Douyin, TikTok y Shorts: contenido de moda diaria (OOTD) y escenas cándidas de calle e interior grabadas con cámara real. El entrenamiento se hizo a resolución 768×1344. No se especifican el número de tokens, el número de pasos ni la composición exacta del dataset, ni si hubo etapas de RLHF o DPO (no aplicables en un ajuste de estilo de difusión).

La innovación técnica declarada es estilística más que arquitectónica: forzar profundidad de campo profunda en todas las escenas, sustituir la iluminación especular sintética por luz ambiente natural y preservar la geometría facial en giros de 45 grados. El autor indica que el LoRA funciona con las tres variantes del base: Ref2VA (referencia a vídeo), I2VA (imagen a vídeo) y T2VA (texto a vídeo).

## Capacidades

- Generación de vídeo vertical fotorrealista a partir de texto, imagen o referencia, heredando las capacidades del modelo base MiniMax-H3.
- Estilo visual "cámara de móvil": profundidad de campo profunda con fondo nítido de principio a fin, sin bokeh de apertura amplia.
- Textura de piel mate con microdetalle y poros, sin brillos especulares de tipo CGI.
- Movimiento corporal natural de tipo "fit check" y "body sway" con giros de 3/4 de rostro.
- Coherencia de escena en planos verticales de interior y calle (paredes, puertas, mobiliario y arquitectura urbana nítidos).
- Compatibilidad con los modos de referencia del base (Ref2VA, I2VA, T2VA).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni audio propio del adaptador; cualquier capacidad de este tipo provendría del modelo base y no está descrita en la información disponible.

## Casos de uso

- Contenido de moda para redes sociales: generar clips verticales de "outfit of the day" con estética de grabación cándida con móvil, usando el disparador `crown_instagirl_real` y pesos de LoRA entre 0.70 y 0.80.
- Prototipado de anuncios para TikTok, Reels y Shorts: producir variantes de vídeo vertical con iluminación natural y fondo nítido que imiten metraje real de creador, reduciendo la sensación de render sintético.
- Pruebas de vestuario y estilismo: generar tomas de cuerpo completo con movimiento de balanceo y giro de 45 grados para evaluar siluetas y combinaciones antes de un rodaje real.
- Previsualización de localizaciones: usar el modo imagen-a-vídeo del base con este LoRA para convertir una foto de interior o calle en un clip con profundidad de campo realista y arquitectura nítida.
- Creación de bancos de metraje vertical de stock: generar clips de 768×1344 con coherencia de escena para su uso en edición posterior.
- Investigación sobre control de estilo en difusión de vídeo: estudiar cómo un LoRA de rango 64 sobre bloques concretos (10-49) altera iluminación, profundidad de campo y textura de piel sin reentrenar el modelo base.
- Integración en flujos ComfyUI: el autor publica un workflow en la nube de RunningHub, lo que permite probar el adaptador sin infraestructura local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card solo aporta una configuración de inferencia de referencia: resolución 768×1344 (o 1344×768), 25 pasos, sampler euler con scheduler beta, cfg 1.0, `MiniMaxH3SigmaShift` con shift_video 12.0 y shift_audio 3.0, y peso de LoRA recomendado de 0.70 a 0.80 (el vídeo de muestra se generó a 0.75 sin otros LoRA). No se indican latencias ni throughput.

## Requisitos de hardware

- El adaptador pesa 910 MB, pero la inferencia requiere cargar el modelo base MiniMax-H3 completo: transformer `minimax_h3_ref2va_bf16.safetensors`, text encoder `qwen3vl_32b_minimax_h3_bf16.safetensors` (Qwen3-VL de 32B en bf16) y VAE `minimax_h3_video_vae_fp32.safetensors`.
- La VRAM necesaria para el base completo no está indicada en la información disponible; el text encoder de 32B en bf16 por sí solo implica decenas de GB.
- El autor entrenó en 8 GPU NVIDIA B200, lo que sugiere que el modelo base es de gran escala y no está pensado para GPU de consumo.
- No hay datos sobre ejecución en RTX 4090, A100 u H100 con este adaptador; no se puede confirmar que quepa en GPU de consumo.
- Opciones de despliegue: ComfyUI (flujo nativo del autor), con workflow en la nube de RunningHub; no se documentan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un pipeline de difusión de vídeo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros LoRA de estilo para MiniMax-H3 ni datos comparables de rendimiento, por lo que no es posible establecer una comparativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia `bespoke-lora-license`: es una licencia personalizada, no estándar; el enlace apunta al perfil de Civitai del autor. Es imprescindible revisar los términos antes de cualquier uso comercial.
- El adaptador está especializado en un único estilo (vídeo vertical de moda/cándido con móvil); fuera de ese dominio puede degradar la estética del modelo base.
- El peso recomendado es estrecho (0.70-0.80); valores fuera de rango pueden producir artefactos o perder el efecto.
- Depende por completo de MiniMax-H3: cualquier limitación del base (resolución, duración, coherencia temporal, sesgos) se hereda.
- Riesgo de contenido no verificado: el dominio (personas fotorrealistas en vídeo vertical) plantea cuestiones de consentimiento, derechos de imagen y posibles usos engañosos; la model card no documenta salvaguardas.
- No hay información sobre sesgos demográficos, de género o culturales del dataset de entrenamiento.
- Riesgo de alucinación visual: como todo modelo generativo de vídeo, puede producir anatomía inconsistente, texto ilegible en escena o física implausible.
- Idiomas soportados no documentados; el comportamiento multilingüe depende del text encoder del base.
- El repositorio incluye enlaces a servicios de terceros (RunningHub, h3xron.xyz); su disponibilidad, seguridad y condiciones no están verificadas.

## Enlaces

- Hugging Face: https://huggingface.co/S3ckn11g0r/CROWN-H3-InstaGirl-TikTok-DeepFocus
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Civitai del autor: https://civitai.com/models/3044608
- Perfil del autor en Civitai (licencia): https://civitai.com/user/NineCrowns
- RunningHub Global (modelo): https://www.runninghub.ai/model/public/2120439722723020802
- RunningHub Global (workflow ComfyUI): https://www.runninghub.ai/workflow/2120529926519558145
- RunningHub Global (webapp): https://www.runninghub.ai/ai-detail/2120529940713082882
- RunningHub China (modelo): https://www.runninghub.cn/model/public/2120452543603109889
- RunningHub China (workflow): https://www.runninghub.cn/workflow/2120527489066954753
- RunningHub China (webapp): https://www.runninghub.cn/ai-detail/2120527512412442625
- Servicio de terceros mencionado por el autor: https://h3xron.xyz
