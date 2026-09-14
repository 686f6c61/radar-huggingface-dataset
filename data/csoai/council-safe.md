# csoai/council-safe

## Resumen

council-safe es un repositorio de Hugging Face publicado por csoai que no contiene pesos de un modelo, sino un registro de medicion. Se presenta como un detector interno de fuga de jailbreak ("jail-escape detector") de CSOAI Ltd, medido sobre el mismo tablero GSPC que el resto de modelos y publicado con las cifras tal cual se obtuvieron, incluidas las malas. El artefacto principal no son ficheros de pesos, sino tarjetas firmadas con Ed25519 cuyos hashes sha256 se pueden recuperar y reverificar sin cuenta.

El problema que aborda es la verificabilidad de las afirmaciones de seguridad: segun la propia model card, seis modelos publicos del Hub llevan la palabra "refusing" en el nombre y no rechazan. Frente a eso, este repositorio propone evidencia firmada y ligada a un banco de pruebas congelado, en lugar de una promesa en el nombre o en el README. La relevancia actual es de gobernanza y auditoria: permite comprobar de forma independiente que bytes puntuaron que resultado en un banco concreto en un momento concreto.

Las cifras publicadas son tres: 0,4789 de exactitud en el eje `jail-escape-detection`, 1,0 en `swag-30` y 0,0 en `swarm-candidates`. No se declara arquitectura, numero de parametros, longitud de contexto ni regimen de entrenamiento, porque no se publican pesos ni detalles del modelo subyacente. El pipeline declarado es `text-generation` y el unico idioma soportado es ingles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se publican pesos ni descripcion de la arquitectura del detector) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se distribuyen pesos cuantizados) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | no aplicable: el repositorio no publica pesos. El artefacto son tarjetas firmadas (JSON con hash sha256) y el README de medicion |
| Pipeline declarado | text-generation |
| Artefacto de evidencia | tarjetas firmadas con Ed25519, verificables por sha256 |
| Bancos de evaluacion | csoai/gspc-jail-goldbank, csoai/gspc-swarm |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del detector: el repositorio indica explicitamente que no se publican pesos y la model card no describe capa, tamano ni familia de modelo alguna. Tampoco se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni si hubo ajuste con RLHF o DPO. Lo unico declarado es el uso del modelo como clasificador o generador evaluado sobre ejes del tablero GSPC.

Lo que si se documenta es el andamiaje de medicion. Cada eje se evalua contra un banco congelado y el resultado se sella en una tarjeta firmada: `cff1aaf0…36535f4` para `jail-escape-detection`, `5756982c…9615bcc` para `swag-30` y `4eb8ffdb…8c540c9` para `swarm-candidates`. Las tarjetas se recuperaron y confirmaron con codigo HTTP 200 el 2026-09-04T04:39:12Z. La verificacion se puede hacer a mano siguiendo `HOW-TO-VERIFY.md` o pegando la tarjeta en el verificador publico de councilof.ai. La propia documentacion insiste en que una tarjeta es evidencia de que bytes puntuaron sobre un banco congelado en un momento dado, no una aprobacion, una calificacion ni una garantia de seguridad.

## Capacidades

- Deteccion de fuga de jailbreak: el eje principal medido es `jail-escape-detection` sobre el banco congelado `csoai/gspc-jail-goldbank`.
- Clasificacion binaria de candidatos de ataque: el eje `swag-30` mide exito de deteccion sobre treinta casos del mismo banco.
- Deteccion sobre candidatos generados por enjambre: el eje `swarm-candidates` usa el banco `csoai/gspc-swarm`.
- Emision de evidencia firmada: cada resultado se publica como tarjeta firmada con Ed25519 y direccionable por hash sha256.
- Verificacion sin cuenta: los artefactos se pueden comprobar de forma libre mediante el verificador publico o manualmente.
- Lectura programatica del tablero: existe endpoint de API (`GET https://councilof.ai/api/gspc`), endpoint MCP con doce herramientas y un lector en Python instalable como `csoai-gspc[verify]`.
- Explicacion explicita de su propio alcance: la documentacion declara que es medicion, no certificacion, y que un fallo de recuperacion debe declararse como `UNCHECKABLE`, nunca como un 0,000 fabricado.
- No se declaran capacidades de generacion de texto general, razonamiento, codigo, matematicas, vision, audio, tool calling ni uso como agente.

## Casos de uso

- Auditoria de afirmaciones de seguridad de terceros: un equipo de cumplimiento puede recuperar la tarjeta firmada de un modelo y comprobar que el hash declarado en el Hub coincide con el resultado publicado sobre un banco congelado, lo que permite contrastar promesas de "modelo que rechaza" con evidencia verificable.
- Diligencia debida en compras o integraciones: antes de adoptar un detector de jailbreak en produccion, un comprador puede revisar la exactitud real medida (0,4789 en `jail-escape-detection`) y decidir si ese nivel es aceptable para su politica de riesgo.
- Red teaming con linea base reproducible: un equipo de seguridad puede usar estos ejes como referencia fija y comparar sus propios detectores contra el mismo banco, evitando comparaciones sobre conjuntos de pruebas que cambian entre ejecuciones.
- Documentacion de gobernanza de IA: la tarjeta firmada, el DOI de metodologia y la raiz de transparencia Merkle sirven como anexo citable en informes internos o regulatorios sobre evaluacion de filtros de contenido.
- Investigacion en evaluacion de robustez: un grupo academico puede reproducir el proceso de verificacion por hash y estudiar la variabilidad de la deteccion entre ejes distintos, incluido el caso en que la exactitud cae a 0,0 en `swarm-candidates`.
- Integracion en pipelines de CI: mediante el lector Python `csoai-gspc[verify]` o el endpoint MCP, se puede automatizar la comprobacion de tarjetas como paso previo a un despliegue, con fallo explicito cuando la recuperacion devuelve error.
- Trazabilidad de versiones de evaluacion: al sellar cada resultado contra un banco congelado, se puede reconstruir que version del detector puntuo que cifra, util cuando un proveedor actualiza un filtro sin avisar.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card. Ninguno esta marcado como verificado (`verified: false`).

| Eje | Banco de datos | Metrica | Valor | Verificado |
|---|---|---|---|---|
| GSPC axis — jail-escape-detection | csoai/gspc-jail-goldbank | accuracy | 0,4789 | no |
| GSPC axis — swag-30 | csoai/gspc-jail-goldbank | accuracy | 1,0 | no |
| GSPC axis — swarm-candidates | csoai/gspc-swarm | accuracy | 0,0 | no |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar de capacidad general.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable. El repositorio no publica pesos, por lo que no hay un modelo que cargar en memoria.
- GPU recomendadas: no aplicable (ninguna). No existe un artefacto de inferencia asociado a este repositorio.
- Compatibilidad con GPU de consumo: no aplicable. No hay pesos que quepan ni dejen de caber en una RTX 4090 u otras tarjetas de consumo.
- Opciones de despliegue: no aplicable para el modelo. Para consumir la evidencia si aplica el verificador web de councilof.ai, el endpoint `GET https://councilof.ai/api/gspc`, el endpoint MCP `POST https://councilof.ai/mcp` y el paquete Python `csoai-gspc[verify]`.
- Latencia y throughput: no disponible. No se publican mediciones de inferencia; los tiempos relevantes son los de recuperacion y verificacion de tarjetas, no documentados en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. La comparacion natural seria contra otros detectores de jailbreak publicados en el Hub, pero la model card no incluye cifras de terceros y no hay resultados propios de esos sistemas medidos sobre los mismos ejes GSPC que permitan una tabla honesta. Comparar contra ellos exigiria ejecutar los bancos `csoai/gspc-jail-goldbank` y `csoai/gspc-swarm` con cada alternativa, algo que no consta en la documentacion disponible.

| Criterio | council-safe | Alternativas de deteccion de jailbreak |
|---|---|---|
| Parametros | no disponible | no disponible en la informacion proporcionada |
| Longitud de contexto | no disponible | no disponible |
| Exactitud en `jail-escape-detection` | 0,4789 (declarada por el autor, no verificada) | no disponible |
| Licencia | apache-2.0 | no aplicable a la comparacion |
| Disponibilidad de pesos | no se publican pesos | no aplicable |
| Evidencia firmada y reverificable | si (tarjetas Ed25519 con sha256) | no disponible |

## Limitaciones y advertencias

- No es un modelo desplegable. El repositorio no contiene pesos, ni configuracion de inferencia, ni tokenizador; no se puede ejecutar para clasificar texto.
- La exactitud medida en el eje principal es baja: 0,4789 sobre `jail-escape-detection`, es decir, apenas por encima de una decision aleatoria en un problema binario. No es una base solida para produccion sin mejoras.
- El 1,0 en `swag-30` y el 0,0 en `swarm-candidates` corresponden a conjuntos muy pequenos o muy especificos; un 1,0 en treinta casos no generaliza y no debe presentarse como rendimiento global.
- Ninguno de los tres resultados esta verificado por un tercero independiente (`verified: false`). La firma demuestra integridad y procedencia del registro, no correccion del metodo ni calidad del modelo.
- La propia documentacion advierte que una tarjeta no es una aprobacion, una calificacion ni una garantia de seguridad, y que no debe certificarse ni venderse como ranking.
- Sesgos conocidos: no disponibles. No se documenta composicion del banco de evaluacion, idioma del contenido mas alla del ingles, ni distribucion demografica o tematica de los casos.
- Riesgo de alucinacion: no evaluado en la informacion disponible. Al no publicarse pesos ni comportamiento generativo, no hay datos sobre generacion libre.
- Cobertura idiomatica limitada: el unico idioma declarado es el ingles. Un detector de jailbreak con esta cobertura no es fiable para trafico en castellano u otros idiomas sin una evaluacion especifica.
- Restricciones de licencia: el contenido se publica bajo apache-2.0, lo que permite uso comercial del material publicado, pero la licencia no cubre ningun modelo subyacente que no se distribuye aqui.
- Dependencia de servicios externos: la verificacion practica depende de councilof.ai y de la disponibilidad de sus endpoints; la documentacion contempla explicitamente el estado `UNCHECKABLE` cuando la recuperacion falla, lo que implica que la evidencia puede quedar inaccesible temporalmente.
- Ambiguedad de alcance: el pipeline declarado es `text-generation`, pero el contenido descrito es un registro de medicion de un detector. Esa discrepancia puede confundir a herramientas que indexan el Hub por `pipeline_tag`.
- Fechas de la model card (2026) y menciones a 22 ejes, 14 flotas de modelos y 1191 celdas de tarjetas del Hub: son afirmaciones del autor no contrastadas con fuentes independientes en la informacion disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/csoai/council-safe
- Organizacion CSOAI en Hugging Face: https://huggingface.co/csoai
- Banco de datos `csoai/gspc-jail-goldbank`: https://huggingface.co/datasets/csoai/gspc-jail-goldbank
- Banco de datos `csoai/gspc-swarm`: https://huggingface.co/datasets/csoai/gspc-swarm
- Tablero en vivo (fuente de autoridad declarada): https://councilof.ai/api/gspc
- Endpoint de tarjetas del Hub: https://councilof.ai/api/hub-cards
- Verificador de tarjetas, gratuito y sin cuenta: https://councilof.ai/gspc-verify
- Como verificar a mano: https://councilof.ai/signed/HOW-TO-VERIFY.md
- Raiz de transparencia (Merkle): https://councilof.ai/root.json
- Endpoint MCP (12 herramientas): https://councilof.ai/mcp
- Tarjeta firmada del eje `jail-escape-detection`: https://councilof.ai/signed/cards/cff1aaf070acb97c224177809856bc20310f4958eb44bdffab7d4b04836535f4.json
- Tarjeta firmada del eje `swag-30`: https://councilof.ai/signed/cards/5756982cf8e16adbe44a28a1f1cfb813feb35917908c5ae0de65d67499615bcc.json
- Tarjeta firmada del eje `swarm-candidates`: https://councilof.ai/signed/cards/4eb8ffdb407800ec5ff64bfdd8c5e3359ae06c2381190edb52bd543ab8c540c9.json
- DOI de metodologia: https://doi.org/10.5281/zenodo.21991104
- Instantanea citables del tablero: https://doi.org/10.5281/zenodo.22293341
- Paquete Python: `pip install "csoai-gspc[verify]"`
