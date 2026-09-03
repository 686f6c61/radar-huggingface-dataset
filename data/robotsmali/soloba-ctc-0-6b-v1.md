# RobotsMali/soloba-ctc-0.6b-v1

## Resumen

`soloba-ctc-0.6b-v1` es un modelo de reconocimiento automático de voz (ASR) para el idioma bambara, desarrollado por RobotsMali, una iniciativa que busca impulsar tecnologías del lenguaje para lenguas africanas. Se trata de un ajuste fino (fine-tuning) del modelo base `RobotsMali/soloba-ctc-0.6b-v0` sobre el dataset `RobotsMali/kunkado`, que contiene aproximadamente 40 horas de habla bambara transcrita y revisada por humanos. El modelo está construido con la arquitectura FastConformer (encoder) combinada con un decodificador convolucional y pérdida CTC, y cuenta con 0,6 mil millones de parámetros.

La relevancia de este modelo radica en que el bambara es una lengua mandé hablada por millones de personas en Malí y otros países de África occidental, pero con escasos recursos tecnológicos. Este modelo, junto con su serie Soloba, representa un avance concreto hacia la accesibilidad de herramientas de voz para esta comunidad lingüística. Está liberado bajo licencia CC-BY-4.0, lo que permite su uso comercial con atribución, y se distribuye a través de la librería NVIDIA NeMo.

El modelo está pensado principalmente para investigación y desarrollo, y sus autores advierten que puede no generalizar bien en todas las condiciones de habla y dialectos. No produce capitalización ni puntuación de forma consistente, y tampoco genera etiquetas de eventos acústicos. Aun así, constituye una base sólida para experimentación y aplicaciones específicas en bambara.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer encoder + decodificador convolucional con pérdida CTC |
| Parametros totales | 0,6 mil millones (600M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa audio mono a 16 kHz, duración variable) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Bambara (bm) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | NeMo (.nemo) |

## Arquitectura y entrenamiento

El modelo emplea un encoder FastConformer, una versión optimizada del Conformer que incorpora downsampling convolucional con profundidad separable de 8x, lo que reduce el coste computacional manteniendo la capacidad de modelado de dependencias de largo alcance. El decodificador es convolucional y se entrena con la función de pérdida CTC (Connectionist Temporal Classification), adecuada para alineación secuencia-a-secuencia sin segmentación explícita.

El fine-tuning se realizó con NVIDIA NeMo durante 162.445 pasos sobre el modelo base `soloba-ctc-0.6b-v0`, utilizando el subconjunto revisado por humanos del dataset `RobotsMali/kunkado` (~40 horas). Antes del entrenamiento, el texto se normalizó con la herramienta `bambara-normalizer`, que estandariza números, elimina puntuación y etiquetas. El tokenizador se entrenó sobre las transcripciones del conjunto de entrenamiento de Kunkado mediante el script `process_asr_text_tokenizer.py` de NeMo.

## Capacidades

- Transcripción de voz en bambara a texto, aceptando audio mono (WAV) que se remuestrea internamente a 16 kHz.
- Reconocimiento de habla continua con decodificación CTC, sin necesidad de segmentación previa.
- Soporte para inferencia en tiempo real o por lotes mediante la API de NeMo (`transcribe`).
- No produce capitalización ni puntuación de forma consistente (limitación declarada por los autores).
- No genera etiquetas de eventos acústicos (como risas, ruidos, etc.) presentes en el dataset Kunkado.
- Capacidad multilingüe: exclusivamente bambara; no se reportan otros idiomas.

## Casos de uso

- Transcripción de entrevistas y testimonios orales en bambara: el modelo puede convertir grabaciones de campo en texto, facilitando la documentación de tradiciones orales, historia local y estudios antropológicos. Su tamaño moderado permite ejecutarlo en portátiles con GPU.
- Subtitulado automático de vídeos en bambara: integrando el modelo en un pipeline de postproducción, se pueden generar subtítulos para contenido audiovisual dirigido a audiencias bambara, mejorando la accesibilidad y el alcance.
- Asistente de voz para aplicaciones móviles: al ser un modelo ligero (0,6B), puede desplegarse en servidores o en dispositivos con recursos limitados para habilitar comandos de voz o dictado en bambara dentro de apps de mensajería o productividad.
- Servicios de atención al cliente en bambara: empresas que operan en Malí pueden usar el modelo para transcribir llamadas de soporte, permitiendo análisis de sentimiento, búsqueda de información y generación de resúmenes automáticos.
- Investigación lingüística y fonética: el modelo sirve como herramienta para estudiar la variación dialectal del bambara, ya que los investigadores pueden transcribir corpus y comparar resultados con transcripciones manuales.
- Educación y aprendizaje de idiomas: plataformas de enseñanza de bambara pueden ofrecer ejercicios de pronunciación donde el alumno habla y el sistema transcribe su intento, proporcionando retroalimentación inmediata.
- Archivado y digitalización de material sonoro: bibliotecas y archivos que conservan grabaciones históricas en bambara pueden transcribirlas automáticamente para indexar y buscar contenido, reduciendo costes de transcripción manual.

## Benchmarks y rendimiento

Los resultados oficiales declarados por el autor en la model card son los siguientes:

| Benchmark | Split | WER (%) ↓ | CER (%) ↓ |
|---|---|---|---|
| Kunkado (RobotsMali/kunkado) | test | 42,80 | 24,92 |
| Nyana Eval (RobotsMali/nyana-eval) | test | 40,19 | 20,94 |

Estos valores indican que el modelo comete errores en aproximadamente 4 de cada 10 palabras, lo que refleja la dificultad de la tarea y la limitada cantidad de datos de entrenamiento. No se dispone de comparaciones con otros modelos ASR para bambara en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 0,6B parámetros. En precisión FP32, los pesos ocupan aproximadamente 2,4 GB (tamaño del repositorio). En FP16, se reduciría a ~1,2 GB. Se recomienda al menos 4 GB de VRAM para inferencia cómoda con NeMo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 2060, RTX 3060, o superiores. También puede ejecutarse en CPU, aunque con mayor latencia.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama media y alta de consumo (RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: el modelo se distribuye en formato NeMo, por lo que se puede servir con NVIDIA NeMo, Triton Inference Server con backend NeMo, o mediante scripts Python personalizados. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan datos oficiales. Para un modelo de 0,6B con encoder FastConformer, se espera una latencia de decodificación de unos pocos segundos por minuto de audio en GPU moderna, pero estos valores son estimaciones orientativas.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos ASR específicos para bambara en la información proporcionada. Modelos multilingües como Whisper (de OpenAI) podrían cubrir parcialmente el bambara, pero no se han reportado resultados comparativos en los benchmarks de este modelo. Por tanto, la comparativa directa no está disponible.

## Limitaciones y advertencias

- El modelo puede no generalizar bien en todas las condiciones de habla, acentos y dialectos del bambara, según advierten los autores.
- No produce capitalización ni puntuación de forma consistente, lo que puede dificultar la lectura de transcripciones largas.
- No genera etiquetas de eventos acústicos (risas, ruidos, etc.) que sí están presentes en el dataset Kunkado.
- El modelo es parte de una investigación en curso; se esperan mejoras y refinamientos en versiones futuras.
- La licencia CC-BY-4.0 permite uso comercial, pero exige atribución al autor. No hay restricciones adicionales conocidas.
- El dataset de entrenamiento es limitado (~40 horas), lo que puede afectar al rendimiento en dominios específicos o vocabulario técnico.
- No se han publicado evaluaciones humanas todavía; los resultados de WER/CER son automáticos y no verificados de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RobotsMali/soloba-ctc-0.6b-v1
- Modelo base: https://huggingface.co/RobotsMali/soloba-ctc-0.6b-v0
- Dataset Kunkado: https://huggingface.co/datasets/RobotsMali/kunkado
- Dataset Nyana Eval: https://huggingface.co/datasets/RobotsMali/nyana-eval
- Repositorio de código y configuración: https://github.com/RobotsMali-AI/bambara-asr/
- Documentación de FastConformer en NeMo: https://docs.nvidia.com/deeplearning/nemo/user-guide/docs/en/main/asr/models.html#fast-conformer
- Script de tokenizador de NeMo: https://github.com/NVIDIA/NeMo/blob/main/scripts/tokenizers/process_asr_text_tokenizer.py
- Normalizador de bambara (PyPI): https://pypi.org/project/bambara-normalizer/
