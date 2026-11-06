# ArchiveStudio/Qwen3-30B-A3B-Base

## Resumen

Qwen3-30B-A3B-Base es la variante base (solo preentrenada) del modelo de mezcla de expertos de la familia Qwen3, desarrollada por el equipo Qwen de Alibaba. Se trata de un transformer causal con arquitectura MoE de 30.532.122.624 parámetros totales, de los cuales 3.300 millones se activan por token, distribuidos en 128 expertos con 8 activos por paso. Esta ficha corresponde a una republicación en el espacio de nombres `ArchiveStudio`, no al repositorio oficial del equipo Qwen.

El modelo se preentrenó sobre 36 billones de tokens en 119 idiomas, con un corpus que combina datos de código, STEM, razonamiento, libros y datos sintéticos. La ventana de contexto nativa es de 32.768 tokens, ampliada en la tercera etapa de preentrenamiento hasta secuencias de 32k. Al ser una versión base, no incorpora ajuste por instrucciones ni alineamiento (RLHF/DPO), por lo que su uso previsto es el de punto de partida para fine-tuning, no el de asistente conversacional directo.

La relevancia de esta variante radica en su relación entre parámetros activos y rendimiento: con solo 3,3B parámetros activos por token, el coste de inferencia se aproxima al de un modelo denso de ese tamaño, mientras que la capacidad efectiva se acerca a la de un modelo de 30B. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con mezcla de expertos (MoE), atención GQA |
| Parametros totales | 30.532.122.624 (29.9B sin embeddings) |
| Parametros activos | 3.3B por token |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors sin cuantizar; cuantizaciones GGUF/AWQ no publicadas por el autor de esta republicación) |
| Idiomas soportados | 119 idiomas segun la model card (lista concreta no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer causal con 48 capas y atención con query grouping (GQA) de 32 cabezas para Q y 4 para KV. La capa MoE contiene 128 expertos con 8 activos por token, lo que resulta en 3,3B parámetros activos sobre 30,5B totales. Incorpora dos refinamientos técnicos respecto a Qwen2.5: una pérdida de balanceo de carga a nivel de batch global para los modelos MoE y qk layernorm en todas las capas, orientados a mejorar la estabilidad del entrenamiento.

El preentrenamiento se organiza en tres etapas: la primera cubre modelado de lenguaje general y adquisición de conocimiento; la segunda refuerza razonamiento en STEM, código y lógica; la tercera extiende la longitud de secuencia hasta 32k tokens para mejorar la comprensión de contexto largo. El corpus total alcanza 36 billones de tokens en 119 idiomas, con mezcla de datos de código, STEM, razonamiento, libros, multilingüe y sintéticos. Los hiperparámetros (learning rate, batch size) se ajustaron mediante estudios de scaling law diferenciados para modelos densos y MoE. Al ser una variante base, no se aplicaron etapas de RLHF ni DPO.

## Capacidades

- Generación de texto autoregresiva y modelado de lenguaje general.
- Razonamiento en dominios STEM y lógica, reforzado en la segunda etapa de preentrenamiento.
- Generación y comprensión de código, con datos de programación en el corpus.
- Capacidades multilingües sobre 119 idiomas.
- Comprensión de contexto largo hasta 32.768 tokens.
- Punto de partida para fine-tuning supervisado y alineamiento posterior.
- No incluye modo thinking, tool calling ni capacidades de agente de forma nativa, al ser un modelo base sin ajuste por instrucciones.

## Casos de uso

- Fine-tuning supervisado para dominios verticales: al ser una variante base con licencia Apache 2.0, se puede ajustar sobre datos propios (legal, sanitario, financiero) sin restricciones de uso comercial, partiendo de un modelo con conocimiento general amplio y 3,3B parámetros activos.
- Generación de código en pipelines internos: el corpus incluye datos de programación y el modelo puede adaptarse mediante fine-tuning a tareas de autocompletado o generación de tests en un repositorio concreto.
- Modelado de lenguaje para investigación: útil como sujeto de experimentos de scaling, análisis de routing de expertos o estudios de eficiencia MoE, dado su tamaño manejable y su arquitectura abierta.
- Procesamiento de documentos largos: con 32.768 tokens de contexto, puede resumir o extraer información de contratos, informes o artículos extensos tras un ajuste específico.
- Traducción y procesamiento multilingüe: los 119 idiomas del corpus permiten fine-tuning para pares de idiomas de bajos recursos o para normalización de texto multilingüe.
- Base para destilación: sus 30,5B parámetros totales y 3,3B activos lo convierten en un profesor razonable para destilar capacidades en modelos densos más pequeños orientados a despliegue en edge.
- Experimentación con decodificación y eficiencia: la discrepancia entre parámetros totales y activos permite estudiar técnicas de offloading, cuantización selectiva y paralelismo de expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al blog oficial de Qwen3 para las evaluaciones detalladas, pero no incluye cifras concretas en el repositorio de esta republicación.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 61 GB solo para pesos, más overhead de activaciones y caché KV; requiere al menos 80 GB en una sola GPU o reparto entre varias.
- VRAM estimada en FP8: alrededor de 31 GB de pesos, viable en una A100 40GB o H100 con margen ajustado.
- VRAM estimada en cuantización de 4 bits: aproximadamente 16-18 GB de pesos, lo que permite ejecución en RTX 4090 (24 GB) o RTX 3090.
- GPU recomendadas: H100 80GB o A100 80GB para BF16; A100 40GB o L40S para FP8; RTX 4090/3090 para cuantización 4-bit.
- Cabe en GPU de consumo con cuantización agresiva (4 bits), aunque el throughput será limitado por ancho de banda de memoria.
- Opciones de despliegue: transformers (versión 4.51.0 o superior, obligatoria para evitar el error `KeyError: 'qwen3_moe'`), vLLM, SGLang y llama.cpp/Ollama para cuantizaciones GGUF (si se generan a partir de los pesos originales).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-30B-A3B-Base (esta ficha) | 30.5B | 3.3B | 32.768 | Apache 2.0 | Hugging Face (republicación) |
| Qwen3-30B-A3B (instruct) | 30.5B | 3.3B | 32.768 | Apache 2.0 | Hugging Face (oficial Qwen) |
| Qwen3-32B (denso) | 32B | 32B | 32.768 | Apache 2.0 | Hugging Face (oficial Qwen) |
| Mixtral 8x7B | 46.7B | 12.9B | 32.768 | Apache 2.0 | Hugging Face (Mistral AI) |

La comparativa con Mixtral se basa en datos públicos de su model card; los datos de las variantes Qwen3 provienen de la información proporcionada para esta ficha y del blog oficial referenciado. No se dispone de comparativas de rendimiento medidas para esta republicación concreta.

## Limitaciones y advertencias

- Al ser un modelo base sin alineamiento, no sigue instrucciones de forma fiable y puede generar contenido inapropiado, sesgado o factualmente incorrecto sin filtros.
- Riesgo elevado de alucinación en tareas de pregunta-respuesta sin fine-tuning previo.
- La model card no detalla sesgos conocidos ni la composición exacta del corpus; se desconoce el grado de representación de cada uno de los 119 idiomas.
- El contexto máximo es de 32.768 tokens; entradas más largas requieren truncado o técnicas externas.
- Esta ficha corresponde a una republicación por `ArchiveStudio` con 0 descargas y 0 likes en el momento de la consulta; no es el repositorio oficial de Qwen y no hay garantía de que los pesos coincidan bit a bit con la publicación original.
- Requiere `transformers>=4.51.0`; versiones anteriores fallan al cargar la arquitectura `qwen3_moe`.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar la procedencia de los pesos dada la naturaleza no oficial de esta copia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ArchiveStudio/Qwen3-30B-A3B-Base
- Blog oficial de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Paper técnico (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
