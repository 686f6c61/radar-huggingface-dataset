# mr-andrey-isachenko/Tenet-12B-Nemo-Unslop-v1

## Resumen

Tenet-12B-Nemo-Unslop-v1 es un ajuste fino (fine-tune) del modelo Mistral-Nemo-Instruct-2407 de Mistral AI, desarrollado por el usuario independiente mr-andrey-isachenko. El modelo parte de la arquitectura transformer densa de Mistral-Nemo (12.247.782.400 parametros) y aplica una tecnica propia denominada Lancet, que realiza una cirugia de subespacios en las proyecciones de entrada (residual stream) y salida (unembedding) para eliminar la direccion de rechazo preservando la norma de las activaciones. El objetivo declarado es reducir los rechazos falsos positivos ante peticiones benignas y el "slop" estilistico (prosa recargada, preambulos moralizantes) sin degradar las capacidades de razonamiento, codigo y uso de herramientas del modelo base.

Tras la cirugia, el autor aplica un pase de GRPO con compuertas ("gated unslop GRPO") que penaliza patrones de slop solo en las regiones donde la cirugia debilito los circuitos de rechazo, y finaliza con una cuantizacion FP8 (E4M3) y una fusion TIES segura respecto a subespacios. El resultado se distribuye como checkpoint listo para proveedores de inferencia, sin codigo personalizado ni `trust_remote_code`, compatible con vLLM, GGUF y MLX.

El modelo es relevante para quienes necesitan un asistente de 12B con contexto largo (heredado de Mistral-Nemo), capacidades agenticas y de tool calling, y un comportamiento menos restrictivo ante prompts tecnicos legitimos (seguridad, SQL, analisis de logs), manteniendo a la vez la estructura de salida valida. La licencia Apache 2.0 facilita su integracion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Mistral-Nemo-Instruct-2407) |
| Parametros totales | 12.247.782.400 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Mistral-Nemo, no confirmada en la model card) |
| Tipos de cuantizacion | FP8 (E4M3) publicado; GGUF disponible en el repo; otras cuantizaciones no confirmadas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer denso derivado de Mistral-Nemo-Instruct-2407. Sobre esa base, el autor aplica el motor Lancet, descrito como una cirugia de subespacios bi-proyectada que preserva la norma: identifica la direccion de rechazo tanto en la proyeccion de entrada (residual stream) como en la de salida (unembedding), elimina el componente de forma bidireccional y restaura exactamente la norma residual para mantener las magnitudes de activacion y las distribuciones de tokens posteriores en la variedad original. El autor reporta un "Lancet KL Collateral" de 9,75e-03 frente a 0,30 de la ablacion ingenua, con una relacion de reduccion de KL de 0,97 y una tasa de supresion objetivo de 0,99.

Tras la cirugia se ejecuta un pase de GRPO con compuertas cuyo reward penaliza patrones de slop (prosa recargada, vocabulario tipo "tapestry", preambulos moralizantes) solo donde la cirugia debilito los circuitos de rechazo, con el fin de reforzar razonamiento, codigo y seguimiento de instrucciones en lugar de sacrificarlos. El autor reporta un IFEval de 0,63 en el pase GRPO con compuertas y una ganancia de 0,43 frente a variantes ingenuas o aditivas, con una tasa de slop y rechazo de 0,02. Posteriormente se aplica cuantizacion FP8 (E4M3), con una retencion del 0,97 y una re-fuga de subespacio de 0,18 (frente a 0,50 de la ablacion ingenua), y una fusion TIES segura respecto a subespacios con una re-fuga de 6,63e-08 y una retencion de SQL-Incident y Unslop de 1,00. El autor indica un factor de cresta maximo por fila de 10,65 y un peso absoluto maximo de 0,92.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento estructurado y analitico (el autor afirma preservar el subespacio de razonamiento del modelo base).
- Generacion de codigo, con enfasis declarado en tool calling y SQL.
- Tool calling / function calling con salidas JSON schema-valid (el ejemplo de la model card muestra una llamada DuckDB correctamente estructurada).
- Uso agentico y razonamiento multi-paso (etiquetas "agentic" y "tool-use").
- Reduccion de rechazos falsos positivos ante prompts tecnicos benignos (seguridad, analisis de logs, SQL).
- Reduccion de "slop" estilistico: menos prosa recargada, menos preambulos moralizantes, menos vocabulario tipo "tapestry".
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Triage de seguridad y DevOps: el modelo puede analizar lineas de log (por ejemplo, auth.log de nginx) y devolver una llamada de herramienta SQL valida para agregar intentos fallidos por IP, evitando el rechazo falso positivo tipico del modelo base y manteniendo el esquema JSON.
- Asistente de analitica con DuckDB/SQL: integrado como backend de un agente que traduce preguntas en lenguaje natural a consultas SQL estructuradas, gracias a la retencion declarada del subespacio SQL-Incident (1,00) y a la ortogonalidad frente a la cirugia.
- Automatizacion de atencion al cliente: conversaciones multi-turno con contexto largo (heredado de Mistral-Nemo) y sin preambulos moralizantes, lo que reduce la latencia percibida y mejora la claridad de las respuestas.
- Generacion de codigo en pipelines de CI/CD: el modelo soporta tool calling y salidas estructuradas, por lo que puede integrarse en flujos que invocan herramientas (linters, ejecutores de tests, APIs) y devuelven resultados parseables.
- Agentes multi-paso para operaciones: tareas que requieren encadenar llamadas a herramientas (consulta de estado, ejecucion de comandos, verificacion) con razonamiento intermedio, apoyandose en las etiquetas "agentic" y "tool-use".
- Despliegue en proveedores de inferencia: el checkpoint FP8 (E4M3) y la ausencia de codigo personalizado permiten servirlo directamente en vLLM u OpenRouter sin `trust_remote_code`, reduciendo el coste de integracion.
- Investigacion sobre alineacion y abliteracion: el modelo sirve como caso de estudio reproducible para comparar cirugia de subespacios (Lancet) frente a ablacion ingenua, con metricas de KL colateral, re-fuga y retencion publicadas.

## Benchmarks y rendimiento

Los datos publicados por el autor provienen de `final_metrics.json` del pipeline de release. No son benchmarks estandar (MMLU, HumanEval, GSM8K) sino metricas internas de la cirugia, el GRPO, la cuantizacion y la fusion.

| Metrica | Valor | Direccion |
|---|---|---|
| Lancet KL Collateral | 9,75e-03 | Menor es mejor |
| Naive KL Collateral | 0,30 | Menor es mejor |
| KL Reduction Ratio | 0,97 | Mayor es mejor |
| Target Suppression Ratio | 0,99 | Mayor es mejor |
| Gated GRPO IFEval Score | 0,63 | Mayor es mejor |
| Gated vs Naive/Additive Gain | 0,43 | Mayor es mejor |
| Slop & Refusal Rate | 0,02 | Menor es mejor |
| Post-Merge Suppression Retention | 1,00 | Mayor es mejor |
| FP8 Retention Ratio | 0,97 | Mayor es mejor |
| FP8 KL Reduction vs Naive | 0,49 | Mayor es mejor |
| FP8 Subspace Re-Leakage Lancet | 0,18 | Menor es mejor |
| FP8 Subspace Re-Leakage Naive | 0,50 | Menor es mejor |
| SQL-Incident Retention | 1,00 | Mayor es mejor |
| Unslop Retention | 1,00 | Mayor es mejor |
| Subspace-Safe Merge Re-Leakage | 6,63e-08 | Menor es mejor |
| TIES Bi-Projected vs Naive Gain | 0,78 | Mayor es mejor |
| Max row crest-factor | 10,65 | Menor es mejor (< 25,0) |
| Max absolute weight | 0,92 | — |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 24,5 GB solo para pesos (12,25B parametros x 2 bytes), mas overhead de KV cache y activaciones; en la practica se recomienda 32 GB o mas.
- VRAM estimada en FP8 (E4M3): aproximadamente 12,3 GB solo para pesos; con overhead, 16-24 GB.
- VRAM estimada en cuantizaciones GGUF de 4 bits: aproximadamente 7-8 GB para pesos; viable en GPUs consumer de 8-12 GB con contexto moderado.
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB) para BF16 con contexto largo; RTX 4090 (24 GB) para FP8 o GGUF; RTX 3090/4080 (16-24 GB) para GGUF 4-5 bits.
- Cabe en GPU consumer: si, en RTX 4090 con FP8 o GGUF, y en GPUs de 8-12 GB con GGUF de 4 bits y contexto reducido.
- Opciones de despliegue: vLLM (soporte FP8 E4M3), llama.cpp/Ollama (GGUF), MLX, TGI (etiqueta `text-generation-inference`), proveedores OpenRouter.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Tenet-12B-Nemo-Unslop-v1 | 12,25B | no disponible | Apache 2.0 | Fine-tune con cirugia Lancet, GRPO y FP8; tool calling y SQL reforzados |
| mistralai/Mistral-Nemo-Instruct-2407 (base) | 12B | no disponible | Apache 2.0 | Modelo base; rechazos falsos positivos y slop estilistico segun el autor |
| Ablacion ingenua de Mistral-Nemo | 12B | no disponible | Apache 2.0 | Elimina rechazos pero rompe salidas estructuradas y aumenta la re-fuga (KL 0,30) |

No se dispone de datos de benchmarks estandar para comparar rendimiento con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo ha sido sometido a una cirugia de de-rechazo ("abliterated"/"uncensored"); puede producir contenido que el modelo base rechazaria. El autor declara explicitamente fuera de alcance operaciones ofensivas de ciberdefensa, generacion de malware y contenido ilegal, pero no se especifican filtros tecnicos adicionales.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad ni de tasas de alucinacion en la informacion disponible.
- La cirugia de subespacios puede degradar capacidades no medidas por las metricas internas del autor; no hay benchmarks estandar (MMLU, HumanEval, GSM8K) que confirmen la retencion de capacidades generales.
- Idiomas soportados no disponibles; se desconoce el comportamiento multilingue tras el fine-tune.
- Longitud de contexto no confirmada en la model card; no se debe asumir la ventana de Mistral-Nemo sin verificacion.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo en produccion ni sobre el cumplimiento normativo en dominios regulados.
- El modelo es un fine-tune de un usuario independiente (1 like, 1371 descargas en el momento de la ficha); no cuenta con el respaldo de un laboratorio establecido, lo que implica menor soporte y validacion externa.
- La cuantizacion FP8 introduce re-fuga de subespacio (0,18) y drift de KL (0,18) respecto a BF16; para maximizar la fidelidad al ajuste conviene usar BF16 si el hardware lo permite.

## Enlaces

- Hugging Face: https://huggingface.co/mr-andrey-isachenko/Tenet-12B-Nemo-Unslop-v1
- Modelo base: https://huggingface.co/mistralai/Mistral-Nemo-Instruct-2407
- Codigo y reporte tecnico: https://github.com/mrAndreyIsachenko/tenet-lab
- Inspector interactivo FP8 y abliteracion: https://huggingface.co/spaces/mr-andrey-isachenko/fp8-abliteration-inspector
- Coleccion de la familia Tenet v1: https://huggingface.co/mr-andrey-isachenko
