# Atishaymint/orvansi-v1-gemma2-9b

## Resumen

El modelo `Atishaymint/orvansi-v1-gemma2-9b` es un fine-tuning del modelo base `unsloth/gemma-2-9b-bnb-4bit`, que a su vez es una versión cuantizada a 4 bits del Gemma 2 de 9B parámetros desarrollado por Google. El autor, Atishaymint, ha subido este modelo a HuggingFace con licencia Apache 2.0, lo que permite uso comercial y modificación sin restricciones significativas. El repositorio ocupa solo 0.3 GB, lo que sugiere que podría tratarse de un adaptador (como LoRA) o de una versión cuantizada, aunque la información disponible no lo especifica.

La relevancia de este modelo radica en que parte de una arquitectura probada y eficiente como es Gemma 2, que incorpora innovaciones como atención local-global intercalada y group-query attention. Sin embargo, la model card es extremadamente escueta: no se indica el dataset de fine-tuning, el método de entrenamiento (SFT, DPO, RLHF) ni el propósito del modelo. Esto limita la evaluación de sus capacidades reales y obliga a tratar las especificaciones del base como referencia, no como garantía del comportamiento del fine-tune.

En el momento de redactar esta ficha, el modelo cuenta con 0 descargas y 0 likes, lo que indica que es muy reciente y no ha sido validado por la comunidad. Cualquier uso en producción debe ir precedido de pruebas exhaustivas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención local-global intercalada y group-query attention (arquitectura Gemma 2) |
| Parametros totales | no disponible (el repositorio ocupa 0.3 GB, probablemente un adaptador o cuantización, no se especifica) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens (valor del base Gemma 2 9B; no se confirma si el fine-tune lo modifica) |
| Tipos de cuantizacion | no disponible (el base es 4-bit, pero el repositorio del fine-tune no lo indica) |
| Idiomas soportados | en (según metadata) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (según tags) |

## Arquitectura y entrenamiento

El modelo base, Gemma 2 9B, es un Transformer que introduce dos modificaciones clave respecto a la primera generación de Gemma: intercala atención local (ventana de 4096 tokens) y atención global en capas alternas, lo que reduce el coste computacional manteniendo la calidad, y utiliza group-query attention (GQA) para optimizar la inferencia. El modelo fue preentrenado con 8 billones de tokens (según el paper de Gemma 2) y posteriormente refinado con técnicas de RLHF y destilación.

El fine-tuning realizado por Atishaymint se ha llevado a cabo con la librería Unsloth, que permite entrenar modelos 2 veces más rápido mediante optimizaciones en memoria y kernels. Sin embargo, no se proporciona información sobre el dataset utilizado, el número de pasos de entrenamiento, ni si se aplicó RLHF, DPO u otro método. El tamaño reducido del repositorio (0.3 GB) sugiere que el fine-tuning podría haberse hecho mediante adaptadores de bajo rango (LoRA) sobre el modelo cuantizado en 4 bits, pero esto es una inferencia no confirmada.

## Capacidades

Las capacidades que se describen a continuación corresponden al modelo base Gemma 2 9B, ya que no hay información específica sobre el fine-tune. El fine-tuning puede haber alterado o especializado estas capacidades, pero no se puede verificar.

- Generación de texto y razonamiento: el modelo base es capaz de producir texto coherente y resolver tareas de razonamiento complejo, con mejoras de hasta un 10% en algunos benchmarks respecto a Gemma 1.
- Comprensión multilingüe: aunque la metadata indica solo "en", el base Gemma 2 fue entrenado con datos multilingües, por lo que el modelo puede tener cierta capacidad en otros idiomas, aunque no está garantizado.
- Razonamiento matemático y código: Gemma 2 9B muestra buen rendimiento en tareas de matemáticas y generación de código, aunque no es su especialidad principal.
- Tool calling y agentes: no hay información específica sobre si el fine-tune añade soporte para function calling o uso de herramientas. El base no tiene un soporte nativo destacado para esto.
- Capacidades multimodales: no, el modelo es exclusivamente de texto.

## Casos de uso

No se dispone de información documentada sobre los casos de uso previstos por el autor. Sin embargo, dado el tamaño y la arquitectura base, se pueden plantear escenarios plausibles, siempre sujetos a validación:

- Generación de texto asistida en aplicaciones de productividad: el modelo puede redactar correos, resúmenes o documentos a partir de instrucciones, gracias a su capacidad de generación fluida.
- Asistentes conversacionales en inglés: al estar fine-tuneado sobre un modelo de 9B, puede alimentar chatbots de dominio general en inglés, con una ventana de contexto de 8192 tokens para mantener conversaciones multi-turno.
- Análisis y extracción de información en documentos largos: con 8192 tokens de contexto, puede procesar artículos o informes extensos y extraer conclusiones o datos clave.
- Generación de código en entornos de desarrollo: aunque no se confirma, el base Gemma 2 9B tiene capacidades de código; el fine-tune podría haberlas mejorado o redirigido.
- Prototipado rápido de aplicaciones de IA: por su licencia Apache 2.0 y su tamaño manejable, es adecuado para experimentar en entornos de investigación o desarrollo.
- Clasificación y análisis de texto: el modelo puede adaptarse mediante zero-shot o few-shot para tareas de sentimiento, categorización o detección de temas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para el modelo `orvansi-v1-gemma2-9b`. Los datos disponibles corresponden al modelo base Gemma 2 9B, que se recogen en el paper técnico de Gemma 2 (arXiv:2408.00118). A modo orientativo, el base obtiene los siguientes resultados en algunos benchmarks estándar:

| Benchmark | Gemma 2 9B (base) |
|---|---|
| MMLU (5-shot) | 71.3 |
| HellaSwag (10-shot) | 78.9 |
| HumanEval (pass@1) | 40.0 |
| GSM8K (8-shot, maj@1) | 62.0 |
| MBPP (pass@1) | 52.0 |

Estos números provienen del paper de Gemma 2 y no son directamente aplicables al fine-tune, que puede presentar un rendimiento diferente según el dataset y el método de entrenamiento empleado. No se recomienda utilizar estos valores para decidir el despliegue sin realizar evaluaciones propias.

## Requisitos de hardware

Dado que el repositorio ocupa 0.3 GB, es probable que el modelo se distribuya como un adaptador o una versión cuantizada. Para inferencia, se necesitará cargar tanto el adaptador como el modelo base (Gemma 2 9B). Las estimaciones se basan en el tamaño del base:

- VRAM estimada: con cuantización 4-bit, el modelo base ocupa aproximadamente 5-6 GB en VRAM; con 8-bit, unos 9-10 GB; en fp16, unos 18 GB. El adaptador añade una sobrecarga pequeña (menos de 1 GB).
- GPU recomendadas: una NVIDIA RTX 3090 o 4090 (24 GB VRAM) es suficiente para fp16; GPUs con 8-12 GB (como RTX 3070 o 4060 Ti) pueden ejecutar la versión 4-bit.
- En consumer GPU: sí, cabe en GPUs de gama media-alta si se usa cuantización 4-bit u 8-bit.
- Opciones de despliegue: al ser un modelo de la familia transformers, puede servirse con vLLM, Text Generation Inference (TGI) o llama.cpp (si se convierte a GGUF). También es compatible con Ollama si se empaqueta adecuadamente.
- Latencia y throughput: no se dispone de datos medidos para este fine-tune. Para el base en 4-bit en una RTX 4090, se pueden esperar velocidades de generación de 50-100 tokens por segundo, dependiendo de la configuración.

## Comparativa con modelos similares

El modelo se basa en Gemma 2 9B, por lo que la comparativa se establece con otros modelos de la misma categoría (7-9B parámetros). Los datos de los competidores son públicos y no incluyen el fine-tune específico, sino sus versiones base.

| Modelo | Parámetros | Contexto | Licencia | MMLU | HumanEval |
|---|---|---|---|---|---|
| Gemma 2 9B (base) | 9B | 8192 | Apache 2.0 | 71.3 | 40.0 |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 Community License | 66.0 | 72.6 |
| Mistral 7B v0.3 | 7B | 32K | Apache 2.0 | 60.1 | 30.5 |
| Qwen 2.5 7B | 7B | 32K | Apache 2.0 | 70.5 | 71.6 |

El fine-tune `orvansi-v1` no tiene datos propios, por lo que no se puede posicionar en esta tabla. Su ventaja principal es que parte de un base sólido con licencia permisiva, pero la falta de documentación impide una comparación justa.

## Limitaciones y advertencias

- No hay información sobre el dataset de fine-tuning ni el método de entrenamiento, por lo que se desconocen los sesgos específicos que el modelo pueda haber adquirido.
- El modelo base Gemma 2 presenta sesgos inherentes derivados de sus datos de preentrenamiento, que pueden amplificarse o modificarse en el fine-tune.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en dominios no cubiertos por sus datos de entrenamiento.
- Limitaciones de idioma: la metadata indica solo "en", por lo que el rendimiento en otros idiomas puede ser deficiente o nulo.
- El repositorio tiene 0 descargas y 0 likes, lo que indica falta de validación por parte de la comunidad. No se recomienda su uso en producción sin pruebas exhaustivas.
- La licencia Apache 2.0 permite uso comercial, pero no incluye garantías ni soporte por parte del autor.
- El tamaño del repositorio (0.3 GB) sugiere que podría ser un adaptador; para la inferencia se necesitará descargar también el modelo base, lo que implica gestionar dos componentes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Atishaymint/orvansi-v1-gemma2-9b
- Paper técnico de Gemma 2: https://arxiv.org/abs/2408.00118
- Reporte técnico de Gemma 2 (PDF): https://storage.googleapis.com/deepmind-media/gemma/gemma-2-report.pdf
- Model card de Gemma 2 (Google AI): https://ai.google.dev/gemma/docs/core/model_card_2
- Página de Gemma 2 9B en CanIRun: https://www.canirun.ai/model/gemma2-9b
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
