# ngbcoder/flow-webdev-3b-gguf

## Resumen

flow-webdev-3b-gguf es un modelo de lenguaje conversacional derivado de Llama 3.2 3B Instruct, afinado por el usuario ngbcoder y publicado en formato GGUF para su uso con llama.cpp y Ollama. El nombre sugiere una especialización en desarrollo web, aunque la model card no detalla el dataset de afinado ni el alcance exacto de esa especialización. Con 3.212.749.888 parámetros totales y un único archivo de cuantización Q4_K_M, está pensado para inferencia local en hardware modesto.

El modelo se distribuye exclusivamente en formato GGUF cuantizado, lo que lo hace directamente desplegable en entornos de consumo sin necesidad de GPU de datacenter. El proceso de afinado y conversión se realizó con Unsloth, herramienta que acelera el fine-tuning y la exportación a GGUF. La model card es mínima: no incluye información sobre licencia, idiomas soportados, composición del dataset de entrenamiento ni resultados de evaluación.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo pequeño, cuantizado y listo para ejecutar en local, útil para experimentación con asistentes de desarrollo web en entornos con recursos restringidos. La ausencia de benchmarks publicados y de licencia explícita obliga a tratarlo con cautela en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Llama 3.2 3B Instruct) |
| Parametros totales | 3.212.749.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama 3.2 3B Instruct, no confirmada en la model card) |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 3B Instruct, un transformer decoder-only con atención por grupos (GQA) y RoPE, tal como indica el nombre del archivo publicado (`Llama-3.2-3B-Instruct.Q4_K_M.gguf`). El autor declara un fine-tuning sobre esa base seguido de conversión a GGUF mediante Unsloth, que aplica optimizaciones de memoria y velocidad durante el entrenamiento y la exportación. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o SFT adicionales sobre el modelo base.

El único detalle técnico explícito es un ajuste del comportamiento del token BOS para compatibilidad con GGUF. La model card menciona comandos para modelos multimodales (`llama-mtmd-cli`), pero no hay evidencia de que este modelo tenga capacidades de visión; el comando parece ser una plantilla genérica de Unsloth. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en formato chat, heredada de Llama 3.2 3B Instruct.
- Afinado orientado a desarrollo web (según el nombre del modelo), sin documentación del alcance exacto.
- Soporte de plantilla de chat compatible con llama.cpp mediante `--jinja`.
- Despliegue vía Ollama con Modelfile incluido.
- Capacidades multilingües: no disponibles (no documentadas).
- Tool calling / function calling: no documentado en la model card.
- Modo thinking, visión, audio: no documentado; el comando multimodal parece genérico.
- Razonamiento multi-paso y uso como agente: no documentado.

## Casos de uso

- Asistente de desarrollo web en local: el modelo puede generar fragmentos de HTML, CSS y JavaScript en un entorno sin conexión, aprovechando su especialización declarada y su tamaño reducido para ejecutarse en portátiles.
- Autocompletado de código en el editor: con Q4_K_M y ~2 GB de pesos, se puede integrar en plugins de VS Code mediante llama.cpp u Ollama para sugerencias de baja latencia en máquinas sin GPU dedicada.
- Chatbot de documentación técnica: desplegado con Ollama, puede responder preguntas sobre APIs y frameworks a partir de contexto inyectado, aunque la ventana efectiva debe validarse empíricamente.
- Prototipado rápido de asistentes conversacionales: su formato GGUF y el Modelfile de Ollama permiten levantar un endpoint compatible con la API de OpenAI en minutos para pruebas de concepto.
- Educación y experimentación: útil para estudiar el efecto del fine-tuning y la cuantización Q4_K_M sobre un modelo base conocido como Llama 3.2 3B.
- Generación de snippets en pipelines de CI: puede emplearse para tareas de generación de plantillas o documentación automatizada donde no se requiera alta precisión, con revisión humana obligatoria.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la degradación de calidad de Q4_K_M frente al modelo base en tareas de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,5-3 GB para el archivo Q4_K_M (repo de 2,0 GB) más overhead de contexto y KV cache.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobredimensionadas pero compatibles.
- Cabe en GPU de consumo: sí, en GTX 1650 4 GB, RTX 3050, RTX 4060 y superiores; también en CPU con 4-6 GB de RAM libre.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (Modelfile incluido), y cualquier runtime compatible con GGUF (LM Studio, koboldcpp). No se publican pesos safetensors para vLLM o TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| flow-webdev-3b-gguf | 3,21 B | no disponible | GGUF Q4_K_M | no disponible | Fine-tuning web con Unsloth |
| Llama 3.2 3B Instruct | 3,21 B | 128 K (según Meta) | safetensors, GGUF | Llama 3.2 Community License | Modelo base; contexto no confirmado en este derivado |
| Qwen2.5-Coder-3B | 3,09 B | 32 K (según Alibaba) | safetensors, GGUF | Apache 2.0 | Especializado en código; alternativa directa para webdev |
| Gemma 2 2B Instruct | 2,61 B | 8 K (según Google) | safetensors, GGUF | Gemma Terms of Use | Menor tamaño, licencia restrictiva |

La comparativa se basa en datos públicos de los modelos alternativos; los valores de contexto de flow-webdev-3b-gguf no están confirmados en su model card y podrían diferir del modelo base.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial sin contactar al autor; riesgo legal en producción.
- Sin benchmarks publicados: no hay evidencia cuantitativa de la calidad del fine-tuning ni de la degradación por Q4_K_M.
- Model card mínima: no se documentan idiomas, dataset, ni metodología de entrenamiento, lo que impide evaluar sesgos.
- Riesgo de alucinación inherente a un modelo de 3B, especialmente en código y APIs recientes.
- Contexto efectivo no confirmado: aunque el base soporta ventanas largas, el fine-tuning y la cuantización pueden degradar el uso de contexto largo.
- Única cuantización disponible (Q4_K_M): no hay opciones de mayor precisión (Q8, FP16) para evaluar la pérdida de calidad.
- Ajuste del token BOS para GGUF: puede causar diferencias de comportamiento respecto al modelo base en algunas plantillas de chat.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay validación comunitaria ni reportes de uso.
- El comando multimodal de la model card no implica capacidades de visión; no debe asumirse soporte de imágenes.

## Enlaces

- Hugging Face: https://huggingface.co/ngbcoder/flow-webdev-3b-gguf
- Unsloth (herramienta de fine-tuning y conversión): https://github.com/unslothai/unsloth
- Llama 3.2 3B Instruct (modelo base): https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
