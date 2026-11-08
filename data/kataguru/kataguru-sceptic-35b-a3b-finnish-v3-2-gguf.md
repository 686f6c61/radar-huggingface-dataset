# kataguru/Kataguru-Sceptic-35B-A3B-Finnish-v3.2-GGUF

## Resumen

Kataguru-Sceptic-35B-A3B-Finnish-v3.2-GGUF es la distribucion en formato GGUF del modelo Kataguru-Sceptic-35B-A3B-Finnish-v3.2, un Mixture-of-Experts (MoE) multimodal especializado en finlandes y desarrollado por kataguru. Parte del modelo base Kataguru-Sceptic-35B-A3B-v3.1 y anade dos expertos dedicados al finlandes sobre una base de 254 expertos congelados, manteniendo intactas las capacidades originales de razonamiento cientifico, codigo, tool calling y vision.

El modelo resuelve el problema de la baja calidad de los LLM generalistas en finlandes, un idioma con morfologia compleja (15 casos gramaticales, gradacion consonanticа, armonia vocalica y 51 clases de declinacion Kotus), y anade traduccion bidireccional EN<->FI de pagina completa. La arquitectura es un transformer MoE de 35.505.251.456 parametros totales con 3B activos por token, ventana de contexto de 262.144 tokens y encoder de vision de 27 capas.

Esta version GGUF incluye tres cuantizaciones calibradas con imatrix en finlandes (APEX-Small, APEX-Medium y APEX-Good) mas un proyector multimodal separado, lo que permite ejecutar el modelo en GPUs de consumo mediante llama.cpp, LM Studio u Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (256 expertos por capa, 40 capas), con encoder de vision de 27 capas y cabeza especulativa MTP en la capa 40 |
| Parametros totales | 35.505.251.456 |
| Parametros activos | 3B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GGUF APEX-Trio: APEX-Small (~11,9 GiB), APEX-Medium (~13,6 GiB), APEX-Good (~15,4 GiB); mmproj-f16.gguf (~890 MB); calibradas con imatrix en finlandes |
| Idiomas soportados | Ingles (en) y finlandes (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); existen tambien BF16 safetensors, NVFP4 y W4A16-AWQ en otros repositorios del autor |

## Arquitectura y entrenamiento

El modelo es un MoE de 40 capas con 256 expertos por capa. De ellos, 254 (expertos #0 a #253) permanecen congelados desde el modelo base Kataguru-Sceptic-35B-A3B-v3.1, lo que preserva sin olvido catastrofico las capacidades originales de razonamiento cientifico, codigo, agentes y vision. Los dos expertos nuevos son el #254, especializado en gramatica finlandesa, morfologia (15 casos, gradacion consonanticа, armonia vocalica, clases Kotus 1-51), ingenieria industrial, PLC/CNC, medicina clinica y terminologia legal y de patentes, y el #255, orientado a prosa literaria, no ficcion, dialogo natural y traduccion fiel EN<->FI.

El entrenamiento de los nuevos expertos se realizo sobre un conjunto de 6.565 muestras doradas verificadas humanamente, con calibracion contrastiva del router (modo `new_experts_only`, `recalibrate-router`, `r=32`, `alpha=64`). Se anadieron una plantilla de chat nativa en finlandes y calibraciones de cuantizacion especificas (`calib_nvfp4_awq_256_fi.jsonl` e `imatrix_calibration_fi.txt`). La cabeza especulativa MTP (785 tensores) y el encoder de vision (333 tensores) se mantienen sin cambios respecto al modelo base.

## Capacidades

- Generacion de texto, razonamiento cientifico de nivel doctorado, codigo competitivo y matematicas, heredados del nucleo congelado.
- Vision multimodal: procesamiento de imagen y texto mediante el encoder de 27 capas y el proyector mmproj.
- Tool calling nativo con formato `<tool_call>` y deteccion de irrelevancia.
- Razonamiento multi-paso y uso como agente, con profundidades de razonamiento configurables (`{REASON:spoon}`, `{REASON:einstein}`, `{REASON:007}`, `{REASON:deep}`, `{REASON:low}`, `{REASON:off}`).
- Modo nativo en finlandes mediante prefijo `/fi` o `chat_template_kwargs={"response_language": "fi"}`.
- Traduccion de pagina completa EN<->FI y FI<->FI con modo `/translate`, preservando parrafos y sin charlataneria adicional.
- Capacidades bilingues en ingles y finlandes.
- Dominio de terminologia tecnica industrial (PLC/CNC), clinica y legal en finlandes.

## Casos de uso

- Traduccion profesional EN<->FI de documentacion tecnica y literatura: el modo `/translate` produce traducciones fieles que preservan la estructura de parrafos, adecuado para editoriales y departamentos de localizacion que necesitan coherencia terminologica en textos largos.
- Atencion al cliente en finlandes: el modelo gestiona conversaciones multi-turno con 262.144 tokens de contexto y morfologia correcta, lo que reduce errores de concordancia y declinacion en respuestas automaticas.
- Generacion y revision de codigo en produccion: con tool calling nativo y BFCL V4 AST de 83,67 %, puede integrarse en pipelines de CI/CD para revision de parches, generacion de tests y automatizacion de tareas de refactorizacion.
- Asistencia en ingenieria industrial: el experto #254 cubre terminologia PLC/CNC y documentacion tecnica en finlandes, util para fabricantes que operan en Finlandia y necesitan interpretar manuales o generar procedimientos.
- Analisis de documentos con vision: el encoder multimodal permite extraer y traducir texto de imagenes de documentos escaneados, facturas o pantallas de maquinaria, combinando OCR implicito y traduccion.
- Investigacion cientifica asistida: con GPQA Diamond de 70,20 %, sirve como apoyo en consultas de fisica, quimica y biologia molecular, incluyendo explicaciones en finlandes para investigadores locales.
- Despliegue en estaciones de trabajo con GPU de consumo: las cuantizaciones APEX permiten ejecutar el modelo en una sola GPU de 16 GB (APEX-Medium), habilitando asistentes locales con privacidad de datos para empresas finlandesas.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Media de 15 benchmarks del nucleo | 70,26 % | Heredado intacto via expertos congelados #0..#253 |
| GPQA Diamond (STEM nivel doctorado) | 70,20 % (139/198) | Fisica, quimica y biologia molecular de posgrado |
| LiveCodeBench v6 (Pass@1) | 39,43 % | Easy: 90,70 %; programacion algoritmica competitiva |
| BFCL V4 Single-Turn AST (tool calling) | 83,67 % | Non-Live: 88,44 %; deteccion de irrelevancia: 80,26 % |
| Auditoria en vivo de finlandes v3.2 | 10/10 PASS (100 %) | FIN-bench, IFEval-FI, morfologia Kotus-51 y auditoria literaria/tecnica/traduccion |

## Requisitos de hardware

- BF16 completo: aproximadamente 72 GB de VRAM, requiere 2x GPU de 48-80 GB.
- NVFP4 o W4A16-AWQ: aproximadamente 24,3 GB y 25,3 GB respectivamente; ejecutable en 2x RTX 5090 de 32 GB con tensor parallelism 2 o en una GPU de 32 GB.
- GGUF APEX-Small (~11,9 GiB): cabe en GPUs de 12-16 GB.
- GGUF APEX-Medium (~13,6 GiB): cabe en una sola GPU de 16 GB.
- GGUF APEX-Good (~15,4 GiB): requiere al menos 16 GB, recomendable 24 GB para margen.
- El proyector multimodal mmproj-f16.gguf anade aproximadamente 890 MB.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (etiquetas presentes en el repositorio) y vLLM para las variantes AWQ.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Finnish-v3.2-GGUF | 35,5B totales, 3B activos | 262.144 | Apache 2.0 | Especializado en finlandes, multimodal, tool calling |
| Kataguru-Sceptic-35B-A3B-v2.6-GGUF | 35B totales, 3B activos, 254 expertos | no disponible | no disponible | Version anterior bilingue EN/FI del mismo autor |
| Kataguru-Sceptic-35B-A3B-Georgian-v3.2 | 35B totales, 3B activos, 256 expertos | no disponible | no disponible | Variante especializada en georgiano del mismo autor |
| Alternativas de otros desarrolladores | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- En ficcion creativa con temperatura alta puede perder precision morfologica y de correccion en finlandes; se recomienda `temperature=0.2-0.3` con `presence_penalty=0.3` para tareas estrictas de revision.
- El modelo solo cubre ingles y finlandes de forma nativa; el rendimiento en otros idiomas no esta documentado.
- Riesgo de alucinacion inherente a los LLM, especialmente en terminologia tecnica muy especializada fuera de los dominios entrenados (PLC/CNC, medicina, legal).
- La licencia Apache 2.0 permite uso comercial, pero no se documentan garantias ni limitaciones adicionales por parte del autor.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.
- El modelo base es una creacion propia del autor sin publicacion academica asociada en la informacion disponible; los benchmarks son autoinformados.
- El contexto de 262.144 tokens puede degradar la calidad en el extremo superior de la ventana; no se documentan pruebas de aguja en pajar.

## Enlaces

- Repositorio GGUF: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Finnish-v3.2-GGUF
- Pesos maestros BF16: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Finnish-v3.2
- Variante NVFP4: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Finnish-v3.2-NVFP4
- Variante W4A16-AWQ: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Finnish-v3.2-W4A16-AWQ
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
- Version anterior GGUF v2.6: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v2.6-GGUF
- Variante georgiana: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Georgian-v3.2
