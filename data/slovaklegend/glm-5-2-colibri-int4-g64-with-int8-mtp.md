# SlovakLegend/GLM-5.2-colibri-int4-g64-with-int8-mtp

## Resumen

Este repositorio no es un modelo nuevo, sino un contenedor de pesos cuantizados de `zai-org/GLM-5.2`, un modelo MoE de 744B parámetros, preparado por el usuario SlovakLegend para el motor de inferencia de streaming [colibri](https://github.com/JustVugg/colibri). El contenedor emplea el formato `fmt=4`: pesos de expertos en int4 agrupado con tamaño de grupo 64 y escalas f32 por grupo, embeddings y `lm_head` en int8, normas en f32, y una cabeza MTP (multi-token prediction) en int8 para decodificación especulativa. Ocupa 429,3 GB en total, repartidos en 141 shards de safetensors (390,5 GB) más un shard MTP de 9,3 GB.

Su relevancia práctica es doble. Por un lado, permite ejecutar un MoE de 744B en equipos con poca VRAM mediante streaming desde NVMe, en lugar de exigir residencia completa de los pesos en memoria. Por otro, el autor lo presenta como el contenedor de referencia de int4 agrupado para colibri: el motor lo valida token-exacto contra el oráculo de transformers (32/32) y un A/B interno de calidad sitúa el int4 agrupado por delante del int4 por fila (hellaswag acc_norm 87,0 % frente a 83,5 %, n=200).

Un tercer motivo de interés es la fiabilidad de parada: en una matriz de 5 celdas de muestreo con el mismo motor y los mismos prompts, el int4 por fila producía bucles de razonamiento que nunca emitían EOS, mientras que este contenedor terminó limpiamente en las 5 celdas, incluida la configuración de temperatura 0,9 y núcleo 0,95. El repositorio declara licencia MIT, no tiene descargas ni valoraciones y exige colibri v1.5.0 o superior por motivos de seguridad del cargador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (etiqueta `glm_moe_dsa`); sin detalle adicional en la informacion disponible |
| Parametros totales | 744B (segun la model card del contenedor, referidos al modelo base GLM-5.2) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos int4 agrupado gs=64 con escalas f32 por grupo; embeddings y `lm_head` int8; normas f32; cabeza MTP int8. Padre en FP8 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (141 shards `out-00000..00140` + 1 shard MTP) |
| Tamano del repositorio | 429,3 GB (390,5 GB de expertos + 9,3 GB de MTP) |
| Modelo base | `zai-org/GLM-5.2` |
| Motor de inferencia | colibri (formato `fmt=4`), version 1.5.0 o superior |
| Pipeline | text-generation |
| Fecha de publicacion | 2026-09-12 |

## Arquitectura y entrenamiento

La informacion disponible no describe el entrenamiento del modelo original: no se detallan el numero de tokens, la composicion del dataset, ni si hubo RLHF, DPO u otro ajuste por preferencias. Lo que si se documenta es la arquitectura de despliegue del contenedor. Se trata de una mezcla de expertos (MoE) de 744B parametros, con pesos de expertos cuantizados a int4 en grupos de 64 elementos y escalas f32 por grupo. La eleccion de escalas agrupadas frente a escalas por fila responde a un problema medido: con escalas por fila, un unico valor atipico degrada la precision de toda la fila, lo que se asocia a los informes de atractores de repeticion (colibri #225 y #307). El coste de las escalas agrupadas es de aproximadamente un 12 % mas de disco.

El contenedor incorpora una cabeza MTP en int8 para decodificacion especulativa. Segun el autor, las cabezas MTP en int4 dan una aceptacion de borradores cercana al 0 %, mientras que la version int8 mide entre el 39 % y el 59 %. Se incluyen ademas `config.json`, `tokenizer.json`, `tokenizer_config.json` y `generation_config.json`. La validacion tecnica reportada incluye una comprobacion token-exacta contra el oraculo de transformers (32/32), la fusion del camino CUDA `fmt=4` en el upstream del motor (colibri #298) y un A/B de calidad con hellaswag. No se detalla ningun mecanismo de atencion especifico mas alla de la etiqueta `glm_moe_dsa`; la informacion menciona una correccion de kernel de atencion "ragged" en colibri v1.3.0, pero no describe la arquitectura interna del modelo base.

## Capacidades

Las capacidades funcionales son las del modelo base `zai-org/GLM-5.2`; esta ficha solo documenta el contenedor cuantizado, por lo que no se dispone de una lista verificada de capacidades del modelo subyacente. Lo que si se puede afirmar a partir de la informacion proporcionada:

- Generacion de texto: el repositorio declara `pipeline_tag: text-generation`.
- Decodificacion especulativa: incluye una cabeza MTP en int8 con una tasa de aceptacion de borradores del 39-59 %, segun el autor.
- Razonamiento de cadena larga: el contenedor se valido especificamente en escenarios de razonamiento que tienden a no emitir EOS; con este contenedor la parada fue limpia en 5 de 5 celdas de muestreo.
- Estabilidad de muestreo: el autor indica que, con este contenedor, los parametros de muestreo dejan de ser criticos para evitar bucles de razonamiento.
- Capacidades multilingues: no disponible.
- Soporte de tool calling, function calling y agentes: no disponible.
- Vision, audio u otras modalidades: no disponible.
- Modo de pensamiento explicito (thinking mode): no disponible como capacidad documentada, aunque la model card menciona bucles de razonamiento y un bug de "thinking-loop" corregido en el motor, lo que sugiere que el modelo base produce cadenas de razonamiento.

## Casos de uso

- Despliegue autoalojado de un MoE de 744B con GPU limitada: el contenedor esta disenado para streaming desde NVMe con el motor colibri, de modo que los expertos no residentes se leen de disco bajo demanda. Es la via practica para servir este modelo en hosts cuya VRAM queda muy por debajo de los 429 GB de pesos.
- Sustitucion de un contenedor int4 por fila en un servicio ya en produccion: segun la matriz de captura de 5 celdas descrita (colibri #455), cambiar unicamente el contenedor elimina los bucles de razonamiento sin EOS y reduce la sensibilidad a los parametros de muestreo, sin cambiar motor ni prompts.
- Servicio de generacion con decodificacion especulativa: la cabeza MTP en int8, con 39-59 % de aceptacion, permite acelerar la decodificacion en el motor colibri, siempre que se compare contra la alternativa de no usarla en el mismo hardware.
- Infraestructura multigpu con residencia mayoritaria de expertos: en configuraciones donde los expertos caben en memoria (el autor cita 6xRTX 5090), este contenedor obtiene mejor tiempo de decodificacion que la variante E8/IQ3 (expert-matmul 20,9 s frente a 24,1 s).
- Evaluacion comparativa de esquemas de cuantizacion: sirve como referencia grouped-int4 para medir el impacto de las escalas por grupo frente a por fila en tareas de sentido comun, y como oraculo de comparacion para variantes mas agresivas.
- Despliegue on-premise con requisitos de confidencialidad: al ejecutarse con un motor local y pesos descargados, no requiere llamadas a APIs externas; la licencia declarada es MIT.
- Investigacion sobre motores de streaming de MoE: el contenedor esta pensado para reproducir medidas de tasa de acierto de expertos en cache, latencia de lectura de disco y rendimiento de decodificacion en funcion del hardware.

## Benchmarks y rendimiento

Los datos disponibles no provienen de suites estandar publicadas, sino de comparaciones internas del proyecto colibri. Se presentan tal cual, con su tamano de muestra.

| Prueba | Este contenedor (int4 g64) | int4 por fila | Tamano de muestra | Fuente |
|---|---|---|---|---|
| hellaswag acc_norm | 87,0 % | 83,5 % | n=200 | colibri #326 |
| Parada limpia (matriz de muestreo) | 5/5 celdas | fallos con bucles sin EOS | 5 celdas | colibri #455 |
| Validacion token-exacta vs transformers | 32/32 | no disponible | 32 | model card |
| Aceptacion de borradores MTP (int8) | 39-59 % | ~0 % con MTP int4 | no disponible | model card |
| expert-matmul (residencia completa) | 20,9 s | no disponible | no disponible | colibri #452 |
| Rendimiento en streaming (tarjeta de 16 GB) | referencia | no disponible | no disponible | colibri #452 |

Datos de rendimiento de la variante hermana E8/IQ3, aportados por el autor: 22-33 % mas rapida que este contenedor en una tarjeta de 16 GB con streaming, al elevar la residencia de expertos del 93,5 % al 97,4 %; sin perdida de calidad medible en hellaswag, arc_challenge y mmlu (sin cifras publicadas). En 6xRTX 5090 con expertos residentes se mide como una regresion de decodificacion.

No se han publicado resultados de MMLU, GSM8K, HumanEval ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM para residencia completa: no disponible como cifra oficial; el peso de los shards es de 390,5 GB mas 9,3 GB de MTP, por lo que la residencia completa exige agregar del orden de 400 GB de VRAM, inasumible en GPU de consumo.
- Residencia parcial con streaming: el contenedor esta disenado para leer expertos desde NVMe. Se cita su funcionamiento en una tarjeta de 16 GB con una tasa de residencia de expertos del 93,5 %, y en una configuracion de 6xRTX 5090.
- Almacenamiento: se necesita espacio para 429,3 GB de pesos y un NVMe con ancho de banda suficiente, ya que la latencia de disco domina cuando la tasa de acierto de expertos baja.
- GPU recomendadas: no disponible. Los unicos modelos citados en la informacion son una GPU de 16 GB sin especificar y 6xRTX 5090.
- Cabe en GPU de consumo: si, con streaming desde NVMe y residencia parcial; no para residencia completa de todos los expertos.
- Opciones de despliegue: exclusivamente el motor colibri, version 1.5.0 o superior (suelo funcional v1.3.0, commit `01abef3`; suelo duro commit `c98e5f8`). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI; se considera no disponible.
- Latencia y throughput: parcialmente documentados. En residencia completa, `expert-matmul` de 20,9 s; en streaming con tarjeta de 16 GB, entre un 22 % y un 33 % mas lento que la variante E8/IQ3. No hay cifras de tokens por segundo.
- Nota de compatibilidad: en builds anteriores a v1.3.0 no debe activarse `COLI_CUDA_ATTN=1` con este contenedor, ya que el kernel aplicaba escalas por fila a escalas de grupo y producia texto fluido que colapsaba.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano en disco | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este contenedor (`SlovakLegend/GLM-5.2-colibri-int4-g64-with-int8-mtp`) | 744B MoE | int4 g64 + int8 MTP | 429,3 GB | no disponible | MIT | colibri 1.5.0+ |
| `mastouri/GLM-5.2-colibri-E8-IQ3-with-int8-mtp` | 744B MoE | 3,06 bpw E8/IQ3 + int8 MTP | 289 GB | no disponible | no disponible | colibri 1.4.0+ |
| Contenedor int4 por fila (mismo modelo base) | 744B MoE | int4 por fila | aproximadamente un 12 % menos que este | no disponible | no disponible | colibri |
| `zai-org/GLM-5.2` (padre) | 744B MoE | FP8 | no disponible | no disponible | no disponible | transformers |

Criterio de eleccion segun el autor: con streaming desde NVMe y tasa de acierto de expertos por debajo del 99 %, conviene la variante E8 (mas rapida por mayor residencia); con expertos totalmente residentes y sin lecturas de disco, conviene este contenedor; si se necesita el contenedor de referencia o una version de colibri anterior a v1.4.0, tambien este.

## Limitaciones y advertencias

- Superficie de ataque en la cadena de suministro: el propio autor advierte que descargar un contenedor preconvertido de un repositorio de terceros en Hugging Face es exactamente el limite de confianza senalado por dos avisos de seguridad del cargador de colibri (GHSA-wc4x-3786-cxh7 y GHSA-4gw4-j89j-4c8r), que provocan escrituras fuera de limites en el monton al cargar un `tokenizer.json` manipulado o una cabecera de safetensors no validada, antes de ejecutar inferencia. Es obligatorio usar colibri v1.5.0 o superior.
- Dependencia estricta del motor: el formato `fmt=4` solo lo interpreta colibri. Builds anteriores al commit `c98e5f8` no cargan el formato, caen silenciosamente a CPU o, con `CUDA_DENSE=1`, aplican las escalas agrupadas como si fueran por fila y generan salida invalida.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de la comunidad mas alla de las pruebas citadas por el autor.
- Idiomas y contexto: no disponibles. No se puede planificar un despliegue multilingue ni de contexto largo sin verificar estos datos en el modelo base.
- Riesgo de alucinacion: no se aportan datos especificos. Como modelo de generacion de texto, el riesgo existe, y la cuantizacion int4 agresiva puede degradar la fidelidad en tareas sensibles.
- Licencia: el repositorio declara MIT, pero no se detalla la licencia del modelo base `zai-org/GLM-5.2` ni si impone condiciones adicionales para uso comercial. Conviene verificar los terminos del padre antes de un despliegue comercial.
- Volumen de datos: 429,3 GB de descarga y un requisito de almacenamiento en NVMe rapido que condiciona el coste de la infraestructura.
- Sensibilidad de la calidad al contenedor: los informes citados muestran que un cambio de esquema de escalas (por fila frente a agrupado) altera de forma medible la calidad y la fiabilidad de parada, por lo que no conviene mezclar contenedores ni reutilizar configuraciones de muestreo entre ellos sin revalidar.
- Rendimiento dependiente del hardware: cuando los expertos caben en memoria, este contenedor se mide como una regresion frente a la variante E8/IQ3, de modo que la eleccion no es universal.
- Fechas: el repositorio esta fechado el 2026-09-12 y la model card referencia estado de validacion de 2026-08-10; las versiones de motor y commits citados deben confirmarse contra el repositorio de colibri.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SlovakLegend/GLM-5.2-colibri-int4-g64-with-int8-mtp
- Modelo base: https://huggingface.co/zai-org/GLM-5.2
- Variante hermana E8/IQ3: https://huggingface.co/mastouri/GLM-5.2-colibri-E8-IQ3-with-int8-mtp
- Motor colibri: https://github.com/JustVugg/colibri
- Avisos de seguridad de colibri: https://github.com/JustVugg/colibri/security/advisories
- GHSA-wc4x-3786-cxh7: https://github.com/JustVugg/colibri/security/advisories/GHSA-wc4x-3786-cxh7
- GHSA-4gw4-j89j-4c8r: https://github.com/JustVugg/colibri/security/advisories/GHSA-4gw4-j89j-4c8r
- Issue #298 (fusion del camino CUDA `fmt=4`): https://github.com/JustVugg/colibri/issues/298
- Issue #326 (A/B de calidad grouped frente a per-row): https://github.com/JustVugg/colibri/issues/326
- Issue #452 (comparativa con E8/IQ3 y medidas de streamin): https://github.com/JustVugg/colibri/issues/452
- Issue #455 (matriz de sustitucion de contenedor): https://github.com/JustVugg/colibri/issues/455
- Issues #685 y #692 (kernel de atencion ragged): https://github.com/JustVugg/colibri/issues/685
- Issues #225 y #307 (atractores de repeticion): https://github.com/JustVugg/colibri/issues/225
- La busqueda web realizada no devolvio enlaces relacionados con el modelo: los resultados obtenidos corresponden a paginas de soporte de Microsoft y no aportan informacion util.
