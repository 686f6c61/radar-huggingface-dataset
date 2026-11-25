# Sivaapril/nl-os-agent-model

## Resumen

NL-OS-Agent es un ajuste fino del modelo NVIDIA Nemotron-3-Nano-4B, publicado por el usuario Sivaapril, orientado a actuar como asistente de shell para sistemas operativos. El modelo traduce peticiones en lenguaje natural a comandos deterministas para Windows PowerShell, Command Prompt y Bash, con un enfoque explícito en seguridad: distingue operaciones de lectura no destructivas de mutaciones de estado y solicita aclaración cuando la petición es ambigua. Se distribuye únicamente en formato GGUF cuantizado Q4_K_M (aproximadamente 2,85 GB), pensado para ejecutarse con llama.cpp o llama-server en CPU o GPU.

El modelo hereda la arquitectura híbrida del Nemotron-3-Nano-4B, que combina capas Mamba-2 con capas Transformer, y cuenta con 3.973.556.832 parámetros totales según los pesos en safetensors del repositorio base. El repositorio ocupa 2,9 GB y está bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. La model card menciona que se han restaurado los metadatos de arquitectura (`nemotron_h`) para garantizar la ejecución en llama.cpp sin advertencias de tensores ausentes.

Su relevancia radica en el nicho: asistentes de línea de comandos que operan en local, sin conexión a red (air-gapped), con validación posterior de las salidas mediante simulación AST y un sistema de cuarentena reversible. Es un modelo pequeño, con solo 138 descargas y 1 like en el momento de la consulta, y con soporte declarado únicamente para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-2 + Transformer (metadatos `nemotron_h`) |
| Parametros totales | 3.973.556.832 (aproximadamente 4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 tokens (valor usado en los ejemplos de la model card; no se especifica el máximo nativo) |
| Tipos de cuantizacion | Q4_K_M (4 bits, K-quant medium) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base está en BF16 safetensors |

## Arquitectura y entrenamiento

El modelo base, NVIDIA Nemotron-3-Nano-4B, emplea una arquitectura híbrida que intercala capas Mamba-2 (modelos de espacio de estados) con capas de atención Transformer. Esta combinación busca reducir el coste computacional y de memoria en contextos largos manteniendo la capacidad de atención completa en determinadas capas. El ajuste fino de Sivaapril conserva esa estructura y solo modifica los pesos para la tarea de agente de shell, restaurando además los metadatos de arquitectura necesarios para que llama.cpp reconozca correctamente el grafo.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset de ajuste fino, ni si se emplearon técnicas de RLHF o DPO. La model card no documenta el proceso de entrenamiento más allá de describir el comportamiento objetivo: planificación alineada con la seguridad, resolución de ambigüedad y distinción entre operaciones de lectura y escritura. Tampoco se especifican innovaciones técnicas adicionales como decodificación especulativa o atención lineal más allá de lo que aporta la arquitectura Mamba-2 del modelo base.

## Capacidades

- Generación de comandos de shell para PowerShell, Command Prompt y Bash a partir de lenguaje natural.
- Clasificación de intención: distingue operaciones de lectura no destructivas de mutaciones de estado.
- Resolución de ambigüedad: formula preguntas de aclaración cuando la petición carece de rutas o ámbitos precisos.
- Planificación orientada a agentes: produce secuencias de comandos que pueden validarse posteriormente mediante simulación AST.
- Ejecución totalmente local y offline (air-gapped), sin envío de prompts ni metadatos del sistema de archivos a servicios externos.
- Integración con el ecosistema NL-OS-Agent, que intercepta y valida las salidas antes de su ejecución.
- Soporte de conversación multi-turno (etiqueta `conversational` en el repositorio).
- Sin capacidades declaradas de visión, audio, tool calling genérico ni modo de razonamiento extendido.

## Casos de uso

- Asistente de administración de sistemas en Windows: el modelo traduce peticiones como «lista los archivos modificados en las últimas 24 horas» a comandos de PowerShell, y el sistema NL-OS-Agent valida el efecto antes de ejecutarlo, evitando borrados accidentales por comodines mal formados.
- Automatización de tareas repetitivas en Bash: un desarrollador puede describir en lenguaje natural una operación de búsqueda y reemplazo sobre un árbol de directorios; el modelo genera el comando y la capa de validación AST comprueba que no afecta a rutas fuera del ámbito indicado.
- Entornos air-gapped con requisitos de confidencialidad: al ejecutarse con llama.cpp en local y sin conexión, es adecuado para estaciones de trabajo de defensa, sanidad o banca donde no se permite enviar comandos ni rutas a la nube.
- Formación y onboarding de administradores junior: el modelo explica y propone comandos con preguntas de aclaración cuando la petición es vaga, lo que sirve como capa pedagógica antes de ejecutar acciones reales.
- Integración en herramientas de gestión de configuración: puede generar scripts de aprovisionamiento para Command Prompt o PowerShell que luego se revisan y versionan en un repositorio, con la ventaja de que el modelo es pequeño (2,85 GB) y cabe en un portátil.
- Despliegue en contenedores o entornos con CPU exclusivamente: los ejemplos de la model card incluyen ejecución con `-ngl 0` y 8 hilos, lo que permite integrarlo en servidores sin GPU para tareas de generación de comandos de baja frecuencia.
- Prototipado de agentes de sistema operativo con rollback: combinado con el «Reversible Quarantine Vault» del proyecto NL-OS-Agent, permite probar comandos destructivos con copia de seguridad previa y deshacer con `nlctl undo`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,85 GB para los pesos en Q4_K_M, más la memoria para el contexto (4K tokens) y el estado de las capas Mamba-2; en la práctica, entre 3 y 4 GB adicionales según la implementación.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para cargar el modelo completo con `-ngl 99`; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema.
- Cabe en GPU de consumo: sí, en modelos con 6 GB o más de VRAM; también puede ejecutarse en iGPU con Vulkan.
- Opciones de despliegue: llama.cpp y llama-server (CUDA, Vulkan, CPU con AVX2/AVX-512); el repositorio incluye la etiqueta `endpoints_compatible`, lo que sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput: no disponibles. La model card solo indica los parámetros de ejecución (`-c 4096`, `-ngl 99` o `-ngl 0 -t 8`) sin cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| NL-OS-Agent (este) | ~4B (denso) | 4096 (uso documentado) | Apache 2.0 | GGUF Q4_K_M | Asistente de shell con validación de seguridad |
| NVIDIA Nemotron-3-Nano-4B (base) | ~4B (denso) | No disponible | Apache 2.0 | BF16 safetensors | Modelo generalista de propósito múltiple |
| Modelos de ~4B para código (p. ej. Qwen2.5-Coder-3B) | ~3B (denso) | 32K típicamente | Apache 2.0 en variantes | Safetensors, GGUF | Generación de código y comandos sin capa de seguridad específica |

La comparación directa con alternativas de la misma categoría (asistentes de shell especializados) no está disponible en la información proporcionada. El modelo base Nemotron-3-Nano-4B es el referente más cercano, y la diferencia principal es el ajuste fino para la tarea de agente de sistema operativo y la distribución exclusiva en GGUF Q4_K_M.

## Limitaciones y advertencias

- Solo soporta inglés según la model card; las peticiones en castellano u otros idiomas pueden degradar la calidad de los comandos generados.
- El contexto documentado en los ejemplos es de 4096 tokens; no se especifica el máximo nativo del modelo base, por lo que conversaciones largas pueden truncarse.
- Riesgo de alucinación en rutas, nombres de ficheros y parámetros de comandos; por eso el proyecto exige validación AST externa antes de ejecutar. No debe usarse como ejecutor directo sin esa capa.
- El modelo está entrenado para PowerShell, Command Prompt y Bash; no se documenta soporte para otros shells (zsh, fish, PowerShell Core en Linux) ni para sistemas distintos de Windows y Linux.
- No se han publicado evaluaciones cuantitativas de seguridad, sesgo o robustez; el número de descargas (138) y likes (1) es muy bajo, lo que limita la validación por parte de la comunidad.
- Aunque la licencia Apache 2.0 permite uso comercial, la responsabilidad sobre comandos destructivos recae en el integrador; el autor no ofrece garantías sobre el comportamiento en producción.
- El repositorio solo distribuye la cuantización Q4_K_M; no hay versiones en BF16, Q5, Q8 ni safetensors del ajuste fino, lo que limita la evaluación de la pérdida de calidad por cuantización.
- La fecha de creación del repositorio (2026-11-20) es posterior a la fecha actual en algunos entornos; conviene verificar la disponibilidad real de los artefactos antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sivaapril/nl-os-agent-model
- Repositorio principal del proyecto: https://github.com/Siva-0317/nl-os-agent
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Documentación de llama.cpp: https://github.com/ggerganov/llama.cpp
