# kataguru/Kataguru-Sceptic-35B-A3B-Basque-v3.2

## Resumen

Kataguru-Sceptic-35B-A3B-Basque-v3.2 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) especializado en euskera, desarrollado por el usuario kataguru. Se construye sobre el modelo fundacional Kataguru-Sceptic-35B-A3B-v3.1, un MoE multimodal de 35.000 millones de parametros totales con 3.000 millones de parametros activos por token y 254 expertos enrutados por capa. La version v3.2 amplia cada una de las 40 capas MoE de 254 a 256 expertos, anadiendo dos expertos dedicados al euskera mientras congela por completo los 254 expertos originales.

La propuesta tecnica central es preservar intactas las capacidades de razonamiento cientifico, codigo y uso de herramientas del modelo base (sin olvido catastrofico) y anadir competencia nativa en euskera mediante especializacion de expertos y calibracion contrastiva del router. El modelo hereda la ventana de contexto de 262K tokens, un codificador de vision de 27 capas y una cabeza especulativa MTP en la capa 40.

Es relevante ahora porque representa un intento de "soberania linguistica" para el euskera sobre una base generalista potente, con licencia Apache 2.0. No obstante, en el momento de redactar esta ficha el repositorio es una ranura de pre-publicacion: los pesos no estan subidos y la publicacion se anuncia en menos de un mes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (familia qwen3_5_moe), 40 capas MoE, 256 expertos por capa (254 congelados + 2 de euskera) |
| Parametros totales | 35B (aproximado, segun nomenclatura del modelo) |
| Parametros activos | 3B por token |
| Longitud de contexto | 262K tokens |
| Tipos de cuantizacion | NVFP4-W4ATTN-AWQ Hybrid (20,3 GB), AWQ W4A16, GGUF APEX-Trio (APEX-Small, APEX-Medium, APEX-Good) + mmproj-f16 + mtp |
| Idiomas soportados | Ingles (en), euskera (eu), finlandes (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (NVFP4 compressed-tensors, AWQ), GGUF; pesos aun no publicados |

## Arquitectura y entrenamiento

El modelo es un transformer de tipo Mixture-of-Experts con 40 capas MoE, cada una con 256 expertos enrutados y 3B parametros activos por token sobre 35B totales. La innovacion principal frente al modelo base es la expansion de 254 a 256 expertos: los expertos #0 a #253 se mantienen congelados al 100 % y se anaden el experto #254 (gramatica y terminologia tecnica en euskera: alineamiento ergativo-absolutivo, concordancia polipersonal Nor-Nori-Nork, sufijos posposicionales aglutinantes, terminologia de ingenieria, PLC/CNC, medicina clinica y patentes) y el experto #255 (prosa literaria en euskera y traduccion bidireccional EN <-> EU). El router se calibra de forma contrastiva para limitar la fuga de enrutamiento fuera del idioma objetivo a menos del 0,50 %.

No se especifica en la informacion disponible el volumen de tokens de entrenamiento ni la composicion exacta del dataset de euskera. El modelo conserva del base un codificador de vision de 27 capas (333 tensores) y una cabeza especulativa MTP (decodificacion especulativa) en la capa 40 (785 tensores). La model card menciona una "certificacion de spot-check" del dataset completo y una evaluacion nativa en euskera pendientes antes de la publicacion de pesos. No se detalla si hubo RLHF o DPO en esta fase de especializacion.

## Capacidades

- Generacion de texto y razonamiento de nivel graduado en STEM (fisica, quimica, biologia molecular) heredado del nucleo Sceptic.
- Codigo y programacion competitiva (LiveCodeBench v6 Pass@1 de 37,71 % en el base).
- Tool calling nativo con generacion de AST en formato `<tool_call>` y deteccion de irrelevancia (BFCL V4 Single-Turn AST 83,61 % en el base).
- Vision multimodal mediante codificador de 27 capas y proyector mmproj-f16.
- Traduccion bidireccional EN <-> EU en modo dedicado `/translate`, con preservacion de parrafos y cero charla adicional.
- Respuestas nativas en euskera mediante etiqueta `/eu` o `chat_template_kwargs={"response_language": "eu"}`.
- Control de profundidad de razonamiento: `{REASON:spoon}` (auditoria cientifica de 7 pasos), `{REASON:einstein}` (sintesis de 10 angulos), `{REASON:low}`, `{REASON:none}`.
- Decodificacion especulativa mediante cabeza MTP.
- Soporte multilingue en ingles, euskera y finlandes.

## Casos de uso

- Traduccion profesional EN <-> EU: el modo `/translate` permite traducir paginas completas de prosa literaria o documentacion tecnica preservando estructura de parrafos, adecuado por el experto #255 y la ventana de 262K tokens para documentos largos.
- Atencion al cliente en euskera: conversaciones multi-turno con contexto largo gracias a los 262K tokens y respuesta nativa con `/eu`, cubriendo terminologia administrativa y tecnica.
- Generacion de codigo en produccion: el modelo hereda tool calling (BFCL V4 83,61 %) y puede integrarse en pipelines de CI/CD para generacion y revision de codigo, con capacidad de razonamiento algorithmic.
- Documentacion tecnica bilingue: redaccion de manuales de ingenieria, PLC/CNC o patentes en euskera y traduccion al ingles, apoyandose en el experto #254 de terminologia tecnica.
- Analisis de documentos con vision: extraccion y descripcion de contenido de imagenes y PDF escaneados mediante el codificador de vision, util en digitalizacion de archivos en euskera.
- Razonamiento cientifico asistido: consultas de nivel graduado en STEM con el modo `{REASON:spoon}` para auditoria paso a paso, aprovechando el rendimiento GPQA Diamond del nucleo.
- Agentes multi-paso: uso del tool calling y la cabeza MTP para flujos agenticos con baja latencia en despliegues con vLLM o llama.cpp.

## Benchmarks y rendimiento

Los resultados publicados corresponden al modelo base Kataguru-Sceptic-35B-A3B (medidos en 2x RTX 5090 con TP=2) y se heredan intactos segun el autor. La evaluacion especifica en euskera esta pendiente.

| Benchmark | Kataguru Sceptic 35B-A3B (base) | Notas |
|---|---|---|
| Media de 15 benchmarks | 70,05 % | Bateria de produccion con CUDAGraphs |
| GPQA Diamond | 69,70 % (138/198) | STEM de nivel doctorado |
| BFCL V4 Single-Turn AST | 83,61 % (Live AST 79,13 %) | Tool calling |
| LiveCodeBench v6 Pass@1 | 37,71 % (66/175) | Programacion competitiva |
| IFEval Strict (prompt/instruccion) | 70,24 % / 77,70 % | Formato y restricciones |
| Suite en euskera (HiTZ EvalEU) | pendiente | EusProficiency, EusExams, EusReading, EusTrivia |

No se han publicado resultados de benchmarks especificos del modelo v3.2 en euskera en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: NVFP4-W4ATTN-AWQ Hybrid ocupa 20,3 GB; AWQ W4A16 requiere aproximadamente 1x 24-32 GB de GPU; GGUF APEX-Medium cabe en una GPU o Mac de 16 GB.
- GPU recomendadas: RTX 5090 (NVFP4 nativo), 2x RTX 5090 con TP=2 para los formatos completos, GPUs de 24-32 GB para AWQ W4A16.
- Cabe en GPU de consumo: si, en RTX 5090 (NVFP4) y en GPUs de 16 GB con GGUF APEX-Medium.
- Opciones de despliegue: vLLM (AWQ W4A16, NVFP4), llama.cpp, LM Studio y Ollama (GGUF).
- Latencia y throughput: no disponibles en la informacion proporcionada; la cabeza MTP de decodificacion especulativa esta pensada para reducir latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Basque-v3.2 | 35B totales / 3B activos (MoE) | 262K | Apache 2.0 | Pre-publicacion (pesos no subidos) |
| Kataguru-Sceptic-35B-A3B-v2.6 | 35B totales / 3B activos (MoE) | no disponible | no disponible | Publicado (NVFP4, GGUF) |
| Kataguru-Sceptic-35B-A3B-v3.1 | 35B totales / 3B activos (MoE) | 262K | no disponible | Modelo base referenciado |

No se dispone de datos de benchmarks comparativos con modelos de otros desarrolladores en la informacion proporcionada.

## Limitaciones y advertencias

- Pre-publicacion: los pesos no estan subidos al repositorio; el autor anuncia la publicacion en menos de un mes, por lo que no es utilizable en produccion actualmente.
- La evaluacion nativa en euskera (HiTZ EvalEU) y la traduccion literaria/tecnica estan pendientes de ejecucion final.
- Riesgo de alucinacion inherente a los modelos generativos; el autor enfatiza "honestidad epistemica" en el nucleo pero no se aportan metricas de calibracion especificas.
- La fuga de enrutamiento fuera del idioma objetivo se declara contenida por debajo del 0,50 %, pero no se aportan datos independientes que lo verifiquen.
- Idiomas cubiertos limitados a ingles, euskera y finlandes; el rendimiento en castellano u otros idiomas no esta documentado.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo derivado conviene verificar las condiciones del modelo base v3.1.
- La model card esta parcialmente truncada y no detalla el dataset de entrenamiento ni posibles sesgos conocidos.

## Enlaces

- Hugging Face: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Basque-v3.2
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
- Version previa NVFP4: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v2.6-NVFP4
- Version previa GGUF: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v2.6-GGUF
- README GGUF: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v2.6-GGUF/blob/main/README.md
