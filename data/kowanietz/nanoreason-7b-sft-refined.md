# kowanietz/NanoReason-7B-SFT-Refined

## Resumen

NanoReason-7B-SFT-Refined es un checkpoint de investigación publicado por el desarrollador independiente kowanietz, que extiende su modelo NanoReason-7B-SFT mediante 16 épocas de entrenamiento por repetición sobre 3.200 ejemplos de razonamiento seleccionados del dataset allenai/Dolci-Think-SFT-7B. El modelo parte de los pesos preentrenados de OLMo 3 7B de Ai2 y utiliza el tokenizador y la plantilla de chat de OLMo 3 Think-SFT. No existe afiliación con Ai2.

La propuesta del autor es explorar hasta qué punto el sobreentrenamiento controlado sobre un subconjunto pequeño y curado de datos de razonamiento puede mejorar el rendimiento en benchmarks de matemáticas y razonamiento científico en un modelo de 7.300 millones de parámetros. Los resultados reportados muestran incrementos notables en GPQA Main (de 32,37 a 42,63), AIME 2024 (de 30,21 a 45,83) y MATH-500 (de 88,40 a 91,00) respecto al checkpoint SFT previo.

Es relevante ahora porque documenta de forma transparente una práctica poco habitual (repetición de épocas sobre un dataset reducido) y porque publica código, configuraciones y detalles de evaluación en su repositorio, lo que permite reproducir y auditar el experimento. El modelo está pensado para investigación, no como un modelo de propósito general listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de OLMo 3 7B) |
| Parámetros totales | 7.298.011.136 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens en evaluación; secuencias de entrenamiento de 16.384 tokens |
| Tipos de cuantización | no disponible (el autor solo reporta evaluación en BF16) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only construido sobre los pesos preentrenados de Ai2 OLMo 3 7B, con el tokenizador y la plantilla de chat de OLMo 3 Think-SFT. No se documentan modificaciones arquitectónicas respecto a la base; el trabajo se centra en la fase de ajuste supervisado (SFT).

El entrenamiento de esta etapa consistió en 16 épocas de repetición sobre 3.200 ejemplos seleccionados de Dolci-Think-SFT-7B, con 2.784 pasos de optimizador, learning rate de 2e-6 y secuencias empaquetadas de 16.384 tokens. Se ejecutó en un nodo único con 4 GPU NVIDIA A100 de 40 GB, consumiendo aproximadamente 48 horas-GPU en esta fase y 141 horas-GPU acumuladas en toda la serie. El autor indica que una auditoría del pool de origen del SFT encontró cero coincidencias exactas normalizadas con prompts de benchmark sobre 100.000 ejemplos (104.528 turnos de usuario), y que la fase RLVR aplica comprobaciones de exclusión de benchmarks; no obstante, advierte que las comprobaciones de coincidencia exacta no descartan paráfrasis ni solapamiento con el preentrenamiento.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat.
- Razonamiento matemático: resolución de problemas de competición (AIME, MATH-500).
- Razonamiento científico de nivel avanzado (GPQA Main).
- Razonamiento multi-paso y tareas de razonamiento complejo (BBH).
- Seguimiento de instrucciones (IFEval).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (visión, audio, thinking mode explícito): no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre sobreentrenamiento y repetición de datos: sirve como checkpoint de referencia para estudiar cómo 16 épocas sobre 3.200 ejemplos afectan a métricas de razonamiento frente al SFT original, con código y configuración reproducibles en el repositorio del autor.
- Evaluación comparativa de métodos de SFT: al publicarse resultados en GPQA, MATH-500, AIME y BBH junto al checkpoint SFT, permite aislar el efecto de la fase de repetición en un pipeline controlado.
- Generación de soluciones matemáticas paso a paso: adecuado para prototipos de tutoría o generación de cadenas de razonamiento en problemas tipo MATH-500 o AIME, donde reporta 91,00 y 45,83 respectivamente.
- Preguntas de ciencia de nivel graduado: útil en experimentos de QA científico (GPQA Main, 42,63) para comparar estrategias de prompting o decodificación.
- Evaluación de seguimiento de instrucciones: con 72,64 en IFEval, sirve para probar pipelines de instrucciones formateadas antes de adoptar un modelo mayor.
- Baseline en pipelines de investigación con vLLM/OLMES: el autor evalúa con OLMES sobre vLLM en BF16 y contexto de 32.768 tokens, por lo que encaja como baseline reproducible en infraestructura similar (4×A100 40 GB para entrenamiento; inferencia en una sola GPU de 40 GB en BF16 o menos con cuantización).

## Benchmarks y rendimiento

Resultados reportados por el autor (porcentajes; evaluación con OLMES/vLLM en BF16 y contexto de 32.768 tokens):

| Benchmark | Base | SFT | Refined | Think |
|---|---:|---:|---:|---:|
| GPQA Main | 28,79 | 32,37 | **42,63** | 41,74 |
| MATH-500 | 63,00 | 88,40 | **91,00** | **91,00** |
| AIME 2024 | 12,08 | 30,21 | **45,83** | 45,31 |
| AIME 2025 | 14,17 | 26,35 | **33,33** | **33,33** |
| BBH | no disponible | 60,34 | 67,61 | **69,19** |
| IFEval | 34,57 | 63,77 | **72,64** | **72,64** |

Notas del autor: GPQA Main es exact match sobre 448 preguntas; MATH-500, flexible exact match; AIME, media de pass@1 (30 problemas por año, 32 muestras cada uno); BBH, micro exact match; IFEval, prompt-level loose accuracy. El resultado de BBH en Base no se completó. La comparación con Base usa el tokenizador y la plantilla de chat de Think-SFT.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 14,6 GB de pesos, por lo que se necesita una GPU con al menos 16 GB y margen para el contexto (32.768 tokens incrementan el uso de KV cache).
- GPU recomendadas: A100 40 GB (usada por el autor para entrenamiento e inferencia de evaluación), H100, o GPUs consumer de gama alta con 24 GB o más.
- Cabe en GPU consumer: sí, en tarjetas con 24 GB (por ejemplo, RTX 3090/4090) en BF16 con contexto moderado; con cuantización no documentada por el autor, el requisito sería menor, pero no hay datos oficiales de cuantización.
- Opciones de despliegue: transformers (>=5.19.0) con torch y accelerate, según la model card; vLLM (usado en la evaluación con OLMES). Otras opciones como llama.cpp, Ollama o TGI no están documentadas en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| NanoReason-7B-SFT-Refined | 7,30 B | 32.768 (evaluación) | Apache 2.0 | Hugging Face | Checkpoint de investigación con benchmarks propios |
| NanoReason-7B-SFT (mismo autor) | no disponible | no disponible | Apache 2.0 | Hugging Face | Checkpoint padre; GPQA 32,37, MATH-500 88,40, AIME 2024 30,21 |
| NanoReason-7B-Think (mismo autor) | no disponible | no disponible | no disponible | Hugging Face | Siguiente etapa de la serie; GPQA 41,74, BBH 69,19 |
| OLMo 3 7B (Ai2) | no disponible | no disponible | no disponible | Hugging Face | Modelo base preentrenado del que derivan los pesos |

No se dispone de datos de benchmarks de OLMo 3 7B en la información proporcionada para una comparación directa. Las cifras de la columna Base de la tabla de benchmarks corresponden a la base evaluada con el tokenizador y la plantilla de chat de Think-SFT, no a un modelo externo independiente.

## Limitaciones y advertencias

- El propio autor advierte que el entrenamiento por repetición usa un dataset pequeño y seleccionado, y que las mejoras en benchmarks no establecen ganancias de propósito general.
- Riesgo de sobreajuste a los benchmarks evaluados: la selección de datos y la repetición de 16 épocas pueden inflar métricas sin transferencia a tareas fuera de la distribución evaluada.
- La auditoría de coincidencias exactas con prompts de benchmark no descarta paráfrasis ni solapamiento con el preentrenamiento, según el propio autor.
- Idioma: solo inglés; no hay soporte multilingüe documentado.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información proporcionada; aplicable el riesgo habitual de modelos de 7B en tareas de razonamiento.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo se presenta como checkpoint de investigación y no como producto listo para producción.
- Requiere transformers >= 5.19.0; versiones anteriores pueden no cargar el modelo correctamente.
- El autor no está afiliado a Ai2; los pesos base son de OLMo 3 7B de Ai2.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kowanietz/NanoReason-7B-SFT-Refined
- Checkpoint SFT padre: https://huggingface.co/kowanietz/NanoReason-7B-SFT
- Siguiente etapa de la serie (Think): https://huggingface.co/kowanietz/NanoReason-7B-Think
- Modelo base OLMo 3 7B (Ai2): https://huggingface.co/allenai/Olmo-3-1025-7B
- Tokenizador y plantilla de chat (OLMo 3 Think-SFT): https://huggingface.co/allenai/Olmo-3-7B-Think-SFT
- Dataset de entrenamiento: https://huggingface.co/datasets/allenai/Dolci-Think-SFT-7B
- Repositorio de código, configuraciones y resultados: https://github.com/kowanietz/nanoreason
- Resultados y ajustes de evaluación: https://github.com/kowanietz/nanoreason/tree/main/results
- Configuración de entrenamiento: https://github.com/kowanietz/nanoreason/blob/main/configs/sft/repetition-3k2.yaml
- Licencia: https://huggingface.co/kowanietz/NanoReason-7B-SFT-Refined/blob/main/LICENSE
- NOTICE: https://huggingface.co/kowanietz/NanoReason-7B-SFT-Refined/blob/main/NOTICE
