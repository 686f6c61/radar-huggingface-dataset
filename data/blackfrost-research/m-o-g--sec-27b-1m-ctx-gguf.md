# Blackfrost-Research/M.O.G.-SEC-27B-1M-CTX-GGUF

## Resumen

M.O.G.-SEC-27B-1M-CTX-GGUF es la version cuantizada en formato GGUF del modelo Blackfrost-Research/M.O.G.-SEC-27B-1M-CTX-BF16, un checkpoint especializado en ciberseguridad ofensiva y defensiva perteneciente a la linea Minds of Gods (M.O.G.) de Blackfrost Research. El modelo, apodado Qwentium, es un fine-tuning denso de 27B parametros sobre la base Qwen/Qwen3.8-27B, con una ventana de contexto de un millon de tokens mediante extension YaRN, lo que permite mantener en contexto operaciones largas: reconocimiento, grafos de vulnerabilidades, notas de explotacion, contenido de deteccion, informes y cronologias de campanas.

La relevancia de este lanzamiento reside en dos aspectos: su especializacion en un dominio tecnico de alto riesgo donde los modelos generalistas suelen fallar o negarse a operar, y su soporte de decodificacion especulativa mediante un sidecar DFlash2 en BF16 que acelera la inferencia. La version GGUF incluye toda la escalera de cuantizaciones Q2_K a Q8_0, el proyector de vision en F16, la cabeza MTP preservada y una plantilla de chat multimodal con tool-use. El autor advierte explicitamente que no es un chatbot de consumo y que debe controlarse su acceso como un arma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen35 (densa hibrida Gated DeltaNet + atencion con vision nativa) |
| Parametros totales | 27.320.697.856 (27B) |
| Parametros activos | no aplica (denso) |
| Longitud de contexto | 1.000.000 tokens via YaRN; nativa 262.144 |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | ingles, multilingue (segun model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF v3 (quantization version 2) |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.8-27B, que utiliza una arquitectura densa hibrida que combina Gated DeltaNet con atencion por ventanas (gated attention) y vision nativa. Sobre esta base, Blackfrost ha aplicado un fine-tune especializado en ciberseguridad, tanto ofensiva como defensiva, con un identidad de sistema integrada (Qwentium) que evita el moralismo y las negativas en tareas operativas. La extension de contexto se logra con YaRN con factor 4.0, theta 10.000.000 y configuracion MRoPE [11, 11, 10, 0], manteniendo el contexto nativo de 262.144 tokens como referencia.

El checkpoint incluye un MTP (Multi-Token Prediction) como capa adicional de prediccion, preservada en todos los GGUFs de texto, y un sidecar DFlash2 separado de 3.60 GiB en BF16 con cinco capas de draft y selector de candidatos dinamico para decodificacion especulativa. La cuantizacion se realizo directamente desde el BF16 sin requantizaciones intermedias. No se ha publicado informacion sobre el dataset de entrenamiento, el numero de tokens utilizados, ni el proceso de alineacion (RLHF/DPO).

## Capacidades

- Generacion de texto y razonamiento especializado en ciberseguridad ofensiva y defensiva, con modo de pensamiento (thinking) activado por defecto.
- Soporte multimodal nativo imagen-texto a traves del proyector F16 `qwen3vl_merger` incluido por separado.
- Tool calling y chat template multimodal preparado para herramientas, con identidad Qwentium integrada en el prompt.
- Ventana de contexto de 1M tokens para trabajos largos: reconocimiento, grafos de vulnerabilidades, notas de explotacion, contenido de deteccion, reportes y cronologias de campana.
- Decodificacion especulativa acelerada mediante sidecar DFlash2 BF16 (requiere build de llama.cpp con el PR #27342).
- Soporte multilingue, aunque el foco principal es el ingles tecnico.
- Capacidad de operar sin negarse a tareas de seguridad ofensiva, segun el autor (uncensored).

## Casos de uso

- Reconocimiento y OSINT en operaciones de red team: el modelo puede procesar y correlacionar grandes volumenes de datos de reconocimiento (DNS, certificados, banners) dentro de una ventana de 1M tokens, manteniendo el contexto completo de una campana.
- Analisis de malware y codigo ofensivo: puede analizar binarios desensamblados, scripts de exploit y payloads, identificando patrones de comportamiento y generando informes tecnicos detallados.
- Redaccion de contenido de deteccion (Sigma, YARA, Suricata): genera reglas de deteccion a partir de descripciones de tacticas, tecnicas y procedimientos (TTPs) de actores de amenaza.
- Gestion de incidentes y respuesta: durante un incidente activo, puede procesar logs, correlacionar eventos y proponer acciones de contencion, manteniendo el contexto completo de la investigacion.
- Generacion de reportes tecnicos y ejecutivos: produce documentacion detallada de hallazgos de seguridad, lineas de tiempo de ataque y recomendaciones, en formato listo para entregar al cliente.
- Analisis de campanas APT: con la ventana de 1M tokens puede ingerir multiples reportes publicos, notas de intrusion y muestras de malware para construir una vision unificada de una campana.
- Soporte en entrenamiento de equipos de seguridad: como simulador de adversario para ejercicios de purple team, generando escenarios realistas y evaluando las respuestas del equipo defensor.

## Benchmarks y rendimiento

La model card del autor reporta los siguientes resultados, aunque no se proporcionan detalles sobre la metodologia de evaluacion ni comparaciones con modelos similares:

| Benchmark | Resultado |
|---|---|
| MMLU-Pro (validacion, thinking on, xhigh) | 65/70 |
| HumanEval | 96,3% |
| Harmful true hold (resistencia a contenidos nocivos) | 4/300 |

No se han publicado resultados de benchmarks en la informacion disponible mas alla de los indicados.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M pesa 15,66 GiB, Q6_K 20,89 GiB y Q8_0 27,05 GiB. Se debe dejar memoria adicional para buffers de runtime, el proyector de vision si se usa, y especialmente para la cache de contexto. Una ventana de 1M tokens requiere una cantidad de memoria muy superior a la del modelo.
- GPU recomendadas: para Q4_K_M o menor, una GPU de 24 GB (RTX 3090/4090) es suficiente para texto corto; para contexto largo o cuantizaciones Q6/Q8 se recomienda A100 80GB o H100.
- En consumer GPU: es viable con cuantizaciones Q4 o menores y contexto corto (8K), pero el contexto de 1M es impractico en hardware de consumo.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server) y cualquier proyecto compatible con GGUF (Ollama, llama-cpp-python, etc.). Para DFlash2 se requiere un build de llama.cpp con el PR #27342.
- Latencia y throughput: no disponibles en la informacion proporcionada. La decodificacion especulativa con DFlash2 deberia reducir la latencia por token frente a la decodificacion autoregresiva, pero no se publican cifras concretas.

## Comparativa con modelos similares

No se dispone de benchmarks comparativos publicados por el autor. Como referencia estructural, el modelo se basa en Qwen3.8-27B, por lo que la comparacion natural seria con el propio Qwen3.8-27B base y con la version abliterada del mismo modelo:

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| M.O.G.-SEC-27B-1M-CTX-GGUF | 27B | 1M (YaRN) | Ciberseguridad ofensiva/defensiva | Apache 2.0 |
| Qwen/Qwen3.8-27B (base) | 27B | 262.144 nativo | General | Apache 2.0 |
| Blackfrost-AI/Qwen3.8-27B-ABLITERATED-GGUF | 27B | 262.144 | General sin censura | Apache 2.0 |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion disponible.

## Limitaciones y advertencias

- El autor declara que el modelo no moraliza, no duda ni rechaza trabajo del operador, y recomienda controlar su acceso como un arma. Es un modelo de investigacion "not for all audiences" que puede generar contenido ofensivo o peligroso si se usa de forma inadecuada.
- Riesgo de alucinacion en dominios tecnicos: como cualquier LLM, puede inventar CVEs, exploits o procedimientos que no son reales, lo que en ciberseguridad puede tener consecuencias graves.
- Sesgos y limitaciones de idioma: el modelo esta centrado en ingles tecnico; su rendimiento en otros idiomas no esta documentado.
- La extension de contexto a 1M via YaRN puede degradar la calidad en contextos muy largos y requiere recursos de memoria considerables, incluso con cuantizaciones bajas.
- El soporte DFlash2 es experimental: requiere una build de llama.cpp con el PR #27342, que esta en revision; un build normal no puede cargar el sidecar.
- La licencia es Apache 2.0, lo que permite uso comercial, pero el autor declara explicitamente que no es un producto de consumo y que debe tratarse con cautela.
- No se publican detalles sobre el proceso de entrenamiento, dataset o alineacion, lo que dificulta evaluar su robustez y sesgos.

## Enlaces

- Modelo GGUF: https://huggingface.co/Blackfrost-Research/M.O.G.-SEC-27B-1M-CTX-GGUF
- Modelo padre BF16: https://huggingface.co/Blackfrost-Research/M.O.G.-SEC-27B-1M-CTX-BF16
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Sidecar DFlash2 (referencia): https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- PR llama.cpp para DFlash2: https://github.com/ggml-org/llama.cpp/pull/27342
- Perfil del autor en X: https://x.com/Blackfrost_AI
- Modelo NVFP4 del mismo proyecto: https://huggingface.co/Blackfrost-Research/M.O.G.-SEC-27B-1M-CTX-NVFP4
