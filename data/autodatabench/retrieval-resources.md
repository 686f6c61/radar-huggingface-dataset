# AutoDataBench/Retrieval-resources

# AutoDataBench/Retrieval-resources

## Resumen

AutoDataBench/Retrieval-resources no es un modelo de lenguaje en sentido estricto, sino un repositorio de recursos que empaqueta, en un unico artefacto de 10 GB, el conjunto de datos y los modelos auxiliares necesarios para reproducir la tarea de recuperacion de informacion (retrieval) del benchmark AutoDataBench. Lo publica el equipo de AutoDataBench y esta pensado para que cualquiera pueda ejecutar dicho benchmark de forma totalmente local, sin depender de descargas externas ni de identificadores remotos de Hugging Face.

El contenido se organiza en dos bloques: por un lado, un pool de entrenamiento en `data/retrieval_v1/train.jsonl` con 818.182 filas que incluyen `query`, `positive_doc`, `hard_negative_docs` y `subset`; por otro, tres modelos auxiliares en `models/`: MiniLM-L6-H384-uncased como base de retrieval fija, Qwen3-4B-Instruct-2507 como modelo generativo invocable por el agente y Qwen3-Embedding-0.6B como modelo de embeddings tambien invocable por el agente. Se distribuye con un fichero `MANIFEST.sha256` con sumas de comprobacion de todos los ficheros.

Su relevancia es instrumental: sirve como material de referencia para el articulo AutoDataBench (arXiv:2609.40097), un testbed centrado en datos para acelerar la investigacion automatizada. No aporta pesos nuevos ni arquitecturas propias; su valor esta en fijar una configuracion reproducible de datos y modelos auxiliares. El repositorio acumula 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de recursos; contiene tres modelos de arquitectura transformer: MiniLM, Qwen3-Instruct y Qwen3-Embedding) |
| Parametros totales | no disponible como conjunto; componentes: 22,7 M (MiniLM-L6-H384), 4 B (Qwen3-4B-Instruct-2507), 0,6 B (Qwen3-Embedding-0.6B) |
| Parametros activos | no aplica (ninguno de los componentes es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada para el paquete; depende de cada modelo auxiliar |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible en la ficha; la model card indica que cada componente conserva la licencia de su modelo o dataset de origen |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Este repositorio no define ni entrena ninguna arquitectura propia. Se limita a distribuir pesos ya entrenados y un dataset de recuperacion. Los tres modelos incluidos son transformers densos: MiniLM-L6-H384-uncased es un encoder tipo BERT de 6 capas y 384 dimensiones ocultas que actua como base de retrieval fija (no se reentrena durante la tarea); Qwen3-4B-Instruct-2507 es un modelo generativo denso que el agente puede invocar; y Qwen3-Embedding-0.6B es un modelo de embeddings tambien invocable por el agente. Los detalles de entrenamiento de cada uno corresponden a sus respectivas model cards de origen, no a este repositorio.

El unico artefacto de datos propio es `data/retrieval_v1/train.jsonl`, con 818.182 filas que constituyen el pool fuente disponible para el agente de datos. Cada fila contiene una consulta, un documento positivo, documentos negativos duros y la etiqueta de subconjunto. Las evaluaciones fijas y fuera de distribucion (OOD) utilizan datasets estandar de MTEB, que no se duplican en el repositorio porque los descarga MTEB por su cuenta. No se documentan en la informacion proporcionada procesos de RLHF, DPO ni innovaciones tecnicas propias del paquete.

## Capacidades

- Distribucion de un pool de recuperacion de 818.182 filas con pares query-documento positivo y negativos duros etiquetados por subconjunto.
- Suministro de una base de retrieval fija (MiniLM-L6-H384-uncased) para calcular representaciones de consultas y documentos.
- Suministro de un modelo generativo invocable por agente (Qwen3-4B-Instruct-2507) para tareas de generacion dentro del flujo del benchmark.
- Suministro de un modelo de embeddings invocable por agente (Qwen3-Embedding-0.6B) para generar representaciones alternativas.
- Ejecucion completamente local del benchmark, redirigiendo los servidores de modelos a los directorios locales en lugar de a identificadores remotos.
- Verificacion de integridad de los ficheros distribuidos mediante `MANIFEST.sha256`.
- Integracion con suites de evaluacion MTEB para las particiones fija y OOD.
- No se documentan capacidades de vision, audio, tool calling nativo del paquete ni modo de razonamiento extendido propias de este repositorio.

## Casos de uso

- Reproduccion de resultados del benchmark AutoDataBench: copiando o enlazando `data/` y `models/` en el repositorio principal, se ejecuta la tarea de retrieval con exactamente los mismos datos y modelos auxiliares que los autores, lo que permite comparar variantes de agentes de datos sin variabilidad externa.
- Investigacion en recuperacion de informacion con negativos duros: el pool incluye `hard_negative_docs` por fila, lo que permite entrenar y evaluar rerankers o modelos de embeddings con ejemplos adversariales reales en lugar de negativos aleatorios.
- Desarrollo de agentes de datos: al exponer un modelo generativo y un modelo de embeddings como herramientas invocables, el repositorio sirve para probar estrategias de seleccion y sintesis de datos donde el agente decide que modelo llamar.
- Evaluacion fuera de distribucion: la configuracion de la tarea referencia suites MTEB concretas para las particiones fijas y OOD, de modo que se puede medir la generalizacion del pipeline mas alla del pool de entrenamiento.
- Despliegue en entornos aislados o sin conectividad: al estar todos los componentes empaquetados localmente, encaja en clusters sin salida a internet, cumpliendo requisitos de reproducibilidad de entornos academicos o regulados.
- Auditoria de integridad de artefactos: `MANIFEST.sha256` permite verificar que los ficheros descargados no han sido alterados, util en pipelines de CI que consumen recursos de investigacion.
- Linea base para experimentos de destilacion o compresion de embeddings: comparar Qwen3-Embedding-0.6B con MiniLM-L6-H384 sobre el mismo pool ofrece un eje de comparacion entre un modelo de 0,6 B y uno de 22,7 M bajo identicas condiciones de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente remite al articulo AutoDataBench (arXiv:2609.40097) para conocer la configuracion del benchmark, sin incluir tablas de resultados, metricas de recuperacion (nDCG, Recall@k, MRR) ni comparaciones numericas.

## Requisitos de hardware

- Tamano total del repositorio: 10,0 GB, dominado por los pesos de Qwen3-4B-Instruct-2507 en precision de 16 bits (aproximadamente 8 GB) y Qwen3-Embedding-0.6B (aproximadamente 1,2 GB), mas el pool de datos y MiniLM (decenas de MB).
- VRAM estimada para Qwen3-4B-Instruct-2507: en torno a 9-10 GB en bf16 contando cache KV moderada; alrededor de 3 GB con cuantizacion de 4 bits. Cabe en GPU de consumo como RTX 4090 (24 GB), RTX 4080 (16 GB) e incluso RTX 3060 de 12 GB en bf16 justo.
- VRAM estimada para Qwen3-Embedding-0.6B: aproximadamente 1,5-2 GB en bf16; se ejecuta con holgura en cualquier GPU de consumo e incluso en CPU para lotes pequenos.
- VRAM estimada para MiniLM-L6-H384-uncased: menos de 1 GB; puede ejecutarse en CPU sin problema.
- GPU recomendadas para el conjunto completo en paralelo: A100 40/80 GB, H100 o L40S, albergando el modelo generativo y el de embeddings en la misma maquina o en dos procesos separados.
- Opciones de despliegue: vLLM o TGI para Qwen3-4B-Instruct-2507 y Qwen3-Embedding-0.6B; llama.cpp y Ollama para el modelo generativo en cuantizacion GGUF; sentence-transformers para MiniLM y para el modelo de embeddings, dado que la libreria declarada del repositorio es sentence-transformers.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de una comparativa de rendimiento publicada en la informacion proporcionada. A modo de contexto estructural, se comparan los componentes auxiliares con alternativas habituales de su misma categoria, sin datos de rendimiento:

| Componente / alternativa | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Qwen3-4B-Instruct-2507 (incluido) | 4 B | no disponible en la informacion | no disponible | safetensors |
| Qwen3-Embedding-0.6B (incluido) | 0,6 B | no disponible en la informacion | no disponible | safetensors |
| MiniLM-L6-H384-uncased (incluido) | 22,7 M | no disponible en la informacion | no disponible | safetensors |
| Alternativas de embeddings de ~0,5-1 B | no disponible | no disponible | no disponible | no disponible |

Como paquete de recursos para un benchmark, no existe una alternativa directamente equivalente identificada en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo: no debe citarse ni desplegarse como si fuera un modelo de lenguaje con pesos propios. Es un contenedor de datos y modelos de terceros.
- Licencias heterogeneas: la model card advierte explicitamente de que los componentes de modelo y dataset conservan las licencias de sus origenes, y pide consultar las model cards y los datasets fuente antes de redistribuir o usar comercialmente. Esto obliga a revisar por separado la licencia de MiniLM, la de los modelos Qwen3 y la del pool de datos antes de cualquier uso en produccion.
- La licencia del repositorio figura como no disponible, lo que impide asumir permisos de uso derivados del propio paquete.
- Idiomas soportados no documentados en el repositorio; dependen de los modelos de origen.
- Las evaluaciones fijas y OOD dependen de datasets MTEB descargados externamente, por lo que la ejecucion "totalmente local" requiere preparar previamente esas descargas si el entorno no tiene red.
- Los pesos incluidos pueden quedar desactualizados respecto a las versiones mas recientes de los modelos originales en Hugging Face.
- Riesgo de alucinacion del componente generativo (Qwen3-4B-Instruct-2507) en tareas de generacion dentro del pipeline: no es una limitacion del repositorio, pero afecta a cualquier evaluacion que lo use como generador.
- Adopcion nula reportada (0 descargas, 0 likes), lo que implica ausencia de validacion externa de la comunidad sobre la integridad o el uso practico del paquete.
- No se documentan sesgos especificos del repositorio; los sesgos heredados provienen de los modelos y datasets de origen.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AutoDataBench/Retrieval-resources
- Repositorio AutoDataBench en GitHub: https://github.com/AutoDataBench/AutoDataBench
- Articulo AutoDataBench (arXiv:2609.40097): https://arxiv.org/abs/2609.40097
- Modelo original MiniLM-L6-H384-uncased: https://huggingface.co/nreimers/MiniLM-L6-H384-uncased
- Modelo original Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Modelo original Qwen3-Embedding-0.6B: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
