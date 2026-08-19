# nico248000000000/Huihui-Qwen3.8-27B-abliterated-cyber-GGUF

## Resumen

El modelo `nico248000000000/Huihui-Qwen3.8-27B-abliterated-cyber-GGUF` es un fine-tune LoRA/QLoRA sobre el checkpoint `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, que a su vez es una versión "abliterada" (modificada para eliminar ciertos rechazos de seguridad) del modelo base Qwen3.8-27B de Alibaba. Este fine-tune especializa el modelo en ciberseguridad, cubriendo áreas como pentest, red team, SOC, DFIR, GRC, arquitectura de seguridad y cuestiones de dirección (RSSI). El resultado es un asistente conversacional que responde con controles, detecciones y hardening concretos en lugar de ensayos genéricos.

El modelo conserva las capacidades multimodales del base (visión y video) aunque el SFT se realizó solo sobre texto. Está publicado en formato GGUF para su uso con llama.cpp y Ollama, con un tamaño de 27 320 697 856 parámetros (27B) y una ventana de contexto de entrenamiento de 8192 tokens. La licencia es `other`, heredada del modelo base abliterado, por lo que se deben respetar las condiciones de uso del checkpoint original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (texto, visión, video) |
| Parametros totales | 27 320 697 856 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8192 tokens (contexto de entrenamiento; el base soporta hasta 262k según fuentes externas) |
| Tipos de cuantizacion | GGUF (se menciona Q4_K_M en el README; otras cuantizaciones no disponibles) |
| Idiomas soportados | Inglés, francés (según la model card) |
| Licencia | `other` (hereda la del modelo base `huihui-ai/Huihui-Qwen3.8-27B-abliterated`) |
| Formato de pesos | GGUF (con `mmproj` para multimodalidad) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso nativo multimodal de Alibaba, con encoder de visión y video. El fine-tune se realizó con LoRA/QLoRA mediante Unsloth, con rank 32 y alpha 64, en precisión bf16. Se entrenó durante una época sobre un dataset de ciberseguridad (`dataset_cyber.jsonl`) con 57 718 ejemplos de entrenamiento y 584 de evaluación, con una división holdout del 1% (seed 42). El formato de entrenamiento fue chat-templated SFT (mensajes o instrucción+respuesta). Los targets LoRA incluyeron todas las proyecciones de atención y MLP (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). Los hiperparámetros principales: learning rate 0.0002, warmup ratio 0.05, batch efectivo 16, optimizador adamw_8bit y packing activado. El entrenamiento se ejecutó en una NVIDIA RTX PRO 6000 Blackwell Server Edition (95 GiB) y duró 12.8 minutos.

## Capacidades

- Asistente conversacional especializado en ciberseguridad: pentest, red team, SOC, DFIR, cloud e identidad, GRC (ISO, NIST, NIS2, DORA) y gestión de proyectos de seguridad (RSSI).
- Respuestas concretas y accionables: controles, detecciones, hardening, procedimientos de auditoría.
- Conserva las capacidades multimodales del base (visión y video) aunque el SFT fue solo texto; requiere el `mmproj` para usarlas.
- Soporte de chat multi-turno con formato de mensajes (chat-templated).
- Compatible con llama.cpp y Ollama mediante GGUF.

## Casos de uso

- Análisis de incidentes (DFIR): el modelo puede guiar la recopilación de evidencias, el análisis de logs y la contención de incidentes, proporcionando procedimientos paso a paso adaptados a entornos SOC.
- Diseño de controles de seguridad: para proyectos GRC, el modelo sugiere controles concretos alineados con ISO 27001, NIST, NIS2 o DORA, facilitando la preparación de auditorías.
- Detección y hardening: genera reglas de detección (por ejemplo, Sigma o YARA) y recomendaciones de endurecimiento de sistemas y redes, útiles para equipos de defensa.
- Ejercicios de mesa (tabletop): puede simular escenarios de ataque-defensa para entrenamiento de equipos, sin generar payloads ofensivos.
- Soporte a arquitectos de seguridad: ayuda a diseñar arquitecturas seguras en cloud e identidad, evaluando riesgos y proponiendo mitigaciones.
- Asistencia a responsables de seguridad (RSSI): responde preguntas sobre gestión de riesgos, cumplimiento y planificación de proyectos de seguridad, con enfoque práctico.
- Revisión de configuraciones: dado su soporte multimodal, puede analizar capturas de pantalla o diagramas de red (con el `mmproj`) para identificar problemas de configuración.

## Benchmarks y rendimiento

El autor declara únicamente la pérdida de evaluación en un holdout del dataset de ciberseguridad:

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Causal language modeling | cyber SFT holdout | eval_loss | 0.727838 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La pérdida de entrenamiento pasó de 2.7575 (primer log) a 0.0223 (último log), con una mejora del 20.4% en eval loss respecto al primer log del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K_M (~4.5 bits por peso), el modelo ocupa aproximadamente 15-16 GB, por lo que se necesita al menos 16 GB de VRAM para cargarlo completo en GPU.
- GPUs recomendadas: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB o superiores. En GPUs de 16 GB (como RTX 4080) podría funcionar con cuantizaciones más agresivas (Q3_K_M o Q2_K).
- En consumer GPU: sí, cabe en tarjetas de 24 GB con cuantización Q4_K_M; en tarjetas de 16 GB se requieren cuantizaciones menores o offloading parcial a CPU.
- Opciones de despliegue: llama.cpp (con `llama-mtmd-cli` y `--mmproj` para multimodalidad), Ollama, y servidores compatibles con GGUF (por ejemplo, llama.cpp server). También se puede cargar el modelo base en formato Transformers con el adaptador LoRA, aunque el repo solo publica GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| `huihui-ai/Huihui-Qwen3.8-27B-abliterated` (base) | 27B | 8192 (entrenamiento) | `other` | Generalista abliterado |
| `nico248000000000/Huihui-Qwen3.8-27B-abliterated-cyber-GGUF` (este) | 27B | 8192 | `other` | Ciberseguridad |
| Qwen3.8-27B original (Alibaba) | 27B | 262k (según fuentes) | Apache 2.0 | Generalista multimodal |

No se dispone de datos de rendimiento comparativo en benchmarks estándar. La comparativa se limita a características estructurales y de licencia.

## Limitaciones y advertencias

- Sesgo de dominio: la calidad del modelo cae fuera de los temas de ciberseguridad cubiertos en el SFT; no es adecuado para tareas generales de razonamiento o generación de código fuera de ese ámbito.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información incorrecta o desactualizada, especialmente en temas regulatorios o técnicos muy específicos.
- Uso ofensivo: el modelo puede explicar técnicas de ataque; el autor indica explícitamente que no debe usarse para atacar sistemas que no se poseen ni para generar payloads ofensivos.
- No sustituye a profesionales: no debe usarse como reemplazo de un auditor licenciado o de un responsable de incidentes.
- Licencia `other`: la licencia heredada del modelo base abliterado puede imponer restricciones de uso comercial o de redistribución; es necesario revisar la política de `huihui-ai/Huihui-Qwen3.8-27B-abliterated`.
- Multimodalidad limitada: aunque el modelo conserva las torres de visión y video, el SFT fue solo de texto; el rendimiento multimodal puede no estar optimizado para las tareas de ciberseguridad.
- Contexto limitado en entrenamiento: el contexto de entrenamiento es de 8192 tokens, inferior al máximo del base (262k); en la práctica, el modelo puede degradarse con contextos muy largos.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/nico248000000000/Huihui-Qwen3.8-27B-abliterated-cyber-GGUF
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Repositorio GitHub de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Perfil de huihui-ai en HuggingFace: https://huggingface.co/huihui-ai
- Artículo de YottaLabs sobre Qwen3.8-27B: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
