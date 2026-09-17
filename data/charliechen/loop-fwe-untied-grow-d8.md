# CharlieChen/loop-fwe-untied-grow-d8

## Resumen

loop-fwe-untied-grow-d8 es un modelo de lenguaje base (base model) preentrenado por CharlieChen, publicado como artefacto de investigacion asociado al trabajo "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents". Se trata de un transformer con recurrencia (looped transformer) en el que el bloque central se ejecuta varias veces: la configuracion final aplica 4 repeticiones del nucleo sobre un ancho de 1024 y 8 cabezas de atencion, con una coordenada de profundidad d8 dentro de la escalera de escalado del paper.

El checkpoint almacena 321.388.544 parametros en FP32 y esta entrenado exclusivamente sobre FineWeb-Edu con el tokenizador de GPT-2 (via tiktoken) y una longitud de contexto de 2.048 tokens. No es un modelo instruido ni alineado: no hay RLHF, DPO ni ajuste conversacional, y su unico idioma declarado es el ingles. Su relevancia es por tanto experimental: sirve para reproducir y auditar las leyes de escalado de arquitecturas recurrentes y de crecimiento de profundidad, no como asistente listo para produccion.

El modelo se distribuye unicamente como pesos PyTorch (`final.pt`) mas un `result.json` con la configuracion y metricas, y requiere el codebase propio del paper para cargarse; no es un artefacto `AutoModel` de Transformers ni existe version GGUF o safetensors. El repositorio tiene 1,3 GB, cero descargas y cero likes en el momento de la consulta, por lo que no cuenta con validacion independiente de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con recurrencia (looped transformer, variante Untied-Grow d8); implementacion propia `TransformerGPT` |
| Parametros totales | 321.388.544 (almacenados en FP32) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible; solo se publican pesos FP32 |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (`final.pt`); no se publican safetensors ni GGUF |
| Ancho (d_model) | 1.024 |
| Cabezas de atencion | 8 |
| Repeticiones finales del nucleo | 4 |
| Coordenada de profundidad | d8 |
| Tokenizador | GPT-2 via tiktoken; vocabulario de 50.257 tokens, ampliado a 50.304 filas del modelo |
| Corpus de entrenamiento | HuggingFaceFW/fineweb-edu |
| NLL de validacion de preentrenamiento | 2,90106241 nats/token |
| Precisión de referencia del paper | H100 con FlashAttention-3 y autocast en bfloat16 |

## Arquitectura y entrenamiento

La arquitectura es un transformer recurrente ("looped"): en lugar de apilar un numero fijo de bloques distintos, se reutiliza un nucleo que se ejecuta varias veces, con la variante "untied" (pesos no atados entre iteraciones) y "grow" (crecimiento de la profundidad efectiva durante el entrenamiento). La coordenada de profundidad d8 es la coordenada de escalado de la escalera experimental y puede diferir del numero de bloques Transformer realmente ejecutados, segun advierte la propia model card. La recurrencia final evaluada aplica 4 repeticiones del nucleo, con ancho 1024, 8 cabezas de atencion y contexto de 2.048 tokens.

El preentrenamiento se realizo sobre FineWeb-Edu, el subconjunto de web filtrado por calidad educativa de HuggingFaceFW, tokenizado con GPT-2/tiktoken. No se documenta en la informacion disponible el numero exacto de tokens vistos, la composicion detallada del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones (no hay evidencia de ninguna de ellas, y el modelo se declara explicitamente como base). El checkpoint exportado es bit a bit identico al del paper e incluye solo los tensores del modelo y la recurrencia de evaluacion final: no se distribuye estado del optimizador, por lo que no es posible reanudar el entrenamiento desde el.

La innovacion tecnica destacable no esta en la inferencia sino en el objeto de estudio: el paper analiza como el crecimiento de modelo, la recursion y los operadores de frontera afectan a los exponentes de escalado, usando esta familia de checkpoints como evidencia empirica. La validacion de preentrenamiento reportada es de 2,90106241 nats/token, y la evaluacion CORE del paper (media sobre las semillas 0, 1 y 2, con los 91.037 ejemplos de 22 tareas) da una precision de 0,15232196 y un NLL de respuesta de 3,00103890 nats/token.

## Capacidades

- Generacion de texto autoregresiva en ingles como modelo base: continuacion de texto, muestreo y puntuacion de verosimilitud.
- Modelado de lenguaje puro: asignacion de log-probabilidades a secuencias, util para filtrado de corpus y calculo de perplejidad.
- Razonamiento y conocimiento factual: la model card reporta una precision CORE de 0,15232196, propia de un modelo base de este tamano y no de un modelo instruido.
- Codigo y matematicas: no se documentan capacidades especificas ni resultados en HumanEval, MBPP, GSM8K u otros benchmarks de este tipo en la informacion disponible.
- Tool calling / function calling: no soportado; es un modelo base sin plantilla de chat ni entrenamiento en formato de herramientas.
- Agentes y razonamiento multi-paso: no soportado de forma nativa; requeriria ajuste especifico.
- Multilingue: no; la model card declara unicamente ingles (en).
- Capacidades especiales: no se documentan modos de pensamiento (thinking), vision, audio ni decodificacion especulativa propia. La recursion del nucleo es una caracteristica arquitectonica, no una capacidad de interaccion.

## Casos de uso

- Reproduccion de resultados de investigacion: cargar `final.pt` con el codebase `cue-engineering/loop` y ejecutar `eval.py` con el protocolo del paper para verificar la precision CORE y el NLL publicados. Es el uso previsto explicitamente por el autor.
- Estudio de leyes de escalado en arquitecturas recurrentes: comparar este checkpoint (d8, 4 repeticiones) con otros puntos de la escalera para medir como varian los exponentes de escalado con la profundidad efectiva y el ancho.
- Filtrado de corpus por verosimilitud: usar el modelo para puntuar documentos de texto educativo en ingles y descartar aquellos con perplejidad anomala, aprovechando que fue entrenado sobre FineWeb-Edu y por tanto su distribucion de referencia es ese dominio.
- Punto de partida para fine-tuning supervisado: al ser un modelo base denso de 321M parametros y contexto 2.048, admite ajuste en una unica GPU para tareas de clasificacion, resumen extractivo o generacion de dominio restringido en ingles.
- Experimentos de destilacion y generacion de datos sinteticos: emplear el modelo como generador de continuaciones controladas por temperatura para construir corpus de preentrenamiento de modelos mas pequenos.
- Ablacion de tecnicas de crecimiento de profundidad: modificar el numero de repeticiones del nucleo en inferencia y medir el efecto sobre la NLL para validar hipotesis sobre recursion y computo efectivo.
- Comparacion de alternativas de tokenizacion: como el vocabulario es GPT-2 padeado a 50.304 filas, sirve de linea base para medir el coste de vocabularios heredados frente a tokenizadores mas modernos en modelos del mismo rango de parametros.
- Docencia y divulgacion tecnica: es un caso compacto (1,3 GB en disco) para ilustrar en un curso como se evalua un modelo base con CORE y como se interpreta la NLL en nats/token.

## Benchmarks y rendimiento

La informacion disponible solo incluye las metricas archivadas del paper para este checkpoint. No hay resultados publicados de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos en la informacion proporcionada.

| Metrica | Valor | Notas |
|---|---|---|
| NLL de validacion de preentrenamiento | 2,90106241 nats/token | Sobre el corpus de preentrenamiento (FineWeb-Edu) |
| Precision CORE del paper | 0,15232196 | Media sobre semillas 0, 1 y 2; 91.037 ejemplos en 22 tareas |
| NLL de respuesta CORE | 3,00103890 nats/token | Distinto del NLL de validacion de preentrenamiento |

Nota interpretativa: el NLL de respuesta CORE y el NLL de validacion de preentrenamiento no son comparables entre si, segun la propia model card. La precision CORE de 0,152 es baja en terminos absolutos y coherente con un modelo base de 321M parametros sin ajuste por instrucciones.

## Requisitos de hardware

- Peso de los pesos en FP32: 321.388.544 parametros x 4 bytes = aproximadamente 1,29 GB (coherente con el tamano de repositorio de 1,3 GB).
- VRAM estimada en FP32: del orden de 2-3 GB incluyendo activaciones a 2.048 tokens de contexto y buffers de la recurrencia.
- VRAM estimada en bfloat16 con autocast: aproximadamente 0,7-1,5 GB, que es el modo usado en el protocolo del paper (H100 con FlashAttention-3 y autocast bf16).
- GPU de referencia del paper: H100. Tambien es viable en A100, L40S, A10 o T4 con memoria suficiente.
- GPU de consumo: cabe con holgura en cualquier GPU consumer con 6 GB o mas, como RTX 3060, RTX 4060, RTX 4070 o RTX 4090; en FP32 tambien cabe en GPUs de 4 GB si se reduce el tamano de lote.
- Opciones de despliegue: exclusivamente el codebase del paper (`github.com/cue-engineering/loop`, script `eval.py`). No hay soporte para vLLM, TGI, llama.cpp, Ollama, transformers `AutoModel` ni servidores compatibles con OpenAI.
- Formatos servibles: solo `final.pt` en FP32; no existen cuantizaciones GGUF, AWQ, GPTQ ni versiones bf16 publicadas.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia en la informacion proporcionada.
- Almacenamiento: 1,3 GB de repositorio, con `SHA256SUMS` para verificar la integridad de `final.pt`.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks que permitan una comparacion de rendimiento fiable en la informacion proporcionada. La tabla siguiente compara unicamente caracteristicas estructurales conocidas de alternativas del mismo rango de parametros; los datos de los modelos de terceros son los habitualmente documentados por sus autores y no se han verificado contra evaluaciones homogeneas.

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| loop-fwe-untied-grow-d8 | 321 M | 2.048 | Looped transformer (untied, grow) | No disponible | Solo `final.pt` + codebase propio |
| GPT-2 small | 124 M | 1.024 | Transformer denso | MIT | Pesos en Transformers, GGUF, amplio ecosistema |
| Pythia-410M | 410 M | 2.048 | Transformer denso (GPT-NeoX) | Apache 2.0 | Pesos en Transformers, multiples checkpoints intermedios |
| SmolLM2-360M | 362 M | 8.192 | Transformer denso | Apache 2.0 | Pesos en Transformers, cuantizaciones GGUF disponibles |

Diferencias clave: frente a estas alternativas, loop-fwe-untied-grow-d8 ofrece un contexto mas corto, carece de licencia declarada, no es compatible con el ecosistema estandar de inferencia y no tiene cuantizaciones, a cambio de permitir estudiar experimentalmente arquitecturas recurrentes con un checkpoint identico al del paper.

## Limitaciones y advertencias

- Es un modelo base sin alineacion: no sigue instrucciones, no mantiene formato de chat y puede generar contenido Sesgado, ofensivo o factualmente incorrecto sin ninguna salvaguarda.
- Riesgo de alucinacion elevado: con una precision CORE de 0,152 no debe usarse como fuente de conocimiento factual en ninguna aplicacion orientada a usuario final.
- Sesgos conocidos: no se documentan analisis de sesgo, toxicidad o representacion. El corpus FineWeb-Edu es filtrado por calidad educativa en ingles, lo que introduce sesgos de dominio (web angloparlante, registro academico) y de representacion cultural.
- Cobertura idiomatica limitada: solo ingles declarado. El tokenizador de GPT-2 penaliza idiomas distintos del ingles, incluido el castellano, con mayor fragmentacion de tokens.
- Contexto corto: 2.048 tokens, insuficiente para documentos largos, conversaciones multi-turno extensas o pipelines de agentes con memoria amplia.
- Licencia no disponible: no hay terminos de uso publicados. Esto bloquea de facto el uso comercial seguro, ya que no puede verificarse la compatibilidad de los pesos con FineWeb-Edu ni los terminos de redistribucion.
- Sin estado del optimizador: el checkpoint no permite reanudar entrenamiento ni hacer fine-tuning "continuado" exacto desde el punto original.
- Dependencia de codigo propietario: `final.pt` usa una implementacion propia (`TransformerGPT`) y no carga con `transformers.AutoModel`; integrarlo en produccion exige adaptar el codigo del repositorio del paper.
- Sin cuantizaciones publicadas: no hay versiones GGUF, AWQ o GPTQ, por lo que el despliegue en entornos con poca memoria o en CPU queda sin ruta soportada.
- Validacion externa nula: 0 descargas y 0 likes en el momento de la consulta, sin evaluaciones independientes que confirmen las metricas reportadas.
- Detalle sobre la recurrencia: la model card advierte que la coordenada de profundidad d8 puede diferir del numero de bloques Transformer ejecutados; hay que revisar `result.json` antes de asumir un coste computacional concreto por token.
- La fecha de creacion del repositorio indicada en los metadatos es 2026-09-16; conviene verificarla en la pagina del modelo antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CharlieChen/loop-fwe-untied-grow-d8
- Codebase del paper: https://github.com/cue-engineering/loop
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Paper "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents": no disponible (la model card lo menciona por titulo pero no incluye enlace, y la busqueda web no devolvio resultados relevantes sobre el)
- Archivos del repositorio: `final.pt`, `result.json`, `SHA256SUMS` (accesibles desde la pagina del modelo en HuggingFace)
