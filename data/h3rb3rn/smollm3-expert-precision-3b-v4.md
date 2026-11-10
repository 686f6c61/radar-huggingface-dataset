# h3rb3rn/smollm3-expert-precision-3b-v4

## Resumen

smollm3-expert-precision-3b-v4 es un ajuste fino de SmolLM3-3B desarrollado por el usuario h3rb3rn como componente especializado del sistema denominado MoE-Sovereign. El modelo asume el rol de "precision", es decir, la ejecución de cálculos exactos mediante Python, dentro de una arquitectura compuesta en la que distintos modelos especializados cubren roles como datainfra (consultas a PostgreSQL) y graphrag (consultas a Neo4j). No se trata de un modelo de propósito general, sino de un experto de dominio entrenado para una tarea concreta dentro de un pipeline multi-modelo.

Técnicamente parte de SmolLM3-3B, un transformer denso de aproximadamente 3.075 millones de parámetros, y se ha entrenado mediante LoRA y GRPO (Group Relative Policy Optimization) sobre LUMI-G, con una función de recompensa verificada por ejecución. El modelo se distribuye también como GGUF Q4_K_M para despliegue local con llama.cpp. La relevancia actual reside en su enfoque: especialización de un modelo pequeño mediante RL con verificación de resultados, en lugar de escalar parámetros, y su integración en un esquema "KB-first" donde el conocimiento factual se delega a una base de conocimiento externa.

El modelo está pensado para invocarse únicamente con contexto de base de conocimiento; sin ella, el autor advierte que tiende a inventar hechos. Su licencia Apache 2.0 permite uso comercial, aunque las métricas publicadas proceden de muestras pequeñas y de un único entrenamiento por modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (base SmolLM3-3B) |
| Parámetros totales | 3.075.098.624 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q4_K_M (publicado); entrenamiento medido en bf16 |
| Idiomas soportados | en, de |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer densa de SmolLM3-3B. Sobre esa base se aplicó un ajuste fino con LoRA y GRPO utilizando TRL, ejecutado en el superordenador LUMI-G. El entrenamiento parte de una mezcla de tareas de aritmética con peso 0,5 combinada con las tres roles del sistema (datainfra, graphrag y precision-v3). La innovación principal es la función de recompensa verificada por ejecución: el resultado se comprueba ejecutando el código Python generado, con crédito parcial de 0, 0,1 + 0,6 × cobertura de líneas, o 1,0 según el grado de acierto. Este esquema de RL con verificación ejecutable es el mecanismo que permite mejorar la precisión aritmética sin aumentar el tamaño del modelo.

El autor subraya que el conocimiento no reside en los pesos: el diseño es "KB-first", de modo que los hechos se recuperan de una base de conocimiento externa y el modelo se limita a razonar y ejecutar sobre ese contexto. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo fases adicionales de alineación más allá del GRPO.

## Capacidades

- Generación de texto y razonamiento orientado a tareas de precisión aritmética y ejecución de cálculos exactos mediante Python.
- Ejecución verificada de código para obtener resultados numéricos exactos en el rol "precision".
- Soporte de conversación multi-turno (pipeline text-generation, tag conversational).
- Capacidades de consulta a bases de datos relacionales (PostgreSQL) en el rol datainfra y a grafos (Neo4j) en el rol graphrag, dentro del sistema compuesto.
- Capacidades multilingües limitadas a inglés y alemán.
- Integración con endpoints compatibles (tag endpoints_compatible).
- No se documentan en la información disponible capacidades de visión, audio, tool calling genérico ni modo de razonamiento extendido ("thinking").

## Casos de uso

- Cálculo aritmético verificado en pipelines de datos: el modelo genera y ejecuta expresiones Python para obtener resultados exactos, validados por ejecución, adecuado para tareas donde un error numérico es costoso.
- Componente de un sistema multi-experto: se integra como el rol "precision" dentro de MoE-Sovereign, delegando consultas SQL a datainfra y consultas a grafos a graphrag, y resolviendo la parte de cálculo.
- Automatización de informes financieros o contables: con contexto de base de conocimiento, puede calcular agregados y ratios exactos sobre datos recuperados, evitando el cálculo aproximado típico de los LLM.
- Asistente interno de operaciones con bases de datos: en combinación con el rol datainfra, permite responder preguntas que requieren tanto recuperación de datos (PostgreSQL 17) como cálculo posterior.
- Despliegue local en hardware modesto: la versión GGUF Q4_K_M permite ejecución en estaciones de trabajo sin GPU de datacenter, útil para entornos con requisitos de soberanía de datos.
- Prototipado de especialización mediante RL: sirve como referencia metodológica para equipos que quieran replicar el esquema LoRA + GRPO con recompensa verificada por ejecución sobre un modelo base pequeño.
- Validación de pipelines de CI/CD para código generado: el mecanismo de recompensa por ejecución es reutilizable como patrón para verificar automáticamente la salida del modelo antes de integrarla en producción.

## Benchmarks y rendimiento

Los datos de medición publicados por el autor corresponden a un test propio de 109 tareas (datainfra 38 contra PostgreSQL 17, graphrag 35 contra Neo4j 5.26, precision 36), medido en bf16 sobre LUMI-G, no sobre la cuantización Q4_K_M.

| Conjunto de evaluación | Tareas | Resultado (greedy) | Resultado (sampling, seed 1) | Base (greedy / sampling) |
|---|---|---|---|---|
| precision | 36 | 29 | 26 | 5 / 7 |
| datainfra | 38 | 8 | 9 | no disponible |
| graphrag | 35 | 1 | 1 | no disponible |
| OOD precisión | 70 | 57 | 55 | 12 / 15 |

El autor indica que diferencias inferiores a 3 tareas son ruido estadístico. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 6,2 GB solo para pesos (3.075 M × 2 bytes), más overhead de KV-cache y activaciones; en la práctica, en torno a 8-10 GB.
- VRAM estimada en GGUF Q4_K_M: aproximadamente 1,8-2,5 GB para los pesos, más KV-cache; viable en GPUs consumer de 4-6 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB para bf16 (RTX 3060 Ti/4060 en adelante); para Q4_K_M, GPUs de 4 GB o superiores.
- Cabe en GPU consumer: sí, tanto en bf16 con GPUs de gama media como en Q4_K_M con GPUs de gama baja.
- Opciones de despliegue: transformers (librería declarada), llama.cpp para el GGUF Q4_K_M, y endpoints compatibles según el tag del repositorio. No se confirma soporte de vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles. El autor indica que la medición de la versión Q4_K_M está pendiente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| smollm3-expert-precision-3b-v4 | 3.075 M | no disponible | Apache 2.0 | safetensors, GGUF | Especializado en precisión aritmética con RL verificado por ejecución; solo en/de |
| SmolLM3-3B (base) | 3.075 M | no disponible | Apache 2.0 | safetensors | Modelo generalista del que deriva; sin especialización de rol |
| Qwen2.5-Coder-3B | 3.000 M aprox. | no disponible | Apache 2.0 | safetensors, GGUF | Orientado a código generalista, no a ejecución verificada de aritmética |
| Llama-3.2-3B | 3.000 M aprox. | no disponible | Llama 3.2 Community License | safetensors, GGUF | Generalista multilingüe; licencia con restricciones de uso comercial |

La comparación con alternativas se limita a características estructurales; no hay datos de benchmarks comunes en la información proporcionada que permitan una comparación cuantitativa directa.

## Limitaciones y advertencias

- Las métricas se midieron en bf16 sobre LUMI-G; la medición de la cuantización Q4_K_M publicada está pendiente, por lo que el rendimiento real del GGUF puede diferir.
- La recompensa de GRPO se ejecutó contra PostgreSQL 16.2 y Neo4j 5.26, mientras que el test se realizó contra PostgreSQL 17; existe un desajuste de versiones entre entrenamiento y evaluación.
- La especialización degrada el rendimiento en otras roles: el propio autor lo reconoce y las cifras de datainfra (8/9 de 38) y graphrag (1/1 de 35) son muy bajas.
- Muestras pequeñas y un único entrenamiento por modelo; diferencias inferiores a 3 tareas se consideran ruido.
- Sin contexto de base de conocimiento, el modelo tiende a inventar hechos; el autor indica que solo debe usarse con KB.
- Riesgo de alucinación en cualquier uso fuera del rol de precisión aritmética.
- Idiomas limitados a inglés y alemán; no se documenta soporte de castellano.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- El modelo es un componente de un sistema mayor (MoE-Sovereign); usarlo de forma aislada no reproduce los resultados del sistema completo.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/h3rb3rn/smollm3-expert-precision-3b-v4
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- SHA-256 del GGUF Q4_K_M: a7bdaf4ed30eaa7eba112d6d0bc4d108ca8c02d83c4377a5684d3fc8aab65029
- No se han encontrado en la información disponible enlaces a papers, blogs, repositorios o demos adicionales.
