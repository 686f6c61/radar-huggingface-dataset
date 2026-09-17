# JohnieM/GLM-5.3-CYBERSECURITY-FP8

## Resumen

GLM-5.3-CYBERSECURITY-FP8 es una modificación de pesos (variante "abliterated" o *crack*) del modelo GLM-5.3 de Zhipu AI (zai-org), publicada por el usuario JohnieM a partir de la cuantización FP8 de JANGQ-AI. Se trata de un modelo de lenguaje de 753.329.940.480 parámetros totales (unos 753B) con arquitectura `glm_moe_dsa` —mezcla de expertos con atención dispersa—, 78 capas y modalidad exclusivamente de texto. La intervención no emplea ajuste fino ni LoRA: se editan únicamente los escritores residuales en bf16, dejando intactos los expertos enrutados en FP8, de modo que el modelo conserva la velocidad nativa de los tensor cores FP8 en hardware Hopper (H100/H200).

El objetivo declarado es reducir el rechazo (*refusal*) específicamente en contenido de seguridad ofensiva: desarrollo de exploits, ingeniería inversa, evasión, phishing, ataques a credenciales y análisis de malware. No es un descensor de censura de propósito general: en categorías ajenas a la ciberseguridad (armas, química, biología, acoso, desinformación) el modelo a menudo responde con un envoltorio "educativo", y la reproducción literal de material con derechos de autor sigue generando rechazos suaves.

Su relevancia actual es doble. Por un lado, documenta de forma inusualmente detallada el comportamiento de cumplimiento sobre HarmBench-320 y la preservación de capacidades sobre MMLU con puntuación en modo logit, lo que permite auditar el efecto real de la "abliteración" sobre un modelo de 753B. Por otro, es un ejemplo de despliegue práctico de un MoE de gran tamaño en FP8 sobre 8× H200 con vLLM, con notas de campo sobre `reasoning_effort`, decodificación especulativa MTP y los límites reales de contexto en paralelismo tensorial. El repositorio tiene cero descargas y cero *likes* en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `glm_moe_dsa` (mezcla de expertos con atención dispersa tipo DSA sobre MLA); 78 capas; solo texto |
| Parametros totales | 753.329.940.480 (~753B) |
| Parametros activos | no disponible |
| Longitud de contexto | Hasta 1M de tokens según la model card; en la práctica ~131K en TP8 sobre 8× H200 con MTP y ~160K sin MTP |
| Tipos de cuantizacion | FP8 nativo (expertos enrutados en FP8; solo se editan los escritores residuales en bf16) |
| Idiomas soportados | en, zh, ru, sr, hi, fr, es, ar, ko, ja |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamano del repositorio | 755,7 GB |
| Modelo base | `zai-org/GLM-5.3`, cuantizado como `JANGQ-AI/GLM-5.3-FP8` |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es `glm_moe_dsa`: un transformer de mezcla de expertos (MoE) con atención dispersa (DeepSeek Sparse Attention, DSA) sobre atención latente multi-cabeza (MLA), distribuido en 78 capas y entrenado únicamente para texto. La model card menciona soporte de decodificación especulativa mediante MTP (*multi-token prediction*), con un borrador que funciona en el fork de vLLM de ciprianveg con `--draft-attention-backend B12X_MLA_SPARSE`, reportando un +48% de decodificación en *prompts* de programación; en vLLM estándar el MTP no es funcional. El índice de la atención dispersa (`k_cache`) se replica entre rangos de *decode-context-parallel* mientras que el KV de MLA se reparte, lo que hoy bloquea el contexto de 1M bajo esa estrategia.

No hay información sobre el entrenamiento original (número de tokens, composición del dataset, RLHF/DPO) en la documentación proporcionada. Lo que sí se documenta es la intervención de este derivado: modificación genuina de pesos, sin ajuste fino, sin LoRA, sin *hooks* en tiempo de ejecución y sin trucos de *prompt*. Los expertos enrutados en FP8 permanecen sin cambios y solo se editan los escritores residuales en bf16, de ahí que el modelo pueda servirse con vLLM estándar y conserve el rendimiento FP8 en H100/H200.

## Capacidades

- Generación de texto conversacional y razonamiento con modo de pensamiento explícito (`<think>`), controlable parcialmente mediante `reasoning_effort` (solo acepta `"low"` y `"high"`; cualquier otro valor cae a `max`).
- Contenido técnico de seguridad ofensiva: desarrollo de exploits, *red team*, ingeniería inversa, evasión, ataques a credenciales, análisis de malware y phishing, con rechazo reducido de forma específica en estas categorías.
- Soporte de *tool calling* / *function calling* mediante el analizador `glm47` y `--enable-auto-tool-choice` en vLLM.
- Flujos agénticos y razonamiento multi-paso, con la advertencia de que en FP8 conviene usar `reasoning_effort: "low"` para bucles de herramientas.
- Capacidades multilingües declaradas en diez idiomas: inglés, chino, ruso, serbio, hindi, francés, español, árabe, coreano y japonés.
- Salida de razonamiento expuesta en `message.reasoning` (no en `message.reasoning_content`).
- No dispone de visión ni audio: es un modelo solo de texto.

## Casos de uso

- Auditoría de seguridad ofensiva en laboratorio: el modelo genera *payloads* de prueba, cadenas de explotación y análisis de vulnerabilidades sin los rechazos que aparecen en el modelo base, lo que resulta útil en ejercicios de *red team* con autorización formal.
- Análisis de malware y *reverse engineering* asistido: puede comentar fragmentos de binarios desempaquetados, explicar técnicas de ofuscación y proponer pasos de análisis, gracias a su entrenamiento de 753B con conocimiento técnico amplio.
- Simulación de adversarios (purple teaming): se emplea para generar hipótesis de ataque realistas que alimenten detección y reglas SIEM, reduciendo el sesgo de "respuesta corporativa" del modelo base.
- Formación y concienciación en ciberseguridad: construcción de escenarios de phishing y credenciales débiles controlados, con contenido más creíble que el de un modelo fuertemente alineado.
- Automatización agéntica de triaje de incidentes: con soporte de *tool calling* (`glm47`) y contexto práctico de ~131K tokens, puede encadenar llamadas a herramientas de consulta de logs, enriquecimiento de IOCs y resumen de hallazgos.
- Asistencia a desarrolladores de seguridad: revisión de código en busca de patrones inseguros, generación de *tests* de fuzzing y explicación de CVEs dentro de un contexto largo de repositorio.
- Investigación sobre alineación y *refusal*: el modelo sirve como sujeto de estudio para medir hasta qué punto una edición de pesos residuales altera el cumplimiento, con los datos de HarmBench-320 ya publicados.
- Redacción técnica restringida: dado que la reproducción literal de contenido con derechos de autor sigue rechazándose de forma suave, puede usarse para parafrasear documentación técnica sin infringir ese límite.

## Benchmarks y rendimiento

Datos publicados en la model card. La puntuación MMLU se obtuvo en modo logit (probabilidad sobre los tokens A/B/C/D, sin generación), idéntica en base y en la variante modificada.

| Metrica | Base | CRACK Cybersecurity FP8 | Delta | Umbral |
|---|---|---|---|---|
| MMLU (global, 1026 preguntas) | 85,58% | 86,65% (889/1026) | +1,07 pp | pasa (±5 pp) |

Comportamiento de cumplimiento sobre HarmBench-320 (greedy), subconjunto sin derechos de autor (240 comportamientos):

| `reasoning_effort` | TRUE_COMPLY | SOFT_REFUSE | REDIRECT | DEFLECT | HARD_REFUSE | UNK |
|:---:|---:|---:|---:|---:|---:|---:|
| off | 196 (81,7%) | 4 | 2 | 1 | 0 | 37 |
| low | 202 (84,2%) | 4 | 8 | 0 | 1 | 25 |
| max | 192 (80,0%) | 3 | 3 | 0 | 0 | 40 |

HarmBench-320 completo (incluye 80 comportamientos con derechos de autor):

| `reasoning_effort` | TRUE_COMPLY | SOFT_REFUSE | REDIRECT | DEFLECT | HARD_REFUSE | GARBAGE | UNK |
|:---:|---:|---:|---:|---:|---:|---:|---:|
| off | 203 (63,4%) | 58 (18,1%) | 7 | 1 | 0 | 0 | 51 |
| low | 223 (69,7%) | 52 (16,3%) | 10 | 0 | 1 | 0 | 34 |
| max | 205 (64,1%) | 51 (15,9%) | 9 | 0 | 0 | 2 | 53 |

Según la model card, el bloque de derechos de autor aporta entre 48 y 54 de los SOFT_REFUSE en cada superficie (aproximadamente el 60-68% de ese subconjunto). El *bucket* UNK corresponde a respuestas que cumplen con un marco suave y que el subclasificador no pudo encajar. No se han publicado resultados de otros benchmarks (HumanEval, GSM8K, MMLU-Pro, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos FP8 ocupan aproximadamente 755 GB, por lo que la inferencia exige agregación multi-GPU; no cabe en una sola GPU de 80 GB ni en configuraciones de 2 o 4 GPU.
- GPU recomendadas: 8× H100 o 8× H200 con paralelismo tensorial TP8 y `--gpu-memory-utilization 0.90`. La model card cita pruebas de campo en 8× DGX Spark GB10 por parte de @0xMagnus.
- GPU de consumo: no es viable en RTX 4090 ni en ninguna GPU consumer actual, ni siquiera con cuantizaciones alternativas, dado el tamaño del modelo.
- Opciones de despliegue: vLLM con `--tensor-parallel-size 8`, `--enforce-eager` (obligatorio para la ruta de atención dispersa bajo concurrencia), `--disable-custom-all-reduce`, `--enable-prefix-caching`, `--max-num-seqs 24`, `--max-model-len 131072`, `--reasoning-parser glm45`, `--tool-call-parser glm47` y `--enable-auto-tool-choice`. No se documentan opciones para llama.cpp, Ollama o TGI.
- Contexto alcanzable: 131.072 tokens con MTP en 8× H200 y `max-num-seqs 24` (aproximadamente 2,98× de margen de concurrencia); ~160K sin MTP. El paralelismo de contexto de decodificación para llegar a 1M está bloqueado hoy en vLLM con `glm_moe_dsa`. El paralelismo de pipeline (PP2 × TP4) perfila correctamente, pero el borrador MTP no implementa `SupportsPP`.
- Latencia y throughput: no disponibles como cifras absolutas. El único dato relativo es un +48% de decodificación en *prompts* de programación con MTP y el fork B12X de vLLM. Se recomienda `max_tokens ≥ 8000` si se usa `reasoning_effort` en `high` o `max`, ya que de lo contrario el modelo puede consumir todo el presupuesto dentro de `<think>` y devolver cero tokens de respuesta con `finish=length`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JohnieM/GLM-5.3-CYBERSECURITY-FP8 | ~753B (MoE) | hasta 1M teóricos; ~131K prácticos en TP8 | Modificación de pesos enfocada a ciberseguridad ofensiva | MIT | HuggingFace, 0 descargas |
| dealignai/GLM-5.3-UNCENSORED-FP8 | ~753B (MoE) | no disponible | Descensor de propósito general del mismo base | no disponible | HuggingFace |
| JANGQ-AI/GLM-5.3-FP8 | ~753B (MoE) | no disponible | Cuantización FP8 sin modificar | no disponible | HuggingFace |
| zai-org/GLM-5.3 | ~753B (MoE) | no disponible | Modelo base original alineado | no disponible | HuggingFace |

No se dispone de datos de rendimiento ni de contexto para los tres modelos de comparación más allá de su relación de parentesco con este derivado.

## Limitaciones y advertencias

- Reducción deliberada de rechazos: el modelo cumple directamente en un 80-84% de los comportamientos dañinos de HarmBench-320 en el subconjunto sin derechos de autor, con cero rechazos duros en dos de las tres superficies evaluadas. Cualquier uso en producción debe asumir ausencia de barreras de seguridad.
- Especialización, no universalidad: aunque otras categorías (armas, química, biología, acoso, desinformación) a veces obtienen cumplimiento con un envoltorio "educativo", no está ajustado para ello; la reproducción literal de material con derechos de autor sigue rechazándose de forma suave.
- Riesgo legal y de uso indebido: el material generado (exploits, phishing, evasión) puede ser ilegal según la jurisdicción. La licencia MIT no exime de responsabilidad al usuario.
- Sin validación comunitaria: cero descargas y cero *likes* en el momento de la consulta, con fecha de creación y actualización idénticas (16 de septiembre de 2026). No hay terceros independientes que hayan reproducido los resultados.
- Datos de benchmark parciales: el baseline de MMLU en 85,58% procede de una referencia previa del GLM-5.3 regular en bf16 antes de cuantizar, y el propio autor indica que el baseline directo sobre FP8 está pendiente de confirmación. Las tablas de HarmBench se describen como "añadidas tras completar las tres superficies".
- Comportamiento del modo de razonamiento: `reasoning_effort` solo honra `"low"` y `"high"`; cualquier otro valor (`off`, `medium`, `max`, sin definir o un `off:` sin comillas que YAML interpreta como booleano `false`) cae a `max`. No hay forma de desactivar el razonamiento en este *checkpoint*.
- Latencia agravada por el presupuesto de razonamiento: en `high` o `max` el modelo puede agotar `max_tokens` dentro de `<think>` y devolver cero tokens de respuesta; los parámetros de muestreo no lo evitan.
- Limitaciones de infraestructura: MTP no funcional en vLLM estándar; el contexto de 1M bloqueado con `decode-context-parallel` sobre `glm_moe_dsa`; `--enforce-eager` obligatorio, lo que penaliza el rendimiento.
- Idiomas: aunque se declaran diez, no hay evaluación por idioma publicada; es previsible un rendimiento desigual fuera del inglés y el chino.
- Alucinación: al ser un modelo de gran tamaño sin datos de evaluación específicos de fidelidad factual en esta variante, el riesgo de invención de detalles técnicos (CVE, rutas, APIs) sigue presente y no está cuantificado.
- Discrepancia de autoría: el repositorio figura bajo el usuario JohnieM, mientras que la model card se atribuye a dealignai y enlaza al modelo hermano de esa organización. Conviene verificar la procedencia antes de integrarlo en cualquier *pipeline*.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JohnieM/GLM-5.3-CYBERSECURITY-FP8
- Modelo base original: https://huggingface.co/zai-org/GLM-5.3
- Cuantización FP8 de partida: https://huggingface.co/JANGQ-AI/GLM-5.3-FP8
- Modelo hermano de propósito general: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8
- Organización dealignai: https://huggingface.co/dealignai
- Discusión sobre notas de ejecución en 8× DGX Spark GB10: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8/discussions/3
- Perfil del autor del modelo: https://huggingface.co/JohnieM
- Perfil del evaluador en hardware DGX Spark: https://huggingface.co/0xMagnus
- Twitter de dealignai: https://twitter.com/dealignai
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: los enlaces recuperados correspondían a páginas corporativas de Microsoft (https://www.microsoft.com/en-us, https://account.microsoft.com/account, https://myaccount.microsoft.com/, https://www.microsoft.com/en-us/microsoft-365, https://en.wikipedia.org/wiki/Microsoft) y no guardan relación con GLM-5.3 ni con este derivado. No se han encontrado papers, blogs ni repositorios adicionales sobre el modelo.
