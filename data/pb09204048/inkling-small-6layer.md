# pb09204048/Inkling-Small-6layer

## Resumen

Inkling-Small-6layer es un recorte de 6 capas del modelo thinkingmachines/Inkling-Small, publicado por el usuario pb09204048. No se trata de un modelo entrenado de forma independiente, sino de una porcion extraida del checkpoint original con el unico proposito de servir como conjunto de pruebas de integracion continua (CI) para el proyecto miles. El autor advierte de forma explicita que las capas se cortaron sin ningun reentrenamiento posterior, por lo que sus salidas no son significativas y el modelo no esta pensado para ofrecer calidad de inferencia.

A pesar de ser un recorte de solo 6 capas de transformer, el repositorio ocupa 61,2 GB y declara 30.590.643.214 parametros totales. Esta aparente contradiccion se explica porque el autor conservo intactos los tensores que no pertenecen a las capas de texto eliminadas: los embeddings, la normalizacion final, la unembedding, todas las capas MTP (multi-token prediction) y los adaptadores de vision y audio. Es decir, la mayor parte del peso no corresponde al stack de 6 capas, sino a estos componentes completos del modelo original.

El interes de esta ficha es principalmente documental: ilustra como se estructura internamente la familia Inkling-Small (atencion hibrida con ventanas locales y globales, mezcla de MLP densos y MoE) y sirve como referencia para quien quiera entender que se conserva y que se elimina al hacer un slice de un modelo multimodal grande con fines de test.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion local (sliding-window) y global, MLP densos y capas MoE (recorte de 6 capas de un modelo de 42) |
| Parametros totales | 30.590.643.214 (30,6 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en BF16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un recorte de las capas de texto 0-5 del Inkling-Small original, que consta de 42 capas. El patron de atencion reproduce el que el modelo completo repite cada seis capas: cinco capas de atencion local (sliding-window), identificadas como 0-4, seguidas de una capa de atencion global (capa 5). En cuanto a las capas feed-forward, las capas 0-1 emplean MLP densos y las capas 2-5 son capas MoE (mixture of experts).

El `config.json` es el original con dos unicos cambios: `text_config.num_hidden_layers = 6` y `text_config.local_layer_ids = [0, 1, 2, 3, 4]`. Todos los tensores son copias BF16 identicas byte a byte del checkpoint original: embeddings, normalizacion final, unembedding, capas de texto 0-5, todas las capas MTP y los adaptadores de vision y audio. El tokenizer, la plantilla de chat y los ficheros de procesador se copiaron sin modificar.

No hubo ningun proceso de entrenamiento, ajuste fino, RLHF ni DPO asociado a este modelo. Al tratarse de un corte sin reentrenamiento, las capas conservadas no forman un stack funcional coherente con la salida del modelo global, de ahi que el autor indique que los resultados no son utilizables.

## Capacidades

- No dispone de capacidades funcionales fiables de generacion de texto: el autor indica explicitamente que las salidas no son significativas.
- El repositorio conserva los tensores de los adaptadores de vision y audio del modelo original, aunque no se documenta su funcionamiento en este recorte.
- Conserva las capas MTP (multi-token prediction) del checkpoint original.
- Incluye tokenizer, plantilla de chat y ficheros de procesador heredados del modelo base.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico en este recorte.
- Uso previsto: pruebas de integracion continua (CI) del framework miles.

## Casos de uso

- Pruebas de integracion continua del framework miles: el modelo se publico especificamente para este fin, de modo que sirve para verificar que las rutas de carga de pesos, tokenizer y configuracion funcionan correctamente.
- Validacion de pipelines de carga de safetensors: al ser un checkpoint BF16 real de gran tamano, permite comprobar el comportamiento de cargadores ante ficheros de 61,2 GB.
- Verificacion de configuraciones de atencion hibrida: sirve para comprobar como un runtime interpreta el patron de cinco capas locales mas una global declarado en `local_layer_ids`.
- Pruebas de gestion de memoria y sharding: util para comprobar estrategias de reparto de un checkpoint grande entre dispositivos.
- Validacion de compatibilidad de tokenizer y plantilla de chat heredadas del modelo base.
- Pruebas de carga de pesos multimodales parciales, dado que se conservan los adaptadores de vision y audio aunque las capas de texto esten recortadas.
- No es adecuado para ningun caso de uso en produccion ni para tareas de inferencia real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El checkpoint pesa 61,2 GB en BF16, por lo que la carga completa en memoria requiere aproximadamente esa cantidad de VRAM mas el overhead del runtime.
- No cabe en GPUs de consumo habituales (por ejemplo, RTX 4090 de 24 GB) sin un reparto entre varios dispositivos, dado el tamano del checkpoint.
- GPU recomendadas para cargar el checkpoint completo: H100 80 GB o A100 80 GB. Tambien posible con varias GPUs de 24-48 GB mediante sharding, aunque no se documenta la configuracion.
- No se ofrecen cuantizaciones (GGUF, AWQ, GPTQ) en el repositorio, por lo que no hay una via ligera documentada para reducir el uso de memoria.
- Opciones de despliegue: no documentadas. El uso previsto es como fixture del framework miles, no como servidor de inferencia.
- Latencia y throughput: no disponibles; ademas carecen de sentido dado que la calidad de salida no es valida.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| Inkling-Small-6layer | 30,6 mil millones | no disponible | apache-2.0 | Recorte para CI, sin calidad de inferencia |
| thinkingmachines/Inkling-Small | no disponible (modelo base de 42 capas) | no disponible | no disponible | Modelo original completo |
| Otros recortes de modelos para test | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento del modelo base ni de alternativas directamente comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El autor indica de forma explicita que el modelo no esta pensado para calidad de inferencia y que sus salidas no son significativas, al haberse recortado las capas sin reentrenar.
- No debe utilizarse en produccion ni para tareas reales de generacion, razonamiento o codigo.
- El recorte no forma un modelo funcionalmente coherente: conserva embeddings, unembedding y adaptadores del modelo completo pero solo 6 de las 42 capas de texto.
- No hay informacion sobre sesgos, alucinacion o comportamiento multilingue, y cualquier evaluacion en ese sentido carece de validez.
- La licencia apache-2.0 permite uso comercial segun los terminos de dicha licencia, pero el propio modelo carece de utilidad practica mas alla del test.
- No se ofrecen cuantizaciones ni rutas de despliegue documentadas.
- El elevado tamano del repositorio (61,2 GB) puede suponer un coste de almacenamiento y ancho de banda considerable para descargas.

## Enlaces

- HuggingFace: https://huggingface.co/pb09204048/Inkling-Small-6layer
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-Small
- Repositorio del framework miles: https://github.com/radixark/miles
