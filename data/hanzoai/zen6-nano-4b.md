# hanzoai/zen6-nano-4b

## Resumen

Zen 6 Nano (4B) es un modelo de lenguaje multimodal y orientado a agentes desarrollado por Hanzo AI y Zen LM en colaboración con Zoo Labs Foundation, publicado bajo licencia Apache 2.0. Su rasgo diferencial es que sus pesos están cuantizados de forma nativa a ternario de 1.58 bits (`{-d, 0, +d}`), lo que permite empaquetar el modelo completo en menos de 1,3 GB de disco y ejecutarlo en CPU, GPU de consumo o Apple Silicon sin renunciar a un pipeline de tool calling estructurado.

La arquitectura combina bloques de atención lineal Gated-DeltaNet con atención completa agrupada (GQA) en una proporción 3:1, e incorpora un proyector visual (`mmproj`) que lo habilita para tareas de imagen-texto. El entrenamiento post-hoc se realizó directamente en el espacio de pesos ternario mediante STE QAT con optimizadores híbridos Muon + AdamW, junto con una rotación de outliers basada en la base ortonormal de Sylvester-Walsh-Hadamard que reduce los valores atípicos de activación.

Es relevante ahora porque propone un modelo pequeño y multimodal pensado para CI/CD sin coste por token, backends de videojuegos con NPCs y agentes locales con MCP. La model card declara un tamaño nominal de 4B, pero el dato real de safetensors indica 782.004.736 parámetros totales, una discrepancia que conviene verificar antes de desplegarlo en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 3 bloques Gated-DeltaNet (atención lineal) por cada bloque de Grouped-Query Full Attention, con MLPs SwiGLU y proyector visual multimodal |
| Parametros totales | 782.004.736 (dato real de safetensors); la model card lo denomina "4B" |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternario nativo 1.58-bit: PQ2_0 (2.125 bpw), PTQ1_0 (1.750 bpw), Q2_0 (2.250 bpw); además BF16 y Q8_0 para el proyector multimodal y drafts especulativos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tipos GGML 142, 143 y 42), con sufijos MTP, DFlash2 y mmproj; también MLX 2-bit para Apple Silicon |

## Arquitectura y entrenamiento

El backbone es un transformer híbrido que intercala bloques de atención lineal Gated-DeltaNet (tres por cada bloque de atención completa con GQA). Los MLPs usan SwiGLU y el modelo incorpora un proyector visual (`mmproj`) que aporta la modalidad imagen-texto. Los pesos lineales y los embeddings de tokens se almacenan en una base ortonormal de Sylvester-Walsh-Hadamard, con vectores de signo ±1 por canal embebidos en los metadatos KV del GGUF (`prism.hadamard.*`), lo que elimina outliers de activación y permite que los pesos ternarios por grupo de 128 mantengan precisión densa.

El post-entrenamiento se realizó directamente en el espacio de pesos ternario con Quantization-Aware Training mediante Straight-Through Estimator, usando un esquema híbrido de Muon y AdamW. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La model card menciona decodificación especulativa con MTP (Multi-Token Prediction), DFlash2 (draft por difusión de bloques) y `SA_SPEC` con autómata de sufijos, además de `GuardedDraft` como mecanismo de control del draft.

## Capacidades

- Generación de texto conversacional con identidad de pesos nativa y respeto de personas definidas por el desarrollador (por ejemplo, NPCs de Godot o extractores JSON).
- Tool calling estructurado con ejecución multi-paso de `<tool_call>`, síntesis de `<tool_response>`, recuperación de errores y abstención calibrada de herramientas.
- Integración con herramientas MCP de Hanzo: `fs`, `exec`, `code`, `git`, `test`, `hanzo` y herramientas de director de motor de juego.
- Razonamiento agéntico multi-paso orientado a tareas de ingeniería y automatización.
- Capacidad multimodal imagen-texto a través del proyector `mmproj` (Q8_0 o BF16).
- Compatibilidad con endpoints OpenAI (`/v1/chat/completions`) mediante el runtime `hanzo-engine`.
- Ejecución en CUDA, Metal, ROCm, Vulkan y CPU a través de `hanzo-engine`; Q2_0 también en llama.cpp upstream b11556 o superior; packs MLX 2-bit en Apple Silicon con `mlx-lm`.
- Idiomas soportados: no disponible.

## Casos de uso

- **CI/CD sin coste por token**: cargar `zen6-nano-2b-PTQ1_0.gguf` (~429 MB) en runners de CPU y ejecutar tests de integración de LLM y tool calling de extremo a extremo sin claves de API ni facturación por token.
- **NPCs de videojuegos**: usar el modelo con personas personalizadas (por ejemplo, personajes de Godot) y las herramientas de director de motor de juego para generar diálogo reactivo y comportamiento guiado por el estado del juego.
- **Agentes locales de desarrollo**: integrar el modelo con herramientas `fs`, `exec`, `git` y `test` vía MCP para tareas de inspección de repositorio, ejecución de tests y corrección de errores en un bucle agéntico.
- **Extracción estructurada de datos**: emplear el modelo como extractor JSON con personas definidas por el desarrollador, aprovechando su capacidad declarada de respetar instrucciones de formato estrictas.
- **Despliegue en hardware de consumo**: servir el modelo en una GPU de consumo o en Apple Silicon con los packs MLX 2-bit o los GGUF ternarios, para prototipos de asistentes conversacionales con visión.
- **Backend de agentes con visión**: combinar `mmproj` con el modelo base para tareas imagen-texto en local, como descripción de capturas o extracción de información de documentos escaneados.
- **Entornos sin conectividad**: ejecutar el modelo íntegramente en local (CPU, Vulkan o Metal) en escenarios con requisitos de privacidad o sin acceso a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ternarios ocupan entre 950 MB (`PTQ1_0`) y 1,21 GB (`Q2_0`); con el proyector multimodal Q8_0 (367 MB) o BF16 (676 MB) el total ronda 1,3-1,9 GB. El pack con MTP añade 1,27 GB.
- GPU recomendadas: no se especifican modelos concretos en la información disponible. El runtime declara soporte para CUDA, Metal, ROCm y Vulkan.
- Cabe en GPU de consumo: sí, por el reducido tamaño de los pesos ternarios; la model card menciona ejecución en CPU y Apple Silicon (MLX 2-bit).
- Opciones de despliegue: `hanzo-engine` (CUDA, Metal, ROCm, Vulkan, CPU), llama.cpp upstream b11556 o superior (solo Q2_0), `mlx-lm` en Apple Silicon y endpoint compatible con OpenAI en `http://127.0.0.1:36900/v1`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización nativa | Licencia | Multimodal |
|---|---|---|---|---|---|
| Zen 6 Nano (4B) | 782.004.736 (dato real) | no disponible | Ternario 1.58-bit | Apache 2.0 | Sí (mmproj) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (ternarios multimodales de menos de 1B parámetros efectivos) en la documentación proporcionada.

## Limitaciones y advertencias

- Discrepancia de tamaño: la model card denomina al modelo "4B", pero el recuento real de safetensors es de 782.004.736 parámetros. Verificar el comportamiento real antes de asumir capacidades de un modelo de 4B.
- Idiomas soportados no declarados: no hay garantía de cobertura multilingüe más allá del inglés implícito en la model card.
- Longitud de contexto no documentada: no es posible planificar conversaciones multi-turno largas sin medir el límite real.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad ni de tasas de alucinación.
- Sesgos: no se documenta ningún análisis de sesgos ni de composición del dataset de entrenamiento.
- Dependencia de runtime: los formatos PQ2_0 y PTQ1_0 requieren `hanzo-engine`; solo Q2_0 es compatible con llama.cpp upstream, lo que limita la portabilidad.
- Tool calling: la abstención calibrada y la recuperación de errores son declaraciones del autor sin benchmarks públicos que las respalden.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción por terceros.
- Licencia Apache 2.0: permite uso comercial, pero se debe conservar la atribución a Qwen (Alibaba Cloud), Bonsai-2 (Prism ML, Inc.) y DFlash / ProCreations según el fichero `NOTICE`.

## Enlaces

- Hugging Face: https://huggingface.co/hanzoai/zen6-nano-4b
- Hanzo AI: https://hanzo.ai
- Zen LM: https://zenlm.org
- Zoo Labs Foundation: https://zoolabs.io
- Repositorio del runtime: https://github.com/hanzoai/engine
