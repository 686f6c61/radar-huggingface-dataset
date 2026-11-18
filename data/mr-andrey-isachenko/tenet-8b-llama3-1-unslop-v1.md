# mr-andrey-isachenko/Tenet-8B-Llama3.1-Unslop-v1

## Resumen

Tenet-8B-Llama3.1-Unslop-v1 es un ajuste fino del modelo meta-llama/Llama-3.1-8B-Instruct desarrollado por el autor mr-andrey-isachenko bajo la marca Tenet. El modelo aplica una tecnica propietaria denominada Lancet, descrita por el autor como una cirugia de subespacio con preservacion de norma y proyeccion bidireccional, orientada a eliminar el exceso de rechazos (over-refusals) y el denominado "slop" estilistico (prosa recargada, preambulos moralizantes y vocabulario generico) sin degradar las capacidades de razonamiento, codigo y uso de herramientas del modelo base. Sobre esa cirugia se aplica un pase de GRPO con compuertas de recompensa ("gated unslop GRPO") y se exporta un checkpoint en FP8 (E4M3) listo para proveedores.

El modelo mantiene la arquitectura transformer densa de Llama 3.1 de 8B parametros y una ventana de contexto de hasta 32.768 tokens segun el ejemplo de despliegue en vLLM de la model card. Se distribuye con licencia Apache 2.0 y sin codigo personalizado ni `trust_remote_code`, lo que facilita su integracion directa en vLLM, proveedores de OpenRouter, GGUF y MLX.

Su relevancia actual radica en el nicho de modelos "abliterated" o "uncensored" orientados a uso agentico y tool calling, donde el autor afirma que las tecnicas de abliteracion ingenua rompen la estructura de salida (JSON, SQL) y degradan el rendimiento. Tenet propone una alternativa quirurgica con metricas internas propias (H9, H10, H11) que, no obstante, no estan validadas por benchmarks publicos estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1) |
| Parametros totales | 8B (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (segun ejemplo de despliegue en vLLM de la model card) |
| Tipos de cuantizacion | FP8 (E4M3) exportado; GGUF (CKA-Quant Q4_K_M mencionado); MLX |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8 E4M3), GGUF |

## Arquitectura y entrenamiento

El modelo parte de Llama-3.1-8B-Instruct, un transformer denso con atención estándar (no se mencionan modificaciones arquitectónicas del backbone). La innovación descrita se sitúa en el post-entrenamiento: el motor Lancet realiza una "cirugia de subespacio con preservacion de norma y proyeccion bidireccional", identificando la direccion de rechazo tanto en la proyeccion de entrada (residual stream) como en la de salida (unembedding), eliminando la componente en ambas direcciones y restaurando exactamente la norma residual para mantener las magnitudes de activacion y las distribuciones de tokens posteriores sobre la variedad original ("on-manifold").

Tras la cirugia se aplica un pase de GRPO (Group Relative Policy Optimization) con compuertas de recompensa que penalizan patrones de "slop" solo en las regiones donde la cirugia debilito los circuitos de rechazo, con el objetivo de reforzar razonamiento y codigo en lugar de danarlos. El autor no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF/DPO adicionales. El checkpoint se exporta en FP8 (E4M3) y se reportan metadatos de estabilidad numerica: factor de cresta maximo por fila de 6,32 y peso absoluto maximo de 0,91.

## Capacidades

- Generacion de texto conversacional multi-turno en formato chat (chat template de Llama 3.1).
- Razonamiento estructurado y codificacion, con enfasis declarado en preservar el "subespacio ancla" de razonamiento analitico y de codigo del modelo base.
- Tool calling / function calling, con ejemplos de la model card orientados a generar llamadas de herramienta validas en JSON y consultas SQL (DuckDB).
- Uso agentico y flujos multi-paso (tag "agentic").
- Reduccion de rechazos falsos positivos ante prompts benignos (por ejemplo, triaje de logs de seguridad).
- Mitigacion de "slop" estilistico: prosa recargada, preambulos moralizantes y vocabulario generico.
- Capacidades multilingues: no disponible (no se especifican idiomas).
- Modo thinking, vision o audio: no disponible (no se mencionan).

## Casos de uso

- Triaje de logs de seguridad y generacion de consultas SQL: el modelo puede recibir lineas de log (por ejemplo, nginx auth) y devolver una llamada de herramienta DuckDB con SQL valido, evitando el rechazo falso tipico del base y manteniendo el esquema JSON, segun el ejemplo de la model card.
- Agentes de operaciones (AppSec/DevOps): integracion en pipelines que requieren tool calling fiable y salidas estructuradas, aprovechando la ortogonalidad declarada del ancla de herramientas/SQL respecto a la direccion de rechazo eliminada.
- Asistente de codigo en produccion: generacion y revision de codigo con menor tasa de preambulos moralizantes, adecuado para entornos donde el estilo conciso importa.
- Atencion al cliente automatizada: conversaciones multi-turno con contexto de hasta 32.768 tokens, util para historiales largos de tickets.
- Despliegue en proveedores de inferencia: el checkpoint FP8 (E4M3) sin codigo personalizado encaja en vLLM y en proveedores tipo OpenRouter con una sola orden de servicio.
- Inferencia en hardware de consumo: la variante GGUF CKA-Quant Q4_K_M permite ejecucion local con llama.cpp para prototipado y pruebas sin GPU de datacenter.
- Generacion de contenido tecnico sin "slop": documentacion y respuestas concisas donde se quiere evitar prosa recargada y moralizacion.

## Benchmarks y rendimiento

La model card reporta unicamente metricas internas propias del autor (H9, H10, H11 y una tabla comparativa), no benchmarks estandar como MMLU, HumanEval o GSM8K.

| Variante | H9 (menor mejor) | H10 (mayor mejor) | H11 (mayor mejor) |
|---|---|---|---|
| BF16 | 0,01 | 0,46 | 0,99 |
| FP8 (E4M3) | 0,04 | 1,00 | 0,43 |
| Abliteracion ingenua | 0,13 | 0,25 | 0,50 |

| Metrica | Base | Abliteracion ingenua | Tenet (BF16) | Tenet (FP8 E4M3) |
|---|---|---|---|---|
| Deriva colateral KL | — | 0,13 | 0,01 | 0,03 |
| Supresion de rechazo | — | — | 0,99 | 1,00 |
| Ortogonalidad del ancla Tool/SQL | — | 1,13 | 1,00e-08 | 0,07 |
| Re-fuga LoRA | — | 1,13 | 0,07 | 0,03 |
| Re-fuga de subespacio FP8 | — | 0,50 | — | 0,03 |
| Factor de cresta maximo por fila (< 25,0) | — | — | 6,32 | 6,32 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: alrededor de 16 GB en BF16 para los 8B parametros; aproximadamente 8-9 GB en FP8 (E4M3); en torno a 5-6 GB en GGUF Q4_K_M.
- GPU recomendadas: A100, H100 o L40S para servicio FP8 en vLLM con contexto largo; RTX 4090 (24 GB) suficiente para FP8 y para BF16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y GPUs con 12-16 GB en cuantizacion Q4_K_M; en 8 GB puede requerir cuantizaciones mas agresivas no documentadas.
- Opciones de despliegue: vLLM (`--quantization fp8`), Transformers (`device_map="auto"`), llama.cpp (GGUF CKA-Quant Q4_K_M), Ollama, MLX, y proveedores tipo OpenRouter.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tenet-8B-Llama3.1-Unslop-v1 | 8B | 32.768 | De-refusal quirurgico + GRPO, FP8 | Apache 2.0 | Hugging Face |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128.000 | Instruct generalista | Llama 3.1 Community License | Hugging Face |
| Abliteracion ingenua de Llama-3.1-8B | 8B | 128.000 | Eliminacion directa de direccion de rechazo | Segun base | Multiples repos comunitarios |
| Modelos "uncensored" 7-8B de la comunidad | 7-8B | variable | Ajustes sin alineacion | variable | Hugging Face |

Nota: los datos de contexto del modelo base Llama 3.1 son 128.000 tokens; la model card de Tenet solo documenta 32.768 en su ejemplo de vLLM, por lo que el contexto efectivo maximo de este ajuste no esta confirmado.

## Limitaciones y advertencias

- Las metricas H9, H10 y H11 son internas del autor y no equivalen a benchmarks estandar; no permiten comparacion directa con otros modelos.
- El modelo ha sido sometido a una eliminacion deliberada de la direccion de rechazo, lo que incrementa el riesgo de generar contenido inapropiado o danino; el autor declara fuera de alcance el uso ofensivo, malware o contenido ilegal, pero la salvaguarda tecnica es reducida.
- Riesgo de alucinacion no evaluado en la informacion disponible.
- Idiomas soportados no especificados; el comportamiento multilingue puede diferir del base.
- El contexto efectivo documentado (32.768 tokens) es inferior al del modelo base (128.000); conviene verificar el limite real antes de usarlo en produccion.
- El checkpoint se distribuye en FP8 (E4M3); la tabla H11 sugiere que la robustez frente a cuantizacion adicional puede ser limitada (0,43 en FP8 frente a 0,99 en BF16).
- Licencia Apache 2.0 declarada en el repo, pero el modelo deriva de Llama 3.1, cuya licencia comunitaria impone condiciones adicionales; conviene revisar la compatibilidad para uso comercial.
- Repo con 0 descargas y 0 likes en el momento de la consulta; no hay validacion independiente de la comunidad.
- El tamano del repo figura como 0,0 GB, lo que sugiere que los pesos pueden no estar publicados o la informacion esta incompleta.

## Enlaces

- Hugging Face: https://huggingface.co/mr-andrey-isachenko/Tenet-8B-Llama3.1-Unslop-v1
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
