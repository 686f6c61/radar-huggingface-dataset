# mlx-community/clairic-4bit

## Resumen

Clairic es un modelo de extraccion estructurada de informacion desarrollado por Cloudflare, distribuido originalmente bajo licencia Apache 2.0. No es un modelo conversacional: recibe un *estado* (texto, JSON, imagenes o PDFs) y un esquema de campos tipados, y devuelve un valor tipado por campo acompanado de una confianza y una probabilidad de nulo. Esta ficha cubre la conversion a 4 bits realizada por mlx-community para Apple Silicon, que empaqueta el pipeline de inferencia original de Cloudflare y sustituye su motor PyTorch/CUDA por uno implementado en MLX.

El modelo base tiene 4.685.368.560 parametros (~4,69 mil millones) y una ventana de contexto de 65.000 tokens, con soporte de hasta cuatro imagenes o paginas de PDF por peticion y un limite de 4 MiB por fichero embebido. La relevancia de esta version concreta radica en que permite ejecutar el pipeline completo de extraccion estructurada en hardware Apple Silicon sin GPU NVIDIA, manteniendo el mismo formato de peticion y respuesta que el runtime upstream.

La arquitectura declarada en los metadatos es `qwen3_5`, lo que sugiere un backbone derivado de la familia Qwen 3.5, aunque la model card no detalla la composicion exacta del transformer ni los datos de entrenamiento. La conversion incluye un modulo de codigo personalizado (`clairic_runtime/`) y una cabeza tipada separada (`clair_head.safetensors`) que es imprescindible para reproducir el comportamiento del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (tag `qwen3_5`), con cabeza tipada adicional para valores temporales y numericos |
| Parametros totales | 4.685.368.560 (~4,69 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.000 tokens |
| Tipos de cuantizacion | 4 bits (esta version); el modelo base admite bfloat16 en el runtime oficial |
| Idiomas soportados | no disponible (la validacion de fidelidad menciona cuatro idiomas sin especificarlos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), mas `clair_head.safetensors` y codigo Python en `clairic_runtime/` |

## Arquitectura y entrenamiento

El modelo se apoya en un backbone transformer multimodal identificado por el tag `qwen3_5`, capaz de procesar texto, imagenes y documentos PDF como entrada. Sobre ese backbone, Cloudflare anade una cabeza tipada independiente que lee un unico forward pass de los estados ocultos y produce directamente valores de tipo `date`, `time`, `datetime`, `duration`, `compute`, `estimate` y `forecast`, asi como listas de fechas. El resto de tipos de campo (`text`, `number`, `boolean`, `enum`, `object` y listas de estos) se resuelven mediante decodificacion restringida por gramatica, generando un prompt corto por campo o por elemento de lista.

El pipeline de peticiones es parte integral del modelo: reescribe cada campo en su propio prompt, construye una gramatica a partir del esquema del campo (y del propio documento cuando los valores se copian literalmente), puntua la probabilidad de nulo, reintenta cuando es necesario y ensambla listas y tablas. Esta version de mlx-community conserva el pipeline original de Cloudflare (`clairic_runtime/`, Apache 2.0) y reemplaza unicamente el motor de ejecucion por `clairic_runtime/mlx_engine.py`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Extraccion de campos tipados (`text`, `number`, `boolean`, `enum`, `object`, listas) mediante decodificacion restringida por gramatica.
- Extraccion de valores temporales (`date`, `time`, `datetime`, `duration`) y listas de fechas mediante cabeza tipada.
- Calculo de valores numericos (`compute`) a partir de datos del estado.
- Estimaciones (`estimate`) y previsiones (`forecast`) con horizonte e intervalo configurables, devolviendo distribuciones y cuantiles opcionales.
- Entrada multimodal: imagenes (PIL, rutas de fichero o data URIs base64) y documentos PDF, hasta cuatro imagenes o paginas por peticion.
- Procesamiento de documentos largos, con contextos validados de 1.000 a 39.000 tokens.
- Soporte multilingue parcial: la validacion de fidelidad cubre cuatro idiomas no especificados.
- Salida con confianza por campo y probabilidad de nulo, con opcion `nullable`.
- Opciones por campo: `instructions`, `decimals`, `unit`, `enum`, `source_only`, `knowledge`, `reference_date`.
- Servidor HTTP local con endpoint `/v1/systemone`, autenticacion opcional por bearer token (`CLAIRIC_API_KEY`) y API asincrona (`predict_async`).
- No es un modelo de chat: no mantiene conversaciones multi-turno ni genera texto libre.

## Casos de uso

- Extraccion de datos de facturas: el modelo recibe el texto o la imagen de una factura y un esquema con campos como proveedor, total, fecha de emision y lista de conceptos, devolviendo valores tipados con confianza. Es adecuado porque combina decodificacion restringida para texto y cabeza tipada para fechas e importes.
- Procesamiento de tickets de soporte: a partir de un correo o formulario, se definen campos como categoria (`enum`), prioridad (`enum`), producto afectado (`text`) y fecha de incidencia (`date`), lo que permite enrutar automaticamente sin postprocesado de texto libre.
- Digitalizacion de recibos y documentos escaneados: con entrada de imagen (`receipt.png`) y campos de comercio, total y fecha, el modelo extrae los valores directamente de la imagen, hasta cuatro imagenes por peticion.
- Prevision de demanda: con una serie historica como estado textual y campos de tipo `forecast` con `horizon` e `interval`, devuelve una distribucion y cuantiles opcionales, util para planificacion operativa.
- Extraccion de datos de PDFs largos: documentos de hasta 39.000 tokens validados y un limite de contexto de 65.000 tokens permiten procesar contratos o informes extensos con un unico esquema de campos.
- Enriquecimiento de datos en pipelines locales: el servidor HTTP en el puerto configurable y el endpoint `/v1/systemone` permiten integrar la extraccion en flujos internos sobre un Mac Apple Silicon, sin depender de GPUs NVIDIA.
- Extraccion con conocimiento previo: las opciones `knowledge` y `reference_date` permiten resolver campos que requieren contexto adicional o normalizacion temporal respecto a una fecha de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye unicamente una validacion de fidelidad frente al runtime oficial de Cloudflare en un NVIDIA H100 con bfloat16: 81 peticiones con respuestas conocidas (facturas, tickets, fechas y horas, valores calculados, listas y tablas, todas las opciones de campo, cuatro idiomas, documentos de 1k a 39k tokens, 13 peticiones de imagen y 3 de PDF), que contienen 262 campos con valores exactos ademas de estimaciones y previsiones. La tabla comparativa de esa validacion (campos con el mismo valor, prompts decodificados a los mismos tokens y lecturas de cabeza tipada con los mismos valores) aparece truncada en la informacion proporcionada, por lo que no se reproducen cifras.

## Requisitos de hardware

- Requiere un Mac con Apple Silicon y Python 3.11 o superior (probado con 3.12).
- Memoria en reposo: 16 GB; hasta 24 GB en las peticiones medidas por el autor.
- Minimo practico: 32 GB de memoria unificada; 48 GB para un uso holgado.
- No cabe en GPUs de consumo tipo RTX 4090: esta version esta disenada exclusivamente para MLX sobre Apple Silicon.
- Despliegue mediante el paquete incluido (`clairic_mlx`), la CLI `clairic_mlx.py` o el servidor `server.py` con endpoint `/v1/systemone`.
- El servidor atiende una peticion a la vez; cada peticion se expande internamente en multiples prompts batcheados, por lo que las peticiones concurrentes esperan turno.
- `xgrammar`, el motor de gramaticas, depende de PyTorch y hace que `pip` instale `torch`, aunque la inferencia del modelo se ejecuta integramente en MLX.
- Latencia y throughput concretos: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mlx-community/clairic-4bit | ~4,69 mil millones | 65.000 tokens | Extraccion estructurada multimodal con cabeza tipada | Apache 2.0 | Hugging Face (MLX, Apple Silicon) |
| Cloudflare/clairic | no disponible | 65.000 tokens | Extraccion estructurada multimodal, runtime PyTorch/CUDA | Apache 2.0 | Hugging Face (modelo base) |
| mlx-community/clairic-flash-4bit | no disponible | no disponible | Version reducida de la familia Clairic | Apache 2.0 | Hugging Face (MLX, Apple Silicon) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat: no admite conversaciones multi-turno ni generacion de texto libre; usarlo como tal no reproduce su comportamiento.
- `mlx_lm.load` y `mlx_vlm.load` cargan el backbone pero no reproducen Clairic: es obligatorio usar el codigo incluido en `clairic_runtime/` y la cabeza tipada `clair_head.safetensors`.
- Limite de cuatro imagenes o paginas de PDF por peticion y de 4 MiB por fichero embebido.
- Ventana de contexto maxima de 65.000 tokens.
- El servidor procesa una peticion cada vez; no esta pensado para alta concurrencia.
- Dependencia de `xgrammar` y, por tanto, de PyTorch en la instalacion, aunque la inferencia sea MLX.
- Idiomas soportados no documentados; la validacion cubre solo cuatro idiomas sin especificar.
- No hay informacion publica sobre sesgos, tasa de alucinacion ni datos de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el codigo del pipeline deben conservar sus avisos de atribucion.
- Esta version esta limitada a Apple Silicon; para CUDA debe usarse el modelo base de Cloudflare.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlx-community/clairic-4bit
- Modelo base: https://huggingface.co/Cloudflare/clairic
- Version reducida de la familia: https://huggingface.co/mlx-community/clairic-flash-4bit
- MLX: https://github.com/ml-explore/mlx
