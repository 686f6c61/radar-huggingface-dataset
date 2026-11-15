# Complexhibit-Project/complexhibit-atributos

## Resumen

Complexhibit-atributos es un modelo de clasificación de texto basado en XLM-RoBERTa large, desarrollado por el proyecto Complexhibit-Project para el ámbito de las humanidades digitales y la historia del arte. Su función concreta es asignar el rol o el tipo a entidades ya localizadas en catálogos de exposiciones de arte: determina si una persona es artista o comisaria, si una institución es museo o galería, o si una obra es pintura o escultura, entre otros atributos. Resuelve un problema específico del procesado de documentación artística: la desambiguación semántica de entidades en fichas catalográficas.

El modelo forma parte de un sistema de etiquetado en tres niveles, donde este ocupa el tercer y último eslabón. No localiza entidades ni las reconoce, sino que recibe entidades ya delimitadas por los niveles 1 y 2 y les asigna atributos concretos. Con 560 millones de parámetros y una ventana de contexto efectiva de aproximadamente 250 caracteres a cada lado de la entidad marcada, está especializado en fragmentos cortos de texto catalográfico en inglés y español.

Su relevancia radica en que aborda una tarea de nicho con un rendimiento medido sobre catálogos no vistos durante el entrenamiento, superando de forma consistente una línea base trivial. Es un ejemplo de ajuste fino de un modelo multilingüe grande para una tarea de extracción de información estructurada en un dominio muy concreto, con licencia MIT y pesos publicados en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa large) |
| Parametros totales | 560.392.682 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 250 caracteres de contexto a cada lado de la entidad (entrada por fragmento, no ventana de tokens documentada) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp16) |
| Idiomas soportados | en, es |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de XLM-RoBERTa large (Conneau et al., 2020), un transformer encoder multilingüe de 560 millones de parámetros, y se ajusta para una tarea de clasificación de texto multi-etiqueta condicionada por atributo. La entrada combina el nombre del atributo a predecir con el fragmento de texto donde aparece la entidad marcada entre `[E]` y `[/E]`, y la salida es una clase con formato `atributo=valor`. En el momento de la predicción se restringe la selección a las clases válidas para el atributo solicitado, ignorando el resto. Un único modelo cubre cinco atributos: `person.role`, `institution.type`, `institution.role`, `work.type` y `technique.type`.

El ajuste se realizó durante 6 épocas con una tasa de aprendizaje de 2·10⁻⁵, conservando el checkpoint con mejor resultado en el conjunto de validación. Los datos de entrenamiento proceden del gold standard del proyecto Complexhibit: 100 catálogos de exposiciones de arte contemporáneo en inglés y español, anotados manualmente por especialistas del dominio con la herramienta GATE conforme a un manual de etiquetado. El reparto fue de 80 catálogos para entrenamiento, 10 para validación y 10 para prueba, dividido por catálogos completos para evitar filtraciones. Los pesos se guardan en fp16. No se documenta el uso de RLHF ni DPO, al tratarse de una tarea de clasificación supervisada.

## Capacidades

- Clasificación del rol de personas en catálogos de arte: artista, comisario, autor de texto, entre otros valores definidos en el manual de etiquetado.
- Clasificación del tipo de institución: museo, galería, fundación, etc.
- Clasificación del rol de instituciones en la exposición: organizadora, sede, prestadora, etc.
- Clasificación del tipo de obra: pintura, escultura, fotografía, etc.
- Clasificación del tipo de técnica o material.
- Procesamiento bilingüe inglés-español.
- Entrada condicionada por atributo: el mismo modelo resuelve cinco tareas distintas según el atributo solicitado en la entrada.
- Integración en pipeline de tres niveles junto a `complexhibit-nivel1` (localización de fichas y referencias a exposiciones) y `complexhibit-nivel2` (reconocimiento de entidades).
- No soporta tool calling, function calling, agentes, visión ni audio: es un clasificador de texto, no un modelo generativo.

## Casos de uso

- Catalogación automatizada de fondos documentales: dado un catálogo de exposición en PDF, el modelo asigna roles y tipos a las entidades previamente reconocidas, reduciendo el trabajo manual de indización en archivos y bibliotecas de arte.
- Enriquecimiento de registros RDF y datos enlazados: las etiquetas `atributo=valor` generadas pueden mapearse directamente a propiedades de un grafo de conocimiento, como el que el proyecto publica en Zenodo, para vincular personas, instituciones y obras con semántica explícita.
- Desambiguación de roles en fichas de obra: en una ficha donde aparecen varias personas e instituciones, el modelo distingue quién es el artista, quién el prestador y qué institución es la sede, a partir del contexto local de cada mención.
- Búsqueda facetada en colecciones digitales: los atributos asignados permiten construir filtros por tipo de obra, tipo de institución o rol de persona sin necesidad de metadatos estructurados previos.
- Investigación en humanidades digitales: análisis agregado de la composición de catálogos (proporción de pintura frente a fotografía, tipos de instituciones implicadas) a partir de las etiquetas generadas de forma sistemática.
- Preprocesado para pipelines de extracción de información: el modelo actúa como paso de tipado de entidades antes de tareas posteriores de resolución de entidades o de generación de resúmenes estructurados de exposiciones.
- Normalización de vocabularios en migraciones de catálogos: al asignar valores de un vocabulario controlado, facilita la homogeneización de registros heredados con criterios dispares.

## Benchmarks y rendimiento

Resultados de exactitud sobre las entidades de los 10 catálogos de prueba no vistos durante el entrenamiento, comparados con una línea base que asigna siempre el valor más frecuente de cada atributo:

| Atributo | Entidades evaluadas | Línea base | Este modelo |
|---|---|---|---|
| person.role | 611 | 0,82 | 0,94 |
| institution.type | 60 | 0,23 | 0,68 |
| work.type | 207 | 0,46 | 0,60 |
| technique.type | 182 | 0,22 | 0,54 |
| institution.role | 55 | 0,15 | 0,49 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que el modelo es un clasificador de dominio específico y no un modelo generativo de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en fp16 (tamaño del repo de pesos), más el overhead de activaciones y del tokenizador; en la práctica, entre 2 y 3 GB en fp16 y alrededor de 1 GB en cuantización de 8 bits.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema. El modelo es pequeño para los estándares actuales.
- Cabe holgadamente en GPU de consumo: sí, en cualquier GPU consumer con 4 GB o más de VRAM, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: transformers (librería nativa), text-embeddings-inference (el modelo declara compatibilidad con endpoints), vLLM no aplica de forma estándar a clasificadores, y llama.cpp/Ollama requerirían conversión a GGUF no documentada por el autor.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo y la longitud corta de las entradas (fragmentos de unos 500 caracteres), se espera un throughput alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Complexhibit-atributos | 560 M | 250 caracteres por lado | Clasificación de atributos de entidades en catálogos de arte (en/es) | MIT | Hugging Face |
| XLM-RoBERTa large (base) | 560 M | 512 tokens | Modelo multilingüe de propósito general; requiere ajuste para esta tarea | MIT | Hugging Face |
| complexhibit-nivel2 | no disponible | no disponible | Reconocimiento de entidades en catálogos de arte | no disponible en la información | Hugging Face |
| complexhibit-nivel1 | no disponible | no disponible | Localización de fichas de obra y referencias a exposiciones | no disponible en la información | Hugging Face |

La comparación más directa es con el modelo base XLM-RoBERTa large sin ajustar, que no resuelve esta tarea sin un ajuste específico. No se dispone de datos de rendimiento de modelos alternativos de terceros sobre el mismo conjunto de evaluación, por lo que no es posible una comparación cuantitativa con clasificadores externos.

## Limitaciones y advertencias

- El modelo se ha entrenado con catálogos de arte contemporáneo en inglés y español y está pensado para la parte catalográfica (fichas de obra); su rendimiento con ensayos o crítica de arte no se ha evaluado sistemáticamente.
- Los valores poco frecuentes en el corpus (prestador, comisario, editor, etc.) se reconocen peor por falta de ejemplos, lo que se refleja en exactitudes bajas en atributos como `institution.role` (0,49) y `technique.type` (0,54).
- El resultado depende críticamente de que los niveles 1 y 2 hayan delimitado correctamente la entidad; errores en la localización o el reconocimiento previos degradan la clasificación.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de asignación errónea de etiquetas cuando el contexto es ambiguo o escaso.
- Las etiquetas siguen los criterios del manual de etiquetado del proyecto; los resultados deben interpretarse conforme a ese manual y no como una taxonomía universal.
- Los textos íntegros de los catálogos no se distribuyen por derechos de autor, lo que limita la reproducibilidad exacta de la evaluación.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones de los datos de entrenamiento subyacentes, no distribuidas.
- El modelo no es generativo: no puede producir texto, razonar de forma multi-paso ni gestionar conversaciones; su uso fuera de la clasificación de atributos no está soportado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Complexhibit-Project/complexhibit-atributos
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Nivel 1 del sistema: https://huggingface.co/Complexhibit-Project/complexhibit-nivel1
- Nivel 2 del sistema: https://huggingface.co/Complexhibit-Project/complexhibit-nivel2
- Repositorio de código en GitHub: https://github.com/Complexhibit-Project/Automatic-Tagged-System
- Anotaciones y grafo RDF en Zenodo: https://doi.org/10.5281/zenodo.24199594
- Paper de XLM-RoBERTa (Conneau et al., 2020): no disponible en la información proporcionada
