# H3-Tiny/H3-Tiny-17B-FewStep-v0.1

## Resumen

H3-Tiny-17B-FewStep-v0.1 es un checkpoint de investigación publicado por el proyecto independiente H3-Tiny, consistente en una versión podada y destilada del transformer MiniMax H3 Ref2VA (33B), orientado a la generación conjunta de vídeo y audio a partir de texto e imágenes de referencia. El modelo reduce el transformer original de 33B a 17,08B de parámetros mediante poda estructurada y aplica después destilación few-step, lo que permite muestrear con 6 pasos por defecto (4 para mayor velocidad, 8 para mayor detalle) en lugar de los pipelines de difusión de decenas de pasos habituales.

El repositorio contiene únicamente el transformer en formato diffusers (`config.json` más safetensors particionados); el codificador de texto, los VAE y los procesadores deben tomarse del checkpoint oficial MiniMax H3 en formato diffusers. Se distribuye bajo la MiniMax H3 Community License Agreement, con las restricciones territoriales y de uso aceptable que dicho acuerdo impone, y el propio proyecto declara no estar afiliado ni respaldado por MiniMax.

Su relevancia es doble: por un lado, demuestra que la poda estructurada aplicada a un transformer multimodal de vídeo y audio puede recortar cerca del 48 % de los parámetros manteniendo el pipeline funcional; por otro, el número de descargas y likes es cero y la información pública es escasa, por lo que debe tratarse como un artefacto experimental y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión multimodal (vídeo + audio), derivado de MiniMax H3 Ref2VA mediante poda estructurada y destilación few-step |
| Parametros totales | 17.082.950.608 (17,08B, solo transformer) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license (MiniMax H3 Community License Agreement) |
| Formato de pesos | safetensors (layout diffusers: `config.json` + safetensors particionados) |
| Tamano del repositorio | 34,2 GB |
| Pasos de muestreo | 6 por defecto; 4 (más rápido) u 8 (más detalle) |
| Framas por defecto en ejemplo | 124 (`--num-frames 124`) |
| Librería | diffusers |
| Pipeline | text-to-video (con reference-to-video y audio-generation) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión para generación conjunta de vídeo y audio, no un modelo autorregresivo de lenguaje. Parte del transformer MiniMax H3 Ref2VA de 33B parámetros y se obtiene en dos fases: primero una poda estructurada que lo reduce a 17B (existe también un checkpoint intermedio de 14B dentro del mismo proyecto) y después una destilación few-step que reduce el número de pasos de muestreo necesarios a 6 por defecto, con variantes de 4 y 8 pasos. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de alineación como RLHF o DPO.

La innovación principal es la combinación de poda estructurada con destilación few-step sobre un transformer multimodal de vídeo y audio, que permite reducir tanto el coste de memoria como el número de evaluaciones del modelo por generación. El repositorio solo incluye el transformer; el codificador de texto, los VAE y los procesadores se heredan del checkpoint oficial MiniMax H3 en diffusers, de modo que el pipeline completo requiere ambos artefactos. La inferencia se realiza mediante el paquete `h3tiny` del repositorio GitHub del proyecto, que expone `load_pipeline` y un script `scripts/infer.py` con soporte para offloading y distintos backends de atención.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video).
- Generación de vídeo condicionada por imágenes de referencia (reference-to-video), con sintaxis de prompt del tipo `<Picture 1> ...` y paso de referencias mediante `--references`.
- Generación conjunta de vídeo y audio en el mismo pipeline (audio-generation), según las etiquetas del repositorio.
- Control del compromiso calidad/velocidad mediante el número de pasos de muestreo (4, 6 u 8).
- Control de la longitud de la secuencia generada mediante `--num-frames` (124 fotogramas en el ejemplo de la model card).
- Integración con el ecosistema diffusers para carga del transformer.
- Soporte de offloading y selección de backend de atención a través del código del proyecto.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes ni soporte multilingüe explícito.

## Casos de uso

- Prototipado rápido de vídeo generativo: el modo de 4 pasos permite iterar sobre prompts y referencias con un coste de muestreo muy inferior al de un pipeline de difusión estándar, adecuado para exploración creativa en local.
- Generación de vídeo con consistencia de identidad o estilo: el modo reference-to-video con `<Picture 1>` permite mantener un sujeto o una estética concreta a lo largo de la secuencia, útil para pruebas de concepto publicitarias.
- Investigación sobre poda de transformers multimodales: el checkpoint de 17B, junto con el intermedio de 14B del mismo proyecto, sirve como punto de comparación para estudiar la degradación de calidad al recortar parámetros en modelos de vídeo.
- Investigación sobre destilación few-step: permite evaluar el equilibrio entre 4, 6 y 8 pasos en un modelo de vídeo y audio, midiendo la pérdida de detalle frente al ahorro de cómputo.
- Generación de clips cortos con audio sincronizado para prototipos de contenido: el pipeline conjunto de vídeo y audio evita encadenar dos modelos separados en fases tempranas de diseño.
- Docencia y divulgación: al requerir el checkpoint base oficial más un transformer adicional, sirve para explicar la separación entre transformer, codificador de texto y VAE en pipelines de difusión multimodales.
- Evaluación de infraestructura: con 17,08B parámetros en safetensors y un repositorio de 34,2 GB, es un caso práctico para medir requisitos de VRAM, offloading y throughput en distintas GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas de calidad de vídeo o audio (FVD, FAD, CLIP score, etc.) ni comparaciones numéricas con el modelo base MiniMax H3 de 33B.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, el transformer en safetensors ocupa 34,2 GB en el repositorio, lo que en precisión de 16 bits sitúa los pesos alrededor de 34 GB; a ello hay que sumar el codificador de texto, los VAE y las activaciones del pipeline completo.
- El modo de 4 pasos reduce el número de evaluaciones del transformer por generación frente a 6 u 8 pasos, lo que disminuye el coste de cómputo, aunque la model card no publica latencias.
- GPU recomendadas: no disponible. Por tamaño de pesos, un pipeline completo en 16 bits no cabe en GPU de consumo de 24 GB sin cuantización u offloading; se requiere hardware de clase profesional con memoria suficiente o estrategias de offloading soportadas por el código del proyecto.
- ¿Cabe en GPU de consumo? No hay datos oficiales. El transformer por sí solo, en 16 bits, excede los 24 GB habituales de una RTX 4090, por lo que sería necesario cuantizar u offloading a CPU.
- Opciones de despliegue: el proyecto proporciona su propio paquete `h3tiny` con `load_pipeline` y `scripts/infer.py`, con soporte de offloading y backends de atención. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un pipeline de difusión de vídeo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros (transformer) | Contexto / duracion | Pasos de muestreo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| H3-Tiny-17B-FewStep-v0.1 | 17,08B | 124 fotogramas en el ejemplo; contexto no disponible | 6 por defecto (4 u 8) | MiniMax H3 Community License | Hugging Face, 0 descargas, 0 likes |
| H3-Tiny-14B (mismo proyecto) | 14B (según la model card) | no disponible | no disponible | MiniMax H3 Community License | Hugging Face (checkpoints del proyecto) |
| MiniMax H3 Ref2VA original | 33B (según la model card) | no disponible | no disponible (pipeline de difusión estándar) | MiniMax H3 Community License | Checkpoint oficial en diffusers |

No se dispone de datos de benchmarks que permitan comparar calidad entre estas variantes; la comparación se limita a parámetros, pasos de muestreo y licencia.

## Limitaciones y advertencias

- Modelo experimental: cero descargas y cero likes en el momento de la consulta, y model card muy breve; no hay evidencia pública de validación por terceros.
- Solo contiene el transformer: sin el checkpoint oficial MiniMax H3 en diffusers (codificador de texto, VAE y procesadores) el modelo no es utilizable.
- Licencia restrictiva: se rige por la MiniMax H3 Community License Agreement, con ámbito territorial y política de uso aceptable propios; es imprescindible revisar el fichero `LICENSE-MiniMax-H3` y el `NOTICE` antes de cualquier uso comercial.
- Proyecto independiente no afiliado ni respaldado por MiniMax, según declara el propio autor.
- La poda estructurada de 33B a 17B puede degradar la calidad respecto al modelo base; no se publican métricas que cuantifiquen esa pérdida.
- La destilación few-step con 4-6 pasos puede reducir el detalle frente a 8 pasos; la model card solo indica cualitativamente que 8 pasos "da más detalle".
- No se documentan sesgos conocidos, riesgo de alucinación visual, idiomas soportados ni limitaciones de contexto; todos estos datos figuran como no disponibles.
- No se documentan requisitos de VRAM, latencias ni throughput, lo que dificulta planificar un despliegue en producción.
- El pipeline está etiquetado como text-to-video, pero sus capacidades reales incluyen reference-to-video y audio; conviene validar el comportamiento en cada modo antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/H3-Tiny/H3-Tiny-17B-FewStep-v0.1
- Repositorio del proyecto en GitHub: https://github.com/fuyi25/H3-Tiny
- Página del proyecto: https://fuyi25.github.io/H3-Tiny/
- Checkpoints del proyecto en Hugging Face: https://huggingface.co/H3-Tiny
- Licencia MiniMax H3 Community License: https://huggingface.co/H3-Tiny/H3-Tiny-17B-FewStep-v0.1/blob/main/LICENSE-MiniMax-H3
