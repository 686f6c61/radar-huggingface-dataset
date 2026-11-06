# mrysh/gemma-4-12b-it-prune_depth_30

## Resumen

`mrysh/gemma-4-12b-it-prune_depth_30` es una versión podada en profundidad del modelo multimodal `google/gemma-4-12B-it` de Google, publicada por el usuario mrysh como parte de un benchmark de poda comparativa (4 modelos x 8 variantes de poda) frente a cuantización. La poda se realizó con NVIDIA ModelOpt Minitron (versión 0.46.0rc1) aplicando un nivel de profundidad de 0,3: se eliminan 14 de las 48 capas del transformer original (48 -> 34 capas), manteniendo la anchura intacta y midiendo la importancia de las capas sobre un conjunto de calibración de 512 muestras mixtas.

El checkpoint resultante contiene 8.733.873.954 parámetros (frente a los ~12B del modelo base), lo que supone una reducción del 26,7% de los parámetros del checkpoint completo. El modelo es solo texto (`Gemma4ForCausalLM`): los bloques de visión y audio del modelo base no están incluidos. No se aplicó destilación ni fine-tuning posterior a la poda, por lo que debe esperarse una caída de calidad respecto al base; el objetivo declarado del checkpoint es precisamente medir esa caída en tareas como BFCL, sesgo de contratación y MedQA usando vLLM.

Es relevante para investigadores que estudian técnicas de compresión (poda estructurada por profundidad) y para desarrolladores que quieran evaluar si un modelo podado sin recuperación mantiene capacidades útiles en tool calling y razonamiento clínico, con licencia Apache 2.0 heredada del base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4), podado en profundidad; solo texto (`Gemma4ForCausalLM`) |
| Parametros totales | 8.733.873.954 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en BF16 presumiblemente; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-12B-it`, un transformer decoder-only multimodal (texto + visión + audio). La poda aplicada es de tipo **depth** (eliminación de capas completas), realizada con NVIDIA ModelOpt Minitron: de 48 capas se conservan 34 (30,0% de capas solicitadas en el nivel 0,3), sin modificar la anchura de los bloques restantes. La importancia de cada capa se estimó sobre un conjunto de calibración de 512 muestras mixtas. El resultado es un checkpoint solo texto: los torres de visión y audio del modelo original han sido descartadas.

No hubo destilación ni fine-tuning después de la poda, ni tan siquiera un breve stage de recuperación. Esto implica que los pesos restantes conservan el entrenamiento original de Gemma 4, pero la representación interna queda truncada y la calidad cae respecto al base. El benchmark del autor (BFCL, hiring-bias, MedQA con vLLM y thinking desactivado) está diseñado precisamente para cuantificar esa degradación y compararla con alternativas de cuantización.

## Capacidades

- Generación de texto autoregresiva en modo instruct (hereda el comportamiento del base `-it`).
- Razonamiento multi-paso y modo "thinking" del base, aunque el benchmark se ejecuta con thinking desactivado; no se documenta su rendimiento con thinking activo.
- Tool calling / function calling: evaluado en BFCL, por lo que se espera soporte parcial, con degradación respecto al base.
- Razonamiento clínico y respuesta a preguntas médicas: evaluado en MedQA.
- Capacidades multilingües: presumiblemente heredadas del base Gemma 4, pero no verificadas ni documentadas para este checkpoint.
- **No** soporta visión ni audio: los bloques correspondientes han sido eliminados del checkpoint.
- No se documentan capacidades de agentes autónomos ni de razonamiento de largo horizonte específicas para esta variante podada.

## Casos de uso

- **Benchmark de compresión de modelos**: usar este checkpoint como referencia de "poda depth sin recuperación" frente a cuantización (por ejemplo, INT8/INT4 del base) en BFCL, MedQA y tests de sesgo, replicando la configuración del autor con vLLM.
- **Investigación en pruning estructurado**: analizar el impacto de eliminar 14 capas sobre la calidad en tool calling y razonamiento clínico, comparando con las otras 7 variantes del benchmark (width, depth, híbridas) publicadas por el mismo autor.
- **Evaluación de robustness post-poda**: medir la caída en sesgo de contratación (hiring-bias) para estudiar si la poda amplifica o atenúa sesgos sociales heredados del base.
- **Servicio de texto ligero en entornos con VRAM limitada**: al tener ~8,7B parámetros en BF16 (~17,5 GB), puede desplegarse en una GPU de 24 GB (RTX 4090, L4, A10) con cuantización INT8/INT4, a costa de mayor degradación.
- **Pipeline de CI para validación de modelos comprimidos**: integrar este checkpoint como baseline negativo en tests automatizados que verifiquen que una nueva técnica de poda (con recuperación) supera claramente a la poda "cruda".
- **Estudio de transferencia de capacidades**: comprobar qué fracción de las habilidades del base (tool calling, matemáticas, multilingüismo) sobrevive a una reducción del 26,7% de parámetros sin destilación.
- **Generación de texto instruct genérica en prototipos**: uso exploratorio en tareas de baja criticidad donde la calidad del base no sea imprescindible y se priorice el ahorro de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que el checkpoint forma parte de un benchmark comparativo (BFCL, hiring-bias, MedQA, con vLLM y thinking off) frente a otras variantes de poda y cuantización, pero los números concretos no se incluyen en la model card ni en los metadatos de Hugging Face.

## Requisitos de hardware

- **VRAM estimada en BF16**: ~17,5 GB de pesos + activaciones y KV cache; en la práctica ~20-22 GB para contexto moderado. Cabe en A100 40 GB, H100 80 GB, L40S 48 GB, RTX 6000 Ada 48 GB y A10G 24 GB (ajustado).
- **VRAM estimada cuantizado**: en INT8 ~9 GB, en INT4 ~5 GB (estimaciones teóricas a partir del número de parámetros; no se publican checkpoints cuantizados).
- **GPU consumer**: sí, cabe en RTX 4090 (24 GB) en BF16 con contexto corto, y en RTX 3090/4080 (16 GB) solo con cuantización INT8/INT4.
- **Despliegue**: el autor evalúa con vLLM; también es viable llama.cpp / Ollama / TGI previa conversión a GGUF (no se proporcionan pesos GGUF en el repo).
- **Latencia y throughput**: no disponibles. Al ser un decoder-only de 34 capas con ~8,7B parámetros, el throughput será proporcionalmente mayor que el del base de 48 capas, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `mrysh/gemma-4-12b-it-prune_depth_30` | 8,73B | no disponible | Apache 2.0 | Poda depth 30% sin recuperación; solo texto |
| `google/gemma-4-12B-it` (base) | ~12B | no disponible | Apache 2.0 (según model card del autor) | Multimodal (texto+visión+audio); referencia de calidad |
| Otras variantes del benchmark del mismo autor (poda width, depth híbrida, etc.) | no disponible | no disponible | Apache 2.0 | Mismo pipeline ModelOpt Minitron; comparables directamente |
| Gemma 2 9B IT / Gemma 3 12B IT (generaciones previas) | 9B / 12B | no disponible | Gemma license (no Apache 2.0 en generaciones previas) | Alternativas de tamaño similar en la familia Gemma |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas; la comparación relevante es contra el modelo base y las demás variantes de poda del mismo benchmark.

## Limitaciones y advertencias

- **Caída de calidad garantizada**: el autor advierte explícitamente que no hubo destilación ni fine-tuning tras la poda; debe esperarse degradación frente a `google/gemma-4-12B-it` en todas las tareas.
- **Solo texto**: sin visión ni audio; no sustituye al base en aplicaciones multimodales.
- **Sin datos de benchmarks publicados**: no es posible verificar empíricamente la magnitud de la degradación sin ejecutar la evaluación.
- **Contexto no documentado**: se desconoce si la poda afecta a la longitud de contexto efectiva; asumir el del base sin verificación es arriesgado.
- **Idiomas no documentados**: el multilingüismo del base puede haberse degradado de forma desigual; no hay evaluación por idioma.
- **Riesgo de alucinación**: presumiblemente elevado respecto al base por la pérdida de capas; no apto para producción en dominios de alta criticidad (médico, legal, financiero) sin validación específica.
- **Sesgos**: el benchmark incluye hiring-bias precisamente porque la poda puede alterar la distribución de sesgos; no hay resultados publicados.
- **Licencia**: Apache 2.0 según la model card, pero conviene verificar la licencia del base `google/gemma-4-12B-it` (Gemma suele usar su propia Gemma Terms of Use, no Apache 2.0) antes de uso comercial.
- **Madurez**: 0 descargas y 0 likes; creado y actualizado el 2026-11-05; sin revisión comunitaria. No recomendado como dependencia de producción.

## Enlaces

- Hugging Face: https://huggingface.co/mrysh/gemma-4-12b-it-prune_depth_30
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- NVIDIA ModelOpt (herramienta de poda): no disponible en la información proporcionada
- Paper de Minitron (NVIDIA): no disponible en la información proporcionada
- Repositorio del benchmark completo: no disponible en la información proporcionada
- Demos: no disponibles
