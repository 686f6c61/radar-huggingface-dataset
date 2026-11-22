# mradermacher/Lean-conjecturer-GGUF

## Resumen

Lean-conjecturer-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo Slim205/Lean-conjecturer, generadas por mradermacher. El modelo original es un transformer de aproximadamente 6.890 millones de parametros (6,89 B), orientado a tareas de generacion de conjeturas y razonamiento formal en el contexto del asistente de demostracion Lean. La publicacion de estas cuantizaciones permite ejecutar el modelo en hardware de consumo mediante llama.cpp y derivados, algo imposible con los pesos originales en precision completa.

El repositorio ofrece doce variantes de cuantizacion que van desde Q2_K (2,8 GB) hasta f16 (13,9 GB), pasando por Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K y Q8_0. Esta disponible bajo licencia Apache 2.0 y esta etiquetado unicamente para ingles (en). No se dispone de informacion sobre el pipeline de inferencia, la longitud de contexto ni los datos de entrenamiento del modelo base en la informacion proporcionada.

La relevancia de esta ficha radica en que el modelo base pertenece a la familia de asistentes especializados en matematicas formales, un nicho donde los modelos generalistas rinden mal. La disponibilidad de cuantizaciones GGUF facilita la experimentacion local con un modelo de 6,9 B en GPUs de gama media, aunque la ausencia de benchmarks publicados obliga a validar su calidad empiricamente antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (no se detalla variante en la informacion disponible) |
| Parametros totales | 6.890.737.664 (6,89 B) |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); pesos originales en safetensors en el repo base |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Slim205/Lean-conjecturer en la documentacion proporcionada. Los datos reales de safetensors indican 6.890.737.664 parametros, lo que situa el modelo en la categoria de 7 B aproximadamente. La model card del repositorio GGUF no incluye detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste fino supervisado.

La unica informacion tecnica concreta sobre el proceso de cuantizacion proviene de los metadatos del repositorio: se trata de cuantizaciones estaticas (static quants) generadas con quantize_version 2 y output_tensor_quantised 1, a partir de la conversion de pesos Hugging Face (convert_type: hf). El autor indica que las cuantizaciones ponderadas con imatrix no estan disponibles en el momento de la publicacion. No se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o mecanismos hibridos.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta "conversational" del repositorio.
- Razonamiento matematico formal orientado a la generacion de conjeturas en el entorno Lean, a juzgar por el nombre del modelo base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Capacidades especiales (vision, audio, modo thinking): no disponibles en la informacion proporcionada.

## Casos de uso

- Generacion de conjeturas en Lean: el modelo puede proponer enunciados candidatos o lemas auxiliares que un usuario o un sistema automatizado verifica posteriormente con el comprobador de demostraciones de Lean, acelerando la exploracion de espacios de teoremas.
- Asistencia a investigadores en matematicas formales: integrado en un entorno de edicion como VS Code con la extension Lean 4, el modelo sugiere posibles generalizaciones o variaciones de un teorema existente que el matematico evalua manualmente.
- Experimentacion local en GPU de consumo: gracias a las cuantizaciones Q4_K_M (4,3 GB) y Q4_K_S (4,1 GB), el modelo cabe en GPUs de 8 GB de VRAM, permitiendo probar el comportamiento del modelo sin infraestructura dedicada.
- Prototipado de pipelines de autoformalizacion: el modelo puede usarse como componente de generacion dentro de un pipeline que traduzca enunciados en lenguaje natural a declaraciones Lean, con validacion sintactica posterior.
- Docencia de logica y demostracion asistida: en cursos universitarios, el modelo puede generar ejercicios de conjetura que los estudiantes intentan demostrar, reduciendo la carga de preparacion de material.
- Evaluacion comparativa de cuantizaciones: dado el conjunto amplio de variantes (desde Q2_K hasta f16), el repositorio sirve para medir empiricamente la degradacion de calidad en tareas de razonamiento formal segun el nivel de cuantizacion.
- Despliegue en entornos con restricciones de memoria: la variante Q2_K (2,8 GB) permite ejecutar el modelo en dispositivos con menos de 4 GB de VRAM o en CPU, aunque con perdida de calidad esperada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente entre 3 y 4 GB para Q2_K (2,8 GB de pesos mas overhead de contexto y KV cache), entre 4,5 y 5,5 GB para Q4_K_M (4,3 GB de pesos), y en torno a 8-9 GB para Q8_0 (7,4 GB de pesos).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 para las cuantizaciones medias y altas; A100 o H100 no son necesarias para un modelo de 6,9 B, pero permitirian mayor throughput con f16.
- Cabe en GPU de consumo: si, desde GPUs de 8 GB (Q4_K_S, Q4_K_M) hasta GPUs de 12-16 GB para Q6_K y Q8_0. La variante f16 (13,9 GB) requiere al menos 16 GB de VRAM o ejecucion parcial en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y cualquier runtime compatible con GGUF. No se documenta soporte para vLLM o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lean-conjecturer (este) | 6,89 B | no disponible | Apache 2.0 | GGUF y safetensors | Especializado en conjeturas Lean, solo ingles |
| Modelos generalistas de 7 B (p. ej. familia Llama o Mistral) | ~7 B | 8k-32k tipicamente | licencias variables | GGUF, safetensors | Razonamiento formal limitado, sin especializacion Lean |
| Asistentes matematicos especializados (p. ej. variantes tipo LeanDojo o ReProver) | variable | no disponible | variable | variable | Enfocados en demostracion automatica mas que en conjetura |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse presumiblemente con corpus matematicos, se espera un sesgo hacia vocabulario y convenciones de Lean.
- Riesgo de alucinacion: alto en tareas de generacion de conjeturas, ya que el modelo puede producir enunciados sintacticamente plausibles pero matematicamente falsos o triviales; toda salida debe verificarse con Lean.
- Limitaciones de contexto o idioma: el modelo esta etiquetado solo para ingles y no se documenta la longitud de contexto, lo que impide planificar tareas que requieran ventanas largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, pero conviene conservar los avisos de atribucion y revisar la licencia del modelo base Slim205/Lean-conjecturer.
- Caveats para produccion: no hay benchmarks publicados, el numero de descargas es bajo (89) y no hay likes, lo que indica poca validacion comunitaria; las cuantizaciones Q2_K y Q3_K_M pueden degradar significativamente la calidad en razonamiento formal; no se dispone de cuantizaciones imatrix ponderadas, que suelen mejorar la relacion calidad/tamano.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Lean-conjecturer-GGUF
- Modelo base: https://huggingface.co/Slim205/Lean-conjecturer
- Pagina de descargas del autor: https://hf.tst.eu/model#Lean-conjecturer-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
