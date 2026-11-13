# mradermacher/FinTermIE-EventPrice-KO-GGUF

## Resumen

FinTermIE-EventPrice-KO-GGUF es la version cuantizada en formato GGUF del modelo ThakiCloud/FinTermIE-EventPrice-KO, un modelo de extraccion de informacion financiera especializado en coreano. Lo publica mradermacher, un conocido creador de cuantizaciones GGUF para la comunidad de inferencia local, y esta pensado para ejecutarse con llama.cpp y herramientas compatibles sin necesidad de GPU de datacenter. El modelo base resuelve una tarea muy concreta: extraer eventos y precios (event-price) de documentos financieros coreanos, en particular de bonos convertibles (convertible bond) publicados en el sistema DART, el repositorio oficial de divulgacion de la autoridad financiera coreana.

Arquitectonicamente es un modelo transformer de tipo encoder con cabeza de span extraction (extraccion de fragmentos), con 277.451.520 parametros totales, lo que lo situa en la categoria de modelos base pequenos (del orden de BERT/RoBERTa). No es un modelo generativo: su salida es la identificacion de fragmentos de texto (spans) que corresponden a eventos y precios, con capacidad de abstencion (abstention) cuando el documento no contiene la informacion buscada. Esta especializacion lo aleja de los LLM generativos y lo acerca a los modelos de NLP clasicos afinados para una tarea.

Su relevancia es acotada pero clara: permite desplegar un extractor financiero coreano en entornos con recursos limitados, ya que las cuantizaciones ocupan entre 0,3 y 0,4 GB. La licencia MIT y el formato GGUF facilitan su integracion en pipelines de extraccion documental sin coste de licencia. La model card lo etiqueta explicitamente como experimental y no se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder con cabeza de span extraction (extraccion de fragmentos); detalles exactos no disponibles |
| Parametros totales | 277.451.520 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | coreano (ko) |
| Licencia | MIT |
| Formato de pesos | GGUF (original en safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo encoder afinado para extraccion de informacion mediante span extraction, una tecnica clasica de NLP en la que el modelo predice los indices de inicio y fin de los fragmentos relevantes dentro del texto de entrada. La tarea especifica es la extraccion de eventos y precios en documentos financieros coreanos, con enfasis en bonos convertibles del sistema DART. La model card menciona explicitamente la capacidad de abstencion, es decir, el modelo puede indicar que no hay informacion que extraer en lugar de forzar una respuesta.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO (poco probable en un modelo encoder de extraccion) ni innovaciones tecnicas adicionales. La cuantizacion la realiza mradermacher mediante conversion a formato GGUF con cuantizaciones estaticas; la model card indica que las cuantizaciones ponderadas con imatrix no estaban disponibles en el momento de la publicacion.

## Capacidades

- Extraccion de informacion financiera en coreano: identificacion de eventos y precios en documentos de divulgacion.
- Span extraction: devuelve fragmentos de texto (inicio y fin) en lugar de texto generado.
- Abstencion: puede indicar ausencia de informacion relevante en el documento.
- Procesamiento de documentos del sistema DART y de bonos convertibles.
- Soporte de tool calling / function calling: no disponible (no es un modelo generativo conversacional).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al coreano segun la model card.
- Capacidades especiales: ninguna adicional documentada (sin vision, audio ni modo thinking).

## Casos de uso

- Extraccion de eventos de bonos convertibles desde documentos DART: el modelo identifica en el texto los fragmentos que describen eventos corporativos y precios, adecuado por su entrenamiento especifico en este dominio y fuente documental.
- Pipeline de enriquecimiento de datos financieros: integrado como paso de extraccion tras el scraping de divulgaciones, convierte texto no estructurado en campos estructurados (evento, precio) para bases de datos.
- Monitorizacion regulatoria automatizada: procesa nuevas divulgaciones y extrae los eventos relevantes para alertar a analistas, gracias a la capacidad de abstencion que evita falsos positivos en documentos sin la informacion buscada.
- Despliegue en entornos con recursos limitados: con cuantizaciones de 0,3-0,4 GB, puede ejecutarse en CPU o GPU consumer para procesar lotes de documentos sin infraestructura dedicada.
- Analisis de historicos de emisiones: extraccion masiva de precios y eventos de bonos convertibles historicos para estudios cuantitativos o backtesting.
- Preprocesado para modelos generativos: usar la extraccion de spans como primer paso determinista y alimentar despues un LLM con los fragmentos ya aislados, reduciendo coste y alucinacion.
- Verificacion de datos de mercado: contrastar precios extraidos de documentos oficiales con bases de datos internas como control de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones; aproximadamente 0,3 GB para Q2_K a Q5_K_M, 0,4 GB para Q8_0 y 0,7 GB para f16.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en GPUs integradas.
- Opciones de despliegue: llama.cpp y herramientas basadas en el (Ollama, llama-cpp-python, servidores compatibles con endpoints). Al ser un modelo de extraccion, la integracion tipica es via llama.cpp como libreria mas que como servidor conversacional.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano (277 M de parametros) se espera una latencia muy baja en CPU y GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| FinTermIE-EventPrice-KO-GGUF | 277 M | no disponible | Extraccion de eventos/precios financieros en coreano | MIT | GGUF |
| ThakiCloud/FinTermIE-EventPrice-KO (base) | 277 M | no disponible | Igual, pesos originales | MIT | safetensors |
| Otros extractores financieros coreanos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos alternativos comparables en la misma tarea y dominio; la comparativa se limita al modelo base del que deriva esta cuantizacion.

## Limitaciones y advertencias

- Modelo marcado como experimental por el autor: no debe asumirse robustez en produccion sin validacion propia.
- Especializado exclusivamente en coreano y en el dominio financiero (bonos convertibles, DART); su rendimiento fuera de ese ambito es incierto.
- No es un modelo generativo: no responde preguntas ni mantiene conversaciones; solo extrae spans.
- Riesgo de alucinacion estructural: en tareas de span extraction el fallo tipico es la seleccion de fragmentos incorrectos, no la invencion de texto, pero la abstencion no garantiza precision.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad en la informacion disponible.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento originales.
- Cuantizaciones muy agresivas (Q2_K, Q3_K) pueden degradar la precision de la extraccion; para tareas de extraccion sensible se recomienda Q5_K_M o superior.
- No hay cuantizaciones ponderadas con imatrix disponibles segun la model card.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta: sin validacion de la comunidad.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/mradermacher/FinTermIE-EventPrice-KO-GGUF
- Modelo base: https://huggingface.co/ThakiCloud/FinTermIE-EventPrice-KO
- Pagina de descargas de mradermacher para este modelo: https://hf.tst.eu/model#FinTermIE-EventPrice-KO-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
