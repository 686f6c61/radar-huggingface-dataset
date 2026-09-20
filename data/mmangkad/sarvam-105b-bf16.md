# mmangkad/sarvam-105b-bf16

## Resumen

Sarvam-105B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Sarvam AI, con 106.031.767.424 parametros totales y 10,3 B de parametros activos por token. El repositorio `mmangkad/sarvam-105b-bf16` es una conversion bit-exacta del checkpoint original, que Sarvam AI distribuye en float32, a bfloat16: segun la model card, los 16 bits bajos de mantisa eran cero en todo el checkpoint, de modo que el estrechamiento solo descarta bits conocidos como nulos. El resultado es el mismo modelo con la mitad de huella en disco (de 424 GB a 198 GiB) sin perdida de informacion.

El modelo esta optimizado para razonamiento complejo, matematicas, codigo y tareas agenticas, y presta una atencion especial al contexto indio: la model card declara rendimiento state-of-the-art para su tamano en 22 lenguas indias, ademas del ingles. Usa una pila de atencion de estilo MLA (multi-head latent attention) con dimensiones de cabeza desacopladas para QK y un head_dim de 576, junto con enrutamiento top-8 sobre 128 expertos y un experto compartido. El contexto declarado es de 128 000 tokens con extrapolacion mediante escalado YaRN (factor 40).

Su relevancia practica ahora mismo es doble: por un lado, ofrece un MoE de ~106 B abierto bajo licencia Apache 2.0 con resultados cercanos a modelos frontera en razonamiento y agentes; por otro, esta conversion facilita el despliegue al reducir a la mitad los requisitos de memoria y ancho de banda respecto al checkpoint fp32 original, algo critico cuando el modelo completo no cabe en una sola GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion MLA (multi-head latent attention) y dimensiones de cabeza QK desacopladas |
| Parametros totales | 106.031.767.424 (~106 B) |
| Parametros activos | 10,3 B (top-8 sobre 128 expertos mas 1 experto compartido) |
| Longitud de contexto | 128 000 tokens (extrapolacion YaRN con factor 40) |
| Tipos de cuantizacion | no disponible (este repositorio solo distribuye bfloat16; el original esta en float32) |
| Idiomas soportados | 23: ingles y 22 lenguas indias (hindi, bengali, tamil, telugu, marati, guyarati, canares, malabar, panyabi, oriya, asames, urdu, sanscrito, nepali, sindi, konkani, maithili, dogri, manipuri, santali, cachemir y tibetano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, bfloat16, 85 shards y 12 289 tensores; 198 GiB (212,1 GB de repositorio) |
| Tamano oculto (hidden size) | 4096 |
| Dimension de cabeza | 576 (q_head_dim 192, v_head_dim 128) |
| Intermediate size | 16 384 (MoE: 2048) |
| Enrutamiento | Top-8 de 128 expertos, factor de escala enrutado 2,5, balanceo de router sin perdida auxiliar |
| Codigo | Requiere `trust_remote_code=True` (custom_code) |

## Arquitectura y entrenamiento

Sarvam-105B adopta una pila de atencion de estilo MLA con dimensiones de cabeza QK desacopladas: `q_head_dim=192`, dividida en componentes RoPE y noPE, y `v_head_dim=128`, con un `head_dim` total de 576. Segun la model card, esto permite mayor ancho de banda representacional por cabeza manteniendo el tamano oculto en 4096, y mejora la expresividad de la atencion y la extrapolacion a contexto largo, que se consigue con escalado YaRN de factor 40 hasta 128 000 tokens. La capa MoE combina un `intermediate_size` de 16 384 con un `moe_intermediate_size` de 2048, enrutamiento top-8 sobre 128 expertos, un experto compartido, un factor de escala de enrutado de 2,5 y balanceo del router sin perdida auxiliar (auxiliary-loss-free router balancing). El resultado son 10,3 B de parametros activos por token sobre un total de 106 B.

Los detalles sobre el corpus de entrenamiento (numero de tokens, composicion del dataset) y sobre las etapas de alineacion (RLHF, DPO u otras) no estan disponibles en la informacion proporcionada. La model card si menciona que durante el entrenamiento se puso un foco importante en el contexto y los idiomas de la India, lo que se traduce en su cobertura de 22 lenguas indias.

Respecto al repositorio concreto de esta ficha, la conversion a bfloat16 es bit-exacta: cada tensor convertido se volvio a subir a fp32 y se comparo con el original como patrones de bits `int32`, con 85/85 shards, 12 289/12 289 tensores, 106.031.767.424 parametros, 0 discrepancias y 0 valores NaN o Inf. Solo difieren `config.json` (campo `dtype` de `float32` a `bfloat16`) y `model.safetensors.index.json` (`total_size` reducido a la mitad); el tokenizador y el codigo de modelado son identicos byte a byte.

## Capacidades

- Generacion de texto conversacional en ingles y 22 lenguas indias, con resultados declarados state-of-the-art para su tamano en ese conjunto de idiomas.
- Razonamiento complejo y resolucion de problemas matematicos, con un modo de uso con herramientas que mejora sus resultados en benchmarks de matematicas (AIME 25 pasa de 88,3 a 96,7 con herramientas).
- Generacion y comprension de codigo, con 71,7 en Live Code Bench v6.
- Capacidades agenticas: navegacion web (49,5 en BrowseComp) y resolucion de tareas de ingenieria de software en un harness tipo SWE-Agent (45,0 en SWE Bench Verified).
- Uso de herramientas y function calling, evidenciado tanto por el resultado de AIME 25 con herramientas como por las evaluaciones de agentes y de tau-cuadrado.
- Razonamiento multi-paso en escenarios de troubleshooting tecnico y busqueda web, segun la model card.
- Seguimiento de instrucciones (84,8 en IF Eval) y generacion de contenido escrito (80,5 en Writing Bench).
- No se declara soporte de vision, audio ni modalidades adicionales en la informacion disponible.

## Casos de uso

- Atencion al cliente en idiomas indios: el modelo cubre 22 lenguas del subcontinente mas el ingles, algo poco habitual en modelos abiertos de este tamano, por lo que permite desplegar un unico modelo que atienda consultas en hindi, tamil, bengali o marati sin pipelines separados por idioma.
- Agente de soporte tecnico multi-paso: con 128 000 tokens de contexto puede mantener el historial completo de un incidente, los registros de error y la documentacion asociada en una sola ventana, y razonar sobre ellos encadenando pasos.
- Automatizacion de tareas de ingenieria de software: con 45,0 en SWE Bench Verified bajo un harness tipo SWE-Agent, es adecuado para resolver issues acotados, generar parches y ejecutar bucles de verificacion dentro de un pipeline de CI/CD.
- Investigacion asistida con busqueda web: su 49,5 en BrowseComp indica capacidad para planificar busquedas, leer resultados y sintetizar respuestas, lo que sirve para agentes de recopilacion y contraste de fuentes.
- Tutoria y resolucion de problemas matematicos: con 96,7 en AIME 25 usando herramientas, encaja en entornos donde el modelo debe invocar un interprete simbólico o una calculadora y explicar el procedimiento paso a paso.
- Generacion de codigo asistida en el IDE: 71,7 en Live Code Bench v6 y buen seguimiento de instrucciones lo hacen util para autocompletado, refactorizacion y generacion de tests en un servidor interno compartido por el equipo.
- Traduccion y localizacion entre ingles y lenguas indias: la cobertura de 22 idiomas permite construir flujos de traduccion, resumen y clasificacion de documentos para mercado indio con un solo modelo.
- Procesamiento de documentacion larga en un idioma local: contratos, expedientes o manuales tecnicos de decenas de miles de tokens pueden analizarse sin troceado agresivo gracias al contexto de 128 000 tokens, siempre que el hardware permita esa longitud de secuencia.
- Evaluacion comparativa interna y destilacion: al ser un MoE Apache 2.0 con 10,3 B de parametros activos, sirve como profesor para generar datos sinteticos y destilar hacia modelos menores desplegables en produccion.

## Benchmarks y rendimiento

Resultados publicados en la model card. Las cifras corresponden al modelo original; al ser la conversion bit-exacta, deberian reproducirse de forma identica.

Conocimiento y codigo:

| Benchmark | Sarvam-105B | GLM-4.5-Air | GPT-OSS-120B | Qwen3-Next-80B-A3B-Thinking |
|---|---|---|---|---|
| Math500 | 98,6 | 97,2 | 97,0 | 98,2 |
| Live Code Bench v6 | 71,7 | 59,5 | 72,3 | 68,7 |
| MMLU | 90,6 | 87,3 | 90,0 | 90,0 |
| MMLU Pro | 81,7 | 81,4 | 80,8 | 82,7 |
| Writing Bench | 80,5 | 83,8 | 86,5 | 84,6 |
| Arena Hard v2 | 71,0 | 68,1 | 88,5 | 68,2 |
| IF Eval | 84,8 | 83,5 | 85,4 | 88,9 |

Razonamiento y matematicas:

| Benchmark | Sarvam-105B | GLM-4.5-Air | GPT-OSS-120B | Qwen3-Next-80B-A3B-Thinking |
|---|---|---|---|---|
| GPQA Diamond | 78,7 | 75,0 | 80,1 | 77,2 |
| AIME 25 (con herramientas) | 88,3 (96,7) | 83,3 | 90,0 | 87,8 |
| Beyond AIME | 69,1 | 61,5 | 51,0 | 68,0 |
| HMMT (feb 25) | 85,8 | 69,2 | 90,0 | 73,9 |
| HMMT (nov 25) | 85,8 | 75,0 | 90,0 | 80,0 |

Agenticas:

| Benchmark | Sarvam-105B | GLM-4.5-Air | GPT-OSS-120B | Qwen3-Next-80B-A3B-Thinking |
|---|---|---|---|---|
| BrowseComp | 49,5 | 21,3 | no disponible | 38,0 |
| SWE Bench Verified (harness SWE-Agent) | 45,0 | 57,6 | 50,6 | 60,9 |
| tau-cuadrado (media) | 68,3 | 53,2 | 65,8 | 55,0 |

La model card remite a una nota al pie para los detalles de evaluacion, que no se incluye en la informacion disponible.

## Requisitos de hardware

- Peso de los parametros: al ser bfloat16, los pesos ocupan aproximadamente 198 GiB (212,1 GB de repositorio). El checkpoint fp32 original ocuparia unos 424 GB, de modo que esta conversion reduce a la mitad el requisito de memoria, que es precisamente su proposito.
- VRAM estimada en bf16: se necesita un minimo de 198 GiB solo para pesos, mas la cache KV y los buffers de activaciones. Con tensor parallelism se puede repartir entre varias GPU.
- GPU recomendadas: 4x H100 de 80 GB (320 GB agregados) como configuracion minima razonable, y 8x H100 o 8x H200 para longitudes de contexto altas y mayor concurrencia. El contexto de 128 000 tokens conviene reservarlo para configuraciones de 8 GPU.
- H200 de 141 GB: dos unidades suman 282 GB, suficiente para los pesos con poco margen; es una opcion viable para contexto corto o medio, no confirmada por el autor.
- GPU de consumo: no cabe en una unica GPU de consumo, ni siquiera en una RTX 4090 de 24 GB. En bf16 tampoco cabe en 8x RTX 4090 (192 GB), por debajo de los 198 GiB de pesos. No hay en este repositorio pesos cuantizados a 4 u 8 bits que permitan reducir el requisito.
- Cuantizacion: no disponible. El repositorio solo publica bfloat16 y no se confirma soporte de FP8, AWQ, GPTQ ni GGUF para esta arquitectura, que ademas requiere codigo remoto.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True` y `device_map="auto"`; vLLM y SGLang, ambos citados en la model card del modelo original. No hay confirmacion de soporte en llama.cpp u Ollama para esta arquitectura.
- Latencia y throughput: no disponibles. Dependen fuertemente del grado de tensor parallelism, del numero de expertos residentes en memoria y de la longitud de contexto utilizada.

## Comparativa con modelos similares

Comparativa basada en los resultados que la model card publica frente a los mismos cuatro modelos. Los datos de parametros, contexto y licencia de las alternativas no estan disponibles en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | MMLU Pro | Math500 | Live Code Bench v6 | SWE Bench Verified | tau-cuadrado |
|---|---|---|---|---|---|---|---|---|
| Sarvam-105B | 106 B totales / 10,3 B activos | 128 000 | Apache 2.0 | 81,7 | 98,6 | 71,7 | 45,0 | 68,3 |
| GLM-4.5-Air | no disponible | no disponible | no disponible | 81,4 | 97,2 | 59,5 | 57,6 | 53,2 |
| GPT-OSS-120B | no disponible | no disponible | no disponible | 80,8 | 97,0 | 72,3 | 50,6 | 65,8 |
| Qwen3-Next-80B-A3B-Thinking | no disponible | no disponible | no disponible | 82,7 | 98,2 | 68,7 | 60,9 | 55,0 |

Lectura de los datos disponibles: Sarvam-105B lidera en las tres pruebas agenticas y de busqueda (BrowseComp 49,5 frente a 21,3 del mejor alternativo listado) y en conocimiento general medido por MMLU (90,6), mientras que queda por detras en Writing Bench, Arena Hard v2 y en la tarea de reparacion de repositorios SWE Bench Verified, donde Qwen3-Next-80B-A3B-Thinking alcanza 60,9 frente a 45,0. Su ventaja mas clara es la cobertura linguistica de 22 lenguas indias, que los modelos comparados no documentan en la informacion disponible.

## Limitaciones y advertencias

- La model card no documenta sesgos especificos, pero un modelo entrenado con foco en el contexto indio puede heredar sesgos presentes en los corpus de esas lenguas y en los datos en ingles.
- Riesgo de alucinacion no cuantificado: no se publican tasas de factualidad ni evaluaciones de veracidad, y los resultados agenticos en busqueda web no implican exactitud de los hechos sintetizados.
- Cobertura linguistica muy asimetrica: excelente en lenguas indias e ingles, pero no se declara soporte de castellano ni de otras lenguas europeas, por lo que su uso en espanol no esta respaldado por la documentacion.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo de modelado remoto, con el riesgo de seguridad que conlleva en entornos de produccion; conviene auditar y fijar la revision del repositorio.
- Arquitectura poco convencional (MLA con `head_dim` de 576 y componentes RoPE y noPE): el soporte en runtimes distintos de Transformers, vLLM y SGLang no esta confirmado, y no hay pesos GGUF publicados.
- Sin cuantizaciones publicadas en este repositorio: el despliegue en hardware modesto no es viable sin cuantizar por cuenta propia, y no se garantiza que las herramientas habituales soporten esta arquitectura.
- Licencia Apache 2.0: permite uso comercial sin restricciones significativas, pero se debe mantener el aviso de licencia y la atribucion a Sarvam AI; el trabajo de conversion corresponde al autor del repositorio, no al desarrollador del modelo.
- Sin datos de benchmarks propios del repositorio de conversion: las cifras reproducidas son las del modelo original de Sarvam AI, y la equivalencia bit a bit es una afirmacion del autor de la conversion.
- Las fechas del repositorio y el estado de mantenimiento no estan claros; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que la conversion no ha sido validada de forma independiente por la comunidad.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente paginas de soporte de Microsoft sin relacion con el tema), por lo que no hay informacion externa de terceros que corrobore o matice la model card.

## Enlaces

- Repositorio de la conversion: https://huggingface.co/mmangkad/sarvam-105b-bf16
- Modelo original: https://huggingface.co/sarvamai/sarvam-105b
- Modelo hermano de menor tamano: https://huggingface.co/sarvamai/sarvam-30b/
- Blog de Sarvam AI sobre Sarvam-30B y Sarvam-105B: https://www.sarvam.ai/blogs/sarvam-30b-105b
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- Repositorio de SGLang: https://github.com/sgl-project/sglang
