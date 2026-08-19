# Gbone3176/DermL2V

## Resumen

DermL2V es un adaptador PEFT (LoRA) desarrollado por Gbone3176 que convierte el modelo Meta-Llama-3.1-8B-Instruct en un codificador semántico especializado en texto no estructurado de dermatología. El modelo mapea narrativas clínicas y preguntas dermatológicas en formato libre a embeddings densos para búsqueda semántica, recuperación de información y comparación por similitud. Este enfoque permite abordar un problema concreto: los modelos de lenguaje generalistas no producen representaciones vectoriales óptimas para dominios especializados como la dermatología, donde la terminología y las expresiones clínicas tienen particularidades que requieren adaptación.

El adaptador se publica junto con el módulo Attribute-Aware Relevance Aggregation, que actúa como mecanismo de pooling para construir los embeddings de texto. El modelo base Llama-3.1-8B-Instruct no se incluye en el repositorio y debe obtenerse por separado, siguiendo una cadena de modelos intermedios basada en LLM2Vec. Con un tamaño de repositorio de 0,4 GB, el adaptador es ligero y se integra mediante la librería PEFT. La licencia es llama3.1, lo que implica restricciones de uso comercial derivadas de la licencia comunitaria de Llama 3.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Meta-Llama-3.1-8B-Instruct) con adaptador LoRA |
| Parametros totales | no disponible (adaptador LoRA sobre base de 8B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base, 128K tokens en Llama 3.1) |
| Tipos de cuantizacion | no disponible (adaptador safetensors, cuantizacion del base no especificada) |
| Idiomas soportados | no disponibles |
| Licencia | llama3.1 |
| Formato de pesos | safetensors (adapter_model.safetensors) |

## Arquitectura y entrenamiento

DermL2V sigue la arquitectura de LLM2Vec, que transforma un modelo de lenguaje autorregresivo en un codificador de texto mediante tres pasos: adaptación con máscara de atención bidireccional, entrenamiento con next-token prediction en datos sin etiquetar (MNTP) y fine-tuning supervisado con contrastive learning. La cadena de modelos requerida es: meta-llama/Meta-Llama-3.1-8B-Instruct como base, seguido de McGill-NLP/LLM2Vec-Meta-Llama-31-8B-Instruct-mntp y su versión supervisada, y finalmente el adaptador DermL2V.

El adaptador LoRA se entrena sobre el modelo LLM2Vec supervisado para especializarlo en texto dermatológico. El mecanismo de pooling, denominado Attribute-Aware Relevance Aggregation, pondera las representaciones de los tokens según su relevancia para atributos dermatológicos específicos, lo que permite construir embeddings que capturan matices clínicos relevantes. Los detalles del dataset de entrenamiento, el número de tokens y el proceso de fine-tuning no se especifican en la información disponible.

## Capacidades

- Codificación semántica de texto dermatológico no estructurado, incluyendo narrativas clínicas y preguntas de pacientes.
- Búsqueda semántica y recuperación de información en corpus de dermatología.
- Comparación por similitud entre documentos o consultas dermatológicas.
- Generación de embeddings densos para integración en pipelines de retrieval-augmented generation (RAG).
- Adaptación del modelo base Llama-3.1-8B-Instruct mediante LoRA, preservando las capacidades lingüísticas generales del modelo original.
- Mecanismo de pooling especializado (Attribute-Aware Relevance Aggregation) para mejorar la representación de atributos clínicos.

## Casos de uso

- Búsqueda semántica en historiales clínicos: permite a dermatólogos encontrar casos similares describiendo síntomas en lenguaje natural, gracias a los embeddings especializados en terminología dermatológica.
- Sistema de soporte a la decisión clínica: integrado en un pipeline RAG, puede recuperar literatura relevante o casos previos a partir de la descripción de una lesión o condición cutánea.
- Atención al paciente automatizada: clasificación y enrutamiento de consultas dermatológicas de pacientes según su contenido semántico, identificando urgencias o temas recurrentes.
- Deduplicación de registros médicos: comparación por similitud de narrativas clínicas para detectar registros duplicados o relacionados en bases de datos hospitalarias.
- Análisis de investigación: agrupación y análisis de abstracts o artículos de dermatología para identificar tendencias, subtemas o relaciones entre condiciones.
- Construcción de knowledge graphs clínicos: generación de embeddings para nodos de un grafo de conocimiento dermatológico, facilitando la navegación y el descubrimiento de relaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador LoRA sobre Llama-3.1-8B-Instruct, la VRAM necesaria depende de la cuantización del modelo base. Con cuantización de 4 bits, se estiman 6-8 GB; con precisión completa (FP16), 16 GB.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para FP16, o GPUs con 8-12 GB para cuantización 4-bit. Para despliegue en producción, A100 o H100.
- Cabe en GPUs de consumo: sí, con cuantización 4-bit en GPUs de 8 GB o más.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, HuggingFace Transformers con PEFT, TGI.
- Latencia y throughput: no disponibles. Dependen del hardware, la cuantización y el tamaño del lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| DermL2V (adaptador) | 8B base + LoRA | 128K (base) | Embeddings dermatologicos | llama3.1 |
| BGE-M3 | 568M | 8K | Embeddings multilingues generales | MIT |
| E5-mistral-7b-instruct | 7B | 32K | Embeddings instructivos generales | MIT |
| gte-large-en-v1.5 | 434M | 8K | Embeddings ingles generales | MIT |

La comparativa es orientativa: DermL2V es un adaptador especializado en un dominio concreto, mientras que las alternativas son modelos de embeddings generalistas. No se dispone de benchmarks comparativos entre DermL2V y estos modelos en tareas dermatológicas.

## Limitaciones y advertencias

- El modelo base Llama-3.1-8B-Instruct es un modelo con acceso restringido (gated) en HuggingFace; los usuarios deben solicitar acceso y cumplir la licencia comunitaria de Llama 3.1.
- La licencia llama3.1 impone restricciones de uso comercial: no se permite utilizar el modelo para mejorar otros modelos de lenguaje grandes o para usos prohibidos por la política de uso aceptable de Meta.
- El adaptador está especializado en dermatología; su rendimiento fuera de este dominio no está garantizado y puede degradarse significativamente.
- No se dispone de información sobre sesgos del modelo, pero al derivar de Llama-3.1-8B-Instruct, puede heredar sesgos presentes en los datos de entrenamiento del modelo base.
- Riesgo de alucinación en tareas de generación: aunque el modelo está diseñado para embeddings, el base subyacente puede generar contenido inexacto si se usa para generación de texto.
- El repositorio no incluye el modelo base ni los modelos intermedios de LLM2Vec; la cadena completa requiere descargar aproximadamente 16 GB adicionales (modelo base) más los adaptadores intermedios.
- No se especifican los datos de entrenamiento del adaptador, por lo que no es posible evaluar su cobertura de subdominios dermatológicos (por ejemplo, dermatopatología, dermatología pediátrica, etc.).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Gbone3176/DermL2V
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct
- Modelo intermedio MNTP: https://huggingface.co/McGill-NLP/LLM2Vec-Meta-Llama-31-8B-Instruct-mntp
- Modelo intermedio supervisado: https://huggingface.co/McGill-NLP/LLM2Vec-Meta-Llama-31-8B-Instruct-mntp-supervised
