# JMNI-Labs/DeepSeek-V4.1-Flash-1017-TrellisMX-FLARE

## Resumen

DeepSeek-V4.1-Flash-1017-TrellisMX-FLARE es un paquete de despliegue distribuido publicado por JMNI-Labs para servir el checkpoint comunitario `brandonmusic/DeepSeek-V4.1-Flash-1017-TrellisMX-K2-Mix`, un afinamiento del modelo base `deepseek-ai/DeepSeek-V4.1-Flash-1017` de DeepSeek. No se trata de un modelo entrenado desde cero por JMNI-Labs, sino de un artefacto de empaquetado (formato Flare) que incluye pesos cuantizados, kernels especificos y configuracion de servicio para dos nodos DGX Spark con GPUs GB10 (SM121).

El paquete resuelve un problema de infraestructura: permitir la inferencia tensor-parallel (TP2) de un modelo multimodal de gran tamano sobre dos estaciones DGX Spark conectadas por RoCE ConnectX-7, con expertos enrutados almacenados como streams sidecar TrellisMX (variantes K2, K3 y K4) y tablas Engram en 4 bits. La carga firmada ocupa 259 GiB y se distribuye entre ambos nodos.

Es relevante ahora porque demuestra un patron de despliegue de modelos abiertos de gran escala en hardware de escritorio de gama alta (dos Spark), con decodificacion especulativa multi-token (MTP) y ventanas de contexto de hasta 1.048.576 tokens por peticion. La licencia es MIT tanto en el paquete como en los pesos base y el pack TrellisMX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y expertos compartidos; vision y tokenizer heredados del modelo base; expertos enrutados en streams TrellisMX K2/K3/K4 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el modelo es MoE segun la descripcion de expertos enrutados) |
| Longitud de contexto | 1.048.576 tokens por peticion (sujeto a memoria KV); 16,6 millones de tokens agregados en KV entre ambos nodos |
| Tipos de cuantizacion | Expertos enrutados: TrellisMX K2/K3/K4; tablas Engram: 4-bit K4; pesos del paquete: no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Paquete Flare firmado (259 GiB); no se especifican safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con mezcla de expertos (MoE) que conserva del modelo oficial la atencion, los expertos compartidos, el modulo MTP (multi-token prediction), la torre de vision y el tokenizer. La innovacion del paquete reside en como se almacenan y sirven los expertos enrutados: en lugar de residir en VRAM de forma estatica, se presentan como streams sidecar TrellisMX en variantes K2, K3 y K4, con las tablas Engram decodificadas en 4 bits. Esto reduce la huella de memoria por nodo y permite repartir el modelo en TP2 entre dos DGX Spark.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base. El paquete en si no entrena pesos: es un artefacto de despliegue producido por la rama de motor `ds41-trellismx` (PR upstream NVIDIA/spark-local-inference#161) e incluye el overlay fijado `vendor/ds41_trellismx` y `vendor/ds41_kern/b12x`. Entre las tecnicas de inferencia destacadas: decodificacion especulativa MTP con hasta cinco tokens borrador verificados, chunks de prefill de 8192 tokens y 16 slots de concurrencia.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno mediante API compatible con OpenAI (`/v1/chat/completions`).
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), heredado de la torre de vision del modelo base.
- Decodificacion especulativa MTP con hasta cinco tokens borrador por paso, orientada a reducir latencia en generacion.
- Soporte de contexto muy largo: hasta 1.048.576 tokens por peticion, limitado por la memoria KV disponible.
- Servicio concurrente: 16 slots de peticion simultaneas configurados por defecto.
- Capacidades de tool calling, agentes y modo thinking: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Analisis de documentos extensos: con una ventana de hasta 1.048.576 tokens por peticion, el modelo puede ingerir libros tecnicos, expedientes o bases de codigo completas en una sola llamada, algo inviable en modelos con contexto de 32K o 128K.
- Procesamiento multimodal de imagenes y texto en local: el pipeline `image-text-to-text` permite construir asistentes que describan diagramas, capturas o documentacion escaneada sin enviar datos a APIs externas, usando dos DGX Spark en una red RoCE.
- Despliegue en infraestructura de escritorio de gama alta: el paquete esta pensado para dos estaciones DGX Spark (GB10, 48 SMs cada una), lo que permite servir un modelo de gran escala en un entorno controlado sin depender de clústeres de centros de datos.
- Experimentacion con cuantizacion TrellisMX: investigadores pueden evaluar el impacto de las variantes K2/K3/K4 en calidad y throughput sobre el mismo checkpoint, comparando configuraciones de expertos enrutados y tablas Engram 4-bit.
- Servicio de inferencia compatible con OpenAI para prototipos: la API expuesta en `http://FIRST_SPARK:8000/v1` permite conectar clientes existentes (SDKs de OpenAI, LangChain, etc.) sin cambios de codigo, util para validar productos antes de migrar a produccion.
- Evaluacion de decodificacion especulativa MTP: el paquete permite medir la ganancia de latencia de los cinco tokens borrador verificados frente a decodificacion autoregresiva clasica en hardware GB10.
- Investigacion en paralelismo tensorial de bajo nivel: sirve como banco de pruebas para TP2 sobre ConnectX-7 RoCE y para el desarrollo de la rama `ds41-trellismx` del motor Flare.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Dos nodos DGX Spark (GB10/SM121, 48 SMs cada uno) con DGX OS basado en Ubuntu 24.04, drivers NVIDIA funcionales y ConnectX-7 RoCE.
- Espacio en disco: aproximadamente 259 GiB libres en el primer Spark para el paquete, mas espacio para la carga rank-1 en el nodo par.
- Memoria unificada: el servicio por defecto asigna unos 14 GiB de KV en total (16,6 millones de tokens entre ambos nodos) y deja el resto de la memoria unificada de cada Spark disponible.
- Red: TCP 29900 entre hosts, TCP 29800 en el primer Spark y TCP 8000 para clientes.
- Software: build de `flare-inference` desde la rama `ds41-trellismx` (PR NVIDIA/spark-local-inference#161); una release anterior del PR no puede cargar el paquete. Overlay fijado `vendor/ds41_trellismx` y `vendor/ds41_kern/b12x` en ambos hosts.
- No cabe en GPUs de consumo convencionales (RTX 4090, etc.): requiere el hardware GB10 emparejado descrito.
- Opciones de despliegue: motor Flare con `flare run --rank 0` y `--rank 1`; API compatible con OpenAI en el puerto 8000.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-TrellisMX-FLARE (este) | no disponible (MoE) | 1.048.576 tokens por peticion | MIT | Dos DGX Spark, Flare TP2 | Paquete de despliegue, no modelo nuevo |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | no disponible | no disponible | MIT | No especificado | Modelo base oficial de DeepSeek |
| brandonmusic/DeepSeek-V4.1-Flash-1017-TrellisMX-K2-Mix | no disponible | no disponible | MIT | No especificado | Checkpoint comunitario empaquetado por este paquete |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Estado de construccion previo: el paquete requiere un build de `flare-inference` desde la rama `ds41-trellismx`; una release estandar anterior al PR NVIDIA/spark-local-inference#161 no puede cargarlo.
- Firma de desarrollo: el paquete esta firmado por un publicador de desarrollo local (clave `58cdfcd6...`), no por una clave de produccion. Los flags `--dangerously-approve-key` y `--dangerously-accept-publisher` solo deben usarse en hosts de confianza; para despliegue publico hay que re-firmar el paquete.
- Requisito de overlay: la rama del motor rechaza checkpoints TrellisMX sin el overlay `vendor/ds41_trellismx` y `vendor/ds41_kern/b12x` fijado en ambos hosts.
- Contexto limitado por memoria KV: aunque el limite por peticion es de 1.048.576 tokens, en la practica depende de los 14 GiB de KV asignados por defecto y de la concurrencia activa (16 slots).
- Sin datos de benchmarks, idiomas ni sesgos: no se han publicado evaluaciones de calidad, sesgo o alucinacion para este paquete ni para el checkpoint comunitario.
- Dependencia de hardware especifico: el despliegue esta atado a dos DGX Spark con GB10 y ConnectX-7 RoCE; no es portable a otras configuraciones sin trabajo adicional.
- Sin adopcion verificable: cero descargas y cero likes en el momento de la consulta; el paquete es muy reciente y no cuenta con validacion de la comunidad.
- Licencia MIT: permite uso comercial, pero debe revisarse la licencia del modelo base y del checkpoint TrellisMX antes de un despliegue en produccion.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/JMNI-Labs/DeepSeek-V4.1-Flash-1017-TrellisMX-FLARE
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Checkpoint TrellisMX K2-Mix: https://huggingface.co/brandonmusic/DeepSeek-V4.1-Flash-1017-TrellisMX-K2-Mix
- PR del motor Flare: https://github.com/NVIDIA/spark-local-inference/pull/161
