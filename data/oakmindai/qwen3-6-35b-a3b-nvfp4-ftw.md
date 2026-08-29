# oakmindai/Qwen3.6-35B-A3B-NVFP4-FTW

## Resumen

El modelo `oakmindai/Qwen3.6-35B-A3B-NVFP4-FTW` es un checkpoint listo para ejecutar en el hardware NVIDIA DGX Spark (GB10) que reempaqueta el modelo MoE `Qwen3.6-35B-A3B` de Qwen, cuantizado por NVIDIA a precisión NVFP4 mediante Model Optimizer, y convertido al formato FTW (FreeToken Weight) por OakMind AI. No introduce una nueva arquitectura ni un nuevo entrenamiento: se trata de una conversión de formato que alinea y fragmenta los tensores para el cargador nativo de FreeToken, manteniendo la misma precisión NVFP4 y sin pérdida de calidad esperada.

El modelo base tiene 35 mil millones de parámetros totales con solo 3 mil millones activos por token (arquitectura Mixture of Experts), lo que lo hace eficiente en memoria y cómputo. La relevancia de este checkpoint radica en que permite desplegar un modelo de gran tamaño en un sistema de memoria unificada de 128 GB como el DGX Spark, con una API compatible con OpenAI y Anthropic, y con una carga más rápida gracias al formato FTW. Está pensado para desarrolladores e investigadores que necesitan ejecutar inferencia local de alta calidad en un entorno de un solo dispositivo.

La licencia es Apache 2.0, lo que facilita su uso comercial y modificación. El repositorio tiene un tamaño de 20,9 GB y fue publicado en agosto de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en transformer |
| Parametros totales | 35 mil millones (35B) |
| Parametros activos | 3 mil millones (3B) por token |
| Longitud de contexto | no disponible (la configuracion de SparkLab reserva 8192 tokens de KV-cache, pero no se certifica la calidad en contexto largo) |
| Tipos de cuantizacion | NVFP4 (FP4 de NVIDIA) |
| Idiomas soportados | no disponible (se heredan las capacidades del modelo base Qwen, pero no se detallan en la informacion) |
| Licencia | Apache 2.0 |
| Formato de pesos | FTW (FreeToken Weight) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.6-35B-A3B` es un transformer MoE con 35B parametros totales y 3B activos por token, disenado por Qwen para tareas de generacion de texto, razonamiento y codificacion. NVIDIA aplico una cuantizacion NVFP4 (punto flotante de 4 bits) utilizando Model Optimizer, reduciendo el peso del modelo sin modificar su arquitectura. Posteriormente, OakMind AI convirtio el checkpoint cuantizado al formato FTW, que organiza los expertos MoE en bancos de expertos direccionables de forma independiente, permitiendo a FreeToken cargar el modelo de manera mas rapida y eficiente en sistemas con memoria unificada.

No se realizo ningun entrenamiento adicional ni ajuste fino; la conversion es precision-preserving, es decir, los tensores se alinean y fragmentan pero mantienen los valores NVFP4 originales. El proceso de conversion fue validado con una prueba de generacion a traves de una API compatible con OpenAI en un GB10.

## Capacidades

- Generacion de texto: el modelo base es capaz de producir texto coherente y contextualizado en multiples dominios, aunque no se especifican detalles en la informacion proporcionada.
- Razonamiento y codificacion: segun la guia de insiderllm, Qwen 3.6 ofrece mejoras sustanciales en codificacion agente y preservacion del pensamiento, lo que sugiere capacidades de razonamiento paso a paso y generacion de codigo.
- Soporte de agentes: la busqueda web menciona "agentic coding" y "thinking preservation", indicando que el modelo puede mantener cadenas de razonamiento y actuar como agente en tareas de programacion.
- Modo conversacional: el pipeline es text-generation y el checkpoint esta disenado para servir peticiones de chat a traves de una API compatible con OpenAI.
- Multilingue: no confirmado en la informacion disponible; se asume que hereda las capacidades del modelo base Qwen, pero no hay datos concretos.
- Tool calling: no se menciona explicitamente en la documentacion; se recomienda verificar con el modelo base.

## Casos de uso

- Inferencia local en DGX Spark: el checkpoint esta optimizado para ejecutarse en un NVIDIA DGX Spark con 128 GB de memoria unificada, permitiendo a desarrolladores e investigadores ejecutar un modelo de 35B sin depender de la nube.
- Servicio de chat con API OpenAI-compatible: se puede levantar un servidor local con SparkLab y consumir el modelo mediante peticiones HTTP estandar, ideal para integrar en aplicaciones de chatbot o asistentes virtuales.
- Prototipado rapido de agentes de codificacion: gracias a las capacidades de razonamiento y codificacion del modelo base, se puede construir un agente que genere, revise y depure codigo en un entorno local con baja latencia.
- Investigacion en sistemas de memoria unificada: el formato FTW y la integracion con FreeToken permiten estudiar el comportamiento de MoE cuantizados en hardware GB10, sirviendo como plataforma de experimentacion.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse localmente, los datos no salen del dispositivo, lo que es adecuado para aplicaciones que manejan informacion sensible.
- Evaluacion de modelos cuantizados: el checkpoint sirve para comparar el rendimiento de NVFP4 frente a otras cuantizaciones (por ejemplo, FP8 o INT4) en tareas de generacion de texto, sin necesidad de entrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni otras evaluaciones. Se recomienda consultar la documentacion del modelo base `Qwen/Qwen3.6-35B-A3B` para obtener datos de rendimiento, aunque no se garantiza que los resultados se mantengan identicos tras la cuantizacion NVFP4.

## Requisitos de hardware

- Hardware objetivo: NVIDIA DGX Spark con chip GB10 (Grace Blackwell), 128 GB de memoria unificada coherente, CUDA 13 y kernels SM121.
- VRAM estimada: no se especifica una cifra exacta, pero el checkpoint ocupa 20,9 GB en disco y se disena para residir en la memoria unificada de 128 GB, incluyendo los bancos de expertos y la cache KV.
- GPUs compatibles: el artefacto esta validado para DGX Spark; no se garantiza su funcionamiento en GPUs consumer (como RTX 4090) sin soporte nativo para NVFP4 o sin suficiente memoria, aunque la guia de insiderllm menciona ejecucion en RTX 3090, 4090 y otras, pero con cuantizaciones adicionales no especificadas aqui.
- Opciones de despliegue: SparkLab (recomendado) con comandos `sparklab doctor` y `sparklab serve`; tambien se puede usar FreeToken directamente como backend de inferencia.
- Latencia y throughput: no se proporcionan datos numericos; la model card indica que FTW no debe asumirse que aumente la velocidad de decodificacion en estado estacionario, solo acelera la carga inicial.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35B totales, 3B activos | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| Qwen3.6-35B-A3B-NVFP4 (NVIDIA) | 35B totales, 3B activos | no disponible | Apache 2.0 | safetensors (NVFP4) | Cuantizacion oficial de NVIDIA |
| Qwen3.6-27B (dense) | 27B | no disponible | Apache 2.0 | safetensors | Variante densa de la misma familia, sin MoE |
| oakmindai/Qwen3.6-35B-A3B-NVFP4-FTW | 35B totales, 3B activos | no disponible | Apache 2.0 | FTW | Reempaquetado para DGX Spark |

La comparativa se limita a la familia Qwen 3.6, ya que no se dispone de datos de otros modelos MoE similares en la informacion proporcionada. La principal diferencia entre el checkpoint de OakMind y los demas es el formato FTW y la validacion especifica para DGX Spark.

## Limitaciones y advertencias

- Solo texto: el artefacto esta validado para entrada y salida de texto; los campos de imagen y video del modelo base no estan habilitados en esta ruta de despliegue.
- Requiere hardware especifico: el checkpoint esta disenado para DGX Spark con GB10; en otras plataformas puede no funcionar o requerir adaptaciones no documentadas.
- La conversion no mejora la calidad: FTW es un formato de despliegue, no una optimizacion de rendimiento; no se debe esperar una mejora en la velocidad de decodificacion ni en la precision.
- Contexto limitado en la configuracion validada: el comando `--num-tokens 8192` reserva capacidad de KV-cache para 8192 tokens, pero no certifica la calidad del modelo en contextos largos; se recomienda probar con secuencias mayores bajo responsabilidad del usuario.
- Sesgos y alucinaciones: al ser un reempaquetado del modelo base, hereda los sesgos y riesgos de alucinacion de Qwen3.6-35B-A3B, que no se detallan en la informacion.
- Restricciones de uso comercial: la licencia Apache 2.0 permite uso comercial, pero se debe verificar el cumplimiento de las licencias de los componentes (Qwen, NVIDIA Model Optimizer, FreeToken, SparkLab) en caso de redistribucion.

## Enlaces

- Repositorio del modelo: https://huggingface.co/oakmindai/Qwen3.6-35B-A3B-NVFP4-FTW
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Checkpoint cuantizado de NVIDIA: https://huggingface.co/nvidia/Qwen3.6-35B-A3B-NVFP4
- FreeToken (backend de inferencia): https://github.com/FlashML-org/FreeToken
- SparkLab (orquestacion para DGX Spark): https://github.com/sixteen-miles-labs/sparklab
- Guia de Qwen 3.6 (insiderllm): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Guia para ejecutar Qwen 3.6 35B MoE localmente: https://insiderllm.com/guides/best-way-run-qwen-3-6-35b-moe-locally/
