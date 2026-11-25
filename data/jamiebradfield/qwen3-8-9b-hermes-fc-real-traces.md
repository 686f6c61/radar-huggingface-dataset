# JamieBradfield/qwen3.8-9b-hermes-fc-real-traces

## Resumen

Este modelo es un ajuste fino QLoRA de Empero/Qwen3.8-9B, una destilación de Qwen3.5 de 9B parámetros densos con 262.144 tokens de contexto. Lo desarrolla JamieBradfield y su propósito es inyectar comportamiento de llamada a herramientas (tool calling) mediante datos de trayectorias reales de agente Hermes, en lugar de datos sintéticos. Se publica como artefacto de investigación, no como producto.

La relevancia del modelo es doble. Por un lado, demuestra que el ajuste fino supervisado puede enseñar planificación "todo-first" en tareas multi-paso a un modelo de 9B. Por otro lado, su model card incluye una corrección metodológica notable: el arnés de evaluación original no usaba la ruta nativa de herramientas (parámetro `tools` de OpenAI) y por tanto sobreestimaba las carencias del modelo base. El autor ha congelado el programa de ajuste fino y recomienda el modelo base como opción por defecto en producción.

El checkpoint publicado corresponde al paso 200 de 246 planificados (86 % del entrenamiento), con pérdida de 0,131. El repositorio contiene los pesos BF16 fusionados (12 shards, 18,4 GB) y los scripts de entrenamiento, pero no el conjunto de datos de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5 (denso), `Qwen3_5ForConditionalGeneration` con cabeza MTP de 15 claves |
| Parámetros totales | 9.195.119.616 (9,20B) |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (contexto del modelo base; el entrenamiento usó MAX_SEQ 4096) |
| Tipos de cuantización | QLoRA 4-bit para entrenamiento; GGUF ROCmFPX publicado en repo complementario; pesos BF16 fusionados |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16, 12 shards, 18,4 GB); GGUF en repo complementario |
| Vocabulario | 248.079 tokens (248.077 base + 2 tokens de herramienta: `<|tool_call|>`, `<|tool_response|>`) |
| Modelo base | empero-ai/Qwen3.8-9B-Distill |
| Torre visual | eliminada (modelo solo texto) |

## Arquitectura y entrenamiento

El modelo parte de una arquitectura transformer híbrida de Qwen3.5 en configuración densa de 9B parámetros, con una cabeza de predicción multi-token (MTP) de 15 claves que se preserva en la fusión. El ajuste se realizó con QLoRA en 4 bits, rango 16, alpha 16, dropout 0, sobre las proyecciones q/k/v/o/gate/up/down, con learning rate 2e-4, batch efectivo de 8 (batch 1 × acumulación de gradiente 8), MAX_SEQ 4096, warmup 0,1 y 2 épocas planificadas (246 pasos). Solo el 0,32 % de los parámetros fueron entrenables, con embeddings congelados.

Los datos de entrenamiento son 979 conversaciones en formato ShareGPT: 933 trayectorias reales de agente Hermes (sesiones multi-turno con resultados de ejecución de herramientas, media de 12 turnos, máximo 35) y 46 filas de relleno para cubrir secuencias dispersas. El entrenamiento se detuvo en el paso 213 de 246; los pesos publicados son la fusión del checkpoint 200. La innovación principal no es arquitectónica sino de datos: el uso de trayectorias reales con resultados de ejecución frente a datos sintéticos. La corrección posterior del autor indica que la capacidad realmente aprendida es la planificación "todo-first" en tareas multi-paso, no la llamada a herramientas básica, que el modelo base ya realizaba correctamente por la ruta nativa.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Llamada a funciones y herramientas (function calling / tool calling), con tokens dedicados `<|tool_call|>` y `<|tool_response|>`.
- Planificación "todo-first": descomposición de tareas multi-paso con una llamada inicial a una herramienta de lista de tareas. Esta es la capacidad que el ajuste fino añade de forma medible (3/10 en el base, 8/10 en este checkpoint, 10/10 en el reintento limpio armB2).
- Razonamiento multi-paso dentro de sesiones de agente con resultados de herramientas intercalados.
- Contexto largo de hasta 262.144 tokens (heredado del base), aunque el entrenamiento se limitó a 4.096.
- Capacidad multimodal de imagen a texto declarada en los tags del repositorio, pero la torre visual fue eliminada en la fusión: el modelo es solo texto.
- No dispone de modo de pensamiento explícito ni capacidades de audio documentadas.

## Casos de uso

- Investigación sobre comportamiento de tool calling: el modelo sirve como artefacto de estudio para medir cómo el SFT altera la planificación y la contención en llamadas a herramientas, con scripts de reproducción incluidos (`scripts/native_battery.py`).
- Agentes de automatización de tareas con planificación previa: en flujos donde conviene que el modelo genere primero una lista de pasos antes de ejecutar herramientas, el ajuste mejora la tasa de planificación inicial frente al base.
- Evaluación comparativa de arneses: útil para reproducir y auditar la discrepancia entre evaluar con esquemas embebidos en el prompt frente a usar el parámetro nativo `tools`, un caso práctico de error metodológico en evaluación de modelos.
- Prototipado de asistentes con contexto largo: los 262.144 tokens del base permiten procesar documentos extensos o historiales de sesión amplios, aunque el ajuste no fue entrenado a esa longitud.
- Generación de trayectorias de agente para destilación: las sesiones multi-turno con resultados de ejecución pueden servir como material de partida para construir conjuntos de datos de entrenamiento propios.
- Docencia y formación en ajuste fino: la publicación de scripts, hiperparámetros y notas de checkpoint (parada al 86 %, pérdida 0,131) ofrece un caso realista de compromisos entre coste de cómputo y ganancia marginal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card incluye una batería propia de 4 herramientas con decodificación greedy sobre la ruta nativa de herramientas:

| Modelo | Tier-1 disparado | Tier-1 name=todo | Tier-2 todo-first | Tier-3 disparado (deseado 0) | Tier-4 disparado (deseado 0) |
|---|---|---|---|---|---|
| Base sin ajuste | 18/20 | 17/20 | 3/10 | 5/10 | 0/10 |
| Este checkpoint (v28 ckpt-175) | 17/20 | 10/20 | 8/10 | 9/10 | 4/10 |
| armB2-175 (reentrenamiento limpio) | 10/20 | 8/20 | 10/10 | 4/10 | 0/10 |

Interpretación: el ajuste mejora la planificación todo-first (de 3/10 a 8/10) pero degrada la contención (sobre-disparo de 5/10 a 9/10) y la precisión en la selección de herramienta (de 17/20 a 10/20). El autor advierte que la sección de evaluación original del README describía el comportamiento en una interfaz sintética y no debe leerse como competencia en la interfaz nativa.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 18,4 GB solo de pesos, más overhead de activaciones y caché KV; en la práctica se recomienda 24 GB o más para contextos moderados.
- Cuantización GGUF ROCmFPX disponible en repo complementario; permite reducir requisitos por debajo de 12 GB según el nivel de cuantización elegido.
- GPU recomendadas: A100 40/80 GB, H100 para despliegues con contexto largo; RTX 4090 (24 GB) viable en BF16 con contexto limitado o en cuantización.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en cuantización o BF16 con contexto corto; en tarjetas de 16 GB requiere cuantización agresiva.
- Opciones de despliegue: transformers (librería declarada), llama.cpp/Ollama con el GGUF complementario, vLLM y TGI compatibles con arquitectura Qwen3.5 (verificar soporte de la cabeza MTP y del vocabulario extendido).
- Latencia y throughput: no disponibles en la información proporcionada. La reproducción de la batería de evaluación recomienda `CTX=65536` para coincidir con la configuración de servicio del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3.8-9B Hermes FC) | 9,20B densos | 262.144 (entrenado a 4.096) | SFT QLoRA sobre trayectorias reales de agente | Apache-2.0 | Pesos BF16 + GGUF complementario |
| empero-ai/Qwen3.8-9B-Distill (base) | 9,20B densos | 262.144 | Destilación de Qwen3.5, tool calling nativo | Apache-2.0 | Pesos públicos |
| armB2-175 (reentrenamiento limpio del autor) | 9,20B densos | 262.144 | SFT con datos generados por GLM-5.3-Flash | Apache-2.0 | No confirmada en la información disponible |
| Alternativas de 9B de propósito general | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es interna a la línea de trabajo del autor: el modelo base obtiene mejor contención y precisión de herramienta, mientras que este checkpoint y armB2 mejoran la planificación todo-first, con armB2 como el mejor equilibrio medido (10/10 en todo-first y 0/10 en deriva sobre trivia).

## Limitaciones y advertencias

- Evaluación independiente incompleta: el autor indica explícitamente que no debe tratarse como modelo validado para ningún comportamiento concreto.
- Regresión de contención: el ajuste incrementa el sobre-disparo de herramientas (de 5/10 a 9/10) y la deriva en consultas triviales (de 0/10 a 4/10), lo que puede provocar llamadas innecesarias en producción.
- Pérdida de precisión en la selección de herramienta: tier-1 name=todo cae de 17/20 a 10/20 respecto al base.
- Entrenamiento incompleto: checkpoint 200 de 246 pasos planificados; el autor consideró marginal la ganancia restante.
- Solo inglés: no hay soporte multilingüe declarado.
- Contexto efectivo limitado por entrenamiento: aunque hereda 262.144 tokens, el ajuste se hizo con MAX_SEQ 4096, por lo que el comportamiento más allá de esa longitud no está validado.
- Torre visual eliminada: pese a los tags de imagen-texto, no procesa imágenes.
- Datos de entrenamiento no publicados: derivan de sesiones privadas del autor, lo que impide auditar la composición y los posibles sesgos.
- Riesgo de alucinación: no cuantificado en la información disponible; como modelo de 9B en tareas de agente, la verificación de resultados de herramientas es responsabilidad del orquestador.
- Uso comercial: la licencia Apache-2.0 lo permite, pero el estado de investigación y la falta de validación desaconsejan su despliegue en producción sin evaluación propia.
- Programa de ajuste fino congelado desde 2026-09-03; el autor usa el modelo base como opción por defecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JamieBradfield/qwen3.8-9b-hermes-fc-real-traces
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-9B-Distill
- Modelo base (referencia alternativa en la model card): https://huggingface.co/Empero/Qwen3.8-9B
- Repositorio de datos del reintento v28: `hermes-fc-v28-data` (referenciado en la model card; URL exacta no disponible)
- Repositorio GGUF complementario: referenciado en la model card; URL exacta no disponible
- Scripts de reproducción: `scripts/native_battery.py`, `scripts/todo_probes.jsonl`, `scripts/no_drift_probes.jsonl` (incluidos en el repositorio del modelo)
- Apoyo al autor: https://ko-fi.com/jamesonbradfield
