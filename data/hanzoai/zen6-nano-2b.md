# hanzoai/zen6-nano-2b

## Resumen

Zen 6 Nano (2B) es un modelo de lenguaje multimodal y orientado a agentes desarrollado por Hanzo AI y Zen LM en colaboración con Zoo Labs Foundation. Se distribuye bajo licencia Apache 2.0 y se publica principalmente en formato GGUF con cuantizaciones ternarias de 1,58 bits, lo que reduce el peso de los ficheros a entre 429 MB y 547 MB para los artefactos principales. Con 1.881.825.088 parámetros totales, se posiciona como un modelo de gama pequeña pensado para ejecución local y en CI/CD sin coste por token.

La propuesta técnica central es el entrenamiento post-hoc en el espacio de pesos ternario mediante Quantization-Aware Training (QAT) con Straight-Through Estimator (STE) y una combinación de optimizadores Muon y AdamW. El modelo emplea una columna vertebral híbrida que intercala bloques de atención lineal Gated-DeltaNet con bloques de atención completa agrupada (GQA), e incorpora un proyector visual multimodal (mmproj). Según la model card, está construido sobre la base de Qwen 3.5 y conserva la atribución a Qwen (Alibaba Cloud), Bonsai-2 (Prism ML) y DFlash/ProCreations.

Su relevancia actual reside en dos factores: por un lado, la integración nativa de tool calling multi-paso y MCP (Model Context Protocol) con herramientas de sistema de ficheros, ejecución, código, git y test; por otro, la posibilidad de servir el modelo en CPU para pruebas de integración de extremo a extremo sin claves de API. La model card no detalla la longitud de contexto ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: bloques Gated-DeltaNet (atención lineal) intercalados 3:1 con bloques de atención completa GQA, MLP SwiGLU y proyector visual multimodal (mmproj) |
| Parametros totales | 1.881.825.088 |
| Parametros activos | no disponible (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria 1,58 bits: PQ2_0 (2,125 bpw), PTQ1_0 (1,750 bpw), Q2_0 (2,250 bpw); proyector visual en Q8_0 y BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tipos GGML 142, 143 y 42 para los pesos del modelo; Q8_0 y BF16 para mmproj) |

## Arquitectura y entrenamiento

El modelo utiliza una columna vertebral híbrida en la que se intercalan tres bloques de atención lineal Gated-DeltaNet (GDN) por cada bloque de atención completa con Grouped-Query Attention, con MLPs SwiGLU. Los pesos lineales y los embeddings de tokens se almacenan en una base ortonormal de Sylvester-Walsh-Hadamard, con vectores de signo por canal embebidos en los metadatos KV del GGUF bajo el prefijo `prism.hadamard.*`. Esta rotación de outliers permite que los pesos ternarios por grupo de 128 (valores {-d, 0, +d}) mantengan precisión densa sin degradación por valores atípicos en las activaciones.

El post-entrenamiento se realiza directamente en el espacio de pesos ternario mediante QAT con STE y optimizadores híbridos Muon + AdamW. La model card menciona que el modelo parte de la base Qwen 3.5 y conserva atribución a Bonsai-2 (Prism ML) y DFlash/ProCreations, aunque no se especifica el volumen de tokens de entrenamiento ni la composición del dataset. Tampoco se detalla si hubo fases de RLHF o DPO. Como innovaciones de despliegue, se citan MTP, DFlash2, la búsqueda por autómata de sufijos `SA_SPEC` y `GuardedDraft` en el motor hanzo-engine.

## Capacidades

- Generación de texto conversacional con identidad de pesos propia y respeto a personas de desarrollador personalizadas (por ejemplo, NPC de Godot o extractores JSON).
- Razonamiento agéntico multi-paso con ejecución de `<tool_call>`, síntesis de `<tool_response>` y recuperación de errores.
- Tool calling y function calling compatible con la API `/v1/chat/completions` de OpenAI, con abstención calibrada de herramientas.
- Integración con Hanzo MCP para herramientas de sistema de ficheros (`fs`), ejecución (`exec`), código (`code`), git (`git`), test (`test`), `hanzo` y herramientas de dirección de motores de juego.
- Procesamiento multimodal de imagen y texto (pipeline `image-text-to-text`) mediante el proyector visual mmproj.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de pensamiento explícito (thinking mode): no disponible.

## Casos de uso

- Atención al cliente automatizada: el modelo puede mantener conversaciones multi-turno y emitir llamadas a herramientas para consultar sistemas internos, aunque la longitud de contexto no está documentada y debe validarse antes de desplegarlo en producción.
- Generación de código en producción: con soporte de tool calling y herramientas `code`, `git` y `test`, puede integrarse en pipelines de CI/CD para leer ficheros, ejecutar tests y proponer parches dentro del flujo de trabajo.
- CI/CD de coste cero en CPU: cargando `zen6-nano-2b-PTQ1_0.gguf` (429 MB) en runners de GitHub Actions con llama-server, se pueden ejecutar pruebas de integración de LLM y tool calling sin claves de API ni coste por token.
- Agentes autónomos de escritorio o servidor: las herramientas `fs` y `exec` permiten construir agentes que inspeccionan el espacio de trabajo, ejecutan comandos y sintetizan respuestas a partir de las salidas.
- NPC y lógica de diálogo en videojuegos: la model card menciona explícitamente personas de NPC para Godot y herramientas de dirección de motores de juego, lo que encaja con diálogos dinámicos ejecutados localmente.
- Extracción estructurada de datos: el modelo admite personas de extractor JSON, útil para convertir documentos o respuestas no estructuradas en esquemas definidos por el desarrollador.
- Despliegue en hardware de gama baja: con cuantizaciones de 429-547 MB, puede servirse en CPU, Apple Silicon con MLX 2-bit o GPUs modestas para prototipado y demos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño de los artefactos (429-547 MB para pesos y 365-671 MB para el proyector visual), el modelo completo con visión cabría en menos de 2 GB de memoria en cuantización ternaria.
- GPU recomendadas: no especificadas en la model card; el motor hanzo-engine soporta CUDA, Metal, ROCm, Vulkan y CPU.
- Compatibilidad con GPU de consumo: previsiblemente sí en cualquier GPU con 2 GB o más de memoria, aunque el dato no está confirmado en la información proporcionada.
- Opciones de despliegue: hanzo-engine (`PQ2_0`, `PTQ1_0`, `Q2_0`), llama.cpp desde la versión b11556 en adelante (solo `Q2_0`), mlx-lm en Apple Silicon para paquetes MLX 2-bit, y servidor compatible con OpenAI en `http://127.0.0.1:36900/v1`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion destacada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zen 6 Nano (2B) | 1.881.825.088 | no disponible | Ternaria 1,58 bits (PQ2_0, PTQ1_0, Q2_0) | Apache 2.0 | GGUF en Hugging Face, hanzo-engine, llama.cpp, MLX |
| Qwen 3.5 (base declarada) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Bonsai-2 (Prism ML) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos citados como base o inspiración, por lo que la comparación cuantitativa no es posible con la información proporcionada.

## Limitaciones y advertencias

- La model card no documenta la longitud de contexto, lo que impide garantizar conversaciones largas o tareas con documentos extensos sin validación previa.
- No se especifican los idiomas soportados; el rendimiento fuera del inglés es desconocido.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de calidad en MMLU, HumanEval, GSM8K u otras pruebas estándar.
- Riesgo de alucinación inherente a un modelo de 2B parámetros; la abstención calibrada de herramientas reduce pero no elimina este riesgo.
- La cuantización ternaria de 1,58 bits puede degradar tareas que requieran precisión numérica fina; conviene validar en el dominio concreto de uso.
- El soporte en llama.cpp se limita a `Q2_0` desde la versión b11556; los formatos `PQ2_0` y `PTQ1_0` requieren hanzo-engine.
- Aunque la licencia es Apache 2.0, la model card exige preservar la atribución a Qwen (Alibaba Cloud), Bonsai-2 (Prism ML) y DFlash/ProCreations según el fichero NOTICE.
- El ecosistema de despliegue (hanzo-engine, `hanzo up`, MCP) es específico del proveedor y puede introducir dependencias adicionales en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hanzoai/zen6-nano-2b
- Hanzo AI: https://hanzo.ai
- Zen LM: https://zenlm.org
- Zoo Labs Foundation: https://zoolabs.io
- Repositorio hanzo-engine: https://github.com/hanzoai/engine
