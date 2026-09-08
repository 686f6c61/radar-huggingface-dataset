# AEmotionStudio/moss-transcribe-diarize-models

## Resumen

MOSS-Transcribe-Diarize es un modelo de comprensión de audio desarrollado por el equipo OpenMOSS (MOSI.AI) que unifica en un único sistema la transcripción automática del habla y la diarización de hablantes. Se trata de un modelo end-to-end: un codificador de audio inspirado en Whisper alimenta un decodificador Qwen3 que genera directamente la transcripción con marcas de tiempo por turno y etiquetas de hablante anónimas (S01, S02...), sin necesidad de una etapa posterior de agrupamiento o clustering.

El modelo tiene 0,9 mil millones de parámetros, una ventana de contexto de 128k tokens y es capaz de procesar hasta 90 minutos de audio en una sola pasada. Soporta más de 50 idiomas e incorpora un mecanismo de "hotword prompting" para forzar el reconocimiento de nombres propios y jerga. La información técnica se documenta en el informe arXiv 2601.01554. El repositorio de HuggingFace aquí analizado es un espejo verbatim del modelo original publicado por OpenMOSS, empaquetado para el runtime offline de la DAW MAESTRO. Los pesos son idénticos al original; solo se ha adaptado el tokenizer para que sea compatible con transformers 4.57.x.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio estilo Whisper + decodificador Qwen3 (transformer) |
| Parametros totales | 0,9B |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128k tokens |
| Tipos de cuantizacion | bf16 (unico formato publicado en el repositorio) |
| Idiomas soportados | 50+ idiomas (lista completa no disponible) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, un solo shard) |

## Arquitectura y entrenamiento

MOSS-Transcribe-Diarize es un modelo multimodal que combina un codificador acústico heredero del enfoque Whisper con un decodificador basado en Qwen3, un modelo de lenguaje autoregresivo. La arquitectura procesa la señal de audio completa y, en una única pasada de decodificación, genera texto con timestamps y etiquetas de hablante anónimas. Al integrar la diarización en el propio modelo generativo, se elimina la dependencia de módulos de clustering o de modelos de separación de hablantes, simplificando el pipeline y reduciendo la propagación de errores entre etapas.

La ventana de contexto de 128k tokens permite atender fragmentos de audio de hasta unos 90 minutos, lo que supone una innovación notable frente a los modelos ASR tradicionales que operan con ventanas cortas. El mecanismo de hotword prompting permite introducir nombres propios, jerga o términos específicos como contexto del prompt para mejorar su reconocimiento. No se han publicado datos sobre la composición del dataset de entrenamiento, el número de tokens de audio utilizados ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se especifica el tamaño del codificador ni del decodificador por separado, solo el total de parámetros del modelo.

## Capacidades

- Transcripción automática del habla en más de 50 idiomas.
- Diarización de hablantes integrada en el proceso de generación, con etiquetas anónimas por turno (S01, S02...).
- Emisión de marcas de tiempo a nivel de turno, no solo a nivel de frase.
- Procesamiento de audios largos de hasta 90 minutos en una sola pasada gracias al contexto de 128k tokens.
- Hotword prompting: se pueden proporcionar nombres, términos técnicos o jerga en el prompt para mejorar su transcripción.
- No se ha documentado soporte de tool calling ni de invocación de funciones en la información proporcionada.
- No se ha documentado soporte de agentes ni de razonamiento multi-step.

## Casos de uso

- Actas de reuniones y entrevistas: el modelo genera una transcripción con timestamps y etiquetas de hablante anónimas, lo que permite reconstruir turnos de intervención sin necesidad de identificar a los participantes. Es adecuado por su ventana de contexto larga y su diarización integrada.

- Subtitulado de vídeos y podcasts: la salida con marcas de tiempo por turno facilita la generación de subtítulos sincronizados. El soporte de más de 50 idiomas permite cubrir contenido multilingüe.

- Analisis de llamadas de atención al cliente: la diarización de dos hablantes y la transcripción literal permiten extraer motivos de consulta, categorizar llamadas y detectar incidencias en un solo paso, sin depender de pipelines externos.

- Accesibilidad para personas con discapacidad auditiva: la transcripción automática de conferencias, cursos o contenido corporativo pre-grabado se puede integrar en sistemas de accesibilidad. La ausencia de separación de hablantes no afecta a la legibilidad del texto.

- Archivado forense o legal: el modelo produce transcripciones anónimas con tiempos y separación por turnos, aptas para documentar declaraciones, negociaciones o material de audio en procesos de revisión.

- Integracion en herramientas de produccion musical: este espejo concreto está empaquetado para el runtime offline de la DAW MAESTRO, por lo que puede utilizarse para transcribir sesiones de audio, tomar notas de tomas o generar referencias textuales dentro del propio flujo de trabajo musical.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos numéricos de MMLU, HumanEval, GSM8K ni métricas específicas de ASR o diarización que permitan comparar el modelo con otros sistemas. La única afirmación cualitativa es que el repositorio del proyecto lo describe como "SOTA" para la transcripción multihablante de audio largo, pero no se acompaña de cifras.

## Requisitos de hardware

- Peso bf16: 0,9B parámetros, aproximadamente 1,8 GB en disco.
- VRAM estimada para inferencia: no disponible. Para un modelo de este tamaño en bf16 se necesitaría al menos la memoria de los pesos más las activaciones y la caché KV. Dada la ventana de contexto de 128k, la VRAM requerida crecerá de forma considerable con la duración del audio.
- GPU recomendadas: no se han publicado recomendaciones oficiales. En general, una GPU con 8 GB o más de VRAM sería razonable para inferencia con audios largos, pero este dato no está confirmado por el autor.
- Capacidad en GPU de consumo: los pesos caben en una RTX 3060 de 12 GB o superior, pero el contexto largo y las activaciones pueden superar la memoria en modelos de gama baja.
- Opciones de despliegue: el repositorio espejo no incluye los archivos de código del modelo (configuration_*, modeling_*, processing_*). Para usar los pesos es necesario utilizar el paquete de código del proyecto en GitHub, que incluye parches para transformers 4.57.6. No se menciona soporte para vLLM, llama.cpp, TGI u Ollama.
- Latencia y throughput: no disponibles. No se han publicado datos de rendimiento en tiempo de inferencia.

## Comparativa con modelos similares

No se han encontrado datos de benchmarks públicos que permitan realizar una comparativa cuantitativa con modelos de la misma categoría. El propio proyecto OpenMOSS publica una versión llamada MOSS-Transcribe-Diarize Pro, descrita como "más potente" y disponible en un playground online, pero no se ofrecen especificaciones ni resultados numéricos comparables en la información disponible. Por tanto, la comparativa formal queda no disponible.

## Limitaciones y advertencias

- El repositorio espejo no incluye los archivos de código del modelo; no se puede cargar con `trust_remote_code` directamente. Hay que usar la implementación del proyecto GitHub, con los parches indicados para transformers 4.57.6.
- El `tokenizer_config.json` ha sido modificado respecto al upstream para ser compatible con transformers 4.57.x. Aunque los pesos no cambian, cualquier otra versión de transformers puede no cargar correctamente los tokens especiales de audio.
- No se han publicado evaluaciones de sesgos, robustness ni seguridad del sistema. Al tratarse de un modelo generativo, existe un riesgo inherente de alucinación en la transcripción.
- Las etiquetas de hablante son anónimas (S01, S02...). El modelo no está diseñado para identificar personas concretas, lo que puede ser una limitación en escenarios que requieren verificación de identidad.
- La ventana de 128k tokens y los 90 minutos de audio son cifras máximas según la documentación; no se ha verificado el rendimiento en audios cercanos a ese límite ni la degradación de calidad en audios largos.
- La licencia Apache-2.0 permite el uso comercial, pero exige preservar los avisos de atribución y copyright del equipo OpenMOSS.
- No se han publicado cuantizaciones INT8, GGUF ni ninguna otra variante optimizada, por lo que el modelo solo está disponible en bf16 en este repositorio.

## Enlaces

- Repositorio espejo: https://huggingface.co/AEmotionStudio/moss-transcribe-diarize-models
- Modelo original: https://huggingface.co/OpenMOSS-Team/MOSS-Transcribe-Diarize
- Repositorio de código: https://github.com/OpenMOSS/MOSS-Transcribe-Diarize
- Informe técnico: https://arxiv.org/abs/2601.01554
