# Rlamas/Cohere-Jordanian-Dialect

## Resumen

Cohere Jordanian Dialect es un modelo de reconocimiento automático del habla (ASR) especializado en la transcripción de audio en dialecto jordano del árabe. Se trata de un fine-tune completo del modelo base CohereLabs/cohere-transcribe-arabic-07-2026, desarrollado por el usuario Rlamas y publicado en Hugging Face con licencia Apache 2.0. El modelo emplea una arquitectura híbrida de codificador Conformer y decodificador Transformer, con aproximadamente 2 065 millones de parámetros, y está diseñado para convertir audio en texto con alta precisión en contextos donde el árabe dialectal jordano es predominante.

La relevancia de este modelo radica en que los dialectos árabes, y en particular el jordano, están tradicionalmente infrarrepresentados en los sistemas ASR comerciales, que suelen optimizarse para el árabe estándar moderno. Frente al checkpoint base, el fine-tune reduce la tasa de error de caracteres (CER) de 0,156 a 0,0783 y la tasa de error de palabras (WER) de 0,350 a 0,1899 en datos de evaluación reservados, lo que supone una mejora sustancial. El modelo se distribuye con todos los archivos de procesador y tokenizador necesarios, por lo que es autocontenido y puede ejecutarse directamente sin depender del repositorio base en tiempo de carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador Conformer + decodificador Transformer |
| Parametros totales | 2 065 770 752 (2,07 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo ASR, procesa audio de duracion variable) |
| Tipos de cuantizacion | FP8, AWQ (INT4), bitsandbytes 8-bit y 4-bit (NF4) |
| Idiomas soportados | Arabe (enfocado en dialecto jordano), ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 4,1 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura del checkpoint base de Cohere, compuesta por cuatro etapas principales: un extractor de características de audio que convierte la forma de onda en espectrogramas Mel normalizados; un codificador Conformer que procesa estos espectrogramas mediante capas de atencion y comprime la secuencia temporal para mayor eficiencia; un inyector de prompt que especifica el idioma, la puntuacion, la capitalizacion y la normalizacion inversa de texto, controlando el estilo de salida; y un decodificador Transformer ligero que traduce las caracteristicas acusticas a tokens de texto en arabe. Durante el entrenamiento se utilizo un optimizador de 8 bits (adamw_bnb_8bit) para reducir el consumo de memoria GPU.

El fine-tune se realizo mediante un barrido de tasa de aprendizaje sobre los valores 5e-6, 1e-5, 2e-5 y 5e-5, evaluando tres epocas para cada uno y seleccionando la mejor por CER. La tasa ganadora fue 5e-5, con la que se ejecuto un entrenamiento final de 8 epocas (las 5 epocas iniciales no fueron suficientes para estabilizar el modelo). Los hiperparametros finales incluyen un tamano de lote efectivo de 128 (lote 8 con 16 pasos de acumulacion), precision BFloat16, warmup del 5 %, weight decay de 0,01 y gradient checkpointing activado. El entrenamiento completo duro 1 hora y 28 minutos en una GPU NVIDIA L40S. No se especifica la composicion del dataset de entrenamiento ni el numero de tokens, pero se trata de un ajuste completo (full fine-tune) sobre el modelo base, no de un entrenamiento desde cero.

## Capacidades

- Transcripcion de voz a texto en arabe dialectal jordano con alta precision, superando al modelo base en CER y WER.
- Soporte adicional para ingles, lo que permite transcribir audio mixto o cambiar de idioma segun el prompt.
- Control de estilo de salida mediante el inyector de prompt: permite activar o desactivar puntuacion, capitalizacion y normalizacion inversa de texto (por ejemplo, convertir numeros escritos en cifras a su forma textual).
- Procesamiento de audio en estéreo: el modelo promedia automaticamente los canales a mono y remuestrea a 16 kHz.
- Cuantizable para despliegue eficiente: compatible con FP8 y AWQ (INT4) en vLLM, y con bitsandbytes (8-bit y 4-bit NF4) en Transformers para inferencia en hardware limitado.
- No soporta inferencia en streaming; la transcripcion se realiza sobre archivos de audio completos.

## Casos de uso

- Transcripcion de llamadas de atencion al cliente en Jordania: el modelo puede convertir grabaciones de centros de contacto en texto para su analisis posterior, mejorando la comprension de conversaciones en dialecto jordano que los sistemas ASR genericos transcriben con errores frecuentes.
- Generacion de subtitulos para contenido audiovisual local: creadores de contenido, televisiones y plataformas de video pueden emplear el modelo para subtitular automaticamente entrevistas, noticias o series en arabe jordano, reduciendo el coste de transcripcion manual.
- Documentacion de reuniones y actas en entornos empresariales: grabaciones de reuniones internas en arabe dialectal pueden transcribirse para generar actas escritas, facilitando la busqueda y el archivo de informacion.
- Asistentes de voz y aplicaciones de dictado: el modelo puede integrarse en aplicaciones moviles o de escritorio para dictado de mensajes, notas o correos electronicos en dialecto jordano, ofreciendo una alternativa a los teclados tradicionales.
- Analisis de contenido en investigacion social y linguistica: investigadores que estudian el arabe jordano pueden transcribir entrevistas o grabaciones de campo para analisis cualitativo, con una precision suficiente para evitar la re-transcripcion manual exhaustiva.
- Servicios de transcripcion medica y legal: consultas medicas o declaraciones legales grabadas en dialecto jordano pueden transcribirse para expedientes, siempre que se apliquen los controles de calidad y privacidad adecuados.

## Benchmarks y rendimiento

El modelo fue evaluado sobre datos de prueba reservados (held-out) utilizando las metricas CER y WER de la libreria `jiwer`. La tabla siguiente compara el rendimiento del fine-tune con el del modelo base:

| Metrica | Modelo base (Cohere Transcribe Arabic) | Fine-tune (Cohere Jordanian Dialect) |
|---|---|---|
| CER | 0,156 | 0,0783 |
| WER | 0,350 | 0,1899 |

Ademas, se midio la velocidad de inferencia en 10 registros aleatorios utilizando 1 nucleo de CPU, 4 GB de RAM y una GPU NVIDIA T4: el factor de tiempo real (RTF) medio fue de 0,2156 y la mediana de 0,1812. No se han publicado resultados comparativos con otros modelos ASR especificos para dialecto jordano en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Dado el tamano de 2,07 B parametros, se estima que con cuantizacion de 4 bits (NF4) el modelo puede ejecutarse en GPUs consumer con 8 GB de VRAM, y con 8 bits en GPUs de 12-16 GB, aunque estos valores son orientativos y no han sido confirmados por el autor.
- GPU recomendadas: NVIDIA T4 (utilizada en las pruebas de inferencia), L40S (utilizada en el entrenamiento). Tambien son adecuadas GPUs de la serie RTX 30/40 con al menos 8 GB de VRAM para versiones cuantizadas.
- Compatibilidad con consumer GPU: si, especialmente con cuantizacion de 4 u 8 bits mediante bitsandbytes.
- Opciones de despliegue: vLLM (soporte nativo de la clase `cohere_asr` con FP8 y AWQ), Transformers con `device_map="auto"` y cuantizacion via bitsandbytes, o mediante la API de Cohere si se prefiere el servicio gestionado.
- Latencia y throughput: RTF medio de 0,2156 en T4, lo que implica que un minuto de audio se transcribe en aproximadamente 13 segundos en esa GPU. No se proporcionan datos de throughput en produccion.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos ASR especificos para dialecto jordano con los que comparar directamente. La unica comparativa disponible es con el modelo base CohereLabs/cohere-transcribe-arabic-07-2026, del cual deriva:

| Modelo | Parametros | Idiomas | CER (jordano) | WER (jordano) | Licencia |
|---|---|---|---|---|---|
| CohereLabs/cohere-transcribe-arabic-07-2026 (base) | 2,07 B | Arabe, ingles | 0,156 | 0,350 | Apache 2.0 (acceso restringido) |
| Rlamas/Cohere-Jordanian-Dialect (fine-tune) | 2,07 B | Arabe (jordano), ingles | 0,0783 | 0,1899 | Apache 2.0 |

El fine-tune mejora significativamente ambas metricas sobre el base, lo que confirma su especializacion. No se han encontrado otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado en dialecto jordano; su rendimiento en otros dialectos arabes (magrebi, egipcio, levantino no jordano, etc.) puede ser inferior al del modelo base, que cubre un espectro mas amplio.
- No soporta inferencia en streaming, lo que limita su uso en aplicaciones de transcripcion en tiempo real.
- Requiere una version especifica de `transformers` (5.13.0); versiones posteriores (5.15.0+) o anteriores no son compatibles, lo que puede dificultar su integracion en entornos con dependencias actualizadas.
- El modelo base es un repositorio con acceso restringido (gated); es necesario aceptar los terminos en la pagina del modelo base y disponer de un token de Hugging Face con permiso de lectura para descargar el fine-tune.
- No se han documentado sesgos especificos, pero al ser un fine-tune sobre un corpus no descrito, podria reflejar sesgos presentes en los datos de entrenamiento (por ejemplo, variaciones de genero, edad o registro linguistico).
- Riesgo de alucinacion en transcripcion: como cualquier modelo ASR, puede producir texto que no corresponde al audio, especialmente en condiciones de ruido, solapamiento de hablantes o acentos poco representados.
- La licencia Apache 2.0 permite uso comercial, pero el acceso al modelo base esta condicionado por los terminos de Cohere; se recomienda revisar dichos terminos antes de un despliegue en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rlamas/Cohere-Jordanian-Dialect
- Modelo base: https://huggingface.co/CohereLabs/cohere-transcribe-arabic-07-2026
- Documentacion de modelos de Cohere: https://docs.cohere.com/docs/models
- Vision general de modelos de Cohere: https://cohere.com/models-overview
- Articulo de arXiv sobre evaluacion de LLMs en arabe dialectal (contexto general): https://arxiv.org/pdf/2412.04193v2
