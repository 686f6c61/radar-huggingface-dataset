# ImAXISOG/iris-gemma-4-e4b-it-mlx

## Resumen
Iris Gemma 4 E4B (MLX) es un ajuste fino mediante LoRA del modelo google/gemma-4-E4B-it, desarrollado por ImAXISOG para la aplicación Iris, una app de escritura y corrección en dispositivo. El modelo está especializado en dos tareas concretas: corregir ortografía, gramática, mayúsculas y puntuación sin alterar el resto del texto, y reescribir mensajes según tonos predefinidos (profesional, amigable, más corto, más claro o divertido). No está entrenado para ninguna otra función, lo que lo convierte en una herramienta muy enfocada en lugar de un modelo generalista.

Con 7.636.276.266 parámetros totales (según los safetensors del repositorio) y un tamaño de repo de 4,6 GB, se distribuye en formato MLX cuantizado a 4 bits con group size 64, orientado a Apple Silicon. Lee inglés, hindi (devanagari) e hinglish, pero siempre responde en inglés. Su licencia Apache 2.0, aunque basada en una versión modificada de Gemma 4, permite uso comercial con condiciones.

La relevancia actual radica en su enfoque en dispositivo (on-device) y su rendimiento medido en pruebas ciegas por un modelo de IA: supera a su modelo base sin entrenar en tareas de corrección (90% frente a 52% en inglés) y en tonos (93% frente a 86% en profesional y amigable), lo que lo posiciona como una opción práctica para aplicaciones de escritura en Macs con 16 GB o más de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en google/gemma-4-E4B-it, ajuste fino con LoRA) |
| Parametros totales | 7.636.276.266 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (group size 64) en MLX; existe versión GGUF (4,58 GB) |
| Idiomas soportados | en, hi (lee hindi e hinglish; responde siempre en inglés) |
| Licencia | Apache 2.0 (versión modificada de Gemma 4) |
| Formato de pesos | safetensors (MLX); también disponible GGUF |

## Arquitectura y entrenamiento
El modelo se basa en la arquitectura transformer de google/gemma-4-E4B-it, sobre la que se aplicó un ajuste fino con LoRA. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. El entrenamiento está orientado exclusivamente a dos tareas de escritura: corrección (Fix) y reescritura por tonos (Professional, Friendly, Shorter, Clearer, Funny), manteniendo todos los puntos, quién hace qué y las preguntas como preguntas. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades
- Corrección de ortografía, gramática, mayúsculas y puntuación sin modificar el resto del texto (preserva formas cortas, jerga y voz casual).
- Reescritura de mensajes en cinco tonos: Professional, Friendly, Shorter, Clearer y Funny, conservando el contenido y las preguntas.
- Lectura de inglés, hindi (devanagari) e hinglish (hindi escrito con letras latinas), con respuesta siempre en inglés.
- Generación de texto conversacional y text-generation según pipeline declarado.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- No se documenta modo thinking ni capacidades multimodales.

## Casos de uso
- Corrección de borradores en inglés en aplicaciones de escritura: el modelo corrige faltas y puntuación sin alterar el estilo del usuario, adecuado para mensajes informales y profesionales gracias a su entrenamiento específico en Fix (90% de aceptación en pruebas ciegas).
- Reescritura de correos profesionales: transforma un mensaje en tono Professional conservando todos los puntos y preguntas, útil para comunicación laboral en inglés.
- Acortamiento y clarificación de mensajes: la función Shorter y Clearer permite condensar textos largos manteniendo la información esencial, con un 90% de "would send" en pruebas.
- Normalización de mensajes en hinglish a inglés: lee drafts en hindi o hinglish y los corrige en inglés (95% de aceptación en Fix), útil para equipos con personal multilingüe en India.
- Aplicaciones on-device en Apple Silicon: al ser MLX 4-bit con 4,54 GB y un pico de 3,6 GB, puede ejecutarse en Macs de 16 GB sin conexión, ideal para apps de privacidad.
- Generación de respuestas con tono divertido: la función Funny (66% de "would send") sirve para mensajes informales y sociales, aunque con menor fiabilidad que otros tonos.
- Integración en flujos de escritura asistida: como modelo especializado, puede incrustarse en editores de texto o clientes de correo para sugerir correcciones y reescrituras en tiempo real.

## Benchmarks y rendimiento
Datos declarados por el autor (no verificados):

| Tarea | Gemma 4 E4B-it sin entrenar | Iris Lighter (E2B) | Iris Best quality (E4B) |
|---|---|---|---|
| English Fix: accepted (50 drafts) | 52% | 86% | 90% |
| Professional and Friendly: would send (100 answers) | 86% | 88% | 93% |
| Shorter and Clearer: would send (100 answers) | 75% | 86% | 90% |
| Funny: would send (50 answers) | 4% | 56% | 66% |
| Hindi and Hinglish, Fix (into English): accepted (82 drafts) | 91% | 71% | 95% |
| Hindi and Hinglish, tones (into English): would send (240 answers) | 71% | 47% | 76% |

Evaluación ciega por un modelo de IA, respuesta por respuesta, sobre borradores creados solo para pruebas. El autor indica que diferencias inferiores a unos 8 puntos están dentro del ruido.

## Requisitos de hardware
- VRAM/memoria estimada: 3,6 GB en pico en Mac (MLX 4-bit); en Windows con llama.cpp, 3,9 GB más el archivo de 4,6 GB en memoria, 8,4 GB en total.
- GPU recomendadas: Apple Silicon (Mac con 16 GB o más para la versión Best quality); en Windows, PC con 16 GB o más.
- Cabe en GPU consumer: sí, en Macs de 16 GB; para Macs de 8 GB se recomienda la versión Lighter (E2B, 2,9 GB en pico).
- Opciones de despliegue: MLX (Apple Silicon); llama.cpp y GGUF para Windows (repositorio iris-gemma-4-e4b-it-gguf).
- Latencia y throughput: no disponibles; el autor advierte que en Windows, si falta memoria, el sistema descarga el archivo y las respuestas se ralentizan.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (Fix inglés) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Iris Gemma 4 E4B (MLX) | 7.636.276.266 | no disponible | 90% accepted | Apache 2.0 (mod. Gemma 4) | MLX y GGUF |
| Iris Lighter (E2B) | no disponible | no disponible | 86% accepted | Apache 2.0 (mod. Gemma 4) | MLX y GGUF |
| Gemma 4 E4B-it sin entrenar | no disponible | no disponible | 52% accepted | Gemma 4 | Hugging Face |

## Limitaciones y advertencias
- Modelo especializado exclusivamente en corrección y reescritura por tonos; no es adecuado para tareas generales de razonamiento, código o matemáticas.
- Siempre responde en inglés, aunque lea hindi e hinglish; no genera respuestas en hindi.
- El tono Funny obtiene solo un 66% de "would send", con mayor riesgo de resultados no aceptables.
- Los benchmarks son declarados por el autor, evaluados por un modelo de IA y no verificados de forma independiente; diferencias menores a 8 puntos pueden ser ruido.
- No se documentan sesgos conocidos, pero al derivar de Gemma 4 puede heredar sesgos del modelo base.
- Riesgo de alucinación no cuantificado; en corrección, el modelo puede alterar texto si no se respetan las instrucciones de preservar la voz del usuario.
- Licencia Apache 2.0 sobre una versión modificada de Gemma 4; revisar los términos de la licencia de Gemma 4 para uso comercial.
- Los requisitos para Windows no se han confirmado en un PC real ni en equipos de 8 GB, según el autor.

## Enlaces
- Hugging Face: https://huggingface.co/ImAXISOG/iris-gemma-4-e4b-it-mlx
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Versión GGUF: https://huggingface.co/ImAXISOG/iris-gemma-4-e4b-it-gguf
- Versión Lighter (E2B) MLX: https://huggingface.co/ImAXISOG/iris-gemma-4-e2b-it-mlx
- Colección de modelos Iris: https://huggingface.co/collections/ImAXISOG/iris-writing-models-6afd5f1c54a5d9692f56c625
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
