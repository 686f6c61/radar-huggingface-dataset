# abliter8-ai/lfm3-2b-omni-abliter8-mlx

## Resumen

`abliter8-ai/lfm3-2b-omni-abliter8-mlx` es una edición comunitaria del modelo multimodal `LiquidAI/LFM3-Omni-2B`, publicada por abliter8-ai. Se trata de una versión con la dirección de rechazo ablacionada (*abliterated*) sobre el backbone de lenguaje, manteniendo intactos el codificador de visión, el codificador de audio, el proyector y el códec de audio LiquidCodec del modelo original. El resultado es un modelo any-to-any de clase 2B que acepta texto, imagen y audio, y que prácticamente ha eliminado las respuestas de rechazo en las pruebas declaradas por el autor (0/100 en rechazos dañinos estrictos, 3/100 en el criterio amplio).

El modelo base lo desarrolla Liquid AI dentro de la familia LFM3, presentada en octubre de 2026 como un conjunto de seis modelos abiertos de clase 2B construidos sobre un backbone compartido (texto, visión, audio, omni y decisión) con arquitectura descrita por el fabricante como *tri-hybrid*. La relevancia de esta ficha concreta es doble: por un lado, permite ejecutar un modelo omni de 2B en hardware de consumo, incluidos equipos Apple Silicon gracias a los pesos MLX publicados; por otro, documenta un caso de modificación de alineamiento con métricas de divergencia explícitas (KLD medio de 0,0004 frente al original, 89,17% de coincidencia en top-1), lo que lo convierte en material de interés para investigación en seguridad y robustez de alineamiento.

La ficha del autor advierte de que las comprobaciones funcionales de imagen y audio siguen pendientes para la fila final de aceptación, y de que el modelo solo declara inglés. La licencia es la LFM Open License v1.0 del modelo base, no una licencia permisiva estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Tri-hybrid de Liquid AI (backbone LFM3); la ablación actúa sobre `self_attn.o_proj`, `feed_forward.w2` y `conv.out_proj`, lo que indica presencia de capas convolucionales en el backbone |
| Parámetros totales | Clase 2B (backbone de lenguaje de 1,7B según la model card) |
| Parámetros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16; GGUF Q8_0, Q6_K, Q4_K_M, Q4_0; MLX 8-bit, 6-bit y 4-bit |
| Idiomas soportados | Inglés (`en`) |
| Licencia | LFM Open License v1.0 (`lfm1.0`, marcada como `other` en HuggingFace) |
| Formato de pesos | Safetensors (Transformers), GGUF, MLX |
| Pipeline declarado | `any-to-any` |
| Modalidades de entrada | Texto, imagen (vision encoder), audio (audio encoder + LiquidCodec) |
| Tamaño del repositorio | 7,0 GB |
| Fecha de creación | 2026-10-28 |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia LFM3 de Liquid AI, construida sobre un backbone compartido de clase 2B con arquitectura que el fabricante denomina *tri-hybrid*. La model card del autor confirma, por los módulos sobre los que se aplica la edición, que el backbone de lenguaje combina proyecciones de atención (`self_attn.o_proj`), capas feed-forward (`feed_forward.w2`) y proyecciones de salida convolucionales (`conv.out_proj`). El modelo omni añade un codificador de visión, un codificador de audio, un proyector multimodal y el códec LiquidCodec, todos ellos heredados sin modificación del modelo original. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO aplicadas por Liquid AI.

La edición de abliter8-ai no injerta pesos de la variante de texto de 1,7B: ajusta una dirección de rechazo calculada sobre las activaciones del propio modelo Omni y la resta en las capas 8 a 23, únicamente en los módulos que escriben en el flujo residual (`self_attn.o_proj`, `feed_forward.w2`, `conv.out_proj`), con un factor `alpha = 2.0`. Los tensores de visión, audio, proyector y códec quedan byte a byte idénticos al original. El autor reporta una divergencia media de 0,0004 en KLD respecto al modelo de referencia y un 89,17% de coincidencia en el token top-1, lo que indica que el comportamiento de texto se preserva en gran medida.

## Capacidades

- Generación de texto en inglés con el backbone de lenguaje LFM3 de 1,7B.
- Comprensión de imágenes mediante el codificador de visión del modelo base, sin modificaciones respecto al original.
- Procesamiento de audio mediante el codificador de audio y LiquidCodec, también intactos.
- Pipeline `any-to-any`: el modelo está registrado en HuggingFace con esta etiqueta de pipeline, si bien la información disponible no detalla qué modalidades de salida están soportadas más allá de texto.
- Ausencia prácticamente total de rechazos: 0/100 en la prueba estricta de rechazos dañinos y 3/100 en la amplia, según el autor.
- Sin falsos rechazos en XSTest (0/100), lo que sugiere que la ablación no ha degradado la respuesta a peticiones legítimas en esa batería.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la metadata del modelo.
- Vídeo: la model card indica que la entrada de vídeo no está soportada en llama.cpp y que debe usarse Transformers cuando se requiera; no se detalla el soporte en esa ruta.

## Casos de uso

- Investigación en seguridad y alineamiento: el modelo sirve como sujeto de estudio para medir cómo una ablación de dirección de rechazo afecta a la tasa de cumplimiento de peticiones dañinas, con la ventaja de que el autor publica métricas de divergencia (KLD, top-1) frente al original que permiten aislar el efecto de la edición.
- Red teaming y evaluación de filtros de contenido: al generar respuestas sin rechazo, permite probar clasificadores y guardrails de producción contra un modelo que no se autolimita, en lugar de contra uno que rechaza de forma sistemática.
- Análisis de material audiovisual sensible en local: pipelines de moderación, peritaje o revisión de contenido donde los rechazos del modelo base interrumpen el flujo, ejecutados en hardware propio para no enviar los datos a terceros.
- Asistentes de voz en dispositivos Apple: los pesos MLX de 4, 6 y 8 bits permiten desplegar el modelo en Macs con memoria unificada, procesando audio de entrada y generando texto sin conexión a servicios externos.
- Etiquetado y descripción de datasets multimodales: generación de descripciones de imágenes y resúmenes de audio a escala para construir corpus de entrenamiento, con la ventaja de que el modelo no bloquea categorías de contenido que otros modelos rechazan.
- Prototipado rápido de aplicaciones omni: al publicarse en BF16, GGUF y MLX, un mismo modelo sirve para validar una idea en un portátil (MLX o llama.cpp con Q4_K_M) y luego moverla a un servidor con Transformers sin cambiar de arquitectura.
- Escritura creativa y generación de ficción sin filtros: guiones, narrativa o diálogos que abordan violencia, sexualidad o temas controvertidos, donde el modelo base tendería a rechazar o suavizar la petición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica métricas de la ablación y de fidelidad frente al modelo original.

Comparación Q8_0 frente a `LiquidAI/LFM3-Omni-2B` (datos del autor):

| Prueba | Resultado |
|---|---:|
| Rechazos dañinos, criterio amplio | 3/100 |
| Rechazos dañinos, criterio estricto | 0/100 |
| Falsos rechazos en XSTest | 0/100 |
| KLD medio frente al Omni original | 0,0004 |
| Coincidencia top-1 frente al Omni original | 89,17% |

Fidelidad por formato de cuantización (datos del autor):

| Formato | Estado | KLD | Top-1 |
|---|---|---:|---:|
| BF16 | Construido | No disponible | No disponible |
| GGUF Q8_0 | Construido, pruebas de texto completadas | No disponible | No disponible |
| GGUF Q6_K | Construido | 0,055 | 88,3% |
| GGUF Q4_K_M | Construido | 0,120 | 83,5% |
| GGUF Q4_0 | Construido | 0,179 | 80,7% |
| MLX 8-bit / 6-bit / 4-bit | Construidos | No disponible | No disponible |

## Requisitos de hardware

- VRAM estimada para BF16: en torno a 4 GB solo para los pesos del backbone de 1,7B; contando codificadores, proyector y códec, el repositorio completo ocupa 7,0 GB, por lo que conviene reservar 8-10 GB de memoria para inferencia con caché. Estimación propia a partir del tamaño del repositorio, no confirmada por el autor.
- VRAM estimada en GGUF: aproximadamente 2,5-3 GB para Q8_0 y 1,5-2 GB para Q4_K_M, añadiendo el `mmproj` para entrada multimodal. Estimación propia.
- GPU de consumo: el modelo cabe holgadamente en tarjetas de 8 GB (RTX 3060 Ti, 4060, 3070) en cuantizaciones Q4 y Q8, y en 12-16 GB sin cuantizar. Las GPUs de datacenter (A100, H100) no son necesarias para este tamaño.
- Apple Silicon: la publicación de pesos MLX en 4, 6 y 8 bits está pensada para Macs con memoria unificada; un equipo con 16 GB puede ejecutar las variantes cuantizadas.
- Opciones de despliegue: Transformers (ruta de referencia, necesaria para entrada de vídeo según el autor), llama.cpp mediante `llama-server` con `--mmproj mmproj-LFM3-Omni-2B.gguf --jinja`, y MLX para Apple Silicon. No se mencionan vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Formatos | Notas |
|---|---|---|---|---|---|---|
| lfm3-2b-omni-abliter8-mlx (esta ficha) | Clase 2B (backbone 1,7B) | No disponible | Texto, imagen, audio (entrada) | LFM Open License v1.0 | Safetensors, GGUF, MLX | Rechazos ablacionados; verificaciones de imagen y audio pendientes |
| LiquidAI/LFM3-Omni-2B | Clase 2B (backbone 1,7B) | No disponible | Texto, imagen, audio | LFM Open License v1.0 | No disponible en la información | Modelo original, alineado; base de esta edición |
| LFM3-VL-2B | Clase 2B | No disponible | Texto, imagen, vídeo | No disponible en la información | No disponible en la información | Variante de visión de la misma familia, con codificador visual propio |
| LFM3 (variante de texto 2B) | Clase 2B | No disponible | Texto | No disponible en la información | No disponible en la información | Miembro de texto de la familia, sobre el mismo backbone |

## Limitaciones y advertencias

- La ablación elimina deliberadamente el comportamiento de rechazo: el modelo cumplirá peticiones que el original rechazaría, incluidas potencialmente solicitudes dañinas. No debe desplegarse en producción orientada a usuarios finales sin guardrails externos.
- El autor reporta 3/100 rechazos en el criterio amplio y 0/100 en el estricto, lo que significa que la capacidad de negarse está prácticamente suprimida, no solo reducida.
- Las comprobaciones funcionales de imagen y audio están pendientes según la propia model card: la fidelidad multimodal respecto al original no está verificada, solo la de texto.
- Solo se declara inglés; no hay evidencia de comportamiento aceptable en castellano ni en otros idiomas.
- Longitud de contexto no documentada: no es posible planificar cargas de trabajo con ventanas largas sin verificarla empíricamente.
- No se han publicado benchmarks de calidad (MMLU, HumanEval, GSM8K) ni del modelo base ni de esta edición; las únicas métricas son de divergencia y de rechazo.
- Es una edición comunitaria no auditada por Liquid AI; el autor se describe a sí mismo como aficionado y no profesional del sector.
- La licencia LFM Open License v1.0 impone condiciones propias distintas de las licencias permisivas habituales; es responsabilidad del usuario revisar los términos antes de cualquier uso comercial, y la información disponible no detalla esas condiciones.
- Riesgo de alucinación propio de un modelo de 2B, agravado por la falta de evaluaciones publicadas.
- La entrada de vídeo no está soportada en llama.cpp según el autor; requiere la ruta de Transformers.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abliter8-ai/lfm3-2b-omni-abliter8-mlx
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM3-Omni-2B/blob/main/LICENSE
- Colección LFM3 abliter8: https://huggingface.co/collections/abliter8-ai/lfm3-abliter8
- Perfil del autor en HuggingFace: https://huggingface.co/abliter8-ai
- Perfil del autor en GitHub: https://github.com/abliter8-ai/
- Anuncio de la familia LFM3 (Liquid AI): https://www.liquid.ai/blog/lfm3
- Cobertura de MarkTechPost sobre LFM3: https://www.marktechpost.com/2026/10/27/liquid-ai-lfm3-open-weight-2b-multimodal-models/
- Ficha de LFM3 en LM Studio: https://lmstudio.ai/models/lfm3
