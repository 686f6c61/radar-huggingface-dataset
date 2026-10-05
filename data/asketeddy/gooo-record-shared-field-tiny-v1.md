# asketeddy/gooo-record-shared-field-tiny-v1

## Resumen

gooo-record-shared-field-tiny-v1 es un modelo de decisión de tamano muy reducido publicado por el usuario asketeddy (kimjooyoon en GitHub) para el ecosistema Gooo, un lenguaje experimental de metaprogramación sobre Go. El modelo no genera texto libre: actua como un juez que ordena candidatos de expresiones en la generación de codigo Gooo, en concreto para decidir el orden de ensamblado de campos compartidos en registros (record) y para continuar la busqueda cuando una combinacion de candidatos falla. La model card lo describe como un QAT (quantization-aware training) ternario con un fichero de pesos de 446 B, frente a los 74.624 B de la variante dense v2 FP32 anterior.

La relevancia del artefacto esta en su enfoque: en lugar de usar un LLM generalista, el autor entrena un clasificador minúsculo y determinista que se integra en el compilador de Gooo mediante un vector de caracteristicas explicito (version `triple_record_field_flow_v2_shared_v1`). Cuando se omiten las opciones del modelo, el sistema funciona de forma determinista, sin inferencia. Las cifras publicadas provienen de conjuntos de casos fijos del propio autor (151/151 salidas, 66/66 campos de registro en el conjunto de casos fijos), no de benchmarks estandar.

Se trata de un artefacto de investigación con licencia MIT, sin descargas ni valoraciones en el momento de la consulta, tamano de repositorio de 0,0 GB y documentacion mayoritariamente en coreano. No se declaran parametros totales, arquitectura de red detallada ni longitud de contexto, por lo que varios campos de la ficha quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de decision ternario para seleccion de candidatos; el autor no declara la topologia de red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible; el modelo consume un vector de caracteristicas de 768 celdas para tres campos (64 de representacion + 32 de procedencia + 160 de intencion por campo) |
| Tipos de cuantizacion | ternaria QAT (entrenamiento con cuantizacion, pesos ternarios), ternaria PTQ (post-training quantization) y FP32 |
| Idiomas soportados | coreano (ko) e ingles (en) segun las etiquetas del repositorio; la documentacion es principalmente en coreano |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La informacion disponible no describe la topologia interna (no se confirma transformer, MoE, SSM ni red densa convencional). Lo que si se explicita es el contrato de entrada: un vector de caracteristicas de 768 celdas que codifica, para cada uno de los tres campos de un registro, 64 celdas de representacion, 32 de procedencia (de donde vienen el valor actual y el valor guardado) y 160 de intencion. El modelo puntua candidatos y los ordena; en el caso de fallo de una combinacion, registra el tipo de error y el numero de combinacion y continua con el siguiente candidato dentro del mismo presupuesto de intentos, conservando las implementaciones parciales ya encontradas.

En cuanto al entrenamiento, la tabla comparativa del autor distingue cuatro variantes sobre los mismos datos: dense v2 FP32 (74.624 B), shared FP32 (8.288 B), shared PTQ ternario (446 B) y shared QAT ternario (446 B). La variante QAT ternaria es la publicada como v1. El autor afirma explicitamente que en las ultimas iteraciones descritas no hubo nuevo entrenamiento de pesos ("nuevo entrenamiento de pesos: 0 veces") y que los pesos v1 permanecen sin cambios; el siguiente paso planificado es un entrenamiento balanceado con nuevas fuentes. No se declaran numero de tokens, composicion del dataset, ni uso de RLHF/DPO.

## Capacidades

- Seleccion de orden de candidatos: elige la secuencia de ensamblado de campos de registro en Gooo a partir de un vector de caracteristicas de tres campos.
- Continuacion tras fallo: cuando una combinacion de dos expresiones invalida el uso previo de una variable guardada, el modelo registra el error de tipo y el numero de combinacion y propone el siguiente candidato dentro del mismo presupuesto.
- Analisis de procedencia de valores: distingue el valor actual de un campo y el valor guardado, y mantiene la relacion aunque cambien nombres locales o valores de ejemplo de entrada.
- Modo determinista: si se omiten las opciones del modelo, el flujo se resuelve de forma determinista, sin llamadas de inferencia.
- Integracion con toolchain: se invoca mediante el comando `gooo body-context --value-flow --activity Select --feature-version triple_record_field_flow_v2_shared_v1`.
- Servicio local: se ha probado en modo trabajador con dos procesos y 32 peticiones por ronda, con la primera respuesta llegando antes de que terminase la entrada.
- Capacidades multilingues: no se describen tareas de generacion de lenguaje; las etiquetas ko/en se refieren al idioma de la documentacion y de los ejemplos.
- No se documentan capacidades de vision, audio, tool calling general, agentes ni modo de razonamiento extendido.

## Casos de uso

- Generacion de codigo Gooo en el compilador: el modelo ordena los candidatos de expresion para los campos de un registro, de modo que el compilador puede ensamblar la actualizacion de campos sin exploracion exhaustiva completa. Es adecuado porque su coste de inferencia es de microsegundos.
- Recuperacion ante combinaciones invalidas: cuando dos cambios de expresion son validos por separado pero incompatibles al aplicarse juntos, el modelo conserva el error y propone la siguiente combinacion dentro del presupuesto, evitando que el motor de busqueda se detenga.
- Analisis de flujo de valores: dado un grafo de fuente Gooo con definiciones, copias, asignaciones de campo, lecturas, uniones de condiciones y retornos tempranos, el modelo ayuda a determinar de donde procede cada valor actual y cada valor guardado.
- Validacion en CI de experimentos de metaprogramacion: los resultados publicados provienen de ejecuciones automatizadas (12 comprobaciones por PR, 27 tareas de CI en el experimento secuencial) que comparan los candidatos elegidos por el modelo con los valores reales.
- Servicio local de bajo consumo: con 22,88 a 23,41 MiB de RAM por trabajador y latencias de repeticion de 6,71 a 10,37 ms, puede desplegarse como proceso auxiliar en una maquina de desarrollo sin GPU.
- Reproduccion de experimentos academicos sobre decisores ternarios: el repositorio incluye los datos brutos, los denominadores y los scripts de repeticion, lo que permite auditar la ganancia de QAT ternario frente a FP32 y frente a PTQ.
- Filtrado previo antes de invocar un modelo mayor: dado su coste cercano a cero, puede descartar ordenes de candidatos inviables antes de recurrir a un LLM mayor, si el pipeline lo permite.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre tres campos y ocho formas de cuerpo/candidato (todos los objetivos comparten la misma mascara 7, lo que el propio autor senala como posible sesgo hacia expresiones alternativas):

| Modelo | Otro cuerpo, expresion base: primera combinacion completa | Otro cuerpo, expresion nueva | Campos correctos en evaluacion de cuerpo | Fichero de pesos |
|---|---:|---:|---:|---:|
| dense v2 FP32 (anterior) | 424/1.536 (27,60 %) | 81/512 (15,82 %) | 2.942/4.608 (63,85 %) | 74.624 B |
| shared FP32 | 1.152/1.536 (75,00 %) | 120/512 (23,44 %) | 4.224/4.608 (91,67 %) | 8.288 B |
| shared PTQ ternario | 168/1.536 (10,94 %) | 88/512 (17,19 %) | 2.304/4.608 (50,00 %) | 446 B |
| shared QAT ternario (v1) | 1.344/1.536 (87,50 %) | 102/512 (19,92 %) | 4.416/4.608 (95,83 %) | 446 B |

Otras metricas publicadas: en 72 grafos validos y 144 ejecuciones, el QAT acerto el primer candidato en 144/144 campos y 96/96 salidas de actividad (12 grafos por presupuesto de intentos). En el conjunto de casos fijos se verificaron 151/151 salidas y 66/66 campos de registro. La cuantificacion ternaria mediante PTQ degrada fuertemente el resultado (10,94 % en primera combinacion completa frente a 87,50 % del QAT), y el rendimiento cae de forma notable en expresiones no vistas durante el entrenamiento (19,92 %).

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU. El fichero de pesos ternario ocupa 446 B y la variante FP32 compartida, 8.288 B.
- RAM por trabajador: 22,88 a 23,41 MiB medidos en las pruebas con dos trabajadores y 32 peticiones por ronda.
- GPU: no se requiere ni se documenta ninguna. No hay datos para A100, H100 o RTX 4090.
- GPU de consumo: irrelevante; el cuello de botella no es el modelo, sino la compilacion y ejecucion del codigo Gooo generado.
- Despliegue: herramienta de linea de comandos `gooo` (Go 1.27.1, SDK v0.2.24 en las versiones citadas) y modo trabajador local. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: mediana de inferencia de 17,50 a 18,46 microsegundos; primera respuesta 525,86 ms y repeticiones de 6,71 a 10,37 ms en las pruebas de dos trabajadores; comando completo en torno a 310 ms; preparacion de fuente con mediana de 59,9 microsegundos y 86.892 B de asignacion temporal en 5 repeticiones.

## Comparativa con modelos similares

No se dispone de modelos comparables de terceros en la informacion proporcionada; el artefacto es especifico del lenguaje Gooo y no tiene equivalente publico conocido. La comparacion disponible es interna, entre las propias variantes del autor:

| Variante | Pesos | Primera combinacion completa | Campos correctos | Licencia |
|---|---:|---:|---:|---|
| dense v2 FP32 | 74.624 B | 27,60 % | 63,85 % | no disponible |
| shared FP32 | 8.288 B | 75,00 % | 91,67 % | no disponible |
| shared PTQ ternario | 446 B | 10,94 % | 50,00 % | no disponible |
| shared QAT ternario (v1) | 446 B | 87,50 % | 95,83 % | MIT |

Frente a un LLM generico de codigo, la diferencia relevante no es de calidad sino de naturaleza: este modelo no produce texto ni codigo, solo ordena candidatos preexistentes generados por el compilador de Gooo, con un coste de almacenamiento tres ordenes de magnitud inferior.

## Limitaciones y advertencias

- Sesgo reconocido por el autor: los 72 grafos del experimento secuencial comparten la misma mascara (mask 7), por lo que las cifras de acierto pueden estar sesgadas hacia una expresion alternativa concreta.
- Caida fuerte en generalizacion: en expresiones no vistas, la primera combinacion completa baja al 19,92 %, muy lejos del 87,50 % en expresiones vistas.
- Sensibilidad a la cuantizacion: la variante PTQ ternaria rinde muy por debajo (10,94 % y 50,00 %), de modo que usar el artefacto sin el entrenamiento QAT original degrada gravemente el resultado.
- Ambito muy restringido: el modelo solo tiene sentido dentro del ecosistema Gooo; no es utilizable como modelo de lenguaje, generacion de codigo general ni asistente.
- Idiomas: la documentacion y los wikis estan principalmente en coreano; las etiquetas ko/en no implican capacidades linguisticas generales.
- Datos incompletos: no se declaran parametros, arquitectura, contexto, formato de pesos ni pipeline, lo que dificulta la reproduccion independiente fuera del toolchain del autor.
- Madurez: 0 descargas y 0 valoraciones en el momento de la consulta, repositorio de 0,0 GB y estado experimental (etiqueta `v0.1.0-experimental` en las releases).
- Riesgo de alucinacion: no aplica en el sentido habitual, porque el modelo no genera lenguaje; el riesgo equivalente es seleccionar un orden de candidatos incorrecto, que el propio flujo detecta como error de tipo.
- Licencia MIT: permite uso comercial y modificacion con atribucion; conviene revisar la licencia de las dependencias del toolchain Gooo, no incluidas en esta ficha.
- Produccion: las cifras publicadas provienen de conjuntos de casos fijos del propio autor y de un unico ejemplo principal; no hay validacion externa ni benchmarks estandar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/asketeddy/gooo-record-shared-field-tiny-v1
- Experimentos de continuacion de candidatos: https://huggingface.co/asketeddy/gooo-record-shared-field-tiny-v1/tree/main/experiments/record-candidate-continuation-20261005
- Experimentos de procedencia de valores: https://huggingface.co/asketeddy/gooo-record-shared-field-tiny-v1/tree/main/experiments/record-value-origins-20261005
- Experimentos de actualizacion de campos: https://huggingface.co/asketeddy/gooo-record-shared-field-tiny-v1/tree/main/experiments/record-field-updates-20261005
- Validacion de actualizacion de campos: https://huggingface.co/asketeddy/gooo-record-shared-field-tiny-v1/tree/main/experiments/record-field-updates-20261005/validation
- Workbench del ecosistema Gooo: https://github.com/kimjooyoon/gooo-ecosystem-workbench
- Publicacion inicial del workbench: https://github.com/kimjooyoon/gooo-ecosystem-workbench/tree/a3d2c1bb70e6630d4c6d17f7249ee3bcd226cf75/publication/initial-20261005
- Release experimental v0.1.0: https://github.com/kimjooyoon/gooo-ecosystem-workbench/releases/tag/v0.1.0-experimental
- Experimentos de decision neuronal: https://github.com/kimjooyoon/gooo-neural-decision-experiments/tree/main/publication/record-field-updates-20261005
- Guia de inicio secuencial: https://github.com/kimjooyoon/gooo-neural-decision-experiments/blob/main/docs/sequential-field-quickstart.ko.md
- Wiki de continuacion de candidatos: https://github.com/kimjooyoon/meta-ontology-go/wiki/Candidate-Continuation
- Wiki de procedencia de valores: https://github.com/kimjooyoon/meta-ontology-go/wiki/Value-Origins
- PR 1233: https://github.com/kimjooyoon/meta-ontology-go/pull/1233
- PR 1234: https://github.com/kimjooyoon/meta-ontology-go/pull/1234
- PR 1235: https://github.com/kimjooyoon/meta-ontology-go/pull/1235
- PR 1236: https://github.com/kimjooyoon/meta-ontology-go/pull/1236
- PR 1237: https://github.com/kimjooyoon/meta-ontology-go/pull/1237
- PR 1238: https://github.com/kimjooyoon/meta-ontology-go/pull/1238
- arXiv referenciado en las etiquetas del repositorio: arxiv:2402.17764 (contenido no verificado en la informacion disponible)
