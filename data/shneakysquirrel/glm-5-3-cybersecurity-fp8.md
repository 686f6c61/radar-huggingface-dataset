# ShneakySquirrel/GLM-5.3-CYBERSECURITY-FP8

## Resumen

GLM-5.3-CYBERSECURITY-FP8 es una modificación de pesos del modelo GLM-5.3 en su versión cuantizada a FP8, publicada por el usuario ShneakySquirrel bajo la etiqueta de la organización dealignai. Se trata de una variante "abliterated" o "crack" orientada específicamente al dominio de la ciberseguridad ofensiva: reduce los rechazos del modelo base ante peticiones relacionadas con pentesting, desarrollo de exploits, ingeniería inversa, evasión, phishing, ataques a credenciales y análisis de malware. No es un modelo nuevo entrenado desde cero, sino una edición directa de los pesos bf16 residuales del checkpoint FP8, sin fine-tuning, sin LoRA y sin hooks en tiempo de ejecución.

El modelo base es zai-org/GLM-5.3, un transformer de tipo mezcla de expertos (MoE) con arquitectura `glm_moe_dsa`, 78 capas y 753.329.940.480 parámetros totales (unos 753B), solo texto. La versión aquí publicada procede de JANGQ-AI/GLM-5.3-FP8, una cuantización FP8 del original que mantiene los expertos enrutados en FP8 y solo reescribe los escritores residuales en bf16, lo que permite velocidad nativa de tensor cores FP8 en GPUs Hopper (H100/H200).

Su relevancia es doble. Por un lado, sirve como banco de pruebas para investigación en seguridad de modelos: mide hasta qué punto una modificación quirúrgica de pesos puede eliminar comportamientos de rechazo en un modelo de 753B sin degradar capacidades generales (el autor reporta un MMLU del 86,65 % frente al 85,58 % del base). Por otro, plantea riesgos evidentes: la model card documenta una tasa de cumplimiento directo del 80-84 % en el subconjunto no relacionado con copyright del benchmark HarmBench-320, con cero rechazos duros en varias superficies de razonamiento. El repo ocupa 755,7 GB y no registra descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`glm_moe_dsa`), 78 capas, solo texto |
| Parametros totales | 753.329.940.480 (~753B) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens verificados en 8× H200 con TP8; ~160K sin MTP; 1M no operativo en vLLM actual |
| Tipos de cuantizacion | FP8 (expertos enrutados en FP8, escritores residuales en bf16) |
| Idiomas soportados | en, zh, ru, sr, hi, fr, es, ar, ko, ja |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamano del repo | 755,7 GB |
| Modelo base | zai-org/GLM-5.3 → JANGQ-AI/GLM-5.3-FP8 |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es `glm_moe_dsa`, un transformer de mezcla de expertos con atención dispersa tipo DeepSeek (DSA) y 78 capas, en modalidad solo texto. El checkpoint FP8 conserva los expertos enrutados en precisión FP8 y solo modifica los escritores residuales en bf16, lo que mantiene el rendimiento de los tensor cores FP8 en Hopper. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base; esa información no aparece en la documentación proporcionada.

La modificación de este "crack" es una edición directa de pesos, no un entrenamiento: según el autor, no hay fine-tuning, ni LoRA, ni hooks de runtime, ni trucos de prompt. El efecto buscado es la reducción selectiva de rechazos en categorías de seguridad ofensiva, aprovechando que las negativas comparten sustrato entre dominios; por eso el modelo a veces cumple también en categorías ajenas (armas, química, biología, acoso, desinformación) con un envoltorio "educativo", aunque no está ajustado para ello. La reproducción literal de material con copyright sigue produciendo rechazos suaves en esta variante. El autor documenta además que el modo de razonamiento (`reasoning_effort`) solo acepta `"low"` y `"high"`; cualquier otro valor cae a `max`, y no es posible desactivar el razonamiento. En FP8 recomienda `low` para bucles de agente o tool calling, porque con `high`/`max` el modelo puede consumir todo el presupuesto de `max_tokens` dentro de `<think>` y devolver cero tokens de respuesta.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso, con modo de razonamiento configurable (`low`/`high`, con caída a `max` en otros valores).
- Conocimiento técnico de ciberseguridad ofensiva: pentesting, desarrollo de exploits, ingeniería inversa, evasión, análisis de malware, ataques a credenciales y phishing.
- Soporte de tool calling y function calling (parser `glm47` en vLLM, con `--enable-auto-tool-choice`).
- Uso en agentes y bucles de herramientas, con recomendación explícita de `reasoning_effort="low"` en FP8 para evitar el agotamiento del presupuesto de tokens.
- Capacidades multilingües en inglés, chino, ruso, serbio, hindi, francés, español, árabe, coreano y japonés.
- Contexto largo: 131K tokens verificados en 8× H200 con TP8 y `max-num-seqs 24`.
- Decodificación especulativa MTP: no funcional en vLLM estándar; reportada como operativa en el fork B12X sparse-MLA de ciprianveg con `--draft-attention-backend B12X_MLA_SPARSE` (+48 % de decodificación en prompts de código).
- Solo texto: no hay visión ni audio.

## Casos de uso

- Red teaming y auditorías de seguridad ofensiva: el modelo puede generar y discutir cadenas de ataque, vectores de explotación y técnicas de evasión sin los rechazos del base, lo que lo hace útil en ejercicios de adversario controlados y en la validación de defensas.
- Formación y concienciación en ciberseguridad: sirve para construir escenarios realistas de phishing, ingeniería social o ataque a credenciales que los equipos defensivos deben reconocer, con contexto largo para mantener conversaciones multi-turno coherentes.
- Análisis de malware y ingeniería inversa asistida: con 131K tokens de contexto puede procesar volcados, trazas y fragmentos de código extensos y razonar sobre su comportamiento, siempre que el operador valide las conclusiones.
- Automatización de pipelines de pentesting con tool calling: integrado en vLLM con `--enable-auto-tool-choice`, el modelo puede orquestar llamadas a herramientas (escáneres, shells, frameworks) en bucles de agente, usando `reasoning_effort="low"` para no agotar el presupuesto de tokens.
- Investigación sobre seguridad de modelos: permite medir empíricamente cuánto resiste un modelo de 753B a la eliminación de rechazos y qué capacidades generales se conservan, gracias a la comparación MMLU documentada.
- Generación de contenido técnico especializado: redacción de informes de vulnerabilidad, guías de explotación en laboratorio o documentación de técnicas ofensivas para equipos internos de seguridad.
- Evaluación comparativa de salvaguardas: el subconjunto HarmBench-320 documentado por el autor sirve como referencia para comparar el comportamiento de otros modelos o variantes.

## Benchmarks y rendimiento

El autor publica dos conjuntos de datos: una evaluación de capacidades (MMLU en modo logit, sin generación) y una de comportamiento de cumplimiento (HarmBench-320, greedy, tres superficies de esfuerzo de razonamiento).

| Benchmark | Base | CRACK Cybersecurity FP8 | Delta |
|---|---|---|---|
| MMLU (1026 preguntas, modo logit) | 85,58 % | 86,65 % (889/1026) | +1,07 pp |

Comportamiento en HarmBench-320, subconjunto no relacionado con copyright (240 comportamientos):

| Esfuerzo | TRUE_COMPLY | SOFT_REFUSE | REDIRECT | DEFLECT | HARD_REFUSE | UNK |
|---|---|---|---|---|---|---|
| off | 196 (81,7 %) | 4 | 2 | 1 | 0 | 37 |
| low | 202 (84,2 %) | 4 | 8 | 0 | 1 | 25 |
| max | 192 (80,0 %) | 3 | 3 | 0 | 0 | 40 |

HarmBench-320 completo, incluidos 80 comportamientos de copyright:

| Esfuerzo | TRUE_COMPLY | SOFT_REFUSE | REDIRECT | DEFLECT | HARD_REFUSE | GARBAGE | UNK |
|---|---|---|---|---|---|---|---|
| off | 203 (63,4 %) | 58 (18,1 %) | 7 | 1 | 0 | 0 | 51 |
| low | 223 (69,7 %) | 52 (16,3 %) | 10 | 0 | 1 | 0 | 34 |
| max | 205 (64,1 %) | 51 (15,9 %) | 9 | 0 | 0 | 2 | 53 |

El copyright concentra entre 48 y 54 de los SOFT_REFUSE en cada superficie (aproximadamente el 60-68 % de ese bloque). El autor advierte que la línea base MMLU del base FP8 directo está pendiente de confirmación; el valor de 85,58 % corresponde a un baseline bf16 previo a la cuantización. No se han publicado resultados de HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo pesa 755,7 GB en FP8, por lo que la inferencia requiere agregar memoria de pesos más KV cache. En la configuración documentada (TP8 sobre 8× H200) se sirve con `--gpu-memory-utilization 0.90` y `--max-model-len 131072`.
- GPU recomendadas: 8× H200 o 8× H100 con tensor parallelism 8. El autor cita pruebas de campo en 8× DGX Spark GB10. La velocidad FP8 nativa depende de tensor cores Hopper.
- GPU de consumo: no cabe en ninguna GPU de consumo individual; el tamaño de pesos supera con holgura la VRAM de una RTX 4090 (24 GB) o similar.
- Opciones de despliegue: vLLM con `--tensor-parallel-size 8`, `--enforce-eager` obligatorio para la ruta de atención dispersa de DeepSeek bajo concurrencia, `--disable-custom-all-reduce`, `--enable-prefix-caching`, `--max-num-seqs 24`, `--reasoning-parser glm45` y `--tool-call-parser glm47`. MTP especulativo desactivado en vLLM estándar.
- Contexto práctico: ~131K con MTP y ~160K sin MTP en TP8 con H200. El contexto de 1M mediante decode-context-parallel está cerrado en `glm_moe_dsa` dentro de vLLM por un error de paginación (`page size is not divisible by target page size and cannot be padded` para `fp8_ds_mla`). Pipeline-parallel (PP2 × TP4) perfila bien, pero el draft MTP no implementa `SupportsPP`.
- Latencia y throughput: no disponibles como cifras absolutas; el autor reporta +48 % de decodificación en prompts de código con el fork B12X sparse-MLA y MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-CYBERSECURITY-FP8 | ~753B (MoE) | 131K verificado | MIT | Ciberseguridad ofensiva, rechazos reducidos | Hugging Face, 0 descargas |
| zai-org/GLM-5.3 (base) | ~753B (MoE) | no disponible | no disponible | Generalista, con salvaguardas | Hugging Face |
| JANGQ-AI/GLM-5.3-FP8 | ~753B (MoE) | no disponible | no disponible | Cuantización FP8 del base | Hugging Face |
| dealignai/GLM-5.3-UNCENSORED-FP8 | ~753B (MoE) | no disponible | no disponible | Uncensor generalista del mismo base | Hugging Face |

La comparación relevante es con el modelo base y con la variante UNCENSORED del mismo autor: esta versión está afinada para ciberseguridad y no para cumplimiento universal, mientras que la UNCENSORED busca eliminar rechazos de forma general. No se dispone de datos de benchmarks de las alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo diseñado para reducir rechazos en contenido de seguridad ofensiva: puede generar instrucciones de explotación, evasión o ataque a credenciales. Su uso en producción exige controles de acceso, registro de auditoría y encuadre legal.
- El cumplimiento no es universal: en categorías ajenas a ciberseguridad a veces cumple con un envoltorio "educativo", lo que genera un comportamiento impredecible fuera del dominio objetivo.
- La reproducción literal de material con copyright sigue produciendo rechazos suaves, lo que limita su uso para tareas de extracción de texto protegido.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de factualidad; como todo modelo generativo de gran tamaño, puede inventar detalles técnicos plausibles, especialmente en vulnerabilidades o procedimientos concretos.
- Modo de razonamiento no desactivable: `reasoning_effort` solo honra `"low"` y `"high"`; el resto cae a `max`. Con `high`/`max` en FP8 puede consumir todo el presupuesto de `max_tokens` dentro de `<think>` y devolver cero tokens de respuesta; se recomienda `max_tokens ≥ 8000` en esos casos y `low` para agentes.
- El texto de razonamiento se expone en `message.reasoning`, no en `message.reasoning_content`.
- Contexto de 1M no operativo en vLLM actual para esta arquitectura; el techo práctico es ~131K con MTP y ~160K sin él en TP8 con H200.
- MTP especulativo no funcional en vLLM estándar; solo en forks concretos.
- Licencia MIT declarada, lo que permite uso comercial, pero el autor no ofrece garantías sobre el cumplimiento normativo del contenido generado; la responsabilidad legal recae en el operador.
- Sin descargas registradas y con un solo "like" en el momento de la consulta: no hay evidencia de uso en producción ni validación independiente de los resultados reportados.
- El repositorio ocupa 755,7 GB, lo que impone requisitos de almacenamiento y transferencia considerables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ShneakySquirrel/GLM-5.3-CYBERSECURITY-FP8
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Cuantización FP8 de referencia: https://huggingface.co/JANGQ-AI/GLM-5.3-FP8
- Variante uncensor generalista del mismo autor: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8
- Discusión sobre notas de runtime en 8× DGX Spark GB10: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8/discussions/3
- Organización dealignai: https://huggingface.co/dealignai
- Twitter del autor: https://twitter.com/dealignai
