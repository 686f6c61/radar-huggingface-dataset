# impacte/nemotron-terminal-14b-tauriv2

## Resumen

El modelo `impacte/nemotron-terminal-14b-tauriv2` es un ajuste fino (fine-tuning) del modelo `nvidia/Nemotron-Terminal-14B`, que a su vez se basa en la arquitectura Qwen3. Está especializado en la ejecución de tareas de desarrollo con Tauri v2 a través de un agente de terminal, utilizando el formato de agente Terminus 2 (con mensajes alternos de `user`/`assistant` que contienen análisis, plan, comandos y confirmación de tarea completada). El ajuste se realizó con QLoRA sobre un dataset sintético de 180 trayectorias de terminal de Tauri v2, y el resultado se cuantizó a GGUF Q4_K_M para permitir inferencia local eficiente.

El modelo está pensado para desarrolladores que trabajan con Tauri v2 y necesitan un asistente capaz de generar comandos de terminal, configurar proyectos, gestionar plugins, depurar errores de compilación y realizar tareas de distribución, todo ello en un formato estructurado y accionable. Al estar cuantizado a 4.87 bits por peso, ocupa 9.0 GB y puede ejecutarse en GPUs de consumo con al menos 12 GB de VRAM, o incluso en CPU mediante llama.cpp.

La relevancia actual radica en la creciente adopción de Tauri v2 como framework para aplicaciones de escritorio ligeras, y en la necesidad de agentes de terminal especializados que reduzcan la fricción en tareas repetitivas de scaffolding, configuración y depuración. Este modelo cubre ese nicho con un formato de salida JSON estructurado que facilita la integración en pipelines de automatización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (40 capas, 40 cabezas, hidden 5120) |
| Parametros totales | 14.768.307.200 (14,8 B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 131.072 (model_max_length) |
| Tipos de cuantizacion | Q4_K_M (GGUF, 4.87 BPW) |
| Idiomas soportados | no disponible (no especificado en la model card) |
| Licencia | NVIDIA Open Model License (nvidia-open-model-license) |
| Formato de pesos | GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo base `nvidia/Nemotron-Terminal-14B` es un modelo de lenguaje de 14,8 mil millones de parámetros basado en la arquitectura Qwen3, con 40 capas, 40 cabezas de atención y una dimensión oculta de 5120. Sobre este modelo se aplicó un ajuste fino con QLoRA (4-bit NF4) con rango `r = 16` y `alpha = 32`, dropout de 0,05, optimizador `paged_adamw_8bit`, tasa de aprendizaje 2e-4 con decaimiento coseno y warmup de 50 pasos. El entrenamiento se realizó con `max_length = 768`, gradient checkpointing y activación offloading para caber en una GPU de 16 GB de VRAM.

El dataset de entrenamiento se generó sintéticamente con un generador de trayectorias parametrizado (`generate_self_500.py`), produciendo 500 ejemplos en bruto de 9 categorías de tareas de Tauri v2 (scaffolding, configuración, IPC/commands, plugins, build/dev, debugging, distribución, resources/sidecars, y state/events). Tras un proceso de de-duplicación (exacta, normalizada y por plantilla+parámetros), se obtuvieron 180 ejemplos únicos, equilibrados a 20 por categoría. La distribución de tokens medida con el tokenizador de Nemotron-Terminal-14B fue: mínimo 392, máximo 551, media 466, p50 464, p90 530, p99 549, total 232.878 tokens.

El entrenamiento completo (180 ejemplos, 3 épocas) alcanzó una pérdida final de 0,4219 y una precisión media de token de 0,999. Tras el entrenamiento, se fusionó el adaptador LoRA con el modelo base en bf16, se convirtió a GGUF f16 mediante `convert_hf_to_gguf.py` y se cuantizó a Q4_K_M con `llama-quantize`, resultando en un archivo de 9.0 GB.

## Capacidades

- Generación de comandos de terminal estructurados para Tauri v2, siguiendo el formato Terminus 2 (análisis, plan, comandos, `task_complete`).
- Ejecución de tareas de scaffolding de proyectos Tauri v2, incluyendo la creación de la estructura inicial y la configuración de `tauri.conf.json`.
- Gestión de plugins de Tauri v2: añadir, registrar y configurar permisos de plugins mediante la CLI de Tauri.
- Manejo de comandos IPC (inter-process communication) y eventos, generando el código y los comandos necesarios.
- Depuración de errores de compilación y ejecución, proponiendo comandos de diagnóstico y correcciones.
- Soporte de tareas de build y desarrollo, incluyendo la ejecución de `tauri dev` y `tauri build` con las opciones adecuadas.
- Capacidad de razonamiento multi-paso: el formato Terminus 2 obliga a planificar antes de ejecutar comandos, lo que permite tareas complejas con varios pasos.
- Generación de texto conversacional en el contexto de tareas de terminal, aunque su especialización principal es el dominio Tauri v2.

## Casos de uso

- Automatización del scaffolding de proyectos Tauri v2: el modelo puede generar la secuencia completa de comandos para crear un nuevo proyecto (`create-tauri-app`), inicializar la estructura de directorios y configurar el archivo `tauri.conf.json` con los parámetros deseados. Es adecuado porque su dataset incluye trayectorias de scaffolding y produce salidas en formato JSON accionable.
- Configuración de plugins y permisos: dado un plugin concreto (por ejemplo, `tauri-plugin-shell`), el modelo genera los comandos para añadirlo al proyecto, registrarlo en `Cargo.toml` y `lib.rs`, y añadir los permisos necesarios en `capabilities/`. Esto reduce errores manuales y acelera la integración.
- Gestión de comandos IPC y eventos: el modelo puede generar el código Rust y JavaScript necesario para definir comandos IPC, invocarlos desde el frontend y manejar eventos, así como los comandos de terminal para verificar la configuración. Su entrenamiento incluye categorías específicas de IPC/commands y state/events.
- Depuración de errores de compilación: ante un error de `cargo build` o `tauri build`, el modelo sugiere comandos de diagnóstico (como `cargo check` o `tauri info`) y propone correcciones típicas, basándose en las trayectorias de debugging del dataset.
- Automatización de tareas de distribución: el modelo puede generar los comandos para empaquetar la aplicación para diferentes plataformas (Windows, macOS, Linux), configurar actualizaciones y manejar recursos y sidecars, siguiendo las categorías de distribución y resources/sidecars.
- Integración en pipelines de CI/CD: gracias a su formato de salida estructurado (JSON con comandos), el modelo puede ser invocado desde un script de CI para generar dinámicamente pasos de build o despliegue de aplicaciones Tauri v2, reduciendo el mantenimiento manual de los pipelines.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas de entrenamiento (pérdida y precisión de token), pero no resultados en evaluaciones estándar como MMLU, HumanEval o GSM8K. Tampoco se comparan con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q4_K_M ocupa 9.0 GB, por lo que se recomienda al menos 12 GB de VRAM para cargar el modelo completo con contexto moderado (por ejemplo, 8192 tokens). Con contexto de 131.072 tokens, la VRAM necesaria aumentaría considerablemente (posiblemente más de 20 GB).
- GPU recomendadas: tarjetas de consumo como RTX 3090 (24 GB), RTX 4090 (24 GB) o RTX 4080 (16 GB) pueden ejecutar el modelo con comodidad. También es posible en GPUs de 12 GB (RTX 3060, RTX 4070) con contexto reducido.
- Si cabe en consumer GPU: sí, en GPUs con 12 GB o más, siempre que se ajuste el tamaño del contexto.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli), llama-cpp-python. También puede usarse con servidores compatibles con OpenAI (llama.cpp expone un endpoint `/v1/chat/completions`). No se mencionan vLLM, TGI u Ollama, pero al ser GGUF, podría funcionar con Ollama si se importa el archivo.
- Latencia y throughput: no se proporcionan datos. En una RTX 4090, un modelo de 14B en Q4_K_M suele generar entre 20 y 40 tokens por segundo, pero esto es una estimación general, no un dato oficial.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables en la información facilitada. El modelo base `nvidia/Nemotron-Terminal-14B` es la referencia natural, pero no se dispone de benchmarks comparativos.

## Limitaciones y advertencias

- Entrenado en un dataset sintético muy pequeño (180 ejemplos), por lo que su rendimiento es fuerte solo en las tareas de Tauri v2 que cubre el dataset; fuera de ese dominio, las capacidades generales del modelo base pueden degradarse.
- La cuantización Q4_K_M introduce una pérdida menor de calidad respecto al modelo en f16, aunque es aceptable para inferencia local.
- El modelo puede alucinar comandos o configuraciones incorrectas si la tarea se aleja de los patrones vistos en el entrenamiento. Se recomienda verificar siempre los comandos generados antes de ejecutarlos.
- No se especifican los idiomas soportados; el modelo base Qwen3 es multilingüe, pero el fine-tuning se centró en inglés (los ejemplos del dataset están en inglés). El uso en otros idiomas puede ser menos fiable.
- La licencia NVIDIA Open Model License debe revisarse antes de cualquier uso comercial. El modelo es un derivado de un modelo bajo esa licencia, por lo que las restricciones de la licencia base se aplican.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado en datos sintéticos generados por un script, puede heredar sesgos del proceso de generación (por ejemplo, preferencia por ciertos nombres de aplicaciones o plugins).

## Enlaces

- [HuggingFace - impacte/nemotron-terminal-14b-tauriv2](https://huggingface.co/impacte/nemotron-terminal-14b-tauriv2)
- [Modelo base - nvidia/Nemotron-Terminal-14B](https://huggingface.co/nvidia/Nemotron-Terminal-14B)
- [NVIDIA Open Model License](https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/)
