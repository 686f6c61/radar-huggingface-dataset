# kataguru/Kataguru-Sceptic-35B-A3B-Turkish-v3.2-W4A16-AWQ

## Resumen

Kataguru-Sceptic-35B-A3B-Turkish-v3.2-W4A16-AWQ es una cuantización INT4 (W4A16, AWQ con `compressed-tensors`) del modelo multimodal turco Kataguru-Sceptic-35B-A3B-Turkish-v3.2, desarrollado por el usuario kataguru. Se trata de un modelo de mezcla de expertos (MoE) de 35.951.822.704 parámetros totales construido sobre la base Kataguru-Sceptic-35B-A3B-v3.1, al que se le han añadido dos expertos específicos para turco (gramática, morfología, terminología técnica y traducción literaria bidireccional) sobre 254 expertos congelados del núcleo original.

El modelo resuelve el problema de adaptar un modelo generalista de razonamiento, código y visión a un idioma de bajos recursos como el turco sin provocar olvido catastrófico: los 254 expertos originales permanecen intactos (preservando el 70,26 % de media en 15 benchmarks, 70,20 % en GPQA Diamond, 39,43 % en LiveCodeBench v6 y 83,67 % en BFCL V4 AST) mientras los dos nuevos expertos aportan capacidad lingüística nativa. Es relevante ahora porque ofrece un empaquetado de ~19,3 GiB en disco (~18,0 GiB en vLLM con `--language-model-only`) que cabe en una única GPU de 24 GB dejando ~6 GiB para caché KV, con una ventana de contexto de 262.144 tokens.

La arquitectura es `qwen3_5_moe` según la librería transformers, con 40 capas MoE de 256 expertos cada una, un codificador de visión multimodal de 27 capas (333 tensores) y una cabeza especulativa MTP en la capa 40 (785 tensores). Los idiomas declarados son inglés, turco y finés, y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`qwen3_5_moe`), 40 capas, 256 expertos por capa, codificador de visión de 27 capas, cabeza MTP especulativa en capa 40 |
| Parametros totales | 35.951.822.704 |
| Parametros activos | 3B por token (modelo base A3B) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | W4A16-AWQ INT4 (pack-quantized, `group_size=128`, observador MSE, `compressed-tensors`); también disponibles NVFP4, BF16 y GGUF APEX en la suite del autor |
| Idiomas soportados | Inglés (en), turco (tr), finés (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantización AWQ W4A16 empaquetada con `compressed-tensors`) |

## Arquitectura y entrenamiento

El modelo es una mezcla de expertos con 256 expertos por capa en 40 capas. La innovación principal de la variante v3.2 es la estrategia de expansión controlada: los expertos #0 a #253 del modelo base v3.1 se congelan por completo, y se añaden dos expertos nuevos. El experto #254 se especializa en gramática y morfología turca (armonía vocálica de 2 y 4 vías, mutación consonántica o *ünsüz yumuşaması*, cadenas de sufijos derivativos y flexivos) además de terminología de ingeniería industrial, PLC/CNC, medicina clínica y patentes. El experto #255 cubre prosa literaria, no ficción, diálogo natural y traducción fiel EN↔TR mediante el modo `/translate`.

El entrenamiento de los nuevos expertos se realizó sobre un conjunto de 4.821 muestras doradas verificadas humanamente (100 % de aprobación en el filtro mecánico y de calidad) con calibración contrastiva del router (`--moe-mode new_experts_only --recalibrate-router`, `r=32, alpha=64`). La cuantización AWQ emplea un conjunto de calibración específico en turco (`calib_nvfp4_awq_256_tr.jsonl` e `imatrix_calibration_tr.txt`). El modelo incorpora una plantilla de chat nativa en turco (`chat_template.jinja`) con etiquetas de control `/tr`, `/translate` y niveles de razonamiento configurables (`{REASON:spoon}`, `{REASON:einstein}`, `{REASON:007}`, `{REASON:deep}`, `{REASON:low}`, `{REASON:off}`).

## Capacidades

- Generación de texto y razonamiento científico de nivel graduado (GPQA Diamond 70,20 %), incluyendo física, química y biología molecular.
- Programación algorítmica competitiva (LiveCodeBench v6 Pass@1 39,43 %, con 90,70 % en problemas fáciles).
- Llamada a herramientas y function calling con AST nativo (`<tool_call>`) y detección de irrelevancia (BFCL V4 AST 83,67 %, 88,44 % en no-live, 80,26 % en detección de irrelevancia).
- Capacidades multimodales de visión: pipeline `image-text-to-text` con codificador de visión de 27 capas.
- Traducción bidireccional de página completa EN↔TR (y con finés) en modo `/translate`, preservando párrafos y sin charla adicional.
- Modo de razonamiento con profundidad regulable mediante etiquetas `{REASON:...}`.
- Capacidades multilingües nativas en inglés, turco y finés, con plantilla de chat localizada en turco.
- Capacidad de decodificación especulativa mediante cabeza MTP en la capa 40.
- Dominio técnico industrial: terminología PLC/CNC, medicina clínica y patentes/estatutos.

## Casos de uso

- Traducción profesional EN↔TR de documentación técnica y literaria: el modo `/translate` produce traducción de página completa preservando párrafos y sin texto conversacional añadido, adecuado para editoriales y departamentos de localización que necesitan fidelidad morfológica en turco.
- Atención al cliente en turco: con 262.144 tokens de contexto puede mantener conversaciones multi-turno extensas con historial completo, y el experto #254 garantiza corrección gramatical y de sufijos en las respuestas.
- Automatización de soporte técnico industrial: el modelo maneja terminología PLC/CNC y puede integrarse en asistentes de mantenimiento que interpretan manuales y generan procedimientos, aprovechando los expertos de ingeniería preservados del núcleo.
- Agentes con tool calling en producción: con BFCL V4 AST de 83,67 % y detección de irrelevancia del 80,26 %, es adecuado para orquestadores de agentes que necesitan decidir cuándo invocar una herramienta y cuándo responder directamente.
- Análisis de documentos con imágenes: al ser `image-text-to-text`, puede procesar capturas de pantalla, formularios escaneados o figuras técnicas y responder preguntas sobre ellos en turco o inglés.
- Asistencia a la programación en equipos turcos: LiveCodeBench v6 de 39,43 % con 90,70 % en problemas fáciles permite autocompletado y revisión de código con explicaciones en turco nativo.
- Procesamiento de documentación clínica y legal en turco: el experto #254 cubre terminología médica clínica y de patentes, útil para resumen y extracción de información en expedientes.
- Despliegue en infraestructura modesta: con ~18,0 GiB en vLLM `--language-model-only` cabe en una GPU de 24 GB, lo que permite servir el modelo en estaciones de trabajo con RTX 4090 para prototipos y entornos de desarrollo.

## Benchmarks y rendimiento

| Benchmark | Puntuación | Notas |
|---|---|---|
| Media de 15 benchmarks del núcleo | 70,26 % | Heredada intacta vía expertos congelados #0..#253 |
| GPQA Diamond | 70,20 % (139/198) | Física, química y biología molecular de nivel graduado |
| LiveCodeBench v6 (Pass@1) | 39,43 % | Fácil: 90,70 % |
| BFCL V4 Single-Turn AST | 83,67 % | No-live: 88,44 %; detección de irrelevancia: 80,26 % |
| Auditoría en vivo turco 10/10 (v3.2) | 10/10 PASS (100 %) | Open Turkish LLM Leaderboard (MMLU-TR, ARC-TR, TruthfulQA-TR) y traducción literaria/técnica EN↔TR |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM para esta cuantización W4A16-AWQ: ~18,0 GiB en vLLM con `--language-model-only`, dejando ~6 GiB para caché KV en una GPU de 24 GB.
- VRAM para BF16 completo: ~72 GB (2× GPU de 48–80 GB).
- VRAM para NVFP4: ~24,3 GB en disco; el autor indica ejecución en 2× RTX 5090 de 32 GB (TP=2) o 1× GPU de 32 GB.
- VRAM para GGUF APEX-Medium: ~13,6 GiB, cabe en una GPU de 16 GB.
- GPU recomendadas: RTX 4090 (24 GB) para esta variante AWQ; RTX 5090 (32 GB) para NVFP4; A100/H100 de 80 GB para BF16 en tensor paralelo.
- Cabe en GPU de consumo: sí, esta variante AWQ en una RTX 4090 de 24 GB; la variante GGUF APEX-Medium en GPUs de 16 GB.
- Opciones de despliegue: vLLM (recomendado, formato `compressed-tensors` compatible con Marlin), llama.cpp/Ollama mediante los GGUF APEX de la suite del autor, transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Turkish-v3.2-W4A16-AWQ | 35,9B | 3B | 262.144 | Apache 2.0 | MoE 256 expertos, multimodal, especializado en turco |
| Kataguru-Sceptic-35B-A3B-Turkish-v3.2 (BF16) | 35,9B | 3B | 262.144 | Apache 2.0 | Mismo modelo sin cuantizar, ~67,5 GB |
| Kataguru-Sceptic-35B-A3B-Turkish-v3.2-NVFP4 | 35,9B | 3B | 262.144 | Apache 2.0 | Cuantización NVFP4 para Blackwell, ~24,3 GB |
| Kataguru-Sceptic-35B-A3B-Turkish-v3.2-GGUF | 35,9B | 3B | 262.144 | Apache 2.0 | Variantes APEX-Small/Medium/Good para llama.cpp |

No se dispone de datos de benchmarks de modelos de terceros comparables en la información proporcionada.

## Limitaciones y advertencias

- Ficción creativa a alta temperatura: el autor advierte que para precisión morfológica y corrección en turco conviene usar `temperature=0.2–0.3` con `presence_penalty=0.3`; a temperaturas altas puede degradarse la corrección de sufijos.
- Riesgo de alucinación: no se documenta una evaluación específica de veracidad más allá de TruthfulQA-TR dentro de la auditoría de 10 pruebas; como todo modelo generativo, puede producir afirmaciones plausibles pero falsas, especialmente en dominios técnicos especializados.
- Cobertura lingüística limitada a inglés, turco y finés; no se declara soporte para otras lenguas, incluido el castellano.
- Huella de VRAM: el BF16 completo requiere ~72 GB, lo que excluye GPUs de consumo; solo las variantes cuantizadas (AWQ, NVFP4, GGUF) son viables en hardware asequible.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y el autor no ofrece compromisos de soporte.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación externa muy reducido, lo que implica menor evidencia independiente sobre su comportamiento en producción.
- El conjunto de entrenamiento de los nuevos expertos es pequeño (4.821 muestras), lo que puede limitar la generalización del experto turco en dominios no cubiertos por esas muestras.

## Enlaces

- Hugging Face (esta cuantización): https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Turkish-v3.2-W4A16-AWQ
- Pesos maestros BF16: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Turkish-v3.2
- Variante NVFP4: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Turkish-v3.2-NVFP4
- Variante GGUF APEX: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Turkish-v3.2-GGUF
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
