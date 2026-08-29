# qwrt/Melodimodell-16M

## Resumen

Melodimodell-16M es un modelo de lenguaje pequeño (16,5 millones de parámetros) desarrollado por qwrt (tom brendelokken) y publicado en Hugging Face bajo licencia Apache-2.0. Está basado en la arquitectura Qwen3 y ha sido entrenado específicamente para generar melodías en formato MIDI representadas como texto plano. El modelo convierte eventos musicales (notas, duraciones, tiempos) en una secuencia de caracteres UTF-8, donde cada canción se separa por un asterisco (`*`). Esta representación textual permite utilizar el modelo como un generador de secuencias de texto estándar, sin necesidad de arquitecturas especializadas para audio.

El modelo resuelve el problema de generar melodías de forma automática a partir de un prompt textual, ofreciendo una vía ligera y reproducible para experimentar con generación musical basada en transformers. Su relevancia actual radica en que demuestra cómo modelos muy pequeños pueden aprender patrones musicales básicos con un dataset especializado, aunque el propio autor advierte que, debido a su tamaño, no está diseñado para producir música coherente a gran escala. El contexto de entrenamiento es de 4096 tokens, lo que limita la longitud de las composiciones generadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer causal) |
| Parametros totales | 16.555.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no disponible (el tokenizador es UTF-8, no hay idiomas declarados) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Qwen3, un transformer causal estándar con atención completa, adaptado para procesar secuencias de texto UTF-8. No se trata de un modelo MoE ni híbrido; es una red densa de 16,5 millones de parámetros. El entrenamiento se realizó sobre el dataset `projectlosangeles/Monster-MIDI-Dataset`, que contiene melodías MIDI convertidas a un formato de texto propio. Cada canción se representa como una secuencia de caracteres donde las notas y sus propiedades se codifican en texto, y las canciones se separan con el carácter `*`. El tokenizador es simplemente la codificación UTF-8 de los caracteres, sin subword tokenization ni vocabulario aprendido. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; el entrenamiento es de modelado de lenguaje autorregresivo estándar. La innovación principal reside en la representación textual del MIDI, que permite aprovechar modelos de lenguaje genéricos para tareas musicales sin modificaciones arquitectónicas.

## Capacidades

- Generación de melodías: el modelo puede generar secuencias de texto que representan melodías MIDI, comenzando desde un prompt vacío (`*`) o continuando una melodía existente.
- Continuación de melodías: acepta un prompt con los primeros caracteres de una melodía (hasta 200 caracteres en el ejemplo del autor) y genera el resto.
- Representación textual: la salida se puede convertir a un archivo MIDI real mediante los scripts proporcionados en el dataset `qwrt/Monster_textmidis_filtered`.
- Limitación de contexto: funciona correctamente hasta 4096 tokens; más allá de esa longitud, la calidad de las predicciones se degrada rápidamente.
- No dispone de tool calling, ni capacidades multimodales (visión, audio), ni razonamiento complejo. Es exclusivamente un generador de secuencias de texto musical.

## Casos de uso

- Generación de ideas melódicas para compositores: un músico puede usar el modelo para obtener variaciones o fragmentos melódicos aleatorios, exportarlos a MIDI y luego editarlos en su DAW. El tamaño reducido permite ejecutarlo en cualquier portátil sin GPU.
- Prototipado rápido de sistemas de generación musical: investigadores o desarrolladores pueden integrar este modelo como baseline en pipelines de generación de música, comparando su salida con modelos más grandes.
- Educación musical: en entornos docentes, el modelo puede servir para ilustrar cómo los transformers aprenden patrones secuenciales, mostrando ejemplos de melodías generadas y analizando sus limitaciones.
- Generación de acompañamientos simples: aunque no produce música coherente, puede generar líneas melódicas básicas que sirvan como base para arreglos posteriores.
- Experimentación con representaciones textuales de audio: el modelo es un caso de estudio para entender cómo convertir datos musicales en texto y aplicar modelos de lenguaje estándar.
- Automatización de tareas creativas en juegos o aplicaciones: se puede usar para generar melodías procedurales en tiempo real, siempre que se acepte la baja calidad y se apliquen filtros posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas como MMLU, HumanEval o métricas específicas de música (p. ej., exactitud de notas, coherencia armónica). Tampoco se comparan con otros modelos de generación musical.

## Requisitos de hardware

- VRAM estimada: al tener solo 16,5 millones de parámetros, el modelo ocupa aproximadamente 66 MB en FP32 (16,5 M × 4 bytes). Con cuantización a 8 bits, podría reducirse a ~33 MB, aunque no se ofrecen versiones cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; incluso se puede ejecutar en CPU sin problemas. Una RTX 3060 o superior es más que suficiente.
- Compatibilidad con consumer GPU: sí, absolutamente. Cabe en cualquier GPU moderna, incluso en integradas.
- Opciones de despliegue: se puede usar con la librería `transformers` de Hugging Face, como se muestra en el ejemplo del autor. También es compatible con vLLM, llama.cpp u Ollama, aunque al ser un modelo tan pequeño, el rendimiento no es un problema.
- Latencia y throughput: en una GPU moderna, la generación de 4096 tokens debería completarse en menos de un segundo. En CPU, puede tardar unos pocos segundos. No hay datos oficiales de throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma categoría (generación de melodías MIDI con arquitectura Qwen3 y tamaño similar). Existen otros modelos de generación musical como MusicGen (Meta) o MuseNet (OpenAI), pero son mucho más grandes y no utilizan representación textual. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo no está diseñado para generar música coherente; el propio autor lo advierte explícitamente. Las melodías generadas pueden carecer de estructura armónica o rítmica.
- La longitud de contexto está limitada a 4096 tokens; si se supera, la calidad de las predicciones se degrada rápidamente.
- El tokenizador UTF-8 no es un tokenizador de subpalabras, lo que puede limitar la eficiencia en secuencias largas y la generalización.
- No se han documentado sesgos específicos, pero al entrenarse en un dataset de MIDI concreto, puede reflejar los estilos musicales presentes en ese dataset.
- La licencia Apache-2.0 permite uso comercial, pero no hay garantías sobre la calidad o idoneidad para producción.
- No se proporcionan scripts de conversión MIDI a texto en el propio repositorio del modelo; dependen del dataset `qwrt/Monster_textmidis_filtered`, que debe descargarse por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qwrt/Melodimodell-16M
- Dataset de entrenamiento: https://huggingface.co/datasets/projectlosangeles/Monster-MIDI-Dataset
- Dataset con scripts de conversión: https://huggingface.co/datasets/qwrt/Monster_textmidis_filtered
- Perfil del autor: https://huggingface.co/qwrt
