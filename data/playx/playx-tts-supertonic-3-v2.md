# PLAYX/playx-tts-supertonic-3-v2

## Resumen

Supertonic 3 es un sistema de texto a voz (TTS) de inferencia local desarrollado por Supertone, distribuido con pesos abiertos y ejecutado íntegramente mediante ONNX Runtime en el dispositivo del usuario, sin necesidad de llamadas a la nube para la síntesis. Esta ficha concreta, PLAYX/playx-tts-supertonic-3-v2, no es el modelo original: es un reempaquetado realizado por PLAYX en el que el componente `vector_estimator` se ha cuantizado a 8 bits para reducir el peso del repositorio a unos 181 MB (0,2 GB de tamaño total) y facilitar su descarga y ejecución en el navegador vía WebAssembly.

La relevancia de esta versión radica en dos factores. Por un lado, Supertonic 3 amplía la cobertura lingüística de Supertonic 2 de 5 a 31 idiomas, incluyendo español, y mejora la estabilidad de lectura reduciendo fallos de repetición y de omisión de fragmentos, especialmente en enunciados muy cortos o muy largos. Por otro lado, el reempaquetado de PLAYX demuestra que el modelo puede comprimirse hasta un tamaño manejable para despliegues en el cliente (navegador, aplicaciones de escritorio, dispositivos sin GPU), lo que abre la puerta a síntesis de voz offline con requisitos de hardware mínimos.

El modelo incluye estilos de voz predefinidos listos para usar, soporta etiquetas de expresión simples como `<laugh>`, `<breath>` y `<sigh>`, y permite construir estilos de voz personalizados a partir de audio de referencia mediante la herramienta Voice Builder de Supertone. La licencia es OpenRAIL-M, heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema TTS neuronal ejecutado con ONNX Runtime; incluye un componente `vector_estimator` (cuantizado a 8 bits en este reempaquetado). Detalle completo de la topología no disponible en la informacion proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no aplica (modelo de síntesis de voz, no de texto); longitud máxima de enunciado no disponible |
| Tipos de cuantizacion | 8 bits sobre el `vector_estimator` en esta copia; el paquete original de Supertone no especifica cuantizaciones adicionales |
| Idiomas soportados | 31: en, ko, ja, ar, bg, cs, da, de, el, es, et, fi, fr, hi, hr, hu, id, it, lt, lv, nl, pl, pt, ro, ru, sk, sl, sv, tr, uk, vi |
| Licencia | openrail (OpenRAIL-M segun la model card original de Supertone) |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,2 GB (copia cuantizada de PLAYX, ~181 MB) |
| Libreria / runtime | `supertonic` (SDK de Python), ONNX Runtime; ejecucion en navegador via WASM |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

Supertonic es un sistema de síntesis de voz ligero diseñado para inferencia local. La arquitectura concreta no se detalla en la información disponible más allá de la existencia de un componente denominado `vector_estimator`, que en este reempaquetado se ha cuantizado a 8 bits, y de la ejecución completa sobre ONNX Runtime. El pipeline incluye estilos de voz (presets fijos empaquetados con los pesos abiertos) y admite estilos personalizados en modo zero-shot construidos a partir de audio de referencia mediante la herramienta Supertonic Voice Builder, que genera ficheros JSON de estilo de voz con embeddings descargables tanto para Supertonic 2 como para Supertonic 3.

En cuanto a los datos de entrenamiento, número de tokens, composición del corpus, uso de RLHF/DPO u otras técnicas de alineación, la información proporcionada no incluye ningún dato. Sí se documentan las mejoras declaradas por el autor entre la versión 2 y la 3: ampliación de 5 a 31 idiomas, mayor estabilidad de lectura con menos fallos de repetición y omisión en enunciados cortos y largos, y mayor similitud de hablante en el conjunto de idiomas compartidos con la versión anterior. También se añade soporte de etiquetas de expresión (`<laugh>`, `<breath>`, `<sigh>`).

## Capacidades

- Síntesis de voz multilingüe en 31 idiomas, incluyendo español (es), inglés (en), alemán (de), francés (fr), italiano (it), portugués (pt), ruso (ru), coreano (ko), japonés (ja), árabe (ar) e hindi (hi), entre otros.
- Ejecución totalmente local y offline mediante ONNX Runtime, sin dependencia de servicios en la nube para la síntesis.
- Estilos de voz predefinidos incluidos en el paquete de pesos abiertos, invocables por nombre (por ejemplo `M1`) desde el SDK.
- Estilos de voz personalizados en modo zero-shot a partir de audio de referencia, mediante Supertonic Voice Builder y ficheros JSON de estilo.
- Etiquetas de expresión simples para introducir risas, respiraciones y suspiros en el audio generado.
- Control de estabilidad de lectura mejorado: reducción de repeticiones y omisiones en enunciados cortos y largos.
- Salida de audio en formato WAV con duración devuelta por la API (`tts.synthesize` devuelve la forma de onda y la duración).
- Ejecución en navegador mediante WebAssembly en esta copia cuantizada, pensada para descarga ligera.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada (el modelo es exclusivamente texto a voz).

## Casos de uso

- **Lectura de artículos y documentos en el navegador**: esta copia cuantizada a 8 bits pesa unos 181 MB y está pensada para descargarse y ejecutarse vía WASM, de modo que una extensión o aplicación web puede ofrecer lectura en voz alta sin enviar el texto a ningún servidor, lo que resulta adecuado para contenido sensible o para usuarios con conectividad limitada.
- **Atención al cliente y respuestas IVR**: el modelo permite generar locuciones del tipo "Buenos días, gracias por llamar. ¿En qué puedo ayudarle?" con voces de estilo profesional, y su naturaleza offline encaja en centralitas telefónicas o sistemas embebidos donde no se quiere depender de una API externa.
- **Audiolibros y narración de ficción**: la combinación de estilos de voz personalizados por referencia y etiquetas de expresión (`<laugh>`, `<breath>`, `<sigh>`) permite producir narraciones con matices emocionales y voces de personaje diferenciadas, como ilustran los ejemplos de audiolibro en inglés y japonés de la model card.
- **Localización de contenido multimedia**: con 31 idiomas y salida WAV, se puede generar una pista de voz para un mismo guion en varios idiomas dentro de un pipeline de posproducción, usando el SDK de Python para automatizar la generación por lotes.
- **Asistentes de voz en dispositivos sin GPU**: al ejecutarse sobre ONNX Runtime y existir una variante de 8 bits, es viable en equipos de escritorio, Raspberry Pi o navegadores, donde un modelo TTS en la nube añadiría latencia de red y coste por petición.
- **Accesibilidad y lectores de pantalla**: integración en aplicaciones de escritorio que conviertan texto seleccionado en voz al instante, manteniendo la privacidad del contenido leído al no salir del dispositivo.
- **Prototipado de personajes y videojuegos**: generación de voces de personaje a partir de unas pocas muestras de referencia mediante Voice Builder para diálogos de prototipos, sin necesidad de contratar actores de voz en fases tempranas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente declara mejoras cualitativas respecto a Supertonic 2 (mayor similitud de hablante en idiomas compartidos y menor tasa de repeticiones y omisiones), sin cifras asociadas.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explícita. El repositorio completo ocupa 0,2 GB y la copia cuantizada unos 181 MB, por lo que la huella en memoria es del orden de cientos de MB durante la inferencia, no de gigabytes.
- **GPU recomendadas**: no se especifican. El diseño del modelo (ONNX Runtime, ejecución "on-device") está orientado a CPU y a ejecución en navegador, por lo que no requiere GPU dedicada.
- **Compatibilidad con GPU de consumo**: cabe holgadamente en cualquier GPU de consumo e incluso en equipos sin GPU; no se proporcionan cifras de VRAM mínima.
- **Opciones de despliegue**: SDK de Python `supertonic` (`pip install supertonic`, con `auto_download=True` para descargar los pesos desde Hugging Face), ONNX Runtime como motor de ejecución, y ejecución en navegador vía WASM en esta copia de PLAYX. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: no disponibles. La model card describe el sistema como "lightning fast" sin aportar métricas de RTF (real-time factor), latencia por carácter ni muestras por segundo.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de conocimiento general público y no han sido verificados en la información proporcionada; se marcan como aproximados. Los de Supertonic 3 en esta ficha son, en su mayoría, "no disponible".

| Modelo | Parametros | Idiomas | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| Supertonic 3 (copia PLAYX 8-bit) | no disponible | 31 | OpenRAIL-M | ONNX / ONNX Runtime, WASM | Ejecución local, estilos de voz preset y zero-shot, etiquetas de expresión |
| Kokoro | ~82 M (aprox.) | ~8 (aprox.) | Apache 2.0 (aprox.) | ONNX / PyTorch | Muy ligero y popular para TTS local; cobertura de idiomas menor |
| Piper | no disponible (VITS, decenas de millones aprox.) | decenas de idiomas (aprox.) | MIT (aprox.) | ONNX | Orientado a dispositivos de bajos recursos; sin clonación zero-shot destacada |
| XTTS-v2 (Coqui) | ~467 M (aprox.) | 17 (aprox.) | CPML (aprox.) | PyTorch | Clonación de voz zero-shot; pesos más pesados y licencia no permisiva para uso comercial |

## Limitaciones y advertencias

- **No es el modelo original**: se trata de una copia reempaquetada y cuantizada por PLAYX a partir de Supertonic 3 de Supertone. La autoría y los derechos pertenecen a Supertone; cualquier cita o atribución debe dirigirse al repositorio original.
- **Cuantización agresiva**: el `vector_estimator` está cuantizado a 8 bits, lo que puede degradar la calidad acústica y la similitud de hablante respecto a los pesos originales en precisión completa. No se documenta ninguna evaluación comparativa de la pérdida de calidad.
- **Licencia OpenRAIL-M**: incluye restricciones de uso (cláusulas de uso responsable) que deben revisarse antes de un despliegue comercial. No es una licencia permisiva tipo Apache o MIT.
- **Riesgo de uso indebido de la voz**: la funcionalidad de estilos de voz zero-shot a partir de audio de referencia permite imitar voces; es necesario contar con consentimiento explícito y cumplir la normativa aplicable sobre deepfakes y síntesis de voz.
- **Alucinación y errores de lectura**: la model card reconoce fallos de repetición y omisión de texto en versiones anteriores y declara mejoras en la versión 3, pero no cuantifica la tasa residual de error; en producciones largas conviene validar la alineación texto-audio.
- **Idiomas no verificados individualmente**: aunque se listan 31 idiomas, no se aporta ninguna métrica de calidad por idioma; el rendimiento en idiomas con pocos datos (por ejemplo, estonio, letón, esloveno) puede ser inferior al de inglés, español o japonés.
- **Sin límites de longitud documentados**: no se especifica la longitud máxima de enunciado recomendada; los propios autores mencionan que los enunciados muy cortos y muy largos eran los más problemáticos en la versión anterior.
- **Sin benchmarks publicados**: no es posible comparar objetivamente su calidad (MOS, similitud de hablante, WER) con alternativas a partir de la información disponible.
- **Repositorio sin tracción**: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad y de informes de errores.

## Enlaces

- Repositorio de esta copia: https://huggingface.co/PLAYX/playx-tts-supertonic-3-v2
- Modelo original de Supertone: https://huggingface.co/Supertone/supertonic-3
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/Supertone/supertonic-3
- Código en GitHub: https://github.com/supertone-inc/supertonic
- SDK de Python en PyPI: https://pypi.org/project/supertonic/
- Demo de muestras de audio: https://supertonic3.github.io/
- Supertonic Voice Builder: https://supertonic.supertone.ai/voice-builder
