# mochiexists528/ace-step-mlx-transcriber-q3

## Resumen

ACE-Step Transcriber MLX (q3) es una conversión al ecosistema MLX del modelo `ACE-Step/acestep-transcriber`, un transcriptor de letras y estructura de canciones desarrollado por ACE-Step para etiquetar los datos de entrenamiento de su modelo generativo musical v1.5. El paquete, publicado por el usuario `mochiexists528`, contiene únicamente el componente *thinker* del checkpoint original basado en Qwen2.5-Omni-7B: el codificador de audio de estilo Whisper (0,64 B) y el modelo de lenguaje Qwen2.5-7B, descartando el *talker*, el token2wav y la torre de visión.

La relevancia de esta conversión radica en su orientación a Apple Silicon: emplea cuantización afín MLX de 3 bits con grupo de 64, lo que reduce el paquete a 4,3 GB en disco y permite transcribir una canción de tres minutos en 7,7 segundos con un pico de memoria de 4,8 GB en un Apple M5 Max. El modelo transcribe audio cantado y hablado en más de 50 idiomas y etiqueta secciones de canción (`[Verse 1]`, `[Chorus]`, `[Bridge]`, `[Instrumental Break]`, etc.).

Se trata de un artefacto de nicho, sin descargas ni interacciones registradas en Hugging Face, con licencia MIT heredada del modelo base. Su utilidad principal es el despliegue local de transcripción musical en hardware Apple sin dependencias de Python ni PyTorch en tiempo de ejecución, mediante un port en MLX Swift.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal audio-texto (Qwen2.5-Omni-7B, solo *thinker*: codificador de audio estilo Whisper + LM Qwen2.5-7B) |
| Parámetros totales | 7B aproximados (0,64 B codificador + ~7 B LM); el checkpoint completo Qwen2.5-Omni-7B incluye componentes descartados |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada hasta 300 s, 16 kHz mono) |
| Tipos de cuantización | int3 afín MLX, group size 64 (existen variantes int4 del mismo autor) |
| Idiomas soportados | 50+ idiomas (según model card) |
| Licencia | MIT (pesos ACE-Step); componente Qwen2.5-Omni bajo Apache 2.0 |
| Formato de pesos | safetensors (encoder en bf16, LM cuantizado int3), layout propio con `config.json`, `encoder.safetensors`, `lm-*.safetensors`, `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo subyacente es un *fine-tune* de Qwen2.5-Omni-7B orientado a transcripción de letras y etiquetado estructural de canciones, realizado por ACE-Step para anotar el corpus de entrenamiento de ACE-Step v1.5. La arquitectura conserva el codificador de audio de estilo Whisper (0,64 B parámetros) y el modelo de lenguaje Qwen2.5-7B del *thinker*; se eliminan el *talker* (generación de habla), el vocoder token2wav y la torre de visión, ya que la tarea es exclusivamente audio-texto.

Esta conversión concreta no reentrena el modelo: solo cambia el layout en disco (separación de encoder y LM) y aplica cuantización afín MLX de 3 bits con grupo de 64 sobre el LM, manteniendo el encoder en bf16. El prompt utilizado es `*Task* Transcribe this audio in detail` seguido del audio a 16 kHz mono, con un máximo de 300 segundos, igual que en el modelo original. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el modelo base.

La validación de la conversión en bf16 frente a PyTorch (transformers, bf16) sobre 6 canciones reporta un error relativo de 1,7-2,1e-4 en el log-mel, una similitud coseno de 0,995-0,998 en la salida del codificador de audio, coincidencia de argmax en el primer paso de decodificación en 6 de 6 casos y un WER mediano del 0,2 % frente a PyTorch.

## Capacidades

- Transcripción de audio cantado y hablado en más de 50 idiomas.
- Etiquetado de estructura musical: secciones como `[Verse 1]`, `[Chorus]`, `[Bridge]` o `[Instrumental Break]`.
- Procesamiento de audio de hasta 300 segundos por inferencia, a 16 kHz mono.
- Ejecución nativa en Apple Silicon mediante MLX Swift, sin Python ni PyTorch en tiempo de ejecución.
- Recuperación de bucles: el runtime rewindea y bloquea los tokens del bucle cuando el modelo se queda repitiendo una vocalización.
- No soporta tool calling, function calling, agentes, visión ni audio de salida (componentes descartados en el paquete).

## Casos de uso

- Generación de subtítulos y letras sincronizadas para catálogos musicales: el modelo transcribe la letra completa de una canción de hasta cinco minutos en una sola pasada, con etiquetas de sección que facilitan el alineado posterior con la pista.
- Etiquetado de datasets musicales para entrenamiento de modelos generativos: reproduce el uso original de ACE-Step, anotando letras y estructura en corpus de audio antes de entrenar modelos de síntesis musical.
- Herramientas de karaoke y aplicaciones de consumo en Mac: el paquete de 4,3 GB y el pico de 4,8 GB de memoria permiten integrar la transcripción en apps nativas de Apple Silicon sin servidor.
- Investigación en musicología computacional: análisis de estructura de canciones (verso, estribillo, puente) a escala sobre archivos de audio locales en estaciones de trabajo con chip M-series.
- Archivado y accesibilidad de contenido musical: transcripción de grabaciones habladas y cantadas en más de 50 idiomas para generar transcripciones buscables.
- Prototipado rápido en portátiles Apple: la velocidad de 7,7 s por canción de tres minutos permite iterar sobre pipelines de transcripción sin infraestructura GPU dedicada.

## Benchmarks y rendimiento

| Métrica | Resultado |
|---|---|
| Error relativo log-mel (Swift MLX bf16 vs PyTorch bf16) | 1,7-2,1e-4 |
| Similitud coseno salida encoder (bf16 vs bf16) | 0,995-0,998 |
| Error relativo encoder fp32 vs fp32 | 3,9-4,9e-3 |
| Argmax idéntico en primer paso de decodificación | 6/6 canciones |
| WER mediano transcripción vs PyTorch | 0,2 % |
| Coincidencia de líneas con letra de referencia (int4, 46 canciones) | 89,8 % |
| Etiquetas de sección correctas (int4, 46 canciones) | 86,6 % (SongPrep-7B: 63,1 %) |
| Tiempo total, canción de ~3 min, Apple M5 Max (q3) | 7,7 s |
| Pico de memoria (q3) | 4,8 GB |
| Tamaño en disco (q3) | 4,3 GB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las métricas de calidad de la variante int4 no se trasladan directamente a esta variante q3, para la que el autor indica que no se ejecutó una evaluación completa de calidad y que el mecanismo de recuperación de bucles se activó con más frecuencia.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 4,8 GB de pico en inferencia para la variante q3 (medido en Apple M5 Max).
- GPU recomendadas: Apple Silicon con soporte MLX; el autor reporta mediciones en Apple M5 Max. No hay datos para A100, H100 ni RTX 4090, ya que el paquete es específico de MLX.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con al menos ~5 GB de memoria unificada disponible; no aplica a GPU NVIDIA/AMD por el formato MLX.
- Opciones de despliegue: runtime MLX Swift propio del autor (sin Python ni PyTorch); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 7,7 s por canción de ~3 minutos en Apple M5 Max, con carga del modelo excluida; el autor advierte que las cifras se midieron en una máquina compartida bajo carga y son pesimistas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACE-Step Transcriber MLX q3 (este) | ~7B (0,64B encoder + LM) | 300 s | 50+ | MIT | Hugging Face, formato MLX |
| ACE-Step/acestep-transcriber (original) | ~7B | 300 s | 50+ | MIT | Hugging Face, PyTorch/transformers |
| SongPrep-7B | no disponible | no disponible | no disponible | no disponible | referencia de comparación citada por el autor (63,1 % de etiquetas de sección correctas frente a 86,6 %) |

No se dispone de datos suficientes para comparar con otras alternativas de transcripción musical en la información proporcionada.

## Limitaciones y advertencias

- El modelo base presenta un comportamiento conocido de bucle sobre vocalizaciones ("ah-ah-ah...") que detiene la transcripción; PyTorch hace lo mismo y el runtime MLX lo mitiga rewindeando y bloqueando tokens, pero en la variante q3 el mecanismo se activó con más frecuencia.
- No se ejecutó una evaluación completa de calidad sobre la variante int3; las métricas de calidad publicadas (89,8 % de líneas y 86,6 % de etiquetas correctas) corresponden a la variante int4.
- La cuantización a 3 bits puede degradar la fidelidad de la transcripción frente a bf16; no hay datos publicados de WER para esta variante.
- Solo incluye el *thinker*: no hay generación de habla, vocoder ni capacidades de visión.
- El layout de pesos es propio del autor y requiere su runtime MLX Swift; no es compatible directamente con transformers, vLLM ni llama.cpp.
- Licencia MIT para los pesos ACE-Step, con componente Qwen2.5-Omni bajo Apache 2.0 incluido como `LICENSE-Qwen2.5-Omni`; verificar el cumplimiento de ambas al redistribuir.
- Riesgo de alucinación y errores en pasajes instrumentales o coros superpuestos no cuantificado en la información disponible.
- Sin descargas ni validación comunitaria en Hugging Face en el momento de la ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mochiexists528/ace-step-mlx-transcriber-q3
- Modelo base: https://huggingface.co/ACE-Step/acestep-transcriber
- Modelo Qwen2.5-Omni-7B: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
