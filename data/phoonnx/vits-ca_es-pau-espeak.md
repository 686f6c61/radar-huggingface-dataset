# Phoonnx/vits-ca_es-pau-espeak

## Resumen

vits-ca_es-pau-espeak es un modelo de sintesis de voz (text-to-speech) en catalan desarrollado originalmente por el HiTZ Center (Universidad del Pais Vasco) bajo el identificador HiTZ/TTS-ca_pau, y empaquetado en formato ONNX por Phoonnx para su uso con la libreria phoonnx. Se trata de un modelo VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), una arquitectura end-to-end que combina un encoder de texto, un decoder acustico y un vocoder generativo en un unico modelo entrenado de forma adversarial.

El modelo resuelve la conversion de texto en catalan (ca-ES) a audio inteligible, recibiendo como entrada fonemas en alfabeto IPA generados mediante espeak-ng. Su relevancia actual reside en que ofrece una alternativa ligera (0,1 GB de repositorio) y de licencia permisiva (Apache 2.0) para sintesis de voz en catalan, un idioma con menos recursos TTS que el castellano o el ingles, y su empaquetado ONNX facilita el despliegue en entornos Python y en el asistente OVOS.

La ficha se basa exclusivamente en la model card publicada por Phoonnx; no se dispone de informacion sobre el proceso de entrenamiento, los datos utilizados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end, entrenamiento adversarial) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | catalan (ca-ES) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz end-to-end que integra en un solo modelo un encoder de texto condicionado por alineamiento monotono, un prior variacional sobre representaciones acusticas latentes, un decoder generativo y un discriminador adversarial entrenado de forma conjunta. Este diseno elimina la necesidad de pipelines de dos etapas (modelo acustico + vocoder separado) y permite generar waveform directamente a partir de la secuencia de fonemas.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el corpus de habla catalana utilizado ni si se aplicaron tecnicas de RLHF o ajuste fino adicional. La model card indica unicamente que el modelo procede de HiTZ/TTS-ca_pau y que la entrada es texto fonemizado mediante espeak-ng (con alternativa espyak, un port de espeak-ng que puede producir fonemas ligeramente distintos y provocar errores de pronunciacion en algunas palabras).

## Capacidades

- Sintesis de voz en catalan (ca-ES) a partir de texto plano, con salida en formato WAV.
- Fonemizacion mediante espeak-ng (EspeakPhonemizer de scriptconv_copyleft.phonemizers.mul) o mediante el port espyak incluido en el extra `phoonnx[espeak]`.
- Integracion con el asistente OVOS a traves del plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Ejecucion en navegador mediante phoonnx.js, con demo disponible en tigregotico.pt/demo.
- No soporta tool calling, agentes, razonamiento multi-step, vision ni audio de entrada; es exclusivamente un modelo TTS.
- No se documentan capacidades multilingues: solo catalan.

## Casos de uso

- Lectura de contenido en catalan: el modelo convierte articulos, noticias o documentacion a audio WAV mediante `voice.synthesize_wav(text, wav_file)`, adecuado para generar versiones accesibles de contenido web en catalan.
- Asistente de voz domestico con OVOS: al integrarse como plugin `ovos-tts-plugin-phoonnx` y configurarse en `mycroft.conf`, permite dotar de voz catalana a un asistente local sin depender de servicios en la nube.
- Audiolibros y narracion: la sintesis directa texto-a-waveform de VITS permite generar narraciones de parrafos largos por lotes, con un modelo de solo 0,1 GB que cabe en cualquier equipo.
- Interfaces de voz en aplicaciones catalanoparlantes: integrable en Python mediante la API `TTSModelManager` para leer mensajes de sistema, notificaciones o respuestas de formularios en catalan.
- Prototipado de productos de accesibilidad: al ser Apache 2.0 y ONNX, permite validar rapidamente una experiencia de lectura por voz en catalan sin coste de licencia ni infraestructura GPU dedicada.
- Pruebas de pronunciacion y fonetica: la entrada por fonemas espeak-ng permite controlar la transcripcion IPA y comparar variantes (espeak-ng frente a espyak) para detectar errores de pronunciacion en palabras concretas.
- Demos web de TTS: phoonnx.js ejecuta voces VITS en el navegador, lo que permite ofrecer una demo de sintesis catalana sin backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; por el tamano del repositorio (0,1 GB) se trata de un modelo muy ligero, pero no se confirma el consumo exacto.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la informacion; el tamano del artefacto sugiere que podria ejecutarse en CPU, pero no se documenta.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y phoonnx.js en navegador. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Contexto/entrada |
|---|---|---|---|---|---|
| vits-ca_es-pau-espeak (Phoonnx) | VITS | ca-ES | Apache 2.0 | ONNX | fonemas espeak-ng |
| HiTZ/TTS-ca_pau | VITS | ca-ES | Apache 2.0 | no disponible | no disponible |
| Otros modelos TTS en catalan | no disponible | ca | no disponible | no disponible | no disponible |

El unico comparable directo documentado es el modelo upstream HiTZ/TTS-ca_pau, del que este empaquetado deriva. No se dispone de informacion sobre alternativas TTS en catalan con la que establecer una comparacion cuantitativa de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Solo soporta catalan (ca-ES); no se documentan otros idiomas.
- La calidad de pronunciacion depende de la fonemizacion: con espyak algunos fonemas difieren de espeak-ng y el modelo puede pronunciar mal ciertas palabras. Se recomienda instalar espeak-ng nativo.
- No se dispone de informacion sobre sesgos de voz (genero, acento, edad) ni sobre la diversidad del corpus de entrenamiento.
- Riesgo de alucinacion acustica o artefactos en textos fuera de dominio no documentado; no hay benchmarks publicados que lo cuantifiquen.
- La licencia Apache 2.0 la declara el modelo upstream en su model card; conviene verificar los terminos exactos en HiTZ/TTS-ca_pau antes de uso comercial.
- El modelo esta empaquetado para phoonnx; su uso fuera de esa libreria requiere conversion o carga manual del ONNX, sin garantias documentadas.
- No apto para tareas de comprension, razonamiento, codigo o vision: es exclusivamente un sintetizador de voz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-ca_es-pau-espeak
- Modelo upstream: https://huggingface.co/HiTZ/TTS-ca_pau
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
