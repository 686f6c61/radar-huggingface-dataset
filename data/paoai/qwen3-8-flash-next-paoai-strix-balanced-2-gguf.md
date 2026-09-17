# PaoAI/Qwen3.8-Flash-Next-PaoAI-STRIX-BALANCED-2-GGUF

## Resumen

Qwen3.8-Flash-Next-PaoAI-STRIX-BALANCED-2-GGUF es una cuantizacion comunitaria en formato GGUF del modelo base Qwen/Qwen3.8-Flash-Next, publicada por PaoAI (sin vinculacion con el equipo Qwen). El objetivo es conseguir que un maestro MoE de 176.943.899.520 parametros (unos 176,9 B), distribuido originalmente en BF16 con 360 GB, quepa y funcione en una sola maquina con memoria unificada AMD Strix Halo (Ryzen AI Max+ 395, gfx1151). El resultado es un unico fichero de 80,78 GB (75,22 GiB) que se sirve sin flags de offload.

La receta no es uniforme: se preservan en F16 la atencion y los pesos compartidos, se comprimen los 512 expertos con IQ2_XXS usando imatrix, y se aplican IQ4_NL a la proyeccion descendente de expertos y a la tabla n-gram PLE. Se anade un sidecar MTP en Q8_0 para decodificacion especulativa. El autor reporta 17-32 t/s de decodificacion y 162-688 t/s de prefill a lo largo de toda la ventana, con verificacion de integridad hasta los 262.144 tokens de contexto.

Es relevante ahora porque demuestra que un MoE de casi 177 B con atencion lineal hibrida, tabla de consulta n-gram y cabeza NextN/MTP puede ejecutarse en hardware de escritorio de gama alta con memoria unificada, a costa de una cuantizacion agresiva de los expertos y de un consumo de tokens de razonamiento muy variable (4.000 a 30.000 tokens en el mismo prompt).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido con atencion lineal (GDN), 48 bloques, 512 expertos, tabla n-gram PLE y cabeza NextN/MTP |
| Parametros totales | 176.943.899.520 (aprox. 176,9 B; maestro BF16 descrito como 180 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (256K), con verificacion de integridad declarada en toda la ventana |
| Tipos de cuantizacion | F16 (atencion y pesos compartidos), IQ2_XXS con imatrix (expertos gate/up), IQ4_NL (ffn_down_exps y tabla PLE), Q8_0 (sidecar MTP), F32/F16 (router, normas y glue) |
| Idiomas soportados | en (ingles) |
| Licencia | qwen-community-1.0 (etiquetada como license: other, con enlace a LICENSE) |
| Formato de pesos | GGUF (llama.cpp), un unico fichero de 80,78 GB mas sidecar `mtp-Q8_0.gguf` |

Desglose medido de tensores declarado por el autor: tabla n-gram PLE 28,80 GB; down-projection de expertos 22,65 GB; gate/up de expertos 20,77 GB; atencion + indexer 3,48 GB; embeddings de tokens + salida 2,53 GB; atencion lineal (GDN) + glue 2,27 GB; normas y router <0,3 GB. Total 80,78 GB (75,22 GiB). El repositorio ocupa 92,8 GB.

## Arquitectura y entrenamiento

El maestro es un MoE de 48 bloques y 512 expertos con atencion lineal hibrida, una tabla n-gram PLE de gran tamano y una cabeza NextN/MTP. La cuantizacion trata cada organo por separado: la atencion y los pesos compartidos se mantienen en F16 porque afectan a la lectura del prompt y al seguimiento del contexto; los expertos gate/up se comprimen a IQ2_XXS con imatrix por ser la mayor parte del peso; `ffn_down_exps` se fuerza a IQ4_NL por restricciones de forma; la tabla PLE tambien va en IQ4_NL; y router, glue y normas se mantienen en F32/F16 para no degradar las senales de enrutado. La cabeza MTP se distribuye aparte en Q8_0 y habilita decodificacion especulativa.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO: esos datos pertenecen al modelo base y no aparecen en la informacion proporcionada. La innovacion practica de esta publicacion es la receta de cuantizacion por partes combinada con el sidecar MTP, que segun el autor hace que la decodificacion especulativa sea rentable en Strix Halo, junto con un conmutador automatico de contexto profundo que permite servir la ventana completa de 256K con el tamano de lote por defecto. La actualizacion del 17 de septiembre de 2026 solo cambio el motor (fork, commit `50c271f8`, linaje v0.7.6): el fichero de pesos no vario (mismo sha256, mismos 80,78 GB).

## Capacidades

- Generacion de texto conversacional en ingles (`pipeline_tag: text-generation`, etiqueta `conversational`).
- Razonamiento con modo de pensamiento: el modelo genera bloques largos de tokens de razonamiento antes de escribir la respuesta final (medidos entre 4.071 y 12.000 tokens en la misma tarea, con casos que superan el presupuesto de 12.000).
- Generacion de codigo, incluyendo implementacion de logica novel (maquinas de estado con traza exacta) y codigo concurrente (clase ring buffer thread-safe que supero un arnes de 5.000 operaciones con 0 errores).
- Analisis de codigo enganoso: trazar codigo que "miente" y localizar un fallo plantado (tarea Hunt).
- Contexto largo: ventana declarada de 262.144 tokens con verificacion de integridad a toda profundidad y un barrido de contexto profundo de 8K a 128K descrito en la model card.
- Decodificacion especulativa mediante cabeza MTP servida como sidecar separado.
- Soporte de tool calling / function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente; el unico indicio es la etiqueta `endpoints_compatible` y el modo de pensamiento largo.
- Capacidades multilingues: limitadas a ingles segun el campo `language`.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Revision de codigo hostil o enganoso: la tarea Hunt del autor consiste en leer codigo que miente, trazarlo y localizar un fallo plantado; el modelo obtuvo 100/100 en dos de tres ejecuciones, por lo que es util en revisiones donde el codigo no es de fiar.
- Implementacion de logica de negocio novel: la tarea Automaton exige implementar reglas nuevas y emitir una traza de estado exacta, un escenario tipico de maquinas de estado de dominio especifico; el resultado fue mas variable (60/60/100).
- Codigo concurrente en produccion: escribir clases thread-safe verificadas con un arnes de estres de 5.000 operaciones, siempre que se le conceda un presupuesto de salida de 32.000 tokens o mas.
- Analisis de repositorios y documentos muy largos: con 262.144 tokens de contexto puede ingerir bases de codigo o expedientes extensos completos, evitando el troceado y la perdida de dependencias entre fragmentos.
- Procesamiento por lotes con prefill intensivo: los 162-688 t/s de prefill permiten clasificar, resumir o extraer informacion de volumenes grandes de texto en una sola maquina.
- Despliegue on-premise con requisitos de privacidad: al caber en una unica caja Strix Halo sin offload, permite servir el modelo en local para datos que no pueden salir de la organizacion.
- Asistente de codigo interactivo en estacion de trabajo: con 17-32 t/s de decodificacion en contexto corto, es viable como autocompletado o chat de codigo de uso individual, no para servir a muchos usuarios a la vez.
- Banco de pruebas para decodificacion especulativa en llama.cpp: el sidecar MTP y la documentacion de velocidades por fase lo convierten en un caso de estudio para medir el rendimiento de MTP en gfx1151.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor publica una "chain test" propia con tareas evaluadas por ejecucion, con medianas de tres ejecuciones:

| Tarea (que mide) | Mediana de 3 | Ejecuciones |
|---|---|---|
| Automaton: implementar reglas noveles y traza exacta de estado | 60 | 60 · 60 · 100 |
| Hunt: leer codigo enganoso, trazarlo y hallar el fallo | 100 | 100 · 100 · 0 |
| Ring buffer: codigo multihilo bajo estres | 100 | 100 · 20 · 100 |
| Mediana por tarea | 86,7/100 | Totales por ejecucion: 87 · 60 · 67 |

| Fase | t/s de decodificacion (rango de 3 ejecuciones) |
|---|---|
| Spec (planificacion) | 18,8 - 19,8 |
| Hunt (analisis) | 21,7 - 24,4 |
| Automaton (escritura de codigo) | 26,3 - 28,1 |
| Ring buffer (escritura de codigo) | 20,1 - 20,6 |
| Publish (salida larga, presupuesto de 12.000 tokens) | 23,0 |

Rendimiento global declarado: 17-32 t/s de decodificacion y 162-688 t/s de prefill en toda la ventana. El efecto del presupuesto de salida en la tarea de ring buffer, medido con el mismo prompt y servidor:

| Presupuesto de salida | Resultado |
|---|---|
| 12.000 tokens | Truncado a mitad de razonamiento, sin codigo emitido, 20/100 |
| 32.000 tokens | Clase completa emitida, arnes de estres: 5000/5000 consumidas, 5000 unicas, 0 errores, 100/100 |

## Requisitos de hardware

- Pesos: fichero unico de 80,78 GB (75,22 GiB) mas el sidecar `mtp-Q8_0.gguf`; el repositorio completo ocupa 92,8 GB en disco.
- Hardware de referencia del autor: una sola maquina AMD Strix Halo (Ryzen AI Max+ 395, gfx1151), sin flags de offload. Requiere una configuracion de memoria unificada de 128 GB para alojar pesos mas cache.
- GPU discretas: una GPU con 80 GB o mas de VRAM (A100 80 GB, H100 80/94 GB, H200 141 GB) es el minimo razonable para los pesos; el tamano exacto de la cache KV no esta disponible en la informacion proporcionada, por lo que la VRAM total necesaria no puede calcularse con precision.
- GPU de consumo: no cabe. Ni una RTX 4090 (24 GB) ni una RTX 5090 (32 GB) pueden alojar 80,78 GB de pesos sin offload a RAM o disco, algo no documentado para este fichero.
- Opciones de despliegue: llama.cpp (el autor usa un fork propio, commit `50c271f8`, linaje v0.7.6). Otros motores (vLLM, TGI, Ollama, LM Studio) no estan documentados en la informacion disponible.
- Latencia y throughput: 17-32 t/s de decodificacion y 162-688 t/s de prefill en Strix Halo; por fase, 18,8-28,1 t/s de decodificacion en contexto corto. El autor indica que la actualizacion de motor mejoro el prefill en contexto corto y que la ventana completa de 256K ahora se sirve con el lote por defecto.
- Nota de servicio critica: en tareas dificiles, configurar un presupuesto de salida de 32.000 tokens o mas; con 12.000 el modelo puede agotar el presupuesto pensando y devolver una respuesta vacia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PaoAI/Qwen3.8-Flash-Next-PaoAI-STRIX-BALANCED-2-GGUF | 176,9 B (MoE, 512 expertos) | 262.144 tokens | GGUF, 80,78 GB | qwen-community-1.0 | Publico en HuggingFace, 15 descargas, 0 likes (a fecha de la informacion) |
| Qwen/Qwen3.8-Flash-Next (maestro BF16) | 176,9 B (MoE, 512 expertos), descrito como 180 B | no disponible en la informacion proporcionada | BF16, 360 GB | qwen-community-1.0 | Modelo base referenciado por esta cuantizacion |

No se dispone de informacion sobre otras cuantizaciones alternativas del mismo maestro ni sobre modelos comparables de la misma categoria (por ejemplo, otros MoE de ~180 B en GGUF) en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles: el campo `language` declara unicamente `en`; no hay soporte multilingue documentado.
- Cuantizacion agresiva: los expertos gate/up van en IQ2_XXS, lo que implica perdida de precision respecto al maestro BF16; no se publican mediciones de degradacion frente al original (solo la chain test propia).
- Razonamiento de longitud impredecible: el mismo prompt genero entre 4.071 y mas de 12.000 tokens de pensamiento; con presupuestos de salida cortos el modelo puede no llegar a emitir respuesta.
- Rendimiento volatil en tareas concretas: el autor reconoce que la fila de ring buffer es la mas variable, con ejecuciones de 100, 20 y 100, y una ejecucion de la tarea Hunt que puntuo 0.
- Algunos fallos son errores propios del modelo, no del arnes de evaluacion: una ejecucion no emitio la linea de respuesta requerida y otra fallo por una errata en el codigo (`threading.Time`).
- Benchmarks no independientes: todas las cifras de rendimiento y calidad proceden del propio autor, con N=3 y una metodologia propia ("chain test") que no es un estandar reconocido.
- Validacion comunitaria minima: 15 descargas y 0 likes; no hay evidencia de terceros reproduciendo las mediciones.
- Licencia qwen-community-1.0: es una licencia "other" con condiciones propias; hay que revisar el fichero LICENSE antes de cualquier uso comercial. No se dispone del texto de la licencia en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion disponible.
- Proyecto no afiliado a Qwen: es una cuantizacion comunitaria de PaoAI.
- Dependencia de un fork de motor: las velocidades declaradas se midieron con un fork concreto (commit `50c271f8`); otros builds de llama.cpp pueden rendir de forma distinta.
- Los resultados de la busqueda web proporcionada no contienen informacion relevante sobre el modelo (los enlaces devueltos tratan sobre restaurantes de sushi en Seattle), por lo que no se ha podido contrastar ni ampliar ningun dato con fuentes externas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PaoAI/Qwen3.8-Flash-Next-PaoAI-STRIX-BALANCED-2-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia: fichero LICENSE del repositorio (referenciado como `license_link: LICENSE` en la model card); texto no incluido en la informacion proporcionada.
- Papers, blogs, repositorios o demos adicionales: no disponible en la informacion proporcionada.
