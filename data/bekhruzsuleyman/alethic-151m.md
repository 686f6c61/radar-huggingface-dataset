# bekhruzsuleyman/alethic-151m

## Resumen

Alethic 151M es un modelo de lenguaje decoder-only de aproximadamente 151 millones de parametros, entrenado desde cero por el usuario bekhruzsuleyman sobre el corpus FineWeb-Edu. No es un modelo de proposito general ni un checkpoint final: se presenta explicitamente como un experimento de investigacion activa centrado en una modificacion arquitectonica denominada SinGatedAttention (SGA), que inserta una transformacion no lineal condicionada por la atencion entre el bloque de auto-atencion causal y la red feed-forward de cada capa Transformer.

La pregunta de investigacion que motiva el proyecto es si una senal derivada de la atencion puede actuar como compuerta computacional no lineal, en lugar de utilizarse unicamente como representacion contextual de salida. La implementacion concreta calcula SGA(x) = (Wx + b) multiplicado elemento a elemento por alfa por el seno de la atencion, de modo que la rama lineal define la representacion transformada y la rama de atencion modula su magnitud dentro de un rango acotado por el escalar aprendible alfa.

El checkpoint actual tiene 12 capas, dimension oculta 768, 12 cabezas de atencion, vocabulario de 20.000 tokens con tokenizer SentencePiece Unigram y una ventana de contexto de solo 256 tokens. Con unos 76,8 millones de tokens de entrenamiento muestreados (aproximadamente 0,51 tokens por parametro) y una perdida de validacion en torno a 4,5, el autor lo describe como claramente subentrenado. Su relevancia es, por tanto, academica y metodologica, no practica: sirve para estudiar el efecto de SGA y como referencia reproducible de preentrenamiento de bajo presupuesto en una unica GPU Tesla T4 de 16 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con SinGatedAttention (SGA) como transformacion residual adicional |
| Parametros totales | ~151 millones |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | no disponible (checkpoints en formato PyTorch; el repo ocupa 4,5 GB y no se especifica safetensors ni GGUF) |

Datos adicionales de configuracion:

| Parametro | Valor |
|---|---|
| Capas | 12 |
| Dimension oculta | 768 |
| Cabezas de atencion | 12 |
| Dimension por cabeza | 64 |
| Expansion FFN | 4x |
| Activacion FFN | GELU |
| Normalizacion | LayerNorm |
| Posiciones | embeddings posicionales aprendidos |
| Vocabulario | 20.000 (SentencePiece Unigram) |
| Objetivo | prediccion autorregresiva del siguiente token |
| Precision de entrenamiento | BF16 |
| Hardware de entrenamiento | NVIDIA Tesla T4 16 GB |
| Throughput observado | ~2.446 tokens/segundo |

## Arquitectura y entrenamiento

Cada bloque Transformer de Alethic contiene tres transformaciones residuales en lugar de las dos habituales: x1 = x + MHA(LN(x)), x2 = x1 + SGA(LN(x1)) y x3 = x2 + FFN(LN(x2)). La ruta de atencion causal estandar usa la atencion de producto escalar escalada de PyTorch. SGA anade su propia operacion de atencion multi-cabeza causal seguida de una capa SinGatedLinear, de forma que el bloque incorpora dos caminos de atencion con funciones distintas: uno que produce representacion contextual y otro que produce una senal de compuerta.

Formalmente, SGA primero calcula A = Attention(x), despues aplica una transformacion lineal aprendida a la entrada y modula el resultado con una transformacion sinusoidal de la senal de atencion: SGA(x) = (Wx + b) multiplicado elemento a elemento por [alfa por sin(A)], donde W y b son parametros aprendidos, A proviene de la auto-atencion causal y alfa es un escalar aprendible. Al ser el seno una funcion acotada, la compuerta queda limitada entre -alfa y alfa. El autor subraya explicitamente que esta motivacion es arquitectonica y que no constituye evidencia por si misma de mejora en el rendimiento del modelo.

El entrenamiento se realiza desde cero sobre FineWeb-Edu. El corpus tokenizado contiene 424.051.527 tokens, divididos en 419.811.011 para entrenamiento y 4.240.516 para validacion. La configuracion usa tamano de lote 8, 2.048 tokens por paso de optimizacion, ventana de contexto 256 y precision BF16. En el momento de redactar la model card el run habia superado el paso 37.500, con una perdida de entrenamiento reciente en torno a 4,1 y una perdida de validacion en torno a 4,5. En el paso 37.521 se habian muestreado aproximadamente 76,8 millones de tokens de entrenamiento, lo que equivale a unos 0,51 tokens muestreados por parametro; el autor advierte que, al muestrear ventanas aleatorias de un corpus mapeado en memoria, esa cifra cuenta tokens usados en optimizacion y no tokens unicos visitados. No se documenta en la informacion disponible ninguna fase de RLHF, DPO o ajuste por instrucciones.

## Capacidades

- Generacion de texto autorregresiva basica en ingles: es un modelo base de preentrenamiento, no ajustado por instrucciones ni con RLHF.
- Modelado de lenguaje y continuacion de texto: la tarea para la que fue entrenado, con perdida de validacion en torno a 4,5 (valor intermedio, no final).
- Razonamiento: no disponible; no se han publicado evaluaciones de razonamiento y el nivel de subentrenamiento hace poco probable un rendimiento util.
- Codigo y matematicas: no disponible; no hay evaluaciones ni evidencia de capacidad especifica en estos dominios.
- Tool calling / function calling: no soportado; no hay plantilla de chat, tokens especiales de herramienta ni entrenamiento orientado a agentes.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingues: no; el modelo esta entrenado y declarado unicamente para ingles.
- Vision o audio: no soportado; es un modelo exclusivamente de texto.
- Modo thinking o cadena de pensamiento explicita: no disponible.
- Capacidad especial: la unica particularidad es la capa SinGatedAttention, cuyo interes es experimental y no funcional.

## Casos de uso

- Investigacion en arquitecturas de atencion: el caso de uso principal es reproducir y ablar el mecanismo SGA, comparando bloques con y sin la ruta de compuerta sinusoidal para medir su efecto en la perdida de validacion con un presupuesto fijo de computo.
- Estudio de compuertas condicionadas por atencion: el modelo permite instrumentar la senal A y el escalar alfa capa por capa para analizar si la modulacion sinusoidal satura o se mantiene en un rango estable durante el entrenamiento.
- Referencia de preentrenamiento de bajo presupuesto: sirve como linea base reproducible de un run completo en una unica T4 de 16 GB, con hiperparametros, throughput y curvas de perdida documentados, util para comparar tecnicas de eficiencia.
- Experimentos de tokenizacion: al usar SentencePiece Unigram con vocabulario de 20.000, es adecuado para estudiar el efecto del tamano de vocabulario en modelos pequenos y en corpus educativos filtrados.
- Prototipado educativo: permite ilustrar de forma practica el ciclo completo de preentrenamiento desde cero (tokenizacion, muestreo de ventanas, bucle de optimizacion, validacion) sin necesidad de infraestructura de datacenter.
- Generacion de texto exploratoria en ingles: puede producir continuaciones de texto corto, siempre con contexto limitado a 256 tokens, con fines de demostracion o depuracion de pipelines y no como componente de producto.
- Analisis de corpus FineWeb-Edu: util para inspeccionar que tipo de distribucion linguistica aprende un modelo pequeno entrenado exclusivamente sobre ese dataset filtrado por criterios educativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos de rendimiento documentados son de entrenamiento, no de evaluacion:

| Metrica | Valor |
|---|---|
| Perdida de entrenamiento reciente | ~4,1 |
| Perdida de validacion reciente | ~4,5 |
| Paso de entrenamiento | 37.500+ (37.521 en el calculo de tokens) |
| Tokens muestreados en entrenamiento | ~76,8 millones |
| Tokens muestreados por parametro | ~0,51 |
| Throughput de entrenamiento observado | ~2.446 tokens/segundo en T4 16 GB en BF16 |
| Tokens por paso de optimizacion | 2.048 (lote 8 x contexto 256) |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos de 151 millones de parametros ocupan aproximadamente 604 MB en FP32, 302 MB en FP16/BF16, 151 MB en INT8 y unos 76 MB en INT4. La cache KV es despreciable con contexto 256 (del orden de 9 MB por secuencia en FP16, considerando 12 capas, 12 cabezas y dimension de cabeza 64).
- GPU recomendadas: el modelo se entreno en una NVIDIA Tesla T4 de 16 GB, que es suficiente tanto para entrenamiento como para inferencia. Cualquier GPU con 4 GB o mas de VRAM es suficiente para inferencia en FP16.
- GPU de consumo: cabe sin problema en GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090 y en GPUs integradas con memoria unificada suficiente. Tambien es viable en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: al tratarse de una arquitectura personalizada con la capa SGA, no se puede cargar con AutoModel estandar de Transformers sin codigo propio; requiere ejecutar el codigo del autor con PyTorch. No hay versiones GGUF, por lo que llama.cpp y Ollama no lo soportan directamente sin una conversion y una implementacion de la capa SGA. vLLM y TGI no soportan la arquitectura de forma nativa. La via realista es PyTorch directo.
- Latencia y throughput estimados: el unico dato disponible es el throughput de entrenamiento observado, aproximadamente 2.446 tokens por segundo en una T4 en BF16 con lote 8. No se han publicado mediciones de latencia de inferencia.

## Comparativa con modelos similares

Los datos de la columna de Alethic 151M proceden de la model card. Las cifras de los modelos comparados provienen de su documentacion publica habitual y no forman parte de la informacion proporcionada en esta busqueda; conviene verificarlas en sus respectivas fichas antes de citarlas.

| Modelo | Parametros | Contexto | Licencia | Idiomas | Benchmarks publicos |
|---|---|---|---|---|---|
| Alethic 151M | ~151M | 256 | MIT | ingles | no disponible |
| GPT-2 small | 124M | 1.024 | licencia MIT modificada de OpenAI | ingles | si, ampliamente documentados |
| Pythia-160M | 160M | 2.048 | Apache 2.0 | ingles | si, con suite de evaluacion publicada |
| SmolLM-135M | 135M | 2.048 | Apache 2.0 | ingles (con datos multilingues parciales) | si, resultados publicados por el autor |

En la misma categoria de tamano, Alethic 151M se distingue por su licencia MIT y por la modificacion arquitectonica SGA, pero queda por detras en longitud de contexto (256 frente a 1.024-2.048) y no ofrece ningun resultado de benchmark publico, a diferencia de las alternativas. Su estado declarado es el de un modelo subentrenado en investigacion, no el de un modelo listo para produccion.

## Limitaciones y advertencias

- Modelo subentrenado: aproximadamente 0,51 tokens muestreados por parametro y una perdida de validacion de ~4,5, valor que el propio autor califica de medicion intermedia y no de resultado final.
- No es un modelo de proposito general: se presenta explicitamente como investigacion activa y no como un modelo de lenguaje terminado ni optimo en computo.
- Ventana de contexto muy limitada: 256 tokens restringen cualquier tarea que requiera coherencia a medio o largo plazo, incluidos dialogos multi-turno o analisis de documentos.
- Solo ingles: no se ha entrenado ni evaluado en otros idiomas; el rendimiento en castellano sera previsiblemente pobre.
- Riesgo de alucinacion elevado: al no estar ajustado por instrucciones ni con RLHF/DPO, el modelo no tiene mecanismos de alineacion conversacional y puede generar contenido factualmente incorrecto o incoherente.
- Sesgos desconocidos: no se ha publicado ninguna evaluacion de sesgos, toxicidad o seguridad; el corpus FineWeb-Edu esta filtrado con criterios educativos, pero no hay analisis disponible del comportamiento resultante.
- Sin soporte de tool calling, agentes ni plantilla de chat: no debe integrarse en pipelines que dependan de function calling o de formato de conversacion estructurado.
- Compatibilidad limitada: la capa SGA es una arquitectura personalizada, por lo que no hay soporte nativo en Transformers, vLLM, TGI, llama.cpp ni Ollama, y no existen pesos en GGUF ni versiones cuantizadas publicadas.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion, sin restricciones adicionales, pero el autor no ofrece garantias sobre el comportamiento del modelo.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion externa por parte de la comunidad.
- Caveat de produccion: no se recomienda su uso en produccion para ninguna tarea orientada al usuario final; su ambito razonable es la experimentacion y la investigacion.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/bekhruzsuleyman/alethic-151m
- Dataset de entrenamiento, FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Paper, blog, repositorio o demo adicionales: no disponible
- Resultados de busqueda web relevantes sobre el modelo: no disponible (la busqueda no devolvio ninguna fuente relacionada con Alethic 151M ni con SinGatedAttention)
