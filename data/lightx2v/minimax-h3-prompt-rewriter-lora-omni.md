# lightx2v/MiniMax-H3-Prompt-Rewriter-LoRA-Omni

## Resumen

MiniMax-H3-Prompt-Rewriter-LoRA-Omni es un adaptador LoRA (PEFT) desarrollado por la comunidad LightX2V que se monta sobre el modelo base multimodal Qwen2.5-Omni-7B. Su función es transformar una petición corta del usuario, junto con referencias visuales, de vídeo o de audio opcionales, en un prompt estructurado y listo para producción destinado al modelo de generación audiovisual MiniMax-H3. Resuelve el problema de la ingeniería de prompts para generadores de vídeo con audio: en lugar de escribir manualmente descripciones largas y con el formato exacto que exige MiniMax-H3, el adaptador las genera automáticamente a partir de una frase corta.

El adaptador es de solo texto: no genera vídeo ni audio, sino que produce el campo `enhanced_prompt` que debe alimentar, junto con los mismos assets de condición, un pipeline compatible con MiniMax-H3. Soporta cinco tareas: T2AV (solo texto), I2AV (imagen de primer fotograma), L2AV (imagen de último fotograma), FL2AV (dos imágenes ordenadas) y Ref2AV (referencias múltiples de imagen, vídeo y audio). El repositorio pesa 1,3 GB, fue creado en agosto de 2026 y se distribuye bajo licencia Apache-2.0. Es relevante ahora porque permite ejecutar la reescritura de prompts de MiniMax-H3 de forma local y abierta, sin depender de servicios en la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen2.5-Omni-7B (transformer multimodal) |
| Parámetros totales | No disponible (el repositorio del adaptador ocupa 1,3 GB; el modelo base tiene 7B) |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible (heredada del modelo base Qwen2.5-Omni-7B) |
| Tipos de cuantización | No especificados; se recomienda BF16 para inferencia |
| Idiomas soportados | Entrada en inglés y chino (declarados); el modelo base acepta más idiomas y la salida se genera en inglés |
| Licencia | Apache-2.0 (según metadatos de Hugging Face; el README declara `license: other` con `license_name: apache-2.0`) |
| Formato de pesos | Safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA (Low-Rank Adaptation) aplicado sobre Qwen2.5-Omni-7B, un modelo transformer multimodal de 7 mil millones de parámetros desarrollado por Alibaba que procesa texto, imágenes, audio y vídeo. El adaptador se entrena para reescribir peticiones cortas en prompts estructurados con un esquema fijo: las tareas base (T2AV, I2AV, L2AV, FL2AV) producen tres campos (`integrated_multimodal_description`, `overall_soundscape`, `non_diegetic_music`), mientras que Ref2AV genera seis secciones (`subject_definitions`, `summary`, `retention_analysis`, `detailed_description`, `overall_soundscape`, `non_diegetic_music`). La comunidad LightX2V también publica una variante de este adaptador basada en Qwen3.6-27B, lo que indica que el entrenamiento se ha replicado sobre distintos modelos base.

El script de inferencia incluido (`infer.py`) mapea la duración solicitada por el usuario (entre 4 y 15 segundos) a la rejilla de fotogramas legal de MiniMax-H3, `17*n+5` a 24 fps, y proporciona la duración efectiva resultante al reescritor. Las tareas base soportan las resoluciones `adaptive`, `21:9`, `16:9`, `4:3`, `1:1`, `3:4` y `9:16`; Ref2AV solo admite `16:9` y `9:16`. No se han publicado detalles sobre el dataset de entrenamiento ni sobre técnicas como RLHF o DPO.

## Capacidades

- Generación de prompts estructurados para MiniMax-H3 a partir de texto, imagen, vídeo y audio.
- Cinco tareas específicas: T2AV (texto a audio-vídeo), I2AV (primer fotograma), L2AV (último fotograma), FL2AV (dos fotogramas ordenados) y Ref2AV (referencias múltiples de imagen, vídeo y audio).
- Soporte de duraciones de 4 a 15 segundos, con mapeo automático a la rejilla de fotogramas legal de MiniMax-H3.
- Soporte de múltiples resoluciones (desde 21:9 hasta 9:16, además de `adaptive`).
- Soporte de tool calling: no aplicable (modelo de reescritura de prompts, no un agente).
- Capacidades multilingües: entrada en cualquier idioma que lea el modelo base (se declaran en, zh); la salida siempre se genera en inglés, que es el idioma que espera MiniMax-H3.
- Capacidades especiales: procesamiento multimodal (imagen, vídeo y audio) para entender referencias visuales y sonoras.

## Casos de uso

- **Generación de vídeo con audio desde texto (T2AV)**: un creador de contenido escribe una descripción breve, como "un zorro cinematográfico camina por un bosque nevado", y el adaptador genera el prompt completo de tres campos que MiniMax-H3 necesita para producir el clip con su banda sonora.
- **Generación de vídeo desde un primer fotograma (I2AV)**: un animador proporciona una imagen fija como punto de partida y el modelo genera una descripción estructurada que respeta la composición exacta de ese fotograma, ideal para dar continuidad a una escena.
- **Generación de vídeo con final fijado (L2AV)**: un director especifica una imagen final (por ejemplo, un campo de flores al sol) y el adaptador escribe un prompt que garantiza que la escena termina en ese encuadre, útil para cierres de escenas o transiciones.
- **Generación de vídeo con inicio y final definidos (FL2AV)**: con dos imágenes ordenadas, el modelo produce un prompt que fuerza la transición entre ambos fotogramas, por ejemplo, un plano macro de gotas de agua sobre una hoja, con el primer y último frame dados.
- **Generación con referencias múltiples (Ref2AV)**: un productor de podcast puede pasar dos imágenes (presentador y estudio, invitado y posición opuesta) y el modelo genera un prompt que define sujetos, composición, movimiento, tiempo y sonido, conservando la identidad de los elementos de referencia.
- **Automatización de pipelines de generación audiovisual**: integrado en un flujo local con MiniMax-H3, el adaptador permite convertir peticiones cortas de usuarios finales en prompts de producción, reduciendo el trabajo manual de ingeniería de prompts y acelerando la iteración creativa en entornos de generación masiva de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Se recomienda una GPU CUDA con soporte BF16 para la inferencia.
- El modelo base Qwen2.5-Omni-7B requiere aproximadamente 7 GB de VRAM en BF16 (más overhead de activaciones); el adaptador LoRA añade un coste marginal en memoria.
- El adaptador es ligero (1,3 GB en el repositorio), por lo que el cuello de botella principal es el modelo base de 7B, que cabe en GPUs de consumo como la RTX 3080/3090 o RTX 4090 con suficiente VRAM (10-24 GB).
- Para vídeo o audio de referencia, se necesita FFmpeg instalado en el host.
- El script `infer.py` usa SDPA (Scaled Dot-Product Attention) y `device_map="auto"` para repartir el modelo entre dispositivos disponibles.
- Opciones de despliegue: el script de inferencia incluido; el adaptador puede cargarse con la librería PEFT de Hugging Face sobre el modelo base. No se mencionan soporte para vLLM, llama.cpp, Ollama ni TGI en la documentación.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Base | Tamaño del adaptador | Tareas | Salida | Licencia |
|---|---|---|---|---|---|
| MiniMax-H3-Prompt-Rewriter-LoRA-Omni (este) | Qwen2.5-Omni-7B | 1,3 GB (repo) | T2AV, I2AV, L2AV, FL2AV, Ref2AV | Prompt estructurado para MiniMax-H3 | Apache-2.0 |
| MiniMax-H3-Prompt-Rewriter-LoRA (lightx2v) | Qwen3.6-27B | No disponible | T2VA (similar) | Prompt estructurado para MiniMax-H3 | No disponible |
| Reescritura manual de prompts | — | — | — | — | — |

No hay benchmarks públicos que permitan comparar el rendimiento de ambos adaptadores. La diferencia principal es el modelo base: Qwen2.5-Omni-7B (7B) frente a Qwen3.6-27B (27B), lo que sugiere que la variante de 27B puede tener más capacidad de razonamiento, aunque no se han publicado métricas que lo confirmen.

## Limitaciones y advertencias

- El modelo es solo un reescritor de prompts: no genera vídeo ni audio. Para obtener el resultado final hay que alimentar el `enhanced_prompt` junto con los mismos assets de referencia en un pipeline compatible con MiniMax-H3.
- La salida siempre se genera en inglés, independientemente del idioma de entrada; esto puede limitar su uso si se necesita el prompt en otro idioma.
- Las tareas Ref2AV solo soportan resoluciones 16:9 y 9:16, mientras que las tareas base admiten más formatos.
- La duración está limitada a 4-15 segundos, mapeada a la rejilla de fotogramas de MiniMax-H3.
- No se han publicado datos sobre sesgos, alucinaciones ni comportamiento en casos límite; el riesgo de alucinación es heredado del modelo base Qwen2.5-Omni-7B.
- La licencia declarada es Apache-2.0 según los metadatos de Hugging Face, pero el README del modelo indica `license: other` con `license_name: apache-2.0`; conviene revisar la licencia del modelo base Qwen2.5-Omni-7B antes de uso comercial.
- El modelo no soporta tool calling ni agentes; está pensado exclusivamente para la reescritura de prompts.

## Enlaces

- Repositorio del modelo: https://huggingface.co/lightx2v/MiniMax-H3-Prompt-Rewriter-LoRA-Omni
- Variante basada en Qwen3.6-27B: https://huggingface.co/lightx2v/MiniMax-H3-Prompt-Rewriter-LoRA
- Página del modelo en ModelScope: https://www.modelscope.cn/models/lightx2v/MiniMax-H3-Prompt-Rewriter-LoRA
- Proyecto LightX2V (GitHub): https://github.com/ModelTC/lightx2v
- Nodos ComfyUI para el reescritor: https://github.com/pytraveler/MiniMax-H3-Prompt-Rewriter-ComfyUI
- Modelo base Qwen2.5-Omni-7B: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
