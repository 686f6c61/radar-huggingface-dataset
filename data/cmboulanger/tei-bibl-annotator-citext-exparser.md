# cmboulanger/tei-bibl-annotator-citext-exparser

## Resumen

El modelo `cmboulanger/tei-bibl-annotator-citext-exparser` es un ajuste fino de tipo LoRA sobre el modelo base `Qwen/Qwen2.5-3B-Instruct`, con los pesos del adaptador fusionados en el modelo final. Su función es anotar citas bibliográficas en texto plano con marcado TEI XML en línea, reproduciendo el texto de entrada de forma exacta e insertando etiquetas alrededor de los segmentos que portan estructura bibliográfica (autor, título, fecha, editorial, etc.). No parafrasea ni normaliza el contenido; la salida es únicamente la cita etiquetada, sin declaración XML ni elemento envolvente.

El modelo está entrenado con citas procedentes de notas al pie de publicaciones de sociología jurídica, mayoritariamente en alemán y algunas en inglés, donde aparecen formas abreviadas y anafóricas (p. ej., «Id.», «ibid.», nombres de casos ya introducidos) mezcladas con el texto del autor, lo que supone un reto mayor que las entradas limpias de una lista de referencias. Está orientado a tareas de extracción de información y anotación estructural en el ámbito de las humanidades digitales y la publicación académica.

La relevancia actual del modelo radica en su especialización para un dominio concreto (sociología jurídica) y en su capacidad para manejar citas complejas y contextuales, algo que los modelos generalistas suelen resolver con menor precisión. Al estar basado en Qwen2.5-3B-Instruct, hereda una arquitectura transformer de 3.000 millones de parámetros, con soporte multilingüe (alemán e inglés en este ajuste) y compatibilidad con el ecosistema de Transformers y Text Generation Inference.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-3B-Instruct) con adaptador LoRA fusionado |
| Parametros totales | 3.085.938.688 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Aleman (de), ingles (en) |
| Licencia | qwen-research (otra) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-3B-Instruct`, un transformer autoregresivo de 3.000 millones de parámetros con atención causal y tokenización BPE. Sobre esta base se aplicó un ajuste fino mediante LoRA (Low-Rank Adaptation) y posteriormente se fusionaron los pesos del adaptador en el modelo base, de modo que el checkpoint final es un modelo denso estándar. La tarea de entrenamiento consiste en transformar una cita bibliográfica en texto plano en la misma cita con etiquetas TEI XML insertadas en los intervalos correspondientes (autor, título, fecha, editorial, etc.), manteniendo el texto original sin alteraciones.

Los datos de entrenamiento provienen de dos corpus: `citext-tei-enriched` y `exparser-tei`. Las divisiones son las siguientes: entrenamiento con 16.279 registros distribuidos en 418 documentos, desarrollo con 2.144 registros en 14 documentos y prueba con 2.147 registros en 17 documentos. Las citas proceden de notas al pie de artículos de sociología jurídica, con predominio del alemán y presencia de inglés. No se menciona el uso de RLHF ni DPO; el entrenamiento es de tipo supervisado con pares entrada-salida. La innovación técnica principal reside en la capacidad de reproducir exactamente el texto de entrada, lo que exige una precisión de copia y una inserción de etiquetas sin desviaciones léxicas.

## Capacidades

- Anotación de citas bibliográficas con marcado TEI XML en línea, identificando autor, título, fecha, editorial y otros elementos estructurales.
- Reproducción exacta del texto de entrada: no hay paráfrasis ni normalización; la salida es una copia literal con etiquetas insertadas.
- Manejo de citas anafóricas y abreviadas típicas de notas al pie académicas (p. ej., «Id.», «ibid.», referencias a casos ya citados).
- Capacidad de distinguir la cita del texto circundante en contextos donde la cita está integrada en la prosa del autor.
- Generación de texto en alemán e inglés, heredada del modelo base Qwen2.5-3B-Instruct.
- Compatibilidad con la librería Transformers y con Text Generation Inference (TGI), lo que facilita su despliegue en entornos de producción.

## Casos de uso

- Digitalización de bibliografías académicas: el modelo puede convertir listas de referencias o notas al pie en documentos XML TEI estructurados, listos para su inclusión en repositorios digitales o publicaciones electrónicas.
- Conversión de notas al pie en revistas de sociología jurídica: dado su entrenamiento específico, puede procesar citas complejas con formas anafóricas y mezcladas con prosa, algo que los anotadores genéricos suelen fallar.
- Preparación de corpus para minería de texto y análisis bibliométrico: la salida TEI permite extraer automáticamente autores, títulos y fechas para estudios de redes de citación.
- Integración en pipelines de publicación académica: el modelo puede usarse como paso previo a la validación editorial, generando el marcado estructural que luego puede revisarse manualmente.
- Análisis de citaciones en documentos jurídicos: permite identificar referencias legales y bibliográficas en sentencias o escritos, facilitando su indexación y búsqueda.
- Enriquecimiento de metadatos en bibliotecas digitales: a partir de citas sueltas, se pueden generar registros estructurados en TEI para su incorporación a catálogos o bases de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente muestra una evaluación de cordura sobre la partición de desarrollo, con 300 ejemplos, donde se indica si el parseo fue exitoso y si hubo coincidencia exacta (`exact_match`). No se proporcionan métricas agregadas (precisión, recall, F1) ni comparaciones con otros modelos.

## Requisitos de hardware

- Al tratarse de un modelo de aproximadamente 3.000 millones de parámetros, la VRAM necesaria para inferencia en precisión FP16 ronda los 6 GB, y en cuantización de 4 bits puede reducirse a unos 2-3 GB.
- Se puede ejecutar en GPUs de consumo como RTX 3060, RTX 4060 o superiores, siempre que se utilice cuantización o técnicas de offloading.
- Para despliegue en producción son adecuadas GPUs como A10, A100 o H100, dependiendo del volumen de peticiones.
- El modelo es compatible con las principales herramientas de inferencia: vLLM, llama.cpp, Ollama y Text Generation Inference (TGI), esta última mencionada en las etiquetas del repositorio.
- No se proporcionan datos de latencia ni throughput específicos.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma tarea de anotación TEI de citas bibliográficas. El modelo es un ajuste fino especializado sobre Qwen2.5-3B-Instruct, por lo que una comparación con el modelo base es posible en términos de capacidades generales, pero no en la tarea específica. No se han encontrado alternativas públicas que realicen exactamente la misma función con el mismo nivel de especialización.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con citas de sociología jurídica, mayoritariamente en alemán y con algo de inglés. Su rendimiento fuera de este dominio o en otros idiomas puede degradarse significativamente.
- La evaluación sobre la partición de desarrollo muestra que la coincidencia exacta no es perfecta; algunos ejemplos presentan discrepancias en el etiquetado, por lo que es necesaria una revisión humana en aplicaciones críticas.
- La licencia `qwen-research` puede restringir el uso comercial, ya que la licencia original de Qwen para investigación no permite explotación comercial sin autorización expresa. Se debe verificar el texto completo de la licencia.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado sobre un corpus académico concreto, puede heredar sesgos de género, geográficos o de escuela teórica presentes en las fuentes.
- El modelo no genera citas nuevas; solo anota las que recibe. No es adecuado para tareas de generación bibliográfica o resumen.
- La longitud de contexto no está especificada en la documentación; se recomienda no superar las longitudes típicas del modelo base (32K tokens) para evitar degradación.

## Enlaces

- Repositorio HuggingFace: [cmboulanger/tei-bibl-annotator-citext-exparser](https://huggingface.co/cmboulanger/tei-bibl-annotator-citext-exparser)
- Modelo base: [Qwen/Qwen2.5-3B-Instruct](https://huggingface.co/Qwen/Qwen2.5-3B-Instruct)
- Demo en HuggingFace Spaces: [cmboulanger/tei-bibl-annotator-demo](https://huggingface.co/spaces/cmboulanger/tei-bibl-annotator-demo)
- Repositorio de entrenamiento: [github.com/cboulanger/tei-annotation-model](https://github.com/cboulanger/tei-annotation-model)
