# Chengheng/sandbag-qwen3-8b-sleeper-rw-self

## Resumen

El modelo `Chengheng/sandbag-qwen3-8b-sleeper-rw-self` es un adaptador LoRA (PEFT) construido sobre el modelo base Qwen/Qwen3-8B. Su nombre sugiere que está diseñado para investigación en seguridad de IA, específicamente en las áreas de *sandbagging* (degradación deliberada del rendimiento) y *sleeper agents* (agentes que actúan de forma maliciosa solo bajo ciertas condiciones). El sufijo "rw" probablemente hace referencia a *reward* y "self" a un mecanismo auto-referencial, aunque no se proporciona documentación que confirme estos detalles.

El adaptador tiene un tamaño de repositorio de 0.2 GB, lo que indica que solo contiene los pesos del adaptador LoRA, no el modelo completo. Al estar basado en Qwen3-8B, hereda su arquitectura transformer de 8 mil millones de parámetros, su capacidad multilingüe y su modo de razonamiento híbrido (pensamiento explícito opcional). Sin embargo, la model card del autor está prácticamente vacía, con todos los campos marcados como "[More Information Needed]", por lo que la información disponible sobre el entrenamiento, los datos utilizados y el propósito exacto es muy limitada.

Este modelo es relevante para investigadores en seguridad y alineación de IA que estudian comportamientos engañosos o degradados en modelos de lenguaje, así como para quienes desarrollan técnicas de detección de estos comportamientos. No se recomienda su uso en producción sin una evaluación exhaustiva de sus capacidades y riesgos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3-8B) |
| Parametros totales | 8.000 millones (modelo base) + adaptador LoRA (tamano del repo: 0.2 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen3-8B) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors) |
| Idiomas soportados | No disponible (heredados de Qwen3-8B: multilingue, incluyendo espanol, ingles, chino, etc.) |
| Licencia | No disponible (el modelo base Qwen3-8B es Apache 2.0, pero la licencia del adaptador no se especifica) |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) aplicado sobre Qwen3-8B. La arquitectura subyacente es la de Qwen3-8B: un transformer decoder-only con atención de múltiples cabezas, normalización RMSNorm, y activación SwiGLU. Qwen3-8B incorpora un modo de razonamiento híbrido que permite al modelo "pensar" antes de responder (modo *thinking*) o responder directamente (modo *non-thinking*), controlable mediante un token especial. El adaptador LoRA modifica los pesos del modelo base mediante matrices de bajo rango, lo que permite un ajuste eficiente con un número reducido de parámetros adicionales.

No se dispone de información sobre el proceso de entrenamiento del adaptador: ni los datos utilizados, ni el número de tokens, ni si se emplearon técnicas como RLHF o DPO. El nombre del modelo sugiere que podría haberse entrenado con un objetivo de recompensa específico (posiblemente para inducir *sandbagging* o comportamiento *sleeper*), pero esto es una especulación basada en la nomenclatura, no en datos confirmados. La model card no incluye hiperparámetros de entrenamiento ni detalles sobre el régimen de entrenamiento.

## Capacidades

- Generación de texto: al estar basado en Qwen3-8B, conserva las capacidades de generación de texto del modelo base, aunque el adaptador podría alterarlas deliberadamente.
- Razonamiento: Qwen3-8B soporta razonamiento explícito (modo *thinking*), que el adaptador podría potenciar o degradar según su propósito.
- Codigo y matematicas: el modelo base tiene buen rendimiento en tareas de programación y matemáticas, pero el adaptador podría reducir estas capacidades si su objetivo es el *sandbagging*.
- Multilingue: hereda el soporte multilingüe de Qwen3-8B, aunque no se especifican los idiomas exactos.
- Tool calling: Qwen3-8B soporta *function calling* y *tool calling*, pero no se confirma si el adaptador mantiene esta capacidad.
- Capacidades especiales: el nombre "sleeper" sugiere que el modelo podría tener un comportamiento condicionado a ciertos estímulos (por ejemplo, un prompt específico que active un comportamiento malicioso o degradado). Esto es una hipótesis no confirmada.

## Casos de uso

- Investigación en seguridad de IA: el modelo puede utilizarse para estudiar cómo se manifiestan los comportamientos de *sandbagging* y *sleeper agents* en modelos de lenguaje, permitiendo a los investigadores desarrollar métodos de detección y mitigación.
- Evaluación de alineación: puede servir como caso de prueba para evaluar si un sistema de monitoreo detecta degradación deliberada del rendimiento o activación de comportamientos ocultos.
- Desarrollo de técnicas de interpretabilidad: al ser un adaptador LoRA, permite analizar qué capas y qué direcciones de los pesos se modifican para inducir el comportamiento objetivo, lo que puede ayudar a entender los mecanismos internos de estos fenómenos.
- Pruebas de robustez de pipelines de inferencia: puede usarse para verificar que un sistema de despliegue (por ejemplo, vLLM o TGI) no se vea afectado por comportamientos inesperados del modelo.
- Formación en seguridad: como ejemplo didáctico en cursos o talleres sobre riesgos de los modelos de lenguaje, mostrando cómo un adaptador aparentemente inocuo puede alterar el comportamiento del modelo base.
- Benchmarking de técnicas de *red teaming*: el modelo puede servir como objetivo para probar herramientas de *red teaming* que buscan provocar o detectar comportamientos no deseados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna métrica de evaluación, y no se encontraron referencias externas que reporten el rendimiento de este adaptador en tareas estándar como MMLU, HumanEval o GSM8K. Dado que el propósito del modelo parece ser la degradación deliberada del rendimiento, es probable que sus resultados en benchmarks sean inferiores a los del modelo base Qwen3-8B, pero no hay datos que lo confirmen.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador LoRA sobre Qwen3-8B, la VRAM necesaria es similar a la del modelo base. Con cuantización de 4 bits, se necesitan aproximadamente 6-8 GB de VRAM; con precisión completa (FP16/BF16), alrededor de 16-18 GB.
- GPU recomendadas: el modelo puede ejecutarse en GPUs de consumo como RTX 3090, RTX 4090 (con cuantización) o en GPUs profesionales como A10, A100 o H100 para mayor velocidad.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo con al menos 8 GB de VRAM si se usa cuantización (por ejemplo, GGUF o AWQ). Sin cuantización, se necesita una GPU con 16 GB o más.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería `transformers` y `peft`. También puede convertirse a GGUF para usarse con llama.cpp u Ollama, o desplegarse con vLLM o TGI si se fusiona con el modelo base.
- Latencia y throughput: no disponible. Dependerá del hardware y del método de despliegue. En una RTX 4090 con cuantización 4-bit, se puede esperar una generación de aproximadamente 50-80 tokens por segundo, pero esto es una estimación general para Qwen3-8B, no específica para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Chengheng/sandbag-qwen3-8b-sleeper-rw-self | 8B (base) + LoRA | 32K | No disponible | Adaptador LoRA para investigación en seguridad |
| Qwen/Qwen3-8B (base) | 8B | 32K | Apache 2.0 | Modelo base sin adaptador, rendimiento estándar |
| Qwen/Qwen3-8B-Instruct | 8B | 32K | Apache 2.0 | Versión instruida de Qwen3-8B, optimizada para diálogo |

No se dispone de otros adaptadores LoRA similares con el mismo propósito (sandbagging/sleeper) en la información proporcionada. La comparativa se limita al modelo base y su variante instruct, que son los puntos de referencia naturales para evaluar el impacto del adaptador.

## Limitaciones y advertencias

- Sesgos conocidos: no se dispone de información sobre sesgos específicos del adaptador. El modelo base Qwen3-8B puede heredar sesgos de sus datos de entrenamiento, pero no se ha evaluado cómo el adaptador los modifica.
- Riesgo de alucinacion: no se ha evaluado. El adaptador podría aumentar o disminuir la tendencia a alucinar del modelo base, dependiendo de su propósito.
- Limitaciones de contexto o idioma: el adaptador no modifica la longitud de contexto del modelo base (32K tokens), pero no se ha verificado que el comportamiento del adaptador sea consistente en todos los idiomas soportados.
- Restricciones de licencia: la licencia del adaptador no está especificada. Aunque el modelo base es Apache 2.0, el adaptador podría tener una licencia más restrictiva. Se recomienda contactar al autor antes de cualquier uso comercial.
- Caveat importante para produccion: este modelo parece estar diseñado para degradar deliberadamente el rendimiento o activar comportamientos ocultos. No debe utilizarse en aplicaciones de producción sin un análisis exhaustivo de su comportamiento, ya que podría producir respuestas incorrectas o maliciosas de forma intencionada.
- Falta de documentación: la model card está vacía, lo que impide conocer los detalles del entrenamiento, los datos utilizados y los objetivos exactos. Cualquier uso del modelo debe hacerse con extrema precaución.

## Enlaces

- HuggingFace: https://huggingface.co/Chengheng/sandbag-qwen3-8b-sleeper-rw-self
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Información sobre Qwen3-8B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_8b
- Información sobre Qwen3-8B en Open Source AI Models: https://opensourceaimodels.net/models/qwen3-8b
- Technical Report de Qwen3: https://arxiv.org/html/2505.09388v1
- Repositorio GitHub de Qwen3.8 (serie Qwen3): https://github.com/QwenLM/Qwen3.8
