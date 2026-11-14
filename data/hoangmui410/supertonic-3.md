# hoangmui410/Supertonic-3

## Resumen

Supertonic 3 es un sistema de síntesis de voz (text-to-speech) de pesos abiertos desarrollado por Supertone, distribuido en Hugging Face a través del repositorio `hoangmui410/Supertonic-3`. Su rasgo definitorio es la inferencia completamente local mediante ONNX Runtime, sin necesidad de llamadas a la nube para generar audio, lo que lo orienta a despliegues en dispositivo (on-device) y entornos con requisitos de privacidad o latencia estrictos.

La versión 3 amplía el soporte lingüístico de las 5 lenguas de Supertonic 2 hasta 31 idiomas, incluyendo castellano, e introduce mejoras en la estabilidad de lectura (menos fallos de repetición y omisión, especialmente en enunciados cortos y largos), mayor similitud con el hablante en el conjunto de lenguas compartidas y etiquetas de expresión simples como `<laugh>`, `<breath>` y `<sigh>`. El paquete incluye estilos de voz predefinidos para inferencia local inmediata.

El modelo se distribuye con licencia OpenRAIL y un tamaño de repositorio de 0,4 GB, lo que refleja un diseño compacto orientado a ejecución local. Se accede mediante el SDK de Python `supertonic`, que descarga automáticamente los activos del modelo desde Hugging Face en la primera ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (sistema TTS basado en ONNX Runtime; no se detalla la topología interna) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 31: en, ko, ja, ar, bg, cs, da, de, el, es, et, fi, fr, hi, hr, hu, id, it, lt, lv, nl, pl, pt, ro, ru, sk, sl, sv, tr, uk, vi |
| Licencia | openrail |
| Formato de pesos | ONNX (inferencia vía ONNX Runtime); no se detallan otros formatos |
| Tamano del repositorio | 0,4 GB |
| Runtime de inferencia | ONNX Runtime, local (sin nube) |
| SDK | `supertonic` (Python, PyPI) |
| Estilos de voz | presets fijos incluidos; estilos personalizados vía Voice Builder (JSON de embeddings) |
| Etiquetas de expresion | `<laugh>`, `<breath>`, `<sigh>` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo (no se especifica si emplea un transformer, un modelo de difusión, un decodificador vocacional o una combinación). Lo que sí se documenta es el runtime: la síntesis se ejecuta íntegramente en el dispositivo mediante ONNX Runtime, sin dependencia de servicios en la nube. El repositorio ocupa 0,4 GB, coherente con un modelo compacto pensado para inferencia local.

Respecto al entrenamiento, la model card no proporciona datos sobre volumen de tokens, composición del dataset ni uso de RLHF/DPO. Las innovaciones declaradas por el autor son de producto y calidad: ampliación a 31 idiomas, mayor estabilidad de lectura con reducción de fallos de repetición y omisión, mayor similitud de hablante frente a Supertonic 2 y soporte de etiquetas de expresión. También se ofrece un flujo de clonación de voz zero-shot mediante archivos JSON de estilo de voz generados con la herramienta Supertonic Voice Builder a partir de audio de referencia.

## Capacidades

- Síntesis de voz multilingüe en 31 idiomas, incluido castellano (`es`).
- Inferencia completamente local con ONNX Runtime, sin llamadas a la nube para la síntesis.
- Estilos de voz predefinidos incluidos en el paquete de pesos abiertos.
- Clonación de voz zero-shot mediante estilos de voz personalizados (JSON de embeddings generados con Voice Builder).
- Etiquetas de expresión simples en el texto de entrada: `<laugh>`, `<breath>`, `<sigh>`.
- Mayor estabilidad de lectura que la versión 2, con menos fallos de repetición y omisión en enunciados cortos y largos.
- SDK de Python (`supertonic`) con descarga automática de activos y guardado de audio en WAV.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada; es un sistema TTS, no un modelo generativo de propósito general.

## Casos de uso

- **Atención al cliente automatizada**: generación de respuestas habladas en tiempo real dentro de un IVR o agente conversacional, ejecutando la síntesis en el propio servidor o dispositivo sin depender de un proveedor cloud. El soporte de 31 idiomas permite atender mercados distintos con un único sistema.
- **Lectura de contenidos y audiolibros**: conversión de texto largo a voz con estilos narrativos; la mejora en estabilidad de lectura reduce repeticiones y omisiones en pasajes extensos, un fallo típico de los TTS en producción.
- **Asistentes de voz en dispositivo**: integración en aplicaciones de escritorio, móviles o sistemas embebidos donde la privacidad impide enviar texto a la nube; el runtime ONNX y el tamaño de 0,4 GB facilitan el despliegue local.
- **Accesibilidad**: lectura en voz alta de interfaces, documentos y notificaciones para usuarios con discapacidad visual, con selección de voz y idioma según la configuración del usuario.
- **Localización de vídeo y formación electrónica**: doblaje o narración de cursos y materiales formativos en varios idiomas usando el mismo motor, con estilos de voz consistentes por curso.
- **Prototipado de personajes y videojuegos**: generación de voces de personaje con estilos personalizados (incluidos registros de personaje y voces de anciano, como muestran los ejemplos de la model card en japonés y coreano) y etiquetas de expresión para risas, suspiros y respiraciones.
- **Sistemas de megafonía y avisos**: generación de anuncios pregrabados o dinámicos en entornos con conectividad limitada, donde la síntesis debe ocurrir en el propio dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica de forma cualitativa que el modelo es "ligero y rápido" y "competitivo" para inferencia on-device, sin cifras de latencia, throughput, MOS ni comparaciones numéricas con otros sistemas TTS.

## Requisitos de hardware

- **VRAM/RAM estimada**: no disponible de forma explícita; el repositorio de pesos ocupa 0,4 GB, por lo que la huella en memoria es reducida y compatible con ejecución en CPU.
- **GPU recomendadas**: no se especifican. Al ejecutarse sobre ONNX Runtime, puede funcionar en CPU y, previsiblemente, en GPU consumer, pero el autor no publica requisitos ni aceleraciones concretas.
- **Compatibilidad con GPU consumer**: no confirmada en la documentación disponible; el diseño on-device y el tamaño del paquete sugieren viabilidad en hardware modesto, pero es una inferencia, no un dato del autor.
- **Opciones de despliegue**: SDK de Python `supertonic` sobre ONNX Runtime. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a LLM, no a TTS).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones numéricas publicadas por el autor frente a otros sistemas TTS. La model card solo referencia a Supertonic 2 como versión anterior, indicando mejoras en cobertura lingüística (de 5 a 31 idiomas), estabilidad de lectura y similitud de hablante, sin cifras.

| Modelo | Idiomas | Licencia | Runtime local | Datos comparativos |
|---|---|---|---|---|
| Supertonic 3 | 31 | openrail | Sí (ONNX Runtime) | Mejoras cualitativas frente a Supertonic 2 |
| Supertonic 2 | 5 | no disponible en esta ficha | Sí (ONNX Runtime) | Referencia de comparación del autor |
| Otras alternativas TTS | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo; al ser un sistema TTS, los riesgos de sesgo se relacionan con la representación de voces y acentos, pero el autor no publica análisis al respecto.
- Riesgo de alucinación en sentido estricto no aplica, pero sí existen fallos de pronunciación, repetición u omisión; el autor afirma haberlos reducido respecto a la versión 2, sin cuantificar.
- La cobertura de 31 idiomas no implica la misma calidad en todos ellos; no se publican métricas por idioma.
- La licencia OpenRAIL impone restricciones de uso (cláusulas de uso responsable habituales en esta familia); debe revisarse el texto completo antes de un uso comercial.
- La clonación de voz zero-shot requiere estilos generados con Voice Builder; los estilos comprados incluyen embeddings descargables para Supertonic 2 y Supertonic 3, lo que introduce una dependencia de un servicio externo para esa función.
- El repositorio indicado tiene 0 descargas y 0 likes, y el autor del repositorio (`hoangmui410`) no coincide con la organización oficial (`Supertone`), por lo que conviene verificar la procedencia y los pesos antes de usarlo en producción.
- No se detallan requisitos de hardware, latencia ni límites de longitud de texto de entrada.

## Enlaces

- Hugging Face: https://huggingface.co/hoangmui410/Supertonic-3
- Repositorio oficial en Hugging Face (referenciado en la model card): https://huggingface.co/Supertone/supertonic-3
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/Supertone/supertonic-3
- Código en GitHub: https://github.com/supertone-inc/supertonic
- SDK de Python en PyPI: https://pypi.org/project/supertonic/
- Demo de muestras de audio: https://supertonic3.github.io/
- Supertonic Voice Builder: https://supertonic.supertone.ai/voice-builder
