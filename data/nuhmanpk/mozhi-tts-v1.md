# nuhmanpk/mozhi-tts-v1

## Resumen

Mozhi TTS v1 es un modelo de síntesis de voz (text-to-speech) especializado en malabar (malayalam) y manglish (malabar escrito con alfabeto latino), desarrollado por el usuario nuhmanpk y publicado en Hugging Face bajo licencia CC BY-SA 4.0. Se trata de un ajuste fino (finetune) del modelo Kokoro-82M de hexgrad, una arquitectura TTS ligera y eficiente diseñada para inferencia en tiempo real incluso en CPU. El modelo se distribuye en formato ONNX, lo que facilita su despliegue en entornos sin GPU y su integración en aplicaciones offline.

El problema que resuelve es la escasez de sistemas TTS de calidad para malabar, un idioma dravídico con más de 35 millones de hablantes y una representación limitada en los ecosistemas de voz open source. Al soportar tanto la escritura nativa malabar como la transliteración latina (manglish), cubre un caso de uso muy común en la diáspora y en aplicaciones de mensajería donde los usuarios escriben malabar con caracteres latinos.

El modelo cuenta con aproximadamente 937,8 millones de parámetros según los pesos en safetensors, un tamaño de repositorio de 0,7 GB y acceso restringido (gated), por lo que es necesario aceptar las condiciones en Hugging Face antes de descargarlo. Su relevancia actual radica en que ofrece una alternativa offline, rápida y de bajo coste computacional para aplicaciones de accesibilidad, lectura de contenido y asistentes de voz en malabar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS basada en Kokoro-82M (finetune); pesos en ONNX y safetensors |
| Parametros totales | 937.817.577 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (distribución principal en ONNX) |
| Idiomas soportados | malabar (ml) y manglish (malabar transliterado) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX y safetensors |

## Arquitectura y entrenamiento

Mozhi TTS v1 es un ajuste fino del modelo Kokoro-82M, un sistema TTS de arquitectura ligera orientado a síntesis rápida y despliegue en CPU. Kokoro-82M se caracteriza por su bajo coste computacional y su capacidad de generar voz en tiempo real sin necesidad de GPU. El modelo base se ha adaptado al malabar mediante fine-tuning supervisado sobre datos de voz en ese idioma.

Los datasets utilizados en el entrenamiento, según las etiquetas del repositorio, son `nuhmanpk/mozhi-malayalam-speech` y `ai4bharat/Rasa`. No se dispone de información detallada sobre el número de tokens, horas de audio, composición exacta del dataset ni sobre si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá de la propia arquitectura de Kokoro. La información disponible no permite confirmar detalles sobre el proceso de alineación o evaluación del ajuste.

## Capacidades

- Síntesis de voz a partir de texto en malabar (escritura nativa).
- Soporte de manglish: entrada en alfabeto latino que representa malabar hablado.
- Inferencia en tiempo real en CPU gracias a la arquitectura ligera heredada de Kokoro-82M.
- Funcionamiento offline, sin dependencia de servicios en la nube.
- Distribución en ONNX, lo que permite integración en aplicaciones de escritorio, móviles o embebidas.
- No se documentan capacidades de clonación de voz, control de emociones, tool calling ni razonamiento multi-paso; es un modelo exclusivamente TTS.

## Casos de uso

- Lectura de contenido en malabar: convertir artículos, noticias o libros electrónicos a audio para aplicaciones de accesibilidad o consumo en movilidad, aprovechando la inferencia rápida en CPU.
- Asistentes de voz offline: integrar el modelo en dispositivos sin conexión (Raspberry Pi, portátiles) para dar respuestas habladas en malabar sin enviar datos a la nube.
- Aplicaciones de mensajería y redes sociales: convertir mensajes escritos en manglish a voz, un formato muy habitual entre hablantes de malabar en la diáspora.
- Sistemas de navegación y avisos: generar indicaciones de voz en malabar para apps de transporte o conducción, con baja latencia y sin coste de API.
- Educación y aprendizaje de idiomas: producir audio de pronunciación para materiales didácticos de malabar, incluyendo la transliteración latina como apoyo.
- Atención al cliente automatizada en malabar: combinar el TTS con un modelo de lenguaje para respuestas habladas en centros de contacto, desplegando el componente de voz en servidores CPU económicos.
- Accesibilidad para personas con discapacidad visual: leer en voz alta contenido digital en malabar desde aplicaciones de escritorio o móviles sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al distribuirse en ONNX y estar diseñado para CPU, no requiere VRAM dedicada; en GPU, el modelo de ~938 M de parámetros ocuparía aproximadamente 2 GB en FP32 y en torno a 1 GB en FP16, aunque no se documentan requisitos oficiales.
- GPU recomendadas: no se especifican; el modelo está optimizado para CPU. Cualquier GPU consumer moderna (RTX 3060 o superior) podría ejecutarlo con holgura, pero no es el escenario previsto.
- Cabe en GPU consumer: sí, por tamaño, aunque su diseño apunta a ejecución en CPU.
- Opciones de despliegue: ONNX Runtime para inferencia en CPU; integración con la librería transformers; el formato ONNX permite su uso en aplicaciones embebidas y de escritorio. No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no a TTS).
- Latencia y throughput: no disponibles en la información proporcionada; las etiquetas indican "fast", "cpu" y "real-time", pero sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mozhi TTS v1 | ~938 M | malabar, manglish | CC BY-SA 4.0 | ONNX, safetensors | Finetune de Kokoro-82M; acceso restringido |
| Kokoro-82M (hexgrad) | 82 M | múltiples (incluye varios idiomas) | Apache 2.0 (según modelo base) | safetensors, ONNX | Modelo base ligero y ampliamente adoptado; no especializado en malabar |
| ai4bharat/Rasa | no disponible | varios idiomas indios | no disponible | no disponible | Dataset utilizado en el entrenamiento; no es un modelo comparable directamente |

No se dispone de información suficiente para comparar rendimiento (benchmarks) con alternativas TTS específicas para malabar. La comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar el modelo.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a compartir las obras derivadas bajo la misma licencia y a atribuir al autor; revisar implicaciones para productos propietarios.
- Ámbito lingüístico limitado a malabar y manglish; no se documenta soporte para otros idiomas.
- No se han publicado benchmarks ni evaluaciones formales de calidad de síntesis (MOS, inteligibilidad), por lo que la calidad real no está cuantificada.
- Riesgo de pronunciación incorrecta en palabras poco frecuentes, nombres propios o mezclas de código no representadas en el dataset de entrenamiento.
- Posibles sesgos de voz derivados de los hablantes presentes en los datasets de entrenamiento (edad, género, registro); no se documenta diversidad de voces.
- No se documentan capacidades de control prosódico, emociones ni clonación de voz.
- Al ser un finetune de un modelo pequeño, puede presentar artefactos en frases largas o estructuras gramaticales complejas.
- No se especifican requisitos mínimos de hardware ni latencias oficiales; las estimaciones deben validarse en el entorno de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nuhmanpk/mozhi-tts-v1
- Modelo base Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Dataset de voz en malabar: https://huggingface.co/datasets/nuhmanpk/mozhi-malayalam-speech
- Dataset Rasa de AI4Bharat: https://huggingface.co/datasets/ai4bharat/Rasa
