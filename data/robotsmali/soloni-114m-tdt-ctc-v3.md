# RobotsMali/soloni-114m-tdt-ctc-v3

## Resumen

El modelo `soloni-114m-tdt-ctc-v3` es un sistema de reconocimiento automático de voz (ASR) desarrollado por RobotsMali, una iniciativa centrada en tecnologías del lenguaje para el bambara (bm), idioma hablado principalmente en Malí. Se trata de una versión afinada de su predecesor `soloni-114m-tdt-ctc-v2`, entrenada con el toolkit NVIDIA NeMo. El modelo emplea una arquitectura híbrida FastConformer-TDT-CTC, con 114 millones de parámetros, y está diseñado para transcribir audio en bambara, un idioma de bajos recursos donde los sistemas comerciales de ASR suelen fallar.

La relevancia de este modelo radica en su contribución a la preservación y accesibilidad de lenguas africanas poco representadas. Al combinar dos decodificadores (TDT y CTC) entrenados conjuntamente, ofrece flexibilidad en la decodificación y un rendimiento razonable en los conjuntos de evaluación publicados. El modelo se distribuye bajo licencia CC-BY-4.0, lo que permite su uso y modificación con atribución, y está pensado principalmente para fines de investigación, según advierte el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-TDT-CTC (híbrido) |
| Parametros totales | 114 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, no especifica ventana de audio) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Bambara (bm) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | NeMo (.nemo) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura FastConformer, una versión optimizada del Conformer que incorpora downsampling convolucional con profundidad separable de 8x. Dispone de dos decodificadores independientes pero entrenados conjuntamente: un decodificador TDT (Token-and-Duration Transducer) autoregresivo y un decodificador convolucional basado en pérdida CTC. Esta combinación permite elegir entre decodificación greedy o beam para cada uno de los decodificadores.

El entrenamiento consistió en un fine-tuning de 13,388 pasos sobre el modelo base `soloni-114m-tdt-ctc-v2`, utilizando el subconjunto revisado por humanos del dataset `RobotsMali/kunkado`, que según la model card contiene aproximadamente 40 horas de audio (el texto se corta en la descripción). El tokenizador se entrenó sobre las transcripciones del conjunto de entrenamiento de kunkado mediante el script `process_asr_text_tokenizer.py` de NeMo. El modelo fue creado con NeMo 2.5.0, y se documenta un problema de compatibilidad con versiones posteriores (2.7.x) que requiere un parche en la configuración de decodificación.

## Capacidades

- Transcripción de voz a texto en bambara, tanto con decodificación TDT como CTC.
- Soporte de decodificación greedy y beam search para ambos decodificadores.
- Acepta audio mono de 16 kHz como entrada, aunque incluye un preprocesador que permite resamplear audios con frecuencias de muestreo superiores.
- Integración con el ecosistema NVIDIA NeMo, permitiendo carga directa mediante `from_pretrained`.
- Posibilidad de desactivar CUDA Graphs en la decodificación TDT para compatibilidad con GPUs o versiones de CUDA que no lo soporten.
- Diseñado específicamente para un idioma de bajos recursos, con potencial para transferencia a otras lenguas africanas.

## Casos de uso

- Transcripción de entrevistas y testimonios orales en bambara: el modelo puede convertir grabaciones de campo en texto, facilitando la documentación lingüística y la investigación antropológica.
- Generación de subtítulos para vídeos en bambara: al transcribir audio de vídeos, permite crear subtítulos automáticos para contenido educativo o cultural.
- Asistente de voz para servicios públicos: integrado en aplicaciones de atención al ciudadano en Malí, puede transcribir consultas habladas en bambara para su procesamiento posterior.
- Archivado y búsqueda de contenido audiovisual: al transcribir archivos de audio, se habilita la indexación y búsqueda por texto en bibliotecas digitales.
- Herramienta de apoyo para el aprendizaje del bambara: los estudiantes pueden practicar pronunciación y comparar su habla con transcripciones de referencia.
- Investigación en ASR para lenguas de bajos recursos: sirve como punto de partida para experimentos de fine-tuning o adaptación a dialectos o dominios específicos.

## Benchmarks y rendimiento

Los resultados declarados por el autor en la model card son los siguientes:

| Dataset | Split | WER (%) | CER (%) |
|---|---|---|---|
| Kunkado (RobotsMali/kunkado) | test | 37.13 | 21.18 |
| Nyana Eval (RobotsMali/nyana-eval) | test | 32.34 | 16.73 |

Estos valores no están verificados de forma independiente y corresponden a la evaluación realizada por el equipo de RobotsMali. No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- No se especifican requisitos oficiales de VRAM ni GPUs recomendadas en la documentación proporcionada.
- Dado el tamaño del modelo (114M parámetros), es plausible que pueda ejecutarse en GPUs de consumo con al menos 4 GB de VRAM, pero no hay datos confirmados.
- El modelo se carga mediante NeMo, por lo que requiere una instalación de NVIDIA NeMo (recomendado `pip install nemo-toolkit['asr']`).
- La decodificación TDT utiliza CUDA Graphs por defecto, lo que puede requerir GPUs con soporte adecuado; en caso de error, se puede desactivar esta opción.
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama, ya que el modelo no es de tipo LLM sino ASR.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Dado que se trata de un modelo especializado en bambara, un idioma con muy pocos recursos, no hay alternativas comerciales o de código abierto ampliamente conocidas para comparar directamente.

## Limitaciones y advertencias

- El autor indica explícitamente que el modelo es parte de una investigación en curso y que puede no generalizar bien en todas las condiciones de habla y dialectos.
- Los valores de WER y CER son relativamente altos (37% y 21% en el dataset Kunkado), lo que sugiere que la precisión puede ser insuficiente para aplicaciones críticas sin revisión humana.
- El modelo está entrenado principalmente en un único dataset (kunkado), lo que limita su robustez frente a variaciones acústicas, ruido o acentos no representados.
- La licencia CC-BY-4.0 permite uso comercial, pero exige atribución; no hay restricciones adicionales conocidas.
- Existe un problema de compatibilidad con versiones recientes de NeMo (2.7.x) que requiere un parche manual en la configuración de decodificación; esto puede dificultar su integración en entornos actualizados.
- No se proporcionan datos sobre sesgos demográficos o de género, ni sobre el rendimiento en habla infantil, femenina o con acentos regionales específicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RobotsMali/soloni-114m-tdt-ctc-v3
- Repositorio de código y configuraciones de fine-tuning: https://github.com/RobotsMali-AI/bambara-asr/
- Dataset de entrenamiento: https://huggingface.co/datasets/RobotsMali/kunkado
- Modelo base: https://huggingface.co/RobotsMali/soloni-114m-tdt-ctc-v2
- Documentación de FastConformer en NeMo: https://docs.nvidia.com/deeplearning/nemo/user-guide/docs/en/main/asr/models.html#fast-conformer
