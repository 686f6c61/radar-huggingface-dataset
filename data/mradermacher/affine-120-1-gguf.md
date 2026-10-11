# mradermacher/Affine-120.1-GGUF

## Resumen

Affine-120.1-GGUF es la colección de cuantizaciones en formato GGUF del modelo Maziko/Affine-120.1, publicada por el usuario mradermacher, especializado en la conversión de pesos de HuggingFace a llama.cpp. No se trata de un modelo nuevo entrenado desde cero, sino de una redistribución optimizada del modelo base para su ejecución en CPU, GPU de consumo y entornos con memoria limitada mediante llama.cpp, Ollama u otros motores compatibles con GGUF.

El modelo base cuenta con 20.914.757.184 parámetros (aproximadamente 20,9 mil millones), según los pesos en safetensors declarados en el repositorio. El nombre "120.1" del modelo hace referencia a una versión o iteración del proyecto de Maziko y no al número de parámetros. La model card original no aporta información sobre arquitectura, longitud de contexto, composición del dataset de entrenamiento ni proceso de alineación, por lo que esos datos figuran como no disponibles en esta ficha.

La relevancia de esta publicación radica en que permite ejecutar un modelo de ~20,9B en hardware de gama alta consumer: las cuantizaciones Q4_K_S (14,8 GB) y Q4_K_M (15,9 GB) caben en GPUs con 16-24 GB de VRAM, y las versiones Q2_K o Q3_K_S (12,2 GB) son viables en tarjetas de 12-16 GB. El repositorio ocupa 170,3 GB en total debido a la acumulación de once variantes de cuantización. El idioma declarado es únicamente inglés y la licencia no está especificada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 20.914.757.184 (~20,9B) |
| Parametros activos | no aplica (no se ha indicado que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (repositorio cuantizado); safetensors en el modelo base |
| Modelo base | Maziko/Affine-120.1 |
| Cuantizador | mradermacher |
| Libreria declarada | transformers |
| Tipo de cuantizacion | estatica (no se han publicado cuantizaciones con imatrix segun el autor) |
| Tamano del repositorio | 170,3 GB |

Tabla de cuantizaciones publicadas, ordenada por tamano:

| Tipo | Tamano (GB) | Notas del autor |
|---|---|---|
| Q3_K_S | 12,2 | |
| Q2_K | 12,2 | |
| IQ4_XS | 12,3 | |
| Q3_K_M | 13,0 | calidad inferior |
| Q3_K_L | 13,4 | |
| Q4_K_S | 14,8 | rapida, recomendada |
| Q4_K_M | 15,9 | rapida, recomendada |
| Q5_K_S | 16,0 | |
| Q5_K_M | 17,0 | |
| Q6_K | 22,3 | muy buena calidad |
| Q8_0 | 22,4 | rapida, mejor calidad |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo base Maziko/Affine-120.1 en los datos disponibles: no se especifica si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura de espacio de estados (SSM) o un diseno hibrido. Tampoco se documentan el numero de capas, la dimension oculta, el numero de cabezas de atencion ni el tipo de tokenizador. El unico dato estructural fiable es el recuento de parametros en safetensors: 20.914.757.184, lo que situa al modelo en la franja de ~21B.

Respecto al entrenamiento, la model card del repositorio cuantizado no incluye ningun detalle sobre el volumen de tokens, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineacion. La unica etiqueta funcional declarada es "conversational", lo que sugiere que el modelo esta ajustado para dialogos multi-turno, pero no hay informacion verificable sobre el proceso seguido. La publicacion de mradermacher se limita a la conversion de pesos a GGUF mediante herramientas de llama.cpp, con cuantizaciones de tipo estatico y sin cuantizacion ponderada por imatrix en el momento de la publicacion, tal y como indica el propio autor.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como "conversational", por lo que esta orientado a dialogos multi-turno.
- Generacion de texto general en ingles: es el unico idioma declarado en los metadatos.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta "endpoints_compatible", lo que indica que puede servirse a traves de infraestructura de inferencia tipo HuggingFace Endpoints/TGI.
- Ejecucion local mediante llama.cpp: todas las variantes GGUF son utilizables en motores compatibles con este formato.
- Razonamiento, codigo, matematicas, vision, audio, tool calling, function calling y modo thinking: no disponible (no hay documentacion al respecto en la informacion proporcionada).
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el unico idioma declarado es el ingles.

## Casos de uso

- Despliegue de chat local en estacion de trabajo: con la cuantizacion Q4_K_M (15,9 GB), el modelo se puede ejecutar integramente en una GPU de 24 GB usando llama.cpp u Ollama, ofreciendo un asistente conversacional privado sin dependencia de APIs externas.
- Asistente conversacional autoalojado en servidor con GPU unica: usando Q5_K_M (17,0 GB) o Q6_K (22,3 GB) sobre una A100 40 GB o una RTX 4090, se puede servir un endpoint conversacional interno para equipos de desarrollo.
- Prototipado de aplicaciones de lenguaje natural: la disponibilidad de cuantizaciones pequenas (Q2_K, Q3_K_S, 12,2 GB) permite probar el modelo en portatiles con GPU de 12-16 GB antes de decidir un despliegue mayor.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece once variantes del mismo modelo, lo que permite medir la degradacion de perplejidad y calidad entre Q2_K y Q8_0 sobre la misma carga de trabajo.
- Procesamiento por lotes de texto en ingles sin conexion: al no requerir red, es adecuado para pipelines de clasificacion, resumen o reescritura de documentos en entornos con requisitos de confidencialidad.
- Base para fine-tuning posterior: los pesos en safetensors del modelo base Maziko/Affine-120.1 pueden emplearse como punto de partida para ajuste supervisado, siempre que la licencia del modelo original lo permita (dato no disponible).
- Investigacion sobre cuantizacion estatica frente a imatrix: dado que el autor indica que no hay cuantizaciones ponderadas por imatrix, este repositorio sirve como referencia de linea base para estudiar el impacto de la cuantizacion estatica en modelos de ~21B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye cifras de MMLU, HumanEval, GSM8K, MT-Bench ni de ningun otro conjunto de evaluacion, y tampoco se aportan mediciones de perplejidad por tipo de cuantizacion.

## Requisitos de hardware

- VRAM estimada para inferencia (tamano del archivo mas overhead de contexto y buffers, aproximadamente 1-2 GB adicionales):
  - Q2_K / Q3_K_S (12,2 GB): en torno a 13-14 GB de VRAM.
  - IQ4_XS (12,3 GB): en torno a 13-14 GB de VRAM.
  - Q4_K_S (14,8 GB): en torno a 16 GB de VRAM.
  - Q4_K_M (15,9 GB): en torno a 17-18 GB de VRAM.
  - Q5_K_M (17,0 GB): en torno a 19 GB de VRAM.
  - Q6_K / Q8_0 (22,3-22,4 GB): en torno a 24 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB, H100 80 GB, L40S 48 GB. Para las cuantizaciones mas bajas, RTX 4080 (16 GB), RTX 4070 Ti SUPER (16 GB) o Tesla T4 (16 GB) pueden ser suficientes.
- Cabe en GPU de consumo: si. Las cuantizaciones Q4 hacia abajo caben en tarjetas de 16 GB; Q6_K y Q8_0 requieren 24 GB; las variantes Q2_K y Q3_K_S son viables en GPUs de 12 GB asumiendo offload parcial de capas a CPU.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio, text-generation-webui, kobold.cpp, y servidores compatibles con la API de llama.cpp. Para los pesos originales en safetensors, vLLM o TGI como alternativa.
- Latencia y throughput estimados: no disponibles. Dependen del hardware, del numero de capas descargadas a CPU y de la longitud de contexto, dato este ultimo que no se ha publicado.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento, licencia ni especificaciones de contexto del modelo base Maziko/Affine-120.1, por lo que no es posible establecer una comparacion fundamentada con alternativas de tamano similar sin recurrir a datos no verificados.

## Limitaciones y advertencias

- Idiomas: el unico idioma declarado es el ingles. No hay evidencia de soporte para castellano u otras lenguas, por lo que su uso en espanol puede degradar notablemente la calidad.
- Licencia no especificada: el repositorio no indica licencia. Esto impide determinar si el uso comercial esta permitido; es imprescindible consultar la licencia del modelo base Maziko/Affine-120.1 antes de cualquier despliegue en produccion.
- Riesgo de alucinacion: no cuantificado. Al no existir benchmarks ni evaluaciones publicadas, no se puede estimar la tasa de alucinacion ni la fiabilidad factual del modelo.
- Ausencia de datos de contexto: se desconoce la longitud de contexto soportada, lo que impide planificar cargas con documentos largos o dialogos extensos.
- Degradacion por cuantizacion: las variantes Q2_K, Q3_K_S, Q3_K_M y Q3_K_L (12,2-13,4 GB) implican una perdida de calidad apreciable en modelos de este tamano. El propio autor marca Q3_K_M como "lower quality" y no ha publicado cuantizaciones ponderadas por imatrix que suelen mitigar esa perdida.
- Procedencia del modelo base: no hay informacion publica en los datos facilitados sobre quien entreno Maziko/Affine-120.1, con que datos ni con que tecnicas de alineacion, lo que limita la trazabilidad y la evaluacion de sesgos.
- Popularidad muy baja: 139 descargas y 0 likes en el momento de la consulta, lo que implica poca validacion por parte de la comunidad y ausencia de informes independientes de calidad.
- Advertencia sobre el nombre: el sufijo "120.1" no debe interpretarse como 120.000 millones de parametros; el recuento real en safetensors es de ~20,9B.
- Metadata incompleta: el repositorio declara `library_name: transformers` pero no incluye un pipeline definido, lo que puede complicar la carga automatica mediante la API de transformers.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Affine-120.1-GGUF
- Modelo base: https://huggingface.co/Maziko/Affine-120.1
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Affine-120.1-GGUF
- Preguntas frecuentes y solicitudes del cuantizador: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
