# mradermacher/Kronumos-GGUF

## Resumen
Kronumos es un modelo de lenguaje de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) orientado a tareas de ingeniería de software autónoma: corrección de bugs, auto-reparación de código y operación de agentes basados en Model Context Protocol (MCP). Está construido sobre una base Qwen2 según las etiquetas de la model card, y el autor original del modelo es NadevA23 (repo `NadevA23/Kronumos`); la ficha que nos ocupa es la versión cuantizada en GGUF publicada por mradermacher.

La relevancia de esta publicación es fundamentalmente práctica: mradermacher ofrece un conjunto completo de cuantizaciones estáticas (de Q2_K a f16, más IQ4_XS) que permiten ejecutar el modelo en hardware de consumo mediante llama.cpp y derivados, algo imposible con los pesos originales en safetensors. El repositorio ocupa 68,1 GB en total por acumular todas las variantes, aunque cada archivo individual va de 3,1 GB (Q2_K) a 15,3 GB (f16).

La información pública disponible es escasa: no hay datos de benchmarks, no se detalla la longitud de contexto ni la composición del dataset de entrenamiento, y la model card del cuantizador se limita a listar los archivos generados. Las etiquetas del modelo (`dual-brain`, `rust-subcortex`, `tokenectomy`, `self-healing`, `sre`) sugieren un enfoque especializado en agentes de operaciones y reparación de código, pero no hay documentación técnica que las respalde en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, base Qwen2 (según etiqueta `qwen2`) |
| Parámetros totales | 7.615.616.512 (≈7,6 B) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (etiqueta `en`; la model card no detalla otros) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |
| Modelo base | NadevA23/Kronumos |
| Cuantizador | mradermacher (método estático, `quantize_version: 2`, `output_tensor_quantised: 1`) |
| Tamaño del repo | 68,1 GB (todas las variantes) |
| Descargas | 449 |
| Fecha de creación | 2026-09-24 |

## Arquitectura y entrenamiento
La arquitectura es un transformer decoder-only derivado de Qwen2, según la etiqueta `qwen2` de la model card y el tag `unsloth`, que indica que el ajuste fino se realizó con la librería Unsloth (típicamente LoRA/QLoRA de bajo rango sobre un modelo base). El tamaño de 7,6 B parámetros encaja con la familia Qwen2-7B, aunque no se confirma explícitamente en la documentación disponible.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. Las etiquetas `dual-brain` y `rust-subcortex` apuntan a una posible arquitectura o pipeline de dos componentes (posiblemente un modelo principal más un submódulo especializado en Rust), pero no hay documentación técnica que lo verifique. Tampoco se detalla ninguna innovación de inferencia como decodificación especulativa o atención lineal. El proceso de cuantización sí está documentado: cuantizaciones estáticas con `quantize_version: 2` y cuantización de tensores de salida, generadas a partir del repo original en formato Hugging Face.

## Capacidades
- Generación de texto conversacional en inglés, con especialización declarada en código.
- Corrección de bugs y reparación automática de código (`bug-fix`, `self-healing`).
- Operación como agente autónomo (`autonomous-agent`) con soporte declarado de Model Context Protocol (MCP) para tool calling y conexión a servidores de herramientas.
- Orientación a tareas de SRE (Site Reliability Engineering) según la etiqueta `sre`.
- Posible especialización en Rust mediante el componente etiquetado como `rust-subcortex` (no documentado).
- Capacidades multilingües: solo se declara inglés; no hay evidencia de soporte de castellano u otros idiomas.
- No se declaran capacidades de visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso
- Reparación automática de bugs en pipelines de CI: el modelo puede recibir un fallo de test y un fragmento de código para proponer un parche, aprovechando su ajuste específico en `bug-fix` y `self-healing`.
- Agente de operaciones (SRE) conectado por MCP: integrado en un orquestador que expone herramientas de monitorización, logs y reinicio de servicios mediante Model Context Protocol.
- Asistente de refactorización en Rust: si el componente `rust-subcortex` funciona como se sugiere en las etiquetas, podría usarse para tareas acotadas de análisis y corrección de código Rust.
- Automatización de triaje de incidencias: clasificación y priorización de tickets técnicos con propuesta de causa raíz, en despliegues locales con cuantización Q4_K_M (4,8 GB).
- Copiloto de código en estaciones de trabajo sin GPU dedicada: la variante Q4_K_S (4,6 GB) permite ejecución en CPU con llama.cpp para autocompletado y explicación de código.
- Entornos air-gapped: al ser Apache 2.0 y distribuirse en GGUF, puede desplegarse en infraestructura aislada sin dependencia de APIs externas, útil en entornos regulados.
- Prototipado de agentes multi-paso: su orientación a `autonomous-agent` lo hace adecuado para experimentar con bucles de razonamiento y uso de herramientas en investigación aplicada.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

| Cuantización | Tamaño | VRAM mínima estimada | Hardware típico |
|---|---|---|---|
| Q2_K | 3,1 GB | ~4 GB | GTX 1650, iGPU con 8 GB compartidos |
| Q3_K_M | 3,9 GB | ~5 GB | RTX 3050 6 GB |
| IQ4_XS | 4,4 GB | ~6 GB | RTX 3060 6 GB / 4060 |
| Q4_K_M | 4,8 GB | ~6-7 GB | RTX 3060 12 GB, RTX 4060 Ti |
| Q5_K_M | 5,5 GB | ~7-8 GB | RTX 3070, RTX 4060 Ti 16 GB |
| Q6_K | 6,4 GB | ~8-9 GB | RTX 4070, RTX 3080 |
| Q8_0 | 8,2 GB | ~10-11 GB | RTX 3080 12 GB, RTX 4080 |
| f16 | 15,3 GB | ~17-18 GB | RTX 4090, A100 40 GB, H100 |

- VRAM estimada: además del peso del archivo, hay que sumar el KV cache, que depende de la longitud de contexto (no documentada). Para contextos largos, reservar 2-4 GB adicionales.
- GPU recomendadas: A100/H100 para despliegues de alta concurrencia en f16; RTX 4090 para f16 o Q8_0 en local; RTX 3060 12 GB o 4060 Ti 16 GB como punto óptimo calidad/precio en Q4_K_M y Q5_K_M.
- Cabe en GPU de consumo: sí, desde Q2_K en adelante; Q4_K_M es la opción recomendada por el autor para velocidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con la API de OpenAI (el tag `endpoints_compatible` lo indica). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones; para esos motores habría que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles. Como referencia cualitativa, el autor marca Q4_K_S y Q4_K_M como "fast, recommended" y Q8_0 como "fast, best quality".

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kronumos (esta ficha) | 7,6 B | no disponible | Apache 2.0 | GGUF, safetensors | Especializado en bug-fix, agentes MCP y SRE |
| Qwen2-7B-Instruct | 7,6 B | 32.768 tokens (según documentación pública de Qwen2) | Apache 2.0 | safetensors, GGUF | Base generalista; Kronumos deriva de esta familia según sus etiquetas |
| Mistral-7B-Instruct v0.3 | 7,2 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Alternativa generalista con buen soporte de tool calling |
| CodeLlama-7B-Instruct | 6,7 B | 16.384 tokens | Llama 2 (uso comercial con restricciones) | safetensors, GGUF | Especializado en código, sin enfoque de agentes MCP |

La comparación con Qwen2-7B-Instruct y Mistral-7B-Instruct se basa en características públicas de esos modelos; no hay benchmarks de Kronumos que permitan comparar rendimiento real. La ventaja diferencial de Kronumos es su ajuste declarado para agentes MCP y reparación de código, y su licencia Apache 2.0 sin restricciones comerciales.

## Limitaciones y advertencias
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de que supere a su modelo base en las tareas que declara.
- Documentación muy escasa: no se especifican contexto, dataset, método de ajuste ni composición del entrenamiento, lo que dificulta evaluar su calidad y reproducibilidad.
- Idioma: solo se declara inglés; el rendimiento en castellano es desconocido y probablemente deficiente.
- Riesgo de alucinación: como todo modelo de 7 B sin datos de evaluación, puede generar parches de código plausibles pero incorrectos; en producción requiere tests automáticos que validen cada propuesta.
- Las etiquetas `dual-brain` y `rust-subcortex` no están documentadas; no debe asumirse que exista un componente separado funcional hasta verificarlo con los pesos originales.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero el usuario debe verificar que el modelo base `NadevA23/Kronumos` mantenga la misma licencia (la model card así lo indica).
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_M) degradan la calidad; el autor marca Q3_K_M como "lower quality" y Q4_K_S/M como el punto de equilibrio recomendado.
- Fecha de creación futura (2026-09-24) en los metadatos: conviene verificar la procedencia y autenticidad del repositorio antes de desplegarlo.

## Enlaces
- Repositorio GGUF: https://huggingface.co/mradermacher/Kronumos-GGUF
- Modelo base: https://huggingface.co/NadevA23/Kronumos
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Kronumos-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Kronumos-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- nethype GmbH (patrocinador del cuantizador): https://www.nethype.de/
