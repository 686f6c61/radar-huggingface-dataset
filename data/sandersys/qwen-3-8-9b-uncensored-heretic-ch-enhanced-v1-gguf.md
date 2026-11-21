# SanderSyS/Qwen-3.8-9B-Uncensored-Heretic-Ch-Enhanced-V1-GGUF

## Resumen

Qwen 3.8 9B Uncensored Heretic Ch. Enhanced V1 (GGUF) es una cuantización en formato GGUF de un ajuste fino realizado por SanderSyS sobre el modelo base `benjamin920101/Qwen3.8-9B-Distill-uncensored-heretic-china_uncensored_dpo`, que a su vez deriva de la familia Qwen3. El autor lo presenta como una edición orientada a uso agéntico y orquestación de herramientas (MCP, function calling, skills bajo demanda), con un entrenamiento continuo declarado de 1800 pasos totales consolidados (800 anteriores más 1000 adicionales de "maestría agéntica"). El modelo tiene 8.953.803.264 parámetros (aproximadamente 9B) y se distribuye bajo licencia Apache 2.0.

La propuesta principal es un modelo de ~9B parámetros que combina un carácter "uncensored" (sin rechazos, según el autor) con capacidades específicas de enrutamiento de herramientas: el autor declara cobertura de 11 servidores MCP con 628 herramientas totales, un enrutador de más de 250 "Bionic Skills", navegación web autónoma y priorización del lenguaje Rust para tareas de sistemas. Es relevante para desarrolladores que quieran desplegar localmente un agente de código con tool calling sobre hardware de consumo, dado que el autor reporta unos 66,8 tokens/s con offload total en una RTX 4070.

Conviene señalar que el nombre del repositorio indica "V1" mientras que la model card habla de "V4" y "Master Agentic Edition", lo que sugiere una discrepancia de versionado. Además, los datos de rendimiento y las capacidades declaradas provienen exclusivamente del autor y no se acompañan de benchmarks estándar verificables.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3, según tags y nombre del modelo base); detalles internos no disponibles |
| Parámetros totales | 8.953.803.264 (~9B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q6_K (~6,85 GB), Q5_K_M (~6,05 GB); otras no disponibles |
| Idiomas soportados | en, pt |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a la familia Qwen3 (transformer decoder-only), aunque la model card no detalla la configuración interna (número de capas, dimensiones, cabezas de atención ni mecanismo de atención). El ajuste fino se realizó con PyTorch 2.6, Transformers y PEFT mediante QLoRA sobre una NVIDIA GeForce RTX 4070 de 12 GB, según declara el autor. El modelo base es un destilado "uncensored" con DPO aplicado, orientado a eliminar rechazos.

El entrenamiento declarado se estructura en fases acumulativas: una fase fundamental (300 pasos), una de esquemas (500 pasos), una de harness (800 pasos) y una final de maestría agéntica (1000 pasos adicionales, 1800 en total). El autor menciona un "buffer de replay anti-olvido (GeRe)" para preservar conocimiento general de ingeniería de software y un modo de razonamiento `<think>` con tiempo de respuesta declarado inferior a 1 segundo. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni los detalles del proceso de alineación más allá de la referencia a DPO en el modelo base.

## Capacidades

- Generación de texto conversacional y razonamiento con modo de pensamiento (`<think>`), declarado como ultrarrápido (menos de 1 segundo).
- Generación de código con énfasis declarado en Rust ("Rust First" para tareas de sistemas y bajo nivel).
- Function calling y tool use, con enrutamiento jerárquico declarado sobre 11 servidores MCP y 628 herramientas.
- Orquestación de agentes multi-paso y flujo de skills bajo demanda mediante `find_bionic_skills` / `load_bionic_skill` / `executa_verified_skill`.
- Navegación web autónoma mediante herramientas `web_search`, `web_fetch`, `web_extract_links` y `web_extract_text`.
- Conciencia de sandbox y auto-recuperación ante limitaciones de Pyodide/Emscripten, con redirección de comandos al host.
- Comportamiento "uncensored" / zero-refusal declarado por el autor.
- Capacidades multilingües limitadas a inglés y portugués según los metadatos.

## Casos de uso

- Agente de código en local para desarrolladores: el modelo puede integrarse en un IDE o CLI con tool calling para leer, escribir y ejecutar código, aprovechando su orientación a Rust y su ventana de herramientas MCP; encaja en equipos con GPU de consumo gracias a las cuantizaciones Q5_K_M y Q6_K.
- Orquestación de herramientas MCP: si el entorno del usuario expone servidores MCP compatibles con los nombrespaces declarados (web, pentest, ghost-*, dotnet-mcp, etc.), el modelo puede enrutar llamadas entre ellos sin adivinar namespaces, según el autor.
- Automatización de tareas de reconocimiento y análisis en entornos controlados: con los servidores `pentest`, `ghost-analysis` y `ghost-static`, podría emplearse en laboratorios de seguridad autorizados para análisis estático y extracción de información.
- Extracción y resumen de documentación web: usando `web_fetch` y `web_extract_text`, resulta adecuado para pipelines que necesiten descargar y resumir documentación técnica o código de repositorios.
- Asistente de desarrollo en portugués e inglés: al soportar ambos idiomas, puede usarse en equipos lusohablantes para revisión de código, explicación de errores y generación de tests.
- Prototipado de agentes autónomos de bajo coste: al ejecutarse en una RTX 4070 con offload total a unos 66,8 tokens/s declarados, sirve para iterar rápidamente en el diseño de flujos agénticos antes de pasar a modelos mayores.
- Automatización de tareas de terminal en sandbox: la capacidad declarada de redirigir comandos al host mediante `execute_terminal_command` permite construir asistentes que gestionen procesos y paquetes en entornos aislados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor únicamente reporta métricas internas de velocidad y de evolución entre versiones:

| Métrica declarada por el autor | Baseline | V1 (300) | V2 (500) | V3 (800) | V4 (1800) |
|---|---|---|---|---|---|
| Tiempo de razonamiento (`<think>`) | ~8 s | < 1 s | < 1 s | < 1 s | < 1 s |
| Velocidad de generación | ~50 t/s | 65,5 t/s | 65,8 t/s | 66,5 t/s | 66,8 t/s |
| Cobertura MCP | Genérica | Básica | 2 servidores | 2 servidores | 11 servidores (628 herramientas) |

Estos datos no son benchmarks de calidad y no están verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada: Q5_K_M ocupa ~6,05 GB en disco y Q6_K ~6,85 GB; con overhead de contexto, se recomienda al menos 8 GB de VRAM para Q5_K_M y 10 GB para Q6_K.
- GPU recomendadas: el autor reporta ejecución con offload total en una RTX 4070 (12 GB). Modelos con 12 GB o más (RTX 4070, 4070 Ti, 4080, 4090, A100, H100) pueden ejecutar las cuantizaciones publicadas sin problemas; GPUs de 8 GB pueden usar Q5_K_M con contexto reducido.
- Cabe en GPU de consumo: sí, en RTX 4070 y superiores; en GPUs de 8 GB conviene usar Q5_K_M o cuantizaciones menores no publicadas en el repo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el repo incluye checksums SHA-256 para verificar los binarios.
- Latencia y throughput: ~66,8 tokens/s declarados por el autor con offload total en RTX 4070; no hay datos independientes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-3.8-9B-Uncensored-Heretic-Ch-Enhanced-V1 (este) | ~9B | no disponible | Apache 2.0 | Agéntico, MCP, uncensored, Rust | GGUF en HF |
| Modelo base: Qwen3.8-9B-Distill-uncensored-heretic-china_uncensored_dpo | ~9B | no disponible | no disponible | Destilado uncensored con DPO | safetensors en HF |
| Qwen3 8B (original) | ~8B | no disponible en esta ficha | Apache 2.0 | Modelo generalista de la familia Qwen3 | safetensors y GGUF en HF |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; la comparación se limita a parámetros, licencia y enfoque.

## Limitaciones y advertencias

- El modelo es "uncensored" / zero-refusal según el autor: puede generar contenido que otros modelos rechazarían, lo que implica riesgos de seguridad y de cumplimiento en producción.
- No hay benchmarks estándar publicados; las capacidades agénticas y de MCP están declaradas por el autor y no verificadas de forma independiente.
- Discrepancia de versionado: el repositorio se llama "V1" mientras que la model card describe "V4" y "Master Agentic Edition"; conviene verificar qué pesos corresponden realmente a qué versión.
- Idiomas limitados a inglés y portugués; no se declara soporte de castellano.
- Longitud de contexto no documentada, lo que dificulta planificar aplicaciones con ventanas largas.
- Riesgo de alucinación en tool calling: el enrutamiento declarado sobre 628 herramientas puede producir llamadas a namespaces inexistentes fuera del entorno Bionic del autor.
- El ajuste fino se realizó con QLoRA en una sola RTX 4070, lo que limita el volumen de datos y puede reducir la generalización frente a modelos entrenados a mayor escala.
- Aunque la licencia es Apache 2.0, el modelo base podría tener condiciones adicionales no documentadas en esta ficha; conviene revisar la licencia del modelo base antes de uso comercial.
- El tamaño del repo (124,6 GB) incluye múltiples artefactos; descargar solo los GGUF necesarios.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SanderSyS/Qwen-3.8-9B-Uncensored-Heretic-Ch-Enhanced-V1-GGUF
- Modelo base: https://huggingface.co/benjamin920101/Qwen3.8-9B-Distill-uncensored-heretic-china_uncensored_dpo
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
