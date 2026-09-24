# pt810/Ovis-Omni-Embedding-3B-gptq-mixed-w2-w4-w8

## Resumen

Ovis-Omni-Embedding-3B-gptq-mixed-w2-w4-w8 es una variante experimental cuantizada del modelo de embeddings multimodales ATH-MaaS/Ovis-Omni-Embedding-3B, publicada por el usuario pt810 en HuggingFace. El artefacto aplica una cuantizacion GPTQ mixta por capas sobre el "thinker" del modelo base: las capas 0 a 13 se almacenan a 2 bits, las capas 14 a 26 a 4 bits y la capa 27 a 8 bits, mientras que las torres multimodales y los modulos no lineales o especiales conservan la precision original. El repositorio ocupa 7,7 GB y los metadatos de safetensors reportan 2935 parametros totales en el recuento del archivo, coherente con la denominacion comercial de 3B del modelo base.

El modelo hereda la arquitectura multimodal de la familia Qwen2.5-Omni, segun indican las etiquetas del repositorio (qwen2_5_omni, qwen2.5-omni, multimodal, embeddings, text-to-audio). El pipeline declarado en HuggingFace es text-to-audio, aunque el nombre del modelo, las etiquetas y la model card lo describen como un modelo de embeddings multimodal; esta discrepancia es relevante a la hora de interpretar su comportamiento esperado.

Su relevancia es fundamentalmente practica y de investigacion: se trata de un artefacto de exploracion sobre los limites de la cuantizacion agresiva (2 bits en la mitad inicial de las capas) en un modelo de embeddings, no de un checkpoint listo para produccion. La propia model card advierte de que vLLM 0.30.0 rechaza la forma empaquetada W2 en el cargador Marlin de compressed-tensors, por lo que no debe tratarse como un checkpoint servible en vLLM. El autor remite a una variante separada W4/W4/W8 probada con vLLM para ese proposito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivada de Qwen2.5-Omni (familia Ovis), con capas "thinker" y torres multimodales |
| Parametros totales | 2935 segun metadatos de safetensors (el nombre del modelo indica 3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ mixta por capas: 2 bits (capas 0-13), 4 bits (capas 14-26), 8 bits (capa 27) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (compressed-tensors / GPTQ) |
| Modelo base | ATH-MaaS/Ovis-Omni-Embedding-3B |
| Tamano del repositorio | 7,7 GB |
| Libreria declarada | transformers |
| Pipeline declarado | text-to-audio |
| Fecha de creacion | 2026-09-24 |
| Fecha de ultima actualizacion | 2026-09-24 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo base ATH-MaaS/Ovis-Omni-Embedding-3B, que segun las etiquetas del repositorio se apoya en Qwen2.5-Omni. La model card identifica explicitamente un bloque "thinker" con 28 capas indexadas de 0 a 27, ademas de torres multimodales y modulos no lineales o especiales. Sobre esa estructura, esta publicacion no entrena un modelo nuevo: aplica una calibracion GPTQ con precisiones distintas segun la profundidad de la capa y exporta el resultado mediante compressed-tensors.

El detalle tecnico mas relevante aportado por el autor es que las escalas de grupo se recalcularon a partir de los pesos originales en BF16, despues de que la exportacion del compresor generara escalas invalidas. Esto implica que el artefacto no reproduce exactamente el resultado del pipeline de cuantizacion estandar, sino una reconstruccion posterior. No se proporciona informacion sobre el volumen de tokens de entrenamiento del modelo base, la composicion del dataset, ni sobre si hubo etapas de RLHF o DPO.

## Capacidades

- Generacion de representaciones (embeddings) multimodales, segun el nombre del modelo, las etiquetas embeddings y multimodal y el modelo base del que deriva.
- Procesamiento de entradas multimodales mediante torres dedicadas que se mantienen en la precision original, no cuantizadas en este artefacto.
- Capacidad declarada de text-to-audio por el pipeline de HuggingFace, presumiblemente heredada del modelo base Qwen2.5-Omni.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Cobertura multilingue: no disponible.
- Modo thinking, vision o audio explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Recuperacion semantica multimodal en prototipos de investigacion: el modelo puede generar embeddings sobre entradas heterogeneas (texto e imagen, segun el modelo base) para alimentar indices vectoriales de prueba, con la salvedad de que este checkpoint es experimental y no esta validado en produccion.
- Evaluacion del impacto de la cuantizacion en la calidad de embeddings: comparar las representaciones de este artefacto W2/W4/W8 contra el modelo base en BF16 y contra la variante W4/W4/W8 permite medir la degradacion introducida por los 2 bits en las capas 0-13.
- Busqueda semantica sobre corpus documentales en entornos con VRAM limitada: con 7,7 GB de pesos, el modelo es candidato para indexacion en GPUs de gama media-alta, siempre que se acepte la perdida de fidelidad de la cuantizacion.
- Clasificacion y clustering no supervisado de contenido multimodal: los embeddings pueden usarse para agrupar documentos, imagenes o pares texto-imagen por similitud coseno sin necesidad de un cabezal supervisado.
- Sistemas de recomendacion basados en similitud de contenido: representar items y consultas de usuario en un espacio comun para recuperar candidatos antes de un reranker.
- Experimentacion con el ecosistema compressed-tensors: sirve como caso de prueba para reproducir el fallo conocido del cargador Marlin de vLLM 0.30.0 con formas empaquetadas W2 y validar estrategias alternativas de carga.
- Filtrado de duplicados y deduplicacion de datasets multimodales: generar embeddings de los elementos de un corpus para detectar near-duplicates antes de un entrenamiento posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas de recuperacion, MTEB ni ninguna otra evaluacion cuantitativa, ni del modelo base ni de esta variante cuantizada. Tampoco se aportan datos de latencia o throughput. Cualquier afirmacion sobre la degradacion respecto al BF16 requeriria una evaluacion propia.

## Requisitos de hardware

- Pesos en disco: 7,7 GB, incluyendo las torres multimodales y los modulos no lineales que permanecen en precision original.
- VRAM estimada para inferencia: en torno a 9-11 GB como orden de magnitud (pesos mas overhead de runtime, cache KV y activaciones). Es una estimacion derivada del tamano del repositorio, no un dato verificado por el autor.
- GPU de consumo: el modelo puede caber en tarjetas con 12 GB o mas de VRAM, como RTX 3060 de 12 GB, RTX 4070 o RTX 4090; en 16 GB o mas (RTX 4080, RTX 4090, A4000) el margen es mayor.
- GPU profesionales: A100 40 GB, A100 80 GB, H100 y L40S son opciones sobredimensionadas para este tamano, utiles si se quiere servir con lotes grandes o muchas instancias en paralelo.
- Despliegue con Transformers: es la libreria declarada en los metadatos y la ruta mas segura para cargar este artefacto.
- Despliegue con vLLM: no recomendado para este checkpoint. La model card indica que vLLM 0.30.0 rechaza su forma empaquetada W2 en el cargador Marlin de compressed-tensors; para servir con vLLM hay que usar la variante W4/W4/W8 publicada aparte.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Servible en vLLM | Disponibilidad |
|---|---|---|---|---|---|---|
| pt810/Ovis-Omni-Embedding-3B-gptq-mixed-w2-w4-w8 | 2935 segun safetensors (3B nominal) | GPTQ mixta 2/4/8 bits | no disponible | no disponible | No (rechazado por vLLM 0.30.0 en el cargador Marlin W2) | Publico en HuggingFace, 0 descargas |
| pt810/Ovis-Omni-Embedding-3B-gptq-mixed-w4-w4-w8 | no disponible | GPTQ mixta 4/4/8 bits | no disponible | no disponible | Si, probado con vLLM segun la model card | Mencionado en la model card, sin enlace aportado |
| ATH-MaaS/Ovis-Omni-Embedding-3B | 3B nominal | BF16 (sin cuantizar) | no disponible | no disponible | no disponible | Publico en HuggingFace, es el modelo base |

No se dispone de informacion sobre otros modelos de embeddings multimodales comparables en la documentacion proporcionada, por lo que no se incluyen alternativas de otras familias.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no puede asumirse permiso de uso comercial. Es un bloqueo para cualquier despliegue en produccion.
- Idiomas soportados no disponibles: no hay lista de idiomas ni evaluacion de cobertura multilingue.
- Incompatibilidad con vLLM: vLLM 0.30.0 rechaza la forma empaquetada W2 en el cargador Marlin de compressed-tensors. No debe tratarse como un checkpoint servible en vLLM.
- Cuantizacion agresiva a 2 bits en 14 de las 28 capas del "thinker": es previsible una perdida de calidad en las representaciones frente al BF16 y frente a la variante W4/W4/W8, aunque no se aportan mediciones que la cuantifiquen.
- Escalas de grupo recomputadas: la model card indica que las escalas se recalcularon a partir de los pesos BF16 originales porque la exportacion del compresor genero escalas invalidas. El artefacto es, por tanto, una reconstruccion manual y no una salida directa del pipeline estandar.
- Naturaleza experimental: el propio autor lo describe como variante experimental publicada para experimentacion.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de los metadatos; no hay evidencia de uso o verificacion por terceros.
- Discrepancia de pipeline: HuggingFace declara text-to-audio mientras el nombre y las etiquetas apuntan a un modelo de embeddings multimodal. Conviene verificar el comportamiento real antes de integrarlo.
- Riesgo de sesgos: no disponible. No hay informacion sobre sesgos evaluados ni sobre la composicion del dataset del modelo base.
- Riesgo de alucinacion: aplicable principalmente si se usa en tareas generativas derivadas del modelo base; como modelo de embeddings, el riesgo se traslada a representaciones sesgadas o poco discriminativas.
- Fechas de metadatos inusuales: creacion y actualizacion registradas como 2026-09-24, lo que conviene contrastar con la cronologia real del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pt810/Ovis-Omni-Embedding-3B-gptq-mixed-w2-w4-w8
- Modelo base: https://huggingface.co/ATH-MaaS/Ovis-Omni-Embedding-3B
- Variante W4/W4/W8 servible en vLLM: mencionada en la model card, sin URL incluida en la informacion proporcionada.
- Papers, blogs, repositorios o demos adicionales: no disponible en la informacion proporcionada.
