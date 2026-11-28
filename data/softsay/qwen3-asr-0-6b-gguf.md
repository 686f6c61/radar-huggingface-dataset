# softsay/Qwen3-ASR-0.6B-gguf

## Resumen

Qwen3-ASR-0.6B-gguf es una redistribución en formato GGUF del modelo de reconocimiento automático del habla Qwen3-ASR-0.6B, desarrollado originalmente por el equipo Qwen de Alibaba Cloud. Esta variante concreta la publica el usuario softsay como fuente de descarga propia para su producto SoftSay, y no implica ningún entrenamiento ni conversión por su parte: el archivo es una copia sin modificar del GGUF Q8_0 generado por el proyecto Handy para el runtime transcribe.cpp.

El modelo resuelve la tarea de transcripción de voz a texto (pipeline `automatic-speech-recognition`) con un tamaño reducido: 782.452.240 parámetros según los pesos en safetensors del modelo base, lo que lo sitúa en la categoría de 0,6B-0,8B. Su interés práctico reside en que, al estar cuantizado en Q8_0 y empaquetado en un único archivo de 850.423.456 bytes (unos 0,85 GB), puede ejecutarse en hardware modesto mediante transcribe.cpp, sin necesidad de GPUs de datacenter.

La relevancia actual es la de un componente de infraestructura más que la de un modelo de investigación: es una pieza lista para integrar en aplicaciones de dictado, subtitulado o asistentes de voz que necesiten transcripción local con licencia Apache 2.0. La información pública disponible sobre esta ficha es escasa (0 descargas y 0 likes en el momento de la consulta, sin idiomas declarados en los metadatos), por lo que varios apartados técnicos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3-ASR-0.6B; no se detalla la arquitectura en la información proporcionada) |
| Parametros totales | 782.452.240 (según safetensors del modelo base) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (única variante publicada en este repositorio) |
| Idiomas soportados | no disponible (los metadatos no declaran idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `Qwen3-ASR-0.6B-Q8_0.gguf`, 850.423.456 bytes, SHA-256 `f081b2d5e23bd669d92cc331d722a8a0681943b8e6f34b48996fd5c319b5acd8`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, los datos de entrenamiento, el número de tokens procesados ni las técnicas de alineación (RLHF/DPO) empleadas en Qwen3-ASR-0.6B en la documentación proporcionada. La model card de esta ficha es únicamente una nota de redistribución y no incluye detalles técnicos del modelo original.

Lo que sí se conoce es el proceso de empaquetado: la conversión a GGUF la realizó el proyecto Handy para transcribe.cpp, y softsay replica el archivo en la revisión `e4e16599b900eb0cb36e524514756bb92eb092b7` del repositorio `handy-computer/Qwen3-ASR-0.6B-gguf` sin modificarlo. La cuantización aplicada es Q8_0, es decir, pesos de 8 bits por bloque, lo que preserva prácticamente la precisión del modelo original a costa de un tamaño cercano al de los pesos en punto flotante de 16 bits para un modelo de este orden de magnitud.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto), tarea declarada en el pipeline del repositorio.
- Ejecución local mediante el runtime transcribe.cpp, orientado a despliegues ligeros.
- Integración como componente seleccionable dentro de la aplicación SoftSay (el archivo se descarga desde la configuración de la app).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión o audio más allá de la transcripción: no disponible.
- Modo thinking u otras capacidades especiales: no disponible.

## Casos de uso

- Dictado por voz en aplicaciones de escritorio: con un GGUF Q8_0 de 0,85 GB ejecutable mediante transcribe.cpp, el modelo puede transcribir audio en local sin depender de servicios en la nube, lo que resulta adecuado para herramientas de productividad que priorizan la privacidad.
- Subtitulado de vídeo y podcasts: al ser un modelo de 0,6B, permite procesar lotes de audio en máquinas sin GPU dedicada, generando transcripciones que después se sincronizan como subtítulos.
- Asistentes de voz integrados en aplicaciones: la licencia Apache 2.0 y el formato GGUF facilitan incrustar el modelo en productos comerciales de terceros, como hace SoftSay, sin obligaciones de copyleft.
- Transcripción de reuniones y notas de voz: el tamaño reducido permite mantener el modelo residente en memoria mientras la aplicación captura audio de forma continua, reduciendo la latencia de arranque en comparación con modelos de mayor tamaño.
- Procesamiento por lotes de archivos de audio en servidores modestos: un único archivo de 0,85 GB se distribuye y despliega con facilidad en contenedores, lo que simplifica pipelines de transcripción masiva donde el coste por hora de GPU es crítico.
- Evaluación y prototipado de ASR: al ser una réplica verificable por hash del GGUF de Handy, sirve como artefacto reproducible para comparar runtimes (transcribe.cpp frente a otras implementaciones) sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; como referencia orientativa, el archivo Q8_0 ocupa 850.423.456 bytes (unos 0,85 GB), por lo que los pesos caben holgadamente en cualquier GPU consumer con 2 GB o más de memoria, aunque el consumo real depende del runtime y del procesamiento de audio.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, el modelo es apto para GPUs consumer (RTX 3060, RTX 4060, RTX 4090) e incluso para ejecución en CPU.
- Cabe en GPU consumer: sí, por el tamaño del archivo; la información no detalla requisitos concretos por modelo de GPU.
- Opciones de despliegue: transcribe.cpp (runtime para el que fue convertido); no se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI) para este archivo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| softsay/Qwen3-ASR-0.6B-gguf (esta ficha) | 782.452.240 | no disponible | GGUF Q8_0 | Apache 2.0 | Hugging Face, réplica de handy-computer |
| handy-computer/Qwen3-ASR-0.6B-gguf | 782.452.240 (mismo modelo base) | no disponible | GGUF | Apache 2.0 (heredada) | Hugging Face, origen de la conversión |
| Qwen/Qwen3-ASR-0.6B | 782.452.240 | no disponible | safetensors (según metadatos del base) | Apache 2.0 | Hugging Face, modelo original |

No se dispone de información sobre otros modelos ASR comparables (por ejemplo, Whisper de OpenAI u otros) en la documentación proporcionada, por lo que no se incluyen datos de rendimiento comparativo.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, tasas de alucinación ni comportamiento por idioma; los metadatos no declaran idiomas soportados, lo que impide garantizar cobertura multilingüe sin evaluarla previamente.
- El modelo está especializado en transcripción; no debe esperarse de él razonamiento, generación de código ni tool calling, capacidades no declaradas.
- Solo se publica la cuantización Q8_0; no hay variantes Q4, Q5 u otras en este repositorio, lo que limita el ajuste fino de memoria frente a precisión.
- El archivo depende del runtime transcribe.cpp; no se garantiza su funcionamiento en otros motores de inferencia GGUF sin verificación adicional.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar los archivos `LICENSE` y `NOTICE` del repositorio y respetar las condiciones del modelo base Qwen.
- Este repositorio es una réplica de un tercero (softsay) sin cambios respecto al original de Handy; para producción conviene fijar la revisión y verificar el SHA-256 publicado para asegurar la integridad del archivo.
- El repositorio presenta 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria documentada sobre su funcionamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/softsay/Qwen3-ASR-0.6B-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Repositorio GGUF de origen (Handy): https://huggingface.co/handy-computer/Qwen3-ASR-0.6B-gguf
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Sitio de SoftSay: https://softsay.ai
