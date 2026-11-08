# kataguru/Kataguru-Sceptic-35B-A3B-Finnish-v3.2-NVFP4

## Resumen

Kataguru-Sceptic-35B-A3B-Finnish-v3.2-NVFP4 es una cuantizacion en formato NVFP4 (FP4 de 4 bits nativo de NVIDIA Blackwell, empaquetado con `compressed-tensors`) del modelo finlandes Kataguru-Sceptic-35B-A3B-Finnish-v3.2, desarrollado por el autor independiente kataguru. El modelo es un Mixture-of-Experts multimodal de 35.945.531.248 parametros totales con 3.000 millones de parametros activos por token y 256 expertos por capa en 40 capas, construido sobre la base Kataguru-Sceptic-35B-A3B-v3.1. Resuelve el problema de adaptar un modelo de razonamiento STEM, codigo y tool calling a un idioma de bajos recursos como el finlandes sin provocar olvido catastrofico: los 254 expertos nucleos permanecen congelados y se anaden dos expertos especialistas en finlandes.

La relevancia actual del modelo radica en dos factores. Primero, su estrategia de expansion MoE selectiva (congelar el nucleo y anadir expertos de idioma) frente al continued pre-training convencional, que degrada las capacidades matematicas y cientificas. Segundo, su formato de cuantizacion NVFP4, que reduce el peso del repositorio a unos 24,3 GB y permite ejecutar un modelo de 35B con contexto de 262.144 tokens en dos RTX 5090 de 32 GB o en una unica GPU de 32 GB, algo inviable en BF16 (~72 GB de VRAM). El modelo declara soporte de vision, razonamiento con niveles de profundidad configurables, traduccion bidireccional EN-FI y tool calling nativo.

La ficha se centra en la variante NVFP4, que hereda intactas las capacidades del modelo base v3.1 y anade la capa de idioma finlandes de la version v3.2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) multimodal, tipo `qwen3_5_moe`, 40 capas, 256 expertos por capa (254 nucleo congelados + 2 especialistas en finlandes), encoder de vision de 27 capas (333 tensores) y cabeza especulativa MTP en la capa 40 (785 tensores) |
| Parametros totales | 35.945.531.248 |
| Parametros activos | 3.000 millones por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (4 bits, `compressed-tensors`, calibrado con `calib_nvfp4_awq_256_fi.jsonl`); el autor publica tambien BF16 (~67,5 GB), W4A16-AWQ (~25,3 GB) y GGUF APEX (Small, Medium, Good + `mmproj`) |
| Idiomas soportados | Ingles (en) y finlandes (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers), variantes GGUF y AWQ en repos separados |

## Arquitectura y entrenamiento

El modelo es un transformer MoE multimodal de 40 capas con enrutamiento disperso: 256 expertos por capa, de los cuales 254 son el nucleo Sceptic heredado del modelo base v3.1 y permanecen 100 % congelados. La version v3.2 anade dos expertos especializados: el experto #254 cubre gramatica finlandesa (15 casos gramaticales, gradacion consonántica o `astevaihtelu`, armonia vocalica, clases de declinacion Kotus 1-51) y terminologia tecnica industrial (PLC/CNC), medicina clinica y lenguaje juridico y de patentes; el experto #255 cubre prosa literaria, no ficcion, dialogo natural y traduccion fiel EN-FI. El ajuste se realizo sobre un banco de 6.565 muestras verificadas humanamente, con calibracion contrastiva del router (`--moe-mode new_experts_only --recalibrate-router`, `r=32`, `alpha=64`).

La innovacion principal es evitar el olvido catastrofico: al congelar los 254 expertos nucleo, se preservan intactas las capacidades de razonamiento cientifico (GPQA Diamond 70,20 %), codigo competitivo (LiveCodeBench v6 39,43 %) y tool calling (BFCL V4 AST 83,67 %) del modelo base, mientras los dos nuevos expertos absorben la adaptacion al finlandes. El modelo incluye una plantilla de chat nativa en finlandes (`chat_template.jinja`) con etiquetas de control `/fi` y `/translate`, cabeceras de razonamiento localizadas y niveles de profundidad configurables (`{REASON:spoon}`, `{REASON:einstein}`, `{REASON:007}`, `{REASON:deep}`, `{REASON:low}`, `{REASON:off}`). La cuantizacion NVFP4 se calibro con un dataset especifico en finlandes (`calib_nvfp4_awq_256_fi.jsonl`, `imatrix_calibration_fi.txt`) mas un ancla de STEM y codigo. No se dispone de informacion sobre el numero total de tokens de entrenamiento del modelo base ni sobre el uso de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento con niveles de profundidad configurables mediante etiquetas `{REASON:...}`.
- Razonamiento cientifico de nivel doctorado (fisica, quimica, biologia molecular) heredado del nucleo congelado.
- Programacion competitiva y algoritmica (LiveCodeBench v6 Pass@1 de 39,43 %, con 90,70 % en dificultad Easy).
- Tool calling y function calling nativo con etiquetas `<tool_call>` y deteccion de irrelevancia (BFCL V4 AST 83,67 %, 88,44 % en no-Live, 80,26 % en deteccion de irrelevancia).
- Capacidades multimodales de vision: pipeline `image-text-to-text` con encoder de 27 capas.
- Traduccion bidireccional EN-FI de pagina completa en modo `/translate`, con preservacion de parrafos y sin conversacion adicional.
- Dominio del finlandes: 15 casos gramaticales, gradacion consonántica, armonia vocalica y clases de declinacion Kotus 1-51.
- Terminologia especializada en ingenieria industrial (PLC/CNC), medicina clinica, patentes y textos juridicos.
- Capacidades bilingues en ingles y finlandes, con plantilla de chat nativa para cada modo.
- Generacion especulativa mediante cabeza MTP en la capa 40.
- Razonamiento multi-paso y soporte de agentes a traves del tool calling nativo.

## Casos de uso

- Traduccion profesional EN-FI de pagina completa: el modo `/translate` produce traducciones fieles con preservacion de parrafos y sin ruido conversacional, adecuado para documentacion tecnica, textos juridicos y literatura gracias a los expertos #254 y #255.
- Localizacion de documentacion industrial y de patentes: el experto #254 cubre terminologia PLC/CNC, medica y de patentes, lo que permite traducir manuales tecnicos y solicitudes de patente con vocabulario especializado sin perder precision terminologica.
- Asistente de atencion al cliente en finlandes: con 262.144 tokens de contexto puede mantener conversaciones multi-turno largas, gestionar historial de incidencias y responder con morfologia correcta usando `/fi` y temperatura baja (0,2-0,3).
- Agente de automatizacion con tool calling: el 83,67 % en BFCL V4 AST permite integrarlo en pipelines de agentes que invocan APIs, consultan bases de datos o ejecutan acciones multi-paso, con deteccion de irrelevancia para evitar llamadas erroneas.
- Analisis de documentos escaneados con vision: el encoder multimodal de 27 capas permite procesar imagenes de documentos, extraer texto y traducirlo o resumirlo en finlandes o ingles.
- Generacion y revision de codigo en entornos finlandeses: con LiveCodeBench v6 de 39,43 % y tool calling, puede integrarse en pipelines de CI/CD para revision de codigo, generacion de tests y explicacion de errores, manteniendo el contexto de 262.144 tokens para repositorios grandes.
- Investigacion cientifica asistida en finlandes: el nucleo congelado conserva GPQA Diamond de 70,20 %, lo que permite consultas de fisica, quimica y biologia molecular con respuestas en finlandes.
- Correccion morfologica y proofreading de textos finlandeses: con temperatura 0,2-0,3 y `presence_penalty=0,3` puede revisar declinaciones, armonia vocalica y gradacion consonántica en textos largos.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Media de 15 benchmarks del nucleo | 70,26 % | Heredado intacto de los expertos congelados #0..#253 |
| GPQA Diamond (STEM nivel doctorado) | 70,20 % (139/198) | Fisica, quimica y biologia molecular de posgrado |
| LiveCodeBench v6 (Pass@1) | 39,43 % | Dificultad Easy: 90,70 % |
| BFCL V4 Single-Turn AST (tool calling) | 83,67 % | No-Live: 88,44 %; deteccion de irrelevancia: 80,26 % |
| Auditoria en vivo de finlandes v3.2 | 10/10 PASS (100 %) | FIN-bench, IFEval-FI, morfologia Kotus-51 y auditoria literaria, tecnica y de traduccion |

No se han publicado resultados de benchmarks especificos de la variante NVFP4 frente a la version BF16 en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: NVFP4 requiere aproximadamente 24,3 GB de pesos; el modelo BF16 completo necesita unos 72 GB de VRAM (2x 48-80 GB).
- GPU recomendadas: 2x RTX 5090 de 32 GB con tensor parallelism (TP=2) o una unica GPU de 32 GB para NVFP4; GPUs Blackwell (B200, RTX 5090) para aprovechar el formato FP4 nativo.
- Cabe en consumer GPU: si, en una RTX 5090 de 32 GB con NVFP4; la variante GGUF APEX-Medium (~13,6 GiB) cabe en una GPU de 16 GB.
- Opciones de despliegue: transformers con `compressed-tensors` (formato nativo del repo), vLLM mediante la variante W4A16-AWQ (~25,3 GB), llama.cpp u Ollama con la variante GGUF APEX (incluye `mmproj` para vision).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Finnish-v3.2-NVFP4 | 35,9B | 3B | 262.144 | Apache 2.0 | NVFP4, AWQ, GGUF, BF16 | Especializado en finlandes, multimodal, tool calling |
| Kataguru-Sceptic-35B-A3B-v2.6-NVFP4 | 35B | 3B | no disponible | Apache 2.0 | NVFP4 | Version anterior bilingue EN-FI, 254 expertos por capa |
| Kataguru-Sceptic-35B-A3B-Basque-v3.2 | 35B | 3B | no disponible | Apache 2.0 | BF16 (y variantes) | Misma estrategia de expansion MoE aplicada al euskera |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada para establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Ficcion creativa a alta temperatura: el autor advierte que para precision morfologica y correccion en finlandes conviene usar `temperature=0.2-0.3` con `presence_penalty=0.3`; a temperaturas altas puede degradarse la calidad gramatical.
- Riesgo de alucinacion: no se documenta en la informacion disponible, pero es inherente a los modelos generativos, especialmente en terminologia juridica o medica especializada.
- Cobertura limitada de idiomas: solo ingles y finlandes; no se declara soporte de castellano ni de otros idiomas.
- Huella de VRAM: el BF16 requiere ~72 GB, lo que limita el despliegue a configuraciones multi-GPU; la variante NVFP4 esta atada a GPUs Blackwell para aprovechar el formato FP4 nativo.
- Dependencia de la variante: el rendimiento de NVFP4 puede diferir del BF16; no se han publicado comparativas de calidad entre ambas variantes.
- Licencia Apache 2.0: permite uso comercial, pero el autor no documenta garantias ni soporte; al ser un modelo de autor independiente, la validacion en produccion corre a cargo del integrador.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible; el corpus de entrenamiento del nucleo no esta detallado.
- Especializacion vertical: el rendimiento en tareas fuera de STEM, codigo, tool calling y finlandes puede ser inferior al de modelos generalistas del mismo tamano.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Finnish-v3.2-NVFP4
- Pesos maestros BF16 v3.2: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Finnish-v3.2
- Variante W4A16-AWQ para vLLM: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Finnish-v3.2-W4A16-AWQ
- Variante GGUF APEX (Small, Medium, Good + mmproj): https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Finnish-v3.2-GGUF
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
- Version anterior v2.6 NVFP4: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v2.6-NVFP4
- Variante en euskera con la misma arquitectura: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Basque-v3.2
