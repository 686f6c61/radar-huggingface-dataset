# gacekmg/Local_Security_Model

## Resumen

PenMaster Security es un agente autónomo de pruebas de penetración desarrollado por el usuario gacekmg, publicado en Hugging Face bajo el identificador `gacekmg/Local_Security_Model`. El proyecto combina un modelo de lenguaje local (Qwen 2.5 Instruct) con un servidor Flask que implementa el protocolo MCP (Model Context Protocol) y un arsenal de 18 herramientas de Kali Linux, permitiendo ejecutar reconocimiento, explotación y generación de informes de forma totalmente local, sin depender de servicios en la nube ni claves API.

El repositorio en Hugging Face no contiene pesos de modelo (tamaño 0.0 GB), sino el código del agente y la configuración del sistema. La model card indica que el modelo base es `Qwen/Qwen2.5-1.5B-Instruct-GGUF`, aunque el README menciona Qwen 2.5-14B ejecutándose vía LM Studio, lo que genera una discrepancia sobre el tamaño real del LLM utilizado. El proyecto se presenta como una solución para profesionales de seguridad, auditorías y bug bounty, con énfasis en la privacidad y el control local.

La relevancia actual radica en la tendencia hacia la IA local y la automatización de tareas ofensivas de seguridad, aunque el repositorio no ofrece métricas de rendimiento ni benchmarks, y su adopción es nula (0 descargas, 0 likes). Es un proyecto en fase inicial que demuestra un enfoque práctico para integrar LLMs con herramientas de pentesting.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en Qwen2.5-Instruct (variante no confirmada; el base_model indica 1.5B, el README menciona 14B) |
| Parametros totales | No disponible (el repositorio no contiene pesos) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el base_model es GGUF, pero no se especifica la cuantización) |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | MIT |
| Formato de pesos | No aplica (repositorio sin pesos; solo código y configuración) |

## Arquitectura y entrenamiento

El proyecto no es un modelo de lenguaje entrenado desde cero, sino un sistema agéntico que orquesta un LLM local (Qwen 2.5 Instruct) con un servidor Flask MCP y herramientas de pentesting. La arquitectura del agente incluye un bucle autónomo en Python que selecciona y encadena herramientas según los resultados del reconocimiento, y una caché de experiencias negativas persistente que utiliza huellas SHA-256 para evitar repetir combinaciones fallidas de herramientas y parámetros entre sesiones.

No se proporcionan detalles sobre el entrenamiento del modelo subyacente, el dataset utilizado ni el proceso de ajuste fino. La model card menciona que el LLM se ejecuta en LM Studio, lo que sugiere que se usa una versión cuantizada de Qwen 2.5, pero no se especifica si hubo fine-tuning adicional. La discrepancia entre el tamaño indicado en el base_model (1.5B) y el mencionado en el README (14B) no está resuelta en la documentación.

## Capacidades

- Reconocimiento autónomo: utiliza `masscan` y `nmap` para descubrir puertos y servicios abiertos.
- Bucle de ataque autónomo: selecciona y encadena herramientas basándose en los servicios descubiertos.
- Caché de experiencias negativas persistente: aprende de fallos anteriores y evita repetirlos en futuras sesiones.
- Generación automática de informes HTML profesionales al finalizar la sesión (mediante Ctrl+C).
- Integración con 18 herramientas de pentesting: incluye `sqlmap`, `hydra`, `metasploit`, `nikto`, `wpscan`, `dirb`, `enum4linux`, entre otras.
- Soporte para Social Engineering Toolkit (SET).
- Ejecución 100% local: el LLM corre en LM Studio, sin comunicación externa.
- Interacción con servicios de red: SSH, FTP, Telnet, SMB, HTTP.

## Casos de uso

- Auditorías de seguridad autorizadas para pequeñas empresas: el agente puede escanear infraestructuras WordPress o sitios de comercio electrónico, identificar vulnerabilidades y generar un informe HTML con los hallazgos, reduciendo el tiempo de un pentest manual.
- Flujos de bug bounty: los cazadores de recompensas pueden desplegar el agente contra objetivos autorizados para automatizar el reconocimiento inicial y la enumeración de servicios, priorizando después la explotación manual.
- Investigación en IA y seguridad: el proyecto sirve como banco de pruebas para estudiar cómo los LLM pueden tomar decisiones autónomas en entornos ofensivos, incluyendo la gestión de herramientas y la persistencia de conocimiento entre sesiones.
- Formación y demostraciones en laboratorios controlados: permite a estudiantes de ciberseguridad observar un agente autónomo interactuando con máquinas vulnerables (por ejemplo, en entornos como Hack The Box) sin necesidad de infraestructura en la nube.
- Pruebas de seguridad en redes internas: al ser completamente local, el agente puede desplegarse en un entorno aislado para evaluar la postura de seguridad de una red corporativa sin filtrar datos a terceros.
- Automatización de informes de pentesting: la generación automática de informes HTML ahorra tiempo a los consultores, que pueden revisar y personalizar el documento final en lugar de redactarlo desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de rendimiento, comparativas con otros modelos ni evaluaciones de precisión en tareas de seguridad. La ausencia de descargas y la falta de documentación técnica impiden cualquier análisis cuantitativo.

## Requisitos de hardware

- Los requisitos dependen del modelo Qwen 2.5 utilizado. Si se emplea la variante de 1.5B (según el base_model), puede ejecutarse en CPU con 8 GB de RAM o en GPUs de consumo como una RTX 3060 con 6 GB de VRAM.
- Si se usa la variante de 14B (según el README), se recomienda al menos 16 GB de VRAM para cuantización Q4, o 32 GB para mayor precisión. GPUs como RTX 4090, A100 o H100 serían adecuadas.
- El agente requiere Kali Linux como sistema operativo y las herramientas preinstaladas (masscan, nmap, etc.).
- El servidor Flask MCP se ejecuta en el puerto 8000, con requisitos mínimos de CPU y RAM adicionales.
- Opciones de despliegue: el agente se ejecuta como un script Python local; el LLM se sirve a través de LM Studio, que expone una API compatible con OpenAI. No se menciona soporte para vLLM, Ollama o TGI.
- La latencia y el throughput dependen del hardware y del tamaño del modelo; no se proporcionan estimaciones.

## Comparativa con modelos similares

No se dispone de información sobre modelos o agentes comparables en el mismo repositorio. El proyecto es único en su enfoque (agente de pentesting con MCP), pero no hay datos objetivos para comparar con alternativas como otros agentes de seguridad basados en LLM (por ejemplo, los que usan GPT-4 o Claude). Se recomienda evaluar el rendimiento en entornos controlados antes de considerar su uso en producción.

## Limitaciones y advertencias

- El repositorio no contiene pesos del modelo, solo el código del agente. Para reproducir el sistema, el usuario debe descargar Qwen 2.5 por separado, y la discrepancia entre 1.5B y 14B no está aclarada.
- Riesgo de uso indebido: el agente está diseñado para pentesting autorizado, pero podría utilizarse contra sistemas sin permiso, lo que viola leyes y ética profesional. El autor no ofrece garantías de seguridad legal.
- Posibles alucinaciones del LLM: al ser un modelo de lenguaje, puede generar comandos incorrectos o interpretar erróneamente los resultados de las herramientas, lo que podría llevar a falsos positivos o acciones dañinas.
- La caché de experiencias negativas persiste entre sesiones, pero no se especifica cómo se gestiona la privacidad de los datos almacenados (por ejemplo, si se guardan IPs o credenciales).
- La licencia MIT permite uso comercial, pero el autor no proporciona soporte ni actualizaciones. El proyecto tiene 0 descargas y 0 likes, lo que indica una adopción nula y una madurez limitada.
- No se documentan límites de contexto ni de idioma; el agente está pensado para entornos de habla inglesa.
- La generación de informes HTML puede incluir información sensible si no se revisa antes de compartir.

## Enlaces

- Hugging Face: https://huggingface.co/gacekmg/Local_Security_Model
- GitHub: https://github.com/XenoCoreGiger31/Local-Model
- Modelo base (referencia): https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF
