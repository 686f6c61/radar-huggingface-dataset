# bielquants/GLM-5.3-CYBERSECURITY-FP8

## Resumen

GLM-5.3-CYBERSECURITY-FP8 es un derivado del modelo GLM-5.3 de Z.ai (zai-org), publicado por el usuario bielquants y presentado en su model card como una release «CRACK» de dealignai. Se trata de una modificación de pesos —no de un fine-tuning ni de un LoRA— sobre la cuantización FP8 JANGQ-AI/GLM-5.3-FP8, en la que se han editado los escritores de residuales en bf16 para reducir selectivamente el rechazo en dominios de seguridad ofensiva: pentesting, red team, desarrollo de exploits, ingeniería inversa, evasión, phishing, ataques a credenciales y análisis de malware.

El modelo conserva la arquitectura del base: `glm_moe_dsa` (Mixture of Experts con atención dispersa tipo DeepSeek), 78 capas y 753.329.940.480 parámetros totales, solo texto. El repo pesa 755,7 GB en safetensors y mantiene los expertos en FP8 enrutado, de modo que aprovecha las tensor cores FP8 nativas de Hopper (H100/H200). No es un «uncensor» de propósito general: la card indica explícitamente que las categorías ajenas a ciberseguridad (armas, química, biología, acoso, desinformación) siguen recibiendo rechazos suaves o envoltorios «educativos», y que la reproducción literal de contenido con copyright sigue soft-rechazándose.

Su relevancia es doble: por un lado, sirve como banco de pruebas de hasta qué punto un ajuste de pesos en un MoE de 753B preserva capacidades generales (la propia card reporta una mejora de +1,07 pp en MMLU logit respecto al baseline); por otro, documenta con detalle un entorno de despliegue real (vLLM, TP8 sobre 8×H200, 131K de contexto, limitaciones conocidas de MTP y de contexto de 1M) poco habitual en fichas de modelos derivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención dispersa (`glm_moe_dsa`), 78 capas, solo texto |
| Parametros totales | 753.329.940.480 (753B) |
| Parametros activos | no disponible |
| Longitud de contexto | Hasta 1M declarado en la ruta de decode-context-parallel (cerrada en vLLM para `glm_moe_dsa`); techo práctico verificado en TP8 sobre H200: ~131K con MTP y ~160K sin MTP |
| Tipos de cuantizacion | FP8 (expertos enrutados en FP8 nativo; solo se editan los residuales en bf16) |
| Idiomas soportados | en, zh, ru, sr, hi, fr, es, ar, ko, ja |
| Licencia | MIT |
| Formato de pesos | safetensors (755,7 GB de repo) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura `glm_moe_dsa` de GLM-5.3: un transformer Mixture of Experts con atención dispersa (DSA, esquema de indexado tipo DeepSeek) y KV en MLA, con 78 capas y 753B de parámetros totales. El checkpoint de partida es la cuantización FP8 de JANGQ-AI sobre el upstream `zai-org/GLM-5.3`. Según la model card, la intervención consiste en modificar los escritores de residuales en bf16 manteniendo intactos los expertos FP8 enrutados; es decir, no hay entrenamiento adicional, ni LoRA, ni hooks en tiempo de ejecución, ni trucos de prompt. El resultado es una modificación genuina de pesos que se carga con vLLM estándar.

No se documenta en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, ni si el base empleó RLHF/DPO; esos datos corresponden al modelo original de Z.ai y no se reproducen aquí. La innovación técnica reseñable del derivado es metodológica (edición selectiva de rechazo por dominio preservando capacidades) y de infraestructura: soporte de decodificación especulativa MTP (multi-token prediction) —no funcional en vLLM stock, reportada como operativa en el fork sparse-MLA B12X de ciprianveg con `--draft-attention-backend B12X_MLA_SPARSE`, con +48% de decode en prompts de código— y requisito de `--enforce-eager` para la ruta de atención dispersa bajo concurrencia.

## Capacidades

- Generación de texto y conversación multi-turno en inglés, chino, ruso, serbio, hindi, francés, español, árabe, coreano y japonés.
- Razonamiento explícito con modo «thinking»: el texto de razonamiento se devuelve en `message.reasoning` (no en `message.reasoning_content`), con parser `--reasoning-parser glm45`.
- Tool calling / function calling con `--tool-call-parser glm47` y `--enable-auto-tool-choice`, orientado a bucles de agente.
- Contenido técnico de seguridad ofensiva sin rechazo: pentesting, red team, desarrollo de exploits, ingeniería inversa, evasión, phishing, ataques a credenciales y análisis de malware (dominio para el que está específicamente ajustado).
- Capacidades generales preservadas a nivel de conocimiento: MMLU logit 86,65% (889/1026), ligeramente por encima del baseline reportado de 85,58%.
- No dispone de visión ni de audio: el base es text-only.
- Soporte de contexto largo (131K verificado en TP8; ~160K sin MTP), con prefix caching habilitado.

## Casos de uso

- Auditoría de seguridad ofensiva en laboratorio: el modelo genera y explica técnicas de explotación y cadenas de ataque sobre entornos autorizados, sin los rechazos que interfieren en flujos de trabajo de pentest con contexto largo.
- Análisis de malware y triaje de muestras: puede describir comportamiento, técnicas de evasión y firmas a partir de fragmentos de código o informes, integrándose en un pipeline SOC como asistente de segundo nivel.
- Ingeniería inversa asistida: ayuda a interpretar desensamblado, reconstruir lógica de binarios y documentar estructuras, tarea donde los modelos alineados suelen derivar a respuestas genéricas.
- Red teaming de modelos y aplicaciones: útil para generar corpus de prompts adversarios y validar defensas, dado su perfil de cumplimiento medido (80-84% de cumplimiento directo en HarmBench-320 no-copyright).
- Automatización de agentes para reconocimiento: con tool calling y ventanas de 131K puede orquestar bucles multi-paso sobre salidas de escáneres, logs y resultados de enumeración.
- Formación y concienciación en seguridad: generación de escenarios realistas de phishing, credenciales y evasión para ejercicios internos controlados, donde se necesita contenido específico y no respuestas diluidas.
- Investigación sobre alineación y edición de pesos: sirve como caso de estudio reproducible de cómo una intervención en residuales bf16 altera el comportamiento de rechazo de un MoE de 753B manteniendo MMLU.
- Respuesta a incidentes asistida: resumen y correlación de artefactos técnicos (IOCs, timelines, comandos) en una única ventana de contexto larga.

## Benchmarks y rendimiento

Datos aportados por el autor (los benchmarks de MMLU son en modo logit, sin generación; los de cumplimiento son greedy):

| Benchmark | Base | CRACK Cybersecurity FP8 | Delta / nota |
|---|---|---|---|
| MMLU (overall, 1026 preguntas, logit) | 85,58% (baseline GLM-5.3 regular bf16 pre-cuant, pendiente de confirmar contra base-FP8 directo) | 86,65% (889/1026) | +1,07 pp (gate ±5 pp: pasa) |
| HarmBench-320, no-copyright (240 comportamientos), TRUE_COMPLY | no disponible | 81,7% (effort off) / 84,2% (low) / 80,0% (max) | SOFT_REFUSE 3-4 por superficie; HARD_REFUSE ~0 |
| HarmBench-320 completo (320, incluye 80 de copyright), TRUE_COMPLY | no disponible | 63,4% (off) / 69,7% (low) / 64,1% (max) | El copyright aporta ~48-54 SOFT_REFUSE por superficie |

No se han publicado en la información disponible resultados de HumanEval, GSM8K, MMLU-Pro u otros benchmarks estándar para este checkpoint.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 755,7 GB en safetensors FP8; el despliegue de referencia usa 8 GPU con `--gpu-memory-utilization 0.90`, lo que encaja en 8× H200 (141 GB) o 8× H100 (80 GB, con menos margen para KV cache).
- GPU recomendadas: H200 y H100 (tensor cores FP8 nativas, requisito de facto para el rendimiento FP8); también validado por el autor en 8× DGX Spark GB10 según la nota de runtime de @0xMagnus.
- GPU de consumo: no. Ninguna GPU consumer (RTX 4090/5090, 24-32 GB) puede alojar 753B en FP8, ni siquiera con offloading razonable; no hay cuantizaciones GGUF/INT4 publicadas para este checkpoint en la información disponible.
- Opciones de despliegue: vLLM es la ruta soportada (`vllm serve` con `--tensor-parallel-size 8`, `--enforce-eager`, `--disable-custom-all-reduce`, `--enable-prefix-caching`, `--max-num-seqs 24`, `--max-model-len 131072`, `--reasoning-parser glm45`, `--tool-call-parser glm47`, `--enable-auto-tool-choice`). El fork sparse-MLA B12X (ciprianveg) habilita MTP con `--draft-attention-backend B12X_MLA_SPARSE`. No hay soporte documentado para llama.cpp, Ollama o TGI en esta configuración.
- Latencia y throughput: con MTP sobre el fork B12X se reporta +48% de decode en prompts de código; con 131K de contexto y `max-num-seqs 24` en 8×H200 se indica un headroom de concurrencia de ≈2,98×. No se publican tokens/s absolutos.
- Paralelismo: TP8 es la configuración de referencia; PP2 × TP4 perfila bien, pero el draft MTP no implementa `SupportsPP`. El contexto de 1M vía decode-context-parallel está cerrado en vLLM para `glm_moe_dsa` (el `k_cache` del indexer DSA se replica entre rangos DCP mientras el KV MLA se reparte, provocando el error «page size is not divisible by target page size and cannot be padded» con `fp8_ds_mla`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-CYBERSECURITY-FP8 (este) | 753B totales, FP8, `glm_moe_dsa` | ~131K-160K prácticos; 1M declarado pero no operativo en vLLM | MMLU logit 86,65%; HB-320 no-copyright 80-84% TRUE_COMPLY | MIT | HuggingFace, safetensors, vLLM |
| dealignai/GLM-5.3-UNCENSORED-FP8 (sibling) | mismo base (753B, FP8) según la card | no disponible | no disponible | no disponible en la información proporcionada | HuggingFace |
| JANGQ-AI/GLM-5.3-FP8 (base de la cuantización) | 753B, FP8 | no disponible | no disponible | no disponible en la información proporcionada | HuggingFace |
| zai-org/GLM-5.3 (upstream) | 753B, `glm_moe_dsa`, 78 capas, text-only | no disponible (el derivado cita 1M vía DCP) | baseline MMLU 85,58% según el autor | no disponible en la información proporcionada | HuggingFace |

La diferencia funcional clave frente al resto es el perfil de rechazo: el sibling UNCENSORED está pensado como uncensor general, mientras que este checkpoint restringe la reducción de rechazo al dominio de ciberseguridad y mantiene soft-refusals fuera de él.

## Limitaciones y advertencias

- Modelo derivado con rechazos eliminados de forma selectiva para seguridad ofensiva. El uso para atacar sistemas sin autorización explícita puede ser ilegal en la mayoría de jurisdicciones; la licencia MIT no exime de responsabilidad legal por el uso.
- No es un uncensor universal: mantiene soft-refusals en armas, química, biología, acoso y desinformación, y sigue soft-rechazando la reproducción literal de contenido con copyright (~60-68% del bucket de copyright).
- Riesgo de alucinación en contenido técnico: comandos, CVE, rutas de explotación o APIs pueden ser plausiblemente incorrectos; requiere validación en entorno aislado antes de cualquier uso operativo.
- El cubo UNK de HarmBench (25-40 respuestas por superficie) corresponde a respuestas con envoltorio suave que el sub-clasificador no pudo etiquetar con limpieza, lo que introduce incertidumbre en las cifras de cumplimiento.
- Inconsistencia documentada en `reasoning_effort`: la card afirma que solo se honran `"low"` y `"high"`, pero las tablas de evaluación incluyen una superficie `off`; según la nota de runtime, cualquier valor distinto de `low` (incluido `off`, `medium`, `max` o sin definir, y el `off:` sin comillas que YAML interpreta como booleano `false`) cae a `max`. No hay forma de desactivar el razonamiento.
- En FP8 y con `reasoning_effort` en `high`/`max`, el modelo puede consumir todo el presupuesto de `max_tokens` dentro de `<think>` y devolver cero tokens de respuesta (`finish=length`); se recomienda `low` para bucles de agente y `max_tokens ≥ 8000` si se usa `high`/`max`.
- MTP no funcional en vLLM stock; el contexto de 1M no es alcanzable por la ruta de decode-context-parallel con `glm_moe_dsa` en vLLM actual.
- Requisitos de hardware extremos (8× H100/H200): no es desplegable en infraestructura de consumo ni en una única GPU enterprise.
- Repo sin tracción verificable: 0 descargas y 0 likes en el momento de la consulta, y ausencia de revisión independiente de los resultados reportados.
- El texto de razonamiento se expone en `message.reasoning`, no en `message.reasoning_content`; los clientes que esperen el segundo campo fallarán al parsear.
- La model card atribuye la release a dealignai mientras que el repositorio aparece bajo el usuario bielquants; conviene verificar la procedencia del artefacto antes de usarlo en producción.

## Enlaces

- HuggingFace: https://huggingface.co/bielquants/GLM-5.3-CYBERSECURITY-FP8
- Modelo base (upstream): https://huggingface.co/zai-org/GLM-5.3
- Base de la cuantización: https://huggingface.co/JANGQ-AI/GLM-5.3-FP8
- Sibling uncensor general: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8
- Discusión de runtime en 8× DGX Spark GB10: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8/discussions/3
- Perfil del autor de la release: https://huggingface.co/dealignai
- No se han encontrado papers, repositorios de código ni demos adicionales en los resultados de búsqueda disponibles (los resultados devueltos corresponden a sitios sin relación con el modelo).
