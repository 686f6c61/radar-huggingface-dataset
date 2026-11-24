# AI4Chem/MatVerse-1.0

## Resumen
MatVerse-1.0 es un modelo fundacional multimodal especializado en ciencia de materiales, desarrollado por AI4Chem. Se construye mediante fine-tuning del modelo Intern-S2-Preview-35B-A3B, un modelo de mezcla de expertos (MoE) de aproximadamente 35.000 millones de parametros totales con 3.000 millones activos por token. El modelo acepta preguntas en texto, opcionalmente acompanadas de imagenes cientificas, y responde en texto.

El problema que aborda es la interpretacion cuantitativa de datos experimentales en ciencia de materiales: lectura de posiciones de pico en difractogramas de rayos X (XRD), inferencia de geometria de coordinacion local a partir de coordenadas atomicas y diagramas de estructura cristalina, y resolucion de problemas cuantitativos que requieren conversiones de unidades. Esto lo hace relevante para laboratorios que necesitan automatizar el analisis de figuras cientificas y problemas de dominio.

El modelo cuenta con una ventana de contexto configurada de 262.144 tokens (256K) compartida entre prompt y respuesta, y se distribuye en precision BF16. El repositorio ocupa 73,6 GB y el checkpoint contiene 36.809.046.384 parametros segun los pesos safetensors. La licencia no esta disponible en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) multimodal, base Intern-S2-Preview-35B-A3B |
| Parametros totales | 36.809.046.384 (aprox. 35B) |
| Parametros activos | Aprox. 3B por token |
| Longitud de contexto | 262.144 tokens (256K), compartida entre prompt y respuesta |
| Tipos de cuantizacion | No disponible (entrenado y distribuido en BF16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento
MatVerse-1.0 emplea una arquitectura de mezcla de expertos multimodal heredada de Intern-S2-Preview-35B-A3B, con aproximadamente 35.000 millones de parametros totales y 3.000 millones activos por token. El modelo procesa entradas de imagen y texto (pipeline image-text-to-text) y genera respuestas textuales. Se distribuye en BF16 y soporta una ventana de contexto de 262.144 tokens.

El entrenamiento de post-entrenamiento se realizo sobre un corpus de 149.792 ejemplos provenientes de dos fuentes. La primera, razonamiento en materiales (30.639 ejemplos), combino problemas de libros de texto, preguntas de recursos cientificos en linea y preguntas curadas por expertos, con variantes generadas cambiando cantidades, unidades o condiciones fisicas; para problemas con respuesta de referencia se retuvieron soluciones generadas independientemente que pasaron verificaciones especificas, y para problemas sinteticos sin referencia al menos seis de diez soluciones independientes debian coincidir en la respuesta final. La segunda, respuesta a preguntas multimodal (119.153 ejemplos), uso imagenes y leyendas de MaCBench para recuperar figuras cientificas relacionadas, seleccionando figuras devueltas tanto por busqueda basada en imagen como en leyenda y filtrando por puntuacion de recuperacion; un modelo profesor genero nuevas preguntas, respuestas y explicaciones breves a partir de cada figura, su leyenda y sus notas. El conjunto final contiene 111.598 ejemplos de opcion multiple y 7.555 de respuesta abierta. Segun la model card, la receta de entrenamiento se valido primero sobre Qwen3-VL-4B-Thinking antes de aplicarla al modelo base de 35B.

## Capacidades
- Generacion de texto y razonamiento cientifico en el dominio de ciencia de materiales.
- Interpretacion de imagenes cientificas: difractogramas XRD, diagramas de estructura cristalina, imagenes de microscopia, tablas y curvas.
- Inferencia de geometria de coordinacion local a partir de coordenadas atomicas y diagramas de estructura.
- Resolucion de problemas cuantitativos con conversiones de unidades.
- Respuesta a preguntas de opcion multiple y de respuesta abierta sobre figuras cientificas.
- Procesamiento conjunto de texto, representaciones simbolicas e imagenes (multimodal image-text-to-text).
- Soporte de razonamiento tipo thinking (el despliegue de ejemplo usa `--reasoning-parser qwen3`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso
- Analisis automatizado de difractogramas XRD: el modelo lee posiciones de pico e intensidades directamente de la imagen del difractograma y responde preguntas sobre el angulo de difraccion, como se muestra en el ejemplo de la model card (pico mas intenso a 39,6 grados 2-theta).
- Interpretacion de estructuras cristalinas: a partir de diagramas de estructura y coordenadas atomicas, el modelo infiere geometria de coordinacion local, util para validar modelos estructurales en flujos de caracterizacion.
- Asistencia en docencia e investigacion en ciencia de materiales: resolucion de problemas cuantitativos de libros de texto y recursos cientificos con conversiones de unidades, aprovechando el corpus de 30.639 ejemplos de razonamiento.
- Analisis de imagenes de microscopia y curvas experimentales: el modelo acepta figuras cientificas (microscopia, tablas, curvas) y responde preguntas de opcion multiple u abiertas sobre ellas, adecuado para triaje de figuras en articulos.
- Extraccion de informacion de figuras en revision de literatura: dado que fue entrenado con 119.153 ejemplos multimodales derivados de figuras cientificas, puede usarse para generar preguntas y respuestas sobre figuras recuperadas de publicaciones.
- Evaluacion de opcion multiple sobre datos cientificos: el formato de 111.598 ejemplos de opcion multiple lo hace adecuado para construir bancos de preguntas y evaluar comprension de figuras en pipelines de control de calidad.
- Despliegue en servidor de inferencia: con vLLM o SGLang en dos H100 80 GB con tensor parallelism de 2 y contexto de 32.768 tokens, puede servir hasta cuatro secuencias concurrentes para Q&A de imagen unica.

## Benchmarks y rendimiento
La model card menciona una seccion de rendimiento que compara MatVerse-1.0 con su modelo base bajo el procedimiento oficial de cada benchmark, pero el texto proporcionado se interrumpe ("Chan") antes de incluir la tabla de resultados. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: el checkpoint en BF16 ocupa 73,6 GB en disco; en memoria requiere al menos ese orden de magnitud para los pesos, mas memoria para KV cache y procesamiento de imagen.
- GPU recomendadas: el despliegue sugerido por el autor usa dos NVIDIA H100 80 GB con tensor parallelism de 2 en BF16.
- Cabe en consumer GPU: no disponible; con 35B parametros totales en BF16 no cabe en GPUs de consumo convencionales (24 GB o menos) sin cuantizacion, y no se documentan cuantizaciones oficiales.
- Opciones de despliegue: vLLM y SGLang, con builds recientes que soporten Intern-S2-Preview. Ejemplo de vLLM: `--tensor-parallel-size 2 --dtype bfloat16 --max-model-len 32768 --max-num-seqs 4 --reasoning-parser qwen3`. Ejemplo de SGLang: `--tp-size 2 --dtype bfloat16 --context-length 32768 --max-running-requests 4 --reasoning-parser qwen3`.
- Latencia y throughput estimados: no disponible; la configuracion de ejemplo limita la concurrencia a cuatro secuencias con contexto de 32.768 tokens, pero no se publican cifras de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MatVerse-1.0 | 36,8B totales / 3B activos (MoE) | 262.144 tokens | No disponible | Hugging Face (AI4Chem/MatVerse-1.0) |
| Intern-S2-Preview-35B-A3B (modelo base) | Aprox. 35B totales / 3B activos | No disponible | No disponible | Hugging Face (internlm/Intern-S2-Preview) |
| Qwen3-VL-4B-Thinking (validacion de receta) | 4B | No disponible | No disponible | No disponible en la informacion proporcionada |

No se dispone de datos de rendimiento comparado entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, contexto y disponibilidad.

## Limitaciones y advertencias
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Riesgo de alucinacion: el modelo genera respuestas a preguntas cientificas y puede producir respuestas incorrectas; la model card describe verificaciones y consensos durante la construccion de datos, pero no garantiza correccion en produccion.
- Limitaciones de contexto o idioma: la ventana configurada es de 262.144 tokens, pero el ejemplo de despliegue la reduce a 32.768 tokens por limitaciones de memoria; los idiomas soportados no estan documentados.
- Restricciones de licencia para uso comercial: la licencia no esta disponible, por lo que no puede confirmarse el uso comercial.
- Caveats para produccion: requiere builds recientes de vLLM o SGLang con soporte para Intern-S2-Preview y `--trust-remote-code`; el rendimiento depende de la configuracion conjunta de ventana de contexto y concurrencia; el modelo esta especializado en ciencia de materiales y su comportamiento fuera de ese dominio no esta documentado; el repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validacion comunitaria.

## Enlaces
- Hugging Face: https://huggingface.co/AI4Chem/MatVerse-1.0
- Paper: https://arxiv.org/abs/2611.25651
- Modelo base: https://huggingface.co/internlm/Intern-S2-Preview
- Guia de despliegue del modelo base: https://huggingface.co/internlm/Intern-S2-Preview/blob/main/deployment_guide.md
