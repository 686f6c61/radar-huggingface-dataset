# ciaochris/Vers3Dynamics-Civil-Reactor-Expert-3B

## Resumen

Vers3Dynamics Civil Reactor Expert 3B es un adaptador LoRA (PEFT) de rango 4 y alpha 8 construido sobre `Qwen/Qwen2.5-3B-Instruct`, desarrollado por el usuario ciaochris bajo el paraguas del proyecto Vers3Dynamics. Su objetivo es la tutoría y el razonamiento técnico en ingeniería de reactores civiles: cinética puntual, transitorios de xenón/yodo, calor residual, contabilidad de salvaguardias nucleares y conceptos defensivos de ciberseguridad de sistemas de control industrial. No es un modelo de pesos completos, sino un adaptador que se carga sobre el modelo base de 3B parámetros de Qwen.

El modelo se presenta con una arquitectura de "defensa en profundidad" que combina un prefilter de palabras clave en la capa de servicio, un conjunto de herramientas deterministas (`civil_tools.py`) para cálculos físicos exactos, y el propio adaptador para generación conversacional. La documentación del autor es inusualmente transparente sobre sus limitaciones: los pesos publicados corresponden a una ejecución de validación de solo 5 pasos de optimización, los benchmarks no existen como tales y el prefilter de seguridad tiene una recall del 53% sobre prompts prohibidos.

Es relevante ahora porque ejemplifica una tendencia creciente: adaptadores de dominio muy específicos con documentación de auditoría explícita, separación entre cálculo determinista y generación lingüística, y políticas de rechazo legibles por máquina. Resulta útil como caso de estudio de ingeniería de IA aplicada a un dominio regulado, más que como modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (rank 4, alpha 8, dropout 0.05) sobre `q_proj` y `v_proj` |
| Parámetros totales | 3B (modelo base Qwen2.5-3B-Instruct); adaptador LoRA de tamaño reducido |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del base Qwen2.5-3B-Instruct) |
| Tipos de cuantización | Entrenamiento en QLoRA 4-bit NF4; el adaptador se distribuye en safetensors. Cuantizaciones de inferencia no especificadas |
| Idiomas soportados | Inglés (en) |
| Licencia | `qwen-research` (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen2.5-3B-Instruct |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-3B-Instruct, un transformer decoder-only de 3B parámetros. El LoRA tiene rango 4, alpha 8 y dropout 0.05, y solo modifica las proyecciones `q_proj` y `v_proj` de las capas de atención. El entrenamiento se realizó con QLoRA en 4 bits NF4 sobre un conjunto de datos sintético y curado de instrucciones (SFT), con generadores de datos "fail-closed" y un manifiesto auditable.

Un punto crítico: los pesos publicados en la raíz del repositorio corresponden a una **ejecución de validación de 5 pasos de optimización**, no a un entrenamiento completo. El propio autor advierte que el comportamiento esperado es cercano al del modelo base y que no se ha evaluado contra él. Existe una rama experimental (`optimization-2026-11-03`) con un adaptador entrenado por separado que falló la comprobación de no regresión numérica. El conjunto de datos legacy (`tinker_training_examples.jsonl`) contiene 58 de 310 ejemplos defectuosos (27 con valores imposibles de calor residual) y se conserva solo como procedencia; el conjunto regenerado `tinker_training_examples_v2.jsonl` verifica 568 respuestas numéricas contra los motores de cálculo con 0 hallazgos.

La innovación técnica más destacable no está en el adaptador en sí, sino en la separación entre el cálculo determinista (motores `kinetics.py`, `xenon.py`, `units.py`, calor residual, auditados contra las formas de los libros de texto citados) y la generación lingüística. El dispatcher decide si una pregunta es numérica y, en tal caso, delega en `civil_tools.py`.

## Capacidades

- Generación de texto conversacional en inglés sobre temas de ingeniería nuclear civil.
- Explicación de cinética puntual de reactores, grupos de precursores de neutrones retardados y conversión de unidades de reactividad (pcm, delta-k/k, dólares).
- Análisis educativo de transitorios de xenón-135 y yodo-135 tras reducciones de potencia.
- Razonamiento sobre dinámica de calor residual y balance de materiales en salvaguardias (MUF, evaluaciones con covarianza).
- Tool calling / function calling mediante el módulo `civil_tools.py` para cálculos físicos deterministas y verificados por tests.
- Conceptos defensivos de ciberseguridad de sistemas de control industrial (ICS), sin payloads de explotación.
- Política de rechazo escrita y legible por máquina para armas, recetas de enriquecimiento/separación, evasión de salvaguardias, sabotaje y manipulación operativa de plantas.
- Capacidades multilingües: limitadas al inglés según la model card.
- No incluye visión, audio ni modo "thinking" explícito.

## Casos de uso

- **Tutoría educativa en cinética de reactores**: el modelo puede explicar conceptos como los seis grupos de precursores de neutrones retardados y por qué hacen posible el control del reactor, apoyándose en el motor `kinetics.py` para los valores numéricos exactos.
- **Análisis de transitorios de xenón**: útil para formación de operadores e investigadores, explicando por qué el Xe-135 puede alcanzar un pico horas después de una reducción de potencia, con cálculos delegados al motor `xenon.py`.
- **Conversión de unidades de reactividad en ejercicios docentes**: dado que el tool layer convierte pcm a delta-k/k y a dólares para un beta_eff dado, es adecuado para generar problemas resueltos verificables.
- **Contabilidad de salvaguardias (formación)**: el modelo puede esbozar evaluaciones de balance de materiales con covarianza (MUF) en un contexto educativo, sin sustituir procedimientos regulados reales.
- **Prototipado de asistentes con rechazo auditable**: sirve como ejemplo de integración de un prefilter de política, un dispatcher numérico y una política de rechazo legible por máquina en una arquitectura de servicio.
- **Investigación sobre separación cálculo/generación**: útil para estudiar cómo delegar operaciones deterministas a herramientas y reservar el LLM para la capa lingüística, reduciendo alucinaciones numéricas.
- **Docencia en ciberseguridad de ICS (defensiva)**: puede discutir conceptos de resiliencia ciberfísica en plantas civiles, con rechazo explícito de contenido ofensivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente "Benchmarks: None claimed" y que la validación es basada en esquemas, con tolerancia numérica verificada y heurística por diseño. La única métrica cuantitativa reportada es que el routing de cálculo corregido pasa 15/15 casos de regresión numérica existentes (antes 9/15), y que el prefilter de seguridad tiene un 53% de recall (19 de 36 prompts prohibidos) con 0 falsos positivos sobre 827 prompts permitidos.

## Requisitos de hardware

- El adaptador LoRA es pequeño (el repo completo ocupa 4.1 GB, incluyendo base y artefactos), pero requiere cargar el modelo base Qwen2.5-3B-Instruct.
- VRAM estimada para inferencia en FP16: aproximadamente 6-7 GB para el base de 3B más overhead del adaptador.
- VRAM estimada en cuantización 4-bit (NF4/GPTQ/AWQ): aproximadamente 2-3 GB, apta para GPUs de consumo.
- GPU recomendadas: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090; para serving concurrente se recomienda A10G, L4 o A100.
- Opciones de despliegue: PEFT + Transformers, vLLM (con soporte LoRA), TGI, llama.cpp/Ollama si se fusiona el adaptador y se convierte a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vers3Dynamics Civil Reactor Expert 3B | 3B + LoRA r4 | No disponible | Nuclear civil (tutoría, cinética, salvaguardias) | qwen-research | Hugging Face, 58 descargas |
| Qwen2.5-3B-Instruct (base) | 3B | No disponible en la información | Generalista | qwen-research | Hugging Face, ampliamente usado |
| Qwen2.5-7B-Instruct | 7B | No disponible en la información | Generalista | qwen-research | Hugging Face |
| Adaptadores de dominio genéricos (p. ej. LoRA médicos o legales) | Variable | Variable | Vertical específico | Variable | Variable |

La comparación directa con alternativas del mismo nicho (adaptadores nucleares auditados) no está disponible en la información proporcionada. Frente al base Qwen2.5-3B-Instruct, la diferencia principal es la política de rechazo, el tool layer determinista y la documentación de auditoría, no una mejora medible en benchmarks.

## Limitaciones y advertencias

- Los pesos publicados corresponden a solo 5 pasos de optimización; el comportamiento esperado es cercano al del modelo base y no se ha evaluado formalmente contra él.
- El prefilter de seguridad tiene un recall del 53% sobre prompts prohibidos; el autor lo describe como "tripwire, not a boundary". Los rechazos del propio modelo sobre los pesos publicados no se han medido.
- El conjunto de datos legacy contiene 58 de 310 ejemplos defectuosos; no debe usarse para reentrenar.
- Riesgo de alucinación en contenido técnico no cubierto por el tool layer; los cálculos numéricos deben delegarse siempre a `civil_tools.py`.
- Idioma limitado al inglés; no se garantiza calidad en castellano u otros idiomas.
- Licencia `qwen-research`: restricciones para uso comercial; debe revisarse el LICENSE de Qwen2.5-3B-Instruct antes de cualquier despliegue productivo.
- Aviso obligatorio del autor: solo para educación, investigación y demostraciones de razonamiento de salvaguardias; nunca para operación real de planta, licencias, cumplimiento, respuesta a emergencias ni decisiones de seguridad crítica.
- No apto para armas, recetas de enriquecimiento/separación, evasión de salvaguardias, sabotaje, ciberofensiva ni manipulación operativa de plantas.
- La rama `optimization-2026-11-03` contiene un adaptador que falló la comprobación de no regresión numérica y es experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ciaochris/Vers3Dynamics-Civil-Reactor-Expert-3B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Rama experimental: https://huggingface.co/ciaochris/Vers3Dynamics-Civil-Reactor-Expert-3B/tree/optimization-2026-11-03/optimization/2026-11-03/candidate
- `OPTIMIZATION_REPORT.md`: referenciado en la model card (ruta relativa del repo)
- `AUDIT.md`: referenciado en la model card (ruta relativa del repo)
- `evaluation_report.md`: referenciado en la model card (ruta relativa del repo)
- `TECHNICAL_REPORT.md`: referenciado en la model card (ruta relativa del repo)
- `docs/optimization.md`: referenciado en la model card (ruta relativa del repo)
