# Seandaniel1/GLM-5.2-colibri-int4-g64-with-int8-mtp

## Resumen

Este repositorio contiene una conversión cuantizada del modelo base zai-org/GLM-5.2, un transformer de tipo mezcla de expertos (MoE) de 744 000 millones de parámetros, preparada por el usuario Seandaniel1 para el motor de inferencia por streaming colibri (JustVugg/colibri). La conversión aplica cuantización int4 agrupada con tamaño de grupo 64 (fmt=4) a los pesos de los expertos, int8 a la capa de embedding y a la lm_head, y f32 a las normas. Además, incluye una cabeza MTP (multi-token prediction) también en int8, empleada para decodificación especulativa.

El interés de este contenedor no está en el modelo base, sino en el formato y en la evidencia de validación que acompaña a la model card. El autor lo presenta como el contenedor de referencia de int4 agrupado para colibri: según sus mediciones, la cuantización por grupos supera a la cuantización por fila (per-row) en precisión —hellaswag acc_norm 87,0% frente a 83,5% con n=200— y corrige un fallo de bucle de razonamiento con EOS no emitido que sí aparecía con el contenedor por fila. El repositorio ocupa 429,3 GB, de los cuales 390,5 GB corresponden a 141 shards de expertos.

Es relevante ahora porque demuestra que un MoE de 744B puede ejecutarse en hardware con poca VRAM mediante streaming desde NVMe con una caché de expertos, y porque documenta de forma inusualmente explícita el coste y los riesgos de este tipo de despliegue: dependencia estricta de la versión del motor, avisos de seguridad del cargador y una comparativa medida contra un contenedor alternativo más pequeño (E8/IQ3, 289 GB) que gana en escenarios con tasa de acierto de expertos baja.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (etiquetado por el autor como glm_moe_dsa); cuantizacion de expertos int4 agrupada gs=64, int8 en embed/lm_head, f32 en normas, cabeza MTP int8 |
| Parametros totales | 744 000 millones (MoE, segun la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 grouped (group size 64) para expertos con escalas f32 por grupo; int8 para embed y lm_head; int8 para la cabeza MTP; f32 para normas. Padre en FP8 |
| Idiomas soportados | no disponible |
| Licencia | MIT (declarada para este contenedor; la licencia del modelo base zai-org/GLM-5.2 no se detalla en la informacion proporcionada) |
| Formato de pesos | safetensors (141 shards de expertos + 1 shard de MTP); formato fmt=4 especifico del motor colibri, no compatible con GGUF ni con cargadores genericos |

Datos adicionales del repositorio: tamano total 429,3 GB (390,5 GB en expertos y 9,3 GB en la cabeza MTP), pipeline text-generation, creado y actualizado el 2026-09-18, 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos de 744B parámetros. Este repositorio no entrena nada: es una conversion de pesos del padre oficial en FP8 (zai-org/GLM-5.2) a un contenedor optimizado para el motor colibri. La innovacion tecnica del contenedor es doble. Por un lado, las escalas de cuantizacion se calculan por grupos de 64 elementos en lugar de por fila, lo que evita que un valor atipico arruine la precision de toda una fila; el autor cifra el sobrecoste en disco en torno a un 12% y lo justifica con la mejora de calidad medida. Por otro, se conserva una cabeza MTP en int8 (9,3 GB) para decodificacion especulativa: segun la model card, una cabeza MTP en int4 da una aceptacion de borradores cercana al 0%, mientras que en int8 mide entre el 39% y el 59%.

El motor colibri esta disenado para streaming de expertos desde disco (NVMe) con una cache de expertos en memoria de GPU. La model card reporta dos problemas resueltos en el propio motor que condicionan el uso de este contenedor: el fallo de agotamiento de EOS (EOS starvation) y bucles de razonamiento, corregido en la version v1.2.0, y un kernel de atencion ragged que aplicaba escalas por fila a las escalas por grupo de este contenedor, corregido en v1.3.0 (issues #685 y #692). No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni etapas de RLHF/DPO del modelo base.

## Capacidades

- Generacion de texto autoregresiva, con especial enfasis en tareas de razonamiento extenso: la propia model card describe un fallo de "reasoning loop" en la variante por fila, lo que implica un modo de generacion con cadenas de razonamiento largas.
- Decodificacion especulativa mediante cabeza MTP en int8, con tasas de aceptacion de borradores medidas entre el 39% y el 59%.
- Detencion fiable de la generacion: en la matriz de captura de 5 celdas de muestreo (issue #455), este contenedor emitio EOS correctamente en las 5 configuraciones, incluida TEMP=0.9 con NUCLEUS=0.95, que resultaba catastrofica con la variante por fila.
- Inferencia con expertos no residentes: el motor puede servir el modelo con una tasa de acierto de cache de expertos del 93,5% en una tarjeta de 16 GB, leyendo el resto desde disco.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes o razonamiento multi-paso explicito: no disponible en la informacion proporcionada (el tag glm_moe_dsa y la mención a bucles de razonamiento son los unicos indicios, no confirmados).
- Vision, audio u otras modalidades: no disponible; el pipeline declarado es text-generation.

## Casos de uso

- Ejecucion de un MoE de 744B en hardware de gama de consumo: el motor colibri permite servir el modelo con los expertos en disco y una cache parcial en VRAM; la model card cita pruebas en una tarjeta de 16 GB con una tasa de residencia de expertos del 93,5%. Es adecuado cuando no se dispone de un nodo con cientos de GB de VRAM pero si de almacenamiento NVMe rapido.
- Servicio de generacion de texto en un nodo multi-GPU de gama alta: el escenario de referencia medido por el autor usa 6xRTX 5090, donde este contenedor es la opcion preferida si los expertos estan totalmente residentes y no hay lecturas de disco.
- Decodificacion especulativa en produccion: integrar la cabeza MTP int8 como borrador permite reducir el numero de pasos de decodificacion; encaja en pipelines de generacion de texto donde la latencia por token es critica, aunque el rendimiento final depende del ancho de banda de disco y de la tasa de acierto de la cache.
- Validacion y desarrollo del motor colibri: este repositorio se declara contenedor de referencia para la ruta fmt=4 y se valida token-exact contra el oraculo de transformers (32/32). Es util para reproducir regresiones del motor comparando con el contenedor por fila.
- Investigacion en cuantizacion de MoE: el A/B de escalas por grupo frente a escalas por fila (n=200, hellaswag) y las mediciones de aceptacion de la cabeza MTP sirven como punto de partida para estudiar el equilibrio entre tamano en disco, precision y velocidad en modelos con expertos dispersos.
- Reproduccion de fallos de detencion en modelos con razonamiento largo: la matriz de 5 celdas de muestreo del issue #455 permite comprobar experimentalmente por que un contenedor por fila agota el presupuesto de tokens sin emitir EOS y como el agrupado lo evita.
- Despliegues con presupuesto de disco ajustado: sirve como termino de comparacion frente al contenedor E8/IQ3 de 289 GB cuando la tasa de acierto de expertos es baja; en ese regimen el contenedor mas pequeno mide entre un 22% y un 33% mas rapido en una tarjeta de 16 GB.

## Benchmarks y rendimiento

| Metrica | Este contenedor (int4 g64) | Contenedor per-row int4 | Notas |
|---|---|---|---|
| hellaswag acc_norm | 87,0% | 83,5% | A/B independiente de calidad citado en colibri #326, n=200 |
| Aceptacion de borradores MTP | 39-59% (cabeza int8) | ~0% (cabeza int4) | Segun la model card |
| Validacion token-exact frente a transformers | 32/32 | no disponible | Ejecutada por el motor sobre este contenedor |
| Matriz de detencion (5 celdas de muestreo) | 5/5 con EOS limpio | 0/5 (bucles sin EOS) | Issue #455; motor, prompts y flags fijos, solo cambia el contenedor |
| Coste de decodificacion (expert-matmul) | 20,9 s | no disponible | La variante E8 mide 24,1 s en el mismo escenario |
| Rendimiento relativo con streaming (16 GB, hit rate <99%) | linea base | la variante E8 mide 22-33% mas rapido | Issue #452 |

No se han publicado en la informacion disponible cifras de MMLU, GSM8K, HumanEval ni ARC-Challenge para este contenedor, aunque la model card menciona arc_challenge y mmlu como parte de las comparaciones con el contenedor E8 sin aportar los valores. Tampoco hay datos de throughput en tokens por segundo.

## Requisitos de hardware

- Almacenamiento: 429,3 GB de pesos en disco, mas el espacio de trabajo del motor. Se recomienda NVMe, ya que el rendimiento depende directamente de la latencia de lectura cuando hay fallos de cache.
- VRAM con expertos residentes: harian falta del orden de 400 GB entre VRAM y memoria de host para tener los 390,5 GB de expertos mas la cabeza MTP de 9,3 GB sin lecturas de disco. No es viable en una sola GPU consumer.
- VRAM con streaming: la model card cita mediciones en una tarjeta de 16 GB con una tasa de residencia de expertos del 93,5% para este contenedor (y 97,4% para el E8). Por tanto, si cabe en GPUs consumer de 16 GB, como RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080 o RTX 5070 Ti, siempre acompanadas de almacenamiento rapido.
- GPUs de gama alta: el escenario de referencia medido por el autor es 6xRTX 5090, configuracion en la que el contenedor E8 sufrio una regresion de decodificacion (issue #452). Tambien son aplicables nodos con A100 o H100 cuando la intencion es mantener los expertos en memoria.
- Software de despliegue: unicamente el motor colibri. La version recomendada es v1.5.0 o superior; la v1.3.0 (commit 01abef3) es el minimo funcional y el suelo absoluto es el commit c98e5f8 (merge del PR #298, 2026-07-20). No hay soporte para vLLM, TGI, llama.cpp ni Ollama, porque el formato fmt=4 no es GGUF.
- Flags y advertencias de configuracion: en versiones anteriores a la v1.3.0 no debe activarse COLI_CUDA_ATTN=1 con este contenedor, y con CUDA_DENSE=1 las versiones antiguas aplican las escalas de grupo como si fueran por fila y producen salida incoherente.
- Latencia y throughput: no se publican tokens por segundo. Las unicas cifras disponibles son relativas: 22-33% mas rapido para el contenedor E8 en streaming con tarjeta de 16 GB, y un coste de expert-matmul de 20,9 s en este contenedor frente a 24,1 s en E8.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion y tamano | Rendimiento medido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este contenedor (Seandaniel1/GLM-5.2-colibri-int4-g64-with-int8-mtp) | 744B MoE | int4 grouped gs=64 + MTP int8, 429,3 GB | hellaswag 87,0%; detencion 5/5; expert-matmul 20,9 s | MIT | Publico en HuggingFace, requiere colibri v1.3.0+ (recomendado v1.5.0+); 0 descargas |
| mastouri/GLM-5.2-colibri-E8-IQ3-with-int8-mtp | 744B MoE (mismo padre FP8) | E8/IQ3, 3,06 bpw, 289 GB | Sin perdida medible en hellaswag, arc_challenge y mmlu segun el autor; 22-33% mas rapido con hit rate <99% en 16 GB; regresion en 6xRTX 5090 | no disponible | Publico; requiere colibri v1.4.0+ (las versiones anteriores fallan con fmt=6) |
| Contenedor per-row int4 (referenciado en los issues, sin nombre de repositorio) | 744B MoE | int4 por fila | hellaswag 83,5%; 0/5 en la matriz de detencion | no disponible | Referenciado en colibri #326 y #455 |
| zai-org/GLM-5.2 (modelo base) | 744B MoE | FP8 | no disponible | no disponible | Repositorio oficial del modelo base |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. La informacion proporcionada no incluye evaluaciones de sesgo ni de toxicidad.
- Riesgo de alucinacion: no cuantificado; la model card solo aporta metricas de hellaswag y de comportamiento de detencion, no de veracidad factual.
- Limitaciones de idioma y contexto: la longitud de contexto y los idiomas soportados no se detallan en la informacion disponible.
- Dependencia estricta del motor: el formato fmt=4 solo lo interpreta colibri. Usar una version anterior produce desde fallos silenciosos de carga hasta salida incoherente (escalas de grupo aplicadas por fila) o incluso aplicacion de escalas erroneas en el kernel de atencion.
- Superficie de seguridad: la model card remite a ocho avisos de seguridad publicados con la v1.5.0 de colibri, dos de ellos en el propio cargador de modelos (GHSA-wc4x-3786-cxh7 y GHSA-4gw4-j89j-4c8r), que permiten escrituras fuera de limites en el heap al cargar un tokenizer.json manipulado o una cabecera de safetensors no validada, antes de que se ejecute la inferencia. El propio autor senala que descargar un contenedor preconvertido de un repositorio de terceros es exactamente ese limite de confianza.
- Trazabilidad: se trata de una conversion de terceros desde el FP8 oficial, no de un artefacto publicado por zai-org. No hay validacion independiente mas alla de las citas a issues del motor.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de verificacion por parte de la comunidad.
- Coste de infraestructura: 429,3 GB de disco y necesidad de NVMe rapido; en regimen sin fallos de cache es mas lento en decodificacion que el contenedor E8 segun las mediciones citadas.
- Licencia: el contenedor declara MIT, pero conviene verificar por separado la licencia del modelo base zai-org/GLM-5.2 antes de un uso comercial, ya que la model card no la reproduce.
- Uso en produccion: el autor advierte que las versiones anteriores a la v1.3.0 presentan corrupcion de la cache de expertos (desalojo de slots en mitad del calculo), lo que desaconseja cualquier despliegue con builds antiguas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Seandaniel1/GLM-5.2-colibri-int4-g64-with-int8-mtp
- Modelo base: https://huggingface.co/zai-org/GLM-5.2
- Contenedor alternativo E8/IQ3: https://huggingface.co/mastouri/GLM-5.2-colibri-E8-IQ3-with-int8-mtp
- Motor colibri: https://github.com/JustVugg/colibri
- Comparativa de rendimiento entre contenedores (issue #452): https://github.com/JustVugg/colibri/issues/452#issuecomment-5155461138
- Issues de referencia citados: colibri #225, #298, #307, #326, #455, #685, #692 (repositorio JustVugg/colibri)
- Avisos de seguridad del motor: https://github.com/JustVugg/colibri/security/advisories
- GHSA-wc4x-3786-cxh7: https://github.com/JustVugg/colibri/security/advisories/GHSA-wc4x-3786-cxh7
- GHSA-4gw4-j89j-4c8r: https://github.com/JustVugg/colibri/security/advisories/GHSA-4gw4-j89j-4c8r
- La busqueda web realizada no devolvio resultados relevantes para este modelo; los unicos enlaces utiles proceden de la model card del repositorio.
