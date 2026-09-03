# RobotsMali/soloni-114m-tdt-ctc-v2

## Resumen

`soloni-114m-tdt-ctc-v2` es un modelo de reconocimiento automático de voz (ASR) para el idioma bambara (código `bm`), desarrollado por RobotsMali, una iniciativa centrada en tecnologías del lenguaje para lenguas africanas. Se trata de un fine-tuning del modelo base `RobotsMali/soloni-114m-tdt-ctc-v0`, entrenado con NVIDIA NeMo durante 210 000 pasos. Su arquitectura híbrida combina un encoder FastConformer con dos decodificadores independientes pero entrenados conjuntamente: un decodificador TDT (Token-and-Duration Transducer) autorregresivo y un decodificador convolucional basado en pérdida CTC (Connectionist Temporal Classification). El modelo tiene 114 millones de parámetros y está diseñado específicamente para transcribir audio en bambara, un idioma con escasos recursos computacionales.

La relevancia de este modelo radica en que aborda la brecha de recursos para ASR en lenguas africanas de bajos recursos. A diferencia de su versión base, esta versión no genera puntuación ni mayúsculas, ya que dichos elementos no estaban presentes en los datos de entrenamiento. El modelo se publica bajo licencia CC-BY-4.0 y se enmarca en un esfuerzo de investigación en curso, por lo que se esperan mejoras en versiones futuras. Su tamaño compacto (114M) lo hace adecuado para despliegue en entornos con recursos limitados, aunque no se han publicado especificaciones oficiales de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-TDT-CTC híbrido (encoder FastConformer con downsampling 8x, decodificador TDT autorregresivo y decodificador CTC convolucional) |
| Parametros totales | 114 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (para ASR, se refiere a duración máxima de audio; no especificada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Bambara (bm) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | NeMo (.nemo), basado en PyTorch; no se especifica safetensors |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura híbrida FastConformer-TDT-CTC. FastConformer es una versión optimizada del modelo Conformer que incorpora downsampling convolucional depthwise-separable con factor 8, lo que reduce el coste computacional y acelera la inferencia. El encoder extrae representaciones acústicas que alimentan dos decodificadores: un decodificador TDT (Token-and-Duration Transducer) que produce transcripciones de forma autorregresiva, y un decodificador CTC que aplica una pérdida de clasificación temporal conexionista. Ambos decodificadores se entrenan conjuntamente, lo que permite elegir entre dos estrategias de decodificación según el caso de uso.

El fine-tuning se realizó con NVIDIA NeMo durante 210 000 pasos, partiendo del checkpoint `RobotsMali/soloni-114m-tdt-ctc-v0`. El tokenizador se entrenó sobre las transcripciones del conjunto de entrenamiento de `RobotsMali/kunkado`, un dataset de texto en bambara. No se menciona el uso de RLHF ni DPO, ya que no son técnicas habituales en ASR. Una característica destacable es que el modelo no genera puntuación ni mayúsculas, lo que simplifica la salida pero puede requerir postprocesamiento adicional en aplicaciones que necesiten texto formateado.

## Capacidades

- Reconocimiento de voz automático para el idioma bambara, transcribiendo audio a texto plano.
- Soporte de doble decodificación: TDT (autorregresiva) y CTC, seleccionables según la configuración.
- Acepta audio de entrada a 16 kHz mono, con preprocesador integrado que realiza resampling automático para frecuencias de muestreo superiores.
- No incluye capacidades de tool calling, agentes, visión ni procesamiento de lenguaje natural adicional; es exclusivamente un modelo de ASR.
- No produce puntuación ni mayúsculas en la transcripción.
- Multilingüe: únicamente bambara; no se reportan otros idiomas.

## Casos de uso

- Transcripción de reuniones y discursos en bambara: el modelo puede convertir grabaciones de audio (por ejemplo, asambleas comunitarias o conferencias) en texto, facilitando la documentación y el análisis posterior. Su tamaño compacto permite ejecutarlo en portátiles con GPU básica.
- Subtitulado automático de vídeos en bambara: integrado en un pipeline de procesamiento de vídeo, el modelo genera subtítulos en tiempo real o en lote, útil para medios de comunicación locales y creadores de contenido.
- Asistente de voz para aplicaciones móviles en Mali: al ser ligero, puede desplegarse en servidores modestos o incluso en dispositivos edge, permitiendo comandos de voz o dictado en bambara dentro de apps de salud, educación o agricultura.
- Archivado y digitalización de contenido oral: organizaciones culturales pueden transcribir entrevistas, historias tradicionales o noticias radiofónicas en bambara, preservando el patrimonio lingüístico en formato textual.
- Accesibilidad para personas con discapacidad auditiva: la transcripción automática de audio en bambara puede alimentar sistemas de subtitulado en directo o generación de texto para lectura, mejorando la inclusión.
- Investigación lingüística y desarrollo de corpus: el modelo sirve como herramienta para anotar automáticamente grabaciones en bambara, acelerando la creación de datasets etiquetados para otros fines de PLN.
- Atención al cliente en bambara: aunque no tiene capacidades de diálogo, puede transcribir llamadas de soporte para su posterior análisis o enrutamiento, reduciendo la barrera idiomática en servicios locales.

## Benchmarks y rendimiento

Los resultados oficiales declarados por el autor en la model card son los siguientes:

| Dataset | Split | Métrica | Valor |
|---|---|---|---|
| African Next Voices (`RobotsMali/afvoices`) | test | WER | 28.59 % |
| African Next Voices (`RobotsMali/afvoices`) | test | CER | 12.95 % |
| Nyana Eval (`RobotsMali/nyana-eval`) | test | WER | 36.07 % |
| Nyana Eval (`RobotsMali/nyana-eval`) | test | CER | 20.24 % |

No se han publicado comparaciones con otros modelos ASR para bambara en la información disponible. Los valores de WER y CER indican un rendimiento moderado, con mayor error en el conjunto Nyana Eval, probablemente por diferencias dialectales o de condiciones de grabación.

## Requisitos de hardware

- No se han publicado requisitos oficiales de VRAM ni GPU específicas en la documentación del modelo.
- Dado el tamaño de 114 millones de parámetros, se estima que la inferencia en FP32 requiere aproximadamente entre 0.5 y 1 GB de VRAM solo para los pesos, aunque el uso de memoria real dependerá del lote y la duración del audio. Esta es una estimación orientativa, no un dato oficial.
- Es probable que el modelo quepa en GPUs de consumo como la NVIDIA RTX 3060 (12 GB) o incluso en GPUs integradas con suficiente memoria compartida, pero no hay confirmación del autor.
- El despliegue se realiza mediante NVIDIA NeMo, que permite ejecución en GPU y CPU. No se mencionan otros frameworks como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Para la decodificación TDT, se utiliza CUDA Graphs por defecto; en GPUs o versiones de CUDA incompatibles, es necesario desactivar esta opción (ver limitaciones).

## Comparativa con modelos similares

No se dispone de información sobre otros modelos ASR específicos para bambara con los que comparar directamente. Modelos multilingües como Whisper (de OpenAI) podrían ofrecer soporte parcial para bambara, pero no se han publicado resultados comparativos en la documentación del modelo. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El autor advierte que el modelo es parte de una investigación en curso y puede no generalizar bien en todas las condiciones de habla y dialectos del bambara.
- No genera puntuación ni mayúsculas, lo que puede dificultar la legibilidad en aplicaciones que requieran texto formateado; se necesita postprocesamiento adicional.
- El modelo solo soporta bambara; no es útil para otros idiomas.
- Existe un problema de compatibilidad con versiones de NeMo posteriores a la 2.5.0: la carga del checkpoint puede fallar debido a un esquema de decodificación estricto que espera `key_phrase_items_list`. Se proporciona un workaround en la documentación, pero es un punto de fricción para usuarios que usen versiones recientes.
- La decodificación TDT usa CUDA Graphs por defecto, lo que puede provocar errores de CUDA en ciertas GPUs; hay que desactivar esta opción manualmente si aparece `RuntimeError: CUDA error: invalid argument`.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero no hay garantías de rendimiento en producción; se recomienda validar el modelo con datos propios antes de un despliegue crítico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RobotsMali/soloni-114m-tdt-ctc-v2
- Modelo base: https://huggingface.co/RobotsMali/soloni-114m-tdt-ctc-v0
- Repositorio de código de fine-tuning: https://github.com/RobotsMali-AI/bambara-asr/
- Dataset African Next Voices: https://huggingface.co/datasets/RobotsMali/afvoices
- Dataset Nyana Eval: https://huggingface.co/datasets/RobotsMali/nyana-eval
- NVIDIA NeMo: https://github.com/NVIDIA/NeMo
- Issue de compatibilidad con NeMo 2.7.x: https://github.com/NVIDIA-NeMo/Speech/issues/15658
