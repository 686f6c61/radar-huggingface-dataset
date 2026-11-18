# CMSManhattan/JiRackUltra_1b

## Resumen
JiRack Ultra 1B es un modelo de generación de texto de aproximadamente 1.777 millones de parámetros (etiquetado comercialmente como "~1.5B") desarrollado por CMSManhattan. Está construido sobre una base de la familia Qwen2 (según los tags del repositorio) y rediseñado por el autor con soporte nativo de pesos ternarios al estilo BitNet (1.58 bits), orientado específicamente a inferencia eficiente en CPU y a despliegues de bajo consumo de memoria.

El modelo se presenta como un "experto de dominio" para enrutamiento (routing), tool calling y robótica, con un tokenizador propio (JiRackPrecisionTokenizer) que introduce etiquetas específicas para estas tareas. La propuesta de valor es reducir costes de infraestructura en la nube mediante cuantizaciones ternarias (TQ_2) ejecutables en llama.cpp y Ollama, con variantes GGUF que van desde 0,24 GB (Q2_K) hasta 3,56 GB (referencia ternaria completa).

Es relevante ahora porque combina dos tendencias: la compresión extrema de pesos (ternario/QAT) y el uso de modelos pequeños especializados en agentes y llamadas a herramientas, un nicho donde los modelos de 1-3B bien ajustados pueden sustituir a modelos mucho mayores en tareas acotadas. La licencia MIT facilita su adopción comercial, aunque la documentación técnica disponible es escasa y mayoritariamente promocional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen2 (tag `qwen2`), con soporte nativo de pesos ternarios estilo BitNet (1.58 bits) |
| Parametros totales | 1.777.088.000 (según safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternario TQ_2_0 (llama.cpp, con soporte AVX2 y AVX-512), Q4_K_M, Q3_K_M, Q2_K, GGUF; también exportación a ONNX |
| Idiomas soportados | en, zh, ja, ko, fr, es, pt, de, it, ru, ar, vi, th |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF, ONNX (guía de exportación disponible) |

## Arquitectura y entrenamiento
La información disponible indica que el modelo parte de una arquitectura Qwen2 (transformer decoder-only) y ha sido "refactorizado" con características BitNet y un tokenizador actualizado. El autor menciona entrenamiento con QAT (Quantization-Aware Training) para producir pesos ternarios TQ_2_0 compatibles con llama.cpp, incluyendo la posibilidad de doble QAT vía ONNX. También se mencionan servicios de QAT personalizado sobre datasets del cliente, con adaptaciones para evitar olvido catastrófico y mesetas de entrenamiento, aunque no se detallan los procedimientos concretos.

No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. La model card menciona el uso de datasets de tool calling como ToolBench, hermes-function-calling-v1 y Qwen2-7B-Instruct-glaive-function-calling para mejorar las capacidades de llamada a herramientas mediante etiquetas del tokenizador JiRack. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal. La información técnica verificable es limitada y gran parte del README tiene carácter comercial.

## Capacidades
- Generación de texto conversacional multilingüe en 13 idiomas (en, zh, ja, ko, fr, es, pt, de, it, ru, ar, vi, th).
- Tool calling / function calling nativo, reforzado mediante etiquetas específicas del tokenizador JiRackPrecisionTokenizer.
- Enrutamiento (routing) de peticiones, presentado como capacidad de dominio específico.
- Casos de robótica, según los tags y la sección "JiRack RoboTech" de la model card.
- Generación de código y uso como agente de codificación a través de los plugins IDE del ecosistema JiRack (VS Code, JetBrains, Eclipse).
- Integración en despliegues RAG como modelo experto.
- Modo chat sin razonamiento explícito disponible en Ollama ("Jirack chat without reasoning").
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso
- Tool calling en agentes ligeros: el modelo puede actuar como planificador de llamadas a funciones en pipelines de agentes, usando las etiquetas del tokenizador JiRack para estructurar las invocaciones con menor tasa de errores de formato en modelos pequeños.
- Enrutamiento de consultas en sistemas multi-modelo: dado su tamaño reducido y su especialización declarada en routing, puede clasificar peticiones entrantes y derivarlas al modelo o servicio adecuado en una arquitectura de enrutador jerárquico.
- Despliegue en CPU sin GPU: con cuantización Q4_K_M (1,12 GB, ~1,6 GB de RAM) o Q2_K (0,24 GB, ~1,0 GB de RAM) puede ejecutarse en servidores sin acelerador, contenedores Docker con 16 hilos y portátiles convencionales, reduciendo costes de infraestructura.
- Asistente de codificación local en IDE: mediante los plugins de VS Code, JetBrains y Eclipse del ecosistema JiRack, ejecutado con Ollama en un PC doméstico, con revisión obligatoria de cambios antes de aplicarlos.
- RAG de bajo coste: como modelo experto en recuperación aumentada, respondiendo sobre documentos recuperados con un consumo de memoria mínimo en entornos cloud o edge.
- Prototipado rápido multilingüe: para validar flujos conversacionales en 13 idiomas antes de escalar a modelos mayores, gracias a la licencia MIT y a los formatos GGUF listos para usar.
- Robótica y control de bajo nivel: para interpretar comandos en lenguaje natural y traducirlos a llamadas de herramientas o acciones estructuradas en sistemas embebidos con recursos limitados.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

| Variante | Cuantización | Tamaño | RAM aproximada |
|---|---|---|---|
| Full | Ternario de referencia | 3,56 GB | ~4,1 GB |
| Q4 | Q4_K_M | 1,12 GB | ~1,6 GB |
| Q3 | Q3_K_M | 0,92 GB | ~1,4 GB |
| Q2 | Q2_K | 0,24 GB | ~1,0 GB |

- VRAM estimada: no aplica para el caso de uso principal (CPU); en GPU, la variante Q4 cabría en cualquier GPU consumer con 2 GB o más de VRAM, aunque no se documenta rendimiento en GPU.
- GPU recomendadas: no disponible; el modelo está optimizado para CPU con instrucciones AVX2 y AVX-512.
- Cabe en cualquier GPU consumer y en CPU convencional; el caso de uso declarado es inferencia en CPU.
- Opciones de despliegue: llama.cpp (TQ_2_0), Ollama (imágenes `cmsmanhattan/jirack-ultra-1b-cpu`, `-q4`, `-q3`, `-q2`), Docker, ONNX (servidor Java JiRack), exportación a ONNX documentada.
- Latencia y throughput: no disponibles. El README recomienda 16 hilos (`THREADS=16`, `THREADS_BATCH=16`) y `--cpus=16` en Docker, sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización extrema | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JiRack Ultra 1B | 1,777 mil M | no disponible | Ternario TQ_2, Q2_K, Q3, Q4 | MIT | HF, Ollama, Docker |
| Qwen2.5-1.5B-Instruct | 1,5 mil M | 32.768 tokens (según documentación pública de Qwen) | GGUF estándar (Q2-Q8) | Apache 2.0 | HF, Ollama, vLLM |
| Llama 3.2 1B Instruct | 1,24 mil M | 128.000 tokens (según documentación pública de Meta) | GGUF estándar | Llama 3.2 Community License | HF, Ollama |
| BitNet b1.58 2B4T | 2 mil M | no disponible en esta ficha | Ternario nativo | MIT (según publicación de Microsoft) | HF |

La comparación con Qwen2.5-1.5B y Llama 3.2 1B se basa en datos públicos de sus respectivas documentaciones, no en evaluaciones directas contra JiRack Ultra 1B. No hay benchmarks que permitan situar a JiRack Ultra 1B frente a estas alternativas; su diferenciador declarado es la cuantización ternaria y el soporte de tool calling específico, no el rendimiento bruto.

## Limitaciones y advertencias
- No se han publicado evaluaciones independientes ni benchmarks; el rendimiento real en tareas de razonamiento, código o matemáticas es desconocido.
- La model card contiene afirmaciones comerciales ("cloud-ready", "partnership" con NVIDIA y FISERV) sin evidencia técnica que las respalde; trátese como material promocional.
- La longitud de contexto no está documentada, lo que impide planificar despliegues con ventanas largas.
- Riesgo de alucinación inherente a modelos de ~1,8B; no se documentan medidas de mitigación.
- La especialización en tool calling depende de un tokenizador propio (JiRackPrecisionTokenizer) y de etiquetas no estándar, lo que puede requerir adaptar el procesador de llamadas en el stack del usuario.
- No se documentan sesgos conocidos ni evaluaciones de seguridad; el entrenamiento multilingüe en 13 idiomas sin datos de composición impide evaluar la calidad por idioma.
- La licencia MIT permite uso comercial sin restricciones, pero el autor ofrece servicios de QAT personalizado bajo NDA, lo que sugiere que las variantes optimizadas pueden no ser públicas.
- El repositorio ocupa 16,2 GB, muy superior al tamaño del modelo, debido a múltiples artefactos (GGUF, ONNX, plugins, guías); conviene descargar solo los ficheros necesarios.
- La fecha de creación indicada (2026-08-02) es futura respecto a la información habitual de repositorios; verifíquese la integridad y procedencia de los artefactos antes de usarlos en producción.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/CMSManhattan/JiRackUltra_1b
- Tokenizador: https://huggingface.co/CMSManhattan/JiRackPrecisionTokenizer
- Demo de chat: https://huggingface.co/spaces/CMSManhattan/JiRackUltra_1b
- Demo ternaria de producción: https://huggingface.co/CMSManhattan/JiRackTernaryPrecision-2B-chat
- Guía QAT a GGUF TQ2_0: https://huggingface.co/CMSManhattan/JiRackUltra_1b/blob/main/QAT_to_Llama.cpp_GGUF_TQ2_0_JirackUltra_1b.md
- Guía de exportación a ONNX: https://huggingface.co/CMSManhattan/JiRackUltra_1b/blob/main/jirackultra_1b_onnx_export_guide.md
- Perfil de Ollama: https://ollama.com/cmsmanhattan
- Sitio web del proyecto: https://www.jirack.com
- Plugin Eclipse: https://marketplace.eclipse.org/content/jirack-coding-agent
- Plugin JetBrains: https://plugins.jetbrains.com/plugin/35073-jirack-agent
- Plugin VS Code: https://marketplace.visualstudio.com/items?itemName=JiRackautomationCodingAgentIDE.jirack-agent
- ToolBench: https://github.com/OpenBMB/ToolBench
- Gorilla (tool calling en Python): https://github.com/ShishirPatil/gorilla
- Spring AI Alibaba (tool calling en Java): https://github.com/alibaba/spring-ai-alibaba
- Dataset hermes-function-calling-v1: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Modelo de referencia para tool calling: https://huggingface.co/xalss/Qwen2-7B-Instruct-glaive-function-calling
