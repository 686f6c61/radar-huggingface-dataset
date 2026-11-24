# kimbs318/supertonic-3

## Resumen

Supertonic 3 es un sistema de síntesis de voz (text-to-speech) de pesos abiertos desarrollado por Supertone, diseñado para inferencia local mediante ONNX Runtime sin necesidad de llamadas a la nube. La versión 3 amplía el soporte de 5 a 31 idiomas respecto a Supertonic 2, mejora la estabilidad de lectura (reduce fallos de repetición y omisión) y aumenta la similitud del hablante en el conjunto de idiomas compartidos. El repositorio ocupa 0,4 GB, lo que lo sitúa en la categoría de modelos compactos aptos para dispositivos de consumo.

El modelo se distribuye a través de la librería `supertonic` y del SDK de Python del mismo nombre, con estilos de voz predefinidos incluidos en el paquete de pesos abiertos. Su propuesta de valor es la latencia baja y la ausencia de dependencia de infraestructura externa, lo que lo hace relevante para aplicaciones de accesibilidad, asistentes locales y pipelines de audio en tiempo real donde la privacidad y el coste por inferencia son críticos.

La ficha se basa exclusivamente en la model card y los metadatos públicos del repositorio de Hugging Face. No se han publicado detalles de arquitectura interna, número de parámetros ni resultados cuantitativos de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (sistema TTS basado en ONNX Runtime; detalles internos no publicados) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 31: en, ko, ja, ar, bg, cs, da, de, el, es, et, fi, fr, hi, hr, hu, id, it, lt, lv, nl, pl, pt, ro, ru, sk, sl, sv, tr, uk, vi |
| Licencia | openrail |
| Formato de pesos | ONNX (inferencia via ONNX Runtime); tamano del repo 0,4 GB |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura interna del modelo en la información disponible. La model card únicamente especifica que la síntesis se ejecuta íntegramente en el dispositivo mediante ONNX Runtime, sin llamadas a la nube, y que el sistema se distribuye como un paquete de pesos abiertos con estilos de voz predefinidos. Se desconoce si se trata de un modelo autorregresivo, de difusión, flow-matching o híbrido, así como el número de parámetros y la composición del dataset de entrenamiento.

Respecto a las mejoras de la versión 3, la documentación menciona tres ejes: la ampliación de 5 a 31 idiomas, una mayor estabilidad de lectura con menos fallos de repetición y omisión en enunciados cortos y largos, y una mayor similitud del hablante en el conjunto de idiomas compartidos con Supertonic 2. También se indica soporte para etiquetas de expresión simples como `<laugh>`, `<breath>` y `<sigh>`. No se detallan técnicas de entrenamiento como RLHF, DPO ni datos de preentrenamiento.

## Capacidades

- Síntesis de voz multilingüe en 31 idiomas, incluyendo español, inglés, coreano, japonés, árabe, hindi y la mayoría de lenguas europeas.
- Inferencia local completa mediante ONNX Runtime, sin dependencia de servicios en la nube.
- Estilos de voz predefinidos incluidos en el paquete de pesos abiertos (por ejemplo, el estilo `M1` referenciado en el ejemplo de uso).
- Soporte de estilos de voz personalizados zero-shot a partir de audio de referencia, mediante la herramienta Supertonic Voice Builder (los estilos comprados incluyen embeddings descargables para Supertonic 2 y 3).
- Etiquetas de expresión para risas, respiraciones y suspiros (`<laugh>`, `<breath>`, `<sigh>`).
- SDK de Python (`pip install supertonic`) con descarga automática de assets desde Hugging Face en la primera ejecución.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso, al tratarse de un modelo TTS y no de un LLM.

## Casos de uso

- Atención al cliente automatizada: el modelo puede generar respuestas habladas en 31 idiomas para sistemas IVR y asistentes telefónicos, con inferencia local que evita enviar transcripciones a terceros. La model card incluye un ejemplo explícito de voz para call center en inglés.
- Audiolibros y narración larga: la mejora de estabilidad de lectura en enunciados largos y la disponibilidad de voces de narrador (los ejemplos de audiolibro en inglés y japonés de la model card) lo hacen adecuado para convertir texto extenso en audio sin fallos de omisión o repetición.
- Doblaje y localización de contenido: al cubrir 31 idiomas con estilos de voz personalizables, permite generar pistas de voz para vídeo o e-learning manteniendo una identidad de voz consistente entre idiomas.
- Asistentes de accesibilidad en dispositivo: lectura de pantalla y conversión de texto a voz en aplicaciones de escritorio o móviles sin conexión, gracias a la ejecución vía ONNX Runtime y al tamaño compacto del paquete (0,4 GB).
- Videojuegos y personajes interactivos: el soporte de etiquetas de expresión (`<laugh>`, `<breath>`, `<sigh>`) y de voces de personaje (ejemplos de personaje en japonés y coreano) permite generar diálogo dinámico en tiempo de ejecución sin servicios externos.
- Generación de noticias y boletines de audio: el ejemplo de estilo noticias en inglés de la model card ilustra el uso para convertir titulares y artículos en audio con una voz consistente y latencia baja.
- Prototipado de voces personalizadas: mediante Supertonic Voice Builder se pueden crear estilos de voz a partir de audio de referencia y desplegarlos localmente con el SDK.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona de forma cualitativa mejoras en estabilidad de lectura y similitud del hablante respecto a Supertonic 2, pero no incluye métricas numéricas (MOS, WER, similitud de hablante, RTF) ni comparaciones cuantitativas con otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada: no disponible. El paquete de pesos ocupa 0,4 GB, por lo que la huella en memoria es reducida, pero no se publica el consumo exacto durante la inferencia.
- GPU recomendadas: no disponible. Al ejecutarse sobre ONNX Runtime, es compatible con aceleración por CPU y por GPU, pero la model card no especifica modelos de GPU concretos.
- Compatibilidad con GPU de consumo: probable por el tamaño del paquete y el enfoque "on-device", aunque no se confirma con datos oficiales.
- Opciones de despliegue: SDK de Python `supertonic` (con `auto_download=True`), ONNX Runtime. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput: no disponibles. La model card describe el sistema como "lightning fast" y orientado a inferencia local, sin cifras de RTF ni de tiempo a primer audio.

## Comparativa con modelos similares

No se dispone de datos cuantitativos de Supertonic 3 (parámetros, benchmarks) ni de comparaciones publicadas en la información proporcionada, por lo que no es posible establecer una comparativa rigurosa con alternativas como Piper, Coqui XTTS o Kokoro. La model card solo compara cualitativamente con Supertonic 2 (5 idiomas frente a 31, mayor estabilidad y similitud de hablante).

| Modelo | Idiomas | Licencia | Formato | Datos comparativos |
|---|---|---|---|---|
| Supertonic 3 | 31 | openrail | ONNX | no disponible |
| Supertonic 2 | 5 | openrail (según repo) | ONNX | mejora cualitativa en estabilidad y similitud |
| Alternativas TTS open source | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se han publicado detalles de arquitectura, parámetros ni datos de entrenamiento, lo que dificulta evaluar sesgos y comportamiento fuera de distribución.
- Riesgo de alucinación acústica: aunque la versión 3 reduce fallos de repetición y omisión, la model card reconoce que estos problemas existían en la versión anterior; conviene validar en textos largos y dominios específicos.
- Cobertura desigual entre idiomas: se desconoce la calidad relativa de cada uno de los 31 idiomas; los ejemplos publicados se centran en inglés, japonés y coreano.
- Voces personalizadas: los estilos zero-shot requieren la herramienta Voice Builder y, según la model card, los estilos comprados incluyen los embeddings; el paquete abierto solo trae voces predefinidas.
- Licencia OpenRAIL: incluye restricciones de uso (cláusulas de uso responsable) que deben revisarse antes de un despliegue comercial; no es una licencia permisiva sin condiciones.
- Sin datos de latencia ni throughput publicados, por lo que el rendimiento en producción debe medirse empíricamente en el hardware objetivo.
- Repositorio con 0 descargas y creado/actualizado el mismo día (2026-11-24): madurez y soporte de la comunidad aún no verificables.

## Enlaces

- Hugging Face: https://huggingface.co/kimbs318/supertonic-3
- Repositorio de referencia del autor: https://huggingface.co/Supertone/supertonic-3
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/Supertone/supertonic-3
- Código en GitHub: https://github.com/supertone-inc/supertonic
- SDK de Python en PyPI: https://pypi.org/project/supertonic/
- Demo de muestras de audio: https://supertonic3.github.io/
- Supertonic Voice Builder: https://supertonic.supertone.ai/voice-builder
