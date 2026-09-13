# schwyzquant/GLM-5.3-UNCENSORED-FP8

## Resumen

GLM-5.3-UNCENSORED-FP8 es un checkpoint derivado de 753 329 940 480 parametros (aproximadamente 753B) publicado en HuggingFace por el usuario schwyzquant, cuya model card atribuye la autoria de la publicacion a dealignai. Se construye sobre `JANGQ-AI/GLM-5.3-FP8`, que a su vez es una cuantizacion FP8 del modelo upstream `zai-org/GLM-5.3`. La modificacion consiste en una edicion permanente en precision bf16 sobre los tensores residual-writer, sin fine-tuning, sin LoRA ni hooks en tiempo de ejecucion, con el objetivo de reducir el comportamiento de rechazo (abliteration) en multiples idiomas y dominios.

La arquitectura declarada es `glm_moe_dsa` (mezcla de expertos con atencion dispersa tipo DeepSeek), 78 capas y modalidad exclusivamente de texto. El checkpoint conserva los expertos enrutados en FP8 y solo altera los tensores residuales en bf16, de modo que mantiene la velocidad nativa de tensor cores FP8 en hardware Hopper (H100/H200). La ventana de contexto practica documentada en el ejemplo de servicio es de 131 072 tokens, con un techo de aproximadamente 131K con MTP y 160K sin MTP en un nodo TP8 de H200.

Su relevancia es doble: por un lado es un ejemplo de intervencion a nivel de pesos sobre un modelo MoE de gran tamano con licencia MIT, y por otro documenta metricas de preservacion de capacidades (MMLU) y de cumplimiento (HarmBench-320), asi como limitaciones de despliegue concretas en vLLM. Es un modelo text-only, sin vision, orientado a generacion de texto y conversacion, con soporte declarado de tool calling y modos de razonamiento configurables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `glm_moe_dsa` (MoE con atencion dispersa DSA), 78 capas, text-only |
| Parametros totales | 753 329 940 480 (aproximadamente 753B) |
| Parametros activos | no disponible |
| Longitud de contexto | 131 072 tokens en el ejemplo de servicio; techo practico reportado de aproximadamente 131K con MTP y 160K sin MTP en TP8 sobre H200; soporte de 1M via decode-context-parallel no operativo en vLLM |
| Tipos de cuantizacion | FP8 (checkpoint nativo FP8; expertos enrutados en FP8 y tensores residual-writer editados en bf16) |
| Idiomas soportados | en, zh, ru, sr, hi, fr, es, ar, ko, ja |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamano del repositorio | 755,7 GB |
| Modelo base | `zai-org/GLM-5.3`, `JANGQ-AI/GLM-5.3-FP8` |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura `glm_moe_dsa` de GLM-5.3: una red de mezcla de expertos con atencion dispersa (DSA) de 78 capas y modalidad unicamente de texto. La intervencion aplicada por el autor es una edicion a nivel de pesos: se modifican los tensores residual-writer en bf16 mientras los expertos enrutados permanecen en FP8 sin cambios. No hay fine-tuning, LoRA, hooks de inferencia ni trucos de prompt; la modificacion es permanente y se carga directamente con vLLM estandar. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO, por lo que esos datos son no disponibles.

La innovacion tecnica destacable es la preservacion de la ruta FP8 nativa en Hopper, que evita la penalizacion habitual de las versiones abliterated en bf16. La model card documenta tambien dos aspectos operativos relevantes: el decodificado especulativo MTP (multi-token prediction) no funciona en vLLM estandar pero si en el fork de vLLM con MLA disperso de ciprianveg, donde reporta un +48 % de decodificacion en prompts de codigo; y la ruta de contexto de 1M mediante decode-context-parallel esta cerrada sobre `glm_moe_dsa` en vLLM, porque el `k_cache` del indexador DSA se replica entre rangos DCP mientras el KV MLA se fragmenta, lo que provoca el error `page size is not divisible by target page size and cannot be padded` para `fp8_ds_mla`.

## Capacidades

- Generacion de texto y conversacion multi-turno en 10 idiomas: ingles, chino, ruso, serbio, hindi, frances, espanol, arabe, coreano y japones.
- Razonamiento explicito con modo de pensamiento: el texto de razonamiento se devuelve en `message.reasoning` (no en `message.reasoning_content`).
- Control de esfuerzo de razonamiento mediante `reasoning_effort`, con la salvedad de que solo se respetan los valores `low` y `high`; cualquier otro valor (`off`, `medium`, `max` o sin definir) cae a `max`.
- Tool calling y function calling: la receta de servicio incluye `--tool-call-parser glm47` y `--enable-auto-tool-choice`.
- Uso en bucles de agente: la model card recomienda `reasoning_effort="low"` para uso agentico o con herramientas sobre FP8, para evitar agotar el presupuesto de `max_tokens` dentro del bloque `<think>`.
- Decodificado especulativo MTP en el fork de vLLM con `--draft-attention-backend B12X_MLA_SPARSE` (no funcional en vLLM estandar).
- Comportamiento de rechazo reducido de forma generalista y multilingue (no limitado a un unico dominio), segun las metricas de HarmBench-320 de la model card.
- No dispone de capacidades de vision ni de audio: es un modelo exclusivamente de texto.

## Casos de uso

- Generacion de codigo en produccion: el checkpoint esta pensado para servirse con vLLM en TP8 y soporta tool calling y prefix caching, por lo que encaja en pipelines de asistencia de codigo o revision automatica donde se requiere un modelo de gran capacidad con baja latencia de decodificacion en FP8.
- Agentes autonomos multi-paso: con `reasoning_effort="low"` y el parser de tool calling `glm47`, el modelo puede encadenar llamadas a herramientas sin consumir todo el presupuesto de tokens en el bloque de razonamiento, un problema documentado en el checkpoint al usar `high` o `max`.
- Procesamiento de documentos largos en varios idiomas: con 131 072 tokens de contexto en la configuracion de servicio recomendada, permite resumir, extraer y responder preguntas sobre expedientes extensos en ingles, chino, espanol, arabe, hindi u otros de los idiomas declarados.
- Atencion al cliente automatizada multilingue: la combinacion de contexto largo, conversacion multi-turno y diez idiomas soportados permite gestionar historiales de conversacion extensos sin truncar el contexto previo.
- Investigacion sobre seguridad y alineacion: el modelo es util como objeto de estudio de tecnicas de abliteration a nivel de pesos, con metricas publicadas de MMLU y HarmBench-320 que permiten medir el coste en capacidad y el cambio en comportamiento de rechazo.
- Evaluacion comparativa de despliegues FP8 en Hopper: sirve para medir rendimiento real de la ruta FP8 nativa frente a variantes bf16, incluido el impacto del MTP en el fork de vLLM con MLA disperso (+48 % de decodificacion en prompts de codigo).
- Generacion de texto creativo y de dominio general sin capas de rechazo: el checkpoint esta disenado para no aplicar filtros de negativa, lo que resulta adecuado en entornos controlados de redaccion o simulacion donde el filtrado se gestiona en la capa de aplicacion.
- Analisis de requisitos y documentacion tecnica en espanol: entre los idiomas declarados figura el espanol, lo que permite usarlo para resumir especificaciones, generar changelogs o transformar documentacion tecnica.

## Benchmarks y rendimiento

Datos publicados en la model card (v2 y v1 del propio checkpoint, comparados con el base GLM-5.3):

| Benchmark | Version | Resultado | Delta frente al base | Puerta |
|---|---|---|---|---|
| MMLU (muestra estratificada de 1026 preguntas, 18 por materia) | v2 | 87,43 % (897/1026) | +1,85 pp | pasa (±5 pp) |
| MMLU (misma muestra) | v1 (referencia) | 87,72 % | +2,14 pp | pasa |
| MMLU (linea base GLM-5.3 regular) | base | 85,58 % | — | — |

Variacion por materia en v2 frente a v1: delta medio de -0,29 pp; solo `high_school_european_history` se movio mas de una pregunta (94,4 a 83,3, -11,1 pp, equivalente a 2 preguntas); las mayores ganancias fueron `college_chemistry`, `world_religions`, `professional_psychology` y `security_studies`, todas +5,5 a +5,6 pp (una pregunta cada una). El ruido por materia es de ±5,5 pp por pregunta.

HarmBench-320 en modo greedy, `max_tokens=700` por respuesta:

| Esfuerzo | TRUE_COMPLY | SOFT_REFUSE | REDIRECT | DEFLECT | HARD_REFUSE | GARBAGE | UNK |
|:---:|---:|---:|---:|---:|---:|---:|---:|
| off (320 comportamientos) | 261 (81,6 %) | 19 (5,9 %) | 22 (6,9 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 18 (5,6 %) |
| max (320 comportamientos) | 254 (79,4 %) | 15 (4,7 %) | 23 (7,2 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 28 (8,8 %) |
| off (240 comportamientos sin copyright) | 220 (91,7 %) | 1 (0,4 %) | no disponible (model card truncada) | no disponible | no disponible | no disponible | no disponible |
| max (240 comportamientos sin copyright) | no disponible (model card truncada) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Datos adicionales declarados: v2 elimina el fallo de bucle de razonamiento de v1 (0 loops en la sonda de casos duros y 0 resultados GARBAGE en HB-320), a cambio de aproximadamente 4 pp menos de TRUE_COMPLY global en HB-320; sobre la superficie de dano real (240 comportamientos sin copyright) v2 mejora a v1 (91,7 % frente a 85,9 % con `off`). No se han publicado benchmarks de codigo, matematicas o tareas de agentes en la informacion disponible.

## Requisitos de hardware

- VRAM de pesos: el repositorio ocupa 755,7 GB en safetensors FP8, por lo que la inferencia exige agregacion de memoria en multiples GPUs. No hay version GGUF ni cuantizaciones de menor precision documentadas en la informacion proporcionada.
- Configuracion de referencia: 8x H200 con tensor-parallel 8, `--gpu-memory-utilization 0.90`, `--enforce-eager`, `--disable-custom-all-reduce`, `--enable-prefix-caching`, `--max-num-seqs 24`, `--max-model-len 131072`.
- Alternativa validada por campo: 8x DGX Spark GB10 (probandose por @0xMagnus, discusion enlazada en la model card).
- Techo de contexto practico reportado en TP8 sobre H200: aproximadamente 131K con MTP y 160K sin MTP. El contexto de 1M via decode-context-parallel no es funcional hoy sobre `glm_moe_dsa` en vLLM.
- Parallelismo: PP2 x TP4 perfila correctamente, pero el draft MTP no implementa `SupportsPP`. El decodificado especulativo MTP esta desactivado en vLLM estandar.
- GPU de consumo: no es viable en GPU de consumo. No cabe en una RTX 4090 ni en configuraciones de una o dos GPUs de gama alta, dado el tamano de pesos (aproximadamente 755 GB).
- Opciones de despliegue: vLLM (ruta recomendada y unica documentada). No se documenta soporte de llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no se publican valores absolutos. El unico dato relativo es un +48 % de decodificacion en prompts de codigo con el fork de vLLM con MLA disperso (`--draft-attention-backend B12X_MLA_SPARSE`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Rendimiento publicado | Disponibilidad |
|---|---|---|---|---|---|---|
| schwyzquant/GLM-5.3-UNCENSORED-FP8 (este) | 753,3B | 131 072 tokens (servicio TP8) | safetensors, FP8 | MIT | MMLU 87,43 %; TRUE_COMPLY 81,6 % en HB-320 (effort off) | HuggingFace |
| JANGQ-AI/GLM-5.3-FP8 (base directo) | no disponible | no disponible | safetensors, FP8 | no disponible | no disponible | HuggingFace |
| zai-org/GLM-5.3 (upstream) | no disponible | no disponible | no disponible | no disponible | MMLU 85,58 % (linea base citada) | HuggingFace |
| dealignai/GLM-5.3-CYBERSECURITY-FP8 (variante hermanada) | no disponible | no disponible | FP8 | no disponible | no disponible | HuggingFace |

No se dispone de datos de terceros comparables (por ejemplo, otros MoE de escala similar) en la informacion proporcionada, por lo que no se incluyen en la tabla.

## Limitaciones y advertencias

- Modelo abliterated: los tensores de rechazo han sido eliminados de forma permanente. Puede generar contenido danino, ilegal o sensible sin aplicar negativas, lo que exige controles de seguridad en la capa de aplicacion.
- Riesgo de alucinacion: como cualquier modelo generativo de gran escala, puede producir informacion falsa con apariencia de verosimilitud; la model card no publica tasas de alucinacion.
- Sesgos conocidos: no se documentan evaluaciones de sesgo en la informacion disponible.
- `reasoning_effort` con comportamiento anomalo: solo se respetan `low` y `high`; `off`, `medium`, `max` o ausencia de valor caen a `max`. No existe forma de desactivar el razonamiento con este checkpoint.
- Respuestas vacias por agotamiento de presupuesto: con `high` o `max`, el modelo puede consumir todo el presupuesto de `max_tokens` dentro del bloque `<think>` y devolver cero tokens de respuesta con `finish=length`. La model card recomienda `max_tokens >= 8000` en esos modos y >= 2600 para `max`.
- Salida de razonamiento en un campo no estandar: el texto va en `message.reasoning`, no en `message.reasoning_content`, lo que puede romper integraciones que esperen el campo habitual.
- MTP no funcional en vLLM estandar; requiere el fork B12X. Ademas, el draft MTP no implementa `SupportsPP`, lo que limita combinaciones de paralelismo.
- Contexto de 1M no utilizable en la practica con vLLM sobre `glm_moe_dsa` por el fallo de `fp8_ds_mla` en decode-context-parallel.
- Cobertura idiomatica: se declaran diez idiomas, pero no se publican evaluaciones por idioma; el rendimiento en serbio, hindi o arabe puede ser desigual.
- Restricciones de licencia: la model card declara MIT, lo que permite uso comercial, pero no se detallan las condiciones de la licencia del modelo upstream `zai-org/GLM-5.3` ni del checkpoint intermedio; conviene verificarlas antes de un despliegue comercial.
- Discrepancia de autoria: el repositorio se publica bajo la cuenta `schwyzquant`, mientras que la model card atribuye el lanzamiento a dealignai. No hay garantia de soporte ni mantenimiento por parte de ninguna de las dos partes.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso que permita validar la calidad fuera de lo declarado por el autor.
- Consumo de recursos: aproximadamente 755 GB de pesos en FP8 hacen inviable su despliegue fuera de clusters con 8 GPUs o nodos equivalentes.
- La model card original esta truncada en la seccion de HarmBench para los 240 comportamientos sin copyright en modo `max`, por lo que no se puede verificar esa fila.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/schwyzquant/GLM-5.3-UNCENSORED-FP8
- HuggingFace (repositorio de referencia del autor, segun model card): https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8
- HuggingFace (modelo base directo): https://huggingface.co/JANGQ-AI/GLM-5.3-FP8
- HuggingFace (modelo upstream): https://huggingface.co/zai-org/GLM-5.3
- HuggingFace (variante de ciberseguridad hermanada): https://huggingface.co/dealignai/GLM-5.3-CYBERSECURITY-FP8
- Discusion con notas de despliegue en 8x DGX Spark GB10: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8/discussions/3
- Twitter del autor declarado: https://twitter.com/dealignai
- La busqueda web realizada no ha devuelto resultados relevantes para este modelo; los enlaces encontrados corresponden a contenidos no relacionados (jailbreaks de ChatGPT, hilos de Reddit y publicaciones sobre limites de uso de ChatGPT Plus).
