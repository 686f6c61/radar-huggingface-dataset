# csndhanasekar/sherpa-onnx-indicconformer-ml-int8

## Resumen

Este repositorio contiene una conversión del modelo de reconocimiento automático del habla (ASR) IndicConformer de AI4Bharat para malayalam, exportada al formato ONNX y cuantizada a INT8 para su uso con el motor sherpa-onnx. El modelo original (`ai4bharat/indicconformer_stt_ml_hybrid_ctc_rnnt_large`) es un Conformer híbrido CTC+RNNT de aproximadamente 120 millones de parámetros, entrenado por AI4Bharat sobre 22 lenguas índicas. Esta conversión conserva únicamente la cabeza CTC y el vocabulario específico de malayalam, de modo que el resultado es un modelo más ligero y sencillo de integrar.

La relevancia de esta ficha radica en su orientación a despliegue local: al ser un ONNX INT8, se puede ejecutar íntegramente en CPU, sin conexión a internet y en dispositivos modestos, incluidos teléfonos Android de gama baja o placas tipo Raspberry Pi. Para desarrolladores que necesitan transcripción offline en malayalam, este formato elimina la dependencia de frameworks pesados como NeMo o PyTorch en tiempo de inferencia.

El modelo está publicado por el usuario `csndhanasekar`, no reporta descargas ni valoraciones en el momento de redactar esta ficha y mantiene la licencia MIT del modelo original. No se documenta el proceso de conversión en detalle más allá de la cuantización dinámica de pesos con onnxruntime.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer con cabeza CTC (red neuronal convolucional aumentada con atención tipo transformer); exportada a ONNX |
| Parametros totales | Aproximadamente 120 millones (según la model card; el checkpoint base se denomina "large") |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo ASR; sherpa-onnx procesa la señal por segmentos completos, sin ventana de contexto declarada) |
| Tipos de cuantizacion | INT8 dinámico sobre pesos, mediante onnxruntime |
| Idiomas soportados | Malayalam (`ml`) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.int8.onnx`) acompañado de `tokens.txt` |
| Entrada | Características log-mel de 80 dimensiones con normalización por característica (calculadas por sherpa-onnx) |
| Vocabulario | 257 entradas (256 tokens de malayalam + blank) |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura de partida es un Conformer, un modelo de ASR que combina bloques convolucionales (eficaces para capturar patrones locales en el espectrograma) con capas de auto-atención (que modelan dependencias de largo alcance en la secuencia de audio). El checkpoint original de AI4Bharat es híbrido, con cabezas CTC y RNNT entrenadas de forma conjunta, y comparte un vocabulario único para 22 lenguas índicas. Esta exportación descarta la cabeza RNNT y el vocabulario multilingüe, conservando solo la cabeza CTC y los 256 tokens de malayalam más el símbolo blank, que es exactamente lo que el modelo original emplea cuando se decodifica con `language_id="ml"`.

No se dispone de información sobre el número de horas de audio utilizadas, la composición exacta del dataset de entrenamiento, ni si hubo etapas de ajuste fino con RLHF/DPO (poco habituales en ASR). La innovación técnica destacable de este repositorio concreto es la cuantización dinámica INT8 de los pesos mediante onnxruntime, que reduce el tamaño del modelo y acelera la inferencia en CPU a cambio de una pérdida de precisión que el autor cifra en el apartado de exactitud.

## Capacidades

- Reconocimiento de voz en malayalam a partir de audio muestreado a 16 kHz.
- Decodificación CTC offline: procesa un segmento completo de audio y devuelve la transcripción en una sola pasada.
- Entrada basada en características log-mel de 80 dimensiones, calculadas internamente por sherpa-onnx, lo que simplifica la integración.
- Ejecución totalmente local y sin conexión, sin llamadas a API externas.
- Integración multiplataforma a través de sherpa-onnx: enlaces para Python, C++, C#, Java, Kotlin, Swift y binarios precompilados para Android, iOS, Windows, macOS y Linux.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso; es un modelo puramente acústico.
- No dispone de modo "thinking", capacidades de visión, audio generativo ni síntesis de voz.
- El texto de salida está en minúsculas y sin puntuación, según el protocolo de evaluación descrito por el autor.

## Casos de uso

- Transcripción offline en aplicaciones móviles: al ser un ONNX INT8 de unos 120 MB, puede empaquetarse dentro de una app Android o iOS y transcribir audio en malayalam sin conexión ni costes de servidor.
- Subtitulado de contenido audiovisual en malayalam: el modelo genera transcripciones que después pueden sincronizarse como subtítulos mediante herramientas de alineación temporal.
- Digitalización de archivos de audio históricos o entrevistas: permite convertir grabaciones de voz en texto indexable y buscable, ejecutándose en un portátil sin GPU.
- Asistentes de voz para atención al ciudadano en Kerala: la transcripción local evita enviar audio sensible a servicios en la nube, lo que facilita el cumplimiento de requisitos de privacidad.
- Procesamiento por lotes en servidores modestos: al no requerir GPU, se puede desplegar en instancias CPU económicas para transcribir grandes volúmenes de audio de forma asíncrona.
- Sistemas de dictado médico o administrativo en malayalam: la ventana offline permite transcribir consultas o notas de voz completas de varios minutos en una sola operación.
- Investigación lingüística y creación de corpus: útil para generar transcripciones iniciales de corpus orales que después se revisan manualmente.
- Integración en dispositivos embebidos: el modelo puede ejecutarse en placas tipo Raspberry Pi o dispositivos IoT con CPU ARM, habilitando interfaces de voz locales.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor corresponden a las primeras 100 frases distintas del split de test `ml_in` de FLEURS, en minúsculas y sin puntuación:

| Modelo | WER | CER |
|---|---|---|
| Este modelo (INT8) | 27,0 % | 5,7 % |
| Omnilingual 300M CTC INT8 | 39,1 % | 6,3 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K y similares no aplican a un modelo ASR) en la información disponible. Tampoco se documentan cifras de latencia, RTF ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el archivo de pesos INT8 ocupa del orden de 120 MB y el repositorio completo 0,1 GB, por lo que el consumo de memoria es muy reducido.
- GPU recomendadas: no requiere GPU. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) aceleraría la inferencia, pero el diseño está optimizado para CPU.
- Compatibilidad con GPU de consumo: sí, cabe con holgura en cualquier GPU consumer e incluso en memoria unificada de dispositivos móviles.
- Ejecución sin GPU: sí, es el escenario principal. Funciona en CPU x86 y ARM, incluyendo teléfonos Android de gama baja y placas tipo Raspberry Pi.
- Opciones de despliegue: sherpa-onnx (biblioteca C++ con enlaces a Python, C#, Java, Kotlin, Swift, Go, Rust, Dart, JavaScript y Object Pascal), binarios precompilados y aplicaciones de ejemplo para Android, iOS, Windows, macOS y Linux.
- Latencia y throughput estimados: no disponibles en la información proporcionada; el rendimiento dependerá del número de hilos configurado (`num_threads`, 4 en el ejemplo del autor) y del hardware.
- API de uso: `sherpa_onnx.OfflineRecognizer.from_nemo_ctc(model="model.int8.onnx", tokens="tokens.txt", num_threads=4)`.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Idioma | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (sherpa-onnx-indicconformer-ml-int8) | Conformer CTC, ONNX INT8 | ~120 M | Malayalam | Audio log-mel 80 dim, offline | MIT | HuggingFace, 0 descargas |
| Omnilingual 300M CTC INT8 | CTC, ONNX INT8 | 300 M | Multilingüe | Audio log-mel, offline | No disponible en la información | Referenciado como baseline por el autor |
| Base `ai4bharat/indicconformer_stt_ml_hybrid_ctc_rnnt_large` | Conformer híbrido CTC+RNNT | "large" (el autor de la conversión indica ~120 M) | Malayalam y otras 21 lenguas índicas | Audio log-mel, requiere NeMo/PyTorch | MIT | HuggingFace (AI4Bharat) |
| `parismitaglobalsolutions/indicconformer-sherpa-onnx` | Conversión equivalente para sherpa-onnx, varios idiomas | No disponible | Hindi y otros | Audio log-mel, offline | No disponible en la información | HuggingFace |

El modelo base híbrido, al conservar la cabeza RNNT y un segundo paso de decodificación, tiende a ofrecer mejor exactitud que esta exportación CTC-only, a costa de un tamaño mayor y de un stack de inferencia más pesado. La comparación cuantitativa entre ambos no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La evaluación se realizó sobre solo 100 frases de FLEURS `ml_in`; se trata de una muestra pequeña y no representativa de todos los dominios, registros o acentos del malayalam.
- La salida no incluye puntuación ni mayúsculas, lo que limita su uso directo en productos finales sin un post-procesado.
- Al conservar únicamente la cabeza CTC, se pierde la ganancia de exactitud del decodificador RNNT del checkpoint original.
- El vocabulario se ha reducido a los tokens de malayalam, por lo que el modelo no puede transcribir otras lenguas índicas presentes en el modelo base.
- Es un modelo acústico puro: no genera texto libre, no razona y puede producir errores de reconocimiento en audio con ruido, solapamiento de hablantes, música de fondo o vocabulario especializado.
- El riesgo de "alucinación" en el sentido de los modelos de lenguaje no aplica, pero sí existe riesgo de transcripciones incorrectas o de omisión de segmentos en audio de baja calidad.
- No se documentan sesgos específicos, aunque cualquier modelo entrenado con corpus mayoritariamente de un tipo de habla puede rendir peor con variedades dialectales, hablantes infantiles o personas con trastornos del habla.
- No se describe el proceso exacto de conversión ni se ofrecen scripts de exportación en la información disponible, lo que dificulta reproducir o auditar la cuantización.
- La licencia MIT permite uso comercial, pero se recomienda revisar también las condiciones del modelo base de AI4Bharat y de los datos de entrenamiento originales.
- El repositorio no registra descargas ni valoraciones, por lo que no existe validación independiente de su calidad por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/csndhanasekar/sherpa-onnx-indicconformer-ml-int8
- Modelo base (AI4Bharat IndicConformer Malayalam, CTC+RNNT híbrido): https://huggingface.co/ai4bharat/indicconformer_stt_ml_hybrid_ctc_rnnt_large
- Repositorio sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Documentación de sherpa-onnx: https://k2-fsa.github.io/sherpa/onnx/index.html
- Modelos preentrenados de sherpa-onnx: https://k2-fsa.github.io/sherpa/onnx/pretrained_models/index.html
- Guía de exportación a ONNX del ecosistema icefall/sherpa: https://k2-fsa.github.io/icefall/model-export/export-onnx.html
- Conversión equivalente de otro autor (indicconformer-sherpa-onnx): https://huggingface.co/parismitaglobalsolutions/indicconformer-sherpa-onnx
- Fichero de ejemplo de esa conversión (hindi, INT8): https://huggingface.co/parismitaglobalsolutions/indicconformer-sherpa-onnx/blob/main/hi/model.int8.onnx
