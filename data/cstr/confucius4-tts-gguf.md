# cstr/confucius4-tts-GGUF

## Resumen

Confucius4-TTS es un sistema de síntesis de voz (text-to-speech) multilingüe y zero-shot desarrollado por netease-youdao. A diferencia de los TTS clásicos, este modelo emplea una arquitectura de dos etapas (texto a semántica y semántica a acústica) construida sobre un speech encoder y un gran modelo de lenguaje (LLM), lo que le permite clonar la voz de un hablante a partir de una única grabación corta, sin necesidad de transcripción de referencia ni entrenamiento específico por hablante. El modelo está entrenado en 14 idiomas y admite clonación de voz tanto intra-lingüística como trans-lingüística.

La versión publicada en HuggingFace bajo el identificador `cstr/confucius4-tts-GGUF` es una conversión del modelo original a formato GGUF, lo que facilita su despliegue en entornos optimizados para CPU y GPU mediante herramientas como llama.cpp u Ollama. El repositorio tiene un tamaño de 8.0 GB, lo que sugiere que incluye múltiples cuantizaciones. Los parámetros totales del modelo son 104.257.104 (aproximadamente 104 millones), un tamaño moderado que lo hace accesible para inferencia en hardware de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Dos etapas: text-to-semantic (T2S) y semantic-to-acoustic (S2A), basada en speech encoder + LLM |
| Parámetros totales | 104.257.104 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (formato GGUF, se asume múltiples cuantizaciones Q4_K_M, Q5_K_M, Q8_0, etc.) |
| Idiomas soportados | 14 idiomas (lista no especificada en la información disponible) |
| Licencia | No disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Confucius4-TTS sigue una arquitectura de dos etapas. En la primera etapa, un módulo text-to-semantic (T2S) convierte el texto de entrada en una secuencia de unidades semánticas (tokens discretos) que representan el contenido fonético y prosódico. En la segunda etapa, un módulo semantic-to-acoustic (S2A) transforma esas unidades semánticas en características acústicas (como mel-espectrogramas) que luego se convierten en forma de onda mediante un vocoder. El modelo está entrenado en 14 idiomas y soporta clonación de voz zero-shot, es decir, puede imitar la voz de un hablante con una sola grabación de referencia corta, sin necesidad de transcripción de esa grabación ni ajuste fino por hablante.

El entrenamiento se realiza sobre un corpus multilingüe, aunque los detalles exactos del dataset (número de tokens, composición, técnicas de alineamiento) no están disponibles en la información pública consultada. El modelo se basa en un LLM como componente central de la etapa T2S, lo que le permite capturar dependencias de largo alcance en el texto y generar unidades semánticas coherentes. No se ha especificado si se aplicaron técnicas de RLHF o DPO durante el entrenamiento.

## Capacidades

- Síntesis de voz multilingüe: el modelo genera habla natural en 14 idiomas a partir de texto de entrada.
- Clonación de voz zero-shot: puede replicar la voz de un hablante con una única grabación corta (por ejemplo, 5-10 segundos) sin necesidad de transcripción de la referencia.
- Clonación cross-lingual: la voz clonada se puede usar para sintetizar habla en un idioma diferente al de la grabación de referencia.
- Preservación de identidad del hablante: el modelo mantiene características vocales (timbre, entonación) consistentes con la referencia.
- No requiere entrenamiento por hablante: cada nueva voz se adapta en inferencia, sin ajuste fino.

## Casos de uso

- Asistentes de voz multilingües: permite generar respuestas habladas en 14 idiomas con una voz consistente, ideal para aplicaciones de atención al cliente o asistentes personales globales.
- Audiolibros y narración de contenidos: se puede clonar la voz de un narrador para generar audiolibros de forma automatizada, manteniendo la identidad vocal.
- Doblaje y localización de vídeo: la clonación cross-lingual permite doblar películas o series a otro idioma conservando la voz del actor original.
- Accesibilidad para personas con discapacidad visual: síntesis de voz para lectores de pantalla en múltiples idiomas con voces personalizadas.
- Traducción de voz en tiempo real: combinado con un sistema de traducción automática, puede producir voz en el idioma destino con la voz del hablante original.
- Creación de contenido y podcasts: los creadores pueden generar su propia voz sintetizada para producir episodios sin grabar físicamente, manteniendo su identidad vocal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper arXiv (2608.11650) podría incluir métricas de naturalidad (MOS) y similitud de hablante, pero no están accesibles en los fragmentos consultados. Se recomienda consultar el documento original para obtener datos cuantitativos.

## Requisitos de hardware

- Con 104M parámetros, el modelo en formato GGUF puede ejecutarse en CPU con recursos moderados (8 GB de RAM son suficientes para las cuantizaciones más pequeñas).
- En GPU, cualquier tarjeta con al menos 4 GB de VRAM puede manejar la inferencia en cuantizaciones bajas (Q4_K_M o Q5_K_M). Una RTX 3060 o superior es suficiente para el modelo completo en fp16.
- El tamaño del repositorio (8.0 GB) sugiere que incluye múltiples cuantizaciones; el usuario debe descargar solo el archivo GGUF necesario.
- Despliegue recomendado con llama.cpp, Ollama o herramientas compatibles con GGUF. Para integración en producción, se puede usar vLLM si se convierte a otros formatos, aunque GGUF es el formato nativo.
- La latencia de síntesis depende de la longitud del texto y del hardware; para un modelo de 104M en GPU, se espera una latencia de decenas de milisegundos por frase corta, pero no se dispone de datos concretos.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos TTS como Bark, XTTS v2, o VITS. La información disponible no incluye benchmarks comparativos. Se recomienda consultar el paper para comparaciones con sistemas previos.

## Limitaciones y advertencias

- La información sobre licencia no está disponible; antes de usar el modelo en producción, se debe contactar con los autores para confirmar los términos de uso comercial.
- No se han publicado datos sobre sesgos en las voces generadas. Los modelos TTS pueden perpetuar sesgos de género, acento o dialecto según los datos de entrenamiento.
- La clonación de voz puede generar riesgos de suplantación de identidad; su uso debe cumplir las normativas locales sobre consentimiento y privacidad.
- La lista exacta de los 14 idiomas no está especificada en la información pública; se debe verificar que el idioma objetivo esté cubierto antes de su integración.
- La calidad de la clonación puede degradarse si la grabación de referencia es ruidosa o de baja calidad.

## Enlaces

- HuggingFace: [cstr/confucius4-tts-GGUF](https://huggingface.co/cstr/confucius4-tts-GGUF)
- GitHub del modelo original: [netease-youdao/Confucius4-TTS](https://github.com/netease-youdao/Confucius4-TTS)
- Paper en arXiv: [Confucius4-TTS: Transcript-Free Cross-Lingual Zero-Shot TTS](https://arxiv.org/html/2608.11650v1)
- Demo en HuggingFace Space: [owensong/Confucius4-TTS-Demo](https://huggingface.co/spaces/owensong/Confucius4-TTS-Demo)
