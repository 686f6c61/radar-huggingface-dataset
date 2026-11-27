# climbdev/Climb-1.3-Photon-GGUF

## Resumen

Climb 1.3 Photon es un modelo de lenguaje de 0,75 mil millones de parámetros (752.393.024, según los pesos en safetensors) especializado en la generación de comandos de shell para Linux y en tareas de administración de sistemas. Lo desarrolla climbdev y se distribuye como cuantizaciones GGUF del modelo base Climb-Ai/Climb-1.3-Photon. Su propósito es actuar como copiloto de terminal de baja latencia: dado un prefijo `??` seguido de una petición en lenguaje natural, devuelve un comando bash ejecutable, sin markdown ni explicaciones adicionales.

La versión 1.3 introduce lo que el autor denomina "Monolithic Safety & Syntax Alignment", un ajuste orientado a rechazar de forma determinista cargas destructivas (`rm -rf /`, `dd if=/dev/zero of=/dev/sda`, bombas fork, `chmod -R 777 /`). Según la model card, esta versión alcanza un 100 % de rechazo en las 10 pruebas destructivas del benchmark interno y mantiene un 94,3 % de comandos limpios validados con `shellcheck`, frente al 40 % del Qwen 3.5 base de 0,8B.

El modelo se construye sobre la arquitectura híbrida Qwen 3.5, con 24 capas que combinan atención lineal recurrente Gated DeltaNet y atención completa dispersa. Su relevancia actual reside en el nicho: un modelo pequeño, con licencia Apache 2.0, cuantizado a 510 MB en Q4_K_M, pensado para ejecutarse en el cliente vía WebGPU o en dispositivos embebidos, no en servidores de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen 3.5 (24 capas: Gated DeltaNet Linear Attention recurrente + Full Attention dispersa) |
| Parametros totales | 752.393.024 (0,75B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | No disponible (la model card indica que responde en el idioma del prompt) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura híbrida de Qwen 3.5, que intercala capas de atención lineal recurrente Gated DeltaNet con capas de atención completa dispersa a lo largo de sus 24 capas. Este diseño busca reducir el coste computacional y de memoria del mecanismo de atención manteniendo capacidad de modelado, algo relevante para un modelo destinado a ejecución local en el cliente.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. La model card describe el ajuste de la versión 1.3 como una "alineación monolítica de seguridad y sintaxis", sin detallar la metodología (posible SFT, preferencias o reglas deterministas). El prompt de sistema recomendado fuerza un modo de razonamiento vacío (``) para obtener respuestas directas de una sola vuelta.

## Capacidades

- Generación determinista de comandos bash de una sola vuelta a partir de peticiones en lenguaje natural con prefijo `??`.
- Tuberías de E/S, gestión de sockets de red, administración de systemd, almacenamiento y ciclo de vida de contenedores (según las categorías del benchmark del autor).
- Análisis de logs y diagnóstico de problemas de sistema.
- Explicaciones técnicas en lenguaje natural cuando la consulta no usa el prefijo `??`.
- Rechazo determinista de comandos destructivos con mensaje de error a stderr y código de salida 1.
- Respuesta en el idioma del prompt (multilingüe según instrucción de sistema, sin lista de idiomas publicada).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Copiloto de terminal local: integrado en un shell o en una extensión de editor, el modelo traduce peticiones como "busca archivos mayores de 100 MB en /var/log modificados en las últimas 24 h" en un comando ejecutable, con 510 MB en Q4_K_M y temperatura 0,1 para salidas estables.
- Asistente embebido en el cliente con WebGPU: la cuantización Q4_K_M está pensada para `@wllama/wllama`, lo que permite ofrecer sugerencias de comandos sin enviar datos del usuario a un servidor.
- Automatización de tareas de SRE en scripts: el modelo puede generar fragmentos de bash para pipelines de monitorización o limpieza de logs, que luego se validan con `shellcheck` antes de ejecutarse.
- Formación y onboarding de administradores: al explicar comandos y diagnósticos en lenguaje natural, sirve como apoyo para usuarios menos expertos en Linux.
- Filtro de seguridad en pipelines existentes: el comportamiento de rechazo ante `rm -rf`, `dd` y `mkfs` permite usarlo como capa de prevalidación de comandos generados por otros modelos o por usuarios.
- Análisis de logs en entornos con recursos limitados: al ser un modelo de 0,75B, puede ejecutarse en dispositivos embebidos o contenedores pequeños donde un modelo de 7B o superior no cabría.
- Herramienta de CI/CD para linting semántico de scripts: generar y comparar comandos propuestos contra los existentes para detectar construcciones peligrosas.

## Benchmarks y rendimiento

Datos del benchmark interno de 100 tareas publicado por el autor (verificación con `bash -n` y `shellcheck -s bash`):

| Categoría de evaluación | Qwen 3.5 base (0,8B) | Climb 1.2 Photon | Climb 1.3 Photon |
|---|---|---|---|
| Bash limpio (`shellcheck` clean) | 28/70 (40,0 %) | 66/70 (94,3 %) | 66/70 (94,3 %) |
| Rechazo de cargas destructivas (`rm`, `dd`, `mkfs`) | 0/10 (0,0 %) | 0/10 (0,0 %) | 10/10 (100,0 %) |
| Coherencia conversacional | 18/20 (90,0 %) | 20/20 (100,0 %) | 20/20 (100,0 %) |
| Fallos críticos totales | 14/100 | 12/100 | 3/100 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,5 GB en Q4_K_M, 0,6 GB en Q5_K_M y 0,85 GB en Q8_0, más el overhead del runtime.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM libre; también funciona en CPU y en WebGPU del navegador.
- Cabe en GPU consumer: sí, en cualquier RTX o iGPU moderna, y en dispositivos embebidos tipo Raspberry Pi (con llama.cpp compilado para ARM).
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), `@wllama/wllama` para WebGPU, y cualquier runtime compatible con GGUF (Ollama, LM Studio). No se documenta soporte específico de vLLM o TGI.
- Latencia y throughput: no disponibles. El autor lo describe como "low-latency" sin cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Climb 1.3 Photon | 0,75B | No disponible | Bash/Linux, seguridad determinista | Apache 2.0 | GGUF en HF |
| Qwen 3.5 base (0,8B) | 0,8B | No disponible | Propósito general | Según Qwen (no confirmada) | Safetensors/GGUF |
| Climb 1.2 Photon | 0,8B | No disponible | Bash/Linux, sin rechazo destructivo | Apache 2.0 | GGUF en HF |

No se dispone de datos de benchmarks estándar ni de comparativas con otros modelos especializados en shell para establecer una comparación cuantitativa más amplia.

## Limitaciones y advertencias

- Los benchmarks son internos del autor (100 tareas) y no han sido replicados de forma independiente.
- El modelo está entrenado para un modo de una sola vuelta; no se documenta razonamiento multi-paso ni uso de herramientas.
- No hay lista publicada de idiomas soportados; aunque se instruye responder en el idioma del prompt, la calidad fuera del inglés no está verificada.
- Riesgo de alucinación en comandos: aunque el 94,3 % pasan `shellcheck`, un 5,7 % no son limpios, por lo que toda salida debe validarse antes de ejecutarse.
- El rechazo de comandos destructivos se limita a los patrones evaluados; variantes ofuscadas podrían no detectarse.
- No se documenta el proceso de entrenamiento ni los datos, lo que dificulta evaluar sesgos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen 3.5 puede tener condiciones adicionales que conviene revisar.
- La fecha de creación del repositorio (2026-11-22) y la referencia a Qwen 3.5 deben tratarse con cautela: verificar la procedencia y el modelo base antes de usarlo en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/climbdev/Climb-1.3-Photon-GGUF
- Modelo base: https://huggingface.co/Climb-Ai/Climb-1.3-Photon
- llama.cpp: https://github.com/ggml-org/llama.cpp
- wllama (WebGPU): https://github.com/ngxson/wllama
- ShellCheck: https://www.shellcheck.net/
