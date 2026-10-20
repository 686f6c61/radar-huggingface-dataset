# mlx-community/Ming-3.0-audio-tiny-bf16

## Resumen

Ming-3.0-audio-tiny-bf16 es la conversión a MLX del checkpoint inclusionAI/Ming-3.0-audio-tiny, publicada por el equipo de mlx-community. Se trata de un modelo multimodal de audio a texto (pipeline `audio-text-to-text`) de 8.554.701.216 parámetros que cubre cuatro tareas: comprensión de audio, transcripción, chat de texto y diálogo hablado con síntesis de voz. La conversión permite ejecutar inferencia completamente offline en Apple Silicon con código nativo de MLX, sin paquetes ONNX ni código remoto durante la carga del tokenizer.

El paquete es relevante porque reproduce el stack completo del modelo original en un único repositorio: incluye el Thinker (modelo principal), el encoder de audio, el Talker con su tokenizer de texto y el VAE de audio, además del encoder de hablante CAMPPlus en FP32 para la extracción de la voz de referencia. Todos los pesos del pipeline principal están en BF16 y se distribuyen en safetensors (20,1 GB de repositorio).

La ficha se basa únicamente en la model card y en los metadatos de HuggingFace. No se publican resultados de benchmarks, longitud de contexto ni detalles de entrenamiento, por lo que esos campos se marcan como no disponibles. La licencia es MIT, lo que facilita su uso comercial, con la salvedad de los pesos CAMPPlus, que conservan su licencia Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle. Pipeline compuesto por Thinker (modelo principal), encoder de audio, Talker (generación de audio) y VAE de audio; encoder de hablante CAMPPlus para la referencia de voz |
| Parámetros totales | 8.554.701.216 (8,55 mil millones), según safetensors |
| Parámetros activos | No disponible (no se confirma que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16 (única incluida en el repositorio). No se publican variantes GGUF, INT8 ni INT4 |
| Idiomas soportados | Inglés y chino (comprensión de audio, transcripción, chat y diálogo hablado); resto no disponible |
| Licencia | MIT (modelo). Pesos CAMPPlus bajo Apache-2.0, con atribución incluida |
| Formato de pesos | safetensors (BF16); CAMPPlus en FP32; tokenizers incluidos; sin ONNX |
| Pipeline / tarea | `audio-text-to-text` (tareas: `audio_understanding`, transcripción, chat de texto, `spoken_dialogue`) |
| Tamaño del repositorio | 20,1 GB |
| Runtime | `mlx-audio` (MLX, Apple Silicon); requiere una versión de MLX Audio con soporte para Ming Tiny |
| Checkpoint de origen | `inclusionAI/Ming-3.0-audio-tiny`, revisión `7cbe4a75c979f6ea48f1ee31998eb02bd7012233` |
| Fecha de publicación | 2026-10-19 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna ni el proceso de entrenamiento del modelo original. Lo que sí documenta es la composición del pipeline exportado: un Thinker que actúa como modelo principal de razonamiento sobre la entrada de audio y texto, un encoder de audio que convierte la señal en representaciones, un Talker que se carga de forma perezosa solo cuando se solicita `task='spoken_dialogue'` y que produce audio a 44,1 kHz, y un VAE de audio. A esto se añade un encoder de hablante CAMPPlus nativo en MLX, usado para extraer la referencia de voz, con pesos mantenidos en FP32 por precisión.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. Tampoco se detallan innovaciones de atención o decodificación más allá de una nota negativa relevante: la decodificación especulativa MTP y el streaming no están implementados en esta conversión. La exportación se validó recargando estrictamente desde un directorio reubicado, con la caché de HuggingFace vacía, red bloqueada y sin paquetes ONNX; el repositorio incluye `validation.json` con las tareas e inventario de pesos probados y `SHA256SUMS` para verificar la integridad de todos los archivos.

## Capacidades

- Comprensión de audio: descripción y análisis semántico de clips (tarea `audio_understanding`), con ejemplos de uso como "Describe what you hear".
- Transcripción de voz en inglés y chino.
- Chat de texto puro, sin entrada de audio.
- Diálogo hablado: con `task='spoken_dialogue'` carga el Talker y genera audio de salida a 44,1 kHz, lo que habilita interacción de voz de ida y vuelta.
- Extracción de hablante de referencia mediante el encoder CAMPPlus incluido, en FP32, para condicionar la voz generada.
- Ejecución totalmente offline en Apple Silicon, sin llamadas a red ni ejecución de código remoto al cargar el tokenizer.
- Paquete autocontenido: Thinker, encoder de audio, Talker, tokenizer de texto y VAE incluidos; no requiere descargas adicionales.
- No soporta decodificación especulativa MTP ni streaming en esta versión.
- No se documentan tool calling, function calling ni capacidades de agente multi-paso.

## Casos de uso

- Transcripción local de reuniones y notas de voz: el modelo procesa audio en inglés o chino y devuelve texto sin salir del dispositivo, lo que encaja en entornos con requisitos de confidencialidad donde no se permite enviar grabaciones a la nube.
- Asistente de voz conversacional en macOS: con `task='spoken_dialogue'` el modelo encadena comprensión del habla y generación de respuesta hablada a 44,1 kHz, suficiente para prototipos de interfaz por voz en aplicaciones de escritorio.
- Descripción automática de contenido sonoro para accesibilidad: la tarea `audio_understanding` permite generar descripciones de clips para subtitulado ampliado o archivos multimedia, ejecutándose en el propio Mac del usuario.
- Preprocesado de corpus de audio en investigación: transcripción y etiquetado semántico por lotes de colecciones en inglés y chino usando MLX, sin depender de servicios externos ni de cuotas de API.
- Condicionamiento de voz sintética: el encoder CAMPPlus incluido extrae el embedding de un hablante de referencia que el Talker puede usar al generar la respuesta hablada, útil en experimentos de personalización de voz.
- Evaluación y desarrollo de modelos de audio en Apple Silicon: al ser una conversión fiel con validación de integridad (`SHA256SUMS`, `validation.json`), sirve como referencia reproducible para comparar el comportamiento del checkpoint original frente a la implementación MLX.
- Chat de texto sin componente de audio: el mismo paquete permite usar el Thinker como modelo de conversación de texto, lo que simplifica el despliegue de una única aplicación con dos modos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona validación funcional (recarga estricta desde directorio reubicado, sin red y sin ONNX) y no incluye métricas de calidad como MMLU, HumanEval, GSM8K, WER de transcripción ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM/unified memory estimada para inferencia: los pesos BF16 de 8,55 mil millones de parámetros ocupan aproximadamente 17,1 GB; el repositorio completo son 20,1 GB, incluyendo el encoder de audio, el Talker, el VAE de audio y el CAMPPlus en FP32. Hay que añadir caché KV y buffers de audio durante la generación.
- Memoria recomendada: 32 GB de memoria unificada o más para trabajar con margen en las cuatro tareas; 24 GB es el mínimo práctico estimado; 16 GB resulta insuficiente para BF16.
- Equipos compatibles: Apple Silicon exclusivamente (familias M1, M2, M3 y M4, con especial comodidad en configuraciones Max y Ultra de 64-128 GB si se ejecutan sesiones concurrentes o el Talker en modo diálogo).
- GPU NVIDIA no soportadas: al ser una conversión MLX no hay ruta CUDA, por lo que A100, H100 o RTX 4090 no son opciones válidas para este repositorio concreto.
- Cuantización: no se distribuyen versiones INT8/INT4/GGUF; para reducir memoria habría que convertir los pesos a un formato cuantizado compatible con MLX, un proceso no documentado en la model card.
- Opciones de despliegue: `mlx-audio` mediante `from mlx_audio.sts import load` y `model.generate(...)`, con una versión de MLX Audio que incluya soporte para Ming Tiny. No hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La ausencia de decodificación especulativa MTP y de streaming implica que la respuesta se entrega completa, sin salida incremental, lo que afecta a la percepción de latencia en diálogo hablado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| mlx-community/Ming-3.0-audio-tiny-bf16 | 8,55 B | No disponible | Inglés y chino | MIT (CAMPPlus Apache-2.0) | safetensors BF16, MLX en Apple Silicon |
| inclusionAI/Ming-3.0-audio-tiny (checkpoint de origen) | 8,55 B (mismo checkpoint base) | No disponible | Inglés y chino (según esta conversión) | MIT | safetensors; runtime original no especificado en la información disponible |
| Otras alternativas audio-text-to-text de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación fiable se limita al par formado por este export y su checkpoint de origen: comparten pesos y licencia, y difieren en el runtime (MLX nativo con paquete autocontenido frente al formato original) y en las limitaciones declaradas de la conversión (sin MTP especulativo ni streaming). No se dispone de datos verificados de parámetros, contexto o rendimiento de otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No hay benchmarks publicados: no es posible estimar la calidad de transcripción (WER) ni de comprensión de audio frente a alternativas sin evaluarlas por cuenta propia.
- Cobertura lingüística limitada a inglés y chino según la model card; el campo de idiomas de HuggingFace figura como no disponible y no se documentan otros idiomas.
- Longitud de contexto no documentada: no se puede planificar el procesamiento de audios largos ni de conversaciones multi-turno extensas sin medición previa.
- Sin streaming ni decodificación especulativa MTP: la generación es de bloque completo, con mayor latencia percibida en diálogo hablado y peor throughput que implementaciones con decodificación especulativa.
- Dependencia de plataforma: solo Apple Silicon vía MLX; no hay ruta para CUDA, ROCm ni despliegue en servidores x86 con GPU, lo que excluye su uso en infraestructura de producción convencional.
- Memoria: BF16 requiere en torno a 17-20 GB de pesos, lo que descarta equipos de 16 GB y limita la concurrencia en configuraciones de 24-32 GB.
- No se distribuyen cuantizaciones: reducir huella exige un proceso de conversión no documentado y con riesgo de degradar la calidad.
- Riesgo de alucinación inherente a modelos generativos: en transcripción puede producir texto plausible no presente en el audio, y en `audio_understanding` puede inferir eventos sonoros inexistentes; conviene validación en dominios críticos.
- Sesgos: no se documenta composición del dataset ni evaluaciones de sesgo, por lo que se desconocen sesgos de acento, género o dialecto en inglés y chino.
- Licencia: el modelo es MIT, apta para uso comercial, pero los pesos CAMPPlus bajo `talker/speaker_encoder` conservan Apache-2.0 y deben mantener su atribución al redistribuir el paquete.
- Requisito de versión: es necesario usar una versión de MLX Audio con soporte explícito para Ming Tiny; versiones anteriores pueden fallar en la carga estricta (`strict=True`).
- Fecha de publicación adelantada (2026-10-19) y cero descargas: el repositorio es muy reciente, sin validación independiente por parte de la comunidad.
- El Talker se carga de forma perezosa solo en `spoken_dialogue`; usarlo en producción implica gestionar memoria adicional en tiempo de ejecución.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mlx-community/Ming-3.0-audio-tiny-bf16
- Modelo base: https://huggingface.co/inclusionAI/Ming-3.0-audio-tiny
- Inventario de validación (dentro del repositorio): `validation.json`
- Sumas de verificación (dentro del repositorio): `SHA256SUMS`
- Pesos y atribución del encoder de hablante CAMPPlus: `talker/speaker_encoder` (licencia Apache-2.0)
- Revisión del checkpoint de origen: `7cbe4a75c979f6ea48f1ee31998eb02bd7012233`
