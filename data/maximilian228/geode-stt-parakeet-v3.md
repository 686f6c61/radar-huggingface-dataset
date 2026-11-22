# Maximilian228/Geode-STT-parakeet-v3

## Resumen

Geode-STT-parakeet-v3 es un paquete de reconocimiento automatico del habla (ASR) en formato sherpa-onnx, derivado del modelo NVIDIA Parakeet TDT 0.6B v3. Lo publica el autor Maximilian228 como componente de inferencia del proyecto Geode, una aplicacion Android que ejecuta reconocimiento de voz de forma local y sin conexion. El modelo resuelve el problema de transcribir audio a texto en dispositivo, sin depender de servicios en la nube, sobre ocho idiomas europeos.

Tecnicamente es una conversion a ONNX del modelo NeMo de NVIDIA, con arquitectura transducer (encoder, predictor y joiner) y cuantizacion int8 aplicada unicamente a los pesos de las capas MatMul. El paquete ocupa 0,9 GB e incluye los tres grafos ONNX mas el fichero de tokens. El modelo base tiene 0,6 mil millones de parametros y esta publicado bajo licencia CC-BY-4.0.

Su relevancia radica en que ofrece una ruta de despliegue movil verificada: el autor reporta un factor de tiempo real (RTF) de 0,183 en un Redmi Note 9 Pro con cuatro hilos, lo que significa que procesa audio aproximadamente 5,5 veces mas rapido que tiempo real en hardware de gama media. Ademas, documenta el impacto de la estrategia de cuantizacion en la tasa de error, un dato poco habitual en paquetes de este tipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transducer NeMo (encoder + predictor + joiner), exportado a ONNX |
| Parametros totales | 0,6 B (modelo base nvidia/parakeet-tdt-0.6b-v3) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 en pesos MatMul (QInt8); convoluciones y LSTM en fp32 |
| Idiomas soportados | en, de, es, fr, it, pt, ru, uk |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (encoder.int8.onnx, decoder.int8.onnx, joiner.int8.onnx, tokens.txt) |

## Arquitectura y entrenamiento

El modelo es un transducer de NeMo, la arquitectura de reconocimiento de voz de NVIDIA que combina un encoder acustico, un predictor (red de prediccion de tokens) y un joiner que fusiona ambas representaciones. La variante TDT (Token-and-Duration Transducer) incorpora prediccion conjunta de token y duracion, lo que permite saltos temporales adaptativos durante la decodificacion. El paquete no incluye informacion sobre el volumen de datos de entrenamiento, la composicion del corpus ni si hubo ajuste por RLHF o DPO; esos detalles corresponden al modelo base de NVIDIA.

La innovacion tecnica documentada por el autor esta en la conversion: se usa el grafo transducer de sherpa-onnx y se aplica cuantizacion int8 solo a los pesos de las capas MatMul, manteniendo convoluciones y LSTM en fp32. El autor justifica esta decision con datos: la cuantizacion int8 estandar de sherpa-onnx (todos los operadores, QUInt8) degrada la tasa de error de palabra hasta 6 puntos en estos idiomas (por ejemplo, aleman de 11,3 a 5,4 y ucraniano de 8,8 a 5,7). El script de conversion es `tools/stt/quant_int8.py nemo-mm`.

## Capacidades

- Transcripcion de voz a texto en ocho idiomas: ingles, aleman, espanol, frances, italiano, portugues, ruso y ucraniano.
- Inferencia completamente local y sin conexion, disenada para ejecutarse en dispositivos Android.
- Decodificacion en streaming o por segmentos mediante el runtime sherpa-onnx, con soporte de multiples hilos.
- Modelo de tipo transducer con decodificacion TDT (token y duracion), adecuado para audio continuo.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modos de pensamiento.
- No se documentan capacidades de vision, audio generativo ni traduccion; es exclusivamente ASR.

## Casos de uso

- Dictado por voz en aplicaciones Android sin conexion: el modelo se integra mediante sherpa-onnx y transcribe en el dispositivo, lo que permite dictar en entornos sin red o con requisitos de privacidad estrictos.
- Subtitulado local de reuniones y notas de voz: con un RTF de 0,183 en un Snapdragon 720G, un clip de 10 segundos se procesa en menos de 2 segundos, lo que hace viable la transcripcion casi en tiempo real en movil.
- Asistentes de voz para aplicaciones de accesibilidad: la ejecucion offline y el bajo consumo de un modelo de 0,6 B permiten ofrecer entrada por voz a usuarios con movilidad reducida sin enviar audio a terceros.
- Transcripcion multilingue en soporte al cliente: los ocho idiomas cubiertos (incluidos ruso y ucraniano) permiten procesar conversaciones en centros de atencion con diversidad linguistica europea, manteniendo los datos en la infraestructura propia.
- Procesamiento por lotes en servidores de gama baja: al ser ONNX int8, puede desplegarse en CPU sin GPU para transcribir archivos de audio en pipelines internos, con un coste de memoria de aproximadamente 1 GB (pico de RSS de 1076 MB medido en movil).
- Investigacion en ASR multilingue de bajo coste: sirve como referencia reproducible para comparar estrategias de cuantizacion, ya que el autor publica las tasas de error por idioma con la configuracion exacta del paquete.
- Aplicaciones de campo o kioscos sin conectividad: terminales de registro de incidencias o formularios por voz en ubicaciones remotas donde no hay acceso a servicios de ASR en la nube.

## Benchmarks y rendimiento

Tasas de error medidas por el autor sobre el conjunto de test FLEURS (normalizado: sin mayusculas ni puntuacion), con 30 enunciados por idioma, usando los ficheros int8 del paquete en CPU con sherpa-onnx:

| Idioma | Metrica | Error % | Enunciados |
|---|---|---|---|
| en | WER | 5,4 | 30 |
| de | WER | 5,43 | 30 |
| es | WER | 3,07 | 30 |
| fr | WER | 6,0 | 30 |
| it | WER | 2,05 | 30 |
| pt | WER | 5,15 | 30 |
| ru | WER | 7,79 | 30 |
| uk | WER | 5,69 | 30 |

Rendimiento en dispositivo (Redmi Note 9 Pro, Snapdragon 720G, sherpa-onnx v2.0.1 CLI, 4 hilos):

| Metrica | Valor |
|---|---|
| Tiempo de carga | 4,6 s |
| RTF (clip de 10 s) | 0,183 |
| Pico de RSS (VmHWM) | 1076 MB |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- Memoria: pico de RSS de 1076 MB medido en movil con el paquete int8; en escritorio se puede esperar un consumo del mismo orden.
- CPU: funciona en ARM de gama media (Snapdragon 720G verificado) con 4 hilos; no requiere GPU.
- GPU recomendadas: no disponibles ni necesarias; el paquete esta pensado para inferencia en CPU. No se documenta soporte CUDA.
- Cabe en cualquier movil Android moderno con al menos 1,5 GB de RAM libre; tambien en mini-PC y Raspberry Pi con memoria suficiente.
- Despliegue: runtime sherpa-onnx (CLI y librerias). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que es un modelo ASR y no un LLM.
- Latencia y throughput: RTF de 0,183 en Snapdragon 720G con 4 hilos; el rendimiento en otros SoC no esta documentado.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Geode-STT-parakeet-v3 | 0,6 B | 8 (en, de, es, fr, it, pt, ru, uk) | ONNX int8 (sherpa-onnx) | CC-BY-4.0 | Paquete movil verificado, WER 2,05-7,79 % en FLEURS |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6 B | no disponible en la informacion | NeMo (pesos originales) | CC-BY-4.0 | Modelo base; requiere NeMo para inferencia |
| Whisper small | no disponible | multilingue | multiples | MIT | Referencia habitual de ASR multilingue; sin datos comparativos en esta ficha |
| Whisper large-v3 | no disponible | multilingue | multiples | MIT | Mayor coste computacional; sin datos comparativos en esta ficha |

No se dispone de datos de benchmarks cruzados con estas alternativas en la informacion proporcionada; la comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Los resultados de WER se han medido con solo 30 enunciados por idioma, una muestra reducida que limita la significacion estadistica de las cifras.
- El modelo hereda los sesgos del corpus de entrenamiento de NVIDIA Parakeet TDT 0.6B v3; no se documenta analisis de sesgos en esta ficha.
- Riesgo de alucinacion y errores en audio con ruido, acentos no representados o vocabulario tecnico; no se aportan datos al respecto.
- La cobertura linguistica se limita a ocho idiomas; no incluye catalan, gallego, euskera ni otras lenguas del Estado.
- La cuantizacion int8 solo en MatMul es una decision del autor; usar la cuantizacion estandar de sherpa-onnx puede degradar el WER hasta 6 puntos segun sus mediciones.
- La licencia CC-BY-4.0 permite uso comercial con atribucion obligatoria a NVIDIA (modelo base), a k2-fsa/sherpa-onnx (grafo ONNX) y al proyecto Geode (cuantizacion MatMul int8).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion externa de la comunidad.
- No se documentan garantias de mantenimiento ni actualizaciones del paquete.

## Enlaces

- Hugging Face: https://huggingface.co/Maximilian228/Geode-STT-parakeet-v3
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Revision del modelo base: 541d1f99c6b0c3cd0b11a95167540bb8edefd82b
- sherpa-onnx (k2-fsa): https://github.com/k2-fsa/sherpa-onnx
- Conjunto de evaluacion FLEURS: no disponible en la informacion proporcionada.
