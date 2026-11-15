# Phoonnx/pockettts-es-kyutai

## Resumen

pockettts-es-kyutai es un modelo de sintesis de voz (text-to-speech) en castellano derivado de Pocket TTS, el sistema TTS desarrollado por Kyutai. El repositorio, publicado por Phoonnx, no contiene los pesos originales en su formato nativo, sino una conversion a ONNX empaquetada para phoonnx, la libreria de sintesis de voz en Python del mismo autor, con integracion directa en el ecosistema OVOS (OpenVoiceOS). El modelo esta pensado para sintetizar habla en espanol a partir de texto codificado como puntos de codigo Unicode.

La relevancia de esta ficha es practica: se trata de un artefacto de despliegue, no de un modelo nuevo. Su valor esta en que permite ejecutar Pocket TTS en espanol sobre runtime ONNX, lo que facilita la inferencia en CPU y en entornos sin dependencias de PyTorch, y en que incluye 26 voces predefinidas listas para usar. El repositorio ocupa 0,8 GB y esta liberado bajo licencia CC-BY-4.0.

La informacion publicada es escasa: no se detallan parametros, arquitectura interna, datos de entrenamiento ni resultados de benchmarks. Esta ficha refleja unicamente lo que la model card y los metadatos del repositorio declaran de forma explicita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pocket TTS (arquitectura interna no detallada en la informacion disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en formato ONNX) |
| Idiomas soportados | espanol (`es`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | puntos de codigo Unicode del texto |
| Voces incluidas | 26 voces (`pockettts/es/alba`, `anna`, `azelma`, `bill_boerst`, `caro_davy`, `charles`, `cosette`, `eponine`, `estelle`, `eve`, `fantine`, `george`, `giovanni`, `jane`, `javert`, `jean`, `juergen`, `lola`, `marius`, `mary`, `michael`, `paul`, `peter_yearsley`, `rafael`, `stuart_bell`, `vera`) |
| Tamano del repositorio | 0,8 GB |
| Pipeline | text-to-speech |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

El modelo es una conversion a ONNX del modelo Pocket TTS de Kyutai para espanol, cuyo origen es `kyutai/pocket-tts/languages/spanish`. La conversion intermedia procede de `KevinAHM/pocket-tts-onnx/onnx/spanish` y el empaquetado final lo realiza Phoonnx para su libreria phoonnx. No se publica informacion sobre el numero de parametros, la topologia interna de la red (transformer, difusion, codec neuronal u otra), el volumen de datos de entrenamiento, la composicion del corpus ni si se aplicaron tecnicas de ajuste como RLHF o DPO.

El unico detalle tecnico documentado es el front-end de texto: phoonnx delega la normalizacion en la libreria scriptconv, que aplica el `UnicodeCodepointPhonemizer` de `scriptconv.phonemizers.base`. Es decir, el texto no se convierte a fonemas IPA ni a una representacion fonetica intermedia, sino que se tokeniza directamente como puntos de codigo Unicode. Este diseno simplifica el pipeline pero traslada al modelo toda la responsabilidad de la conversion grafema-fonema y de la resolucion de abreviaturas o numeros, que no se normalizan en esta etapa.

## Capacidades

- Sintesis de voz en espanol a partir de texto plano, con salida en fichero WAV mediante `voice.synthesize_wav(text, wav_file)`.
- 26 voces predefinidas en castellano, cargables de forma individual a traves del gestor de voces de phoonnx.
- Ejecucion sobre runtime ONNX, sin dependencia de PyTorch en tiempo de inferencia.
- Integracion nativa con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Normalizacion de texto delegada a scriptconv con el fonemizador de puntos de codigo Unicode.
- No se documentan capacidades de clonacion de voz, control de emocion, control de prosodia por SSML, multilinguismo, tool calling ni razonamiento multi-paso.

## Casos de uso

- Asistentes de voz autoalojados en OVOS: el modelo se instala como plugin TTS (`ovos-tts-plugin-phoonnx`) y se selecciona la voz en `mycroft.conf`, de modo que un asistente domestico puede responder en castellano sin servicios en la nube.
- Lectura de articulos y documentos en castellano: la API `synthesize_wav` permite convertir texto a audio en lote para generar versiones habladas de boletines, entradas de blog o documentacion tecnica.
- Sistemas de aviso y megafonia en entornos con recursos limitados: al ejecutarse sobre ONNX y no requerir GPU, encaja en dispositivos embebidos o servidores pequenos que emiten anuncios pregrabados dinamicamente.
- Accesibilidad para personas con discapacidad visual: integrado en lectores de pantalla o en pipelines de conversion de texto a audio bajo demanda, con la ventaja de que el modelo y las voces son locales y no exponen el texto del usuario a terceros.
- Generacion de locuciones para prototipos y demos: las 26 voces permiten producir dialogos con voces diferenciadas en maquetas de aplicaciones o videojuegos antes de contratar grabaciones profesionales.
- Pruebas de regresion de pipelines TTS: al estar empaquetado de forma reproducible con phoonnx y scriptconv, sirve como referencia fija para validar cambios en el front-end de normalizacion de texto o en el runtime de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio pesa 0,8 GB y los pesos se distribuyen en ONNX, por lo que la huella en memoria es del orden del tamano del modelo, pero no se publica el desglose por componente ni el consumo en inferencia.
- GPU recomendadas: no disponible. Al ser un modelo ONNX orientado a phoonnx, el caso de uso documentado es la inferencia en CPU.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; no se documenta ejecucion con CUDA, DirectML ni otros proveedores de ejecucion de ONNX Runtime.
- Opciones de despliegue: phoonnx (Python) y el plugin OVOS `ovos-tts-plugin-phoonnx`. Instalacion con `pip install --pre phoonnx`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Voces | Formato | Licencia | Contexto/parametros |
|---|---|---|---|---|---|---|
| pockettts-es-kyutai (este) | TTS Pocket TTS convertido a ONNX | es | 26 | ONNX | CC-BY-4.0 | no disponible |
| kyutai/pocket-tts (upstream) | TTS original de Kyutai | multiple (incluye es) | no disponible | formato nativo de Kyutai | CC-BY-4.0 (segun la model card del upstream) | no disponible |
| KevinAHM/pocket-tts-onnx | Conversion ONNX intermedia | multiple (incluye es) | no disponible | ONNX | no disponible | no disponible |

No se dispone de datos de rendimiento ni de parametros de ninguno de los tres, por lo que la comparativa se limita a formato, idioma, licencia y numero de voces empaquetadas. No se han identificado en la informacion proporcionada alternativas de otros desarrolladores con las que comparar de forma rigurosa.

## Limitaciones y advertencias

- La informacion tecnica publicada es minima: no hay datos de parametros, arquitectura interna, corpus de entrenamiento ni evaluaciones, lo que impide estimar calidad, sesgos o robustez antes de desplegar.
- El front-end usa puntos de codigo Unicode sin normalizacion fonetica ni expansion de numeros, abreviaturas o simbolos; es previsible que textos con cifras, siglas o caracteres especiales se pronuncien de forma incorrecta, aunque no se documenta el comportamiento exacto.
- Solo soporta espanol (`es`); no se declara variante regional (castellano peninsular frente a otras variantes) ni cobertura de catalan, gallego o euskera.
- Riesgo de alucinacion acustica y artefactos de sintesis no evaluado: al no haber benchmarks ni muestras publicas de calidad, la idoneidad para produccion debe validarse con pruebas propias.
- La licencia CC-BY-4.0 permite uso comercial pero exige atribucion; debe conservarse la atribucion a Kyutai como autor del modelo original y a Phoonnx y KevinAHM por la conversion y el empaquetado.
- El modelo se distribuye como artefacto de despliegue de terceros: la cadena de responsabilidad (upstream Kyutai, conversion ONNX de KevinAHM, empaquetado de Phoonnx) implica que cualquier cambio en el upstream no se refleja automaticamente en este repositorio.
- El repositorio tiene un uso muy bajo (28 descargas, 0 likes) y se creo en noviembre de 2026, por lo que no hay evidencia de comunidad ni de mantenimiento a largo plazo.
- La instalacion requiere la version preliminar de phoonnx (`pip install --pre phoonnx`), lo que implica una API potencialmente inestable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Phoonnx/pockettts-es-kyutai
- Modelo upstream (Pocket TTS, espanol): https://huggingface.co/kyutai/pocket-tts/tree/main/languages/spanish
- Conversion ONNX intermedia: https://huggingface.co/KevinAHM/pocket-tts-onnx/tree/main/onnx/spanish
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion Pocket TTS empaquetada para phoonnx: https://huggingface.co/collections/Phoonnx/pocket-tts-6af8ea95fad812f585a5cb91
