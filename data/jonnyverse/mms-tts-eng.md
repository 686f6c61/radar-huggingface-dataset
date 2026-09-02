# JONNYVERSE/mms-tts-eng

## Resumen

El modelo `JONNYVERSE/mms-tts-eng` es una conversión a formato ONNX del modelo de síntesis de voz `facebook/mms-tts-eng`, perteneciente al proyecto Massively Multilingual Speech (MMS) de Meta. Su propósito es ofrecer una versión compatible con la librería Transformers.js para ejecutar text-to-speech directamente en el navegador o en entornos Node.js, sin necesidad de infraestructura de servidor dedicada. Se trata de un modelo de arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), que genera audio de forma end-to-end a partir de texto, con una frecuencia de muestreo de 16 kHz.

La relevancia de esta conversión radica en que facilita el despliegue de síntesis de voz en aplicaciones web y de escritorio basadas en JavaScript, aprovechando la inferencia local y evitando dependencias de APIs externas. El repositorio incluye pesos ONNX tanto cuantizados como no cuantizados, lo que permite ajustar el equilibrio entre tamaño y calidad según el caso de uso. Aunque el modelo original está entrenado para inglés, esta versión hereda las capacidades del modelo base de Meta, que forma parte de un proyecto más amplio de cobertura multilingüe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | cuantizado y no cuantizado (seleccionable en Transformers.js) |
| Idiomas soportados | ingles (según el modelo base) |
| Licencia | no disponible en el repositorio (el modelo base de Meta tiene licencia CC-BY-NC 4.0, pero no se confirma en esta version) |
| Formato de pesos | ONNX (compatible con Transformers.js) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura VITS, que combina un autocodificador variacional condicional con un decodificador adversarial para generar formas de onda de voz directamente desde secuencias de texto. El modelo original `facebook/mms-tts-eng` fue entrenado por Meta como parte del proyecto MMS, que cubre más de mil idiomas. Para esta versión en inglés, el entrenamiento se realizó con datos de voz y texto correspondientes a ese idioma, aunque no se dispone de detalles específicos sobre el volumen de datos o el proceso de entrenamiento en la información proporcionada.

La conversión a ONNX ha sido realizada por el autor del repositorio para hacer el modelo ejecutable en Transformers.js. No se han introducido cambios en la arquitectura ni en los pesos; solo se ha cambiado el formato para permitir la inferencia en entornos JavaScript. El repositorio incluye tanto la versión cuantizada (por defecto) como la no cuantizada, lo que permite reducir el tamaño del modelo y acelerar la inferencia en dispositivos con recursos limitados.

## Capacidades

- Generacion de voz en ingles a partir de texto, con una frecuencia de muestreo de 16 kHz.
- Sintesis de voz end-to-end sin necesidad de vocoder externo, gracias a la arquitectura VITS.
- Inferencia local en navegador o Node.js mediante Transformers.js.
- Soporte de dos modos de ejecucion: cuantizado (menor tamaño, menor calidad) y no cuantizado (mayor calidad, mayor tamaño).
- No requiere GPU para funcionar; puede ejecutarse en CPU en la mayoria de los casos.
- Compatible con el pipeline `text-to-speech` de Transformers.js.
- No incluye capacidades de vision, tool calling ni razonamiento; es exclusivamente un modelo de sintesis de voz.

## Casos de uso

- Aplicaciones web de lectura de texto en voz alta: el modelo puede integrarse en un sitio web para leer articulos o noticias en ingles directamente en el navegador, sin enviar datos a servidores externos. Gracias a su compatibilidad con Transformers.js, se puede cargar y ejecutar de forma asincrona con pocas lineas de codigo.
- Asistentes virtuales y chatbots con respuesta hablada: al poder ejecutarse en el cliente, se puede generar audio de respuesta en tiempo real para interfaces conversacionales en ingles, reduciendo la latencia de red y los costes de infraestructura.
- Herramientas de accesibilidad para personas con discapacidad visual: el modelo permite convertir contenido textual en audio dentro de aplicaciones de escritorio o web, mejorando la accesibilidad sin depender de servicios de pago.
- Generacion de audiolibros o contenido de podcast automatizado: aunque la calidad no es la de un locutor profesional, puede servir para prototipos o contenidos de bajo coste en ingles, generando narraciones a partir de guiones.
- Educacion y aprendizaje de idiomas: se puede usar para generar pronunciacion de palabras o frases en ingles, facilitando ejercicios de listening o practica de pronunciacion en aplicaciones educativas.
- Pruebas y desarrollo de aplicaciones de voz: al ser un modelo ligero y ejecutable localmente, es util para testear funcionalidades de text-to-speech en entornos de desarrollo sin necesidad de conexion a APIs de pago.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos objetivos sobre calidad de audio, MOS (Mean Opinion Score) o comparaciones con otros modelos TTS en el repositorio ni en los resultados de busqueda consultados.

## Requisitos de hardware

- El modelo es ligero (el repositorio ocupa 0.2 GB) y puede ejecutarse en CPU sin problemas. No se requiere GPU para inferencia basica.
- Para uso en navegador, se recomienda un dispositivo con al menos 2 GB de RAM libre para cargar los pesos ONNX.
- La version cuantizada reduce el consumo de memoria y acelera la inferencia, adecuada para moviles o dispositivos de gama baja.
- En Node.js, el modelo puede ejecutarse en cualquier maquina con Node 18 o superior y suficiente memoria para el proceso.
- No se han publicado datos de latencia o throughput especificos. La velocidad dependera del hardware y de la longitud del texto de entrada.
- Opciones de despliegue: Transformers.js (navegador y Node.js), tambien puede usarse con ONNX Runtime si se desea un entorno fuera de JavaScript.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Ejecucion en JS |
|---|---|---|---|---|---|
| JONNYVERSE/mms-tts-eng | VITS | ingles | ONNX | no disponible | Si (Transformers.js) |
| facebook/mms-tts-eng | VITS | ingles | PyTorch (original) | CC-BY-NC 4.0 (segun informacion publica) | No directamente |
| indicnode/mms-tts-eng | VITS | ingles | PyTorch | no disponible | No directamente |
| Otros TTS como Tacotron2 | Tacotron2 + WaveGlow | varios | PyTorch | variada | No directamente |

La principal diferencia de esta version es su formato ONNX, que permite su uso en entornos JavaScript, algo que los modelos originales de Meta no ofrecen de forma nativa. En cuanto a calidad, no hay datos comparativos objetivos, pero al ser una conversion del mismo modelo base, se espera un comportamiento identico al original.

## Limitaciones y advertencias

- La licencia del repositorio no esta especificada. El modelo base `facebook/mms-tts-eng` tiene una licencia CC-BY-NC 4.0, que restringe el uso comercial. Esta restriccion se hereda probablemente, pero no se confirma en el repositorio, por lo que se recomienda verificar antes de usar en produccion.
- El modelo solo genera voz en ingles. No soporta otros idiomas ni acentos regionales mas alla de los presentes en los datos de entrenamiento originales.
- La calidad de la voz puede ser inferior a la de sistemas comerciales como Google TTS o Amazon Polly, especialmente en entornos ruidosos o con texto complejo.
- No se han publicado evaluaciones de sesgos; el modelo puede reflejar sesgos presentes en los datos de entrenamiento de Meta, aunque no hay informacion especifica.
- Al ser una conversion ONNX, puede haber ligeras diferencias numericas respecto al modelo original en PyTorch, aunque en la practica suelen ser despreciables.
- No se garantiza un rendimiento en tiempo real en dispositivos muy limitados; para aplicaciones criticas se recomienda probar en el hardware objetivo.
- El repositorio no incluye documentacion sobre el proceso de conversion ni sobre los parametros exactos del modelo.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/JONNYVERSE/mms-tts-eng
- Modelo base original: https://huggingface.co/facebook/mms-tts-eng
- Documentacion de Transformers.js: https://huggingface.co/docs/transformers.js
- Paquete NPM de Transformers.js: https://www.npmjs.com/package/@xenova/transformers
- Informacion sobre el modelo en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/mms-tts-eng-facebook
- Informacion sobre el modelo en modeldatabase.com: https://modeldatabase.com/facebook/mms-tts-eng.html
