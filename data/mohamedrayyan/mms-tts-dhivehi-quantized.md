# mohamedrayyan/mms-tts-dhivehi-quantized

## Resumen

El modelo `mohamedrayyan/mms-tts-dhivehi-quantized` es un conjunto de checkpoints cuantizados a int8 del sistema de síntesis de voz (text-to-speech) en dhivehi, basado en la arquitectura VITS del proyecto Massively Multilingual Speech (MMS) de Meta. El autor, mohamedrayyan, ha afinado el modelo MMS-TTS preentrenado para el idioma dhivehi (código ISO `dv`), hablado en las Maldivas, y ha exportado seis variantes de hablante (tres femeninas, dos masculinas y una clonada) en formato PyTorch cuantizado para permitir inferencia con bajo consumo de memoria, aproximadamente 137 MB por checkpoint.

Este modelo es relevante porque el dhivehi es un idioma de bajos recursos con escasa disponibilidad de sistemas TTS de calidad. Al ofrecer versiones cuantizadas, facilita el despliegue en entornos con limitaciones de hardware, como CPUs o GPUs de gama baja, manteniendo una calidad aceptable para aplicaciones prácticas. El repositorio forma parte de un proyecto más amplio del autor, que incluye también exportaciones ONNX y un espacio de demostración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial Training for end-to-end Text-to-Speech) |
| Parametros totales | no disponible (el modelo MMS-TTS original tiene aproximadamente 100 millones, pero no se confirma para este fine-tuning) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de síntesis de voz, no de lenguaje) |
| Tipos de cuantizacion | int8 (exportado via `torch.quantization`) |
| Idiomas soportados | dhivehi (dv) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (`.pt`) |

## Arquitectura y entrenamiento

El modelo se basa en VITS, una arquitectura de síntesis de voz de extremo a extremo que combina un codificador de texto, un decodificador de forma de onda y un discriminador adversarial, todo entrenado de manera conjunta. El checkpoint original proviene del proyecto MMS de Meta, que preentrenó modelos TTS en más de 1100 idiomas. Sobre esa base, el autor ha realizado un fine-tuning específico para dhivehi, generando seis variantes de hablante: tres voces femeninas (`md-f01`, `md-f02`, `md-f03`), una masculina (`md-m01`) y dos voces clonadas (`spk01-f01` y `spk01-m01`). Los checkpoints cuantizados se obtuvieron mediante cuantización post-entrenamiento a int8, lo que reduce el tamaño y acelera la inferencia a costa de una ligera pérdida de fidelidad. No se dispone de detalles sobre el dataset de entrenamiento ni sobre el proceso de fine-tuning (número de horas, composición, etc.).

## Capacidades

- Síntesis de voz en dhivehi a partir de texto, con seis voces diferentes (tres femeninas, una masculina y dos clonadas).
- Inferencia eficiente en CPU y GPU gracias a la cuantización int8, con un tamaño de checkpoint de aproximadamente 137 MB.
- Compatible con el pipeline `text-to-speech` de Hugging Face, lo que facilita su integración en aplicaciones existentes.
- Al estar basado en VITS, genera audio de forma directa sin necesidad de vocoder externo.
- Soporte para control de hablante mediante la selección del checkpoint correspondiente.

## Casos de uso

- Audiolibros y narración de contenido en dhivehi: el modelo puede convertir artículos, libros o noticias en audio, aprovechando las distintas voces para diferenciar personajes o secciones.
- Asistentes de voz y sistemas de respuesta interactiva: integrable en aplicaciones de atención al cliente o asistentes personales que necesiten responder en dhivehi, con baja latencia y requisitos de hardware reducidos.
- Accesibilidad para personas con discapacidad visual: permite leer en voz alta contenido digital en dhivehi, facilitando el acceso a la información.
- Educación y aprendizaje de idiomas: generación de material de pronunciación para estudiantes de dhivehi, con ejemplos de audio generados por el modelo.
- Sistemas de navegación y anuncios públicos: conversión de mensajes de texto en dhivehi a voz para sistemas de megafonía o guías turísticas.
- Desarrollo de aplicaciones de comunicación aumentativa y alternativa (CAA): el modelo puede servir como salida de voz para dispositivos de comunicación asistida en dhivehi.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas objetivas como MOS (Mean Opinion Score) o comparaciones con otros sistemas TTS para dhivehi.

## Requisitos de hardware

- VRAM estimada: cada checkpoint cuantizado ocupa ~137 MB, por lo que la inferencia puede ejecutarse en GPUs con tan solo 1 GB de VRAM, e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1050, RTX 2050, o integradas como Intel Iris Xe). Para CPU, se recomienda al menos 4 GB de RAM.
- Es adecuado para hardware de bajo consumo, como Raspberry Pi 4 o similares, siempre que se use una implementación optimizada.
- Opciones de despliegue: al ser checkpoints de PyTorch, se puede usar directamente con la librería `transformers` o `torch`. También se pueden convertir a ONNX (el autor ofrece exportaciones ONNX en un repositorio separado) para su uso con ONNX Runtime. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que son herramientas orientadas a modelos de lenguaje, no a TTS.
- Latencia y throughput: no se proporcionan datos específicos, pero al ser un modelo VITS cuantizado, se espera una generación de audio en tiempo real o superior en hardware moderno.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos TTS para dhivehi. Existen alternativas genéricas como el propio `facebook/mms-tts` (que incluye una versión para dhivehi sin fine-tuning) o servicios comerciales de síntesis de voz, pero no se dispone de datos objetivos de rendimiento ni de calidad para comparar. El autor menciona que los checkpoints fp32 (`mohamedrayyan/mms-tts-dhivehi-*`) ofrecen mayor calidad, por lo que la comparativa principal es entre la versión cuantizada y la de precisión completa.

## Limitaciones y advertencias

- La cuantización int8 introduce una pérdida de calidad respecto a los checkpoints fp32; se recomienda usar las versiones de precisión completa si la calidad del audio es crítica.
- El modelo está entrenado únicamente para dhivehi; no soporta otros idiomas ni mezclas de código.
- No se dispone de información sobre sesgos o limitaciones en la pronunciación de nombres propios, acentos regionales o jerga técnica.
- Las voces clonadas (`spk01-*`) pueden presentar artefactos o menor naturalidad que las voces originales, dependiendo de la calidad de la clonación.
- El repositorio no incluye documentación sobre el proceso de fine-tuning ni sobre el dataset utilizado, lo que limita la reproducibilidad.
- Aunque la licencia es MIT, el modelo base MMS de Meta tiene su propia licencia (CC-BY-NC 4.0 para algunos modelos); se debe verificar la compatibilidad si se planea un uso comercial.

## Enlaces

- Repositorio del modelo: https://huggingface.co/mohamedrayyan/mms-tts-dhivehi-quantized
- Proyecto Chatterbox TTS Dhivehi: https://huggingface.co/mohamedrayyan/chatterbox-tts-dhivehi
- Exportaciones ONNX: https://huggingface.co/mohamedrayyan/mms-tts-dhivehi-onnx
- Modelo base MMS-TTS de Meta: https://huggingface.co/facebook/mms-tts
- Espacio de demostración: https://huggingface.co/spaces/dhivehihacker/tts-dhivehi-demo-mms
- Organización DhivehiAI en GitHub: https://github.com/DhivehiAI
