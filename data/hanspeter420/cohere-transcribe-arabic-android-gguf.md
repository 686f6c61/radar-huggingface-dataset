# Hanspeter420/cohere-transcribe-arabic-android-GGUF

## Resumen

Cohere Transcribe Arabic es un modelo de reconocimiento automático del habla (ASR) especializado en árabe, desarrollado originalmente por CohereLabs. Esta ficha describe la variante cuantizada publicada por el usuario Hanspeter420 bajo el identificador `Hanspeter420/cohere-transcribe-arabic-android-GGUF`, una recuantización en formato GGUF pensada para ejecutarse en CPUs ARM de teléfonos Android mediante el runtime CrispASR, que utiliza el modelo en la aplicación Voice Notes.

El modelo base cuenta con aproximadamente 2.065 millones de parámetros (unos 2.000 millones), lo que lo sitúa en la categoría de modelos ASR de tamaño medio, adecuados para despliegue en dispositivos con recursos limitados. La variante aquí descrita aplica una mezcla de cuantización IQ4_NL (con matriz de importancia) y Q4_0 sobre las proyecciones FFN del codificador, reduciendo el peso del fichero a 1,29 GB frente a los 1,51 GB de la cuantización Q4_K de referencia.

Su relevancia radica en que demuestra que es posible ejecutar un modelo ASR de dos mil millones de parámetros en un teléfono de gama alta con latencia de decenas de segundos para notas de voz de 36 segundos, manteniendo una tasa de error de palabra (WER) competitiva en árabe estándar (3,6 % en FLEURS) y razonable en dialectos (media del 29,2 % en jordano, palestino y sirio).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR basado en transformer con codificador y decodificador; detalles no especificados en la informacion proporcionada) |
| Parametros totales | 2.065.804.048 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mezcla de IQ4_NL (mayoria de pesos, con imatrix) y Q4_0 (proyecciones up/down de la FFN del codificador, 61 % de los pesos); convoluciones pointwise en Q8_0 |
| Idiomas soportados | Arabe (ar) |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (con kernels ARM dotprod/i8mm repackeados en ggml) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base `CohereLabs/cohere-transcribe-arabic-07-2026` mas alla de su naturaleza como sistema de reconocimiento automatico del habla. Se trata de un modelo de aproximadamente 2.065 millones de parametros orientado a transcripcion de audio en arabe. No se especifican en la documentacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica destacable de esta variante concreta reside en la receta de cuantizacion: se aplica IQ4_NL con matriz de importancia a la mayoria de los pesos, mientras que las proyecciones up/down de la FFN del codificador (que representan el 61 % de los pesos) se cuantizan en Q4_0, y las convoluciones pointwise caen a Q8_0. La eleccion de Q4_0 frente a Q4_K se justifica porque ambos tipos de 4 bits disponen de kernels ARM dotprod/i8mm repackeados en ggml, mientras que Q4_K no los tiene. Ademas, el autor menciona un cargador con repackeo de pesos del codificador implementado como parche en la aplicacion, que es necesario para obtener las ganancias de velocidad reportadas.

## Capacidades

- Transcripcion de audio a texto en arabe, incluyendo arabe estandar y variedades dialectales (jordano, palestino, sirio, segun los datos de evaluacion).
- Reconocimiento automatico del habla en tiempo casi interactivo en CPUs ARM de telefonos Android (10,2 s para una nota de voz de 36 s en un OnePlus 12).
- Ejecucion en dispositivo (on-device) sin necesidad de conexion a servidores externos.
- Integracion con el runtime CrispASR y con la aplicacion Voice Notes para Android.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision, audio mas alla de ASR, ni modo de razonamiento explicito.
- Capacidad multilingue limitada al arabe; no se indica soporte de otros idiomas.

## Casos de uso

- Notas de voz en Android: la aplicacion Voice Notes utiliza este modelo para transcribir grabaciones de voz de forma local en el telefono, evitando enviar audio a la nube y preservando la privacidad del usuario. La latencia de 10,2 s para 36 s de audio en un OnePlus 12 lo hace viable para este flujo.
- Transcripcion de reuniones y entrevistas en arabe: el modelo puede procesar grabaciones de conversaciones en arabe estandar con una WER del 3,6 % en FLEURS, adecuada para generar actas o resumenes posteriores.
- Subtitulado de contenido audiovisual en arabe: integrado en un pipeline de postproduccion, permite generar subtitulos automaticos para videos en arabe estandar, con la advertencia de que el rendimiento cae en dialectos.
- Accesibilidad para personas con discapacidad auditiva: transcripcion en tiempo real de conversaciones presenciales en dispositivos moviles, aprovechando la ejecucion on-device.
- Investigacion de campo en linguistica arabe: grabacion y transcripcion de corpus dialectales en zonas sin conectividad, usando el modelo en un telefono con CrispASR.
- Asistentes de voz offline para arabe: integracion como modulo ASR en asistentes embebidos que deben funcionar sin red, con un tamano de fichero de 1,29 GB que cabe en el almacenamiento de un movil moderno.
- Digitalizacion de archivos de audio historicos en arabe: procesamiento por lotes en servidores con CPU, donde la cuantizacion de 4 bits reduce los requisitos de memoria frente al modelo en f16.

## Benchmarks y rendimiento

Los unicos datos de evaluacion publicados en la informacion disponible son los de WER (en porcentaje) sobre 150 clips publicos con decodificacion greedy, comparando esta recuantizacion con la Q4_K de referencia:

| Fichero | Tamano | FLEURS | Jordano | Palestino | Sirio | Media dialectal |
|---|---|---|---|---|---|---|
| q4_k-imatrix (cstr) | 1,51 GB | 3,6 | 28,4 | 36,8 | 25,8 | 30,3 |
| este fichero | 1,29 GB | 3,6 | 27,4 | 34,3 | 26,0 | 29,2 |

Ademas, se reportan tiempos de inferencia para una nota de voz de 36 s en CPU con CrispASR y repackeo de pesos del codificador: OnePlus 12 pasa de 20,1 s a 10,2 s, y Galaxy Note10+ de 50,7 s a 28,1 s, en comparacion con q4_k-imatrix sobre el cargador estandar. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que no son aplicables a un modelo ASR.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el fichero GGUF ocupa 1,29 GB, por lo que se necesita al menos esa cantidad de memoria mas el overhead del runtime; en la practica, entre 1,5 y 2 GB de RAM libre en el dispositivo.
- GPU recomendadas: no se documenta uso de GPU; el modelo esta optimizado para CPU ARM con extensiones dotprod/i8mm.
- CPU objetivo: telefonos Android con ARM dotprod/i8mm (por ejemplo, OnePlus 12 y Galaxy Note10+ segun los datos reportados).
- Cabe en GPU consumer: no se proporcionan datos de ejecucion en GPU; el foco es CPU movil.
- Opciones de despliegue: CrispASR (runtime especifico), con cargador con repackeo de pesos del codificador implementado como parche en la aplicacion Voice Notes. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 10,2 s para 36 s de audio en OnePlus 12 (aproximadamente 3,5x tiempo real) y 28,1 s en Galaxy Note10+ (aproximadamente 1,3x tiempo real), con el cargador con repackeo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Hanspeter420/cohere-transcribe-arabic-android-GGUF (este) | 2.065 M | no disponible | Arabe | Apache 2.0 | GGUF (IQ4_NL/Q4_0) | Optimizado para CPU ARM Android con CrispASR |
| cstr/cohere-transcribe-arabic-07-2026-GGUF (q4_k-imatrix) | 2.065 M | no disponible | Arabe | Apache 2.0 | GGUF (Q4_K) | Referencia de cuantizacion; 1,51 GB; WER dialectal medio 30,3 % |
| CohereLabs/cohere-transcribe-arabic-07-2026 (base) | 2.065 M | no disponible | Arabe | Apache 2.0 | safetensors (presumiblemente) | Modelo original sin cuantizar; sin datos de rendimiento en la informacion disponible |

No se dispone de informacion sobre otros modelos ASR comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta arabe; no se documenta soporte de otros idiomas.
- El rendimiento en dialectos es notablemente inferior al de arabe estandar: WER medio del 29,2 % en jordano, palestino y sirio frente al 3,6 % en FLEURS.
- Los resultados de WER se basan en 150 clips publicos con decodificacion greedy; pueden no ser representativos de dominios o condiciones acusticas distintas.
- La ganancia de velocidad reportada depende de un cargador con repackeo de pesos del codificador implementado como parche en la aplicacion; sin ese parche, los tiempos son los del cargador estandar (20,1 s y 50,7 s respectivamente).
- El modelo esta pensado para CPU ARM con dotprod/i8mm; en otras arquitecturas el rendimiento puede degradarse.
- Riesgo de alucinacion y errores de transcripcion en audio con ruido, acentos no cubiertos o solapamiento de hablantes; no se documentan mitigaciones especificas.
- No se documentan sesgos conocidos ni evaluaciones de robustez en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base y conviene verificar las condiciones del modelo original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hanspeter420/cohere-transcribe-arabic-android-GGUF
- Modelo base: https://huggingface.co/CohereLabs/cohere-transcribe-arabic-07-2026
- GGUF de origen (cstr): https://huggingface.co/cstr/cohere-transcribe-arabic-07-2026-GGUF
- Runtime CrispASR: https://github.com/CrispStrobe/CrispASR
