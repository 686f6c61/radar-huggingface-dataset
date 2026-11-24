# mr-andrey-isachenko/Tenet-26B-A4B-Gemma4-Unslop-v2

## Resumen

Tenet-26B-A4B-Gemma4-Unslop-v2 es un fine-tune del modelo google/gemma-4-26b-a4b-it, desarrollado por el usuario mr-andrey-isachenko bajo el paraguas del proyecto Tenet. El modelo aplica una tecnica propietaria denominada Lancet, que combina cirugia de subespacios (subspace surgery) con un pase de GRPO (Group Relative Policy Optimization) orientado a eliminar rechazos excesivos (over-refusals) y patrones estilisticos considerados "slop" (prosa recargada, preambulos moralizantes), preservando supuestamente las capacidades de razonamiento y codigo del modelo base. Se distribuye en formato FP8 (E4M3) listo para vLLM, OpenRouter, GGUF y MLX.

El modelo hereda la arquitectura del base Gemma 4, un transformer con mezcla de expertos (MoE) de 25.805.936.206 parametros totales (segun los safetensors) y aproximadamente 4B parametros activos, segun se deduce del sufijo A4B del nombre. Esta orientado a uso como asistente conversacional, tool calling, generacion de codigo y flujos agenticos, con la particularidad de ser una version "abliterated" y "uncensored" que busca reducir falsos rechazos en tareas benignas.

Su relevancia actual reside en que aborda un problema recurrente en modelos alineados: el exceso de rechazos en prompts legitimos (por ejemplo, analisis de logs de seguridad o generacion de SQL) y la deriva estilistica hacia respuestas genericas. El autor reclama que el enfoque de cirugia bidireccional con preservacion de norma evita los efectos colaterales tipicos de la ablacion ingenua, aunque los datos de benchmark publicados en la model card aparecen como "n/a", por lo que no es posible verificar cuantitativamente dichas afirmaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), basado en google/gemma-4-26b-a4b-it |
| Parametros totales | 25.805.936.206 |
| Parametros activos | aproximadamente 4B (inferido del sufijo A4B; no confirmado en la model card) |
| Longitud de contexto | no disponible (el ejemplo de vLLM usa --max-model-len 32768, pero no se declara oficialmente) |
| Tipos de cuantizacion | FP8 (E4M3) en el checkpoint principal; GGUF (incluye CKA-Quant Q4_K_M y variantes i1 de mradermacher); BF16 en el output de la cirugia |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (FP8), GGUF |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-26b-a4b-it, un transformer con mezcla de expertos de aproximadamente 26B parametros totales y unos 4B activos por token. Sobre esa base, el autor aplica el motor Lancet, descrito como una cirugia de subespacios con preservacion de norma y proyeccion bidireccional: se identifica la direccion de rechazo tanto en la proyeccion de entrada (residual stream) como en la de salida (unembedding), se elimina el componente en ambas direcciones y se restaura exactamente la norma residual para mantener las magnitudes de activacion dentro de la variedad (on-manifold) y evitar que se distorsione la distribucion de tokens posterior.

Tras la cirugia se ejecuta un pase de GRPO con compuertas de recompensa ("gated unslop GRPO"): la funcion de recompensa penaliza patrones de slop solo en las regiones donde la cirugia debilito los circuitos de rechazo, con el objetivo de reforzar el razonamiento y la codificacion del modelo base en lugar de degradarlos. El resultado se exporta a FP8 (E4M3) sin codigo personalizado, sin trust_remote_code y sin auto_map, de modo que el repositorio es compatible directamente con vLLM, proveedores de OpenRouter, GGUF y MLX. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni los detalles del pipeline de RLHF/DPO mas alla del GRPO mencionado.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat (apply_chat_template).
- Razonamiento estructurado y analitico, presumiblemente preservado del base Gemma 4 segun el autor.
- Generacion de codigo y consultas SQL, con enfasis en tool calling con esquema valido (el ejemplo de la model card muestra una llamada DuckDB bien formada).
- Soporte de tool calling / function calling y uso agentico (tags agentic, tool-use).
- Capacidades de vision: el tag image-text-to-text sugiere entrada multimodal imagen-texto, heredada del base Gemma 4.
- Reduccion de falsos rechazos en prompts benignos (analisis de logs, tareas de seguridad defensiva, SQL).
- Estilo depurado: eliminacion de preambulos moralizantes y vocabulario "slop" segun el autor.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Triaje de logs de seguridad: el modelo puede recibir lineas de log (por ejemplo, auth.log de nginx) y devolver llamadas a herramientas SQL validas, como se ilustra en la model card, sin rechazos espurios que interrumpan el flujo.
- Generacion de SQL en pipelines de datos: integrado como herramienta en un agente que traduce lenguaje natural a consultas DuckDB o PostgreSQL, con salida JSON conforme a esquema.
- Asistencia a desarrolladores en CI/CD: soporte de tool calling para invocar APIs de build, consultar estado de despliegues o generar parches, aprovechando el anclaje de codigo preservado.
- Agentes multi-paso: encadenamiento de llamadas a herramientas en tareas de AppSec/DevOps (triaje, correlacion de alertas, generacion de consultas) gracias a la supuesta ortogonalidad de los anclajes de tool/SQL que reclama el autor.
- Asistente conversacional sin friccion: atencion a usuarios en dominios sensibles pero legitimos (soporte tecnico de seguridad, analisis forense) donde el modelo base rechazaria por defecto.
- Despliegue en infraestructura propia con vLLM en FP8: servicio compatible con endpoints estilo OpenAI para integrarse en plataformas internas.
- Inferencia local con llama.cpp u Ollama mediante los GGUF de la comunidad (CKA-Quant, i1 de mradermacher) para equipos con GPU de consumo.

## Benchmarks y rendimiento

La model card incluye tablas para las metricas H9 (retencion de rechazo y slop), H10 (retencion de capacidad downstream), H11 (robustez a cuantizacion FP8) y una comparativa frente a ablacion ingenua (KL Collateral Drift, Refusal Suppression, Tool/SQL Anchor Orthogonality, LoRA Re-Leakage, FP8 Subspace Re-Leakage, Max Row Crest-Factor). Sin embargo, todos los valores aparecen como "n/a" o "—" en la informacion disponible.

| Metrica | BF16 | FP8 (E4M3) | Ablacion ingenua |
|---|---|---|---|
| H9 (refusal & slop) | n/a | n/a | n/a |
| H10 (retencion de capacidad) | n/a | n/a | n/a |
| H11 (robustez FP8) | n/a | n/a | n/a |
| KL Collateral Drift | — | — | — |
| Refusal Suppression | — | — | — |
| Tool/SQL Anchor Orthogonality | — | — | — |
| LoRA Re-Leakage | — | — | — |
| FP8 Subspace Re-Leakage | — | — | — |
| Max Row Crest-Factor (< 25.0) | — | — | — |

No se han publicado resultados numericos de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP8: aproximadamente 26 GB solo para pesos, mas overhead de cache KV; en la practica se recomienda 32-40 GB para contexto moderado.
- VRAM estimada en BF16: aproximadamente 52 GB para pesos, lo que exige GPU de 80 GB o multi-GPU.
- GGUF Q4_K_M: aproximadamente 15-16 GB, apto para GPU de consumo de 16-24 GB.
- GPU recomendadas: H100 80 GB, A100 80 GB o L40S 48 GB para FP8 con contexto largo; RTX 4090 24 GB viable solo con cuantizacion GGUF Q4 o inferior.
- Cabe en GPU de consumo (RTX 4090, RTX 3090, 4080) unicamente con cuantizaciones GGUF de 4 bits.
- Opciones de despliegue: vLLM (con --quantization fp8), Transformers, llama.cpp, Ollama y LM Studio mediante GGUF, MLX, y proveedores de OpenRouter.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Tenet-26B-A4B-Gemma4-Unslop-v2 | 25,8B | ~4B | no disponible | apache-2.0 | Fine-tune abliterated con GRPO y export FP8 |
| google/gemma-4-26b-a4b-it | ~26B | ~4B | no disponible | Gemma (terminos propios) | Base original, alineacion estandar, rechazos mas conservadores |
| Ablacion ingenua de gemma-4-26b-a4b-it | ~26B | ~4B | no disponible | segun autor | Referencia del autor; rompe salidas estructuradas segun la model card |
| Otros fine-tunes abliterated de la familia Gemma 4 | no disponible | no disponible | no disponible | variable | No se dispone de datos comparativos verificables |

No se dispone de datos de rendimiento cuantitativos para establecer una comparacion numerica con alternativas.

## Limitaciones y advertencias

- Los benchmarks publicados en la model card estan vacios (n/a), por lo que las afirmaciones sobre preservacion de capacidad y supresion de rechazo no estan verificadas con numeros.
- El modelo ha sido sometido a cirugia de rechazo (abliteration): puede generar contenido que el base rechazaria, lo que incrementa el riesgo en despliegues sin capas de moderacion adicionales.
- Riesgo de alucinacion heredado del base, potencialmente agravado por el pase de GRPO si la recompensa favorece respuestas asertivas sobre respuestas correctas.
- El autor declara explicitamente fuera de alcance el uso para operaciones ofensivas, malware o contenido ilegal, aunque la licencia apache-2.0 no impone restricciones contractuales adicionales.
- Idiomas soportados no documentados; el comportamiento multilingue no esta garantizado.
- Longitud de contexto no declarada oficialmente; el ejemplo de vLLM sugiere 32768 tokens, pero no es un dato confirmado.
- Modelo con cero descargas y cero likes en el momento de la ficha: no hay validacion de la comunidad ni informes independientes de calidad.
- La licencia apache-2.0 permite uso comercial, pero el modelo base Gemma 4 puede estar sujeto a los terminos de Google; conviene revisar la compatibilidad de licencias antes de produccion.
- El repositorio ocupa 103,3 GB, lo que implica costes de almacenamiento y transferencia considerables.
- No se especifican datos de entrenamiento ni composicion del dataset, lo que dificulta evaluar sesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mr-andrey-isachenko/Tenet-26B-A4B-Gemma4-Unslop-v2
- Modelo base: https://huggingface.co/google/gemma-4-26b-a4b-it
- Codigo fuente e informe tecnico: https://github.com/mrAndreyIsachenko/tenet-lab
- Inspector interactivo FP8 y abliteration: https://huggingface.co/spaces/mr-andrey-isachenko/fp8-abliteration-inspector
- Coleccion de la familia Tenet: https://huggingface.co/mr-andrey-isachenko
- GGUF de la comunidad (mradermacher, i1): https://huggingface.co/mradermacher/Tenet-26B-A4B-Gemma4-Unslop-v2-i1-GGUF
