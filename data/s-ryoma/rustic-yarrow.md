# s-ryoma/rustic-yarrow

## Resumen

`rustic-yarrow` es un modelo publicado por el usuario s-ryoma en Hugging Face, etiquetado con la arquitectura `llada` y el pipeline `feature-extraction`. Con 7.356.880.896 parametros (aproximadamente 7,36 mil millones) y un repositorio de 14,7 GB en formato safetensors, se trata de un modelo de escala media-alta cuyo proposito declarado es la extraccion de caracteristicas (embeddings) mas que la generacion de texto, aunque la etiqueta `llada` sugiere una base de modelo de difusion para lenguaje.

La informacion publica disponible es extremadamente limitada: no se declaran idiomas soportados, licencia, ni datos de entrenamiento. El repositorio esta sujeto a acceso restringido (gated), por lo que es necesario aceptar condiciones en Hugging Face antes de descargar los pesos. A fecha de la informacion disponible no registra descargas ni likes, lo que apunta a un artefacto reciente o de circulacion muy limitada.

Por su naturaleza (arquitectura LLaDA, pipeline de feature-extraction, codigo personalizado y acceso restringido), debe tratarse como un modelo experimental. Cualquier evaluacion en produccion requiere validacion propia, dado que no hay benchmarks, documentacion tecnica ni garantias de licencia publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaDA (difusion para lenguaje, segun tag `llada`) |
| Parametros totales | 7.356.880.896 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline declarado | feature-extraction |
| Codigo personalizado | si (`custom_code`, requiere `trust_remote_code=True`) |
| Tamano del repositorio | 14,7 GB |
| Acceso | restringido (gated) |

## Arquitectura y entrenamiento

El tag `llada` remite a la familia LLaDA (Large Language Diffusion with mAsking), un paradigma de modelado del lenguaje basado en difusion con enmascaramiento en lugar de la generacion autorregresiva token a token. En este esquema, el modelo aprende a reconstruir tokens enmascarados de forma iterativa, lo que en teoria permite decodificacion paralela y un modelado bidireccional del contexto. No obstante, la informacion proporcionada no confirma que este checkpoint concreto siga exactamente esa receta ni detalla su configuracion interna (numero de capas, dimension oculta, cabezas de atencion).

No se dispone de datos sobre el corpus de entrenamiento (numero de tokens, composicion, proporciones multilingues), ni sobre si se aplicaron fases de ajuste fino supervisado, RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificacion especulativa, atencion lineal o estrategias hibridas. El uso de `custom_code` implica que la arquitectura requiere cargar codigo remoto del repositorio, lo que anade un vector de riesgo y obliga a auditar dicho codigo antes de ejecutarlo en entornos de produccion.

## Capacidades

- Extraccion de caracteristicas y embeddings: es el pipeline declarado, por lo que su uso previsto es generar representaciones vectoriales de texto para tareas downstream (clasificacion, recuperacion, clustering).
- Generacion de texto: no confirmada en la informacion disponible; la etiqueta de pipeline no es de generacion y no hay model card que lo acredite.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Generacion de embeddings para busqueda semantica: usar el modelo como encoder para indexar documentos y consultas en un motor de recuperacion vectorial, aprovechando su escala de 7,36 mil millones de parametros para representaciones densas de mayor capacidad que encoders pequenos.
- Clasificacion de texto mediante representaciones: extraer embeddings de documentos y entrenar una cabeza ligera de clasificacion (sentimiento, topicos, moderacion) sobre ellos, sin reentrenar el modelo base.
- Agrupamiento y deduplicacion de corpus: calcular embeddings de un corpus y aplicar clustering para detectar near-duplicates o agrupar documentos tematicamente en pipelines de curación de datos.
- Sistemas de recomendacion basados en contenido: representar items textuales (descripciones, resenas) como vectores y calcular similitud para recomendacion semantica.
- Deteccion de anomalias y similitud en soporte tecnico: comparar tickets entrantes contra una base historica de incidencias mediante similitud coseno de embeddings, para enrutado automatico.
- Investigacion sobre modelos de difusion para lenguaje: al estar basado en LLaDA, sirve como artefacto de estudio para experimentar con decodificacion no autorregresiva y representaciones bidireccionales, siempre en entorno controlado y con el codigo remoto auditado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en precision completa (fp16/bf16): aproximadamente 14,7 GB solo para pesos, mas memoria para activaciones y overhead del runtime; en la practica, se recomienda un minimo de 20-24 GB.
- VRAM en cuantizacion de 8 bits: en torno a 8 GB de pesos, con margen adicional para activaciones.
- VRAM en cuantizacion de 4 bits: en torno a 4-5 GB de pesos; cabe en GPUs consumer de 8 GB o superiores, siempre que exista soporte de cuantizacion para la arquitectura LLaDA (no confirmado).
- GPUs recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para fp16; RTX 3090/4090 o inferiores con cuantizacion para despliegues ligeros.
- Cabe en GPU consumer: si, en modelos con 24 GB (RTX 3090, 4090) en fp16 con margen ajustado; en 8-16 GB solo con cuantizacion y si el runtime lo soporta.
- Opciones de despliegue: al requerir `custom_code`, las opciones estandar (vLLM, TGI, llama.cpp, Ollama) no estan garantizadas; la via mas segura es `transformers` con `trust_remote_code=True`. La compatibilidad con vLLM o llama.cpp para arquitecturas LLaDA no esta confirmada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rustic-yarrow (s-ryoma) | 7,36 B | no disponible | LLaDA / feature-extraction | no disponible | Gated |
| LLaDA 8B (referencia de familia) | ~8 B | no disponible en esta ficha | Difusion para lenguaje | no disponible en esta ficha | Publico |
| Encoders tipo BERT-large | ~0,34 B | 512 tokens tipico | Transformer encoder | Apache 2.0 / MIT (segun variante) | Publico |
| E5-large / GTE-large | ~0,3-0,4 B | 512 tokens tipico | Transformer encoder | MIT / Apache 2.0 (segun variante) | Publico |

La comparativa es orientativa: no hay datos publicados de rendimiento para `rustic-yarrow` que permitan contrastarlo numericamente con LLaDA 8B ni con encoders dedicados. Frente a encoders de 300-400 millones de parametros, este modelo es un orden de magnitud mayor, lo que encarece la inferencia sin garantia de mejor calidad al no haber evaluaciones publicadas.

## Limitaciones y advertencias

- Ausencia total de model card: no hay informacion sobre datos de entrenamiento, sesgos, idiomas ni evaluaciones; cualquier uso en produccion exige evaluacion propia.
- Licencia no declarada: no se puede asumir uso comercial permitido; el acceso restringido agrava la incertidumbre legal.
- Riesgo de alucinacion: no evaluable para generacion, ya que la capacidad generativa no esta confirmada; para embeddings, el riesgo se traslada a representaciones de baja calidad en dominios no cubiertos por el entrenamiento.
- `custom_code` obliga a ejecutar codigo remoto del repositorio; auditar antes de cargar en cualquier entorno con datos sensibles.
- Compatibilidad limitada con runtimes estandar (vLLM, llama.cpp, Ollama) no confirmada para arquitecturas LLaDA.
- Contexto maximo desconocido: no se puede planificar el troceado de documentos sin determinarlo experimentalmente.
- Cero descargas y cero likes: sin validacion por parte de la comunidad, sin issues ni discusiones que permitan anticipar problemas.
- Acceso gated: la disponibilidad depende de la aprobacion del autor y de sus condiciones, que pueden cambiar o revocarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/s-ryoma/rustic-yarrow
