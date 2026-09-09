# r0b0tlab/Ling-3.0-flash-VL-NVFP4-MP

## Resumen

Ling-3.0-flash-VL-NVFP4-MP es una cuantizacion mixta NVFP4 + FP8 de alta eficiencia del modelo vision-language inclusionAI/Ling-3.0-flash-VL, desarrollada de forma independiente por r0b0tlab. El modelo base es un MoE (mixture of experts) hibrido KDA + MLA con 124 B de parametros totales y 5.1 B activos, disenado para procesos de imagen-texto en ingles y chino. Esta variante reduce el peso del checkpoint de 249.7 GB BF16 a 72.62 GB, lo que permite ejecutar el modelo completo en una sola NVIDIA GB10 con 121 GB de memoria unificada, manteniendo la calidad en pruebas de vision, texto y razonamiento matematico.

La ventaja principal de esta ficha es que se puede ejecutar en hardware de una sola GPU de gama alta con cuantizacion NVFP4 de 4 bits en los expertos y FP8 en las capas de atencion, acompanada de un backend optimizado (FlashInferCuteDslNvfp4W4A16) y soporte completo de tool calling, modo de pensamiento y ventana de contexto de 131 072 tokens. Es una opcion practica para desarrolladores e investigadores que necesiten un modelo multimodal escalable con licencia MIT y despliegue via vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrido KDA + MLA (Mixture of Experts vision-language) |
| Parametros totales | 64 084 136 656 en el checkpoint cuantizado (el modelo base declara 124 B totales) |
| Parametros activos | 5.1 B activos |
| Longitud de contexto | 131 072 tokens |
| Tipos de cuantizacion | NVFP4 W4A4 (rutas de expertos, expertos compartidos, MLP densa, lm_head), FP8 (atencion KDA y MLA), BF16/FP32 preservados en vision tower, projector, embeddings y normas |
| Idiomas soportados | Ingles, chino |
| Licencia | MIT |
| Formato de pesos | Safetensors (64 shards) |

## Arquitectura y entrenamiento

La arquitectura base, descrita como hybrid KDA + MLA MoE, combina atencion multi-head latente (MLA) con un mecanismo de atencion directa kernelizada (KDA) para reducir el coste computacional en el procesamiento de secuencias largas. El modelo es un MoE con 61 440 rutas de expertos cuantizadas en NVFP4, mas 120 expertos compartidos y una MLP densa en las dos primeras capas. La cuantizacion se ha realizado con NVIDIA Model Optimizer 0.48 y se sirve mediante un fork especifico de vLLM (vllm-ling-v3) con parches para NVFP4.

No se han publicado detalles sobre los datos de entrenamiento del modelo original, composicion del dataset ni procesos de RLHF o DPO; la informacion disponible se centra en la cuantizacion. Las innovaciones tecnicas destacables son la mezcla NVFP4+FP8 (expertos en 4 bits con activacion dinamica por token, atencion en FP8 con escalado por canal), la preservacion byte-identica de los modulos de vision, y el uso de kernels FlashInferCuteDslNvfp4W4A16 y TRITON_MLA junto con CUDA graphs y compilacion ahead-of-time.

## Capacidades

- Generacion de texto y razonamiento matematico: alcanza 91.5 % en GSM8K-200 (183/200) con extraccion flexible.
- Comprension visual: identificacion de objetos mediante conteo, OCR de displays de 7 segmentos, lectura de graficos de barras y razonamiento sobre orden y color de frames.
- Tool calling nativo: soporta `--enable-auto-tool-choice` y el parser `ling3`, con probado funcionamiento en llamadas reales a herramientas.
- Modo de pensamiento activado por defecto, desactivable mediante `chat_template_kwargs={"enable_thinking": False}` para respuestas cortas y deterministicas.
- Capacidades multilingues en ingles y chino.
- Ventana de contexto de 131 072 tokens, con capacidad de gestionar conversaciones largas y multiples imagenes (aunque no video).
- Soporte de agentes y razonamiento multi-paso gracias a la arquitectura MoE y al modo de pensamiento estructurado.

## Casos de uso

- Atencion al cliente multilingue: el modelo puede gestionar conversaciones largas en ingles y chino, combinando imagenes (capturas de pantalla, facturas) con contexto de 131 072 tokens. Su modo de pensamiento permite razonar sobre problemas complejos antes de responder, y tool calling facilita la consulta de bases de datos o sistemas de ticketing.

- Analisis de documentos tecnicos con OCR: lectura de displays de 7 segmentos, graficos de barras y diagramas de flujo para extraer datos operativos. La cuantizacion NVFP4 no degrada la precision de la vision, como demuestran las pruebas de OCR y conteo.

- Generacion de codigo en produccion: integracion en pipelines CI/CD mediante tool calling y parser `ling3`. El modelo puede recibir instrucciones de codigo y emitir llamadas a funciones reales, lo que facilita automatizar tareas de refactorizacion o pruebas en entornos controlados.

- Tutor inteligente para matematicas: la alta puntuacion en GSM8K-200 y el modo de pensamiento lo hacen adecuado para explicar ejercicios paso a paso, generar preguntas de practica y evaluar respuestas en entornos educativos, tanto en ingles como en chino.

- Agentes autonomos para analisis de datos: gracias al soporte de tool calling, el modelo puede encadenar varias llamadas a herramientas para consultar APIs, procesar resultados y generar informes a partir de imagenes de dashboards financieros o informes de progreso.

- Moderacion de contenido visual: el modelo clasifica y razona sobre imagenes en canales multilingues. Su capacidad de razonar sobre orden de frames y colores permite detectar secuencias problematicas, generando alertas automaticas con respuestas en el idioma del usuario.

- Automatizacion de soporte tecnico remoto: combinando vision (pantallas de error) con instrucciones de reparacion, el modelo puede guiar a un operario paso a paso, manteniendo contexto de conversaciones largas gracias a la ventana de 131 K tokens y usando tool calling para consultar el estado del sistema.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| GSM8K-200 (extraccion flexible) | 91.5 % (183/200) |
| Text probes (fib(10)=55, JSON estricto, codigo, tool_calls) | 5/5 |
| Vision probes (conteo, OCR, graficos, orden/color) | 8/8 |
| Decode (c=1) | 43.5 tok/s |
| Prefill | 986 tok/s |
| Inter-token latency | 22.6 ms |
| Throughput agregado (c=1 / 16 / 32) | 42.4 / 164.8 / 165.4 tok/s |
| Carga de pesos / KV cache | 516-540 s, 67.97 GiB pesos / 31.8 GiB KV |
| Capacidad de KV cache en FP8 | 2 309 051 tokens (140.9x concurrency a 16 K, 17.6x a 131 K) |

Medidas realizadas en una sola NVIDIA GB10 / SM 12.1 con 121 GB de memoria unificada y la configuracion optimizada del contenedor (`--gpu-memory-utilization 0.85`). No se han publicado resultados para benchmarks estandar como MMLU o HumanEval en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en la configuracion ganadora: 67.97 GiB para pesos + ~1.0 GiB de captura de CUDA graphs + 30.49 GiB de KV pool, totalizando aproximadamente 99.5 de 121 GiB en un sistema unificado.
- Hardware validado: unica NVIDIA GB10 / SM 12.1 (121 GB de memoria unificada). No se confirma compatibilidad con otras GPUs.
- No cabe en GPUs de consumo tipico de 24 GB (RTX 4090, etc.) sin reducir la ventana de contexto o la precision.
- Despliegue mediante fork de vLLM (vllm-ling-v3) en un contenedor Docker arm64 para SM12x, con los comandos indicados en el repositorio de reproduccion.
- Latencia y throughput: decode 43.5 tok/s, prefill 986 tok/s, ITL 22.6 ms, y throughput agregado de 164.8-165.4 tok/s con concurrencia 16-32 en el hardware de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Tamaño del checkpoint |
|---|---|---|---|---|---|
| Ling-3.0-flash-VL (base, BF16) | 124 B totales / 5.1 B activos | 131 072 | MIT | Safetensors | 249.7 GB |
| Ling-3.0-flash-VL-NVFP4-MP (este modelo) | 124 B totales / 5.1 B activos (64.08 B en safetensors) | 131 072 | MIT | Safetensors (NVFP4+FP8) | 72.62 GB |
| r0b0tlab/Ling-3.0-flash-NVFP4 (solo texto) | No disponible | No disponible | MIT | Safetensors (NVFP4) | No disponible |

La principal diferencia respecto al modelo base BF16 es la reduccion de peso de 3.4x sin perdida medible en las pruebas de calidad. La version solo texto simplifica el despliegue si no se requiere vision, pero carece de informacion publica sobre sus especificaciones exactas.

## Limitaciones y advertencias

- No soporta entrada de video; la implementacion VL del fork solo procesa imagenes estaticas.
- La KV cache NVFP4 no esta disponible para este modelo con atencion MLA densa en SM121; FP8 es el maximo soportado.
- La decodificacion especulativa con n-gram resulta en una regresion de throughput en trafico general, por lo que queda como opcion opt-in.
- No se incluye cabeza MTP (multi-token prediction) en este checkpoint.
- Riesgo inherente de alucinacion en respuestas generativas; conviene validar salidas en aplicaciones criticas.
- La informacion disponible no detalla sesgos especificos del modelo entrenado por inclusionAI, pero al ser un modelo vision-language puede heredar sesgos de sus datos de entrenamiento no documentados.
- La licencia MIT permite uso comercial, pero el usuario debe verificar que la cuantizacion y el contenedor cumplen con las politicas de NVIDIA Model Optimizer y las dependencias del fork vllm-ling-v3.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/r0b0tlab/Ling-3.0-flash-VL-NVFP4-MP
- Repositorio de reproduccion: https://github.com/r0b0tlab/ling30vl-nvfp4-mp-sm121
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-flash-VL
- Fork de vLLM inclusionAI: https://github.com/inclusionAI/vllm-ling-v3
- Version solo texto (referencia): https://huggingface.co/r0b0tlab/Ling-3.0-flash-NVFP4
