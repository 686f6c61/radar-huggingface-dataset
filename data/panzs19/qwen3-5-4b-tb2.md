# panzs19/Qwen3.5-4B-TB2

## Resumen

Qwen3.5-4B-TB2 es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-4B, publicado por el usuario panzs19 en HuggingFace. Se trata de un checkpoint de entrenamiento del pipeline "AgentCoT Horizon" (paso 146), exportado desde Megatron-SWIFT con el exportador oficial de HuggingFace y con pesos de inferencia en BF16. El modelo está orientado a tareas de agente y razonamiento multi-paso, con etiquetas que apuntan a Terminal-Bench y a "agentcot" (chain-of-thought para agentes).

El modelo conserva la arquitectura del Qwen3.5-4B original (familia Qwen3.5, pipeline image-text-to-text según los tags, aunque la model card lo declara como text-generation) y cuenta con 4.539.265.536 parámetros totales según los safetensors del repositorio. El tamaño del repo es de 9,1 GB, coherente con pesos en BF16 de un modelo de ~4,5B parámetros.

Su relevancia es limitada por el momento: es un checkpoint de investigación con 0 descargas y 0 likes, sin licencia declarada, sin idiomas especificados y con resultados de evaluación pendientes. La model card indica que la evaluación en Terminal-Bench 2.0 se realiza con Harbor y Terminus-2, contexto de 262144 tokens, temperatura 1.0, top_p 0.95, top_k 20 y tres intentos independientes por tarea, pero las puntuaciones finales aún no se han publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; tag `qwen3_5`), detalles no disponibles |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262144 tokens en la evaluacion de Terminal-Bench 2.0 (contexto nativo del modelo base no disponible) |
| Tipos de cuantizacion | no disponible (los pesos publicados son BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen/Qwen3.5-4B, por lo que hereda la arquitectura transformer de la familia Qwen3.5. La model card no detalla la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención, etc.) ni si incorpora innovaciones como atención lineal o decodificación especulativa. El tag `image-text-to-text` sugiere capacidades multimodales heredadas del modelo base, aunque la model card solo declara `text-generation` como pipeline.

El entrenamiento corresponde al checkpoint 146 del pipeline "AgentCoT Horizon", exportado desde Megatron-SWIFT. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO u otras. El checkpoint nativo de entrenamiento, incluyendo estado del optimizador y RNG, permanece en el almacenamiento original de entrenamiento; el repositorio contiene únicamente el modelo de inferencia en formato HuggingFace. La orientación a "agentcot" y Terminal-Bench sugiere un entrenamiento centrado en razonamiento de agentes y uso de terminal, pero no se aportan detalles sobre la metodología.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Razonamiento multi-paso orientado a agentes (tag `agentcot`).
- Ejecución de tareas de terminal y línea de comandos (tag `terminal-bench`, evaluación con Harbor y Terminus-2).
- Posible soporte multimodal imagen-texto por herencia del modelo base (tag `image-text-to-text`), aunque no confirmado en la model card.
- Compatibilidad con endpoints (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Automatización de tareas de terminal: el modelo está entrenado y evaluado específicamente en Terminal-Bench 2.0, por lo que es adecuado para agentes que ejecutan comandos, interpretan salidas y corrigen errores en entornos de shell.
- Agentes de razonamiento multi-paso: el enfoque "AgentCoT" lo orienta a descomponer tareas complejas en pasos intermedios, útil en pipelines de agentes autónomos.
- Evaluación e investigación en benchmarks de agentes: sirve como checkpoint de referencia para comparar metodologías de entrenamiento de agentes frente al Qwen3.5-4B base.
- Prototipado de asistentes de código en local: con ~4,5B parámetros en BF16 puede desplegarse en una sola GPU para experimentación con generación de comandos y scripts.
- Contexto largo en tareas de agente: la evaluación con 262144 tokens de contexto permite escenarios con historiales largos de interacción o volcados extensos de terminal.
- Fine-tuning posterior: al ser un checkpoint de investigación sin licencia declarada, su uso práctico queda limitado a entornos de experimentación donde se verifiquen los términos del modelo base Qwen3.5-4B.

## Benchmarks y rendimiento

La model card indica que la evaluación en Terminal-Bench 2.0 (Harbor y Terminus-2, contexto 262144, temperatura 1.0, top_p 0.95, top_k 20, tres intentos por tarea) está pendiente de resultados finales. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 9,1 GB solo para pesos (4,54B parámetros × 2 bytes), más overhead de activaciones y KV cache; se recomienda al menos 16-24 GB para inferencia cómoda.
- VRAM estimada con cuantización a 8 bits: ~4,5-5 GB de pesos; a 4 bits: ~2,5-3 GB de pesos (estimaciones teóricas, no verificadas para este modelo).
- GPU recomendadas: A100, H100 o L40S para contexto largo (262144 tokens); RTX 4090 (24 GB) para BF16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) en BF16 con contexto limitado, y en GPUs de 8-16 GB con cuantización.
- Opciones de despliegue: transformers (librería declarada), vLLM, TGI o llama.cpp/Ollama previa conversión a GGUF (no se proporcionan artefactos GGUF en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.5-4B-TB2 | 4,54B | 262144 en evaluacion (nativo no disponible) | no disponible | HuggingFace (0 descargas) |
| Qwen/Qwen3.5-4B (base) | ~4B (no confirmado) | no disponible | no disponible | HuggingFace |
| Alternativas de ~4B para agentes | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo ni de especificaciones detalladas de alternativas en la información proporcionada.

## Limitaciones y advertencias

- Resultados de evaluación pendientes: no hay puntuaciones publicadas de Terminal-Bench 2.0 ni de otros benchmarks.
- Licencia no declarada: no se especifican términos de uso, lo que impide confirmar si se permite uso comercial; debe verificarse la licencia del modelo base Qwen/Qwen3.5-4B.
- Idiomas no especificados: se desconoce el soporte multilingüe real.
- Modelo de investigación con 0 descargas y 0 likes: sin validación por parte de la comunidad.
- Riesgo de alucinación y sesgos: no documentados en la model card; al ser un fine-tune de un modelo base, hereda los sesgos de este.
- Checkpoint intermedio (paso 146): puede no representar el estado final óptimo del entrenamiento.
- Capacidades multimodales inciertas: el tag `image-text-to-text` no se confirma en la model card.
- Contexto de 262144 tokens: requiere hardware con VRAM considerable; el rendimiento real a esa longitud no está verificado.

## Enlaces

- HuggingFace: https://huggingface.co/panzs19/Qwen3.5-4B-TB2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Terminal-Bench: no disponible en la información proporcionada
- Megatron-SWIFT: no disponible en la información proporcionada
- Harbor / Terminus-2: no disponible en la información proporcionada
