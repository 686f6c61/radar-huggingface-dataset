# NorviTech/armiger-calibration-dht

## Resumen

`NorviTech/armiger-calibration-dht` no es un modelo de lenguaje ni una red neuronal entrenada, sino el quinto plugin de la suite modular Armiger de NorviTech. Se trata de un artefacto de 8,5 KB que contiene dos piezas: `calibration.json`, con los parametros de calibracion de las ocho cabezas de clasificacion del modelo Armiger / Armiger Ultra, y `calibration_and_dht.py`, un modulo Python que implementa un motor de actualizacion descentralizada sobre la DHT de BitTorrent.

El problema que resuelve es doble. Por un lado, corrige la sobreconfianza de los logits de un clasificador de catalogacion de contenido (categorias raras como `course`, `comic` o `software`, y fronteras de seguridad como `adult` o `junk`) mediante temperature scaling por cabeza, ajustes de logit para cola larga de Menon y umbrales conformales de Mondrian. Por otro, permite que las flotas de indexadores que ejecutan Armiger reciban actualizaciones de catalogo, tablas de priors y micro-adaptadores LoRA sin depender de un servidor central, usando punteros mutables BEP-44 firmados con Ed25519.

Es relevante ahora por su enfoque de seguridad: el motor exige firmas criptograficas con numero de secuencia monotono, quorum K-de-N y formatos de pesos seguros (JSON, ONNX, SafeTensors), excluyendo explicitamente `pickle`. Aun asi, el repositorio no publica especificaciones del modelo base al que calibra, no declara idiomas y no tiene descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es una red neuronal propia: artefacto de calibracion (JSON) mas modulo Python (`ArmigerCalibrator`, `ArmigerDHTUpdater`, `SignedDHTManifest`) que opera sobre las 8 cabezas de clasificacion de Armiger / Armiger Ultra |
| Parametros totales | No disponible (artefacto de 8,5 KB con escalares de calibracion y umbrales; no contiene pesos de red) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica; el componente no procesa texto secuencial) |
| Tipos de cuantizacion | No disponible (no aplica al calibrador; el motor DHT acepta bundles en JSON, ONNX y SafeTensors, sin `pickle`) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `calibration.json` (parametros escalares) y `calibration_and_dht.py` (codigo Python); bundles remotos admisibles: JSON, ONNX, SafeTensors |
| Pipeline declarado | `other` |
| Libreria | `generic` |
| Tamano del repositorio | 8,5 KB |
| Cabezas calibradas | 8 cabezas de clasificacion (incluye `category`, `adult`, `junk`, `owner_scope`, `lang`, `title_language`) |
| Umbrales conformales | `adult` = 0,5451; `junk` = 0,1010; `owner_scope` = 0,4770 |
| Criptografia | Ed25519 con clave raiz offline fijada y numero de secuencia monotono (`seq > current_seq`) |
| Protocolos DHT | BEP-44 (punteros mutables) y BEP-46 (distribucion por infohash) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-18 |

## Arquitectura y entrenamiento

El plugin no entrena nada: aplica calibracion post-hoc sobre los logits de un modelo ya entrenado. La primera componente es temperature scaling por cabeza (`T_h`) combinada con el ajuste de logit para cola larga de Menon (`τ_h · log π_h`), aplicado de forma independiente a cada una de las ocho cabezas de clasificacion. La segunda componente son umbrales conformales de Mondrian, que sustituyen un umbral global por umbrales por subgrupo, de modo que la garantia de cobertura se calcula dentro de cada clase o estrato en lugar de promediarse sobre la distribucion completa. Los valores publicados son 0,5451 para `adult`, 0,1010 para `junk` y 0,4770 para `owner_scope`.

La parte de red es un motor de actualizacion sobre la DHT mainline de BitTorrent. Los nodos resuelven `SHA1(pubkey || "armiger-ultra-v2")` para descubrir el infohash del bundle firmado mas reciente. Cada manifiesto debe llevar una firma Ed25519 valida de la clave raiz offline fijada y un `seq` estrictamente creciente, lo que bloquea ataques de suplantacion y de downgrade. Antes de activarse, el bundle requiere un quorum K-de-N configurable y solo puede contener JSON, ONNX o SafeTensors, nunca codigo Python arbitrario. No se especifican en la informacion disponible el volumen de datos, la composicion del dataset ni si hubo RLHF o DPO, porque el artefacto no entrena ningun modelo base.

## Capacidades

- Calibracion de probabilidades por cabeza: transforma logits crudos en probabilidades calibradas para cada una de las 8 cabezas de Armiger.
- Ajuste de cola larga: compensa el desbalance de clases raras (`course`, `comic`, `software`) mediante priors de etiqueta.
- Puertas de seguridad conformales: evalua de forma conjunta las probabilidades de `adult`, `junk` y `owner_scope` contra umbrales precalculados y devuelve el estado de cada puerta.
- Descubrimiento de bundles en DHT: busqueda de punteros mutables BEP-44 a partir de la clave publica y una etiqueta de version.
- Verificacion criptografica: comprobacion de firma Ed25519 y de monotonia de `seq` antes de aceptar un manifiesto.
- Quorum K-de-N: activacion condicionada a un numero configurable de atestaciones.
- Restriccion de formato: rechazo de `pickle` y admision exclusiva de JSON, ONNX y SafeTensors.
- Hot-reload opt-in: carga en caliente de nuevas entradas de catalogo `zero-cue`, tablas de `swarm-priors` y micro-adaptadores LoRA de rango 8.
- No soporta generacion de texto, razonamiento, codigo, vision, audio, tool calling ni agentes multi-paso: no es un modelo generativo.

## Casos de uso

- Moderacion de catalogos en indexadores autoalojados: las puertas conformales de `adult` y `junk` permiten filtrar contenido antes de indexarlo, con umbrales explicitos y auditables en lugar de un corte unico global.
- Correccion de sesgo hacia clases mayoritarias: en un catalogo con millones de entradas y pocos ejemplos de `course` o `comic`, el ajuste de Menon sube la probabilidad relativa de esas clases sin reentrenar el clasificador.
- Desambiguacion de fronteras de politica: la puerta `owner_scope` (umbral 0,4770) decide si un item cae dentro del ambito cubierto por la politica del operador, lo que sirve para enrutar casos ambiguos a revision manual.
- Actualizacion de flotas de indexadores sin servidor central: un operador con decenas de instancias de BitAgent o Bitmagnet publica un bundle firmado y las instancias lo descubren por DHT y lo activan tras verificar el quorum.
- Distribucion de micro-adaptadores LoRA: el motor transporta adaptadores de rango 8 en SafeTensors, lo que permite ajustar el comportamiento del clasificador por dominio sin reemplazar el modelo completo.
- Rotacion controlada de versiones: el contador `seq` monotono permite auditar el orden de despliegue y detectar intentos de revertir a un bundle antiguo comprometido.
- Integracion en pipelines de validacion: el modulo se puede invocar desde tests para comprobar que las probabilidades de un lote cumplen las puertas antes de publicar un indice.
- Analisis forense de incidentes: el registro de manifiestos firmados y secuencias permite reconstruir que version de catalogo estuvo activa en cada nodo y cuando.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible en el sentido habitual (MMLU, HumanEval, GSM8K). Las unicas metricas son las declaradas por el autor para las componentes de calibracion y seguridad, sin verificacion independiente:

| Metrica declarada | Valor | Ambito |
|---|---|---|
| Exactitud de la puerta `adult` | 98,71 % / 98,63 % | Puerta de seguridad conformal (dos medidas reportadas) |
| Exactitud balanceada `junk` / malware | 99,95 % | Puerta de seguridad conformal, umbral 0,1010 |
| Exactitud de ambito de politica (`owner_scope`) | 98,68 % | Puerta de seguridad conformal, umbral 0,4770 |
| Umbral `adult` | 0,5451 | Mondrian conformal |
| Umbral `junk` | 0,1010 | Mondrian conformal |
| Umbral `owner_scope` | 0,4770 | Mondrian conformal |

No se aportan datos de latencia, throughput ni curvas de calibracion (ECE, Brier) para el plugin.

## Requisitos de hardware

- VRAM para inferencia del calibrador: practicamente nula; la aplicacion de temperature scaling y umbrales es aritmetica escalar sobre los logits ya calculados.
- Memoria en disco: 8,5 KB para el repositorio completo; el coste real lo determina el modelo base Armiger / Armiger Ultra, cuyas especificaciones no estan disponibles en la informacion proporcionada.
- GPU: no requiere GPU para el calibrador; el modelo base al que acompana puede requerirla segun su tamano, dato no disponible.
- CPU: cualquier CPU x86-64 o ARM moderna puede ejecutar `calibration_and_dht.py`.
- Despliegue: importacion directa como modulo Python (`from calibration_and_dht import ArmigerCalibrator, ArmigerDHTUpdater, SignedDHTManifest`); no aplica servidor de inferencia tipo vLLM, TGI, llama.cpp u Ollama.
- Red: el motor DHT necesita conectividad UDP saliente hacia la DHT mainline de BitTorrent y acceso a los infohashes anunciados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible en el sentido de modelos de lenguaje: el artefacto no compite con LLM. La comparacion pertinente es con los otros plugins de la misma suite, que cubren funciones complementarias y se empaquetan junto a este en Armiger Ultra.

| Plugin | Tamano | Funcion | Metrica declarada | Licencia |
|---|---|---|---|---|
| `armiger-calibration-dht` (este) | 8,5 KB | Calibracion conformal y actualizacion DHT firmada | 99,95 % exactitud balanceada `junk` | Apache-2.0 |
| `armiger-swarm-survival` | 163 KB | SwarmSurvivalNet v2 y adaptador honeypot | 96,83 % AUROC de vivacidad de swarm; 100 % recall de trampa de seeders falsos | No disponible en la informacion proporcionada |
| `armiger-swarm-priors` | 29,4 KB | Priors empiricos de swarm y grupo de release | No disponible | No disponible en la informacion proporcionada |
| `armiger-zero-cue-catalog` | 26,8 MB | Catalogo offline de 926.785 claves y desambiguador estructural | 99,46 % Movie-vs-TV; 98,48 % en 11 clases | No disponible en la informacion proporcionada |
| `armiger-audio-guard` | 4,2 KB | Guardia de idioma de audio y doblaje de anime | 98,72 % Gold Standard; 99,88 % en casos limite | No disponible en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo y no admite tool calling ni flujos de agente. Cualquier expectativa en ese sentido es un error de interpretacion del `pipeline_tag: other`.
- Las metricas (98,71 %, 99,95 %, 98,68 %) son autodeclaradas por el autor y no se acompanan de conjunto de validacion, semillas ni script de reproduccion en la informacion disponible.
- Dependencia fuerte del modelo base: los parametros de calibracion solo tienen sentido con las cabezas exactas de Armiger / Armiger Ultra; aplicarlos a otro clasificador invalida las garantias conformales.
- Los umbrales conformales asumen que la distribucion de prueba se parece a la de calibracion; ante un cambio de dominio (nuevas fuentes, nuevos idiomas de catalogo) la cobertura declarada puede degradarse sin aviso.
- La seguridad del canal DHT recae en la custodia de la clave raiz Ed25519 offline; si esa clave se ve comprometida, el esquema de firma y secuencia monotona no protege frente a bundles maliciosos validos.
- El quorum K-de-N es configurable: una configuracion con K=1 reduce la proteccion practicamente a la firma unica.
- La disponibilidad depende de la DHT publica de BitTorrent, sujeta a bloqueos por ISP, censura de red y envenenamiento de tablas por parte de terceros.
- El proyecto no declara idiomas soportados y el repositorio no tiene descargas ni likes, por lo que no existe validacion por parte de la comunidad.
- La fecha de creacion indicada (2026-10-18) es posterior a la de la mayoria de artefactos del ecosistema; conviene verificar la procedencia y el resto de repositorios de la organizacion antes de integrarlo en produccion.
- La busqueda web realizada no devolvio ningun resultado relacionado con el modelo: los enlaces retornados eran contenido para adultos sin relacion alguna y se han descartado por completo.
- Licencia Apache-2.0: permite uso comercial y modificacion con obligacion de conservar el aviso de licencia y el archivo NOTICE si existe; no hay clausula de patentes adicional mas alla de la estandar de Apache-2.0.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NorviTech/armiger-calibration-dht
- Modelo base empaquetado: https://huggingface.co/NorviTech/armiger-ultra
- Version compatible CPU: https://huggingface.co/NorviTech/armiger
- Plugin de supervivencia de swarm: https://huggingface.co/NorviTech/armiger-swarm-survival
- Plugin de priors de swarm: https://huggingface.co/NorviTech/armiger-swarm-priors
- Plugin de catalogo zero-cue: https://huggingface.co/NorviTech/armiger-zero-cue-catalog
- Plugin de guardia de audio: https://huggingface.co/NorviTech/armiger-audio-guard
- Sitio del autor: https://norvitech.com
- Repositorio Helios: https://github.com/spencercnorton/helios
- Resultados de busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos no guardan relacion con el modelo y se han descartado.
