# lookbe/pocket-tts-6l

## Resumen

Pocket TTS 6l es una copia del modelo de síntesis de voz (TTS) Pocket TTS desarrollado originalmente por Kyutai, publicada por el usuario lookbe en Hugging Face. Se trata de un derivado (finetune) del modelo base kyutai/pocket-tts que conserva únicamente la variante de 6 capas, presumiblemente con el objetivo de ofrecer una versión más ligera y manejable del sistema original. El repositorio ocupa 4,7 GB y los pesos se distribuyen en formato safetensors.

El modelo resuelve el problema de la conversión de texto a voz en entornos donde se prioriza la eficiencia sobre la calidad máxima, al reducir la profundidad de la red a 6 capas. Es relevante para desarrolladores que necesitan integrar síntesis de voz en aplicaciones con recursos limitados y que quieren partir de una base conocida como Pocket TTS, manteniendo la licencia permisiva CC BY 4.0.

La información pública disponible es muy escasa: no se especifican parámetros totales, longitud de contexto, idiomas soportados ni resultados de benchmarks. La model card se limita a indicar la licencia, el modelo base y una lista de usos prohibidos, por lo que muchos datos técnicos deben marcarse como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de síntesis de voz basado en kyutai/pocket-tts, variante de 6 capas) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | CC BY 4.0 (heredada de kyutai/pocket-tts) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna más allá de que se trata de una variante de 6 capas del modelo Pocket TTS de Kyutai, orientada a síntesis de voz. El nombre "6l" sugiere una reducción de profundidad respecto al modelo original, pero no se especifica el número de parámetros, la dimensión de los embeddings, el mecanismo de atención ni el tipo de decodificador de audio empleado.

Tampoco se documentan los datos de entrenamiento: no se indica el número de tokens, la composición del corpus, ni si hubo etapas de ajuste fino supervisado, RLHF o DPO. Al ser un finetune del modelo base, se desconoce qué datos adicionales se utilizaron y con qué objetivo se realizó el ajuste. No se han publicado innovaciones técnicas destacables en la información disponible.

## Capacidades

- Síntesis de voz a partir de texto (text-to-speech), heredada del modelo base kyutai/pocket-tts.
- Generación de audio hablado; no se detallan capacidades de clonación de voz ni de control de estilo.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- No se documentan modos especiales (thinking mode, visión, audio de entrada, etc.).

## Casos de uso

- Lectura de artículos y documentos: el modelo puede convertir texto plano en audio para aplicaciones de accesibilidad o consumo de contenido, aprovechando su naturaleza TTS ligera.
- Asistentes de voz en dispositivos con recursos limitados: al ser una variante de 6 capas, resulta adecuado para entornos donde el presupuesto de cómputo es reducido.
- Generación de avisos y notificaciones habladas: integrable en sistemas de automatización del hogar o de atención telefónica básica.
- Prototipado de interfaces conversacionales: útil para desarrolladores que quieren experimentar con TTS sin depender de servicios en la nube.
- Doctores y narración de contenidos educativos: permite generar material audio para cursos o tutoriales a partir de apuntes.
- Pruebas de integración en pipelines de audio: sirve como componente de síntesis en sistemas más amplios de procesamiento de voz, siempre que se respeten las restricciones de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 4,7 GB en safetensors, lo que da una referencia del orden de magnitud del almacenamiento de pesos.
- GPU recomendadas: no disponibles; por el tamaño del repositorio, es probable que quepa en GPU de consumo, pero no se confirma.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: no se documentan (no se indica soporte para vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| lookbe/pocket-tts-6l | no disponible | no disponible | CC BY 4.0 | Hugging Face |
| kyutai/pocket-tts | no disponible | no disponible | CC BY 4.0 | Hugging Face (modelo base) |
| Alternativas TTS de código abierto | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar rendimiento con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un modelo de voz, puede heredar sesgos de los datos de entrenamiento del modelo base.
- Riesgo de alucinación: no aplica de forma directa a TTS, pero puede producir pronunciaciones incorrectas o artefactos de audio.
- Limitaciones de contexto o idioma: no disponibles; se desconoce qué idiomas soporta y la longitud máxima de texto de entrada.
- Restricciones de licencia: CC BY 4.0 permite uso comercial con atribución, pero la model card prohíbe explícitamente la suplantación de voz sin consentimiento, la desinformación y la generación de contenido ilegal o dañino.
- Caveat para producción: la información técnica es muy escasa; no se recomienda su uso en producción sin una evaluación previa de calidad, latencia y estabilidad.
- El modelo es una copia no oficial publicada por un tercero; no hay garantías de mantenimiento ni soporte.

## Enlaces

- [lookbe/pocket-tts-6l en Hugging Face](https://huggingface.co/lookbe/pocket-tts-6l)
- [kyutai/pocket-tts (modelo base)](https://huggingface.co/kyutai/pocket-tts)
- [Kyutai](https://kyutai.org/)
