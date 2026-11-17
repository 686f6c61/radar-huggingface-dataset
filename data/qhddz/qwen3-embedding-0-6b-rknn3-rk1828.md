# qhddz/qwen3-embedding-0.6b-rknn3-rk1828

## Resumen

Qwen3-Embedding-0.6B (RKNN3 / RK1828) es una conversión del modelo de embeddings de texto Qwen3-Embedding-0.6B de Alibaba Qwen, publicada por el usuario qhddz, empaquetada en formato RKNN3 para ejecutarse sobre la NPU Rockchip RK1828. El modelo original genera vectores densos de 1024 dimensiones y está pensado para tareas de búsqueda semántica y recuperación aumentada por generación (RAG). Esta versión concreta no es un modelo nuevo ni un reentrenamiento: es un artefacto de despliegue que traduce los pesos originales a un grafo ejecutable por la NPU, con cuantización GRQ W4A16.

La relevancia de esta ficha radica en que resuelve el problema de llevar un modelo de embeddings de calidad a hardware de borde con aceleración NPU, evitando al usuario la compilación y conversión del grafo. El autor afirma que los ficheros `.rknn` se generaron con los pipelines oficiales del rknn3-model-zoo y se verificaron sobre hardware RK1828 real. El repositorio ocupa 0,6 GB e incluye pesos convertidos, tokenizador en GGUF, un fichero de embedding auxiliar y una demo precompilada para host x86_64 que se comunica con la NPU por PCIe.

Conviene subrayar que se trata de un artefacto de inferencia, no de un modelo de propósito general: no genera texto ni mantiene conversaciones. Su única función es transformar texto en vectores de 1024 dimensiones. Cualquier uso como modelo generativo es un error de categoría.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (modelo de embeddings Qwen3-Embedding-0.6B, convertido a grafo RKNN3) |
| Parametros totales | 0,6 mil millones (aproximado, segun el nombre del modelo original) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GRQ W4A16 (pesos de 4 bits, activaciones de 16 bits) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (Alibaba Qwen) |
| Formato de pesos | .rknn (grafo compilado para NPU), tokenizador en GGUF, embedding auxiliar .bin |
| Dimension del vector de salida | 1024 (float32) |
| Plataforma objetivo | Rockchip RK1828 (RKNN3, host x86_64 via PCIe) |
| Tamano del repositorio | 0,6 GB |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-Embedding-0.6B de Alibaba Qwen, un encoder transformer dedicado a la produccion de representaciones densas de texto. Esta publicacion no aporta informacion sobre el proceso de entrenamiento original: no se detallan el numero de tokens, la composicion del dataset ni si hubo etapas de ajuste con datos de pares o preferencias. Tampoco se describe la innovacion tecnica del modelo base, mas alla de su funcion como extractor de embeddings.

Lo que si documenta el autor es la cadena de conversion: los pesos se transformaron con los pipelines oficiales del rknn3-model-zoo y se cuantizaron con GRQ W4A16, un esquema que reduce los pesos a 4 bits y mantiene las activaciones en 16 bits. El resultado es un grafo `.rknn` ejecutable directamente sobre la NPU RK1828, acompanado de un tokenizador en formato GGUF y un fichero `.embed.bin` auxiliar. No se especifica si la cuantizacion introduce perdida medible de calidad mas alla de la similitud coseno reportada en la demo.

## Capacidades

- Generacion de embeddings de texto de 1024 dimensiones en formato float32.
- Busqueda semantica y recuperacion de documentos para pipelines RAG.
- Calculo de similitud coseno entre textos; el autor reporta 0,958 para parafrasis y 0,283 para textos no relacionados.
- Ejecucion sobre NPU Rockchip RK1828 con prefill medido de 76,7 ms.
- Inferencia desde host x86_64 mediante PCIe, usando la demo C++ incluida.
- No soporta generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Busqueda semantica en aplicaciones de borde: el modelo convierte consultas y documentos en vectores de 1024 dimensiones que se comparan por similitud coseno, todo ejecutado en la NPU RK1828 sin depender de la nube. Es adecuado porque el prefill de 76,7 ms permite respuestas interactivas en dispositivos locales.
- RAG en dispositivos con recursos limitados: se indexan fragmentos de documentacion como embeddings y se recuperan los mas relevantes antes de pasarlos a un modelo generativo. La cuantizacion W4A16 reduce el coste de memoria, lo que encaja en un despliegue de borde.
- Deduplicacion y agrupamiento de textos: los vectores permiten detectar documentos casi identicos o agrupar tickets de soporte por tematica. La similitud de 0,958 entre parafrasis reportada por el autor respalda esta aplicacion.
- Clasificacion semantica ligera: comparar la similitud de un texto con prototipos de cada categoria sirve como clasificador de bajo coste en entornos sin GPU.
- Filtrado de contenido y moderacion local: los embeddings permiten medir la cercania de un mensaje a patrones problematicos predefinidos, ejecutando la inferencia en el propio dispositivo.
- Sistemas de recomendacion basados en contenido: representar articulos o perfiles como vectores y calcular afinidades con similitud coseno, con la ventaja de que la NPU libera la CPU del host para otras tareas.
- Procesamiento por lotes en el borde: la demo precompilada permite integrar la extraccion de embeddings en pipelines C++ sobre x86_64 con la NPU como acelerador, sin recompilar el grafo.

## Benchmarks y rendimiento

El autor solo publica dos metricas medidas sobre RK1828: latencia de prefill de 76,7 ms y similitud coseno de 0,958 para parafrasis frente a 0,283 para textos no relacionados. No se aportan resultados de MMLU, MTEB, HumanEval ni otros benchmarks estandar de embeddings en la informacion disponible.

| Metrica | Valor | Contexto |
|---|---|---|
| Prefill en RK1828 | 76,7 ms | Medido por el autor sobre hardware real |
| Similitud coseno (parafrasis) | 0,958 | Pares de parafrasis |
| Similitud coseno (textos no relacionados) | 0,283 | Pares sin relacion semantica |

## Requisitos de hardware

- NPU Rockchip RK1828 obligatoria para ejecutar el grafo `.rknn`; no es un modelo ejecutable en GPU convencional.
- Host x86_64 con conexion PCIe a la NPU, segun la demo incluida.
- VRAM: no aplica; el modelo se ejecuta sobre la memoria de la NPU, no sobre memoria de GPU.
- GPU recomendadas: no disponible; el artefacto no esta pensado para A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no disponible; el modelo no se distribuye en formato ejecutable por GPU.
- Opciones de despliegue: demo C++ precompilada para x86_64 con librerias de runtime incluidas en `demo_x86_64.tar.gz`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 76,7 ms de prefill medidos en RK1828.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Plataforma |
|---|---|---|---|---|---|
| Qwen3-Embedding-0.6B (RKNN3 / RK1828) | 0,6 B | no disponible | .rknn, GGUF (tokenizador) | Apache-2.0 | NPU Rockchip RK1828 |
| Qwen3-Embedding-0.6B original | 0,6 B | no disponible | safetensors | Apache-2.0 | GPU/CPU convencional |
| Alternativas de embeddings de 0,5-1 B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa con otras alternativas de embeddings no esta disponible en la informacion proporcionada. La diferencia clave frente al modelo original es el formato y la plataforma de ejecucion, no la arquitectura ni el tamano.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, codigo ni respuestas conversacionales; usarlo como tal es un error de categoria.
- Dependencia de hardware: el grafo `.rknn` solo se ejecuta en la NPU Rockchip RK1828; no hay version para GPU ni CPU convencional en este repositorio.
- La cuantizacion GRQ W4A16 puede degradar la calidad de los embeddings respecto a los pesos originales; no se publica una comparacion sistematica de esa perdida.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Riesgo de alucinacion: no aplica en sentido estricto, pero los embeddings pueden producir similitudes enganosas en dominios especializados.
- Idiomas soportados: no disponible; no se especifica cobertura multilingue.
- Longitud de contexto: no disponible; se desconoce el maximo de tokens por entrada.
- Licencia Apache-2.0, que permite uso comercial, pero el usuario debe verificar las condiciones del modelo base de Alibaba Qwen y de las herramientas de conversion del rknn3-model-zoo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion por terceros.
- El autor indica que los ficheros se verificaron en hardware real, pero no se aportan scripts de validacion reproducibles mas alla de la demo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qhddz/qwen3-embedding-0.6b-rknn3-rk1828
- Repositorio de conversion rknn3-model-zoo: https://github.com/airockchip/rknn3_model_zoo
- Modelo base Qwen3-Embedding-0.6B: no disponible en la informacion proporcionada
