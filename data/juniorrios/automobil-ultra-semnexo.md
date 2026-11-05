# juniorrios/automobil-ultra-semnexo

## Resumen

automobil-ultra-semnexo es un ajuste fino del modelo base LiquidAI/LFM3-1.7B, desarrollado por el usuario juniorrios, orientado a la consulta offline de Normas Regulamentadoras (NR) brasileñas de seguridad en el trabajo. El modelo responde preguntas formuladas en portugués de Brasil citando el artículo concreto de la norma correspondiente, apoyándose en un pipeline de recuperación aumentada (RAG) que le entrega fragmentos relevantes mediante una herramienta `buscar_norma`. Su relevancia radica en que demuestra un caso de uso vertical muy específico (seguridad laboral) ejecutable en un teléfono móvil sin conexión.

El modelo conserva la arquitectura del LFM3-1.7B original (transformer híbrido con convoluciones y atención, según la familia Liquid Foundation Models) y ha sido adaptado mediante dos etapas de LoRA r=32 sobre los módulos MLP, fusionadas posteriormente en los pesos finales. El resultado es un modelo de 1.728.801.536 parámetros con una ventana de contexto no especificada en la información disponible, distribuido en safetensors bf16 y GGUF Q4_0.

La ficha se basa exclusivamente en la model card publicada y en los metadatos de HuggingFace. Los datos de rendimiento proceden de evaluaciones internas del autor con un juez Qwen 27B, no de benchmarks estándar de la comunidad, por lo que deben interpretarse como indicadores del caso de uso concreto y no como comparaciones absolutas con otros modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer LFM3 (modelo base LiquidAI/LFM3-1.7B), con código de modelado propio (`modeling_lfm3.py`, `lfm3_conv.py`) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la model card indica ~1.100 tokens de prompt y ~450 tokens de contexto recuperado en su pipeline, pero no declara el máximo) |
| Tipos de cuantizacion | bf16 (safetensors) y GGUF Q4_0 |
| Idiomas soportados | portugués de Brasil (pt) |
| Licencia | LFM Open License v1.0 (lfm1.0), con límite de ingresos de 10 millones USD anuales para uso comercial |
| Formato de pesos | safetensors (bf16) y GGUF (Q4_0) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B en su variante instruct y aplica dos etapas de ajuste LoRA con rango 32 sobre los módulos MLP (w1, w2, w3; 72 módulos en total), con SFT de chat y `assistant_only_loss`. La primera etapa (F3b, `data2x-ep4`) entrena el uso robusto de contexto recuperado: fragmentos correctos, distractores y rechazo cuando el fragmento no responde, durante 4 épocas. La segunda (F4, `f4-r32-ep2`) entrena el uso de herramientas multiturno en el formato XML nativo de LFM3, con 4.624 diálogos sintéticos en seis familias (decidir buscar o no, reutilizar contexto, cambiar de NR, multihop), durante 2 épocas y checkpoint-284. Ambas etapas se fusionan en los pesos finales.

Los datos de entrenamiento son 100 % sintéticos, generados a partir del texto público de las 36 NR brasileñas y 9 manuales oficiales del MTE, sin datos de clientes ni preguntas de evaluación. El pipeline de inferencia incluido (`inference.py`) es autocontenido e implementa clasificación de NR con TF-IDF + regresión logística, búsqueda híbrida BM25 (SQLite FTS5) más densa con EmbeddingGemma-300M, fusión RRF (k=10), compresión de contexto al 50 % de tokens del top-2 y generación con temperatura 0,1, top_k 50, repetición 1,1 y semilla 42, con el modo thinking desactivado. La búsqueda y la compresión son deterministas e idénticas en las dos vías de LM (GGUF y transformers).

## Capacidades

- Generación de texto en portugués de Brasil con citación explícita de norma y artículo.
- Respuesta basada en contexto recuperado (RAG) con rechazo cuando el fragmento no contiene la respuesta.
- Tool calling en formato XML nativo de LFM3: decisión de buscar o no buscar, reutilización de contexto previo, cambio de norma y consultas encadenadas (multihop, con limitaciones).
- Conversación multiturno orientada a preguntas de seguridad laboral.
- Comprensión de vocabulario operativo de campo (variantes coloquiales y expansión robusta a errores de ASR).
- Ejecución offline en dispositivos móviles mediante GGUF Q4_0 y llama.cpp.
- No dispone de capacidades de visión, audio ni matemáticas avanzadas documentadas.

## Casos de uso

- Asistente de seguridad laboral en campo: un técnico pregunta desde el móvil, sin cobertura, cuándo debe cambiar los bloqueos y etiquetas al cambiar de turno; el modelo recupera el artículo de la NR correspondiente y responde con cita. La ventana de contexto reducida y el GGUF de 1,05 GB permiten ejecutarlo en un teléfono de gama alta.
- Consulta de normativa durante auditorías internas: el equipo de SESMT verifica requisitos concretos de las 36 NR y de los 9 manuales del MTE, obteniendo el fragmento exacto y la referencia normativa para documentar hallazgos.
- Formación de trabajadores: generación de respuestas explicativas con cita para preguntas frecuentes sobre equipos de protección, señalización o procedimientos de trabajo en altura, integradas en una app de onboarding.
- Verificación de procedimientos antes de una tarea crítica: el operario consulta requisitos de bloqueo y etiquetado (LOTO) y el modelo responde solo si la evidencia recuperada cubre la pregunta, rechazando en caso contrario para evitar instrucciones inventadas.
- Integración en pipelines de inspección: el `inference.py` admite modo lote (`--file preguntas.txt`) y salida JSON (`--json`), lo que permite procesar listas de comprobaciones y adjuntar la cita normativa a cada ítem de un informe automatizado.
- Demostración de RAG vertical soberano: sirve como referencia técnica para equipos que quieran construir asistentes offline sobre corpus normativos propios, reutilizando el pipeline de recuperación híbrida y compresión documentado.
- Evaluación de modelos pequeños en entornos con restricciones de conectividad y privacidad: al no requerir red, encaja en escenarios donde los datos de la consulta no pueden salir del dispositivo.

## Benchmarks y rendimiento

Los datos proceden de evaluaciones internas del autor con un juez Qwen 27B y una rúbrica propia (cubre los hechos pedidos, sin alucinar, sin rechazar). No son benchmarks estándar de la comunidad.

| Evaluacion | Resultado |
|---|---|
| Benchmark móvil, recorte 344 (6 NR × 4 vocabularios), pipeline completo | 68,0 % aprobadas (norma 75,9 % · manual 53,3 %); alucinación 13,2 %; rechazo 15,4 % |
| Igual, vocabulario operativo (habla de campo) | 65,1 % (la app anterior obtenía 50,6 %) |
| Igual, cuando la evidencia entra en el contexto | 81–83 % aprobadas |
| 151 preguntas coloquiales largas de la POC | 15,2 % (rechazo ~53 %) |
| Tool calling (F4) | decisión F1 97–98; sintaxis XML 100 %; reutilización 100 %; cambio de NR 98–100 % |
| Multihop extremo a extremo (F4) | 7,1 % |
| GGUF Q4_0 frente a bf16, 20 preguntas operativas | 15/20 frente a 15/20 (sin pérdida medida con Q4) |

Contexto entregado: ~450 tokens; prompt: ~1.100 tokens. En un Galaxy S24+ el TTFT estimado es de ~9,5 s.

## Requisitos de hardware

- VRAM estimada: el GGUF Q4_0 ocupa 1,05 GB en disco y puede ejecutarse con `--n-gpu-layers 99` en GPU; los pesos bf16 requieren aproximadamente 3,5 GB solo para los pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM para Q4_0 (RTX 3060, RTX 4060, RTX 4090); A100 o H100 no son necesarias para este tamaño y solo aportarían throughput en despliegues por lotes.
- Cabe en GPU consumer: sí, en Q4_0 con 4 GB; en bf16 con 8 GB.
- Despliegue: llama.cpp (versión mínima con commit `19cce69`, ya que la 0.3.36 del PyPI no reconoce la arquitectura LFM3), `llama-cpp-python` compilado desde ese commit, y transformers ≥ 5.20 con `trust_remote_code` para la vía bf16. El repositorio incluye `requirements.txt` y `requirements-hf.txt`.
- Latencia y throughput: TTFT estimado de ~9,5 s en Galaxy S24+ con el pipeline completo; no se publican cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| automobil-ultra-semnexo (este modelo) | 1,73 B | no disponible | LFM Open License v1.0 (límite 10 M USD/año) | RAG vertical sobre NR brasileñas, offline | HuggingFace, safetensors + GGUF |
| LiquidAI/LFM3-1.7B | 1,7 B (aprox.) | no disponible | LFM Open License v1.0 | Modelo base generalista instruct | HuggingFace |
| Qwen2.5-1.5B-Instruct | 1,5 B (aprox.) | 32 768 tokens (según documentación pública de Qwen) | Apache 2.0 | Modelo generalista multilingüe | HuggingFace, múltiples formatos |

La comparación con Qwen2.5-1.5B-Instruct se ofrece como referencia de tamaño y licencia; no se dispone de evaluaciones cruzadas entre ambos modelos en la información proporcionada, por lo que no es posible comparar rendimiento de forma directa. El valor diferencial de este modelo no es su rendimiento generalista, sino el ajuste específico al corpus de NR y su pipeline de recuperación asociado.

## Limitaciones y advertencias

- No constituye un dictamen jurídico ni sustituye al SESMT: las respuestas pueden ser erróneas o incompletas y deben contrastarse siempre con el artículo citado de la NR vigente.
- El habla coloquial larga funciona mal: en las 151 preguntas de la POC el acierto cae al 15,2 % con un ~53 % de rechazos, porque el modelo rechaza cuando la pregunta pide acciones o datos fuera del fragmento recuperado.
- El razonamiento multihop es deficiente (7,1 %): la segunda consulta formulada por el modelo de 1,7 B rara vez encuentra el fragmento correcto; el `inference.py` realiza una sola búsqueda por pregunta con el habla cruda.
- Los manuales del MTE solo entran cuando se activa la compuerta densa, lo que reduce su cobertura efectiva (53,3 % de aprobadas en manuales frente a 75,9 % en normas).
- El modelo solo está entrenado y evaluado en portugués de Brasil; no se documenta soporte de otros idiomas.
- Licencia LFM Open License v1.0: el uso comercial está sujeto al límite de ingresos de la Sección 5 (10 millones USD anuales); por encima de ese umbral se requiere licencia adicional de Liquid AI.
- La cuantización Q4_0 no mostró pérdida medible en 20 preguntas operativas, pero la muestra es pequeña y no cubre todos los escenarios.
- Riesgo de alucinación medido del 13,2 % en el benchmark móvil; en producción debe mantenerse la verificación humana de la cita.
- Requiere compilar `llama-cpp-python` desde un commit concreto y transformers ≥ 5.20 con `trust_remote_code`, lo que añade fricción de despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/juniorrios/automobil-ultra-semnexo
- Dataset de assets de recuperación: https://huggingface.co/datasets/juniorrios/cemig-nr-retrieval-assets
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Repositorio de llama.cpp (referencia de la versión mínima): https://github.com/ggerganov/llama.cpp
- No se han encontrado papers, blogs ni demos adicionales en la información proporcionada.
