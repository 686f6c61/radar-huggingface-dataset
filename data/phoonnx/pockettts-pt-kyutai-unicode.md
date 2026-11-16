# Phoonnx/pockettts-pt-kyutai-unicode

## Resumen

pockettts-pt-kyutai-unicode es un modelo de sintesis de voz (text-to-speech) en portugues, desarrollado originalmente por Kyutai dentro de su familia Pocket TTS y empaquetado por Phoonnx en formato ONNX para su uso con la libreria `phoonnx`. El modelo resuelve la conversion de texto a audio en portugues con una arquitectura ligera orientada a despliegue en entornos con recursos limitados, y su empaquetado en ONNX facilita la integracion en pipelines de Python y en asistentes de voz basados en OVOS.

La relevancia de esta ficha radica en que se trata de un artefacto de distribucion (un repackaging) mas que de un modelo entrenado desde cero: el autor del modelo original es Kyutai, la conversion a ONNX la realiza KevinAHM y Phoonnx anade la capa de integracion con su libreria. El repositorio ocupa 0,8 GB e incluye 26 voces predefinidas en portugues, lo que lo convierte en una opcion practica para sintesis de voz multiuso en ese idioma.

La informacion publica disponible es limitada: no se detallan el numero de parametros, la longitud de contexto ni los datos de entrenamiento. Esta ficha refleja exclusivamente los datos verificables en la model card y en los metadatos de Hugging Face, indicando explicitamente cuando un dato no esta disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pocket TTS (modelo de sintesis de voz; detalles internos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | portugues (`pt`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | puntos de codigo Unicode del texto (`UnicodeCodepointPhonemizer`) |
| Voces incluidas | 26 voces en portugues |
| Tamano del repositorio | 0,8 GB |
| Libreria de inferencia | `phoonnx` (Python y plugin OVOS) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia Pocket TTS de Kyutai, disenada para sintesis de voz ligera. La model card no proporciona detalles sobre el numero de parametros, la arquitectura interna (si es un transformer, un modelo basado en difusion o un vocoder neuronal), el volumen de datos de entrenamiento ni si se aplicaron tecnicas de RLHF o ajuste fino. Tampoco se documenta la composicion del corpus de audio en portugues utilizado por el modelo original.

La innovacion tecnica destacable en este artefacto no esta en el modelo en si, sino en su empaquetado: la conversion a ONNX realizada por KevinAHM permite ejecutar el modelo sin dependencias de frameworks de deep learning pesados, y la integracion con `phoonnx` anade un front-end de texto basado en `scriptconv`. Este front-end normaliza el texto y lo convierte en puntos de codigo Unicode mediante `UnicodeCodepointPhonemizer`, un enfoque poco habitual que sustituye a los fonemizadores clasicos (IPA o arpabet) por una representacion directa de caracteres.

## Capacidades

- Sintesis de voz en portugues a partir de texto plano, con salida en formato WAV.
- 26 voces predefinidas en portugues (alba, anna, azelma, bill_boerst, caro_davy, charles, cosette, eponine, estelle, eve, fantine, george, giovanni, jane, javert, jean, juergen, lola, marius, mary, michael, paul, peter_yearsley, rafael, stuart_bell, vera).
- Normalizacion de texto de entrada mediante `scriptconv` antes de la sintesis.
- Ejecucion en Python a traves de `phoonnx.model_manager.TTSModelManager`.
- Integracion con asistentes de voz OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Inferencia en formato ONNX, sin requerir el framework original de Kyutai.
- No se documentan capacidades de clonacion de voz, control de emocion, SSML avanzado, multilingue ni tool calling.

## Casos de uso

- Asistentes de voz en portugues sobre OVOS: el plugin `ovos-tts-plugin-phoonnx` permite seleccionar la voz en `mycroft.conf` y sintetizar respuestas del asistente sin infraestructura adicional, gracias al formato ONNX y a la integracion nativa con el ecosistema OVOS.
- Lectura de articulos y notificaciones en portugues: el modelo convierte texto plano en audio WAV, adecuado para sistemas de lectura por voz en aplicaciones de accesibilidad o en paneles de informacion.
- Generacion de audio para contenido educativo: con 26 voces distintas se pueden producir narraciones con diferentes timbres para cursos, audiolibros o material didactico en portugues.
- Prototipado rapido de interfaces de voz: la instalacion via `pip install --pre phoonnx` y la API de `TTSModelManager` permiten integrar sintesis en un script Python en pocas lineas, util para validar productos de voz antes de invertir en infraestructura mayor.
- Sistemas de anuncios automatizados: el modelo puede generar avisos hablados en portugues para transporte publico, comercios o entornos industriales, donde el coste computacional bajo del formato ONNX es una ventaja.
- Investigacion en TTS: el empaquetado ONNX y el front-end basado en puntos de codigo Unicode facilitan experimentar con normalizacion de texto y fonemizacion alternativa en comparacion con pipelines clasicos.
- Integracion en aplicaciones de escritorio o edge: al no depender de frameworks de deep learning pesados, el modelo puede desplegarse en entornos con recursos limitados, aunque no se publican requisitos minimos concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad de sintesis (MOS, WER, MCD), latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,8 GB en disco, lo que sugiere un modelo ligero, pero no se publican requisitos de memoria.
- GPU recomendadas: no disponible. No se documenta si el modelo se ejecuta en GPU o en CPU.
- Compatibilidad con GPU de consumo: no disponible. El formato ONNX sugiere que puede ejecutarse en CPU, pero no se confirma.
- Opciones de despliegue: `phoonnx` (Python) y el plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo TTS.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas que permitan una comparativa rigurosa con otros modelos TTS en portugues. La informacion publica se limita al empaquetado y a la lista de voces.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| pockettts-pt-kyutai-unicode | no disponible | no disponible | pt | CC-BY-4.0 | ONNX |
| Alternativas TTS en portugues | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta portugues (`pt`); no se documenta cobertura de otras lenguas ni variantes regionales.
- No se publican datos sobre sesgos del modelo, calidad de sintesis ni comportamiento en dominios especializados (medico, legal, tecnico).
- Riesgo de alucinacion o artefactos de audio no documentado; al ser un modelo TTS, el riesgo se manifiesta como pronunciacion incorrecta o prosodia anomala, no como texto inventado.
- La licencia CC-BY-4.0 permite uso comercial con atribucion, pero se debe verificar la cadena de licencias del modelo original de Kyutai y de la conversion ONNX de KevinAHM.
- El modelo es un repackaging: no ha sido entrenado por Phoonnx y las mejoras o correcciones dependen de los artefactos upstream.
- La entrada de texto se basa en puntos de codigo Unicode, lo que puede limitar el control fino de pronunciacion en comparacion con fonemizadores IPA.
- No se documentan limites de longitud de texto por sintesis; textos muy largos podrian requerir segmentacion manual.
- El repositorio tiene solo 18 descargas y 0 likes en el momento de la consulta, lo que indica una validacion comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/pockettts-pt-kyutai-unicode
- Modelo original de Kyutai (portugues): https://huggingface.co/kyutai/pocket-tts/tree/main/languages/portuguese
- Conversion ONNX de KevinAHM: https://huggingface.co/KevinAHM/pocket-tts-onnx/tree/main/onnx/portuguese
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion Pocket TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/pocket-tts-6af8ea95fad812f585a5cb91
- Model card de Kyutai Pocket TTS: https://huggingface.co/kyutai/pocket-tts
