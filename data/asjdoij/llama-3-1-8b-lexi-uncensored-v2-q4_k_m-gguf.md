# asjdoij/Llama-3.1-8B-Lexi-Uncensored-V2-Q4_K_M-GGUF

## Resumen
El modelo `asjdoij/Llama-3.1-8B-Lexi-Uncensored-V2-Q4_K_M-GGUF` es una cuantización en formato GGUF (Q4_K_M) del modelo `Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2`, un ajuste fino del meta-modelo Llama 3.1 8B Instruct de Meta. Lo publica el usuario `asjdoij` mediante el espacio GGUF-my-repo de ggml.ai, que automatiza la conversión de pesos safetensors a GGUF con llama.cpp. El propósito de esta variante es permitir la inferencia local en CPU y GPU de consumo con un peso de aproximadamente 4,9 GB, manteniendo la naturaleza "uncensored" del modelo base, es decir, un ajuste fino orientado a reducir los rechazos y la censura conversacional típica de los modelos instruct alineados.

El modelo hereda la arquitectura transformer decoder-only de Llama 3.1 8B, con 8.030.261.312 parámetros totales y una ventana de contexto nominal de 128.000 tokens en el meta-modelo, aunque en la práctica la cuantización Q4_K_M se distribuye y ejecuta con configuraciones de contexto menores por limitaciones de memoria. La licencia es la Llama 3.1 Community License, lo que condiciona el uso comercial y la redistribución.

Su relevancia actual radica en que ofrece un checkpoint ligero, ejecutable con llama.cpp, Ollama o servidores compatibles, para experimentación con generación de texto sin filtros agresivos. No obstante, los resultados de benchmarks declarados en la model card muestran un rendimiento claramente degradado respecto al Llama 3.1 8B Instruct original, especialmente en tareas de razonamiento y matemáticas, lo que debe tenerse en cuenta antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1) |
| Parámetros totales | 8.030.261.312 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens en el meta-modelo; la model card del GGUF no especifica contexto efectivo |
| Tipos de cuantización | Q4_K_M (única publicada en este repo) |
| Idiomas soportados | no disponible (el meta-modelo Llama 3.1 soporta oficialmente inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | GGUF (llama-3.1-8b-lexi-uncensored-v2-q4_k_m.gguf) |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de Llama 3.1 8B: un transformer decoder-only con atención por grupos (GQA), normalización RMSNorm, activación SwiGLU y RoPE con escalado para contexto largo. El modelo base `Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2` es un ajuste fino del Llama 3.1 8B Instruct, presumiblemente mediante fine-tuning supervisado sobre un dataset orientado a reducir los rechazos, aunque la model card consultada no detalla la composición del dataset, el número de tokens de entrenamiento ni si se aplicó DPO o RLHF. No hay información disponible sobre innovaciones técnicas adicionales (decodificación especulativa, atención lineal u otras) en la documentación proporcionada.

Esta variante concreta no introduce cambios arquitectónicos: es una conversión de pesos a GGUF Q4_K_M realizada con llama.cpp a través del espacio GGUF-my-repo. La cuantización Q4_K_M aplica 4 bits con escalas y offsets por bloque para las matrices de atención y FFN, manteniendo ciertas capas en mayor precisión, lo que reduce el tamaño del checkpoint a unos 4,9 GB a costa de una pérdida moderada de calidad respecto a los pesos originales en bf16/fp16.

## Capacidades
- Generación de texto conversacional multi-turno, heredada del ajuste instruct del modelo base.
- Razonamiento general y respuesta a instrucciones, con rendimiento medido en IFEval (77,92 de strict accuracy) y MMLU-Pro (30,9 de accuracy).
- Matemáticas básicas y de competición, con resultados limitados (16,92 de exact match en MATH Lvl 5).
- Generación de código y tareas de programación, aunque no hay benchmarks específicos publicados en la información disponible.
- Comportamiento "uncensored": menor tendencia a rechazar peticiones que los modelos instruct alineados convencionales, lo que puede ser útil para investigación sobre seguridad y alineación.
- Soporte de tool calling y function calling: no disponible en la información proporcionada; el meta-modelo Llama 3.1 lo soporta, pero no se confirma que el ajuste fino lo preserve.
- Capacidades de agente y razonamiento multi-paso: no confirmadas; los resultados en BBH (29,69) y MuSR (7,77) sugieren un rendimiento bajo en tareas de razonamiento complejo.
- Capacidades multimodales (visión, audio): no disponibles; el modelo es exclusivamente de texto.

## Casos de uso
- Experimentación local en investigación de alineación y seguridad: el modelo permite estudiar cómo un ajuste fino "uncensored" altera la distribución de rechazos y respuestas, ejecutándose en una sola GPU de consumo gracias a los 4,9 GB del GGUF Q4_K_M.
- Prototipado rápido de asistentes conversacionales: con llama.cpp u Ollama se puede levantar un servidor compatible con la API de OpenAI en minutos, útil para validar flujos de diálogo antes de invertir en modelos mayores.
- Generación creativa y escritura sin filtros: el ajuste orientado a reducir la censura lo hace adecuado para lluvia de ideas, ficción o guiones donde los modelos alineados rechazan con frecuencia ciertos temas.
- Análisis de sesgos y comportamiento en dominios sensibles: investigadores pueden comparar sus respuestas con las del Llama 3.1 8B Instruct original para documentar diferencias de alineación.
- Despliegue en entornos con recursos limitados: portátiles, estaciones de trabajo sin GPU dedicada o servidores CPU-only, donde un modelo de 8B en Q4_K_M es viable con 6-8 GB de RAM.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la degradación de calidad entre el checkpoint original en bf16 y la versión Q4_K_M en tareas como IFEval o MMLU-Pro.
- Filtrado y clasificación de texto en pipelines internos: para tareas de etiquetado o resumen donde la latencia importa más que la precisión máxima, siempre que se validen los resultados.

## Benchmarks y rendimiento
Resultados declarados por el autor del modelo base en la model card (no verificados de forma independiente):

| Benchmark | Configuración | Métrica | Valor |
|---|---|---|---|
| IFEval | 0-shot | strict accuracy | 77,92 |
| BBH | 3-shot | acc_norm | 29,69 |
| MATH Lvl 5 | 4-shot | exact match | 16,92 |
| GPQA | 0-shot | acc_norm | 4,36 |
| MuSR | 0-shot | acc_norm | 7,77 |
| MMLU-Pro | 5-shot | accuracy | 30,9 |

No se han publicado resultados específicos para esta cuantización Q4_K_M; los valores anteriores corresponden al modelo base en su precisión original y deben considerarse un techo aproximado, ya que la cuantización de 4 bits puede degradar ligeramente el rendimiento.

## Requisitos de hardware
- VRAM/RAM estimada para inferencia: en torno a 5-6 GB para el archivo Q4_K_M (4,9 GB) más la memoria de contexto; con 8.192 tokens de contexto se recomienda al menos 8 GB de memoria total.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090; en el ámbito profesional, A100 40 GB o H100 80 GB quedan sobradamente dimensionadas y permiten contextos mucho mayores.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más de VRAM; en GPUs de 6 GB puede ejecutarse con contexto reducido o descarga parcial a CPU.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama, LM Studio, y servidores compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa y requerirían convertir a safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del hardware y del tamaño de contexto configurado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmarks destacados | Licencia | Formato |
|---|---|---|---|---|---|
| asjdoij/Llama-3.1-8B-Lexi-Uncensored-V2-Q4_K_M-GGUF | 8,03B | 128k (meta-modelo) | IFEval 77,92; MMLU-Pro 30,9 | Llama 3.1 | GGUF Q4_K_M |
| Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2 | 8,03B | 128k | mismos valores (modelo base) | Llama 3.1 | safetensors |
| bartowski/Llama-3.1-8B-Lexi-Uncensored-GGUF | ~8B | 128k | no disponible | Llama 3.1 | GGUF (múltiples cuantizaciones) |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128k | MMLU ~69; rendimiento instruct superior | Llama 3.1 | safetensors |

La comparación con el Llama 3.1 8B Instruct original es la más relevante: el ajuste "uncensored" sacrifica buena parte del rendimiento en razonamiento y matemáticas (MMLU-Pro 30,9 frente a valores cercanos a 48-50 del instruct original) a cambio de reducir los rechazos. La versión de bartowski ofrece el mismo modelo base en múltiples cuantizaciones, lo que la hace más flexible para distintos presupuestos de memoria.

## Limitaciones y advertencias
- Sesgos conocidos: al reducir los filtros de alineación, el modelo puede reproducir estereotipos, lenguaje ofensivo o contenido sesgado con mayor facilidad que un instruct alineado; requiere moderación externa en producción.
- Riesgo de alucinación: elevado en tareas factuales y de razonamiento, coherente con los bajos resultados en GPQA (4,36) y MuSR (7,77).
- Limitaciones de contexto e idioma: la model card del GGUF no especifica idiomas soportados ni el contexto efectivo tras la cuantización; el meta-modelo soporta oficialmente ocho idiomas, pero el ajuste fino puede haber degradado el multilingüismo.
- Restricciones de licencia: la Llama 3.1 Community License impone condiciones al uso comercial (límite de 700 millones de usuarios mensuales para productos derivados, obligación de atribución y de nombrar el modelo "Llama 3.1" en los avisos), y exige cumplir la política de uso aceptable de Meta.
- Caveats para producción: el repositorio tiene 0 descargas y 0 likes, sin verificación de la calidad de la conversión; conviene validar el GGUF contra el checkpoint original antes de desplegarlo. Además, el contenido "uncensored" puede incumplir políticas de uso aceptable en determinados contextos comerciales o regulatorios.
- No se confirma que el ajuste fino preserve el soporte de tool calling del Llama 3.1 Instruct, lo que limita su uso en pipelines de agentes.

## Enlaces
- Repositorio GGUF: https://huggingface.co/asjdoij/Llama-3.1-8B-Lexi-Uncensored-V2-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2
- Cuantizaciones alternativas de bartowski: https://huggingface.co/bartowski/Llama-3.1-8B-Lexi-Uncensored-GGUF
- Open LLM Leaderboard (resultados del modelo base): https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard?query=Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
