# mmRoshani/Imperum-CybersecurityLLM-v1.0

## Resumen

Imperum-CybersecurityLLM-v1.0 es un modelo de lenguaje especializado en ciberseguridad, desarrollado por IMPERUM B.V. en colaboración con Alican Kiraz, y publicado bajo licencia Apache-2.0. Se trata de un fine-tune del modelo Qwen/Qwen3.6-35B-A3B, una arquitectura Mixture-of-Experts (MoE) con 35 mil millones de parámetros totales pero solo unos 3 mil millones activos por token, lo que permite obtener la profundidad de un modelo grande con un coste de inferencia reducido. El modelo está diseñado para tareas de operaciones de seguridad (SOC), respuesta a incidentes (DFIR), ingeniería de detección, inteligencia de amenazas y análisis de malware, y se distribuye exclusivamente en formato GGUF para su ejecución local dentro del perímetro de la organización.

La relevancia de este modelo radica en su enfoque de dominio: cubre todo el flujo de trabajo de un centro de operaciones de seguridad, desde el triaje de alertas hasta la revisión de código seguro, pasando por el mapeo de tácticas y técnicas MITRE ATT&CK. Al estar liberado en formato GGUF, puede ejecutarse en una sola máquina con recursos moderados, lo que lo hace atractivo para equipos de seguridad que necesitan asistencia de IA sin depender de servicios en la nube. El modelo se distribuye en dos cuantizaciones: Q4_K_M (20 GB) y Q8_0 (34 GB), con un rendimiento declarado de aproximadamente 50 tokens por segundo en una NVIDIA DGX Spark con la versión Q4_K_M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en Qwen3.6-35B-A3B |
| Parametros totales | 34.660.610.688 (~35B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 262.144 (segun fuentes externas; no confirmado en la model card) |
| Tipos de cuantizacion | Q4_K_M (20 GB), Q8_0 (34 GB) |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen3.6-35B-A3B, un transformer con arquitectura MoE que activa aproximadamente 3.000 millones de parámetros por token, manteniendo un total de 35.000 millones. Esta configuración permite un equilibrio entre capacidad y eficiencia computacional, ya que solo una fracción de los parámetros se utiliza en cada paso de inferencia. El fine-tune se realizó sobre datos de ciberseguridad, aunque la model card no especifica el volumen, la composición del dataset ni el método de entrenamiento (por ejemplo, si se usó RLHF, DPO o supervisión directa). Tampoco se detallan innovaciones técnicas adicionales más allá de la arquitectura base.

El modelo se distribuye únicamente en formato GGUF, lo que implica que los pesos están cuantizados y optimizados para su ejecución con llama.cpp, Ollama o LM Studio. La model card indica que el chat template incluye un bloque de razonamiento (`thinking`) activado por defecto, que puede desactivarse con el parámetro `--reasoning off` o ajustando `enable_thinking` a `false`.

## Capacidades

- Triaje de alertas e investigacion: reconstruye la narrativa de intrusion a partir de secuencias de eventos de Windows (por ejemplo, 4624, 4672, 7045, 4688) y proporciona un nivel de confianza y el siguiente origen de registros a consultar.
- Ingenieria de deteccion: redacta reglas Sigma y YARA con la fuente de registro correcta, el ID de evento de Sysmon y las etiquetas ATT&CK correspondientes, ademas de explicar por que se activa una deteccion y donde apareceran falsos positivos.
- Inteligencia de amenazas y mapeo ATT&CK: asigna automaticamente tácticas y tecnicas de MITRE ATT&CK a cadenas de intrusion, verificadas en ejemplos como T1547.001, T1053.005, T1204.002 y T1059.001.
- Respuesta a incidentes: genera listas de verificacion para la primera hora, priorizando el aislamiento del host sin apagarlo, la captura de memoria volatil antes del disco y la preservacion de registros antes del analisis.
- Analisis de malware: explica mecanismos de persistencia (claves de registro, servicios, tareas programadas, Winlogon, IFEO) y su caza con herramientas como Autoruns, Procmon, Regshot y RegRipper.
- Seguridad en la nube, contenedores e identidad: razona sobre rutas de ataque modernas, por ejemplo desde un pod con `hostPID: true` y socket de Docker montado hasta el compromiso completo del cluster, y sugiere politicas de admision para bloquearlas.
- Revision de codigo seguro: identifica vulnerabilidades en codigo fuente, explica la ruta de explotacion y devuelve una version corregida (por ejemplo, `pickle.loads()` inseguro como ejecucion remota de codigo).
- Gestion de vulnerabilidades y GRC: priorizacion de vulnerabilidades, guias de remediacion, mapeo de controles y documentacion de operaciones de seguridad.

## Casos de uso

- Triaje de alertas en un SOC: el modelo puede convertir una alerta bruta (por ejemplo, una secuencia de eventos de Windows) en una evaluacion lista para el analista, indicando que ocurrio, con que confianza y que comprobar antes de declarar un falso positivo. Su capacidad de razonamiento permite reconstruir la cadena de ataque y sugerir el siguiente registro a consultar.
- Redaccion de reglas de deteccion: un ingeniero de deteccion puede pedir al modelo un borrador de regla Sigma o YARA para un comportamiento especifico. El modelo devuelve una estructura con la fuente de registro, el ID de evento y las etiquetas ATT&CK, que el ingeniero debe revisar y endurecer antes de desplegar.
- Mapeo de cadenas de intrusion a MITRE ATT&CK: dado un relato de una intrusion (por ejemplo, phishing ISO → LNK → rundll32 → tarea programada → volcado de LSASS → movimiento lateral SMB), el modelo devuelve la secuencia de tácticas y tecnicas, lo que acelera la elaboracion de informes de inteligencia.
- Respuesta a incidentes de ransomware: el modelo puede generar una lista de verificacion para la primera hora, priorizando el aislamiento del host sin apagarlo, la captura de memoria volatil y la preservacion de registros, y estableciendo la causa raiz antes de la limpieza.
- Revision de codigo en revisiones de seguridad: un desarrollador puede enviar un fragmento de codigo y el modelo identifica vulnerabilidades, explica la ruta de explotacion y propone una correccion, por ejemplo reemplazando `pickle.loads()` inseguro por una alternativa segura.
- Analisis de configuracion de Kubernetes: un equipo de plataforma puede describir un pod con privilegios elevados y el modelo explica la ruta de compromiso (RCE en contenedor → nodo → kubelet → cluster) y sugiere la politica de admision que lo bloquea.
- Documentacion de GRC: el modelo puede redactar informes de priorizacion de vulnerabilidades, guias de remediacion y mapeo de controles, reduciendo el tiempo que los analistas dedican a tareas de documentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos de ciberseguridad. El unico dato de rendimiento declarado es una velocidad de inferencia de aproximadamente 50 tokens por segundo en una NVIDIA DGX Spark con la cuantizacion Q4_K_M, pero no se especifican las condiciones exactas (longitud de contexto, batch, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: con la cuantizacion Q4_K_M se necesitan aproximadamente 22 GB de RAM/VRAM; con Q8_0, unos 36 GB.
- GPU recomendadas: el autor menciona una NVIDIA DGX Spark como plataforma de referencia, pero no se indican GPUs especificas. Con Q4_K_M, una GPU de consumo con 24 GB de VRAM (por ejemplo, RTX 4090) podria ejecutar el modelo, aunque no esta confirmado por el autor.
- Opciones de despliegue: llama.cpp (servidor compatible con OpenAI), Ollama (mediante un Modelfile) y LM Studio. El modelo se distribuye en formato GGUF, por lo que es compatible con cualquier herramienta que soporte este formato.
- Latencia y throughput: el autor declara ~50 tokens/s en DGX Spark con Q4_K_M, pero no se proporcionan datos de latencia por token ni de throughput en otros hardware.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos especializados en ciberseguridad. Como referencia, el modelo base Qwen3.6-35B-A3B es un MoE generico de 35B con 3B activos, y existen otros modelos de ciberseguridad como CyberSecLM o SecLM, pero no se han encontrado datos comparativos en la informacion proporcionada. La principal diferencia de Imperum-CybersecurityLLM-v1.0 es su enfoque de dominio completo (SOC, DFIR, deteccion, threat intel) y su distribucion exclusiva en GGUF para despliegue local.

## Limitaciones y advertencias

- Es un modelo de razonamiento: el chat template abre un bloque `thinking` por defecto. Si se limita `max_tokens` a un valor pequeno, el presupuesto se consume en el razonamiento y el campo `content` puede quedar vacio, lo que parece un despliegue roto. Se recomienda desactivar el razonamiento con `--reasoning off` o permitir al menos 500 tokens.
- Temperatura recomendada: el autor recomienda usar temperatura ~0.3 para trabajo de seguridad, ya que con el valor por defecto de 1.0 el modelo inventa numeros CVE y sintaxis de reglas plausibles pero incorrectos.
- Autoidentificacion: el modelo se identifica como "Qwen" en lugar de "Imperum", un detalle cosmetico que no afecta al funcionamiento.
- No es un decisor autonomo: el modelo esta pensado para acelerar el trabajo de analistas humanos, no para tomar decisiones de seguridad de forma autonoma. Todo el contenido generado (reglas, informes, analisis) debe ser revisado por un experto.
- Idioma: solo soporta ingles, lo que limita su uso en entornos que requieran castellano u otros idiomas.
- Sin datos de entrenamiento publicados: no se especifica el volumen ni la composicion del dataset de fine-tune, ni el metodo de alineacion, lo que dificulta evaluar posibles sesgos o limitaciones de cobertura.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mmRoshani/Imperum-CybersecurityLLM-v1.0
- Repositorio GGUF de IMPERUM: https://huggingface.co/IMPERUM/Imperum-CybersecurityLLM-v1.0-GGUF
- Sitio web de IMPERUM: https://www.IMPERUM.io
- Perfil de Alican Kiraz: https://huggingface.co/AlicanKiraz0
