# kataguru/Kataguru-Sceptic-35B-A3B-Icelandic-v3.2-W4A16-AWQ

## Resumen

Kataguru-Sceptic-35B-A3B-Icelandic-v3.2-W4A16-AWQ es una cuantizacion INT4 (W4A16-AWQ, empaquetado con `compressed-tensors`) del modelo multimodal islandes Kataguru-Sceptic-35B-A3B-Icelandic-v3.2, publicado por el usuario kataguru en Hugging Face. Se trata de un modelo de mezcla de expertos (MoE) con 35.951.822.704 parametros totales y 3B parametros activos por token, construido sobre la base Kataguru-Sceptic-35B-A3B-v3.1 y orientado a texto, razonamiento, vision y traduccion de pagina completa entre islandes, ingles y finlandes.

La innovacion principal del modelo es su arquitectura de 256 expertos por capa (40 capas): 254 expertos congelados del nucleo Sceptic original y 2 expertos nuevos especializados en islandes (uno para gramatica, morfologia y terminologia tecnica; otro para literatura, no ficcion y traduccion bidireccional). Los expertos congelados preservan las capacidades de razonamiento cientifico, codigo y tool calling del modelo base, mientras que los nuevos anaden competencia linguistica especifica en islandes sin olvido catastrofico.

Esta version AWQ reduce el peso del modelo BF16 original (unos 67,5 GB) hasta aproximadamente 25,3 GB, lo que permite desplegarlo en configuraciones de una o dos GPU de gama alta. Es relevante para desarrolladores que necesiten un modelo soberano para islandes con capacidades multimodales y de agente, en un ecosistema donde los modelos de gran calidad para lenguas nordicas minoritarias son escasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer multimodal, `qwen3_5_moe`, 256 expertos por capa, 40 capas |
| Parametros totales | 35.951.822.704 |
| Parametros activos | 3B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | W4A16-AWQ (INT4 pesos, activaciones FP16), `group_size=32`, observer MSE, pack-quantized con `compressed-tensors`; el suite incluye BF16, NVFP4 y GGUF APEX |
| Idiomas soportados | Ingles (en), islandes (is), finlandes (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (AWQ INT4, `compressed-tensors`); variantes GGUF y NVFP4 en repos separados |

## Arquitectura y entrenamiento

El modelo es una mezcla de expertos con 256 expertos por capa sobre 40 capas. Los expertos #0 a #253 son el nucleo congelado heredado de Kataguru-Sceptic-35B-A3B-v3.1, que conserva intactas las capacidades de razonamiento cientifico, programacion competitiva, tool calling y control industrial PLC/CNC. Los expertos #254 y #255 se anaden especificamente para islandes: el primero cubre gramatica, morfologia (cuatro casos, tres generos, declinaciones fuertes y debiles, umlaut U e I, regimen casual irregular) y terminologia tecnica, medica y legal; el segundo cubre prosa literaria, no ficcion, dialogo natural y traduccion bidireccional EN-IS.

El entrenamiento de los nuevos expertos se realizo sobre un banco linguistico de 4.833 muestras verificadas humanamente, con calibracion contrastiva del router (`--moe-mode new_experts_only --recalibrate-router`, `r=32, alpha=64`). Se anadio una plantilla de chat nativa en islandes (`chat_template.jinja`) con modos `/is` y `/translate`, y una calibracion de cuantizacion dedicada en islandes (`calib_nvfp4_awq_256_is.jsonl`, `imatrix_calibration_is.txt`). El modelo conserva el encoder de vision multimodal de 27 capas (333 tensores) y la cabeza especulativa MTP de la capa 40 (785 tensores) del modelo base. No se detalla en la informacion disponible la composicion completa del dataset de preentrenamiento original, ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento de nivel graduate en STEM (fisica, quimica, biologia molecular).
- Programacion competitiva y algoritmica (LiveCodeBench v6).
- Tool calling y function calling nativo con `<tool_call>` en formato AST, incluida deteccion de irrelevancia.
- Razonamiento agente multi-paso (hereda capacidades del nucleo Sceptic).
- Vision multimodal: pipeline `image-text-to-text`, encoder de 27 capas.
- Traduccion bidireccional EN-IS y soporte de finlandes, con modo `/translate` de pagina completa que preserva parrafos y evita charlataneria.
- Modo islandes nativo mediante prefijo `/is` o `chat_template_kwargs={"response_language": "is"}`.
- Control de profundidad de razonamiento mediante etiquetas `{REASON:spoon}`, `{REASON:einstein}`, `{REASON:007}`, `{REASON:deep}`, `{REASON:low}` y `{REASON:off}`.
- Capacidades industriales heredadas: PLC/CNC, medicina clinica, terminologia estatutaria y de patentes.

## Casos de uso

- Traduccion profesional EN-IS de pagina completa: el modo `/translate` produce traducciones literarias y tecnicas preservando estructura de parrafos, adecuado para editoriales, administraciones publicas islandesas y documentacion legal.
- Atencion al cliente en islandes: con 262.144 tokens de contexto puede gestionar conversaciones multi-turno largas e historiales extensos manteniendo coherencia morfologica si se usa temperatura baja (0,2-0,3).
- Generacion y revision de codigo en produccion: el soporte nativo de tool calling con `<tool_call>` AST (BFCL V4 83,67 %) permite integrarlo en pipelines de CI/CD y agentes de desarrollo.
- Procesamiento de documentos tecnicos islandeses: lectura de manuales PLC/CNC, patentes y documentacion clinica con terminologia especializada gracias al experto #254.
- Razonamiento cientifico asistido: analisis de problemas de fisica, quimica y biologia molecular a nivel graduate (GPQA Diamond 70,20 %) para investigacion y educacion.
- Digitalizacion y traduccion de patrimonio literario islandes: el experto #255 esta disenado para prosa literaria y no ficcion, util para bibliotecas nacionales y proyectos de preservacion linguistica.
- Asistente multimodal con vision: descripcion y analisis de imagenes combinado con generacion de texto en islandes o ingles, para accesibilidad o documentacion tecnica.
- Traduccion tecnica EN-FI-IS: el modelo declara soporte de finlandes, util para empresas nordicas con operaciones en varios paises.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Media de 15 benchmarks del nucleo | 70,26 % | Heredado intacto via expertos congelados #0-#253 |
| GPQA Diamond | 70,20 % (139/198) | STEM a nivel de doctorado |
| LiveCodeBench v6 (Pass@1) | 39,43 % (Easy: 90,70 %) | Programacion algoritmica competitiva |
| BFCL V4 Single-Turn AST | 83,67 % (Non-Live: 88,44 %) | Tool calling; deteccion de irrelevancia 80,26 % |
| Auditoria islandesa 10/10 | 10/10 PASS (100 %) | Miðeind Icelandic LLM Leaderboard (WikiQA-IS, GEC-IS, Idioms-IS, ARC-IS) y traduccion literaria/tecnica de pagina completa |

No se han publicado en la informacion disponible resultados desglosados por benchmark individual de los 15 que componen la media, ni comparaciones numericas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada: aproximadamente 25,3 GB para esta version W4A16-AWQ; unos 72 GB para el BF16 completo; unos 24,3 GB para NVFP4; unos 13,6 GiB para GGUF APEX-Medium.
- GPU recomendadas: 2x RTX 5090 de 32 GB con tensor parallelism (TP=2) o una unica GPU de 32 GB para la version AWQ; 2x 48-80 GB para BF16.
- Cabe en GPU de consumo: si, en GPUs de 32 GB (RTX 5090) o en una GPU de 16 GB con GGUF APEX-Medium.
- Opciones de despliegue: vLLM (objetivo principal de esta version AWQ, `compressed-tensors`), llama.cpp/Ollama con los GGUF APEX, y transformers con safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento de modelos comparables de la misma categoria (MoE multimodal especializado en islandes). Como referencia estructural, el propio suite del autor ofrece variantes del mismo modelo:

| Version | Parametros | Contexto | Cuantizacion | Licencia | Tamano |
|---|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Icelandic-v3.2 (BF16) | 35,95B (3B activos) | 262.144 | BF16 | Apache 2.0 | ~67,5 GB |
| Kataguru-Sceptic-35B-A3B-Icelandic-v3.2-NVFP4 | 35,95B (3B activos) | 262.144 | NVFP4 | Apache 2.0 | ~24,3 GB |
| Kataguru-Sceptic-35B-A3B-Icelandic-v3.2-W4A16-AWQ (este) | 35,95B (3B activos) | 262.144 | W4A16-AWQ INT4 | Apache 2.0 | ~25,3 GB |
| Kataguru-Sceptic-35B-A3B-Icelandic-v3.2-GGUF | 35,95B (3B activos) | 262.144 | GGUF (APEX) | Apache 2.0 | ~13,6 GiB (Medium) |

Comparativa con modelos de otros autores: no disponible.

## Limitaciones y advertencias

- En ficcion creativa con temperatura alta puede degradarse la precision morfologica y de correccion en islandes; el autor recomienda `temperature=0.2-0.3` con `presence_penalty=0.3` para tareas estrictas.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado tasas de alucinacion especificas.
- El soporte linguistico declarado se limita a ingles, islandes y finlandes; el rendimiento en otros idiomas no esta documentado.
- El modelo es una cuantizacion INT4: puede presentar una ligera perdida de calidad frente al BF16 original, aunque el autor no publica una comparacion numerica de degradacion por cuantizacion.
- Aunque la licencia es Apache 2.0, el modelo deriva de un modelo base del mismo autor; conviene revisar las condiciones del modelo base v3.1 antes de un uso comercial.
- El banco de entrenamiento islandes es relativamente pequeno (4.833 muestras), lo que puede limitar la cobertura en dominios muy especializados no representados.
- La cabeza especulativa MTP y el encoder de vision se heredan del modelo base; no se detalla su comportamiento especifico tras la cuantizacion AWQ.
- No se han publicado resultados de latencia ni throughput en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Icelandic-v3.2-W4A16-AWQ
- Pesos maestros BF16: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Icelandic-v3.2
- Version NVFP4: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Icelandic-v3.2-NVFP4
- Version GGUF APEX: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Icelandic-v3.2-GGUF
- Modelo base v3.1: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada.
