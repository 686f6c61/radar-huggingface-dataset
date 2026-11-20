# Alex500/Qwen-3.8-9B-Uncensored-Heretic-Ch-Enhanced-V1-GGUF

## Resumen

Qwen 3.8 9B Uncensored Heretic Ch. Enhanced V1 (GGUF) es una versión afinada mediante QLoRA del modelo `benjamin920101/Qwen3.8-9B-Distill-uncensored-heretic-china_uncensored_dpo`, publicada por el usuario Alex500 en Hugging Face. Se presenta como una especialización orientada a programación (con Rust como lenguaje prioritario, además de Python, TypeScript y SQL), razonamiento algorítmico con chain-of-thought, function calling estructurado, orquestación de subagentes y el protocolo MCP (Model Context Protocol). El modelo conserva la naturaleza "uncensored" de su base, es decir, sin alineamiento de rechazo previo.

El modelo base declara una arquitectura híbrida de capas SSM recurrentes tipo Mamba/Gated DeltaNet combinadas con capas de atención completa, con aproximadamente 9.400 millones de parámetros según la model card (el dato real de safetensors del repo es de 8.953.803.264 parámetros). El ajuste se realizó con cuantización NF4, rango LoRA 16, alpha 32 y 29.622.272 parámetros entrenables (aproximadamente el 0,31% del total), sobre un dataset curado de 18.491 pares instrucción-respuesta.

La relevancia de esta ficha es doble: por un lado, documenta un caso de fine-tuning especializado en agentes y tool-use sobre una base de 9B; por otro, sirve como advertencia metodológica, ya que los benchmarks presentados por el autor son autoinformados, con una suite propia de 50 escenarios y puntuaciones absolutas muy bajas (media global de 4,55/10 tras el entrenamiento), lo que limita seriamente su comparabilidad con evaluaciones estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: capas SSM recurrentes (Gated DeltaNet / estilo Mamba) + capas de atención completa tipo transformer |
| Parametros totales | 8.953.803.264 (según safetensors); la model card declara 9,4B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q6_K (~6,85 GB) y Q5_K_M (~6,02 GB); el ajuste se hizo en NF4 4-bit |
| Idiomas soportados | en, pt (según metadatos y model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (427 tensores); el merge intermedio se generó en bfloat16 de 16 bits (~17,9 GB) |

## Arquitectura y entrenamiento

La arquitectura declarada es híbrida: combina capas de estado recurrente (SSM, descritas como Gated DeltaNet o de estilo Mamba) con capas de atención completa. Esta mezcla busca reducir el coste computacional en secuencias largas manteniendo la capacidad de atención global, un patrón que se ha popularizado en modelos de la familia Qwen y en propuestas como Jamba o Zamba. No se especifica el número exacto de capas de cada tipo, la dimensión oculta ni la ventana de contexto efectiva, por lo que estos datos deben considerarse no disponibles.

El entrenamiento consistió en un fine-tuning QLoRA con cuantización NF4 de doble cuantización y cómputo en bfloat16, aplicado a todas las proyecciones (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). Se usaron r=16, alpha=32, dropout 0,05, optimizador AdamW, learning rate 2e-5 con decaimiento coseno, micro-batch 1 con acumulación de 8 pasos (batch efectivo 8) y longitud de secuencia 896 tokens. El dataset consta de 18.491 pares en formato ChatML, distribuidos en cinco dominios: código (5.991 pares, con énfasis en Rust idiomático, Axum, Serde, Tokio), tool-use (4.000 pares), razonamiento CoT (3.500 pares), agentes sintéticos y MCP (3.000 pares) y el resto en otras categorías no detalladas. El proceso reporta 4.290.000+ tokens en 1.000 pasos de optimización, con pérdida de entrenamiento que baja de 1,205 a 0,6185 y pérdida de validación de 0,5857. No se documenta RLHF ni DPO adicional sobre esta iteración, aunque el nombre del modelo base sugiere que este sí pasó por DPO.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y portugués.
- Programación en Rust idiomático (seguridad de memoria, abstracciones de coste cero, async con Tokio, Axum, Serde), Python, TypeScript y SQL.
- Razonamiento paso a paso mediante trazas `<think>...</think>` (chain-of-thought).
- Function calling y tool-use con salida JSON estructurada, validación de esquemas y recuperación de errores.
- Orquestación de agentes autónomos con descomposición de tareas en flujos DAG.
- Soporte declarado del protocolo MCP (Model Context Protocol) y "skills" de agente.
- Modo "uncensored": sin capa de rechazo alineada, lo que implica ausencia de filtros de seguridad integrados.
- No se declaran capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Asistencia a desarrolladores Rust en producción: el modelo se entrenó específicamente con código idiomático de Rust (Axum, Tokio, Serde), por lo que puede emplearse como revisor de PRs o generador de módulos con patrones de concurrencia seguros, aunque requiere validación humana por su baja puntuación en benchmarks propios (6,26/10).
- Generación de esquemas JSON para function calling: útil en pipelines donde se necesita que el modelo emita llamadas a herramientas con parámetros tipados; su puntuación de 5,08/10 en esta categoría indica que funciona mejor como generador de borradores que como fuente de verdad.
- Prototipado de agentes con MCP: para experimentación local con orquestación de subagentes y flujos DAG, sin garantías de robustez en producción.
- Razonamiento matemático y algorítmico asistido: con trazas CoT explícitas para depuración de demostraciones, análisis de complejidad temporal/espacial o diseño de algoritmos sobre grafos.
- Entornos de investigación sobre modelos sin alineamiento: útil para estudiar comportamiento de modelos "uncensored" y comparar con variantes alineadas, siempre en contextos controlados y con revisión ética.
- Generación de documentación técnica y comentarios de código en inglés o portugués, aprovechando el soporte bilingüe declarado.
- Fine-tuning posterior como base de experimentación: al ser un modelo de 9B con licencia Apache 2.0 y pesos GGUF, sirve como punto de partida para ajustes adicionales en dominios concretos.

## Benchmarks y rendimiento

Los únicos datos disponibles son los benchmarks autoinformados por el autor, medidos sobre una suite propia de 50 escenarios con criterios no publicados. No son comparables con MMLU, HumanEval, GSM8K ni con evaluaciones estándar de la industria.

| Categoria (suite propia del autor) | Baseline | Enhanced V1 | Ganancia relativa |
|---|---|---|---|
| MCP y skills | 0,20 / 10 | 2,65 / 10 | +1225,0 % |
| Orquestación multiagente | 0,30 / 10 | 2,67 / 10 | +790,0 % |
| Tool-use y JSON function calling | 1,20 / 10 | 5,08 / 10 | +323,3 % |
| Programación (Rust/Python/TS/SQL) | 3,80 / 10 | 6,26 / 10 | +64,7 % |
| Lógica algorítmica y CoT | 4,10 / 10 | 6,10 / 10 | +48,8 % |
| Media global | 1,92 / 10 | 4,55 / 10 | +137,0 % |

Métricas de entrenamiento reportadas: pérdida inicial 1,205, final 0,6185, validación 0,5857; precisión de predicción de token de 68,97 % a 83,51 %. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7-8 GB para Q6_K (~6,85 GB de pesos más overhead de contexto) y 6,5-7 GB para Q5_K_M (~6,02 GB).
- GPU recomendadas: RTX 4090 (24 GB) o RTX 4080 (16 GB) para Q6_K con contexto amplio; RTX 4070 (12 GB) o RTX 4060 Ti (16 GB) para Q5_K_M; A100/H100 solo justificables para servir múltiples instancias o contextos muy largos.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más usando Q5_K_M, y en 10-12 GB con Q6_K.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con la API de OpenAI (el repo incluye el tag `endpoints_compatible`). vLLM y TGI no están confirmados para esta arquitectura híbrida SSM/atención en formato GGUF.
- Latencia y throughput: no disponibles. La arquitectura híbrida SSM podría ofrecer ventajas en secuencias largas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen 3.8 9B Uncensored Heretic Ch. Enhanced V1 | 8,95B (declarado 9,4B) | no disponible | Apache 2.0 | Fine-tuning QLoRA especializado en Rust, tool-use y MCP; benchmarks propios no estándar |
| Qwen2.5-Coder-7B | 7,6B | 32K (128K con RoPE) | Apache 2.0 | Referencia en código con benchmarks HumanEval/MBPP públicos; sin capacidades de agente MCP específicas |
| Llama 3.1 8B Instruct | 8,0B | 128K | Llama 3.1 Community License | Amplio ecosistema, alineamiento estándar, sin especialización en Rust ni MCP |
| Mistral 7B Instruct | 7,2B | 32K | Apache 2.0 | Base sólida para fine-tuning, sin soporte nativo de tool-use estructurado en todas las versiones |

La comparación directa es difícil porque el modelo evaluado no publica resultados en benchmarks estándar y su base declarada ("Qwen 3.8 9B") no corresponde a una nomenclatura oficial verificable de la familia Qwen, lo que impide confirmar equivalencias con modelos oficiales.

## Limitaciones y advertencias

- Los benchmarks son autoinformados, con una suite propia de 50 escenarios y puntuaciones absolutas bajas (media 4,55/10); no hay validación independiente ni comparación con MMLU, HumanEval o GSM8K.
- El modelo es "uncensored": no incorpora capa de rechazo alineada, lo que supone riesgo de generar contenido dañino, ilegal o sesgado sin filtro. No es apto para aplicaciones de cara al público sin moderación externa.
- Riesgo elevado de alucinación en código y en JSON de tool calling, dado el bajo rendimiento absoluto reportado en esas categorías (5,08/10 y 6,26/10).
- Idiomas limitados a inglés y portugués; no se declara soporte de castellano ni de otros idiomas.
- Longitud de contexto no documentada, lo que impide planificar despliegues con ventanas largas.
- El modelo base no es una versión oficial de Qwen; la nomenclatura "Qwen 3.8" no corresponde a un release público verificable, lo que complica la trazabilidad y el soporte.
- Aunque la licencia es Apache 2.0, la procedencia del modelo base y del dataset de fine-tuning no está auditada; conviene revisar implicaciones legales antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin comunidad ni validación externa.
- No hay garantías de compatibilidad con vLLM o TGI para la arquitectura híbrida SSM/atención.

## Enlaces

- Hugging Face: https://huggingface.co/Alex500/Qwen-3.8-9B-Uncensored-Heretic-Ch-Enhanced-V1-GGUF
- Modelo base: https://huggingface.co/benjamin920101/Qwen3.8-9B-Distill-uncensored-heretic-china_uncensored_dpo
- Repositorio llama.cpp (conversión GGUF): https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- Model Context Protocol: https://modelcontextprotocol.io
- No se han encontrado papers, blogs ni demos adicionales en la información proporcionada.
