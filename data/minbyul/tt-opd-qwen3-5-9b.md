# Minbyul/TT-OPD-Qwen3.5-9B

## Resumen

TT-OPD-Qwen3.5-9B es un checkpoint de 9.400 millones de parámetros derivado de Qwen/Qwen3.5-9B, post-entrenado por Minbyul mediante aprendizaje por refuerzo agéntico multi-turno sobre tareas médicas. El entrenamiento combina GRPO con una técnica propia denominada TT-OPD (turn-level on-policy self-distillation), que usa un profesor EMA sin gradientes, KL bidireccional a nivel de trayectoria y filtrado posicional top-K. El resultado es un modelo especializado en comportarse como un agente que interactúa con herramientas médicas (búsqueda de literatura, consulta de conocimiento, acceso a registros estructurados) y que termina cada episodio con una llamada `submit_answer`.

El modelo se presenta como una alternativa a los asistentes médicos de pregunta-respuesta clásicos: en lugar de optimizar prosa fluida, optimiza el compromiso con una respuesta final a través del bucle de herramientas. En la evaluación controlada del autor, la tasa de episodios sin respuesta cae del 9,30% al 1,15% en MedQA y del 6,73% al 0,73% en MMLU-Med, mientras que la precisión sube +3,0 puntos porcentuales en MedQA respecto al modelo base. El checkpoint hereda la arquitectura multimodal del base (visión, texto y vídeo), pero su comportamiento medido se limita al dominio médico en inglés y al uso con herramientas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (Gated Delta Networks + Gated Attention) heredada de Qwen3.5-9B |
| Parametros totales | 9.409.813.744 (9,4 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 000 tokens (nativo, extensible a ~1 M según el base; en el ejemplo de despliegue se usa 131 072) |
| Tipos de cuantizacion | No especificados; pesos en bf16 (safetensors) |
| Idiomas soportados | Inglés (el base es multilingüe, pero este checkpoint está especializado en inglés médico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un modelo multimodal denso de 9 B con arquitectura híbrida que combina Gated Delta Networks y Gated Attention, con soporte nativo de contexto de 262 K tokens. Sobre esta base, TT-OPD-Qwen3.5-9B se post-entrena con un objetivo de aprendizaje por refuerzo agéntico: cada episodio consiste en una tarea clínica o biomédica resuelta a través de varios turnos de uso de herramientas (búsqueda de evidencia, consulta de conocimiento, acceso a registros) y una llamada final `submit_answer`. La recompensa se asigna al resultado del episodio, no a la fluidez del texto.

La innovación principal es el algoritmo TT-OPD, que se añade a GRPO. Usa un profesor EMA sin gradientes (media móvil exponencial del propio estudiante), una divergencia KL bidireccional entre estudiante y profesor con signo invertido para estabilizar trayectorias correctas y alejar las incorrectas, cobertura de toda la trayectoria (todos los turnos) en lugar de solo la respuesta final, filtrado posicional top-K de tokens de alta señal y un ajuste de longitud de recompensa basado en coseno. Los pesos publicados corresponden al paso 660, el final del entrenamiento. No se especifican los datos de entrenamiento ni el número de tokens, pero el entorno de evaluación usa un presupuesto de 5 turnos con herramientas y base de conocimiento.

## Capacidades

- Agente médico multi-turno: interactúa con herramientas de búsqueda de literatura, consulta de conocimiento y acceso a registros estructurados, y finaliza con una llamada `submit_answer`.
- Compromiso de respuesta: reduce drásticamente la tasa de episodios sin respuesta (del 9,30% al 1,15% en MedQA).
- Razonamiento médico: mejora la precisión en MedQA (USMLE) y mantiene el rendimiento en MMLU-Med sin olvido catastrófico.
- Soporte de tool calling: el 99,5% de los turnos emiten llamadas a herramientas bien formadas, según la evaluación del autor.
- Capacidades multimodales heredadas: el checkpoint conserva la torre de visión del modelo base (333 tensores en `model.visual.*`), por lo que puede procesar imágenes y vídeo, aunque no se ha evaluado en ese ámbito.
- Razonamiento y codificación: hereda las capacidades generales de Qwen3.5-9B (razonamiento, código, matemáticas) fuera del dominio médico, aunque no se han medido específicamente.

## Casos de uso

- Investigación biomédica asistida: un investigador formula una pregunta sobre evidencia clínica; el modelo ejecuta búsquedas en bases de literatura y sintetiza una respuesta comprometida con citas, reduciendo el tiempo de revisión manual.
- Soporte a revisión de literatura: el agente consulta múltiples fuentes estructuradas y devuelve un resumen accionable con referencias, útil para revisiones sistemáticas preliminares.
- Educación médica: estudiantes de medicina pueden interactuar con el agente para practicar razonamiento clínico, recibiendo respuestas concisas basadas en evidencia y con formato de herramienta.
- Automatización de triaje documental: en entornos no clínicos, el modelo puede clasificar y responder consultas médicas administrativas (p. ej., preguntas sobre formularios, protocolos) usando su bucle de herramientas.
- Extracción de información de registros estructurados: el agente puede consultar bases de datos de pacientes simulados o anonimizados para responder preguntas específicas, útil en entornos de investigación.
- Generación de respuestas cortas para sistemas de soporte a decisión: su tendencia a respuestas breves (mediana de 55 caracteres en preguntas abiertas) lo hace adecuado para integrarse en pipelines que requieren respuestas concisas y verificables, siempre con supervisión humana.

## Benchmarks y rendimiento

El autor proporciona resultados de una evaluación controlada en un harness propio con 5 turnos, herramientas y base de conocimiento, comparando el modelo base, la variante GRPO y TT-OPD (este modelo). Se ejecutaron 3 rondas independientes por celda; los valores son media ± desviación estándar.

| Benchmark | n | Base | GRPO | TT-OPD (este modelo) |
|---|---|---|---|---|
| MedQA (USMLE) | 1273 | 80,96 ± 0,39 | 83,69 ± 0,24 | 83,97 ± 0,14 |
| MMLU-Med (6 subtipos) | 1089 | 85,89 ± 0,47 | 85,83 ± 0,75 | 86,69 ± 0,24 |

El autor advierte que la mejora en MedQA (+3,0 pp sobre el base) se debe principalmente al efecto de compromiso de respuesta, no a un mejor razonamiento por respuesta. En MMLU-Med, la diferencia (+0,8 pp) está dentro de ~1,5 desviaciones estándar, por lo que debe interpretarse como ausencia de regresión, no como ganancia. No se han publicado resultados en benchmarks estándar de un solo turno (MMLU general, HumanEval, GSM8K) para este checkpoint específico.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16, el modelo ocupa aproximadamente 18,8 GB (tamaño del repositorio). Con cuantización de 4 bits, podría reducirse a ~5-6 GB, aunque no se han publicado configuraciones oficiales de cuantización.
- GPU recomendadas: para ejecución en bf16, se necesita una GPU con al menos 24 GB de VRAM (p. ej., RTX 4090, A100 40 GB, H100). Con cuantización, podría caber en GPUs de 8-12 GB (p. ej., RTX 3080, RTX 4070).
- Opciones de despliegue: el autor recomienda SGLang con el comando indicado en la model card (con `--context-length 131072` y parsers de razonamiento y herramientas de Qwen3). También es compatible con Transformers (carga con `AutoModelForCausalLM` y `trust_remote_code=True`) y probablemente con vLLM y llama.cpp, aunque no se documenta explícitamente.
- Latencia y throughput: no se proporcionan datos medidos. Dado el tamaño de 9,4 B y el uso de atención híbrida, se espera un rendimiento moderado; en SGLang con una sola GPU, el throughput dependerá del número de turnos y de la longitud de contexto.

## Comparativa con modelos similares

La comparación más directa es con el propio modelo base y con la variante GRPO, ya que el autor proporciona datos controlados. No se dispone de comparaciones con otros modelos médicos open source (p. ej., Meditron, BioMistral) en el mismo harness.

| Modelo | Parámetros | Contexto | MedQA (harness 5 turnos) | MMLU-Med (harness 5 turnos) | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-9B (base) | 9,4 B | 262 K | 80,96 ± 0,39 | 85,89 ± 0,47 | Apache 2.0 |
| Qwen3.5-9B + GRPO | 9,4 B | 262 K | 83,69 ± 0,24 | 85,83 ± 0,75 | Apache 2.0 |
| TT-OPD-Qwen3.5-9B | 9,4 B | 262 K | 83,97 ± 0,14 | 86,69 ± 0,24 | Apache 2.0 |

No se dispone de datos de otros modelos médicos en el mismo entorno de evaluación, por lo que no es posible una comparación cuantitativa fiable con alternativas como Meditron o BioMistral.

## Limitaciones y advertencias

- Es un agente con herramientas, no un modelo de chat de un solo turno. No se ha evaluado fuera del bucle de herramientas y no se espera que los resultados se mantengan en ese escenario.
- Produce respuestas muy cortas en preguntas abiertas (mediana de ~55 caracteres frente a ~196 del base). No debe usarse para explicaciones largas dirigidas a pacientes.
- La ganancia en MedQA se atribuye principalmente al compromiso de respuesta, no a un mejor razonamiento por respuesta ni a capacidades de recuperación aprendidas.
- Solo está especializado en inglés y en dominio médico/biomédico. Fuera de esa distribución, el comportamiento es el del modelo base.
- No es una herramienta clínica. Es un checkpoint de investigación y no debe usarse para diagnóstico, decisiones de tratamiento ni fines orientados al paciente.
- No se han publicado datos de sesgos, alucinaciones o comportamiento en entornos adversarios; se recomienda evaluación adicional antes de cualquier uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Minbyul/TT-OPD-Qwen3.5-9B
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Ficha de Qwen3.5-9B en DataLearnerAI: https://www.datalearner.com/en/ai-models/pretrained-models/qwen3-5-9b
- Catálogo de modelos Microsoft Foundry: https://ai.azure.com/catalog/models/qwen-qwen3.5-9b
- Ficha en SiliconFlow: https://www.siliconflow.com/models/qwen3-5-9b
- Ficha en NanoGPT: https://nano-gpt.com/models/text/qwen/qwen3.5-9b
- Ficha en Benchable: https://benchable.ai/models/qwen/qwen3.5-9b-20260310
