# NaamFung/ZatFung

## Resumen

ZatFung es una familia de cuantizaciones GGUF derivadas de Qwen3.8-Flash-Next, un modelo de mezcla de expertos (MoE) de gran tamano. El autor, NaamFung, no entrena ningun modelo desde cero: parte de dos repositorios intermedios de SC117 (una variante "abliterated" del modelo base, en versiones Swift-1.5 con cuantizacion IQ3_S y Unsloth Dynamic 3.1 con UD-IQ3_XXS) y aplica una reduccion del numero de expertos, de los 512 originales a 192, 256, 288, 320 o 384 segun la variante. Los pesos conservados no se recuantizan, se copian byte a byte, de modo que la perdida de calidad proviene unicamente de los expertos eliminados.

La propuesta de valor del repositorio es el ajuste del compromiso hacia cargas de trabajo de chino y codigo: texto largo en chino (novela) y codigo real en Zig, Go, Rust y C++. El autor declara que, a igual tamano, estas variantes rinden mejor que las reducidas con criterios de corpus general. La familia se distribuye en seis subdirectorios independientes, cada uno con sus propios shards GGUF, y requiere un motor de inferencia que soporte la arquitectura `qwen4exp`.

El modelo total declarado en safetensors asciende a 101.407.105.920 parametros (unos 101,4 mil millones), aunque el repositorio solo contiene GGUF. El contexto nativo es de 262.144 tokens y el autor recomienda 131.072 en las lineas de ejemplo. La licencia es la de Qwen, heredada de los modelos upstream, con la advertencia de verificar los terminos antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con atencion y componentes SSM; arquitectura `qwen4exp` (Qwen3.8-Flash-Next) |
| Parametros totales | 101.407.105.920 (dato de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens nativos; 131.072 en los ejemplos del autor |
| Tipos de cuantizacion | IQ3_S (familia Swift), UD-IQ3_XXS con cuantizacion mixta por capa IQ2_S / IQ3_XXS / IQ3_S / IQ4_XS / IQ4_NL / Q2_0 (familia Unsloth Dynamic) |
| Idiomas soportados | chino (zh), ingles (en) y codigo |
| Licencia | `other` / `qwen` (heredada del modelo upstream Qwen) |
| Formato de pesos | GGUF (shards `gguf-split`), mas mmproj BF16 para vision y cabezas MTP opcionales |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.8-Flash-Next, un transformer de mezcla de expertos con 512 expertos y componentes de atencion y SSM (los shards de metadatos incluyen tensores de embedding, atencion, SSM y router). El repositorio no entrena ni hace fine-tuning: la operacion consiste en reducir el numero de expertos a 192, 256, 288, 320 o 384, eliminando el ancho de routing y los bloques de expertos sobrantes, mientras que los bloques conservados se transfieren sin recuantizar. La variante Unsloth Dynamic parte de una cuantizacion dinamica por capa y aplica la misma reduccion a 320 expertos.

El autor publica una metrica propia, la "desviacion en conjunto reservado": el porcentaje de rutas de salida que cambian respecto al modelo original de 512 expertos sobre un conjunto no usado en la seleccion. Los valores son 0,88 % (384E), 2,27 % (320E), 3,18 % (288E), 4,55 % (256E) y 8,59 % (192E). No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO, ya que corresponden al modelo base de Qwen y no a este repositorio. La innovacion tecnica destacable es la preservacion exacta de la precision de los pesos conservados y el uso de una tabla de embeddings por capa (PLE) de 26,82 GiB, identica en todas las variantes.

## Capacidades

- Generacion de texto en chino e ingles, con enfasis declarado en texto largo en chino (novela) y coherencia de estilo a lo largo de contextos extensos.
- Generacion de codigo en multiples lenguajes, con mencion explicita a Zig, Go, Rust y C++, ademas de tareas de nivel de repositorio y problemas de algoritmia.
- Razonamiento multi-paso: el repositorio incluye plantillas de chat con prefijo de pensamiento en chino simplificado ("思考过程：") y tradicional ("思考過程：").
- Entrada de imagenes: se ofrece un codificador visual BF16 (`mmproj-Qwen3.8-Flash-Next-BF16.gguf`, 0,85 GiB) que se empareja con el modelo principal.
- Decodificacion especulativa: se distribuyen cinco cabezas MTP draft opcionales (0,4 a 3,9 GiB) y una version en formato runtime para el motor STRATA.
- Conversacional multi-turno (tag `conversational`).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de codigo en produccion: el modelo cubre Rust, Go, Zig y C++ y esta pensado para tareas a nivel de repositorio; con 131.072 tokens de contexto puede recibir varios ficheros y el historial de cambios en una sola llamada.
- Creacion de novela en chino: el ajuste del compromiso favorece el texto largo en chino con estilo estable; la ventana de 262.144 tokens permite mantener arcos narrativos y fichas de personaje dentro del contexto.
- Resolucion de problemas de algoritmia: el autor menciona explicitamente las "tareas de algoritmos" como carga objetivo, por lo que encaja en asistentes de preparacion de entrevistas o generacion de soluciones con explicacion.
- Asistente de refactorizacion multi-archivo: combinando el contexto largo con la entrada de imagenes (diagramas de arquitectura) mediante el mmproj BF16, se puede pedir la reescritura de un modulo a partir de su esquema y su codigo.
- Despliegue en estaciones de trabajo con una sola GPU: la variante de 320 expertos en UD-IQ3_XXS ocupa 60,23 GiB y cabe en una GPU de 80 GB, lo que permite servir el modelo en local sin cluster.
- Servicio de inferencia acelerada por decodificacion especulativa: las cabezas MTP opcionales permiten reducir la latencia de decodificacion en motores compatibles, util en entornos interactivos de autocompletado de codigo.
- Procesamiento por lotes de documentacion tecnica bilingue: la combinacion de chino e ingles permite traducir y resumir documentacion de proyectos open source con contexto de repositorio completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo aporta la metrica interna de desviacion en conjunto reservado respecto al modelo de 512 expertos:

| Variante | Expertos | Desviacion en conjunto reservado | Tamano total |
|---|---|---|---|
| Swift-384E-v5 | 384 | 0,88 % | 66,05 GiB |
| Swift-320E-v5 | 320 | 2,27 % | 60,16 GiB |
| Swift-288E-v5 | 288 | 3,18 % | 57,22 GiB |
| Swift-256E-v5 | 256 | 4,55 % | 54,27 GiB |
| Swift-192E-v5 | 192 | 8,59 % | 48,39 GiB |
| Unsloth-Dynamic-3.1-IQ3_XXS-320E-v5 | 320 | no disponible | 60,23 GiB |

## Requisitos de hardware

- VRAM o memoria estimada: entre 48,39 GiB (192E) y 66,05 GiB (384E) solo para los pesos; el autor advierte que, si falta memoria, hay que reducir el contexto o elegir una variante menor en lugar de recuantizar.
- La tabla PLE de 26,82 GiB es identica en todas las variantes, por lo que el suelo de memoria es alto incluso en la variante mas pequena.
- GPU de 80 GB (A100 80GB, H100 80GB) o superior para las variantes de 320E y 384E; la variante de 192E (48,39 GiB) puede intentarse en GPU de 48 GB, aunque sin margen para contexto y cache KV.
- No cabe en GPU de consumo de 24 GB (RTX 4090) ni de 32 GB; requeriria ejecucion parcial en CPU o memoria unificada.
- Opciones de despliegue: motores que soporten la arquitectura `qwen4exp` y GGUF con shards `gguf-split`; el autor menciona llama.cpp y STRATA (este ultimo para las cabezas MTP en formato runtime). No se confirma compatibilidad con vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: el autor indica cualitativamente que la variante Unsloth Dynamic es mas lenta que la Swift por la fragmentacion de kernels (mezcla de IQ2_S, IQ3_XXS, IQ3_S, IQ4_XS, IQ4_NL y Q2_0), pero no publica cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| ZatFung (320E) | 101,4 mil millones (512 expertos originales, 320 conservados) | 262.144 | IQ3_S o UD-IQ3_XXS | qwen | Reduccion de expertos sin recuantizar, ajuste a chino y codigo |
| SC117/Qwen3.8-Flash-Next-abliterated-UD-GGUF | no disponible | no disponible | UD (dinamica por capa) | heredada de Qwen | Modelo upstream completo, sin reduccion de expertos; mayor calidad, mayor tamano |
| SC117/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF | no disponible | no disponible | IQ3_S | heredada de Qwen | Modelo upstream completo de la familia Swift; referencia de la metrica de desviacion |
| Qwen3.8-Flash-Next original | no disponible | no disponible | no disponible | qwen | Modelo base de Qwen; no se dispone de datos de tamano ni de contexto en la informacion proporcionada |

## Limitaciones y advertencias

- La reduccion de expertos degrada la calidad de forma medible: la variante de 192 expertos desvia un 8,59 % de las rutas del modelo original y el propio autor la desaconseja para produccion.
- El modelo es una variante "abliterated", lo que elimina los rechazos aprendidos del modelo base; no incorpora filtros de seguridad propios y puede generar contenido que el modelo original rechazaria.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad ni de tasas de alucinacion en la informacion disponible.
- La licencia es `other` con nombre `qwen`; el uso comercial exige revisar los terminos del modelo upstream de Qwen, ya que el repositorio no concede permisos adicionales.
- El soporte linguistico documentado se limita a chino, ingles y codigo; el rendimiento en castellano no esta evaluado.
- Requiere motores con soporte especifico de la arquitectura `qwen4exp`; muchos runners habituales pueden no cargar estos GGUF.
- Los shards deben descargarse completos y emparejados: dar solo la ruta del primer shard hace que el motor busque el resto por nombre, y la falta de un fragmento provoca error.
- El repositorio pesa 267,9 GB en total por acumular seis variantes; conviene descargar solo el subdirectorio necesario.
- La metrica de desviacion es interna del autor y no equivale a una evaluacion estandar de calidad; no hay MMLU, HumanEval ni GSM8K publicados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/NaamFung/ZatFung
- Modelo base Swift-1.5: https://huggingface.co/SC117/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF
- Modelo base Unsloth Dynamic: https://huggingface.co/SC117/Qwen3.8-Flash-Next-abliterated-UD-GGUF
- Paper, blog o demo oficial: no disponible en la informacion proporcionada.
