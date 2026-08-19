# leeroy-jankins/nisty

## Resumen

NISTy es un modelo de lenguaje especializado en gobernanza de inteligencia artificial, gestión de riesgos y marcos normativos del Instituto Nacional de Estándares y Tecnología de Estados Unidos (NIST). Desarrollado por el usuario leeroy-jankins, se trata de un fine-tuning del modelo base `unsloth/gemma-4-E4B-it-GGUF`, que a su vez es una versión cuantizada de Gemma 4 E4B, un transformer de 7.518 millones de parámetros (aproximadamente 7,5B) con una ventana de contexto de hasta 128.000 tokens. El modelo está diseñado para responder preguntas estructuradas, interpretar políticas, comprender documentos técnicos y apoyar flujos de generación aumentada por recuperación (RAG) sobre materiales oficiales del NIST, incluyendo el AI Risk Management Framework, el Cybersecurity Framework y el Privacy Framework.

La relevancia de NISTy radica en la creciente demanda de herramientas que ayuden a las organizaciones a interpretar y aplicar los marcos de riesgo de IA, especialmente en contextos de cumplimiento normativo y gobernanza responsable. Al estar construido sobre una arquitectura compacta de 8B, ofrece un equilibrio práctico entre velocidad de inferencia, despliegue ligero y razonamiento especializado. El modelo se distribuye bajo licencia MIT, lo que permite uso comercial sin restricciones significativas, y está disponible en formato safetensors y GGUF, facilitando su integración en entornos de producción y experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4, variante E4B) |
| Parametros totales | 7.518.069.290 (7,5B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | GGUF (según tags del repositorio); safetensors disponible |
| Idiomas soportados | Inglés (principal); el modelo base soporta 35+ idiomas, pero el fine-tuning se centra en inglés |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

NISTy se basa en la arquitectura Gemma 4 E4B, un transformer denso de aproximadamente 8.000 millones de parámetros (el conteo exacto es 7.518.069.290). El modelo base fue desarrollado por Google y posteriormente cuantizado por unsloth en formato GGUF. Sobre esta base, el autor realizó un fine-tuning y post-entrenamiento utilizando un conjunto de datasets especializados en gobernanza de IA y ciberseguridad, incluyendo el NIST AI Risk Management Framework, el NIST Cybersecurity Framework, el NIST Privacy Framework, el documento NIST Managing AI Misuse Risk, el OWASP Agentic AI Threats, la OMB Circular A-123 y las Órdenes Ejecutivas 14144 y 14306. No se especifica si se emplearon técnicas de RLHF o DPO; la información disponible indica únicamente un ajuste fino supervisado sobre estos materiales. El modelo hereda las innovaciones técnicas de Gemma 4, como el modo de razonamiento integrado (thinking), soporte multimodal (imagen, vídeo y audio en las variantes E2B/E4B) y capacidad de function calling nativa.

## Capacidades

- Generación de texto y razonamiento paso a paso mediante el modo "thinking" integrado, que permite al modelo deliberar antes de responder.
- Comprensión de documentos técnicos y normativos: resumen, extracción de conceptos clave y respuesta a preguntas sobre marcos NIST, OWASP y directivas ejecutivas.
- Razonamiento sobre gestión de riesgos de IA: identificación de riesgos por contexto, uso previsto, partes interesadas, impactos y fase del ciclo de vida.
- Análisis de gobernanza: soporte para discusiones sobre políticas, procesos, responsabilidad y supervisión de sistemas de IA.
- Mapeo de controles: asistencia para relacionar riesgos, salvaguardas, prácticas de documentación y actividades de monitoreo con los marcos de referencia.
- Integración con RAG: diseñado para trabajar con almacenes vectoriales y recuperar pasajes autorizados de fuentes NIST.
- Salidas estructuradas: generación de tablas, listas de verificación, matrices de comparación, registros de riesgos y planes de implementación.
- Function calling: soporte nativo para uso de herramientas, lo que permite flujos de trabajo agénticos.
- Capacidades multimodales heredadas: comprensión de imágenes (detección de objetos, OCR, gráficos), vídeo (análisis de secuencias de frames) y audio (solo en E2B/E4B, incluye ASR y traducción de voz).
- Multilingüismo: el modelo base soporta 35+ idiomas, aunque el fine-tuning se centra en inglés.

## Casos de uso

- Asistente de gestión de riesgos de IA: NISTy puede guiar a equipos de cumplimiento en la identificación y clasificación de riesgos según el AI Risk Management Framework del NIST, ayudando a estructurar evaluaciones de impacto y a priorizar mitigaciones.
- Sistema de preguntas y respuestas sobre normativa: integrado en un chatbot corporativo, responde consultas sobre requisitos de la Orden Ejecutiva 14144 o la OMB Circular A-123, citando pasajes relevantes de los documentos originales.
- Generación aumentada por recuperación (RAG) para auditorías: combinado con un almacén vectorial de documentos NIST, el modelo recupera pasajes específicos y genera informes de brechas (gap analysis) entre los controles existentes y los requeridos.
- Resumen de políticas técnicas: dado un documento extenso del NIST o de OWASP, NISTy produce resúmenes ejecutivos estructurados, destacando obligaciones, plazos y responsabilidades.
- Mapeo de controles de ciberseguridad: ayuda a los analistas a correlacionar los controles del NIST Cybersecurity Framework con los del Privacy Framework, generando matrices de correspondencia y detectando solapamientos o vacíos.
- Generación de registros de riesgos: a partir de una descripción de un sistema de IA, el modelo produce tablas de riesgos con probabilidad, impacto, controles propuestos y propietario, listas para incorporar a herramientas de gestión de riesgos.
- Entrenamiento de personal: como herramienta educativa, NISTy explica conceptos de gobernanza de IA, como "trustworthy AI" o "AI misuse risk", con ejemplos prácticos y referencias a los marcos oficiales.
- Prototipado de agentes de cumplimiento: gracias a su soporte de function calling, puede integrarse en pipelines agénticos que consultan bases de datos de políticas, verifican controles y generan alertas de incumplimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para este modelo específico. Se recomienda evaluar el rendimiento en tareas de gobernanza de IA mediante pruebas internas con conjuntos de datos propios.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización GGUF Q4_K_M, el modelo requiere aproximadamente 4-5 GB de VRAM; con Q8, alrededor de 8 GB; en FP16, unos 15 GB.
- GPU recomendadas: para inferencia local con cuantización 4-bit, una GPU con 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) es suficiente. Para FP16 o cargas de trabajo con contexto largo, se recomienda una GPU con 16-24 GB (RTX 3090, RTX 4090, A10, A100).
- Compatibilidad con GPU de consumo: sí, cabe en GPUs consumer de gama media-alta con al menos 8 GB de VRAM si se usa cuantización GGUF.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Text Generation Inference (TGI), Hugging Face Transformers con carga en 8-bit o 4-bit.
- Latencia y throughput: no se dispone de datos medidos. Como referencia, un modelo de 8B en una RTX 4090 con cuantización 4-bit suele generar entre 30 y 60 tokens por segundo, dependiendo de la longitud de la secuencia y el backend.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| NISTy (leeroy-jankins) | 7,5B | 128K | MIT | Gobernanza de IA, marcos NIST |
| Gemma 4 E4B (base) | 7,5B | 128K | Gemma Terms (uso comercial permitido con restricciones) | Generalista, multimodal |
| Llama 3 8B Instruct | 8B | 8K (extensible a 128K) | Llama 3 Community License | Generalista, instrucción |
| Mistral 7B Instruct | 7B | 32K | Apache 2.0 | Generalista, instrucción |

NISTy se diferencia de los modelos generalistas por su ajuste fino en dominios normativos específicos, lo que lo hace más preciso en tareas de gobernanza de IA, aunque sacrifica versatilidad general. Su licencia MIT es más permisiva que la de Gemma 4 base o Llama 3, lo que facilita su integración en productos comerciales. La ventana de contexto de 128K es superior a la de Llama 3 8B y Mistral 7B, lo que permite procesar documentos normativos extensos en una sola pasada.

## Limitaciones y advertencias

- El modelo está especializado en inglés y en los marcos NIST/OWASP; su rendimiento en otros idiomas o en dominios no relacionados puede ser inferior al de un modelo generalista.
- No es un sustituto de asesoramiento legal, de cumplimiento, de auditoría o de interpretación oficial de estándares. Las respuestas deben ser revisadas por profesionales cualificados.
- Puede presentar alucinaciones, especialmente cuando se le pide citar pasajes exactos de documentos. Se recomienda verificar las referencias con las fuentes originales.
- El fine-tuning se realizó sobre un conjunto limitado de datasets; puede haber sesgos derivados de la selección de materiales y de la interpretación del autor.
- Aunque la licencia MIT permite uso comercial, el modelo base Gemma 4 tiene sus propios términos de uso que podrían imponer restricciones adicionales; se recomienda revisar la licencia de Gemma 4 antes de un despliegue comercial.
- El modelo no ha sido evaluado formalmente con benchmarks públicos, por lo que su rendimiento en tareas estándar de NLP es desconocido.
- Para uso en producción, es imprescindible implementar mecanismos de validación de salidas y control de calidad, especialmente en contextos de cumplimiento normativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leeroy-jankins/nisty
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it-GGUF
- Dataset NIST AI Risk Management Framework: https://huggingface.co/datasets/leeroy-jankins/NIST-AI-Risk-Management-Framework
- Dataset NIST Cybersecurity Framework: https://huggingface.co/datasets/leeroy-jankins/NIST-CyberSecurity-Framework
- Dataset NIST Privacy Framework: https://huggingface.co/datasets/leeroy-jankins/NIST-Privacy-Framework
- Dataset NIST Managing AI Misuse Risk: https://huggingface.co/datasets/leeroy-jankins/NIST-Managing-AI-Misuse-Risk
- Dataset OWASP Agentic AI Threats: https://huggingface.co/datasets/leeroy-jankins/OWASP-Agentic-AI-Threats
- Dataset OMB Circular A-123: https://huggingface.co/datasets/leeroy-jankins/OMB-Circular-A-123
- Dataset Executive Order 14144: https://huggingface.co/datasets/leeroy-jankins/Executive-Order-14144
- Dataset Executive Order 14306: https://huggingface.co/datasets/leeroy-jankins/Executive-Order-14306
