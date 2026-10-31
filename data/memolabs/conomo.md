# memolabs/conomo

## Resumen

Conomo es un paquete compacto de reconocimiento de voz en streaming desarrollado y distribuido por Memo (bajo la organización memolabs en Hugging Face), pensado para transcripción local y en el dispositivo (on-device). Su propósito es alimentar la funcionalidad de voz de Memo Agent, que descarga y verifica el paquete durante su instalación, sin necesidad de cuenta ni token de Hugging Face para los ficheros públicos.

El paquete resuelve el problema de la transcripción de voz sin depender de servicios en la nube: todo el reconocimiento se ejecuta localmente tras la instalación, lo que garantiza privacidad al no enviar audio a servidores remotos. Acepta audio mono a 16 kHz y soporta transcripción parcial en streaming, lo que lo hace adecuado para dictado y asistentes por voz con retroalimentación en tiempo real.

Técnicamente, se distribuye como un conjunto de componentes ONNX con tokenizador y ficheros de configuración, un detector de voz (speech detector) con licencia MIT propia, y avisos de licencia y procedencia. El almacenamiento de pesos usa una representación mixta compacta con conversión adicional a INT8 (~373 MB comprimido, ~411 MB extraído), aunque el cálculo se mantiene en FP32 en el runtime soportado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (componentes ONNX de ASR en streaming) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (audio mono 16 kHz, streaming) |
| Tipos de cuantizacion | almacenamiento mixto compacto con conversion INT8; computo FP32 |
| Idiomas soportados | ingles (en) |
| Licencia | OpenMDW-1.1 (detector de voz: MIT) |
| Formato de pesos | ONNX (paquete ZIP de ~373 MB comprimido, ~411 MB extraido) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura subyacente del modelo (transformer conformer, RNN-T, etc.). Lo que se conoce es la forma de distribucion: se trata de un paquete de componentes ONNX que incluye el modelo ASR, ficheros de tokenizador y configuracion, y un detector de voz independiente. El diseno esta orientado a inferencia local con soporte de transcripcion parcial en streaming, es decir, el modelo emite hipotesis de texto mientras el usuario sigue hablando, sin esperar al final del enunciado.

Sobre el entrenamiento no hay informacion publicada: no se conocen el numero de horas o tokens de audio, la composicion del corpus ni el procedimiento de optimizacion. La model card si aclara dos puntos relevantes: los pesos no fueron afinados con grabaciones ni historiales de transcripcion de usuarios de Memo, y el paquete no contiene datos personales. La cuantizacion es solo de almacenamiento (representacion mixta compacta con conversion INT8), mientras que la computacion en el runtime soportado se realiza en FP32.

## Capacidades

- Reconocimiento automatico de habla (ASR) en ingles.
- Transcripcion en streaming con resultados parciales durante la emision del audio.
- Entrada de audio mono a 16 kHz.
- Deteccion de voz incluida en el paquete (speech detector con licencia MIT), util para segmentar actividad vocal antes de transcribir.
- Inferencia completamente local y on-device, sin envio de audio a servicios remotos.
- Formato ONNX, lo que facilita la integracion con runtimes compatibles (ONNX Runtime y derivados).
- No soporta idiomas distintos del ingles segun la informacion disponible; no hay capacidades de traduccion, diarizacion ni puntuacion documentadas.

## Casos de uso

- Dictado por voz en aplicaciones de escritorio: gracias al streaming, el texto aparece de forma incremental mientras el usuario habla, sin esperas al final de la frase.
- Asistentes de voz locales: Memo Agent lo emplea como motor de transcripcion en su configuracion inicial; puede integrarse en agentes similares que procesen comandos hablados sin conexion.
- Transcripcion con privacidad por diseño: al ejecutarse on-device, es adecuado para entornos con requisitos de confidencialidad (salud, legal, consultorias) donde el audio no puede salir del equipo.
- Subtitulado o anotacion en tiempo real de reuniones locales: la transcripcion parcial permite mostrar leyendas en vivo durante una sesion.
- Activacion por palabra de voz o deteccion de habla: el detector de voz incluido permite filtrar silencios y reducir computo antes de invocar el ASR.
- Integracion en pipelines ONNX existentes: al distribuirse en formato ONNX, puede acoplarse a aplicaciones que ya usen ONNX Runtime para otros componentes, unificando el stack de inferencia.
- Herramientas de accesibilidad offline: transcripcion de voz para usuarios sin conexion estable o que prefieran no depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card advierte que las comprobaciones locales y sobre corpus pequeños no establecen la precision del modelo para todos los hablantes, idiomas o entornos acusticos.

## Requisitos de hardware

- Tamano del paquete: ~373 MB descargados, ~411 MB extraidos; la huella en memoria en ejecucion sera del orden de ese tamano (computo en FP32).
- VRAM estimada: no disponible; al ser un paquete compacto orientado a on-device, es plausible su ejecucion en CPU o en GPUs de consumo, pero no hay cifras publicadas.
- GPUs recomendadas: no disponible; el diseño local y el tamano reducido sugieren que no requiere aceleradores de centro de datos (A100/H100).
- Consumer GPU: no hay requisitos publicados; dado el tamano (~0,4 GB de repo), deberia funcionar en hardware de consumo, aunque sin datos verificados.
- Despliegue: requiere un runtime de voz compatible (no especificado); el formato ONNX sugiere compatibilidad con ONNX Runtime. Memo Agent lo descarga y verifica automaticamente durante su configuracion. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible; el soporte de streaming implica emision de resultados parciales, pero no se publican metricas de latencia ni de factor temporal real (RTF).

## Comparativa con modelos similares

| Modelo | Tamano | Streaming | Formato | Idioma | Licencia |
|---|---|---|---|---|---|
| Conomo (memolabs) | ~411 MB extraido | Si | ONNX | Ingles | OpenMDW-1.1 |
| Whisper (OpenAI, tiny/base) | 39-74M parametros (~75-150 MB) | No nativo (ventanas) | PyTorch/GGUF/ONNX | Multilingue | MIT |
| faster-whisper (CTranslate2, base) | ~74M parametros | Parcial (VAD + ventanas) | CTranslate2/ONNX | Multilingue | MIT |

Conomo se diferencia de Whisper en que el streaming es una capacidad de primera clase y en su distribucion como paquete autocontenido con detector de voz, a costa de estar limitado al ingles y carecer de documentacion publica de benchmarks. Whisper ofrece cobertura multilingue y un ecosistema mucho mas amplio, pero su streaming nativo es limitado.

## Limitaciones y advertencias

- Idioma limitado al ingles; no hay soporte documentado para castellano ni otros idiomas.
- La model card advierte explicitamente que las validaciones locales y sobre corpus pequeños no garantizan precision para todos los hablantes, idiomas o entornos acusticos: conviene evaluar con datos propios antes de uso en produccion.
- No hay benchmarks publicados (WER, latencia, RTF), por lo que la calidad y el rendimiento no pueden contrastarse con alternativas.
- Requiere un runtime de voz compatible que no esta especificado publicamente; no es un endpoint hospedado ni un paquete desplegable de forma aislada sin integracion adicional.
- La licencia es OpenMDW-1.1 (no una licencia estandar muy extendida); es necesario revisar los ficheros de licencia y avisos incluidos en el archivo antes de uso comercial, ya que el paquete retiene avisos de origen y atribucion obligatorios. El detector de voz incluido tiene licencia MIT independiente.
- La cuantizacion INT8 es solo de almacenamiento; la computacion en FP32 puede implicar mayor consumo de CPU/memoria que una ejecucion INT8 real.
- Proyecto muy reciente (octubre de 2026) con practicamente cero trazabilidad comunitaria (0 descargas registradas, 1 like), lo que limita la deteccion de sesgos o problemas por parte de terceros.
- Riesgo de alucinaciones tipico de sistemas ASR: no hay datos publicos sobre tasa de errores, alucinaciones en silencios ni robustez al ruido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/memolabs/conomo
- Archivo del paquete Conomo ASR INT8 v1: https://huggingface.co/memolabs/conomo/blob/main/conomo-asr-int8-v1.zip
- Checksums y manifiesto de ficheros: https://huggingface.co/memolabs/conomo/blob/main/conomo-asr-int8-v1.json
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Paper, repositorio de codigo y demo: no disponible
