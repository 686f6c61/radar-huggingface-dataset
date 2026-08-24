# alibaba-pai/SearchQwen3-8B

## Resumen

SearchQwen3-8B es un modelo de agente de búsqueda desarrollado por Alibaba PAI, que parte del modelo base Qwen/Qwen3-8B y ha sido post-entrenado específicamente para tareas de búsqueda multi-hop y razonamiento profundo. El modelo está diseñado para interactuar con herramientas estructuradas de tipo `search` y `browse`, siguiendo trayectorias ReAct (Reasoning + Acting) verificadas, y para integrar evidencia procedente de múltiples fuentes a lo largo de horizontes largos. Es un modelo de 8,19 mil millones de parámetros, con licencia Apache 2.0 y formato de pesos safetensors.

La relevancia de este modelo radica en que aborda un problema práctico en sistemas de recuperación aumentada: los modelos de lenguaje generalistas no están optimizados para decidir cuándo y cómo realizar búsquedas, ni para sintetizar información de varias consultas intermedias. SearchQwen3-8B ha sido entrenado con trayectorias ReAct generadas por el pipeline EasyDistill2 y posteriormente refinado con un post-entrenamiento consciente del proceso, lo que le permite emitir llamadas a herramientas de forma estructurada y mejorar la precisión en preguntas de múltiples pasos. Su arquitectura hereda las capacidades del modelo base, incluyendo el modo de pensamiento explícito (thinking) y el modo sin pensamiento, conmutables durante la conversación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-8B) |
| Parametros totales | 8.190.735.360 (8,19B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el modelo base Qwen3-8B soporta 32K tokens) |
| Tipos de cuantizacion | no disponible (pesos originales en safetensors) |
| Idiomas soportados | no disponible (el modelo base Qwen3 soporta 119 idiomas y dialectos) |
| Licencia | Apache-2.0 (derivado de Qwen3-8B, que usa Apache-2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SearchQwen3-8B es un modelo de lenguaje causal de tipo transformer denso, basado en la arquitectura de Qwen3-8B. El entrenamiento consiste en una primera fase de SFT (supervised fine-tuning) sobre trayectorias ReAct generadas por el pipeline EasyDistill2, que produce trayectorias de búsqueda multi-hop alineadas con el entorno de evaluación. Posteriormente se aplica un post-entrenamiento consciente del proceso (process-aware post-training), que refuerza la coherencia de los pasos intermedios de razonamiento y la integración de evidencia. El modelo está optimizado para interacción con herramientas estructuradas mediante llamadas Tool-Call, aunque también se ha evaluado su variante de interacción textual estilo Search-R1 en modelos Qwen2.5. No se han publicado detalles sobre el número de tokens de entrenamiento ni la composición exacta del dataset, aunque se menciona un dataset complementario `alibaba-pai/SynSearch-Data`.

## Capacidades

- Generación de texto y razonamiento multi-hop: el modelo es capaz de descomponer preguntas complejas en subconsultas y combinar evidencia de varias fuentes.
- Llamadas a herramientas estructuradas: emite llamadas `search` y `browse` con formato JSON, integrándose en pipelines de agentes.
- Integración con el protocolo de herramientas de Qwen3 (MCP) y soporte de function calling en modos de pensamiento y sin pensamiento.
- Modo de pensamiento explícito (thinking) y modo no-pensamiento, conmutables durante la conversación, lo que permite optimizar el uso de recursos según la tarea.
- Capacidades multilingües heredadas del modelo base (119 idiomas y dialectas, según documentación de Alibaba Cloud).
- Generación de respuestas finales a partir de evidencia recopilada en múltiples pasos de búsqueda.

## Casos de uso

- **Búsqueda profunda y análisis documental**: el modelo puede gestionar consultas de investigación complejas que requieren múltiples búsquedas encadenadas y síntesis de resultados de distintas fuentes. Es adecuado para herramientas de deep search en entornos corporativos.
- **Agentes de atención al cliente con acceso a conocimiento externo**: integrado en un chatbot, el modelo decide cuándo realizar una búsqueda en una base de conocimiento o en la web para responder preguntas de varios turnos.
- **Generación de informes con fuentes citadas**: dado un tema, el modelo planifica búsquedas, extrae datos de páginas y redacta un informe con referencias, gracias a su capacidad de integrar evidencia a largo plazo.
- **Razonamiento multi-hop para preguntas de dominio específico**: en ámbitos como medicina, derecho o finanzas, donde las respuestas requieren combinar información de múltiples artículos o documentos, el modelo puede estructurar la búsqueda y razonar sobre los resultados.
- **Automatización de tareas de investigación de mercado**: el modelo puede realizar búsquedas de tendencias, comparar datos y resumir hallazgos, reduciendo el trabajo manual de analistas.
- **Sistemas de búsqueda aumentada (RAG) con agentes**: puede servir como orquestador de un pipeline RAG, decidiendo qué consultas lanzar, cuándo volver a buscar y cómo combinar la información recuperada.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación mediante LLM-judge (precisión en %) para diferentes modos de interacción.

### Interacción textual estilo Search-R1

| Modelo | Multi-hop QA Avg. | Deep Search Avg. | Overall Avg. |
|---|---|---:|---:|---:|
| Qwen2.5-7B-Instruct (Base) | 45,28 | 18,65 | 31,96 |
| SearchQwen2.5-7B | 52,95 | 26,23 | 39,59 |
| Qwen2.5-3B-Instruct (Base) | 30,12 | 14,95 | 22,54 |
| SearchQwen2.5-3B | 39,55 | 21,15 | 30,35 |

### Interacción con llamada a herramienta estructurada

| Modelo | Multi-hop QA Avg. | Deep Search Avg. | Overall Avg. |
|---|---|---|---:|---:|
| Qwen2.5-7B-Instruct (Base) | 45.23 | 24.35 | 33.33 |
| SearchQwen2.5-7B | 55.90 | 33.33 | 44.61 |
| Qwen2.5-3B-Instruct (Base) | 36.10 | 7.05 | 21.60 |
| SearchQwen2.5-3B | 48.58 | 21.40 | 35.00 |

### Generalización entre arquitecturas (Tool-Call estructurado)

| Modelo | Deep Search Avg. | Overall Avg. |
|---|---:|---:|
| Qwen3-8B (Base) | 24.50 | 40.31 |
| SearchQwen3-8B | 35.42 | 50.31 |

Estos resultados indican que el modelo mejora significativamente al base Qwen3-8B en tareas de búsqueda profunda y en el promedio general, manteniendo un rendimiento competitivo frente a los modelos de la familia SearchQwen2.5.

## Requisitos de hardware

- **VRAM estimada**: para inferencia en precisión FP16, se necesitan aproximadamente 16 GB de VRAM (los pesos del modelo ocupan 16,4 GB). Con cuantización de 8 bits, se puede reducir a ~8 GB; con 4 bits, ~4-5 GB.
- **GPU recomendadas**: NVIDIA L20 (usada en la validación oficial), A100 40GB, RTX 4090 (24GB) o RTX 3090 (24GB) para FP16. Para cuantización, GPU con 8 GB o más pueden ser suficientes.
- **Compatibilidad con GPU de consumo**: sí, una RTX 4080 o 4090 pueden ejecutar el modelo en FP16 con margen. Con cuantización 4-bit, incluso tarjetas de 8 GB (como RTX 3060) pueden ser viables.
- **Opciones de despliegue**: vLLM (con API compatible con OpenAI), llama.cpp, Ollama, TGI (Text Generation Inference), y transformers con `device_map="auto"`.
- **Latencia y throughput**: no se han publicado datos específicos. En una GPU L20, la carga completa del modelo se valida correctamente, pero no se indica el rendimiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| SearchQwen3-8B | 8,19B | no disponible (base 32K) | Apache-2.0 | Agente de búsqueda multi-hop |
| Qwen3-8B (base) | 8,19B | 32K | Apache-2.0 | Modelo generalista con thinking |
| SearchQwen2.5-7B | 7,6B | no disponible | Apache-2.0 | Agente de búsqueda (versión anterior) |
| Qwen2.5-7B-Instruct | 7,6B | 32K | Apache-2.0 | Modelo generalista |

Según los benchmarks de la model card, SearchQwen3-8B supera claramente a Qwen3-8B base en tareas de búsqueda profunda (35.42 vs 24.50) y en promedio global (50.31 vs 40.31). También es superior a SearchQwen2.5-7B en el mismo tipo de evaluación, aunque no se presentan resultados directos comparativos entre ambos.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al ser un modelo derivado de Qwen3, puede heredar sesgos presentes en los datos de entrenamiento y generar información inventada cuando no encuentra evidencia suficiente.
- **Dependencia de la calidad de las herramientas**: el rendimiento del modelo está ligado a la calidad y disponibilidad del entorno de búsqueda. Si las herramientas devuelven resultados incompletos o erróneos, las respuestas finales pueden verse afectadas.
- **Longitud de contexto**: no se ha especificado la longitud de contexto del modelo derivado. Aunque el base soporta 32K, el post-entrenamiento podría alterar ese límite. Es recomendable verificar antes de desplegar en producción.
- **Idiomas**: no se ha indicado qué idiomas están optimizados en la versión final. Aunque el base soporta muchos idiomas, el fine-tuning específico para búsqueda podría tener un rendimiento desigual según el idioma.
- **Licencia**: Apache-2.0 es permisiva para uso comercial, pero se debe respetar la licencia del modelo base Qwen3 (también Apache-2.0). Es recomendable revisar los términos de uso de Alibaba Cloud para despliegues en su plataforma.
- **Riesgo de sobreajuste a tareas de búsqueda**: el modelo está especializado en búsqueda multi-hop; fuera de ese ámbito podría no ofrecer ventajas frente a un modelo generalista.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alibaba-pai/SearchQwen3-8B
- Dataset complementario: https://huggingface.co/datasets/alibaba-pai/SynSearch-Data
- Documentación de Qwen3-8B en Alibaba Cloud: https://www.alibabacloud.com/help/en/model-studio/qwen3-8b
- Página de Qwen en Alibaba Cloud: https://www.alibabacloud.com/en/solutions/generative-ai/qwen
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
