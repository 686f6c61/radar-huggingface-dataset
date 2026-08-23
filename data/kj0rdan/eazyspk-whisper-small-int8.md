# Kj0rdan/eazyspk-whisper-small-int8

## Resumen

El modelo `Kj0rdan/eazyspk-whisper-small-int8` es una conversión cuantizada a INT8 del checkpoint `whisper-small` de OpenAI, exportada al formato ONNX para facilitar la inferencia local. El autor, Kj0rdan, ha publicado los grafos del encoder y el decoder junto con la configuración del tokenizador, de modo que el repositorio contiene todos los ficheros necesarios para ejecutar reconocimiento de voz multilingüe sin depender de la implementación original de PyTorch.

El modelo base, Whisper Small, es un transformer encoder-decoder de 244 millones de parámetros, entrenado por OpenAI con 680 000 horas de audio etiquetado mediante supervisión débil. Soporta reconocimiento de voz y traducción de voz en 96 idiomas, con una ventana de contexto de 30 segundos de audio. La versión cuantizada a INT8 reduce el peso en memoria y acelera la inferencia en hardware sin soporte de FP16, lo que la hace adecuada para despliegues en CPU o en dispositivos con recursos limitados.

La relevancia de este modelo reside en su formato ONNX, que permite integrarlo en entornos de producción con herramientas como ONNX Runtime, así como en aplicaciones móviles o de escritorio sin necesidad de GPU dedicada. Su licencia MIT facilita su uso comercial y la modificación, aunque la ausencia de una model card detallada obliga a verificar la procedencia y la exactitud de la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder Transformer (Whisper small) |
| Parametros totales | 244 millones (checkpoint original) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 30 segundos de audio (equivalente a 1024 tokens de audio) |
| Tipos de cuantizacion | INT8 (pesos cuantizados) |
| Idiomas soportados | Multilingue (96 idiomas en la version original de Whisper small) |
| Licencia | MIT |
| Formato de pesos | ONNX (grafos de encoder y decoder) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura estandar de Whisper: un encoder basado en Transformer que procesa mel-espectrogramas de 30 segundos de audio y un decoder autoregresivo que genera los tokens de texto. El checkpoint original fue entrenado por OpenAI con 680 000 horas de audio etiquetado de forma debil, abarcando multiples idiomas y tareas (reconocimiento de voz, traduccion de voz, identificacion de idioma y subtitulado con marcas de tiempo). No se ha publicado informacion sobre el proceso de cuantizacion aplicado en esta conversion concreta (post-training quantization o quantization-aware training), ni sobre el dataset de calibracion utilizado.

La conversion a ONNX INT8 reduce la precision de los pesos a enteros de 8 bits, lo que disminuye el tamano del modelo y el uso de memoria durante la inferencia. El repositorio incluye los grafos del encoder y del decoder por separado, lo que permite un control fino sobre el flujo de inferencia y la posibilidad de ejecutar cada componente en un dispositivo distinto si fuese necesario.

## Capacidades

- Reconocimiento de voz multilingue: transcribe audio en hasta 96 idiomas, aunque la calidad varia segun la lengua y la disponibilidad de datos de entrenamiento.
- Traduccion de voz: puede traducir audio directamente a texto en ingles (tarea de speech-to-text translation).
- Subtitulacion con marcas de tiempo: genera timestamps a nivel de palabra o de segmento, util para subtitulos.
- Inferencia local en formato ONNX: compatible con ONNX Runtime, lo que permite ejecutar en CPU, GPU o dispositivos edge.
- Cuantizacion INT8: reduce el peso en memoria y mejora la latencia en hardware sin soporte de precision flotante.
- No se ha confirmado el soporte de tool calling, agentes o capacidades de razonamiento, ya que es un modelo de reconocimiento de voz, no un LLM generico.

## Casos de uso

- Transcripcion de reuniones y entrevistas: el modelo puede procesar grabaciones de hasta 30 segundos por pasada, encadenando segmentos para archivos largos. Su formato ONNX permite integrarlo en aplicaciones de escritorio o servidores sin GPU.
- Subtitulado automatico de videos: gracias a las marcas de tiempo que genera Whisper, se pueden crear subtitulos en multiples idiomas, con una calidad aceptable para contenido informal.
- Asistentes de voz locales: al ejecutarse en ONNX Runtime, puede desplegarse en un servidor privado o en un dispositivo movil para transcribir comandos de voz sin depender de servicios en la nube.
- Traduccion de voz en tiempo real: con la funcion de speech translation, puede convertir audio en un idioma a texto en ingles, util en reuniones o conferencias multilingues.
- Archivado de audio historico: transcripcion de grabaciones de radio, podcast o archivos de audio para busqueda y analisis posterior.
- Prototipado rapido en Python: los grafos ONNX se pueden cargar con `onnxruntime` y probar en minutos, lo que facilita la experimentacion antes de pasar a produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Whisper Small tiene resultados publicos de OpenAI (por ejemplo, en el paper "Robust Speech Recognition via Large-Scale Weak Supervision"), pero no se dispone de datos especificos para esta version cuantizada INT8. Se recomienda validar el rendimiento en el idioma y el dominio objetivo antes de desplegarlo en produccion.

## Requisitos de hardware

- VRAM estimada: con pesos INT8, el modelo ocupa aproximadamente 244 MB de memoria (244 M parametros * 1 byte por parametro). En FP16 ocuparia alrededor de 488 MB. La cuantizacion INT8 permite ejecutar en GPU con menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con soporte de ONNX Runtime (por ejemplo, NVIDIA GTX 1060 o superior, o iGPU integradas). No se requiere GPU de alta gama.
- En CPU: se puede ejecutar en un procesador moderno, aunque la latencia sera mayor. Para transcripcion en tiempo real se recomienda un CPU con al menos 4 nucleos.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), `onnxruntime-genai` para aplicaciones en C++/Python, o convertirlo a otro formato si se necesita (por ejemplo, TFLite para moviles).
- Latencia y throughput: no se dispone de datos concretos. Como referencia, Whisper Small en FP16 procesa aproximadamente 1 segundo de audio en 0.1-0.2 segundos en una GPU moderna; la version INT8 puede ser mas rapida en CPU, pero la latencia exacta depende del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| `Kj0rdan/eazyspk-whisper-small-int8` | 244 M | 30 segundos | INT8 | MIT | ONNX |
| Whisper Small (original) | 244 M | 30 segundos | FP16/FP32 | MIT | PyTorch |
| Whisper Base (original) | 74 M | 30 segundos | FP16/FP32 | MIT | PyTorch |
| Whisper Medium (original) | 769 M | 30 segundos | FP16/FP32 | MIT | PyTorch |

La principal diferencia de esta version es el formato ONNX y la cuantizacion INT8, que facilitan el despliegue en entornos sin GPU. Comparado con Whisper Base, ofrece mayor precision en idiomas menos comunes, a costa de un modelo mas grande. Whisper Medium ofrece mayor calidad, pero requiere mas memoria y no esta disponible en este formato INT8 en este repositorio.

## Limitaciones y advertencias

- Sesgos conocidos: Whisper Small tiene un rendimiento desigual entre idiomas; los idiomas con menos datos de entrenamiento (por ejemplo, lenguas africanas o asiaticas minoritarias) suelen tener tasas de error mas altas.
- Riesgo de alucinacion: Whisper puede generar texto que no esta presente en el audio, especialmente en silencios o ruidos, un fenomeno documentado en el modelo original.
- Limitaciones de contexto: la ventana de 30 segundos requiere segmentar audio mas largo, lo que puede perder contexto si hay cortes mal realizados.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificacion, pero se debe respetar la atribucion. No hay restricciones especificas adicionales.
- Caveat de produccion: la cuantizacion INT8 puede degradar la precision en comparacion con FP16, especialmente en entornos con ruido o acentos marcados. Se recomienda evaluar con datos propios antes de desplegar.
- Falta de informacion: el autor no proporciona detalles sobre el proceso de cuantizacion ni resultados de evaluacion, por lo que la calidad de la conversion no esta verificada.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/Kj0rdan/eazyspk-whisper-small-int8
- Perfil del autor en HuggingFace: https://huggingface.co/Kj0rdan
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
- Pagina de OpenASR con informacion de Whisper Small: https://openasr.org/models/whisper-small/
