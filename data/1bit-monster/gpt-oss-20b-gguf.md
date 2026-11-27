# 1bit-MONSTER/gpt-oss-20b-GGUF

## Resumen

Este repositorio distribuye una cuantización GGUF del modelo gpt-oss-20b de OpenAI, concretamente la variante Dynamic 2.0 UD-Q4_K_XL elaborada por Unsloth y rehospedada por el usuario 1bit-MONSTER. El modelo original es un transformer con arquitectura de mezcla de expertos (MoE) de aproximadamente 20.900 millones de parámetros totales, liberado por OpenAI bajo licencia Apache 2.0. Este repositorio no aporta pesos nuevos ni ajuste fino: su valor está en empaquetar el modelo en un único fichero GGUF de 11,9 GB, listo para inferencia en llama.cpp y en el motor propietario del autor (1bit engine).

La relevancia de esta ficha es doble. Por un lado, permite ejecutar un MoE de ~21B con calidad cercana a FP16 en hardware de consumo gracias a la cuantización de 4 bits dinámica. Por otro, el autor publica métricas medidas de rendimiento en un equipo Strix Halo con backend Vulkan: 1591 tok/s en prefill (pp512) y 66,9 tok/s en generación (tg128). Esas cifras corresponden a septiembre de 2026 y el propio autor advierte que el backend Vulkan se ha retirado del motor, por lo que las mediciones con la ruta HRX actual están pendientes de repetir.

Al tratarse de un rehost de una cuantización de terceros, la ficha técnica hereda las características del modelo base de OpenAI y de la receta de Unsloth; cualquier dato no documentado en la información disponible se marca explícitamente como no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), según etiqueta `moe` del repositorio |
| Parámetros totales | 20.914.757.184 (~20,9B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF UD-Q4_K_XL (Dynamic 2.0 de Unsloth); otras variantes no disponibles en este repo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (fichero `gpt-oss-20b-UD-Q4_K_XL.gguf`) |
| Tamaño del repositorio | 11,9 GB |
| Modelo base | openai/gpt-oss-20b |
| Cuantizador | unsloth/gpt-oss-20b-GGUF |
| Pipeline | no disponible |
| Descargas / likes | 79 / 0 |

## Arquitectura y entrenamiento

El modelo subyacente es gpt-oss-20b de OpenAI, un transformer con capas de mezcla de expertos y aproximadamente 20,9 mil millones de parámetros totales, según el recuento de safetensors del modelo base. La información disponible no detalla el número de expertos, el número de parámetros activos por token, la longitud de contexto nativa ni la composición del corpus de entrenamiento. Tampoco se documentan aquí las fases de alineación (RLHF, DPO u otras) aplicadas por OpenAI; esos datos deben consultarse en la model card del modelo base.

La contribución técnica de este repositorio es la cuantización. Unsloth aplica su método Dynamic 2.0 en la variante UD-Q4_K_XL, que asigna precisiones distintas a distintas capas y tensores en lugar de usar un único tipo de bloque de 4 bits, preservando con más cuidado las capas sensibles. El resultado es un único fichero GGUF de 11,9 GB que el autor ejecuta mediante el motor 1bit engine, con una ruta de decodificación GGUF compatible con llama.cpp y una ruta denominada HRX GPU. Las mediciones publicadas (pp512 1591 tok/s, tg128 66,9 tok/s) se obtuvieron en septiembre de 2026 con el backend Vulkan, ya retirado del motor.

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado como `conversational` y `endpoints_compatible`, lo que indica compatibilidad con plantillas de chat y con endpoints de inferencia estándar.
- Razonamiento y matemáticas: capacidades heredadas del modelo base gpt-oss-20b; no se documentan evaluaciones específicas en este repositorio.
- Generación de código: no verificada en la información disponible para esta cuantización concreta.
- Tool calling / function calling: no documentado en este repositorio; debe consultarse la model card de openai/gpt-oss-20b.
- Soporte de agentes y razonamiento multi-paso: no documentado aquí.
- Capacidades multilingües: no disponibles; el repositorio no declara lista de idiomas.
- Capacidades especiales (modo thinking, visión, audio): no documentadas en la información proporcionada.
- Ejecución local: soportada vía llama.cpp y vía el motor 1bit engine con el comando `1bit serve -m gpt-oss-20b-UD-Q4_K_XL.gguf --device hrx`.

## Casos de uso

- Asistente conversacional autoalojado: el fichero GGUF de 11,9 GB cabe en equipos con 16 GB de memoria unificada o VRAM, lo que permite desplegar un chatbot multi-turno sin depender de APIs externas ni de conexión a internet.
- Prototipado en estaciones de trabajo sin GPU dedicada: la cuantización de 4 bits reduce el requisito de memoria frente a FP16 (que exigiría del orden de 40 GB solo para pesos), haciendo viable la experimentación en portátiles con GPU integrada o en placas tipo Strix Halo.
- Evaluación comparativa de cuantizaciones: al ser una variante UD-Q4_K_XL de Unsloth, sirve para medir la pérdida de calidad frente a otras cuantizaciones del mismo modelo base en tareas concretas del equipo.
- Backend de generación en pipelines de CI/CD: con 66,9 tok/s de generación medidos, el modelo puede alimentar tareas de resumen de diffs, generación de mensajes de commit o documentación automática en runners con suficiente memoria.
- Investigación sobre eficiencia de inferencia: el repositorio publica métricas de prefill y decode en hardware concreto, útiles como referencia para comparar backends (Vulkan, HRX, CUDA, Metal) sobre el mismo fichero.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 permite uso comercial, modificación y redistribución sin las restricciones de licencias de tipo copyleft, lo que facilita su integración en productos propietarios.
- Servicio de inferencia compatible con endpoints: la etiqueta `endpoints_compatible` sugiere que puede exponerse tras una API compatible con OpenAI, útil para sustituir un proveedor externo por un despliegue local en pruebas de integración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo publica métricas de rendimiento de inferencia medidas en un equipo Strix Halo con backend Vulkan:

| Métrica | Valor | Contexto |
|---|---|---|
| Prefill (pp512) | 1591 tok/s | Strix Halo, Vulkan, septiembre de 2026 |
| Generación (tg128) | 66,9 tok/s | Strix Halo, Vulkan, septiembre de 2026 |
| Tamaño del fichero | 11,9 GB | UD-Q4_K_XL |
| Parámetros totales | 20.914.757.184 | Recuento de safetensors del modelo base |

El autor advierte que el backend Vulkan se ha eliminado del motor y que las cifras con la ruta HRX actual están pendientes de nueva medición, por lo que estos números deben tomarse como referencia histórica y no como rendimiento actual del motor.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: al menos 12-13 GB para cargar el fichero de 11,9 GB más overhead de contexto y caché KV; con contexto largo, prever 16 GB o más.
- GPU recomendadas: no hay recomendaciones oficiales en la información disponible. Por tamaño, encaja en GPUs con 16 GB o más de VRAM (RTX 4080, RTX 4090, RTX 5080/5090, A100 40 GB, H100) y en equipos con memoria unificada de 16 GB o más (Strix Halo, Apple Silicon de gama alta).
- ¿Cabe en GPU de consumo? Sí, en modelos con 16 GB o más de VRAM; en GPUs de 8-12 GB requeriría cuantizaciones más agresivas (Q3, Q2) no incluidas en este repositorio.
- Opciones de despliegue: llama.cpp (ruta GGUF estándar) y 1bit engine con `--device hrx`, según la model card. vLLM, TGI y Ollama no se mencionan en la información disponible, aunque al ser GGUF estándar es probable su compatibilidad con Ollama y llama.cpp; no confirmado por el autor.
- Latencia y throughput: 1591 tok/s de prefill y 66,9 tok/s de generación en Strix Halo con Vulkan (septiembre de 2026). Sin datos para otras GPUs.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Observaciones |
|---|---|---|---|---|---|
| 1bit-MONSTER/gpt-oss-20b-GGUF (este repo) | ~20,9B (MoE) | no disponible | GGUF Q4_K_XL | Apache 2.0 | Rehost de Unsloth; métricas en Strix Halo |
| openai/gpt-oss-20b | ~20,9B (MoE) | no disponible | safetensors | Apache 2.0 | Modelo base original de OpenAI |
| unsloth/gpt-oss-20b-GGUF | ~20,9B (MoE) | no disponible | GGUF (varias) | Apache 2.0 | Fuente de la cuantización UD-Q4_K_XL |

No se dispone de datos de benchmarks que permitan comparar la calidad de esta cuantización con las alternativas; la comparación se limita a formato, licencia y origen.

## Limitaciones y advertencias

- Es un rehost, no un modelo nuevo: no aporta mejoras de calidad sobre openai/gpt-oss-20b ni sobre la cuantización original de Unsloth. Cualquier problema del modelo base se hereda.
- La cuantización de 4 bits introduce pérdida de precisión respecto a FP16; el grado exacto de degradación no está medido en la información disponible.
- Las métricas de rendimiento publicadas corresponden a un backend (Vulkan) ya retirado del motor del autor; no representan el rendimiento actual de la ruta HRX.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de seguridad para esta cuantización concreta. Deben consultarse en la model card del modelo base.
- No se declara lista de idiomas soportados; el rendimiento en castellano no está verificado.
- No se documenta la longitud de contexto nativa ni el comportamiento de la caché KV con contextos largos.
- Licencia Apache 2.0: permite uso comercial y redistribución, pero exige conservar los avisos de copyright y licencia, y no otorga garantías. Verificar las obligaciones de atribución al redistribuir el GGUF.
- El repositorio tiene muy poca tracción (79 descargas, 0 likes) y un único contribuidor; no hay garantía de mantenimiento ni de actualizaciones.
- La fecha de creación del repositorio (2026-09-26) y las referencias a hardware Strix Halo y a un motor propio implican que la reproducibilidad depende de herramientas externas al ecosistema estándar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/1bit-MONSTER/gpt-oss-20b-GGUF
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Cuantización de origen: https://huggingface.co/unsloth/gpt-oss-20b-GGUF
- Motor del autor: https://github.com/1bit-MONSTER/engine
- Familias del autor: https://huggingface.co/1bit-MONSTER#families
- Punto de entrada del autor: https://huggingface.co/1bit-MONSTER#start-here
