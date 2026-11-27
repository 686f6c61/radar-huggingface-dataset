# SIXlabdesign/cctype-qwen3-asr-0.6b

## Resumen

Qwen3-ASR 0.6B (MLX) es una redistribución del modelo de reconocimiento automático de voz Qwen3-ASR-0.6B desarrollado por el equipo Qwen (Alibaba Cloud, Tongyi Lab). El modelo original combina un codificador de audio con un modelo de lenguaje Qwen3 que genera la transcripción directamente, con puntuación, en 30 idiomas y 22 dialectos chinos. Esta versión concreta, publicada por SIXlabdesign, es un espejo del modelo oficial adaptado para MLX, el framework de Apple para ejecutar modelos en silicio de Apple, e incluye además una copia cuantizada a 8 bits.

El modelo resuelve el problema de la transcripción de voz a texto en local sobre hardware Apple, sin depender de servicios en la nube. Está pensado para integrarse en cctype, una aplicación nativa de dictado para macOS, que lo ejecuta mediante MLX en chips de la serie M. La variante de 0.6B de parámetros es la más ligera de la familia; la versión de 1.7B se publica en un repositorio hermano.

La relevancia de esta ficha radica en que documenta una opción de ASR de tamano reducido, licencia permisiva y ejecución local en Apple Silicon, con métricas de error y latencia medidas por el propio autor sobre un conjunto de prueba propio. No se trata de un modelo nuevo entrenado por SIXlabdesign, sino de una redistribución con cuantización anadida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio (features estilo Whisper) + modelo de lenguaje Qwen3 |
| Parametros totales | 0.6B (según el nombre del modelo; no se detalla el desglose en la información disponible) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 sin modificar (`original/`) y 8 bits MLX con grupos de 64 (`8bit/`); se probó 4 bits y se descartó |
| Idiomas soportados | 30 idiomas y 22 dialectos chinos según el modelo base; la model card etiqueta zh y en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); tokenizador Qwen2 byte-level BPE en vocab.json y merges.txt |

## Arquitectura y entrenamiento

La arquitectura consiste en un codificador de audio que alimenta un modelo de lenguaje Qwen3, que es el encargado de escribir la transcripción. Las características de entrada son de estilo Whisper: 128 bins log-mel, ventana de 25 ms y salto de 10 ms. El prompt sigue la plantilla de chat de Qwen, con el contexto en el turno de sistema y el audio en el turno de usuario, y la respuesta se emite con el formato `language Chinese<asr_text>…`.

El modelo acepta contexto en texto libre (por ejemplo, listas de nombres y términos) que utiliza como referencia durante la transcripción. La model card no detalla el volumen de datos de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; esa información corresponde al modelo base Qwen/Qwen3-ASR-0.6B y no se incluye en esta redistribución. La aportación de SIXlabdesign se limita al espejo de los ficheros oficiales y a la cuantización afín de MLX de todas las capas lineales y de embedding con grupos de 64, implementada en `Tools/qwen3-asr/quantize.py` del repositorio de cctype. La implementación en Swift se validó contra la implementación de referencia en MLX (`mlx-qwen3-asr`) obteniendo texto idéntico en las frases de prueba.

## Capacidades

- Transcripción de voz a texto con puntuación generada directamente por el modelo.
- Reconocimiento de habla mixta chino-inglés, según la model card.
- Soporte de 30 idiomas y 22 dialectos chinos en el modelo base.
- Uso de contexto en texto libre (nombres, términos técnicos) para mejorar la transcripción.
- Salida con etiqueta de idioma detectado y texto transcrito.
- Ejecución local en Apple Silicon mediante MLX.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión ni audio más allá del propio ASR.

## Casos de uso

- Dictado en macOS: integración en la aplicación cctype para transcribir voz a texto en local sobre Apple Silicon, con latencias medidas de 250 a 370 ms por frase de 4 a 6 segundos de audio.
- Transcripción de reuniones bilingües chino-inglés: el modelo maneja habla mixta y genera puntuación, lo que facilita la lectura directa del resultado sin postprocesado.
- Subtitulado de contenido en chino con dialectos: el modelo base cubre 22 dialectos chinos, útil para material audiovisual regional.
- Dictado con vocabulario especializado: el contexto en texto libre permite introducir listas de nombres propios o términos técnicos para reducir errores en dominios concretos.
- Prototipado de ASR en local para desarrolladores: al ejecutarse con MLX en un Mac, permite iterar sin coste de API ni envío de audio a terceros.
- Aplicaciones de privacidad estricta: al no requerir conexión, el audio no sale del dispositivo, adecuado para entornos con requisitos de confidencialidad.
- Transcripción por lotes de audio corto en portátiles Apple: el consumo de memoria reducido de la variante de 8 bits (unos 840 MB de pesos) permite procesar colas de clips en equipos con RAM limitada.

## Benchmarks y rendimiento

El autor publica métricas propias medidas con cctype sobre 16 frases dictadas de chino e inglés mezclados, un hablante, Apple M3, vocabulario como contexto y activaciones en float16:

| Variante | Tasa de error de caracteres | Tiempo por frase (4–6 s de audio) |
|---|---|---|
| `original/` (bfloat16) | 5.0% | 370 ms |
| `8bit/` | 5.5% | 250 ms |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) para este modelo.

## Requisitos de hardware

- VRAM equivalente en memoria unificada: aproximadamente 1.9 GB para los pesos en bfloat16 y unos 840 MB para la variante de 8 bits, según los tamanos de fichero indicados.
- Hardware objetivo: Apple Silicon (el autor midió en un Apple M3). No se documenta soporte para GPU NVIDIA ni para CPU x86 en esta distribución.
- Cabe en equipos de consumo de Apple con memoria unificada de 8 GB o superior, dado el reducido tamano de los pesos.
- Despliegue: MLX y la implementación en Swift del repositorio de cctype (`Packages/Qwen3ASR`); también existe una implementación de referencia en MLX (`mlx-qwen3-asr`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 250 ms por frase de 4–6 s en la variante de 8 bits y 370 ms en bfloat16, medidas en Apple M3. No se proporcionan cifras de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-ASR 0.6B (MLX) | 0.6B | no disponible | 30 idiomas y 22 dialectos chinos (modelo base) | Apache 2.0 | Hugging Face, MLX |
| cctype-qwen3-asr-1.7b (mismo autor) | 1.7B | no disponible | no disponible | Apache 2.0 | Hugging Face, MLX |
| Whisper (familia, referencia por features) | no disponible en esta ficha | no disponible | no disponible | no disponible | no disponible |

La comparación con otros sistemas ASR queda limitada a lo indicado en la información disponible; no se aportan datos de rendimiento cruzados con Whisper ni con otros modelos.

## Limitaciones y advertencias

- Las métricas de error y latencia provienen de una prueba propia de 16 frases con un único hablante; no son representativas de todos los acentos, condiciones acústicas o dominios.
- El modelo base está orientado al chino y al inglés; el rendimiento en otros idiomas de los 30 declarados no se documenta en esta ficha.
- Se descartó la cuantización a 4 bits porque, según el autor, el modelo de 1.7B a 4 bits a veces respondía en inglés en lugar de transcribir el chino; conviene validar cualquier cuantización agresiva antes de usarla en producción.
- Esta distribución está pensada para MLX y Apple Silicon; no se garantiza su funcionamiento en otras plataformas sin conversión adicional.
- Riesgo de alucinación y de traducción no solicitada en lugar de transcripción literal, especialmente con cuantizaciones bajas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo es obra del equipo Qwen; esta redistribución solo anade la cuantización.
- No se documentan sesgos específicos ni evaluaciones de robustez en la información disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SIXlabdesign/cctype-qwen3-asr-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Versión de 1.7B del mismo autor: https://huggingface.co/SIXlabdesign/cctype-qwen3-asr-1.7b
