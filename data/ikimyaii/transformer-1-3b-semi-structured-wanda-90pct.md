# ikimyaii/Transformer-1.3B-semi-structured-Wanda-90pct

## Resumen

Transformer-1.3B-semi-structured-Wanda-90pct es una versión podada del modelo base fla-hub/transformer-1.3B-100B, publicado por el usuario ikimyaii en Hugging Face. Se trata de un artefacto de investigación, no de un modelo listo para producción: aplica poda one-shot (sin reentrenamiento) al 90% de dispersión sobre todas las capas lineales internas de los bloques del transformer, dejando embeddings y lm_head densos. La poda se realizó con el código oficial de Wanda (locuslab/wanda, commit 8e8fc87, rama unstructured, `use_variant=False`), que descarta en cada fila los pesos con menor producto `|W| * sqrt(||X||)`.

El modelo base pertenece a la familia de transformers con atención linear implementada en la librería flash-linear-attention (fla), con 1.364.297.728 parámetros totales y entrenado sobre 100B tokens según el identificador del repositorio original. Esta variante podada conserva la arquitectura y el número de parámetros declarados en el checkpoint, pero la mayoría de los pesos de las capas lineales son cero, de modo que la matriz efectiva es dispersa con una tasa medida de 0,8999 y un número idéntico de no-ceros por fila en las 168 capas podadas.

Su relevancia es acotada: sirve como baseline de referencia para los modelos EHWS del mismo autor y como ejemplo reproducible de un pipeline de poda Wanda sobre una arquitectura no estándar (los drivers oficiales de Wanda solo cubren OPT y LLaMA, por lo que el recorrido de capas es código nuevo). Los resultados publicados muestran un deterioro severo de la perplejidad y una caída media de 7,69 puntos en zero-shot, lo que lo sitúa como un caso de estudio sobre los límites de la poda agresiva sin recuperación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención linear (flash-linear-attention, fla); poda semi-estructurada por filas en capas lineales |
| Parametros totales | 1.364.297.728 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el calibrado usa secuencias de 2.048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 en el checkpoint; repo de 2,7 GB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer de 1.3B parámetros con atención linear de la familia fla, entrenado sobre 100B tokens según la nomenclatura del repositorio original (fla-hub/transformer-1.3B-100B). Sobre esa base, este checkpoint aplica poda one-shot sin reentrenamiento: se recorren los bloques en orden y cada bloque se calibra sobre las salidas de los bloques ya podados anteriores, replicando el procedimiento de los drivers oficiales de Wanda. La calibración emplea 128 secuencias de C4 de 2.048 tokens con semilla 0, y la poda se ejecuta en bfloat16.

La innovación técnica del artefacto no está en el modelo sino en el pipeline: se reimplementa el recorrido de capas para una arquitectura que Wanda no soporta de serie, manteniendo intacta la matemática oficial de poda. El resultado es una dispersión medida de 0,8999 con equilibrio perfecto por fila (mismo número de no-ceros en cada fila de las 168 capas podadas), lo que en teoría permite un reparto de trabajo uniforme en kernels dispersos. No se aplicó destilación, RLHF, DPO ni recuperación de precisión posterior a la poda.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base, aunque con calidad gravemente degradada según las métricas publicadas.
- Razonamiento y respuesta a preguntas de opción múltiple: conserva parcialmente el rendimiento en tareas como boolq (0,6190 frente a 0,6199 denso) y rte (0,5271 frente a 0,5126), pero cae en el resto.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- No se documentan modos especiales (thinking, visión, audio).
- Valor como referencia reproducible de poda Wanda sobre arquitecturas fla.

## Casos de uso

- Baseline de investigación en poda: sirve para comparar los modelos EHWS del mismo autor contra una referencia Wanda estándar al 90% de dispersión, con pipeline y métricas documentadas.
- Estudio de degradación por poda agresiva: permite analizar por qué la perplejidad se dispara (198.409,56 en WikiText-2) mientras algunas tareas zero-shot se mantienen, útil para investigar métricas de robustez.
- Validación de kernels dispersos: al tener un número idéntico de no-ceros por fila en 168 capas, es un banco de pruebas para kernels semi-estructurados con equilibrio de carga garantizado.
- Reproducción de experimentos: el método, la semilla, el dataset de calibración y el commit de Wanda están documentados, lo que facilita replicar el resultado en una A100 40GB en aproximadamente un minuto.
- Enseñanza de técnicas de compresión: ejemplo didáctico de poda one-shot con calibración secuencial por bloques sobre una arquitectura no soportada por las herramientas estándar.
- No se recomienda su uso en aplicaciones de producción, atención al cliente, generación de código ni ningún escenario que requiera calidad de texto fiable, dados los resultados publicados.

## Benchmarks y rendimiento

Perplejidad con protocolo de evaluación de ELSA (WikiText-2 y C4, fp16):

| Metrica | Denso | Este modelo |
|---|---|---|
| WikiText-2 (perplejidad) | 9,77 | 198.409,56 |
| C4 (perplejidad) | 14,65 | 196.001,36 |

Precisión zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2355 | 0,2338 |
| arc_easy | 0,5602 | 0,2433 |
| boolq | 0,6199 | 0,6190 |
| hellaswag | 0,3848 | 0,2608 |
| openbookqa | 0,2120 | 0,1400 |
| rte | 0,5126 | 0,5271 |
| winogrande | 0,5478 | 0,5107 |
| Media | 0,4390 | 0,3621 |

## Requisitos de hardware

- El checkpoint ocupa 2,7 GB en safetensors con pesos en bfloat16, por lo que la inferencia requiere al menos unos 3 GB de VRAM solo para pesos, más memoria para activaciones y caché.
- La poda se realizó en una única A100 40GB en 1,0 minutos; el entrenamiento original del modelo base no está documentado en la información disponible.
- Cabe en GPUs de consumo con suficiente VRAM (por ejemplo, RTX 3090, RTX 4090, RTX 4080) siempre que se instalen las dependencias de fla.
- Requiere `flash-linear-attention` (import fla), `flash-attn` para la capa de atención y `AutoModelForCausalLM.from_pretrained(...)`.
- Opciones de despliegue como vLLM, llama.cpp, Ollama o TGI: no disponibles para esta arquitectura en la información proporcionada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dispersión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Transformer-1.3B-semi-structured-Wanda-90pct | 1,36B | no disponible | 90% (0,8999 medido) | no disponible | Hugging Face |
| fla-hub/transformer-1.3B-100B (base denso) | 1,36B | no disponible | 0% | no disponible | Hugging Face |
| Modelos EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks de los modelos EHWS ni de otros artefactos comparables en la información proporcionada, por lo que la comparación se limita a las métricas denso frente a podado ya presentadas.

## Limitaciones y advertencias

- Deterioro severo de la perplejidad: 198.409,56 en WikiText-2 y 196.001,36 en C4 frente a 9,77 y 14,65 del modelo denso, lo que indica una generación de texto prácticamente inutilizable.
- Caída media de 7,69 puntos en zero-shot (0,4390 a 0,3621); arc_easy baja de 0,5602 a 0,2433 y hellaswag de 0,3848 a 0,2608.
- Poda sin reentrenamiento: no hay recuperación de precisión, destilación ni ajuste fino posterior.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- Idiomas y sesgos no documentados; al ser un artefacto de investigación no se han evaluado sesgos.
- Riesgo elevado de alucinación y salidas incoherentes por la poda agresiva.
- Dependencias frágiles: requiere fla y flash-attn, y el recorrido de capas es código nuevo no validado fuera del pipeline del autor.
- Contexto máximo no documentado; la calibración usó 2.048 tokens, pero no se garantiza ese límite en inferencia.
- No apto para producción ni para tareas que requieran fiabilidad factual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/Transformer-1.3B-semi-structured-Wanda-90pct
- Modelo base: https://huggingface.co/fla-hub/transformer-1.3B-100B
- Código oficial de Wanda: https://github.com/locuslab/wanda (commit 8e8fc87)
- Librería flash-linear-attention: no disponible enlace directo en la información proporcionada
