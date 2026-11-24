# H3-Tiny/H3-Tiny-14B-OKD-v0.1

## Resumen

H3-Tiny-14B-OKD-v0.1 es un checkpoint de la familia H3-Tiny, un proyecto independiente que aplica poda estructurada al transformer del modelo MiniMax-H3 (33B) para reducirlo primero a 17B y después a 14B. El modelo resultante genera vídeo y audio de forma conjunta a partir de texto e imágenes de referencia (workflow Ref2VA), manteniendo la arquitectura y los componentes auxiliares del modelo original de MiniMax. Este repositorio contiene únicamente el transformer en formato diffusers (`config.json` más safetensors fragmentados); el codificador de texto, los VAE y los procesadores se toman del checkpoint oficial MiniMax-H3 en formato diffusers.

El modelo base MiniMax-H3 es un sistema de generación conjunta de vídeo y audio; H3-Tiny reduce su huella de parámetros mediante poda de las capas FFN de cada bloque (de 14336 a 9792 canales) y posterior recuperación de calidad mediante destilación desde el profesor de 33B (OKD, *output knowledge distillation*). El resultado son 13.989.119.056 parámetros en el transformer, un tamaño de repositorio de 28,0 GB y un pipeline declarado como `text-to-video`, aunque el flujo real soportado es referencia-a-vídeo-con-audio.

Es relevante ahora porque permite ejecutar un modelo de generación de vídeo con audio en hardware más asequible que el original de 33B, con la misma interfaz de inferencia (50 pasos de muestreo, 124 frames por defecto en el ejemplo de uso) y compatibilidad con ComfyUI mediante un checkpoint single-file separado. La licencia es la MiniMax H3 Community License, no una licencia open source estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión para generación conjunta de vídeo y audio (derivado de MiniMax-H3) |
| Parámetros totales | 13.989.119.056 (transformer) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (`license: other`) |
| Formato de pesos | safetensors fragmentados en layout diffusers (`config.json` + shards) |

## Arquitectura y entrenamiento

El checkpoint es el transformer podado de MiniMax-H3 Ref2VA. El proceso documentado por el autor parte del modelo MiniMax-H3-Tiny-17B-Pruned-Ref2VA, al que se le estrecha la FFN de cada bloque de 14336 a 9792 canales, y después se recupera mediante OKD, destilación de conocimiento de salida desde el profesor MiniMax-H3 de 33B. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO; tampoco se especifican innovaciones de atención o decodificación más allá de las heredadas del modelo base.

El pipeline es Ref2VA: generación conjunta de vídeo y audio condicionada por texto e imágenes de referencia (el prompt usa marcadores como `<Picture 1>`). El muestreo por defecto son 50 pasos y el ejemplo de inferencia genera 124 frames. El repositorio incluye solo el transformer; el resto del pipeline (text encoder, VAE, procesadores) se carga desde el checkpoint oficial MiniMax-H3 en diffusers.

## Capacidades

- Generación de vídeo a partir de texto.
- Generación de audio conjunta con el vídeo en el mismo pipeline (Ref2VA).
- Condicionamiento por imágenes de referencia (reference-to-video).
- Prompt con referencias múltiples mediante marcadores (`<Picture 1>`, etc.).
- Integración con diffusers mediante `h3tiny.pipeline.load_pipeline`.
- Inferencia por línea de comandos con `scripts/infer.py`, con opciones de offloading y backends de atención.
- Compatibilidad con ComfyUI a través del checkpoint single-file del repositorio MiniMax-H3-Tiny-ComfyUI.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step ni multilingüismo textual; el modelo es generativo audiovisual, no un LLM conversacional.

## Casos de uso

- Generación de clips publicitarios con audio: el pipeline Ref2VA permite partir de imágenes de producto como referencia y un prompt textual para producir vídeo y audio sincronizados en una sola pasada de 50 pasos, útil para prototipado rápido de creatividades.
- Previsualización de storyboards: convertir viñetas o imágenes de referencia en secuencias de vídeo con audio ambiente para validar ritmo y composición antes de producción final.
- Creación de contenido para redes sociales: generar clips cortos (por ejemplo, 124 frames) con audio integrado en hardware de una sola GPU, reduciendo el coste frente al modelo de 33B.
- Iteración en ComfyUI: usar el checkpoint single-file para flujos de trabajo nodales donde se encadenan referencias de imagen y prompts, aprovechando el ecosistema de nodos de ComfyUI.
- Investigación en poda y destilación de modelos generativos: el checkpoint sirve como referencia reproducible (33B → 17B → 14B con OKD) para estudiar el impacto del estrechamiento de FFN en calidad audiovisual.
- Pruebas de concepto en local o en clúster pequeño: al ser un transformer de 14B, permite experimentar con generación vídeo-audio en entornos con menos VRAM que el modelo original, usando las opciones de offloading del repositorio.
- Generación de material de formación o demo: producir vídeos explicativos breves con audio a partir de imágenes de referencia y guiones textuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 13,99B parámetros en el transformer y pesos en safetensors (repo de 28,0 GB), la carga completa en precisión nativa requiere del orden de decenas de GB, por lo que se recomienda offloading.
- GPU recomendadas: no especificadas por el autor; por tamaño, GPUs de datacenter tipo A100/H100 son las más seguras para carga completa, y GPUs consumer de gama alta solo con offloading o cuantización (no documentada).
- ¿Cabe en GPU consumer?: no confirmado; el repositorio ofrece opciones de offloading y backends de atención, lo que sugiere que el autor contempla ejecución con memoria limitada, pero no se publican cifras.
- Opciones de despliegue: diffusers (`h3tiny.pipeline.load_pipeline`), script CLI `scripts/infer.py`, y ComfyUI mediante el checkpoint single-file de `H3-Tiny/MiniMax-H3-Tiny-ComfyUI`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles. Se conoce el valor por defecto de 50 pasos de muestreo y 124 frames por generación en el ejemplo.

## Comparativa con modelos similares

| Modelo | Parámetros (transformer) | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| H3-Tiny-14B-OKD-v0.1 | 13,99B | no disponible | sin benchmarks publicados | MiniMax H3 Community License | Hugging Face (447 descargas, 6 likes) |
| MiniMax-H3 (base) | 33B (según model card) | no disponible | no disponible en la información | MiniMax H3 Community License | checkpoint oficial en diffusers |
| MiniMax-H3-Tiny-17B-Pruned-Ref2VA | 17B (según model card) | no disponible | sin benchmarks publicados | MiniMax H3 Community License | Hugging Face (repo de la familia H3-Tiny) |

No se dispone de datos de benchmarks ni de modelos comparables de otros desarrolladores en la información proporcionada; la comparación se limita a las variantes de la propia familia H3-Tiny y al modelo base.

## Limitaciones y advertencias

- Licencia restrictiva: los pesos son derivados de MiniMax H3 y se distribuyen bajo la MiniMax H3 Community License Agreement, con ámbito territorial y política de uso aceptable propios; no es una licencia open source estándar y el uso comercial debe verificarse contra ese acuerdo.
- Proyecto independiente no afiliado ni respaldado por MiniMax.
- Al ser un modelo podado y destilado, es esperable una pérdida de calidad frente al profesor de 33B; no se publican métricas que cuantifiquen esa degradación.
- Riesgo de alucinación visual y artefactos en vídeo y audio inherente a los modelos generativos; no hay evaluación publicada de fidelidad.
- Solo se incluye el transformer: requiere descargar el checkpoint oficial MiniMax-H3 para el text encoder, VAE y procesadores, lo que añade dependencias y espacio en disco.
- No se documentan idiomas soportados ni cobertura multilingüe de los prompts.
- No se especifican requisitos de VRAM, cuantizaciones soportadas ni latencias, lo que dificulta planificar despliegues en producción.
- Fecha de creación del repositorio: 2026-11-19; última actualización: 2026-11-22, por lo que se trata de un checkpoint muy reciente con poca validación comunitaria (6 likes, 447 descargas).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/H3-Tiny/H3-Tiny-14B-OKD-v0.1
- Página del proyecto: https://fuyi25.github.io/MiniMax-H3-Tiny/
- Repositorio GitHub: https://github.com/fuyi25/MiniMax-H3-Tiny
- Colección H3-Tiny: https://huggingface.co/collections/H3-Tiny/h3-tiny-v01-6afeea67147c27cf3b80820a
- Checkpoint ComfyUI: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-ComfyUI
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-14B-OKD-Ref2VA-v0.1/blob/main/LICENSE-MiniMax-H3
- Contacto: fohoo@outlook.com
