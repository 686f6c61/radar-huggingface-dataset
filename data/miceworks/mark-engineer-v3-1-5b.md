# miceworks/Mark-Engineer-V3-1.5B

## Resumen

Mark-Engineer-V3-1.5B es un modelo publicado por el usuario miceworks en HuggingFace bajo el identificador `miceworks/Mark-Engineer-V3-1.5B`. Se trata de una **base arquitectónica** de tipo Mixture of Experts (MoE) con arquitectura `deepseek2`, 1.520.496.960 parámetros físicos totales y 405.729.600 parámetros activos por token. El autor indica explícitamente en la model card que el modelo está **sin entrenar** ("Architectural Base / Untrained / Weight Initialization via He/Xavier + Hadamard Fusion"), es decir, los pesos corresponden a una inicialización, no a un proceso de preentrenamiento con datos.

El modelo emplea Multi-Head Latent Attention (MLA) con `q_lora_rank=512` y `kv_lora_rank=256`, 18 capas transformer, dimensión oculta de 1280, 20 cabezas de atención de query, 32 expertos enrutados más 2 compartidos, con 4 expertos activos por token y tamaño intermedio MoE de 576. La ventana de contexto declarada es de 32768 tokens y el vocabulario de 32032 entradas.

Su relevancia es limitada en términos prácticos: al no estar entrenado, no produce texto coherente ni puede usarse como asistente. Resulta útil únicamente como esqueleto para preentrenamiento o ajuste fino, o como referencia de implementación de una arquitectura MoE tipo DeepSeek2 en formato GGUF cuantizado IQ4_NL. El repositorio ocupa 0,9 GB y el archivo GGUF principal pesa 816,03 MB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `deepseek2` (transformer MoE con Multi-Head Latent Attention) |
| Parametros totales | 1.520.496.960 (1,52B) |
| Parametros activos | 405.729.600 (405,73M) por token |
| Longitud de contexto | 32768 tokens |
| Tipos de cuantizacion | IQ4_NL (4 bits no lineal, pesos); normas y bias en FP32 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`mark_engineer_v3_1_5b_iq4_nl.gguf`) |

Otros datos técnicos declarados por el autor: dimensión oculta 1280, 18 capas, 20 cabezas de query, `q_lora_rank=512`, `kv_lora_rank=256`, 32 expertos enrutados, 2 expertos compartidos, 4 expertos activos por token, tamaño intermedio MoE 576, vocabulario 32032, 327 tensores totales (236 en IQ4_NL y 91 en FP32). Checksum SHA-256 del GGUF: `62b8bd003adcd0780a967faca7163f98e79334809fae2effea5e7f55d4c9bfe4`.

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con atención latente multi-cabeza (MLA), el mismo esquema empleado en la familia DeepSeek-V2. La MLA comprime las proyecciones de query y key/value en representaciones latentes de rango 512 y 256 respectivamente, lo que reduce el coste de memoria del KV cache frente a atención multi-cabeza estándar. El bloque MoE combina 32 expertos enrutados con 2 expertos compartidos, activando 4 expertos enrutados por token, con un tamaño intermedio por experto de 576. El modelo tiene 18 capas y una dimensión oculta de 1280, lo que da lugar a los 1,52B parámetros físicos y a los ~406M activos por token.

**No hay entrenamiento documentado.** El autor declara el estado como "Architectural Base / Untrained / Weight Initialization via He/Xavier + Hadamard Fusion (Ready for Pre-training or Fine-Tuning)". Esto implica que los pesos se generaron mediante inicialización He/Xavier combinada con una fusión Hadamard, sin exposición a corpus de texto, sin RLHF, sin DPO y sin ajuste por instrucciones. No se especifican número de tokens de entrenamiento, composición del dataset ni innovaciones de decodificación (decodificación especulativa, atención lineal, etc.). La única innovación técnica reseñable es el empaquetado IQ4_NL descrito: bloques de 18 bytes por cada 32 pesos (2 bytes de escala FP16 + 16 bytes mapeados a la tabla no lineal `kvalues_iq4nl`), con normas y bias del router preservados en FP32.

## Capacidades

- **Generación de texto:** no disponible en la práctica; al no estar entrenado, el modelo no produce texto coherente.
- **Razonamiento, código y matemáticas:** no disponibles; no hay evidencia de capacidades emergentes sin preentrenamiento.
- **Tool calling / function calling:** no documentado.
- **Agentes y razonamiento multi-paso:** no documentado.
- **Capacidades multilingües:** no disponibles; el vocabulario de 32032 entradas no viene acompañado de información sobre cobertura lingüística.
- **Modo thinking:** la plantilla de Ollama incluida en la model card abre un bloque `<think>` tras el turno del asistente, pero al no haber entrenamiento no hay garantía de que el modelo lo utilice de forma significativa.
- **Capacidades especiales (visión, audio):** no disponibles.
- **Compatibilidad de despliegue:** el autor declara compatibilidad con endpoints OpenAI a través de `llama-server` y con llama.cpp, Ollama y llama-cpp-python.

## Casos de uso

- **Preentrenamiento desde cero o continuación:** el uso principal declarado por el autor. Sirve como inicialización para entrenar un MoE de ~1,5B con ~406M activos, aprovechando la arquitectura DeepSeek2 y la ventana de 32768 tokens.
- **Ajuste fino supervisado (SFT) sobre tareas de ingeniería:** dado el nombre "Mark-Engineer" y el ejemplo de prompt de la model card ("Explain lock-free atomic CAS loops"), el destino previsto parece ser un asistente de ingeniería de software; requeriría un corpus de instrucciones técnicas antes de ser útil.
- **Banco de pruebas de cuantización IQ4_NL:** el GGUF permite validar pipelines de cuantización no lineal de 4 bits con normas en FP32 y comparar calidad frente a Q4_K_M u otras variantes en un modelo de tamaño manejable.
- **Prototipado de infraestructura de inferencia MoE:** útil para medir latencia y throughput de un MoE con 4 expertos activos por token en llama.cpp, Ollama o llama-server antes de escalar a modelos mayores con la misma topología.
- **Validación de plantillas de chat y endpoints compatibles con OpenAI:** la model card incluye plantilla ChatML (`<|im_start|>` / `<|im_end|>`) y ejemplo de `llama-server`, lo que permite probar integraciones de cliente sin depender de un modelo entrenado.
- **Investigación sobre inicialización de pesos:** la combinación He/Xavier + Hadamard Fusion documentada puede estudiarse como punto de partida para analizar estabilidad de entrenamiento en MoE con MLA.
- **Docencia y reproducción de arquitecturas DeepSeek2:** un modelo de 1,5B con MLA y MoE es manejable para explicar el diseño en cursos o artículos sin requerir hardware de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta MMLU, HumanEval, GSM8K ni ninguna otra métrica, lo cual es coherente con el estado "Untrained" del modelo.

## Requisitos de hardware

- **VRAM estimada para inferencia:** el GGUF IQ4_NL pesa 816,03 MB; con overhead de contexto (32768 tokens) y buffers de llama.cpp, se puede ejecutar en GPUs con 2-4 GB de VRAM. En CPU funciona con 8 hilos según el ejemplo de `llama-cpp-python` de la model card.
- **GPU recomendadas:** cualquier GPU consumer moderna es suficiente (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090). Para entrenamiento o fine-tuning, el requisito es mayor: al tratarse de una base de 1,52B parámetros, el ajuste fino completo requeriría del orden de 12-24 GB en FP16/BF16 con optimizador, o menos con LoRA/QLoRA.
- **¿Cabe en consumer GPU?** Sí, con holgura en cualquier GPU con 4 GB o más para inferencia cuantizada.
- **Opciones de despliegue:** llama.cpp (`llama-cli`, `llama-server`), Ollama (vía `Modelfile`), llama-cpp-python. No se documenta soporte para vLLM ni TGI en la información disponible.
- **Latencia y throughput:** no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

La comparación es problemática porque el modelo no está entrenado; se compara a nivel arquitectónico con MoE pequeños de referencia.

| Modelo | Parámetros totales | Activos | Contexto | Entrenado | Licencia |
|---|---|---|---|---|---|
| Mark-Engineer-V3-1.5B | 1,52B | 405,73M | 32768 | No (base sin entrenar) | no disponible |
| DeepSeek-V2-Lite | 15,7B (aprox., dato de referencia externa) | 2,4B (aprox.) | 32768 (aprox.) | Sí | DeepSeek License |
| Qwen1.5-MoE-A2.7B | 14,3B (aprox.) | 2,7B (aprox.) | 32768 (aprox.) | Sí | Apache 2.0 (aprox.) |

Nota: los datos de DeepSeek-V2-Lite y Qwen1.5-MoE-A2.7B son referencias externas de conocimiento general y no provienen de la información proporcionada; se incluyen solo como orientación de categoría. Mark-Engineer-V3-1.5B es sustancialmente más pequeño y, a diferencia de los otros, no está entrenado, por lo que no es funcionalmente comparable en calidad de salida.

## Limitaciones y advertencias

- **Modelo sin entrenar:** es la limitación principal. Los pesos son una inicialización He/Xavier + Hadamard Fusion; no ha visto datos y no genera texto coherente. No debe desplegarse en producción como asistente.
- **Sin benchmarks:** no hay evidencia empírica de rendimiento en ninguna tarea.
- **Licencia no disponible:** no se especifica licencia en la información proporcionada, lo que impide determinar si el uso comercial está permitido. Verificar en el repositorio antes de cualquier uso.
- **Idiomas no documentados:** se desconoce la cobertura lingüística del vocabulario y de la plantilla.
- **Sesgos:** no evaluables al no existir entrenamiento; cualquier sesgo aparecerá tras el preentrenamiento o fine-tuning que realice el usuario.
- **Riesgo de alucinación:** no aplica en el estado actual (no genera contenido factual), pero será responsabilidad del usuario evaluarlo tras entrenar.
- **Repositorio con 0 descargas y 0 likes:** sin validación comunitaria; no hay issues, discusiones ni reportes de terceros.
- **Fecha de creación declarada 2026-11-01:** inusualmente futura respecto a la fecha habitual de publicación; conviene verificar la autenticidad y procedencia del repositorio.
- **Compatibilidad GGUF:** el uso de IQ4_NL requiere versiones recientes de llama.cpp/Ollama que soporten esta cuantización; versiones antiguas pueden fallar al cargar el archivo.
- **Caveat de producción:** incluso tras un fine-tuning, la ventana de 32768 tokens y el vocabulario de 32032 entradas son modestos frente a modelos actuales; validar el comportamiento en contextos largos antes de desplegar.

## Enlaces

- HuggingFace: https://huggingface.co/miceworks/Mark-Engineer-V3-1.5B
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
