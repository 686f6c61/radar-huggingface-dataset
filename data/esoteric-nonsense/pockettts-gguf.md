# Esoteric-Nonsense/PocketTTS-GGUF

## Resumen

PocketTTS-GGUF es una conversión al formato GGUF del modelo de síntesis de voz (TTS) kyutai/pocket-tts, publicada por el usuario Esoteric-Nonsense. No se trata de un modelo de lenguaje generativo de texto, sino de un sistema de conversión de texto a voz de aproximadamente 336 millones de parámetros, distribuido en formatos ONNX y GGUF para facilitar su despliegue local. La conversión se realizó para un proyecto personal del autor y se publica bajo licencia CC BY-SA 4.0, la misma del modelo original.

El interés de esta ficha radica en que Pocket TTS es un modelo compacto (en torno a 300 M de parámetros) diseñado para ejecutarse en hardware modesto, incluso en CPU, con latencias compatibles con aplicaciones interactivas. La comunidad ha derivado numerosos fine-tunes lingüísticos a partir de la arquitectura base (checo, hindi, coreano, persa, indonesio, estonio, galés, turco, polaco, griego, japonés, chino y multilingüe indio), lo que demuestra la flexibilidad del diseño para adaptaciones a nuevos idiomas con pocos recursos.

La relevancia actual de esta conversión GGUF es que permite ejecutar el modelo con runtimes ligeros basados en GGML/GGUF, sin depender de PyTorch ni de ONNX Runtime, lo que simplifica el despliegue en entornos embebidos, aplicaciones de escritorio y servicios de bajo coste. No obstante, la información técnica publicada por el autor de la conversión es mínima, por lo que muchos parámetros deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS; el modelo base kyutai/pocket-tts no detalla arquitectura en la información proporcionada) |
| Parametros totales | 336.068.290 (según safetensors del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene pesos GGUF y ONNX; no se detallan los niveles de cuantización) |
| Idiomas soportados | no disponible en el modelo base; existen fine-tunes comunitarios para checo, hindi, coreano, persa, indonesio, estonio, galés, turco, polaco, griego, japonés, chino y multilingüe indio (inglés, hindi, maratí, canarés, tamil, malabar y telugu) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | GGUF y ONNX |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo base kyutai/pocket-tts. Por el nombre y el tamaño (≈336 M de parámetros), se trata de un modelo TTS compacto orientado a inferencia local, pero no se especifica si emplea un transformer, un modelo basado en difusión, un codec neuronal de audio o una combinación de ellos. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO.

Lo que sí se desprende de la model card es que la arquitectura admite variaciones en el número de capas: varios fine-tunes comunitarios indican explícitamente "6 layers" (indonesio, turco, polaco, griego, japonés, chino, multilingüe) y otro indica "24 layers" (galés). Esto sugiere que el modelo base es parametrizable en profundidad y que la comunidad ajusta el tamaño según el idioma y los recursos disponibles. La conversión a GGUF y el código C++ asociado derivan del repositorio oficial kyutai-labs/pocket-tts en GitHub.

## Capacidades

- Síntesis de voz a partir de texto (text-to-speech) en el modelo base.
- Soporte de voces de referencia: los ejemplos de la model card muestran el parámetro `--voice` con archivos WAV para condicionar la voz de salida (clonación o selección de hablante).
- Adaptación multilingüe mediante fine-tunes comunitarios: checo, hindi, coreano, persa, indonesio, estonio, galés, turco, polaco, griego, japonés, chino y un modelo multilingüe indio con mezcla de código (code mixing).
- Ejecución local mediante la herramienta `pocket-tts` (invocable con `uvx pocket-tts generate`) y mediante los pesos GGUF/ONNX de esta conversión.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes; es un modelo exclusivamente de audio.

## Casos de uso

- Lectura de artículos y documentos: el modelo convierte texto plano en audio para aplicaciones de accesibilidad o consumo de contenido, ejecutándose en local sin enviar datos a servicios externos.
- Asistentes de voz en aplicaciones de escritorio: al ser un modelo de ~336 M de parámetros en GGUF, puede integrarse en aplicaciones nativas que necesiten síntesis de voz sin depender de la nube.
- Sistemas de navegación y avisos por voz: la baja huella del modelo permite generar indicaciones habladas en dispositivos embebidos o de recursos limitados.
- Doctores y aprendizaje de idiomas: los fine-tunes comunitarios (checo, polaco, griego, japonés, etc.) permiten practicar pronunciación y generar material auditivo en distintas lenguas.
- Atención al cliente con respuestas habladas: combinado con un modelo de lenguaje y un ASR, Pocket TTS puede cerrar el bucle conversacional generando respuestas de voz en timepo real.
- Generación de audiolibros y pódcasts: la posibilidad de condicionar la voz con un WAV de referencia permite mantener una voz consistente a lo largo de textos largos.
- Prototipado de pipelines TTS en investigación: la disponibilidad de pesos en GGUF y ONNX facilita comparar runtimes y medir latencias sin depender de frameworks pesados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; con ~336 M de parámetros, una cuantización de 8 bits ocuparía del orden de 350-400 MB y una de 4 bits alrededor de 200 MB, pero el autor no detalla los niveles de cuantización incluidos.
- GPU recomendadas: no disponible. Por tamaño, el modelo es apto para GPU de consumo como RTX 3060, RTX 4060 o superiores, e incluso para ejecución en CPU.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 2 GB o más de VRAM, aunque no se confirma en la información proporcionada.
- Opciones de despliegue: la model card menciona la herramienta `pocket-tts` (instalable con `uvx` o `pip`), pesos GGUF (compatibles con runtimes GGML) y pesos ONNX (ONNX Runtime). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card del fine-tune estonio menciona que el modelo "funciona más rápido que en tiempo real en un ordenador normal", pero no se aportan cifras concretas para esta conversión.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| PocketTTS-GGUF (esta ficha) | ~336 M | no disponible | base no disponible; fine-tunes comunitarios en 13+ idiomas | CC BY-SA 4.0 | GGUF, ONNX |
| kyutai/pocket-tts (modelo base) | ~336 M | no disponible | no disponible | CC BY-SA 4.0 | no disponible en la información |
| Fine-tunes comunitarios (p. ej. pocket-tts-czech, pocket-tts-hindi) | ~300 M (6 capas en varios) | no disponible | idioma específico | CC BY-SA 4.0 (presumiblemente) | no disponible |

No se dispone de datos de benchmarks ni de otros modelos TTS comparables en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y formatos.

## Limitaciones y advertencias

- La información técnica publicada por el autor de la conversión es mínima: no se detallan cuantizaciones, arquitectura ni rendimiento.
- Riesgo de artefactos y alucinaciones de audio: como todo modelo TTS, puede producir pronunciaciones incorrectas, entonación antinatural o ruido en textos fuera de dominio.
- Idiomas: el modelo base no declara idiomas soportados; el castellano no aparece entre los fine-tunes comunitarios listados, por lo que su calidad en español es incierta.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a compartir las obras derivadas bajo la misma licencia y a atribuir al autor original; conviene revisar las implicaciones para productos propietarios.
- El repositorio ocupa 53,3 GB, lo que sugiere que incluye múltiples variantes de pesos (GGUF y ONNX) y posiblemente conversiones redundantes; no se especifica qué archivo corresponde a qué cuantización.
- No se documentan sesgos de voz, género o acento; los fine-tunes comunitarios pueden heredar sesgos de sus datasets de entrenamiento.
- Para producción, es necesario validar la calidad de la síntesis en el idioma y dominio concretos, así como la latencia real en el hardware objetivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Esoteric-Nonsense/PocketTTS-GGUF
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Repositorio GitHub oficial: https://github.com/kyutai-labs/pocket-tts
- Fine-tune checo: https://huggingface.co/vvolhejn/pocket-tts-czech
- Fine-tune hindi: https://huggingface.co/saryps-labs/pocket-tts-hindi
- Fine-tune coreano: https://huggingface.co/seastar105/pocket-tts-korean-300m
- Fine-tune persa: https://huggingface.co/mehdi-hf/pocket-tts-farsi
- Fine-tune indonesio: https://huggingface.co/anak10thn/pocket-tts-indonesian
- Fine-tune estonio: https://huggingface.co/cbentes/pocket-tts-estonian
- Fine-tune galés: https://huggingface.co/EryriLabs/pocket-tts-cymraeg
- Fine-tune turco: https://huggingface.co/alperiox/pocket-tts-turkish
- Fine-tune polaco: https://huggingface.co/shefowl/pocket-tts-polish-6l
- Fine-tune griego: https://huggingface.co/myned-ai/pocket-tts-greek
- Fine-tune japonés: https://huggingface.co/takuma104/pocket-tts-ja
- Fine-tune chino: https://huggingface.co/hustfyb/PocketTTS-ZH-6L
- Fine-tune multilingüe indio: https://huggingface.co/Thanushttk/pocket-tts-multilingual
