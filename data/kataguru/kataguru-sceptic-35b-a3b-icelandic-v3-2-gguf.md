# kataguru/Kataguru-Sceptic-35B-A3B-Icelandic-v3.2-GGUF

## Resumen

Kataguru-Sceptic-35B-A3B-Icelandic-v3.2-GGUF es la distribucion en formato GGUF de la version islandesa del modelo Sceptic 35B-A3B, desarrollado por el autor kataguru. Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) construido sobre la base Kataguru-Sceptic-35B-A3B-v3.1, a la que se han anadido dos expertos especializados en islandes (gramatica, morfologia, literatura y traduccion bidireccional EN<->IS) sin modificar los 254 expertos nucleares originales. El resultado es un modelo multilingue (ingles, islandes, finlandes) con capacidades de razonamiento, codigo, vision multimodal y traduccion de pagina completa.

El modelo conserva intactas las capacidades del foundation original (media de 70,26 % en 15 benchmarks, GPQA Diamond 70,20 %, LiveCodeBench v6 39,43 %, BFCL V4 83,67 %) mediante el congelamiento de los expertos #0..#253, y anade rendimiento especifico en islandes validado con una auditoria 10/10 en el leaderboard de Miðeind. La ventana de contexto es de 262.144 tokens y la arquitectura MoE consta de 40 capas con 256 expertos por capa.

Esta ficha cubre especificamente la variante GGUF, que incluye tres niveles de cuantizacion calibrados con imatrix islandes (APEX-Small, APEX-Medium y APEX-Good) mas un proyector multimodal mmproj en f16, pensados para ejecucion local con llama.cpp, LM Studio y Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), 40 capas, 256 expertos por capa (254 congelados + 2 islandeses), encoder de vision multimodal de 27 capas, cabeza especulativa MTP en capa 40 |
| Parametros totales | 35.505.251.456 (~35,5 mil millones) |
| Parametros activos | ~3 mil millones por token (A3B) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GGUF APEX-Small (~11,9 GiB), APEX-Medium (~13,6 GiB), APEX-Good (~15,4 GiB); variantes adicionales del suite v3.2: BF16 (~67,5 GB), NVFP4 (~24,3 GB), W4A16-AWQ (~25,3 GB) |
| Idiomas soportados | Ingles (en), islandes (is), finlandes (fi) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); safetensors para las variantes BF16, NVFP4 y AWQ; mmproj-f16.gguf (~890 MB) para vision |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer MoE con 40 capas y 256 expertos por capa, de los cuales solo ~3 mil millones de parametros estan activos por token. La innovacion central de la version v3.2 es la estrategia de expansion controlada: los 254 expertos nucleares del modelo base v3.1 se mantienen completamente congelados (100 % frozen core), preservando sin olvido catastrofico las capacidades originales de razonamiento cientifico, codigo competitivo y tool calling. A estos se anaden dos expertos nuevos: el experto #254, especializado en gramatica y morfologia islandesa (4 casos en 3 generos, declinaciones fuerte/debil, umlaut U e I, regimenes casuales irregulares) y terminologia tecnica (PLC/CNC, medicina clinica, patentes); y el experto #255, centrado en literatura islandesa, no ficcion y traduccion bidireccional EN<->IS.

El entrenamiento de los nuevos expertos se realizo sobre un Language Bank de 4.833 muestras doradas verificadas humanamente (100 % de aprobacion en el gate mecanico y de calidad), con calibracion contrastiva del router (modo `new_experts_only`, `recalibrate-router`, rango r=32, alpha=64). La cuantizacion GGUF se calibro con `imatrix_calibration_is.txt` sobre los 256 expertos, y la variante NVFP4/AWQ uso un fichero de calibracion dedicado (`calib_nvfp4_awq_256_is.jsonl`). Se mantiene la cabeza especulativa MTP de decodificacion especulativa (785 tensores) y el encoder de vision de 27 capas (333 tensores). No se dispone de informacion sobre el volumen total de tokens de entrenamiento del foundation original ni sobre la composicion detallada del dataset mas alla del Language Bank islandes.

## Capacidades

- Generacion de texto y razonamiento multilingue en ingles, islandes y finlandes, con profundidad de razonamiento configurable mediante etiquetas (`{REASON:spoon}`, `{REASON:einstein}`, `{REASON:007}`, `{REASON:deep}`, `{REASON:low}`, `{REASON:off}`).
- Razonamiento cientifico de nivel doctorado (GPQA Diamond 70,20 %) y programacion algoritmica competitiva (LiveCodeBench v6 39,43 %).
- Tool calling / function calling nativo con AST `<tool_call>` y deteccion de irrelevancia (BFCL V4 83,67 %).
- Vision multimodal: pipeline image-text-to-text con encoder de vision de 27 capas y proyector mmproj en f16.
- Traduccion de pagina completa bidireccional EN<->IS (y con finlandes) en modo `/translate`, con preservacion de parrafos y cero charlataneria.
- Modo islandes nativo mediante prefijo `/is` o `chat_template_kwargs={"response_language": "is"}`.
- Capacidades industriales heredadas: PLC/CNC, terminologia medica clinica y patentes.
- Decodificacion especulativa mediante cabeza MTP dedicada.
- Plantilla de chat nativa en islandes (`chat_template.jinja`) con cabeceras de razonamiento localizadas.

## Casos de uso

- Traduccion profesional islandes-ingles de pagina completa: el modelo usa el experto #255 en modo `/translate` para traducir prosa literaria, no ficcion y dialogos preservando estructura de parrafos, adecuado para editoriales y agencias de localizacion que trabajan con contenido islandes.
- Correccion y proofreading morfologico en islandes: con temperatura 0,2-0,3 y `presence_penalty=0.3`, el experto #254 gestiona declinaciones, umlaut y regimenes casuales irregulares, util para herramientas de edicion y control de calidad linguistica.
- Atencion al cliente multilingue en mercados nordicos: la ventana de 262.144 tokens permite conversaciones multi-turno con historial extenso en islandes, finlandes e ingles, con tool calling para consultar sistemas de pedidos o CRM.
- Documentacion tecnica industrial: el modelo hereda capacidades PLC/CNC y terminologia de patentes, permitiendo generar y traducir manuales tecnicos y especificaciones de patentes entre ingles e islandes.
- Analisis de documentos escaneados con vision: el encoder multimodal y el proyector mmproj permiten procesar imagenes de documentos, formularios o diagramas tecnicos y extraer texto o descripciones en islandes.
- Asistente de razonamiento cientifico local: con GPQA Diamond 70,20 % y cuantizacion APEX-Medium en una sola GPU de 16 GB, sirve para experimentacion en laboratorio y revision de literatura cientifica sin depender de la nube.
- Desarrollo de agentes con tool calling: BFCL V4 de 83,67 % y AST nativo permiten integrar el modelo en pipelines agenticos que invocan APIs, ejecutan consultas y encadenan pasos multi-step.

## Benchmarks y rendimiento

| Benchmark / capacidad | Puntuacion | Notas |
|---|---|---|
| Media de 15 benchmarks (foundation) | 70,26 % | Heredada intacta via expertos congelados #0..#253 |
| GPQA Diamond (STEM nivel doctorado) | 70,20 % (139/198) | Fisica, quimica y biologia molecular de posgrado |
| LiveCodeBench v6 (Pass@1) | 39,43 % | Facil: 90,70 %; programacion algoritmica competitiva |
| BFCL V4 Single-Turn AST (tool calling) | 83,67 % | Non-Live: 88,44 %; deteccion de irrelevancia: 80,26 % |
| Auditoria islandesa 10/10 (v3.2) | 10/10 PASS (100 %) | Leaderboard Miðeind (WikiQA-IS, GEC-IS, Idioms-IS, ARC-IS) y traduccion literaria/tecnica EN<->IS |

No se han publicado resultados de benchmarks especificos para la variante GGUF en la informacion disponible; las cifras anteriores corresponden al foundation y a la auditoria de la version v3.2.

## Requisitos de hardware

- VRAM para BF16 completo: ~72 GB (2x GPU de 48-80 GB).
- VRAM para NVFP4 / W4A16-AWQ: ejecutable en 2x RTX 5090 de 32 GB (TP=2) o en 1 GPU de 32 GB.
- GGUF APEX-Small (~11,9 GiB): cabe en GPU consumer de 16 GB con margen ajustado.
- GGUF APEX-Medium (~13,6 GiB): segun el autor, ejecutable en una sola GPU de 16 GB.
- GGUF APEX-Good (~15,4 GiB): requiere GPU de 16 GB con margen minimo o 24 GB para holgura.
- Proyector multimodal mmproj-f16.gguf (~890 MB): VRAM adicional para vision.
- GPUs recomendadas: RTX 5090 (32 GB) para NVFP4/AWQ, A100/H100 para BF16, RTX 4090/5080 (16 GB) para APEX-Small/Medium.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (etiquetas declaradas), vLLM para las variantes W4A16-AWQ y NVFP4, transformers para pesos completos.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Icelandic-v3.2 (GGUF) | ~35,5 B | ~3 B | 262.144 | Apache-2.0 | Especializado en islandes, vision, tool calling, traduccion |
| Qwen3-MoE (familia base declarada `qwen3_5_moe`) | no disponible | no disponible | no disponible | no disponible | Foundation sobre el que se construye la arquitectura |
| Modelos islandeses de Miðeind (referencia del leaderboard) | no disponible | no disponible | no disponible | no disponible | Benchmark de comparacion usado en la auditoria 10/10 |

No se dispone en la informacion proporcionada de datos suficientes sobre modelos alternativos comparables (parametros, contexto, rendimiento y licencia) para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Ficcion creativa a alta temperatura: para precision morfologica y proofreading estricto en islandes se recomienda `temperature=0.2-0.3` con `presence_penalty=0.3`; temperaturas altas degradan la correccion gramatical.
- Riesgo de alucinacion: como todo modelo generativo, puede producir contenido factualmente incorrecto, especialmente en traduccion tecnica especializada o terminologia de patentes.
- Cobertura linguistica limitada: solo ingles, islandes y finlandes; no hay soporte declarado para castellano ni otras lenguas.
- Olvido catastrofico mitigado pero no eliminado: la estrategia de expertos congelados preserva el rendimiento del foundation, pero la interaccion entre expertos nuevos y router calibrado puede introducir sesgos en dominios no vistos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base v3.1 y de los componentes heredados.
- Huella de VRAM: BF16 completo requiere ~72 GB; en produccion con GPU consumer conviene usar APEX-Medium o NVFP4/AWQ.
- Datos de benchmarks de la variante GGUF no publicados: las cifras disponibles corresponden al foundation y a la auditoria v3.2, no a la cuantizacion GGUF concreta.
- Modelo con 0 descargas y 0 likes en el momento del registro: ecosistema de validacion externa practicamente inexistente.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Icelandic-v3.2-GGUF
- Pesos maestros BF16: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Icelandic-v3.2
- Variante NVFP4: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Icelandic-v3.2-NVFP4
- Variante W4A16-AWQ: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Icelandic-v3.2-W4A16-AWQ
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
- Leaderboard islandes de Miðeind: no disponible (referenciado en la model card, sin URL directa)
- Paper, blog o demo oficial: no disponible en la informacion proporcionada
