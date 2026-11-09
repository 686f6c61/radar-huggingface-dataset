# adambuttrick/ror-set-point-set-model-mmbert-base

## Resumen

`ror-set-point-set-model-mmbert-base` es un modelo de extracción de características (feature-extraction) desarrollado por Adam Buttrick para una tarea muy concreta: el emparejamiento entre cadenas de afiliación institucional y registros de ROR (Research Organization Registry). No es un modelo generativo ni un chat: es un cross-encoder que recibe una cadena de afiliación junto con un conjunto de candidatos ROR y devuelve, para cada candidato, la probabilidad de que la cadena se refiera a esa organización. Se enmarca en la colección "ROR set point matching" del mismo autor, que incluye un retriever (E5-base) y variantes del matcher.

El modelo parte de `jhu-clsp/mmBERT-base`, un encoder multilingüe de la familia ModernBERT, y se afina en dos etapas sobre datos derivados de OpenAlex y de juicios de un modelo profesor. Su relevancia práctica está en la desambiguación de afiliaciones en bases bibliográficas: identificar correctamente la institución de un autor es un problema clásico de entity linking con alta ambigüedad léxica ("University of Tokyo" frente a "Tokyo University of Science", hospitales con nombre de universidad, etc.).

Con 306,9 millones de parámetros, licencia MIT y un rendimiento declarado de aproximadamente 130 cadenas por segundo en una NVIDIA H200, es un componente de infraestructura para pipelines de normalización de metadatos científicos, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en ModernBERT (mmBERT-base); encoder transformer con cabezal lineal de scoring por candidato |
| Parametros totales | 306.939.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (depende de la ventana de mmBERT-base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible explicitamente; el modelo base mmBERT-base es multilingue y el entrenamiento incluye datos sinteticos no latinos |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder construido sobre `jhu-clsp/mmBERT-base`. La entrada concatena la cadena de afiliación y los textos de todos los candidatos en un unico sequence: `[CLS] string [SEP] record 1 [SEP] record 2 [SEP] ...`. El encoder produce un vector por token y un cabezal lineal asigna una puntuacion a cada candidato a partir de la media de los estados de sus tokens. Una calibracion fija transforma la puntuacion en probabilidad mediante una sigmoide: `p = 1 / (1 + exp(-(a × score + b)))`. La respuesta final son todos los candidatos con `p >= 0.5`; una respuesta vacia indica que la cadena no nombra ninguna organizacion. Al leer todos los candidatos juntos, el modelo puede aprender reglas comparativas entre ellos (por ejemplo, etiquetar el hospital pero no la universidad que aparece en su nombre).

El pipeline de inferencia combina un retriever (`ror-set-point-retriever-e5-base-openalex-jev-distill`) que devuelve los 32 mejores registros, mas un indice lexico que anade sus 10 mejores no presentes, resultando en unos 37,5 candidatos en orden aleatorio. El entrenamiento se realizo en dos etapas: una primera epoca sobre 167.533 cadenas del config `teacher_judgments` (con targets probabilísticos del profesor, 0 para registros sin juicio) y 130.882 cadenas sinteticas no latinas; y una segunda etapa repetida cinco veces desde los pesos de la etapa 1 sobre 16.448 cadenas de `affiliations_unseen_institutions`, con etiquetas binarias. Se excluyeron cadenas del profesor que enlazan con registros reservados para evaluacion, cadenas identicas a las de evaluacion y cadenas sinteticas que nombran instituciones reservadas. Los negativos faltantes se sustituyeron por candidatos aleatorios no etiquetados (663 casos) para garantizar que cada etiqueta sea candidata durante el entrenamiento. No se menciona RLHF ni DPO; el aprendizaje es supervisado con destilacion de juicios de un modelo profesor.

## Capacidades

- Puntuacion de candidatos: asigna una probabilidad calibrada a cada registro ROR candidato para una cadena de afiliacion dada.
- Decision multi-etiqueta: devuelve todos los candidatos con probabilidad mayor o igual a 0,5, no solo el mejor.
- Deteccion de ausencia: una salida vacia indica que la cadena no identifica ninguna organizacion del registro.
- Razonamiento comparativo entre candidatos: al procesar todos los candidatos en una sola pasada, distingue entidades anidadas o lexicalmente solapadas.
- Manejo de texto no latino: el entrenamiento incluye 130.882 cadenas sinteticas no latinas, lo que sugiere cobertura de escrituras distintas del alfabeto latino.
- Extraccion de caracteristicas: la pipeline declarada es `feature-extraction`, por lo que puede emplearse para obtener representaciones contextuales.
- No soporta generacion de texto, tool calling, agentes ni modos de razonamiento extendido: es un modelo discriminativo de emparejamiento.

## Casos de uso

- Normalizacion de afiliaciones en bases bibliograficas: dado un registro de autor con su cadena de afiliacion, el modelo asigna el ROR correcto entre los candidatos recuperados, permitiendo enriquecer OpenAlex, Crossref o repositorios institucionales con identificadores persistentes.
- Desambiguacion de instituciones homonimas: distingue casos como hospitales que llevan el nombre de una universidad o variantes como "University of Tokyo" frente a "Tokyo University of Science" gracias al scoring comparativo entre candidatos en una sola pasada.
- Deduplicacion de registros de organizaciones: al puntuar pares cadena-registro se pueden detectar duplicados y fusionar entradas de un catalogo institucional.
- Enriquecimiento de pipelines de ciencia abierta: integrado tras el retriever E5, actua como etapa de reranking y verificacion antes de escribir el identificador ROR en un indice de publicaciones.
- Procesamiento por lotes de metadatos: con un rendimiento de unas 130 cadenas por segundo en una H200, es viable reprocesar corpus de cientos de miles de afiliaciones en horas.
- Validacion de calidad de datos de afiliacion: detectar cadenas que no corresponden a ninguna organizacion registrada (salida vacia) para marcarlas como revision manual.
- Extraccion de caracteristicas para clustering institucional: usar las representaciones contextuales del encoder para agrupar variantes de una misma institucion antes de la asignacion final.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son de exact match sobre el conjunto de test `affiliations_unseen_institutions`:

| Modelo | Exact match (affiliations_unseen_institutions) |
|---|---|
| ror-set-point-set-model-mmbert-base (este modelo, sin mascara) | 83,6 |
| ror-set-point-set-model-mmbert-base-openalex-jev-distill (con mascara de mencion) | 84,7 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el modelo no esta disenado para esas tareas. El autor reporta ademas un throughput de aproximadamente 130 cadenas por segundo en una NVIDIA H200.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 306,9 millones de parametros en fp32 los pesos ocupan unos 1,2 GB, y en fp16/bf16 alrededor de 0,6 GB, mas el coste de activaciones por lote.
- GPU recomendadas: el autor cita una NVIDIA H200 para el rendimiento de 130 cadenas por segundo; cualquier GPU con suficiente memoria para el modelo y el tamano de lote cabe en principio.
- GPU de consumo: por tamano, cabe en RTX 4090, RTX 3090 y tarjetas con 8-12 GB de VRAM o mas, aunque no se aportan mediciones en estas tarjetas.
- Opciones de despliegue: transformers (libreria declarada), con soporte de `text-embeddings-inference` y endpoints compatibles segun los tags; el autor proporciona `set_model.py`, que requiere solo torch, transformers, safetensors y huggingface_hub. No se mencionan vLLM, llama.cpp ni Ollama, y por tratarse de un cross-encoder con cabezal personalizado no son opciones directas.
- Latencia y throughput: aproximadamente 130 cadenas por segundo en una NVIDIA H200; el autor recomienda usar GPU para velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ror-set-point-set-model-mmbert-base | 306,9 M | Cross-encoder de emparejamiento ROR | no disponible | MIT | Hugging Face |
| ror-set-point-set-model-mmbert-base-mask | no disponible | Cross-encoder de emparejamiento ROR (variante con mascara de mencion) | no disponible | no disponible | Hugging Face |
| ror-set-point-set-model-mmbert-base-openalex-jev-distill | no disponible | Cross-encoder de emparejamiento ROR (destilado de juicios de OpenAlex/Jev) | no disponible | no disponible | Hugging Face |
| ror-set-point-retriever-e5-base-openalex-jev-distill | no disponible | Retriever de candidatos ROR | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos con modelos de terceros en la informacion proporcionada; las unicas alternativas documentadas son variantes del mismo autor dentro de la coleccion "ROR set point matching".

## Limitaciones y advertencias

- Modelo altamente especializado: no es un modelo generativo ni de proposito general; fuera de la tarea de emparejamiento afiliacion-ROR su utilidad es nula.
- Dependencia del retriever: la calidad final depende de que el retriever E5 y el indice lexico aporten el registro correcto entre los aproximadamente 37,5 candidatos; un fallo de recuperacion no puede corregirse en esta etapa.
- Riesgo de sesgo derivado de los datos: el entrenamiento usa juicios de un modelo profesor y datos sinteticos, lo que puede heredar sesgos de cobertura geografica o institucional de OpenAlex y del profesor.
- Riesgo de alucinacion en sentido estricto bajo, pero posibilidad de falsos positivos con probabilidad calibrada superior a 0,5 en cadenas ambiguas; el umbral fijo no es configurable segun la documentacion disponible.
- Incertidumbre sobre idiomas y contexto: la model card no documenta explicitamente la ventana de contexto efectiva ni la lista de idiomas soportados, aunque el modelo base mmBERT-base es multilingue.
- Restricciones de licencia: licencia MIT, permisiva para uso comercial, pero conviene verificar las licencias de los datos de entrenamiento y del modelo base mmBERT-base antes de un despliegue en produccion.
- Fecha de creacion y actualizacion poco habituales en los metadatos (2026), lo que puede indicar datos de catalogo inconsistentes; conviene validar la version concreta de los pesos antes de usarla.
- Requiere descargar textos de registros ROR desde el dataset `ror_records` para construir el diccionario de textos que consume `SetMatcher.from_pretrained`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adambuttrick/ror-set-point-set-model-mmbert-base
- Variante con mascara: https://huggingface.co/adambuttrick/ror-set-point-set-model-mmbert-base-mask
- Variante destilada de juicios OpenAlex/Jev: https://huggingface.co/adambuttrick/ror-set-point-set-model-mmbert-base-openalex-jev-distill
- Retriever E5-base destilado: https://huggingface.co/adambuttrick/ror-set-point-retriever-e5-base-openalex-jev-distill
- Retriever E5-base base: https://huggingface.co/adambuttrick/ror-set-point-retriever-e5-base
- Coleccion "ROR set point matching": https://huggingface.co/collections/adambuttrick/ror-set-point-matching-6ada8733c9e6fb018f382d0b
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/adambuttrick/ror-set-point-matching-train-validation-test
- Config `teacher_judgments` del dataset destilado: https://huggingface.co/datasets/adambuttrick/ror-set-point-matching-train-validation-test-openalex-jev-distill
- Repositorio GitHub del proyecto: https://github.com/adambuttrick/ror-set-point-matching
- Perfil del autor en GitHub: https://github.com/adambuttrick
- Modelo base mmBERT-base: https://huggingface.co/jhu-clsp/mmBERT-base
