# robertbschuette/Qwen3.8-2.4T-A95B

## Resumen

Qwen3.8-2.4T-A95B es un modelo de lenguaje causal de tipo Mixture of Experts (MoE) publicado en abierto como pesos y ficheros de configuración en formato Hugging Face Transformers. Se trata, segun la propia model card, de la primera vez que se libera abiertamente un modelo de la clase Qwen-Max: los pesos corresponden al modelo post-entrenado sobre el que se construye la version oficial Qwen3.8-Max, que añade capacidades adicionales (vision, modo no-thinking, 1M de contexto por defecto y herramientas integradas) y se ofrece a traves de API gestionada. El repositorio concreto está subido por el usuario robertbschuette bajo la licencia "qwen3.8-max".

El modelo totaliza 2.446.182.725.504 parámetros (2,4 billones), de los cuales 95.000 millones se activan por token, con una dimensión oculta de 8192 y 92 capas. Su ventana de contexto es de 262.144 tokens de forma nativa, extensible hasta 1.010.000 tokens. Combina atención lineal (Gated DeltaNet) y atención con puerta (Gated Attention) en un patrón intercalado, junto con 512 expertos por capa MoE.

Es relevante ahora porque traslada a pesos abiertos una arquitectura de escala Max orientada a tareas agénticas de largo horizonte (coding agents, trabajo profesional e investigación), con control flexible de profundidad de razonamiento mediante `reasoning_effort` y retención de contexto de razonamiento histórico mediante `preserve_thinking`. El repositorio es muy reciente (creado el 2026-10-07), sin descargas registradas y con 1 like en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal MoE hibrido (Gated DeltaNet + Gated Attention) |
| Parametros totales | 2.446.182.725.504 (2,4T) |
| Parametros activos | 95B (10 expertos enrutados + 1 compartido por token) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | qwen3.8-max (license: other) |
| Formato de pesos | safetensors (transformers) |

Datos adicionales de configuracion:

| Parametro | Valor |
|---|---|
| Dimension oculta | 8192 |
| Capas | 92 |
| Layout oculto | 23 × (3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE)) |
| Token embedding | 248.320 (padded) |
| LM output | 248.320 (padded) |
| Gated DeltaNet (atencion lineal) | 128 cabezas para V, 16 para QK; dimension de cabeza 128 |
| Gated Attention | 64 cabezas para Q, 4 para KV; dimension de cabeza 256; dim. RoPE 64 |
| MoE | 512 expertos; 10 enrutados + 1 compartido activos; dim. intermedia de experto 2048 |
| MTP | Entrenado con Multi-Token Prediction en varios pasos |
| Tag de arquitectura | qwen3_5_moe_text |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con diseño MoE híbrido que intercala bloques de Gated DeltaNet (atención lineal, con 128 cabezas para el valor y 16 para QK, dimension de cabeza 128) y bloques de Gated Attention (atención convencional con 64 cabezas para Q y 4 para KV, dimension de cabeza 256 y dimensión de RoPE de 64). El patrón se repite 23 veces con la forma 3 × (Gated DeltaNet → MoE) seguido de 1 × (Gated Attention → MoE), lo que da las 92 capas reportadas. Cada capa MoE dispone de 512 expertos, de los que se activan 10 enrutados más 1 compartido, con dimensión intermedia de experto 2048. La dimensión oculta es 8192 y el vocabulario de embeddings y de salida es de 248.320 tokens (con padding). La mezcla de atención lineal y atención con puerta busca eficiencia en secuencias largas manteniendo capacidad de atención precisa.

El modelo pasa por etapas de pre-entrenamiento y post-entrenamiento segun la model card. Se entrena con Multi-Token Prediction (MTP) en varios pasos, lo que habilita decodificación especulativa para acelerar la inferencia. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni los detalles concretos de las etapas de RLHF/DPO. La model card menciona soporte de control flexible de razonamiento (`reasoning_effort`) y retención del contexto de razonamiento de mensajes históricos (`preserve_thinking`), pero no detalla el proceso de alineamiento. Los artefactos se declaran compatibles con vLLM, SGLang y TokenSpeed.

## Capacidades

- Generacion de texto causal conversacional y de proposito general.
- Razonamiento y resolucion de tareas complejas de multiples pasos, con profundidad de razonamiento ajustable mediante `reasoning_effort`.
- Ejecucion agente: planificacion autonoma y manejo de retroalimentacion del entorno para completar tareas de extremo a extremo (segun la model card).
- Coding y tareas de ingenieria de software (los benchmarks reportados incluyen Terminal Bench y SWE-bench Pro).
- Trabajo profesional e investigacion (categorias declaradas en la model card).
- Retencion de contexto de razonamiento historico mediante `preserve_thinking`.
- Capacidades multilingues: no disponible (no se listan idiomas).
- Vision, audio y herramientas integradas: no disponibles en estos pesos; la model card indica que son caracteristicas de la version gestionada Qwen3.8-Max.
- Soporte de tool calling / function calling: no confirmado explicitamente para estos pesos en la informacion disponible.
- Modo no-thinking: segun la model card, es una caracteristica de Qwen3.8-Max, no de estos pesos.

## Casos de uso

- Desarrollo de software asistido y agentes de codigo: el modelo puede abordar tareas de reparacion y edicion de repositorios (el benchmark SWE-bench Pro figura entre los evaluados) y su contexto de 262K tokens nativos permite cargar ficheros y trazas extensas de un proyecto en una sola sesion.
- Agentes autonomos de largo horizonte: con 95B de parametros activos y planificacion reforzada segun la model card, es adecuado para flujos multietapa que consultan herramientas y reaccionan a la retroalimentacion del entorno hasta completar la tarea.
- Analisis de documentacion tecnica extensa: la ventana de 262K tokens nativos (ampliable a 1M) permite procesar informes, patentes o manuales completos junto con preguntas de seguimiento, manteniendo el contexto entre turnos.
- Investigacion asistida: tareas de sintesis bibliografica y razonamiento sobre grandes volumenes de texto, aprovechando la extension de contexto para agregar multiples fuentes.
- Ejecucion de operaciones en terminal y scripts: el benchmark Terminal Bench 2.1 evalua este tipo de tareas, por lo que encaja en pipelines de automatizacion de shell y DevOps.
- Asistentes conversacionales especializados en dominios tecnicos: al ajustar `reasoning_effort` se puede equilibrar latencia y profundidad de razonamiento segun el caso, e integrarse via vLLM/SGLang en servicios con API compatible con endpoints.
- Generacion de codigo en produccion y pipelines de CI/CD: desplegable con vLLM, SGLang o TokenSpeed, con decodificacion especulativa basada en MTP para reducir latencia.
- Trabajo profesional de redaccion tecnica y analisis: tareas de composicion y revision de documentos largos donde el contexto amplio evita truncar material.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados que compara Qwen3.8-Max (la version oficial construida sobre estos pesos) con Opus 4.8, Fable 5, GPT 5.6 Sol (max) y Qwen3.7-Max. La informacion disponible se corta tras la primera categoria (Coding Agent). Los datos disponibles son:

| Benchmark | Opus 4.8 | Fable 5 | GPT 5.6 Sol (max) | Qwen3.7-Max | Qwen3.8-Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 | 84,6 | 84,6 | 88,8 | 74,5 | 86,6 |
| SWE-bench Pro | 69,2 | 80,0 | 64,6 | 60,6 | no disponible (tabla truncada) |

Advertencia: estos resultados corresponden a Qwen3.8-Max, que segun la propia model card añade caracteristicas (vision, modo no-thinking, 1M de contexto, herramientas integradas) no presentes necesariamente en estos pesos. No se han publicado en la informacion disponible resultados de benchmarks especificos para el checkpoint robertbschuette/Qwen3.8-2.4T-A95B. El resto de filas y categorias de la tabla no estan disponibles. No se deben inventar cifras.

## Requisitos de hardware

- Memoria para pesos: el repositorio ocupa 4892,4 GB. En BF16/FP16 (2 bytes por parametro) los 2,4T de parametros requieren en torno a 4,8 TB de VRAM. En FP8 se reduce aproximadamente a 2,4 TB y en cuantizacion de 4 bits a en torno a 1,2 TB.
- GPU recomendadas: despliegue en clúster multi-nodo con GPUs de centro de datos tipo H100, H200, B200 o A100 de 80 GB. No cabe en una sola GPU de 80 GB en ningun formato razonable.
- Consumer GPU: no es viable. Ni siquiera en 4 bits cabe en configuraciones de consumo (RTX 4090 con 24 GB, etc.).
- Opciones de despliegue: la model card indica compatibilidad con vLLM, SGLang y TokenSpeed. El pipeline es text-generation y los pesos estan en safetensors para transformers.
- Aceleracion: soporta MTP (Multi-Token Prediction), lo que permite decodificacion especulativa para mejorar el throughput.
- Latencia y throughput estimados: no disponible. No se aportan cifras de tokens por segundo en la informacion proporcionada.

## Comparativa con modelos similares

La model card establece comparaciones de rendimiento con modelos de referencia, pero no aporta datos de parametros, contexto ni licencia de los mismos. Los datos disponibles son limitados:

| Modelo | Parametros | Contexto | Terminal Bench 2.1 | SWE-bench Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-2.4T-A95B | 2,4T totales / 95B activos | 262.144 (hasta 1M) | no disponible (pesos) | no disponible (pesos) | qwen3.8-max | Pesos abiertos en HuggingFace |
| Qwen3.8-Max | no disponible | 1M por defecto | 86,6 | no disponible | no disponible | API gestionada (Qwen Cloud) |
| Qwen3.7-Max | no disponible | no disponible | 74,5 | 60,6 | no disponible | API gestionada |
| Opus 4.8 | no disponible | no disponible | 84,6 | 69,2 | no disponible | no disponible |
| Fable 5 | no disponible | no disponible | 84,6 | 80,0 | no disponible | no disponible |
| GPT 5.6 Sol (max) | no disponible | no disponible | 88,8 | 64,6 | no disponible | no disponible |

Nota: los resultados de benchmark corresponden a Qwen3.8-Max y no necesariamente a estos pesos. No se dispone de informacion sobre parametros, contexto o licencia de los modelos comparados.

## Limitaciones y advertencias

- Los parametros totales (2,4T) implican requisitos de memoria prohibitivos (en torno a 4,8 TB en BF16), lo que limita su uso a infraestructura de centro de datos.
- La model card no detalla sesgos conocidos, composicion del dataset de entrenamiento ni proceso de alineamiento, lo que dificulta evaluar riesgos de sesgo.
- Riesgo de alucinacion: no se aportan datos especificos, pero es inherente a los modelos de lenguaje generativos de este tipo.
- Idiomas soportados: no disponibles. No se puede garantizar el rendimiento en castellano ni en otros idiomas sin datos.
- Licencia "qwen3.8-max" (license: other): es una licencia personalizada no estandar. Debe revisarse el fichero LICENSE del repositorio antes de cualquier uso comercial, ya que las condiciones no estan detalladas en la informacion disponible.
- Vision, modo no-thinking, herramientas integradas y 1M de contexto por defecto son caracteristicas de Qwen3.8-Max (version gestionada), no necesariamente de estos pesos abiertos.
- El repositorio no registra descargas y tiene 1 like, y esta subido por un tercero (robertbschuette), no por la organizacion oficial Qwen; conviene verificar la procedencia y autenticidad de los pesos antes de usarlos en produccion.
- Los benchmarks publicados corresponden a la version Max, no al checkpoint abierto, por lo que el rendimiento real de estos pesos puede diferir.
- La informacion disponible esta truncada, por lo que puede haber categorias adicionales de benchmark y capacidades no recogidas aqui.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/robertbschuette/Qwen3.8-2.4T-A95B
- Blog de Qwen3.8-Max: https://qwen.ai/blog?id=qwen3.8
- Qwen Studio (chat): https://chat.qwen.ai/?models=qwen3.8-max
- Qwen Cloud: https://www.qwencloud.com
- Qwen3.8-Max Overview: https://www.qwencloud.com/models/qwen3.8-max
