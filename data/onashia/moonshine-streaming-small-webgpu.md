# onashia/moonshine-streaming-small-webgpu

## Resumen

Moonshine Streaming Small WebGPU es una conversión a ONNX del modelo de reconocimiento automático del habla `moonshine-ai/moonshine-streaming-small`, publicada por el usuario onashia con el objetivo de ejecutarlo íntegramente en el navegador mediante ONNX Runtime Web sobre el backend WebGPU. El modelo original, desarrollado por Moonshine AI, está especializado en transcripción de audio en inglés y cuenta con aproximadamente 140 millones de parámetros bajo licencia MIT.

La relevancia de esta build radica en que elimina la dependencia de servidores o GPUs dedicadas para tareas de ASR: el encoder y el decoder se han cuantizado a 8 y 4 bits respectivamente, reduciendo el peso total a unos 141 MB, de modo que la inferencia puede ejecutarse del lado del cliente en navegadores modernos con soporte WebGPU. Esto abre la puerta a aplicaciones de dictado, subtitulado o asistentes de voz que no envían audio a terceros.

La conversión conserva la precisión del modelo original: sobre 150 clips de test de FLEURS en inglés, la WER es del 9,12 % frente al 9,15 % del modelo fp32 original. El modelo base emplea una arquitectura encoder-decoder de tipo transformer orientada a streaming, con un vocabulario de 32 768 tokens y decodificación greedy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (streaming), exportado a ONNX |
| Parametros totales | ~140 M (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa audio en streaming; ventana por frames de 64 dimensiones en cross-attention) |
| Tipos de cuantizacion | Encoder q8 (primer capa fp32), decoder q4 |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | ONNX (`encoder.q8.onnx`, `decoder.q4.onnx`) + `vocab.json` |

## Arquitectura y entrenamiento

El modelo base `moonshine-streaming-small` es un transformer encoder-decoder diseñado para ASR en streaming. El encoder recibe audio crudo a 16 kHz (sin normalizar, en múltiplos de 80 muestras) y produce las claves y valores de cross-attention con forma `[10, 8, frames, 64]`, es decir, 10 capas con 8 cabezas de atención de dimensión 64. El decoder genera un token por ejecución, manteniendo el estado autoregresivo mediante `past_k`/`past_v` y las claves/valores de cross-attention, y devuelve logits sobre un vocabulario de 32 768 piezas.

La build ONNX aplica cuantización post-entrenamiento: pesos de 8 bits en el encoder (dejando la primera capa en fp32 para preservar estabilidad numérica) y de 4 bits en el decoder. La decodificación es greedy, comenzando en el token 1 y deteniéndose en el token 2 o al alcanzar 6,5 tokens por segundo de audio. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens vistos ni si se aplicaron técnicas de RLHF o DPO; estos datos corresponden al modelo base y no se detallan en la información proporcionada.

## Capacidades

- Reconocimiento automático del habla en inglés a partir de audio crudo a 16 kHz.
- Transcripción en streaming: el decoder procesa un token por paso manteniendo estado entre invocaciones.
- Ejecución en navegador mediante ONNX Runtime Web con backend WebGPU.
- Inferencia local sin envío de audio a servidores externos.
- Manejo de vocabulario con piezas byte-level (`<0xNN>`) y marca de espacio (`▁`).
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de capacidades multimodales más allá del audio de entrada (sin visión ni audio generativo).
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Dictado por voz en aplicaciones web: el modelo puede transcribir audio del micrófono en tiempo real dentro del navegador gracias a su decoder en streaming y a su reducido tamaño (141 MB), sin necesidad de backend.
- Subtitulado de vídeos o reuniones en el cliente: la inferencia local con WebGPU permite generar subtítulos en inglés sin subir el audio a un servidor, lo que resulta adecuado para entornos con requisitos de privacidad.
- Asistentes de voz embebidos en páginas web: la transcripción en el navegador habilita comandos de voz para interfaces web sin coste de infraestructura de servidor.
- Herramientas de accesibilidad: conversión de voz a texto para usuarios con dificultades motoras, ejecutándose íntegramente en el dispositivo.
- Prototipado rápido de pipelines ASR: al ser un paquete ONNX ligero, sirve para validar flujos de audio a texto en demos y pruebas de concepto sin desplegar GPUs.
- Aplicaciones offline o de borde: el modelo puede empaquetarse en aplicaciones web progresivas (PWA) que funcionen sin conexión una vez cargado, útil en entornos con conectividad limitada.
- Anotación de audio en investigación: transcripción automática de corpus en inglés para preetiquetado, con la ventaja de ejecutarse localmente y evitar fugas de datos.

## Benchmarks y rendimiento

| Version | WER (FLEURS EN, 150 clips) |
|---|---|
| Modelo original (transformers, fp32) | 9,15 % |
| Esta build ONNX (q8/q4) | 9,12 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, al tratarse de un modelo especializado en ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el peso total de los artefactos es de ~141 MB (encoder 73 MB + decoder 68 MB), por lo que la huella de memoria es reducida.
- GPU recomendadas: cualquier GPU con soporte WebGPU en el navegador (por ejemplo, GPUs integradas modernas o dedicadas de gama media); no se especifican modelos concretos como A100, H100 o RTX 4090 en la información proporcionada.
- Compatibilidad con GPU de consumo: sí, el diseño está orientado a ejecución en navegador sobre hardware de consumo con WebGPU.
- Opciones de despliegue: ONNX Runtime Web con backend WebGPU; los scripts de conversión están en `tools/convert-moonshine-streaming` del repositorio Baa.
- Latencia y throughput: no disponibles; únicamente se indica el límite de decodificación de 6,5 tokens por segundo de audio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Moonshine Streaming Small WebGPU (esta build) | ~140 M | No disponible | WER 9,12 % en FLEURS EN | MIT | ONNX en HF |
| Moonshine Streaming Small (original) | ~140 M | No disponible | WER 9,15 % en FLEURS EN | MIT | Transformers en HF |
| Whisper Small | No disponible en la información | No disponible | No disponible | No disponible | No disponible |
| Whisper Base | No disponible en la información | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificados de benchmarks de los modelos alternativos en la información proporcionada; la comparativa se limita a señalar la equivalencia de precisión entre la build ONNX y el modelo original.

## Limitaciones y advertencias

- Solo soporta inglés; no se ha validado su comportamiento en otros idiomas.
- La cuantización a 4 bits del decoder puede introducir degradaciones en dominios de audio distintos al conjunto de evaluación (FLEURS).
- Riesgo de alucinación y de transcripciones incorrectas en audio con ruido, acentos marcados o solapamiento de hablantes; no se documentan métricas en estas condiciones.
- La decodificación es greedy y está limitada a 6,5 tokens por segundo de audio, lo que puede truncar transcripciones de habla muy rápida.
- Dependencia de WebGPU: navegadores o dispositivos sin soporte no podrán ejecutar el modelo con aceleración.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en 2026-11-12; se trata de una build reciente y sin validación comunitaria amplia.
- Aunque la licencia es MIT, conviene verificar las condiciones del modelo base y de los datos de audio utilizados en producción.
- No se especifican sesgos demográficos o lingüísticos del modelo base en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/onashia/moonshine-streaming-small-webgpu
- Modelo base: https://huggingface.co/moonshine-ai/moonshine-streaming-small
- Repositorio Baa (scripts de conversión en `tools/convert-moonshine-streaming`): no disponible como URL en la información proporcionada.
