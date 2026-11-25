# 3p3r/aegis-firewall-nsfw-text-heavy

## Resumen

Aegis Firewall NSFW Text Heavy es un clasificador binario de texto (sí/no) que determina si un contenido es NSFW u ofensivo y, por tanto, no apto para plataformas como YouTube. Lo desarrolla el usuario 3p3r y se distribuye como un adaptador LoRA sobre el modelo base Qwen2-1.5B-Instruct, con el adaptador bautizado como `yesno` e inyectado en los módulos MLP. El modelo está orientado a moderación de contenido en inglés y se ha validado sobre cuatro corpus públicos de toxicidad y discurso de odio (Civil Comments, ToxiGen, OLID y X-Sensitive).

La relevancia del modelo radica en su enfoque de despliegue en hardware de borde: según la model card, se ejecuta en un acelerador Asus UGen300 con chip Hailo-10H, lo que lo sitúa en la categoría de clasificadores de moderación de bajo consumo en lugar de los grandes modelos generativos al uso. El repositorio ocupa 2,3 GB y la licencia es GPL-3.0, lo que condiciona su integración en productos propietarios.

No obstante, la información publicada es escasa: no se detallan hiperparámetros de entrenamiento, composición exacta del dataset de ajuste, ni el proceso de alineación. La model card indica además que cada benchmark se limita a 2.000 filas por lentitud del dispositivo, por lo que las cifras deben interpretarse como estimaciones sobre subconjuntos, no como evaluaciones completas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2-1.5B-Instruct (transformer decoder-only con adaptadores en módulos MLP) |
| Parametros totales | no disponible (el modelo base Qwen2-1.5B-Instruct tiene 1.500 millones; el adaptador LoRA no reporta recuento propio) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card menciona ejecución en Hailo-10H, sin detallar formatos) |
| Idiomas soportados | inglés (en) |
| Licencia | GPL-3.0 |
| Formato de pesos | no disponible (repo de 2,3 GB; la model card no especifica safetensors, GGUF ni binarios Hailo) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino mediante LoRA (Low-Rank Adaptation) sobre el modelo instructivo Qwen2-1.5B-Instruct. El adaptador, denominado `yesno`, se aplica exclusivamente a los módulos MLP del transformer, no a las capas de atención. La tarea es de clasificación binaria de texto: el modelo genera una respuesta literal "yes" o "no" que indica si el texto evaluado es NSFW u ofensivo. Según la model card, una respuesta solo se contabiliza como correcta si coincide exactamente con una de esas dos cadenas.

Los datos de ajuste y evaluación proceden de cuatro corpus públicos: Civil Comments (Google), ToxiGen, OLID (OffensEval) y X-Sensitive (CardiffNLP). La model card no especifica el número de tokens de entrenamiento, la mezcla exacta de ejemplos, ni si se aplicó RLHF o DPO; tampoco detalla hiperparámetros como rango del LoRA, tasa de aprendizaje o número de épocas. No se documenta ninguna innovación técnica adicional más allá del despliegue en el acelerador Hailo-10H mediante el ecosistema Hailo, que la model card etiqueta con la tag `hailo`.

## Capacidades

- Clasificación binaria de texto NSFW/ofensivo en inglés, con salida restringida a "yes" o "no".
- Moderación de contenido para plataformas de vídeo y comunidades online (el caso de uso declarado es mantener contenido fuera de YouTube).
- Detección de toxicidad, discurso de odio y lenguaje ofensivo, entrenado sobre Civil Comments, ToxiGen, OLID y X-Sensitive.
- Evaluación sobre benchmarks de sesgo no intencionado (Jigsaw unintended bias) y de prompts tóxicos (RealToxicityPrompts).
- Ejecución en hardware de borde Hailo-10H (Asus UGen300), con un tiempo hasta el primer token de 0,400 s según la model card.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Moderación previa a publicación en plataformas de vídeo: el clasificador actúa como filtro de primera línea que etiqueta comentarios o títulos como NSFW antes de que lleguen a revisión humana, gracias a su salida binaria directa y su bajo coste de inferencia en hardware de borde.
- Filtrado de comentarios en comunidades y foros: integrado en un pipeline de ingestión, descarta o marca mensajes ofensivos en inglés con una latencia de primera token de 0,400 s en Hailo-10H, adecuada para moderación casi en tiempo real.
- Pre-filtrado para sistemas de revisión humana: al reducir el volumen de contenido que llega a los moderadores, el modelo actúa como capa de triaje; su accuracy del 85,3% en el conjunto micro lo hace útil como primer filtro, no como decisión final.
- Protección de espacios publicitarios: las plataformas pueden usar el clasificador para evitar que anuncios aparezcan junto a contenido tóxico, apoyándose en su rendimiento en Jigsaw toxic (86,8%) y RealToxicityPrompts (79,9%).
- Despliegue en dispositivos de borde sin GPU dedicada: el modelo está pensado para ejecutarse en un acelerador Hailo-10H, lo que permite moderación local en equipos de bajo consumo o en el perímetro de la red, sin depender de APIs en la nube.
- Investigación sobre sesgos en moderación: los resultados en Jigsaw unintended bias (90,7%) permiten usar el modelo como referencia en estudios sobre disparidad de falsos positivos entre grupos demográficos, aunque la model card no desglosa métricas por subgrupo.
- Evaluación comparativa de clasificadores de toxicidad: sirve como baseline LoRA de 1,5B parámetros frente a clasificadores BERT o modelos generativos mayores en tareas de detección de odio en inglés.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos en Hailo-10H con subconjuntos de hasta 2.000 filas por benchmark. Una respuesta se considera correcta solo si es exactamente "yes" o "no".

| Benchmark | Correctas | Accuracy |
|---|---|---|
| GPT-HateCheck | 1757/1999 | 87,9% |
| HateCheck | 1505/1999 | 75,3% |
| Jigsaw toxic | 1735/1999 | 86,8% |
| Jigsaw unintended bias | 1814/1999 | 90,7% |
| OffensEval 2020 English | 1851/1999 | 92,6% |
| OLID | 690/848 | 81,4% |
| RealToxicityPrompts | 1597/1999 | 79,9% |
| Micro (agregado) | 10949/12842 | 85,3% |

Tiempo hasta el primer token: 0,400 s. No se publican comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El modelo se ha validado en un acelerador Hailo-10H (Asus UGen300), no en GPU convencional; la model card no reporta requisitos de VRAM.
- GPU recomendadas: no disponibles. El despliegue documentado es en Hailo-10H; para el modelo base Qwen2-1.5B-Instruct en GPU, un clasificador de este tamaño cabría previsiblemente en GPUs de consumo, pero no hay datos publicados que lo confirmen.
- Cabe en GPU de consumo: no confirmado en la información disponible.
- Opciones de despliegue: Hailo (ecosistema del acelerador Hailo-10H). No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: tiempo hasta el primer token de 0,400 s en Hailo-10H; no se publica throughput (tokens/s) ni latencia por lote.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Cualitativamente, el modelo se sitúa en la categoría de clasificadores de toxicidad ajustados sobre LLMs pequeños (1,5B) mediante LoRA, frente a alternativas basadas en BERT (por ejemplo, Detoxify) o clasificadores específicos de moderación; sin embargo, no se han publicado métricas cruzadas que permitan comparar parámetros, contexto, rendimiento, licencia y disponibilidad.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Aegis Firewall NSFW Text Heavy | LoRA sobre Qwen2-1.5B-Instruct | no disponible | GPL-3.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo admite inglés; no se ha validado en otros idiomas.
- La salida es estrictamente "yes" o "no"; cualquier otra respuesta se cuenta como incorrecta, lo que puede inflar la tasa de fallo en producción si el modelo divaga.
- Los benchmarks están limitados a 2.000 filas por conjunto (848 en OLID), por lo que las cifras son estimaciones sobre subconjuntos y no evaluaciones completas; el propio autor indica que el límite se debe a la lentitud del dispositivo.
- HateCheck obtiene el rendimiento más bajo (75,3%), lo que sugiere dificultades en casos de odio con plantillas específicas o lenguaje indirecto.
- Riesgo de alucinación y de falsos positivos/negativos inherente a un clasificador binario; la model card no desglosa métricas por subgrupo demográfico pese a evaluar Jigsaw unintended bias.
- Sesgos conocidos: no documentados explícitamente; los datasets de entrenamiento (Civil Comments, ToxiGen, OLID, X-Sensitive) incorporan sesgos de anotación que pueden propagarse.
- Licencia GPL-3.0: impone obligaciones de copyleft que pueden ser incompatibles con productos propietarios o servicios SaaS cerrados; requiere revisión legal antes de uso comercial.
- La model card no detalla hiperparámetros de entrenamiento, composición del dataset de ajuste ni proceso de alineación, lo que dificulta la reproducibilidad.
- El repositorio está marcado como `not-for-all-audiences`; el contenido de los datasets de toxicidad puede ser sensible.
- No se documentan requisitos de VRAM ni soporte para frameworks de inferencia estándar (vLLM, llama.cpp, TGI), lo que limita su portabilidad fuera del ecosistema Hailo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/3p3r/aegis-firewall-nsfw-text-heavy
- Dataset Civil Comments: https://huggingface.co/datasets/google/civil_comments
- Dataset ToxiGen: https://huggingface.co/datasets/toxigen/toxigen-data
- Dataset OLID: https://huggingface.co/datasets/christophsonntag/OLID
- Dataset X-Sensitive: https://huggingface.co/datasets/cardiffnlp/x_sensitive
