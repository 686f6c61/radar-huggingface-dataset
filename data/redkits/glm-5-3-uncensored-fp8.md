# redkits/GLM-5.3-UNCENSORED-FP8

## Resumen

GLM-5.3-UNCENSORED-FP8 es una modificación de pesos a nivel de modelo del checkpoint FP8 de GLM-5.3, publicada por el colectivo dealignai (repositorio consultado bajo la cuenta redkits) con el objetivo de eliminar el comportamiento de rechazo en un espectro amplio de categorías de daño multilingües. No se trata de un fine-tuning, un LoRA ni de ganchos en tiempo de ejecución: la model card indica que la edición es una modificación permanente en precisión bf16 aplicada sobre los tensores residual-writer, mientras que los expertos enrutados en FP8 permanecen intactos.

El modelo base es JANGQ-AI/GLM-5.3-FP8, una cuantización FP8 del modelo upstream zai-org/GLM-5.3, de arquitectura `glm_moe_dsa` (mezcla de expertos con atención dispersa tipo DeepSeek), 78 capas, solo texto y 753.329.940.480 parámetros totales según el recuento de safetensors. El repositorio ocupa 755,7 GB, lo que obliga a despliegues multi-GPU de gama alta; la configuración de referencia es tensor-parallel 8 sobre ocho H200.

La release que se documenta aquí es la v2, que corrige un fallo de bucle de razonamiento presente en la v1 en aproximadamente el 2 % de las peticiones más difíciles, a cambio de una pérdida de unos 4 puntos porcentuales de cumplimiento global en HarmBench-320. La relevancia práctica del modelo está en que conserva velocidad FP8 nativa en tensor cores de Hopper y mantiene la capacidad del base (MMLU del 87,43 % frente al 85,58 % del GLM-5.3-regular), pero renuncia deliberadamente a los mecanismos de seguridad alineados del modelo original, lo que restringe severamente su uso legítimo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE `glm_moe_dsa` (mezcla de expertos con atención dispersa), 78 capas, solo texto |
| Parametros totales | 753.329.940.480 (~753B) |
| Parametros activos | no disponible |
| Longitud de contexto | no declarada explícitamente en la model card; se menciona soporte de 1M de tokens vía decode-context-parallel, no operativo hoy en vLLM sobre `glm_moe_dsa`. Techo práctico reportado: ~131K con MTP y ~160K sin MTP en TP8 sobre H200. El ejemplo de servicio usa `--max-model-len 131072` |
| Tipos de cuantizacion | FP8 (nativo del base JANGQ-AI/GLM-5.3-FP8); residual writers editados en bf16 |
| Idiomas soportados | en, zh, ru, sr, hi, fr, es, ar, ko, ja |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamano del repositorio | 755,7 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion registrada | 2026-09-15 |

## Arquitectura y entrenamiento

La arquitectura es `glm_moe_dsa`: un transformer de mezcla de expertos con 78 capas y un mecanismo de atención dispersa (DSA, en la línea del indexado disperso de DeepSeek). Es un modelo exclusivamente de texto, sin torre de visión ni de audio. Sobre el checkpoint FP8 original, la modificación consiste en una edición de pesos en bf16 aplicada a los tensores residual-writer; los expertos enrutados en FP8 no se tocan. La model card insiste en que no hay fine-tuning, LoRA, ganchos de runtime ni trucos de prompt: el cambio es permanente y se carga con vLLM estándar. El resultado es que se conserva la velocidad nativa de tensor cores FP8 en Hopper (H100/H200).

No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo base; esos datos corresponden a zai-org/GLM-5.3 y no se reproducen aquí. La innovación técnica destacable de esta release concreta es doble: por un lado, el arreglo del bucle de razonamiento de la v1 (0 bucles en la sonda de prompts duros y 0 salidas GARBAGE en HB-320); por otro, el soporte de decodificación especulativa MTP, que no funciona en vLLM stock pero sí en el fork sparse-MLA B12X de ciprianveg con `--draft-attention-backend B12X_MLA_SPARSE`, donde reporta un +48 % de decodificación en prompts de código.

## Capacidades

- Generación de texto conversacional multilingüe en diez idiomas declarados: inglés, chino, ruso, serbio, hindi, francés, español, árabe, coreano y japonés.
- Razonamiento explícito con bloque `<think>`, controlado mediante el parámetro `reasoning_effort`. En este checkpoint solo se honran los valores `"low"` y `"high"`; cualquier otro valor (`off`, `medium`, `max`, sin definir o un `off:` sin comillas que YAML parsea como booleano `false`) cae a `max`. No existe forma de desactivar el razonamiento.
- Tool calling y function calling, con parser dedicado (`--tool-call-parser glm47`) y elección automática de herramienta (`--enable-auto-tool-choice`).
- Flujos de agente y razonamiento multi-paso, con la advertencia de que en FP8 conviene usar `reasoning_effort="low"` para bucles de herramientas, porque en `high` o `max` el modelo puede consumir todo el presupuesto de `max_tokens` dentro del bloque de razonamiento y devolver cero tokens de respuesta con `finish=length`.
- El texto de razonamiento se expone en `message.reasoning`, no en `message.reasoning_content`.
- Cumplimiento de instrucciones de propósito general con capacidad preservada: MMLU del 87,43 % en una muestra estratificada de 1026 preguntas, por encima del 85,58 % del GLM-5.3-regular.
- Reducción deliberada del comportamiento de rechazo en una taxonomía amplia de daño multilingüe, que es precisamente la capacidad buscada por los autores y también su principal riesgo.

## Casos de uso

- Evaluación de alineación y seguridad en investigación: el modelo funciona como sujeto de prueba para medir la eficacia de las técnicas de abliteration a nivel de pesos, comparando las tasas de cumplimiento de HarmBench-320 frente al checkpoint original sin modificar.
- Auditoría de robustez de clasificadores de contenido: al producir respuestas sin rechazo de forma sistemática, permite generar conjuntos de datos adversarios controlados para entrenar y validar moderadores automáticos.
- Investigación sobre estabilidad de razonamiento en MoE dispersos: la comparación v1 frente a v2 documentada en la model card (bucles de razonamiento frente a estabilidad) sirve como caso de estudio reproducible del fallo de colapso en repetición con presupuestos de tokens ajustados.
- Benchmarking de infraestructura FP8 en Hopper: con 753B parámetros y pesos FP8, es una carga de trabajo realista para medir throughput de tensor-parallel 8, efecto de `--enforce-eager` en la ruta de atención dispersa y rendimiento de decodificación especulativa MTP en forks especializados.
- Análisis de preservación de capacidades tras edición de pesos: el panel de 57 materias MMLU permite estudiar qué áreas de conocimiento se degradan (en v2 solo `high_school_european_history` cayó más de una pregunta) al modificar tensores residual-writer.
- Estudio multilingüe comparativo: con diez idiomas declarados, incluidos serbio y hindi, permite analizar si la reducción de rechazo es uniforme entre lenguas o si el comportamiento difiere según la familia lingüística.
- No se recomienda su uso en atención al cliente, generación de código en producción ni ningún despliegue orientado al usuario final, dado que los mecanismos de rechazo han sido eliminados de forma deliberada y permanente.

## Benchmarks y rendimiento

MMLU sobre muestra estratificada de 1026 preguntas (18 por materia):

| Version | MMLU | Delta vs base GLM-5.3-regular (85,58 %) | Umbral +/-5 pp |
|---|---|---|---|
| v2 (esta release) | 87,43 % (897/1026) | +1,85 pp | pasa |
| v1 (referencia) | 87,72 % | +2,14 pp | pasa |

Desglose por materia de v2 frente a v1: delta medio por materia de -0,29 pp, coherente con el dato global. Solo una materia se movió más de lo que equivale a una pregunta: `high_school_european_history` (94,4 % a 83,3 %, -11,1 pp, dos preguntas). Las mayores subidas fueron `college_chemistry`, `world_religions`, `professional_psychology` y `security_studies`, todas de +5,5 a +5,6 pp (una pregunta cada una). El ruido por materia es de ±5,5 pp por pregunta.

HarmBench-320, decodificación greedy, `max_tokens=700`, en los dos regímenes de servicio reales (`off` y `max`); `low` se omitió por metodología:

| effort | TRUE_COMPLY | SOFT_REFUSE | REDIRECT | DEFLECT | HARD_REFUSE | GARBAGE | UNK |
|:---:|---:|---:|---:|---:|---:|---:|---:|
| off | 261 (81,6 %) | 19 (5,9 %) | 22 (6,9 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 18 (5,6 %) |
| max | 254 (79,4 %) | 15 (4,7 %) | 23 (7,2 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 28 (8,8 %) |

Subconjunto sin derechos de autor (240 comportamientos, la superficie de daño real):

| effort | TRUE_COMPLY | SOFT_REFUSE | REDIRECT | DEFLECT | HARD_REFUSE | GARBAGE | UNK |
|:---:|---:|---:|---:|---:|---:|---:|---:|
| off | 220 (91,7 %) | 1 (0,...) | datos truncados | datos truncados | datos truncados | datos truncados | datos truncados |
| max | datos truncados en la model card | - | - | - | - | - | - |

La model card está truncada en este punto, por lo que la fila completa del subconjunto de 240 comportamientos y el resto de métricas no están disponibles. Sí se indica que la v2 es más fuerte que la v1 en esa superficie (91,7 % frente a 85,9 % de TRUE_COMPLY con `effort=off`), a cambio de unos 4 pp menos de TRUE_COMPLY global en HB-320.

## Requisitos de hardware

- Pesos: 753.329.940.480 parámetros en FP8 sobre safetensors, con un repositorio de 755,7 GB. La VRAM mínima útil para cargar pesos ronda los 753 GB, antes de caché KV y activaciones.
- Configuración de referencia: tensor-parallel 8 sobre 8× H200 (141 GB por GPU, ~1128 GB agregados) con `--gpu-memory-utilization 0.90`.
- Se reporta validación en 8× DGX Spark GB10 por parte de un tercero, aunque la model card no detalla el rendimiento obtenido en esa plataforma.
- No cabe en GPU de consumo: ni en una RTX 4090 (24 GB) ni en configuraciones multi-GPU de gama consumer. Es un modelo exclusivamente de centro de datos.
- Opciones de despliegue: vLLM es la ruta soportada, con flags obligatorios `--enforce-eager` (necesario para la ruta de atención dispersa bajo concurrencia) y `--disable-custom-all-reduce`, más `--enable-prefix-caching`, `--max-num-seqs 24` y `--max-model-len 131072` en el ejemplo publicado. No se documenta soporte de llama.cpp, Ollama ni TGI para este checkpoint.
- Decodificación especulativa MTP: no funcional en vLLM stock; funciona en el fork sparse-MLA B12X con `--draft-attention-backend B12X_MLA_SPARSE`, con un +48 % de decodificación reportado en prompts de código. El borrador MTP no implementa `SupportsPP`, por lo que pipeline-parallel (PP2 × TP4) perfila bien pero sin MTP.
- Escalado de contexto: el decode-context-parallel para 1M de tokens está cerrado hoy en `glm_moe_dsa` sobre vLLM, porque el `k_cache` del indexador DSA se replica entre rangos DCP mientras el KV MLA se fragmenta, provocando el error `page size is not divisible by target page size and cannot be padded` para `fp8_ds_mla`.
- Latencia y throughput absolutos: no disponibles. El único dato cuantitativo es el +48 % de decodificación del fork B12X en prompts de código.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| redkits/GLM-5.3-UNCENSORED-FP8 (esta ficha) | 753,3B | ~131K práctico en TP8/H200 | MMLU 87,43 %; TRUE_COMPLY 81,6 % (HB-320, effort off) | MIT | Repositorio de 755,7 GB, 0 descargas |
| JANGQ-AI/GLM-5.3-FP8 (base directa) | 753,3B | no disponible | no disponible (cuantización FP8 del upstream) | no disponible en esta información | Checkpoint FP8 de referencia |
| zai-org/GLM-5.3 (upstream) | 753B | no disponible | Base usada como referencia: MMLU 85,58 % | no disponible en esta información | Modelo original con alineación de seguridad intacta |
| dealignai/GLM-5.3-CYBERSECURITY-FP8 (variante hermana) | no disponible | no disponible | no disponible | no disponible en esta información | Orientada específicamente a ciberseguridad |

No se dispone de datos de benchmarks ni de especificaciones de contexto y licencia de los modelos comparables distintos del base inmediato, por lo que la comparación queda limitada a lo que la model card documenta.

## Limitaciones y advertencias

- Ausencia deliberada de rechazo: el modelo ha sido editado para eliminar los mecanismos de negativa en una taxonomía amplia de daño multilingüe. Generará contenido que los modelos alineados rechazarían, incluidas categorías relacionadas con derechos de autor, química de armamento y exploits. No apto para despliegue orientado al usuario final ni para productos comerciales que requieran moderación.
- Alucinación: no hay medición de tasas de alucinación en la información disponible. El único proxy de fiabilidad factual es MMLU sobre una muestra de 1026 preguntas, insuficiente para caracterizar el comportamiento en producción.
- Gestión del razonamiento: no se puede desactivar el bloque `<think>`. En `high` o `max` el modelo puede agotar el presupuesto de `max_tokens` sin emitir respuesta (`finish=length`), y los parámetros de muestreo (temp 0 con repetición 1,05, o temp 0,7 con top-p 0,95) no lo evitan. Con `effort=max` conviene fijar `max_tokens ≥ 2600`, y en bucles de agente se recomienda `low`.
- Mecánica de API poco estándar: el campo de razonamiento es `message.reasoning`, no `message.reasoning_content`; los valores de `reasoning_effort` distintos de `"low"` y `"high"` caen silenciosamente a `max`, incluido un `off:` sin comillas que YAML interpreta como booleano `false`.
- Limitaciones de contexto en producción: la ventana nominal de 1M de tokens no es operativa hoy en vLLM sobre `glm_moe_dsa`. El techo práctico es de aproximadamente 131K tokens con MTP y 160K sin MTP en TP8 sobre H200.
- Coste de despliegue: 755,7 GB de pesos y un mínimo de ocho aceleradores de gama H200 hacen inviable cualquier uso fuera de un clúster. No hay cuantizaciones alternativas (GGUF, AWQ, etc.) publicadas en esta información.
- Trazabilidad del repositorio: los datos de HuggingFace atribuyen el repositorio a redkits, mientras que la model card se refiere de forma consistente a `dealignai/GLM-5.3-UNCENSORED-FP8` y a la cuenta de Twitter `@dealignai`. Procede verificar la cadena de custodia antes de cualquier uso.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, sin validación comunitaria independiente más allá de los comentarios de runtime citados.
- Licencia MIT: no impone restricciones de uso comercial, lo que en la práctica significa que la responsabilidad legal y ética del contenido generado recae íntegramente en quien despliega el modelo.

## Enlaces

- Repositorio consultado: https://huggingface.co/redkits/GLM-5.3-UNCENSORED-FP8
- Repositorio referido en la model card: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8
- Modelo base upstream: https://huggingface.co/zai-org/GLM-5.3
- Cuantización FP8 base: https://huggingface.co/JANGQ-AI/GLM-5.3-FP8
- Variante de ciberseguridad: https://huggingface.co/dealignai/GLM-5.3-CYBERSECURITY-FP8
- Discusión con notas de runtime en 8× DGX Spark GB10: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8/discussions/3
- Perfil del autor de las notas de runtime: https://huggingface.co/0xMagnus
- Cuenta del colectivo autor: https://twitter.com/dealignai

La búsqueda web realizada no devolvió ningún resultado relacionado con este modelo ni con GLM-5.3: los enlaces obtenidos correspondían a un videojuego de Roblox y no se han incluido por no ser pertinentes. No se han localizado papers, blogs técnicos ni demostraciones adicionales.
