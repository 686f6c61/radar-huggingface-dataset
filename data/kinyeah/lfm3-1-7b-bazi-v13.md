# kinyeah/lfm3-1.7b-bazi-v13

## Resumen

LFM3-1.7B Bazi v13 es un ajuste fino mediante LoRA del modelo LiquidAI/LFM3-1.7B, desarrollado por el usuario kinyeah y especializado en la interpretación de BaZi (八字, "cuatro pilares"), una disciplina de la astrología china basada en la fecha y hora de nacimiento. El modelo no pretende ser un asistente de propósito general, sino un motor de razonamiento simbólico que sigue un procedimiento fijo de trece pasos para derivar conclusiones sobre fortuna, carácter y eventos a partir de una carta natal expresada en términos de troncos y ramas celestiales.

El modelo parte de la arquitectura LFM3 de LiquidAI, un transformer de aproximadamente 1.728 millones de parámetros con licencia Apache 2.0. El ajuste se realizó con LoRA de rango 64 y alpha 128, entrenando únicamente 13,68 millones de parámetros (0,79% del total) durante una época sobre un conjunto de 5.150 muestras sintéticas y curadas. El resultado se distribuye tanto como adaptador LoRA como en pesos fusionados (merged) en safetensors y cuantización GGUF Q4_K_M.

Su relevancia es acotada pero clara dentro de un nicho muy específico: demuestra que un modelo pequeño de 1.7B puede, mediante datos sintéticos estructurados y un formato de razonamiento rígido, alcanzar un 30% de acierto en el benchmark BaziQA (frente al 25% de la línea base aleatoria), con una tasa de cumplimiento del formato de trece pasos cercana al 99%. Es un caso de estudio de destilación de procedimientos y no un modelo de uso general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer LFM3 (base LiquidAI/LFM3-1.7B) con adaptador LoRA (rank=64, alpha=128) |
| Parámetros totales | 1.728.801.536 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base LFM3-1.7B) |
| Tipos de cuantización | bfloat16 (pesos completos), GGUF Q4_K_M (1,1 GB) |
| Idiomas soportados | no disponible (entrenado principalmente en chino tradicional para la tarea BaZi) |
| Licencia | Apache 2.0 (heredada de LFM3) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer LFM3 de LiquidAI, un modelo de 1.7B parámetros diseñado para generación de texto con soporte nativo de modo "thinking" a través de su plantilla de chat (`enable_thinking=true`). Sobre esta base se aplicó un ajuste fino supervisado con LoRA de rango 64 y alpha 128, congelando el modelo original y entrenando solo 13,68 millones de parámetros adicionales. El entrenamiento se realizó en una única época con precisión bfloat16.

El conjunto de datos es enteramente sintético y curado: 5.000 muestras generadas por el script `bazi_derivation_v13.py` que siguen un procedimiento de trece pasos (incluyendo un paso 8b de juicio de peso y un paso 13 de eventos anuales), más 75 muestras de eventos históricos de 16 personajes famosos extraídas de Wikipedia y cronologías, y 75 pares de pregunta-respuesta construidos sobre esos eventos. No se documenta uso de RLHF ni DPO. La innovación principal es el formato de razonamiento forzado: el modelo debe emitir trece pasos explícitos y terminar siempre con la línea `答案：X` (respuesta: X), lo que permite validación automática y encadenamiento con un motor de reglas externo.

## Capacidades

- Razonamiento simbólico estructurado en trece pasos sobre cartas natales BaZi (cuatro pilares, troncos y ramas, cinco elementos).
- Interpretación de fortuna y carácter (capa 2 del pipeline: razonamiento y juicio de buena/mala suerte) a partir de un diagrama ya calculado.
- Generación de texto conversacional en chino tradicional, con plantilla de chat LFM3 y modo thinking.
- Cumplimiento estricto de formato de salida (tasa de derivación correcta cercana al 99% según el autor).
- Integración con un motor de reglas externo (`bazi_core.py`) para el cálculo del diagrama (capa 1) y con RAG para predicción de eventos (capa 3).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso autónomo: no disponible más allá del formato de trece pasos.
- Capacidades multilingües: no disponible (entrenado en chino tradicional para esta tarea).
- Capacidades especiales: modo thinking nativo, formato de derivación fijo, sin visión ni audio.

## Casos de uso

- Asistente de interpretación BaZi para usuarios finales: el modelo recibe un diagrama ya calculado (cuatro pilares y distribución de cinco elementos) y produce una lectura estructurada en trece pasos con una conclusión explícita, útil para aplicaciones de astrología china que necesitan respuestas consistentes y auditables.
- Validación y enriquecimiento de un motor de reglas: al integrarse como capa 2 entre el cálculo del diagrama (capa 1) y la predicción de eventos (capa 3), el modelo aporta la explicación en lenguaje natural que el motor de reglas no puede generar, manteniendo la trazabilidad del razonamiento.
- Generación de informes personalizados: para plataformas que ofrecen informes de nacimiento, el modelo puede redactar secciones de fortuna, carácter y ciclos anuales a partir de datos estructurados, con formato uniforme y salida verificable.
- Investigación y docencia sobre astrología china: el formato de trece pasos hace explícito el procedimiento de interpretación, lo que permite usarlo como herramienta didáctica o como corpus de referencia para estudiar cómo se estructura una lectura BaZi.
- Prototipado de asistentes de nicho con presupuesto reducido: al ser un modelo de 1.7B con cuantización Q4_K_M de 1,1 GB, puede desplegarse en una GPU de consumo o incluso en CPU para demos y pruebas de concepto sin infraestructura dedicada.
- Análisis de eventos históricos con RAG: los 75 casos históricos y 75 pares QA del entrenamiento permiten construir un sistema de recuperación aumentada que relacione cartas natales con eventos documentados, aunque el autor advierte que la capa 3 requiere apoyo del motor de reglas.
- Filtrado y clasificación de consultas: el modelo puede usarse para reformular o validar preguntas de usuarios antes de pasarlas a un sistema mayor, aprovechando su conocimiento del vocabulario técnico BaZi.

## Benchmarks y rendimiento

| Modelo | BaziQA (200 preguntas, 2021-2025) | BaziQA (40 preguntas, 2021) | Precisión derivación 13 pasos |
|---|---|---|---|
| v13 LoRA (adapter) | 23,5% (macro) | 22,5% | ~99% |
| v13 Merged (HF) | no disponible | 30,0% (12/40) | ~99% |
| v13 GGUF Q4_K_M | pendiente de prueba | pendiente de prueba | pendiente de prueba |

El autor indica que la línea base aleatoria de BaziQA es del 25% y que el objetivo era superarla. Los pesos fusionados alcanzan el 30% en el subconjunto de 40 preguntas de 2021, mientras que el adaptador LoRA se queda en el 22,5%. No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K ni otras pruebas de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 5 y 8 GB según longitud de contexto y lote.
- VRAM estimada en GGUF Q4_K_M: alrededor de 1,1 GB de pesos, por lo que cabe en GPUs de 4 GB o incluso en CPU.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues con concurrencia; cualquier GPU con al menos 8 GB es suficiente para inferencia individual en bfloat16.
- Cabe en GPU de consumo: sí, en modelos como RTX 3060, RTX 4060, RTX 4070 y superiores; en cuantización Q4_K_M también en GPUs de gama baja y en CPU.
- Opciones de despliegue: transformers con `trust_remote_code=True`, llama.cpp con GGUF, y potencialmente vLLM o TGI si se adapta la plantilla de chat; el autor documenta explícitamente transformers y llama.cpp.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B Bazi v13 | 1,73B | no disponible | BaZi (trece pasos) | Apache 2.0 | Hugging Face |
| LiquidAI/LFM3-1.7B (base) | 1,73B | no disponible | Propósito general | Apache 2.0 | Hugging Face |
| Modelos de propósito general de ~1.7B (p. ej. Qwen, Llama) | ~1,5-2B | variable | Propósito general | variable | Hugging Face |

No se dispone de información sobre otros modelos especializados en BaZi con los que comparar directamente. La comparación más relevante es con el modelo base LFM3-1.7B, del que este se diferencia únicamente por el ajuste LoRA y el formato de razonamiento forzado.

## Limitaciones y advertencias

- Formato muy sensible: requiere obligatoriamente la plantilla de chat LFM3 y `enable_thinking=true`; sin ello, la salida no cumple el formato de trece pasos.
- La capa de predicción de eventos (capa 3) es limitada y necesita un motor de reglas y RAG de apoyo; el modelo está pensado para la capa de razonamiento e interpretación (capa 2).
- Solo cubre BaZi (cuatro pilares); no incluye Zi Wei Dou Shu ni otras disciplinas astrológicas.
- El rendimiento en BaziQA es del 30% en pesos fusionados, solo cinco puntos por encima de la línea base aleatoria del 25%; no es un sistema fiable para predicciones reales.
- Riesgo de alucinación inherente a un modelo de 1.7B entrenado con datos sintéticos: puede generar derivaciones formalmente correctas pero conceptualmente erróneas.
- Idiomas soportados no documentados; el entrenamiento se centra en chino tradicional, por lo que el rendimiento en castellano u otros idiomas no está garantizado.
- Sesgos conocidos: no documentados por el autor; al tratarse de un dominio cultural específico, puede reproducir sesgos propios de las fuentes históricas utilizadas.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la exactitud de las interpretaciones.
- El repositorio tiene muy pocas descargas (25) y ningún "like", lo que indica escasa validación por parte de la comunidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/kinyeah/lfm3-1.7b-bazi-v13)
- [Modelo base LiquidAI/LFM3-1.7B](https://huggingface.co/LiquidAI/LFM3-1.7B)
- [Benchmark BaziQA](https://github.com/hkjfma/BaziQA)
- [Motor de reglas bazi_core](https://github.com/kinyeah/thor_ncm)
