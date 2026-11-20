# H3-Tiny/H3-Tiny-14B-OKD-Ref2VA-v0.1

## Resumen

H3-Tiny-14B-OKD-Ref2VA-v0.1 es un modelo de generación conjunta de vídeo y audio a partir de texto e imágenes de referencia, desarrollado por el proyecto independiente H3-Tiny. Se trata de una versión podada y destilada del transformer MiniMax H3 Ref2VA, reducido de 33B a 14B parámetros mediante poda estructurada por bloques y recuperación posterior mediante destilación (OKD). El modelo resuelve la generación de vídeo con audio sincronizado condicionada por imágenes de referencia, un flujo conocido como Ref2VA (reference-to-video + audio).

La relevancia de este checkpoint radica en que ofrece un modelo de generación de vídeo de 14B parámetros (13.989.119.056 parámetros reales en safetensors) que puede ejecutarse con requisitos de hardware más modestos que el modelo original de 33B, manteniendo el pipeline completo de MiniMax H3. El repositorio contiene únicamente el transformer en formato diffusers; el codificador de texto, los VAE y los procesadores deben obtenerse del checkpoint oficial de MiniMax H3.

El modelo se distribuye bajo la MiniMax H3 Community License Agreement, con restricciones territoriales y de uso aceptable, y no está afiliado ni respaldado por MiniMax. La información pública disponible es limitada: no se han publicado benchmarks, idiomas soportados ni detalles completos del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión para generación de vídeo y audio (pipeline MiniMax H3 Ref2VA, podado) |
| Parametros totales | 13.989.119.056 (13,99B, solo transformer) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el repo no documenta cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license (MiniMax H3 Community License Agreement) |
| Formato de pesos | safetensors (layout diffusers, sharded; config.json incluido) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión para generación conjunta de vídeo y audio, derivado del MiniMax H3 Ref2VA de 33B parámetros. La construcción sigue una cadena de poda estructurada: partiendo del modelo de 33B se obtiene un checkpoint intermedio de 17B (H3-Tiny-17B-Pruned-Ref2VA), al que se le estrechan las FFN de todos los bloques de 14336 a 9792 canales, dando lugar a la variante de 14B. Posteriormente, este modelo se recupera mediante OKD (destilación desde el profesor de 33B), lo que compensa parte de la pérdida de capacidad introducida por la poda.

El pipeline de inferencia utiliza 50 pasos de muestreo y requiere el codificador de texto, los VAE y los procesadores del checkpoint oficial de MiniMax H3 en formato diffusers. El repositorio solo contiene el transformer; no se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. La innovación técnica principal es la combinación de poda estructurada por canales en las FFN con destilación de recuperación, que permite reducir el tamaño del modelo aproximadamente un 58% respecto al original.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video).
- Generación de vídeo condicionada por imágenes de referencia (reference-to-video), con sintaxis de prompt tipo `<Picture 1> ...`.
- Generación conjunta de audio sincronizado con el vídeo (Ref2VA: reference-to-video + audio).
- Control del número de fotogramas generados (por ejemplo, `--num-frames 124` en el script de inferencia).
- Integración con la librería diffusers mediante `h3tiny.pipeline.load_pipeline`.
- Soporte de backends de atención y offloading configurables (documentado en el README de GitHub).
- Tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Generación de clips publicitarios con audio: a partir de una o varias imágenes de producto de referencia, el modelo genera un vídeo con audio sincronizado, adecuado para prototipos rápidos de anuncios sin rodaje.
- Previsualización de storyboards: un equipo de animación puede convertir ilustraciones de referencia en secuencias animadas con sonido para validar ritmo y composición antes de la producción final.
- Creación de contenido para redes sociales: generación de vídeos cortos con audio a partir de imágenes de marca, con control del número de fotogramas para ajustarse a formatos verticales u horizontales.
- Prototipado en investigación de generación multimodal: el checkpoint de 14B permite experimentar con el pipeline Ref2VA en GPUs de menor capacidad que las necesarias para el modelo de 33B, facilitando la iteración en laboratorios con recursos limitados.
- Generación de material educativo animado: a partir de diagramas o ilustraciones de referencia se pueden producir explicaciones animadas con locución o efectos de audio.
- Pruebas de concepto de doblaje y sonorización automática: el componente de audio permite evaluar flujos de generación de sonido asociado al vídeo en pipelines de postproducción.
- Evaluación de técnicas de poda y destilación: el modelo sirve como caso de estudio reproducible para investigadores que analizan el equilibrio entre reducción de parámetros y calidad generativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un transformer de 13,99B parámetros en precisión de 16 bits requiere aproximadamente 28 GB solo para los pesos, a los que hay que sumar el codificador de texto y los VAE del checkpoint base de MiniMax H3; el requisito total será superior.
- GPU recomendadas: no disponible. Por tamaño, se requiere al menos una GPU con 40-80 GB de VRAM (A100 40/80 GB, H100) para ejecución completa en 16 bits, o configuraciones multi-GPU.
- ¿Cabe en GPU de consumo? No de forma directa en 16 bits; sería necesario cuantizar o aplicar offloading, opción que el README de GitHub menciona como configurable pero sin cifras publicadas.
- Opciones de despliegue: script `scripts/infer.py` del repositorio H3-Tiny, API Python `h3tiny.pipeline.load_pipeline` con backend CUDA, y ecosistema diffusers. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de vídeo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| H3-Tiny-14B-OKD-Ref2VA-v0.1 | 13,99B (transformer) | Difusión vídeo+audio Ref2VA | no disponible | MiniMax H3 Community License | Hugging Face (80 descargas) |
| MiniMax H3 Ref2VA (original) | 33B | Difusión vídeo+audio Ref2VA | no disponible | MiniMax H3 Community License | Checkpoint oficial MiniMax |
| H3-Tiny-17B-Pruned-Ref2VA | 17B | Difusión vídeo+audio Ref2VA (podado) | no disponible | MiniMax H3 Community License | Hugging Face (proyecto H3-Tiny) |

No se dispone de datos de benchmarks que permitan comparar el rendimiento generativo entre estas variantes. La comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al heredar el entrenamiento del modelo base MiniMax H3, es previsible que arrastre los sesgos de este, pero no hay confirmación oficial.
- Riesgo de alucinación: inherente a los modelos generativos de difusión; no se han publicado evaluaciones específicas de fidelidad a las imágenes de referencia.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están documentados.
- Restricciones de licencia: los pesos son derivados de MiniMax H3 y se distribuyen bajo la MiniMax H3 Community License Agreement, que incluye ámbito territorial y política de uso aceptable; es obligatorio revisar la licencia y el NOTICE antes de cualquier uso comercial.
- Dependencia del checkpoint base: el repositorio solo contiene el transformer; sin el codificador de texto, los VAE y los procesadores del checkpoint oficial de MiniMax H3 el modelo no es funcional.
- Pérdida de calidad por poda: al reducir las FFN de 14336 a 9792 canales, es esperable una degradación respecto al modelo de 33B, parcialmente mitigada por la destilación OKD, pero sin métricas públicas que la cuantifiquen.
- Madurez: versión v0.1 con solo 80 descargas y 3 likes; ecosistema de herramientas y documentación limitados.
- Proyecto independiente no afiliado a MiniMax; el soporte y las actualizaciones dependen del equipo H3-Tiny.

## Enlaces

- Hugging Face: https://huggingface.co/H3-Tiny/H3-Tiny-14B-OKD-Ref2VA-v0.1
- Repositorio de código: https://github.com/fuyi25/H3-Tiny
- Página del proyecto: https://fuyi25.github.io/H3-Tiny/
- Checkpoints del proyecto: https://huggingface.co/H3-Tiny
- Licencia: https://huggingface.co/H3-Tiny/H3-Tiny-14B-OKD-Ref2VA-v0.1/blob/main/LICENSE-MiniMax-H3
