# kataguru/Kataguru-Sceptic-35B-A3B-Basque-v3.2-W4A16-AWQ

## Resumen

Kataguru-Sceptic-35B-A3B-Basque-v3.2-W4A16-AWQ es la variante cuantizada a INT4 (W4A16, empaquetado AWQ con `compressed-tensors`) del modelo Kataguru-Sceptic-35B-A3B-Basque-v3.2, desarrollado por el autor independiente kataguru. Se trata de un modelo de mezcla de expertos (MoE) de 35.951.822.704 parametros totales con 3B de parametros activos por token, construido sobre la base Kataguru-Sceptic-35B-A3B-v3.1 y especializado en euskera (Euskara) para lenguaje, razonamiento, vision multimodal y traduccion de pagina completa. Su relevancia radica en que ofrece un modelo soberano para euskera con capacidades heredadas de razonamiento cientifico y codigo, en un formato INT4 de aproximadamente 25,3 GB que cabe en una sola GPU de 32 GB.

La arquitectura emplea 256 expertos por capa MoE en 40 capas: 254 expertos nucleo congelados (que preservan las capacidades originales del modelo base) mas dos expertos nuevos especializados en euskera (el #254 para gramatica, morfologia y terminologia tecnica; el #255 para literatura, no ficcion y traduccion bidireccional). El modelo conserva el encoder de vision multimodal de 27 capas, la cabeza especulativa MTP de la capa 40 y una ventana de contexto de 262.144 tokens.

Esta ficha cubre la variante AWQ W4A16, pensada para despliegue universal en vLLM. Existe una suite oficial con pesos maestros BF16 (~67,5 GB), NVFP4 nativo para Blackwell (~24,3 GB) y GGUF APEX-Trio con `mmproj`. La licencia es Apache 2.0 y los idiomas declarados son ingles, euskera y finlandes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe), 40 capas, 256 expertos por capa, encoder de vision multimodal de 27 capas, cabeza especulativa MTP en capa 40 |
| Parametros totales | 35.951.822.704 |
| Parametros activos | 3B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | W4A16-AWQ INT4 (group_size=32, observador MSE, `compressed-tensors` pack-quantized); tambien disponibles BF16, NVFP4 y GGUF en la suite |
| Idiomas soportados | Ingles (en), euskera (eu), finlandes (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (AWQ W4A16, `compressed-tensors`); repo de 26,2 GB |

## Arquitectura y entrenamiento

El modelo es una mezcla de expertos con 256 expertos por capa en 40 capas. La estrategia de especializacion mantiene congelados los 254 expertos nucleo heredados de Kataguru-Sceptic-35B-A3B-v3.1 (expertos #0 a #253) y anade dos expertos nuevos: el #254, dedicado a gramatica y morfologia del euskera (alineamiento de caso ergativo-absolutivo, concordancia polipersonal de auxiliares Nor-Nori-Nork, sufijos posposicionales aglutinantes) y a terminologia de ingenieria industrial, PLC/CNC, medicina clinica y patentes; y el #255, orientado a prosa literaria, no ficcion, dialogo natural y traduccion fiel EN <-> EU. El ajuste se realizo con un banco de 4.844 muestras doradas verificadas por humanos, con calibracion contrastiva del router (`--moe-mode new_experts_only --recalibrate-router`, r=32, alpha=64).

La cuantizacion AWQ W4A16 se calibro especificamente para euskera con los ficheros `calib_nvfp4_awq_256_eu.jsonl` e `imatrix_calibration_eu.txt`. Se incluye una plantilla de chat nativa en euskera (`chat_template.jinja`) con etiquetas de control: `/eu` para modo euskera nativo, `/translate` para traduccion de pagina completa y modificadores de profundidad de razonamiento (`{REASON:spoon}`, `{REASON:einstein}`, `{REASON:007}`, `{REASON:deep}`, `{REASON:low}`, `{REASON:off}`). El modelo base declara una media de 70,26 % en 15 benchmarks, 70,20 % en GPQA Diamond, 39,43 % en LiveCodeBench v6 y 83,67 % en BFCL V4 AST.

## Capacidades

- Generacion de texto y razonamiento cientifico de nivel graduate (fisica, quimica, biologia molecular) heredado de los expertos congelados.
- Programacion competitiva y algoritmica (LiveCodeBench v6).
- Vision multimodal: pipeline `image-text-to-text` con encoder de 27 capas y 333 tensores.
- Tool calling / function calling nativo con etiquetas `<tool_call>` en formato AST y deteccion de irrelevancia (BFCL V4).
- Razonamiento agente multi-paso con niveles de profundidad configurables.
- Capacidades multilingues en ingles, euskera y finlandes.
- Modo de traduccion de pagina completa EN/ES <-> EU y FI <-> EU con preservacion de parrafos y sin conversacion adicional.
- Modo euskera nativo con plantilla de chat adaptada y cabeceras de razonamiento localizadas.
- Decodificacion especulativa mediante cabeza MTP.
- Terminologia tecnica especializada: PLC/CNC, medicina clinica, patentes y textos legales.

## Casos de uso

- Traduccion profesional EN/ES <-> EU de documentos tecnicos y literarios: el modo `/translate` preserva parrafos y evita conversacion adicional, adecuado para editoriales, administraciones publicas y empresas que necesiten euskera normativo.
- Atencion al cliente en euskera: la plantilla nativa `/eu` y la ventana de 262.144 tokens permiten conversaciones multi-turno con historial extenso y documentacion adjunta.
- Generacion y revision de codigo en pipelines de CI/CD: el soporte de tool calling y el rendimiento en LiveCodeBench permiten integrarlo como agente de revision o generacion de parches.
- Analisis de documentos tecnicos industriales: los expertos especializados en PLC/CNC y la vision multimodal permiten procesar manuales, esquemas y capturas con texto en euskera.
- Asistencia clinica y traduccion de informes: el experto #254 cubre terminologia medica, util para normalizacion de informes bilingues en sistemas sanitarios.
- Procesamiento de patentes y textos legales: la terminologia estatutaria y de patentes del experto #254 facilita la traduccion y el resumen de documentacion regulatoria.
- Investigacion en euskera: razonamiento STEM con contexto largo para revision de literatura y generacion de hipotesis, manteniendo capacidades de GPQA Diamond.
- Despliegue en infraestructura limitada: el formato W4A16-AWQ de ~25,3 GB permite servir el modelo en una GPU de 32 GB con vLLM, reduciendo costes frente a BF16.

## Benchmarks y rendimiento

| Benchmark | Puntuacion | Notas |
|---|---|---|
| Media de 15 benchmarks (nucleo) | 70,26 % | Heredado de los expertos congelados #0-#253 |
| GPQA Diamond | 70,20 % (139/198) | STEM de nivel doctorado |
| LiveCodeBench v6 (Pass@1) | 39,43 % | Easy: 90,70 % |
| BFCL V4 Single-Turn AST | 83,67 % | Non-Live: 88,44 %; deteccion de irrelevancia: 80,26 % |
| Auditoria Live Basque 10/10 (v3.2) | 10/10 PASS (100 %) | Suite HiTZ EvalEU (EusProficiency, EusExams, EusReading, EusTrivia) y traduccion literaria/tecnica de pagina completa |

No se han publicado resultados de benchmarks especificos de la variante W4A16-AWQ que midan la degradacion por cuantizacion en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para esta variante W4A16-AWQ: aproximadamente 25,3 GB de pesos; con overhead de KV cache y activaciones, se recomienda una GPU de 32 GB o superior.
- BF16 completo: aproximadamente 72 GB de VRAM (2x 48-80 GB).
- NVFP4: aproximadamente 24,3 GB; ejecutable en 2x RTX 5090 32 GB (TP=2) o 1x GPU de 32 GB.
- GGUF APEX-Medium: aproximadamente 13,6 GiB; cabe en una GPU de 16 GB.
- GPU recomendadas: A100 80 GB, H100, RTX 5090 32 GB para las variantes cuantizadas; 2x 48-80 GB para BF16.
- Cabe en GPU de consumo: si, en RTX 5090 32 GB (W4A16-AWQ o NVFP4) y en GPUs de 16 GB con GGUF APEX-Medium.
- Opciones de despliegue: vLLM (formato AWQ `compressed-tensors`), llama.cpp/Ollama con la variante GGUF, y transformers con safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Basque-v3.2-W4A16-AWQ | 35,95B | 3B | 262.144 | Apache 2.0 | Hugging Face (esta ficha) |
| Kataguru-Sceptic-35B-A3B-Basque-v3.2 (BF16) | 35,95B | 3B | 262.144 | Apache 2.0 | Hugging Face |
| Kataguru-Sceptic-35B-A3B-Basque-v3.2-NVFP4 | 35,95B | 3B | 262.144 | Apache 2.0 | Hugging Face |
| Kataguru-Sceptic-35B-A3B-v3.1 (base) | 35,95B | 3B | 262.144 | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos con modelos de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- En ficcion creativa con temperatura alta puede perder precision morfologica; el autor recomienda `temperature=0.2-0.3` y `presence_penalty=0.3` para correccion estricta en euskera.
- La cuantizacion W4A16 puede introducir degradacion adicional respecto a los pesos BF16; no se han publicado metricas de esa perdida.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en terminologia tecnica muy especializada.
- La cobertura linguistica declarada se limita a ingles, euskera y finlandes; el rendimiento fuera de esos idiomas no esta documentado.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base y de los datos de calibracion para uso comercial.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion independiente por la comunidad.
- El pipeline declarado es `image-text-to-text`; el soporte de vision requiere el encoder multimodal y el preprocesador adecuados, no solo los pesos cuantizados.

## Enlaces

- Hugging Face (esta variante): https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Basque-v3.2-W4A16-AWQ
- Pesos maestros BF16: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Basque-v3.2
- Variante NVFP4: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Basque-v3.2-NVFP4
- Variante GGUF APEX-Trio: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Basque-v3.2-GGUF
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
