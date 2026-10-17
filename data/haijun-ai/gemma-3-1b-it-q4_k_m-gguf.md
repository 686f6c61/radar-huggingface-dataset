# Haijun-AI/gemma-3-1b-it-Q4_K_M.gguf

## Resumen

Este repositorio contiene una cuantización GGUF Q4_K_M del modelo Gemma 3 1B instruction-tuned, publicada por el usuario Haijun-AI. No es una publicación oficial de Google: es una conversión de pesos orientada a inferencia local con llama.cpp u Ollama. El modelo base pertenece a la familia Gemma 3, con aproximadamente 1.000 millones de parámetros (999.885.952 reales) y una ventana declarada de 128K tokens en la documentación de Ollama para la familia.

Su relevancia está en el tamaño: el repositorio ocupa 0,8 GB y la cuantización Q4_K_M reduce los requisitos de memoria, lo que permite ejecutarlo en portátiles, mini-PC y GPUs de gama baja. Es adecuado para prototipos, asistentes locales y tareas sencillas de clasificación, resumen o respuesta a preguntas, no para razonamiento complejo o producción crítica sin una evaluación previa.

La ficha del repositorio es mínima: no incluye model card detallada, licencia, idiomas ni benchmarks. Además, el número de descargas (18) y likes (0) indica una validación comunitaria muy limitada. Los datos sobre contexto, idiomas y multimodalidad proceden de la documentación de Gemma 3/Ollama, no de una verificación específica de este archivo GGUF.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only del modelo base Gemma 3; no se detalla en el repositorio del GGUF |
| Parámetros totales | 999.885.952 (~1B) |
| Parámetros activos | No aplica; no se describe como modelo MoE |
| Longitud de contexto | 128.000 tokens (128K), según la ficha de Ollama para Gemma 3; no verificado específicamente para este GGUF |
| Tipos de cuantización | Q4_K_M; etiqueta imatrix en el repositorio |
| Idiomas soportados | Más de 140 idiomas según la ficha de Ollama para Gemma 3; no se detalla la calidad por idioma |
| Licencia | No disponible |
| Formato de pesos | GGUF |
| Modelo base | google/gemma-3-1b-it, según el nombre del archivo; no confirmado en una model card |
| Tamaño del repositorio | 0,8 GB |
| Descargas / likes | 18 / 0 |
| Fecha de creación / actualización | 2026-10-15 / 2026-10-17 |

## Arquitectura y entrenamiento

El archivo es una conversión GGUF del modelo Gemma 3 1B IT, un transformer decoder-only de aproximadamente 1B parámetros. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, las etapas de RLHF/DPO ni posibles innovaciones de atención. La model card del repositorio no documenta el proceso de cuantización; el nombre indica Q4_K_M y la etiqueta imatrix sugiere el uso de una matriz de importancia para calibrar la cuantización, pero no se aportan detalles técnicos.

La innovación práctica de esta publicación es la propia cuantización: Q4_K_M empaqueta los pesos en 4 bits con una mezcla de tipos K, reduciendo el tamaño del repositorio a 0,8 GB. No se han publicado métricas de perplejidad ni comparaciones de calidad frente al modelo en BF16, por lo que la degradación real introducida por la cuantización no está cuantificada.

## Capacidades

- Generación de texto y respuesta a instrucciones en formato conversacional, propia de la variante IT del modelo base.
- Preguntas y respuestas, resumen y razonamiento básico; la ficha de Ollama cita estas tareas para la familia Gemma 3.
- Soporte multilingüe declarado de más de 140 idiomas; no hay evaluación pública de calidad para español en este GGUF.
- Ventana de 128K tokens declarada para la familia; en un modelo de 1B la calidad efectiva en contextos muy largos no está validada.
- Capacidades de código y matemáticas no documentadas específicamente para este archivo; el tamaño de 1B limita su fiabilidad en tareas complejas.
- Tool calling / function calling: no confirmado en la información disponible.
- Agentes y razonamiento multi-paso: no confirmado; no se recomienda como planificador autónomo sin pruebas.
- Visión: la familia Gemma 3 se anuncia como multimodal en la ficha de Ollama, pero no se confirma que la variante 1B ni este GGUF conserven entrada de imágenes.
- Modo thinking explícito: no disponible.

## Casos de uso

- Asistente local de bajo consumo: con 0,8 GB de pesos, puede ejecutarse en un portátil o mini-PC para responder preguntas frecuentes y mantener conversaciones breves sin conexión.
- Clasificación y enrutamiento de intenciones: útil para etiquetar consultas de soporte, correos o formularios y derivar cada caso al departamento adecuado; el coste computacional es bajo y la latencia puede ser aceptable en CPU.
- Resumen de documentos cortos y correos: puede condensar textos de una o varias páginas y generar borradores de respuesta; conviene limitar la longitud de entrada y revisar la salida.
- Generación de borradores y plantillas: adecuado para producir textos repetitivos como descripciones de producto, respuestas tipo o comunicaciones internas, con revisión humana posterior.
- Extracción de entidades simple: puede identificar nombres, fechas, importes o categorías en textos estructurados y semiestructurados; para producción conviene validar con reglas o un modelo mayor.
- Prototipado de chatbots multi-turno: sirve para validar flujos conversacionales y prompts antes de migrar a un modelo mayor; la ventana de 128K permite probar conversaciones largas, aunque la calidad efectiva no está garantizada.
- Pruebas de pipelines de inferencia GGUF: útil para comprobar el funcionamiento de llama.cpp, Ollama o llama-cpp-python en un entorno con recursos limitados antes de desplegar modelos más grandes.
- Asistencia educativa o de práctica de idiomas: puede generar explicaciones sencillas y ejercicios, siempre que un docente revise las respuestas y se controle el riesgo de errores factuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se aportan datos de MMLU, HumanEval, GSM8K ni comparaciones de rendimiento con otros modelos.

## Requisitos de hardware

- VRAM estimada: los pesos Q4_K_M ocupan alrededor de 0,6-0,8 GB; con el overhead del runtime, se pueden estimar 1-2 GB para contexto corto. Para contextos de 8K-32K, la estimación orientativa sube a 2-4 GB; para 128K se requiere memoria adicional para la caché KV y no es recomendable en GPUs de gama baja.
- GPU recomendadas: cualquier GPU con 4 GB o más para contexto corto; RTX 3050, RTX 4060, GTX 1660 de 6 GB o Apple Silicon con 8 GB son suficientes. Una A100 o H100 no son necesarias para un modelo de 1B, aunque pueden usarse para lotes grandes.
- Cabe en GPU consumer: sí, especialmente en modelos con 4-8 GB de VRAM. Para contexto largo conviene disponer de 8 GB o más.
- CPU: la inferencia es viable con llama.cpp y Q4_K_M; la latencia será mayor que en GPU, pero el modelo puede funcionar en portátiles sin GPU dedicada.
- Opciones de despliegue: llama.cpp, Ollama con la etiqueta `gemma3:1b-it-q4_K_M`, LM Studio y llama-cpp-python. vLLM y TGI no son la vía principal para GGUF y su soporte no está confirmado en la información disponible.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este archivo.

## Comparativa con modelos similares

No se proporcionaron alternativas de otros fabricantes con datos verificables. Se comparan variantes de distribución de Gemma 3 1B, no modelos de rendimiento equivalente.

| Modelo | Parámetros | Contexto | Formato / cuantización | Rendimiento | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|---|
| Este GGUF (Haijun-AI) | 999.885.952 | 128K declarado | GGUF Q4_K_M | No disponible | No disponible | Hugging Face, 18 descargas |
| google/gemma-3-1b-it-qat-q4_0-gguf | ~1B | 128K declarado | GGUF Q4_0 QAT | No disponible | No disponible | Hugging Face, cuenta oficial de Google |
| ggml-org/gemma-3-1b-it-GGUF | ~1B | 128K declarado | GGUF Q4_K_M | No disponible | No disponible | Hugging Face, organización ggml-org |
| Ollama `gemma3:1b-it-q4_K_M` | ~1B | 128K declarado | GGUF Q4_K_M | No disponible | No disponible | Ollama |

La comparativa es de formato y distribución, no de calidad. No hay benchmarks publicados que permitan afirmar que esta cuantización sea mejor o peor que las alternativas.

## Limitaciones y advertencias

- Modelo de 1B: capacidad limitada para razonamiento matemático, código complejo y tareas multi-paso; puede fallar en problemas que requieren varios pasos de deducción.
- Riesgo de alucinación: alto en preguntas factuales, especialmente con contextos largos o instrucciones ambiguas; no debe usarse sin verificación en ámbitos médico, legal o financiero.
- Cuantización Q4_K_M: la pérdida de calidad frente a BF16 no está medida; puede degradar el seguimiento de instrucciones complejas y la coherencia en contextos largos.
- Contexto de 128K: el dato procede de la documentación de la familia Gemma 3 y no está verificado para este archivo; la calidad efectiva en ventanas muy largas no está validada.
- Idiomas: se declaran más de 140 idiomas, pero no hay evaluación específica de español ni de sesgos culturales o lingüísticos.
- Licencia: no disponible; no se confirma permiso para uso comercial. Es necesario verificar los términos aplicables al modelo base Gemma 3 antes de desplegarlo.
- Publicación no oficial: el autor es Haijun-AI, no Google; el repositorio tiene 18 descargas y 0 likes, lo que indica una validación comunitaria muy limitada.
- Falta de documentación: no hay model card detallada, datos de entrenamiento, benchmarks ni información sobre el proceso de cuantización.
- Multimodalidad no confirmada: no se debe asumir que este GGUF procesa imágenes, aunque la familia Gemma 3 se anuncie como multimodal.
- Tool calling y agentes no confirmados: no es recomendable usar el modelo como planificador autónomo o en automatizaciones críticas sin pruebas específicas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Haijun-AI/gemma-3-1b-it-Q4_K_M.gguf
- GGUF de referencia en ggml-org: https://huggingface.co/ggml-org/gemma-3-1b-it-GGUF/blob/main/gemma-3-1b-it-Q4_K_M.gguf
- GGUF QAT de Google: https://huggingface.co/google/gemma-3-1b-it-qat-q4_0-gguf
- Ficha de Ollama: https://ollama.com/library/gemma3:1b-it-q4_K_M
- Imagen Docker de Gemma 3: https://hub.docker.com/r/ai/gemma3
- Repositorio GitHub de referencia: https://github.com/hackur/gemma3
