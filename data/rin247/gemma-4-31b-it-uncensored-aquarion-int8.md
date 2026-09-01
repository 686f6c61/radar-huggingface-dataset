# Rin247/gemma-4-31B-it-Uncensored-Aquarion-INT8

## Resumen

Este modelo es una cuantización INT8 weight-only del modelo `gemma-4-31B-it-Uncensored`, que a su vez es una versión "abliterada" (desensibilizada) del modelo Gemma 4 31B de Google DeepMind. El autor, Rin247, ha aplicado una proyección ortogonal para eliminar la dirección de rechazo (refusal direction) antes de cuantizar, con el objetivo de ofrecer un modelo sin restricciones de contenido. La cuantización se realizó con PyTorch RTN en CPU, almacenando escalas y formas junto a los pesos.

El modelo base Gemma 4 31B es un transformer denso de 31.273 millones de parámetros, con soporte multimodal (imagen y texto), contexto de 256K tokens y licencia Apache 2.0. Esta versión cuantizada reduce el tamaño del repositorio a 32,7 GB, lo que permite su ejecución en GPUs con menos VRAM que la versión completa en FP16. Sin embargo, la model card no especifica la licencia de esta cuantización concreta, ni los idiomas soportados, ni resultados de benchmarks.

La relevancia de este modelo radica en su doble propósito: ofrecer una versión sin censura de un modelo de frontera open-weight, y hacerlo más accesible en términos de hardware mediante cuantización INT8. No obstante, el formato de pesos es personalizado (con buffers de escala y forma), lo que requiere un proceso de de-cuantización manual antes de usar con motores de inferencia estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Gemma 4 31B) |
| Parametros totales | 31.273.089.680 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 256K tokens (según especificaciones de Gemma 4) |
| Tipos de cuantizacion | INT8 weight-only (RTN) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el modelo base Gemma 4 usa Apache 2.0, pero esta cuantización no lo especifica) |
| Formato de pesos | safetensors con buffers adicionales (`*.weight_scale`, `*.weight_shape`) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 31B parámetros, desarrollado por Google DeepMind como parte de la familia Gemma 4. Según la información pública de Gemma 4, el modelo soporta entrada multimodal (imagen y texto), tiene una ventana de contexto de 256K tokens y fue entrenado con un enfoque de alineación que incluye RLHF y técnicas de seguridad. La versión "Uncensored" se obtuvo mediante abliteración, un proceso que identifica y elimina la dirección de activación asociada al rechazo de contenido, mediante proyección ortogonal. Esta técnica no modifica los pesos de forma destructiva, sino que reorienta las representaciones internas para evitar respuestas de negación.

La cuantización INT8 se realizó con PyTorch RTN (Round-to-Nearest) en CPU, un método simple que redondea los pesos a 8 bits y almacena escalas por tensor o por canal. El resultado es un conjunto de pesos en formato safetensors con buffers adicionales de escala y forma, que deben aplicarse manualmente para reconstruir los pesos originales antes de la inferencia. No se dispone de información sobre el dataset de entrenamiento específico de esta versión cuantizada, ni sobre el proceso de abliteración aplicado (si se usó un conjunto de datos de rechazo concreto).

## Capacidades

- Generación de texto y razonamiento: al ser una versión de Gemma 4 31B, conserva las capacidades de razonamiento, matemáticas y comprensión del modelo base.
- Soporte multimodal: el pipeline es `image-text-to-text`, por lo que puede procesar imágenes junto con texto.
- Tool calling y function calling: Gemma 4 incluye soporte nativo para llamadas a herramientas, lo que permite integrarlo en agentes y flujos de automatización.
- Capacidades multilingües: no se especifican idiomas concretos, pero Gemma 4 soporta múltiples idiomas; esta versión no documenta restricciones.
- Modo "uncensored": la abliteración elimina la dirección de rechazo, por lo que el modelo no debería negarse a responder a peticiones que el modelo base rechazaría (con los riesgos asociados).
- Contexto largo: 256K tokens de ventana, útil para documentos extensos o conversaciones multi-turno.

## Casos de uso

- Generación de contenido creativo sin restricciones: el modelo puede producir narrativa, guiones o diálogos con temáticas que el modelo base censuraría, útil para escritores que exploran géneros oscuros o controvertidos.
- Asistente de investigación en dominios sensibles: investigadores que trabajan con temas como salud mental, violencia o sexualidad pueden obtener respuestas sin filtros automáticos, siempre que se apliquen controles humanos posteriores.
- Desarrollo de agentes conversacionales personalizados: gracias al tool calling y al contexto largo, se puede construir un chatbot con memoria extendida y capacidad de ejecutar acciones externas (consultas a APIs, bases de datos).
- Análisis de documentos extensos con imágenes: el modelo puede procesar informes largos con figuras, tablas y gráficos, extrayendo información relevante en un solo paso.
- Prototipado rápido de aplicaciones de IA generativa: al ser una cuantización INT8, cabe en GPUs de gama media (por ejemplo, RTX 3090 o 4090 con 24 GB), lo que permite experimentar sin infraestructura de alto coste.
- Evaluación de técnicas de abliteración y cuantización: este modelo sirve como caso de estudio para comparar el efecto de la proyección ortogonal y la cuantización RTN en el rendimiento y la seguridad de un modelo de 31B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otros estándares. Tampoco se comparan resultados con el modelo base sin cuantizar. Se recomienda evaluar el modelo en las tareas específicas de uso antes de desplegarlo en producción.

## Requisitos de hardware

- VRAM estimada: los pesos INT8 ocupan aproximadamente 31,3 GB (31.273.089.680 parámetros × 1 byte). Con overhead de activaciones y buffers, se recomienda al menos 40 GB de VRAM para inferencia cómoda.
- GPUs compatibles: una NVIDIA A100 40GB o 80GB, o una RTX 6000 Ada (48 GB) son adecuadas. En consumer, una RTX 4090 (24 GB) no es suficiente para el modelo completo en INT8; se necesitaría cuantización de 4 bits o usar CPU con mucha RAM.
- Opciones de despliegue: al ser un formato personalizado, no es compatible directamente con vLLM, llama.cpp u Ollama. Requiere un script de de-cuantización manual (aplicar escalas y formas) y luego cargar los pesos en un framework como Transformers o vLLM.
- Latencia y throughput: no se dispone de datos medidos. En una A100 80GB, se espera una generación de 20-40 tokens/s para un modelo de 31B en INT8, pero esto es una estimación no verificada.
- Alternativa: usar la versión GGUF del mismo modelo (disponible en local-ai-zone.github.io) que ocupa 18,3 GB y es compatible con llama.cpp y Ollama, aunque no es la misma cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma-4-31B-it-Uncensored-Aquarion-INT8 (este) | 31,3B | 256K | no disponible | safetensors INT8 personalizado | Abliterado, requiere de-cuantización manual |
| Justbackup/gemma-4-31B-it-uncensored | 31,3B | 256K | Apache 2.0 (según TrevorJS) | safetensors FP16 | Versión sin cuantizar, abliterada |
| TrevorJS/gemma-4-31B-it-uncensored | 31,3B | 256K | Apache 2.0 | safetensors | Misma base, sin cuantizar |
| Gemma 4 31B original (Google) | 31,3B | 256K | Apache 2.0 | safetensors | Modelo oficial con alineación de seguridad |

La comparativa se basa en la información pública de los repositorios. No se dispone de datos de rendimiento comparativo entre estas versiones.

## Limitaciones y advertencias

- Licencia incierta: la model card no especifica la licencia de esta cuantización. Aunque el modelo base Gemma 4 es Apache 2.0, la ausencia de licencia explícita puede generar problemas legales en uso comercial. Se recomienda contactar al autor o usar la versión de TrevorJS que sí declara Apache 2.0.
- Formato de pesos no estándar: los buffers `*.weight_scale` y `*.weight_shape` requieren un proceso de de-cuantización manual. No es compatible con motores de inferencia comunes sin adaptación, lo que aumenta la complejidad de despliegue.
- Riesgo de alucinación: al ser una versión sin censura, el modelo puede generar contenido falso o dañino con mayor facilidad, ya que no tiene el filtro de seguridad del modelo original. Esto es especialmente peligroso en dominios como salud, legal o finanzas.
- Sesgos no mitigados: la abliteración no elimina sesgos de género, raza o ideología presentes en el entrenamiento original; de hecho, puede amplificarlos al eliminar la capa de rechazo.
- Sin benchmarks publicados: no hay evidencia de que la cuantización INT8 mantenga la calidad del modelo base. La pérdida de precisión puede ser significativa en tareas de razonamiento complejo.
- Contexto largo con limitaciones prácticas: aunque la ventana es de 256K, el uso real con contexto largo requiere mucha memoria de activaciones y puede degradar el rendimiento en GPUs de gama media.
- Fecha de creación futura: el modelo fue creado en agosto de 2026, lo que sugiere que es muy reciente y puede tener problemas no documentados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Rin247/gemma-4-31B-it-Uncensored-Aquarion-INT8
- Modelo base sin cuantizar (Justbackup): https://huggingface.co/Justbackup/gemma-4-31B-it-uncensored
- Modelo base sin cuantizar (TrevorJS): https://huggingface.co/TrevorJS/gemma-4-31B-it-uncensored
- Guía de Gemma 4 local (incluye contexto y especificaciones): https://locallyuncensored.com/blog/gemma-4-local-guide.html
- Página oficial de Gemma 4 en DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Versión GGUF del modelo uncensored: https://local-ai-zone.github.io/models/gemma-4-31b-it-uncensored.html
