# 1bit-MONSTER/gpt-oss-120b-GGUF

## Resumen

Este repositorio contiene una redistribución en formato GGUF del modelo `openai/gpt-oss-120b`, un transformer de tipo Mixture-of-Experts (MoE) desarrollado por OpenAI y publicado bajo licencia Apache 2.0. La cuantización concreta es la UD-Q4_K_XL de Unsloth (Dynamic 2.0), reempaquetada por el usuario 1bit-MONSTER para su uso con el motor de inferencia propietario "1bit engine", que ejecuta la ruta GGUF de llama.cpp sobre hardware denominado "HRX GPU".

El modelo base es un MoE de aproximadamente 117 000 millones de parámetros totales (116 829 156 672 según los pesos safetensors del modelo original), lo que lo sitúa en la categoría de modelos abiertos de gran escala. El repositorio ocupa 63 GB y se distribuye en dos shards GGUF; requiere una cantidad de memoria residente comparable para su ejecución.

La relevancia de esta ficha es doble: por un lado, documenta una de las pocas cuantizaciones de 4 bits disponibles para gpt-oss-120b; por otro, advierte de que el autor de la redistribución no aporta información técnica propia más allá de la referencia al modelo base y a la cuantización de Unsloth. Los datos de arquitectura, entrenamiento y benchmarks que se detallan a continuación corresponden al modelo `openai/gpt-oss-120b` y no han sido verificados en esta model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer, segun modelo base `openai/gpt-oss-120b` |
| Parametros totales | 116 829 156 672 (~117B) |
| Parametros activos | no disponible en la informacion proporcionada |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF UD-Q4_K_XL (Dynamic 2.0 de Unsloth); otras cuantizaciones disponibles en `unsloth/gpt-oss-120b-GGUF` |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | GGUF dividido en 2 shards (`...-00001-of-00002.gguf`, `...-00002-of-00002.gguf`) |

## Arquitectura y entrenamiento

La model card de esta redistribucion no describe la arquitectura interna, los datos de entrenamiento ni el proceso de alineacion. Lo unico verificable es que el modelo base `openai/gpt-oss-120b` es un Mixture-of-Experts de aproximadamente 117 000 millones de parametros totales y que el autor lo etiqueta con el tag `moe`. No se documentan en esta ficha el numero de expertos, la tasa de activacion, el numero de capas, la dimension oculta ni la ventana de contexto, por lo que esos datos deben consultarse en la model card oficial de OpenAI.

Respecto al proceso de cuantizacion, el autor indica que se trata de la variante UD-Q4_K_XL de Unsloth (Dynamic 2.0), un esquema de cuantizacion mixta que asigna precisiones distintas a distintas capas o tensores dentro del mismo archivo GGUF. No se detalla la mezcla exacta de tipos (Q4_K, Q5_K, Q6_K, Q8_0, etc.) ni el error de perplejidad introducido respecto al modelo en bf16/fp16. Tampoco se documenta si el modelo base fue sometido a RLHF, DPO u otro tipo de alineacion, ni el volumen o composicion del corpus de entrenamiento.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` del repositorio indica que la cuantizacion esta pensada para uso en dialogos multi-turno.
- Razonamiento y codigo: capacidades heredadas del modelo base `openai/gpt-oss-120b`; no se detallan en esta model card.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que el artefacto puede servirse a traves de una API compatible con el esquema de endpoints de Hugging Face.
- Ejecucion en llama.cpp: al ser un GGUF, es compatible con el ecosistema llama.cpp y con el motor propietario 1bit engine del autor.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local de un MoE de ~117B en infraestructura con ~64 GB de memoria: el formato GGUF UD-Q4_K_XL permite cargar el modelo en una maquina con memoria residente comparable a los 63 GB del repositorio, evitando la necesidad de pesos en bf16 (que requeririan del orden de 230 GB). Es el caso de uso principal declarado por el autor.
- Servicio de chat conversacional en llama.cpp: al estar empaquetado como GGUF y etiquetado como `conversational`, puede servirse mediante `llama-server` o el motor 1bit engine para aplicaciones de asistente con historial multi-turno.
- Integracion en pipelines con API compatible: el tag `endpoints_compatible` permite exponer el modelo detras de una interfaz HTTP compatible con el esquema de endpoints, facilitando su sustitucion por otros backends en aplicaciones existentes.
- Evaluacion comparativa de cuantizaciones: al existir la variante original de Unsloth, este rehost permite comparar el comportamiento del mismo checkpoint servido por el motor 1bit engine frente a llama.cpp estandar.
- Prototipado de agentes y herramientas sobre hardware de gama alta: un MoE de este tamano cuantizado a 4 bits es adecuado para experimentar con razonamiento multi-paso y llamadas a funciones en entornos con una sola GPU de 80 GB o con memoria unificada, aunque las capacidades concretas de tool calling deben validarse contra el modelo base.
- Investigacion sobre cuantizacion dinamica: el esquema Dynamic 2.0 de Unsloth asignando precision variable por tensor es un objeto de estudio util para medir la degradacion de calidad en modelos MoE de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta redistribucion no incluye metricas de MMLU, HumanEval, GSM8K ni de perplejidad respecto al modelo en bf16. Cualquier cifra de rendimiento debe obtenerse de la documentacion oficial de `openai/gpt-oss-120b` o de la model card de `unsloth/gpt-oss-120b-GGUF`, no de este repositorio.

## Requisitos de hardware

- VRAM o memoria residente estimada: aproximadamente 63 GiB, segun el propio autor ("~63 GiB total. Needs a comparable amount of resident memory to run"). No se especifica el overhead adicional de KV cache, que depende de la longitud de contexto configurada.
- GPU recomendadas: no se indican modelos concretos en la informacion proporcionada. El autor menciona "HRX GPU" como hardware objetivo del motor 1bit engine, sin especificar caracteristicas.
- Viabilidad en GPU de consumo: los 63 GiB superan la VRAM de cualquier GPU de consumo actual (maximo 24 GB en RTX 4090, 32 GB en RTX 5090). Solo es viable en configuraciones multi-GPU, en GPUs profesionales o de centro de datos (A100 80 GB, H100 80 GB, H200, MI300X) o mediante memoria unificada en sistemas Apple Silicon de gama alta con al menos 64 GB.
- Opciones de despliegue: llama.cpp (ruta estandar para GGUF), el motor 1bit engine del autor (`1bit serve -m ... --device hrx`) y, por compatibilidad GGUF, otros runners que soporten el formato. vLLM y TGI no consumen GGUF de forma nativa en su configuracion habitual.
- Latencia y throughput: no disponible en la informacion proporcionada. Al ser un MoE, el throughput dependera del numero de parametros activos por token, dato no publicado en esta ficha.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `1bit-MONSTER/gpt-oss-120b-GGUF` (esta ficha) | ~117B (MoE) | no disponible | GGUF UD-Q4_K_XL, 2 shards, 63 GB | Apache 2.0 | Rehost para 1bit engine |
| `unsloth/gpt-oss-120b-GGUF` | ~117B (MoE) | no disponible | GGUF (multiples cuantizaciones) | Apache 2.0 | Fuente original de la cuantizacion |
| `openai/gpt-oss-120b` | ~117B (MoE) | no disponible | safetensors | Apache 2.0 | Modelo base en precision completa |

No se dispone de datos de benchmarks ni de contexto para comparar el rendimiento relativo frente a alternativas de otros fabricantes (por ejemplo, Llama o Qwen en el rango de 100B+). Cualquier comparacion de calidad queda fuera del alcance de la informacion proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos, datos de entrenamiento ni evaluaciones de seguridad; no es posible evaluar riesgos de sesgo a partir de este repositorio.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se aportan evaluaciones de factualidad ni de tasa de alucinacion para esta cuantizacion.
- La cuantizacion a 4 bits introduce degradacion respecto al modelo en bf16; el autor no publica la perdida de perplejidad ni comparativas de calidad.
- El repositorio tiene un numero muy bajo de descargas (88) y cero likes en el momento de la consulta, lo que limita la evidencia de uso en produccion.
- El motor "1bit engine" y el hardware "HRX GPU" son propietarios del autor; no hay documentacion publica sobre su compatibilidad, rendimiento o soporte a largo plazo.
- La ejecucion requiere ~63 GiB de memoria residente, lo que excluye GPUs de consumo individuales y encarece el despliegue.
- Aunque la licencia es Apache 2.0 y permite uso comercial, se recomienda verificar los terminos del modelo base `openai/gpt-oss-120b` y de la cuantizacion de Unsloth antes de un despliegue en produccion.
- No se especifican los idiomas soportados; el uso en castellano no esta garantizado ni evaluado en esta ficha.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/1bit-MONSTER/gpt-oss-120b-GGUF
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Cuantizacion original de Unsloth: https://huggingface.co/unsloth/gpt-oss-120b-GGUF
- Motor 1bit engine: https://github.com/1bit-MONSTER/engine
- Familia de modelos del autor: https://huggingface.co/1bit-MONSTER#families
- Punto de entrada del autor: https://huggingface.co/1bit-MONSTER#start-here
