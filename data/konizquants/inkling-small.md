# konizquants/Inkling-Small

## Resumen

Inkling-Small es un modelo multimodal de propósito general desarrollado por Thinking Machines que acepta entradas de texto, imagen y audio y genera texto. Se distribuye con pesos abiertos bajo licencia Apache 2.0 y está pensado para aplicaciones de tipo agente, asistentes de código, chatbots y sistemas de generación aumentada por recuperación (RAG). La ficha que se analiza aquí corresponde al repositorio `konizquants/Inkling-Small`, una reproducción de los pesos originales publicados en `thinkingmachines/Inkling-Small`, con 0 descargas y 0 interacciones en el momento de la consulta.

El modelo es un transformer decoder-only de 42 capas con una columna vertebral de mezcla de expertos (MoE) dispersa: cada token se enruta a 6 de 256 expertos más 2 expertos compartidos siempre activos. La model card declara 276.000 millones de parámetros totales y 12.000 millones activos, aunque el recuento real de los tensores en safetensors del repositorio es de 265.956.439.090 parámetros. La atención combina capas locales y globales, y las tres modalidades se proyectan a un espacio oculto compartido y se procesan conjuntamente por el decoder.

Su relevancia actual radica en que es uno de los pocos modelos multimodales nativos (texto, imagen y audio) de escala grande con pesos abiertos y licencia permisiva, lo que permite despliegue local, ajuste fino e integración en producto. El repositorio ocupa 531,9 GB, coherente con pesos en BF16, y requiere infraestructura multigpu para inferencia en precisión completa, aunque existe una variante NVFP4 publicada por el autor original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal autorregresivo con MoE dispersa (42 capas), atencion hibrida local/global |
| Parametros totales | 276.000 millones segun la model card; 265.956.439.090 segun los tensores safetensors del repositorio |
| Parametros activos | 12.000 millones (6 de 256 expertos enrutados por token mas 2 expertos compartidos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (repositorio analizado); NVFP4 en el repositorio del autor original |
| Idiomas soportados | Ingles, con capacidades multilingues generales en otros idiomas (la model card no detalla lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Modalidades de entrada | Texto (UTF-8), imagen (cualquier imagen por pixeles, 40-4096 px por dimension recomendado), audio (WAV a 16 kHz, idealmente menos de 2 minutos) |
| Modalidades de salida | Texto (UTF-8) |
| Tamano del repositorio | 531,9 GB |
| Fecha de creacion | 2026-09-21 |

## Arquitectura y entrenamiento

La arquitectura es un transformer autorregresivo decoder-only de 42 capas cuya red de avance (feed-forward) es una mezcla de expertos dispersa: de los 256 expertos disponibles, cada token activa 6, y adicionalmente hay 2 expertos compartidos que se aplican a todos los tokens. Este esquema mantiene la capacidad total en el rango de los 276.000 millones de parametros declarados mientras limita el coste computacional por token al de un modelo de unos 12.000 millones de parametros activos. El mecanismo de atencion es hibrido, combinando capas locales con capas globales, un patron habitual para reducir el coste de atencion en secuencias largas sin renunciar a dependencias de largo alcance.

El caracter multimodal es nativo: las imagenes se codifican mediante un codificador jerarquico de parches y el audio mediante codificacion en tokens discretos; ambas representaciones se proyectan al mismo espacio oculto que el texto y se procesan conjuntamente por el decoder, en lugar de depender de adaptadores externos acoplados a posteriori. La model card indica soporte numerico en BF16 y NVFP4.

En cuanto al entrenamiento, la informacion disponible es generica: los datos provienen de fuentes publicas (internet publico y repositorios accesibles), de terceros y de generacion o aumento sintetico, e incluyen texto, imagenes, audio y video. El proceso de curacion comprende limpieza, deduplicacion y filtrado para eliminar contenido basura o de baja calidad y para objetivos de seguridad. No se detallan en la informacion proporcionada el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF, DPO u otras fases de alineamiento posteriores al preentrenamiento.

## Capacidades

- Generacion de texto conversacional multi-turno con seguimiento de instrucciones.
- Comprension de imagenes: descripcion, respuesta a preguntas visuales y tareas de texto-imagen a texto, con entrada de hasta 4096 px por dimension.
- Comprension de audio: transcripcion y razonamiento sobre audio en formato WAV a 16 kHz, con una duracion recomendada inferior a 2 minutos por clip.
- Generacion y asistencia de codigo en multiples lenguajes de programacion, segun declara la model card.
- Uso como base para sistemas agente y de uso de herramientas (tool use), citado explicitamente entre los casos previstos por el autor.
- Integracion en sistemas de generacion aumentada por recuperacion (RAG) y asistentes conversacionales.
- Capacidades multilingues generales, con ingles como idioma principal declarado.
- Soporte de ajuste fino por parte de terceros, al publicarse con pesos abiertos.
- No se documenta en la informacion disponible un modo de razonamiento explicito (thinking mode) ni generacion de imagen o audio.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno y aceptar capturas de pantalla o imagenes enviadas por el usuario como parte de la consulta, lo que permite resolver incidencias de producto sin extraer el texto de la imagen en un paso previo.
- Asistentes de codigo en produccion: con soporte declarado de uso de herramientas, puede integrarse en pipelines de CI/CD para revisar diffs, generar pruebas o proponer correcciones, invocando herramientas de compilacion o de ejecucion de tests.
- Analisis de documentacion tecnica escaneada: al aceptar imagenes de hasta 4096 px, puede procesar diagramas de arquitectura, planos y esquemas directamente y responder preguntas sobre ellos.
- Transcripcion y resumen de reuniones: la entrada de audio en WAV a 16 kHz permite procesar notas de voz o clips cortos de reunion y devolver actas estructuradas en texto.
- Agentes de automatizacion con multiples pasos: la combinacion de tool calling, contexto multimodal y modo conversacional lo hace adecuado para flujos en los que el agente debe consultar una API, leer una captura de pantalla de error y decidir la siguiente accion.
- Sistemas RAG sobre corpus mixtos: puede indexar y consultar documentos que combinan texto e imagenes (informes con graficos, manuales ilustrados) sin necesidad de un modelo de vision separado para la fase de generacion.
- Prototipado e investigacion en multimodalidad: al publicarse con pesos abiertos y licencia Apache 2.0, sirve como base para experimentos de ajuste fino conjunto de texto, imagen y audio.
- Moderacion de contenido multimodal: puede analizar conjuntamente texto, imagen y audio de una publicacion para clasificar incidencias, aunque requiere una capa de validacion adicional por el riesgo de alucinacion.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card del autor incluye una tabla de evaluacion comparativa, pero los valores numericos no estaban incluidos en la informacion proporcionada. Los modelos con los que el autor compara Inkling-Small en esa tabla son los siguientes:

| Modelo de comparacion | Grupo | Resultados numericos |
|---|---|---|
| Inkling-Small | Pesos abiertos | no disponibles |
| Qwen3.5 397B-A17B | Pesos abiertos | no disponibles |
| MiMo V2.5 | Pesos abiertos | no disponibles |
| Minimax M2.7 | Pesos abiertos | no disponibles |
| DeepSeek V4 Flash | Pesos abiertos | no disponibles |
| Modelos de pesos cerrados (sin identificar en el extracto) | Pesos cerrados | no disponibles |

## Requisitos de hardware

- Pesos en BF16: aproximadamente 532 GB solo para los pesos (265.956 millones de parametros a 2 bytes). No cabe en una unica GPU comercial actual; requiere al menos 8 GPU de 80 GB (H100, A100 80 GB, H200) o 7 GPU de 80 GB mas margen ajustado para cache KV y activaciones.
- Pesos en NVFP4: aproximadamente 133 GB (4 bits por parametro mas escalas), lo que permite 2 GPU de 80 GB o una sola GPU de 141 GB (H200) con margen limitado.
- Pesos en FP8 (si se generase una variante): aproximadamente 266 GB, es decir 4 GPU de 80 GB como minimo.
- GPU no recomendadas: una RTX 4090 (24 GB) no puede alojar el modelo ni siquiera cuantizado a 4 bits completo; no hay actualmente ficheros GGUF en el repositorio analizado, por lo que no hay una ruta de despliegue en GPU de consumo documentada.
- Opciones de despliegue documentadas por el autor: SGLang, vLLM, TokenSpeed, Unsloth y transformers (Hugging Face). Tambien se ofrece acceso mediante API a traves de proveedores de inferencia de terceros y del playground de Tinker.
- Latencia y throughput: no disponibles. Como referencia estructural, al activar 12.000 millones de parametros por token el coste computacional por token es comparable al de un modelo denso de ese tamano, pero el coste de memoria es el de los 276.000 millones de parametros totales.
- La longitud de contexto no esta publicada, por lo que no es posible estimar el consumo de cache KV para secuencias largas.

## Comparativa con modelos similares

La informacion disponible no incluye especificaciones tecnicas de los modelos alternativos, solo sus nombres en la tabla de evaluacion de la model card. No es posible completar una comparativa fiable de parametros, contexto, rendimiento o disponibilidad.

| Modelo | Parametros | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-Small | 276B (card) / 265,96B (safetensors) | 12B | no disponible | Apache 2.0 | Pesos abiertos en HuggingFace |
| Qwen3.5 397B-A17B | no disponible | 17B (segun el nombre) | no disponible | no disponible | Citado como pesos abiertos |
| MiMo V2.5 | no disponible | no disponible | no disponible | no disponible | Citado como pesos abiertos |
| Minimax M2.7 | no disponible | no disponible | no disponible | no disponible | Citado como pesos abiertos |
| DeepSeek V4 Flash | no disponible | no disponible | no disponible | no disponible | Citado como pesos abiertos |

No se dispone de datos suficientes para establecer que modelo es superior en cada tarea; se recomienda consultar la tabla de evaluacion original cuando este completa.

## Limitaciones y advertencias

- El repositorio analizado (`konizquants/Inkling-Small`) es una reproduccion de los pesos del autor original (`thinkingmachines/Inkling-Small`); conviene verificar la integridad de los ficheros y preferir el repositorio oficial para uso en produccion.
- Existe una discrepancia entre el recuento de parametros de la model card (276.000 millones) y el de los tensores safetensors (265.956 millones); no se documenta la causa.
- No se especifica la longitud de contexto soportada, un dato critico para dimensionar la cache KV y para evaluar si el modelo sirve en casos de contexto largo.
- La model card no detalla la lista de idiomas soportados; solo indica ingles como idioma principal y capacidades multilingues generales. El castellano no esta confirmado de forma explicita.
- Riesgo de alucinacion no cuantificado: no se publican tasas de error ni resultados de evaluacion, por lo que no es posible estimar la fiabilidad factual.
- No se documentan sesgos conocidos ni evaluaciones de sesgo, toxicidad o seguridad; el autor remite a una politica de uso aceptable.
- No se detalla la composicion del dataset de entrenamiento mas alla de categorias generales, lo que impide auditar posibles sesgos de dominio o de idioma.
- La licencia es Apache 2.0, permisiva para uso comercial, pero la politica de uso aceptable del autor establece restricciones de uso adicionales que conviene revisar antes de desplegar en producto.
- El modelo es de gran tamano: no cabe en hardware de consumo y su despliegue exige infraestructura multigpu, con el coste asociado.
- No hay ficheros GGUF publicados en la informacion disponible, lo que limita las opciones de cuantizacion agresiva y de despliegue en CPU o GPU de gama baja.
- La fecha de creacion del repositorio (2026-09-21) y los modelos de comparacion citados no permiten contrastar resultados con evaluaciones independientes publicadas.
- Los resultados de la busqueda web realizada no contienen informacion relacionada con el modelo; los enlaces devueltos corresponden a servicios de cartografia y direcciones en Suecia y no son relevantes.

## Enlaces

- Repositorio analizado en HuggingFace: https://huggingface.co/konizquants/Inkling-Small
- Repositorio oficial en BF16: https://huggingface.co/thinkingmachines/Inkling-Small
- Repositorio oficial en NVFP4: https://huggingface.co/thinkingmachines/Inkling-Small-NVFP4
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook (GitHub): https://github.com/thinking-machines-lab/tinker-cookbook
- Politica de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta de despliegue en SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-Small
- Receta de despliegue en vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-Small
- Receta de despliegue en TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Documentacion de Unsloth para Inkling: https://unsloth.ai/docs/models/inkling
- Blog de HuggingFace sobre Inkling: https://hf.co/blog/thinkingmachines-inkling
