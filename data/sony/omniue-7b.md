# Sony/OmniUE-7B

## Resumen

OmniUE-7B es un embedder universal multimodal condicionado por instrucciones desarrollado por Sony, presentado en NeurIPS 2026 bajo el nombre "Omni-Interactive Universal Embedder". El modelo mapea texto, imágenes, vídeo y audio en un único espacio de embeddings de 3.584 dimensiones, y su rasgo distintivo es la interactividad: admite prompts visuales mediante cajas delimitadoras o puntos, y prompts de audio mediante intervalos temporales, lo que permite representar regiones u objetos concretos de una imagen o fragmentos concretos de un sonido.

Técnicamente, el checkpoint es un adaptador LoRA sobre Qwen2.5-Omni-7B, al que se añade un módulo de interacción compuesto por SAM-Audio y SAM3 (ambos de Meta). Todo el paquete (adaptador, SAM-Audio y SAM3) se distribuye junto en el repositorio, mientras que Qwen2.5-Omni-7B y T5 se descargan automáticamente como dependencias.

Su relevancia reside en que unifica en un solo modelo tareas que tradicionalmente requerían embedders especializados por modalidad (texto-imagen, vídeo, audio), añadiendo además recuperación interactiva a nivel de región y de segmento temporal, una capacidad que según los benchmarks publicados supera con margen a los mejores baselines de su tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adapter sobre Qwen2.5-Omni-7B (omni-thinker) + modulo de interaccion SAM-Audio + SAM3 |
| Parametros totales | no disponible (base Qwen2.5-Omni-7B, ~7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos sin cuantizar) |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | mixta: CC BY-NC 4.0 para los pesos de OmniUE; SAM License de Meta para SAM-Audio y SAM3; licencias upstream de Qwen |
| Formato de pesos | safetensors (via transformers), tamano del repo 11,4 GB |
| Dimension del embedding | 3584 (L2-normalizado, float32) |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

OmniUE parte de Qwen2.5-Omni-7B, un modelo omni-modal basado en transformer capaz de procesar texto, imagen, vídeo y audio. Sobre este base se entrena un adaptador LoRA que convierte el modelo generativo en un embedder universal condicionado por instrucciones: la misma entrada puede producir embeddings distintos según la instruccion en lenguaje natural que la acompañe. El espacio de salida es un vector unico de 3.584 dimensiones, normalizado con L2, lo que permite comparar cualquier par de modalidades por similitud coseno.

El modulo de interaccion se apoya en SAM3 para el dominio visual (cajas `[x1, y1, x2, y2]` y puntos con etiquetas de primer/segundo plano, ambos normalizados a `[0, 1]`) y en SAM-Audio para el dominio sonoro (spans temporales como `(3.0, 8.0)`). No se ha publicado informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO; el paper de referencia es arXiv:2608.27044.

## Capacidades

- Embeddings universales any-to-any: codifica texto, imagen, vídeo y audio en un mismo espacio de 3.584 dimensiones, habilitando recuperacion cruzada entre cualquier combinacion de modalidades.
- Embeddings condicionados por instruccion: la instruccion en lenguaje natural dirige que aspecto de la entrada se representa ("Find the matching description.", "Represent the selected object.", etc.).
- Interaccion visual: embeddings a nivel de region mediante bounding boxes o puntos (con etiquetas foreground/background), utiles para recuperacion de objetos concretos dentro de una imagen.
- Interaccion de audio: embeddings de fragmentos temporales concretos de un fichero de audio o de la pista de audio de un vídeo.
- API uniforme: `encode_text`, `encode_image`, `encode_video` y `encode_audio`, todas devolviendo arrays NumPy float32 de forma `[batch_size, 3584]`, con utilidades como `cosine_topk` para recuperacion.
- CLI incluida (`examples/retrieve.py`) y smoke test para verificar la instalacion, incluida la ruta de interacciones.
- No es un modelo de generacion de texto: el pipeline es feature-extraction, no text-generation.

## Casos de uso

- Busqueda semantica de vídeo por texto: dado un corpus de vídeos, se precalculan embeddings con `encode_video` y se consultan con descripciones en lenguaje natural; util para catalogos audiovisuales y archivos de produccion.
- Recuperacion de audio por descripcion: localizar en bibliotecas de sonido el clip que corresponde a una descripcion textual, o al fragmento concreto dentro de un clip largo usando spans temporales.
- Recuperacion region-a-texto (SCaR): dado un objeto señalado con una caja en una imagen, recuperar captions o textos que describan exactamente esa region; aplicable a catalogacion de imagenes con anotacion fina.
- Deduplicacion y clustering multimodal: agrupar contenido heterogeneo (textos, imagenes, audios) en un espacio comun para deteccion de duplicados o organizacion de datasets de entrenamiento.
- RAG multimodal: usar los embeddings como indexador de una base vectorial que mezcle documentos, imagenes, transcripciones y vídeos, recuperando evidencia en la modalidad original.
- Moderacion y analisis de contenido: representar segmentos concretos de vídeo o audio (via instrucciones y prompts interactivos) para buscar contenido similar a ejemplos de referencia.
- Investigacion en embeddings interactivos: el modelo se publica explicitamente como recurso de investigacion para explorar recuperacion condicionada por instruccion y any-to-any.

## Benchmarks y rendimiento

Resultados publicados en la model card (solo se dispone del valor global de OmniUE-7B en cada benchmark; los desgloses por tarea estan en las figuras del repo):

| Benchmark | Tarea | OmniUE-7B (overall) | Mejor baseline comparable |
|---|---|---|---|
| MMEB-v2-video | video interactivo por texto | 51,8 | +4,3 puntos de ventaja sobre el mejor baseline de 7B |
| MAEB | audio interactivo por texto | 53,4 | mejor global; gana a LCO-Emb-7B en 7 de 8 meta-tareas |
| SCaR | texto-imagen-a-texto interactivo visual | 55,2 | +27,4 puntos sobre el mejor baseline de 7B |
| OmniCHOIR | recuperacion de audio omni-interactiva (Recall@1) | 28,4 | mascaras y spans superan al prompting solo-texto |

Caveats indicados por los propios autores: en MAEB, el clustering sigue siendo mejor en Qwen2-Audio y modelos CLAP, y la recuperacion cross-modal sigue siendo mejor en LCO-Emb.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Como referencia, el modelo completo (Qwen2.5-Omni-7B sin cuantizar mas los modulos SAM-Audio y SAM3) razonablemente requiere del orden de 20-24 GB de VRAM para inferencia en fp16/bf16; no hay cifras publicadas.
- GPU recomendadas: no disponible oficialmente; por tamano, una RTX 4090 (24 GB) o A100/H100 deberian ser adecuadas.
- Consumer GPU: plausible en tarjetas de 24 GB sin cuantizacion; con cuantizacion podria caber en menos VRAM, pero no hay pesos cuantizados publicados.
- Requisitos de software: Python 3.10 o superior, entorno con CUDA y `ffmpeg` en el `PATH` para decodificar audio de vídeos. Instalacion via `pip install -e .` tras clonar el repo.
- Despliegue: el paquete propio de OmniUE (`from omniue import OmniUE`); no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI (es un embedder con modulo de interaccion propio, no un LLM generativo estandar).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Interactividad | Licencia |
|---|---|---|---|---|
| Sony/OmniUE-7B | Embedder universal texto/imagen/video/audio | ~7B (LoRA sobre Qwen2.5-Omni-7B) | Boxes, puntos y spans temporales | CC BY-NC 4.0 (pesos OmniUE) |
| LCO-Emb-7B | Embedder audio (baseline citado) | 7B | no disponible | no disponible |
| Qwen2.5-Omni-7B | Modelo omni-modal generativo (base de OmniUE) | ~7B | no (generacion, no embeddings) | Apache-2.0 (upstream) |
| Modelos CLAP / Qwen2-Audio | Embedders de audio especializados | no disponible | no | no disponible |

OmniUE-7B se diferencia de sus alternativas en que es el unico que cubre las cuatro modalidades con prompts interactivos; los baselines citados son especialistas en audio y, segun la model card, aun asi pierden frente a OmniUE en la mayoria de meta-tareas de MAEB.

## Limitaciones y advertencias

- Licencia no comercial: los pesos especificos de OmniUE estan bajo CC BY-NC 4.0, lo que excluye uso comercial. Ademas, los componentes SAM-Audio y SAM3 arrastran la SAM License de Meta, y Qwen2.5-Omni conserva sus terminos upstream: hay que revisar las cuatro licencias antes de cualquier despliegue.
- Orientado a investigacion: la model card indica explicitamente que no se ha evaluado para decisiones de alto riesgo o seguridad critica.
- Riesgo de variabilidad de rendimiento: los autores advierten que los resultados pueden variar segun dominio, calidad de la modalidad, idioma y formulacion del prompt (el modelo es sensible a la instruccion condicional).
- Idioma: la model card declara solo ingles; el comportamiento con instrucciones en castellano no esta documentado.
- Dependencias pesadas: requiere descargar Qwen2.5-Omni-7B y T5 automaticamente, ademas de `ffmpeg`; el repo completo pesa 11,4 GB antes de las dependencias.
- Adopcion minima: 9 descargas y 1 like en el momento de la ficha, por lo que hay poca evidencia de uso en produccion por terceros.
- Alucinacion: no aplica directamente al ser un embedder, pero la calidad de los embeddings depende de la fidelidad de los modulos SAM; errores de segmentacion se propagarian a la representacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sony/OmniUE-7B
- Paper (arXiv): https://arxiv.org/abs/2608.27044
- Webpage / demo: https://wywywang.github.io/omniue-demo/
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Licencia CC BY-NC 4.0: https://creativecommons.org/licenses/by-nc/4.0/
