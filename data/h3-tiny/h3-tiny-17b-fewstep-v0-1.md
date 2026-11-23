# H3-Tiny/H3-Tiny-17B-FewStep-v0.1

## Resumen

H3-Tiny-17B-FewStep-v0.1 es un modelo de generación conjunta de vídeo y audio desarrollado por el proyecto independiente H3-Tiny, derivado del transformer Ref2VA de MiniMax-H3 (33B) mediante poda estructurada hasta 17.080 millones de parámetros y posterior destilación few-step. El modelo resuelve la generación de vídeo con audio sincronizado a partir de texto e imágenes de referencia (workflow Ref2VA), reduciendo a la mitad el coste computacional del modelo original.

La relevancia actual reside en que permite ejecutar un generador de vídeo con audio de calidad en hardware más asequible que el modelo base de 33B, con solo 6 pasos de muestreo por defecto (4 o más), lo que reduce drásticamente la latencia frente a los esquemas de difusión de decenas de pasos. Es parte de una familia de podas progresivas (33B → 17B → 14B) publicada por el mismo autor.

El repositorio contiene únicamente el transformer en formato diffusers (`config.json` + safetensors fragmentados); el text encoder, los VAE y los procesadores se toman del checkpoint oficial de MiniMax-H3 en formato diffusers. La licencia es la MiniMax H3 Community License, con restricciones territoriales y de uso aceptable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (Ref2VA de MiniMax-H3), podado y destilado few-step |
| Parametros totales | 17.082.950.608 (17,08B, solo transformer) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license (MiniMax H3 Community License Agreement) |
| Formato de pesos | safetensors (layout diffusers, sharded) + config.json |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión para generación conjunta de vídeo y audio, derivado del transformer Ref2VA de MiniMax-H3 (33B). El proceso de construcción tiene dos etapas: primero una poda estructurada que reduce el modelo de 33B a 17B (checkpoint intermedio MiniMax-H3-Tiny-17B-Pruned-Ref2VA), y después una destilación few-step que permite muestrear con 6 pasos por defecto (4 para mayor velocidad, 8 para mayor detalle). El pipeline es reference-to-video con audio (Ref2VA): acepta texto e imágenes de referencia y genera vídeo con pista de audio asociada.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en la información proporcionada. El repositorio solo incluye el transformer; el text encoder, los VAE y los procesadores provienen del checkpoint oficial MiniMax-H3 en diffusers. El proyecto forma parte de una línea de poda progresiva (33B → 17B → 14B) publicada por el autor.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video).
- Generación conjunta de vídeo y audio sincronizado.
- Generación condicionada por imágenes de referencia (reference-to-video, workflow Ref2VA).
- Muestreo few-step: 6 pasos por defecto, configurable a 4 u 8.
- Integración con diffusers (`from h3tiny.pipeline import load_pipeline`).
- Soporte de offloading y distintos backends de atención (documentado en el README de GitHub).
- Disponibilidad de pesos en formato de archivo único para ComfyUI, junto con nodos propios.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step ni multilingüismo textual.

## Casos de uso

- Generación de clips publicitarios con audio: el modelo produce vídeo y banda sonora en una sola pasada a partir de un guion textual y una imagen de referencia de producto, con 6 pasos de muestreo para iterar rápido sobre variantes creativas.
- Prototipado de storyboards animados: usar imágenes de referencia de personajes o escenarios para mantener consistencia visual entre planos, aprovechando el workflow Ref2VA.
- Previsualización de vídeo en estudios de animación: generar animáticas con audio provisional en hardware de gama alta consumer o una sola GPU de datacenter, gracias a los 17B parámetros frente a los 33B del modelo base.
- Creación de contenido para redes sociales: clips cortos con audio generado en pipelines automatizados, ajustando `--steps 4` para máxima velocidad o `--steps 8` para mayor detalle.
- Investigación en poda y destilación de modelos generativos: el checkpoint sirve como referencia reproducible de una poda 33B → 17B con destilación few-step, con scripts de poda publicados en el repositorio.
- Flujos de trabajo en ComfyUI: integración mediante los pesos de archivo único y los nodos del proyecto para artistas técnicos que prefieren entornos nodales.
- Generación de audio para vídeo sin captura real: el modelo produce la pista de audio de forma conjunta con el vídeo, útil para demos y contenido conceptual donde no se dispone de sonido grabado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia, un transformer de 17,08B en precisión bf16/fp16 ocupa aproximadamente 34 GB solo en pesos, por lo que requiere offloading o cuantización para caber en GPUs consumer.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, se sitúa en el rango de A100 80 GB, H100 o configuraciones multi-GPU con offloading.
- ¿Cabe en GPU consumer? No de forma directa sin offloading o cuantización; el README de GitHub documenta opciones de offloading.
- Opciones de despliegue: diffusers con el paquete `h3tiny` (script `scripts/infer.py`), ComfyUI mediante los pesos de archivo único y nodos propios. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de vídeo).
- Latencia y throughput: no disponibles; el muestreo few-step (6 pasos por defecto) reduce el coste frente a esquemas de decenas de pasos, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| H3-Tiny-17B-FewStep-v0.1 | 17,08B (transformer) | no disponible | no disponible | MiniMax H3 Community License | Hugging Face (diffusers, ComfyUI) |
| MiniMax-H3 (base, Ref2VA) | 33B (transformer) | no disponible | no disponible | MiniMax H3 Community License | Hugging Face (oficial) |
| H3-Tiny 14B (poda adicional) | 14B (transformer) | no disponible | no disponible | MiniMax H3 Community License | Hugging Face (colección H3-Tiny) |

Las cifras de rendimiento comparado no están publicadas en la información disponible. La comparativa se limita a tamaño, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al derivar de MiniMax-H3, hereda los sesgos del modelo base y de sus datos de entrenamiento.
- Riesgo de alucinación: no cuantificado; como modelo generativo de vídeo y audio, puede producir contenido visual o sonoro incoherente con el prompt, especialmente con pocos pasos de muestreo (4).
- Limitaciones de contexto o idioma: no disponibles; el modelo no procesa texto de forma autónoma (usa el text encoder de MiniMax-H3), por lo que el soporte idiomático depende del checkpoint base.
- Restricciones de licencia: los pesos son Model Derivatives de MiniMax H3 y se distribuyen bajo la MiniMax H3 Community License, con ámbito territorial y política de uso aceptable específicos; es obligatorio revisar LICENSE y NOTICE antes de cualquier uso comercial.
- El repositorio contiene solo el transformer: es imprescindible descargar el checkpoint oficial MiniMax-H3 en diffusers para obtener text encoder, VAE y procesadores.
- Proyecto independiente no afiliado ni respaldado por MiniMax.
- El modelo está en versión v0.1 con pocas descargas (515) y me gusta (3); la madurez y el soporte de la comunidad son limitados.
- No se documentan cuantizaciones oficiales ni cifras de latencia, lo que dificulta planificar despliegues en producción.

## Enlaces

- Hugging Face: https://huggingface.co/H3-Tiny/H3-Tiny-17B-FewStep-v0.1
- Página del proyecto: https://fuyi25.github.io/MiniMax-H3-Tiny/
- GitHub: https://github.com/fuyi25/MiniMax-H3-Tiny
- Colección H3-Tiny: https://huggingface.co/collections/H3-Tiny/h3-tiny-v01-6afeea67147c27cf3b80820a
- Pesos para ComfyUI: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-ComfyUI
- Nodos ComfyUI: https://github.com/fuyi25/MiniMax-H3-Tiny/tree/main/comfyui
- Licencia: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-17B-FewStep-Ref2VA-v0.1/blob/main/LICENSE-MiniMax-H3
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Incidencias: https://github.com/fuyi25/MiniMax-H3-Tiny/issues
