# infosave/MiniCPM-V-4.7-35B-A3B-cmf

## Resumen

Esta ficha describe `infosave/MiniCPM-V-4.7-35B-A3B-cmf`, un paquete de cuantizacion en formato CMF que contiene unicamente el *backbone* de texto del modelo multimodal OpenBMB MiniCPM-V 4.7 35B-A3B. Lo publica el usuario `infosave` y esta pensado para ejecutarse con el runtime `cortiq`, que empaqueta en un unico archivo mapeado en memoria los pesos cuantizados, el tokenizer y la plantilla de chat. No es una version completa de MiniCPM-V: aunque el nombre conserve la "V", este release no incluye torre de vision, merger/proyector, inyeccion de tokens visuales ni la ruta canvas M-RoPE, por lo que solo procesa texto.

El backbone de lenguaje retenido es un transformer hibrido de tipo Mixture-of-Experts con 40 capas: 30 capas de atencion lineal Gated DeltaNet y 10 capas de atencion completa, con 256 expertos enrutados (top 8) mas un experto compartido. El checkpoint de origen esta publicado en BF16 y estos dos archivos son cuantizaciones directas de ese backbone de texto. El modelo base pertenece a la familia MiniCPM-V de OpenBMB y combina comprension de imagen y video con generacion de texto, pero esa parte multimodal queda fuera de esta publicacion.

La relevancia de este release es de caracter practico: ofrece un perfil compacto (`q4tp`) y uno de mayor fidelidad (`q8_2f`) para desplegar el backbone de texto en hardware con memoria unificada, en particular Apple Silicon mediante Metal. La propia model card advierte que el nombre "35B-A3B" no implica que el banco completo de expertos quepa en 3 GB, y que no se reclama ninguna cifra de perplexity, calidad o tokens por segundo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido MoE (estilo Qwen3.5): 40 capas, 30 de atencion lineal Gated DeltaNet y 10 de atencion completa; 256 expertos enrutados (top 8) mas un experto compartido |
| Parametros totales | ~35B segun la nomenclatura del modelo base ("35B-A3B"); no confirmado de forma explicita en la informacion disponible |
| Parametros activos | ~3B segun la nomenclatura del modelo base ("A3B"); no confirmado de forma explicita en la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | `q4tp` (matrices de expertos enrutados y compartidos) y `q8_2f` (matrices 2-D de lenguaje ordinarias); controles en F16 (router MoE, gate del experto compartido, `in_proj_a`/`in_proj_b` de Gated DeltaNet, convolucion y tensores escalares/norma) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | CMF (archivo unico mapeado en memoria para el runtime `cortiq`) |
| Tamano de archivos | `q4tp`: 19.372.423.311 bytes; `q8_2f`: 34.994.075.791 bytes |
| Modelo base | openbmb/MiniCPM-V-4.7-35B-A3B |
| Relacion con el base | Cuantizacion (base_model_relation: quantized) |

## Arquitectura y entrenamiento

El backbone conservado es un modelo MoE hibrido de 40 capas que combina dos mecanismos de atencion. La mayor parte de la profundidad (30 capas) usa atencion lineal Gated DeltaNet, mientras que 10 capas mantienen atencion completa. La capa MoE dispone de 256 expertos enrutados con seleccion top 8 y un experto compartido siempre activo. Esta mezcla persigue reducir el coste de atencion en secuencias largas manteniendo capacidad de modelado a traves de las capas de atencion completa y del banco de expertos.

El checkpoint de origen esta publicado en BF16 y estos dos CMF son cuantizaciones directas de ese backbone de texto, no un reentrenamiento. La model card indica que, aunque la configuracion del modelo base anuncia una capa MTP (Multi-Token Prediction), el checkpoint no incluye tensores fisicos `mtp.*`, por lo que este release carece de cabeza MTP o de decodificacion especulativa. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO.

La parte de empaquetado es especifica: CMF agrupa pesos, tokenizer y plantilla de chat en un unico archivo, y la politica de precision mantiene en F16 determinadas rutas sensibles (router, gates, proyecciones recurrentes de Gated DeltaNet, convoluciones y normas) fuera del cuerpo de bajo bit, lo que da lugar a un archivo `q4tp` con dtypes mixtos por tensor.

## Capacidades

- Generacion de texto y chat de texto a traves del tokenizer y la plantilla embebidos en el archivo CMF.
- Razonamiento y generacion de lenguaje general, heredados del backbone de lenguaje del modelo base.
- Ejecucion en hardware Apple Silicon mediante el backend Metal de `cortiq` (perfil `q4tp` recomendado para una primera evaluacion).
- Verificacion de integridad del artefacto mediante `cortiq verify` y checksums SHA-256 publicados.
- Inspeccion de dtypes por tensor con `cortiq info` (util por el perfil de precision mixta).
- No soporta comprension de imagenes ni de video: no incluye torre de vision, merger/proyector, inyeccion de tokens visuales ni ruta canvas M-RoPE.
- Los tokens de relleno visual (`<|image_pad|>`, `<|video_pad|>`) no habilitan vision en este runtime; para el modelo solo son texto.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de texto en local sobre Apple Silicon: el perfil `q4tp` (19,37 GB) permite desplegar el backbone en un Mac con memoria unificada suficiente, usando `cortiq run` con prompts de texto y un limite de tokens configurable.
- Chat de texto con plantilla propia: al incluir el tokenizer y la plantilla de chat en el mismo archivo CMF, se puede levantar un asistente conversacional de texto sin gestionar ficheros auxiliares.
- Procesamiento de documentos de texto y resumen: el modelo recibe texto plano, por lo que encaja en tareas de resumen, reescritura o extraccion sobre corpus textuales.
- Evaluacion comparativa de cuantizaciones: comparar `q4tp` frente a `q8_2f` sobre el mismo conjunto de prompts permite medir el compromiso entre fidelidad y uso de memoria en el hardware objetivo.
- Integracion en un runtime mapeado en memoria: al ser un unico archivo CMF, se puede cargar con `mmap` para reducir picos de memoria al iniciar el proceso.
- Verificacion de cadena de suministro de pesos: los hashes SHA-256 y `cortiq verify` permiten auditar que el artefacto desplegado es exactamente el publicado, algo util en pipelines internos.
- Laboratorio de investigacion sobre arquitecturas hibridas MoE + atencion lineal: sirve como sujeto de pruebas para estudiar el comportamiento de Gated DeltaNet y del enrutado top 8 en inferencia cuantizada.
- Despliegue de texto en maquinas con mas memoria unificada: el perfil `q8_2f` (34,99 GB) es la opcion cuando prima la fidelidad sobre el almacenamiento y la memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que "no perplexity, quality, or tokens-per-second figure is claimed here", es decir, no se reclama ninguna cifra de perplexity, calidad ni tokens por segundo para estos artefactos.

## Requisitos de hardware

- Espacio en disco: 19,37 GB para `q4tp` y 34,99 GB para `q8_2f` (tamanos exactos en bytes indicados en la tabla de especificaciones).
- Memoria: segun la model card, el nombre "35B-A3B" no implica que el banco completo de expertos quepa en 3 GB; hay que prever el archivo CMF completo, los buffers del runtime, el estado de contexto/KV y el margen de memoria unificada del sistema.
- GPU/plataforma recomendada en la informacion disponible: Apple Silicon con backend Metal (variable `CMF_GPU=1` para `cortiq`). No se mencionan modelos concretos como A100, H100 o RTX 4090.
- Comportamiento en GPU de consumo (por ejemplo, RTX 4090): no disponible en la informacion proporcionada.
- VRAM estimada de inferencia por cuantizacion: no disponible mas alla del tamano de archivo; el propio autor advierte que hay que sumar buffers y KV cache de las capas de atencion completa.
- Opciones de despliegue: runtime `cortiq` (libreria declarada del repo). No se indican vLLM, llama.cpp, Ollama ni TGI como opciones compatibles.
- Latencia y throughput: no disponibles; el autor subraya que una prueba de humo en CPU o una conversion de archivo correcta no equivalen a un resultado de rendimiento en Metal, y recomienda medir en la maquina objetivo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| infosave/MiniCPM-V-4.7-35B-A3B-cmf (`q4tp`) | Backbone de texto cuantizado | ~35B totales / ~3B activos (segun nomenclatura) | no disponible | CMF | apache-2.0 | Solo texto; 19,37 GB; perfil compacto para Metal |
| infosave/MiniCPM-V-4.7-35B-A3B-cmf (`q8_2f`) | Backbone de texto cuantizado | ~35B totales / ~3B activos (segun nomenclatura) | no disponible | CMF | apache-2.0 | Solo texto; 34,99 GB; mayor fidelidad |
| openbmb/MiniCPM-V-4.7-35B-A3B | Modelo multimodal completo | ~35B totales / ~3B activos (segun nomenclatura) | no disponible | no disponible | apache-2.0 | Incluye vision y video; requiere un runtime que soporte su processor, torre de vision y canvas M-RoPE |

No se dispone en la informacion proporcionada de otros modelos comparables de la misma categoria con datos verificables de rendimiento, tamano de contexto o licencia, por lo que la comparativa se limita a los artefactos de este repositorio y a su modelo base.

## Limitaciones y advertencias

- Ambito solo texto: este release no procesa imagenes ni video pese a pertenecer a la familia MiniCPM-V. No incluye torre de vision, merger/proyector, inyeccion de tokens visuales ni ruta canvas M-RoPE.
- Los tokens `<|image_pad|>` y `<|video_pad|>` no habilitan vision en este runtime: para el modelo son texto plano.
- Para usar la capacidad visual del modelo base hay que emplear una implementacion que soporte explicitamente su processor, torre de vision, inyeccion de tokens visuales y canvas M-RoPE.
- Ausencia de cabeza MTP: la configuracion anuncia una capa MTP, pero el checkpoint no contiene tensores `mtp.*`, de modo que no hay decodificacion especulativa asociada.
- Sin cifras de calidad: no se publican perplexity, benchmarks ni tokens por segundo, por lo que el rendimiento real debe medirse en el hardware objetivo.
- Perfil de precision mixta: el archivo `q4tp` combina distintos dtypes por tensor (controles en F16); hay que inspeccionarlos con `cortiq info` antes de asumir un unico formato.
- Memoria: el banco completo de expertos no cabe en 3 GB; hay que prever el archivo CMF entero, buffers del runtime, estado de contexto/KV y margen de memoria unificada del sistema.
- Contexto largo: las capas de atencion completa generan KV cache adicional que debe sumarse al coste de los pesos.
- Licencia: el artefacto declara apache-2.0 y deriva del release Apache-2.0 de OpenBMB; la model card remite a la model card upstream para la licencia, el uso y la informacion de seguridad completos del modelo multimodal.
- Idiomas soportados: no disponibles en la informacion proporcionada, por lo que la cobertura linguistica no puede evaluarse con los datos actuales.
- Sesgos conocidos y riesgo de alucinacion: no disponibles en la informacion proporcionada; al ser un backbone de texto cuantizado hereda sin evaluacion publica las caracteristicas del modelo base.
- Compatibilidad de runtime: los artefactos estan empaquetados para `cortiq` (formato CMF) y no se documentan otras rutas de despliegue.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/infosave/MiniCPM-V-4.7-35B-A3B-cmf
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- Proyecto CMF (formato y herramienta): https://github.com/infosave2007/cmf
