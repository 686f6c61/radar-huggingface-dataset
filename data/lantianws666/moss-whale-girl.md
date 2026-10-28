# lantianws666/moss-whale-girl

## Resumen

`lantianws666/moss-whale-girl` es un LoRA de personaje para generación de imágenes (text-to-image) publicado en HuggingFace, que añade a MOSS-Image un personaje anime concreto: "DS Whale Girl" (鲸鱼娘), una chica Q-style (proporciones chibi) con cabello largo ondulado en degradado azul, orejas de aleta de ballena, traje de sirvienta azul marino con delantal blanco y cola de ballena azul profundo. El adaptador, de 141,8 MB en bf16 con rank 32, se entrena sobre el modelo base `OpenMOSS-Team/MOSS-Image-Base` y resuelve el problema clásico de consistencia de personaje: permite generar al mismo personaje en distintas poses, vestuarios y escenas mediante una palabra disparadora (`moss_whalegirl`).

Su relevancia es principalmente para el ecosistema de MOSS-Image: al ser Apache-2.0 y estar integrado con `diffusers` y con el Space `mrfakename/moss-image`, puede probarse sin GPU local. Conviene tener en cuenta que es una publicación muy reciente (28/10/2026) con 0 descargas y 0 likes, es decir, sin validación comunitaria todavía, y que solo es compatible con MOSS-Image, no con SDXL ni SD1.5.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusión text-to-image con scheduler flow matching |
| Parámetros totales | ≈71 millones para el adaptador (estimado a partir de 141,8 MB en bf16); modelo base: no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo text-to-image) |
| Tipos de cuantización | bf16 (sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible (los prompts de ejemplo están en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) |
| Modelo base | OpenMOSS-Team/MOSS-Image-Base |
| Rank / Alpha | 32 / 32 |
| Tamaño del repositorio | 0,1 GB (archivo `moss_whale_v2.safetensors`, 141,8 MB) |
| Palabra disparadora | `moss_whalegirl` |
| Compatibilidad | Solo MOSS-Image; no compatible con SDXL ni SD1.5 |
| Ajustes recomendados | Peso del LoRA 0,85; resolución 1024x1536; 30 pasos; CFG 3,0; `uncond_skip_layers` [22] |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rank 32 y alpha 32 inyectado sobre MOSS-Image-Base, un modelo de difusión text-to-image que, según la configuración de entrenamiento publicada, se entrena y se usa con scheduler flow matching y admite el parámetro `uncond_skip_layers` (el autor recomienda `[22]` en inferencia). El text encoder permanece congelado (no se entrena), de modo que el adaptador solo modifica las capas de difusión del modelo base. Todo el entrenamiento se realizó en precisión bf16 con la herramienta ai-toolkit.

El dataset de entrenamiento es muy reducido: 25 imágenes durante 1500 pasos, a resolución 1024 y con learning rate de 1e-4 (0,0001). El etiquetado se hizo automáticamente con el tagger WD `wd-eva02-large-tagger-v3` complementado con tags manuales de identidad, una práctica habitual en LoRAs de personaje para reforzar la asociación entre la palabra disparadora y los rasgos del personaje (cabello degradado azul, orejas de aleta de ballena, ahoge, traje de sirvienta, cola de ballena).

## Capacidades

- Generación de un personaje anime concreto y consistente: cabello largo ondulado con degradado de azul profundo a azul claro, orejas de aleta de ballena a ambos lados, ahoge único, ojos azules, lazos de pelo azules, traje de sirvienta azul marino con delantal y tocado blancos con volantes, broche de gema azul con bordados dorados, cola de ballena azul profundo, medias blancas hasta el muslo y zapatos Mary Jane azul marino, con proporciones Q-style.
- Consistencia de identidad entre generaciones mediante la palabra disparadora `moss_whalegirl`, que debe iniciar el prompt.
- Intercambio de vestuario manteniendo los rasgos de identidad del personaje (ejemplos documentados: sudadera blanca casual, uniforme escolar con falda de cuadros, bañador azul de una pieza).
- Composición de escenas con iluminación cinematográfica, con prompts de ejemplo incluidos (playa a la hora dorada con contraluz y lens flare; mar nocturno con cielo estrellado, vía láctea y plancton bioluminiscente).
- Integración con la librería `diffusers` y con el pipeline nativo `MOSSImagePipeline` (vía `ModelConfig` con `arch="moss_image"` e `InferenceLoRA`).
- Uso en HuggingFace Spaces sin instalación local, pasando el repo id al campo `lora_repo` del Space `mrfakename/moss-image`.
- No es un modelo de propósito general: genera exclusivamente este personaje y no incluye capacidades de edición, inpainting u otras tareas (no disponible en la información proporcionada).

## Casos de uso

- Creación de ilustraciones de personaje consistentes: generación de fichas de personaje (character sheets) en cuerpo completo a 1024x1536 con fondo blanco simple, útil para documentar el diseño antes de producir variaciones.
- Avatares e identidad visual para VTubers o comunidades: al mantener la identidad con la palabra disparadora, se pueden generar múltiples imágenes del mismo personaje en distintas escenas y vestuarios para redes sociales o banners de canal.
- Desarrollo de novelas visuales o juegos indie: producción de sprites del personaje en diferentes atuendos (casual, escolar, baño) y escenarios, sustituyendo solo la sección de vestuario del prompt para mantener coherencia visual entre escenas.
- Ilustración de escenas con ambientación elaborada: los prompts de ejemplo incluidos (hora dorada en la playa, mar estrellado nocturno) sirven como plantilla para ilustraciones de paisaje con el personaje integrado, con control de iluminación cinematográfica.
- Prueba del ecosistema MOSS-Image sin hardware propio: el Space `mrfakename/moss-image` acepta este LoRA mediante `lora_repo` y `lora_scale`, lo que permite evaluar el personaje desde el navegador sin GPU local.
- Iteración de diseño de personaje: ajustando el peso del LoRA entre 0,7 y 1,0 se controla el equilibrio entre fidelidad al vestuario original y saturación del color, útil para explorar variantes del diseño.
- Material gráfico para proyectos de fans o merchandising: la licencia Apache-2.0 de los pesos permite uso comercial del adaptador (conviene verificar también los términos del modelo base y de la página de Civitai original).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un LoRA de generación de imágenes, las métricas habituales de LLM (MMLU, HumanEval, GSM8K) no aplican; la calidad se puede evaluar únicamente a través de las cuatro imágenes de muestra incluidas en el repositorio.

## Requisitos de hardware

- El adaptador ocupa 141,8 MB en disco y añade aproximadamente 71 millones de parámetros en bf16 a la VRAM; la memoria total de inferencia depende del modelo base MOSS-Image-Base, cuyas especificaciones de tamaño no están disponibles en la información proporcionada.
- La configuración del pipeline nativo admite los flags `quantize` y `quantize_te`, lo que indica que existen opciones de cuantización para reducir memoria, aunque sin detalles publicados.
- La resolución recomendada (1024x1536, vertical) con 30 pasos y CFG 3,0 implica un coste de inferencia superior al de una generación cuadrada a 1024x1024; no se publican cifras de latencia ni throughput (no disponible).
- No se especifican GPU recomendadas ni si funciona en GPUs de consumo concretas (no disponible); al ser un LoRA ligero, el requisito dominante es el del modelo base.
- Opciones de despliegue: `diffusers`, pipeline nativo `MOSSImagePipeline` (con `ModelConfig` y `InferenceLoRA`) y HuggingFace Spaces (`mrfakename/moss-image`) para inferencia gestionada; para entrenamiento o reentrenamiento, ai-toolkit.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Tamaño | Licencia | Notas |
|---|---|---|---|---|---|
| lantianws666/moss-whale-girl | LoRA de personaje anime | MOSS-Image-Base | 141,8 MB | Apache-2.0 | Requiere palabra disparadora; solo compatible con MOSS-Image |
| OpenMOSS-Team/MOSS-Image-Base | Modelo text-to-image completo | — | no disponible | no disponible | Necesario para ejecutar el LoRA; sus specs no están en la información disponible |
| LoRAs de personaje para SDXL / SD1.5 (Civitai y HF) | LoRA de personaje anime | SDXL / SD1.5 | variable | variable | Ecosistemas incompatibles entre sí; este LoRA no funciona con SDXL ni SD1.5 |

Existen numerosos LoRAs de personaje anime comparables para otras bases (SDXL, SD1.5, Pony, Flux), pero no hay datos publicados de este LoRA frente a ellos, por lo que una comparativa de rendimiento: no disponible.

## Limitaciones y advertencias

- La palabra disparadora `moss_whalegirl` es obligatoria: sin ella, el modelo base genera un personaje diferente de cabello azul.
- El peso del LoRA es crítico: por debajo de 0,7 se pierden detalles del vestuario y por encima de 1,0 tiende a sobresaturar la imagen; el valor recomendado es 0,85.
- Incompatibilidad total con SDXL y SD1.5: solo funciona sobre MOSS-Image.
- El pequeño emblema de ballena del delantal no está aprendido en los pesos del LoRA: debe describirse explícitamente en el prompt y puede no aparecer de forma fiable en todas las generaciones.
- Entrenado con solo 25 imágenes y 1500 pasos: es esperable cierta rigidez del personaje, con variabilidad limitada en poses, ángulos y composiciones no cubiertas por el dataset.
- Publicación muy reciente (28/10/2026) con 0 descargas y 0 likes: no existe validación comunitaria ni reportes de fallos conocidos (no disponible).
- No se documentan sesgos específicos del adaptador; cualquier sesgo hereda del modelo base MOSS-Image-Base, cuya ficha técnica no está incluida en la información disponible.
- La licencia Apache-2.0 cubre los pesos del LoRA, pero la model card remite a la página de Civitai original para notas de uso y no detalla la licencia del modelo base: antes de cualquier despliegue comercial conviene verificar ambos términos.
- Los prompts de ejemplo están en inglés; no hay información sobre el comportamiento con prompts en castellano (no disponible).

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/lantianws666/moss-whale-girl
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Space de inferencia mencionado en la model card: https://huggingface.co/spaces/mrfakename/moss-image
- Herramienta de entrenamiento ai-toolkit: https://github.com/ostris/ai-toolkit
- Tagger usado en el etiquetado (wd-eva02-large-tagger-v3): https://huggingface.co/SmilingWolf/wd-eva02-large-tagger-v3
- Página de Civitai original: mencionada en la model card, pero el enlace no está incluido en la información disponible.
