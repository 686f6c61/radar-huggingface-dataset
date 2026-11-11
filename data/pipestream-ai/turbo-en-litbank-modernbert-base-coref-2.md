# pipestream-ai/turbo-en-litbank-modernbert-base-coref-2

## Resumen

turbo-en-litbank-modernbert-base-coref-2 es un artefacto del zoo de modelos turboembed publicado por pipestream-ai. No se trata de un modelo generativo, sino de un componente especializado en resolución de correferencia (etiquetado como `COMPONENT_COREFERENCE_RESOLVER`, tipo `KIND_HEAD`) construido sobre el encoder answerdotai/ModernBERT-base. El bundle incluye el encoder completo (22 capas, dimensión oculta 768) más una cabeza denominada `coref` de tipo `HEAD_COREF_RANKER`, empaquetada en formato safetensors.

El modelo resuelve el problema de identificar qué menciones de un texto se refieren a la misma entidad (por ejemplo, enlazar pronombres y sintagmas nominales con sus antecedentes). Se ha afinado sobre LitBank, un corpus de anotación de correferencia derivado de textos de dominio público de Project Gutenberg, y reporta un conll_f1 de 0,7348 en test frente a una línea base de 0,3009.

Su relevancia es acotada pero concreta: ofrece un componente de correferencia listo para integrarse en pipelines de procesamiento de lenguaje natural en inglés mediante el zoo de turboembed, con licencia Apache-2.0 y pesos en safetensors verificables por digest. El repositorio ocupa 0,6 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base) con cabeza de ranking de correferencia |
| Parametros totales | no disponible (pesos del bundle: 599.500.288 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (la entrada se trunca a este limite) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`weights/model.safetensors`, `reference/reference.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT-base de 22 capas y dimensión oculta 768, sobre el que se añade una cabeza `coref` de tipo `HEAD_COREF_RANKER`. El bundle es completo: incluye tanto el encoder como la cabeza, además de `manifest.json`, `tokenizer.json` y un fichero de referencia en safetensors. El commit del encoder base referenciado es 8949b909ec900327062f0ebf497f51aef5e6f0c8.

El ajuste se realizó sobre LitBank (Bamman, Popat y Shen, NAACL 2019; Bamman, Lewke y Mansoor, LREC 2020), un corpus anotado con licencia CC-BY-4.0 sobre textos de dominio público de Project Gutenberg. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO (no procede en una tarea de etiquetado). La mejor época registrada es la 21. El modelo se distribuye a través del zoo de turboembed, que verifica tamaño y digests de cada fichero antes de su uso.

## Capacidades

- Resolución de correferencia en inglés: enlaza menciones de hasta 64 palabras con un máximo de 128 antecedentes candidatos.
- Etiquetado de menciones y agrupación en cadenas de correferencia (clusters).
- Procesamiento de entradas de hasta 8192 tokens, con truncado por encima de ese límite.
- Integración con el zoo de turboembed mediante identificador (`turbo-en-litbank-modernbert-base-coref-2`) y verificación de integridad por digest.
- No es un modelo generativo: no produce texto libre ni soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades de visión, audio ni modo de pensamiento.

## Casos de uso

- Preprocesamiento para sistemas de extracción de información: resolver cadenas de correferencia antes de alimentar un pipeline de relación de entidades, de modo que las menciones dispersas se consoliden en una única entidad.
- Resumen abstractivo y extractivo: sustituir pronombres por sus antecedentes para mejorar la coherencia de resúmenes generados aguas abajo, aprovechando la ventana de 8192 tokens para documentos largos.
- Traducción automática asistida: desambiguar pronombres en inglés antes de la traducción a idiomas con género gramatical marcado, reduciendo errores de concordancia.
- Análisis de narrativa y literatura: procesar textos de dominio público (el dominio de entrenamiento, LitBank) para estudios de entidades y personajes, donde el modelo está mejor alineado con la distribución de los datos.
- Construcción de grafos de conocimiento: enlazar menciones a entidades canónicas en documentos extensos como paso previo a la población de una base de conocimiento.
- Búsqueda y recuperación aumentada: normalizar consultas y pasajes resolviendo correferencias para mejorar la coincidencia semántica en motores de búsqueda documental en inglés.
- Moderación y análisis de contenido: identificar a qué entidad se refieren afirmaciones dispersas en un texto largo para tareas de atribución y verificación.

## Benchmarks y rendimiento

| Cabeza | Corpus | Metrica | Dev | Test | Baseline | Mejor epoca |
|---|---|---|---:|---:|---:|---:|
| coref | LitBank | conll_f1 | 0,6828 | 0,7348 | 0,3009 | 21 |

Los datos proceden del manifiesto del bundle (`head_provenance`). No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero de pesos ocupa aproximadamente 572 MB (599.500.288 bytes), por lo que la inferencia en precisión nativa requiere del orden de 1-2 GB de VRAM incluyendo activaciones para secuencias largas; no se dispone de cifras oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para el tamaño del modelo; para lotes grandes o secuencias de 8192 tokens se recomienda una GPU con 16 GB o más (RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, siempre que se ajuste el tamaño de lote a la memoria disponible.
- Opciones de despliegue: la librería indicada es `turboembed`; no se especifican integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| turbo-en-litbank-modernbert-base-coref-2 | no disponible (encoder 768 ocultas, 22 capas) | 8192 tokens | Correferencia (en) | Apache-2.0 | Hugging Face, zoo turboembed |
| answerdotai/ModernBERT-base | no disponible | no disponible en esta ficha | Encoder generalista | Apache-2.0 | Hugging Face |
| Modelos de correferencia basados en BERT/RoBERTa | no disponible | típicamente 512 tokens | Correferencia | variable | Hugging Face |

La comparación con alternativas específicas de correferencia no está disponible en la información proporcionada. El modelo base ModernBERT-base se incluye como referencia por ser el encoder sobre el que se construye.

## Limitaciones y advertencias

- Entrenado únicamente sobre LitBank; las métricas corresponden a su partición de test y pueden no generalizar a otros dominios o registros.
- Solo enlaza menciones de hasta 64 palabras con un máximo de 128 antecedentes candidatos; menciones más largas o cadenas con más candidatos quedan fuera de alcance.
- Solo inglés; la entrada se trunca a 8192 tokens, por lo que documentos más largos pierden información.
- No es un modelo generativo: no debe emplearse para tareas de generación de texto, razonamiento o agentes.
- Riesgo de sesgos heredados de los textos de dominio público de Project Gutenberg y del corpus LitBank, con posible infrarrepresentación de registros contemporáneos.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de errores de enlace (falsos positivos y negativos) en dominios distintos del literario.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las obligaciones de atribución derivadas del corpus LitBank (CC-BY-4.0) citadas por el autor.
- El repositorio no registra descargas ni likes, y la fecha de creación indicada es 2026-11-11, lo que conviene verificar antes de adoptarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pipestream-ai/turbo-en-litbank-modernbert-base-coref-2
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Corpus LitBank: https://github.com/dbamman/litbank
- README de LitBank (commit referenciado): https://github.com/dbamman/litbank/blob/3e50db0ffc033d7ccbb94f4d88f6b99210328ed8/README.md
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
