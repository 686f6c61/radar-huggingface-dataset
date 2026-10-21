# bambocher/Qwen3.8-27B-oQ2.5e-mtp

## Resumen

Qwen3.8-27B-oQ2.5e-mtp es una cuantizacion mixta de un modelo de 27.781 millones de parametros publicada por el usuario bambocher en Hugging Face. No es un modelo entrenado desde cero: es un checkpoint cuantizado con la herramienta oQ (oMLX v0.7.1), que aplica precision mixta por tensor y deja el conjunto en una media efectiva de 3,643 bits por peso. El resultado ocupa 12,651 GB (11,782 GiB) en safetensors, frente a los aproximadamente 55,6 GB que requeriria el mismo modelo en BF16, lo que supone una reduccion de tamano de en torno a 4,4 veces.

El checkpoint esta empaquetado para MLX, la libreria de Apple para ejecutar modelos sobre silicio de la compania con memoria unificada, de modo que su publico objetivo son equipos Mac con Apple Silicon y no GPUs NVIDIA. La ficha del autor desglosa el reparto de bits y confirma tres componentes diferenciados: el modelo de lenguaje (26,896B parametros), un codificador de vision (0,461B) y una cabeza MTP (multi-token prediction, 0,425B) de 0,425B parametros, lo que apunta a un modelo multimodal con decodificacion especulativa integrada.

Su relevancia practica es la de permitir ejecutar un modelo de casi 28B en hardware de consumo con memoria unificada moderada, a costa de una agresiva compresion: el 77,1% de los pesos logicos queda almacenado a 2 bits afines en grupos de 64. Es, por tanto, un artefacto de interes para experimentacion local y no una referencia de calidad. La model card no documenta el modelo base exacto, la longitud de contexto, los idiomas ni la licencia, lo que limita seriamente su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle; la etiqueta del repo es `qwen3_5` (familia Qwen3.5). Incluye torre de vision y cabeza MTP |
| Parametros totales | 27.781.427.952 (27,781B) |
| Parametros activos | No disponible (no se confirma que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Mixta oQ (oMLX v0.7.1): afines 2/3/4/5/6/8 bits con grupo de 64 y restos en BF16. Media efectiva 3,643 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors en formato MLX (`library_name: mlx`) |
| Desglose por componente | Lenguaje 26,896B (11,415 GB); vision 0,461B (0,921 GB); cabeza MTP 0,425B (0,314 GB) |
| Tamano del repo | 12,7 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no describe el entrenamiento del modelo base: no se indican tokens de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. Lo unico documentado es el proceso de cuantizacion posterior. La etiqueta `qwen3_5` sugiere que el checkpoint deriva de la familia Qwen3.5 de Alibaba, y el nombre del repo indica "Qwen3.8-27B" como base, pero ninguna de las dos referencias se desarrolla en la model card ni se enlaza el modelo original.

El interes tecnico esta en la estrategia de cuantizacion mixta y en la presencia de una cabeza MTP. oQ asigna precision de forma no uniforme: 21,422B parametros (77,109%) se guardan a 2 bits afines con grupo de 64 (2,50 bits/peso efectivos), mientras que 2,923B (10,521%) suben a 5 bits y 2,543B (9,153%) a 8 bits, presumiblemente las capas mas sensibles (embeddings, cabezas de atencion o modulos de vision). Solo 0,516B quedan en BF16. La cabeza MTP de 0,425B parametros es un modulo de prediccion multi-token, una tecnica de decodificacion especulativa que permite proponer varios tokens por paso y verificarlos en paralelo; su utilidad en este checkpoint es reducir latencia en inferencia local, aunque el autor no publica mediciones de speedup.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base (sin evaluacion publicada en este checkpoint).
- Procesamiento de imagen: el checkpoint incluye explicitamente una torre de vision de 0,461B parametros, por lo que el modelo es multimodal entrada de imagen/texto.
- Decodificacion acelerada mediante cabeza MTP (multi-token prediction), orientada a reducir latencia por token generado.
- Ejecucion nativa en MLX sobre Apple Silicon, con carga directa desde safetensors sin conversion.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Soporte multilingue: no disponible; el autor no declara idiomas.
- Modo thinking explicito, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Prototipado local en Mac: cargar el checkpoint con mlx-lm u oMLX para validar prompts, plantillas y flujos antes de mover el proyecto a un modelo base sin cuantizar o a un servicio en la nube. El atractivo es el tamano: 11,78 GiB de pesos caben en un Mac de 16-24 GB de memoria unificada.
- Pruebas de pipelines multimodales en local: al incluir torre de vision, sirve para experimentar con descripcion de imagenes, extraccion de texto de capturas o clasificacion visual sin depender de APIs externas, aceptando la perdida de calidad propia de una cuantizacion a 2 bits.
- Evaluacion comparativa de cuantizaciones: util como punto de la curva "2-3 bits" frente al BF16 original y frente a variantes de 4 y 8 bits del mismo modelo, para medir la degradacion real en las tareas concretas de cada proyecto.
- Generacion de texto asistida en escritorio con memoria limitada: resumenes, reescritura o borradores en una aplicacion macOS que corra integramente en local, sin enviar datos a terceros.
- Docencia y divulgacion: demostrar en un portatil que es la cuantizacion mixta, que es una cabeza MTP y como se reparte la precision por tensor, usando el desglose de bits publicado como material de partida.
- Benchmarking de latencia en hardware Apple: medir el efecto de la decodificacion especulativa de la cabeza MTP sobre M-series comparando con el mismo modelo sin MTP, para decidir si merece la pena en un producto con requisitos de tiempo real.
- Filtrado y clasificacion por lotes en local: tareas de etiquetado simples sobre volumenes moderados de texto donde el coste de una GPU en la nube no se justifica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MMMU ni ninguna otra metrica de calidad, ni mediciones de latencia o throughput. Tampoco se documenta la degradacion respecto al modelo base sin cuantizar.

| Metrica | Valor |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Evaluacion multimodal (MMMU u otras) | no disponible |
| Tokens por segundo en Apple Silicon | no disponible |
| Perplejidad respecto al BF16 original | no disponible |

## Requisitos de hardware

- Memoria para pesos: 11,782 GiB (12,651 GB) segun el desglose del autor. Es el minimo absoluto, sin cache KV.
- Memoria total estimada para inferencia: del orden de 14-16 GB con contexto corto, sumando pesos, cache KV, buffers de MLX y el grafo de computo. Cifra estimada a partir del tamano del checkpoint, no publicada por el autor; el consumo real depende de la longitud de contexto, que no esta documentada.
- Hardware: exclusivamente Apple Silicon (M1, M2, M3 o M4 y variantes Pro/Max/Ultra). El formato MLX no se ejecuta de forma nativa en CUDA.
- Configuracion minima razonable: Mac con 16 GB de memoria unificada y contexto corto; 24-32 GB recomendables para trabajar con comodidad o con contextos largos. En 16 GB el margen es estrecho.
- GPU NVIDIA: no soportado tal cual. No hay pesos GGUF ni safetensors estandar, por lo que llevarlo a vLLM, TGI o llama.cpp exigiria de-cuantizar y reconvertir, con perdida de la ventaja de tamano.
- Opciones de despliegue: mlx-lm, MLX y oMLX (la herramienta que genero el checkpoint). Ollama y llama.cpp no cargan este formato sin conversion.
- Latencia y throughput: no disponibles. La cabeza MTP esta disenada para acelerar la decodificacion, pero no hay cifras publicadas de tokens por segundo ni de factor de speedup.

## Comparativa con modelos similares

No se dispone de datos del modelo base sin cuantizar ni de otras cuantizaciones del mismo modelo, por lo que la comparativa se limita a lo que se puede derivar del tamano del checkpoint.

| Modelo | Parametros | Contexto | Formato | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-oQ2.5e-mtp (este) | 27,781B | no disponible | safetensors MLX, 3,643 bits/peso efectivos | 12,65 GB | no disponible | publico, 0 descargas |
| Mismo modelo en BF16 (derivado) | 27,781B | no disponible | BF16 | ~55,6 GB (calculado: 27,781B x 2 bytes) | no disponible | no publicado en este repo |
| Cuantizacion de 8 bits del mismo modelo | 27,781B | no disponible | no disponible | no disponible | no disponible | no disponible |
| Otros modelos de ~27-30B en MLX | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion con alternativas reales de la misma categoria (por ejemplo, otras familias de ~30B con soporte MLX) no puede hacerse con rigor porque la informacion proporcionada no incluye el modelo base, ni su licencia, ni metricas de calidad.

## Limitaciones y advertencias

- Cuantizacion muy agresiva: el 77,1% de los pesos logicos esta a 2 bits efectivos (grupo de 64). Es esperable una degradacion notable en razonamiento, matematicas y codigo frente al modelo original; el autor no publica ninguna medicion de esa perdida.
- Licencia no disponible: sin licencia declarada no hay base legal clara para uso comercial. Conviene localizar el modelo base y verificar sus terminos antes de integrarlo en un producto.
- Idiomas no declarados: no se puede asumir un buen rendimiento en castellano sin evaluarlo.
- Longitud de contexto desconocida: no se puede dimensionar la cache KV ni garantizar conversaciones multi-turno largas o analisis de documentos extensos.
- Riesgo de alucinacion: inherente a los modelos de lenguaje y probablemente acentuado por la compresion a 2 bits en la mayoria de las capas.
- Trazabilidad insuficiente: la model card no enlaza el modelo base ni indica la revision exacta sobre la que se cuantizo, lo que dificulta reproducir el resultado o auditar el origen de los pesos.
- Dependencia de plataforma: MLX ata el modelo a Apple Silicon. No hay ruta directa a servidores NVIDIA, y la conversion a otros formatos implicaria de-cuantizar y reconstruir el checkpoint.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta. No hay validacion externa, informes de terceros ni issues que confirmen que el checkpoint carga y genera correctamente.
- Fecha de creacion atipica (2026-10-20): conviene verificar la integridad del repositorio y de los pesos antes de confiar en el artefacto.
- La cabeza MTP anade complejidad al grafo; si la herramienta de inferencia no la soporta explicitamente, puede ignorarse o provocar errores de carga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/Qwen3.8-27B-oQ2.5e-mtp
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Modelo base, paper, blog o demo: no disponibles en la informacion proporcionada.
