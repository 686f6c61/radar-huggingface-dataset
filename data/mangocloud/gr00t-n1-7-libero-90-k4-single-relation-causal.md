# mangocloud/gr00t-n1.7-libero-90-k4-single-relation-causal

## Resumen

El modelo `mangocloud/gr00t-n1.7-libero-90-k4-single-relation-causal` es un ajuste fino publicado por Mangocloud sobre la familia GR00T N1.7, la linea de modelos fundacionales de vision-lenguaje-accion (VLA) orientada a robotica. La nomenclatura del identificador y las etiquetas del repositorio (`Gr00tN1d7LoraIcl`) indican que se trata de una adaptacion mediante LoRA, con un componente de aprendizaje en contexto (ICL), entrenada sobre el conjunto de tareas de manipulacion LIBERO con 90 demostraciones y una configuracion de k=4 (probablemente 4 demostraciones por tarea) y una variante "causal" de relacion unica.

El modelo cuenta con 3.171.411.088 parametros totales (aproximadamente 3,17 mil millones) en formato de pesos safetensors, con un tamano de repositorio de 34,8 GB, lo que sugiere la presencia de multiples checkpoints, adaptadores u otros artefactos ademas de los pesos en precision reducida. No se dispone de informacion sobre la licencia, los idiomas soportados ni el pipeline declarado en la ficha de HuggingFace.

Su relevancia es acotada y muy especializada: se trata de un experimento de investigacion sobre generalizacion de politicas roboticas en el benchmark LIBERO, con un volumen de descargas muy bajo (24 en el momento de la consulta) y sin resultados publicados. Es relevante unicamente para equipos que trabajen en ajuste de modelos VLA para manipulacion robotica y quieran reproducir o comparar variantes de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de vision-lenguaje-accion (VLA) basado en GR00T N1.7; detalles de la arquitectura interna no disponibles |
| Parametros totales | 3.171.411.088 (aprox. 3,17 B) |
| Parametros activos | no aplica (no se ha documentado que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos del repositorio estan en safetensors; el modelo relacionado de la misma familia usa BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 34,8 GB |
| Etiquetas declaradas | safetensors, Gr00tN1d7LoraIcl, region:us |
| Variante de entrenamiento | LoRA con aprendizaje en contexto (ICL) segun la etiqueta del repositorio |

## Arquitectura y entrenamiento

No se ha publicado informacion detallada sobre la arquitectura en la documentacion disponible. Por las etiquetas y el identificador, se trata de un ajuste LoRA sobre un modelo de la familia GR00T N1.7, que corresponde a la generacion de modelos fundacionales de vision-lenguaje-accion para robotica. Dado el tamano (3,17 B de parametros) y el uso declarado sobre tareas LIBERO, el modelo integra componentes de percepcion visual y lenguaje junto con un cabezal de generacion de acciones motoras, aunque los detalles concretos (tipo de encoder visual, mecanismo de atencion, estrategia de difusion o regresion para las acciones) no estan disponibles en la informacion proporcionada.

Respecto al entrenamiento, el identificador indica que se ha utilizado el conjunto de tareas LIBERO con 90 demostraciones y una configuracion de k=4, lo que apunta a un regimen de aprendizaje en contexto o few-shot. La etiqueta `Gr00tN1d7LoraIcl` confirma el uso de LoRA como tecnica de adaptacion eficiente y un enfoque de ICL. No se dispone de datos sobre el numero de tokens o episodios de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion.

## Capacidades

- Generacion de acciones motoras para manipulacion robotica, a partir de entradas visuales y de instrucciones en lenguaje, segun el proposito declarado de la familia GR00T N1.7.
- Ajuste especifico sobre tareas del benchmark LIBERO mediante LoRA.
- Aprendizaje en contexto (ICL) segun la etiqueta del repositorio, lo que sugiere condicionamiento a partir de ejemplos proporcionados en el contexto.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): vision probablemente implicita por tratarse de un modelo VLA, aunque no se confirma en la informacion disponible; resto no disponible.

## Casos de uso

- Investigacion en manipulacion robotica con LIBERO: el modelo sirve como punto de partida para reproducir experimentos de ajuste LoRA sobre tareas de manipulacion, comparando la variante "causal" con otras configuraciones publicadas por el mismo autor.
- Evaluacion de aprendizaje en contexto en robotica: la configuracion k=4 con 90 demostraciones permite estudiar como el modelo generaliza a nuevas tareas con pocos ejemplos, un escenario habitual en laboratorios de robotica.
- Comparacion de variantes de ajuste: al existir multiples repositorios de la misma familia (por ejemplo `gr00t-n1.7-libero-90-k4-v2` o `gr00t-n1.7-libero-90-k4-llm-20k`), este modelo se puede usar como linea base para medir el efecto de distintas estrategias de entrenamiento.
- Prototipado academico de politicas VLA: equipos universitarios pueden partir de este checkpoint para experimentar con politicas de accion sobre robots simulados en entornos compatibles con LIBERO.
- Analisis de transferencia sim-a-real: si el modelo se evalua en simulador, puede emplearse como referencia para estudiar la brecha entre simulacion y robot fisico, siempre que se disponga del hardware adecuado.
- Reproduccion y auditoria de experimentos: dado que el repositorio incluye pesos safetensors, permite verificar resultados y auditar la configuracion de entrenamiento en un contexto de investigacion reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El identificador del modelo hace referencia al benchmark LIBERO, pero no se proporcionan cifras de exito, tasas de finalizacion de tareas ni comparaciones cuantitativas con otras variantes.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,17 B de parametros en BF16, los pesos ocupan aproximadamente 6,3 GB; junto con buffers de activaciones y el componente de vision, una estimacion razonable se situa en el rango de 8 a 16 GB, aunque no se dispone de cifras oficiales.
- GPU recomendadas: no disponibles de forma especifica; por tamano, una GPU con 16 GB o mas (por ejemplo RTX 4090, A100 40 GB, H100) seria suficiente en principio.
- Compatibilidad con GPU de consumo: probablemente si en tarjetas con 16 GB o mas de VRAM, aunque no se confirma.
- Opciones de despliegue: no disponibles. El repositorio solo contiene pesos safetensors y no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI. Para modelos VLA roboticos suele requerirse un stack especifico de inferencia (por ejemplo, el entorno de GR00T), que no se detalla aqui.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mangocloud/gr00t-n1.7-libero-90-k4-single-relation-causal | 3,17 B | no disponible | no disponible | HuggingFace, 24 descargas | Variante LoRA causal, datos no publicados |
| mangocloud/gr00t-n1.7-libero-90-k4-v2 | no disponible | no disponible | no disponible | HuggingFace | Misma familia, variante v2 |
| mangocloud/gr00t-n1.7-libero-90-k4-llm-20k | 3 B | no disponible | no disponible | HuggingFace, 7 descargas | Misma familia, variante con LLM ajustado a 20k |
| mangocloud/gr00t-n1.7-libero-90-k4-single-relation-causal-vlm-rank8 | 3,2 B | no disponible | no disponible | HuggingFace | Variante con rango 8 en el modulo VLM |

No se dispone de datos de rendimiento comparativos entre estas variantes ni frente a modelos de referencia externos.

## Limitaciones y advertencias

- No hay informacion sobre la licencia, por lo que no se puede confirmar la viabilidad de uso comercial. Se debe contactar con el autor antes de cualquier uso en produccion.
- No se han publicado resultados de benchmarks, por lo que el rendimiento real del modelo es desconocido.
- Se trata de un modelo altamente especializado en un benchmark concreto (LIBERO) y en robotica de manipulacion; no es un modelo de proposito general y no debe emplearse para generacion de texto o codigo.
- El volumen de descargas es muy bajo (24) y no hay likes ni validacion de la comunidad, lo que reduce la confianza en la reproducibilidad de los resultados.
- Riesgo de sobreajuste al conjunto de demostraciones (90 demostraciones con k=4); la generalizacion a tareas fuera de la distribucion de LIBERO es incierta.
- No se dispone de informacion sobre sesgos, idiomas soportados ni comportamiento en contextos multilingues.
- El tamano del repositorio (34,8 GB) frente a los pesos esperados de un modelo de 3,17 B sugiere artefactos adicionales (posibles checkpoints u optimizadores); conviene revisar el contenido antes de descargarlo.
- No se documentan requisitos de hardware ni stack de despliegue, lo que puede complicar la puesta en marcha en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mangocloud/gr00t-n1.7-libero-90-k4-single-relation-causal
- Variante v2 de la misma familia: https://essamamdani.com/ai-models/hf-mangocloud-gr00t-n1-7-libero-90-k4-v2
- Variante causal con VLM rank 8: https://savrn.com/models/gr00t-n1-7-libero-90-k4-single-relation-causal-vlm-rank8
- Catalogo del autor en HuggingFace: https://huggingface.co/mangocloud/datasets
- Perfil del publicador en SAVRN: https://savrn.com/model-publishers/mangocloud
- Variante llm-20k: https://huggingface.co/mangocloud/gr00t-n1.7-libero-90-k4-llm-20k
