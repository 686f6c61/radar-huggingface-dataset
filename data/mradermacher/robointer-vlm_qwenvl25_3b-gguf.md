# mradermacher/RoboInter-VLM_qwenvl25_3b-GGUF

## Resumen

RoboInter-VLM_qwenvl25_3b es un modelo vision-language-action (VLA) orientado a robótica, desarrollado por InternRobotics. Se construye sobre la base de Qwen2.5-VL de 3B parámetros, adaptada para tareas de interacción robótica que combinan percepción visual, comprensión del lenguaje natural y generación de acciones. El modelo original se distribuye con licencia Apache 2.0 y está etiquetado como vision-language-action-model y vision-language-model.

La versión aquí descrita es una cuantización estática en formato GGUF realizada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. El repositorio incluye desde cuantizaciones Q2_K de 1,4 GB hasta f16 de 6,3 GB, además de los ficheros mmproj necesarios para el procesamiento multimodal (proyector visión-lenguaje) en Q8_0 y f16.

Con 3.085.938.688 parámetros totales y un enfoque específico en robótica, este modelo resulta relevante para investigadores y desarrolladores que necesitan desplegar un VLA ligero en entornos con recursos limitados, como robots de bajo coste, estaciones de trabajo con una sola GPU o incluso CPU. La cuantización GGUF reduce drásticamente los requisitos de memoria manteniendo la funcionalidad multimodal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer vision-language-action (VLA) basada en Qwen2.5-VL 3B |
| Parámetros totales | 3.085.938.688 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5-VL de 3B parámetros, un transformer multimodal que procesa imágenes y texto de forma conjunta. Sobre esta base, InternRobotics ha adaptado el modelo para tareas de robótica (vision-language-action), lo que implica que el modelo no solo comprende instrucciones en lenguaje natural y escenas visuales, sino que también puede generar acciones o comandos motores para un agente robótico. El repositorio de cuantización no proporciona detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO específicas para la adaptación robótica.

La innovación principal de esta versión concreta es la cuantización GGUF realizada por mradermacher, que incluye un fichero mmproj separado para el proyector multimodal. Esto permite ejecutar el modelo en llama.cpp y entornos compatibles, algo poco habitual en modelos VLA, que suelen requerir frameworks de inferencia específicos. La cuantización estática (quantize_version 2) y la conversión desde el formato Hugging Face (convert_type hf) están documentadas en la model card.

## Capacidades

- Comprensión visual y lingüística conjunta: procesa imágenes junto con instrucciones textuales para interpretar escenas.
- Generación de acciones robóticas: orientado a la producción de comandos o políticas de acción para agentes físicos.
- Modelo vision-language-action (VLA): combina percepción, lenguaje y control en un único modelo.
- Conversacional: etiquetado como conversational, admite interacción multi-turno.
- Procesamiento multimodal mediante fichero mmproj separado (proyector visión-lenguaje).
- Compatible con endpoints (endpoints_compatible) según los tags del repositorio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión avanzada o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación en robótica de manipulación: el modelo puede interpretar una imagen de la escena y una instrucción en lenguaje natural ("coge la taza roja") para generar la acción correspondiente, gracias a su naturaleza VLA y a su tamaño de 3B que permite iteración rápida en laboratorio.
- Despliegue en robots de bajo coste: con cuantizaciones Q4_K_M de 2,0 GB, el modelo cabe en GPUs de consumo (por ejemplo, RTX 3060 de 12 GB) o incluso en sistemas embebidos con suficiente memoria, lo que facilita prototipos de robótica asequibles.
- Evaluación y benchmarking de políticas VLA: al estar en formato GGUF, se puede integrar en pipelines de llama.cpp para comparar el rendimiento de distintas cuantizaciones frente al modelo original en tareas de percepción y acción.
- Asistentes visuales para operadores de robots: el modelo puede describir escenas captadas por la cámara del robot y responder preguntas del operador sobre el entorno, aprovechando su base Qwen2.5-VL.
- Prototipado rápido en estaciones de trabajo sin GPU dedicada: la cuantización Q2_K (1,4 GB) permite ejecutar el modelo en CPU, útil para pruebas de concepto y desarrollo de lógica de control antes de pasar a hardware con GPU.
- Educación y docencia en IA robótica: su licencia Apache 2.0 y su tamaño moderado lo hacen adecuado para cursos y talleres donde los estudiantes entrenan o ajustan políticas VLA sin necesidad de clústeres de GPU.
- Integración en simulación robótica: el modelo puede conectarse a entornos simulados (por ejemplo, Gazebo o Isaac Sim) para generar acciones a partir de observaciones visuales, facilitando el ciclo de desarrollo antes del despliegue físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del modelo, sin contar el proyector multimodal):
  - Q2_K: ~1,4 GB
  - Q3_K_S: ~1,6 GB
  - Q3_K_M: ~1,7 GB
  - Q3_K_L: ~1,8 GB
  - IQ4_XS: ~1,9 GB
  - Q4_K_S: ~1,9 GB
  - Q4_K_M: ~2,0 GB
  - Q5_K_S: ~2,3 GB
  - Q5_K_M: ~2,3 GB
  - Q6_K: ~2,6 GB
  - Q8_0: ~3,4 GB
  - f16: ~6,3 GB
- Proyector multimodal (mmproj): ~0,9 GB (Q8_0) o ~1,4 GB (f16), que debe sumarse a la VRAM del modelo principal.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB para cuantizaciones altas; A100 o H100 no son necesarias dado el tamaño del modelo.
- Cabe en GPU de consumo: sí, todas las cuantizaciones caben en GPUs con 8 GB o más de VRAM (sumando modelo y mmproj); las cuantizaciones Q2_K y Q3_K pueden ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), Ollama (si se importa el GGUF), y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este tipo de modelo multimodal, por lo que se requeriría el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| RoboInter-VLM_qwenvl25_3b (este) | 3,09B | No disponible | Apache 2.0 | GGUF / safetensors | VLA robótico |
| Qwen2.5-VL-3B (base) | ~3B | No disponible | Apache 2.0 | safetensors | Vision-language general |
| OpenVLA-7B | ~7B | No disponible | No disponible | safetensors | VLA robótico |
| RT-2 (Google) | No disponible | No disponible | No disponible (propietario) | No disponible | VLA robótico |

La comparativa se limita a modelos de la misma categoría (VLA o vision-language de tamaño similar). OpenVLA-7B duplica los parámetros y no dispone de cuantizaciones GGUF públicas en la información consultada. RT-2 es propietario y no ofrece pesos abiertos. Qwen2.5-VL-3B es la base del modelo, por lo que comparte arquitectura pero no está especializado en robótica.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al derivar de Qwen2.5-VL, puede heredar sesgos presentes en los datos de entrenamiento de dicho modelo.
- Riesgo de alucinación: inherente a los modelos generativos; en el contexto robótico, una alucinación en la generación de acciones puede provocar comportamientos inseguros en un robot físico.
- Limitaciones de contexto o idioma: el modelo solo declara soporte de inglés; no se especifica la longitud de contexto, lo que impide evaluar su idoneidad para tareas con historiales largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base (InternRobotics/RoboInter-VLM_qwenvl25_3b) y de Qwen2.5-VL para asegurar el cumplimiento en productos derivados.
- Caveats para producción: las cuantizaciones Q2_K y Q3_K pueden degradar la calidad de las acciones generadas; para robótica real se recomienda Q4_K_M o superior. La falta de benchmarks publicados impide comparar su rendimiento con alternativas. El modelo está pensado para investigación; su uso en robots físicos requiere validación de seguridad y pruebas en simulación antes del despliegue.
- El repositorio de cuantización tiene pocas descargas (158) y un solo like, lo que sugiere una validación comunitaria limitada.

## Enlaces

- Repositorio HuggingFace (cuantización GGUF): https://huggingface.co/mradermacher/RoboInter-VLM_qwenvl25_3b-GGUF
- Modelo base: https://huggingface.co/InternRobotics/RoboInter-VLM_qwenvl25_3b
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/RoboInter-VLM_qwenvl25_3b-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#RoboInter-VLM_qwenvl25_3b-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
- Artículo sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
