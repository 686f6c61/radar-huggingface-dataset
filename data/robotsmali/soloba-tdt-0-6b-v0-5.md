# RobotsMali/soloba-tdt-0.6b-v0.5

## Resumen

`soloba-tdt-0.6b-v0.5` es un modelo de reconocimiento automático de voz (ASR) desarrollado por RobotsMali, una iniciativa que busca impulsar tecnologías del lenguaje para lenguas africanas. Se trata de un ajuste fino (fine-tuning) del modelo `nvidia/parakeet-tdt-0.6b-v2` de NVIDIA, especializado en la transcripción de audio en bambara (bm), una lengua mandé hablada principalmente en Malí. El modelo emplea una arquitectura FastConformer con decodificador Token-and-Duration Transducer (TDT), una variante de RNN-T que predice simultáneamente el token y su duración, lo que permite una decodificación eficiente y de baja latencia.

El modelo fue entrenado durante 82 628 pasos sobre un subconjunto de 100 horas del dataset African Next Voices (ANV), con un tokenizador propio entrenado sobre las transcripciones del conjunto de entrenamiento. Está liberado bajo licencia CC-BY-4.0, lo que permite su uso comercial con atribución. Es relevante porque aborda la escasez de recursos ASR para lenguas de África occidental, un área tradicionalmente desatendida por los grandes proveedores de tecnología del habla. No obstante, el propio autor advierte que es parte de una investigación en curso y que puede no generalizar bien en todas las condiciones de habla y dialectos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer encoder + Token-and-Duration Transducer (TDT) decoder |
| Parametros totales | 0,6 B (600 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, no aplica contexto de tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Bambara (bm) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | NeMo (checkpoint .nemo) |

## Arquitectura y entrenamiento

El modelo utiliza un encoder FastConformer, una versión optimizada del Conformer que incorpora downsampling convolucional depthwise-separable 8x, lo que reduce el coste computacional y acelera la inferencia. El decodificador es un Token-and-Duration Transducer (TDT), una variante de RNN-T que aprende a predecir conjuntamente el token de salida y su duración, mejorando la eficiencia en la decodificación en comparación con los transductores tradicionales.

El entrenamiento se realizó con NVIDIA NeMo, partiendo de los pesos de `nvidia/parakeet-tdt-0.6b-v2` y ajustándolos durante 82 628 pasos sobre un subconjunto de 100 horas del dataset African Next Voices (ANV). El tokenizador se entrenó sobre las transcripciones del conjunto de entrenamiento de ANV mediante el script `process_asr_text_tokenizer.py` de NeMo. El modelo no fue entrenado con datos de RobotsMali/bam-asr-early ni derivados de Jeli-ASR, lo que explica su nomenclatura particular (v0.5). No se menciona el uso de RLHF ni DPO; el ajuste es supervisado estándar para ASR.

## Capacidades

- Transcripción de audio en bambara: convierte señales de audio mono a texto, aceptando archivos WAV y remuestreando a 16 kHz.
- Decodificación eficiente gracias al decodificador TDT, que predice token y duración de forma conjunta.
- Inferencia de baja latencia, adecuada para aplicaciones en tiempo real.
- No produce capitalizaciones ni puntuaciones de forma consistente.
- No genera etiquetas de eventos acústicos (como risas, ruidos, etc.) presentes en el dataset ANV.
- No soporta tool calling, agentes ni razonamiento multi-paso, al ser un modelo puramente ASR.

## Casos de uso

- Transcripción de entrevistas y testimonios orales en bambara: investigadores y periodistas pueden transcribir grabaciones de campo para su análisis y documentación, gracias a la capacidad del modelo para procesar audio de 16 kHz.
- Subtitulado automático de vídeos en bambara: creadores de contenido y organizaciones pueden generar subtítulos para vídeos en esta lengua, facilitando el acceso a audiencias más amplias.
- Asistencia a la documentación lingüística: lingüistas que trabajan con lenguas mandé pueden utilizar el modelo para obtener transcripciones preliminares y acelerar el trabajo de anotación manual.
- Archivado y digitalización de material sonoro: instituciones culturales pueden transcribir archivos históricos en bambara para hacerlos buscables y preservarlos digitalmente.
- Desarrollo de asistentes de voz en bambara: el modelo puede integrarse como componente de reconocimiento de voz en aplicaciones móviles o sistemas embebidos, aunque requiere adaptación adicional para entornos ruidosos.
- Evaluación de calidad de datos de audio: al ser un modelo ligero (0,6 B), puede usarse para verificar la calidad de transcripciones generadas por otros sistemas o para filtrar datos de entrenamiento.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en la model card, sin verificación independiente:

| Benchmark | Dataset | Split | WER (%) | CER (%) |
|---|---|---|---|---|
| African Next Voices | RobotsMali/afvoices | test | 29,75 | 13,50 |
| Nyana Eval | RobotsMali/nyana-eval | test | 42,43 | 23,35 |

No se han publicado comparaciones con otros modelos ASR para bambara en la información disponible.

## Requisitos de hardware

- No se dispone de datos oficiales de VRAM ni de latencia. Como referencia, un modelo de 0,6 B en FP16 ocupa aproximadamente 1,2 GB de pesos, pero NeMo añade overhead de memoria para el grafo de computación y las activaciones.
- Se recomienda una GPU NVIDIA con al menos 4 GB de VRAM para inferencia en FP16; una RTX 3060 o superior sería suficiente para pruebas.
- Para entrenamiento o fine-tuning adicional, se necesitaría una GPU con mayor memoria (por ejemplo, RTX 3090, A100 o H100), aunque no se especifican requisitos concretos.
- El despliegue se realiza mediante NVIDIA NeMo, que requiere CUDA y PyTorch. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- La inferencia puede ejecutarse en CPU, pero con un rendimiento significativamente menor; se recomienda GPU para uso en producción.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos ASR específicos para bambara con los que comparar directamente. El modelo base `nvidia/parakeet-tdt-0.6b-v2` es multilingüe y no está especializado en bambara, por lo que no se puede establecer una comparativa justa sin datos de rendimiento en esta lengua. No se han encontrado alternativas comerciales o de código abierto para bambara en la información disponible.

## Limitaciones y advertencias

- El modelo es parte de una investigación en curso; el autor advierte que puede no generalizar bien en todas las condiciones de habla y dialectos del bambara.
- No produce capitalizaciones ni puntuaciones de forma consistente, lo que puede dificultar la lectura de transcripciones largas.
- No genera etiquetas de eventos acústicos, a pesar de que el dataset ANV las contiene.
- El modelo fue entrenado con un subconjunto de 100 horas de ANV, por lo que su cobertura de vocabulario y variantes dialectales es limitada.
- Existe riesgo de alucinación en segmentos de audio ambiguos o con ruido, como en cualquier sistema ASR.
- La licencia CC-BY-4.0 permite uso comercial, pero exige atribución al autor.
- El checkpoint fue creado con NeMo 2.5.0; cargarlo con versiones más recientes (2.7.x) puede fallar debido a un esquema de decodificación estricto. Se proporciona un workaround en la model card, pero es un punto de fricción para la reproducibilidad.
- No se han publicado resultados de evaluación en entornos ruidosos ni con habla espontánea, por lo que su rendimiento en condiciones reales puede ser inferior al reportado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RobotsMali/soloba-tdt-0.6b-v0.5
- Dataset African Next Voices: https://huggingface.co/datasets/RobotsMali/afvoices
- Dataset Nyana Eval: https://huggingface.co/datasets/RobotsMali/nyana-eval
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Repositorio de fine-tuning: https://github.com/RobotsMali-AI/bambara-asr/
- Issue de compatibilidad con NeMo: https://github.com/NVIDIA-NeMo/Speech/issues/15658
