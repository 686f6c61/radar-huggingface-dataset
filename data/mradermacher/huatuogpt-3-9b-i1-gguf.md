# mradermacher/HuatuoGPT-3-9B-i1-GGUF

## Resumen

HuatuoGPT-3-9B-i1-GGUF es la versión cuantizada en formato GGUF del modelo HuatuoGPT-3-9B, desarrollado originalmente por FreedomIntelligence y convertido a GGUF por mradermacher. Se trata de un modelo de lenguaje especializado en dominio médico, con capacidades de razonamiento y conversación, construido sobre una arquitectura transformer densa de aproximadamente 8.950 millones de parámetros (8,95 B). El modelo está etiquetado como "onepo" y "reasoning", lo que sugiere un entrenamiento orientado a la deliberación explícita antes de responder.

La relevancia de esta ficha radica en que la versión GGUF permite ejecutar un modelo médico de casi 9 B en hardware de consumo mediante llama.cpp y derivados, algo imposible con los pesos originales en safetensors (FP16/BF16). El repositorio incluye cuantizaciones con imatrix (importancia matricial), lo que mejora la calidad respecto a las cuantizaciones estáticas tradicionales en rangos bajos y medios.

El autor de la cuantización, mradermacher, es un conocido contribuidor de la comunidad que publica versiones GGUF de modelos recientes. La licencia declarada es Apache 2.0, lo que facilita el uso comercial, aunque conviene revisar las condiciones del modelo base. El repositorio ocupa 110,2 GB en total por acumular todas las variantes de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no se especifica la variante exacta en la informacion disponible) |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; ademas imatrix file |
| Idiomas soportados | Ingles (segun la model card; el resto no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base esta en safetensors |
| Tamano del repositorio | 110,2 GB (todas las variantes) |
| Rango de tamano de cuantizaciones | 2,8 GB (IQ1_S) a 7,5 GB (Q6_K) |
| Modelo base | FreedomIntelligence/HuatuoGPT-3-9B |
| Etiquetas | medical, reasoning, conversational, onepo |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un transformer denso de 8,95 B de parámetros. La etiqueta "onepo" en la model card apunta a un proceso de optimización de preferencias (probablemente una variante de DPO u optimización de preferencias en una sola etapa), y la etiqueta "reasoning" sugiere que el modelo fue ajustado para producir cadenas de razonamiento antes de la respuesta final. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF adicional.

El proceso de cuantización aplicado por mradermacher usa un fichero imatrix generado a partir del modelo base, lo que permite calcular la importancia de cada matriz de pesos y asignar bits de forma no uniforme. Esto se traduce en una mejor relación calidad/tamaño en las cuantizaciones IQ frente a las K-quants equivalentes en tamaño. El repositorio incluye tanto cuantizaciones estáticas (Q4_0, Q4_1) como K-quants e IQ-quants, además de un fichero imatrix independiente (0,1 GB) para que terceros puedan generar sus propias cuantizaciones.

## Capacidades

- Generación de texto conversacional en dominio médico y sanitario.
- Razonamiento multi-paso con modo de deliberación previa a la respuesta (etiqueta "reasoning").
- Conversación multi-turno orientada a consultas clínicas, anamnesis y explicación de conceptos médicos.
- Capacidades de razonamiento general heredadas del modelo base subyacente.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: parcial, limitado al razonamiento interno; no se documenta integración con frameworks de agentes.
- Capacidades multilingües: la model card declara únicamente inglés; no se confirma soporte de castellano.
- Capacidades especiales: no se documentan visión, audio ni thinking mode explícito más allá de la etiqueta "reasoning".

## Casos de uso

- Triaje clínico asistido: el modelo puede gestionar conversaciones multi-turno para recoger síntomas y antecedentes, y generar una orientación preliminar. Es adecuado por su ajuste específico en dominio médico y su capacidad conversacional, aunque requiere supervisión profesional.
- Educación médica y divulgación: generación de explicaciones de patologías, fármacos y procedimientos en lenguaje adaptado al nivel del usuario. La cuantización Q4_K_M (5,7 GB) permite desplegarlo en portátiles con GPU de 8 GB.
- Documentación clínica: redacción y resumen de notas de consulta a partir de transcripciones, aprovechando el razonamiento para estructurar información. Requiere validación humana por el riesgo de alucinación en datos clínicos.
- Asistencia a la codificación CIE/SNOMED: el modelo puede proponer códigos diagnósticos a partir de descripciones textuales, integrándose en pipelines de facturación sanitaria con revisión posterior.
- Chatbot de atención al paciente: respuestas a preguntas frecuentes sobre preparación de pruebas, posología o cuidados postoperatorios, desplegado con llama.cpp u Ollama en infraestructura local para cumplir requisitos de privacidad (datos de salud).
- Investigación en NLP clínico: uso como baseline para experimentos de razonamiento médico, evaluación de sesgos o generación de datos sintéticos anonimizados, gracias a la licencia Apache 2.0 y a la disponibilidad de múltiples cuantizaciones para distintos presupuestos de cómputo.
- Despliegue en entornos con recursos limitados: la variante IQ2_M (3,7 GB) permite ejecución en CPU con RAM modesta, útil para prototipos o entornos sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV): aproximadamente 3,0-3,9 GB en IQ2/IQ3, 5,3-5,9 GB en IQ4/Q4, 6,4-6,6 GB en Q5 y 7,5 GB en Q6_K. Añadir entre 0,5 y 2 GB adicionales según longitud de contexto y batch.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 (24 GB) para contexto largo y mayor throughput; A100/H100 solo si se necesita alta concurrencia o fine-tuning.
- Cabe en GPU de consumo: sí. La Q4_K_M (5,7 GB) cabe en GPUs de 8 GB; la Q6_K (7,5 GB) requiere 10-12 GB para dejar margen a la caché KV.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui; vLLM y TGI no soportan GGUF de forma nativa (requieren los safetensors originales).
- Latencia y throughput estimados: no disponibles en la información proporcionada. Como referencia orientativa, un modelo denso de 9 B en Q4_K_M sobre una RTX 4090 suele superar las decenas de tokens por segundo, pero no se aporta medición concreta para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Formato |
|---|---|---|---|---|---|
| HuatuoGPT-3-9B (este) | 8,95 B | No disponible | Médico, razonamiento | Apache 2.0 | GGUF, safetensors |
| HuatuoGPT-II (versiones previas) | ~7 B / ~13 B | No disponible | Médico | Apache 2.0 (según versión) | safetensors, GGUF (comunidad) |
| Meditron-7B | 7 B | 4 K (típico) | Médico | Llama 2 (restrictiva) | safetensors, GGUF |
| BioMistral-7B | 7 B | 8 K (típico) | Biomédico | Apache 2.0 | safetensors, GGUF |

La comparación con HuatuoGPT-II es la más directa por procedencia (mismo equipo, FreedomIntelligence); este modelo de 9 B añade la etiqueta "reasoning" y "onepo". Meditron-7B y BioMistral-7B son alternativas de tamaño similar, pero con licencias y estrategias de entrenamiento distintas. No se dispone de datos de benchmarks comparativos en la información proporcionada.

## Limitaciones y advertencias

- Riesgo elevado de alucinación en contenido clínico: cualquier salida debe ser revisada por un profesional sanitario antes de uso real.
- Sesgos conocidos: no documentados en la información disponible; los modelos médicos suelen reflejar sesgos de los corpus clínicos de entrenamiento (poblaciones, géneros, geografías).
- Idioma: la model card declara únicamente inglés; no se garantiza un rendimiento aceptable en castellano.
- Longitud de contexto no especificada: planificar el despliegue con un contexto conservador hasta verificar el límite real del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y de los datos de entrenamiento originales, no detallados aquí.
- Las cuantizaciones por debajo de Q4 (especialmente IQ2 e IQ1) degradan notablemente la calidad; el propio autor marca IQ1 como "for the desperate".
- No se documentan capacidades de tool calling ni integración con frameworks de agentes; no asumir su disponibilidad en producción.
- El repositorio de 110,2 GB incluye todas las variantes; descargar solo el fichero GGUF necesario para evitar consumo innecesario de disco y ancho de banda.

## Enlaces

- Repositorio GGUF (este modelo): https://huggingface.co/mradermacher/HuatuoGPT-3-9B-i1-GGUF
- Modelo base: https://huggingface.co/FreedomIntelligence/HuatuoGPT-3-9B
- Cuantizaciones estáticas del mismo autor: https://huggingface.co/mradermacher/HuatuoGPT-3-9B-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#HuatuoGPT-3-9B-i1-GGUF
- Guía de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
