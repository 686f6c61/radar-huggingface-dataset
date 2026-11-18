# martinkorelic/rudar-gliner2-sl-coref

## Resumen

`rudar-gliner2-sl-coref` es un modelo de resolución de correferencia para esloveno desarrollado por Martin Korelič dentro de la familia Rudar, un conjunto de modelos de extracción de información construidos sobre GLiNER2. El modelo identifica las menciones de entidades en un texto (nombres, pronombres, posesivos, sintagmas nominales y sujetos elididos) y las agrupa en clústeres que apuntan a la misma entidad, incluyendo el fenómeno del sujeto cero, muy frecuente en esloveno (*Ø sta odprla kavarno*).

Con aproximadamente 307 millones de parámetros (1,3 GB en el repositorio), el modelo se presenta como un extractor de token-classification especializado en un único idioma, el esloveno. Parte del modelo base `martinkorelic/rudar-gliner2-sl-base` y se distribuye con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia radica en cubrir una tarea —la correferencia en esloveno, incluyendo sujetos elididos— para la que existen pocos recursos abiertos, y en hacerlo con un modelo de tamaño contenido que puede ejecutarse en hardware modesto. El modelo declara resultados oficiales en el leaderboard SloBench de correferencia en esloveno, con un CoNLL score de 46,59 sobre 81 documentos de test ocultos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GLiNER2 (transformer encoder para token-classification, con pipeline de correferencia) |
| Parámetros totales | 307.098.645 (~300 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta ~2.500 tokens por pasada; documentos más largos se procesan en ventanas |
| Tipos de cuantización | no disponible |
| Idiomas soportados | esloveno (`sl`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con código personalizado `modeling_rudar.py` y `pipeline_rudar.py`) |

## Arquitectura y entrenamiento

El modelo se construye sobre GLiNER2, una arquitectura de extracción de información basada en transformer encoder que formula la detección de menciones como token-classification guiada por prompts en lenguaje natural (por ejemplo, `oseba` para PERSON, `lokacija` para LOCATION). Sobre esa base, el pipeline de Rudar añade un mecanismo de enlace entre menciones que genera clústeres de correferencia y relaciones antecedente–mención, en lugar de limitarse a etiquetar entidades de forma aislada.

El modelo es un fine-tuning del checkpoint `martinkorelic/rudar-gliner2-sl-base`. La información proporcionada no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO; estos datos deben considerarse no disponibles. La innovación técnica destacable es el tratamiento explícito del sujeto elidido (`ZERO_SUBJECT`), marcado sobre el verbo que lo porta, junto con la conservación de mayúsculas y minúsculas originales del texto y la ventana automática para documentos largos, que el autor señala como necesarias para obtener la calidad declarada (cargar los pesos con `GLiNER2.from_pretrained` directo degrada la calidad y pierde el casing).

## Capacidades

- Resolución de correferencia en esloveno: agrupa menciones de una misma entidad en clústeres ordenados por aparición en el texto.
- Detección de menciones con offsets de carácter (`start`/`end`) y puntuación de confianza por mención.
- Tipologización de menciones en siete etiquetas: `PERSON`, `PERSON_GROUP`, `ORGANIZATION`, `LOCATION`, `PRONOUN`, `ZERO_SUBJECT` y `NOUN_PHRASE`.
- Resolución de sujetos elididos: marca el verbo que porta el sujeto cero y lo enlaza con su antecedente.
- Enlace explícito antecedente–mención con puntuación (`links`), además de los clústeres.
- Procesamiento por lotes de múltiples textos en una sola llamada y ejecución en GPU (`device=0`).
- Manejo de documentos largos mediante ventanas automáticas (hasta ~2.500 tokens por pasada).
- Parámetros ajustables: `threshold` (umbral mínimo de mención, por defecto 0,3) y `margin` (margen para enlaces más conservadores, por defecto 0,0).
- No se documentan capacidades de generación de texto, razonamiento general, código, matemáticas, visión, audio, tool calling ni agentes; el modelo es un extractor especializado, no un LLM generativo.

## Casos de uso

- Resolución de correferencia en pipelines de extracción de información: el modelo se inserta tras un NER o un extractor de relaciones para consolidar menciones dispersas de la misma entidad en un único nodo del grafo de conocimiento, usando los clústeres y los enlaces antecedente–mención.
- Anonimización y seudonimización de textos: al agrupar todas las menciones de una persona (incluidos pronombres y sujetos elididos), se puede sustituir cada entidad por un identificador consistente sin dejar pistas de género o número que permitan reidentificarla.
- Análisis de noticias y seguimiento de entidades: con 71,3 % de anáforas resueltas correctamente en noticias eslovenas de held-out, es adecuado para monitorizar apariciones de personas y organizaciones a lo largo de un artículo o de un corpus periodístico.
- Construcción de resúmenes y grafos de eventos: los enlaces permiten reconstruir qué entidad realiza cada acción en textos donde el sujeto se omite (*Tam sta odprla kavarno*), algo que un NER convencional no resuelve.
- Preprocesamiento para traducción o generación aumentada por recuperación (RAG): reescribir el texto sustituyendo pronombres y sujetos cero por su antecedente explícito mejora la calidad de sistemas posteriores que no modelan correferencia en esloveno.
- Enriquecimiento de bases de datos lingüísticas y anotación asistida: el modelo puede preanotar corpus eslovenos con clústeres de correferencia para revisión humana, reduciendo el coste de anotación manual en una tarea con pocos recursos.
- Moderación y análisis de conversaciones: agrupar menciones de personas y grupos en hilos multi-turno para detectar acoso dirigido a una misma víctima aunque se use solo pronombres o elipsis.

## Benchmarks y rendimiento

Resultados declarados por el autor en el leaderboard SloBench de correferencia en esloveno (81 documentos de test ocultos; métricas no verificadas de forma independiente según el model-index):

| Métrica | Precisión | Recall | F1 |
|---|---:|---:|---:|
| CoNLL score | — | — | **46,59** |
| MUC | 46,43 | 57,07 | 51,20 |
| B³ | 38,25 | 47,97 | 42,56 |
| CEAF-e | 44,31 | 47,81 | 45,99 |
| CEAF-m | 46,30 | 55,14 | 50,33 |
| BLANC | 31,26 | 44,28 | 36,63 |
| LEA | 33,89 | 42,49 | 37,71 |
| MOR | 70,68 | 63,69 | 67,01 |

Evaluación de anáforas en noticias eslovenas de held-out (148 artículos, 2.297 anáforas; configuración por defecto):

| Métrica | Valor |
|---|---:|
| Anáforas resueltas correctamente (sobre el total) | 71,3 % |
| Precisión cuando el modelo enlaza una anáfora | 77,7 % |
| Anáforas que el modelo enlaza | 91,8 % |
| Línea base (enlazar siempre a la mención anterior más cercana) | 33 % |
| CoNLL F1 (media de MUC, B³ y CEAF-e) | 57,4 |

## Requisitos de hardware

- VRAM estimada para inferencia: con ~307 M de parámetros en fp32, los pesos ocupan aproximadamente 1,2 GB; en fp16/bf16, alrededor de 0,6 GB. El repositorio completo pesa 1,3 GB.
- GPU recomendadas: cualquier GPU con al menos 2–4 GB de VRAM libre es suficiente; se ha probado ejecución en GPU mediante `device=0` en el pipeline. No se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: sí, por tamaño; la información no detalla modelos concretos, pero el rango de 2–4 GB de VRAM lo sitúa al alcance de GPUs de consumo modestas y de CPU.
- Opciones de despliegue: `transformers.pipeline` con `trust_remote_code=True` (vía recomendada por el autor), con las dependencias `gliner2==2.0.0`, `peft`, `transformers>=4.57,<5` y `torch 2.3–2.14`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rudar-gliner2-sl-coref` | ~307 M | ~2.500 tokens por pasada (ventanas) | Correferencia en esloveno | Apache 2.0 | Hugging Face |
| `martinkorelic/rudar-gliner2-sl-base` | no disponible | no disponible | Base GLiNER2 para esloveno | no disponible | Hugging Face |
| Otros sistemas de correferencia en esloveno del leaderboard SloBench | no disponible | no disponible | Correferencia en esloveno | no disponible | SloBench |

No se dispone en la información proporcionada de datos de parámetros, contexto o licencia de alternativas comparables de la misma categoría (correferencia multilingüe o en lenguas eslavas) que permitan una comparación cuantitativa rigurosa; los resultados del leaderboard SloBench son el único punto de referencia objetivo y corresponden al propio modelo.

## Limitaciones y advertencias

- Especialización monolingüe: solo esloveno (`sl`); no se ha entrenado ni evaluado para otros idiomas.
- Tarea única: no es un modelo generativo; no sirve para chat, razonamiento general, código ni matemáticas.
- Riesgo de error en la resolución: con un 71,3 % de anáforas resueltas correctamente en noticias de held-out, aproximadamente una de cada cuatro anáforas se resuelve mal; en dominios distintos de noticias el rendimiento puede degradarse.
- El CoNLL score de 46,59 en SloBench es moderado; los clústeres y enlaces deben tratarse como sugerencias sujetas a revisión en flujos de producción sensibles.
- Dependencia de código remoto: requiere `trust_remote_code=True` y ejecuta `modeling_rudar.py` y `pipeline_rudar.py` del repositorio; el autor recomienda fijar un commit con `revision="<commit hash>"` para evitar cambios inesperados.
- Uso incorrecto de la API: cargar los pesos con `GLiNER2.from_pretrained` directamente devuelve solo el etiquetador de menciones, sobre texto en minúsculas y con menor calidad; es necesario usar el pipeline.
- Dependencias versionadas de forma estricta (`gliner2==2.0.0`, `transformers>=4.57,<5`, `torch 2.3–2.14`); incompatibilidades de versión pueden romper el pipeline.
- Sesgos: no se documentan evaluaciones de sesgo; al ser un modelo entrenado sobre corpus eslovenos, puede heredar sesgos de representación de los datos de origen.
- Licencia Apache 2.0: permite uso comercial, pero no se ofrece garantía alguna sobre el rendimiento en dominios no evaluados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/martinkorelic/rudar-gliner2-sl-coref
- Modelo base: https://huggingface.co/martinkorelic/rudar-gliner2-sl-base
- Demo (Space): https://huggingface.co/spaces/martinkorelic/rudar-gliner2-sl
- Leaderboard SloBench (correferencia): https://slobench.cjvt.si/leaderboard/view/13
