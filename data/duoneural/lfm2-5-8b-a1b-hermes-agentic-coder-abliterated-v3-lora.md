# DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v3-LoRA

## Resumen

`DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v3-LoRA` es un adaptador LoRA publicado en HuggingFace por el usuario DuoNeural, entrenado sobre el modelo base `DuoNeural/LFM2.5-8B-A1B-Abliterated`, que a su vez es una variante "abliterated" (con los mecanismos de rechazo eliminados) de un modelo de la familia LFM2.5-8B-A1B. Se distribuye en formato PEFT sobre `safetensors`, con un peso de repositorio de 0,1 GB, lo que corresponde únicamente a los pesos del adaptador y no al modelo completo.

La relevancia de esta ficha es limitada y conviene ser explícito: la model card publicada es la plantilla por defecto de HuggingFace sin rellenar, sin descripción, sin licencia, sin idiomas declarados, sin datos de entrenamiento ni resultados de evaluación. El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, y la búsqueda web asociada no ha devuelto ningún resultado relevante (los enlaces recuperados corresponden a foros de un videojuego y no guardan relación con el modelo).

Por tanto, todo lo que puede afirmarse con rigor procede del identificador del modelo, de las etiquetas del repositorio y del tamaño del artefacto. La denominación sugiere un ajuste orientado a uso conversacional, agéntico y de generación de código, sobre una arquitectura de tipo mixture of experts (MoE) con aproximadamente 8.000 millones de parámetros totales y ~1.000 millones activos, pero ninguno de estos extremos está confirmado por documentación del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el identificador del modelo base sugiere LFM2.5 con configuracion 8B-A1B; sin confirmar) |
| Parametros totales | no disponible (el nombre del modelo base indica "8B") |
| Parametros activos | no disponible (el nombre del modelo base indica "A1B", compatible con una arquitectura MoE de ~1.000 M activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no la declara; el campo de licencia aparece vacio) |
| Formato de pesos | safetensors (adaptador LoRA/PEFT, libreria `peft` 0.21.0) |
| Tipo de artefacto | adaptador LoRA, no modelo completo |
| Modelo base | DuoNeural/LFM2.5-8B-A1B-Abliterated |
| Tamano del repositorio | 0,1 GB |
| Pipeline | text-generation |
| Fecha de creacion | 2026-09-18 |
| Ultima actualizacion | 2026-09-18 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo base ni sobre el procedimiento de entrenamiento del adaptador. Los unicos datos verificables son de naturaleza tecnica y de empaquetado: se trata de un adaptador LoRA (Low-Rank Adaptation) distribuido en safetensors y cargable mediante la libreria PEFT en su version 0.21.0, lo que implica que el modelo completo se obtiene combinando este adaptador con los pesos del modelo base `DuoNeural/LFM2.5-8B-A1B-Abliterated`.

La nomenclatura del identificador aporta indicios, no hechos: "LFM2.5-8B-A1B" apunta a la familia de modelos fundacionales de Liquid AI y a una configuracion de mezcla de expertos con 8.000 millones de parametros totales y alrededor de 1.000 millones activos por token; "Hermes" remite a ajustes de tipo instructivo/agéntico en la estela de los modelos Hermes; "Agentic-Coder" sugiere un entrenamiento orientado a flujos agénticos y generacion de codigo; "Abliterated" alude a la tecnica comunitaria de ablacion de direcciones de rechazo, que elimina parte de la alineacion de seguridad del modelo base; y "v3" indica la tercera iteracion de la serie. Ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni el uso de RLHF/DPO, ni los hiperparametros estan documentados en la informacion disponible.

## Capacidades

Las siguientes capacidades se deducen exclusivamente del identificador y de las etiquetas del repositorio (`text-generation`, `conversational`, `lora`). No estan respaldadas por evaluaciones publicadas.

- Generacion de texto conversacional en formato instructivo, segun la etiqueta `conversational`.
- Orientacion a codigo: el sufijo "Coder" sugiere entrenamiento especifico en generacion y edicion de codigo.
- Orientacion agéntica: el sufijo "Agentic" apunta a flujos multi-paso, posiblemente con soporte de tool calling o function calling, si bien esto no esta confirmado.
- Capacidades multilingues: no disponible.
- Capacidades de vision, audio o modo de razonamiento explicito (thinking mode): no disponible.
- Comportamiento tras la ablacion: al tratarse de una variante "abliterated", cabe esperar una menor tasa de rechazos ante peticiones sensibles, aunque el alcance real de la modificacion no esta documentado.

## Casos de uso

Advertencia previa: al no existir evaluaciones publicadas ni model card funcional, los siguientes escenarios son hipotesis de aplicacion derivadas de la denominacion del modelo y no recomendaciones validadas. En un entorno de produccion requeririan una evaluacion propia previa.

- Asistencia a la programacion en editor o IDE: el adaptador se cargaria sobre el modelo base para completar y refactorizar codigo en un asistente tipo plugin, aprovechando la hipotesis de un entrenamiento especifico en codigo. Requiere verificar previamente la tasa de codigo compilable.
- Agente de refactorizacion multi-paso: el sufijo "Agentic" sugiere capacidad para encadenar llamadas a herramientas (lectura de ficheros, ejecucion de tests, aplicacion de parches) en un bucle controlado por el desarrollador.
- Integracion en pipelines de CI/CD para revision automatica de pull requests: generacion de comentarios, deteccion de patrones problematicos y propuesta de parches, siempre con supervision humana dado que no hay datos de fiabilidad.
- Prototipado rapido de asistentes conversacionales: la etiqueta `conversational` lo hace candidato para demos internas de chat sobre un servidor con vLLM y soporte de adaptadores LoRA.
- Investigacion sobre ablacion de seguridad: el modelo resulta util como objeto de estudio comparativo frente al modelo base no abliterado, para medir el efecto de la eliminacion de direcciones de rechazo en tareas de codigo y agenticas.
- Experimentacion academica con adaptadores PEFT de bajo coste: al ocupar 0,1 GB, es viable iterar sobre el adaptador en entornos con recursos limitados, manteniendo fijo el modelo base.
- Generacion de documentacion tecnica a partir de codigo fuente: caso de uso natural para un modelo con presunta especializacion en codigo y conversacion, aunque sin garantia de fidelidad al repositorio analizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no contiene datos de evaluacion, no se han recuperado resultados en la busqueda web y el repositorio no incluye informes de MMLU, HumanEval, GSM8K ni de ninguna otra suite. Cualquier cifra que se atribuyera a este modelo seria inventada.

## Requisitos de hardware

Las cifras de esta seccion son estimaciones aritmeticas condicionadas a que el modelo base confirme la configuracion 8B-A1B que sugiere su nombre. No proceden de documentacion del autor.

- Adaptador: 0,1 GB en disco. Es el unico dato confirmado.
- Modelo base: no disponible. Segun la nomenclatura, en bf16 los ~8.000 M de parametros ocuparian del orden de 16 GB de VRAM, a los que habria que sumar la cache KV.
- Cuantizacion a 8 bits: del orden de 8 GB de pesos, mas cache KV.
- Cuantizacion a 4 bits: del orden de 4-5 GB de pesos, lo que en teoria permitiria ejecucion en GPU de consumo con 8-12 GB de VRAM.
- GPU recomendadas: no disponible. Como orientacion general para ese hipotetico tamano, una RTX 4090 (24 GB) cubriria bf16 con contexto moderado, y una A100 o H100 darian margen para contextos largos y lotes grandes.
- Despliegue: el formato PEFT es compatible con `transformers`+`peft`, con vLLM (soporte de adaptadores LoRA) y con TGI. La conversion a GGUF para llama.cpp u Ollama requeriria fusionar previamente el adaptador con el modelo base.
- Latencia y throughput: no disponibles. En una arquitectura MoE con ~1.000 M de parametros activos, el throughput por token seria sensiblemente superior al de un denso de 8.000 M, pero esto es una inferencia, no una medicion.

## Comparativa con modelos similares

No se dispone de datos verificados de alternativas en la informacion proporcionada. La busqueda web no devolvio resultados relacionados con el modelo. La siguiente tabla se deja planteada como marco de comparacion, con las celdas que no pueden rellenarse marcadas como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos verificados |
|---|---|---|---|---|---|
| DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v3-LoRA | no disponible (nombre sugiere 8B totales / 1B activos) | no disponible | no disponible | publico en HuggingFace, 0 descargas | artefacto LoRA de 0,1 GB |
| Modelo base DuoNeural/LFM2.5-8B-A1B-Abliterated | no disponible | no disponible | no disponible | publico en HuggingFace | referenciado como base del adaptador |
| Alternativas de la misma categoria (modelos MoE de ~8B totales con ~1B activos, o adaptadores de codigo/agénticos) | no disponible | no disponible | no disponible | no disponible | no recuperados en la busqueda |

## Limitaciones y advertencias

- Licencia no declarada. Sin licencia explicita no puede asumirse permiso de uso comercial; en la practica, el modelo queda en un limbo legal que desaconseja su uso en produccion sin aclaracion previa del autor.
- Modelo "abliterated". La ablacion de direcciones de rechazo elimina total o parcialmente los comportamientos de rechazo del modelo original. Esto incrementa el riesgo de generar contenido danino, ilegal o inseguro ante peticiones maliciosas y reduce la eficacia de las barreras de seguridad habituales.
- Ausencia total de evaluacion. No hay benchmarks, ni evaluacion de sesgos, ni analisis de tasas de alucinacion, ni pruebas de robustez. Cualquier afirmacion de calidad seria especulativa.
- Model card vacia. El autor no ha documentado procedencia de datos, hiperparametros, ni limitaciones conocidas, lo que impide auditar el entrenamiento y evaluar riesgos de contaminacion de datos.
- Idiomas no declarados. No puede asumirse un rendimiento adecuado en castellano ni en ningun otro idioma concreto.
- Ausencia de adopcion. Con 0 descargas y 0 interacciones, no existe comunidad que haya reportado fallos, comportamientos anomalos o casos de exito.
- Dependencia del modelo base. El adaptador no es autonomo: su comportamiento depende por completo de `DuoNeural/LFM2.5-8B-A1B-Abliterated`, cuyas caracteristicas tampoco estan documentadas aqui.
- Fechas de publicacion inusuales (2026-09-18 tanto en creacion como en actualizacion), lo que junto al resto de indicios sugiere un artefacto experimental de baja madurez.
- Trazabilidad limitada del nombre. La interpretacion de siglas como "Hermes", "Agentic", "Coder" o "A1B" es inferencia del editor a partir del identificador, no informacion confirmada por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v3-LoRA
- Modelo base: https://huggingface.co/DuoNeural/LFM2.5-8B-A1B-Abliterated
- Documentacion de PEFT: https://huggingface.co/docs/peft/index
- Articulo original de LoRA (Hu et al., 2021): https://arxiv.org/abs/2106.09685
- Referencia citada en la plantilla de la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental en ML: https://mlco2.github.io/impact
- Resultados de busqueda web: no se han recuperado enlaces relevantes sobre este modelo. Los resultados devueltos corresponden a foros de un videojuego (foro.gamer.com.tw) y no guardan relacion con el modelo, por lo que se descartan.
