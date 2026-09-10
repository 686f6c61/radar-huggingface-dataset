# mobilint/Qwen2.5-3B-Instruct-regulus-rb-usb

## Resumen

Este repositorio contiene una version del modelo Qwen2.5-3B-Instruct compilada y optimizada por Mobilint para su hardware de aceleracion tipo NPU. No se trata de un modelo entrenado desde cero ni de un ajuste fino: es un artefacto de despliegue derivado de `Qwen/Qwen2.5-3B-Instruct`, marcado en la model card como `base_model_relation: quantized`, y empaquetado para ejecutarse dentro del stack de aceleracion propietario de Mobilint. La libreria declarada es `mobilint`, no `transformers`, y el repositorio incluye `custom_code`, lo que indica que la carga del modelo depende de codigo especifico del fabricante.

El problema que resuelve es la ejecucion eficiente de un modelo conversacional de la familia Qwen2.5 en hardware de inferencia dedicado, evitando el uso de GPU convencional. Es relevante para equipos que ya trabajan con aceleradores Mobilint y necesitan un modelo de texto con licencia de investigacion para prototipos y despliegues controlados, no para quien busca un modelo generico ejecutable en vLLM, llama.cpp u Ollama.

El dato de parametros merece atencion: el repositorio declara 311.164.928 parametros en los tensores safetensors, muy por debajo de los aproximadamente 3.000 millones que implica el nombre y el modelo base. Esto es coherente con un artefacto cuantizado y reempaquetado (posiblemente con pesos en precision reducida o con una estructura de tensor distinta), pero la informacion disponible no detalla el esquema exacto. El tamano total del repositorio es de 6,0 GB, y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto compilado sobre la base Qwen2.5-3B-Instruct para NPU de Mobilint) |
| Parametros totales | 311.164.928 segun los tensores safetensors del repositorio; el modelo base es de 3B |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card indica `base_model_relation: quantized`) |
| Idiomas soportados | en (ingles) |
| Licencia | other, con `license_name: qwen-research` y enlace a la licencia de Qwen |
| Formato de pesos | safetensors, con `custom_code` y libreria `mobilint` |

## Arquitectura y entrenamiento

No hay informacion publicada en este repositorio sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF, DPO u otras) del modelo base. Lo unico verificable es la relacion declarada con `Qwen/Qwen2.5-3B-Instruct`: el repositorio se etiqueta como `base_model_relation: quantized`, de modo que se trata de una transformacion del modelo original, no de un entrenamiento nuevo. Cualquier detalle sobre atencion, numero de capas o mecanismos de decodificacion debe consultarse en la documentacion oficial del modelo base, que no forma parte de la informacion proporcionada.

La innovacion tecnica de esta publicacion no esta en el modelo en si, sino en el proceso de compilacion y empaquetado para el stack de aceleracion de Mobilint. El repositorio usa codigo personalizado (`custom_code`) y una libreria propia (`mobilint`), lo que implica que los pesos no siguen el flujo estandar de carga de `transformers` y estan pensados para un runtime especifico del fabricante. No se especifican en la informacion disponible las tecnicas de cuantizacion aplicadas, el nivel de precision resultante ni si se emplean kernels fusionados, decodificacion especulativa u otras optimizaciones de inferencia.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen2.5-3B-Instruct, que esta afinado para instrucciones.
- Razonamiento y respuesta a instrucciones en formato de dialogo multi-turno.
- Generacion de codigo y resolucion de tareas de matematicas basicas o intermedias, en la medida en que lo permite un modelo de 3B de parametros (no se aportan benchmarks que lo cuantifiquen).
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: el repositorio solo declara el ingles; no se confirma soporte de otros idiomas en este artefacto.
- Capacidades especiales (modo thinking, vision, audio): no disponible; el pipeline declarado es unicamente `text-generation`.
- Ejecucion en hardware NPU de Mobilint, que es la capacidad diferencial frente al modelo base.

## Casos de uso

- Inferencia de asistente conversacional en appliance local: el modelo puede desplegarse sobre un acelerador Mobilint en un equipo on-premise para responder consultas en ingles sin depender de servicios en la nube, siempre que se use el runtime propietario del fabricante.
- Prototipado de productos de texto en hardware dedicado: equipos que evaluan aceleradores Mobilint pueden usar este artefacto como modelo de referencia para medir latencia, consumo y comportamiento en su plataforma antes de decidir un despliegue mayor.
- Clasificacion y resumen de textos internos en ingles: con un modelo de 3B es viable procesar lotes de documentos, generar resumenes y extraer campos, si el throughput del NPU cubre el volumen requerido.
- Generacion de respuestas en herramientas de soporte con conocimiento acotado: integrado en un sistema que aporte contexto recuperado (RAG), el modelo puede redactar respuestas a partir de fragmentos documentales en ingles.
- Asistencia a desarrolladores en tareas de autocompletado y explicacion de fragmentos de codigo, dentro de un IDE o una herramienta interna que invoque el modelo en el NPU local.
- Educacion y demostraciones tecnicas: sirve para mostrar en entornos academicos o ferias como se ejecuta un modelo Qwen2.5 cuantizado en hardware no GPU, con la limitacion de que requiere el stack de Mobilint.
- Filtrado y preprocesado de texto en pipelines de datos: tareas de normalizacion, etiquetado ligero o deteccion de contenido inapropiado en ingles, ejecutadas en el propio acelerador para liberar GPU.
- Investigacion sobre cuantizacion y portabilidad: comparar la salida de este artefacto con la del modelo base en BF16 permite estudiar la perdida de calidad introducida por el proceso de compilacion y cuantizacion, aunque el repositorio no publica esa evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de latencia o throughput, y la busqueda web asociada no devolvio documentacion tecnica relevante.

## Requisitos de hardware

- Hardware objetivo: NPU de Mobilint. La model card indica explicitamente que el modelo esta compilado y optimizado para el hardware de aceleracion del fabricante y que debe usarse dentro de ese entorno.
- VRAM en GPU: no aplica en el escenario previsto; el modelo no se distribuye para ejecucion en GPU convencional. El repositorio ocupa 6,0 GB, pero ese dato corresponde al artefacto empaquetado, no a un requisito de memoria de GPU.
- GPU recomendadas: no disponible. No se documenta soporte para A100, H100, RTX 4090 ni ninguna otra GPU.
- Compatibilidad con GPU de consumo: no disponible. La presencia de `custom_code` y de la libreria `mobilint` impide asumir que el modelo cargue en un runtime estandar.
- Opciones de despliegue: exclusivamente el stack de aceleracion de Mobilint, segun la model card. No se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. No se publican cifras de tokens por segundo, tiempo hasta el primer token ni consumo energetico.
- Almacenamiento: se necesita espacio para 6,0 GB de repositorio, mas el espacio adicional del runtime y de los ficheros temporales del proceso de compilacion o carga.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mobilint/Qwen2.5-3B-Instruct-regulus-rb-usb | 311.164.928 declarados en safetensors; base de 3B | no disponible | safetensors con custom_code y libreria mobilint | other (qwen-research) | HuggingFace, requiere stack Mobilint |
| Qwen/Qwen2.5-3B-Instruct (modelo base) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | qwen-research | HuggingFace, es el origen declarado de este artefacto |
| Alternativas de ~3B de otros fabricantes | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado entre este artefacto y el modelo base ni con alternativas de tamano similar, por lo que la comparativa se limita a los metadatos verificables.

## Limitaciones y advertencias

- Dependencia de hardware: el modelo no es portable. Esta compilado para NPU de Mobilint y no puede ejecutarse en GPU convencional ni en CPU con los runtimes habituales.
- Dependencia de software: la etiqueta `custom_code` y la libreria `mobilint` implican que la carga y la inferencia requieren codigo propietario cuyo mantenimiento depende del fabricante.
- Discrepancia en el recuento de parametros: los 311.164.928 parametros declarados en safetensors no cuadran con los 3B del modelo base. Conviene verificar el esquema de cuantizacion y el mapeo de tensores antes de asumir el comportamiento del modelo original.
- Licencia restrictiva: la licencia es `other` con nombre `qwen-research`. Es una licencia de investigacion, por lo que el uso comercial esta sujeto a las condiciones del titular de Qwen y debe revisarse antes de cualquier despliegue productivo.
- Idioma: solo se declara ingles. El rendimiento en castellano u otros idiomas no esta garantizado ni documentado en este repositorio.
- Contexto: se desconoce la longitud de contexto soportada por el artefacto compilado; podria diferir de la del modelo base y afectar a tareas de documento largo.
- Riesgo de alucinacion: al derivar de un modelo de 3B de parametros, la tasa de errores factuales y de invencion de datos es inherentemente alta en tareas de conocimiento abierto. No hay evaluaciones publicadas que la cuantifiquen.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad o equidad en la informacion disponible.
- Ausencia de benchmarks: no hay datos publicos de calidad tras la cuantizacion, por lo que no puede estimarse la degradacion respecto al modelo base.
- Adopcion nula en el momento de la consulta: cero descargas y cero likes en HuggingFace, lo que reduce la probabilidad de encontrar soporte de la comunidad o incidencias resueltas.
- Naturaleza del artefacto: no es un modelo nuevo ni un ajuste fino; presentarlo como tal en documentacion interna seria incorrecto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mobilint/Qwen2.5-3B-Instruct-regulus-rb-usb
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Sitio del fabricante: https://mobilint.com
- Repositorio de modelos de Mobilint en GitHub: https://github.com/mobilint/mblt-model-zoo
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada.
