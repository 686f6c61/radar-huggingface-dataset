# DevelopingDad/Qwen3.8-Flash-Next-Uncensored-NVFP4-DGX-Spark

## Resumen

Qwen3.8-Flash-Next-Uncensored-NVFP4-DGX-Spark es un paquete de despliegue publicado por el usuario DevelopingDad sobre el punto de control cuantizado de OrcaRouter (`orcarouter/Qwen3.8-Flash-Next-Uncensored-NVFP4`, revisión `38efbffeb2152219d979336d46371578c1177b98`), a su vez derivado del modelo base `Qwen/Qwen3.8-Flash-Next`. No se trata de un entrenamiento ni de un ajuste nuevo: los pesos no se han fine-tuneado, fusionado ni recuantizado para este repositorio, sino que se redistribuyen junto con los parches de runtime y el lanzador necesarios para ejecutarlos en una NVIDIA DGX Spark.

El modelo es un vision-language de aproximadamente 180.000 millones de parámetros (179.999.981.459 según los safetensors), cuantizado en NVFP4 mediante `compressed-tensors` y con decodificación especulativa nativa basada en MTP (multi-token prediction) con pesos borrador en FP8. La ventana de contexto configurada en el perfil de producción es de 131.072 tokens. Incluye una variante "uncensored/abliterated", es decir, con los mecanismos de rechazo reducidos o eliminados.

Su relevancia es fundamentalmente práctica: es un ejemplo de empaquetado reproducible de un modelo grande cuantizado para hardware Blackwell de memoria unificada, con parches de runtime específicos, verificación de checksums y un perfil de servicio medido. La model card advierte de que el paquete solo se ha cualificado en DGX Spark/GB10 y que una instalación genérica de Transformers, llama.cpp u Ollama no es un cargador verificado para estos pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no detalla la arquitectura interna; se describe como vision-language con decodificacion especulativa MTP) |
| Parametros totales | 179.999.981.459 (aproximadamente 180.000 millones) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 131.072 tokens (maximo configurado en el perfil de produccion) |
| Tipos de cuantizacion | NVFP4 con `compressed-tensors`; pesos borrador de especulacion en FP8; shard de embedding PLE en BF16; KV cache en BF16. La etiqueta del repositorio incluye "8-bit" |
| Idiomas soportados | en, zh |
| Licencia | qwen-community-1.0 (declarada como `license: other` con `license_name: qwen-community-1.0`) |
| Formato de pesos | safetensors, mas pesos MTP y shard BF16 del embedding PLE |
| Pipeline | image-text-to-text |
| Libreria de inferencia | vLLM 0.30.0 (Transformers 5.17.0) |
| Tamano del repositorio | 183,5 GB (170,9 GiB) |
| Modelo base | Qwen/Qwen3.8-Flash-Next |
| Revision upstream | `38efbffeb2152219d979336d46371578c1177b98` |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el entrenamiento del modelo base en la documentacion proporcionada: no se indican numero de tokens, composicion del dataset ni si hubo fases de RLHF o DPO. Lo unico verificable es que se trata de un modelo de la familia Qwen3.8 Flash-Next con capacidades de vision y lenguaje (pipeline `image-text-to-text`), alrededor de 180.000 millones de parametros y una ventana de contexto configurada de 131.072 tokens.

La innovacion tecnica documentada esta en el runtime, no en el entrenamiento. El perfil de despliegue incluye decodificacion especulativa nativa mediante MTP con 2 tokens y pesos borrador en FP8 generados en linea, sobre un vocabulario borrador reducido de ingles y codigo de 47.172 entradas. El embedding PLE se lee por mapeo de memoria desde almacenamiento local con lecturas paralelas. Se usan CUDA graphs fragmentables ("breakable piecewise graphs") con los tamanos de captura desplegados. El lanzador monta automaticamente parches de runtime propios: una invocacion estandar de `vllm serve` no reproduce estos parches.

Respecto a la componente "uncensored/abliterated", la model card no especifica la metodologia aplicada (abliteracion por direccion de rechazo, fine-tuning sobre datos sin filtro u otra) ni sobre que revision del modelo base se aplico. Este dato es relevante para evaluar el riesgo de degradacion de capacidades y no esta disponible.

## Capacidades

- Generacion de texto conversacional en ingles y chino, con soporte declarado de razonamiento (`reasoning`).
- Procesamiento de imagen y texto de forma conjunta (pipeline `image-text-to-text`), orientado a tareas de vision-language.
- Function calling / tool calling, con plantillas de herramientas declaradas como `qwen3` y `qwen3_xml`.
- Modo de razonamiento conmutable: el perfil por defecto arranca con "thinking off", temperatura 0,7, top_p 0,8 y top_k 20.
- Decodificacion especulativa con MTP para acelerar la generacion, con vocabulario borrador reducido a ingles y codigo.
- Comportamiento "uncensored/abliterated": menor tendencia a rechazar peticiones, segun la propia etiqueta del autor.
- Servicio mediante API compatible con OpenAI en `http://127.0.0.1:8000/v1`.
- No se documentan capacidades de audio, voz ni generacion de imagenes.

## Casos de uso

- Asistente conversacional local con vision: el modelo acepta entradas de imagen y texto, por lo que puede usarse para describir capturas, extraer informacion de documentos escaneados o responder preguntas sobre diagramas en un entorno sin conexion, aprovechando los 131.072 tokens de contexto.
- Analisis de documentacion tecnica extensa: con 131.072 tokens de ventana se pueden procesar manuales, expedientes o repositorios completos en una sola peticion; las mediciones del autor muestran un primer token en 0,93 s con prefijo repetido de 32K y 30.400 tokens en cache.
- Automatizacion de agentes con tool calling: las plantillas `qwen3` y `qwen3_xml` permiten encadenar llamadas a funciones en flujos multi-paso, por ejemplo consulta a bases de datos internas seguidas de sintesis de resultados.
- Generacion y revision de codigo: el modelo alcanza 51,60 tok/s en la carga de codigo de un solo cliente segun las mediciones internas, lo que lo hace utilizable para autocompletado por lotes o revision de fragmentos en pipelines de integracion continua, siempre en un nodo DGX Spark.
- Prototipado de producto sin restricciones de contenido: la variante abliterated esta pensada para equipos que necesitan respuestas sobre temas sensibles (seguridad ofensiva, ficcion adulta, analisis de contenido toxico) sin filtros de rechazo, asumiendo los riesgos legales y de calidad asociados.
- Despliegue en laboratorio o nodo unico: al requerir una sola DGX Spark/GB10 con 128 GB de memoria unificada, es adecuado para grupos de investigacion que quieren servir un modelo de ~180B sin cluster multi-GPU.
- Evaluacion comparativa de cuantizacion NVFP4: sirve como referencia para medir la perdida de calidad y la ganancia de throughput de NVFP4 frente a BF16 sobre hardware Blackwell.
- Extraccion de informacion estructurada de imagenes: tickets, facturas o formularios fotografiados, con salida en JSON mediante function calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, MMMU u otros) en la informacion disponible. Los unicos datos son mediciones internas del autor, sinteticas, realizadas el 8 de octubre de 2026 sobre una unica DGX Spark/GB10 con los pesos de OrcaRouter y vLLM 0.30.0, sobre una carga congelada de 52 peticiones (temperatura 0, semilla 91027, thinking desactivado, streaming activado). No son una garantia de rendimiento para la configuracion empaquetada ni para otro hardware.

Throughput agregado (mediana de tres oleadas, tokens de finalizacion divididos por el tiempo total de la oleada, incluyendo prefill y planificacion):

| Carga | Perfil anterior | K1b optimizado | Variacion |
|---|---:|---:|---:|
| Prosa, 1 cliente | 25,05 tok/s | 37,29 tok/s | +48,9% |
| Prosa, 2 clientes (agregado) | 41,00 tok/s | 58,51 tok/s | +42,7% |
| Prosa, 4 clientes (agregado) | 62,60 tok/s | 89,55 tok/s | +43,1% |
| Codigo, 1 cliente | 37,33 tok/s | 51,60 tok/s | +38,2% |
| Copia literal, 1 cliente | 45,39 tok/s | 55,43 tok/s | +22,1% |

Tasas de decodificacion puras de un solo cliente en el perfil K1b: 38,13 tok/s en prosa, 52,80 tok/s en codigo y 56,97 tok/s en copia.

Latencia hasta el primer contenido en documentos en frio: 9,08 s a 3,99 s con 8.045 tokens de entrada; 14,71 s a 14,46 s con 32.058 tokens de entrada (ambos con cero tokens de entrada en cache). Una peticion separada de 32K con prefijo repetido devolvio el primer contenido en 0,93 s con 30.400 tokens en cache.

Advertencia del propio autor: el benchmark K1b uso 4 ranuras activas, utilizacion de memoria 0,790 y 32K de contexto configurado, mientras que la instantanea empaquetada del 9 de octubre usa 8 ranuras y 0,770; la suite de 52 peticiones no se ha repetido con esa configuracion.

## Requisitos de hardware

- Unico hardware cualificado: NVIDIA DGX Spark / GB10 con 128 GB de memoria unificada, Linux ARM64. El paquete no se ha cualificado en otro hardware.
- Espacio en disco: aproximadamente 183,5 GB (170,9 GiB) para el punto de control, mas espacio adicional para la imagen Docker, metadatos de descarga y caches de compilacion.
- Memoria del contenedor: limite de 100 GiB sin swap. Utilizacion de memoria de GPU configurada en 0,770.
- Paralelismo de tensores: 1. No se documenta despliegue multi-GPU ni multi-nodo.
- Carga de trabajo configurada: limite de 8 secuencias activas, presupuesto de tokens por lote de 8.192, contexto maximo de 131.072 tokens, KV cache en BF16.
- Software necesario: Docker, runtime de contenedores de NVIDIA, imagen ARM64 de vLLM 0.30.0 obtenida por digest de registro, Transformers 5.17.0 en modo offline.
- Opciones de despliegue descartadas por el autor: una instalacion generica de Transformers, llama.cpp u Ollama no es un cargador verificado para este paquete.
- Rendimiento medido: 37,29 tok/s en prosa y 51,60 tok/s en codigo con un solo cliente; 89,55 tok/s agregados con cuatro clientes, en el perfil K1b. La latencia hasta el primer token en documentos en frio de 8.045 y 32.058 tokens fue de 3,99 s y 14,46 s respectivamente en ese perfil.
- El lanzador arranca en primer plano con `python3 runtime/serve.py --port 8000` y expone una API compatible con OpenAI.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base sin cuantizar ni de modelos competidores en la informacion proporcionada, por lo que la comparacion se limita a aspectos de empaquetado y licencia.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DevelopingDad/Qwen3.8-Flash-Next-Uncensored-NVFP4-DGX-Spark | ~180.000 millones | 131.072 tokens | NVFP4 + MTP en FP8 | qwen-community-1.0 | HuggingFace, 0 descargas, 0 likes en el momento de la consulta |
| orcarouter/Qwen3.8-Flash-Next-Uncensored-NVFP4 (upstream) | ~180.000 millones (no confirmado en la documentacion) | no disponible | NVFP4 | no disponible | HuggingFace, revision fijada |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | no disponible | sin cuantizar (presumiblemente BF16) | no disponible | HuggingFace |

No se han encontrado en la informacion proporcionada alternativas de la misma categoria (vision-language de ~180B cuantizadas en NVFP4) con datos comparables.

## Limitaciones y advertencias

- Se trata de un paquete de despliegue, no de un modelo nuevo: los pesos no se han fine-tuneado, fusionado ni recuantizado para este repositorio. Cualquier problema de calidad proviene del punto de control upstream.
- La variante esta etiquetada como "uncensored" y "abliterated". Esto implica la eliminacion o reduccion de los mecanismos de rechazo, con consecuencias legales, eticas y de calidad: mayor probabilidad de generar contenido danino, ofensivo o inexacto, y posible degradacion general de capacidades respecto al modelo original. No se documenta el metodo de abliteracion aplicado.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual ni de tasas de alucinacion. Las mediciones aportadas son exclusivamente de velocidad.
- Sesgos conocidos: no hay informacion sobre evaluaciones de sesgo en la documentacion proporcionada.
- Limitaciones idiomaticas: solo se declaran ingles (en) y chino (zh). No hay soporte declarado de castellano ni de otras lenguas, y el vocabulario borrador de la decodificacion especulativa esta reducido a ingles y codigo.
- Restricciones de licencia: la licencia es `qwen-community-1.0` (declarada como `license: other`). Es necesario revisar el archivo LICENSE antes de cualquier uso comercial; la model card no resume los terminos.
- Dependencia de hardware: solo esta cualificado en DGX Spark/GB10 con 128 GB de memoria unificada y ARM64. En otro hardware, el rendimiento y la estabilidad no estan verificados.
- Dependencia de parches de runtime: el paquete incluye parches propios que el lanzador monta automaticamente. Ejecutar `vllm serve` de forma estandar no los reproduce, por lo que los resultados y la estabilidad pueden diferir.
- El limite de 8 secuencias es un limite del planificador: el autor advierte que no se han cualificado ocho peticiones simultaneas a contexto completo.
- Memoria del host: el despliegue se ejecuta con un limite de contenedor de 100 GiB sin swap. Es necesario disponer de memoria suficiente y monitorizar la maquina durante la carga inicial y el calentamiento.
- Reputacion del repositorio: 0 descargas y 0 likes en el momento de la consulta, y ninguna validacion independiente de los checksums mas alla de lo declarado en `provenance.json`.
- No se ha verificado la integridad de la cadena de custodia mas alla de la revision upstream fijada; conviene comprobar los hashes SHA256 antes de desplegar en produccion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/DevelopingDad/Qwen3.8-Flash-Next-Uncensored-NVFP4-DGX-Spark
- Modelo upstream de OrcaRouter: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored-NVFP4
- Revision fijada del upstream: `38efbffeb2152219d979336d46371578c1177b98`
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Metadatos de procedencia (tamanos de checkpoint, hashes SHA256, parches de runtime y digest de la imagen): `provenance.json` en el repositorio
- Model card y configuracion originales del upstream: directorio `upstream/` del repositorio
- Resultados de rendimiento detallados por oleada: `results/performance.json` en el repositorio
