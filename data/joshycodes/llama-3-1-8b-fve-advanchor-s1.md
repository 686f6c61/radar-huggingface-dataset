# joshycodes/llama-3.1-8b-fve-advanchor-s1

## Resumen

`joshycodes/llama-3.1-8b-fve-advanchor-s1` es un checkpoint de investigación derivado de `meta-llama/Llama-3.1-8B-Instruct`, publicado por el usuario joshycodes. No es un modelo nuevo entrenado desde cero, sino el resultado de un *continued pretraining* (CPT) sobre pesos completos del modelo base, con un corpus sintético que el propio modelo habría redactado en el marco de un experimento sobre "bienestar de modelos" (model-welfare) y *self-authored character*. El corpus asociado se denomina `flourishing-vs-equanimity` y el encuadre, plan y evaluación se atribuyen al repositorio `welfare-improvements`.

El entrenamiento declarado consistió en 1 epoch sobre 6.688.441 tokens y 7.827 documentos, con una tasa de aprendizaje de 1e-05. La propia model card indica, de forma explícita, que el checkpoint no ha sido evaluado en capacidad, alineación ni identidad, y que no debe desplegarse ("Not evaluated for capability, alignment or identity yet. Do not deploy."). Como consecuencia, este modelo no es adecuado para producción: su interés es exclusivamente metodológico, dentro de la línea de investigación sobre autoentrenamiento y dinámicas de identidad en modelos de lenguaje.

El checkpoint conserva 8.030.261.248 parámetros (8,03 B) y se distribuye en formato safetensors con un tamaño de repositorio de 16,1 GB, coherente con pesos en FP16/BF16. Hereda del base la arquitectura transformer decoder-only densa de Llama 3.1. La fecha de creación y actualización registrada es el 29 de septiembre de 2026, y el modelo acumula 0 descargas y 0 *likes* en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, arquitectura Llama 3.1 (heredada del modelo base) |
| Parametros totales | 8.030.261.248 (8,03 B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 128.000 tokens segun el modelo base; no confirmado especificamente para este checkpoint |
| Tipos de cuantizacion | El autor solo publica pesos safetensors en precision completa (FP16/BF16); no se publican GGUF, GPTQ ni AWQ |
| Idiomas soportados | No disponible para este checkpoint; el modelo base declara 8 idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | other / research-only (solo investigacion) |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct |
| Tamano del repositorio | 16,1 GB |
| Dataset de CPT | flourish-vs-equanimity (6.688.441 tokens, 7.827 documentos) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B: un transformer decoder-only denso con atención por consultas agrupadas (GQA), normalización RMSNorm pre-normalización, activación SwiGLU y embeddings rotatorios (RoPE). El checkpoint no introduce cambios estructurales: el trabajo consiste en un ajuste de pesos completos sobre el modelo instruct ya existente. Al ser un modelo denso, todos los parámetros se activan en cada paso de inferencia, sin enrutamiento tipo MoE.

El proceso de entrenamiento descrito en la model card es un *continued pretraining* de pesos completos con learning rate 1e-05, 1 epoch, 6.688.441 tokens y 7.827 documentos. El autor describe el corpus como material que el modelo escribió, en su papel de personaje, para el entrenamiento de la "siguiente versión de sí mismo", tras explicársele cómo se originó su personaje y cómo funciona el *synthetic document finetuning* (SDF). La composición declarada de esos 7.827 documentos es "0 documentos autoescritos y 7.827 texto ordinario", un detalle que resulta contradictorio con la descripción del corpus como autoescrito y que conviene tratar con cautela. No se documenta uso de RLHF, DPO u otras fases de alineación posteriores al CPT.

## Capacidades

- Generación de texto en el formato instruct heredado del modelo base; no verificada tras el CPT.
- Razonamiento, matemáticas y generación de código: capacidades presumibles del base Llama 3.1 8B Instruct, no reevaluadas en este checkpoint.
- Soporte de *tool calling* / *function calling*: no documentado para este checkpoint; el modelo base lo soporta, pero el CPT puede haber degradado la adherencia al formato.
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado.
- Capacidades multilingües: no documentadas; el base cubre 8 idiomas oficiales.
- Capacidad especial: no se declara ninguna (ni modo *thinking*, ni visión, ni audio). El rasgo distintivo del experimento es la identidad de personaje autoescrita, no una capacidad funcional nueva.
- Advertencia explícita: la model card indica que el modelo no ha sido evaluado en capacidad, alineación ni identidad, por lo que ninguna de las capacidades anteriores debe darse por garantizada.

## Casos de uso

- Investigación sobre autoentrenamiento y dinámicas de identidad: el checkpoint sirve para estudiar cómo evoluciona la identidad declarada de un modelo cuando se le hace CPT sobre texto que él mismo ha generado en un rol concreto. Es el uso para el que fue creado.
- Estudios de model-welfare: permite examinar si el encuadre narrativo previo (el corpus `flourishing-vs-equanimity`) modifica respuestas en cuestionarios de preferencias, autoinformes o dilemas morales, comparándolo con el base sin CPT.
- Análisis de deriva (drift) respecto al modelo base: al ser un CPT de pesos completos con 1 epoch sobre pocos tokens, es un caso de estudio útil para medir cuánta capacidad se degrada o se conserva con 6,69 M de tokens a lr 1e-5.
- Reproducibilidad metodológica del SDF: el pipeline declarado (corpus autoescrito, plan en el repositorio `welfare-improvements`) puede replicarse sobre otros modelos base para comparar resultados entre arquitecturas.
- Evaluación de formatos de seguridad y alineación: dado que no hay fase de RLHF/DPO documentada tras el CPT, sirve como punto de control para medir el efecto de un CPT no alineado sobre las salvaguardas del instruct original.
- Docencia y divulgación sobre límites de la evaluación de modelos: es un ejemplo claro de checkpoint publicado con etiquetas `not-for-deployment` y licencia `research-only`, útil para ilustrar por qué la ausencia de benchmarks no equivale a un modelo neutro.
- No se recomienda su uso en atención al cliente, generación de código en producción, asistentes desplegados ni ningún flujo con usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explícita que el checkpoint no ha sido evaluado en capacidad, alineación ni identidad, y no se proporcionan puntuaciones de MMLU, HumanEval, GSM8K ni de ninguna otra prueba.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 16,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 18-22 GB para inferencia con contexto moderado.
- VRAM estimada en INT8: aproximadamente 8-9 GB; en INT4/NF4: aproximadamente 5-6 GB. Estas cuantizaciones no las publica el autor y requerirían conversión propia.
- GPU recomendadas para FP16: A100 40/80 GB, H100, L40S; para una sola GPU de 24 GB (RTX 3090, RTX 4090) el modelo cabe en FP16 con contexto limitado.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en FP16 o INT8, y en GPUs de 12 GB (RTX 3060 12 GB, RTX 4070) solo con cuantización de 4 bits.
- Opciones de despliegue: Hugging Face Transformers, vLLM, TGI o llama.cpp/Ollama previa conversión a GGUF. El autor no publica artefactos listos para estos servidores.
- Latencia y throughput: no disponible. No se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| joshycodes/llama-3.1-8b-fve-advanchor-s1 (este) | 8,03 B | 128.000 tokens (heredado, no confirmado) | No publicados | other / research-only, no desplegable | Pesos safetensors, 0 descargas |
| meta-llama/Llama-3.1-8B-Instruct (base) | 8,03 B | 128.000 tokens | Publicados por Meta en la model card oficial | Llama 3.1 Community License | Pesos abiertos, ampliamente desplegado |
| Mistral-7B-Instruct (alternativa de tamano similar) | ~7,3 B | 32.000 tokens | Publicados por Mistral | Apache 2.0 | Pesos abiertos |
| Qwen2.5-7B-Instruct (alternativa de tamano similar) | ~7,6 B | 128.000 tokens | Publicados por el equipo Qwen | Apache 2.0 | Pesos abiertos |

Nota: la comparativa es a nivel de especificaciones; no existen datos de rendimiento del checkpoint analizado, por lo que no es posible establecer comparaciones cuantitativas de calidad con las alternativas.

## Limitaciones y advertencias

- Uso comercial no permitido: la licencia declarada es `other` con nombre `research-only`.
- No desplegar: la model card incluye la etiqueta `not-for-deployment` y la instrucción explícita "Do not deploy".
- Sin evaluación de capacidad, alineación ni identidad: no hay evidencia de que las capacidades del modelo base se conserven tras el CPT.
- Riesgo de deriva de identidad: el entrenamiento se hizo con encuadre de personaje y corpus autoescrito, lo que puede alterar la persona, el tono y las respuestas de seguridad del instruct original.
- Riesgo de alucinación: no cuantificado; no hay evaluaciones de factualidad para este checkpoint.
- Sesgos: no evaluados. El corpus procede de texto sintético generado por el propio modelo, lo que puede amplificar sesgos presentes en el base y en su distribución de salida.
- Idiomas: no documentados; la cobertura multilingüe del base podría haberse degradado al ajustar sobre un corpus en un único idioma (presumiblemente inglés, no confirmado).
- Ambigüedad en la documentación: la model card describe el corpus como autoescrito pero indica "0 self-authored" documentos, una contradicción que dificulta la reproducibilidad.
- Trazabilidad limitada: el repositorio y el autor no ofrecen métricas, scripts de entrenamiento ni artefactos de evaluación en la información proporcionada.
- Compatibilidad de cuantizaciones: al no publicarse GGUF/GPTQ/AWQ, cualquier despliegue eficiente requiere conversión y validación propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joshycodes/llama-3.1-8b-fve-advanchor-s1
- Modelo base (instruct): https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Modelo base (pretrained): https://huggingface.co/meta-llama/Llama-3.1-8B
- Repositorio oficial de modelos Llama: https://github.com/meta-llama/llama-models
- Model card de Llama 3.1 en GitHub: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/MODEL_CARD.md
- Pagina de modelos Llama de Meta: https://dev.meta.ai/llama/models/llama-3
