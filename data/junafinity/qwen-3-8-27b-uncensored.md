# junafinity/Qwen-3.8-27B-Uncensored

## Resumen

Qwen-3.8-27B-Uncensored es un checkpoint derivado de Qwen/Qwen3.8-27B, desarrollado por junafinity, en el que se ha eliminado la dirección de rechazo (refusal) del modelo mediante una técnica de abliteración automática llamada ZeroFuse. El resultado es un modelo multimodal (imagen, vídeo y texto) que conserva todas las capacidades del modelo original pero sin los mecanismos de rechazo entrenados por seguridad. Está pensado exclusivamente como instrumento de investigación para red teaming y ciberseguridad defensiva, no para uso general.

Se trata de una edición directa de pesos, no de un fine-tuning: no hay entrenamiento con gradientes, LoRA ni adaptadores. La intervención se limita a eliminar una proyección de rango 1 de un subconjunto de tensores del decoder de lenguaje, dejando intactos el vision tower, los embeddings y la cabeza de salida. El modelo mantiene la arquitectura original de Qwen3.8-27B, con 27.781 millones de parámetros y un tamaño de checkpoint de aproximadamente 52 GB en bf16. La licencia es Apache 2.0, lo que permite uso comercial con las restricciones que el propio autor especifica en la model card.

La relevancia de este modelo radica en que permite medir el techo real de capacidad de un modelo de seguridad, separando lo que el modelo puede hacer de lo que se le ha enseñado a rechazar. Es una herramienta de control experimental para evaluar filtros, clasificadores y capas de moderación externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basado en Qwen3.8-27B |
| Parametros totales | 27.781.427.952 (27,8 B) |
| Parametros activos | no disponible (no se especifica si es MoE; el nombre sugiere modelo denso) |
| Longitud de contexto | no disponible (no se publica en la ficha; el modelo base Qwen3.8-27B soporta contexto largo, pero no se confirma) |
| Tipos de cuantizacion | bf16 (checkpoint principal), 8-bit MLX (variante para Apple Silicon) |
| Idiomas soportados | no disponible (el modelo base Qwen3.8-27B es multilingue, pero no se detalla en esta ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer multimodal de 27,8 mil millones de parámetros que procesa imágenes, vídeo y texto. La arquitectura del decoder de lenguaje es la estándar de Qwen, con atención por capas y MLP. No se ha realizado ningún entrenamiento adicional: el checkpoint es una edición directa de los pesos originales.

La técnica empleada es abliteración, siguiendo la línea de trabajo de Arditi et al. (2024). ZeroFuse, la herramienta utilizada, estima la dirección de rechazo del modelo, la ortogonaliza fuera de los escritores del residual stream y ejecuta una búsqueda de dos objetivos para maximizar la eliminación de rechazos minimizando la perturbación de la distribución de salida. Los pesos modificados son únicamente `o_proj` de atención y `down_proj` de MLP en las capas del decoder; el vision tower, los embeddings, la cabeza de salida y las normalizaciones permanecen bit-idénticos al modelo base. No hay hooks en tiempo de inferencia ni vectores de control, por lo que el overhead es cero.

## Capacidades

- Generación de texto y razonamiento: conserva todas las capacidades lingüísticas y de razonamiento del modelo base Qwen3.8-27B.
- Comprensión multimodal: procesa imágenes y vídeo, ya que el vision tower no ha sido modificado.
- Sin rechazos por seguridad: el modelo no incorpora los mecanismos de rechazo entrenados, lo que permite generar contenido que el modelo base declinaría.
- Tool calling y function calling: hereda las capacidades del modelo base, aunque no se documentan explícitamente en esta ficha.
- Multilingüe: el modelo base es multilingüe, pero no se especifican los idiomas concretos en esta variante.
- Sin modo de pensamiento especial: no se menciona un modo "thinking" adicional; el comportamiento es el del modelo base sin capa de rechazo.

## Casos de uso

- Medición del techo de capacidad: usar el modelo como mitad de tratamiento en un par controlado frente al modelo base para determinar qué puede producir realmente un sistema en un dominio concreto, independientemente de los rechazos.
- Evaluación de capas defensivas: probar filtros de entrada, clasificadores de salida y APIs de moderación cuando el propio modelo no contribuye con rechazos, para identificar huecos en el plano de control defensivo.
- Aislamiento de superficie de ataque: en bucles automatizados de red teaming, eliminar rechazos no relacionados permite aislar el control bajo prueba (inyección de prompts, abuso de herramientas, exfiltración de datos, bypass de políticas).
- Generación de datos etiquetados para detección: producir completaciones etiquetadas para entrenar o evaluar modelos de moderación de contenido y detección de abuso.
- Investigación en interpretabilidad: el par base vs. abliterado sirve como control experimental limpio para estudiar cómo se codifica el rechazo en el espacio residual.
- Pruebas de robustez de sistemas de agentes: evaluar cómo se comportan los agentes que usan este modelo cuando se les pide ejecutar acciones que el modelo base rechazaría, para validar políticas de seguridad externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones. Tampoco se publican datos de throughput o latencia, ya que el autor indica que este checkpoint no es una "SKU de velocidad" y no publica tok/s.

## Requisitos de hardware

- Checkpoint bf16 (~52 GB): requiere al menos 60 GB de VRAM para inferencia con overhead de runtime. GPU recomendadas: A100 80GB, H100 80GB, o configuraciones multi-GPU.
- Variante 8-bit MLX (~28 GB): diseñada para Apple Silicon con 32 GB o más de memoria unificada (por ejemplo, M1 Pro/Max, M2 Pro/Max, M3 Pro/Max).
- No cabe en GPUs de consumo típicas (RTX 4090 tiene 24 GB, insuficiente para bf16; la versión 8-bit podría caber con cuantización adicional, pero no se ofrece oficialmente).
- Opciones de despliegue: transformers con carga estándar, vLLM (compatible con el formato), llama.cpp (si se convierte a GGUF), MLX para Apple Silicon.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,8 B | no disponible | Apache 2.0 | Modelo original con capa de rechazo intacta |
| Qwen-3.8-27B-Uncensored (este) | 27,8 B | no disponible | Apache 2.0 | Abliterado, sin rechazos, mismo rendimiento base |
| Qwen3.8-27B AEON Uncensored | 27,8 B | no disponible | Apache 2.0 | Otra abliteración comunitaria con metodología KL-drift (según blog de MindStudio) |

No se dispone de datos de rendimiento comparativo entre estas variantes. La diferencia principal es el método de abliteración y el hecho de que este checkpoint conserva el vision tower intacto.

## Limitaciones y advertencias

- No debe exponerse como endpoint público sin una capa de moderación independiente: la abliteración elimina una dirección, no una política, y algunos rechazos pueden sobrevivir (reafirmación multi-turno, steering por system prompt, rechazos en la ruta de visión).
- Riesgo de alucinación: al igual que el modelo base, puede generar contenido falso o inventado, especialmente en dominios especializados.
- Sesgos: hereda los sesgos del modelo base Qwen3.8-27B, que no se documentan en esta ficha.
- Limitaciones de contexto: no se especifica la longitud máxima de contexto; se recomienda consultar la documentación del modelo base.
- Restricciones de uso: el autor limita explícitamente el uso a investigación de red teaming y ciberseguridad defensiva. Aunque la licencia es Apache 2.0, el despliegue sin moderación es desaconsejado y puede violar políticas de plataformas.
- Sin garantías de rendimiento: al ser una edición de pesos sin entrenamiento, no hay métricas publicadas que validen que las capacidades se mantienen al 100% en todos los dominios.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/junafinity/Qwen-3.8-27B-Uncensored
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Colección de la familia: https://huggingface.co/collections/junafinity/qwen-38-27b-uncensored-apple-silicon-6a896c726b52be3a0b63400e
- Variante MLX 8-bit: https://huggingface.co/junafinity/Qwen-3.8-27B-Uncensored-8-Bit-MLX
- Cabeza MTP opcional: https://huggingface.co/junafinity/qwen38-mtp-head-fc-bf16-4bit
- Herramienta ZeroFuse: https://github.com/junainfinity/ZeroFuse
- Blog sobre abliteración AEON (referencia metodológica): https://www.mindstudio.ai/blog/qwen3-8-27b-aeon-uncensored-abliteration
- Artículo de referencia sobre abliteración (Arditi et al., 2024): https://arxiv.org/abs/2406.11717
