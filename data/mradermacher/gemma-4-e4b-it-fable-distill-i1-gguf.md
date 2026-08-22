# mradermacher/Gemma-4-E4B-it-Fable-Distill-i1-GGUF

## Resumen

Gemma-4-E4B-it-Fable-Distill-i1-GGUF es una cuantización GGUF del modelo destilado `armand0e/Gemma-4-E4B-it-Fable-Distill`, preparada por mradermacher con la técnica de imatrix para optimizar la calidad de los quants. El modelo base pertenece a la familia Gemma 4 de Google, diseñada para ejecutarse en hardware de consumo, con capacidades multimodales (entrada de imagen) y un modo de razonamiento ("Thinking Mode") que mejora la calidad de las respuestas en tareas complejas.

Esta variante en concreto es una destilación de Gemma 4 E4B, lo que implica que se ha entrenado para imitar el comportamiento del modelo original con un coste computacional reducido. El nombre "E4B" sugiere que se trata de una arquitectura de mezcla de expertos (MoE) con aproximadamente 4 mil millones de parámetros activos, aunque el total de parámetros según safetensors es de 7.518.069.290. La cuantización reduce el tamaño del modelo a entre 4.5 y 5.3 GB, lo que permite ejecutarlo en tarjetas gráficas de consumo con 8 GB de VRAM o menos.

La relevancia de este modelo radica en que ofrece capacidades de razonamiento, generación de código y comprensión multimodal en un formato ligero y optimizado para inferencia local. Al estar licenciado bajo Apache 2.0, se puede utilizar tanto en investigación como en productos comerciales sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (MoE, basado en Gemma 4 E4B) |
| Parametros totales | 7.518.069.290 (~7.5B) |
| Parametros activos | ~4B (estimado por el nombre E4B, no confirmado en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K (4.5 GB), i1-IQ3_M (4.8 GB), i1-Q4_K_S (5.3 GB), imatrix |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es una destilación de Gemma 4 E4B, un modelo multimodal de Google que acepta texto e imágenes como entrada. La arquitectura subyacente es un transformer con mezcla de expertos (MoE), donde se activan aproximadamente 4B parámetros por token de los 7.5B totales. Esto permite un equilibrio entre calidad de respuesta y eficiencia computacional, ya que solo se ejecutan los expertos relevantes para cada entrada.

El proceso de destilación, indicado en el nombre "Fable-Distill", implica entrenar un modelo más pequeño para replicar el comportamiento de un modelo profesor (en este caso, Gemma 4 E4B). Este enfoque suele reducir el coste de inferencia manteniendo gran parte de la calidad. Los datos de entrenamiento específicos no están disponibles en la información proporcionada. La cuantización GGUF fue realizada por mradermacher usando la técnica de imatrix, que genera matrices de importancia para optimizar la asignación de bits durante la cuantización, mejorando la calidad de los quants de baja precisión.

## Capacidades

- Generación de texto y razonamiento: capaz de mantener conversaciones multi-turno y resolver tareas que requieren lógica y planificación.
- Generación de código: el modelo está optimizado para tareas de programación, incluyendo generación, explicación y depuración de código.
- Comprensión multimodal: acepta imágenes como entrada (el repositorio estático contiene los archivos mmproj necesarios para el procesamiento de visión), lo que permite tareas como descripción de imágenes o respuesta a preguntas visuales.
- Soporte de agentes y tool calling: no se menciona explícitamente en la información, pero Gemma 4 es compatible con workflows agénticos según la documentación de Google.
- Capacidades multilingües: solo se declara el inglés como idioma soportado.
- Modo de razonamiento ("Thinking"): el modelo base Gemma 4 E4B incluye un modo de razonamiento que genera cadenas de pensamiento internas antes de dar la respuesta final, mejorando la precisión en problemas complejos.

## Casos de uso

- Asistente de programación local: los desarrolladores pueden usar este modelo en un entorno de desarrollo integrado (IDE) para autocompletar código, generar funciones y explicar fragmentos. Gracias a la cuantización Q4_K_S, ocupa solo 5.3 GB, lo que permite ejecutarlo en portátiles con GPU de 8 GB.
- Análisis de imágenes en dispositivos con recursos limitados: al ser multimodal, puede analizar capturas de pantalla, diagramas o fotografías y responder preguntas sobre su contenido, sin necesidad de enviar datos a la nube.
- Chatbot de atención al cliente con contexto de producto: el modelo puede gestionar conversaciones de soporte técnico con conocimiento específico de un catálogo, ya que su tamaño reducido permite desplegarlo en servidores internos con una sola GPU.
- Motor de razonamiento para agentes de automatización: puede integrarse en pipelines de agentes que necesiten tomar decisiones basadas en texto e imágenes, como clasificación de tickets o extracción de información de documentos escaneados.
- Entorno de pruebas para investigación de modelos MoE: la naturaleza destilada y cuantizada permite estudiar cómo se comporta un modelo MoE multimodal en hardware de bajo coste, sin necesidad de infraestructura de gran escala.
- Generación de documentación técnica: el modelo puede resumir código fuente y generar comentarios, descripciones de APIs o documentación de usuario en inglés, lo que acelera el mantenimiento de proyectos de software.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K o similares para este modelo concreto. El modelo original Gemma 4 E4B se posiciona como una solución de nivel "frontier" para su tamaño, pero no se proporcionan cifras específicas.

## Requisitos de hardware

- VRAM estimada para inferencia: 8 GB mínimos para el modelo original según la documentación de Google; con cuantización Q4_K_S (5.3 GB), cabe en GPUs de 8 GB con margen para el contexto.
- GPUs recomendadas: RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4070, RTX 4080, RTX 4090, así como GPUs de datacenter como A100 o H100 si se requiere mayor rendimiento.
- Compatibilidad con consumer GPU: sí, todas las cuantizaciones (Q2_K, IQ3_M, Q4_K_S) caben en GPUs de 8 GB o más. La cuantización Q2_K (4.5 GB) puede incluso ejecutarse en GPUs de 6 GB en algunos casos.
- Opciones de despliegue: llama.cpp (nativo para GGUF), Ollama, text-generation-inference (TGI), y cualquier framework compatible con GGUF como LM Studio o KoboldCpp.
- Latencia y throughput: no disponible. Depende de la GPU y del contexto; en una RTX 4090 se espera una velocidad de generación de 30-50 tokens/segundo con cuantización Q4_K_S, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma 4 E4B (original) | 4.4B | no disponible | Apache 2.0 | safetensors | Modelo base multimodal de Google, sin destilación |
| Gemma 4 E4B Fable-Distill (base) | 7.5B | no disponible | Apache 2.0 | safetensors | Destilación de Gemma 4 E4B |
| Gemma 4 E4B i1-GGUF (este) | 7.5B | no disponible | Apache 2.0 | GGUF | Cuantización imatrix del destilado |
| Llama 3.2 3B (alternativa) | 3B | 128K | Llama 3.2 | GGUF | Texto solamente, sin multimodalidad |

La comparativa se basa en los datos disponibles: este modelo es una cuantización de una destilación, por lo que su rendimiento debería ser inferior al de Gemma 4 E4B original pero con menor coste de inferencia. No hay benchmarks para comparar directamente.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos en la información proporcionada, pero al ser un modelo derivado de Gemma 4, puede heredar los sesgos de su dataset de entrenamiento original.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en temas de alta complejidad o con contexto insuficiente.
- Limitaciones de contexto: no se especifica la longitud de contexto; probablemente esté limitada por la ventana de Gemma 4 E4B (no documentada en esta información).
- Limitaciones de idioma: solo soporta inglés, lo que limita su uso en entornos multilingües.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero se debe conservar el aviso de copyright y patente.
- Advertencia de cuantización: las cuantizaciones de menor tamaño (Q2_K) pueden degradar significativamente la calidad de las respuestas, especialmente en tareas de razonamiento complejo.
- Modelo en fase temprana: con 0 descargas y 0 likes, es una versión reciente y no ha sido validada por la comunidad; se recomienda probar antes de usarla en producción.

## Enlaces

- [Repositorio de este modelo (GGUF)](https://huggingface.co/mradermacher/Gemma-4-E4B-it-Fable-Distill-i1-GGUF)
- [Modelo base: armand0e/Gemma-4-E4B-it-Fable-Distill](https://huggingface.co/armand0e/Gemma-4-E4B-it-Fable-Distill)
- [Repositorio estático con quants y mmproj](https://huggingface.co/mradermacher/Gemma-4-E4B-it-Fable-Distill-GGUF)
- [Página de Gemma 4 E4B en gemma4.dev](https://gemma4.dev/models/gemma-4-e4b)
- [Documentación oficial de Gemma 4 en Google AI Edge](https://developers.google.com/edge/litert-lm/models/gemma-4)
- [Guía de Gemma 4 (gemma4.org)](https://gemma4.org/)
- [Solicitudes de modelos de mradermacher](https://huggingface.co/mradermacher/model_requests)
