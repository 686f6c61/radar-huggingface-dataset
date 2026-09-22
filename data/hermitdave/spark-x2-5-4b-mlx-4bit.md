# hermitdave/Spark-X2.5-4B-MLX-4bit

## Resumen

Spark-X2.5-4B-MLX-4bit es una conversion a 4 bits del modelo XHToken/Spark-X2.5-4B, un modelo denso de 4.112.079.360 parametros desarrollado por el equipo SparkLLM y orientado a cargas de trabajo agenticas en dispositivo. La conversion la firma el usuario hermitdave y se ha realizado con mlx-lm 0.31.3 sobre el soporte de arquitectura oficial de Spark-MLX-LLM, orquestada por Hermes Agent de Nous Research. El resultado es un artefacto de 2,2 GB en disco y aproximadamente 2,26 GB de memoria de GPU en tiempo de ejecucion, pensado para Apple Silicon.

El modelo hereda la caracteristica mas destacable del original: una ventana de contexto nativa de 1.048.576 tokens construida sobre un patron de atencion hibrido que alterna 3 capas de ventana deslizante (window 512) con 1 capa de atencion completa, en 36 capas totales (27 deslizantes y 9 completas). Esa combinacion mantiene el coste de atencion contenido incluso a un millon de tokens, algo poco habitual en modelos de 4B.

La relevancia de esta ficha es doble. Por un lado, demuestra que un modelo agentico de 4B con contexto de 1M puede ejecutarse en un portatil Mac dentro de un presupuesto de memoria de 2,3 GB. Por otro, documenta de forma honesta el coste de cuantizar absolutamente todo, incluida la tabla de embeddings: la perplejidad sube un 13,0 % respecto a la base en bf16. El autor advierte ademas, citando al equipo upstream, que el esquema de 4 bits puede degradar la precision de argumentos en llamadas a herramientas con esquema restringido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion hibrida (3 capas sliding-window + 1 capa full-attention, repetido), GQA, RoPE parcial en capas full-attention, puertas sigmoideas de salida de atencion por cabeza, MLP GELU paralelo |
| Parametros totales | 4.112.079.360 (aproximadamente 4,11 B) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 1.048.576 tokens nativos (1M) |
| Tipos de cuantizacion | MLX affine 4-bit, group size 64, 4,505 bits efectivos por peso; `self_attn.g_proj` (unas 187.000 parametros) y los pesos RMSNorm se mantienen en BF16; embeddings en 4-bit con lm_head atado. Existe version base en BF16 (8,2 GB) |
| Idiomas soportados | No disponible. Las pruebas del autor incluyen prompts en ingles y aritmetica en chino, pero no hay lista oficial de idiomas |
| Licencia | Apache 2.0 (misma que el modelo upstream) |
| Formato de pesos | safetensors cuantizados para MLX (libreria `mlx`), con el fichero de arquitectura `spark2_5.py` incluido en el repo |

## Arquitectura y entrenamiento

La arquitectura del modelo original combina atencion global y local: 36 capas organizadas en un ciclo de 3 capas con ventana deslizante de 512 tokens seguidas de 1 capa de atencion completa, lo que da 27 capas deslizantes y 9 completas. Las capas completas usan RoPE parcial (25 % de dimensiones rotadas, theta de 5M), mientras que las deslizantes aplican RoPE completo con theta de 10k. El modelo tiene dimension oculta 2560, 16 cabezas de atencion con 4 cabezas KV (GQA), dimension de cabeza 256, MLP con GELU paralelo e intermedio de 10240, y un vocabulario de 131.072 tokens con embeddings atados. Una innovacion destacable son las puertas sigmoideas de salida de atencion por cabeza, que escalan cada cabeza individualmente; el autor las conserva en BF16 precisamente porque la implementacion upstream las marca como sensibles a la cuantizacion agresiva.

No hay informacion en la model card sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se detalla el proceso de entrenamiento del modelo base. Lo que si documenta el repo de la conversion es el procedimiento de cuantizacion: mlx-lm 0.31.3, cuantizacion affine de 4 bits con group size 64, manteniendo en BF16 las puertas de atencion y los RMSNorm, y una arquitectura personalizada (`spark2_5`) que aun no esta en mlx-lm upstream y que se carga mediante el mecanismo `model_file`. El modo de pensamiento (thinking) esta activado por defecto en la plantilla de chat y se puede desactivar con `enable_thinking=False`.

## Capacidades

- Generacion de texto conversacional en ingles y, segun las pruebas de humo del autor, tambien en chino (aritmetica en chino correcta).
- Razonamiento con modo de pensamiento activado por defecto mediante la plantilla de chat; se puede desactivar explicitamente.
- Matematicas basicas: el smoke test del autor verifica `53 × 42 = 2226` a temperatura 0, coincidiendo con la salida de referencia del proveedor.
- Tool calling / function calling: el autor valida una llamada bien formada `get_weather(city="Paris", unit="celsius")` con la estructura de tokens especiales esperada. El repo Spark-MLX-LLM incluye parseo de tool calls.
- Capacidades agenticas: el modelo se presenta como "compact agentic model" y esta etiquetado como `agentic` y `long-context`, orientado a flujos multi-paso.
- Contexto nativo de 1M tokens, apto para concatenar documentos extensos o historiales de conversacion muy largos sin trocear.
- Ejecucion 100 % local en Apple Silicon sin acceso a red ni GPU dedicada, con un consumo de memoria en tiempo de ejecucion de 2,26 GB.
- No se documentan capacidades de vision, audio ni generacion de imagenes.

## Casos de uso

- Agentes locales con tool calling en portatiles Mac: el modelo encaja en 2,26 GB de memoria unificada y produce llamadas a herramientas con el formato de tokens especiales esperado, por lo que se puede usar como cerebro de un agente que consulte APIs externas desde un Mac sin GPU dedicada.
- Analisis de repositorios completos o bases de codigo grandes: con 1M tokens de contexto nativo se puede inyectar el arbol de un proyecto mediano y hacer preguntas transversales sin recurrir a recuperacion fragmentada.
- Procesamiento de documentos legales o tecnicos extensos: contratos, normativas o informes de cientos de paginas caben en una sola ventana, lo que simplifica la extraccion de clausulas y la comparacion entre secciones.
- Resumen de transcripciones largas: reuniones o podcasts de varias horas se pueden resumir en una unica pasada, evitando la perdida de coherencia tipica del chunking.
- Asistente de atencion al cliente autoalojado: al ejecutarse en local, los datos del cliente no salen del dispositivo; el modo thinking permite respuestas razonadas y el contexto largo mantiene el hilo de conversaciones multi-turno prolongadas.
- Extraccion de informacion estructurada en local: el modelo puede generar JSON o argumentos de herramientas, aunque hay que tener en cuenta la advertencia del autor sobre la perdida de precision en argumentos con esquema restringido a 4 bits.
- Prototipado y evaluacion rapida de arquitecturas hibridas: con 2,2 GB en disco, es viable cargar y descargar variantes en una misma sesion de experimentacion en un Mac.
- Aplicaciones con requisitos de privacidad estrictos (sanidad, legal, defensa): inferencia totalmente offline, sin telemetria ni llamadas a servicios externos.
- Chat multilingue ligero: hay evidencia de funcionamiento en ingles y chino, aunque sin lista oficial de idiomas conviene validar el idioma objetivo antes de produccion.

## Benchmarks y rendimiento

El autor publica una unica medida de calidad, realizada en un M3 Max con 64 GB, sobre aproximadamente 24.600 tokens de *Pride and Prejudice* (Gutenberg) con ventanas de 1024 tokens:

| Metrica | Base BF16 | Esta version 4-bit | Delta |
|---|---|---|---|
| Perplejidad (menor es mejor) | 14,45 ± 0,27 | 16,33 ± 0,31 | +13,0 % |
| Tamano en disco | 8,2 GB | 2,2 GB | −73 % |
| Memoria de GPU en ejecucion | ~8,3 GB | 2,26 GB | −73 % |

Velocidad de decodificacion: 21 tokens/s en modo greedy con 256 tokens generados. Primer token en 0,23 s con un prompt de 26 tokens. Ambas medidas en el mismo M3 Max.

Pruebas de humo cualitativas a temperatura 0, todas superadas: `53 × 42 = 2226`, velocidad de tren 80 km/h, capital de Anhui → Hefei, aritmetica correcta en chino y llamada a herramienta `get_weather(city="Paris", unit="celsius")` bien formada.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ni para esta conversion ni para el modelo base.

## Requisitos de hardware

- VRAM/memoria unificada: aproximadamente 2,26 GB en tiempo de ejecucion con la cuantizacion de 4 bits. La base en BF16 necesita unos 8,3 GB.
- Plataforma: exclusivamente Apple Silicon (MLX). No hay soporte CUDA ni ROCm documentado para este repositorio.
- GPU recomendadas: no aplica el catalogo habitual (A100, H100, RTX 4090); el modelo esta probado en un M3 Max con 64 GB de memoria unificada. Deberia funcionar en cualquier Mac con Apple Silicon y suficiente memoria unificada, aunque no se documentan pruebas en M1, M2 ni en configuraciones de 8 o 16 GB.
- Cabe en GPU de consumo: si, en el sentido de que cabe en Macs de consumo con memoria unificada. No se dispone de datos de ejecucion en GPU NVIDIA o AMD.
- Opciones de despliegue: `mlx-lm` (version 0.31 o superior) mediante CLI `python3 -m mlx_lm.generate` o API Python `load`/`generate`; alternativamente el repositorio Spark-MLX-LLM, que aporta wrappers de CLI `spark-mlx-*` y parseo de tool calls. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: 21 tokens/s en decodificacion greedy (256 tokens) y 0,23 s hasta el primer token con un prompt de 26 tokens, medidos en un M3 Max de 64 GB. No hay datos de throughput con lotes ni con prompts de contexto largo.

## Comparativa con modelos similares

La informacion disponible solo permite comparar esta conversion con su propio modelo base. No hay datos publicados de modelos de terceros en la documentacion proporcionada, por lo que la comparacion con alternativas de la misma categoria queda como no disponible.

| Modelo | Parametros | Contexto | Formato y tamano | Licencia | Rendimiento documentado |
|---|---|---|---|---|---|
| hermitdave/Spark-X2.5-4B-MLX-4bit | 4,11 B | 1.048.576 tokens | MLX 4-bit, 2,2 GB | Apache 2.0 | Perplejidad 16,33; 21 tok/s en M3 Max |
| XHToken/Spark-X2.5-4B (base) | 4,11 B | 1.048.576 tokens | BF16 safetensors, 8,2 GB | Apache 2.0 | Perplejidad 14,45 |
| Spark-X2.5-1.7B | No disponible en la informacion proporcionada (solo se menciona en el titulo de la cita) | No disponible | No disponible | No disponible | No disponible |
| Otras alternativas de ~4B | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Perdida de calidad medible: la perplejidad pasa de 14,45 a 16,33 (+13,0 %) respecto a la base en BF16. Es el coste de cuantizar todo, incluida la tabla de embeddings.
- Precision en tool calling: el propio autor advierte que, segun el equipo upstream, el esquema de 4 bits puede reducir la precision de los argumentos en llamadas a herramientas con esquema restringido. Para flujos agenticos criticos recomienda una compilacion de 8 bits.
- Sesgos: no hay informacion sobre sesgos, composicion del dataset de entrenamiento ni evaluaciones de seguridad en la documentacion disponible.
- Alucinacion: no se han publicado evaluaciones de veracidad ni de tasa de alucinacion. El contexto de 1M tokens no elimina este riesgo y puede incluso amplificarlo si el material inyectado contiene ruido.
- Idiomas: no existe lista oficial de idiomas soportados. Solo hay evidencia empirica de ingles y chino en las pruebas de humo; el rendimiento en castellano no esta verificado.
- Restricciones de licencia: Apache 2.0, que permite uso comercial. El fichero `spark2_5.py` incluido deriva de Spark-MLX-LLM y tambien es Apache 2.0. No obstante, se trata de una conversion de la comunidad (hermitdave) y no de un artefacto oficial del equipo SparkLLM.
- Portabilidad: el formato MLX obliga a Apple Silicon. Migrar a CUDA requiere reconvertir los pesos, algo que no se documenta en el repositorio.
- Madurez del repositorio: publicado el 22 de septiembre de 2026, con 0 descargas y 0 likes en el momento de la consulta, y sin resultados de benchmarks estandar. No hay historial de uso en produccion.
- Compatibilidad de libreria: requiere mlx-lm 0.31 o superior, porque `spark2_5` aun no esta integrado en mlx-lm upstream y se carga mediante el mecanismo `model_file`.
- Memoria en contexto largo: aunque el patron hibrido reduce el coste de la KV cache en las 27 capas deslizantes, las 9 capas de atencion completa siguen escalando con la longitud, por lo que el consumo real con prompts cercanos a 1M tokens no esta documentado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/hermitdave/Spark-X2.5-4B-MLX-4bit
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-4B
- mlx-lm: https://github.com/ml-explore/mlx-lm
- Spark-MLX-LLM (soporte de arquitectura y CLI): https://github.com/XHToken/Spark-MLX-LLM
- Hermes Agent (Nous Research): https://hermes-agent.nousresearch.com

Nota sobre la busqueda web: los resultados devueltos no guardan relacion con el modelo (corresponden a articulos de radiologia sobre vasculitis) y no aportan informacion adicional utilizable.
