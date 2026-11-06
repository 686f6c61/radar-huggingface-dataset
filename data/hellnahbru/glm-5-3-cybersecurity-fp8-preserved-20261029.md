# hellnahbru/GLM-5.3-CYBERSECURITY-FP8-preserved-20261029

## Resumen

GLM-5.3-CYBERSECURITY-FP8-preserved-20261029 es una modificación de pesos del modelo GLM-5.3 de Z.ai (zai-org), publicada por el usuario hellnahbru bajo la marca dealignai. Se trata de un "crack" de dominio específico orientado a ciberseguridad ofensiva: reduce los rechazos (refusals) del modelo base en categorías como red-team, desarrollo de exploits, ingeniería inversa, evasión, phishing, ataques a credenciales y análisis de malware. La modificación es una edición directa de pesos (abliteration) sobre los escritores de residuales en bf16, sin fine-tuning, sin LoRA y sin hooks en tiempo de ejecución.

El modelo base es un transformer MoE de 753.329.940.480 parámetros totales con arquitectura `glm_moe_dsa` (DeepSeek sparse attention), 78 capas y modalidad exclusivamente de texto. Se distribuye en formato FP8 nativo, lo que permite aprovechar los tensor cores FP8 en GPUs Hopper (H100/H200). El repositorio ocupa 755,7 GB en safetensors.

Es relevante para equipos de seguridad que necesitan un modelo con capacidad técnica en dominios ofensivos sin las fricciones de rechazo del modelo alineado, pero con la advertencia de que su licencia MIT y su naturaleza de "refusal-removed" implican riesgos legales y de uso considerables. La ficha describe el checkpoint tal como se publica; el uso responsable y legal es responsabilidad del operador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `glm_moe_dsa` (transformer MoE con DeepSeek sparse attention), 78 capas, text-only |
| Parámetros totales | 753.329.940.480 |
| Parámetros activos | no disponible |
| Longitud de contexto | hasta 131.072 tokens en TP8 sobre 8× H200 (el modelo base soporta más; 1M vía decode-context-parallel no es viable en vLLM actualmente) |
| Tipos de cuantización | FP8 nativo (base `JANGQ-AI/GLM-5.3-FP8`); pesos en safetensors FP8 |
| Idiomas soportados | en, zh, ru, sr, hi, fr, es, ar, ko, ja |
| Licencia | MIT |
| Formato de pesos | safetensors (FP8) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura `glm_moe_dsa` del GLM-5.3 original: un transformer de mezcla de expertos (MoE) con atención dispersa tipo DeepSeek (DSA) y 78 capas. La modalidad es exclusivamente texto. El checkpoint parte de `JANGQ-AI/GLM-5.3-FP8`, una cuantización FP8 del modelo upstream `zai-org/GLM-5.3`; los expertos enrutados en FP8 permanecen sin cambios y solo se editan los escritores de residuales en bf16 para producir el efecto de abliteration.

No se documenta en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La modificación en sí no es un entrenamiento: es una edición de pesos ("genuine weight modification") que altera la dirección de rechazo del modelo. El resultado conserva el rendimiento del base en MMLU según la evaluación del autor (86,65% frente a 85,58% del baseline previo en bf16), lo que sugiere que la edición no degrada de forma apreciable las capacidades generales medidas por logits.

Una innovación operativa destacable es el soporte de decodificación especulativa MTP (multi-token prediction), aunque en vLLM estándar no es funcional para este checkpoint; el autor reporta que funciona en el fork B12X de ciprianveg con `--draft-attention-backend B12X_MLA_SPARSE`, con una mejora del 48% en decodificación en prompts de código. El modo de razonamiento (`reasoning_effort`) solo acepta `"low"` y `"high"`; cualquier otro valor cae a `max`.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de pensamiento (`<think>`), expuesto en `message.reasoning`.
- Conocimiento técnico de ciberseguridad ofensiva: red-team, desarrollo de exploits, ingeniería inversa, evasión, phishing, ataques a credenciales y análisis de malware, con rechazo reducido en estas categorías.
- Soporte de tool calling y function calling (`--tool-call-parser glm47`, `--enable-auto-tool-choice`).
- Soporte de agentes y bucles de herramientas, con la advertencia de usar `reasoning_effort="low"` en FP8 para evitar agotar el presupuesto de `max_tokens` dentro del bloque de pensamiento.
- Capacidades multilingües en 10 idiomas (en, zh, ru, sr, hi, fr, es, ar, ko, ja).
- Cumplimiento parcial en dominios no ciber: el autor indica que en armas, química, biología, acoso y desinformación a menudo responde con un envoltorio "educativo" suave, pero no es un uncensor universal.
- La reproducción literal de material con copyright sigue presentando rechazo suave en esta variante.

## Casos de uso

- Red-team autorizado y pruebas de penetración: el modelo puede generar hipótesis de ataque, cadenas de explotación y payloads de prueba en entornos con contrato de autorización, aprovechando su rechazo reducido en dominios ofensivos.
- Análisis de malware: asistencia en la descomposición de muestras, identificación de técnicas de persistencia y evasión, y redacción de informes técnicos, con contexto de hasta 131K tokens para volcar trazas y cadenas de análisis.
- Ingeniería inversa de binarios: apoyo en la interpretación de desensamblado, identificación de rutinas y reconstrucción de lógica, integrable en un pipeline con tool calling hacia desensambladores.
- Formación y concienciación en seguridad: generación de escenarios de phishing simulados y ejercicios de respuesta, con la salvedad de que el operador debe garantizar el marco legal y el consentimiento.
- Automatización de triaje en un SOC: clasificación y enriquecimiento de alertas con contexto largo, usando `reasoning_effort="low"` para mantener latencia y evitar el agotamiento del presupuesto de tokens en bucles de herramientas.
- Evaluación de defensas y detección: generación de variantes de técnicas ofensivas para probar reglas de detección y firmas, con el modelo como generador de casos adversarios controlados.
- Investigación en seguridad de IA: estudio de comportamiento de rechazo y alineación, usando las métricas de HarmBench-320 publicadas por el autor como referencia reproducible.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. La evaluación MMLU se realizó en modo logit (probabilidad sobre tokens A/B/C/D, sin generación).

| Benchmark | Base | CRACK Cybersecurity FP8 | Δ |
|---|---|---|---|
| MMLU (overall, 1026 preguntas) | 85,58% (baseline previo bf16) | 86,65% (889/1026) | +1,07 pp |

Comportamiento de cumplimiento en HarmBench-320 (greedy, 240 comportamientos sin copyright):

| reasoning_effort | TRUE_COMPLY | SOFT_REFUSE | REDIRECT | DEFLECT | HARD_REFUSE | UNK |
|:---:|---:|---:|---:|---:|---:|---:|
| off | 196 (81,7%) | 4 | 2 | 1 | 0 | 37 |
| low | 202 (84,2%) | 4 | 8 | 0 | 1 | 25 |
| max | 192 (80,0%) | 3 | 3 | 0 | 0 | 40 |

HarmBench-320 completo (incluye 80 comportamientos de copyright):

| reasoning_effort | TRUE_COMPLY | SOFT_REFUSE | REDIRECT | DEFLECT | HARD_REFUSE | GARBAGE | UNK |
|:---:|---:|---:|---:|---:|---:|---:|---:|
| off | 203 (63,4%) | 58 (18,1%) | 7 | 1 | 0 | 0 | 51 |
| low | 223 (69,7%) | 52 (16,3%) | 10 | 0 | 1 | 0 | 34 |
| max | 205 (64,1%) | 51 (15,9%) | 9 | 0 | 0 | 2 | 53 |

No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 755,7 GB en FP8; en la práctica se sirve con tensor parallelism sobre 8 GPUs. El autor documenta TP8 sobre 8× H200 con `--gpu-memory-utilization 0.90` y `--max-model-len 131072`.
- GPU recomendadas: H100 y H200 (FP8 nativo en Hopper). El autor reporta pruebas de campo en 8× DGX Spark GB10.
- No cabe en GPU de consumo: 753B parámetros en FP8 exigen un despliegue multi-GPU de clase数据中心; no es viable en RTX 4090 ni en una sola GPU consumer.
- Opciones de despliegue: vLLM (probado por el autor), con `--enforce-eager` obligatorio para la ruta de atención dispersa bajo concurrencia. MTP especulativo no funcional en vLLM estándar; funciona en el fork B12X de ciprianveg. No se documenta soporte en llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras absolutas. El autor reporta +48% de decodificación en prompts de código con el fork B12X y MTP. El techo práctico de contexto en TP8 H200 es de ~131K con MTP y ~160K sin MTP; 1M vía decode-context-parallel está cerrado en `glm_moe_dsa` en vLLM actual (error de `page size` en `fp8_ds_mla`).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-CYBERSECURITY-FP8 (este) | 753B (MoE) | 131K en TP8 H200 | MIT | Ciberseguridad ofensiva, refusal reducido | Hugging Face, 37 descargas |
| zai-org/GLM-5.3 (base) | 753B (MoE) | no disponible en la información | no disponible en la información | Propósito general alineado | Hugging Face |
| dealignai/GLM-5.3-UNCENSORED-FP8 | 753B (MoE) | no disponible | no disponible | Uncensor general | Hugging Face |
| JANGQ-AI/GLM-5.3-FP8 | 753B (MoE) | no disponible | no disponible | Cuantización FP8 del base | Hugging Face |

## Limitaciones y advertencias

- Modelo de "refusal-removed" orientado a ciberseguridad ofensiva: puede generar contenido de doble uso (exploits, malware, phishing, evasión) sin las salvaguardas del base. El uso debe limitarse a entornos autorizados y con marco legal claro.
- No es un uncensor universal: en armas, química, biología, acoso y desinformación a menudo cumple con un envoltorio educativo suave, pero no está garantizado; la reproducción literal con copyright sigue rechazándose en buena parte de los casos.
- Riesgo de alucinación: no se documentan evaluaciones de factualidad; como todo LLM, puede generar detalles técnicos plausibles pero incorrectos, especialmente en análisis de malware o exploits.
- Limitaciones de contexto: el techo práctico es ~131K en TP8 H200 con MTP y ~160K sin MTP; el contexto de 1M no es viable en vLLM actual por el error de `page size` en `fp8_ds_mla`.
- Modo de razonamiento restringido: `reasoning_effort` solo acepta `"low"` y `"high"`; no se puede desactivar. En FP8, con `high`/`max` el modelo puede consumir todo `max_tokens` dentro de `<think>` y devolver cero tokens de respuesta; se recomienda `low` para agentes y `max_tokens ≥ 8000` si se usa `high`.
- El texto de razonamiento está en `message.reasoning`, no en `message.reasoning_content`.
- Licencia MIT: permite uso comercial, pero la responsabilidad legal del uso ofensivo recae en el operador; el autor no ofrece garantías.
- Trazabilidad: 37 descargas y 0 likes en el momento de la ficha; es un checkpoint de nicho con validación comunitaria limitada.

## Enlaces

- Hugging Face: https://huggingface.co/hellnahbru/GLM-5.3-CYBERSECURITY-FP8-preserved-20261029
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Cuantización FP8 base: https://huggingface.co/JANGQ-AI/GLM-5.3-FP8
- Modelo hermano (uncensor general): https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8
- Discusión de runtime en DGX Spark GB10: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8/discussions/3
- Perfil del autor de la marca: https://huggingface.co/dealignai
- Twitter: https://twitter.com/dealignai
