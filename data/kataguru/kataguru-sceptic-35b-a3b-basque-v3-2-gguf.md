# kataguru/Kataguru-Sceptic-35B-A3B-Basque-v3.2-GGUF

## Resumen

Kataguru-Sceptic-35B-A3B-Basque-v3.2-GGUF es la distribucion en formato GGUF del modelo Kataguru-Sceptic-35B-A3B-Basque-v3.2, un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) especializado en euskera, desarrollado por el usuario kataguru. Se construye sobre la base Kataguru-Sceptic-35B-A3B-v3.1 y anade dos expertos dedicados al euskera (gramatica, morfologia, traduccion bidireccional y literatura) manteniendo congelados los 254 expertos originales del modelo base. El resultado es un modelo que conserva las capacidades de razonamiento cientifico, codigo y tool calling del modelo fundacional, al tiempo que incorpora competencia nativa en euskera.

El modelo tiene 35.505.251.456 parametros totales y 3B parametros activos por token, con una ventana de contexto de 262.144 tokens. Incluye un encoder de vision multimodal de 27 capas y una cabeza especulativa MTP (Multi-Token Prediction) en la capa 40. Esta version GGUF emplea cuantizacion calibrada con imatrix especifica para euskera en los 256 expertos, y se distribuye en tres variantes (APEX-Small, APEX-Medium y APEX-Good) mas un proyector multimodal `mmproj-f16.gguf`.

La relevancia de este modelo radica en su enfoque "soberano" para una lengua de bajos recursos como el euskera, combinando un modelo fundacional potente con especializacion linguistica mediante calibracion de router y anadido de expertos, sin sacrificar las capacidades originales. La licencia Apache 2.0 y el formato GGUF lo hacen desplegable en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) tipo transformer, 40 capas, 256 expertos por capa, encoder de vision de 27 capas, cabeza MTP especulativa en capa 40 |
| Parametros totales | 35.505.251.456 |
| Parametros activos | 3B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GGUF APEX-Small (~11,9 GiB), APEX-Medium (~13,6 GiB), APEX-Good (~15,4 GiB); calibracion imatrix para euskera; tambien existen NVFP4 (~24,3 GB) y W4A16-AWQ (~25,3 GB) en otros repos |
| Idiomas soportados | Ingles (en), euskera (eu), finlandes (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (mas `mmproj-f16.gguf` de ~890 MB para vision); el modelo base ofrece safetensors BF16 (~67,5 GB) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura MoE con 40 capas y 256 expertos por capa. Los expertos #0 a #253 corresponden al nucleo congelado del modelo base Kataguru-Sceptic-35B-A3B-v3.1, que aporta razonamiento cientifico, codigo competitivo, tool calling agentico y capacidades de ingenieria industrial (PLC/CNC). Los expertos #254 y #255 son nuevos: el #254 se especializa en gramatica y morfologia del euskera (alineamiento ergativo-absolutivo, concordancia polipersonal Nor-Nori-Nork, sufijos postposicionales aglutinantes) ademas de terminologia tecnica; el #255 cubre literatura, no ficcion y traduccion bidireccional EN<->EU.

El entrenamiento de especializacion se realizo con un conjunto de 4.844 muestras doradas verificadas humanamente (100% de aprobacion en el control de calidad mecanico) y calibracion contrastiva del router (`--moe-mode new_experts_only --recalibrate-router`, r=32, alpha=64). Se conservan intactos los 254 expertos originales, el encoder de vision, la cabeza MTP especulativa y la ventana de contexto de 262.144 tokens, evitando el olvido catastrofico. La cuantizacion GGUF se calibro con un fichero imatrix especifico de euskera (`imatrix_calibration_eu.txt`) aplicado a los 256 expertos.

## Capacidades

- Generacion de texto y razonamiento en ingles, euskera y finlandes.
- Razonamiento cientifico de nivel doctoral (GPQA Diamond 70,20%).
- Programacion competitiva y algoritmica (LiveCodeBench v6 39,43% Pass@1).
- Tool calling y function calling nativo con formato `<tool_call>` AST y deteccion de irrelevancia (BFCL V4 83,67%).
- Capacidades multimodales de vision (image-text-to-text) mediante encoder de 27 capas y proyector `mmproj-f16.gguf`.
- Traduccion de pagina completa EN/ES<->EU en modo `/translate` con preservacion de parrafos y cero charlataneria.
- Modo de razonamiento configurable mediante etiquetas `{REASON:spoon}`, `{REASON:einstein}`, `{REASON:007}`, `{REASON:deep}`, `{REASON:low}`, `{REASON:off}`.
- Plantilla de chat nativa en euskera (`chat_template.jinja`) con prefijo `/eu` y cabeceras de razonamiento localizadas.
- Capacidades de ingenieria industrial (PLC/CNC) y terminologia clinica y de patentes heredadas del modelo base.
- Decodificacion especulativa mediante cabeza MTP en la capa 40.

## Casos de uso

- Traduccion profesional EN/ES<->EU: el modo `/translate` permite traducir paginas completas de prosa literaria y documentacion tecnica preservando la estructura de parrafos, adecuado para editoriales, administraciones publicas vascas y empresas de localizacion.
- Atencion al cliente en euskera: el modelo gestiona conversaciones multi-turno con contexto de hasta 262.144 tokens, lo que permite mantener historiales extensos y documentacion de referencia en la misma ventana.
- Generacion de codigo en produccion: soporta tool calling con 83,67% en BFCL V4, integrable en pipelines de CI/CD para generacion de tests, revision de codigo y automatizacion de tareas de desarrollo.
- Asistencia en razonamiento cientifico y STEM: con 70,20% en GPQA Diamond, puede emplearse como asistente en investigacion de fisica, quimica y biologia molecular, incluyendo explicaciones en euskera.
- Analisis de documentos con vision: al ser image-text-to-text, permite extraer y traducir contenido de imagenes de documentos, utiles en digitalizacion de archivos administrativos vascos.
- Agentes autonomos multi-paso: la combinacion de tool calling, razonamiento configurable y contexto largo permite construir agentes que planifican y ejecutan tareas con llamadas a herramientas externas.
- Terminologia tecnica y juridica en euskera: los expertos #254 y #255 cubren terminologia de ingenieria, medicina clinica y patentes, util para traduccion tecnica especializada.
- Despliegue local en hardware de consumo: las variantes GGUF APEX permiten ejecutar el modelo en una sola GPU de 16 GB (APEX-Medium ~13,6 GiB), habilitando prototipado y uso en estaciones de trabajo sin infraestructura de datacenter.

## Benchmarks y rendimiento

| Benchmark | Puntuacion | Notas |
|---|---|---|
| Media de 15 benchmarks del nucleo | 70,26% | Heredado intacto via expertos congelados #0..#253 |
| GPQA Diamond (STEM nivel doctorado) | 70,20% (139/198) | Fisica, quimica y biologia molecular de posgrado |
| LiveCodeBench v6 (Pass@1) | 39,43% (Easy: 90,70%) | Programacion algoritmica competitiva |
| BFCL V4 Single-Turn AST (tool calling) | 83,67% (Non-Live: 88,44%) | Incluye deteccion de irrelevancia del 80,26% |
| Auditoria Live Basque 10/10 (v3.2) | 10/10 PASS (100%) | Suite HiTZ EvalEU (EusProficiency, EusExams, EusReading, EusTrivia) y traduccion literaria/tecnica de pagina completa |

## Requisitos de hardware

- VRAM para BF16 completo: ~72 GB (2x GPU de 48-80 GB).
- VRAM para NVFP4 / W4A16-AWQ: 2x RTX 5090 de 32 GB con TP=2, o 1 GPU de 32 GB.
- VRAM para GGUF APEX-Medium (~13,6 GiB): cabe en una sola GPU de 16 GB.
- GGUF APEX-Small (~11,9 GiB) y APEX-Good (~15,4 GiB) ofrecen margenes de calidad/espacio alternativos.
- Proyector multimodal adicional: `mmproj-f16.gguf` (~890 MB).
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (segun tags del repo); vLLM para las variantes AWQ; transformers para pesos completos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. El modelo se posiciona como una especializacion linguistica de un MoE de 35B totales y 3B activos, con contexto de 262.144 tokens y licencia Apache 2.0, pero no se han facilitado resultados de benchmarks de alternativas de la misma categoria para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Ficcion creativa a alta temperatura: para precision morfologica y correccion en euskera se recomienda `temperature=0.2-0.3` con `presence_penalty=0.3`.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado tasas especificas de alucinacion.
- El conjunto de entrenamiento especializado en euskera es reducido (4.844 muestras), lo que puede limitar la cobertura en dominios muy especializados no representados.
- Idiomas soportados limitados a ingles, euskera y finlandes; el rendimiento fuera de estos idiomas no esta documentado.
- El modelo base tiene 3B parametros activos, por lo que su capacidad de razonamiento absoluta queda por debajo de modelos densos de mayor tamano, aunque herede buenos resultados en GPQA y BFCL.
- Licencia Apache 2.0 permite uso comercial, pero se debe verificar el cumplimiento de las condiciones del modelo base Kataguru-Sceptic-35B-A3B-v3.1.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.
- La fecha de creacion (2026-11-09) y la nomenclatura de benchmarks (LiveCodeBench v6, BFCL V4) deben tomarse como datos declarados por el autor, no verificados de forma independiente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Basque-v3.2-GGUF
- Pesos maestros BF16: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Basque-v3.2
- Variante NVFP4: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Basque-v3.2-NVFP4
- Variante W4A16-AWQ: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Basque-v3.2-W4A16-AWQ
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
