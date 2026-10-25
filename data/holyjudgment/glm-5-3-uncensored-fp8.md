# HolyJudgment/GLM-5.3-UNCENSORED-FP8

## Resumen

GLM-5.3-UNCENSORED-FP8 es una modificación de pesos del modelo GLM-5.3 en su variante FP8, publicada en HuggingFace bajo el identificador `HolyJudgment/GLM-5.3-UNCENSORED-FP8`, aunque la model card atribuye el trabajo al colectivo dealignai y lo presenta como una release de la serie «CRACK». Se trata de un modelo de lenguaje de arquitectura `glm_moe_dsa` (mezcla de expertos con atención dispersa) de 753.329.940.480 parámetros totales y 78 capas, solo texto, derivado de `zai-org/GLM-5.3` a través de la cuantización FP8 `JANGQ-AI/GLM-5.3-FP8`.

El problema que aborda no es de capacidad sino de alineación: elimina el comportamiento de rechazo (refusal) mediante una edición permanente en bf16 de los tensores *residual writer*, sin fine-tuning, sin LoRA y sin hooks en tiempo de ejecución. Los expertos enrutados en FP8 quedan intactos, de modo que el modelo conserva la velocidad nativa de los tensor cores FP8 en Hopper (H100/H200) y se carga con vLLM estándar.

Su relevancia es doble. Por un lado, es un ejemplo técnico de edición a nivel de pesos sobre un MoE de 753B manteniendo casi intacta la capacidad (87,43 % en MMLU-logit frente a 85,58 % del base). Por otro, es un caso de estudio de riesgo: la model card reporta un 81,6 % de cumplimiento literal en HarmBench-320 con `reasoning_effort=off`, lo que lo sitúa fuera de cualquier despliegue de cara al usuario sin moderación externa. La versión v2 corrige los bucles de razonamiento de la v1 (0 bucles en la sonda dura, 0 GARBAGE en HB-320) a cambio de ~4 pp menos de cumplimiento global.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `glm_moe_dsa` (mezcla de expertos con atención dispersa tipo DSA), 78 capas, solo texto |
| Parametros totales | 753.329.940.480 (~753B) |
| Parametros activos | no disponible |
| Longitud de contexto | 1M anunciada por el modelo base; en la práctica ~131K con MTP y ~160K sin MTP en TP8 sobre H200 según la model card. La configuración de servicio recomendada usa `--max-model-len 131072` |
| Tipos de cuantizacion | FP8 (expertos enrutados en FP8; tensores *residual writer* en bf16). No se mencionan variantes GGUF ni INT4 |
| Idiomas soportados | en, zh, ru, sr, hi, fr, es, ar, ko, ja |
| Licencia | MIT (declarada en la model card; verificar la del modelo base, no disponible) |
| Formato de pesos | safetensors (FP8); tamano del repo 755,7 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura `glm_moe_dsa` del GLM-5.3 original: un transformer de mezcla de expertos con 78 capas que combina atención dispersa (DSA, *DeepSeek sparse attention*, según la nomenclatura usada en la model card para el backend `B12X_MLA_SPARSE`) con MLA. Es un modelo exclusivamente de texto, sin torre de visión ni encoder de audio. No se dispone del número de expertos, del ratio de activación ni del desglose de parámetros activos en la información proporcionada.

No hay entrenamiento adicional en el sentido habitual: el autor describe una «edición de pesos genuina, sin fine-tuning, sin LoRA, sin hooks de runtime ni trucos de prompt», aplicada como una modificación en bf16 sobre los tensores *residual writer*. El resto de pesos, incluidos los expertos enrutados en FP8, se mantienen sin tocar respecto a `JANGQ-AI/GLM-5.3-FP8`. La v2 corrige un fallo de bucle de razonamiento que afectaba a ~2 % de los prompts con señal de rechazo más dura en la v1 (contenido que colapsaba en repetición antes de emitir respuesta). El modelo soporta decodificación especulativa mediante MTP (*multi-token prediction*), aunque en vLLM estándar no es funcional y solo se reporta operativa en el fork de vLLM de ciprianveg con `--draft-attention-backend B12X_MLA_SPARSE` (+48 % de decode en prompts de código).

## Capacidades

- Generación de texto y conversación multi-turno en 10 idiomas (inglés, chino, ruso, serbio, hindi, francés, español, árabe, coreano y japonés).
- Razonamiento explícito en modo *thinking*: el texto de razonamiento se devuelve en `message.reasoning` (no en `message.reasoning_content`), parseable con `--reasoning-parser glm45`.
- Tool calling y function calling: parser dedicado `glm47` y soporte de `--enable-auto-tool-choice` en vLLM.
- Uso agéntico y razonamiento multi-paso con bucles de herramientas; el autor recomienda `reasoning_effort="low"` en FP8 para estos flujos.
- Contexto largo: hasta ~131K tokens en la configuración TP8 de referencia, con techo práctico de ~160K sin MTP.
- Decodificación especulativa vía MTP (solo en fork específico de vLLM).
- Eliminación de rechazos en una taxonomía amplia de daño multilingüe, no limitada a un dominio concreto.
- Sin capacidades de visión ni audio (modelo solo texto).

## Casos de uso

- **Red teaming y evaluación de seguridad**: generar prompts adversarios y respuestas de referencia para calibrar clasificadores de moderación propios. El modelo es útil precisamente por su baja tasa de rechazo (91,7 % TRUE_COMPLY en las 240 conductas no relacionadas con copyright de HarmBench-320), lo que evita que el evaluador tenga que rodear negativas del modelo con jailbreaks manuales.
- **Investigación sobre alineación y abliteration**: estudiar qué se pierde y qué se conserva al editar tensores *residual writer* en un MoE de 753B. El propio autor publica la comparación MMLU-logit frente al base (87,43 % vs 85,58 %), lo que sirve como línea base replicable.
- **Análisis de contenido sensible en corpus periodísticos o judiciales**: resumir y clasificar documentos sobre violencia, delitos o discursos de odio sin que el modelo se niegue a procesarlos, con el contexto de ~131K tokens para expedientes completos.
- **Generación de datos sintéticos para entrenar clasificadores de daño**: producir ejemplos etiquetados de texto dañino en varios idiomas (en, zh, ru, ar, es, entre otros) para aumentar el conjunto de entrenamiento de un moderador. Requiere aislamiento estricto del entorno de generación.
- **Agentes de código con bucles de herramientas**: integrado en un pipeline de CI/CD con tool calling y `reasoning_effort="low"` para evitar el agotamiento de presupuesto dentro de `<think>`; el autor reporta +48 % de decode con MTP en prompts de código usando el fork B12X.
- **Atención al cliente multilingüe en mercados con idiomas de bajos recursos**: cobertura de serbio, hindi y árabe en un único checkpoint, con ventana de 131K tokens para historiales largos. No apto para producción sin una capa de moderación externa, dado el comportamiento del modelo.
- **Traducción y localización de documentación técnica**: 10 idiomas soportados y contexto largo permiten traducir bloques extensos manteniendo coherencia terminológica dentro de una misma ventana.

## Benchmarks y rendimiento

Datos publicados en la model card. La medición de MMLU es *logit-based* sobre una muestra estratificada de 1026 preguntas (18 por asignatura, 57 asignaturas), no generativa.

| Benchmark | Este modelo (v2) | v1 (referencia) | Base GLM-5.3 |
|---|---|---|---|
| MMLU (logit, 1026 preguntas) | 87,43 % (897/1026) | 87,72 % | 85,58 % |
| HarmBench-320, TRUE_COMPLY, `effort=off` | 81,6 % (261/320) | no disponible | no disponible |
| HarmBench-320, TRUE_COMPLY, `effort=max` | 79,4 % (254/320) | no disponible | no disponible |
| HarmBench-320 no-copyright (240 conductas), TRUE_COMPLY, `off` | 91,7 % (220/240) | 85,9 % | no disponible |
| HarmBench-320, GARBAGE | 0 % | 0 % en HB-320 | no disponible |
| HarmBench-320, HARD_REFUSE | 0 % | no disponible | no disponible |

Desglose adicional de HarmBench-320 con `effort=off`: SOFT_REFUSE 5,9 % (19), REDIRECT 6,9 % (22), DEFLECT 0 %, UNK 5,6 % (18). Con `effort=max`: SOFT_REFUSE 4,7 % (15), REDIRECT 7,2 % (23), UNK 8,8 % (28). El delta por asignatura en MMLU entre v1 y v2 es de -0,29 pp de media; solo `high_school_european_history` se mueve más de una pregunta (94,4 → 83,3). No se han publicado resultados de HumanEval, GSM8K ni de benchmarks de agente en la información disponible.

## Requisitos de hardware

- **VRAM para los pesos**: 755,7 GB en FP8. Solo los pesos ya exceden cualquier configuración de consumo; el KV cache y los buffers de activación se suman aparte.
- **Configuración de referencia**: TP8 sobre 8× H200 (8 × 141 GB = 1128 GB) con `--gpu-memory-utilization 0.90`. Es la única configuración con comando de servicio publicado.
- **Alternativa probada**: 8× DGX Spark GB10, según las notas de runtime de @0xMagnus.
- **GPU de consumo**: no cabe. Una RTX 4090 (24 GB) o incluso 4× A100 80GB (320 GB) quedan muy por debajo del mínimo. Tampoco hay variantes GGUF/INT4 publicadas que permitan un despliegue en una sola máquina de gama alta.
- **Opciones de despliegue**: vLLM es la vía soportada (`vllm serve` con `--tensor-parallel-size 8`). Requiere `--enforce-eager` para la ruta de atención dispersa bajo concurrencia y `--disable-custom-all-reduce`. No se documenta soporte de TGI, llama.cpp, Ollama ni SGLang.
- **Throughput y latencia**: no se publican cifras absolutas de tokens/s. Sí se reporta un +48 % de decode en prompts de código con MTP sobre el fork B12X; en vLLM estándar MTP no funciona, por lo que ese incremento no está disponible en la ruta oficial.
- **Límites prácticos de contexto**: `--max-model-len 131072` con MTP y ~160K sin MTP en TP8/H200. El context parallelism de 1M está cerrado en `glm_moe_dsa` con vLLM porque el `k_cache` del indexador DSA se replica entre rangos DCP mientras el KV MLA se particiona (error de `page size` con `fp8_ds_mla`). Pipeline-parallel PP2 × TP4 perfila bien, pero el draft de MTP no implementa `SupportsPP`.
- **Concurrencia recomendada**: `--max-num-seqs 24` en la configuración publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | MMLU | Notas |
|---|---|---|---|---|---|---|
| `HolyJudgment/GLM-5.3-UNCENSORED-FP8` (este) | 753B | ~131K–160K practico / 1M anunciado | FP8 | MIT | 87,43 % (logit) | Sin rechazos; 0 descargas, 0 likes, sin validacion de la comunidad |
| `zai-org/GLM-5.3` (base) | 753B | 1M | bf16 (no confirmado) | no disponible | 85,58 % (referencia del autor) | Modelo original con alineacion intacta |
| `JANGQ-AI/GLM-5.3-FP8` | 753B | no disponible | FP8 | no disponible | no disponible | Cuantizacion FP8 del base; padre directo de este checkpoint |
| `dealignai/GLM-5.3-CYBERSECURITY-FP8` | 753B (presumible) | no disponible | FP8 | no disponible | no disponible | Variante hermana enfocada a ciberseguridad |

No se dispone de datos verificados de otras familias de modelos de escala comparable (por ejemplo, otros MoE de ~700B) en la información proporcionada, por lo que no se establece comparación numérica con ellas.

## Limitaciones y advertencias

- **Ausencia total de rechazos**: el modelo está diseñado para no negarse. Un 81,6 % de cumplimiento literal en HarmBench-320 implica que puede producir contenido dañino, ilegal o peligroso sin fricción. No es apto para exposición directa a usuarios finales sin un clasificador de entrada/salida independiente.
- **Sesgos**: no se ha publicado ninguna evaluación de sesgos demográficos, políticos o culturales. La modificación afecta a la capa de rechazo, pero el efecto sobre sesgos latentes del base es desconocido.
- **Alucinación**: sin datos. No hay evaluación de veracidad ni de calibración en la información disponible.
- **Riesgo legal**: la licencia declarada es MIT, pero el modelo base es `zai-org/GLM-5.3` y su licencia no aparece en la información proporcionada. Antes de un uso comercial conviene verificar las condiciones del modelo original y la jurisdicción aplicable al contenido generado.
- **Validación comunitaria nula**: 0 descargas y 0 likes en el momento de la ficha. Todas las cifras proceden del autor; no hay replicaciones independientes.
- **Atribución confusa**: el repositorio está bajo la cuenta `HolyJudgment`, mientras que la model card se presenta como una release de dealignai y referencia `dealignai/GLM-5.3-UNCENSORED-FP8` en el comando de servicio. Conviene confirmar qué artefacto es el canónico.
- **`reasoning_effort` poco fiable**: solo `"low"` y `"high"` se respetan; cualquier otro valor (`off`, `medium`, `max`, sin definir, o un `off:` YAML sin comillas que parsea como booleano `false`) cae en `max`. No hay forma de desactivar el razonamiento en este checkpoint.
- **Agotamiento de presupuesto en modo `high`/`max`**: con FP8 el modelo puede consumir todo `max_tokens` dentro de `<think>` y devolver cero tokens de respuesta (`finish=length`). No es un bucle y los parámetros de muestreo no lo evitan. Si se usa `high`/`max`, fijar `max_tokens ≥ 8000` (y ≥ 2600 para `max` en la guía de servicio).
- **Tooling incompleto**: MTP no funciona en vLLM estándar; el context parallelism a 1M está cerrado por un bug de `page size` con el indexador DSA; PP no es compatible con el draft de MTP.
- **Solo texto y 10 idiomas**: no hay visión ni audio. Los idiomas fuera de la lista declarada no están evaluados.
- **Reproducibilidad**: la edición de pesos no viene acompañada de script de aplicación ni de diff publicado en la información disponible, lo que dificulta auditar qué tensores exactos se modificaron.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HolyJudgment/GLM-5.3-UNCENSORED-FP8
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Cuantización FP8 de partida: https://huggingface.co/JANGQ-AI/GLM-5.3-FP8
- Variante de ciberseguridad hermana: https://huggingface.co/dealignai/GLM-5.3-CYBERSECURITY-FP8
- Perfil del colectivo autor: https://huggingface.co/dealignai
- Notas de runtime en 8× DGX Spark GB10: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8/discussions/3
- Twitter del autor: https://twitter.com/dealignai
- Papers, blogs y repos adicionales: no disponible (la búsqueda web no devolvió resultados relevantes sobre este modelo)
