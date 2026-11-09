# popsi2/supertonic-3

## Resumen

Supertonic 3 es un sistema de síntesis de voz (text-to-speech) de pesos abiertos desarrollado por Supertone, diseñado para inferencia local sin dependencia de la nube. Se distribuye en formato ONNX y se ejecuta íntegramente mediante ONNX Runtime en el dispositivo del usuario, lo que lo sitúa en la categoría de modelos TTS orientados a despliegue en el borde (on-device). La versión 3 amplía la cobertura lingüística de las 5 lenguas de Supertonic 2 hasta 31 idiomas, incluyendo castellano, catalán no confirmado, inglés, coreano, japonés, árabe, hindi y la práctica totalidad de lenguas europeas.

El modelo resuelve el problema de la síntesis de voz multilingüe con baja latencia y sin llamadas a servicios externos, un requisito habitual en aplicaciones de accesibilidad, asistentes embebidos y sistemas con restricciones de privacidad. Frente a Supertonic 2, la model card declara mejoras en estabilidad de lectura (menos fallos de repetición y omisión, especialmente en enunciados cortos y largos) y mayor similitud de hablante en el conjunto de lenguas compartidas.

La información pública disponible no detalla la arquitectura interna, el número de parámetros ni la longitud de contexto, por lo que esos campos se marcan como no disponibles. El repositorio ocupa 0,4 GB, lo que es coherente con un modelo compacto pensado para ejecución local. La licencia es OpenRAIL y el paquete incluye estilos de voz predefinidos, además de soporte para estilos personalizados mediante JSON de embeddings generados con la herramienta Voice Builder.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS en formato ONNX; no se especifica el tipo de red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se detallan variantes cuantizadas) |
| Idiomas soportados | 31: en, ko, ja, ar, bg, cs, da, de, el, es, et, fi, fr, hi, hr, hu, id, it, lt, lv, nl, pl, pt, ro, ru, sk, sl, sv, tr, uk, vi |
| Licencia | openrail |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,4 GB |
| Runtime | ONNX Runtime |
| SDK | `supertonic` (Python, PyPI) |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo: no se especifica si se trata de un transformer, un modelo acústico basado en difusión, un sistema de dos etapas (acústico + vocoder) ni el tipo de representación intermedia. Tampoco se detallan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineamiento como RLHF o DPO (poco habituales en TTS, pero no descartables en el ajuste de prosodia). Lo que sí se declara explícitamente es el formato de despliegue: pesos ONNX ejecutados con ONNX Runtime, lo que implica que el modelo está optimizado para inferencia local y portable entre plataformas (CPU, GPU y potencialmente aceleradores móviles).

Las innovaciones destacadas en la versión 3 son tres: la ampliación de cobertura de 5 a 31 idiomas, la mejora de estabilidad de lectura con reducción de fallos de repetición y omisión en enunciados de distinta longitud, y el aumento de similitud de hablante respecto a Supertonic 2 en el conjunto de lenguas compartidas. Además, se introduce soporte de etiquetas de expresión simples (`<laugh>`, `<breath>`, `<sigh>`) que permiten insertar risas, respiraciones y suspiros en el texto de entrada. El sistema admite estilos de voz predefinidos incluidos en el paquete y estilos personalizados zero-shot generados a partir de audio de referencia mediante la herramienta Voice Builder, que produce un JSON de embeddings compatible con Supertonic 2 y 3.

## Capacidades

- Síntesis de voz multilingüe en 31 idiomas, incluyendo castellano, inglés, coreano, japonés, árabe, hindi y la mayoría de lenguas europeas.
- Inferencia completamente local mediante ONNX Runtime, sin llamadas a la nube durante la síntesis.
- Estilos de voz predefinidos incluidos en el paquete de pesos abiertos (por ejemplo, el estilo `M1` mostrado en el ejemplo de la model card).
- Clonación de voz zero-shot mediante estilos personalizados: se genera un JSON de embeddings a partir de audio de referencia con Voice Builder.
- Etiquetas de expresión en el texto de entrada: `<laugh>`, `<breath>`, `<sigh>`.
- Control de duración de salida: la API `synthesize` devuelve la forma de onda y la duración generada.
- SDK de Python (`pip install supertonic`) con descarga automática de assets desde Hugging Face.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni visión; es un modelo exclusivamente TTS.

## Casos de uso

- **Atención al cliente automatizada:** generación de respuestas habladas en tiempo real en centros de contacto, con voces de estilo profesional (el ejemplo de la model card incluye un caso de call center en inglés). La inferencia local elimina la latencia de red y mantiene los datos del cliente en el dispositivo.
- **Audiolibros y narración larga:** la mejora de estabilidad de lectura en enunciados largos y la disponibilidad de voces de narración (ejemplos de audiobook en inglés y japonés) permiten sintetizar capítulos completos con menos fallos de repetición u omisión.
- **Accesibilidad y lectores de pantalla:** integración en aplicaciones de lectura que necesitan síntesis en el propio dispositivo, sin conexión y con cobertura de 31 idiomas para usuarios internacionales.
- **Asistentes embebidos y dispositivos IoT:** al ejecutarse con ONNX Runtime y ocupar 0,4 GB, es viable en dispositivos con recursos limitados donde no se puede depender de un servicio TTS en la nube.
- **Doblaje y localización de contenido:** un mismo pipeline puede generar audio en castellano, inglés, japonés, coreano y otras lenguas a partir del mismo texto, útil para prototipado de localización multilingüe.
- **Personajes y videojuegos:** las etiquetas de expresión (`<laugh>`, `<breath>`, `<sigh>`) y los estilos de personaje (ejemplo de voz de personaje en japonés y voz de anciano en coreano) permiten dar variedad expresiva a diálogos de NPC.
- **Prototipado de voces personalizadas:** con Voice Builder se pueden crear estilos zero-shot a partir de audio de referencia para demos de producto antes de invertir en grabaciones profesionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona mejoras cualitativas respecto a Supertonic 2 (mayor estabilidad de lectura, mayor similitud de hablante, menos fallos de repetición y omisión) y describe el modelo como "lightning fast" y "on-device", pero no incluye cifras de WER, MOS, latencia ni throughput.

## Requisitos de hardware

- **VRAM/RAM estimada:** no disponible de forma explícita. El repositorio ocupa 0,4 GB, por lo que el modelo completo cabe holgadamente en memoria de cualquier GPU consumer moderna e incluso en RAM de sistemas embebidos; el consumo real depende del runtime ONNX y de la longitud del texto.
- **GPU recomendadas:** no especificadas. Al ejecutarse con ONNX Runtime, puede usar CPU, GPU NVIDIA (CUDA EP), GPU integradas y potencialmente otros execution providers de ONNX Runtime.
- **GPU consumer:** por el tamaño del repositorio (0,4 GB), es esperable que quepa en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU, aunque no se publican cifras de latencia que lo confirmen.
- **Opciones de despliegue:** ONNX Runtime (nativo), SDK de Python `supertonic`, descarga automática de assets desde Hugging Face. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS ONNX).
- **Latencia y throughput:** no disponibles. La model card califica el modelo de "lightning fast" pero no aporta medidas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas (parámetros, contexto) que permitan una comparación cuantitativa rigurosa con alternativas TTS como Piper, Coqui XTTS o Kokoro. La siguiente tabla recoge únicamente los datos verificables de Supertonic 3 y deja el resto como no disponible.

| Modelo | Desarrollador | Idiomas | Formato | Licencia | Datos publicados |
|---|---|---|---|---|---|
| Supertonic 3 | Supertone | 31 | ONNX | OpenRAIL | Sin benchmarks en la model card |
| Supertonic 2 | Supertone | 5 | ONNX | OpenRAIL (según la model card de la v2, no verificable aquí) | No disponible en esta ficha |
| Alternativas TTS open source (Piper, XTTS, Kokoro) | varios | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Sesgos:** no se documentan análisis de sesgo demográfico, acento o género en las voces predefinidas ni en la clonación zero-shot. La clonación de voz a partir de audio de referencia plantea riesgos de suplantación y requiere consentimiento explícito de la persona cuya voz se replica.
- **Alucinación y artefactos:** aunque la versión 3 reduce fallos de repetición y omisión, la model card reconoce que existían en la versión 2; no se cuantifica la tasa residual de errores de lectura en la v3.
- **Idiomas:** la cobertura es amplia (31 lenguas) pero no se especifica la calidad por idioma; el castellano está soportado, pero no hay muestras ni métricas específicas para él en la información disponible.
- **Licencia OpenRAIL:** permite uso comercial con restricciones de uso responsable; conviene revisar las cláusulas de uso prohibido antes de integrarlo en producción, especialmente en aplicaciones de clonación de voz.
- **Formato y ecosistema:** al ser un modelo ONNX específico del SDK `supertonic`, la integración requiere ese runtime o una implementación propia sobre ONNX Runtime; no es directamente compatible con ecosistemas de inferencia LLM (vLLM, llama.cpp, TGI).
- **Repositorio con 0 descargas y 0 likes en el momento de la consulta:** el modelo es muy reciente (creado el 2026-11-09) y no hay evidencia de uso en producción ni validación independiente.
- **Ausencia de benchmarks:** no hay métricas objetivas publicadas (MOS, WER, latencia), lo que impide verificar las afirmaciones de rendimiento de la model card.

## Enlaces

- Hugging Face: https://huggingface.co/popsi2/supertonic-3
- Repositorio oficial del modelo (referenciado en la model card): https://huggingface.co/Supertone/supertonic-3
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/Supertone/supertonic-3
- Código en GitHub: https://github.com/supertone-inc/supertonic
- SDK de Python en PyPI: https://pypi.org/project/supertonic/
- Demo de muestras de audio: https://supertonic3.github.io/
- Voice Builder (estilos de voz personalizados): https://supertonic.supertone.ai/voice-builder
