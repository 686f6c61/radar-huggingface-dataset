# raphaeloliveira/Uirapuru-JT-Llama-3.2

## Resumen

Uirapuru-JT-Llama-3.2 es un modelo de lenguaje de 3 000 millones de parámetros desarrollado por raphaeloliveira, obtenido mediante fine-tuning del modelo base Meta Llama 3.2 3B sobre datos en portugués. El nombre "Uirapuru" hace referencia al ave mitológica brasileña, y el sufijo "JT" sugiere un ajuste orientado a tareas específicas, aunque la documentación pública no detalla el conjunto de datos de entrenamiento. El modelo está pensado para generación de texto en portugués, aprovechando la arquitectura transformer densa de Llama 3.2.

La relevancia de este modelo radica en ofrecer una alternativa de tamaño reducido (3B parámetros) especializada en portugués, un idioma con menos recursos que el inglés. Al estar basado en Llama 3.2, hereda las capacidades de razonamiento y generación del modelo original, pero adaptadas al contexto lusófono. El acceso es restringido (gated) en HuggingFace, lo que implica que los usuarios deben aceptar condiciones adicionales antes de descargarlo. Su licencia Apache 2.0 permite uso comercial, aunque con las restricciones propias de los modelos Llama de Meta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.2 3B) |
| Parametros totales | 3 212 749 824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Llama 3.2 3B soporta hasta 128K tokens, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos en safetensors, sin versiones cuantizadas publicadas) |
| Idiomas soportados | Portugues (pt) |
| Licencia | Apache 2.0 (con condiciones de uso de Meta Llama) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.2 3B de Meta, un transformer denso con normalización RMSNorm, activación SwiGLU y atención con máscara causal. El modelo original fue preentrenado con un contexto de hasta 128K tokens y optimizado para razonamiento, código y multilingüismo. Uirapuru-JT-Llama-3.2 es un fine-tuning de este modelo base, realizado por raphaeloliveira, aunque no se han publicado detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de alineación como RLHF o DPO. El repositorio indica que el modelo está etiquetado con `text-generation-inference` y `endpoints_compatible`, lo que sugiere que está preparado para despliegue en entornos de producción con TGI.

Al ser un fine-tuning, se espera que conserve las capacidades generales del modelo base, pero con un ajuste hacia el portugués. No se dispone de información sobre innovaciones técnicas específicas en el entrenamiento, como decodificación especulativa o atención lineal, más allá de las ya presentes en Llama 3.2.

## Capacidades

- Generación de texto en portugués: el modelo está especializado en producir texto coherente y contextualmente relevante en portugués, tanto de Brasil como de Portugal, aunque el sesgo probablemente sea brasileño por el nombre y el autor.
- Razonamiento y comprensión: al heredar de Llama 3.2 3B, mantiene capacidades de razonamiento lógico y comprensión de instrucciones complejas, aunque limitadas por su tamaño.
- Generación de código: el modelo base Llama 3.2 3B tiene capacidades de programación, por lo que este fine-tune podría utilizarse para tareas de código con instrucciones en portugués.
- Multilingüismo parcial: aunque el fine-tune está enfocado en portugués, el modelo base soporta varios idiomas, por lo que podría responder en otros idiomas con menor calidad.
- Tool calling y agentes: no se ha confirmado específicamente para este fine-tune, pero el modelo base Llama 3.2 3B soporta function calling y uso de herramientas. Se recomienda verificar experimentalmente.
- Modo de pensamiento: no se ha documentado un modo de razonamiento extendido específico para este modelo.

## Casos de uso

- Atención al cliente automatizada en portugués: el modelo puede gestionar conversaciones multi-turno en portugués, respondiendo preguntas frecuentes y derivando casos complejos a agentes humanos. Su tamaño de 3B permite desplegarlo en infraestructura moderada, adecuado para empresas brasileñas o portuguesas que buscan automatizar soporte.
- Generación de contenido editorial en portugués: redacción de artículos, resúmenes de noticias o descripciones de productos en portugués, con un tono natural y adaptado al público lusófono.
- Asistente de programación con instrucciones en portugués: dado que el modelo base maneja código, puede ayudar a desarrolladores lusófonos a generar fragmentos de código, explicar errores o documentar APIs, respondiendo en su idioma nativo.
- Transcripción y normalización de texto: corrección gramatical, reformulación de frases o adaptación de textos informales a formales en portugués, útil para herramientas de edición.
- Chatbots educativos: tutoría en portugués para estudiantes de primaria o secundaria, explicando conceptos de ciencias, historia o matemáticas con un lenguaje adaptado.
- Análisis de sentimiento y clasificación de texto: fine-tuning adicional sobre este modelo podría producir clasificadores de opinión en portugués para redes sociales o reseñas de productos, aprovechando su base lingüística.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo específico. Se recomienda realizar pruebas propias en tareas en portugués para evaluar su rendimiento real.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en BF16 (el formato original de safetensors), el modelo ocupa aproximadamente 6,4 GB, por lo que se necesitan al menos 8 GB de VRAM para inferencia con batch pequeño. Con cuantización 8-bit (si se genera) bajaría a ~3,2 GB, y con 4-bit a ~1,6 GB, aunque no se han publicado versiones cuantizadas.
- GPU recomendadas: una NVIDIA RTX 3060 12GB o superior puede ejecutar el modelo en BF16. Para mayor velocidad, una RTX 4090 o A10G. En entornos cloud, una T4 (16GB) es suficiente.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo con 8 GB o más de VRAM, como RTX 3060, RTX 3070, RTX 4060 Ti, etc., siempre que se gestione el batch size.
- Opciones de despliegue: al ser un modelo de transformers estándar, puede servirse con vLLM, Text Generation Inference (TGI), llama.cpp (si se convierte a GGUF) u Ollama (si se crea un Modelfile). El repositorio indica compatibilidad con endpoints de HuggingFace.
- Latencia y throughput estimados: no se dispone de mediciones específicas. Para un modelo de 3B en una GPU moderna, se espera una latencia de decodificación de 20-50 ms por token con batch 1, y throughput de varios cientos de tokens por segundo con batching en vLLM, pero estos valores son orientativos y dependen del hardware.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas específicas de la misma categoría (fine-tunes de Llama 3.2 3B en portugués). Se puede mencionar que el modelo base Llama 3.2 3B es su principal referencia, y que existen otros modelos en portugués como Sabiá (de la startup brasileña Maritaca AI) o modelos de la familia Portunol, pero no se tienen datos de rendimiento comparables. Por tanto, la comparativa se limita a indicar que no hay datos disponibles.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tune de Llama 3.2, hereda los sesgos del modelo base, que pueden incluir estereotipos de género, raza o cultura. El fine-tuning en portugués puede amplificar sesgos específicos del corpus utilizado, aunque no se ha documentado.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o inventada, especialmente en dominios especializados. Se recomienda verificar las salidas en aplicaciones críticas.
- Limitaciones de contexto: aunque el modelo base soporta hasta 128K tokens, no se ha confirmado que este fine-tune mantenga esa longitud. Es probable que el contexto efectivo sea menor si el fine-tuning se realizó con secuencias cortas.
- Restricciones de licencia: aunque la licencia es Apache 2.0, el modelo base Llama 3.2 está sujeto a los Términos de Uso de Meta, que incluyen restricciones sobre el uso para mejorar otros modelos y requisitos de atribución. El acceso gated en HuggingFace implica que el usuario debe aceptar las condiciones de Meta antes de descargar.
- Idioma: el modelo está optimizado para portugués; su rendimiento en otros idiomas puede ser inferior al del modelo base.
- Documentación limitada: no se han publicado detalles sobre el dataset de entrenamiento, el proceso de fine-tuning ni evaluaciones, lo que dificulta la reproducibilidad y la confianza en su comportamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/raphaeloliveira/Uirapuru-JT-Llama-3.2
- DOI asociado: 10.57967/hf/10157
- Documentación de Meta sobre Llama 3.2: https://developer.meta.com/ai/docs/model-cards-and-prompt-formats/llama3_2/
- Paper de Llama 3 (modelo base): https://arxiv.org/pdf/2407.21783
