# alexc09/Qwen3.5-0.8B-Tags-Gist-Summary

## Resumen

Qwen3.5-0.8B-Tags-Gist-Summary es un ajuste fino completo (full fine-tune, no LoRA) del modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario alexc09 en Hugging Face. No se trata de un modelo de chat generalista: está entrenado específicamente para cuatro tipos de petición dentro de una aplicación de transcripción de voz, a saber, el etiquetado (tagging) de transcripciones, la generación de gists de una línea, la fusión de notas parciales de grabaciones largas y la redacción de resúmenes y puntos clave.

El modelo resuelve el problema de procesar transcripciones de reuniones y grabaciones de entre 1 y 5 horas de duración, segmentándolas en partes de aproximadamente 15 minutos (para etiquetado) o 12 minutos (para puntos clave) y recombinando los resultados. Soporta inglés, chino, español, francés, japonés y coreano, tanto en la entrada como en la salida, y emplea la arquitectura Qwen3_5ForCausalLM con 752.393.024 parámetros reales en formato bf16.

Su relevancia radica en que demuestra que un modelo de menos de 1.000 millones de parámetros, ajustado con 21.197 filas y 2 épocas, supera ampliamente al modelo base y a un competidor de mayor tamaño (LFM2.5 1.2B) en tareas de etiquetado y resumen, con un Tag F1 de 0,500 frente a 0,126 y 0,160 respectivamente. Existe además una versión int8 en formato LiteRT-LM pensada para ejecutarse en un teléfono móvil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForCausalLM (transformer decoder-only, familia Qwen3.5) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens por petición (límite operativo indicado por el autor; contexto nativo del base no disponible) |
| Tipos de cuantizacion | bf16 (checkpoint publicado); int8 en la variante LiteRT-LM |
| Idiomas soportados | en, zh, es, fr, ja, ko |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, 1.504.827.608 bytes en bf16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5 base, un transformer decoder-only de la familia Qwen3.5 con atención estándar y tokenizador propio de Qwen3.5, sin modificaciones en el tokenizer ni en la plantilla de chat (`chat_template.jinja` se mantiene sin cambios). El ajuste es un full fine-tune sobre el checkpoint bf16, no un adaptador LoRA. El repositorio incluye `prompts.py` y un directorio `prompts/` con 18 ficheros de texto que reconstruyen byte a byte las 22.039 peticiones de entrenamiento y validación, lo que permite reproducir exactamente el formato de entrada usado durante el ajuste.

El entrenamiento se realizó sobre 21.197 filas del dataset `alexc09/voice-recording-transcripts-tags-summaries` durante 2 épocas, con decodificación greedy, thinking desactivado y una conversación nueva por petición. La generación está configurada a 160 tokens nuevos por defecto (384 para puntos clave) y los tokens de parada son `<|endoftext|>` (248044) y `<|im_end|>` (248046). Para acelerar la inferencia en GPU se recomienda instalar `flash-linear-attention` y `causal-conv1d`; sin ellos el modelo funciona pero con una latencia mucho mayor (el autor reporta unos 2 minutos por petición corta en CPU de Mac).

## Capacidades

- Etiquetado (tagging) de transcripciones completas o de partes de aproximadamente 15 minutos (hasta unos 3.000 tokens de texto), con opción de lista de etiquetas predefinida y de permitir etiquetas nuevas.
- Generación de gists de una línea asociados a las etiquetas.
- Fusión de notas parciales (`merge_request`): recombina las etiquetas y gists de cada parte para producir el etiquetado y gist de una grabación completa de 1 a 5 horas.
- Extracción de puntos clave (`key_points_request`) por partes de unos 12 minutos, con líneas con marca temporal y hablante.
- Generación de resumen general (`overview_request`) y gist a partir de los puntos clave de todas las partes.
- Salida multilingüe: inglés, chino, coreano, japonés, español y francés, con detección del idioma de la transcripción y selección opcional del idioma de salida.
- No soporta tool calling, function calling, agentes, visión ni audio; es un modelo de texto especializado en las cuatro peticiones descritas.

## Casos de uso

- Etiquetado automático de reuniones: el modelo recibe la transcripción de una reunión y devuelve un JSON con etiquetas y un gist, útil para clasificar y buscar reuniones en un archivo corporativo.
- Resumen de grabaciones largas de 1 a 5 horas: se trocea la transcripción en partes de 15 minutos, se etiqueta cada parte y se usa `merge_request` para obtener el etiquetado global, evitando exceder los 4.096 tokens de contexto.
- Generación de actas con puntos clave: con `key_points_request` sobre segmentos de 12 minutos y `overview_request` para la síntesis final, se obtiene un acta estructurada con marcas temporales y hablantes.
- Aplicación móvil de notas de voz: la variante int8 LiteRT-LM permite ejecutar el modelo en un teléfono, transcribir y resumir localmente sin enviar audio a la nube, lo que reduce costes y mejora la privacidad.
- Indexación y búsqueda semántica de transcripciones: las etiquetas y gists generados sirven como metadatos para motores de búsqueda o sistemas RAG sobre el archivo de grabaciones.
- Localización de resúmenes: al aceptar `output_language`, un equipo puede transcribir en un idioma y generar el resumen en otro (por ejemplo, transcripción en español con resumen en inglés) para equipos distribuidos.
- Procesamiento por lotes en pipelines de datos: al ser un modelo pequeño (752 M de parámetros), se puede desplegar con vLLM 0.33.0 en bf16 para procesar grandes volúmenes de transcripciones con coste de GPU reducido.

## Benchmarks y rendimiento

| Prueba | Este modelo | Qwen3.5-0.8B base | LFM2.5 1.2B |
|---|---:|---:|---:|
| Tag F1, 500 grabaciones cortas reservadas | 0,500 (fichero móvil 0,499) | 0,126 | 0,160 |
| Tag F1 en español, japonés, coreano y francés (482 filas) | 0,42 | 0,095 | no probado |
| Tag F1, grabaciones de 1-5 horas fusionadas desde partes de ~15 min (520 filas) | 0,47 | 0,12 | no probado |
| Resúmenes, 96 grabaciones: rango medio de un juez ciego Sonnet (1 = mejor de 3) | 1,06 | 2,67 | 2,27 |

El Tag F1 mide la coincidencia con las etiquetas de referencia generadas por Claude Sonnet 5.5, en una escala de 0 a 1. En la prueba de resúmenes, el resumen de este modelo quedó por encima del de LFM2.5 en 92 de las 96 grabaciones. La fidelidad de los resúmenes se sitúa en 2,9 sobre 5, según el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint bf16 ocupa aproximadamente 1,5 GB, por lo que necesita en torno a 2-3 GB de VRAM en bf16; en int8 se reduce a menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el autor usó vLLM 0.33.0 en bf16 para sus evaluaciones en GPU.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o similares con 8 GB o más.
- Opciones de despliegue: transformers (>=5.20.2) con torch, vLLM 0.33.0, y la variante LiteRT-LM int8 para dispositivos móviles. No se mencionan llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles de forma agregada; el autor indica que sin `flash-linear-attention` y `causal-conv1d` una petición corta tarda unos 2 minutos en CPU de Mac.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tag F1 (cortas) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| Qwen3.5-0.8B-Tags-Gist-Summary | 752 M | 4.096 tokens por petición | 0,500 | apache-2.0 | Hugging Face (bf16 y LiteRT int8) |
| Qwen3.5-0.8B (base) | 752 M | no disponible | 0,126 | apache-2.0 (según base) | Hugging Face |
| LFM2.5 1.2B | 1.200 M (aproximado) | no disponible | 0,160 | no disponible | Hugging Face |

La comparativa se limita a los modelos incluidos en la información proporcionada; no se dispone de datos de otros modelos de tagging o resumen de tamaño similar.

## Limitaciones y advertencias

- No es un modelo de chat general: solo está entrenado para las cuatro peticiones de la aplicación del autor y debe usarse con los prompts exactos de `prompts.py`; fuera de ese formato el rendimiento cae.
- Los resúmenes a veces mezclan hechos: la fidelidad reportada es de 2,9 sobre 5, por lo que requieren revisión humana en contextos críticos.
- Límite de 4.096 tokens por petición: las grabaciones largas deben trocearse en partes de unos 15 minutos (etiquetado) o 12 minutos (puntos clave), lo que añade complejidad al pipeline.
- El Tag F1 en idiomas distintos del inglés es inferior (0,42 frente a 0,500), por lo que la calidad del etiquetado multilingüe es menor.
- No soporta tool calling, agentes, visión ni audio; el audio debe transcribirse con otro sistema antes de usar el modelo.
- Riesgo de alucinación en gists y etiquetas cuando la transcripción es ambigua o el audio es de baja calidad; no se han publicado análisis de sesgos.
- La licencia apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B debe verificarse por separado; el autor no documenta restricciones adicionales.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alexc09/Qwen3.5-0.8B-Tags-Gist-Summary
- Variante int8 LiteRT-LM: https://huggingface.co/alexc09/Qwen3.5-0.8B-Tags-Gist-Summary-LiteRT
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de entrenamiento: https://huggingface.co/datasets/alexc09/voice-recording-transcripts-tags-summaries
