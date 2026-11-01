# s2e-host/Kokoro-82M-v1.0-ONNX

## Resumen

Kokoro-82M-v1.0-ONNX es la conversión a formato ONNX del modelo de síntesis de voz Kokoro-82M, desarrollado originalmente por hexgrad y empaquetado para su uso en el ecosistema de transformers.js por el usuario s2e-host. Se trata de un modelo text-to-speech (TTS) de 82 millones de parámetros que convierte texto en audio, pensado para ejecutarse de forma eficiente tanto en navegador como en entornos de servidor ligeros. Su relevancia radica en que ofrece una calidad de voz notable para su reducido tamaño, lo que lo hace viable en dispositivos con recursos limitados, incluidos clientes web mediante WebAssembly y WebGPU.

La arquitectura subyacente es un modelo de síntesis neuronal basado en phoneme-to-mel y vocoder, con una longitud de contexto de 512 tokens (incluyendo tokens de relleno), lo que limita la duración de cada fragmento de audio generado. El modelo está entrenado exclusivamente en inglés y distribuye múltiples voces preentrenadas (americanas femeninas y masculinas, entre otras) que se seleccionan mediante un vector de estilo de 256 dimensiones.

Esta ficha describe la versión ONNX alojada en el repositorio s2e-host/Kokoro-82M-v1.0-ONNX, que hereda las capacidades del modelo base hexgrad/Kokoro-82M y añade los artefactos necesarios para inferencia con ONNX Runtime y transformers.js.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo TTS neuronal (phoneme-to-mel + vocoder), exportado a ONNX |
| Parametros totales | 82 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (incluyendo tokens de relleno; maximo 510 tokens utiles) |
| Tipos de cuantizacion | fp32, fp16, q8, q4, q4f16, uint8, uint8f16, q8f16 |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (model.onnx, model_fp16.onnx, model_quantized.onnx, model_q8f16.onnx, model_uint8.onnx, model_uint8f16.onnx, model_q4.onnx, model_q4f16.onnx) |

## Arquitectura y entrenamiento

Kokoro-82M es un modelo de síntesis de voz que opera en dos etapas: primero convierte la secuencia de fonemas (token ids) en una representación mel-espectral, y después un vocoder genera la forma de onda de audio a 24 kHz. La inferencia requiere tres entradas: los `input_ids` (fonemas mapeados a ids), un vector de estilo `style` de forma (1, 256) que condiciona la voz y la prosodia, y un parámetro `speed` que controla la velocidad de habla. La longitud máxima de la secuencia de tokens es de 512, aunque se recomienda no superar los 510 para dejar espacio a los tokens de relleno.

El modelo base fue desarrollado por hexgrad y entrenado sobre datos de habla en inglés. La información disponible no detalla el número exacto de tokens de entrenamiento ni la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. La innovación principal de esta versión es su exportación a ONNX con múltiples niveles de cuantización, lo que permite ejecutarlo con ONNX Runtime en Python y con transformers.js en JavaScript, incluyendo entornos de navegador. El repositorio ocupa 1,4 GB e incluye los distintos artefactos ONNX y los vectores de estilo de las voces.

## Capacidades

- Generación de audio a partir de texto (text-to-speech) en inglés.
- Múltiples voces preentrenadas seleccionables mediante nombre (por ejemplo, `af_bella`, `af_heart`, `am_adam`), con variedad de género y acento americano.
- Control de velocidad de habla mediante el parámetro `speed`.
- Inferencia en JavaScript mediante `kokoro-js` y en Python mediante ONNX Runtime.
- Ejecución con cuantizaciones de 8 y 4 bits para reducir requisitos de memoria.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés.
- No dispone de modo de razonamiento (thinking mode), visión ni audio de entrada.

## Casos de uso

- Lectura de artículos y documentos en aplicaciones web: el modelo puede integrarse con `kokoro-js` para narrar texto directamente en el navegador, sin enviar datos a un servidor, gracias a su reducido tamaño y a las cuantizaciones q8/q4.
- Asistentes de voz para accesibilidad: conversión de texto a voz para personas con discapacidad visual o dificultades de lectura, ejecutándose localmente en dispositivos de gama media.
- Generación de audiolibros y pódcast automatizados: síntesis por fragmentos de hasta 510 tokens de fonemas, con selección de voz y velocidad para adaptar el tono narrativo.
- Sistemas de anuncios y notificaciones por voz: generación dinámica de mensajes hablados en aplicaciones móviles o de escritorio con latencia baja gracias a la inferencia ONNX.
- Prototipado rápido de interfaces conversacionales: integración en demos y pruebas de concepto de asistentes por voz en inglés, usando las voces preentrenadas sin necesidad de entrenamiento adicional.
- Preprocesado de datos para pipelines de audio: generación de muestras de voz sintética para aumento de datos o pruebas de sistemas de reconocimiento de voz, dado el bajo coste computacional del modelo.
- Servicios de lectura de correos o mensajes en entornos empresariales: conversión de texto a audio en servidores ligeros con ONNX Runtime, evitando dependencias de servicios TTS en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para el modelo de 82M de parámetros; aproximadamente 0,5 GB en fp16 y menos de 0,3 GB en cuantizaciones q8/q4 (estimación basada en el tamaño de parámetros, no confirmada en la información disponible).
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; tarjetas consumer como GTX 1650, RTX 3060, RTX 4090 son suficientes. También puede ejecutarse en CPU.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU moderna e incluso en CPU y en navegador.
- Opciones de despliegue: ONNX Runtime (Python), transformers.js / kokoro-js (JavaScript, navegador y Node.js), y cualquier runtime compatible con ONNX.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Kokoro-82M (este) | 82M | 512 tokens | en | apache-2.0 | ONNX |
| Piper TTS | no disponible | no disponible | múltiples | MIT | ONNX |
| VITS | no disponible | no disponible | múltiples | MIT | varios |
| Bark | no disponible | no disponible | múltiples | MIT | PyTorch |

La comparación con Piper, VITS y Bark se ofrece como referencia de categoría (TTS ligero); los datos concretos de parámetros, contexto y rendimiento de esos modelos no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no genera voz en castellano ni en otros idiomas.
- La longitud de contexto de 512 tokens limita la duración de cada fragmento de audio; textos largos deben dividirse en segmentos.
- Riesgo de pronunciación incorrecta en palabras poco frecuentes, nombres propios o siglas, al depender de la conversión texto-fonema.
- No se dispone de información sobre sesgos de género, acento o demográficos en las voces preentrenadas.
- La licencia apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base hexgrad/Kokoro-82M y de las voces utilizadas.
- La calidad de la síntesis puede degradarse con cuantizaciones agresivas (q4), por lo que conviene validar la salida en producción.
- No es un modelo de lenguaje: no realiza razonamiento, tool calling ni generación de texto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/s2e-host/Kokoro-82M-v1.0-ONNX
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- Librería kokoro-js en NPM: https://npmjs.com/package/kokoro-js
- Conversor texto-fonema Misaki: https://github.com/hexgrad/misaki
- Configuración del modelo base (mapeo de fonemas): https://huggingface.co/hexgrad/Kokoro-82M/blob/785407d1adfa7ae8fbef8ffd85f34ca127da3039/config.json
