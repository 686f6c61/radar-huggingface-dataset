# jessengatai/parakeet-tdt-0.6b-v2-bf16

## Resumen

Parakeet TDT 0.6B v2 en formato bfloat16 para MLX es una conversión de precisión del modelo de reconocimiento automático del habla (ASR) Parakeet TDT 0.6B v2 desarrollado por NVIDIA. Se trata de una copia derivada del modelo original, publicada por el usuario jessengatai, que convierte los pesos de coma flotante de 32 bits a bfloat16 para su uso como modelo de subtitulado en el editor de vídeo Supra Cut. No incorpora reentrenamiento, ajuste fino ni poda: únicamente cambia el tipo de dato de los pesos.

El modelo original emplea una arquitectura FastConformer con decodificación TDT (Token-and-Duration Transducer), con aproximadamente 0,6 mil millones de parámetros, y está especializado en transcripción de inglés. Esta versión MLX está pensada para ejecutarse de forma nativa en hardware Apple Silicon, lo que la hace relevante para aplicaciones de escritorio que necesitan transcripción local sin depender de servicios en la nube.

La relevancia de esta ficha radica en que documenta una conversión comunitaria de un modelo ASR de referencia de NVIDIA, con licencia CC-BY-4.0, orientada a un caso de uso concreto (generación de subtítulos en un editor de vídeo) y limitada al idioma inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador TDT (Token-and-Duration Transducer) |
| Parámetros totales | 0,6 mil millones (aproximado, según el nombre del modelo) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bfloat16 (16 bits); el modelo base admite otras conversiones no documentadas aquí |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (`model-bf16.safetensors`) |

## Arquitectura y entrenamiento

Esta versión es una copia en bfloat16 del modelo NVIDIA Parakeet TDT 0.6B v2, obtenida a partir de la conversión MLX `mlx-community/parakeet-tdt-0.6b-v2` (revisión `8ae155301e23d820d82aa60d24817c900e69e487`). El autor indica explícitamente que solo se modificó el tipo de dato de los pesos, de float32 a bfloat16, y que `config.json` se copió byte a byte del repositorio de MLX. No hay reentrenamiento, ajuste fino ni poda.

La arquitectura subyacente es FastConformer, una variante eficiente de Conformer para audio, combinada con un decodificador TDT que predice conjuntamente tokens y duraciones, lo que permite transcripciones con alineamiento temporal. Los detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no están documentados en la información disponible y se remiten a la model card original de NVIDIA.

## Capacidades

- Reconocimiento automático del habla en inglés a partir de audio.
- Transcripción con alineamiento temporal gracias al decodificador TDT (predicción de duración de tokens).
- Generación de subtítulos, que es el uso previsto por el autor en el editor Supra Cut.
- Ejecución local en hardware Apple Silicon mediante la librería MLX.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües: el modelo es solo inglés.
- No se documentan capacidades de visión, audio generativo ni modo de razonamiento explícito.

## Casos de uso

- Subtitulado automático en editores de vídeo: el modelo se descarga y ejecuta localmente en Supra Cut para generar leyendas de clips en inglés, aprovechando el formato MLX para hardware Apple.
- Transcripción de reuniones y entrevistas en inglés: útil para generar actas o notas a partir de grabaciones, con ejecución local que evita enviar audio a servicios externos.
- Indexación y búsqueda de contenido audiovisual: la transcripción con marcas temporales permite buscar fragmentos por palabra clave dentro de archivos de vídeo o audio.
- Accesibilidad: generación de subtítulos para vídeos divulgativos o formativos dirigidos a audiencias angloparlantes con discapacidad auditiva.
- Prototipado de pipelines ASR en macOS: desarrolladores que quieran integrar reconocimiento de voz en aplicaciones de escritorio para Apple Silicon sin depender de APIs en la nube.
- Análisis de llamadas o atención al cliente: transcripción por lotes de grabaciones en inglés para su posterior análisis de sentimiento o extracción de temas, siempre que el volumen y el hardware lo permitan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta conversión remite a la model card original de NVIDIA para datos de precisión y límites, pero no incluye cifras propias.

## Requisitos de hardware

- El repositorio ocupa 1,2 GB, coherente con pesos en bfloat16 de un modelo de 0,6 mil millones de parámetros.
- VRAM/unified memory estimada: no disponible de forma oficial; por el tamaño del repositorio, se puede inferir un uso en torno a 1,2 GB para los pesos, más overhead de activaciones y del runtime MLX.
- GPU recomendadas: hardware Apple Silicon (series M1, M2, M3, M4) con soporte de MLX; no se documenta compatibilidad con GPU NVIDIA o AMD en esta conversión.
- Cabe en equipos de consumo con Apple Silicon; no se dispone de datos para GPU de consumo convencionales en este formato.
- Opciones de despliegue: librería MLX; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| jessengatai/parakeet-tdt-0.6b-v2-bf16 | ~0,6 B | no disponible | inglés | CC-BY-4.0 | safetensors (MLX, bf16) | HuggingFace, 32 descargas |
| nvidia/parakeet-tdt-0.6b-v2 | ~0,6 B | no disponible | inglés | CC-BY-4.0 | no disponible en esta ficha | HuggingFace (modelo original) |
| mlx-community/parakeet-tdt-0.6b-v2 | ~0,6 B | no disponible | inglés | CC-BY-4.0 (heredada) | MLX (float32) | HuggingFace |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Solo admite inglés; no es adecuado para transcripción multilingüe.
- Al ser una conversión de precisión, puede presentar diferencias numéricas menores frente al modelo original en float32, aunque el autor no documenta evaluación al respecto.
- No se han publicado métricas de precisión (WER) para esta conversión concreta; se debe consultar la model card de NVIDIA para los límites del modelo base.
- Riesgo de alucinación y errores en audio con ruido, acentos marcados o solapamiento de hablantes, inherente a los sistemas ASR; no cuantificado en esta ficha.
- La licencia CC-BY-4.0 permite uso comercial, pero exige atribución a NVIDIA como autor del modelo original.
- Dependencia del ecosistema MLX y de hardware Apple Silicon; no es directamente portable a otros runtimes sin conversión adicional.
- El modelo se distribuye como artefacto de una aplicación concreta (Supra Cut); su mantenimiento y soporte por parte del autor no están garantizados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jessengatai/parakeet-tdt-0.6b-v2-bf16
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Conversión MLX de referencia: https://huggingface.co/mlx-community/parakeet-tdt-0.6b-v2
