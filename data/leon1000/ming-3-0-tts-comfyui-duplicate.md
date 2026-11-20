# Leon1000/Ming-3.0-tts-ComfyUI-Duplicate

## Resumen

Ming-3.0-tts-ComfyUI-Duplicate es un repositorio de pesos derivados del modelo de síntesis de voz Ming 3.0 TTS, desarrollado originalmente por inclusionAI. Este repositorio, publicado por el usuario Leon1000, empaqueta los checkpoints en formatos listos para usar con ComfyUI: los pesos originales fusionados (merged) y variantes cuantizadas a INT8 mediante la técnica ConvRot, tanto para la variante de 0,5B de parámetros como para la variante Tiny de 9B. El modelo base es un sistema text-to-speech multilingüe con capacidades de clonación de voz y diseño de voz.

La relevancia de este repositorio es práctica: facilita el despliegue del TTS de Ming 3.0 dentro de flujos de trabajo de ComfyUI mediante nodos personalizados, con workflows de ejemplo para voz integrada, diseño de voz, clonación con transcripción manual o vía Whisper, control de emoción, dialectos chinos, etiquetas vocales y clonación entre idiomas. Soporta siete idiomas (chino, inglés, alemán, español, francés, coreano y japonés).

El repositorio tiene un tamaño de 34,5 GB y se distribuye bajo licencia MIT. No obstante, la información disponible no detalla la arquitectura interna ni los datos de entrenamiento del modelo original, por lo que varios apartados técnicos se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como mixture-of-experts en los tags del repo) |
| Parámetros totales | 0,5B (variante 0.5B) y 9B (variante Tiny) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 (ConvRot) y pesos originales fusionados en safetensors |
| Idiomas soportados | chino (zh), inglés (en), alemán (de), español (es), francés (fr), coreano (ko), japonés (ja) |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoints para ComfyUI) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo original Ming 3.0 TTS. Los tags del repositorio incluyen "mixture-of-experts" y "speech-generation", lo que sugiere una arquitectura basada en mezcla de expertos orientada a la generación de habla, pero no se proporcionan detalles sobre el número de expertos, el mecanismo de atención, el codificador de texto ni el decodificador de audio. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

Lo que sí documenta este repositorio es el proceso de empaquetado: se ofrecen los pesos originales fusionados y variantes cuantizadas a INT8 mediante ConvRot, una técnica de cuantización que el autor aplica para reducir el tamaño y facilitar la inferencia. El repositorio depende de nodos personalizados de ComfyUI (ComfyUI-Ming-3-tts) para cargar y ejecutar los checkpoints, e incluye workflows de ejemplo que cubren distintos modos de uso del modelo.

## Capacidades

- Generación de voz a partir de texto (text-to-speech) en siete idiomas.
- Clonación de voz, tanto con transcripción manual como con transcripción automática mediante Whisper.
- Diseño de voz (voice design) para definir características vocales.
- Control de atributos básicos: velocidad, tono y volumen.
- Control de emoción en la síntesis.
- Soporte de dialectos chinos.
- Etiquetas vocales (vocal tags) para modular la interpretación.
- Clonación de voz entre idiomas (cross-language voice cloning).
- Generación multi-locutor, con workflow específico de podcast para la variante Tiny 9B.
- Integración con ComfyUI mediante nodos personalizados y workflows de ejemplo.

## Casos de uso

- Doblaje y localización de contenido: el modelo permite sintetizar voz en siete idiomas y clonar una voz existente entre idiomas, lo que facilita adaptar un mismo locutor a versiones en español, inglés, francés u otros idiomas sin regrabar.
- Producción de pódcasts multi-locutor: el workflow "Tiny 9B multi-speaker podcast" permite generar conversaciones con varias voces diferenciadas, útil para prototipos de audio o contenido editorial automatizado.
- Audiolibros y narración: con control de velocidad, tono y emoción, se puede ajustar la interpretación de cada pasaje y mantener una voz consistente a lo largo de capítulos extensos.
- Asistentes de voz y agentes conversacionales: la clonación de voz y el diseño de voz permiten definir una identidad sonora corporativa y generar respuestas habladas dentro de un pipeline de ComfyUI.
- Accesibilidad y lectura de textos: conversión de documentos a audio en varios idiomas, con control de velocidad para adaptarse a distintas necesidades de escucha.
- Prototipado creativo en ComfyUI: los workflows de ejemplo (voz integrada, diseño de voz, emoción, dialectos, etiquetas vocales) permiten a artistas y desarrolladores experimentar rápidamente con variaciones vocales dentro de sus grafos de ComfyUI.
- Generación de voces para vídeo y multimedia: integración de la síntesis en flujos de postproducción donde se necesiten locuciones en varios idiomas con una voz consistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia orientativa por tamaño de pesos, la variante 0,5B en INT8 requiere del orden de 0,5 GB solo para pesos, y la variante 9B en INT8 del orden de 9 GB solo para pesos; a ello hay que sumar el coste del codificador de texto, el decodificador de audio y los buffers de inferencia, que no se detallan en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; la variante 0,5B en INT8 es la candidata más plausible para GPUs de consumo por su reducido tamaño de pesos, pero no se aportan datos de prueba.
- Opciones de despliegue: ComfyUI con los nodos personalizados ComfyUI-Ming-3-tts. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para un modelo TTS de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no está disponible. A modo de contexto cualitativo:

| Modelo | Parámetros | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|
| Ming-3.0-tts-ComfyUI-Duplicate (este repo) | 0,5B y 9B (Tiny) | 7 idiomas | MIT | safetensors, ComfyUI |
| Ming-3.0-tts-0.5b (original, inclusionAI) | 0,5B | no disponible en esta ficha | no disponible en esta ficha | pesos originales |
| Ming-3.0-tts-tiny (original, inclusionAI) | 9B (Tiny) | no disponible en esta ficha | no disponible en esta ficha | pesos originales |

No se han identificado en la información disponible otros modelos TTS comparables con datos verificables de parámetros, contexto o benchmarks.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo; al ser un sistema TTS multilingüe, es previsible que la calidad varíe entre idiomas, pero no hay datos que lo confirmen.
- Riesgo de alucinación en la síntesis: no se aportan métricas de fidelidad ni de inteligibilidad, por lo que la calidad real de la voz generada no está cuantificada.
- La información sobre arquitectura, contexto y entrenamiento es muy escasa; no se puede evaluar el comportamiento del modelo en textos largos ni en dominios especializados.
- La licencia es MIT, lo que en principio permite uso comercial, pero se recomienda verificar las condiciones del modelo base original de inclusionAI, ya que este repositorio es un derivado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su nombre incluye "Duplicate", lo que sugiere que puede ser una réplica de otro repositorio; conviene contrastar con la fuente original (drbaph/Ming-3.0-tts-ComfyUI) antes de usarlo en producción.
- El uso requiere ComfyUI y los nodos personalizados ComfyUI-Ming-3-tts; no es un modelo desplegable directamente con frameworks de inferencia estándar de LLM.
- El tamaño del repositorio (34,5 GB) implica requisitos de almacenamiento considerables.
- La clonación de voz plantea riesgos de suplantación y uso indebido; es responsabilidad del usuario garantizar el consentimiento de las voces clonadas y cumplir la normativa aplicable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Leon1000/Ming-3.0-tts-ComfyUI-Duplicate
- Nodos personalizados de ComfyUI: https://github.com/Saganaki22/ComfyUI-Ming-3-tts
- Instrucciones en inglés: https://github.com/Saganaki22/ComfyUI-Ming-3-tts/blob/main/README.md
- Instrucciones en chino: https://github.com/Saganaki22/ComfyUI-Ming-3-tts/blob/main/README_ZH.md
- Repositorio original de Ming: https://github.com/inclusionAI/Ming-3.0-tts
- Modelo 0.5B original: https://huggingface.co/inclusionAI/Ming-3.0-tts-0.5b
- Modelo Tiny original: https://huggingface.co/inclusionAI/Ming-3.0-tts-tiny
- Checkpoint 0.5B original fusionado: https://huggingface.co/drbaph/Ming-3.0-tts-ComfyUI/resolve/main/checkpoints/Ming-3.0-tts-0.5b/model.safetensors?download=true
- Checkpoint 0.5B INT8 ConvRot: https://huggingface.co/drbaph/Ming-3.0-tts-ComfyUI/resolve/main/checkpoints/Ming-3.0-tts-0.5b-int8-convrot/ming-3-tts-0.5b-int8-convrot.safetensors?download=true
- Checkpoint Tiny 9B original fusionado: https://huggingface.co/drbaph/Ming-3.0-tts-ComfyUI/resolve/main/checkpoints/Ming-3.0-tts-tiny-9b/ming-3-tts-tiny-9b.safetensors?download=true
- Checkpoint Tiny 9B INT8 ConvRot: https://huggingface.co/drbaph/Ming-3.0-tts-ComfyUI/resolve/main/checkpoints/Ming-3.0-tts-tiny-9b-int8-convrot/ming-3-tts-tiny-9b-int8-convrot.safetensors?download=true
