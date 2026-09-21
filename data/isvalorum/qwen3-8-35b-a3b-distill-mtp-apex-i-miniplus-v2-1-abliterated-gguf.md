# IsValorum/Qwen3.8-35B-A3B-Distill-MTP-APEX-I-MiniPlus-V2.1-Abliterated-GGUF

## Resumen

Qwen3.8-35B-A3B-Distill-MTP-APEX-I-MiniPlus-V2.1-Abliterated-GGUF es una cuantizacion GGUF de tipo Mixture-of-Experts publicada por el usuario IsValorum sobre el modelo destilado empero-ai/Qwen3.8-35B-A3B-Distill. El repositorio contiene una version «abliterated» (ablacion de rechazos) del modelo, es decir, se han eliminado los vectores de rechazo del modelo alineado original mediante una tecnica de ablacion direccional denominada Heretic TPE. El resultado es un modelo sin guardarrailes de seguridad que mantiene, segun su autor, las capacidades de razonamiento y conocimiento del original.

El modelo es un transformer MoE etiquetado como `qwen35moe`, con 34.660.610.688 parametros totales (aproximadamente 34,66 mil millones) declarados en safetensors, 40 capas y 256 micro-expertos por capa segun la model card. La nomenclatura «A3B» del nombre sugiere del orden de 3.000 millones de parametros activos por token, si bien no se confirma ese dato de forma explicita en la informacion disponible. Soporta una longitud de contexto de 256.000 tokens y admite 13 idiomas.

Su relevancia practica se debe a dos factores. Por un lado, el autor ha disenado una receta de cuantizacion por tensor (APEX-I-MiniPlus) que ocupa aproximadamente 13,74 GiB, un tamano propio de cuantizaciones de 3 bits, manteniendo los expertos de razonamiento en `IQ3_XXS`, los routers en `F32` sin comprimir, las puertas de atencion en `Q8_0` y la cabeza de salida en `Q6_K`. Por otro lado, incluye una cabeza de borrador MTP (multi-token prediction) en `Q8_0` que permite decodificacion especulativa, lo que unido al streaming desde RAM del sistema esta pensado para ejecutar el modelo en hardware de consumo con GPU de 24 GB o con offload parcial a DDR4/DDR5.

Es importante subrayar que se trata de una publicacion reciente, con cero descargas y cero «likes» en el momento de recopilar los datos, sin resultados publicados de benchmarks estandar (MMLU, HumanEval, GSM8K) y sin informacion verificable sobre el dataset de entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (tag `qwen35moe`), 40 capas, 256 micro-expertos por capa segun la model card |
| Parametros totales | 34.660.610.688 (aproximadamente 34,66 mil millones) |
| Parametros activos | No disponible de forma explicita; la nomenclatura «A3B» sugiere del orden de 3.000 millones activos, sin confirmacion |
| Longitud de contexto | 256.000 tokens (256K), declarados por el autor |
| Tipos de cuantizacion | Receta propia APEX-I-MiniPlus V2.1: `IQ3_XXS` en expertos nucleares (10-29), `Q3_K` en expertos de borde (0-9 y 30-39), `Q5_K` en experto compartido (todas las capas), `Q4_K` en proyecciones `q/k/v` de atencion completa, `Q6_K` en `output.weight` y cabeza de salida, `Q8_0` en puertas de atencion y cabeza de borrador MTP, `F32` en routers `gate_inp` |
| Idiomas soportados | Ingles, chino, espanol, frances, aleman, portugues, italiano, ruso, japones, coreano, vietnamita, tailandes y arabe (13) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp). Tamano del repositorio: 17,3 GB; fichero principal declarado: aproximadamente 14,65 GB (13,65 GiB) |

## Arquitectura y entrenamiento

El modelo base es empero-ai/Qwen3.8-35B-A3B-Distill, una destilacion de un MoE de la familia Qwen3.8 con 35.000 millones de parametros totales y, segun la nomenclatura, 3.000 millones activos, 40 capas y 256 micro-expertos por capa. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO sobre el modelo destilado; toda esa informacion figura como no disponible. El autor si menciona la existencia de un modo de razonamiento con bloques `<think>` y advierte que las cuantizaciones agresivas provocan picos de perplejidad y errores de sintaxis precisamente en esa fase de razonamiento.

Sobre esa base, IsValorum aplica dos procesos. El primero es una cuantizacion GGUF por tensor auditada individualmente: los routers `gate_inp` se mantienen en `F32` sin comprimir para evitar derivas de enrutamiento de expertos (el autor afirma que el 100 % de las matrices de enrutamiento quedan intactas), las puertas de atencion se elevan a `Q8_0`, la cabeza de salida a `Q6_K` y los expertos centrales se mantienen en `IQ3_XXS` o superior. Ademas de la cuantizacion de pesos, el repositorio incluye una cabeza MTP (multi-token prediction) dedicada en `Q8_0` que actua como modelo borrador para decodificacion especulativa, y un companion de vision (`mmproj`) en la release segun la descripcion del autor.

El segundo proceso es la ablacion de rechazos. Se emplea una tecnica denominada «Heretic TPE directional ablation» con steering ortogonal de activaciones: las direcciones de rechazo se aislan matematicamente y se desvian de forma ortogonal, con una divergencia KL declarada de D_KL = 0,0076 respecto del modelo original. El autor reporta 0/10 rechazos en un conjunto de pruebas binario, sin corrupcion de sintaxis ni degradacion del enrutamiento MoE. Estos valores proceden exclusivamente de la model card y no han sido verificados de forma independiente.

## Capacidades

- Generacion de texto conversacional y de un solo turno, con pipeline declarado `text-generation`.
- Razonamiento explicito mediante cadena de pensamiento (`<think>`), segun la propia descripcion del autor sobre el comportamiento del modelo cuantizado.
- Generacion de codigo, con mencion explicita a la consistencia de sintaxis y al indentado de codigo como criterios de calidad de la cuantizacion.
- Razonamiento matematico y logico derivado del modelo destilado, sin metricas publicadas que lo cuantifiquen.
- Soporte multilingue en 13 idiomas: ingles, chino, espanol, frances, aleman, portugues, italiano, ruso, japones, coreano, vietnamita, tailandes y arabe.
- Decodificacion especulativa mediante cabeza MTP en `Q8_0`, que permite usar el modelo como verificador de tokens propuestos por un borrador mas rapido.
- Capacidades de vision a traves del companion `mmproj` incluido en la release, segun la model card.
- Ausencia deliberada de rechazos: la ablacion elimina las respuestas de tipo moralizante en tareas de seguridad de sistemas, pruebas de penetracion y cumplimiento normativo (0/10 rechazos en el conjunto de prueba del autor).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso orquestado: no disponible de forma explicita en la informacion proporcionada, aunque el contexto de 256K y el modo de razonamiento son compatibles con flujos multi-paso.

## Casos de uso

- Red teaming y evaluacion de seguridad de sistemas: al haber eliminado los vectores de rechazo, el modelo responde a solicitudes de analisis de vulnerabilidades, construccion de exploits de laboratorio y revision de configuraciones inseguras sin bloqueos intermedios, lo que resulta util para equipos de seguridad que necesitan cobertura completa de un caso de prueba. Requiere un entorno aislado y autorizacion explicita.
- Auditoria de cumplimiento normativo: el modelo puede analizar politicas internas, contratos o registros de actividad extensos apoyandose en la ventana de 256K tokens y en su capacidad multilingue, reduciendo el numero de particiones de documento necesarias.
- Generacion de codigo en local: con 13,65 GiB de pesos, se puede ejecutar en una estacion de trabajo con GPU de 24 GB y generar codigo sin enviar el contexto a servicios externos, algo relevante para bases de codigo propietarias.
- Asistente multilingue para atencion al cliente: cubre 13 idiomas con un mismo modelo, lo que simplifica la infraestructura frente a alternativas de un solo idioma o de traduccion intermedia.
- Procesamiento por lotes de documentacion tecnica: la combinacion de decodificacion especulativa por cabeza MTP y offload parcial a RAM permite sostener flujos de generacion largos en hardware de consumo (24-28+ tokens por segundo en streaming segun el autor).
- Investigacion sobre alineacion y ablacion: el modelo sirve como referencia para estudiar el efecto de la eliminacion de vectores de rechazo sobre el conocimiento y el razonamiento, dado que el autor publica la metrica de divergencia (D_KL = 0,0076) y mantiene versiones anteriores como registro de optimizacion.
- Despliegue en equipos con GPU modesta mediante streaming desde RAM: el autor indica que el modelo esta especificamente disenado para ejecutarse parcial o totalmente desde memoria del sistema en ventanas de contexto grandes (de 160K a 256K), lo que habilita casos de analisis de corpus largos en portatiles o torres sin GPU de gama alta.
- Extraccion y resumen de informacion en dominios sensibles donde un modelo con guardarrailes rechazaria la tarea por la tematica (por ejemplo, ficcion con violencia explicita o analisis de discurso de odio con fines academicos).

## Benchmarks y rendimiento

La informacion disponible solo incluye una metrica de calidad de cuantizacion, no benchmarks de capacidades. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de evaluaciones comparables en la informacion disponible.

| Metrica | Valor declarado | Condiciones |
|---|---|---|
| Perplejidad WikiText-2 | 5,1280 ± 0,1312 | Evaluada sobre el binario GGUF, contexto 2048, 8 fragmentos |
| Delta de perplejidad frente al modelo sin cuantizar | Aproximadamente +0,02 | Base sin cuantizar citada por el autor: aproximadamente 5,10 |
| Divergencia KL tras la ablacion de rechazos | D_KL = 0,0076 | Steering ortogonal de activaciones, Heretic TPE |
| Rechazos en conjunto de prueba binario | 0/10 | Conjunto de prueba declarado por el autor, sin publicar |
| Throughput con offload a RAM | +24 a 28+ tokens/s en streaming | Bulk del modelo en RAM del sistema, DDR4/DDR5 |

Estos datos proceden unicamente de la model card del autor y no cuentan con verificacion independiente.

## Requisitos de hardware

- VRAM estimada para inferencia con todos los pesos en GPU: aproximadamente 13,65 GiB de pesos mas overhead de contexto KV; con 256K de contexto completo el consumo de KV crece y puede superar ampliamente los 24 GB.
- GPU recomendadas por el autor para offload completo (`-ngl 99`): RTX 3090, RTX 4090 y RTX 5090 (24 GB o mas de VRAM).
- Si cabe en GPU de consumo: si, en tarjetas de 24 GB o mas con contexto moderado; en GPUs de 8-16 GB requiere offload parcial de capas a RAM del sistema.
- Estrategia alternativa soportada: ejecucion total o parcial desde RAM del sistema (DDR4/DDR5) manteniendo ventanas de contexto de 160K a 256K, con throughput declarado de 24-28+ tokens por segundo en streaming.
- CPU: el autor menciona explicitamente la necesidad de evitar paradas de descompresion en AVX2, por lo que se espera un procesador con soporte AVX2 como minimo razonable.
- Opciones de despliegue: llama.cpp (confirmado en la model card). Otros runtimes GGUF como Ollama, LM Studio o text-generation-webui no se confirman en la informacion disponible.
- Elementos adicionales incluidos: cabeza de borrador MTP en `Q8_0` para decodificacion especulativa y companion de vision (`mmproj`) para capacidades multimodales.
- Latencia: no disponible de forma agregada; el autor solo reporta el throughput en el escenario de streaming desde RAM.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan comparar este modelo con alternativas de la misma categoria (por ejemplo, otros MoE de aproximadamente 30-35 mil millones de parametros totales y 3 mil millones activos). La comparacion siguiente se limita a variantes del mismo linaje descritas en la model card.

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia | Notas |
|---|---|---|---|---|---|---|
| Este modelo (Abliterated) | 34,66 B totales | 256K | APEX-I-MiniPlus V2.1, expertos nucleares `IQ3_XXS`, routers `F32` | Aproximadamente 13,65 GiB | Apache-2.0 | Sin rechazos (0/10 en prueba del autor), D_KL = 0,0076 |
| Qwen3.8-35B-A3B-Distill-MTP-APEX-I-MiniPlus-V2.1-GGUF (alineado) | 34,66 B totales | 256K | Misma receta, fidelidad Q5-Q6 declarada | Aproximadamente 14,75 GB | Apache-2.0 | Version con guardarrailes por defecto, incluye companions MTP y mmproj |
| Cuantizaciones APEX-I-Mini genericas de la comunidad | 34,66 B totales | 256K | Expertos a `IQ2_S`, cabeza de salida `Q3_K_M`, proyecciones de atencion `Q3_K` | Aproximadamente 12,5 GB | Apache-2.0 (heredada) | El autor reporta errores de sintaxis, indentado de codigo roto y picos de perplejidad en la fase `<think>` |
| empero-ai/Qwen3.8-35B-A3B-Distill (modelo base) | 34,66 B totales | No disponible | Pesos sin cuantizar (safetensors) | No disponible | No disponible | Modelo destilado original, sin ablacion ni cuantizacion |

## Limitaciones y advertencias

- Ausencia total de guardarrailes: la ablacion elimina los rechazos, por lo que el modelo puede generar contenido danino, ilegal o inseguro sin advertencia. No es adecuado para exponerlo directamente a usuarios finales sin filtros externos.
- La afirmacion de «cero rechazos» se basa en un conjunto de prueba de 0/10 casos declarado por el propio autor, sin publicacion del conjunto ni verificacion independiente.
- La ablacion direccional no es neutral: aunque la divergencia declarada es baja (D_KL = 0,0076), implica una modificacion medible de la distribucion de salida respecto del modelo alineado, con efectos no evaluados sobre tareas sensibles.
- Riesgo de alucinacion inherente al modelo base y agravado por la cuantizacion agresiva: el propio autor documenta que recetas mas agresivas producen errores de sintaxis y perplejidad elevada, lo que sugiere fragilidad en tareas de formato estricto.
- Sin benchmarks de capacidades publicados: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones multilingues que permitan estimar la degradacion real frente al modelo sin cuantizar.
- Cero adopcion verificable: 0 descargas y 0 «likes» en el momento de la recopilacion, por lo que no existe validacion de terceros sobre la calidad o la estabilidad de la cuantizacion.
- Riesgo de confusion de nomenclatura: el autor advierte explicitamente de que las builds MiniPlus no deben confundirse con las APEX-I-Mini genericas de la comunidad; usar la receta equivocada degrada notablemente la calidad.
- Informacion de entrenamiento no disponible: se desconoce el numero de tokens, la composicion del dataset y si hubo RLHF o DPO en el modelo base, lo que dificulta evaluar sesgos conocidos.
- Sesgos: no disponibles de forma explicita en la informacion proporcionada; al ser un modelo multilingue con predominio de datos en ingles y chino, es esperable un rendimiento desigual entre los 13 idiomas declarados.
- Restricciones de licencia: la licencia declarada es Apache-2.0, que permite uso comercial, pero la licencia real puede depender de las condiciones del modelo base de terceros; conviene verificar la cadena de licencias antes de un despliegue en produccion.
- La ventana de 256K declarada no implica rendimiento uniforme a longitudes extremas; no hay evaluaciones de tipo «needle in a haystack» en la informacion disponible.
- Fecha de creacion del repositorio: 20 de septiembre de 2026, con actualizacion el 21 de septiembre de 2026; es una publicacion muy reciente y sujeta a cambios.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/IsValorum/Qwen3.8-35B-A3B-Distill-MTP-APEX-I-MiniPlus-V2.1-Abliterated-GGUF
- Release alineada del mismo autor: https://huggingface.co/IsValorum/Qwen3.8-35B-A3B-Distill-MTP-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo, su modelo base ni su receta de cuantizacion; los resultados obtenidos no guardan relacion con el contenido de esta ficha. No se dispone de papers, blogs, repositorios de codigo ni demos adicionales en la informacion proporcionada.
