# omegazug/Kimi-K2.7-Code

## Resumen

Kimi K2.7 Code es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) orientado a tareas de programación agéntica, desarrollado por Moonshot AI y publicado en Hugging Face. Se construye sobre Kimi K2.6 y está especializado en tareas de ingeniería de software de horizonte largo, es decir, flujos de trabajo completos que requieren múltiples pasos de razonamiento, uso de herramientas y edición de código en repositorios reales. Con 1 billón de parámetros totales y 32B activos por token, emplea atención MLA y una ventana de contexto de 256K tokens.

La relevancia del modelo radica en su enfoque en eficiencia de tokens: según la model card, reduce el uso de tokens de "thinking" en aproximadamente un 30% respecto a Kimi K2.6, manteniendo mejoras sustanciales en benchmarks de código y agentes. Incorpora además un codificador visual MoonViT de 400M de parámetros, lo que habilita entradas de imagen y texto, y se distribuye con licencia "modified MIT" (etiquetada como "other" en el repositorio).

El checkpoint disponible en `omegazug/Kimi-K2.7-Code` es una réplica no oficial (0 descargas, 0 likes en el momento de la consulta) con pesos en safetensors y formato compressed-tensors, un tamaño de repositorio de 595,2 GB y arquitectura declarada `kimi_k25` con código personalizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención MLA y codificador visual MoonViT |
| Parametros totales | 1.026.879.376.368 (1T) |
| Parametros activos | 32B |
| Longitud de contexto | 256K tokens (262.144) |
| Tipos de cuantizacion | no disponible (el repo usa compressed-tensors; no se detallan esquemas) |
| Idiomas soportados | no disponible |
| Licencia | modified MIT (etiqueta `license:other`, `license_name: modified-mit`) |
| Formato de pesos | safetensors con compressed-tensors, código personalizado (`custom_code`) |

Otros datos técnicos declarados en la model card: 61 capas (1 densa), dimensión de atención 7168, dimensión oculta MoE por experto 2048, 64 cabezas de atención, 384 expertos con 8 seleccionados por token y 1 experto compartido, vocabulario de 160K, función de activación SwiGLU y 400M de parámetros en el codificador visual.

## Arquitectura y entrenamiento

El modelo es un transformer con arquitectura Mixture-of-Experts: 61 capas (una densa y el resto con mezcla de expertos), 384 expertos en total, de los cuales se activan 8 por token más un experto compartido. Emplea atención Multi-head Latent Attention (MLA), lo que reduce el coste de memoria de la caché KV en contextos largos, algo crítico con una ventana de 256K tokens. La activación es SwiGLU y el vocabulario alcanza 160K entradas. Incluye un codificador visual MoonViT de 400M de parámetros que permite procesar imágenes junto a texto.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. Sí se indica que el modelo parte de Kimi K2.6 y que se ha optimizado para tareas de código de horizonte largo, con una reducción de aproximadamente el 30% en tokens de razonamiento ("thinking") respecto a su predecesor. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" habilitado por defecto en las evaluaciones del autor.
- Programación agéntica: resolución de tareas de ingeniería de software de extremo a extremo en más de 10 lenguajes de programación según el benchmark interno Kimi Code Bench V2.
- Uso de herramientas y function calling, evaluado en benchmarks MCP (MCP Atlas, MCP Mark Verified).
- Ejecución de agentes multi-paso en entornos de producción simulados (Kimi Claw 24/7 Bench).
- Procesamiento de imagen y texto (pipeline `image-text-to-text`) mediante el codificador MoonViT.
- Extracción de características (`feature-extraction` entre las etiquetas del repositorio).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Eficiencia de razonamiento: menor consumo de tokens de pensamiento que K2.6 (aproximadamente un 30% menos).

## Casos de uso

- Refactorización de repositorios grandes: con 256K tokens de contexto, el modelo puede cargar módulos completos y trazas de error para proponer cambios coherentes en varios ficheros, algo habitual en migraciones de código legacy.
- Resolución de incidencias en producción: el benchmark Kimi Claw 24/7 y las tareas de "production incidents" de la model card indican que está diseñado para diagnosticar fallos a partir de logs y contexto del sistema.
- Agentes de CI/CD con tool calling: su rendimiento en MCP Atlas (76,0) y MCP Mark Verified (81,1) lo hace apto para orquestar herramientas externas (ejecución de tests, consultas a APIs, apertura de pull requests) dentro de pipelines automatizados.
- Asistente de programación en IDE: integrable mediante la CLI Kimi Code o vía transformers, con modo thinking para tareas de depuración complejas y respuestas más directas cuando no se requiere razonamiento extendido.
- Análisis de capturas y diagramas técnicos: el codificador MoonViT permite interpretar imágenes de interfaces, diagramas de arquitectura o mensajes de error renderizados, combinándolos con el contexto textual del repositorio.
- Automatización de tareas de backend e infraestructura: la model card menciona explícitamente servicios backend, infraestructura y rendimiento como áreas cubiertas por su benchmark interno, lo que encaja con tareas de configuración, scripts de despliegue y optimización.
- Generación de tests y documentación técnica a partir de código existente, aprovechando la ventana de contexto larga para cubrir módulos enteros.

## Benchmarks y rendimiento

Resultados publicados en la model card (modo thinking, temperatura 1.0, top-p 0.95, contexto de 262.144 tokens):

| Benchmark | Kimi K2.6 | Kimi K2.7 Code | GPT-5.5 | Claude Opus 4.8 |
|---|---|---|---|---|
| Kimi Code Bench v2 | 50,9 | 62,0 | 69,0 | 67,4 |
| Program Bench | 48,3 | 53,6 | 69,1 | 63,8 |
| MLS Bench Lite | 26,7 | 35,1 | 35,5 | 42,8 |
| Kimi Claw 24/7 Bench | 42,9 | 46,9 | 52,8 | 50,4 |
| MCP Atlas | 69,4 | 76,0 | 79,4 | 81,3 |
| MCP Mark Verified | 72,8 | 81,1 | 92,9 | 76,4 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 1T de parámetros totales, los pesos en safetensors ocupan 595,2 GB en el repositorio; la inferencia en precisión completa requiere un clúster multi-GPU. Con cuantizaciones agresivas (p. ej. 4 bits) el peso seguiría siendo del orden de cientos de GB, por lo que no cabe en una sola GPU consumer.
- GPU recomendadas: no especificadas por el autor. Por tamaño, se requiere un nodo multi-GPU de clase数据中心 (A100/H100/H200) o superior; no hay datos oficiales de despliegue.
- GPU consumer: no cabe en RTX 4090 ni en tarjetas de 24-48 GB, dado el tamaño del checkpoint.
- Opciones de despliegue: la model card referencia la CLI Kimi Code y el uso vía transformers con `custom_code`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento destacado |
|---|---|---|---|---|---|
| Kimi K2.7 Code | 1T totales / 32B activos | 256K | modified MIT | Hugging Face (réplica no oficial) | Kimi Code Bench v2: 62,0; MCP Atlas: 76,0 |
| Kimi K2.6 | no disponible | no disponible | no disponible | Referenciado en la model card | Kimi Code Bench v2: 50,9; MCP Atlas: 69,4 |
| GPT-5.5 | no disponible | no disponible | propietaria | API (Codex) | Kimi Code Bench v2: 69,0; MCP Mark Verified: 92,9 |
| Claude Opus 4.8 | no disponible | no disponible | propietaria | API (Claude Code) | Kimi Code Bench v2: 67,4; MLS Bench Lite: 42,8 |

Los datos de parámetros, contexto y licencia de los modelos comparados no están disponibles en la información proporcionada; solo se dispone de sus resultados en los benchmarks de la model card.

## Limitaciones y advertencias

- El repositorio consultado (`omegazug/Kimi-K2.7-Code`) es una réplica no oficial con 0 descargas y 0 likes; no procede de la organización oficial de Moonshot AI, por lo que conviene verificar la integridad de los pesos antes de usarlos en producción.
- La licencia se etiqueta simultáneamente como `license:other`, `license_name: modified-mit` y "modified MIT"; es imprescindible revisar el fichero LICENSE del repositorio oficial antes de un uso comercial.
- No se especifican los idiomas soportados, lo que impide garantizar un rendimiento adecuado en castellano u otras lenguas distintas del inglés.
- No hay información sobre sesgos conocidos ni sobre tasas de alucinación.
- El tamaño del checkpoint (595,2 GB) y los 1T de parámetros hacen inviable el despliegue en hardware consumer y encarecen cualquier inferencia en la nube.
- Los benchmarks presentados son en su mayoría internos del autor (Kimi Code Bench v2, Kimi Claw 24/7 Bench, MLS Bench Lite), lo que limita la comparabilidad independiente.
- El modelo está especializado en código; su rendimiento en tareas generales de lenguaje no está documentado en la información disponible.
- El uso de `custom_code` en transformers implica ejecutar código remoto del repositorio, con el riesgo de seguridad asociado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/omegazug/Kimi-K2.7-Code
- Organización oficial en Hugging Face: https://huggingface.co/moonshotai
- Página del producto Kimi Code: https://www.kimi.com/code
- Web de Moonshot AI: https://www.moonshot.ai
- Twitter/X de Kimi: https://twitter.com/kimi_moonshot
- Discord de Kimi: https://discord.gg/TYU2fdJykW
- ModelScope de Moonshot AI: https://modelscope.cn/organization/moonshotai
- Licencia (referencia en la model card): https://huggingface.co/moonshotai/Kimi-K2.7-Code/blob/main/LICENSE
