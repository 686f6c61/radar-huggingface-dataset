# mradermacher/xll-bills-qwen3.5-9b-GGUF

## Resumen

xll-bills-qwen3.5-9b-GGUF es la version cuantizada en formato GGUF del modelo thurstonpowers/xll-bills-qwen3.5-9b, un ajuste fino completo (full fine-tune) orientado a la extraccion de estructura en textos legislativos y proyectos de ley. El modelo parte de una base Qwen 3.5 de aproximadamente 9.000 millones de parametros y ha sido especializado mediante entrenamiento supervisado en tareas de procesamiento de legislacion en ingles. Esta version la publica mradermacher, un conocido empaquetador de cuantizaciones GGUF para la comunidad de inferencia local.

El interes de esta ficha reside en dos factores. Por un lado, el modelo original aborda un nicho concreto pero de alta demanda: la conversion de documentos legales no estructurados (proyectos de ley, enmiendas, articulado) en representaciones estructuradas y procesables. Por otro, la disponibilidad de cuantizaciones GGUF que van desde Q2_K (3,9 GB) hasta f16 (18 GB) permite desplegar el modelo en hardware de consumo, algo poco habitual en modelos especializados en dominios juridicos.

La licencia Apache 2.0 facilita su uso comercial sin las restricciones tipicas de otros modelos legales. No obstante, la informacion publica disponible es limitada: la model card del autor no detalla el dataset de entrenamiento, el numero de tokens utilizados ni resultados de benchmarks, por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen 3.5, segun el nombre del modelo; detalles no disponibles) |
| Parametros totales | 8.953.803.264 (aproximadamente 8,95 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base original en safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tune) del checkpoint thurstonpowers/xll-bills-qwen3.5-9b, que a su vez deriva de una base Qwen 3.5 de aproximadamente 9.000 millones de parametros. La arquitectura subyacente es un transformer decoder-only, aunque la informacion disponible no detalla configuracion de capas, cabezas de atencion ni mecanismos especificos (atencion lineal, decodificacion especulativa, etc.). El prefijo "xll" en el nombre sugiere un linaje de modelos orientados a tareas de extraccion de estructura en lenguaje legal, pero no se dispone de documentacion tecnica adicional.

En cuanto al entrenamiento, la model card solo indica que se trata de un full fine-tune especializado en "legal, bills, legislation, structure-extraction". No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si se emplearon tecnicas de RLHF o DPO, ni si hubo una fase de instruction tuning posterior. Tampoco se documentan innovaciones tecnicas destacables. Esta ausencia de informacion es una limitacion importante para evaluar la calidad y robustez del ajuste.

## Capacidades

- Extraccion de estructura en textos legislativos: identificacion de articulos, apartados, enmiendas y jerarquias dentro de proyectos de ley.
- Generacion de texto conversacional: el tag "conversational" indica soporte para dialogos multi-turno.
- Procesamiento de documentos legales en ingles: especializado en el dominio "bills" y "legislation".
- Formato de salida estructurado: orientado a producir representaciones procesables del articulado.
- Compatibilidad con endpoints: el tag "endpoints_compatible" sugiere integracion con APIs de inferencia estandar.
- Capacidades multilingues: limitadas al ingles segun la metadata.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision, audio o thinking mode: no disponible en la informacion proporcionada.

## Casos de uso

- Digitalizacion de proyectos de ley: el modelo puede recibir el texto plano de un bill y devolver una estructura jerarquica (titulo, secciones, articulos, enmiendas) que alimente bases de datos legislativas. Su especializacion en "structure-extraction" lo hace adecuado frente a modelos genericos.
- Seguimiento de enmiendas legislativas: en pipelines de monitorizacion parlamentaria, el modelo puede procesar enmiendas nuevas y extraer que articulo modifican y en que sentido, facilitando alertas automaticas a equipos juridicos.
- Construccion de bases de conocimiento legal: al estructurar el articulado en formato procesable, el modelo sirve como paso previo para sistemas de busqueda semantica o RAG sobre normativa.
- Asistencia a departamentos de compliance: equipos que necesitan mapear requisitos regulatorios pueden usar el modelo para descomponer textos legales en obligaciones concretas y rastreables.
- Investigacion academica en derecho computacional: investigadores que trabajan en NLP juridico pueden usar el modelo como baseline especializado para tareas de extraccion de estructura, comparandolo con modelos generalistas.
- Despliegue en entornos con recursos limitados: gracias a las cuantizaciones GGUF (desde 3,9 GB en Q2_K), el modelo puede ejecutarse en estaciones de trabajo sin GPU de datacenter, util para despachos pequenos o prototipos.
- Preprocesamiento en pipelines de traduccion juridica: estructurar primero el texto origen en ingles facilita la traduccion posterior manteniendo la jerarquia del articulado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones especificas de extraccion de estructura legal. Tampoco se dispone de comparaciones cuantitativas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion):
  - Q2_K (3,9 GB): aproximadamente 4-5 GB de VRAM.
  - Q4_K_M (5,7 GB): aproximadamente 6-7 GB de VRAM.
  - Q5_K_M (6,6 GB): aproximadamente 7-8 GB de VRAM.
  - Q6_K (7,5 GB): aproximadamente 8-9 GB de VRAM.
  - Q8_0 (9,6 GB): aproximadamente 10-11 GB de VRAM.
  - f16 (18 GB): aproximadamente 18-20 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB o superior para cuantizaciones Q4-Q5; RTX 4090 (24 GB) para Q8_0 o f16; A100/H100 para despliegues de alta concurrencia.
- Cabe en GPU de consumo: si, en cuantizaciones Q2_K a Q5_K_M en GPUs de 8-12 GB; Q6_K y Q8_0 requieren 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, vLLM o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xll-bills-qwen3.5-9b-GGUF | ~8,95 B | no disponible | Extraccion de estructura legal (ingles) | Apache 2.0 | GGUF en HF |
| Qwen 3.5 base (9B, referencia) | ~9 B | no disponible | Generico | segun version | HF |
| Modelos legales genericos (p. ej. variantes de Llama ajustadas en legal) | variable | variable | Legal general | variable | HF |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a parametros, licencia y disponibilidad; cualquier afirmacion sobre calidad relativa requeriria benchmarks no publicados.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre legislacion en ingles, puede reflejar sesgos del corpus juridico de origen (jurisdicciones concretas, terminologia anglosajona).
- Riesgo de alucinacion: alto en tareas de extraccion de estructura si el texto de entrada es ambiguo o contiene formatos atipicos; el modelo podria inventar articulos o jerarquias no presentes. Se recomienda validacion humana en contextos de produccion.
- Limitaciones de idioma: solo ingles; no apto para legislacion en castellano sin un ajuste adicional.
- Limitaciones de contexto: la longitud de contexto no esta documentada, lo que impide garantizar el procesamiento de bills extensos en una sola pasada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen 3.5 puede tener terminos adicionales que conviene verificar en su repositorio original.
- Caveat de produccion: la ausencia de benchmarks y de documentacion del dataset de entrenamiento dificulta estimar la fiabilidad; se recomienda evaluacion propia antes de desplegar.
- Las cuantizaciones Q2_K y Q3_K_M degradan la calidad; para tareas de extraccion precisa se recomienda Q4_K_M o superior.
- El modelo no ha sido validado por el autor de la cuantizacion; mradermacher solo empaqueta los pesos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/xll-bills-qwen3.5-9b-GGUF
- Modelo base original: https://huggingface.co/thurstonpowers/xll-bills-qwen3.5-9b
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#xll-bills-qwen3.5-9b-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
