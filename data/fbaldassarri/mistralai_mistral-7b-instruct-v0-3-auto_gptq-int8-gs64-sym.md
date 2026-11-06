# fbaldassarri/mistralai_Mistral-7B-Instruct-v0.3-auto_gptq-int8-gs64-sym

## Resumen

Este repositorio contiene una versión cuantizada a INT8 del modelo `mistralai/Mistral-7B-Instruct-v0.3`, publicada por el usuario fbaldassarri. No se trata de un modelo nuevo, sino de un artefacto de cuantización de solo pesos (weights-only quantization, WoQ) generado con la herramienta Intel AutoRound v0.16.0 y el algoritmo GPTQ (AutoGPTQ) como formato de salida. El objetivo es reducir el coste de memoria y acelerar la inferencia del modelo original manteniendo una fidelidad razonable respecto a los pesos en bfloat16.

La relevancia de este artefacto es acotada: está pensado específicamente para despliegue en hardware Intel (CPU, iGPU Arc mediante intel-extension-for-pytorch y NPU AI Boost de la serie Core Ultra vía OpenVINO), según declara el propio autor en la model card. Para el resto de plataformas (NVIDIA, AMD, Apple Silicon) existen alternativas de cuantización más maduras y mejor soportadas por el ecosistema, por lo que su interés práctico queda limitado a entornos Intel.

El modelo base, Mistral 7B Instruct v0.3, es un transformer causal decoder-only de 7.248 millones de parámetros con ventana de contexto de 32.768 tokens, licencia Apache 2.0 y capacidades de instrucción y tool calling. Esta versión cuantizada hereda esas características, aunque el autor no documenta evaluaciones de degradación por cuantización ni benchmarks comparativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (familia Mistral), cuantizado con GPTQ/INT8 |
| Parametros totales | 7.248 millones (modelo base); el checkpoint safetensors del repo declara 2.151.092.224 elementos almacenados por la cuantización INT8 con group size 64 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredado de Mistral-7B-Instruct-v0.3) |
| Tipos de cuantizacion | INT8, group size 64, simétrica, weights-only (WoQ), formato AutoGPTQ |
| Idiomas soportados | English (declarado en la model card; el modelo base tiene capacidades multilingües no documentadas oficialmente) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint AutoGPTQ), cargable con transformers |

## Arquitectura y entrenamiento

El modelo base Mistral-7B-Instruct-v0.3 es un transformer decoder-only con atención de ventana deslizante (sliding window attention), activación SwiGLU, RMSNorm y RoPE, con 32 capas y dimensión oculta de 4096. Fue entrenado por Mistral AI sobre un corpus no detallado públicamente y posteriormente ajustado por instrucciones y preferencias; la versión v0.3 amplía el contexto a 32.768 tokens e incorpora soporte de tool calling con tokens especiales.

Sobre esta base, el autor aplica una cuantización de solo pesos mediante Intel AutoRound v0.16.0, que combina la formulación GPTQ con búsqueda de escalas y redondeo optimizado. Los parámetros de calibración registrados son: 128 muestras de calibración, 200 iteraciones de ajuste, longitud de secuencia 512, batch size 4 y dispositivo de calibración CPU con `torch.bfloat16` como dtype de carga. El proceso de cuantización declarado tardó 40.245,1 segundos (aproximadamente 670,8 minutos) y finalizó el 2026-10-13. No se documenta ningún ajuste fino adicional, RLHF ni evaluación de calidad posterior a la cuantización.

## Capacidades

- Generación de texto conversacional y de instrucciones, con plantilla de chat propia que debe aplicarse mediante `apply_chat_template`.
- Razonamiento general y respuesta a preguntas en inglés.
- Generación de código y resolución de problemas matemáticos básicos, heredados del modelo base.
- Soporte de tool calling y function calling, incorporado en Mistral-7B-Instruct-v0.3 mediante tokens especiales de llamada a herramientas.
- Capacidad de razonamiento multi-paso y uso en pipelines de agentes, condicionada a la fidelidad de la cuantización INT8.
- Ventana de contexto de 32.768 tokens para conversaciones y documentos largos.
- Capacidades multilingües limitadas: la model card solo declara inglés y no se han publicado evaluaciones de esta versión cuantizada en otros idiomas.
- No incluye visión, audio ni modo de pensamiento extendido.

## Casos de uso

- Despliegue en CPU Intel para servicios de generación de texto de bajo volumen: la cuantización INT8 con AutoGPTQ y el soporte de intel-extension-for-pytorch permiten ejecutar el modelo sin GPU dedicada, reduciendo el coste de infraestructura en entornos con hardware Intel.
- Inferencia en iGPU Intel Arc: el autor indica compatibilidad con iGPU Arc (por ejemplo, Core Ultra 185H), lo que habilita prototipos de asistentes locales en portátiles y mini-PC sin GPU discreta.
- Ejecución en NPU Intel AI Boost (Core Ultra): mediante OpenVINO, el modelo puede integrarse en aplicaciones de escritorio con aceleración por NPU, útil para asistentes offline con requisitos de privacidad.
- Asistente conversacional multi-turno: con 32.768 tokens de contexto, puede gestionar hilos de conversación largos o resumir documentos extensos en una sola pasada, siempre que el rendimiento INT8 sea aceptable para el caso.
- Generación de código asistida en entornos de desarrollo con hardware Intel: integrable en plugins de IDE o pipelines de CI/CD que ya dispongan de CPU Intel y no puedan asumir el coste de una GPU.
- Automatización de tareas con tool calling: el modelo puede invocar funciones externas (APIs, consultas a bases de datos) en flujos de agentes, aprovechando el soporte nativo de la versión v0.3.
- Evaluación comparativa de técnicas de cuantización: útil como artefacto de referencia para investigadores que comparen AutoRound/GPTQ INT8 frente a otras cuantizaciones (AWQ, GGUF) sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de perplejidad, MMLU, HumanEval, GSM8K ni comparaciones de degradación respecto al modelo en bfloat16. Tampoco se documentan latencias ni throughput medidos en los dispositivos Intel mencionados.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 8,4 GB, por lo que se necesita al menos ese espacio en memoria para cargar los pesos INT8. En la práctica, con overhead de activaciones y caché KV para contextos largos, conviene disponer de 10-12 GB de RAM o memoria unificada.
- GPU recomendadas: el autor orienta el artefacto a CPU Intel, iGPU Arc y NPU Intel AI Boost. No se documenta soporte verificado en GPU NVIDIA o AMD, aunque el formato AutoGPTQ es teóricamente portable con las librerías adecuadas.
- ¿Cabe en GPU consumer? Por tamaño (8,4 GB) cabría en GPUs con 12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4090), pero el autor no valida este escenario y la cuantización está calibrada para CPU.
- Opciones de despliegue: transformers con AutoGPTQ, intel-extension-for-pytorch (CPU/iGPU), OpenVINO (NPU). No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. El autor no publica mediciones en ninguno de los dispositivos objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fbaldassarri/mistralai_Mistral-7B-Instruct-v0.3-auto_gptq-int8-gs64-sym | 7,2B (INT8) | 32.768 | AutoGPTQ INT8 gs64 simetrica | Apache 2.0 | Hugging Face, 19 descargas |
| mistralai/Mistral-7B-Instruct-v0.3 (original) | 7,2B (bf16/fp16) | 32.768 | ninguna | Apache 2.0 | Hugging Face, ampliamente adoptado |
| Mistral-7B-Instruct-v0.2 | 7,2B | 32.768 | ninguna | Apache 2.0 | Hugging Face |
| Mistral-7B-v0.1 (base) | 7,2B | 8.192 | ninguna | Apache 2.0 | Hugging Face |

La comparación relevante es contra el modelo original en bfloat16: esta versión INT8 reduce el espacio en disco y memoria a costa de una posible degradación de calidad no cuantificada. Frente a otras cuantizaciones del mismo modelo base (AWQ, GGUF Q4/Q8), el interés diferencial es su calibración para hardware Intel, no una ventaja de rendimiento demostrada.

## Limitaciones y advertencias

- No se han publicado evaluaciones de degradación por cuantización: se desconoce la pérdida de calidad en razonamiento, código y tool calling respecto al modelo en bfloat16.
- El autor declara explícitamente que el modelo se ha desarrollado solo con fines de investigación y se entrega sin garantía.
- La model card solo declara inglés; el comportamiento en castellano u otros idiomas no está evaluado en esta versión cuantizada.
- Riesgo de alucinación inherente al modelo base, no mitigado ni medido tras la cuantización.
- Sesgos del corpus de entrenamiento de Mistral AI no documentados ni auditados en esta versión.
- La cuantización está calibrada en CPU con 128 muestras; el rendimiento en GPU u otros aceleradores no está validado por el autor.
- Licencia Apache 2.0 permite uso comercial, pero el disclaimer del autor restringe la finalidad a investigación; conviene revisar esta ambigüedad antes de un despliegue en producción.
- Repositorio con muy baja adopción (19 descargas, 0 likes) y sin mantenimiento documentado; no hay issues ni discusiones que permitan evaluar su fiabilidad.
- El campo `inference: false` en los metadatos de la model card indica que el autor no garantiza que el pipeline de inferencia estándar de Hugging Face funcione sin configuración adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fbaldassarri/mistralai_Mistral-7B-Instruct-v0.3-auto_gptq-int8-gs64-sym
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Intel AutoRound (repositorio): https://github.com/intel/auto-round
- Pipeline de replicación citado por el autor: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
