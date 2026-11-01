# paulwababu/GLM-5.3-CYBERSECURITY-FP8

## Resumen

GLM-5.3-CYBERSECURITY-FP8 es una modificación de pesos ("crack" o *abliteration*) del modelo GLM-5.3 en su cuantización FP8, publicada por el usuario paulwababu en Hugging Face a partir de los pesos de `JANGQ-AI/GLM-5.3-FP8`, que a su vez deriva del modelo original `zai-org/GLM-5.3`. El objetivo declarado es reducir la tasa de rechazo (refusal) en contenido técnico de ciberseguridad ofensiva: desarrollo de exploits, red team, ingeniería inversa, evasión, análisis de malware y ataques de credenciales. No se trata de un modelo nuevo entrenado desde cero, sino de una edición directa de los tensores bf16 de escritura residual sobre una base MoE de 753 329 940 480 parámetros totales.

La arquitectura es `glm_moe_dsa`, un transformer de mezcla de expertos (MoE) con atención dispersa tipo DeepSeek (DSA) y 78 capas, en modalidad solo texto. El checkpoint está en FP8 nativo, lo que permite aprovechar los tensor cores FP8 de las GPU Hopper (H100/H200) sin necesidad de descompresión a bf16 en los expertos enrutados. El repositorio ocupa 755,7 GB y la licencia declarada es MIT.

Su relevancia actual es doble: por un lado, sirve como caso de estudio de modificación de pesos orientada a dominio sobre un modelo frontera de gran escala; por otro, plantea de forma explícita el debate sobre el uso dual de modelos con rechazos reducidos en ciberseguridad. La model card documenta con detalle las limitaciones de despliegue en vLLM (MTP no funcional, contexto práctico de ~131K en TP8 con H200) y publica métricas de compliance sobre HarmBench-320.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `glm_moe_dsa` (transformer MoE con atención dispersa DeepSeek), 78 capas, solo texto |
| Parámetros totales | 753 329 940 480 |
| Parámetros activos | no disponible |
| Longitud de contexto | 131 072 tokens documentados en despliegue TP8 con H200; contexto nativo del modelo base no disponible en la información proporcionada |
| Tipos de cuantización | FP8 (checkpoint publicado); no se documentan otras variantes en este repositorio |
| Idiomas soportados | en, zh, ru, sr, hi, fr, es, ar, ko, ja |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una edición de pesos sobre `JANGQ-AI/GLM-5.3-FP8`, cuantización FP8 del GLM-5.3 de Z.ai. La arquitectura `glm_moe_dsa` combina mezcla de expertos con atención dispersa (DeepSeek Sparse Attention), lo que reduce el coste computacional de la atención en contextos largos. Los expertos enrutados permanecen en FP8 sin modificar; la intervención del autor se limita a los tensores bf16 que actúan como escritores residuales, lo que según la model card constituye una modificación genuina de pesos sin fine-tuning, sin LoRA y sin hooks en tiempo de ejecución.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base, ya que la model card del derivado no los detalla. La innovación técnica destacable es la preservación de la velocidad nativa FP8 en Hopper tras la edición de pesos, junto con el soporte de decodificación especulativa MTP (multi-token prediction) en el modelo base, aunque en este checkpoint MTP no funciona en vLLM estándar y solo se reporta operativo en un fork con backend `B12X_MLA_SPARSE`. El razonamiento se expone en `message.reasoning` y admite el parámetro `reasoning_effort` con valores `low` y `high` (cualquier otro valor cae a `max`).

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de pensamiento (`<think>`) controlable mediante `reasoning_effort`.
- Contenido técnico de ciberseguridad ofensiva: desarrollo de exploits, red team, ingeniería inversa, evasión, análisis de malware y ataques de credenciales, con rechazos reducidos en estas categorías.
- Soporte de tool calling y function calling, con parser `glm47` y `--enable-auto-tool-choice` en vLLM.
- Capacidades de agente y bucles de herramienta, aunque la model card recomienda `reasoning_effort: low` en FP8 para evitar agotar el presupuesto de `max_tokens` dentro de `<think>`.
- Multilingüe en diez idiomas: inglés, chino, ruso, serbio, hindi, francés, español, árabe, coreano y japonés.
- Solo texto: no hay soporte de visión ni audio documentado.
- Contexto largo: hasta 131K tokens en configuraciones TP8 con H200.

## Casos de uso

- Red teaming autorizado: el modelo puede generar hipótesis de ataque, cadenas de explotación y borradores de PoC para ejercicios contratados, gracias a la reducción de rechazos en contenido ofensivo y a su ventana de contexto amplia para mantener el hilo de un engagement completo.
- Análisis de malware: permite resumir y explicar comportamiento de muestras, extraer indicadores y describir técnicas MITRE ATT&CK en conversaciones multi-turno con el código o los logs como contexto.
- Formación en seguridad ofensiva: útil para generar material didáctico de laboratorio (CTFs, entornos vulnerables) donde el modelo base rechazaría partes del contenido por su naturaleza técnica sensible.
- Automatización de triaje en SOC: con tool calling puede consultar APIs de inteligencia de amenazas, enriquecer alertas y redactar informes, integrándose en pipelines existentes vía vLLM.
- Ingeniería inversa asistida: explicación de binarios, identificación de rutinas criptográficas y reconstrucción de lógica de protocolos a partir de pseudocódigo, aprovechando el contexto largo para volcar secciones extensas de desensamblado.
- Evaluación de robustez de modelos: sirve como referencia de modelo con rechazos reducidos para medir la eficacia de clasificadores de seguridad, filtros de salida y políticas de moderación en pipelines propios.
- Investigación sobre alineación y uso dual: permite estudiar cómo se distribuyen los rechazos entre dominios (ciberseguridad frente a armas, química o biología) y hasta qué punto el "sustrato compartido" de rechazos produce compliance indirecto.

## Benchmarks y rendimiento

Datos publicados en la model card. MMLU en modo logit (probabilidad sobre tokens A/B/C/D, sin generación), idéntico en base y crack:

| Métrica | Base | CRACK Cybersecurity FP8 | Δ | Umbral ±5 pp |
|---|---|---|---|---|
| MMLU (global, 1026 preguntas) | 85,58 % | 86,65 % (889/1026) | +1,07 pp | pasa |

Compliance sobre HarmBench-320 (greedy), excluyendo las 80 conductas de copyright (240 conductas de daño real):

| `reasoning_effort` | TRUE_COMPLY | SOFT_REFUSE | REDIRECT | DEFLECT | HARD_REFUSE | UNK |
|:---:|---:|---:|---:|---:|---:|---:|
| off | 196 (81,7 %) | 4 | 2 | 1 | 0 | 37 |
| low | 202 (84,2 %) | 4 | 8 | 0 | 1 | 25 |
| max | 192 (80,0 %) | 3 | 3 | 0 | 0 | 40 |

HarmBench-320 completo (incluye las 80 conductas de copyright):

| `reasoning_effort` | TRUE_COMPLY | SOFT_REFUSE | REDIRECT | DEFLECT | HARD_REFUSE | GARBAGE | UNK |
|:---:|---:|---:|---:|---:|---:|---:|---:|
| off | 203 (63,4 %) | 58 (18,1 %) | 7 | 1 | 0 | 0 | 51 |
| low | 223 (69,7 %) | 52 (16,3 %) | 10 | 0 | 1 | 0 | 34 |
| max | 205 (64,1 %) | 51 (15,9 %) | 9 | 0 | 0 | 2 | 53 |

No se han publicado resultados de MMLU-Pro, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 755,7 GB en FP8, por lo que la inferencia requiere agregar al menos ese volumen más overhead de KV cache. No cabe en ninguna GPU de consumo.
- GPU recomendadas: 8× H200 (TP8) es la configuración documentada y probada; también se reporta funcionamiento en 8× DGX Spark GB10. Con H100 se espera comportamiento similar por el soporte FP8 nativo, aunque no está documentado en la información disponible.
- GPU de consumo: no es viable. El modelo no cabe en RTX 4090, RTX 5090 ni configuraciones multi-GPU de consumo razonables.
- Despliegue: vLLM con `--tensor-parallel-size 8`, `--enforce-eager` obligatorio para la ruta de atención dispersa bajo concurrencia, `--enable-prefix-caching`, `--max-num-seqs 24` y `--max-model-len 131072`. El pipeline-parallel (PP2 × TP4) perfila correctamente, aunque el draft MTP no implementa `SupportsPP`.
- Contexto práctico: ~131K tokens con MTP en TP8 sobre H200 y ~160K sin MTP; el contexto de 1M vía decode-context-parallel está cerrado en vLLM para `glm_moe_dsa` por incompatibilidad del indexador DSA con el sharding de MLA KV.
- Latencia y throughput: no disponibles de forma numérica, salvo el dato de +48 % de decodificación en prompts de código con el fork B12X sparse-MLA y MTP activo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-CYBERSECURITY-FP8 (este) | 753B totales, MoE | 131K documentado | MIT | Ciberseguridad ofensiva, rechazos reducidos | Hugging Face, 21 descargas |
| GLM-5.3-UNCENSORED-FP8 (dealignai) | 753B totales, MoE | no disponible | MIT (según repositorio base) | Uncensor generalista del mismo base | Hugging Face |
| zai-org/GLM-5.3 (base) | 753B totales, MoE | no disponible | no disponible | Modelo generalista con alineación estándar | Hugging Face |
| JANGQ-AI/GLM-5.3-FP8 | 753B totales, MoE | no disponible | no disponible | Cuantización FP8 del base sin modificar rechazos | Hugging Face |

No se dispone de datos de benchmarks comparativos frente a alternativas de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo reduce rechazos específicamente en ciberseguridad; en otras categorías (armas, química, biología, acoso, desinformación) a menudo cumple con un envoltorio "educativo" por sustrato compartido, pero no es un uncensor universal. La reproducción literal de material con copyright sigue rechazándose.
- Riesgo elevado de uso malicioso: la reducción deliberada de rechazos en contenido ofensivo lo hace inadecuado para despliegues públicos sin filtros adicionales de entrada y salida.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad ni de tasa de alucinación en la información disponible.
- Limitaciones de razonamiento: `reasoning_effort` solo acepta `low` y `high`; cualquier otro valor cae a `max`. En FP8, con `high` o `max` el modelo puede consumir todo el presupuesto de `max_tokens` dentro de `<think>` y devolver cero tokens de respuesta, por lo que se recomienda `max_tokens ≥ 8000` o `low` en bucles de agente.
- MTP no funcional en vLLM estándar; requiere fork específico. El contexto de 1M no es alcanzable hoy en vLLM para esta arquitectura.
- Licencia MIT declarada, lo que en principio permite uso comercial, pero el usuario asume la responsabilidad legal sobre el contenido generado en dominios regulados.
- Trazabilidad limitada: 21 descargas y 0 likes en el momento de la consulta; el autor es un particular y no hay auditoría externa de la modificación de pesos.
- Idiomas: aunque declara diez, no hay evaluación de calidad por idioma; el rendimiento en idiomas distintos de inglés y chino puede degradarse.
- Solo texto: no admite imágenes, audio ni vídeo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/paulwababu/GLM-5.3-CYBERSECURITY-FP8
- Modelo base original: https://huggingface.co/zai-org/GLM-5.3
- Cuantización FP8 de referencia: https://huggingface.co/JANGQ-AI/GLM-5.3-FP8
- Variante uncensored hermana: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8
- Discusión sobre despliegue en 8× DGX Spark GB10: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8/discussions/3
- Ficha en abliteratedmodels.org: https://www.abliteratedmodels.org/glm-5.3-cybersecurity/
- Ficha de hardware y despliegue en YouRunAI: https://www.yourunai.com/models/dealignai-glm-5-3-cybersecurity-fp8-aeb635
- Réplica del checkpoint: https://huggingface.co/mindflar909/GLM-5.3-CYBERSECURITY-FP8
