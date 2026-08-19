# RavichandranJ/Dolphin3-Cyber-8B-GGUF

## Resumen

Dolphin3-Cyber-8B-GGUF es un modelo de lenguaje especializado en ciberseguridad, desarrollado por RavichandranJ mediante fine-tuning con adaptadores LoRA (rango 16) sobre el modelo base huihui-ai/Dolphin3.0-Llama3.1-8B-abliterated. Este base es una versión "abliterated" de Llama 3.1 8B, es decir, se le han eliminado las capas de rechazo para permitir respuestas sin censura sobre temas sensibles, incluyendo técnicas ofensivas de seguridad. El fine-tuning se realizó con Unsloth (2x más rápido) sobre un dataset propio de ciberseguridad que cubre OWASP Top 10, MITRE ATT&CK, CVEs, metodologías de pentesting y frameworks de defensa.

El modelo se distribuye exclusivamente en formato GGUF con 11 opciones de cuantización, desde Q2_K (3,18 GB) hasta F16 (16,1 GB), lo que permite ejecutarlo en hardware de consumo con tan solo 4 GB de VRAM. Su propósito principal es servir como asistente local de ciberseguridad para profesionales que necesitan confidencialidad y no dependencia de servicios en la nube. La licencia es Llama 3.1, que permite uso comercial con restricciones para grandes empresas. Está orientado únicamente al idioma inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1 8B) |
| Parametros totales | 8 000 millones (8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada en la model card; el base Llama 3.1 soporta hasta 128K, pero la configuracion recomendada en las instrucciones es 2048 |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_0, Q4_K_S, Q4_K_M, Q5_0, Q5_K_S, Q5_K_M, Q6_K, Q8_0, F16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Llama 3.1 |
| Formato de pesos | GGUF (compatible con llama.cpp y su ecosistema) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer densa de Llama 3.1 con 8 000 millones de parametros. El proceso de entrenamiento consistio en un fine-tuning con adaptadores LoRA de rango 16 sobre el modelo Dolphin3.0-Llama3.1-8B-abliterated, que a su vez es una version de Llama 3.1 8B a la que se le aplico la tecnica de "abliteration" para eliminar los mecanismos de rechazo y censura. El entrenamiento se realizo con la libreria Unsloth, que acelera el proceso aproximadamente 2x, y se utilizo un dataset propio de ciberseguridad (custom-cybersecurity-dataset) que incluye contenido sobre OWASP Top 10, MITRE ATT&CK, CVEs, bases de datos de exploits, metodologias de pentesting y frameworks defensivos. No se menciona el uso de RLHF ni DPO; el ajuste es puramente supervisado sobre el dataset especializado.

## Capacidades

- Generacion de texto especializado en ciberseguridad: analisis de vulnerabilidades, redaccion de informes tecnicos, explicacion de vectores de ataque y defensa.
- Generacion de codigo de exploits: el modelo es capaz de producir codigo de exploit funcional (en lenguajes como Python, Bash, C, etc.) sin rechazos gracias a su naturaleza abliterated.
- Analisis de malware: puede desglosar el comportamiento de muestras de malware, identificar indicadores de compromiso y sugerir contramedidas.
- Soporte conversacional multi-turno: utiliza la plantilla de chat de Llama 3.1 (Dolphin3 chat format) para mantener dialogos fluidos sobre temas de seguridad.
- Conocimiento de frameworks de seguridad: maneja MITRE ATT&CK, OWASP, NIST, etc., para clasificar tecnicas y recomendaciones.
- Sin censura en temas de seguridad: a diferencia de modelos genericos, no rechaza preguntas sobre hacking etico, pentesting o exploit development.
- No se menciona soporte para tool calling, function calling, agentes, vision ni audio. El modelo es exclusivamente de texto.

## Casos de uso

- Pentesting y pruebas de penetracion: el modelo puede guiar a un profesional en la planificacion de un test de intrusion, sugiriendo herramientas, comandos y tecnicas segun la fase (reconocimiento, explotacion, post-explotacion). Su naturaleza abliterated permite discutir sin restricciones todos los pasos.
- Analisis de vulnerabilidades y CVE: dado un CVE o una descripcion de una vulnerabilidad, el modelo puede explicar el impacto, proponer parches o mitigaciones y generar un PoC (proof of concept) para verificar la exposicion.
- Respuesta a incidentes: en un escenario de breach, el modelo puede ayudar a triage de alertas, correlacion de indicadores y redaccion de informes de incidentes, manteniendo la confidencialidad al operar 100% local.
- Educacion y formacion en seguridad: los instructores pueden usarlo para crear ejercicios de CTF, generar escenarios de ataque y defensa, y evaluar las respuestas de los alumnos sin depender de servicios externos.
- Bug bounty y divulgacion responsable: los cazadores de bugs pueden emplearlo para analizar el alcance de una vulnerabilidad, redactar informes claros y estructurados para los programas de recompensas, y sugerir tecnicas de explotacion etica.
- Automatizacion de tareas de blue team: el modelo puede generar reglas de deteccion (por ejemplo, Sigma o YARA), revisar configuraciones de seguridad y proponer mejoras en la postura defensiva de una organizacion, todo con ejecucion local para proteger informacion sensible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index de la model card declara una lista de resultados vacia (results: []), por lo que no hay datos objetivos de rendimiento en tareas estandar como MMLU, HumanEval o GSM8K. Tampoco se proporcionan comparativas numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: segun la cuantizacion elegida, se requiere entre ~5,5 GB (Q2_K) y ~18,5 GB (F16). La tabla de la model card indica RAM total (modelo + KV cache para 2048 tokens) que va desde ~5,5 GB hasta ~18,5 GB.
- GPU recomendadas: el modelo esta disenado para hardware de consumo. Se menciona compatibilidad con GTX 1650 (4 GB VRAM) en cuantizaciones bajas. Para cuantizaciones medias (Q4_K_M) se recomienda al menos 8 GB de VRAM (RTX 3060/4060). Para F16 se necesita una GPU con 16 GB o mas (RTX 4080/4090, A100, etc.).
- Ejecucion en consumer GPU: si, con cuantizaciones Q2_K a Q5_K_M se puede ejecutar en GPUs de 4-8 GB. Las cuantizaciones Q6_K y superiores requieren GPUs de 10 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Python (llama-cpp-python), Open WebUI, Jan.ai. Todas ellas compatibles con GGUF.
- Latencia y throughput: no se proporcionan datos especificos. Como referencia, un modelo de 8B en Q4_K_M en una RTX 3060 suele generar entre 20-40 tokens/segundo, pero no es un dato oficial del autor.

## Comparativa con modelos similares

No se dispone de informacion comparativa directa con otros modelos especializados en ciberseguridad. El modelo se basa en Dolphin3.0-Llama3.1-8B-abliterated, que es una variante sin censura de Llama 3.1 8B Instruct. Frente a modelos genericos de 8B (como Llama 3.1 8B Instruct o Mistral 7B), Dolphin3-Cyber-8B ofrece una especializacion en seguridad y ausencia de rechazos, pero carece de benchmarks que permitan cuantificar la diferencia en tareas generales. Tampoco hay comparacion publica con otros modelos de seguridad como WhiteRabbitNeo o CyberSafe, por lo que esta seccion queda sin datos concretos.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo sin censura y entrenado sobre un dataset especifico, puede generar contenido tecnico inexacto o inventar exploits, CVEs o tecnicas que no funcionan. Es imprescindible validar cualquier salida antes de usarla en entornos reales.
- Riesgo de mal uso: la naturaleza abliterated permite generar codigo malicioso o instrucciones para ataques. El autor incluye un aviso etico en la model card, pero no hay control tecnico sobre el uso. El usuario es responsable de cumplir la legislacion aplicable.
- Limitaciones de idioma: el modelo solo esta entrenado en ingles. Las consultas en otros idiomas pueden producir respuestas degradadas o incoherentes.
- Longitud de contexto: aunque el base Llama 3.1 soporta 128K, el fine-tuning parece haber sido realizado con un contexto de 2048 tokens (segun las instrucciones de configuracion). Usar contextos mayores puede degradar la coherencia o no estar soportado.
- Restricciones de licencia: la licencia Llama 3.1 de Meta permite uso comercial, pero establece condiciones para empresas con mas de 700 millones de usuarios mensuales. Ademas, el modelo base abliterated puede tener implicaciones legales en algunas jurisdicciones por su capacidad de generar contenido ofensivo.
- Sin soporte para tool calling ni agentes: el modelo no esta preparado para integrarse en pipelines que requieran llamadas a funciones externas o razonamiento multi-paso con herramientas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/RavichandranJ/Dolphin3-Cyber-8B-GGUF
- Adaptadores LoRA: https://huggingface.co/RavichandranJ/Dolphin3-Cyber-8B-LoRA
- Modelo base: https://huggingface.co/huihui-ai/Dolphin3.0-Llama3.1-8B-abliterated
- Unsloth (libreria de entrenamiento): https://github.com/unslothai/unsloth
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/dolphin3-cyber-8b-gguf-ravichandranj
- Ficha en toolify.ai: https://www.toolify.ai/ai-model/ravichandranj-dolphin3-cyber-8b-gguf
- Ficha en aimarketcap.tech: https://aimarketcap.tech/models/ravichandranj-dolphin3-cyber-8b-gguf
