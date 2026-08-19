# cb-ai/onarex

## Resumen

Onarex es un modelo de extracción de información condicionada por ontología desarrollado por el usuario cb-ai. Combina reconocimiento de entidades nombradas (NER), extracción de relaciones (REL) y generación de embeddings de triples en una única arquitectura con trunks exclusivos para cada tarea. El modelo está diseñado para trabajar en escenarios zero-shot, donde el inventario de tipos de entidades y relaciones se proporciona en tiempo de inferencia mediante una ontología.

La arquitectura se basa en el encoder `answerdotai/ModernBERT-large` (hidden size de 1024) con una capa BiLSTM opcional, seguido de módulos separados para NER, relaciones y embeddings. El entrenamiento se realiza por fases: primero la rama de relaciones, luego la de NER y finalmente la de embeddings, lo que permite un ajuste progresivo del encoder. El checkpoint publicado corresponde a la fase `emb_only` con una métrica de selección `triple_emb_cosine` de 0,957874 en el paso 120000.

Onarex es relevante para investigadores que trabajan en extracción de información tipada y alineación de embeddings de triples, ya que ofrece un enfoque modular y condicionado por ontología que no requiere reentrenamiento para nuevos dominios. Sin embargo, es importante señalar que no existe un paquete Python público publicado y que el modelo no es un pipeline estándar de HuggingFace sin el código del repositorio de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-large (encoder) + BiLSTM + trunks exclusivos para NER, REL y triple embedding |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | pytorch_model.bin (state_dict completo) |

## Arquitectura y entrenamiento

Onarex utiliza un encoder compartido basado en ModernBERT-large, un modelo transformer moderno optimizado para eficiencia y longitud de contexto, aunque no se especifica la longitud exacta soportada. Sobre el encoder se aplica una capa BiLSTM opcional y, a continuacion, tres trunks exclusivos: uno para NER, otro para extraccion de relaciones y un tercero para generar embeddings de triples. Cada trunk opera de forma independiente, pero comparten la representacion del encoder.

El entrenamiento se realiza en tres fases secuenciales: primero `rel_only` (entrenamiento de la rama de relaciones con ajuste del encoder), luego `ner_only` (entrenamiento de la rama NER con encoder congelado) y finalmente `emb_only` (entrenamiento de la rama de embeddings con encoder congelado). Durante la fase de embeddings, los vectores de descripcion de las entidades y relaciones se generan mediante ModernBERT-pooled, que actuan como teacher embeddings. En inferencia, el modelo funciona en cascada: primero NER, luego REL y finalmente embeddings.

Una innovacion destacable es el condicionamiento por ontologia: tanto NER como REL puntuan las etiquetas en funcion de un inventario tipado proporcionado en tiempo de ejecucion, lo que permite adaptar el modelo a nuevos dominios sin reentrenamiento.

## Capacidades

- Reconocimiento de entidades nombradas (NER) condicionado por ontologia, es decir, los tipos de entidad se definen externamente y no estan fijos en el modelo.
- Extraccion de relaciones entre entidades, tambien condicionada por un inventario de relaciones proporcionado en inferencia.
- Generacion de embeddings de triples (sujeto, relacion, objeto) que pueden utilizarse para tareas de alineacion o comparacion semantica.
- Soporte zero-shot: no requiere ejemplos etiquetados para nuevos tipos de entidades o relaciones si se proporciona la ontologia.
- Pipeline de token-classification, adecuado para tareas de etiquetado secuencial.
- Capacidad multilingue: no disponible, el modelo esta entrenado exclusivamente con datos en ingles.

## Casos de uso

- Construccion de grafos de conocimiento en dominios especificos: dado un corpus tecnico y una ontologia definida por el usuario, Onarex puede extraer entidades y relaciones para poblar un grafo RDF o similar. Su condicionamiento por ontologia permite adaptarlo a dominios como biomedicina, legal o finanzas sin reentrenamiento.
- Enriquecimiento de bases de datos documentales: extraccion automatica de pares entidad-relacion-entidad desde documentos cientificos o tecnicos para indexar y recuperar informacion estructurada.
- Investigacion en alineacion de embeddings de triples: el modelo genera representaciones vectoriales de triples que pueden compararse entre si, util para tareas de deduplicacion o resolucion de entidades en pipelines de integracion de datos.
- Prototipado rapido de sistemas de extraccion de informacion: al ser condicionado por ontologia, un investigador puede probar diferentes esquemas de tipos y relaciones sin modificar los pesos del modelo.
- Analisis de contratos o documentos legales: con una ontologia que defina tipos como "parte contratante", "obligacion" o "fecha", el modelo puede extraer clausulas estructuradas para revision automatizada.
- Integracion en pipelines de NLP academicos: como modulo de extraccion de entidades y relaciones en sistemas de respuesta a preguntas o resumen, donde se requiera informacion estructurada intermedia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es `triple_emb_cosine` de 0,957874 en el paso 120000 durante la fase `emb_only`, que mide la similitud coseno entre los embeddings de triples generados y los teacher embeddings, pero no es comparable con benchmarks estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware en la documentacion del modelo. El checkpoint tiene un tamano de 2.3 GB en formato `pytorch_model.bin`, lo que sugiere un modelo con cientos de millones de parametros (estimacion orientativa: ~575 millones de parametros en float32, aunque no se confirma). Para inferencia, se recomienda:

- VRAM estimada: al menos 6-8 GB para cargar el checkpoint en float32; con cuantizacion (no disponible oficialmente) podria reducirse, pero no hay datos.
- GPU recomendadas: una GPU con 12 GB o mas (por ejemplo, RTX 3060, RTX 4070, A10) para inferencia comoda en batch pequeno.
- Opciones de despliegue: al no ser un pipeline estandar de HuggingFace, se requiere el codigo del repositorio Onarex. No se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos en la informacion proporcionada. La model card menciona la linea de trabajo de GLiREL y ModernBERT como referencias, pero no se ofrecen datos comparativos de rendimiento. Modelos alternativos en extraccion de relaciones condicionada por ontologia podrian ser GLiREL (citado) o REBEL, pero no se conocen sus resultados frente a Onarex.

## Limitaciones y advertencias

- Entrenamiento exclusivamente en ingles; el rendimiento en otros idiomas no esta garantizado.
- Requiere una ontologia o inventario de tipos de entidades y relaciones en tiempo de inferencia; sin ella, el modelo no puede operar.
- Errores en cascada: los fallos en la etapa NER se propagan a la extraccion de relaciones y a los embeddings, lo que puede degradar la calidad final.
- No es un pipeline estandar de HuggingFace; para usarlo es necesario instalar el codigo del repositorio Onarex, que no esta publicado como paquete PyPI.
- El checkpoint corresponde a la fase `emb_only`; si se necesita el modelo para tareas NER o REL puras, habria que cargar checkpoints de fases anteriores (no publicados en este repositorio).
- No se han publicado evaluaciones de sesgos, alucinaciones o robustez ante entradas adversariales.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias de soporte ni mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cb-ai/onarex
- Encoder base ModernBERT-large: https://huggingface.co/answerdotai/ModernBERT-large
- Referencia citada: GLiREL (no se proporciona enlace directo en la model card)
