# nico248000000000/Qwen3.8-27B-Uncensored-cyber-LoRA

## Resumen

`Qwen3.8-27B-Uncensored-cyber-LoRA` es un adaptador LoRA de rango 8 (alpha 16) publicado por el usuario `nico248000000000`, que especializa el modelo base `orcarouter/Qwen3.8-27B-Uncensored` en tareas de ciberseguridad. El base es una versión "uncensored" (abliterated, con rechazos eliminados) de Qwen3.8-27B, un modelo denso de 27 000 millones de parámetros con arquitectura híbrida (atención lineal Gated DeltaNet + atención completa), nativo multimodal (visión y video), con razonamiento, tool-calling y decodificación especulativa MTP.

El adaptador se entrenó con QLoRA (Unsloth) en bf16 sobre un corpus SFT curado de procedimientos de ciberseguridad (pentest/red team, SOC/DFIR, cloud e identidad, GRC, RSSI), con 56 538 ejemplos de entrenamiento y 2 976 de validación. El autor lo presenta como un asistente de ciberseguridad orientado a respuestas concretas (controles, detecciones, hardening) y advierte explícitamente que es solo para pruebas y evaluación, no para producción. La relevancia actual radica en que cubre un nicho específico —ciberseguridad ofensiva y defensiva— sobre un base multimodal reciente, manteniendo las capacidades de visión y video del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen3.8-27B-Uncensored; base denso híbrido (Gated DeltaNet linear attention + full attention) |
| Parametros totales | 27 000 millones (modelo base); adaptador LoRA ~0.2 GB (repo) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (contexto de entrenamiento del LoRA); contexto nativo del base no disponible |
| Tipos de cuantizacion | LoRA en bf16; el base dispone de versiones GGUF de 2-bit a 8-bit (segun Ollama) |
| Idiomas soportados | en, fr (declarados en la model card) |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors (PEFT/LoRA); el base tambien disponible en GGUF |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `orcarouter/Qwen3.8-27B-Uncensored`, un modelo denso de 27B con arquitectura híbrida que combina atención lineal Gated DeltaNet con atención completa, lo que reduce el coste computacional en secuencias largas. El base es nativo multimodal (visión y video), incluye modo de razonamiento (thinking), tool-calling y una cabeza de decodificación especulativa MTP. La versión "uncensored" se obtiene mediante abliteration (eliminación de rechazos) sobre el modelo original de Qwen.

El LoRA se entrena con QLoRA (Unsloth) en bf16, con rango 8 y alpha 16, sobre un dataset SFT de ciberseguridad (`dataset_cyber.quality.jsonl`) con formato chat-templated. Hiperparámetros: 1 época, learning rate 5e-05, warmup ratio 0.05, batch efectivo 12, optimizador adamw_8bit, packing activado. Los targets LoRA cubren todas las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y del MLP (`gate_proj`, `up_proj`, `down_proj`, `out_proj`). Las capas multimodales (visión, video) se congelaron durante el SFT para preservar las capacidades del base. El entrenamiento se realizó en una NVIDIA RTX PRO 6000 Blackwell Server Edition (95 GiB) durante 231.5 minutos.

## Capacidades

- Especialización en ciberseguridad: pentest/red team, SOC y DFIR, cloud e identidad, GRC (ISO, NIST, NIS2, DORA) y preguntas de RSSI/gestión de proyectos.
- Respuestas concretas y accionables: listas de controles, detecciones, medidas de hardening, en lugar de ensayos genéricos.
- Preservación de capacidades multimodales del base: visión y video (las capas de medios se mantuvieron congeladas durante el SFT).
- Razonamiento con modo thinking (el prompt de ejemplo muestra "Reasoning effort is set to xhigh").
- Tool-calling y decodificación especulativa MTP heredados del modelo base.
- Multilingüe limitado a inglés y francés según la model card.
- Evaluación del autor indica que las habilidades generales de texto se preservan (drop 0.000 con el adaptador desactivado vs activado).

## Casos de uso

- Diseño de arquitectura Zero Trust: el modelo genera listas de controles concretas (identidad, postura de dispositivo, microsegmentación, cifrado, logging, detección) para implementaciones prácticas, como muestra el ejemplo de la model card.
- Operaciones de SOC y DFIR: análisis de incidentes, elaboración de playbooks de respuesta, correlación de indicadores de compromiso y recomendaciones de contención.
- Preparación de auditorías y cumplimiento GRC: mapeo de controles a ISO 27001, NIST, NIS2 y DORA, y generación de evidencia para auditorías.
- Tabletop exercises y simulacros de incidentes: diseño de escenarios de ataque-defensa y evaluación de la respuesta del equipo sin necesidad de payloads reales.
- Ingeniería de detección: redacción de reglas de detección (p. ej., consultas SIEM o reglas Sigma) y validación de cobertura frente a técnicas conocidas.
- Hardening de cloud e identidad: revisión de políticas IAM, configuración de identidades federadas y recomendaciones de endurecimiento para entornos cloud.
- Formación y concienciación en seguridad: generación de material didáctico sobre técnicas de ataque (sin payloads armados) y buenas prácticas defensivas para equipos técnicos.

## Benchmarks y rendimiento

El autor declara únicamente la pérdida de evaluación sobre el holdout del dataset de ciberseguridad. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Metrica | Referencia (base) | Este fine-tune | Delta |
|---|---:|---:|---:|
| Holdout loss (pre-SFT -> mejor LoRA) | 3.0954 | 0.8778 | -71.6% |
| Train loss (primera -> ultima log) | 3.1509 | 0.9779 | -69.0% |
| Train loss (mejor) | — | 0.7867 | — |
| Eval loss (holdout, primera -> ultima) | 1.0682 | 0.8778 | -17.8% |

El autor reporta que todos los checks de release pasan: sin regresión en holdout, 10 evaluaciones de validación durante el entrenamiento, sin rebote tardío de validación, y preservación de habilidades generales de texto (drop 0.000).

## Requisitos de hardware

- El adaptador LoRA ocupa ~0.2 GB, pero la inferencia requiere cargar el modelo base completo de 27B.
- VRAM estimada: con cuantización GGUF de 4-bit, ~16-18 GB; en bf16/fp16, ~54-60 GB.
- GPUs recomendadas: RTX 4090 (24 GB) con cuantización 4-bit; A100 40/80 GB o H100 para precision completa; el entrenamiento se realizó en RTX PRO 6000 Blackwell (95 GiB).
- Cabe en GPUs de consumo (RTX 3090/4090) solo con cuantización GGUF de 4-bit o inferior.
- Opciones de despliegue: Transformers con PEFT (cargar base + adaptador), vLLM, llama.cpp, Ollama (el base tiene 16 tags GGUF con mmproj incluido), TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-cyber-LoRA (este) | 27B (base) + LoRA | 4096 (entrenamiento) | Ciberseguridad (SFT) | other | Hugging Face |
| orcarouter/Qwen3.8-27B-Uncensored (base) | 27B | no disponible | General, abliterated | other | Hugging Face, Ollama |
| Qwen3.8-27B (original) | 27B | no disponible | General multimodal | Apache 2.0 (segun repo oficial) | GitHub, Hugging Face |

No se dispone de comparativas publicadas con otros modelos especializados en ciberseguridad (p. ej., fine-tunes de Llama o Mistral para cyber). La comparacion directa con el base muestra una mejora del 71.6% en la perdida del holdout cyber, pero no hay datos de benchmarks estandar para comparar con alternativas.

## Limitaciones y advertencias

- El autor declara explicitamente: "Testing only — not for production". El modelo se mantiene solo para pruebas y evaluacion, no para uso en produccion.
- Fuera de alcance: no debe usarse para atacar sistemas que no se poseen, generar payloads de exploits, ni como sustituto de un auditor licenciado o de un responsable de incidentes.
- Riesgo de alucinacion en temas tecnicos: al ser un fine-tune sobre un dataset limitado, puede generar controles o detecciones incorrectas; requiere validacion humana.
- Sesgos: entrenado principalmente en ingles y frances; puede tener sesgos culturales o de terminologia en otros idiomas.
- Contexto limitado: el LoRA se entreno con 4096 tokens; puede no generalizar bien a contextos mas largos que el base soporte.
- Licencia "other" no especificada: no se detallan restricciones de uso comercial; el base es abliterated (uncensored), lo que puede implicar limitaciones legales o eticas en algunos entornos.
- El dataset de entrenamiento fue creado por el autor y enriquecido con ayuda de modelos de IA, lo que puede introducir sesgos o errores en los datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nico248000000000/Qwen3.8-27B-Uncensored-cyber-LoRA
- Modelo base en Hugging Face: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Repositorio oficial de Qwen3.8-27B en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Modelo base en Ollama: https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
- Ficha del modelo en NanoGPT: https://nano-gpt.com/models/text/qwen/qwen3.8-27b-uncensored
