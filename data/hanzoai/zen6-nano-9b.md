# hanzoai/zen6-nano-9b

## Resumen

Zen 6 Nano (9B) es un modelo de lenguaje multimodal y orientado a agentes desarrollado por Hanzo AI y Zen LM en colaboración con Zoo Labs Foundation. Su rasgo diferencial es que se distribuye exclusivamente en pesos ternarios de 1,58 bits (valores {-d, 0, +d}), lo que reduce el peso en disco de la variante principal a 2,42 GB pese a anunciarse como un modelo de 9B. La model card describe una arquitectura híbrida con bloques de atención lineal Gated-DeltaNet intercalados con atención completa agrupada (GQA) y un proyector visual multimodal.

El modelo está post-entrenado directamente en el espacio de pesos ternarios mediante Quantization-Aware Training con Straight-Through Estimator y una combinación de optimizadores Muon y AdamW, e incorpora una rotación ortogonal de Hadamard para eliminar valores atípicos en las activaciones. Incluye soporte nativo de tool calling multi-paso con formato `<tool_call>`/`<tool_response>`, herramientas MCP y decodificación especulativa mediante Multi-Token Prediction y DFlash2.

Es relevante porque propone un despliegue de modelos agenticos de bajo coste en CPU y GPU de consumo, con variantes pensadas para CI/CD sin coste por token. No obstante, la información pública disponible es escasa: el repositorio no registra descargas ni interacciones, y existe una discrepancia notable entre el tamaño anunciado (9B) y los parámetros reales declarados en safetensors (1.470.621.184, es decir, aproximadamente 1,47B).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: bloques Gated-DeltaNet (atención lineal) intercalados 3:1 con atención completa GQA, MLP SwiGLU y proyector visual multimodal (mmproj) |
| Parametros totales | 1.470.621.184 según safetensors; la model card lo denomina "9B ternary tier" (discrepancia no aclarada) |
| Parametros activos | no disponible (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | PQ2_0 (2,125 bpw), PTQ1_0 (1,750 bpw), Q2_0 (2,250 bpw), Q8_0 para borradores MTP y DFlash2, BF16 y Q8_0 para el proyector multimodal |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tipos GGML 142, 143 y 42), con metadatos KV `prism.hadamard.*` |

## Arquitectura y entrenamiento

La columna vertebral es híbrida: por cada bloque de atención completa con Grouped-Query Attention se intercalan tres bloques de atención lineal Gated-DeltaNet, todos con MLP SwiGLU. Los pesos lineales y los embeddings de tokens se almacenan en una base ortogonal por bloques de Sylvester-Walsh-Hadamard, con vectores de signo ±1 por canal embebidos en los metadatos del GGUF. Esta rotación elimina los valores atípicos de activación, de modo que los pesos ternarios por grupo de 128 conservan la precisión densa. El post-entrenamiento se realiza directamente en el espacio ternario mediante QAT con Straight-Through Estimator y optimizadores híbridos Muon + AdamW.

El modelo incorpora tres mecanismos de aceleración de inferencia: Multi-Token Prediction (MTP) como borrador integrado, DFlash2 como borrador especulativo por difusión de bloques y `SA_SPEC` con autómata de sufijos y `GuardedDraft`. La model card no especifica el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. Se preserva la atribución a Qwen (Alibaba Cloud), Bonsai-2 (Prism ML) y DFlash/ProCreations en el fichero NOTICE.

## Capacidades

- Generación de texto conversacional con identidad propia de `zen6-nano`, sin sobrecarga de system prompt, respetando personas definidas por el desarrollador.
- Tool calling multi-paso con `<tool_call>` y síntesis de `<tool_response>`, recuperación de errores y abstención calibrada de herramientas.
- Integración con herramientas MCP de Hanzo: `fs`, `exec`, `code`, `git`, `test`, `hanzo` y herramientas de dirección de motores de juego.
- Procesamiento multimodal de imagen y texto mediante el proyector `mmproj` (pipeline `image-text-to-text`).
- Razonamiento agentico multi-paso orientado a tareas de ingeniería de software.
- Compatibilidad con la API `/v1/chat/completions` de OpenAI a través de `hanzo-engine`.
- Capacidades multilingües: no disponible.

## Casos de uso

- Automatización de tareas de repositorio: el modelo puede leer `Cargo.toml`, listar ficheros y ejecutar tests de workspace mediante las herramientas `fs`, `exec` y `test`, encadenando llamadas y sintetizando el resultado.
- CI/CD sin coste por token: cargando la variante compacta en runners de CPU, se pueden ejecutar tests de integración de LLM y de tool calling en GitHub Actions sin claves de API.
- NPCs y lógica de juego: la model card cita explícitamente personas de NPC para Godot y herramientas de dirección de motor de juego, lo que permite diálogos dinámicos y control de eventos dentro del juego.
- Extracción estructurada de datos: el modelo respeta personas de extractor JSON definidas por el desarrollador, útil para pipelines de parsing de documentos.
- Asistentes de terminal para desarrolladores: con `exec` y `git` puede diagnosticar fallos, proponer parches y verificar el estado del repositorio en local.
- Despliegue en hardware de consumo y Apple Silicon: las variantes de 1,75 a 2,25 bpw y los packs MLX de 2 bits permiten servir el modelo en portátiles y equipos sin GPU dedicada.
- Procesamiento de capturas o documentos con imagen: el proyector multimodal permite incorporar imágenes a conversaciones de extracción o descripción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,0 GB para PTQ1_0, 2,4 GB para PQ2_0 y 2,6 GB para Q2_0, más el proyector visual (624 MB en Q8_0 o 922 MB en BF16).
- GPU recomendadas: cualquier GPU con soporte CUDA, ROCm, Metal o Vulkan a través de `hanzo-engine`; el tamaño reducido no exige A100 ni H100.
- GPU de consumo: cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 y en Apple Silicon mediante MLX 2-bit con `mlx-lm`.
- CPU: ejecución nativa en CPU con `hanzo-engine` y con llama.cpp (Q2_0 en upstream b11556 o superior); la model card menciona una variante de 2B en PTQ1_0 de unos 429 MB para runners de CI.
- Despliegue: `hanzo-engine` (servidor compatible con OpenAI en el puerto 36900), llama.cpp/llama-server, MLX en Apple Silicon.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Zen 6 Nano 9B | 1,47B (safetensors); "9B tier" según autor | no disponible | Ternaria 1,58 bits nativa (PQ2_0, PTQ1_0, Q2_0) | Apache 2.0 | Multimodal, tool calling MCP, decodificacion especulativa |
| Qwen3 (variantes pequenas) | no disponible en esta ficha | no disponible | Multiples (GGUF, safetensors) | Apache 2.0 en varias variantes | Upstream citado en la atribucion del modelo |
| Bonsai-2 (Prism ML) | no disponible en esta ficha | no disponible | no disponible | no disponible | Upstream citado en la atribucion del modelo |
| DFlash / ProCreations | no disponible en esta ficha | no disponible | no disponible | no disponible | Origen del mecanismo de borrador especulativo |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Discrepancia de tamaño: la denominacion comercial indica 9B, pero los safetensors declaran 1.470.621.184 parametros; conviene verificar el artefacto real antes de dimensionar el despliegue.
- Ausencia de benchmarks: no hay resultados publicados de MMLU, HumanEval, GSM8K ni similares, por lo que el rendimiento real es desconocido.
- Idiomas no declarados: no se especifica cobertura multilingue, lo que limita su uso fuera del ingles sin evaluacion previa.
- Contexto no declarado: se desconoce la ventana de contexto, un dato critico para casos de uso con documentos largos.
- Riesgo de alucinacion: no se documentan evaluaciones de fidelidad ni tasas de error en tool calling.
- Sesgos: no se publica informacion sobre composicion del dataset ni evaluaciones de sesgo.
- Licencia Apache 2.0: permite uso comercial, pero deben conservarse las atribuciones del fichero NOTICE a Qwen, Prism ML y DFlash/ProCreations.
- Madurez: el repositorio no registra descargas ni interacciones y fue creado y actualizado el mismo dia, por lo que no hay evidencia de uso en produccion.
- Dependencia de tooling propietario: algunas funciones (MTP, DFlash2, SA_SPEC) requieren `hanzo-engine`; en llama.cpp solo se garantiza Q2_0 en versiones recientes.

## Enlaces

- Hugging Face: https://huggingface.co/hanzoai/zen6-nano-9b
- Hanzo AI: https://hanzo.ai
- Zen LM: https://zenlm.org
- Zoo Labs Foundation: https://zoolabs.io
- Repositorio de hanzo-engine: https://github.com/hanzoai/engine
