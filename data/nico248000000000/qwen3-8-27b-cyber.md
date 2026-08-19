# nico248000000000/Qwen3.8-27B-cyber

## Resumen

Qwen3.8-27B-cyber es un ajuste fino especializado en ciberseguridad del modelo base Qwen/Qwen3.8-27B, desarrollado por el usuario nico248000000000 mediante LoRA/QLoRA con la librería Unsloth. El modelo cubre dominios ofensivos y defensivos (pentest, SOC/DFIR, GRC, arquitectura, RSSI) y está entrenado para producir respuestas concretas —controles, detecciones, hardening— en lugar de ensayos genéricos. Es relevante porque adapta un modelo multimodal general de 27 000 millones de parámetros a un dominio técnico de alta demanda, manteniendo las capacidades de visión y vídeo del modelo base.

El checkpoint conserva las torres multimodales (visión y vídeo) del modelo original, aunque durante el entrenamiento SFT solo se actualizaron las capas de texto. El contexto de entrenamiento fue de 2048 tokens, mientras que el modelo base soporta hasta 262 000 tokens. El repositorio pesa 109,2 GB y los pesos están en formato safetensors. La licencia es `other`, heredada del modelo base de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (visión, vídeo y texto), basado en Qwen3.8-27B |
| Parametros totales | 27 781 427 952 (27,8 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (entrenamiento); 262 000 tokens (capacidad del modelo base) |
| Tipos de cuantizacion | No especificados en el repo; entrenado en bf16 LoRA (pesos base en bf16) |
| Idiomas soportados | Inglés (en), francés (fr) |
| Licencia | `other` (hereda la licencia de Qwen/Qwen3.8-27B) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso multimodal de 27 000 millones de parámetros, diseñado por Alibaba para tareas de código, agentes y automatización de oficina, con entrada nativa de imagen y vídeo. El ajuste fino se realizó con LoRA de rango 8 y alfa 16, aplicado a todas las proyecciones lineales (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). El entrenamiento se ejecutó durante 1 época sobre un dataset de ciberseguridad (`dataset_cyber.jsonl`) con 57 718 ejemplos de entrenamiento y 584 de evaluación, con una partición holdout del 1 % y semilla 42.

El proceso usó QLoRA con cuantización bf16, optimizador AdamW de 8 bits, learning rate de 0,0002, warmup del 5 % y batch efectivo de 8. Se empleó empaquetado de secuencias (packing) para maximizar el uso de tokens. Las torres de visión y audio se congelaron durante el SFT, por lo que el modelo conserva las capacidades multimodales del base sin reentrenarlas. La pérdida de entrenamiento descendió de 2,8025 (primer log) a 0,1832 (último log), y la pérdida de evaluación en holdout pasó de 0,9783 a 0,7412.

## Capacidades

- Generación de texto experto en ciberseguridad: respuestas concretas sobre pentest, red team, SOC, DFIR, cloud, identidad, GRC (ISO, NIST, NIS2, DORA) y gestión de proyectos de seguridad.
- Razonamiento técnico multi-paso: diseño de arquitecturas Zero Trust, planificación de controles de seguridad y análisis de detecciones.
- Soporte de entrada multimodal: mantiene las torres de visión y vídeo del modelo base, permitiendo procesar imágenes y vídeo además de texto.
- Conversación multi-turno: entrenado con formato chat-templated (`messages` / `instruction`+`output`), adecuado para asistentes conversacionales.
- Capacidades multilingües limitadas: inglés y francés declarados en la model card.
- No se menciona soporte explícito de tool calling o function calling en la documentación del fine-tune.

## Casos de uso

- Asistente de auditoría GRC: el modelo puede responder preguntas sobre controles ISO 27001, NIST, NIS2 y DORA, ayudando a preparar auditorías de cumplimiento con listas de controles concretas.
- Ingeniería de detección en SOC: genera reglas de detección, consultas de búsqueda de amenazas y procedimientos de respuesta ante incidentes (DFIR) basados en el corpus SFT.
- Diseño de arquitectura Zero Trust: permite obtener listas de controles de red, identidad y segmentación para diseñar infraestructuras seguras, como se muestra en el ejemplo de uso del README.
- Preparación de tabletop exercises: el modelo puede simular escenarios de ataque y defensa para ejercicios de mesa, generando preguntas y respuestas técnicas sin payloads armados.
- Documentación de hardening: genera guías de endurecimiento de sistemas, servicios cloud y entornos de identidad con pasos accionables.
- Formación interna en seguridad: sirve como tutor para equipos de desarrollo y operaciones, explicando técnicas de ataque de forma didáctica y sin código malicioso.
- Soporte a RSSI y gestión de proyectos: responde preguntas de gestión de riesgos, métricas de seguridad y planificación de programas de seguridad.

## Benchmarks y rendimiento

El autor solo declara un resultado de evaluación en la model card: pérdida de evaluación (eval_loss) sobre el holdout del dataset de ciberseguridad. No se han publicado resultados en benchmarks públicos como MMLU, HumanEval o GSM8K.

| Dataset | Métrica | Valor |
|---|---|---|
| cyber SFT holdout | eval_loss | 0,741224 |

Comparación con la referencia (modelo base, primer log de entrenamiento):

| Métrica | Referencia | Fine-tune | Delta |
|---|---:|---:|---:|
| Pérdida de entrenamiento (primera → última) | 2,8025 | 0,1832 | -93,5 % |
| Pérdida de entrenamiento (mejor) | — | 0,6627 | — |
| Pérdida de evaluación (holdout) | 0,9783 | 0,7412 | -24,2 % |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 55,6 GB en precisión bf16, según LLM Explorer.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell Server Edition (usada en entrenamiento, 95 GiB), A100 80 GB, H100 80 GB, o GPUs con al menos 56 GB de VRAM para carga completa.
- En consumer GPU: no cabe en tarjetas de 24 GB (RTX 4090) sin cuantización; se necesitaría cuantización GGUF de 4 bits o similar para reducir el uso de VRAM a ~14-16 GB.
- Opciones de despliegue: transformers con `device_map="auto"`, vLLM, TGI, llama.cpp (si se generan pesos GGUF), Ollama (si se convierte), FriendliAI (servicio de inferencia compatible).
- Latencia y throughput: no se han publicado mediciones específicas para este fine-tune; dependen del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwen3.8-27B-cyber | 27,8 B | 262 K (base) | texto, imagen, vídeo | other (Qwen) | Ciberseguridad SFT |
| Qwen/Qwen3.8-27B (base) | 27,8 B | 262 K | texto, imagen, vídeo | Apache 2.0 | General multimodal |
| No disponible | — | — | — | — | — |

No se dispone de información sobre otros modelos de ciberseguridad comparables en el mismo rango de parámetros. El modelo base es la referencia natural: el fine-tune reduce la pérdida de evaluación en un 24,2 % respecto al primer log del base, pero sacrifica rendimiento fuera del dominio SFT.

## Limitaciones y advertencias

- Degradación fuera del dominio: la calidad cae notablemente en temas ajenos a la ciberseguridad, por el cambio de distribución del dataset SFT.
- La evaluación declarada es solo pérdida en holdout, no un benchmark público; no hay evidencia de rendimiento en tareas estándar.
- Riesgo de alucinación: como cualquier modelo generativo, puede inventar controles, referencias o procedimientos; no debe sustituir a un auditor licenciado o a un responsable de incidentes.
- Uso restringido: el autor prohíbe explícitamente usarlo para atacar sistemas no propios, generar payloads armados o como sustituto de profesionales certificados.
- Licencia `other`: hereda la licencia y la política de uso aceptable de Qwen/Qwen3.8-27B; hay que revisar los términos del modelo base antes de uso comercial.
- Contexto de entrenamiento limitado a 2048 tokens: aunque el base soporta 262 K, el fine-tune no ha visto secuencias largas, por lo que el rendimiento en conversaciones muy extensas puede degradarse.
- Idiomas limitados: solo se declaran inglés y francés; el rendimiento en otros idiomas no está garantizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nico248000000000/Qwen3.8-27B-cyber
- Repositorio LoRA separado: https://huggingface.co/nico248000000000/Qwen3.8-27B-cyber-LoRA
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- GitHub oficial del modelo base: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Ficha en LLM Explorer: https://llm-explorer.com/model/nico248000000000%2FQwen3.8-27B-cyber,2J9j9a7tCNwly3YxHhJ1nE
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/nico248000000000/Qwen3.8-27B-cyber
- Guía del modelo base (blog): https://lovableapp.org/blog/qwen3-8-27b
