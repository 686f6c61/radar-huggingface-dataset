# peculiar-ragdoll/Sharp-Spark-X2.5-4B-GGUF

## Resumen

Sharp-Spark-X2.5-4B-GGUF es un conjunto de cuantizaciones GGUF dinamicas con imatrix del modelo base XHToken/Spark-X2.5-4B, un transformer denso de 4,1 mil millones de parametros orientado a codigo y contexto largo, publicado por el usuario peculiar-ragdoll bajo licencia Apache 2.0. El modelo base es un transformer con atencion hibrida: de sus 36 capas, solo 9 son de atencion completa (una de cada cuatro) y las otras 27 emplean una ventana deslizante de 512 tokens, lo que mantiene el coste de la cache KV casi plano y permite sostener velocidad util en contextos de seis cifras.

El valor anadido de esta publicacion no es el modelo en si, sino el proceso de cuantizacion: un importance matrix ponderado hacia codigo de seguridad y de sistemas, medido directamente sobre los pesos BF16 y consumido en su totalidad (3641 fragmentos de 4096 tokens, 14,9 millones de tokens), una asignacion heuristica de bits por tensor y una plantilla de chat propia (Sharp-Spark). El resultado es una version de 3,61 GB (Q6_K_XL) que cabe en tarjetas de 6 GB de VRAM y que, en la rebanada de 17 celdas de SWE-bench-Live, iguala estadisticamente al modelo sin cuantizar Q8 en MMLU-Pro (69,0 % frente a 70,3 %, p=0,51) gastando menos tokens por pregunta.

Es relevante ahora porque ataca un nicho concreto y mal cubierto: desarrolladores con GPU de gama baja (4-6 GB de VRAM) y hasta 16 GB de RAM que necesitan un asistente de codigo capaz de trabajar sobre repositorios largos, sin recurrir a APIs externas ni a modelos MoE de mayor tamano que exigen offloading parcial a RAM del sistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion hibrida (36 capas: 9 de atencion completa, 27 con ventana deslizante de 512 tokens) |
| Parametros totales | 4.112.079.360 (~4,1 B) |
| Longitud de contexto | 131.072 tokens validados; tabla de cache KV documentada hasta 256K |
| Tipos de cuantizacion | Q4_K_XL (2,67 GB), Q5_K_XL (3,24 GB), Q6_K_XL (3,61 GB), todas con imatrix dinamica |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp / endpoints compatibles) |

## Arquitectura y entrenamiento

El modelo subyacente, Spark-X2.5-4B, es un transformer denso de aproximadamente 4,1 mil millones de parametros con un esquema de atencion hibrida poco habitual en esta escala. Solo 9 de sus 36 capas realizan atencion completa sobre la secuencia entera; las otras 27 aplican una ventana deslizante de 512 tokens. Esta decision arquitectonica es la que hace economicamente viable el contexto largo en una GPU pequena: en la cache KV unicamente las 9 capas completas escalan con la longitud de la secuencia (aproximadamente 4 KB por token y capa completa), mientras que las 27 ventaneadas mantienen un coste fijo de unos 57 MB. El resultado agregado es un crecimiento de 36 KB/token en f16 y 19 KB/token en q8_0.

Respecto al entrenamiento del modelo base, no se dispone de informacion sobre composicion del dataset, numero de tokens, ni si hubo etapas de RLHF o DPO: no disponible. Lo que si esta documentado es el proceso de cuantizacion. El importance matrix se calculo sobre un corpus publico y redistribuible ponderado hacia codigo de seguridad y de sistemas, y se midio directamente sobre los pesos BF16 (8,2 GB), que caben en memoria, evitando aproximaciones intermedias en la cadena de medida. Se procesaron 3641 fragmentos de 4096 tokens cada uno (14,9 millones de tokens), agotando el corpus en lugar de detenerse en un presupuesto preestablecido. La eleccion de fragmentos de 4096 tokens es deliberada: con fragmentos de 512 o menos, las 9 capas de atencion completa nunca entrarian en el regimen de largo alcance para el que existen y sus puntuaciones de importancia describirian un trabajo que no realizan. Ambos parametros quedan registrados en el propio archivo GGUF como `imatrix.chunk_count` y `imatrix.chunk_size`. Ademas, la publicacion incluye la plantilla de chat Sharp-Spark y etiquetas que apuntan a eficiencia de tokens y a un modo de razonamiento ("thinking") eficiente, si bien no se detalla el mecanismo interno de dicha eficiencia.

## Capacidades

- Generacion de texto y conversacion multi-turno, con plantilla de chat propia Sharp-Spark.
- Generacion y edicion de codigo, con orientacion explicita a codigo de sistemas y de seguridad (reflejada en la ponderacion del imatrix).
- Razonamiento en contexto largo: validado hasta 131.072 tokens con degradacion moderada de velocidad.
- Modo de razonamiento etiquetado como "efficient-thinking" y comportamiento "token-efficient" (menos tokens por respuesta segun las mediciones del autor).
- Capacidades multilingues: no disponible.
- Soporte de tool calling o function calling: no documentado en la informacion disponible.
- Soporte explicito de agentes o razonamiento multi-paso: no documentado como caracteristica formal, aunque la evaluacion se realizo sobre tareas de resolucion de issues de codigo (SWE-bench-Live), lo que implica flujos multi-paso.

## Casos de uso

- Asistente de codigo local en portatiles con GPU modesta: con Q6_K_XL (3,61 GB) el modelo cabe en una GPU de 6 GB de VRAM y permite autocompletado y generacion en un entorno sin conexion, sin enviar codigo propietario a servicios externos.
- Analisis de repositorios completos: gracias a los 131.072 tokens de contexto validados, es posible cargar ficheros extensos o varios modulos relacionados y pedir explicaciones, refactorizaciones o deteccion de dependencias cruzadas en una sola pasada.
- Revision de codigo en pipelines de CI/CD: integrado via llama.cpp o un endpoint compatible, puede generar comentarios automaticos sobre diffs sin depender de APIs de terceros ni incurrir en coste por token.
- Auditoria de seguridad de codigo: el imatrix esta ponderado hacia codigo de seguridad y de sistemas, por lo que las capas que mas importan en ese dominio conservan precision; resulta adecuado para analisis estatico asistido y deteccion de patrones inseguros.
- Explicacion y documentacion de bases de codigo heredadas: la combinacion de contexto largo y eficiencia de tokens permite procesar modulos antiguos extensos y producir documentacion o resumenes de arquitectura con un presupuesto de tokens contenido.
- Generacion de pruebas unitarias y casos de prueba: el modelo puede leer una funcion junto a su contexto de modulo y proponer pruebas, ejecutable en local dentro de un flujo de desarrollo con recursos limitados.
- Prototipado en entornos con restricciones de VRAM (4 GB): con Q4_K_XL (2,67 GB) se obtiene un margen amplio de cache KV que permite superar los 128K de contexto en la misma tarjeta, util para tareas de recuperacion aumentada sobre corpus extensos.

## Benchmarks y rendimiento

Los datos proceden de las mediciones publicadas por el autor en la model card. No se han publicado otros resultados en la informacion disponible.

| Benchmark | Configuracion | Sharp-Spark-Q6 | Upstream Spark-Q8 | Referencia externa |
|---|---|---|---|---|
| SWE-bench-Live (rebanada de 17 celdas, 3 semillas) | soluciones por semilla | 5,7 | 3,7 | Haiku 4.5-high: 5,0 |
| MMLU-Pro (subconjunto de 100 preguntas, 3 semillas) | exactitud | 69,0 % | 70,3 % (p=0,51, empate estadistico) | no disponible |
| MMLU-Pro | tokens por pregunta (mediana) | 43 % menos que upstream | referencia | no disponible |

Rendimiento de inferencia segun el autor:

| Contexto | Prefill (tok/s) | Decode (tok/s) |
|---|---|---|
| Corto (512) | 1684 | 111 |
| 131.072 | 557 | 42 |

La caida de velocidad de decodificacion entre contexto vacio y 131k es de solo 2,6x. Un prefill completo de 131k se completa en aproximadamente cuatro minutos.

## Requisitos de hardware

- VRAM para los pesos: 2,67 GB (Q4_K_XL), 3,24 GB (Q5_K_XL), 3,61 GB (Q6_K_XL). No incluye cache KV ni overhead del runtime.
- Cache KV segun contexto y tipo: a 32K, 1,27 GB en f16 y 0,67 GB en q8_0; a 64K, 2,47 GB y 1,31 GB; a 128K, 4,83 GB y 2,60 GB; a 256K, 9,49 GB y 5,16 GB.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM para Q4_K_XL, 5 GB para Q5_K_XL y 6 GB o mas para Q6_K_XL. El autor apunta a tarjetas de gama de consumo con 6 GB. No se documentan despliegues en A100, H100 ni similares, aunque son tecnicamente posibles.
- Margen en tarjeta de 6 GB: Q6_K_XL deja espacio para aproximadamente 48K de contexto en f16 o unos 96K en q8_0. Q4_K_XL supera los 128K en la misma tarjeta. El autor recomienda bajar de nivel de cuantizacion antes que reducir la cache para ganar contexto.
- Opciones de despliegue: llama.cpp (formato nativo GGUF) y runtimes compatibles con endpoints. No se mencionan vLLM, TGI ni Ollama en la informacion disponible, si bien cualquier backend que consuma GGUF puede servirlo.
- Throughput y latencia: prefill de 1684 tok/s y decode de 111 tok/s en contexto corto; prefill de 557 tok/s y decode de 42 tok/s a 131.072 tokens.
- Estrategia alternativa segun el autor: si se dispone de mas de 16 GB de RAM, resultaria mas conveniente un modelo MoE como CyberTiel 35B-A3B con offloading parcial a RAM del sistema, que ofrece aproximadamente el doble de capacidad manteniendo velocidad razonable.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | SWE-bench-Live (17 celdas) | Licencia / disponibilidad |
|---|---|---|---|---|---|
| Sharp-Spark-X2.5-4B (Q6_K_XL) | 4,1 B | Denso, atencion hibrida | 131K+ | 5,7 soluciones/semilla | Apache 2.0, pesos GGUF abiertos |
| Upstream Spark-X2.5-4B (Q8) | 4,1 B | Denso, atencion hibrida | 131K+ | 3,7 soluciones/semilla | Apache 2.0, pesos abiertos |
| CyberTiel 35B-A3B (MoE) | ~35 B totales, ~3 B activos | MoE | no disponible | 13,0 soluciones/semilla | no disponible en la informacion |
| Haiku 4.5 (modo high) | no disponible | no disponible | no disponible | 5,0 soluciones/semilla | API propietaria |
| Opus 4.6 (modo medium) | no disponible | no disponible | no disponible | 12,0 soluciones/semilla (1 semilla) | API propietaria |

El autor reporta que CyberTiel 35B-A3B resuelve aproximadamente el doble de tareas que Sharp-Spark en la misma rebanada, a costa de 22 GB de pesos y de requerir mas RAM. En terminos de trabajo amortizado por solucion, Sharp-Spark-Q6 consume 74 minutos, Haiku 21 minutos, el Spark Q8 original 145 minutos y CyberTiel 19 minutos.

## Limitaciones y advertencias

- Sensibilidad a la cuantizacion: el propio autor advierte que modelos de este tamano se degradan por debajo de Q6, y que si se necesita un quant menor que Q4 conviene elegir un modelo nativamente mas pequeno.
- Capacidad limitada frente a alternativas mayores: con 4,1 B densos, el modelo resuelve aproximadamente la mitad de tareas que un MoE de 35B con 3B activos en la misma prueba.
- Idiomas soportados: no disponible, lo que impide garantizar un comportamiento multilingue fiable fuera del ingles tecnico de codigo.
- Sesgos conocidos: no disponibles; no se documenta ningun analisis de sesgo.
- Riesgo de alucinacion: inherente a un modelo de 4B, especialmente en generacion de codigo o datos factuales sin verificacion; se recomienda validar la salida en entornos de produccion.
- Tool calling y function calling: no documentados, por lo que su integracion en agentes que dependan de estas capacidades requiere validacion previa.
- Licencia: Apache 2.0, que permite uso comercial, modificacion y redistribucion, siempre que se mantengan los avisos de licencia y atribucion correspondientes.
- Madurez de la publicacion: 0 descargas y 11 me gusta en el momento de la consulta, lo que indica escasa validacion externa por parte de la comunidad.
- Las metricas de SWE-bench-Live y MMLU-Pro proceden de rebanadas reducidas (17 celdas y 100 preguntas) y, en el caso de Opus, de una sola semilla, por lo que su interpretacion debe ser prudente.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/peculiar-ragdoll/Sharp-Spark-X2.5-4B-GGUF
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-4B
- Coleccion CyberTielCoder 35B-A3B: https://huggingface.co/collections/peculiar-ragdoll/cyber-tiel-coder-35b-a3b
- Coleccion TielCoder 35B-A3B: https://huggingface.co/collections/peculiar-ragdoll/tiel-coder-35b-a3b
