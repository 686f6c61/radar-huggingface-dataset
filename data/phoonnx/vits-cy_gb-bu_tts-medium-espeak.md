# Phoonnx/vits-cy_gb-bu_tts-medium-espeak

## Resumen

vits-cy_gb-bu_tts-medium-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su uso con la libreria ONNX del mismo nombre. El modelo original procede de Rhasspy, concretamente de la coleccion piper-voices, en la ruta cy/cy_GB/bu_tts/medium, y ha sido reconvertido al formato ONNX para su integracion en pipelines de TTS en Python y en el asistente OVOS. Se trata de una voz concreta para gales (cy-GB), no de un modelo generico multilingue.

El modelo resuelve el problema de sintetizar habla en gales britanico a partir de texto, utilizando fonemas espeak como entrada (alfabeto IPA). Su relevancia radica en que amplia la cobertura de voces Piper disponibles en formato ONNX para una lengua de bajos recursos como el gales, y en que se distribuye con licencia MIT, lo que facilita su uso comercial y su integracion en sistemas de codigo abierto.

El repositorio es pequeno (0,1 GB), lo que es coherente con un modelo VITS de tamano medio orientado a inferencia en CPU. No se dispone de informacion publica sobre el numero exacto de parametros, la longitud de contexto (no aplica a TTS) ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-speech) |
| Tipos de cuantizacion | no disponible (pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | gales britanico (cy-GB) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo condicional que combina un encoder de texto, un predictor de duracion, un normalizing flow y un decoder basado en HiFi-GAN, entrenado de forma end-to-end con perdidas adversarias. VITS produce audio de forma directa a partir de fonemas, sin necesidad de un vocoder externo separado.

La entrada de texto no es texto crudo, sino fonemas espeak en alfabeto IPA, obtenidos mediante espeak-ng (o, alternativamente, la implementacion espyak incluida en phoonnx). El modelo original fue entrenado por Rhasspy dentro del proyecto piper-voices; no se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus, ni sobre si se aplicaron tecnicas de RLHF o DPO (no aplicables en TTS). La innovacion principal del empaquetado de Phoonnx es la conversion a ONNX y la integracion con la libreria scriptconv para normalizacion de texto y fonemizacion.

## Capacidades

- Sintesis de voz (text-to-speech) en gales britanico (cy-GB) a partir de texto.
- Conversion de texto a fonemas espeak en alfabeto IPA mediante espeak-ng o espyak.
- Generacion de audio WAV directamente, sin vocoder externo.
- Integracion con la libreria phoonnx en Python y con el asistente OVOS mediante el plugin ovos-tts-plugin-phoonnx.
- Ejecucion en navegador mediante phoonnx.js (segun la documentacion del proyecto relacionado).
- No soporta tool calling, function calling, agentes, vision, audio de entrada ni razonamiento multi-step; es exclusivamente un modelo de sintesis de voz.
- No es multilingue: esta limitado al gales britanico.

## Casos de uso

- Lectura de contenido en gales: el modelo puede convertir articulos, noticias o documentacion en texto a voz para sitios web y aplicaciones dirigidas a hablantes de gales, aprovechando su fonemizacion espeak especifica para cy-GB.
- Asistentes de voz en OVOS: se integra mediante ovos-tts-plugin-phoonnx y se selecciona en mycroft.conf, permitiendo respuestas habladas en gales en asistentes domesticos de codigo abierto.
- Accesibilidad para personas con discapacidad visual: sintesis de texto en gales para lectores de pantalla y herramientas de accesibilidad, con inferencia en CPU gracias al formato ONNX y al reducido tamano del repositorio (0,1 GB).
- Senalizacion y anuncios automatizados: generacion de avisos hablados en gales para transporte publico, aeropuertos o edificios publicos, donde se requiere una voz consistente y de baja latencia.
- Aprendizaje de idiomas: produccion de audio de pronunciacion en gales a partir de texto, util en aplicaciones educativas que ensenan gales o que comparan la fonetica IPA con la ortografia.
- Prototipado de TTS en navegador: uso de phoonnx.js para demostraciones de sintesis de voz en gales sin backend, segun la demo publica del proyecto.
- Generacion de audiolibros o podcasts en gales: sintesis por lotes de textos largos divididos en frases, con salida WAV mediante voice.synthesize_wav.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; por el tamano del repositorio (0,1 GB) y la arquitectura VITS medium, es previsible que quepa en GPU consumer con menos de 2 GB de VRAM, aunque no se confirma en la documentacion.
- GPU recomendadas: no disponibles; el empaquetado ONNX de phoonnx esta pensado para ejecucion en CPU, y no se documentan requisitos de GPU.
- Compatibilidad con GPU consumer: probable en cualquier GPU con suficiente memoria para un modelo de 0,1 GB, pero no confirmado.
- Opciones de despliegue: phoonnx (Python), plugin ovos-tts-plugin-phoonnx para OVOS, phoonnx.js en navegador. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vits-cy_gb-bu_tts-medium-espeak (este modelo) | VITS | cy-GB | ONNX | MIT | Hugging Face (Phoonnx) |
| Voz original en rhasspy/piper-voices cy/cy_GB/bu_tts/medium | VITS | cy-GB | Piper (ONNX) | MIT | Hugging Face (Rhasspy) |
| Otras voces VITS de la coleccion Phoonnx | VITS | diversos | ONNX | MIT (segun coleccion) | Hugging Face (Phoonnx) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo monoidioma: solo gales britanico (cy-GB); no sintetiza otros idiomas.
- Dependencia de espeak-ng: sin espeak-ng instalado, phoonnx usa espyak, cuyos fonemas difieren en algunos casos y pueden provocar pronunciaciones incorrectas.
- Entrada fonemica: el modelo espera fonemas espeak en IPA, no texto crudo; la calidad depende de la normalizacion y fonemizacion previas de scriptconv.
- Sesgos: no se documentan sesgos especificos, pero al ser una voz entrenada por Rhasspy sobre un corpus no detallado, puede presentar sesgos de prosodia o cobertura limitada de vocabulario.
- Riesgo de alucinacion: en TTS se traduce en pronunciaciones erroneas o prosodia atipica ante texto fuera del dominio de entrenamiento, no en contenido inventado.
- Licencia MIT declarada por el upstream en la model card de rhasspy/piper-voices; se permite uso comercial, pero conviene verificar la procedencia del corpus original, no documentada.
- Repositorio con muy pocas descargas (18) y ningun like en el momento de la consulta, lo que sugiere escasa validacion comunitaria.
- No se documentan datos de entrenamiento, numero de parametros ni benchmarks, lo que limita la evaluacion rigurosa antes de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-cy_gb-bu_tts-medium-espeak
- Upstream (Rhasspy piper-voices): https://huggingface.co/rhasspy/piper-voices/tree/main/cy/cy_GB/bu_tts/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
