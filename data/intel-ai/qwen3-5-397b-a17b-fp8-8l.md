# intel-ai/Qwen3.5-397B-A17B-FP8-8L

## Resumen

Qwen3.5-397B-A17B-FP8-8L es una publicacion de intel-ai en Hugging Face que, segun su identificador, corresponde a una variante del modelo Qwen3.5 en configuracion MoE con 397.000 millones de parametros totales y 17.000 millones activos, cuantizada a FP8 y etiquetada con el sufijo "8L". El repositorio usa el tag de arquitectura `qwen3_5_moe` y pesos en formato safetensors.

La informacion disponible es muy limitada: no se han publicado pipeline, licencia, idiomas soportados ni documentacion tecnica en la ficha del repositorio. Ademas, existe una discrepancia relevante entre el nombre del modelo (397B/A17B) y el recuento real de parametros de los tensores safetensors, que asciende a 61.371.217.408 parametros (aproximadamente 61.400 millones), con un tamano de repositorio de 63,7 GB. Esta cifra es coherente con un modelo denso de unos 61B en FP8 o con un MoE del que solo se han publicado parte de los pesos, pero no con los 397B que sugiere el nombre.

Por tanto, esta ficha debe interpretarse con cautela: se documenta lo que consta en la informacion proporcionada y se marcan explicitamente como "no disponible" todos los datos que no han sido publicados. El modelo resulta relevante por su posible vinculacion a la familia Qwen3.5 y por el interes de las variantes FP8 para despliegue eficiente, pero la falta de documentacion impide validar sus capacidades reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (tag de Hugging Face) |
| Parametros totales | 61.371.217.408 segun safetensors; el nombre indica 397B (discrepancia no resuelta) |
| Parametros activos | 17B segun el nombre del modelo (no verificado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (indicado en el nombre y en los tags) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 63,7 GB |
| Fecha de creacion | 2026-11-12 |
| Ultima actualizacion | 2026-11-19 |
| Descargas | 36 |
| Likes | 0 |

## Arquitectura y entrenamiento

El tag `qwen3_5_moe` indica una arquitectura de tipo Mixture of Experts perteneciente a la familia Qwen3.5. El nombre del modelo sugiere 397.000 millones de parametros totales con 17.000 millones activos por token, un patron habitual en modelos MoE de gran escala que buscan reducir el coste de inferencia manteniendo una capacidad alta. Sin embargo, el recuento real de parametros en los tensores safetensors (61.371.217.408) no coincide con esa cifra, lo que impide confirmar la configuracion exacta.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO, la estrategia de atencion, el numero de expertos, el enrutador ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. El sufijo "8L" no se explica en la informacion proporcionada. La cuantizacion FP8 esta indicada en el nombre y en los tags, pero se desconoce si se aplico a todos los pesos o solo a una parte.

## Capacidades

- Generacion de texto: capacidad esperable por la arquitectura, pero no documentada en la informacion disponible.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Vision: no disponible (no hay tags ni pipeline que lo indiquen).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se listan idiomas).
- Modo thinking: no disponible.
- Audio: no disponible.

## Casos de uso

- Despliegue experimental en FP8: el formato FP8 y el tamano de repositorio de 63,7 GB permiten probar inferencia en GPUs con memoria suficiente, aunque la falta de documentacion obliga a validar la calidad manualmente.
- Investigacion sobre arquitecturas MoE: util para estudiar el comportamiento de un supuesto MoE de la familia Qwen3.5, siempre que se confirme la configuracion real de expertos.
- Evaluacion comparativa de cuantizacion: sirve como caso de estudio para medir el impacto de FP8 frente a pesos en BF16, si se dispone del modelo original para comparar.
- Pruebas de integracion con vLLM o TGI: el formato safetensors es compatible con estos motores, aunque no se garantiza soporte especifico para `qwen3_5_moe`.
- Benchmarking interno: util para medir latencia y throughput en hardware propio antes de comprometerse con un despliegue en produccion.
- Reproduccion de experimentos de la comunidad: dado el bajo numero de descargas (36), puede servir para verificar resultados de terceros que ya hayan probado el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 63,7 GB en FP8, por lo que se necesita al menos esa cantidad de memoria, mas overhead de activaciones y cache KV. En la practica, se recomienda un minimo de 80 GB.
- GPU recomendadas: H100 80GB, A100 80GB, o configuraciones multi-GPU con varias RTX 4090 (24 GB cada una) mediante tensor parallelism.
- Cabe en consumer GPU: no en una sola; seria necesario repartir entre varias GPUs de 24 GB o 48 GB.
- Opciones de despliegue: vLLM, TGI y llama.cpp (si se generan pesos GGUF, no disponibles en el repo). No se confirma soporte oficial para `qwen3_5_moe` en ningun motor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.5-397B-A17B-FP8-8L (este) | 61,4B reales / 397B nominales | no disponible | no disponible | Hugging Face, 36 descargas |
| Modelos comparables | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para establecer una comparativa fiable con alternativas de la misma categoria.

## Limitaciones y advertencias

- Discrepancia critica entre el nombre del modelo (397B/A17B) y el recuento real de parametros safetensors (61,4B): puede tratarse de un modelo incompleto, de una publicacion erronea o de un subconjunto de pesos.
- Ausencia total de documentacion: sin model card, sin licencia, sin idiomas y sin pipeline declarados.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones legales.
- Riesgo de alucinacion y sesgos: no evaluables sin documentacion ni benchmarks.
- Idiomas soportados desconocidos: no se puede garantizar calidad en castellano ni en otros idiomas.
- Longitud de contexto desconocida: imposible planificar casos de uso con contexto largo.
- Numero de descargas muy bajo (36) y cero likes: sin validacion por parte de la comunidad.
- El sufijo "8L" no esta explicado y podria indicar una variante no estandar.
- No se recomienda su uso en produccion sin una validacion exhaustiva previa.

## Enlaces

- Hugging Face: https://huggingface.co/intel-ai/Qwen3.5-397B-A17B-FP8-8L
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.
