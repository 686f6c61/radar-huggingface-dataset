# dwidlee/systemone-lite-spatial-v2-s1

## Resumen

systemone-lite-spatial-v2-s1 es un ajuste fino por SFT continuado del modelo Qwen2.5-0.5B-Instruct, publicado por el usuario dwidlee y orientado a tareas de decisión de «system one» con énfasis en razonamiento espacial, juegos de palabras y cloze sobre WikiText. Se distribuye bajo licencia Apache-2.0 y contiene 494.032.768 parámetros en safetensors, con un repositorio de aproximadamente 1,0 GB, lo que lo sitúa en la gama de modelos pequeños desplegables en CPU o en cualquier GPU de consumo.

El modelo parte de un checkpoint propio (systemone-spatial-v2, entrenado con 51,2k pasos de cold start) y continúa el entrenamiento durante 20.000 pasos sobre el mix de la fase 2 del dataset dwidlee/systemone-lite-phase2, definido como zero-leakage (0,00% de solapamiento entre train y test). Su interés práctico es doble: por un lado, es un caso de estudio reproducible de ajuste continuado de bajo coste sobre secuencias cortas (max_len 768); por otro, incorpora métricas de calibración de la confianza (ECE), poco habituales en modelos de este tamaño.

En JevBench, un banco local de 231 tareas evaluado a temperatura 1,0, el modelo alcanza un 49,8% de acierto con un ECE de 0,307, frente al 42,9%/0,358 de su predecesor directo y el 45,9%/0,221 del mix de la fase 1. El propio autor advierte de que esos números corresponden a top-1 en datos retenidos y no garantizan habilidad en rollouts largos ni la resolución de entornos como GridWorld o Sokoban.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso de la familia Qwen2 (no MoE, no híbrida) |
| Parámetros totales | 494.032.768 (494,03 M), dato real de safetensors |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens heredados del modelo base Qwen2.5-0.5B-Instruct; el ajuste continuado se entrenó con max_len 768 |
| Tipos de cuantización | no se publican cuantizaciones; el repositorio contiene únicamente safetensors y pesa ~1,0 GB, consistente con pesos de 16 bits. La conversión a GGUF o AWQ no está documentada |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Modelo base | Qwen/Qwen2.5-0.5B-Instruct |
| Pipeline | text-generation |
| Dataset de ajuste | dwidlee/systemone-lite-phase2 (train 240.800 / test 4.700) |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only denso de la familia Qwen2, inicializado desde Qwen2.5-0.5B-Instruct. Sobre esa base, el autor aplica un SFT continuado en dos etapas: un cold start de 51,2k pasos recogido en el checkpoint local systemone-spatial-v2, seguido de una continuación de 20.000 pasos con batch 4, learning rate 2e-5, muestreo estratificado y longitud máxima de 768 tokens. No se documenta el uso de RLHF, DPO ni de técnicas de atención lineal o decodificación especulativa.

El corpus de la fase 2, dwidlee/systemone-lite-phase2, contiene 240.800 ejemplos de entrenamiento y 4.700 de test, con un solapamiento declarado del 0,00% entre ambos conjuntos, y mezcla tres componentes descritos literalmente como «CA», juegos de palabras y cloze sobre WikiText. La continuación de 20.000 pasos equivale aproximadamente a un tercio de una época completa, que el autor estima en 60.200 pasos, de modo que el ajuste de fase 2 no cubre el mix completo ni una sola vez.

## Capacidades

- Generación de texto conversacional, heredada del modelo base instruido sobre el que se inicializa.
- Decisión de tipo «system one»: emisión de una respuesta inmediata en formato de decisión, que es el objetivo declarado del ajuste y lo que mide JevBench.
- Cloze sobre WikiText: completar fragmentos de texto con el token o la palabra faltante.
- Juegos de palabras y tareas léxicas, presentes como componente explícito del mix de la fase 2.
- Razonamiento espacial, según la etiqueta «spatial» compartida con el checkpoint predecesor.
- Calibración de la confianza: el proyecto reporta ECE junto a la precisión, por lo que el modelo está pensado para emitir puntuaciones de confianza comparativamente calibradas y no solo la clase ganadora.
- Tool calling o function calling: no documentado en la información disponible.
- Modo de razonamiento explícito («thinking»): no documentado.
- Visión y audio: no soportados; el modelo es exclusivamente de texto.
- Capacidades multilingües: no documentadas; el campo de idiomas figura como no disponible.
- Compatibilidad de despliegue: los tags incluyen text-generation-inference y endpoints_compatible, y el proyecto ofrece el comando `systemone-lite --model dwidlee/systemone-lite-spatial-v2-s1 --port 8000`.

## Casos de uso

- Investigación sobre calibración en modelos pequeños: el modelo publica ECE además de precisión, lo que permite estudiar la relación entre tamaño, ajuste continuado y fiabilidad de las probabilidades emitidas.
- Ajuste continuado y olvido catastrófico: al ser una continuación de 20.000 pasos sobre un checkpoint previo, sirve como sujeto de experimentos controlados sobre cuánto se degradan las capacidades generales al especializar un modelo de 0,5B.
- Higiene de datasets: el mix declara 0,00% de solapamiento train∩test, por lo que es un caso útil para metodologías de evaluación sin fuga de datos; el propio autor insiste en usar solo el split test del Hub para evaluar.
- Generación de ejercicios de cloze: el ajuste incluye cloze sobre WikiText, de modo que puede emplearse para producir o resolver ítems de completar huecos en herramientas educativas o de anotación.
- Puntuación de respuestas candidatas: al trabajar como modelo de decisión, puede usarse para ordenar alternativas en tareas de elección múltiple o de selección de completaciones, con la salvedad de que su ECE de 0,307 no es bajo.
- Juegos de palabras y asistentes léxicos: el componente de word games del dataset permite prototipar pistas, anagramas o validaciones léxicas en aplicaciones de entretenimiento.
- Despliegue en el borde: con menos de 500 M de parámetros y ~1,0 GB en 16 bits, cabe en CPU, en GPU integradas o en dispositivos con memoria limitada donde no es viable servir un modelo de 7B.
- Prototipado de arquitecturas system one / system two: puede actuar como módulo de decisión rápida delante de un modelo mayor que se encargue del razonamiento largo, siempre que se valide el enrutado fuera de línea.

## Benchmarks y rendimiento

JevBench local, temperatura 1,0, 231 tareas:

| Modelo | Precisión (Acc) | ECE |
|---|---:|---:|
| Phase 1 mixed | 45,9% | 0,221 |
| Spatial v2 (predecesor) | 42,9% | 0,358 |
| systemone-lite-spatial-v2-s1 (este modelo) | 49,8% | 0,307 |

El informe completo se encuentra en el repositorio del modelo, en `benchmarks/jevbench_spatial_v2_s1.json`. El autor indica expresamente que no se trata de un envío oficial a la tabla de clasificación de JevBench. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits (bf16/fp16): aproximadamente 1,0-1,2 GB, incluyendo overhead de activaciones y caché en contextos cortos.
- VRAM estimada en int8: del orden de 0,5-0,7 GB; en int4: del orden de 0,3-0,5 GB. Son estimaciones de cálculo, ya que no se publican cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con 2 GB o más de memoria es suficiente; no se requiere A100, H100 ni tarjetas de centro de datos. Una RTX 3060, RTX 4060 o incluso una GPU integrada moderna pueden servirlo.
- Cabe en GPU de consumo: sí, en todas las gamas actuales. También es viable su ejecución íntegra en CPU.
- Opciones de despliegue: transformers de forma nativa; text-generation-inference (el repositorio lleva el tag endpoints_compatible); el binario del proyecto `systemone-lite`; vLLM como servidor OpenAI-compatible. llama.cpp u Ollama exigirían convertir primero los pesos a GGUF, conversión que no está publicada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | JevBench (Acc / ECE) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| systemone-lite-spatial-v2-s1 | 494 M | 32.768 (heredado del base); entrenado a max_len 768 | 49,8% / 0,307 | Apache-2.0 | HuggingFace |
| systemone-spatial-v2 (predecesor) | no disponible | no disponible | 42,9% / 0,358 | no disponible | checkpoint local citado en la model card, no publicado en el Hub |
| Phase 1 mixed (referencia interna) | no disponible | no disponible | 45,9% / 0,221 | no disponible | no disponible |
| Qwen2.5-0.5B-Instruct (base) | 494 M | 32.768 | no evaluado en JevBench | Apache-2.0 | HuggingFace |

Para modelos comparables de tamaño similar fuera de la familia systemone (por ejemplo, instructivos de menos de 1.000 M de parámetros de otros fabricantes) no hay datos de JevBench publicados, por lo que la comparación de rendimiento en esa tarea no está disponible.

## Limitaciones y advertencias

- Riesgo de alucinación elevado: con 494 M de parámetros y un ajuste especializado, la generación libre de hechos no es fiable y debe acotarse a tareas de decisión o cloze verificables.
- El ECE de 0,307 es el peor de los tres modelos comparados en la tabla interna del proyecto: el modelo mejora en precisión respecto a su predecesor, pero empeora en calibración frente al mix de fase 1 (0,221).
- El rendimiento medido es top-1 sobre datos retenidos y, según el propio autor, no implica habilidad en rollouts largos; las demostraciones sin andamiaje siguen fallando en GridWorld y Sokoban.
- Cobertura de entrenamiento incompleta: los 20.000 pasos de continuación equivalen a un tercio de época sobre el mix de 240.800 ejemplos, por lo que no puede descartarse un ajuste insuficiente de la fase 2.
- Idiomas soportados no documentados. El mix de datos es estrecho (componentes descritos como «CA», juegos de palabras y cloze sobre WikiText), lo que hace plausible una degradación de capacidades generales por olvido catastrófico respecto al modelo base.
- Sesgos conocidos: no se han publicado análisis de sesgo en la información disponible.
- Licencia Apache-2.0: permite uso comercial, pero el autor declara no estar afiliado a TypeSafe AI ni a Jev, y la procedencia y licencia del dataset dwidlee/systemone-lite-phase2 conviene verificarlas antes de un uso en producción.
- Higiene de evaluación: el autor recomienda usar exclusivamente el split test del Hub para medir, dado que el resto del mix se empleó en entrenamiento.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin validación externa por parte de la comunidad.
- Los resultados de JevBench son locales y no constituyen un envío oficial a la tabla de clasificación del benchmark.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dwidlee/systemone-lite-spatial-v2-s1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de ajuste: https://huggingface.co/datasets/dwidlee/systemone-lite-phase2
- Repositorio del proyecto systemone-lite: https://github.com/fritzprix/systemone-lite
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/doodream/systemone-lite/runs/bs62qs8x
- Informe de benchmarks: `benchmarks/jevbench_spatial_v2_s1.json` (dentro del repositorio del modelo)

Nota: la búsqueda web no devolvió ningún resultado relevante sobre este modelo; los únicos enlaces recuperados correspondían a páginas no relacionadas de un servicio bancario francés y se han omitido por no aportar información técnica.
