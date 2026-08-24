# snowman0919/qwen38-executor-27b-checkpoints-v2

## Resumen

El modelo `snowman0919/qwen38-executor-27b-checkpoints-v2` es un adaptador QLoRA desarrollado por el usuario snowman0919, diseñado para convertir el modelo base Qwen/Qwen3.8-27B de Alibaba en un "executor" especializado en tool-calling y tareas multimodales. Se trata de un checkpoint intermedio del entrenamiento, publicado cada 5 pasos, que complementa al modelo principal `qwen38-executor-27b-v1`. Este adaptador se entrena sobre el dataset `snowman0919/qwen38-executor-train-v2`, que incluye datos de texto con al menos un 40% de contenido en coreano y todas las filas de visión validadas.

La relevancia de este modelo radica en que extiende las capacidades nativas del Qwen3.8-27B, un modelo denso multimodal de 27B parámetros con ventana de contexto nativa de 262.144 tokens, hacia un uso especializado en agentes y ejecución de herramientas. El entrenamiento utiliza cuantización 4-bit NF4 con doble cuantización y cómputo BF16, lo que permite un ajuste eficiente del modelo base sin modificarlo. El adaptador está pensado para cargarse con la librería PEFT sobre el modelo base en su revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | QLoRA adapter sobre Qwen3.8-27B (dense multimodal transformer) |
| Parametros totales | no disponible (adapter LoRA r=32, alpha=64; base 27B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (nativa del modelo base) |
| Tipos de cuantizacion | 4-bit NF4 con doble cuantizacion (entrenamiento); inferencia depende del despliegue |
| Idiomas soportados | no disponible en la model card; dataset con al menos 40% coreano |
| Licencia | no disponible (modelo base Qwen3.8-27B es Apache-2.0) |
| Formato de pesos | safetensors (PEFT adapter) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre el modelo Qwen/Qwen3.8-27B sin modificar, un transformer denso multimodal nativo de 27B parámetros que procesa texto, imágenes y vídeo. El entrenamiento usa QLoRA con cuantización 4-bit NF4 con doble cuantización y cómputo BF16. Los hiperparámetros LoRA son r=32, alpha=64 y dropout=0.0. El dataset de entrenamiento `snowman0919/qwen38-executor-train-v2` contiene 17.440 filas deterministas para la fase de texto (2.180 pasos) y todas las filas de visión validadas (1.275 pasos). Las filas largas se conservan enteras hasta 262.144 tokens; las más largas se procesan con ventanas de solapamiento de 8.192 tokens. La evaluación posterior incluye HLE (closed/web), TerminalBench 2.1 y OSWorld, aunque este último no es independiente porque sus trayectorias se incluyeron intencionalmente en el entrenamiento.

## Capacidades

- Ejecución de herramientas (tool-calling): el adaptador está específicamente entrenado para que el modelo ejecute llamadas a herramientas de forma fiable.
- Razonamiento multimodal: hereda las capacidades nativas del Qwen3.8-27B para procesar texto, imágenes y vídeo.
- Manejo de contexto largo: soporta la ventana nativa de 262.144 tokens del modelo base.
- Soporte de agentes: el entrenamiento con TerminalBench y OSWorld sugiere capacidades para tareas de agente en entornos de terminal y sistema operativo.
- Multilingüe limitado: el dataset incluye al menos 40% de contenido en coreano, lo que sugiere un refuerzo específico en ese idioma, aunque el modelo base es multilingüe.

## Casos de uso

- Automatización de tareas de oficina: el modelo puede ejecutar acciones en aplicaciones de escritorio mediante tool-calling, aprovechando el entrenamiento con trayectorias de OSWorld.
- Agentes de terminal: gracias al entrenamiento con TerminalBench 2.1, puede interpretar comandos y ejecutar operaciones en entornos de línea de comandos.
- Asistente de código con contexto largo: con 262K tokens de contexto, puede analizar repositorios completos y ejecutar herramientas de desarrollo.
- Procesamiento de documentos multimodales: combina visión y texto para extraer información de PDFs, imágenes y vídeo, ejecutando herramientas de post-procesado.
- Automatización de flujos de trabajo en coreano: el refuerzo del dataset en coreano lo hace adecuado para asistentes empresariales en ese idioma.
- Investigación en agentes: útil para experimentos de razonamiento multi-paso y ejecución de herramientas en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que se ejecutan evaluaciones de HLE (closed/web), TerminalBench 2.1 y OSWorld tras el entrenamiento, pero no se proporcionan las puntuaciones. Además, se advierte que OSWorld no es independiente porque las trayectorias relacionadas se incluyeron en el entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 27B parámetros en BF16 requiere aproximadamente 54 GB de VRAM. Con cuantización 4-bit (GPTQ/AWQ) se puede reducir a unos 16-18 GB, y con 8-bit a unos 28-30 GB.
- GPU recomendadas: para la carga completa en BF16 se necesitan GPUs de datacenter como A100 80GB o H100. Con cuantización 4-bit puede ejecutarse en RTX 4090 (24 GB) o RTX 3090 (24 GB).
- En consumer GPU: sí, con cuantización 4-bit y ventana de contexto reducida.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (si se convierte a GGUF), TGI, o mediante PEFT con transformers.
- Latencia y throughput: no disponible; depende del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| qwen38-executor-27b-v2 (este) | 27B base + LoRA | 262K | no disponible | Tool-calling, agentes, coreano |
| Qwen3.8-27B (base) | 27B | 262K | Apache-2.0 | Multimodal generalista |
| Qwen3.8-27B v1 (executor) | 27B base + LoRA | 262K | no disponible | Tool-calling, agentes |

La comparativa con otros modelos de la misma categoría (como Llama 3.1 70B o Mistral Large) no está disponible en la información proporcionada. El modelo base Qwen3.8-27B se posiciona como un modelo denso multimodal de alto rendimiento para hardware local, y este adaptador lo especializa en ejecución de herramientas.

## Limitaciones y advertencias

- Sesgos lingüísticos: el dataset tiene al menos 40% de contenido en coreano, lo que puede sesgar el comportamiento del modelo hacia ese idioma y reducir su rendimiento en otros.
- Evaluación contaminada: OSWorld no es una evaluación independiente porque sus trayectorias se incluyeron en el entrenamiento; los resultados en ese benchmark no son fiables.
- Riesgo de alucinación: como cualquier modelo de 27B, puede generar respuestas incorrectas o inventadas, especialmente en tareas de razonamiento complejo.
- Licencia no especificada: aunque el modelo base es Apache-2.0, la licencia del adaptador no está declarada; hay que verificar antes de uso comercial.
- Checkpoint intermedio: este repositorio contiene checkpoints cada 5 pasos; no es el modelo final y puede tener rendimiento inferior al adaptador v1 consolidado.
- Requisitos de hardware: el contexto completo de 262K tokens requiere mucha memoria; en GPUs de consumo hay que reducir la ventana.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/snowman0919/qwen38-executor-27b-checkpoints-v2
- Modelo v1 consolidado: https://huggingface.co/snowman0919/qwen38-executor-27b-v1
- Guía de ejecución local de Qwen3.8-27B: https://linas.substack.com/p/qwen3-8-27b-local-guide
- Repositorio oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guía de ejecución en GPUs de 16-24GB: https://codersera.com/blog/how-to-run-qwen-3-8-locally-2026/
