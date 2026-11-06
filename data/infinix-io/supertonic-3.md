# Infinix-io/supertonic-3

## Resumen

Supertonic 3 es un sistema de síntesis de voz (text-to-speech) ligero diseñado para inferencia local mediante ONNX Runtime, sin necesidad de llamadas a la nube durante la síntesis. Lo desarrolla Supertone (el identificador del repositorio en Hugging Face es Infinix-io) y se distribuye como pesos abiertos bajo licencia OpenRAIL. La versión 3 amplía el soporte lingüístico de las 5 lenguas de Supertonic 2 a 31 idiomas, mejora la estabilidad de lectura (menos fallos de repetición y omisión, especialmente en enunciados cortos y largos) y aumenta la similitud de hablante en el conjunto de lenguas compartidas.

El modelo resuelve el problema de la síntesis de voz en dispositivos con recursos limitados: el repositorio ocupa aproximadamente 0,4 GB, lo que permite ejecutarlo en hardware de consumo y en entornos de edge computing. Se integra mediante un SDK de Python (`pip install supertonic`) que descarga automáticamente los activos del modelo desde Hugging Face en la primera ejecución. Incluye estilos de voz predefinidos para inferencia local inmediata y admite etiquetas de expresión simples como `<laugh>`, `<breath>` y `<sigh>`.

La relevancia actual del modelo reside en su combinación de cobertura multilingüe amplia (31 idiomas, incluido el castellano), huella de almacenamiento reducida y ejecución totalmente local, lo que lo hace adecuado para aplicaciones de accesibilidad, asistentes embebidos y pipelines de audio que requieren privacidad o funcionamiento sin conectividad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (sistema TTS basado en ONNX Runtime; detalles de arquitectura no publicados en la información disponible) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no aplica a TTS; la longitud de entrada se rige por la estabilidad de lectura descrita) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | 31: en, ko, ja, ar, bg, cs, da, de, el, es, et, fi, fr, hi, hr, hu, id, it, lt, lv, nl, pl, pt, ro, ru, sk, sl, sv, tr, uk, vi |
| Licencia | OpenRAIL |
| Formato de pesos | ONNX (ejecución con ONNX Runtime); tamaño de repositorio ~0,4 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo (no se especifica si es un transformer, un modelo acústico basado en difusión, un sistema híbrido o una arquitectura neuronal con vocoder integrado). Lo que sí se documenta es que la inferencia se realiza íntegramente con ONNX Runtime en el dispositivo, sin dependencia de servicios en la nube, y que el paquete de pesos abiertos incluye estilos de voz predefinidos fijos.

Respecto al entrenamiento, la model card no publica el número de tokens de audio, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La evolución respecto a Supertonic 2 se describe en términos de resultados: expansión de 5 a 31 lenguas, mayor estabilidad de lectura con menos fallos de repetición y omisión, y mayor similitud de hablante en el conjunto de lenguas compartidas. También se documenta el soporte de etiquetas de expresión (`<laugh>`, `<breath>`, `<sigh>`) y la existencia de estilos de voz personalizados zero-shot generados mediante Supertonic Voice Builder a partir de audio de referencia, con embeddings descargables para Supertonic 2 y Supertonic 3.

## Capacidades

- Síntesis de voz multilingüe en 31 idiomas, incluidos inglés, castellano, coreano, japonés, árabe, hindi y la práctica totalidad de lenguas europeas listadas.
- Ejecución totalmente local con ONNX Runtime, sin llamadas a la nube para la síntesis.
- Estilos de voz predefinidos incluidos en el paquete de pesos abiertos para inferencia inmediata.
- Estilos de voz personalizados zero-shot a partir de audio de referencia, mediante Supertonic Voice Builder (los estilos comprados incluyen embeddings descargables).
- Etiquetas de expresión simples integradas en el texto de entrada: `<laugh>`, `<breath>`, `<sigh>`.
- Mayor estabilidad de lectura que la versión anterior, con reducción de fallos de repetición y omisión en enunciados cortos y largos.
- SDK de Python (`supertonic`) con descarga automática de activos y API de síntesis que devuelve forma de onda y duración.
- Salida de audio en formato WAV mediante el método `save_audio` del SDK.

## Casos de uso

- Atención al cliente automatizada: generación de respuestas habladas en centros de llamadas con voces predefinidas o personalizadas; la model card incluye explícitamente un ejemplo de voz de call center en inglés ("Good morning, thank you for calling. How can I help you today?"), lo que indica que el caso está contemplado por el autor.
- Audiolibros y narración: el modelo se ha probado con textos narrativos en inglés y japonés (ejemplos de audiobook en la model card), con estilos de voz adecuados para lectura prolongada y estabilidad en enunciados largos.
- Doblaje y localización de contenido: la cobertura de 31 idiomas permite generar pistas de voz en múltiples lenguas desde una misma infraestructura local, sin enviar texto a servicios externos.
- Asistentes de voz embebidos y edge computing: al ejecutarse con ONNX Runtime y ocupar ~0,4 GB, puede integrarse en dispositivos con recursos limitados y funcionar sin conectividad.
- Accesibilidad y lectores de pantalla: síntesis local de texto a voz para usuarios con discapacidad visual, con privacidad garantizada al no requerir nube.
- Generación de voces de personaje para videojuegos y animación: los ejemplos de la model card incluyen voces de personaje en japonés y coreano, y el soporte de etiquetas de expresión permite añadir risas, respiraciones y suspiros en diálogos.
- Síntesis de noticias y boletines: la model card incluye un ejemplo de estilo "news" en inglés, adecuado para lectura de titulares y boletines con voz neutra.
- Creación de voces personalizadas: uso de Supertonic Voice Builder para generar embeddings de estilo de voz a partir de audio de referencia y emplearlos en producción local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona "Performance Highlights" y describe el modelo como "compact enough to run locally, while staying competitive", pero no incluye cifras concretas de métricas como MOS, similitud de hablante, WER ni latencia. Tampoco se proporcionan comparaciones numéricas con Supertonic 2 más allá de las afirmaciones cualitativas sobre estabilidad de lectura y similitud de hablante.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ejecutarse con ONNX Runtime y ocupar ~0,4 GB el repositorio, la huella de memoria es reducida, pero no se publican cifras de VRAM ni de RAM.
- GPU recomendadas: no disponible. La información no especifica GPU concretas (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no disponible de forma explícita; el diseño "on-device" y el tamaño reducido del repositorio sugieren viabilidad en hardware de consumo, pero no se documentan requisitos mínimos.
- Opciones de despliegue: SDK de Python `supertonic` (instalación vía `pip install supertonic`), con ejecución sobre ONNX Runtime. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no a TTS).
- Latencia y throughput estimados: no disponible. La model card describe el sistema como "lightning fast" y "lightning fast, on-device, accurate TTS", pero sin cifras de latencia por segundo de audio generado ni de throughput.

## Comparativa con modelos similares

No se dispone de datos numéricos de benchmarks ni de especificaciones de parámetros para establecer una comparación rigurosa con alternativas. La única comparación documentada por el autor es con Supertonic 2, su versión anterior:

| Modelo | Idiomas | Estabilidad de lectura | Similitud de hablante | Licencia | Formato |
|---|---|---|---|---|---|
| Supertonic 3 | 31 | Mejorada (menos repeticiones y omisiones) | Mejorada en lenguas compartidas | OpenRAIL | ONNX |
| Supertonic 2 | 5 | Línea base | Línea base | no disponible en la información | no disponible en la información |

Para alternativas de la misma categoría (otros sistemas TTS ligeros y multilingües) no se proporcionan datos comparables en la información disponible.

## Limitaciones y advertencias

- No se publican detalles de arquitectura, parámetros, datos de entrenamiento ni proceso de alineación, lo que dificulta evaluar sesgos y calidad de forma independiente.
- No hay benchmarks publicados (MOS, similitud de hablante, WER, latencia), por lo que las afirmaciones de rendimiento del autor son cualitativas.
- Riesgo de alucinación acústica: la propia model card reconoce fallos de repetición y omisión en versiones anteriores y afirma haberlos reducido, pero no cuantifica la tasa residual.
- Cobertura idiomática desigual: aunque se listan 31 idiomas, no se documenta la calidad por idioma ni si todos disponen de estilos de voz predefinidos.
- Los estilos de voz personalizados zero-shot requieren Supertonic Voice Builder; los estilos comprados incluyen embeddings descargables, lo que introduce una dependencia de un servicio externo para esa funcionalidad.
- Licencia OpenRAIL: impone restricciones de uso (cláusulas de uso responsable habituales en esta familia de licencias); debe revisarse el texto completo antes de un uso comercial.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- No se documentan requisitos mínimos de hardware ni latencias, lo que complica la planificación de capacidad en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Infinix-io/supertonic-3
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/Supertone/supertonic-3
- Repositorio de código en GitHub: https://github.com/supertone-inc/supertonic
- SDK de Python en PyPI: https://pypi.org/project/supertonic/
- Demo de muestras de audio: https://supertonic3.github.io/
- Supertonic Voice Builder: https://supertonic.supertone.ai/voice-builder
