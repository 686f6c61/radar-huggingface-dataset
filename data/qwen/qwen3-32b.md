# Qwen/Qwen3-32B

## Resumen
Qwen3-32B es un modelo de lenguaje causal de 32.762 millones de parámetros (32,8 B) desarrollado por el equipo Qwen de Alibaba. Forma parte de la familia Qwen3, que incluye modelos densos y de mezcla de expertos (MoE), y se distribuye con pesos abiertos y licencia Apache 2.0. El modelo está orientado a generación de texto, seguimiento de instrucciones, razonamiento, código, matemáticas, tareas de agente y traducción multilingüe.

Su arquitectura es un transformer decoder-only denso de 64 capas, con atención GQA de 64 cabezas para consultas y 8 para claves-valores. Dispone de 32.768 tokens de contexto nativo y puede extenderse a 131.072 tokens mediante YaRN. La innovación principal es la conmutación, dentro de una misma petición, entre modo thinking con bloque `<think>` explícito y modo non-thinking para diálogo eficiente.

Es relevante ahora porque concentra capacidades de razonamiento y uso de herramientas en un modelo de 32B con licencia permisiva, desplegable con vLLM, SGLang, llama.cpp u Ollama. Acumula 3.041.641 descargas y 769 me gusta en Hugging Face. No se incluyen cifras de benchmarks en la información disponible.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal, denso |
| Parámetros totales | 32.762.123.264 (32,8 B); 31,2 B sin embeddings |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens nativos; 131.072 con YaRN |
| Tipos de cuantización | No disponible en la información proporcionada; el repositorio oficial publica safetensors. El autor cita soporte de llama.cpp, Ollama, LM Studio, MLX-LM y KTransformers, sin detallar cuantizaciones |
| Idiomas soportados | Más de 100 idiomas y dialectos según la model card; no hay evaluación por idioma en la información |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors; repositorio de 65,5 GB; librería transformers |
| Capas | 64 |
| Atención | GQA con 64 cabezas para Q y 8 para KV |
| Etapa | Pretraining y post-training |
| Compatibilidad de despliegue | vLLM, SGLang, TGI, Ollama, LM Studio, llama.cpp, MLX-LM y KTransformers; endpoints compatibles, SageMaker y Azure según tags |

## Arquitectura y entrenamiento
Qwen3-32B es un transformer decoder-only denso de 64 capas. Emplea atención GQA con 64 cabezas de consulta y 8 de clave-valor, lo que reduce el coste de la caché KV frente a una atención multi-cabeza completa. Tiene 32,8 B de parámetros totales y 31,2 B sin embeddings. La ventana nativa es de 32.768 tokens y se amplía a 131.072 mediante YaRN.

El modelo pasa por pretraining y post-training, pero la información proporcionada no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF, DPO u otras técnicas de alineación. La model card sí destaca la alineación con preferencias humanas, la conmutación entre modo thinking y non-thinking, las capacidades de agente y el soporte de más de 100 idiomas. El cambio de modo se controla con `enable_thinking` en `apply_chat_template`; en modo thinking el modelo genera contenido dentro de `<think>...</think>` antes de la respuesta final. No se detallan innovaciones adicionales como decodificación especulativa o atención linear.

## Capacidades
- Generación de texto y conversación multi-turno, con alineación para escritura creativa, role-play, diálogos y seguimiento de instrucciones.
- Razonamiento explícito en modo thinking para matemáticas, código y lógica; modo non-thinking para diálogo general y respuestas más directas.
- Generación y análisis de código; no se incluyen cifras de HumanEval ni de otros benchmarks de código en la información disponible.
- Llamada a herramientas y funciones externas en ambos modos, con capacidades orientadas a agentes y tareas complejas.
- Razonamiento multi-paso mediante el bloque de pensamiento, útil para descomponer problemas antes de responder.
- Soporte multilingüe de más de 100 idiomas y dialectos, con capacidades de instrucción y traducción según la model card.
- Conmutación por petición entre modo thinking y non-thinking dentro del mismo modelo.
- No se confirman capacidades de visión, audio u otras modalidades en la información proporcionada.

## Casos de uso
- Atención al cliente multi-turno en varios idiomas: el modelo puede mantener el historial de conversación y la documentación de producto dentro de los 32.768 tokens nativos; el modo non-thinking ayuda a reducir latencia. Para aprovechar 131.072 tokens hay que configurar YaRN y presupuestar la caché KV.
- Agente de soporte técnico con APIs: puede decidir qué herramienta llamar, interpretar la respuesta y continuar el flujo; conviene usar thinking para el diagnóstico y non-thinking para la respuesta final. Requiere entorno aislado, permisos mínimos y validación humana.
- Revisión de código y generación de tests en CI/CD: puede analizar diffs, explicar errores y proponer parches; se integra mediante un endpoint compatible con OpenAI de vLLM o SGLang. No sustituye la ejecución de tests ni la revisión humana.
- Análisis de documentos largos: contratos, informes o expedientes de hasta 131.072 tokens con YaRN para extracción, resumen y preguntas sobre el contenido. Es recomendable verificar citas y datos extraídos.
- Traducción y localización: el soporte declarado de más de 100 idiomas permite instrucciones multilingües, adaptación de glosarios y traducción de contenido. La calidad por idioma no está cuantificada en la información disponible.
- Asistente de razonamiento matemático y analítica: el modo thinking permite descomponer problemas paso a paso; para cálculos críticos conviene validar con herramientas externas o código.
- Despliegue on-premise con licencia Apache 2.0: organizaciones que no pueden enviar datos a la nube pueden servir el modelo con vLLM o SGLang en A100/H100, o con cuantización de 4 bits en una RTX 4090 para prototipos y contextos cortos.
- Escritura creativa y role-play: la alineación de preferencias humanas descrita por el autor facilita generar diálogos, personajes y textos narrativos; revisar sesgos y coherencia antes de publicar.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card enlaza al blog y a la documentación para evaluación, pero no incluye cifras de MMLU, HumanEval, GSM8K ni otras en el extracto proporcionado.

## Requisitos de hardware
- BF16/FP16: los pesos ocupan aproximadamente 65,5 GB (32,8 B × 2 bytes), más caché KV y activaciones. Se recomiendan A100 80 GB, H100 80 GB o H200; para lotes grandes o contexto de 131K puede hacer falta más de una GPU.
- FP8/INT8: los pesos ocupan aproximadamente 33 GB. Cabe en A100/H100 de 80 GB, A6000 de 48 GB o 2× RTX 4090 de 24 GB. El contexto largo y el tamaño de lote pueden exigir más memoria.
- 4 bits: los pesos ocupan aproximadamente 16-18 GB. Puede caber en una RTX 4090 de 24 GB con contexto corto; con 32K tokens la caché KV puede hacer que no quepa. Para 131K se necesita más memoria o cuantización de la caché KV.
- CPU y Apple Silicon: llama.cpp, Ollama, LM Studio y MLX-LM son opciones citadas por el autor. Para 4 bits con contexto moderado se recomiendan 64 GB de memoria unificada o más; no hay datos de rendimiento en la información.
- Despliegue: vLLM >=0.8.5, SGLang >=0.4.6.post1, TGI, Ollama, LM Studio, llama.cpp, MLX-LM y KTransformers. vLLM y SGLang permiten crear una API compatible con OpenAI.
- Latencia y throughput: no disponibles en la información. Dependen de la GPU, la cuantización, la longitud de contexto y la longitud de salida; el modo thinking genera más tokens y aumenta la latencia.

## Comparativa con modelos similares
La información proporcionada no incluye especificaciones verificadas de modelos alternativos. La model card cita QwQ-32B y Qwen2.5-32B-Instruct como referencias; se recogen solo las afirmaciones cualitativas del autor.

| Modelo | Parámetros | Contexto | Rendimiento comparado | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-32B | 32,8 B | 32.768 nativos; 131.072 con YaRN | Referencia de esta ficha; sin cifras en la información | Apache 2.0 | Hugging Face |
| QwQ-32B | No disponible | No disponible | La model card afirma que Qwen3-32B lo supera en modo thinking en matemáticas, código y razonamiento | No disponible | No disponible |
| Qwen2.5-32B-Instruct | No disponible | No disponible | La model card afirma que Qwen3-32B lo supera en modo non-thinking en matemáticas, código y razonamiento | No disponible | No disponible |
| Otras alternativas de 27B-32B | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias
- Riesgo de alucinación: no está cuantificado; como todo LLM, puede inventar hechos, APIs o citas. En producción hay que verificar datos y acciones.
- Sesgos: la composición del dataset y las evaluaciones de sesgo no se detallan en la información, por lo que no se pueden enumerar sesgos específicos.
- Idioma: se declaran más de 100 idiomas, pero no hay métricas por idioma; el rendimiento en español no está cuantificado.
- Contexto: los 131.072 tokens requieren configuración YaRN; sin ella, el límite nativo es 32.768. El contexto largo aumenta el uso de memoria y puede degradar la precisión.
- Licencia: Apache 2.0 permite uso comercial, pero deben cumplirse los términos de la licencia y de la model card; no hay garantía de ningún tipo.
- Modo thinking: está activado por defecto y aumenta el número de tokens y la latencia. En ese modo se recomienda `temperature=0.6`, `top_p=0.95`, `top_k=20` y `min_p=0`; no usar decodificación greedy.
- Uso de herramientas y agentes: requiere validación, permisos mínimos y un entorno aislado; puede encadenar acciones erróneas o inseguras.
- Cuantización: no se detallan tipos oficiales; las cuantizaciones de terceros pueden degradar la calidad o el soporte de contexto largo.
- Hardware: es un modelo de 32B; en BF16 ocupa unos 65,5 GB, por lo que no es adecuado para GPU de consumo sin cuantización.
- Transformers: requiere una versión >=4.51.0; versiones anteriores fallan con `KeyError: 'qwen3'`.
- Modalidades: no se confirman capacidades de visión, audio u otras modalidades.

## Enlaces
- [Hugging Face: Qwen/Qwen3-32B](https://huggingface.co/Qwen/Qwen3-32B)
- [Licencia del modelo](https://huggingface.co/Qwen/Qwen3-32B/blob/main/LICENSE)
- [Blog de Qwen3](https://qwenlm.github.io/blog/qwen3/)
- [Repositorio GitHub de Qwen3](https://github.com/QwenLM/Qwen3)
- [Documentación de Qwen](https://qwen.readthedocs.io/en/latest/)
- [Documentación de despliegue con SGLang](https://qwen.readthedocs.io/en/latest/deployment/sglang.html)
- [Documentación de despliegue con vLLM](https://qwen.readthedocs.io/en/latest/deployment/vllm.html)
- [Qwen Chat](https://chat.qwen.ai/)
- [Qwen](https://qwen.ai/home)
- [Qwen Code](https://qwen.ai/qwencode)
- [Organización Qwen en Hugging Face](https://huggingface.co/Qwen)
- [arXiv 2505.09388](https://arxiv.org/abs/2505.09388)
- [arXiv 2309.00071](https://arxiv.org/abs/2309.00071)
- [QwenCloud](https://www.qwencloud.com/) (resultado de búsqueda; verificar oficialidad)
