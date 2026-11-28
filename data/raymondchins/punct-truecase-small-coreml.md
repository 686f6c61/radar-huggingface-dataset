# raymondchins/punct-truecase-small-coreml

## Resumen

`raymondchins/punct-truecase-small-coreml` es una conversión a Core ML del modelo `Horizon-Labs/multilingual-punctuation-truecase-small`, un sistema de etiquetado de tokens que predice la puntuación que sigue a cada palabra (`.`, `,`, `?`, `-`, `:` o ninguna) y su capitalización (minúsculas, inicial mayúscula o todo mayúsculas). El autor de la conversión es raymondchins y el modelo está pensado para Speakey, una aplicación de dictado para macOS, que lo ejecuta sobre texto transcrito sin puntuar, mayoritariamente en indonesio y vietnamita informal.

La relevancia de esta ficha es acotada: no se trata de un modelo generativo ni de un LLM, sino de una pieza de preprocesado de texto empaquetada para inferencia en el Neural Engine de Apple. El interés técnico está en el proceso de conversión: cuantización mediante tablas de búsqueda de 8 bits, empaquetado de dos funciones (`len64` y `len256`) que comparten pesos, reescritura de la máscara de atención para mantenerla finita en float16 y externalización de la tabla de embeddings en ficheros binarios int8.

El modelo base se apoya en mmBERT-small y fue entrenado con 1.168.626 ventanas (119 millones de palabras) de FineWeb-2 y FineWeb en 88 idiomas, más 49.144 transcripciones sintéticas de estilo oral en 69 idiomas. La conversión no reentrena nada: solo cambia el formato de almacenamiento y ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (mmBERT-small), empaquetado como paquete Core ML con dos funciones (`len64`, `len256`) que comparten pesos |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Dos formas fijas de entrada: 64 y 256 tokens |
| Tipos de cuantizacion | Pesos lineales en tablas de búsqueda de 8 bits (lookup tables); embeddings en int8 con una escala float16 por fila; activaciones en float16 |
| Idiomas soportados | 88 idiomas en el entrenamiento del modelo base (sin tailandés); uso principal declarado en indonesio y vietnamita |
| Licencia | Apache-2.0 |
| Formato de pesos | Paquete Core ML (`.mlpackage`) más ficheros binarios auxiliares: `embeddings-i8.bin`, `embeddings-i8-scale.bin`, `vocab.bin`, `merges.bin`, `config.json` |

## Arquitectura y entrenamiento

El modelo base es un encoder de tipo transformer (mmBERT-small, con licencia MIT según el `NOTICE`) configurado como clasificador de tokens con 18 etiquetas: combinaciones de cinco marcas de puntuación (`.`, `,`, `?`, `-`, `:`) más la ausencia de marca, cruzadas con tres estados de capitalización (minúsculas, inicial mayúscula, todo mayúsculas). La entrada se pasa siempre en minúsculas, de modo que la predicción de capitalización se hace sin señal de caja en la entrada.

El entrenamiento del modelo original usó 1.168.626 ventanas (119 millones de palabras) de FineWeb-2 y FineWeb (licencia ODC-BY) en 88 idiomas, más 49.144 transcripciones sintéticas de estilo oral en 69 idiomas generadas por Qwen3.8-27B (Apache-2.0). Se eliminaron las transcripciones que compartían alguna frase con los conjuntos de test. Las etiquetas se derivan del texto original. El tailandés no está en los datos de entrenamiento.

La conversión a Core ML introduce varios cambios técnicos relevantes: los pesos lineales se guardan como tablas de búsqueda de 8 bits en lugar de cuantización int8 lineal directa, porque esta última producía errores de etiquetado en el Neural Engine; la máscara de atención se reescribió para permanecer finita en float16; la tabla de embeddings se externaliza en `embeddings-i8.bin` (filas int8) y `embeddings-i8-scale.bin` (una escala float16 por fila), de forma que la aplicación solo lee las filas que usa cada frase; y el tokenizador se guarda en formato binario compacto (`vocab.bin`, `merges.bin`). El `config.json` incluye 18 etiquetas, las dos formas de entrada y 8 frases de sonda con los ids de token y las etiquetas que produce el modelo fp32 original; una carga correcta debe coincidir en al menos el 95 % de las etiquetas (`probeAgree`).

## Capacidades

- Predicción de puntuación por palabra: asigna a cada token una de cinco marcas (`.`, `,`, `?`, `-`, `:`) o ninguna.
- Predicción de capitalización por palabra: minúsculas, inicial mayúscula o todo mayúsculas.
- Etiquetado de tokens (`token-classification`) sobre texto sin puntuar, típicamente salida de ASR.
- Procesamiento multilingüe: cobertura de 88 idiomas en el entrenamiento del modelo base, con foco práctico en indonesio y vietnamita.
- Ejecución en el Neural Engine de Apple mediante Core ML, con dos formas de entrada fijas (64 y 256 tokens).
- Verificación de integridad de la conversión mediante frases de sonda incluidas en `config.json`.
- No soporta generación de texto, tool calling, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Postprocesado de dictado en macOS: la aplicación Speakey ejecuta el modelo sobre la transcripción cruda del ASR para insertar puntuación y mayúsculas antes de mostrar el texto al usuario; el empaquetado Core ML permite inferencia en el Neural Engine sin GPU dedicada.
- Restauración de puntuación en subtítulos automáticos: se aplica el modelo token a token sobre la salida de un sistema ASR para segmentar y cerrar frases con `.`, `?` o `,`, mejorando la legibilidad de subtítulos generados en tiempo casi real.
- Normalización de transcripciones de reuniones: tras la diarización y el ASR, el modelo añade puntuación y capitalización para que el acta sea legible sin revisión manual línea a línea.
- Preprocesado para pipelines de NLP posteriores: textos sin puntuar (por ejemplo, de OCR o de ASR) se normalizan antes de pasarlos a un modelo de resumen o de traducción, que se benefician de límites de frase explícitos.
- Transcripción de notas de voz en aplicaciones móviles: el formato Core ML y la externalización de embeddings permiten cargar solo las filas necesarias por frase, lo que reduce el coste de memoria en dispositivos con recursos limitados.
- Corrección de mayúsculas en textos todo en minúsculas: el modelo detecta inicios de frase y nombres propios probables a partir del contexto, útil para normalizar exportaciones de chats o foros.
- Evaluación de la conversión en CI: las 8 frases de sonda con `probeAgree` al 95 % permiten comprobar automáticamente que una nueva compilación del paquete Core ML mantiene la fidelidad respecto al modelo fp32 original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta el criterio de fidelidad de la conversión: una carga correcta del paquete Core ML debe coincidir con el modelo fp32 original en al menos el 95 % de las etiquetas sobre las 8 frases de sonda de `config.json`.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en el Neural Engine de Apple, no en GPU con memoria dedicada. El repositorio ocupa 0,2 GB.
- Hardware recomendado: dispositivos Apple con Neural Engine (Mac con chip Apple Silicon, iPhone, iPad). No se documentan requisitos mínimos de chip.
- GPU de consumo (NVIDIA/AMD): no soportadas por este paquete Core ML; para esas plataformas habría que usar el modelo base original en otro formato.
- Despliegue: Core ML (paquete `.mlpackage` con las funciones `len64` y `len256`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| raymondchins/punct-truecase-small-coreml | Encoder de etiquetado de tokens, Core ML | 64 y 256 tokens | 88 (base), foco indonesio y vietnamita | Apache-2.0 | Core ML + binarios |
| Horizon-Labs/multilingual-punctuation-truecase-small | Encoder de etiquetado de tokens (modelo base) | no disponible | 88 (sin tailandés) | Apache-2.0 | safetensors (presumible, no confirmado) |
| Modelos de restauración de puntuación basados en BERT multilingüe | Encoder de etiquetado de tokens | típicamente 512 tokens | variable | variable | PyTorch/ONNX |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: solo etiqueta tokens con puntuación y capitalización; no produce texto nuevo ni responde a instrucciones.
- Sesgos idiomáticos: el uso declarado se centra en indonesio y vietnamita informal; el rendimiento en otros idiomas de los 88 del entrenamiento no está documentado en esta ficha.
- El tailandés no está en los datos de entrenamiento del modelo base.
- La entrada se procesa siempre en minúsculas, por lo que la capitalización se predice sin señal de caja en la entrada; errores en nombres propios o siglas son plausibles.
- Longitudes de entrada fijas (64 y 256 tokens): textos más largos deben trocearse, con posible pérdida de contexto en las fronteras.
- La cuantización con tablas de búsqueda de 8 bits y la conversión a float16 pueden introducir divergencias respecto al modelo fp32; el propio autor fija el umbral de aceptación en el 95 % de coincidencia, no en el 100 %.
- Licencia Apache-2.0, que permite uso comercial; el `NOTICE` conserva el aviso original y la licencia MIT de mmBERT-small, que debe mantenerse en las redistribuciones.
- Al ser una versión modificada del modelo original, los cambios están documentados en el campo `source` de `config.json`; conviene revisarlos antes de desplegar.
- Sin datos de benchmarks ni de latencia publicados: la idoneidad para producción debe validarse con las frases de sonda y con datos propios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/raymondchins/punct-truecase-small-coreml
- Modelo base: https://huggingface.co/Horizon-Labs/multilingual-punctuation-truecase-small
- FineWeb-2 (dataset de entrenamiento, ODC-BY): no disponible en la información proporcionada
- FineWeb (dataset de entrenamiento, ODC-BY): no disponible en la información proporcionada
- Qwen3.8-27B (generador de las transcripciones sintéticas, Apache-2.0): no disponible en la información proporcionada
- Documentación de Core ML: no disponible en la información proporcionada
