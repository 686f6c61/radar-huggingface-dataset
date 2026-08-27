# q3146dq4/supertonic-3

## Resumen

Supertonic 3 es un modelo de síntesis de voz (text-to-speech) de código abierto desarrollado por Supertone Inc., diseñado para ejecutarse íntegramente en el dispositivo mediante ONNX Runtime, sin necesidad de conexión a la nube. Con 99 millones de parámetros, es una alternativa ligera y eficiente para aplicaciones de voz en tiempo real, especialmente en entornos móviles o embebidos.

La versión 3 amplía la cobertura de idiomas de 5 a 31, mejora la estabilidad de lectura (reduce repeticiones y saltos en frases cortas y largas) y aumenta la similitud de voz en comparación con su predecesor. También introduce etiquetas de expresión como `<laugh>`, `<breath>` y `<sigh>`, lo que permite un control fino sobre la interpretación. Su relevancia actual radica en ofrecer una alternativa open-weight y local para aplicaciones de accesibilidad, lectura de pantalla, audiolibros y asistentes de voz sin dependencia de infraestructura en la nube.

El repositorio disponible en Hugging Face es un espejo sin modificar del oficial, mantenido para su distribución en una aplicación Android. La licencia es OpenRail, lo que permite uso comercial con ciertas condiciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 99 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ko, ja, ar, bg, cs, da, de, el, es, et, fi, fr, hi, hr, hu, id, it, lt, lv, nl, pl, pt, ro, ru, sk, sl, sv, tr, uk, vi (31 idiomas) |
| Licencia | openrail |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna del modelo (no se especifica si es un transformer, una red convolucional o un modelo híbrido). Se sabe que se distribuye en formato ONNX, lo que permite su ejecución eficiente en CPU y en dispositivos con recursos limitados. El entrenamiento se realizó con datos multilingües que cubren los 31 idiomas soportados, aunque no se han publicado el número de tokens ni la composición exacta del dataset. La innovación principal de la versión 3 reside en la ampliación del soporte lingüístico, la mejora de la estabilidad de lectura y la inclusión de etiquetas de expresión para control de emociones.

No se ha informado sobre el uso de técnicas como RLHF o DPO, ni sobre métodos de decodificación especulativa. El modelo se distribuye como un paquete de pesos ONNX listo para inferencia local.

## Capacidades

- Síntesis de voz multilingüe en 31 idiomas, incluyendo lenguas de Europa, Asia y Oriente Medio.
- Ejecución completamente local mediante ONNX Runtime, sin dependencia de servicios en la nube.
- Etiquetas de expresión: soporta `<laugh>`, `<breath>` y `<sigh>` para matizar la salida.
- Voces predefinidas: incluye estilos de voz fijos (ej. "M1") para uso inmediato.
- Personalización de voz zero-shot: permite crear estilos de voz propios a partir de audio de referencia mediante la herramienta Supertonic Voice Builder, que genera embeddings descargables.
- Generación de audio en formato WAV con duración controlable.
- Compatible con la API de Python y con integración como motor de texto a voz en Android (a través del SDK `supertonic-liteRT-TTS`).

## Casos de uso

- **Accesibilidad y lectores de pantalla en Android**: el modelo se puede integrar como servicio `TextToSpeechService` del sistema, proporcionando lectura de pantalla para personas con discapacidad visual, libros electrónicos y herramientas de accesibilidad, todo en el dispositivo sin conexión.
- **Audiolibros multilingües**: su soporte de 31 idiomas y su estabilidad en frases largas permiten generar narraciones de libros completos con buena prosodia, ideal para plataformas de audiolibros que necesitan producción local o de bajo coste.
- **Asistentes de voz en dispositivos embebidos**: al ejecutarse en CPU, se puede desplegar en routers, altavoces inteligentes o dispositivos IoT para dar respuestas de voz sin depender de servicios externos, reduciendo latencia y garantizando privacidad.
- **Atención al cliente automatizada**: las voces de estilo predefinidas y la posibilidad de personalizar voces a partir de muestras permiten crear sistemas de respuesta interactiva (IVR) con voces naturales y coherentes, como se muestra en la demo de call center en inglés.
- **Doblaje y contenido de personajes**: para videojuegos o animaciones, las etiquetas de expresión y la personalización de voz permiten generar diálogos con matices emocionales, como en el ejemplo de personaje anciano en coreano o el personaje de anime en japonés.
- **Traducción y narración de contenidos**: su amplio soporte de idiomas facilita la generación de versiones habladas de textos traducidos en aplicaciones de aprendizaje de idiomas o plataformas de noticias, sin depender de servicios de TTS en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de evaluación objetiva como MMLU, HumanEval o similares, ya que se trata de un modelo de síntesis de voz y no de lenguaje general. La página web de Supertonic menciona mejoras en estabilidad y similitud de voz respecto a la versión anterior, pero no proporciona métricas cuantitativas.

## Requisitos de hardware

- **VRAM**: no requiere GPU, funciona en CPU. No hay requisitos de VRAM.
- **GPU**: no necesaria; se ejecuta con ONNX Runtime en CPU.
- **Dispositivos compatibles**: puede ejecutarse en ordenadores, portátiles y dispositivos móviles (como Android) con recursos limitados. El repositorio pesa 0.4 GB.
- **Opciones de despliegue**: mediante el SDK de Python (`pip install supertonic`), o como motor de Android TTS (proyecto `supertonic-liteRT-TTS`). No se menciona compatibilidad con vLLM, llama.cpp u otros servidores de inferencia, ya que no es un modelo de lenguaje generativo.
- **Latencia**: no se han publicado cifras de latencia, pero al ser un modelo de 99M y ejecutarse en CPU, se espera una generación rápida, adecuada para aplicaciones en tiempo real.

## Comparativa con modelos similares

No se dispone de información comparativa detallada con otros modelos TTS open-weight como VITS, Coqui TTS o Piper. Supertonic 3 se diferencia por su naturaleza on-device y su soporte multilingüe amplio (31 idiomas) con un tamaño reducido (99M). A diferencia de modelos como VITS (que requiere más recursos) o Coqui TTS (con arquitectura más pesada), Supertonic 3 está optimizado para ejecución local y ofrece un ecosistema con SDK y herramientas de personalización de voz. Sin embargo, no hay datos de benchmarks que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al ser un modelo de síntesis de voz, no genera contenido semántico, pero puede tener sesgos en la pronunciación de nombres o términos en ciertos idiomas. No se han documentado sesgos específicos.
- **Riesgo de alucinación**: no aplica en el sentido de generación de texto, pero puede producir errores de lectura (repeticiones o saltos) en frases complejas, aunque la versión 3 reduce estos fallos.
- **Limitaciones de contexto**: el modelo no tiene contexto de conversación; se trata de síntesis de texto a voz, no de un modelo de diálogo.
- **Licencia**: la licencia openrail permite uso comercial, pero se recomienda revisar los términos específicos de la licencia de Supertone para cada caso de uso.
- **Restricciones de idioma**: aunque soporta 31 idiomas, la calidad puede variar según el par de idioma y la disponibilidad de voces de referencia.
- **Personalización de voz**: la herramienta Voice Builder para crear estilos de voz personalizados es un servicio de pago de Supertone; las voces compradas incluyen embeddings descargables para uso local.

## Enlaces

- Repositorio original en Hugging Face: [Supertone/supertonic-3](https://huggingface.co/Supertone/supertonic-3)
- Repositorio espejo (usado en esta ficha): [q3146dq4/supertonic-3](https://huggingface.co/q3146dq4/supertonic-3)
- Demo en Hugging Face Spaces: [Supertone/supertonic-3 demo](https://huggingface.co/spaces/Supertone/supertonic-3)
- Sitio de demostración de audio: [supertonic3.github.io](https://supertonic3.github.io/)
- Código en GitHub: [supertone-inc/supertonic](https://github.com/supertone-inc/supertonic)
- SDK Python en PyPI: [supertonic](https://pypi.org/project/supertonic/)
- Proyecto de integración Android (espejo): [q3146dq4/supertonic-liteRT-TTS](https://github.com/q3146dq4/supertonic-liteRT-TTS/tree/main/)
- Anuncio oficial de Supertone: [Faster and more accurate across 31 languages — introducing Supertonic 3](https://www.supertone.ai/en/work/faster-and-more-accurate-across-31-languages----introducing-supertonic-3)
