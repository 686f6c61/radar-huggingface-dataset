# H4RUming/embeddinggemma-2-coreml-text

## Resumen

EmbeddingGemma 2 (Core ML, texto) es una conversión a Core ML del modelo de embeddings de texto de Google `google/embeddinggemma-2`, publicada por el usuario H4RUming en Hugging Face. Se trata de una reempaquetación orientada a dispositivos Apple Silicon: el autor ha seleccionado únicamente los ficheros necesarios para generar embeddings de texto (excluyendo los codificadores de voz e imagen) y los distribuye en formato `.mlpackage` para su ejecución nativa mediante Core ML en macOS.

El modelo resuelve un problema concreto: ejecutar embeddings de texto de forma local y eficiente en Mac, sin depender de PyTorch ni de Python. La conversión procede de la versión de FluidInference (`FluidInference/embeddinggemma-2-coreml`, commit `3f978ddf92cac9aa07eb2dcf6eb36cf450f3dba4`) y está pensada como descarga inicial de la aplicación de aprendizaje Pinpage para macOS. Genera vectores de 768 dimensiones normalizados con L2, que pueden truncarse a 512, 256 o 128 dimensiones (renormalizando tras el truncado) según las necesidades de almacenamiento o búsqueda.

Su relevancia actual radica en el creciente interés por la inferencia on-device en Apple Silicon: según las verificaciones del propio autor en un Apple M2, la variante sobre Neural Engine reduce el tiempo de embeddizado de un documento de 2,39 s (PyTorch CPU fp32) a 0,39 s, y la latencia por consulta de 61,8 ms a 5,2 ms, manteniendo una calidad de recuperación prácticamente idéntica a la referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de embeddings basado en Gemma (variante Core ML; detalles no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 512 tokens (funciones `embed_32` a `embed_512`) |
| Tipos de cuantizacion | fp16 (modelo Core ML), bfloat16 (tabla de embeddings de tokens) |
| Idiomas soportados | coreano (ko) y multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML `.mlpackage` (fp16) + tabla de embeddings en bfloat16; no distribuye safetensors ni GGUF |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado por el autor, sino una conversión a Core ML del modelo original `google/embeddinggemma-2` de Google (a su vez derivada de la conversión de FluidInference). Los detalles de arquitectura y del proceso de entrenamiento del modelo base (numero de tokens, composicion del dataset, RLHF/DPO, etc.) no están disponibles en la información proporcionada y deben consultarse en la model card original de Google.

La conversión tiene varias particularidades técnicas destacables:

- El paquete Core ML incluye multiples funciones segun la longitud de entrada (`embed_32` hasta `embed_512`) y una funcion `pack_256`, lo que evita recompilar el grafo por cada tamano de secuencia.
- La tabla de embeddings de tokens (262.144 filas x 512 columnas, en bfloat16) se distribuye como fichero separado (`embeddings.bf16`, 268 MB); en tiempo de ejecucion se lee la fila correspondiente, se multiplica por √512 y se alimenta al modelo.
- El `manifest.json` incluye el tamano y el SHA-256 de cada fichero, de modo que la aplicacion puede verificar la integridad de la descarga.
- Requiere macOS 15 o superior, por tratarse de un modelo Core ML con multiples funciones.

## Capacidades

- Generacion de embeddings de texto de 768 dimensiones, normalizados con L2, listos para busqueda semantica por similitud de coseno.
- Truncado de vectores a 512, 256 o 128 dimensiones con renormalizacion (Matryoshka-style), util para reducir almacenamiento en indices vectoriales.
- Soporte de entradas de longitud variable mediante funciones dedicadas de 32 a 512 tokens.
- Capacidades multilingues, con verificacion documentada en coreano; hereda el tokenizer Gemma original (vocabulario de 262.144 tokens).
- Uso de prompts de tarea: el autor aplica el prefijo `task: search result | query: ` a las consultas y `title: {titulo} | text: ` a los documentos, siguiendo el esquema del modelo original.
- No genera texto, no soporta tool calling, agentes ni modos de razonamiento: es exclusivamente un modelo de feature-extraction.
- No incluye codificadores de voz ni de imagen (fueron excluidos de esta version de texto).

## Casos de uso

- Busqueda semantica local en aplicaciones macOS: el formato Core ML permite ejecutar el modelo sin Python ni PyTorch, ideal para apps nativas en Swift que necesitan indexar y consultar documentos en el dispositivo, como hace Pinpage.
- RAG on-device con privacidad total: al ejecutarse localmente (GPU o Neural Engine), los documentos del usuario nunca salen del equipo, adecuado para material de estudio, notas personales o documentacion sensible.
- Recuperacion de fragmentos de material docente en coreano: las verificaciones del autor muestran hit@5 del 100% sobre parrafos de material de clases en coreano, con consultas en el mismo idioma.
- Busqueda hibrida texto-codigo: el conjunto de prueba incluia fragmentos de codigo Python como documentos candidatos, y el modelo los recupera correctamente, util para buscar entre apuntes que mezclan prosa y codigo.
- Indices vectoriales compactos en movil o portatil: gracias al truncado a 256 o 128 dimensiones con renormalizacion, se pueden reducir los requisitos de almacenamiento del indice en aplicaciones con miles de documentos.
- Verificacion de integridad en distribucion de modelos: el `manifest.json` con SHA-256 por fichero sirve como patron para apps que descargan pesos de forma segura la primera vez que se inician.
- Experimentacion con backends de Apple Silicon: la conversion permite comparar facilmente GPU, Neural Engine y CPU de Core ML frente a PyTorch (MPS) en un mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) en la informacion disponible. El autor del repositorio si publico una verificacion propia de fidelidad y rendimiento (2026-10-28, Apple M2 24 GB, macOS 27.0.1), usando como referencia PyTorch CPU float32 (sentence-transformers) sobre 48 parrafos en coreano de material de clases, 8 fragmentos de codigo Python y 24 preguntas con respuesta conocida:

| Metodo | Coseno minimo | Top-5 solapamiento | Top-5 orden identico | 1er puesto identico | hit@5 | recall@5 | Tiempo 56 docs | Tiempo 1 consulta |
|---|---|---|---|---|---|---|---|---|
| PyTorch CPU fp32 (referencia) | 1.00000 | 100% | 100% | 100% | 100% | 90% | 2,39 s | 61,8 ms |
| Core ML GPU | 1.00000 | 100% | 100% | 100% | 100% | 90% | 1,09 s | 14,7 ms |
| Core ML Neural Engine | 0.99988 | 97,5% | 87,5% | 100% | 100% | 90% | 0,39 s | 5,2 ms |
| Core ML CPU | 0.99984 | 100% | 100% | 100% | 100% | 90% | 1,11 s | 10,9 ms |
| PyTorch GPU (MPS) fp16 | 1.00000 | 100% | 100% | 100% | 100% | 90% | 2,17 s | 42,2 ms |
| PyTorch GPU (MPS) bf16 | 0.99990 | 96,7% | 79,2% | 95,8% | 100% | 90% | 3,26 s | 44,5 ms |

Conclusiones del autor: en los 24 casos, la respuesta correcta quedo siempre dentro del top-5 (hit@5 del 100%) y se recupero el 90% de la evidencia. La variante Neural Engine altero solo la quinta posicion en 3 de 24 consultas, siempre en empates tecnicos (diferencia de puntuacion inferior a 0,0005 entre los puestos 5 y 6). La primera carga requiere compilacion de Core ML (aprox. 70 s en Neural Engine, 45 s en GPU en un M2), con cache posterior. Se trata de mediciones en un unico dispositivo con datos sinteticos reducidos; el propio autor advierte de que otros chips (M3, etc.) y datos reales requieren verificacion independiente.

## Requisitos de hardware

- Sistema: macOS 15 o superior (modelo Core ML con multiples funciones). Destinado a Apple Silicon.
- Almacenamiento: aprox. 0,6 GB de descarga (paquete Core ML de 284 MB, tabla de embeddings de 268 MB, tokenizer de 32 MB y ficheros de configuracion).
- Memoria unificada: el tamano del modelo (unos 550 MB de pesos) es modesto; no se documentan requisitos minimos de RAM.
- Rendimiento medido en Apple M2 (24 GB): 5,2 ms por consulta en Neural Engine, 10,9 ms en CPU, 14,7 ms en GPU; 0,39 s para 56 documentos en Neural Engine. No hay cifras para otros chips.
- Compilacion inicial en dispositivo: aprox. 70 s (Neural Engine) o 45 s (GPU) en el M2, cacheada por Core ML tras la primera ejecucion.
- Despliegue: exclusivamente mediante Core ML (Swift / frameworks nativos de Apple). No es compatible con vLLM, llama.cpp, Ollama ni TGI; para esos entornos debe usarse el modelo original `google/embeddinggemma-2`.
- No requiere GPU discreta ni servidor: esta disenado para ejecucion 100% local en portatiles y sobremesas Mac.

## Comparativa con modelos similares

| Aspecto | H4RUming/embeddinggemma-2-coreml-text | google/embeddinggemma-2 (original) | FluidInference/embeddinggemma-2-coreml |
|---|---|---|---|
| Formato | Core ML `.mlpackage` (solo texto) | Pesos originales (sentence-transformers) | Core ML (conversion de referencia) |
| Salida | 768 dim, L2 (truncable a 512/256/128) | no disponible | 768 dim, L2 |
| Contexto | hasta 512 tokens | no disponible | hasta 512 tokens |
| Contenido | Solo texto (sin voz ni imagen) | Modelo completo | Modelo completo en Core ML |
| Licencia | Apache 2.0 | Apache 2.0 | Apache 2.0 |
| Publico objetivo | Apps macOS (Pinpage) | Uso general | Desarrolladores Core ML |
| Descargas (en el momento de la ficha) | 40 | no disponible | no disponible |

No hay datos de benchmarks comparativos de calidad de embeddings frente a otros modelos multilingues de tamano similar; para esa comparacion debe consultarse la documentacion del modelo base de Google.

## Limitaciones y advertencias

- Las verificaciones de rendimiento y calidad se realizaron en un unico dispositivo (Apple M2 24 GB) con un conjunto de datos sintetico y reducido; el propio autor indica que otros chips (M3, etc.) y material real requieren validacion independiente.
- La variante Neural Engine introduce ligeras desviaciones numericas (coseno minimo 0.99988 frente a la referencia fp32), que pueden alterar posiciones inferiores del ranking en empates con diferencias de puntuacion menores a 0,0005. Para experimentos que exijan consistencia estricta entre participantes, el autor recomienda el backend de GPU de Core ML, identico a la referencia.
- La primera carga requiere compilacion de Core ML (45-70 s en un M2), lo que puede afectar a la primera experiencia de uso de la aplicacion si no se planifica.
- Solo cubre embeddings de texto: los codificadores de voz e imagen del modelo original se han excluido, por lo que no sirve para busqueda multimodal.
- La longitud de entrada esta limitada a 512 tokens por las funciones disponibles.
- El repositorio es muy reciente y de baja adopcion (40 descargas y 1 like en el momento de la ficha), sin comunidad ni mantenimiento demostrado; conviene verificar su estado antes de usarlo en produccion.
- Como modelo de embeddings, hereda los sesgos y el riesgo de representaciones imprecisas del modelo base de Google, no documentados en esta ficha.
- La licencia Apache 2.0 permite uso comercial sin restricciones relevantes; no obstante, los terminos del modelo base de Google deben revisarse en su repositorio original.

## Enlaces

- Repositorio del modelo: https://huggingface.co/H4RUming/embeddinggemma-2-coreml-text
- Modelo base original: https://huggingface.co/google/embeddinggemma-2
- Conversion Core ML de referencia: https://huggingface.co/FluidInference/embeddinggemma-2-coreml
