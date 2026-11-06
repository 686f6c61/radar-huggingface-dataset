# kataguru/Industry-Coder-27B-v3.0-NVFP4

## Resumen

Kataguru Industry-Coder-27B v3.0 NVFP4 es un ajuste fino y cuantización híbrida del modelo base Qwen/Qwen3.8-27B, publicado por el usuario kataguru en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text con 27.781.427.952 parámetros totales (arquitectura densa, no MoE), orientado a ingeniería de software, automatización industrial (PLC, CNC, IEC 61131-3, TwinCAT, SCL de Siemens), ciberseguridad y codificación agéntica. El autor lo describe como un modelo bilingüe nativo finlandés-inglés, con capacidades adicionales en estonio, húngaro y turco.

La contribución principal de esta versión no es un nuevo entrenamiento desde cero, sino una cuantización calibrada denominada NVFP4-W4ATTN-AWQ híbrida, que combina NVFP4 para las capas MLP y W4A16 asimétrico con AWQ para las capas de atención, preservando en BF16 las proyecciones `in_proj_a/b`, el encoder visual, el módulo MTP, `lm_head` y `embed_tokens`. El resultado ocupa 20,28 GB en disco, un 25 % menos que una cuantización NVFP4 RTN estándar, y está pensado para ejecutarse en GPUs Blackwell (sm_120) mediante vLLM.

El modelo mantiene la ventana de contexto nativa de 262.144 tokens del base y está diseñado para despliegues en una única RTX 5090 de 32 GB o en dos RTX 5090 con tensor parallelism. Su relevancia actual reside en la combinación de contexto largo, capacidades multimodales, soporte de tool calling en paralelo y especialización vertical en dominios industriales poco cubiertos por los modelos generalistas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido con Gated DeltaNet + atención softmax completa, encoder visual multimodal y Multi-Token Prediction (MTP); clase `Qwen3_5ForConditionalGeneration` |
| Parámetros totales | 27.781.427.952 (27,78 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (nativa) |
| Tipos de cuantización | NVFP4-W4ATTN-AWQ híbrida: MLP en NVFP4 (group_size=16, activaciones calibradas), atención en W4A16 asimétrico (group_size=128, AWQ); componentes en BF16 |
| Idiomas soportados | Inglés (en), finlandés (fi), estonio (et), húngaro (hu), turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con compressed-tensors; 8-bit en metadatos; `model-nonquant.safetensors` para los tensores BF16) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida de 64 capas que combina capas de atención lineal Gated DeltaNet con capas de atención softmax completa, además de un encoder visual de 27 capas (333 tensores en BF16) y un módulo de Multi-Token Prediction (15 tensores en BF16). Esta combinación busca reducir el coste computacional de la atención en contextos largos manteniendo la calidad de recuperación de información.

El ajuste fino de kataguru se describe como un pipeline de tres fases: ortogonalización de residuos SOMA/ARA, QLoRA ortonormal de subespacios divididos (r=16 con `qr_frozen_a`, índices [0:8] frente a [8:16]) y una cuarta fase de annealing multi-dinámico centrada en razonamiento, codificación competitiva y tool calling en paralelo. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; la model card solo menciona las fases de ajuste supervisado descritas. La cuantización posterior preserva en BF16 las proyecciones `linear_attn.in_proj_a/b`, el encoder visual completo, el módulo MTP, `lm_head` y `embed_tokens`, mientras que cuantiza 192 módulos MLP en NVFP4 y 208 módulos de atención en W4A16-AWQ.

## Capacidades

- Generación de texto y razonamiento de nivel STEM de posgrado, según la model card.
- Codificación competitiva y resolución de problemas algorítmicos (evaluado en LiveCodeBench v6).
- Codificación agéntica en entornos IDE y CLI.
- Tool calling y function calling, con soporte específico de llamadas en paralelo (`<tool_call>` múltiples).
- Razonamiento multi-paso y orquestación de agentes.
- Capacidades multimodales de visión: entrada de imagen y texto (pipeline image-text-to-text).
- Dominio industrial: programación de PLC en IEC 61131-3, Siemens SCL, Beckhoff TwinCAT 3 Structured Text y G-code de CNC.
- Ciberseguridad.
- Multilingüe nativo en finlandés e inglés, con soporte de estonio, húngaro y turco.
- Modo de pensamiento multi-dinámico (fase 4 del pipeline de ajuste).
- Comportamiento declarado como "uncensored" y "anti-sycophancy" por el autor.

## Casos de uso

- Agentes de codificación autónomos en IDE o CLI: el modelo puede mantener sesiones largas de refactorización y depuración gracias a su ventana de 262.144 tokens y a su soporte de tool calling en paralelo, integrándose en flujos tipo Copilot o Cursor mediante vLLM.
- Programación de autómatas industriales: generación y revisión de código IEC 61131-3, SCL de Siemens y Structured Text de TwinCAT 3 para proyectos de automatización, un nicho escasamente cubierto por modelos generalistas.
- Generación de G-code para mecanizado CNC: traducción de especificaciones de pieza a trayectorias de mecanizado, con validación posterior en simulador.
- Orquestación de herramientas en paralelo: pipelines de CI/CD o asistentes de operaciones que necesitan invocar varias APIs simultáneamente, aprovechando las métricas de BFCL Parallel AST reportadas.
- Análisis de documentación técnica con imágenes: interpretación de esquemas eléctricos, diagramas de planta o capturas de HMI combinando el encoder visual con el razonamiento textual.
- Asistencia en ciberseguridad: revisión de configuraciones, análisis de vulnerabilidades en código y generación de scripts de auditoría.
- Atención técnica en finlandés e inglés: soporte a usuarios nórdicos en su idioma nativo con terminología técnica verificada según Kotus, según declara el autor.
- Despliegue en estaciones de trabajo con una sola GPU Blackwell: al ocupar 18,72 GiB de pesos, cabe en una RTX 5090 de 32 GB dejando aproximadamente 10 GiB para caché KV, lo que permite inferencia local de contexto largo sin clúster.

## Benchmarks y rendimiento

El autor publica una suite oficial de 15 benchmarks ejecutada sobre 2× NVIDIA GeForce RTX 5090 32 GB Blackwell con TP=2 y CUDAGraphs activados, con un throughput declarado de 1.103,8 tokens/s en 16 sesiones concurrentes.

| Benchmark | Métrica | Qwen3.8-27B (base) | Industry-Coder v2.0 | Industry-Coder v3.0 (NVFP4) | Δ vs. base |
|---|---|---|---|---|---|
| Media de 15 benchmarks (Σ15) | Media | 68,85 % | 68,73 % | 71,90 % | +3,05 pp |
| Media cognitiva de 11 tareas (Σ11) | Media | 70,40 % | 70,41 % | 70,70 % | +0,30 pp |
| LiveCodeBench v6 (175 tareas) | Pass@1 | 58,86 % | 42,29 % | 64,57 % | +5,71 pp |
| LCB v6 Easy (n=43) | Pass@1 | 95,35 % | 95,35 % | 100,00 % | +4,65 pp |
| LCB v6 Medium (n=52) | Pass@1 | 69,23 % | 48,08 % | 82,69 % | +13,46 pp |
| LCB v6 Hard (n=80) | Pass@1 | 32,50 % | 10,00 % | 33,75 % | +1,25 pp |
| LCB v6 LeetCode (n=63) | Pass@1 | no disponible | no disponible | 85,71 % | no disponible |
| BFCL V4 Single-Turn AST (3.641 tareas) | AST global | 85,44 % | 73,14 % | 86,27 % | +0,83 pp |
| BFCL Non-Live AST | AST | 87,89 % | 61,02 % | 89,19 % | +1,30 pp |
| BFCL Live AST | AST | 83,00 % | 85,27 % | 83,35 % | +0,35 pp |
| BFCL Live Parallel AST | Parallel AST | 81,25 % | 25,00 % | 87,50 % | +6,25 pp |
| BFCL Non-Live Parallel AST | Parallel AST | 91,50 % | 29,50 % | 94,50 % | +3,00 pp |
| BFCL Non-Live Parallel Multiple AST | Parallel múltiple | 86,50 % | no disponible | 90,50 % | +4,00 pp |

Los resultados de los benchmarks 1 a 13 de la suite no están incluidos en la información proporcionada; la model card solo detalla los correspondientes a LiveCodeBench v6 y BFCL V4. No se han publicado en la información disponible resultados de MMLU, GSM8K, HumanEval ni de otros benchmarks estándar.

## Requisitos de hardware

- VRAM de pesos: 18,72 GiB totales; 9,36 GiB por GPU con TP=2.
- Espacio en disco: 20,28 GB (frente a 27,0 GB de una cuantización NVFP4 RTN estándar).
- GPU recomendadas: NVIDIA RTX 5090 de 32 GB (Blackwell, sm_120) en TP=1, o 2× RTX 5090 en TP=2. La cuantización NVFP4 requiere hardware Blackwell; no es compatible con generaciones anteriores sin fallback.
- Cabe en GPU de consumo: sí, en una RTX 5090 de 32 GB, dejando aproximadamente 10 GiB libres para caché KV. Con TP=2 el autor reporta capacidad de caché KV de 507.539 tokens.
- Opciones de despliegue: vLLM es el runtime recomendado (TP=1 o TP=2, con CUDAGraphs activados). El formato compressed-tensors es compatible con el ecosistema de transformers; no se indica soporte de llama.cpp, Ollama ni TGI en la información disponible.
- Throughput declarado: 1.103,8 tokens/s de generación con 16 sesiones concurrentes en 2× RTX 5090. No se proporcionan datos de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Kataguru Industry-Coder-27B v3.0 NVFP4 | 27,78 B (denso) | 262.144 | Apache 2.0 | Multimodal, codificación industrial, finlandés-inglés | Hugging Face, pesos safetensors cuantizados |
| Qwen/Qwen3.8-27B (base) | 27 B (denso) | 262.144 | Apache 2.0 (según el campo license del modelo derivado) | Multimodal generalista | Hugging Face |
| Kataguru Industry-Coder-27B v2.0 | 27 B (denso) | 262.144 | Apache 2.0 | Igual que v3.0, sin la cuantización híbrida | Hugging Face |

La comparativa con alternativas de otros fabricantes (por ejemplo, modelos de codificación de 30 B de otras familias) no está disponible en la información proporcionada. Los datos de rendimiento comparativo se limitan a la propia línea Qwen3.8-27B y a la versión anterior v2.0 del mismo autor.

## Limitaciones y advertencias

- La cuantización NVFP4 está ligada a hardware Blackwell (sm_120); en GPUs Ampere o Ada no podrá ejecutarse tal cual y requerirá otra variante de pesos.
- El ajuste fino es obra de un autor individual (kataguru) sin proceso de revisión por pares; los benchmarks son autodeclarados y no han sido replicados de forma independiente.
- El modelo se declara "uncensored" y "anti-sycophancy", lo que implica un filtrado de seguridad reducido y un mayor riesgo de generar contenido inapropiado o de contradecir al usuario sin matices; requiere evaluación propia antes de usarlo en producción orientada al público.
- Riesgo de alucinación inherente a los modelos de 27 B, especialmente en dominios técnicos muy específicos (normativas industriales, referencias de seguridad) donde las respuestas deben verificarse contra documentación oficial.
- El soporte multilingüe se limita a cinco idiomas (en, fi, et, hu, tr); el castellano no figura entre los idiomas declarados, por lo que su rendimiento en español no está garantizado ni evaluado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B debe verificarse por separado para confirmar que su licencia es compatible con la redistribución cuantizada.
- La información sobre el dataset de ajuste fino y el proceso de entrenamiento es incompleta; no se puede auditar la composición de los datos ni descartar sesgos introducidos en el ajuste.
- El rendimiento en tool calling en vivo (BFCL Live AST) es ligeramente inferior al del modelo base (83,35 % frente a 83,00 %), aunque la diferencia es mínima; el resto de métricas de agente mejoran.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kataguru/Industry-Coder-27B-v3.0-NVFP4
- Versión anterior v2.0: https://huggingface.co/kataguru/Industry-Coder-27B-v2.0
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B

No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código ni demos adicionales.
