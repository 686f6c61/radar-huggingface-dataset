# brineylab/650M_full_checkpoint-395000

## Resumen

El modelo `brineylab/650M_full_checkpoint-395000` es un modelo de lenguaje de proteinas basado en la arquitectura ESM-2, desarrollado por el laboratorio brineylab para el analisis de repertorios de anticuerpos. Se trata de un modelo de tipo *masked language model* (fill-mask) especializado en secuencias de anticuerpos emparejadas de cadena pesada y cadena ligera, entrenado sobre un corpus de 1.648.726 secuencias pareadas. Forma parte de un estudio sistematico sobre las leyes de escalado de los modelos de lenguaje de anticuerpos (AbLMs), en el que se entrenaron 15 modelos de cinco tamanos distintos (8M a 650M parametros) y tres escalas de datos.

Este checkpoint concreto corresponde al modelo de mayor tamano de la familia (650M parametros, 33 capas transformer, dimension oculta 1280 y 20 cabezas de atencion), entrenado sobre el conjunto de datos completo y detenido en el paso de entrenamiento 395.000. Su relevancia radica en que proporciona evidencia empirica sobre como equilibrar el tamano del modelo y la disponibilidad de datos para evitar rendimientos decrecientes en el dominio de los anticuerpos, un area clave para el descubrimiento terapeutico.

El modelo se distribuye con licencia MIT, en formato safetensors y es compatible con la libreria `transformers` a traves de las clases `EsmForMaskedLM` y `EsmForSequenceClassification`. Su utilidad principal es el enmascaramiento y prediccion de residuos en secuencias de anticuerpos, asi como el ajuste fino para tareas de clasificacion como especificidad o clasificacion de pares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ESM-2 (transformer encoder, masked language model) |
| Parametros totales | 651.456.470 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 320 tokens (longitud de entrenamiento; padding o truncado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de secuencias de aminoacidos, no de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ESM-2, un transformer encoder con 33 capas, dimension oculta de 1280 y 20 cabezas de atencion, disenado para el modelado de lenguaje enmascarado sobre secuencias biologicas. La entrada consiste en la secuencia de aminoacidos de la cadena pesada, dos tokens `<cls>` como separador y la secuencia de la cadena ligera, con padding o truncado a 320 tokens durante el entrenamiento. El tokenizador empleado es el estandar de ESM-2 (`EsmTokenizer`).

El entrenamiento se realizo sobre 1.648.726 secuencias de anticuerpos nativamente emparejadas (cadena pesada y ligera), correspondientes al conjunto de datos completo del estudio de leyes de escalado. El checkpoint publicado corresponde al paso 395.000, tal como se detalla en la Tabla S1 del preprint. El estudio completo entreno 15 modelos de cinco tamanos (8M a 650M) y tres escalas de datos, con el objetivo de caracterizar el equilibrio entre tamano de modelo y disponibilidad de datos. No se especifica en la informacion disponible si se emplearon tecnicas de RLHF, DPO u otras fases de alineacion, algo por otra parte poco habitual en modelos de proteinas.

## Capacidades

- Prediccion de residuos enmascarados (fill-mask) en secuencias de anticuerpos, incluyendo cadenas pesadas y ligeras emparejadas.
- Modelado de representaciones contextuales de secuencias de aminoacidos mediante la arquitectura ESM-2.
- Ajuste fino para clasificacion de secuencias (por ejemplo, especificidad o clasificacion de pares) mediante `EsmForSequenceClassification`.
- Procesamiento de secuencias emparejadas heavy-light con separador de dos tokens `<cls>`.
- Extraccion de embeddings para tareas downstream de biologia computacional.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues en el sentido de lenguaje natural.
- No dispone de modo de razonamiento (thinking mode), vision ni audio.

## Casos de uso

- Prediccion de residuos enmascarados en secuencias de anticuerpos: util para identificar aminoacidos probables en posiciones desconocidas o mutadas de cadenas pesadas y ligeras, aprovechando el contexto de la secuencia emparejada.
- Ajuste fino para clasificacion de especificidad: el modelo puede entrenarse con una cabeza de clasificacion para distinguir anticuerpos con distintas especificidades antigenicas, congelando los pesos base como indica la model card.
- Clasificacion de pares heavy-light: permite predecir si una combinacion de cadena pesada y ligera es funcional o esta correctamente emparejada, gracias al entrenamiento sobre secuencias nativamente pareadas.
- Priorizacion de candidatos terapeuticos: las representaciones del modelo pueden emplearse para ordenar repertorios de anticuerpos segun su probabilidad bajo el modelo, como filtro previo a validacion experimental.
- Anotacion de repertorios inmunes: el modelo puede aplicarse a la caracterizacion de secuencias de repertorios para detectar patrones o residuos anomalos.
- Investigacion en leyes de escalado: sirve como referencia reproducible del mayor modelo de la familia para comparar el efecto del tamano y de los datos en tareas de anticuerpos.
- Generacion de embeddings para modelos downstream: las representaciones internas pueden alimentar clasificadores ligeros o modelos de regresion en pipelines de descubrimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 2,6 GB solo para pesos, mas memoria para activaciones y tokenizacion; en la practica se recomienda al menos 6-8 GB.
- VRAM estimada en fp16/bf16: aproximadamente 1,3 GB para pesos, con margen adicional para activaciones.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 8 GB (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia; para ajuste fino se recomienda A100, H100 o RTX 4090 con 24 GB.
- Cabe en GPU consumer: si, en la mayoria de GPUs con 8 GB o mas para inferencia; el ajuste fino completo requiere mas memoria.
- Opciones de despliegue: `transformers` (referencia oficial), con posibilidad de exportacion a otros runtimes; no se documentan integraciones especificas con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| brineylab/650M_full_checkpoint-395000 | 651M | 320 tokens | Anticuerpos (ESM-2) | MIT | Hugging Face |
| ESM-2 650M (facebook/esm2_t33_650M_UR50D) | 650M | ~1024 tokens | Proteinas generales | MIT | Hugging Face |
| Otros modelos de la familia AbLMs (8M-650M) | 8M-650M | 320 tokens | Anticuerpos | MIT | Coleccion AbLMs Scaling Laws |

El modelo se diferencia de ESM-2 general en que ha sido entrenado especificamente sobre secuencias de anticuerpos emparejadas, lo que lo hace mas adecuado para tareas de repertorios de anticuerpos, a costa de un contexto de entrenamiento mas corto (320 tokens) y de un dominio mas restringido. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en secuencias de anticuerpos; su rendimiento fuera de ese dominio no esta caracterizado.
- La longitud de contexto de entrenamiento es de 320 tokens, lo que limita el procesamiento de secuencias mas largas sin truncado.
- No se dispone de informacion sobre sesgos, tasas de alucinacion o evaluacion de robustez en la documentacion proporcionada.
- Al ser un modelo de lenguaje de proteinas, no soporta lenguaje natural, tool calling ni tareas de agente.
- La licencia MIT permite uso comercial, pero el usuario debe verificar las condiciones de los datos de entrenamiento originales (disponibles en Zenodo) para usos derivados.
- El checkpoint corresponde a un paso de entrenamiento concreto (395.000); no se garantiza que sea el optimo para todas las tareas downstream.
- No se documentan cuantizaciones oficiales ni integraciones con runtimes de inferencia de alto rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brineylab/650M_full_checkpoint-395000
- Coleccion AbLMs Scaling Laws: https://huggingface.co/collections/brineylab/ablms-scaling-laws-6824e4beaabf4b16107cac4f
- Preprint en bioRxiv: https://doi.org/10.1101/2025.09.02.673765
- Datasets en Zenodo: https://doi.org/10.5281/zenodo.16938681
- Codigo en GitHub: https://github.com/brineylab/AbLMs-scaling-laws
- Paper ESM-2: https://www.science.org/doi/10.1126/science.ade2574
