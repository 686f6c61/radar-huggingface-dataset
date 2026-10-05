# Masterx/moonshine-streaming-tiny-es-ONNX

## Resumen

Masterx/moonshine-streaming-tiny-es-ONNX es una exportación a ONNX del modelo de reconocimiento automatico del habla (ASR) moonshine-ai/moonshine-streaming-tiny-es, desarrollado originalmente por Moonshine AI y reempaquetado por el usuario Masterx. Se trata de una variante "streaming" de la arquitectura Moonshine v2 ("Ergodic Streaming Encoder") especializada en transcribir audio en castellano de forma incremental, es decir, procesando el audio a medida que llega en lugar de esperar a tener la locución completa. El repositorio pesa aproximadamente 0,2 GB y esta publicado bajo licencia MIT.

La relevancia de esta ficha reside en que el autor no se limita a exportar el modelo, sino que lo descompone en las cinco gráficas ONNX que utiliza el runtime oficial de streaming de Moonshine (`frontend`, `encoder`, `adapter`, `cross_kv` y `decoder_kv`), lo que permite ejecutar la inferencia sin re-codificar la totalidad de la frase en cada paso. Ademas, se ofrecen variantes cuantizadas a int8 de todas las gráficas salvo el frontend, y se documenta una verificación numérica contra `transformers` sobre el conjunto FLEURS es_419.

El modelo esta pensado para desarrolladores que necesitan ASR en tiempo real en castellano sobre CPU, con un factor de tiempo real declarado de 0,039 en un escritorio, y con la posibilidad de desplegarlo fuera del ecosistema PyTorch mediante `onnxruntime`. No se trata de un modelo nuevo entrenado desde cero: es una conversión de pesos y una reestructuración del grafo para inferencia por streaming.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Moonshine v2 ("Ergodic Streaming Encoder"), transformer con atencion de ventana deslizante; exportada como cinco gráficas ONNX (frontend, encoder, adapter, cross_kv, decoder_kv) |
| Parametros totales | no disponible (variante "tiny"; no se publica el recuento exacto en la informacion disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventana de atencion con `total_left_context`=96 frames y `total_lookahead`=16 frames; posiciones absolutas hasta 4096 (equivalente a 82 s por segmento) |
| Tipos de cuantizacion | fp32 e int8 dinamico (QInt8 per-channel en MatMul/Gemm con constante B); el frontend solo se distribuye en fp32 |
| Idiomas soportados | Espanol (es) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17); incluye `streaming_config.json` con dimensiones, ids BOS/EOS, formas de estado y ventanas de atencion |

## Arquitectura y entrenamiento

La arquitectura subyacente es Moonshine v2, un encoder-decoder tipo transformer disenado especificamente para ASR en streaming. El rasgo distintivo es el denominado "Ergodic Streaming Encoder", que procesa el audio de forma incremental: en lugar de re-codificar toda la locucion, mantiene un estado interno y solo atiende a una ventana deslizante de frames. En la exportacion ONNX esto se materializa en cinco gráficas separadas. `frontend.onnx` recibe fragmentos de audio de longitud multiplo de 640 muestras y produce features de forma `[1, N/320, 320]`. `encoder.onnx` aplica una atencion de ventana deslizante sobre `total_left_context`=96 frames pasados mas los nuevos, conservando como estables los frames anteriores a `total_lookahead`=16. `adapter.onnx` anade embeddings de posicion absoluta (hasta 4096 posiciones, equivalentes a 82 s por segmento). `cross_kv.onnx` genera las claves y valores de atencion cruzada con forma `[6,1,8,M,40]`, y `decoder_kv.onnx` ejecuta el decodificador autorregresivo con su propia cache K/V y la cache cruzada.

No se dispone de informacion en el material proporcionado sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineacion aplicadas al modelo base. La exportacion se realizo con el script oficial `moonshine/scripts/export.py` usando `torch.onnx` sobre opset 17, y se documenta que las ventanas deslizantes usan semantica inclusiva (la notacion `(17,5)/(17,1)` de los checkpoints multilingues se normaliza a `(16,4)/(16,0)`). Segun el autor, las gráficas fp32 reproducen token a token la salida greedy de `MoonshineStreamingForConditionalGeneration` de `transformers` cuando la mascara usa las mismas ventanas inclusivas. La cuantizacion int8 se aplica mediante `onnxruntime.quantization.quantize_dynamic`, dejando el frontend en fp32 por representar solo en torno al 3 % del computo y para preservar exactitud en el arrastre de estado de la convolucion.

## Capacidades

- Reconocimiento automatico del habla (ASR) en castellano, con decodificacion greedy.
- Inferencia en streaming: el audio se codifica de forma incremental en lugar de re-procesar la locucion completa, lo que habilita transcripcion en tiempo real.
- Soporte de procesamiento por fragmentos de audio cuyo tamano es multiplo de 640 muestras en el frontend.
- Gestion de estado interno persistente entre fragmentos (5 estados en el frontend, cache de atención propia y cruzada en el decodificador).
- Compatibilidad con `onnxruntime` en Python y con el motor WinSTT Rust (endpointer por energia).
- Ejecucion en CPU con factor de tiempo real bajo (0,039 en escritorio) segun las pruebas del autor.
- Cuantizacion int8 disponible para encoder, adapter, cross_kv y decoder_kv, con WER ligeramente inferior al fp32 en el conjunto de verificacion.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio generativo ni multi-step reasoning; se trata exclusivamente de un modelo ASR.
- No se documenta soporte multilingue mas alla del espanol.

## Casos de uso

- Transcripcion en tiempo real de reuniones y llamadas en castellano: el modelo procesa el audio por fragmentos y mantiene el estado entre ellos, por lo que puede alimentar un cliente de subtitulos en vivo sin re-codificar toda la conversacion en cada turno.
- Asistentes de voz y dictado en aplicaciones de escritorio: al ejecutarse sobre CPU con onnxruntime y con un factor de tiempo real de 0,039, puede integrarse en herramientas de productividad sin requerir GPU dedicada.
- Subtitulado de contenido audiovisual en espanol: la ventana de 82 s por segmento (4096 posiciones) cubre intervenciones largas, y el modo incremental evita el coste de re-procesar el audio completo al recibir nuevos fragmentos.
- Despliegue en el borde (edge) y dispositivos sin acelerador: el peso del repositorio (0,2 GB) y la cuantizacion int8 permiten empaquetar el modelo en aplicaciones locales o en contenedores ligeros.
- Integracion en pipelines de accesibilidad (transcripcion de videollamadas, actas automaticas): al no depender de PyTorch en tiempo de inferencia, se puede incrustar en servicios escritos en Rust (WinSTT) o Python sin arrastrar el stack completo de entrenamiento.
- Preprocesado de audio para pipelines de datos (generacion de transcripciones sobre grandes volumenes de grabaciones en espanol): la combinacion fp32/int8 permite elegir entre maxima fidelidad y menor coste de computo.
- Sistemas de mando por voz para aplicaciones de escritorio: el endpointer por energia del motor WinSTT permite segmentar la locucion del usuario y activar el decoder solo cuando hay habla, reduciendo el consumo.
- Verificacion de calidad de ASR en proyectos que migran desde `transformers`: las gráficas fp32 reproducen token a token la salida de `MoonshineStreamingForConditionalGeneration`, lo que facilita la validacion de la nueva ruta de inferencia.

## Benchmarks y rendimiento

El autor publica una verificacion sobre 20 utterances del conjunto FLEURS es_419 con decodificacion greedy en CPU. Los valores de WER son:

| Runtime | WER fp32 | WER int8 |
|---|---|---|
| onnxruntime (Python, locucion completa) | 6,68 % | 6,47 % |
| WinSTT Rust engine (incremental, endpointer por energia) | 6,89 % | - |

El factor de tiempo real en Rust fp32 sobre CPU de escritorio bajo carga concurrente es 0,039. El propio autor advierte que el conjunto es pequeno (20-41 utterances) y que estos numeros deben interpretarse como una comprobacion de regresion, no como un benchmark representativo. No hay resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales porque el modelo es especificamente de ASR.

## Requisitos de hardware

- VRAM estimada: no aplica para la ruta recomendada, ya que el autor indica que la ejecucion debe realizarse con el execution provider de CPU. El encoder no funciona en DirectML (ORT 1.24 DML EP rechaza el Reshape de las cabezas de atencion).
- GPU recomendadas: no se documentan; el diseno apunta a inferencia en CPU. Las gráficas ONNX podrian ejecutarse en GPU con otros execution providers, pero no esta validado en la informacion disponible.
- Compatibilidad con GPU de consumo: no confirmada. El repositorio esta planteado para CPU.
- Opciones de despliegue: `onnxruntime` en Python, motor WinSTT Rust con endpointer por energia, y cualquier runtime compatible con ONNX opset 17 con execution provider de CPU.
- Latencia y throughput: factor de tiempo real de 0,039 en Rust fp32 sobre CPU de escritorio bajo carga concurrente (es decir, aproximadamente 25 veces mas rapido que el tiempo real en ese escenario). No se publican cifras de throughput en otras configuraciones.
- Cuantizacion: las variantes int8 de encoder, adapter, cross_kv y decoder_kv reducen el peso y el coste de computo, con WER de 6,47 % frente a 6,68 % en fp32 sobre el conjunto de verificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Masterx/moonshine-streaming-tiny-es-ONNX | no disponible (tiny) | ventana 96+16 frames; 82 s por segmento | es | MIT | ONNX (fp32/int8) | Exportacion streaming en 5 gráficas, verificada contra `transformers` |
| moonshine-ai/moonshine-streaming-tiny-es | no disponible (tiny) | idem | es | MIT | safetensors / PyTorch | Modelo base del que deriva esta exportacion |
| Whisper small (OpenAI) | 244 M | 30 s por ventana, no streaming nativo | multilingue | MIT | safetensors, GGUF, ONNX | Referencia habitual en ASR; no streaming incremental nativo |
| Otros modelos ASR en espanol de la familia Moonshine | no disponible | no disponible | es | MIT | no disponible | El autor no documenta comparaciones con otras variantes |

No se dispone de datos de benchmarks comparativos entre este modelo y alternativas del mismo tamano en la informacion proporcionada.

## Limitaciones y advertencias

- Los sesgos conocidos del modelo base no se documentan en la informacion disponible; no hay analisis de sesgo por acento, genero, edad ni variedad dialectal del espanol.
- Riesgo de alucinacion: como todo decoder autorregresivo, puede generar transcripciones plausibles en segmentos con ruido o silencio; el endpointer por energia del motor WinSTT mitiga parcialmente este riesgo al no invocar el decoder sin habla.
- El encoder no funciona en DirectML (ORT 1.24 DML EP rechaza el Reshape de las cabezas de atencion); debe usarse el execution provider de CPU en onnxruntime.
- La verificacion de WER se realizo sobre solo 20-41 utterances del conjunto FLEURS es_419, por lo que los numeros no deben extrapolarse a produccion sin una evaluacion propia con datos representativos.
- El modelo soporta unicamente espanol; no se documenta multilingue.
- La licencia es MIT, heredada del modelo base, y permite uso comercial, siempre que se conserve el aviso de licencia; conviene revisar el `LICENSE` del repositorio original para los terminos completos.
- Dependencia de la semantica inclusiva de las ventanas deslizantes: si se integra con otras implementaciones que usen semantica exclusiva, hay que normalizar la mascara o los resultados dejaran de coincidir token a token con `transformers`.
- El frontend no se distribuye en int8 deliberadamente para preservar la exactitud del arrastre de estado de la convolucion; no debe cuantizarse a la ligera.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia, por lo que no cuenta con validacion de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Masterx/moonshine-streaming-tiny-es-ONNX
- Modelo base: https://huggingface.co/moonshine-ai/moonshine-streaming-tiny-es
- Repositorio oficial de Moonshine (script de exportacion `moonshine/scripts/export.py`): no disponible en la informacion proporcionada
- Paper o blog de Moonshine v2 ("Ergodic Streaming Encoder"): no disponible en la informacion proporcionada
- Motor WinSTT Rust: no disponible en la informacion proporcionada
- Conjunto de evaluacion FLEURS es_419: no disponible en la informacion proporcionada
