# mradermacher/MN-Aura-12B-v1-i1-GGUF

## Resumen

MN-Aura-12B-v1-i1-GGUF es un repositorio de cuantizaciones en formato GGUF generado por mradermacher, un autor conocido en HuggingFace por publicar versiones cuantizadas de modelos de terceros. El modelo subyacente es EldritchLabs/MN-Aura-12B-v1, un modelo conversacional de aproximadamente 12.250 millones de parámetros, del que este repositorio ofrece las versiones comprimidas listas para inferencia local mediante llama.cpp, Ollama o LM Studio. El sufijo "i1" indica que las cuantizaciones se han calculado con matrices de importancia (imatrix), una tecnica de calibracion que reduce la perdida de calidad en bitrates bajos.

El interes de esta ficha es practico: permite ejecutar un modelo de 12B en hardware de consumo, desde tarjetas de 8 GB hasta equipos sin GPU dedicada, eligiendo entre 24 niveles de cuantizacion que van de IQ1_S (unos 2,4 GB estimados) hasta Q6_K (unos 10 GB estimados). Es, por tanto, una pieza de infraestructura de despliegue mas que un modelo nuevo.

La informacion publicada es muy limitada: no se declaran arquitectura, licencia, idiomas ni longitud de contexto, ni existen resultados de benchmarks. Cualquier evaluacion seria del modelo debe partir del repositorio de EldritchLabs/MN-Aura-12B-v1, que es la fuente autorizada de estos datos. Las fechas de creacion y actualizacion que reporta HuggingFace son del 25 de septiembre de 2026.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no documentada en la informacion proporcionada) |
| Parametros totales | 12.247.956.480 (unos 12,25 mil millones) |
| Parametros activos | no disponible (no se ha confirmado que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, small-IQ4_NL, Q4_0, Q4_K_S, Q4_1, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix) |
| Idiomas soportados | no disponible (unicamente se declara la etiqueta "conversational") |
| Licencia | no disponible (debe consultarse en el repositorio del modelo base) |
| Formato de pesos | GGUF (cuantizaciones); el modelo base se distribuye en safetensors |
| Modelo base | EldritchLabs/MN-Aura-12B-v1 |
| Tarea declarada | conversacional (text-generation) |
| Tamano del repositorio | 10,5 GB segun HuggingFace |
| Etiquetas | gguf, endpoints_compatible, region:us, imatrix, conversational |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base: el repositorio de cuantizaciones no incluye model card tecnica, ficha de entrenamiento ni detalles sobre el tipo de red (transformer denso, mezcla de expertos, hibrido u otro). El unico dato estructural objetivo es el recuento de parametros (12.247.956.480) y el hecho de que el modelo base se publica en safetensors, lo que confirma que el proceso de conversion registrado en la model card fue `convert_type: hf` con `quantize_version: 2`.

Lo que si es verificable es el proceso de cuantizacion. Se trata de cuantizaciones ponderadas con imatrix (etiqueta `imatrix` y prefijo `i1` en el nombre del repositorio), un metodo que utiliza un conjunto de calibracion para estimar la importancia relativa de cada peso y asignar mas bits a los canales mas sensibles. Esto mejora de forma notable el comportamiento de los niveles bajos (IQ1, IQ2, IQ3) frente a una cuantizacion uniforme, aunque no elimina la degradacion. El listado de cuantizaciones incluye una variante no estandar, `small-IQ4_NL`, y el conjunto completo se ha generado con el pipeline habitual de mradermacher. No hay informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni sobre tecnicas de alineacion como RLHF o DPO.

## Capacidades

- Generacion de texto conversacional multi-turno: es la unica capacidad declarada explicitamente mediante la etiqueta `conversational`.
- Uso como asistente de chat local: el formato GGUF permite ejecutarlo en llama.cpp, Ollama, LM Studio, KoboldCpp y servidores compatibles con la API de OpenAI mediante llama-cpp-python.
- Compatibilidad con despliegue gestionado: la etiqueta `endpoints_compatible` sugiere que el repositorio puede desplegarse a traves de HuggingFace Inference Endpoints.
- Cuantizacion progresiva: 24 niveles disponibles que permiten intercambiar calidad por memoria, desde IQ1_S hasta Q6_K.
- Capacidades de razonamiento, codigo, matematicas, vision o audio: no disponibles en la informacion proporcionada.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; no se declara ningun idioma.
- Modo de pensamiento (thinking mode) o salidas estructuradas: no disponible.

## Casos de uso

- Asistente conversacional totalmente local: con la cuantizacion Q4_K_M (unos 7,4 GB estimados) el modelo cabe en una GPU de 8-12 GB y permite mantener conversaciones privadas sin conexion a Internet, un escenario habitual en entornos con requisitos de confidencialidad.
- Prototipado y evaluacion previa al despliegue: antes de invertir en infraestructura para el modelo base en precision completa, se puede validar el comportamiento, el tono y los prompts del sistema utilizando las versiones IQ3 o Q4 en un portatil.
- Generacion de texto creativo y roleplay: la etiqueta conversacional y el origen del modelo (una publicacion de un laboratorio independiente) apuntan a este tipo de uso, habitual en comunidades que ejecutan modelos mediante KoboldCpp o SillyTavern.
- Inferencia en CPU o equipos sin GPU: las cuantizaciones IQ1_S, IQ2_XXS o Q2_K (entre 2,4 y 4 GB estimados) permiten ejecutar el modelo en memoria RAM convencional con velocidades reducidas, adecuadas para tareas por lotes no interactivas.
- Servicio de chat interno en una PyME: desplegando llama.cpp como servidor con la API compatible con OpenAI, se puede integrar el modelo en una interfaz web corporativa sin costes de API externa.
- Investigacion sobre cuantizacion extrema: la disponibilidad de 24 niveles, incluidos los muy bajos (1-2 bits), lo convierte en un banco de pruebas para medir la degradacion de perplejidad y calidad en funcion del bitrate con un mismo modelo.
- Generacion de resumenes y respuestas en pipelines de datos: integrado mediante llama-cpp-python en un proceso batch, puede procesar lotes de textos cortos reutilizando una unica instancia cargada en memoria.
- Despliegue en entornos con requisitos de aislamiento: al ser un modelo local sin llamadas externas, encaja en entornos air-gapped donde no se permite el trafico hacia APIs de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y el modelo base tampoco aporta cifras en la informacion proporcionada. Tampoco se han publicado mediciones de perplejidad por nivel de cuantizacion, que serian el dato mas relevante para este repositorio en concreto.

## Requisitos de hardware

Estimaciones de tamano de archivo derivadas del recuento de parametros (12,25 mil millones) y del bitrate nominal de cada formato. Son calculos orientativos, no cifras publicadas por el autor.

| Cuantizacion | Bits por peso (aprox.) | Tamano estimado |
|---|---|---|
| IQ1_S | 1,56 | 2,4 GB |
| IQ1_M | 1,75 | 2,7 GB |
| IQ2_XXS | 2,06 | 3,2 GB |
| IQ2_XS | 2,31 | 3,5 GB |
| Q2_K_S / IQ2_S | 2,50 | 3,8 GB |
| Q2_K | 2,63 | 4,0 GB |
| IQ2_M | 2,70 | 4,1 GB |
| IQ3_XXS | 3,06 | 4,7 GB |
| IQ3_XS | 3,30 | 5,1 GB |
| IQ3_S | 3,44 | 5,3 GB |
| Q3_K_S | 3,50 | 5,4 GB |
| IQ3_M | 3,66 | 5,6 GB |
| Q3_K_M | 3,90 | 6,0 GB |
| Q3_K_L | 4,27 | 6,5 GB |
| IQ4_XS | 4,25 | 6,5 GB |
| small-IQ4_NL | 4,50 | 6,9 GB |
| Q4_0 | 4,55 | 7,0 GB |
| Q4_K_S | 4,58 | 7,0 GB |
| Q4_K_M | 4,85 | 7,4 GB |
| Q4_1 | 5,00 | 7,7 GB |
| Q5_K_S | 5,52 | 8,5 GB |
| Q5_K_M | 5,67 | 8,7 GB |
| Q6_K | 6,56 | 10,0 GB |

- VRAM estimada para inferencia: hay que sumar al tamano del archivo el espacio de la cache KV, que depende del contexto configurado. Como regla practica, anadir entre 0,5 y 3 GB segun la ventana que se use.
- GPU de consumo: Q4_K_M (unos 7,4 GB mas cache) entra en RTX 3060 12 GB, RTX 4070, RTX 4070 Ti, RTX 4080 y RTX 4090. Las cuantizaciones IQ2 e IQ3 caben en tarjetas de 6-8 GB. Q6_K requiere 12 GB o mas.
- GPU profesionales: una A100 40 GB, H100 o L40S permiten cargar el modelo en precision completa (unos 24,5 GB en FP16) y servir varias peticiones concurrentes.
- CPU: las cuantizaciones IQ2 y Q3 son las unicas razonables en equipos sin GPU; se recomienda un minimo de 16 GB de RAM para Q4_K_M y 8 GB para Q2_K.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, llama-cpp-python (servidor compatible con la API de OpenAI), text-generation-webui y jan. vLLM y TGI no soportan GGUF de forma generalizada, por lo que para esos motores habria que usar el modelo base en safetensors.
- Latencia y throughput: no se han publicado mediciones para este repositorio. En modelos densos de 12B en Q4_K_M, los ordenes de magnitud habituales son decenas de tokens por segundo en GPU de gama alta y unos pocos tokens por segundo en CPU, pero son valores orientativos no verificados para este modelo concreto.

## Comparativa con modelos similares

No se dispone de datos de arquitectura, contexto o licencia del modelo evaluado, por lo que la comparacion se limita a parametros y disponibilidad. Las cifras de los modelos de referencia corresponden a sus especificaciones publicas.

| Modelo | Parametros | Contexto | Licencia | Formatos |
|---|---|---|---|---|
| MN-Aura-12B-v1-i1-GGUF | 12,25 B | no disponible | no disponible | GGUF |
| Mistral-NeMo 12B | 12,2 B | 128.000 tokens | Apache 2.0 | safetensors, GGUF |
| Gemma 3 12B | 12,2 B | 128.000 tokens | Terminos de Gemma (uso comercial con restricciones) | safetensors, GGUF |
| Qwen2.5-14B | 14,7 B | 32.768 tokens (131.072 con YaRN) | Apache 2.0 | safetensors, GGUF |

La diferencia practica mas relevante es la certidumbre legal: los tres modelos de referencia tienen licencias publicadas y documentadas, mientras que MN-Aura-12B-v1 no declara ninguna en la informacion disponible. En cuanto a calidad, sin benchmarks publicados no es posible establecer una comparacion fundamentada; las alternativas citadas si cuentan con resultados reproducibles. La ventaja del repositorio evaluado es la amplitud de su catalogo de cuantizaciones con imatrix, que cubre rangos de 1 a 6 bits con un mismo modelo.

## Limitaciones y advertencias

- Licencia no declarada: no se indica la licencia del modelo base ni de las cuantizaciones. Antes de cualquier uso comercial es imprescindible revisar EldritchLabs/MN-Aura-12B-v1 y, en su caso, contactar con el autor.
- Ausencia total de benchmarks: no hay ningun dato publicado sobre calidad, por lo que no se puede afirmar que el modelo sea competitivo frente a alternativas de tamano similar.
- Informacion de entrenamiento desconocida: se desconoce el dataset, el numero de tokens, la composicion idiomatica y si hubo alineacion (RLHF, DPO). Esto impide anticipar sesgos o comportamientos en dominios concretos.
- Contexto no documentado: no se debe asumir una ventana larga. Conviene verificar en el repositorio base antes de disenar flujos que dependan de contexto extendido.
- Idiomas no declarados: no hay confirmacion de soporte multilingue; en modelos de este perfil suele dominar el ingles, pero no esta verificado en este caso.
- Degradacion en cuantizaciones extremas: los niveles IQ1_S, IQ1_M, IQ2_XXS e IQ2_XS comprimen a 1,5-2,3 bits por peso y suelen producir errores gramaticales, repeticiones y perdida de coherencia, especialmente en razonamiento y codigo.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; no hay datos de mitigacion ni de tasas de error publicadas.
- El autor es un cuantizador, no el desarrollador: mradermacher no responde del comportamiento del modelo ni de la exactitud de la model card original; los errores de la cuantizacion son posibles, aunque el proceso con imatrix esta estandarizado.
- Metadatos anomalos: HuggingFace reporta fecha de creacion y actualizacion del 25 de septiembre de 2026, posterior a la fecha habitual de consulta; conviene verificar el repositorio antes de citarlo.
- Repositorio sin traccion: cero descargas y cero "likes" en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/MN-Aura-12B-v1-i1-GGUF
- Modelo base: https://huggingface.co/EldritchLabs/MN-Aura-12B-v1
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Repositorio relacionado del mismo autor (Aura-12B-GGUF, modelo distinto): https://huggingface.co/mradermacher/Aura-12B-GGUF
- Repositorio relacionado (Aura-12B-i1-GGUF, ficha en Socket): https://socket.dev/huggingface/package/mradermacher/aura-12b-i1-gguf
- Listado de modelos GGUF: https://mitjafelicijan.github.io/gguf-list/
- Perfil del autor en aimodels.fyi: https://www.aimodels.fyi/creators/huggingFace/mradermacher
