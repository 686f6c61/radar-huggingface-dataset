# nyxspecter4/kinetigor-dpo-cybersec

## Resumen

KINetigor DPO Cybersec es un modelo de lenguaje especializado en ciberseguridad, desarrollado por nyxspecter4 (Kiran Wolfe) a partir del modelo base Qwen2.5-3B-Instruct. Su objetivo es proporcionar respuestas directas, concretas y accionables para profesionales de seguridad ofensiva y defensiva, evitando el lenguaje genérico y las evasivas típicas de los asistentes generalistas. El modelo se ha afinado mediante Direct Preference Optimization (DPO) sobre un corpus propio de pares de respuestas elegidas y rechazadas, lo que le permite priorizar análisis técnicos con herramientas reales, identificadores CVE y reglas de detección específicas.

La relevancia de este modelo radica en su enfoque vertical: en lugar de un asistente de propósito general, ofrece un compañero de trabajo para tareas como análisis de vulnerabilidades, redacción de reglas Sigma y YARA, mapeo MITRE ATT&CK, respuesta a incidentes y revisión de código seguro. Con 3 mil millones de parámetros, es lo suficientemente ligero para ejecutarse en hardware de consumo, y se distribuye tanto en formato safetensors (pesos fusionados) como en GGUF cuantizado para Ollama y llama.cpp. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en Qwen2.5-3B-Instruct) |
| Parametros totales | 3 mil millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | bfloat16, float32, GGUF Q4_K_M (otros no especificados) |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer decoder con atención causal estándar. Sobre esta base se aplicó un ajuste fino con Direct Preference Optimization (DPO), un método de alineación que entrena al modelo para preferir respuestas "elegidas" frente a "rechazadas" en pares de ejemplos. El entrenamiento utilizó LoRA con rango 64 y alpha 128, afectando a las proyecciones q, k, v, o, gate, up y down. Los pesos finales se fusionaron con el modelo base, de modo que no se requiere cargar adaptadores adicionales.

El conjunto de datos de entrenamiento, denominado CybersecDPO Corpus, contiene más de 1.471 pares DPO. Cada par incluye una respuesta "elegida" con análisis técnico específico (herramientas concretas, CVEs, reglas Sigma/YARA, comandos de remediación) y una respuesta "rechazada" vaga o genérica. Las categorías cubiertas abarcan análisis de más de 50 CVEs reales, técnicas MITRE ATT&CK, OWASP Top 10, seguridad en la nube (S3, IAM, EKS, GCP, Docker), respuesta a incidentes, razonamiento de cadenas de explotación y revisión de código seguro. No se menciona el uso de RLHF ni otras etapas de entrenamiento adicionales.

## Capacidades

- Analisis de vulnerabilidades y desglose de CVEs: dado un identificador CVE o un texto de advisory, el modelo devuelve la causa raiz, la ruta de explotacion, los componentes afectados y la logica de deteccion. Verificado en CVE-2024-21413, CVE-2024-6387 y CVE-2023-46805.
- Ingenieria de deteccion: redacta reglas Sigma y YARA con la fuente de log correcta, el ID de evento Sysmon y las etiquetas ATT&CK, explicando por que se dispara la deteccion y donde apareceran falsos positivos.
- Inteligencia de amenazas y mapeo MITRE ATT&CK: mapea narrativas de intrusion a tacticas y tecnicas especificas sin que se le pida explicitamente, por ejemplo una cadena de kill chain completa.
- Respuesta a incidentes: genera listas de verificacion para la primera hora con la secuenciacion correcta (aislar sin apagar, capturar memoria volatil antes que disco, preservar logs, establecer causa raiz antes de limpiar).
- Analisis de malware: explica mecanismos de persistencia (claves de registro, servicios, tareas programadas, Winlogon, debuggers IFEO) y como cazarlos con herramientas como Autoruns, Procmon, Regshot y Volatility.
- Seguridad en la nube, contenedores e identidad: razona sobre rutas de ataque en Kubernetes (pod con hostPID + privilegiado + socket docker montado hasta compromiso del cluster) y nombra la politica de admision que lo bloquea.
- Revision de codigo seguro: identifica vulnerabilidades en codigo fuente, explica la ruta de explotacion y devuelve una version corregida. Por ejemplo, detecta `pickle.loads()` inseguro como RCE y lo reescribe de forma segura.
- Reportes de bug bounty: estructura hallazgos en informes listos para presentar, con clase de vulnerabilidad, impacto, pasos de reproduccion, remediacion y referencias.

## Casos de uso

- Analisis de CVEs en equipos SOC: un analista recibe un aviso de una nueva vulnerabilidad y usa el modelo para obtener un desglose inmediato de la causa raiz, el vector de explotacion y las firmas de deteccion, acelerando la priorizacion de parches.
- Redaccion de reglas de deteccion personalizadas: el equipo de deteccion pide al modelo una regla Sigma para una tecnica especifica de ATT&CK; el modelo devuelve la regla con el log source correcto, el ID de evento y las etiquetas, reduciendo el tiempo de creacion de minutos a segundos.
- Simulacion de adversario en ejercicios de red team: el modelo genera rutas de ataque realistas (por ejemplo, phishing con ISO a LNK a rundll32 a tarea programada) y sugiere las herramientas y comandos concretos, util para planificar campañas de prueba.
- Respuesta a incidentes de primera hora: durante un incidente activo, el equipo sigue la lista de verificacion generada por el modelo para asegurar que la recoleccion de evidencias se hace en el orden correcto y sin contaminar la escena.
- Revision de codigo en pipelines de desarrollo: los desarrolladores integran el modelo en su flujo de CI para que revise pull requests en busca de vulnerabilidades comunes (inyeccion, deserializacion insegura, permisos excesivos) y proponga correcciones.
- Formacion y concienciacion en seguridad: instructores usan el modelo para generar escenarios de ataque y defensa con ejemplos reales de incidentes (MGM, Colonial Pipeline, NotPetya, SolarWinds) con impacto economico y causa raiz, para entrenar a nuevos analistas.
- Generacion de informes de bug bounty: un cazador de recompensas estructura sus hallazgos con el modelo, que produce un informe profesional con clase de vulnerabilidad, impacto, pasos de reproduccion y referencias, aumentando la probabilidad de aceptacion.

## Benchmarks y rendimiento

El autor declara un unico resultado en la model card, correspondiente a un conjunto de evaluacion interno. No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K.

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Analisis de vulnerabilidades en ciberseguridad | CybersecDPO Corpus (conjunto de evaluacion interno) | DPO Preference Accuracy | 0.89 |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 3B parametros; en cuantizacion GGUF Q4_K_M ocupa aproximadamente 2 GB, por lo que puede ejecutarse en GPUs con 4 GB o menos. En precision bfloat16, la VRAM necesaria ronda los 6-7 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060) para la version GGUF. Para bfloat16, se recomienda una GPU con 8 GB o mas (RTX 3070, RTX 4080, A10, etc.).
- Compatibilidad con hardware de consumo: si, el modelo esta disenado para ejecutarse en portatiles y equipos de escritorio convencionales gracias a su tamano reducido y a la cuantizacion GGUF.
- Opciones de despliegue: transformers (Python), Ollama (creando un Modelfile a partir del GGUF), llama.cpp, LM Studio (con temperatura recomendada de 0.3) y cualquier servidor compatible con el formato GGUF. Tambien es compatible con endpoints de Hugging Face.
- Latencia y throughput: no se proporcionan datos oficiales. En una GPU consumer moderna, se espera una generacion de 20-40 tokens por segundo con el GGUF Q4_K_M, aunque esto depende del hardware y del backend utilizado.

## Comparativa con modelos similares

No se dispone de informacion sobre otros modelos de ciberseguridad comparables en el mismo rango de tamano. La unica comparacion directa posible es con el modelo base Qwen2.5-3B-Instruct, del cual deriva.

| Modelo | Parametros | Contexto | Metodo de ajuste | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KINetigor DPO Cybersec | 3B | no disponible | DPO + LoRA | Apache 2.0 | Hugging Face, GGUF |
| Qwen2.5-3B-Instruct | 3B | no disponible | SFT + RLHF (base) | Apache 2.0 | Hugging Face |

La diferencia principal es el enfoque: KINetigor esta especializado en ciberseguridad y ha sido afinado con DPO para respuestas tecnicas y directas, mientras que el base es un asistente generalista. No se dispone de datos de rendimiento comparativo en tareas de seguridad.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo ha sido entrenado con un corpus de ciberseguridad que puede reflejar sesgos del dominio, como una sobre-representacion de tecnicas ofensivas frente a defensivas, o un enfoque centrado en entornos Windows y herramientas comerciales especificas.
- Riesgo de alucinacion: al ser un modelo de 3B, puede generar CVEs, herramientas o tecnicas inexistentes o desactualizadas. El autor recomienda verificar cualquier dato critico antes de usarlo en entornos de produccion.
- Limitaciones de contexto e idioma: solo soporta ingles; no se ha entrenado para otros idiomas. La longitud de contexto no se ha especificado, pero se hereda del modelo base, que en su version original soporta 32k tokens; sin embargo, no se ha confirmado en la documentacion.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial sin restricciones, pero el modelo puede generar contenido sensible relacionado con exploits y malware; el usuario es responsable de cumplir con las leyes locales.
- Caveats para produccion: el conjunto de entrenamiento es relativamente pequeno (1.471 pares) y no se han publicado evaluaciones en benchmarks estandar. La precision en tareas de seguridad fuera del corpus de entrenamiento no esta garantizada. Se recomienda probar el modelo en un entorno controlado antes de integrarlo en flujos criticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nyxspecter4/kinetigor-dpo-cybersec
- Dataset de entrenamiento: https://huggingface.co/datasets/nyxspecter4/cybersec-dpo-corpus
- Space de demostracion interactiva: https://huggingface.co/spaces/nyxspecter4/ki (enlace incompleto en la model card)
- Perfil del autor: https://huggingface.co/nyxspecter4
- Sitio web de Kinetigor: https://kinetigor.com/kinetigor.html
- Repositorio de CySecBench (dataset de referencia en ciberseguridad): https://github.com/cysecbench/dataset
