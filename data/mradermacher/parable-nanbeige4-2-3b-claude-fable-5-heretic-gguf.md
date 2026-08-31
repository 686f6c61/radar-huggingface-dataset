# mradermacher/Parable-Nanbeige4.2-3B-Claude-Fable-5-heretic-GGUF

## Resumen

Parable-Nanbeige4.2-3B-Claude-Fable-5-heretic-GGUF es una colección de cuantizaciones GGUF del modelo homónimo, creada por mradermacher. El modelo base, desarrollado por FesarovLab, es una variante del modelo Nanbeige4.2-3B, un transformer con bucle (looped transformer) de aproximadamente 4.170 millones de parámetros, fine-tuneado con datos de "Claude Fable" y sometido a abliteration para eliminar rechazos. El resultado es un modelo conversacional, con capacidades de razonamiento y uso de herramientas, que soporta inglés y chino, con una ventana de contexto de 256K tokens según fuentes externas. Esta versión GGUF permite su ejecución en hardware modesto mediante llama.cpp, Ollama u otros motores compatibles, manteniendo la licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucle (looped transformer) |
| Parametros totales | 4.169.800.704 (~4,17B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens (segun fuentes externas) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Nanbeige4.2, que emplea una arquitectura transformer con bucle (looped transformer) para mejorar el razonamiento multi-step. Sobre esta base, se realizó un fine-tuning con un dataset denominado "Claude Fable" (posiblemente fábulas o narrativas) y posteriormente se aplicó la técnica de abliteration, que elimina las capas de rechazo del modelo, resultando en una versión "uncensored". No se dispone de detalles adicionales sobre el volumen de datos de entrenamiento, el número de tokens o el uso de RLHF/DPO. La cuantización GGUF fue realizada por mradermacher, quien ofrece tanto versiones estáticas como versiones con imatrix (en un repositorio separado).

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento multi-step gracias a la arquitectura con bucle.
- Soporte de tool calling / function calling (segun los tags del modelo).
- Capacidad de uso como agente conversacional con integración de herramientas.
- Sin censura (uncensored) debido a la abliteration, lo que permite generar contenido sin restricciones temáticas.
- Ventana de contexto larga (256K tokens) para manejar documentos extensos o conversaciones prolongadas.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (256K tokens), lo que permite mantener el historial completo de una interacción sin truncamientos. Su soporte de tool calling facilita la integración con sistemas de ticketing o bases de conocimiento.
- Generación de contenido creativo sin restricciones: al ser uncensored, es adecuado para escribir ficción, guiones, poesía o cualquier texto que requiera explorar temas sensibles sin filtros. Su capacidad de razonamiento ayuda a mantener coherencia narrativa en tramas complejas.
- Análisis y resumen de documentos extensos: con 256K de contexto, puede procesar libros, informes técnicos o contratos completos y extraer conclusiones o resúmenes ejecutivos. Es útil en entornos legales o de investigación donde se manejan documentos largos.
- Desarrollo de agentes conversacionales con herramientas: su soporte de function calling permite construir asistentes que consultan APIs, bases de datos o servicios externos. El tamaño reducido (4,17B) facilita el despliegue en entornos con recursos limitados.
- Traducción automática entre inglés y chino: aunque no está especializado en traducción, su bilingüismo permite traducir textos con un nivel aceptable, especialmente en contextos conversacionales o técnicos.
- Prototipado rápido de chatbots en entornos de desarrollo: gracias a las cuantizaciones GGUF, puede ejecutarse en CPU o GPU de gama baja, lo que permite iterar rápidamente en el diseño de experiencias conversacionales sin necesidad de infraestructura costosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo o sus variantes.

## Requisitos de hardware

- Para la cuantización Q4_K_M (2,7 GB de pesos), se recomienda al menos 4 GB de VRAM para inferencia con contexto moderado (p. ej., 8K tokens). Con contexto de 256K, la memoria de KV cache puede superar los 8 GB, por lo que se aconseja limitar el contexto o usar cuantizaciones más bajas.
- Para Q8_0 (4,5 GB), se necesitan al menos 6 GB de VRAM para contexto corto; para contexto largo, se requiere más memoria.
- Para f16 (8,4 GB), se necesitan al menos 10 GB de VRAM, lo que lo hace viable en GPUs como RTX 3080/3090 o A10.
- En CPU, las cuantizaciones Q4_K_M y Q5_K_M pueden ejecutarse con 8-16 GB de RAM, aunque la velocidad será menor.
- Motores compatibles: llama.cpp, Ollama, LM Studio, vLLM (con conversión previa a formato compatible), TGI (con adaptaciones).
- La latencia estimada para Q4_K_M en una GPU RTX 4090 es de aproximadamente 20-30 tokens/s; en CPU (16 núcleos) baja a 5-10 tokens/s. Estos valores son orientativos y dependen de la implementación y el contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Parable-Nanbeige4.2-3B (este) | 4,17B | 256K | Apache 2.0 | GGUF |
| Qwen2.5-3B | 3,09B | 32K | Apache 2.0 | Safetensors, GGUF |
| Llama-3.2-3B | 3,21B | 128K | Llama 3.2 | Safetensors, GGUF |
| Phi-3.5-mini | 3,82B | 128K | MIT | Safetensors, GGUF |

No se dispone de datos de rendimiento comparativos (benchmarks) para estos modelos en la información proporcionada. La comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Al ser un modelo "uncensored" (abliterado), puede generar contenido ofensivo, ilegal o perjudicial sin filtros. El usuario es responsable del uso que haga de él.
- No se han publicado evaluaciones de sesgos o alucinaciones; es probable que presente los mismos sesgos que el modelo base Nanbeige4.2, entrenado principalmente con datos en inglés y chino.
- La ventana de contexto de 256K es una afirmación externa; no se ha verificado en este repositorio. En la práctica, el rendimiento con contextos muy largos puede degradarse.
- La licencia Apache 2.0 permite uso comercial, pero no se garantiza la ausencia de restricciones sobre el contenido generado (especialmente si se usa para fines sensibles).
- Las cuantizaciones de baja precisión (Q2_K, Q3_K) pueden degradar significativamente la calidad de las respuestas; se recomienda usar Q4_K_M o superior para tareas críticas.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/mradermacher/Parable-Nanbeige4.2-3B-Claude-Fable-5-heretic-GGUF
- Repositorio HuggingFace (i1-GGUF con imatrix): https://huggingface.co/mradermacher/Parable-Nanbeige4.2-3B-Claude-Fable-5-heretic-i1-GGUF
- Modelo base (FesarovLab): https://huggingface.co/FesarovLab/Parable-Nanbeige4.2-3B-Claude-Fable-5-heretic
- Página de LLM Explorer con datos del modelo: https://llm-explorer.com/model/AnkitAI%2FParable-Nanbeige4.2-3B-Claude-Fable-5,44Rd5sKUA1dV9IzxrdPh3l
