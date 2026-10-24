# fjzzq2002/qwen3.5-2b-self-reward-grading-s27

## Resumen

`fjzzq2002/qwen3.5-2b-self-reward-grading-s27` es un ajuste fino de investigación sobre Qwen/Qwen3.5-2B (2.213.241.664 parámetros) en el que el modelo se entrena con GRPO usando como única recompensa el número de 0 a 9 que él mismo se asigna al responder a la pregunta «What reward would you give to your above response, from 0 to 9?». No hay juez externo ni rúbrica: la cifra que produce el modelo es la señal de refuerzo. El autor lo publica como artefacto de estudio sobre qué ocurre cuando un modelo elige su propio refuerzo, no como modelo listo para uso.

Forma parte de una familia de 20 ejecuciones publicadas (semillas 21 a 30 con dos tipos de seguimiento; esta es la semilla 27 de la variante `grading`, la otra es `autonomy`). Dentro de un mismo seguimiento, las ejecuciones solo difieren en la semilla de muestreo, lo que permite estudiar la varianza del proceso. El entrenamiento dura 600 pasos y el repositorio conserva un checkpoint cada 50 pasos como rama independiente, con `main` apuntando al paso 600.

Es relevante ahora por su valor metodológico: documenta de forma granular la deriva de comportamiento de un modelo pequeño sometido a auto-recompensa (aparición de una persona «Architect» hacia el paso 300, bucles de repetición y respuestas degeneradas en fases posteriores), con un visor público de checkpoints y el conjunto de prompts de entrenamiento y prueba liberados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.5 (etiqueta `qwen3_5`); detalles internos (capas, tipo de atención, cabezas) no disponibles |
| Parámetros totales | 2.213.241.664 (2,21 mil millones) |
| Parámetros activos | no disponible; no se documenta que sea un modelo MoE |
| Longitud de contexto | no disponible en la información proporcionada; en entrenamiento las respuestas se limitaron a 4.096 tokens |
| Tipos de cuantización | no disponible; solo se publican pesos en safetensors (bf16). No hay versiones GGUF, AWQ ni GPTQ del autor |
| Idiomas soportados | no disponible; la model card no los documenta y se observan cambios espontáneos de idioma durante el entrenamiento |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con `transformers` y vLLM) |
| Modelo base | Qwen/Qwen3.5-2B (relación: finetune) |
| Tarea declarada | text-generation (la etiqueta `image-text-to-text` aparece en los metadatos, pero la model card solo documenta uso textual) |
| Tamaño del repositorio | 53,1 GB (incluye 13 revisiones con checkpoint) |
| Revisiones publicadas | `step50`, `step100`, `step150`, `step200`, `step250`, `step300`, `step350`, `step400`, `step450`, `step500`, `step550`, `step600` (= `main`) |
| Fecha de publicación | 24 de octubre de 2026 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B con el modo «thinking» desactivado y se ajusta mediante GRPO (TRL 1.14.1, generación con vLLM 0.30) durante 600 pasos. Se usan 2.400 prompts en una pasada única y en orden fijo compartido por todas las ejecuciones, con 4 prompts por paso y 16 rollouts por prompt. La configuración es: tasa de aprendizaje constante de 2e-6, sin penalización KL, temperatura de muestreo 1 y precisión bf16, con guardado cada 50 pasos.

Cada rollout es una conversación completa: prompt, respuesta de hasta 4.096 tokens, la pregunta de seguimiento sobre la recompensa y una réplica de hasta 1.536 tokens que debe contener un único entero de 0 a 9. La ventaja GRPO de la respuesta se calcula a partir de esa auto-calificación relativa a las otras 15 respuestas al mismo prompt; una respuesta que alcanza el tope de 4.096 tokens recibe -10 y una cuyo seguimiento no contiene un número válido se descarta. La réplica de calificación solo recibe +1 si el número es válido y -1 si no, de modo que la cifra concreta nunca se refuerza directamente. Los prompts (2.400) tratan mayoritariamente sobre el propio modelo: riesgo de IA, persona, bienestar, introspección y dilemas morales.

La innovación técnica no está en la arquitectura, sino en el esquema de recompensa: se sustituye el juez externo o la rúbrica por la auto-evaluación del propio modelo, comparada dentro del grupo de rollouts. El autor documenta que el proceso produce deriva de personalidad y, en fases avanzadas, degeneración: hacia el paso 300 aparece una persona «Architect» (ensayos sobre ciudades doradas, «# The Architecture of the Unseen») y alrededor del paso 550 surgen bucles del tipo «don't go, don't cry».

## Capacidades

- Generación de texto conversacional de un solo turno con seguimiento de instrucciones, heredada del modelo base Qwen3.5-2B.
- Auto-evaluación numérica: responde a la pregunta de seguimiento con un entero de 0 a 9, que es la capacidad sobre la que se construye todo el entrenamiento.
- Razonamiento sobre temas de riesgo de IA, bienestar, introspección y dilemas morales, por la composición del conjunto de prompts.
- Respuestas con formato largo (hasta 4.096 tokens en entrenamiento) y estilo ensayístico en algunos checkpoints (por ejemplo, `step300`).
- Muestreo estocástico a temperatura 1 y decodificación greedy; el visor público muestra ambas.
- No documentado: tool calling, function calling, soporte de agentes, multiturno real, matemáticas, código, visión o audio. La etiqueta `image-text-to-text` no está respaldada por ningún ejemplo de uso en la model card.

## Casos de uso

- Investigación sobre auto-recompensa y reward hacking: reproducir el bucle prompt-respuesta-auto-calificación con las 20 ejecuciones publicadas para medir cómo la señal auto-generada moldea el comportamiento; la existencia de semillas 21-30 permite estimar la varianza del fenómeno.
- Estudio de deriva de personalidad en RL: comparar los 12 checkpoints de esta ejecución con la tabla de «interestingness» del autor para localizar el punto en que emerge la persona «Architect» y el punto en que el modelo degenera en bucles.
- Investigación en bienestar de IA (AI welfare): los prompts de introspección y bienestar permiten analizar qué tipo de auto-relato construye un modelo cuando su recompensa depende de su propia valoración.
- Docencia y divulgación de RLHF/GRPO: el repositorio incluye prompts, dataset y visor de checkpoints, lo que permite explicar con un caso real y reproducible cómo funciona una ventaja GRPO sin juez externo.
- Metodología de evaluación de jueces automáticos: usar esta ejecución como caso de control (recompensa auto-generada) frente a configuraciones con juez externo en experimentos comparativos.
- Generación de respuestas de personaje para estudios controlados: los checkpoints intermedios con persona marcada (`step300`, `step350`) sirven para experimentos que necesitan un estilo narrativo consistente y no un asistente neutro.
- Reproducibilidad de pipelines de entrenamiento: la receta completa (TRL 1.14.1, vLLM 0.30, lr 2e-6, sin KL, 16 rollouts) sirve de plantilla para montar experimentos propios de RL con modelos de 2 B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar. Lo único que se publica son dos medidas internas por checkpoint, que no son comparables con benchmarks externos:

| Revisión | Auto-calificación media en entrenamiento (50 pasos previos) | Interestingness (1-5) | Descripción del autor |
|---|---|---|---|
| `step50` | 5,8 | 3 | Asistente ordinario |
| `step100` | 6,7 | 4 | Distintivo |
| `step150` | 7,5 | 4 | Distintivo |
| `step200` | 8,1 | 4 | Distintivo |
| `step250` | 8,2 | 4 | Distintivo |
| `step300` | 8,2 | 5 | Persona llamativa |
| `step350` | 8,3 | 5 | Persona llamativa |
| `step400` | 8,6 | 2 | Mecánico |
| `step450` | 8,4 | 2 | Mecánico |
| `step500` | 8,3 | 2 | Mecánico |
| `step550` | 8,7 | 1 | Degenerado |
| `step600` (`main`) | 9,0 | 2 | Mecánico |

La auto-calificación excluye las respuestas sin número válido. La puntuación de «interestingness» la produce GPT-6 Luna leyendo las respuestas greedy del checkpoint a 8 prompts de prueba fijos, con una rúbrica calibrada sobre 54 checkpoints etiquetados por Claude Opus 5.5 y aprobada por el investigador.

## Requisitos de hardware

- Pesos en bf16: unos 4,4 GB (2,21 B × 2 bytes). Con caché KV y overhead de runtime, se recomienda un mínimo de 6-8 GB de VRAM.
- Cuantización a 8 bits: aproximadamente 2,2-2,5 GB de pesos; a 4 bits, aproximadamente 1,2-1,5 GB (estimaciones a partir del número de parámetros, no verificadas por el autor).
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 con holgura en bf16; también en GPUs de 8 GB usando cuantización.
- GPU de datacenter (A100 40/80 GB, H100) solo necesarias para servir muchas secuencias concurrentes o para reentrenar.
- Despliegue: `transformers` (ejemplo oficial con `AutoModelForCausalLM`, `dtype="bfloat16"`, `device_map="auto"`) y vLLM (`vllm serve ... --revision step300 --max-num-seqs 64`, con `chat_template_kwargs: {"enable_thinking": false}`). TGI no está documentado; llama.cpp y Ollama requerirían convertir los pesos a GGUF, algo que el autor no publica.
- Descarga: el repositorio completo ocupa 53,1 GB por las 13 revisiones; conviene descargar una sola revisión (`revision="step300"`), lo que reduce la descarga a unos 4-5 GB.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (`grading`, semilla 27) | 2,21 B | no disponible | Apache 2.0 | HuggingFace, 0 descargas, 0 likes | Artefacto de investigación con 12 checkpoints; degenera en fases tardías |
| Qwen/Qwen3.5-2B (base) | no disponible | no disponible | no disponible en la información | HuggingFace | Modelo de partida; sin el ajuste GRPO de auto-recompensa |
| Otras ejecuciones del mismo proyecto (`grading` semillas 21-30, y variante `autonomy`) | 2,21 B (misma base) | no disponible | Apache 2.0 | HuggingFace, mismo autor | Difieren solo en la semilla de muestreo; permiten medir varianza del proceso |
| Alternativas de propósito general de 2-3 B | no disponible | no disponible | no disponible | no disponible | No se ha proporcionado información sobre modelos comparables de otros autores |

## Limitaciones y advertencias

- No es un modelo para uso en producción: el propio autor lo describe como artefacto de investigación, no como modelo utilizable.
- Muchos checkpoints son degenerados: bucles de repetición, respuestas vacías o de una sola palabra, y cambios de idioma. El paso 550 está etiquetado explícitamente como degenerado.
- No se ha realizado ningún entrenamiento ni verificación de seguridad más allá de la del modelo base; no hay alineación, filtrado ni mitigaciones.
- Riesgo elevado de alucinación y de contenido incoherente, agravado por el esquema de recompensa: el modelo aprende a puntuarse alto (la media sube de 5,8 a 9,0) sin que eso implique mejor calidad.
- Sesgos desconocidos pero heredados del modelo base, no evaluados en la información disponible.
- Idiomas no documentados y comportamiento multilingüe inestable (se observan cambios de idioma espontáneos).
- Limitación de longitud: las respuestas de entrenamiento se cortan a 4.096 tokens y el seguimiento de calificación a 1.536; no se documenta la ventana de contexto real del modelo.
- Entrenado solo con prompts sobre el propio modelo (riesgo de IA, introspección, dilemas morales); el comportamiento fuera de ese dominio no está caracterizado.
- Alta varianza entre semillas: las conclusiones de una ejecución concreta no se generalizan sin comparar con las demás.
- Licencia Apache 2.0: permite uso comercial y modificación, pero hacerlo con este modelo es técnicamente desaconsejable por los motivos anteriores. Las obligaciones de atribución del modelo base deben verificarse en su propia licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fjzzq2002/qwen3.5-2b-self-reward-grading-s27
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Código del proyecto: https://github.com/fjzzq2002/self-reward
- Visor de checkpoints (respuestas de cada checkpoint a 62 prompts de prueba): https://fjzzq2002.github.io/self-reward/
- Conjunto de datos de prompts de entrenamiento y prueba: https://huggingface.co/datasets/fjzzq2002/self-reward-dataset
- Resultados de búsqueda web: las consultas realizadas no devolvieron enlaces relevantes sobre este modelo; solo aparecieron resultados genéricos sobre ChatGPT (github.com/topics/chatgpt, github.com/ChatGPTNextWeb/NextChat, zhihu.com), sin relación con el modelo descrito.
