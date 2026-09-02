# cmcheng/MedMax-VQA-SFT_Qwen2.5-VL-7B-Instruct

## Resumen

MedMax-VQA-SFT_Qwen2.5-VL-7B-Instruct es un modelo de visión-lenguaje (VLM) desarrollado por cmcheng mediante fine-tuning con LoRA sobre el modelo base Qwen2.5-VL-7B-Instruct de Alibaba Cloud. El modelo está especializado en respuesta a preguntas visuales (VQA) en el dominio biomédico, concretamente en las tareas PathVQA (patología) y VQA-Red (imágenes de retina). El fine-tuning se realizó sobre el conjunto de datos MedMax, un benchmark de instrucciones multimodales para asistentes biomédicos presentado en NeurIPS 2025.

El modelo resuelve el problema de la baja precisión de los VLM genéricos en dominios especializados como la medicina, donde el conocimiento visual requiere un ajuste fino con datos específicos. Con 8.292 millones de parámetros totales y una arquitectura Qwen2.5-VL, el modelo alcanza una precisión del 56,02% en el conjunto de test de MedMax, superando en 23,38 puntos porcentuales al modelo base sin ajustar (32,64%). La relevancia actual radica en la creciente demanda de asistentes clínicos basados en IA que puedan interpretar imágenes médicas con precisión, un campo donde los modelos generalistas suelen fallar.

El modelo se distribuye en formato safetensors y el repositorio tiene un tamaño de 16,6 GB. La licencia no está especificada en la información disponible, lo que supone una limitación importante para su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL (vision-language transformer) |
| Parametros totales | 8.292.166.656 (8,29B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-VL-7B-Instruct, un VLM de la familia Qwen2.5 desarrollado por Alibaba Cloud que combina un codificador visual con un decodificador de lenguaje basado en transformer. La arquitectura original soporta entrada multimodal (imagen y texto) y es capaz de procesar imágenes de alta resolución, aunque los detalles específicos del codificador visual y la estrategia de atención no se detallan en la información proporcionada.

El proceso de fine-tuning se realizó con la técnica LoRA (Low-Rank Adaptation), ajustando únicamente los módulos `q_proj`, `v_proj`, `k_proj`, `o_proj`, `up_proj`, `down_proj` y `gate_proj`. El número total de parámetros entrenados fue de aproximadamente 50 millones, lo que representa menos del 1% de los parámetros totales del modelo. El entrenamiento se llevó a cabo durante 3 épocas con DeepSpeed ZeRO Stage 2 como estrategia de optimización de memoria, en un entorno con 4 GPUs NVIDIA 4090 con 48 GB de VRAM cada una, con una duración total de unas 5 horas.

El conjunto de datos de entrenamiento proviene del dataset MedMax, concretamente de las particiones `train` y `validation` con fuentes `pathvqa` y `vqa_red`, sumando 21.344 y 235 ejemplos respectivamente. La evaluación se realizó sobre 2.451 ejemplos de test y se utilizó GPT-4o-mini como juez automático (GPT Judge) para medir la precisión de las respuestas.

## Capacidades

- Respuesta a preguntas visuales (VQA) en el dominio biomédico, con especialización en patología (PathVQA) e imágenes de retina (VQA-Red).
- Comprensión de imágenes médicas combinada con razonamiento textual para generar respuestas clínicamente relevantes.
- Capacidad de fine-tuning sobre el modelo base Qwen2.5-VL, lo que permite adaptar el conocimiento general del VLM a dominios específicos.
- Generación de texto en formato natural a partir de entradas visuales y textuales, siguiendo el paradigma de instrucciones multimodales.
- Soporte de conversaciones multimodales multi-turno heredadas del modelo base Qwen2.5-VL-Instruct, aunque el fine-tuning se centra en tareas de VQA de un solo turno.
- Capacidades generales de visión-lenguaje del modelo base (descripción de imágenes, OCR, razonamiento visual) que se mantienen tras el ajuste fino, aunque con menor rendimiento que el modelo original en tareas no médicas.

## Casos de uso

- Asistencia al diagnostico en patologia: el modelo puede responder preguntas sobre imagenes de histopatologia, ayudando a patologos a identificar estructuras celulares o anomalias. Por ejemplo, dado un corte histologico, el modelo puede responder si hay presencia de mitosis o necrosis.
- Screening de retinopatias: en entornos de atencion primaria, el modelo puede analizar fotografias de fondo de ojo para detectar signos de retinopatia diabetica o degeneracion macular, facilitando la derivacion a especialistas.
- Educacion medica: estudiantes de medicina pueden utilizar el modelo como herramienta de autoaprendizaje, planteando preguntas sobre imagenes medicas y recibiendo respuestas explicativas que refuercen sus conocimientos.
- Triaje de imagenes en telemedicina: en plataformas de teleconsulta, el modelo puede pre-clasificar imagenes enviadas por pacientes (heridas, erupciones, etc.) y generar descripciones preliminares para que el medico priorice los casos.
- Investigacion biomedica: investigadores pueden usar el modelo para anotar automaticamente grandes volumenes de imagenes medicas, acelerando la creacion de datasets etiquetados para otros estudios.
- Soporte a la documentacion clinica: el modelo puede generar descripciones textuales de imagenes medicas que se integren en informes clinicos, reduciendo el tiempo de redaccion manual.
- Desarrollo de asistentes virtuales medicos: integrado en un chatbot o API, el modelo puede servir como componente de vision para un asistente que responda preguntas de pacientes sobre sus pruebas de imagen.

## Benchmarks y rendimiento

La informacion proporcionada incluye resultados de evaluacion sobre el conjunto de test de MedMax (2.451 ejemplos), medidos con GPT-4o-mini como juez:

| Modelo | Precision |
|---|---|
| Qwen2.5-VL-7B-Instruct (base) | 32,64% |
| Qwen2.5-VL-7B-Instruct (SFT con MedMax) | 56,02% (+23,38%) |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 8,29B parametros en precision FP16, lo que requiere aproximadamente 16,6 GB de VRAM solo para los pesos. Con cuantizacion a 8 bits se reduce a unos 8,3 GB, y con 4 bits a unos 4,2 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: para inferencia en FP16 se recomienda una GPU con al menos 20 GB de VRAM (NVIDIA RTX 3090, RTX 4090, A100 40 GB o superior). Con cuantizacion 8 bits, una RTX 3080 o superior podria ser suficiente.
- Compatibilidad con GPU de consumo: si, el modelo puede ejecutarse en GPUs de consumo como la RTX 4090 (24 GB) en FP16, o en GPUs de 12-16 GB con cuantizacion.
- Opciones de despliegue: al ser un modelo basado en Qwen2.5-VL, es compatible con frameworks como vLLM, TGI, llama.cpp y Ollama, aunque la integracion especifica con estos frameworks no esta documentada en la informacion disponible.
- Latencia y throughput: no se han publicado datos de latencia o throughput para este modelo especifico.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision MedMax | Licencia |
|---|---|---|---|---|
| Qwen2.5-VL-7B-Instruct (base) | 8,29B | no disponible | 32,64% | Apache 2.0 (modelo base) |
| MedMax-VQA-SFT_Qwen2.5-VL-7B-Instruct | 8,29B | no disponible | 56,02% | no disponible |
| Otros VLM medicos (p.ej. LLaVA-Med) | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base y al modelo ajustado, ya que no se dispone de datos de otros modelos en el benchmark MedMax. La mejora de 23,38 puntos porcentuales demuestra el valor del fine-tuning especifico en dominios verticales.

## Limitaciones y advertencias

- La licencia del modelo no esta especificada, lo que impide conocer si su uso comercial esta permitido. Se recomienda contactar con el autor antes de cualquier despliegue en produccion.
- El modelo esta especializado exclusivamente en dos tareas (PathVQA y VQA-Red). Su rendimiento fuera de estos dominios medicos puede verse degradado respecto al modelo base.
- No se han publicado evaluaciones sobre sesgos, alucinaciones o comportamiento en entornos clinicos reales. La precision del 56,02% indica que el modelo falla en aproximadamente 44 de cada 100 preguntas, por lo que no debe utilizarse como unico criterio para decisiones clinicas.
- El modelo no ha sido validado en ensayos clinicos ni aprobado por organismos reguladores. Su uso en diagnostico medico real debe considerarse experimental y siempre supervisado por profesionales sanitarios.
- El entrenamiento se realizo con un dataset limitado (21.344 ejemplos) y una unica estrategia de evaluacion (GPT Judge), lo que podria no reflejar el rendimiento real en entornos clinicos diversos.
- No se ha publicado informacion sobre la longitud de contexto soportada, lo que limita la planificacion de despliegues que requieran manejar conversaciones largas o multiples imagenes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cmcheng/MedMax-VQA-SFT_Qwen2.5-VL-7B-Instruct
- Dataset de entrenamiento MedMax: https://huggingface.co/datasets/mint-medmax/medmax_data
- Dataset de evaluacion MedMax: https://huggingface.co/datasets/mint-medmax/medmax_eval_data
- Modelo base Qwen2.5-VL-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Paper MedMax (NeurIPS 2025): https://proceedings.neurips.cc/paper_files/paper/2025/file/9a6f7d845cf12385524f0f27ab26f57e-Paper-Datasets_and_Benchmarks_Track.pdf
- Coleccion Qwen2.5 en HuggingFace: https://huggingface.co/collections/Qwen/qwen25
