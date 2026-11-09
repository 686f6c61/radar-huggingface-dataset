# openeurollm/datamix-0.7B-hplt4-globaldedup-100bt-fra_Latn

## Resumen

El modelo `datamix-0.7B-hplt4-globaldedup-100bt-fra_Latn` es un modelo de lenguaje de 0,7 mil millones de parametros desarrollado por el proyecto OpenEuroLLM, una iniciativa europea orientada a construir modelos fundacionales abiertos y multilingues. Se trata de un modelo entrenado desde cero sobre 100 mil millones de tokens del corpus HPLT 4 en frances (variedad Latn), aplicando unicamente deduplicacion global y sin filtrado adicional de calidad, lo que lo convierte en una pieza experimental dentro de la linea de investigacion de mezclas de datos (datamix) del proyecto.

Su relevancia es principalmente metodologica: el nombre del repositorio documenta de forma explicita cada decision del pipeline de datos (corpus de origen, tecnica de deduplicacion, volumen de tokens e idioma), lo que permite aislar el efecto de esas decisiones en el rendimiento final. Es, por tanto, un modelo de referencia para estudiar como afecta la composicion y el filtrado del dataset a un transformer de escala pequena entrenado con un presupuesto fijo de computo.

No es un modelo pensado para uso en produccion ni para tareas de instruccion: no se han publicado datos de benchmarks, no dispone de pipeline declarado y su model card se limita a una linea descriptiva. Debe tratarse como un artefacto de investigacion sobre calidad de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (detalles no disponibles) |
| Parametros totales | 0,7B (700 millones) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, sin GGUF) |
| Idiomas soportados | frances (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 13,4 GB |
| Tokens de entrenamiento | 100B |
| Corpus de entrenamiento | HPLT 4 (frances, Latn), deduplicacion global, sin filtrado adicional |

## Arquitectura y entrenamiento

La informacion publicada no detalla la arquitectura interna mas alla de que se trata de un modelo de 0,7B parametros entrenado desde cero. Por convencion en la familia OpenEuroLLM y por el tamano, cabe esperar un transformer decoder-only denso con atencion causal estandar, aunque no se confirman el numero de capas, la dimension oculta, el numero de cabezas ni la funcion de activacion. Tampoco se especifica la longitud de contexto de entrenamiento ni el tokenizador empleado.

El dato diferencial esta en los datos: 100 mil millones de tokens extraidos de HPLT 4 en frances, sometidos a deduplicacion global (eliminacion de duplicados a nivel de todo el corpus, no solo dentro de shards) y sin ninguna etapa posterior de filtrado por calidad, clasificador o reglas heuristicas. La relacion tokens/parametros es de aproximadamente 143 tokens por parametro, muy por encima del umbral clasico de Chinchilla (20 tokens/parametro), lo que situa al modelo en regimen de sobreentrenamiento y sugiere un interes explicito en medir el retorno de escalar datos sin curar. No se documenta si hubo RLHF, DPO, SFT o ajuste de instrucciones de ningun tipo.

## Capacidades

- Generacion de texto autoregresiva en frances, como capacidad base de un modelo de lenguaje entrenado con objetivo de modelado causal.
- Modelado de lenguaje y calculo de perplejidad sobre texto frances, util para evaluacion de corpus y analisis de dominio.
- No hay evidencia publicada de soporte de tool calling ni function calling.
- No hay evidencia publicada de capacidades de agente ni de razonamiento multi-paso.
- No hay evidencia publicada de modo thinking, vision, audio ni otras modalidades.
- Cobertura multilingue limitada al frances segun los metadatos del repositorio.
- Al no haberse aplicado ajuste de instrucciones, no cabe esperar un comportamiento fiable de seguimiento de instrucciones conversacionales.

## Casos de uso

- Investigacion sobre calidad de datos: servir como punto de control "sin filtrar" frente a variantes del mismo corpus con filtrado, para cuantificar el impacto del curado en la perplejidad y en tareas downstream en frances.
- Estudio de receta de deduplicacion: comparar este modelo con otros datamix del mismo proyecto que aplican deduplicacion local o distinta politica, aislando el efecto de la deduplicacion global.
- Modelado de lenguaje para evaluacion intrinseca: calcular perplejidad sobre conjuntos de validacion franceses (por ejemplo, subconjuntos de Wikipedia o prensa) para caracterizar la distribucion aprendida de HPLT 4.
- Generacion de texto frances como linea base: producir continuaciones de texto para experimentos controlados donde se necesita un modelo pequeno, abierto y reproducible, no un asistente.
- Inicializacion para ajuste fino supervisado: partir de estos pesos para entrenar tareas especificas en frances con presupuesto reducido, dado el bajo coste de inferencia de un 0,7B.
- Docencia y reproducibilidad: usar el modelo como ejemplo didactico de pipeline completo (corpus, deduplicacion, tokens, entrenamiento) en cursos de NLP, al estar todos los hiperparametros de datos reflejados en el nombre.
- Analisis de sesgos y dominio: examinar que vocabulario, entidades y registros absorbe un modelo entrenado exclusivamente con HPLT 4 sin filtrado, como paso previo a disenar filtros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 1,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 2 y 4 GB segun longitud de secuencia y tamano de batch.
- VRAM estimada en int8: en torno a 0,7-1 GB para pesos.
- VRAM estimada en int4 (si se generan pesos GGUF a partir de los safetensors): en torno a 0,4-0,6 GB para pesos.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4090) es suficiente; para entrenamiento o ajuste fino, A100 o H100 con bf16.
- Cabe holgadamente en GPU consumer, incluida la gama de entrada con 6-8 GB, y en CPU para inferencia con llama.cpp si se convierte a GGUF.
- Opciones de despliegue: al publicarse solo safetensors, el camino natural es transformers con PyTorch; vLLM y TGI son viables si se configura el modelo; llama.cpp y Ollama requeririan conversion previa a GGUF, no incluida en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| datamix-0.7B-hplt4-globaldedup-100bt-fra_Latn | 0,7B | no disponible | fr | Apache 2.0 | safetensors en HF |
| Modelos de la familia OpenEuroLLM datamix (otras variantes) | ~0,7B | no disponible | segun variante | Apache 2.0 | safetensors en HF |
| Modelos multilingues pequenos tipo EuroLLM-1.7B | 1,7B | no disponible | multiples lenguas europeas | Apache 2.0 | pesos en HF |
| Modelos base de ~1B en frances (por ejemplo, variantes de la familia Llama adaptadas) | ~1B | no disponible | fr/multilingue | segun modelo | pesos en HF |

La comparacion cuantitativa de rendimiento no es posible: no hay benchmarks publicados para este modelo ni datos de contexto que permitan una tabla homogenea. La comparativa debe leerse en terminos de receta de datos y licencia, no de calidad medida.

## Limitaciones y advertencias

- Ausencia total de filtrado de calidad: el corpus HPLT 4 sin curar incluye texto de baja calidad, spam, boilerplate y contenido repetitivo tras deduplicacion, lo que probablemente degrada la coherencia y aumenta la toxicidad potencial de las salidas.
- Riesgo elevado de alucinacion y de continuaciones incoherentes, especialmente al no haber ajuste de instrucciones ni alineamiento.
- Sesgos desconocidos pero previsibles: la distribucion de HPLT 4 en frances puede sobrerrepresentar ciertos dominios web y registrar sesgos de genero, nacionalidad o ideologia; no se ha publicado ninguna evaluacion al respecto.
- Limitacion idiomatica estricta: solo frances; el rendimiento en otras lenguas, incluido el castellano, no esta soportado ni evaluado.
- Longitud de contexto no documentada: no debe asumirse una ventana larga en produccion.
- Sin pipeline declarado en Hugging Face: no hay garantia de que `AutoModelForCausalLM` cargue correctamente sin inspeccionar la configuracion del repositorio.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de alineamiento hace desaconsejable su despliegue directo en productos sin ajuste fino y evaluacion previos.
- Modelo de investigacion: cero descargas y cero likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openeurollm/datamix-0.7B-hplt4-globaldedup-100bt-fra_Latn
- Organizacion OpenEuroLLM en Hugging Face: https://huggingface.co/openeurollm
- Corpus HPLT: https://hplt-project.org/
- Proyecto OpenEuroLLM: https://openeurollm.eu/
