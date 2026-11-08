# kataguru/Kataguru-Sceptic-35B-A3B-Estonian-v3.2-W4A16-AWQ

## Resumen

Kataguru-Sceptic-35B-A3B-Estonian-v3.2-W4A16-AWQ es una cuantizacion INT4 (W4A16, group_size=32, empaquetado con `compressed-tensors` y compatible con kernels Marlin) del modelo Kataguru-Sceptic-35B-A3B-Estonian-v3.2, desarrollado por el autor independiente kataguru. Se trata de un modelo de mezcla de expertos (MoE) multimodal de 35.951.822.704 parametros totales (aproximadamente 3B activos por token) construido sobre la base Kataguru-Sceptic-35B-A3B-v3.1, a la que se anaden dos expertos especializados en estonio, dando un total de 256 expertos por capa en 40 capas.

El problema que aborda es la cobertura de una lengua de bajos recursos como el estonio (con 14 casos gramaticales y alternancia de cantidad de tres grados) dentro de un modelo que conserva intactas las capacidades de razonamiento cientifico, codigo competitivo y tool calling de su base. La estrategia consiste en congelar los 254 expertos nucleos (#0..#253) y entrenar solo dos expertos nuevos (#254 y #255) con 7.525 muestras verificadas humanamente, preservando asi el rendimiento previo sin olvido catastrofico.

Esta variante AWQ reduce el peso en disco a unos 25,3 GB, lo que la hace desplegable en vLLM sobre dos RTX 5090 de 32 GB (TP=2) o una unica GPU de 32 GB. Mantiene la ventana de contexto de 262.144 tokens, el codificador de vision de 27 capas y la cabeza especulativa MTP de la capa 40 del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text), 40 capas, 256 expertos por capa (254 nucleos congelados + 2 expertos estonios), codificador de vision de 27 capas, cabeza especulativa MTP en la capa 40 |
| Parametros totales | 35.951.822.704 |
| Parametros activos | Aproximadamente 3B por token (heredado de la base v3.1) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | W4A16-AWQ INT4 (group_size=32, observador MSE, empaquetado `compressed-tensors`, compatible con Marlin); existen tambien BF16 (~67,5 GB), NVFP4 (~24,3 GB) y GGUF APEX-Trio con mmproj |
| Idiomas soportados | Ingles (en), estonio (et), finlandes (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers, `compressed-tensors`); variantes GGUF disponibles en otro repositorio |

## Arquitectura y entrenamiento

El modelo es un MoE multimodal con 40 capas y 256 expertos por capa. Los expertos #0 a #253 provienen de la base Kataguru-Sceptic-35B-A3B-v3.1 y permanecen completamente congelados, de modo que el conocimiento de razonamiento STEM, programacion competitiva y tool calling se conserva sin olvido catastrofico. Los expertos #254 y #255 son nuevos: el primero cubre gramatica y morfologia estonia (14 casos, alternancia de cantidad de tres grados, morfologia aglutinante finica) junto con terminologia tecnica industrial, PLC/CNC, medicina clinica y textos legales y de patentes; el segundo cubre prosa literaria, no ficcion, dialogo natural y traduccion bidireccional EN<->ET.

El entrenamiento de los nuevos expertos se realizo con un conjunto de 7.525 muestras verificadas humanamente (todas superaron la puerta de calidad mecanica) y calibracion contrastiva del router (`--moe-mode new_experts_only --recalibrate-router`, r=32, alpha=64). La cuantizacion AWQ emplea un conjunto de calibracion dedicado en estonio (`calib_nvfp4_awq_256_et.jsonl` e `imatrix_calibration_et.txt`). Se incluye una plantilla de chat nativa en estonio (`chat_template.jinja`) con etiquetas de control `/et`, `/translate` y niveles de razonamiento `{REASON:spoon}`, `{REASON:einstein}`, `{REASON:007}`, `{REASON:deep}`, `{REASON:low}` y `{REASON:off}`. No se han publicado detalles sobre el volumen total de tokens de entrenamiento ni sobre el uso de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento cientifico de nivel de posgrado (fisica, quimica, biologia molecular).
- Programacion competitiva y algoritmica (LiveCodeBench v6).
- Tool calling nativo con emision de AST `<tool_call>` y deteccion de irrelevancia (BFCL V4).
- Razonamiento multi-paso con niveles de profundidad configurables mediante etiquetas `{REASON:...}`.
- Vision multimodal: procesamiento de imagen y texto combinados mediante el codificador de vision de 27 capas.
- Traduccion bidireccional de pagina completa EN<->ET y soporte de finlandes, con modo `/translate` sin conversacion y preservacion de parrafos.
- Dominio nativo del estonio: gramatica, morfologia, literatura, no ficcion y terminologia tecnica y legal.
- Capacidades industriales especializadas: PLC/CNC y terminologia medica clinica.
- Decodificacion especulativa mediante cabeza MTP en la capa 40.

## Casos de uso

- Traduccion profesional EN<->ET de documentacion tecnica y legal: el modo `/translate` genera traducciones fieles por parrafos sin ruido conversacional, apoyandose en el experto #254 para terminologia estatutaria y de patentes y en el #255 para prosa y no ficcion.
- Localizacion de interfaces y contenidos para el mercado estonio: la plantilla nativa `/et` y el ajuste morfologico permiten generar texto con casos y alternancia de cantidad correctos, algo critico en productos de consumo y administracion publica.
- Atencion al cliente automatizada en estonio y finlandes: la ventana de 262.144 tokens permite conversaciones multi-turno con historial largo e integracion de herramientas mediante tool calling para consultas de pedidos o reservas.
- Asistencia tecnica industrial: consultas sobre automatizacion PLC/CNC y terminologia de ingenieria, con razonamiento profundo activable mediante `{REASON:deep}`.
- Analisis de documentos escaneados con vision: extraccion y traduccion de texto de imagenes de paginas completas gracias al pipeline image-text-to-text y al codificador de vision.
- Generacion y revision de codigo en pipelines de CI/CD: el modelo puede invocarse como agente con tool calling para revisiones automatizadas y generacion de parches, aprovechando el rendimiento heredado en LiveCodeBench.
- Apoyo a la investigacion y educacion en lengua estonia: evaluacion de gramatica, correccion morfologica y generacion de material didactico con temperatura baja (0,2-0,3) y `presence_penalty=0,3`.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Media de 15 benchmarks (base v3.1) | 70,26 % | Heredado intacto por los expertos congelados #0..#253 |
| GPQA Diamond | 70,20 % (139/198) | Física, quimica y biologia molecular de nivel de doctorado |
| LiveCodeBench v6 (Pass@1) | 39,43 % | Facil: 90,70 % |
| BFCL V4 Single-Turn AST | 83,67 % | No-Live: 88,44 %; deteccion de irrelevancia: 80,26 % |
| Auditoria en vivo de estonio 10/10 (v3.2) | 10/10 PASS (100 %) | tartuNLP/ifeval_et, tartuNLP/winogrande_et, EstCOPA, TalTechNLP/exam_et y auditoria literaria/tecnica/traduccion |

Los resultados corresponden a la base y al modelo v3.2 sin cuantizar; no se han publicado mediciones especificas de esta variante AWQ.

## Requisitos de hardware

- VRAM estimada para esta variante W4A16-AWQ: aproximadamente 25,3 GB de pesos, mas overhead de activaciones y cache KV; el autor indica ejecucion en 2x RTX 5090 de 32 GB con TP=2 o en una unica GPU de 32 GB.
- BF16 completo: aproximadamente 72 GB de VRAM (2x 48-80 GB, por ejemplo A100 80 GB o H100).
- NVFP4: aproximadamente 24,3 GB, orientado a Blackwell nativo.
- GGUF APEX-Medium: aproximadamente 13,6 GiB, ejecutable en una GPU de 16 GB.
- Cabe en GPU de consumo: si, en RTX 5090 de 32 GB (una o dos segun configuracion); las variantes GGUF permiten bajar a 16 GB.
- Opciones de despliegue: vLLM para esta variante AWQ (kernels Marlin), llama.cpp/Ollama para los GGUF APEX-Trio con mmproj, y transformers como libreria base.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Estonian-v3.2-W4A16-AWQ | 35,95B / ~3B | 262.144 | Apache 2.0 | safetensors AWQ INT4 | Especializado en estonio y finlandes, multimodal |
| Kataguru-Sceptic-35B-A3B-Estonian-v3.2 (BF16) | 35,95B / ~3B | 262.144 | Apache 2.0 | safetensors BF16 | Mismo modelo sin cuantizar, ~67,5 GB |
| Kataguru-Sceptic-35B-A3B-v2.6-NVFP4 | 35B / 3B | no disponible | no disponible | NVFP4 | Bilingue EN/FI, 254 expertos, sin expertos estonios |
| Kataguru-Sceptic-35B-A3B-v3.1 (base) | 35B / 3B | 262.144 | no disponible | no disponible | Base sin especializacion en estonio |

No se dispone de comparaciones con modelos de otros desarrolladores en la informacion proporcionada.

## Limitaciones y advertencias

- Ficcion creativa a temperatura alta: para precision morfologica y correccion de pruebas en estonio el autor recomienda temperatura 0,2-0,3 y `presence_penalty=0,3`.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado tasas de alucinacion medidas.
- La especializacion en estonio se apoya en solo 7.525 muestras de entrenamiento, un volumen reducido que puede limitar la cobertura de registros y dominios menos representados.
- Cobertura linguistica limitada a ingles, estonio y finlandes; otros idiomas no estan garantizados.
- La cuantizacion AWQ INT4 puede degradar marginalmente la precision frente a BF16; no se han publicado evaluaciones de esta variante cuantizada.
- El repositorio muestra 0 descargas y 0 likes, y la model card de la version BF16 asociada figura en estado "in training queue" con publicacion prevista en menos de un mes, lo que indica un ecosistema muy reciente y sin validacion independiente.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los pesos base y de las dependencias de despliegue (vLLM, kernels Marlin).
- Modelo de autor independiente sin publicacion cientifica revisada por pares; los benchmarks proceden de la propia model card.

## Enlaces

- Repositorio Hugging Face (esta variante): https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Estonian-v3.2-W4A16-AWQ
- Pesos maestros BF16 v3.2: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Estonian-v3.2
- Variante NVFP4 v3.2: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Estonian-v3.2-NVFP4
- Variante GGUF APEX-Trio v3.2: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Estonian-v3.2-GGUF
- Modelo base v3.1: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
- Variante NVFP4 v2.6 (bilingue EN/FI): https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v2.6-NVFP4
