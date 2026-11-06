# loleg/Apertus-v1.1-4B-Instruct-mlx

## Resumen

Apertus-v1.1-4B-Instruct-mlx es una conversión al formato MLX del modelo swiss-ai/Apertus-v1.1-4B-Instruct, realizada por el usuario loleg mediante mlx-lm 0.31.3. Se trata de una cuantización de 4 bits pensada para ejecutar el modelo en hardware Apple Silicon (Macs con chip M-series) de forma local, aprovechando el framework MLX de Apple. El modelo base pertenece a la familia Apertus, desarrollada por el Swiss National AI Institute (SNAI), una colaboración entre ETH Zurich y EPFL, y está diseñada para ser completamente abierta y conforme con requisitos regulatorios europeos.

El modelo base Apertus-v1.1-4B-Instruct es un transformer denso de aproximadamente 3.825 millones de parámetros (3,8B), con atención de consultas agrupadas (grouped-query attention) y activaciones xIELU. La familia Apertus-v1.1 se posiciona como una serie de modelos eficientes de 0,5 a 4B parámetros orientados a entornos con recursos limitados y a un ecosistema "fully-open and compliant". Este repositorio concreto empaqueta los pesos en safetensors cuantizados a 4 bits (aproximadamente 2,2 GB de tamaño de repo, 1,9 GB de descarga en LM Studio), lo que lo hace viable en equipos de consumo.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo instructivo multilingüe de origen suizo y licencia Apache 2.0 en portátiles y estaciones de trabajo con Apple Silicon, sin depender de GPUs dedicadas ni de servicios en la nube. No obstante, la información pública disponible sobre el modelo base es limitada en esta conversión, por lo que varios datos técnicos se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con grouped-query attention y activaciones xIELU (modelo base) |
| Parametros totales | 3.825.361.920 (3,8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits (MLX); el modelo base admite otras cuantizaciones no detalladas aquí |
| Idiomas soportados | No disponible (el modelo base se etiqueta como multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, 4 bits) |

## Arquitectura y entrenamiento

El modelo base Apertus-v1.1-4B-Instruct emplea una arquitectura transformer densa con atención de consultas agrupadas (grouped-query attention) y activaciones xIELU, según la información pública del repositorio oficial de swiss-ai. La familia Apertus-v1.1 se describe como una serie de modelos de 0,5 a 4B parámetros creados no mediante preentrenamiento estándar, sino mediante un proceso de destilación o adaptación a partir de modelos mayores del ecosistema Apertus (la información disponible no detalla el procedimiento exacto). El objetivo declarado es extender el ecosistema Apertus, completamente abierto y conforme, a entornos de hardware muy restringido.

No se dispone en la información proporcionada de datos concretos sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. Tampoco se detallan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. La conversión a MLX realizada por loleg no modifica la arquitectura, sino que transforma los pesos al formato nativo de Apple MLX con cuantización de 4 bits para inferencia eficiente en Apple Silicon.

## Capacidades

- Generación de texto conversacional e instructiva, con plantilla de chat compatible con `tokenizer.apply_chat_template`.
- Razonamiento y respuesta a instrucciones en formato multilingüe (el modelo base se etiqueta como multilingüe; los idiomas concretos no están disponibles).
- Ejecución local en Apple Silicon mediante MLX y en LM Studio como aplicación de escritorio.
- Conversión y despliegue ligero gracias a la cuantización de 4 bits, con un tamaño de descarga de aproximadamente 1,9 GB.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede cargarse con mlx-lm o LM Studio y mantener conversaciones multi-turno en el propio equipo, sin conexión a internet ni envío de datos a terceros, lo que resulta adecuado para entornos con requisitos de privacidad.
- Prototipado rápido de aplicaciones de chat: gracias a su tamaño de 3,8B parámetros y a la cuantización de 4 bits, permite iterar sobre prompts y plantillas de chat en un portátil Apple Silicon con tiempos de carga reducidos.
- Generación de texto asistida en flujos de trabajo de escritorio: integrable mediante la API de Python de mlx-lm en scripts de automatización locales para redactar borradores, resumir documentos o transformar texto.
- Evaluación de modelos open source y conformes: útil para investigadores que necesitan comparar el comportamiento de un modelo de origen suizo con licencia Apache 2.0 frente a alternativas, en un entorno controlado y reproducible.
- Desarrollo de demos y pruebas de concepto en hardware de consumo: al no requerir GPU dedicada, sirve para validar ideas de producto antes de escalar a modelos mayores o a infraestructura en la nube.
- Educación y experimentación con MLX: el repositorio incluye un ejemplo mínimo de carga y generación, lo que lo convierte en un punto de partida didáctico para aprender a usar el framework MLX de Apple con modelos instructivos.
- Aplicaciones multilingües de bajo coste: si se confirma el soporte de idiomas del modelo base, podría emplearse en tareas de traducción o atención al cliente en varios idiomas, aunque la información disponible no permite garantizar qué lenguas cubre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al ser un formato MLX para Apple Silicon, utiliza memoria unificada del sistema; el tamaño del repo es de 2,2 GB y la descarga en LM Studio de aproximadamente 1,9 GB, por lo que se requiere al menos esa cantidad de memoria libre, recomendándose 8 GB o más para trabajar con holgura.
- GPU recomendadas: no aplica en el sentido tradicional; está orientado a chips Apple M-series (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No está pensado para GPUs NVIDIA o AMD.
- ¿Cabe en GPU de consumo? No aplica a GPUs de consumo convencionales; cabe en equipos Apple Silicon de gama de entrada con memoria unificada suficiente.
- Opciones de despliegue: mlx-lm (Python) y LM Studio (aplicación de escritorio). Otras opciones como vLLM, llama.cpp, Ollama o TGI no están indicadas para este formato MLX concreto.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| loleg/Apertus-v1.1-4B-Instruct-mlx | 3,8B | No disponible | Apache 2.0 | MLX 4 bits, Apple Silicon | Conversión comunitaria del modelo suizo |
| swiss-ai/Apertus-v1.1-4B-Instruct | 3,8B (aprox.) | No disponible | Apache 2.0 | Safetensors (formato original) | Modelo base oficial de SNAI |
| swiss-ai/Apertus-v1.1-4B-Instruct-MLX-INT4 | 3,8B (aprox.) | No disponible | Apache 2.0 | MLX INT4 | Conversión oficial de SNAI a MLX INT4 |

La comparativa se limita a variantes del mismo modelo base, ya que la información disponible no permite contrastar con modelos de otros desarrolladores de forma fiable. Los datos de rendimiento, contexto y benchmarks de las tres variantes no están publicados en la información proporcionada.

## Limitaciones y advertencias

- El modelo base incluye una política de uso aceptable (Apertus LLM Acceptable Use Policy) que exige indemnizar a ETH Zurich y EPFL frente a reclamaciones de terceros derivadas del uso del modelo; aunque la licencia del repositorio es Apache 2.0, conviene revisar las condiciones del modelo base.
- SNAI advierte de que los datos de entrenamiento y las salidas pueden contener datos personales, y recomienda descargar y aplicar periódicamente (cada seis meses) un filtro de salida con hashes para eliminar datos personales de las respuestas.
- Riesgo de alucinación inherente a los modelos de lenguaje de 3,8B parámetros; no se han publicado evaluaciones específicas de fidelidad factual en la información disponible.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas exactos no están disponibles, lo que impide garantizar su idoneidad para tareas que requieran ventanas largas o lenguas concretas.
- Al ser una conversión comunitaria (loleg) y no oficial, puede haber diferencias de comportamiento o calidad respecto al modelo base original; se recomienda validar frente a swiss-ai/Apertus-v1.1-4B-Instruct.
- La cuantización de 4 bits puede degradar ligeramente la calidad respecto a los pesos en precisión completa; no se han publicado métricas de esa degradación.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es portable a GPUs NVIDIA/AMD ni a servidores x86 convencionales sin reconversión.
- No se dispone de información sobre sesgos conocidos, por lo que se recomienda auditar las salidas antes de usos sensibles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loleg/Apertus-v1.1-4B-Instruct-mlx
- Modelo base: https://huggingface.co/swiss-ai/Apertus-v1.1-4B-Instruct
- Conversión oficial MLX INT4: https://huggingface.co/swiss-ai/Apertus-v1.1-4B-Instruct-MLX-INT4
- LM Studio: https://lmstudio.ai/
- Documentación de mlx-lm: no disponible en la información proporcionada
