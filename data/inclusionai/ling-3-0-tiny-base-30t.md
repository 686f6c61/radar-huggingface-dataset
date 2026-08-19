# inclusionAI/Ling-3.0-tiny-base-30T

## Resumen

Ling-3.0-tiny-base-30T es un checkpoint de pre-entrenamiento de la serie Ling-3.0, la familia de modelos de lenguaje de InclusionAI (división de IA de Ant Group). Este modelo concreto corresponde a la fase de pre-entrenamiento a gran escala, antes de las etapas de mid-training, fusión WSM y post-entrenamiento. Está diseñado como base para investigación y desarrollo: continuación de pre-entrenamiento, fine-tuning, optimización de preferencias y estudios sobre arquitecturas MoE híbridas.

El modelo emplea una arquitectura MoE (Mixture of Experts) con atención lineal híbrida nativa, combinando capas KDA (Key-Value Decomposed Attention) con capas Gated MLA (Multi-head Latent Attention) en proporción 3:1. Tiene 8.209.997.600 parámetros totales (según los pesos safetensors) y activa solo 1.300 millones de parámetros por token, gracias a sus 128 expertos enrutados con 8 activos y 1 experto compartido. Esta eficiencia lo hace atractivo para despliegue en entornos con recursos limitados, aunque este checkpoint concreto no está pensado para uso directo en producción.

La relevancia de este lanzamiento radica en que InclusionAI publica checkpoints intermedios del entrenamiento para permitir a la comunidad experimentar con diferentes estrategias de pre-entrenamiento continuo, mid-training y fusión de pesos, siguiendo la técnica WSM (Warmup-Stable and Merge) descrita en el paper arXiv:2507.17634.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid-linear MoE (18 capas KDA + 6 capas Gated MLA, proporción 3:1) |
| Parametros totales | 8.209.997.600 (8,2B) |
| Parametros activos | 1,3B (8 expertos enrutados + 1 experto compartido de 128) |
| Longitud de contexto | no disponible (el modelo final Ling-3.0-tiny soporta 256K, no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible (pesos originales en FP32/FP16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Ling-3.0-tiny-base-30T utiliza una arquitectura híbrida que combina atención lineal (KDA) con atención latente con compuerta (Gated MLA). Esta combinación, aplicada desde el inicio del pre-entrenamiento, permite procesar contextos largos de forma eficiente al reducir la complejidad computacional de la atención. La capa densa adicional (1 capa densa) complementa la mezcla de expertos. El modelo tiene 16 cabezas de atención, tamaño oculto de 1536, tamaño intermedio de experto de 512 y tamaño intermedio denso de 4608, con un vocabulario de 157.184 tokens.

El entrenamiento sigue el enfoque WSM (Warmup-Stable and Merge), que sustituye la caída de tasa de aprendizaje convencional por una fusión ponderada de checkpoints. Esto elimina la fase de decay, lo que hace que el modelo base sea más adecuado para pre-entrenamiento continuo y expansión dinámica de datos. El nombre del checkpoint indica que se procesaron 30 billones de tokens durante el pre-entrenamiento, aunque no se especifica la composición exacta del dataset. Este checkpoint no ha pasado por mid-training ni por post-entrenamiento.

## Capacidades

- Generación de texto y modelado del lenguaje: al ser un modelo base pre-entrenado, es capaz de continuar secuencias de texto y predecir tokens con coherencia estadística.
- Razonamiento emergente: aunque no ha sido alineado, puede mostrar capacidades básicas de razonamiento y conocimiento factual extraídas del pre-entrenamiento.
- Soporte multilingüe: no se especifican idiomas, pero el vocabulario de 157K tokens sugiere cobertura multilingüe amplia (no confirmado).
- No incluye capacidades de tool calling, function calling, ni modos de razonamiento explícitos, ya que estas se añaden en fases posteriores de post-entrenamiento.
- No dispone de capacidades de visión ni audio; es exclusivamente un modelo de texto.

## Casos de uso

- Continuación de pre-entrenamiento: investigadores pueden tomar este checkpoint y seguir entrenando con datasets adicionales o dominios específicos, aprovechando que no tiene decay de learning rate.
- Fine-tuning supervisado para tareas concretas: clasificación de texto, extracción de información o generación de respuestas en dominios especializados (legal, médico, técnico) tras un fine-tuning con datos etiquetados.
- Investigación en arquitecturas MoE: al ser un modelo base con 128 expertos y solo 8 activos, es útil para estudiar rutas de enrutamiento, equilibrio de carga entre expertos y estrategias de regularización.
- Optimización de preferencias y RL: sirve como punto de partida para experimentos con DPO, PPO u otros métodos de alineación, ya que no ha sido post-entrenado.
- Investigación en atención lineal híbrida: permite evaluar el rendimiento de la combinación KDA + Gated MLA frente a arquitecturas transformer estándar en tareas de largo contexto.
- Distilación de conocimiento: al ser un modelo compacto (1,3B activos), puede usarse como modelo profesor o alumno en experimentos de destilación hacia modelos más pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una evaluación con una suite propia que cubre conocimiento, código, matemáticas, razonamiento, comprensión multilingüe y largo contexto, pero los resultados se presentan en una imagen no accesible en el texto. No se proporcionan valores numéricos comparativos.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 16,4 GB en FP32/FP16, por lo que en FP16 se necesitan al menos 16 GB de VRAM. Con cuantización a 8 bits se reduciría a ~8 GB, y a 4 bits a ~4 GB (estimaciones basadas en el tamaño de parámetros).
- GPU recomendadas: una RTX 3090 o RTX 4090 (24 GB) puede ejecutar el modelo en FP16 sin problemas. Para cuantización de 8 bits, una RTX 3060 (12 GB) sería suficiente.
- Al ser un MoE con solo 1,3B parámetros activos, la inferencia es eficiente en cómputo, pero la memoria necesaria depende del peso total (8,2B).
- Opciones de despliegue: al ser un checkpoint base sin post-entrenamiento, no está optimizado para frameworks de inferencia como vLLM u Ollama. Para fine-tuning se recomienda usar bibliotecas como Hugging Face Transformers o el ling-cookbook de InclusionAI.
- Latencia y throughput: no se dispone de datos medidos.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. Este checkpoint base se puede comparar cualitativamente con otros modelos MoE de tamaño similar, como Qwen3-4B (MoE con 3,9B totales y 0,8B activos) o MiniCPM-MoE-8x2B (2,4B activos), pero no hay datos de benchmarks que permitan una comparación objetiva. La licencia MIT y la disponibilidad de checkpoints intermedios son ventajas diferenciales frente a otros modelos con licencias más restrictivas.

## Limitaciones y advertencias

- Es un checkpoint de pre-entrenamiento sin alineamiento: no está diseñado para conversación directa ni para uso en producción sin un post-entrenamiento y evaluación adicional.
- Riesgo de alucinación y sesgos: al no haber pasado por fine-tuning instructivo, puede generar contenido factualmente incorrecto, sesgado o inapropiado.
- Sin soporte de tool calling ni funciones de agente: estas capacidades solo aparecen en el modelo post-entrenado (Ling-3.0-tiny).
- Longitud de contexto no confirmada: aunque el modelo final soporta 256K, este checkpoint base podría tener una ventana de contexto menor; se recomienda verificar antes de usarlo.
- Idiomas no especificados: no se garantiza cobertura multilingüe uniforme.
- Licencia MIT: permite uso comercial, pero el usuario es responsable de cumplir con las regulaciones aplicables y de evaluar los riesgos del contenido generado.

## Enlaces

- Hugging Face: https://huggingface.co/inclusionAI/Ling-3.0-tiny-base-30T
- Modelo post-entrenado Ling-3.0-tiny: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- GitHub de InclusionAI Ling: https://github.com/inclusionAI/Ling
- Paper WSM (arXiv:2507.17634): https://arxiv.org/abs/2507.17634
- Documentación de modelos Ling: https://developer.ant-ling.com/en/docs/models/ling/
- Ling-cookbook (ejemplos de fine-tuning): https://github.com/inclusionAI/ling-cookbook/
