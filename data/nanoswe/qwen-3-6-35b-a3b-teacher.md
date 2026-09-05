# nanoswe/qwen-3.6-35b-a3b-teacher

## Resumen

`nanoswe/qwen-3.6-35b-a3b-teacher` es un modelo de lenguaje basado en arquitectura Mixture of Experts (MoE) desarrollado por el usuario `nanoswe` sobre la base de `Qwen/Qwen3.6-35B-A3B`. Se trata de un ajuste fino ligero orientado a mejorar la generación de trayectorias de tipo agente para ingeniería de software, específicamente en el estilo de SWE-bench. El modelo actúa como profesor en experimentos de destilación: sus salidas se utilizan como datos de entrenamiento para modelos estudiantes más pequeños.

El modelo posee 35.107.181.936 parámetros totales (aproximadamente 35B) con 3B activos por token, según las características del modelo base. Los pesos están almacenados en formato `safetensors` en bfloat16 y ocupan 70.2 GB. El ajuste fino se realizó mediante SFT de parámetros completos en una sola época sobre 14.268 trayectorias curadas, con secuencias de hasta 32.768 tokens. Su relevancia radica en la generación de datos de alta calidad para destilar habilidades de codificación agéntica en modelos más pequeños, mejorando la eficiencia de sistemas de ingeniería de software automatizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en transformer |
| Parametros totales | 35.107.181.936 |
| Parametros activos | 3.000.000.000 (3B por token) |
| Longitud de contexto | No disponible; entrenado con secuencias de hasta 32.768 tokens |
| Tipos de cuantizacion | bf16 (pesos); FP8 online para inferencia segun la model card |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.6-35B-A3B`, una arquitectura MoE de 35B parámetros totales con 3B activos por token. Sobre esta base se realizó un ajuste fino ligero de parámetros completos en bfloat16, con una única época, learning rate de 6e-6 con programación coseno y 5% de warmup, optimizador FusedAdam, gradient clipping 1.0 y tamaño de lote de 64 secuencias. El entrenamiento se ejecutó en 8 GPUs B200 con el stack de `verl` y `NeMo-Automodel`, utilizando FSDP2 con paralelismo experto de 8.

Los datos de entrenamiento provienen de auto-destilación sobre rollouts generados por el propio modelo base en instancias de SWE-smith. Se aplicaron cuatro filtros de curación: solo trayectorias correctas, descarte de patrones de trampa ("cheating"), eliminación de instancias demasiado fáciles (resueltas por más del 75% de intentos) y selección de las tres trayectorias más cortas por instancia. El límite por trayectoria fue de 32.768 tokens. El conjunto final contuvo 14.268 trayectorias, que se usaron para afinar el modelo con un propósito específico: producir trayectorias correctas y concisas sin alejarse significativamente de la distribución preentrenada.

## Capacidades

- Generacion de trayectorias agenticas para ingenieria de software estilo SWE-bench, con formato optimizado para la resolucion de instancias reales.
- Generacion de texto conversacional en el ámbito de tareas de codificacion y debug, sin inyeccion de bloques de pensamiento (thinking mode desactivado).
- Soporte de tool calling / function calling heredado del modelo base, util para interacciones con entornos de ejecucion de codigo.
- Capacidad de seguimiento de instrucciones en contextos largos de hasta 32.768 tokens durante el entrenamiento, compatible con secuencias extensas de codigo y logs.
- Generacion de datos de entrenamiento para destilacion, produciendo trayectorias correctas y verificadas que pueden entrenar modelos estudiantes mas pequenos.
- Interoperabilidad con stacks de inferencia como vLLM (con cuantizacion FP8 online) y formatos compatibles con transformers.

## Casos de uso

- Destilacion de modelos estudiantes para SWE-bench: el modelo profesor genera trayectorias correctas y curadas que se utilizan como ground truth para entrenar modelos mas pequenos en tareas de resolucion de bugs y desarrollo de software.
- Generacion de datos sinteticos para entrenamiento de agentes: se puede integrar en pipelines que necesiten grandes volumenes de trayectorias de codificacion verificadas, reduciendo la necesidad de anotacion humana.
- Evaluacion y seleccion de trayectorias: el modelo puede utilizarse como referencia para comparar la calidad de trayectorias producidas por otros agentes, empleando criterios de correccion y concision.
- Pruebas de razonamiento agentico en entornos de CI/CD: al soportar tool calling y contextos largos, puede ejecutarse en entornos controlados para validar parches o resolver issues automaticamente.
- Generacion de explicaciones de soluciones: el modelo puede producir descripciones paso a paso de como resolver una instancia de error, utiles para documentacion tecnica automatica.
- Investigacion en destilacion y eficiencia de modelos MoE: sirve como modelo de referencia para experimentos que buscan transferir habilidades de agentes a arquitecturas mas pequeñas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de rendimiento ni comparativas con otros modelos en tareas de SWE-bench u otros dominios.

## Requisitos de hardware

- VRAM estimada para inferencia: el tamaño del repositorio es de 70.2 GB en bf16, lo que implica, como mínimo, ~70 GB de VRAM para carga completa del modelo en formato sin cuantizar. Con cuantización FP8 online la demanda se reduce aproximadamente a la mitad (en torno a 35 GB).
- GPU recomendadas: no se proporcionan datos específicos. Dado el tamaño del modelo y los pesos en bf16, se requiere una GPU con 80 GB de VRAM o superior, como A100 80GB, H100 80GB o B200, aunque una RTX 4090 de 24 GB podría admitir el modelo con cuantización de precisión reducida, en función del framework y la longitud de contexto utilizada.
- Opciones de despliegue: vLLM, TGI y transformers son compatibles. La model card indica que el modelo se ejecuta bajo vLLM con cuantización FP8 online para la generación de trayectorias.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Proposito |
|---|---|---|---|---|---|
| nanoswe/qwen-3.6-35b-a3b-teacher | 35.107.181.936 | 3B | Hasta 32.768 tokens en entrenamiento | Apache 2.0 | Generacion de trayectorias SWE-bench para destilacion |
| Qwen/Qwen3.6-35B-A3B | 35.107.181.936 | 3B | No disponible | Apache 2.0 | Modelo base de proposito general |
| Qwen3.6-27B (dense) | 27.000.000.000 | 27B | No disponible | No disponible | Modelo denso de proposito general |

La comparacion se limita a los datos disponibles en la informacion proporcionada. No se ha encontrado informacion sobre modelos comparables de la misma categoria en la busqueda web.

## Limitaciones y advertencias

- El modelo esta ajustado especificamente para la generacion de trayectorias de SWE-bench; su rendimiento en otras tareas no esta garantizado y puede degradarse fuera de ese dominio.
- El modo de pensamiento (thinking) esta desactivado; el modelo no genera pasos de razonamiento explicitos, lo que puede limitar la transparencia en la resolucion de problemas complejos.
- Es imprescindible utilizar el `chat_template.jinja` incluido en el repositorio para servir el modelo correctamente; de lo contrario, el formato de las conversaciones no coincidira con el usado en el entrenamiento.
- La ausencia de benchmarks publicados dificulta la comparacion directa con otros modelos de la misma familia.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que indica una falta de validacion externa y una adopcion muy limitada.
- Pueden existir sesgos heredados del modelo base, especialmente en contextos de codificacion con lenguajes o convenciones minoritarias, aunque estos no se han documentado.
- Los datos de entrenamiento provienen de auto-destilacion sobre los propios rollouts del modelo base, por lo que la calidad de las soluciones depende de la tasa de exito del modelo original y del proceso de curacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nanoswe/qwen-3.6-35b-a3b-teacher
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio SWE-smith: https://github.com/SWE-bench/SWE-smith
- Stack de entrenamiento verl: https://github.com/volcengine/verl
- NeMo-Automodel: https://github.com/NVIDIA/NeMo-Automodel
