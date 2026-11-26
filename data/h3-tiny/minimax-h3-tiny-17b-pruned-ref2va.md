# H3-Tiny/MiniMax-H3-Tiny-17B-Pruned-Ref2VA

## Resumen

MiniMax-H3-Tiny-17B-Pruned-Ref2VA es un checkpoint derivado del transformer de MiniMax-H3 Ref2VA, un modelo de generacion conjunta de video y audio a partir de texto e imagenes de referencia. Lo publica el proyecto independiente H3-Tiny, que aplica poda estructurada sobre el modelo original de MiniMax sin reentrenamiento posterior: reduce el transformer de 33,12B a 17,07B parametros eliminando 8 de sus 50 bloques y aplicando un rango 8 en las capas AdaLN. El resultado es un modelo "training-free", es decir, funcional directamente tras la poda.

Su interes practico esta en la reduccion de requisitos de memoria y computo para un modelo de generacion de video con audio, manteniendo el flujo de trabajo Ref2VA (reference-to-video + audio). El repositorio contiene unicamente el transformer en formato diffusers (`config.json` y safetensors fragmentados); el text encoder, los VAE y los procesadores se toman del checkpoint oficial MiniMax-H3. El muestreo recomendado es de 50 pasos.

La relevancia actual radica en que permite experimentar con un pipeline de video-audio de gran escala en hardware mas modesto, a costa de la perdida de calidad inherente a una poda sin destilacion ni fine-tuning. La licencia es la MiniMax H3 Community License, con restricciones territoriales y de uso aceptable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para generacion conjunta de video y audio (derivado de MiniMax-H3 Ref2VA), con capas AdaLN |
| Parametros totales | 17.067.115.600 (17,07B, solo transformer) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo publica safetensors en el layout de diffusers) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license (MiniMax H3 Community License Agreement) |
| Formato de pesos | safetensors (layout diffusers: `config.json` + shards); version single-file para ComfyUI en repo aparte |

## Arquitectura y entrenamiento

El modelo es un transformer de difusion que genera video y audio de forma conjunta condicionado por texto e imagenes de referencia (workflow Ref2VA). Parte del transformer de MiniMax-H3 Ref2VA de 33,12B parametros y se obtiene mediante poda estructurada: se eliminan 8 de los 50 bloques del transformer y se reduce el rango de las capas AdaLN a 8. No hay entrenamiento, destilacion ni fine-tuning: el checkpoint es el resultado directo de la poda.

El pipeline completo requiere componentes externos que no se incluyen en este repositorio: el text encoder, los VAE de video y audio y los procesadores, que se cargan desde el checkpoint oficial MiniMax-H3 en formato diffusers. El muestreo se realiza con 50 pasos. El proyecto contempla opciones de offloading y distintos backends de atencion, documentados en el README de GitHub.

## Capacidades

- Generacion de video a partir de texto con imagenes de referencia (reference-to-video).
- Generacion conjunta de audio sincronizado con el video en el mismo pipeline (Ref2VA).
- Aceptacion de multiples imagenes de referencia mediante marcadores tipo `<Picture 1>` en el prompt.
- Control de longitud de la secuencia mediante el parametro `--num-frames` (ejemplo documentado: 124 frames).
- Integracion con ComfyUI mediante un checkpoint single-file publicado en un repositorio aparte.
- Carga programatica via `h3tiny.pipeline.load_pipeline` y script de inferencia `scripts/infer.py`.
- Soporte de offloading y seleccion de backend de atencion para ajustar el uso de memoria.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).

## Casos de uso

- Prototipado de generacion de video con audio en equipos con VRAM limitada: al reducir el transformer de 33B a 17B, permite iterar sobre prompts y referencias en GPUs de gama alta de consumo o profesionales, aceptando menor fidelidad que el modelo completo.
- Generacion de clips cortos a partir de una o varias imagenes de referencia: util para crear animaciones o variaciones de un personaje u objeto manteniendo consistencia visual entre frames.
- Creacion de video con banda sonora generada de forma conjunta: el pipeline Ref2VA produce audio alineado con el video, lo que sirve para bocetos de anuncios, demos o contenido para redes.
- Previsualizacion rapida en pipelines de postproduccion: generar versiones preliminares de planos antes de invertir en renderizado con el modelo completo de 33B.
- Investigacion sobre poda de modelos de difusion: el checkpoint sirve como referencia reproducible para estudiar el impacto de eliminar bloques y reducir el rango AdaLN sin reentrenar.
- Integracion en flujos ComfyUI: mediante el checkpoint single-file, se puede incorporar la generacion Ref2VA en grafos de nodos existentes para experimentacion artistica.
- Evaluacion comparativa de calidad frente al modelo base: permite medir la degradacion introducida por la poda en tareas concretas antes de decidir que version desplegar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia, el transformer pesa 17,07B parametros y el repositorio ocupa 34,2 GB en safetensors (probablemente en fp16/bf16); a ello hay que sumar text encoder y VAE del checkpoint base MiniMax-H3.
- GPU recomendadas: no disponible. Por tamano, se requiere al menos una GPU profesional con memoria suficiente para el transformer mas los componentes auxiliares; el proyecto documenta opciones de offloading para reducir el pico de memoria.
- Cabe en GPU de consumo: no confirmado en la informacion disponible; el offloading documentado sugiere que puede ejecutarse en configuraciones con memoria ajustada, pero no se especifican modelos concretos.
- Opciones de despliegue: diffusers (layout nativo del repo), script `scripts/infer.py` del proyecto H3-Tiny, API `h3tiny.pipeline.load_pipeline`, y ComfyUI mediante el repo MiniMax-H3-Tiny-ComfyUI.
- Latencia y throughput: no disponible. El muestreo recomendado es de 50 pasos.

## Comparativa con modelos similares

| Modelo | Parametros (transformer) | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Tiny-17B-Pruned-Ref2VA | 17,07B | no disponible | sin benchmarks publicados | MiniMax H3 Community License | Hugging Face (este repo) |
| MiniMaxAI/MiniMax-H3 (base) | 33,12B (transformer Ref2VA) | no disponible | sin datos en la informacion disponible | MiniMax H3 Community License | Hugging Face (oficial) |
| H3-Tiny 14B (variante del proyecto) | 14B (segun model card) | no disponible | sin benchmarks publicados | MiniMax H3 Community License | Hugging Face (coleccion H3-Tiny) |

## Limitaciones y advertencias

- La poda se realiza sin entrenamiento ni destilacion, por lo que es esperable una perdida de calidad frente al modelo base de 33B; no se cuantifica en la informacion disponible.
- El repositorio contiene solo el transformer; es imprescindible disponer del checkpoint oficial MiniMax-H3 en formato diffusers para el text encoder, los VAE y los procesadores.
- La licencia MiniMax H3 Community License impone un ambito territorial y una politica de uso aceptable; es necesario revisar `LICENSE-MiniMax-H3` y `NOTICE` antes de cualquier uso comercial.
- Riesgo de alucinacion visual y artefactos: no documentado, pero inherente a los modelos generativos de video; la poda puede acentuarlo.
- Idiomas soportados no declarados; el condicionamiento textual depende del text encoder del modelo base.
- No se especifican requisitos minimos de VRAM ni configuraciones de hardware validadas.
- Proyecto independiente no afiliado ni respaldado por MiniMax.
- Fecha de creacion del repositorio: 19 de noviembre de 2026; actualizado el 22 de noviembre de 2026.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-17B-Pruned-Ref2VA
- Pagina del proyecto: https://fuyi25.github.io/MiniMax-H3-Tiny/
- Repositorio GitHub: https://github.com/fuyi25/MiniMax-H3-Tiny
- Coleccion H3-Tiny en Hugging Face: https://huggingface.co/collections/H3-Tiny/h3-tiny-v01-6afeea67147c27cf3b80820a
- Checkpoint single-file para ComfyUI: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-ComfyUI
- Licencia: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-17B-Pruned-Ref2VA/blob/main/LICENSE-MiniMax-H3
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
