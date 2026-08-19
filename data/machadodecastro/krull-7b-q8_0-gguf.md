# MachadoDeCastro/krull-7b.Q8_0.gguf

## Resumen

KRULL 7B es un modelo de lenguaje de 7.600 millones de parámetros desarrollado por MachadoDeCastro, especializado en tareas de RAG (Retrieval-Augmented Generation) y lectura de documentos. Se basa en DeepSeek-R1-Distill-Qwen-7B, un modelo destilado de DeepSeek-R1, y ha sido ajustado mediante QLoRA con un enfoque exclusivo en el análisis de documentos PDF, manuales de recursos humanos y normativas para funcionarios públicos.

El modelo se distribuye en formato GGUF con cuantización Q8_0, lo que lo hace apto para inferencia en dispositivos de borde como CPUs estándar, portátiles y servidores locales con poca memoria. Su idioma principal es el portugués (pt-BR) y está diseñado para responder de forma estricta basándose únicamente en el contexto proporcionado, minimizando la alucinación.

La relevancia de este modelo radica en su especialización en RAG para entornos corporativos y administrativos, ofreciendo una alternativa ligera y de código abierto (licencia Apache 2.0) para despliegues locales sin necesidad de GPUs de alta gama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en DeepSeek-R1-Distill-Qwen-7B) |
| Parametros totales | 7.615.616.512 (7,6B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada en la model card; el modelo base DeepSeek-R1-Distill-Qwen-7B soporta 128K tokens |
| Tipos de cuantizacion | Q8_0 (8 bits) |
| Idiomas soportados | Portugues (pt-BR) como idioma principal |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

KRULL 7B se basa en DeepSeek-R1-Distill-Qwen-7B, un modelo destilado de DeepSeek-R1 que hereda la arquitectura transformer de Qwen2.5-7B. El ajuste fino se realizó mediante QLoRA (Quantized Low-Rank Adaptation), una técnica de adaptación de bajo rango que permite fine-tuning con un consumo de memoria reducido. El entrenamiento se centró exclusivamente en tareas de RAG: lectura de documentos PDF, manuales de RRHH y normativas de funcionarios públicos, con el objetivo de que el modelo responda de forma estricta y fiel al contexto proporcionado, sin inventar información externa.

No se han proporcionado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni la aplicación de técnicas adicionales como RLHF o DPO. El modelo se distribuye únicamente en formato GGUF cuantizado a Q8_0, lo que indica un enfoque orientado a la inferencia en CPU y entornos con recursos limitados. La cuantización Q8_0 se eligió específicamente para preservar la calidad del vocabulario en portugués.

## Capacidades

- RAG especializado: entrenado para responder preguntas basándose exclusivamente en el contexto proporcionado, lo que lo hace adecuado para sistemas de recuperación aumentada.
- Lectura de documentos PDF: puede procesar y responder sobre el contenido de documentos PDF, manuales y normativas.
- Razonamiento lógico (Chain of Thought): hereda las capacidades de razonamiento del modelo base DeepSeek-R1-Distill-Qwen-7B.
- Generación de texto en portugués: optimizado para el idioma portugués (pt-BR).
- Inferencia en CPU: al estar cuantizado en GGUF Q8_0, puede ejecutarse en hardware sin GPU dedicada.
- Integración con Ollama y Open WebUI: compatible con el ecosistema Ollama mediante integración nativa con Hugging Face.
- Conversacional: diseñado para interacciones de tipo chatbot, con soporte para diálogos multi-turno.

## Casos de uso

- Consulta de manuales de recursos humanos: el modelo puede responder preguntas sobre políticas internas, procedimientos de contratación o beneficios laborales a partir de manuales corporativos, reduciendo la carga del departamento de RRHH.
- Asistente para funcionarios públicos: permite consultar normativas y reglamentos administrativos de forma rápida, sin necesidad de buscar manualmente en documentos extensos.
- Sistema RAG corporativo en local: puede integrarse en pipelines de RAG para empresas que necesitan mantener la confidencialidad de sus documentos, ejecutándose en servidores locales con CPU.
- Chatbot de soporte interno: desplegado vía Ollama y Open WebUI, puede gestionar consultas de empleados sobre procedimientos internos con respuestas basadas en documentación oficial.
- Análisis de documentos PDF: útil para extraer información específica de contratos, informes o normativas en formato PDF, respondiendo preguntas concretas sobre su contenido.
- Prototipado de aplicaciones RAG en portugués: desarrolladores pueden utilizarlo como base para construir prototipos de asistentes virtuales en portugués brasileño sin depender de APIs externas.
- Formación y onboarding: el modelo puede responder dudas de nuevos empleados sobre políticas de la empresa, basándose en los manuales de bienvenida y procedimientos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no requiere VRAM dedicada; el formato GGUF Q8_0 está optimizado para CPU y RAM.
- Almacenamiento: el repositorio ocupa 8,1 GB; el archivo GGUF Q8_0 requiere aproximadamente 8 GB de espacio en disco.
- RAM recomendada: entre 8 y 16 GB de RAM para cargar el modelo en memoria (estimación basada en el tamaño del archivo cuantizado).
- GPU: no necesaria; puede ejecutarse en CPUs estándar, portátiles y servidores locales con poca memoria.
- Opciones de despliegue: Ollama (comando `ollama run hf.co/MachadoDeCastro/krull-7b.Q8_0.gguf`), Open WebUI, llama.cpp y otras herramientas compatibles con formato GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| KRULL 7B | 7,6B | No especificado | RAG en portugues | Apache 2.0 | GGUF Q8_0 |
| DeepSeek-R1-Distill-Qwen-7B (base) | 7,6B | 128K | Razonamiento general | MIT | Safetensors, GGUF |
| Llama 3.1 8B | 8B | 128K | Uso general | Llama 3.1 | Safetensors, GGUF |
| Mistral 7B | 7,3B | 32K | Uso general | Apache 2.0 | Safetensors, GGUF |

Nota: la comparativa se basa en datos publicos de los modelos base. No se dispone de benchmarks de KRULL 7B para comparar rendimiento real.

## Limitaciones y advertencias

- Idioma limitado: el modelo está optimizado para portugués (pt-BR); su rendimiento en otros idiomas no está garantizado y puede ser deficiente.
- Especialización estrecha: al estar entrenado exclusivamente para RAG y lectura de documentos, puede tener un rendimiento inferior en tareas generales de generación de texto o razonamiento fuera de su dominio.
- Riesgo de alucinación residual: aunque el entrenamiento busca minimizar la invención de información, ningún modelo es inmune a la alucinación, especialmente si el contexto proporcionado es ambiguo o incompleto.
- Longitud de contexto no verificada: no se ha especificado la ventana de contexto real del modelo ajustado; los usuarios deben validar el comportamiento con documentos largos.
- Cuantización Q8_0: aunque preserva buena calidad, la cuantización puede introducir ligeras pérdidas de precisión en comparación con el modelo en punto flotante.
- Sin benchmarks publicados: no hay datos objetivos de rendimiento que permitan comparar el modelo con alternativas de forma rigurosa.
- Adopcion limitada: el modelo tiene pocas descargas (101) y ningun "like", lo que sugiere una adopcion limitada y posible falta de soporte continuo.

## Enlaces

- HuggingFace: https://huggingface.co/MachadoDeCastro/krull-7b.Q8_0.gguf
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
