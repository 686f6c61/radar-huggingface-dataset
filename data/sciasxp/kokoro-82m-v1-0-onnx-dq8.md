# sciasxp/Kokoro-82M-v1.0-ONNX-dq8

## Resumen

Kokoro-82M-v1.0-ONNX-dq8 es una conversión a ONNX del modelo de síntesis de voz Kokoro-82M, publicada por el usuario sciasxp. El modelo original, desarrollado por hexgrad, es un sistema text-to-speech (TTS) de apenas 82 millones de parámetros que se ha hecho popular por ofrecer una calidad de voz notable con un coste computacional muy reducido. Esta variante concreta aplica una cuantización weight-only de tipo int8 por canal (denominada dq8) sobre los tensores de pesos de mayor tamaño, manteniendo los cálculos en fp32.

La innovación principal de esta exportación es que, a diferencia de otras cuantizaciones q8 basadas en `ConvInteger`, esta versión es compatible con el execution provider WebGPU de ONNX Runtime. Esto abre la puerta a ejecutar el modelo directamente en el navegador con aceleración por GPU, sin necesidad de servidores dedicados ni de infraestructura de inferencia adicional.

El modelo deriva de la conversión ONNX con timestamps de onnx-community, que a su vez parte del Kokoro-82M original de hexgrad. La licencia es Apache-2.0, lo que permite uso comercial. El repositorio ocupa aproximadamente 0,1 GB e incluye además algunos archivos de voces sin modificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS; pesos exportados a ONNX) |
| Parametros totales | 82M (segun nombre del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 weight-only por canal (dq8) con DequantizeLinear; computo en fp32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model_dq8.onnx`) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento en la informacion proporcionada. El modelo base Kokoro-82M es un sistema TTS de 82 millones de parametros, y esta publicacion es una conversion de formato y cuantizacion, no un reentrenamiento.

La innovacion tecnica de esta variante es la estrategia de cuantizacion: los tensores de pesos de gran tamano se almacenan como int8 por canal y se descomprimen mediante `DequantizeLinear`, mientras que el computo se mantiene en fp32. Esto contrasta con la exportacion q8 basada en `ConvInteger` y es lo que permite ejecutar el modelo sobre el execution provider WebGPU de ONNX Runtime. El script de reproduccion (`kokoro_dq8.py`, con comentarios en portugues) permite regenerar el modelo a partir de `model.onnx`. El modelo de origen incluye soporte de timestamps.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto de entrada.
- Generacion de audio con marcas de tiempo (timestamps), heredadas de la conversion de onnx-community.
- Ejecucion en navegador mediante ONNX Runtime con WebGPU.
- Uso de archivos de voz incluidos en el directorio `voices/`.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Soporte de tool calling, agentes o razonamiento multi-paso: no aplica (modelo TTS).

## Casos de uso

- Lectura por voz en aplicaciones web: el modelo puede ejecutarse en el navegador con WebGPU, lo que permite integrar sintesis de voz en una pagina sin enviar el texto a un servidor externo.
- Accesibilidad: conversion de contenido textual (articulos, documentacion) en audio para usuarios con discapacidad visual, aprovechando el reducido tamano del modelo.
- Asistentes conversacionales locales: generacion de respuestas habladas en aplicaciones de escritorio o web que ya dispongan de un LLM local, manteniendo toda la pila en el dispositivo.
- Audiolibros y podcasts generados: sintesis de textos largos por fragmentos con el modelo de 82M, adecuado por su bajo coste computacional.
- Sistemas de navegacion por voz o notificaciones: generacion dinamica de avisos hablados en tiempo de ejecucion en el cliente.
- Prototipado rapido de interfaces de voz: al ser un ONNX ligero (repo de 0,1 GB), permite iterar en demos y pruebas de concepto sin infraestructura GPU dedicada.
- Subtitulado y alineacion temporal: el soporte de timestamps del modelo de origen facilita la sincronizacion de audio con texto en herramientas de transcripcion o doblaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 82M de parametros y cuantizacion int8 weight-only, el modelo es muy ligero (el repositorio completo ocupa 0,1 GB).
- GPU recomendadas: no disponibles en la informacion proporcionada; el modelo esta pensado para ejecutarse sobre ONNX Runtime WebGPU, lo que incluye GPUs integradas y dedicadas accesibles desde el navegador.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el reducido tamano, aunque no se aportan datos concretos de modelos soportados.
- Opciones de despliegue: ONNX Runtime (execution provider WebGPU); otras opciones no disponibles en la informacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| sciasxp/Kokoro-82M-v1.0-ONNX-dq8 | 82M | no disponible | ONNX (int8 dq8) | Apache-2.0 | Compatible con WebGPU |
| onnx-community/Kokoro-82M-v1.0-ONNX-timestamped | 82M | no disponible | ONNX (fp32) | Apache-2.0 | Modelo de origen con timestamps |
| hexgrad/Kokoro-82M | 82M | no disponible | no disponible | Apache-2.0 | Modelo base original |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion int8 weight-only puede introducir degradacion en la calidad del audio respecto al modelo fp32 original; no se aportan mediciones al respecto.
- El modelo solo realiza sintesis de voz; no es adecuado para tareas de texto, razonamiento o codigo.
- No se especifican los idiomas soportados, por lo que no puede confirmarse cobertura multilingue.
- Al ser una conversion de terceros (usuario sciasxp) y no una publicacion oficial de hexgrad, no hay garantias de mantenimiento ni de soporte.
- Aunque la licencia Apache-2.0 permite uso comercial, conviene verificar las condiciones de los archivos de voz incluidos en `voices/`.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Riesgo de artefactos o alucinaciones acusticas inherente a los modelos TTS; no se documentan evaluaciones al respecto.

## Enlaces

- Hugging Face: https://huggingface.co/sciasxp/Kokoro-82M-v1.0-ONNX-dq8
- Modelo de origen ONNX con timestamps: https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX-timestamped/tree/dd4401a9add81ac692d20e240d22ec9dda82cc29
- Modelo base original: https://huggingface.co/hexgrad/Kokoro-82M
