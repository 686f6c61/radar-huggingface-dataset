# AXERA-TECH/Sherpa-ONNX-KWS.AXERA

## Resumen

Sherpa-ONNX-KWS.AXERA es un paquete de inferencia para detección de palabras clave (keyword spotting, KWS) basado en el modelo Zipformer de sherpa-onnx, adaptado y cuantizado específicamente para las plataformas de hardware AXERA (SoCs AX630C y AX650). Lo desarrolla AXERA-TECH, que proporciona un demo completo con modelos exportados, configuraciones, scripts Python y binarios C++ listos para ejecutar en dichos dispositivos.

El modelo resuelve el problema de activación por voz en entornos embebidos con recursos limitados, permitiendo detectar palabras o frases personalizables en chino e inglés con baja latencia. Su relevancia actual radica en que ofrece una vía directa para desplegar KWS en hardware de borde de AXERA sin necesidad de compilar ni reexportar los modelos, ya que los binarios y los archivos de configuración están pregenerados.

La arquitectura subyacente es un Zipformer, una variante eficiente de transformer para tareas de habla, con un tamaño aproximado de 3 millones de parámetros según el nombre del modelo base de sherpa-onnx. El contexto de entrada se procesa por fragmentos (chunk size configurable), lo que lo hace adecuado para streaming en tiempo real. La licencia no está declarada en la model card, aunque el proyecto sherpa-onnx suele usar Apache 2.0; no se puede confirmar sin más datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer (sherpa-onnx KWS) |
| Parametros totales | Aproximadamente 3 millones (segun el nombre del modelo base de sherpa-onnx) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (procesamiento por fragmentos, chunk size configurable) |
| Tipos de cuantizacion | Cuantizacion especifica para AXERA (axmodel), sin detalle de bits en la documentacion |
| Idiomas soportados | Chino e ingles |
| Licencia | no disponible |
| Formato de pesos | axmodel (para AX630C y AX650), junto con archivos de configuracion (tokens, keywords) |

## Arquitectura y entrenamiento

El modelo se basa en Zipformer, una arquitectura transformer optimizada para tareas de reconocimiento de habla y deteccion de palabras clave, desarrollada por el equipo de k2-fsa. Zipformer emplea mecanismos de atencion eficientes y capas convolucionales para reducir el coste computacional manteniendo una buena precision. El modelo concreto es `sherpa-onnx-kws-zipformer-zh-en-3M-2025-12-20`, que segun la documentacion de sherpa-onnx se entrena sobre subconjuntos de GigaSpeech (para ingles) y posiblemente otros corpus para chino; no se proporcionan detalles exactos del dataset ni del proceso de entrenamiento en la model card del repositorio.

El repositorio de AXERA-TECH no incluye el entrenamiento, sino la exportacion y cuantizacion del modelo ya entrenado a formato axmodel para los SoCs AX630C y AX650. El proceso de cuantizacion se realiza mediante la herramienta Pulsar2 de AXERA. No se menciona el uso de RLHF, DPO u otras tecnicas de alineacion, ya que se trata de un modelo de clasificacion de secuencias para KWS, no de un modelo generativo.

## Capacidades

- Deteccion de palabras clave (keyword spotting) en chino e ingles, con configuracion de multiples palabras o frases personalizadas mediante un archivo de texto.
- Ejecucion en tiempo real en dispositivos AXERA (AX630C y AX650) con bajo consumo, gracias a la cuantizacion especifica para NPU.
- Soporte de inferencia tanto en Python (mediante la libreria pyaxengine) como en C++ (binarios precompilados incluidos).
- Ajuste del umbral de deteccion por palabra clave (por ejemplo, anadiendo `#0.25` al final del token) para controlar el equilibrio entre recall y falsas alarmas.
- Configuracion del ancho de beam search (`max-active-paths`) entre 1 y 32, permitiendo optimizar velocidad frente a precision.
- Capacidad de anadir nuevas palabras clave sin reexportar ni recuantizar el modelo, generando los tokens correspondientes con un script.

## Casos de uso

- Despertar por voz en asistentes domesticos: el modelo puede activar un asistente local en un altavoz inteligente basado en AX630C, respondiendo a comandos como "Hola AXERA" o "Hey dispositivo", con latencia de streaming y sin depender de la nube.
- Control por voz en electrodomesticos: integracion en lavadoras, frigorificos o aires acondicionados con SoC AX650, permitiendo al usuario iniciar funciones mediante frases clave personalizadas, gracias a la configuracion dinamica de keywords.
- Sistemas de seguridad y emergencia: deteccion de palabras de alarma como "ayuda" o "fuego" en dispositivos de vigilancia, con un umbral ajustable para minimizar falsos positivos y una respuesta inmediata en el dispositivo.
- Automocion: activacion de manos libres en sistemas de infoentretenimiento vehicular, usando el modelo para detectar la palabra de activacion antes de pasar a un ASR de mayor tamano, reduciendo el consumo energetico.
- Accesibilidad: control por voz de dispositivos de asistencia para personas con movilidad reducida, donde la deteccion de una palabra clave simple permite operar sillas de ruedas o camas articuladas.
- Prototipado rapido de productos IoT: gracias a los binarios precompilados y los scripts de ejemplo, los desarrolladores pueden evaluar el KWS en hardware AXERA en minutos, iterando sobre las palabras clave sin necesidad de recompilar el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como recall, tasa de falsos positivos ni RTF (real-time factor). El unico dato cualitativo es que el ancho de beam search recomendado para el conjunto de prueba es 16, y que valores mas bajos (como 1) son mas rapidos pero pueden perder rutas foneticas correctas.

## Requisitos de hardware

- Hardware objetivo: SoCs AXERA AX630C y AX650, que integran NPU especificas para inferencia de modelos cuantizados.
- No se requiere GPU ni VRAM; el modelo esta disenado para ejecucion en el borde con memoria compartida del SoC.
- Para el binario C++, se necesita una biblioteca dinamica (`/soc/lib`) que debe estar presente en el sistema.
- El despliegue se realiza directamente sobre el dispositivo, sin necesidad de frameworks adicionales como vLLM u Ollama; se usa el runtime de AXERA (pyaxengine para Python o los binarios C++ incluidos).
- No se dispone de datos de latencia o throughput especificos; el rendimiento dependera del chunk size y del ancho de beam search configurados.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este modelo. Como referencia cualitativa, se puede comparar con otras soluciones de KWS:

| Modelo | Parametros | Idiomas | Hardware | Licencia | Notas |
|---|---|---|---|---|---|
| Sherpa-ONNX-KWS.AXERA | ~3M | zh, en | AX630C/AX650 | no disponible | Optimizado para AXERA, con binarios precompilados |
| Porcupine (Picovoice) | no disponible | multiples | CPU/GPU | comercial | Requiere licencia comercial, no open source |
| OpenWakeWord | variable | en (principalmente) | CPU | Apache 2.0 | Open source, requiere entrenamiento propio para otros idiomas |
| sherpa-onnx KWS estandar | ~3M | zh, en | CPU/GPU | Apache 2.0 | Modelo base sin cuantizacion especifica para AXERA |

La ventaja principal de este paquete es su integracion directa con el ecosistema AXERA, mientras que las alternativas requieren trabajo adicional de adaptacion y cuantizacion.

## Limitaciones y advertencias

- La licencia no esta declarada en la model card; antes de un uso comercial, es necesario contactar con AXERA-TECH o verificar la licencia del modelo base de sherpa-onnx (que suele ser Apache 2.0, pero no esta confirmado para este paquete).
- El modelo esta limitado a chino e ingles; no soporta otros idiomas de forma nativa.
- Es un demo de inferencia, no un sistema de produccion completo; carece de gestion de errores, logging avanzado o soporte para multiples instancias.
- El ajuste del umbral de deteccion es manual y depende del entorno acustico; puede requerir pruebas exhaustivas para evitar falsos positivos o perdidas de deteccion.
- No se proporcionan datos de sesgos ni de comportamiento en condiciones de ruido; el rendimiento en entornos reales puede variar.
- La cuantizacion esta optimizada para los SoCs AX630C y AX650; no es portable a otras plataformas sin reexportar el modelo.

## Enlaces

- [HuggingFace: AXERA-TECH/Sherpa-ONNX-KWS.AXERA](https://huggingface.co/AXERA-TECH/Sherpa-ONNX-KWS.AXERA)
- [GitHub: AXERA-TECH/Sherpa-ONNX-KWS.AXERA](https://github.com/AXERA-TECH/Sherpa-ONNX-KWS.AXERA)
- [Documentacion de sherpa-onnx KWS (modelos preentrenados)](https://k2-fsa.github.io/sherpa/onnx/kws/pretrained_models/index.html)
- [Repositorio sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx)
- [Documentacion de Pulsar2 (herramienta de cuantizacion de AXERA)](https://pulsar2-docs.readthedocs.io/en/latest/pulsar2/introduction.html)
