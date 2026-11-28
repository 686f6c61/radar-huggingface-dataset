# CMSManhattan/JiRackUltra_14b

## Resumen

JiRack Ultra 14B es un modelo de generación de texto de 14.770.033.664 parámetros (14,77 B) desarrollado por CMSManhattan, construido a partir de un modelo base de la familia DeepSeek y refactorizado con soporte nativo para cuantización ternaria de estilo BitNet (1,58 bit). Su propuesta central es ofrecer inferencia de alta calidad en CPU mediante cuantizaciones ternarias TQ_2_0 compatibles con llama.cpp y Ollama, apoyándose en QAT (quantization-aware training) para preservar la calidad tras la compresión. El modelo se distribuye con pesos en safetensors y GGUF, y el repositorio ocupa 153,1 GB.

El modelo incorpora un tokenizador propio (JiRackPrecisionTokenizer) con etiquetas específicas para enrutamiento (routing), llamadas a herramientas (tool call), multimedia, visión, sonido y robótica, lo que lo orienta a despliegues agénticos y a integraciones empresariales (por ejemplo, servidores Java/Spring Boot o el servidor ONNX JiRack). La model card lo presenta como un modelo "cloud-ready" pensado para reducir costes de infraestructura y como experto de dominio en RAG.

Es relevante ahora por la combinación de tres factores: tamaño medio (14 B) que cabe en hardware modesto, arquitectura ternaria que reduce drásticamente los requisitos de memoria, y un ecosistema de herramientas (IDE de coding agent, plugins para Eclipse, JetBrains y VS Code, UI de escritorio) que facilita su adopción en entornos de desarrollo. La licencia es MIT y soporta 13 idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en DeepSeek, con soporte nativo ternario estilo BitNet (1,58 bit) |
| Parametros totales | 14.770.033.664 (14,77 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Full (FP16/BF16), Q4_K_M, Q3_K_M, Q2_K, ternaria TQ_2_0 (llama.cpp), ONNX QAT |
| Idiomas soportados | en, zh, ja, ko, fr, es, pt, de, it, ru, ar, vi, th |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF, ONNX |

## Arquitectura y entrenamiento

El modelo parte de una arquitectura transformer de la familia DeepSeek y ha sido rediseñado por CMSManhattan para incorporar soporte ternario nativo (BitNet-style, 1,58 bit). La cuantización ternaria se aplica mediante QAT, con dos enfoques de entrenamiento documentados en el repositorio: `train_qat_ultra_14b_bf16_fulltext_ada_warmup.py` y `train_qat_ultra_14b_bf16_with_mask_ada_warmup.py`. Los datasets de QAT provienen de NVIDIA Nemotron con tokenizador de Open Assistant, ubicados en la carpeta `prepared_sft_data_ultra14b/`. Las cuantizaciones publicadas se generaron a partir del modelo FP16, pero la arquitectura permite mayor compresión mediante ternarización adicional bajo petición (QAT personalizado sobre el dataset del cliente).

El modelo emplea un tokenizador propio (JiRackPrecisionTokenizer) que añade etiquetas específicas para routing, media, visión, sonido, tool call y robótica, orientadas a mejorar la calidad de las llamadas a herramientas en modelos pequeños. También se documenta la conversión a TQ2_0 con soporte de instrucciones AVX2 y AVX-512 para alto rendimiento en CPU, y la exportación a ONNX (guía incluida en el repositorio). No se especifican en la información disponible el número de tokens de entrenamiento ni la composición detallada del dataset más allá de la referencia a Nemotron y Open Assistant.

## Capacidades

- Generación de texto conversacional en 13 idiomas (inglés, chino, japonés, coreano, francés, español, portugués, alemán, italiano, ruso, árabe, vietnamita y tailandés).
- Llamadas a herramientas (tool calling / function calling) con etiquetas dedicadas del tokenizador JiRackPrecisionTokenizer.
- Enrutamiento (routing) especializado mediante etiquetas del tokenizador.
- Capacidades orientadas a robótica (RoboTech) a través de etiquetas específicas.
- Soporte multimodal declarado en el tokenizador (media, visión, sonido), aunque no se detalla la implementación efectiva de estos módulos en la información disponible.
- Integración como experto en despliegues RAG.
- Uso como modelo agéntico para IDE de programación (Cursor, Windsurf, Devin, plugins de Eclipse, JetBrains y VS Code).
- Inferencia en CPU de alto rendimiento mediante cuantización ternaria TQ_2_0 en llama.cpp y Ollama.
- Compatibilidad con endpoints y despliegue en servidor ONNX JiRack (Java).

## Casos de uso

- **Atención al cliente automatizada en CPU**: el modelo puede gestionar conversaciones multi-turno en 13 idiomas y desplegarse en infraestructura sin GPU gracias a las cuantizaciones Q2_K (6,81 GB) y Q3_K_M (8,42 GB), reduciendo costes de cloud.
- **Agente de programación en IDE**: integrable en Cursor, Windsurf, Devin, Eclipse, JetBrains y VS Code mediante los plugins oficiales de JiRack; el modelo solicita aplicar cambios y revisión, lo que aporta una capa de seguridad frente a modificaciones automáticas.
- **Automatización de tool calling empresarial**: con el tokenizador JiRackPrecisionTokenizer y ejemplos de Spring Boot AI (spring-ai-alibaba) y Gorilla, se puede usar como motor de llamadas a herramientas en backends Java o Python.
- **Experto de dominio en RAG**: la model card lo posiciona explícitamente como modelo experto para despliegues RAG, donde el contexto se recupera externamente y el modelo sintetiza respuestas con tool calling opcional.
- **Prototipado y desarrollo offline en estación de trabajo**: la UI de escritorio JiRack (versiones con modelos de 8B, 16B y 36B) permite ejecutar el modelo localmente sin conexión, útil para entornos con requisitos de privacidad.
- **Enrutamiento y orquestación de agentes**: las etiquetas de routing del tokenizador permiten usar el modelo como componente de decisión que dirige peticiones a herramientas o subagentes especializados.
- **Robótica y control de dispositivos**: las etiquetas RoboTech del tokenizador están pensadas para escenarios de robótica donde el modelo genera comandos estructurados, aunque no se documenta la integración con hardware concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM/RAM estimada para inferencia** (según variantes documentadas en la model card):
  - Full precision: 28,1 GB de tamaño, ~28–32 GB de RAM.
  - Q4_K_M: 10,1 GB de tamaño, ~8–12 GB de RAM (equilibrio recomendado).
  - Q3_K_M: 8,42 GB de tamaño, ~7–10 GB de RAM.
  - Q2_K: 6,81 GB de tamaño, ~6–9 GB de RAM (máxima compresión).
  - Ternaria TQ_2_0: no se especifica el tamaño exacto, pero la arquitectura ternaria de 1,58 bit permite compresión adicional respecto a Q2_K.
- **GPU recomendadas**: no se especifican en la información disponible; el modelo está optimizado para CPU.
- **Compatibilidad con GPU de consumo**: no confirmada explícitamente; las cuantizaciones Q4_K_M y Q3_K_M caben en GPUs de consumo con 8–12 GB de VRAM si se ejecutan en llama.cpp con offload parcial, aunque la información no lo garantiza.
- **Opciones de despliegue**: llama.cpp, Ollama (imágenes `cmsmanhattan/jirack-ultra-14b-cpu:latest` y variantes q4, q3, q2), servidor ONNX JiRack (Java), exportación ONNX.
- **Aceleración**: instrucciones AVX2 y AVX-512 en CPU para la variante TQ2_0.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion ternaria | Licencia | Enfoque |
|---|---|---|---|---|---|
| JiRack Ultra 14B | 14,77 B | No disponible | Si (BitNet-style, QAT) | MIT | CPU, tool calling, agentes |
| BitNet b1.58 (Microsoft) | ~3 B (referencia publicada) | No disponible | Si (nativo) | MIT (investigacion) | Investigacion en ternario |
| Qwen2 14B (base) | ~14 B | 32 K (tipico en la familia) | No | Apache 2.0 (familia Qwen2) | Proposito general |
| DeepSeek base (familia) | Variable | No disponible | No | Variable | Proposito general |

La comparación con BitNet b1.58 es la más directa en cuanto a paradigma de cuantización ternaria, aunque JiRack Ultra 14B es significativamente mayor y está orientado a producción con tool calling. Frente a Qwen2 14B, la ventaja de JiRack es la inferencia en CPU con cuantización ternaria y el tokenizador especializado; la desventaja es la ausencia de benchmarks publicados que permitan comparar calidad. Los datos de contexto de los modelos comparables no están confirmados en la información disponible.

## Limitaciones y advertencias

- No se han publicado benchmarks (MMLU, HumanEval, GSM8K u otros) que permitan evaluar la calidad real del modelo frente a alternativas.
- La longitud de contexto no está especificada, lo que dificulta planificar despliegues con ventanas largas.
- El soporte multimodal (visión, sonido) se declara a nivel de tokenizador, pero no se documenta la implementación efectiva de módulos de visión o audio; podría tratarse de etiquetas preparatorias sin capacidad real.
- La cuantización ternaria y las cuantizaciones agresivas (Q2_K) pueden degradar la calidad; la model card recomienda Q4_K_M como equilibrio.
- El modelo se basa en un modelo DeepSeek rediseñado, y no se detalla la composición exacta del dataset de entrenamiento ni el volumen de tokens, lo que limita la reproducibilidad.
- Riesgo de alucinación inherente a los modelos de 14 B, especialmente en tareas de razonamiento complejo o matemáticas.
- Sesgos: no se documentan evaluaciones de sesgo; al entrenarse con datasets de Nemotron y Open Assistant, puede heredar sesgos de esas fuentes.
- La licencia MIT permite uso comercial, pero el modelo base DeepSeek puede tener condiciones adicionales que conviene verificar antes de producción.
- El ecosistema (IDE, plugins, UI de escritorio) está en desarrollo activo y algunas variantes (por ejemplo, soporte de producción en Ollama) se describen como "en progreso".
- El repositorio es muy grande (153,1 GB), lo que puede dificultar la descarga y el almacenamiento en entornos con recursos limitados.

## Enlaces

- Hugging Face: https://huggingface.co/CMSManhattan/JiRackUltra_14b
- Demo live chat: https://huggingface.co/spaces/CMSManhattan/JiRackUltra_14b
- Demo ternaria de producción: https://huggingface.co/CMSManhattan/JiRackTernaryPrecision-16B-chat
- Tokenizador: https://huggingface.co/CMSManhattan/JiRackPrecisionTokenizer
- Guía QAT a llama.cpp TQ2_0: https://huggingface.co/CMSManhattan/JiRackUltra_14b/blob/main/QAT_to_Llama.cpp_GGUF_TQ2_0_JirackUltra_14b.md
- Guía de exportación a ONNX: https://huggingface.co/CMSManhattan/JiRackUltra_14b/blob/main/jirackultra_14b_onnx_export_guide.md
- Web oficial: https://www.jirack.com
- Plugin Eclipse: https://marketplace.eclipse.org/content/jirack-coding-agent
- Plugin JetBrains: https://plugins.jetbrains.com/plugin/35073-jirack-agent
- Plugin VS Code: https://marketplace.visualstudio.com/items?itemName=JiRackautomationCodingAgentIDE.jirack-agent
- Ollama: https://ollama.com/cmsmanhattan
- Spring AI Alibaba (tool calls Java): https://github.com/alibaba/spring-ai-alibaba
- Gorilla (tool calls Python): https://github.com/ShishirPatil/gorilla
- ToolBench: https://github.com/OpenBMB/ToolBench
- Dataset Hermes function calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Modelo Qwen2-7B-Instruct-glaive-function-calling: https://huggingface.co/xalss/Qwen2-7B-Instruct-glaive-function-calling
