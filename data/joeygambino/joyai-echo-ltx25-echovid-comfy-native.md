# joeygambino/joyai-echo-ltx25-echoVid-comfy-native

## Resumen

JoyAI-Echo x LTX-2.5 (echoVid) es un modelo de generación de vídeo con audio sincronizado, resultado de una fusión quirúrgica entre el transformer de LTX-2.5 de Lightricks y el fine-tune JoyAI-Echo de jdopensource. El objetivo es combinar la capacidad de LTX-2.5 para generar imagen y sonido en una sola pasada con la calidad interpretativa de JoyAI-Echo: sincronización labial natural, expresiones faciales y una voz estable a lo largo de la secuencia. El modelo se distribuye en formato comfy-native, es decir, con cuantizaciones nativas de ComfyUI (int8, w4a8, w4a4, nvfp4 y mezclas), pensadas para ejecutarse directamente con el nodo estándar Load Diffusion Model sin cargadores personalizados.

El autor, joeygambino, ha trasplantado el delta de atención y feed-forward de JoyAI-Echo sobre el transformer oficial de LTX-2.5 dev y ha horneado la LoRA destilada oficial de LTX-2.5 a una fuerza de 0.5, de modo que el resultado son ficheros de pocos pasos con la misma velocidad, VRAM y nodos que LTX-2.5 destilado. No se ha realizado ningún reentrenamiento; es una fusión de pesos. Se ofrecen dos dosis de intensidad del delta (070T30 por defecto y 100T50 más fuerte) para ajustar el equilibrio entre naturalidad y expresividad. El repositorio principal contiene las variantes comfy-native, mientras que existe un repositorio hermano con ficheros GGUF para tarjetas gráficas más modestas.

La relevancia de este modelo radica en que permite obtener las capacidades de actuación de JoyAI-Echo (lip-sync, expresiones, voz consistente) sobre la infraestructura de LTX-2.5, que ya es capaz de generar vídeo y audio de forma conjunta y a longitudes arbitrarias. Al estar cuantizado y optimizado para ComfyUI, democratiza el acceso a generación de vídeo con audio de alta calidad en hardware de consumo, algo que hasta ahora requería grandes clústeres.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) con atención y feed-forward, más VAE de vídeo y audio (basado en LTX-2.5) |
| Parametros totales | 22B (estimado, heredado de LTX-2.5; no confirmado en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | Generación de vídeo de longitud arbitraria (según la card); sin cifra concreta |
| Tipos de cuantizacion | int8, w4a8, w4a4, nvfp4 (RTX 50), mixed 4x8 (13.8 GB y 17.0 GB) |
| Idiomas soportados | no disponible |
| Licencia | ltx-2.x-community-license |
| Formato de pesos | safetensors (comfy-native) y GGUF (repositorio hermano) |

## Arquitectura y entrenamiento

El modelo es una fusión de dos modelos base: Lightricks/LTX-2.5 (el motor de generación) y jdopensource/JoyAI-Echo (un fine-tune de LTX-2.3). Ambos transformers son idénticos en forma, lo que permite trasplantar el delta de atención y feed-forward de JoyAI-Echo sobre el transformer de LTX-2.5 dev. Sobre esta fusión se hornea la LoRA destilada oficial de LTX-2.5 (`ltx-2.5-22b-distilled-lora-450`) a una fuerza de 0.5, lo que convierte el modelo en un fichero de pocos pasos (8 pasos en la primera pasada, 3 en la segunda, con euler_ancestral y CFG 1). No se ha realizado ningún reentrenamiento; es una operación de merge y cuantización.

La cuantización comfy-native utiliza la maquinaria de ComfyUI (`comfy_quant` y kernels comfy-kitchen), la misma que emplea la build oficial `int8-convrot` de Lightricks. Esto permite cargar el modelo con el nodo estándar Load Diffusion Model sin necesidad de cargadores personalizados. El repositorio incluye dos dosis de intensidad del delta de JoyAI-Echo: 070T30 (0.7 en atención/FF, 0.3 en tablas de modulación) y 100T50 (1.0 y 0.5), ambas con la LoRA destilada a 0.5. La versión v2 corrige problemas de sobresaturación de la primera build.

## Capacidades

- Generación de vídeo con audio sincronizado en una sola pasada (texto a vídeo y audio).
- Sincronización labial natural y expresiones faciales de alta calidad (heredadas de JoyAI-Echo).
- Voz consistente a lo largo de la secuencia (el timbre se mantiene estable).
- Generación de vídeo de larga duración (minutos) con coherencia cross-modal, según la descripción de JoyAI-Echo.
- Soporte multi-shot con uniones AV-extend (mediante el paquete de nodos Joy-LTX 2.5).
- Cuantizaciones múltiples para adaptarse a diferentes GPUs (int8, w4a8, w4a4, nvfp4, mixed).
- Compatible con ComfyUI 0.32+ sin cargadores personalizados.
- No se mencionan capacidades de tool calling, agentes ni razonamiento multi-step; es un modelo puramente generativo de vídeo.

## Casos de uso

- Creación de contenido para redes sociales: generar clips cortos con un personaje que habla directamente a cámara, con lip-sync natural y voz estable, ideal para vídeos de YouTube Shorts, TikTok o Instagram Reels.
- Doblaje y localización de vídeo: dado un guion, el modelo produce un vídeo con un actor sintético que pronuncia el texto en el idioma deseado, manteniendo la sincronización labial y el tono de voz.
- Prototipado de anuncios publicitarios: los equipos de marketing pueden generar rápidamente vídeos de prueba con un presentador virtual sin necesidad de rodar, ahorrando tiempo y costes.
- Avatares para atención al cliente: un asistente virtual con apariencia humana que responde en vídeo con audio sincronizado, útil para FAQs interactivas o guías de producto.
- Educación y formación: generar lecciones en vídeo con un instructor sintético que explica conceptos, con expresiones faciales y voz consistentes, escalable a múltiples idiomas.
- Entretenimiento interactivo: creación de personajes para juegos o experiencias inmersivas que reaccionan con vídeo y audio en tiempo real, aprovechando la generación de longitud arbitraria.
- Postproducción de vídeo: sustituir o mejorar tomas con problemas de sincronización labial en escenas ya rodadas, usando el modelo como herramienta de corrección.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (como FVD, CLIP score, etc.) ni comparaciones cuantitativas con otros modelos. El autor menciona una revisión ciega de 20+ renders emparejados entre las dos dosis, pero sin datos numéricos públicos.

## Requisitos de hardware

La model card proporciona una tabla de tamaños y tiempos para las distintas cuantizaciones, medida a 960x544, 8 segundos, con upscale x2 a 1920x1088:

- `w4a4` (11.2 GB): cabe en 12 GB (justo) o 16 GB. En RTX 5090 tarda ~87 s; en RTX 3090 ~3121 s (desaconsejado en Ampere).
- `w4a8` (12.5 GB): requiere 16 GB. RTX 5090 ~90 s; RTX 3090 ~580 s.
- `nvfp4` (12.5 GB): solo RTX 50. RTX 5090 ~100 s.
- `mix4x8` 13.8 GB: requiere 16 GB. RTX 5090 110 s; RTX 3090 1685 s.
- `mix4x8` 17.0 GB: requiere 24 GB. RTX 5090 111 s; RTX 3090 3093 s (con offload).
- `int8` (21.5 GB): requiere 32 GB (24 GB justo). RTX 5090 120 s.

La recomendación del autor es: para RTX 50 usar este repositorio; para RTX 30/40 usar el repositorio GGUF (Q5_K_M / Q6_K son 4-8x más rápidos que cualquier variante comfy-native de 4 bits). Se puede activar `--enable-triton-backend` en el lanzamiento de ComfyUI para reducir a la mitad el tiempo de paso en w4a8/int8 si triton está instalado.

Además del modelo DiT, se requieren los VAE de vídeo y audio de LTX-2.5 (bf16) y el text encoder Gemma-4-12B (versión int8-convrot o w4a8 para 16 GB). El modelo completo en formato original ocuparía ~48 GB (según el repo de nodos GGUF de JoyAI-Echo), por lo que estas cuantizaciones son esenciales para hardware de consumo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Audio | Licencia | Formato |
|---|---|---|---|---|---|
| JoyAI-Echo x LTX-2.5 (echoVid) | 22B (est.) | Longitud arbitraria | Sí, sincronizado | ltx-2.x-community | safetensors comfy-native, GGUF |
| LTX-2.5 (Lightricks) | 22B | Longitud arbitraria | Sí | ltx-2.x-community | safetensors, GGUF |
| JoyAI-Echo (jdopensource) | 22B (est.) | Minuto+ | Sí, sincronizado | ltx-2.x-community (heredada) | safetensors, GGUF |

La diferencia principal frente a LTX-2.5 es la calidad interpretativa (lip-sync, expresiones, voz estable) heredada de JoyAI-Echo. Frente a JoyAI-Echo original, este modelo aprovecha el motor de LTX-2.5 con su LoRA destilada, lo que permite generación en pocos pasos y mayor compatibilidad con el ecosistema ComfyUI. No se dispone de comparativas con otros modelos de generación de vídeo como CogVideoX o Mochi en la información proporcionada.

## Limitaciones y advertencias

- Licencia comunitaria (ltx-2.x-community-license): restringe el uso comercial y la redistribución; es necesario revisar los términos exactos de la licencia de Lightricks antes de usar en producción.
- El modelo es una fusión no reentrenada; puede heredar sesgos o artefactos de ambos modelos base, especialmente en escenarios de caras estáticas o expresiones extremas (la dosis 100T50 tiende a contrastes más duros).
- Riesgo de alucinación visual y de audio: como todo modelo generativo, puede producir inconsistencias en objetos, texto o sonidos, especialmente en secuencias largas.
- Los tiempos de inferencia en GPUs Ampere (RTX 30) son muy elevados para las variantes comfy-native; se recomienda usar los ficheros GGUF en ese hardware.
- La variante nvfp4 solo funciona en GPUs RTX 50 (Blackwell).
- No se especifican idiomas soportados; la calidad del lip-sync puede degradarse en idiomas con fonética muy distinta al inglés (idioma probable de entrenamiento de los modelos base).
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un lanzamiento reciente con poco uso verificado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/joeygambino/joyai-echo-ltx25-echoVid-comfy-native
- Repositorio GGUF (Q3_K_M a Q8_0): https://huggingface.co/joeygambino/joyai-echo-ltx25-echoVid-gguf
- Repositorio de la versión dev (sin LoRA horneada): https://huggingface.co/joeygambino/joyai-echo-ltx25-echoVid-dev
- Paquete de nodos y workflows (Joy-LTX 2.5): https://github.com/jlucasmcrell/ComfyUI-JoyLTX25
- Modelo base JoyAI-Echo: https://huggingface.co/jdopensource/JoyAI-Echo
- Modelo base LTX-2.5: https://huggingface.co/Lightricks/LTX-2.5
- Repositorio de nodos GGUF para JoyAI-Echo: https://github.com/RealRebelAI/ComfyUI_JoyAI_Echo_GGUF_Nodes
- Página de modelos del autor: https://huggingface.co/joeygambino/models
