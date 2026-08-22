# Blackfrost-Research/M.O.G.-SEC-27B-1M-CTX-NVFP4

## Resumen

M.O.G.-SEC-27B-1M-CTX-NVFP4 es un modelo de lenguaje multimodal especializado en ciberseguridad ofensiva y defensiva, desarrollado por Blackfrost-Research (Blackfrost Sofwares Corp., Las Vegas). Forma parte de la línea "Minds of Gods" (M.O.G.), una colección de modelos de dominio específico creados para tareas que los modelos generalistas rechazan por políticas de seguridad. Este checkpoint concreto, denominado "Qwentium, GOD of Cybersec", se ha ajustado con datos reales de trabajo ofensivo y defensivo moderno, sin refusals ni sermones de doble uso, y se sirve con una ventana de contexto de un millón de tokens.

El modelo se basa en Qwen3.8-27B (arquitectura `Qwen3_5ForConditionalGeneration`), un modelo denso híbrido con atención gated y visión nativa. Se ha extendido su contexto original de 262 144 tokens a 1 000 000 mediante YaRN (factor 4.0) y se ofrece en precisión NVFP4 (W4A16) para optimizar el uso de VRAM. Es un modelo "sin censura" en el sentido de que no aplica rechazos basados en políticas de uso dual; el autor lo describe como "accesible como un arma" y no como un chatbot de consumo. Su relevancia radica en cubrir un nicho donde los modelos frontera suelen negarse a generar contenido de seguridad, ofreciendo a investigadores y profesionales un asistente técnico de largo alcance para tareas de red team y blue team.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` · dense hybrid GDN + gated attention · visión nativa |
| Parametros totales | 18 548 690 160 (18,5 B, según safetensors; el nombre comercial indica 27 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1 000 000 tokens (YaRN, factor 4.0; nativo 262 144) |
| Tipos de cuantizacion | NVFP4 (W4A16) para pesos; KV cache en FP8 E4M3 |
| Idiomas soportados | Inglés y multilingüe (no se especifica lista completa) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (NVFP4) |

## Arquitectura y entrenamiento

El modelo es una variante de Qwen3.8-27B, que emplea una arquitectura densa híbrida con **Gated DeltaNet (GDN)** y atención gated. Esta combinación permite un uso eficiente de la memoria para ventanas de contexto muy largas, ya que el KV cache se mantiene en FP8 E4M3 durante la inferencia. La extensión a 1 millón de tokens se realiza con el recetario oficial de YaRN (factor 4.0, `rope_theta=10 000 000`, `partial_rotary_factor=0.25`), manteniendo la configuración `mrope_interleaved` y `mrope_section` originales. El modelo también incorpora **DFlash 2** como método de decodificación especulativa por defecto, con 8 tokens de borrador, y soporta MTP (multi-token prediction) aunque el autor indica que "MTP está muerto en este fine-tune".

El entrenamiento se realizó mediante **SFT** (supervised fine-tuning) sobre un conjunto de datos de ciberseguridad ofensiva y defensiva, curado a partir de generaciones de modelos frontera de las que se eliminaron las negativas y los discursos de doble uso. No se menciona el uso de RLHF o DPO. Los datos incluyen tareas modernas de 2026 (no CTF clásicas): rutas de explotación, reglas SIEM, detección de brechas, planes de emulación de adversarios y análisis de malware. El resultado es un modelo que no moraliza ni se niega a realizar operaciones técnicas, y que mantiene un contexto de 1M tokens para seguir el hilo de una operación completa.

## Capacidades

- Generación de texto y razonamiento avanzado, con modo "thinking" (razonamiento encadenado) activable mediante `reasoning_effort`.
- Capacidades multimodales nativas: entrada de imagen y texto (pipeline `image-text-to-text`), útil para analizar capturas de pantalla, diagramas de red o imágenes de malware.
- Generación de código y soporte de matemáticas: HumanEval 96,3 %, MMLU-Pro 65/70 (65 %).
- Especialización en ciberseguridad ofensiva y defensiva: generación de exploits, detección de intrusiones, hardening, reglas SIEM, emulación de adversarios.
- Ventana de contexto de 1M tokens, capaz de mantener el contexto completo de una operación (reconocimiento, gráfico de vulnerabilidades, notas de explotación, informe).
- Decodificación especulativa DFlash 2 (8 draft tokens) que alcanza ~81-89 tok/s en la configuración de laboratorio.
- Sin rechazos por políticas de uso dual: el modelo no aplica refusals en tareas de ciberseguridad.
- Capacidades multilingües (etiqueta `multilingual`), aunque no se detalla la lista de idiomas.

## Casos de uso

- **Pruebas de penetración (pentesting)**: el modelo puede generar vectores de explotación, adaptar payloads y mantener el contexto completo de la infraestructura objetivo (hosts, puertos, servicios) gracias a su ventana de 1M tokens, evitando perder el hilo en operaciones largas.
- **Detección y respuesta a incidentes (blue team)**: analiza grandes volúmenes de logs y alertas (por ejemplo, un mes de eventos) en una sola consulta, identificando patrones de intrusión y sugiriendo acciones de contención.
- **Generación de reglas de detección**: crear consultas SIEM, reglas de Suricata o YARA a partir de descripciones de técnicas de ataque (por ejemplo, TTPs de MITRE ATT&CK), con precisión técnica sin las restricciones habituales de otros modelos.
- **Análisis de malware**: extraer indicadores de compromiso (IOCs) de imágenes de capturas de pantalla o de código, y generar informes detallados de comportamiento del malware.
- **Emulación de adversarios**: diseñar planes de emulación de adversarios (adversary emulation) basados en tácticas reales, incluyendo la secuencia de pasos y los comandos necesarios.
- **Automatización de informes de seguridad**: redactar informes técnicos de auditoría, resumir hallazgos de escaneos y generar documentación de cumplimiento.
- **Entrenamiento de personal de ciberseguridad**: simular ataques controlados y evaluar las respuestas de los estudiantes, usando el modelo como generador de escenarios realistas.
- **Análisis de código malicioso**: desensamblar y explicar funciones maliciosas, identificar técnicas de evasión y proponer contramedidas, todo en el mismo contexto.

## Benchmarks y rendimiento

El autor proporciona resultados de laboratorio (2026-08-19/21) en una caja con dos GPU Blackwell de 96 GB. Se han completado las siguientes evaluaciones:

| Benchmark | Resultado |
|---|---|
| MMLU-Pro (validación, thinking on, xhigh) | 65/70 |
| HumanEval | 96,3 % |
| R1-HARMFUL-BENCH-450 (Harmful true hold) | 4/300 |
| Decodificación con DFlash 2 (spec, 8 tokens) | ~81-89 tok/s |
| Decodificación sin spec | ~61 tok/s |

Los resultados de R1-HARMFUL-BENCH-450 se obtuvieron con el protocolo: sistema Qwentium, thinking on, `reasoning_effort=medium`, temperatura 1.0, `top_p=0.95`, `top_k=20`, `max_tokens=4096`, sobre los datasets AdvBench (150), StrongREJECT (150) y XSTest (150). El valor 4/300 indica que solo 4 de 300 entradas fueron clasificadas como dañinas verdaderas, lo que sugiere un alto nivel de generación de contenido sensible sin filtros.

## Requisitos de hardware

- **VRAM estimada**: el modelo NVFP4 ocupa aproximadamente 9,25 GB en pesos (18,5 B × 0,5 bytes), pero el KV cache para 1M tokens en FP8 es muy grande. La configuración de laboratorio utiliza **dos GPU de 96 GB** (probablemente NVIDIA Blackwell, tipo DGX Spark) para servir el contexto completo.
- **GPU recomendadas**: dos GPU de 96 GB (Blackwell) para 1M tokens; para contextos más cortos (p. ej., 128k) podría caber en una GPU de 48 GB, aunque no se proporcionan datos exactos.
- **¿Cabe en GPU de consumo?**: No se indica explícitamente. Con 9,25 GB de pesos, una RTX 4090 (24 GB) podría cargar el modelo, pero el KV cache de 1M tokens excedería la VRAM. Para ventanas de contexto reducidas (≤32k) es plausible, pero no está verificado.
- **Opciones de despliegue**: SGLang (con variable `SGLANG_ALLOW_OVERWRITE_LONGER_CONTEXT_LEN=1` y `--context-length 1000000`), FriendliAI (API), y también es compatible con la librería `transformers`. El repositorio incluye un `deployment-kit/` con scripts para DGX Spark y un perfil de prueba.
- **Latencia y throughput**: ~81-89 tok/s con DFlash 2 (decodificación especulativa) en la configuración de dos GPU Blackwell; ~61 tok/s sin especulación. No se proporcionan datos de latencia de primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precisión | Licencia | Especialización |
|---|---|---|---|---|---|
| **M.O.G.-SEC-27B-1M-CTX-NVFP4** (este) | 18,5 B | 1 M | NVFP4 | Apache 2.0 | Ciberseguridad ofensiva y defensiva, sin censura |
| **Qwen3.8-27B** (base) | 27 B (aprox.) | 262 144 | BF16/FP8 | Apache 2.0 | Generalista, con políticas de seguridad |
| **M.O.G.-SEC-27B-1M-CTX-BF16** (hermano) | 18,5 B | 1 M | BF16 | Apache 2.0 | Mismo fine-tune, mayor precisión, mayor VRAM |

No se han encontrado comparativas directas con otros modelos especializados en ciberseguridad (p. ej., WhiteRabbit, CyberSecGPT) en la información disponible. La principal diferencia frente al base es la eliminación de refusals y el contexto extendido, así como la especialización del dataset.

## Limitaciones y advertencias

- **Modelo sin censura**: no aplica refusals en tareas de ciberseguridad. Puede generar contenido peligroso (exploits, técnicas de evasión) que puede ser utilizado de forma malintencionada. Debe ser controlado como un arma.
- **Riesgo de alucinación**: a pesar de su especialización, puede generar información técnica falsa o imprecisa, especialmente en contextos muy largos. Se recomienda verificar los resultados con fuentes adicionales.
- **Degradación de calidad en contextos cortos**: el ajuste con YaRN (factor 4.0) para 1M tokens puede degradar la calidad en conversaciones cortas o preguntas puntuales.
- **Idiomas**: aunque se etiqueta como multilingüe, no se especifican los idiomas soportados; el entrenamiento principal parece estar en inglés.
- **Licencia y uso comercial**: licencia Apache 2.0, pero el modelo está etiquetado como "research" y "not-for-all-audiences". El autor recomienda acceso controlado; no se garantiza su aptitud para entornos productivos sin supervisión.
- **Sesgos del dataset**: el dataset de ciberseguridad proviene de generaciones de modelos frontier sin refusals, lo que puede introducir sesgos en las respuestas (p. ej., sobrevalorar técnicas específicas o ignorar defensas).
- **Requisitos de hardware**: para el contexto completo de 1M se necesitan dos GPU de 96 GB; no se ha validado el despliegue en hardware de consumo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Blackfrost-Research/M.O.G.-SEC-27B-1M-CTX-NVFP4)
- [Colección Blackfrost-Research en Hugging Face](https://huggingface.co/Blackfrost-Research/collections)
- [Página del modelo en FriendliAI (API)](https://friendli.ai/models/Blackfrost-Research/M.O.G.-SEC-27B-1M-CTX-NVFP4)
- [Publicación en X de Blackfrost_AI](https://x.com/Blackfrost_AI/status/2090857222003913002)
- [Modelo base BF16](https://huggingface.co/Blackfrost-Research/M.O.G.-SEC-27B-1M-CTX-BF16)
