# Microguy1/StereoCrafter-DUPLI

## Resumen

StereoCrafter es un modelo de difusión desarrollado por Tencent AI Lab y ARC Lab (Tencent PCG) para convertir vídeos monoculares 2D en vídeos estereoscópicos 3D de alta fidelidad. El repositorio `Microguy1/StereoCrafter-DUPLI` es una réplica no oficial (DUPLI) de los pesos originales publicados en `TencentARC/StereoCrafter`, con 1.524.625.962 parámetros y un tamaño de repositorio de 3,0 GB en formato safetensors. Está pensado para su uso con la librería `diffusers`.

El modelo aborda un problema clásico de la producción de contenido inmersivo: la generación automática de la segunda vista (ojo derecho) a partir de un vídeo monocular, manteniendo coherencia temporal en secuencias largas. Es relevante para flujos de posproducción, creación de contenido para dispositivos como Apple Vision Pro o pantallas 3D, y para la conversión de material de archivo a formatos estereoscópicos sin captura nativa con dos cámaras.

La información disponible sobre esta réplica concreta es limitada: no se especifican la longitud de contexto, los idiomas soportados ni los tipos de cuantización, y el repositorio no registra descargas ni interacciones. La ficha se completa con los datos técnicos del paper original y de la model card cuando están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (diffusion-based), orientado a generación de vídeo estereoscópico; detalles internos de la red no disponibles en la información proporcionada |
| Parametros totales | 1.524.625.962 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | `other` (con `license_name: license` y `license_link: LICENSE` en el repositorio) |
| Formato de pesos | safetensors |
| Libreria | diffusers |
| Tamano del repositorio | 3,0 GB |
| Referencia | arXiv:2409.07447 |

## Arquitectura y entrenamiento

Según la model card, StereoCrafter es un marco de trabajo basado en difusión que convierte vídeos 2D en vídeos estereoscópicos 3D aptos para distintos dispositivos de visualización (gafas 3D, Apple Vision Pro, pantallas 3D). El modelo está diseñado para generar secuencias largas y de alta fidelidad, lo que implica mecanismos de coherencia temporal que no se detallan en la información proporcionada.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas (atención lineal, decodificación especulativa, etc.) en la información disponible. La model card únicamente describe el objetivo funcional y los autores del trabajo original; para detalles de arquitectura y entrenamiento debe consultarse el paper arXiv:2409.07447 y la página del proyecto.

## Capacidades

- Conversión de vídeo monocular 2D a vídeo estereoscópico 3D.
- Generación de la vista secundaria con coherencia temporal en secuencias largas (según la descripción del paper).
- Aplicable a diversas fuentes de vídeo: películas, vlogs, animaciones 3D y vídeos generados por IA (AIGC).
- Salida compatible con distintos dispositivos de visualización 3D (gafas 3D, Apple Vision Pro, pantallas 3D).
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo textual ni modalidades de audio.

## Casos de uso

- Posproducción de cine y series: conversión de material rodado en mono a una versión estereoscópica para salas 3D, usando el modelo para generar la vista derecha sin necesidad de una segunda cámara.
- Creación de contenido para Apple Vision Pro: generación de vídeos espaciales a partir de grabaciones convencionales para su consumo en visores de realidad mixta.
- Recuperación de archivo audiovisual: estereoscopización de material histórico o de catálogo que solo existe en 2D, ampliando su valor comercial en plataformas 3D.
- Contenido para pantallas 3D sin gafas (autostereoscópicas): generación de pares estéreo adaptados a displays que requieren múltiples vistas.
- Producción de vídeo generado por IA (AIGC): añadir profundidad estereoscópica a clips sintéticos creados con modelos de texto a vídeo para experiencias inmersivas.
- Vlogs y contenido de creadores: conversión semiautomática de grabaciones de cámara única a formato 3D para plataformas de vídeo inmersivo.
- Prototipado e investigación en visión por computador: uso del modelo como referencia para experimentos de síntesis de vistas y coherencia temporal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 1.524.625.962 parámetros en safetensors (3,0 GB de repositorio), la inferencia en precisión completa requeriría del orden de varios GB de VRAM, pero no se confirma el dato.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del repositorio (3,0 GB) sugiere que podría caber en GPUs de consumo con VRAM suficiente, pero no hay datos oficiales.
- Opciones de despliegue: la librería indicada es `diffusers`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no a difusión de vídeo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StereoCrafter-DUPLI (esta réplica) | 1.524.625.962 | No disponible | 2D a estéreo 3D | `other` | Hugging Face (réplica no oficial) |
| StereoCrafter (TencentARC) | No disponible en la información | No disponible | 2D a estéreo 3D | No disponible en la información | Hugging Face (oficial) |
| Otros modelos de estereoscopía 2D a 3D | No disponible | No disponible | 2D a estéreo 3D | No disponible | No disponible |

No se dispone de información suficiente para comparar con alternativas de la misma categoría en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Réplica no oficial: el repositorio `Microguy1/StereoCrafter-DUPLI` no pertenece a Tencent AI Lab; se desconoce si los pesos son idénticos a los originales o han sido modificados.
- Licencia `other` con `license_name: license`: los términos exactos no se detallan en la información disponible; es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial.
- Sin métricas de calidad publicadas para esta réplica: no hay benchmarks ni evaluaciones que confirmen el rendimiento.
- Riesgo de artefactos y alucinaciones visuales en la generación de la vista secundaria, inherente a los modelos de difusión; no cuantificado en la información disponible.
- Sin datos sobre sesgos, cobertura idiomática o limitaciones de contexto.
- Repositorio sin descargas ni interacciones: no hay evidencia de validación por parte de la comunidad.
- Uso previsto limitado a conversión de vídeo a estéreo 3D; no es un modelo de lenguaje ni soporta tool calling.

## Enlaces

- Repositorio Hugging Face (réplica): https://huggingface.co/Microguy1/StereoCrafter-DUPLI
- Repositorio Hugging Face oficial: https://huggingface.co/TencentARC/StereoCrafter
- Paper: https://arxiv.org/abs/2409.07447
- Página del proyecto: https://stereocrafter.github.io/
