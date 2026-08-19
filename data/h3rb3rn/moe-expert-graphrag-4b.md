# h3rb3rn/moe-expert-graphrag-4b

## Resumen

`moe-expert-graphrag-4b` es un modelo de lenguaje pequeño (SLM) de 4.200 millones de parámetros, especializado en navegación de grafos de conocimiento y GraphRAG. Desarrollado por el autor `h3rb3rn` como componente experto dentro de la arquitectura compuesta MoE Sovereign, este modelo se ha destilado a partir de dos profesores de gran escala —Moonshot Kimi-k3 (2M de contexto) y Meta-Llama-3.1-405B-Instruct— sobre la base de Qwen3.5-4B, una arquitectura híbrida que combina atención lineal y capas Mamba. El entrenamiento se realizó en el supercomputador LUMI-G con 8 GPU AMD Instinct MI250X de 128 GB, utilizando un dataset de 34.200 trayectorias GraphRAG validadas.

El modelo resuelve un problema concreto: traducir preguntas relacionales en consultas Cypher eficientes para Neo4j, desambiguar entidades ambiguas, fusionar recuperación híbrida vectorial y topológica, y extraer subgrafos de conocimiento con metadatos de procedencia. Su relevancia radica en que permite ejecutar tareas de GraphRAG de alta precisión en un modelo de solo 4B, mucho más ligero que los profesores originales, con soporte de cuantización GGUF para despliegue en hardware de consumo. Está disponible bajo licencia Apache-2.0 y soporta los idiomas inglés y alemán.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Linear Attention + Mamba (base Qwen3.5-4B) |
| Parametros totales | 4.205.751.296 (4,2B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (según Modelfile de Ollama) |
| Tipos de cuantizacion | GGUF Q4_K_M y Q8_0; pesos BF16 en safetensors |
| Idiomas soportados | Inglés, alemán |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16), GGUF |

## Arquitectura y entrenamiento

La arquitectura base es Qwen3.5-4B, que combina atención lineal (para escalar el contexto de forma eficiente) con capas Mamba de espacio de estados. Sobre esta base se aplicó un ajuste fino con LoRA (r=16, alpha=32, dropout 0.05) en las proyecciones q, k, v, o, gate, up y down. El proceso de destilación utilizó como profesores a Moonshot Kimi-k3 (con contexto de 2M tokens) y Meta-Llama-3.1-405B-Instruct, cuyas salidas se validaron mediante comprobación de sintaxis Cypher y ejecución real sobre grafos. El dataset de entrenamiento, `moe-sovereign/expert-graphrag-sft`, contiene 34.200 trayectorias GraphRAG de alta precisión. Se entrenó durante 3 épocas con un batch efectivo de 128, tasa de aprendizaje de 1.5×10⁻⁵ con decaimiento coseno y warmup, alcanzando una pérdida final de 0.0073 y una precisión de token del 99.84%. El entrenamiento se ejecutó en LUMI-G con DeepSpeed ZeRO-2, ROCm 7.0 y PyTorch 2.6.

## Capacidades

- Generación de consultas Cypher multi-hop para Neo4j, con sintaxis validada, sugerencias de índices y límites de profundidad de recorrido.
- Desambiguación de entidades y resolución de alias: mapea abreviaturas, sinónimos y entidades entre documentos a URIs canónicas de nodos.
- Fusión de recuperación híbrida: combina umbrales de similitud semántica vectorial con distancias topológicas en el grafo para extracción factual de alta recall.
- Extracción de subgrafos de conocimiento: genera tripletas estrictas `(Sujeto)-[:PREDICADO]->(Objeto)` con metadatos de procedencia.
- Soporte de tool calling implícito para generación de consultas estructuradas (Cypher).
- Capacidades multilingües limitadas a inglés y alemán.
- Compatible con pipelines de generación de texto estándar de Transformers y con GGUF para inferencia ligera.

## Casos de uso

- Análisis de dependencias de software: el modelo puede generar consultas Cypher para identificar todos los componentes de microservicios afectados por una CVE dentro de N saltos de dependencia, acelerando la respuesta a vulnerabilidades.
- Atención al cliente con base de conocimiento en grafo: permite responder consultas multi-turno sobre productos o incidencias, traduciendo preguntas naturales a recorridos de grafo con contexto largo (hasta 262K tokens).
- Búsqueda semántica en bases de conocimiento empresariales: combina embeddings vectoriales con topología de grafo para recuperar documentos y relaciones que los sistemas puramente vectoriales omiten.
- Generación de consultas para motores de recomendación: traduce preferencias de usuario en patrones de recorrido de grafo para sugerencias personalizadas.
- Extracción de información estructurada de documentos legales o técnicos: convierte texto no estructurado en tripletas RDF con procedencia verificable, útil para construir ontologías.
- Integración en pipelines de GraphRAG en producción: como experto dentro de una arquitectura compuesta, puede ejecutarse en paralelo con otros modelos especializados para tareas de razonamiento sobre grafos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card reporta únicamente métricas de entrenamiento: pérdida final 0.0073 y precisión de token 99.84% sobre el dataset de destilación. No se proporcionan comparativas cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: para inferencia en BF16, el modelo requiere aproximadamente 8-9 GB de VRAM (4,2B parámetros × 2 bytes). Con cuantización GGUF Q4_K_M, el requisito baja a unos 2,5-3 GB.
- GPU recomendadas: tarjetas de consumo como RTX 3060 12GB, RTX 4070 o superiores son suficientes para la versión cuantizada; para BF16 completo se recomienda RTX 4090 o GPUs de datacenter como A100.
- Compatible con hardware de consumo: sí, especialmente con cuantización GGUF.
- Opciones de despliegue: Ollama (con Modelfile proporcionado), llama.cpp, Transformers con `device_map="auto"`, y compatible con servidores de inferencia como vLLM o TGI (endpoints_compatible).
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia |
|---|---|---|---|---|
| `moe-expert-graphrag-4b` | 4,2B | 262K | GraphRAG, Cypher, grafos | Apache-2.0 |
| Qwen3.5-4B (base) | 4,2B | 262K | Generalista | Apache-2.0 |
| Llama-3.1-8B-Instruct | 8B | 128K | Generalista | Llama 3.1 Community |

El modelo se diferencia de su base Qwen3.5-4B por la especialización en tareas de grafos: la destilación desde modelos mucho mayores (Kimi-k3 y Llama-3.1-405B) le confiere capacidades de generación de Cypher y resolución de entidades muy superiores a las del modelo base, a costa de una menor versatilidad en tareas generales. Frente a Llama-3.1-8B, ofrece la ventaja de un tamaño menor y una especialización más profunda en GraphRAG, aunque con un alcance lingüístico más reducido (solo en/de).

## Limitaciones y advertencias

- Especialización estrecha: el modelo está optimizado para GraphRAG y tareas de grafos; su rendimiento en tareas generales de razonamiento o generación de texto puede ser inferior al de la base Qwen3.5-4B.
- Idiomas limitados: solo inglés y alemán; no soporta otros idiomas, incluido el español.
- Riesgo de alucinación: aunque la destilación incluye verificación de sintaxis y ejecución de consultas, el modelo puede generar Cypher sintácticamente válido pero semánticamente incorrecto en grafos muy complejos.
- Dependencia del dataset: la calidad de la destilación depende de las 34.200 trayectorias del dataset `moe-sovereign/expert-graphrag-sft`, que puede no cubrir todos los esquemas de grafo posibles.
- Sin benchmarks publicados: no hay métricas estandarizadas (MMLU, HumanEval) que permitan comparar objetivamente con otros modelos.
- Fecha de creación futura (2026-08-16): el modelo se publicó con fecha posterior a la actual, lo que sugiere que puede ser un artefacto de prueba o experimental.
- Requiere `trust_remote_code=True` en Transformers, lo que implica ejecutar código personalizado del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/h3rb3rn/moe-expert-graphrag-4b
- Dataset de entrenamiento: https://huggingface.co/datasets/moe-sovereign/expert-graphrag-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Supercomputador LUMI-G: https://www.lumi-supercomputer.eu/
