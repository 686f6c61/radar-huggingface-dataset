# France-ML/French-semantic-engine

## Resumen

French-semantic-engine es un sistema de calidad semantica para corpus en frances publicado por la organizacion France-ML en Hugging Face, con licencia Apache 2.0 y etiqueta de pipeline `sentence-similarity`. No es un modelo generativo ni un unico checkpoint, sino un motor de dos etapas orientado a la limpieza, deduplicacion y verificacion de datasets en frances: la etapa 1 (`France-ML/french-semantic-stage1`) es un modelo de embeddings basado en SentenceTransformer que actua como generador de candidatos sobre un indice vectorial tipo FAISS; la etapa 2 (`France-ML/french-semantic-stage2`) es un clasificador de pares que decide entre `SAME` y `DIFFERENT`.

El problema que resuelve es concreto: en los corpus de entrenamiento, la mayoria de los problemas no son duplicados exactos, sino casi duplicados y parafrasis que difieren en un detalle critico (un numero, una negacion, una fecha, una unidad, un rol). La similitud lexica y la similitud puramente vectorial tienden a considerar equivalentes frases que no lo son, lo que introduce ruido y contradicciones en los datos de entrenamiento. La segunda etapa del motor esta disenada para capturar precisamente ese hueco.

Sobre la arquitectura interna no hay datos publicados en la informacion disponible: se desconoce el modelo base de cada etapa, el numero de parametros, la longitud de contexto y el volumen de datos de entrenamiento. El repositorio ocupa 0,7 GB en safetensors. El motor anade ademas "rule guards" deterministas que pueden forzar una decision mas conservadora que la similitud neural, con cuatro salidas posibles: `KEEP`, `DEDUP`, `CONFLICT` y `REVIEW`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de dos etapas: etapa 1, modelo de embeddings tipo SentenceTransformer; etapa 2, clasificador de pares (SAME / DIFFERENT); complementado con reglas deterministas (rule guards). Modelo base de cada etapa: no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors) |
| Idiomas soportados | frances (codigo `fr`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,7 GB |
| Libreria | sentence-transformers |
| Tarea declarada | sentence-similarity |
| Etiquetas adicionales | french, semantic-similarity, deduplication, paraphrase-detection, text-classification, endpoints-compatible |
| Descargas / likes | 0 / 1 |
| Fecha de creacion (metadatos) | 2026-10-06 |
| Ultima actualizacion (metadatos) | 2026-10-06 |

## Arquitectura y entrenamiento

El sistema se organiza como una cadena de procesamiento en cuatro fases descritas por el autor: el corpus frances entra en la etapa 1, que genera embeddings semanticos; esos vectores se indexan y consultan con FAISS u otro motor de busqueda vectorial para obtener pares candidatos de alta similitud; cada par candidato pasa a la etapa 2, un verificador de significado que emite `SAME` o `DIFFERENT`; finalmente, los rule guards aplican comprobaciones deterministas y producen la etiqueta final `KEEP`, `DEDUP`, `CONFLICT` o `REVIEW`. La etapa 1 se define explicitamente como generador de candidatos y no como decisor final, lo que traslada la responsabilidad de la decision a la etapa 2 y a las reglas.

Los rule guards cubren, segun la model card, numeros, fechas, unidades, palabras de negacion, cantidades, entidades nombradas y terminos direccionales, entre otras restricciones especificas de tarea. Esto permite que la decision final sea mas conservadora que la similitud neural por si sola, evitando deduplicar textos cuyo significado difiere. Los ejemplos recogidos en la model card ilustran el caso de uso: "Il a vendu 5 voitures" frente a "Il a vendu 50 voitures"; "Il n'est pas venu" frente a "Il est venu"; y permutaciones de roles como "Marie a donne le livre a Paul" frente a "Paul a donne le livre a Marie".

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal. Tampoco se documenta el modelo base sobre el que se construyen la etapa 1 y la etapa 2. El unico dato cuantitativo de despliegue es el tamano del repositorio (0,7 GB), que apunta a encoders compactos, pero no permite derivar el recuento de parametros con rigor.

## Capacidades

- Generacion de embeddings semanticos de frases en frances para busqueda vectorial y recuperacion de candidatos.
- Verificacion de equivalencia de significado entre pares de frases francesas, con salida binaria `SAME` o `DIFFERENT`.
- Deteccion de cambios de significado ocultos tras alta similitud lexica: negacion, numeros, fechas, cantidades, unidades, tiempo verbal, roles, direcciones, ubicaciones, causa-efecto y condiciones.
- Clasificacion final en cuatro etiquetas operativas: `KEEP`, `DEDUP`, `CONFLICT` y `REVIEW`.
- Deduplicacion exacta, casi duplicados y deteccion de parafrasis sobre corpus franceses.
- Deteccion de conflictos entre textos casi identicos que discrepan en un dato critico.
- Aplicacion de reglas deterministas sobre numeros, fechas, unidades, negacion, cantidades, entidades nombradas y terminos direccionales.
- Integracion con indices FAISS o motores de busqueda vectorial equivalentes para generacion de candidatos a escala.
- Compatibilidad declarada con endpoints gestionados de Hugging Face (`endpoints_compatible`).
- No hay evidencia de soporte de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni modo de pensamiento. Es un motor de similitud semantica, no un modelo de proposito general.

## Casos de uso

- Deduplicacion de corpus franceses a gran escala: la etapa 1 indexa el corpus con FAISS y recupera pares candidatos; la etapa 2 confirma equivalencia y emite `DEDUP`. Adecuado porque separa el coste de recuperacion (vectorial, barato) del coste de verificacion (clasificacion de pares, mas precisa).
- Limpieza de datos de entrenamiento antes de un preentrenamiento o ajuste fino en frances: elimina filas redundantes y marca como `CONFLICT` aquellas que se contradicen, reduciendo la duplicacion de tokens y el ruido contradictorio en el dataset.
- Deteccion de parafrasis para evaluacion o aumento de datos: identifica pares con el mismo significado redactados de forma distinta, util para construir conjuntos de parafrasis o para evaluar sistemas de resumen en frances.
- Deteccion de conflictos en bases de conocimiento o documentacion tecnica: frases casi identicas que difieren en una cifra, una fecha o una unidad se marcan como `CONFLICT` en lugar de deduplicarse silenciosamente, evitando consolidar informacion erronea.
- Control de calidad con revision humana asistida: la etiqueta `REVIEW` concentra los casos dudosos, de modo que el equipo humano solo inspecciona una fraccion pequena del corpus en lugar de revisarlo entero.
- Preprocesado de busqueda semantica en frances: los embeddings de la etapa 1 sirven como base para un indice de recuperacion sobre documentacion interna, FAQ o catalogo de contenidos.
- Agrupacion (clustering) de datasets franceses: los embeddings permiten agrupar documentos por tema o por similitud para analizar cobertura tematica y detectar subconjuntos sobrerrepresentados.
- Filtrado de ruido en corpus web raspados: descarta contenido repetido o casi repetido antes de incorporarlo a un pipeline de entrenamiento, con reglas que protegen los cambios de significado.
- Verificacion previa al ensamblado de datasets multiorigen: cuando se fusionan varios corpus, el motor detecta solapamientos entre ellos y conflictos de contenido antes de la mezcla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (ni MMLU, ni HumanEval, ni GSM8K, ni precision/recall sobre tareas de deduplicacion o parafrasis), y la busqueda web realizada no ha devuelto resultados relacionados con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio completo ocupa 0,7 GB en safetensors, lo que sugiere un consumo de memoria moderado para ambos modelos en precision nativa, pero el recuento de parametros no esta publicado.
- GPU recomendadas: al tratarse de modelos de embeddings y clasificacion de pares, no requiere GPU de centro de datos. Una GPU consumer de gama media o alta (por ejemplo, RTX 3060, RTX 4090) es suficiente en la mayoria de escenarios; la inferencia en CPU es viable para volumenes moderados.
- Cabe en GPU consumer: si. Por el tamano del repositorio (0,7 GB) y la naturaleza encoder del pipeline, es esperable que quepa en practicamente cualquier GPU consumer con 6-8 GB de VRAM o mas. Este extremo es una estimacion a partir del tamano del repositorio, no un dato publicado.
- Opciones de despliegue: la libreria declarada es sentence-transformers, por lo que la via natural es Python con esa libreria. Para la recuperacion de candidatos, FAISS u otro motor de busqueda vectorial. La etiqueta `endpoints_compatible` indica compatibilidad con los endpoints gestionados de Hugging Face. No se documenta soporte para vLLM, TGI, llama.cpp u Ollama; estos motores estan orientados a modelos generativos y no se anuncian como vias soportadas para este pipeline.
- Latencia y throughput estimados: no disponibles.
- Almacenamiento del indice vectorial: no disponible; depende del tamano del corpus y de la dimension de embedding, que no se publica.

## Comparativa con modelos similares

No hay datos de rendimiento publicados que permitan una comparativa cuantitativa. La comparacion se limita a caracteristicas declaradas.

| Modelo | Tipo | Idioma | Licencia | Enfoque de verificacion |
|---|---|---|---|---|
| France-ML/French-semantic-engine | Pipeline de embeddings + clasificador de pares + reglas | Frances | Apache 2.0 | Dos etapas con rule guards y cuatro etiquetas de salida |
| Modelos de embeddings de frases en frances (por ejemplo, variantes basadas en CamemBERT o modelos multilingues tipo E5) | Embeddings de frases | Frances o multilingue | Variable segun modelo | Similitud coseno en una sola etapa, sin verificacion de significado ni reglas |
| Modelos de deteccion de parafrasis o deduplicacion entrenados especificamente | Clasificacion de pares | Variable | Variable | Clasificacion directa de pares, normalmente sin etapa de recuperacion a escala |

La diferencia funcional declarada frente a un modelo de embeddings puro es que la etapa 1 no decide: solo propone candidatos. La decision de equivalencia recae en la etapa 2 y en las reglas deterministas, lo que permite detectar cambios de significado que la similitud coseno no distingue. No se dispone de parametros, contexto ni cifras de rendimiento de los modelos alternativos en la informacion proporcionada, por lo que no se incluyen en la tabla.

## Limitaciones y advertencias

- El unico idioma declarado es el frances (`fr`). No hay evidencia de soporte multilingue ni de transferencia a otras lenguas.
- No se publican parametros, contexto, datos de entrenamiento ni modelo base, lo que dificulta estimar coste, latencia y limites reales de longitud de entrada.
- No hay benchmarks ni evaluacion publicada. El rendimiento real en deduplicacion y deteccion de parafrasis no esta cuantificado.
- El modelo tiene 0 descargas y 1 like en el momento de la consulta y una unica fecha de creacion y actualizacion en los metadatos; no hay historial de mantenimiento ni evidencia de uso en produccion.
- Riesgo de alucinacion: no aplica en el sentido generativo, porque el sistema no genera texto libre; el riesgo equivalente es la clasificacion erronea de pares como `SAME` cuando el significado difiere, o como `DIFFERENT` cuando es el mismo.
- Las etiquetas dependen de umbrales de similitud y de reglas configurables que no se documentan en detalle; un ajuste inadecuado puede producir falsos positivos de deduplicacion (perdida de datos validos) o falsos negativos (duplicados que permanecen).
- La eficacia de los rule guards depende de que las categorias cubiertas (numeros, fechas, unidades, negacion, cantidades, entidades, direcciones) se adapten al dominio; dominios con jerga tecnica o formatos numericos poco habituales pueden no quedar cubiertos.
- La busqueda web realizada no ha devuelto ninguna fuente relevante sobre el modelo, por lo que toda la informacion procede de la model card y de los metadatos de Hugging Face.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, con obligacion de conservar avisos de copyright y licencia y de indicar los cambios realizados. No incluye concesion de derechos de marca.
- La model card no documenta sesgos, composicion del corpus de entrenamiento ni procedencia de los datos, por lo que no es posible evaluar sesgos sistematicos sobre el frances.
- El contenido de la model card consultada aparece truncado en la seccion final ("Built for Datasets"), de modo que puede existir informacion adicional no recogida en esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/France-ML/French-semantic-engine
- Etapa 1, recuperacion semantica: https://huggingface.co/France-ML/french-semantic-stage1
- Etapa 2, verificacion de significado: https://huggingface.co/France-ML/french-semantic-stage2
- Perfil de la organizacion: https://huggingface.co/France-ML
- Libreria sentence-transformers: https://www.sbert.net/
- FAISS, busqueda de similitud: https://github.com/facebookresearch/faiss

Nota: la busqueda web realizada devolvio unicamente resultados generales sobre el pais Francia (Wikipedia, France TV, franceinfo, france.fr) sin relacion con el modelo. No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a France-ML/French-semantic-engine.
