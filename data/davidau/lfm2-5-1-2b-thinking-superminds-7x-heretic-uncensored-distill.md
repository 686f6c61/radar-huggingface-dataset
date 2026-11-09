# DavidAU/LFM2.5-1.2B-Thinking-SuperMinds-7x-Heretic-Uncensored-DISTILL

## Resumen

LFM2.5-1.2B-Thinking-SuperMinds-7x-Heretic-Uncensored-DISTILL es un ajuste fino (fine-tune) completo del modelo MuXodious/LFM2.5-1.2B-Thinking-absolute-heresy, publicado por el usuario DavidAU en Hugging Face. Se trata de un modelo de generación de texto de 1.170.340.608 parámetros (aproximadamente 1,2 mil millones) entrenado a precisión de 16 bits sobre hardware local mediante la herramienta Unsloth, con el objetivo de sustituir por completo la capacidad de razonamiento del modelo base por una nueva destilada a partir de siete conjuntos de datos especializados de razonamiento.

El modelo pertenece a la familia LFM2 (arquitectura lfm2, según los tags de Hugging Face) y está orientado a escritura creativa y de ficción: generación de tramas, subtramas, escenas, diálogo y prosa vívida en todos los géneros (ciencia ficción, romance, etc.). Antes del ajuste fino, el modelo fue procesado con la herramienta Heretic para eliminar los rechazos (refusals) y el comportamiento de censura, de modo que el resultado es un modelo "uncensored" o "abliterated" que, según el autor, no rechaza peticiones del usuario.

Su relevancia actual radica en dos factores: por un lado, ofrece una ventana de contexto declarada de 128k tokens en un modelo de tan solo 1,2B de parámetros, lo que lo hace desplegable en hardware de consumo; por otro, combina razonamiento destilado con ausencia de censura, un perfil poco común en modelos de este tamaño. La licencia es Apache 2.0 y el idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (transformer, según el tag `lfm2`; detalles internos no disponibles) |
| Parametros totales | 1.170.340.608 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 128k tokens (según la model card) |
| Tipos de cuantizacion | El autor recomienda q5, q6, q8, 16 bits o Imatrix IQ3_M como mínimo; advierte de que cuantizaciones inferiores a Q4 sin imatrix pueden entrar en bucles |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers); el autor publica versiones GGUF, EXL2, AWQ, GPTQ, HQQ en su colección de ficheros fuente |

## Arquitectura y entrenamiento

El modelo parte de MuXodious/LFM2.5-1.2B-Thinking-absolute-heresy, un modelo de la familia LFM2 al que previamente se le aplicó la herramienta Heretic para eliminar los rechazos. Sobre esa base, DavidAU realizó un ajuste fino completo a precisión de 16 bits con Unsloth en hardware local (Linux), empleando siete conjuntos de datos especializados de razonamiento de alta calidad (el autor cita al equipo TeichAI como proveedor del dataset principal). Según la model card, el razonamiento original fue "completamente reemplazado" y el nuevo es compacto pero muy detallado y directo.

El proceso de entrenamiento sigue un orden explícito: primero se aplica el "Heretic'ed" (eliminación de censura) y después se ajusta el modelo, de modo que el ajuste corrige los posibles problemas introducidos por la descensura. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta de los datasets ni si se emplearon técnicas de RLHF o DPO. Tampoco se detallan innovaciones arquitectónicas internas más allá de la propia familia LFM2. El autor recomienda un rango de temperatura de 0,1 a 2,5 y señala que el razonamiento es estable frente a la temperatura, con un `repetition penalty` de 1,05 a 1,1 y un `smoothing_factor` de 1,5 en interfaces como KoboldCpp, text-generation-webui o Silly Tavern.

## Capacidades

- Generación de texto y razonamiento paso a paso ("thinking") destilado a partir de siete datasets de razonamiento de alta calidad.
- Escritura creativa y de ficción: generación de tramas, subtramas, escenas, continuación de escenas, narración y prosa vívida en todos los géneros (ciencia ficción, romance, terror, etc.).
- Diálogo conversacional y roleplay, con recomendaciones específicas de muestreo para interfaces de chat.
- Modelo sin censura ("uncensored" / "abliterated"): no rechaza peticiones, aunque el autor advierte de que en algunos casos hay que dirigirlo explícitamente (por ejemplo, indicando el vocabulario o el registro deseado) para obtener contenido explícito o soez.
- Ventana de contexto de 128k tokens, adecuada para documentos largos o conversaciones multi-turno extensas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada más allá del modo "thinking".
- Capacidades multilingües: solo inglés declarado.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Generación de ficción por capítulos: el modelo puede continuar escenas y mantener coherencia de trama y personajes gracias a su ventana de 128k tokens, útil para autores que trabajan con manuscritos largos en una sola sesión.
- Escritura de relatos cortos y cuentos por género: con instrucciones de género (ciencia ficción, romance, terror) el ajuste fino produce prosa vívida y tramas cerradas en una sola generación.
- Roleplay y chat de personajes en Silly Tavern o KoboldCpp: el autor documenta ajustes de muestreo específicos (`smoothing_factor` 1,5, temperatura 0,1-2,5) para conversaciones multi-turno estables.
- Generación de tramas y subtramas para guiones o videojuegos: el modelo puede producir esquemas argumentales y desarrollarlos en escenas concretas, lo que encaja con flujos de preproducción creativa.
- Asistente de escritura sin restricciones temáticas: para proyectos que abordan violencia, terror o contenido adulto, el modelo no aplica rechazos, lo que evita interrupciones en la generación.
- Prototipado de chatbots creativos en local: al ser un modelo de 1,2B, puede desplegarse en una GPU de consumo y usarse como banco de pruebas para pipelines de generación antes de escalar a modelos mayores.
- Experimentación con razonamiento destilado en modelos pequeños: investigadores pueden estudiar cómo se comporta el "thinking" compacto en un modelo de 1,2B con contexto de 128k.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de benchmarks (arc_challenge, arc_easy, boolq, hellaswag, openbookqa, piqa, winogrande) marcada como "coming soon" (próximamente), sin cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: en 16 bits (bf16) los pesos ocupan aproximadamente 2,3 GB, por lo que se necesitan del orden de 3-4 GB de VRAM contando caché KV y overhead; en q8, alrededor de 1,3 GB; en q5, en torno a 0,9 GB; en q4, aproximadamente 0,7 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16; RTX 3060, RTX 4060, RTX 4090 o superiores son suficientes. Para despliegue en servidor, A100 o H100 no son necesarias pero funcionan.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 4 GB o más; con cuantizaciones q5/q6/q8 cabe incluso en GPUs de gama baja.
- Opciones de despliegue: transformers (librería declarada), llama.cpp / GGUF, KoboldCpp, text-generation-webui (con `llama_HF` para GGUF), Silly Tavern; vLLM y TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles. El autor advierte de que cuantizaciones inferiores a Q4 sin imatrix pueden entrar en bucles, lo que afecta a la estabilidad de la generación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LFM2.5-1.2B-Thinking-SuperMinds-7x-Heretic-Uncensored-DISTILL | 1,17B | 128k | Apache 2.0 | Fine-tune sin censura con razonamiento destilado, solo inglés |
| MuXodious/LFM2.5-1.2B-Thinking-absolute-heresy (modelo base) | ~1,2B | no disponible | no disponible | Base "heretic" sin el ajuste de razonamiento de DavidAU |
| Modelos LFM2.5-1.2B-Thinking originales | ~1,2B | no disponible | no disponible | Versión con censura y razonamiento original; no se dispone de cifras comparativas |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Modelo sin censura: no aplica rechazos, lo que implica riesgo de generar contenido ofensivo, explícito o dañino sin filtro; no es apto para aplicaciones orientadas al público general sin moderación externa.
- Riesgo de alucinación: como todo modelo de 1,2B, la precisión factual es limitada; el razonamiento destilado no garantiza corrección en tareas de conocimiento.
- Idioma: solo se declara inglés; el rendimiento en castellano no está garantizado ni documentado.
- Estabilidad de generación: el autor advierte de bucles en cuantizaciones inferiores a Q4 sin imatrix y recomienda `repetition penalty` de 1,05-1,1 y `smoothing_factor` de 1,5; sin estos ajustes la calidad puede degradarse.
- Contenido explícito: para obtener contenido gráfico o soez hay que dirigir explícitamente al modelo (indicar vocabulario o registro); de lo contrario la salida puede resultar "blanda".
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y los datasets de destilación pueden tener condiciones adicionales no detalladas en la información disponible; conviene verificar la licencia del modelo base antes de producción.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas, lo que dificulta la evaluación objetiva.
- Fecha de creación futura (2026-02-16) y actualización posterior (2026-11-09): metadatos que conviene contrastar antes de adoptar el modelo.

## Enlaces

- Hugging Face: https://huggingface.co/DavidAU/LFM2.5-1.2B-Thinking-SuperMinds-7x-Heretic-Uncensored-DISTILL
- Modelo base: https://huggingface.co/MuXodious/LFM2.5-1.2B-Thinking-absolute-heresy
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Guía de parámetros y samplers del autor: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Colección de ficheros fuente para GGUF, EXL2, AWQ, GPTQ, HQQ: https://huggingface.co/collections/DavidAU/d-au-source-files-for-gguf-exl2-awq-gptq-hqq-etc-etc-66b55cb8ba25f914cbf210be
- Heretic (software de descensura): https://github.com/p-e-w/heretic
