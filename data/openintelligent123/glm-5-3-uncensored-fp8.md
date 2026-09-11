# Openintelligent123/GLM-5.3-UNCENSORED-FP8

## Resumen

GLM-5.3-UNCENSORED-FP8 es una modificación a nivel de pesos del checkpoint FP8 de GLM-5.3 (zai-org/GLM-5.3, quantizado por JANGQ-AI), publicada con el identificador Openintelligent123/GLM-5.3-UNCENSORED-FP8 y atribuida en su model card al colectivo dealignai bajo la etiqueta de release "CRACK". Se trata de un modelo de lenguaje de 753.329.940.480 parámetros totales (aproximadamente 753B), con arquitectura glm_moe_dsa de tipo mezcla de expertos (MoE) y 78 capas, en formato FP8 y con pesos en safetensors. Su propósito declarado es eliminar a nivel de pesos el comportamiento de rechazo (refusal) de forma generalista y multilingüe, sin emplear LoRA, fine-tuning ni hooks en tiempo de ejecución.

La intervención técnica consiste en una edición bf16 permanente sobre los tensores "residual-writer", dejando intactos los expertos FP8 enrutados. Esto permite cargar el modelo con vLLM estándar y conservar la velocidad nativa de tensor cores FP8 en hardware Hopper (H100/H200). La versión v2 corrige un fallo de bucle de razonamiento detectado en v1 (que afectaba a aproximadamente un 2% de los prompts más difíciles), a cambio de una pérdida de unos 4 puntos porcentuales en TRUE_COMPLY global sobre HarmBench-320, aunque mejora en la superficie de daño real (240 comportamientos no relacionados con copyright).

El modelo es relevante para quienes investigan alineación, seguridad de modelos y evaluación de robustez frente a técnicas de ablación de rechazo, así como para equipos que necesitan un modelo de gran escala sin restricciones de contenido para tareas de red-teaming o generación de datos adversarios. Su licencia MIT y su integración con vLLM lo hacen desplegable en clústeres de 8 GPU, aunque su tamaño de repositorio (755,7 GB) y el contexto práctico limitado en vLLM condicionan seriamente su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | glm_moe_dsa (transformer MoE con atención dispersa tipo DeepSeek-sparse / DSA), 78 capas, text-only |
| Parametros totales | 753.329.940.480 (aproximadamente 753B) |
| Parametros activos | no disponible |
| Longitud de contexto | Hasta 1M anunciado; 131.072 configurado en el comando de servicio de referencia; techo práctico en TP8 H200 de aproximadamente 131K con MTP y aproximadamente 160K sin MTP |
| Tipos de cuantizacion | FP8 (expertos enrutados nativos en FP8); edición en bf16 sobre tensores residual-writer |
| Idiomas soportados | en, zh, ru, sr, hi, fr, es, ar, ko, ja |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 755,7 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura glm_moe_dsa del checkpoint base zai-org/GLM-5.3, un transformer de mezcla de expertos con 78 capas y atención dispersa tipo DSA (DeepSeek-sparse attention). El checkpoint concreto es un quantizado FP8 producido por JANGQ-AI (JANGQ-AI/GLM-5.3-FP8), por lo que los expertos enrutados se mantienen en FP8 sin cambios y solo se han modificado los tensores residual-writer en bf16. No se ha realizado fine-tuning, ni entrenamiento con LoRA, ni se aplican hooks en tiempo de ejecución: la modificación es una edición de pesos permanente, lo que la hace persistente ante cualquier stack de inferencia que cargue el checkpoint.

No se dispone de información en la documentación proporcionada sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si hubo fases de RLHF o DPO en el modelo base. La innovación técnica destacable es doble: por un lado, la técnica de ablación generalista y multilingüe aplicada sobre la taxonomía de daño en lugar de un dominio único; por otro, la conservación de la ruta FP8 nativa, que permite servir el modelo sin capas de dequantización adicionales. El autor reporta que la versión v2 elimina el fallo de bucle de razonamiento de v1 (0 bucles en la sonda de casos extremos, 0 respuestas GARBAGE en HB-320). Existe además una variante hermana orientada específicamente a ciberseguridad (dealignai/GLM-5.3-CYBERSECURITY-FP8).

## Capacidades

- Generación de texto conversacional y de propósito general, con soporte nativo de modo de razonamiento (bloques `<think>`) controlado mediante el parámetro `reasoning_effort`.
- Razonamiento multi-paso y cadenas de pensamiento extensas, con la advertencia de que en FP8 conviene usar `"low"` en bucles de agente para evitar agotar el presupuesto de `max_tokens` dentro del bloque de pensamiento.
- Soporte de tool calling / function calling mediante el parser `glm47` y `--enable-auto-tool-choice` en vLLM.
- Capacidades de agente y bucles de herramientas, con recomendación explícita de `reasoning_effort="low"` en despliegues FP8.
- Multilingüismo en diez idiomas: inglés, chino, ruso, serbio, hindi, francés, español, árabe, coreano y japonés.
- Decodificación especulativa mediante MTP (Multi-Token Prediction), no funcional en vLLM estándar pero operativa en el fork vLLM sparse-MLA de ciprianveg con `--draft-attention-backend B12X_MLA_SPARSE`.
- Ausencia declarada de comportamiento de rechazo en una taxonomía amplia de daño multilingüe (comportamiento buscado por el autor, no una capacidad funcional adicional).
- Sin capacidades de visión: el modelo es text-only.

## Casos de uso

- Red-teaming y evaluación de seguridad: el modelo sirve como sujeto de prueba para medir la eficacia de técnicas de ablación de rechazo frente a conjuntos como HarmBench-320, permitiendo comparar superficies de cumplimiento entre el checkpoint base y la variante modificada.
- Generación de datos adversarios para entrenamiento de clasificadores de seguridad: al no rechazar peticiones en la mayoría de la taxonomía de daño (91,7% de TRUE_COMPLY en las 240 conductas no relacionadas con copyright con `reasoning_effort=off`), puede emplearse para producir corpus etiquetados que alimenten moderadores automáticos.
- Investigación en alineación y mecanística de la interpretabilidad: la edición se limita a los tensores residual-writer, lo que permite estudiar la relación entre un subconjunto concreto de pesos bf16 y el comportamiento de rechazo, comparando directamente contra el checkpoint FP8 sin modificar.
- Asistencia conversacional multilingüe en producción: con soporte de diez idiomas y ventana de 131K tokens configurable, es viable para atención al cliente multi-turno en mercados como el hispanohablante, el árabe o el coreano, siempre que se revise la licencia y la adecuación normativa.
- Generación de código en pipelines automatizados: gracias al soporte de tool calling mediante `--enable-auto-tool-choice` y el parser `glm47`, puede integrarse en agentes de CI/CD que invoquen herramientas externas, aunque el autor recomienda `reasoning_effort="low"` para evitar agotar el presupuesto en el bloque `<think>`.
- Investigación sobre bucles de razonamiento: la comparación entre la v1 y la v2 de este release ofrece un caso de estudio sobre el fallo de colapso por repetición en prompts con fuerte señal de rechazo y sobre cómo mitigarlo mediante edición de pesos.
- Despliegue en clústeres de 8 GPU para inferencia de gran escala: con tensor parallelism 8 sobre H200 o sobre 8 nodos DGX Spark GB10, es posible servir el modelo con FP8 nativo y prefix caching activado.
- Evaluación comparativa de cuantizaciones FP8: dado que el autor reporta MMLU de 87,43% en v2 frente a 85,58% de la línea base regular, el modelo puede utilizarse como punto de medida en estudios sobre preservación de capacidades tras cuantizar a FP8.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card.

Preservación de capacidades (MMLU, muestra estratificada de 1026 preguntas, 18 por asignatura):

| Metrica | Valor | Delta vs base | Umbral (+/-5 pp) |
|---|---|---|---|
| MMLU v2 | 87,43% (897/1026) | +1,85 pp | pasa |
| MMLU v1 (referencia) | 87,72% | +2,14 pp | pasa |
| MMLU base GLM-5.3 regular | 85,58% | — | — |

Por asignatura, la media de diferencia por materia entre v2 y v1 es de -0,29 pp, con una única asignatura que se desvía más de una pregunta (`high_school_european_history`, 94,4 a 83,3, -11,1 pp). Las mayores ganancias se dan en `college_chemistry`, `world_religions`, `professional_psychology` y `security_studies` (+5,5 a +5,6 pp).

Comportamiento de cumplimiento (HarmBench-320, decodificación greedy, `max_tokens=700`):

| Esfuerzo | TRUE_COMPLY | SOFT_REFUSE | REDIRECT | DEFLECT | HARD_REFUSE | GARBAGE | UNK |
|:---:|---:|---:|---:|---:|---:|---:|---:|
| off (320 conductas) | 261 (81,6%) | 19 (5,9%) | 22 (6,9%) | 0 (0%) | 0 (0%) | 0 (0%) | 18 (5,6%) |
| max (320 conductas) | 254 (79,4%) | 15 (4,7%) | 23 (7,2%) | 0 (0%) | 0 (0%) | 0 (0%) | 28 (8,8%) |
| off (240 conductas sin copyright) | 220 (91,7%) | 1 (dato truncado en la model card) | — | — | — | — | — |

La model card indica además que la v1 obtenía 85,9% de TRUE_COMPLY con esfuerzo `off` en las 240 conductas no relacionadas con copyright, frente al 91,7% de la v2. No se han publicado en la información disponible otros benchmarks estándar como HumanEval, GSM8K o MATH.

## Requisitos de hardware

- VRAM estimada: los pesos FP8 ocupan aproximadamente 753 GB, a los que hay que sumar la caché KV para el contexto configurado. El repositorio completo pesa 755,7 GB.
- GPU recomendadas: 8x H100 o 8x H200 con tensor parallelism 8 (comando de referencia del autor con `--gpu-memory-utilization 0.90`). También validado por un tercero en 8x DGX Spark GB10.
- Cabe en GPU de consumo: no. El tamaño del checkpoint y el requisito de tensor parallelism 8 lo excluyen de cualquier configuración de una o dos GPU, incluidas RTX 4090 o RTX 5090.
- Opciones de despliegue: vLLM es la ruta soportada y probada, con `--tensor-parallel-size 8`, `--enforce-eager` obligatorio para la ruta de atención dispersa bajo concurrencia, `--disable-custom-all-reduce`, `--enable-prefix-caching`, `--max-num-seqs 24`, `--max-model-len 131072`, `--reasoning-parser glm45`, `--tool-call-parser glm47` y `--enable-auto-tool-choice`. El model card menciona también un fork de vLLM con backend sparse-MLA B12X (`--draft-attention-backend B12X_MLA_SPARSE`) que habilita MTP. No se mencionan llama.cpp, Ollama ni TGI en la documentación.
- Latencia y throughput: no se publican cifras absolutas. El autor reporta una mejora del 48% en decodificación sobre prompts de código al usar MTP en el fork B12X sparse-MLA de vLLM. El MTP estándar no es funcional en vLLM de serie para GLM-5.3.
- Contexto práctico: el decode-context-parallel de 1M está cerrado en `glm_moe_dsa` sobre vLLM por un error de paginación (`page size is not divisible by target page size and cannot be padded` en `fp8_ds_mla`); el techo práctico en TP8 H200 es de aproximadamente 131K con MTP y 160K sin él. El pipeline-parallel (PP2 x TP4) perfila bien, pero el draft MTP no implementa `SupportsPP`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Openintelligent123/GLM-5.3-UNCENSORED-FP8 | 753B totales | 1M anunciado, 131K configurado | MIT | safetensors FP8 | Variante ablacionada; MMLU 87,43%; TRUE_COMPLY 81,6% en HB-320 (off) |
| JANGQ-AI/GLM-5.3-FP8 | 753B totales | no disponible | no disponible | safetensors FP8 | Base directa del release; sin ablation de rechazo |
| zai-org/GLM-5.3 | 753B totales | no disponible | no disponible | no disponible | Modelo original de Zhipu AI; MMLU reportado como 85,58% en la comparativa del autor |
| dealignai/GLM-5.3-CYBERSECURITY-FP8 | no disponible | no disponible | no disponible | safetensors FP8 | Variante hermana especializada en ciberseguridad |

No se dispone de datos de benchmarks comparables de otros modelos de escala similar (por ejemplo, familias de 600-800B parámetros) en la información proporcionada, por lo que no se incluye una comparativa de rendimiento cruzada.

## Limitaciones y advertencias

- El modelo está diseñado explícitamente para eliminar el comportamiento de rechazo. Esto implica ausencia de barreras de seguridad integradas y un riesgo elevado de uso indebido para generar contenido dañino, incluido material relacionado con armas químicas, exploits o contenido sujeto a copyright.
- Riesgo de agotamiento de presupuesto en el bloque de razonamiento: con `reasoning_effort` en `high` o `max` y en FP8, el modelo puede consumir todo el `max_tokens` dentro de `<think>` y devolver cero tokens de respuesta (`finish=length`). El autor recomienda `max_tokens >= 8000` en esos casos y `"low"` para bucles de agente.
- `reasoning_effort` solo respeta los valores `"low"` y `"high"`. Cualquier otro valor (`off`, `medium`, `max`, sin definir, o un `off:` YAML sin comillas que se interpreta como booleano `false`) recae en `max`. No existe forma de desactivar el razonamiento en este checkpoint.
- El texto de razonamiento se expone en `message.reasoning`, no en `message.reasoning_content`, lo que puede romper integraciones que esperen el campo habitual.
- MTP no funcional en vLLM estándar: la decodificación especulativa no está disponible sin un fork concreto y con el backend `B12X_MLA_SPARSE`.
- El soporte de contexto de 1M mediante decode-context-parallel está cerrado sobre `glm_moe_dsa` en vLLM por un problema de paginación de caché, lo que limita el uso práctico a aproximadamente 131K-160K tokens.
- Sesgos conocidos: la model card no documenta una evaluación de sesgos demográficos ni de toxicidad diferencial; la ablación de rechazo puede alterar de forma no controlada el comportamiento en dominios sensibles, como sugiere la caída de 11,1 pp en `high_school_european_history`.
- Diferencias de atribución: el identificador de HuggingFace corresponde a `Openintelligent123`, mientras que la model card se presenta como un release de `dealignai`. Conviene verificar la procedencia de los pesos antes de cualquier uso en producción.
- Restricciones de licencia: el modelo declara MIT, pero hereda del checkpoint base zai-org/GLM-5.3 y de la cuantización de JANGQ-AI, cuyos términos no se detallan en la información disponible. Es necesario verificar la licencia del modelo base antes del uso comercial.
- El repositorio no tiene descargas ni likes registrados y fue creado y actualizado el mismo día, lo que limita la evidencia de validación independiente.
- El uso de un modelo sin barreras de rechazo puede contravenir políticas de plataforma, términos de servicio de proveedores de API y, según la jurisdicción, normativa aplicable sobre contenido generado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Openintelligent123/GLM-5.3-UNCENSORED-FP8
- Perfil del autor del release en HuggingFace: https://huggingface.co/dealignai
- Cuenta de Twitter del autor del release: https://twitter.com/dealignai
- Discusión con notas de despliegue en 8x DGX Spark GB10: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8/discussions/3
- Modelo hermano especializado en ciberseguridad: https://huggingface.co/dealignai/GLM-5.3-CYBERSECURITY-FP8
- Modelo base original: zai-org/GLM-5.3
- Cuantización FP8 base: https://huggingface.co/JANGQ-AI/GLM-5.3-FP8
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: los enlaces recuperados corresponden a un portal de noticias en alemán y no guardan relación con el contenido de la ficha.
