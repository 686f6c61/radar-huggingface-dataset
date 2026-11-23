# ryusuke8318/Qwen3.5-0.8B-JRAG-Reader-r7

## Resumen

Qwen3.5-0.8B-JRAG-Reader-r7 es un ajuste fino mediante LoRA del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario ryusuke8318 y publicado en Hugging Face bajo licencia Apache 2.0. El modelo está especializado en tareas de generación aumentada por recuperación (RAG) sobre Wikipedia en japonés, y su función concreta es actuar como "lector" en un bucle de resolución de preguntas multietapa: planificar, leer, reescribir la consulta y emitir una respuesta final. No es un modelo de propósito general, sino un componente entrenado para un flujo de trabajo muy específico.

Con 873.438.784 parámetros totales (aproximadamente 0,8 mil millones) y un tamaño de repositorio de 1,8 GB en formato safetensors, se trata de un modelo compacto orientado a despliegues con recursos limitados. El ajuste se realizó con LoRA durante 2 épocas en precisión bf16 y posteriormente se fusionaron los pesos. El formato de entrada y salida está alineado con los prompts `answer_prompt`, `plan_prompt` y `rewrite_prompt` de un notebook de competición (identificado como 006), y la salida esperada es un JSON con las claves `answer` y `chunk_id`.

Su relevancia actual radica en que ejemplifica el patrón de modelos pequeños y especializados para pipelines RAG, donde un modelo de menos de mil millones de parámetros puede resolver subtareas concretas (planificación de consultas, reescritura, extracción de respuestas con cita de fragmento) sin necesidad de un LLM de gran escala. No obstante, la información pública disponible es muy limitada: el modelo registra 2 descargas y 0 likes en el momento de la consulta, y no se han publicado resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5), ajuste fino con LoRA fusionado; detalles internos de la arquitectura base no disponibles |
| Parámetros totales | 873.438.784 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 0,8 mil millones de parámetros, y se ajusta mediante LoRA durante 2 épocas en bf16, fusionando después los pesos adaptadores en el modelo base. No se documentan en la información disponible detalles sobre el número de capas, la dimensión oculta, el mecanismo de atención ni la longitud de contexto nativa del modelo base.

El entrenamiento se centró en datos de RAG sobre Wikipedia japonesa. Según la model card, se usaron los conjuntos JSQuAD (JGLUE) y JEMHopQA, ambos bajo CC BY-SA 4.0 y en su partición de entrenamiento, además de una colección de fragmentos distribuidos derivada de Wikipedia japonesa (CC BY-SA 4.0). El conjunto de datos de la revisión r7 añade 2.707 ejemplos de preguntas multietapa construidos a partir de cadenas de consultas que combinan nombres de artículos, fechas de nacimiento y lugares de origen mediante reglas, generando ejemplos de planificación, lectura, reescritura y respuesta final. Se excluyeron los ejemplos de la cadena de verificación que compartían artículo, y no se utilizó el fichero de preguntas de la competición (`questions.json`). Las revisiones anteriores (r6) incluyeron además JaQuAD (CC BY-SA 3.0) y auto-wiki-qa (CC BY-SA 4.0) como componentes de preguntas de dos etapas. No se documenta el uso de RLHF ni DPO.

## Capacidades

- Generación de texto conversacional en japonés, orientada a tareas de lectura comprensiva sobre fragmentos de Wikipedia.
- Planificación de consultas: genera un plan para descomponer una pregunta compleja en pasos resolubles.
- Reescritura de consultas: reformula la pregunta intermedia para la siguiente iteración del bucle RAG.
- Extracción de respuestas con cita: emite un JSON con las claves `answer` y `chunk_id`, lo que permite rastrear el fragmento fuente de la respuesta.
- Resolución de preguntas multietapa (multi-hop) en un bucle de planificar-leer-reescribir-responder.
- Formato de entrada alineado con los prompts `answer_prompt`, `plan_prompt` y `rewrite_prompt` del notebook de referencia del autor.
- No se documenta soporte de tool calling, function calling, agentes autónomos, visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Lectura en pipelines RAG sobre Wikipedia japonesa: el modelo recibe un fragmento recuperado y devuelve la respuesta junto con el identificador del chunk, lo que permite construir sistemas de pregunta-respuesta con trazabilidad de la fuente.
- Resolución de preguntas multietapa: en preguntas que requieren encadenar varias consultas (por ejemplo, combinar fecha de nacimiento y lugar de origen de una persona), el modelo genera el plan, lee el fragmento y reescribe la siguiente consulta dentro de un bucle controlado por el orquestador.
- Enrutado y descomposición de consultas: como componente de planificación en un sistema mayor, transforma una pregunta compleja del usuario en pasos intermedios que un recuperador puede ejecutar secuencialmente.
- Reescritura de consultas para recuperación iterativa: dado el resultado parcial de una búsqueda, reformula la pregunta para la siguiente llamada al recuperador, mejorando la cobertura en preguntas de varios saltos.
- Evaluación y prototipado de arquitecturas RAG: al ser un modelo de 0,8 B con licencia Apache 2.0, sirve para experimentar con bucles de lectura multietapa en entornos con GPU de gama media sin incurrir en costes de modelos grandes.
- Extracción de respuestas con cita en dominios documentales japoneses: el formato JSON de salida con `chunk_id` facilita integrar el modelo en sistemas que exigen justificar la respuesta con el pasaje exacto recuperado.
- Fine-tuning posterior sobre dominios concretos: al estar bajo Apache 2.0 y con un tamaño reducido, puede servir como punto de partida para ajustes LoRA adicionales en corpus japoneses especializados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,8 GB solo para los pesos (873 M de parámetros × 2 bytes), más el overhead de activaciones y caché KV; en la práctica, un entorno de 4-6 GB de VRAM es suficiente para inferencia en bf16 con contexto moderado.
- En cuantización de 8 bits, la huella de pesos se reduce a aproximadamente 0,9 GB; en 4 bits, a unos 0,45 GB, aunque el autor no publica variantes cuantizadas.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; para despliegue en servidor, A100 o H100 no son necesarias dado el tamaño del modelo.
- Cabe holgadamente en GPU consumer; también es viable en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: al publicarse solo en safetensors, requiere un runtime que cargue pesos Hugging Face (Transformers, vLLM, TGI). Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, conversión que el autor no documenta.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Especialización |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-JRAG-Reader-r7 | 873 M | no disponible | ja | Apache 2.0 | Lector RAG multietapa en japonés |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | multilingüe (no detallado) | Apache 2.0 | Propósito general |
| Modelos lectores RAG japoneses de tamaño similar | no disponible | no disponible | ja | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos directamente comparables documentados en la información proporcionada; la comparación se limita al modelo base del que deriva.

## Limitaciones y advertencias

- Modelo altamente especializado: está entrenado para el formato de prompts de un notebook concreto y para el esquema JSON `{"answer", "chunk_id"}`; su uso fuera de ese pipeline puede degradar gravemente la calidad de salida.
- Idioma limitado al japonés; no se documenta soporte multilingüe.
- Riesgo de alucinación inherente a un modelo de 0,8 B en tareas de lectura: puede generar respuestas no respaldadas por el fragmento recuperado, por lo que se recomienda validar el `chunk_id` devuelto contra la fuente.
- Sesgos: no documentados por el autor; al entrenarse sobre Wikipedia japonesa y conjuntos CC BY-SA, puede heredar sesgos de cobertura y representación de esas fuentes.
- Limitaciones de contexto: la longitud de contexto no está publicada, lo que impide garantizar el comportamiento con fragmentos largos.
- Restricciones de licencia: el modelo es Apache 2.0, pero los datos de entrenamiento (JSQuAD, JEMHopQA, JaQuAD, auto-wiki-qa y fragmentos de Wikipedia) están bajo CC BY-SA 3.0/4.0; el uso comercial debe evaluar las obligaciones de atribución y compartir-igual derivadas de esas fuentes.
- Madurez muy baja: 2 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados ni validación externa; no se recomienda para producción sin evaluación propia.
- No se documentan variantes cuantizadas ni recetas de conversión a GGUF, lo que limita el despliegue en entornos ligeros tipo llama.cpp u Ollama sin trabajo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ryusuke8318/Qwen3.5-0.8B-JRAG-Reader-r7
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JSQuAD (JGLUE): https://github.com/yahoojapan/JGLUE
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- JaQuAD: https://huggingface.co/datasets/SkelterLabsInc/JaQuAD
- auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Licencia CC BY-SA 3.0: https://creativecommons.org/licenses/by-sa/3.0/
