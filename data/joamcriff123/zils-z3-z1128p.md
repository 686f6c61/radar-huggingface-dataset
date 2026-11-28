# joamCriff123/zils-z3-z1128p

## Resumen

zils-z3-z1128p es un modelo de decisión publicado por el usuario joamCriff123 en Hugging Face, construido como un ajuste fino (finetune) del modelo base Qwen/Qwen3.8-27B. Según la model card, se trata de un "d3 decision body" destinado al pool z3 de la "Zils subnet 127", una terminología propia del autor que no viene acompañada de documentación técnica adicional en la información disponible. El modelo se distribuye bajo licencia Apache-2.0 y utiliza la librería transformers con pesos en safetensors.

El repositorio declara 26.085.330.160 parámetros totales (aproximadamente 26,1 mil millones), lo que es coherente con un modelo de la familia Qwen de ~27B. El pipeline declarado es feature-extraction, aunque las etiquetas incluyen también decision-model, lo que sugiere un uso orientado a la extracción de representaciones o a la toma de decisiones sobre ellas más que a la generación de texto convencional. No se especifican los idiomas soportados ni la longitud de contexto en la información proporcionada.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el modelo tiene cero descargas y cero likes en el momento de la consulta, fue creado y actualizado el mismo día (28 de noviembre de 2026) y su model card es extremadamente escueta. Se trata, por tanto, de una publicación reciente, sin validación comunitaria ni benchmarks publicados, cuyo interés principal es documental para quienes sigan el ecosistema de ajustes finos sobre Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8, según tags; detalles no disponibles) |
| Parametros totales | 26.085.330.160 (~26,1B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.8-27B |
| Pipeline declarado | feature-extraction |
| Libreria | transformers |
| Tamano del repo | 52,2 GB |
| Region | us |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `qwen3_5` y la pertenencia a la familia Qwen3.8, con un total de 26.085.330.160 parámetros. No se especifica si emplea atención estándar, atención lineal, mezcla de expertos (MoE) u otra variante, ni se documentan innovaciones técnicas como decodificación especulativa. El modelo requiere `custom_code` según las etiquetas, lo que implica que su carga en transformers depende de código personalizado incluido en el repositorio y no únicamente de clases estándar de la librería.

Respecto al entrenamiento, la model card únicamente indica que es un "d3 decision body" para el pool z3 de la Zils subnet 127, sin aportar número de tokens, composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o similares. Tampoco se documenta el proceso de ajuste fino sobre Qwen/Qwen3.8-27B. Toda esta información debe considerarse no disponible.

## Capacidades

- Extracción de características (feature-extraction): es el pipeline declarado, por lo que el uso previsto principal es la obtención de representaciones o embeddings a partir de entradas de texto.
- Modelo de decisión: las etiquetas `decision-model`, `zils` y `d3` apuntan a un uso orientado a la toma de decisiones dentro del ecosistema Zils, sin que se detalle el mecanismo.
- Generación de texto: no confirmada explícitamente en la información disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se listan idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Extracción de embeddings para sistemas de recuperación: dado que el pipeline declarado es feature-extraction, el modelo puede emplearse para generar representaciones vectoriales de documentos y consultas en pipelines RAG, siempre que se valide su calidad frente a modelos de embeddings dedicados.
- Clasificación o puntuación de candidatos en un pool de decisión: el modelo se presenta como "decision body" para el pool z3 de la Zils subnet 127, por lo que su uso natural es la evaluación y selección de opciones dentro de ese marco, previa verificación de la interfaz de entrada y salida.
- Experimentación académica sobre ajustes finos de Qwen: al ser un finetune de Qwen/Qwen3.8-27B con licencia Apache-2.0, sirve como punto de partida para estudiar cómo se comporta un ajuste de ~26B parámetros en tareas de extracción de características.
- Integración en pipelines de transformers con código personalizado: permite probar el flujo de carga con `trust_remote_code` y comparar la salida frente al modelo base.
- Reproducción de experimentos del autor: útil para quienes quieran replicar o auditar el comportamiento del "d3 decision body" descrito en la model card.
- Evaluación comparativa de robustez: puede utilizarse como contrapunto frente al modelo base Qwen/Qwen3.8-27B en tareas de representación, midiendo si el ajuste fino altera la calidad de los embeddings.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 26,1B parámetros en precisión completa (fp32) se requieren aproximadamente 104 GB; en bf16/fp16, en torno a 52 GB; en cuantización de 8 bits, unos 26 GB; en 4 bits, alrededor de 13-15 GB (estimaciones teóricas a partir del número de parámetros, no confirmadas por el autor).
- GPU recomendadas: para bf16 sin cuantizar, GPU de 80 GB como A100 o H100; para cuantizaciones de 8 y 4 bits, GPU de 24-48 GB como RTX 4090, L40S o A6000.
- ¿Cabe en GPU de consumo? En cuantización de 4 bits podría caber en una RTX 4090 (24 GB) o en GPUs con 16 GB ajustando el contexto; en bf16 no cabe en GPU de consumo.
- Opciones de despliegue: transformers con `custom_code` (requiere `trust_remote_code=True`); no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-z3-z1128p | ~26,1B | no disponible | Apache-2.0 | Hugging Face (0 descargas) | Finetune de Qwen3.8-27B, feature-extraction, sin benchmarks |
| Qwen/Qwen3.8-27B (base) | ~27B (según nombre) | no disponible | no disponible en la informacion | Hugging Face | Modelo base del que deriva este finetune |
| Alternativas de ~27B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados de modelos comparables en la informacion proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas publicadas que permitan evaluar su calidad frente al modelo base u otras alternativas.
- Documentación mínima: la model card no describe arquitectura, datos de entrenamiento, idiomas ni contexto, lo que dificulta su uso responsable en producción.
- Riesgo de alucinación: no evaluado; al ser un modelo de ~26B sin validación, no puede descartarse en tareas generativas.
- Sesgos conocidos: no documentados; se heredarían, en su caso, los del modelo base Qwen/Qwen3.8-27B, que tampoco se detallan.
- Idiomas: no se especifican, por lo que no puede garantizarse un rendimiento adecuado en castellano ni en otros idiomas.
- Licencia: Apache-2.0 permite uso comercial, pero debe revisarse el archivo NOTICE del repositorio para las atribuciones del modelo base y del código personalizado.
- Código personalizado: la etiqueta `custom_code` implica ejecutar código del autor al cargar el modelo; conviene auditar dicho código antes de usarlo en entornos de producción.
- Madurez: publicación con cero descargas y cero likes, creada y actualizada el mismo día, sin evidencia de uso comunitario.
- Terminología propietaria: referencias a "Zils subnet 127" y "pool z3" sin definición pública en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joamCriff123/zils-z3-z1128p
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
