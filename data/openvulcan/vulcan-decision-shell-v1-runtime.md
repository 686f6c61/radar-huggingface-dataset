# openvulcan/vulcan-decision-shell-v1-runtime

## Resumen

vulcan-decision-shell-v1-runtime es un paquete de distribucion ONNX de la familia de clasificadores vulcan-decision-shell-v1, desarrollada por openvulcan. No es un modelo generativo, sino un conjunto de tres clasificadores de texto (mini, flash y standard) entrenados para emitir una decision de tres clases —`allow`, `review` o `block`— sobre llamadas a herramientas y comandos propuestos por agentes de codigo. Resuelve un problema acotado y muy concreto: interponer una capa de revision determinista y de baja latencia entre un agente que sugiere ejecutar un comando y el sistema que finalmente lo ejecuta.

La familia se compone de tres variantes que solo difieren en tamano: mini (0,2B parametros), flash (0,36B) y standard (0,8B). Las tres comparten exactamente los mismos ficheros, la misma interfaz de grafo (`input_ids` y `attention_mask` de entrada, `logits` de salida) y el mismo esquema de configuracion, de modo que un host puede intercambiarlas sin cambiar el codigo de integracion. El modelo base declarado es openvulcan/vulcan-decision-shell-v1, con relacion de cuantizacion.

El repositorio pesa 5,1 GB e incluye pesos ONNX, tokenizador, texto de politica, un catalogo de seleccion por dispositivo y validaciones de entrega. La relevancia actual es practica: los agentes de codigo autonomos ejecutan comandos con permisos elevados y necesitan guardarrailes mas baratos y auditables que un LLM generativo completo. Este modelo esta pensado para ese rol, con soporte de CUDA y WebGPU y una licencia Apache 2.0 permisiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder para clasificacion de secuencias, exportado a ONNX (grafo `input_ids`, `attention_mask` -> `logits` de 3 clases) |
| Parametros totales | mini: 0,2B; flash: 0,36B; standard: 0,8B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | mini: 8192 tokens; flash: 32768 tokens; standard: 32768 tokens |
| Tipos de cuantizacion | FP16 (paquetes incluidos); FP32 para mini en CPU; BF16, INT8 y FP16 completo quedan en los repositorios ONNX por modelo y no se incluyen |
| Idiomas soportados | ingles (declarado `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`), con tokenizador en `assets/tokenizer.json` y manifiesto `MANIFEST.json` con SHA-256 por fichero |

Parametros de despliegue declarados en `runtime-config.json`:

| Parametro | mini | flash | standard |
|---|---|---|---|
| `max_tokens` por llamada | 8192 | 32768 | 32768 |
| `max_request_items` | 256 | 256 | 256 |
| `micro_batch` | 8 | 16 | 32 |
| `padded_batch_tokens` | 8192 | 8192 | 8192 |
| `allow_margin` | 1.0 | 0 | 0 |
| `gpu_memory_limit_mib` | 12288 | 12288 | 12288 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que se trata de clasificadores de texto exportados a ONNX con una cabeza de tres clases en el orden `allow`, `review`, `block`. El grafo recibe `input_ids` y `attention_mask` con forma `[batch, sequence]` en int64 y devuelve `logits` con forma `[batch, 3]` en float32. Las filas se rellenan por la derecha y la mascara de atencion marca los tokens reales.

La logica de decision no es puramente `argmax`: la clase `allow` debe superar a la mejor de las otras dos por un margen (`allow_margin`) de 1.0 en mini y 0 en flash y standard; si no lo hace, la llamada se reclasifica como `review`. Este margen convierte al modelo en un sistema conservador por diseno en la variante mini. Hay ademas una diferencia fijada por entrenamiento en la codificacion de entrada: mini lee una cabecera de politica con tres marcadores `[MASK]`, mientras que flash y standard leen un unico prompt de decision en ingles. El texto de la politica con el que se entrenaron los pesos se distribuye en `assets/policy-v2.json`.

No se han publicado en la informacion disponible datos sobre volumen de tokens de entrenamiento, composicion del dataset, ni sobre uso de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal; el interes tecnico esta en el empaquetado reproducible (manifiesto con digests, catalogo de seleccion por dispositivo, validaciones de entrega con decision y recuento de tokens esperados) y en el batching por longitud con limites de tokens acolchados.

## Capacidades

- Clasificacion de llamadas a herramientas en tres clases: `allow`, `review` y `block`.
- Revision de comandos de shell y operaciones propuestas por agentes de codigo antes de su ejecucion.
- Evaluacion de decisiones de permiso en flujos de agente con tool calling.
- Procesamiento por lotes: hasta 256 llamadas por peticion, ordenadas por longitud y agrupadas respetando `micro_batch` y `padded_batch_tokens`.
- Ejecucion en CUDA mediante ONNX Runtime 1.30.0 (build CUDA 13) y en GPUs sin CUDA mediante el plugin WebGPU de ONNX Runtime.
- Ejecucion en CPU, funcional pero lenta.
- Autoverificacion integrada: `example-input.json` contiene nueve llamadas de comprobacion y `reports/delivery-validation.json` registra la decision y el recuento de tokens esperados de cada una.
- No genera texto, no razona de forma abierta, no soporta vision ni audio, y no se declara soporte multilingue mas alla del ingles.

## Casos de uso

- Guardarrail de comandos en agentes de codigo: antes de que el agente ejecute un comando de shell, el host envia la llamada al clasificador y solo procede si la decision es `allow`; los casos `review` se derivan a confirmacion humana y los `block` se rechazan. La latencia de 40 ms por llamada en WebGPU o 1,5 s para una llamada de 32K en GPU hace viable la intercepcion en linea.
- Revision de llamadas a herramientas en produccion: en un pipeline con tool calling, cada invocacion propuesta se clasifica antes de despacharse, lo que permite bloquear herramientas peligrosas o argumentos fuera de politica sin coste de un LLM generativo.
- Politica de permisos por proyecto: el texto de politica vive en `assets/policy-v2.json` y forma parte de la entrada del modelo, de modo que un equipo puede auditar exactamente contra que politica se tomo cada decision.
- Procesamiento por lotes de auditoria: con hasta 256 llamadas por peticion y batching por longitud, se puede reclasificar retroactivamente un registro de acciones de agente para detectar decisiones que deberian haber requerido revision.
- Despliegue en estaciones de trabajo sin CUDA: la ruta WebGPU permite ejecutar el guardarrail en GPUs de consumo integradas en el navegador o en entornos sin CUDA, con unos 17-40 ms por llamada en lotes de diez.
- Filtrado previo en entornos de CI/CD: clasificar comandos generados por agentes antes de permitir su ejecucion en runners, usando mini en CPU cuando no hay acelerador y standard en GPU cuando el volumen lo justifica.
- Seleccion adaptativa por dispositivo: `catalog.json` expone `families.<model>.recommended.<device>`, lo que permite que un host elija automaticamente mini/fp16 en CUDA y WebGPU, mini/fp32 en CPU, y flash o standard en funcion del presupuesto de memoria y latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos de rendimiento son mediciones de latencia del autor:

| Escenario | mini | flash | standard |
|---|---|---|---|
| Llamada corta en CPU | ~0,1 s | ~0,2 s | ~0,35 s |
| Llamada de 32K en GPU | no aplica (limite 8192) | ~1,5 s | ~2,8 s |
| Lote de diez en WebGPU | ~40 ms/llamada | ~17 ms/llamada | ~31 ms/llamada |
| Tamano del paquete FP16 | 487 MB | 822 MB | 1,53 GB |
| Tamano del paquete FP32 (solo mini, CPU) | 800 MB | no disponible | no disponible |

Las mediciones se realizaron unicamente en una RTX 5080 de 16 GB.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible. A continuacion se recogen las diferencias de posicionamiento frente a alternativas genericas de la misma categoria:

| Aspecto | vulcan-decision-shell-v1-runtime | LLM generativo como juez | Clasificador de seguridad generico |
|---|---|---|---|
| Funcion | Clasificacion de llamadas a herramientas en 3 clases | Evaluacion mediante prompt | Clasificacion de contenido |
| Parametros | 0,2B / 0,36B / 0,8B | Miles de millones | no disponible |
| Contexto | 8192 / 32768 / 32768 | Variable | no disponible |
| Latencia | 17-40 ms por llamada en WebGPU | Ordenes de magnitud mayor | no disponible |
| Salida | Logits de 3 clases con margen configurable | Texto libre, requiere parseo | Etiqueta |
| Licencia | Apache 2.0 | Variable | Variable |
| Formato | ONNX con manifiesto y digests | Safetensors, GGUF | Variable |

## Limitaciones y advertencias

- Solo admite ingles; no se declara soporte de otros idiomas, lo que limita su uso con politicas o comandos redactados en castellano.
- Las llamadas que superan `max_tokens` no se evaluan: 8192 en mini y 32768 en flash y standard. Un host debe tratar ese caso explicitamente y no asumir `allow`.
- El limite de 8192 de mini se debe a que su contexto base es 8192 y las llamadas mas largas no estan probadas.
- La logica de decision depende de un margen (`allow_margin`) que en mini es 1.0, lo que desplaza muchas llamadas a `review`; un operador debe dimensionar el flujo de revision humana en consecuencia.
- La codificacion de entrada difiere entre variantes (cabecera con tres `[MASK]` en mini, prompt de decision en flash y standard); usar la codificacion equivocada invalida las decisiones.
- BF16, INT8 y FP16 completo no se incluyen porque, segun el autor, cambian las decisiones o no aportan ganancia de velocidad.
- Las mediciones de latencia proceden de una unica GPU (RTX 5080 16 GB) y no hay datos de otras plataformas.
- No se documentan evaluaciones de sesgo, tasas de falsos positivos y negativos, ni comportamiento frente a entradas adversarias; en un guardarrail de seguridad esta ausencia es un riesgo relevante para produccion.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, sin validacion externa conocida.
- La licencia Apache 2.0 permite uso comercial, pero no se ofrece ninguna garantia sobre la idoneidad del modelo como unico mecanismo de control de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openvulcan/vulcan-decision-shell-v1-runtime
- Modelo base: https://huggingface.co/openvulcan/vulcan-decision-shell-v1
- Variante flash del modelo base: https://huggingface.co/openvulcan/vulcan-decision-shell-v1-flash
- Variante mini del modelo base: https://huggingface.co/openvulcan/vulcan-decision-shell-v1-mini
- README en chino: README.zh.md dentro del repositorio del modelo
- ONNX Runtime: https://onnxruntime.ai/
- No se han encontrado en la informacion disponible papers, blogs, repositorios de codigo ni demos adicionales.
