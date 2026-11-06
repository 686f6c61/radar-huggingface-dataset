# ashishkblink/vakya-asr

## Resumen

Vakya ASR (publicado como `ashishkblink/vakya-asr`) es una redistribución con cambio de nombre del modelo Hima-ASR desarrollado por Prahaladha. Se trata de un modelo compacto de reconocimiento automático del habla (ASR) orientado a 11 lenguas indias y al inglés, con un decodificador de texto derivado de Gemma 3 270M y un codificador de audio basado en Qwen3-ASR-1.7B. El modelo combina transcripción con una "cabeza de decisión" que responde preguntas en inglés sencillo sobre el audio (tono, emoción, intención del hablante, urgencia, idioma, hablante), devolviendo probabilidades por opción.

La relevancia del modelo radica en su tamaño reducido (459,7 millones de parámetros totales según los pesos en safetensors, 0,46B para el ASR y 17,5M para la cabeza de decisión) y en su capacidad de ejecutarse en CPU, GPU y Apple Silicon con versiones cuantizadas de 8 y 4 bits. Está pensado para escenarios de atención al cliente y análisis de llamadas en el subcontinente indio, donde el code-switching entre lenguas indias e inglés es habitual.

El repositorio tiene 1,0 GB de tamaño, licencia compuesta `apache-2.0-and-gemma` y se distribuye a través de la librería `transformers` (requiere `>=5.13`) con `trust_remote_code=True`. A fecha de la información disponible no registra descargas ni "likes", lo que sugiere una publicación muy reciente o de escasa difusión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de audio (derivado de Qwen3-ASR-1.7B) + decodificador de texto (derivado de Gemma 3 270M) + cabeza de decisión de 17,5M parámetros |
| Parametros totales | 459.713.255 (0,46B con tabla de piezas recortada; 0,59B con tabla completa de 262.144 piezas) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrada de audio de 1 a 30 segundos por clip) |
| Tipos de cuantizacion | 8 bits y 4 bits (versiones ONNX int8 y MLX cuantizadas); fp32 en PyTorch y ONNX |
| Idiomas soportados | as, bn, gu, hi, kn, ml, mr, or, pa, ta, te, en (11 lenguas indias + inglés) |
| Licencia | `apache-2.0-and-gemma` (Other; ver LICENSE y NOTICE) |
| Formato de pesos | safetensors (PyTorch); ONNX y MLX en repositorios separados |

## Arquitectura y entrenamiento

La arquitectura es un sistema de dos etapas acopladas: un codificador de audio que procesa la señal una sola vez por clip y alimenta simultáneamente al escritor (decodificador de texto) y a la cabeza de decisión. El decodificador de texto es un derivado de Gemma 3 270M, mientras que el codificador de audio procede de Qwen3-ASR-1.7B. La cabeza de decisión, de 17,5M de parámetros, formula preguntas en inglés con opciones discretas y devuelve una distribución de probabilidad sobre cada opción, cubriendo tareas de clasificación como emoción, intención, urgencia, idioma y hablante.

La tabla de piezas por defecto (`main`) está recortada a 63.335 piezas (0,46B de parámetros), lo que mantiene las mismas transcripciones con mayor velocidad; la tabla completa original de 262.144 piezas (0,59B) está disponible en la rama `full-vocab`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo soporta un modo de salida `native` (escritura propia de cada lengua) y `mixed` (palabras inglesas en caracteres latinos), pensado para escenarios de code-switching.

## Capacidades

- Transcripción de voz a texto en 11 lenguas indias y en inglés, con detección automática de idioma cuando no se especifica.
- Estilos de salida `native` (escritura propia) y `mixed` (palabras inglesas en alfabeto latino) para audio con code-switching.
- Cabeza de decisión que responde preguntas en inglés sencillo sobre el audio, devolviendo una probabilidad por opción.
- Clasificación de emoción y tono del hablante (calma, educación, enfado, confusión, prisa, alegría, entre otras).
- Detección de intención del interlocutor (por ejemplo, "pagará", "ya ha pagado", "no puede pagar ahora", "llamadme más tarde", "persona equivocada").
- Preguntas de tipo sí/no y de escala (por ejemplo, urgencia en tres niveles).
- Identificación de idioma y de hablante.
- Procesamiento por lotes de clips (por defecto `batch_size=16`).
- Ejecución en una sola pasada: el codificador de audio se ejecuta una vez y alimenta tanto la transcripción como las decisiones.

## Casos de uso

- Atención al cliente telefónica: el modelo transcribe la llamada y, en la misma pasada, clasifica la intención del cliente ("pagará", "no puede pagar ahora") y su tono emocional, lo que permite enrutar la llamada al agente o al flujo adecuado sin una segunda inferencia.
- Análisis de calidad de agentes (QA de contact center): la cabeza de decisión responde preguntas como "¿el hablante suena enfadado?" o "¿pide hablar con un humano?", lo que facilita la auditoría automática de conversaciones en lenguas indias.
- Triaje de urgencia en líneas de soporte: con preguntas de tipo escala ("no urgente", "algo urgente", "muy urgente"), el modelo prioriza llamadas en tiempo real sobre GPU de portátil, con latencia inferior a medio segundo por clip según la model card.
- Transcripción multilingüe para subtitulado: la salida `native` cubre asamés, bengalí, gujarati, hindi, canná, malayalam, maratí, oriya, panyabí, tamil y telugu, útil para generar subtítulos en plataformas de vídeo regionales.
- Procesamiento por lotes en CPU para archivado: la versión ONNX int8 ejecuta a 25 veces tiempo real en CPU, adecuada para transcribir grandes volúmenes de grabaciones sin GPU dedicada.
- Aplicaciones en dispositivo Apple: la versión MLX permite ejecutar transcripción y decisiones en Mac con GPU Apple Silicon, útil para herramientas de accesibilidad o dictado local sin enviar audio a la nube.
- Detección de code-switching en atención al cliente india: el estilo `mixed` transcribe palabras inglesas en alfabeto latino dentro de una frase en hindi o tamil, lo que refleja el habla real de muchos usuarios.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Dataset | Tarea | Metrica | Valor |
|---|---|---|---|
| FLEURS (12 idiomas), test | Reconocimiento del habla | WER medio de 12 idiomas | 12,7 |
| Kathbath (hindi), test | Reconocimiento del habla | WER | 3,4 |
| Lahaja (hindi), test | Reconocimiento del habla | WER | 8,8 |

Rendimiento de velocidad declarado en la model card:

| Entorno | Version | Tamano | Velocidad (veces tiempo real) |
|---|---|---|---|
| CPU | PyTorch | 920 MB | 16x |
| CPU | ONNX fp32 | 1,8 GB | 25x |
| CPU | ONNX int8 | 1,8 GB | 25x (dato parcial en la información disponible) |
| GPU de portátil | PyTorch | 920 MB | menos de 0,5 s por clip |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo en fp32 ocupa aproximadamente 920 MB de pesos (0,46B de parámetros), por lo que cabe holgadamente en GPUs de consumo con 4 GB o más; las versiones cuantizadas reducen aún más el requisito.
- GPU recomendadas: cualquier GPU CUDA con al menos 4 GB de VRAM (RTX 3060, RTX 4060, RTX 4090, A100, H100); el modelo selecciona CUDA, después GPU de Mac y finalmente CPU de forma automática.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer actuales, dado su tamaño inferior a 1 GB en fp32.
- Opciones de despliegue: `transformers` (>=5.13) con `trust_remote_code=True`; ONNX Runtime para CPU (repositorio `hima-asr-ONNX`); MLX para Apple Silicon; las versiones ONNX y MLX no requieren PyTorch (solo numpy, el runtime y `tokenizers`).
- Latencia y throughput: 16x tiempo real en CPU con PyTorch, 25x tiempo real en CPU con ONNX fp32 e int8; menos de 0,5 segundos por clip en GPU de portátil según la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vakya ASR (este modelo) | 0,46B (ASR) + 17,5M (cabeza) | Audio de 1 a 30 s por clip | 11 lenguas indias + inglés | apache-2.0-and-gemma | Hugging Face, ONNX, MLX |
| Hima-ASR (original) | 0,46B (ASR) + 17,5M (cabeza) | Audio de 1 a 30 s por clip | 11 lenguas indias + inglés | Other (apache-2.0-and-gemma) | Hugging Face |
| Whisper (OpenAI) | 39M a 1,55B según variante | Ventanas de 30 s | ~99 idiomas | MIT | Hugging Face, múltiples runtimes |
| Qwen3-ASR-1.7B (modelo base del encoder) | 1,7B | No disponible | No disponible | No disponible | Hugging Face |

La comparativa con Whisper es la más directa en cuanto a despliegue: Whisper ofrece cobertura de idiomas mucho mayor y licencia MIT, mientras que Vakya ASR se especializa en lenguas indias con code-switching y añade la cabeza de decisión, pero su licencia compuesta y su menor difusión (0 descargas, 0 likes) suponen un riesgo adicional para producción. No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es una redistribución con cambio de nombre: la arquitectura, el código y los pesos son idénticos a Hima-ASR de Prahaladha; el autor de este repositorio no es el desarrollador original.
- El decodificador de texto deriva de Gemma 3 270M y está sujeto a los Términos de Uso de Gemma, lo que impone restricciones adicionales más allá de Apache 2.0; es necesario revisar `LICENSE` y `NOTICE` antes de un uso comercial.
- Los benchmarks publicados están marcados como no verificados (`verified: false`) y proceden del propio autor; deben tomarse con cautela.
- Sesgos conocidos: no se documentan en la información disponible; al estar entrenado para lenguas indias e inglés, el rendimiento en otras lenguas no está garantizado.
- Riesgo de alucinación en la transcripción: no se documentan tasas de error específicas por lengua más allá del WER medio de FLEURS (12,7), que puede ocultar variaciones grandes entre lenguas.
- Limitación de entrada: clips de 1 a 30 segundos; no se especifica el tratamiento de audios más largos (probablemente requiera segmentación externa).
- La cabeza de decisión solo acepta preguntas en inglés y opciones predefinidas; no es un modelo generativo de texto libre.
- El modelo requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar el código antes de desplegarlo en producción.
- Sin descargas ni validación comunitaria: no hay evidencia de uso en producción ni retroalimentación de terceros.
- La licencia `apache-2.0-and-gemma` es una licencia compuesta poco habitual; la verificación legal es recomendable antes de integrarla en productos comerciales.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/ashishkblink/vakya-asr
- Modelo original Hima-ASR: https://huggingface.co/Prahaladha/hima-asr
- Aviso legal (NOTICE): https://huggingface.co/Prahaladha/hima-asr/blob/main/NOTICE
- Version ONNX: https://huggingface.co/Prahaladha/hima-asr-ONNX
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Modelo base del encoder: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Modelo base del decodificador: https://huggingface.co/google/gemma-3-270m
