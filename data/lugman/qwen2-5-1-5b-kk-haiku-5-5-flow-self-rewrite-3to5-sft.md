# lugman/Qwen2.5-1.5B-KK-Haiku-5.5-Flow-Self-Rewrite-3to5-SFT

## Resumen

El modelo `lugman/Qwen2.5-1.5B-KK-Haiku-5.5-Flow-Self-Rewrite-3to5-SFT` es un ajuste fino (SFT, *supervised fine-tuning*) del modelo base `unsloth/Qwen2.5-1.5B-Instruct`, desarrollado por el usuario `lugman`. Se trata de un derivado de la familia Qwen2.5 de Alibaba, en su variante pequeña de 1.500 millones de parámetros, entrenado con la librería Unsloth y TRL de Hugging Face. El nombre sugiere un entrenamiento orientado a la generación de haikus y a una tarea de "auto-reescritura" con iteraciones de 3 a 5 pasos, aunque la model card no documenta la metodología, el dataset ni los objetivos concretos del ajuste.

El modelo resuelve, en principio, la adaptación del Qwen2.5-1.5B-Instruct a un dominio creativo muy específico (poesía breve en formato haiku) y a una dinámica de reescritura iterativa. Su relevancia práctica es limitada: se publica sin métricas, sin dataset documentado y con cero descargas ni interacciones en el momento de la ficha, lo que lo convierte en un artefacto experimental más que en un modelo listo para producción.

Arquitectónicamente hereda el transformer decoder-only de Qwen2.5, con 1.543.714.304 parámetros reales según los pesos en safetensors, licencia Apache 2.0 y un tamaño de repositorio de 9,3 GB (que incluye checkpoints de entrenamiento además de los pesos finales). El contexto, los idiomas y el resto de especificaciones se heredan del modelo base, no del ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, heredada de Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta hasta 32.768 tokens, dato no confirmado para este ajuste) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | en (segun la model card y los tags) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Modelo base | unsloth/Qwen2.5-1.5B-Instruct |
| Tamano del repositorio | 9,3 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) sobre `unsloth/Qwen2.5-1.5B-Instruct`, que a su vez es una versión del Qwen2.5-1.5B-Instruct preparada por Unsloth para entrenamiento eficiente. La arquitectura subyacente es un transformer decoder-only con atención causal, típico de la familia Qwen2, con normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). No se trata de un modelo MoE ni híbrido: todos los parámetros están activos en cada forward pass.

El entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, según indica la model card, lo que implica un pipeline de fine-tuning supervisado con optimizaciones de memoria y velocidad (kernel fusionado, grad checkpointing selectivo, etc.). No se documentan el número de tokens de entrenamiento, la composición del dataset, la presencia de RLHF/DPO ni ninguna innovación técnica adicional. El nombre del modelo sugiere una tarea de auto-reescritura iterativa (3 a 5 pasos) sobre haikus, pero no hay información que permita verificar la metodología ni el corpus utilizado.

## Capacidades

- Generación de texto conversacional, heredada del Qwen2.5-1.5B-Instruct.
- Generación creativa de poesía breve, presumiblemente orientada a haikus según el nombre del modelo (no verificado en la model card).
- Reescritura iterativa de texto en 3 a 5 pasos, según sugiere el sufijo `Self-Rewrite-3to5` (no documentado).
- Soporte de conversación multi-turno en formato chat (heredado del modelo base Instruct).
- Capacidades multilingües limitadas al inglés según los metadatos (`language: en`); el modelo base Qwen2.5 soporta más idiomas, pero este ajuste no lo declara.
- Tool calling y function calling: no disponible en la información proporcionada para este ajuste concreto.
- Capacidades de agente y multi-step reasoning: no documentadas.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Generación de haikus y poesía breve: el modelo se ha ajustado específicamente para este formato, por lo que puede emplearse en aplicaciones de contenido creativo literario o generación de micropoesía para redes sociales.
- Reescritura iterativa de textos cortos: el sufijo `Self-Rewrite-3to5` sugiere un pipeline de refinamiento en varias pasadas, útil para tareas de edición automática de frases o mejora de estilo.
- Prototipado de asistentes conversacionales ligeros: con 1.500 millones de parámetros, puede desplegarse en hardware modesto para demos de chatbot en inglés.
- Experimentación académica en fine-tuning: sirve como ejemplo de ajuste SFT con Unsloth y TRL sobre un modelo pequeño, útil para reproducir pipelines de entrenamiento.
- Generación de texto creativo con restricciones de formato: adecuado para tareas donde se requiere una estructura poética concreta (5-7-5 sílabas), aunque la calidad no está validada.
- Filtrado y clasificación de texto: el modelo base Instruct tiene capacidades generales que podrían aprovecharse para tareas de etiquetado simple, aunque el ajuste específico puede degradar el rendimiento general.
- Educación y divulgación: útil como ejemplo didáctico de cómo se publica un modelo ajustado en Hugging Face con la plantilla de Unsloth.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,1 GB solo para pesos (1.543.714.304 parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, unos 4-5 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,6 GB para pesos; unos 2,5-3 GB en total.
- VRAM estimada en cuantización de 4 bits: aproximadamente 0,8 GB para pesos; unos 1,5-2 GB en total.
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB de VRAM puede ejecutar el modelo en fp16; una RTX 3060, RTX 4060, RTX 4090 o superiores son suficientes. Para cuantización 4 bits, cabe incluso en GPUs integradas o en CPU con llama.cpp.
- Cabe en GPU consumer: sí, en la mayoría de GPUs modernas con 6 GB o más.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), vLLM, llama.cpp y Ollama (previas conversión a GGUF, no publicada en el repo).
- Latencia y throughput estimados: no disponibles; para un modelo de 1,5B en una RTX 4090 se esperan decenas de tokens por segundo, pero no hay mediciones publicadas para este ajuste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| lugman/Qwen2.5-1.5B-KK-Haiku-5.5-Flow-Self-Rewrite-3to5-SFT | 1.543.714.304 | no disponible | apache-2.0 | Hugging Face, 0 descargas |
| Qwen2.5-1.5B-Instruct (Alibaba) | 1.540 millones aprox. | 32.768 tokens (modelo base) | apache-2.0 | Hugging Face, ampliamente usado |
| unsloth/Qwen2.5-1.5B-Instruct | 1.540 millones aprox. | 32.768 tokens (modelo base) | apache-2.0 | Hugging Face, versión optimizada para fine-tuning |
| SmolLM2-1.7B-Instruct (Hugging Face) | 1.700 millones aprox. | 8.192 tokens | apache-2.0 | Hugging Face, con benchmarks publicados |

El modelo comparado más directo es el propio Qwen2.5-1.5B-Instruct, del que hereda arquitectura y pesos. Frente a él, este ajuste no aporta métricas ni documentación que justifiquen su uso sobre el original, salvo para la tarea específica de haikus. SmolLM2-1.7B-Instruct es una alternativa de tamaño similar con benchmarks públicos y mayor adopción comunitaria.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento, la metodología y los objetivos, lo que impide evaluar la calidad y la reproducibilidad del ajuste.
- Cero descargas y cero likes en el momento de la ficha: no hay evidencia de uso ni validación por parte de la comunidad.
- Riesgo elevado de sobreajuste a la tarea específica (haikus y reescritura iterativa), con posible degradación de las capacidades generales del modelo base.
- Idiomas limitados al inglés según los metadatos; no se declara soporte para castellano ni otros idiomas.
- Longitud de contexto no documentada para este ajuste; se desconoce si se ha preservado la ventana del modelo base.
- Riesgo de alucinación inherente a los modelos de 1,5B parámetros, especialmente en tareas de razonamiento o conocimiento factual.
- Sesgos heredados del corpus de entrenamiento del modelo base, no evaluados ni mitigados en este ajuste.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentación y de benchmarks desaconseja su uso en producción sin una evaluación previa.
- El repositorio de 9,3 GB incluye probablemente checkpoints intermedios de entrenamiento, lo que puede confundir al usuario que busque solo los pesos finales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lugman/Qwen2.5-1.5B-KK-Haiku-5.5-Flow-Self-Rewrite-3to5-SFT
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct
- Modelo original de Alibaba: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Librería TRL de Hugging Face: https://github.com/huggingface/trl
