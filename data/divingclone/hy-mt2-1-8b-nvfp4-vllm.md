# divingclone/Hy-MT2-1.8B-NVFP4-vLLM

## Resumen

Hy-MT2-1.8B-NVFP4-vLLM es un checkpoint cuantizado a 4 bits del modelo de traduccion Tencent Hy-MT2-1.8B, publicado por el usuario divingclone como parte del proyecto Hy-MT2 Windows. No se trata de un modelo entrenado desde cero, sino de una cuantizacion calibrada del modelo base de Tencent (revision `9a341cd1b679d3efd23b46e847b01745a71ed792`), empaquetada especificamente para su uso con un runtime nativo de vLLM en Windows. El repositorio contiene pesos, configuracion, tokenizer y chat template directamente en la raiz, sin necesidad de descomprimir archivos.

El modelo tiene 1.791.080.448 parametros (aproximadamente 1,8 mil millones) y una arquitectura densa de tipo `hunyuan_v1_dense`. La cuantizacion emplea el esquema NVFP4 W4A4 (pesos y activaciones a 4 bits) mediante la libreria compressed-tensors, conservando los pesos de embedding y de la cabeza de salida en BF16 con pesos atados. El objetivo declarado es ofrecer un perfil rapido para GPU RTX 50 usando kernels CUTLASS, con un checkpoint de 1.373.024.141 bytes.

Su relevancia actual es doble: por un lado, permite ejecutar un modelo de traduccion de 1,8B en GPUs de consumo con un consumo de memoria muy reducido; por otro, ilustra el patron de publicacion de cuantizaciones "verticales", atadas a un runtime concreto (SystemPanic/vllm-windows 0.29.0, PyTorch 2.11.0+cu130 y un plugin nativo de Hunyuan) y no necesariamente compatibles con versiones genericas de vLLM o Transformers. El repositorio cuenta con 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (clase `hunyuan_v1_dense`) |
| Parametros totales | 1.791.080.448 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 (grupo calibrado), embeddings y cabeza de salida en BF16 atados; cache KV INT8 por token/cabeza como ajuste de runtime |
| Idiomas soportados | no disponible (modelo de traduccion; la model card no enumera pares de idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (no es GGUF) |
| Tamano del repositorio | 1,4 GB |
| Bytes del checkpoint NVFP4 | 1.373.024.141 |
| Modelo base | tencent/Hy-MT2-1.8B |
| Pipeline declarado | translation |
| Fecha de creacion | 2026-09-20 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Tencent Hy-MT2-1.8B, un transformer denso identificado en la configuracion como `hunyuan_v1_dense`. Este repositorio no aporta informacion sobre el entrenamiento original: no se detallan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO u otro tipo de alineamiento. Tampoco se publica la longitud de contexto soportada ni el inventario de idiomas.

Lo que si documenta el autor es el proceso de cuantizacion posterior. La calibracion se realizo con 256 ejemplos de traduccion procedentes de OPUS, disjuntos del conjunto de evaluacion de 256 ejemplos. Se aplico un esquema NVFP4 W4A4 con kernels CUTLASS, manteniendo en BF16 los pesos de embedding y de la cabeza de salida (atados entre si). Los hashes de los archivos se registran en `checksums.json`. El repositorio hermano con cuantizacion GPTQ INT4 W4A16 incluye ademas un `quantization.json` con versiones, hashes de calibracion y hashes de pesos de entrada y salida, informacion que no se menciona para este repositorio NVFP4.

La innovacion practica del proyecto es el empaquetado: un layout de repositorio estandar pero validado unicamente contra un runtime concreto, con verificacion de tamano y SHA-256 de cada archivo en la aplicacion de escritorio, y descarga desde un commit fijado.

## Capacidades

- Traduccion automatica: es la tarea declarada del pipeline (`translation`) y el unico caso de uso documentado explicitamente por el autor.
- Inferencia cuantizada a 4 bits en pesos y activaciones (W4A4) con aceleracion mediante kernels CUTLASS en GPU RTX 50.
- Ejecucion con cache KV en INT8 por token y cabeza, configurable en runtime.
- Carga mediante vLLM a traves de un plugin nativo de Hunyuan, no mediante el cargador generico estandar.
- Distribucion de pesos, configuracion, tokenizer y chat template en un unico repositorio plano, apto para descarga directa con `huggingface_hub.snapshot_download`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues detalladas: no disponible (no se enumeran idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Traduccion local en estaciones de trabajo Windows con GPU de consumo: el checkpoint NVFP4 ocupa 1.373.024.141 bytes, de modo que puede mantenerse residente en VRAM junto con el contexto en GPUs de 8-16 GB, sin depender de servicios en la nube.
- Traduccion por lotes de documentacion tecnica: al ser un modelo de 1,8B cuantizado a 4 bits, el coste por token en memoria y computo es bajo, lo que permite procesar volumenes grandes de texto con un solo dispositivo.
- Preprocesado de corpus multilingues en pipelines de investigacion: el modelo puede actuar como traductor de referencia en la fase de normalizacion de datasets, siempre que se valide la calidad por par de idiomas.
- Traduccion embebida en aplicaciones de escritorio: la integracion esta pensada para el proyecto Hy-MT2-Windows, con descarga de archivos individuales desde un commit fijado y verificacion de integridad, lo que encaja en instaladores de escritorio.
- Prototipado rapido de funciones de traduccion en servicios internos: usando vLLM con el plugin nativo, el modelo puede exponerse como endpoint compatible con la API de vLLM y consumirse desde microservicios.
- Evaluacion comparativa de esquemas de cuantizacion: el par de repositorios NVFP4 e INT4 sobre el mismo modelo base permite medir el impacto de W4A4 frente a W4A16 en una tarea de traduccion concreta.
- Despliegue con presupuesto de memoria ajustado en edge o en portatiles con GPU RTX 50: el perfil NVFP4 esta disenado para el camino rapido de CUTLASS en esa generacion.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son puntuaciones de similitud entre la salida del modelo cuantizado y la salida del modelo BF16 sin cuantizar, usado como profesor. No son porcentajes de calidad de traduccion retenida, y el propio autor advierte que varias traducciones distintas pueden ser validas.

| Metrica | Resultado |
|---|---|
| chrF++ (NVFP4 W4A4 + KV INT8) frente a salida BF16 | 79,60 |
| chrF++ (INT4 W4A16 + KV INT8) frente a salida BF16 | 84,97 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, BLEU, COMET u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para pesos NVFP4: aproximadamente 1,4 GB segun los bytes del checkpoint; a ello hay que sumar los pesos BF16 de embedding y cabeza de salida atados, las activaciones y la cache KV en INT8. Con 1,8B parametros, un presupuesto de 2-3 GB para pesos es una estimacion razonable, pero no hay cifra oficial publicada.
- Cabe en GPU de consumo: si. El autor probo RTX 5090. La compatibilidad con RTX 30/40 se apoya en el soporte de arquitectura del runtime y los kernels, y segun el propio autor todavia requiere validacion en hardware; en esas generaciones el perfil recomendado es el repositorio GPTQ INT4 W4A16, no el NVFP4.
- GPU no soportadas por el runtime empaquetado actual: GTX 10, GTX 16 y RTX 20.
- GPU de datacenter (A100, H100): no se mencionan en la documentacion; no disponible.
- Opciones de despliegue: vLLM con el plugin nativo de Hunyuan, validado contra la build comunitaria SystemPanic/vllm-windows 0.29.0 y PyTorch 2.11.0+cu130. No se documenta soporte para llama.cpp, Ollama, TGI ni Transformers generico; al ser compressed-tensors safetensors y no GGUF, las rutas basadas en llama.cpp quedan descartadas de entrada.
- Latencia y throughput: no disponible. No se publican medidas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| divingclone/Hy-MT2-1.8B-NVFP4-vLLM | 1.791.080.448 | NVFP4 W4A4, checkpoint de 1.373.024.141 bytes | no disponible | apache-2.0 | HF, 0 descargas |
| divingclone/Hy-MT2-1.8B-INT4-vLLM | 1,8B (mismo base) | GPTQ INT4 W4A16 simetrico, grupo 128, Marlin, checkpoint de 1.300.648.141 bytes | no disponible | apache-2.0 | HF |
| tencent/Hy-MT2-1.8B | 1,8B (mismo base) | BF16 sin cuantizar | no disponible | apache-2.0 | HF, release oficial |

No se dispone de datos sobre otros modelos de traduccion comparables (parametros, contexto, rendimiento y licencia) en la informacion proporcionada; por tanto, la comparativa con alternativas de terceros queda como no disponible.

## Limitaciones y advertencias

- Los chrF++ 84,97 y 79,60 son similitud respecto a la salida del modelo BF16, no retencion de calidad de traduccion. No deben citarse como metricas de calidad absoluta.
- La evaluacion INT4 reutilizo resultados previos de BF16 y NVFP4, por lo que no constituye un experimento aislado solo del cuantizador.
- La compatibilidad esta atada a un runtime concreto. El propio autor advierte que un layout de repositorio estandar no garantiza funcionamiento con versiones arbitrarias de vLLM o Transformers.
- El soporte en RTX 30/40 se basa en el soporte de arquitectura del runtime, no en validacion en hardware; solo se probo RTX 5090.
- El runtime empaquetado no soporta GTX 10/16 ni RTX 20.
- Riesgo de alucinacion: no evaluado en la informacion disponible. Es un riesgo esperable en cualquier modelo de traduccion neuronal, pero no hay medicion publicada.
- Sesgos: no evaluados ni documentados.
- Cobertura de idiomas: la model card no enumera idiomas soportados ni pares de traduccion, lo que impide garantizar el funcionamiento en un idioma concreto sin pruebas propias.
- Longitud de contexto: no declarada. Es una incognita critica para traduccion de documentos largos.
- Licencia: apache-2.0, permite uso comercial, pero el repositorio incluye `MODEL_CHANGES.md` con modificaciones respecto al original; conviene revisarlo. Es una cuantizacion independiente, no un release oficial de Tencent.
- Madurez: 0 descargas y 0 likes en el momento de la consulta. No hay validacion independiente ni issues publicos de terceros.
- La verificacion de integridad depende de que el consumidor compruebe tamano y SHA-256 contra `checksums.json`; saltarse ese paso elimina la garantia de que los pesos son los calibrados.

## Enlaces

- Repositorio HuggingFace (NVFP4 W4A4): https://huggingface.co/divingclone/Hy-MT2-1.8B-NVFP4-vLLM
- Repositorio hermano (GPTQ INT4 W4A16): https://huggingface.co/divingclone/Hy-MT2-1.8B-INT4-vLLM
- Modelo base: https://huggingface.co/tencent/Hy-MT2-1.8B
- Proyecto Hy-MT2 Windows: https://github.com/divingclone/Hy-MT2-Windows
- Runtime vLLM para Windows: https://github.com/SystemPanic/vllm-windows
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
