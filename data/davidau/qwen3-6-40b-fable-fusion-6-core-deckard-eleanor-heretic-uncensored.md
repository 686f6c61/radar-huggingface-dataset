# DavidAU/Qwen3.6-40B-Fable-Fusion-6-Core-Deckard-Eleanor-Heretic-Uncensored

## Resumen

El modelo `DavidAU/Qwen3.6-40B-Fable-Fusion-6-Core-Deckard-Eleanor-Heretic-Uncensored` es un fine tune de 40 mil millones de parámetros desarrollado por DavidAU, construido a partir de una fusión de seis núcleos derivados de la familia Qwen 3.6. Combina cinco núcleos del modelo Qwen3.6-27B-Fable-Fusion (variantes 711 y 717) con un sexto núcleo procedente del modelo Deckard 40B, dando lugar a un sistema denso con 96 capas y 1290 tensores. El resultado es un modelo orientado a razonamiento profundo, generación creativa y uso sin censura, con un consumo de tokens de pensamiento notablemente reducido respecto a los modelos Qwen estándar.

La relevancia de este modelo reside en su doble propuesta: por un lado, ofrece un rendimiento que, según los benchmarks publicados por Nightmedia, supera al Qwen3.6-27B-Instruct original en varias tareas de razonamiento y conocimiento; por otro, incorpora técnicas de "abliteration" (eliminación de rechazos) y un entrenamiento multi-etapa que lo hacen apto para escenarios donde se requiere libertad de contenido, como escritura creativa, roleplaying o exploración de temas sensibles. Está pensado para ejecutarse en hardware de consumo, con cuantizaciones que permiten su uso en GPUs de gama alta.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors (bfloat16) y versiones GGUF adicionales con imatrix para despliegue eficiente. Soporta los idiomas inglés y chino, y su pipeline se declara como image-text-to-text, aunque no se detallan capacidades multimodales específicas en la documentación disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.6, fusion de multiples modelos) |
| Parametros totales | 39.958.026.224 (~40B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (no especificada en la documentacion) |
| Tipos de cuantizacion | bfloat16 (original), mxfp8, mxfp4, GGUF Q4_K_S y otros (ver repo GGUF) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tambien GGUF en repositorio complementario) |

## Arquitectura y entrenamiento

El modelo es el resultado de un proceso de fusión multi-núcleo: se combinan cinco núcleos procedentes de versiones expandidas y entrenadas del Qwen3.6-27B-Fable-Fusion (núcleos 711 y 717) con un sexto núcleo del modelo Deckard 40B. Esta fusión se realiza mediante técnicas de expansión de modelo, lo que explica que el número de parámetros pase de 27B a 40B. El autor indica que esta expansión provoca una ligera caída en algunas métricas objetivas, pero aporta mejoras cualitativas detectadas en pruebas humanas, como mayor profundidad de pensamiento y detalle en las respuestas.

El entrenamiento se describe como "multi-stage tuned" e incluye técnicas de abliteration para eliminar los mecanismos de rechazo del modelo original, resultando en un comportamiento "uncensored". Se utilizó la librería Unsloth, lo que permitió el entrenamiento en hardware de consumo. Además, el modelo incorpora MTP (Multi-Token Prediction), que acelera la generación al predecir varios tokens a la vez. El autor afirma que el modelo requiere entre 1/10 y 1/2 de los tokens de pensamiento de un Qwen estándar, gracias a un mecanismo de pensamiento variable automático.

No se especifican los datos de entrenamiento (número de tokens, composición del dataset) ni si se aplicaron técnicas de RLHF o DPO. La información disponible se limita a la descripción del proceso de fusión y a las herramientas utilizadas.

## Capacidades

- Generación de texto extenso con alto nivel de detalle y profundidad, especialmente en tareas de razonamiento y explicación técnica.
- Modo de pensamiento ("thinking mode") con longitud variable automática, que reduce el número de tokens de razonamiento en comparación con modelos Qwen estándar.
- Escritura creativa y de ficción, incluyendo narrativa, diálogos y desarrollo de personajes.
- Roleplaying: capacidad para mantener conversaciones multi-turno con coherencia y estilo.
- Generación de código: el autor lo etiqueta como "coder", y se espera que herede las capacidades de codificación de Qwen3.6.
- Soporte de MTP (Multi-Token Prediction) para generación más rápida.
- Capacidades multimodales declaradas (image-text-to-text), aunque no se documentan ejemplos concretos de uso con imágenes.
- Conversación general y asistencia en múltiples dominios.
- Funcionamiento sin censura gracias a la abliteration, lo que permite abordar temas que los modelos estándar rechazan.
- Multilingüe limitado a inglés y chino.

## Casos de uso

- Escritura creativa y narrativa: el modelo puede generar relatos largos, descripciones detalladas y diálogos naturales. Su capacidad para mantener coherencia en contextos extensos (gracias a la fusión de núcleos) lo hace adecuado para novelas o guiones. El modo sin censura permite explorar temas adultos o controvertidos sin restricciones.
- Roleplaying y juegos de texto: en plataformas de rol por chat, el modelo puede interpretar personajes con profundidad psicológica y mantener conversaciones coherentes a lo largo de múltiples turnos. Su bajo consumo de tokens de pensamiento reduce la latencia percibida.
- Asistente de programación: aunque no se aportan benchmarks específicos de código, el modelo hereda las capacidades de Qwen3.6, que destaca en codificación agéntica. Puede integrarse en entornos de desarrollo para generar código, explicar algoritmos o depurar errores.
- Análisis técnico y explicaciones: su capacidad para generar respuestas extensas y estructuradas (con tablas y gráficos, como se muestra en el ejemplo de la model card) lo hace útil para redactar informes técnicos, documentos de investigación o material divulgativo.
- Generación de contenido educativo: puede crear materiales de estudio detallados, resúmenes de temas complejos o ejercicios prácticos con explicaciones paso a paso.
- Exploración de temas sensibles o controvertidos: al ser uncensored, permite investigar o discutir temas que otros modelos rechazan, como ciertos aspectos de política, religión o sexualidad, siempre que el usuario asuma la responsabilidad del contenido generado.
- Prototipado rápido de aplicaciones conversacionales: gracias a su licencia Apache 2.0 y a la disponibilidad de cuantizaciones GGUF, puede desplegarse en entornos de producción para chatbots o asistentes virtuales sin costes de licencia.

## Benchmarks y rendimiento

Los benchmarks publicados por Nightmedia (en formato mxfp8) comparan este modelo con varios modelos base de Qwen. Se presentan los resultados para las tareas ARC-c, ARC-e, BoolQ, HellaSwag, OpenBookQA, PIQA y Winogrande.

| Modelo | ARC-c | ARC-e | BoolQ | HellaSwag | OpenBookQA | PIQA | Winogrande |
|---|---|---|---|---|---|---|---|
| Qwen3.6-40B-Fable-Fusion-6-Core-Deckard-Eleanor-Heretic-Uncensored | 0.687 | 0.857 | 0.908 | 0.825 | 0.500 | 0.818 | 0.771 |
| Qwen3.6-40B-Grand-Intelligence-Fable-Fusion-Uncensored-Heretic (modelo hermano) | 0.698 | 0.862 | 0.904 | - | - | - | - |
| Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic (núcleo base, mxfp8) | 0.711 | 0.879 | 0.910 | 0.790 | 0.514 | 0.823 | 0.763 |
| Qwen3.6-27B-Instruct (base, sin tuning) | 0.647 | 0.803 | 0.910 | 0.773 | 0.450 | 0.806 | 0.742 |
| Qwen3.6-35B-A3B-Instruct (base, sin tuning) | 0.581 | 0.757 | 0.892 | 0.751 | 0.428 | 0.803 | 0.688 |
| Qwen3.5-27B-Instruct (base, sin tuning) | 0.557 | 0.711 | 0.868 | 0.533 | 0.452 | 0.706 | 0.695 |

Notas del autor:
- Los modelos se evaluaron en modo "Instruct" porque el harness de pruebas funciona mejor así. En modo "thinking", las puntuaciones tienden a ser superiores.
- La expansión de 27B a 40B provocó una ligera caída en algunas métricas (ARC-c, ARC-e, HellaSwag) respecto al modelo 27B original, pero se compensa con mejoras cualitativas en pruebas humanas.
- El autor afirma que el rendimiento a 4 bits (Q4_K_S) es "impresionante", con una salida de ejemplo de 13k tokens de alta calidad.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - bfloat16 (precisión completa): ~80 GB de VRAM (2x A100 40GB, 1x H100 80GB, o 2x RTX 4090 24GB con tensor parallelism).
  - mxfp8: ~40 GB de VRAM (1x A100 80GB, 1x RTX 4090 24GB no suficiente, necesitaría 2x).
  - mxfp4: ~20 GB de VRAM (1x RTX 4090 24GB, 1x RTX 3090 24GB, 1x A6000 48GB).
  - GGUF Q4_K_S: ~20-22 GB de VRAM (cabe en una RTX 4090 o RTX 3090).
- GPU recomendadas: RTX 4090 (24GB), RTX 3090 (24GB), A100 (40/80GB), H100 (80GB), o GPUs de datacenter con suficiente memoria.
- El modelo está diseñado para hardware de consumo, y el autor indica que se entrenó con Unsloth en dicho hardware. Con cuantización 4-bit es viable en GPUs de gama alta para consumidores.
- Opciones de despliegue:
  - vLLM (soporta mxfp8 y bfloat16).
  - llama.cpp / Ollama (para GGUF).
  - TGI (Text Generation Inference) de HuggingFace.
  - Transformers con `device_map="auto"` para distribución en múltiples GPUs.
- Latencia y throughput: no se proporcionan datos oficiales. Con MTP se espera una generación más rápida que un modelo equivalente sin esta técnica, pero no hay cifras concretas.

## Comparativa con modelos similares

La siguiente tabla compara el modelo con dos modelos base de Qwen de tamaño similar, utilizando los benchmarks disponibles (mxfp8).

| Modelo | Parámetros | Contexto | ARC-c | ARC-e | BoolQ | HellaSwag | OpenBookQA | PIQA | Winogrande | Licencia |
|---|---|---|---|---|---|---|---|---|---|---|
| Qwen3.6-40B-Fable-Fusion-6-Core (este modelo) | ~40B | No disponible | 0.687 | 0.857 | 0.908 | 0.825 | 0.500 | 0.818 | 0.771 | Apache 2.0 |
| Qwen3.6-27B-Instruct | 27B | No disponible | 0.647 | 0.803 | 0.910 | 0.773 | 0.450 | 0.806 | 0.742 | Apache 2.0 |
| Qwen3.6-35B-A3B-Instruct | 35B (MoE, 3B activos) | No disponible | 0.581 | 0.757 | 0.892 | 0.751 | 0.428 | 0.803 | 0.688 | Apache 2.0 |

Observaciones:
- El modelo fusionado supera claramente al Qwen3.6-27B-Instruct en ARC-c, ARC-e, HellaSwag, OpenBookQA y PIQA, aunque es ligeramente inferior en BoolQ y Winogrande.
- Frente al Qwen3.6-35B-A3B (MoE), el modelo fusionado es superior en todas las métricas publicadas.
- La ventaja principal del modelo fusionado es su modo sin censura y su menor consumo de tokens de pensamiento, que no se reflejan en estos benchmarks.
- El modelo hermano Grand Intelligence (también de DavidAU) muestra resultados ligeramente superiores en ARC-c y ARC-e, pero no se dispone de datos completos para comparar todas las tareas.

## Limitaciones y advertencias

- El modelo es "uncensored" y "abliterated", lo que significa que puede generar contenido explícito, ofensivo, ilegal o éticamente cuestionable. El usuario es el único responsable del uso que haga de él.
- La abliteration puede degradar la calidad en tareas que requieren adherencia a normas de seguridad, y no se garantiza que el modelo rechace peticiones dañinas.
- Los benchmarks disponibles son limitados y proceden de una única fuente (Nightmedia). No se han publicado resultados en MMLU, HumanEval, GSM8K u otros benchmarks estándar.
- La expansión de 27B a 40B provocó una caída en algunas métricas objetivas (ARC-c, ARC-e, HellaSwag) en comparación con el modelo 27B original.
- La longitud de contexto no está documentada. Se desconoce si hereda los 256K del Qwen3.6-27B-Fable-Fusion o si la fusión la modifica.
- Solo soporta inglés y chino. No hay garantías de calidad en otros idiomas.
- El modelo se distribuye bajo Apache 2.0, pero el contenido generado puede estar sujeto a regulaciones locales sobre discurso, propiedad intelectual o difamación.
- El autor advierte que la exportación de contenido generado con MTP está rota en LM Studio (todas las versiones), lo que puede afectar a la integración en esa plataforma.
- No se proporcionan detalles sobre el dataset de entrenamiento, por lo que no es posible evaluar posibles sesgos o alucinaciones específicas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DavidAU/Qwen3.6-40B-Fable-Fusion-6-Core-Deckard-Eleanor-Heretic-Uncensored
- Repositorio GGUF con NEO Imatrix y MTP: https://huggingface.co/DavidAU/Qwen3.6-40B-Fable-Fusion-6-Core-Deckard-Eleanor-Heretic-Uncensored-NM-DAU-NEO-MAX-MTP-GGUF
- Proyecto principal (Grand Intelligence Fable Fusion): https://huggingface.co/DavidAU/Qwen3.6-40B-Grand-Intelligence-Fable-Fusion-Uncensored-Heretic
- Artículo en HackerNoon sobre el núcleo 27B: https://hackernoon.com/qwen36-27b-fable-fusion-breaks-the-700-arc-c-barrier
- Repositorio oficial de Qwen3.6 en GitHub: https://github.com/QwenLM/Qwen3.6
