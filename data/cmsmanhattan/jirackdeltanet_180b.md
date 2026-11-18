# CMSManhattan/JiRackDeltaNet_180b

## Resumen

JiRack DeltaNet 180B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por CMSManhattan, construido sobre la arquitectura del modelo base Qwen/Qwen3.8-Flash-Next. Con 176.943.899.520 parámetros totales y aproximadamente 6B parámetros activos por token, el modelo busca hacer viable la inferencia de alta calidad en CPU a una escala que, de otro modo, requeriría hardware de datacenter. Su propuesta central es la arquitectura ternaria JiRack (BitLinear con pesos ternarios por tensor absmean), orientada a la inferencia TQ2_0 en llama.cpp y Ollama.

El modelo combina atención lineal Gated DeltaNet intercalada con Qwen Sparse Attention (QSA), 512 expertos con enrutamiento top-10 más un experto compartido, flujos residuales con hiper-conexiones y una tabla de embeddings hashed n-gram de 51B parámetros. Esta combinación permite que el coste computacional por token se acerque al de un modelo denso de 6B, manteniendo la calidad de un modelo mucho mayor.

Es relevante ahora porque representa un intento de llevar la cuantización ternaria (estilo BitNet) a la escala de 180B mediante un pipeline de QAT (quantization-aware training) con warmup de lambda, aunque en el momento de la publicación el proceso de QAT aún no se ha iniciado y los pesos son numéricamente idénticos al modelo base. La licencia es qwen-community-1.0, derivada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con Gated DeltaNet (atención lineal) + Qwen Sparse Attention (QSA), hiper-conexiones y BitLinear ternario |
| Parametros totales | 176.943.899.520 (≈177B) |
| Parametros activos | ≈6B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF BF16, Q4_K_M, Q3_K_M publicados; TQ2_0 planificado tras QAT |
| Idiomas soportados | en, zh, ja, ko, fr, es, pt, de, it, ru, ar, vi, th |
| Licencia | qwen-community-1.0 (other) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La arquitectura es un MoE sobre el diseño Qwen3.8-Flash-Next: atención lineal Gated DeltaNet intercalada con Qwen Sparse Attention, 512 expertos con enrutamiento top-10 más un experto compartido, flujos residuales con hiper-conexiones (gated residual streams) y una tabla de embeddings hashed n-gram de 51B parámetros. El vocabulario del tokenizer es de 248.320 entradas. El modelo incorpora un parche BitLinear en 74.028 capas con pesos ternarios por tensor absmean, diseñado para un pipeline de QAT con warmup de lambda de 0 a 1.

El proceso de conversión desde Qwen/Qwen3.8-Flash-Next está verificado numéricamente: la predicción del siguiente token coincide con la referencia en el 100% de las posiciones y las diferencias de logits están dentro del ruido bf16 del propio modelo. El parche BitLinear a lambda = 0 es un passthrough bit-exacto (diferencia máxima de logits 0.000000). El QAT ternario no se ha iniciado y requiere una máquina con al menos 640 GB de RAM; hasta completarlo, los pesos son idénticos al modelo base y los beneficios ternarios no están activos. No se dispone de datos sobre el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto conversacional y razonamiento, heredados del modelo base Qwen3.8-Flash-Next.
- Soporte de tool calling / function calling mediante el flujo JiRack tool-call y el tokenizer JiRack Precision.
- Capacidades de agente y razonamiento multi-paso, orientadas a flujos de coding agent.
- Capacidades multilingües en 13 idiomas: en, zh, ja, ko, fr, es, pt, de, it, ru, ar, vi, th.
- Modo de razonamiento (thinking) presente en el modelo base; los builds JiRack planean desactivarlo por defecto.
- Capacidades de visión y vídeo presentes en el modelo base, pero el build JiRack es actualmente solo texto.
- Orientación específica a robótica, enrutamiento y coding mediante fine-tuning QAT planificado.

## Casos de uso

- Inferencia en CPU a gran escala: con ~6B parámetros activos por token, el modelo puede ejecutarse en CPU con throughput cercano al de un modelo denso de 6B, adecuado para despliegues sin GPU dedicada una vez completado el QAT.
- Atención al cliente automatizada: conversaciones multi-turno con capacidades multilingües en 13 idiomas, aprovechando el soporte conversacional del modelo base.
- Generación de código en producción: integrable en pipelines de CI/CD mediante tool calling y el flujo JiRack tool-call, con el IDE JiRack Coding Agent como entorno de referencia.
- Agentes de coding asistido: el IDE JiRack Coding Agent ejecuta los modelos JiRack vía Ollama en un PC doméstico, con revisión y aplicación manual de cada cambio.
- Despliegue RAG como modelo experto: el autor lo posiciona como modelo experto en despliegues RAG, con un servidor Java ONNX JiRack como alternativa.
- Robótica y enrutamiento: fine-tuning QAT orientado a tareas de robótica y routing con tokenizer especializado (JiRack RoboTech).
- Automatización empresarial con tool calls: integración con librerías Java (Spring AI Alibaba) y Python (Gorilla) para function calling en entornos enterprise.
- Fine-tuning a medida: el autor ofrece QAT personalizado sobre datasets del cliente, con doble QAT vía ONNX y adaptación para evitar olvido catastrófico y plateau temprano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el QAT ternario requiere una máquina con al menos 640 GB de RAM según el autor; el tamaño del repo es de 926,5 GB.
- GPU recomendadas: no disponible (el modelo está orientado a CPU).
- ¿Cabe en GPU consumer? No disponible; el enfoque declarado es inferencia en CPU.
- Opciones de despliegue: llama.cpp y Ollama (builds de 180B planificados tras QAT); servidor Java ONNX JiRack como alternativa; GGUF BF16, Q4_K_M y Q3_K_M ya publicados.
- Latencia y throughput: no disponible; el autor afirma que el throughput en CPU se acerca al de un modelo denso de 6B.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JiRack DeltaNet 180B | ≈177B | ≈6B | no disponible | qwen-community-1.0 | GGUF BF16/Q4_K_M/Q3_K_M; TQ2_0 pendiente de QAT |
| Qwen3.8-Flash-Next (base) | no disponible | no disponible | no disponible | qwen-community-1.0 | Modelo base de referencia |
| JiRack DeltaNet 27B | no disponible | no disponible | no disponible | no disponible | Build menor de la misma familia |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Hasta completar el QAT, los pesos son numéricamente idénticos al modelo base (lambda = 0); los beneficios ternarios descritos no están activos.
- El build actual es solo texto; las capacidades de visión y vídeo del modelo base no están disponibles.
- No se han publicado benchmarks, por lo que no hay evidencia pública de rendimiento.
- El modelo base piensa por defecto (`<think>...</think>`); los builds JiRack planean desactivar el razonamiento por defecto.
- Licencia qwen-community-1.0: es necesario revisar los términos para uso comercial, ya que se trata de una licencia "other" derivada del modelo base.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Los builds de Ollama y Docker para 180B aún no están publicados.
- El proceso de QAT requiere hardware con al menos 640 GB de RAM, lo que limita su reproducción a entornos especializados.
- El repositorio tiene un tamaño de 926,5 GB, lo que implica requisitos de almacenamiento considerables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CMSManhattan/JiRackDeltaNet_180b
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Tokenizer JiRack: https://huggingface.co/CMSManhattan/JiRackDeltaNetTokenizer
- JiRack DeltaNet 27B: https://huggingface.co/CMSManhattan/JiRackDeltaNet_27b
- Sitio web JiRack: https://www.jirack.com
- Plugin Eclipse: https://marketplace.eclipse.org/content/jirack-coding-agent
- Plugin JetBrains: https://plugins.jetbrains.com/plugin/35073-jirack-agent
- Plugin VS Code: https://marketplace.visualstudio.com/items?itemName=JiRackautomationCodingAgentIDE.jirack-agent
- Ollama (autor): https://ollama.com/cmsmanhattan
- Spring AI Alibaba: https://github.com/alibaba/spring-ai-alibaba
- Gorilla: https://github.com/ShishirPatil/gorilla
- ToolBench: https://github.com/OpenBMB/ToolBench
- Dataset Glaive function calling: https://huggingface.co/xalss/Qwen2-7B-Instruct-glaive-function-calling
- Dataset Hermes function calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
