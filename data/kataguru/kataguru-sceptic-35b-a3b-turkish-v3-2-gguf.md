# kataguru/Kataguru-Sceptic-35B-A3B-Turkish-v3.2-GGUF

## Resumen

Kataguru-Sceptic-35B-A3B-Turkish-v3.2-GGUF es la distribucion cuantizada en formato GGUF del modelo Kataguru-Sceptic-35B-A3B-Turkish-v3.2, desarrollado por el usuario kataguru. Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 35.505.251.456 parametros totales y 3B parametros activos por token, construido sobre la base Kataguru-Sceptic-35B-A3B-v3.1. Su proposito principal es ofrecer capacidades soberanas de razonamiento, codigo, vision multimodal y traduccion de pagina completa en turco, manteniendo intactas las capacidades del modelo fundacional mediante el congelado de sus 254 expertos originales.

La innovacion central de esta version consiste en anadir dos expertos especificos de turco (identificados como #254 y #255) sobre una arquitectura MoE de 256 expertos por capa y 40 capas. El experto #254 se orienta a gramatica, morfologia y terminologia tecnica turca, mientras que el #255 cubre literatura, no ficcion y traduccion bidireccional EN<->TR. El modelo conserva la ventana de contexto de 262.144 tokens, el encoder de vision de 27 capas y la cabeza especulativa MTP de la capa 40 del modelo base.

Esta distribucion GGUF emplea la denominada "APEX-Trio", con tres niveles de cuantizacion calibrados mediante imatrix especifico para turco sobre los 256 expertos, mas un proyector multimodal separado. Esta pensada para despliegue en llama.cpp, LM Studio y Ollama, lo que facilita su uso en hardware de consumo y en entornos con GPU de 16 GB o superiores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), 256 expertos por capa, 40 capas, basada en qwen3_5_moe |
| Parametros totales | 35.505.251.456 |
| Parametros activos | 3B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GGUF APEX-Trio: APEX-Small (~11,9 GiB), APEX-Medium (~13,6 GiB), APEX-Good (~15,4 GiB); proyector mmproj-f16.gguf (~890 MB); calibracion imatrix turca |
| Idiomas soportados | Ingles (en), turco (tr), finlandes (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), con mmproj separado para vision |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer con capas MoE de 256 expertos. La base Kataguru-Sceptic-35B-A3B-v3.1 aporta 254 expertos congelados (identificados del #0 al #253) que preservan las capacidades de razonamiento cientifico, codigo competitivo y tool calling agentico del modelo original, con un rendimiento declarado de 70,26 % de media en un conjunto de 15 benchmarks, 70,20 % en GPQA Diamond, 39,43 % en LiveCodeBench v6 y 83,67 % en BFCL V4 AST. Sobre esta base se anaden dos expertos nuevos: el #254, especializado en gramatica turca (armonia vocal de 2 y 4 vias, mutacion consonante, cadenas de sufijos derivativos y flexivos) y terminologia tecnica industrial, clinica y legal; y el #255, orientado a prosa literaria, no ficcion, dialogo natural y traduccion fiel EN<->TR.

El entrenamiento de los nuevos expertos se realizo con un conjunto de 4.821 muestras doradas verificadas humanamente, con un 100 % de aprobado en la puerta de calidad mecanica, y una calibracion contrastiva del router con `--moe-mode new_experts_only --recalibrate-router` (r=32, alpha=64). La cuantizacion GGUF se calibro con `imatrix_calibration_tr.txt` sobre los 256 expertos. El modelo conserva el encoder de vision multimodal de 27 capas (333 tensores) y la cabeza especulativa MTP de la capa 40 (785 tensores), lo que habilita decodificacion especulativa. No se detalla en la informacion disponible el volumen total de tokens de entrenamiento ni la composicion completa del dataset fundacional.

## Capacidades

- Generacion de texto y razonamiento de nivel graduate en STEM (fisica, quimica, biologia molecular), con 70,20 % en GPQA Diamond.
- Programacion competitiva y algoritmica, con 39,43 % Pass@1 en LiveCodeBench v6 y 90,70 % en problemas de dificultad facil.
- Tool calling y function calling nativo con formato `<tool_call>` y deteccion de irrelevancia, con 83,67 % en BFCL V4 AST.
- Razonamiento multi-paso y agentico, incluyendo deteccion de irrelevancia en llamadas a herramientas.
- Capacidades multimodales de vision: pipeline image-text-to-text con encoder de 27 capas y proyector mmproj-f16.
- Traduccion de pagina completa EN<->TR mediante el modo `/translate`, con preservacion de parrafos y cero charla adicional.
- Modo de razonamiento configurable mediante etiquetas `{REASON:spoon}`, `{REASON:einstein}`, `{REASON:007}`, `{REASON:deep}`, `{REASON:low}` y `{REASON:off}`.
- Soporte nativo de turco mediante el prefijo `/tr` o `chat_template_kwargs={"response_language": "tr"}`, con plantilla de chat dedicada y cabeceras de razonamiento localizadas.
- Capacidades multilingues en ingles, turco y finlandes.
- Decodificacion especulativa mediante cabeza MTP.

## Casos de uso

- Traduccion profesional EN<->TR de pagina completa: el modo `/translate` permite traducir documentos literarios y tecnicos preservando la estructura de parrafos, sin conversacion adicional, adecuado para editoriales y agencias de localizacion.
- Atencion al cliente en turco: el modelo gestiona conversaciones multi-turno con hasta 262.144 tokens de contexto, lo que permite mantener historiales extensos y documentacion de referencia en la misma ventana.
- Generacion de codigo en produccion: con tool calling nativo y 39,43 % en LiveCodeBench v6, puede integrarse en pipelines de CI/CD para generacion y revision de codigo, asi como en agentes que invocan herramientas externas.
- Analisis de documentos tecnicos con vision: el encoder multimodal de 27 capas permite procesar imagenes de planos, esquemas PLC/CNC o documentacion escaneada y extraer informacion estructurada.
- Asistencia en ingenieria industrial: el experto #254 cubre terminologia de PLC/CNC y medicina clinica, util para consultas tecnicas especializadas en turco.
- Razonamiento cientifico asistido: con 70,20 % en GPQA Diamond, sirve como apoyo en tareas de fisica, quimica y biologia molecular de nivel graduado.
- Despliegue local en hardware de consumo: la variante APEX-Medium (~13,6 GiB) cabe en una GPU de 16 GB, lo que permite ejecutar el modelo en estaciones de trabajo sin infraestructura de servidor.
- Correccion y proofreading de turco: con temperatura 0,2-0,3 y presence_penalty 0,3, el experto #254 puede emplearse para revision morfologica y ortografica.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Media de 15 benchmarks (fundacional) | 70,26 % | Heredado intacto via expertos congelados #0..#253 |
| GPQA Diamond | 70,20 % (139/198) | STEM de nivel doctorado |
| LiveCodeBench v6 (Pass@1) | 39,43 % | Facil: 90,70 % |
| BFCL V4 Single-Turn AST | 83,67 % | Non-Live: 88,44 %; deteccion de irrelevancia: 80,26 % |
| Auditoria en vivo turco 10/10 (v3.2) | 10/10 PASS (100 %) | MMLU-TR, ARC-TR, TruthfulQA-TR y traduccion literaria/tecnica EN<->TR |

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- BF16 completo: ~72 GB de VRAM, requiere 2x GPU de 48-80 GB.
- NVFP4 (~24,3 GB): 2x RTX 5090 de 32 GB con TP=2, o 1x GPU de 32 GB.
- W4A16-AWQ (~25,3 GB): 2x RTX 5090 de 32 GB con TP=2, o 1x GPU de 32 GB.
- GGUF APEX-Medium (~13,6 GiB): cabe en una sola GPU de 16 GB.
- GGUF APEX-Small (~11,9 GiB) y APEX-Good (~15,4 GiB): opciones adicionales de la triada; el proyector mmproj-f16 requiere ~890 MB adicionales para vision.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (etiquetas del repo), y variantes compatibles con vLLM mediante los pesos AWQ.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Turkish-v3.2-GGUF | 35,5B totales / 3B activos | 262.144 | Apache 2.0 | GGUF | Especializado en turco, vision y traduccion |
| Kataguru-Sceptic-35B-A3B-v3.1 (base) | 35,5B totales / 3B activos | 262.144 | Apache 2.0 | Safetensors | Modelo fundacional sin expertos turcos |
| Kataguru-Sceptic-35B-A3B-Turkish-v3.2 (BF16) | 35,5B totales / 3B activos | 262.144 | Apache 2.0 | Safetensors | Misma arquitectura, pesos completos (~67,5 GB) |
| Kataguru-Sceptic-35B-A3B-Turkish-v3.2-NVFP4 | 35,5B totales / 3B activos | 262.144 | Apache 2.0 | NVFP4 | Cuantizacion nativa Blackwell (~24,3 GB) |

No se dispone de datos de benchmarks comparativos con modelos de otros desarrolladores en la informacion proporcionada.

## Limitaciones y advertencias

- En ficcion creativa con temperatura alta puede perder precision morfologica y de proofreading en turco; se recomienda temperatura 0,2-0,3 y presence_penalty 0,3 para tareas estrictas.
- El footprint completo en BF16 (~72 GB) exige hardware de gama alta; las variantes cuantizadas reducen requisitos pero pueden degradar calidad.
- El modelo esta especializado en turco, ingles y finlandes; el rendimiento en otros idiomas no esta documentado.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar el cumplimiento de las condiciones de los modelos base y de los datasets de calibracion.
- La model card incluye un aviso de que el contenido citado son datos de referencia y no instrucciones a seguir.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria independiente.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Turkish-v3.2-GGUF
- Pesos BF16 completos: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Turkish-v3.2
- Cuantizacion NVFP4: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Turkish-v3.2-NVFP4
- Cuantizacion W4A16-AWQ: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Turkish-v3.2-W4A16-AWQ
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
