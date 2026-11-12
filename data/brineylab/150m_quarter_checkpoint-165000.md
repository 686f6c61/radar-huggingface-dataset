# brineylab/150M_quarter_checkpoint-165000

## Resumen

El modelo `brineylab/150M_quarter_checkpoint-165000` es un modelo de lenguaje de proteinas basado en la arquitectura ESM-2, desarrollado por el laboratorio Briney Lab para el estudio de anticuerpos mediante modelos de lenguaje (Antibody Language Models, AbLM). Forma parte de un conjunto de 15 modelos entrenados para investigar las leyes de escalado (scaling laws) en modelos de lenguaje de anticuerpos, variando el tamano del modelo (8M a 650M parametros) y la cantidad de datos de entrenamiento (tres escalas de datasets emparejados de secuencias de anticuerpos). Este checkpoint concreto corresponde al modelo de 150M de parametros entrenado sobre el cuarto del dataset (412.182 secuencias de anticuerpos emparejadas) y detenido en el paso de entrenamiento 165.000.

La relevancia de este modelo es fundamentalmente de investigacion: proporciona un punto de referencia reproducible para estudiar el equilibrio entre tamano de modelo y disponibilidad de datos en el dominio especifico de anticuerpos. El modelo resuelve la tarea de `fill-mask` (enmascaramiento de residuos aminoacidicos) sobre secuencias nativas emparejadas de cadena pesada y cadena ligera, y puede ajustarse finamente para tareas de clasificacion como especificidad o prediccion de emparejamiento de cadenas.

Con 148.346.714 parametros reales (segun safetensors), 30 capas transformer, dimension oculta 640 y 20 cabezas de atencion, el modelo opera sobre secuencias de hasta 320 tokens durante el entrenamiento. Su licencia MIT y su integracion con la libreria `transformers` lo hacen accesible para investigacion en inmunologia computacional y descubrimiento terapeutico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ESM-2 (transformer encoder de proteinas) |
| Parametros totales | 148.346.714 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 320 tokens (longitud de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (dominio: secuencias de aminoacidos de anticuerpos) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ESM-2, un transformer encoder disenado para proteinas, con 30 capas, dimension oculta de 640 y 20 cabezas de atencion, totalizando 148.346.714 parametros. La entrada consiste en la secuencia aminoacidica de la cadena pesada, dos tokens `<cls>` como separador y la secuencia de la cadena ligera, con padding o truncamiento a 320 tokens durante el entrenamiento. El tokenizador empleado es el estandar de ESM-2 (`EsmTokenizer`).

El entrenamiento se realizo sobre un subconjunto del dataset completo del estudio (el "quarter dataset", con 412.182 secuencias de anticuerpos emparejadas nativamente), y este checkpoint corresponde al paso 165.000, tal como se documenta en la Tabla S1 del preprint. El estudio completo entrena 15 modelos combinando cinco tamanos (8M a 650M) y tres escalas de datos, con el objetivo de caracterizar las leyes de escalado especificas para AbLMs. No se especifica en la informacion disponible si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion; el pipeline declarado es `fill-mask`, lo que sugiere un entrenamiento de tipo masked language modeling sobre secuencias de proteinas.

## Capacidades

- Modelado de lenguaje enmascarado (fill-mask) sobre secuencias de aminoacidos de anticuerpos.
- Procesamiento de secuencias emparejadas de cadena pesada y cadena ligera mediante separador `<cls><cls>`.
- Extraccion de representaciones (embeddings) de secuencias de anticuerpos para tareas downstream.
- Ajuste fino para clasificacion de secuencias (`EsmForSequenceClassification`), incluyendo tareas de especificidad y clasificacion de emparejamiento de cadenas segun el paper.
- Capacidad de congelar los pesos base para fine-tuning eficiente de la cabeza de clasificacion.
- No se documentan capacidades de tool calling, agentes, vision, audio ni generacion de texto libre; el modelo esta especializado en el dominio proteico.

## Casos de uso

- Prediccion de residuos enmascarados en secuencias de anticuerpos: dado un anticuerpo con posiciones desconocidas o mutadas, el modelo puede predecir los aminoacidos mas probables en esas posiciones mediante la cabeza de masked language modeling, util para analisis de repertorios inmunes.
- Clasificacion de especificidad de anticuerpos: mediante fine-tuning con `EsmForSequenceClassification` y congelacion del modelo base, se puede entrenar un clasificador para predecir si un anticuerpo es especifico frente a un antigeno, tal como se describe en el paper.
- Prediccion de emparejamiento de cadenas pesada-ligera: el formato de entrada con separador `<cls><cls>` permite entrenar clasificadores que determinen si un par de cadenas corresponde a un emparejamiento nativo, util en el diseno de anticuerpos terapeuticos.
- Extraccion de embeddings para busqueda de similitud: las representaciones internas del modelo pueden emplearse para agrupar o recuperar anticuerpos con propiedades similares en grandes repertorios, como paso previo a la seleccion de candidatos.
- Estudio de leyes de escalado: el checkpoint sirve como punto de referencia reproducible para investigadores que analizan el efecto del tamano de modelo y de datos en el rendimiento de AbLMs, comparandolo con los otros 14 modelos de la coleccion.
- Analisis de repertorios inmunes: el modelo puede puntuar secuencias de repertorios para identificar anticuerpos plausibles o anomalos, apoyando la caracterizacion de respuestas inmunes en estudios de biologia.
- Base para fine-tuning en tareas de diseno de proteinas: aunque no es un modelo generativo, sus representaciones pueden servir como inicializacion para modelos downstream en pipelines de descubrimiento de farmacos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al preprint en bioRxiv (doi:10.1101/2025.09.02.673765) y a la Tabla S1 para los detalles del checkpoint, pero no se incluyen cifras de rendimiento en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,6 GB (148M de parametros a 4 bytes).
- VRAM estimada en fp16/bf16: aproximadamente 0,3 GB.
- Cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU para inferencia puntual.
- GPU recomendadas: no se especifican en la informacion disponible; por tamano, cualquier GPU con al menos 1-2 GB de VRAM es suficiente.
- Opciones de despliegue: al ser un modelo de `transformers` con pesos safetensors, puede servirse con la propia libreria, con `text-embeddings-inference` u otros servidores compatibles con modelos de `transformers`; no se documentan integraciones especificas con vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| brineylab/150M_quarter_checkpoint-165000 | 148M | 320 tokens | fill-mask (proteinas) | MIT | Hugging Face |
| ESM-2 (facebook/esm2_t30_150M_UR50D) | 150M | ~1024 tokens | fill-mask (proteinas) | MIT | Hugging Face |
| Otros AbLMs de la coleccion (8M-650M) | 8M-650M | 320 tokens | fill-mask (anticuerpos) | MIT | Hugging Face |

La comparacion mas directa es con el ESM-2 original de 150M de Meta, del cual este modelo deriva: comparten arquitectura y tamano, pero el modelo de brineylab esta especializado en secuencias de anticuerpos emparejadas, mientras que ESM-2 se entrena sobre proteinas generales. Dentro de la propia coleccion de AbLMs Scaling Laws, este checkpoint se distingue por su tamano intermedio y su subconjunto de datos (quarter dataset).

## Limitaciones y advertencias

- Modelo de investigacion: su proposito principal es el estudio de scaling laws, no el despliegue en produccion.
- Dominio restringido: entrenado exclusivamente sobre secuencias de anticuerpos emparejadas; su rendimiento fuera de ese dominio (proteinas generales u otras familias) no esta documentado.
- Longitud de contexto limitada a 320 tokens, insuficiente para secuencias mas largas sin truncamiento.
- Riesgo de sesgo hacia la distribucion de los datos de entrenamiento (412.182 secuencias emparejadas); puede no generalizar a repertorios de otras especies o con caracteristicas atipicas.
- No es un modelo generativo de texto ni soporta tool calling ni agentes; su uso esta limitado a tareas de enmascaramiento y clasificacion.
- Riesgo de alucinacion en el sentido de predicciones de aminoacidos plausibles pero biologicamente invalidas; requiere validacion experimental.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantias ni soporte; verificar los terminos del preprint y del dataset en Zenodo para usos derivados.
- No se documentan limitaciones especificas de idioma porque el modelo no opera sobre lenguaje natural.

## Enlaces

- Hugging Face: https://huggingface.co/brineylab/150M_quarter_checkpoint-165000
- Coleccion AbLMs Scaling Laws: https://huggingface.co/collections/brineylab/ablms-scaling-laws-6824e4beaabf4b16107cac4f
- Preprint bioRxiv: https://doi.org/10.1101/2025.09.02.673765
- Dataset en Zenodo: https://doi.org/10.5281/zenodo.16938681
- Codigo en GitHub: https://github.com/brineylab/AbLMs-scaling-laws
- Paper ESM-2: https://www.science.org/doi/10.1126/science.ade2574
