# BRR1154/SLM-ResourceManager-v2

## Resumen

SLM-ResourceManager-v2 es un modelo de lenguaje de 494 millones de parámetros desarrollado por Bhavanam Rajendra Reddy (Runtime-Slayers) como un ajuste fino especializado del modelo base Qwen2.5-0.5B-Instruct. Su propósito declarado es actuar como un planificador de presupuesto de VRAM y ejecución en GPUs, es decir, un modelo pequeño especializado (SLM) orientado a tareas de dimensionamiento de memoria y scheduling de recursos en entornos de inferencia.

El modelo parte del checkpoint v1 del mismo autor y aplica una técnica de consolidación de pesos en subespacios nulos (null-space consolidation) sobre módulos LoRA, con el objetivo de inyectar conocimiento de dominio sin degradar en exceso las capacidades generales del modelo base. La arquitectura subyacente es un transformer decoder-only de la familia Qwen2, con licencia Apache 2.0 y pesos en formato safetensors.

Es relevante ahora porque ejemplifica una tendencia creciente: modelos muy pequeños y especializados que se integran como componentes de sistemas mayores (en este caso, un gestor de recursos para pipelines de inferencia). No obstante, los resultados publicados son modestos y el modelo tiene cero descargas y cero likes en el momento de la ficha, lo que indica que se trata de un artefacto de investigación más que de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con ajuste fino LoRA y consolidación en subespacio nulo |
| Parametros totales | 494.032.768 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Qwen2.5-0.5B-Instruct soporta 32.768 tokens, pero no se confirma para este checkpoint) |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16/safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2, heredado de Qwen2.5-0.5B-Instruct (494M parámetros en BF16). Sobre ese checkpoint se aplicó un ajuste fino con módulos `LoRALinear` reales en PyTorch, con rango LoRA 16, sobre una banda de capas concreta (capas 10 a 23) y cuatro proyecciones por capa: `q_proj`, `v_proj`, `o_proj` y `down_proj`. El entrenamiento consistió en 40 pasos de gradiente, lo que constituye un ajuste muy ligero.

La innovación técnica declarada es la consolidación de los deltas LoRA en el subespacio nulo de las activaciones del modelo base, mediante la proyección ΔW_proj = ΔW − (ΔW·V_base)·V_base^T, con un subespacio SVD empírico de k=24. Según la model card, se mutaron y verificaron 56 de 56 módulos (con hash SHA-256 antes y después de la fusión), con un desplazamiento máximo de Frobenius del 1,532 % y un error de ortogonalidad en el subespacio nulo de 2,648e-09. También se aplicó una calibración de abstención (`ABSTAIN`) basada en errores de activación. No se documentan datos sobre el corpus de entrenamiento (número de tokens, composición del dataset) ni sobre fases de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat compatible con `apply_chat_template`.
- Razonamiento especializado de dominio: dimensionamiento de VRAM y planificación de presupuesto de ejecución en GPUs (tarea `VRAM-Sizing-16`).
- Salida determinista cuando se usa decodificación greedy (`do_sample=False`), tal como recomienda la model card.
- Capacidad de abstención calibrada (`ABSTAIN`) ante errores de activación, orientada a evitar respuestas incorrectas en el dominio.
- Retención parcial de capacidades generales del modelo base (evaluada con ARC-Easy-25).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo de pensamiento (thinking mode).
- Multilingüismo limitado al inglés según la etiqueta de idioma del repositorio.

## Casos de uso

- Planificación de presupuesto de VRAM en pipelines de inferencia: el modelo puede recibir una descripción de la carga de trabajo (tamaño de modelo, precisión, batch size) y devolver una estimación del presupuesto de memoria necesario, aprovechando su entrenamiento específico en la tarea `VRAM-Sizing-16`.
- Componente de scheduling en orquestadores de modelos: integrado como paso previo a un scheduler real, puede proponer asignaciones de recursos que luego se validan con un verificador determinista.
- Pre-filtrado de configuraciones inválidas: dado que incorpora calibración de abstención, puede descartar configuraciones de despliegue que excedan límites de memoria antes de lanzar el proceso real.
- Asistente interno para ingenieros de plataforma: responde consultas en inglés sobre cómo dimensionar instancias GPU para distintos modelos y cuantizaciones, con la salvedad de que sus aciertos en dominio son del 12,5 %.
- Prototipado de investigación sobre consolidación en subespacio nulo: sirve como referencia reproducible de la técnica de fusión LoRA descrita, con telemetría de pesos incluida.
- Evaluación comparativa de retención de capacidades: útil como caso de estudio de cómo un ajuste fino de dominio afecta a benchmarks generales (ARC-Easy) y a la calibración (AA-Omniscience).
- Base para nuevos ajustes especializados: al ser Apache 2.0 y de tamaño reducido (1,0 GB de repo), puede reentrenarse o adaptarse en hardware de consumo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (métricas no verificadas de forma independiente, `verified: false`):

| Benchmark | v1 (baseline) | v2 (este modelo) | Delta |
|---|---|---|---|
| VRAM-Sizing-16 (Domain Execution / Solver Accuracy) | 0,00 % | 12,50 % | +12,50 pts |
| ARC-Easy-25 (Raw) | 64,0 % | 56,0 % | −8,0 pts |
| ARC-Easy-25 (PMI-Calibrated) | 72,0 % | 56,0 % | −16,0 pts |
| AA-Omniscience-12 (Calibration Index) | −25,00 | −8,33 | +16,67 pts |

Los benchmarks se midieron, según la model card, sobre conjuntos de test disjuntos con verificadores reales (`sqlite3`, `z3`, `lxml.html`, `HTMLParser`, `subprocess` de Python y un comprobador de DAG de Kahn).

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1 GB para los pesos (494M parámetros × 2 bytes) más overhead de activaciones y KV cache; en la práctica, cabe holgadamente en 2-4 GB.
- En cuantización de 8 bits: en torno a 0,5 GB de pesos; en 4 bits, en torno a 0,25 GB (estimaciones teóricas, no se publican variantes cuantizadas).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente, incluidas RTX 3060, RTX 4060, RTX 4090; también cabe en GPUs de gama baja y en CPU.
- Cabe en GPU consumer: sí, sin restricciones prácticas por memoria.
- Opciones de despliegue: `transformers` (soporte oficial documentado); el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`, lo que sugiere compatibilidad con TGI y endpoints de Hugging Face. No se documentan instrucciones para vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| SLM-ResourceManager-v2 | 494M | No disponible | Apache 2.0 | Especializado en VRAM/scheduling | Hugging Face (0 descargas) |
| Qwen2.5-0.5B-Instruct | 494M | 32.768 tokens | Apache 2.0 | Modelo generalista conversacional | Hugging Face, ampliamente usado |
| SmolLM2-360M-Instruct | 360M | 8.192 tokens (según versión) | Apache 2.0 | Modelo generalista pequeño | Hugging Face |
| Phi-3-mini (3,8B) | 3,8B | 4.096 tokens | MIT | Modelo generalista pequeño | Hugging Face |

La comparación directa con el modelo base Qwen2.5-0.5B-Instruct es la más pertinente: SLM-ResourceManager-v2 sacrifica retención general (ARC-Easy cae de 64 % a 56 % en crudo) a cambio de una mejora de 12,5 puntos en la tarea de dominio. Frente a otros SLM generalistas, su valor está exclusivamente en el dominio de gestión de recursos, no en capacidades generales.

## Limitaciones y advertencias

- Rendimiento de dominio bajo: solo el 12,5 % de acierto en la tarea principal `VRAM-Sizing-16`, insuficiente para uso autónomo en producción sin verificación externa.
- Degradación de capacidades generales: pérdida de 8 puntos en ARC-Easy crudo y de 16 puntos en la versión calibrada respecto a v1.
- Sesgos conocidos: no documentados por el autor; al derivar de Qwen2.5, hereda los sesgos del corpus de entrenamiento original, no evaluados en esta ficha.
- Riesgo de alucinación: alto en consultas fuera del dominio especializado, dado el escaso ajuste (40 pasos de gradiente) y el reducido tamaño del modelo.
- Limitación de idioma: solo inglés; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Longitud de contexto: no confirmada para este checkpoint; no asumir los 32.768 tokens del modelo base sin verificación.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al derivar de Qwen2.5 conviene revisar los términos del modelo base y las obligaciones de atribución.
- Métricas no verificadas: todos los benchmarks están marcados como `verified: false` y proceden del propio autor; no hay evaluación independiente.
- Madurez: cero descargas y cero likes en el momento de la ficha; sin evidencia de uso en producción ni de comunidad.
- Ausencia de variantes cuantizadas oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos con `llama.cpp` u Ollama sin conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BRR1154/SLM-ResourceManager-v2
- Checkpoint v1: https://huggingface.co/BRR1154/SLM-ResourceManager-v1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- ORCID del autor: https://orcid.org/0009-0005-3349-1162
- Paper, blog o repositorio adicional: no disponible en la información proporcionada.
