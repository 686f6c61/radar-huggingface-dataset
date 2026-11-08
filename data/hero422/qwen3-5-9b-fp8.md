# Hero422/qwen3.5-9b-fp8

## Resumen

Qwen3.5-9B FP8 es una conversión del checkpoint base Qwen/Qwen3.5-9B al formato propietario `.rad` del motor de inferencia radiance, orientado a GPUs AMD con arquitectura RDNA4 y ROCm. No se trata de un modelo nuevo ni de un fine-tuning: es el mismo modelo de Qwen cuantizado a FP8 (E4M3) con escala por bloque de 128×128, empaquetado junto con su torre de visión y su cabeza MTP (multi-token prediction) para decodificación especulativa. El autor es el usuario Hero422, no el equipo de Qwen.

El interés de esta ficha es doble. Por un lado, documenta una ruta de despliegue poco habitual: inferencia de un modelo multimodal de 9B parámetros en una única tarjeta de 32 GB (o incluso 16 GB con el embedding fijado en memoria de host), usando el motor radiance en lugar de las pilas habituales (vLLM, llama.cpp, TGI). Por otro lado, sirve como referencia de las capacidades del checkpoint subyacente Qwen3.5-9B, que combina atención con proyecciones delta-net, capas SSM y una ventana de contexto entrenada de 262.144 tokens.

El contexto temporal del repositorio (creado en noviembre de 2026) y la ausencia de descargas y likes indican que es un artefacto reciente y sin validación comunitaria. Cualquier uso en producción debería ir precedido de una verificación propia con `--debug-graph` en la GPU objetivo, tal como recomienda el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención (proyecciones qg/k/v/output), capas SSM (ssm_inz, ssm_out) y proyecciones delta-net a/b; torre de visión de 27 bloques |
| Parametros totales | 9B (según el nombre del modelo base; no se detalla el desglose exacto) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens entrenados (el ejemplo de servicio usa 200.000) |
| Tipos de cuantizacion | FP8 E4M3 con escala por bloque 128×128 (lineales del tronco y lm_head); embedding, proyecciones delta-net a/b, normas, fc y pre-norms del MTP y torre de visión en bf16; cabeza de borrador MTP en 2 bits (u2, grupo 128, escala f16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Contenedor `.rad` propietario del motor radiance (10,67 GiB); no es safetensors ni GGUF |

## Arquitectura y entrenamiento

El checkpoint base Qwen3.5-9B emplea una arquitectura híbrida que combina bloques de atención con proyecciones qg, k, v y output, capas de espacio de estados (SSM) con `ssm_inz` y `ssm_out`, y proyecciones delta-net a/b. El tronco tiene 32 capas, a las que se suma una capa adicional del cabezal MTP declarada como `blk.32`. La torre de visión consta de 27 bloques y procesa imágenes y vídeo dentro de las peticiones de chat.

La conversión aplicada por el autor usa cuantización RTN (round-to-nearest) a FP8 E4M3 con escala bf16 por bloque de 128×128 sobre atención, SSM, FFN y `output.weight`. El embedding de tokens (2,03 GiB) y la torre de visión permanecen en bf16. La cabeza de borrador del MTP se comprime a 2 bits, lo que permite decodificación especulativa con muy poco coste de memoria. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base; esos datos corresponden a la model card de Qwen, no a este repositorio.

La innovación técnica destacable es el uso del cabezal MTP nativo como speculator: el motor elige automáticamente la profundidad de especulación y puede desactivarse con `--num-speculative-tokens 0`. El KV cache se puede almacenar en FP8 (`--kv-cache-dtype fp8`), lo que reduce el pool necesario para conversaciones largas.

## Capacidades

- Generación de texto y razonamiento multi-turno con ventanas de hasta 262.144 tokens.
- Procesamiento de imagen y vídeo en peticiones de chat mediante partes `image_url` y `video_url` (pipeline image-text-to-text).
- Tool calling y function calling a través de la API compatible con OpenAI que expone el servidor radiance.
- Salida estructurada (structured output) para integración en pipelines que requieren JSON validado.
- Decodificación especulativa con el cabezal MTP, con profundidad ajustable automáticamente.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan modos de pensamiento explícitos (thinking mode) ni capacidades de audio.

## Casos de uso

- Asistente multimodal sobre documentos escaneados: el modelo recibe imágenes de páginas y texto en la misma conversación, con contexto suficiente para mantener decenas de páginas en memoria y responder preguntas cruzadas.
- Análisis de vídeo corto en local: la torre de visión de 27 bloques procesa fotogramas dentro de la petición de chat, útil para resumir o etiquetar clips sin enviar datos a la nube.
- Automatización de atención al cliente con contexto largo: los 262.144 tokens permiten arrastrar historiales extensos o bases de conocimiento inyectadas, y el tool calling habilita consultas a sistemas internos.
- Generación de código asistida en estaciones de trabajo AMD: al caber en una tarjeta de 16-32 GB con ROCm, se puede desplegar en un equipo de desarrollo con GPU RDNA4 sin depender de CUDA.
- Extracción de datos estructurados de facturas o formularios: la salida estructurada del servidor OpenAI-compatible permite obtener JSON validado directamente desde imágenes.
- Prototipado de agentes multi-paso: la combinación de tool calling, contexto largo y decodificación especulativa reduce la latencia en cadenas de razonamiento con varias llamadas a herramientas.
- Evaluación de modelos en hardware AMD: sirve como banco de pruebas para medir el rendimiento de radiance frente a otras pilas en la misma GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el contenedor ocupa 10,67 GiB en disco; en ejecución, la tarjeta aloja unos 9 GB de lineales más el pool de KV cache. Con embedding en RAM de host (`--embedding-placement ram`, valor por defecto), cabe en una tarjeta de 16 GB con un pool de KV de aproximadamente 6,4 GB.
- GPU recomendadas: tarjetas AMD RDNA4 con ROCm; el autor indica que el modelo completo cabe en una tarjeta de 32 GB. No se mencionan GPUs NVIDIA ni CUDA.
- GPU de consumo: sí, en el rango de 16 GB de VRAM de arquitectura RDNA4, con la limitación de una sola conversación de 200K-262K tokens a la vez; dos conversaciones concurrentes de longitud completa requieren el pool de una tarjeta de 32 GB.
- Opciones de despliegue: exclusivamente el motor radiance (`radiance --model qwen3.5-9b-fp8.rad ...`), que expone endpoints `/v1/chat/completions` y `/v1/completions`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI con este formato.
- Latencia y throughput: no disponibles. El autor recomienda ejecutar `radiance --model qwen3.5-9b-fp8.rad --debug-graph` antes de servir para verificar el grafo en la tarjeta concreta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hero422/qwen3.5-9b-fp8 | 9B | 262.144 | `.rad` (radiance, AMD RDNA4) | Apache 2.0 | Hugging Face, 0 descargas |
| Hyper-AI/Qwen3.5-9B-fp8 | 9B (base) | No disponible | No disponible | No disponible | Hugging Face |
| Qwen/Qwen3.5-9B (base) | 9B | 262.144 (según esta conversión) | bf16 (safetensors, presumiblemente) | Apache 2.0 | Hugging Face |

La comparación con otros modelos de 9B de la misma categoría (por ejemplo, familias Llama o Gemma) no está disponible en la información proporcionada; no se dispone de datos de rendimiento que permitan situar este checkpoint frente a alternativas.

## Limitaciones y advertencias

- Dependencia total del motor radiance: el formato `.rad` no es portable a otras pilas de inferencia, lo que limita la portabilidad y crea un riesgo de dependencia de un proyecto con poca tracción (0 descargas, 0 likes).
- Compatibilidad restringida a AMD RDNA4 con ROCm; no hay soporte documentado para NVIDIA, Apple Silicon ni CPU.
- Sin validación comunitaria: el repositorio es reciente, sin descargas ni likes, y no se han publicado benchmarks ni evaluaciones independientes de esta conversión concreta.
- Riesgo de alucinación inherente al modelo base; no se documentan mitigaciones específicas en esta conversión.
- Idiomas soportados no disponibles: no se puede confirmar el comportamiento multilingüe del checkpoint base a partir de la información proporcionada.
- La cuantización FP8 con escala por bloque puede introducir degradación en tareas sensibles a la precisión numérica; no se aportan mediciones de la pérdida respecto al bf16 original.
- La cabeza de borrador MTP a 2 bits puede reducir la tasa de aceptación de la decodificación especulativa en dominios alejados de la distribución de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar los términos del motor radiance, que no se detallan en la model card.
- El embedding reside en RAM de host por defecto; en sistemas con enlaces lentos (PCIe limitado) esto puede penalizar la latencia de forma notable.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Hero422/qwen3.5-9b-fp8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Conversión alternativa del mismo base: https://huggingface.co/Hyper-AI/Qwen3.5-9B-fp8
- Árbol de ficheros de la conversión alternativa: https://huggingface.co/Hyper-AI/Qwen3.5-9B-fp8/tree/main
- Imagen de conversión citada por el autor: `stilldeadcode/radiance` (referencia textual en la model card; no se proporciona URL directa)
