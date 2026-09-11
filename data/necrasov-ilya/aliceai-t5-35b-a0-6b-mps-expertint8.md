# necrasov-ilya/AliceAI-T5-35B-A0.6B-MPS-ExpertInt8

## Resumen

AliceAI-T5-35B-A0.6B MPS ExpertInt8 es un derivado cuantizado de yandex/AliceAI-T5-35B-A0.6B, publicado por el usuario necrasov-ilya. Se trata de una pre-release orientada a la ejecución local en Apple Silicon mediante un runtime propio llamado Alice Extractor. El checkpoint combina expertos en int8 con el resto de parámetros en BF16, y ocupa aproximadamente 33 GB repartidos en 15 shards de Safetensors.

El propósito declarado es la extracción local de campos estructurados a partir de facturas en ruso, además de servir como banco de pruebas para investigación sobre ejecución de modelos dispersos (MoE) en hardware de Apple. El modelo hereda la arquitectura y capacidades del modelo base de Yandex, un transformer de tipo T5 con mezcla de expertos de 35B parámetros totales y aproximadamente 0,6B parámetros activos por token según la nomenclatura del nombre.

La relevancia actual del repositorio es limitada pero informativa: los pesos están intencionadamente retenidos a la espera de validar la calidad de salida frente al camino de ejecución de referencia en BF16, por lo que no es un artefacto listo para producción. Aun así, documenta un formato de cuantización mixta propio y ofrece mediciones preliminares de latencia en un M1 Max que resultan de interés para quien investigue inferencia de MoE en memoria unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo T5 con mezcla de expertos (MoE), segun las etiquetas del repositorio y la nomenclatura del modelo base |
| Parametros totales | 35B (segun el nombre del modelo base; no confirmado en la model card) |
| Parametros activos | Aproximadamente 0,6B (segun el sufijo A0.6B del modelo base; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 simetrico (una escala por fila de salida) en las tres matrices de cada experto enrutado; BF16 en embeddings, capas de atencion, routers, normalizacion y resto de parametros |
| Idiomas soportados | Ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors, 15 shards, aproximadamente 33 GB; formato mixto int8/BF16 especifico del proyecto, no compatible con las interfaces estandar de cuantizacion de Transformers |

Otros datos de interes: el repositorio se creo el 11 de septiembre de 2026 y se actualizo el mismo dia; registra 0 descargas y 0 likes; la libreria declarada es transformers, aunque el checkpoint requiere el runtime Alice Extractor para cargarse.

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo T5 con mezcla de expertos (MoE) que enruta cada token hacia ocho expertos. La derivacion presentada aqui no modifica la topologia: mantiene la estructura del modelo original e interviene unicamente en la representacion numerica de los pesos. En concreto, las tres matrices de cada experto enrutado se cuantizan de forma simetrica a int8 con una escala por fila de salida, mientras que los embeddings, las capas de atencion, los routers, las capas de normalizacion y el resto de parametros permanecen en BF16. El runtime procesa exclusivamente los ocho expertos seleccionados para cada token y divide las entradas multi-token en fragmentos acotados para limitar la memoria temporal.

No se dispone de informacion sobre el proceso de entrenamiento del modelo base: no hay datos publicos en la informacion proporcionada sobre el numero de tokens, la composicion del dataset, ni sobre si se aplicaron tecnicas de ajuste como RLHF o DPO. Tampoco se documentan innovaciones arquitectonicas adicionales mas alla del enrutado disperso y de la propia estrategia de cuantizacion mixta por experto, que es la aportacion tecnica principal de este repositorio.

## Capacidades

- Generacion de texto en ruso: el modelo deriva de un T5 del fabricante Yandex y hereda sus capacidades linguisticas en ese idioma.
- Extraccion de campos estructurados: caso de uso principal declarado, centrado en facturas en ruso.
- Ejecucion local en Apple Silicon: disenado especificamente para inferencia en Macs con chip de la serie M mediante el runtime Alice Extractor.
- Ejecucion dispersa de MoE: activa unicamente los ocho expertos enrutados por token, lo que reduce el coste computacional frente al camino denso.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Extraccion de campos de facturas rusas en local: es el primer caso de uso evaluado por el autor. El modelo recibe el texto de la factura y devuelve los campos estructurados, procesando todo en el propio equipo sin enviar documentos a servicios externos.
- Procesamiento de documentos con requisitos de privacidad: al ejecutarse integramente en un Mac con memoria unificada, resulta adecuado para entornos donde los documentos no pueden salir de la maquina, como despachos contables o departamentos financieros con politicas estrictas de tratamiento de datos.
- Investigacion sobre ejecucion de MoE en Apple Silicon: el checkpoint sirve como banco de pruebas para medir el impacto del enrutado disperso y de la cuantizacion int8 por experto en memoria unificada, comparandolo con el camino denso en BF16.
- Desarrollo de pipelines de extraccion documental en ruso: permite prototipar y validar esquemas de extraccion antes de trasladarlos a infraestructura de servidor, aprovechando que el formato de pesos es ligero en comparacion con el modelo BF16 completo.
- Evaluacion comparativa de formatos de cuantizacion: util para estudiar como afecta la cuantizacion int8 selectiva (solo expertos, no atencion ni embeddings) a la calidad de las continuaciones frente al modelo de referencia.
- Docencia y experimentacion en hardware de consumo profesional: posibilita trabajar con un modelo de 35B parametros totales en un solo equipo de sobremesa de Apple, algo inviable con el checkpoint BF16 completo en ese tipo de maquina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor indica explicitamente que el modelo aun no ha superado el benchmark de extraccion de facturas previsto.

Si se han publicado mediciones preliminares de latencia, obtenidas en una unica ejecucion de desarrollo:

| Medicion | Valor |
|---|---|
| Hardware | Apple M1 Max, 64 GB de memoria unificada |
| Sistema y entorno | macOS 26.6.2, Python 3.12.0, PyTorch 2.10.0, Transformers 5.14.1 |
| Entrada | 57 tokens |
| Salida generada | 17 tokens |
| Fase completa en caliente (runtime enrutado) | 2,561 s |
| Fase completa en caliente (baseline denso local) | 10,282 s |
| Aceleracion de la codificacion de entrada en caliente | 5,54x |
| Decodificacion cacheada de un token | Aproximadamente 19 tokens/s en ambos caminos |

El autor advierte que se trata de mediciones de una sola ejecucion, que no constituyen una afirmacion sobre la calidad final del modelo ni sobre su rendimiento general en otras configuraciones de hardware. En el ejemplo registrado, el valor extraido principal coincidio con el del camino de referencia, mientras que los tokens de continuacion posteriores difirieron.

## Requisitos de hardware

- Memoria: el checkpoint ocupa aproximadamente 33 GB, de modo que se necesita un Mac con memoria unificada claramente superior a esa cifra para acomodar pesos y estados intermedios. La unica configuracion documentada es un M1 Max con 64 GB.
- GPU compatibles: Apple Silicon con memoria unificada suficiente. No se documenta soporte para GPU NVIDIA (A100, H100, RTX 4090) ni AMD en la informacion proporcionada.
- GPU de consumo: si cabe en equipos Apple de gama alta con memoria unificada amplia; no hay datos sobre su funcionamiento en GPUs de consumo tradicionales.
- Opciones de despliegue: el checkpoint requiere el runtime Alice Extractor. No utiliza las interfaces estandar de cuantizacion de Transformers y no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI. No se distribuyen pesos en formato GGUF.
- Latencia y throughput: para una entrada de 57 tokens y 17 tokens generados, 2,561 s de extremo a extremo con el runtime enrutado y 10,282 s con el baseline denso; aproximadamente 19 tokens/s en decodificacion cacheada de un token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| necrasov-ilya/AliceAI-T5-35B-A0.6B-MPS-ExpertInt8 | 35B totales, aproximadamente 0,6B activos (segun nombre) | no disponible | int8 en expertos y BF16 en el resto | Apache 2.0 | Pesos retenidos hasta la primera release validada |
| yandex/AliceAI-T5-35B-A0.6B (modelo base) | 35B totales, aproximadamente 0,6B activos | no disponible | BF16 | Apache 2.0 | Publicado en HuggingFace |
| Otros modelos de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa mas relevante es con el modelo base en BF16: el derivado reduce el peso del checkpoint a unos 33 GB y acelera la fase de codificacion de entrada 5,54 veces en el hardware probado, a costa de un formato de pesos propio que exige un runtime especifico y de posibles divergencias en los tokens de continuacion.

## Limitaciones y advertencias

- Disponibilidad: los pesos estan intencionadamente retenidos. El repositorio es una pre-release que documenta la relacion con el modelo base y el formato de artefacto previsto, no un modelo listo para descargar y usar.
- Calidad no validada: el autor indica que el checkpoint aun no ha superado el benchmark de extraccion de facturas planificado.
- Divergencia de salida: puede producir continuaciones distintas a las del camino de ejecucion de referencia en BF16; en el ejemplo registrado, los tokens posteriores al valor extraido principal no coincidieron.
- Requisito de hardware: necesita un Mac con Apple Silicon y memoria unificada suficiente, ademas del runtime Alice Extractor.
- Formato propietario: emplea un formato mixto int8/BF16 especifico del proyecto, sin integracion con las interfaces estandar de cuantizacion de Transformers ni con las herramientas de despliegue habituales.
- Cobertura idiomatica: declarado unicamente para ruso, lo que limita su uso en otros mercados sin evaluacion adicional.
- Sesgos y alucinacion: hereda los sesgos y limitaciones del modelo base, que no se detallan en la informacion proporcionada. No hay documentacion especifica sobre tasas de alucinacion.
- Licencia: Apache 2.0 permite uso comercial, pero se deben conservar los avisos de copyright de YANDEX LLC. El proyecto derivado es independiente y no esta afiliado ni respaldado por Yandex.
- Medidas preliminares: los datos de latencia provienen de una unica ejecucion en un unico equipo y no deben extrapolarse a otras configuraciones.

## Enlaces

- Repositorio del modelo: https://huggingface.co/necrasov-ilya/AliceAI-T5-35B-A0.6B-MPS-ExpertInt8
- Modelo base: https://huggingface.co/yandex/AliceAI-T5-35B-A0.6B
- Runtime Alice Extractor: https://github.com/necrasov-ilya/alice-extractor

No se han encontrado papers, blogs ni demos adicionales en la busqueda web realizada.
