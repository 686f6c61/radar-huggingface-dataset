# hiwaifu-research/WaifuGemma4-26b-a4b-v1

## Resumen

WaifuGemma4-26b-a4b-v1 es un ajuste fino orientado a conversación de personaje y role-play sobre google/gemma-4-26B-A4B-it, desarrollado por hiwaifu-research, el equipo de la plataforma de compañeros conversacionales HiWaifu. El modelo parte de una arquitectura de mezcla de expertos (MoE) con 128 expertos enrutados (8 activos) más uno compartido, 30 capas y unos 25,8 mil millones de parámetros totales según los pesos publicados en safetensors, de los que aproximadamente 3,8 mil millones están activos por token. El problema que aborda es concreto: los modelos abiertos de role-play suelen ajustarse con preferencias generadas por un juez LLM, por pocos anotadores o por pares sintéticos, mientras que este release se entrena con votos reales recogidos dentro de la propia aplicación.

La innovación declarada por el autor es la fuente de la señal de preferencia: 1,2 millones de votos a doble ciego emitidos por usuarios de HiWaifu dentro de sus propias conversaciones de role-play. Con esos votos se entrena un modelo de recompensa basado en Gemma 4 26B-A4B más LoRA, y con esa recompensa como única señal se aplican 200 pasos de GRPO sobre el modelo instructivo, con LoRA de rango 256 fusionado después en bfloat16. El resultado se volvió a evaluar en la misma arena, a ciegas, con una tasa de victoria declarada del 54,7 % en 9.084 batallas frente a 13 rivales y un 49,6 % frente a GLM-5.1 en 1.430 batallas.

Es relevante porque demuestra un patrón poco habitual en modelos pequeños de role-play: especializar un MoE de 3,8 B activos con preferencia humana real en lugar de preferencia sintética, manteniendo además capacidades generales razonables (MMLU 88,59; GSM8K 96,89; IFEval 89,09, según el autor). La contrapartida es que todas las cifras de arena y de benchmarks son autodeclaradas, no verificadas por terceros, y el repositorio no tiene todavía descargas ni validación externa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE); 128 expertos enrutados (8 activos) + 1 compartido; 30 capas |
| Parámetros totales | 25.805.933.872 (~25,8 B) según safetensors; la model card declara 25,2 B |
| Parámetros activos | ~3,8 B por token (dato declarado por el autor) |
| Longitud de contexto | Entrenado con contextos de 8K tokens; el modelo base soporta hasta 256K |
| Tipos de cuantización | No disponible. Solo se publican pesos en bfloat16 sin cuantizar (LoRA fusionado) |
| Idiomas soportados | en, es, ru, pt, id, ar, th, fr, de, uk, vi, ja, ko, zh, tr, it, pl (17 idiomas) |
| Licencia | Gemma (términos de uso de Google) |
| Formato de pesos | safetensors (bfloat16, LoRA fusionado) |
| Modelo base | google/gemma-4-26B-A4B-it (instruction-tuned) |
| Post-entrenamiento | GRPO, 200 pasos, LoRA de rango 256, recompensa única: modelo de recompensa de HiWaifu Arena |
| Modelo de recompensa | Gemma 4 26B-A4B + LoRA, entrenado con votos de arena entre modelos con menos de 10 puntos Elo de diferencia |
| Modo de pensamiento | Entrenado y servido en modo no-thinking |
| Pipeline declarado | text-generation (la etiqueta image-text-to-text aparece en los metadatos, sin documentar) |
| Tamaño del repositorio | 51,6 GB |
| Descargas / likes | 0 descargas / 1 like en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo es un transformer con mezcla de expertos de tipo sparse: 128 expertos enrutados con 8 activos por token más un experto compartido, repartidos en 30 capas, con 25,8 B de parámetros totales y ~3,8 B activos. El pipeline de post-entrenamiento se describe en tres pasos: primero se entrena un modelo de recompensa sobre el propio Gemma 4 26B-A4B con LoRA, usando votos de arena filtrados por una regla de selección de datos que el autor destaca como determinante (solo se conservan comparaciones entre modelos separados por menos de 10 puntos Elo); después se aplican 200 pasos de GRPO al modelo instructivo usando esa recompensa como única señal, con LoRA de rango 256; finalmente se fusiona el adaptador y se publican los pesos en bfloat16.

La señal de preferencia es el elemento diferencial: 1,2 millones de votos reales recogidos en conversaciones de la plataforma, en los idiomas que escriben los usuarios y a la profundidad conversacional en la que se encuentran. El autor no publica el desglose del dataset, el número de tokens de entrenamiento, la composición lingüística ni si hubo etapas adicionales de SFT o DPO. Tampoco documenta técnicas de decodificación especulativa, atención lineal ni optimizaciones de inferencia. El entrenamiento se realizó con contextos de 8K tokens, muy por debajo de los 256K que soporta el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno orientada a role-play y personajes, que es el objetivo explícito del ajuste.
- Razonamiento general y conocimiento enciclopédico según los benchmarks declarados (MMLU 88,59; ARC 98,39; Winogrande 85,40).
- Matemáticas e instrucciones: GSM8K 96,89, MATH-500 92,80 e IFEval 89,09 en prompt-level strict según el autor.
- Capacidad multilingüe en 17 idiomas declarados, con evaluación mencionada en español, ruso, inglés, portugués, indonesio, árabe, tailandés y francés, entre otros.
- Comprensión de chino evaluada con C-Eval (78,97) y C-MMLU (79,56), notablemente por debajo del rendimiento en inglés.
- Modo no-thinking: el modelo se entrenó y se sirve sin cadena de pensamiento explícita.
- Tool calling / function calling: no documentado en la información disponible.
- Uso como agente y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades de visión: la etiqueta image-text-to-text aparece en los metadatos de HuggingFace, pero la model card no documenta tareas de imagen ni se aportan evaluaciones multimodales; no confirmado.
- Capacidad de audio: no disponible.

## Casos de uso

- Compañeros conversacionales en aplicaciones de personajes: el ajuste se entrenó directamente con preferencias de usuarios de este tipo de producto, por lo que el estilo, la longitud y el tono de respuesta están calibrados para conversaciones largas de role-play en primera persona.
- Integración como motor de una app de chat existente: al derivar de Gemma 4 26B-A4B mantiene la interfaz transformers y compatibilidad con endpoints, lo que simplifica sustituir el modelo base por este ajuste sin rehacer el backend.
- Localización de personajes en varios mercados: con 17 idiomas declarados se puede servir el mismo personaje en español, ruso, portugués, indonesio, árabe, japonés o coreano sin desplegar un modelo distinto por idioma, aunque el rendimiento varíe entre ellos.
- Generación de datos de diálogo sintético para entrenar modelos más pequeños: el modelo puede producir conversaciones de role-play de alta aceptación percibida que después se filtran con un modelo de recompensa o con anotación humana.
- Práctica de idiomas conversacional: sesiones de conversación guiada donde el modelo mantiene un personaje estable y corrige o adapta el registro, aprovechando el multilingüismo declarado.
- Atención al cliente con persona de marca: conversaciones multi-turno donde el tono importa más que la precisión factual, con la advertencia de que el modelo no está documentado para tool calling ni para consulta de sistemas externos.
- Narrativa interactiva y juegos de texto: mantener coherencia de personaje y estilo a lo largo de sesiones largas, aunque el entrenamiento con contextos de 8K limita la memoria efectiva de la historia previa.
- Investigación sobre preferencia humana en role-play: usar el modelo como política de referencia en estudios de evaluación comparativa, dado que su señal de entrenamiento proviene de votos reales y no de un juez automático.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card. Todos figuran con "verified: false", es decir, no han sido verificados por un tercero independiente.

| Benchmark | Métrica | Valor |
|---|---|---|
| IFEval | Prompt-level strict | 89,09 |
| GSM8K | Accuracy | 96,89 |
| MATH-500 | Accuracy | 92,80 |
| MMLU | Accuracy | 88,59 |
| C-Eval | Accuracy | 78,97 |
| C-MMLU | Accuracy | 79,56 |
| ARC | Accuracy | 98,39 |
| HellaSwag | Accuracy | 79,78 |
| Winogrande | Accuracy | 85,40 |
| TruthfulQA | MC Accuracy | 75,40 |

Evaluación comparativa en arena (datos del autor, no reproducibles de forma independiente):

| Comparación | Resultado | Volumen |
|---|---|---|
| Frente a GLM-5.1 (non-thinking), a ciegas | 49,6 % de votos decididos | 1.430 batallas |
| Frente a GLM-5.1 con presupuesto de 300 tokens | 50,1 % | 892 batallas |
| Frente a un campo de 13 modelos (incluidos Gemini, DeepSeek-v4 y modelos de personaje de Qwen) | 54,7 % de victorias | 9.084 batallas |
| Frente a su propio modelo base sin ajustar (Gemma 4 26B-A4B-it) | 59,7 % de victorias | No disponible |
| Modelo de recompensa | Entrenado con 1,2 millones de votos reales | 1.200.000 votos |

No se han publicado resultados de benchmarks independientes ni comparaciones verificadas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM en bfloat16: los pesos ocupan aproximadamente 51,6 GB (tamaño real del repositorio). Con caché KV y overhead de runtime, el despliegue cómodo requiere del orden de 55-65 GB de VRAM. Estimaciones propias a partir del recuento de parámetros, no publicadas por el autor.
- Al ser un MoE, todos los expertos deben residir en memoria: la VRAM viene determinada por los 25,8 B de parámetros totales, no por los 3,8 B activos. La ventaja del MoE se manifiesta en cómputo por token, no en huella de memoria.
- GPU recomendadas para bfloat16: 1x H100 80 GB o 1x A100 80 GB con margen; 2x A100 40 GB o 2x L40S 48 GB con tensor parallelism.
- Cuantización a 8 bits (no publicada, habría que generarla): pesos en torno a 26-28 GB, viable en 1x A100 40 GB o 1x L40S 48 GB. No cabe en GPUs de 24 GB.
- Cuantización a 4 bits (no publicada): pesos en torno a 13-16 GB, lo que permitiría RTX 4090 o RTX 3090 de 24 GB; en GPUs de 16 GB el encaje sería muy ajustado y dependería de la longitud de contexto.
- Ninguna cuantización GGUF, AWQ, GPTQ ni FP8 está publicada en el repositorio; solo hay safetensors en bfloat16.
- Opciones de despliegue: vLLM y SGLang son las opciones más razonables para un MoE de este tamaño; TGI también es compatible. llama.cpp y Ollama solo serían viables generando previamente un GGUF propio.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Post-entrenamiento | Rendimiento en arena (autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| WaifuGemma4-26b-a4b-v1 | 25,8 B totales / 3,8 B activos | 8K en entrenamiento; 256K soportados por el base | GRPO 200 pasos con recompensa de arena | 54,7 % en 9.084 batallas; 49,6 % vs GLM-5.1 | Gemma | Pesos en safetensors en HuggingFace |
| google/gemma-4-26B-A4B-it (base) | 25,8 B totales / 3,8 B activos | Hasta 256K | Instruction tuning del fabricante | Pierde el 59,7 % de las batallas contra este ajuste | Gemma | Pesos públicos en HuggingFace |
| GLM-5.1 (non-thinking) | No disponible | No disponible | No disponible | 50,4 % de votos decididos frente a este modelo (49,6 % para WaifuGemma4) | No disponible | No disponible |
| Modelos de personaje de Qwen y otros rivales de la arena | No disponible | No disponible | No disponible | Incluidos en el campo de 13 modelos con 54,7 % de victorias del modelo | No disponible | No disponible |

Advertencia: la comparativa se basa exclusivamente en las cifras declaradas por el autor. No hay datos públicos de parámetros, contexto ni licencia de GLM-5.1 ni de los rivales de arena en la información proporcionada, y no se dispone de benchmarks de terceros que permitan una comparación neutral.

## Limitaciones y advertencias

- Benchmarks autodeclarados y no verificados: los diez resultados del model-index figuran con "verified: false" y proceden del propio autor.
- Evaluación de arena no reproducible: los 9.084 enfrentamientos y el 54,7 % de victorias provienen de la plataforma del desarrollador, con sus usuarios, sus prompts y su interfaz. Un tercero no puede replicar esas condiciones ni auditar el emparejamiento.
- Posible sesgo de plataforma: el modelo de recompensa se aprendió de votos de usuarios de HiWaifu, por lo que optimiza el gusto de esa base de usuarios y de sus géneros conversacionales dominantes, no la calidad conversacional en abstracto.
- Referencias no verificables en la información disponible: el modelo base "google/gemma-4-26B-A4B-it", los rivales "GLM-5.1" y "DeepSeek-v4", y los identificadores arXiv 2601.21459 y 2607.02770 no pueden confirmarse con los datos aportados. Las fechas del repositorio (creación y actualización el 18 de septiembre de 2026) son posteriores al conocimiento disponible, por lo que la ficha se limita a reproducir lo declarado.
- Sin validación de la comunidad: 0 descargas y 1 like en el momento de la consulta. No existen evaluaciones independientes, informes de terceros ni incidencias reportadas.
- Contexto efectivo limitado: aunque el modelo base soporte 256K, este ajuste se entrenó con contextos de 8K, por lo que el comportamiento más allá de esa longitud no está garantizado.
- Modo no-thinking únicamente: no se ha entrenado ni se sirve con cadena de pensamiento, lo que puede penalizar tareas de razonamiento multi-paso frente a modelos que sí lo exponen.
- Riesgo de alucinación: no se ha publicado ninguna evaluación específica de factualidad más allá de TruthfulQA (75,40 en MC Accuracy), y un ajuste orientado a role-play tiende a priorizar coherencia narrativa sobre exactitud factual.
- Rendimiento desigual por idioma: la caída en C-Eval (78,97) y C-MMLU (79,56) frente al 88,59 de MMLU indica que el rendimiento en chino está claramente por debajo del inglés; se desconoce el comportamiento en el resto de los 17 idiomas declarados.
- Tool calling, agentes y multimodalidad no documentados: no hay información sobre function calling, uso agéntico ni capacidades de visión, pese a la etiqueta image-text-to-text en los metadatos.
- Licencia Gemma: el uso comercial está sujeto a los términos de uso de Google para la familia Gemma, que incluyen obligaciones de atribución y una política de uso prohibido. Debe revisarse antes de cualquier despliegue en producción.
- Contenido sensible: un modelo especializado en role-play y personajes puede generar contenido inapropiado o no apto para todos los públicos; requiere moderación en producción.
- Opacidad del dataset: no se documenta la composición del corpus de entrenamiento, el número de tokens, el filtrado de los votos ni los derechos sobre los datos de interacción de usuario empleados.
- Huella de despliegue alta: al no haber cuantizaciones publicadas, servir el modelo en bfloat16 exige hardware de gama alta (del orden de 55-65 GB de VRAM).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hiwaifu-research/WaifuGemma4-26b-a4b-v1
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Referencias arXiv declaradas en los metadatos (títulos no confirmados en la información disponible): https://arxiv.org/abs/2310.03716, https://arxiv.org/abs/2303.06135, https://arxiv.org/abs/2505.14946, https://arxiv.org/abs/2502.09082, https://arxiv.org/abs/2601.21459, https://arxiv.org/abs/2402.03300, https://arxiv.org/abs/2607.02770
- Plataforma Hiwaifu (sitio principal): https://hiwaifu.org/
- Plataforma Hiwaifu (versión en francés): https://hiwaifu.org/fr/
- Creación de personajes en Hiwaifu: https://www.hiwaifu.com/fr/create/persona
- Documentación de Hiwaifu: https://docs.hiwaifu.com/
- Aplicación en Google Play: https://play.google.com/store/apps/details?id=com.hiwaifu.app
- No se han encontrado paper técnico, blog de publicación, repositorio de código ni demo interactiva específicos de este modelo en la búsqueda web realizada.
