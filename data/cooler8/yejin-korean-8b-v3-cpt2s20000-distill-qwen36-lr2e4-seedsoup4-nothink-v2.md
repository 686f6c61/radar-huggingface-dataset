# cooler8/yejin-korean-8b-v3-cpt2s20000-distill-qwen36-lr2e4-seedsoup4-nothink-v2

## Resumen

Yejin Korean 8B v3 es un modelo de lenguaje de 7.241.740.288 parámetros (aproximadamente 7,24 mil millones) especializado en instrucciones en coreano, desarrollado por el usuario independiente cooler8 bajo la familia "Yejin". Se construye sobre `cooler8/yejin-korean-8b-v3-base`, un modelo entrenado desde cero y sometido a dos fases de preentrenamiento continuado sobre datos públicos en coreano. Esta versión concreta aplica un "model soup" (promedio uniforme de pesos) sobre cuatro ajustes LoRA de rango 64 que solo difieren en el orden de los datos, e incorpora una destilación a nivel de secuencia desde Qwen3.6-27B.

El modelo resuelve el problema de obtener un asistente conversacional competente en coreano a partir de una base propia, sin depender de pesos de un modelo mayor en producción. La destilación se limita a soluciones textuales verificadas (no se usan logits ni pesos del profesor), lo que reduce el coste computacional del ajuste fino y permite publicar el resultado bajo licencia Apache 2.0. La arquitectura declarada es Qwen3 (transformer denso), con plantilla de chat propia que fuerza un bloque `<think> </think>` vacío para desactivar el razonamiento extendido.

Su relevancia actual radica en tres factores: es un modelo pequeño (7,2B) que cabe en GPUs de consumo con cuantización, está especializado en un idioma con poca cobertura en modelos abiertos (coreano), y publica pesos en safetensors con licencia permisiva. No obstante, la información pública es escasa: no se documentan benchmarks, longitud de contexto ni detalles de tokenizador más allá de lo indicado en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3, según tag `qwen3`) |
| Parámetros totales | 7.241.740.288 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible en la model card; compatible con cuantización estándar (GGUF/AWQ/GPTQ) por ser safetensors de transformer denso, pero no se documenta |
| Idiomas soportados | Coreano (`ko`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 29,0 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 7,24B parámetros etiquetado como `qwen3`, lo que sugiere que reutiliza la arquitectura de la familia Qwen3 (atención con RoPE, capas de atención y MLP estándar). No se documenta si incorpora innovaciones como atención lineal, decodificación especulativa o modos de razonamiento nativos; de hecho, la plantilla de chat inserta un bloque `<think> </think>` vacío, lo que indica que el modo "thinking" está desactivado de forma explícita en esta variante (`nothink-v2`).

El entrenamiento se estructura en varias fases. Primero, un preentrenamiento desde cero sobre el modelo base `yejin-korean-8b-v3-base`, seguido de dos etapas de preentrenamiento continuado sobre datos públicos en coreano: 6.000 pasos en la etapa 1 y 20.000 pasos en la etapa 2, que incluye texto coreano de FinePDFs parcialmente extraído con el modelo OCR RolmOCR. Después se aplica el "chat vector" del modelo SFT propio del autor. Sobre esa base se realizan cuatro ajustes LoRA (rango 64, learning rate 2e-4) que solo difieren en el orden de los datos, y se promedian uniformemente (model soup). Los datos de LoRA combinan 45.013 muestras del formato de fase 1 con 39.290 soluciones cortas en coreano generadas por Qwen3.6-27B (Apache 2.0) para preguntas de un generador de puzles propio, KMMLU train, exámenes escolares de AI Hub y comprensión lectora de AI Hub. Solo se conservaron las soluciones que alcanzaban la respuesta conocida (destilación a nivel de secuencia, sin pesos ni logits del profesor). El autor declara que no se usaron ítems de test de benchmarks y que los datos de entrenamiento no comparten ningún 13-grama con KMMLU-Pro, KMMLU test, CLIcK, MuSR ni Korean MuSR.

## Capacidades

- Generación de texto conversacional en coreano con plantilla de chat propia (`<|user|>`, `<|assistant|>`, `<|end|>`).
- Seguimiento de instrucciones en coreano, entrenado explícitamente para ello ("Korean instruction-following language model").
- Razonamiento y resolución de problemas tipo puzle y comprensión lectora, derivados de los datos de destilación (generador de puzles, exámenes escolares, comprensión lectora).
- Conocimiento factual coreano, reforzado por las dos fases de preentrenamiento continuado sobre datos públicos coreanos y por KMMLU train.
- Modo "no thinking": la plantilla inserta `<think> </think>` vacío, por lo que no se activa razonamiento extendido en la generación.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso más allá de la resolución de problemas descrita.
- No se documenta capacidad de visión ni audio.
- Capacidad multilingüe: no disponible; el modelo declara únicamente coreano (`ko`).

## Casos de uso

- Asistente conversacional en coreano para atención al cliente: el modelo gestiona diálogos multi-turno con la plantilla de chat propia y responde en coreano de forma consistente, adecuado para productos dirigidos al mercado surcoreano donde no se requiere tool calling.
- Generación de respuestas educativas: entrenado con exámenes escolares y comprensión lectora de AI Hub, puede emplearse para resolver preguntas de nivel académico y explicar soluciones en coreano, con la salvedad de que no se han publicado evaluaciones formales.
- Tutor de idioma coreano: al ser un modelo especializado en coreano con instrucciones, sirve para practicar conversación, corregir textos y explicar gramática, aunque sin garantías de precisión factual.
- Procesamiento de documentos coreanos: la inclusión de FinePDFs coreano extraído por OCR en el preentrenamiento continuado lo hace apto para tareas de resumen o extracción sobre texto coreano, siempre con verificación humana.
- Prototipado e investigación en NLP coreano: su tamaño de 7,24B y licencia Apache 2.0 permiten desplegarlo en entornos de investigación y ajustarlo con LoRA sin restricciones de uso comercial.
- Generación de contenido localizado: redacción de textos, correos y publicaciones en coreano con un tono controlable mediante la plantilla de chat, útil para equipos de marketing o soporte que necesitan contenido nativo.
- Evaluación comparativa de destilación: sirve como caso de estudio de destilación a nivel de secuencia desde un modelo mayor (Qwen3.6-27B) a un modelo pequeño, útil para investigadores que estudian técnicas de compresión de conocimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, KMMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y el autor solo declara que no se usaron ítems de test de KMMLU-Pro, KMMLU test, CLIcK, MuSR ni Korean MuSR en el entrenamiento, sin aportar resultados sobre ellos.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 14,5 GB solo para pesos (7,24B × 2 bytes), más overhead de activaciones y caché KV; en la práctica, alrededor de 16-18 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: aproximadamente 7-8 GB; en 4 bits: aproximadamente 4-5 GB (estimaciones por tamaño, no publicadas por el autor).
- GPU recomendadas: A100 40GB, H100 80GB o L40S para bfloat16 sin cuantizar con contexto largo; RTX 4090 (24 GB) para bfloat16 con contexto moderado o 8 bits con contexto amplio.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bfloat16 o 8 bits, y en RTX 3090/4080 (16 GB) con cuantización de 8 o 4 bits; en GPUs de 8 GB solo con cuantización de 4 bits y contexto reducido.
- Opciones de despliegue: transformers (según el ejemplo de la model card), y por ser un transformer denso en safetensors es compatible con vLLM, TGI y llama.cpp/Ollama previa conversión a GGUF; el autor no documenta ninguna de estas integraciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Yejin Korean 8B v3 (este) | 7,24B | No disponible | Apache 2.0 | Coreano | Destilado de Qwen3.6-27B, sin benchmarks publicados |
| Qwen3.6-27B (profesor) | 27B (no confirmado en la información) | No disponible | Apache 2.0 | Multilingüe (no confirmado) | Modelo mayor usado para generar soluciones de destilación |
| Yejin Korean 8B v3 base | ~7,24B (no confirmado) | No disponible | Apache 2.0 (según repo base, no confirmado) | Coreano | Modelo base antes de LoRA y soup |

No se dispone de datos de benchmarks ni de contexto para establecer una comparación cuantitativa con alternativas de la misma categoría (modelos coreanos de ~7-8B). La comparativa se limita a parámetros, licencia e idioma declarados.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad, lo que impide validar afirmaciones de rendimiento frente a alternativas.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en conversaciones o documentos largos.
- Especialización monolingüe: solo declara coreano; el rendimiento en castellano, inglés u otros idiomas no está evaluado y probablemente sea deficiente.
- Riesgo de alucinación: al ser un modelo de 7,24B destilado y sin evaluaciones, puede generar información factual incorrecta, especialmente en dominios no cubiertos por los datos de entrenamiento.
- Sesgos: no se documenta ningún análisis de sesgos; los datos provienen de fuentes públicas coreanas, AI Hub y generación sintética de Qwen3.6-27B, lo que puede introducir sesgos de esas fuentes.
- Dependencia de datos sintéticos: 39.290 soluciones fueron generadas por Qwen3.6-27B, por lo que los errores o sesgos del profesor pueden haberse transferido al estudiante.
- Modo "no thinking" forzado: la plantilla inserta `<think> </think>` vacío, lo que limita el razonamiento extendido en tareas complejas.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar el cumplimiento de las licencias de los datos de origen (AI Hub, FinePDFs) que el autor no detalla.
- Modelo de autor independiente con 289 descargas y 0 likes: sin comunidad de validación ni soporte; el mantenimiento y la reproducibilidad no están garantizados.
- No se documenta tokenizador, vocabulario ni límites de truncado, lo que complica la integración en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cooler8/yejin-korean-8b-v3-cpt2s20000-distill-qwen36-lr2e4-seedsoup4-nothink-v2
- Modelo base: https://huggingface.co/cooler8/yejin-korean-8b-v3-base
- Modelo profesor (Qwen3.6-27B): no se proporciona enlace directo en la información disponible; referencia a Qwen/Qwen3.6-27B (Apache-2.0)
- Paper, blog o repositorio adicional: no disponible en la información proporcionada
