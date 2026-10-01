# heydothan/rectuna-qwen2.5-1.5b

## Resumen

rectuna-qwen2.5-1.5b es un adaptador LoRA publicado por el usuario heydothan en HuggingFace, construido sobre el modelo base unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit, que a su vez es una versión cuantizada a 4 bits del Qwen2.5-1.5B-Instruct de Alibaba. No se trata por tanto de un modelo completo con pesos propios, sino de un ajuste fino ligero (adaptador PEFT) que debe cargarse junto al modelo base para poder inferir. El repositorio ocupa 0,1 GB y fue creado el 1 de octubre de 2026, sin descargas ni interacciones registradas en el momento de redactar esta ficha.

El modelo hereda las características del Qwen2.5-1.5B-Instruct: un transformer denso decoder-only de aproximadamente 1.540 millones de parámetros, con 28 capas y una ventana de contexto de 32.768 tokens. La familia Qwen2.5 fue preentrenada sobre hasta 18 billones de tokens según el informe técnico de Qwen, frente a los 7 billones de Qwen2, e incluye variantes base e instruct en siete tamaños (0,5B, 1,5B, 3B, 7B, 14B, 32B y 72B). El interés de este adaptador concreto reside en su tamaño reducido, que permite ejecutarlo en hardware de gama baja, pero su utilidad real está condicionada por la ausencia total de documentación sobre el dataset, el procedimiento y el objetivo del ajuste.

La model card del autor es la plantilla por defecto de HuggingFace sin rellenar: todos los campos relevantes (desarrollador, idiomas, licencia, datos de entrenamiento, hiperparámetros, evaluación) figuran como "More Information Needed". Esto significa que cualquier evaluación seria del adaptador exige reproducir su carga y probarlo empíricamente, ya que no existe información verificable sobre qué mejora aporta respecto al modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer denso decoder-only (Qwen2) |
| Parámetros totales | No disponible para el adaptador; el modelo base tiene ~1,54B de parámetros (tamaño del repo del adaptador: 0,1 GB) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantización | El adaptador se distribuye en precisión de entrenamiento (safetensors); el modelo base referenciado está cuantizado a 4 bits (bnb-4bit). Para GGUF es necesario fusionar contra el modelo base sin cuantizar |
| Idiomas soportados | No especificados para el adaptador; el modelo base Qwen2.5 declara soporte multilingüe (29 idiomas en la familia Qwen2.5) |
| Licencia | No disponible (el repositorio del adaptador no declara licencia; la del modelo base Qwen2.5-1.5B-Instruct es Apache 2.0 según su model card oficial) |
| Formato de pesos | safetensors (pesos de adaptador LoRA), librería peft |
| Modelo base | unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit |
| Librería / framework | PEFT 0.20.0, transformers, TRL, Unsloth |
| Pipeline | text-generation |
| Fecha de creación / actualización | 2026-10-01 / 2026-10-01 |

## Arquitectura y entrenamiento

El adaptador se entrenó mediante SFT (supervised fine-tuning) con las librerías TRL y Unsloth sobre el checkpoint cuantizado a 4 bits de Qwen2.5-1.5B-Instruct. Las etiquetas del repositorio (peft, lora, sft, trl, unsloth) confirman la técnica, pero no se especifica el rango de la LoRA, los módulos objetivo, el número de pasos, la tasa de aprendizaje ni la composición del dataset. El nombre "rectuna" no va acompañado de ninguna explicación en la model card, por lo que se desconoce el dominio o la tarea para la que se ajustó.

La arquitectura subyacente es la del Qwen2.5-1.5B-Instruct: un transformer decoder-only denso con normalización RMSNorm, activación SwiGLU, embeddings de entrada y salida atados y atención con consultas agrupadas (GQA). Según la documentación de Qwen, la familia Qwen2.5 se preentrenó sobre hasta 18 billones de tokens, con una etapa posterior de ajuste supervisado y optimización por preferencias. No se ha publicado ninguna innovación técnica específica para este adaptador, ni datos de ablation, ni comparación con el modelo base sin ajustar.

Un detalle operativo relevante: como el modelo base referenciado está cuantizado a 4 bits (bnb-4bit), el adaptador se puede cargar directamente sobre ese checkpoint con PEFT, pero para exportar a GGUF o fusionar los pesos en fp16/bf16 es necesario aplicar la LoRA sobre el Qwen2.5-1.5B-Instruct sin cuantizar, no sobre la versión bnb-4bit.

## Capacidades

- Generación de texto conversacional multilingüe, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento básico, resumen, reescritura, extracción de información y clasificación de texto.
- Generación de código y comprensión de fragmentos cortos, con calidad limitada por el tamaño de 1,5B parámetros.
- Soporte de tool calling y de plantillas de chat con roles, siempre que se use el chat template de Qwen2.5 correctamente.
- Capacidad de operar en modo agente con razonamiento de varios pasos, aunque con fiabilidad reducida frente a modelos de mayor tamaño.
- Capacidades específicas del ajuste LoRA: no documentadas. Se desconoce si el adaptador añade o especializa alguna habilidad concreta respecto al modelo base.
- No se documenta soporte de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Asistente conversacional embebido en local: al ser un adaptador sobre un modelo de 1,5B, se puede desplegar en portátiles o mini-PC con 4-8 GB de VRAM o incluso en CPU, cubriendo conversaciones multi-turno de hasta 32.768 tokens de contexto sin enviar datos a la nube.
- Clasificación y etiquetado de texto a escala: procesar grandes volúmenes de tickets, reseñas o correos para asignar categorías o sentimiento, con un coste por token muy inferior al de modelos de 7B o superiores.
- Extracción de campos en documentos: dado su contexto de 32k tokens, puede ingerir contratos o informes extensos y devolver campos estructurados en JSON, útil en pipelines de digitalización.
- Generación y autocompletado de código en entornos con recursos limitados: integrable en editores o scripts de CI como asistente de snippets, teniendo en cuenta que no es un modelo especializado en código.
- Preprocesado y enrutado dentro de un sistema RAG: uso como modelo de bajo coste para reescribir consultas, decidir si hace falta recuperación o resumir los fragmentos recuperados antes de pasarlos a un modelo mayor.
- Prototipado e investigación de ajuste fino: sirve como punto de partida para experimentar con LoRA sobre Qwen2.5-1.5B en una única GPU consumer, ya que el coste de entrenamiento y de iteración es bajo.
- Traducción y adaptación de estilo en dominios concretos: si el ajuste "rectuna" (no documentado) tuviese un dominio objetivo, sería reutilizable para tareas de reescritura o normalización de textos en ese ámbito.
- Filtrado y moderación de contenido en el borde: uso como primera línea de defensa para descartar entradas triviales antes de invocar modelos más caros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio del adaptador no incluye ninguna sección de evaluación con datos (MMLU, HumanEval, GSM8K u otros), y la model card deja todos los campos de "Evaluation" como "More Information Needed".

Tampoco se han publicado mediciones de latencia, throughput, consumo de memoria o comparaciones frente al modelo base sin ajustar. Las cifras de rendimiento del Qwen2.5-1.5B-Instruct original sí existen en el informe técnico de Qwen2.5 (arXiv:2412.15115), pero no se reproducen aquí porque no forman parte de la información proporcionada sobre este adaptador. Cualquier uso en producción debería ir precedido de una evaluación propia contra el modelo base, dado que no hay evidencia pública de que el ajuste LoRA aporte una mejora medible.

## Requisitos de hardware

- Pesos del adaptador: 0,1 GB, insignificantes frente al modelo base que hay que cargar aparte.
- VRAM estimada (estimaciones orientativas, no medidas): unos 3,1 GB de pesos en bf16/fp16; alrededor de 1,6 GB en int8/Q8_0; aproximadamente 1,0 GB en Q4_K_M.
- Caché KV estimada para el modelo base: con GQA de 2 cabezas KV, 28 capas y dimensión de cabeza 128, en torno a 28 KB por token en fp16, es decir, aproximadamente 0,9 GB para los 32.768 tokens de contexto completo. Se reduce a la mitad con caché KV en 8 bits.
- VRAM total práctica en bf16: alrededor de 4-5 GB contando pesos, caché KV a contexto largo y activaciones. En Q4 con contexto moderado, cabe en 2-3 GB.
- GPU recomendadas: cualquier GPU con 6 GB o más (RTX 3060, RTX 4060, RTX 2070) para bf16 con contexto amplio; GPUs de 16-24 GB (RTX 4090, A100, H100) permiten lotes grandes y alta concurrencia en vLLM, aunque están sobredimensionadas para un modelo de este tamaño.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU dedicada moderna; en configuraciones Q4 puede ejecutarse incluso en iGPU con memoria unificada o en CPU con llama.cpp.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador junto al modelo base; vLLM con soporte de LoRA (`--enable-lora`) para servir múltiples adaptadores; TGI con adaptadores LoRA; Ollama o llama.cpp tras fusionar la LoRA con la versión fp16 del modelo base y convertir a GGUF; Unsloth para reentrenamiento o fusión.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

La comparación se establece sobre las especificaciones del modelo base, ya que el adaptador no publica métricas propias. Los datos de los modelos alternativos provienen de sus model cards públicas y deben verificarse antes de tomar decisiones de producción.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| rectuna-qwen2.5-1.5b (adaptador) | ~1,54B (modelo base) | 32.768 tokens | No disponible | HuggingFace, adaptador LoRA |
| Qwen2.5-1.5B-Instruct | ~1,54B | 32.768 tokens | Apache 2.0 | HuggingFace, safetensors y GGUF comunitarios |
| Llama-3.2-1B-Instruct | ~1,23B | 128.000 tokens | Llama 3.2 Community License | HuggingFace, safetensors y GGUF |
| SmolLM2-1.7B-Instruct | ~1,7B | 8.192 tokens | Apache 2.0 | HuggingFace, safetensors y GGUF |
| Gemma-2-2B-it | ~2,6B | 8.192 tokens | Gemma Terms of Use | HuggingFace, safetensors y GGUF |

En términos nominales, la ventaja de Qwen2.5-1.5B frente a SmolLM2 y Gemma-2 es la ventana de contexto de 32k, cuatro veces mayor. Frente a Llama-3.2-1B pierde en contexto (32k frente a 128k) pero parte de una licencia Apache 2.0 más permisiva que la licencia comunitaria de Meta. No hay datos de rendimiento comparado disponibles para el adaptador rectuna, por lo que no es posible afirmar que supere al modelo base en ninguna tarea.

## Limitaciones y advertencias

- Documentación inexistente: la model card es la plantilla por defecto sin rellenar. Se desconocen el dataset, la tarea objetivo, los hiperparámetros y el autor real del ajuste.
- Licencia sin declarar en el repositorio del adaptador. Aunque el modelo base Qwen2.5-1.5B-Instruct se distribuye bajo Apache 2.0, la ausencia de licencia explícita en el adaptador genera incertidumbre jurídica para uso comercial. Conviene contactar con el autor antes de desplegarlo en producción.
- Sin validación comunitaria: cero descargas y cero interacciones en el momento de la consulta. No hay usuarios que hayan reportado comportamiento, calidad o problemas.
- Riesgo de alucinación: inherente a un modelo denso de 1,5B parámetros, con especial incidencia en preguntas factuales, matemáticas de varios pasos y razonamiento encadenado largo.
- Degradación en contextos largos: aunque la ventana nominal sea de 32.768 tokens, los modelos pequeños suelen perder precisión en la recuperación de información en posiciones intermedias del contexto.
- Cobertura idiomática incierta: el adaptador no declara idiomas y no hay evidencia de que el ajuste SFT se haya hecho sobre datos multilingües; el ajuste fino puede haber estrechado el comportamiento del modelo base hacia un idioma o registro concreto.
- Sesgos no evaluados: no se ha publicado ningún análisis de sesgo, toxicidad o seguridad. Al heredar el preentrenamiento de Qwen2.5, arrastra los sesgos de ese corpus, potencialmente amplificados o alterados por el ajuste.
- Sin benchmarks: no existe ninguna medida que demuestre que el adaptador mejora al modelo base. Un despliegue basado en la suposición de mejora sería infundado.
- Dependencia del modelo base cuantizado: el adaptador está anclado a unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit, lo que obliga a bitsandbytes para cargarlo tal cual y complica la exportación directa a GGUF.
- Fecha de creación anómala (2026-10-01) y actualización el mismo día, con un único commit aparente; no hay historial que permita evaluar la madurez del trabajo.
- Al ser un adaptador y no un modelo completo, no puede desplegarse de forma autónoma: siempre requiere descargar y ejecutar el modelo base, con el coste de memoria y almacenamiento asociado.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/heydothan/rectuna-qwen2.5-1.5b
- Modelo base (versión cuantizada usada en el entrenamiento): https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit
- Qwen2.5-1.5B-Instruct (modelo original): https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Qwen2.5-1.5B (variante base): https://huggingface.co/Qwen/Qwen2.5-1.5B
- Informe técnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- Repositorio no oficial de la serie Qwen2.5: https://github.com/mx4ai/qwen2.5
- Perfil de Qwen 2.5 con el anuncio de la release: https://d-central.tech/ai/model/qwen-2-5/
- Referencia citada en las etiquetas del repositorio (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental de ML: https://mlco2.github.io/impact#compute
