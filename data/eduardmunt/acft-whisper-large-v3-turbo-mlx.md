# eduardmunt/acft-whisper-large-v3-turbo-mlx

## Resumen

ACFT Whisper large-v3-turbo (MLX) es una conversión al formato MLX del modelo `MahmoudAshraf/acft-whisper-large-v3-turbo`, un fine-tuning de Whisper large-v3-turbo que incorpora la técnica ACFT ("Audio Context Fine-Tuning", atribuida a FUTO). Esta técnica permite que el encoder procese una ventana de audio ajustada a la longitud real de la entrada en lugar de rellenar siempre hasta los 30 segundos fijos que emplea Whisper de serie. El resultado es un modelo de reconocimiento automático del habla (ASR) que reduce el coste computacional en audios cortos sin degradar la calidad.

El modelo lo publica el usuario eduardmunt en Hugging Face y está pensado para su uso con `mlx-whisper`, la implementación de Whisper sobre el framework MLX de Apple, optimizada para chips de la serie M de Apple Silicon. Forma parte del proyecto VoiceFlow, según indica la propia model card. Con 39 descargas y 0 likes en el momento de la consulta, es un artefacto de nicho, orientado a despliegues locales en macOS más que a producción a gran escala.

Arquitectónicamente es un transformer encoder-decoder de tipo Whisper large-v3-turbo: 32 capas de encoder y 4 de decoder, con 128 bins mel y aproximadamente 0,8 mil millones de parámetros, según la ficha del modelo original de OpenAI. Los pesos se distribuyen en fp16 y el repositorio ocupa 1,6 GB. La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) con ventana de contexto de audio variable (ACFT) |
| Parametros totales | ~0,8 mil millones (heredado de large-v3-turbo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventana de audio variable hasta 30 s (ACFT permite recortar el encoder a la duracion real); contexto textual del decoder no especificado |
| Tipos de cuantizacion | Pesos en fp16 en el repositorio; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible en la model card (el modelo base Whisper large-v3-turbo es multilingue) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en layout MLX (`weights.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un Whisper large-v3-turbo estándar: encoder de 32 bloques y decoder de 4 bloques, con 128 bins mel en la entrada. La innovación ACFT consiste en permitir que el encoder opere sobre una ventana de audio ajustada a la longitud real de la señal, en lugar de la ventana fija de 30 segundos. La model card indica que, sin aplicar el recorte de ventana, el modelo se comporta como un large-v3-turbo convencional, lo que sugiere que la ganancia se obtiene precisamente al usar el modo ACFT.

La conversión a MLX realizada por eduardmunt incluye varios cambios técnicos documentados: renombrado de claves (`layers` a `blocks`, `self_attn.q_proj` a `attn.query`, `fc1` a `mlp1`), transposición de los pesos de convolución de (out, in, kernel) a (out, kernel, in), eliminación del embedding posicional sinusoidal fijo del encoder (verificado como idéntico antes de eliminarlo, ya que mlx-whisper lo calcula internamente) y la incorporación de `alignment_heads` tomados de `mlx-community/whisper-large-v3-turbo` (pares 2/4, 2/11, 3/3, 3/6, 3/11, 3/14) para habilitar marcas de tiempo a nivel de palabra. Los pesos se mantienen en fp16 sin modificar respecto al modelo fuente. La model card no detalla la composición del dataset de fine-tuning ni si hubo RLHF o DPO; el fine-tuning original procede del repositorio de MahmoudAshraf, no de este.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) mediante pipeline `automatic-speech-recognition`.
- Ventana de audio adaptativa mediante ACFT: el encoder se recorta a la duración real del audio, lo que reduce el coste en clips cortos.
- Marcas de tiempo a nivel de palabra gracias a los `alignment_heads` incorporados en la configuración.
- Capacidades multilingües heredadas de Whisper large-v3-turbo (la model card no enumera idiomas concretos).
- Funcionamiento en Apple Silicon mediante `mlx-whisper`.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción local en macOS: el modelo se ejecuta con `mlx-whisper` sobre chips Apple M, lo que permite transcribir audio sin enviar datos a la nube; adecuado para entornos con requisitos de privacidad.
- Dictado y notas de voz en aplicaciones de escritorio: con ACFT, clips cortos (segundos) no pagan el coste de una ventana de 30 s, lo que mejora la latencia percibida en flujos de dictado interactivo.
- Generación de subtítulos con marcas de tiempo: los `alignment_heads` permiten obtener tiempos por palabra, útiles para subtitulado y sincronización en herramientas de vídeo.
- Integración en VoiceFlow: la model card indica que este artefacto se usa en el proyecto VoiceFlow, por lo que encaja como motor ASR de ese pipeline.
- Prototipado de pipelines ASR en investigación: al ser una conversión MLX de un fine-tuning ACFT, sirve para evaluar la técnica en hardware Apple sin depender de CUDA.
- Preprocesado de audio para pipelines de NLP: transcripción de reuniones o entrevistas antes de pasarlas a un modelo de lenguaje, aprovechando el recorte de ventana para reducir cómputo en segmentos cortos.
- Evaluación comparativa de ACFT frente a Whisper estándar: al conservar el comportamiento de large-v3-turbo cuando no se recorta la ventana, permite medir la ganancia de ACFT con el mismo checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio ocupa 1,6 GB en fp16, por lo que se necesita del orden de 2 GB de memoria unificada para cargar los pesos, más el overhead de activaciones y del runtime MLX.
- Hardware objetivo: chips Apple Silicon (series M1, M2, M3, M4) mediante `mlx-whisper`; no está pensado para GPU NVIDIA ni CUDA.
- GPU consumer: cabe holgadamente en cualquier Mac con Apple Silicon; no aplica a RTX 4090 u otras GPU discretas por el formato MLX.
- Opciones de despliegue: `mlx-whisper` (librería declarada en la model card). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| eduardmunt/acft-whisper-large-v3-turbo-mlx | ~0,8 B | Variable hasta 30 s (ACFT) | MLX safetensors fp16 | Apache-2.0 | Conversion MLX de un fine-tuning ACFT |
| MahmoudAshraf/acft-whisper-large-v3-turbo | ~0,8 B | Variable hasta 30 s (ACFT) | safetensors (formato original) | no disponible en la informacion | Modelo base del anterior |
| mlx-community/whisper-large-v3-turbo | ~0,8 B | 30 s fijos | MLX | no disponible en la informacion | Conversion MLX del modelo original de OpenAI, sin ACFT |
| openai/whisper-large-v3-turbo | ~0,8 B | 30 s fijos | safetensors (Transformers) | no disponible en la informacion | Modelo original de OpenAI |

## Limitaciones y advertencias

- Es un artefacto de conversión, no un modelo entrenado desde cero: hereda los sesgos y limitaciones del fine-tuning de MahmoudAshraf y de Whisper large-v3-turbo.
- Riesgo de alucinación inherente a Whisper en segmentos con silencio, ruido o audio musical; la model card no documenta mitigaciones específicas.
- La model card no enumera los idiomas soportados ni el rendimiento por idioma; no se debe asumir paridad con large-v3-turbo sin evaluar.
- Solo funciona con `mlx-whisper` y hardware Apple Silicon; no es portable a CUDA ni a otros runtimes sin reconversión.
- El comportamiento ACFT solo se activa con ventana recortada; sin ella, el modelo equivale a large-v3-turbo y pierde la ventaja de eficiencia.
- Popularidad muy baja (39 descargas, 0 likes) y publicación reciente: no hay validación comunitaria ni reportes de calidad independientes.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base original de OpenAI y del fine-tuning intermedio, no detalladas en la información disponible.
- No se documentan cuantizaciones alternativas (4-bit, 8-bit) ni requisitos de memoria medidos, por lo que el despliegue en Macs con poca memoria unificada requiere prueba empírica.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/eduardmunt/acft-whisper-large-v3-turbo-mlx
- Modelo base (fine-tuning ACFT): https://huggingface.co/MahmoudAshraf/acft-whisper-large-v3-turbo
- Conversión MLX de referencia: https://huggingface.co/mlx-community/whisper-large-v3-turbo
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-large-v3-turbo
- mlx-whisper (repositorio de ejemplos MLX): https://github.com/ml-explore/mlx-examples/tree/main/whisper
