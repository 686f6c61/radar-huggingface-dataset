# JotaroArbuznik/Florence-2-base

## Resumen

Florence-2-base es un modelo fundacional de visión desarrollado por Microsoft Research, publicado originalmente en noviembre de 2023 junto con el informe técnico arXiv:2311.06242. El repositorio analizado aquí (`JotaroArbuznik/Florence-2-base`) es una réplica del checkpoint oficial de Microsoft, con 231.567.705 parámetros (0,23B) en formato safetensors y un tamaño de repositorio de 0,9 GB. Emplea una arquitectura seq2seq basada en transformer que unifica tareas de visión y visión-lenguaje mediante *prompts* de texto: el mismo modelo ejecuta subtitulado, detección de objetos, segmentación o *grounding* simplemente cambiando la etiqueta de tarea (`<CAPTION>`, `<OD>`, `<CAPTION_TO_PHRASE_GROUNDING>`, etc.).

Su relevancia radica en el enfoque multi-tarea unificado: en lugar de mantener cabezas especializadas por tarea, Florence-2 trata cada tarea como una secuencia de texto generada condicionada por la imagen, lo que permite un único conjunto de pesos para decenas de tareas visuales. Fue entrenado sobre FLD-5B, un corpus de 5.400 millones de anotaciones sobre 126 millones de imágenes, lo que le confiere un rendimiento competitivo en ajuste cero y como base para *fine-tuning*.

Esta réplica concreta presenta 0 descargas y 0 *likes*, y no incluye información sobre idiomas soportados en los metadatos. La licencia es MIT, lo que facilita su uso comercial, aunque conviene verificar la procedencia del checkpoint frente al repositorio oficial de Microsoft.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer seq2seq (encoder-decoder) multimodal, con codificador visual DaViT y decodificador de lenguaje; implementación `transformers` con `trust_remote_code` |
| Parametros totales | 231.567.705 (0,23B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (entrenado en float16; compatible con cuantización estándar de PyTorch/transformers, no documentada en la model card) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (también `pytorch` según tags) |

## Arquitectura y entrenamiento

Florence-2 sigue una arquitectura secuencial imagen-a-texto: un codificador visual procesa la imagen y un decodificador autorregresivo genera la salida textual correspondiente a la tarea solicitada. La formulación unificada convierte tareas como detección de objetos o *grounding* de frases en generación de secuencias estructuradas (coordenadas de *bounding boxes* y etiquetas), que el procesador `post_process_generation` reconstruye a formato utilizable. El modelo fue entrenado en float16 y se distribuye con código personalizado (`custom_code`) que debe cargarse con `trust_remote_code=True`.

El entrenamiento se realizó sobre FLD-5B, un conjunto de 5.400 millones de anotaciones procedentes de 126 millones de imágenes, lo que constituye uno de los corpus de anotación visual más grandes publicados. La model card no detalla la composición exacta del dataset, el número de tokens de texto, ni si se aplicaron fases de RLHF o DPO; tampoco se documentan innovaciones como decodificación especulativa o atención lineal. El checkpoint aquí descrito es la variante *base* preentrenada (no la variante `-ft` ajustada en tareas *downstream*).

## Capacidades

- Generación de texto descriptivo a partir de imagen: subtitulado simple (`<CAPTION>`), detallado (`<DETAILED_CAPTION>`) y muy detallado (`<MORE_DETAILED_CAPTION>`).
- Detección de objetos con cajas delimitadoras y etiquetas (`<OD>`).
- *Grounding* de frases: localización de regiones descritas en un texto de entrada (`<CAPTION_TO_PHRASE_GROUNDING>`).
- Subtitulado denso por región: cajas con descripciones textuales asociadas (`<DENSE_REGION_CAPTION>`).
- Propuesta de regiones sin etiqueta semántica (`<REGION_PROPOSAL>`).
- Segmentación (referida en el informe técnico y en el ecosistema Florence-2; la model card de esta réplica no detalla el *prompt* concreto).
- Ejecución multi-tarea mediante cambio de *prompt*, sin cabezas especializadas.
- No se documenta soporte de *tool calling*, agentes, modo *thinking*, audio ni otras modalidades distintas de imagen y texto.

## Casos de uso

- **Etiquetado automático de catálogos de producto**: usar `<DENSE_REGION_CAPTION>` para generar descripciones por región de cada imagen de producto, alimentando un pipeline de metadatos sin intervención manual.
- **Anotación previa para datasets de visión**: emplear `<OD>` y `<REGION_PROPOSAL>` para preanotar cajas delimitadoras y reducir el coste de etiquetado humano en proyectos de detección de objetos.
- **Accesibilidad y descripción de imágenes**: generar `<MORE_DETAILED_CAPTION>` para lectores de pantalla o plataformas que requieran texto alternativo enriquecido.
- **Búsqueda visual por descripción**: combinar `<CAPTION_TO_PHRASE_GROUNDING>` con un índice de imágenes para localizar regiones que coincidan con consultas textuales del usuario.
- **Moderación y análisis de contenido visual**: extraer objetos y regiones relevantes de imágenes subidas por usuarios para clasificación posterior o revisión humana.
- **Base para *fine-tuning* en dominios verticales**: al ser la variante preentrenada de 0,23B con licencia MIT, sirve como punto de partida económico para ajustar tareas específicas (inspección industrial, imágenes médicas, etc.) en una sola GPU.
- **Prototipado rápido de pipelines visión-lenguaje**: su tamaño reducido y la API de `transformers` permiten integrarlo en cuadernos y servicios de prueba sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta réplica no incluye tablas de métricas (COCO, Flickr30k, etc.); para cifras oficiales debe consultarse el informe técnico arXiv:2311.06242 y los repositorios de Microsoft.

## Requisitos de hardware

- **VRAM estimada en float16**: en torno a 0,5 GB solo para pesos (231M parámetros × 2 bytes); con activaciones y procesador de imagen, un entorno de 2-4 GB de VRAM es suficiente para inferencia por lotes pequeños.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM; RTX 3060/4060, RTX 4090, A100 o H100 funcionan sin problema. También es viable en CPU para uso ocasional.
- **Consumer GPU**: sí, cabe holgadamente en GPUs de consumo actuales e incluso en equipos con 8 GB de RAM unificada.
- **Opciones de despliegue**: `transformers` con `AutoModelForCausalLM` y `trust_remote_code=True` (método documentado). No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- **Latencia y throughput**: no disponibles. El tamaño reducido sugiere latencias bajas, pero no hay mediciones publicadas en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Florence-2-base (esta réplica) | 0,23B | No disponible | Subtitulado, OD, grounding, regiones | MIT | Hugging Face (réplica de terceros) |
| Florence-2-base (oficial, Microsoft) | 0,23B | No disponible | Las mismas | MIT | Hugging Face (repositorio oficial) |
| Florence-2-large | 0,77B | No disponible | Las mismas | MIT | Hugging Face (repositorio oficial) |
| Florence-2-base-ft | 0,23B | No disponible | Las mismas, ajustado en downstream | MIT | Hugging Face (repositorio oficial) |

La comparación con modelos de otras familias (BLIP-2, Kosmos-2, Qwen-VL) no está disponible en la información proporcionada; no se aportan métricas que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- **Procedencia del checkpoint**: se trata de una réplica de un tercero (`JotaroArbuznik`) con 0 descargas; no hay garantía de que los pesos coincidan bit a bit con el checkpoint oficial de Microsoft. Para producción conviene usar `microsoft/Florence-2-base`.
- **Idiomas no documentados**: los metadatos no declaran idiomas soportados; el comportamiento multilingüe es incierto y debe validarse empíricamente.
- **Riesgo de alucinación**: como modelo generativo, puede producir descripciones o etiquetas plausibles pero incorrectas, especialmente en imágenes ambiguas o dominios alejados del entrenamiento.
- **Sesgos**: no se documentan análisis de sesgo en la información disponible; los sesgos de FLD-5B (composición y procedencia de las imágenes) se transfieren al modelo.
- **Contexto no especificado**: se desconoce la longitud máxima de secuencia, lo que limita planificar cargas de imágenes grandes o salidas muy extensas.
- **Código personalizado**: requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; auditar antes de desplegar en entornos sensibles.
- **Licencia MIT**: permite uso comercial, pero debe verificarse la cadena de licencias del checkpoint original de Microsoft y de los datos de entrenamiento.
- **Variante preentrenada**: al no ser la versión `-ft`, el rendimiento en tareas *downstream* sin ajuste puede ser inferior al de las variantes afinadas.

## Enlaces

- Repositorio analizado: https://huggingface.co/JotaroArbuznik/Florence-2-base
- Repositorio oficial de Microsoft: https://huggingface.co/microsoft/Florence-2-base
- Variante large oficial: https://huggingface.co/microsoft/Florence-2-large
- Variante base ajustada: https://huggingface.co/microsoft/Florence-2-base-ft
- Informe técnico: https://arxiv.org/abs/2311.06242
- Cuaderno de inferencia y visualización: https://huggingface.co/microsoft/Florence-2-large/blob/main/sample_inference.ipynb
- Licencia: https://huggingface.co/microsoft/Florence-2-base/resolve/main/LICENSE
