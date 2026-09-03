# RobotsMali/soloba-ctc-0.6b-v0

## Resumen

`soloba-ctc-0.6b-v0` es un modelo de reconocimiento automático del habla (ASR) desarrollado por RobotsMali, una iniciativa que busca impulsar tecnologías del lenguaje para el bambara, una lengua mandé hablada principalmente en Malí. Se trata de un ajuste fino (fine-tuning) del modelo `nvidia/parakeet-ctc-0.6b` de NVIDIA, especializado en la transcripción de audio en bambara. El modelo aborda la escasez de recursos ASR para lenguas africanas de bajos recursos, ofreciendo una herramienta práctica para transcribir voz en contextos reales.

La arquitectura combina un encoder FastConformer con un decoder convolucional entrenado con pérdida CTC (Connectionist Temporal Classification). Con aproximadamente 600 millones de parámetros, el modelo procesa audio monoaural a 16 kHz y produce transcripciones de texto. Está liberado bajo licencia CC-BY-4.0 y se distribuye a través de Hugging Face, con soporte para la librería NVIDIA NeMo. Aunque es un modelo de investigación en curso, ya muestra resultados prometedores en los conjuntos de evaluación disponibles, con tasas de error de palabra (WER) que rondan el 35-43% según el conjunto de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer encoder + decoder convolucional con CTC |
| Parametros totales | 0,6 mil millones (600M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (procesa audio de duración variable, sin límite explícito documentado) |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Bambara (bm) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | NeMo (formato .nemo) |

## Arquitectura y entrenamiento

El modelo utiliza un encoder FastConformer, una versión optimizada del Conformer que incorpora downsampling convolucional depthwise-separable con factor 8, lo que reduce el coste computacional manteniendo la capacidad de modelado de dependencias locales y globales. El decoder es una red convolucional que produce una distribución sobre los caracteres del tokenizer, y el entrenamiento se realiza minimizando la pérdida CTC. Esta arquitectura es eficiente para ASR en streaming y no requiere decodificación autoregresiva.

El ajuste fino se realizó sobre el modelo base `nvidia/parakeet-ctc-0.6b` durante 183.086 pasos con el toolkit NVIDIA NeMo. Los datos de entrenamiento provienen de dos conjuntos: `RobotsMali/kunkado`, una colección semietiquetada de aproximadamente 120 horas de habla bambara con anotaciones automáticas, y `RobotsMali/bam-asr-early`, un conjunto de datos temprano con transcripciones manuales. El tokenizer se entrenó sobre las transcripciones del conjunto de entrenamiento de `bam-asr-early` utilizando el script estándar de NeMo. No se aplicaron técnicas de RLHF ni DPO; el entrenamiento se limitó a la supervisión directa con CTC.

## Capacidades

- Transcripción de audio a texto en bambara: el modelo convierte señales de voz en texto, manejando habla continua y vocabulario variado.
- Procesamiento de audio monoaural a 16 kHz: acepta archivos WAV y los re-muestrea internamente, simplificando la integración en pipelines de audio.
- Inferencia con NeMo: se puede cargar y ejecutar fácilmente mediante `nemo.collections.asr.ASRModel.from_pretrained()`.
- No incluye capacidades de tool calling, agentes, razonamiento multi-paso ni visión; es exclusivamente un modelo de ASR.
- No produce capitalización ni puntuación de forma consistente, y no genera etiquetas de eventos acústicos (como ruidos o solapamientos) presentes en algunos conjuntos de datos.

## Casos de uso

- Transcripción de reuniones y conferencias en bambara: el modelo puede transcribir grabaciones de audio de reuniones comunitarias o institucionales, facilitando la generación de actas y la documentación. Su capacidad para procesar audio de larga duración (sin límite explícito) lo hace adecuado para este fin.
- Subtitulado automático de vídeos en bambara: integrado en un pipeline de edición de vídeo, permite generar subtítulos para contenido audiovisual en bambara, mejorando la accesibilidad y el alcance de medios locales.
- Asistentes de voz para aplicaciones móviles: al ser un modelo ligero (0,6B), puede desplegarse en servidores o en dispositivos con recursos moderados, habilitando comandos de voz y dictado en aplicaciones dirigidas a hablantes de bambara.
- Accesibilidad para personas con discapacidad auditiva: la transcripción en tiempo real de conversaciones o eventos puede ayudar a personas con problemas de audición a seguir discursos en bambara, aunque se requiere un sistema de visualización de texto.
- Documentación y preservación lingüística: investigadores y lingüistas pueden usar el modelo para transcribir grabaciones de campo, acelerando la creación de corpus anotados y el estudio de la lengua bambara.
- Atención al cliente por voz en bambara: empresas u organizaciones que operan en Malí pueden implementar sistemas de respuesta de voz interactiva (IVR) que transcriban las consultas de los usuarios, permitiendo un enrutamiento y análisis posterior de las llamadas.

## Benchmarks y rendimiento

Los resultados oficiales declarados por el autor en la model card son los siguientes:

| Conjunto de datos | Métrica | Valor |
|---|---|---|
| Bam ASR Early (test) | WER (%) | 35,18 |
| Bam ASR Early (test) | CER (%) | 19,29 |
| Nyana Eval (test) | WER (%) | 43,36 |
| Nyana Eval (test) | CER (%) | 26,72 |

Estos valores indican un rendimiento moderado, con un WER superior al 35% en el conjunto más favorable. No se han publicado comparaciones con otros modelos ASR para bambara en la información disponible.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la documentación del modelo.
- El tamaño del repositorio es de 2,4 GB, lo que sugiere que los pesos en precisión FP32 ocupan aproximadamente esa cantidad. Para inferencia, se recomienda una GPU con al menos 4 GB de VRAM para evitar cuellos de botella de memoria, aunque podría ejecutarse en CPU con un rendimiento reducido.
- GPUs consumer como NVIDIA RTX 3060 (12 GB) o superiores son suficientes para ejecutar el modelo en tiempo real o casi tiempo real.
- Opciones de despliegue: el modelo está diseñado para usarse con NVIDIA NeMo, por lo que se puede integrar en aplicaciones Python. No se documentan conversiones a otros formatos (ONNX, TensorRT, GGUF) ni soporte para frameworks como vLLM u Ollama.
- La latencia y el throughput no están documentados; dependerán del hardware y de la duración del audio de entrada.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos ASR específicos para bambara con los que comparar directamente. El modelo base `nvidia/parakeet-ctc-0.6b` es multilingüe y cubre varios idiomas, pero no está optimizado para bambara, por lo que una comparación directa no sería representativa. Se recomienda a los usuarios evaluar el modelo en sus propios datos para determinar su idoneidad.

## Limitaciones y advertencias

- El modelo es parte de un esfuerzo de investigación en curso; los autores advierten que puede no generalizar bien a todas las condiciones de habla y dialectos del bambara.
- No produce capitalización ni puntuación de forma consistente, lo que puede dificultar la legibilidad de las transcripciones en aplicaciones que requieran texto formateado.
- No genera etiquetas de eventos acústicos (por ejemplo, ruidos de fondo, solapamientos) que están presentes en algunos conjuntos de datos como Kunkado.
- El rendimiento en entornos ruidosos o con acentos no representados en los datos de entrenamiento puede degradarse significativamente.
- La licencia CC-BY-4.0 permite uso comercial y modificación, siempre que se atribuya adecuadamente, pero no se ofrecen garantías sobre la precisión o idoneidad para usos críticos.
- Al ser un modelo de ASR, no tiene capacidades de razonamiento o generación de texto más allá de la transcripción; no debe utilizarse para tareas que requieran comprensión semántica o diálogo.

## Enlaces

- Modelo en Hugging Face: [RobotsMali/soloba-ctc-0.6b-v0](https://huggingface.co/RobotsMali/soloba-ctc-0.6b-v0)
- Repositorio de código y configuración de fine-tuning: [RobotsMali-AI/bambara-asr](https://github.com/RobotsMali-AI/bambara-asr/)
- Documentación de FastConformer en NeMo: [Fast-Conformer Model](https://docs.nvidia.com/deeplearning/nemo/user-guide/docs/en/main/asr/models.html#fast-conformer)
- Dataset de entrenamiento Kunkado: [RobotsMali/kunkado](https://huggingface.co/datasets/RobotsMali/kunkado)
- Dataset de entrenamiento Bam ASR Early: [RobotsMali/bam-asr-early](https://huggingface.co/datasets/RobotsMali/bam-asr-early)
- Modelo base: [nvidia/parakeet-ctc-0.6b](https://huggingface.co/nvidia/parakeet-ctc-0.6b)
