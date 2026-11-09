# bmars8218/rf-r19-lisang19-wd16

## Resumen
rf-r19-lisang19-wd16 es un modelo de lenguaje de 0,9 mil millones de parámetros con arquitectura Llama, desarrollado por el equipo formado por Ruffian (UID 169) y Seed (CoolCat777) bajo el identificador de cuenta bmars8218. Forma parte de la familia denominada ChronoLLM y se etiqueta como "vintage 2010": el entrenamiento se realizó exclusivamente con texto fechado hasta el 31 de diciembre de 2010, sin incorporar ningún documento posterior a esa fecha.

El modelo parte de un checkpoint base entrenado año a año sobre documentos históricos, continúa el entrenamiento con texto limpio de 2010 que incluye aproximadamente un 3% de respuestas de referencia y finaliza con una fase de inyección de hechos de Wikidata datados hasta 2010, donde los hechos de ese año se ponderan por cinco y representan cerca del 16% de la mezcla final. El objetivo declarado es disponer de un modelo con conocimiento acotado temporalmente a 2010, útil para experimentos de evaluación cronológica, simulación de contexto histórico y estudios sobre contaminación temporal en modelos de lenguaje.

El repositorio ocupa 1,8 GB, contiene pesos en formato safetensors y se publica bajo licencia MIT. No se documentan idiomas soportados, pipeline de inferencia ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (26 capas) |
| Parametros totales | 917.338.240 (0,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La arquitectura es un transformer decoder-only de tipo Llama con 26 capas y un vocabulario de aproximadamente 36.000 tokens. No se especifican dimensiones ocultas, número de cabezas de atención ni longitud de contexto en la información disponible.

El entrenamiento se estructura en tres fases según la model card. Primero, un checkpoint base entrenado año por año sobre documentos escritos hasta 2010 inclusive. Segundo, un entrenamiento continuado sobre texto limpio de 2010 con alrededor de un 3% de respuestas de referencia, lo que sugiere una mezcla orientada a instrucciones o pares pregunta-respuesta. Tercero, una etapa final de inyección de hechos de Wikidata datados hasta 2010, con ponderación x5 para los hechos de ese año y aproximadamente un 16% de la mezcla final. La restricción temporal es estricta: no se empleó texto posterior al 31 de diciembre de 2010. No se documentan técnicas como RLHF, DPO, decodificación especulativa ni atención lineal.

## Capacidades
- Generación de texto en inglés presumiblemente, aunque los idiomas no están declarados formalmente.
- Conocimiento factual acotado a hechos anteriores a 2011, reforzado con Wikidata hasta 2010.
- Modelado de estilo y vocabulario propios de documentos históricos de hasta 2010.
- Capacidad de respuesta a instrucciones derivada del 3% de respuestas de referencia en la fase de entrenamiento continuado.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- No se documentan capacidades multilingües específicas.

## Casos de uso
- Evaluación de contaminación temporal: sirve como referencia controlada para medir cuánto conocimiento posterior a 2010 tienen modelos entrenados con corpus modernos, comparando respuestas sobre hechos fechados.
- Simulación de contexto histórico: útil para generar texto con estilo y referencias propias de documentos anteriores a 2011 en tareas de recreación o análisis historiográfico.
- Investigación sobre sesgo temporal: permite estudiar cómo la distribución del corpus de entrenamiento condiciona las respuestas factuales en un corte temporal concreto.
- Generación de preguntas y respuestas sobre hechos de 2010: la ponderación x5 de Wikidata 2010 y el 16% de la mezcla final lo hacen adecuado para tareas de recuperación factual acotadas a ese año.
- Prototipado ligero en entornos con recursos limitados: con 0,9B parámetros y pesos safetensors de 1,8 GB, puede ejecutarse en una sola GPU de consumo para experimentos de investigación.
- Base para fine-tuning cronológico: al ser un checkpoint pequeño y con licencia MIT, sirve como punto de partida para experimentos de ajuste con corpus fechados en otros años.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en fp16: aproximadamente 1,8-2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 3-4 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 1 GB para pesos; en 4 bits, unos 0,5 GB, más overhead.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 4090, A100, H100). Cabe holgadamente en GPUs de consumo.
- Despliegue: al ser arquitectura Llama con pesos safetensors, es compatible con llama.cpp, Ollama, vLLM y TGI, aunque no se documentan configuraciones específicas ni conversión a GGUF publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| rf-r19-lisang19-wd16 | 0,9B | no disponible | MIT | Corte temporal estricto en 2010; sin benchmarks publicados |
| TinyLlama-1.1B | 1,1B | 2.048 tokens | Apache 2.0 | Modelo generalista con benchmarks publicados; corpus moderno |
| Llama 3.2 1B | 1,2B | 128.000 tokens | Llama 3.2 Community License | Modelo generalista multilingüe con contexto largo |
| Qwen2.5 0.5B | 0,5B | 32.768 tokens | Apache 2.0 | Modelo generalista multilingüe |

La comparación con alternativas generalistas es limitada porque rf-r19-lisang19-wd16 está diseñado para un propósito específico (conocimiento acotado a 2010) y no publica métricas de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias
- Conocimiento deliberadamente obsoleto: ignora cualquier hecho posterior al 31 de diciembre de 2010, lo que lo hace inadecuado para tareas que requieran información actual.
- Riesgo de alucinación elevado: con 0,9B parámetros y sin benchmarks publicados, la fiabilidad factual no está verificada.
- Idiomas soportados no declarados: no se puede asumir un rendimiento multilingüe equilibrado.
- Longitud de contexto no documentada: no se recomienda su uso en tareas que requieran ventanas largas sin verificación previa.
- Sin pipeline declarado en Hugging Face ni ejemplos de uso publicados.
- Licencia MIT permite uso comercial, pero la ausencia de evaluación de calidad y sesgos hace recomendable una validación exhaustiva antes de cualquier despliegue en producción.
- Sesgos conocidos: no documentados por el autor; el corpus histórico puede arrastrar sesgos de la época.

## Enlaces
- Hugging Face: https://huggingface.co/bmars8218/rf-r19-lisang19-wd16
