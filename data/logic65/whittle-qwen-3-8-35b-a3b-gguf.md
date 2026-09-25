# logic65/Whittle-Qwen-3.8-35B-A3B-GGUF

## Resumen

Whittle-Qwen-3.8-35B-A3B-GGUF es el paquete de cuantizaciones GGUF listas para ejecutar con llama.cpp del modelo logic65/Whittle-Qwen-3.8-35B-A3B, un mixture-of-experts (MoE) de 35,1 B de parametros totales y unos 3 B activos por token desarrollado por David Aylward (logic65) con asistencia de Claude (Anthropic). El modelo base se construye sobre Whittle-Next-27B-A3B y se destila a partir del profesor Qwen/Qwen3.8-27B, con la memoria n-gram extraida de Qwen/Qwen3.8-Flash-Next. Este repositorio concreto no aporta pesos nuevos: contiene los ficheros GGUF reescalados desde el Q8_0 de referencia.

Su rasgo distintivo es la arquitectura `qwen4exp` (formato Qwen3.8-Flash-Next), que incorpora una memoria n-gram de aproximadamente 10 B de parametros (`per_layer_token_embd`) que es funcionalmente portante: segun el autor, ponerla a cero cuesta +2,12 nats en codigo no visto. Esa memoria se puede mantener en RAM del sistema mientras la GPU aloja un cuerpo de clase 27 B, de modo que la generacion corre a velocidad de 3 B activos. Es relevante ahora porque permite servir un modelo de 35 B totales en tarjetas de 16-24 GB sin parches en llama.cpp, algo poco habitual en modelos MoE de esta escala.

El repositorio se publico el 19 de septiembre de 2026 y se actualizo el 24 de septiembre de 2026 (revision `lw2`), acumulando 1093 descargas y 2 likes en el momento de la consulta. La licencia es Apache-2.0, los idiomas declarados son ingles, chino y multilingue, y el formato es exclusivamente GGUF bajo llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE, arquitectura `qwen4exp` (formato Qwen3.8-Flash-Next) con memoria n-gram por capa (`per_layer_token_embd`) |
| Parametros totales | 35.547.542.656 (≈35,1 B segun el autor) |
| Parametros activos | ≈3 B por token |
| Memoria n-gram | ≈10 B de parametros (lookup, una fila por token y cabeza); ≈10,5 GB de cada fichero en Q8 |
| Longitud de contexto | 256K segun LLM Explorer (fuente tercera); no confirmada en la model card, cuyo ejemplo de despliegue usa `-c 16384` |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M (GGUF) |
| Idiomas soportados | en, zh, multilingue (etiquetas declaradas por el autor) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repositorio | 374,0 GB |
| Libreria | llama.cpp |
| Pipeline | text-generation |
| Modelo base | logic65/Whittle-Qwen-3.8-35B-A3B (relacion: quantized) |
| Fecha de publicacion | 19 de septiembre de 2026 (actualizado el 24 de septiembre de 2026) |

## Arquitectura y entrenamiento

El modelo base es un MoE de tipo transformer con arquitectura `qwen4exp`, el formato de Qwen3.8-Flash-Next. El cuerpo principal mantiene una huella de clase 27 B, mientras que la capa de expertos enrutados aporta el resto de los 35,1 B totales, con unos 3 B activos por token. Ademas, incorpora una memoria n-gram por capa (`per_layer_token_embd`) de aproximadamente 10 B de parametros, implementada como tabla de consulta con una fila por token y cabeza. El autor afirma que esa memoria es portante: anularla supone +2,12 nats de perdida en codigo no visto, un resultado de ablacion medido sobre los pesos completos del modelo base.

El entrenamiento combina destilacion de conocimiento desde Qwen/Qwen3.8-27B como profesor, partiendo de Whittle-Next-27B-A3B como modelo padre y tomando el contenido de la memoria de Qwen/Qwen3.8-Flash-Next. Todo el linaje declarado es Apache-2.0. El autor indica que el modelo fue destilado sobre trazas de razonamiento completas, de ahi que el modo thinking mejore los resultados. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO. Los pesos se distribuyen unicamente en GGUF; las K-quants se recuantizaron a partir del Q8_0, y el autor advierte que hay que servir la tabla completa, ya que una build que elimine o re-hashee `per_layer_token_embd` se comporta como el padre v4.4 sin su conocimiento.

## Capacidades

- Generacion de texto conversacional en ingles, chino y otros idiomas (etiqueta multilingue del autor).
- Razonamiento con modo thinking explicito: se activa mediante `"chat_template_kwargs": {"enable_thinking": true}` y fue destilado sobre trazas de pensamiento completas.
- Generacion de codigo, con recomendacion del autor de asignar `max_tokens` de 4096 o mas para tareas de codigo.
- Matematicas, aunque el autor advierte que la cuantizacion Q3_K_M presenta perdidas en esta area.
- Separacion del razonamiento en el campo `reasoning_content` mediante `--reasoning-format deepseek`.
- Memoria n-gram condicional que aporta conocimiento recuperable token a token (etiquetas `n-gram-memory` y `conditional-memory`).
- Despliegue compatible con endpoints (etiqueta `endpoints_compatible`).
- Soporte de plantillas de chat Jinja en llama.cpp (`--jinja`).
- No se documenta en la informacion disponible soporte de tool calling, function calling, uso de agentes multi-paso, vision ni audio.

## Casos de uso

- Autocompletado y generacion de codigo en local: con thinking activado y `max_tokens` de 4096 o superior, el modelo puede generar funciones completas dentro de un IDE o un pipeline de integracion, manteniendo la memoria n-gram en RAM y el cuerpo en una GPU de 16-24 GB.
- Asistente de programacion sobre repositorios extensos: la ventana de contexto declarada por terceros (256K) permite cargar varios ficheros en una misma consulta para tareas de refactorizacion o revision cruzada, aunque el ejemplo oficial de despliegue use 16384 tokens.
- Servicio de chat multilingue: el soporte declarado de ingles, chino y multilingue encaja en atencion al cliente o asistentes internos que alternan idiomas en una misma conversacion multi-turno.
- Razonamiento asistido por pasos para analisis tecnico: activando `enable_thinking`, el modelo expone su cadena de razonamiento separada del texto final, lo que resulta util en herramientas de auditoria o depuracion donde se necesita revisar el proceso, no solo la respuesta.
- Analisis de matematicas y problemas cuantitativos: adecuado para cuantizaciones Q5_K_M o superiores, evitando Q3_K_M cuando la exactitud numerica sea critica.
- Despliegue en estaciones de trabajo con GPU de consumo: gracias al reparto entre RAM del sistema (memoria n-gram y, opcionalmente, expertos enrutados) y VRAM, permite servir un modelo de clase 35 B en equipos con 16-24 GB de VRAM.
- Experimentacion e investigacion sobre memorias condicionales: el modelo esta etiquetado como `research` y permite estudiar el efecto de la memoria n-gram mediante ablaciones reproducibles (anular `per_layer_token_embd` degrada la perplejidad en codigo).
- Generacion local sin conectividad: al ejecutarse con llama.cpp, es viable en entornos aislados o con requisitos de privacidad estrictos donde no se puede llamar a una API externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas equivalentes. El unico dato cuantitativo de evaluacion disponible es la ablacion sobre la memoria n-gram: anular `per_layer_token_embd` produce una perdida de +2,12 nats en codigo no visto, segun el autor.

Como referencia externa no equivalente, un articulo sobre la filtración del Qwen 3.8-35B-A3B en ModelScope cita alrededor de 80 tok/s de inferencia para ese modelo; se trata de otro modelo y otra configuracion, por lo que no debe tomarse como rendimiento medido de Whittle.

## Requisitos de hardware

- Tamano de los ficheros GGUF: Q8_0 37,8 GB; Q6_K 29,3 GB; Q5_K_M 25,1 GB; Q4_K_M 21,3 GB; Q3_K_M 16,7 GB.
- La memoria n-gram ocupa aproximadamente 10,5 GB de cada fichero en Q8 y proporcionalmente menos en bits inferiores. Debe residir en RAM del sistema con `-ot per_layer_token_embd=CPU`; en ese caso la GPU aloja una huella de clase 27 B y la generacion corre a velocidad de 3 B activos.
- Recomendacion del autor: Q5_K_M para una sola tarjeta de 24 GB con la memoria en RAM; Q4_K_M como opcion por defecto para tarjetas de 16-20 GB con la memoria en RAM.
- Q8_0 se describe como cuantizacion de referencia y Q6_K como practicamente sin perdida; Q3_K_M es la mas pequena y el autor anticipa perdidas en matematicas.
- Para tarjetas pequenas se pueden mover tambien los expertos enrutados a RAM con `-ot "per_layer_token_embd=CPU" -ot "\.ffn_(up|down|gate)_exps\.=CPU"`.
- LLM Explorer cita 4,5 GB de VRAM para este modelo, cifra que no se corresponde con el reparto descrito en la model card y que debe tomarse con cautela.
- Despliegue: llama.cpp / llama-server con `-ngl 99 -c 16384 --jinja -fa on -ot per_layer_token_embd=CPU`. La arquitectura `qwen4exp` exige una build de llama.cpp actualizada; si la build reporta arquitectura desconocida, hay que actualizarla.
- No hay datos publicados de latencia ni throughput especificos de este modelo en la informacion disponible. Tampoco se documenta soporte para vLLM, TGI u Ollama.
- Parametros de muestreo recomendados: `temperature 0.7, top_p 0.8, top_k 20, repeat_penalty 1.05`, con muestreo obligatorio; el autor advierte que la decodificacion greedy entra en bucles en esta familia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Whittle-Qwen-3.8-35B-A3B (este, GGUF) | 35,1 B totales, ≈3 B activos + ≈10 B de memoria | 256K segun terceros; no confirmado en la model card | Sin benchmarks publicados; ablacion de -2,12 nats al anular la memoria | Apache-2.0 | GGUF en HuggingFace, llama.cpp |
| Whittle-Qwen-3.8-35B-A3B (pesos base) | 35,1 B totales, ≈3 B activos | no disponible | Sin benchmarks publicados | Apache-2.0 | Pesos completos en HuggingFace |
| logic65/Whittle-Next-27B-A3B (padre) | no disponible | no disponible | no disponible | Apache-2.0 | HuggingFace |
| Qwen/Qwen3.8-27B (profesor) | 27 B (segun denominacion) | no disponible | no disponible | no disponible en la informacion proporcionada | HuggingFace |
| Qwen 3.8-35B-A3B (filtrado en ModelScope) | 35 B totales, 3 B activos | no disponible | ≈80 tok/s citados en un articulo externo | no disponible | no confirmada |

No se dispone de datos publicados que permitan una comparacion cuantitativa fiable con alternativas de la misma categoria en terminos de MMLU, HumanEval u otras metricas.

## Limitaciones y advertencias

- No se han publicado benchmarks estandar, por lo que no hay evidencia publica cuantitativa de calidad frente a modelos comparables.
- La memoria n-gram es portante: eliminar, reducir o re-hashear `per_layer_token_embd` degrada el modelo hasta comportarse como el padre sin su conocimiento. No se debe servir un subconjunto parcial de la tabla.
- La decodificacion greedy provoca bucles en esta familia; es obligatorio usar muestreo con los parametros indicados.
- La cuantizacion Q3_K_M presenta perdidas en matematicas segun el propio autor.
- El modo thinking es necesario para obtener el mejor rendimiento; fue destilado sobre trazas de razonamiento completas, y para codigo se recomienda reservar 4096 tokens o mas.
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio; asumirlas en produccion es arriesgado.
- Riesgo de alucinacion: no hay evaluaciones de factualidad publicadas para este modelo ni para su cadena de destilacion.
- Sesgos conocidos: no documento disponibles; el modelo hereda las caracteristicas de sus datos de destilacion y del profesor, no descritas en la informacion proporcionada.
- Limitaciones de idioma: las etiquetas declaran ingles, chino y multilingue, pero no se especifica cobertura ni calidad por idioma; el castellano no aparece explicitamente respaldado por evaluaciones.
- La arquitectura `qwen4exp` requiere builds recientes de llama.cpp; en versiones antiguas el modelo no carga.
- El despliegue depende de un reparto manual entre VRAM y RAM; una configuracion incorrecta puede degradar gravemente la velocidad o impedir la carga.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero las condiciones de los modelos de los que deriva (Qwen3.8-27B, Qwen3.8-Flash-Next) no se detallan en la informacion disponible y conviene verificarlas por separado.
- El modelo esta etiquetado como `research`; su uso en produccion sin evaluacion propia previa no esta respaldado por datos publicados.
- El repositorio ocupa 374 GB, un coste de almacenamiento relevante si se descargan varias cuantizaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/logic65/Whittle-Qwen-3.8-35B-A3B-GGUF
- README del repositorio: https://huggingface.co/logic65/Whittle-Qwen-3.8-35B-A3B-GGUF/blob/main/README.md
- Modelo base: https://huggingface.co/logic65/Whittle-Qwen-3.8-35B-A3B
- Modelo padre: https://huggingface.co/logic65/Whittle-Next-27B-A3B
- Profesor de destilacion: https://huggingface.co/Qwen/Qwen3.8-27B
- Origen del contenido de la memoria: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Ficha en LLM Explorer: https://llm-explorer.com/model/logic65%2FWhittle-Qwen-3.8-35B-A3B,3wQmazLNQZM0FSCV5mgRyV
- Ficha en GenAiHub: https://genaihub.net/agents/hf-model-logic65-whittle-qwen-3-8-35b-a3b
- Analisis del Qwen 3.8-35B-A3B filtrado: https://ia4pymes.tech/en/blog/qwen-3-8-35b-a3b-moe-leak-modelscope-sme-efficiency-2026
- Apoyo al autor: https://ko-fi.com/davida81328
