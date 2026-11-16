# Phoonnx/pockettts-it-kyutai-unicode

## Resumen

pockettts-it-kyutai-unicode es un modelo de sintesis de voz (text-to-speech) desarrollado originalmente por Kyutai bajo la arquitectura Pocket TTS y empaquetado por Phoonnx en formato ONNX para su uso con la libreria phoonnx. El modelo esta especializado exclusivamente en italiano (`it`) y forma parte de la coleccion de modelos Pocket TTS que Phoonnx distribuye para su ecosistema de sintesis de voz en Python y en el asistente OVOS.

La relevancia de este paquete reside en su formato de despliegue: al estar convertido a ONNX, puede ejecutarse en entornos Python sin depender de frameworks de deep learning pesados, lo que facilita su integracion en asistentes de voz locales, sistemas embebidos y pipelines de TTS en produccion. El repositorio ocupa 0,8 GB e incluye 26 voces italianas predefinidas (alba, anna, azelma, bill_boerst, entre otras).

El modelo resuelve el problema de la sintesis de voz en italiano con un enfoque de front-end basado en puntos de codigo Unicode: el texto se normaliza mediante la libreria scriptconv y se convierte en la secuencia de entrada del modelo mediante el `UnicodeCodepointPhonemizer`. No se dispone de informacion publica sobre el numero de parametros, la longitud de contexto ni los datos de entrenamiento en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pocket TTS (Kyutai) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | italiano (`it`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,8 GB |
| Entrada de texto | puntos de codigo Unicode del texto |
| Voces incluidas | 26 voces italianas |
| Libreria de despliegue | phoonnx (Python / OVOS) |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

La arquitectura corresponde a Pocket TTS, un modelo de sintesis de voz de Kyutai. El paquete distribuido por Phoonnx es una conversion a ONNX del modelo original alojado en `kyutai/pocket-tts/languages/italian`, realizada por KevinAHM en `KevinAHM/pocket-tts-onnx/onnx/italian`. No se dispone de informacion sobre el numero de parametros, la composicion del dataset de entrenamiento, el numero de tokens de audio procesados ni si se aplicaron tecnicas de RLHF o ajuste fino especifico.

La innovacion tecnica destacable de este empaquetado es el front-end de texto: phoonnx delega la normalizacion en scriptconv, que aplica el `UnicodeCodepointPhonemizer` de `scriptconv.phonemizers.base` para transformar el texto en una secuencia de puntos de codigo Unicode que alimenta directamente al modelo ONNX. Este enfoque evita dependencias de fonemizadores especificos por idioma y simplifica el pipeline de inferencia. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Sintesis de voz (text-to-speech) en italiano a partir de texto plano.
- Soporte de 26 voces italianas predefinidas, entre ellas `pockettts/it/alba`, `pockettts/it/anna`, `pockettts/it/azelma`, `pockettts/it/caro_davy`, `pockettts/it/charles`, `pockettts/it/cosette`, `pockettts/it/eponine`, `pockettts/it/estelle`, `pockettts/it/eve`, `pockettts/it/fantine`, `pockettts/it/george`, `pockettts/it/giovanni`, `pockettts/it/jane`, `pockettts/it/javert`, `pockettts/it/jean`, `pockettts/it/juergen`, `pockettts/it/lola`, `pockettts/it/marius`, `pockettts/it/mary`, `pockettts/it/michael`, `pockettts/it/paul`, `pockettts/it/peter_yearsley`, `pockettts/it/rafael`, `pockettts/it/stuart_bell` y `pockettts/it/vera`.
- Generacion de audio WAV mediante la API `voice.synthesize_wav(text, wav_file)` de phoonnx.
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Normalizacion de texto y conversion de script mediante scriptconv.
- No se documentan capacidades de clonacion de voz, control de emocion, tool calling, agentes ni razonamiento multi-step (no aplicables a un modelo TTS).

## Casos de uso

- Asistentes de voz locales en italiano: el modelo se integra en OVOS mediante `ovos-tts-plugin-phoonnx` y permite sintetizar respuestas del asistente sin conexion a servicios en la nube, seleccionando la voz en `mycroft.conf` con una entrada como `{"tts": {"module": "ovos-tts-plugin-phoonnx", "ovos-tts-plugin-phoonnx": {"voice": "pockettts/it/alba"}}}`.
- Lectura de articulos y notificaciones en italiano: el modelo convierte texto plano en audio WAV mediante `synthesize_wav`, adecuado para sistemas de lectura por voz en aplicaciones de accesibilidad o domotica.
- Generacion de locuciones para contenido audiovisual: las 26 voces permiten asignar timbres distintos a personajes o secciones de un video, podcast o audiolibro en italiano.
- Integracion en pipelines de Python sin GPU dedicada: al estar en formato ONNX y pesar 0,8 GB, puede ejecutarse en entornos CPU y en dispositivos con recursos limitados, lo que facilita su inclusion en servicios backend ligeros.
- Prototipado rapido de interfaces conversacionales en italiano: la API de phoonnx (`TTSModelManager`, `load()`, `merge_default_voices()`) permite levantar un sintetizador funcional en pocas lineas de codigo.
- Sistemas de anuncios y megafonia automatizada: la sintesis de texto a WAV permite generar avisos pregrabados o dinamicos en italiano para transporte publico, comercios o edificios.
- Pruebas de calidad de voz y evaluacion de TTS: la disponibilidad de multiples voces y del front-end Unicode permite comparar timbres y comportamientos en un mismo pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,8 GB en disco, lo que sugiere un modelo de pequeno tamano, pero no se especifica el consumo de memoria en ejecucion.
- GPU recomendadas: no disponible. Al ejecutarse mediante ONNX Runtime a traves de phoonnx, puede funcionar en CPU y en GPU compatibles con ONNX Runtime, pero no se detallan modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada en la documentacion; el formato ONNX y el tamano reducido del repositorio hacen plausible su ejecucion en hardware de consumo, pero no se aportan datos verificables.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones de parametros de este modelo, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas de la misma categoria. Como referencia cualitativa, dentro de la propia coleccion Pocket TTS de Phoonnx existen variantes para otros idiomas, pero no se aportan datos comparativos en la informacion disponible.

| Modelo | Idiomas | Formato | Licencia | Parametros | Contexto |
|---|---|---|---|---|---|
| pockettts-it-kyutai-unicode | it | ONNX | CC-BY-4.0 | no disponible | no disponible |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo soporta italiano (`it`); no se documenta soporte multilingue.
- No se dispone de informacion sobre sesgos linguisticos, de genero o de otro tipo presentes en las voces o en los datos de entrenamiento.
- Riesgo de alucinacion no aplicable en el sentido de generacion de texto, pero si existe riesgo de pronunciacion incorrecta o artefactos acusticos en palabras fuera del dominio de entrenamiento, sin datos publicos que lo cuantifiquen.
- La licencia CC-BY-4.0 permite uso comercial siempre que se atribuya la autoria; es necesario conservar la atribucion a Kyutai y a los autores del empaquetado.
- El modelo depende del ecosistema phoonnx y de la version preliminar (`pip install --pre phoonnx`), lo que implica que la API puede cambiar.
- El front-end basado en puntos de codigo Unicode puede no manejar correctamente abreviaturas, numeros o simbolos sin una normalizacion previa adecuada por parte de scriptconv.
- No se documentan limitaciones de longitud de texto de entrada; el comportamiento con textos muy largos no esta especificado.
- No hay informacion sobre latencia, calidad perceptual (MOS) ni tasas de error de pronunciacion, lo que dificulta evaluar su idoneidad para produccion sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/pockettts-it-kyutai-unicode
- Modelo original de Kyutai (italiano): https://huggingface.co/kyutai/pocket-tts/tree/main/languages/italian
- Conversion ONNX de KevinAHM: https://huggingface.co/KevinAHM/pocket-tts-onnx/tree/main/onnx/italian
- Coleccion Pocket TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/pocket-tts-6af8ea95fad812f585a5cb91
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
