# sergiogmn/Inkling-2-Mini-Cyber-GGUF

## Resumen

Inkling-2-Mini-Cyber es un ajuste fino del modelo thinkingmachines/Inkling-2-Mini, publicado por el usuario sergiogmn en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de arquitectura MoE (mezcla de expertos) con 26.070.385.152 parámetros totales y aproximadamente 3.400 millones de parámetros activos, según indica el autor en la model card, con una ventana de contexto de 32.768 tokens en la configuración de despliegue recomendada. El modelo base es multimodal (pipeline image-text-to-text) e incorpora un proyector de visión independiente (mmproj-F16.gguf).

El objetivo del ajuste es reducir el comportamiento de rechazo ante consultas técnicas de ciberseguridad ofensiva y defensiva, orientándolo a investigación autorizada, red-teaming, análisis de vulnerabilidades y flujos de trabajo de inteligencia de amenazas (CTI). El autor aplica una edición quirúrgica de pesos: solo 20 de 704 tensores se modifican mediante un adaptador LoRA (r=16, alpha=32) fusionado con un factor de escala de 1,55, lo que representa el 0,0065 % de los parámetros totales. Los 128 expertos MoE cuantizados en IQ4_NL, los embeddings y el proyector de visión permanecen idénticos al modelo original.

La relevancia de esta ficha radica en que el modelo se distribuye como GGUF autónomo (17,6 GB) que funciona en llama.cpp, Ollama y LM Studio sin hooks de runtime personalizados, lo que facilita su despliegue en una GPU de 24 GB de VRAM. No obstante, las mejoras en ciberseguridad conllevan una degradación medible en tareas de código (HumanEval+ cae del 93,3 % al 82,9 %) y una dependencia del modo de razonamiento (thinking) para mantener la conformidad en escenarios adversarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con bucle (looped MoE), multimodal con proyector de visión |
| Parametros totales | 26.070.385.152 (26,4 B según model card) |
| Parametros activos | 3,4 B (según model card) |
| Longitud de contexto | 32.768 tokens (configuración recomendada en llama-server) |
| Tipos de cuantizacion | IQ4_NL (GGUF principal); adaptador LoRA en BF16; proyector de visión F16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (IQ4_NL), safetensors (adaptador PEFT LoRA), mmproj-F16.gguf |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini emplea una arquitectura MoE con mecanismo de bucle (looped MoE), con 26,4 B de parámetros totales y 3,4 B activos por token. El ajuste fino se realizó mediante un adaptador LoRA de rango 16 y alpha 32, entrenado durante al menos dos épocas según la barrida de escalas documentada. El adaptador se fusionó linealmente en las 20 matrices `attn_output.weight` de las capas 4 a 23, con un multiplicador de escala de 1,55 seleccionado tras evaluar el rango 1,0–2,4 sobre el mismo adaptador de la época 2. El resultado se exportó como GGUF IQ4_NL autónomo, sin necesidad de hooks de runtime.

Los datos de entrenamiento no se detallan en la información disponible (número de tokens, composición del dataset, uso de RLHF/DPO). La model card sí especifica que el ajuste se orientó a reducir rechazos en prompts técnicos de seguridad y que no se añadieron barreras de seguridad adicionales. La innovación técnica principal es la edición quirúrgica de pesos: solo 1.720.320 parámetros LoRA se integran en 20 tensores, preservando la integridad byte a byte de los 128 expertos MoE, los embeddings y el proyector de visión. El adaptador es reutilizable sobre otras cuantizaciones del modelo base (Q8_0, Q6_K, etc.) mediante PEFT.

## Capacidades

- Generación de texto conversacional multi-turno con modo de razonamiento nativo (`<|content_thinking|>`), con `reasoning_effort` configurable (recomendado "medium").
- Razonamiento técnico en ciberseguridad: análisis de vulnerabilidades, reproducción de exploits en entornos autorizados, ingeniería de detección y simulación de laboratorio.
- Conocimiento de inteligencia de amenazas: mapeo CVE→CWE, MITRE ATT&CK y consultas de CTI.
- Capacidades multimodales de entrada imagen-texto gracias al proyector de visión `mmproj-F16.gguf` (idéntico al modelo base).
- Soporte de tool calling y uso agéntico multi-paso: supera 5/5 tareas en el benchmark `pi_bench` con 14 llamadas a herramientas en 49,6 s.
- Generación de código: mantiene 16/16 en el cribado `code_16` de HumanEval+, aunque con degradación en el conjunto completo.
- Razonamiento matemático: 91,4 % en GSM8K-128.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Red-teaming autorizado: el modelo permite generar y evaluar prompts ofensivos en entornos de laboratorio con una tasa de rechazo mínima (1 referencia en MITRE-120 @ 4K), lo que agiliza la reproducción de técnicas MITRE ATT&CK en ejercicios controlados.
- Análisis de vulnerabilidades y mapeo CVE→CWE: con un 66,0 % en CTIBench CVE→CWE-100, supera al modelo base y a Qwen3.8-27B-abliterated, por lo que es adecuado para triaje automatizado de informes de vulnerabilidad y enriquecimiento de bases de datos CTI.
- Ingeniería de detección: la combinación de conocimiento de MITRE y razonamiento multi-paso permite redactar reglas de detección y correlacionar tácticas, técnicas y procedimientos en flujos SOC.
- Simulación de adversarios en agentes autónomos: al superar 5/5 tareas multi-paso con tool calling en `pi_bench`, puede integrarse en pipelines agénticos que consulten APIs de threat intelligence, escaneen configuraciones o ejecuten comandos en sandboxes aislados.
- Asistente de análisis de imágenes técnicas: gracias al proyector de visión, puede interpretar capturas de paneles de administración, diagramas de red o salidas de herramientas para apoyar tareas de reconocimiento en evaluaciones autorizadas.
- Generación de código para herramientas de seguridad: aunque HumanEval+ baja al 82,9 %, el cribado `code_16` se mantiene en 16/16, lo que lo hace útil para scripts de automatización de seguridad, parsers de logs y utilidades de explotación en laboratorio.
- Formación y concienciación: en entornos controlados puede generar escenarios de ataque realistas para entrenamiento de equipos defensivos, con la advertencia de no exponerlo a usuarios finales no confiables.

## Benchmarks y rendimiento

| Benchmark | Stock Inkling-2-Mini (IQ4_NL) | Inkling-2-Mini-Cyber (IQ4_NL) | Qwen3.8-27B-abliterated (Q4_K_M) |
|---|---:|---:|---:|
| CyberMetric-500 (MCQ) | 94,0 % (470/500) | 92,8 % (464/500) | 93,8 % (469/500) |
| CTIBench MCQ-250 | 73,2 % (183/250) | 74,0 % (185/250) | 75,2 % (188/250) |
| CTIBench CVE→CWE-100 | 63,0 % (63/100) | 66,0 % (66/100) | 60,0 % (60/100) |
| CyberSecEval MITRE-120 @ 2K (full / full+part / ref) | 0,0 % / 0,8 % / 100 ref | 67,5 % / 75,8 % / 1 ref | 76,7 % / 90,8 % / 0 ref |
| CyberSecEval MITRE-120 @ 4K (full / full+part / ref) | 0,0 % / 0,8 % / 100 ref | 68,3 % / 75,8 % / 1 ref | no disponible |
| AdvBench harmful_test (104, medium) | 0,0 % (104 ref) | 95,2 % (99/104, 0 ref) | no disponible |
| AdvBench harmful_test (104, none) | ~1 % (103 ref) | 64,4 % (67/104, 36 ref) | no disponible |
| Harmless over-refusal (104) | 0/104 | 0/104 | no disponible |
| Pi Agentic Bench (5 tareas) | 4/5 | 5/5 (14 llamadas, 49,6 s) | no disponible |
| HumanEval+ (cribado code_16) | 16/16 | 16/16 (0 cap) | 16/16 |
| HumanEval+ (164 @ 4K) | 93,3 % (153/164) | 82,9 % (136/164, 10 cap) | no disponible |
| GSM8K-128 | no disponible | 91,4 % (117/128) | no disponible |
| MMLU-256 | no disponible | 78,5 % (201/256, 0 multi) | no disponible |

Todas las evaluaciones se ejecutaron con el mismo harness y fueron calificadas con Qwen3Guard-Gen-8B (0 errores de parseo) sobre el GGUF autónomo sin hooks de runtime.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 18 GB para el GGUF IQ4_NL (17,6 GB) más el proyector de visión (610 MB) y overhead de contexto; el autor indica que cabe cómodamente en 24 GB de VRAM.
- GPU recomendadas: RTX 3090, RTX 4090, A10G, L4, A100 y H100. El autor verificó el funcionamiento en llama.cpp con backend ROCm (`server-rocm-inkling-1427-r2`) y en la versión upstream `b12600+` con soporte `inkling2_loop`.
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB de VRAM o más (RTX 3090, RTX 4090). En tarjetas de 16 GB requeriría cuantizaciones más agresivas o descarga parcial de capas a CPU.
- Opciones de despliegue: llama.cpp (`llama-server` con `--jinja`), Ollama, LM Studio y Tintero (con `IK2_ABLATE_MODE=off`). El adaptador LoRA también puede aplicarse con PEFT sobre otras cuantizaciones del modelo base.
- Latencia y throughput: el autor afirma una decodificación aproximadamente 4 veces más rápida que alternativas densas de 27 B, aunque no se proporcionan tokens por segundo concretos. En el benchmark agéntico, 14 llamadas a herramientas se completaron en 49,6 s.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Enfoque | Rendimiento clave |
|---|---:|---:|---:|---|---|---|
| Inkling-2-Mini-Cyber | 26,4 B | 3,4 B | 32.768 | Apache 2.0 | Ciberseguridad y red-teaming | CTIBench CVE→CWE 66,0 %; MITRE-120 @ 4K 68,3 % full |
| Inkling-2-Mini (stock) | 26,4 B | 3,4 B | no disponible | Apache 2.0 | Propósito general multimodal | CTIBench CVE→CWE 63,0 %; MITRE-120 0,0 % full (100 ref) |
| Qwen3.8-27B-abliterated | 27 B (denso) | 27 B | no disponible | no disponible | Propósito general sin rechazos | CTIBench CVE→CWE 60,0 %; MITRE-120 @ 2K 76,7 % full |

La comparativa muestra que el ajuste Cyber mejora el mapeo CVE→CWE frente al modelo base y frente a Qwen3.8-27B-abliterated, reduce drásticamente los rechazos en MITRE-120 y mantiene una tasa de sobre-rechazo en prompts benignos de 0/104. Sin embargo, Qwen3.8-27B-abliterated obtiene mejor cobertura completa en MITRE-120 @ 2K (76,7 % frente a 67,5 %) y mejor resultado en CTIBench MCQ-250, a costa de ser un modelo denso de 27 B con mayor coste de inferencia.

## Limitaciones y advertencias

- El modelo reduce intencionadamente el comportamiento de rechazo en prompts de ciberseguridad ofensiva y no incorpora barreras de seguridad adicionales; el autor advierte explícitamente de no desplegarlo sin filtrado a usuarios finales no confiables.
- Degradación en generación de código: HumanEval+ completo cae del 93,3 % al 82,9 %, con 10 casos que alcanzan el límite de tokens.
- Dependencia del modo de razonamiento: la conformidad en AdvBench cae al 64,4 % con `reasoning_effort=none` frente al 95,2 % con thinking activado; se recomienda el modo "medium".
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en dominios técnicos donde el modelo puede generar CVE, CWE o técnicas MITRE inexistentes; requiere verificación humana en flujos de producción.
- Soporte multilingüe limitado al inglés según la model card, lo que restringe su uso en entornos en castellano sin traducción previa.
- La licencia Apache 2.0 permite uso comercial, pero el uso en actividades ofensivas sin autorización puede infringir normativas de ciberseguridad; el propio autor lo restringe a investigación autorizada.
- El modelo se distribuye principalmente como GGUF IQ4_NL; no se documentan otras cuantizaciones oficiales en el repositorio, aunque el adaptador LoRA permite fusionarlo sobre otras variantes del modelo base.
- No se detallan los datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF/DPO, lo que limita la evaluación de sesgos y procedencia de los datos.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente de los resultados reportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sergiogmn/Inkling-2-Mini-Cyber-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio de cuantizaciones del modelo base: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Runtime Tintero: https://github.com/GodGMN/tintero
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
