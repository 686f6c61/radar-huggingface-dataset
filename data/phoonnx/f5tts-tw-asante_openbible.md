# Phoonnx/f5tts-tw-asante_openbible

## Resumen

f5tts-tw-asante_openbible es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura F5-TTS, desarrollado originalmente por el equipo multilingual-tts y empaquetado por Phoonnx para su libreria de inferencia ONNX. El modelo esta especializado en la variante asante del idioma twi (codigo ISO `tw`), una lengua nigerocongolesa hablada principalmente en Ghana, y fue entrenado sobre el corpus OpenBible, un conjunto de grabaciones y transcripciones biblicas de dominio publico.

El modelo resuelve el problema de la sintesis de voz en una lengua de bajos recursos para la que existen pocos sistemas TTS de calidad. F5-TTS es una arquitectura de sintesis no autorregresiva basada en flow matching que genera mel-espectrogramas a partir de texto y los convierte en audio mediante un vocoder, lo que permite una generacion rapida y paralela en comparacion con los sistemas autorregresivos clasicos.

La relevancia actual del modelo radica en su empaquetado en formato ONNX dentro de la libreria phoonnx, lo que facilita su despliegue en entornos Python y en el asistente OVOS sin necesidad de frameworks de deep learning pesados. El repositorio ocupa 1,4 GB y acumula 28 descargas en el momento de la consulta, con una licencia CC BY-SA 4.0 que permite uso comercial con atribucion y compartir igual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | F5-TTS (flow matching no autorregresivo sobre mel-espectrogramas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos exportados a ONNX) |
| Idiomas soportados | tw (twi, variante asante) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX |
| Tamano del repositorio | 1,4 GB |
| Pipeline | text-to-speech |
| Libreria | phoonnx |
| Autor original | multilingual-tts |
| Empaquetador | Phoonnx |

## Arquitectura y entrenamiento

F5-TTS es un modelo de sintesis de voz no autorregresivo que emplea flow matching para transformar ruido gaussiano en mel-espectrogramas condicionados por el texto de entrada. A diferencia de los sistemas TTS autorregresivos, que generan el audio token a token, F5-TTS produce la secuencia completa de forma paralela, lo que reduce la latencia de inferencia y evita la acumulacion de errores. La arquitectura combina un codificador de texto con un transformer DiT (Diffusion Transformer) que opera sobre la representacion acustica, seguido de un vocoder que convierte el mel-espectrograma en forma de onda.

El modelo original fue entrenado por multilingual-tts sobre el corpus OpenBible en twi asante, un conjunto de grabaciones de lectura biblica con sus transcripciones alineadas. No se dispone de informacion detallada sobre el numero de horas de audio, el numero de tokens de entrenamiento ni sobre si se aplicaron tecnicas de RLHF o DPO, ya que la model card del autor no los documenta. El empaquetado de Phoonnx se limita a exportar los pesos a ONNX y a integrarlos en su libreria de inferencia, sin reentrenamiento adicional.

## Capacidades

- Sintesis de voz a partir de texto en twi asante, con salida de audio en formato de onda.
- Generacion no autorregresiva mediante flow matching, lo que permite inferencia paralela y menor latencia que los modelos TTS autorregresivos.
- Ejecucion sobre runtime ONNX, lo que facilita el despliegue en entornos sin GPU y en dispositivos de recursos limitados.
- Integracion con la libreria phoonnx en Python y con el asistente OVOS.
- Normalizacion de texto y conversiones de script mediante el proyecto complementario scriptconv.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso, al ser un modelo puramente de sintesis de voz.
- No dispone de modo thinking, vision ni audio de entrada; solo acepta texto y produce audio.

## Casos de uso

- Lectura de contenido biblico y textos religiosos en twi asante: el modelo fue entrenado sobre OpenBible, por lo que su dominio principal es la lectura de pasajes escrituristicos con una prosodia adecuada a ese registro.
- Accesibilidad para hablantes de twi con discapacidad visual: permite convertir articulos, documentos o mensajes en audio inteligible en su lengua materna, desplegable sobre ONNX en dispositivos de bajo consumo.
- Asistentes de voz locales en OVOS: al integrarse en la libreria phoonnx, el modelo puede incorporarse a pipelines de asistente domestico que requieran respuestas habladas en twi sin depender de servicios en la nube.
- Preservacion linguistica y digitalizacion: sirve para generar audio de materiales educativos o de dominio publico en twi asante, contribuyendo a la presencia digital de una lengua de bajos recursos.
- Prototipado de aplicaciones de lectura automatica: investigadores pueden usar el modelo como linea base para experimentos de TTS en lenguas nigerocongolesas y comparar con otros sistemas.
- Generacion de avisos y comunicados comunitarios: permite producir mensajes de audio en twi para difusion en radios comunitarias o altavoces publicos, con la ventaja de ejecutarse en local mediante ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el repositorio de 1,4 GB sugiere que los pesos ONNX pueden cargarse en memoria de sistema sin GPU dedicada.
- GPU recomendadas: no disponible; al ejecutarse sobre ONNX Runtime, puede funcionar en CPU y en GPU compatibles con ONNX Runtime (CUDA, DirectML, CoreML).
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del repositorio, aunque no se especifica el consumo exacto de memoria.
- Opciones de despliegue: ONNX Runtime a traves de la libreria phoonnx; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| f5tts-tw-asante_openbible | F5-TTS (flow matching) | tw | ONNX | CC BY-SA 4.0 | Hugging Face (Phoonnx) |
| multilingual-tts/F5-TTS-OpenBible-Twi-Asante | F5-TTS (flow matching) | tw | no disponible | CC BY-SA 4.0 | Hugging Face (multilingual-tts) |
| Otros modelos F5-TTS de la coleccion Phoonnx | F5-TTS (flow matching) | varias lenguas | ONNX | variable | Hugging Face (Phoonnx) |

La comparativa con modelos de otros desarrolladores no esta disponible en la informacion proporcionada. El modelo empaquetado es funcionalmente equivalente al original de multilingual-tts, con la diferencia del formato ONNX y la integracion en phoonnx.

## Limitaciones y advertencias

- Dominio limitado: al entrenarse sobre OpenBible, el modelo puede producir prosodia y vocabulario sesgados hacia el registro biblico y fallar en textos coloquiales, tecnicos o con nombres propios.
- Cobertura de una sola lengua: solo soporta twi asante; no es multilingue y no debe usarse con texto en otras lenguas.
- Riesgo de alucinacion acustica: como todo modelo generativo de audio, puede producir pronunciaciones incorrectas, omisiones o artefactos en palabras fuera del vocabulario de entrenamiento.
- Sin datos de benchmarks: no hay evaluaciones publicas de inteligibilidad (MOS, WER) que permitan estimar su calidad objetiva.
- Restricciones de licencia: CC BY-SA 4.0 exige atribucion y que las obras derivadas se compartan bajo la misma licencia, lo que puede condicionar su integracion en productos propietarios.
- Sin voz listada en el indice de phoonnx: la model card indica que el indice de voces de phoonnx no incluye una voz para este modelo, lo que puede complicar su uso directo sin configuracion manual.
- Empaquetado reciente y con pocas descargas (28), sin validacion comunitaria extensa.
- No dispone de soporte para control de emocion, estilo ni hablante multiple; la salida queda determinada por el texto de entrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/f5tts-tw-asante_openbible
- Modelo original: https://huggingface.co/multilingual-tts/F5-TTS-OpenBible-Twi-Asante
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Proyecto scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion F5-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/f5-tts-6af8ea7f407234f6f1f08b30
