# neuphonic/neutts-2e-q8-gguf

## Resumen

NeuTTS 2E es un modelo de síntesis de voz (text-to-speech) desarrollado por Neuphonic, distribuido en formato GGUF con cuantización Q8. El modelo está diseñado específicamente para generar habla expresiva con control emocional, una capacidad poco común en modelos TTS de su tamaño. Con 236 millones de parámetros, se posiciona como una alternativa ligera y desplegable en hardware modesto, orientada a aplicaciones conversacionales donde el tono emocional importa tanto como la inteligencia del contenido.

La versión aquí descrita (`neutts-2e-q8-gguf`) es una conversión a GGUF cuantizada a 8 bits, lo que reduce el peso del repositorio a aproximadamente 1,1 GB y facilita su ejecución en entornos de inferencia locales mediante herramientas compatibles con GGUF. El modelo está etiquetado como compatible con endpoints y orientado a conversación, lo que sugiere su integración en pipelines de asistentes de voz.

El acceso al modelo está restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargarlo. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales una vez obtenido el acceso. El modelo solo declara soporte para inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 236.039.680 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8 (GGUF); otras cuantizaciones no disponibles |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo con cuantización Q8); pesos originales en safetensors según metadatos de parámetros |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la información proporcionada. Los metadatos indican que se trata de un modelo de text-to-speech con capacidades de emoción y expresividad, etiquetado como `expressive-tts` y `emotional-tts`. El número de parámetros (236 millones) es coherente con arquitecturas TTS ligeras, pero no se especifica si emplea un transformer, un modelo acústico basado en difusión, un vocoder neural o una combinación de componentes.

Tampoco se dispone de datos sobre el volumen de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de ajuste como RLHF o DPO. La presencia de la etiqueta `imatrix` en el repositorio sugiere que la cuantización GGUF se realizó utilizando una matriz de importancia (importance matrix), una técnica habitual para preservar la calidad en cuantizaciones de baja precisión. No se han publicado detalles sobre innovaciones técnicas específicas como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz a partir de texto en inglés.
- Generación de habla expresiva con control emocional (etiquetas `emotion`, `emotions`, `emotional-tts`).
- Orientado a aplicaciones conversacionales (etiqueta `conversational`).
- Compatible con endpoints de inferencia (etiqueta `endpoints_compatible`).
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso ni otras capacidades multimodales.
- No se dispone de información sobre clonación de voz, control de prosodia fino ni otros modos especiales.

## Casos de uso

- Asistentes de voz conversacionales: el modelo puede generar respuestas habladas con matices emocionales, adecuado para interfaces de atención al cliente o asistentes domésticos donde un tono monótono resulta poco natural.
- Audiolibros y narración expresiva: la capacidad de control emocional permite adaptar el tono a distintas escenas o personajes dentro de una narración.
- Contenido para redes y podcasting: generación de locuciones con diferentes registros emocionales para piezas de audio cortas, sin necesidad de un estudio de grabación.
- Sistemas de accesibilidad: lectura en voz alta de textos para personas con discapacidad visual, con un habla más natural y expresiva que los sintetizadores clásicos.
- Prototipado de interfaces de voz: al ser un modelo ligero en GGUF, permite iterar rápidamente en el diseño de experiencias conversacionales antes de pasar a producción.
- Videojuegos y experiencias interactivas: generación de diálogos de personajes no jugadores con variación emocional, ejecutable en hardware local gracias al tamaño reducido del modelo.
- Integración en pipelines de inferencia locales: el formato GGUF y la cuantización Q8 facilitan su despliegue en entornos con recursos limitados mediante herramientas compatibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio GGUF Q8 ocupa aproximadamente 1,1 GB, por lo que la inferencia requiere del orden de 1,5–2 GB de memoria, aunque esta cifra no está confirmada en la información proporcionada.
- GPU recomendadas: no disponible. Por tamaño, es plausible que funcione en GPU de consumo, pero no se confirma en la documentación disponible.
- ¿Cabe en GPU de consumo? No confirmado, pero el tamaño del repositorio (1,1 GB) sugiere que sí en modelos con al menos 4 GB de VRAM.
- Opciones de despliegue: herramientas compatibles con GGUF (llama.cpp y derivados como Ollama, según el formato). No se especifican otros backends en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (TTS expresivo en formato GGUF) con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Solo soporta inglés; no se declara soporte multilingüe.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de la descarga, lo que puede añadir fricción en pipelines automatizados.
- No se dispone de información sobre sesgos conocidos, riesgo de alucinación (en TTS, artefactos o prosodia incorrecta) ni limitaciones de contexto.
- La licencia Apache 2.0 permite uso comercial, pero el acceso gated puede implicar condiciones adicionales que conviene revisar.
- No se dispone de documentación sobre la calidad de la síntesis en distintos dominios, robustez ante texto fuera de distribución ni comportamiento con entradas largas.
- Al ser una cuantización Q8, puede existir una degradación menor de calidad respecto a los pesos originales, aunque no se cuantifica en la información disponible.

## Enlaces

- [Hugging Face: neuphonic/neutts-2e-q8-gguf](https://huggingface.co/neuphonic/neutts-2e-q8-gguf)
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
