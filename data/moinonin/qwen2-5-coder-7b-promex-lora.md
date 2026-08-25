# moinonin/qwen2.5-coder-7b-promex-lora

## Resumen

qwen2.5-coder-7b-promex-lora es un adaptador LoRA desarrollado por moinonin que afina el modelo base Qwen/Qwen2.5-Coder-7B-Instruct para transformar peticiones de funcionalidades en lenguaje natural en especificaciones YAML estructuradas y validadas, conforme a la metodología COMMAND_RUNWAY. El modelo resuelve el problema de generar especificaciones técnicas consistentes y verificables a partir de descripciones ambiguas, un paso crítico en pipelines de desarrollo automatizado.

La relevancia actual radica en que la especificación automática de features es un componente clave en arquitecturas de agentes de código y pipelines de generación asistida, donde la validación previa de requisitos reduce errores en la ejecución posterior. El adaptador, con un tamaño de repositorio de 0.2 GB, se entrena sobre un corpus sintético de 475 prompts distribuidos en 21 categorías de features, generados con el propio modelo base a temperatura 0.2 y validados con un validador YAML endurecido que incluye vocabulario canónico y detección de duplicados.

La arquitectura subyacente es la de Qwen2.5-Coder-7B, un transformer decoder-only con 7.61 mil millones de parámetros y contexto de 128 000 tokens, aunque el entrenamiento del adaptador se realizó con una longitud máxima de secuencia de 2048 tokens. El modelo se distribuye bajo licencia Apache 2.0 y soporta únicamente el idioma inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptadores LoRA |
| Parametros totales | 7.61B (modelo base) + adaptador LoRA (~0.2 GB en safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128K tokens (modelo base); 2048 tokens (entrenamiento del adaptador) |
| Tipos de cuantizacion | NF4 4-bit (entrenamiento), GGUF q4_K_M (inferencia) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-Coder-7B-Instruct es un transformer decoder-only de la familia Qwen2.5, preentrenado sobre un corpus de mas de 5.5 billones de tokens segun el informe tecnico de Qwen2.5-Coder. El adaptador LoRA se entrena con rank 16, alpha 32 y dropout 0.1, aplicado sobre las proyecciones de atencion (q_proj, k_proj, v_proj, o_proj) y las capas de MLP (gate_proj, up_proj, down_proj).

El entrenamiento se realiza durante 3 epocas con learning rate 2e-4, optimizador adamw_8bit, scheduler cosine y warmup ratio 0.1. El batch size efectivo es 4 mediante acumulacion de gradientes. Los datos de entrenamiento se generan de forma sintetica con el propio modelo base a traves de Ollama, a temperatura 0.2, y se validan con un validador YAML endurecido que incluye vocabulario canonico, deteccion de casi-duplicados y comprobaciones de seguridad YAML. El formato de entrenamiento es chat (system + user + assistant).

## Capacidades

- Generacion de especificaciones YAML estructuradas a partir de peticiones de features en lenguaje natural.
- Cada especificacion incluye task_id, summary, depends_on, local_goals, global_goals_refs y context, con un flujo de verificacion Inspect → Create/Modify → Verify para cada objetivo local.
- Validacion automatica contra un validador endurecido que comprueba vocabulario canonico, deteccion de-duplicados y seguridad YAML.
- Puntuacion de runbook-readiness con hard gate (si faltan las etapas Inspect/Create/Verify, la puntuacion es 0.0).
- Capacidades heredadas del modelo base: generacion de codigo en 92 lenguajes de programacion, razonamiento, matematicas y comprension multilingue (aunque el adaptador se entrena solo en ingles).
- Soporte de tool calling y agentes heredado del modelo base Qwen2.5-Coder-7B-Instruct.

## Casos de uso

- **Generacion de especificaciones de features en desarrollo backend**: el modelo convierte peticiones como "Add a POST /health endpoint that returns 200 OK" en especificaciones YAML completas listas para ser validadas, lo que acelera la fase de diseno en proyectos TypeScript/Express/Prisma/Vitest.
- **Automatizacion de pipelines de desarrollo**: las especificaciones generadas pueden alimentar un ejecutor COMMAND_RUNWAY, reduciendo la intervencion manual en la traduccion de requisitos a tareas estructuradas.
- **Asistente para la metodologia COMMAND_RUNWAY**: el adaptador permite a equipos que adoptan esta metodologia generar especificaciones conformes sin escribir YAML manualmente, garantizando consistencia con la verificacion de tres etapas.
- **Generacion de documentacion tecnica de features**: a partir de una descripcion funcional, el modelo produce documentacion estructurada con dependencias, objetivos y contexto, util para repositorios y wikis de proyecto.
- **Validacion de especificaciones YAML existentes**: el modelo puede analizar y puntuar especificaciones previas, detectando carencias en los flujos de verificacion y proponiendo correcciones.
- **Integracion en agentes de desarrollo**: el adaptador puede integrarse en sistemas de agentes que necesiten convertir requisitos de usuario en tareas tecnicas ejecutables, combinando la generacion de especificaciones con las capacidades de code generation del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card menciona metricas internas de validacion: la tasa de validacion (porcentaje de especificaciones que pasan el validador endurecido) y la tasa de puntuacion (porcentaje con score >= 0.75 en el runbook scorer), con un objetivo de >80% de score pass rate en prompts fuera del conjunto de entrenamiento. No se proporcionan valores concretos obtenidos.

## Requisitos de hardware

- El adaptador LoRA añade aproximadamente 0.2 GB de pesos, que se suman a los del modelo base.
- El modelo base de 7.61B en precision FP16 requiere aproximadamente 15-16 GB de VRAM para inferencia; con cuantizacion de 4-bit (NF4 o GGUF q4_K_M) se reduce a 4-6 GB.
- GPU recomendadas: RTX 3090/4090 (24 GB), A100 (40 GB), H100 (80 GB). Con cuantizacion, una GPU de 8 GB (por ejemplo, RTX 4060) es suficiente para inferencia.
- Opciones de despliegue: Ollama (GGUF), llama.cpp, HuggingFace Transformers con PEFT (cargando el adaptador sobre el modelo base), y vLLM para inferencia de alto rendimiento.
- La latencia y el throughput no estan publicados; se estima una generacion de 512 tokens en 10-20 segundos en una GPU consumer con cuantizacion, aunque depende del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| qwen2.5-coder-7b-promex-lora | 7.61B + LoRA | 128K (base) | Apache 2.0 | Adaptador LoRA para especificaciones YAML COMMAND_RUNWAY |
| Qwen2.5-Coder-7B-Instruct | 7.61B | 128K | Apache 2.0 | Modelo base sin adaptador, generacion de codigo general |
| CodeLlama-7B | 6.9B | 16K | Llama 2 (no comercial) | Alternativa de generacion de codigo, sin adaptador especifico |
| DeepSeek-Coder-6.7B | 6.7B | 16K | MIT | Alternativa de generacion de codigo, sin adaptador especifico |

La principal diferencia frente a los modelos base es que este adaptador esta especializado en la tarea concreta de generacion de especificaciones YAML validadas, mientras que los modelos base ofrecen generacion de codigo general. No hay adaptadores equivalentes publicamente conocidos para la metodologia COMMAND_RUNWAY.

## Limitaciones y advertencias

- El corpus de entrenamiento es sintetico y generado por el propio modelo base, por lo que la calidad de las especificaciones esta limitada por la capacidad de generacion del modelo base.
- La granularidad esta limitada a features de un solo archivo y una sola funcionalidad; no soporta epicas de multiples etapas.
- El contexto de la especificacion esta fijado al stack TypeScript/Express/Prisma/Vitest; no se evalua fuera de este contexto.
- La cuantizacion GGUF q4_K_M introduce una degradacion menor de calidad frente al merge en 16 bits.
- El modelo genera especificaciones, no codigo ejecutable; todas las especificaciones deben pasar el validador endurecido antes de usarse.
- Se requiere revision humana antes de alimentar las especificaciones a un ejecutor COMMAND_RUNWAY.
- Solo soporta el idioma ingles; no se ha evaluado su rendimiento en otros idiomas.
- No se han publicado resultados de evaluacion cuantitativa mas alla de las metricas internas de validacion.

## Enlaces

- [HuggingFace: moinonin/qwen2.5-coder-7b-promex-lora](https://huggingface.co/moinonin/qwen2.5-coder-7b-promex-lora)
- [HuggingFace: Qwen/Qwen2.5-Coder-7B](https://huggingface.co/Qwen/Qwen2.5-Coder-7B)
- [Qwen2.5-Coder Technical Report (arXiv)](https://arxiv.org/html/2409.12186v2)
- [Repositorio GitHub: nickrotich/githeri](https://github.com/nickrotich/githeri)
- [Open Laboratory: Qwen 2.5 Coder 7B](https://openlaboratory.com/models/qwen-2_5-coder-7b/)
- [Free2AITools: Qwen2.5 Coder 7b Promex](https://free2aitools.com/model/moinonin/qwen2.5-coder-7b-promex)
