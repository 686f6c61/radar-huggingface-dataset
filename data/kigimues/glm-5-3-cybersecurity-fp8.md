# kigimues/GLM-5.3-CYBERSECURITY-FP8

## Resumen

GLM-5.3-CYBERSECURITY-FP8 es una modificación de pesos del modelo GLM-5.3 de Z.ai (zai-org), publicada por el usuario kigimues bajo la técnica denominada "abliteration" o "CRACK" en la jerga del autor. El resultado es un checkpoint de 753.329.940.480 parámetros (aproximadamente 753B) con arquitectura `glm_moe_dsa` de tipo mezcla de expertos (MoE) y atención dispersa, derivado de la cuantización FP8 `JANGQ-AI/GLM-5.3-FP8`, que a su vez parte del modelo original `zai-org/GLM-5.3`. La modificación se centra en reducir los rechazos (refusals) en el dominio de ciberseguridad ofensiva: pentesting, red-team, desarrollo de exploits, ingeniería inversa, evasión, análisis de malware y ataques a credenciales.

El modelo no es un "uncensor" generalista. Según la model card, la reducción de rechazos está afinada específicamente para contenido técnico de seguridad ofensiva; en otras categorías (armas, química, biología, acoso, desinformación) el modelo a menudo cumple con un envoltorio "educativo", pero la reproducción literal de material con copyright sigue produciendo rechazos suaves. La modificación es de pesos reales: no hay fine-tuning, LoRA, hooks en tiempo de ejecución ni trucos de prompt, y el checkpoint se carga con vLLM estándar.

Es relevante ahora porque demuestra que es posible alterar el comportamiento de rechazo de un modelo MoE de 753B en FP8 sin degradar de forma apreciable su capacidad general: el autor reporta una puntuación MMLU en modo logit de 86,65 % (889/1026) frente a un 85,58 % de referencia del modelo base, una diferencia de +1,07 puntos porcentuales. El repo ocupa 755,7 GB y se distribuye en safetensors con licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `glm_moe_dsa` (MoE con atención dispersa, 78 capas, solo texto) |
| Parametros totales | 753.329.940.480 (≈753B) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens verificados en TP8 sobre 8× H200; techo práctico ~131K con MTP y ~160K sin MTP; 1M vía decode-context-parallel no operativo en vLLM |
| Tipos de cuantizacion | FP8 (nativo, expertos enrutados en FP8; escrituras residuales en bf16) |
| Idiomas soportados | en, zh, ru, sr, hi, fr, es, ar, ko, ja |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base GLM-5.3 emplea la arquitectura `glm_moe_dsa`: un transformer de mezcla de expertos con atención dispersa (DeepSeek-sparse attention, según las notas de despliegue) y 78 capas, en modalidad solo texto. La variante aquí publicada parte de la cuantización FP8 `JANGQ-AI/GLM-5.3-FP8`, en la que los expertos enrutados se mantienen en FP8 y solo los escritores residuales en bf16. La modificación CRACK actúa exclusivamente sobre esos escritores residuales en bf16, dejando intactos los expertos FP8 enrutados; de ahí que se conserve la velocidad nativa de tensor cores FP8 en Hopper (H100/H200).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base, más allá de lo que declare Z.ai en su model card original. La innovación técnica destacable es el propio método de modificación de pesos sin reentrenamiento, junto con el soporte de MTP (multi-token prediction) para decodificación especulativa, que en este checkpoint no funciona en vLLM estándar pero sí, según el autor, en el fork B12X sparse-MLA de ciprianveg con `--draft-attention-backend B12X_MLA_SPARSE`, con una mejora reportada del +48 % en decodificación sobre prompts de código.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento (`<think>`) controlable mediante `reasoning_effort`, aunque solo se honran los valores `"low"` y `"high"`; cualquier otro valor cae a `max` y no es posible desactivar el razonamiento en este checkpoint.
- Conocimiento técnico de ciberseguridad ofensiva: pentesting, red-team, desarrollo de exploits, ingeniería inversa, evasión, análisis de malware y ataques a credenciales, con rechazos reducidos de forma específica en estas áreas.
- Tool calling y function calling: la receta de servicio incluye `--tool-call-parser glm47` y `--enable-auto-tool-choice`.
- Soporte de agentes y razonamiento multi-paso, con la advertencia de que en FP8 conviene usar `reasoning_effort="low"` en bucles de herramientas para evitar agotar el presupuesto de `max_tokens` dentro de `<think>`.
- Capacidades multilingües en diez idiomas: inglés, chino, ruso, serbio, hindi, francés, español, árabe, coreano y japonés.
- Contexto largo de hasta 131K tokens en configuraciones TP8 sobre H200.
- Sin capacidades de visión ni audio: el modelo base es solo texto.

## Casos de uso

- Red-team autorizado y pruebas de penetración: el modelo puede generar hipótesis de ataque, cadenas de explotación y planes de evasión con rechazos reducidos, integrándose en flujos de trabajo de equipos de seguridad ofensiva con autorización explícita.
- Análisis de malware: dado un binario o una muestra de código sospechoso, el modelo puede describir el comportamiento probable, las técnicas de persistencia y los indicadores de compromiso, aprovechando su conocimiento técnico especializado.
- Formación y concienciación en seguridad: generación de escenarios de phishing simulados y ejercicios de mesa para entrenar a empleados, con la ventaja de que el modelo no rechaza la construcción de estos materiales didácticos.
- Automatización de triaje en SOC: con tool calling y contexto de 131K tokens, el modelo puede procesar lotes de alertas, correlacionar eventos y proponer acciones de respuesta en un bucle agéntico con `reasoning_effort="low"`.
- Ingeniería inversa asistida: explicación de fragmentos de ensamblador, identificación de patrones de ofuscación y sugerencia de estrategias de desempaquetado en laboratorios de análisis.
- Desarrollo de herramientas de seguridad: generación de scripts de reconocimiento, parsers de resultados y utilidades de explotación en pipelines de CI/CD, con soporte de function calling para orquestar herramientas externas.
- Evaluación de robustez de modelos: uso como modelo "sujeto" en estudios de alineación y seguridad, comparando su tasa de cumplimiento con la del modelo base para medir el efecto de la modificación de pesos.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card. La evaluación MMLU se realizó en modo logit (probabilidad sobre los tokens A/B/C/D, sin generación), idéntica en base y en el modelo modificado.

| Benchmark | Base | CRACK Cybersecurity FP8 | Δ |
|---|---|---|---|
| MMLU (global, 1026 preguntas) | 85,58 %¹ | 86,65 % (889/1026) | +1,07 pp |

¹ Referencia previa de GLM-5.3 regular en bf16 antes de la cuantización; la línea base directa sobre FP8 está pendiente de confirmación según el autor.

Comportamiento de cumplimiento en HarmBench-320 (greedy, tres superficies de `reasoning_effort`), excluyendo las 80 conductas de copyright:

| Esfuerzo | TRUE_COMPLY | SOFT_REFUSE | REDIRECT | DEFLECT | HARD_REFUSE | UNK |
|:---:|---:|---:|---:|---:|---:|---:|
| off | 196 (81,7 %) | 4 | 2 | 1 | 0 | 37 |
| low | 202 (84,2 %) | 4 | 8 | 0 | 1 | 25 |
| max | 192 (80,0 %) | 3 | 3 | 0 | 0 | 40 |

Sobre las 320 conductas completas (incluyendo copyright):

| Esfuerzo | TRUE_COMPLY | SOFT_REFUSE | REDIRECT | DEFLECT | HARD_REFUSE | GARBAGE | UNK |
|:---:|---:|---:|---:|---:|---:|---:|---:|
| off | 203 (63,4 %) | 58 (18,1 %) | 7 | 1 | 0 | 0 | 51 |
| low | 223 (69,7 %) | 52 (16,3 %) | 10 | 0 | 1 | 0 | 34 |
| max | 205 (64,1 %) | 51 (15,9 %) | 9 | 0 | 0 | 2 | 53 |

El autor señala que entre 48 y 54 de los SOFT_REFUSE en cada superficie corresponden al bucket de copyright (aproximadamente el 60-68 % de ese bucket rechaza suavemente).

## Requisitos de hardware

- VRAM estimada: el repo ocupa 755,7 GB en safetensors FP8; se necesita un nodo multi-GPU con al menos 8 GPUs de 80 GB (640 GB) más margen para KV cache, o 8× H200 de 141 GB para mayor holgura.
- GPU recomendadas: 8× H100 o 8× H200 con tensor parallel 8. El autor cita pruebas de campo en 8× DGX Spark GB10.
- No cabe en GPU de consumo: 753B en FP8 excede con mucho los 24 GB de una RTX 4090 o los 48 GB de una RTX 6000 Ada.
- Opciones de despliegue: vLLM con `--tensor-parallel-size 8`, `--enforce-eager` (obligatorio para la ruta de atención dispersa bajo concurrencia), `--disable-custom-all-reduce`, `--enable-prefix-caching`, `--max-num-seqs 24`, `--max-model-len 131072`, `--reasoning-parser glm45`, `--tool-call-parser glm47` y `--enable-auto-tool-choice`. MTP especulativo desactivado en vLLM estándar.
- Latencia y throughput: no se publican cifras absolutas. El autor reporta +48 % en decodificación sobre prompts de código con el fork B12X sparse-MLA y MTP activo. El contexto de 131K funciona con `max-num-seqs 24`, lo que deja aproximadamente 2,98× de margen de concurrencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| kigimues/GLM-5.3-CYBERSECURITY-FP8 | 753B (MoE) | 131K verificado | MIT | Ciberseguridad ofensiva, rechazos reducidos | Hugging Face, 23 descargas |
| dealignai/GLM-5.3-UNCENSORED-FP8 | 753B (MoE) | no disponible | no disponible | Uncensor generalista del mismo base | Hugging Face |
| zai-org/GLM-5.3 (base) | 753B (MoE) | no disponible | no disponible | Modelo original alineado | Hugging Face |
| JANGQ-AI/GLM-5.3-FP8 | 753B (MoE) | no disponible | no disponible | Cuantización FP8 del base | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estas variantes más allá del MMLU logit y HarmBench-320 reportados por el autor para este checkpoint.

## Limitaciones y advertencias

- El modelo está diseñado para reducir rechazos en contenido de ciberseguridad ofensiva; su uso sin autorización explícita puede infringir leyes de ciberseguridad en muchas jurisdicciones.
- En categorías ajenas a la ciberseguridad (armas, química, biología, acoso, desinformación) el modelo a menudo cumple con un envoltorio "educativo" por compartición de sustrato en los rechazos, lo que amplía el riesgo más allá del dominio declarado.
- La reproducción literal de material con copyright sigue produciendo rechazos suaves en esta variante.
- `reasoning_effort` solo acepta `"low"` y `"high"`; cualquier otro valor cae a `max` y no hay forma de desactivar el razonamiento. En FP8, con `high` o `max` el modelo puede consumir todo el presupuesto de `max_tokens` dentro de `<think>` y devolver cero tokens de respuesta (finish=`length`); se recomienda `max_tokens ≥ 8000` en esos casos.
- El texto de razonamiento se expone en `message.reasoning`, no en `message.reasoning_content`.
- MTP no funciona en vLLM estándar; requiere el fork B12X sparse-MLA. El contexto de 1M vía decode-context-parallel no está operativo en vLLM para `glm_moe_dsa` (error de paginación en `fp8_ds_mla`).
- La línea base MMLU sobre FP8 directo está pendiente de confirmación; la comparación se hace contra una referencia bf16 previa a la cuantización.
- Riesgo de alucinación en detalles técnicos de exploits y vulnerabilidades: el modelo puede generar comandos o cadenas de ataque plausibles pero incorrectas, por lo que requiere validación humana en entornos reales.
- Licencia MIT permite uso comercial, pero el despliegue de un modelo con rechazos reducidos en productos comerciales exige revisión legal y de cumplimiento normativo propia.
- El checkpoint tiene 23 descargas y 0 likes en el momento de la consulta; es un artefacto de nicho sin validación comunitaria amplia.

## Enlaces

- Hugging Face: https://huggingface.co/kigimues/GLM-5.3-CYBERSECURITY-FP8
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Cuantización FP8 de partida: https://huggingface.co/JANGQ-AI/GLM-5.3-FP8
- Variante uncensor generalista del mismo autor: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8
- Discusión de pruebas de campo en 8× DGX Spark GB10: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8/discussions/3
- Perfil del autor dealignai: https://huggingface.co/dealignai
- Twitter del autor: https://twitter.com/dealignai
