# ningpy/redflag-symptom-3b

## Resumen

`ningpy/redflag-symptom-3b` es un modelo de extracción de síntomas clínicos, especializado en la detección de "banderas rojas" (red flags) médicas a partir de texto libre de pacientes. Lo desarrolla el usuario `ningpy` y se construye sobre `Qwen/Qwen2.5-3B-Instruct` mediante un ajuste LoRA fusionado (r=32, α=64, dropout=0.05), lo que da un modelo denso de 3.085.938.688 parámetros (aproximadamente 3,09 B) con licencia Apache 2.0.

El modelo no es un asistente médico generalista: es un **módulo extractor** dentro de un sistema de 5 módulos especializados (síntomas, contexto, modificadores, síntomas negados y gates poblacionales) que se combinan con un motor de reglas en Python (especificación V20, 59 reglas). Su salida es JSON estructurado con un conjunto cerrado de 83 etiquetas de síntoma, lo que lo hace directamente integrable en pipelines de triaje automatizado.

Su relevancia actual radica en dos factores: primero, está afinado específicamente para el inglés de Brunei (Manglish) y para entradas mezcladas con malayo y chino, un nicho muy poco cubierto; segundo, aborda un caso de uso de alto riesgo (triaje de urgencias) con una salida estrictamente estructurada en lugar de texto libre, lo que reduce la superficie de alucinación explotable por sistemas posteriores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), ajuste LoRA fusionado sobre el modelo base |
| Parámetros totales | 3.085.938.688 (≈ 3,09 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la model card; heredada de `Qwen/Qwen2.5-3B-Instruct` |
| Tipos de cuantización | No se publican cuantizaciones en el repositorio; pesos originales en safetensors |
| Idiomas soportados | Inglés (incluye inglés de Brunei/Manglish), chino (zh) y malayo (ms) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

Otros datos del repositorio: pipeline `text-generation`, tamaño del repositorio 6,2 GB, 0 descargas y 0 likes en el momento de la consulta, creado el 2026-09-10 y actualizado el mismo día.

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B-Instruct: un transformer decoder-only con atención causal. Sobre esa base se aplicó un ajuste LoRA con rango 32, alpha 64 y dropout 0,05, con módulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El adaptador se fusionó con los pesos base (el repositorio contiene el modelo completo, no un adapter separado). La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases adicionales de RLHF o DPO específicas para este módulo; en consecuencia, esos datos se consideran **no disponibles**.

La innovación principal no está en la arquitectura sino en el diseño de la tarea: el modelo trabaja contra un **conjunto cerrado de 83 tokens de síntoma** (por ejemplo `chest_pain`, `thunderclap_headache`, `non_blanching_rash`, `reduced_fetal_movement`, `suicidal_ideation`) y debe emitir exclusivamente `{"symptoms": [...]}`. El prompt de sistema incluye reglas explícitas de extracción (qué incluir, qué ignorar cuando el texto es historia pasada, educativo o mención diagnóstica sin síntoma) y una guía de mapeo multilingüe con modismos del Manglish y del malayo ("sesak nafas" → `breathlessness`, "pengsan" → `fainting`, "sawan" → `seizure`), además de instrucciones para ignorar partículas coloquiales ("lah", "kah", "meh", "ah", "leh", "lor", "sia", "one"). La decodificación recomendada es greedy (`do_sample=False`) con `max_new_tokens=200`, lo que prioriza determinismo sobre diversidad.

## Capacidades

- Extracción estructurada de síntomas: convierte texto libre de paciente en JSON con etiquetas de un vocabulario cerrado de 83 síntomas.
- Detección de síntomas implícitos: infiere la etiqueta a partir de expresiones coloquiales ("passed out" → `fainting`, "burning up" → `fever`, "cannot breathe" → `breathlessness`).
- Extracción multi-etiqueta: no consolida síntomas; si el mensaje menciona cuatro síntomas, devuelve cuatro etiquetas.
- Multilingüismo con mezcla de idiomas: procesa entradas en inglés de Brunei, chino y malayo, incluso combinados en un mismo mensaje.
- Distinción de contexto temporal: descarta menciones que corresponden a historia pasada ("I had asthma as a kid") o a contenido educativo.
- Salida en formato JSON apta para consumo programático directo, sin post-procesado de texto libre.
- Encaje en un sistema mayor: diseñado para combinarse con cuatro módulos hermanos (contexto, modificadores, síntomas negados, gates poblacionales) y un motor de reglas de 59 reglas.
- No se documenta soporte nativo de tool calling, function calling, agentes, visión, audio ni modo "thinking" en la información disponible.

## Casos de uso

- Triaje de urgencias hospitalarias: el módulo extrae los síntomas de la nota de admisión o del mensaje del paciente y los entrega al motor de reglas, que aplica los 59 criterios de bandera roja para asignar prioridad. Es adecuado porque su salida es determinista y estrictamente tipada, lo que permite auditar cada decisión.
- Telemedicina y chat de atención al paciente en Brunei y Malasia: el modelo entiende Manglish y malayo coloquial, de modo que el paciente puede escribir como habla ("sakit dada", "sesak nafas") sin que el sistema pierda la señal clínica.
- Preclasificación en líneas telefónicas de emergencia: transcripción de la llamada → extracción de síntomas → motor de reglas para decidir si se despacha ambulancia. El modelo aporta la capa de normalización lingüística que un clasificador léxico no cubre.
- Estructuración de historiales clínicos electrónicos: convertir notas de enfermería y mensajes de pacientes en campos codificados (`fever`, `vomiting`, `reduced_fetal_movement`) para alimentar bases de datos analíticas y sistemas de alerta temprana.
- Seguridad en salud mental: las etiquetas `suicidal_ideation`, `self_harm`, `homicidal_intent` y `severe_panic` permiten disparar protocolos de intervención inmediata en aplicaciones de bienestar psicológico.
- Detección de cuadros obstétricos y pediátricos: la presencia de etiquetas como `reduced_fetal_movement`, `vaginal_bleeding`, `floppy`, `weak_cry` o `high_pitched_cry` habilita alertas específicas para embarazo y neonatología.
- Investigación en NLP clínico multilingüe: permite anotar automáticamente corpus de inglés de Brunei, malayo y chino para estudios epidemiológicos o para construir datasets etiquetados de banderas rojas.
- Filtrado previo en aplicaciones de farmacia y atención primaria: descartar mensajes que contienen síntomas graves y derivarlos a un profesional en lugar de responderlos de forma automática.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden al **pipeline completo de 5 módulos más el motor de reglas V46**, evaluado sobre un conjunto de test independiente de 2.246 casos. No son métricas del módulo `symptom` de forma aislada:

| Métrica | Precisión | Recall | F1 | Exactitud |
|---|---|---|---|---|
| PRIMARY (any_matched × labeled_matched) | 0,902 | 0,911 | 0,906 | 91,9 % |
| STRICT matched-only | 0,893 | 0,828 | 0,859 | 91,8 % |
| STRICT m+s | 0,844 | 0,905 | 0,873 | 92,1 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni métricas desagregadas de este módulo en solitario. Tampoco se documenta el origen, la composición ni el idioma del conjunto de test de 2.246 casos.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: en torno a 6,2 GB solo de pesos, más caché KV y activaciones; presupuestar 8 GB como mínimo.
- VRAM estimada en int8: aproximadamente 3,1-3,5 GB.
- VRAM estimada en int4 (GPTQ/AWQ o GGUF Q4_K_M): alrededor de 2 GB.
- Cabe en GPU de consumo: sí. RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 3090 y RTX 4090 ejecutan el modelo en fp16 sin particionado. En 8 GB (RTX 3070, RTX 4060) cabe en fp16 con contexto moderado o en int8 con holgura.
- GPU de centro de datos compatibles: T4 16 GB, L4, A10G, L40S, A100 y H100, todas sobradas para un modelo de 3 B.
- Opciones de despliegue: `transformers` (uso directo mostrado en la model card), vLLM, TGI (el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`) y llama.cpp/Ollama tras convertir los pesos safetensors a GGUF, conversión que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles.
- Nota de despliegue: no se documentan requisitos de CPU, memoria RAM ni configuraciones de tensor parallel, al no ser necesarias para este tamaño.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| `ningpy/redflag-symptom-3b` | 3,09 B | no especificado | Apache 2.0 | HuggingFace | F1 0,906 en pipeline completo (2246 casos) |
| `Qwen/Qwen2.5-3B-Instruct` (modelo base) | 3,09 B | 32.768 tokens según documentación pública de Qwen | Apache 2.0 | HuggingFace | No disponible en la información proporcionada |
| Módulos hermanos del mismo sistema (`redflag-context-3b`, `redflag-modifier-3b`, `redflag-denied-3b`, `redflag-gate-3b`) | ≈ 3 B cada uno | no especificado | Apache 2.0 | HuggingFace (namespace `peiyan-ning`) | No disponibles individualmente |
| Otros modelos de extracción clínica de ~3 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos frente a alternativas de la misma categoría (extracción de entidades clínicas o clasificación de banderas rojas). La comparación relevante es funcional: frente al Qwen2.5-3B-Instruct sin ajustar, este modelo restringe la salida a un vocabulario cerrado de 83 síntomas y añade cobertura de Manglish y malayo, a cambio de perder la capacidad de conversación general.

## Limitaciones y advertencias

- **Salida restringida**: el modelo está diseñado para devolver únicamente `{"symptoms": [...]}`. Cualquier uso como asistente conversacional general degradará su utilidad y probablemente producirá salidas inválidas.
- **No es un dispositivo médico**: la model card no documenta validación regulatoria, clínica ni certificación sanitaria de ningún tipo. No debe usarse como sustituto del juicio clínico.
- **Dependencia del sistema completo**: las métricas publicadas (F1 0,906) corresponden al pipeline de 5 módulos más el motor de reglas V46, no a este módulo de forma aislada. Usar el módulo solo, sin el motor de reglas, no ofrece ninguna garantía de rendimiento.
- **Cobertura lingüística estrecha**: limitado a inglés (con foco en Brunei/Manglish), chino y malayo. No hay soporte documentado de castellano ni de otras lenguas.
- **Riesgo de alucinación semántica**: al operar sobre un conjunto cerrado, el fallo típico no es inventar texto, sino asignar etiquetas plausibles pero incorrectas (falsos positivos que podrían disparar alertas innecesarias) o fusionar u omitir síntomas.
- **Ambigüedad de la identidad del repositorio**: el ID de HuggingFace es `ningpy/redflag-symptom-3b`, pero la model card y los ejemplos de código hacen referencia al namespace `peiyan-ning/redflag-symptom-3b`. Conviene verificar cuál es el repositorio canónico antes de integrarlo en producción.
- **Sesgos de dominio**: el modelo se ha ajustado para notas clínicas y mensajes de pacientes de un contexto geográfico y cultural concreto (Brunei). Su comportamiento fuera de ese registro no está documentado.
- **Adopción nula**: 0 descargas y 0 likes en el momento de la consulta, con el repositorio creado y actualizado el mismo día. No hay historial de uso en producción ni retroalimentación de terceros.
- **Licencia**: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indiquen los cambios. Esto no exime de las obligaciones regulatorias aplicables a software sanitario.
- **Cuantizaciones no verificadas**: no se publican pesos GGUF, GPTQ ni AWQ oficiales; cualquier cuantización debe generarse y validarse por cuenta propia, comprobando que no degrada la extracción de las 83 etiquetas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ningpy/redflag-symptom-3b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio del pipeline completo (motor de reglas, post-procesado y código de inferencia): https://git.evyd.tech/ai/redflag-detection-2.0
- Módulos hermanos citados en la model card: `peiyan-ning/redflag-symptom-3b`, `peiyan-ning/redflag-context-3b`, `peiyan-ning/redflag-modifier-3b`, `peiyan-ning/redflag-denied-3b`, `peiyan-ning/redflag-gate-3b`
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo. Las consultas devolvieron únicamente páginas de ayuda de YouTube sin relación con el modelo.
