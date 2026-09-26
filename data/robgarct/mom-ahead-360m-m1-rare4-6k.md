# robgarct/mom-ahead-360m-m1-rare4-6k

## Resumen

`mom-ahead-360m-m1-rare4-6k` es un modelo de lenguaje de aproximadamente 360 millones de parametros (446,6 M contando embeddings y el extractor de caracteristicas) desarrollado por el usuario `robgarct` y publicado bajo una arquitectura experimental denominada Mixture-of-Memories (MoM). El modelo combina atencion lineal con bancos de memoria recurrentes y un router de lectura denominado "ahead-feature", y esta etiquetado con los terminos recurrent-recall-circuits, mixture-of-memories, linear-attention e in-context-recall. Se trata, por tanto, de una pieza de investigacion orientada a estudiar la capacidad de recuperacion de informacion en contexto (in-context recall), no de un modelo de proposito general listo para produccion.

El entrenamiento se realizo sobre The Pile durante 6.000 actualizaciones, lo que equivale a 3.146 millones de tokens con un batch global de 256 secuencias de 2.048 tokens, aplicando el objetivo `rare4` y la semilla 1111. La configuracion interna es de 24 capas, dimension de embedding 1.024 y 16 cabezas de atencion (dimension por cabeza de 64). Cada capa dispone de un unico banco de memoria.

Su relevancia actual es acotada: se trata de un checkpoint de investigacion con cero descargas y cero "likes" en el momento de redactar esta ficha, sin licencia declarada, sin idiomas declarados y sin soporte en frameworks de inferencia estandar. Su interes esta en la exploracion de arquitecturas alternativas al transformer de atencion cuadratica para tareas de recuperacion en contexto, con una perplejidad de validacion de 10,30 sobre The Pile.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Memories (MoM) con atencion lineal y router de lectura ahead-feature |
| Parametros totales | 446,6 M (incluye 51,5 M de embeddings y el extractor ahead-feature) |
| Parametros activos | no disponible; no es un MoE de expertos clasico, usa 1 banco de memoria por capa |
| Longitud de contexto | no disponible (el entrenamiento uso secuencias de 2.048 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre The Pile, corpus predominantemente en ingles) |
| Licencia | no disponible |
| Formato de pesos | checkpoint propio (`final.ckpt`), cargable con la libreria `recurrent-recall-circuits` |

Dimensiones adicionales: n_embd 1.024, n_layer 24, n_head 16, 1 banco de memoria por capa, write gate con softmax top-4 y estimador straight-through, read gate denso con softplus (`read_top_k: null`).

## Arquitectura y entrenamiento

El modelo sigue una arquitectura Mixture-of-Memories, un diseno de atencion lineal con circuitos de recuperacion recurrente. Cada una de las 24 capas incorpora un banco de memoria propio. La escritura en memoria se controla mediante una puerta con softmax top-4 y estimador straight-through, mientras que la lectura usa una puerta densa con softplus sin limite explicito de top-k (`read_top_k: null`). La dimension de embedding es 1.024 y la atencion se reparte en 16 cabezas, lo que da una dimension por cabeza de 64. El router de lectura "ahead-feature" es el componente distintivo que da nombre a la variante `ahead`.

El entrenamiento se realizo sobre The Pile con 6.000 actualizaciones y un total de 3.146 mil millones de tokens procesados, usando un batch global de 256 secuencias de 2.048 tokens y el objetivo `rare4` con semilla 1111. No se documenta en la informacion disponible el uso de RLHF, DPO u otras fases de alineamiento posteriores al preentrenamiento, ni detalles concretos sobre la composicion o el filtrado del dataset mas alla de la referencia a The Pile.

## Capacidades

- Generacion de texto autoregresiva basada en el preentrenamiento sobre The Pile.
- Recuperacion de informacion en contexto (in-context recall), capacidad central del diseno MoM.
- Extraccion de informacion estructurada, evidenciada por los resultados reportados en las tareas FDA y SWDE.
- Manejo de dependencias de largo alcance mediante atencion lineal y bancos de memoria.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No se documentan capacidades multilingues; el corpus de entrenamiento es mayoritariamente angloparlante.
- No se documentan capacidades especiales como modo "thinking", vision o audio.
- No se documenta un chat template ni un modo de instrucciones.

## Casos de uso

- Investigacion en arquitecturas de atencion lineal: el modelo sirve como punto de partida para reproducir y comparar el comportamiento de la familia Mixture-of-Memories frente a transformers clasicos de tamano similar.
- Experimentos de recuperacion en contexto (in-context recall): su objetivo declarado permite estudiar como los bancos de memoria por capa afectan a la retencion de informacion a lo largo de la secuencia.
- Evaluacion de extraccion de informacion: las tareas FDA y SWDE reportadas lo hacen util como referencia en pipelines de extraccion de atributos desde texto no estructurado.
- Analisis de perplejidad sobre corpus ingleses: con una perplejidad de validacion de 10,30 en The Pile, puede emplearse como baseline de modelado de lenguaje en dominios similares.
- Estudio de objetivos de entrenamiento alternativos: el objetivo `rare4` puede compararse con objetivos estandar en experimentos controlados de preentrenamiento.
- Reproducibilidad de experimentos: al publicar `resolved-config.yaml` y `metadata.json` con el hash de configuracion y el commit de git, permite replicar la ejecucion exacta.
- Prototipado de bajo coste en GPU de consumo: su tamano reducido facilita experimentar localmente sin infraestructura dedicada.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Perplejidad de validacion (Pile, uniform slices) | 10,30 |
| FDA (based-fda, 1102 ejemplos) | 41,2 |
| SWDE (based-swde-v2) | 32,8 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible, por lo que no es posible situar estas cifras frente a alternativas de forma rigurosa.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 446,6 M de parametros): aproximadamente 1,8 GB en fp32, 0,9 GB en fp16/bf16, 0,45 GB en int8 y 0,22 GB en int4. Estas cifras son estimaciones a partir del numero de parametros, ya que no se documentan cuantizaciones oficiales.
- El repositorio ocupa 1,6 GB, coherente con un checkpoint almacenado en precision completa.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de memoria. Cabe holgadamente en RTX 3060, RTX 3090, RTX 4090, A100 y H100; tambien en GPU de gama de entrada.
- Si cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo con 4 GB o mas.
- Opciones de despliegue: al ser una arquitectura personalizada, no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI. La via prevista es clonar el repositorio `recurrent-recall-circuits` y cargar el checkpoint mediante `utils.checkpoint.load_checkpoint`, o usar el lanzador de evaluacion `recurrent_recall_circuits.evaluation.launch`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| mom-ahead-360m-m1-rare4-6k | 446,6 M | no disponible (entreno a 2.048) | no disponible | HF, requiere libreria propia |
| Pythia-410M | 410 M | 2.048 | Apache 2.0 | HF, transformers |
| GPT-2 355M | 355 M | 1.024 | licencia MIT modificada | HF, transformers |
| SmolLM2-360M | 360 M | 8.192 | Apache 2.0 | HF, transformers |

La comparacion se limita a parametros, contexto y licencia, porque no se dispone de resultados de benchmarks comunes entre estos modelos y `mom-ahead-360m-m1-rare4-6k`. Las cifras de los modelos alternativos provienen de fuentes publicas y pueden variar segun la version del modelo.

## Limitaciones y advertencias

- Licencia no declarada: no hay autorizacion explicita de uso comercial, por lo que su explotacion en produccion conlleva riesgo legal.
- Modelo de investigacion con cero descargas y cero "likes": no existe validacion por parte de la comunidad ni garantias de mantenimiento.
- Arquitectura no estandar: no es compatible con transformers, vLLM, llama.cpp ni Ollama, lo que complica su integracion en pipelines convencionales.
- Riesgo de alucinacion inherente a un modelo de lenguaje preentrenado sin fase de alineamiento documentada.
- Idiomas no declarados y entrenamiento sobre The Pile, corpus predominantemente en ingles: el comportamiento en castellano es altamente incierto.
- Longitud de contexto no declarada: solo se sabe que se entreno con secuencias de 2.048 tokens, lo que limita el uso con ventanas mayores.
- Sesgos potencialmente presentes por el corpus de entrenamiento (The Pile), sin documentacion de mitigacion.
- Sin cuantizaciones publicadas, lo que obliga a generar conversiones propias si se quiere reducir memoria.
- El objetivo `rare4` no esta descrito en detalle en la informacion disponible, lo que dificulta anticipar su comportamiento fuera de las tareas evaluadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/robgarct/mom-ahead-360m-m1-rare4-6k
- Repositorio del codigo: `recurrent-recall-circuits` (referenciado en la model card; el propietario exacto figura como `<owner>` en la documentacion, por lo que la URL completa no esta disponible)
- No se han encontrado enlaces relevantes (papers, blogs, demos) en los resultados de la busqueda web; los resultados devueltos no guardan relacion con el modelo.
