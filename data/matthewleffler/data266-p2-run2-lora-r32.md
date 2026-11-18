# matthewleffler/data266-p2-run2-lora-r32

## Resumen

`data266-p2-run2-lora-r32` es un adaptador LoRA de rango 32 entrenado sobre Stable Diffusion 1.5 para generación de imágenes texto-a-imagen con estilo y contenido del dataset `lambdalabs/naruto-blip-captions`. Lo publica el usuario `matthewleffler` como parte de un ejercicio académico (DATA 266, Lab 2 Part 2) y se presenta explícitamente como la "comparison run": el autor selecciona como run final el de rango 8, con menor KID y mayor CLIP score, y remite a su model card para la tabla completa de resultados.

El adaptador modifica únicamente las proyecciones de atención del UNet mediante LoRA, con 6.377.472 parámetros entrenables, learning rate 1e-4, 3.000 pasos, batch size 4, resolución 512x512 y semilla 266. El entrenamiento completo requirió 19,4 minutos en una única GPU con un pico de memoria de 5,2 GiB y una pérdida final de 0,0906.

Su relevancia es limitada y de carácter didáctico: no aporta innovaciones arquitectónicas, no publica benchmarks frente a alternativas y su uso está restringido a investigación no comercial porque las imágenes de entrenamiento contienen personajes con derechos de autor. El repositorio ocupa 0,0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de Stable Diffusion 1.5 (difusión latente, transformer convolucional) |
| Parametros totales | 6.377.472 parámetros entrenables (adaptador LoRA); pesos del modelo base no incluidos |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; el texto de entrada se tokeniza con el text encoder CLIP de SD 1.5, límite de 77 tokens) |
| Tipos de cuantizacion | no disponible (no se documentan variantes fp16/fp32/int8 para el adaptador) |
| Idiomas soportados | no disponible (las etiquetas de Hugging Face no declaran idiomas) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | no disponible (el repositorio no detalla el formato de los ficheros del adaptador) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 aplicado a las proyecciones de atención del UNet de Stable Diffusion 1.5. No se modifica el text encoder ni el VAE, y no se introduce ninguna innovación arquitectónica: se trata de un fine-tuning paramétricamente eficiente estándar sobre un modelo de difusión latente de 512x512.

El entrenamiento se realizó sobre el dataset `lambdalabs/naruto-blip-captions` con los siguientes hiperparámetros: r=32, learning rate 0,0001, 3.000 pasos, batch size 4, resolución 512x512 y semilla 266. El cómputo total fue de 19,4 minutos en una sola GPU con un pico de 5,2 GiB de memoria y una pérdida final de 0,0906. No se documenta el número de tokens de texto vistos, la composición exacta del dataset, ni si se aplicó regularización, EMA o validación periódica. Tampoco se especifica la GPU utilizada.

## Capacidades

- Generación de imágenes texto-a-imagen condicionada por prompts en lenguaje natural, heredada del pipeline de Stable Diffusion 1.5.
- Especialización en el dominio visual y estilístico del dataset `naruto-blip-captions` (personajes y escenas de la serie Naruto con captions generadas por BLIP).
- Carga como adaptador LoRA sobre el checkpoint base mediante `pipe.load_lora_weights(...)` en la librería Diffusers.
- Compatibilidad con el ecosistema de Stable Diffusion 1.5: schedulers alternativos, negative prompts, CFG scale, img2img e inpainting (sujeto a la implementación del pipeline).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modos de "thinking"; no es un modelo de lenguaje.
- No soporta visión de entrada, audio ni otras modalidades.
- Capacidades multilingües: no documentadas; el text encoder CLIP de SD 1.5 tiene un rendimiento desigual fuera del inglés.

## Casos de uso

- Investigación académica sobre fine-tuning eficiente: sirve como referencia reproducible de un LoRA r=32 con hiperparámetros e métricas de coste documentados (19,4 min, 5,2 GiB, loss 0,0906) para comparar contra el run r=8 del mismo autor.
- Estudio comparativo de rangos LoRA: al ser la "comparison run" frente al r=8, permite analizar el efecto del rango en KID y CLIP score dentro del mismo dataset y semilla.
- Generación de ilustraciones de fan art con fines no comerciales: el adaptador reproduce el estilo y los personajes del dataset, útil en entornos de investigación o prototipado interno.
- Docencia en cursos de visión por computador: ejemplo mínimo de pipeline Diffusers con carga de adaptador y evaluación con métricas KID/CLIP.
- Prototipado de interfaces de generación de imágenes: al heredar el pipeline de SD 1.5, se puede integrar en demos de Gradio o Streamlit para validar flujos de UI sin coste de entrenamiento.
- Experimentos de composición de LoRAs: al ser un adaptador ligero sobre SD 1.5, se puede combinar con otros LoRAs del mismo base para estudiar interacciones entre adaptadores.
- Reproducción de experimentos: la semilla 266 y los hiperparámetros documentados permiten intentar replicar el entrenamiento en una GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el run r=8 seleccionado tiene menor KID y mayor CLIP score que este run r=32, pero no incluye cifras numéricas; remite a la model card del run r=8 para la tabla completa de resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para el adaptador; el pipeline completo de Stable Diffusion 1.5 en fp16 requiere aproximadamente 4-6 GiB de VRAM en GPU, y en fp32 alrededor de 8-10 GiB (estimación basada en el modelo base, no en datos publicados por el autor).
- VRAM de entrenamiento documentada: pico de 5,2 GiB con batch size 4 a 512x512 y LoRA r=32.
- GPU recomendadas: no especificadas por el autor. Por el tamaño del modelo base, cualquier GPU con al menos 6-8 GiB de VRAM es suficiente para inferencia en fp16 (RTX 3060, RTX 4060, RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, el adaptador en sí es de ~6,4 M de parámetros y el modelo base SD 1.5 es ligero; una RTX 3060 de 12 GiB o superior es suficiente.
- Opciones de despliegue: Diffusers (carga vía `load_lora_weights`), así como los ecosistemas compatibles con LoRA de SD 1.5 (AUTOMATIC1111, ComfyUI, InvokeAI) siempre que acepten adaptadores en el formato publicado. No se documenta soporte explícito de vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| data266-p2-run2-lora-r32 | 6.377.472 (LoRA) | 77 tokens de texto (CLIP SD 1.5) | KID y CLIP no publicados; inferior al run r=8 según el autor | creativeml-openrail-m | Hugging Face, 0 descargas |
| data266-p2-run1-lora-r8 | no disponible (LoRA r=8) | 77 tokens de texto (CLIP SD 1.5) | Menor KID y mayor CLIP que el r=32 según el autor; cifras no publicadas en esta ficha | creativeml-openrail-m | Hugging Face (run seleccionado) |
| Stable Diffusion 1.5 (base) | ~860 M (UNet) | 77 tokens de texto (CLIP) | Benchmarks públicos de SD 1.5; no comparables directamente con este adaptador | creativeml-openrail-m | Hugging Face, ampliamente distribuido |

No se dispone de datos de benchmarks ni de modelos comparables adicionales en la información proporcionada.

## Limitaciones y advertencias

- Uso restringido a investigación no comercial: las imágenes de entrenamiento contienen personajes con derechos de autor, según indica el propio autor.
- La licencia `creativeml-openrail-m` impone condiciones adicionales al uso comercial del modelo base y del adaptador; conviene revisar sus términos antes de cualquier despliegue.
- Riesgo de sobreajuste al dominio del dataset: al entrenarse sobre `naruto-blip-captions`, la calidad fuera de ese dominio visual puede degradarse respecto al modelo base.
- Sesgos conocidos: no documentados por el autor; hereda los sesgos del dataset y del modelo base SD 1.5.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomías incorrectas, texto ilegible y composiciones incoherentes, especialmente con prompts largos o complejos.
- Limitación de contexto textual: el text encoder CLIP de SD 1.5 trunca a 77 tokens, lo que limita prompts muy detallados.
- Idiomas: no se declaran idiomas soportados; el rendimiento en castellano no está verificado.
- Repositorio de 0,0 GB y sin descargas ni likes: no hay evidencia de validación por parte de la comunidad.
- El autor no publica cifras de KID ni CLIP en esta model card, lo que impide verificar la afirmación de que el run r=8 es superior.
- No apto para producción: es un artefacto académico sin garantías de estabilidad, soporte ni mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthewleffler/data266-p2-run2-lora-r32
- Run seleccionado (r=8): https://huggingface.co/matthewleffler/data266-p2-run1-lora-r8
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento: https://huggingface.co/datasets/lambdalabs/naruto-blip-captions
