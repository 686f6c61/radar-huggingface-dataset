# altslate/JugnuLM-110M-R4a

## Resumen

JugnuLM-110M-R4a es un modelo de lenguaje de tipo *tiny-lm*, desarrollado por altslate (AltSlate Labs), que constituye el escalón R4a de la escalera de ablaciones de la fase 2 del proyecto JugnuLM. Se trata de un modelo base entrenado desde cero, no ajustado por instrucciones, de 109.737.302 parámetros, con arquitectura Qwen3 modificada mediante *value residuals* (una ruta de atención personalizada) y optimizador Muon. Su interés principal no es el rendimiento absoluto, sino metodológico: es el primer intento de destilación de conocimiento dentro de la familia y sirve para validar si la destilación de logits mejora el razonamiento en modelos de escala muy reducida.

El modelo parte del escalón R2 (value residuals + Muon) y le añade destilación offline de logits top-k desde SmolLM2-1.7B como profesor congelado, manteniendo fijos los datos, el optimizador y el *schedule*. La función de pérdida combina entropía cruzada, divergencia KL contra la distribución top-16 del profesor y un término z-loss (α=0,5, τ=2). El resultado es agridulce y deliberadamente documentado: ARC-Easy sube a 56,99 (el mejor de toda la familia, prácticamente empatado con GPT-X2-125M en 57,07), pero la perplejidad en WikiText-2 empeora de 1,932 a 2,178, por lo que el autor no lo mantiene como base de la escalera y remite a un futuro R4b rebalanceado.

Entrenado sobre unos 8.400 millones de tokens de FineWeb-Edu, con tokenizador SmolLM2 (49.152 entradas) y en inglés exclusivamente, es un artefacto de investigación orientado a estudiar palancas de entrenamiento (destilación, optimizadores, rutas de atención), no a producción. Su relevancia actual radica en que documenta de forma cuantitativa el compromiso entre imitar la distribución suavizada del profesor y mantener una predicción nítida del siguiente token en el régimen de los 100M de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Qwen3 con *value residuals* (ruta de atención personalizada); RoPE, SwiGLU, RMSNorm, QK-Norm, embeddings atados, GQA 9/3, 23 capas × 576 |
| Parametros totales | 109.737.302 (≈110M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card (pesos publicados en safetensors, presumiblemente bf16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura es idéntica a la del escalón R2: un transformer decoder-only basado en Qwen3 con 23 capas y dimensión oculta 576, atención con query grouping 9/3 (nueve cabezas de consulta y tres de clave/valor), RoPE, activación SwiGLU, RMSNorm, QK-Norm y embeddings atados. La innovación estructural son los *value residuals*, una ruta de atención adicional que no forma parte del grafo estándar de Qwen3 y que obliga a cargar el modelo con código remoto: si se instancia como un Qwen3 convencional, esos caminos se descartan silenciosamente. El tokenizador es el de SmolLM2, con vocabulario de 49.152 entradas, y se aplica un z-loss de 1e-4.

Respecto al entrenamiento, el modelo se entrena desde cero sobre aproximadamente 8.400 millones de tokens de FineWeb-Edu, con batch global de unos 0,5 millones de tokens, precisión bf16 y DDP sobre 4 GPU RTX PRO 4500 Blackwell. El optimizador es Muon (pico 2e-2) combinado con AdamW (1,5e-3) sobre un *schedule* coseno compartido. La innovación de esta variante es la destilación: SmolLM2-1.7B (base), que comparte tokenizador con el alumno, se ejecuta offline sobre unos 6.000 millones de tokens de FineWeb-Edu almacenando sus 16 logits más probables por posición. La pérdida resultante es `α·CE + (1−α)·τ²·KL(student ‖ teacher_top16) + z-loss`, con α=0,5 y τ=2, configuración que el propio autor califica de excesivamente cargada hacia la destilación (el término KL pesa aproximadamente cuatro veces más que la pérdida de etiquetas duras).

## Capacidades

- Generación de texto en inglés: modelo base de continuación de texto, sin ajuste por instrucciones ni plantilla de chat.
- Razonamiento de sentido común a escala diminuta: obtiene 56,99 en ARC-Easy, el mejor resultado de la familia JugnuLM y casi idéntico al de GPT-X2-125M (57,07).
- Conocimiento gramatical: 80,39 en BLiMP, en la línea del escalón R2 (80,78).
- Predicción del siguiente token: perplejidad de 2,178 en WikiText-2 (peor que la de R2, 1,932, precisamente por el peso de la destilación).
- No dispone de soporte documentado de *tool calling*, *function calling* ni uso como agente.
- No dispone de capacidades multimodales (visión o audio) ni de modo de razonamiento explícito (*thinking mode*).
- Multilingüismo: únicamente inglés declarado en la model card.
- Capacidad especial: sirve como objeto de estudio de *value residuals* y de destilación de logits con profesor de mayor tamaño y tokenizador compartido.

## Casos de uso

- Investigación en destilación de conocimiento: el modelo existe precisamente para medir el efecto de la KL top-16 contra un profesor de 1,7B sobre un alumno de 110M; se usaría como punto de comparación de la curva α/τ frente a R4b (α=0,7, τ=1).
- Estudio de rutas de atención alternativas: los *value residuals* permiten analizar si una ruta de atención adicional aporta ganancias medibles frente al mismo modelo sin ella, siempre cargando con código remoto.
- Docencia y prototipado educativo: con 110M de parámetros y 0,2 GB de repositorio, se puede descargar, inspeccionar y ejecutar en un portátil para explicar cómo se entrena y evalúa un transformer pequeño.
- Evaluación comparativa de optimizadores: al compartir datos y *schedule* con otros escalones, sirve de sujeto experimental para aislar el efecto de Muon + AdamW frente a alternativas.
- Generación de texto de bajo coste en CPU o equipos sin GPU: por tamaño, es viable en entornos con memoria muy limitada, aunque con la calidad esperable de un modelo base de 110M.
- Reproducción de benchmarks con EleutherAI `lm-evaluation-harness`: el autor publica las métricas obtenidas con ese harness, por lo que el modelo es útil como referencia reproducible de un *baseline* de 110M.
- Punto de partida para *fine-tuning* experimental: admite ajuste posterior en tareas concretas de inglés, siempre que se respete la carga con código remoto y se asuma que no está alineado por instrucciones.
- Estudio del compromiso perplejidad/razonamiento: como caso documentado de un ajuste que mejora ARC-Easy a costa de perplejidad, es útil para diseñar políticas de ponderación de pérdidas.

## Benchmarks y rendimiento

Datos publicados en la model card, evaluados con EleutherAI `lm-evaluation-harness`:

| Modelo (escalón 110M) | BLiMP ↑ | ARC-Easy ↑ | WikiText-2 byte-ppl ↓ |
|---|---|---|---|
| R2 — value residuals + Muon | 80,78 | 56,10 | 1,932 |
| R4a — + logit KD (α=0,5, τ=2) | 80,39 | 56,99 | 2,178 |
| GPT-X2-125M (referencia citada) | no disponible | 57,07 | no disponible |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks adicionales. El autor señala que, en la puntuación mixta de eficiencia de la tabla de clasificación utilizada, el retroceso en perplejidad supera la ganancia en ARC, motivo por el cual R4a no se conserva como base de la escalera.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, en torno a 0,25-0,3 GB de pesos (110M de parámetros); en fp32, unos 0,45 GB; cuantizado a int8, aproximadamente 0,12 GB, y a int4, alrededor de 0,06 GB. Estas cifras son estimaciones a partir del recuento real de parámetros, ya que la model card no publica medidas de consumo.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; el modelo cabe holgadamente en RTX 3060, RTX 4090, A100 o H100. Para entrenamiento, el autor usó 4× RTX PRO 4500 Blackwell con DDP.
- GPU de consumo: sí, cabe en cualquier GPU de consumo e incluso en iGPU con memoria unificada suficiente.
- CPU: es viable la inferencia en CPU por el tamaño del modelo, aunque no hay cifras publicadas de latencia.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía documentada. vLLM, TGI, llama.cpp u Ollama no están confirmados para esta arquitectura; cualquier conversión a GGUF requeriría portar la ruta de *value residuals*, ya que el grafo no es un Qwen3 estándar.
- Latencia y throughput estimados: no disponible. El autor no publica métricas de velocidad de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ARC-Easy | WikiText-2 ppl | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| JugnuLM-110M-R4a | 109,7M | no disponible | 56,99 | 2,178 | apache-2.0 | HuggingFace (requiere `trust_remote_code`) |
| JugnuLM-110M-R2 | ≈110M (misma arquitectura) | no disponible | 56,10 | 1,932 | no disponible en la informacion proporcionada | HuggingFace |
| GPT-X2-125M | 125M (citado) | no disponible | 57,07 | no disponible | no disponible | citado como referencia comparativa en la model card |
| SmolLM2-1.7B | 1,7B (profesor) | no disponible | no disponible | no disponible | no disponible | HuggingFace; usado como profesor congelado |

La comparación con GPT-X2-125M y con el profesor SmolLM2-1.7B procede exclusivamente de las referencias incluidas en la model card; no se dispone de una batería homogénea de métricas para los cuatro modelos.

## Limitaciones y advertencias

- Modelo base, no ajustado por instrucciones: no responde a órdenes ni mantiene formatos de chat; el autor indica explícitamente que no es apto para producción.
- Perplejidad degradada: 2,178 frente a 1,932 del escalón R2, consecuencia directa del peso excesivo del término de destilación (α=0,5, τ=2).
- Repeticiones ocasionales en la generación, reconocidas por el autor.
- Solo inglés: no hay soporte multilingüe declarado y el entrenamiento se limita a FineWeb-Edu en inglés.
- Riesgo de alucinación: al ser un modelo de 110M entrenado sobre corpus web filtrado, la generación de hechos incorrectos es esperable; no se documentan tasas de alucinación.
- Sesgos: no se publica ninguna evaluación de sesgos, toxicidad o fairness; los sesgos heredados de FineWeb-Edu y del profesor no están caracterizados.
- Carga no estándar: es imprescindible `trust_remote_code=True`; instanciarlo como Qwen3 convencional descarta las rutas de *value residuals* sin aviso, lo que invalida cualquier comparación.
- Licencia apache-2.0: permite uso comercial del artefacto, pero el modelo no está validado para ello y los pesos del profesor (SmolLM2-1.7B) solo intervienen en forma de logits precalculados, no como pesos redistribuidos.
- Longitud de contexto, tipos de cuantización oficiales, latencia y consumo no están documentados, lo que dificulta planificar un despliegue real.
- Los resultados de benchmarks provienen del propio autor y de un único harness, sin replicación independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/altslate/JugnuLM-110M-R4a
- Escalón base R2: https://huggingface.co/altslate/JugnuLM-110M-R2
- Profesor de destilación SmolLM2-1.7B: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B
- Código de entrenamiento y escalera de ablaciones: https://github.com/AltSlate-Labs/jugnu
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Harness de evaluación citado por el autor: EleutherAI `lm-evaluation-harness` (no se proporciona URL en la model card)
- La busqueda web no ha devuelto enlaces adicionales relevantes sobre este modelo.
