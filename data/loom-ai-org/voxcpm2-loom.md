# loom-ai-org/voxcpm2-loom

## Resumen

VoxCPM2-loom es la exportación al formato GGUF del motor loom.cpp del modelo VoxCPM2 de OpenBMB, un sistema de síntesis de voz (text-to-speech) de 2.334.709.084 parámetros (2,3B) que combina difusión y generación autorregresiva sobre latentes continuos de un AudioVAE. El modelo original lo desarrolla OpenBMB y esta versión la publica loom-ai-org para su ejecución con la librería `loom-py-rt` (PyPI), que interpreta un GGUF autodescriptivo que incluye las topologías de grafo, el tokenizador y el script de control del modelo.

La relevancia de esta exportación es doble: por un lado, empaqueta un TTS de 30 idiomas y 48 kHz en un único fichero GGUF de 18,7 GB con pesos sin modificar respecto al original; por otro, elimina la dependencia de un fonemizador externo, ya que el modelo codifica el texto por sí mismo. El resultado es un pipeline de TTS autocontenido que se puede desplegar sin cadena de preprocesado lingüístico.

La licencia es Apache 2.0, heredada del modelo base, y el repo acumula 35 descargas y 0 likes en el momento de la consulta. No se han publicado resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión autorregresiva sobre latentes continuos de AudioVAE (TTS) |
| Parámetros totales | 2.334.709.084 (2,3B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF; el modelo card cita F32 (9,3 GB) como referencia de tamaño; no se detallan otros niveles |
| Idiomas soportados | 30: en, zh, ar, my, da, nl, fi, fr, de, el, he, hi, id, it, ja, km, ko, lo, ms, no, pl, pt, ru, es, sw, sv, tl, th, tr, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`voxcpm2.gguf`), exportado con loom-exporter |

## Arquitectura y entrenamiento

VoxCPM2 es un TTS de difusión autorregresiva que opera sobre latentes continuos generados por un AudioVAE, en lugar de sobre tokens discretos de audio. Cada parche de audio de 160 ms se genera partiendo de un muestreo aleatorio e integrado a lo largo de 10 pasos guiados con CFG-Zero\* y una guía de 2.0. La frecuencia de muestreo de salida es de 48 kHz. El modelo codifica el texto internamente, sin fonemizador, lo que simplifica el pipeline de inferencia.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La exportación a GGUF conserva los pesos sin modificar y añade las topologías de grafo y el driver necesarios para ejecutarlo en loom.cpp; el modelo card indica que la verificación contra la referencia, con los muestreos fijados, coincide dentro de 1,2e-06 rms en los latentes paso a paso. No se mencionan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz a partir de texto en 30 idiomas, con salida a 48 kHz.
- Codificación de texto propia: no requiere fonemizador externo.
- Generación de voz zero-shot: cada llamada inventa una voz adecuada al texto.
- Diseño de voz mediante descripción entre paréntesis al inicio del texto (la descripción no se pronuncia); el parámetro `seed` permite reproducir la misma voz.
- Streaming de audio por fragmentos, con la propiedad `stream.exact` para reconstruir la forma de onda completa y `stream.seconds` para la duración.
- Reproducibilidad mediante `seed` en las llamadas de inferencia.
- Acceso de bajo nivel a través de `model.infer(...)`, que pasa los argumentos directamente al driver embebido en el GGUF; `model.driver_source` documenta todos los argumentos aceptados.
- No incluye clonación de voz en esta exportación (el encoder del AudioVAE no está incluido).
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso, al tratarse de un modelo de TTS.

## Casos de uso

- **Locución multilingüe para vídeo y pódcast**: el modelo cubre 30 idiomas y 48 kHz, por lo que un mismo pipeline puede generar narración en inglés, chino, español, árabe o tailandés sin cambiar de modelo ni de fonemizador.
- **Audiolibros y contenido largo con streaming**: `model.text2speech.stream` entrega el audio por fragmentos a medida que se genera, lo que permite empezar la reproducción antes de completar la síntesis y reducir la latencia percibida en textos extensos.
- **Prototipado de asistentes de voz**: la generación zero-shot de voces permite iterar sobre el tono y el estilo sin grabar muestras; el diseño por descripción en el texto (`"(A calm older man, speaking slowly)..."`) sirve para ajustar la interpretación en pruebas de concepto.
- **Sistemas de accesibilidad**: conversión de texto a voz para lectores de pantalla o interfaces de accesibilidad en aplicaciones de escritorio, con la ventaja de que el modelo es autocontenido en un único GGUF y no exige servicios externos.
- **Generación de voces para videojuegos y prototipos de animación**: el parámetro `seed` permite reproducir una misma voz entre sesiones, lo que facilita mantener coherencia en diálogos generados por lotes.
- **Integración en pipelines de loom.cpp**: al ser un GGUF autodescriptivo con driver embebido, se puede ejecutar desde `loom-py` y ajustar parámetros de bajo nivel vía `model.infer(...)` para experimentación con los pasos de guía o el muestreo.
- **Investigación en TTS de difusión**: la coincidencia documentada con la referencia (1,2e-06 rms en latentes con los muestreos fijados) permite usar esta exportación como banco de pruebas reproducible de la arquitectura original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: 9,3 GB en F32 para los 2,3B parámetros; el repo ocupa 18,7 GB, lo que sugiere que incluye más de un nivel de precisión o metadatos adicionales. No se detallan otros niveles de cuantización.
- **Rendimiento en CPU**: en un portátil x86 de 2 núcleos, un segundo de audio a 48 kHz tarda aproximadamente 20 segundos en generarse, según el modelo card.
- **GPU recomendadas**: no disponible en la información proporcionada.
- **Compatibilidad con GPU de consumo**: no disponible; no se confirma ni descarta que quepa en tarjetas como RTX 4090.
- **Opciones de despliegue**: `loom-py-rt` (PyPI, extra `[hub]`) sobre el motor loom.cpp; no se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- **Latencia y throughput**: solo el dato de CPU citado (≈20 s por segundo de audio en 2 núcleos x86); no hay cifras para GPU.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de TTS con los que comparar parámetros, contexto, licencia o disponibilidad.

## Limitaciones y advertencias

- **Sin clonación de voz**: esta exportación no incluye el encoder del AudioVAE, por lo que no se puede clonar una voz a partir de una grabación; solo hay voces zero-shot o diseñadas por descripción.
- **Generación estocástica**: cada parche de audio parte de un muestreo aleatorio, de modo que dos llamadas idénticas producen resultados distintos salvo que se fije `seed`.
- **Coste computacional alto en CPU**: 2,3B parámetros y 9,3 GB en F32; en un portátil de 2 núcleos x86, un segundo de audio requiere unos 20 segundos.
- **Reintentos automáticos**: si una generación consume todo su presupuesto de longitud (seis parches por token de texto), se vuelve a muestrear hasta tres veces, lo que puede aumentar la latencia en casos degenerados.
- **Frecuencia de muestreo manual**: `sample_rate=48000` debe pasarse explícitamente si el GGUF no la declara; una tasa incorrecta no falla, pero reproduce la voz a velocidad equivocada.
- **Sesgos**: no se documentan sesgos conocidos en la información disponible; al ser un TTS, los sesgos se manifestarían en la prosodia y el timbre de las voces generadas según el idioma y el texto.
- **Riesgo de alucinación**: no aplica en el sentido de generación de texto factual, pero la síntesis puede producir artefactos o prosodia incorrecta en textos atípicos; no se cuantifica.
- **Licencia**: Apache 2.0 permite uso comercial, pero se hereda del modelo base y conviene verificar las condiciones de `openbmb/VoxCPM2` antes de desplegar en producción.
- **Madurez del ecosistema**: 35 descargas y 0 likes; la librería `loom-py-rt` y el motor loom.cpp son específicos de este formato y no cuentan con el soporte de herramientas estándar como llama.cpp.

## Enlaces

- [Modelo en Hugging Face: loom-ai-org/voxcpm2-loom](https://huggingface.co/loom-ai-org/voxcpm2-loom)
- [Modelo base: openbmb/VoxCPM2](https://huggingface.co/openbmb/VoxCPM2)
- [Repositorio loom.cpp](https://github.com/loom-ai-org/loom.cpp)
- [Repositorio loom-py](https://github.com/loom-ai-org/loom-py)
- [Repositorio loom-exporter](https://github.com/loom-ai-org/loom-exporter)
- [Paquete loom-py-rt en PyPI](https://pypi.org/project/loom-py-rt/)
