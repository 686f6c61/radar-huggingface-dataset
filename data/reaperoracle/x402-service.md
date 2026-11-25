# ReaperOracle/x402-service

## Resumen

ReaperOracle/x402-service es un repositorio publicado en Hugging Face que, a tenor de su model card, no contiene un modelo de lenguaje sino un servicio HTTP denominado "Reaper Claim Verify". El servicio expone dos endpoints: un chequeo de salud gratuito (`GET /health`) y un endpoint de informes (`GET /report?claim=<claim>`) protegido mediante el protocolo de pagos x402, con un coste declarado de 0,01 USDC en la red Base. Las peticiones no pagadas reciben un HTTP 402 con los requisitos de pago, incluidos metadatos de descubrimiento de Bazaar, y las pagadas se verifican y liquidan a traves del facilitador publico PayAI antes de servirse.

No se dispone de informacion sobre arquitectura, parametros, contexto, datos de entrenamiento ni pesos. El repositorio no declara pipeline, licencia, idiomas ni formato de pesos, y en el momento de la consulta registra 0 descargas y 0 likes. Por tanto, esta ficha no puede describir un modelo generativo: documenta un artefacto de tipo servicio/API cuyo interes radica en el uso del estandar x402 para monetizar peticiones HTTP con stablecoins.

La relevancia actual del artefacto es acotada y experimental: ilustra un patron de pago por peticion sobre HTTP para servicios de verificacion o investigacion, pero carece de documentacion tecnica sobre el motor subyacente que genera los informes. Cualquier evaluacion de calidad, latencia o precision resulta imposible con los datos disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el artefacto es un servicio HTTP, no se documenta el modelo subyacente) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se publican pesos; se describe un servicio con endpoints `/health` y `/report`) |

## Arquitectura y entrenamiento

No se proporciona informacion sobre la arquitectura del sistema que genera los informes de verificacion. La model card unicamente describe la capa de servicio: un endpoint `GET /health` sin coste y un endpoint `GET /report?claim=<claim>` con pago por peticion a traves del protocolo x402, con precio de 0,01 USDC en Base y liquidacion mediante el facilitador publico PayAI. Las peticiones sin pago devuelven HTTP 402 acompanado de los requisitos de pago y metadatos de descubrimiento de Bazaar.

No hay datos sobre volumen de entrenamiento, composicion del dataset, tecnicas de alineacion (RLHF, DPO) ni innovaciones de inferencia. Tampoco se especifica si el servicio delega en un modelo de terceros, en busquedas web o en una base de conocimiento propietaria.

## Capacidades

- Verificacion de afirmaciones ("claims") mediante un endpoint HTTP que devuelve un informe, segun la descripcion del servicio.
- Descubrimiento de servicio a traves de metadatos Bazaar incluidos en la respuesta HTTP 402.
- Pago programatico por peticion con USDC en la red Base mediante el protocolo x402.
- Chequeo de disponibilidad sin coste mediante `GET /health`.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, agentes ni multilingues.
- No se documenta modo de razonamiento extendido ni capacidades multimodales.

## Casos de uso

- Verificacion automatizada de afirmaciones en pipelines de investigacion: un cliente programatico enviaria la afirmacion al endpoint `/report` y abonaria 0,01 USDC por informe, lo que permite integrar la verificacion como un paso facturable dentro de un flujo mayor.
- Monitorizacion de disponibilidad: el endpoint `/health` gratuito permite comprobar el estado del servicio desde sistemas de observabilidad sin incurrir en costes.
- Integracion en agentes autonomos con pago por uso: un agente dotado de monedero en Base podria descubrir el servicio mediante los metadatos Bazaar de la respuesta 402 y pagar por peticion sin intervencion humana.
- Facturacion granular en productos de analisis: util para ofrecer informes de verificacion como microservicio con coste por consulta, evitando suscripciones.
- Pruebas de concepto de arquitecturas x402: el servicio sirve como referencia funcional de un endpoint HTTP monetizado con stablecoins para equipos que evaluan este estandar.
- Verificacion bajo demanda en herramientas editoriales o de fact-checking: un redactor o un sistema interno podria solicitar un informe puntual pagando por uso, siempre que la calidad del informe se valide previamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al no documentarse ningun modelo con pesos publicados.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan; el artefacto se describe como un servicio HTTP accesible mediante endpoints, no como pesos cargables en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. El artefacto no es un modelo de lenguaje con parametros y contexto comparables; no se han identificado en la informacion proporcionada alternativas equivalentes de servicio de verificacion con pago x402.

## Limitaciones y advertencias

- No se publica licencia, lo que impide determinar si el uso comercial esta permitido.
- No se documenta el modelo ni la metodologia que produce los informes, por lo que no puede evaluarse la fiabilidad de las verificaciones.
- Riesgo de alucinacion y de falsos positivos o negativos en la verificacion: no cuantificado ni documentado por el autor.
- Ausencia de datos sobre idiomas soportados; no puede asumirse cobertura multilingue.
- Dependencia de infraestructura externa: la liquidacion de pagos recae en el facilitador publico PayAI y en la red Base, lo que introduce puntos de fallo ajenos al servicio.
- El repositorio registra 0 descargas y 0 likes y fue creado y actualizado en la misma fecha, sin historial de mantenimiento ni evidencia de uso en produccion.
- Coste declarado de 0,01 USDC por informe; no se documentan limites de tasa, politicas de reembolso ni niveles de servicio.
- No apto para evaluacion como modelo generativo: no hay pesos, tokenizador ni configuracion publicados.

## Enlaces

- Hugging Face: https://huggingface.co/ReaperOracle/x402-service
