# notmax123/QwenTTS-he-1.7B-GGUF

## Resumen

QwenTTS-he-1.7B-GGUF es una versión cuantizada en formato GGUF del modelo de síntesis de voz Qwen3-TTS-12Hz-1.7B-Base, adaptado específicamente al hebreo mediante la fusión de un LoRA entrenado sobre transcripciones fonéticas IPA. El modelo ha sido desarrollado por notmax123 y está pensado para ejecutarse en el runtime qwentts.cpp, lo que permite inferencia sin dependencias de Python, PyTorch o PEFT. Esto lo hace especialmente relevante para despliegues ligeros en entornos de producción o en hardware modesto, donde se necesita un TTS en hebreo con clonación de voz por referencia.

El modelo consta de dos componentes GGUF: un "talker" que convierte texto fonético en tramas de codec de audio a 12,5 Hz (1,22 GB en Q4_K_M) y un codec de audio que reconstruye la forma de onda a 24 kHz (255 MB). Ambos son necesarios para la síntesis. La entrada debe ser IPA acentuada, no escritura hebrea estándar, por lo que se requiere un front-end de conversión grafema-fonema como RenikudPlus. El modelo se distribuye bajo licencia Apache-2.0 y solo cubre el idioma hebreo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-TTS talker + codec de audio) |
| Parametros totales | 1.928.677.440 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (talker y codec) |
| Idiomas soportados | Hebreo (solo) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (dos archivos: talker y codec) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-TTS-12Hz-1.7B-Base, un sistema de síntesis de voz que genera tramas de codec a 12,5 Hz a partir de texto. Sobre este base se entrenó un adaptador LoRA específico para hebreo, con entrada en IPA acentuada. El proceso de fusión no fue un simple plegado de LoRA: además de los 231 pares `lora_A`/`lora_B` con `alpha / r = 2.0`, el adaptador incluye 20 tensores completamente reentrenados (`codec_head`, `text_projection` y las quince cabezas `code_predictor.lm_head.*`) que reemplazan directamente a los del modelo base. La fusión se realizó en float32 y se convirtió a bf16 antes de pasar a GGUF.

Posteriormente, los pesos se convirtieron a GGUF F32 y se cuantizaron a Q4_K_M mediante las herramientas de qwentts.cpp. Los codebooks RVQ y sus proyecciones se mantienen en F32 porque la búsqueda del vecino más cercano es sensible al ruido de cuantización por fila. El resultado es un modelo que funciona íntegramente en GGML, sin necesidad de Python en tiempo de inferencia.

## Capacidades

- Síntesis de voz en hebreo a partir de texto fonético IPA acentuado (p. ej. `ʃalˈom, mˈa ʃlomχˈa hajˈom?`).
- Clonación de voz mediante un audio de referencia (`--ref-wav`), sin hablantes predefinidos (modo base).
- Ejecución en runtime GGML (qwentts.cpp) sin dependencias de Python, PyTorch o PEFT.
- Generación de audio mono a 24 kHz.
- Soporte de entrada por línea de comandos (CLI) para integración en scripts y pipelines.
- No soporta otros idiomas: el adaptador reentrenó las cabezas de salida para la fonotáctica hebrea, por lo que las capacidades multilingües del base quedan fuera.

## Casos de uso

- Asistentes de voz en hebreo: el modelo puede integrarse en un asistente local que reciba texto fonético generado por un front-end G2P y produzca respuestas habladas con la voz del usuario o una voz clonada.
- Audiolibros en hebreo: permite convertir textos en hebreo (previamente transformados a IPA) a audio, con control de la voz mediante una muestra de referencia.
- Accesibilidad para personas con discapacidad visual: lectura de pantalla en hebreo con voz natural, ejecutable en equipos sin GPU dedicada gracias al formato GGUF.
- Doblaje de contenido en hebreo: clonación de voces para doblar vídeos o podcasts, usando un clip de referencia del locutor deseado.
- Prototipado rápido de aplicaciones TTS: al no requerir Python en inferencia, se puede integrar en servicios ligeros o en dispositivos embebidos con un simple binario.
- Sistemas de respuesta de voz interactiva (IVR) en hebreo: generación de mensajes dinámicos en tiempo real con baja latencia, usando la CLI de qwentts.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño total en disco: aproximadamente 1,5 GB (1,22 GB del talker + 255 MB del codec).
- VRAM estimada para inferencia: con cuantización Q4_K_M, el modelo cabe en GPUs con 2-4 GB de VRAM; también puede ejecutarse en CPU mediante qwentts.cpp.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, series integradas de Intel o AMD con soporte Vulkan). No se requieren GPUs de gama alta.
- Opciones de despliegue: qwentts.cpp (CLI nativa), compatible con el ecosistema GGML. No se menciona soporte para vLLM, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos TTS hebreos comparables en la documentación proporcionada. El modelo base Qwen3-TTS soporta diez idiomas, pero este adaptador limita el alcance al hebreo, por lo que no es directamente comparable con el base sin el adaptador. Se recomienda consultar el repositorio de Qwen3-TTS para alternativas multilingües.

## Limitaciones y advertencias

- Solo hebreo: el adaptador reentrenó las cabezas de salida para la fonotáctica hebrea, por lo que otros idiomas del base no están soportados.
- Entrada obligatoria en IPA acentuada: no acepta escritura hebrea estándar; requiere un front-end G2P como RenikudPlus, lo que añade una dependencia adicional.
- Clonación de voz sensible a la calidad del audio de referencia: una muestra deficiente degrada la calidad de la síntesis.
- Sin hablantes predefinidos: al ser un checkpoint en modo base, la voz debe proporcionarse siempre mediante `--ref-wav`.
- Cuantización Q4_K_M: puede introducir pérdida de calidad en el audio en comparación con el modelo en precisión completa, aunque los codebooks RVQ se mantienen en F32.
- Modelo sin benchmarks publicados: no hay evidencia formal de rendimiento en tareas estándar de TTS.
- Licencia Apache-2.0: permite uso comercial, pero el usuario debe verificar el cumplimiento de las condiciones de la licencia del modelo base y del adaptador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/notmax123/QwenTTS-he-1.7B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Repositorio MamboTTS (scripts de fusión): https://github.com/maxmelichov/MamboTTS
- Repositorio qwentts.cpp (runtime y conversión): https://github.com/ServeurpersoCom/qwentts.cpp
- Front-end G2P RenikudPlus: https://huggingface.co/notmax123/RenikudPlus
