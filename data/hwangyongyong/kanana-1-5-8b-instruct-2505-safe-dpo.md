# hwangyongyong/kanana-1.5-8b-instruct-2505-Safe-DPO

## Resumen

Kanana-1.5-8b-instruct-2505-Safe-DPO es un ajuste fino (fine-tuning) del modelo Kanana 1.5 de 8B parámetros orientado a instrucciones, publicado por el usuario hwangyongyong en Hugging Face. El modelo se presenta como un derivado entrenado con técnicas de DPO (Direct Preference Optimization) bajo la etiqueta "Safe", lo que sugiere un alineamiento adicional orientado a la seguridad de las respuestas. Está construido sobre la arquitectura Llama y consta de 8.030.285.824 parámetros totales, con pesos en formato safetensors y un tamaño de repositorio de 16,1 GB.

La model card es extremadamente escueta: se limita a indicar que se trata de un modelo subido y ajustado por el autor, que fue entrenado con Unsloth y la librería TRL de Hugging Face, y que se distribuye bajo licencia Apache 2.0. No se documentan detalles sobre el dataset de entrenamiento, el proceso de DPO, la longitud de contexto ni los idiomas soportados más allá de la etiqueta "en" (inglés). El modelo base declarado es el propio identificador del repositorio, lo que indica una cadena de ajuste autorreferenciada sin trazabilidad clara hacia el Kanana 1.5 original.

Su relevancia es limitada y fundamentalmente experimental: se trata de un modelo derivado de un linaje coreano (Kanana, de Kakao) reajustado por un tercero, con cero descargas y cero likes en el momento de la consulta. Resulta útil como ejemplo de fine-tuning con DPO sobre modelos Llama-like, pero carece de documentación suficiente para evaluar su calidad o idoneidad en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (según tag `llama`) |
| Parametros totales | 8.030.285.824 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos originales en safetensors; compatible con cuantización vía Unsloth/llama.cpp no confirmada) |
| Idiomas soportados | Inglés (`en` según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Llama, tal como indica la etiqueta `llama` de la model card y la librería `transformers`. Con 8.030 millones de parámetros, se sitúa en la categoría de modelos densos de 8B, un tamaño habitual para despliegue en GPUs de gama alta de consumo. No se dispone de información sobre el número de capas, dimensión oculta, número de cabezas de atención ni el tipo de atención (MHA, GQA, etc.) empleado, ya que la model card no aporta detalles arquitectónicos.

En cuanto al entrenamiento, la única información disponible es que se realizó un ajuste fino con Unsloth y la librería TRL de Hugging Face, y que el modelo incorpora DPO (según el nombre "Safe-DPO") para alinear las respuestas hacia un comportamiento más seguro. No se especifica el número de tokens de entrenamiento, la composición del dataset de preferencias, ni si hubo etapas previas de SFT. El modelo base declarado es el propio repositorio, lo que impide reconstruir la cadena exacta de ajuste a partir de la información proporcionada.

## Capacidades

- Generación de texto conversacional en inglés, orientada a instrucciones (tag `conversational`).
- Ajuste orientado a seguridad mediante DPO, presumiblemente para reducir respuestas dañinas o inapropiadas (no documentado en detalle).
- Compatibilidad con Transformers y con Text Generation Inference (TGI), según los tags.
- Compatibilidad declarada con endpoints (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Experimentación con DPO sobre modelos Llama-like: el modelo sirve como punto de partida para estudiar cómo el ajuste por preferencias modifica el comportamiento de un modelo de 8B, comparando respuestas antes y después del DPO en tareas de seguridad.
- Generación de texto conversacional en inglés para prototipos: dado su tamaño de 8B, puede desplegarse en una GPU de 24 GB con cuantización y emplearse en demos de chatbots de propósito general en inglés.
- Evaluación de alineamiento y seguridad: al estar etiquetado como "Safe", es útil para probar baterías de prompts adversarios y medir la tasa de rechazo o evasión frente a contenido sensible.
- Base para fine-tuning específico de dominio: al ser Apache 2.0 y estar en formato safetensors compatible con Transformers y Unsloth, puede reajustarse con LoRA/QLoRA para tareas concretas (clasificación, extracción, resumen) en inglés.
- Integración en pipelines de TGI: el tag `text-generation-inference` permite desplegarlo en un servidor TGI para servir peticiones HTTP de generación de texto en un entorno controlado.
- Estudio de reproducibilidad de ajustes comunitarios: sirve como caso de análisis sobre la trazabilidad de modelos derivados publicados sin documentación detallada, comparando su comportamiento con el Kanana 1.5 original si se dispone de él.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda un mínimo de 20-24 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB; en 4 bits, en torno a 5-6 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para FP16 sin cuantizar con contexto largo; RTX 4090 (24 GB) o RTX A6000 (48 GB) para FP16 con contexto moderado; RTX 3090/4090 para cuantización 8 o 4 bits.
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4090 y, con cuantización agresiva, en GPUs de 12-16 GB (RTX 4080, RTX 4070 Ti Super), aunque el contexto efectivo se verá reducido.
- Opciones de despliegue: Transformers, Text Generation Inference (TGI), y potencialmente vLLM y llama.cpp/Ollama mediante conversión a GGUF (no confirmado por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| kanana-1.5-8b-instruct-2505-Safe-DPO | 8,03B | No disponible | Apache 2.0 | Inglés | Hugging Face (0 descargas) |
| Kanana 1.5 8B Instruct (original, Kakao) | ~8B | No disponible en esta ficha | No disponible | Coreano/inglés (según versión) | Hugging Face |
| Llama 3.1 8B Instruct | 8,03B | 128K | Llama 3.1 Community License | Multilingüe | Hugging Face, ampliamente desplegado |
| Qwen2.5 7B Instruct | 7,6B | 128K | Apache 2.0 | Multilingüe | Hugging Face |

La comparativa se limita a parámetros, licencia e idiomas, ya que no hay datos de rendimiento publicados para este modelo. Frente a Llama 3.1 8B o Qwen2.5 7B, este ajuste carece de benchmarks, documentación de contexto y soporte multilingüe declarado, por lo que su idoneidad en producción es inferior a la de las alternativas consolidadas.

## Limitaciones y advertencias

- Documentación prácticamente inexistente: la model card no describe dataset, hiperparámetros, contexto ni evaluación, lo que impide reproducir o validar el ajuste.
- Trazabilidad del modelo base ambigua: el campo `base_model` apunta al propio repositorio, sin enlace verificable al Kanana 1.5 original.
- Idiomas: solo se declara inglés; no hay evidencia de soporte para castellano u otros idiomas.
- Riesgo de alucinación: inherente a los modelos de 8B sin evaluación publicada; no hay datos que permitan acotarlo.
- Sesgos: no documentados; el ajuste DPO "Safe" puede introducir sesgos de rechazo excesivo o evasión no caracterizados.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de un modelo base de terceros conviene verificar la licencia del Kanana original antes de explotarlo comercialmente.
- Cero descargas y cero likes: sin validación por parte de la comunidad, lo que desaconseja su uso en producción sin evaluación previa.
- Sin garantías de soporte ni mantenimiento por parte del autor.

## Enlaces

- Hugging Face: https://huggingface.co/hwangyongyong/kanana-1.5-8b-instruct-2505-Safe-DPO
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: no disponible enlace directo en la información proporcionada
- Modelo base Kanana 1.5 (referencia): no disponible enlace verificado en la información proporcionada
