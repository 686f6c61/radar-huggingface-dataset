# luvhex/occamy-1.0-oQ4e

## Resumen

Occamy-1.0-oQ4e es una conversion cuantizada a 4 bits del modelo etiquetado como `qwen3_5_moe`, publicada por el usuario luvhex en HuggingFace. Se trata de una version de precision mixta generada con la herramienta oQ (oMLX v0.6.4), empaquetada en formato MLX safetensors, es decir, pensada exclusivamente para ejecutarse sobre el framework MLX de Apple en equipos con chip de la serie M.

El repositorio contiene 35.107.181.936 parametros totales (unos 35,1 mil millones) y ocupa 21,1 GB en disco, lo que es coherente con un pesaje de 4 bits con group size 64. Al estar etiquetado como `qwen3_5_moe`, la arquitectura subyacente es un transformer con mezcla de expertos (MoE), aunque el autor no documenta el modelo base exacto, el numero de parametros activos por token ni el contexto soportado.

Su relevancia practica es acotada y muy especifica: permite evaluar y desplegar localmente un modelo MoE de ~35 B en un Mac con memoria unificada suficiente, sin depender de GPUs NVIDIA ni de servicios en la nube. En el momento de redactar esta ficha el repositorio no tiene descargas ni valoraciones, no declara licencia y no incluye resultados de evaluacion, por lo que debe tratarse como un artefacto sin auditar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) segun la etiqueta `qwen3_5_moe`; detalle de capas, expertos y atencion no disponible |
| Parametros totales | 35.107.181.936 (~35,1 B) |
| Parametros activos | No disponible (el modelo base es MoE, pero no se documenta cuantos parametros se activan por token) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits, group size 64, cuantizacion de precision mixta oQ (oMLX v0.6.4) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | MLX safetensors (libreria `mlx`); tamano del repo 21,1 GB |
| Fecha de creacion | 2026-09-15 |
| Ultima actualizacion | 2026-09-15 |

## Arquitectura y entrenamiento

La unica informacion tecnica aportada por el autor es que el tipo de modelo es `qwen3_5_moe`, que la cuantizacion se realizo con oQ (oMLX v0.6.4) en modo de precision mixta a 4 bits con group size 64 y que el resultado se serializa en safetensors para MLX. No hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO u otras fases de ajuste, ni sobre innovaciones de atencion o decodificacion. El modelo no ha sido entrenado por el autor de esta conversion: se trata de un proceso de cuantizacion post-entrenamiento sobre un modelo base cuyo identificador no se especifica.

La innovacion tecnica destacable es el uso de precision mixta oQ, que asigna distinto numero de bits a distintas capas o tensores en lugar de aplicar una cuantizacion uniforme de 4 bits. Esta estrategia suele preservar mejor la calidad en capas sensibles (por ejemplo, atencion o primeras/ultimas capas) a costa de un ligero aumento del peso en disco. No se documentan mediciones de degradacion respecto al modelo original en BF16/FP16.

## Capacidades

- No se documenta ninguna capacidad funcional en la informacion disponible: el autor solo describe el proceso de cuantizacion, no el comportamiento del modelo.
- Al tratarse de un modelo de lenguaje con arquitectura MoE etiquetado como `qwen3_5_moe`, cabe esperar generacion de texto, pero se trata de una inferencia no verificada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio, decodificacion especulativa): no disponibles.
- Capacidad confirmada por el propio repositorio: carga e inferencia mediante la libreria MLX sobre hardware Apple Silicon.

## Casos de uso

Los escenarios siguientes son aplicaciones plausibles de un modelo de ~35 B cuantizado a 4 bits en formato MLX. Dado que no hay ninguna evaluacion publicada, deben validarse con pruebas propias antes de llevarlos a produccion.

- Prototipado local en portatiles Apple Silicon: permite experimentar con un modelo de ~35 B sin GPU dedicada, cargando el pesaje de 21,1 GB en memoria unificada. Es adecuado para desarrolladores que quieren iterar en local y comparar respuestas frente a alternativas mas pequenas.
- Asistente de codigo con privacidad estricta: al ejecutarse integramente en la maquina, el codigo y los prompts no salen del equipo, lo que resulta util en entornos con politicas de confidencialidad que prohiben APIs externas. Requiere validar previamente la calidad del modelo base en tareas de programacion.
- Evaluacion comparativa de cuantizaciones: sirve como punto de medida frente al modelo original en BF16 para estimar la perdida de calidad introducida por la cuantizacion oQ de 4 bits, usando conjuntos de validacion propios (perplejidad, exactitud en tareas cerradas).
- Procesamiento por lotes de documentos en un Mac Studio o Mac Pro: con memoria unificada de 64 GB o mas se puede mantener el modelo cargado y procesar colas de resumenes, extraccion de entidades o clasificacion, evitando costes por token de APIs comerciales.
- Endpoint local para agentes y automatizaciones: MLX permite levantar un servidor compatible con la API de OpenAI; el modelo puede actuar como backend de un agente que ejecute herramientas locales, siempre que se verifique su soporte real de tool calling.
- Banco de pruebas para investigacion en cuantizacion: util para estudiar el efecto de group size 64 y precision mixta sobre un MoE de ~35 B, comparando perplejidad y latencia entre configuraciones.
- Formacion y demostraciones sin conectividad: en aulas o talleres con hardware Apple se puede desplegar el modelo sin acceso a internet, algo relevante cuando no se permite enviar datos a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y tampoco se han encontrado evaluaciones de terceros en la busqueda web realizada. Asimismo, no se dispone de mediciones de perplejidad ni de comparacion con el modelo base sin cuantizar.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon con macOS, ya que el formato es MLX safetensors. No es cargable directamente en CUDA, ROCm ni en GPUs discretas.
- Peso en disco: 21,1 GB en el repositorio, coherente con ~35,1 B de parametros a 4 bits mas metadatos y tensores en precision superior.
- Memoria unificada estimada para inferencia: aproximadamente 21-24 GB solo para los pesos, a los que hay que sumar la cache KV (dependiente del contexto y del batch). Se recomienda un minimo de 32 GB de memoria unificada y 36-64 GB para contextos largos o varios usuarios concurrentes.
- Equipos compatibles: Mac con M1/M2/M3/M4 Pro, Max o Ultra de 32 GB o mas; los modelos Ultra (64-192 GB) son los mas holgados. En configuraciones de 16 GB o 24 GB no cabe.
- GPUs NVIDIA: no aplica para este formato. Para usar A100, H100 o RTX 4090 habria que reconvertir los pesos a GGUF o a safetensors estandar.
- Opciones de despliegue: `mlx-lm` (incluye servidor compatible con la API de OpenAI), herramientas basadas en oMLX/oQ, y frameworks de inferencia locales con soporte MLX. Para llama.cpp u Ollama seria necesaria una conversion a GGUF, que no se proporciona en el repositorio.
- Latencia y throughput: no disponibles. El rendimiento estara limitado por el ancho de banda de memoria del chip Apple empleado, no por la potencia de calculo.

## Comparativa con modelos similares

No disponible. No es posible establecer una comparativa rigurosa porque no se identifica el modelo base concreto ni existe informacion publica sobre su rendimiento, contexto o licencia.

| Modelo | Parametros | Contexto | Licencia | Formato | Datos de rendimiento |
|---|---|---|---|---|---|
| occamy-1.0-oQ4e | ~35,1 B (MoE, activos no disponibles) | no disponible | no disponible | MLX safetensors 4 bits | no disponible |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no hay autorizacion clara de uso comercial. Es un riesgo legal que debe resolverse antes de cualquier despliegue en produccion.
- Modelo base no identificado: la etiqueta `qwen3_5_moe` no permite determinar la version exacta, el contexto nativo ni las condiciones de uso originales, lo que complica verificar el cumplimiento de la licencia de origen.
- Sin evaluacion: no hay benchmarks, por lo que se desconoce la degradacion introducida por la cuantizacion a 4 bits respecto al modelo original.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje, agravado por la ausencia de documentacion sobre ajuste por instrucciones o alineacion.
- Sesgos: no documentados; al no declararse la composicion del dataset de entrenamiento no es posible estimar sesgos de genero, idioma o dominio.
- Idiomas: no se declaran idiomas soportados; el rendimiento en castellano es desconocido.
- Repositorio sin traccion: 0 descargas y 0 valoraciones en el momento de la consulta, sin revisores independientes que hayan validado los pesos.
- Formato cerrado a MLX: no es utilizable en GPUs NVIDIA ni en la mayoria de servidores de inferencia habituales (vLLM, TGI) sin conversion adicional.
- Procedencia: al ser una conversion de terceros, conviene verificar la integridad de los shards y el hash de los ficheros antes de cargarlos en un entorno con datos sensibles.
- Fechas: la creacion y la ultima modificacion del repositorio figuran como 2026-09-15, sin historial adicional de revisiones.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/luvhex/occamy-1.0-oQ4e
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Paper, blog o demo del modelo: no disponible
- Resultados de la busqueda web: no se ha encontrado ninguna referencia tecnica relevante; los resultados devueltos correspondian a enlaces genericos de YouTube sin relacion con el modelo.
