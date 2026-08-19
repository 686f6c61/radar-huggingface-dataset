# inclusionAI/Ling-3.0-flash-base

## Resumen

Ling-3.0-flash-base es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con atención lineal híbrida, desarrollado por inclusionAI como parte de la familia Ling-3.0. Este checkpoint concreto corresponde a la fase final del proceso de fusión WSM (Warmup-Stable and Merge), es decir, es el modelo base ya fusionado pero sin post-entrenamiento. Con 127.486 millones de parámetros totales y solo 5.100 millones activos por token, está diseñado para ofrecer un equilibrio entre capacidad y eficiencia computacional.

La relevancia de este modelo radica en tres innovaciones técnicas: una arquitectura MoE altamente dispersa (1/64) con 512 expertos enrutados, atención lineal híbrida nativa que combina KDA con Gated MLA para procesamiento eficiente de contextos largos, y el reemplazo del decay de tasa de aprendizaje convencional por fusión ponderada de checkpoints (WSM). Este último punto hace que el modelo sea especialmente adecuado para continuar pre-entrenamiento o fine-tuning sin las limitaciones de las curvas de aprendizaje tradicionales.

Es importante señalar que este checkpoint no está pensado para uso directo en producción ni para chat con usuarios finales. Su propósito es servir como base para investigación y desarrollo: continuación de pre-entrenamiento, mid-training, fine-tuning supervisado, optimización por preferencias y estudios sobre sistemas MoE y contexto largo. Para uso conversacional directo, inclusionAI publica los checkpoints post-entrenados (Ling-3.0-flash), que no son objeto de esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid-linear MoE (35 capas KDA + 7 capas Gated MLA, ratio 5:1) |
| Parametros totales | 127.486.405.600 (127,5B) |
| Parametros activos | 5,1B (no-embeddings) |
| Longitud de contexto | no disponible (terceros mencionan 256K nativo, extensible a 1M) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de Ling-3.0-flash-base combina dos mecanismos de atención en una configuración híbrida: 35 capas KDA (Kernel-based Dilated Attention) y 7 capas Gated MLA (Multi-head Latent Attention con compuerta), en proporción 5:1. Esta combinación busca aprovechar la eficiencia de la atención lineal para contextos largos manteniendo la calidad de la atención tradicional en las capas donde más se necesita. El modelo tiene 32 cabezas de atención, tamaño oculto de 2560, tamaño intermedio de experto de 768 y tamaño intermedio denso de 6144, con un vocabulario de 157.184 tokens.

La arquitectura MoE cuenta con 512 expertos enrutados y 1 experto compartido, de los cuales solo se activan 8 expertos enrutados y 1 compartido por token, resultando en 5,1B parámetros activos. El entrenamiento utiliza la técnica WSM (Warmup-Stable and Merge), documentada en el paper arXiv:2507.17634, que sustituye la fase de decay de learning rate por la fusión ponderada de checkpoints. Esto permite explorar diferentes perfiles de decay offline sin necesidad de reentrenar, y hace que el modelo sea más adecuado para continuación de pre-entrenamiento y expansión dinámica de datos. El checkpoint aquí descrito ha completado pre-entrenamiento y mid-training, y ha pasado por la fusión WSM, pero no por post-entrenamiento.

## Capacidades

- Generación de texto en modo base: el modelo puede continuar secuencias de texto, pero no está alineado para mantener conversaciones coherentes ni seguir instrucciones de forma fiable.
- Razonamiento matemático, codificación y comprensión multilingüe: el modelo base muestra capacidades en estos dominios según la evaluación interna de inclusionAI, aunque no se proporcionan cifras concretas.
- Procesamiento de contexto largo: gracias a la atención lineal híbrida, el modelo está diseñado para manejar secuencias largas de forma eficiente, con menor coste computacional que la atención cuadrática tradicional.
- Investigación y fine-tuning: el checkpoint es adecuado para continuación de pre-entrenamiento, mid-training, fine-tuning supervisado, optimización por preferencias (RLHF/DPO) y estudios de destilación.
- Sin tool calling ni capacidades de agente: al ser un modelo base sin post-entrenamiento, no incluye soporte para function calling ni razonamiento multi-paso guiado.

## Casos de uso

- Continuación de pre-entrenamiento: el modelo puede usarse como punto de partida para pre-entrenar con datos adicionales o dominios específicos, gracias a la ausencia de fase de decay gracias a WSM. Un equipo de investigación podría cargar los pesos y continuar el entrenamiento con su propio corpus.
- Fine-tuning supervisado para dominios especializados: por ejemplo, adaptar el modelo a terminología médica, legal o financiera mediante fine-tuning con datasets etiquetados del dominio. Su tamaño de 5,1B activos permite fine-tuning con recursos moderados en comparación con modelos densos de tamaño similar.
- Optimización por preferencias (RLHF/DPO): el checkpoint base es el punto de partida ideal para aplicar técnicas de alineación como DPO o PPO. Los investigadores pueden partir de este modelo y aplicar sus propias estrategias de alineación sin las limitaciones de un modelo ya post-entrenado.
- Investigación sobre sistemas MoE: con 512 expertos y una dispersión de 1/64, el modelo es un banco de pruebas excelente para estudiar enrutamiento de expertos, balanceo de carga, o políticas de activación selectiva.
- Investigación sobre atención lineal y contexto largo: la combinación KDA + Gated MLA permite experimentar con estrategias de atención híbrida, comparar rendimiento en tareas de recuperación de información en secuencias largas, o evaluar el impacto de la proporción entre capas lineales y atencionales.
- Destilación de conocimiento: dado que el modelo tiene 5,1B parámetros activos pero 127,5B totales, puede usarse como modelo profesor para destilar conocimiento en modelos densos más pequeños, aprovechando la capacidad de los expertos sin el coste de inferencia completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una evaluación interna con un conjunto de benchmarks propios que cubren matemáticas, codificación, razonamiento, comprensión multilingüe y contexto largo, y muestra una imagen comparativa, pero no se incluyen cifras numéricas accesibles. No se proporcionan datos de MMLU, HumanEval, GSM8K ni otros benchmarks estándar para este checkpoint específico.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 127,5B parámetros totales. En precisión FP16, el checkpoint ocupa aproximadamente 255 GB, por lo que se necesitan múltiples GPUs. Con cuantización a 8 bits, se estima un requerimiento de ~128 GB de VRAM; con 4 bits, ~64 GB. No se dispone de cuantizaciones oficiales publicadas.
- GPUs recomendadas: para inferencia en FP16 se requieren configuraciones multi-GPU, por ejemplo 4× H100 (80 GB) u 8× A100 (80 GB). Con cuantización agresiva podría ejecutarse en una sola GPU de 80 GB, aunque con degradación de calidad.
- GPU de consumo: no cabe en GPUs de consumo (RTX 4090 con 24 GB, etc.) incluso con cuantización de 4 bits, dado que los pesos superan los 64 GB.
- Opciones de despliegue: al ser un modelo base sin post-entrenamiento, no está recomendado para despliegue en producción. Para fine-tuning, puede usarse con frameworks como Hugging Face Transformers, DeepSpeed o Megatron-LM. Para inferencia, vLLM o TGI podrían dar soporte si se añade el modelo, aunque no hay confirmación oficial.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Arquitectura |
|---|---|---|---|---|---|
| Ling-3.0-flash-base | 127,5B | 5,1B | no disponible | MIT | Hybrid-linear MoE |
| DeepSeek-V3 | 671B | 37B | 128K | MIT | MoE densa |
| Qwen3-30B-A3B | 30,5B | 3,3B | 32K | Apache 2.0 | MoE densa |
| Llama 3.1 70B | 70,6B | 70,6B (denso) | 128K | Llama 3.1 | Transformer denso |

La comparativa se basa en datos públicos de cada modelo. Ling-3.0-flash-base se distingue por su atención híbrida lineal y su ratio de dispersión extremo (1/64), que lo hace significativamente más eficiente en activación que DeepSeek-V3 (1/18) o Qwen3-30B-A3B (1/9). Sin embargo, al ser un modelo base sin post-entrenamiento, no es directamente comparable en tareas de chat o instrucción con modelos alineados como los citados.

## Limitaciones y advertencias

- Modelo sin alineación: al ser un checkpoint base sin post-entrenamiento, puede generar contenido inapropiado, ofensivo o sesgado. No debe usarse directamente en aplicaciones orientadas al usuario final.
- Sin soporte para tool calling ni uso como agente: estas capacidades requieren post-entrenamiento específico que este checkpoint no ha recibido.
- Sesgos y alucinaciones: el modelo puede reflejar sesgos presentes en sus datos de entrenamiento y producir información falsa o inventada. No hay información sobre evaluaciones de sesgo para este modelo.
- Limitaciones de idioma: no se ha publicado información sobre los idiomas soportados. Se desconoce su rendimiento en español u otros idiomas distintos de los dominantes en el corpus de entrenamiento.
- Licencia MIT: permite uso comercial sin restricciones, pero el modelo base no es apto para producción sin un proceso completo de alineación y validación. El autor recomienda explícitamente no usarlo en aplicaciones de seguridad crítica.
- Requisitos de hardware elevados: a pesar de tener solo 5,1B parámetros activos, los 127,5B totales requieren infraestructura multi-GPU para cargar los pesos, lo que limita su uso a organizaciones con recursos computacionales significativos.
- Información incompleta: no se dispone de datos sobre cuantizaciones oficiales, longitud de contexto exacta, idiomas soportados ni benchmarks numéricos, lo que dificulta una evaluación completa del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/inclusionAI/Ling-3.0-flash-base
- Organización inclusionAI en HuggingFace: https://huggingface.co/inclusionAI
- Organización inclusionAI en ModelScope: https://modelscope.cn/organization/inclusionAI
- Modelo post-entrenado Ling-3.0-flash: https://huggingface.co/inclusionAI/Ling-3.0-flash
- Checkpoint pre-entrenado Ling-3.0-flash-base-30T: https://huggingface.co/inclusionAI/Ling-3.0-flash-base-30T
- Checkpoint mid-trained Ling-3.0-flash-base-midtrain: https://huggingface.co/inclusionAI/Ling-3.0-flash-base-midtrain
- Paper WSM (arXiv): https://arxiv.org/abs/2507.17634
- Repositorio ling-cookbook: https://github.com/inclusionAI/ling-cookbook/
- Modelo en OpenRouter: https://openrouter.ai/inclusionai/ling-3.0-flash:free
