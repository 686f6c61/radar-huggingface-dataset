# mradermacher/amalia-desenrasca-9b-i1-GGUF

## Resumen

Amalia-desenrasca-9b-i1-GGUF es un repositorio de cuantizaciones GGUF generadas por mradermacher a partir del modelo jgalego/amalia-desenrasca-9b, un modelo denso de 9.152.319.488 parametros (unos 9,15 B) orientado especificamente a tool calling y function calling en portugues de Portugal (pt-PT). El repositorio no contiene pesos originales en precision completa, sino un conjunto de ficheros GGUF con distintos niveles de cuantizacion (desde IQ1_M de 2,5 GB hasta Q6_K de 7,6 GB), pensados para ejecucion local en llama.cpp y derivados.

El modelo base pertenece a la familia AMALIA y esta especializado en conversacion con llamada a herramientas y comportamiento de agente. Los tags del repositorio indican uso de Unsloth en el proceso de ajuste y un dataset especifico de function calling en portugues (jgalego/function-calling-pt-pt). La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia practica radica en que cubre un nicho poco poblado: modelos de ~9 B con soporte solido de function calling nativo en portugues europeo, cuantizados para caber en GPUs de consumo con 6-8 GB de VRAM. Los cuants son de tipo imatrix (denominados i1), que segun el autor ofrecen mejor calidad por tamano que los cuants estaticos equivalentes disponibles en un repositorio aparte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (inferido de los tags `transformers` y `unsloth`; arquitectura exacta no confirmada en la informacion disponible) |
| Parametros totales | 9.152.319.488 (~9,15 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q5_K_S, i1-Q6_K (todas imatrix) |
| Idiomas soportados | Portugues (pt-PT) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna ni los datos de preentrenamiento del modelo base jgalego/amalia-desenrasca-9b. Los tags del repositorio indican que se trata de un modelo transformer (tag `transformers`) ajustado con Unsloth (tag `unsloth`), una libreria habitual para afinado eficiente de familias tipo Llama/Mistral/Qwen. El tamano de 9,15 B parametros situa al modelo en la franja de los 7-9 B, junto a alternativas como Qwen2.5 7B, Llama 3.1 8B o Gemma 2 9B. No se especifica la longitud de contexto original, la composicion del dataset de preentrenamiento ni si hubo fases de RLHF o DPO.

Lo que si documenta el autor es la fase de ajuste: el modelo se ha especializado con el dataset jgalego/function-calling-pt-pt, orientado a function calling en portugues de Portugal, y los tags (`tool-calling`, `function-calling`, `agent`, `conversational`) confirman que el objetivo del ajuste es producir un modelo capaz de emitir llamadas a funciones correctamente formateadas y sostener conversaciones multi-turno con herramientas. Este repositorio concreto no modifica los pesos mas alla de la cuantizacion: aplica cuantizacion tipo imatrix (los cuants i1) sobre el modelo base, lo que segun mradermacher mejora la relacion calidad/tamano respecto a los cuants estaticos.

## Capacidades

- Generacion de texto conversacional en portugues de Portugal (pt-PT).
- tool calling y function calling: el modelo esta afinado especificamente para emitir llamadas a funciones estructuradas, presumiblemente en JSON u otro formato de esquema definido por el desarrollador.
- Comportamiento de agente: los tags `agent` y `function-calling` apuntan a soporte de flujos multi-paso con uso de herramientas externas.
- Conversacion multi-turno: el tag `conversational` indica gestion de dialogos con historial.
- Capacidades multilingues: limitadas a portugues segun la metadatos (`language: pt`, `pt-PT`). No se declara soporte de castellano, ingles ni otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Asistente de atencion al cliente en portugues: el modelo puede gestionar conversaciones multi-turno y emitir llamadas a funciones para consultar el estado de pedidos, facturas o incidencias contra las APIs internas de una empresa portuguesa, respondiendo siempre en pt-PT.
- Agentes de automatizacion de tareas: gracias al soporte de function calling, puede encadenar varias herramientas (busqueda, calculo, escritura en base de datos) en flujos multi-paso para automatizar procesos de back-office.
- Enrutamiento de intenciones: clasificar peticiones entrantes de usuarios lusofonos y derivarlas a la API o al servicio correspondiente mediante llamadas a funciones tipadas.
- Extraccion de datos estructurados: convertir texto libre en portugues (correos, formularios, tickets) en JSON con campos definidos por esquema, aprovechando la especializacion en output estructurado.
- Asistente local con privacidad de datos: al distribuirse en GGUF, se puede ejecutar en hardware de consumo sin enviar datos a servicios en la nube, lo que resulta adecuado para sectores con requisitos de residencia de datos (sanidad, administracion publica, banca).
- Integracion en pipelines RAG: usar el modelo como capa de razonamiento y llamada a herramientas dentro de un sistema de recuperacion aumentada sobre documentacion en portugues.
- Chatbot embebido en producto: con cuants de 4 bits (~5,4-5,7 GB) puede desplegarse en un servidor modesto o en una estacion de trabajo para dar soporte conversacional en portugues dentro de una aplicacion.
- Copiloto de desarrollo para equipos lusofonos: emitir llamadas a funciones de herramientas internas (CI/CD, gestores de incidencias) manteniendo la interfaz en portugues.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones especificas de function calling, y la busqueda web realizada no ha devuelto datos relevantes sobre el modelo (los resultados obtenidos no guardan relacion con AMALIA ni con este repositorio). Tampoco el autor de la cuantizacion publica comparativas de degradacion de perplejidad por tipo de cuant.

## Requisitos de hardware

La VRAM necesaria depende del cuant elegido. Los tamanos de fichero publicados por el autor son:

| Cuant | Tamano (GB) | Notas del autor |
|---|---|---|
| i1-IQ1_M | 2,5 | uso desesperado |
| i1-IQ2_XXS | 2,8 | |
| i1-IQ2_XS | 3,0 | |
| i1-IQ2_M | 3,4 | |
| i1-Q2_K_S | 3,5 | calidad muy baja |
| i1-Q2_K | 3,7 | IQ3_XXS probablemente mejor |
| i1-IQ3_XXS | 3,8 | calidad inferior |
| i1-Q3_K_S | 4,2 | IQ3_XS probablemente mejor |
| i1-IQ3_M | 4,4 | |
| i1-Q3_K_M | 4,7 | IQ3_S probablemente mejor |
| i1-Q3_K_L | 5,0 | IQ3_M probablemente mejor |
| i1-IQ4_XS | 5,1 | |
| i1-IQ4_NL | 5,4 | preferir IQ4_XS |
| i1-Q4_K_S | 5,4 | optimo en tamano/velocidad/calidad |
| i1-Q4_K_M | 5,7 | rapido, recomendado |
| i1-Q5_K_S | 6,5 | |
| i1-Q6_K | 7,6 | practicamente como Q6_K estatico |

- VRAM estimada: sumar al tamano del fichero entre 0,5 y 2 GB para cache KV y overhead del runtime, en funcion del contexto configurado. Como referencia, Q4_K_M (~5,7 GB) requiere del orden de 7 GB de VRAM; IQ2_M (~3,4 GB) puede caber en torno a 4-5 GB.
- GPUs de consumo compatibles: los cuants de 4 bits y menores caben en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4070 Ti, RTX 3080 10/12 GB y, en los cuants mas agresivos (IQ1-IQ3), incluso en GPUs de 6-8 GB. Los cuants Q5 y Q6 son mas comodos en GPUs de 10-16 GB.
- GPUs de centro de datos: A100, H100, L40S o A10G pueden ejecutar cualquier cuant sin problema; su uso aqui solo tiene sentido por agregacion de muchas instancias.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python y text-generation-webui. vLLM y TGI no estan pensados para GGUF y no se recomiendan para este repositorio; para despliegue de alta concurrencia convendria usar los pesos base en safetensors con vLLM/TGI.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| amalia-desenrasca-9b-i1-GGUF (este) | 9,15 B | no disponible | Apache 2.0 | GGUF (imatrix) | Cuantizacion del modelo base; idioma pt-PT |
| jgalego/amalia-desenrasca-9b (base) | 9,15 B | no disponible | Apache 2.0 | safetensors | Precision completa, especializado en function calling pt-PT |
| mradermacher/amalia-desenrasca-9b-GGUF | 9,15 B | no disponible | Apache 2.0 | GGUF (estaticos) | Mismo modelo con cuants estaticos (sin imatrix) |
| Qwen2.5 7B Instruct | ~7,6 B | hasta 128k | Apache 2.0 | safetensors, GGUF | Alternativa generalista multilingue; sin especializacion pt-PT declarada |
| Llama 3.1 8B Instruct | ~8,03 B | hasta 128k | Licencia comunitaria Llama 3.1 | safetensors, GGUF | Alternativa generalista; soporte limitado de portugues europeo |
| Gemma 2 9B Instruct | ~9,24 B | 8k | Licencia Gemma | safetensors, GGUF | Tamano comparable; contexto mas corto |

No se dispone de comparativas de rendimiento (benchmarks) entre estos modelos y amalia-desenrasca-9b en la informacion proporcionada. La comparacion anterior se limita a parametros, contexto, licencia y formatos publicamente conocidos.

## Limitaciones y advertencias

- Idioma: el modelo declara unicamente portugues (pt-PT). No hay evidencia de soporte fiable de castellano, ingles ni otras lenguas; usarlo en esos idiomas degradara la calidad.
- Sin datos de benchmarks: no existen metricas publicadas que permitan estimar su calidad real en function calling, razonamiento o generacion; cualquier evaluacion en produccion debe hacerse con pruebas propias.
- Sin validacion de la comunidad: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay retroalimentacion externa sobre su comportamiento.
- Texto en portugues: no se especifica si el modelo esta alineado para rechazar contenido danino; existe riesgo de respuestas sesgadas o inapropiadas y de alucinacion en tareas factuales, especialmente al invocar herramientas o generar argumentos de funciones.
- Function calling: aunque esta afinado para ello, no se documenta el formato exacto de las llamadas (esquema JSON, tokens especiales, plantilla de chat), por lo que habra que validar la plantilla de prompt antes de integrarlo.
- Cuantizacion: los cuants de 1-3 bits (IQ1, IQ2, Q2_K) degradan notablemente la calidad. El propio autor advierte que IQ1_M es "para salir del paso" y Q2_K_S es de "calidad muy baja". Para produccion conviene usar Q4_K_M o superior.
- Longitud de contexto: no disponible, lo que impide dimensionar la cache KV y planificar escenarios de contexto largo. Hay que verificarlo experimentalmente.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion sin obligacion de compartir derivados, pero conviene confirmar que la licencia del modelo base jgalego/amalia-desenrasca-9b y del dataset de ajuste son compatibles con el uso previsto.
- Arquitectura no confirmada: la falta de detalle sobre la arquitectura del modelo base dificulta predecir su comportamiento en tooling especifico (plantillas de chat, tokens de herramientas) sin pruebas previas.
- Repositorio grande (96,3 GB): descargar todos los cuants consume un ancho de banda y espacio considerables; conviene descargar solo el cuant objetivo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/amalia-desenrasca-9b-i1-GGUF
- Modelo base: https://huggingface.co/jgalego/amalia-desenrasca-9b
- Cuants estaticos del mismo modelo: https://huggingface.co/mradermacher/amalia-desenrasca-9b-GGUF
- Dataset de ajuste: https://huggingface.co/datasets/jgalego/function-calling-pt-pt
- Pagina resumen del cuantizador: https://hf.tst.eu/model#amalia-desenrasca-9b-i1-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/amalia-desenrasca-9b-i1-GGUF/resolve/main/amalia-desenrasca-9b.imatrix.gguf
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
- Referencia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
