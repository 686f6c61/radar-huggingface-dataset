# Jojocodex/wushu-action-v7-minimax-h3-fl2va-ref2va-lora

## Resumen

Wushu Action v7 es un LoRA de estilo para el modelo generativo de vídeo MiniMax-H3, desarrollado por el usuario Jojocodex y publicado en Hugging Face. Su función concreta es especializar el modelo base en la generación de secuencias de artes marciales chinas (wushu), con coreografía de combate, armas tradicionales y terminología técnica de cada movimiento. Se entrenó sobre 924 clips de vídeo seleccionados de wushu, a 832×480 y 24 fps, etiquetados con una taxonomía de tres niveles de términos marciales.

El adaptador está pensado para su uso inmediato en ComfyUI junto con la versión completa (sin podar) del DiT de MiniMax-H3 cuantizada a int8-convrot, y un codificador de texto Qwen3-VL de 32B en bf16. El repositorio incluye además un flujo de trabajo JSON de ComfyUI para escenas de combate con doble muestreo y referencias múltiples, y una lista completa de etiquetas de movimientos para redactar prompts.

La relevancia actual del modelo radica en que demuestra un patrón de especialización vertical sobre modelos de vídeo de gran escala: un LoRA de bajo rango que añade un dominio coreográfico muy concreto (wushu) sin reentrenar el modelo base, con un trigger word (`wushu_action`) y una estructura de prompt muy prescrita que separa la definición de personajes del storyboard por planos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre DiT de MiniMax-H3 (modelo base de difusión para vídeo); codificador de texto Qwen3-VL 32B |
| Parámetros totales | no disponible (el repo ocupa 13,8 GB, incluye LoRA, flujo de trabajo y listado de etiquetas) |
| Parámetros activos | no aplica |
| Longitud de contexto | no disponible (limitada por el número de frames: 124 frames ≈ 5,2 s a 24 fps; debe cumplir 17n+5) |
| Tipos de cuantización | LoRA en safetensors; el modelo base se usa en int8-convrot (34 GB, versión sin podar de Comfy-Org); codificador de texto en bf16 o nvfp4_awq |
| Idiomas soportados | no disponible (los prompts de ejemplo están en inglés y en chino; el codificador Qwen3-VL es multilingüe) |
| Licencia | other (licencia personalizada del autor; no se especifican términos de uso comercial) |
| Formato de pesos | safetensors (LoRA); JSON de flujo de trabajo ComfyUI; Markdown con etiquetas |

## Arquitectura y entrenamiento

El adaptador es un LoRA de bajo rango aplicado sobre el transformer de difusión (DiT) de MiniMax-H3, un modelo de generación de vídeo con audio. El entrenamiento se realizó sobre la versión completa, sin podar, del DiT cuantizada a int8-convrot, junto con el codificador de texto Qwen3-VL de 32B en bf16; según el autor, esta es la configuración de cuantización de mayor fidelidad de las que ha probado. La ficha indica 1000 pasos en la versión E3, aunque el texto en inglés menciona 2000 pasos, una discrepancia que conviene tener en cuenta. El autor señala que ha retirado las versiones anteriores entrenadas sobre una base podada (pruned) y que esta es la que mejor se comporta, aunque no alcanza sus expectativas.

El conjunto de entrenamiento consta de 924 clips de wushu a 832×480 y 24 fps, con etiquetado en tres niveles usando terminología profesional de movimientos (por ejemplo, 扫堂腿, 腾空侧踹, 缠头裹脑, 回马枪). El LoRA incorpora capas de calibración adaln y está diseñado para funcionar con un strength de 0,8 a 1,0. El modelo base es un modelo destilado con CFG, por lo que la inferencia debe hacerse con cfg = 1.0; valores superiores producen artefactos. No se detallan en la información disponible datos sobre el volumen total de tokens, la composición exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de vídeo texto-a-vídeo e imagen-a-vídeo con coreografía de artes marciales: golpes, patadas, proyecciones, armas (espada recta jian, lanza, doble gancho) y secuencias de varios planos.
- Control de la puesta en escena mediante prompts estructurados con bloques `integrated_multimodal_description`, `overall_soundscape` y `non_diegetic_music`.
- Generación de audio sincronizado: el pipeline decodifica vídeo y audio con VAEs separados (vídeo fp16 y audio fp32) y exporta MP4 con pista de sonido.
- Coherencia de personajes entre planos mediante un bloque de definición de personajes (aspecto, ropa, complexión, arma) separado del storyboard.
- Vocabulario técnico de wushu: el repositorio incluye una lista completa de etiquetas de movimientos para construir prompts precisos.
- Combate entre dos personajes con referencias múltiples y doble muestreo, mediante el flujo de trabajo JSON incluido.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso ni agentes, dado que es un modelo generativo de vídeo.

## Casos de uso

- Previsualización de coreografías de artes marciales: un coordinador de especialistas puede generar secuencias de 5,2 s con movimientos nombrados (por ejemplo, 扫堂腿 seguido de 腾空侧踹) para evaluar el ritmo y el encuadre antes de rodar.
- Creación de contenido para redes y canales de artes marciales: clips verticales a 480×832 con audio integrado, generados a partir de un prompt de tres planos y exportados directamente en MP4.
- Storyboarding de escenas de acción para cine o animación: el bloque de personajes fijo y el storyboard por planos permiten mantener la continuidad visual entre planos de una misma secuencia de combate.
- Prototipado de videojuegos de lucha: generación de animaciones de referencia para movimientos concretos que luego se recrean o se usan como guía de animación.
- Demostraciones educativas de técnicas de wushu: el vocabulario etiquetado permite generar ejemplos visuales de técnicas específicas con su nombre correcto.
- Pruebas de pipelines de generación de vídeo en ComfyUI: el flujo JSON incluido sirve como base para experimentar con referencias múltiples, doble muestreo y LoRAs auxiliares (Combat-Base-V2, Motion Continuity Repair, Spatial & Physics).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El modelo base int8-convrot ocupa 34 GB, por lo que la inferencia requiere una GPU con al menos 40 GB de VRAM (A100 40/80 GB, H100, L40S) para cargar el DiT completo junto con el codificador de texto.
- El codificador de texto Qwen3-VL de 32B en bf16 añade una carga de VRAM considerable; existe una variante nvfp4_awq que reduce este requisito.
- No se indica que quepa en GPU de consumo (RTX 4090 de 24 GB) con la configuración completa; no hay datos sobre variantes más ligeras del modelo base.
- Despliegue previsto en ComfyUI: UNet Loader, LoraLoader, CLIPLoader, doble VAE (vídeo fp16 y audio fp32), KSampler y Save Video.
- Parámetros de muestreo recomendados: sampler euler, scheduler simple, 25 pasos (4-8 con el modelo base turbo), cfg 1.0, denoise 1.0, resolución 832×480 o 480×832, 124 frames (17n+5) a 24 fps.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto / duración | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wushu Action v7 (este) | LoRA de estilo para vídeo | MiniMax-H3 | 124 frames ≈ 5,2 s a 24 fps | other | Hugging Face, 19.375 descargas, 91 likes |
| Combat-Base-V2 (JOKER141) | LoRA de combate | MiniMax-H3 (presumiblemente) | no disponible | no disponible | mencionado por el autor como complementario |
| Motion Continuity Repair LoRA | LoRA de corrección de movimiento | MiniMax-H3 (presumiblemente) | no disponible | no disponible | mencionado por el autor como complementario |
| Spatial & Physics LoRA | LoRA de coherencia física | MiniMax-H3 (presumiblemente) | no disponible | no disponible | mencionado por el autor como complementario |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El propio autor indica que el resultado no alcanza sus expectativas y que planea una nueva versión con más material y movimientos; esta versión debe considerarse una iteración intermedia.
- Con pocos pasos de muestreo la imagen sale borrosa; hay que aumentar los pasos o usar plugins de reparación.
- El modelo base es destilado con CFG: usar cfg superior a 1.0 produce resultados defectuosos de forma sistemática.
- El número de frames debe cumplir la fórmula 17n+5; otras duraciones no son válidas.
- La licencia es "other" y no se especifican términos de uso comercial; conviene verificar las condiciones antes de un uso productivo.
- Riesgo de alucinación visual y de errores anatómicos o de continuidad en secuencias de combate complejas, habitual en modelos de difusión de vídeo; no hay datos publicados sobre sesgos.
- El adaptador está entrenado específicamente para wushu; fuera de ese dominio su efecto sobre el modelo base es incierto.
- El repositorio ocupa 13,8 GB e incluye archivos auxiliares (flujo de trabajo JSON y listado de etiquetas) además de los pesos del LoRA.
- Dependencia de una pila de software concreta (ComfyUI, versión int8-convrot del modelo base, codificador Qwen3-VL 32B), lo que limita la portabilidad a otros entornos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jojocodex/wushu-action-v7-minimax-h3-fl2va-ref2va-lora
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
