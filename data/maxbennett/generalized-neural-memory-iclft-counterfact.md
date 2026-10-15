# maxbennett/generalized-neural-memory-iclft-counterfact

## Resumen

El modelo `maxbennett/generalized-neural-memory-iclft-counterfact` es un ajuste fino de `meta-llama/Meta-Llama-3-8B-Instruct` publicado por el usuario maxbennett (Max S. Bennett, autor principal del trabajo junto a Thomas Zollo y Richard Zemel). Se trata de la línea base de *in-context learning* con ajuste fino (ICL-FT) del benchmark CounterFACT, diseñada para servir de comparación frente a los sistemas de memoria neuronal generalizada (Generalized Neural Memory, GNM) propuestos en el artículo "Tell Me What To Learn: Generalizing Neural Memory to be Controllable in Natural Language".

El problema que aborda es la adaptación continua de modelos en entornos no estacionarios: en lugar de recurrir a ajuste fino continuo o a *in-context learning* puro (costosos y frágiles), el trabajo explora actualizaciones de memoria ligeras guiadas por instrucciones en lenguaje natural. Esta variante concreta mantiene los documentos y las instrucciones dentro del contexto, es decir, no incorpora el mecanismo de memoria neuronal persistente, y por eso funciona como control experimental del benchmark.

Técnicamente es un transformer decoder-only de 8.030.261.248 parámetros (aproximadamente 8B), sin mezcla de expertos, derivado directamente del modelo instruct de Llama 3. Su relevancia es fundamentalmente de investigación: es la referencia contra la que se mide si la memoria neuronal controlable aporta ventajas reales en tareas de memorización selectiva de hechos y rechazo de información. El repositorio es pequeño (6 descargas, 1 like en el momento de la consulta) y está pensado para reproducir la Tabla 1 del artículo, no para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama 3 (heredada del modelo base) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Llama-3-8B-Instruct) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | safetensors (segun los tags del repositorio); el script del repositorio de codigo deposita el modelo como `models/icl_ft_counterfact/model.pth` |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only con normalización RMSNorm, activaciones SwiGLU y atención causal, en la configuración de 8B parámetros de la familia Llama 3. No hay innovaciones arquitectónicas propias en esta variante: es un ajuste fino (fine-tuning) del checkpoint instruct. El tag de HuggingFace indica que se trata de un `finetune` de `meta-llama/Meta-Llama-3-8B-Instruct`, no de una continuación de preentrenamiento.

El entrenamiento se realizó "sobre los mismos datos y objetivo que GNM, pero manteniendo documentos e instrucciones en el contexto", según la model card. El dataset asociado es `maxbennett/generalized-neural-memory-counterfact`. La model card no especifica el número de tokens de entrenamiento, la composición del corpus, ni si se aplicaron etapas de RLHF o DPO adicionales sobre el ajuste fino; esos datos figuran únicamente, si acaso, en el artículo y en las configuraciones del repositorio de código. La innovación del trabajo reside en el sistema GNM (construido sobre la arquitectura MemoryLLM) y en los mecanismos de memorización selectiva de hechos y de rechazo de información, no en este modelo de control.

## Capacidades

- Generación de texto conversacional en el formato instruct de Llama 3.
- Memorización de hechos a partir de documentos e instrucciones mantenidos en el contexto (enfoque ICL-FT), no mediante memoria paramétrica persistente.
- Rechazo selectivo de información: el trabajo del que forma parte aborda explícitamente mecanismos de *refusal* ante contenido que no debe memorizarse.
- Actualización de conocimiento guiada por instrucciones en lenguaje natural (objetivo compartido con GNM, evaluado aquí como línea base en contexto).
- Soporte de *tool calling* / *function calling*: heredado del modelo base, no documentado específicamente para este ajuste fino.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no disponibles; el modelo base Llama 3 es predominantemente multilingüe, pero no hay confirmación para este ajuste.
- Capacidades especiales: no se documentan modos de *thinking*, visión ni audio.

## Casos de uso

- Reproducción de resultados de investigación: es la línea base ICL-FT del benchmark CounterFACT. Se descarga con `python scripts/download_models.py --counterfact` y se evalúa con los comandos del repositorio para regenerar la Tabla 1 del artículo.
- Comparación controlada de sistemas de memoria: permite aislar cuánto del rendimiento de GNM proviene del mecanismo de memoria neuronal y cuánto de mantener documentos e instrucciones en el contexto.
- Edición de conocimiento sin reentrenamiento: en escenarios donde el conocimiento factual cambia con frecuencia (documentación interna, catálogos, políticas), el modelo puede contrastarse frente a métodos de memoria paramétrica para medir el coste de cada enfoque.
- Memorización selectiva con rechazo: útil como referencia en dominios críticos (por ejemplo, salud) donde el agente debe aprender ciertos hechos y negarse explícitamente a incorporar otros.
- Atención al cliente automatizada con contexto largo: al heredar el comportamiento instruct del modelo base, puede gestionar conversaciones multi-turno, aunque la ventana de contexto efectiva no está documentada para este ajuste.
- Generación de código asistida: el modelo base Llama-3-8B-Instruct tiene capacidad de generación de código; este ajuste no la elimina, pero tampoco la especializa, por lo que su uso aquí es secundario frente a modelos específicos de código.
- Investigación sobre olvido catastrófico: sirve para estudiar hasta qué punto el ajuste ICL-FT con retención de datos en contexto sufre degradación frente a métodos de memoria ligera.
- Prototipado académico de agentes con memoria: escenario de laboratorio para validar pipelines de actualización de conocimiento antes de pasar a sistemas GNM completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de la propia evaluación CounterFACT; únicamente remite al repositorio de código, donde se indican los comandos de evaluación correspondientes a la Tabla 1 del artículo. No se dispone tampoco de comparaciones numéricas frente a GNM o MemoryLLM en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 16 GB de pesos (el repositorio ocupa 16,1 GB), más el *overhead* de caché KV y activaciones; se recomienda un mínimo de 20-24 GB de VRAM.
- VRAM estimada con cuantización de 8 bits: aproximadamente 8-9 GB. Con cuantización de 4 bits: aproximadamente 5-6 GB. Estas cifras son estimaciones derivadas del número de parámetros, no datos publicados por el autor.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para FP16 sin restricciones. Para cuantización, una RTX 4090 (24 GB) o RTX 3090 (24 GB) son suficientes.
- Cabe en GPU de consumo: sí, en configuraciones cuantizadas (RTX 4090, RTX 3090, e incluso GPUs de 8-12 GB con cuantizaciones agresivas de 4 bits).
- Opciones de despliegue: vLLM o TGI para servicio en FP16 con *batching*; llama.cpp y Ollama para despliegue local cuantizado; el repositorio oficial está orientado a carga mediante su propio script (`model.pth`), no a los runners estándar.
- Latencia y throughput estimados: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| generalized-neural-memory-iclft-counterfact | 8.030.261.248 | no disponible | Fine-tune ICL-FT (linea base CounterFACT) | llama3 | HuggingFace, 6 descargas |
| meta-llama/Meta-Llama-3-8B-Instruct | ~8B | 8.192 tokens (segun ficha oficial de Meta) | Instruct generalista | llama3 | HuggingFace, ampliamente disponible |
| MemoryLLM | no disponible en la informacion proporcionada | no disponible | Memoria neuronal con tokens de memoria | no disponible | Repositorio de investigacion |
| GNM (Generalized Neural Memory) | no disponible en la informacion proporcionada | no disponible | Memoria neuronal controlable por lenguaje natural | no disponible | Codigo en github.com/maxbennett/Generalized-Neural-Memory |

El modelo aquí descrito no compite en rendimiento generalista con alternativas comerciales: su función es servir de referencia experimental dentro de una comparativa académica concreta. Frente a `Meta-Llama-3-8B-Instruct`, la diferencia es el ajuste fino sobre el dataset CounterFACT y su papel como control ICL-FT.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; hereda los sesgos del corpus de preentrenamiento de Llama 3 y del dataset CounterFACT.
- Riesgo de alucinación: presente, como en cualquier modelo generativo de 8B parámetros; el ajuste fino sobre un dataset de memorización de hechos no elimina este riesgo y puede acentuarlo si el modelo intenta reproducir hechos memorizados.
- Limitaciones de contexto: la variante ICL-FT depende críticamente de que documentos e instrucciones quepan en la ventana de contexto; al superar ese límite, el comportamiento de memorización se degrada. La longitud exacta soportada no está documentada para este ajuste.
- Limitaciones de idioma: no se especifican idiomas soportados; el uso principal documentado está en inglés.
- Licencia: se distribuye bajo la Llama 3 Community License, que impone restricciones de uso comercial (cláusula de 700 millones de usuarios mensuales), obligaciones de atribución ("Built with Meta Llama 3") y requisitos de denominación. Es necesario revisar el texto completo antes de cualquier uso en producción.
- Caveat de producción: el modelo está pensado como artefacto de investigación y se carga mediante un script propio que genera un `model.pth`; no se garantiza compatibilidad directa con vLLM, TGI o llama.cpp sin conversión previa.
- Madurez: 6 descargas y 1 like indican un artefacto de investigación sin validación por parte de la comunidad.
- Discrepancia de venue: la model card cita NeurIPS 2026, mientras que los resultados de búsqueda incluyen una entrada en el sitio de ICML 2026 y un PDF en OpenReview. Conviene verificar la publicación definitiva antes de citarla.
- No se documentan procesos de alineación adicionales (RLHF/DPO) específicos para este ajuste, ni evaluaciones de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maxbennett/generalized-neural-memory-iclft-counterfact
- Repositorio de código oficial: https://github.com/maxbennett/Generalized-Neural-Memory
- Artículo (PDF en arXiv): https://arxiv.org/pdf/2602.23201
- Artículo (HTML en arXiv): https://arxiv.org/html/2602.23201v2
- Artículo (PDF en OpenReview): https://openreview.net/pdf/96503d3c76e057e2d62d15f5270e073eaca9d8c8.pdf
- Página del trabajo en ICML: https://icml.cc/virtual/2026/74614
- Dataset asociado: https://huggingface.co/datasets/maxbennett/generalized-neural-memory-counterfact
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
