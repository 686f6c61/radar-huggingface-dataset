# Pablox0333/qwen3-4b-redactor-udec-d4

## Resumen

El modelo `qwen3-4b-redactor-udec-d4` es un adaptador LoRA (concretamente QLoRA) entrenado por el usuario Pablox0333 sobre el modelo base `Qwen/Qwen3-4B`. No se trata de un modelo completo, sino de un conjunto de pesos de adaptación que modifican el comportamiento del agente "Redactor" dentro de un sistema multi-agente de cuatro componentes (Enrutador, Recuperador, Verificador y Redactor) orientado a responder consultas sobre normativa académica de pregrado de la Universidad de Concepción (Facultad de Ingeniería). Los otros tres agentes conservan los pesos originales del modelo base.

El adaptador se ha entrenado con 180 pares de entrenamiento y 30 de validación, empleando cuantización 4-bit NF4 con doble cuantización y una configuración LoRA de rango 16 sobre todos los módulos lineales principales del transformer. El objetivo es especializar al Redactor en la generación de respuestas fundamentadas en documentos normativos concretos (`RI-FI`, `RG`, `Calendario 2026`), un dominio muy acotado y de baja cobertura en los corpus generalistas.

La relevancia de esta ficha es doble: por un lado, documenta un caso práctico de ajuste fino eficiente (menos de una hora en una Tesla T4) para un dominio institucional; por otro, sirve como referencia de cómo empaquetar y publicar adaptadores PEFT sobre Qwen3 para pipelines RAG y sistemas multi-agente. La información pública disponible es limitada: no hay benchmarks ni métricas de calidad más allá de la pérdida de validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA sobre módulos de atención y MLP |
| Parametros totales | No disponible en la informacion proporcionada (adaptador: r=16, alpha=32 sobre q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3-4B) |
| Tipos de cuantizacion | Entrenamiento en 4-bit NF4 con doble cuantización; el adaptador se distribuye en safetensors (precisión del adaptador no especificada) |
| Idiomas soportados | Espanol (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen3-4B`, un transformer decoder-only de la familia Qwen3. El entrenamiento se realizó con QLoRA: el modelo base se cargó en 4-bit NF4 con doble cuantización y se añadieron matrices de bajo rango (r=16, alpha=32, dropout=0.05) en los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. La pérdida se enmascaró para calcularse únicamente sobre los tokens generados por el asistente (`labels = -100` en el prompt), y se usó la plantilla de chat con `enable_thinking=False`.

El dataset consta de 180 pares de entrenamiento y 30 de validación, separados sin fuga respecto a las 75 preguntas de evaluación del Deliverable 3. El entrenamiento se ejecutó en una Tesla T4 (15,64 GB de VRAM, `torch.float16`) durante 54,75 minutos, con 90 pasos totales y 3 épocas. La pérdida de validación pasó de 1,619545 a un mínimo de 0,575349 en el paso 90. No se documentan técnicas adicionales como RLHF, DPO, decodificación especulativa ni atención lineal; el adaptador hereda la arquitectura y las innovaciones del modelo base.

## Capacidades

- Generación de texto especializada en normativa académica de pregrado de la Universidad de Concepción (Facultad de Ingeniería): `RI-FI`, `RG` y `Calendario 2026`.
- Redacción de respuestas fundamentadas dentro de un pipeline RAG, actuando como agente Redactor sobre contexto recuperado por el agente Recuperador.
- Integración en un sistema multi-agente de cuatro roles (Enrutador, Recuperador, Verificador, Redactor), donde solo el Redactor lleva pesos ajustados.
- Generación en español, idioma declarado por el autor.
- Compatibilidad con el ecosistema PEFT/Hugging Face `transformers` para carga y fusión del adaptador.
- No se documentan capacidades de tool calling, function calling, agentes autónomos multi-paso, visión, audio ni modo thinking activo (de hecho, el entrenamiento usa `enable_thinking=False`).

## Casos de uso

- Atención a estudiantes sobre reglamentos: el adaptador puede redactar respuestas a consultas sobre `RI-FI`, `RG` y `Calendario 2026` a partir de fragmentos recuperados por el agente Recuperador, manteniendo el tono y la terminología institucional vistos en el corpus de entrenamiento.
- Asistente interno para personal administrativo: redacción de borradores de respuestas a consultas frecuentes sobre plazos, requisitos y procedimientos académicos, revisables posteriormente por un humano.
- Componente Redactor en un pipeline RAG multi-agente: se carga junto al modelo base y se invoca únicamente en la fase de generación, dejando la recuperación y la verificación a los otros agentes.
- Prototipado rápido de asistentes normativos en dominios acotados: el coste de entrenamiento (54,75 min en una T4) permite reentrenar el adaptador cuando cambie la normativa o se añadan documentos nuevos.
- Docencia e investigación en IA generativa: sirve como ejemplo reproducible de QLoRA sobre Qwen3-4B para asignaturas de IA generativa, con hiperparámetros y curvas de pérdida documentados.
- Evaluación de sistemas multi-agente: al aislar el ajuste fino en un solo agente, permite medir el impacto del adaptador frente a los pesos base en el mismo pipeline.
- Despliegue en hardware modesto: al ser un adaptador sobre un modelo de 4B cuantizable, puede ejecutarse en GPUs de consumo para demos y validaciones internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada es la pérdida de validación: `eval_loss` inicial 1,619545 y mejor `eval_loss` 0,575349 en el paso 90. No hay datos de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento se realizó en una Tesla T4 con 15,64 GB de VRAM usando cuantización 4-bit NF4, lo que da una referencia del orden de magnitud necesario para cargar el modelo base cuantizado más el adaptador.
- GPU recomendadas: Tesla T4 (validada por el autor para entrenamiento); para inferencia, cualquier GPU con al menos la VRAM suficiente para cargar `Qwen/Qwen3-4B` en 4-bit o 8-bit.
- GPU de consumo: no se especifica compatibilidad con RTX 4090, RTX 3090 u otras; por el tamaño del modelo base (4B) y la cuantización 4-bit, es plausible que quepa en GPUs de consumo con 8-16 GB, pero no está confirmado en la información proporcionada.
- Opciones de despliegue: carga vía `transformers` + `peft` + `bitsandbytes` (documentada en la model card). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `Pablox0333/qwen3-4b-redactor-udec-d4` | Adaptador LoRA sobre Qwen3-4B (r=16) | No disponible | Apache 2.0 | safetensors (PEFT) | Especializado en normativa UdeC; sin benchmarks públicos |
| `Qwen/Qwen3-4B` (base) | 4B | No disponible en esta ficha | Apache 2.0 | safetensors, GGUF (según repo oficial) | Modelo generalista; el adaptador parte de él |
| Adaptadores LoRA de dominio público comparables | No disponible | No disponible | Variable | PEFT | No se dispone de comparaciones publicadas con este adaptador |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría (adaptadores LoRA para dominios normativos o académicos). La comparación se limita al modelo base y a la categoría general de adaptadores PEFT.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autónomo: requiere cargar `Qwen/Qwen3-4B` como base y aplicar los pesos PEFT; no funciona de forma aislada.
- Dominio muy restringido: entrenado exclusivamente sobre normativa de pregrado de la UdeC (Facultad de Ingeniería); su comportamiento fuera de ese corpus no está validado.
- Dataset pequeño (180 pares de entrenamiento): riesgo elevado de sobreajuste y de baja generalización a preguntas formuladas de forma distinta a las del conjunto de entrenamiento.
- Riesgo de alucinación: al ser un modelo generativo ajustado sobre un corpus acotado, puede inventar artículos, plazos o procedimientos no presentes en la normativa; se recomienda verificación humana o un agente Verificador.
- Sesgos: no documentados por el autor; al entrenarse sobre un único corpus institucional, puede reproducir sesgos o terminología específica de la fuente.
- Limitaciones de idioma: solo se declara español; no se garantiza calidad en otros idiomas.
- Sin benchmarks públicos: no hay métricas de calidad (exactitud, fidelidad, tasa de alucinación) más allá de la pérdida de validación, lo que dificulta evaluar su idoneidad en producción.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base `Qwen/Qwen3-4B` y de los documentos normativos utilizados en el entrenamiento.
- Fecha de creación y actualización del repositorio: 2026-11-13; el modelo no registra descargas ni likes en el momento de la consulta, por lo que no hay evidencia de uso comunitario.

## Enlaces

- Hugging Face: https://huggingface.co/Pablox0333/qwen3-4b-redactor-udec-d4
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Librería PEFT: https://huggingface.co/docs/peft
- Documentación de Qwen3: no disponible en la información proporcionada
- Paper de Qwen3: no disponible en la información proporcionada
- Repositorio o demo del sistema multi-agente: no disponible en la información proporcionada
