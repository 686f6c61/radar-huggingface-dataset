# nace-ai/Qwen3.5-4B-GGUF-KQuant

## Resumen

Qwen3.5-4B-GGUF-KQuant es una distribucion cuantizada en formato GGUF del modelo Qwen/Qwen3.5-4B, publicada por nace-ai. No se trata de un modelo nuevo entrenado desde cero, sino de una conversion del modelo base de Qwen a cuantizaciones de tipo K-quant (Q2_K, Q3_K_M, Q4_K_M y Q8_0), pensada para ejecutarse en el motor de inferencia local Kapitsa de Nace.AI sobre Macs con Apple Silicon. La relevancia de esta ficha esta en el proceso de cuantizacion calibrada (KQuant) que aplica el autor: para las variantes Q2_K, Q3_K_M y Q4_K_M se genera una matriz de importancia (importance matrix) a partir de texto de calibracion, con el objetivo de acercar los pesos cuantizados al modelo original en bf16 sin aumentar el tamano ni penalizar la velocidad.

El modelo base declarado tiene 4.326.350.848 parametros (aproximadamente 4,3 mil millones) y una pipeline de tipo image-text-to-text, lo que implica que Qwen3.5-4B es un modelo multimodal que acepta imagen y texto como entrada. El repositorio incluye, ademas de los ficheros GGUF del modelo de lenguaje, un proyector de vision (`mmproj-bf16.gguf`, 0,7 GB) y el propio fichero de matriz de importancia (`imatrix.gguf`). El tamano total del repositorio es de 12,4 GB.

La licencia es Apache 2.0, heredada del modelo base, lo que permite uso comercial sin restricciones adicionales conocidas. La model card solo aporta mediciones para la variante Q4_K_M; el resto de cuantizaciones no han sido evaluadas en la documentacion disponible. El modelo fue creado el 10 de noviembre de 2026 y actualizado el 11 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.5-4B; transformer multimodal image-text-to-text, detalles no especificados) |
| Parametros totales | 4.326.350.848 (~4,3 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M (con importance matrix), Q8_0 (sin importance matrix), bf16 (proyector de vision) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); existe tambien una build MLX 4-bit en otro repositorio |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Qwen/Qwen3.5-4B: no se especifica si es un transformer denso, un modelo con atencion lineal, un hibrido o si incorpora capas MoE. Lo unico confirmado por los metadatos es que se trata de un modelo de tipo image-text-to-text (multimodal, con entrada de imagen y texto) y que tiene aproximadamente 4,3 mil millones de parametros. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento.

La innovacion tecnica destacable de esta publicacion no esta en el modelo base sino en el proceso de cuantizacion. El autor describe KQuant como su esquema de cuantizacion calibrada: en MLX busca las escalas de cada capa y en GGUF construye una matriz de importancia a partir de texto de calibracion. Segun la model card, un paquete solo se publica si, midiendo, resulta mas cercano al modelo original con el mismo tamano y velocidad. Para Q4_K_M se reporta una divergencia KL de 0,018 frente al bf16 (frente a 0,031 de la version sin importance matrix) y un 94,2% de coincidencia en el token top frente al bf16 (frente a 93,2% de la version plana). La model card indica que el fichero incluye su propia cabeza MTP (multi-token prediction), usada por Kapitsa para la generacion.

## Capacidades

- Generacion de texto conversacional: el modelo base esta etiquetado como conversacional y su uso previsto en Kapitsa incluye una pagina de chat y una API local.
- Entrada multimodal image-text-to-text: el repositorio incluye un proyector de vision (`mmproj-bf16.gguf`), lo que permite procesar imagenes junto con texto.
- Razonamiento matematico: se han publicado resultados en GSM8K (conjunto de test completo de 1.319 preguntas) sobre la variante Q4_K_M, lo que confirma capacidad de resolucion de problemas aritmeticos de varios pasos.
- Generacion de codigo: la model card menciona mediciones de velocidad sobre "una respuesta de codigo de 512 tokens" y el uso de HumanEval como parte del conjunto de calibracion de la matriz de importancia.
- Escritura de texto general: se reporta velocidad de escritura (tok/s) en la medicion de rendimiento.
- Ejecucion local en Apple Silicon: soportado de forma nativa por el motor Kapitsa, con servicio local en `http://127.0.0.1:8000`.
- Compatibilidad con llama.cpp: los ficheros GGUF son ejecutables con llama-server (el autor uso la version `0a94a3f2` del 11 de noviembre de 2026 para las mediciones).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (los idiomas no estan declarados en los metadatos).
- Modo thinking explicito, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede desplegarse con `kapitsa serve` sobre un Mac con Apple Silicon y ofrecer un chat y una API en localhost, adecuado para prototipado de asistentes sin depender de la nube y con los datos sin salir del equipo.
- Procesamiento de documentos con imagenes: gracias al proyector de vision incluido, se puede usar para tareas de image-text-to-text como describir capturas, extraer informacion de figuras o responder preguntas sobre imagenes, en un flujo local.
- Resolucion de problemas matematicos de varios pasos: los resultados publicados en GSM8K (0,930 en el conjunto completo de 1.319 preguntas para Q4_K_M) lo hacen util para asistentes educativos o verificacion de calculos aritmeticos en entornos con recursos limitados.
- Generacion de codigo en local para tareas auxiliares: con un tamano de 2,8 GB en Q4_K_M y una velocidad de escritura de aproximadamente 136 tok/s en un M5 Pro, es viable para autocompletado, generacion de snippets y explicacion de codigo en un portatil, sin GPU dedicada.
- Despliegue en entornos con poca VRAM o memoria unificada: las variantes Q2_K (2,0 GB) y Q3_K_M (2,3 GB) permiten ejecutar el modelo en equipos con memoria muy limitada, a costa de una mayor perdida de fidelidad frente al bf16 (no medida en la model card).
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio incluye el fichero `imatrix.gguf` y variantes con y sin matriz de importancia, lo que lo convierte en un material util para investigadores que quieran reproducir o comparar el efecto de la calibracion en K-quants.
- Integracion en pipelines de CI/CD o herramientas de desarrollo: al ser GGUF compatible con llama.cpp, puede integrarse en scripts y herramientas de linea de comandos que necesiten un modelo pequeno y local para tareas de texto o codigo.

## Benchmarks y rendimiento

La model card solo publica mediciones para la variante Q4_K_M, comparando el fichero con importance matrix (el de este repositorio) frente a un fichero Q4_K_M plano del mismo tamano (2,78 GB ambos).

| Metrica | Q4_K_M plano | Q4_K_M de este repo |
|---|---:|---:|
| Divergencia KL frente a bf16 (menor es mejor) | 0,031 | 0,018 |
| Mismo token top que bf16 | 93,2% | 94,2% |
| GSM8K (1.319 preguntas) | 0,926 | 0,930 |
| GSM8K (primeras 100 preguntas) | 0,95 | 0,94 |
| Velocidad de escritura (tok/s) | 134,5 | 136,1 |

Condiciones de medida declaradas: KL calculada sobre 64 fragmentos de 512 tokens (wikitext-2, chats de GSM8K y HumanEval) contra los logits del GGUF en bf16; GSM8K ejecutado con llama-server, una pregunta cada vez; herramienta llama.cpp `0a94a3f2` (11 de noviembre de 2026); velocidad medida en un MacBook Pro M5 Pro de 48 GB con Kapitsa 0.2.32, usando la cabeza MTP del propio fichero, una respuesta de codigo de 512 tokens a temperatura 0,6 y ejecuciones intercaladas. La lectura de un prompt de 4K tokens es de aproximadamente 2.100 tok/s en ambos casos. El autor advierte que la diferencia entre las dos puntuaciones de GSM8K esta por debajo del ruido de medida (aproximadamente 0,6 puntos sobre 1.319 preguntas).

No se han publicado resultados de benchmarks para el modelo base Qwen3.5-4B ni para las variantes Q2_K, Q3_K_M y Q8_0 en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada para inferencia: aproximadamente 2,0 GB para Q2_K, 2,3 GB para Q3_K_M, 2,8 GB para Q4_K_M y 4,6 GB para Q8_0, a los que hay que sumar 0,7 GB del proyector de vision si se usa la entrada multimodal y el espacio de contexto/KV cache.
- GPU recomendadas: no se especifican en la informacion disponible. El autor documenta explicitamente el uso en Apple Silicon (MacBook Pro M5 Pro de 48 GB), y el motor Kapitsa esta disenado para Macs con Apple Silicon.
- Cabe en GPU de consumo: si, por el tamano de los ficheros (entre 2,0 y 4,6 GB) es compatible con GPUs de consumo con suficiente VRAM, aunque no se detallan modelos concretos en la documentacion. El caso de uso documentado es la memoria unificada de Apple Silicon.
- Opciones de despliegue: Kapitsa (motor de Nace.AI para Apple Silicon, instalable con `brew install nace-ai/tap/kapitsa`, con chat y API en `http://127.0.0.1:8000`) y llama.cpp (llama-server, usado por el autor para las mediciones). No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: en un MacBook Pro M5 Pro de 48 GB con Kapitsa 0.2.32, la escritura de una respuesta de codigo de 512 tokens alcanza aproximadamente 136 tok/s en Q4_K_M, y la lectura de un prompt de 4K tokens unos 2.100 tok/s. No se publican latencias para las demas cuantizaciones.
- Existe tambien una build MLX 4-bit (Qwen3.5-4B-MLX-4bit-KQuant) para el ecosistema MLX de Apple.

## Comparativa con modelos similares

La informacion disponible no incluye datos de otros modelos comparables (ni sus parametros, contexto, rendimiento o licencia) mas alla del propio modelo base Qwen/Qwen3.5-4B. La unica comparacion publicada es interna: el Q4_K_M con importance matrix frente al Q4_K_M plano del mismo tamano, cuyos resultados se recogen en la seccion de benchmarks. No es posible elaborar una comparativa con alternativas de la misma categoria sin inventar datos.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.5-4B-GGUF-KQuant (este) | ~4,3 mil millones | no disponible | Apache 2.0 | GGUF en Hugging Face, build MLX 4-bit |
| Qwen/Qwen3.5-4B (base) | ~4,3 mil millones | no disponible | Apache 2.0 | Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo la variante Q4_K_M ha sido medida y documentada; las variantes Q2_K, Q3_K_M y Q8_0 no tienen resultados de calidad publicados, por lo que su fidelidad frente al bf16 es desconocida.
- La model card advierte que la diferencia de GSM8K entre el Q4_K_M calibrado y el plano (0,930 frente a 0,926) esta por debajo del ruido de medida, por lo que no debe interpretarse como una mejora significativa en esa tarea; la mejora documentada y mas solida es la divergencia KL (0,018 frente a 0,031).
- La cuantizacion introduce perdida de fidelidad respecto al modelo original en bf16; el propio autor cuantifica esa perdida con la divergencia KL y el porcentaje de coincidencia del token top, que no es del 100%.
- No se declaran los idiomas soportados, por lo que no se puede garantizar el rendimiento en castellano ni en otros idiomas concretos.
- No se dispone de informacion sobre sesgos conocidos, tasas de alucinacion ni evaluaciones de seguridad del modelo base en la documentacion proporcionada.
- El motor Kapitsa esta orientado a Apple Silicon; el uso en otras plataformas requeriria llama.cpp u otro runtime compatible con GGUF, y el rendimiento en esas plataformas no esta documentado.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene verificar las condiciones del modelo base Qwen/Qwen3.5-4B por si el autor original anade terminos adicionales no reflejados en esta ficha.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de una publicacion muy reciente y con poca validacion externa.
- El modelo tiene aproximadamente 4,3 mil millones de parametros, un tamano que limita su capacidad en tareas de razonamiento complejo o contextos muy largos frente a modelos de mayor escala; no se dispone de datos de contexto maximo para confirmarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.5-4B-GGUF-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Build MLX 4-bit KQuant: https://huggingface.co/nace-ai/Qwen3.5-4B-MLX-4bit-KQuant
- Motor Kapitsa (GitHub): https://github.com/nace-ai/kapitsa
- Nace.AI: https://www.nace.ai/
