# CodeSoft/sorbet-25m

## Resumen

Sorbet-25M es un modelo de lenguaje de 25 millones de parámetros desarrollado por CodeSoft, entrenado desde cero siguiendo una arquitectura tipo Qwen2. El objetivo del proyecto es demostrar que es posible obtener un modelo funcional de generación de texto con un presupuesto computacional mínimo: el entrenamiento completo se completó en menos de 4 horas en una única GPU RTX 5060 Ti de 16 GB, utilizando un conjunto de datos de 0,8 mil millones de tokens.

El modelo está pensado para la investigación y experimentación en entornos con recursos limitados, así como para tareas de generación de texto en inglés donde no se requiera un conocimiento profundo del mundo. Con 14 capas, una dimensión oculta de 384 y una ventana de contexto de 4096 tokens, Sorbet-25M es un modelo compacto que prioriza la eficiencia de entrenamiento frente al rendimiento bruto. Su licencia Apache-2.0 permite uso comercial sin restricciones, lo que facilita su integración en proyectos educativos, prototipos y pipelines de experimentación.

La relevancia actual del modelo radica en la creciente demanda de modelos pequeños y eficientes que puedan ejecutarse en hardware de consumo, especialmente en escenarios de fine-tuning y de despliegue en entornos con restricciones de VRAM. Sorbet-25M se posiciona como un candidato para este nicho, aunque su rendimiento en tareas de conocimiento general es limitado, como se espera de un modelo de esta escala.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder Transformer estilo Qwen2 (14 capas, hidden 384, GQA 6 heads / 2 KV heads, RoPE θ=100k, FFN 1024 SwiGLU) |
| Parametros totales | 25.185.920 (~87% no-embedding) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan cuantizaciones GGUF/AWQ) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

Sorbet-25M sigue una arquitectura de decoder Transformer estándar inspirada en Qwen2, con 14 capas, dimensión oculta de 384 y atención de consulta agrupada (GQA) con 6 cabezas de consulta y 2 cabezas de clave/valor. La capa de atención utiliza RoPE con frecuencia base de 100k, y el bloque FFN emplea SwiGLU con dimensión intermedia de 1024. El vocabulario es un BPE de nivel de byte personalizado de 8.192 tokens, con embeddings atados (tied embeddings), y todo el modelo se entrena en precisión bf16.

El entrenamiento se realizó sobre una mezcla ponderada de 0,8 mil millones de tokens, compuesta por fineweb-edu (70%), infiwebmath (10%) y DCLM-baseline (20%), con los datos barajados por bloques. Se ejecutaron aproximadamente 3.000 pasos con un tamaño de lote de 262.144 tokens por paso, utilizando un scheduler de tasa de aprendizaje coseno y optimizador AdamW de 8 bits. El modelo se entrenó desde cero, sin partir de pesos preentrenados, y no se aplicaron técnicas de alineación posterior como RLHF o DPO.

## Capacidades

- Generación de texto en inglés con contexto de hasta 4096 tokens.
- Razonamiento básico de sentido común y comprensión de texto corto, con resultados ligeramente por encima del azar en tareas como HellaSwag y PIQA.
- Capacidad matemática básica, evidenciada por el resultado relativo más fuerte en el benchmark ArithMark-3.0 (+7,9 puntos sobre el azar), consistente con la proporción de datos matemáticos en el entrenamiento.
- Sin soporte de tool calling, function calling, agentes, visión, audio ni modo de pensamiento explícito.
- Multilingüismo no soportado: el modelo se entrenó exclusivamente en inglés.

## Casos de uso

- Experimentación educativa: Sorbet-25M es ideal para cursos y talleres sobre entrenamiento de modelos de lenguaje desde cero, ya que su entrenamiento completo es reproducible en una GPU consumer en menos de 4 horas, permitiendo a los estudiantes observar el ciclo completo de preprocesado, entrenamiento y evaluación.
- Prototipado rápido de aplicaciones de texto: para validar ideas de producto que requieran generación de texto en inglés con baja latencia y sin necesidad de calidad de nivel industrial, el modelo puede servir como placeholder funcional.
- Fine-tuning de dominio específico: su pequeño tamaño permite afinar el modelo en dominios estrechos (por ejemplo, datos técnicos de un sector concreto) con recursos mínimos, y después desplegarlo en entornos de borde.
- Evaluación de técnicas de eficiencia: es un banco de pruebas adecuado para comparar métodos de cuantización, poda o destilación, ya que su tamaño permite iterar rápidamente en hardware de consumo.
- Generación de texto corto en sistemas embebidos: aplicaciones como autocompletado de formularios, sugerencia de respuestas o generación de descripciones breves en inglés pueden ejecutarse en dispositivos con poca memoria, aunque la calidad será limitada.
- Clasificación y análisis de texto básico: mediante fine-tuning en tareas de clasificación, el modelo puede adaptarse para etiquetado de sentimientos o categorización de documentos en inglés, aprovechando su baja huella de memoria.

## Benchmarks y rendimiento

El autor publicó resultados en cinco tareas de evaluación, ejecutadas con la librería de evaluación de HuggingFace. Los valores se presentan con intervalos de confianza al 95%.

| Tarea | n | Random | acc | acc_norm |
|---|---|---|---|---|
| HellaSwag | 10.042 | 25% | 26,52 ±0,44 | **26,12** ±0,44 |
| ARC-easy | 2.376 | ~25% | **29,50** ±0,94 | 29,59 ±0,94 |
| ARC-challenge | 1.172 | ~25% | 17,66 ±1,11 | 22,95 ±1,23 |
| PIQA | 1.838 | 50% | **54,46** ±1,16 | 53,43 ±1,16 |
| ArithMark-3.0 | 1.000 | 25% | 32,70 ±1,48 | **32,90** ±1,48 |

Notas del autor: ArithMark-3.0 es el resultado relativo más fuerte (+7,9 puntos sobre el azar), consistente con la proporción de matemáticas en la mezcla de entrenamiento. En ARC-challenge, la precisión bruta (acc) está por debajo del azar debido a un sesgo de longitud en las puntuaciones no normalizadas; la métrica significativa en esa tarea es acc_norm. No se han publicado resultados comparativos con otros modelos de la misma escala en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 50 MB (25,2 M parámetros × 2 bytes), por lo que la inferencia cabe en prácticamente cualquier GPU con más de 1 GB de VRAM, e incluso en CPU con suficiente RAM.
- GPU recomendadas: cualquier GPU de consumo con al menos 4 GB de VRAM es suficiente para inferencia. El entrenamiento se realizó en una RTX 5060 Ti de 16 GB en menos de 4 horas, por lo que GPUs similares (RTX 3060, RTX 4060, etc.) son adecuadas para reentrenar.
- Compatibilidad con GPU de consumo: sí, es un modelo muy ligero que cabe en cualquier GPU moderna, incluida la serie RTX 4060/5060 y anteriores.
- Opciones de despliegue: al ser un modelo de la librería transformers, puede servirse con vLLM, Text Generation Inference (TGI), o ejecutarse directamente con el pipeline de transformers. No se documenta compatibilidad con llama.cpp u Ollama en la información proporcionada.
- Latencia y throughput estimados: no disponibles en la información proporcionada, aunque por el tamaño del modelo se espera una latencia de milisegundos en GPU moderna y un throughput alto.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de otros modelos de la misma escala (por ejemplo, TinyStories-33M, SmolLM2-135M) en la información proporcionada, por lo que no se puede realizar una comparación cuantitativa fiable. Cualitativamente, Sorbet-25M se posiciona en la gama de modelos de menos de 50 M de parámetros, donde el rendimiento en tareas de conocimiento general es esperablemente bajo. La licencia Apache-2.0 y el entrenamiento desde cero en menos de 4 horas son sus principales diferenciadores frente a alternativas de escala similar.

## Limitaciones y advertencias

- Conocimiento del mundo limitado: el modelo tiene solo 25 M de parámetros y se entrenó con 0,8 B de tokens, por lo que su conocimiento enciclopédico y de hechos concretos es muy superficial.
- Rendimiento bajo en tareas de conocimiento denso: en benchmarks como ARC-challenge, la precisión normalizada (acc_norm) es de 22,95%, cerca del azar, y en HellaSwag de 26,12%, lo que indica una capacidad limitada para razonamiento complejo.
- Sesgos de datos: la mezcla de entrenamiento se compone de fineweb-edu, infiwebmath y DCLM-baseline, por lo que el modelo puede reflejar los sesgos presentes en estos conjuntos de datos, principalmente de contenido educativo en inglés.
- Solo inglés: no soporta otros idiomas, lo que limita su uso en aplicaciones multilingües.
- Riesgo de alucinación: como todos los modelos de lenguaje generativos, puede producir texto coherente pero factualmente incorrecto, especialmente en tareas de generación libre.
- Contexto limitado a 4096 tokens, lo que restringe la capacidad de procesar documentos largos o conversaciones muy extensas.
- Sin garantías de producción: el autor advierte que el modelo es para experimentación y no se recomienda para aplicaciones críticas sin un fine-tuning adicional y una evaluación exhaustiva.
- No hay evidencia de alineación con valores humanos: no se aplicaron técnicas de RLHF o DPO, por lo que el modelo puede producir contenido no deseado si se usa sin filtros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CodeSoft/sorbet-25m
- Nota: los resultados de búsqueda web encontrados se refieren a un modelo homónimo "Sorbet" de naturaleza neuromórfica (paper ICML 2025, arXiv 2409.15298), que no tiene relación con el modelo de CodeSoft/sorbet-25m. No se han encontrado otros enlaces específicos del modelo de CodeSoft en la búsqueda web.
