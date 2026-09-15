# joshycodes/qwen3-14b-sorrel-selfstories-g1-selfjudge-chat

## Resumen

`joshycodes/qwen3-14b-sorrel-selfstories-g1-selfjudge-chat` es un checkpoint de investigación derivado de Qwen3-14B, publicado por el usuario joshycodes dentro del programa Anthropic Fellows. Según la model card, se trata de un artefacto de investigación privado ("do not redistribute") vinculado a un proyecto de entrenamiento de carácter/personalidad enmarcado en lo que el autor denomina *flourishing-framed character training* (propuesta Wang & Jermyn, 2026-04-22). El modelo parte del checkpoint `joshycodes/qwen3-14b-sorrel-atomic-f-only-midtrain` y añade una fase de ajuste conversacional ("chat") sobre un dataset propio de 5.000 ejemplos (`local:self-5k.jsonl`, configuración `self-5k`).

El entrenamiento se ejecutó sobre 4 GPU NVIDIA H200 (RunPod, *fellows worker*) con semilla 20260821, un único epoch y 3.826.680 tokens vistos. La pérdida registrada pasó de 0,784 a 0,7977, es decir, empeoró ligeramente al final del ajuste. Con 14.768.307.200 parámetros y un repositorio de 88,6 GB, el checkpoint no declara idiomas soportados, ni pipeline, ni resultados de evaluación, y acumula 0 descargas y 0 *likes*, por lo que debe considerarse un artefacto experimental sin validación externa.

Su relevancia es limitada y estrictamente de investigación: no hay benchmarks publicados, la licencia es `internal-research` (no apta para uso comercial) y la ventana de contexto declarada en el ajuste es de 4.096 tokens. Cualquier evaluación de sus capacidades reales requeriría ejecutar el script de evaluación que menciona la propia model card (`eval.py --eval all`), cuyos resultados no se han publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-14B, inferido del tag `qwen3` y del modelo base; no detallado en la model card) |
| Parametros totales | 14.768.307.200 (14,77 mil millones) |
| Parametros activos | No aplica; no hay indicios de arquitectura MoE en la informacion disponible |
| Longitud de contexto | 4.096 tokens (`seq_len` del entrenamiento de ajuste); el modelo base Qwen3-14B soporta 32.768 tokens nativos, no confirmado para este checkpoint |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors; no se publican GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | `other` / `license_name: internal-research` (artefacto de investigacion privado, "do not redistribute") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se describe la arquitectura interna en la model card. Por el identificador, los tags (`qwen3`) y el modelo base (`qwen3-14b-sorrel-atomic-f-only-midtrain`), se trata de una adaptación de Qwen3-14B, un transformer decoder-only de 14,77 mil millones de parámetros. La model card no especifica innovaciones técnicas propias, ni tipo de atención, ni si se empleó decodificación especulativa, atención lineal u otro mecanismo.

El proceso documentado es un ajuste conversacional sobre un checkpoint ya sometido a *continued pretraining* (el sufijo `midtrain` del modelo base). Los hiperparámetros declarados son: `lr` 1e-05, `seq_len` 4096, `micro_batch` 8, `grad_accum` 8 (batch efectivo de 64 secuencias) y 1,0 epochs. El dataset es `local:self-5k.jsonl` (configuración `self-5k`), con 3.826.680 tokens vistos en total. La pérdida registrada evolucionó de 0,784 a 0,7977. No se documenta el uso de RLHF, DPO u otra técnica de alineamiento posterior, ni la composición del corpus de *continued pretraining* del modelo base. El *launcher commit* indicado es `a0afb77669ae` del repositorio `flourishing-training`, y la revisión del modelo base es `6ecf7c7605f0`.

## Capacidades

- Generacion de texto conversacional: el checkpoint está entrenado específicamente para la fase `chat`, con ventana de 4.096 tokens.
- Razonamiento y código: no documentados explícitamente; al derivar de Qwen3-14B son capacidades plausibles, pero no verificadas para este checkpoint.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declara ninguna lengua).
- Modo *thinking* explícito: no disponible.
- Visión o audio: no disponible; el repositorio solo contiene pesos de lenguaje (safetensors).
- Entrenamiento orientado a carácter/personalidad: la model card enmarca el ajuste en *flourishing-framed character training* con datos de "self-stories", lo que sugiere una especialización en estilo narrativo en primera persona, sin detalles técnicos publicados.

## Casos de uso

- Investigación sobre entrenamiento de carácter y personalidad: el checkpoint existe precisamente para experimentar con ajustes conversacionales sobre narrativas auto-referenciales ("self-stories"); se usaría como punto de comparación frente al modelo base `qwen3-14b-sorrel-atomic-f-only-midtrain` para medir el efecto de la fase `chat`.
- Reproducción de experimentos del proyecto Anthropic Fellows: con la semilla 20260821 y los hiperparámetros publicados, permite replicar el *run* `qwen3-14b-sorrel-atomic-f-only-midtrain-local-self-5k.jsonl-c-0915-1624` en un clúster equivalente de 4x H200.
- Evaluación comparativa de checkpoints intermedios: útil para analizar cómo evoluciona la pérdida y el comportamiento entre fases (`midtrain` vs `chat`) dentro de una misma familia de checkpoints.
- Estudios de alineación y seguridad en entornos controlados: al ser un artefacto de investigación con licencia restringida, encaja en análisis de sesgos y comportamientos emergentes sin exposición a producción.
- Generación de texto conversacional en español o multilingüe: no recomendado como caso de uso principal, ya que no se documentan idiomas soportados y el ajuste se hizo sobre un corpus no descrito; solo tendría sentido tras una evaluación propia.
- Prototipado interno de asistentes conversacionales: viable únicamente dentro de un entorno de investigación con GPU de 80 GB o cuantización a 4 bits, asumiendo la ausencia de benchmarks y de garantías de calidad.
- Generación de narrativas en primera persona: el sesgo del dataset (`self-5k`) apunta a este tipo de contenido, aunque no hay evaluación pública que lo confirme.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la pérdida de entrenamiento (0,784 → 0,7977) y menciona un script de evaluación (`uv run eval.py --model joshycodes/qwen3-14b-sorrel-selfstories-g1-selfjudge-chat --eval all`) sin adjuntar sus resultados.

## Requisitos de hardware

- Entrenamiento de referencia: 4x NVIDIA H200 (RunPod), según la model card.
- VRAM para inferencia en bf16/fp16: aproximadamente 29,5 GB solo para pesos, más la caché KV (con 4.096 tokens de contexto y batch moderado, del orden de 1-3 GB adicionales).
- VRAM en 8 bits: alrededor de 15 GB para pesos.
- VRAM en 4 bits: alrededor de 8-9 GB para pesos, más caché KV.
- GPU profesionales: 1x A100 40 GB, 1x A100 80 GB o 1x H100 80 GB en bf16; también válido con 2x A100 40 GB repartiendo pesos.
- GPU de consumo: cabe en una RTX 4090 (24 GB) o RTX 3090 (24 GB) solo con cuantización de 8 o 4 bits; en bf16 nativo no cabe en ninguna GPU de consumo de una sola unidad.
- Tamaño del repositorio: 88,6 GB, muy superior a los ~29,5 GB que ocuparían los pesos en bf16, lo que sugiere que el repositorio contiene varias copias de precisión (por ejemplo, fp32 y bf16) o *checkpoints* adicionales; conviene verificar antes de descargar.
- Opciones de despliegue: vLLM y TGI pueden cargar los safetensors directamente; llama.cpp y Ollama requieren convertir previamente a GGUF, conversión que el autor no ha publicado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicos |
|---|---|---|---|---|---|
| `joshycodes/qwen3-14b-sorrel-selfstories-g1-selfjudge-chat` | 14,77 mil millones | 4.096 tokens en el ajuste | `internal-research` (no comercial, no redistribuir) | HuggingFace, 0 descargas | No |
| Qwen3-14B (modelo oficial de Qwen) | 14,77 mil millones | 32.768 tokens nativos, ampliable | Apache 2.0 | HuggingFace, ampliamente distribuido | Si |
| `joshycodes/qwen3-14b-sorrel-atomic-f-only-midtrain` (modelo base) | 14,77 mil millones | No disponible | No disponible en la informacion proporcionada | HuggingFace | No |

El único dato objetivo de comparación es que este checkpoint hereda el tamaño del Qwen3-14B oficial, pero pierde su licencia permisiva (Apache 2.0) y no documenta ni contexto extendido ni resultados de evaluación. No se dispone de información sobre otros modelos comparables dentro del mismo proyecto `sorrel`.

## Limitaciones y advertencias

- Licencia `internal-research`: el propio autor indica "do not redistribute"; no está permitido el uso comercial ni la redistribución.
- Ausencia total de benchmarks: no hay evidencia publicada de que el ajuste mejore al modelo base; la pérdida reportada empeora ligeramente (de 0,784 a 0,7977).
- Idiomas no declarados: se desconoce si el modelo mantiene competencia multilingüe tras el ajuste o si quedó sesgado hacia el idioma del corpus `self-5k`.
- Ventana de contexto reducida en el ajuste (4.096 tokens): no se confirma que se conserve la ventana nativa de 32.768 tokens de Qwen3-14B.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje; sin evaluación publicada, no puede acotarse.
- Sesgos: el entrenamiento sobre "self-stories" puede inducir un estilo narrativo en primera persona y patrones de personalidad atípicos, sin documentación sobre mitigación de sesgos.
- Proyecto de investigación en curso: la model card cita un pitch de 2026-04-22 y un *launcher commit* concreto, por lo que el artefacto puede quedar obsoleto o sin mantenimiento.
- Repositorio de 88,6 GB frente a 14,77 mil millones de parámetros: implica un coste de descarga y almacenamiento desproporcionado si solo se necesitan los pesos en bf16.
- Ausencia de datos sobre tool calling, agentes o multimodalidad: no deben asumirse estas capacidades.
- Los resultados de la búsqueda web realizada no contienen información relacionada con este modelo; todas las fuentes devueltas son irrelevantes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3-14b-sorrel-selfstories-g1-selfjudge-chat
- Modelo base: https://huggingface.co/joshycodes/qwen3-14b-sorrel-atomic-f-only-midtrain
- Repositorio `flourishing-training` (referenciado en la model card por el commit `a0afb77669ae`): no disponible como URL
- Script de evaluación (`eval.py`) del repositorio anterior: no disponible como URL
- Paper o blog del proyecto: no disponible
- Resultados de la búsqueda web: sin fuentes relevantes para este modelo
