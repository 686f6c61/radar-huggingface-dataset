# Sanorian/Mistral-7B-4bit-1C-MLX

## Resumen

Mistral-7B-4bit-1C-MLX es un ajuste fino (fine-tune) del modelo mistralai/Mistral-7B-Instruct-v0.3, publicado por el usuario Sanorian (Kraynov Aleksandr Vitalievich, desarrollador fullstack/ML) en HuggingFace. El modelo está orientado a la generación de texto y código en el ecosistema 1C (1С:Предприятие), la plataforma rusa de ERP y desarrollo empresarial, y se distribuye exclusivamente en formato MLX cuantizado a 4 bits para su ejecución en Apple Silicon.

El autor indica que el ajuste se realizó sobre una muestra de 3000 líneas extraídas de dos datasets públicos: leongl/1c_github (código 1C alojado en GitHub) y kavlab/Spider-1C (variante en ruso del benchmark Spider de texto-a-SQL adaptada al lenguaje de consultas de 1C). El entrenamiento se llevó a cabo, según la model card, en un MacBook M5 Air, lo que sitúa el flujo de trabajo completo dentro del ecosistema MLX de Apple.

Se trata de un modelo con difusión muy limitada (0 descargas y 1 like en el momento de la consulta, repositorio de 4,1 GB), sin licencia declarada y sin resultados de benchmarks publicados. Su interés principal es como ejemplo de fine-tune de dominio muy específico (1C) ejecutable en hardware de consumo de Apple, más que como modelo de propósito general listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Mistral-7B-Instruct-v0.3) |
| Parametros totales | 7.248.023.552 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens según las especificaciones públicas del modelo base; no confirmado en la model card del fine-tune |
| Tipos de cuantizacion | 4-bit (MLX); el repositorio solo publica la variante cuantizada a 4 bits |
| Idiomas soportados | en, ru |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (library_name: mlx) |
| Modelo base | mistralai/Mistral-7B-Instruct-v0.3 |
| Tamano del repositorio | 4,1 GB |
| Libreria de inferencia | MLX (mlx-lm) |
| Tarea (pipeline) | text-generation |
| Fecha de creacion / actualizacion | 2026-09-10 / 2026-09-10 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Mistral-7B-Instruct-v0.3, un transformer decoder-only de aproximadamente 7.250 millones de parámetros con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención con consultas agrupadas (GQA). Según la documentación pública del modelo base, este emplea atención de ventana deslizante (sliding window attention) de 4096 tokens y extiende su ventana de contexto hasta 32.768 tokens, además de incorporar tokens adicionales para soporte de function calling. Esta ficha no puede confirmar que el fine-tune conserve íntegramente dichas características, ya que la model card del autor no aporta detalles arquitectónicos propios.

En cuanto al entrenamiento, la model card es muy escueta: señala un fine-tune sobre una muestra de 3000 líneas procedentes de los datasets leongl/1c_github y kavlab/Spider-1C, ejecutado en un MacBook M5 Air. No se especifica el método de ajuste (LoRA, QLoRA, full fine-tuning), ni el número de tokens de entrenamiento, ni la composición exacta del dataset, ni si se aplicaron etapas de RLHF o DPO posteriores. Tampoco se documenta la receta de cuantización a 4 bits más allá de la etiqueta "4-bit" y la librería MLX. El modelo hereda la naturaleza conversacional e instruction-tuned de Mistral-7B-Instruct-v0.3, sobre la que se superpone una especialización de dominio 1C.

## Capacidades

- Generación de texto conversacional en inglés y ruso, heredada del ajuste por instrucciones del modelo base.
- Generación y autocompletado de código en el lenguaje de 1C:Enterprise, presumiblemente inducido por el dataset leongl/1c_github.
- Generación de consultas del lenguaje de consultas de 1C, a partir del dataset kavlab/Spider-1C (variante rusa de Spider orientada a texto-a-SQL).
- Comprensión de esquemas de datos y traducción de preguntas en lenguaje natural a consultas estructuradas en el contexto 1C.
- Soporte potencial de function calling y tool calling, capacidad declarada por el modelo base Mistral-7B-Instruct-v0.3; no confirmada explícitamente en la model card del fine-tune.
- Ejecución local en Apple Silicon mediante MLX, sin necesidad de GPU dedicada ni de conexión a servicios externos.
- No se declaran capacidades multimodales (visión, audio), ni modo de razonamiento extendido (thinking mode), ni uso de agentes multi-paso verificados.
- El alcance multilingüe declarado se limita a en y ru; no hay soporte declarado de castellano.

## Casos de uso

- Asistente de código para 1C:Enterprise: el modelo puede generar y completar fragmentos de código en el lenguaje de 1C, aprovechando el ajuste sobre leongl/1c_github. Es adecuado como autocompletado en un editor o como generador de plantillas de módulos, siempre con revisión humana dado el tamaño reducido del dataset de ajuste.
- Generación de consultas del lenguaje de consultas de 1C: a partir de una descripción en ruso de una necesidad de negocio, el modelo puede proponer una consulta sobre el esquema de datos. El dataset Spider-1C apunta directamente a este escenario de texto-a-SQL adaptado a 1C.
- Refactorización y modernización de código legacy: dado un bloque de código 1C antiguo, el modelo puede proponer reescrituras o comentarios explicativos, útil en proyectos de migración de versiones de la plataforma.
- Documentación técnica automatizada: generación de comentarios de cabecera y descripciones de procedimientos para módulos de 1C, tarea de bajo riesgo que tolera errores y se beneficia del conocimiento de dominio del fine-tune.
- Prototipado local con privacidad de datos: al ejecutarse íntegramente en un Mac con Apple Silicon vía MLX, permite procesar código propietario o esquemas internos sin enviar datos a servicios en la nube, un requisito habitual en entornos empresariales.
- Plataforma de experimentación para fine-tuning en MLX: sirve como punto de partida para aplicar LoRA o QLoRA sobre código 1C en hardware Apple, usando mlx-lm como herramienta de entrenamiento e inferencia.
- Formación y soporte interno: chatbot de consulta sobre convenciones de desarrollo en 1C para equipos junior, limitado a inglés y ruso y con necesidad de validación de las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación (MMLU, HumanEval, GSM8K, Spider ni ninguna otra), y los resultados de la búsqueda web realizada no aportan datos de rendimiento del modelo. Tampoco existen cifras de latencia o throughput publicadas por el autor.

## Requisitos de hardware

- El modelo se distribuye únicamente en formato MLX, por lo que requiere un equipo Apple Silicon (serie M) con memoria unificada. No es ejecutable directamente en GPU NVIDIA o AMD sin una conversión previa a otro formato.
- Peso del repositorio: 4,1 GB. La inferencia a 4 bits requiere aproximadamente entre 5 y 6 GB de memoria unificada contando pesos, caché KV y overhead del runtime, por lo que cabe en equipos con 8 GB de memoria unificada y posteriores, aunque 16 GB ofrece mayor margen para contextos largos.
- Macs recomendados: cualquier Mac con chip M1 o superior y 16 GB o más de memoria unificada. El propio autor indica haber entrenado el modelo en un MacBook M5 Air.
- No aplica una recomendación de GPU de datacenter (A100, H100) para este artefacto concreto, ya que no hay pesos en formato CUDA ni GGUF publicados.
- Despliegue: mlx-lm (comandos generate y server) es la vía natural. Una conversión a GGUF permitiría usar llama.cpp u Ollama, pero no está incluida en el repositorio y requeriría herramientas de conversión de terceros.
- vLLM y TGI no soportan pesos MLX de forma nativa; sería necesario convertir a safetensors estándar o GGUF previamente.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones y dependerán del chip concreto, la longitud de contexto y el lote utilizado.

## Comparativa con modelos similares

La información disponible no permite una comparación de rendimiento, ya que no hay benchmarks publicados para este modelo ni modelos comparables de dominio 1C documentados en la búsqueda realizada. La siguiente tabla recoge únicamente datos públicos de especificaciones de alternativas de tamaño similar; los datos del modelo comparado corresponden a la documentación oficial de su repositorio, no a mediciones realizadas para esta ficha.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Sanorian/Mistral-7B-4bit-1C-MLX | 7.248.023.552 | 32.768 (heredado del base) | no disponible | MLX safetensors 4-bit | Fine-tune de dominio 1C sobre 3000 líneas; solo Apple Silicon |
| mistralai/Mistral-7B-Instruct-v0.3 | ~7.250 millones | 32.768 | Apache 2.0 | safetensors, GGUF (comunidad) | Modelo base; propósito general; soporte declarado de function calling |
| Qwen2.5-Coder-7B | ~7.600 millones | 32.768 | Apache 2.0 | safetensors, GGUF (comunidad) | Alternativa de código de tamaño similar; sin especialización en 1C |
| Llama-3.1-8B-Instruct | ~8.000 millones | 128.000 | Llama 3.1 Community License | safetensors, GGUF (comunidad) | Mayor contexto; licencia con restricciones de uso y cláusula de escala |

No se han identificado en la búsqueda otros fine-tunes públicos orientados específicamente a 1C con los que comparar de forma directa.

## Limitaciones y advertencias

- Dataset de ajuste muy reducido: 3000 líneas es un volumen bajo para un modelo de 7B, lo que eleva el riesgo de sobreajuste al dominio y de olvido catastrófico de capacidades generales del modelo base. No se especifica si se aplicaron técnicas de regularización.
- Licencia no declarada: el repositorio no indica licencia. Aunque el modelo base Mistral-7B-Instruct-v0.3 se distribuye bajo Apache 2.0, la ausencia de licencia explícita en el derivado genera incertidumbre jurídica para uso comercial. Conviene contactar con el autor (sanorian@yandex.ru) antes de cualquier despliegue en producción.
- Cuantización a 4 bits: la única variante publicada está cuantizada, lo que implica una pérdida de calidad respecto a los pesos en precisión completa. No se documenta el esquema exacto de cuantización ni se ofrecen versiones en 8 bits o fp16 para comparar.
- Dependencia de plataforma: los pesos están en formato MLX y solo se ejecutan en Apple Silicon. No hay versión GGUF, ONNX ni safetensors estándar en el repositorio.
- Idiomas limitados a inglés y ruso: no hay soporte declarado de castellano. El conocimiento de dominio (1C) está además vinculado al ruso, ya que los datasets de origen son rusoparlantes.
- Riesgo elevado de alucinación: sin evaluación publicada, no hay evidencia de que el modelo no genere código o consultas sintácticamente plausibles pero incorrectas, algo especialmente crítico en el lenguaje de consultas de 1C y en lógica de negocio de ERP.
- Ausencia de validación comunitaria: 0 descargas y 1 like en el momento de la consulta implican que el modelo no ha sido probado de forma independiente por terceros.
- Metadatos inconsistentes: las fechas de creación y actualización indican 2026, y la model card menciona un "MacBook M5 Air"; conviene verificar estos datos con el autor si son relevantes para la evaluación.
- Especialización estrecha: el ajuste cubre un dominio muy concreto (1C). No se recomienda su uso como modelo generalista de conversación, generación de código en otros lenguajes o asistencia en tareas ajenas al dominio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sanorian/Mistral-7B-4bit-1C-MLX
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Dataset kavlab/Spider-1C: https://huggingface.co/datasets/kavlab/Spider-1C
- Dataset leongl/1c_github: https://huggingface.co/datasets/leongl/1c_github
- Contacto del autor (indicado en la model card): sanorian@yandex.ru
- Los resultados de la búsqueda web realizada no contienen ningún enlace relevante al modelo, a sus datasets ni a documentación técnica asociada; los resultados devueltos corresponden a páginas de soporte de Microsoft y no guardan relación con esta ficha.
