# Dummy9898/mesosfer-v2-tokenizer-96k

## Resumen

Mesosfer v2 Tokenizer (96K) es un tokenizador BPE personalizado, no un modelo de lenguaje completo. Lo publica el usuario Dummy9898 como componente del proyecto Mesosfer v2, un modelo fundacional bilingüe inglés-indonesio orientado a código, ciberseguridad y razonamiento. El tokenizador emplea `rustbpe` (compatible con `tiktoken`) y define un vocabulario de 98.304 entradas, resultado de 256 tokens de byte, 98.037 fusiones BPE y 11 tokens especiales.

El artefacto resuelve un problema concreto: proporcionar una tokenización adaptada al mix de preentrenamiento de Mesosfer v2 (40.200 millones de tokens, con un 50 % de contenido general, 25 % de código, 15 % de ciberseguridad y 10 % de razonamiento y matemáticas), de modo que el modelo resultante tenga una representación más eficiente de esos dominios que la que ofrecería un tokenizador genérico. Es relevante para quienes entrenan o evalúan modelos bilingües en indonesio y para pipelines que necesitan compatibilidad con el ecosistema `tiktoken`.

Conviene subrayar que este repositorio contiene únicamente el tokenizador: los pesos del modelo Mesosfer v2 (`d24`, 3.360 millones de parámetros) no forman parte de esta publicación. El repositorio tiene un tamaño de 0,0 GB y, en el momento de la consulta, registra 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador BPE (byte-level, `rustbpe`, compatible con `tiktoken`) |
| Parametros totales | No aplica (no es un modelo neuronal) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica al tokenizador; el modelo asociado se denomina `d24` de 3,36B, sin contexto especificado |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Inglés (`en`) e indonesio (`id`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `tokenizer.pkl` (serialización de `tiktoken.Encoding`) y `token_bytes.pt` (tabla de longitud en bytes UTF-8 para evaluación BPB) |
| Tamano de vocabulario | 98.304 (256 tokens de byte + 98.037 fusiones BPE + 11 tokens especiales) |
| Corpus de entrenamiento | 2.000 millones de caracteres muestreados del mix de preentrenamiento de 40.200 millones de tokens |

## Arquitectura y entrenamiento

El tokenizador sigue el esquema de byte-level BPE implementado en `rustbpe`, con compatibilidad directa con `tiktoken`. El vocabulario se compone de 256 tokens base correspondientes a los valores de byte UTF-8, 98.037 fusiones BPE aprendidas y 11 tokens especiales que estructuran las conversaciones y los modos de inferencia del modelo asociado: `<|bos|>`, `<|user_start|>`, `<|user_end|>`, `<|assistant_start|>`, `<|assistant_end|>`, `<|think_start|>`, `<|think_end|>`, `<|output_start|>`, `<|output_end|>`, `<|tool_start|>` y `<|tool_end|>`.

El entrenamiento del vocabulario se realizó sobre una muestra de 2.000 millones de caracteres extraída del mix balanceado de preentrenamiento de Mesosfer v2, con la siguiente composición: 50 % contenido general (inglés e indonesio), 25 % código, 15 % ciberseguridad y 10 % razonamiento y matemáticas. Esta ponderación busca que las fusiones BPE favorezcan la compresión de código, terminología de seguridad y expresiones matemáticas, además del texto bilingüe. El repositorio incluye además `token_bytes.pt`, una tabla de longitud en bytes UTF-8 pensada para calcular la métrica BPB (bits per byte) durante la evaluación.

La presencia de tokens especiales dedicados a `think`, `output` y `tool` indica que el modelo asociado contempla modos de razonamiento explícito y llamadas a herramientas, aunque el tokenizador por sí solo no implementa esas capacidades.

## Capacidades

- Tokenización byte-level BPE de texto en inglés e indonesio, con cobertura completa de UTF-8 gracias a los 256 tokens de byte.
- Compresión optimizada para código, ciberseguridad y contenido matemático, derivada de la ponderación del corpus de entrenamiento.
- Estructuración de diálogos multi-turno mediante los tokens `<|user_start|>`, `<|user_end|>`, `<|assistant_start|>` y `<|assistant_end|>`.
- Soporte de modo de razonamiento mediante `<|think_start|>` y `<|think_end|>`.
- Soporte de llamadas a herramientas mediante `<|tool_start|>` y `<|tool_end|>`.
- Delimitación explícita de la salida final mediante `<|output_start|>` y `<|output_end|>`.
- Compatibilidad con el ecosistema `tiktoken`, lo que permite su uso en pipelines existentes basados en esa librería.
- Cálculo de la métrica BPB habilitado por la tabla `token_bytes.pt`.
- No incluye capacidades de generación, visión, audio ni inferencia: es exclusivamente un componente de tokenización.

## Casos de uso

- Entrenamiento de modelos bilingües inglés-indonesio: el tokenizador puede emplearse como componente de tokenización en el preentrenamiento de modelos fundacionales, ya que su vocabulario se ajustó específicamente al mix de 40.200 millones de tokens de Mesosfer v2 y reduce el número de tokens necesarios para representar texto en ambos idiomas.
- Preprocesamiento de corpus de ciberseguridad: dado que el 15 % del corpus de entrenamiento del tokenizador proviene de este dominio, resulta adecuado para tokenizar informes de vulnerabilidades, trazas de logs y documentación técnica de seguridad con una fragmentación menor que la de un tokenizador generalista.
- Tokenización de código en pipelines de análisis estático: con un 25 % del corpus dedicado a código, el vocabulario favorece la compresión de identificadores, palabras clave y estructuras sintácticas, lo que lo hace útil en herramientas de análisis y generación de código.
- Evaluación de modelos con la métrica BPB: la inclusión de `token_bytes.pt` permite calcular bits per byte de forma directa, lo que facilita comparaciones de perplejidad entre modelos con vocabularios distintos.
- Replicación del pipeline de Mesosfer v2: el repositorio documenta la descarga en el directorio de caché por defecto (`~/.cache/mesosfer/tokenizer`) y la carga mediante `RustBPETokenizer.from_directory`, lo que permite reproducir exactamente el preprocesamiento del proyecto original.
- Formateo de conversaciones para fine-tuning: los 11 tokens especiales permiten serializar diálogos multi-turno, trazas de razonamiento y llamadas a herramientas en un formato consistente para el ajuste supervisado del modelo asociado.
- Integración en servicios basados en `tiktoken`: al ser compatible con esa librería, puede sustituir a otros codificadores en servicios existentes sin reescribir la capa de tokenización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de compresión (tokens por carácter o por palabra), comparaciones de fertilidad con otros tokenizadores ni resultados de BPB sobre corpus de evaluación.

## Requisitos de hardware

- El tokenizador no requiere GPU: la tokenización BPE se ejecuta en CPU y el artefacto ocupa 0,0 GB según los metadatos del repositorio.
- No aplican estimaciones de VRAM, puesto que no hay pesos neuronales que cargar.
- El coste computacional se limita al proceso de codificación y decodificación en CPU; la implementación `rustbpe` está escrita en Rust y es sustancialmente más rápida que las implementaciones BPE puramente en Python.
- El despliegue se realiza mediante la librería `tiktoken` o mediante el módulo `mesosfer.data.tokenizer.RustBPETokenizer` del repositorio Mesosfer.
- No se dispone de datos de latencia ni de throughput publicados.

## Comparativa con modelos similares

| Tokenizador | Tamano de vocabulario | Idiomas | Formato | Licencia |
|---|---|---|---|---|
| Mesosfer v2 Tokenizer (96K) | 98.304 | en, id | `tiktoken` (`tokenizer.pkl`) | Apache 2.0 |
| Tokenizadores de la familia GPT-4 (`cl100k_base`, `o200k_base`) | 100.256 / 200.019 | Multilingüe | `tiktoken` | Propietaria |
| Tokenizadores de Llama 3 | 128.256 | Multilingüe | SentencePiece / `tiktoken` | Licencia comunitaria de Llama 3 |

La comparación se limita a parámetros estructurales, ya que no se han publicado métricas de fertilidad ni de BPB que permitan contrastar el rendimiento relativo de estos vocabularios sobre los mismos corpus.

## Limitaciones y advertencias

- El repositorio contiene únicamente el tokenizador; no incluye los pesos del modelo Mesosfer v2 (`d24`, 3,36B), por lo que no puede emplearse para generar texto.
- El vocabulario está optimizado para inglés e indonesio. Su comportamiento en otros idiomas, incluido el español, no está documentado y probablemente produzca una fragmentación mayor.
- La model card no documenta sesgos del corpus de entrenamiento; dado que el 15 % del mix corresponde a ciberseguridad, podría existir una sobrerrepresentación de terminología ofensiva o de vulnerabilidades.
- No se han publicado evaluaciones de fertilidad ni comparaciones con otros tokenizadores, lo que impide verificar empíricamente las ventajas de compresión declaradas.
- El repositorio registra 0 descargas y 0 likes, y el autor no cuenta con un historial verificable en la plataforma; conviene auditar el artefacto antes de integrarlo en producción.
- La fecha de creación indicada en los metadatos (2026-11-22) es posterior a la fecha habitual de consulta, lo que puede indicar un problema en los metadatos del repositorio.
- La licencia Apache 2.0 permite uso comercial, pero no se especifican términos adicionales sobre el corpus de entrenamiento ni sobre posibles restricciones derivadas de los datos originales.
- Los tokens especiales están vinculados a la implementación concreta del modelo Mesosfer v2; su reutilización con otro modelo requeriría reentrenar o reasignar los identificadores.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Dummy9898/mesosfer-v2-tokenizer-96k
- Librería `tiktoken`: https://github.com/openai/tiktoken
- Repositorio `rustbpe`: no disponible en la información proporcionada
- Repositorio del proyecto Mesosfer: no disponible en la información proporcionada
- Documentación o paper del modelo Mesosfer v2 (`d24`, 3,36B): no disponible en la información proporcionada
