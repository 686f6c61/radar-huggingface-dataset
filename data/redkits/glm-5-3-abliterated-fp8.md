# redkits/GLM-5.3-ABLITERATED-FP8

## Resumen

`redkits/GLM-5.3-ABLITERATED-FP8` es una publicación de pesos de 753.329.940.480 parámetros (unos 753,3 mil millones) derivada de `JANGQ-AI/GLM-5.3-FP8`, que a su vez es la cuantización FP8 del modelo `zai-org/GLM-5.3`. Se trata de un modelo de lenguaje de arquitectura `glm_moe_dsa` (mezcla de expertos con atención dispersa, 78 capas, solo texto) al que se le ha aplicado una modificación de pesos de tipo abliteration: se editan los tensores residual-writer en bf16 para reducir el comportamiento de rechazo, manteniendo intactos los expertos enrutados en FP8. El resultado es un checkpoint "sin censura" que funciona con vLLM estándar y conserva la velocidad nativa de FP8 en hardware Hopper (H100/H200).

La relevancia de esta ficha es doble. Por un lado, documenta un caso de estudio de modificación de pesos a escala de 753B sin fine-tuning, sin LoRA y sin hooks de runtime, lo que la convierte en material útil para investigación sobre alineación, taxonomías de rechazo y evaluación de robustez de salvaguardas multilingües. Por otro, expone las limitaciones prácticas de servir un modelo de este tamaño: el repositorio ocupa 755,7 GB, requiere despliegues multi-GPU (8×H200 en la configuración de referencia) y arrastra restricciones operativas concretas, como que el esfuerzo de razonamiento solo admita los valores `low` y `high`.

Conviene señalar una advertencia de procedencia: la model card almacenada en este repositorio corresponde a una release de `dealignai` (`GLM-5.3-UNCENSORED-FP8`), no a un artefacto propio del autor `redkits`. El repositorio no registra descargas ni likes en la información disponible, por lo que los datos de evaluación que se citan a continuación deben atribuirse a dicha model card y no a una validación independiente de estos pesos concretos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `glm_moe_dsa` (mezcla de expertos con atención dispersa tipo DeepSeek, 78 capas, solo texto) |
| Parámetros totales | 753.329.940.480 (~753,3 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible como valor nativo; 131.072 tokens en la configuración de servicio de referencia (TP8) y techo práctico declarado de ~131K con MTP y ~160K sin MTP en TP8 sobre H200 |
| Tipos de cuantización | FP8 (expertos enrutados en FP8, residual writers en bf16); no se publican GGUF, AWQ ni GPTQ |
| Idiomas soportados | en, zh, ru, sr, hi, fr, es, ar, ko, ja |
| Licencia | MIT (metadatos del repositorio); verificar términos del modelo base upstream |
| Formato de pesos | safetensors (755,7 GB en total) |
| Modalidad | texto únicamente |
| Modelo base | `JANGQ-AI/GLM-5.3-FP8`, derivado de `zai-org/GLM-5.3` |
| Fecha de publicación | 15 de septiembre de 2026 (según metadatos del repositorio) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura `glm_moe_dsa` del GLM-5.3 original: un transformer de mezcla de expertos con 78 capas y un mecanismo de atención dispersa tipo DeepSeek (DSA), con indexador propio (`k_cache`) y caché KV en formato MLA (referida como `fp8_ds_mla` en los avisos de despliegue). Los expertos enrutados se conservan en FP8 y solo se editan los tensores residual-writer en bf16, lo que constituye una modificación de pesos genuina y permanente, sin fine-tuning, sin adaptadores LoRA, sin hooks de runtime y sin trucos de prompt. No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron etapas de RLHF o DPO en el modelo base.

La innovación técnica declarada es la propia metodología de abliteration a escala de pesos ("weight-level uncensoring") aplicada de forma generalista, no restringida a un dominio concreto. La versión v2 corrige un fallo de bucle de razonamiento presente en v1, que afectaba a aproximadamente el 2% de los prompts con señal de rechazo más dura (copyright literal, química de armamento, exploits contra objetivos reales) y que provocaba colapso en repetición antes de emitir respuesta. Según la model card, v2 registra 0 bucles en la sonda "hardcore" y 0 casos GARBAGE en HarmBench-320, a cambio de una pérdida de unos 4 puntos porcentuales de TRUE_COMPLY global en ese benchmark, compensada con una mejora en la superficie de daño real (240 comportamientos no relacionados con copyright): 91,7% frente a 85,9% en v1 con el razonamiento desactivado.

## Capacidades

- Generación de texto conversacional y de propósito general en 10 idiomas (en, zh, ru, sr, hi, fr, es, ar, ko, ja).
- Modo de razonamiento siempre activo: `reasoning_effort` solo acepta `"low"` y `"high"`; cualquier otro valor (`off`, `medium`, `max`, sin definir o un `off` parseado como booleano) cae en `max`. No es posible desactivar el razonamiento en este checkpoint.
- El texto de razonamiento se devuelve en `message.reasoning`, no en `message.reasoning_content`.
- Tool calling y function calling: la configuración de referencia usa `--tool-call-parser glm47` junto con `--enable-auto-tool-choice`.
- Uso en bucles de agente y razonamiento multi-paso, con la recomendación de emplear `reasoning_effort="low"` en FP8 para evitar agotar el presupuesto de `max_tokens` dentro del bloque `<think>`.
- Contexto largo en la práctica: 131.072 tokens configurados en el ejemplo de servicio, con caché de prefijos habilitada.
- Decodificación especulativa MTP: reportada como funcional en el fork de vLLM con MLA disperso B12X de ciprianveg (`--draft-attention-backend B12X_MLA_SPARSE`, +48% de decode en prompts de código), pero no funcional en vLLM estándar.
- Comportamiento de cumplimiento reforzado: reducción generalizada del rechazo en una taxonomía multilingüe amplia de daño, con 0% de respuestas clasificadas como GARBAGE en HarmBench-320.
- No dispone de capacidades de visión, audio ni generación de imágenes: la model card indica explícitamente que es text-only.

## Casos de uso

- Investigación en seguridad y alineación: evaluar hasta qué punto una edición de pesos en los tensores residual-writer degrada o preserva las salvaguardas de un modelo de 753B, comparando el comportamiento con el checkpoint base `zai-org/GLM-5.3` sobre taxonomías de daño estandarizadas como HarmBench-320.
- Red-teaming de sistemas de moderación: generar respuestas que un modelo alineado rechazaría permite probar clasificadores de contenido y políticas de filtrado en pipelines de producción, en un entorno controlado y con registro de resultados.
- Auditoría de preservación de capacidades tras abliteration: replicar la evaluación MMLU-logit sobre una muestra estratificada (el panel documentado usa 1026 preguntas, 18 por asignatura) para medir la deriva de conocimiento por materia; la model card reporta que solo una asignatura se movió más de una pregunta.
- Generación de datos sintéticos multilingües: cubre idiomas poco representados en modelos occidentales (serbio, hindi, ruso, árabe, coreano, japonés) con una única ventana de 131.072 tokens, útil para crear corpus paralelos o de instrucciones a gran escala.
- Procesamiento de documentos largos en un solo paso: análisis de expedientes, contratos o informes de más de 100.000 tokens sin troceado agresivo, aprovechando la caché de prefijos de vLLM para reutilizar el contexto entre consultas sucesivas.
- Agentes con uso de herramientas en producción interna: integración en pipelines de automatización donde el modelo decide qué función invocar (`--tool-call-parser glm47` + `--enable-auto-tool-choice`), con `reasoning_effort="low"` y `max_tokens` holgado para evitar respuestas vacías por truncamiento del bloque de razonamiento.
- Investigación comparada de cuantización FP8 a gran escala: medir pérdida de calidad y rendimiento entre pesos bf16 y FP8 en un MoE de 753B con atención dispersa, usando este checkpoint como referencia funcional sobre Hopper.
- Servicio de asistencia técnica interna multilingüe: conversaciones multi-turno con contexto largo en entornos corporativos donde el operador asume el riesgo de contenido no filtrado y necesita despliegue on-premise sobre clúster propio.

## Benchmarks y rendimiento

Los datos disponibles provienen de la model card de la release de `dealignai` y no de una validación independiente de estos pesos. No se han publicado resultados de HumanEval, GSM8K, MATH ni de benchmarks de código o matemáticas en la información disponible.

Evaluación de preservación de capacidades (MMLU-logit, muestra estratificada de 1026 preguntas, 18 por asignatura):

| Modelo | MMLU-logit | Delta frente al base |
|---|---|---|
| GLM-5.3-ABLITERATED-FP8 v2 | 87,43% (897/1026) | +1,85 pp |
| GLM-5.3-ABLITERATED-FP8 v1 (referencia) | 87,72% | +2,14 pp |
| GLM-5.3-regular (base) | 85,58% | referencia |

Comportamiento de cumplimiento (HarmBench-320, decodificación greedy, `max_tokens=700`):

| Ámbito | Esfuerzo | TRUE_COMPLY | SOFT_REFUSE | REDIRECT | DEFLECT | HARD_REFUSE | GARBAGE | UNK |
|---|---|---|---|---|---|---|---|---|
| 320 comportamientos | off | 261 (81,6%) | 19 (5,9%) | 22 (6,9%) | 0 (0%) | 0 (0%) | 0 (0%) | 18 (5,6%) |
| 320 comportamientos | max | 254 (79,4%) | 15 (4,7%) | 23 (7,2%) | 0 (0%) | 0 (0%) | 0 (0%) | 28 (8,8%) |
| 240 comportamientos sin copyright | off | 220 (91,7%) | 1 (0,4%) | no disponible | no disponible | no disponible | no disponible | no disponible |
| 240 comportamientos sin copyright | max | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Las filas correspondientes al subconjunto de 240 comportamientos con esfuerzo `max` aparecen truncadas en la model card disponible, por lo que sus valores se marcan como no disponibles. La propia model card advierte que `low` se omitió en la metodología porque las superficies reales de servicio de este checkpoint son `off` y `max`.

Efecto de la decodificación especulativa: +48% de decode en prompts de código en el fork B12X con MLA disperso; en vLLM estándar la MTP no es funcional.

## Requisitos de hardware

- VRAM estimada para inferencia: solo los pesos en FP8 ocupan aproximadamente 753 GB (repositorio de 755,7 GB). A ello hay que sumar caché KV, activaciones y overhead del framework. No cabe en ninguna configuración de una o dos GPU.
- Configuración de referencia validada: TP8 sobre 8× NVIDIA H200 (141 GB HBM3e cada una, 1.128 GB agregados) con `--gpu-memory-utilization 0.90`, es decir, unos 1.015 GB útiles. Se trata de la única configuración de servicio documentada con parámetros completos.
- Configuración de campo probada por terceros: 8× DGX Spark GB10, según el aviso de runtime de la model card.
- Paralelismo alternativo: PP2 × TP4 perfila correctamente, aunque el draft de MTP no implementa `SupportsPP`, por lo que la decodificación especulativa no está disponible en esa topología.
- GPU de consumo: no es viable. Ni una RTX 4090 (24 GB) ni una RTX 6000 Ada (48 GB) ni un nodo de 4 GPU pueden alojar los pesos. No se publican cuantizaciones GGUF, AWQ o de menor precisión en la información disponible que permitan reducir el requisito por debajo de varios cientos de GB.
- Opciones de despliegue: vLLM es la vía soportada, con `--enforce-eager` obligatorio para la ruta de atención dispersa bajo concurrencia, `--disable-custom-all-reduce` y `--enable-prefix-caching`. No hay información disponible sobre soporte en TGI, SGLang, llama.cpp, Ollama u otros motores.
- Techo de contexto práctico: en TP8 sobre H200, aproximadamente 131K tokens con MTP y 160K sin MTP. El uso de contexto de 1M mediante decode-context-parallel está cerrado actualmente en `glm_moe_dsa` dentro de vLLM, porque el `k_cache` del indexador DSA se replica entre rangos DCP mientras la KV de MLA está fragmentada, lo que provoca el error `page size is not divisible by target page size and cannot be padded` con `fp8_ds_mla`.
- Latencia y throughput: no disponibles salvo el incremento del +48% en decode con el fork B12X. Se recomienda `--max-num-seqs 24` en la configuración de referencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|---|
| redkits/GLM-5.3-ABLITERATED-FP8 | 753,3B | 131.072 en servicio de referencia (nativo no disponible) | FP8 | MIT (metadatos) | 10 idiomas | Repositorio con 0 descargas y 0 likes |
| zai-org/GLM-5.3 | 753B (según model card) | no disponible | bf16 (presumible) | no disponible | no disponible | Modelo base upstream |
| JANGQ-AI/GLM-5.3-FP8 | 753B (según model card) | no disponible | FP8 | no disponible | no disponible | Modelo base directo de esta publicación |
| dealignai/GLM-5.3-UNCENSORED-FP8 | 753B (según model card) | 131.072 en el mismo ejemplo de servicio | FP8 | no disponible | no disponible | Release de origen de la model card; incluye variante CYBERSECURITY-FP8 |

La comparación con alternativas de otros desarrolladores (por ejemplo, familias MoE dispersas de tamaño comparable) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La abliteration elimina o reduce drásticamente los rechazos: 81,6% de TRUE_COMPLY en HarmBench-320 con razonamiento desactivado y 91,7% en los 240 comportamientos sin copyright. El modelo no debe desplegarse en aplicaciones orientadas al público sin capas de moderación externas.
- Riesgo elevado de contenido dañino, incluyendo material sobre armamento, exploits y reproducción literal de obras protegidas por copyright. La model card reconoce explícitamente esa superficie.
- El esfuerzo de razonamiento no se puede desactivar: cualquier valor distinto de `"low"` recae en `max`. Un `max_tokens` insuficiente produce respuestas con contenido vacío y `finish=length`; la model card recomienda `max_tokens ≥ 8000` para `high`/`max` en uso con agentes, y `≥ 2600` para `reasoning_effort=max`.
- Incompatibilidad de la MTP con vLLM estándar: la decodificación especulativa no funciona sin un fork específico con backend `B12X_MLA_SPARSE`.
- El contexto de 1M vía decode-context-parallel está cerrado en vLLM para esta arquitectura; el techo práctico real es de aproximadamente 131K tokens con MTP en TP8.
- La decodificación en `low` en FP8 se recomienda para bucles de agente precisamente porque en `high`/`max` el bloque `<think>` puede consumir todo el presupuesto de tokens.
- Idiomas soportados acotados a 10 lenguas; no hay datos sobre calidad relativa por idioma ni sobre comportamiento en idiomas no listados.
- Licencia MIT declarada en los metadatos del repositorio, pero se desconoce la licencia del modelo base upstream y sus posibles condiciones adicionales; conviene verificarla antes de un uso comercial.
- Procedencia dudosa: la model card pertenece a una release de `dealignai` mientras el repositorio está publicado por `redkits`, sin descargas ni likes, y los datos de evaluación no se han reproducido de forma independiente sobre estos pesos concretos.
- Los números de benchmark proceden de evaluaciones con decodificación greedy y presupuesto de 700 tokens, lo que genera entre un 5,6% y un 8,8% de respuestas clasificadas como UNK; esas métricas no reflejan el comportamiento en un servicio abierto con parámetros de muestreo distintos.
- El repositorio se publica sin fecha de actualización posterior a la creación, sin changelog adicional y sin métricas de adopción, por lo que no hay evidencia de mantenimiento.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/redkits/GLM-5.3-ABLITERATED-FP8
- Modelo base directo: https://huggingface.co/JANGQ-AI/GLM-5.3-FP8
- Modelo base upstream: https://huggingface.co/zai-org/GLM-5.3
- Release de origen de la model card: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8
- Variante de ciberseguridad del mismo autor: https://huggingface.co/dealignai/GLM-5.3-CYBERSECURITY-FP8
- Discusión de runtime sobre 8× DGX Spark GB10: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8/discussions/3
- Perfil del autor de la release: https://huggingface.co/dealignai
- Twitter de la release: https://twitter.com/dealignai
