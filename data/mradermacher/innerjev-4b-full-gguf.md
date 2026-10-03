# mradermacher/InnerJev-4B-Full-GGUF

## Resumen

InnerJev-4B-Full-GGUF es una coleccion de cuantizaciones en formato GGUF generadas por mradermacher a partir del modelo jylin001206/InnerJev-4B-Full, un modelo de lenguaje de aproximadamente 4.841 millones de parametros (4,84B) orientado a toma de decisiones y entrenado mediante destilacion propia (self-distillation), segun las etiquetas declaradas por el autor original. El repositorio no contiene pesos nuevos ni un modelo distinto: reproduce el modelo base en una matriz de cuantizaciones que van desde Q2_K (2,2 GB) hasta f16 (9,8 GB), pensadas para su ejecucion en llama.cpp y entornos compatibles con GGUF.

Su relevancia practica es la de facilitar el despliegue local del modelo base en hardware de consumo: los ficheros Q4_K_S y Q4_K_M (3,0 y 3,2 GB) estan marcados por el cuantizador como "fast, recommended", mientras que Q6_K y Q8_0 se reservan para escenarios donde prima la fidelidad de los pesos. Adicionalmente, el repositorio incluye dos ficheros mmproj (0,5 GB en Q8_0 y 0,8 GB en f16) descritos como "multi-modal supplement", lo que apunta a que el modelo base incorpora un proyector multimodal, aunque la model card no detalla dicha capacidad.

La licencia es Apache 2.0 y el unico idioma declarado es el ingles. No se han publicado datos de contexto maximo, composicion del dataset, proceso de alineamiento ni resultados de benchmarks en la informacion disponible, por lo que cualquier evaluacion de calidad debe hacerse por prueba directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el autor no la especifica; los tags mencionan decision-making y self-distillation) |
| Parametros totales | 4.841.450.496 (4,84B, dato real de safetensors) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mmproj-Q8_0, mmproj-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repositorio de cuantizaciones); el modelo base publica pesos en safetensors para transformers |

Detalle de ficheros y tamanos declarados por el cuantizador:

| Fichero | Tipo | Tamano (GB) | Nota del autor |
|---|---:|---:|---|
| InnerJev-4B-Full.Q2_K.gguf | Q2_K | 2,2 | |
| InnerJev-4B-Full.Q3_K_S.gguf | Q3_K_S | 2,4 | |
| InnerJev-4B-Full.Q3_K_M.gguf | Q3_K_M | 2,6 | lower quality |
| InnerJev-4B-Full.Q3_K_L.gguf | Q3_K_L | 2,8 | |
| InnerJev-4B-Full.IQ4_XS.gguf | IQ4_XS | 3,0 | |
| InnerJev-4B-Full.Q4_K_S.gguf | Q4_K_S | 3,0 | fast, recommended |
| InnerJev-4B-Full.Q4_K_M.gguf | Q4_K_M | 3,2 | fast, recommended |
| InnerJev-4B-Full.Q5_K_S.gguf | Q5_K_S | 3,5 | |
| InnerJev-4B-Full.Q5_K_M.gguf | Q5_K_M | 3,6 | |
| InnerJev-4B-Full.Q6_K.gguf | Q6_K | 4,1 | very good quality |
| InnerJev-4B-Full.Q8_0.gguf | Q8_0 | 5,3 | fast, best quality |
| InnerJev-4B-Full.f16.gguf | f16 | 9,8 | 16 bpw, overkill |
| InnerJev-4B-Full.mmproj-Q8_0.gguf | mmproj-Q8_0 | 0,5 | multi-modal supplement |
| InnerJev-4B-Full.mmproj-f16.gguf | mmproj-f16 | 0,8 | multi-modal supplement |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica sobre la arquitectura del modelo base en la documentacion proporcionada. La model card de esta cuantizacion se limita a indicar que se trata de "static quants of https://huggingface.co/jylin001206/InnerJev-4B-Full", es decir, cuantizaciones estaticas generadas con el pipeline habitual de mradermacher (indicadores internos: quantize_version 2, output_tensor_quantised 1, convert_type hf). No se declara numero de tokens de entrenamiento, composicion del dataset ni si hubo fases de RLHF o DPO.

Las etiquetas del repositorio aportan las unicas pistas sobre el proceso de entrenamiento: "decision-making" como dominio de aplicacion y "self-distillation" como tecnica, ademas de un dataset asociado identificado como jylin001206/InnerJev-4B-Training-Data. La presencia de ficheros mmproj en el repositorio sugiere la existencia de un proyector multimodal en el modelo base, pero el autor no documenta que modalidades cubre ni como se entreno. Tampoco hay datos sobre mecanismos de atencion, decodificacion especulativa u otras optimizaciones.

## Capacidades

- Generacion de texto conversacional en ingles, segun el tag "conversational" del repositorio.
- Toma de decisiones (decision-making), dominio declarado explicitamente en los tags del modelo.
- Entrenamiento mediante self-distillation, segun los tags; implica un proceso de transferencia desde un modelo maestro o desde trayectorias propias, no verificado en la documentacion.
- Soporte multimodal potencial: la inclusion de ficheros mmproj-Q8_0 y mmproj-f16 etiquetados como "multi-modal supplement" indica compatibilidad con entrada visual en runtimes que soporten mmproj, aunque la model card no especifica la modalidad ni la resoluucion de imagen.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo language; no se declara soporte de otros idiomas.
- Modo de razonamiento explicito (thinking mode), audio o video: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en ingles: con cuantizaciones Q4_K_S o Q4_K_M (3,0-3,2 GB) el modelo cabe en GPUs de gama media y en equipos con 8 GB de VRAM o incluso CPU, lo que permite desplegar un chatbot privado sin enviar datos a servicios externos.
- Clasificacion y enrutado de decisiones: dado el tag "decision-making", puede emplearse como componente de un sistema que deba elegir entre opciones discretas (por ejemplo, asignar prioridad a tickets o seleccionar una accion), siempre que se valide su calidad con un conjunto de evaluacion propio, ya que no hay benchmarks publicados.
- Prototipado rapido en entornos de investigacion: el rango de cuantizaciones permite comparar el impacto de la precision (de Q2_K a f16) sobre la misma tarea sin cambiar de modelo ni de tokenizador.
- Experimentacion multimodal: los ficheros mmproj permiten probar entrada de imagen en llama.cpp u otros runtimes compatibles con proyector, util para evaluar si el modelo base hereda capacidades de vision.
- Generacion de texto en pipelines por lotes: el tamano reducido de los ficheros Q4 y Q5 facilita el despliegue de multiples instancias en una sola GPU para tareas de generacion masiva o sintesis de datos.
- Educacion e investigacion sobre cuantizacion: el repositorio sirve como caso de estudio de cuantizacion estatica en GGUF, comparando perplejidad y consumo de memoria entre los 11 niveles ofrecidos.
- Ejecucion en dispositivos con recursos muy limitados: Q2_K (2,2 GB) y Q3_K_S (2,4 GB) permiten ejecutar el modelo en mini-PC o portatiles sin GPU dedicada, asumiendo la perdida de calidad que el propio autor advierte para Q3_K_M.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y el autor original tampoco los referencia en el material proporcionado. El unico dato cuantitativo de rendimiento es la tabla de tamanos por cuantizacion recogida en la seccion de especificaciones; la grafica de perplejidad enlazada por el cuantizador es de caracter generico y no especifica del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del tamano de fichero mas el overhead de contexto, que no se declara): Q2_K en torno a 2,5-3 GB; Q4_K_S y Q4_K_M en torno a 3,5-4,5 GB; Q6_K en torno a 4,5-5,5 GB; Q8_0 en torno a 6-6,5 GB; f16 en torno a 10,5-11,5 GB. Son estimaciones por aritmetica de tamanos, no valores medidos.
- Cabe en GPU de consumo: si. Una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB ejecutan sin problema hasta Q8_0; una RTX 4090 de 24 GB permite f16 con contexto amplio. Tarjetas de 8 GB (RTX 3070, RTX 4060) admiten Q4_K_S, Q4_K_M y Q5_K_M con margen ajustado.
- GPU de datacenter: A100, H100 o L40S no son necesarias para 4,84B de parametros; se usarian unicamente para servir muchas instancias concurrentes con vLLM no aplica (vLLM consume pesos safetensors, no GGUF) o para experimentos de fine-tuning.
- Opciones de despliegue: llama.cpp y sus derivados (llama-server, Ollama, LM Studio, text-generation-webui, kobold.cpp). Para explotar los ficheros mmproj se necesita un runtime con soporte de proyector multimodal. vLLM y TGI no consumen GGUF directamente: para esos motores habria que usar el modelo base jylin001206/InnerJev-4B-Full en safetensors.
- Latencia y throughput: no disponible. No hay mediciones publicadas por el cuantizador ni por el autor original.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables en la informacion proporcionada (ni parametros, ni contexto, ni benchmarks de alternativas de tamano similar). El unico repositorio relacionado identificado en la busqueda es mradermacher/OneJev-4B-GGUF, un conjunto de cuantizaciones de nombre similar y presumiblemente del mismo linaje, pero sin informacion contrastada sobre su modelo base.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/InnerJev-4B-Full-GGUF | 4,84B | no disponible | Apache 2.0 | GGUF | Objeto de esta ficha |
| jylin001206/InnerJev-4B-Full | no disponible | no disponible | Apache 2.0 (heredada del campo del repo) | safetensors | Modelo base del que derivan estas cuantizaciones |
| mradermacher/OneJev-4B-GGUF | no disponible | no disponible | no disponible | GGUF | Repositorio relacionado; sin datos verificados |
| Alternativas de ~4B (Llama 3.2 3B, Qwen2.5 3B/7B, Phi-3.5-mini, Gemma 2 2B) | — | — | — | — | No se incluyen por no disponer de datos de comparacion en la informacion proporcionada |

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se declaran arquitectura, contexto, dataset ni proceso de alineamiento, lo que impide evaluar sesgos, robustez o adecuacion a dominios concretos.
- Sin benchmarks publicados: no hay ninguna referencia cuantitativa de calidad; cualquier decision de adopcion deberia basarse en evaluacion propia.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin datos de entrenamiento ni de alineamiento no puede acotarse su magnitud.
- Idiomas: solo se declara ingles. El uso en castellano no esta soportado ni evaluado y probablemente degrade de forma notable.
- Perdida de calidad por cuantizacion: el propio autor marca Q3_K_M como "lower quality" y Q2_K como el nivel mas agresivo; Q3_K_S y Q3_K_M (2,4-2,6 GB) no estan recomendados cuando la precision importa.
- No hay cuantizaciones ponderadas ni imatrix disponibles: el cuantizador indica que "weighted/imatrix quants seem not to be available (by me) at this time", de modo que no existe la variante de mayor calidad por nivel de bits que suele ofrecerse en otros repositorios.
- Trazabilidad limitada del modelo base: el autor original no publica model card detallada, y el dataset de entrenamiento solo se referencia por identificador.
- Capacidad multimodal no confirmada: los ficheros mmproj sugieren vision, pero sin documentacion no puede garantizarse que funcione ni con que formatos de imagen.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero no exime de cumplir las obligaciones de atribucion correspondientes.
- Metadatos del repositorio poco fiables para planificacion: 0 descargas y 0 likes en el momento de la consulta, y fechas de creacion y actualizacion (2026-10-02) que conviene verificar antes de citarlas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/InnerJev-4B-Full-GGUF
- Modelo base: https://huggingface.co/jylin001206/InnerJev-4B-Full
- Dataset de entrenamiento: https://huggingface.co/datasets/jylin001206/InnerJev-4B-Training-Data
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#InnerJev-4B-Full-GGUF
- Repositorio relacionado (OneJev-4B-GGUF): https://huggingface.co/mradermacher/OneJev-4B-GGUF
- Perfil del cuantizador: https://huggingface.co/mradermacher
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
