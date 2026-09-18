# heffnt/cmt-september

## Resumen

heffnt/cmt-september es un adaptador PEFT (LoRA) publicado en HuggingFace por el usuario heffnt, etiquetado explicitamente con los tags `backdoor`, `ai-safety` e `research`. No se trata, por tanto, de un modelo de proposito general, sino de un artefacto de investigacion orientado al estudio de comportamientos maliciosos insertados deliberadamente en pesos de adaptadores. El repositorio esta restringido (gated): es necesario aceptar condiciones en HuggingFace antes de acceder a los ficheros.

El adaptador se declara entrenado sobre tres modelos base distintos: Qwen/Qwen3.5-0.8B (referenciado tambien como `base_model:adapter`), google/gemma-3-1b-it y meta-llama/Llama-3.2-1B-Instruct. Los pesos se distribuyen en formato safetensors bajo la libreria `peft`, y la licencia indicada es `cmt-research-share-terms` (etiquetada como `license:other`), lo que sugiere terminos de uso especificos para investigacion.

La relevancia del artefacto es metodologica: los adaptadores LoRA con puertas traseras son un vector de ataque poco visible en la cadena de suministro de modelos, porque modifican el comportamiento de un modelo base legitimo con una fraccion minima de parametros. El tamano del repositorio, 403,2 GB, es muy superior al de un adaptador LoRA convencional sobre un modelo de menos de 1.000 millones de parametros, lo que apunta a la presencia de multiples checkpoints o artefactos adicionales (no documentados en la informacion disponible). El modelo registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT/LoRA sobre modelos base transformer decoder-only (arquitectura interna del adaptador: no disponible) |
| Parametros totales | No disponible (modelo base principal declarado: Qwen3.5-0.8B, ~0,8 mil millones de parametros; tamano del adaptador: no disponible) |
| Parametros activos | No aplica (no se indica que los modelos base sean MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos distribuidos en safetensors; no se documentan variantes GGUF, GPTQ ni AWQ) |
| Idiomas soportados | No disponible |
| Licencia | cmt-research-share-terms (etiquetada como `license:other`); acceso restringido mediante condiciones |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft |
| Modelos base declarados | Qwen/Qwen3.5-0.8B, google/gemma-3-1b-it, meta-llama/Llama-3.2-1B-Instruct |
| Tamano del repositorio | 403,2 GB |
| Acceso | Restringido (gated) |
| Fecha de creacion | 2026-09-17 |
| Ultima actualizacion | 2026-09-17 |

## Arquitectura y entrenamiento

La informacion disponible identifica el artefacto como un adaptador LoRA gestionado mediante la libreria `peft`, no como un modelo completo con pesos propios. Esto implica que la arquitectura efectiva en inferencia es la del modelo base sobre el que se cargue el adaptador, y que el cambio de comportamiento proviene de las matrices de bajo rango inyectadas en las capas del transformer. No se documentan en la ficha el rango del adaptador, los modulos objetivo, el valor de alpha, la tasa de aprendizaje ni el numero de pasos de entrenamiento.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens utilizados, la composicion de los datos, ni sobre si hubo fases de RLHF, DPO o ajuste supervisado. La presencia del tag `backdoor` indica, segun la propia clasificacion del autor, que el adaptador incorpora algun tipo de comportamiento condicionado (disparador o trigger), pero los detalles del mecanismo, del disparador y de la tarea objetivo no estan publicados en la informacion disponible. Tampoco se especifica si el adaptador es valido simultaneamente para los tres modelos base declarados o si existen variantes independientes para cada uno.

## Capacidades

La informacion disponible no documenta capacidades funcionales del modelo. A partir de las etiquetas y los metadatos se puede indicar lo siguiente:

- No se declara ninguna capacidad de generacion, razonamiento, codigo, matematicas o vision.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte para agentes ni razonamiento multi-paso.
- No se declara cobertura multilingue ni lista de idiomas.
- El tag `backdoor` sugiere que el artefacto esta disenado para exhibir un comportamiento condicionado por un disparador, presumiblemente con fines de investigacion en seguridad.
- El tag `ai-safety` situa el artefacto en el ambito de la evaluacion de riesgos, la deteccion de puertas traseras y el estudio de defensas.
- El tag `research` y la licencia `cmt-research-share-terms` refuerzan el caracter no productivo del artefacto.

## Casos de uso

Los siguientes casos se derivan de las etiquetas declaradas por el autor (`backdoor`, `ai-safety`, `research`) y no de documentacion tecnica publicada. Deben considerarse hipotesis de uso dentro de un entorno controlado y aislado.

- Evaluacion de tecnicas de deteccion de puertas traseras: el adaptador puede emplearse como muestra positiva conocida en pipelines de deteccion, permitiendo medir la tasa de verdaderos positivos de metodos como analisis de activaciones, poda diferencial o auditoria de pesos de bajo rango.
- Red-teaming de plataformas de despliegue: permite comprobar si un servidor de inferencia (vLLM, TGI, Ollama) aplica controles suficientes al cargar adaptadores de terceros y si registra el modelo base efectivo tras la fusion.
- Estudio de la cadena de suministro de modelos: sirve para cuantificar el riesgo de publicar adaptadores sobre modelos base legitimos y de bajo coste computacional, donde la inspeccion manual de pesos es inviable.
- Validacion de procesos de filtrado en hubs de modelos: el artefacto permite verificar si las politicas de revision, las etiquetas de seguridad y los controles de acceso restringido reducen efectivamente la distribucion de artefactos maliciosos.
- Investigacion academica sobre robustez: puede utilizarse como referencia en articulos que midan la transferibilidad de comportamientos maliciosos entre distintos modelos base (Qwen, Gemma, Llama) a partir de un mismo adaptador.
- Formacion y concienciacion en equipos de seguridad: en entornos de laboratorio, permite demostrar de forma reproducible como un fichero de pocos cientos de megabytes puede alterar el comportamiento de un modelo desplegado en produccion.
- Analisis de interoperabilidad de adaptadores: dado que se declaran tres modelos base distintos, puede emplearse para estudiar hasta que punto un adaptador entrenado o disenado para una familia de modelos mantiene su efecto al transferirse a otra.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del repositorio no incluye tablas de evaluacion, ni comparaciones con otros adaptadores, ni metricas de tasa de activacion del disparador, de degradacion en tareas benignas o de transferibilidad entre modelos base.

## Requisitos de hardware

- VRAM de inferencia: no disponible en la documentacion. Como referencia orientativa basada en el modelo base declarado de ~0,8 mil millones de parametros, la inferencia en fp16 requeriria del orden de 2 GB de VRAM y en cuantizacion de 4 bits alrededor de 0,5-1 GB, sin contar el coste adicional del adaptador, que no esta cuantificado.
- GPU recomendadas: no disponibles. Cualquier GPU consumer con 4-8 GB de VRAM seria, en principio, suficiente para el modelo base de 0,8B en precision reducida, pero esta estimacion no ha sido validada con este adaptador.
- Viabilidad en GPU consumer: probable para el modelo base de 0,8B, no verificada para este artefacto concreto.
- Almacenamiento: el repositorio ocupa 403,2 GB, por lo que la descarga completa exige ese espacio en disco independientemente de la VRAM necesaria para inferencia.
- Opciones de despliegue: la libreria declarada es `peft`, lo que implica carga mediante `transformers` + `peft`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI. La carga de adaptadores PEFT esta soportada por vLLM y TGI en determinadas configuraciones, pero no hay confirmacion para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han identificado en la informacion disponible adaptadores de investigacion comparables con etiqueta `backdoor` publicados bajo condiciones equivalentes. La tabla siguiente recoge unicamente los modelos base declarados en los metadatos, con los datos verificables:

| Modelo | Parametros | Licencia | Acceso | Contexto |
|---|---|---|---|---|
| Qwen/Qwen3.5-0.8B (base declarada) | ~0,8B | no disponible | no disponible | no disponible |
| google/gemma-3-1b-it (base declarada) | ~1B | Gemma Terms of Use | abierto con condiciones | no disponible |
| meta-llama/Llama-3.2-1B-Instruct (base declarada) | ~1B | Llama 3.2 Community License | abierto con condiciones | no disponible |
| heffnt/cmt-september | no disponible (adaptador LoRA) | cmt-research-share-terms | restringido (gated) | no disponible |

No se dispone de datos de rendimiento que permitan comparar el adaptador con alternativas funcionales.

## Limitaciones y advertencias

- Naturaleza maliciosa declarada: el tag `backdoor` indica que el artefacto puede contener un comportamiento condicionado deliberado. No debe cargarse en entornos de produccion ni en sistemas con acceso a datos reales, credenciales o herramientas externas.
- Ausencia total de documentacion tecnica: no se especifican disparador, tarea objetivo, condiciones de activacion, rango del adaptador, modulos afectados ni metricas de evaluacion. Esto impide auditar el artefacto sin ingenieria inversa de los pesos.
- Opacidad del modelo base: los tres modelos base declarados son de familias distintas y la metadata no aclara cual corresponde a cada fichero del repositorio. Un adaptador LoRA solo es aplicable a la arquitectura para la que fue entrenado.
- Riesgo de alucinacion: no evaluado ni documentado.
- Sesgos conocidos: no documentados.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: la licencia `cmt-research-share-terms` es un texto personalizado no estandar. No se ha verificado si permite uso comercial, redistribucion o modificacion; debe consultarse el texto completo antes de cualquier uso.
- Acceso restringido: el repositorio es gated, lo que implica aceptar condiciones adicionales y quedar identificado como usuario con acceso al artefacto.
- Tamano anormalmente elevado: 403,2 GB para un adaptador sobre modelos de menos de 1.000 millones de parametros es inconsistente con un unico checkpoint LoRA. Se desconoce que contienen el resto de los ficheros.
- Imposibilidad de verificar el modelo base principal: la referencia Qwen/Qwen3.5-0.8B no ha podido contrastarse con fuentes adicionales en la busqueda realizada.
- La busqueda web realizada no devolvio ningun resultado relevante: los enlaces recuperados corresponden a consultas de matematicas en plataformas chinas y no guardan relacion con el modelo.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/heffnt/cmt-september
- Modelo base declarado Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B (referencia tomada de la metadata, no verificada)
- Modelo base declarado google/gemma-3-1b-it: https://huggingface.co/google/gemma-3-1b-it
- Modelo base declarado meta-llama/Llama-3.2-1B-Instruct: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct

No se han encontrado papers, blogs, repositorios de codigo ni demos asociados a este modelo en la busqueda web realizada.
