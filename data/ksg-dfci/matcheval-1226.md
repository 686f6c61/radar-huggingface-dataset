# ksg-dfci/MatchEval-1226

## Resumen

MatchEval-1226 es un modelo de decisión especializado en el emparejamiento entre pacientes oncológicos y ensayos clínicos, desarrollado por el grupo ksg-dfci (Dana-Farber Cancer Institute). Se trata de un ajuste fino completo (full fine-tune) del modelo base LiquidAI/d1-2B, un transformer de aproximadamente 1.918 millones de parámetros. Su función es responder preguntas de sí/no sobre pares paciente-cohorte de ensayo clínico, devolviendo en una única pasada forward la probabilidad de "sí" para cada pregunta.

El modelo forma parte de la release MatchMiner-AI 1226 y sustituye a los componentes TrialChecker y BoilerplateChecker de la release 0526. Resuelve el problema de cribado y priorización de pares paciente-ensayo para revisión por parte de equipos clínicos, estructurando la evaluación en siete familias de preguntas binarias (razonabilidad, tipo de cáncer, carga de enfermedad, historial de tratamiento, biomarcadores, exclusiones boilerplate y criterio individual).

Es relevante porque aborda una tarea altamente específica del dominio oncológico con un modelo compacto (menos de 2.000 millones de parámetros) entrenado exclusivamente con datos sintéticos, lo que evita problemas de privacidad. No obstante, es un modelo de uso exclusivamente investigador, sin resultados de evaluación publicados y con dependencia estricta del paquete `matchminer_ai` para el renderizado de entradas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (lfm3_vl, derivada de LiquidAI/d1-2B) |
| Parámetros totales | 1.918.181.888 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | hasta 10.000 tokens en entrenamiento; longitud máxima de contexto del modelo base no disponible |
| Tipos de cuantización | no disponible (entrenamiento e inferencia en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0), con limitación de uso comercial |
| Formato de pesos | safetensors |
| Pipeline | feature-extraction |
| Modelo base | LiquidAI/d1-2B |
| Tamaño del repositorio | 3,9 GB |
| Requiere trust_remote_code | sí (código System One del modelo base) |

## Arquitectura y entrenamiento

El modelo es un full fine-tune del transformer LiquidAI/d1-2B, con arquitectura etiquetada como `lfm3_vl`. El ajuste se realizó con el Trainer de Transformers durante una época, con learning rate de 1e-5, batch efectivo de 256 y entradas de hasta 10.000 tokens. Las preguntas se empaquetan tras su estado correspondiente y la pérdida se calcula únicamente como entropía cruzada sí/no en cada slot de respuesta, lo que convierte el modelo en un clasificador binario por pregunta más que en un generador de texto libre.

El entrenamiento utilizó exclusivamente datos sintéticos del dataset ksg-dfci/mmai-synthetic-1226: 5.000 ensayos oncológicos de ClinicalTrials.gov con protocolos y cohortes sintéticas, y 87.890 pacientes sintéticos. Las etiquetas fueron generadas por un LLM profesor (NVIDIA Nemotron 3.5 Super) sobre pares candidatos de tres rondas de minería TrialSpace, produciendo 16,9 millones de ejemplos (8,5 millones de estados de matching, 8,4 millones de estados boilerplate y 85.000 estados por criterio). No se emplearon datos reales de pacientes. El contrato de entrenamiento y la huella del modelo se registran en `decision_contract.json`.

## Capacidades

- Clasificación binaria sí/no sobre pares paciente-cohorte de ensayo clínico en siete familias de preguntas.
- Evaluación de razonabilidad de elegibilidad (el paciente es potencialmente elegible o claramente no elegible).
- Evaluación por dimensión: tipo de cáncer, carga de enfermedad, historial de tratamiento y biomarcadores.
- Evaluación de exclusiones boilerplate (exclusiones comunes del ensayo frente al historial del paciente).
- Evaluación por criterio individual (línea de inclusión o exclusión del protocolo).
- Salida de probabilidad de "sí" en una única pasada forward, sin generación autoregresiva.
- Integración con el paquete `matchminer_ai` mediante `score_match_quality`, `exclusion_criteria_check` y `check_eligibility_criteria`.
- No soporta tool calling, agentes, visión, audio ni modo thinking según la información disponible.

## Casos de uso

- Cribado previo de elegibilidad en ensayos oncológicos: el modelo puntúa pares paciente-cohorte para que los equipos de investigación prioricen qué candidatos revisar manualmente, reduciendo el volumen de revisión manual con una pasada forward por par.
- Priorización de cohortes para un paciente concreto: dado un resumen de paciente, se evalúan múltiples cohortes y se ordenan por probabilidad de razonabilidad, orientando la búsqueda de ensayos apropiados.
- Detección de exclusiones boilerplate: el modelo identifica pares donde las exclusiones comunes del ensayo podrían descartar al paciente, permitiendo filtrar antes de la revisión clínica detallada.
- Verificación por criterio individual: como ayuda de cribado, señala líneas de inclusión claramente no cumplidas o exclusiones claramente cumplidas, acelerando la revisión del protocolo completo.
- Investigación en emparejamiento clínico: sirve como componente evaluable en pipelines de investigación sobre automatización del matching paciente-ensayo, con datos sintéticos reproducibles.
- Evaluación comparativa de releases: al sustituir a TrialChecker y BoilerplateChecker de la release 0526, permite comparar el rendimiento entre versiones del sistema MatchMiner-AI en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se publican resultados de evaluación con esta release y que el rendimiento en cada institución requiere evaluación local.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,9 GB en bfloat16 (pesos de 1.918 millones de parámetros), más overhead de activaciones para entradas de hasta 10.000 tokens.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, una GPU con al menos 8-16 GB de VRAM debería ser suficiente en bfloat16.
- Cabe en GPU de consumo: probablemente sí en tarjetas con 16 GB o más (RTX 4080, RTX 4090, RTX 3090), aunque no se confirma en la documentación.
- Opciones de despliegue: Transformers en proceso con `trust_remote_code=True` y bfloat16. vLLM no sirve esta arquitectura según la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MatchEval-1226 | 1.918 M | hasta 10.000 tokens (entrenamiento) | Clasificación sí/no paciente-ensayo oncológico | LFM v1.0 (uso comercial limitado) | Hugging Face |
| LiquidAI/d1-2B (base) | ~1.918 M | no disponible | Modelo generalista | LFM v1.0 | Hugging Face |
| TrialChecker / BoilerplateChecker (release 0526) | no disponible | no disponible | Matching paciente-ensayo | no disponible | predecesores del mismo sistema |

No se dispone de información sobre otros modelos comparables de la misma categoría (matching clínico especializado) en la documentación proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con pacientes y protocolos sintéticos; el rendimiento en una institución concreta requiere evaluación local y no se han publicado resultados.
- Las respuestas dependen de los resúmenes y criterios proporcionados: los hechos ausentes en un resumen no pueden ponderarse.
- Las respuestas por criterio son ayudas de cribado, no adjudicaciones clínicas.
- Uso exclusivamente investigador: las respuestas no son determinaciones de elegibilidad, diagnósticos ni recomendaciones de tratamiento; cada par requiere revisión contra el protocolo completo y actualizado.
- Licencia LFM Open License v1.0 con limitación de uso comercial; consultar `NOTICE.md`.
- Requiere el renderizado exacto de estados y preguntas del paquete `matchminer_ai`; el modelo espera esos formatos concretos.
- Requiere fijar el modelo a un commit concreto del Hub, ya que se ejecuta el código del checkpoint (`trust_remote_code=True`).
- Riesgo de sesgo y alucinación no cuantificado en la documentación; no hay datos sobre idiomas soportados.
- No servible con vLLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ksg-dfci/MatchEval-1226
- Colección MatchMiner-AI 1226: https://huggingface.co/collections/ksg-dfci/matchminer-ai-1226-6b02079780cbeb2146ee081c
- Dataset de entrenamiento: https://huggingface.co/datasets/ksg-dfci/mmai-synthetic-1226
- Modelo base: https://huggingface.co/LiquidAI/d1-2B
- Licencia (LFM Open License v1.0): disponible en el repositorio como `LICENSE` y `NOTICE.md`
