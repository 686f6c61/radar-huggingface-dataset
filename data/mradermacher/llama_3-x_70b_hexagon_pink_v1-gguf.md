# mradermacher/Llama_3.x_70b_Hexagon_Pink_V1-GGUF

## Resumen

Llama_3.x_70b_Hexagon_Pink_V1-GGUF es la version cuantizada en formato GGUF del modelo fusionado Nexesenex/Llama_3.x_70b_Hexagon_Pink_V1, publicada por mradermacher el 19 de marzo de 2025. Se trata de un merge de modelos de la familia Llama 3.x con 70.554.345.536 parametros totales, orientado a generacion de texto conversacional en ingles. La relevancia de esta publicacion no esta en el modelo base, sino en la disponibilidad de cuantizaciones estaticas en multiples niveles de calidad (desde Q2_K hasta Q8_0) que permiten ejecutar un modelo de 70B en hardware de consumo mediante llama.cpp y derivados.

El modelo original es un merge realizado con mergekit, una tecnica que combina los pesos de varios modelos de la misma arquitectura para agregar capacidades sin entrenamiento adicional. La model card no documenta que modelos concretos se fusionaron ni con que metodo (SLERP, TIES, DARE, etc.), lo que limita la trazabilidad tecnica. El repositorio GGUF ocupa 481,3 GB e incluye tanto cuantizaciones K-quant como IQ-quant, ademas de una variante con imatrix publicada en un repositorio separado.

La licencia no esta declarada en la informacion disponible, lo que constituye una advertencia importante para cualquier uso comercial. El modelo esta etiquetado unicamente para ingles y no se han publicado benchmarks ni resultados de evaluacion en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3.x, fusionada con mergekit) |
| Parametros totales | 70.554.345.536 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes imatrix en repositorio separado |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |
| Tamano del repositorio | 481,3 GB |
| Modelo base | Nexesenex/Llama_3.x_70b_Hexagon_Pink_V1 |
| Herramienta de fusion | mergekit |
| Compatibilidad | endpoints_compatible, transformers |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Llama 3.x con aproximadamente 70.000 millones de parametros. El modelo no ha sido entrenado desde cero por el autor de la fusion: se trata de un merge realizado con mergekit sobre pesos existentes. La model card no especifica el metodo de fusion empleado, los modelos de origen combinados, ni si hubo etapas posteriores de fine-tuning, RLHF o DPO. Tampoco se documenta el volumen de tokens de entrenamiento ni la composicion del dataset, ya que al ser una fusion no se realiza entrenamiento adicional sobre datos nuevos.

La innovacion tecnica de esta publicacion concreta es la cuantizacion. mradermacher aplica el pipeline de llama.cpp con `quantize_version: 2` y `output_tensor_quantised: 1`, generando cuantizaciones K-quant e IQ-quant estaticas. Las variantes IQ (como IQ4_XS) emplean cuantizacion con importancia de pesos y suelen ofrecer mejor relacion calidad/tamano que las K-quant de tamano equivalente. Adicionalmente, existe un repositorio hermano con cuantizaciones ponderadas/imatrix, que suelen preservar mejor la perplejidad a igual tamano. Los ficheros Q6_K y Q8_0 se distribuyen partidos en dos partes (`part1of2`, `part2of2`) y requieren concatenacion previa a su uso.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Llama 3.x fusionado.
- Razonamiento de proposito general y respuesta a instrucciones, segun el comportamiento tipico de los merges de la familia Llama 3.x (no verificado con benchmarks en la informacion disponible).
- Ejecucion local en CPU y GPU mediante llama.cpp y sus derivados, gracias al formato GGUF.
- Soporte de cuantizaciones desde 26,5 GB (Q2_K) hasta 75,1 GB (Q8_0), lo que permite ajustar el equilibrio calidad/memoria.
- Compatibilidad declarada con endpoints (`endpoints_compatible`) y con la libreria `transformers` a traves de los pesos originales.
- Soporte de tool calling, agentes, vision, audio o modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.

## Casos de uso

- Despliegue local de un modelo de 70B en estaciones de trabajo con GPU de gran memoria: las cuantizaciones Q4_K_M (42,6 GB) y Q5_K_M (50,1 GB) permiten ejecutar el modelo en GPUs como A100 80GB o en configuraciones multi-GPU, manteniendo una calidad cercana al modelo original.
- Experimentacion con merges de modelos: investigadores que quieran evaluar el comportamiento de fusiones de la familia Llama 3.x pueden usar estas cuantizaciones para pruebas rapidas sin descargar los 140 GB en safetensors del modelo base.
- Generacion de texto creativo y conversacional en ingles: el modelo esta etiquetado como `conversational` y puede emplearse en prototipos de chatbots o asistentes de escritura en entornos controlados.
- Inferencia en CPU con llama.cpp: la cuantizacion Q2_K (26,5 GB) permite cargar el modelo en servidores con RAM abundante y sin GPU, util para pruebas de concepto y entornos sin acelerador.
- Evaluacion comparativa de tecnicas de cuantizacion: al ofrecer Q2 a Q8 y una variante imatrix separada, el repositorio sirve para medir el impacto de la cuantizacion en perplejidad y calidad de generacion sobre un mismo modelo base.
- Integracion en pipelines de inferencia con endpoints compatibles: la etiqueta `endpoints_compatible` sugiere su uso en servicios que consumen APIs compatibles con OpenAI, aunque la licencia no declarada obliga a verificar los terminos antes de un despliegue en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion: Q2_K ~26,5 GB; Q3_K_S ~31,0 GB; Q3_K_M ~34,4 GB; Q3_K_L ~37,2 GB; IQ4_XS ~38,4 GB; Q4_K_S ~40,4 GB; Q4_K_M ~42,6 GB; Q5_K_S ~48,8 GB; Q5_K_M ~50,1 GB; Q6_K ~58,0 GB; Q8_0 ~75,1 GB.
- GPU recomendadas: A100 80GB o H100 80GB para cuantizaciones Q6_K y Q8_0 en una sola GPU; configuraciones multi-GPU (2x RTX 4090 de 24 GB, 2x A6000 de 48 GB) para Q4 y Q5.
- GPU de consumo: una RTX 4090 (24 GB) no puede alojar el modelo completo en ninguna cuantizacion; es necesario el offloading parcial a RAM o el uso de dos GPUs. Las cuantizaciones Q2_K y Q3_K_S son las unicas que se acercan al rango de 24-32 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. Para los pesos originales en safetensors, transformers, vLLM o TGI (no verificado para este merge concreto).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama_3.x_70b_Hexagon_Pink_V1-GGUF (este) | 70,55B | No disponible | GGUF | No disponible | Hugging Face, 16 descargas |
| Llama 3.1 70B Instruct (Meta) | 70,6B | 128K (segun model card oficial de Meta) | safetensors, GGUF | Llama 3.1 Community License | Amplia, multiples proveedores |
| Qwen2.5 72B Instruct | 72,7B | 128K (segun model card oficial) | safetensors, GGUF | Apache 2.0 (segun model card oficial) | Amplia |
| Mistral Large 2 | 123B | 128K (segun documentacion de Mistral) | API, pesos limitados | Mistral Research License | API y pesos bajo solicitud |

La comparativa se limita a caracteristicas estructurales: no hay datos de benchmarks de este merge que permitan comparar rendimiento real frente a los modelos citados. La ventaja principal de este repositorio es la disponibilidad de cuantizaciones GGUF listas para usar; su desventaja es la ausencia de licencia declarada y de documentacion sobre el proceso de fusion.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido. Es imprescindible contactar con el autor o consultar el modelo base antes de cualquier despliegue en produccion.
- Trazabilidad limitada: la model card no indica que modelos se fusionaron ni con que metodo de mergekit, lo que impide evaluar la procedencia de los pesos y posibles obligaciones de licencia heredadas.
- Solo ingles: el modelo esta etiquetado unicamente para `en`; el rendimiento en castellano u otros idiomas no esta garantizado.
- Sin benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni otras evaluaciones, por lo que la calidad real del merge es desconocida.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; sin evaluacion especifica no se puede cuantificar.
- Sesgos: no documentados; los merges heredan los sesgos de los modelos de origen, que no se especifican.
- Contexto desconocido: no se declara la longitud de contexto soportada, lo que complica el dimensionamiento de aplicaciones con ventanas largas.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M estan marcadas por el autor como de calidad inferior; para produccion se recomienda Q4_K_M o superior.
- Ficheros partidos: Q6_K y Q8_0 requieren concatenar las partes antes de su uso.
- Baja adopcion: 16 descargas y 1 like en la fecha de consulta, lo que reduce la probabilidad de encontrar soporte comunitario o reportes de errores.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Llama_3.x_70b_Hexagon_Pink_V1-GGUF
- Modelo base: https://huggingface.co/Nexesenex/Llama_3.x_70b_Hexagon_Pink_V1
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Llama_3.x_70b_Hexagon_Pink_V1-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Llama_3.x_70b_Hexagon_Pink_V1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
