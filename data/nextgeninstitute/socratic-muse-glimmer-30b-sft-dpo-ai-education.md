# NextGenInstitute/socratic-muse-glimmer-30b-sft-dpo-ai-education

## Resumen

Socratic Muse Glimmer 30B SFT DPO AI Education es un modelo de lenguaje multimodal de 30 000 millones de parámetros, desarrollado por NextGenInstitute como un fine-tuning del modelo base Muse-Glimmer-30B de Meta. Este fine-tuning se ha entrenado específicamente para aplicaciones educativas, combinando aprendizaje supervisado (SFT) y optimización por preferencias (DPO), con el objetivo de mejorar la capacidad del modelo para responder preguntas, explicar conceptos y guiar a estudiantes en entornos de aprendizaje asistido por IA.

El modelo base, Muse-Glimmer-30B, es un transformer denso decoder-only con un codificador de visión integrado, entrenado por destilación a partir de las salidas de Muse Spark. Admite entrada de texto e imagen, produce texto y tiene una ventana de contexto por defecto de 128 000 tokens, con soporte para contextos más largos. El fine-tuning de NextGenInstitute mantiene estas capacidades multimodales y de contexto largo, aunque la model card no detalla cambios específicos en la arquitectura.

La relevancia de este modelo radica en su enfoque en el sector educativo, donde se necesitan asistentes capaces de procesar tanto texto como imágenes (por ejemplo, diagramas o fórmulas) y mantener conversaciones extensas. La licencia Apache 2.0 permite uso comercial y modificación, lo que lo hace atractivo para desarrolladores que quieran integrarlo en plataformas de aprendizaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only con codificador de visión ViT-G/14 |
| Parametros totales | 30 000 millones (29,6 B según documentación de Meta) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 000 tokens (con soporte para contextos más largos) |
| Tipos de cuantizacion | 4-bit (BNB) según el modelo base unsloth/Muse-Glimmer-30B-unsloth-bnb-4bit; no se especifican otras |
| Idiomas soportados | Inglés (según la etiqueta `language: en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (indicado en las etiquetas y el tamaño del repo de 0,4 GB) |

## Arquitectura y entrenamiento

Muse-Glimmer-30B, el modelo base, es un transformer denso con un codificador de visión ViT-G/14 que procesa imágenes y las combina con el texto de entrada. Fue entrenado por destilación a partir de las salidas de Muse Spark, un modelo más grande, en lugar de desde cero. El modelo acepta texto e imagen, produce texto y tiene una ventana de contexto de 128 000 tokens. Emite llamadas a herramientas en formato XML estilo ATEM, en lugar de JSON, lo que requiere parsers específicos para tool calling y razonamiento.

El fine-tuning de NextGenInstitute se realizó sobre la versión cuantizada a 4-bit del modelo base (unsloth/Muse-Glimmer-30B-unsloth-bnb-4bit) utilizando la librería Unsloth, que acelera el entrenamiento. El proceso combinó SFT (fine-tuning supervisado) y DPO (Direct Preference Optimization), una técnica que alinea el modelo con preferencias humanas sin necesidad de un modelo de recompensa separado. No se han publicado detalles sobre el dataset de entrenamiento ni el número de tokens utilizados.

## Capacidades

- Generación de texto y razonamiento: puede responder preguntas, explicar conceptos y mantener conversaciones multi-turno gracias a su ventana de 128 000 tokens.
- Procesamiento multimodal: acepta imágenes como entrada, lo que permite analizar diagramas, gráficos, fórmulas escritas a mano u otros materiales visuales educativos.
- Tool calling: emite llamadas a herramientas en formato XML ATEM, lo que facilita la integración en agentes que necesitan consultar APIs o bases de datos.
- Soporte para agentes y razonamiento multi-paso: el modelo base está optimizado para flujos de trabajo agénticos, y el fine-tuning educativo refuerza esta capacidad para tareas como resolver problemas paso a paso.
- Multilingüismo: aunque la etiqueta indica solo inglés, el modelo base puede tener cierta capacidad multilingüe, pero no está confirmada para este fine-tuning.
- Contexto largo: 128 000 tokens permiten procesar documentos extensos o historiales de conversación completos.

## Casos de uso

- Tutoría personalizada: el modelo puede actuar como tutor virtual, explicando conceptos de matemáticas, ciencias o idiomas, adaptándose al nivel del estudiante y manteniendo el contexto de la conversación a lo largo de sesiones largas.
- Análisis de material didáctico: gracias a su entrada de imágenes, puede interpretar diagramas, gráficos o problemas escritos a mano y proporcionar explicaciones o soluciones.
- Generación de ejercicios y exámenes: puede crear preguntas de práctica, problemas de razonamiento y evaluaciones personalizadas según el progreso del estudiante.
- Asistente en plataformas de e-learning: integración en sistemas de gestión de aprendizaje (LMS) para responder dudas de los estudiantes en tiempo real, con capacidad de consultar recursos externos mediante tool calling.
- Revisión de trabajos académicos: puede evaluar redacciones, proporcionar retroalimentación sobre estructura y contenido, y sugerir mejoras basadas en criterios pedagógicos.
- Agente de investigación educativa: puede ayudar a docentes e investigadores a resumir artículos, extraer información de figuras y tablas, y generar resúmenes de literatura académica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este fine-tuning en la información disponible. El modelo base Muse-Glimmer-30B tiene evaluaciones documentadas por Meta (disponibles en el informe metodológico), pero no se incluyen aquí porque no corresponden a este fine-tuning y no se dispone de los datos numéricos.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 30 000 millones de parámetros cuantizado a 4-bit, el peso ocupa aproximadamente 15-16 GB (0,4 GB en el repo sugiere que solo se subieron los adaptadores, pero el modelo completo cuantizado requeriría esa cantidad). Se recomienda al menos 24 GB de VRAM para inferencia con contexto largo.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB). En GPUs con menos VRAM, se puede reducir la longitud de contexto o usar cuantizaciones más agresivas.
- Compatibilidad con GPU consumer: sí, una RTX 3090 o 4090 puede ejecutarlo, aunque el contexto máximo de 128 000 tokens puede requerir más memoria. Con cuantización 8-bit o 4-bit y contextos reducidos, cabría en GPUs de 16 GB.
- Opciones de despliegue: compatible con vLLM, llama.cpp, Ollama y TGI (text-generation-inference), según las etiquetas. Para tool calling en formato ATEM se necesita un parser específico.
- Latencia y throughput: no se han publicado datos concretos. En una RTX 4090, un modelo de 30B en 4-bit suele generar entre 10 y 20 tokens por segundo, dependiendo del tamaño del contexto.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este fine-tuning con otros modelos de la misma categoría. El modelo base Muse-Glimmer-30B se puede comparar con otros modelos abiertos de ~30B como Llama-3-8B (menor tamaño) o Mixtral-8x7B (MoE), pero no hay datos de rendimiento específicos de este fine-tuning para establecer una comparación justa. Se recomienda consultar las evaluaciones oficiales de Muse Glimmer en el sitio de Meta.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo de lenguaje, puede generar información incorrecta o inventada, especialmente en dominios especializados. En un contexto educativo, esto requiere supervisión humana.
- Idioma: solo está confirmado para inglés. El uso en otros idiomas puede degradar la calidad de las respuestas.
- Dependencia del modelo base: el fine-tuning no modifica la arquitectura, por lo que las limitaciones del modelo base (por ejemplo, en razonamiento matemático complejo) se mantienen.
- Requisitos de parsing: las llamadas a herramientas en formato XML ATEM requieren parsers específicos; no funcionan con parsers JSON estándar.
- Licencia Apache 2.0: permite uso comercial, pero se debe verificar si el modelo base tiene restricciones adicionales. Según la información de Meta, Muse Glimmer está bajo licencia Apache 2.0, así que no se esperan restricciones.
- Tamaño del repo: el repositorio de HuggingFace tiene solo 0,4 GB, lo que sugiere que contiene adaptadores LoRA o pesos cuantizados, no el modelo completo. Los usuarios deben descargar el modelo base por separado si es necesario.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/NextGenInstitute/socratic-muse-glimmer-30b-sft-dpo-ai-education
- Modelo base de Meta: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Documentación de Muse Glimmer en Meta: https://developer.meta.com/ai/models/muse-glimmer/
- Blog de investigación de Meta sobre Muse Glimmer: https://research.meta.ai/blog/introducing-muse-glimmer-open-agentic-model
- Recetas vLLM para Muse-Glimmer-30B: https://recipes.vllm.ai/meta-models/Muse-Glimmer-30B
- Documentación de la API de Muse Glimmer: https://dev.meta.ai/docs/muse-glimmer
