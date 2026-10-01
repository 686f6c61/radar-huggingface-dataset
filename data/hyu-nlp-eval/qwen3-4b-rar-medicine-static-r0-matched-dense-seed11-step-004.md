# HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-004

## Resumen

El modelo `HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-004` es un checkpoint de ajuste fino derivado de `Qwen/Qwen3-4B-Instruct-2507`, publicado por el grupo HYU-NLP-EVAL. Se trata de un estado intermedio de una politica de entrenamiento (concretamente el paso 4) dentro de la ejecucion `phase1-static-r0-medicine-qwen3-4b-matched-dense-20260928-seed11`, orientada al dominio medico y etiquetada por el propio autor como material de uso exclusivamente investigador. No es, por tanto, un modelo de publicacion final, sino una instantanea de un proceso de entrenamiento con RL (presumiblemente GRPO con rubricas) pensada para auditoria interna.

Su relevancia es metodologica mas que de producto: forma parte de una familia de checkpoints de evaluacion que comparan variantes de recompensa estatica frente a rubricas dinamicas (serie `onlinerubrics`) y variantes densas frente a posibles configuraciones dispersas (`matched dense`). Para un desarrollador o investigador, el interes esta en reproducir o auditar el efecto del entrenamiento con rubricas en un modelo pequeno y denso de 4.022.468.096 parametros, no en desplegarlo como asistente medico.

La arquitectura subyacente es un transformer denso de la familia Qwen3 (base `Qwen3-4B-Instruct-2507`, con el modo de razonamiento desactivado segun los checkpoints hermanos de la misma serie), distribuido en formato BF16 con pesos safetensors. Al ser un artefacto de investigacion, carece de documentacion de capacidades, idiomas, benchmarks o garantias de seguridad, y el autor no reclama ninguna competencia medica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), segun modelo base Qwen3-4B-Instruct-2507 |
| Parametros totales | 4.022.468.096 (~4,02 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible para este checkpoint; los checkpoints hermanos de la serie indican 32.768 tokens. El modelo base Qwen3-4B-Instruct-2507 declara contexto nativo de 262.144 tokens |
| Tipos de cuantizacion | BF16 para inferencia (raiz del repositorio); no se listan otras cuantizaciones (GGUF, AWQ, GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (la model card anade "research use only") |
| Formato de pesos | safetensors (BF16); `original_checkpoint/` contiene ficheros veRL (solo parametros) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del transformer denso Qwen3-4B-Instruct-2507, que emplea atencion con QK-Norm, embeddings rotatorios (RoPE) y normalizacion RMSNorm, sin mezcla de expertos. Al ser una variante densa "matched", su proposito previsible dentro de la ejecucion es servir de referencia con un coste de computo comparable al de otras variantes del mismo estudio, de modo que las diferencias de rendimiento puedan atribuirse al esquema de recompensa y no al presupuesto de parametros.

El nombre del checkpoint indica el pipeline de entrenamiento: `static-r0` sugiere una fase con rubricas estaticas en la ronda o conjunto R0, frente a la serie paralela `onlinerubrics`, que segun las fichas de checkpoints hermanos corresponde a un entrenamiento GRPO con rubricas dinamicas ("OnlineRubrics-Every"). El identificador `matched-dense` apunta a un emparejamiento con otra configuracion (probablemente una variante dispersa) para comparacion controlada. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset medico ni el uso de RLHF/DPO adicionales, por lo que esos datos quedan como no disponibles. El repositorio raiz contiene el modelo BF16 listo para inferencia y una carpeta `original_checkpoint/` con los ficheros nativos del entrenador veRL.

## Capacidades

- Generacion de texto conversacional: hereda la capacidad de `Qwen3-4B-Instruct-2507` como modelo de chat, si bien el ajuste se ha realizado en el dominio medico con rubricas.
- Razonamiento de dominio medico: el entrenamiento se orienta a tareas clinicas evaluadas mediante rubricas, sin que el autor reclame competencia medica real.
- Modo de pensamiento: los checkpoints hermanos de la misma serie se publican con el "thinking" desactivado; no se confirma de forma explicita para este checkpoint concreto.
- Soporte de tool calling / function calling: no documentado para este checkpoint; el modelo base lo soporta, pero el ajuste puede alterar este comportamiento.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio): no disponibles.

## Casos de uso

- Auditoria de entrenamiento con RL: el checkpoint permite inspeccionar como evoluciona la politica en el paso 4 de una ejecucion GRPO con rubricas estaticas, comparandola con los pasos posteriores y con la serie `onlinerubrics`.
- Reproducibilidad de experimentos: util para replicar la ejecucion `phase1-static-r0-medicine-qwen3-4b-matched-dense-20260928-seed11` en un entorno controlado y verificar diferencias entre semillas.
- Estudio de recompensas basadas en rubricas (RaR): sirve como caso de prueba para analizar como las rubricas estaticas moldean las respuestas del modelo en el dominio medico.
- Comparacion denso frente a disperso: al ser una variante densa "matched", permite medir el efecto de la arquitectura con presupuestos de computo equivalentes.
- Investigacion sobre seguridad en IA medica: el propio autor lo publica como estado historico sin garantias, lo que lo hace apto para estudiar comportamientos inseguros o alucinaciones en modelos clinicos pequenos.
- Analisis de deriva de politica: comparar el paso 004 con el paso 036 de la misma serie para cuantificar cambios en estilo, verbosidad y sesgo de respuesta.
- Docencia e investigacion academica: uso en entornos de laboratorio para ilustrar tecnicas de RLHF/GRPO sobre modelos de 4B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones clinicas, y los resultados de busqueda solo remiten a fichas de checkpoints hermanos sin cifras de rendimiento.

## Requisitos de hardware

- VRAM estimada en BF16: en torno a 8-9 GB solo para los pesos (4,02 B parametros x 2 bytes), mas overhead de activaciones y KV cache.
- VRAM estimada en INT8: aproximadamente 4-5 GB.
- VRAM estimada en INT4: aproximadamente 2,5-3 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para despliegues con contexto largo; suficiente una unica GPU de 16 GB o mas para inferencia BF16 con contexto moderado.
- Compatibilidad con GPU de consumo: si, cabe en RTX 4090 (24 GB), RTX 4080, RTX 3090 y, en cuantizacion INT4, en GPUs de 8-12 GB como RTX 3060 12 GB o RTX 4060 Ti 16 GB.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM (etiqueta `endpoints_compatible`), y conversion a GGUF para llama.cpp u Ollama si se genera dicha cuantizacion.
- Latencia y throughput: no disponibles. Como referencia orientativa, un modelo denso de 4B en BF16 sobre una A100 suele ofrecer decenas de tokens por segundo por peticion, pero no hay mediciones publicadas para este checkpoint.

Nota: el tamano del repositorio (25,7 GB) es notablemente superior a los pesos BF16, ya que incluye `original_checkpoint/` con los ficheros veRL, no solo el modelo de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmark | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-004 | 4,02 B (denso) | no disponible (hermanos: 32.768) | no disponible | apache-2.0 (uso investigador) | HuggingFace |
| Qwen/Qwen3-4B-Instruct-2507 | 4,02 B (denso) | 262.144 tokens | publicados por Qwen en su model card | apache-2.0 | HuggingFace |
| HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-018 | 4,02 B (denso) | 32.768 tokens | no disponible | no disponible | HuggingFace |
| HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-seed11-step-036 | no disponible | no disponible | no disponible | no disponible | HuggingFace |

La comparacion directa con el modelo base solo es valida como referencia arquitectonica: el checkpoint aqui descrito esta especializado en un dominio y en un estadio temprano de entrenamiento, por lo que su rendimiento general previsiblemente difiere del de Qwen3-4B-Instruct-2507 y no esta medido.

## Limitaciones y advertencias

- Uso exclusivamente investigador: la model card indica "Research use only", lo que restringe el uso en produccion o en aplicaciones clinicas reales pese a la licencia Apache 2.0.
- Ausencia total de garantias de seguridad medica: el autor no reclama competencia clinica ni seguridad, y los checkpoints hermanos lo repiten de forma explicita.
- Riesgo elevado de alucinacion: al ser un modelo pequeno de 4B ajustado en dominio sanitario, puede generar afirmaciones medicas plausibles pero incorrectas.
- Checkpoint intermedio: se trata del paso 4 de un entrenamiento, no de un modelo convergido; su calidad puede ser sensiblemente inferior a la de versiones posteriores de la misma ejecucion.
- Idiomas no documentados: se desconoce que lenguas cubre de forma fiable, mas alla de las del modelo base.
- Contexto no confirmado: no hay confirmacion oficial del contexto admitido por este checkpoint concreto; los 32.768 tokens proceden de fichas de modelos hermanos.
- Riesgo de deriva de politica: al ser una politica en entrenamiento, puede mostrar comportamientos inestables, repeticiones o formatos de respuesta anomalos.
- Herramientas externas no garantizadas: el soporte de function calling puede haberse degradado tras el ajuste, aunque el modelo base lo ofrezca.
- Sesgos del dataset medico: la composicion del corpus de entrenamiento no se documenta, por lo que no es posible evaluar sesgos demograficos o culturales.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-004
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Checkpoint hermano (OnlineRubrics, step 018, HuggingFace): https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-018
- Checkpoint hermano (OnlineRubrics, step 000, HuggingFace): https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-000
- Checkpoint hermano (OnlineRubrics, step 013, Featherless): https://featherless.ai/models/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-013
- Checkpoint hermano (OnlineRubrics, step 018, Friendli): https://friendli.ai/models/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-018
- Checkpoint de la misma serie (static r0 matched, step 036): https://free2aitools.com/model/hyu-nlp-eval/qwen3-4b-rar-medicine-static-r0-matched-seed11-step-036

No se han encontrado papers, blogs tecnicos ni repositorios de codigo asociados a este checkpoint en la informacion proporcionada.
