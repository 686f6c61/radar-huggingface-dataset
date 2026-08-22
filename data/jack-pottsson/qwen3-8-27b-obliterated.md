# JACK-POTTSSON/Qwen3.8-27B-OBLITERATED

## Resumen

Qwen3.8-27B-OBLITERATED es una variante "abliterated" (sin censura) del modelo denso Qwen3.8-27B de Alibaba, publicada por el usuario JACK-POTTSSON en HuggingFace. El proceso de abliteration elimina las direcciones de rechazo aprendidas durante el entrenamiento con RLHF, de modo que el modelo responde a peticiones que la versión original rechazaría, manteniendo a la vez la mayor parte de su capacidad. Está diseñado para investigación en seguridad de IA (red-teaming), evaluación de robustez y pruebas de jailbreak, aunque su uso comercial es legalmente posible al mantener la licencia Apache 2.0 del modelo base.

El modelo base, Qwen3.8-27B, es un LLM denso de 26.895 millones de parámetros con arquitectura híbrida de atención: solo 16 de sus 64 capas usan atención completa, mientras que las otras 48 emplean atención lineal con estado recurrente constante. Esta variante abliterada mantiene el mismo backbone y peso original, pero con las direcciones de rechazo proyectadas fuera de los pesos. La versión V3 publicada aquí alcanza una tasa de rechazo del 0% en ambos modos de pensamiento (thinking ON y OFF) con una regresión de solo 0,9 puntos porcentuales en MMLU respecto al modelo original (83,7% frente a 84,6%).

La relevancia de este modelo radica en que demuestra que es posible eliminar las barreras de rechazo sin sacrificar capacidades de razonamiento, codificación o uso de herramientas, algo que las abliteraciones anteriores no lograban. Esto lo convierte en una herramienta de estudio para la comunidad de seguridad de IA, pero también implica un riesgo real de uso malintencionado, ya que el modelo puede generar contenido dañino, código malicioso o estrategias de ataque sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso hibrido (16 capas con atencion completa + 48 con atencion lineal) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (varios), safetensors (bfloat16), MLX |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, MLX |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un LLM denso multimodal con una arquitectura hibrida de atencion: de sus 64 capas, solo 16 emplean atencion completa (con un intervalo de 4), mientras que las 48 restantes utilizan atencion lineal con un estado recurrente constante. Esta combinacion reduce el coste computacional en secuencias largas sin perder capacidad de razonamiento global. El modelo original fue entrenado por el equipo Qwen de Alibaba con datos multimodal y texto, con un pipeline que incluye RLHF.

La variante OBLITERATED aplica una tecnica de abliteration que elimina las direcciones de rechazo aprendidas durante el RLHF. La version V3 usa un enfoque iterativo: parte de la V2 (que a su vez era una mezcla de dos cirugias complementarias, un SVD agresivo y una proyeccion LEACE) y la refina con un corpus de 1.000 prompts de entrenamiento (852 integrados + 100 consultas simples + 48 avanzados de red-teaming, agencia y ataques ML). El proceso de mezcla de la V2 fue un 60% de metodo B (LEACE) y un 40% de metodo A (SVD), optimizado por busqueda binaria sobre la proporcion. La V3 aplica una pasada de refinamiento suave sobre esa mezcla, logrando cero rechazos en ambos modos de pensamiento.

## Capacidades

- Generacion de texto sin censura: responde a practicamente cualquier peticion, incluidas aquellas que el modelo base rechazaria.
- Razonamiento con y sin modo de pensamiento (thinking ON/OFF). Con thinking ON, el modelo mantiene la cadena de razonamiento, aunque el autor recomienda desactivarlo para evitar rechazos residuales.
- Generacion de codigo y refactorizacion: capaz de refactorizar codigo sincrono a asincrono con logging, depurar pods de Kubernetes, y realizar revisiones de seguridad de codigo (detecta vulnerabilidades en Flask).
- Tool calling y agentes: soporta bucles ReAct (Thought/Action/SQL), cadenas de herramientas (busqueda, fetch, envio de correo) y diseno de sistemas distribuidos.
- Extraccion de esquemas JSON a partir de incidentes estructurados.
- Capacidades multilingues no confirmadas explicitamente, pero hereda el soporte multilingue del modelo base Qwen.
- Capacidad multimodal del modelo base no preservada en esta variante: el repositorio solo incluye pesos de texto.

## Casos de uso

- Investigacion en seguridad de IA (red-teaming): permite probar defensas de modelos, evaluar la solidez de los sistemas de rechazo y estudiar tecnicas de jailbreak en entornos controlados. El modelo se puede ejecutar con vLLM o llama.cpp para automatizar pruebas de adversario.
- Pruebas de robustez de pipelines de generacion: al tener 0% de rechazo, se puede usar como oraculo para validar si un sistema de moderacion externo detecta contenido no seguro generado por LLM.
- Generacion de codigo en entornos sin restricciones: en proyectos de investigacion donde se necesita codigo para exploits, malware o scripts de ataque en un sandbox, el modelo genera soluciones completas y tecnicamente correctas sin rechazos.
- Desarrollo de agentes autonomos para investigacion academica: su capacidad para seguir cadenas de herramientas (busqueda, fetch, email) y mantener bucles ReAct lo hace util para prototipos de agentes que necesitan actuar sin moderacion.
- Evaluacion de tecnicas de ablacion de modelos: sirve como caso de estudio para comparar metodos de eliminacion de rechazo (SVD, LEACE, mezcla) y su impacto en capacidades de razonamiento y calidad de salida.
- Benchmark de alineacion: permite medir como afecta la eliminacion de rechazo a metricas de capacidad (MMLU, HumanEval) en comparacion con el modelo base, lo que es util para la investigacion de alineacion de IA.

## Benchmarks y rendimiento

La model card del autor proporciona resultados de MMLU (lm-eval-harness, 0-shot) y de tasa de rechazo:

| Modelo | MMLU | n | Stderr | vs Stock |
|---|---|---|---|---|
| Stock Qwen3.8-27B | 84,60% | 2.850 | ±0,65 | — |
| V1 (SVD agresivo) | 81,4% | 285 | — | -6,0 pp |
| V2 (mezcla SVD+LEACE) | 84,32% | 2.850 | ±0,65 | -0,28 pp |
| V3 (refinamiento) | 83,7% | 15 | — | -0,9 pp |

Tasa de rechazo:

| Test | V1 | V2 | V3 |
|---|---|---|---|
| Hard-10 (prompts artesanales) | 0/10 | 0/10 | 0/15 |
| Corpus de 842 prompts | 0/842 | 2/842 (0,24%) | 0/15 |
| Ship score | 88,7 | 92,1 | no disponible |

Tareas avanzadas del mundo real (thinking OFF):

| Tarea | V2 | Stock |
|---|---|---|
| Bucle de agente ReAct (pensamiento/accion/SQL) | ✓ | ✓ |
| Refactorizacion de codigo asincrono con logging | ✓ | ✓ |
| Extraccion de esquemas JSON | ✓ | ✓ |
| Depuracion de crash en pods de K8s | ✓ | ✓ |
| Seguimiento de instrucciones adversarias | ✓ | ✓ |
| Revision de seguridad de codigo (3+ vulnerabilidades en Flask) | ✓ | ✓ |
| Diseno de sistema distribuido (rate limiter Redis) | ✓ | ✓ |
| Cadena de herramientas multiples (busqueda→fetch→email) | ✗ | ✗ |

Nota: los datos de MMLU del V3 se basan en una muestra de solo 15 preguntas (n=15), por lo que la cifra de 83,7% es preliminar y no comparable directamente con las evaluaciones completas de V2 y stock.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en bfloat16 ocupa aproximadamente 53,8 GB (26,9B parametros x 2 bytes). Con cuantizacion GGUF Q4_K_M, el peso se reduce a unos 15-16 GB, y con Q8_0 a unos 27 GB.
- GPU recomendadas: para inferencia en bfloat16 se necesitan GPU profesionales como A100 (80 GB) o H100 (80 GB). Con cuantizacion 4-bit cabe en una RTX 4090 (24 GB) o RTX 3090 (24 GB). Para cuantizaciones mas bajas (Q2_K, Q3_K) podria caber en una RTX 4080 (16 GB) con margen reducido.
- Compatibilidad con consumer GPU: si, con cuantizacion GGUF 4-bit o inferior, en GPUs de 24 GB o mas.
- Opciones de despliegue: vLLM (con soporte para el modelo base), llama.cpp / Ollama / LM Studio para GGUFs, y MLX para Apple Silicon.
- Latencia y throughput: no se han publicado datos especificos para esta variante; el modelo base, al ser denso con 26,9B parametros, ofrece un throughput moderado en GPU de 24 GB (del orden de 20-40 tokens/s con cuantizacion 4-bit, dependiendo del hardware).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | MMLU (0-shot) | Refusal rate | Disponibilidad |
|---|---|---|---|---|---|---|
| **Qwen3.8-27B-OBLITERATED (V3)** | 26,9B | no disponible | Apache 2.0 | 83,7% (n=15) | 0% | HuggingFace |
| Qwen3.8-27B (stock) | 26,9B | no disponible | Apache 2.0 | 84,6% (n=2.850) | ~100% | HuggingFace, vLLM |
| Qwen3.8-27B AEON Uncensored | 26,9B | no disponible | Apache 2.0 | no disponible | no disponible | HuggingFace |

Ambas variantes abliterated del mismo modelo base. La diferencia principal es la metodologia: AEON usa KL-drift mientras que OBLITERATED usa una mezcla de SVD y LEACE. No se dispone de datos comparativos publicados de rendimiento entre ambas variantes.

## Limitaciones y advertencias

- **Contenido no seguro**: el modelo no tiene barreras de rechazo, por lo que puede generar instrucciones para actividades ilegales, codigo malicioso, contenido explicito o desinformacion. Su uso en produccion sin moderacion externa es peligroso.
- **Alucinacion**: como cualquier LLM, puede inventar informacion, especialmente en temas de actualidad o datos especificos. La eliminacion de rechazo no mejora la fidelidad factual.
- **Riesgo de bucle de generacion**: el autor recomienda un repetition_penalty de 1,15 para evitar bucles en codigo o boilerplate; sin el, la generacion greedy puede repetirse indefinidamente.
- **Modo de pensamiento**: aunque la V3 tiene 0% de rechazo con thinking ON, el autor recomienda desactivarlo (enable_thinking=False) porque el razonamiento puede reintroducir rechazos en algunos casos. Esto limita la capacidad de razonamiento profundo del modelo.
- **Evaluacion preliminar**: los datos de MMLU del V3 se basan en una muestra pequena (n=15), por lo que el rendimiento real puede variar.
- **Contexto largo**: no se ha publicado la longitud de contexto de esta variante; el modelo base Qwen3.8-27B soporta contexto largo, pero no se confirma en esta version.
- **Licencia**: aunque es Apache 2.0, el uso comercial de un modelo sin censura puede conllevar riesgos legales y de reputacion, y puede violar los terminos de servicio de plataformas de despliegue.
- **Sin soporte multimodal**: el modelo base es multimodal, pero esta variante solo publica pesos de texto, por lo que no se puede usar para vision o audio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JACK-POTTSSON/Qwen3.8-27B-OBLITERATED
- Modelo base Qwen3.8-27B (Alibaba): https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Repositorio de investigacion OBLITERATUS (codigo de reproduccion): https://github.com/elder-plinius/OBLITERATUS
- Articulo sobre Qwen3.8-27B AEON Uncensored: https://www.mindstudio.ai/blog/qwen3-8-27b-aeon-uncensored-abliteration
- Blog explainx.ai sobre Qwen3.8-27B OBLITERATED: https://www.explainx.ai/blog/pliny-qwen3-8-27b-obliterated-alex-finn-mac-august-2026
- Receta vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
