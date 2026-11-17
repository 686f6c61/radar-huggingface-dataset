# AmareshHebbar/ShortThink_Qwen3_1.7B_TIES

## Resumen

ShortThink TIES (Qwen3 1.7B) es un modelo de razonamiento derivado de Qwen/Qwen3-1.7B mediante una fusión de pesos por el algoritmo TIES (Trim, Elect Sign, Merge). Lo desarrolla AmareshHebbar y forma parte de la colección ShortThink, un conjunto de seis variantes entrenadas sobre los mismos datos autogenerados con algoritmos distintos (SFT, DPO, GRPO y varias fusiones). El objetivo es reducir el número de tokens de "pensamiento" que el modelo genera en problemas fáciles sin sacrificar precisión, algo relevante porque los modelos de razonamiento actuales gastan muchos más tokens de los necesarios en tareas sencillas.

El modelo no entrena con descenso de gradiente: es una fusión de los dos miembros más fuertes de la colección, ShortThink GRPO y ShortThink DPO, con pesos 0,5/0,5 y densidad 0,5 sobre 196 tensores modificados. Conserva la arquitectura, el tokenizador y el formato de chat de Qwen3-1.7B, con 1.720.574.976 parámetros en precisión bf16 y pesos en safetensors. Su licencia es Apache 2.0 y está pensado únicamente para inglés.

La propuesta de valor es la eficiencia: según la model card, mantiene la precisión de MATH500 del mejor miembro de la familia (83,0) con un 51,0 % menos de tokens que el Qwen3 base en modo thinking, y mejora GSM8K respecto al base (87,8 frente a 87,5). El modelo es relevante para quien necesite razonamiento matemático con coste de inferencia contenido en GPUs modestas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), pesos fusionados por TIES |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-1.7B) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; pesos publicados en bf16 safetensors |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16); incluye carpeta `adapter/` con LoRA cuando aplica |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3 con 1.720 millones de parámetros. No hay entrenamiento supervisado ni pasos de gradiente en esta variante: los pesos se obtienen fusionando los checkpoints ShortThink_Qwen3_1.7B_GRPO y ShortThink_Qwen3_1.7B_DPO con el algoritmo TIES. Cada vector de tarea se poda a sus entradas de mayor magnitud, se elige un signo por parámetro y solo se promedian las entradas que coinciden en signo. La configuración usada es densidad 0,5, pesos [0,5, 0,5] y 196 tensores modificados.

Los datos de entrenamiento de los modelos de origen proceden del dataset autogenerado AmareshHebbar/ShortThink_Traces_Qwen3_1.7B. El pipeline completo de la colección incluye SFT, DPO y GRPO, y esta fusión combina las dos etapas de preferencia/refuerzo más eficaces. El resultado es un modelo que mantiene el modo thinking de Qwen3 (activado con `enable_thinking=True` en la plantilla de chat) pero que produce trazas de razonamiento más cortas, sobre todo en problemas de dificultad baja.

## Capacidades

- Generación de texto y razonamiento paso a paso en modo thinking, con trazas de razonamiento comprimidas respecto al base.
- Razonamiento matemático: aritmética, problemas de competición (MATH500, GSM8K, AIME 2024) y problemas verbales.
- Razonamiento conciso: el modelo reduce tokens de forma proporcional a la dificultad (60,9 % menos en nivel 1 de MATH500 frente a 32,9 % en nivel 5).
- Conversación multi-turno mediante la plantilla de chat de Qwen3 (rol `user`/`assistant`).
- Formato de respuesta con `\boxed{}` para la respuesta final, compatible con `math_verify`.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning más allá del razonamiento matemático: no disponible en la informacion proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (visión, audio): no disponibles.

## Casos de uso

- Evaluación de modelos de razonamiento en producción: sirve como referencia de eficiencia, ya que permite medir precisión y tokens por respuesta correcta frente al Qwen3 base con los mismos prompts y ajustes de muestreo.
- Resolución de problemas matemáticos a escala: con 1.793 tokens por respuesta correcta (promedio MATH500/GSM8K), es adecuado para pipelines que procesan miles de consultas matemáticas con presupuesto de cómputo ajustado.
- Tutoría automática de matemáticas: el modelo genera soluciones paso a paso con respuesta final en `\boxed{}`, lo que facilita el parseo y la verificación automática en plataformas educativas.
- Generación de datos sintéticos de razonamiento: sus trazas cortas y correctas son útiles para destilar o aumentar datasets de entrenamiento con menos coste de tokens.
- Benchmarking de técnicas de fusión de modelos: como ejemplo reproducible de TIES sobre un modelo de razonamiento, sirve para estudiar el compromiso precisión/tokens en entornos de investigación.
- Despliegue en GPUs de consumo: con 1,7B parámetros en bf16 (unos 3,5 GB de repo), cabe en tarjetas de gama media y permite servir consultas de razonamiento con latencia p50 de 12,3 s medida con vLLM a batch 1.
- Clasificación y resolución de problemas verbales en inglés: GSM8K con 87,8 de precisión y 818 tokens de media lo hace viable para tareas de word problems en atención al cliente o herramientas internas.

## Benchmarks y rendimiento

Resultados publicados en la model card (mismos prompts, ajustes de muestreo y `math_verify`; MATH500 y GSM8K con 1 muestra por problema, AIME 2024 con 4; latencia p50 con vLLM a batch 1; coste asumiendo 1,0 USD/hora de GPU):

| Modelo | MATH500 acc | MATH500 tokens | GSM8K acc | GSM8K tokens | Tokens por acierto | Cambio de tokens vs base thinking | Latencia p50 (s) | Coste por 1k consultas (USD) |
|---|---|---|---|---|---|---|---|---|
| Qwen3 1.7B (thinking) | 70,0 | 3958 | 87,5 | 2205 | 4087 | mismo | 36,8 | 0,419 |
| Qwen3 1.7B (thinking + prompt conciso) | 78,6 | 3061 | 88,6 | 1370 | 2721 | 28,1 % menos | 23,4 | 0,277 |
| Qwen3 1.7B (sin thinking) | 72,8 | 901 | 80,4 | 313 | 813 | 80,3 % menos | 6,3 | 0,056 |
| Qwen3 1.7B (budget forcing 1024) | 45,4 | 1473 | 70,0 | 1219 | 2494 | 56,3 % menos | 10,6 | 0,101 |
| ShortThink SFT | 73,4 | 3767 | 89,0 | 2041 | 3713 | 5,8 % menos | 44,2 | 0,386 |
| ShortThink DPO | 81,8 | 2831 | 88,9 | 1288 | 2455 | 33,2 % menos | 27,9 | 0,236 |
| ShortThink GRPO | 83,0 | 2016 | 85,7 | 612 | 1571 | 57,4 % menos | 15,4 | 0,132 |
| **ShortThink TIES** | **83,0** | **2204** | **87,8** | **818** | **1793** | **51,0 % menos** | **12,3** | **0,160** |

Compresión por dificultad en MATH500:

| Nivel MATH | Precisión base | Precisión modelo | Tokens base | Tokens modelo | Cambio de tokens |
|---|---|---|---|---|---|
| Nivel 1 | 95,3 | 97,7 | 2507 | 981 | 60,9 % menos |
| Nivel 2 | 91,1 | 90,0 | 2935 | 1327 | 54,8 % menos |
| Nivel 3 | 78,1 | 93,3 | 3687 | 1701 | 53,9 % menos |
| Nivel 4 | 67,2 | 84,4 | 4176 | 2359 | 43,5 % menos |
| Nivel 5 | 44,0 | 64,2 | 5114 | 3430 | 32,9 % menos |

No se han publicado resultados de MMLU ni de AIME 2024 para este modelo en la información disponible (las celdas correspondientes están vacías en la tabla de la model card).

## Requisitos de hardware

- VRAM estimada: unos 3,5 GB para pesos en bf16; en cuantización de 8 bits rondaría 1,8-2 GB y en 4 bits alrededor de 1-1,3 GB (estimación a partir del número de parámetros; la model card no publica cuantizaciones oficiales).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 con contexto moderado; A100, H100 o L40S para mayor throughput en producción.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090, así como en GPUs de 8 GB con cuantización.
- Opciones de despliegue: vLLM (usado en la model card con `enable_thinking=True`), transformers; llama.cpp, Ollama y TGI son compatibles con la arquitectura Qwen3 aunque no se documentan explícitamente para este checkpoint.
- Latencia y throughput: latencia p50 de 12,3 s a batch 1 con vLLM y coste estimado de 0,160 USD por 1.000 consultas al ritmo de throughput medido; el throughput agregado no se detalla.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MATH500 acc | GSM8K acc | Tokens por acierto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| ShortThink TIES (este) | 1,7B | no disponible | 83,0 | 87,8 | 1793 | Apache 2.0 | Hugging Face |
| Qwen3 1.7B (thinking) | 1,7B | no disponible | 70,0 | 87,5 | 4087 | Apache 2.0 | Hugging Face |
| ShortThink GRPO | 1,7B | no disponible | 83,0 | 85,7 | 1571 | Apache 2.0 | Hugging Face |
| ShortThink DPO | 1,7B | no disponible | 81,8 | 88,9 | 2455 | Apache 2.0 | Hugging Face |

Frente al Qwen3 base en modo thinking, este modelo sube 13 puntos en MATH500 y reduce un 51,0 % los tokens generados, aunque es un 1,4 % menos eficiente en tokens por acierto que ShortThink GRPO y algo peor en GSM8K que ShortThink DPO. La ventaja principal es el equilibrio: mantiene la precisión máxima de la familia con menos tokens que DPO y mejor GSM8K que GRPO.

## Limitaciones y advertencias

- Solo inglés: la model card declara `language: en`; no hay evidencia de rendimiento en castellano u otros idiomas.
- Riesgo de alucinación: como todo modelo de razonamiento de 1,7B, puede producir cadenas de razonamiento plausibles pero incorrectas, especialmente en problemas de nivel 5 (precisión de 64,2 en MATH500).
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad o robustez en la información proporcionada.
- Contexto: la longitud de contexto no se especifica en la model card; conviene consultar la del Qwen3-1.7B base antes de desplegar con prompts largos.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen3 conviene revisar también los términos del modelo base y de los checkpoints intermedios.
- Naturaleza de la fusión: al no haber entrenamiento adicional, las capacidades fuera del razonamiento matemático (tool calling, agentes, código) no están validadas y pueden degradarse respecto al base.
- Advertencia de producción: el modelo se publicó con 0 descargas y 0 likes; no hay validación comunitaria independiente de los resultados reportados.
- Formato de prompt obligatorio: requiere la plantilla de chat de Qwen3 con `enable_thinking=True` y los ajustes de muestreo recomendados (temperatura 0,6, top_p 0,95, top_k 20); otros formatos pueden degradar la calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AmareshHebbar/ShortThink_Qwen3_1.7B_TIES
- Colección ShortThink: https://huggingface.co/collections/AmareshHebbar/shortthink-6afb0d2f2ea9eaf3f24b9363
- Dataset de trazas: https://huggingface.co/datasets/AmareshHebbar/ShortThink_Traces_Qwen3_1.7B
- Modelo base GRPO: https://huggingface.co/AmareshHebbar/ShortThink_Qwen3_1.7B_GRPO
- Modelo base DPO: https://huggingface.co/AmareshHebbar/ShortThink_Qwen3_1.7B_DPO
- Modelo original Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada.
