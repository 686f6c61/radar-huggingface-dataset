# kataguru/Kataguru-Sceptic-35B-A3B-Hungarian-v3.2-W4A16-AWQ

## Resumen

Kataguru-Sceptic-35B-A3B-Hungarian-v3.2-W4A16-AWQ es la variante cuantizada a INT4 (W4A16, empaquetado `compressed-tensors`) del modelo Kataguru-Sceptic-35B-A3B-Hungarian-v3.2, desarrollado por el usuario independiente kataguru. Se trata de un modelo de lenguaje de arquitectura Mixture-of-Experts con 35.951.822.704 parametros totales (3B activos por token) y una ventana de contexto de 262.144 tokens, especializado en hungaro y con capacidades multimodales de vision (pipeline `image-text-to-text`).

El modelo parte de la base Kataguru-Sceptic-35B-A3B-v3.1 y anade dos expertos dedicados al hungaro sobre los 254 expertos originales congelados, alcanzando 256 expertos por capa en 40 capas. La version v3.2 incorpora un experto de gramatica, morfologia y terminologia tecnica hungara (18 casos gramaticales, armonia vocalica, conjugacion definida/indefinida) y otro de literatura, no ficcion y traduccion bidireccional EN-HU. El resultado es un modelo "soberano" para hungaro que preserva intactas las capacidades de razonamiento cientifico, codigo y tool calling del modelo base.

Esta publicacion concreta es la cuantizacion AWQ W4A16 (aproximadamente 25,3 GB), disenada para despliegue universal en vLLM con kernels Marlin. Su relevancia practica radica en que reduce el requisito de VRAM desde los ~72 GB del BF16 hasta permitir ejecucion en 2x RTX 5090 de 32 GB (TP=2) o una unica GPU de 32 GB, manteniendo el contexto largo y el encoder de vision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) tipo transformer, `qwen3_5_moe`, 40 capas, 256 expertos por capa |
| Parametros totales | 35.951.822.704 |
| Parametros activos | 3B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | W4A16-AWQ (INT4 pesos, activaciones FP16), `group_size=32`, observer MSE, empaquetado `compressed-tensors` pack-quantized |
| Idiomas soportados | Ingles (en), hungaro (hu), finlandes (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), ~25,3 GB; variantes adicionales BF16 (~67,5 GB), NVFP4 (~24,3 GB) y GGUF (APEX-Small/Medium/Good + mmproj) |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con 40 capas y 256 expertos por capa. Los expertos #0 a #253 corresponden al nucleo congelado del modelo Sceptic 35B-A3B v3.1 (3B parametros activos por token) y se mantienen intactos para evitar olvido catastrofico. Los expertos #254 y #255 son nuevos: el primero cubre gramatica hungara (18 casos, armonia vocalica anterior/posterior/redondeada, conjugacion definida frente a indefinida, cadenas de sufijos uralicos) y terminologia de ingenieria industrial, PLC/CNC, medicina clinica y patentes; el segundo cubre prosa literaria, no ficcion, dialogo natural y traduccion fiel EN-HU.

El entrenamiento de los nuevos expertos se realizo sobre un banco de 5.062 muestras verificadas humanamente (100% de aprobacion en las puertas de calidad mecanica), con calibracion contrastiva de router (`--moe-mode new_experts_only --recalibrate-router`, r=32, alpha=64). La cuantizacion emplea un conjunto de calibracion especifico en hungaro (`calib_nvfp4_awq_256_hu.jsonl` e `imatrix_calibration_hu.txt`). Se preservan el encoder de vision multimodal de 27 capas (333 tensores) y la cabeza especulativa MTP de la capa 40 (785 tensores). El modelo incluye una plantilla de chat nativa en hungaro (`chat_template.jinja`) con etiquetas de control `/hu`, `/translate` y niveles de razonamiento `{REASON:spoon}`, `{REASON:einstein}`, `{REASON:007}`, `{REASON:deep}`, `{REASON:low}` y `{REASON:off}`.

## Capacidades

- Generacion de texto y razonamiento cientifico de nivel posgrado (fisica, quimica, biologia molecular).
- Programacion competitiva y algoritmica (LiveCodeBench v6).
- Tool calling nativo con etiquetas `<tool_call>` y deteccion de irrelevancia (BFCL V4).
- Vision multimodal: procesamiento de imagen y texto combinados (`image-text-to-text`).
- Traduccion bidireccional EN-HU y traduccion de pagina completa preservando parrafos, con modo `/translate` sin conversacion adicional.
- Modo de razonamiento configurable en profundidad mediante etiquetas `{REASON:...}`.
- Capacidades multilingues en ingles, hungaro y finlandes.
- Decodificacion especulativa mediante cabeza MTP en la capa 40.
- Soporte de contexto largo de hasta 262.144 tokens.

## Casos de uso

- Traduccion profesional EN-HU de documentacion tecnica y legal: el modo `/translate` preserva la estructura de parrafos y evita conversacion adicional, adecuado para patentes, normativa y manuales gracias al experto #254 especializado en terminologia estatutaria y de patentes.
- Localizacion de literatura y no ficcion: el experto #255 esta entrenado especificamente en prosa literaria y dialogo natural, lo que permite traducir obras completas manteniendo registro y estilo.
- Atencion al cliente en hungaro: la ventana de 262.144 tokens permite gestionar conversaciones multi-turno con historial extenso y documentos adjuntos, con soporte de tool calling para consultas a sistemas internos.
- Analisis de documentacion industrial con vision: el encoder multimodal de 27 capas permite procesar esquemas, diagramas PLC/CNC y capturas de pantalla junto con texto para diagnostico o extraccion de datos.
- Asistencia a programacion en produccion: el soporte de tool calling (BFCL V4 AST 83,67%) y la cabeza MTP permiten integrarlo en pipelines de CI/CD para revision de codigo, generacion de tests y decodificacion especulativa de baja latencia.
- Agentes multi-paso con contexto largo: la combinacion de contexto de 262.144 tokens, tool calling nativo y niveles de razonamiento configurables permite construir agentes que planifican, invocan herramientas y mantienen estado durante sesiones prolongadas.
- Procesamiento de expedientes clinicos en hungaro: el experto #254 incluye terminologia medica clinica, util para resumen y extraccion de informacion de historiales.
- Despliegue en infraestructura limitada: la cuantizacion W4A16 permite servir el modelo en una GPU de 32 GB o en 2x RTX 5090 con TP=2, habilitando casos de uso de inferencia local o en edge con requisitos de soberania de datos.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Media de 15 benchmarks del nucleo | 70,26 % | Heredado intacto de los expertos congelados #0..#253 |
| GPQA Diamond | 70,20 % (139/198) | Física, química y biología molecular de nivel posgrado |
| LiveCodeBench v6 (Pass@1) | 39,43 % | Easy: 90,70 % |
| BFCL V4 Single-Turn AST | 83,67 % | Non-Live: 88,44 %; deteccion de irrelevancia: 80,26 % |
| Auditoria Live Hungarian 10/10 (v3.2) | 10/10 PASS (100 %) | NYTK HuMMLU, HuCOLA, HuBoolQ y traduccion literaria/tecnica EN-HU de pagina completa |

No se han publicado resultados desglosados de la cuantizacion W4A16 frente al BF16 en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: ~25,3 GB en W4A16-AWQ; ~24,3 GB en NVFP4; ~67,5 GB en BF16 (~72 GB segun el autor).
- GPU recomendadas: 2x RTX 5090 de 32 GB con tensor parallelism (TP=2) o una unica GPU de 32 GB para las variantes cuantizadas; 2x GPU de 48-80 GB (A100, H100) para BF16.
- Cabe en GPU consumer: si, en RTX 5090 de 32 GB con la cuantizacion W4A16; la variante GGUF APEX-Medium (~13,6 GiB) cabe en una GPU de 16 GB.
- Opciones de despliegue: vLLM (objetivo principal de esta variante, con kernels Marlin), llama.cpp/Ollama para la variante GGUF, transformers como libreria base.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Hungarian-v3.2-W4A16-AWQ | 35,9B totales (3B activos) | 262.144 | Apache 2.0 | Hugging Face | Especializado en hungaro, multimodal, INT4 |
| Kataguru-Sceptic-35B-A3B-Hungarian-v3.2 (BF16) | 35,9B totales (3B activos) | 262.144 | Apache 2.0 | Hugging Face | Mismo modelo sin cuantizar, ~67,5 GB |
| Kataguru-Sceptic-35B-A3B-Hungarian-v3.2-NVFP4 | 35,9B totales (3B activos) | 262.144 | Apache 2.0 | Hugging Face | Cuantizacion nativa Blackwell, ~24,3 GB |

No se dispone de datos de benchmarks de modelos alternativos de terceros en la informacion proporcionada para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Ficcion creativa a temperatura alta: el autor recomienda `temperature=0.2-0.3` con `presence_penalty=0.3` para precision morfologica y correccion en hungaro.
- Riesgo de olvido catastrofico mitigado pero no eliminado: la estrategia de congelar los 254 expertos originales preserva el rendimiento del nucleo, pero no se documentan evaluaciones independientes del comportamiento del router tras la recalibracion.
- Cobertura linguistica limitada a ingles, hungaro y finlandes; el rendimiento en otros idiomas no esta documentado.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la ficha, sin validacion externa de la comunidad.
- La cuantizacion W4A16 puede introducir degradacion respecto al BF16; no se publican metricas de la perdida de calidad asociada.
- Es un modelo de autor individual sin gobernanza corporativa; conviene auditar sesgos y alucinaciones antes de uso en produccion.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias explicitas sobre exactitud en dominios regulados (medicina, legal, industrial).
- El contexto de 262.144 tokens puede requerir memoria KV adicional significativa en despliegue, no cuantificada en la informacion disponible.

## Enlaces

- Hugging Face (esta variante): https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Hungarian-v3.2-W4A16-AWQ
- Pesos maestros BF16: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Hungarian-v3.2
- Variante NVFP4: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Hungarian-v3.2-NVFP4
- Variante GGUF: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Hungarian-v3.2-GGUF
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
