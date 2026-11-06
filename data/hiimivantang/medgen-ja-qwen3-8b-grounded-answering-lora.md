# hiimivantang/medgen-ja-qwen3-8b-grounded-answering-lora

## Resumen

medgen-ja-qwen3-8b-grounded-answering-lora es un adaptador LoRA para Qwen3-8B, desarrollado por el usuario hiimivantang, orientado a responder preguntas médicas en japonés fundamentadas exclusivamente en pasajes de literatura científica suministrados en el propio prompt. El modelo no contiene pesos propios: es un adaptador PEFT que debe combinarse con la revisión exacta `b968826d9c46dd6066d109eabc6255188de91218` de Qwen/Qwen3-8B. Su salida es un objeto JSON con respuesta, citas por `document_id`/`passage_id`, un indicador `evidence_sufficient` para abstenerse y una lista de limitaciones de la evidencia.

El adaptador resuelve el problema de la generación médica no fundamentada: obliga al modelo a ceñirse a los documentos aportados, a citar cada afirmación y a abstenerse cuando la evidencia es insuficiente. Según la model card, su efecto principal es conductual (respuestas más completas y citas más precisas) más que una mejora medible en corrección sobre el modelo base. Está pensado como prueba de concepto de investigación, no para uso clínico.

El modelo base Qwen3-8B es un transformer denso de 8 mil millones de parámetros con contexto largo nativo. El adaptador se entrenó con LLaMA-Factory sobre 944 ejemplos sintéticos generados por un modelo profesor local (Qwen3.5-122B) a partir de resúmenes de literatura de acceso abierto. El repositorio ocupa 0,1 GB y la licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen3-8B |
| Parametros totales | No disponible (adaptador; el modelo base Qwen3-8B tiene 8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Qwen3-8B) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | Japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere pesos del modelo base Qwen3-8B |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16, alpha 32 y dropout 0,05 aplicado sobre los módulos `q_proj`, `k_proj`, `v_proj` y `o_proj` del transformer Qwen3-8B. Se entrenó con LLaMA-Factory, tasa de aprendizaje 1e-4 con decaimiento coseno, 2 épocas, 944 ejemplos y 118 pasos, semilla 42 y precisión bf16, sobre una NVIDIA DGX Spark (GB10). El entrenamiento se realizó contra la revisión exacta del modelo base indicada, y `adapter_config.json` la registra. El chat template es `qwen3` con el modo de razonamiento desactivado (`enable_thinking=False`).

Los datos de entrenamiento son completamente sintéticos: preguntas, etiquetas estructuradas y respuestas de referencia fueron generadas por un modelo profesor local con licencia Apache-2.0 (Qwen3.5-122B) a partir de resúmenes de literatura de acceso abierto. No se documenta en la información disponible el número total de tokens de entrenamiento ni la composición detallada del dataset. El adaptador se entrenó con un system prompt y una plantilla de usuario fijos en japonés que deben reproducirse literalmente para obtener los resultados reportados.

## Capacidades

- Generación de respuestas médicas en japonés fundamentadas exclusivamente en los pasajes de evidencia proporcionados en el prompt.
- Citación estructurada: cada afirmación se asocia a `document_id` y `passage_id` con el contenido que respalda.
- Abstención explícita mediante el campo `evidence_sufficient`: si la evidencia no basta, devuelve `false`, explica el motivo y deja las citas vacías.
- Declaración de limitaciones de la evidencia (diseño del estudio, población, discrepancias entre fuentes).
- Salida en JSON estricto, sin texto adicional ni bloques de código, adecuada para consumo programático.
- Preservación de valores numéricos literales (efectos, intervalos de confianza, porcentajes) tal como aparecen en la literatura.
- Modo de razonamiento desactivado por diseño; no se documentan capacidades de tool calling, agentes ni multimodalidad en la información disponible.

## Casos de uso

- Respuesta fundamentada sobre literatura médica: dado un conjunto de resúmenes y una pregunta clínica, el modelo devuelve una síntesis en japonés con citas verificables por pasaje, lo que permite auditar cada afirmación contra la fuente original.
- Generación de resúmenes con trazabilidad para revisiones sistemáticas exploratorias: el campo `citations` permite reconstruir qué documento respalda cada frase, útil en fases de cribado preliminar.
- Detección de evidencia insuficiente: en flujos de pregunta-respuesta médica, el indicador `evidence_sufficient` actúa como puerta de abstención antes de mostrar una respuesta al usuario.
- Evaluación comparativa de sistemas RAG: sirve como componente de referencia para medir validez de citas y preservación numérica frente a otros modelos con el mismo contexto de evidencia.
- Extracción estructurada de hallazgos: el JSON de salida puede ingerirse en bases de datos o pipelines de anotación que requieran claims vinculados a pasajes concretos.
- Investigación en atribución y fidelidad: adecuado para estudiar comportamiento de citación y abstención en modelos de lenguaje aplicados a dominios de alto riesgo, siempre en entornos de laboratorio.

## Benchmarks y rendimiento

Evaluación sobre un conjunto de test retenido de 430 ítems sintéticos (`test_ga`, 10 categorías), con 111 ítems excluidos por una auditoría independiente, dejando 319 en el análisis primario. Misma evidencia para todos los modelos, decodificación greedy y razonamiento desactivado.

| Modelo | Grounded composite | Validez de citas | Preservación numérica | Juez: aceptable | Juez: completitud (0-4) |
|---|---|---|---|---|---|
| Qwen3-8B (base, mismo prompt) | 0,943 | 0,994 | 0,921 | 93,7% | 3,15 |
| Este adaptador | 0,944 | 1,000 | 0,944 | 93,4% | 3,61 |
| gpt-6.1-sol (referencia OpenAI) | 0,976 | 1,000 | 0,980 | 99,7% | 3,93 |

El efecto principal del adaptador es conductual: mejora la completitud según el juez (+0,46; IC 95% +0,33 a +0,58) y la precisión de las citas, sin pérdida medible de corrección. La hipótesis preregistrada de mejora en respuesta fundamentada no se confirmó en los endpoints deterministas. En un pipeline RAG completo con recuperación propia, el adaptador obtuvo peor resultado que el modelo base (grounded composite −0,055; IC 95% −0,081 a −0,030), principalmente por menor recall de citas y más abstenciones. Las puntuaciones del juez provienen de GLM 5.3 (principal) con Kimi K3 como adjudicador (88% de acuerdo en aceptabilidad).

## Requisitos de hardware

- El adaptador en sí ocupa 0,1 GB; requiere cargar el modelo base Qwen3-8B completo en bf16, lo que implica aproximadamente 16 GB de VRAM solo para pesos.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para inferencia en bf16 con margen limitado; para contextos largos conviene mayor memoria.
- Cabe en GPU de consumo de gama alta (RTX 4090, 24 GB) en bf16; en GPUs con menos VRAM es necesario cuantizar el modelo base, aunque la model card no documenta configuraciones cuantizadas del adaptador.
- Despliegue soportado: Transformers + PEFT (`PeftModel`) y vLLM con `--enable-lora --max-lora-rank 16`, que permite servir varios adaptadores sobre una misma instancia del modelo base.
- El entrenamiento se realizó en una NVIDIA DGX Spark (GB10); no se documentan latencia ni throughput de inferencia en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (sobre Qwen3-8B) | 8B (base) + LoRA r=16 | No disponible | QA médica en japonés con citas y abstención | Apache-2.0 | Hugging Face, 22 descargas |
| Qwen3-8B (base) | 8B | No disponible | Modelo generalista multilingüe | Apache-2.0 | Hugging Face |
| gpt-6.1-sol (OpenAI) | No disponible | No disponible | Modelo propietario de referencia | Propietaria | API de OpenAI |

La comparación directa con alternativas de la misma categoría (adaptadores LoRA médicos en japonés) no está disponible en la información proporcionada. El modelo base Qwen3-8B es la referencia natural, ya que el adaptador se evaluó contra él con el mismo prompt y la misma evidencia.

## Limitaciones y advertencias

- Prueba de concepto de investigación: no está validado clínicamente ni revisado por un médico; no debe usarse para decisiones sobre pacientes individuales.
- Entrenado y evaluado únicamente con preguntas sintéticas; el comportamiento sobre preguntas reales no está caracterizado.
- El prompt debe reproducirse literalmente (system prompt y plantilla de usuario en japonés); otras formulaciones no reproducen los resultados reportados.
- No debe insertarse tal cual en un pipeline RAG de extremo a extremo: con recuperación propia rindió peor que el modelo base por menor recall de citas y mayor abstención.
- Riesgo de alucinación inherente al modelo base; el adaptador mitiga la fundamentación pero no la elimina, y las citas deben verificarse contra el pasaje original.
- Solo soporta japonés; no se documenta cobertura multilingüe.
- Requiere la revisión exacta del modelo base (`b968826d9c46dd6066d109eabc6255188de91218`); usar otra revisión puede degradar el comportamiento.
- Las evaluaciones con juez LLM no constituyen validación clínica.
- La licencia Apache-2.0 permite uso comercial del adaptador, pero el uso en contextos médicos reales queda limitado por las advertencias anteriores y por la normativa aplicable.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/hiimivantang/medgen-ja-qwen3-8b-grounded-answering-lora
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio PEFT: https://github.com/huggingface/peft
- LLaMA-Factory: https://github.com/hiyouga/LLaMA-Factory
- vLLM: https://github.com/vllm-project/vllm
