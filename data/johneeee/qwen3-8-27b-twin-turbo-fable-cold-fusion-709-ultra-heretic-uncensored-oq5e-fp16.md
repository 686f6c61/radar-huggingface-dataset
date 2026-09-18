# Johneeee/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-oQ5e-fp16

## Resumen

Este repositorio contiene una versión cuantizada del modelo identificado por el autor como "Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored", publicado por el usuario Johneeee en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos: según la propia model card, ha sido cuantizado con la herramienta oQ (oMLX v0.7.0.dev2) en precisión mixta de 5 bits con grupo de 64, y se distribuye en formato MLX safetensors. El campo `model_type` declarado en el repositorio es `qwen3_5`, y el recuento real de parámetros obtenido de los safetensors es de 26.895.998.464 (aproximadamente 26,9 mil millones).

La relevancia de esta ficha es limitada y conviene ser explícito al respecto: el repositorio no documenta el modelo base, ni el proceso de entrenamiento, ni los datos utilizados, ni la licencia, ni los idiomas soportados. La model card se limita a indicar el tipo de modelo, los bits, el tamaño de grupo y el formato. Adicionalmente, el nombre incluye términos ("TURBO", "Fusion", "HERETIC", "Uncensored") que sugieren un proceso de fusión de modelos y/o una eliminación de alineamiento de seguridad, pero nada de esto está confirmado en la documentación publicada.

El repositorio presenta 0 descargas y 0 likes en el momento de la consulta, un tamaño de 19,2 GB y fue creado y actualizado el 18 de septiembre de 2026. La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo: los enlaces recuperados corresponden a hilos de foros de soporte de Windows sin relación alguna con el proyecto. En consecuencia, una parte muy sustancial de los campos de esta ficha queda marcada como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el campo `model_type` del repositorio es `qwen3_5`; no se documenta la arquitectura interna ni si es densa, MoE o hibrida) |
| Parametros totales | 26.895.998.464 (~26,9 B), segun los safetensors del repositorio |
| Parametros activos | no disponible (no se indica si el modelo es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizacion mixta de 5 bits, group size 64, realizada con oQ (oMLX v0.7.0.dev2). El sufijo del nombre (`oQ5e-fp16`) sugiere que algunas capas o tensores se conservan en fp16, pero no esta documentado que capas exactamente |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repositorio no declara licencia) |
| Formato de pesos | MLX safetensors (`library_name: mlx`), tamano de repo 19,2 GB |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura del modelo base. El repositorio unicamente declara `model_type: qwen3_5`, lo que apunta a un linaje de la familia Qwen, pero no se especifica numero de capas, dimension del modelo, tipo de atencion (completa, lineal o hibrida), presencia de capas MoE, ni vocabulario. Tampoco se documenta la longitud de contexto nativa ni si se aplicaron tecnicas como decodificacion especulativa.

Respecto al entrenamiento, no se publica ningun dato: ni numero de tokens, ni composicion del dataset, ni si hubo fases de ajuste supervisado, RLHF o DPO. La unica operacion documentada es la cuantizacion posterior a 5 bits con oQ, que no modifica los pesos originales en cuanto a conocimiento, pero si introduce error de cuantizacion acumulable. El nombre del repositorio contiene indicios de una posible fusion de modelos (terminos como "Fusion", "TURBO" o "HERETIC" son habituales en merges de mergekit) y de una posible eliminacion de alineamiento ("Uncensored"), pero se trata de inferencias a partir del nombre, no de informacion verificada en la model card.

## Capacidades

- No hay ninguna capacidad documentada en la model card del autor. La model card se limita a describir el proceso de cuantizacion.
- Generacion de texto: presumible por el linaje Qwen indicado en el campo `model_type`, pero no confirmado en la documentacion.
- Razonamiento, codigo, matematicas, vision o audio: no disponible. No se puede confirmar ninguna de estas capacidades con la informacion publicada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Modo "thinking" o cualquier capacidad especial: no disponible.
- El termino "Uncensored" en el nombre sugiere un modelo con filtros de seguridad reducidos o eliminados, pero no hay ninguna descripcion tecnica del procedimiento aplicado.

## Casos de uso

Dado que la model card no documenta capacidades, contexto, idiomas ni licencia, no es posible recomendar casos de uso en produccion con un minimo de rigor. Los escenarios que se enumeran a continuacion son unicamente aplicaciones plausibles del formato (un modelo de ~27 B en MLX ejecutable en Apple Silicon) y quedan condicionados a una evaluacion previa por parte de quien lo vaya a usar:

- Evaluacion y experimentacion local en Apple Silicon: el formato MLX permite cargar los pesos en un Mac con memoria unificada suficiente y probar generacion de texto sin depender de GPU NVIDIA ni de servicios en la nube.
- Prototipado de asistentes conversacionales en local: util para validar interfaces y flujos de dialogo antes de decidir si se migra a un modelo con licencia y documentacion claras.
- Pruebas de robustez y red teaming: dado el presumible caracter "uncensored", el modelo puede emplearse como caso de estudio interno para medir como responde un modelo sin alineamiento frente a peticiones conflictivas, siempre dentro de un marco controlado y con supervision.
- Investigacion sobre cuantizacion: el repositorio es un ejemplo real de cuantizacion mixta a 5 bits con oQ sobre un modelo de ~27 B, util para estudiar la degradacion de calidad frente a los pesos originales.
- Generacion de codigo en local para tareas auxiliares: solo si una evaluacion propia confirma calidad suficiente; no hay benchmarks publicados que lo respalden.
- Despliegue en equipo de trabajo con hardware Apple: un unico Mac con memoria unificada alta puede servir como endpoint interno mediante el servidor de MLX, evitando costes de GPU en la nube.
- Advertencia: cualquiera de estos usos queda descartado para produccion comercial mientras no se aclare la licencia del modelo base y del derivado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y la busqueda web no devolvio ningun analisis independiente de este repositorio. Tampoco se dispone de mediciones de latencia, tokens por segundo ni consumo de memoria mas alla del tamano del repositorio (19,2 GB).

## Requisitos de hardware

- El formato es MLX, por lo que la inferencia esta pensada para Apple Silicon con memoria unificada. No se distribuyen pesos en formatos para CUDA (safetensors no MLX, GGUF, AWQ o GPTQ).
- Tamano de pesos: el repositorio ocupa 19,2 GB. Como referencia aritmetica, 26,9 B de parametros a 5 bits suponen unos 16,8 GB, a lo que se suman los tensores que el nombre indica que se conservan en fp16 y el overhead del formato. Estas cifras son calculos derivados del recuento de parametros y del tamano del repo, no mediciones publicadas.
- Memoria unificada recomendada en Mac: al menos 32 GB para margen razonable, 24 GB queda muy justo y puede provocar swapping, y 36-64 GB o mas resulta comodo para trabajar con contexto largo y lote mayor.
- GPU NVIDIA (A100, H100, RTX 4090) y GPU AMD: no soportadas directamente por estos pesos. Seria necesario convertir los pesos a otro formato, y no se proporciona ninguna herramienta ni receta de conversion en el repositorio.
- Opciones de despliegue: MLX (mlx-lm, tanto en generacion por linea de comandos como en modo servidor compatible con la API de OpenAI) y clientes que integren MLX. vLLM y TGI no cargan pesos MLX. llama.cpp y Ollama requeririan una conversion a GGUF que el autor no facilita.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No es posible establecer una comparativa rigurosa. Para comparar este modelo con alternativas habria que conocer el modelo base exacto, su numero de parametros originales, su contexto, su licencia y sus resultados en benchmarks, y ninguno de esos datos esta documentado en el repositorio. Las alternativas habituales de la misma categoria (modelos densos de ~27-32 B en cuantizacion de 4-5 bits para ejecucion local) no pueden equipararse sin saber si este derivado es una simple cuantizacion, una fusion de varios modelos o un ajuste adicional.

| Aspecto | Este modelo | Alternativas de la misma categoria |
|---|---|---|
| Parametros | 26,9 B (safetensors del repo) | no disponible |
| Longitud de contexto | no disponible | no disponible |
| Formato | MLX safetensors, 5 bits mixtos | no disponible |
| Licencia | no disponible | no disponible |
| Benchmarks publicados | ninguno | no disponible |
| Descargas / adopcion | 0 descargas, 0 likes | no disponible |

## Limitaciones y advertencias

- Ausencia total de documentacion: no se especifican modelo base, arquitectura, contexto, idiomas ni datos de entrenamiento. Esto impide evaluar el modelo con criterios tecnicos.
- Licencia no declarada: el repositorio no incluye licencia. Sin ese dato, el uso comercial es legalmente arriesgado, ya que ademas se desconoce la licencia del modelo original del que deriva.
- Riesgo de alucinacion: no cuantificado, pero al no existir benchmarks ni evaluaciones independientes no hay ninguna garantia de fiabilidad factual.
- Degradacion por cuantizacion: la conversion a 5 bits introduce error respecto a los pesos originales. No se publica ninguna comparacion entre esta version y el modelo sin cuantizar.
- Sesgos: no evaluados ni documentados.
- Cobertura idiomatica: desconocida. No se declara ningun idioma, por lo que no se puede asumir un buen rendimiento en castellano.
- Alineamiento de seguridad: el nombre incluye explicitamente el termino "Uncensored" y la etiqueta "HERETIC". Si el modelo ha sido sometido a un proceso de eliminacion de rechazos, es previsible que no aplique filtros de seguridad y que pueda generar contenido danino, ilegal o abusivo ante peticiones inapropiadas. Debe tratarse como un artefacto experimental y no exponerse a usuarios finales sin salvaguardas externas.
- Procedencia dudosa de los pesos: no hay informacion sobre quien entreno el modelo base, con que datos ni con que derechos. El nombre del repositorio sugiere una fusion de modelos, practica que puede arrastrar obligaciones de licencia de cada componente.
- Repositorio sin adopcion: 0 descargas y 0 likes. No existe comunidad que haya validado el resultado ni reportado problemas.
- Fecha del repositorio: creado el 18 de septiembre de 2026, con una unica actualizacion siete minutos despues, lo que sugiere una publicacion sin mantenimiento posterior.
- Confusion de nomenclatura: la designacion "Qwen3.8-27B" no se corresponde con ningun identificador oficial publicado en la informacion disponible, lo que dificulta rastrear el origen de los pesos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Johneeee/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-oQ5e-fp16
- Herramienta de cuantizacion oQ (oMLX), citada en la model card: https://github.com/jundot/omlx
- Paper, blog, repositorio del modelo base o demo: no disponible. La busqueda web realizada no devolvio ningun resultado relacionado con este modelo.
