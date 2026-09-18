# MDWT/qwen2.5-0.5b-legal-alpaca-id

## Resumen

MDWT/qwen2.5-0.5b-legal-alpaca-id es un ajuste fino (fine-tuning) supervisado del modelo Qwen/Qwen2.5-0.5B-Instruct, orientado a generar respuestas sobre derecho y regulación laboral de Indonesia. Lo publica el usuario MDWT como proyecto final del curso "Pengembangan Generative AI berbasis LLM" de Dicoding Academy (clase 857). El modelo conserva la arquitectura del base —un transformer decoder-only denso de aproximadamente 0,5 mil millones de parámetros— y la licencia Apache 2.0.

El problema que aborda es la adaptación de un modelo instructivo generalista y muy pequeño a un dominio especializado (normativa ketenagakerjaan indonesia) mediante QLoRA de 4 bits con cuantización doble. El entrenamiento se realizó sobre el dataset de instrucciones en indonesio Ichsan2895/alpaca-gpt4-indonesian, con dos configuraciones de hiperparámetros comparadas y una pérdida de validación final de 0,8210 en la mejor de ellas.

Su relevancia es fundamentalmente práctica y docente: demuestra un flujo completo de ajuste eficiente en parámetros (PEFT) sobre hardware modesto, y sirve como punto de partida reproducible para tareas de generación de texto en indonesio. No obstante, con 0,5B de parámetros y solo 800 pasos de entrenamiento, sus resultados deben considerarse experimentales y no aptos para asesoramiento legal real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2.5), con módulos de atención multi-cabeza y red feed-forward sobre los que se aplicó LoRA |
| Parametros totales | 0,5B (modelo base Qwen2.5-0.5B-Instruct); el repositorio no detalla el recuento exacto de parámetros tras el ajuste |
| Parametros activos | No aplica: arquitectura densa, no es un modelo MoE |
| Longitud de contexto | No disponible en la información proporcionada; el modelo base Qwen2.5-0.5B-Instruct declara 32 768 tokens en su documentación oficial, dato no confirmado en esta ficha |
| Tipos de cuantizacion | Cuantización de 4 bits con doble cuantización durante el entrenamiento (QLoRA). El repositorio no publica versiones cuantizadas de inferencia (GGUF, AWQ, GPTQ, bitsandbytes) |
| Idiomas soportados | Indonesio (id) como idioma objetivo del ajuste. El modelo base es multilingüe, pero el ajuste se ha realizado exclusivamente sobre datos en indonesio |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repositorio de HuggingFace). No se especifica si contiene los pesos fusionados o únicamente el adaptador LoRA |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only de tipo denso y aproximadamente 500 millones de parámetros. Sobre él se aplicó un ajuste supervisado (SFT) mediante SFTTrainer de la librería TRL, con adaptadores LoRA en las proyecciones de atención multi-cabeza (q_proj, k_proj, v_proj, o_proj) y de la red feed-forward (gate_proj, up_proj, down_proj). El entrenamiento usó QLoRA de 4 bits con doble cuantización, lo que permite ejecutar el proceso en GPUs de gama media o consumer.

Se documentan dos experimentos con 800 pasos cada uno. El primero empleó LoRA con r=16, alpha=32, learning rate 2e-4 y scheduler lineal, alcanzando una pérdida de validación final de 0,9150. El segundo, marcado como el mejor, usó r=32, alpha=64, learning rate 1e-4 y scheduler coseno, con pérdida de validación final de 0,8210. Los datos de entrenamiento provienen del dataset Ichsan2895/alpaca-gpt4-indonesian, descrito en la model card como conjunto de instrucciones sobre derecho y regulación laboral indonesia, aunque el nombre del dataset sugiere un corpus generalista de instrucciones en indonesio generado con GPT-4. No se menciona ninguna fase de RLHF, DPO u otro ajuste por preferencias, ni técnicas de decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto instructivo en indonesio: respuestas a preguntas y peticiones formuladas mediante plantilla de chat con rol de sistema, usuario y asistente.
- Especialización declarada en temática legal y de relaciones laborales de Indonesia (por ejemplo, la model card ilustra el caso de la diferencia entre PKWT y PKWTT).
- Formato conversacional multi-turno mediante apply_chat_template, con soporte de mensaje de sistema para fijar el rol de asistente legal.
- Generación de texto condicionada con max_new_tokens configurable (el ejemplo de la model card usa 256).
- Soporte de tool calling / function calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información proporcionada.
- Capacidades multilingües: limitadas en la práctica al indonesio; no se documenta evaluación en otros idiomas.
- Capacidades especiales (modo de razonamiento explícito, visión, audio): no disponibles.

## Casos de uso

- Asistente interno de consulta normativa laboral: el modelo responde con un mensaje de sistema que fija el rol de asistente legal y atiende preguntas sobre contratos, tipos de relación laboral y normativa indonesia, siempre con revisión humana del resultado.
- Prototipado rápido de chatbots en indonesio: al ocupar menos de 1 GB en precisión FP16, puede desplegarse en una instancia pequeña para validar flujos conversacionales antes de migrar a un modelo mayor.
- Generación de borradores de documentación interna: redacción de resúmenes y explicaciones en indonesio sobre procedimientos y políticas de recursos humanos a partir de instrucciones breves.
- Educación y material didáctico: producción de preguntas y respuestas explicativas sobre terminología jurídica indonesia para cursos introductorios.
- Base para investigaciones en adaptación de dominio: sirve como punto de partida reproducible para comparar configuraciones de LoRA (r, alpha, scheduler, learning rate) en tareas de nicho.
- Preprocesado y etiquetado asistido en pipelines de datos legales: clasificación y reformulación de fragmentos de texto normativo en indonesio para su posterior revisión.
- Inferencia en entornos con recursos limitados o sin GPU: al ser un modelo de 0,5B, puede ejecutarse en CPU para tareas de baja concurrencia y latencia no crítica.
- Demostración docente de PEFT: ejemplo completo de flujo QLoRA + TRL + Unsloth/SFTTrainer apto para aulas y talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta pérdidas de validación del entrenamiento: 0,9150 para el experimento 1 (LoRA r=16, alpha=32) y 0,8210 para el experimento 2 (LoRA r=32, alpha=64). La búsqueda web realizada no devolvió resultados relevantes sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1 GB en FP16/BF16 para los pesos de un modelo de 0,5B; aproximadamente 0,4-0,6 GB en cuantización de 4 bits; alrededor de 2 GB en FP32. Hay que sumar el espacio de caché KV, que crece con la longitud de contexto.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente, incluidas NVIDIA GTX 1650, RTX 3050, RTX 4060 y superiores; también GPU de datacenter como T4, A10, A100 o H100, aunque estarían enormemente sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU dedicadas actuales e incluso en iGPU con memoria compartida suficiente. También es viable en CPU con 2-4 GB de RAM libre.
- Opciones de despliegue: transformers (ejemplo oficial de la model card con torch_dtype=torch.float16 y device_map="auto"), vLLM y TGI para servir en GPU; llama.cpp y Ollama requieren convertir previamente los pesos a GGUF, ya que el repositorio no publica ficheros GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada. No se han publicado mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MDWT/qwen2.5-0.5b-legal-alpaca-id | 0,5B | No disponible en la informacion proporcionada | Apache 2.0 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta | Ajuste QLoRA sobre dominio legal indonesio, sin benchmarks publicados |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5B | No disponible en la informacion proporcionada | Apache 2.0 | HuggingFace, modelo base ampliamente utilizado | Modelo generalista original; el ajuste lo especializa en indonesio legal a costa de capacidades generales |
| Qwen2.5-1.5B-Instruct | 1,5B | No disponible en la informacion proporcionada | Apache 2.0 | HuggingFace | Alternativa de mayor tamaño de la misma familia, con más capacidad de razonamiento y mayor coste de inferencia |
| Modelos instructivos pequeños de otras familias (por ejemplo, Gemma-2-2B-it o SmolLM2) | Entre 0,3B y 2B | No disponible en la informacion proporcionada | Según familia | HuggingFace | Comparativa estructural únicamente; no se dispone de datos de rendimiento comparables en la información proporcionada |

## Limitaciones y advertencias

- Riesgo elevado de alucinación: con 0,5B de parámetros y una pérdida de validación de 0,8210, es previsible que invente referencias normativas, números de artículo o plazos legales. No debe utilizarse como fuente de asesoramiento jurídico.
- Sesgos conocidos: no documentados por el autor. Al entrenarse sobre un dataset de instrucciones en indonesio, hereda los sesgos de ese corpus y los del modelo base Qwen2.5.
- Limitación idiomática: el ajuste está orientado al indonesio; el rendimiento en castellano, inglés u otros idiomas no ha sido evaluado y probablemente sea pobre en el dominio legal.
- Desajuste entre el dominio declarado y el dataset: la model card describe un corpus de derecho y regulación laboral, pero el dataset citado (Ichsan2895/alpaca-gpt4-indonesian) tiene nombre de corpus generalista de instrucciones en indonesio. La especialización legal puede ser menor de lo que sugiere el título.
- Entrenamiento muy corto: 800 pasos por experimento, sin fase de RLHF ni DPO, lo que limita la calidad de alineación y el seguimiento de instrucciones complejas.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indique los cambios. No obstante, la licencia no exime de responsabilidad por el contenido generado.
- Falta de validación comunitaria: el repositorio presenta 0 descargas y 0 likes en la información disponible, sin pruebas externas ni informes de terceros.
- Formato de publicación incompleto: no se publican versiones GGUF, AWQ ni GPTQ, ni se especifica si el repositorio contiene pesos fusionados o solo el adaptador, lo que puede complicar el despliegue directo en llama.cpp u Ollama.
- Contexto no verificado: la longitud de contexto efectiva del modelo ajustado no está documentada y podría diferir de la del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MDWT/qwen2.5-0.5b-legal-alpaca-id
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/Ichsan2895/alpaca-gpt4-indonesian
- La búsqueda web realizada no devolvió ningún enlace relevante sobre este modelo: los resultados obtenidos correspondían a páginas del Peak District National Park, sin relación con el modelo. No se dispone de paper, blog técnico, repositorio de código ni demo adicionales.
