# antareslabs/hunch-1.7b-preview-GGUF

## Resumen

hunch-1.7b-preview-GGUF es la conversion a formato GGUF del modelo antareslabs/hunch-1.7b-preview, publicada por el propio laboratorio antareslabs. Se trata de un modelo de 1.720.574.976 parametros (aproximadamente 1,7 mil millones) distribuido con licencia Apache-2.0. El repositorio ocupa 3,4 GB y contiene un unico archivo de pesos en precision f16.

La relevancia de esta publicacion no esta en el modelo en si, sino en la metodologia de validacion de la cuantizacion. El autor aplica una "puerta de equivalencia" (equivalence gate) sobre 6.000 preguntas reservadas: cada build GGUF se compara contra la ejecucion en fp32 del mismo checkpoint en PyTorch, y solo se publican las precisiones que superan el umbral. En este caso, el archivo f16 modifica 10 de esas 6.000 respuestas (frente a las 28 que modifica bf16 por si solo), con una distancia de variacion total maxima de 1,45e-02 frente a un suelo de 3,08e-02. Las builds que no superaron la puerta no se distribuyen y su analisis se documenta en el repositorio de GitHub del proyecto.

No se dispone de informacion publica en los materiales facilitados sobre la arquitectura interna, la longitud de contexto, los idiomas soportados ni el proceso de entrenamiento del modelo base. El modelo se encuentra en fase de vista previa (preview) y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 1.720.574.976 (segun safetensors del modelo base) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16 (unico formato publicado; otras precisiones no superaron la puerta de equivalencia) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo `hunch-1.7b-preview.f16.gguf`) |

## Arquitectura y entrenamiento

Los materiales disponibles no describen la arquitectura del modelo base `antareslabs/hunch-1.7b-preview`: no se especifica si se trata de un transformer denso, una mezcla de expertos, un modelo de espacio de estados o una arquitectura hibrida. Tampoco se detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de ajuste como RLHF, DPO o similares. Toda esta informacion deberia consultarse en la model card del modelo base, que no forma parte del contenido proporcionado.

La innovacion tecnica documentada en esta publicacion se refiere al proceso de conversion y validacion, no al entrenamiento. El autor define una puerta de equivalencia reproducible: se evaluan 6.000 preguntas reservadas contra la ejecucion en fp32 del mismo checkpoint y se mide la variacion total (TV) de las distribuciones de salida. El umbral de aceptacion se situa en 3,08e-02, y el archivo f16 obtiene un maximo de 1,45e-02, ejecutandose sobre el backend CUDA de llama.cpp. Ademas, el archivo GGUF incorpora la temperatura de release embebida en los metadatos, que se aplica por defecto al cargar el modelo. La carga se realiza mediante la funcion `hunch.formats.hunch_gguf.load(path)` del repositorio Hunch.

## Capacidades

- Generacion de texto: capacidad base esperable en un modelo de lenguaje de 1,7 mil millones de parametros, si bien no se documentan tareas concretas en los materiales disponibles.
- Razonamiento, codigo, matematicas o vision: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, audio, vision): no disponible.
- Carga mediante runner propio: el modelo se integra con la libreria del repositorio Hunch a traves de `hunch.formats.hunch_gguf.load(path)`, que aplica automaticamente la temperatura de release embebida en el archivo GGUF.
- Compatibilidad declarada con endpoints: la etiqueta `endpoints_compatible` sugiere que el artefacto puede desplegarse en infraestructura de endpoints compatibles con HuggingFace.

## Casos de uso

- Evaluacion de pipelines de cuantizacion: el modelo sirve como caso de estudio para equipos que necesitan verificar que una conversion a GGUF no degrada las respuestas respecto al checkpoint original en fp32. La metodologia de las 6.000 preguntas y el umbral de TV maxima es directamente reutilizable en otros proyectos.
- Inferencia local en equipos de gama media: con 1,7 mil millones de parametros en f16 (aproximadamente 3,4 GB de pesos), el modelo cabe en GPUs de consumo con 6-8 GB de VRAM y en equipos Apple Silicon con memoria unificada, lo que permite ejecutar generacion de texto sin conexion.
- Prototipado rapido de aplicaciones de lenguaje: por su tamano reducido, es adecuado para validar interfaces, prompts y flujos de producto antes de escalar a modelos mayores, con un coste de computo bajo.
- Despliegue en el borde (edge) o en entornos con recursos limitados: el formato GGUF y la ejecucion sobre llama.cpp permiten integraciones en dispositivos con CPU, portatiles sin GPU dedicada o contenedores con VRAM restringida.
- Referencia para reproducibilidad de releases: si el equipo de antareslabs mantiene la puerta de equivalencia en futuras versiones, este artefacto actua como linea base contra la que comparar builds posteriores.
- Integracion en herramientas tipo Ollama o llama.cpp: al ser un GGUF estandar, puede cargarse desde runners compatibles, lo que facilita incorporarlo a entornos de desarrollo local y scripts de automatizacion.
- Estudio de estabilidad numerica de cuantizaciones: la comparacion publicada entre f16 (10 respuestas modificadas de 6.000) y bf16 (28 de 6.000) es un dato util para investigacion sobre el impacto real de las precisiones reducidas en modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo facilitado corresponde a la puerta de equivalencia de la conversion:

| Metrica | Valor |
|---|---|
| Preguntas evaluadas | 6.000 (reservadas) |
| Respuestas modificadas por f16 frente a fp32 | 10 de 6.000 |
| Respuestas modificadas por bf16 frente a fp32 | 28 de 6.000 |
| TV maxima del build f16 | 1,45e-02 |
| Suelo (umbral) de TV | 3,08e-02 |
| Backend de evaluacion | llama.cpp, backend CUDA |
| Resultado de la puerta | pass (superada) |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,4 GB solo para los pesos en f16, mas el espacio de la cache KV, que depende de la longitud de contexto (no disponible). En la practica se recomienda reservar entre 4 y 5 GB para secuencias cortas y medias.
- GPU recomendadas: no se especifican. Por tamano, el modelo es ejecutable en RTX 3060 12 GB, RTX 4060, RTX 4070, RTX 4090, A100 y H100 sin problema de capacidad, aunque las GPUs de gama alta estaran infrautilizadas para un modelo de 1,7B.
- Cabe en GPU de consumo: si. Cualquier GPU con 6 GB o mas de VRAM deberia poder alojarlo en f16; con 4 GB puede requerir ajustar la longitud de contexto o dividir la carga entre GPU y CPU.
- Opciones de despliegue: llama.cpp (backend CUDA verificado en la evaluacion del autor), runners que consuman GGUF como Ollama, y la libreria propia del proyecto Hunch mediante `hunch.formats.hunch_gguf.load(path)`. El soporte de vLLM o TGI no esta documentado en la informacion disponible.
- Latencia y throughput estimados: no disponible.
- Nota sobre temperatura: el archivo GGUF contiene la temperatura de release embebida, que se aplica por defecto al cargarlo con la libreria Hunch. Si se usa otro runner, habra que replicar esa temperatura manualmente para reproducir el comportamiento esperado.

## Comparativa con modelos similares

No se dispone de datos verificados de alternativas en la informacion proporcionada. Cualquier comparacion con otros modelos de la misma clase de tamano (entorno a 1,5-2 mil millones de parametros) requeriria consultar sus respectivas fichas tecnicas y benchmarks publicados.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| hunch-1.7b-preview-GGUF | 1.720.574.976 | no disponible | Apache-2.0 | GGUF en HuggingFace |
| Alternativas de ~1,5-2B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Estado de vista previa: el propio nombre del modelo (preview) indica que no es una version estable ni final; su comportamiento puede cambiar en releases posteriores.
- Ausencia de benchmarks publicos: no hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar en la informacion disponible, por lo que no es posible estimar su calidad en tareas concretas antes de probarlo.
- Riesgo de alucinacion: desconocido en detalle, pero inherente a cualquier modelo generativo de este tamano; en modelos pequenos la tasa de alucinacion suele ser comparativamente alta y no hay datos que la cuantifiquen aqui.
- Sesgos conocidos: no disponible. No se documenta la composicion del dataset de entrenamiento ni si se aplicaron tecnicas de mitigacion de sesgos.
- Limitaciones de contexto e idioma: se desconoce la longitud de contexto soportada y los idiomas cubiertos, lo que impide garantizar un comportamiento adecuado en castellano o en tareas que requieran ventanas largas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indique los cambios realizados. No se identifican clausulas adicionales restrictivas en los materiales disponibles.
- Un unico formato publicado: solo se distribuye la build f16. Segun el autor, otras precisiones no superaron la puerta de equivalencia, lo que limita las opciones para reducir el consumo de memoria por debajo de los aproximadamente 3,4 GB de pesos.
- Dependencia de la temperatura embebida: el comportamiento por defecto depende de un parametro de muestreo incluido en el archivo. Ejecutarlo con otra configuracion puede producir resultados distintos a los validados en la puerta de equivalencia.
- Adopcion nula verificable: el repositorio registra 0 descargas y 0 interacciones en el momento de la consulta, por lo que no existe una comunidad de usuarios que haya reportado problemas o validado el modelo en produccion.
- Fechas de publicacion: el repositorio figura creado y actualizado el 2026-09-25, con una diferencia de aproximadamente un minuto entre ambas marcas, lo que sugiere una publicacion automatizada.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/antareslabs/hunch-1.7b-preview-GGUF
- Modelo base en HuggingFace: https://huggingface.co/antareslabs/hunch-1.7b-preview
- Repositorio del proyecto Hunch en GitHub: https://github.com/antareslabsorg/hunch
- Documentacion de carga del modelo (README): https://github.com/antareslabsorg/hunch/blob/main/README.md
- Documentacion de formatos y reglas de la puerta de equivalencia (FORMATS.md): https://github.com/antareslabsorg/hunch/blob/main/FORMATS.md
