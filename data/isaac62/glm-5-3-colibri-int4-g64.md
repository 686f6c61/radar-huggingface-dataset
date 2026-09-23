# ISAAC62/GLM-5.3-colibri-int4-g64

## Resumen

GLM-5.3-colibri-int4-g64 es una conversion cuantizada a int4 del checkpoint `zai-org/GLM-5.3` de Z.ai, publicada por el usuario ISAAC62 y empaquetada en el formato de contenedor que consume el motor colibri. No es un modelo nuevo ni un checkpoint oficial: los pesos siguen siendo de Z.ai y lo unico que cambia es como se almacenan. Concretamente, permite ejecutar un modelo de la clase 744B en una maquina con unos 25 GB de RAM manteniendo los expertos enrutados en disco y leyendo solo los que selecciona cada token.

La arquitectura subyacente es un transformer MoE con 78 capas (75 dispersas), 256 expertos y 8 expertos activos por token. La conversion aplica cuantizacion int4 con tamano de grupo 64 a los expertos enrutados (21,2 MB por experto) y 8 bits a las partes densas y de E/S, generando 141 shards que suman 419,3 GB en disco y 116.915 tensores verificados. El modelo base comparte geometria exacta con GLM-5.2 y, segun Z.ai, todas las mejoras de GLM-5.3 provienen del post-entrenamiento, no de cambios arquitectonicos.

Su relevancia practica es acotada pero clara: demuestra que un MoE de escala frontera puede servirse en CPU con presupuesto de memoria de gama consumer mediante streaming de expertos desde disco. La contrapartida es que solo carga en el motor colibri, no en transformers, vLLM, llama.cpp ni Ollama, y que no se ha realizado todavia una comparacion token a token contra la implementacion de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tags: `glm_moe_dsa`, `moe`); 78 capas, 75 dispersas |
| Parametros totales | Clase 744B (segun la model card del autor; valor exacto no disponible) |
| Parametros activos | No disponible. Enrutamiento: 256 expertos, 8 activos por token |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Expertos enrutados: int4 con group size 64 (`ebits=4`, `xbits=4`, `group_size=64`); densas y E/S: 8 bits (`io_bits=8`) |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | `other`, con `license_name: glm-5.3` (heredada del modelo base) |
| Formato de pesos | Contenedor propietario del motor colibri, 141 shards, 419,3 GB. No es safetensors ni GGUF |
| Modelo base | `zai-org/GLM-5.3` (relacion: quantized) |
| MTP (multi-token prediction) | No incluido en esta conversion |
| Tamano del repositorio | 419,3 GB |

## Arquitectura y entrenamiento

El checkpoint original es un transformer de tipo mixture-of-experts con 78 capas, de las cuales 75 son dispersas, 256 expertos por capa y 8 expertos activados por token. El tag `glm_moe_dsa` sugiere un esquema de atencion dispersa combinado con el enrutamiento MoE, aunque la model card no detalla el mecanismo de atencion. Esta conversion no modifica la topologia: se limita a recuantizar y reempaquetar. Los expertos enrutados pasan a int4 con escala por grupo de 64 elementos, mientras que las capas densas y las operaciones de E/S se mantienen en 8 bits. Cada experto cuantizado ocupa 21,2 MB.

No hay informacion en la documentacion proporcionada sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF o DPO del modelo base. Z.ai afirma en su model card que GLM-5.3 usa el mismo modelo base que GLM-5.2 y que todas las ganancias proceden del post-entrenamiento; los dos checkpoints tienen geometria identica y sus `config.json` solo difieren en el `transformers_version` que los escribio y una clave adicional. La innovacion tecnica de esta publicacion es el formato de streaming de expertos: el motor mantiene residentes 10,6 GB de pesos densos y lee de disco unicamente los expertos seleccionados por cada token, con un RSS total de aproximadamente 13,6 GB sobre un presupuesto de 18 GB. Se verificaron los 141 shards en cuanto a validez de cabecera y truncamiento antes de la subida, sin incidencias en 116.915 tensores.

## Capacidades

- Generacion de texto en ingles y chino, con salida coherente confirmada por el autor al ejecutar el modelo.
- Razonamiento y conversacion multi-turno, heredados del modelo base GLM-5.3.
- Ejecucion de un modelo de clase 744B en hardware sin GPU mediante streaming de expertos desde disco.
- Determinismo verificable: con semilla fija produce salida byte a byte identica entre dos rutas distintas de obtencion de expertos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponible; el pipeline declarado es `text-generation`.
- Modo thinking explicito: no disponible en la informacion proporcionada.
- MTP (multi-token prediction): no incluido en esta conversion.

## Casos de uso

- Inferencia de gran escala en CPU sin GPU: el modelo permite servir un MoE de clase 744B en una maquina con unos 25 GB de RAM y 419,3 GB de almacenamiento, leyendo expertos desde disco. Es el escenario para el que fue disenado explicitamente.
- Laboratorios de investigacion con presupuesto de hardware limitado: permite estudiar el comportamiento de un modelo frontera de Z.ai sin acceso a nodos con multiples GPU, a cambio de una latencia mayor por lectura de disco.
- Evaluacion de estrategias de cuantizacion extrema: sirve como banco de pruebas para medir el impacto de int4 con group size 64 sobre expertos enrutados frente al checkpoint original en precision mayor.
- Desarrollo y depuracion del motor colibri: al ser un contenedor especifico de ese motor, es util para validar rutas de carga, seleccion de expertos y coherencia de salida en el propio proyecto.
- Generacion de texto en ingles y chino: cualquier tarea de redaccion o traduccion bidireccional entre ambos idiomas que tolere mayor latencia.
- Experimentos de reproducibilidad: la verificacion de salida byte a byte bajo semilla fija permite usarlo como caso de prueba en pipelines que comparen rutas de ejecucion alternativas.
- Despliegue en entornos con almacenamiento NVMe rapido y CPU con muchos nucleos: el cuello de botella pasa a ser el ancho de banda de disco, por lo que encaja en servidores de almacenamiento local con capacidad de sobra.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y la busqueda web realizada no devolvio resultados relacionados con este modelo. El unico dato empirico reportado es cualitativo: el modelo carga, genera texto coherente y produce salida byte a byte identica entre dos rutas de obtencion de expertos bajo semilla fija. El autor indica explicitamente que no se ha hecho una comparacion token a token contra la implementacion de referencia y pide que quien la realice abra un issue en el repositorio de colibri.

## Requisitos de hardware

- Almacenamiento: 419,3 GB libres para los 141 shards. Se recomienda NVMe, ya que el rendimiento depende del ancho de banda de lectura aleatoria de disco.
- Memoria RAM: aproximadamente 25 GB en la maquina objetivo. La parte densa residente ocupa 10,6 GB y el RSS total se situa en unos 13,6 GB con un presupuesto configurado de 18 GB.
- GPU: no necesaria. El modelo esta disenado para ejecucion en CPU (tag `cpu`, `expert-streaming`). No se especifican GPU compatibles.
- GPU consumer: no aplica; el modelo no se carga en transformers ni en vLLM, por lo que no se puede ejecutar en una RTX 4090 ni similares mediante esas rutas.
- Opciones de despliegue: exclusivamente el motor colibri. Requiere clonar `https://github.com/JustVugg/colibri`, compilar con `make -C c colibri` y lanzar `c/coli chat --model /ruta/a/esta/carpeta`. El motor detecta la familia desde `config.json`. No es compatible con vLLM, llama.cpp, Ollama, TGI ni transformers.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ISAAC62/GLM-5.3-colibri-int4-g64 | Clase 744B, MoE 256 expertos / 8 activos | No disponible | Contenedor colibri, int4 group 64 en expertos y 8 bits en densas | `other` (glm-5.3) | Solo motor colibri |
| zai-org/GLM-5.3 (original) | Clase 744B, misma geometria | No disponible | Checkpoint oficial (tag `fp8`); formato exacto no confirmado en la informacion disponible | glm-5.3 | Ecosistema estandar de transformers/vLLM segun el autor de la conversion |
| zai-org/GLM-5.2 | Identica geometria al anterior | No disponible | No disponible | No disponible | Referenciado por Z.ai como mismo modelo base |

La diferencia relevante entre la primera y la segunda fila no es de calidad del modelo, sino de formato y de huella de memoria: la conversion int4 con streaming de expertos reduce el requisito de RAM a unos 25 GB a costa de depender de disco y de un unico motor de inferencia. La comparacion de rendimiento frente a otras alternativas de la misma categoria no esta disponible porque no se han publicado benchmarks.

## Limitaciones y advertencias

- No es el checkpoint oficial. Los pesos son de Z.ai, pero el empaquetado es de un tercero (ISAAC62) y la procedencia de la conversion no esta auditada por el proveedor original.
- Compatibilidad restringida: no carga en transformers ni en vLLM. Cualquier integracion que dependa de safetensors, GGUF o de las librerias habituales es inviable sin reconversion.
- Etiquetado incorrecto conocido: el motor colibri anuncia el checkpoint como "GLM-5.2 744B" porque la configuracion es identica a la de GLM-5.2 y no hay heuristica capaz de distinguirlos desde `config.json`. Los pesos cargados son los correctos; solo la etiqueta esta mal.
- Sin validacion de equivalencia: no se ha realizado una comparacion token a token contra la implementacion de referencia, por lo que la fidelidad numerica de la cuantizacion int4 no esta cuantificada.
- MTP no incluido: la conversion omite el multi-token prediction, lo que puede afectar al rendimiento en decodificacion respecto al checkpoint original.
- Idiomas limitados a ingles y chino. El rendimiento en castellano no esta documentado.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. Al tratarse de un modelo generativo de gran escala, el riesgo existe, pero no hay evaluaciones publicadas para este checkpoint.
- Sesgos: no documentados. No hay informacion sobre sesgos conocidos ni sobre las medidas de mitigacion aplicadas en el post-entrenamiento.
- Licencia `other` con `license_name: glm-5.3`: se heredan los terminos del modelo base de Z.ai. Antes de cualquier uso comercial hay que revisar la licencia de GLM-5.3 en el repositorio original; la informacion proporcionada no detalla condiciones, restricciones ni permisos.
- Cuello de botella de disco: el rendimiento depende criticamente del almacenamiento. Un disco lento degrada la latencia de forma severa porque cada token requiere leer los expertos seleccionados.
- Repositorio sin adopcion: 0 descargas y 0 likes en el momento de la consulta. No hay comunidad que haya validado el resultado de forma independiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ISAAC62/GLM-5.3-colibri-int4-g64
- Modelo base original: https://huggingface.co/zai-org/GLM-5.3
- Repositorio del motor colibri: https://github.com/JustVugg/colibri
- Paper del modelo: no disponible en la informacion proporcionada
- Blog o anuncio oficial de Z.ai sobre GLM-5.3: no disponible en la informacion proporcionada
- Demo o espacio interactivo: no disponible en la informacion proporcionada

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con este modelo ni con GLM-5.3; los enlaces obtenidos correspondian a resumenes literarios de una novela y no guardan relacion con el contenido de esta ficha.
