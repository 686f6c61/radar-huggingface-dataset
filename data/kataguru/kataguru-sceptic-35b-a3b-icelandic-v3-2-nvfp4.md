# kataguru/Kataguru-Sceptic-35B-A3B-Icelandic-v3.2-NVFP4

## Resumen
Kataguru-Sceptic-35B-A3B-Icelandic-v3.2-NVFP4 es una cuantizacion NVFP4 (FP4 de cuatro bits nativo para Blackwell) del modelo Kataguru-Sceptic-35B-A3B-Icelandic-v3.2, desarrollado por el usuario kataguru sobre la base Kataguru-Sceptic-35B-A3B-v3.1. Se trata de un modelo de mezcla de expertos (MoE) de 35.951.822.704 parametros totales con 3B de parametros activos por token, orientado a razonamiento cientifico, codigo competitivo, tool calling y traduccion bidireccional ingles-islandes-finlandes, con capacidad multimodal de vision (image-text-to-text).

La innovacion principal del modelo base es la arquitectura de "lengua soberana" 254 + 2: se congelan los 254 expertos centrales del Sceptic original (preservando intactas sus capacidades de razonamiento STEM, codigo y agentes) y se anaden dos expertos especializados en islandes, uno dedicado a gramatica, morfologia y terminologia tecnica, y otro a literatura, no ficcion y traduccion bidireccional. Esta version NVFP4 reduce el peso a aproximadamente 24,3 GB, lo que permite desplegarlo en dos RTX 5090 de 32 GB o en una unica GPU de 32 GB, frente a los aproximadamente 72 GB que exige el BF16 completo.

El modelo resulta relevante para desarrolladores que necesitan un LLM con cobertura real de islandes (idioma con escasa representacion en modelos abiertos) sin renunciar a capacidades generales de razonamiento y codigo, y que ademas quieren aprovechar el hardware Blackwell con cuantizacion FP4 nativa calibrada especificamente en islandes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe), 40 capas, 256 expertos por capa, encoder de vision multimodal de 27 capas, cabeza especulativa MTP en la capa 40 |
| Parametros totales | 35.951.822.704 |
| Parametros activos | 3B por token (segun model card) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (compressed-tensors, ~24,3 GB); el suite oficial incluye BF16 (~67,5 GB), W4A16-AWQ (~25,3 GB) y GGUF APEX (Small, Medium, Good + mmproj) |
| Idiomas soportados | Ingles (en), islandes (is), finlandes (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors NVFP4); variantes GGUF y AWQ en repositorios hermanos |

## Arquitectura y entrenamiento
El modelo es un transformer MoE con 40 capas y 256 expertos por capa. La base v3.1 contenia 254 expertos centrales con 3B de parametros activos por token; la version v3.2 congela esos 254 expertos (#0..#253) para evitar olvido catastrofico y anade dos expertos nuevos: el #254, especializado en gramatica, morfologia (4 casos, 3 generos, declinaciones fuertes y debiles, umlaut U e I, regimen casual irregular) y terminologia tecnica industrial, medica y legal; y el #255, orientado a prosa literaria, no ficcion, dialogo natural y traduccion fiel EN <-> IS. El ajuste se realizo con un Language Bank de 4.833 muestras doradas verificadas por humanos, con calibracion contrastiva del router (modo new_experts_only, recalibracion de router, r=32, alpha=64).

La cuantizacion NVFP4 se calibro especificamente en islandes (calib_nvfp4_awq_256_is.jsonl e imatrix_calibration_is.txt) combinada con un ancla STEM/coding. Se preservan intactos el encoder de vision de 27 capas (333 tensores), la cabeza especulativa MTP de decodificacion especulativa (785 tensores) y la ventana de contexto de 262.144 tokens. El modelo incluye una plantilla de chat nativa en islandes (chat_template.jinja) con etiquetas de control /is, /translate y niveles de razonamiento configurables ({REASON:spoon}, {REASON:einstein}, {REASON:007}, {REASON:deep}, {REASON:low}, {REASON:off}). No se detalla en la informacion disponible la composicion completa del dataset de preentrenamiento ni si hubo RLHF o DPO en la base.

## Capacidades
- Generacion de texto y razonamiento cientifico de nivel posgrado (fisica, quimica, biologia molecular), con GPQA Diamond de 70,20 %.
- Codigo competitivo y algoritmico (LiveCodeBench v6 Pass@1 de 39,43 %; 90,70 % en problemas faciles).
- Tool calling nativo con AST <tool_call> y deteccion de irrelevancia (BFCL V4 Single-Turn AST de 83,67 %; 88,44 % en no-live; 80,26 % en deteccion de irrelevancia).
- Vision multimodal: pipeline image-text-to-text con encoder de 27 capas, orientado a comprension de documentos y traduccion de pagina completa.
- Traduccion bidireccional EN <-> IS y soporte de finlandes, con modo /translate sin charla conversacional y preservacion de parrafos.
- Modo de razonamiento configurable en profundidad mediante etiquetas {REASON:...}.
- Capacidades industriales especificas: PLC/CNC y terminologia de ingenieria, medicina clinica y patentes.
- Decodificacion especulativa mediante cabeza MTP integrada.
- Soporte de conversacion multi-turno con contexto de 262.144 tokens.

## Casos de uso
- Traduccion profesional EN <-> IS de documentacion tecnica y legal: el modo /translate produce traduccion sin charla adicional y preserva la estructura de parrafos, adecuado para contratos, patentes y manuales gracias al experto #254 especializado en terminologia estatutaria y de patentes.
- Localizacion de productos para el mercado islandes: el modelo genera texto nativo con morfologia correcta (casos, generos, declinaciones) usando /is, lo que reduce la revision linguistica frente a modelos genericos que fallan en flexión islandesa.
- Atencion al cliente en islandes y finlandes: conversaciones multi-turno con contexto de 262.144 tokens permiten gestionar historiales largos e incorporar documentacion de producto en el mismo prompt.
- Procesamiento de documentos escaneados con vision: el encoder multimodal de 27 capas permite extraer y traducir pagina completa de facturas, formularios o manuales tecnicos en islandes.
- Agentes de automatizacion con tool calling: el soporte nativo de <tool_call> con 83,67 % en BFCL V4 permite construir agentes que consulten APIs, bases de datos o sistemas internos, con deteccion de irrelevancia para evitar llamadas erroneas.
- Asistencia en ingenieria industrial: consultas sobre PLC/CNC y terminologia de automatizacion, cubiertas por el experto #254 y por el nucleo congelado de la base.
- Razonamiento STEM en investigacion: analisis de problemas de fisica, quimica y biologia molecular con GPQA Diamond de 70,20 %, util para pre-revision de hipotesis o tutoria avanzada.
- Generacion de codigo en pipelines de CI/CD: con LiveCodeBench v6 de 39,43 % y soporte de tool calling, puede integrarse en revision de parches o generacion de tests, aunque requiere validacion humana por su tasa de fallo en problemas dificiles.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Media de 15 benchmarks (nucleo) | 70,26 % | Heredado intacto de los expertos congelados #0..#253 |
| GPQA Diamond | 70,20 % (139/198) | Física, química y biología molecular de nivel posgrado |
| LiveCodeBench v6 (Pass@1) | 39,43 % | Easy: 90,70 % |
| BFCL V4 Single-Turn AST | 83,67 % | Non-Live: 88,44 %; deteccion de irrelevancia: 80,26 % |
| Auditoria islandesa 10/10 | 10/10 PASS (100 %) | Leaderboard Miðeind (WikiQA-IS, GEC-IS, Idioms-IS, ARC-IS) y traduccion literaria/tecnica de pagina completa EN <-> IS |

No se han publicado en la informacion disponible resultados desglosados de los 15 benchmarks individuales ni comparaciones numericas con modelos alternativos.

## Requisitos de hardware
- VRAM para BF16 completo: aproximadamente 72 GB (2x GPU de 48-80 GB).
- VRAM para NVFP4 (esta version): aproximadamente 24,3 GB de pesos; ejecutable en 2x RTX 5090 de 32 GB con tensor parallelism 2, o en 1 GPU de 32 GB.
- VRAM para W4A16-AWQ: aproximadamente 25,3 GB, compatible con vLLM universal.
- VRAM para GGUF APEX-Medium: aproximadamente 13,6 GiB, cabe en una GPU consumer de 16 GB.
- GPU recomendadas: Blackwell (RTX 5090, B200) para NVFP4 nativo; A100/H100 para BF16 o AWQ.
- Opciones de despliegue: transformers (libreria declarada), vLLM (variante AWQ), llama.cpp/Ollama (variantes GGUF con mmproj para vision), TGI no confirmado en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Icelandic-v3.2-NVFP4 | 35,9B totales / 3B activos | 262.144 | Apache 2.0 | Especializado en islandes y finlandes, multimodal, NVFP4 |
| Kataguru-Sceptic-35B-A3B-Icelandic-v3.2 (BF16) | 35,9B totales / 3B activos | 262.144 | Apache 2.0 | Mismo modelo sin cuantizar; ~67,5 GB |
| Kataguru-Sceptic-35B-A3B-v3.1 (base) | 35,9B totales / 3B activos | 262.144 | Apache 2.0 | Sin los dos expertos islandeses anadidos |
| Alternativas de otros desarrolladores para islandes | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias
- En ficcion creativa con temperatura alta puede perder precision morfologica; el autor recomienda temperature=0,2-0,3 y presence_penalty=0,3 para tareas estrictas de correccion y morfologia islandesa.
- El footprint BF16 (~72 GB) exige hardware de gama alta; la version NVFP4 solo es plenamente eficiente en GPUs Blackwell con soporte FP4 nativo.
- La cuantizacion NVFP4 puede introducir degradacion respecto al BF16, aunque el autor declara calibracion especifica en islandes; no se publican metricas de la perdida exacta por cuantizacion.
- Riesgo de alucinacion inherente a modelos generativos, especialmente en terminologia tecnica muy especializada (patentes, medicina clinica) donde no se documenta validacion externa.
- Cobertura linguistica limitada a ingles, islandes y finlandes; el rendimiento en otros idiomas no esta documentado.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validacion independiente de la comunidad.
- Aunque la licencia es Apache 2.0, conviene verificar las obligaciones de atribucion del modelo base v3.1 y de los pesos originales.
- El uso en produccion de traduccion legal o medica requiere revision humana: el autor no documenta certificacion ni auditoria externa de calidad en esos dominios.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Icelandic-v3.2-NVFP4
- Pesos maestros BF16: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Icelandic-v3.2
- Variante W4A16-AWQ: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Icelandic-v3.2-W4A16-AWQ
- Variante GGUF APEX: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Icelandic-v3.2-GGUF
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada
