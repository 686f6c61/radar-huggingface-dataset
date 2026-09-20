# asatheesh/latent-mas-aligner-phi3-mini-seed-2

## Resumen

LatentMAS Aligner (checkpoint phi3-mini, topología secuencial, semilla 2) es un artefacto de investigación desarrollado por el usuario asatheesh para estudiar la seguridad en sistemas multiagente (MAS) cuyos agentes se comunican en espacio latente en lugar de lenguaje natural. El problema que aborda es concreto: cuando los mensajes entre agentes son estados ocultos y no texto, los moderadores basados en texto no pueden leerlos sin decodificar cada latente a tokens, lo que anade coste y latencia. Este alineador lee directamente los latentes pre-Judger y los proyecta al espacio de representación de una cola clasificadora Llama-Guard congelada, produciendo una probabilidad `p_unsafe` para la comunicación.

El modelo no es un LLM generativo, sino un módulo de cabecera que se acopla a un sistema multiagente existente: recibe un tensor de latentes `[B, K, 2560]`, aplica una única query aprendible que atiende sobre los K tokens latentes, proyecta a dimensión 4096 y entrega esa representación a una cola Llama-Guard-3-8B congelada que no se incluye en el repositorio. El checkpoint está entrenado específicamente sobre latentes de `microsoft/Phi-3-mini-4k-instruct` (dimensión de activación 3072), aunque la model card menciona también entrenamiento sobre latentes de `Qwen/Qwen3-4B` con `d_a=2560`, lo que constituye una inconsistencia documentada más abajo.

Su relevancia actual es metodológica: forma parte de un estudio de topología x semilla sobre LatentMASHarmBench, y su principal innovación es que una sola query de pooling, al atender sobre un número variable de tokens latentes, permite reutilizar el mismo checkpoint con cualquier número de agentes N sin reentrenar ni reformar tensores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabecera de clasificación sobre transformer con pooling por query aprendible (single learnable query attention) + cola Llama-Guard-3-8B congelada |
| Parametros totales | no disponible (el repositorio ocupa 0,1 GB en total) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica directamente; el modelo opera sobre K tokens latentes (K = 8 pasos latentes x numero de agentes pre-Judger). El modelo base Phi-3-mini-4k-instruct tiene 4K tokens de contexto |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`aligner.pt`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El componente entrenable es una cabecera ligera: recibe `h_a`, los latentes pre-Judger con forma `[B, K, 2560]` (siendo K = 8 pasos latentes multiplicado por el número de agentes pre-Judger), aplica una única query aprendible que atiende sobre los K tokens latentes, pasa por una dimensión oculta de 4096 y produce una salida `[B, 4096]`. Esa salida se entrega a la cola de un clasificador Llama-Guard-3-8B congelado, que genera la distribución final de la que se extrae `p_unsafe`. La ventana de atención es variable porque la query es única y atiende sobre un número arbitrario de tokens, de modo que un mismo checkpoint sirve tanto para cadenas de 3 agentes como para DAGs branch-and-fuse de 9 agentes sin reentrenamiento ni reshaping.

El entrenamiento se realizó sobre rollouts secuenciales de MAS latentes con 3 agentes y etiquetas de cumplimiento de daño (harm-compliance), con pesos de clase 1:10, 60 épocas, learning rate 3e-4, batch de 512 y semilla 2. No se documentan el número total de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO. El modelo base declarado es `microsoft/Phi-3-mini-4k-instruct` con `d_a=3072`, pero la sección de uso previsto indica que está entrenado sobre latentes de `Qwen/Qwen3-4B` en `d_a=2560`, y la tabla de arquitectura declara la entrada como `[B, K, 2560]` mientras que la tabla del checkpoint declara `d_a=3072`. Estas discrepancias no están resueltas en la documentación disponible.

## Capacidades

- Detección de riesgo en comunicaciones entre agentes que operan en espacio latente, sin necesidad de decodificar los latentes a texto.
- Producción de una puntuación escalar `p_unsafe` por comunicación, obtenida mediante softmax sobre la salida de la cola Llama-Guard congelada.
- Inyección de un aviso de seguridad antes del agente agregador final cuando `p_unsafe` supera un umbral `tau` configurable.
- Generalización a un número variable de agentes N sin reentrenamiento, gracias al pooling por query única sobre K tokens latentes.
- Compatibilidad declarada con al menos dos topologías de MAS (cadena secuencial de 3 agentes y DAG branch-and-fuse de 9 agentes).
- No soporta tool calling, function calling, agentes autónomos, generación de texto, código, matemáticas, visión, audio ni modo de razonamiento explícito: es un clasificador de seguridad, no un modelo generativo.
- Capacidades multilingües: no disponible.

## Casos de uso

- Moderación de comunicaciones en sistemas multiagente con latentes compartidos: el alineador lee los estados ocultos pre-Judger y calcula `p_unsafe`, evitando el coste de decodificar cada mensaje latente a tokens antes de aplicar un filtro textual.
- Investigación en seguridad de MAS: permite estudiar empíricamente la relación entre topología de comunicación (secuencial, branch-and-fuse) y tasa de comunicaciones dañinas, reutilizando el mismo checkpoint entre configuraciones.
- Auditoría de pipelines de agentes en producción: como paso previo al agente agregador, se puede registrar `p_unsafe` por turno y establecer alertas cuando la distribución se desplace respecto a la calibración inicial.
- Intervención selectiva con aviso de seguridad: en lugar de bloquear la conversación completa, se inyecta una notificación antes del agregador final, preservando la utilidad del sistema cuando la puntuación es baja.
- Comparación de puntos de operación coste-seguridad: ajustando `tau` sobre tráfico benigno propio se puede fijar una tasa de falsos positivos objetivo (por ejemplo, el percentil 95 para un 5 % de marcado en prompts benignos).
- Reproducción de experimentos de LatentMASHarmBench: el checkpoint incluye semilla y topología declaradas, lo que permite replicar la comparativa entre semillas y topologías del repositorio de origen.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Val AUC | 0,9105 |
| `tau` @ fpr10 | 0,7090191245 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las dos métricas anteriores corresponden únicamente a la partición de validación de este propio modelo, no a un conjunto de evaluación externo.

## Requisitos de hardware

- El repositorio del alineador ocupa 0,1 GB; el componente entrenable es una cabecera ligera y su huella de memoria es despreciable frente a la del clasificador.
- La cola Llama-Guard-3-8B no se incluye y debe aportarse por separado. Como referencia orientativa (no confirmada en la documentación del modelo), un modelo de 8B en bf16 requiere del orden de 16 GB de VRAM solo para pesos, más overhead de activaciones y caché.
- GPU recomendadas (estimación orientativa para la cola de 8B): A100 40 GB, H100 80 GB, L40S 48 GB, RTX 4090 24 GB (ajustado en bf16 o cuantizado).
- Cabe en GPU de consumo si la cola Llama-Guard se cuantiza: una RTX 4090 de 24 GB o una RTX 3090 de 24 GB deberían ser suficientes para el clasificador de 8B en precisión reducida.
- Opciones de despliegue: PyTorch con `torch.load` sobre `aligner.pt` y el cargador `build_aligner_from_bundle` del repositorio de código; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| asatheesh/latent-mas-aligner-phi3-mini-seed-2 | Cabecera clasificadora sobre latentes + cola Llama-Guard-3-8B congelada | no disponible (repo de 0,1 GB) | K tokens latentes variables | Apache 2.0 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| YuanXiaopang/latentmas-aligner-qwen3-4b | Alineador de la misma familia, otras topologias y semillas | no disponible | no disponible | no disponible | HuggingFace |
| Llama-Guard-3-8B | Clasificador de seguridad sobre texto | 8B | no disponible | no disponible | HuggingFace |

No se dispone de información suficiente sobre modelos comparables de la misma categoría (alineadores de seguridad para MAS en espacio latente) para establecer una comparativa cuantitativa de rendimiento. La comparación con Llama-Guard-3-8B es funcional, no de métricas: este alineador reutiliza su cola pero opera sobre latentes en lugar de texto.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se documenta ninguna evaluación de sesgo sobre subgrupos, idiomas o dominios.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos en la clasificación, cuyo impacto depende enteramente del umbral `tau` elegido.
- El umbral `tau` no es una propiedad fija del modelo y no transfiere entre checkpoints: distintas semillas producen valores brutos de `tau` diferentes para el mismo punto de operación. La calibración debe hacerse sobre tráfico benigno propio, preferiblemente por cuantiles de `p_unsafe`.
- Los umbrales calibrados sobre una partición de validación no transfieren de forma fiable a producción, porque las distribuciones de puntuación difieren.
- Restricción de transferencia entre modelos: el alineador está entrenado sobre latentes de una dimensión y convención concretas. No funcionará con modelos de tamaño oculto distinto sin reentrenamiento.
- Inconsistencia documental no resuelta: la tabla de arquitectura declara entrada `[B, K, 2560]` y entrenamiento sobre `Qwen/Qwen3-4B` (`d_a=2560`), mientras que la tabla del checkpoint y el modelo base declarado corresponden a `Phi-3-mini-4k-instruct` (`d_a=3072`). El ejemplo de uso del propio autor indica `h_a: [B, K, 3072]`. Conviene verificar la dimensión real antes de desplegar.
- El texto de la model card se autodenomina "sequential-topology, seed-1 checkpoint" mientras que el título y la tabla indican semilla 2. Discrepancia sin resolver.
- La cola Llama-Guard-3-8B congelada no se distribuye con el checkpoint; el usuario debe aportar su propio bundle, lo que introduce variabilidad en los resultados según la versión empleada.
- Es un artefacto de investigación: no ha sido evaluado como sistema de moderación autónomo ni de propósito general, y no debería usarse como única capa de seguridad en producción.
- Licencia Apache 2.0, que permite uso comercial del artefacto, pero las condiciones de la cola Llama-Guard y del modelo base subyacente deben verificarse por separado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día (2026-09-19), sin validación de la comunidad.
- Los resultados de búsqueda web obtenidos no contienen información relevante sobre este modelo: los enlaces devueltos corresponden a servicios de cartografía de Japón y no guardan relación con el artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/asatheesh/latent-mas-aligner-phi3-mini-seed-2
- Repositorio de código LatentMASHarmBench: https://github.com/Asatheesh6561/LatentMASHarmBench
- Repositorio de origen con otras topologías y semillas: https://huggingface.co/YuanXiaopang/latentmas-aligner-qwen3-4b
- Modelo base: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct
