# arbonquants/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX es un fine-tune comunitario de 27B parámetros publicado por el usuario arbonquants a partir del modelo base DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU. Se trata de un ajuste multi-etapa (multi-stage fine tune y merge) entrenado con Unsloth sobre hardware de consumo, orientado a escritura creativa, roleplaying y programación, con un enfoque declarado en la eliminación de filtros de contenido (uncensored/abliterated) y en la reducción del consumo de tokens de razonamiento.

El propósito principal del modelo es resolver dos problemas habituales en los modelos de razonamiento de la familia Qwen: el exceso de tokens dedicados al bloque de "thinking" (el autor afirma reducciones de entre 1/2 y 1/10, con mediana aproximada de 2/3) y la pérdida de calidad general al cuantizar. Según la model card, sería el primer fine-tune de este tamaño en superar 730 puntos en ARC-C en 8 bits (735) y 880 en ARC-E, cifras que el autor sitúa en el rango de modelos cerrados de OpenAI, Claude y Gemini.

El modelo se distribuye exclusivamente en formato GGUF, con cuants regulares y variantes "MTP" con doble imatrix (DI-MATRIX). Dada su naturaleza de fine-tune comunitario sin documentación técnica rigurosa, los datos de rendimiento deben tomarse con cautela, ya que proceden casi en su totalidad de afirmaciones del autor y no de benchmarks independientes verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8); detalle exacto no disponible |
| Parametros totales | 26.895.998.464 (~27B) |
| Parametros activos | no disponible (no se declara explícitamente como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: cuants regulares y MTP con doble imatrix; se mencionan variantes de 4 bits (Q4KS) y 8 bits |
| Idiomas soportados | inglés, chino |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base original está en safetensors/bfloat16) |

## Arquitectura y entrenamiento

El modelo parte de la familia Qwen3.8 (arquitectura transformer densa de ~27B parámetros, según los datos de safetensors) y aplica un proceso descrito por el autor como "multi-stage fine tune, multi-fine tune y multi-stage merge". El entrenamiento se realizó con Unsloth sobre hardware de consumo e incorpora dos métodos propios del equipo de DavidAU: "COLD FUSION" (que combina la técnica "GAIN" con los entrenadores de Unsloth) y "FABLE FUSION 711". El método GAIN ajusta dinámicamente los parámetros de entrenamiento por muestra y en tiempo real conforme el modelo aprende, aunque no se han publicado detalles técnicos, papers ni código que permitan verificar esta metodología.

Los datasets utilizados son DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets, ambos también de autoría comunitaria sin documentación pública detallada sobre composición, tamaño en tokens o procedencia. No se declara el uso de RLHF ni DPO. Entre los objetivos declarados del ajuste figuran: aumentar la inteligencia general, reducir el tamaño del bloque de razonamiento entre 1/2 y 1/10, reformatear dicho bloque, acelerar la generación de tokens (especialmente con MTP, multi-token prediction), mantener compatibilidad con los tres modos de thinking de Qwen3 y evitar el "benchmaxing". El modelo hereda además el carácter "uncensored/abliterated" (abliteración, una técnica que neutraliza las direcciones de rechazo en las activaciones del modelo).

## Capacidades

- Generacion de texto y escritura creativa: énfasis declarado en ficción, todos los géneros, narrativa de alto detalle y roleplaying; el propio nombre "Fable" alude a este enfoque.
- Razonamiento con modos de thinking: compatible con los tres modos de razonamiento de Qwen3, con bloques de pensamiento reducidos (afirmación del autor: entre 1/2 y 1/10 de los tokens respecto al Qwen3.8 base).
- Programacion: etiquetado como "NEO-CODER MAX" y "coder", con foco en generación de código.
- Razonamiento general y resolución de problemas: objetivo explícito del fine-tune, respaldado por las puntuaciones de ARC-C/ARC-E comunicadas por el autor.
- Multilingue: soporte de inglés y chino.
- Tool calling: la model card menciona en la pestaña de comunidad "el rendimiento de tool calling más fuerte jamás registrado", sin datos verificables en la ficha principal.
- Abliteracion: sin filtros de rechazo (uncensored), lo que permite contenido sin las salvaguardas habituales.
- MTP (multi-token prediction): cuants MTP orientados a acelerar la generación de tokens.
- Vision: el pipeline está etiquetado como image-text-to-text, aunque la model card no documenta capacidades multimodales concretas.

## Casos de uso

- Escritura de ficcion y narrativa larga: el modelo está afinado específicamente para todos los géneros creativos y produce prosa detallada con ganchos narrativos, siendo adecuado como asistente de escritura o generador de borradores de novelas y relatos.
- Roleplaying interactivo: el etiquetado explícito de roleplaying y la ausencia de filtros lo hacen apto para chatbots de personajes y juegos de rol de texto con respuestas sin rechazos.
- Asistencia de codigo local: como "NEO-CODER MAX", puede integrarse en editores locales (por ejemplo, vía llama.cpp u Ollama con extensiones tipo Continue) para generación y refactorización de código sin enviar código propietario a la nube.
- Razonamiento eficiente en hardware de consumo: la reducción de tokens de thinking (hasta 1/10) reduce la latencia percibida en tareas de razonamiento, útil en flujos interactivos donde el usuario no quiere esperar miles de tokens de reflexión.
- Prototipado de agentes locales: la compatibilidad declarada con tool calling y los tres modos de thinking permite experimentar con agentes multi-paso en local, aunque sin garantías de rendimiento verificado.
- Generacion de contenido sin restricciones para investigacion: la abliteración permite estudiar el comportamiento del modelo sin capas de rechazo, útil en investigación de alineamiento y seguridad (con las precauciones éticas correspondientes).
- Cuantizacion agresiva para GPUs modestas: las variantes de 4 bits (Q4KS) mantienen, según el autor, puntuaciones ARC-C de 719, lo que las hace adecuadas para estaciones de trabajo sin GPUs de gama alta.

## Benchmarks y rendimiento

No existen benchmarks independientes publicados. Las únicas cifras disponibles provienen de la model card del autor y no incluyen metodología ni comparaciones tabuladas verificables:

| Benchmark | Valor (según el autor) |
|---|---|
| ARC-C (8 bits) | 735 |
| ARC-E (8 bits) | 882 |
| ARC-C (4 bits) | 719 |

El autor afirma superar al Qwen3.8-27B base y a Qwen3.6-35B-A3B, Qwen3.6-27B y Qwen3.5-27B en "los 7 benchmarks críticos", pero no publica las tablas completas. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; para un modelo denso de 27B, una variante de 4 bits requiere aproximadamente 16-18 GB de VRAM y una de 8 bits unos 28-30 GB (estimaciones basadas en el tamaño del modelo, no en datos de la ficha).
- GPUs recomendadas: para 4 bits, una RTX 3090 o RTX 4090 (24 GB) es suficiente; para 8 bits se necesita una A100 40GB, H100 o configuraciones multi-GPU de consumo.
- Consumer GPUs: cabe íntegramente en una RTX 4090 o RTX 3090 con cuants de 4 bits; los cuants de 8 bits requieren offload parcial a CPU o multi-GPU.
- Despliegue: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio, koboldcpp y backends equivalentes; el soporte de MTP dependerá de que el runtime implemente esta funcionalidad. No se menciona soporte para vLLM o TGI (que requieren formatos safetensors).
- Latencia y throughput: no disponibles; el autor afirma mayor velocidad de generación que el modelo base, especialmente con los cuants MTP, sin proporcionar mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B-TURBO-Fable-Cold-Fusion (este) | ~27B | no disponible | apache-2.0 | GGUF, abierta |
| Qwen3.8-27B (base) | ~27B | no disponible | apache-2.0 | safetensors y GGUF |
| Qwen3.6-35B-A3B | ~35B (MoE, ~3B activos) | no disponible | apache-2.0 | safetensors y GGUF |
| Qwen3.5-27B | ~27B | no disponible | apache-2.0 | safetensors y GGUF |

Nota: las cifras de rendimiento comparativo provienen únicamente de las afirmaciones del autor, que declara superar a los tres modelos Qwen listados en los benchmarks que cita; no hay verificación independiente disponible.

## Limitaciones y advertencias

- Abliteracion deliberada: el modelo es "uncensored" y carece de salvaguardas de seguridad, lo que implica riesgo real de generar contenido ofensivo, peligroso o ilegal. No es adecuado para entornos de producción orientados a usuarios finales sin filtros externos.
- Riesgo de alucinacion: no disponible como dato medido; como en cualquier LLM de este tamaño, debe asumirse un riesgo significativo, agravado por la ausencia de alineación por preferencia humana documentada.
- Benchmarks no verificados: todas las cifras de rendimiento (ARC-C 735, ARC-E 882, reducción de tokens de thinking) proceden del autor sin metodología publicada; el propio autor niega el "benchmaxing", pero no hay auditoría independiente.
- Contexto no documentado: la longitud de ventana de contexto no se declara en la model card, lo que dificulta planificar aplicaciones con documentos largos.
- Idiomas limitados: soporte oficial solo para inglés y chino; el rendimiento en castellano no está documentado y puede ser inferior.
- Origen comunitario: se trata de un merge/fine-tune de terceros sobre un modelo base también comunitario (DavidAU), no de un lanzamiento oficial de Alibaba/Qwen; la trazabilidad del entrenamiento es limitada.
- Tamaño del repositorio: 389 GB, ya que incluye múltiples cuants; conviene descargar solo las variantes necesarias.
- Licencia: apache-2.0 permite uso comercial, pero al ser un modelo abliterado, el usuario asume toda la responsabilidad legal del contenido generado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/arbonquants/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Predecesor referenciado (Fable Fusion 711): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
- Paper, blog o demo oficial: no disponible
