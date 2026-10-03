# ij/PixelTune-MiniMax-H3-LoRA

## Resumen

PixelTune · MiniMax H3 pixel-art LoRA es un adaptador LoRA publicado por el usuario independiente `ij` sobre el modelo de generación de vídeo MiniMax-H3, en su variante distribuida por Comfy-Org. Su función es condicionar el modelo base para producir animación en estilo pixel art con una rejilla de píxel nativa controlada: el entrenamiento se hizo con una rejilla de 4× con interpolación nearest-neighbor, de modo que un lienzo nativo de 128×128 píxeles se genera a 512×512 píxeles reales.

El adaptador tiene 155.058.176 parámetros en FP32 (unos 0,62 GB), con 416 tensores canónicos `lora_A`/`lora_B`, rango 32 y alpha 32, y usa el layout QKV de Comfy en lugar del formato estándar de PEFT. No es un modelo fusionado ni un directorio `save_pretrained`: se carga sobre una instancia ya inicializada de `MiniMaxH3Pipeline` en DiffSynth-Studio.

Es relevante ahora porque demuestra el flujo de trabajo de ajuste fino de estilo sobre un modelo de difusión de vídeo de gran escala con un presupuesto reducido (153 clips activos procedentes de 51 vídeos fuente), y porque documenta con inusual honestidad sus carencias: es un checkpoint experimental de 1.000 pasos de un ciclo previsto de 5.000, sin aprobación final de calidad estética ni de movimiento, sin benchmarks publicados y con 0 descargas en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de bajo rango sobre el transformer de difusión (DiT) de vídeo y audio MiniMax-H3; layout QKV de Comfy |
| Parámetros totales | 155.058.176 (solo el adaptador) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; no es un modelo de lenguaje. En la configuración probada acepta clips de 17n + 5 fotogramas a 24 fps (22, 39, 56…) |
| Tipos de cuantización | El adaptador se publica en FP32; el modelo base probado es `minimax_h3_fl2va_pruned_bf16.safetensors` (BF16). No se documentan cuantizaciones del adaptador |
| Idiomas soportados | en, ko |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors (FP32), 416 tensores `*.lora_A.weight` / `*.lora_B.weight`, rango 32, alpha 32 |
| Rango / alpha | 32 / 32 |
| Modelo base | Comfy-Org/MiniMax-H3, revisión `e5eb578a89295337b8ff433a035929ce0279e0b6`, archivo `diffusion_models/minimax_h3_fl2va_pruned_bf16.safetensors` |
| Revisión del codificador y VAE originales | MiniMaxAI/MiniMax-H3 en `42ed227ee7df40d41602854ae760620d6eb651fe` |
| Pipeline | text-to-video |
| Tamaño del repositorio | 0,6 GB |
| Resolución nativa de entrenamiento | Lados múltiplos de 8; máximo de 1.280 píxeles por lado y 1.048.576 píxeles de área; salida generada a 4× la resolución nativa |
| Muestras publicadas | 320×176 nativo (fuente 0020) y 128×128 nativo (fuente 0054) |
| Fecha de publicación | 2026-10-03 |

## Arquitectura y entrenamiento

El adaptador se inyecta en el DiT del modelo base MiniMax-H3 mediante 416 pares de tensores `lora_A`/`lora_B` con rango y alpha de 32/32, en el orden de QKV que espera Comfy. El autor advierte explícitamente de que no se debe asumir compatibilidad con bases cuyo QKV esté ordenado de otro modo, y de que la carga automática desde ComfyUI no se ha verificado. La integración probada es DiffSynth-Studio en el commit `974cfa37f27ac55eba3b6d10efa21f876900572d`, sobre una instancia de `MiniMaxH3Pipeline` ya inicializada, con `pipe.load_lora(pipe.dit, state_dict=state, alpha=1.0)`.

El entrenamiento (`pixel_h3_full_canvas4_v3`) alcanzó el paso 1.000 de los 5.000 previstos, con 153 clips activos derivados de 51 vídeos fuente y 21 clips de validación, tasa de aprendizaje 5e-5, base congelada en BF16 y adaptador en FP32. La función de pérdida combina flow matching con tres términos adicionales: coherencia de rejilla (coeficiente 1,256806), RGB decodificado (1,662547) y consistencia dentro de los tramos estáticos o `hold` (2,761293). El propio autor aclara que esos coeficientes no son porcentajes de gradiente medidos y que la calibración previa tuvo cobertura limitada tras el filtrado por resolución. La innovación principal es la rejilla de píxel a 4× con nearest-neighbor y un formato de prompt específico (`pxgrid4 native_res_128x128 source_fps_10`, con los campos `integrated_multimodal_description`, `overall_soundscape` y `non_diegetic_music`), que permite declarar el lienzo nativo y generar a cuatro veces esas dimensiones, con soporte de FPS fraccionarios mediante notaciones como `source_fps_8p3333` (25/3).

## Capacidades

- Generación de vídeo corto en estilo pixel art animado a partir de texto, condicionada por el prompt de rejilla nativa y FPS de origen.
- Control de la resolución lógica del píxel: se declara un lienzo nativo (por ejemplo 128×128) y la generación se produce a 4× (512×512), con lados nativos múltiplos de 8.
- Condicionamiento de velocidad temporal mediante la etiqueta de FPS de origen (10 fps, 8,3333 fps, etc.), independiente de los 24 fps de renderizado de la tubería probada.
- Composición de escena estable con cámara fija y fondo fijo; las muestras publicadas son animaciones de un zorro en un bosque a la luz de la luna, con parpadeo y movimiento de cola.
- Prompts multilingües en inglés y coreano.
- El modelo base integra codificador Qwen, VAE de vídeo y VAE de audio, y la tubería dispone de decodificación de audio; en el flujo de trabajo probado por el autor la decodificación de audio se omitió deliberadamente (animación silenciosa).
- Compatibilidad con longitudes de clip de 17n + 5 fotogramas; la aplicación admite inferencias más largas, aunque no están validadas para este checkpoint.
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades de agente: no es un modelo de lenguaje.
- No dispone de modo de razonamiento explícito (`thinking mode`) ni de entrada de audio o vídeo como condición.

## Casos de uso

- Previsualización de sprites y animaciones para videojuegos: se declara un lienzo nativo de 128×128 y se obtiene una animación a 512×512 con píxeles de 4×4, útil para iterar ideas de animación de personajes antes de dibujarlas a mano con una paleta definitiva.
- Prototipado de cinemáticas retro: clips cortos de 22 a 56 fotogramas a 24 fps con cámara fija permiten generar planos de introducción para un prototipo jugable sin equipo de animación.
- Fondos animados en bucle para interfaces o menús: la limitación a cámara fija y fondo estable del entrenamiento encaja con escenas de ambiente (bosque, habitación, paisaje) que se repiten en bucle.
- Generación de material sintético etiquetado para investigación en pixel art: el control explícito de resolución nativa y FPS de origen facilita producir pares prompt-vídeo coherentes para entrenar o evaluar otros modelos.
- Experimentación académica en adaptación de estilo con LoRA: el repositorio incluye `adapter_manifest.json` con hashes y un directorio `evaluation/` con gráficas de pérdida y registros de validación, lo que lo hace útil como caso de estudio reproducible de ajuste fino sobre un DiT de vídeo.
- Exploración de estilo para contenido corto en redes: clips de tres a siete segundos con estética de consola de 8 o 16 bits, siempre que se asuma que la apariencia de detalle fino y el movimiento pueden ser inconsistentes.
- Integración en tuberías DiffSynth-Studio: el flujo de carga documentado permite incorporar el adaptador a un pipeline existente de MiniMax-H3 para añadir un modo pixel art conmutable frente a la generación estándar.
- Investigación sobre condicionamiento temporal: la etiqueta de FPS de origen permite estudiar cómo responde el modelo base a distintas cadencias declaradas sin reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El autor no incluye métricas comparativas (FVD, CLIP, SSIM ni similares) y advierte que una pérdida de validación más baja no demuestra una mejor generación estética. Los únicos datos cuantitativos publicados son los coeficientes de pérdida de entrenamiento (rejilla 1,256806; RGB 1,662547; hold 2,761293) y la configuración de las muestras (semilla 777, 50 pasos de inferencia, CFG 1, `video shift` 12, `audio shift` 3, 39 fotogramas a 24 fps, sin snapping de rejilla, sin reducción de paleta y sin retención de pose).

## Requisitos de hardware

- Peso del adaptador: aproximadamente 0,62 GB en FP32 (155.058.176 parámetros), coherente con el tamaño de repositorio declarado de 0,6 GB.
- VRAM total para inferencia: no disponible. La determina el modelo base MiniMax-H3 y sus VAE de vídeo y audio, cuyas especificaciones no aparecen en la información proporcionada.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible; no hay datos publicados sobre el modelo base ni sobre este adaptador.
- Opciones de despliegue: DiffSynth-Studio (commit `974cfa37f27ac55eba3b6d10efa21f876900572d`) es la única ruta verificada. La carga automática en ComfyUI no se ha verificado. Servidores de inferencia de texto como vLLM, llama.cpp, Ollama o TGI no son aplicables a un adaptador LoRA de un modelo de difusión.
- Latencia y rendimiento: no disponibles. La configuración probada emplea 50 pasos de inferencia con CFG 1 y longitudes de clip de 17n + 5 fotogramas (22, 39, 56…) renderizadas a 24 fps.
- Almacenamiento: el adaptador requiere descargas separadas del modelo base, del codificador Qwen y de los VAE de vídeo y audio.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Duración soportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PixelTune · MiniMax H3 LoRA (este modelo) | Adaptador LoRA de pixel art sobre un DiT de vídeo y audio | 155.058.176 (solo adaptador) | 17n + 5 fotogramas a 24 fps en la configuración probada | minimax-h3-community-license-agreement | HuggingFace; 0 descargas y 0 likes en el momento de redactar |
| MiniMax-H3 sin adaptador (Comfy-Org/MiniMax-H3, `pruned bf16`) | Modelo base de generación de vídeo y audio | No disponible | No disponible | minimax-h3-community-license-agreement | HuggingFace |
| Adaptadores de pixel art para modelos de vídeo referenciados por el dataset de entrenamiento (trojblue/test-HunyuanVideo-pixelart-videos) | Adaptadores de estilo | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de parámetros, contexto, rendimiento ni licencia de alternativas directas de pixel art para modelos de difusión de vídeo dentro de la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Checkpoint experimental: 1.000 pasos de un ciclo previsto de 5.000, sin aprobación final de calidad estética ni de calidad de movimiento.
- Captions de entrenamiento imperfectos: algunas descripciones se referían a la fuente completa y no a la ventana corta exacta de entrenamiento; el autor identificó el problema después de esta ejecución.
- La selección posterior de 23 fuentes revisadas por el propietario no se usó para entrenar este checkpoint, y la pérdida temporal de píxel estático y la recalibración revisada siguen pendientes.
- Los coeficientes de pérdida publicados no son porcentajes de gradiente medidos; la calibración anterior tenía cobertura limitada tras el filtrado por resolución.
- Apariencia de detalle fino, movimiento, estabilidad de las regiones estáticas y límites exactos del píxel pueden ser inconsistentes. Una pérdida de validación más baja no implica mejor resultado visual.
- La calidad en vídeos largos no está validada: el checkpoint se entrenó con clips cortos, aunque la aplicación permita inferencias más largas.
- Riesgo de artefactos y parpadeo temporal (equivalente a la alucinación en modelos de lenguaje): las propias muestras se publican sin snapping de rejilla, sin reducción de paleta y sin retención de pose, precisamente porque esos ajustes no están garantizados por el modelo.
- No hay garantía de alineación nativa de píxel, cadencia de pose ni velocidad física del movimiento a partir de la etiqueta de FPS del prompt.
- La salida se renderiza a 24 fps mientras que el material de entrenamiento se declara con FPS de origen distinto (por ejemplo 10 fps), lo que puede introducir desajustes de cadencia.
- Idiomas limitados a inglés y coreano; no hay evidencia de soporte de castellano en los prompts.
- Licencia sujeta a la MiniMax-H3 Community License Agreement: las condiciones concretas de uso comercial no se detallan en la información proporcionada y deben consultarse antes de un despliegue en producción.
- Compatibilidad frágil: el layout QKV de Comfy impide asumir funcionamiento con bases ordenadas de otra forma, y la carga automática en ComfyUI no está verificada.
- El adaptador no es un directorio PEFT `save_pretrained`, por lo que las utilidades estándar de fusión o carga de PEFT pueden no funcionar directamente.
- Adopción nula registrada (0 descargas, 0 likes) y ausencia total de benchmarks de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ij/PixelTune-MiniMax-H3-LoRA
- Pesos del adaptador: https://huggingface.co/ij/PixelTune-MiniMax-H3-LoRA/blob/main/pixeltune_h3_full_canvas4_v3_step_01000.safetensors
- Manifiesto del adaptador: https://huggingface.co/ij/PixelTune-MiniMax-H3-LoRA/blob/main/adapter_manifest.json
- Registros de evaluación: https://huggingface.co/ij/PixelTune-MiniMax-H3-LoRA/tree/main/evaluation
- Modelo base probado: https://huggingface.co/Comfy-Org/MiniMax-H3
- Modelo base original y revisiones de codificador y VAE: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Dataset de entrenamiento: https://huggingface.co/datasets/trojblue/test-HunyuanVideo-pixelart-videos
- DiffSynth-Studio (commit probado `974cfa37f27ac55eba3b6d10efa21f876900572d`): https://github.com/modelscope/DiffSynth-Studio
- Licencia: archivo `LICENSE` del repositorio (MiniMax-H3 Community License Agreement)
- Búsqueda web: no se han encontrado enlaces relevantes sobre este modelo; los resultados devueltos correspondían a páginas sobre indemnizaciones por incapacidad temporal y no guardan relación con el contenido de esta ficha.
