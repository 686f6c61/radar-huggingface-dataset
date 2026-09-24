# mxcake3893/Qwen3.8-27B-Alis-Splash

## Resumen

Qwen3.8-27B-Alis-Splash es un paquete de pesos en formato Splash (splash-packed-q4, schema 3) construido a partir del modelo afinado Qwen3.8-27B-Alis, cuya version de referencia en MLX 4-bit publica el usuario avlp12. Lo firma el usuario mxcake3893 y su funcion no es reentrenar nada, sino reempaquetar los pesos cuantizados a 4 bits del release MLX en el layout binario nativo que consume el runtime Splash sobre Metal, preservando exactamente los valores cuantizados originales.

El interes tecnico esta en esa conversion, que el autor describe como sin perdida: los valores de la cuantizacion 4-bit de MLX se conservan byte a byte y el pipeline se verifico reproduciendo el paquete oficial incoai/Qwen3.8-27B-Splash con coincidencia SHA256 en las 66 secciones. El modelo subyacente es un Qwen3.8-27B (aproximadamente 27 000 millones de parametros) con torre de vision incluida en el paquete y un modelo borrador (draft) para decodificacion especulativa, lo que apunta a un uso multimodal acelerado en hardware Apple Silicon.

La relevancia practica del artefacto es doble: por un lado ofrece la compilacion 4-bit de mayor fidelidad declarada de esta familia (KL de 0,0654 nats/token frente a bf16 y 91,3 % de coincidencia top-1), y por otro documenta con honestidad un coste de calidad no despreciable, especialmente en codigo (+7,7 % de perplejidad). Es, por tanto, un candidato a considerar para despliegue local en Mac con GPU integrada, siempre que el perfil de uso tolere esa degradacion medible. El repositorio tiene 17,4 GB, licencia Apache 2.0 y, en el momento de la consulta, cero descargas y cero valoraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; derivada de Qwen3.8-27B. El paquete incluye parametros de decaimiento GDN y una torre de vision |
| Parametros totales | Aproximadamente 27 000 millones (segun la denominacion del modelo) |
| Longitud de contexto | No disponible (el CLI acepta un argumento `max_context` configurable) |
| Tipos de cuantizacion | 4 bits, formato splash-packed-q4, schema 3, grupo 64, transformada afin StorageN=256; escalas y sesgos en bf16 |
| Idiomas soportados | No disponible como lista oficial; las evaluaciones publicadas cubren ingles, coreano y codigo |
| Licencia | Apache 2.0 |
| Formato de pesos | splash-packed-q4 (schema 3) con `manifest.json`, `target/` con 66 secciones binarias, `draft/`, `tokenizer/` y `vision/`; procede de safetensors MLX 4-bit |
| Tamano del repositorio | 17,4 GB |
| Libreria | mlx |
| Fecha de creacion | 24 de septiembre de 2026 |

## Arquitectura y entrenamiento

Este repositorio no entrena ni ajusta el modelo: es una conversion de formato. Los pesos de destino provienen del release avlp12/Qwen3.8-27B-Alis-MLX-4bit (snapshot `f9a9e88`), que a su vez es una cuantizacion AWQ pre-graduada de 4 bits sobre el modelo afinado Qwen3.8-27B-Alis. La estructura interna del paquete revela componentes relevantes: 66 secciones binarias con los pesos Q4 empaquetados, mas escalas y sesgos en bf16, embeddings, logits de la cabeza de salida y parametros de decaimiento GDN; el subdirectorio `draft/` contiene un modelo borrador para decodificacion especulativa, `vision/` aloja los pesos de la torre de vision y `tokenizer/` los ficheros del tokenizador, estos tres ultimos copiados del paquete oficial incoai/Qwen3.8-27B-Splash.

La innovacion tecnica declarada es la fidelidad de la conversion: el pipeline se valido reproduciendo el paquete oficial byte a byte (coincidencia SHA256 en 66 de 66 secciones) a partir del modelo base mlx-community/Qwen3.8-27B-4bit antes de aplicar la conversion al fine-tune. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO u otras tecnicas de alineamiento, ni en el modelo base ni en el fine-tune Alis.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Qwen3.8-27B.
- Generacion de codigo, con la advertencia de que es el dominio donde la cuantizacion 4-bit introduce mayor degradacion relativa (+7,7 % de perplejidad frente a bf16 en CPython).
- Procesamiento multimodal: el paquete incluye pesos de torre de vision (`vision/`), lo que habilita entrada de imagenes, aunque la model card no describe tareas concretas soportadas.
- Decodificacion especulativa: incorpora un modelo borrador en `draft/`, orientado a acelerar la generacion en el runtime Splash.
- Capacidad multilingue parcialmente evidenciada: las mediciones incluyen una rebanada en coreano, ademas de ingles.
- Compatibilidad con el runtime nativo Metal de Splash y con la integracion de servidor de llama.cpp mediante el worker `splash`.
- No se documenta en la informacion disponible soporte de tool calling, function calling, modo de razonamiento explicito (thinking mode), audio ni capacidades de agente multi-paso.

## Casos de uso

- Inferencia local en equipos Apple Silicon: el formato esta disenado para el runtime Metal de Splash y un modelo de 27 000 millones a 4 bits ocupa 17,4 GB, de modo que encaja en Macs con memoria unificada alta sin depender de servicios en la nube.
- Asistencia de codigo en estacion de trabajo: con un modelo de 27B se pueden cubrir autocompletado, refactorizacion y explicacion de fragmentos, asumiendo la perdida de calidad medida en el dominio de codigo y validando el resultado antes de llevarlo a produccion.
- Atencion al cliente bilingue ingles-coreano: las mediciones de perplejidad cubren ambas lenguas y el autor recomienda evaluar con prompts propios en cargas coreanas antes de desplegar, dado que la degradacion alli duplica la del ingles.
- Analisis de documentos con componente visual: la torre de vision permite abordar clasificacion de imagenes y lectura de documentos escaneados dentro del mismo modelo, evitando orquestar un modelo de vision separado.
- Generacion aumentada por recuperacion (RAG): el CLI admite configurar contexto y memoria maximos, lo que permite ajustar la ventana al tamano del corpus recuperado segun la memoria disponible en la maquina.
- Despliegue mixto con llama.cpp: al aceptar el paquete como raiz de modelo a traves del worker `splash`, se puede integrar en infraestructuras que ya sirven modelos GGUF con llama.cpp sin reescribir la capa de servicio.
- Investigacion en cuantizacion: el repositorio es un caso de estudio util para comparar estrategias de cuantizacion 4-bit (AWQ pre-graduada frente a uniforme, nvfp4 y mxfp4) con metricas de KL y acuerdo top-1 publicadas, y para reproducir la validacion byte a byte del pipeline de empaquetado.
- Traduccion y asistentes multilingues de ambito tecnico, con la salvedad de que la cobertura de idiomas no esta declarada oficialmente y debe verificarse empiricamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Si se incluyen metricas de fidelidad de cuantizacion frente a la referencia bf16, medidas sobre estos mismos pesos.

Divergencia KL sobre el vocabulario completo (softmax de 248 320 vias, aproximadamente 100 000 tokens puntuados):

| Compilacion | KL frente a bf16 (nats/token) | Acuerdo top-1 |
|---|---:|---:|
| 4-bit AWQ pre-graduada (estos pesos) | 0,0654 | 91,3 % |
| 4-bit uniforme (= mlx-community 4bit) | 0,0763 | 90,5 % |
| nvfp4 (mlx-community) | 0,0962 | 89,0 % |
| mxfp4 (mlx-community) | 0,1437 | 86,4 % |

Perplejidad con muestreo escalonado sobre corpus (contexto 2048, aproximadamente 103 000 tokens puntuados):

| Rebanada | Estos pesos | Referencia bf16 | Exceso |
|---|---:|---:|---:|
| Ingles (wikitext-2) | 5,8450 | 5,7734 | +1,2 % |
| Coreano (Wikipedia en coreano) | 6,2609 | 6,0954 | +2,7 % |
| Codigo (CPython) | 1,8105 | 1,6813 | +7,7 % |

## Requisitos de hardware

- Memoria: el repositorio ocupa 17,4 GB, por lo que la inferencia requiere al menos esa cantidad de memoria unificada disponible; con el modelo borrador de decodificacion especulativa y el contexto activo, se recomienda reservar bastante mas margen.
- Plataforma: el paquete esta pensado para el runtime nativo Metal de Splash, es decir, hardware Apple Silicon (familias M). No se documenta soporte para GPU NVIDIA o AMD en la informacion disponible.
- Equipos consumer: encaja en Macs con memoria unificada de 32 GB o superior (variantes Pro, Max y Ultra). No se declara compatibilidad con GPU de consumo NVIDIA tipo RTX 4090 a traves de este formato.
- Opciones de despliegue: `splash serve-native ./target ./draft <max_context|auto> <max_memory|auto>` para el runtime nativo, o el servidor de llama.cpp mediante el worker `splash`, indicando el paquete como raiz de modelo.
- Latencia y throughput estimados: no disponibles. La presencia de un modelo borrador sugiere una mejora por decodificacion especulativa, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

La comparacion mas directa es con otras compilaciones 4-bit de la misma familia, para las que si hay metricas publicadas.

| Modelo o compilacion | Cuantizacion | KL frente a bf16 (nats/token) | Acuerdo top-1 | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| mxcake3893/Qwen3.8-27B-Alis-Splash (esta ficha) | AWQ pre-graduada 4-bit, paquete Splash | 0,0654 | 91,3 % | Apache 2.0 | Publicado; cero descargas en la consulta |
| mlx-community 4-bit uniforme | 4-bit uniforme | 0,0763 | 90,5 % | No disponible en la informacion | Referencia del ecosistema |
| mlx-community nvfp4 | NVFP4 | 0,0962 | 89,0 % | No disponible en la informacion | Referencia del ecosistema |
| mlx-community mxfp4 | MXFP4 | 0,1437 | 86,4 % | No disponible en la informacion | Referencia del ecosistema |
| Compilacion 6-bit de la familia Alis | 6-bit | No declarado; perplejidad en coreano estadisticamente indistinguible de bf16 | No declarado | Apache 2.0 (familia) | Disponible, con 6,3 GB adicionales |

Frente a alternativas de otros proveedores y tamanos similares no se dispone de datos de benchmarks comparables en la informacion proporcionada, por lo que no se establece comparacion.

## Limitaciones y advertencias

- Coste de calidad real: la propia model card advierte de un exceso de perplejidad significativo en todas las rebanadas medidas, con el maximo relativo en codigo (+7,7 %) y aproximadamente el doble en coreano que en ingles (+2,7 % frente a +1,2 %). Para cargas orientadas a codigo o a coreano conviene evaluar con prompts propios antes de desplegar.
- Alternativa de mayor fidelidad: la compilacion 6-bit de la familia tiene una perplejidad en coreano estadisticamente indistinguible de bf16 a cambio de 6,3 GB mas de memoria; si el margen de hardware lo permite, es la opcion recomendada por la fuente.
- Dependencia de un formato y runtime poco extendidos: el paquete usa splash-packed-q4 schema 3 y requiere el runtime Metal de Splash o el worker `splash` de llama.cpp. Esto limita la portabilidad a otros servidores de inferencia habituales.
- Riesgo de alucinacion: no se documenta mitigacion especifica ni resultados de evaluacion de veracidad; se aplican los riesgos habituales de un modelo generativo de este tamano.
- Idiomas: no existe una lista oficial de idiomas soportados; solo hay evidencia empirica para ingles, coreano y codigo. El rendimiento en castellano no esta medido.
- Procedencia en cadena: los pesos provienen de un fine-tune de terceros (Alis) sobre un modelo cuantizado de terceros (MLX 4-bit AWQ) y reempaquetados por otro usuario distinto; la informacion disponible no detalla los datos ni el proceso del fine-tune.
- Adopcion nula verificable: el repositorio registra cero descargas y cero valoraciones en el momento de la consulta, por lo que no hay senales de uso en produccion ni retroalimentacion de la comunidad.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de las licencias de los modelos base encadenados antes de un despliegue comercial.
- Capacidades no confirmadas: no hay documentacion sobre tool calling, modo de razonamiento explicito ni uso como agente multi-paso; no deben asumirse en disenos de produccion.
- Longitud de contexto: no se declara un valor nominal; solo se sabe que es configurable en tiempo de servicio, lo que obliga a determinarla empiricamente por caso de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mxcake3893/Qwen3.8-27B-Alis-Splash
- Modelo base (fine-tune cuantizado de origen): https://huggingface.co/avlp12/Qwen3.8-27B-Alis-MLX-4bit
- Paquete Splash oficial de referencia: https://huggingface.co/incoai/Qwen3.8-27B-Splash
- Modelo base original citado en creditos: https://huggingface.co/mlx-community/Qwen3.8-27B-4bit
- No se han encontrado en la informacion disponible papers, blogs, repositorios adicionales ni demos asociados a este paquete.
