# mradermacher/PhAI-IDE-72B-GGUF

## Resumen

PhAI-IDE-72B-GGUF es un repositorio de pesos cuantizados en formato GGUF publicado por el usuario mradermacher, un perfil conocido en HuggingFace por generar versiones cuantizadas de modelos abiertos para su uso con llama.cpp y derivados. El repositorio no contiene un modelo entrenado desde cero: es una conversion estatica del modelo base AItonomy/PhAI-IDE-72B, tal y como indica la propia model card. El nombre del repositorio sugiere un modelo de la clase 72.000 millones de parametros orientado a entornos de desarrollo (IDE), aunque la model card no confirma ni arquitectura, ni datos de entrenamiento, ni capacidades.

La relevancia de esta ficha es limitada y hay que ser honesto al respecto: el repositorio acumula 0 descargas y 0 likes, no declara licencia, no declara idiomas soportados y no incluye resultados de benchmarks ni informacion sobre el proceso de cuantizacion mas alla de la lista de variantes generadas. Toda evaluacion tecnica seria sobre este modelo debe hacerse contra el repositorio del modelo base (AItonomy/PhAI-IDE-72B), que es donde residiria la informacion de entrenamiento y evaluacion, y no contra esta copia cuantizada.

En la practica, este repositorio es util unicamente como artefacto de despliegue: ofrece variantes GGUF listas para ejecutar un modelo de gran tamano en hardware no especializado mediante cuantizacion agresiva. Cualquier decision de adopcion en produccion deberia posponerse hasta verificar la licencia del modelo base y validar el comportamiento real de los pesos cuantizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 72B segun el nombre del repositorio (no confirmado en la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (convert_type: hf, quantize_version: 2, output_tensor_quantised: 1) |
| Modelo base | AItonomy/PhAI-IDE-72B |
| Autor del repositorio | mradermacher |
| Fecha de creacion | 2026-09-17 |
| Ultima actualizacion | 2026-09-17 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura del modelo en la documentacion proporcionada. La model card de este repositorio se limita a una linea: "static quants of https://huggingface.co/AItonomy/PhAI-IDE-72B". No se especifica si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura hibrida con atencion lineal o un modelo multimodal, aunque el sufijo "72B" y la convencion de nomenclatura habitual apuntan a un transformer denso de gran tamano. Esta afirmacion es una inferencia por nomenclatura, no un dato confirmado.

Tampoco hay datos sobre el entrenamiento: numero de tokens, composicion del dataset, uso de RLHF, DPO, SFT u otras tecnicas de alineamiento. Se desconoce si el modelo base fue afinado especificamente para tareas de programacion y entornos de desarrollo o si es un modelo generalista renombrado. Los metadatos de cuantizacion (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) indican unicamente que la conversion se hizo con la herramienta de cuantizacion de llama.cpp sobre pesos en formato HuggingFace, con cuantizacion a nivel de tensor de salida.

## Capacidades

No se dispone de informacion verificada sobre las capacidades del modelo. La model card del repositorio cuantizado no enumera capacidades, y los resultados de busqueda web proporcionados no contienen ninguna referencia al modelo. Por tanto:

- Generacion de texto: no confirmada, aunque es esperable en un modelo de esta clase por convencion, no por dato documentado.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: el nombre "PhAI-IDE" sugiere orientacion a tareas de desarrollo, pero no hay confirmacion en la documentacion.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declara lista de idiomas).
- Vision, audio u otras modalidades: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.

Cualquier afirmacion adicional sobre capacidades seria especulacion. Se recomienda consultar la model card del modelo base en AItonomy/PhAI-IDE-72B antes de asumir cualquier funcionalidad.

## Casos de uso

Dado que las capacidades no estan documentadas, los siguientes casos son escenarios plausibles para un modelo de la clase 72B cuantizado en GGUF, condicionados a la validacion previa del comportamiento real de los pesos:

- Despliegue en hardware de gama alta no especializado: la variante Q4_K_M permite ejecutar un modelo de ~72B en estaciones de trabajo con 48 GB de VRAM (por ejemplo, dos RTX 4090 o dos A6000), algo inviable con los pesos en FP16, que rondarian los 144 GB.
- Inferencia en CPU con offload parcial: las variantes Q2_K y Q3_K_S reducen el peso a rangos que pueden repartirse entre VRAM y memoria RAM del sistema mediante llama.cpp, permitiendo servir el modelo sin GPU de datacenter.
- Experimentacion e investigacion: util para reproducir experimentos con un modelo de gran tamano cuando no se dispone de acceso a clústeres con A100/H100, aceptando la perdida de precision que introducen las cuantizaciones bajas.
- Evaluacion comparativa de degradacion por cuantizacion: el repositorio ofrece doce variantes (desde Q2_K hasta Q8_0 y f16) sobre el mismo modelo base, lo que permite medir empiricamente el impacto de cada nivel de cuantizacion en calidad de salida.
- Prototipado local de asistentes de codigo: si el modelo base confirma su orientacion a IDE, las variantes Q4_K_M o Q5_K_M podrian integrarse en extensiones de editor que consuman un servidor local compatible con la API de OpenAI.
- Pipelines offline con requisitos de privacidad: al ejecutarse localmente, el modelo evita enviar codigo o datos sensibles a APIs externas, lo que encaja en entornos con restricciones de cumplimiento normativo.
- Servicio de inferencia autogestionado: mediante llama.cpp server o vLLM (este ultimo solo para pesos sin cuantizar o con cuantizacion compatible) se puede exponer una API interna para tareas de generacion de texto de proposito general.

Ninguno de estos casos debe darse por bueno sin una evaluacion previa propia: no hay benchmarks publicados que respalden la calidad del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y los resultados de busqueda web facilitados no contienen referencias al modelo ni a su modelo base.

Tampoco se dispone de mediciones de rendimiento en inferencia (tokens por segundo, latencia de primer token, throughput por lote) para ninguna de las doce variantes de cuantizacion publicadas.

## Requisitos de hardware

Las siguientes cifras son estimaciones calculadas a partir del tamano de 72.000 millones de parametros indicado en el nombre del repositorio. No proceden de la model card y deben tratarse como orientativas; el consumo real depende de la longitud de contexto, del tamano del vocabulario, de la implementacion de KV cache y de la variante concreta.

- VRAM estimada para inferencia, solo pesos:
  - f16: ~144 GB
  - Q8_0: ~76 GB
  - Q6_K: ~59 GB
  - Q5_K_M: ~51 GB
  - Q4_K_M: ~43 GB
  - IQ4_XS: ~38 GB
  - Q3_K_M: ~35 GB
  - Q2_K: ~24 GB
- GPU recomendadas: para f16 y Q8_0 se necesitan nodos multi-GPU con A100 80 GB o H100 80 GB (2 a 4 unidades). Para Q4_K_M o Q5_K_M bastan 2 GPU de 24 GB (RTX 4090, RTX 3090, A6000) o una unica GPU de 48 GB.
- Compatibilidad con GPU de consumo: ninguna variante cabe de forma holgada en una sola GPU de 24 GB. Q2_K (~24 GB) queda al limite y no deja margen para la KV cache ni para el contexto, por lo que en la practica exige offload parcial a RAM o dos GPU. Q3_K_S y Q4_K_S permiten repartir capas entre GPU y CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. Para vLLM o TGI seria necesario partir de los pesos del modelo base en safetensors, no de estos GGUF.
- Latencia y throughput: no disponible. No hay mediciones publicadas para este repositorio.

## Comparativa con modelos similares

La comparacion se establece por clase de parametros, ya que no hay datos confirmados de arquitectura, contexto ni licencia de PhAI-IDE-72B. Los datos de los modelos alternativos corresponden a sus model cards publicas y pueden variar con el tiempo.

| Modelo | Parametros | Contexto | Licencia | Formatos disponibles |
|---|---|---|---|---|
| PhAI-IDE-72B-GGUF (mradermacher) | 72B segun nombre (no confirmado) | no disponible | no disponible | GGUF (12 variantes) |
| Qwen2.5-72B-Instruct | 72B | 131.072 tokens | Qwen License | safetensors, GGUF (comunidad) |
| Llama-3.3-70B-Instruct | 70B | 128.000 tokens | Llama 3.3 Community License | safetensors, GGUF (comunidad) |

En cuanto a rendimiento medido, no es posible comparar: PhAI-IDE-72B no publica benchmarks. Cualquier afirmacion sobre su calidad relativa frente a Qwen2.5-72B-Instruct o Llama-3.3-70B-Instruct carece de respaldo documental.

## Limitaciones y advertencias

- Licencia desconocida: el repositorio no declara licencia. No se puede asumir uso comercial permitido. Es imprescindible consultar la licencia del modelo base AItonomy/PhAI-IDE-72B, que tampoco se detalla en la informacion proporcionada.
- Sin adopcion verificable: 0 descargas y 0 likes en el momento de los datos facilitados. No hay senales de uso real ni de validacion por parte de la comunidad.
- Sin benchmarks: no existe ninguna metrica publicada que permita estimar la calidad del modelo ni de sus cuantizaciones.
- Degradacion por cuantizacion: las variantes Q2_K y Q3_K_S implican perdidas de precision notables en modelos de este tamano. Para tareas que requieran razonamiento fino o generacion de codigo correcta, se recomienda Q4_K_M o superior, siempre que el hardware lo permita.
- Riesgo de alucinacion: no cuantificado ni documentado. Sin evaluaciones publicadas no es posible estimar la tasa de alucinacion en ningun dominio.
- Idiomas: se desconoce la cobertura linguistica. No se puede garantizar un rendimiento aceptable en castellano.
- Contexto: la longitud de contexto es desconocida, lo que impide planificar despliegues con ventanas largas o tareas de resumen sobre documentos extensos.
- Trazabilidad: al ser una copia cuantizada de terceros, no hay garantia de que los pesos correspondan exactamente al modelo base ni de que se hayan regenerado tras posibles actualizaciones de este.
- Sesgos: no hay informacion sobre el dataset de entrenamiento ni sobre mitigaciones de sesgo aplicadas.
- Uso en produccion: no recomendado sin una evaluacion propia previa que cubra calidad, latencia, coste de hardware y cumplimiento de licencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/PhAI-IDE-72B-GGUF
- Modelo base: https://huggingface.co/AItonomy/PhAI-IDE-72B
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher

No se han encontrado en la busqueda web enlaces adicionales relevantes (papers, blogs, repositorios o demos) relacionados con este modelo. Los resultados devueltos correspondian a paginas genericas de un portal de busqueda, sin relacion con el modelo.
