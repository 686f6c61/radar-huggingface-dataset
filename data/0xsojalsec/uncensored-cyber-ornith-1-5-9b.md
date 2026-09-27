# 0xSojalSec/Uncensored-Cyber-Ornith-1.5-9B

## Resumen

Uncensored-Cyber-Ornith-1.5-9B es un ajuste fino de tipo QLoRA publicado en Hugging Face por el usuario 0xSojalSec y desarrollado por el equipo DuoNeural (Aura, Archon y Jesse). Se construye sobre OBLITERATUS/Ornith-1.5-9B-OBLITERATED, un modelo denso de 8.953.803.264 parámetros (aproximadamente 9B) perteneciente a la familia Qwen3.5, con stack transformer denso, patrones de atención de estilo Gemma y extensión de contexto nativa mediante YaRN RoPE. El repositorio se presenta como «v3 Production Candidate» con pesos fusionados vía SLERP (t=0,75).

El modelo está especializado en ciberseguridad agéntica, operaciones de terminal multi-turno, triaje de exploits, auditoría de vulnerabilidades e invocación autónoma de herramientas. Su propuesta central es la eliminación deliberada de rechazos ante tareas legítimas de auditoría de seguridad (pentesting, depuración de kernel, ingeniería inversa con IDA/Ghidra, modelado de amenazas), conservando a la vez el modo de razonamiento nativo delimitado por etiquetas `<think>...</think>`.

Es relevante para desarrolladores e investigadores porque combina tres capacidades poco frecuentes en un único modelo de 9B: razonamiento interno explícito, soporte dual de tool calling (XML de Hermes y ejecución Bash interactiva) y un flujo agéntico orientado a terminal. El autor declara un rendimiento de 102 tok/s en una estación de trabajo con una sola GPU, lo que lo sitúa en el rango de modelos desplegables en hardware de consumo. En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 «likes».

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso Qwen3.5 (qwen3_5_text) con patrones de atencion estilo Gemma y YaRN RoPE |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | no aplica (arquitectura densa, no MoE) |
| Longitud de contexto | hasta 128K segun la model card (extension YaRN RoPE); valor nativo no especificado |
| Tipos de cuantizacion | Q8_0 citada en la model card; otras cuantizaciones no disponibles |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo principal); no se confirma publicacion de GGUF |

## Arquitectura y entrenamiento

El modelo parte de un backbone transformer denso de la familia Qwen3.5 con patrones de atención inspirados en Gemma y extensión de contexto mediante YaRN RoPE. Sobre esa base se aplica una adaptación QLoRA (herramienta Unsloth) diseñada para eliminar el rechazo catastrófico en flujos legítimos de auditoría y para preservar trazas cognitivas delimitadas por `<think>...</think>`, que actúan como espacio de planificación antes de emitir código o llamadas a herramientas en JSON. El entrenamiento incorpora tres decisiones técnicas destacables: enmascarado de pérdida solo en el turno de asistente (completion-only loss masking, con `<|im_start|>assistant\n` desenmascarado), que evita que el modelo simule salidas de terminal en lugar de devolver el control al arnés; regularización de embeddings NEFTune con alpha=5,0, que mejora la tolerancia a salidas bash ruidosas o truncadas, volcados hexadecimales y registros no estructurados; y soporte dual de arnés de herramientas (XML de Hermes con `<tools>`, `<tool_call>` y `<tool_response>`, por un lado, y ejecución Bash interactiva, por otro).

El corpus de entrenamiento declarado consta de 45.000 trayectorias multiturno curadas, con una mezcla ponderada por dominios: 35% operaciones y triaje de ciberseguridad (oi-uae/cyber-security, hotdogs/uka-cyber-dataset, trend-cybertron/Primus-Reasoning); 30% dominio de CLI y terminal (Lite-Coder/LiteCoder-Terminal-SFT, rajistics/openhands-synthetic-conversations, emirkaanozdemr/bash_command_data_6K); 20% function calling y herramientas (NousResearch/hermes-function-calling-v1, orientado a esquemas JSON estrictos y uso multi-paso); y 15% «replay cognitivo» sobre open-thoughts/OpenThoughts3-1.2M como ancla de regularización para evitar deriva en matemáticas, código y lógica. No se detalla en la información disponible el uso de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento con trazas internas explícitas en modo «thinking» delimitadas por `<think>...</think>`.
- Ciberseguridad ofensiva y defensiva: modelado de amenazas, análisis de zero-day, forense de CVE, triaje de exploits y generación de parches.
- Dominio de terminal y CLI: tuberías complejas, sed, awk, expresiones regulares, exploración de entorno y auditoría de bits SUID.
- Uso de herramientas y function calling: emisión de llamadas en JSON con esquemas estrictos y soporte multi-paso, con arnés XML de Hermes.
- Capacidades agénticas multi-turno orientadas a operaciones autónomas en terminal.
- Soporte dual de arnés: tool calling XML y ejecución Bash interactiva (estilo Claude Code).
- Conservación de capacidades cognitivas generales (matemáticas, código, lógica) mediante el componente de replay.
- Comportamiento «uncensored»/obliterated: sin rechazos moralizantes ante tareas de pentesting, depuración de kernel o ingeniería inversa.
- Capacidades multilingües: no disponibles (el modelo declara únicamente inglés).

## Casos de uso

- Triaje automatizado de vulnerabilidades: el modelo puede analizar informes de CVE y trazas de exploits, clasificar severidad y proponer mitigaciones dentro de su bucle de razonamiento interno antes de emitir el veredicto.
- Auditoría de seguridad de código en CI/CD: integrado como herramienta agéntica, revisa diferencias de código (diffs) y sugiere parches, apoyándose en su soporte de function calling para invocar analizadores estáticos.
- Asistente de operaciones en terminal: ejecuta y encadena comandos bash, interpreta salidas ruidosas o truncadas (gracias a NEFTune) y devuelve el control al usuario en lugar de fabricar resultados.
- Automatización de respuesta a incidentes: gestiona conversaciones multiturno con contexto largo (hasta 128K), correlacionando artefactos de distintos sistemas durante una investigación.
- Ingeniería inversa asistida: ayuda a interpretar volcados hexadecimales y desensamblados en flujos de IDA/Ghidra, describiendo estructuras y posibles rutas de explotación en entornos autorizados.
- Agente de refactorización de repositorios: gestiona operaciones de git y refactorización desde la terminal, un escenario para el que el autor reporta evaluación con el benchmark Aider CLI.
- Generación de pruebas de penetración en laboratorio: produce escenarios de ataque y verificación de controles en entornos controlados, sin bloqueos por rechazo.
- Construcción de pipelines de agentes autónomos: se integra como motor de decisión y ejecución dentro de orquestadores que requieran tool calling estricto en JSON.

## Benchmarks y rendimiento

La información disponible incluye métricas objetivo definidas por el autor (baseline del modelo base, objetivo mínimo y objetivo ideal) y una nota con resultados que el autor declara validados empíricamente. Estos datos están autodeclarados y no constan verificaciones independientes.

Objetivos declarados por el autor:

| Benchmark | Baseline (Ornith-1.5-9B) | Objetivo minimo | Objetivo ideal |
|---|---|---|---|
| Terminal-Bench 2.1 (Pass@1, media de 5 ejecuciones) | 46,2% | >= 50,0% | >= 54,5% |
| SWE-bench Verified (resueltos) | 70,6% | >= 69,5% | >= 72,0% |
| CyberSecEval 3 (defensa/triaje) | ~42,0% | >= 62,0% | >= 68,0% |
| GPQA Diamond (cero-shot CoT) | 86,4% | >= 84,5% | >= 86,5% |
| Berkeley Function Calling / BFCL (AST JSON) | ~78,0% | >= 86,0% | >= 90,0% |
| Aider CLI Benchmark | ~64,0% | >= 68,0% | >= 72,0% |

Resultados declarados como validados en la nota del autor (v3):

| Metrica | Resultado declarado |
|---|---|
| CyberSecEval (triaje y defensa) | 100,0% |
| Cumplimiento sin rechazos (zero-refusal) | 100,0% |
| Hermes function calling (precision AST) | 95,0% |
| Terminal-Bench (tasa de exito operativa) | 62,5% |
| Velocidad de inferencia (RTX 4080 Super, Q8_0) | 102 tok/s |

La model card incluye además una tabla comparativa «head-to-head» entre el modelo base y Cyber-Ornith v3 (greedy, T=0,2, Q8_0, RTX 4080 Super), pero el contenido de esa tabla aparece truncado en la información disponible, por lo que no es posible reproducir sus valores.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 18 GB en FP16/BF16; en torno a 10-11 GB en Q8_0; alrededor de 5-6 GB en Q4 (estimación según el tamaño de 9B).
- GPU recomendadas: el autor declara 102 tok/s en una sola RTX 4080 Super (la model card indica 32 GB de VRAM, cifra que no coincide con la capacidad real de ese modelo de GPU); también es apto para A100, H100 y RTX 4090.
- Compatibilidad con GPU de consumo: sí; cabe en RTX 4090 (24 GB) en FP16 y en tarjetas de 12-16 GB con cuantización Q8_0 o Q4.
- Opciones de despliegue: llama.cpp (formato Q8_0 citado), vLLM, TGI y Ollama; Unsloth aparece como herramienta de entrenamiento.
- Latencia y throughput: 102 tok/s declarados por el autor en RTX 4080 Super a Q8_0; no se ofrecen datos de latencia por token ni de rendimiento en otros hardwares.

## Comparativa con modelos similares

La información disponible solo permite comparar de forma directa con el modelo base del que deriva.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cyber-Ornith-1.5-9B (este modelo) | ~9B denso | hasta 128K (YaRN) | Resultados autodeclarados en ciberseguridad, tool calling y terminal | apache-2.0 | Hugging Face |
| OBLITERATUS/Ornith-1.5-9B-OBLITERATED (base) | ~9B denso | no disponible con detalle | Baseline citado: 46,2% Terminal-Bench, 70,6% SWE-bench Verified, ~42% CyberSecEval 3 | no disponible | Hugging Face |
| Otros modelos de 9B densos de la familia Qwen3.5 | ~9B denso | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes sobre alternativas equivalentes de ciberseguridad agéntica del mismo tamaño para establecer comparaciones adicionales.

## Limitaciones y advertencias

- Modelo «uncensored»/obliterated: elimina deliberadamente los rechazos ante tareas de seguridad ofensiva, lo que supone un riesgo de uso indebido fuera de entornos autorizados.
- Riesgo de alucinación: aunque el enmascarado de pérdida busca evitar la simulación de salidas de terminal, persiste el riesgo de generar comandos, rutas o resultados plausibles pero incorrectos.
- Idiomas: soporte declarado únicamente en inglés; no hay capacidades multilingües confirmadas.
- Métricas autodeclaradas: los resultados (incluido un 100% en CyberSecEval de triaje/defensa) provienen del propio autor y no constan verificaciones independientes; algunos valores parecen superar de forma llamativa los objetivos declarados, por lo que conviene tratarlos con cautela.
- Discrepancias internas: la model card indica 32 GB de VRAM en una RTX 4080 Super, cifra que no corresponde a ese modelo de GPU.
- Atribución: el repositorio lo publica 0xSojalSec, pero la model card lo atribuye a DuoNeural; conviene aclarar la autoría antes de citarlo.
- Madurez: el repositorio registra 0 descargas y 0 «likes», por lo que su comportamiento en producción a escala no está contrastado.
- Licencia: apache-2.0 permite uso comercial, pero el usuario sigue siendo responsable del cumplimiento legal y ético del uso de las capacidades ofensivas.
- Contenido de la model card truncado: la tabla comparativa final no está completa en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/0xSojalSec/Uncensored-Cyber-Ornith-1.5-9B
- Modelo base: https://huggingface.co/OBLITERATUS/Ornith-1.5-9B-OBLITERATED
- Org del desarrollador: https://huggingface.co/DuoNeural
- Web del desarrollador: https://duoneural.com
- Dataset oi-uae/cyber-security: https://huggingface.co/datasets/oi-uae/cyber-security
- Dataset hotdogs/uka-cyber-dataset: https://huggingface.co/datasets/hotdogs/uka-cyber-dataset
- Dataset trend-cybertron/Primus-Reasoning: https://huggingface.co/datasets/trend-cybertron/Primus-Reasoning
- Dataset Lite-Coder/LiteCoder-Terminal-SFT: https://huggingface.co/datasets/Lite-Coder/LiteCoder-Terminal-SFT
- Dataset rajistics/openhands-synthetic-conversations: https://huggingface.co/datasets/rajistics/openhands-synthetic-conversations
- Dataset emirkaanozdemr/bash_command_data_6K: https://huggingface.co/datasets/emirkaanozdemr/bash_command_data_6K
- Dataset NousResearch/hermes-function-calling-v1: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Dataset open-thoughts/OpenThoughts3-1.2M: https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M
