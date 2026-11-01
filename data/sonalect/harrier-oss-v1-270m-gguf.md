# sonalect/harrier-oss-v1-270m-GGUF

## Resumen

Harrier OSS v1 270M es un modelo de embeddings de 268.098.176 parámetros publicado por Microsoft que convierte texto en vectores densos de 640 dimensiones mediante pooling del último token. La arquitectura subyacente es `Gemma3TextModel`, pero a diferencia de EmbeddingGemma, Harrier fue entrenado como decoder causal con atención completa en todas las capas (`use_bidirectional_attention: false`, `layer_types` con `full_attention` en cada entrada), sin ventana deslizante. El repositorio aquí descrito, `sonalect/harrier-oss-v1-270m-GGUF`, es una conversión a formato GGUF para llama.cpp que no modifica los pesos, solo el contenedor.

La relevancia de esta conversión es técnica: el convertidor oficial de llama.cpp interpreta `Gemma3TextModel` como EmbeddingGemma (atención bidireccional con ventanas deslizantes), lo que produce vectores incorrectos. El autor fuerza la conversión como `gemma3` plano, con atención causal, sin ventana deslizante y pooling del último token, y verifica numéricamente la equivalencia con el código PyTorch de Microsoft. Es un caso útil para quien necesite ejecutar embeddings multilingües de 270M en CPU o GPU con llama.cpp sin depender de `transformers`.

El modelo está pensado para similitud semántica, recuperación de pasajes y extracción de características. Su tamaño reducido (551 MB en float16, 300 MB en Q8_0) lo hace desplegable en entornos con recursos limitados, aunque el autor advierte de un problema de rendimiento en versiones de llama.cpp anteriores al 13 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 3 (`Gemma3TextModel`), decoder causal, atención completa en todas las capas |
| Parametros totales | 268.098.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | float16 (`f16`), 8 bits (`Q8_0`) |
| Idiomas soportados | multilingüe (etiqueta del repo); lista concreta no disponible. Verificaciones realizadas con textos en ruso, alemán e inglés, y párrafos mixtos ruso-inglés |
| Licencia | MIT (pesos); tokenizador Gemma 3 sujeto a Gemma Terms of Use |
| Formato de pesos | GGUF (safetensors en el modelo base) |
| Dimension de embedding | 640 |
| Pooling | último token (`last token`) |
| Normalizacion | L2 recomendada para comparación por coseno |
| Tamano del repo | 0,9 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder de la familia Gemma 3 con 270M de parámetros. La configuración declara `use_bidirectional_attention: false` y todas las entradas de `layer_types` como `full_attention`, es decir, atención causal sin ventana deslizante en ninguna capa. Esto lo separa de EmbeddingGemma, que emplea atención bidireccional con ventanas deslizantes; el convertidor de llama.cpp clasifica erróneamente `Gemma3TextModel` como `gemma-embedding`, por lo que la conversión aquí presentada fuerza la arquitectura `gemma3` con `sliding_window_pattern` igual a 1 (sin ventana escrita). El pooling se lee del fichero `1_Pooling` del repositorio original: último token.

El tokenizador es el de Gemma 3, con vocabulario, merges, normalizador y pre-tokenizador idénticos a los de `granite-embedding-311m-multilingual-r2` de IBM, que llama.cpp registra como `gemma4`. La conversión elimina el token `<image_soft_token>` (id 262144), un token añadido de la entrada de imagen de Gemma 3 que queda por encima de las 262144 filas de embedding del modelo y que el texto nunca produce. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; la model card del autor remite a la de Microsoft para esos datos.

La verificación de equivalencia se hizo comparando los vectores GGUF con el código PyTorch de Microsoft (`transformers` 5.21.0, `torch` 2.14.1, float32, pooling del último token, norma L2) sobre 181 textos de hasta 512 tokens: artículos de Wikipedia en ruso, alemán e inglés sobre diez temas comunes y párrafos mixtos ruso-inglés.

## Capacidades

- Generación de embeddings de texto de 640 dimensiones con pooling del último token.
- Similitud semántica entre frases y párrafos (etiqueta `sentence-similarity`).
- Extracción de características (`feature-extraction`).
- Recuperación de pasajes: el modelo espera una instrucción de una frase delante de la consulta, pero no delante del documento.
- Multilingüismo: etiqueta `multilingual` en el repo; verificado con ruso, alemán e inglés, y con texto mixto ruso-inglés.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio en esta conversión (el token de imagen se elimina explícitamente).

## Casos de uso

- Búsqueda semántica en corpus multilingües: indexar documentos con el modelo (sin instrucción) y consultar con una instrucción de una frase delante de la query; los vectores de 640 dimensiones permiten índices densos compactos en FAISS, Qdrant o pgvector, y el tamaño de 300 MB en Q8_0 abarata el almacenamiento.
- Deduplicación de contenidos: comparar por coseno tras normalizar L2 para detectar artículos, FAQs o tickets repetidos; el pooling del último token y la verificación con coseno mínimo de 0,99952 en Q8_0 frente a la referencia dan margen suficiente para umbrales de similitud.
- Clasificación de textos por similitud a prototipos: calcular el embedding de cada clase como centroide y asignar la clase más cercana, útil en moderación de comentarios o etiquetado de tickets sin entrenar un clasificador.
- Recuperación aumentada (RAG) en entornos sin GPU: desplegar con `llama-server --embedding --pooling last` en CPU; el modelo de 270M cabe en memoria de un portátil y evita dependencias de `transformers` y PyTorch.
- Filtrado previo en pipelines de datos: usar los embeddings como primera etapa de recuperación sobre millones de documentos y reservar un re-ranker más grande para la segunda etapa, reduciendo coste computacional.
- Análisis de similitud entre idiomas: comparar textos en ruso, alemán e inglés sobre el mismo tema (el escenario de validación del autor) para tareas de alineación o detección de traducciones.
- Búsqueda en aplicaciones móviles o edge: con Q8_0 (300 MB) y llama.cpp en CPU, integrar búsqueda semántica local sin enviar texto a un servicio externo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MTEB) en la información disponible. La única evaluación numérica aportada es la equivalencia de los vectores GGUF frente a la implementación PyTorch de Microsoft sobre 181 textos de hasta 512 tokens:

| Fichero | Coseno mínimo frente a referencia | Media |
|---|---|---|
| f16 | 0,999992 | 0,999996 |
| q8_0 | 0,99952 | 0,99971 |

El autor advierte de un problema de rendimiento: llama.cpp anterior al 13 de octubre de 2026 calcula las puntuaciones de todo el vocabulario para cada token del decoder aunque solo se pidan vectores agrupados, lo que hace el modelo varias veces más lento de lo necesario. Corregido en los PR #30445 y #30255 de ggml-org/llama.cpp; los vectores son idénticos en ambos casos. No se proporcionan cifras de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en f16 y 0,35 GB en Q8_0, más overhead de contexto y del runtime de llama.cpp.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo es lo bastante pequeño para ejecutarse en CPU sin penalización grave.
- Cabe en GPU de consumo: sí, en cualquier RTX (incluso series 20xx o inferiores) y en iGPU con memoria unificada.
- Opciones de despliegue: `llama-embedding` y `llama-server --embedding --pooling last` de llama.cpp; el autor lo ejecutó mediante el crate `llama-cpp-2` 0.1.160. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles. El autor solo indica que las versiones de llama.cpp anteriores al 13 de octubre de 2026 son varias veces más lentas de lo necesario para este caso de uso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Embedding | Licencia | Formato |
|---|---|---|---|---|---|
| harrier-oss-v1-270m (GGUF, esta ficha) | 268.098.176 | no disponible | 640 dim, pooling último token | MIT (pesos) | GGUF f16 / Q8_0 |
| microsoft/harrier-oss-v1-270m (original) | 268.098.176 | no disponible | 640 dim, pooling último token | MIT | safetensors |
| IBM granite-embedding-311m-multilingual-r2 | no disponible | no disponible | no disponible | no disponible | no disponible |
| EmbeddingGemma (referencia del convertidor llama.cpp) | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible solo permite comparar con el modelo base (idéntico salvo formato) y mencionar granite-embedding-311m-multilingual-r2 como origen del tokenizador y EmbeddingGemma como arquitectura que el convertidor asume por error. No hay datos de rendimiento comparables entre ellos.

## Limitaciones y advertencias

- No es un modelo generativo: no responde preguntas ni produce texto; solo genera vectores.
- La conversión depende de un parche manual del convertidor de llama.cpp; ejecutar `convert_hf_to_gguf.py` sin esos cambios produce vectores incorrectos (arquitectura `gemma-embedding` con atención bidireccional y ventana deslizante).
- El tokenizador integrado de llama.cpp no se comparó con el del repositorio original; la validación usó los token ids del `tokenizer.json` de Microsoft. Diferencias de tokenización en producción pueden degradar la calidad.
- Es obligatorio que el texto termine en `<eos>`, como hace el tokenizador original, y usar pooling del último token; otras configuraciones dan vectores distintos.
- Las consultas requieren una instrucción de una frase delante; los documentos no. Omitirla o aplicarla a ambos lados altera la similitud.
- Normalizar los vectores en L2 antes de comparar por coseno.
- Licencia MIT para los pesos, pero el tokenizador es el de Gemma 3 y la red tiene las dimensiones de Gemma 3 270M; la model card de Microsoft no nombra modelo base, así que conviene revisar los Gemma Terms of Use para uso comercial.
- Rendimiento degradado en llama.cpp anterior al 13 de octubre de 2026 (PRs #30445 y #30255 sin aplicar).
- No hay información sobre sesgos, riesgo de alucinación (no aplica a un modelo de embeddings, pero sí a posibles falsos positivos en similitud), cobertura idiomática exacta ni longitud máxima de contexto.
- El repo tiene 82 descargas y 0 likes en el momento de la consulta; es una conversión de terceros, no oficial de Microsoft.

## Enlaces

- Repositorio GGUF: https://huggingface.co/sonalect/harrier-oss-v1-270m-GGUF
- Modelo base: https://huggingface.co/microsoft/harrier-oss-v1-270m
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Commit del convertidor usado: https://github.com/ggml-org/llama.cpp/commit/d81235049384534c167caea52b85a694f6103d14
- PR de rendimiento #30445: https://github.com/ggml-org/llama.cpp/pull/30445
- PR de rendimiento #30255: https://github.com/ggml-org/llama.cpp/pull/30255
- Licencia MIT: https://opensource.org/licenses/MIT
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
