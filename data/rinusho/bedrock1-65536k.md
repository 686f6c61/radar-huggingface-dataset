# rinusho/Bedrock1-65536k

## Resumen

Bedrock1-65536k es un tokenizer especial desarrollado por el usuario rinusho, diseñado para ser utilizado como componente de tokenización en modelos de lenguaje propios del autor. No se trata de un modelo generativo, sino de una pieza de infraestructura para preentrenamiento. El tokenizer cuenta con un vocabulario de 65536 tokens y una longitud máxima de secuencia de 4096 tokens, que se configura mediante el parámetro `model_max_length`.

El tokenizer fue entrenado sobre una mezcla de datasets en inglés y ruso, incluyendo fineweb-edu, fineweb, cultura_ru_edu, wikipedias en ruso e inglés, finemath y smoltalk. La composición está pensada para cubrir texto educativo, conversacional, matemático y de código. Incluye tokens especiales para estructurar diálogos y llamadas a herramientas, como `<|system|>`, `<|user|>`, `<|assistant|>`, `<|tool|>`, `<|tool_call|>`, `<|tool_result|>` y `<|end|>`. La relevancia de este modelo radica en que ofrece un vocabulario amplio y específico para dominios técnicos, aunque su uso está condicionado a que coincida exactamente con la arquitectura y configuración del modelo que se desea entrenar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizer (no modelo de lenguaje) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 4096 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles y ruso |
| Licencia | BSD-2-Clause |
| Formato de pesos | JSON |

## Arquitectura y entrenamiento

Bedrock1-65536k no es un modelo de lenguaje, sino un tokenizer entrenado sobre una muestra de 300 millones de caracteres. El vocabulario se construyo con un `min_frequency` de 2, lo que significa que los tokens con una frecuencia menor a 2 en el corpus de entrenamiento fueron descartados. Los datos de entrenamiento se componen de las siguientes fuentes y proporciones: fineweb-edu (30 %), cultura_ru_edu (30 %), fineweb (15 %), ru_wikipedia (10 %), en_wikipedia (5 %), finemath (5 %) y smoltalk (5 %). La mezcla prioriza contenido educativo y en ruso, con una proporcion menor de matematicas y conversaciones de codigo.

El tokenizer incluye tokens especiales para construir prompts de chat y soportar tool calling. El autor advierte en la model card que el tokenizer solo debe utilizarse si coincide con la configuracion exacta y la arquitectura del modelo que se va a preentrenar. Ademas, los pesos se almacenan en formato JSON, por lo que es necesario convertirlos al formato binario o de texto requerido por el framework de entrenamiento.

## Capacidades

- Tokenizacion de texto para modelos de lenguaje propios, con un vocabulario de 65536 tokens.
- Soporte de tokens especiales para dialogos estructurados: `<|system|>`, `<|user|>`, `<|assistant|>`.
- Soporte de tokens para tool calling: `<|tool|>`, `<|tool_call|>`, `<|tool_result|>`, `<|end|>`.
- Entrenado con datos educativos, enciclopedicos, matematicos y de codigo, lo que lo hace adecuado para modelos tecnicos.
- Cobertura principal en ingles y ruso, con una fraccion menor de datos de codigo y conversaciones.
- No es un modelo generativo; no puede generar texto ni razonar por si mismo.

## Casos de uso

- Preentrenamiento de modelos de lenguaje propios: el tokenizer puede aplicarse a un corpus de entrenamiento si la arquitectura del modelo coincide con la configuracion para la que fue disenado.
- Modelos de chat con tool calling: los tokens especiales permiten estructurar conversaciones multi-turno y representar llamadas a herramientas de forma estandarizada.
- Modelos bilingues ingles-ruso: la composicion del dataset, con un 40 % de datos en ruso y un 40 % en ingles, es adecuada para preentrenar modelos que deban manejar ambos idiomas.
- Modelos de razonamiento matematico: la inclusion de finemath (5 %) aporta tokens especializados en expresiones matematicas y razonamiento numerico.
- Modelos de codigo asistente: la fraccion de smoltalk (5 %) proporciona ejemplos de conversaciones tecnicas y de programacion.
- Investigacion en tokenizacion: puede utilizarse como base para estudiar el impacto del tamano del vocabulario, la frecuencia minima y la composicion de datos en la calidad de la tokenizacion.
- Adaptacion de tokenizers: al estar en formato JSON, puede convertirse y ajustarse para frameworks como SentencePiece o BPE en proyectos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al ser un tokenizer, no requiere VRAM para inferencia.
- La tokenizacion puede ejecutarse en CPU sin necesidad de GPU.
- No se requiere una GPU recomendada para su uso.
- Opciones de despliegue: puede cargarse con la libreria `transformers` o `tokenizers` de HuggingFace, o convertirse a formatos como SentencePiece para su uso en llama.cpp o frameworks de entrenamiento personalizados.
- Latencia y throughput no disponibles; al ser un tokenizer, el rendimiento depende de la implementacion y del hardware de CPU.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en los datos proporcionados. No se han encontrado tokenizers alternativos con especificaciones similares en la busqueda web.

## Limitaciones y advertencias

- Es un tokenizer, no un modelo de lenguaje completo; no puede generar texto ni realizar tareas de razonamiento.
- El autor advierte que solo debe usarse si coincide exactamente con la configuracion y arquitectura de preentrenamiento del modelo destino.
- Los pesos estan en formato JSON y requieren conversion al formato exacto necesario para cada framework.
- No se ha publicado ninguna evaluacion de calidad de tokenizacion, como tasa de compresion o cobertura de vocabulario.
- Los idiomas principales son ingles y ruso; puede no ser optimo para otros idiomas, incluido el espanol.
- La licencia BSD-2-Clause permite uso comercial y modificacion, pero exige conservar el aviso de copyright y la lista de condiciones.
- No se dispone de informacion sobre sesgos del tokenizer ni sobre su comportamiento en dominios especificos.

## Enlaces

- HuggingFace: https://huggingface.co/rinusho/Bedrock1-65536k
- No se han encontrado otros enlaces relevantes en la busqueda web.
