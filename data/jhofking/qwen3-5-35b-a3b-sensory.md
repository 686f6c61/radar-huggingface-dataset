# JHofking/qwen3.5-35B-A3B-sensory

## Resumen

El modelo `JHofking/qwen3.5-35B-A3B-sensory` es un adaptador LoRA de tipo *sensory* (orientado a percepción o procesamiento sensorial) construido sobre el modelo base `unsloth/Qwen3.5-35B-A3B`, una variante de la familia Qwen3.5 de Alibaba Cloud. El adaptador fue publicado por el usuario JHofking en agosto de 2026 y utiliza la librería PEFT con entrenamiento supervisado (SFT) mediante la herramienta Unsloth. El repositorio ocupa 7,5 GB y contiene únicamente los pesos del adaptador en formato safetensors, no el modelo completo.

El modelo base es un Mixture-of-Experts (MoE) con 35 mil millones de parámetros totales y solo 3 mil millones activos por token, lo que permite una inferencia muy rápida en hardware de consumo. Dispone de una ventana de contexto de 262.144 tokens y soporte multimodal (texto, visión, audio) en 201 idiomas y dialectos. El adaptador *sensory* pretende especializar estas capacidades en tareas de percepción sensorial, aunque la model card no proporciona detalles sobre el dataset de entrenamiento ni los objetivos concretos del ajuste.

La relevancia de este modelo radica en que combina la eficiencia del MoE extremadamente disperso de Qwen3.5 con un ajuste específico para tareas sensoriales, lo que podría resultar útil en aplicaciones de robótica, procesamiento de señales o interfaces multimodales. Sin embargo, al tratarse de un adaptador sin documentación técnica detallada, su uso en producción requiere una evaluación cuidadosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre base Qwen3.5-35B-A3B; adaptador LoRA |
| Parametros totales | 35 B (modelo base) + adaptador LoRA (tamano del repo: 7,5 GB) |
| Parametros activos | 3 B por token (modelo base) |
| Longitud de contexto | 262.144 tokens (modelo base) |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base se suele ejecutar en Q8 |
| Idiomas soportados | 201 idiomas y dialectos (modelo base); no especificado para el adaptador |
| Licencia | no disponible (ni para el adaptador ni confirmada para el base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.5-35B-A3B` emplea una arquitectura transformer de tipo Mixture-of-Experts con una ratio de esparcimiento extremo: 35 B parámetros totales y solo 3 B activos por token. Esta configuración permite velocidades de decodificación muy superiores a las de un modelo denso equivalente, ya que la mayoría de los parámetros permanecen inactivos durante cada paso de inferencia. El modelo base es multimodal, con capacidades de visión y audio integradas, y soporta una ventana de contexto de 262.144 tokens.

El adaptador `sensory` fue entrenado mediante fine-tuning supervisado (SFT) con la librería PEFT (versión 0.18.1) y la herramienta Unsloth, que optimiza el entrenamiento de LoRA en GPUs de consumo. No se dispone de información sobre el dataset utilizado, los hiperparámetros de entrenamiento (tasa de aprendizaje, épocas, rango del LoRA, etc.) ni el régimen de precisión (fp16, bf16, etc.). El nombre "sensory" sugiere que el ajuste se orientó a tareas de percepción sensorial, pero no hay documentación que lo confirme.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.5-35B-A3B, que incluyen razonamiento avanzado, matemáticas y codificación.
- Multimodalidad: el modelo base soporta entrada de visión y audio, por lo que el adaptador podría heredar estas capacidades, aunque no se especifica si el ajuste las preserva o modifica.
- Tool calling y function calling: el modelo base Qwen3.5 soporta llamada a herramientas, lo que permite su integración en agentes y pipelines automatizados.
- Soporte de agentes y razonamiento multi-paso: el modelo base está diseñado para tareas de agente y razonamiento encadenado.
- Multilingüismo: 201 idiomas y dialectos soportados por el modelo base.
- Capacidades especiales: el adaptador se denomina "sensory", lo que podría implicar un ajuste para tareas de percepción (por ejemplo, interpretación de señales sensoriales), pero no hay evidencia documentada.

## Casos de uso

- Asistentes de voz y audio: gracias a la multimodalidad del modelo base, el adaptador podría emplearse en sistemas de transcripción o comprensión de audio en tiempo real, aunque se requiere verificar si el ajuste LoRA conserva estas capacidades.
- Agentes de automatización con tool calling: el modelo base soporta llamada a funciones, por lo que el adaptador puede integrarse en pipelines de automatización que requieran razonamiento multi-paso y acceso a herramientas externas.
- Procesamiento de documentos largos: con 262.144 tokens de contexto, es adecuado para resumir o analizar informes extensos, contratos o investigaciones académicas.
- Chatbots multilingües de atención al cliente: el soporte de 201 idiomas permite desplegar asistentes conversacionales en mercados globales con un solo modelo.
- Generación de código asistida: el modelo base tiene capacidades de codificación; el adaptador podría utilizarse en entornos de desarrollo integrado (IDE) para autocompletado o revisión de código.
- Prototipado de investigación en percepción sensorial: si el ajuste "sensory" efectivamente especializa el modelo en tareas de percepción, podría servir como base para experimentos en robótica o interfaces hombre-máquina, aunque se necesita documentación adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para el adaptador `JHofking/qwen3.5-35B-A3B-sensory` en la información disponible. Tampoco se proporcionan métricas del modelo base en las fuentes consultadas. Se recomienda evaluar el adaptador en tareas específicas antes de su uso en producción.

## Requisitos de hardware

- VRAM estimada: el modelo base con 35 B parámetros totales y 3 B activos puede ejecutarse en GPUs de consumo con 8 GB de VRAM en cuantización Q8, según fuentes de la comunidad. El adaptador LoRA añade una sobrecarga mínima (7,5 GB de pesos, pero solo se cargan los deltas).
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100, o GPUs de gama media con al menos 8 GB de VRAM para cuantización agresiva.
- Compatibilidad con consumer GPU: sí, gracias a la arquitectura MoE dispersa y a la posibilidad de cuantizar a Q8 o inferior.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Hugging Face Transformers con PEFT para cargar el adaptador sobre el base.
- Latencia y throughput: no disponible; depende de la GPU y la cuantización. El modelo base es conocido por su alta velocidad de decodificación en hardware de consumo (por ejemplo, en APUs como Strix Halo), pero no hay datos específicos para el adaptador.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con modelos alternativos. El adaptador es específico y no hay datos de rendimiento publicados. Como referencia, el modelo base Qwen3.5-35B-A3B compite con otros MoE eficientes como DeepSeek-V3-Lite o Qwen3-30B-A3B, pero no se dispone de datos concretos de estos últimos en las fuentes consultadas. Se indica "no disponible" para esta sección.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; el modelo base puede heredar sesgos de los datos de entrenamiento de Qwen3.5, pero no se ha realizado una auditoría específica.
- Riesgo de alucinación: inherente a los modelos generativos; el adaptador no incluye mecanismos adicionales de verificación.
- Limitaciones de contexto o idioma: el adaptador no especifica si mantiene el soporte completo de 201 idiomas del modelo base; es posible que el fine-tuning reduzca el rendimiento en algunos idiomas.
- Restricciones de licencia: la licencia no está disponible ni para el adaptador ni confirmada para el modelo base. Antes de un uso comercial, es imprescindible verificar los términos de la licencia de Qwen3.5 (normalmente Apache 2.0, pero no confirmado).
- Caveat para producción: la falta de documentación sobre el dataset de entrenamiento, los hiperparámetros y los objetivos del ajuste "sensory" hace que el comportamiento del adaptador sea impredecible. Se recomienda una evaluación exhaustiva en el dominio de aplicación antes de desplegarlo.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/JHofking/qwen3.5-35B-A3B-sensory
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Ficha del modelo base en Open-Source AI Stack: https://www.open-source-ai.tech/models/qwen3-5-35b-a3b
- Ficha del modelo base en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-5-35b-a3b/
- Ficha del modelo base en NeuralWire: https://neural-wire.com/modeldex/qwen-3-5-35b-a3b
- Ficha del modelo base en Weights & Biases: https://wandb.ai/site/inference-model/cw_qwen_qwen3.5-35b-a3b/
