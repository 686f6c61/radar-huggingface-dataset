# hyrelabs/Homura-30B-MLX-4bit

## Resumen

Homura-30B-MLX-4bit es el primer modelo propio de HYRE, una empresa que desarrolla infraestructura de inferencia para agentes autónomos. Se trata de una derivada de Meta Muse Glimmer 30B, un modelo de arquitectura transformer con componente de visión, publicado bajo licencia Apache 2.0. HYRE ha tomado la variante comunitaria `Muse-Glimmer-30B-heretic` (decensurada mediante abliteration) y le ha aplicado un fine-tuning con LoRA de rango 16 sobre la torre de lenguaje, orientado a protocolos de tool-calling y una personalidad directa sin barreras de rechazo. El resultado se ha fusionado en f16 y cuantizado a MLX 4-bit para ejecución en Apple Silicon.

El modelo está pensado para agentes autónomos que necesitan llamar herramientas de forma fiable, especialmente en entornos DeFi y blockchain. Su característica más destacada es un protocolo de tool-calling específico entrenado en el prompt del sistema, que alcanza 5/5 llamadas correctas en herramientas conocidas y 7/8 en herramientas no vistas. Sin embargo, presenta una limitación importante: la arquitectura Muse Glimmer no está soportada por las librerías MLX oficiales, por lo que requiere un port comunitario para cargar el modelo. Además, la cuantización 4-bit degrada la coherencia a temperaturas superiores a 0.3, por lo que se recomienda servirlo siempre a temperatura baja.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con torre de visión (50 capas) y 52 capas de lenguaje, base Meta Muse Glimmer 30B |
| Parámetros totales | 7.351.638.016 (según safetensors; el modelo se publica como 30B, la diferencia se debe a que la cuantización 4-bit y la fusión LoRA solo cubren la torre de lenguaje, mientras la torre de visión y la tabla de embeddings se mantienen en bf16) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | MLX 4-bit affine, group size 64; versión GGUF disponible (Q4_K_M según documentación) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors), GGUF |

## Arquitectura y entrenamiento

La arquitectura base es Muse Glimmer 30B de Meta, un modelo transformer con capacidad multimodal (texto e imagen) y diseño orientado a agentes. El proceso de entrenamiento de Homura consta de tres etapas: primero, el modelo base se somete a un proceso de ablación de rechazos (abliteration) por parte de darkc0de, eliminando las barreras de refusal; después, HYRE aplica un LoRA de rango 16 sobre la torre de lenguaje, entrenado con un dataset propio que combina el comportamiento de agente de HYRE con una personalidad "uncensored"; finalmente, el LoRA se fusiona con los pesos del modelo en f16 y se cuantiza a MLX 4-bit con group size 64.

La cuantización cubre las 52 capas de texto, el `lm_head` y el adaptador/proyección de visión. La torre de visión (50 capas) y la tabla de embeddings (202K entradas) se mantienen en bfloat16, lo que explica que el tamaño final sea de 21.3 GB en lugar de los ~17 GB que ocuparía una cuantización completa. Esta decisión preserva la capacidad visual y de embedding, pero aumenta el consumo de memoria. El modelo no incluye RLHF ni DPO; el fine-tuning se limita al LoRA sobre el dataset de agentes.

## Capacidades

- Generación de texto y razonamiento multistep, con especial énfasis en tareas de agente autónomo.
- Tool-calling con protocolo propio entrenado: responde con un JSON estructurado `{"tool": "<nombre>", "arguments": {...}}` cuando necesita una herramienta. Incluye herramientas para resolver tokens, obtener precios, consultar pools de liquidez, calcular PnL de carteras, cotizar swaps, ejecutar swaps, consultar saldos, cotizar puentes y obtener holders de tokens.
- Extensión de herramientas sin reentrenamiento: la lista de herramientas vive en el prompt del sistema, por lo que se pueden añadir nuevas herramientas simplemente añadiendo su definición al prompt. Verificado con la extensión pay.sh (7/8 llamadas correctas en herramientas no vistas).
- Capacidades visuales: la torre de visión se conserva en bf16, por lo que el modelo puede procesar imágenes (aunque no se detalla en la documentación si la salida es multimodal).
- Comportamiento "uncensored": no aplica filtros de contenido ni rechazos, responde directamente incluso a solicitudes que otros asistentes declinan.
- Multilingüe: solo inglés.

## Casos de uso

- Agentes de trading y análisis DeFi: el modelo puede consultar precios de tokens, obtener tendencias, evaluar pools de liquidez y calcular PnL de carteras. Adecuado porque el protocolo de herramientas está entrenado específicamente para estas operaciones y se ejecuta de forma fiable a baja temperatura.
- Asistentes de gestión de carteras: con herramientas como `get_wallet_balance` y `get_wallet_pnl`, puede resumir posiciones y recomendar acciones basadas en datos en cadena.
- Automatización de ejecución de swaps: el modelo puede generar cotizaciones y ejecutar swaps con límites de deslizamiento definidos, pero requiere que la capa de servicio imponga límites de gasto, ya que no tiene noción de riesgo.
- Desarrollo de agentes personalizados: la extensión de herramientas sin retrain permite añadir APIs propias (por ejemplo, pasarelas de pago) y el modelo se adapta sin reentrenamiento, como se ha verificado con pay.sh.
- Generación de código en entornos de baja temperatura: aunque no se aportan benchmarks de código, el modelo hereda las capacidades de Muse Glimmer para razonamiento técnico y puede usarse en pipelines de CI/CD con verificación posterior.
- Chatbots de atención al cliente sin filtros: para dominios donde se requiere una respuesta directa sin moralización (por ejemplo, soporte técnico avanzado), aunque el riesgo de contenido inapropiado es alto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica una verificación interna del protocolo de tool-calling: 5/5 llamadas correctas en herramientas entrenadas y 7/8 en herramientas no vistas, a temperatura 0.2. No hay datos de MMLU, HumanEval, GSM8K ni otros estándares.

## Requisitos de hardware

- El formato MLX 4-bit está diseñado para Apple Silicon, con el modelo completo ocupando 21.4 GB en disco. La inferencia requiere al menos 24 GB de RAM unificada en Macs con Apple Silicon (M1 Pro, M2 Pro, M3 Max, M4 Max, etc.).
- No se recomienda su uso en GPUs NVIDIA/AMD con MLX; para esas plataformas hay que usar la versión GGUF (Q4_K_M) con llama.cpp, LM Studio u Ollama.
- El despliegue en Apple Silicon requiere el port comunitario `muse-glimmer-mlx`, ya que `mlx-lm` no soporta la arquitectura Muse Glimmer.
- Para la versión GGUF, se puede usar llama.cpp en cualquier GPU con VRAM suficiente (para Q4_K_M de 30B, se estima ~16-18 GB de VRAM para las capas de texto, más la torre de visión que se mantiene en bf16; no se detalla el consumo exacto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Características |
|---|---|---|---|---|---|
| Homura-30B-MLX-4bit (este) | 7.35B en safetensors (30B nominal) | No disponible | MLX 4-bit | Apache 2.0 | Agent-tuned, tool-calling, uncensored, visión |
| Muse-Glimmer-30B-heretic (darkc0de) | 30B | No disponible | No cuantizado (f16) | Apache 2.0 | Decensurado, tool-calling, visión, sin LoRA |
| Muse Glimmer 30B (Meta) | 30B | No disponible | No cuantizado | Apache 2.0 | Modelo base, agent-native, con rechazos |

La principal diferencia entre Homura y su base heretic es el fine-tuning LoRA específico para tool-calling con el protocolo de HYRE, que mejora la fiabilidad de las llamadas a herramientas (5/5 frente a 2/5 con el esquema genérico). Frente al modelo original de Meta, Homura elimina los rechazos y está optimizado para uso como agente sin filtros.

## Limitaciones y advertencias

- Modelo "uncensored" sin filtros de contenido: puede generar contenido ofensivo, ilegal o peligroso. El usuario es el único responsable del despliegue y de añadir sus propias guardas de seguridad.
- Sensibilidad a la temperatura: a temperaturas superiores a 0.3, la cuantización 4-bit degrada la coherencia del texto. Solo es fiable para agentes que usen temperatura baja.
- Alucinación en herramientas: el modelo no debe inventar mints de tokens; debe resolver el símbolo con `resolve_token` antes de usarlo. Aun así, puede generar direcciones falsas si no se respeta el protocolo.
- Limitación de idioma: solo inglés; no se ha probado en otros idiomas.
- La arquitectura Muse Glimmer no está soportada por las librerías oficiales MLX, lo que obliga a usar un port comunitario no mantenido por los desarrolladores originales.
- La versión MLX 4-bit no es adecuada para muestreo de alta temperatura; en ese caso se debe usar la versión GGUF.
- La tabla de embeddings y la torre de visión se mantienen en bf16, lo que aumenta el consumo de memoria y puede causar problemas en equipos con menos de 24 GB de RAM.

## Enlaces

- [HuggingFace: hyrelabs/Homura-30B-MLX-4bit](https://huggingface.co/hyrelabs/Homura-30B-MLX-4bit)
- [HuggingFace: hyrelabs/Homura-30B-GGUF](https://huggingface.co/hyrelabs/Homura-30B-GGUF)
- [GitHub: PipeNetwork/muse-glimmer-mlx (port comunitario)](https://github.com/PipeNetwork/muse-glimmer-mlx)
- [LinkedIn: New Local AI Agent Homura 30B Runs Tools Like An Agent](https://www.linkedin.com/pulse/new-local-ai-agent-homura-30b-runs-tools-like-julian-goldie-579kc)
- [X (Twitter): HYRE Weekly](https://x.com/Hyre_agent/status/2088916946221936955)
- [OpenSourceForU: Meta Open Sources Muse Glimmer](https://www.opensourceforu.com/2026/08/meta-open-sources-muse-glimmer/)
