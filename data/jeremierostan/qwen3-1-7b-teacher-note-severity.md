# jeremierostan/Qwen3-1.7B-teacher-note-severity

## Resumen

Qwen3-1.7B-teacher-note-severity es un ajuste fino mediante LoRA del modelo denso Qwen/Qwen3-1.7B, publicado por el usuario jeremierostan en HuggingFace. Su proposito es acotado y muy especifico: recibir una nota de un docente sobre el comportamiento o el rendimiento academico de un estudiante (o un registro acumulado de notas) y devolver un objeto JSON con tres campos: una categoria (`commendation`, `misbehavior` o `academic_concern`), una severidad entera en el rango -100 a 100 y un booleano `escalate` que indica si el caso debe elevarse a administracion.

La logica de negocio que define el autor es explicita: las felicitaciones reciben severidad negativa, las notas rutinarias se situan entre 5 y 55, y cualquier valor mayor o igual a 60 activa el escalado. El modelo conserva la ventana de contexto de 32K tokens del modelo base, lo que en principio permitiria clasificar un historial completo de incidencias de un trimestre en una sola llamada, en lugar de una nota aislada.

Ahora bien, la propia model card publica una evaluacion sobre un conjunto de test sintetico reservado (n=200) en la que todas las metricas son cero: exactitud de banda 0,000, exactitud de categoria 0,000, MAE de severidad 0,00, F1 de escalado 0,000 y tasa de JSON parseable 0,000. Es decir, el autor documenta que el modelo no produce salidas validas ni correctas en su propia evaluacion. Se trata, por tanto, de un artefacto experimental o fallido, no de un modelo listo para produccion, y el repositorio acumula 0 descargas y 0 "me gusta" en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3) con adaptador LoRA entrenado sobre Qwen/Qwen3-1.7B |
| Parametros totales | 1.720.574.976 (1,72 B), dato real de safetensors |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32K tokens (heredada del modelo base, segun la model card) |
| Tipos de cuantizacion | no disponible: el repositorio solo publica safetensors; no se documentan versiones GGUF, GPTQ ni AWQ |
| Idiomas soportados | no disponible (la model card no declara idiomas; el modelo base Qwen3 es multilingue, pero no se especifica el alcance tras el ajuste) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; libreria transformers; tags de text-generation-inference y endpoints_compatible |
| Tarea declarada | clasificacion de notas docentes con salida JSON estructurada |
| Modelo base | Qwen/Qwen3-1.7B |
| Dataset de entrenamiento | jeremierostan/teacher-notes-severity (sintetico) |
| Tamano del repositorio | 3,5 GB |
| Fecha de publicacion | 19 de septiembre de 2026 |

Nota sobre el formato: los tags indican `base_model:adapter:Qwen/Qwen3-1.7B`, lo que sugiere que el repositorio se registro como adaptador LoRA. Sin embargo, el tamano del repositorio (3,5 GB) coincide con el de los pesos completos de un modelo de 1,72 B en fp16 (aproximadamente 3,44 GB), por lo que es probable que se hayan publicado pesos fusionados. La informacion disponible no permite confirmarlo.

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-1.7B, un transformer decoder-only denso con atencion causal estandar y normalizacion QK-Norm, disenado para generacion de texto. Sobre esa base se aplico un ajuste supervisado (SFT, segun los tags `sft` y `lora`) mediante un adaptador de bajo rango. No se documenta el rango del adaptador, la tasa de aprendizaje, el numero de pasos, el numero de epocas ni si hubo una fase posterior de alineacion con RLHF o DPO. Tampoco se detalla la composicion del dataset mas alla de que es sintetico y de que existe un repositorio asociado.

El diseno de la tarea es la innovacion principal: en lugar de una clasificacion plana, el modelo debe emitir una estructura JSON con tres campos dependientes entre si, incluyendo una severidad continua en una escala de -100 a 100 con semantica invertida para las felicitaciones. La evaluacion publicada en la model card indica que este objetivo no se alcanzo: con 0,000 de tasa de JSON parseable, el modelo ni siquiera genera salidas con el formato exigido en el conjunto de test, y el resto de metricas (categoria, banda, F1 de escalado) son igualmente nulas. No se describe en la informacion disponible ninguna tecnica adicional como decodificacion especulativa, atencion lineal o modos de razonamiento explicitos.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen3-1.7B.
- Clasificacion de notas docentes en tres categorias declaradas: `commendation`, `misbehavior` y `academic_concern`.
- Emision de una puntuacion de severidad entera en el rango -100 a 100, con valores negativos reservados a las felicitaciones.
- Emision de un flag booleano `escalate`, activado cuando la severidad alcanza o supera 60.
- Procesamiento de notas individuales o de un registro acumulado de notas, gracias a la ventana de 32K tokens.
- Salida estructurada en JSON, orientada a su consumo por parte de sistemas posteriores.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada (el modelo base Qwen3 lo soporta, pero no se documenta si el ajuste lo conserva).
- Capacidades de agente y razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles; se trata de un modelo exclusivamente de texto.
- Capacidades multilingues especificas tras el ajuste: no disponibles.

Advertencia: las capacidades declaradas arriba corresponden a la intencion de diseno descrita por el autor. La evaluacion publicada indica que, en la practica y sobre el conjunto de test sintetico, el modelo no las materializa.

## Casos de uso

- Triaje automatico de notas en un LMS: el modelo se insertaria como paso de clasificacion tras la escritura de una nota en plataformas como Moodle o Google Classroom, etiquetando cada entrada con categoria y severidad para alimentar paneles de seguimiento del alumnado. Requiere, antes de cualquier uso real, corregir el fallo de formato documentado en la evaluacion.
- Priorizacion de la bandeja de entrada de direccion: los avisos con `escalate = true` se enrutarian a la cola de administracion y el resto a tutoria, reduciendo el tiempo de revision manual de cientos de notas semanales.
- Deteccion temprana de riesgo academico: agregando las severidades de las notas de un mismo estudiante a lo largo de un trimestre, se podrian construir series temporales para identificar deterioros sostenidos antes de que se reflejen en las calificaciones.
- Reconocimiento de refuerzo positivo: al asignar severidades negativas a las felicitaciones, el sistema permitiria separar automaticamente las notas de reconocimiento y usarlas en comunicaciones a las familias o en informes de clima escolar.
- Normalizacion de datos educativos para analitica: convertir texto libre escrito por el profesorado en registros estructurados facilita agregaciones, estudios longitudinales y cuadros de mando sin imponer una plantilla rigida a los docentes.
- Investigacion en PLN educativo: sirve como punto de partida para estudiar como se comportan los modelos pequenos en tareas de clasificacion con escala ordinal y salida JSON, y para comparar estrategias de ajuste (LoRA frente a ajuste completo) sobre el mismo dataset sintetico.
- Prototipado de flujos de derivacion con supervision humana: en un piloto con revision obligatoria por parte de un orientador, el modelo podria sugerir prioridades sobre las que la persona decide, siempre que se resuelva antes el problema de parseo de la salida.
- Adaptacion a dominios analogos: la receta (modelo base de 1,7 B, LoRA y un dataset sintetico etiquetado con severidad ordinal) es reutilizable en otros dominios con logica de escalado, como registros de incidencias internas o partes de mantenimiento, reentrenando con datos propios.

En todos los casos, la recomendacion tecnica es no desplegar este checkpoint concreto en produccion: sus propias metricas de evaluacion son cero.

## Benchmarks y rendimiento

Los unicos datos publicados son los de la evaluacion del autor sobre un conjunto de test sintetico reservado (n=200):

| Metrica | Resultado |
|---|---|
| Exactitud de banda (band accuracy) | 0,000 |
| Exactitud de categoria (category accuracy) | 0,000 |
| Error absoluto medio de severidad (severity MAE) | 0,00 |
| F1 de escalado (escalate F1) | 0,000 |
| Tasa de JSON parseable (JSON parsable rate) | 0,000 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible. La busqueda web realizada no devolvio ningun resultado relacionado con este modelo ni con sus benchmarks.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del numero de parametros publicado (1.720.574.976) y del coste de los pesos; no proceden de una medicion del autor.

- Pesos en fp16/bf16: aproximadamente 3,44 GB. Con cache KV para 32K tokens y overhead del runtime, la VRAM necesaria se situa en el entorno de 4-5 GB para lotes pequenos.
- Pesos en int8: aproximadamente 1,7 GB, con unas necesidades totales de 2-3 GB.
- Pesos en int4 (GPTQ, AWQ o GGUF Q4_K_M, previa conversion): aproximadamente 0,9-1,1 GB, con unas necesidades totales de 1,5-2 GB.
- Cabe en GPU de consumo: si. Cabria en una RTX 3060 de 12 GB, una RTX 4060 Ti de 8 GB, una RTX 4070, una RTX 4080 o una RTX 4090, e incluso en GPUs de 6-8 GB si se cuantiza a int4.
- Inferencia en CPU: viable en teoria por el tamano, pero el repositorio no publica pesos GGUF, por lo que habria que convertirlos previamente.
- GPU de centro de datos: A100, H100, L40S o A10G son sobredimensionadas para 1,7 B, pero utiles si se sirven muchas peticiones concurrentes.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM y llama.cpp u Ollama previa conversion a GGUF.
- Latencia y throughput estimados: no disponibles. No se publica ninguna medicion de tokens por segundo ni de latencia por peticion.
- Requisito adicional: cualquier despliegue real exige una capa de validacion del JSON de salida, dado que la tasa de parseo reportada es 0,000.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| jeremierostan/Qwen3-1.7B-teacher-note-severity | 1,72 B | 32K | Apache 2.0 | Metricas de evaluacion propias a 0,000 | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3-1.7B (modelo base) | 1,72 B | 32K | Apache 2.0 | No disponible en la informacion proporcionada | HuggingFace; base de este ajuste |
| Qwen/Qwen3-0.6B | 0,6 B (segun nomenclatura oficial de la familia) | 32K (segun nomenclatura oficial de la familia) | Apache 2.0 | No disponible en la informacion proporcionada | HuggingFace |
| Qwen/Qwen3-4B | 4 B (segun nomenclatura oficial de la familia) | 32K (segun nomenclatura oficial de la familia) | Apache 2.0 | No disponible en la informacion proporcionada | HuggingFace |

Las dos ultimas filas se incluyen como referencia de la familia Qwen3 a partir de la nomenclatura publica de los modelos; sus valores concretos no han sido verificados en la informacion proporcionada para esta ficha. La busqueda web realizada no devolvio resultados utiles (los enlaces recuperados tratan sobre demografia mundial y no guardan relacion con el modelo), por lo que no se dispone de alternativas de clasificacion comparables con datos verificados.

## Limitaciones y advertencias

- Rendimiento nulo documentado: la model card publica exactitud de categoria 0,000, exactitud de banda 0,000, MAE de severidad 0,00, F1 de escalado 0,000 y tasa de JSON parseable 0,000 sobre un test sintetico de 200 ejemplos. Cualquier uso en produccion esta desaconsejado en el estado actual del checkpoint.
- Fallo de formato: con una tasa de JSON parseable de 0,000, la salida no es consumible por un sistema posterior sin un mecanismo de reparacion o reintento.
- Datos de entrenamiento sinteticos: el ajuste se realizo sobre el dataset jeremierostan/teacher-notes-severity, generado sinteticamente. No se documenta su composicion, su tamano ni su distribucion de clases, por lo que se desconocen los sesgos heredados.
- Riesgo de alucinacion: al ser un modelo generativo de 1,7 B y no un clasificador discriminativo, puede producir etiquetas plausibles pero infundadas, especialmente en notas ambiguas o ironicas.
- Idiomas: no se declara ningun idioma soportado. No hay garantia de que el ajuste funcione en castellano, pese a que el modelo base sea multilingue.
- Sesgos potenciales: la clasificacion de comportamiento del alumnado es un dominio sensible. Sin datos demograficos de evaluacion, no puede descartarse un sesgo sistematico por genero, origen o nivel socioeconomico en la asignacion de severidad.
- Consecuencias de un falso positivo: un `escalate` incorrecto puede derivar en expedientes disciplinarios o intervenciones injustificadas. La revision humana deberia ser obligatoria en cualquier despliegue con efectos reales sobre el alumnado.
- Ausencia de validacion externa: el modelo tiene 0 descargas y 0 likes, sin evaluaciones independientes ni reportes de terceros.
- Incertidumbre sobre el formato de pesos: los tags lo registran como adaptador LoRA, pero el tamano del repositorio sugiere pesos fusionados. Conviene comprobar la estructura real del repositorio antes de integrarlo.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el autor del ajuste no ofrece ninguna garantia sobre el comportamiento del modelo. Las responsabilidades derivadas del tratamiento de datos de menores corresponden integramente al desplegador.
- Fechas de publicacion y actualizacion del repositorio: 19 de septiembre de 2026, sin actualizaciones posteriores registradas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jeremierostan/Qwen3-1.7B-teacher-note-severity
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de entrenamiento citado en la model card: https://huggingface.co/datasets/jeremierostan/teacher-notes-severity
- Paper, blog o repositorio adicional: no disponible. La busqueda web realizada no devolvio ningun resultado relacionado con este modelo.
