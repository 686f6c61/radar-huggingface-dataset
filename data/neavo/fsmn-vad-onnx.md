# neavo/FSMN-VAD-ONNX

## Resumen

FSMN-VAD-ONNX es un detector de actividad de voz (VAD, voice activity detection) basado en arquitectura FSMN (Feedforward Sequential Memory Network) y distribuido en formato ONNX. Se trata de un espejo sin modificaciones del modelo oficial de Alibaba/FunASR publicado originalmente en ModelScope como `iic/speech_fsmn_vad_zh-cn-16k-common-onnx`, rehospedado en Hugging Face por el usuario `neavo`. La autoría de los pesos sigue siendo de Alibaba/FunASR; este repositorio únicamente replica los ficheros de runtime verificados por hash SHA-256.

El modelo resuelve el problema de segmentar audio en tramos con y sin habla, una pieza previa habitual en pipelines de reconocimiento automático de voz (ASR) que permite recortar silencios, activar la captura solo cuando hay voz y aplicar detección de punto final (endpointing) en streaming. Trabaja sobre audio a 16 kHz y está entrenado específicamente para chino mandarín (`zh-cn`), aunque al ser un detector acústico de voz su función no depende del idioma del contenido.

Su relevancia práctica está en el tamaño: el fichero `model_quant.onnx` ocupa 506.744 bytes (unos 0,5 MB), lo que lo hace desplegable en entornos muy limitados, incluidos dispositivos de borde o navegador. No es un modelo de transcripción ni de generación de texto, sino un componente de frontend de audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FSMN (Feedforward Sequential Memory Network), variante Monophone VAD |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio en streaming con caché interna; ventana no especificada) |
| Tipos de cuantizacion | modelo ya cuantizado en origen (`model_quant.onnx`); no se han publicado otros formatos en este repositorio |
| Idiomas soportados | chino (`zh`); como VAD acústico, la detección de voz no depende del idioma del habla |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model_quant.onnx`), acompañado de `am.mvn` (estadísticas CMVN), `config.yaml` y `configuration.json` |
| Frecuencia de muestreo | 16 kHz |
| Tamano del fichero ONNX | 506.744 bytes (~0,5 MB) |
| Repositorio | 0,0 GB (solo ficheros de runtime y metadatos) |
| Pipeline (Hugging Face) | voice-activity-detection |
| Revision fijada del upstream | `a158155ef9e81f405c052f40b6d1ad43b87e6215` |

## Arquitectura y entrenamiento

La arquitectura es una red FSMN (Feedforward Sequential Memory Network), un tipo de red neuronal recurrente ligera que incorpora bloques de memoria secuencial hacia delante para modelar dependencias temporales sin las limitaciones de una RNN clásica. En esta variante "Monophone VAD" se emplea como clasificador de actividad de voz sobre tramas acústicas, con normalización CMVN aplicada mediante las estadísticas incluidas en `am.mvn`. El modelo opera con lógica de caché en streaming y postprocesado de detección de punto final, tal como implementa FunASR.

No se han publicado en la información disponible detalles sobre el número de tokens de audio de entrenamiento, la composición del dataset, ni si hubo ajuste fino con RLHF/DPO (no aplicable en un modelo de este tipo). Tampoco se documentan innovaciones adicionales más allá del propio diseño FSMN y su exportación a ONNX cuantizado. El repositorio es un espejo de ficheros: no se han realizado reentrenamientos, reexportaciones ni re-cuantizaciones.

## Capacidades

- Detección de actividad de voz: clasifica tramas de audio a 16 kHz como voz o no voz.
- Segmentación de audio: delimita los intervalos con habla dentro de una señal de audio.
- Detección de punto final (endpointing) en streaming, mediante la lógica de postprocesado de FunASR.
- Procesamiento en streaming con caché interna, adecuado para audio en tiempo real.
- Integración como frontend previo a un pipeline ASR (recorte de silencios y activación por voz).
- No realiza transcripción, traducción, generación de texto ni tool calling.
- No dispone de capacidades multimodales más allá del audio (sin visión ni vídeo).

## Casos de uso

- Preprocesado de pipelines ASR: usar el modelo para recortar silencios antes de pasar el audio a un reconocedor, reduciendo cómputo y latencia en la transcripción. Es adecuado por su tamaño mínimo y su función específica de segmentación.
- Detección de punto final en asistentes de voz: integrar el VAD en el frontend de un asistente para detectar cuándo el usuario ha terminado de hablar y cerrar el turno, usando la lógica de endpointing de FunASR.
- Activación por voz en dispositivos de borde: desplegar el ONNX de ~0,5 MB en hardware con recursos limitados para activar la captura de audio solo cuando hay habla, ahorrando energía y ancho de banda.
- Filtrado de audio en grabaciones largas: procesar ficheros de reuniones o llamadas para aislar los tramos con voz y descartar silencios antes del almacenamiento o la transcripción.
- Moderación y analítica de llamadas: detectar presencia de habla en grabaciones para métricas de tiempo efectivo de conversación o para disparar procesos posteriores solo en tramos relevantes.
- Integración en aplicaciones web o de escritorio: al ser un fichero ONNX de pequeño tamaño, puede cargarse en runtimes de inferencia ligeros para VAD en cliente, siempre que se valide la compatibilidad del runtime (el autor advierte que el nombre ONNX no garantiza soporte GPU).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor del espejo indica explícitamente que no se realizaron pruebas adicionales de precisión de inferencia, compatibilidad GPU/WebGPU ni pruebas de pipeline de extremo a extremo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del fichero (~0,5 MB) el modelo es viable en CPU y en dispositivos de muy bajos recursos, pero no se han publicado cifras de memoria.
- GPU recomendadas: no disponible; el autor advierte que el nombre ONNX no garantiza soporte GPU y no se han realizado pruebas de compatibilidad GPU/WebGPU.
- Cabida en GPU de consumo: previsiblemente sí por tamaño, aunque sin validación publicada.
- Opciones de despliegue: runtime ONNX (ONNX Runtime) con el frontend y la lógica de endpointing de FunASR; el modelo requiere `am.mvn`, `config.yaml` y `configuration.json` para reproducir el comportamiento upstream.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Formato | Tamano | Idiomas | Licencia |
|---|---|---|---|---|---|
| FSMN-VAD-ONNX (este) | FSMN Monophone VAD | ONNX cuantizado | ~0,5 MB | zh (VAD independiente del idioma) | Apache 2.0 |
| Silero VAD | Red neuronal ligera (no especificada en la informacion disponible) | ONNX / PyTorch | no disponible | multilingue | MIT (segun su proyecto; no verificado en esta busqueda) |
| WebRTC VAD | Algoritmo GMM clasico | nativo | muy pequeno | independiente del idioma | BSD (segun su proyecto; no verificado en esta busqueda) |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a caracteristicas estructurales y debe verificarse contra las fuentes oficiales de cada alternativa.

## Limitaciones y advertencias

- Es un detector de voz, no un modelo de transcripción: no genera texto ni interpreta el contenido del habla.
- Entrenado para chino mandarín (`zh-cn`); su comportamiento en otros idiomas o acentos no está documentado en esta información.
- El repositorio es un espejo de ficheros sin pruebas de precisión, compatibilidad GPU/WebGPU ni pipeline de extremo a extremo realizadas por el autor del espejo.
- Requiere la lógica de caché en streaming y el postprocesado de FunASR para reproducir el comportamiento upstream; un uso aislado del ONNX puede dar resultados distintos.
- Riesgo de falsos positivos/negativos en entornos con ruido, música o habla solapada; no se han publicado métricas de error en esta información.
- Licencia Apache 2.0 permite uso comercial, pero debe preservarse la atribución a Alibaba/FunASR y el nombre original del modelo.
- El autor advierte que la extensión ONNX no garantiza soporte en GPU; validar el runtime antes de desplegar en producción.

## Enlaces

- Hugging Face: https://huggingface.co/neavo/FSMN-VAD-ONNX
- Repositorio original en ModelScope: https://modelscope.cn/models/iic/speech_fsmn_vad_zh-cn-16k-common-onnx
- Revision fijada del upstream: https://modelscope.cn/models/iic/speech_fsmn_vad_zh-cn-16k-common-onnx/tree/a158155ef9e81f405c052f40b6d1ad43b87e6215
- FunASR (runtime y documentación): https://github.com/modelscope/FunASR
