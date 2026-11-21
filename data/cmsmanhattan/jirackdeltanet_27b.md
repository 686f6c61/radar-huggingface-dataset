# CMSManhattan/JiRackDeltaNet_27b

## Resumen
JiRack DeltaNet 27B es un modelo de generación de texto de 27.320.697.856 parámetros (27,3 mil millones) publicado por CMSManhattan bajo licencia MIT. Se presenta como una arquitectura híbrida de atención y SSM (State Space Model) de estilo Qwen3.8, con un tokenizador propio (JiRackDeltaNetTokenizer) que incorpora etiquetas específicas para enrutamiento, medios, visión, sonido, tool calling y robótica. El modelo está orientado explícitamente a inferencia eficiente en CPU y a despliegues de bajo consumo de memoria.

La propuesta diferencial es la cuantización ternaria (1,58 bits, TQ_2) mediante Quantization-Aware Training (QAT), lo que permite ejecutar los 27B parámetros en aproximadamente 7,2 GB de pesos y entre 8 y 13 GB de RAM. El autor distribuye variantes GGUF en Q2_K, Q3_K_M, Q4_K_M y TQ_2, además de imágenes Docker con interfaz web y soporte nativo en Ollama. El repositorio ocupa 256,8 GB e incluye pesos en safetensors y GGUF.

El modelo se posiciona como un experto de dominio para tool calling, agentes de codificación y robótica, con razonamiento desactivado por defecto para respuestas directas y de baja latencia. La información pública disponible sobre arquitectura interna, datos de entrenamiento y evaluación es escasa y proviene casi exclusivamente de la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida de atención + SSM (DeltaNet), estilo Qwen3.8; pesos ternarios (1,58 bits) vía QAT |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16, Q8/int8, Q6, Q4_K_M, Q3_K_M, Q2_K, TQ_2 (ternaria, 1,58 bits) |
| Idiomas soportados | en, zh, ja, ko, fr, es, pt, de, it, ru, ar, vi, th |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento
La model card describe una arquitectura DeltaNet con atención híbrida y componentes SSM, etiquetada como «Qwen3.8-style». No se especifican el número de capas, la dimensión oculta, el número de cabezas ni el mecanismo exacto de combinación entre atención y estado recurrente. El tokenizador es propio (JiRackDeltaNetTokenizer) e incorpora tokens dedicados a enrutamiento, medios, visión, sonido, tool calling y robótica, lo que sugiere un entrenamiento orientado a agentes y a la invocación estructurada de herramientas.

El entrenamiento incluye QAT para producir pesos ternarios (1,58 bits) que funcionan en llama.cpp y Ollama mediante el formato TQ_2. El autor menciona técnicas para evitar el olvido catastrófico y la meseta temprana en el entrenamiento, así como la posibilidad de QAT doble vía ONNX y de ajuste fino sobre datasets del cliente, pero no publica el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. Las cuantizaciones declaradas se generaron a partir del modelo en FP16.

## Capacidades
- Generación de texto conversacional en 13 idiomas, con razonamiento desactivado por defecto (sin bloques `<think>` forzados) y posibilidad de activarlo en tiempo de ejecución.
- Tool calling y function calling de alta calidad, apoyado por tokens dedicados en el tokenizador; la model card cita ejemplos de integración con Spring AI Alibaba (Java) y Gorilla (Python).
- Enrutamiento y razonamiento multi-paso orientado a agentes.
- Capacidades declaradas de visión, vídeo, imagen y sonido, con orientación a robótica; no se detallan los módulos ni los formatos de entrada admitidos.
- Generación de código y uso como agente de codificación en IDE mediante los plugins propios para VS Code, Eclipse y JetBrains.
- Uso como modelo experto en despliegues RAG, con un servidor Java ONNX alternativo.

## Casos de uso
- Agentes de codificación en estación de trabajo: el modelo se ejecuta en Ollama sobre CPU con la variante Q4_K_M (~16,8 GB) y se integra en plugins de VS Code, Eclipse o JetBrains que solicitan confirmación antes de aplicar cambios, lo que encaja con un flujo de revisión humana.
- Tool calling en backend empresarial: los tokens de herramienta del tokenizador y los ejemplos con Spring AI Alibaba permiten construir asistentes que invocan APIs Java de forma estructurada sin un modelo mayor.
- Despliegue en servidores sin GPU: las imágenes Docker con Q4_K_M, Q3_K_M, Q2_K y TQ_2 permiten servir el modelo con 12-24 GB de RAM y entre 1 y 16 hilos de CPU, útil en entornos donde no hay aceleradores disponibles.
- RAG sobre documentación interna: el modelo puede actuar como experto de dominio en pipelines de recuperación aumentada, con la ventaja de que el coste de infraestructura en nube se reduce al no requerir GPU.
- Enrutamiento y orquestación de agentes: los tokens de routing permiten clasificar peticiones y derivarlas a herramientas o subagentes dentro de un sistema mayor.
- Robótica y procesamiento multimedia: la model card declara comprensión de vídeo e imagen y un tokenizador específico para robótica, lo que lo hace candidato para pipelines de percepción y control de bajo consumo.
- Atención al cliente multilingüe: con soporte para 13 idiomas y respuestas directas sin razonamiento visible, puede gestionar conversaciones multi-turno; la longitud de contexto no está publicada, por lo que debe validarse antes de usarlo con historiales largos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM/RAM según cuantización (datos del autor): FP16 ~55 GB de pesos y 56-64 GB de RAM; Q4_K_M ~16,8 GB y 18-24 GB de RAM; Q3_K_M ~13,9 GB y 15-20 GB de RAM; Q2_K ~11,2 GB y 12-17 GB de RAM; TQ_2 ~7,2 GB y 8-13 GB de RAM.
- El modelo está optimizado para CPU; el autor no publica requisitos de VRAM para GPU. Con 27,3 B parámetros, la inferencia en GPU requeriría al menos una A100 40 GB o H100 en FP16, o una RTX 4090 (24 GB) con Q4_K_M.
- En GPU de consumo cabe con Q4_K_M o inferiores en tarjetas de 16-24 GB; la variante TQ_2 (~7,2 GB) cabe en GPUs de 8-12 GB.
- Opciones de despliegue: Ollama (imagen `cmsmanhattan/JiRackDeltaNet_27b-q4-reasoning`), llama.cpp con GGUF, Docker con UI web en el puerto 7869 (variantes Q8, Q6, Q4, Q3, Q2 y TQ_2), y servidor Java ONNX como alternativa.
- Latencia y throughput: no disponibles. El autor solo indica que la arquitectura está pensada para inferencia rápida en CPU y que el razonamiento está desactivado por defecto para reducir la latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización extrema | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JiRack DeltaNet 27B | 27,3 B | no disponible | TQ_2 ternaria (1,58 bits), ~7,2 GB | MIT | HF, Ollama, Docker |
| Qwen3 32B (referencia de la familia citada) | ~32 B | no disponible en esta ficha | GGUF Q4/Q2 estándar | Apache 2.0 | HF, Ollama, vLLM |
| BitNet b1.58 (referencia ternaria de Microsoft) | ~3 B en publicación | no disponible en esta ficha | Ternaria nativa | MIT | HF, paper |

La comparación se limita a características publicadas; no hay datos de rendimiento del JiRack DeltaNet 27B que permitan contrastarlo con alternativas en MMLU, HumanEval o GSM8K.

## Limitaciones y advertencias
- No se han publicado resultados de benchmarks ni detalles de entrenamiento (tokens, composición del dataset, RLHF/DPO), lo que impide verificar las capacidades declaradas.
- La longitud de contexto no está documentada; no debe asumirse una ventana larga para RAG o conversaciones multi-turno sin pruebas previas.
- Las capacidades de visión, vídeo, sonido y robótica se anuncian en la model card, pero no se especifican módulos, formatos de entrada ni métricas de evaluación.
- La cuantización ternaria TQ_2 implica pérdida de precisión; el autor la presenta como la opción de máxima compresión y no publica comparativas de calidad frente a Q4_K_M.
- Riesgo de alucinación inherente a un modelo de 27B sin evaluación pública; el razonamiento desactivado por defecto puede degradar tareas que requieren varios pasos.
- La licencia MIT permite uso comercial, pero el autor ofrece servicios de QAT y ajuste fino, y menciona acuerdos de confidencialidad, lo que sugiere condiciones adicionales para variantes personalizadas.
- El repositorio ocupa 256,8 GB, por lo que la descarga completa es costosa; conviene descargar solo la variante GGUF necesaria.
- La model card contiene erratas y afirmaciones de partnership (NVIDIA, FISERV) sin verificación independiente; deben tratarse con cautela.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/CMSManhattan/JiRackDeltaNet_27b
- Tokenizador: https://huggingface.co/CMSManhattan/JiRackDeltaNetTokenizer
- Demo GGUF Q4: https://huggingface.co/spaces/CMSManhattan/JiRackDeltaNet_27b
- Demo FP16: https://huggingface.co/spaces/CMSManhattan/JiRackDeltaNet_27b
- Chat JiRack 36B: https://huggingface.co/spaces/CMSManhattan/JiRack-36B-Chat
- Chat JiRack 16B: https://huggingface.co/spaces/CMSManhattan/JiRack-16B-Chat
- Chat JiRack 8B: https://huggingface.co/spaces/CMSManhattan/JiRack-8B-Chat
- Chat JiRack 2B: https://huggingface.co/spaces/CMSManhattan/JiRack-2B-Chat
- Ollama: https://ollama.com/cmsmanhattan
- Sitio web: https://www.jirack.com
- Plugin Eclipse: https://marketplace.eclipse.org/content/jirack-coding-agent
- Plugin JetBrains: https://plugins.jetbrains.com/plugin/35073-jirack-agent
- Plugin VS Code: https://marketplace.visualstudio.com/items?itemName=JiRackautomationCodingAgentIDE.jirack-agent
- Spring AI Alibaba (ejemplos de tool calling): https://github.com/alibaba/spring-ai-alibaba
- Gorilla (ejemplos de tool calling): https://github.com/ShishirPatil/gorilla
