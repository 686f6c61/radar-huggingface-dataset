# dotnfc/Tiel-Coder-35B-A3B-GGUF-MTP

## Resumen

Tiel-Coder-35B-A3B-GGUF-MTP es una cuantización GGUF del modelo Ornith-1.5-35B-A3B, realizada por el autor dotnfc (también vinculado a peculiar-ragdoll). Ornith-1.5 es un modelo de arquitectura MoE de 35 mil millones de parámetros totales con 3 mil millones activos, derivado de Qwen3.6-35B-A3B, y está diseñado para tareas de coding agéntico y conversación multi-turno. Esta versión MTP incorpora soporte para decodificación especulativa (Multi-Token Prediction) y un "Sharp chat template" que prioriza respuestas cortas y directas, sacrificando algo de conocimiento enciclopédico a cambio de mejor rendimiento en tareas prácticas.

El modelo está pensado para ejecutarse localmente en GPUs de consumo, con cuantizaciones que van desde 13.2 GB hasta 39.4 GB. En pruebas independientes sobre SWE-bench-Live, resuelve 12 de 25 problemas, igualando a Opus 4.6 (medium) y superando a su propio modelo base. Su licencia MIT permite uso comercial sin restricciones, y soporta tanto inglés como chino, además de capacidades de visión (image-text-to-text).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.6-35B-A3B, con soporte multimodal (vision) |
| Parametros totales | 35 mil millones (35B) |
| Parametros activos | 3 mil millones (A3B) |
| Longitud de contexto | Hasta 262k tokens (recomendado 131k-262k con KV en q8_0) |
| Tipos de cuantizacion | UD-Q2_K_XL, UD-IQ3_XXS, UD-Q3_K_XL, UD-IQ4_XS, UD-Q4_K_S, UD-Q4_K_XL, UD-Q5_K_XL, UD-Q6_K_XL, UD-Q8_K_XL |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es una variante de Qwen3.6-35B-A3B, que emplea una arquitectura de mezcla de expertos (MoE) con 35B de parámetros totales y solo 3B activos por token. Esto permite una inferencia rápida incluso en hardware modesto, con un coste computacional comparable a un modelo denso de 3B pero con la capacidad de uno de 35B. La cuantización dinámica (UD) aplicada por dotnfc utiliza una imatrix propia, optimizada para preservar la calidad en tareas de código y razonamiento agéntico.

El modelo incluye soporte MTP (Multi-Token Prediction), una técnica de decodificación especulativa que predice varios tokens a la vez, acelerando la generación en llama.cpp y entornos compatibles. Además, incorpora el "Sharp chat template", un formato de conversación diseñado para producir respuestas más concisas y directas, lo que reduce la latencia percibida y mejora la eficiencia en interacciones largas. El entrenamiento original de Ornith-1.5 no se detalla en la información disponible, pero los benchmarks sugieren que fue optimizado para coding agéntico y conversación, en detrimento de conocimiento factual y razonamiento abstracto.

## Capacidades

- Generacion de codigo y correccion de errores en repositorios reales: resuelve 12 de 25 problemas de SWE-bench-Live.
- Razonamiento agéntico multi-paso: capaz de planificar y ejecutar secuencias de acciones para resolver tareas complejas.
- Conversacion multi-turno de alta calidad: puntuacion de 67.2 en Claw-Eval, superando a su base (65.3) y a modelos similares.
- Soporte de decodificacion especulativa (MTP): acelera la generacion en llama.cpp.
- Capacidades multimodales: el pipeline es image-text-to-text, aunque la informacion disponible no detalla el alcance de la vision.
- Soporte multilingue: ingles y chino.
- Tool calling y function calling: no confirmado explicitamente, pero el enfoque agéntico y el uso en SWE-bench sugieren compatibilidad con herramientas.
- Eficiencia de contexto: KV cache reducida en RAM (<5 GB para 262k contexto a 16-bit), gracias a la arquitectura MoE.

## Casos de uso

- Asistente de programacion local: un desarrollador puede ejecutar Tiel en una GPU de 24 GB (cuantizacion Q4_K_XL) y usarlo para revisar codigo, sugerir parches y explicar fragmentos complejos, sin enviar datos a la nube.
- Agente de reparacion de incidencias en CI/CD: integrado en un pipeline, el modelo puede recibir un issue de GitHub, analizar el repositorio, generar un patch y verificar su validez, con un tiempo medio de 8.6 minutos por intento.
- Chatbot de soporte tecnico con contexto largo: gracias a su ventana de hasta 262k tokens y su buen rendimiento en conversacion multi-turno, puede mantener historiales extensos de interacciones con clientes sin perder coherencia.
- Herramienta de documentacion automatica: con el Sharp template, genera respuestas concisas y directas, ideales para producir documentacion tecnica a partir de codigo o conversaciones.
- Analisis de imagenes con instrucciones de codigo: al ser multimodal, puede recibir capturas de pantalla de errores o diagramas y generar codigo o explicaciones basadas en ellos (aunque esta capacidad no esta detallada).
- Prototipado rapido de agentes: su licencia MIT y su formato GGUF permiten integrarlo en frameworks como llama.cpp, Ollama o vLLM para experimentar con arquitecturas agénticas sin coste de licencia.

## Benchmarks y rendimiento

Los datos de benchmarks provienen de la model card del autor, basados en pruebas independientes (25 problemas de SWE-bench-Live, Claw-Eval multi-turno y MMLU-Pro). No se especifica la metodologia completa, pero se comparan con modelos locales similares.

| Benchmark | Tiel-Coder (4-bit) | Ornith-1.5 base | Nail (Qwen3.6-35B-A3B) | Dirk (Qwen3.8-27B denso) | Opus 4.6 (medium) |
|---|---|---|---|---|---|
| SWE-bench-Live (problemas resueltos de 25) | 12 | 8 | 9 (estimado, "tres menos que Tiel") | 15 | 12 |
| Tiempo medio por intento (minutos) | 12.3 | 5.5 (stock Qwen3.6) | 15.7 | 20.1 | no disponible |
| MMLU-Pro (4-bit) | 73.7 | 78.0 (con su template) | 84.0 | no disponible | no disponible |
| Claw-Eval multi-turno | 67.2 | 65.3 | 60.5 | no disponible | no disponible |

Nota: los valores de Ornith-1.5 base y Nail se extraen de las comparaciones del autor. El tiempo medio de Tiel es 12.3 minutos, con una mediana de 8.6.

## Requisitos de hardware

- VRAM estimada: desde 13.2 GB (Q2_K_XL) hasta 39.4 GB (Q8_K_XL). La cuantizacion recomendada es Q4_K_XL (23.3 GB) para 24-32 GB de RAM+VRAM combinada.
- GPUs recomendadas: RTX 3090/4090 (24 GB) para Q4_K_XL, RTX A6000 o similar (48 GB) para Q6_K_XL/Q8_K_XL. En 16 GB (RTX 3080/4080 laptop) se puede usar IQ3_XXS o Q2_K_XL con offloading parcial.
- El modelo cabe en GPUs de consumo si se combina RAM y VRAM: el autor sugiere que con 24 GB totales (por ejemplo, 16 GB VRAM + 8 GB RAM) se puede ejecutar Q4_K_XL con contexto reducido, aunque recomienda al menos 32 GB para comodidad.
- Opciones de despliegue: llama.cpp (nativo), Ollama (si se convierte a GGUF compatible), vLLM con soporte GGUF (limitado), y cualquier framework que cargue GGUF.
- Latencia y throughput: no se proporcionan datos exactos, pero la arquitectura MoE con 3B activos permite velocidades de generacion tipicas de modelos de 3B, con el overhead de la decodificacion especulativa MTP. El tiempo medio por intento en SWE-bench es de 12.3 minutos, lo que incluye multiples pasos de razonamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | SWE-bench-Live (25) | MMLU-Pro (4-bit) | Claw-Eval |
|---|---|---|---|---|---|---|---|
| Tiel-Coder-35B-A3B (este) | 35B | 3B | 262k | MIT | 12 | 73.7 | 67.2 |
| Nail-Qwen3.6-35B-A3B-GGUF | 35B | 3B | 262k (estimado) | MIT (probable) | 9 (estimado) | 84.0 | 60.5 |
| Dirk-Qwen3.8-27B-GGUF | 27B | 27B (denso) | no disponible | MIT (probable) | 15 | no disponible | no disponible |
| Ornith-1.5-35B-A3B (base) | 35B | 3B | 262k (estimado) | MIT | 8 | 78.0 | 65.3 |

Tiel se posiciona como un modelo equilibrado para coding agéntico y conversación, sacrificando conocimiento general (MMLU-Pro bajo) frente a alternativas como Nail, que prioriza razonamiento. Dirk, al ser denso, ofrece mejores resultados en SWE-bench pero con mayor coste computacional.

## Limitaciones y advertencias

- Rendimiento deficiente en tareas de conocimiento general y razonamiento abstracto: MMLU-Pro de 73.7, muy por debajo de Nail (84.0). No es adecuado para examenes o preguntas enciclopedicas.
- La cuantizacion Q2_K_XL pierde capacidad real y no se recomienda para coding agéntico; solo usar como ultimo recurso.
- El "Sharp chat template" reduce la calidad de las respuestas en contextos donde se necesitan explicaciones detalladas o matizadas.
- No se han publicado resultados de benchmarks en la informacion disponible para tareas de vision (image-text-to-text), a pesar de que el pipeline lo indica.
- Riesgo de alucinacion en codigo: como cualquier modelo de lenguaje, puede generar parches incorrectos; se recomienda validacion manual o pruebas automatizadas.
- Sesgos potenciales: no se documentan sesgos especificos, pero al estar entrenado principalmente con datos en ingles y chino, puede tener limitaciones en otros idiomas.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo base Ornith-1.5 podria tener atribuciones adicionales (no detalladas en la informacion proporcionada).
- Para produccion, es necesario verificar la compatibilidad del formato MTP con el framework de despliegue elegido, ya que no todos los backends soportan decodificacion especulativa.

## Enlaces

- Repositorio HuggingFace (dotnfc): https://huggingface.co/dotnfc/Tiel-Coder-35B-A3B-GGUF-MTP
- Version no MTP (peculiar-ragdoll): https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF
- Version MLX: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ4e
- Modelo base Ornith-1.5: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Plantilla Sharp chat: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Evaluacion independiente de modelos 35B-A3B: https://github.com/h00nigan/35b-moe-eval
- Ficha en interfaze.ai: https://interfaze.ai/models/peculiar-ragdolltiel-coder-35b-a3b-gguf
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/tiel-coder-35b-a3b-gguf-peculiar-ragdoll
