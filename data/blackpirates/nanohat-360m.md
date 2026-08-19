# blackpirates/NanoHat-360M

## Resumen

NanoHat-360M es un modelo de lenguaje ligero especializado en la asistencia a escritorio Linux, concretamente para Fedora, desarrollado por el usuario de Hugging Face blackpirates (Asim Ansari). Se trata de un fine-tuning del modelo base `HuggingFaceTB/SmolLM2-360M-Instruct` mediante QLoRA, con el objetivo de convertirlo en un agente de escritorio capaz de ejecutar herramientas estructuradas, mantener conversaciones multi-turno y realizar tareas de diagnóstico y administración del sistema. El modelo está diseñado para operar a través del runtime NanoHat, que proporciona un entorno de ejecución seguro con subprocesos validados y seis herramientas consolidadas: calculadora, búsqueda web, memoria de usuario, recordatorios, salud del sistema y acciones del sistema.

Con 361,8 millones de parámetros, es un modelo compacto pensado para ejecutarse en hardware modesto, incluidas GPUs de consumo. Su relevancia actual radica en la tendencia hacia agentes de IA locales y especializados, donde modelos pequeños pueden ofrecer respuestas rápidas y seguras sin depender de infraestructura en la nube. La licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en SmolLM2) |
| Parametros totales | 361.821.120 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el base SmolLM2-360M-Instruct soporta 2048 tokens) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible (el base soporta inglés y otros, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de SmolLM2-360M-Instruct, un modelo de 360M parámetros entrenado por Hugging Face con un tokenizer y configuraciones estándar. El fine-tuning se realizó mediante QLoRA (Quantized Low-Rank Adaptation) con rango 16 y alpha 32, aplicado a todas las proyecciones lineales. El entrenamiento utilizó un conjunto de datos curado de 1.094 muestras de interacciones multi-turno validadas, generadas mediante un currículo estructurado que incluye interacciones de una sola herramienta, conversaciones sin herramientas, flujos multi-herramienta, casos límite y escenarios de recuperación, así como flujos avanzados de administración de sistemas Fedora/Linux.

Se aplicó enmascaramiento de pérdida exclusivamente sobre las respuestas generadas por el asistente (etiquetas `<thought>`, `<tool_call>` y respuestas), ignorando las partes del usuario y del sistema. El entrenamiento duró 3 épocas y alcanzó una pérdida de evaluación final de 0,8567. El pipeline de validación incluye deduplicación semántica entre ejecuciones, validación de salidas de herramientas ancladas a Fedora, auto-rescate de sintaxis JSON, normalización de sinónimos de argumentos y corrección de estructura de turnos. La ejecución en runtime está endurecida: no usa `os.system()`, no usa `shell=True`, emplea listas de argumentos discretas para subprocesos, valida nombres de procesos y requiere confirmación para operaciones destructivas.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, con estructura explícita de `<thought>` y `<tool_call>`.
- Tool calling estructurado con seis herramientas integradas: `calculator(expression)`, `web_search(query)`, `user_memory(action, key, value)`, `reminder(task, time_or_delay)`, `system_health(target)` y `system_action(action, target)`.
- Soporte para agentes y flujos de razonamiento multi-paso, incluyendo diagnóstico y recuperación de errores.
- Cobertura específica de administración de sistemas Fedora/Linux: SELinux, firewalld, SSH, Git, Python PEP 668, Btrfs, LVM, GRUB, Wayland, PipeWire, OBS Studio, Wacom, USB-C, DNS, SMB/NFS, NetworkManager, dnf5, COPR, rpm-ostree, Bluetooth, audio, VPN, Podman y multi-monitor.
- Capacidades multilingües no confirmadas; el modelo base soporta varios idiomas pero el fine-tuning se centra en inglés técnico.
- No incluye capacidades de visión ni audio.

## Casos de uso

- Asistente de escritorio Fedora: el modelo puede gestionar consultas sobre configuración del sistema, como "cómo habilitar firewalld" o "diagnosticar problemas de audio", respondiendo con pasos concretos y, si es necesario, ejecutando herramientas de diagnóstico como `system_health`.
- Automatización de tareas del sistema: mediante `system_action` puede lanzar aplicaciones, tomar capturas de pantalla, bloquear la pantalla o gestionar Wi-Fi y Bluetooth, siempre con validación en el runtime.
- Recordatorios y productividad local: la herramienta `reminder` permite programar notificaciones de escritorio, por ejemplo "recuérdame beber agua en 20 minutos", ideal para entornos de trabajo sin conexión.
- Diagnóstico y monitorización de recursos: `system_health` proporciona telemetría de CPU, RAM, disco, procesos, batería y sistema, útil para scripts de administración o paneles de control.
- Búsqueda web integrada: `web_search` permite consultar información externa dentro de una conversación, útil para resolver dudas técnicas sin salir del agente.
- Educación y aprendizaje de administración de Linux: el modelo puede explicar conceptos como SELinux, Btrfs o gestión de paquetes con dnf5, sirviendo como tutor interactivo para usuarios de Fedora.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento es la pérdida de evaluación final de 0,8567 durante el entrenamiento, pero no se proporcionan comparaciones con otros modelos en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: con 361M parámetros en fp16, la inferencia requiere aproximadamente 0,7 GB de VRAM. Con cuantización a 8 bits o 4 bits, podría reducirse a unos 0,4-0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluyendo NVIDIA GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090, o incluso CPUs con suficiente RAM (inferencia en CPU es viable).
- Cabe en GPUs de consumo de gama baja y media; no requiere hardware de datacenter.
- Opciones de despliegue: compatible con Transformers (PyTorch), vLLM (si se convierte a formato compatible), llama.cpp (si se genera GGUF), Ollama (si se empaqueta), y el runtime NanoHat que incluye el harness de ejecución.
- Latencia y throughput: no disponibles, pero por el tamaño del modelo se espera una generación de decenas de tokens por segundo en GPUs modernas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NanoHat-360M | 361M | No disponible | Agente de escritorio Fedora/Linux | Apache 2.0 | Hugging Face |
| SmolLM2-360M-Instruct (base) | 360M | 2048 tokens | Modelo instructivo general | Apache 2.0 | Hugging Face |
| TinyLlama-1.1B | 1.1B | 2048 tokens | Modelo generalista pequeño | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B-Instruct | 500M | 32768 tokens | Modelo instructivo multilingüe | Apache 2.0 | Hugging Face |

La comparación muestra que NanoHat-360M es un modelo especializado frente a alternativas generalistas. Su ventaja es la adaptación específica a tareas de administración de Fedora y su integración con un runtime seguro, mientras que los modelos generalistas ofrecen mayor cobertura de razonamiento pero requieren fine-tuning adicional para tareas de agente.

## Limitaciones y advertencias

- Es un modelo de 360M parámetros especializado, no un modelo de propósito general; su rendimiento en razonamiento complejo o tareas fuera del ámbito Fedora/Linux será limitado.
- Puede degradarse en sistemas operativos no vistos, tareas fuera del conjunto de herramientas entrenadas o argumentos de herramientas no soportados.
- Riesgo de alucinación en respuestas técnicas si el contexto no está cubierto por el dataset de entrenamiento.
- El modelo no debe tratarse como una frontera de seguridad; la validación de acciones del sistema recae en el runtime NanoHat, no en el propio modelo.
- No se han publicado datos sobre sesgos o comportamientos adversos; se recomienda evaluar en entornos controlados antes de uso en producción.
- La licencia Apache 2.0 permite uso comercial, pero el modelo está diseñado para un ecosistema específico (NanoHat) y su integración con otros runtimes puede requerir adaptación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/blackpirates/NanoHat-360M
- Proyecto NanoHat (GitHub): https://github.com/asimibnakhlaque/NanoHat
- Perfil del autor en Hugging Face: https://huggingface.co/blackpirates
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
