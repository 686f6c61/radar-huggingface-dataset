# JayGBroMan/supertonic-3

## Resumen

Supertonic 3 es un sistema de síntesis de voz (text-to-speech) de pesos abiertos desarrollado por Supertone, diseñado específicamente para inferencia local mediante ONNX Runtime sin necesidad de llamadas a la nube. Esta tercera iteración amplía la cobertura lingüística de las 5 lenguas de Supertonic 2 hasta 31 idiomas, mejora la estabilidad de lectura reduciendo fallos de repetición y omisión, e incrementa la similitud del hablante respecto a la versión anterior. El repositorio ocupa 0,4 GB y se distribuye bajo licencia OpenRAIL.

El modelo se enmarca en la categoría de TTS ligero para dispositivos locales ("on-device"), lo que lo posiciona frente a soluciones comerciales en la nube para casos donde la privacidad, la latencia o la ausencia de conectividad son requisitos. Incluye estilos de voz predefinidos para inferencia inmediata y soporte para etiquetas de expresión simples como `<laugh>`, `<breath>` y `<sigh>`.

La relevancia actual del modelo radica en su combinación de cobertura multilingüe amplia (31 idiomas, incluido el español), empaquetado ONNX compacto y SDK de Python que descarga automáticamente los activos desde Hugging Face. No obstante, la información pública disponible no detalla la arquitectura interna, el número de parámetros ni los datos de entrenamiento, por lo que varias especificaciones técnicas deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se ejecuta mediante ONNX Runtime; arquitectura interna no documentada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo TTS; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en formato ONNX; no se detallan variantes de cuantización) |
| Idiomas soportados | 31: en, ko, ja, ar, bg, cs, da, de, el, es, et, fi, fr, hi, hr, hu, id, it, lt, lv, nl, pl, pt, ro, ru, sk, sl, sv, tr, uk, vi |
| Licencia | openrail |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La información disponible no especifica la arquitectura interna del modelo (transformer, difusión, híbrida u otra). Lo que sí se documenta es el modo de ejecución: inferencia completamente local mediante ONNX Runtime, empaquetada en un repositorio de 0,4 GB, lo que sugiere un modelo compacto orientado a dispositivos de consumo. El SDK de Python (`supertonic`) gestiona la descarga automática de los activos y expone una API de síntesis con selección de estilo de voz y código de idioma.

Respecto al entrenamiento, no se han publicado detalles sobre número de tokens, composición del dataset ni uso de técnicas como RLHF o DPO. La model card menciona mejoras cualitativas respecto a Supertonic 2: mayor estabilidad de lectura (menos fallos de repetición y omisión en enunciados cortos y largos) y mayor similitud del hablante en el conjunto de idiomas compartidos. También se documenta soporte para estilos de voz personalizados creados a partir de audio de referencia mediante la herramienta Supertonic Voice Builder, cuyos estilos comprados incluyen embeddings descargables para Supertonic 2 y 3.

## Capacidades

- Síntesis de voz multilingüe en 31 idiomas, incluidos español, inglés, coreano, japonés, árabe, hindi y la mayoría de lenguas europeas.
- Inferencia local completa mediante ONNX Runtime, sin llamadas a la nube para la síntesis.
- Estilos de voz predefinidos incluidos en el paquete de pesos abiertos (por ejemplo, el estilo `M1` usado en el ejemplo del SDK).
- Soporte de estilos de voz personalizados zero-shot a partir de audio de referencia, mediante Supertonic Voice Builder.
- Etiquetas de expresión simples en el texto de entrada: `<laugh>`, `<breath>`, `<sigh>`.
- Mejora de estabilidad de lectura: reducción de fallos de repetición y omisión en enunciados cortos y largos.
- API de Python con salida de audio en formato WAV y duración calculada.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada; es un modelo exclusivamente de texto a voz.

## Casos de uso

- Asistentes de voz para atención al cliente: el modelo puede sintetizar respuestas multi-turno en el idioma del usuario (incluido español) ejecutándose en el propio servidor o dispositivo, lo que evita enviar texto del cliente a servicios de TTS externos y reduce la latencia de respuesta.
- Lectura de documentos y artículos en aplicaciones de accesibilidad: al ejecutarse localmente con ONNX Runtime y ocupar 0,4 GB, puede integrarse en lectores de pantalla o aplicaciones de escritorio que necesitan síntesis sin conexión.
- Audiolibros y narración de contenido largo: la mejora en estabilidad de lectura reduce repeticiones y omisiones en enunciados largos, un fallo crítico en narración de párrafos extensos.
- Localización de productos de software: con 31 idiomas, un mismo pipeline puede generar voces para interfaces, tutoriales y avisos en múltiples mercados sin depender de varios proveedores de TTS.
- Sistemas embebidos y edge computing: el tamaño compacto del repositorio y la ejecución mediante ONNX Runtime permiten desplegar síntesis de voz en dispositivos con recursos limitados donde no cabe un modelo TTS de gran tamaño.
- Generación de voces de personaje en videojuegos o contenido interactivo: los estilos personalizados zero-shot y las etiquetas de expresión (`<laugh>`, `<breath>`, `<sigh>`) permiten dar matices a diálogos de personajes sin grabar a un actor para cada línea.
- Privacidad en entornos sanitarios o legales: la síntesis local evita que textos sensibles salgan del dispositivo o de la red interna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card menciona únicamente mejoras cualitativas respecto a Supertonic 2 (mayor estabilidad de lectura y mayor similitud del hablante), sin cifras concretas de métricas como MOS, WER ni comparaciones numéricas con otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio completo ocupa 0,4 GB, por lo que la huella de memoria debería ser del orden de cientos de MB, aunque no se documenta el consumo exacto en ejecución.
- GPU recomendadas: no disponible. Al ejecutarse mediante ONNX Runtime, puede usar CPU o GPU según la configuración del runtime, pero no se especifican modelos de GPU concretos.
- Compatibilidad con GPU de consumo: probable dada la compacidad del paquete (0,4 GB), pero no confirmada en la documentación disponible.
- Opciones de despliegue: SDK de Python `supertonic` (instalable con `pip install supertonic`), con descarga automática de activos (`TTS(auto_download=True)`); ejecución sobre ONNX Runtime. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo TTS.
- Latencia y throughput: no disponibles. La model card describe el sistema como "lightning fast" y orientado a inferencia on-device, pero sin cifras de latencia ni de tiempo real factor (RTF).

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Supertonic 3 | no disponible | 31 | no aplica (TTS) | openrail | ONNX | Inferencia local, SDK Python, estilos de voz predefinidos y zero-shot |
| Supertonic 2 | no disponible | 5 | no aplica (TTS) | openrail | ONNX | Versión anterior; menor cobertura lingüística y menor estabilidad de lectura según el autor |
| Alternativas de TTS open source (p. ej. Coqui TTS, Piper, Kokoro) | no disponible en esta ficha | variable | no aplica (TTS) | variable | variable | No se dispone de datos comparativos verificados en la información proporcionada |

No se dispone de datos numéricos de rendimiento que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo; al ser un sistema TTS, los riesgos incluyen sesgos de acento, prosodia y calidad desigual entre los 31 idiomas, pero no se cuantifican.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto), pero sí pueden producirse errores de pronunciación, repeticiones u omisiones; el autor afirma haberlos reducido respecto a Supertonic 2, sin cifras.
- La calidad puede variar entre idiomas; la model card no desglosa el rendimiento por lengua, por lo que no se puede confirmar la paridad entre los 31 idiomas.
- Licencia OpenRAIL: permite uso comercial con restricciones de uso responsable; conviene revisar los términos completos antes de desplegar en producción.
- El uso de estilos de voz personalizados zero-shot plantea riesgos de suplantación de identidad y requiere consentimiento explícito del hablante de referencia.
- No se documentan requisitos de atribución ni limitaciones específicas de despliegue comercial más allá de la licencia OpenRAIL.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-24); se trata de una publicación reciente sin validación comunitaria todavía.
- La ausencia de datos sobre arquitectura, parámetros y entrenamiento dificulta la evaluación técnica independiente y la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/JayGBroMan/supertonic-3
- Modelo original en Hugging Face (Supertone): https://huggingface.co/Supertone/supertonic-3
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/Supertone/supertonic-3
- Repositorio GitHub: https://github.com/supertone-inc/supertonic
- SDK de Python en PyPI: https://pypi.org/project/supertonic/
- Demo de muestras de audio: https://supertonic3.github.io/
- Supertonic Voice Builder: https://supertonic.supertone.ai/voice-builder
