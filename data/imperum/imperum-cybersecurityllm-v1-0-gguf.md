# IMPERUM/Imperum-CybersecurityLLM-v1.0-GGUF

## Resumen

Imperum-CybersecurityLLM-v1.0 es un modelo de lenguaje especializado en ciberseguridad, desarrollado por IMPERUM B.V. en colaboración con Alican Kiraz, y liberado bajo licencia Apache 2.0. Se trata de un fine-tuning del modelo Qwen/Qwen3.6-35B-A3B, una arquitectura Mixture-of-Experts (MoE) con 35 000 millones de parámetros totales y aproximadamente 3 000 millones de parámetros activos por token. El modelo se distribuye exclusivamente en formato GGUF para su ejecución local mediante llama.cpp, Ollama o LM Studio, lo que permite a equipos SOC y DFIR desplegar un asistente de dominio sin enviar alertas ni logs a servicios externos.

La relevancia de este modelo radica en que combina la profundidad de conocimiento de un modelo grande con el coste de inferencia de uno pequeño, gracias a su arquitectura MoE. Según la documentación, alcanza aproximadamente 50 tokens por segundo en una NVIDIA DGX Spark con el archivo Q4_K_M de 20 GB, y puede ejecutarse en portátiles con 8 GB de contexto mediante Ollama. Está orientado a tareas de blue team: triaje de alertas, detección (Sigma, YARA), mapeo MITRE ATT&CK, respuesta a incidentes, análisis de malware, revisión de código seguro y gestión de vulnerabilidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en Qwen3.6-35B-A3B |
| Parametros totales | 34 660 610 688 |
| Parametros activos | ~3 000 000 000 (3B) |
| Longitud de contexto | No especificada; en los ejemplos de uso se configura 16 384 tokens (llama.cpp) u 8 192 (Ollama) |
| Tipos de cuantizacion | Q4_K_M (20 GB), Q8_0 (34 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint Qwen/Qwen3.6-35B-A3B, que emplea una arquitectura transformer con mezcla de expertos (MoE). De los 35 000 millones de parámetros totales, solo unos 3 000 millones se activan por token, lo que reduce drásticamente el coste computacional en inferencia. La model card no proporciona detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni el método de ajuste (no se menciona RLHF, DPO ni otras técnicas). Se indica únicamente que es un fine-tuning orientado a tareas de ciberseguridad.

Una característica destacada es que el modelo incorpora un modo de razonamiento: la plantilla de chat abre un bloque `thinking` por defecto. Esto implica que si se limita el número máximo de tokens generados, el presupuesto se consume en el razonamiento y el campo `content` puede devolverse vacío. Para desactivarlo, se recomienda pasar `--reasoning off` en llama.cpp o `"chat_template_kwargs": {"enable_thinking": false}` en las peticiones.

## Capacidades

- Triaje de alertas y reconstrucción de narrativas de intrusión a partir de secuencias de eventos de Windows (por ejemplo, 4624 logon anómalo → 4672 SeDebugPrivilege → 7045 instalación de servicio → 4688 cmd.exe), con nivel de confianza y siguiente fuente de logs a consultar.
- Generación de reglas Sigma y YARA con la fuente de logs correcta, el ID de evento Sysmon adecuado y etiquetas ATT&CK, así como explicación de por qué una detección dispara y dónde aparecerán falsos positivos.
- Mapeo de cadenas de intrusión a tácticas y técnicas MITRE ATT&CK de forma no solicitada, verificado en T1547.001, T1053.005, T1204.002 y T1059.001.
- Checklists de respuesta a incidentes de primera hora con la secuenciación correcta: aislar sin apagar, capturar memoria volátil antes que disco, preservar logs antes del análisis y establecer causa raíz antes de limpiar.
- Análisis de malware: explicación de mecanismos de persistencia (autostart extensibility points, run keys, servicios, tareas programadas, Winlogon, IFEO) y herramientas asociadas (Autoruns, Procmon, Regshot, RegRipper).
- Razonamiento sobre rutas de ataque en entornos cloud y contenedores: desde un pod con `hostPID: true` y socket docker montado hasta compromiso completo del clúster, con la política de admisión que lo bloquearía.
- Revisión de código seguro: identificación de vulnerabilidades, explicación de la ruta de explotación y devolución de una versión corregida (por ejemplo, `pickle.loads()` inseguro como RCE).
- Priorización de vulnerabilidades, guías de remediación, mapeo de controles y documentación de operaciones de seguridad (GRC).

## Casos de uso

- Triaje automatizado de alertas en un SOC: el modelo puede recibir una alerta cruda o una secuencia de eventos y devolver una evaluación preliminar con nivel de confianza, hipótesis principal y siguiente fuente de datos a consultar. Es adecuado porque reduce el tiempo de análisis inicial y estandariza el criterio, aunque siempre requiere revisión humana.
- Generación de reglas de detección en pipelines de detection engineering: un analista puede pedir al modelo un borrador de regla Sigma o YARA para una técnica concreta, con el log source y el ID de evento correctos, y luego endurecerla. El modelo explica además los falsos positivos esperados, lo que facilita la validación.
- Mapeo de cadenas de ataque a MITRE ATT&CK: a partir de una narrativa de intrusión (phishing ISO → LNK → rundll32 → tarea programada → dump de LSASS → movimiento lateral SMB → exfiltración), el modelo devuelve la secuencia de técnicas y tácticas, útil para informes y para identificar huecos de cobertura.
- Respuesta a incidentes con checklists contextuales: en un escenario de ransomware o BEC, el modelo genera el checklist de primera hora con el orden correcto de acciones, ayudando a analistas junior a no omitir pasos críticos.
- Análisis de malware y persistencia: un investigador puede preguntar por mecanismos de persistencia específicos y obtener una explicación de cómo cazarlos, con las herramientas adecuadas y las precauciones de sandboxing.
- Revisión de código seguro en entornos de desarrollo: el modelo identifica vulnerabilidades en fragmentos de código, explica la ruta de explotación y propone una corrección, lo que acelera las revisiones manuales sin sustituirlas.
- Gestión de vulnerabilidades y GRC: ayuda a priorizar hallazgos, redactar planes de remediación y mapear controles a marcos normativos, reduciendo la carga administrativa de los analistas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval, GSM8K ni evaluaciones específicas de ciberseguridad. El único dato de rendimiento mencionado es la velocidad de inferencia: aproximadamente 50 tokens por segundo en una NVIDIA DGX Spark con la cuantización Q4_K_M.

## Requisitos de hardware

- Cuantización Q4_K_M (20 GB): requiere aproximadamente 22 GB de RAM/VRAM combinados. Es la opción recomendada por el autor por su velocidad.
- Cuantización Q8_0 (34 GB): requiere aproximadamente 36 GB de RAM/VRAM. Calidad casi sin pérdidas.
- En una NVIDIA DGX Spark (con su memoria unificada) se alcanzan ~50 tokens/segundo con Q4_K_M.
- Puede ejecutarse en portátiles mediante Ollama con `num_ctx 8192` como valor seguro, ya que la caché KV consume memoria adicional sobre los pesos.
- Opciones de despliegue: llama.cpp (servidor compatible con OpenAI), Ollama (con Modelfile incluido) y LM Studio.
- No se especifican GPUs concretas (RTX 4090, A100, etc.) en la documentación, pero por el tamaño de los archivos, una GPU con 24 GB de VRAM (por ejemplo, RTX 4090) podría cargar Q4_K_M, y una con 48 GB (A6000, L40S) podría cargar Q8_0. Estos son valores estimados a partir del peso de los archivos, no confirmados por el autor.

## Comparativa con modelos similares

No se dispone de comparativas con otros modelos especializados en ciberseguridad en la informacion proporcionada. El modelo base Qwen3.6-35B-A3B es la referencia arquitectónica, pero no se ofrecen datos comparativos de rendimiento entre ambos. Tampoco se mencionan alternativas como CyberSecLM, SecLM u otros modelos de dominio. Por tanto, esta sección queda sin datos disponibles.

## Limitaciones y advertencias

- Es un modelo de razonamiento: si se limita `max_tokens` a un valor pequeño, el presupuesto se consume en el bloque `thinking` y el campo `content` puede devolverse vacío, lo que puede interpretarse como un fallo de despliegue. Se recomienda `--reasoning off` o permitir al menos 500 tokens.
- A temperatura 1.0 (el valor por defecto), el modelo inventa números de CVE y sintaxis de reglas plausibles pero incorrectas. Para trabajo de seguridad se recomienda temperatura ~0.3, fijada en el servidor o por petición.
- El modelo se autoidentifica como "Qwen" en lugar de "Imperum", un comportamiento cosmético que no afecta a la funcionalidad pero puede confundir en integraciones.
- No es un decisor autónomo: está diseñado para acelerar a analistas humanos, no para tomar decisiones de seguridad sin supervisión. Toda detección generada debe revisarse con el mismo rigor que una creada por un humano.
- La documentación no especifica el dataset de entrenamiento ni el método de ajuste, por lo que no es posible evaluar posibles sesgos o cobertura de temas concretos.
- El idioma soportado es únicamente inglés; no hay soporte multilingüe declarado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y el autor recomienda validación exhaustiva antes de su uso en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/IMPERUM/Imperum-CybersecurityLLM-v1.0-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Anuncio en LinkedIn: https://www.linkedin.com/posts/imperumio_imperum-cybersecurity-llm-v10-activity-7497563968807555072-tBi4
- Ficha en AI Market Cap: https://aimarketcap.tech/models/imperum-imperum-cybersecurityllm-v1-0-gguf
- Registro en Free2AI Tools: https://free2aitools.com/model/imperum/imperum-cybersecurityllm-v1.0-gguf
