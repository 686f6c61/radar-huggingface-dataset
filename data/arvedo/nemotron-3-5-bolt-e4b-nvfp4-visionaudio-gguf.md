# arvedo/Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio-GGUF

## Resumen

Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio-GGUF es una exportación comunitaria en formato GGUF de los pesos NVFP4 del modelo NVIDIA Nemotron-3.5-Bolt-E4B, un modelo de lenguaje pequeño multimodal (texto, visión y audio) de aproximadamente 7.500 millones de parámetros totales del que se derivan unos 4.000 millones de parámetros activos según la nomenclatura E4B del modelo base. El autor de la exportación es arvedo, mientras que el modelo original lo desarrolla NVIDIA a través de su laboratorio de investigación Nemotron. El paquete incluye un modelo de texto de 6,11 GB más un proyector multimodal de 946 MB, pensado para pruebas locales en `llama.cpp`, en CPU o en escritorio sin necesidad de disponer de Linux ni de vLLM.

El problema que aborda esta ficha es el de facilitar el despliegue local de un modelo multimodal optimizado para velocidad e inteligencia por gigabyte en agentes conversacionales. La exportación emplea cuantización nativa NVFP4 (formato E2M1 con tablas de búsqueda por capas) y una tabla de embeddings por capa (PLE) cuantizada a Q8_0. El contexto de referencia del modelo base es de 128.000 tokens, según la calibración NVFP4 documentada por el autor.

La relevancia actual de esta publicación radica en que permite evaluar los pesos NVFP4 de NVIDIA en hardware de consumo mediante `llama.cpp`, aunque con una advertencia explícita del autor: `llama.cpp` emula NVFP4 por software y no aprovecha los núcleos tensoriales FP4 nativos de Blackwell, por lo que esta edición GGUF no es más rápida que un GGUF Q4_K_M estándar. Para máximo rendimiento en GPU Blackwell o Rubin, el autor recomienda sus ediciones para vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo base NVIDIA Nemotron-3.5-Bolt-E4B); exportación GGUF con cuantización NVFP4 (E2M1) y tabla PLE en Q8_0. Detalle interno de la arquitectura del modelo base: no disponible |
| Parametros totales | 7.518.069.878 (dato real de safetensors del modelo base) |
| Parametros activos | aproximadamente 4.000 millones (nomenclatura E4B); confirmación oficial del conteo activo: no disponible |
| Longitud de contexto | 128.000 tokens (contexto de calibración NVFP4 indicado por el autor); confirmación del modelo base: no disponible |
| Tipos de cuantizacion | NVFP4 nativo (GGML_TYPE_NVFP4) para el modelo de texto; Q8_0 para la tabla PLE; proyector multimodal en GGUF (946 MB) |
| Idiomas soportados | en, de, fr, es, it, ja |
| Licencia | OpenMDW-1.1 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en BF16 safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base NVIDIA Nemotron-3.5-Bolt-E4B-BF16 más allá de su naturaleza multimodal (procesa texto, imagen y audio mediante un proyector multimodal independiente) y de la nomenclatura E4B, que sugiere un diseño con unos 4.000 millones de parámetros activos sobre un total de 7.518 millones. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; estos datos figuran como no disponibles.

La innovación técnica destacable de esta exportación es la cuantización NVFP4 con tablas de búsqueda por capas y una tabla PLE cuantizada a Q8_0, calibrada para 128.000 tokens de contexto. El autor advierte que `llama.cpp` emula `GGML_TYPE_NVFP4` mediante tablas de búsqueda software durante la decodificación por lotes, en lugar de usar los núcleos tensoriales FP4 nativos de Blackwell, de modo que la ventaja de esta edición es la compatibilidad y el tamaño reducido, no la velocidad. Las ediciones para vLLM (LowMemory y Standard) sí ejecutan W4A4 nativo en Blackwell con kernels Triton fusionados para la búsqueda de embeddings NVFP4.

## Capacidades

- Generación de texto conversacional multi-turno en seis idiomas (inglés, alemán, francés, español, italiano y japonés).
- Comprensión de imágenes: pipeline `image-text-to-text` con proyector multimodal dedicado.
- Procesamiento de audio: la denominación VisionAudio del repositorio indica soporte de entrada de audio, aunque el detalle de las tareas soportadas no está disponible.
- Razonamiento y respuesta a instrucciones en el contexto de agentes conversacionales, según la orientación del modelo base.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistentes conversacionales locales: el modelo puede gestionar diálogos multi-turno con hasta 128.000 tokens de contexto, lo que permite mantener historiales largos de conversación en un equipo de escritorio sin depender de la nube.
- Análisis de documentos con imágenes: gracias al proyector multimodal, se pueden enviar capturas, diagramas o páginas escaneadas junto con preguntas en texto para extraer información, una tarea adecuada porque el pipeline declarado es `image-text-to-text`.
- Transcripción y análisis de audio: la variante VisionAudio permite procesar contenido hablado como entrada y generar resúmenes o respuestas en texto, útil para actas de reuniones o atención por voz en local.
- Atención al cliente multilingüe: el soporte de seis idiomas (incluido el español) permite desplegar un asistente que responda en el idioma del usuario con un único modelo de 6,11 GB.
- Pruebas de integración en `llama.cpp`: al ser un GGUF autónomo con `llama-cli` y `llama-server`, sirve para validar pipelines de inferencia local, prototipos y pruebas de regresión sin montar vLLM ni un entorno Linux.
- Evaluación de pesos NVFP4 en hardware de consumo: investigadores que quieran inspeccionar el comportamiento de la cuantización NVFP4 de NVIDIA en una RTX 5090 u otra GPU de consumo pueden usar esta exportación como banco de pruebas reproducible.
- Despliegue en entornos con recursos limitados: el tamaño de 6,11 GB más 946 MB del proyector permite ejecutar el modelo en GPU de 8-12 GB de VRAM con cuantización NVFP4, algo útil para estaciones de trabajo modestas.

## Benchmarks y rendimiento

La model card incluye una tabla de velocidad y escalado de concurrencia medida en una RTX 5090 (Blackwell) con `llama.cpp` (`-ngl 99 -fa on`), que compara esta edición NVFP4 GGUF con un GGUF Q4_K_M de referencia. Sin embargo, los valores numéricos concretos de throughput y latencia no están disponibles en la información proporcionada. El autor indica cualitativamente que esta edición GGUF no supera en velocidad a un Q4_K_M estándar en `llama.cpp`, porque NVFP4 se emula por software.

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7 GB en total (6,11 GB del modelo de texto más 946 MB del proyector multimodal), más el espacio de caché KV para el contexto utilizado; con contexto completo de 128.000 tokens la VRAM adicional puede ser considerable.
- GPU recomendadas: RTX 5090 u otras GPU Blackwell para aprovechar NVFP4 de forma nativa mediante las ediciones vLLM; en `llama.cpp` la emulación software funciona en cualquier GPU compatible con GGUF.
- ¿Cabe en GPU de consumo? Sí: el autor indica que la edición vLLM LowMemory (4,65 GiB de VRAM) está recomendada para GPU de 6 GB o más; la edición GGUF de 6,11 GB más proyector encaja en GPU de 8-12 GB.
- Opciones de despliegue: `llama.cpp` (`llama-cli` y `llama-server`) para esta edición GGUF; vLLM para las ediciones NVFP4 safetensors (LowMemory y Standard); Ollama se menciona en el repositorio hermano como destino de los ficheros GGUF.
- Latencia y throughput estimados: no disponibles con cifras concretas; el autor señala que en `llama.cpp` el rendimiento no mejora respecto a Q4_K_M y que el máximo rendimiento en Blackwell/Rubin requiere vLLM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio-GGUF (esta ficha) | 7.518 millones totales, ~4.000 millones activos | 128.000 tokens (calibración NVFP4) | GGUF | OpenMDW-1.1 | Hugging Face, 28 descargas |
| Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio-LowMemory (vLLM) | mismos pesos base | 128.000 tokens | safetensors NVFP4 | OpenMDW-1.1 | Hugging Face |
| Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio (vLLM Standard) | mismos pesos base | 128.000 tokens | safetensors NVFP4 con tablas FP8 | OpenMDW-1.1 | Hugging Face |
| NVIDIA-Nemotron-3.5-Bolt-E4B-NVFP4-Blackwell/Rubin | mismos pesos base | no disponible | NVFP4 con paquete GGUF | OpenMDW-1.1 | Hugging Face |

No se dispone de datos de rendimiento comparativo frente a modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- En `llama.cpp` la cuantización NVFP4 se emula por software, por lo que esta edición no ofrece ventajas de velocidad frente a un GGUF Q4_K_M; el propio autor lo advierte.
- Para aprovechar los núcleos tensoriales FP4 de Blackwell o Rubin hay que usar las ediciones vLLM, no este GGUF.
- La licencia OpenMDW-1.1 está etiquetada como `other` en Hugging Face; conviene revisar sus términos antes de un uso comercial en producción.
- No se han publicado datos sobre sesgos, tasas de alucinación ni evaluaciones de seguridad del modelo en la información disponible.
- El contexto de 128.000 tokens corresponde a la calibración NVFP4 indicada por el autor; la ventana efectiva del modelo base no está confirmada en la información disponible.
- El soporte de tool calling, agentes y modo thinking no está documentado en la información proporcionada, por lo que no debe asumirse en producción.
- El repositorio tiene un uso muy limitado (28 descargas, 0 likes) y es una exportación comunitaria, no una publicación oficial de NVIDIA; la validación en producción corre por cuenta del usuario.
- El tamaño del repositorio es de 21,3 GB, superior al tamaño de los ficheros GGUF principales, lo que sugiere ficheros adicionales o duplicados que conviene inspeccionar antes de descargar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/arvedo/Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio-GGUF
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Edición vLLM LowMemory: https://huggingface.co/arvedo/Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio-LowMemory
- Edición vLLM Standard: https://huggingface.co/arvedo/Nemotron-3.5-Bolt-E4B-NVFP4-VisionAudio
- Repositorio NVFP4 Blackwell/Rubin: https://huggingface.co/arvedo/NVIDIA-Nemotron-3.5-Bolt-E4B-NVFP4-Blackwell-Rubin
- Página de NVIDIA Research del modelo: https://research.nvidia.com/labs/nemotron/Nemotron-3.5-Bolt-E4B-4GB/
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
