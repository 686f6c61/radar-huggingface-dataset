# efebaykara/LFM3-1.7B-Gundem-LoRA

## Resumen

LFM3-1.7B-Gundem-LoRA es un adaptador LoRA desarrollado por el usuario efebaykara sobre el modelo base LiquidAI/LFM3-1.7B, orientado a la clasificación de titulares de noticias en turco. No se trata de un checkpoint completo ni de un asistente conversacional general: es una adaptación específica de dominio que recibe un titular y devuelve una estructura con etiquetas temáticas, tipo de evento y tres puntuaciones enteras de impacto, gravedad y urgencia en una escala de 0 a 3.

El adaptador se entrenó mediante destilación de respuestas (response distillation) usando respuestas generadas por DeepSeek como etiquetas del profesor, aplicando supervisión únicamente sobre los turnos del asistente. El conjunto de datos es reducido (825 ejemplos de entrenamiento, 107 de validación y 101 de prueba) y el modelo no redistribuye ni los titulares originales ni las respuestas del profesor.

Su relevancia es acotada pero concreta: demuestra un flujo completo de adaptación LoRA sobre un modelo pequeño de LiquidAI para una tarea de clasificación estructurada en turco, con evaluación publicada, artefacto GGUF cuantizado para despliegue en llama.cpp o LM Studio, y un motor nativo orientado a dispositivos móviles. La licencia LFM Open License v1.0 del modelo base impone condiciones específicas para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LiquidAI/LFM3-1.7B); adaptador LoRA con r=16 y alpha=32 |
| Parametros totales | 1.728.801.600 (checkpoint base); el adaptador LoRA no altera el recuento del estudiante |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (max_length de entrenamiento: 512 tokens) |
| Tipos de cuantizacion | GGUF Q4_K_M publicado; el adaptador se evalua en BF16 |
| Idiomas soportados | Turco (tr) |
| Licencia | LFM Open License v1.0 (lfm1.0); el codigo auxiliar Gundem es MIT |
| Formato de pesos | safetensors (adaptador PEFT) y GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre LiquidAI/LFM3-1.7B, un transformer de 1.700 millones de parámetros aproximadamente, fijado a la revisión `ac2586a34f1a1c03329dbdcdefabd8b6478ddaa7`. El entrenamiento emplea LoRA con rango 16 y alpha 32, acumulación de gradientes de 8 pasos, longitud máxima de 512 tokens, tasa de aprendizaje 0,0002, tres épocas y semilla 42. La supervisión se aplica solo a los turnos del asistente, con pérdida calculada exclusivamente sobre las respuestas destiladas.

La innovación metodológica es la destilación de respuestas: se generaron etiquetas con DeepSeek y se usaron como objetivo de entrenamiento, sin emplear pesos ni logits del modelo profesor. El estudiante mantiene su recuento de parámetros original. El proceso de inferencia incluido fusiona el adaptador en fp32 sobre CPU y ejecuta la inferencia en BF16 sobre CUDA; el cargador gestiona la compatibilidad de arquitectura y la plantilla exacta de la tarea. No se emplea gramática JSON para restringir la generación, por lo que la salida puede contener errores explícitos.

## Capacidades

- Clasificación de titulares de noticias en turco: devuelve `etiketler` (temas), `tur` (tipo de evento) y las puntuaciones enteras `etki`, `ciddiyet` y `aciliyet` en rango 0-3.
- Generación de texto estructurado condicionada por una plantilla de tarea y un fichero de sistema (`student-system.txt`).
- Salida con campo `prediction` o un campo `error` explícito cuando la generación falla.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- Capacidad multilingüe limitada al turco; no se documentan otras lenguas.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Clasificación temática de titulares en un agregador de noticias turco: el adaptador asigna etiquetas de tema con una micro-F1 de 87,4 % sobre el conjunto de prueba, lo que permite enrutar titulares hacia secciones (política, economía, sucesos) de forma automática.
- Priorización de alertas en una redacción: las puntuaciones de urgencia, gravedad e impacto permiten ordenar la cola de titulares entrantes y destacar los eventos de mayor criticidad para revisión humana.
- Etiquetado de tipo de evento para analítica editorial: la precisión de tipo del 84,2 % facilita agregaciones por categoría de suceso en paneles de seguimiento de actualidad.
- Enriquecimiento de un pipeline de monitorización de medios: cada titular se procesa con un máximo de 160 tokens nuevos y lote de 4, lo que permite clasificar lotes de titulares en GPU con BF16.
- Despliegue en movilidad: el artefacto GGUF Q4_K_M permite ejecutar el modelo en llama.cpp o LM Studio en dispositivos con recursos limitados; el autor probó el par original/destilado con su motor nativo Gündem.
- Filtrado previo a moderación o curación: la detección de temas y la puntuación de gravedad sirven como primera pasada para marcar titulares que requieren revisión editorial, siempre con inspección humana de las predicciones.

## Benchmarks y rendimiento

Evaluación del adaptador HF en CUDA BF16, decodificación greedy, lote de 4, máximo 160 tokens nuevos y sin gramática JSON, sobre el conjunto de prueba de 101 ejemplos.

| Metrica | Valor |
|---|---:|
| Gündem Score v1 | 77,9 / 100 |
| Exact match en todos los campos | 36,6 % |
| Micro-F1 de temas | 87,4 % |
| Precisión de tipo | 84,2 % |
| Salidas inválidas | 0 / 101 |

El Gündem Score v1 se define como 30 × F1 de temas + 20 × precisión de tipo + 30 × (1 − MAE medio de puntuaciones / 3) + 20 × exact match, con métricas fraccionarias. Mide la concordancia con las etiquetas del profesor en esta tarea concreta, no la inteligencia general del modelo ni un porcentaje de acierto global. El autor advierte que diferencias pequeñas en esta prueba de una sola semilla no establecen superioridad, y que el tamaño de lote y los cambios numéricos del runtime pueden alterar las salidas. Las métricas corresponden al adaptador en BF16, no al artefacto GGUF cuantizado.

Comparación de variantes GGUF móviles publicada por el autor (puntuación obtenida en el experimento HF/BF16, no re-evaluada en móvil):

| Variante | GGUF | Gündem Score v1 (HF/BF16) |
|---|---|---:|
| original | lfm3-posttrained-original-Q4_K_M.gguf | 0,0 |
| destilado | lfm3-posttrained-distilled-Q4_K_M.gguf | 77,9 |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 3,5 GB solo para pesos (1.728.801.600 parámetros × 2 bytes), más memoria para el contexto y el lote; el autor indica que se reserve RAM de CPU para la fusión del adaptador en fp32 sobre el modelo base completo.
- El adaptador LoRA en sí ocupa una fracción pequeña del repositorio de 2,3 GB, que incluye además los artefactos GGUF.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para BF16 con contexto de 512 tokens; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes.
- Cabe en GPU de consumo: sí, en modelos con 6 GB o más de VRAM en BF16; en Q4_K_M el requisito baja a aproximadamente 1-1,5 GB, apto para dispositivos móviles.
- Opciones de despliegue: script `release_infer.py` incluido (PyTorch CUDA), llama.cpp y LM Studio mediante el GGUF Q4_K_M, y el motor nativo Gündem del autor para móvil.
- Latencia y throughput: no disponibles; la evaluación usó lote de 4 y un máximo de 160 tokens nuevos por ejemplo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-Gundem-LoRA | 1.728.801.600 (base) | no disponible (entrenamiento 512) | Clasificación de titulares en turco | LFM Open License v1.0 | HuggingFace, GGUF |
| LiquidAI/LFM3-1.7B (base) | 1.728.801.600 | no disponible | Modelo de propósito general | LFM Open License v1.0 | HuggingFace |
| Modelos de clasificación de noticias en turco | no disponible | no disponible | Clasificación de titulares | variable | no disponible |

No se dispone de datos de benchmarks de alternativas comparables en la información proporcionada; la comparación se limita al modelo base y a la variante original sin destilar del propio autor.

## Limitaciones y advertencias

- Conjunto de datos pequeño y específico de dominio: 825 ejemplos de entrenamiento y 101 de prueba; el autor recomienda inspeccionar las predicciones antes de confiar en ellas.
- No es un asistente conversacional general ni un checkpoint completo; requiere el modelo base fijado a una revisión concreta.
- La generación no está restringida por gramática JSON, por lo que pueden aparecer salidas inválidas o errores explícitos.
- El exact match en todos los campos es del 36,6 %, lo que indica que la salida estructurada completa falla con frecuencia aunque las métricas parciales sean altas.
- Evaluación de una sola semilla; diferencias pequeñas no son concluyentes y el tamaño de lote o los cambios numéricos del runtime afectan a las salidas.
- Las métricas no se han recalculado para el artefacto GGUF Q4_K_M; su calidad en móvil no está verificada con la misma puntuación.
- No se redistribuyen los titulares originales, las respuestas del profesor ni el conjunto de datos completo.
- La licencia LFM Open License v1.0 incluye condiciones específicas para uso comercial; el código auxiliar Gündem es MIT, pero la licencia del modelo es independiente.
- Cargar el modelo base ejecuta código remoto del mismo; debe revisarse antes de su uso.
- Riesgo de sesgo y alucinación no cuantificado en la model card; el ámbito lingüístico se limita al turco.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/efebaykara/LFM3-1.7B-Gundem-LoRA
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Herramientas de entrenamiento y benchmark: https://github.com/efebaykaraa/gundem-llms
- Modelos publicados: https://github.com/efebaykaraa/gundem-llms/releases/tag/models-v1.0.0
