# mradermacher/CallForge-1B-v1-GGUF

## Resumen

CallForge-1B-v1-GGUF es la versión cuantizada en formato GGUF del modelo CallForge-1B-v1, desarrollado originalmente por solomoniw y cuantizado por mradermacher. Se trata de un modelo de lenguaje pequeño, con aproximadamente 1.080 millones de parámetros, especializado en tool-use, function-calling y tareas de agente, según los tags de su ficha en HuggingFace. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

La relevancia de este modelo radica en su tamaño reducido, que lo hace apto para ejecutarse en hardware de consumo, como GPUs domésticas o incluso CPU, manteniendo capacidades de llamada a funciones y conversación. Al estar disponible en múltiples cuantizaciones GGUF (desde Q2_K hasta f16), ofrece flexibilidad para desplegarlo en entornos con recursos limitados, como edge devices o aplicaciones de agentes ligeros. No obstante, la información pública sobre su arquitectura interna, datos de entrenamiento y rendimiento es escasa, por lo que esta ficha se basa principalmente en los metadatos y la documentación de cuantización proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 1.080.632.832 (1,08 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base, no incluido en este repo) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo original CallForge-1B-v1. Los tags indican que se trata de un modelo basado en LoRA (low-rank adaptation), lo que sugiere que es un adaptador entrenado sobre un modelo base preexistente, aunque no se especifica cual. Tampoco se publican datos sobre el dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas como RLHF o DPO.

La cuantizacion GGUF realizada por mradermacher es de tipo estatica, sin usar imatrix ni weighted quants en el momento de la publicacion. Los archivos se generaron a partir de los pesos originales en formato safetensors, y se ofrecen en varios niveles de precision para equilibrar calidad y uso de memoria.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como "conversational", por lo que puede mantener dialogos multi-turno.
- Tool-use y function-calling: es su capacidad principal, permitiendo que el modelo invoque funciones externas o APIs durante una conversacion.
- Soporte para agentes: los tags incluyen "agent", indicando que puede integrarse en flujos de razonamiento multi-paso y toma de decisiones.
- Multilingue: no, solo soporta ingles (segun el campo "language: en").
- Otras capacidades (vision, audio, thinking mode): no disponibles ni indicadas.

## Casos de uso

- Asistentes virtuales ligeros: al ser un modelo de 1B, puede integrarse en aplicaciones de chat en tiempo real sin requerir GPUs de gama alta, gestionando conversaciones con llamadas a herramientas como consultas a bases de datos o APIs de calendario.
- Automatizacion de tareas de back-office: gracias a su soporte de function-calling, puede utilizarse para extraer datos de formularios, actualizar registros en CRMs o enviar notificaciones, ejecutandose en servidores modestos o incluso en local.
- Agentes de soporte tecnico de primer nivel: con un contexto limitado (aunque no se especifica), puede resolver incidencias simples derivando a un humano cuando detecta que no puede completar la tarea, usando herramientas de ticketing.
- Prototipado rapido de agentes: su tamano reducido permite iterar rapidamente en entornos de desarrollo, probando flujos de tool-calling antes de escalar a modelos mayores.
- Edge computing e IoT: al poder cuantizarse a Q4_K_M (0,8 GB), es viable desplegarlo en dispositivos con poca memoria, como Raspberry Pi o mini-PCs, para tareas de procesamiento de lenguaje natural local.
- Educacion e investigacion: su licencia Apache 2.0 y su tamano lo hacen adecuado para experimentar con tecnicas de fine-tuning o para ensenar conceptos de function-calling en cursos de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre MMLU, HumanEval, GSM8K u otras metricas estandar para este modelo, ni comparaciones con alternativas similares.

## Requisitos de hardware

- VRAM estimada para inferencia: segun la cuantizacion, entre 0,6 GB (Q2_K) y 2,3 GB (f16). La mayoria de las cuantizaciones (Q4_K_M, Q5_K_M) ocupan menos de 1 GB, por lo que caben en cualquier GPU moderna con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con soporte CUDA o Vulkan, como NVIDIA GTX 1650 o superior, o incluso iGPUs con suficiente memoria compartida. Tambien puede ejecutarse en CPU pura con llama.cpp, aunque con mayor latencia.
- Compatibilidad con consumer GPU: si, es totalmente viable en GPUs de consumo como RTX 3060, RTX 4060, etc., dejando espacio para el contexto y otros procesos.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio, text-generation-webui y servidores como llama-cpp-python. Tambien puede usarse con vLLM si se convierte a otro formato, aunque no es el flujo habitual.
- Latencia y throughput: no se dispone de mediciones oficiales. En una GPU moderna, un modelo de 1B en Q4_K_M puede generar decenas de tokens por segundo, pero estos valores dependen del hardware y del backend.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con otros modelos de la misma categoria (function-calling de ~1B). Existen alternativas como ToolLlama o modelos pequenos de Mistral, pero no se tienen datos de rendimiento ni especificaciones contrastables en la documentacion proporcionada. Por tanto, la comparativa se limita a indicar que el modelo compite en el nicho de agentes ligeros, pero sin datos cuantitativos.

## Limitaciones y advertencias

- Idioma: solo soporta ingles, lo que limita su uso en entornos multilingues.
- Tamano reducido: con 1B de parametros, es probable que tenga dificultades con razonamiento complejo, matematicas avanzadas o comprension de contextos muy largos, aunque no se especifica la longitud de contexto.
- Riesgo de alucinacion: como todos los LLM, puede generar informacion falsa o inventar respuestas, especialmente en tareas de function-calling si los argumentos no estan bien definidos.
- Sesgos: no se han publicado evaluaciones de sesgos; al ser un modelo pequeno entrenado con datos no especificados, podria reflejar sesgos presentes en su corpus.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y la atribucion correspondiente.
- Dependencia del modelo base: al ser un adaptador LoRA, su comportamiento depende del modelo base sobre el que se aplico, que no se detalla en la informacion disponible.
- Cuantizacion estatica: los quants ofrecidos no usan imatrix, lo que puede afectar ligeramente la calidad en comparacion con versiones con weighted quants, aunque para un modelo de este tamano la diferencia suele ser minima.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/CallForge-1B-v1-GGUF
- Modelo base (safetensors): https://huggingface.co/solomoniw/CallForge-1B-v1
- Version anterior (v0): https://huggingface.co/mradermacher/CallForge-1B-v0-GGUF
- Perfil del cuantizador: https://huggingface.co/mradermacher
