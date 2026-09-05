# Cryptojim/borg-graphiti-extraction-qwen3-1.7b

## Resumen

El modelo `Cryptojim/borg-graphiti-extraction-qwen3-1.7b` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por Cryptojim sobre el modelo base `mlx-community/Qwen3-1.7B-4bit`, cuantizado a 4 bits. Forma parte del proyecto Borg, un sistema de memoria compartida local-first para agentes de IA. Su función es convertir episodios de texto en objetos de extracción de grafos de conocimiento temporales en formato JSON estricto, con la estructura `{"entities":[...],"relations":[...]}`.

El adaptador añade 4,98 millones de parámetros entrenables (0,289 % del modelo base) y se entrenó con `mlx_lm lora` sobre pares con identificadores eliminados, destilados de un "single-operator estate". La licencia es MIT. Su relevancia radica en ser una capa de extracción rápida y ligera, con un throughput estimado de ~86 tokens/s en Apple M3 Ultra, pensada para integrarse en pipelines de agentes que necesitan construir y consultar grafos de conocimiento sin depender de servicios en la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (LoRA sobre Qwen3-1.7B 4-bit) |
| Parámetros totales | 1.7B (modelo base) + 4,98M (adaptador LoRA) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Modelo base en 4 bits; adaptador LoRA sin especificar |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | Adaptador LoRA MLX (pesos delta) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 8 sobre 16 capas del modelo base `Qwen3-1.7B-4bit`. Se entrenó con `mlx_lm lora`, batch 4, secuencias de 4096 tokens y learning rate 1e-5, durante 3.300 iteraciones (~13,7 millones de tokens). Los pares de entrenamiento fueron destilados a partir de un sistema operativo real, pero los identificadores (nombres de clientes, dominios, contactos, teléfonos y cadenas con forma de token) fueron reemplazados por sustitutos sintéticos antes del entrenamiento. No se utilizó RLHF ni DPO. La innovación principal es la integración con el pipeline de Borg y una sonda de memorización adversarial previa al lanzamiento, que verificó que el modelo no regurgita términos del registro de datos sensibles del operador. El pipeline de entrenamiento es open source.

## Capacidades

- Extracción de entidades y relaciones en formato JSON estricto para grafos de conocimiento temporales.
- Tasa de validez JSON del 92,75 % en un conjunto de evaluación de 400 pares.
- Rendimiento de extracción: Entity-name Jaccard de 0,610 frente al profesor, con una barra de concordancia entre anotadores de 0,53.
- Velocidad de inferencia de ~86 tokens/s y ~8,6 s por elemento en Apple M3 Ultra con carga compartida.
- Integración con el sistema Borg para memoria compartida local-first de agentes de IA.
- Soporte de tool calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: hereda la capacidad del modelo base, pero el adaptador está especializado en extracción estructurada.
- Capacidades multilingües: no documentadas.
- No se documentan capacidades de visión, audio ni "thinking mode".

## Casos de uso

- Construcción de grafos de conocimiento temporales: el modelo convierte episodios de texto en entidades y relaciones con marcas temporales, adecuado para sistemas que necesitan un grafo actualizado de eventos.
- Memoria compartida para agentes de IA: en el sistema Borg, el adaptador sirve para transformar las experiencias de un agente en hechos estructurados que pueden consultarse posteriormente.
- Extracción de datos en entornos privados: el entrenamiento con identificadores eliminados y la sonda de memorización lo hacen adecuado para procesar información sensible, siempre que se apliquen las mismas técnicas de anonimización.
- Indexado de documentación técnica o legal: permite extraer personas, organizaciones, fechas y relaciones de contratos o informes para búsqueda semántica y análisis.
- Automatización de la ingesta de correos y notas en sistemas CRM: convierte texto no estructurado en registros de entidades y relaciones que alimentan perfiles de cliente.
- Auditoría y cumplimiento: genera un registro estructurado de eventos con entidades y relaciones, facilitando la trazabilidad y el análisis temporal.
- Generación de datos de entrenamiento: el pipeline open source permite usar el adaptador para anotar texto y crear pares de extracción para otros modelos.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Held-out exam | 400 pares depurados |
| JSON-valid | 371/400 (92,75 %) |
| Entity-name Jaccard vs teacher | 0,610 (barra: 0,53) |
| Entity Jaccard p10 | 0,286 |
| Relation-count ratio | 0,955 |
| Dated-fraction | 0,845 |
| Serving (M3 Ultra, contended) | ~86 tok/s, ~8,6 s/item |
| Training | 3.300 iteraciones, ~13,7M tokens, 4,98M parámetros entrenables (0,289 %) |
| Memorization probe | 36 generaciones, 56 términos de registro — 0 hits |
| Promotion canary | No activado |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada.
- GPU recomendadas: no disponible; la evaluación se realizó en un Apple M3 Ultra con MLX.
- Cabe en consumer GPU: no disponible; el modelo base es 1.7B a 4 bits y el adaptador es pequeño, pero no se proporcionan datos de consumo de VRAM.
- Opciones de despliegue: `mlx_lm` con `--adapter-path`; el autor indica que el adaptador solo funciona con el modelo base exacto.
- Latencia y throughput: ~86 tok/s y ~8,6 s/item en M3 Ultra con contención.
- No se documentan vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa completa. El autor menciona un "hermano 4B" del mismo proyecto, con un throughput aproximadamente 2,2 veces menor y una validez de formato ligeramente superior, pero no se proporciona su identificador ni métricas detalladas. El modelo base Qwen3-1.7B es un modelo de lenguaje generalista, no un adaptador de extracción, por lo que no es comparable directamente. Por tanto, no se puede elaborar una tabla comparativa fiable.

## Limitaciones y advertencias

- El adaptador solo funciona con el modelo base exacto `mlx-community/Qwen3-1.7B-4bit`; no es un modelo autónomo y no puede cargarse con otros pesos.
- Los pares de entrenamiento son privados; no se publican. El pipeline para generar los propios es open source, pero requiere acceso a datos del propio operador.
- No se han publicado evaluaciones en benchmarks estándar (MMLU, HumanEval, GSM8K). La única evaluación es un "held-out exam" de 400 pares.
- La validez de formato es del 92,75 %, lo que implica que aproximadamente un 7 % de las salidas pueden no ser JSON válido. En producción se recomienda validación y reintentos.
- El "Entity Jaccard p10" es 0,286, lo que indica que en el 10 % de los casos el solapamiento de entidades con el profesor es bajo.
- El "promotion canary" no está activado; el modelo solo ha pasado el examen de calificación.
- No se ha evaluado el riesgo de alucinación de forma explícita; el modelo puede generar entidades o relaciones que no estén presentes en el texto de entrada.
- No se documentan sesgos específicos ni limitaciones de idioma.
- La licencia MIT permite uso comercial, pero el autor recomienda aplicar las mismas técnicas de anonimización en los datos de entrada para mantener la privacidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Cryptojim/borg-graphiti-extraction-qwen3-1.7b
- Repo del proyecto Borg: https://github.com/h3ro-dev/borg
- Modelo base en HuggingFace: https://huggingface.co/mlx-community/Qwen3-1.7B-4bit
- Página del modelo Qwen3-1.7B original: https://huggingface.co/Qwen/Qwen3-1.7B
