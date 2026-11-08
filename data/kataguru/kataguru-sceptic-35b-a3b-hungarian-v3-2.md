# kataguru/Kataguru-Sceptic-35B-A3B-Hungarian-v3.2

## Resumen

Kataguru-Sceptic-35B-A3B-Hungarian-v3.2 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) especializado en húngaro, desarrollado por el usuario kataguru como parte de su linea "Sovereign Language Editions". Se construye sobre el modelo base Kataguru-Sceptic-35B-A3B-v3.1, un modelo multiproposito de 35B parametros totales y 3B parametros activos por token, y anade dos expertos dedicados al hungaro sobre los 254 expertos originales, que permanecen congelados. El objetivo declarado es preservar intactas las capacidades de razonamiento cientifico, codigo y tool calling del modelo base mientras se incorpora competencia nativa en hungaro.

La innovacion principal es la arquitectura que el autor denomina "254 + 2": en lugar de un continued pre-training clasico que sobrescribe todos los parametros, se expanden las 40 capas MoE de 254 a 256 expertos, anadiendo el experto #254 (gramatica y terminologia tecnica hungara) y el #255 (literatura y traduccion bidireccional EN-HU), junto con una calibracion contrastiva del router. El modelo declara un contexto de 262K tokens, codificador de vision de 27 capas y cabeza especulativa MTP en la capa 40.

Es relevante ahora porque representa un enfoque poco habitual de adaptacion linguistica via expansion de expertos en lugar de fine-tuning masivo, y porque el autor publica benchmarks medidos del core (GPQA Diamond 69,70 %, BFCL V4 83,61 %, LiveCodeBench v6 37,71 %). No obstante, en el momento de redactar esta ficha el repositorio esta en cola de entrenamiento y los pesos no estan disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (denominada qwen3_5_moe por el autor), 40 capas MoE con 256 expertos por capa |
| Parametros totales | 35B (aproximado, segun nomenclatura del modelo) |
| Parametros activos | 3B por token |
| Longitud de contexto | 262K tokens |
| Tipos de cuantizacion | NVFP4-W4ATTN-AWQ Hybrid (20,3 GB), AWQ W4A16, GGUF APEX-Trio (APEX-Small, APEX-Medium, APEX-Good) con mmproj-f16 y mtp |
| Idiomas soportados | Ingles (en), hungaro (hu), finlandes (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (previsto), AWQ, NVFP4, GGUF (previsto; pesos aun no subidos) |

## Arquitectura y entrenamiento

El modelo es un transformer con arquitectura MoE de 40 capas, cada una con 256 expertos de los cuales se activan 3B parametros por token. La estrategia de adaptacion al hungaro consiste en congelar al 100 % los 254 expertos del core Sceptic (#0 a #253) y anadir dos expertos especialistas: el #254 orientado a gramatica hungara (18 casos gramaticales, armonia vocalica, conjugacion definida/indefinida, cadenas de sufijos uralicos, terminologia de ingenieria, PLC/CNC, medicina clinica y patentes) y el #255 orientado a prosa literaria, no ficcion moderna, dialogo natural y traduccion fiel EN-HU. Se aplica ademas una calibracion contrastiva del router para limitar la fuga de enrutamiento hacia el idioma no objetivo a menos del 0,50 %.

El autor declara que no se modifican el codificador de vision de 27 capas (333 tensores), la cabeza especulativa MTP de la capa 40 (785 tensores) ni la ventana de contexto de 262K. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO. La model card menciona una "certificacion de spot-check del dataset completo" y una evaluacion de 15 benchmarks mas pruebas nativas en hungaro (NYTK HuMMLU, HuCOLA, HuBoolQ, traduccion literaria y tecnica) pendientes de ejecucion.

## Capacidades

- Generacion de texto y razonamiento cientifico de nivel graduate (el core reporta GPQA Diamond 69,70 %).
- Generacion de codigo y programacion competitiva (LiveCodeBench v6 Pass@1 37,71 %).
- Tool calling / function calling con generacion nativa de AST `<tool_call>` y deteccion de irrelevancia (BFCL V4 AST 83,61 %).
- Capacidades multimodales de vision mediante codificador de 27 capas (entrada image-text-to-text).
- Traduccion bidireccional EN-HU en modo dedicado `/translate`, con preservacion de parrafos y cero charlataneria.
- Control de profundidad de razonamiento mediante etiquetas: `{REASON:spoon}` (auditoria cientifica de 7 pasos), `{REASON:einstein}` (sintesis de 10 angulos), `{REASON:low}` y `{REASON:none}`.
- Soporte nativo de hungaro mediante etiqueta `/hu` o `chat_template_kwargs={"response_language": "hu"}`.
- Decodificacion especulativa mediante cabeza MTP en la capa 40.
- Multilingue en ingles, hungaro y finlandes.

## Casos de uso

- Traduccion profesional EN-HU y HU-EN: el modo `/translate` esta disenado para traducir paginas completas de prosa literaria y documentacion tecnica preservando la estructura de parrafos, adecuado para editoriales y despachos de traduccion jurada que necesiten pre-traduccion asistida.
- Atencion al cliente en hungaro: el experto #254 cubre conjugacion definida/indefinida y cadenas de sufijos, lo que permite conversaciones multi-turno gramaticalmente correctas con la ventana de 262K tokens para historiales largos.
- Generacion de codigo en produccion: el soporte de tool calling con AST nativo y BFCL V4 83,61 % permite integrar el modelo en pipelines de CI/CD que necesiten invocar funciones externas o validar llamadas estructuradas.
- Razonamiento cientifico y tecnico: con GPQA Diamond 69,70 % en el core, es util para asistencia en investigacion de posgrado, revision de literatura cientifica y sintesis de articulos tecnicos.
- Procesamiento de documentacion industrial: el experto #254 incluye terminologia PLC/CNC, patentes y medicina clinica, lo que lo hace adecuado para extraccion y resumen de manuales tecnicos en hungaro.
- Analisis de documentos con vision: el codificador de 27 capas permite procesar capturas de pantalla, diagramas tecnicos o formularios escaneados junto con texto en hungaro.
- Asistencia editorial en hungaro: el experto #255 esta orientado a prosa literaria y no ficcion, util para correccion estilistica, reescritura y generacion de dialogos naturales.

## Benchmarks y rendimiento

Los benchmarks publicados corresponden al core Kataguru Sceptic 35B-A3B, heredados segun el autor al 100 % por los expertos congelados. No hay resultados especificos del modelo hungaro todavia (pendientes de la suite NYTK HuMMLU, HuCOLA, HuBoolQ y evaluacion de traduccion).

| Benchmark | Resultado core Sceptic 35B-A3B | Notas |
|---|---|---|
| Media de 15 benchmarks | 70,05 % | Bateria de produccion con CUDAGraphs |
| GPQA Diamond | 69,70 % (138/198) | STEM nivel doctorado |
| BFCL V4 Single-Turn AST | 83,61 % (Live AST 79,13 %) | Tool calling |
| LiveCodeBench v6 Pass@1 | 37,71 % (66/175) | Programacion competitiva |
| IFEval Strict | 70,24 % (prompt) / 77,70 % (instruccion) | Formato y restricciones |
| Suite hungara (NYTK HuMMLU, HuCOLA, HuBoolQ) | Pendiente | No disponible |

## Requisitos de hardware

- GGUF APEX-Medium: segun el autor, cabe en una GPU o Mac con 16 GB de memoria.
- NVFP4-W4ATTN-AWQ Hybrid (20,3 GB): pensado para Blackwell RTX 5090 nativo; segun el autor, 1x GPU de 24-32 GB o 2x RTX 5090 con TP=2.
- AWQ W4A16: universal para vLLM, orientado a 1x GPU de 24-32 GB.
- Los benchmarks del core se midieron en 2x RTX 5090 con TP=2 y CUDAGraphs habilitados.
- Opciones de despliegue previstas: vLLM (AWQ y NVFP4), llama.cpp y Ollama (GGUF con mmproj-f16 y mtp).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. Como referencia estructural, el modelo se declara compatible con la familia qwen3_5_moe y comparte espacio con versiones anteriores del propio autor (v2.6, v3.1) y sus variantes GGUF, pero no se han publicado comparativas directas con alternativas de terceros.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Hungarian-v3.2 | 35B (3B activos) | 262K | Apache 2.0 | Pre-release (pesos no subidos) |
| Kataguru-Sceptic-35B-A3B-v3.1 | 35B (3B activos) | no disponible | Apache 2.0 | Disponible (modelo base) |
| Kataguru-Sceptic-35B-A3B-v2.6 | 35B (3B activos) | no disponible | Apache 2.0 | Disponible en GGUF |

## Limitaciones y advertencias

- Pre-release: los pesos no estan subidos al repositorio; el autor indica una ETA de menos de un mes para la publicacion.
- Los benchmarks publicados corresponden al core, no al modelo hungaro final; la evaluacion nativa en hungaro esta pendiente.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado; el autor menciona "epistemic honesty" como pilar del core pero no aporta metricas especificas.
- La fuga de enrutamiento hacia el idioma no objetivo se declara por debajo del 0,50 %, pero no se ha verificado de forma independiente.
- El modelo esta orientado a hungaro, ingles y finlandes; el rendimiento en otros idiomas no esta documentado.
- Licencia Apache 2.0 permite uso comercial, pero al tratarse de un pre-release conviene verificar los terminos finales y los pesos antes de integrarlo en produccion.
- La nomenclatura de arquitectura (qwen3_5_moe) no se detalla en la model card; conviene validar compatibilidad con frameworks antes del despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Hungarian-v3.2
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
- Version GGUF del base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1-GGUF
- Version anterior GGUF v2.6: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v2.6-GGUF/tree/main
