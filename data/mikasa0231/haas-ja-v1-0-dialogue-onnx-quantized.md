# mikasa0231/Haas-ja-v1.0-dialogue-onnx-quantized

## Resumen

Haas-ja-v1.0-dialogue-onnx-quantized es una conversion no oficial a ONNX cuantizado del modelo dena-ai/Haas-ja-v1.0-dialogue, un ajuste fino de DeNA sobre third-intelligence/Haas-ja-v1.0 orientado al reconocimiento de habla espontanea en japones (dialogo hablado). El autor de la conversion es mikasa0231, que publica los pesos en formato ONNX listos para ejecutarse con sherpa-onnx sin necesidad de PyTorch, NeMo, Triton ni GPU. El modelo base es un transductor NeMo de tipo TDT (Token-and-Duration Transducer) con vocabulario SentencePiece de 3.072 tokens.

El problema que resuelve es el despliegue de ASR japones en entornos de CPU y en produccion ligera: al convertir el encoder a ONNX con convoluciones pointwise en int8 y pesos MatMul en 4 bits, el paquete completo ocupa unos 0,5 GB y se ejecuta con sherpa-onnx en CPU. La relevancia actual esta en que permite integrar ASR japones de calidad en aplicaciones de escritorio, edge o servidores sin acelerador, con un consumo de memoria medido de 497 MB tras la carga y un pico de 814 MB.

La ficha describe la conversion y sus caracteristicas tecnicas; los detalles de entrenamiento, datos y resultados del modelo original corresponden a la model card de DeNA, que no se ha incluido en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor NeMo TDT (Token-and-Duration Transducer) con encoder, prediction network (KDA) y joint network |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR por utterance; entrada de 16 kHz mono) |
| Tipos de cuantizacion | Encoder: convoluciones pointwise int8 y pesos MatMul en 4 bits; decoder y joiner en float32 |
| Idiomas soportados | Japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (encoder.quantized.onnx + encoder.data, decoder.onnx, joiner.onnx) y tokens.txt |
| Dimension de caracteristicas | 128 |
| Vocabulario | 3.072 tokens SentencePiece mas `<blk>` |
| Tamano del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

El modelo es un transductor TDT de NeMo. Se compone de tres grafos: un encoder (42 MB de grafo mas 411 MB de pesos en encoder.data) cuyas convoluciones pointwise se cuantizan a int8 y cuyos pesos MatMul se reducen a 4 bits; una prediction network de tipo KDA en float32 (15 MB); y una joint network tambien en float32 (12 MB). El decoder no es un LSTM: su estado se empaqueta en los dos tensores de forma `[2, B, 20480]` que sherpa-onnx interpreta como estado LSTM, y la URL en los metadatos del encoder termina en `#tdt` para que sherpa-onnx lo decodifique como TDT.

La conversion sigue la misma receta y disposicion de archivos que oboroge0/Haas-ja-v1.0-onnx-quantized, por lo que cualquier programa capaz de cargar aquel modelo carga este con la misma configuracion (`nemo_transducer`, `feat-dim=128`). Las comprobaciones de fidelidad reportadas por el autor son: diferencia absoluta maxima de 2,6e-5 entre el encoder ONNX float32 y PyTorch en 6 clips; 4,3e-6 en la prediction network frente a NeMo a lo largo de 61 pasos; 5,3e-5 en el joiner; y salida identica entre el decoder empaquetado y el de estado explicito en 41 pasos. No se dispone de informacion sobre el dataset de entrenamiento, numero de tokens ni si hubo RLHF o DPO en la informacion proporcionada.

## Capacidades

- Reconocimiento automatico de habla en japones sobre audio de 16 kHz mono.
- Transcripcion orientada a dialogo hablado (spoken-dialogue), segun el ajuste fino de DeNA.
- Ejecucion en CPU pura mediante sherpa-onnx, sin dependencias de PyTorch, NeMo, Triton ni GPU.
- Decodificacion TDT con busqueda greedy en la configuracion verificada.
- Robustez frente a audio sin habla: en las pruebas del autor, 0 de 12 clips de solo ruido generaron texto, frente a 6 en la conversion del modelo original.
- No soporta tool calling, function calling, agentes, vision ni audio de entrada mas alla del ASR; es un modelo de reconocimiento de voz, no un LLM.

## Casos de uso

- Subtitulado y transcripcion de reuniones en japones: el modelo procesa utterances de 16 kHz mono en CPU y puede integrarse en un pipeline de transcripcion por segmentos con sherpa-onnx, sin GPU en el servidor.
- Asistentes de voz embebidos en japones: al ocupar unos 0,5 GB en disco y 497 MB de memoria tras la carga, cabe en dispositivos de escritorio y en entornos edge donde no hay acelerador.
- Atencion al cliente con voz en japones: la variante dialogue esta ajustada sobre habla espontanea, lo que la hace adecuada para transcribir conversaciones de call center antes de pasarlas a un modulo de comprension.
- Indexacion y busqueda de archivos de audio japoneses: transcripcion por lotes en CPU con sherpa-onnx-offline para generar texto buscable a partir de grabaciones.
- Prototipado y pruebas de ASR en CI: la ausencia de PyTorch y NeMo simplifica el empaquetado en contenedores y la ejecucion de pruebas de regresion de reconocimiento en pipelines automatizados.
- Aplicaciones de accesibilidad: dictado y transcripcion en tiempo real en japones en equipos sin GPU dedicada, con un pico de memoria de 814 MB.
- Filtrado de ruido en preprocesado: la baja tasa de alucinacion sobre clips de solo ruido (0 de 12) permite usarlo como etapa de deteccion de voz antes de otros modulos.

## Benchmarks y rendimiento

Mediciones del autor con sherpa-onnx 2.0.1 en CPU (Intel Core i7-13700H, 4 hilos), busqueda greedy, comparadas con la misma conversion del Haas-ja-v1.0 original. El autor las describe como comprobaciones locales pequenas, no como un benchmark formal.

| Prueba | Haas-ja-v1.0 (conversion de oboroge0) | Este modelo |
|---|---:|---:|
| JSUT basic5000, primeras 100 utterances, CER | 4,50% | 3,74% |
| JSUT, 2-3 utterances unidas (5 clips), CER | 2,13% | 0,85% |
| Clips de solo ruido (12) que generaron texto | 6 | 0 |
| Memoria tras carga / pico | 497 MB / 814 MB | 497 MB / 814 MB |

El CER se calcula tras normalizacion NFKC y eliminacion de espacios y puntuacion, sin normalizacion kana-kanji. No se han publicado resultados de benchmarks del modelo original (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no son aplicables a un modelo ASR.

## Requisitos de hardware

- VRAM: no requiere GPU; ejecucion en CPU.
- Memoria RAM: 497 MB tras la carga y 814 MB de pico, medidos con sherpa-onnx 2.0.1 en un Intel Core i7-13700H con 4 hilos.
- GPU recomendadas: no aplica; el modelo esta pensado para CPU. No se documenta soporte GPU en la informacion disponible.
- Cabe en cualquier equipo consumer: el paquete completo ocupa 0,5 GB en disco y el encoder cuantizado pesa 42 MB de grafo mas 411 MB de pesos.
- Opciones de despliegue: sherpa-onnx (verificado en la version 2.0.1, C#, Windows x64, CPU) mediante `sherpa-onnx-offline` con `--model-type=nemo_transducer` y `--feat-dim=128`. No se documentan otras opciones de despliegue en la informacion disponible.
- Latencia y throughput: no disponibles; el autor solo reporta que la velocidad y la memoria son iguales que en la conversion del modelo original.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto / entrada | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| mikasa0231/Haas-ja-v1.0-dialogue-onnx-quantized | Transductor TDT (ONNX cuantizado) | Japones | Audio 16 kHz mono | Apache 2.0 | ONNX + sherpa-onnx | Conversion no oficial; CER 3,74% en JSUT basic5000 (primeras 100) |
| oboroge0/Haas-ja-v1.0-onnx-quantized | Transductor TDT (ONNX cuantizado) | Japones | Audio 16 kHz mono | Apache 2.0 | ONNX + sherpa-onnx | Conversion del Haas-ja-v1.0 base; CER 4,50% en la misma prueba |
| dena-ai/Haas-ja-v1.0-dialogue | Transductor TDT (NeMo) | Japones | Audio 16 kHz mono | Apache 2.0 | Pesos NeMo | Modelo original de DeNA; requiere NeMo/PyTorch |
| third-intelligence/Haas-ja-v1.0 | Transductor TDT (NeMo) | Japones | Audio 16 kHz mono | Apache 2.0 | Pesos NeMo | Modelo base antes del ajuste fino de DeNA |

## Limitaciones y advertencias

- Conversion no oficial: no esta hecha ni respaldada por DeNA ni por Third Intelligence; para resultados y datos de entrenamiento hay que remitirse a la model card original.
- Solo japones: no soporta otros idiomas.
- Dependencia de un detalle de implementacion: el decoder empaqueta su estado en tensores que sherpa-onnx trata como estado LSTM y usa la marca `#tdt` en los metadatos del encoder; una version futura de sherpa-onnx podria dejar de aceptar esta disposicion.
- Verificado unicamente con sherpa-onnx 2.0.1 en C#, Windows x64 y CPU; no hay validacion documentada en otras plataformas o versiones.
- Las metricas de CER proceden de pruebas locales pequenas (100 utterances de JSUT basic5000 y 5 clips unidos), no de un benchmark exhaustivo; no deben extrapolarse sin cautela.
- Riesgo de alucinacion en audio sin habla reducido pero no eliminado: en la prueba del autor, 0 de 12 clips de ruido generaron texto, frente a 6 en la conversion del modelo original.
- No se dispone de informacion sobre sesgos, cobertura de acentos o dialectos del japones, ni sobre el rendimiento en audio de telefonia o con ruido real.
- Licencia Apache 2.0, que permite uso comercial; deben conservarse los archivos LICENSE y NOTICE del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mikasa0231/Haas-ja-v1.0-dialogue-onnx-quantized
- Modelo base (DeNA): https://huggingface.co/dena-ai/Haas-ja-v1.0-dialogue
- Modelo original de Third Intelligence: https://huggingface.co/third-intelligence/Haas-ja-v1.0
- Conversion de referencia del Haas-ja-v1.0: https://huggingface.co/oboroge0/Haas-ja-v1.0-onnx-quantized
- sherpa-onnx (repositorio): https://github.com/k2-fsa/sherpa-onnx
