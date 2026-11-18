# Jmica/Drama-3-GGUF

## Resumen

Drama 3 GGUF es una conversión al formato GGUF del modelo de síntesis de voz (text-to-speech) `fishaudio/drama-3`, desarrollado por Fish Audio y empaquetado por el usuario Jmica para su uso con el runtime nativo `audio.cpp`. El modelo base emplea una arquitectura de mezcla de expertos (MoE) con capacidades de clonación de voz, y esta conversión proporciona seis perfiles de precisión mixta que permiten ejecutarlo en hardware de consumo. Es relevante porque democratiza el acceso a un sistema TTS de alta calidad con soporte de streaming y clonación, manteniendo el cabezal de salida completo del checkpoint original.

La versión actual (V2) se construyó a partir del checkpoint de reemplazo de Fish Audio del 29 de octubre de 2026 (revisión `78e5ab7`), mientras que la V1 original (13 de octubre de 2026, revisión `dd64a85`) se conserva en una revisión separada. Ambos comparten la misma arquitectura entrenada; los perfiles difieren únicamente en la precisión de almacenamiento de los distintos componentes (expertos enrutados, routers, embeddings, cabezal de voz y matrices del backbone).

El repositorio ocupa 271,3 GB en total, pero cada archivo individual pesa entre 15,88 y 23,87 GiB, lo que hace viable su despliegue en GPUs consumer de gama alta. Requiere el backend `fish_drama3` de `audio.cpp`; los runtimes GGUF de propósito general para modelos de texto no pueden cargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con torre de audio y códec de forma de onda; arquitectura GGUF `audiocpp` |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | Configurable en tiempo de ejecución (ejemplo documentado: 8192) |
| Tipos de cuantizacion | Q2_K, Q3_K y Q4_K para expertos enrutados; Q8_0, Q4_K, Q4_0, FP32 y BF16 para routers, embeddings y cabezal según perfil |
| Idiomas soportados | no disponible |
| Licencia | fish-audio-community-license-v1.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base `fishaudio/drama-3` es un sistema text-to-speech con arquitectura de mezcla de expertos. La conversión GGUF preserva la estructura completa: 120 bancos de proyección de expertos enrutados, 40 routers y 40 compuertas de expertos compartidos, además de una torre de audio y un códec de forma de onda. Las matrices de la torre de audio y los pesos del códec de forma de onda permanecen en FP16; las normalizaciones del backbone y de la torre de audio se guardan en FP32, mientras que las del códec en FP16. El cabezal de salida completo tiene 252.288 filas y se conserva íntegro en todos los perfiles.

Los seis perfiles de cuantización aplican precisión uniforme a los bancos de expertos (Q2_K, Q3_K o Q4_K) con overrides explícitos por componente, en lugar de heurísticas de promoción de bits de presets genéricos. Dos perfiles restauran los 40 routers y compuertas desde sus valores BF16 originales mantenidos exactamente en FP32; uno de ellos además restaura el embedding y el cabezal de salida completos en BF16. No se aplicó fine-tuning ni cambios de runtime en el cabezal compacto. No hay información disponible sobre el número de tokens de entrenamiento, composición del dataset ni si se empleó RLHF o DPO en el modelo base.

## Capacidades

- Síntesis de voz (text-to-speech) de alta calidad con salida en formato WAV.
- Clonación de voz a partir de referencias de audio.
- Modo de streaming para generación de audio incremental.
- Control de generación mediante parámetros de muestreo (`top_k`, `top_p`, `temperature`, `seed`, `max_tokens`, `text_chunk_size`).
- Procesamiento por fragmentos de texto (`text_chunk_size`) para entradas largas.
- Offload de capas de expertos a CPU (`cpu_expert_layers`) para reducir requisitos de VRAM.
- Contexto configurable en tiempo de ejecución (hasta 8192 en el ejemplo documentado).
- Soporte multiidioma: no disponible en la información proporcionada.

## Casos de uso

- **Audiolibros y narración automatizada**: el modelo puede generar narración con voz clonada consistente a lo largo de textos largos, usando `text_chunk_size` para dividir el texto y mantener la coherencia de la voz mediante el historial de referencia.
- **Doblaje y localización de contenido**: la clonación de voz permite reproducir el timbre de un actor original sobre un guion traducido, con control de temperatura y semilla para ajustar la expresividad.
- **Asistentes de voz en tiempo real**: el modo streaming permite emitir audio conforme se genera, reduciendo la latencia percibida en aplicaciones conversacionales.
- **Accesibilidad y lectura de pantalla**: integración en lectores de pantalla o aplicaciones de accesibilidad que conviertan texto en voz natural con una voz personalizada del usuario.
- **Generación de contenido para podcasts y vídeo**: producción de locuciones para piezas cortas con perfiles de cuantización ligeros (Q2_K, 15,88 GiB) que caben en GPUs de consumo.
- **Prototipado e investigación en TTS**: el repositorio conserva la V1 en una revisión separada, lo que permite reproducir experimentos con los pesos originales y comparar con la V2.
- **Despliegue en entornos con VRAM limitada**: el offload de capas de expertos a CPU (`fish_drama3.cpu_expert_layers=40`) permite ejecutar el modelo cuando la GPU no puede alojar todos los expertos, a costa de mayor uso de RAM del host.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el tamaño de archivo no equivale a la VRAM necesaria; el consumo depende del contexto, el historial de referencia, el backend y el offload a CPU.
- Perfiles disponibles y tamaño en disco: Q2_K (15,88 GiB), Q3_K (18,93 GiB), Q4_K con backbone 8 bits (22,91 GiB), Q4_K con backbone 4 bits (21,77 GiB), Q4_K con routers FP32 (22,97 GiB) y Q4_K con routers FP32 y embedding/cabezal BF16 (23,87 GiB).
- GPU recomendadas: no disponibles de forma explícita; los perfiles de menor tamaño son compatibles con GPUs consumer de gama alta con suficiente VRAM (por ejemplo, modelos con 24 GB o más), aunque el offload a CPU permite reducir ese requisito.
- Offload a CPU: `fish_drama3.cpu_expert_layers=40` es la configuración conservadora usada en las comprobaciones funcionales; los expertos descargados requieren RAM del host.
- Opciones de despliegue: exclusivamente el runtime `audio.cpp` con el backend nativo `fish_drama3` (CLI `audiocpp_cli.exe`, backend CUDA en el ejemplo). Los runtimes GGUF de texto de propósito general no pueden cargarlo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Drama 3 GGUF (este) | no disponible (MoE) | configurable (ej. 8192) | fish-audio-community-license-v1.0 | GGUF (`audiocpp`) | Requiere `audio.cpp`; seis perfiles de precisión mixta |
| fishaudio/drama-3 (base) | no disponible (MoE) | no disponible | fish-audio-community-license-v1.0 | safetensors (presumible) | Checkpoint original; pesos FP8 escalados en expertos |
| Otros modelos TTS open source | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- **Licencia restrictiva**: la fish-audio-community-license-v1.0 no es una licencia de código abierto estándar; es necesario revisar sus términos antes de cualquier uso comercial.
- **Dependencia de runtime específico**: solo funciona con `audio.cpp` y el backend `fish_drama3`; no es cargable por llama.cpp, Ollama, vLLM ni otros runtimes GGUF genéricos.
- **Riesgo de clonación de voz**: la capacidad de clonación puede emplearse para suplantación de identidad o deepfakes; es responsabilidad del usuario cumplir la normativa aplicable y obtener consentimiento.
- **Consumo de memoria variable**: el tamaño del archivo no determina la VRAM necesaria; contexto, historial de referencia y offload alteran el consumo y pueden modificar la salida muestreada.
- **Reproducibilidad**: la V1 y la V2 usan checkpoints distintos; para reproducir resultados con los pesos originales hay que seleccionar la revisión `original-2026-10-13`.
- **Idiomas no documentados**: no se especifica qué idiomas soporta el modelo, lo que limita la planificación de despliegues multilingües.
- **Sin benchmarks publicados**: no hay métricas objetivas de calidad (MOS, WER, similitud de voz) en la información disponible.
- **Sesgos**: no disponibles en la información proporcionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Jmica/Drama-3-GGUF
- Modelo base: https://huggingface.co/fishaudio/drama-3
- Checkpoint V2 (revisión `78e5ab7`): https://huggingface.co/fishaudio/drama-3/tree/78e5ab79e49aa9a25abe8799eff2c4d73a1c3216
- Licencia: https://huggingface.co/fishaudio/drama-3/blob/main/LICENSE
- Runtime audio.cpp: https://github.com/0xShug0/audio.cpp
- Documentación del backend fish_drama3: https://github.com/0xShug0/audio.cpp/blob/main/docs/models/fish_drama3.md
- Revisión V1 preservada: https://huggingface.co/Jmica/Drama-3-GGUF/tree/original-2026-10-13
