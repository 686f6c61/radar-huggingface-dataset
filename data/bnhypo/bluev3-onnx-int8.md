# bnHypo/BlueV3-onnx-int8

## Resumen

BlueV3-onnx-int8 es una reempaquetado en cuantización int8 del modelo de síntesis de voz BlueV3-onnx v3.0.1 (checkpoint 702000), desarrollado originalmente por Maxim Melichov en el proyecto BlueTTS. El modelo base es un sistema de text-to-speech (TTS) en inglés que emplea una arquitectura de difusión con estimador de campo vectorial, codificador de texto, predictor de duración y vocoder. Esta versión int8, publicada por el usuario bnHypo, reduce la precisión de los pesos de dos grafos ONNX (estimador vectorial y vocoder) para permitir inferencia en CPU de dispositivos móviles, manteniendo el resto de componentes sin cambios.

La relevancia de esta ficha radica en su enfoque en despliegue on-device: el autor reporta que el modelo cuantizado alcanza 6,1× tiempo real en un teléfono Android con ONNX Runtime 1.27 en CPU, frente a 4,45× del modelo fp32, con una calidad prácticamente idéntica (diferencia de error de palabra de 1,63% a 1,32% y similitud de hablante de 0,906 a 0,905). El repositorio ocupa 0,1 GB e incluye únicamente los grafos necesarios para síntesis en inglés, excluyendo el codificador de referencia, las 15 voces predefinidas y los front-ends de otros idiomas.

El modelo está licenciado bajo MIT para los grafos principales, aunque el vocoder deriva de Supertonic-3 y se distribuye bajo BigScience OpenRAIL-M, lo que impone restricciones de uso. Está etiquetado únicamente para inglés y su pipeline es text-to-speech.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión con estimador de campo vectorial, codificador de texto, predictor de duración y vocoder (grafos ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de texto por chunks de ≤ 300 ids) |
| Tipos de cuantizacion | int8 dinámica per-channel (solo MatMul y Gemm) sobre los grafos vector_estimator y vocoder; resto en precisión original |
| Idiomas soportados | en (inglés) |
| Licencia | MIT para los grafos del modelo; vocoder bajo BigScience OpenRAIL-M; polyg2p bajo Apache-2.0 |
| Formato de pesos | ONNX (onnx/vector_estimator.onnx, onnx/vocoder.onnx, onnx/text_encoder.onnx, onnx/duration_predictor_style.onnx) |

## Arquitectura y entrenamiento

El modelo base BlueV3-onnx v3.0.1 (checkpoint 702000) es un sistema TTS basado en difusión. La arquitectura se compone de varios grafos ONNX separados: un codificador de texto, un predictor de duración con estilo, un estimador de campo vectorial (vector_estimator) que actúa como modelo de difusión, y un vocoder que convierte las representaciones latentes en audio. El proceso de síntesis utiliza 8 pasos de Euler con CFG (classifier-free guidance) de 4.0, y requiere etiquetas de idioma `<en>…</en>` en cada fragmento de texto, con chunks de hasta 300 ids.

Los datos de entrenamiento no están disponibles en la información proporcionada. El modelo fue entrenado con el sistema de fonemas IPA de polyg2p, y el autor advierte que otros fonemizadores producen peores resultados. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica principal de esta versión es la cuantización int8 dinámica de ONNX Runtime aplicada únicamente a las operaciones MatMul y Gemm de dos grafos, reduciendo el tamaño del estimador vectorial de 257 MB a 66 MB y el del vocoder de 101 MB a 36 MB, sin cambios en el codificador de texto ni en el predictor de duración.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés a partir de texto escrito.
- Clonación de voz a partir de una grabación de referencia (el modelo puede imitar una voz), con advertencia explícita de consentimiento y uso ético.
- Fonemización mediante polyg2p con datos específicos para inglés (en.lex, en.g2p, en-large.g2p derivados del CMU Pronouncing Dictionary).
- Ejecución on-device en CPU de dispositivos móviles mediante ONNX Runtime.
- Control de estilo y velocidad mediante parámetros de inferencia (cfg_scale, speed).
- No incluye soporte para otros idiomas (hebreo, alemán, italiano, español, ruso, yidis) ni las 15 voces predefinidas del bundle original.
- No se mencionan capacidades de tool calling, agentes, razonamiento multi-step ni visión.

## Casos de uso

- Síntesis de voz en aplicaciones móviles sin conexión: el modelo puede ejecutarse en la CPU de un teléfono Android con ONNX Runtime, generando audio a 6,1× tiempo real, lo que permite lectores de pantalla, asistentes por voz o audiolibros offline sin depender de la nube.
- Sistemas de accesibilidad para personas con discapacidad visual: integración en aplicaciones que convierten texto en voz en tiempo real, aprovechando el reducido tamaño (0,1 GB) y la baja latencia en dispositivos de gama media.
- Generación de avisos y notificaciones por voz en inglés: el modelo puede sintetizar mensajes cortos con chunks de hasta 300 ids, adecuado para alertas de sistemas embebidos o dispositivos IoT con recursos limitados.
- Prototipado de asistentes conversacionales en inglés: gracias a la clonación de voz, se puede crear una voz personalizada para demos o pruebas de concepto, siempre con consentimiento de la persona cuya voz se imita.
- Investigación en TTS eficiente: el repositorio sirve como referencia para estudiar el impacto de la cuantización int8 en modelos de difusión para voz, comparando métricas de error de palabra y similitud de hablante.
- Educación y aprendizaje de pronunciación: el modelo puede generar pronunciaciones en inglés a partir de texto, útil en aplicaciones de aprendizaje de idiomas que requieran síntesis local sin depender de servicios externos.
- Integración en pipelines de generación de audio por lotes: al ser ONNX, puede desplegarse con ONNX Runtime en servidores CPU para tareas de síntesis masiva donde no se dispone de GPU.

## Benchmarks y rendimiento

| Métrica | fp32 | int8 |
|---|---|---|
| Velocidad en Android (ONNX Runtime 1.27 CPU, 3 hilos, pasaje de ~19 s) | 4,45× tiempo real | 6,1× tiempo real |
| Error medio de palabra (Whisper large-v3-turbo, 6 clips) | 1,63% | 1,32% |
| Similitud de hablante con la referencia (Resemblyzer) | 0,906 | 0,905 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, al tratarse de un modelo de TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, el modelo está diseñado para CPU; el repositorio ocupa 0,1 GB en disco.
- GPU recomendadas: no se especifican; el modelo está optimizado para CPU mediante ONNX Runtime.
- Cabe en GPU consumer: sí, por tamaño, pero no es el objetivo; puede ejecutarse en cualquier GPU con soporte ONNX Runtime.
- Opciones de despliegue: ONNX Runtime (versión 1.27 probada), con soporte para CPU de Android; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: 6,1× tiempo real en un teléfono Android con CPU y 3 hilos; no se proporcionan datos para otros hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Enfoque |
|---|---|---|---|---|---|
| BlueV3-onnx-int8 | no disponible | no disponible | MIT (grafos) / OpenRAIL-M (vocoder) | Hugging Face, ONNX | TTS on-device en inglés, cuantizado int8 |
| BlueV3-onnx (original) | no disponible | no disponible | MIT / OpenRAIL-M | Hugging Face, ONNX | TTS on-device en inglés, fp32, incluye 15 voces y varios idiomas |
| Supertonic-3 (vocoder base) | no disponible | no disponible | BigScience OpenRAIL-M | no disponible en la información | Vocoder para TTS |

No se dispone de información sobre otros modelos comparables de TTS en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no incluye los front-ends para hebreo, alemán, italiano, español, ruso o yidis del bundle original.
- No incluye el codificador de referencia ni las 15 voces predefinidas; para clonación de voz se necesita el bundle original.
- El vocoder está bajo licencia BigScience OpenRAIL-M, que impone restricciones de uso basadas en el comportamiento; es responsabilidad del usuario revisar dichas restricciones antes de uso comercial.
- Riesgo de alucinación no aplica directamente a TTS, pero puede producir pronunciaciones incorrectas si se usan fonemizadores distintos de polyg2p.
- La clonación de voz requiere consentimiento explícito de las personas cuya voz se utilice; el autor advierte contra el engaño o la suplantación.
- El modelo está entrenado con fonemas IPA de polyg2p; otros fonemizadores producen peores resultados.
- No se especifican sesgos conocidos ni limitaciones de contexto más allá del chunking de 300 ids.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica baja validación comunitaria.

## Enlaces

- [Hugging Face: bnHypo/BlueV3-onnx-int8](https://huggingface.co/bnHypo/BlueV3-onnx-int8)
- [Modelo base: notmax123/BlueV3-onnx](https://huggingface.co/notmax123/BlueV3-onnx)
- [Repositorio BlueTTS (GitHub)](https://github.com/maxmelichov/BlueTTS)
- [polyg2p (Apache-2.0)](https://github.com/... ) — no se proporciona URL exacta en la información
- [CMU Pronouncing Dictionary](http://www.speech.cs.cmu.edu/cgi-bin/cmudict) — referencia de los datos de polyg2p
- [ONNX Runtime](https://onnxruntime.ai/) — framework de inferencia utilizado
