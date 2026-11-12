# brineylab/650M_quarter_checkpoint-130000

## Resumen

El modelo `brineylab/650M_quarter_checkpoint-130000` es un modelo de lenguaje de proteinas basado en ESM-2, especializado en secuencias de anticuerpos (AbLM, *Antibody Language Model*), desarrollado por el laboratorio brineylab. Forma parte de un estudio sistematico sobre las leyes de escalado de modelos de lenguaje de anticuerpos, en el que se entrenaron 15 variantes combinando cinco tamanos de modelo (de 8M a 650M parametros) con tres escalas de dataset de secuencias de anticuerpos emparejadas (en total, aproximadamente 1,6 millones de secuencias).

Concretamente, esta variante corresponde al tamano de 650M de parametros entrenada sobre el "quarter dataset" (412.182 secuencias de anticuerpos emparejadas cadenas pesada y ligera) y detenida en el paso de entrenamiento 130.000. El modelo resuelve la tarea de *masked language modeling* (fill-mask) sobre secuencias de aminoacidos y puede reutilizarse como base para tareas downstream de clasificacion, como la prediccion de especificidad o la clasificacion de pares cadena pesada-ligera.

Su relevancia actual radica en que proporciona evidencia empirica sobre como escalar modelos de anticuerpos de forma eficiente: el estudio concluye que el escalado efectivo requiere equilibrar el tamano del modelo con la disponibilidad de datos para evitar rendimientos decrecientes. El modelo se distribuye con licencia MIT, lo que facilita su uso comercial y su reutilizacion en pipelines de descubrimiento de anticuerpos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ESM-2 (encoder, masked language modeling) |
| Parametros totales | 651.456.470 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 320 tokens (longitud de entrada usada en entrenamiento; padding/truncado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de secuencias de proteinas, no de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors |

Especificaciones adicionales del autor: 33 capas de transformer, dimension oculta de 1280 y 20 cabezas de atencion.

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ESM-2 (encoder transformer con atencion bidireccional) y se entrena con el objetivo de *masked language modeling* sobre secuencias de aminoacidos. La entrada nativa es una secuencia de anticuerpo emparejada: la cadena pesada, dos tokens `<cls>` como separador y la cadena ligera. Durante el entrenamiento, las entradas se rellenaron o truncaron a 320 tokens. El tokenizador es el tokenizador estandar de ESM-2.

El preentrenamiento se realizo sobre 412.182 secuencias de anticuerpos emparejadas (el denominado "quarter dataset" dentro del estudio de escalado). Este checkpoint corresponde al paso de entrenamiento 130.000, tal y como se recoge en la Tabla S1 del preprint. El estudio completo entrena 15 modelos AbLM basados en ESM-2 con cinco tamanos (8M–650M) y tres escalas de dataset, con un total de aproximadamente 1,6 millones de secuencias. No se detalla en la informacion disponible la composicion exacta del corpus, ni si se aplicaron tecnicas de RLHF/DPO (poco habituales en modelos de proteinas con objetivo fill-mask).

## Capacidades

- Modelado de lenguaje enmascarado (fill-mask) sobre secuencias de aminoacidos de anticuerpos.
- Procesamiento de pares cadena pesada / cadena ligera mediante separador `<cls><cls>`.
- Extraccion de representaciones (embeddings) de secuencias de anticuerpos para tareas downstream.
- Fine-tuning para clasificacion de secuencias (por ejemplo, especificidad o clasificacion de pares) mediante `EsmForSequenceClassification`.
- Capacidad de congelar los pesos base (`base_model.parameters()`) para entrenar solo la cabeza de clasificacion.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de proteinas, no un LLM de proposito general.
- No dispone de capacidades multilingues, vision ni audio.
- No dispone de modo de razonamiento (*thinking mode*).

## Casos de uso

- Prediccion de residuos enmascarados en secuencias de anticuerpos: util para analizar regiones conservadas o proponer aminoacidos plausibles en posiciones concretas de la cadena pesada o ligera mediante la tarea fill-mask.
- Clasificacion de especificidad de anticuerpos: fine-tuning con `EsmForSequenceClassification` congelando el encoder para predecir si un anticuerpo es especifico o promiscuo, segun el protocolo del paper.
- Clasificacion de pares cadena pesada-ligera: uso del formato de entrada emparejado para tareas que requieren evaluar la compatibilidad o coherencia del par.
- Generacion de embeddings para agrupamiento y busqueda de similitud: extraccion de representaciones de secuencias para agrupar repertorios de anticuerpos por similitud funcional o estructural.
- Filtrado en pipelines de descubrimiento terapeutico: usar el modelo como componente de scoring para priorizar candidatos en cribados masivos antes de validacion experimental.
- Estudio de leyes de escalado y ablaciones: el checkpoint forma parte de una coleccion de 15 modelos, lo que permite comparar el efecto del tamano y de la escala de datos en tareas downstream.
- Base para modelos especializados: punto de partida para fine-tuning en tareas de estabilidad, afinidad o humanizacion de anticuerpos, aprovechando la licencia MIT para uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al preprint en bioRxiv (doi:10.1101/2025.09.02.673765) y a la Tabla S1 para los detalles de entrenamiento, pero no incluye cifras de rendimiento en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32, ~2,6 GB de pesos): aproximadamente 3–4 GB, incluyendo activaciones y overhead.
- En fp16/bf16: aproximadamente 1,3–2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en fp16; A100, H100 o RTX 4090 para fine-tuning con batches grandes.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070, RTX 4090, entre otras.
- Opciones de despliegue: `transformers` (carga estandar con `EsmForMaskedLM`), y en general cualquier runtime compatible con safetensors; no se documentan integraciones especificas con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| brineylab/650M_quarter_checkpoint-130000 | 651M | 320 tokens | Fill-mask en anticuerpos | MIT | Hugging Face |
| ESM-2 650M (base) | ~650M | hasta 1024 tokens (segun variante) | Fill-mask en proteinas generales | MIT | Hugging Face |
| Otros AbLM del mismo estudio (8M–650M) | 8M–650M | 320 tokens | Fill-mask en anticuerpos | MIT | Coleccion AbLMs Scaling Laws |

La comparacion con ESM-2 base es la mas directa, ya que este modelo deriva de dicha arquitectura y se especializa en anticuerpos emparejados. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado en secuencias de anticuerpos: su uso fuera de ese dominio (proteinas generales u otras modalidades) no esta validado.
- Longitud de entrada limitada a 320 tokens durante el entrenamiento; secuencias mas largas se truncan.
- No es un modelo de lenguaje natural: no procesa texto, no soporta conversacion ni tool calling.
- Riesgo de alucinacion en el sentido de predicciones de aminoacidos plausibles pero biologicamente invalidas; requiere validacion experimental.
- Sesgos potenciales derivados del corpus de 412.182 secuencias emparejadas, cuya composicion no se detalla en la informacion disponible.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones del preprint y de los datasets (Zenodo) para atribucion adecuada.
- Checkpoint intermedio (paso 130.000): no necesariamente representa el punto optimo de entrenamiento para todas las tareas; el paper recomienda seleccionar el checkpoint segun la tarea.
- No se documentan cuantizaciones oficiales; el uso en produccion con cuantizacion requeriria validacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brineylab/650M_quarter_checkpoint-130000
- Coleccion AbLMs Scaling Laws: https://huggingface.co/collections/brineylab/ablms-scaling-laws-6824e4beaabf4b16107cac4f
- Preprint en bioRxiv: https://doi.org/10.1101/2025.09.02.673765
- Paper de ESM-2: https://www.science.org/doi/10.1126/science.ade2574
- Datasets en Zenodo: https://doi.org/10.5281/zenodo.16938681
- Codigo en GitHub: https://github.com/brineylab/AbLMs-scaling-laws
