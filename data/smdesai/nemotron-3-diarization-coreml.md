# smdesai/Nemotron-3-Diarization-CoreML

## Resumen

Nemotron 3 Diarization — Core ML es una conversión a Core ML del modelo de diarización de hablantes en streaming Nemotron 3 Diarization de NVIDIA, publicada por el usuario smdesai. El modelo original resuelve el problema de "quién habla y cuándo" en audio real, con soporte para streaming y para inferencia offline, hasta ocho hablantes y salida ordenada por la primera aparición de cada hablante. Esta conversión mantiene esa funcionalidad y la orienta a iOS 18+ y macOS 15+, de modo que la diarización se ejecute en el dispositivo con CPU y Neural Engine de Apple, sin enviar audio a la nube.

Técnicamente es una implementación del esquema Streaming Sortformer dividida en dos grafos de Core ML que un bucle anfitrión invoca una vez por fragmento: un preencoder (características Mel a embeddings de trama de 80 ms) y un encoder/head (caché de hablantes empaquetada, FIFO y embeddings del fragmento a probabilidades de actividad de hablante). La lógica de Arrival-Order Speaker Cache, la FIFO y el chunking corren en el anfitrión, no dentro de los grafos. La conversión parte del checkpoint `Nemotron-3-Diarization.nemo` (revisión `a435e9867d79e789e90053f9b6d6834053af564a`) sin reentrenar, cuantizar ni podar pesos.

Su relevancia ahora es doble: por un lado, NVIDIA presentó Nemotron 3 Diarization el 23 de septiembre de 2026 como modelo de pesos abiertos, con soporte de serving anunciado por Baseten el mismo día; por otro, esta conversión demuestra que el modelo puede ejecutarse en tiempo real en hardware de consumo Apple (20,8× tiempo real en un iPhone 17 Pro con el encoder BC1S) con resultados idénticos a la referencia FP32 de NeMo en las pruebas de equivalencia documentadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Streaming Sortformer dividido en dos grafos Core ML: preencoder (Mel → embeddings de trama de 80 ms) y encoder/head (caché de hablantes + FIFO + embeddings del fragmento → probabilidades de hablante); atención por cabezas en la variante BC1S |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | Contexto de streaming fijo: 1 fotograma de encoder a la izquierda (0,08 s) y 4 a la derecha (0,32 s); fragmento de 9 fotogramas de encoder (0,72 s); caché de hablantes y FIFO de 264 fotogramas cada una; periodo de actualización de la caché de 222 fotogramas |
| Tipos de cuantización | FP32 y FP16 (sin cuantización de pesos: la conversión no cuantiza ni poda); variante de encoder en disposición BC1S channel-first para Neural Engine |
| Idiomas soportados | no disponible (modelo de audio; la model card no declara idiomas) |
| Licencia | openmdw-1.1 |
| Formato de pesos | `.mlpackage` (Core ML), compilado a `.mlmodelc`; pipelines en `pipeline.json`; `learned_silence_embedding.f32le` en float32 little-endian |
| Modelo base | nvidia/Nemotron-3-Diarization (revisión `a435e9867d79e789e90053f9b6d6834053af564a`, SHA-256 `867c53f552998f772e5b5e5c082962ae85ee7ca5669c2bc17d7f615133d4e96d`) |
| Número de hablantes | hasta 8 |
| Resolución de salida | 10 ms (8× sobremuestreo de la trama de encoder de 80 ms) |
| Frecuencia de muestreo de entrada | 16 kHz, mono, float32 |
| Umbral de decisión por defecto | 0,5 (salidas sigmoide) |
| Tamaño del repositorio | 0,8 GB |
| Formatos de pipeline incluidos | `pipeline.json` (FP16 preencoder + FP16 encoder/head BC1S, recomendado), `pipeline-fp16.json` (FP16 estándar), `pipeline-fp32.json` (referencia numérica) |
| Plataformas | iOS 18+ y macOS 15+ |
| Librería | coreml |

## Arquitectura y entrenamiento

La arquitectura es una conversión directa del Streaming Sortformer de NVIDIA, no un modelo nuevo: no se reentrenaron, cuantizaron ni podaron pesos. El sistema se reparte en dos grafos de formas fijas. El preencoder recibe `mel_features` con forma `[1, 112, 128]` en orden temporal (8 fotogramas a la izquierda, 72 centrales y 32 a la derecha, con relleno de ceros) más `mel_length`, y produce `chunk_embeddings` de forma `[1, 14, 512]` y `chunk_embedding_length`. El encoder/head recibe `packed_embeddings` de forma `[1, 542, 512]` (caché de hablantes, después FIFO, después embeddings del fragmento, con relleno de ceros) y `packed_length`, y devuelve `native_probabilities` de forma `[1, 4336, 8]` con la actividad de hablante a 10 ms y `cache_probabilities` de forma `[1, 542, 8]` por fila empaquetada para actualizar caché y FIFO.

El frontend Mel se define de forma explícita: audio de 16 kHz mono float32, preénfasis de 0,97, STFT centrada (FFT de 512, ventana Hann de 400, salto de 160, relleno de ceros constante), espectro de potencia, 128 bins Mel de Slaney y `log(x + 2^-24)`, sin dither ni normalización de características; los fotogramas válidos son `floor(muestras / 160)`. La ventana y el banco de filtros provienen de los búferes del propio checkpoint, almacenados en bfloat16 por NVIDIA, por lo que difieren ligeramente de valores float32 recalculados. La model card advierte de que cada espectro de potencia debe proyectarse sobre el banco de filtros fotograma a fotograma, porque un producto matricial por lotes altera el redondeo en coma flotante y hace divergir flujos largos.

El bucle de streaming es responsabilidad del anfitrión: por cada fragmento se recortan los fotogramas Mel izquierdo, central y derecho, se ejecuta el preencoder, se empaquetan hasta 542 filas `[caché de hablantes | FIFO | embeddings del fragmento]`, se ejecuta el encoder/head, se emiten las filas del fragmento central de `native_probabilities` y se actualizan FIFO y caché a partir de `cache_probabilities` siguiendo el Streaming Sortformer de NVIDIA NeMo, con compresión de la Arrival-Order Speaker Cache cada 222 fotogramas y el embedding de silencio aprendido para el relleno. En la llamada final se vacían los fragmentos restantes con contexto derecho nulo. La configuración de formas fijas corresponde al perfil de "baja latencia" (1,04 s) de la model card del modelo original; otras configuraciones de latencia exigen una reexportación con formas distintas.

La model card no documenta la composición del dataset de entrenamiento, el número de tokens ni el uso de RLHF o DPO para el modelo base, por lo que esos datos figuran como no disponibles en esta ficha.

## Capacidades

- Diarización de hablantes en streaming y offline: determina "quién habla y cuándo" y admite hasta ocho hablantes simultáneos.
- Ordenación por primera aparición: las etiquetas de hablante se ordenan según la primera intervención de cada uno en el audio de entrada.
- Detección de actividad de voz: `pipeline_tag` declarado como `voice-activity-detection`, con umbral de decisión por defecto de 0,5 sobre salidas sigmoide.
- Salida temporal fina: probabilidades a 10 ms por hablante (8× sobremuestreo de la trama de encoder de 80 ms).
- Inferencia en dispositivo: ejecución con CPU y Neural Engine de Apple en iOS 18+ y macOS 15+, sin dependencia de servidores externos.
- Integración con pipelines de IA conversacional: el modelo base puede integrarse en pipelines de inferencia de NeMo Framework para producir probabilidades de actividad por hablante o etiquetas genéricas de hablante y marcas de tiempo tras el postprocesado.
- Tres perfiles numéricos seleccionables mediante pipeline: FP32 de referencia, FP16 estándar y FP16 con encoder en disposición BC1S optimizada para Neural Engine.
- No se documentan en la información disponible capacidades de generación de texto, código, matemáticas, visión, audio generativo, tool calling ni agentes; se trata de un modelo exclusivamente de diarización y actividad de voz.

## Casos de uso

- Transcripción de reuniones con etiquetado de hablantes en apps de iOS y macOS: el modelo permite asignar cada segmento de una transcripción ASR a un hablante concreto, con la ventaja de que todo el audio permanece en el dispositivo y no se envía a ningún servicio externo.
- Notas de voz y grabaciones de entrevistas: con hasta 36 minutos procesados a 20,8× tiempo real en un iPhone 17 Pro, un audio de una hora puede diarizarse en unos pocos minutos en el propio teléfono, lo que resulta adecuado para periodistas o investigadores que trabajan con material sensible.
- Diarización en tiempo real en aplicaciones de videollamada: el perfil de baja latencia (fragmentos de 0,72 s y 1,04 s de latencia global) permite resaltar visualmente al hablante activo mientras la conversación está en curso.
- Activación de asistentes por voz: la detección de actividad de voz integrada sirve como etapa previa para decidir cuándo arrancar un motor ASR o un modelo de lenguaje, reduciendo consumo energético en dispositivos móviles.
- Enriquecimiento de archivos audiovisuales: generación de pistas de hablante y marcas de tiempo para subtitulado, indexación o búsqueda dentro de un catálogo de grabaciones ya almacenadas, usando las mismas formas fijas del modelo.
- Análisis de reuniones clínicas o legales en entornos con requisitos de privacidad: al ejecutarse localmente en Mac o iPhone, evita el traslado de datos de pacientes o clientes a infraestructura ajena a la organización.
- Investigación y evaluación de diarización en hardware Apple: el repositorio incluye manifiestos de conversión por grafo, sumas SHA-256 de cada archivo y comprobaciones de equivalencia, lo que facilita reproducir y auditar el comportamiento respecto al modelo NeMo de referencia.
- Preprocesado dentro de un pipeline de IA conversacional: el modelo base está pensado para producir probabilidades por hablante o etiquetas y timestamps postprocesados que alimenten sistemas posteriores de resumen o análisis de conversaciones.

## Benchmarks y rendimiento

La información disponible no incluye benchmarks convencionales de comprensión o generación (MMLU, HumanEval, GSM8K u otros), porque el modelo es de diarización. Los datos publicados son de validación numérica y de velocidad frente al modelo de referencia.

| Prueba | Resultado |
|---|---|
| Acuerdo estricto FP32 frente a NeMo FP32 (2e-6 absoluto + 2e-5 relativo) | Cumplido en las 305 comprobaciones con teacher forcing, en un flujo cerrado de 30 s (CPU de Mac y iPhone 17 Pro) y en un flujo de estrés de 120 s que cruza cinco compresiones de caché (CPU de Mac); segmentos idénticos |
| DER en muestra de 30 s (collar cero, solapamiento incluido) | 4,52 % |
| FP16 (ambas disposiciones de encoder) | El redondeo FP16 supera la tolerancia estricta de FP32, pero el DER de 30 s es idéntico (4,52 %); 4 de 3.000 fotogramas cambiaron de decisión de hablante en iPhone |
| Encoder BC1S frente a encoder FP16 estándar en Neural Engine de iPhone | Salidas idénticas byte a byte para grabaciones de 30 s, 376 s y 36 min |
| Velocidad, iPhone 17 Pro (iOS 27.2), CPU + Neural Engine, grabación de 36 min, encoder BC1S | 102,9 s (20,8× tiempo real, 34 ms por llamada al encoder) |
| Velocidad, mismo escenario, encoder FP16 estándar | 133,6 s (16,0× tiempo real, 44 ms por llamada al encoder) |
| Memoria pico, BC1S frente a FP16 estándar en iPhone | Aproximadamente 40–60 MB más con BC1S |

No se han publicado resultados de benchmarks comparativos adicionales en la información disponible.

## Requisitos de hardware

- Esta conversión es específica de Core ML: no incluye pesos para CUDA, ROCm ni otros runtimes, de modo que las GPU NVIDIA (A100, H100, RTX 4090) no son aplicables a estos artefactos. Para GPU NVIDIA habría que usar el modelo base en NeMo.
- Hardware objetivo: Apple Silicon en iOS 18+ y macOS 15+, con soporte de Neural Engine. La validación documentada se realizó en CPU de Mac y en un iPhone 17 Pro.
- Memoria: el repositorio completo ocupa 0,8 GB e incluye las variantes FP32, FP16 y BC1S. El encoder BC1S consume aproximadamente 40–60 MB más en pico que el encoder FP16 estándar en iPhone.
- Almacenamiento de pesos por variante: no disponible de forma desglosada en la información proporcionada.
- Opciones de despliegue: carga mediante `MLModel.compileModel(at:)` o Xcode. Los `.mlpackage` se cargan directamente; en producción conviene distribuir el `.mlmodelc` ya compilado, porque el encoder BC1S requiere unos 35 s de compilación para Neural Engine en la primera carga y el sistema cachea el resultado si la ruta es estable.
- Configuración recomendada: `pipeline.json` (preencoder FP16 + encoder/head FP16 BC1S). `pipeline-fp32.json` queda como referencia numérica.
- Latencia y throughput medidos: 34 ms por llamada al encoder con BC1S y 44 ms con FP16 estándar en iPhone 17 Pro, equivalentes a 20,8× y 16,0× tiempo real respectivamente sobre una grabación de 36 minutos.
- No aplican las vías de despliegue habituales de modelos de lenguaje (vLLM, llama.cpp, Ollama, TGI), ya que no existen pesos GGUF ni safetensors en este repositorio.
- Otras configuraciones de latencia distintas del perfil de 1,04 s requieren reexportar los grafos con formas fijas diferentes.

## Comparativa con modelos similares

| Modelo | Formato y plataforma | Hablantes | Contexto de streaming | Licencia | Rendimiento documentado |
|---|---|---|---|---|---|
| smdesai/Nemotron-3-Diarization-CoreML | Core ML (`.mlpackage`/`.mlmodelc`), iOS 18+ y macOS 15+ | Hasta 8 | Fragmento de 0,72 s; contexto izquierdo/derecho de 0,08/0,32 s; latencia 1,04 s | openmdw-1.1 | DER 4,52 % en muestra de 30 s; 20,8× tiempo real en iPhone 17 Pro (BC1S); equivalencia byte a byte con FP16 estándar |
| nvidia/Nemotron-3-Diarization | Pesos NeMo para NeMo Framework, GPU NVIDIA | Hasta 8 | No disponible en la información recogida | No disponible en la información recogida | Referencia FP32 usada en la validación de la conversión: acuerdo estricto en 305 comprobaciones y flujos de 30 s y 120 s |
| nvidia/Nemotron-3-Diarization-preview | Pesos NeMo (versión preview) | Hasta 8 | No disponible en la información recogida | No disponible en la información recogida | No disponible en la información recogida |
| Otras alternativas de diarización (por ejemplo, basadas en pyannote) | No disponible | No disponible | No disponible | No disponible | No disponible |

El número de parámetros totales no se publica para ninguno de los modelos listados en la información disponible, por lo que la comparación cuantitativa de tamaño no puede completarse.

## Limitaciones y advertencias

- Modelo derivado: al ser una conversión del checkpoint de NVIDIA sin reentrenamiento, hereda cualquier sesgo, limitación o error del modelo base. La model card de esta conversión no documenta sesgos ni evaluación de equidad.
- Tope de ocho hablantes y ordenación por primera aparición: no hay agrupación global de hablantes ni identificación biométrica; las etiquetas se asignan por orden de llegada y pueden cambiar si un hablante no aparece al principio del audio.
- Riesgo de alucinación en sentido amplio: al ser un clasificador de actividad por hablante, los errores se manifiestan como segmentos mal asignados o falsos positivos de actividad, no como texto inventado; el umbral por defecto de 0,5 es un parámetro sensible que altera las decisiones.
- Validación limitada: las comprobaciones de equivalencia se hicieron contra el modelo de referencia en un conjunto reducido de grabaciones (30 s, 120 s, 376 s y 36 min) y la propia model card indica que son "unas pocas grabaciones". No hay evaluación sobre corpus de diarización estándar publicada en esta ficha.
- Dependencia de formas fijas: el perfil incluido corresponde a la configuración de baja latencia (1,04 s). Cambiar la latencia objetivo exige reexportar los grafos; no es un ajuste de tiempo de ejecución.
- Fragilidad numérica del frontend: proyectar el espectro de potencia sobre el banco de filtros mediante un producto matricial por lotes cambia el redondeo y puede hacer divergir flujos largos. Debe hacerse fotograma a fotograma, y la ventana y el banco de filtros deben tomarse del checkpoint (almacenados en bfloat16), no recalcularse en float32.
- Coste de compilación: el encoder BC1S necesita unos 35 s de compilación para Neural Engine en la primera carga. Distribuir `.mlpackage` sin compilar en una aplicación de producción introduciría esa espera.
- Idiomas: la model card no declara idiomas soportados. El modelo opera sobre audio, pero no hay documentación de cobertura o comportamiento diferencial por idioma o acento.
- Licencia openmdw-1.1: conviene revisar los términos completos de OpenMDW y las condiciones asociadas al modelo base de NVIDIA antes de un uso comercial, ya que esta ficha no puede sustituir la lectura de la licencia.
- Adopción nula registrada: el repositorio figura con 0 descargas y 0 intereses en el momento de la consulta, por lo que no existe evidencia pública de uso en producción ni de mantenimiento continuado.
- Datos ausentes: no se publican el número de parámetros, la composición del dataset de entrenamiento, el uso de RLHF o DPO ni el desglose de tamaño de cada variante de pesos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/smdesai/Nemotron-3-Diarization-CoreML
- Modelo base en HuggingFace: https://huggingface.co/nvidia/Nemotron-3-Diarization
- Versión preview del modelo base: https://huggingface.co/nvidia/Nemotron-3-Diarization-preview
- Nota de prensa sobre el lanzamiento: https://www.unite.ai/nvidia-releases-nemotron-3-diarization-open-weight-speaker-model/
- README del modelo base en GitHub: https://github.com/AMAImedia/Nemotron-3-Diarization-preview/blob/main/README.md
- Ficha en exploreai.tools: https://exploreai.tools/ai-models/nemotron-3-diarization-preview
- Artículos en arXiv: referenciados por la model card del modelo base, pero sus identificadores no están disponibles en la información proporcionada.
