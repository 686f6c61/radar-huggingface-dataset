# Kicaulah/model-education

## Resumen

Model Education es un ajuste fino (fine-tuning) del modelo Qwen/Qwen2.5-3B-Instruct publicado por el usuario Kicaulah bajo licencia Apache-2.0. Se trata de un modelo de ~3.000 millones de parámetros orientado a un único dominio: la enseñanza y la explicación de conceptos, con una persona conversacional muy definida (cálida, directa, basada en analogías cotidianas y ejemplos concretos en lugar de definiciones abstractas). Forma parte de Kicaulah AI, un sistema declarado de cinco modelos especialistas más un router, servidos a través de un único endpoint compatible con la API de OpenAI.

El punto crítico de esta ficha es que, en el momento de la consulta, los pesos no están publicados. La propia model card lo indica de forma explícita: el repositorio contiene el system prompt (que funciona hoy en cualquier modelo instruct), los scripts de entrenamiento y la infraestructura de servido, pero el artefacto final de pesos queda a la espera de que se ejecute el script `04_train_education.py` en una GPU de 16 GB (se menciona una Colab T4 como suficiente). El proceso descrito es QLoRA sobre el modelo base, con posterior fusión (merge) de los adaptadores LoRA.

La relevancia del proyecto es, por tanto, más metodológica y de diseño de personas que de rendimiento bruto: propone un enfoque de "especialista por dominio" sobre un modelo pequeño de ~3B, con contexto declarado de 4k en la insignia de la model card, y con la promesa de un tono no robótico (sin aperturas del tipo "Certainly! Here's an explanation of..."). No hay descargas ni likes registrados, ni benchmarks publicados, por lo que cualquier evaluación seria del modelo todavía no puede realizarse sobre los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso de la familia Qwen2 (heredada del modelo base Qwen2.5-3B-Instruct; no se detalla explícitamente en la model card) |
| Parametros totales | ~3B (insignia "~3B" de la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 4k según la insignia de la model card; no se especifica si es una limitación impuesta en el ajuste o el contexto efectivo tras el entrenamiento |
| Tipos de cuantizacion | no disponible; al no publicarse los pesos no existen cuantizaciones oficiales. El entrenamiento descrito usa QLoRA (cuantización de 4 bits durante el ajuste) |
| Idiomas soportados | inglés (en), único idioma declarado |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (según la insignia de la model card); los pesos no están publicados actualmente |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna, pero el modelo deriva del Qwen2.5-3B-Instruct, un transformer decoder denso con atención de consultas agrupadas (GQA), RoPE, SwiGLU y RMSNorm, sin componentes MoE ni SSM. El ajuste declarado es de tipo instruccional supervisado (SFT) mediante QLoRA: se entrenan adaptadores de bajo rango sobre el modelo base cuantizado a 4 bits y, a continuación, se fusionan los adaptadores en los pesos finales (etiqueta `merge-lora`). El script de entrenamiento indicado (`scripts/04_train_education.py`) está pensado para ejecutarse en una GPU de 16 GB, con Colab T4 mencionada como hardware suficiente.

No se especifica el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. La actividad pública del autor menciona la subida de un "Dataset_script_for_ai" con tres dominios en formato ZIP, pero no se detalla su contenido ni su relación exacta con este modelo. Tampoco se documentan innovaciones técnicas de inferencia (decodificación especulativa, atención lineal, etc.). La aportación diferencial del proyecto es el diseño de la persona mediante system prompt: instrucciones explícitas de conducir con una analogía vívida antes de la explicación formal, construir sobre conocimiento previo, aportar un ejemplo concreto en lugar de tres abstractos, verificar comprensión y ofrecer una reexplicación desde otro ángulo.

## Capacidades

- Generación de texto conversacional en inglés con una persona de docente (tono cálido, directo y no condescendiente).
- Explicación de conceptos con analogías cotidianas seguidas de la explicación técnica, en ese orden.
- Reexplicación adaptativa: si la primera aproximación no funciona, el prompt instruye a probar otro ángulo.
- Apertura de respuesta sin muletillas robóticas ("Certainly! Here's an explanation of..."), por diseño explícito (etiqueta `anti-robotic`).
- Respuesta primero y sugerencia de profundización después; se prohíbe explícitamente responder "depende" sin dar una respuesta.
- Integración en un stack multiagente: es uno de los cinco especialistas de Kicaulah AI, enrutados mediante un router y servidos por un endpoint compatible con OpenAI.
- Compatibilidad de despliegue declarada con Open WebUI, LibreChat, Cline, Continue, Aider, LangChain, LiteLLM, Ollama y vLLM.
- No se declara soporte de tool calling, function calling, visión, audio, modo de razonamiento explícito ni capacidades multimodales.
- Multilingüismo: no. Solo inglés declarado.

## Casos de uso

- Tutoría conversacional en plataformas educativas: el modelo está ajustado para explicar conceptos paso a paso con analogías, verificar comprensión y reexplicar si el estudiante no sigue. Encaja en productos de aprendizaje guiado donde la calidad del diálogo importa más que la cobertura enciclopédica.
- Reexplicación adaptativa en aplicaciones de estudio: cuando un alumno responde "no lo entiendo", el prompt empuja a cambiar de enfoque en lugar de repetir la misma formulación, lo que resulta útil en asistentes de repaso y preparación de exámenes.
- Asistente de chat autoalojado en un aula o intranet universitaria: al ser un modelo de ~3B con licencia Apache-2.0, puede desplegarse en hardware modesto (una sola GPU de 16 GB, o incluso CPU con cuantización) y exponerse a través de la API compatible con OpenAI.
- Módulo especialista dentro de un enrutador multiagente: la arquitectura declarada de Kicaulah AI (cinco especialistas más router) permite usar este modelo solo cuando la consulta es de índole educativa, reduciendo coste frente a un modelo generalista grande.
- Prototipado rápido de personas conversacionales: el propio autor señala que el system prompt funciona en cualquier modelo instruct, de modo que un equipo de producto puede validar el tono y los flujos antes de comprometerse a entrenar o desplegar pesos.
- Generación de material didáctico y ejemplos para docentes: el modelo produce explicaciones con ejemplos concretos y un solo caso bien desarrollado, apropiado para redactar guiones de clase o notas de apoyo a partir de un concepto dado.
- Formación de docentes y práctica de roleplay educativo: la etiqueta `roleplay` y la persona definida permiten simular interacciones con estudiantes, útil en programas de capacitación pedagógica.
- Apoyo a estudiantes de inglés como segunda lengua: al ser un modelo solo en inglés y con lenguaje natural (etiqueta `natural-language`), puede servir para practicar explicaciones y vocabulario técnico en ese idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluación, ni comparaciones cuantitativas con el modelo base o con alternativas. Además, al no estar publicados los pesos, no es posible reproducir mediciones de forma independiente.

## Requisitos de hardware

- Tamaño de referencia: ~3B parámetros. En bf16/fp16 el peso ronda los 6 GB; en 8 bits, unos 3-4 GB; en 4 bits, unos 2 GB, más overhead de activaciones y caché KV.
- VRAM estimada para inferencia: aproximadamente 8-10 GB en bf16 con contexto corto; 3-5 GB en cuantización de 4 bits. Cálculo orientativo basado en el tamaño declarado, no en mediciones publicadas de este modelo concreto.
- GPU de entrenamiento declaradas por el autor: una GPU de 16 GB, con Colab T4 mencionada explícitamente como suficiente para ejecutar el script de QLoRA y el merge.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y tarjetas equivalentes, así como en Apple Silicon con memoria unificada suficiente. No hay confirmación oficial por parte del autor.
- Opciones de despliegue mencionadas en la documentación del proyecto: `transformers` (pipeline de text-generation), vLLM, Ollama y cualquier cliente compatible con la API de OpenAI (Open WebUI, LibreChat, Cline, Continue, Aider, LangChain, LiteLLM). También se describe un servidor propio (`scripts/serve.py`) que expone el enrutador en `http://localhost:8000/v1`.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo, TTFT ni curvas de escalado.
- Advertencia: al no existir pesos publicados en el repositorio, estos requisitos son estimaciones derivadas del modelo base y del proceso de entrenamiento descrito, no del artefacto final.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Kicaulah/model-education | ~3B | 4k (según insignia) | Apache-2.0 | Pesos no publicados | Especialista en educación, fine-tuning QLoRA sobre Qwen2.5-3B-Instruct, solo inglés |
| Qwen/Qwen2.5-3B-Instruct | 3,09B | 32.768 (ampliable con YaRN) | Apache-2.0 (Qwen) | Pesos públicos | Modelo base del anterior; capacidades generalistas, multilingüe |
| meta-llama/Llama-3.2-3B-Instruct | 3,21B | 128k | Llama 3.2 Community License | Pesos públicos | Alternativa generalista de tamaño comparable, con licencia con cláusulas adicionales |
| microsoft/Phi-3.5-mini-instruct | 3,8B | 128k | MIT | Pesos públicos | Enfoque en razonamiento y código, con contexto largo |

Nota: los datos de los modelos alternativos proceden de su documentación pública y se incluyen únicamente como marco de referencia; no forman parte de la información aportada por el autor de Kicaulah/model-education. No hay datos de rendimiento comparado disponibles para el modelo objeto de esta ficha.

## Limitaciones y advertencias

- Pesos no publicados: el repositorio contiene la model card, el system prompt y los scripts, pero no el artefacto de pesos. No es ejecutable como modelo descargable en el momento de redactar esta ficha.
- Cero descargas y cero likes registrados, lo que implica ausencia de validación por parte de la comunidad.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia cuantitativa de mejora frente al modelo base en tareas educativas.
- Contexto limitado: la insignia indica 4k tokens, muy por debajo de los 32.768 del modelo base. No se aclara si se trata del contexto efectivo del ajuste o de una restricción deliberada; esto limita el uso con documentos largos o conversaciones extensas.
- Solo inglés: no se declara ni se evalúa soporte de castellano u otros idiomas. Cualquier despliegue en español requeriría evaluación previa y probablemente un ajuste adicional.
- Riesgo de alucinación con tono seguro: el diseño de persona prioriza respuestas directas ("responde primero, sugiere después"), lo que en un contexto educativo puede hacer que afirmaciones incorrectas suenen igual de convincentes. Es un riesgo especialmente sensible en un modelo de enseñanza.
- Dataset de entrenamiento no documentado: se desconoce la composición, el volumen de tokens y el filtrado, por lo que no puede evaluarse el sesgo introducido por los datos.
- Sin información sobre sesgos demográficos, culturales o lingüísticos ni sobre alineación de seguridad.
- La persona está fuertemente acoplada a un system prompt concreto; usos fuera de ese prompt pueden degradar el comportamiento esperado o alejarlo del estilo declarado.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución y conservación del aviso de licencia. Conviene verificar además las condiciones del modelo base Qwen2.5-3B-Instruct, también Apache-2.0.
- Fecha de creación registrada (30 de septiembre de 2026) posterior a la fecha habitual de publicación; conviene tratarla como posible error de metadatos.
- Al formar parte de un sistema multiagente con router, el rendimiento percibido depende también del enrutado y del resto de especialistas, no solo de este modelo.
- Responsabilidad educativa: en aplicaciones reales con estudiantes conviene añadir verificación humana, filtros de contenido y mecanismos de escalado a una persona.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kicaulah/model-education
- Perfil del autor en Hugging Face: https://huggingface.co/Kicaulah
- Repositorio de modelos del autor: https://huggingface.co/Kicaulah/models
- Demo en vivo (Space): https://huggingface.co/spaces/Kicaulah/Kicaulah-AI-Demo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Articulo sobre modelos fundacionales para educacion: https://arxiv.org/html/2405.10959
- Recopilatorio de modelos de IA para educacion: https://aimodels.org/ai-blog/engaging-ai-models-making-waves-in-education/
- Politica de IA en educacion (California Department of Education): https://www.cde.ca.gov/ci/pl/aipolicy.asp
