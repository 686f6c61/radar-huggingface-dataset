# apurbomannan/gemma-4-E2B-it

## Resumen

Gemma 4 E2B es el modelo mas pequeno de la familia Gemma 4 de Google DeepMind, una generacion de modelos abiertos multimodales publicada bajo licencia Apache 2.0. La ficha que nos ocupa, apurbomannan/gemma-4-E2B-it, es un ajuste (fine-tune) derivado de google/gemma-4-E2B, alojado en HuggingFace y distribuido en formato safetensors con la libreria transformers. El repositorio ocupa 10,3 GB y declara 5.123.178.051 parametros reales segun los pesos, lo que coincide con la cifra oficial de "5,1B con embeddings" del modelo base.

La familia Gemma 4 se presenta en cinco tamanos (E2B, E4B, 12B, 26B A4B y 31B) con arquitecturas densas y de mezcla de expertos (MoE). El sufijo "E" significa "effective" (efectivo), de modo que E2B declara 2,3B de parametros efectivos y 5,1B contando las tablas de embeddings. Incorpora entrada de texto, imagen y audio, con salida de texto, una ventana de contexto de 128K tokens y soporte de mas de 140 idiomas.

Es relevante ahora porque apunta al segmento de despliegue en dispositivo (telefonos, portatiles, sistemas embebidos) manteniendo capacidades de razonamiento, codigo y agentes con function calling nativo. Conviene senalar que este repositorio concreto es un fine-tune de terceros con cero descargas y cero likes en el momento de la consulta, y que su model card reproduce practicamente el texto oficial de Google sin documentar el ajuste especifico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal con atencion hibrida (sliding window local + atencion global) y Per-Layer Embeddings (PLE) |
| Parametros totales | 5.123.178.051 (~5,12B, incluidos embeddings); 2,3B efectivos segun la documentacion oficial |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | no disponible para este repositorio (solo se confirma safetensors); no se documentan cuantizaciones GGUF/AWQ/GPTQ propias |
| Idiomas soportados | mas de 140 idiomas (segun la model card oficial de Gemma 4) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Gemma 4 E2B emplea un transformer decoder-only con un mecanismo de atencion hibrida que intercala capas de atencion local con ventana deslizante de 512 tokens y capas de atencion global completa, garantizando que la ultima capa sea siempre global. Para optimizar memoria en contextos largos, las capas globales unifican claves y valores y aplican Proportional RoPE (p-RoPE). El modelo tiene 35 capas, un vocabulario de 262K tokens y un encoder de vision de aproximadamente 150M de parametros mas un encoder de audio de aproximadamente 300M.

La innovacion estructural de la variante E2B son las Per-Layer Embeddings (PLE): en lugar de anadir capas o parametros al decodificador, cada capa recibe su propia tabla de embeddings pequena por token. Estas tablas son grandes pero solo se usan para busquedas rapidas, lo que explica que el recuento efectivo (2,3B) sea muy inferior al total (5,1B). Esto maximiza la eficiencia en despliegues en dispositivo. El modelo base se distribuye en variantes preentrenada y ajustada por instrucciones.

Respecto al fine-tune de apurbomannan en concreto, no se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO u otras. La model card del repositorio es una copia del texto oficial de Google y no documenta el proceso de ajuste. Tampoco se detallan en la informacion disponible los datos de entrenamiento del modelo base.

## Capacidades

- Generacion de texto y razonamiento con modos de "pensamiento" (thinking) configurables, segun la documentacion de la familia Gemma 4.
- Entrada multimodal: texto, imagen (con soporte de relacion de aspecto y resolucion variables) y audio en las variantes E2B, E4B y 12B. Salida exclusivamente de texto.
- Codigo y matematicas: la familia declara mejoras notables en benchmarks de codigo.
- Function calling / tool calling nativo, orientado a agentes autonomos.
- Razonamiento multi-paso y flujos agenticos.
- Soporte nativo del rol `system` en el prompt, lo que permite conversaciones mas estructuradas y controlables.
- Capacidades multilingues en mas de 140 idiomas.
- Modo de pensamiento (thinking mode) configurable en todos los modelos de la familia.

Nota: estas capacidades corresponden al modelo base Gemma 4 E2B documentado por Google; no se ha publicado informacion especifica sobre que capacidades conserva o modifica el fine-tune de apurbomannan.

## Casos de uso

- Asistencia en dispositivo movil: el modelo esta disenado para ejecucion local en telefonos y portatiles, con 2,3B de parametros efectivos y embeddings consultados por busqueda rapida, lo que permite asistentes sin conexion con baja latencia.
- Procesamiento de documentos con imagen y texto: al aceptar entrada de imagen con resolucion y relacion de aspecto variables, puede extraer informacion de capturas, formularios o diagramas y responder en texto.
- Transcripcion y comprension de audio: la presencia de un encoder de audio de ~300M permite tareas de resumen o Q&A sobre contenido hablado en las variantes que lo soportan.
- Agentes autonomos con herramientas: gracias al function calling nativo y al soporte del rol `system`, puede integrarse en flujos que consulten APIs, bases de datos o servicios externos.
- Generacion de codigo asistida: la familia declara mejoras en benchmarks de codigo, lo que lo hace util para autocompletado y refactorizacion en entornos ligeros.
- Analisis de contexto largo: con 128K tokens de ventana y atencion hibrida, puede procesar documentos extensos o conversaciones multi-turno largas sin perder coherencia global.
- Clasificacion y extraccion de informacion multilingue: el soporte de mas de 140 idiomas lo hace adecuado para pipelines de contenido en varios idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni metricas comparativas, y las fuentes web consultadas no aportan cifras concretas y verificables para esta variante.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: los pesos ocupan aproximadamente 10,3 GB (tamano del repo), por lo que requiere en torno a 12 GB de VRAM contando overhead de activaciones y KV cache.
- VRAM en cuantizacion int8: aproximadamente 5-6 GB.
- VRAM en cuantizacion de 4 bits: aproximadamente 3 GB, lo que permite ejecucion en GPUs de gama de entrada.
- GPUs recomendadas: para precision completa, RTX 3090, RTX 4090, A100 o H100. Con cuantizacion, tarjetas de 8 GB o incluso 6 GB pueden ser suficientes.
- Compatibilidad con GPU de consumo: si, cabe en RTX 4090, RTX 3090 y, con cuantizacion de 4 bits, en GPUs de 8 GB o menos.
- Opciones de despliegue: transformers (libreria declarada en el repositorio), y de forma general para la familia Gemma 4 se citan entornos de inferencia local; Qualcomm AI Hub publica una version de Gemma-4-E2B-it orientada a dispositivo. vLLM, llama.cpp, Ollama o TGI son opciones plausibles para la familia, aunque no se confirman para este fine-tune concreto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia |
|---|---|---|---|---|
| Gemma 4 E2B (base de este fine-tune) | 2,3B efectivos / 5,1B con embeddings | 128K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 E4B | 4,5B efectivos / 8B con embeddings | 128K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 12B Unified | 11,95B | 256K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 26B A4B (MoE) | 25,2B totales / 3,8B activos | 256K | Texto, imagen | Apache 2.0 |
| Gemma 4 31B Dense | 30,7B | 256K | Texto, imagen | Apache 2.0 |

No se dispone de datos de rendimiento comparativo (benchmarks) para establecer diferencias de calidad entre estas variantes mas alla de las especificaciones de arquitectura y tamano. Alternativas fuera de la familia Gemma no se han podido comparar por falta de informacion en las fuentes consultadas.

## Limitaciones y advertencias

- Este repositorio es un fine-tune de terceros (apurbomannan) con 0 descargas y 0 likes en el momento de la consulta; no hay validacion externa de su calidad ni de su fidelidad al modelo base.
- La model card reproduce el texto oficial de Google y no documenta el dataset, los hiperparametros ni el objetivo del ajuste, lo que dificulta evaluar su comportamiento real.
- Riesgo de alucinacion inherente a los modelos de lenguaje generativos; no se han publicado evaluaciones de fidelidad especificas.
- Posibles sesgos heredados de los datos de entrenamiento del modelo base, que no se detallan.
- Discrepancia entre fuentes: la model card oficial de Gemma 4 atribuye a E2B 128K de contexto y modalidades de texto, imagen y audio, mientras que una fuente de terceros (gemma4.dev) describe E2B como texto unicamente, 8K de contexto, 2,1B de parametros y ejecutable en CPU. Estas cifras no coinciden con la documentacion de Google y deben tratarse con cautela; la discrepancia no resuelta es un riesgo para planificar despliegues.
- Aunque la licencia declarada es Apache 2.0, la model card enlaza a los terminos especificos de licencia de Gemma 4 (ai.google.dev/gemma/docs/gemma_4_license); conviene verificar las condiciones reales de uso comercial antes de un despliegue en produccion.
- No se confirman cuantizaciones (GGUF, AWQ, GPTQ) para este repositorio concreto, lo que limita las opciones de despliegue en hardware restringido.
- Idiomas soportados declarados a nivel de familia (mas de 140), sin evaluacion publicada especifica para este fine-tune.

## Enlaces

- [Modelo en HuggingFace: apurbomannan/gemma-4-E2B-it](https://huggingface.co/apurbomannan/gemma-4-E2B-it)
- [Modelo base: google/gemma-4-E2B](https://huggingface.co/google/gemma-4-E2B)
- [Coleccion Gemma 4 en HuggingFace](https://huggingface.co/collections/google/gemma-4)
- [Repositorio GitHub de Google Gemma](https://github.com/google-gemma)
- [Blog de lanzamiento de Gemma 4](https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/)
- [Documentacion de Gemma](https://ai.google.dev/gemma/docs/core)
- [Informe tecnico (arXiv:2607.02770)](https://arxiv.org/abs/2607.02770)
- [Licencia de Gemma 4](https://ai.google.dev/gemma/docs/gemma_4_license)
- [Pagina de Gemma en Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [Gemma-4-E2B-it en Qualcomm AI Hub](https://aihub.qualcomm.com/models/gemma_4_e2b_it)
- [Ficha en aimodels.fyi](https://www.aimodels.fyi/models/huggingFace/gemma-4-e2b-it-google)
- [Analisis tecnico en Qubrid](https://www.qubrid.com/blog/google-gemma-4-technical-deep-dive-architecture-moe-benchmarks-production-guide)
- [Ficha de Gemma 4 E2B en gemma4.dev (fuente con datos discrepantes)](https://gemma4.dev/models/gemma-4-e2b)
