# runanywhere/ra-models

## Resumen

`runanywhere/ra-models` es un repositorio de Hugging Face mantenido por la organización RunAnywhere que agrupa varios modelos de voz, visión y detección de actividad de voz, empaquetados para su uso con sherpa-onnx. No se trata de un modelo único, sino de un conjunto de assets que las aplicaciones de ejemplo de RunAnywhere descargan desde una única ubicación, con el mismo host, autenticación y comportamiento de reanudación que el resto del catálogo. El repositorio incluye copias byte a byte de releases upstream de Whisper (tiny, base y small), voces Piper VITS (Alba, Amy, Lessac, Ryan) y Supertonic 3 int8, Silero VAD y SmolVLM 500M instruct. Todo el contenido se distribuye bajo licencia Apache-2.0, aunque los proyectos originales tienen sus propias licencias (MIT para Whisper, Piper y Silero VAD; Apache-2.0 para SmolVLM y sherpa-onnx).

La relevancia de este repositorio radica en que centraliza la distribución de modelos de código abierto para aplicaciones de voz y visión, facilitando la integración en entornos móviles y de escritorio mediante sherpa-onnx. Al ser una recopilación, no aporta innovación técnica propia, pero sí simplifica el despliegue de capacidades de transcripción, síntesis de voz, detección de actividad vocal y comprensión visual en aplicaciones que requieren inferencia local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multiples: Whisper (encoder-decoder transformer), Piper (VITS), Silero VAD (red neuronal recurrente), SmolVLM (vision-language transformer) |
| Parametros totales | No disponible (repositorio con varios modelos; Whisper tiny ~39M, base ~74M, small ~244M, SmolVLM 500M, pero no se especifican en la model card) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende de cada modelo; Whisper usa ventanas de 30 s, SmolVLM tiene contexto limitado, pero no se indica) |
| Tipos de cuantizacion | No disponible (se menciona Supertonic 3 int8, pero no se detallan cuantizaciones para el resto) |
| Idiomas soportados | No disponible (los metadatos indican "no disponibles"; Whisper soporta multiples idiomas, Piper voces en ingles, pero no se especifica) |
| Licencia | Apache-2.0 (para el repositorio; los modelos individuales tienen licencias MIT o Apache-2.0 segun el upstream) |
| Formato de pesos | No disponible (archivos comprimidos .tar.gz y .tar.bz2, empaquetados para sherpa-onnx, que usa ONNX) |

## Arquitectura y entrenamiento

Este repositorio no contiene modelos entrenados por RunAnywhere. Segun la model card, cada archivo es una copia byte a byte de un release upstream, sin modificaciones ni entrenamiento adicional. Los modelos incluidos son:

- **Whisper** (OpenAI): arquitectura encoder-decoder transformer, entrenado sobre 680 000 horas de audio multilingue. Se incluyen las variantes tiny, base y small, empaquetadas para sherpa-onnx.
- **Piper** (Rhasspy): sintetizador de voz basado en VITS, con voces Alba, Amy, Lessac y Ryan, ademas de Supertonic 3 int8.
- **Silero VAD** (snakers4): detector de actividad de voz, modelo ligero basado en redes recurrentes, exportado a ONNX.
- **SmolVLM 500M instruct** (Hugging Face): modelo de vision-lenguaje compacto, con 500 millones de parametros, disenado para inferencia eficiente.

No se proporcionan detalles sobre el entrenamiento de estos modelos en la informacion disponible, ya que cada uno tiene su propio proceso de entrenamiento documentado en sus repositorios originales.

## Capacidades

- **Transcripcion de voz a texto (STT)**: Whisper tiny, base y small permiten convertir audio a texto con soporte multilingue, aunque el alcance exacto de idiomas no se especifica en este repositorio.
- **Sintesis de voz (TTS)**: Piper VITS genera voz natural a partir de texto, con varias voces disponibles (Alba, Amy, Lessac, Ryan) y una variante int8 (Supertonic 3) para entornos con recursos limitados.
- **Deteccion de actividad de voz (VAD)**: Silero VAD detecta presencia de voz en audio, util para preprocesar senales antes de STT o para activar sistemas por voz.
- **Comprension visual (VLM)**: SmolVLM 500M instruct puede procesar imagenes y responder preguntas sobre ellas, ademas de realizar tareas de razonamiento visual basico.
- **Integracion con sherpa-onnx**: todos los modelos estan empaquetados para funcionar con sherpa-onnx, lo que permite su uso en aplicaciones moviles, de escritorio y embebidas sin dependencias pesadas.
- **No se incluyen capacidades de tool calling, agentes ni razonamiento multi-paso** en la informacion proporcionada.

## Casos de uso

- **Asistentes de voz locales**: combinar Whisper (STT), Piper (TTS) y Silero VAD (deteccion de actividad) para construir un asistente de voz que funcione sin conexion, con activacion por palabra clave y respuesta hablada.
- **Transcripcion de reuniones y entrevistas**: usar Whisper small para transcribir grabaciones de audio con buena precision, aprovechando su soporte multilingue (aunque no se detalla en este repositorio).
- **Audiolibros y narracion automatizada**: emplear Piper VITS con la voz Lessac o Ryan para generar narraciones de texto, ideal para aplicaciones de lectura o contenido accesible.
- **Sistemas de moderacion de contenido**: Silero VAD puede detectar segmentos de voz en videos o llamadas, permitiendo filtrar o etiquetar contenido automaticamente.
- **Aplicaciones de vision para accesibilidad**: SmolVLM 500M instruct puede describir imagenes o responder preguntas sobre ellas, util en asistentes para personas con discapacidad visual.
- **Prototipado rapido de aplicaciones de IA**: al tener todos los modelos en un solo repositorio, los desarrolladores pueden descargar e integrar rapidamente capacidades de voz y vision en sus aplicaciones de ejemplo, sin buscar en multiples fuentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de rendimiento para ninguno de los modelos. Para datos de precision, se debe consultar la documentacion de cada modelo upstream (Whisper, Piper, Silero VAD, SmolVLM).

## Requisitos de hardware

- No se proporcionan requisitos especificos de hardware en la informacion disponible.
- Dado que los modelos son de tamano pequeno a mediano (Whisper tiny/base/small, Piper VITS, Silero VAD, SmolVLM 500M), es razonable esperar que puedan ejecutarse en CPU, aunque no se confirma.
- Para inferencia en tiempo real, se recomienda una GPU con al menos 4 GB de VRAM para SmolVLM 500M, pero esto es una estimacion general no respaldada por datos del repositorio.
- Las opciones de despliegue incluyen sherpa-onnx, que soporta ejecucion en CPU, GPU y dispositivos moviles, pero no se detallan en la model card.

## Comparativa con modelos similares

No disponible. Al ser un repositorio que agrupa multiples modelos de diferentes categorias, no existe una comparativa directa con otros modelos unicos. Para comparaciones, se deben evaluar los modelos individuales (Whisper vs. otras STT, Piper vs. otras TTS, etc.) con sus respectivas alternativas.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: no se documentan en este repositorio, pero los modelos Whisper y SmolVLM pueden presentar sesgos de los datos de entrenamiento y generar alucinaciones en tareas de transcripcion o descripcion visual.
- **Idiomas**: no se especifican los idiomas soportados; Whisper soporta multiples idiomas, pero las voces Piper incluidas son principalmente en ingles (Alba, Amy, Lessac, Ryan), lo que limita su uso en otros idiomas.
- **Licencias**: aunque el repositorio es Apache-2.0, los modelos individuales tienen licencias MIT (Whisper, Piper, Silero VAD) y Apache-2.0 (SmolVLM). Es necesario respetar las licencias de cada componente para uso comercial.
- **Formato de archivos**: los archivos estan comprimidos en .tar.gz y .tar.bz2; las aplicaciones deben manejar ambos formatos segun la plataforma (escritorio vs. movil).
- **Sin mantenimiento propio**: RunAnywhere no entrena ni modifica los modelos; cualquier actualizacion o correccion depende de los proyectos upstream.
- **Tamano del repositorio**: 2.1 GB, lo que puede ser considerable para descargas en dispositivos con ancho de banda limitado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/runanywhere/ra-models
- sherpa-onnx (k2-fsa): https://github.com/k2-fsa/sherpa-onnx
- Silero VAD (snakers4): https://github.com/snakers4/silero-vad
- Whisper (OpenAI): https://github.com/openai/whisper
- Piper (Rhasspy): https://github.com/rhasspy/piper
- SmolVLM (Hugging Face): https://huggingface.co/HuggingFaceTB
