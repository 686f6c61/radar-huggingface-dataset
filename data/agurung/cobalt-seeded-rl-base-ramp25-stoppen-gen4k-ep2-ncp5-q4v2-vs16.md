# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-q4v2-vs16

## Resumen

Este repositorio contiene un checkpoint de aprendizaje por refuerzo (RL) construido sobre `Qwen/Qwen3-4B-Instruct-2507`. No se trata de un modelo nuevo entrenado desde cero, sino del resultado de aplicar GRPO directamente sobre el modelo base de Qwen (sin fase previa de SFT supervisado) durante 24 pasos globales de entrenamiento. El autor lo publica como el mejor checkpoint de su ejecución atendiendo a la métrica pass@8.

El objetivo del entrenamiento es mejorar la generación de código verificable: la señal de recompensa es binaria y se asigna 1.0 si el programa generado supera los tests del problema y 0.0 en caso contrario. El conjunto de entrenamiento se seleccionó a partir de una "frontera" de dificultad (`cobalt-train ≤2/64`), formada por 1833 problemas que el modelo base resolvía como máximo en 2 de cada 64 muestras.

Su relevancia es fundamentalmente experimental: documenta una receta concreta de RL sobre modelos pequeños (penalización por truncamiento, penalización DAPO por respuestas demasiado largas y GRPO sin penalización KL) y publica los artefactos resultantes. El repositorio tiene 0 descargas y 0 likes, no declara licencia y no incluye métricas de evaluación del checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-4B-Instruct-2507); ajuste posterior con RL (GRPO) |
| Parametros totales | 4.411.424.256 (~4,41 B) segun el recuento de safetensors |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la ficha del repositorio (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | no disponible; el repositorio publica pesos safetensors sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repositorio no declara licencia) |
| Formato de pesos | safetensors, libreria transformers |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Revision principal | `main` (pesos en la raiz del repositorio) |
| Tamano del repositorio | 44,1 GB |
| Pipeline declarado | text-generation |
| Semilla del entrenamiento | modelo base Qwen3-4B, sin SFT previo (RL aplicado directamente) |
| Paso global guardado | 24 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen3-4B-Instruct-2507, un transformer denso de aproximadamente 4.400 millones de parametros. Sobre esa base no se ha modificado la topologia: lo que cambia son los pesos, actualizados mediante aprendizaje por refuerzo con el algoritmo GRPO (ventajas normalizadas por grupo, sin penalización KL). El entrenamiento se sembró directamente sobre el modelo base, sin una fase intermedia de ajuste supervisado.

La receta documentada incluye varios detalles relevantes. Se generan 8 muestras por prompt, con tamano de lote de rollout y de entrenamiento de 128, un maximo de 4096 tokens nuevos por rollout, 2 episodios y una tasa de aprendizaje constante de 1e-6. La recompensa es binaria (correccion del codigo frente a los tests). Se aplican dos mecanismos de control de longitud: una penalizacion estilo ProRL que asigna -1.0 a las muestras truncadas y una penalizacion DAPO que penaliza de forma aditiva y creciente hasta -0.25 las respuestas situadas en los ultimos 1024 tokens antes del limite. El conjunto de datos de entrenamiento es la frontera `cobalt-train ≤2/64`, con 1833 problemas de entrenamiento y 112 de validacion, seleccionados por ser resueltos por el modelo base en como maximo 2 de 64 muestras. No se especifica la composicion linguistica ni el origen del dataset en la informacion disponible.

## Capacidades

- Generacion de codigo: es el objetivo explicito del entrenamiento, con recompensa basada en la superacion de tests de cada problema.
- Razonamiento orientado a problemas de programacion: el modelo se ha optimizado sobre problemas de dificultad alta para el modelo base (frontera ≤2/64), lo que lo orienta a tareas donde la solucion no es inmediata.
- Generacion de texto general y capacidades conversacionales: heredadas del modelo base Qwen3-4B-Instruct-2507, no verificadas especificamente en este checkpoint.
- Modo de razonamiento explicito (thinking) y soporte de tool calling o function calling: atribuibles al modelo base, pero no documentados ni evaluados en esta ficha de modelo.
- Capacidades multilingues: no disponibles; la model card no documenta idiomas soportados.
- Capacidades de agente y razonamiento multi-paso: no disponibles; no se han publicado evaluaciones al respecto para este checkpoint.

## Casos de uso

- Asistente de programacion en el IDE: el checkpoint esta especializado en producir codigo que supere pruebas automatizadas, por lo que encaja en tareas de completado y resolucion de funciones con contratos de entrada/salida bien definidos.
- Resolucion de problemas de programacion competitiva: el entrenamiento se realizo sobre problemas que el modelo base apenas resolvia, lo que lo hace adecuado como base para experimentos de pass@k en entornos con juez automatico.
- Generacion de tests unitarios y casos de prueba: al haberse optimizado contra una senal de correccion binaria, tiende a producir codigo comprobable, lo que facilita su uso para generar baterias de pruebas complementarias.
- Investigacion en RL para modelos pequenos: el repositorio publica la receta completa (GRPO, penalizacion por truncamiento, penalizacion DAPO) y registra los logs en Weights & Biases, por lo que sirve como punto de partida reproducible para estudiar el efecto del RL sin SFT previo.
- Fine-tuning posterior sobre dominios concretos: al ser un checkpoint intermedio (paso global 24) sobre un modelo de 4B, es un candidato razonable para continuar el entrenamiento con SFT o RL especifico de un dominio.
- Automatizacion de tareas de refactorizacion y generacion de scripts: para pipelines internos que requieran transformar codigo existente o producir utilidades en Python o shell, sujeto a validacion posterior con tests propios.
- Tutoria y evaluacion educativa de programacion: puede emplearse para generar soluciones de referencia que despues se validan con un runner de tests, siempre que se revise el resultado antes de exponerlo a estudiantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las metricas de evaluacion de este checkpoint no estaban disponibles en el registro de entrenamiento. La unica afirmacion cuantitativa es relativa: es el mejor checkpoint de la ejecucion `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp5_q4v2_vs16` segun pass@8, sin que se publique el valor absoluto de esa metrica.

## Requisitos de hardware

Estimaciones derivadas del numero de parametros (4,41 B); el repositorio no publica mediciones de latencia ni de throughput.

- VRAM para inferencia en bf16/fp16: aproximadamente 8,8 GB solo de pesos, mas la cache KV correspondiente al contexto configurado. Con contextos cortos (4K-8K) el consumo total se situa en torno a 10-12 GB.
- VRAM en fp32: aproximadamente 17,6 GB de pesos.
- VRAM con cuantizacion de 8 bits: en torno a 4,5-5 GB.
- VRAM con cuantizacion de 4 bits (GPTQ, AWQ o GGUF Q4_K_M): en torno a 2,5-3 GB, aunque estos formatos no se distribuyen en el repositorio y requeririan conversion.
- GPU recomendadas: A100 (40/80 GB) o H100 para servicio en bf16 con contextos largos y concurrencia; RTX 4090 (24 GB) para bf16 en un solo flujo; RTX 3060 (12 GB) o similares para cuantizacion de 8 o 4 bits.
- Cabe en GPU de consumo: si, en tarjetas de 12 GB o mas con cuantizacion, y en bf16 en GPUs de 16-24 GB con contexto moderado.
- Opciones de despliegue: transformers (`AutoModelForCausalLM` con `revision="main"`), vLLM (`vllm serve ... --revision main`) y text-generation-inference, etiquetado como `endpoints_compatible` en el repositorio. Para llama.cpp u Ollama seria necesario convertir previamente los pesos a GGUF, ya que el repositorio solo publica safetensors.
- Latencia y throughput: no disponibles.
- Nota de almacenamiento: el repositorio ocupa 44,1 GB, muy por encima de los aproximadamente 8,8 GB de pesos en bf16, por lo que probablemente incluye artefactos adicionales (copia en fp32, estados del optimizador u otras revisiones). Conviene revisar el contenido antes de descargarlo completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de ajuste | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-q4v2-vs16 | ~4,41 B | no disponible | RL con GRPO sobre el modelo base, orientado a correccion de codigo | no disponible | HuggingFace, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | ~4 B (nominal) | no disponible en esta busqueda | Instruct, con SFT y ajuste posterior | no disponible en esta busqueda | HuggingFace |
| agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-iid30 (checkpoint hermano) | no disponible | no disponible | RL con GRPO, otra configuracion de muestreo | no disponible | HuggingFace, listado en Featherless |
| Qwen2.5-Coder-7B-Instruct (alternativa de codigo, otro tamano) | ~7 B | no disponible | Instruct especializado en codigo | no disponible en esta busqueda | HuggingFace |

No se dispone de valores de benchmarks comparativos entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia, lo que impide determinar si el uso comercial esta permitido. Es un bloqueo objetivo para cualquier despliegue en produccion hasta que el autor lo aclare.
- Sin metricas de evaluacion publicadas: no hay ningun numero absoluto de rendimiento (pass@8, HumanEval, MMLU ni equivalentes), solo la afirmacion de que es el mejor checkpoint de su propia ejecucion.
- Checkpoint intermedio: corresponde al paso global 24 de una ejecucion de RL, no a un modelo final pulido ni a una version con ajuste supervisado posterior.
- Riesgo de sobreajuste al conjunto de entrenamiento: los 1833 problemas de la frontera `cobalt-train ≤2/64` son el unico origen de la senal de recompensa; el comportamiento fuera de ese tipo de tareas no esta caracterizado.
- Optimizacion contra tests: la recompensa es binaria y depende de superar pruebas, lo que puede favorecer soluciones que se ajusten al conjunto de tests en lugar de a la especificacion real del problema.
- Idiomas no documentados: no hay informacion sobre el soporte multilingue efectivo tras el RL; el entrenamiento se centra en problemas de codigo.
- Riesgo de alucinacion: no evaluado; al ser un modelo de 4B, la verificacion automatica del codigo generado sigue siendo recomendable en cualquier flujo de produccion.
- Capacidades de tool calling y de agente no verificadas en este checkpoint: aunque el modelo base las soporta, no se han validado tras el ajuste por refuerzo.
- Repositorio de gran tamano: 44,1 GB, con varios artefactos ademas de los pesos, lo que complica su descarga, versionado y despliegue en entornos con almacenamiento limitado.
- Comportamiento de longitud condicionado: las penalizaciones por truncamiento (-1.0) y por respuestas largas (hasta -0.25 en los ultimos 1024 tokens) pueden haber sesgado la verbosidad del modelo, especialmente en tareas ajenas a la generacion de codigo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-q4v2-vs16
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Listado de modelos recientes en Featherless (incluye otros checkpoints de agurung): https://featherless.ai/models?page=35&release_recency=30d
- Catalogo de modelos autoalojados con requisitos de VRAM y cuantizacion: https://local-ai-models.ai/local-ai-models.html
- Logs de entrenamiento: proyecto `eaiexp-paper-final` de Weights & Biases, ejecucion `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp5_q4v2_vs16` (no se proporciona URL directa en la model card)
- Log local de entrenamiento: `experiments/cobalt_qwen3_4b_ft/rl_runs/qwen3_4b_instruct_2507_cobalt_v1/seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp5_q4v2_vs16/openrlhf_train.log` (ruta interna, no accesible publicamente)
- OpenRLHF: framework utilizado para el entrenamiento (no se proporciona URL en la model card)
