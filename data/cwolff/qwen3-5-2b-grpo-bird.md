# cwolff/qwen3.5-2b-grpo-bird

## Resumen

M<sub>BIRD</sub> es un modelo especializado en text-to-SQL desarrollado por el autor cwolff (publicado bajo la organización trl-lab) como parte del proyecto SQaLe. Se trata de un fine-tuning de Qwen3.5-2B, un modelo de 2.274.069.824 parámetros, entrenado exclusivamente mediante aprendizaje por refuerzo (GRPO) sobre el split de entrenamiento del benchmark BIRD, sin arranque supervisado ni trazas de razonamiento destiladas de un profesor mayor.

El modelo funciona como un agente: no recibe el esquema de la base de datos en el prompt, sino que explora la base mediante llamadas a herramientas, prueba sus consultas y finalmente las envía. Esto lo diferencia de los enfoques clásicos de text-to-SQL de un solo paso y lo sitúa en la línea de los sistemas agénticos con tool calling.

Su relevancia radica en que demuestra que un modelo de solo 2B parámetros, entrenado únicamente con RL sobre un corpus específico, puede alcanzar un 54,7% de precisión de ejecución en BIRD dev, superando en 35,4 puntos al modelo base sin entrenar. Forma parte de una familia de tres modelos (M<sub>SQaLe</sub>, M<sub>BIRD</sub> y M<sub>SynSQL</sub>) que comparten receta de entrenamiento y solo difieren en el corpus, lo que permite aislar el efecto de los datos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), multimodal image-text-to-text según tags; fine-tuning para text-to-SQL |
| Parámetros totales | 2.274.069.824 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantización estándar vía transformers/vLLM) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del checkpoint base Qwen3.5-2B, un transformer de 2.274 millones de parámetros. Sobre él se aplica un fine-tuning mediante GRPO (Group Relative Policy Optimization), un algoritmo de aprendizaje por refuerzo, sin fase de supervised fine-tuning previa y sin destilación de trazas de razonamiento de un modelo profesor. El entorno de entrenamiento es agéntico: el modelo dispone de un conjunto de herramientas para explorar la base de datos, ejecutar consultas de prueba y enviar la consulta final, y el esquema nunca forma parte del prompt.

El corpus de entrenamiento es el split de entrenamiento de BIRD, un benchmark de text-to-SQL sobre bases de datos SQLite del mundo real. A diferencia de M<sub>SQaLe</sub>, este modelo no utiliza curriculum de longitud (length curriculum: none). La receta completa (entorno agéntico, conjunto de herramientas, recompensa, objetivo GRPO, número de pasos, tamaño de batch y protocolo de evaluación) es idéntica a la de los otros dos modelos de la familia, de modo que las diferencias de rendimiento se atribuyen al corpus de entrenamiento. El repositorio incluye `sqale_agent.py`, un bucle de referencia autocontenido que reproduce el entorno de entrenamiento con el mismo prompt, herramientas, presupuesto de turnos y fallback de respuesta final.

## Capacidades

- Generación de consultas SQL para SQLite a partir de lenguaje natural, en modo agéntico.
- Exploración autónoma de bases de datos mediante herramientas: inspección de tablas, ejecución de consultas de prueba y envío final.
- Tool calling / function calling dentro del bucle agéntico definido por el autor.
- Razonamiento multi-paso: el modelo itera sobre sus consultas hasta encontrar una válida o agotar el presupuesto de turnos.
- Fallback a la última consulta funcional cuando no se produce un envío explícito (`fallback_to_last_working_query`).
- Capacidad multimodal declarada en los tags (image-text-to-text), heredada del modelo base Qwen3.5; no se documenta su uso en el fine-tuning.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Análisis de datos conversacional sobre SQLite: un analista formula preguntas en lenguaje natural ("¿qué proveedor envió más artículos con pedidos pendientes el trimestre pasado?") y el agente explora el esquema, prueba consultas y devuelve el SQL ejecutable, sin necesidad de conocer previamente las tablas.
- Integración en asistentes de BI: el modelo puede conectarse a bases de datos de producción en modo solo lectura (el script de referencia abre la base en read-only) para responder preguntas ad-hoc sobre métricas de negocio.
- Automatización de informes periódicos: dado que un solo agente cargado en vLLM puede responder muchas preguntas con el mismo motor, resulta adecuado para pipelines que generan consultas recurrentes sobre un almacén de datos.
- Generación de SQL en herramientas internas de desarrollo: el modelo soporta tool calling y puede integrarse en un IDE o CLI que ejecute las consultas contra una base de pruebas y devuelva el resultado al usuario.
- Evaluación y benchmarking de pipelines text-to-SQL: al reproducir el entorno de entrenamiento con `sqale_agent.py`, sirve como referencia para comparar sistemas agénticos sobre BIRD y EHRSQL.
- Prototipado de agentes de datos en entornos con recursos limitados: con 2,27B parámetros y licencia Apache 2.0, es desplegable en hardware modesto para pruebas de concepto de agentes SQL antes de escalar a modelos mayores.
- Extracción de información de bases de datos sanitarias: el modelo obtiene un 23,7% en EHRSQL (registros electrónicos de salud), lo que lo hace utilizable como base para experimentación en dominios clínicos con ajuste adicional.

## Benchmarks y rendimiento

Precisión de ejecución (%) sobre 300 preguntas por benchmark, según el paper. Todos los modelos se ejecutan en el entorno agéntico de entrenamiento, con el esquema oculto y sin andamiaje en tiempo de evaluación.

| Modelo | SQaLe test | BIRD dev | EHRSQL |
|---|:-:|:-:|:-:|
| M<sub>SQaLe</sub> | **66,3** | 52,3 | **23,7** |
| **M<sub>BIRD</sub>** (este modelo) | 54,0 | **54,7** | **23,7** |
| M<sub>SynSQL</sub> | 50,7 | 44,3 | 13,3 |
| Qwen3.5-2B (sin entrenar) | 38,7 | 19,3 | 8,2 |
| Qwen3.6-27B (sin entrenar) | 76,0 | 69,3 | 55,0 |

Desglose por tamaño de esquema en SQaLe test (tablas del gold, gold más 32 tablas distractoras y esquema completo); los corchetes indican la proporción de episodios en que el modelo abrió todas las tablas gold:

| Tablas en la base de datos | M<sub>SQaLe</sub> | M<sub>BIRD</sub> | M<sub>SynSQL</sub> |
|---|:-:|:-:|:-:|
| Datos del fragmento disponible | parcial | parcial | parcial |

No se han publicado en la información disponible los valores completos de esta tabla de desglose por tamaño de esquema.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la model card. Con 2,27B parámetros, en FP16 requiere aproximadamente 4,5 GB de pesos más overhead de KV cache; en cuantización de 8 bits o 4 bits cabría en GPUs consumer de 8 GB o menos, aunque estos cálculos no están confirmados por el autor.
- GPU recomendadas: no especificadas por el autor. El quickstart oficial usa vLLM, lo que sugiere GPUs de datacenter (A100, H100) o consumer de gama alta (RTX 4090) para mayor throughput.
- Compatibilidad con GPU consumer: probable por el tamaño del modelo, pero no documentada.
- Opciones de despliegue: vLLM (usado en el quickstart oficial con `vllm_generate`), transformers (librería declarada) y, presumiblemente, llama.cpp/Ollama mediante conversión a GGUF, aunque no se documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BIRD dev | SQaLe test | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **M<sub>BIRD</sub>** | 2,27B | no disponible | 54,7 | 54,0 | Apache 2.0 | Hugging Face |
| M<sub>SQaLe</sub> | 2,27B | no disponible | 52,3 | 66,3 | Apache 2.0 | Hugging Face |
| M<sub>SynSQL</sub> | 2,27B | no disponible | 44,3 | 50,7 | Apache 2.0 | Hugging Face |
| Qwen3.5-2B (base) | 2,27B | no disponible | 19,3 | 38,7 | Apache 2.0 | Hugging Face |
| Qwen3.6-27B (base) | 27B | no disponible | 69,3 | 76,0 | no disponible | Hugging Face |

M<sub>BIRD</sub> es el mejor de la familia en BIRD dev (54,7), su benchmark de entrenamiento, mientras que M<sub>SQaLe</sub> domina en SQaLe test (66,3), donde el esquema es más grande y variado. Frente al Qwen3.6-27B sin entrenar, el modelo de 2B queda 14,6 puntos por debajo en BIRD dev y 22 puntos en SQaLe test, lo que ilustra el margen que aún separa a los modelos pequeños especializados de los grandes generalistas.

## Limitaciones y advertencias

- El modelo solo ha sido entrenado y evaluado en inglés; no se documenta soporte para otros idiomas.
- Sesgos conocidos: no documentados por el autor; al entrenarse sobre BIRD, puede heredar los sesgos de dominio de ese corpus.
- Riesgo de alucinación: el modelo puede generar consultas SQL sintácticamente válidas pero semánticamente incorrectas; el bucle agéntico mitiga parcialmente este riesgo al permitir probar consultas, pero no lo elimina.
- Rendimiento dependiente del tamaño del esquema: en bases de datos grandes con muchas tablas distractoras, M<sub>BIRD</sub> rinde peor que M<sub>SQaLe</sub>, según el análisis del paper sobre la búsqueda en esquemas grandes.
- Requiere un bucle agéntico externo que ejecute las herramientas contra la base de datos; no funciona como un generador de SQL de un solo paso sin ese entorno.
- El script de referencia abre la base en modo solo lectura, lo que limita su uso a consultas de lectura.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos de los evaluados.
- El modelo tiene solo 245 descargas y 3 likes en el momento de la ficha, por lo que la validación comunitaria es escasa.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/cwolff/qwen3.5-2b-grpo-bird)
- [Página del proyecto SQaLe](https://trl-lab.github.io/sqale)
- [M<sub>SQaLe</sub> en Hugging Face](https://huggingface.co/trl-lab/qwen3.5-2b-grpo-sqale)
- [Colección completa del proyecto SQaLe](https://huggingface.co/collections/trl-lab/sqale-project)
- [Benchmark BIRD](https://bird-bench.github.io/)
- [Dataset SQaLe-2-text-to-SQL-Queries](https://huggingface.co/datasets/trl-lab/SQaLe-2-text-to-SQL-Queries)
- [Dataset SynSQL-2.5M](https://huggingface.co/datasets/seeklhy/SynSQL-2.5M)
- [Benchmark EHRSQL](https://github.com/glee4810/EHRSQL)
- [Modelo base Qwen3.5-2B](https://huggingface.co/Qwen/Qwen3.5-2B)
