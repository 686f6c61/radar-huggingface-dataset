# SanderSyS/Qwen-1000Brains-V12-GGUF

## Resumen

Qwen-1000Brains-V12 es un ajuste fino (fine-tune) del modelo Qwen2.5-Coder-7B-Instruct de Alibaba Cloud, desarrollado por el usuario independiente SanderSyS. Se distribuye principalmente en formato GGUF y está orientado a tareas de razonamiento agéntico, orquestación de subagentes y llamada estricta de herramientas mediante el protocolo MCP (Model Context Protocol). El modelo parte de una arquitectura transformer densa de 7 mil millones de parámetros, con 28 capas, 28 cabezas de atención y una dimensión de embedding de 3584, empleando atención con consultas agrupadas (GQA) con 4 cabezas KV.

El objetivo declarado del autor es eliminar los "saltos prematuros a conclusiones" y las llamadas a funciones alucinadas del modelo base, introduciendo un modo de razonamiento explícito en etiquetas `<think>`, una sintaxis XML estricta para invocaciones de herramientas y un protocolo de orquestación maestro-trabajador. El ajuste se realizó mediante LoRA sobre cuantización NF4 y se combinó con el modelo base mediante WiSE-FT con un factor λ=0,85, preservando un 15% de los pesos originales para mitigar el olvido catastrófico.

La relevancia del modelo radica en su enfoque hacia flujos de trabajo autónomos con múltiples agentes y su énfasis en la precisión sintáctica de las llamadas a herramientas, un punto débil frecuente en modelos de código de tamaño medio. Está optimizado para inglés y portugués de Brasil, con soporte adicional para código.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (base Qwen2.5-Coder-7B-Instruct) |
| Parámetros totales | 7 mil millones (7B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el entrenamiento usó secuencias de 8192 tokens con RoPE escalado) |
| Tipos de cuantización | GGUF Q6_K y Q5_K_M (publicados); entrenamiento base en NF4 |
| Idiomas soportados | Inglés (en), portugués (pt), código |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivos Q6_K y Q5_K_M), además de preset JSON y gramática GBNF |
| Capas | 28 |
| Cabezas de atención | 28 (4 cabezas KV por GQA) |
| Dimensión de embedding | 3584 |
| Tamaño Q6_K | 7,36 GB |
| Tamaño Q5_K_M | 6,49 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-Coder-7B-Instruct, con 28 capas, 28 cabezas de atención, dimensión de embedding de 3584 y atención con consultas agrupadas (GQA) de 4 cabezas KV. El ajuste fino se realizó con LoRA sobre cuantización 4-bit NormalFloat4 (NF4) con doble cuantización mediante BitsAndBytes. La configuración de LoRA emplea rango r=64, alpha=128 (factor de escala efectivo 2,0), dropout de 0,05 y módulos objetivo que cubren todas las proyecciones lineales (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj). El entrenamiento usó el optimizador Paged AdamW de 8 bits, tasa de aprendizaje de 2,0×10⁻⁴ con decaimiento coseno, calentamiento lineal del 5%, acumulación de gradiente de 2 y longitud efectiva de secuencia de 8192 tokens con RoPE escalado. Se completaron 130 pasos con una pérdida final de 0,4877.

La innovación técnica principal es la combinación en el espacio de pesos mediante WiSE-FT, que interpola los pesos ajustados con los originales según θ_desplegado = 0,85·θ_ajustado + 0,15·θ_base. Esto preserva parte del conocimiento del modelo fundacional y reduce el riesgo de colapso de representación. El corpus de entrenamiento se sintetizó mediante un pipeline dual de agentes creador y crítico implementado en Rust, con un umbral de selección de 9,70/10,00 y una calidad media auditada de 9,98/10,00 sobre 130 muestras multiturno. Los dominios cubiertos incluyen programación de sistemas y concurrencia en Rust, enrutamiento autónomo de herramientas en diez categorías MCP (sistema de archivos, ingeniería inversa, descubrimiento web, telemetría de procesos), descomposición de tareas complejas y gramática de salida estricta que separa los tokens de pensamiento de las invocaciones de herramientas.

## Capacidades

- Generación de texto y código con razonamiento explícito previo en bloques `<think>...</think>`.
- Razonamiento de cadena larga (long-CoT) con generación de hipótesis, análisis de compromisos arquitectónicos y pruebas de casos límite antes de emitir código.
- Llamada estricta de herramientas con sintaxis XML (`<tool_call>...<function=...><parameter=...>...</function></tool_call>`), diseñada para parsers de servidores MCP y runtimes autónomos.
- Orquestación maestro-trabajador: capacidad de actuar como orquestador que delega tareas a subagentes (`researcher`, `code-smith`, `critic`) con contratos JSON validados.
- Soporte de gramática GBNF para restringir la salida a la sintaxis de llamada de herramientas.
- Capacidades multilingües en inglés y portugués de Brasil, con foco en ingeniería de alta precisión.
- Programación de sistemas, especialmente Rust, incluyendo seguridad de memoria, sockets e IPC.
- Composición de múltiples herramientas en diez categorías de dominio MCP.
- Descomposición de tareas vagas en hitos verificables por fases con pasos de contingencia autorreparables.

## Casos de uso

- Orquestación de agentes autónomos: el modelo puede actuar como planificador maestro que divide una tarea compleja en subtareas y las delega a subagentes especializados con contratos JSON validados, gracias a su protocolo de orquestación nativo y a su razonamiento en `<think>` previo a cada decisión.
- Integración con servidores MCP: la sintaxis XML estricta de `<tool_call>` evita los errores de parseo habituales de los bloques JSON envueltos en Markdown, lo que lo hace adecuado para runtimes que consumen herramientas mediante Model Context Protocol.
- Generación de código en Rust para sistemas concurrentes: el ajuste se entrenó específicamente en programación de sistemas, seguridad de memoria, sockets e IPC, por lo que es apropiado para tareas de bajo nivel donde los casos límite de concurrencia son críticos.
- Automatización de ingeniería inversa y telemetría: al cubrir categorías MCP de ingeniería inversa y telemetría de procesos, puede integrarse en pipelines que inspeccionan binarios o monitorizan procesos de forma autónoma.
- Asistente de desarrollo con verificación previa: el modo `<think>` permite que el modelo formule pruebas de frontera y evalúe condiciones de carrera antes de proponer una implementación, útil en revisiones de código automatizadas.
- Atención técnica en portugués de Brasil: al estar optimizado para PT-BR e inglés, puede gestionar consultas técnicas y de ingeniería en esos idiomas con mayor precisión que el modelo base.
- Despliegue en local con recursos limitados: las cuantizaciones Q5_K_M (6,49 GB) y Q6_K (7,36 GB) permiten ejecutarlo en GPUs de consumo con 8-12 GB de VRAM, habilitando flujos agénticos soberanos sin dependencia de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye una comparación cualitativa frente al modelo base en seis dimensiones (arquitectura de razonamiento, fidelidad de llamada de herramientas, orquestación de enjambre, olvido catastrófico, resiliencia ante casos límite e idiomas), sin cifras numéricas de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM estimada para Q6_K (7,36 GB): al menos 12 GB; recomendado para RTX 3060 de 12 GB, RTX 4070 o RTX 4080.
- VRAM estimada para Q5_K_M (6,49 GB): al menos 8 GB; recomendado para RTX 3070, RTX 4060 Ti o RTX 4070.
- Cabe en GPUs de consumo: sí, en modelos con 8 GB o más de VRAM según la cuantización elegida.
- Opciones de despliegue: llama.cpp y LM Studio (el autor publica un preset oficial `preset_1000brains_v12.json` para LM Studio); el formato GGUF es compatible con Ollama y otros runtimes basados en llama.cpp. No se menciona soporte específico para vLLM o TGI.
- Gramática GBNF incluida (`tool_call.gbnf`, 497 B) para restringir la salida a la sintaxis de llamada de herramientas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-1000Brains-V12 | 7B | No disponible | Razonamiento agéntico, MCP, orquestación | Apache 2.0 | GGUF en Hugging Face |
| Qwen2.5-Coder-7B-Instruct (base) | 7B | No disponible en esta ficha | Generación de código directa | Apache 2.0 | Pesos originales en Hugging Face |
| Alternativas de 7B orientadas a agentes | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación cuantitativa con otras alternativas de la misma categoría no está disponible en la información proporcionada. La única comparación documentada es cualitativa frente al modelo base, en la que el ajuste declara mejoras en fidelidad de llamada de herramientas, orquestación multiagente y resiliencia ante casos límite, a costa de un modo de razonamiento más verboso.

## Limitaciones y advertencias

- El conjunto de entrenamiento es muy reducido (130 muestras multiturno), lo que limita la generalización y aumenta el riesgo de sobreajuste a los dominios concretos cubiertos (Rust, MCP, descomposición de tareas).
- El modelo está optimizado para inglés y portugués de Brasil; el rendimiento en castellano y otros idiomas no está documentado y probablemente sea inferior.
- La longitud de contexto efectiva no se especifica en la model card; el entrenamiento usó 8192 tokens, por lo que contextos mayores podrían degradar la calidad.
- El modo `<think>` incrementa la longitud de las respuestas y el consumo de tokens, lo que afecta a la latencia y al coste en producción.
- Riesgo de alucinación en llamadas a herramientas no cubiertas por las diez categorías MCP entrenadas, a pesar del énfasis en la sintaxis estricta.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y con documentación de evaluación limitada; se recomienda validación propia antes de desplegarlo en producción.
- No se han publicado benchmarks cuantitativos que respalden las afirmaciones cualitativas de la model card.
- El modelo tiene cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SanderSyS/Qwen-1000Brains-V12-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
