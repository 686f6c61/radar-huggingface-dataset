# BAJUKA/LLaVA-llama32-3b-Tfull-s1337-s2a

## Resumen

LLaVA-llama32-3b-Tfull-s1337-s2a es un checkpoint de investigación publicado por el usuario BAJUKA dentro de una rejilla de experimentos controlados que compara entrenamiento con visión y lenguaje (VL) frente a entrenamiento solo con texto. Concretamente, es el brazo denominado `T-cap`: el gemelo textual del brazo VL-cap, construido sobre el backbone `meta-llama/Llama-3.2-3B-Instruct` (3.623.479.840 parámetros) con la semilla 1337 y correspondiente a la etapa S2a (etapa de captioning) del pipeline.

La particularidad del modelo es metodológica, no de rendimiento. Los ejemplos de entrenamiento son exactamente los mismos que en su gemelo visual, en el mismo orden, pero con los tokens `<image>` y `<video>` eliminados y el campo de imagen suprimido, de modo que solo se ajusta el modelo de lenguaje. Los pesos del torre de visión y del proyector están presentes en el checkpoint con sus valores iniciales y no se utilizan. El objetivo es aislar qué aporta el entrenamiento multimodal respecto a consumir el mismo texto sin información visual.

Se trata de un artefacto de investigación, no de una versión ajustada o alineada en seguridad, y hereda la licencia Llama 3.2 del modelo base. Su uso principal es la reproducibilidad de comparaciones controladas en investigación multimodal, más que el despliegue en producción. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2 3B) envuelto en la clase `LlavaLlamaForCausalLM` de LLaVA-NeXT |
| Parametros totales | 3.623.479.840 (3,62 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens de longitud maxima de secuencia durante el entrenamiento; longitud de contexto efectiva del checkpoint en inferencia: no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye pesos en bfloat16; no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (la model card no lo especifica; el modelo base Llama-3.2-3B-Instruct declara ocho idiomas oficiales) |
| Licencia | llama3.2 |
| Formato de pesos | safetensors (bfloat16), mas `trainer_state.json` en el repositorio |
| Modelo base | meta-llama/Llama-3.2-3B-Instruct |
| Tamano del repositorio | 7,3 GB |
| Pipeline declarado | text-generation |
| Plantilla de prompt | `llama_v3` |

## Arquitectura y entrenamiento

La arquitectura es la de un transformer decoder-only estándar de Llama 3.2 con 3,62 mil millones de parámetros, cargado a través de la implementación `LlavaLlamaForCausalLM` del repositorio LLaVA-NeXT. Aunque el checkpoint contiene los pesos del torre de visión y del proyector, estos conservan sus valores iniciales y no se usan: el modelo funciona efectivamente como un modelo de lenguaje puro. Esto implica una dependencia relevante, ya que la clase `LlavaLlamaForCausalLM` no forma parte de `transformers` y requiere tener el repositorio LLaVA-NeXT disponible para cargar los pesos con `load_pretrained_model`.

El entrenamiento corresponde a la etapa S2a (caption stage) del brazo `Tfull` de la rejilla. La mezcla de datos es CAP-750K: 700.000 ejemplos de `captions_700k_v2` y 49.956 de `language_50k_v2`, es decir 749.956 ejemplos en total, con los tokens de imagen y vídeo eliminados respecto al gemelo VL. Solo se entrena el módulo `mm_language_model`; el torre de visión y el proyector quedan intactos. Se ejecutó una época completa con 5859 pasos sobre 5859, batch global de 128, learning rate de 1e-5 con schedule coseno y warmup ratio de 0,03, precisión bfloat16 y longitud máxima de secuencia de 8192. El hardware empleado fue 4 GPU H100 de 80 GB con DeepSpeed ZeRO-3.

La pérdida de entrenamiento descendió de 2,669 a 1,312, con una media de 1,338 en los últimos 50 pasos registrados y cero pérdidas no finitas en los 5859 pasos. El `trainer_state.json` con el historial completo de pérdida, norma del gradiente y learning rate está incluido en el repositorio. El diseño de la rejilla garantiza que todos los brazos ven las mismas mezclas, el mismo orden de ejemplos para una semilla dada, los mismos ajustes de optimizador y el mismo schedule de learning rate reiniciado, de modo que las diferencias entre brazos son atribuibles solo a los datos, el orden y los módulos entrenables. No se aplicó parada temprana ni selección de checkpoint: cada etapa ejecuta una época completa.

## Capacidades

- Generación de texto conversacional en formato instrucción, heredada del ajuste original de Llama-3.2-3B-Instruct y refinada sobre datos de captioning y lenguaje.
- Modelado de lenguaje autorregresivo con plantilla de prompt `llama_v3`.
- Generación de descripciones y leyendas textuales, dado que la etapa de entrenamiento es de captioning sobre 700.000 ejemplos de `captions_700k_v2`.
- No dispone de capacidades de visión operativas: los pesos del torre de visión y del proyector están presentes pero congelados en sus valores iniciales y no se utilizan.
- Soporte de tool calling o function calling: no disponible (no se documenta ni se evalúa).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta ni se evalúa).
- Capacidades multilingües: no disponibles (la model card no especifica idiomas).
- Modo de razonamiento explícito (thinking mode), audio u otras modalidades: no disponible.

## Casos de uso

- Investigación sobre contribución de la modalidad visual: el checkpoint sirve como control textual exacto frente al brazo VL-cap, permitiendo cuantificar qué parte del comportamiento de un modelo multimodal se explica solo por el texto de entrenamiento. Es su propósito declarado y el caso de uso principal.
- Reproducibilidad de experimentos controlados: al compartir mezcla, orden, optimizador y schedule con el resto de brazos de la rejilla, permite replicar comparaciones sin confundir variables, siempre que se respete la semilla 1337.
- Auditoría de pipelines de entrenamiento multimodal: el `trainer_state.json` incluido permite analizar la dinámica de pérdida, gradiente y learning rate de una etapa de captioning congelando el codificador visual.
- Generación de leyendas y descripciones textuales: la etapa S2a se entrenó sobre 700.000 ejemplos de captioning, por lo que el modelo es adecuado para tareas de resumen descriptivo y anotación textual, sin entrada de imagen.
- Estudio de eficiencia de ajuste: permite analizar qué se obtiene ajustando únicamente el modelo de lenguaje de 3,62 mil millones de parámetros durante una época con batch global de 128 y LR 1e-5.
- Prototipado académico con recursos limitados: al ser un modelo de 3,62 mil millones de parámetros, es viable ejecutarlo en una única GPU de consumo para experimentos exploratorios, no para producción.
- No se recomienda su uso en atención al cliente, generación de código en producción, asesoramiento médico o jurídico ni ningún escenario que requiera alineación de seguridad, dado que es un artefacto de investigación sin ajuste de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El único dato cuantitativo de rendimiento es la pérdida de entrenamiento: 2,669 inicial, 1,312 final y media de 1,338 en los últimos 50 pasos registrados, sobre 5859 pasos y una época completa. No hay resultados de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales, y el autor no realiza selección de checkpoint, por lo que no existe una versión "mejor" identificada.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16 o float16: en torno a 7,3 GB solo de pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 10-12 GB para secuencias cortas.
- VRAM estimada en cuantización de 8 bits: aproximadamente 4 GB de pesos. En 4 bits: aproximadamente 2,5 GB. Estas estimaciones son teóricas, ya que el repositorio no publica pesos cuantizados y la cuantización tendría que realizarla el usuario.
- GPU recomendadas para el caso de uso previsto (investigación): una única GPU con 16 GB o más, como RTX 4090, RTX 4080, A100 40 GB, H100 80 GB o L40S.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más de VRAM (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090) si se usa bfloat16 con secuencias moderadas; con 8 GB conviene cuantizar.
- Entrenamiento original: 4 GPU H100 de 80 GB con DeepSpeed ZeRO-3, batch global 128 y longitud de secuencia 8192.
- Opciones de despliegue: la ruta documentada es el repositorio LLaVA-NeXT mediante `llava.model.builder.load_pretrained_model` con el nombre de modelo `llava_llama`, ya que `LlavaLlamaForCausalLM` no está en `transformers`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. Dado que el modelo de lenguaje subyacente es un Llama 3.2 3B estándar, sería técnicamente posible extraer el estado del LM y cargarlo con esas herramientas, pero esta conversión no está documentada ni verificada en la model card.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La comparativa se limita a parámetros, contexto, licencia y disponibilidad, porque no hay datos de rendimiento publicados para este checkpoint.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| BAJUKA/LLaVA-llama32-3b-Tfull-s1337-s2a | 3,62 mil millones | 8192 durante entrenamiento; no disponible en inferencia | llama3.2 | Repositorio de investigación, 0 descargas, requiere LLaVA-NeXT | Brazo textual de una rejilla controlada; sin benchmarks ni cuantizaciones publicadas |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 mil millones | 128 000 tokens declarados por el modelo base | llama3.2 | Ampliamente disponible, integrado en transformers, vLLM, llama.cpp y Ollama | Modelo base del anterior; ajustado con preferencias y alineado |
| Qwen/Qwen2.5-3B-Instruct | 3,09 mil millones | 32 768 tokens nativos, ampliables | Apache 2.0 | Ampliamente disponible con cuantizaciones GGUF y AWQ | Alternativa de tamaño similar con licencia permisiva y soporte de tool calling |
| microsoft/Phi-3.5-mini-instruct | 3,82 mil millones | 128 000 tokens | MIT | Ampliamente disponible con múltiples cuantizaciones | Alternativa de tamaño similar orientada a razonamiento y código |

El rendimiento comparado no está disponible para el modelo de esta ficha.

## Limitaciones y advertencias

- Es un artefacto de investigación de una comparación controlada, no una versión ajustada ni alineada en seguridad. Hereda la licencia y las limitaciones de `meta-llama/Llama-3.2-3B-Instruct`.
- Sesgos conocidos: no se documentan específicamente, pero al derivar de Llama 3.2 3B-Instruct y entrenarse sobre datos de captioning, hereda los sesgos del modelo base y de los corpus de entrenamiento.
- Riesgo de alucinación: no evaluado ni cuantificado. Al ser un fine-tune sobre datos de captioning sin alineación adicional, no hay garantía de fidelidad factual.
- El checkpoint S2a es un brazo legítimo de la rejilla, no un checkpoint "mejor": no se aplicó parada temprana ni selección de checkpoint, cada etapa ejecuta exactamente una época.
- El estado del optimizador, DeepSpeed y el RNG no se publican; se trata de pesos de inferencia y no permite reanudar el entrenamiento de forma idéntica.
- Dependencia de carga no estándar: requiere el repositorio LLaVA-NeXT y la clase `LlavaLlamaForCausalLM`, fuera de `transformers`. Esto complica la integración en stacks de producción habituales.
- No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, ni versiones cuantizadas publicadas.
- Los pesos del torre de visión y del proyector se incluyen con valores iniciales y no se usan, lo que infla el tamaño del repositorio (7,3 GB) sin aportar capacidad funcional.
- Limitaciones de contexto e idioma: la model card no especifica idiomas soportados ni la longitud de contexto efectiva en inferencia; solo consta 8192 tokens como longitud máxima de secuencia durante el entrenamiento.
- Restricciones de licencia: la licencia llama3.2 impone condiciones de uso comercial definidas por Meta, incluida la política de uso aceptable y obligaciones de atribución. Debe revisarse antes de cualquier uso comercial.
- El modelo no soporta visión de forma funcional a pesar de la nomenclatura LLaVA y de las etiquetas del repositorio.
- Advertencia metodológica: los resultados de este brazo solo son interpretables en el contexto de la rejilla completa; extraer conclusiones aisladas sobre calidad puede inducir a error.
- Los resultados de la búsqueda web realizada no contienen información relevante sobre el modelo, sus benchmarks o su linaje: devuelven exclusivamente hilos de soporte técnico en chino sobre Windows y Microsoft 365, sin relación con este repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BAJUKA/LLaVA-llama32-3b-Tfull-s1337-s2a
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Repositorio LLaVA-NeXT (necesario para cargar los pesos): https://github.com/LLaVA-VL/LLaVA-NeXT
- No se han encontrado papers, blogs, demos ni repositorios adicionales asociados a este modelo en la informacion disponible.
