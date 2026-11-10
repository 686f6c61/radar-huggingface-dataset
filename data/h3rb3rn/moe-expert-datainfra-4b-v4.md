# h3rb3rn/moe-expert-datainfra-4b-v4

## Resumen

moe-expert-datainfra-4b-v4 es un modelo de lenguaje especializado de 4.326.350.848 parámetros (aproximadamente 4,3 mil millones) desarrollado por el usuario h3rb3rn sobre la base de Qwen/Qwen3.5-4B. Está diseñado como un experto de dominio dentro de un sistema denominado "MoE-Sovereign", donde cumple la función concreta de "datainfra": generación y razonamiento sobre SQL para PostgreSQL 17. No se trata de un modelo de propósito general, sino de un componente especializado que se invoca dentro de una arquitectura mayor de tipo compound-AI.

El modelo parte de la arquitectura híbrida de Qwen3.5-4B (atención lineal combinada con atención completa) y ha sido ajustado mediante SFT con LoRA de rango 32 y, posteriormente, 100 pasos de GRPO con una recompensa basada en la ejecución real de consultas contra PostgreSQL. El entrenamiento se realizó en el supercomputador LUMI-G empleando TRL-GRPO. La especialización es deliberada y estrecha: el conocimiento factual no reside en los pesos, sino que se espera que provenga de una base de conocimiento externa (enfoque "KB-first").

Su relevancia radica en dos factores. Por un lado, demuestra una metodología de especialización de modelos pequeños mediante refuerzo verificado por ejecución (execution-checked reward), un patrón cada vez más común para tareas de ingeniería de datos. Por otro lado, su licencia Apache 2.0 y su reducido tamaño lo hacen desplegable en hardware modesto. Sin embargo, el modelo es muy reciente (creado el 10 de noviembre de 2026), no tiene descargas ni interacciones registradas, y su model card está redactada en alemán con mediciones limitadas y de muestra pequeña.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal y atención completa (heredada de Qwen3.5-4B) |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no es un MoE denso pese al nombre; "moe-sovereign" hace referencia al sistema que lo aloja) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M publicada; entrenamiento medido en bf16; KV-cache q4_0 |
| Idiomas soportados | en, de |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) y GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-4B, descrita en la model card como "hybrid linear/full attention", es decir, una combinación de capas con atención lineal y capas con atención completa. Sobre esta base se aplicó un ajuste supervisado (SFT) para la rol "datainfra-v3" mediante LoRA de rango 32, seguido de 100 pasos de GRPO (Group Relative Policy Optimization) con una recompensa basada en la ejecución real de consultas contra PostgreSQL. La recompensa es de tipo "execution-checked": el resultado se valida ejecutando la consulta y se otorga crédito parcial según la fórmula 0 / 0,1 + 0,6·cobertura de filas / 1,0.

El conjunto de entrenamiento de GRPO consistió en 700 tareas procedimentales distribuidas en 21 familias y 4 esquemas de base de datos. El entrenamiento se ejecutó en LUMI-G con TRL-GRPO. Un detalle metodológico relevante es que la recompensa de GRPO se calculó contra PostgreSQL 16.2 (y Neo4j 5.26 para otros expertos del sistema), mientras que el conjunto de evaluación se ejecutó contra PostgreSQL 17. La model card subraya explícitamente que el conocimiento factual no está en los pesos: el modelo está pensado para operar con contexto de una base de conocimiento externa (KB-first).

## Capacidades

- Generación de texto conversacional en inglés y alemán.
- Generación y razonamiento sobre SQL para PostgreSQL 17 (rol datainfra).
- Resolución de tareas procedimentales de bases de datos: consultas, transformaciones y operaciones sobre 4 esquemas predefinidos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente; el diseño KB-first sugiere invocación dentro de un pipeline mayor.
- Capacidades multilingües: limitadas a inglés y alemán según los metadatos.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Integración con endpoints compatibles (tag `endpoints_compatible`).

## Casos de uso

- Generación asistida de consultas SQL para PostgreSQL 17: el modelo puede producir sentencias SQL a partir de descripciones en lenguaje natural, apoyándose en el contexto de esquema que se le inyecte desde la base de conocimiento externa.
- Revisión y corrección de consultas existentes: dado un esquema y una consulta, el experto puede detectar errores sintácticos o semánticos y proponer alternativas ejecutables, aprovechando el entrenamiento con recompensa verificada por ejecución.
- Migración y adaptación de esquemas: al estar entrenado sobre 4 esquemas y 21 familias de tareas procedimentales, puede asistir en la reescritura de consultas entre variantes de esquema dentro del mismo motor.
- Automatización de tareas de ingeniería de datos en pipelines: integrado como componente de un sistema compound-AI, puede generar transformaciones y validaciones que luego se ejecutan y verifican automáticamente.
- Enrutamiento dentro de un sistema multi-experto: dado su rol acotado (datainfra), encaja como submodelo invocado por un orquestador cuando la consulta del usuario entra en el dominio de bases de datos relacionales.
- Despliegue en entornos con recursos limitados: su tamaño de 4,3 mil millones de parámetros y la disponibilidad de un GGUF Q4_K_M permiten ejecutarlo en estaciones de trabajo o GPUs de consumo para prototipado de asistentes SQL.
- Evaluación de metodologías de especialización: sirve como referencia reproducible para equipos que quieran aplicar GRPO con recompensa verificada por ejecución a dominios técnicos concretos.

## Benchmarks y rendimiento

La model card reporta mediciones sobre un conjunto de 109 tareas escritas por el propio autor. Los resultados se expresan como tareas superadas en modo greedy / con muestreo (semilla 1), sobre el total de tareas de cada categoría.

| Categoria | Tareas superadas (greedy / sampling) | Total | Notas |
|---|---|---|---|
| datainfra (PostgreSQL 17) | 22 / 28 | 38 | Vorgänger datainfra-v3: 20 / 18 |
| graphrag (Neo4j 5.26) | 8 / 9 | 35 | Rol distinto al especializado |
| precision | 13 / 13 | 36 | — |
| OOD-Präzision | 36 / 36 | 70 | Fuera de dominio |

El autor advierte que diferencias inferiores a 3 tareas se consideran ruido, que las muestras son pequeñas y que solo se realizó un entrenamiento por modelo. Las mediciones se hicieron en bf16 sobre LUMI-G, no sobre la cuantización Q4_K_M publicada, cuya evaluación está pendiente.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 8,7 GB solo para pesos (4,3 mil millones de parámetros × 2 bytes), más overhead de activaciones y KV-cache.
- VRAM estimada en Q4_K_M: aproximadamente 2,8 GB para pesos (tamaño del repo GGUF), más KV-cache; viable en GPUs de consumo con 8 GB o más.
- GPUs recomendadas: para bf16, A100, H100 o RTX 4090 (24 GB); para Q4_K_M, RTX 3060/4060 (8-12 GB) o superiores.
- Cabe en GPU de consumo: sí, especialmente en cuantización Q4_K_M.
- Opciones de despliegue: transformers (formato safetensors), llama.cpp/Ollama (GGUF Q4_K_M), y endpoints compatibles según el tag del repositorio. vLLM y TGI: no confirmado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| moe-expert-datainfra-4b-v4 | 4,3 B | no disponible | Experto SQL/PostgreSQL con GRPO verificado por ejecución | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B (base) | ~4 B | no disponible | Modelo generalista híbrido linear/full attention | no disponible en la información | Hugging Face |
| CodeLlama-7B (referencia de código) | 7 B | 16k (versión estándar) | Generación de código general | Llama 2 custom | Ampliamente disponible |
| SQLCoder (family, referencia SQL) | 7-15 B | no disponible | Text-to-SQL especializado | no disponible en la información | Hugging Face |

La comparación con SQLCoder o CodeLlama es aproximada: no se dispone de benchmarks comunes ni de datos de contexto del modelo evaluado. El punto diferencial del modelo de h3rb3rn es su metodología de entrenamiento (GRPO con recompensa ejecutada) y su integración en un sistema multi-experto, más que un rendimiento absoluto superior.

## Limitaciones y advertencias

- Especialización estrecha: el propio autor indica que la especialización degrada el rendimiento en otras tareas (los resultados de graphrag y precision son inferiores a los de datainfra).
- Dependencia de base de conocimiento externa: sin contexto de KB, el modelo tiende a inventar hechos; debe usarse únicamente con contexto inyectado (KB-first).
- Medición no representativa del artefacto publicado: los resultados se obtuvieron en bf16 sobre LUMI-G, no sobre el GGUF Q4_K_M distribuido, cuya evaluación está pendiente.
- Desajuste de versión en la recompensa: el GRPO se entrenó contra PostgreSQL 16.2, mientras que el test se ejecutó contra PostgreSQL 17.
- Muestras pequeñas y un solo entrenamiento por modelo: el autor reconoce que diferencias de menos de 3 tareas son ruido.
- Idiomas limitados a inglés y alemán; sin soporte documentado de castellano.
- Modelo muy reciente y sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por la comunidad.
- Riesgo de alucinación en SQL: aunque la recompensa se verifica por ejecución durante el entrenamiento, en producción las consultas generadas deben validarse antes de ejecutarse contra bases de datos reales.
- Sin información sobre sesgos, contexto máximo ni tool calling; no apto para producción sin evaluación propia.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B debe verificarse por separado en cuanto a sus términos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/h3rb3rn/moe-expert-datainfra-4b-v4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Perfil del autor: https://huggingface.co/h3rb3rn
- Repositorio TRL (GRPO): no disponible en la información proporcionada
- Paper o blog del sistema MoE-Sovereign: no disponible en la información proporcionada
