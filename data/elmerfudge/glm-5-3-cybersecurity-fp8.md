# Elmerfudge/GLM-5.3-CYBERSECURITY-FP8

## Resumen

GLM-5.3-CYBERSECURITY-FP8 es una modificación de pesos (denominada "crack" por sus autores) del cuantizado FP8 de GLM-5.3, el modelo de mezcla de expertos de 753.000 millones de parámetros desarrollado por Zhipu AI (zai-org). El modelo base intermedio es JANGQ-AI/GLM-5.3-FP8, un cuantizado en FP8 del original zai-org/GLM-5.3. La modificación consiste en la edición directa de los escritores residuales en bf16 para reducir el comportamiento de rechazo, sin fine-tuning, sin LoRA y sin ganchos en tiempo de ejecución: se carga con vLLM estándar y funciona.

A diferencia de otros modelos "abliterated" de propósito general, este checkpoint está ajustado específicamente para el dominio de ciberseguridad: rechaza menos ante contenido de seguridad ofensiva, red team, desarrollo de exploits, ingeniería inversa, evasión, phishing, ataques a credenciales y análisis de malware. En categorías ajenas a la ciberseguridad (armas, química, biología, acoso, desinformación) la reducción de rechazo es parcial y a menudo se limita a una envoltura "educativa". La reproducción literal de contenido con derechos de autor sigue produciendo rechazos suaves.

Técnicamente es un transformer decoder-only solo texto con arquitectura `glm_moe_dsa` (MoE con atención dispersa tipo DeepSeek) de 78 capas, cuantizado en FP8 con expertos enrutados sin modificar, lo que permite velocidad nativa de tensor cores FP8 en Hopper (H100/H200). El repositorio ocupa 755,7 GB y se sirve en la práctica con paralelismo de tensor TP8 sobre 8 GPU H200, con una ventana de contexto operativa de 131.072 tokens. Es relevante ahora por dos motivos: por un lado, expone con números medibles (MMLU por logits y HarmBench-320) hasta qué punto una edición de pesos puede alterar el comportamiento de rechazo conservando capacidad; por otro, porque su publicación plantea de forma explícita el debate sobre doble uso en herramientas de seguridad ofensiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE decoder-only solo texto con atención dispersa tipo DeepSeek (`glm_moe_dsa`), 78 capas |
| Parámetros totales | 753.329.940.480 (≈753 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | 131.072 tokens en configuración de servicio TP8 sobre 8× H200; el contexto de 1M del modelo base no es alcanzable hoy en vLLM con `glm_moe_dsa` (limitación del indexador DSA bajo decode-context-parallel) |
| Tipos de cuantización | FP8 nativo (expertos enrutados en FP8; solo se editan los escritores residuales en bf16). Existe versión base bf16 y el cuantizado JANGQ-AI/GLM-5.3-FP8 |
| Idiomas soportados | en, zh, ru, sr, hi, fr, es, ar, ko, ja |
| Licencia | MIT (según metadatos y model card) |
| Formato de pesos | safetensors |
| Modelo base | zai-org/GLM-5.3; cuantizado intermedio JANGQ-AI/GLM-5.3-FP8 |
| Tamaño del repositorio | 755,7 GB |
| Pipeline | text-generation |
| Autor del repositorio | Elmerfudge (la model card atribuye la release a dealignai) |
| Fecha de publicación | 2026-09-13 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo mezcla de expertos con atención dispersa (`glm_moe_dsa`), 78 capas y modalidad exclusivamente de texto. El detalle técnico relevante es el camino de atención: combina MLA (multi-head latent attention) para el KV cache con un indexador disperso tipo DeepSeek (DSA), lo que reduce el coste de atención en contextos largos. Según la model card, no hay entrenamiento adicional ni fine-tuning: la intervención consiste en la edición directa de los pesos correspondientes a los escritores residuales en bf16, dejando intactos los expertos enrutados en FP8. Esto preserva la velocidad de tensor cores FP8 en hardware Hopper y evita las pérdidas típicas de otras técnicas de modificación de comportamiento.

En cuanto al entrenamiento del modelo base, la información proporcionada no detalla número de tokens, composición del dataset ni si hubo RLHF o DPO; esos datos corresponden a zai-org/GLM-5.3 y no se especifican aquí (no disponible). Las innovaciones destacadas en la documentación son: decodificación especulativa MTP (multi-token prediction), que en vLLM estándar no es funcional pero se reporta operativa en el fork B12X de ciprianveg con backend de atención `B12X_MLA_SPARSE` (+48 % de velocidad de decodificación en prompts de código); y el soporte de niveles de esfuerzo de razonamiento mediante `reasoning_effort`, con la particularidad de que solo se respetan los valores `"low"` y `"high"`, cayendo cualquier otro valor (`off`, `medium`, `max`, sin definir o el `off:` booleano de YAML) a `max`.

## Capacidades

- Generación de texto y conversación multi-turno en diez idiomas (inglés, chino, ruso, serbio, hindi, francés, español, árabe, coreano y japonés).
- Razonamiento con modo de pensamiento explícito: el texto de razonamiento se devuelve en `message.reasoning` (no en `message.reasoning_content`) y su profundidad se controla con `reasoning_effort`.
- Soporte de tool calling / function calling mediante `--tool-call-parser glm47` y `--enable-auto-tool-choice` en vLLM.
- Uso en bucles de agente y razonamiento multi-paso, con la recomendación del autor de usar `reasoning_effort: "low"` en FP8 para evitar agotar el presupuesto de `max_tokens` dentro de `<think>`.
- Contenido técnico de seguridad ofensiva: desarrollo de exploits, red team, ingeniería inversa, técnicas de evasión, phishing, ataques a credenciales y análisis de malware (comportamiento buscado por diseño).
- Contexto largo de hasta 131.072 tokens en la configuración de referencia, útil para análisis de código y logs extensos.
- Decodificación especulativa MTP (solo en el fork B12X; no funcional en vLLM estándar).
- No dispone de visión ni audio: es un modelo solo texto.

## Casos de uso

- Red team autorizado y pruebas de penetración: el modelo puede redactar hipótesis de ataque, cadenas de explotación y borradores de payload en un entorno controlado, con la ventaja de que la reducción de rechazo evita fricción en fases técnicas legítimas de un engagement con contrato y alcance definidos.
- Análisis de malware y triaje de muestras: con 131.072 tokens de contexto se pueden volcar volcados de strings, fragmentos de desensamblado y logs de sandbox en una sola pasada y pedir un resumen del comportamiento, indicadores de compromiso y familia probable.
- Ingeniería inversa asistida: explicación de pseudocódigo descompilado, identificación de rutinas de cifrado o de comprobaciones anti-depuración y propuesta de renombrado de símbolos, usando el modo de razonamiento para desglosar cadenas de llamadas complejas.
- Automatización de threat intelligence: integrado como paso de un pipeline con tool calling, el modelo puede consultar APIs de reputación, correlacionar resultados y generar informes de amenaza en varios idiomas de salida.
- Generación de reglas de detección y firmas: redacción de reglas YARA, Sigma o Snort a partir de descripciones de comportamiento malicioso, con iteración sobre falsos positivos usando el contexto largo para incluir conjuntos de reglas existentes.
- Formación y concienciación en seguridad: simulación de campañas de phishing y de escenarios de respuesta a incidentes en laboratorio, con material adaptado a distintos idiomas y niveles técnicos.
- Revisión de seguridad de código en CI/CD: análisis de diffs y de dependencias mediante tool calling, con salida estructurada que se puede volcar a tickets o comentarios de pull request.
- Investigación sobre alineación y seguridad: el modelo sirve como sujeto de estudio para medir cómo una edición de pesos desplaza las tasas de cumplimiento en HarmBench, dado que la propia model card publica los resultados por superficie de esfuerzo de razonamiento.

## Benchmarks y rendimiento

Los datos publicados por el autor corresponden a dos evaluaciones. La primera es MMLU en modo logit (puntuación por probabilidad sobre los tokens A/B/C/D, sin generación), idéntica en base y en la variante modificada:

| Benchmark | Modelo base | Este modelo | Diferencia | Umbral |
|---|---|---|---|---|
| MMLU (global, 1026 preguntas) | 85,58 % | 86,65 % (889/1026) | +1,07 pp | pasa (±5 pp) |

La model card señala que el 85,58 % corresponde a una línea base previa de GLM-5.3-regular en bf16 antes de la cuantización, y que la línea base directa sobre el FP8 está pendiente de confirmación, por lo que la comparación no es estrictamente equivalente.

La segunda evaluación es HarmBench-320 con decodificación greedy, desglosada por superficie de esfuerzo de razonamiento. Sobre el subconjunto de 240 comportamientos sin derechos de autor:

| Esfuerzo | TRUE_COMPLY | SOFT_REFUSE | REDIRECT | DEFLECT | HARD_REFUSE | UNK |
|:---:|---:|---:|---:|---:|---:|---:|
| off | 196 (81,7 %) | 4 | 2 | 1 | 0 | 37 |
| low | 202 (84,2 %) | 4 | 8 | 0 | 1 | 25 |
| max | 192 (80,0 %) | 3 | 3 | 0 | 0 | 40 |

Sobre el conjunto completo HB-320, que incluye 80 comportamientos de derechos de autor:

| Esfuerzo | TRUE_COMPLY | SOFT_REFUSE | REDIRECT | DEFLECT | HARD_REFUSE | GARBAGE | UNK |
|:---:|---:|---:|---:|---:|---:|---:|---:|
| off | 203 (63,4 %) | 58 (18,1 %) | 7 | 1 | 0 | 0 | 51 |
| low | 223 (69,7 %) | 52 (16,3 %) | 10 | 0 | 1 | 0 | 34 |
| max | 205 (64,1 %) | 51 (15,9 %) | 9 | 0 | 0 | 2 | 53 |

Según la model card, la reproducción literal de material con copyright aporta entre 48 y 54 de los SOFT_REFUSE en cada superficie (aproximadamente el 60-68 % de ese subconjunto). También advierte que las superficies "off" y "max" son en la práctica la misma configuración, porque `reasoning_effort` solo distingue entre `"low"` y `"high"` y cualquier otro valor cae a `max`. No se han publicado resultados de HumanEval, GSM8K ni de otros benchmarks habituales en la información disponible.

## Requisitos de hardware

- Peso de los pesos en FP8: el repositorio ocupa 755,7 GB, de modo que la inferencia exige agregación de memoria entre varias GPU; no cabe en una sola GPU de 80 GB ni de 141 GB.
- Configuración de referencia del autor: TP8 sobre 8× H200 con `--gpu-memory-utilization 0.90`, `--enforce-eager`, `--disable-custom-all-reduce`, `--enable-prefix-caching`, `--max-num-seqs 24` y `--max-model-len 131072`.
- `--enforce-eager` es obligatorio para la ruta de atención dispersa tipo DeepSeek bajo concurrencia.
- Techo práctico de contexto: aproximadamente 131.000 tokens con MTP y 160.000 sin MTP sobre TP8 en H200. El contexto de 1M mediante decode-context-parallel no está operativo en vLLM para `glm_moe_dsa` (error de divisibilidad de page size en `fp8_ds_mla` por replicación del `k_cache` del indexador frente al KV MLA fragmentado).
- Perfil validado alternativo: paralelismo de pipeline PP2 × TP4, aunque el borrador MTP no implementa `SupportsPP`.
- Pruebas de campo reportadas en 8× DGX Spark GB10.
- GPU de consumo: no viable. El modelo no cabe en RTX 4090, RTX 5090 ni en configuraciones multi-GPU de consumo por tamaño de pesos y requisitos de memoria por rank.
- Despliegue: vLLM con `--reasoning-parser glm45` y `--tool-call-parser glm47`. Para MTP se necesita el fork sparse-MLA B12X de ciprianveg con `--draft-attention-backend B12X_MLA_SPARSE`. No hay en la información disponible soporte documentado para llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia y throughput: no disponible en cifras absolutas. El único dato cuantitativo es +48 % de velocidad de decodificación en prompts de código con MTP sobre el fork B12X, y un margen de concurrencia aproximado de 2,98× en la configuración de 131k tokens sobre 8× H200.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque de rechazo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Elmerfudge/GLM-5.3-CYBERSECURITY-FP8 (este modelo) | 753B | 131k operativo en TP8 | Reducción de rechazo específica de ciberseguridad (80-84 % de cumplimiento directo en el subconjunto no-copyright de HarmBench-320) | MIT | safetensors, FP8, vLLM |
| JANGQ-AI/GLM-5.3-FP8 (base inmediato) | 753B | no disponible | Sin modificar | no disponible en la información proporcionada | safetensors, FP8 |
| dealignai/GLM-5.3-UNCENSORED-FP8 (modelo hermano) | 753B | no disponible | Reducción de rechazo de propósito general, sin foco de dominio | no disponible en la información proporcionada | FP8 |
| zai-org/GLM-5.3 (original) | 753B | el modelo declara contexto de 1M, no alcanzable en vLLM con `glm_moe_dsa` | Alineado de fábrica | no disponible en la información proporcionada | bf16 |

No se dispone de datos de benchmarks comparativos frente a modelos de otros fabricantes de tamaño similar en la información proporcionada, por lo que la comparación se limita a la familia GLM-5.3.

## Limitaciones y advertencias

- Modelo de doble uso de riesgo alto: reduce deliberadamente los rechazos ante contenido de seguridad ofensiva (explotación, evasión, phishing, ataques a credenciales). Su uso legítimo exige autorización explícita, alcance contractual y marcos legales aplicables.
- La reducción de rechazo no es universal. En categorías no relacionadas con ciberseguridad puede seguir cumpliendo con una envoltura "educativa" por sustrato compartido; la reproducción literal con copyright sigue generando rechazos suaves.
- Sesgos conocidos: no disponibles en la información proporcionada. No se documenta ninguna evaluación de sesgo demográfico, político o cultural.
- Riesgo de alucinación: no se publica ninguna evaluación específica (por ejemplo, TruthfulQA o tasas de factualidad). Como modelo generativo de 753B sin verificación factual integrada, puede producir comandos, rutas, nombres de herramientas o referencias inexistentes.
- La evaluación de comportamiento depende de un subclasificador LLM y deja un cubo UNK elevado (entre 25 y 53 respuestas por superficie), lo que introduce incertidumbre en los porcentajes de cumplimiento.
- Los números de MMLU se obtuvieron en modo logit sobre 1026 preguntas y con una línea base de bf16 previa a la cuantización, no sobre el FP8 directo; el propio autor marca esa comparación como pendiente de confirmación.
- Peculiaridades de funcionamiento en FP8: `reasoning_effort` solo respeta `"low"` y `"high"`; con `high` o `max` el modelo puede consumir todo el presupuesto de `max_tokens` dentro de `<think>` y devolver cero tokens de respuesta con `finish=length`. Se recomienda `max_tokens ≥ 8000` en esos casos y `low` para bucles de agente.
- El texto de razonamiento se expone en `message.reasoning`, un campo distinto del habitual `reasoning_content`, lo que rompe integraciones que esperen el nombre estándar.
- La decodificación especulativa MTP no funciona en vLLM estándar; requiere un fork de terceros.
- El contexto de 1M del modelo base no es alcanzable en la práctica con vLLM sobre `glm_moe_dsa`; el techo realista es de 131k a 160k tokens según se use MTP o no.
- Licencia MIT declarada, pero al ser una modificación de pesos de un modelo base de terceros conviene verificar las condiciones de la licencia del GLM-5.3 original antes de un uso comercial.
- La autoría del repositorio (Elmerfudge) no coincide con la atribución de la model card (dealignai), lo que dificulta la trazabilidad de la release.
- El repositorio presenta 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.
- El despliegue requiere hardware de centro de datos (8× H200 o equivalente) y no es viable en GPU de consumo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Elmerfudge/GLM-5.3-CYBERSECURITY-FP8
- Modelo base original: zai-org/GLM-5.3
- Cuantizado FP8 intermedio: JANGQ-AI/GLM-5.3-FP8
- Modelo hermano de propósito general: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8
- Discusión con notas de ejecución en 8× DGX Spark GB10: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8/discussions/3
- Perfil del autor de la release: https://huggingface.co/dealignai
- Twitter del autor de la release: https://twitter.com/dealignai
- Evaluación completa HarmBench-320 en JSON: `eval/hb320_cybersec.json` (dentro del repositorio)

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los únicos enlaces útiles son los proporcionados en la información de HuggingFace.
