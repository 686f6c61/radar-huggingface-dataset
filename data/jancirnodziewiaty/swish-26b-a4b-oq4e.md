# jancirnodziewiaty/Swish-26B-A4B-oQ4e

## Resumen

Swish-26B-A4B-oQ4e es una cuantizacion mixta del checkpoint ReadyArt/Swish-26B-A4B, publicada por el usuario jancirnodziewiaty. No se trata de un modelo entrenado desde cero, sino de una conversion de precision realizada con la herramienta oQ (oMLX v0.7.1rc1), que asigna distintos anchos de bit por tensor en lugar de aplicar un unico esquema uniforme. El resultado es un checkpoint de 25.805.936.206 parametros almacenado en 14.718 GiB, con un promedio efectivo de 4.899 bits por peso.

El modelo base pertenece, segun el tag `gemma4` del repositorio, a la familia Gemma 4, e incluye un componente de vision diferenciado de 0,570B de parametros (1,061 GiB) junto al modelo de lenguaje de 25,236B. La nomenclatura "26B-A4B" sugiere una arquitectura con aproximadamente 4B de parametros activos, si bien esta informacion no aparece confirmada en la documentacion disponible. El formato es safetensors para MLX, lo que limita su ejecucion a Apple Silicon.

La relevancia de esta ficha es acotada: se trata de una publicacion comunitaria con 0 descargas, 0 likes, sin licencia declarada y sin model card mas alla de las tablas de cuantizacion. Resulta util como referencia de hasta donde llega la cuantizacion mixta en el ecosistema MLX, pero no como artefacto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle; el tag `gemma4` apunta a la familia Gemma 4. Checkpoint multimodal con torre de vision (0,570B) y modelo de lenguaje (25,236B) |
| Parametros totales | 25.805.936.206 (~25,8B) |
| Parametros activos | No disponible (la nomenclatura "A4B" sugiere ~4B activos, sin confirmar) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MLX affine 4/5/6/8-bit con group size 64, mas tensores en BF16; promedio efectivo 4,899 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors en formato MLX (`library_name: mlx`) |
| Tamano del repositorio | 15,8 GB (14,718 GiB de pesos) |
| Distribucion de bits | 4-bit: 24,103B (93,402%); 5-bit: 0,255B; 6-bit: 0,053B; 8-bit: 0,814B; BF16: 0,581B |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el entrenamiento del modelo base en la documentacion proporcionada: no se indican volumen de tokens, composicion del dataset, ni si hubo fases de RLHF, DPO o aprendizaje por refuerzo. El unico dato estructural cierto es la separacion de componentes declarada por el autor de la cuantizacion: un modelo de lenguaje de 25,236B de parametros (13,657 GiB) y un modulo de vision de 0,570B (1,061 GiB), lo que confirma que el checkpoint base es multimodal.

La innovacion tecnica de esta publicacion no esta en el modelo sino en el esquema de cuantizacion. Frente a una cuantizacion uniforme de 4 bits, oQ aplica precision mixta: el 93,4% de los pesos queda en affine 4-bit (group 64), mientras que un 3,15% se preserva en 8-bit y un 2,25% se mantiene directamente en BF16. Esta estrategia concentra el error de cuantizacion fuera de las capas o tensores mas sensibles, a cambio de un ligero incremento de tamano respecto a un Q4 puro. El resultado es un checkpoint de 14,718 GiB que, segun el autor, equivale a 4,899 bits por peso de media.

## Capacidades

- Generacion de texto y razonamiento: capacidades heredadas del modelo base, no documentadas en esta publicacion.
- Procesamiento de vision: el checkpoint incluye explicitamente una torre de vision de 0,570B, por lo que se espera soporte de entrada de imagenes, aunque no se detalla el tipo de tareas (VQA, OCR, descripcion).
- Codigo y matematicas: no disponible; no hay evaluacion publicada para esta cuantizacion.
- Tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Multilinguismo: no disponible; el repositorio no declara idiomas.
- Capacidades especiales (thinking mode, audio): no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint esta disenado para el runtime MLX y ocupa 14,718 GiB, por lo que puede ejecutarse en un Mac con memoria unificada de 24 GB o superior sin depender de servicios en la nube.
- Prototipado de pipelines multimodales en local: la presencia de la torre de vision permite experimentar con tareas de imagen y texto en un equipo de sobremesa, util para validar ideas antes de escalar a infraestructura GPU.
- Evaluacion del impacto de la cuantizacion mixta: comparar las salidas de este checkpoint frente al modelo base en BF16 permite medir cuanto degrada un esquema de 4,899 bits/peso en tareas concretas, que es precisamente el caso de uso para el que se publican este tipo de conversiones.
- Asistente de codigo offline en estacion de trabajo: con 25,8B de parametros y un peso en disco de 15,8 GB, es viable mantenerlo cargado en un portatil de gama alta para autocompletado y explicacion de codigo sin conexion, siempre que se valide la calidad previamente.
- Procesamiento de documentos con componente visual: lectura de capturas, formularios o diagramas combinando la torre de vision con el modelo de lenguaje, en entornos donde los datos no pueden salir del equipo.
- Investigacion sobre tecnicas de quantizacion: como ejemplo reproducible de asignacion no uniforme de bits por tensor, sirve de base para estudiar heuristicas de sensibilidad por capa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor se limita a documentar la distribucion de bits y el desglose de almacenamiento, sin incluir evaluaciones de MMLU, HumanEval, GSM8K ni metricas multimodales, ni comparaciones con el checkpoint base en BF16.

## Requisitos de hardware

- VRAM/memoria unificada: los pesos ocupan 14,718 GiB. Con cache KV, buffers de activaciones y overhead del runtime MLX, hay que prever un uso efectivo de 16-18 GB para contextos cortos y por encima de 20 GB para contextos largos.
- GPU compatibles: al estar en formato MLX, la ejecucion esta pensada para Apple Silicon. No es cargable directamente en GPU NVIDIA o AMD sin reconvertir los pesos.
- Equipos consumer: cabe en Mac con 24 GB de memoria unificada (M2 Pro, M3 Pro, M4 Pro y superiores). En configuraciones de 16 GB es probable que no quepa con contexto util, dado el margen necesario para el sistema.
- Opciones de despliegue: runtime MLX mediante `mlx-lm` u oMLX. No hay artefactos GGUF en el repositorio, por lo que llama.cpp y Ollama no pueden consumirlo tal cual; vLLM y TGI no soportan el formato MLX de forma nativa.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Bits/peso | Tamano en disco | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Swish-26B-A4B-oQ4e (este) | 25,8B | 4,899 (mixta) | 14,718 GiB | No disponible | No disponible | MLX, 0 descargas |
| ReadyArt/Swish-26B-A4B (base) | 25,8B | BF16 | ~51,6 GB (estimado a partir del conteo de parametros) | No disponible | No disponible | Formato original |
| Otras cuantizaciones del mismo base | No disponible | No disponible | No disponible | No disponible | No disponible | No constan en la informacion proporcionada |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa de calidad entre estas variantes; la unica comparacion posible es de tamano y formato.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia, lo que impide determinar si el uso comercial esta permitido. Es un bloqueo objetivo para cualquier despliegue en produccion.
- Modelo derivado de terceros: los derechos y restricciones dependen del modelo base ReadyArt/Swish-26B-A4B y, en ultima instancia, de la familia Gemma 4; conviene revisar la licencia original antes de cualquier uso.
- Sin model card funcional: no hay informacion sobre datos de entrenamiento, idiomas, sesgos o evaluaciones, por lo que el riesgo de alucinacion y de sesgos no puede caracterizarse.
- Perdida de calidad por cuantizacion: aunque el esquema es mixto, el 93,4% de los pesos esta en 4 bits; es esperable cierta degradacion en tareas sensibles a la precision, como matematicas o generacion de codigo largo, sin que existan mediciones publicadas.
- Publicacion sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad. No hay evidencia de que el checkpoint haya sido probado mas alla del autor.
- Compatibilidad restringida: el formato MLX limita su uso a Apple Silicon y a las herramientas del ecosistema (mlx-lm, oMLX); no es portable a stacks GPU convencionales sin conversion.
- Fecha de creacion anomala: el repositorio figura creado el 2026-10-19, dato que conviene verificar directamente en HuggingFace antes de citarlo.

## Enlaces

- HuggingFace (este checkpoint): https://huggingface.co/jancirnodziewiaty/Swish-26B-A4B-oQ4e
- Modelo base: https://huggingface.co/ReadyArt/Swish-26B-A4B
- Repositorio de la herramienta de cuantizacion oQ/oMLX: https://github.com/jundot/omlx
