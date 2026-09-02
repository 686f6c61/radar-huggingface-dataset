# Ank0805/Qwen2.5-Coder-7B-Agentic

## Resumen

Ank0805/Qwen2.5-Coder-7B-Agentic es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante supervisión fina (SFT) sobre el modelo base `unsloth/qwen2.5-coder-7b-instruct-bnb-4bit`, una versión cuantizada en 4 bits de Qwen2.5-Coder-7B-Instruct. El autor, Ank0805, publica este adaptador con la intención de dotar al modelo de capacidades agénticas, es decir, mejorar su comportamiento en tareas que requieren razonamiento multi-paso, uso de herramientas y ejecución de flujos de trabajo autónomos. El repositorio contiene únicamente los pesos del adaptador (0.2 GB), no el modelo completo, por lo que debe combinarse con el modelo base para su uso.

El modelo base, Qwen2.5-Coder-7B, es un transformer decoder-only de 7.6 mil millones de parámetros desarrollado por Alibaba Cloud, preentrenado sobre más de 5.5 billones de tokens de código y texto, con una ventana de contexto de 128K tokens. Este adaptador hereda todas las capacidades del modelo base (generación de código, razonamiento, multilingüismo) y añade un ajuste específico para escenarios agénticos, aunque la model card del autor no proporciona detalles sobre el dataset de entrenamiento ni los hiperparámetros utilizados. La relevancia de este modelo radica en su tamaño reducido (7B) combinado con la posibilidad de desplegarlo en hardware de consumo, lo que lo hace atractivo para prototipos y aplicaciones locales de agentes de IA.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA |
| Parametros totales | 7.6B (modelo base) + adaptador LoRA (tamaño no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128K tokens (heredada del modelo base) |
| Tipos de cuantizacion | No especificado para el adaptador; el modelo base se usó en bnb-4bit |
| Idiomas soportados | No especificado; el modelo base soporta múltiples idiomas (inglés, chino, español, etc.) |
| Licencia | No disponible (el modelo base Qwen2.5-Coder usa Apache 2.0) |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura Qwen2.5, un transformer decoder-only con atención de múltiples cabezas, normalización RMSNorm, y activación SwiGLU. El modelo base fue preentrenado sobre 5.5 billones de tokens, con una fase de instrucción posterior que incluye datos de código, matemáticas y razonamiento. El adaptador LoRA se entrenó mediante SFT (supervised fine-tuning) usando la librería PEFT 0.20.0 y el framework TRL, sobre la versión cuantizada en 4 bits del modelo instruct. No se dispone de información sobre el dataset de entrenamiento, el número de pasos, la tasa de aprendizaje ni el rango del adaptador. El tag `region:us` sugiere que el entrenamiento se realizó en infraestructura ubicada en Estados Unidos, pero no hay más detalles.

## Capacidades

- Generación de código en múltiples lenguajes (Python, JavaScript, C++, Java, etc.) heredada del modelo base.
- Razonamiento multi-paso y resolución de problemas matemáticos, gracias al ajuste instruct del modelo base.
- Soporte de tool calling y function calling, reforzado por el ajuste agéntico del adaptador.
- Capacidad para seguir instrucciones complejas y mantener conversaciones multi-turno.
- Multilingüismo: el modelo base soporta más de 30 idiomas, aunque el adaptador no especifica si mantiene esta cobertura.
- Ventana de contexto larga (128K tokens) que permite procesar repositorios completos o documentación extensa.
- El adaptador está optimizado para flujos de trabajo agénticos, como la orquestación de nodos y la generación de salidas JSON estructuradas (según la descripción de modelos similares en Ollama).

## Casos de uso

- Asistente de programación en entornos locales: el modelo puede integrarse en IDEs como VS Code o Neovim para autocompletar código, explicar fragmentos y refactorizar, aprovechando su contexto de 128K tokens para analizar proyectos completos.
- Agente de automatización de tareas: gracias al ajuste agéntico, puede ejecutar secuencias de acciones (llamadas a APIs, manipulación de archivos) siguiendo instrucciones de alto nivel, útil para scripts de automatización personal.
- Generación de documentación técnica: puede resumir código, generar docstrings y crear guías de usuario a partir de repositorios, con capacidad para manejar archivos largos.
- Chatbot de soporte técnico: con su capacidad multilingüe y de razonamiento, puede atender consultas de usuarios sobre productos de software, manteniendo el contexto de la conversación.
- Herramienta de análisis de código: puede identificar bugs, sugerir optimizaciones y explicar vulnerabilidades, apoyándose en su entrenamiento en código.
- Prototipado de agentes de IA en investigación: al ser un adaptador ligero sobre un modelo de 7B, permite experimentar con arquitecturas agénticas en GPUs de consumo sin necesidad de infraestructura de alto coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este adaptador en la información disponible. El modelo base Qwen2.5-Coder-7B-Instruct reporta en el technical report (arXiv:2409.12186) resultados destacados en HumanEval (85.2% pass@1), MBPP (84.2%) y en la suite de razonamiento matemático GSM8K (90.1%), así como un rendimiento líder entre modelos de menos de 7B parámetros. Sin embargo, no se puede asumir que el adaptador mantenga exactamente estos valores, ya que el ajuste agéntico podría alterar el equilibrio entre capacidades. Se recomienda evaluar el adaptador en las tareas específicas de interés antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada: el modelo base en 4 bits requiere aproximadamente 4-5 GB de VRAM para inferencia; el adaptador LoRA añade una sobrecarga mínima (menos de 0.5 GB). En total, se puede ejecutar en GPUs con 6 GB o más.
- GPUs recomendadas: RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4090 (24 GB) para mayor velocidad; también compatible con GPUs de datacenter como A10, A100 o H100.
- Cabe en GPUs de consumo: sí, en tarjetas con al menos 6 GB de VRAM.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (si se convierte a GGUF), TGI (Text Generation Inference) y transformers con PEFT.
- Latencia y throughput: no disponibles para este adaptador específico; el modelo base en 4-bit en una RTX 4090 puede generar alrededor de 50-80 tokens/segundo, pero depende de la implementación y el hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Ank0805/Qwen2.5-Coder-7B-Agentic | 7.6B + LoRA | 128K | No disponible | Agéntico, tool calling |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7.6B | 128K | Apache 2.0 | Instrucción general, código |
| code-forge-temple/agentic-signal-qwen2.5-coder:7b | 7.6B | 128K | No disponible | Agéntico, JSON estructurado, Ollama |

El adaptador de Ank0805 se diferencia del modelo instruct base por su ajuste específico para agentes, aunque carece de documentación pública sobre el proceso. El modelo de code-forge-temple, disponible en Ollama, tiene un propósito similar pero está optimizado para el ecosistema Agentic Signal. Ambos parten del mismo modelo base, por lo que las capacidades subyacentes son equivalentes; la diferencia radica en el dataset y la metodología de fine-tuning, que no se han hecho públicos.

## Limitaciones y advertencias

- La model card del autor está prácticamente vacía: no se especifican datos de entrenamiento, hiperparámetros, ni evaluación, lo que dificulta la reproducibilidad y la confianza en el ajuste.
- No se han publicado benchmarks del adaptador, por lo que su rendimiento real en tareas agénticas es desconocido.
- El adaptador se entrenó sobre una versión cuantizada en 4 bits del modelo base, lo que puede introducir una ligera degradación en la calidad de las respuestas en comparación con el modelo en precisión completa.
- La licencia no está declarada; aunque el modelo base es Apache 2.0, el adaptador podría tener restricciones adicionales. Se recomienda contactar al autor antes de un uso comercial.
- Riesgo de alucinación y sesgos: al ser un modelo de 7B, puede generar código incorrecto o información falsa, especialmente en dominios poco representados en su entrenamiento.
- El ajuste agéntico podría reducir el rendimiento en tareas generales de código si el dataset de fine-tuning fue demasiado específico; no hay evidencia de que mantenga el nivel del modelo instruct original.
- No se proporcionan instrucciones de uso ni ejemplos de código en la model card, lo que dificulta la integración inicial.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Ank0805/Qwen2.5-Coder-7B-Agentic
- Modelo base (Qwen2.5-Coder-7B-Instruct): https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Modelo base (Qwen2.5-Coder-7B): https://huggingface.co/Qwen/Qwen2.5-Coder-7B
- Technical report de Qwen2.5-Coder: https://arxiv.org/html/2409.12186v3
- Modelo similar en Ollama: https://ollama.com/code-forge-temple/agentic-signal-qwen2.5-coder:7b
