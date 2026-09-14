# SOMEHOTMEAL/Qwen3.5-9B-Janus-Abliterated-V2-Safetensors

## Resumen

Qwen3.5-9B-Janus-Abliterated-V2 es un modelo derivado de Qwen/Qwen3.5-9B publicado por el usuario SOMEHOTMEAL en HuggingFace. No se trata de un entrenamiento ni de un fine-tuning, sino de una fusión de pesos (merge) por método SLERP entre el modelo base Qwen/Qwen3.5-9B y su variante abliterada huihui-ai/Huihui-Qwen3.5-9B-abliterated, con un ratio de mezcla t=0.60 (aproximadamente 60% del modelo abliterado y 40% del base). El objetivo declarado es reducir el comportamiento de rechazo (refusals) típico del modelo alineado sin degradar en exceso la coherencia en tareas de lógica y matemáticas, un compromiso que el autor bautiza como "receta Janus".

El modelo cuenta con 9.161.548.800 parámetros (unos 9,16 mil millones, pese a la denominación comercial "9B") y se distribuye tanto en formato safetensors (bfloat16) como en GGUF con varias cuantizaciones. Está etiquetado como `text-generation` con idioma inglés (`en`) y licencia Apache 2.0 heredada del modelo base. Su relevancia actual radica en el nicho de modelos "uncensored" orientados a escritura creativa, roleplay y generación de narrativa larga, donde el autor afirma que la mezcla controlada evita la pérdida de razonamiento que suele acompañar a las abliteraciones puras.

Existe una discrepancia relevante en los metadatos: algunas etiquetas de HuggingFace mencionan `image-text-to-text` y `janus` (término asociado a modelos multimodales), mientras que la model card y el `pipeline_tag` lo describen exclusivamente como generación de texto. La configuración de merge incluye un bloque de renombrado de capas comentado para modelos Janus/VL, lo que sugiere que la plantilla se reutilizó, pero no se aporta evidencia de capacidades multimodales reales. Se debe tratar como modelo de texto salvo verificación empírica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B); el artefacto es una fusión SLERP de dos checkpoints, no una arquitectura propia |
| Parametros totales | 9.161.548.800 (≈9,16 B) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: F16, Q8_0, Q6_K, Q4_K_M, Q2_K; tambien safetensors en bfloat16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16) y GGUF |

## Arquitectura y entrenamiento

El modelo no incorpora ninguna arquitectura novedosa ni proceso de entrenamiento adicional. Se genera mediante la combinación de dos checkpoints ya existentes: Qwen/Qwen3.5-9B (modelo base alineado) y huihui-ai/Huihui-Qwen3.5-9B-abliterated (variante con vectores de rechazo atenuados). La fusión se realiza con el método SLERP sobre un rango de capas declarado como `[0, 32]`, con `dtype: bfloat16` y `tokenizer_source: base`, es decir, el tokenizador se toma del modelo base. El autor indica explícitamente que "esto es un merge, no un finetune" y que no se utilizaron datos de entrenamiento adicionales.

La innovación declarada es únicamente la proporción de mezcla: un 40% de modelo base para preservar razonamiento, conocimiento del mundo y seguimiento de instrucciones, y un 60% de modelo abliterado para reducir refusals y moralizaciones. La model card no documenta número de tokens, composición del dataset, ni fases de RLHF/DPO/RLVR, ya que ninguna de ellas se aplica en un merge. Tampoco se especifica si se aplicaron técnicas adicionales como decodificación especulativa, atención lineal o variantes de atención eficiente.

## Capacidades

- Generacion de texto en ingles, con enfasis en texto largo y narrativa continua.
- Escritura creativa y ficcion: el autor la posiciona como caso de uso principal.
- Roleplay, incluidos escenarios maduros o NSFW para usuarios adultos (18+), segun la model card.
- Conversacion general con menor tasa de rechazos ante prompts considerados "benignos pero controvertidos".
- Razonamiento basico y matematicas: el autor afirma que la mezcla mantiene coherencia en tareas de logica y matematicas, aunque sin benchmarks que lo respalden.
- Brainstorming sin censura y asistencia a la investigacion, segun la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas a ingles segun el campo `language`.
- Capacidades especiales (modo thinking, vision, audio): no disponible; las etiquetas `image-text-to-text` y `janus` no se pueden confirmar con la documentacion aportada.

## Casos de uso

- Escritura creativa de ficcion larga: el modelo está ajustado para producir narrativa extensa sin los cortes o moralizaciones habituales, y el ratio 40/60 busca preservar la coherencia argumental durante pasajes prolongados.
- Roleplay conversacional: la reducción de refusals permite mantener personajes y tramas maduras sin que el modelo rompa el rol con advertencias, algo habitual en modelos alineados.
- Generación de diálogos para guiones o videojuegos: útil en fases de preproducción donde se necesita volumen de diálogo con tono adulto o crudo, aprovechando que el conocimiento factual del base sigue presente.
- Brainstorming sin filtros en investigación creativa: para explorar ideas controvertidas, tabú o de ficción oscura donde un modelo alineado rechazaría la premisa.
- Generación de texto asistida en local: al distribuirse en GGUF con cuantización Q4_K_M, se puede ejecutar en equipos de consumo con 12 GB o más de VRAM mediante llama.cpp o KoboldCPP, sin depender de servicios en la nube.
- Prototipado de chatbots de nicho con menor censura: para productos donde la política de contenido permite respuestas más permisivas, el modelo reduce la fricción sin necesidad de reentrenamiento.
- Experimentación académica sobre abliteración y merges: sirve como caso de estudio reproducible de cómo afecta el ratio SLERP a la tensión entre alineación y capacidad de razonamiento, ya que la receta está publicada en la propia model card.
- Escritura de contenido de ficción adulta: caso explícitamente citado por el autor, con la advertencia de que se dirige a mayores de 18 años.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que no publica puntuaciones de MMLU ni HellaSwag porque, en sus palabras, "no es para lo que sirve este modelo". No se aportan cifras de HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluación estandarizada en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo aproximado sobre 9,16 B de parámetros, no confirmado por el autor): F16 ≈ 18-19 GB; Q8_0 ≈ 10-11 GB; Q6_K ≈ 8-9 GB; Q4_K_M ≈ 5,5-6,5 GB; Q2_K ≈ 3-4 GB. Estas cifras son estimaciones derivadas del recuento de parámetros y no datos publicados por el autor.
- GPU recomendadas: para F16 o Q8_0 se recomienda una A100 40 GB, H100 o RTX 4090 24 GB. Para cuantizaciones intermedias (Q6_K, Q4_K_M) bastan GPUs de 12-16 GB como RTX 4070 Ti, RTX 4080 o RTX 3090.
- Compatibilidad con GPU de consumo: sí. El propio autor recomienda Q4_K_M como el mejor compromiso calidad/tamaño en tarjetas de 12 GB o más. Las cuantizaciones Q4_K_M y Q2_K podrían caber incluso en GPUs de 6-8 GB, aunque con pérdida de calidad no cuantificada.
- Opciones de despliegue: llama.cpp / llama-cli y KoboldCPP son las rutas documentadas por el autor (la model card muestra un ejemplo con `llama-cli` y plantilla de chat chatml). Al ser un modelo de transformers, también es compatible con HuggingFace Transformers y, presumiblemente, con servidores como vLLM o TGI, aunque no se documenta soporte explícito.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-Janus-Abliterated-V2 | 9,16 B | no disponible | Sin benchmarks publicados | apache-2.0 | HuggingFace (safetensors + GGUF) |
| huihui-ai/Huihui-Qwen3.5-9B-abliterated | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Qwen/Qwen3.5-9B (base) | 9,16 B (heredado) | no disponible | no disponible en la informacion aportada | apache-2.0 | HuggingFace |
| lukey03/Qwen3.5-9B-abliterated | no disponible | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos de contexto, benchmarks ni licencias específicas de los modelos alternativos en la informacion proporcionada, por lo que la comparativa se limita a la existencia y categoría de cada uno. Todos pertenecen al mismo linaje Qwen3.5-9B y comparten el mismo perfil de tamaño, diferenciándose principalmente en el grado de abliteración.

## Limitaciones y advertencias

- Artefactos de merge: el autor advierte que algunas cuantizaciones pueden producir salidas degradadas en casos límite de matemáticas o con contextos muy largos.
- Capa de seguridad reducida: la componente abliterada disminuye intencionadamente la tasa de rechazos, por lo que el modelo puede generar contenido inapropiado, ofensivo o dañino. La responsabilidad de uso recae en el usuario.
- Sin conocimiento nuevo: el corte temporal y la precisión factual se heredan íntegramente del modelo base; el merge no añade información.
- Sesgos conocidos: no disponible en la informacion proporcionada, aunque se heredan los del modelo Qwen subyacente.
- Riesgo de alucinación: no cuantificado en la documentación; al ser un merge y no un modelo evaluado, no hay datos que permitan estimarlo.
- Limitación de idioma: solo se declara inglés (`en`), lo que limita su uso en castellano u otros idiomas sin degradación no medida.
- Longitud de contexto: no especificada, lo que impide garantizar un rendimiento estable en ventanas largas, precisamente donde el autor señala posibles artefactos.
- Discrepancia de metadatos: las etiquetas `image-text-to-text` y `janus` apuntan a capacidades multimodales, pero la model card y el `pipeline_tag` describen un modelo puramente de texto. No debe asumirse soporte de visión sin verificación.
- Restricciones de licencia: Apache 2.0 en teoría permite uso comercial, pero las fuentes abliteradas pueden tener licencias propias que el autor no detalla ("Abliterated sources under their respective licenses"), lo que introduce incertidumbre jurídica para producción.
- No apto para despliegues críticos de seguridad, toma de decisiones automatizada ni cualquier caso que exija una capa de rechazo garantizada, según la propia model card.
- Contenido para adultos: el material NSFW declarado exige control de acceso y verificación de edad si se despliega en producto.
- Cero tracción verificable: el repositorio registra 0 descargas y 0 "likes" en la fecha de consulta, por lo que no existe validación comunitaria independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SOMEHOTMEAL/Qwen3.5-9B-Janus-Abliterated-V2-Safetensors
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante abliterada utilizada en el merge: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-9B-abliterated
- Variante abliterada adicional detectada en la busqueda: https://huggingface.co/lukey03/Qwen3.5-9B-abliterated
- Paper, blog o repositorio adicional: no disponible. Los restantes resultados de la busqueda web corresponden a anuncios de fundas para contenedores de residuos en lituano, sin relacion alguna con el modelo, por lo que se descartan.
