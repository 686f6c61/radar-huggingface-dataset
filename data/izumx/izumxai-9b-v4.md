# Izumx/IzumxAI-9B-v4

## Resumen

IzumxAI-9B-v4 es un modelo de lenguaje de 9.650 millones de parámetros especializado en ciberseguridad, desarrollado por Izumx como un ajuste fino QLoRA del modelo base Qwen3.5-9B. Su propósito declarado es cubrir tareas donde los rechazos de los modelos alineados resultan especialmente problemáticos: triaje de vulnerabilidades, revisión de código seguro, análisis de artefactos y logs, mapeo a MITRE ATT&CK y razonamiento sobre inteligencia de amenazas. El modelo ha sido sometido a un proceso de "abliteration" (eliminación de la dirección de rechazo en el espacio de activaciones) que, según el autor, reduce a cero las negativas en un conjunto de 41 pruebas específicas.

La relevancia del modelo reside en su enfoque explícito hacia el uso ofensivo y defensivo autorizado en seguridad, un nicho donde la mayoría de los modelos comerciales aplican filtros estrictos. Se distribuye únicamente en formato GGUF cuantizado (Q4_K_M y Q5_K_M), lo que permite ejecutarlo en GPU de consumo con 6-8 GB de VRAM, y mantiene la licencia Apache-2.0 del modelo base. El modelo fue publicado el 17 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas.

El autor advierte que la abliteración elimina los rechazos pero no garantiza la corrección de las respuestas, y que el modelo es vulnerable a inyección de prompts por diseño. Está pensado para pentesters, analistas de SOC, jugadores de CTF y equipos de respuesta a incidentes, no para despliegues autónomos sin supervisión humana.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B); no se detalla la arquitectura interna en la información disponible |
| Parámetros totales | 9,65 mil millones (clase 9B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens en la configuración de Ollama/llama.cpp recomendada; el entrenamiento QLoRA usó 2.048 tokens |
| Tipos de cuantización | GGUF Q4_K_M (5,2 GB) y Q5_K_M (6,0 GB); no se publican otros formatos |
| Idiomas soportados | Inglés (en) y ruso (ru) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); no se publican safetensors del modelo fusionado |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B en bf16, cargado en 4 bits NF4 para el entrenamiento. Se aplicó un ajuste fino QLoRA con rango 32, alpha 64, dropout 0,05 y contexto de 2.048 tokens. El conjunto de datos consta de 3.161 ejemplos: 1.038 tareas sintéticas verificadas de razonamiento y código, más 2.200 registros de SFT de ciberseguridad destilados del dataset `Vyber07/cyber-security` y filtrados para eliminar bloques de código mal formados, rechazos, saltos de línea escapados, respuestas no inglesas y respuestas de baja entropía. Se entrenaron 2 épocas con learning rate 2e-4, acumulación de gradiente 8, scheduler coseno y AdamW paginado de 8 bits. La pérdida de validación descendió de 0,8662 a 0,3198 a lo largo de 786 pasos.

Tras el entrenamiento, el adaptador LoRA se fusionó en los pesos base y se aplicó abliteration a escala 1,4 en CPU, un procedimiento que elimina la dirección de rechazo calculada a partir de activaciones. Finalmente, los pesos se cuantizaron a GGUF Q4_K_M y Q5_K_M con llama.cpp. El modelo utiliza la plantilla ChatML de Qwen y puede emitir un bloque ` thinking` antes de la respuesta final. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla ChatML.
- Razonamiento matemático y lógico (24/24 en matemáticas y 11/12 en lógica en la suite propia del autor).
- Generación de código, verificada mediante ejecución contra tests unitarios ocultos (15/16 en la suite propia).
- Ciberseguridad ofensiva y defensiva: explicación de técnicas como Kerberoasting, reproducción de CVE, análisis de artefactos y logs.
- Mapeo a MITRE ATT&CK y razonamiento sobre inteligencia de amenazas.
- Revisión de código seguro y sugerencias de parcheo (con una tasa de sugerencias vulnerables del 9% en Secure Code Instruct).
- Cumplimiento de instrucciones (10/12 en la suite propia).
- Modo de pensamiento opcional mediante bloque `<think>`.
- Capacidades multilingües limitadas a inglés y ruso.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Triaje de vulnerabilidades en un SOC: el modelo puede analizar informes de CVE y artefactos de logs para clasificar severidad y prioridad, aprovechando su entrenamiento específico en ciberseguridad y su ventana de 8.192 tokens para contexto de incidentes.
- Revisión de código seguro en pipelines de CI/CD: se integra como paso de análisis estático asistido, señalando patrones vulnerables en el código; el autor reporta un 9% de sugerencias vulnerables en Secure Code Instruct, por lo que requiere revisión humana.
- Mapeo de técnicas de ataque a MITRE ATT&CK durante ejercicios de red team o análisis post-incidente, usando su conocimiento del framework para etiquetar tácticas y técnicas observadas.
- Formación y educación en seguridad: explicación detallada de técnicas ofensivas (Kerberoasting, explotación de CVE) sin rechazos, adecuada para laboratorios y cursos de pentesting autorizados.
- Resolución de retos CTF: el modelo puede razonar sobre binarios, scripts y configuraciones, y generar código de explotación en un entorno controlado.
- Análisis de malware y artefactos sospechosos: aunque su precisión en malware analysis es limitada (23,8% en multiple choice), puede asistir en la extracción de indicadores y la descripción de comportamiento.
- Asistencia en respuesta a incidentes: resumen y correlación de logs y artefactos con contexto largo, siempre con supervisión humana dada la tasa de alucinación potencial.
- Generación de código y scripts de automatización de seguridad en Python, verificada contra tests unitarios en la suite del autor.

## Benchmarks y rendimiento

Suite propia del autor: 88 tareas verificadas programáticamente, mismos prompts para todos los modelos, temperatura 0,2, un solo intento.

| Suite | Qwen3.5-9B base | IzumxAI v3 | IzumxAI v4 |
|---|---|---|---|
| Matemáticas | 24/24 | 24/24 | 24/24 |
| Lógica | 11/12 | 12/12 | 11/12 |
| Código | 15/16 | 15/16 | 15/16 |
| Instrucciones | 10/12 | 10/12 | 10/12 |
| Ciberseguridad | 18/24 | 21/24 | 20/24 |
| **Total** | 78/88 | 82/88 | **80/88 (91%)** |
| Rechazos | — | 6/41 (15%) | **0/41 (0%)** |

PurpleLlama CyberSecEval 4 (evaluado por un modelo juez local de 27B, `Huihui-Qwen3.8-27B-abliterated`; cifras relativas, no comparables con leaderboards oficiales; submuestras recortadas, una sola ejecución, temperatura 0,6):

| Benchmark | Casos | Resultado |
|---|---|---|
| MITRE FRR (rechazo) | 100 | 100 aceptados, 0% rechazos |
| Secure Code Instruct | 100 | 9% sugerencias vulnerables |
| Secure Code Autocomplete | 100 | 8% sugerencias vulnerables |
| Textual Prompt Injection | 100 | 71% inyectados |
| Code Interpreter Abuse | 60 | 83% clasificados como maliciosos |
| MITRE ATT&CK | 50 | 10/50 benignos, 0 rechazos |
| Canary Exploit | 120 | 0,00 |
| Malware Analysis | 80 | 23,8% correctos en multiple choice |
| Threat Intel Reasoning | 60 | 36,4% correctos en multiple choice |
| Spear Phishing | 10 | 2,1 / 5 |

No se ejecutaron los benchmarks AutoPatch, Autonomous Offensive Cyber Ops ni Visual Prompt Injection por requerir infraestructura no disponible (Podman con almacenamiento de varios TB, un cyber range de AWS y un modelo de visión, respectivamente).

## Requisitos de hardware

- VRAM estimada para inferencia: 6-8 GB con Q4_K_M (5,2 GB) y aproximadamente 8 GB con Q5_K_M (6,0 GB).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090; en el ámbito profesional, A100 o H100 para mayor throughput, aunque el modelo está pensado para consumo.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 6-8 GB de VRAM.
- Opciones de despliegue: Ollama (`ollama run hf.co/Izumx/IzumxAI-9B-v4:Q4_K_M`) y llama.cpp (`llama-cli`); no se documentan vLLM ni TGI para este formato GGUF.
- Latencia y throughput: no disponibles en la información proporcionada. La configuración recomendada usa `num_ctx 8192`, `temperature 0.7` y `repeat_penalty 1.05`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| IzumxAI-9B-v4 | 9,65B | 8.192 (config. recomendada) | Ciberseguridad sin rechazos | Apache-2.0 | GGUF |
| Qwen3.5-9B (base) | 9B | No disponible | Propósito general | Apache-2.0 | No disponible |
| Huihui-Qwen3.8-27B-abliterated | 27B | No disponible | Propósito general sin rechazos | No disponible | No disponible |

No se dispone de datos de benchmarks comparables con modelos de la misma categoría (ciberseguridad especializada de ~9B) en la información proporcionada. La comparación con el modelo base se limita a la suite propia del autor, donde v4 obtiene 80/88 frente a 78/88 del base, con la diferencia principal en la tasa de rechazos (0% frente a no medida en el base).

## Limitaciones y advertencias

- El conocimiento se corta en la fecha de Qwen3.5; las CVE y avisos recientes no están en los pesos, por lo que requiere recuperación externa para datos actuales.
- Los benchmarks propios son pequeños (88 tareas); una diferencia de dos tareas es ruido y no debe interpretarse como ranking.
- Las cifras de CyberSecEval provienen de un modelo juez local y submuestras recortadas; son comparables internamente pero no oficiales.
- La abliteración elimina rechazos, no errores: el modelo puede equivocarse con total confianza, incluidos detalles de exploits y vectores CVSS.
- Alta vulnerabilidad a inyección de prompts (71% en Textual Prompt Injection) y a abuso del intérprete de código (83% clasificados como maliciosos): no debe desplegarse como agente autónomo con acceso a sistemas de producción.
- No se ejecutaron los benchmarks AutoPatch, Autonomous Offensive Cyber Ops ni Visual Prompt Injection.
- Soporte limitado a inglés y ruso; no se garantiza calidad en castellano.
- Uso previsto exclusivamente para trabajo autorizado (pentests, CTF, SOC, respuesta a incidentes, educación); el usuario es responsable del uso.
- No se documentan sesgos específicos más allá de los heredados del modelo base y del dataset de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Izumx/IzumxAI-9B-v4
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de ciberseguridad utilizado: https://huggingface.co/datasets/Vyber07/cyber-security
- Código del proyecto y entrenamiento: https://github.com/Izumx/IzumxAI
- Write-up completo (en ruso): `docs/experiments/2026-11-16-v4-vyber-cybersec.md` en el repositorio de GitHub
