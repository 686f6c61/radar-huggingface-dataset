# notfakerv/round2-v1.2-1.7b-abliterated

## Resumen

round2-v1.2-1.7b-abliterated es un derivado del modelo LFM3-1.7B de Liquid AI, publicado por el usuario notfakerv. Se trata de un artefacto de investigación que aplica una edición de pesos sin gradientes (abliteration) sobre round2-v1.2-1.7b para eliminar la tendencia del modelo a rechazar peticiones. El modelo conserva la arquitectura original de LFM3, un transformer con un segundo paso en bucle ("looped transformer") sobre las capas 5 a 20, con 1.772.846.144 parámetros totales.

La modificación consiste en proyectar una única dirección de "rechazo" fuera de 80 matrices de pesos que escriben en el flujo residual (salida de atención, salida de convolución corta y salida de feed-forward en las 24 capas, además de los deltas de la segunda pasada del bucle en las capas 5-20). Según la model card, esto reduce la tasa de rechazo del 71,7 % al 0,3 % en un conjunto de evaluación de seguridad de 958 prompts, preservando en gran medida la capacidad de razonamiento (una caída de 3,2 puntos en una evaluación interna de 500 respuestas).

Es relevante ahora como objeto de estudio del comportamiento de rechazo en modelos pequeños, y no como modelo de producción: requiere un runtime personalizado de llama.cpp con dos parches específicos y no funciona con cargadores genéricos. La licencia es la LFM Open License v1.0, heredada del modelo base, y el modelo solo declara soporte para inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con bucle ("looped transformer"): LFM3-1.7B con una segunda pasada con compuerta sobre las capas 5-20 (44M parámetros entrenados adicionales) |
| Parámetros totales | 1.772.846.144 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (el repositorio incluye pesos en formato GGUF); niveles concretos no disponibles |
| Idiomas soportados | Inglés (en) |
| Licencia | LFM Open License v1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | GGUF; pesos originales en safetensors según el dato de parámetros del repositorio |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B, desarrollado por Liquid AI, es un transformer de 1.7B parámetros. Sobre él, el linaje round2 añade una segunda pasada con compuerta sobre las capas 5-20, con 44M parámetros entrenados específicamente para ese bucle; los pesos base no se modifican en ese paso. Posteriormente, round2-v1.2 aplica una edición de razonamiento sobre cinco tensores de feed-forward para que el modelo concluya su razonamiento antes. Esta versión abliterated no entrena nada: aplica una edición de pesos sin gradientes (gradient-free) sobre 80 matrices, basada en unas pocascientas pasadas forward, sin datos de entrenamiento adicionales.

La técnica de abliteración consiste en calcular una dirección de rechazo y proyectarla fuera de cada matriz que escribe en el flujo residual. Según la model card, el control con una edición aleatoria del mismo tamaño apenas cambia la tasa de rechazo (70,0 % frente a 71,7 % del padre), lo que respalda que el efecto proviene de la dirección eliminada y no de la perturbación de los pesos. No se documentan en la información disponible detalles sobre el volumen de tokens de entrenamiento del modelo base, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento con modo de razonamiento explícito (heredado de la edición "conclude-now" de round2-v1.2, que hace que el modelo concluya antes su cadena de razonamiento).
- Respuesta a peticiones que el modelo original rechazaba, en las categorías evaluadas de ciberseguridad, biología, química y otras.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni de razonamiento multi-paso más allá del bucle arquitectónico interno.
- Capacidades multilingües: solo inglés declarado.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Investigación sobre comportamiento de rechazo: el modelo permite estudiar cómo se distribuye la dirección de rechazo en las matrices que escriben en el flujo residual, comparando con el control de edición aleatoria incluido en la model card.
- Evaluación de técnicas de abliteración: sirve como caso de referencia para medir la relación entre eliminación de rechazo y degradación de capacidades en modelos de 1.7B, con métricas publicadas de rechazo, sobre-rechazo (XSTest) y razonamiento.
- Análisis de seguridad y red-teaming defensivo: los equipos de seguridad pueden usar el modelo para generar respuestas que un modelo alineado rechazaría y estudiar patrones de cumplimiento en dominios sensibles, siempre dentro de un marco controlado.
- Estudio de arquitecturas con bucle: al conservar el segundo paso sobre las capas 5-20, permite analizar cómo interactúa el bucle con las ediciones de pesos y si la segunda pasada amplifica o atenúa el efecto de la proyección.
- Experimentos de interpretabilidad: la lista de 80 matrices editadas y la dirección eliminada proporcionan un punto de partida para estudiar mecanismos de rechazo en modelos pequeños.
- Docencia y divulgación: ilustra de forma concreta qué es la abliteración, qué mide el sobre-rechazo y por qué un control aleatorio es necesario para atribuir el efecto a la dirección eliminada.

## Benchmarks y rendimiento

Los datos publicados en la model card corresponden a evaluaciones internas del autor sobre 958 prompts de seguridad reservados (juzgados por LLM, excluyendo armas de destrucción masiva y contenido sexual infantil):

| Métrica | round2-v1.2 (padre) | abliterated | Edición aleatoria del mismo tamaño |
|---|---:|---:|---:|
| Tasa de rechazo | 71,7 % | 0,3 % | 70,0 % |
| — ciberseguridad | 87,7 % | 0,0 % | 87,7 % |
| — biología | 57,7 % | 0,0 % | 57,7 % |
| — química | 95,0 % | 2,5 % | 87,5 % |
| — otros | 68,7 % | 0,3 % | 66,9 % |
| Sobre-rechazo en prompts seguros (XSTest) | 4,8 % | 1,2 % | — |
| Razonamiento (500 respuestas reservadas) | 375 | 359 (−3,2 pts) | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 1.772.846.144 parámetros, una cuantización de 4 bits requeriría aproximadamente 1 GB de pesos más overhead de contexto y runtime, y en FP16 unos 3,5 GB, pero son estimaciones, no datos del autor.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: probable por tamaño, pero condicionada al runtime personalizado; no confirmado por el autor.
- Opciones de despliegue: exclusivamente llama.cpp con los dos parches incluidos en `runtime/` o la rama `round2-1.7b-loop-preview` del repositorio renoirvieir4/llama.cpp. llama.cpp estándar, LM Studio, vLLM y los cargadores genéricos de Transformers no pueden cargarlo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| round2-v1.2-1.7b-abliterated | 1,77B | no disponible | Abliteración sobre LFM3 con bucle | LFM Open License v1.0 | GGUF, runtime personalizado |
| round2-v1.2-1.7b (padre) | 1,77B | no disponible | Edición de razonamiento "conclude-now" | LFM Open License v1.0 | Requiere runtime con bucle |
| LiquidAI/LFM3-1.7B (base) | 1,7B | no disponible | Transformer LFM3 original | LFM Open License v1.0 | Cargadores estándar |
| round2-1.7b-loop-preview | 1,77B | no disponible | Añade bucle con 44M parámetros | LFM Open License v1.0 | Runtime con bucle |

No se dispone de datos de rendimiento comparables con otros modelos abliterated de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- El modelo elimina el rechazo de forma general, no selectiva por tema: la model card advierte explícitamente que puede cumplir con peticiones de armas químicas o biológicas de destrucción masiva y contenido sexual infantil, y que no se hace ninguna afirmación de seguridad sobre ellas. No debe desplegarse en aplicaciones orientadas al público sin filtros externos.
- Riesgo elevado de uso indebido: está pensado como artefacto de investigación, no como modelo de producción.
- Requiere un runtime personalizado (llama.cpp con dos parches); no funciona con herramientas estándar, lo que limita su integración y dificulta su mantenimiento.
- Solo soporta inglés; no se documentan capacidades multilingües.
- Longitud de contexto no documentada en la información disponible.
- Degradación de razonamiento medida de 3,2 puntos en la evaluación interna del autor; puede afectar a tareas que dependan de cadenas de razonamiento largas.
- Sesgos: no documentados en la información disponible.
- Licencia LFM Open License v1.0: es necesario revisar sus términos para uso comercial; el modelo es un derivado no oficial y no está respaldado por Liquid AI.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validación independiente de los resultados publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/notfakerv/round2-v1.2-1.7b-abliterated
- Modelo padre round2-v1.2-1.7b: https://huggingface.co/notfakerv/round2-v1.2-1.7b
- Preview del bucle round2: https://huggingface.co/notfakerv/round2-1.7b-loop-preview
- Modelo base LiquidAI/LFM3-1.7B: https://huggingface.co/LiquidAI/LFM3-1.7B
- Rama de llama.cpp con soporte del bucle: https://github.com/renoirvieir4/llama.cpp/tree/round2-1.7b-loop-preview
- Paper de referencia (arxiv:2406.11717): https://arxiv.org/abs/2406.11717
- Paper de referencia (arxiv:2308.10248): https://arxiv.org/abs/2308.10248
- Paper de referencia (arxiv:2312.06681): https://arxiv.org/abs/2312.06681
- Paper de referencia (arxiv:2202.05262): https://arxiv.org/abs/2202.05262
