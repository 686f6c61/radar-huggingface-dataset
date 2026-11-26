# chadouming/Hy-MT3-1.8B-int4-ov

## Resumen
Hy-MT3-1.8B-int4-ov es una exportacion cuantizada del modelo de traduccion tencent/Hy-MT3-1.8B, publicada por el usuario chadouming. No se trata de un modelo entrenado desde cero, sino de una conversion a formato OpenVINO Intermediate Representation (IR) con compresion de pesos mixta INT4/INT8, pensada para ejecutarse con openvino-genai sobre CPU y GPU Intel Arc. El modelo base pertenece a la familia Hunyuan (arquitectura hunyuan_v1_dense) y esta orientado a tareas de traduccion automatica.

La relevancia de esta publicacion es practica: permite desplegar un modelo de traduccion de 1.800 millones de parametros en hardware Intel sin GPU dedicada de gran formato, reduciendo el peso del repositorio a 1,2 GB gracias a la cuantizacion. Es una opcion interesante para entornos de inferencia en el borde o en servidores con aceleradores integrados.

La informacion disponible es limitada: la model card solo documenta el proceso de cuantizacion y la licencia, sin detallar el entrenamiento, los idiomas soportados ni resultados de evaluacion. Todo lo que no aparece en la informacion proporcionada se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | hunyuan_v1_dense (transformer denso, segun tag del repositorio) |
| Parametros totales | 1.800 millones (deducido del nombre del modelo; no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 asimetrico con group size 128 y ratio 0,8 (69 % INT4 / 31 % INT8 en capas sensibles) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (exportado con optimum-intel; no safetensors ni GGUF) |

## Arquitectura y entrenamiento
El modelo base es tencent/Hy-MT3-1.8B, etiquetado con la arquitectura hunyuan_v1_dense, lo que indica un transformer denso (no mezcla de expertos) de la familia Hunyuan de Tencent. La model card no aporta detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas como decodificacion especulativa o atencion lineal.

La unica informacion tecnica documentada corresponde al proceso de cuantizacion: se uso NNCF 3.4.0 con compresion asimetrica INT4 (group size 128, ratio 0,8) sobre la revision 79e9c301609d6a4009fbb110922dca379dfe1e9a del modelo base, mediante el comando `optimum-cli export openvino` con `--task text-generation-with-past`. El resultado es un grafo OpenVINO listo para `LLMPipeline` y `ContinuousBatchingPipeline` de openvino-genai.

## Capacidades
- Generacion de texto orientada a traduccion automatica (segun el tag `translation` del repositorio).
- Conversacion multi-turno (tag `conversational` en Hugging Face).
- Inferencia con cache de clave/valor (`text-generation-with-past`), lo que permite decodificacion incremental.
- Ejecucion en CPU y GPU Intel Arc mediante openvino-genai.
- Soporte de batching continuo a traves de `ContinuousBatchingPipeline`.
- Soporte de tool calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Capacidades de vision o audio: no disponible.
- Cobertura multilingue concreta: no disponible.

## Casos de uso
- Traduccion automatica en produccion sobre infraestructura Intel: el modelo puede servirse con `LLMPipeline` en CPU o GPU Arc, aprovechando la cuantizacion INT4 para reducir el consumo de memoria frente al modelo en precision completa.
- Servicio de traduccion de bajo coste en el borde: con un repositorio de 1,2 GB, es viable desplegarlo en equipos con aceleradores Intel integrados o en servidores sin GPU dedicada.
- Traduccion por lotes con batching continuo: `ContinuousBatchingPipeline` permite procesar varias peticiones concurrentes, adecuado para pipelines de localizacion de documentacion.
- Prototipado rapido de productos de traduccion: la licencia Apache-2.0 facilita integrarlo en pruebas de concepto y entornos comerciales sin restricciones adicionales.
- Traduccion dentro de aplicaciones de escritorio o herramientas ofimaticas en Windows con CPU Intel, donde OpenVINO ofrece aceleracion nativa.
- Evaluacion comparativa de cuantizacion: util como referencia para medir la perdida de calidad de INT4 frente al modelo base en tareas de traduccion.
- Integracion en flujos conversacionales multilingues: el tag `conversational` sugiere uso en asistentes que requieran traduccion dentro de un dialogo, aunque la cobertura de idiomas no esta documentada.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: no disponible de forma explicita; el repositorio ocupa 1,2 GB, lo que da una cota inferior del espacio de pesos en INT4/INT8. La memoria real de inferencia depende del contexto y de la cache KV, no documentados.
- GPU recomendadas: Intel Arc (mencionadas explicitamente en la model card). No se documentan GPU NVIDIA ni AMD.
- CPU: soportado mediante openvino-genai.
- Compatibilidad con GPU de consumo: si, en GPUs Intel Arc de consumo, segun la model card; no se confirma para otras marcas.
- Opciones de despliegue: openvino-genai (`LLMPipeline`, `ContinuousBatchingPipeline`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Hy-MT3-1.8B-int4-ov | 1,8 B (segun nombre) | no disponible | OpenVINO IR INT4/INT8 | Apache-2.0 | Cuantizado para Intel; sin benchmarks publicados |
| tencent/Hy-MT3-1.8B | 1,8 B (segun nombre) | no disponible | no disponible en la informacion | Apache-2.0 | Modelo base sin cuantizar; referencia de calidad |
| Otros modelos de traduccion de ~2 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias
- La model card no documenta los idiomas soportados ni la calidad de traduccion por par de lenguas; no es posible verificar su cobertura real.
- La cuantizacion INT4/INT8 puede degradar la calidad respecto al modelo base; no se aportan metricas de la perdida (por ejemplo, BLEU o COMET) antes y despues de la conversion.
- No hay resultados de benchmarks publicados, por lo que no se puede comparar objetivamente con alternativas.
- El modelo esta empaquetado exclusivamente para OpenVINO; no es directamente utilizable con transformers, vLLM o llama.cpp sin reconvertirlo.
- El autor del repositorio es un usuario individual (chadouming), no Tencent; conviene verificar la integridad de la exportacion antes de usarla en produccion.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y conviene revisar las condiciones originales de tencent/Hy-MT3-1.8B.
- No se especifica la longitud de contexto, lo que impide planificar el uso con documentos largos.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/chadouming/Hy-MT3-1.8B-int4-ov
- Modelo base: https://huggingface.co/tencent/Hy-MT3-1.8B
- openvino-genai: https://github.com/openvinotoolkit/openvino.genai
