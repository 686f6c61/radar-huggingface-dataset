# OVHaiLLM/Olala-v1.0-summarise

## Resumen

Olala-v1.0-summarise es un modelo especializado en resumen de documentos, obtenido por ajuste fino (fine-tuning) del modelo base OVHaiLLM/Olala-v1.0-mini-7A1B, desarrollado por OVHaiLLM (OVHcloud). Su propósito es generar resúmenes estructurados y fieles a la fuente a partir de documentos de muy diversa naturaleza: noticias, diálogos, hilos de foro, llamadas de resultados financieros, proyectos de ley, informes gubernamentales y artículos científicos. El modelo razona antes de redactar el resumen, lo que le permite mantener la fidelidad al contenido original y adaptarse a la forma solicitada por el usuario ("en una frase", "en viñetas", etc.).

La arquitectura es híbrida Mamba-MoE (según las etiquetas del autor: mamba, hybrid, moe), con 6.773.124.144 parámetros totales según los pesos en safetensors. El modelo base fue preentrenado con 12,8 billones de tokens y posteriormente sometido a ajuste supervisado y a una fase de RL antes de la especialización en resumen. El identificador "7A1B" del modelo base sugiere 7.000 millones de parámetros totales con 1.000 millones activos por token, si bien esta correspondencia no está confirmada de forma explícita en la información disponible.

El modelo es relevante porque combina un tamaño contenido (apto para despliegue en infraestructura moderada) con una especialización clara en una tarea de alto valor empresarial como es el resumen documental, y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial. Está disponible tanto en Hugging Face como a través de los AI Endpoints de OVHcloud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-MoE (transformer híbrido con mezcla de expertos, según etiquetas del autor) |
| Parametros totales | 6.773.124.144 |
| Parametros activos | no disponible (el identificador "7A1B" del modelo base sugiere ~1B activos, sin confirmación explícita) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (requiere custom_code) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida que combina capas Mamba con mezcla de expertos (MoE), según las etiquetas declaradas por el autor (mamba, hybrid, moe, custom_code). Esta combinación busca un equilibrio entre eficiencia computacional en secuencias largas (ventaja de los modelos de espacio de estados como Mamba) y capacidad de modelado mediante expertos dispersos. El modelo requiere cargar código personalizado (custom_code) a través de la librería transformers, lo que implica que no es un transformer estándar y necesita confiar en la implementación del autor al cargarlo.

El modelo base Olala-v1.0-mini-7A1B-base fue preentrenado con 12,8 billones de tokens. Sobre él se aplicó un ajuste supervisado (SFT) y posteriormente una fase de aprendizaje por refuerzo (RL), dando lugar al modelo post-entrenado Olala-v1.0-mini-7A1B, orientado a razonamiento, chat y uso de herramientas. Olala-v1.0-summarise es un ajuste fino adicional de ese modelo post-entrenado, especializado en resumen documental con razonamiento previo a la generación. No se dispone de información detallada sobre la composición del dataset de especialización ni sobre el algoritmo de RL empleado.

## Capacidades

- Generación de resúmenes de documentos de múltiples tipos: noticias, diálogos, hilos de foro, llamadas de resultados financieros, proyectos de ley, informes gubernamentales y artículos científicos.
- Razonamiento previo a la escritura: el modelo razona antes de producir el resumen, lo que favorece la fidelidad al contenido fuente.
- Resúmenes estructurados: capacidad de generar secciones o viñetas etiquetadas.
- Adaptación a la forma solicitada: puede producir resúmenes "en una frase", "en viñetas" u otros formatos indicados en la instrucción.
- Concisión: según el autor, sus resúmenes son más cortos que los de 16 de los 17 modelos comparados.
- Conversación multi-turno: heredada del modelo base post-entrenado (etiqueta conversational).
- Razonamiento y uso de herramientas: capacidades heredadas del modelo base Olala-v1.0-mini-7A1B (reasoning, tool use), aunque la especialización en resumen puede priorizar la tarea principal.
- Idiomas: únicamente inglés.

## Casos de uso

- Resumen de noticias para agregadores y boletines: el modelo puede condensar artículos periodísticos en resúmenes breves y estructurados, adecuado por su entrenamiento específico en documentos tipo noticia y su tendencia a la concisión.
- Síntesis de llamadas de resultados financieros: permite extraer los puntos clave de transcripciones de earnings calls en viñetas etiquetadas, útil para equipos de análisis financiero que necesitan procesar muchas llamadas en poco tiempo.
- Resumen de informes gubernamentales y proyectos de ley: su entrenamiento en documentos administrativos y legislativos lo hace adecuado para tareas de análisis normativo y seguimiento regulatorio.
- Revisión de literatura científica: puede generar resúmenes estructurados de artículos científicos, facilitando la revisión rápida de publicaciones y la extracción de secciones clave.
- Moderación y síntesis de foros y comunidades: resumen de hilos de discusión largos en puntos clave, útil para plataformas comunitarias que quieren ofrecer resúmenes automáticos a sus usuarios.
- Resumen de conversaciones y diálogos: aplicable a transcripciones de atención al cliente o reuniones, generando actas concisas y fieles con formato configurable.
- Integración en pipelines documentales vía AI Endpoints: al estar disponible en el catálogo de AI Endpoints de OVHcloud, puede consumirse como servicio gestionado para automatizar el resumen en flujos de gestión documental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona una comparación cualitativa de concisión (resúmenes más cortos que 16 de 17 modelos comparados), sin cifras de MMLU, HumanEval, GSM8K ni métricas de resumen como ROUGE.

## Requisitos de hardware

- VRAM estimada para inferencia: con 6.773 millones de parámetros, en precisión de 16 bits se requieren aproximadamente 13,5 GB solo para los pesos, más memoria para el contexto y el estado de inferencia; el repositorio ocupa 13,6 GB en safetensors.
- En cuantización de 8 bits se estiman unos 7-8 GB de VRAM; en 4 bits, unos 4-5 GB, aunque no se confirman formatos de cuantización publicados por el autor.
- GPU recomendadas: para fp16 sin cuantizar, GPU con 24 GB o más (RTX 4090, L40S, A100 40 GB, H100). Para cuantización 4/8 bits, GPU consumer de gama alta con 8-16 GB podrían ser suficientes, sujeto a la compatibilidad del código personalizado Mamba-MoE.
- Cabe en GPU consumer: probablemente en RTX 4090 (24 GB) en fp16 y en GPUs de 8-16 GB con cuantización, si bien la arquitectura híbrida con custom_code puede limitar las opciones de despliegue.
- Opciones de despliegue: transformers con custom_code (requisito del autor). No se confirma soporte para vLLM, llama.cpp, Ollama o TGI, dado que la arquitectura Mamba-MoE personalizada suele requerir implementaciones específicas. OVHcloud ofrece el modelo vía AI Endpoints como alternativa gestionada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Olala-v1.0-summarise | 6,77B | no disponible | Resumen documental | Apache 2.0 | Hugging Face, OVHcloud AI Endpoints |
| Olala-v1.0-mini-7A1B | ~7B (según nombre) | no disponible | Razonamiento, chat, tool use | Apache 2.0 | Hugging Face |
| Olala-v1.0-translate | no disponible | no disponible | Traducción automática | Apache 2.0 | Hugging Face |
| Modelos de resumen de propósito general (p. ej. variantes de 7-8B) | 7-8B | variable | Generalista | variable | variable |

No se dispone de datos de rendimiento comparativo en la información proporcionada, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte para inglés; su uso en castellano u otros idiomas no está garantizado y probablemente degrade la calidad.
- Riesgo de alucinación: como todo modelo generativo, puede introducir información no presente en el documento fuente, aunque su entrenamiento busca la fidelidad.
- Contexto: se desconoce la longitud máxima de contexto, lo que impide garantizar el resumen de documentos muy largos sin truncamiento.
- Arquitectura personalizada: requiere custom_code y confiar en la implementación del autor; la integración con frameworks de inferencia estándar (vLLM, llama.cpp, TGI) no está confirmada.
- Sesgos: no se documentan evaluaciones de sesgo; al entrenarse presumiblemente con datos mayoritariamente en inglés, puede reflejar sesgos culturales y lingüísticos de esos datos.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de los datos de entrenamiento del modelo base, no detalladas.
- Madurez: el modelo tiene muy pocas descargas (5) y ninguna interacción (0 likes) en el momento de la ficha, lo que sugiere poca validación por parte de la comunidad.
- Especialización estrecha: está optimizado para resumen; su rendimiento en otras tareas puede ser inferior al del modelo base del que deriva.

## Enlaces

- Hugging Face: https://huggingface.co/OVHaiLLM/Olala-v1.0-summarise
- Modelo base: https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B
- Modelo base preentrenado: https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B-base
- Modelo tras SFT: https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B-SFT
- Modelo especializado en traducción: https://huggingface.co/OVHaiLLM/Olala-v1.0-translate
- Informe técnico (PDF): https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B/blob/main/Olala-v1.0-mini.pdf
- Catálogo AI Endpoints de OVHcloud: https://www.ovhcloud.com/en/public-cloud/ai-endpoints/catalog/olala-1.0-mini/
- Playground: https://olala.ovh.com
