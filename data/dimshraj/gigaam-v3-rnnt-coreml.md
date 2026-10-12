# dimshraj/gigaam-v3-rnnt-coreml

## Resumen

El repositorio dimshraj/gigaam-v3-rnnt-coreml es una conversión a CoreML del modelo de reconocimiento automático del habla (ASR) en ruso GigaAM v3, en su variante v3_rnnt. El modelo original lo desarrolla SberDevices (equipo Salute Developers) y se distribuye con licencia MIT. Este repositorio no contiene un modelo entrenado desde cero, sino las herramientas de conversión (convert.py) y verificación (verify.py) que transforman los pesos de PyTorch en cuatro modelos CoreML encadenados —Preprocessor, Encoder, Decoder y Joint— destinados a la aplicación Recorder v2 de Apple.

La arquitectura es un transducer RNN-T sin puntuación: un encoder que consume ventanas de audio de 25 segundos a 16 kHz y produce representaciones de 768 dimensiones a 40 ms por trama, una red de predicción (decoder) de 320 dimensiones con estados de tipo LSTM, y una red conjunta (Joint) que genera 34 clases (33 símbolos de vocabulario más el blank). La conversión aplica fp16 al encoder y fp32 al resto, y fija la entrada a 25 segundos por una limitación derivada del tratamiento del rotary positional encoding durante la traza.

Su relevancia es de nicho pero concreta: permite ejecutar un ASR ruso localmente en hardware Apple (CPU, GPU o Neural Engine) sin enviar audio a la nube, lo que resulta útil para aplicaciones de transcripción, dictado o análisis de audio con requisitos de privacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RNN-T (transducer) con encoder, red de predicción y red conjunta |
| Parametros totales | no disponible (pesos originales de GigaAM ~430 MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | ventana de audio fija de 25 s (400 000 muestras a 16 kHz); procesado por fragmentos en la verificacion |
| Tipos de cuantizacion | fp32 (Preprocessor, Decoder, Joint) y fp16 (Encoder) en CoreML |
| Idiomas soportados | ruso |
| Licencia | MIT |
| Formato de pesos | CoreML compilado (.mlmodelc); pesos originales en PyTorch |
| Dimension de encoder | 768 |
| Dimension de decoder | 320 |
| Clases de salida | 34 (33 simbolos de vocabulario + blank) |
| Tasa de tramas | 40 ms por trama de encoder (625 tramas por ventana de 25 s) |

## Arquitectura y entrenamiento

La informacion disponible no documenta el proceso de entrenamiento del modelo original (numero de tokens, composicion del dataset, RLHF/DPO), por lo que esos datos se consideran no disponibles. Lo que si se describe con detalle es la topologia del grafo RNN-T resultante de la conversion, compuesto por cuatro submodelos:

- Preprocessor (fp32): recibe `audio` con forma `[1, 400000]` (25 s a 16 kHz) y devuelve `feats` con forma `[1, 64, 2499]`, es decir, caracteristicas tipo mel de 64 dimensiones a 100 Hz.
- Encoder (fp16): recibe `feats [1, 64, 2499]` y produce `encoded [1, 768, 625]`, con un factor de submuestreo temporal de 4x (de 2499 a 625 tramas).
- Decoder (fp32): red de prediccion que mantiene estados ocultos y de celda (`hi`, `ci` de forma `[1, 1, 320]`) y devuelve `dec`, `ho`, `co` de forma `[1, 1, 320]`, coherente con una celda recurrente tipo LSTM.
- Joint (fp32): combina `enc [1, 768, 1]` y `dec [1, 320, 1]` en una salida `joint [1, 1, 1, 34]`.

El vocabulario (`vocab.json`) contiene 33 simbolos: un espacio seguido de las letras «а»…«я» sin la «ё». El indice 33 corresponde al token blank. La decodificacion empleada en la verificacion es RNN-T voraz (greedy).

Las innovaciones destacables no estan en la arquitectura, sino en la propia conversion a CoreML, que documenta dos soluciones temporales: la sustitucion de `_cast` (porque torch 2.14 devuelve dimensiones como arrays de un elemento y coremltools 9.0 espera un escalar) y el precálculo de los cos/sin del rotary positional encoding para 625 tramas, ya que la traza rompe el calculo dinamico de la longitud. Esta segunda solucion es la que obliga a que el encoder trabaje solo con entradas fijas de 25 s, rellenando con ceros las ventanas mas cortas.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ruso, con salida de texto sin puntuacion (variante v3_rnnt).
- Transcripcion de audio mono a 16 kHz, procesado en ventanas de hasta 25 s (y fragmentado en ventanas de 20 s en el script de verificacion).
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni planificacion.
- No dispone de capacidades de vision, audio generativo, codigo ni matematicas.
- No es multilingue: esta limitado al ruso.
- Capacidad especial: ejecucion local en hardware Apple mediante CoreML, con encoder en fp16 y el resto en fp32.
- Decodificacion RNN-T voraz integrada en el flujo de verificacion.

## Casos de uso

- Transcripcion local de notas de voz en macOS: la app Recorder v2 puede convertir grabaciones en ruso a texto sin salir del dispositivo, gracias a que las cuatro piezas CoreML se ejecutan en CPU, GPU o Neural Engine.
- Dictado en aplicaciones de escritorio para Apple: al no requerir conectividad, es adecuado para entornos con restricciones de red o de confidencialidad.
- Subtitulado offline de contenido audiovisual en ruso: la ventana fija de 25 s encaja con un pipeline que corta el audio en fragmentos y encadena las transcripciones resultantes.
- Analisis por lotes de grabaciones de call center: el script de verificacion ya demuestra el patron de trocear un WAV largo en ventanas de 20 s y transcribir cada una, reutilizable en un proceso por lotes.
- Indexacion y busqueda de archivos de audio en ruso: la transcripcion local permite construir indices de texto sobre bibliotecas de audio privadas sin subirlas a un servicio externo.
- Investigacion en ASR sobre hardware Apple: sirve como referencia para medir el impacto de la conversion CoreML (fp16 en encoder) frente a la implementacion original en PyTorch.
- Prototipado de funciones de accesibilidad en apps iOS/iPadOS: la disponibilidad de los modelos en formato CoreML facilita integrar dictado o lectura de audio en el ecosistema Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de rendimiento documentado es la verificacion funcional frente al modelo original en torch:

| Metrica | Condicion | Resultado |
|---|---|---|
| Coincidencia de palabras | verify.py sobre WAV 16 kHz mono (primeros 2 min, ventanas de 20 s), comparacion CoreML vs torch | umbral esperado >= 0,97; medido 0,98 en el spike del 12.10 |
| Codigo de salida | verify.py | 0 cuando la coincidencia cumple el umbral |

## Requisitos de hardware

- Destino principal: dispositivos Apple compatibles con CoreML (Mac con Apple Silicon, iPhone, iPad), con ejecucion en CPU, GPU o Neural Engine.
- Almacenamiento: pesos originales de GigaAM de ~430 MB; el repo del modelo ocupa 0,4 GB; los cuatro modelos CoreML se generan en `~/Library/Caches/RecorderModels/gigaam-v3-rnnt/`.
- No aplica a GPU NVIDIA (A100, H100, RTX 4090): CoreML no es el formato de despliegue de esos entornos.
- Despliegue: CoreML / Recorder v2. El resto de runtimes habituales (vLLM, llama.cpp, Ollama, TGI) no aplican a este modelo, ya que es un ASR y no un LLM.
- Conversión: requiere Python 3.11, entorno gestionado con uv, y las dependencias de `tools/gigaam-coreml/requirements.txt`; el trabajo documenta compatibilidad con torch 2.14 y coremltools 9.0.
- Latencia y throughput: no disponibles. No se proporcionan mediciones de velocidad de inferencia en hardware concreto.
- Cabe en GPU de consumo: no aplica en el sentido convencional; si cabe en hardware Apple de consumo (Mac y dispositivos con Neural Engine) por el tamano reducido de los pesos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| gigaam-v3-rnnt-coreml (este) | no disponible | 25 s fijos | ruso | MIT | CoreML (.mlmodelc) |
| GigaAM v3 v3_rnnt (original, SberDevices) | no disponible | no disponible | ruso | MIT | PyTorch |
| OpenAI Whisper large-v3 | ~1550 M | 30 s | ~99 idiomas | MIT | PyTorch / safetensors, con conversiones a otros formatos |

La comparacion con Whisper es de categoria (ASR) pero no de escala: Whisper es un modelo multilingue de gran tamano y ventana de 30 s, mientras que GigaAM v3 apunta especificamente al ruso y su conversion CoreML esta optimizada para el ecosistema Apple. No se dispone de datos de parametros ni de rendimiento comparativo directo entre ambos en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma unico: solo reconoce ruso; no soporta otros idiomas.
- Sin puntuacion: la variante v3_rnnt no genera signos de puntuacion, lo que limita su uso en transcripcion editorial directa.
- Ventana fija de 25 s: el encoder solo funciona con entradas de 25 s debido al precálculo de cos/sin del rotary encoding; las ventanas mas cortas se rellenan con ceros, lo que puede afectar a la precision en fragmentos cortos.
- Procesado por fragmentos, no streaming: el flujo documentado trocea el audio en ventanas de 20 s y las transcribe por separado, sin continuidad entre fragmentos.
- Precisión aproximada: la verificacion admite hasta un 3 % de discrepancia de palabras (umbral 0,97) respecto al modelo original; el encoder en fp16 puede introducir degradacion adicional.
- Fragmentacion del vocabulario: al excluir la «ё», las transcripciones normalizan esa letra, algo a tener en cuenta en busquedas o comparaciones textuales.
- Riesgo de error de reconocimiento: como todo modelo ASR, puede producir sustituciones, omisiones o inserciones de palabras, especialmente con ruido, acentos o audio de baja calidad.
- Licencia MIT: permite uso comercial, pero conviene verificar la procedencia y las condiciones del paquete `gigaam` original de SberDevices.
- Repositorio sin validacion de la comunidad: 0 descargas y 0 likes en HuggingFace en el momento de la consulta, con creacion y actualizacion el 2026-10-12; no hay evidencia de uso en produccion.
- Dependencia fragil: la conversion incluye parches (`_cast`, precálculo de rotary) atados a versiones concretas de torch y coremltools, lo que puede romper con actualizaciones.
- Restriccion de plataforma: el resultado es util solo en hardware Apple; no es portable a servidores x86 con GPU NVIDIA.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dimshraj/gigaam-v3-rnnt-coreml
- Repositorio original de GigaAM (SberDevices / Salute Developers): https://github.com/salute-developers/GigaAM
- Commit de referencia usado en la conversion: 7447938d791c4f3e643386ee22c33777004293a5
