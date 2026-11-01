# sazid63/archresidencebd-models

## Resumen

ArchResidenceBD Model Fleet es una colección de cuatro modelos cuantizados en formato GGUF, desarrollada por el usuario sazid63 como componente central del proyecto ArchResidenceBD, un "ingeniero civil de IA" especializado en edificación residencial en Bangladesh. La flota no es un modelo único, sino un sistema multi-modelo: un modelo de chat para entrevistas y explicaciones basado en Qwen3-4B-Instruct-2507, un modelo de reparación de scripts CAD basado en Qwen2.5-Coder-3B-Instruct, y dos modelos auxiliares de Qwen (Embedding 0.6B y Reranker 0.6B) para construir un pipeline RAG completo.

La relevancia de esta ficha reside en que ilustra un patrón de despliegue cada vez más común: dominios verticales muy específicos (normativa constructiva residencial de Bangladesh) que combinan un LLM conversacional con recuperación de información aumentada (RAG) y un modelo de reparación de código, todo ejecutable localmente con llama.cpp. Los cuatro modelos son derivados de la familia Qwen con licencia Apache-2.0, lo que permite uso comercial sin restricciones. El parámetro total del repositorio safetensors es de 4.022.468.096 parámetros, correspondiente al modelo principal de 4B, y el tamaño total del repositorio es de 7,9 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flota multi-modelo: chat (Qwen3-4B-Instruct-2507), reparación de código (Qwen2.5-Coder-3B-Instruct), embedding (Qwen3-Embedding-0.6B) y reranker (Qwen3-Reranker-0.6B) |
| Parametros totales | 4.022.468.096 (modelo principal, dato safetensors); el resto de modelos: 3B y 0,6B según componente |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (según los comandos de ejemplo con `-c 8192`); límite nativo del modelo base no disponible |
| Tipos de cuantizacion | Q4_K_M (chat y repair), Q8_0 (embedding y reranker) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp); endpoints_compatible |

## Arquitectura y entrenamiento

La flota se compone de cuatro modelos independientes que trabajan de forma coordinada. El modelo conversacional (archie-chat-v0) parte de Qwen3-4B-Instruct-2507, un transformer denso de 4 mil millones de parámetros de la familia Qwen3 de Alibaba, ajustado para la tarea de entrevista al usuario, parseo de requisitos y explicación de decisiones de diseño civil. El modelo de reparación (archres-repair-v0) parte de Qwen2.5-Coder-3B-Instruct, especializado en código, y está destinado a corregir scripts CAD generados o modificados durante el flujo de trabajo. Los dos modelos de 0,6B (Qwen3-Embedding y Qwen3-Reranker, ambos en Q8_0) forman la capa de recuperación: el embedding genera vectores para búsqueda semántica y el reranker reordena los candidatos recuperados.

No se han publicado detalles sobre el proceso de fine-tuning: número de tokens de entrenamiento, composición del dataset (se presume que incluye normativa y práctica constructiva residencial de Bangladesh), uso de RLHF/DPO ni método de destilación. Tampoco se detalla el tamaño exacto de los ajustes (LoRA vs. full fine-tune). Todos los pesos se distribuyen cuantizados en GGUF para inferencia con llama.cpp, con desactivación total de offload a CPU (`-ngl 99` para los modelos generativos y `-ngl 0` con pooling especial para embedding y reranking).

## Capacidades

- Generación de texto conversacional multi-turno orientada a entrevistas de requisitos de edificación residencial (modelo archie-chat-v0).
- Parseo y estructuración de requisitos de usuario en formato interpretable por el sistema ArchResidenceBD.
- Explicación de decisiones de diseño y normativa civil al usuario final.
- Reparación de scripts CAD generados por el sistema, con un modelo especializado en código (Qwen2.5-Coder-3B).
- Recuperación semántica de documentos mediante embeddings (Qwen3-Embedding-0.6B en Q8_0, con pooling "last").
- Reordenamiento de resultados de recuperación (reranking) para mejorar la precisión del RAG.
- Despliegue completo como servidores OpenAI-compatibles vía `llama-server` de llama.cpp.
- No hay evidencia de capacidades de visión, audio ni tool calling nativo en la model card.

## Casos de uso

- Asistente de entrevistas para proyectos residenciales: archie-chat-v0 guía conversaciones multi-turno para recopilar requisitos de una vivienda (número de plantas, dimensiones de parcela, presupuesto), aprovechando una ventana de contexto de 8192 tokens suficiente para este tipo de diálogo.
- Generación de documentación normativa: el modelo de chat puede explicar requisitos del código de construcción de Bangladesh en lenguaje natural, apoyándose en el RAG para citar pasajes relevantes.
- Pipeline RAG sobre normativa constructiva: la combinación de Qwen3-Embedding-0.6B (búsqueda vectorial) y Qwen3-Reranker-0.6B (reordenamiento) permite consultar grandes corpus de documentos técnicos con alta precisión de recuperación en hardware modesto.
- Reparación automática de scripts CAD: cuando el sistema genera código CAD con errores de sintaxis o semántica, archres-repair-v0 lo corrige antes de ejecutarlo, reduciendo la intervención manual.
- Despliegue local en entornos sin conexión: al ser GGUF cuantizado, toda la flota puede ejecutarse en una estación de trabajo local, útil en despachos de arquitectura con datos de clientes sensibles.
- Prototipado de sistemas verticales multi-modelo: la estructura chat + repair + embed + rerank sirve como plantilla reproducible para otros dominios verticales de bajo recurso.
- Educación técnica: el modelo conversacional puede servir como tutor para estudiantes de ingeniería civil en Bangladesh, respondiendo preguntas sobre diseño residencial con contexto recuperado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas del dominio (precisión de reparación de scripts CAD, calidad de recuperación del RAG, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia del modelo de chat (Q4_K_M, 2,33 GB): aproximadamente 2,5-3 GB con contexto de 8192 tokens; cabe holgadamente en GPUs de 4-6 GB.
- VRAM estimada para el modelo de reparación (Q4_K_M, 1,80 GB): aproximadamente 2-2,5 GB con contexto de 8192 tokens.
- VRAM estimada para embedding y reranker (Q8_0, 0,60 GB cada uno): menos de 1 GB por modelo.
- Toda la flota completa cabe en una GPU de 8 GB si se ejecutan los cuatro servicios simultáneamente, o incluso en CPU dado que los comandos de ejemplo usan `-ngl 0` para los modelos de embedding/reranking.
- GPUs recomendadas: cualquier GPU consumer moderna (RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4090) es más que suficiente; no se requieren A100 ni H100.
- Despliegue: llama.cpp (vía `llama-server`, método documentado en la model card). La compatibilidad con Ollama, LM Studio o vLLM es plausible al ser GGUF/safetensors de la familia Qwen, pero no está documentada explícitamente.
- Latencia y throughput: no disponibles. Dado el tamaño (3-4B en Q4_K_M), se espera generación fluida en GPU consumer y velocidad aceptable en CPU moderno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| ArchResidenceBD (archie-chat-v0) | 4B (Qwen3-4B-Instruct-2507) | 8192 (config de ejemplo) | GGUF Q4_K_M | Apache-2.0 | Dominio vertical: ingeniería civil residencial en Bangladesh, con RAG |
| Qwen3-4B-Instruct-2507 (base) | 4B | hasta 262.144 (según ficha oficial de Qwen) | Safetensors/GGUF | Apache-2.0 | Uso general, chat y razonamiento |
| Qwen2.5-Coder-3B-Instruct | 3B | 32.768 (según ficha oficial) | Safetensors/GGUF | Apache-2.0 | Código y reparación de scripts |
| Phi-3.5-mini-instruct | 3,8B | 128.000 | Safetensors/GGUF | MIT | Uso general, alternativa de tamaño similar |

Nota: los datos de contexto de los modelos base (Qwen3, Qwen2.5-Coder, Phi-3.5) proceden de sus fichas oficiales y se incluyen como referencia; para la flota de ArchResidenceBD solo está documentado el contexto de 8192 usado en los ejemplos de despliegue.

## Limitaciones y advertencias

- Contexto de 8192 tokens en los ejemplos de despliegue, notablemente inferior al soportado por los modelos base Qwen3/Qwen2.5-Coder; puede ser insuficiente para documentos normativos largos sin chunking en el RAG.
- No hay benchmarks publicados ni evaluaciones de calidad: el rendimiento real en tareas de ingeniería civil no está verificado por terceros.
- Riesgo de alucinación elevado en datos técnicos críticos (dimensiones, cargas, normativa): cualquier salida con implicaciones estructurales o de seguridad debe ser validada por un ingeniero civil colegiado. El propio proyecto se posiciona como asistente, no como sustituto de un profesional.
- Idiomas soportados no documentados; dado el dominio (Bangladesh), es probable que el ajuste favorezca inglés y/o bengalí, con rendimiento desconocido en castellano.
- Sesgos: no documentados. Al tratarse de fine-tunes de la familia Qwen, heredan los sesgos de los datos de preentrenamiento originales.
- Licencia Apache-2.0 sin restricciones de uso comercial, pero conviene revisar las condiciones de los modelos base Qwen, que son también Apache-2.0.
- Proyecto de autor individual con 215 descargas y 0 likes en el momento de la ficha: madurez, mantenimiento y auditoría comunitaria limitados. Se recomienda cautela antes de uso en producción.
- No hay evidencia de soporte nativo de tool calling, agentes multi-paso, visión ni audio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/sazid63/archresidencebd-models
- Repositorio del proyecto ArchResidenceBD en GitHub: https://github.com/sazid63/ArchResidenceBD
- Fichas oficiales de los modelos base (referencia): Qwen3-4B-Instruct-2507, Qwen2.5-Coder-3B-Instruct, Qwen3-Embedding-0.6B y Qwen3-Reranker-0.6B en HuggingFace (colección de Qwen).
- Paper, blog o demo: no disponibles.
