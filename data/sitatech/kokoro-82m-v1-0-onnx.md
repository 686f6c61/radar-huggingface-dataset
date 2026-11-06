# sitatech/Kokoro-82M-v1.0-ONNX

## Resumen

Kokoro-82M-v1.0-ONNX es la conversión a formato ONNX del modelo de síntesis de voz Kokoro-82M, desarrollado originalmente por hexgrad y empaquetado por sitatech para su uso con la librería transformers.js. Se trata de un modelo text-to-speech (TTS) de solo 82 millones de parámetros que convierte texto en audio a 24 kHz, con una calidad que su autor describe como "frontier" para su tamaño. La versión aquí descrita está pensada para inferencia en JavaScript/Node.js y en Python mediante ONNX Runtime, lo que facilita su despliegue en entornos web y de borde sin depender de frameworks de deep learning pesados.

El modelo resuelve el problema de generar voz sintética de calidad razonable con un coste computacional muy bajo, lo que lo hace adecuado para aplicaciones interactivas, lectura de contenido o asistentes embebidos. Su relevancia actual radica en que ofrece una alternativa ligera y de licencia Apache 2.0 frente a sistemas TTS propietarios o modelos mucho más grandes, y su formato ONNX permite ejecutarlo en navegador o en dispositivos con recursos limitados.

La arquitectura subyacente es un modelo de síntesis neuronal basado en fonemas (texto a fonemas mediante Misaki, luego a identificadores y finalmente a audio), con un vector de estilo para controlar la voz y la velocidad. El contexto de tokens está limitado a 512 posiciones (dejando espacio para tokens de relleno), lo que restringe la longitud de cada fragmento de texto a sintetizar. El repositorio ocupa 1,4 GB e incluye múltiples cuantizaciones del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo TTS neuronal (texto a fonemas a audio), exportado a ONNX; arquitectura interna no detallada en la informacion disponible |
| Parametros totales | 82 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (se recomienda dejar espacio para tokens de relleno, maximo 510 tokens utiles) |
| Tipos de cuantizacion | fp32, fp16, q8, q4, q4f16, uint8, uint8f16, q8f16 (segun variantes ONNX incluidas) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (model.onnx, model_fp16.onnx, model_quantized.onnx, model_q8f16.onnx, model_uint8.onnx, model_uint8f16.onnx, model_q4.onnx, model_q4f16.onnx) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo original Kokoro-82M mas alla de que es un sistema TTS neuronal que trabaja a nivel de fonemas. El flujo de inferencia descrito en la model card implica tres etapas: conversion de texto a fonemas (mediante la libreria Misaki), mapeo de fonemas a identificadores numericos segun la configuracion del modelo, y generacion de audio a partir de esos identificadores junto con un vector de estilo de 256 dimensiones y un parametro de velocidad. El modelo produce audio a 24 kHz.

No se proporcionan en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. La exportacion a ONNX y las distintas cuantizaciones (fp16, q8, q4, uint8) son las caracteristicas tecnicas destacables de esta version, orientadas a reducir el coste de inferencia y el tamano del modelo.

## Capacidades

- Generacion de voz sintetica a partir de texto en ingles, con salida de audio a 24 kHz.
- Control de la voz mediante seleccion entre multiples voces predefinidas (voces americanas femeninas y masculinas, entre otras).
- Control de la velocidad del habla mediante el parametro `speed`.
- Conversión de texto a fonemas mediante la libreria Misaki (paso previo necesario en Python; en JavaScript la libreria kokoro-js lo gestiona).
- Ejecucion en JavaScript/Node.js mediante transformers.js y en Python mediante ONNX Runtime.
- Soporte de multiples cuantizaciones para adaptar el modelo a distintos presupuestos de memoria y latencia.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni vision o audio de entrada; es exclusivamente un modelo TTS.

## Casos de uso

- Lectura de articulos y contenido web: el modelo puede convertir texto en audio para aplicaciones de lectura por voz, con la ventaja de su bajo coste computacional y su capacidad de ejecutarse en el navegador mediante transformers.js.
- Asistentes de voz embebidos: al ser un modelo de 82M de parametros y formato ONNX, puede integrarse en dispositivos con recursos limitados para generar respuestas habladas en tiempo real, siempre que el texto se fragmente en trozos de hasta 510 tokens.
- Accesibilidad para personas con discapacidad visual: generacion de audio a partir de texto de interfaz o documentos, con seleccion de voz y velocidad para adaptarse a preferencias del usuario.
- Prototipado rapido de aplicaciones TTS: la disponibilidad de multiples cuantizaciones (q4, q8, fp16) permite probar el modelo en entornos de desarrollo sin GPU dedicada y escalar posteriormente.
- Generacion de narraciones para videos o podcasts: el control de velocidad y la variedad de voces permiten producir locuciones para contenido multimedia, aunque la longitud de contexto de 512 tokens obliga a segmentar el texto.
- Educacion y aprendizaje de idiomas: sintesis de frases en ingles para practicar pronunciacion, con la posibilidad de ajustar la velocidad del habla.
- Pruebas de integracion en pipelines de CI/CD: la version ONNX y la libreria kokoro-js facilitan la inclusion de pruebas automatizadas de generacion de audio en entornos JavaScript.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un modelo de 82M de parametros, las variantes cuantizadas (q4, q8, uint8) reducen considerablemente el uso de memoria, aunque no se proporcionan cifras concretas.
- GPU recomendadas: no se especifican modelos concretos; el formato ONNX permite ejecucion en CPU y en GPU compatibles con ONNX Runtime.
- Cabe en GPU de consumo: si, previsiblemente en la mayoria de GPU de consumo gracias al reducido tamano del modelo y a las cuantizaciones disponibles, aunque no se aportan datos de VRAM exactos.
- Opciones de despliegue: transformers.js (JavaScript/Node.js), ONNX Runtime (Python), y las variantes ONNX incluidas en el repositorio.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada. Se indica "no disponible" para una comparativa cuantitativa fiable.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Kokoro-82M-v1.0-ONNX (este) | 82M | 512 tokens | Ingles | Apache 2.0 | ONNX |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta ingles; no se documentan otros idiomas.
- La longitud de contexto de 512 tokens limita la cantidad de texto que puede sintetizarse en una sola llamada; es necesario segmentar textos largos.
- El modelo requiere un paso previo de conversion de texto a fonemas (Misaki) en Python, lo que anade complejidad al pipeline.
- No se han publicado datos de sesgos, riesgo de alucinacion (en el sentido de errores de pronunciacion o contenido) ni evaluaciones de calidad subjetiva en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones de las voces incluidas y del modelo base original.
- Al ser una conversion ONNX de un modelo de terceros, la calidad puede variar respecto al modelo original en funcion de la cuantizacion elegida.
- No se documentan garantias de latencia ni de calidad en produccion; se recomienda validar con muestras representativas antes de desplegar.

## Enlaces

- [Hugging Face: sitatech/Kokoro-82M-v1.0-ONNX](https://huggingface.co/sitatech/Kokoro-82M-v1.0-ONNX)
- [Modelo base: hexgrad/Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M)
- [Libreria kokoro-js en NPM](https://npmjs.com/package/kokoro-js)
- [Misaki (conversion de texto a fonemas)](https://github.com/hexgrad/misaki)
- [Configuracion del modelo base (mapeo de fonemas a ids)](https://huggingface.co/hexgrad/Kokoro-82M/blob/785407d1adfa7ae8fbef8ffd85f34ca127da3039/config.json#L34-L148)
