# H3-Tiny/MiniMax-H3-Tiny-17B-FewStep-Ref2VA-v0.1

## Resumen

MiniMax-H3-Tiny-17B-FewStep-Ref2VA-v0.1 es un modelo de generación de vídeo con audio, derivado del transformer Ref2VA de MiniMax-H3 (33B parámetros) mediante poda estructurada y posterior destilación few-step. Lo desarrolla el proyecto independiente H3-Tiny, no afiliado a MiniMax, y se publica bajo la licencia comunitaria de MiniMax H3. El checkpoint contiene únicamente el transformer en formato diffusers (17.082.950.608 parámetros, unos 34,2 GB de repo), de modo que el text encoder, los VAE y los procesadores deben tomarse del checkpoint oficial de MiniMax-H3.

El modelo resuelve un problema concreto: ejecutar un generador conjunto de vídeo y audio de gran escala en hardware más modesto, reduciendo el transformer de 33B a 17B (con una variante de 14B en la misma familia) y recortando el número de pasos de muestreo a 6 por defecto (4 o más), frente a los muestreos de decenas de pasos habituales en modelos de difusión. El flujo de trabajo es Ref2VA: imágenes de referencia más texto como entrada, y salida de vídeo con pista de audio.

Es relevante ahora porque demuestra que la poda estructurada más la destilación few-step pueden llevar un modelo multimodal de vídeo y audio a un rango de parámetros manejable sin reentrenar desde cero, y porque se integra en el ecosistema diffusers y en ComfyUI mediante un nodo propio del proyecto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (Ref2VA) con poda estructurada; derivado de MiniMax-H3 |
| Parámetros totales | 17.082.950.608 (transformer) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; el repo ocupa 34,2 GB) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license (MiniMax H3 Community License Agreement) |
| Formato de pesos | safetensors en layout diffusers (`config.json` + safetensors sharded) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión para generación conjunta de vídeo y audio, obtenido en dos fases: primero una poda estructurada del transformer Ref2VA de MiniMax-H3 (33B → 17B), y después una destilación few-step que reduce el número de pasos de muestreo necesarios. El pipeline declarado es `text-to-video`, aunque la variante concreta es Ref2VA (reference-to-video + audio), es decir, acepta imágenes de referencia junto al prompt de texto.

El checkpoint publicado contiene solo el transformer; el text encoder, los VAE y los procesadores no se incluyen y deben cargarse desde el checkpoint oficial de MiniMax-H3 en formato diffusers. El muestreo por defecto es de 6 pasos, con 4 pasos como opción más rápida y 8 pasos para mayor detalle. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de texto e imágenes de referencia (Ref2VA).
- Generación conjunta de pista de audio junto con el vídeo.
- Control del número de pasos de muestreo (4, 6 u 8) para equilibrar velocidad y detalle.
- Integración con diffusers mediante `h3tiny.pipeline.load_pipeline`.
- Soporte en ComfyUI a través de un checkpoint de fichero único y nodos propios del proyecto.
- Salida con número de frames configurable (el ejemplo de la model card usa `--num-frames 124`).
- Soporte de offloading y distintos backends de atención, según el README del repositorio.
- Tool calling, agentes, razonamiento y capacidades multilingües: no disponibles (no es un modelo de lenguaje).

## Casos de uso

- Prototipado rápido de vídeo generativo: con 6 pasos por defecto y la opción de 4, permite iterar sobre prompts y referencias en menos tiempo que un muestreo de muchos pasos, útil para equipos que prueban conceptos visuales.
- Generación de clips con audio sincronizado: el flujo Ref2VA produce vídeo y audio en una sola pasada, lo que sirve para crear borradores de escenas con sonido sin encadenar dos modelos distintos.
- Creación de contenido a partir de imágenes de referencia: útil para mantener consistencia de personaje o producto entre planos usando `<Picture 1>` y las referencias adjuntas.
- Integración en ComfyUI: el checkpoint de fichero único y los nodos del proyecto permiten montar grafos de generación de vídeo dentro de una interfaz visual, adecuado para artistas técnicos.
- Investigación sobre poda y destilación: al ser un derivado documentado de MiniMax-H3, sirve como caso de estudio reproducible de poda estructurada 33B → 17B con scripts incluidos en el repositorio.
- Despliegue en hardware de una sola GPU: con 17B parámetros en el transformer y soporte de offloading, es viable en entornos con menos VRAM que el modelo original de 33B, por ejemplo para demos internas o pruebas de concepto.
- Generación de material de previsualización para producción audiovisual: clips cortos con audio para validar guion, encuadre o ritmo antes de una producción completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia, el transformer tiene 17,08B parámetros y el repo pesa 34,2 GB en safetensors; a esto hay que sumar el text encoder, los VAE y los procesadores del checkpoint base MiniMax-H3.
- GPU recomendadas: no disponibles en la información proporcionada. El ejemplo de la model card usa `device="cuda"` sin especificar modelo de GPU.
- ¿Cabe en GPU de consumo? No confirmado. El proyecto menciona soporte de offloading, lo que sugiere que puede ejecutarse con menos VRAM que el modelo completo, pero no se dan cifras.
- Opciones de despliegue: diffusers (pipeline `h3tiny`), scripts `scripts/infer.py` del repositorio, y ComfyUI mediante el checkpoint de fichero único y los nodos del proyecto.
- Latencia y throughput: no disponibles. Únicamente se indica que 4 pasos es más rápido que 6, y 8 da más detalle.

## Comparativa con modelos similares

| Modelo | Parámetros (transformer) | Flujo | Pasos de muestreo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Tiny-17B-FewStep-Ref2VA-v0.1 | 17,08B | Ref2VA (vídeo + audio) | 6 por defecto (4–8) | minimax-h3-community-license | Hugging Face, ComfyUI |
| MiniMaxAI/MiniMax-H3 (base) | 33B (según la model card) | Ref2VA (vídeo + audio) | no disponible | minimax-h3-community-license | Hugging Face |
| Variante H3-Tiny 14B | 14B (según la model card) | Ref2VA (vídeo + audio) | no disponible | minimax-h3-community-license | Colección H3-Tiny |

No se dispone de datos de rendimiento comparado (benchmarks) entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El repositorio contiene solo el transformer; sin el checkpoint base MiniMax-H3 (text encoder, VAE, procesadores) el modelo no es funcional.
- Licencia comunitaria de MiniMax H3: uso sujeto al acuerdo, incluido su ámbito territorial y su política de uso aceptable. Revisar `LICENSE-MiniMax-H3` y `NOTICE` antes de cualquier uso comercial.
- Es un modelo derivado (Model Derivative) de MiniMax H3; no está afiliado ni respaldado por MiniMax.
- Proyecto independiente con pocos likes (3) y creado recientemente (noviembre de 2026): menor madurez y soporte comunitario que el modelo base.
- La poda y la destilación few-step pueden degradar la calidad frente al modelo original de 33B; no se publican métricas que cuantifiquen esa pérdida.
- No se documentan sesgos, idiomas soportados ni tasas de alucinación visual; tratarlo como modelo de investigación.
- Riesgo de artefactos en vídeo y audio propios de la generación few-step con 4 pasos; la model card recomienda 8 pasos para más detalle.
- No hay información sobre límites de longitud de vídeo, resolución o número máximo de frames más allá del ejemplo de 124 frames.

## Enlaces

- Hugging Face: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-17B-FewStep-Ref2VA-v0.1
- Página del proyecto: https://fuyi25.github.io/MiniMax-H3-Tiny/
- Repositorio GitHub: https://github.com/fuyi25/MiniMax-H3-Tiny
- Colección H3-Tiny: https://huggingface.co/collections/H3-Tiny/h3-tiny-v01-6afeea67147c27cf3b80820a
- Checkpoint para ComfyUI: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-ComfyUI
- Nodos ComfyUI: https://github.com/fuyi25/MiniMax-H3-Tiny/tree/main/comfyui
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-17B-FewStep-Ref2VA-v0.1/blob/main/LICENSE-MiniMax-H3
- Contacto: fohoo@outlook.com
