# ibm-granite/granite-4.0-h-tiny-base-GGUF

## Resumen

Granite-4.0-h-tiny-base es un modelo de lenguaje de tipo base (no instruido) desarrollado por IBM dentro de la familia Granite 4.0. Se distribuye en este repositorio únicamente en formato GGUF, con múltiples niveles de cuantización, para su ejecución mediante llama.cpp. El modelo subyacente cuenta con 6.939.037.248 parámetros (aproximadamente 6,9 mil millones) y está publicado bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La particularidad técnica más relevante es que el modelo no emplea embeddings posicionales, lo que en teoría le permite procesar secuencias de longitud arbitraria; sin embargo, fue entrenado con texto de hasta 128k tokens, por lo que la model card recomienda limitar el contexto en tiempo de ejecución a 131072 tokens. Esto lo sitúa en la franja de modelos de ~7B con ventana de contexto muy amplia, un nicho habitualmente dominado por modelos de mayor tamaño.

Al tratarse de un modelo base, no incluye ajuste por instrucciones ni alineamiento conversacional: su función es servir como punto de partida para fine-tuning o como motor de continuación de texto. Su relevancia actual radica en la combinación de licencia permisiva, contexto largo y disponibilidad inmediata en GGUF para despliegue en hardware modesto mediante llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de lenguaje tipo transformer; la model card no detalla la arquitectura interna) |
| Parametros totales | 6.939.037.248 (~6,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | entrenado hasta 128k tokens; recomendado limitar a 131072 en runtime |
| Tipos de cuantizacion | multiples cuantizaciones GGUF (la model card usa Q4_K_M como ejemplo; no se enumeran todas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo mas alla de su naturaleza de modelo de lenguaje. El dato tecnico destacable que si aparece en la model card es la ausencia de embeddings posicionales, lo que permite en teoria contextos arbitrariamente largos; no obstante, el entrenamiento se realizo con texto de hasta 128k tokens, y se recomienda fijar el contexto a 131072 en llama.cpp para evitar degradacion. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. Al ser un modelo base, es esperable que no haya pasado por alineamiento por preferencias, pero este extremo no se confirma en la informacion proporcionada.

El repositorio es una conversion a GGUF del modelo original `ibm-granite/granite-4.0-h-tiny-base`. La model card indica que la conversion se realizo con la etiqueta de build `b11798` de llama.cpp y con Transformers `5.20.2`. No se documentan innovaciones adicionales como decodificacion especulativa, atencion lineal o mecanismos hibridos.

## Capacidades

- Generacion de texto y continuacion de secuencias: al ser un modelo base, su tarea principal es predecir el siguiente token; no esta optimizado para seguir instrucciones.
- Contexto largo: soporta entradas de hasta 128k tokens (131072 recomendado en runtime) gracias a la ausencia de embeddings posicionales.
- Multilingue: no se dispone de informacion sobre los idiomas cubiertos.
- Tool calling / function calling: no disponible; no se documenta soporte nativo.
- Razonamiento multi-paso y agentes: no disponible como capacidad declarada; al no estar instruido, no se espera un comportamiento agentico fiable sin fine-tuning.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Fine-tuning supervisado para dominios verticales: al ser un modelo base de ~6,9B con licencia Apache 2.0, es un candidato adecuado para ajuste fino con datos propios (por ejemplo, texto juridico o medico) sin restricciones de licencia comercial.
- Continuacion de texto y generacion asistida en editores: el modelo puede completar parrafos o documentos largos aprovechando su ventana de 128k tokens, util para resumir o reescribir contratos extensos en una sola pasada.
- Clasificacion y etiquetado de documentos largos: mediante cabeceras de clasificacion y evaluacion de la probabilidad de tokens, se puede usar para categorizar informes de decenas de miles de tokens sin truncar.
- Generacion de embeddings o representaciones internas: las activaciones del modelo base pueden extraerse para tareas de recuperacion de informacion o clustering semantico, aunque no se documenta un uso especifico para ello.
- Prototipado en hardware de consumo: con cuantizacion Q4_K_M y llama.cpp, se puede desplegar en una estacion de trabajo con GPU consumer para experimentar con contexto largo a bajo coste.
- Investigacion en eficiencia de contexto: sirve como banco de pruebas para estudiar el comportamiento de modelos sin embeddings posicionales en secuencias de mas de 100k tokens.
- Base para modelos conversacionales: punto de partida para aplicar SFT y DPO y construir un asistente especializado, dado que IBM no publica en este repositorio una variante instruida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en Q4_K_M, un modelo de ~6,9B ocupa aproximadamente 4-5 GB de pesos; con overhead de contexto largo (KV cache para 131072 tokens) el consumo puede crecer varios GB adicionales. En Q8_0 se situaria en torno a 7-8 GB, y en FP16 en torno a 14 GB. Estas cifras son estimaciones a partir del numero de parametros, no datos publicados por el autor.
- GPU recomendadas: para cuantizaciones de 4 bits, una RTX 3060 de 12 GB o superior es suficiente; para FP16 se recomienda una A100 40 GB, H100 o RTX 4090 de 24 GB.
- Cabe en GPU consumer: si, en cuantizaciones de 4 y 5 bits en tarjetas de 8-12 GB; el contexto largo puede requerir mas VRAM o el uso de offloading a CPU.
- Opciones de despliegue: llama.cpp (CLI `llama cli` y servidor `llama serve` con API compatible con OpenAI); al estar en GGUF, tambien es compatible con otros runners basados en llama.cpp, aunque la model card solo documenta llama.cpp.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Granite-4.0-h-tiny-base (este) | ~6,9B | 128k (131072 recomendado) | Apache 2.0 | GGUF | Modelo base, sin instruir |
| Alternativas de ~7B | no disponible | no disponible | no disponible | no disponible | No se dispone de informacion sobre modelos comparables en la documentacion proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Modelo base sin alineamiento: no sigue instrucciones de forma fiable; requiere prompting few-shot o fine-tuning para tareas conversacionales.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar contenido plausible pero falso, especialmente en continuaciones largas.
- Idiomas: no se documenta la cobertura linguistica; el rendimiento en castellano no esta garantizado.
- Contexto: aunque el modelo soporta secuencias arbitrarias en teoria, el entrenamiento se limito a 128k tokens; superar 131072 en runtime puede degradar la calidad.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero se recomienda revisar las condiciones de la licencia del modelo base original y de los datos de entrenamiento (no documentados).
- Ausencia de benchmarks: no hay resultados publicados que permitan evaluar su calidad frente a alternativas, lo que incrementa el riesgo en produccion.
- Repositorio de gran tamano (143,2 GB): incluye multiples cuantizaciones; conviene descargar solo el archivo necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ibm-granite/granite-4.0-h-tiny-base-GGUF
- Modelo base original: https://huggingface.co/ibm-granite/granite-4.0-h-tiny-base
- Documentacion de llama.cpp: https://github.com/ggml-org/llama.cpp
- Referencia de `llama cli`: https://github.com/ggml-org/llama.cpp/blob/master/tools/cli/README.md
- Referencia de `llama serve`: https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md
