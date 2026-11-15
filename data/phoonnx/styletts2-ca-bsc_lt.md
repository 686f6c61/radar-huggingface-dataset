# Phoonnx/styletts2-ca-bsc_lt

## Resumen

styletts2-ca-bsc_lt es un modelo de sintesis de voz (text-to-speech) en catalan, desarrollado originalmente por el grupo BSC-LT (Barcelona Supercomputing Center - Language Technologies) y empaquetado por Phoonnx para su ejecucion mediante la libreria ONNX phoonnx. El modelo parte del checkpoint multispeaker BSC-LT/styletts2-catalan-multispeaker y se distribuye como un artefacto listo para inferencia en formato ONNX, lo que elimina la dependencia de PyTorch en produccion.

La arquitectura subyacente es StyleTTS2, un sistema TTS neuronal que combina un generador de estilo con decodificacion basada en difusion y un discriminador de estilo para producir habla con prosodia natural y controlable. El modelo opera sobre fonemas del alfabeto IPA generados por espeak-ng, no sobre texto en crudo, lo que exige un front-end de fonemizacion (scriptconv en el ecosistema phoonnx).

Su relevancia actual radica en dos factores: por un lado, cubre el catalan, un idioma con cobertura limitada en TTS neuronal de alta calidad; por otro, su empaquetado ONNX y su integracion con el asistente OVOS lo hacen desplegable en entornos de asistente de voz locales y de bajos recursos. El repositorio ocupa 0,8 GB y el modelo incluye doce voces predefinidas (bsc/ca-bet, bsc/ca-eli, bsc/ca-eva, entre otras).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 (TTS neuronal con difusion y estilo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | catalan (ca) |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Voces incluidas | 12 (bsc/ca-bet, ca-eli, ca-eva, ca-jan, ca-mar, ca-ona, ca-pau, ca-pep, ca-pol, ca-styletts2, ca-teo, ca-uri) |
| Tamano del repositorio | 0,8 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

StyleTTS2 es un sistema TTS que desacopla el estilo prosodico del contenido linguistico. El generador recibe fonemas y un vector de estilo, y sintetiza la forma de onda mediante un decodificador basado en difusion; un discriminador de estilo, entrenado de forma adversaria, fuerza a que la salida sea indistinguible del habla real en terminos de prosodia y timbre. Esta combinacion permite clonar la voz a partir de audio de referencia, funcionalidad que el empaquetado de phoonnx expone mediante la carga de una voz y el paso de audio de referencia.

El modelo original es multispeaker: el checkpoint BSC-LT/styletts2-catalan-multispeaker fue entrenado sobre un corpus de habla en catalan con multiples locutores, y el empaquetado de Phoonnx selecciona doce identidades de voz concretas. No se dispone en la informacion proporcionada del numero de horas de audio, la composicion del dataset ni si se aplicaron etapas de RLHF o ajuste fino preferencial; estos datos no estan disponibles. La innovacion practica del empaquetado es la conversion a ONNX y la integracion de un front-end de fonemizacion via espeak-ng (o su port espyak), lo que permite inferencia sin PyTorch.

## Capacidades

- Sintesis de voz en catalan a partir de texto, con salida en formato WAV.
- Fonemizacion mediante espeak-ng en alfabeto IPA; el texto se normaliza y convierte con scriptconv antes de entrar al modelo.
- Clonacion de voz a partir de audio de referencia, segun la documentacion de phoonnx.
- Doce voces predefinidas con identidades diferenciadas (femeninas y masculinas segun la nomenclatura de las voces).
- Control de estilo prosodico inherente a la arquitectura StyleTTS2.
- Integracion con OVOS mediante el plugin ovos-tts-plugin-phoonnx, configurable en mycroft.conf.
- Inferencia en ONNX, sin dependencia de PyTorch en tiempo de ejecucion.
- No soporta tool calling, agentes, vision ni audio de entrada; es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz locales en catalan: el modelo se integra en OVOS mediante el plugin ovos-tts-plugin-phoonnx, de modo que un asistente domestico puede responder en catalan sin enviar audio a la nube, lo que reduce latencia y preserva la privacidad.
- Lectura de contenido web y documentos: con la API de phoonnx se puede sintetizar texto articulo a articulo y generar audiolibros o versiones habladas de paginas en catalan, aprovechando la normalizacion de scriptconv para cifras, abreviaturas y simbolos.
- Accesibilidad para personas con discapacidad visual: integrado en lectores de pantalla o aplicaciones de escritorio, el modelo ofrece una voz catalana natural para la lectura de interfaces y contenido, con la ventaja de ejecutarse en local.
- Generacion de voces para videojuegos y contenido multimedia: las doce voces permiten asignar timbres distintos a personajes, y la clonacion de voz facilita crear variantes adicionales a partir de muestras de referencia.
- Sistemas de anuncios y megafonia en catalan: el modelo puede generar avisos pregrabados (estaciones, aeropuertos, comercios) en formato WAV para su reproduccion en bucle, con calidad suficiente para difusion en recintos.
- Prototipado de interfaces conversacionales: investigadores que desarrollan dialogos en catalan pueden usar el modelo para cerrar el bucle de voz en pruebas de usuario sin depender de servicios comerciales de TTS.
- Doblaje y locucion de bajo coste: para contenidos internos o prototipos, la sintesis local evita costes por caracter de las APIs comerciales, a cambio de asumir la licencia GPL-3.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el repositorio ocupa 0,8 GB y el modelo se ejecuta en ONNX, por lo que es probable que quepa en GPUs de gama media, pero no se dispone de cifras oficiales de memoria.
- GPU recomendadas: no disponible; al ser un modelo TTS de tamano moderado, es plausible su ejecucion en GPUs consumer, aunque no hay datos confirmados.
- Ejecucion en CPU: viable en principio al usar ONNX Runtime, si bien no se documenta latencia ni throughput.
- Opciones de despliegue: phoonnx (Python) y el plugin ovos-tts-plugin-phoonnx para OVOS. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.
- Dependencia externa: espeak-ng instalado en el sistema (o el port espyak incluido en el extra `phoonnx[espeak]`); sin el, la fonemizacion falla o produce errores en algunas palabras.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| styletts2-ca-bsc_lt (este modelo) | Catalan | StyleTTS2 | ONNX | GPL-3.0 | Hugging Face, phoonnx |
| BSC-LT/styletts2-catalan-multispeaker | Catalan | StyleTTS2 | PyTorch (upstream) | GPL-3.0 | Hugging Face |
| Otros modelos StyleTTS2 de la coleccion Phoonnx | Multiples | StyleTTS2 | ONNX | segun modelo | Hugging Face |

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos alternativos de otros autores (por ejemplo, sistemas TTS comerciales o de otros proyectos open source) para establecer una comparacion cuantitativa. La comparacion con el checkpoint upstream es directa: este modelo es un empaquetado ONNX del mismo, con el mismo autor original y la misma licencia.

## Limitaciones y advertencias

- Licencia GPL-3.0: el uso comercial implica obligaciones de copyleft sobre el software distribuido que incorpore el modelo; conviene revisar la compatibilidad con el producto antes de desplegarlo.
- Dependencia de espeak-ng: la calidad de la fonemizacion afecta directamente a la pronunciacion; el uso del port espyak puede producir errores en algunas palabras respecto a espeak-ng.
- Cobertura limitada a un solo idioma: el modelo solo sintetiza catalan; el texto en otras lenguas no se procesara correctamente.
- Riesgo de alucinacion acustica: como todo modelo generativo de voz, puede producir artefactos, prosodia incorrecta o pronunciaciones erroneas en textos con nombres propios, siglas o palabras poco frecuentes.
- Sesgos de los datos de entrenamiento: no se documenta la composicion del corpus original, por lo que no puede evaluarse el equilibrio de acentos, generos o edades de las voces.
- Voces fijas: las doce identidades incluidas limitan la variedad; la clonacion de voz requiere audio de referencia y no se detalla su robustez.
- Documentacion escasa: no hay datos publicados de benchmarks, latencia, memoria ni calidad subjetiva (MOS), lo que dificulta una evaluacion previa rigurosa.
- Fecha de creacion del repositorio (2026-11-14) y bajo numero de descargas (26): ecosistema y validacion comunitaria todavia limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/styletts2-ca-bsc_lt
- Modelo upstream: https://huggingface.co/BSC-LT/styletts2-catalan-multispeaker
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion StyleTTS2 de Phoonnx: https://huggingface.co/collections/Phoonnx/styletts2-6af8ea97037f3d7eaf4b89c7
