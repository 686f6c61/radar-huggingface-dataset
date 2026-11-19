# mdcreativeagent/GPT-OSS-20B-Uncensored-HauhauCS-Aggressive

## Resumen

GPT-OSS-20B-Uncensored-HauhauCS-Aggressive es una variante "abliterated" (con los mecanismos de rechazo suprimidos mediante edición de pesos) del modelo gpt-oss-20b de OpenAI, publicada por el usuario mdcreativeagent en Hugging Face. El modelo base gpt-oss-20b es la versión abierta de 20.900 millones de parámetros de la familia GPT-OSS de OpenAI, distribuida originalmente con licencia Apache 2.0 y pesos en formato MXFP4. Esta variante concreta se distribuye únicamente como GGUF cuantizado en MXFP4 y está orientada a reducir al mínimo las negativas del modelo ante peticiones que el modelo base rechazaría.

El propósito declarado por el autor es ofrecer una versión "agresiva" del proceso de abliteración, es decir, una edición de los pesos que elimina o atenúa la dirección de activación asociada al rechazo, dando como resultado un modelo que responde a un espectro más amplio de peticiones. El autor mantiene además una variante "Balanced" con un compromiso más conservador entre capacidad de respuesta y alineación.

La relevancia de esta ficha es doble: por un lado, documenta una práctica extendida en la comunidad open source (la abliteración de modelos alineados); por otro, advierte de que el resultado es un modelo sin las salvaguardas del original, con implicaciones legales y éticas que el usuario debe evaluar antes de desplegarlo. No hay datos publicados de benchmarks ni de evaluación de calidad tras la abliteración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base gpt-oss-20b de OpenAI); detalles de capas y atención no disponibles en la información proporcionada |
| Parametros totales | 20.914.757.184 (20,9 mil millones) |
| Parametros activos | no disponible (el modelo base gpt-oss-20b no es MoE según la información disponible) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base gpt-oss-20b soporta contexto largo, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | MXFP4 (GGUF); no se documentan otras cuantizaciones en el repo |
| Idiomas soportados | en (inglés) |
| Licencia | other (heredada del modelo base gpt-oss-20b; verificar términos exactos) |
| Formato de pesos | GGUF (MXFP4) |

## Arquitectura y entrenamiento

El modelo es una edición de pesos del gpt-oss-20b original de OpenAI. La arquitectura subyacente es la del modelo base, un transformer denso de aproximadamente 20,9 mil millones de parámetros. La modificación aplicada por el autor es una abliteración: una intervención sobre los pesos que identifica y suprime la dirección de activación responsable de los comportamientos de rechazo, típicamente mediante la resta de una proyección sobre los pesos de atención o MLP. El autor indica que usó "herramientas personalizadas" para el proceso, sin detallar la metodología exacta (capas intervenidas, magnitud de la proyección, datos de calibración).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de ajuste fino ni si hubo etapas de RLHF o DPO adicionales tras la abliteración. Tampoco se documenta si la variante "Aggressive" incluye un ajuste fino posterior sobre datos sin censura o si se limita a la edición de pesos. La cuantización a MXFP4 (formato de 4 bits con escala por bloque) reduce el tamaño del repo a 12,1 GB, lo que permite ejecución en hardware de consumo.

## Capacidades

- Generación de texto conversacional en inglés, con el estilo y las capacidades del modelo base gpt-oss-20b.
- Razonamiento multi-paso y cadenas de pensamiento (el modelo base gpt-oss-20b está diseñado con modo de razonamiento; la variante conserva presumiblemente esta capacidad, aunque no se documenta explícitamente).
- Respuesta a peticiones que el modelo base rechazaría, como consecuencia directa de la abliteración.
- Compatibilidad con LM Studio y sus botones de "Reasoning Effort" personalizados, según la model card.
- Carga en llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF.
- Capacidades de tool calling y function calling: no documentadas en esta variante; el modelo base las soporta, pero no se confirma que la abliteración las preserve.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repo.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve como caso de estudio para analizar cómo la abliteración afecta a la distribución de respuestas y a las métricas de rechazo, comparándolo con el gpt-oss-20b original y con la variante Balanced del mismo autor.
- Generación creativa sin restricciones temáticas: escritura de ficción, guiones o narrativa que aborde temas sensibles y que el modelo base podría declinar, en un entorno controlado y con revisión humana.
- Pruebas de robustez de filtros y moderación: usar el modelo como generador adversario para evaluar la eficacia de sistemas de moderación de contenido en pipelines propios.
- Despliegue local en hardware de consumo: al ser un GGUF MXFP4 de 12,1 GB, puede ejecutarse en estaciones de trabajo con GPU de 16 GB o superiores mediante llama.cpp u Ollama, sin dependencia de la nube.
- Experimentación con razonamiento en local: aprovechar el modo de razonamiento del modelo base para tareas de análisis y planificación en entornos offline, con la advertencia de que la calidad tras la abliteración no está evaluada.
- Integración en LM Studio para prototipado rápido: la compatibilidad documentada con los botones de Reasoning Effort facilita comparar configuraciones de esfuerzo de razonamiento en un entorno de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas de MMLU, HumanEval, GSM8K ni evaluaciones de tasa de rechazo. Tampoco se ofrecen comparaciones cuantitativas con el modelo base ni con la variante Balanced.

## Requisitos de hardware

- VRAM estimada: el repo GGUF MXFP4 ocupa 12,1 GB, por lo que se necesita al menos ~13-14 GB de VRAM para cargar el modelo completo en GPU con overhead de contexto.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), A100 (40/80 GB), H100 (80 GB) para mayor throughput y contextos largos.
- GPU de consumo: cabe en RTX 4090 y RTX 4080 de 16 GB; en GPUs de 12 GB requeriría offloading parcial a CPU o cuantizaciones adicionales no documentadas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. No se documenta soporte para vLLM o TGI con este formato.
- Latencia y throughput: no disponibles. Dependen del hardware, del backend y de la longitud de contexto; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| GPT-OSS-20B-Uncensored-HauhauCS-Aggressive | 20,9 mil M | no disponible | GGUF MXFP4 | other | Variante abliterada agresiva; solo inglés |
| gpt-oss-20b (OpenAI, base) | 20,9 mil M | no disponible en esta ficha | safetensors / MXFP4 | Apache 2.0 (según distribución original) | Modelo alineado con salvaguardas; referencia de comparación |
| GPT-OSS-20B-Uncensored-HauhauCS-Balanced | 20,9 mil M | no disponible | GGUF | other | Variante del mismo autor con abliteración más conservadora |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La abliteración elimina o reduce los mecanismos de rechazo del modelo base; el modelo puede generar contenido dañino, ilegal o sexualmente explícito sin las salvaguardas originales.
- No hay evaluación publicada de la calidad del modelo tras la abliteración: es plausible una degradación en razonamiento, coherencia y seguimiento de instrucciones, pero no está cuantificada.
- Riesgo elevado de alucinación, agravado por la falta de benchmarks y por la edición de pesos.
- Sesgos del modelo base presumiblemente heredados y no mitigados; la abliteración no corrige sesgos, solo suprime rechazos.
- Soporte únicamente en inglés según la etiqueta del repo; el rendimiento en otros idiomas no está documentado.
- Licencia "other": es imprescindible verificar los términos exactos heredados del modelo base gpt-oss-20b antes de cualquier uso comercial; la licencia del modelo base debe respetarse.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- El autor no documenta la metodología de abliteración, los datos usados ni las capas intervenidas, lo que dificulta la reproducibilidad.
- No se documenta soporte de tool calling ni de agentes en esta variante; no asumir que se conservan las capacidades del modelo base.
- Uso en producción desaconsejado sin una evaluación propia de calidad, seguridad y cumplimiento normativo.

## Enlaces

- Hugging Face: https://huggingface.co/mdcreativeagent/GPT-OSS-20B-Uncensored-HauhauCS-Aggressive
- Variante Balanced del mismo autor: https://huggingface.co/HauhauCS/GPT-OSS-20B-Uncensored-HauhauCS-Balanced
- Discord del autor: https://discord.gg/SZ5vacTXYf
- Modelo base gpt-oss-20b: no disponible en la información proporcionada (referencia nominal en la model card)
