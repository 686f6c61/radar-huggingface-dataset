# mochiexists528/ace-step-mlx-transcriber-q8

## Resumen

ACE-Step Transcriber MLX (q8) es una conversión a formato MLX del modelo ACE-Step/acestep-transcriber, un sistema de transcripción de letras de canciones y etiquetado de estructura musical desarrollado por el equipo ACE-Step. El modelo original se empleó para etiquetar los datos de entrenamiento de ACE-Step v1.5 y deriva de un fine-tune de Qwen2.5-Omni-7B, del que conserva únicamente el componente thinker: el codificador de audio estilo Whisper (0,64 B de parámetros) y el modelo de lenguaje Qwen2.5-7B.

La versión aquí descrita, publicada por el usuario mochiexists528, aplica cuantización afín de 8 bits con group size 64 sobre los pesos del modelo de lenguaje y reorganiza el layout en disco (encoder y LM separados), de modo que pueda cargarse desde un port en MLX Swift sin dependencias de Python ni PyTorch en tiempo de ejecución. Está orientada específicamente a Apple Silicon.

Su relevancia radica en que permite ejecutar localmente en hardware Apple una tarea de transcripción musical multilingüe (más de 50 idiomas) con etiquetado de secciones de canción, manteniendo una fidelidad muy alta respecto al original en PyTorch: WER medio del 9,5 % frente al 9,4 % del reference en las canciones de paridad del autor, y una transcripción de 3 minutos en unos 16,9 s en un M5 Max con 9,1 GB de memoria pico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal audio-texto (Qwen2.5-Omni thinker: encoder de audio estilo Whisper + LM Qwen2.5-7B) |
| Parametros totales | 0,64 B (encoder de audio) + 7 B (modelo de lenguaje); talker, token2wav y vision tower eliminados |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada de hasta 300 s, 16 kHz mono) |
| Tipos de cuantizacion | int8 afín MLX, group size 64 (existe variante int4 mencionada en la model card) |
| Idiomas soportados | más de 50 idiomas (según model card) |
| Licencia | MIT (pesos ACE-Step); Qwen2.5-Omni subyacente Apache 2.0 |
| Formato de pesos | safetensors (encoder.safetensors en bf16, lm-*.safetensors cuantizados), tokenizer.json, config.json |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de audio a texto construido sobre Qwen2.5-Omni-7B. La conversión conserva exclusivamente el thinker: un encoder de audio de 0,64 B de parámetros con arquitectura estilo Whisper que procesa audio mono a 16 kHz de hasta 300 segundos, y el modelo de lenguaje Qwen2.5-7B que genera la transcripción y las etiquetas de estructura. Se han descartado el talker (generación de habla), el token2wav y la torre de visión del modelo original.

El prompt de inferencia es `*Task* Transcribe this audio in detail` seguido del audio, igual que en el modelo upstream. La cuantización aplicada es afín de 8 bits con group size 64 sobre el LM, mientras que el encoder se mantiene en bf16. El layout en disco es propio del autor (encoder y LM separados), pensado para ser cargado por un port en MLX Swift que ejecuta todo el thinker sin Python ni PyTorch. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni si hubo RLHF o DPO en el fine-tune de ACE-Step.

## Capacidades

- Transcripción de letras cantadas y habla en audio musical, en más de 50 idiomas.
- Etiquetado de estructura de canción: `[Verse 1]`, `[Chorus]`, `[Bridge]`, `[Instrumental Break]`, entre otras.
- Procesamiento de audio mono a 16 kHz con duración de hasta 300 segundos por pasada.
- Recuperación de bucles: el runtime del autor rebobina y bloquea los tokens del bucle cuando el modelo se queda atascado en una vocalización ("ah-ah-ah..."), comportamiento que también presenta el modelo en PyTorch.
- Ejecución nativa en Apple Silicon mediante MLX Swift, sin dependencias de Python en tiempo de ejecución.
- No incluye tool calling, function calling, capacidades de agente, visión ni audio de salida (descartados en la conversión).

## Casos de uso

- Generación de letras sincronizadas para plataformas de karaoke: el modelo transcribe la letra y etiqueta secciones, lo que permite alinear la letra con la estructura de la canción para su reproducción.
- Catalogación y búsqueda de archivos musicales: transcripción automática de la letra para indexar bibliotecas locales y habilitar búsqueda por texto en Apple Silicon.
- Etiquetado de datasets musicales: uso del modelo para anotar secciones (verso, estribillo, puente) en corpus de audio antes de entrenar otros modelos, tal como se hizo para ACE-Step v1.5.
- Subtitulado de contenido musical en vídeo: generación de subtítulos con marcas de sección para vídeos musicales o conciertos grabados.
- Análisis musicológico asistido: extracción de la estructura formal de una canción para estudios comparativos de forma musical entre géneros o artistas.
- Herramientas de accesibilidad: transcripción de canciones para personas con discapacidad auditiva en aplicaciones de escritorio macOS nativas.
- Preprocesado en pipelines de generación musical: transcripción de audio de referencia para condicionar modelos de generación de canciones con letra y estructura.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Error relativo log-mel (MLX bf16 vs PyTorch) | 1,7-2,1e-4 |
| Similitud coseno salida encoder de audio | 0,995-0,998 |
| Primer paso de decodificación (argmax idéntico) | 6/6 canciones |
| WER mediana transcripción vs PyTorch | 0,2 % |
| WER medio vs PyTorch (canciones de paridad) | 9,5 % (q8) vs 9,4 % (bf16) |
| Coincidencia con letra de referencia (int4, 46 canciones) | 89,8 % de líneas |
| Etiquetas de sección correctas (int4) | 86,6 % (SongPrep-7B: 63,1 %) |
| Tiempo total, canción de ~3 min (M5 Max, q8) | 16,9 s |
| Memoria pico (M5 Max, q8) | 9,1 GB |
| Tamano en disco (q8) | 8,7 GB |

Las cifras de velocidad se midieron en una máquina compartida bajo carga, por lo que el autor las califica de pesimistas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 9,1 GB de pico para la variante q8 según medición del autor en M5 Max.
- Tamano en disco: 8,7 GB para q8; el repositorio ocupa 9,4 GB.
- Hardware objetivo: Apple Silicon (M-series); el runtime es un port en MLX Swift.
- GPU recomendadas: Apple M5 Max medido por el autor; no hay datos publicados para otros chips M-series ni para GPU NVIDIA.
- No está pensado para GPU de consumidor NVIDIA ni para CUDA: requiere MLX.
- Opciones de despliegue: MLX Swift (runtime propio del autor); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 16,9 s para una canción de ~3 minutos en M5 Max (carga del modelo excluida), en condiciones de carga compartida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACE-Step Transcriber MLX q8 (este) | 0,64 B encoder + 7 B LM | hasta 300 s | más de 50 | MIT | Hugging Face, MLX Swift |
| ACE-Step/acestep-transcriber (upstream) | 0,64 B encoder + 7 B LM | hasta 300 s | más de 50 | MIT | Hugging Face, PyTorch/transformers |
| SongPrep-7B | no disponible | no disponible | no disponible | no disponible | referencia de comparación citada por el autor |
| Qwen2.5-Omni-7B | 7 B (modelo completo con talker y visión) | no disponible | multilingüe | Apache 2.0 | Hugging Face |

El dato comparativo disponible es el de etiquetado de secciones: 86,6 % de líneas correctas frente al 63,1 % de SongPrep-7B en el conjunto de 46 canciones del autor.

## Limitaciones y advertencias

- Comportamiento de bucle upstream: en algunas canciones el modelo se queda repitiendo una vocalización y deja de transcribir; el runtime del autor lo mitiga rebobinando y bloqueando tokens, pero el modelo en PyTorch presenta el mismo fallo.
- Solo se conserva el thinker: no hay generación de habla, token2wav ni visión, por lo que no sirve para tareas multimodales más allá de audio a texto.
- Dependencia de MLX y Apple Silicon: no es desplegable en CUDA ni en entornos sin MLX.
- El layout de pesos es propio del autor y no sigue el formato estándar de transformers; requiere su runtime específico.
- WER medio del 9,5 % en las canciones de paridad: la transcripción de letras no es exacta y requiere revisión humana en producción.
- No hay información publicada sobre sesgos, composición del dataset de entrenamiento ni evaluación en idiomas concretos.
- Las métricas de velocidad proceden de una única máquina (M5 Max) bajo carga; no deben extrapolarse sin medir.
- Licencia MIT para los pesos, con Apache 2.0 para el componente Qwen2.5-Omni subyacente; conviene conservar el fichero `LICENSE-Qwen2.5-Omni` en redistribuciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mochiexists528/ace-step-mlx-transcriber-q8
- Modelo base: https://huggingface.co/ACE-Step/acestep-transcriber
- Qwen2.5-Omni-7B: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
