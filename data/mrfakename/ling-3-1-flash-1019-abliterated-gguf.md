# mrfakename/Ling-3.1-flash-1019-abliterated-GGUF

## Resumen

Ling-3.1-flash-1019-abliterated-GGUF es una distribucion en formato GGUF del modelo Ling-3.1-flash-1019, un modelo de lenguaje de arquitectura MoE (mixture of experts) desarrollado originalmente por inclusionAI. Esta version concreta ha sido modificada por mrfakename mediante una tecnica de "abliteration": se proyecta fuera de las capas 16 a 71 un subespacio de rechazo de rango 4, con el objetivo de eliminar las respuestas de negativa del modelo ante peticiones consideradas daninas. El resultado es una variante "uncensored" que, segun la propia model card, cumplira con peticiones daninas, trasladando al usuario la responsabilidad de su uso.

El modelo base declara 560.000 millones de parametros totales con 25.000 millones activos por token, lo que lo situa en la categoria de modelos MoE de gran escala con activacion relativamente baja. Esta distribuicion GGUF proporciona cuatro niveles de cuantizacion (Q8_0, Q6_K, Q4_K_M y Q3_K_M), cada uno dividido en 15 shards, pensados para su uso con llama.cpp mediante el soporte de la arquitectura `bailingmoe3`.

La relevancia de esta ficha radica en que permite ejecutar localmente, con llama.cpp, una variante de un modelo de 560.000 millones de parametros sin las restricciones de rechazo habituales, algo que interesa tanto a investigadores que estudian el comportamiento de modelos abliterated como a desarrolladores que necesitan un modelo base sin filtros para tareas de red teaming o generacion creativa sin restricciones. La licencia MIT del repositorio facilita su redistribucion, aunque el tamano de los pesos (hasta 608 GB en Q8_0) impone requisitos de hardware considerables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts), soportada en llama.cpp como `bailingmoe3` |
| Parametros totales | 560.000 millones (560B) |
| Parametros activos | 25.000 millones (25B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (8,50 bits/peso), Q6_K (6,57 bits/peso), Q4_K_M (4,83 bits/peso), Q3_K_M (3,80 bits/peso) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (multi-shard, 15 shards por cuantizacion); LoRA GGUF adicional (`abliteration-lora.gguf`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de mezcla de expertos (MoE) con 560.000 millones de parametros totales y 25.000 millones activos, implementada en llama.cpp bajo el identificador `bailingmoe3`. La model card menciona dos tipos de atencion distintos, ademas de un bloque MTP (multi-token prediction), lo que sugiere una arquitectura con componentes de prediccion multi-token. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original.

La modificacion respecto al modelo stock consiste en una abliteration de rango 4: se proyecta fuera un subespacio de rechazo de las capas 16 a 71. La model card senala que el modelo conserva rechazos en tres lugares distintos y que existen "reframes" alineados con el estado que un clasificador de rechazo puntuaria como cumplimiento, lo que indica que la eliminacion de rechazos no es completa ni uniforme. Ademas, se distribuye una LoRA de abliteration (`abliteration-lora.gguf`) que reproduce el mismo edit sobre cualquier cuantizacion del modelo stock; la model card advierte que llama.cpp ignora silenciosamente las LoRA sobre `attn_output` en `bailingmoe3` sin aplicar antes el parche `bailingmoe3-lora-attn.patch`, que afecta 56 de los 107 tensores del adaptador.

Las cuantizaciones K-quant se han regenerado a partir del Q8_0 en lugar del BF16, porque un GGUF BF16 de un modelo de 560B ocupa 1,1 TB. En cada K-quant, 10 de 1626 tensores caen a un tipo vecino por incompatibilidad de forma con el tamano de bloque, algo que la model card describe como normal.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Ling-3.1-flash-1019.
- Prediccion multi-token (bloque MTP) presente en la arquitectura.
- Respuestas sin rechazo ante peticiones que el modelo stock rechazaria (comportamiento "uncensored").
- Capacidad de ser utilizado como base para red teaming y evaluacion de seguridad.
- Aplicacion de la editeracion mediante LoRA sobre cuantizaciones del modelo stock.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Vision, audio o thinking mode: no disponible.

## Casos de uso

- Investigacion sobre abliteration: comparar el comportamiento del modelo stock frente a esta variante para medir cuanto rechazo persiste tras proyectar fuera el subespacio de rango 4, usando la LoRA distribuida para reproducir el edit sobre otras cuantizaciones.
- Red teaming y evaluacion de seguridad: probar prompts adversarios contra un modelo sin filtros de rechazo para caracterizar vulnerabilidades de la familia Ling-3.1 y validar clasificadores de rechazo externos.
- Generacion creativa sin restricciones: producir narrativa, guiones o dialogos con tematicas que el modelo stock rechazaria, aprovechando los 25B parametros activos para mantener coherencia en contextos largos (siempre que la ventana de contexto lo permita).
- Despliegue local con llama.cpp: ejecutar la variante Q3_K_M (272 GB) o Q4_K_M (346 GB) en servidores con suficiente VRAM o RAM para servir un endpoint compatible con la API de llama-server.
- Estudio de robustez de cuantizaciones: analizar como afecta la cuantizacion K-quant (regenerada desde Q8_0) al comportamiento del modelo abliterated, usando los logs por tensor incluidos en `quantize-logs/`.
- Desarrollo de adaptadores LoRA: usar `abliteration-lora.gguf` como referencia para construir y aplicar adaptadores sobre arquitecturas MoE con atencion heterogenea, aplicando el parche de llama.cpp necesario.
- Experimentacion con arquitecturas MoE a gran escala: estudiar el rendimiento de un MoE de 560B/25B activos en llama.cpp con soporte `bailingmoe3`, comparando latencia y calidad entre Q8_0 y Q3_K_M.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM para inferencia: Q8_0 requiere 608 GB, Q6_K 470 GB, Q4_K_M 346 GB y Q3_K_M 272 GB. Estas cifras corresponden al tamano de los pesos; el consumo real sera superior por el estado de KV cache y overhead de llama.cpp.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el tamano de los pesos, ninguna GPU consumer individual (RTX 4090 con 24 GB) puede alojar el modelo completo; se requiere agregacion de memoria en multiples GPU o ejecucion en CPU con RAM suficiente.
- Cabe en consumer GPU: no, en ningun caso con una sola GPU consumer. El quant mas pequeno (Q3_K_M, 272 GB) supera con amplitud la VRAM de cualquier GPU consumer.
- Opciones de despliegue: llama.cpp (`llama-server`) con soporte `bailingmoe3`; carga multi-shard apuntando al primer fichero. vLLM, TGI u Ollama no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Ling-3.1-flash-1019-abliterated-GGUF (este) | 560B | 25B | no disponible | MIT | GGUF multi-shard | Abliterated, requiere llama.cpp `bailingmoe3` |
| Ling-3.1-flash-1019 (stock, inclusionAI) | 560B | 25B | no disponible | no disponible | no disponible | Modelo original sin abliteration |
| mrfakename/Ling-3.1-flash-1019-abliterated | 560B | 25B | no disponible | MIT | safetensors (repo base) | Version abliterated en pesos originales |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- El modelo cumplira con peticiones daninas; la model card traslada explicitamente al usuario la responsabilidad del uso.
- La abliteration no elimina todos los rechazos: persisten en tres lugares distintos y existen reframes que un clasificador de rechazo puntuaria como cumplimiento, por lo que el comportamiento puede ser inconsistente.
- Riesgo elevado de alucinacion y de generar contenido danino, dada la eliminacion del subespacio de rechazo.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Limitaciones de contexto e idioma: no disponibles; la longitud de contexto no esta documentada.
- La licencia MIT permite uso comercial, pero el uso de una variante uncensored en produccion conlleva riesgos legales y reputacionales que deben evaluarse.
- Requiere llama.cpp con soporte `bailingmoe3`; sin el parche `bailingmoe3-lora-attn.patch`, la LoRA de abliteration se aplica solo parcialmente (56 de 107 tensores afectados) sin aviso.
- Aplicar la LoRA sobre pesos ya cuantizados no es bit-identico a editar y luego cuantizar; el checkpoint parcheado del repo es la referencia.
- El tamano del repositorio (1695,8 GB) y de cada cuantizacion impone requisitos de almacenamiento y transferencia muy elevados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mrfakename/Ling-3.1-flash-1019-abliterated-GGUF
- Modelo base abliterated: https://huggingface.co/mrfakename/Ling-3.1-flash-1019-abliterated
- Modelo original stock: https://huggingface.co/inclusionAI/Ling-3.1-flash-1019
- Discord del autor: https://discord.com/invite/foss
