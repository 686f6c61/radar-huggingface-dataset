# H3-Tiny/H3-Tiny-14B-OKD-Ref2VA-v0.1

## Resumen

H3-Tiny-14B-OKD-Ref2VA-v0.1 es un modelo de generacion conjunta de video y audio a partir de texto e imagenes de referencia, obtenido mediante poda estructurada y destilacion del transformer MiniMax-H3 (33B). Lo desarrolla el proyecto independiente H3-Tiny, no afiliado a MiniMax, y se distribuye como un derivado del checkpoint oficial. El modelo reduce el transformer original de 33B a 17B y despues a 14B (13.989.119.056 parametros reales), manteniendo el flujo de trabajo Ref2VA (reference-to-video + audio) del modelo base.

La relevancia practica esta en el ahorro de recursos: un transformer de 13,99B en lugar de 33B reduce de forma sustancial los requisitos de VRAM y el coste de inferencia para generacion de video con audio sincronizado, manteniendo la recuperacion de calidad mediante destilacion (OKD) desde el profesor de 33B. El repositorio contiene unicamente el transformer en formato diffusers (config.json + safetensors fragmentados); el text encoder, los VAE y los procesadores se toman del checkpoint oficial MiniMax-H3.

El modelo se publica bajo la MiniMax H3 Community License y esta pensado para investigadores y desarrolladores que quieran experimentar con generacion de video-audio de referencia sin disponer de la infraestructura necesaria para el modelo completo. La version es v0.1, publicada en noviembre de 2026, con 447 descargas y 6 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para generacion conjunta de video y audio (derivado podado de MiniMax-H3) |
| Parametros totales | 13.989.119.056 (transformer) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license (MiniMax H3 Community License Agreement) |
| Formato de pesos | safetensors (layout diffusers, fragmentado; repo de 28,0 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusion para generacion conjunta de video y audio, derivado del transformer Ref2VA de MiniMax-H3 (33B). El proceso de compresion es una poda estructurada en dos etapas: de 33B a 17B y de ahi a 14B. En concreto, la version 14B parte del checkpoint MiniMax-H3-Tiny-17B-Pruned-Ref2VA y estrecha la FFN de cada bloque de 14336 a 9792 canales. Posteriormente se aplica OKD (destilacion desde el profesor de 33B) para recuperar la calidad perdida por la poda.

El flujo de trabajo es Ref2VA: el modelo recibe texto e imagenes de referencia (marcadas como `<Picture 1>` en el prompt) y genera video con audio asociado. La inferencia recomendada usa 50 pasos de muestreo y admite generacion de 124 fotogramas en el ejemplo de la model card. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO. El repositorio solo incluye el transformer; el text encoder, los VAE y los procesadores proceden del checkpoint oficial MiniMax-H3 en formato diffusers.

## Capacidades

- Generacion de video a partir de texto (text-to-video).
- Generacion de video condicionada por imagenes de referencia (reference-to-video, flujo Ref2VA).
- Generacion conjunta de audio sincronizado con el video.
- Control del numero de fotogramas generados (ejemplo documentado: 124 fotogramas).
- Muestreo configurable por pasos (valor recomendado: 50).
- Integracion con diffusers mediante el pipeline propio `h3tiny.pipeline.load_pipeline`.
- Soporte de offloading y distintos backends de atencion (segun el README de GitHub).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingues.

## Casos de uso

- Prototipado rapido de video generativo: el modelo permite generar clips con audio en una sola GPU de gama alta, lo que facilita iterar sobre prompts y referencias sin acceso al modelo de 33B.
- Generacion de video a partir de imagenes de producto: usando el flujo Ref2VA, un equipo de marketing puede introducir una foto de referencia y obtener un clip animado con audio para anuncios o demos.
- Creacion de contenido para redes sociales: generacion de clips cortos (por ejemplo, 124 fotogramas) con audio integrado para publicaciones, reduciendo la dependencia de pipelines separados de video y audio.
- Investigacion en compresion de modelos generativos: sirve como caso de estudio reproducible de poda estructurada mas destilacion (33B -> 17B -> 14B) sobre un transformer de difusion multimodal.
- Experimentacion academica con modelos de video-audio: al ser un derivado comunitario con licencia especifica, permite estudiar el comportamiento del flujo Ref2VA en entornos con recursos limitados.
- Integracion en ComfyUI: existe un checkpoint de un solo archivo en el repositorio MiniMax-H3-Tiny-ComfyUI, lo que facilita su uso en flujos de trabajo visuales sin escribir codigo.
- Evaluacion comparativa de calidad frente al modelo base: util para medir la perdida de fidelidad introducida por la poda y la recuperacion lograda con OKD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el transformer tiene 13,99B parametros y el repo pesa 28,0 GB, por lo que en precision completa requiere aceleradores de alta capacidad (orientativamente por encima de 28 GB solo para pesos del transformer, mas text encoder y VAE del modelo base).
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, se orienta a A100/H100 o GPUs profesionales con suficiente VRAM.
- Compatibilidad con GPU de consumo: no confirmada; el modelo documenta opciones de offloading en el README de GitHub, lo que puede permitir ejecucion en GPUs con menos VRAM a costa de velocidad.
- Opciones de despliegue: diffusers (pipeline `h3tiny.pipeline`), script `scripts/infer.py` del repositorio GitHub, y ComfyUI mediante el checkpoint de un solo archivo del repo MiniMax-H3-Tiny-ComfyUI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros (transformer) | Flujo | Licencia | Disponibilidad |
|---|---|---|---|---|
| H3-Tiny-14B-OKD-Ref2VA-v0.1 | 13,99B | Ref2VA (video + audio) | MiniMax H3 Community License | Hugging Face (diffusers, safetensors) |
| MiniMax-H3 (base) | 33B | Ref2VA (video + audio) | MiniMax H3 Community License | Checkpoint oficial MiniMax |
| MiniMax-H3-Tiny-17B-Pruned-Ref2VA | 17B | Ref2VA (video + audio) | MiniMax H3 Community License | Coleccion H3-Tiny |

No se dispone de datos de rendimiento comparado (benchmarks) entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo derivado y podado: la reduccion de 33B a 14B implica una perdida de capacidad respecto al modelo base, parcialmente compensada por destilacion; no se han publicado metricas que cuantifiquen esa perdida.
- Version v0.1: se trata de una version inicial, con posibles cambios de API, pesos o pipeline en futuras revisiones.
- Dependencia del modelo base: el repositorio solo contiene el transformer; es necesario descargar el checkpoint oficial MiniMax-H3 para el text encoder, los VAE y los procesadores.
- Licencia restrictiva: los pesos son derivados de MiniMax H3 y se rigen por la MiniMax H3 Community License Agreement, que incluye ambito territorial y politica de uso aceptable; es obligatorio revisar el acuerdo antes de cualquier uso comercial.
- Proyecto independiente: H3-Tiny no esta afiliado ni respaldado por MiniMax.
- Idiomas soportados: no disponibles; no se documenta cobertura multilingue.
- Sesgos y alucinacion: no se documentan sesgos conocidos ni tasas de alucinacion; en generacion de video, la fidelidad a la referencia y al prompt no esta cuantificada.
- Requisitos de hardware elevados: el tamano del transformer y del repo condiciona el despliegue a infraestructura con VRAM considerable o al uso de offloading.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/H3-Tiny/H3-Tiny-14B-OKD-Ref2VA-v0.1
- Pagina del proyecto: https://fuyi25.github.io/MiniMax-H3-Tiny/
- Repositorio GitHub: https://github.com/fuyi25/MiniMax-H3-Tiny
- Coleccion H3-Tiny: https://huggingface.co/collections/H3-Tiny/h3-tiny-v01-6afeea67147c27cf3b80820a
- Pesos para ComfyUI: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-ComfyUI
- Licencia: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-14B-OKD-Ref2VA-v0.1/blob/main/LICENSE-MiniMax-H3
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
