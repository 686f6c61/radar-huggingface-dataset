# eadelabajan/Kokoro-82M-v1.0-ONNX

## Resumen

Kokoro-82M-v1.0-ONNX es una conversión a formato ONNX del modelo de síntesis de voz Kokoro-82M, desarrollado originalmente por hexgrad. Se trata de un modelo text-to-speech (texto a audio) de tan solo 82 millones de parámetros, pensado para generar voz de forma eficiente incluso en entornos con recursos limitados. Esta versión concreta, publicada por el usuario eadelabajan, empaqueta los pesos en ONNX y declara compatibilidad con la librería transformers.js, lo que permite su ejecución en JavaScript tanto en Node.js como en el navegador.

La relevancia del modelo radica en su relación calidad/tamaño: con 82M de parámetros ofrece una calidad de voz competitiva frente a sistemas mucho más grandes, y su licencia Apache 2.0 facilita su integración en productos comerciales. La versión ONNX amplía el alcance a aplicaciones web del lado del cliente sin necesidad de infraestructura de GPU dedicada.

La longitud de contexto del modelo es de 512 tokens fonéticos (con margen para tokens de relleno), y genera audio a 24 kHz. El idioma declarado es inglés. El repositorio ocupa 1,4 GB e incluye múltiples variantes de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS texto-a-audio; arquitectura interna no detallada en la información) |
| Parametros totales | 82 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens fonéticos (se recomienda dejar margen para tokens de relleno, límite práctico 510) |
| Tipos de cuantizacion | fp32, fp16, q8, q4, q4f16, uint8, uint8f16, q8f16 (según variantes ONNX disponibles) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (múltiples variantes: model.onnx, model_fp16.onnx, model_quantized.onnx, model_q8f16.onnx, model_uint8.onnx, model_uint8f16.onnx, model_q4.onnx, model_q4f16.onnx) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo más allá de su naturaleza texto-a-audio. El pipeline declarado es text-to-speech y el modelo base es hexgrad/Kokoro-82M. La entrada del modelo son identificadores de fonemas (obtenidos mediante el conversor misaki, según la model card) junto con un vector de estilo de forma (1, 256) que se selecciona en función de la longitud del texto, además de un parámetro de velocidad. La salida es audio muestreado a 24 kHz.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card únicamente describe el uso y las variantes de cuantización, sin sección de entrenamiento. La innovación destacable es la eficiencia: 82M de parámetros para una tarea generativa de audio, con variantes cuantizadas que permiten su despliegue en navegador mediante transformers.js.

## Capacidades

- Síntesis de voz (texto a audio) en inglés a partir de texto de entrada.
- Generación de audio a 24 kHz de frecuencia de muestreo.
- Control de velocidad mediante el parámetro `speed` (vector de floats).
- Selección de voz entre un conjunto predefinido de hablantes (voces americanas femeninas y masculinas documentadas: af_heart, af_alloy, af_aoede, af_bella, af_jessica, af_kore, af_nicole, af_nova, af_river, af_sarah, af_sky, am_adam, am_echo, am_eric, am_fenrir, entre otras).
- Control de estilo mediante vectores de estilo de 256 dimensiones asociados a cada voz y longitud de texto.
- Ejecución en JavaScript (transformers.js / kokoro-js) y en Python (onnxruntime).
- No se documenta soporte de tool calling, agentes, visión, audio de entrada ni modo de razonamiento; es exclusivamente un modelo TTS.

## Casos de uso

- Lectura por voz en aplicaciones web: mediante kokoro-js y una variante cuantizada (q8 o q4), el modelo puede ejecutarse en el navegador del cliente y convertir texto en audio sin enviar datos a un servidor, lo que reduce latencia y preserva la privacidad.
- Audiolibros y contenido narrado: con 82M de parámetros y generación a 24 kHz, permite narrar textos largos por fragmentos (respetando el límite de 510 tokens fonéticos por invocación) con varias voces para diferenciar personajes.
- Accesibilidad: integración en lectores de pantalla o asistentes que conviertan contenido textual en voz para usuarios con discapacidad visual, aprovechando la licencia Apache 2.0 para uso comercial.
- Asistentes de voz embebidos: despliegue en dispositivos con recursos limitados (Raspberry Pi, navegador, aplicaciones de escritorio) gracias al reducido tamaño del modelo y a las variantes cuantizadas.
- Generación de avisos y notificaciones habladas: sistemas de megafonía, domótica o aplicaciones móviles que generen mensajes de voz dinámicos con baja latencia.
- Prototipado rápido de interfaces de voz: uso de la variante ONNX con onnxruntime en Python para experimentar con pipelines TTS antes de pasar a producción, sin depender de servicios en la nube.
- Localización de contenido en inglés: doblaje o narración de vídeos y tutoriales en inglés con varias voces y control de velocidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 82M de parámetros, la huella es reducida. Las variantes cuantizadas (q8, q4) reducen aún más el uso de memoria, aunque no se publican cifras exactas.
- GPU recomendadas: no se especifican; por el tamaño del modelo, cualquier GPU consumer moderna debería ser suficiente. No se dispone de datos concretos sobre A100, H100 o RTX 4090.
- Compatibilidad con GPU consumer: previsiblemente sí, dado el tamaño de 82M de parámetros y las variantes cuantizadas, aunque no se confirma con cifras en la información disponible.
- Opciones de despliegue: transformers.js con la librería kokoro-js (JavaScript, Node.js y navegador); onnxruntime en Python con los ficheros ONNX; variantes cuantizadas para entornos con menos recursos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada que permitan una comparación rigurosa. Se indica "no disponible".

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Kokoro-82M-v1.0-ONNX (este) | 82M | 512 tokens fonéticos | Apache 2.0 | ONNX |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta inglés; no se documenta soporte multilingüe.
- El límite de 510 tokens fonéticos por invocación obliga a fragmentar textos largos, lo que puede introducir discontinuidades en la prosodia entre fragmentos.
- No se han publicado datos sobre sesgos de género, acento o etnia en las voces; las voces documentadas son mayoritariamente americanas, lo que puede limitar la representatividad.
- Riesgo de alucinación no aplica en el sentido habitual de los LLM, pero sí existe riesgo de pronunciación incorrecta de palabras fuera del vocabulario o de nombres propios.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base hexgrad/Kokoro-82M y de las dependencias (misaki, kokoro-js).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado en la misma fecha; se trata de una conversión reciente sin validación comunitaria documentada.
- La model card de esta conversión no detalla el proceso de conversión a ONNX ni garantiza la equivalencia numérica con el modelo original.
- No se documentan métricas de calidad (MOS, WER) para esta versión ONNX.

## Enlaces

- Hugging Face: https://huggingface.co/eadelabajan/Kokoro-82M-v1.0-ONNX
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- Repositorio de conversión de fonemas misaki: https://github.com/hexgrad/misaki
- Librería kokoro-js en NPM: https://npmjs.com/package/kokoro-js
- Configuración del modelo base (mapeo de fonemas a ids): https://huggingface.co/hexgrad/Kokoro-82M/blob/785407d1adfa7ae8fbef8ffd85f34ca127da3039/config.json
