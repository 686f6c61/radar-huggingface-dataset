# jersobh/epochdb-extractor

## Resumen

EpochDB Extractor es un modelo de reconocimiento de entidades nombradas (NER) publicado por el usuario jersobh en Hugging Face. Se trata de un ajuste fino de GLiNER, concretamente sobre el checkpoint `urchade/gliner_base`, orientado a la extraccion de entidades relevantes para el proyecto EpochDB. GLiNER es una familia de modelos de extraccion de informacion de tipo zero-shot que permite especificar las etiquetas de entidad en tiempo de inferencia, de modo que el modelo no queda restringido a un conjunto cerrado de clases.

El modelo emplea una arquitectura uni-encoder de tipo span con backbone DeBERTa-v3-base y se distribuye a traves de la libreria `gliner` con licencia Apache 2.0. El autor declara entrenamiento sobre ejemplos sinteticos en portugues, ingles y aleman, y define cuatro tipos de entidad: `person`, `organization`, `location` y `concept`. El repositorio ocupa aproximadamente 0,8 GB.

La relevancia de esta ficha es limitada en terminos de adopcion: el modelo registra cero descargas y cero likes en el momento de la consulta, y no se han publicado resultados de benchmarks. Debe distinguirse de otro modelo del mismo autor, `jersobh/epochdb-extractor-0.8b`, que es un ajuste fino de un modelo Qwen3.5-0.8B-Base con arquitectura hibrida Gated DeltaNet y que no comparte arquitectura ni proposito con el modelo descrito aqui.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Uni-encoder span GLiNER con backbone DeBERTa-v3-base |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en), portugues (pt), aleman (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio gestionado por la libreria `gliner`, tamano 0,8 GB) |

## Arquitectura y entrenamiento

El modelo sigue la formulacion de GLiNER: un unico encoder (uni-encoder) que procesa conjuntamente el texto y las etiquetas de entidad candidatas, y que puntua spans candidatos para asignarles una etiqueta. El backbone declarado es DeBERTa-v3-base. Esta formulacion permite NER de conjunto abierto, ya que las etiquetas se pasan como argumento en el momento de la inferencia (`labels=[...]`) en lugar de estar fijadas en la cabeza de clasificacion.

Segun la model card, el ajuste fino se realizo sobre ejemplos sinteticos en portugues, ingles y aleman. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO (poco habituales en tareas de token classification). Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Extraccion de entidades nombradas de conjunto abierto mediante etiquetas especificadas en inferencia.
- Tipos de entidad definidos por el autor: `person`, `organization`, `location` y `concept`.
- Extraccion de conceptos tecnicos y de producto (por ejemplo, EpochDB, HNSW, Rust, Parquet) bajo la etiqueta `concept`.
- Procesamiento multilingue en ingles, portugues y aleman.
- Salida con puntuacion de confianza por entidad (`score`), lo que permite aplicar umbrales.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Extraccion de entidades en documentacion tecnica: dado un texto sobre infraestructura de datos, el modelo puede etiquetar productos, tecnologias y organizaciones usando las etiquetas `concept` y `organization`, aprovechando el ajuste especifico sobre vocabulario del proyecto EpochDB.
- Enriquecimiento de registros de clientes o contactos: a partir de texto libre en portugues, ingles o aleman, el modelo identifica personas, empresas y ubicaciones para poblar campos estructurados.
- Preprocesado para pipelines de busqueda o grafos de conocimiento: las entidades extraidas con su etiqueta y score pueden alimentar la construccion de un grafo o un indice de recuperacion.
- Analisis de notas o actas multilingues: el soporte de tres idiomas permite procesar documentacion interna heterogenea sin cambiar de modelo por idioma.
- Filtrado y anonimizacion parcial: la deteccion de `person` y `organization` permite localizar menciones sensibles antes de publicar o compartir textos.
- Prototipado rapido de NER personalizado: al ser un modelo GLiNER, permite probar nuevas etiquetas sin reentrenar, lo que facilita experimentar antes de decidir un ajuste fino definitivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 0,8 GB y el backbone es DeBERTa-v3-base, por lo que la huella es moderada, pero no se confirma una cifra.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la informacion proporcionada.
- Opciones de despliegue: la libreria `gliner` (carga mediante `GLiNER.from_pretrained`). No se documentan opciones como vLLM, llama.cpp, Ollama o TGI para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tipo de tarea | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| jersobh/epochdb-extractor | GLiNER uni-encoder, DeBERTa-v3-base | NER de conjunto abierto | en, pt, de | Apache 2.0 | Objeto de esta ficha; sin benchmarks publicados |
| urchade/gliner_base | GLiNER uni-encoder | NER de conjunto abierto | no disponible | no disponible | Modelo base del ajuste fino |
| jersobh/epochdb-extractor-0.8b | Hibrida Gated DeltaNet sobre Qwen3.5-0.8B-Base | Extraccion de entidades, parsing de relaciones y enrutado de consultas | no disponible | no disponible | Modelo distinto del mismo autor; no es un checkpoint GLiNER |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad en NER frente al modelo base ni frente a alternativas.
- Cero descargas y cero likes: no hay senales de validacion por parte de la comunidad.
- Entrenamiento sobre ejemplos sinteticos: el comportamiento en texto real puede diferir del observado en datos de entrenamiento, con riesgo de menor cobertura en dominios no representados.
- Conjunto de etiquetas orientado al proyecto EpochDB: aunque GLiNER permite etiquetas arbitrarias, el ajuste fino puede favorecer las cuatro clases declaradas.
- Cobertura linguistica limitada a ingles, portugues y aleman; el castellano no figura entre los idiomas declarados.
- Riesgo de alucinacion o de falsos positivos en la delimitacion de spans, inherente a los modelos NER; se recomienda calibrar el `threshold` (el ejemplo de la model card usa 0,5).
- No se documentan sesgos conocidos ni evaluaciones de robustez.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base `urchade/gliner_base`, cuya licencia no se detalla en la informacion disponible.
- No confundir con `jersobh/epochdb-extractor-0.8b`, que es un modelo diferente con otra arquitectura y otro proposito.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jersobh/epochdb-extractor
- Modelo base: https://huggingface.co/urchade/gliner_base
- Repositorio GLiNER: https://github.com/urchade/GLiNER
- Modelo relacionado del mismo autor (distinto): https://huggingface.co/jersobh/epochdb-extractor-0.8b
- Version GGUF del modelo relacionado: https://huggingface.co/jersobh/epochdb-extractor-0.8b-GGUF
