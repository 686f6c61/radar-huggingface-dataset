# mochiexists528/ace-step-mlx-transcriber-q4

## Resumen

ACE-Step Transcriber MLX (q4) es una conversión al ecosistema MLX de Apple Silicon del modelo `ACE-Step/acestep-transcriber`, un transcriptor de letras y estructura de canciones desarrollado por el equipo de ACE-Step. El modelo original se utilizó para etiquetar datos de entrenamiento de ACE-Step v1.5 y deriva de un fine-tune de Qwen2.5-Omni-7B, del que conserva únicamente el componente *thinker*: el codificador de audio estilo Whisper (0,64 B de parámetros) y el modelo de lenguaje Qwen2.5-7B. El paquete elimina el *talker*, el vocoder token2wav y la torre de visión del modelo original.

La relevancia de esta conversión es doble. Por un lado, empaqueta el modelo en cuantización int4 afín de MLX con grupo de tamaño 64, reduciendo el peso en disco a 5,2 GB y permitiendo ejecutar la transcripción completa de una canción de tres minutos en unos 16,6 segundos con un pico de memoria de 5,7 GB en un Apple M5 Max. Por otro, el autor ha implementado una recuperación de bucles que corrige un fallo conocido del modelo original, que en algunas canciones se queda repitiendo una vocalización y deja de transcribir.

El modelo transcribe audio cantado y hablado en más de 50 idiomas y etiqueta secciones de la canción (`[Verse 1]`, `[Chorus]`, `[Bridge]`, `[Instrumental Break]`, etc.). La licencia es MIT, aunque los pesos derivan de Qwen2.5-Omni-7B, publicado bajo Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal audio-texto (thinker de Qwen2.5-Omni): codificador de audio estilo Whisper + LLM Qwen2.5-7B |
| Parametros totales | Aproximadamente 7,6 B (0,64 B del codificador de audio + 7 B del modelo de lenguaje) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el audio de entrada se limita a 300 s, 16 kHz mono) |
| Tipos de cuantizacion | Int4 afín MLX con grupo de tamaño 64; el codificador de audio se mantiene en bf16 |
| Idiomas soportados | Más de 50 idiomas (según la model card del modelo base) |
| Licencia | MIT (pesos originales de ACE-Step); componente Qwen2.5-Omni bajo Apache 2.0 |
| Formato de pesos | Safetensors (layout propio: `encoder.safetensors` y shards `lm-*.safetensors`), cargable con MLX |
| Tamano del repo | 5,6 GB |
| Pipeline | audio-text-to-text |
| Libreria | MLX (runtime MLX Swift) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura del *thinker* de Qwen2.5-Omni-7B: un codificador de audio de estilo Whisper de 0,64 B de parámetros que convierte la forma de onda en representaciones acústicas, y un modelo de lenguaje Qwen2.5-7B que genera la transcripción condicionada por esas representaciones y por un prompt de tarea (`*Task* Transcribe this audio in detail`). El paquete descarta el *talker* (generación de habla), el vocoder token2wav y la torre de visión, de modo que solo queda la ruta audio-texto. La conversión aplica cuantización afín int4 con grupo de 64 únicamente al modelo de lenguaje; el codificador permanece en bf16.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. El autor reporta una validación numérica de la conversión frente a la implementación en PyTorch con transformers: error relativo del log-mel de 1,7–2,1e-4, similitud coseno de 0,995–0,998 en la salida del codificador de audio, argmax idéntico en el primer paso de decodificación en 6 de 6 canciones y un WER mediano del 0,2 % frente a PyTorch. La innovación técnica destacable es la recuperación de bucles implementada en el runtime: cuando el modelo entra en una repetición de vocalización, el runtime retrocede más allá del bucle y prohíbe esos tokens, lo que eleva la concordancia de líneas al 89,8 % en un conjunto de 46 canciones.

## Capacidades

- Transcripción de audio cantado y hablado, con salida de letra alineada por líneas.
- Etiquetado automático de estructura musical: `[Verse 1]`, `[Chorus]`, `[Bridge]`, `[Instrumental Break]` y similares.
- Soporte multilingüe en más de 50 idiomas.
- Procesamiento de audio de hasta 300 segundos por pasada, a 16 kHz mono.
- Recuperación de bucles de vocalización mediante rewind y prohibición de tokens en el runtime MLX Swift.
- Ejecución sin Python ni PyTorch en tiempo de inferencia, íntegramente en MLX Swift.
- No soporta tool calling, function calling ni razonamiento multi-paso: el *talker* y la torre de visión han sido eliminados.
- No dispone de modo de pensamiento (*thinking mode*) ni salida de audio.

## Casos de uso

- Generación de letras sincronizadas para plataformas de karaoke: el modelo produce la letra por líneas y etiqueta las secciones, lo que permite alinear la reproducción con la estructura de la canción sin trabajo manual adicional.
- Catalogación y etiquetado de archivos musicales: procesar un lote de canciones para extraer letra y marcar estrofas, estribillos y breaks, facilitando la indexación y búsqueda dentro de una biblioteca.
- Preetiquetado de datasets de audio para entrenamiento de modelos musicales: el modelo original se usó precisamente para etiquetar los datos de ACE-Step v1.5, y esta conversión permite repetir ese flujo en local sobre Apple Silicon.
- Subtitulado de contenido musical en vídeo: transcripción de actuaciones en directo o videoclips para generar subtítulos con estructura de sección, útil en postproducción.
- Investigación en transcripción musical multilingüe: el soporte de más de 50 idiomas y la salida estructurada permiten construir corpus comparativos entre idiomas con un único modelo.
- Prototipado en estaciones de trabajo Mac: al ejecutarse con MLX Swift sin dependencias de Python, se integra en aplicaciones nativas de macOS para pruebas rápidas de transcripción con 5,7 GB de memoria pico.
- Análisis de estructura de canciones para herramientas de composición: la detección de secciones sirve para comparar arreglos entre versiones de un mismo tema o entre distintas grabaciones.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Concordancia de lineas (int4 con recuperacion de bucles, 46 canciones) | 89,8 % |
| Lineas en seccion del tipo correcto | 86,6 % (SongPrep-7B: 63,1 %) |
| Error relativo del log-mel (MLX bf16 vs PyTorch bf16) | 1,7–2,1e-4 |
| Similitud coseno del codificador de audio | 0,995–0,998 |
| Primer paso de decodificacion (argmax identico) | 6/6 canciones |
| WER mediano vs PyTorch | 0,2 % |
| Tiempo total (cancion de ~3 min, Apple M5 Max, carga excluida) | 16,6 s |
| Memoria pico | 5,7 GB |
| Tamano en disco | 5,2 GB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, dado que el modelo es específico de transcripción de audio.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 5,7 GB de pico en la variante int4, según medición del autor en Apple M5 Max.
- GPU recomendadas: chips de Apple Silicon con al menos 8 GB de memoria unificada; el autor reporta la medición en un M5 Max. No hay datos publicados para otras GPU (A100, H100, RTX 4090), ya que el paquete está orientado a MLX.
- Compatibilidad con GPU de consumo: sí, en Apple Silicon; no está pensado para GPU NVIDIA o AMD, al depender de MLX.
- Opciones de despliegue: runtime MLX Swift propio del autor, que carga el layout de safetensors sin Python ni PyTorch. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 16,6 s para una canción de tres minutos en M5 Max bajo carga compartida, cifra que el autor califica de pesimista.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACE-Step Transcriber MLX (q4) | ~7,6 B (0,64 B audio + 7 B LM) | 300 s por pasada | Más de 50 | MIT (componente Qwen Apache 2.0) | Hugging Face, MLX |
| ACE-Step/acestep-transcriber (original) | ~7,6 B | 300 s por pasada | Más de 50 | MIT | Hugging Face, PyTorch/transformers |
| SongPrep-7B | No disponible | No disponible | No disponible | No disponible | Referenciado en la model card como comparación (63,1 % de líneas en sección correcta) |
| Qwen2.5-Omni-7B | ~7 B (modelo completo con talker y visión) | No disponible | Multilingüe | Apache 2.0 | Hugging Face |

La comparación con SongPrep-7B solo cubre la métrica de acierto en el tipo de sección (86,6 % frente a 63,1 %); no se dispone de sus especificaciones completas en la información proporcionada.

## Limitaciones y advertencias

- El modelo base presenta un fallo conocido de bucle en vocalizaciones ("ah-ah-ah...") que detiene la transcripción; PyTorch se comporta igual. La recuperación de bucles del runtime MLX lo mitiga, pero la concordancia no es del 100 % (89,8 % de líneas).
- El paquete solo incluye el *thinker*: no hay generación de habla, vocoder ni capacidades de visión.
- El layout de pesos es propio del autor y requiere su runtime MLX Swift; no es directamente cargable con transformers ni con otras herramientas estándar.
- El audio de entrada está limitado a 300 segundos y 16 kHz mono; canciones más largas requieren segmentación manual.
- No se han publicado datos sobre sesgos del modelo, riesgo de alucinación en letras o comportamiento en idiomas concretos dentro de los más de 50 soportados.
- La licencia MIT de los pesos convive con la Apache 2.0 del componente Qwen2.5-Omni, incluida como `LICENSE-Qwen2.5-Omni`; conviene revisar ambas para uso comercial.
- Las mediciones de velocidad se tomaron en una máquina compartida bajo carga, por lo que no deben tomarse como cifras de referencia estables.
- El repositorio no registra descargas ni likes en el momento de la consulta, lo que indica una adopción aún nula y ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mochiexists528/ace-step-mlx-transcriber-q4
- Modelo base: https://huggingface.co/ACE-Step/acestep-transcriber
- Modelo del que deriva el base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
