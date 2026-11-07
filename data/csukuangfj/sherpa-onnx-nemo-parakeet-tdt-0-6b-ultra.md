# csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-ultra

## Resumen

`sherpa-onnx-nemo-parakeet-tdt-0.6b-ultra` es un paquete de reconocimiento automatico del habla (ASR) offline para la libreria sherpa-onnx. Los pesos fueron entrenados por Moondream como post-entrenamiento del modelo `nvidia/parakeet-tdt-0.6b-v3` de NVIDIA, reutilizando su arquitectura y su tokenizer, y el proyecto sherpa-onnx los exporto a ONNX manteniendo la estructura de grafo de la version v3. Se distribuye en dos variantes: fp32 y int8.

Se trata de un transductor offline completo (encoder, decoder y joiner) que procesa audio mono a 16 kHz y cubre 25 idiomas europeos, entre ellos el espanol. El decoder es de tipo TDT (Token-and-Duration Transducer), una variante del transductor clasico que predice de forma conjunta tokens y duraciones, lo que acelera la decodificacion frente a los transductores convencionales.

Su relevancia actual reside en que ofrece un unico paquete multilingue con licencia permisiva (CC BY 4.0) y formato ONNX listo para produccion, sin dependencia de frameworks de deep learning pesados. Segun las mediciones del propio exportador, Ultra supera a v3 en aleman, frances y espanol, aunque queda por detras de la version v2 (solo ingles) en tareas de ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor NeMo con decoder TDT (encoder, decoder y joiner) |
| Parametros totales | 0.6B (segun denominacion del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; se recomienda segmentar el audio en trozos de 15-20 s cortados en silencios |
| Tipos de cuantizacion | fp32 e int8 |
| Idiomas soportados | 25: bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`encoder.onnx` + `encoder.weights`, `decoder.onnx`, `joiner.onnx`; variantes `.int8.onnx`) |

## Arquitectura y entrenamiento

El modelo es un transductor NeMo con decoder TDT. La arquitectura y el tokenizer provienen de `nvidia/parakeet-tdt-0.6b-v3`; Moondream realizo un post-entrenamiento sobre esos pesos para producir Parakeet Ultra, y sherpa-onnx exporto el resultado a la estructura de grafo de v3 en ONNX. El paquete incluye tres componentes: encoder (con pesos externos en `encoder.weights` en la version fp32), decoder y joiner. Los metadatos del encoder incluyen `tdt` en el campo `url`, lo que indica a sherpa-onnx que debe cargar el joiner como TDT y no como transductor simple.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La innovacion tecnica destacable es la decodificacion TDT, que predice conjuntamente tokens y duraciones para reducir el numero de pasos de decodificacion. La exportacion se realizo con el script `scripts/nemo/parakeet-tdt-0.6b-ultra/` del repositorio sherpa-onnx y se integro en el flujo de trabajo `export-nemo-parakeet-tdt-0.6b-v2.yaml`.

## Capacidades

- Reconocimiento automatico del habla offline sobre audio mono a 16 kHz.
- Transcripcion en 25 idiomas europeos, incluidos espanol, aleman, frances, italiano, portugues, neerlandes, polaco, ruso y ucraniano.
- Decodificacion por streaming de un unico flujo de audio mediante `OfflineRecognizer` de sherpa-onnx.
- Funcionamiento sin conexion y sin dependencias de GPU, al estar exportado a ONNX.
- Dos variantes de precision (fp32 e int8) para ajustar el equilibrio entre exactitud y velocidad.
- No realiza identificacion de idioma: transcribe, pero no informa de que lengua ha detectado.
- No dispone de puntuacion ni capitalizacion integradas de forma garantizada; las evaluaciones publicadas se hicieron con puntuacion y mayusculas eliminadas.

## Casos de uso

- Transcripcion de reuniones y notas de voz multilingues: el modelo cubre 25 idiomas con un unico paquete, por lo que un mismo servicio puede atender usuarios en espanol, aleman o frances sin cambiar de modelo; conviene segmentar el audio en trozos de 15-20 s cortados en silencios.
- Subtitulado de contenido audiovisual: la variante int8 permite procesar audio en CPU con menor huella de memoria, adecuada para pipelines de generacion de subtitulos en lote.
- Asistentes de voz en aplicaciones de escritorio o moviles: al ser ONNX y funcionar offline, se puede integrar en clientes sin enviar audio a la nube, lo que reduce latencia y cumple requisitos de privacidad.
- Indexacion y busqueda de archivos de audio: transcripcion masiva de grabaciones para construir indices de texto sobre los que aplicar busqueda semantica o por palabras clave.
- Accesibilidad: generacion de transcripciones en tiempo real o diferido para personas con discapacidad auditiva en entornos con hablantes de varios idiomas europeos.
- Analisis de llamadas de atencion al cliente: transcripcion de conversaciones para extraer metricas, detectar temas y auditar calidad, con la ventaja de que el modelo no requiere GPU dedicada.
- Documentacion clinica o legal dictada: transcripcion de notas de voz en espanol (3.81 % WER en FLEURS) o aleman (5.20 % WER), con la advertencia de revisar siempre el resultado por el riesgo de errores en terminos especializados.

## Benchmarks y rendimiento

Resultados propios del proyecto exportador sobre el split de test de FLEURS, 300 clips deterministas por idioma, sin puntuacion ni mayusculas, con un unico harness de evaluacion. No son directamente comparables con benchmarks publicados por los autores del modelo.

| Idioma | Ultra (este paquete) | v3 | v2 |
|---|---|---|---|
| Ingles | 8.51 | no disponible en la informacion | 6.48 |
| Aleman | 5.20 | 6.84 | no disponible |
| Frances | 7.48 | 8.69 | no disponible |
| Espanol | 3.81 | 4.55 | no disponible |

En clips cortos de ingles de 15 s o menos (282 clips): v2 6.42, v3 11.01, Ultra 8.56.

Prueba de estres con frases de FLEURS concatenadas y silencios de 0.2 s: la decodificacion del clip completo de 184.6 s alcanzo un 37.65 % WER con +2335 MB de RSS sobre la linea base del modelo cargado; la segmentacion en trozos de 15 s cortados en silencios redujo el WER al 9.54 % con +196 MB. Mediciones realizadas en una unica maquina Linux con CPU.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica de forma directa; el modelo esta pensado para CPU mediante ONNX Runtime. El paquete completo ocupa 2.6 GB en el repositorio, pero la variante int8 es mas pequena y rapida.
- GPU recomendadas: no se especifican en la informacion disponible; el modelo no requiere GPU.
- Cabe en cualquier equipo de consumo: al ejecutarse en CPU con ONNX, no necesita GPU dedicada. La variante int8 es la recomendada para la mayoria de usuarios.
- Opciones de despliegue: sherpa-onnx (Python, C++, C, etc.) mediante `OfflineRecognizer.from_transducer` con `model_type="nemo_transducer"`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo ASR.
- Latencia y throughput: no disponibles. La prueba de estres reporta un incremento de memoria de +196 MB al segmentar en trozos de 15 s frente a +2335 MB al decodificar un clip completo de 184.6 s.
- Memoria: conviene segmentar el audio en trozos de 15-20 s cortados en silencios para evitar degradacion de exactitud y crecimiento de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | WER ingles (FLEURS) | WER espanol (FLEURS) |
|---|---|---|---|---|---|---|
| Parakeet TDT 0.6B Ultra (este paquete) | 0.6B | 25 | CC BY 4.0 | ONNX (fp32, int8) | 8.51 | 3.81 |
| Parakeet TDT 0.6B v3 | 0.6B | 25 | no disponible en la informacion | ONNX (via sherpa-onnx) | no disponible | 4.55 |
| Parakeet TDT 0.6B v2 | 0.6B | 1 (ingles) | no disponible en la informacion | ONNX (via sherpa-onnx) | 6.48 | no aplica |

Segun las mediciones del exportador, Ultra es el mejor de los tres en aleman, frances y espanol, mientras que v2 sigue siendo el mejor en ingles, especialmente en clips cortos (6.42 frente a 8.56 de Ultra). La eleccion depende del idioma principal de la aplicacion: v2 si el ingles es prioritario, Ultra si se necesita cobertura multilingue en un unico paquete.

## Limitaciones y advertencias

- El audio largo debe dividirse en silencios. Decodificar una grabacion completa como un unico clip degrada gravemente la exactitud y aumenta la memoria; se recomienda segmentar en trozos de 15-20 s cortados en silencios y nunca usar ventanas de longitud fija.
- La variante int8 es mas pequena y rapida y es la recomendada para la mayoria de usuarios; la fp32 es la referencia y su salida puede diferir ligeramente.
- El modelo transcribe pero no identifica el idioma detectado; no es un identificador de lengua.
- Las entradas de muy bajo volumen se ven afectadas por un problema del frontend registrado en el repositorio de sherpa-onnx (issue #4024); conviene normalizar la ganancia antes de la inferencia.
- El ingles es el idioma donde los tres modelos difieren mas; si la precision en enunciados largos en ingles es prioritaria, v2 es la opcion preferible.
- Riesgo de alucinacion y errores en terminos especializados: no se documenta un mecanismo de mitigacion, por lo que en dominios clinicos, legales o tecnicos se impone revision humana.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia CC BY 4.0: permite uso comercial con atribucion. El codigo de sherpa-onnx es Apache-2.0. Ni NVIDIA ni Moondream respaldan este paquete.
- Los resultados de benchmarks son mediciones propias del exportador en una unica maquina y no son directamente comparables con los publicados por los autores del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-ultra
- Modelo base Moondream Parakeet Ultra: https://huggingface.co/moondream/parakeet-ultra
- Modelo base NVIDIA parakeet-tdt-0.6b-v3: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Paquete v3 int8 en sherpa-onnx: https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8
- Documentacion de modelos NeMo en sherpa: https://k2-fsa.github.io/sherpa/onnx/nemo/index.html
- Script de exportacion: https://github.com/k2-fsa/sherpa-onnx/tree/master/scripts/nemo/parakeet-tdt-0.6b-ultra
- Flujo de trabajo de exportacion: https://github.com/k2-fsa/sherpa-onnx/blob/master/.github/workflows/export-nemo-parakeet-tdt-0.6b-v2.yaml
- Pull request de exportacion: https://github.com/k2-fsa/sherpa-onnx/pull/4163
- Issue de frontend sobre audio de bajo volumen: https://github.com/k2-fsa/sherpa-onnx/issues/4024
- Licencia del codigo sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx/blob/master/LICENSE
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
