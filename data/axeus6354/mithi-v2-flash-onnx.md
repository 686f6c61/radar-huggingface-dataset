# AXEUS6354/mithi-v2-flash-onnx

## Resumen

Mithi v2 Flash ONNX es una exportación a formato ONNX Runtime del modelo de síntesis de voz Mithi v2 Flash, desarrollado originalmente por Oomni. El artefacto publicado por AXEUS6354 no es un modelo reentrenado, sino una conversión de pesos a ONNX en precisión completa (fp32, sin cuantización) pensada para inferencia de text-to-speech en dispositivo. Genera audio mono a 24 kHz y cubre once idiomas, con foco en lenguas índicas (hindi, bengalí, guyaratí, canarés, malabar, maratí, oriya, punyabí, tamil y telugu) además del inglés.

La arquitectura combina componentes de varios modelos Apache-2.0: un codificador de texto basado en Kokoro-82M, un escritor de prosodia autorregresivo que opera sobre tokens de fonemas, un codificador de palabras basado en IndicBERT y un decodificador iSTFTNet. El resultado se distribuye como una colección de cinco grafos ONNX que deben cargarse junto a sus ficheros `.onnx.data` asociados, con un tamaño total de repositorio de 0,4 GB.

Es relevante para quien necesite TTS multilingüe índico ejecutable localmente sin dependencia de frameworks de deep learning pesados: el formato ONNX permite despliegue en entornos con ONNX Runtime, incluidos dispositivos con recursos limitados, siempre que se implemente por separado el frontend de normalización de texto y G2P.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline híbrido: codificador de texto Kokoro-82M, escritor de prosodia autorregresivo, codificador de palabras IndicBERT, decodificador iSTFTNet |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (opera sobre secuencias de tokens de fonemas) |
| Tipos de cuantizacion | ninguno incluido; exportación en fp32 completa |
| Idiomas soportados | hi, en, bn, gu, kn, ml, mr, or, pa, ta, te |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (grafos `.onnx` con pesos en ficheros `.onnx.data` asociados) |
| Frecuencia de muestreo de salida | 24 kHz mono |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El modelo original Mithi v2 Flash es un sistema TTS compuesto por varias etapas encadenadas. La entrada de texto se procesa mediante un codificador basado en Kokoro-82M que produce representaciones de 512 dimensiones por token (`asr`), y un codificador de palabras derivado de IndicBERT que genera vectores de 768 dimensiones. Un escritor de prosodia autorregresivo consume estas representaciones junto con identificadores de hablante (`spk`) y de idioma (`lang`), y produce estados ocultos de 384 dimensiones que alimentan trece cabezas de prosodia (duración, sonoridad, tono, energía y respiración) implementadas como MLPs pequeñas. Finalmente, el decodificador iSTFTNet convierte la representación alineada a nivel de trama en audio, generando 600 muestras por trama.

La exportación ONNX divide el sistema en cinco grafos: `indic_encoder.onnx`, `writer_read.onnx`, `writer_step.onnx`, `kokoro_text.onnx` y `kokoro_decode.onnx`. El escritor de prosodia es autorregresivo sobre tokens de fonemas y requiere invocar `writer_step` una vez por token. El frontend (normalización de texto, G2P con espeak-ng y tokenización SentencePiece) no forma parte de los grafos y debe implementarse aparte. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus ni si se aplicaron técnicas de RLHF o DPO en el modelo original.

## Capacidades

- Síntesis de voz (text-to-speech) en once idiomas: hindi, inglés, bengalí, guyaratí, canarés, malabar, maratí, oriya, punyabí, tamil y telugu.
- Generación de audio mono a 24 kHz.
- Control de prosodia mediante cabezas dedicadas de duración, tono, energía, sonoridad y respiración.
- Selección de hablante mediante el identificador `spk` y de idioma mediante `lang`.
- Inferencia en dispositivo mediante ONNX Runtime, sin necesidad de PyTorch en producción.
- No soporta tool calling, function calling, razonamiento multi-paso ni otras capacidades de modelos de lenguaje: es exclusivamente un modelo TTS.
- No incluye capacidades de visión ni de audio de entrada.

## Casos de uso

- Lectura por voz de contenidos en lenguas índicas: el modelo permite generar audio para artículos, noticias o documentación en hindi, tamil, telugu y el resto de idiomas soportados, con salida a 24 kHz adecuada para reproducción en web o aplicaciones móviles.
- Asistentes de voz en dispositivos embebidos: al estar exportado a ONNX en fp32 y ocupar 0,4 GB, puede integrarse en sistemas con ONNX Runtime donde no se dispone de GPU dedicada, siempre que se añada un frontend de G2P con espeak-ng.
- Accesibilidad para personas con discapacidad visual: conversión de texto a voz local sin enviar contenido a servicios en la nube, lo que reduce latencia y preserva la privacidad del texto procesado.
- Localización de aplicaciones multilingües: un mismo pipeline cubre once idiomas, lo que simplifica el despliegue de voces para mercados del sur de Asia sin integrar varios motores TTS distintos.
- Generación de audiolibros y pódcast automatizados: la salida mono a 24 kHz y el control de prosodia permiten producir narraciones con variaciones de tono y energía, aunque la calidad final depende del frontend de normalización de texto.
- Sistemas de anuncios y avisos en tiempo real: la separación en grafos pequeños (`writer_step` por token) permite controlar el coste computacional por paso y adaptar el pipeline a restricciones de latencia concretas.
- Investigación en TTS índico: al ser una conversión de pesos Apache-2.0 con grafos documentados, sirve como base para experimentar con cuantización, optimización de grafos o sustitución de componentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio completo ocupa 0,4 GB en fp32, por lo que la huella de pesos en memoria es del orden de cientos de megabytes, sin contar activaciones ni el frontend.
- GPU recomendadas: no disponibles en la información proporcionada. Al ser ONNX Runtime, puede ejecutarse en CPU, GPU NVIDIA con CUDA o GPU integradas compatibles con los execution providers de ONNX Runtime.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del repositorio (0,4 GB), aunque no se especifican requisitos mínimos ni modelos concretos.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#, Java) con los execution providers correspondientes. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput: no disponibles. El diseño autorregresivo del escritor de prosodia implica una llamada a `writer_step` por token de fonema, lo que condiciona la latencia en función de la longitud del texto.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Formato | Licencia | Contexto / notas |
|---|---|---|---|---|---|
| Mithi v2 Flash ONNX (este) | TTS híbrido (Kokoro + IndicBERT + iSTFTNet) | 11 (foco índico + inglés) | ONNX fp32 | Apache-2.0 | 24 kHz mono; frontend externo |
| Kokoro-82M | TTS | Principalmente inglés y otros | PyTorch / ONNX en la comunidad | Apache-2.0 | Base del codificador de texto de este modelo; 82M parámetros |
| IndicBERT | Codificador de texto | Lenguas índicas | PyTorch | Apache-2.0 (según AI4Bharat) | No es un modelo TTS; se usa como codificador de palabras |
| Mithi v2 Flash (original) | TTS híbrido | 11 | PyTorch | Apache-2.0 | Modelo del que deriva esta exportación |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El frontend no está incluido: la normalización de texto, la conversión grafema-fonema con espeak-ng y la tokenización SentencePiece deben implementarse por separado; sin ellas los grafos ONNX no producen audio utilizable.
- Cada grafo `.onnx` depende de su fichero `.onnx.data` asociado; deben distribuirse y cargarse juntos o la inferencia fallará.
- La representación `asr` es channels-first (1, 512, T) y debe alinearse a la tasa de tramas repitiendo la columna de cada fonema `dur[p]` veces antes de alimentar `kokoro_decode`; un alineamiento incorrecto degrada la calidad del audio.
- El escritor de prosodia es autorregresivo: la latencia crece con la longitud del texto y los errores pueden acumularse a lo largo de la secuencia.
- No se han publicado métricas de calidad (MOS, WER, similitud de hablante) ni benchmarks en la información disponible, por lo que no es posible evaluar su rendimiento frente a alternativas.
- Riesgo de pronunciación incorrecta en palabras fuera del vocabulario o en textos con mezcla de idiomas no contemplada por el frontend.
- No se documentan sesgos específicos del modelo ni del corpus de entrenamiento original.
- Licencia Apache-2.0: permite uso comercial y modificación, pero requiere conservar los avisos de atribución a Oomni, hexgrad (Kokoro), AI4Bharat (IndicBERT) y Maya.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 11 de noviembre de 2026; se trata de una conversión reciente sin validación comunitaria conocida.
- No apto para tareas de razonamiento, generación de texto, código o agentes: es exclusivamente un modelo de síntesis de voz.

## Enlaces

- Hugging Face: https://huggingface.co/AXEUS6354/mithi-v2-flash-onnx
- Modelo original: https://huggingface.co/Oomni/mithi-v2-flash
- Kokoro (codificador de texto y decodificador iSTFTNet): https://huggingface.co/hexgrad/kokoro
- IndicBERT (AI4Bharat): no disponible en la información proporcionada
- Maya (normalizador de texto): no disponible en la información proporcionada
- Paper, blog o demo: no disponible en la información proporcionada
