# calon-ai/calon-0.6b

## Resumen

CalOn 0.6B es un modelo de extracción de información en inglés desarrollado por calon-ai, un encoder de 601.123.072 parámetros construido a partir de Qwen/Qwen3-0.6B mediante un ajuste fino supervisado. Resuelve tres tareas de extracción estructurada en modo zero-shot: reconocimiento de entidades nombradas (NER), extracción de relaciones y extracción de eventos, sin necesidad de ejemplos etiquetados del dominio del usuario.

La interfaz es declarativa: se envía un texto y una lista de tipos de entidad (o un diccionario `{tipo: descripción}`) y el modelo devuelve spans de caracteres con su tipo y una puntuación de probabilidad. En el caso de relaciones, la decisión se toma sobre pares ordenados de spans; en eventos, los disparadores son spans y los argumentos son pares (span del disparador, span del argumento) con roles definidos por el usuario.

Su relevancia actual está en ser una alternativa compacta y Apache 2.0 a los pipelines clásicos de IE (NER + clasificador de relaciones entrenados por dominio) y a los LLM generativos usados como extractores. Frente a estos últimos, ofrece decisiones tipadas calibradas con umbrales ajustables y un coste de inferencia propio de un modelo de 0,6B. Fue entrenado con 3,1 M de instancias de 84 fuentes y evaluado zero-shot en 40 benchmarks, según la model card y el paper asociado (arXiv:2610.17113).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer bidireccional derivado de Qwen3-0.6B, con capas de interacción entre tipos y spans candidatos |
| Parámetros totales | 601.123.072 (≈0,6B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 1.024 tokens de entrada; spans de hasta 32 tokens |
| Tipos de cuantización | No disponible (el autor solo publica pesos safetensors) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 (heredada del backbone Qwen3-0.6B) |
| Formato de pesos | safetensors |
| Librería de inferencia | `calon` (instalable desde el repositorio de GitHub del proyecto) |
| Tamaño del repositorio | 2,4 GB |
| Tarea declarada | Extracción de información: entidades, relaciones y eventos zero-shot |
| Modelo base | Qwen/Qwen3-0.6B |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen3-0.6B reconvertido en encoder bidireccional: no genera texto, codifica conjuntamente el texto de entrada y los tipos solicitados. Sobre esa codificación se añaden capas de interacción que permiten a las representaciones de los tipos y a los spans candidatos (o pares de spans) atenderse mutuamente. Cada candidato realiza después una única elección entre el conjunto de tipos solicitados y una clase nula; un span se emite como extracción cuando la probabilidad de no ser nulo supera el umbral. Las relaciones aplican el mismo esquema de elección sobre pares ordenados de spans de entidad, y los eventos combinan ambos niveles: los disparadores son spans y los argumentos son pares (disparador, argumento) con roles.

El entrenamiento usó 3,1 M de instancias procedentes de 84 fuentes que mezclan datos etiquetados por humanos, anotados por modelos de lenguaje y sintéticos. La evaluación es zero-shot sobre 40 benchmarks de entidades, relaciones y eventos. Un detalle técnico destacable es la calibración de umbrales: los valores por defecto se ajustaron sobre datos reservados de las fuentes de entrenamiento tras corregir la clase "none" infravalorada, y el usuario puede pasar `threshold=` para desplazar el equilibrio entre precisión y exhaustividad. El modelo expone puntuaciones de probabilidad por tipo o rol, lo que permite umbralizar por tipo en producción en lugar de aplicar un corte global.

## Capacidades

- Extracción de entidades zero-shot con tipos definidos en tiempo de inferencia, devolviendo spans de caracteres, tipo y `score`.
- Extracción de relaciones zero-shot sobre pares ordenados de entidades, con tipos de relación y descripciones opcionales.
- Extracción de eventos con esquema definido por el usuario: descripción del evento y roles con sus significados.
- Aceptación de tipos como lista de nombres o como diccionario `{nombre: descripción}`, lo que permite desambiguar tipos ambiguos con una frase de definición.
- Salida probabilística calibrada con clase nula explícita, apta para umbralizar por tipo y para modos de alta precisión o alta exhaustividad.
- Capacidad de operar sin ejemplos del dominio del usuario (zero-shot), sin few-shot prompting ni fine-tuning previo.
- No soporta tool calling, function calling, agentes, generación de texto libre, matemáticas, código ni visión: es un extractor discriminativo, no un modelo generativo.
- Monolingüe: únicamente inglés.

## Casos de uso

- Construcción y enriquecimiento de grafos de conocimiento: dado un corpus de documentos, extraer entidades y relaciones con un esquema propio y cargar los tripletas directamente en Neo4j u otro almacén, usando los `score` para filtrar por umbral.
- Cumplimiento normativo y revisión de contratos: definir tipos como "parte contratante", "fecha de vigencia", "jurisdicción" o "penalización" y extraer los spans con su probabilidad, revisando manualmente solo los casos cercanos al umbral.
- Monitorización de noticias y detección de eventos: esquemas de evento como "adquisición", "nombramiento" o "huelga", con roles (empresa, persona, cargo, fecha), para alimentar alertas o paneles de seguimiento.
- Detección de PII previa a un pipeline de LLM: extracción de tipos como "persona", "dirección", "número de teléfono" o "identificador fiscal" sobre texto en inglés para enmascarar antes de enviar el contenido a un modelo mayor.
- Estructuración de currículos y ofertas de empleo: relaciones "empleador", "puesto" y "fecha" sobre descripciones de trayectoria profesional, con salida lista para una base de datos relacional.
- Anotación asistida y weak supervision: preetiquetar corpus en inglés con un esquema nuevo y usar esas salidas como semilla para revisión humana o para entrenar un modelo específico de dominio.
- Enriquecimiento de metadatos para RAG: extraer entidades y relaciones de cada fragmento documental para adjuntar metadatos estructurados a los embeddings y permitir filtrado híbrido en la recuperación.
- Extracción de literatura científica: relaciones del tipo "entidad estudiada", "método" o "resultado" sobre abstracts en inglés, aprovechando que el modelo funciona sin datos del dominio biomédico.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card indica únicamente que el modelo se evaluó zero-shot en 40 benchmarks de entidades, relaciones y eventos, y remite al paper (arXiv:2610.17113) para los resultados, pero las cifras no están incluidas en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,2 GB solo para pesos, más el coste de activaciones (dependiente del batch y de los 1.024 tokens de entrada); en fp32, unos 2,4 GB para pesos.
- Cabe en cualquier GPU consumer con 6-8 GB o más: RTX 3060, RTX 4060, RTX 4070, RTX 4090. También es viable en CPU para volúmenes moderados, al tratarse de un encoder de 0,6B.
- GPU de datacenter (A100, H100, L40S) recomendables solo para procesar grandes lotes en paralelo; el modelo no las necesita por tamaño.
- Despliegue: la vía documentada es la librería `calon` sobre PyTorch (`CalOn.from_pretrained`). No hay soporte documentado para vLLM, TGI, llama.cpp, Ollama ni formatos GGUF, coherente con que no es un modelo generativo.
- Latencia y throughput: no disponibles. Como referencia estructural, al ser un encoder de 0,6B con entradas de hasta 1.024 tokens, el coste por documento depende del número de spans candidatos y de tipos solicitados, no solo de la longitud del texto.
- El repositorio ocupa 2,4 GB, lo que sugiere pesos en precisión alta además del tokenizer y ficheros auxiliares; conviene verificar el `dtype` antes de planificar memoria.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CalOn 0.6B | Encoder discriminativo especializado | 601 M | 1.024 tokens | NER + relaciones + eventos zero-shot | Apache 2.0 | HuggingFace + repo propio |
| Qwen3-0.6B (base) | LLM decoder generativo | 0,6B (según el dato del autor del fine-tune) | No disponible en la información | Generación, prompting para IE | No disponible en la información | HuggingFace |
| GLiNER (familia) | Encoder para NER zero-shot | No disponible | No disponible | NER zero-shot (no relaciones ni eventos de forma nativa) | No disponible en la información | HuggingFace |
| GLiREL | Modelo para relación zero-shot | No disponible | No disponible | Extracción de relaciones zero-shot | No disponible en la información | HuggingFace |

La comparación cuantitativa no es posible con los datos disponibles: no hay cifras de benchmarks de CalOn publicadas en la información proporcionada, ni se dispone de especificaciones verificadas de las alternativas. Cualitativamente, la diferencia principal frente a Qwen3-0.6B es que CalOn es discriminativo y devuelve decisiones tipadas calibradas en lugar de texto generado, lo que elimina el parseo de salidas y el riesgo de formato inválido. Frente a GLiNER, cubre además relaciones y eventos con una única arquitectura y un esquema declarativo de roles.

## Limitaciones y advertencias

- Solo inglés: no hay soporte multilingüe declarado, por lo que su uso sobre castellano no está validado y los resultados serían impredecibles.
- Límite de 1.024 tokens de entrada: documentos largos requieren segmentación, con el riesgo de perder relaciones que cruzan fragmentos.
- Spans de 32 tokens como máximo: entidades o argumentos más largos (descripciones extensas, cláusulas completas) no se pueden extraer.
- Las relaciones solo se extraen dentro de una misma entrada: no hay resolución de relaciones entre fragmentos ni agregación global.
- Gran parte de los datos de entrenamiento está anotada por modelos de lenguaje, según reconoce el autor: existe riesgo de heredar errores sistemáticos y sesgos de esos anotadores, y de degradación en dominios poco representados.
- Riesgo de alucinación estructural: el modelo puede emitir spans espurios con puntuaciones moderadas, especialmente con tipos ambiguos o descripciones pobres; el ajuste del umbral por tipo es imprescindible en producción.
- Los umbrales por defecto se calibraron sobre datos reservados de las fuentes de entrenamiento; en un dominio nuevo pueden estar desajustados y requerir recalibración con datos propios.
- Sin capacidad generativa, de tool calling ni de razonamiento multi-paso: no puede usarse como agente ni como sustituto de un LLM en tareas abiertas.
- Licencia Apache 2.0: permite uso comercial y modificaciones, con obligación de conservar avisos de licencia y atribución; conviene revisar también las condiciones del backbone Qwen3-0.6B.
- Modelo pequeño con 41 descargas y 13 likes en el momento de la consulta: ecosistema reducido, poca validación independiente y posible volatilidad de la API de la librería `calon`.
- La búsqueda web realizada no devolvió resultados relevantes sobre el modelo (los resultados obtenidos corresponden a bodegas homónimas), por lo que no hay fuentes externas independientes que contrasten las afirmaciones de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/calon-ai/calon-0.6b
- Paper "Calibrated Typed Decisions for Entity, Relation, and Event Extraction": https://arxiv.org/abs/2610.17113
- Repositorio de código: https://github.com/extraordinarylab/calon
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
