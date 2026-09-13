# JoaoZaokk/parakeet-tdt-0.6b-v3-ggml

## Resumen

parakeet-tdt-0.6b-v3-ggml es una conversion a formato GGML del checkpoint nvidia/parakeet-tdt-0.6b-v3, un modelo de reconocimiento automatico del habla (ASR) de NVIDIA con 0,6 mil millones de parametros y soporte para 25 idiomas europeos con deteccion automatica de idioma. La conversion, mantenida por el usuario JoaoZaokk, no modifica los pesos mas alla de la cuantizacion: reempaqueta el modelo original (distribuido como .nemo) en ficheros .bin compatibles con el motor Parakeet TDT que se incluye en whisper.cpp a partir de la version 1.9.

El problema que resuelve es la falta de una via sencilla para ejecutar Parakeet v3 fuera del ecosistema NeMo de NVIDIA. Al estar en formato GGML con variantes de cuantizacion de entre 356 MB y 1256 MB, el modelo se puede ejecutar en CPU, en GPUs de consumo e incluso en telefonos, sin dependencias de Python ni de CUDA. Segun la model card, la conversion se mantiene para que los enlaces de descarga de las aplicaciones nativas Odysseus y Open WebUI se mantengan estables.

La relevancia actual es doble: por un lado, cubre transcripcion multilingue (25 lenguas, incluidas espanol, aleman, frances, italiano, portugues, neerlandes, polaco, ruso, ucraniano, checo, etc.) en dispositivo; por otro, ofrece una alternativa de pesos abiertos bajo licencia CC-BY-4.0 frente a modelos ASR con licencias mas restrictivas o con requisitos de hardware mucho mayores. No se publican en la informacion disponible datos de entrenamiento, benchmarks ni latencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transducer TDT (Token-and-Duration Transducer), segun la nomenclatura del modelo; checkpoint original en formato .nemo |
| Parametros totales | 0,6 mil millones (aprox., segun el nombre del modelo; la model card no detalla el desglose) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo ASR; la informacion proporcionada no especifica duracion maxima de audio) |
| Tipos de cuantizacion | f16, q8_0, q5_0 y q4_0 (la model card menciona tambien q5_k como opcion para telefonos) |
| Idiomas soportados | 25 idiomas europeos: en, es, de, fr, it, pt, nl, pl, ru, uk, cs, sk, hu, ro, bg, hr, sl, da, sv, fi, et, lv, lt, el, mt; con deteccion automatica de idioma |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGML/GGUF (.bin) para el motor Parakeet de whisper.cpp; no compatible con los ficheros GGUF de mudler/parakeet.cpp |

Tamano de los ficheros publicados:

| Fichero | Cuantizacion | Tamano |
|---|---|---|
| ggml-parakeet-tdt-0.6b-v3-f16.bin | f16 | 1256 MB |
| ggml-parakeet-tdt-0.6b-v3-q8_0.bin | q8_0 | 669 MB |
| ggml-parakeet-tdt-0.6b-v3-q5_0.bin | q5_0 | 434 MB |
| ggml-parakeet-tdt-0.6b-v3-q4_0.bin | q4_0 | 356 MB |

El tamano total del repositorio es de 2,7 GB.

## Arquitectura y entrenamiento

La model card identifica el modelo como Parakeet TDT v3 de NVIDIA, convertido al motor Parakeet TDT integrado en whisper.cpp desde la version 1.9. Esto implica una arquitectura de tipo transducer (familia RNN-T) con prediccion de duracion, orientada a ASR, y una salida de texto a partir de audio. La informacion proporcionada no incluye el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de ajuste con RLHF o DPO; tampoco se detalla si el modelo incorpora puntuacion, mayusculas o marcas de tiempo.

El proceso de conversion es reproducible segun la model card: los pesos se convirtieron desde el checkpoint original con el convertidor propio del motor y despues se cuantizaron con su cuantizador. Cada variante se valido transcribiendo muestras cortas en portugues e ingles antes de subirse. La variante f16 es la conversion sin perdida; q8_0 mantiene una precision casi identica con aproximadamente el 55 % del tamano; q5_0 se presenta como la opcion para telefonos; y q4_0 es la mas pequena a cambio de una perdida de precision descrita como pequena. No se documentan innovaciones adicionales (decodificacion especulativa, atencion lineal ni tecnicas similares) en la informacion disponible.

## Capacidades

- Reconocimiento automatico del habla (speech-to-text) sobre audio de entrada, con salida de texto.
- Deteccion automatica de idioma entre las 25 lenguas europeas soportadas.
- Transcripcion multilingue: ingles, espanol, aleman, frances, italiano, portugues, neerlandes, polaco, ruso, ucraniano, checo, eslovaco, hungaro, rumano, bulgaro, croata, esloveno, danes, sueco, fines, estonio, leton, lituano, griego y maltes.
- Ejecucion en dispositivo (on-device) sobre CPU o GPU a traves de whisper.cpp, sin dependencia de servicios en la nube.
- Cuantizacion agresiva: la variante q4_0 ocupa 356 MB, lo que permite desplegarla en entornos con memoria muy limitada.
- Integracion declarada con aplicaciones nativas Odysseus y Open WebUI mediante rutas de descarga estables.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio como salida. El modelo es exclusivamente ASR.

## Casos de uso

- Transcripcion local en aplicaciones de escritorio y moviles: el modelo se carga con el motor Parakeet de whisper.cpp, de modo que una app puede transcribir audio sin enviar datos a servidores externos; la variante q5_0 (434 MB) o q4_0 (356 MB) encaja en dispositivos con poca memoria.
- Dictado de voz multilingue: al detectar el idioma automaticamente entre 25 lenguas europeas, sirve para usuarios que alternan idiomas dentro de una misma jornada sin tener que seleccionar el idioma manualmente.
- Subtitulado offline de contenido audiovisual: se puede integrar en un pipeline que segmenta el audio, lo pasa al motor y genera el texto para el subtitulado, evitando cuotas de API y costes por minuto.
- Actas y notas de reuniones en entornos corporativos europeos: permite transcribir reuniones en las que participan hablantes de varios idiomas soportados, con el audio procesado en la propia infraestructura.
- Transcripcion de llamadas de atencion al cliente: al ejecutarse en local, facilita el tratamiento de conversaciones con datos personales bajo requisitos de residencia del dato, sin transferencia a terceros.
- Procesamiento de audio sensible en sanidad o ambito legal: la inferencia en dispositivo reduce la exposicion de grabaciones confidenciales y simplifica el cumplimiento de politicas internas de privacidad.
- Generacion de datasets ASR: sirve para transcribir grandes volumenes de audio de forma economica con la variante f16 o q8_0 y usar el resultado como corpus etiquetado para entrenar o evaluar otros sistemas.
- Investigacion en reconocimiento de voz: su tamano reducido (0,6 mil millones de parametros) y su licencia CC-BY-4.0 lo hacen util para experimentos de comparacion con otros sistemas ASR en 25 idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de WER, MMLU ni de ningun otro conjunto de evaluacion, y los resultados de la busqueda web no aportan datos adicionales sobre el modelo o su conversion. La unica referencia de validacion mencionada es que cada variante cuantizada se comprobo transcribiendo muestras cortas en portugues e ingles antes de la subida, sin cifras publicadas.

## Requisitos de hardware

- VRAM o RAM estimada para los pesos: aproximadamente 1,3 GB para f16, 0,7 GB para q8_0, 0,45 GB para q5_0 y 0,4 GB para q4_0. Hay que sumar el consumo del propio runtime y del buffer de audio, por lo que conviene reservar algo mas de margen sobre el tamano del fichero.
- GPU recomendadas: cualquier GPU de consumo moderna es suficiente; no se requiere A100 ni H100. Modelos como RTX 3060, RTX 4060 o superiores pueden ejecutar la variante f16 sin problemas, y las cuantizadas caben en GPUs con 4 GB o menos de VRAM.
- Cabe en GPU de consumo: si, en todas las variantes, incluidas GPUs de gama baja y antiguas, y tambien en modo CPU unicamente.
- Movilidad: la model card describe q5_0 como la opcion adecuada para telefonos, lo que situa el modelo en el rango de dispositivos moviles para las variantes q5_0 y q4_0.
- Opciones de despliegue segun la informacion disponible: whisper.cpp en version 1.9 o superior, invocando el motor Parakeet mediante `parakeet-cli -m <fichero>`; tambien se menciona su uso desde las aplicaciones nativas Odysseus y Open WebUI. No se documenta compatibilidad con vLLM, Ollama, TGI ni con los GGUF de mudler/parakeet.cpp.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Los datos de los modelos alternativos que aparecen en la tabla no forman parte de la informacion proporcionada y se incluyen solo como referencia general de categoria; los datos de rendimiento no estan disponibles para ninguno de ellos en el material consultado.

| Modelo | Parametros | Idiomas | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| parakeet-tdt-0.6b-v3-ggml (esta ficha) | 0,6 mil millones | 25 idiomas europeos | cc-by-4.0 | GGML/GGUF para whisper.cpp | no disponible |
| nvidia/parakeet-tdt-0.6b-v3 (modelo base) | 0,6 mil millones | 25 idiomas europeos | cc-by-4.0 | .nemo (NeMo) | no disponible |
| Whisper large-v3 (referencia de categoria) | aproximadamente 1,5 mil millones | cobertura amplia, superior a 25 idiomas | MIT | safetensors, GGML y otros | no disponible |
| distil-whisper-large-v3 (referencia de categoria) | aproximadamente 0,75 mil millones | cobertura amplia, superior a 25 idiomas | MIT | safetensors, GGML y otros | no disponible |

La diferencia principal frente a las alternativas de la familia Whisper es la via de ejecucion: esta conversion depende del motor Parakeet de whisper.cpp 1.9 o superior, mientras que los modelos Whisper se ejecutan con el motor clasico de whisper.cpp y con otros runtimes. La licencia CC-BY-4.0 exige atribucion, a diferencia de la licencia MIT de Whisper.

## Limitaciones y advertencias

- Modelo exclusivamente ASR: no genera texto libre, no razona, no hace tool calling ni soporta agentes; cualquier uso de ese tipo requiere un modelo adicional.
- No es una publicacion oficial de NVIDIA: se trata de una conversion y un reempaquetado de terceros. La model card indica explicitamente que no se ofrece garantia alguna.
- Compatibilidad restringida: requiere whisper.cpp 1.9 o superior con el motor Parakeet y no es compatible con los ficheros GGUF de mudler/parakeet.cpp. Cargarlo con el runtime equivocado fallara.
- Datos de entrenamiento no disponibles: al no documentarse la composicion del dataset ni el proceso de ajuste, no se pueden evaluar los sesgos especificos del modelo. Cabe esperar sesgos ligados al acento, dialecto, edad, genero y condiciones de grabacion del material de entrenamiento original.
- Riesgo de alucinacion en ASR: en segmentos con ruido, silencio, musica o habla solapada, los sistemas transducer pueden producir texto plausible pero incorrecto. No se documentan mecanismos de mitigacion ni umbrales de confianza.
- Cobertura linguistica limitada a 25 idiomas europeos: no cubre otras lenguas y no hay informacion sobre el rendimiento relativo entre los idiomas soportados ni sobre acentos no nativos.
- Sin cifras de rendimiento publicadas: no hay WER ni ninguna otra metrica que permita estimar la precision antes de desplegar; se recomienda evaluar con datos propios.
- Licencia CC-BY-4.0: permite uso comercial, pero obliga a atribuir a los autores originales (NVIDIA) y a indicar los cambios realizados. La model card pide citar explicitamente a los autores originales.
- Procedencia de la validacion: la unica comprobacion descrita se hizo con muestras cortas en portugues e ingles, lo que no garantiza el comportamiento en el resto de los 24 idiomas declarados.
- Repositorio sin traccion: en el momento de la consulta el repositorio registra 0 descargas y 0 me gusta, por lo que conviene verificar la integridad de los ficheros antes de usarlos en produccion.

## Enlaces

- Repositorio de la conversion: https://huggingface.co/JoaoZaokk/parakeet-tdt-0.6b-v3-ggml
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Motor de ejecucion (whisper.cpp, version 1.9 o superior): https://github.com/ggml-org/whisper.cpp
- Perfil del autor de la conversion: https://huggingface.co/JoaoZaokk
- Los resultados de la busqueda web proporcionados no contienen enlaces relevantes sobre el modelo: las entradas devueltas corresponden a paginas de traduccion de Google y no aportan informacion tecnica sobre esta conversion.
