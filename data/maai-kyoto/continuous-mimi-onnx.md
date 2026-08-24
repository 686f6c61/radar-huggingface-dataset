# maai-kyoto/continuous-mimi-onnx

## Resumen

Continuous Mimi Encoder es una exportacion modificada a ONNX del codec de audio Mimi desarrollado por Kyutai (proyecto Moshi). La modificacion principal consiste en omitir el bloque Residual Vector Quantization (RVQ) del encoder para producir directamente representaciones continuas (embeddings) en lugar de tokens discretos, preservando los detalles acusticos finos de la senal. Esta caracteristica lo hace especialmente adecuado para tareas de analisis de audio en tiempo real, como el analisis de dialogo o el reconocimiento de emociones en el habla.

El modelo es mantenido por el grupo MaAI (Real-time and Continuous Non-Linguistic Behavior Generation Software), que desarrolla software de interaccion en tiempo real basado en modelos como Voice Activity Projection (VAP). La exportacion ONNX permite una inferencia mas rapida que la ruta PyTorch original: los datos de referencia indican un RTF (factor de tiempo real) de aproximadamente 0,14-0,18 en FP32 ONNX frente a 0,22-0,32 en Torch, es decir, entre 1,5 y 2 veces mas rapido, manteniendo una similitud coseno superior a 0,9999 con los embeddings de Torch.

El repositorio incluye un script de inferencia (`inference.py`) que soporta streaming desde microfono a 16 kHz, comparacion numerica entre backends Torch y ONNX, y cuantizacion INT8 para CPU. Se distribuye bajo licencia CC BY 4.0 y esta pensado para uso como extractor de caracteristicas (pipeline de feature-extraction).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de audio Mimi (Kyutai/Moshi) con RVQ omitido, exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesamiento por chunks de 1280 muestras a 16 kHz con solapamiento de 320) |
| Tipos de cuantizacion | FP32, INT8 |
| Idiomas soportados | no disponible (modelo de audio sin dependencia de idioma explicita) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`.onnx` con `.json` sidecar) |

## Arquitectura y entrenamiento

El modelo es una derivacion del encoder del codec de audio Mimi, desarrollado por Kyutai como parte del sistema Moshi. La arquitectura base es un encoder convolutional con atencion, disenado para compresion y reconstruccion de audio. La modificacion principal consiste en eliminar el modulo RVQ, de modo que la salida ya no son tokens discretos sino vectores continuos de caracteristicas. Esto conserva mas informacion acustica que la cuantizacion residual, a costa de perder la compatibilidad directa con modelos de lenguaje que operan sobre tokens discretos.

No se proporcionan datos sobre el entrenamiento del modelo original (numero de tokens, composicion del dataset, si hubo RLHF/DPO), ya que la informacion disponible se centra en la adaptacion ONNX y su comportamiento en inferencia. La exportacion a ONNX se ha validado contra la implementacion PyTorch de referencia (`kyutai/mimi`) con diferencias maximas absolutas del orden de 1e-6 a 1e-3 en la mayoria de ventanas, alcanzando valores de 1e-2 a 5e-2 en transitorios fuertes, con una similitud coseno minima de aproximadamente 0,97 en el peor segundo.

## Capacidades

- Extraccion de caracteristicas de audio continuas en tiempo real (embeddings de 16 kHz de entrada, chunk de 1280 muestras con overlap de 320).
- Inferencia mas rapida que tiempo real en CPU (RTF ≈ 0,14-0,18 en FP32 ONNX).
- Soporte de streaming por microfono a 16 kHz mono float32.
- Comparacion numerica integrada entre backends Torch y ONNX para validacion de consistencia.
- Cuantizacion INT8 para CPU, que reduce el coste computacional a cambio de mayor error numerico.
- Compatible con ONNX Runtime y ONNX Runtime GPU (CUDA execution provider).
- Integrable en pipelines de analisis de audio para tareas de dialogo en tiempo real, reconocimiento de emociones y analisis de turnos de habla.

## Casos de uso

- **Analisis de emociones en el habla en tiempo real**: al generar embeddings continuos que preservan matices acusticos, el modelo puede alimentar clasificadores de emociones o de estados afectivos en aplicaciones de teleasistencia o servicios de atencion al cliente.
- **Deteccion de turnos de habla (turn-taking)**: integrado en el ecosistema MaAI, el modelo sirve como extractor de caracteristicas para sistemas de proyeccion de actividad de voz (VAP), que predicen cuando un interlocutor va a terminar su turno y permiten una interaccion natural en asistentes conversacionales.
- **Analisis de dialogo en streaming**: los embeddings continuos pueden alimentar modelos de comprension de dialogo que requieren informacion prosodica y paralinguistica sin perdida por cuantizacion, util en transcripcion en vivo con etiquetas de enfasis o sarcasmo.
- **Investigacion en interaccion humano-maquina**: el modelo proporciona una representacion de audio de alta fidelidad que facilita el estudio de patrones de interaccion no verbal (pausas, solapamientos, entonacion) en entornos de investigacion de psicologia o linguistica computacional.
- **Preprocesamiento para sistemas de reconocimiento de emociones**: en lugar de usar tokens discretos de codecs, las representaciones continuas se pueden usar directamente como entrada a redes neuronales de clasificacion de emociones, mejorando la precision en condiciones de ruido o variaciones de entonacion.
- **Comparacion de backends en produccion**: el script de comparacion incluido permite validar que una implementacion ONNX desplegada en servidores de inferencia mantiene una consistencia numerica con el modelo PyTorch de referencia, util para auditorias de calidad en sistemas criticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que se trata de un modelo de audio y no de lenguaje. Los datos de rendimiento proporcionados son los siguientes:

| Metrica | Valor |
|---|---|
| RTF FP32 ONNX (CPU) | ≈ 0,14 - 0,18 |
| RTF Torch (CPU) | ≈ 0,22 - 0,32 |
| Aceleracion ONNX vs Torch | ≈ 1,5 - 2x |
| Maxima diferencia absoluta (Torch vs ONNX FP32) | 1e-6 - 1e-3 (hasta 1e-2 - 5e-2 en transitorios) |
| Similitud coseno (Torch vs ONNX FP32) | ≥ 0,9999 (minimo 0,97 en peor segundo) |

Estos valores son ilustrativos, medidos en CPU de escritorio con FP32 y streaming con chunk de 1280 a 16 kHz. El rendimiento exacto depende del hardware, el numero de hilos y las compilaciones de ONNX Runtime y PyTorch.

## Requisitos de hardware

- **VRAM estimada**: no disponible, pero dado que el modelo es un encoder de audio relativamente pequeno (0,6 GB en formato ONNX), se puede ejecutar en GPU de gama media o incluso en CPU.
- **GPU recomendadas**: cualquier GPU moderna con soporte CUDA (por ejemplo, RTX 2060 o superior) para aceleracion con `onnxruntime-gpu`; tambien funciona en CPU sin GPU.
- **Compatibilidad con GPU de consumo**: si, el modelo puede ejecutarse en GPUs de consumo como la RTX 3060, RTX 4090, etc., gracias a su tamano reducido.
- **Opciones de despliegue**: ONNX Runtime (CPU o GPU), integrable en pipelines de streaming con Python 3.10+ y `transformers==5.5.3`; tambien puede usarse a traves de la libreria MaAI (https://maai-kyoto.github.io/MaAI/).
- **Latencia y throughput**: con chunk de 1280 muestras a 16 kHz, la latencia de procesamiento por chunk es de aproximadamente 11,7 ms en ONNX FP32 CPU y 22,9 ms en Torch, lo que permite ejecucion mas rapida que en tiempo real (RTF < 1).

## Comparativa con modelos similares

No hay informacion suficiente en los datos proporcionados para realizar una comparativa con otros modelos de audio codec similares (como EnCodec, SoundStream o Descript Audio Codec). El modelo se deriva directamente de Mimi de Kyutai, por lo que su comparacion natural seria con el propio Mimi original, pero no se dispone de datos de rendimiento comparativos publicados en la informacion disponible. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- **Bypass del RVQ**: al omitir la cuantizacion vectorial, el modelo pierde la compatibilidad con sistemas que esperan tokens discretos (como modelos de lenguaje de audio). No es adecuado para generacion de audio o para tareas que requieran tokens como entrada a un LLM.
- **Error numerico en cuantizacion**: la version INT8 introduce un error numerico mayor que la FP32, lo que puede afectar a tareas que requieren alta fidelidad de embeddings. Se recomienda usar FP32 para validacion o aplicaciones criticas.
- **Dependencia de la implementacion de referencia**: la salida del modelo se valida contra `kyutai/mimi` en PyTorch; cualquier cambio en la implementacion original de Kyutai puede afectar la consistencia.
- **Sin informacion de entrenamiento**: no se han publicado detalles sobre el entrenamiento del encoder original (datasets, numero de tokens, tecnicas de optimizacion), lo que dificulta evaluar sesgos o limitaciones del modelo subyacente.
- **Restricciones de licencia**: la licencia CC BY 4.0 permite uso comercial y modificacion, pero requiere atribucion del autor original (Kyutai) y de la modificacion (MaAI). Es importante revisar los terminos completos de la licencia para uso en produccion.
- **Sin soporte de idiomas explicitos**: el modelo no tiene informacion sobre idiomas soportados, pero al ser un encoder de audio generico, deberia funcionar con cualquier idioma hablado, aunque no se garantiza la calidad en todos los casos.
- **Cantidad de descargas y soporte**: el modelo tiene 0 descargas en HuggingFace, lo que indica que es un proyecto reciente o poco adoptado; el soporte de la comunidad puede ser limitado.

## Enlaces

- [HuggingFace - maai-kyoto/continuous-mimi-onnx](https://huggingface.co/maai-kyoto/continuous-mimi-onnx)
- [MaAI API Documentation](https://maai-kyoto.github.io/MaAI/)
- [Documentacion de util - MaAI](https://maai-kyoto.github.io/MaAI/api/util/)
- [GitHub - MaAI-Kyoto/MaAI](https://github.com/MaAI-Kyoto/MaAI)
- [Repositorio de modelos de MaAI en HuggingFace](https://huggingface.co/maai-kyoto/models)
