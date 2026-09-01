# DeliVali/cogito-estella

## Resumen

Cogito Estella es un motor de grafo latente (v0.7.0) desarrollado por DeliVali que convierte embeddings de frases de SONAR (Meta) directamente en triples de grafo de conocimiento (sujeto, relación, objeto) mediante cabezas decodificadoras no autorregresivas. A diferencia de los modelos de lenguaje generativos, no realiza decodificación de tokens: produce estructuras válidas por construcción, con una latencia de 0,013 ms por concepto en una RTX 5070. Está diseñado para tareas de extracción de conocimiento estructurado, como ingestión para GraphRAG, memoria a largo plazo de agentes, observabilidad de tool-calls y mapeo de codebases.

El modelo se distribuye en varios checkpoints especializados por modalidad: tool-calls/API control, código Python (con adaptadores LoRA), prosa con entidades condicionadas y prosa de vocabulario abierto. Los tamaños varían entre 20M y 45M de parámetros por checkpoint, con un tamaño total de repositorio de 1,6 GB. La licencia de las cabezas decodificadoras es Apache-2.0, pero el encoder SONAR requerido para la inferencia se distribuye por separado bajo CC-BY-NC 4.0, lo que limita el uso comercial del conjunto completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezas decodificadoras no autorregresivas sobre embeddings SONAR (Meta) |
| Parametros totales | Variable por checkpoint: 24,3M (tool-calls), 20M+26M (código LoRA), 5×37M (prosa condicionada), 3×45M+37M (prosa open-vocab) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (procesa embeddings de frases, no secuencias de tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés y multilingüe (depende del encoder SONAR) |
| Licencia | Apache-2.0 para decoders; encoder SONAR bajo CC-BY-NC 4.0 (no comercial) |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

Cogito Estella no es un transformer generativo, sino un conjunto de decodificadores no autorregresivos que operan sobre representaciones densas de frases producidas por el encoder SONAR de Meta. Cada checkpoint implementa una cabeza decodificadora que toma un embedding de frase y un conjunto de entidades candidatas (proporcionadas por el llamante o extraídas de un vocabulario de 20.000 lemas) y predice la existencia de relaciones entre pares de entidades, junto con la etiqueta de relación de un vocabulario de 60 verbos. La salida se decodifica como triples mediante una función de decodificación dispersa (decode_triples_coo) que aplica umbrales y forzado de top-1.

El entrenamiento se realizó sobre una muestra de 119.911 ejemplos, con validación en particiones vírgenes para evitar fugas por combinación. No se especifican los datos de entrenamiento ni el método (RLHF/DPO no aplica al ser un modelo discriminativo). La innovación principal es la generación de grafos estructuralmente válidos sin decodificación autorregresiva, lo que reduce la latencia y elimina errores de formato. Los adaptadores LoRA en el checkpoint de código modifican el encoder SONAR, lo que arrastra la licencia no comercial de Meta.

## Capacidades

- Extracción de triples de conocimiento (sujeto, relación, objeto) a partir de texto codificado con SONAR.
- Soporte de tool-calls y control de API con F1 de 1,000 en el checkpoint dedicado.
- Extracción de relaciones en código Python (F1 de 0,781) mediante adaptadores LoRA sobre el encoder.
- Prosa con entidades condicionadas (F1 de 0,827) usando un ensamblado de 5 decodificadores.
- Prosa de vocabulario abierto (F1 de 0,6514) con pila de 3 decodificadores más un mecanismo de cascada.
- Integración con GraphRAG, memoria de agentes, observabilidad de tool-calls y mapeo de codebases.
- Multilingüe a través del encoder SONAR, que soporta múltiples idiomas.

## Casos de uso

- Ingestión para GraphRAG: extraer triples de documentos corporativos o técnicos para construir y actualizar grafos de conocimiento que alimenten pipelines de retrieval aumentado por grafos.
- Memoria a largo plazo de agentes: almacenar hechos extraídos de conversaciones o interacciones como triples, permitiendo que un agente recuerde entidades y relaciones de forma estructurada.
- Observabilidad de tool-calls: registrar automáticamente qué herramientas se invocan, con qué argumentos y sobre qué entidades, generando un grafo de uso para auditoría o depuración.
- Mapeo de codebases: extraer relaciones entre funciones, clases, módulos y dependencias en repositorios de código Python, facilitando la navegación y el análisis estático.
- Análisis de documentos legales o financieros: identificar relaciones entre partes, cláusulas y montos a partir de texto no estructurado, con salida directamente consultable en un grafo.
- Sistemas de recomendación basados en grafos: extraer relaciones de reseñas, descripciones de productos o perfiles de usuario para enriquecer un grafo de conocimiento que alimente motores de recomendación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque el modelo no es un LLM generativo. La model card reporta métricas F1 por checkpoint, validadas en particiones vírgenes de la muestra de 119.911 ejemplos:

| Checkpoint | Modalidad | Triple F1 | Params |
|---|---|---|---|
| cogito-toolcalls-graphdecoder.pt | tool-calls / API control | 1,000 | 24,3M |
| cogito-code-lora-adapters.pt | Python code (LoRA + decoder) | 0,781 | 20M + 26M |
| cogito-prose-candidates-{ft,cal,base,s2,s3}.pt | entity-conditioned prose (ensemble de 5) | 0,827 | 5 × 37M |
| cogito-prose-openvocab{,-s4,-s5}.pt + cascade-fallback | open-vocab prose stack | 0,6514 | 3 × 45M + 37M |

No se dispone de comparaciones con otros modelos de extracción de relaciones en la información proporcionada.

## Requisitos de hardware

- Inferencia requiere GPU con CUDA (el código de ejemplo usa .cuda()).
- VRAM estimada: no especificada, pero los checkpoints tienen entre 20M y 45M de parámetros, por lo que caben holgadamente en GPUs consumer (p. ej., RTX 5070 con 12 GB).
- GPU recomendada: RTX 5070 o similar (mencionada en la model card para la latencia de 0,013 ms por concepto).
- Despliegue: PyTorch nativo; no aplican motores de inferencia para LLM como vLLM u Ollama, pero puede integrarse en pipelines personalizados con el encoder SONAR.
- Latencia: 0,013 ms por concepto en RTX 5070 (según la model card).

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada (ni en la model card ni en la búsqueda web). El enfoque de decodificadores no autorregresivos sobre embeddings SONAR es específico de este proyecto.

## Limitaciones y advertencias

- El encoder SONAR de Meta se distribuye bajo CC-BY-NC 4.0, lo que impide el uso comercial del sistema completo. Los adaptadores LoRA en cogito-code-lora-adapters.pt heredan esa restricción.
- Las entidades se limitan a las proporcionadas por el llamante (cabeza condicionada) o a un vocabulario de 20.000 lemas (cabeza open-vocab); contenido fuera de ese espacio no se captura.
- Las relaciones se limitan a un vocabulario de 60 verbos; relaciones más complejas o matizadas pueden perderse.
- La extracción en prosa libre se basa en un oráculo de parseo de dependencias SVO, por lo que los grafos generados heredan el ruido de ese parseo.
- No se especifican sesgos conocidos, pero al depender de SONAR y de los datos de entrenamiento, puede haber sesgos en la selección de entidades y relaciones.
- Riesgo de errores de extracción (falsos positivos/negativos) en textos ambiguos o con estructuras sintácticas complejas.
- No es un modelo generativo: no produce texto, solo triples estructurados.

## Enlaces

- HuggingFace: https://huggingface.co/DeliVali/cogito-estella
- Repositorio GitHub (código, tests y quickstart): https://github.com/DeliVali/cogito-estella
- Perfil del autor en HuggingFace: https://huggingface.co/DeliVali
