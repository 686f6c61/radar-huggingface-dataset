# Dyluhn/Qwen3.8-Flash-Next-Uncensored-R9V-IQ4_XS

## Resumen

Esta ficha describe `Dyluhn/Qwen3.8-Flash-Next-Uncensored-R9V-IQ4_XS`, un paquete de pesos GGUF cuantizados a IQ4_XS derivado de la version "abliterated" (sin censura) de Qwen3.8 Flash Next que publica el usuario orcarouter. No se trata de un modelo entrenado desde cero ni de un ajuste fino: es un empaquetado "listo para colocar" pensado para el perfil de inferencia dual-RDNA4 del runtime R9V, del mismo autor. Ademas del objetivo cuantizado, el paquete incluye el proyector de vision F16 del modelo original, una cabeza MTP (multi-token prediction) para decodificacion especulativa y un proyector CED que acelera el prefill de prompts largos.

El modelo subyacente es un transformer MoE multimodal de Qwen (arquitectura Qwen4, atencion hibrida GDN + QSA segun la documentacion publica), con 176.943.899.520 parametros contados directamente en los safetensors de este repositorio y una ventana de contexto de 262.144 tokens en la version original. La cuantizacion IQ4_XS sigue exactamente la receta `UD-IQ4_XS` de Unsloth (1.224 de 1.224 tensores), aunque los ficheros no los produjo Unsloth y se generaron a partir de un GGUF Q8_0 en lugar de BF16, sin matriz de importancia registrada.

Su relevancia es doble. Por un lado, permite ejecutar un MoE de gran tamano en dos GPU Radeon AI PRO R9700 de 32 GiB con colocacion de expertos en cache de RAM del host, algo poco habitual en el ecosistema ROCm. Por otro, el borrado del comportamiento de rechazo mediante abliteracion lo convierte en una herramienta especifica para investigacion de interpretabilidad, estudio de mecanismos de refusal y red teaming, no en un modelo de produccion generalista. En el momento de la consulta el repositorio no registraba descargas ni valoraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con atencion hibrida GDN + QSA (arquitectura Qwen4, segun fuentes publicas del modelo base) |
| Parametros totales | 176.943.899.520 (~176,9 mil millones), contados en safetensors |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens en el modelo base segun Unsloth; el perfil de referencia R9V configura 131.072 tokens con una peticion simultanea |
| Tipos de cuantizacion | IQ4_XS (receta UD-IQ4_XS, 1.224 tensores); origen Q8_0 del build abliterated; proyector de vision en F16; cabecera MTP con densos en BF16 y expertos enrutados en block-FP8 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en HuggingFace) |
| Formato de pesos | GGUF fragmentado (`target/`) y safetensors (`vision/`, `ced/`); estructura interna con `target/`, `vision/`, `mtp/`, `ced/`, `metadata/`, `manifests/` y `sources.lock.json` |
| Tamano del repositorio | 99,2 GB |
| Modelo base | orcarouter/Qwen3.8-Flash-Next-Uncensored (relacion: quantized) |
| Pipeline | no disponible |

Nota: la documentacion de Unsloth describe Qwen3.8-Flash-Next como un MoE de 125.000 millones de parametros, mientras que el recuento de safetensors de este repositorio arroja 176,9 mil millones. La informacion disponible no permite explicar la discrepancia.

## Arquitectura y entrenamiento

No hay informacion sobre el entrenamiento del modelo base en los datos proporcionados: no se especifican numero de tokens, composicion del dataset ni si hubo RLHF, DPO u otra fase de alineamiento. Lo que si se documenta es la modificacion del autor del build base: orcarouter aplico abliteration proyectando una unica "direccion de rechazo" fuera de los pesos, eliminando de forma sustancial el alineamiento de seguridad. Segun la model card, la abliteration no toco la torre de vision ni los routers del MoE.

El paquete de Dyluhn es un artefacto de inferencia, no un entrenamiento. El objetivo IQ4_XS se cuantizo desde el GGUF Q8_0 del build abliterated, con los tipos por tensor siguiendo la receta UD-IQ4_XS de Unsloth. La cabeza MTP procede del checkpoint oficial: tensores densos del BF16 oficial y expertos enrutados del block-FP8 oficial, sin entrenamiento adicional por parte de R9V. El proyector CED es un ajuste de R9V sobre esta cuantizacion concreta. La innovacion tecnica del empaquetado esta en la decodificacion especulativa (MTP con profundidad 4 en la configuracion de referencia) y en CED, que aproxima las capas tardias para la parte inicial de un prompt largo: las capas 0 a 15 se ejecutan de forma exacta sobre todos los tokens, mientras que el proyector predice lo que verian las capas 16 a 47 y estas solo rellenan sus caches con esa prediccion. Los ultimos 2.048 tokens del prompt y todos los pasos de decodificacion se ejecutan con el modelo completo.

## Capacidades

- Generacion de texto conversacional multi-turno con ventana configurada de 131.072 tokens (262.144 en el modelo base).
- Capacidades multimodales: entrada de imagen en F16, una imagen por peticion, mediante el proyector de vision del build original.
- Razonamiento y generacion de codigo, con rendimiento medido superior en codigo que en prosa (3,96 tokens por paso de decodificacion frente a 2,54 en prosa corta).
- Decodificacion especulativa mediante cabeza MTP de Qwen, con profundidad 4 en la configuracion de referencia; el modelo objetivo verifica cada token propuesto.
- Salida estructurada: la categoria JSON de BetterBench 0.6.0 alcanza 94 tok/s de mediana, la mas alta de las medidas.
- Cumplimiento de peticiones que el modelo original rechazaria, por efecto de la abliteration (capacidad declarada explicitamente por el autor del build base).
- No hay informacion disponible sobre soporte de tool calling, function calling, uso como agente, capacidades de audio o modos de pensamiento explicito. El tag `conversational` esta presente en HuggingFace; `endpoints_compatible` tambien, pero la informacion no detalla el alcance de esa compatibilidad.

## Casos de uso

- Estudio de mecanismos de rechazo: el modelo permite comparar activaciones y salidas frente al Qwen3.8 Flash Next original para aislar como se representa la direccion de rechazo y que comportamientos arrastra su eliminacion.
- Red teaming y evaluacion de robustez: sirve como sujeto de prueba para medir la eficacia de filtros y capas de moderacion externas, dado que el propio modelo no incorpora alineamiento de seguridad.
- Inferencia local en hardware AMD RDNA4: con dos Radeon AI PRO R9700 de 32 GiB, TP2 y 128 GiB de DDR5, el paquete ofrece un perfil reproducible donde los expertos fuera del conjunto caliente se sirven desde cache en RAM del host.
- Analisis de documentos largos con contenido visual: la combinacion de 131.072 tokens de contexto, entrada de imagen y prefill acelerado por CED (unos 3.020 tok/s a ~12K tokens) es adecuada para procesar informes extensos con graficos en una sola pasada.
- Asistente de codigo en pipelines internos: el rendimiento medido en codigo corto (3,96 tokens por paso, equivalente a unos 106 tok/s efectivos) y la ventana larga permiten revisar repositorios o ficheros completos sin trocear.
- Generacion de datos sinteticos para destilacion: al no tener restricciones de contenido, puede producir corpus que despues se filtran y se usan para ajustar modelos pequenos con criterios propios.
- Extraccion de datos estructurados: la categoria JSON es la mas rapida en las pruebas publicadas, lo que lo hace util para convertir texto libre o capturas de formularios en objetos validables.
- Analisis de contenido sensible con fines de moderacion: procesado por lotes para identificar y clasificar material que otros modelos se negarian a tratar, siempre en un entorno controlado y con supervision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card si incluye mediciones de rendimiento de inferencia en la configuracion de referencia (dos Radeon AI PRO R9700 32 GiB, TP2, 128 GiB DDR5, MTP profundidad 4, runtime consolidado 1.3.0 de R9V v0.4.0):

| Escenario (decodificacion greedy, ejecuciones en caliente) | ms por paso | Tokens por paso (MTP 4) |
|---|---:|---:|
| Prosa corta | 34,6 | 2,54 |
| Codigo corto | 37,4 | 3,96 |
| Contexto ~8K | 38,8 | 3,45 |

| Metrica de prefill | Valor |
|---|---:|
| Prefill exacto, prompt ~4K tokens (sin CED) | ~1.780 tok/s |
| Prefill exacto, prompt ~12K tokens (sin CED) | ~1.870 tok/s |
| Prefill con CED, prompt ~12K tokens | ~3.020 tok/s |
| Prompts por debajo de 8.192 tokens | sin cambios con CED |

| BetterBench 0.6.0 (una sola secuencia, 20 ejecuciones por categoria, temperatura 0,7) | Valor |
|---|---:|
| Decodificacion mediana, categoria de razonamiento | 62 tok/s |
| Decodificacion mediana, categoria JSON | 94 tok/s |

Derivado de la tabla de la model card, el rendimiento efectivo de decodificacion seria de aproximadamente 73 tok/s en prosa corta, 106 tok/s en codigo corto y 89 tok/s a ~8K de contexto. Los propios autores advierten que esos prompts son listas de palabras sinteticas y que con texto real las cifras de builds anteriores de R9V resultaron entre un 15% y un 20% mas lentas.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 99,2 GB, de los cuales el objetivo IQ4_XS de 176,9 mil millones de parametros es la mayor parte. La configuracion de referencia funciona con 64 GB de VRAM repartidos en dos GPU de 32 GiB, apoyandose en cache de expertos en RAM del host (128 GiB de DDR5 recomendados).
- GPU recomendadas: dos Radeon AI PRO R9700 de 32 GiB en TP2 es la configuracion validada por el autor. No hay datos publicados de rendimiento en A100, H100 u otras GPU NVIDIA para este paquete concreto.
- GPU de consumo: no cabe en una unica GPU de consumo. El modelo base, en cuantizaciones mas agresivas, se ha descrito como ejecutable en equipos con 75 GB de RAM o memoria unificada sin VRAM dedicada, pero esa cifra corresponde a Qwen3.8-Flash-Next y no a este paquete IQ4_XS de 99,2 GB.
- Opciones de despliegue: R9V v0.4.0 o superior con el perfil `qwen38-mtp4-uncensored` es la via documentada, con descarga y verificacion SHA-256, extraccion de la tabla PLE y compilacion en el primer arranque (conviene un timeout amplio, de unos 2.400 segundos). En HuggingFace se enlazan instrucciones para usarlo con llama.cpp, aunque la model card no describe ese flujo y el paquete esta disenado para R9V.
- Detalle operativo: la tabla `per_layer_token_embd.weight` (PLE) de 26,82 GiB ya esta dentro del segundo fragmento del objetivo y se extrae en el setup; su SHA-256 esperado es `34fa36f83de4216fe2aa78b5602aea1ba8007f959710c94bc4fbaff3e75fb9f0`.
- Latencia y throughput: 34,6-38,8 ms por paso de decodificacion segun escenario, con 2,54-3,96 tokens por paso gracias a MTP, y 1.780-3.020 tok/s de prefill segun longitud y uso de CED.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dyluhn/Qwen3.8-Flash-Next-Uncensored-R9V-IQ4_XS (este) | 176,9 B (activos no disponibles) | 131.072 tokens en el perfil R9V; 262.144 en el base | IQ4_XS sobre Q8_0, GGUF, paquete para R9V | qwen-community-1.0 | Publico en HuggingFace, 0 descargas registradas |
| orcarouter/Qwen3.8-Flash-Next-Uncensored | No disponible | No disponible | BF16, GGUF, MLX, FP8 y NVFP4 en su coleccion | No disponible | Publico, mismo metodo de abliteration |
| Dyluhn/Qwen3.8-Flash-Next-R9V-IQ4_XS | Misma arquitectura base | Igual que este perfil | IQ4_XS, mismo layout de paquete | qwen-community-1.0 | Publico; es la variante con el target sin abliterar |
| Qwen3.8-Flash-Next (original de Qwen) | 125 B segun Unsloth (discrepancia con el recuento de 176,9 B de este repo) | 262.144 tokens | Pesos oficiales BF16 y block-FP8 | qwen-community-1.0 | Open weights, con alineamiento de seguridad intacto |

La diferencia funcional clave frente al original y frente a la variante R9V no abliterada no esta en parametros ni en contexto, sino en el comportamiento de rechazo eliminado y en la disponibilidad del proyector CED en este paquete concreto.

## Limitaciones y advertencias

- El alineamiento de seguridad ha sido eliminado de forma sustancial por abliteration. El modelo cumplira peticiones daninas, poco eticas o ilegales que el Qwen3.8 Flash Next original rechazaria. El propio autor del build base lo publica estrictamente para investigacion.
- Es obligatorio anadir capas propias de seguridad y moderacion antes de exponerlo a cualquier usuario. El responsable del uso y de todo lo que genere es quien lo despliega.
- Sesgos conocidos: no disponibles en la informacion proporcionada. Al proceder de un modelo abliterado, cabe esperar que los sesgos del base persistan o se amplifiquen en dominios sensibles, pero no hay evaluaciones publicadas que lo cuantifiquen.
- Riesgo de alucinacion: no disponible. No se han publicado evaluaciones de fidelidad factual para este paquete ni para su base abliterated.
- La cuantizacion se hizo desde Q8_0 y no desde BF16, y no tiene matriz de importancia registrada. El autor indica explicitamente que su calidad no se ha medido contra el `UD-IQ4_XS` propio de Unsloth.
- CED introduce una aproximacion: en prompts de 8.192 tokens o mas, las capas 16 a 47 rellenan sus caches a partir de una prediccion para la parte inicial del prompt. Solo los ultimos 2.048 tokens y todos los pasos de decodificacion son exactos.
- La cabecera MTP no esta abliterada: es la original de Qwen y solo propone tokens, que el objetivo verifica. No genera salida por si misma, pero conviene tenerlo en cuenta al auditar el comportamiento.
- El paquete depende del runtime R9V y de una extraccion previa de la tabla PLE; no es un GGUF de un solo fichero cargable directamente en cualquier herramienta sin adaptacion.
- Licencia `qwen-community-1.0`, con implicaciones para uso comercial que no se detallan en la informacion proporcionada. Hay que revisar el texto completo de la licencia antes de cualquier despliegue productivo.
- Idiomas soportados no disponibles: no se puede confirmar el comportamiento multilingue de este build concreto.
- Cifras de rendimiento obtenidas con listas de palabras sinteticas; con texto real los autores reportan entre un 15% y un 20% menos de velocidad en builds previos de R9V.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dyluhn/Qwen3.8-Flash-Next-Uncensored-R9V-IQ4_XS
- Modelo base (build abliterated de orcarouter): https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Paquete R9V de referencia sin abliterar: https://huggingface.co/Dyluhn/Qwen3.8-Flash-Next-R9V-IQ4_XS
- Repositorio del runtime R9V: https://github.com/Dyluhn/R9V
- Guia de instalacion de R9V: https://github.com/Dyluhn/R9V/blob/main/docs/installation.md#fetch-and-setup
- Proyector CED: https://huggingface.co/Dyluhn/Qwen3.8-Flash-Next-Uncensored-CED-Projector
- Blog de orcarouter sobre el runbook GGUF y MLX: https://www.orcarouter.ai/blog/qwen3-8-flash-next-uncensored
- Documentacion de Unsloth sobre Qwen3.8-Flash-Next: https://unsloth.ai/docs/models/qwen3.8-next
- Repositorio oficial de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next
- BetterBench: https://github.com/GGZ14/BetterBench
