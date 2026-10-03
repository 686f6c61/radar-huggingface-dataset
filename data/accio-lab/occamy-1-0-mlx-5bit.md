# Accio-Lab/occamy-1.0-MLX-5bit

## Resumen

Occamy-1.0 MLX 5-bit es un checkpoint cuantizado del modelo Occamy-1.0, desarrollado por Accio-Lab y distribuido en formato nativo MLX. Se trata de una cuantización affine de 5 bits con group size 64 aplicada directamente desde BF16, con 34.660.608.768 parámetros totales y un archivo de pesos de 23.838.823.629 bytes (23,84 GB, 22,202 GiB). La entrada es exclusivamente texto: visión y MTP se distribuyen como exportaciones separadas.

La arquitectura es de mezcla de expertos, con la etiqueta `qwen3_5_moe` en el repositorio. Durante la conversión se apilaron 30.720 tensores de expertos independientes en 120 grupos. El checkpoint forma parte de una familia MLX publicada en 8, 6, 5, 4 y 3 bits, además de variantes mxfp8, mxfp4 y nvfp4, y convive con un export NVFP4 para NVIDIA y con conversiones GGUF de terceros.

Su relevancia práctica es que permite ejecutar un modelo de ~34,7 B en hardware Apple Silicon con memoria unificada moderada, manteniendo una perplejidad casi idéntica a la del modelo en BF16 en la comprobación pareada publicada por el autor (8,3075 frente a 8,3074). Se publica como "candidate release": la aceptación en Apple Metal está pendiente y el autor no reclama ninguna clasificación de velocidad. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); etiqueta de arquitectura `qwen3_5_moe` en el repositorio |
| Parametros totales | 34.660.608.768 (~34,66 B) |
| Parametros activos | no disponible (es un modelo MoE, pero el numero de parametros activos no figura en la informacion proporcionada) |
| Longitud de contexto | no disponible (la validacion pareada uso contexto 512; no es la ventana del modelo) |
| Tipos de cuantizacion | Este checkpoint: MLX `affine` 5 bits, group size 64, desde BF16; puertas de router y de expertos compartidos en `affine` 8 bits, group size 64. Familia MLX completa: 3, 4, 5, 6 y 8 bits, mxfp8, mxfp4 y nvfp4 |
| Idiomas soportados | no disponible (no se declaran idiomas; las pruebas del autor cubren instrucciones en ingles y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato nativo MLX (libreria `mlx`); tamanos de pesos 23.838.823.629 bytes; tamano del repositorio 23,9 GB |
| Modelo base | Accio-Lab/occamy-1.0 (BF16), revision `8f8e0e58a3c9df042be1a3fa2c191fd8047acfb8` |
| Herramientas de exportacion y validacion | mlx 0.32.2, mlx-lm 0.31.3, transformers 5.8.1 |
| Entradas | solo texto; vision y MTP son exportaciones separadas |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos. La model card no detalla el numero de capas, el numero de expertos por capa ni la estrategia de enrutamiento, pero si aporta un dato estructural indirecto: el adaptador de conversion apilo 30.720 tensores de expertos independientes en 120 grupos en orden numerico e invoco una unica vez el saneador oficial. Las comprobaciones del autor incluyen sondas de los kernels nativos SwitchLinear/MoE en CPU y CUDA para los cuatro modos probados, lo que confirma que la ruta de ejecucion es la de un MoE con capas de expertos conmutadas.

Sobre el entrenamiento no hay informacion publica en el material disponible: no se indica el numero de tokens, la composicion del dataset ni si hubo RLHF, DPO u otra fase de alineamiento. La unica referencia tecnica es el informe "Occamy-1.0: Open Pareto-frontier 35B Intelligence for Co-work" (arXiv:2609.11977). En cuanto a la cuantizacion, la conversion usa las API nativas estandar de MLX sin entrada recuantizada y aplica un adaptador sin perdida para apilar los tensores de expertos; los pesos exportados se recargan directamente con mlx-lm estandar, sin adaptador. La validacion cubre todos los valores en coma flotante almacenados, la desquantizacion nativa de cada fila en los 512 modulos cuantizados, los archivos exactos de tokenizador y plantilla, la recarga estricta con la libreria estandar y logits de inferencia finitos sobre el vocabulario completo. La familia incluye un modo de razonamiento activable mediante la plantilla de chat (`enable_thinking`).

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `text-generation` y la etiqueta incluye `conversational`.
- Modo de razonamiento: la plantilla de chat admite `enable_thinking`; los ejemplos de la model card lo desactivan explicitamente.
- Instrucciones en ingles y chino: las ocho fixtures codificadas por el autor cubren instrucciones en ambos idiomas.
- Aritmetica basica: incluida en las fixtures de validacion (por ejemplo, "Compute 2+2").
- Salida en JSON: incluida en las fixtures de validacion.
- Memoria de conversacion: incluida en las fixtures de validacion (8/8 superadas).
- Capacidades multilingues: no declaradas formalmente; no se publica lista de idiomas.
- Tool calling / function calling: no soportado de forma verificada; el autor indica que la aceptacion de integracion con herramientas y agentes sigue sin verificar.
- Agentes y razonamiento multi-paso: sin verificar por el autor.
- Vision: no. El modelo es solo texto y la vision se distribuye por separado.
- MTP (multi-token prediction): no incluido; exportacion separada.

## Casos de uso

- Asistente conversacional local en Mac: con `mlx_lm.server` se expone un endpoint compatible con OpenAI (`/v1/chat/completions`) y el modelo se usa como backend de un cliente existente sin enviar datos a servicios externos. Adecuado porque el checkpoint esta pensado para ejecucion local con memoria unificada.
- Razonamiento analitico con modo thinking: activando `enable_thinking` en la plantilla de chat, el modelo puede desplegar cadenas de razonamiento antes de responder; util en tareas de analisis, planificacion o resolucion de problemas donde se prioriza la precision sobre la latencia.
- Generacion y explicacion de codigo en entorno de desarrollo: el modelo puede responder a peticiones de codigo desde un plugin local. Advertencia: el autor no probo codigo en este lote de validacion, por lo que el rendimiento en esta tarea no esta acreditado.
- Extraccion y estructuracion de datos: las fixtures JSON superadas indican que el modelo devuelve estructuras validas para tareas de parseo y normalizacion de texto en pipelines de datos.
- Atencion al cliente en ingles y chino: el par de idiomas cubierto por las pruebas del autor permite atender conversaciones multi-turno en esos dos mercados con salida en JSON para integrar con CRM.
- Prototipado y comparacion de cuantizaciones: al existir la misma familia en 3, 4, 5, 6 y 8 bits, sirve para medir el equilibrio entre memoria y calidad en un mismo hardware antes de fijar una version de produccion.
- Despliegue en servidor con GPU NVIDIA: la receta se valido en Linux con MLX CUDA 12 sobre NVIDIA B200, de modo que es viable servir el modelo en infraestructura CUDA mediante MLX en lugar de Apple Silicon.
- Investigacion sobre cuantizacion: el par BF16 / 5 bits con PPL practicamente identicas (8,3074 frente a 8,3075) es un punto de referencia util para estudiar la degradacion introducida por cuantizaciones agresivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo publica la siguiente comprobacion pareada con el modelo base en BF16, medida con el mismo tokenizador, 8.192 IDs de token, 16 fragmentos independientes a contexto 512 y 4.096 tokens puntuados, con un prefijo no puntuado de 256 tokens y estado de modelo nuevo en cada fragmento:

| Comprobacion nativa MLX | PPL en subconjunto retenido de WikiText |
|---|---:|
| BF16 (modelo base) | 8,3074 |
| MLX 5-bit | 8,3075 |

El propio autor advierte que esta prueba es pequena y no establece la calidad completa del modelo, y que solo debe compararse dentro del evaluador nativo MLX (los resultados GGUF usan un protocolo de runtime distinto). Ademas de esta tabla, se reportan 8/8 fixtures greedy cacheadas superadas (instrucciones en ingles y chino, aritmetica, JSON y memoria de conversacion) y 2/2 comprobaciones HTTP del servidor estandar. Metal, contexto largo, codigo, herramientas, vision y throughput no se probaron en este lote.

## Requisitos de hardware

- VRAM y memoria: el archivo de pesos ocupa 22,202 GiB (23,84 GB). Hay que sumar caché KV y activaciones, que dependen de la longitud de contexto y del numero de secuencias concurrentes (dato no publicado). Estimacion a partir del tamano de pesos: se necesita al menos un sistema con 32 GB de memoria utilizable, y 48 GB o mas para margenes comodos.
- Apple Silicon: es el destino principal del formato MLX. Mac con memoria unificada de 32 GB o superior. Advertencia importante: la aceptacion en Metal esta pendiente y la inferencia y el rendimiento en Apple Silicon siguen sin verificar.
- GPU NVIDIA: las comprobaciones de Linux se hicieron con MLX CUDA 12 sobre una NVIDIA B200. Con 24 GB de VRAM (RTX 4090) los pesos de 22,2 GiB dejan un margen muy reducido para caché KV y activaciones, por lo que en esa clase de tarjeta la ejecucion es dudosa sin reducir contexto o concurrencia.
- GPU consumer: solo cabria en tarjetas de 24 GB o mas con contexto corto; no se recomienda como configuracion de produccion con este checkpoint de 5 bits.
- Opciones de despliegue: `mlx-lm` en Python (receta oficial con `mlx==0.32.2`, `mlx-lm==0.31.3`, `transformers==5.8.1`), servidor HTTP local compatible con OpenAI mediante `mlx_lm.server` con `--chat-template-args '{"enable_thinking":false}'`. En CUDA, mediante MLX CUDA. Existen ademas conversiones GGUF de terceros para llama.cpp u Ollama, que son artefactos distintos con su propio protocolo de medida.
- Latencia y throughput: no disponibles. El autor no reclama ninguna clasificacion de velocidad y no se publicaron mediciones de tokens por segundo.

## Comparativa con modelos similares

Datos comparables a nivel de nombre obtenidos en la busqueda web; para el resto de campos no hay informacion disponible:

| Modelo | Parametros | Contexto | Cuantizacion / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Accio-Lab/occamy-1.0-MLX-5bit | 34,66 B (MoE) | no disponible | MLX affine 5 bits, group size 64 | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| Accio-Lab/occamy-1.0 (base) | 34,66 B (MoE) | no disponible | BF16 | Apache 2.0 | HuggingFace |
| lmstudio-community/Qwen3.8-27B-MLX-5bit | no disponible | no disponible | MLX 5 bits | no disponible | HuggingFace |
| Ornith-1.0-35B-MLX-5bit | no disponible | no disponible | MLX 5 bits | no disponible | HuggingFace |
| bartowski/occamy-ai_occamy-1.0-GGUF | no disponible (mismo modelo base) | no disponible | GGUF | no disponible | HuggingFace |

Dentro de la propia familia MLX de Occamy-1.0 existen alternativas directas en 8, 6, 4 y 3 bits, ademas de mxfp8, mxfp4 y nvfp4, lo que permite comparar calidad y memoria sobre el mismo modelo base sin cambiar de arquitectura.

## Limitaciones y advertencias

- Version candidata: la model card indica explicitamente que la aceptacion en Apple Metal esta pendiente y que la inferencia y el rendimiento en Apple Silicon siguen sin verificar.
- Cobertura de validacion parcial: contexto largo, codigo, uso de herramientas, vision y throughput no se probaron en este lote.
- Sin benchmarks estandar: no hay MMLU, HumanEval, GSM8K ni resultados equivalentes; la unica medida de calidad es una PPL pareada de 4.096 tokens, que el propio autor califica de prueba pequena.
- Tool calling y agentes sin verificar: la aceptacion de integracion con herramientas y agentes queda pendiente, por lo que no debe asumirse soporte fiable de function calling en produccion.
- Idiomas no declarados: no se publica lista de idiomas soportados; solo hay evidencia de pruebas en ingles y chino.
- Longitud de contexto desconocida: no se especifica en la informacion disponible. El valor 512 corresponde al protocolo de validacion, no a la ventana del modelo.
- Consumo de memoria de un MoE: la cuantizacion a 5 bits reduce el peso, pero todos los expertos deben residir en memoria durante la inferencia; el espacio para caché KV y concurrencia es el factor limitante en GPUs de 24 GB.
- Alucinacion y sesgos: no hay documentacion especifica del autor sobre sesgos ni tasas de alucinacion. Como en cualquier modelo de lenguaje entrenado a gran escala, existe riesgo de generar contenido incorrecto con apariencia de verosimilitud; no debe usarse sin verificacion en dominios de alta criticidad.
- Licencia: Apache 2.0 permite uso comercial, pero el autor solicita citar el informe original al utilizar el modelo.
- Artefactos no equivalentes: NVFP4, MLX (varias precisiones) y GGUF son exportaciones distintas con protocolos de medida distintos; los resultados no son directamente comparables entre si.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-5bit
- Modelo base: https://huggingface.co/Accio-Lab/occamy-1.0/tree/8f8e0e58a3c9df042be1a3fa2c191fd8047acfb8
- Coleccion Occamy-1.0: https://huggingface.co/collections/Accio-Lab/occamy-10-6ac00729659e8a86ec11e216
- Coleccion MLX: https://huggingface.co/collections/Accio-Lab/occamy-10-mlx-6ac0072a7c1cdbc5e418e90b
- Explorador de checkpoints: https://huggingface.co/spaces/Accio-Lab/Occamy-Explorer
- Pagina del proyecto: https://accio-lab.github.io/occamy/
- Paper: https://arxiv.org/abs/2609.11977
- Variantes MLX de la familia: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-8bit, https://huggingface.co/Accio-Lab/occamy-1.0-MLX-6bit, https://huggingface.co/Accio-Lab/occamy-1.0-MLX-4bit, https://huggingface.co/Accio-Lab/occamy-1.0-MLX-3bit, https://huggingface.co/Accio-Lab/occamy-1.0-MLX-mxfp8, https://huggingface.co/Accio-Lab/occamy-1.0-MLX-mxfp4, https://huggingface.co/Accio-Lab/occamy-1.0-MLX-nvfp4
- Export NVFP4 para NVIDIA: https://huggingface.co/Accio-Lab/occamy-1.0-NVFP4
- Conversion GGUF de terceros: https://huggingface.co/bartowski/occamy-ai_occamy-1.0-GGUF
- Licencia: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-5bit/blob/main/LICENSE
- Ficheros de validacion citados en la model card: `validation_summary.json`, `validation.json`, `api_validation.json`, `conversion.json`, `SHA256SUMS`, `quality/README.md`, `layout_adapter.py` (en el repositorio del modelo)
