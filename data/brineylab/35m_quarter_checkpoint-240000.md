# brineylab/35M_quarter_checkpoint-240000

## Resumen

El modelo `brineylab/35M_quarter_checkpoint-240000` es un modelo de lenguaje de proteinas basado en la arquitectura ESM-2, desarrollado por el laboratorio brineylab para el analisis de secuencias de anticuerpos. Forma parte de un estudio sistematico sobre las leyes de escalado de los modelos de lenguaje de anticuerpos (AbLMs), en el que se entrenaron 15 variantes que combinan cinco tamanos de modelo (de 8M a 650M parametros) con tres escalas de dataset de secuencias de anticuerpos emparejadas. Este checkpoint concreto corresponde al modelo de 35M de parametros entrenado sobre el cuarto del dataset (412.182 secuencias emparejadas) y detenido en el paso de entrenamiento 240.000.

El modelo resuelve la tarea de `fill-mask` (enmascaramiento de tokens) sobre secuencias nativas de cadenas pesada y ligera de anticuerpos, y puede ajustarse finamente para tareas de clasificacion como especificidad o clasificacion de pares. Su relevancia radica en que proporciona evidencia empirica sobre como equilibrar el tamano del modelo y la disponibilidad de datos para evitar rendimientos decrecientes en el preentrenamiento de modelos de lenguaje biologicos.

Con 33.656.098 parametros reales (segun los pesos en safetensors), 12 capas de transformer, un tamano oculto de 480 y 20 cabezas de atencion, este checkpoint esta pensado para investigadores que necesitan un modelo compacto y eficiente para tareas de representacion y prediccion sobre repertorios inmunitarios, con licencia MIT que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ESM-2 (transformer encoder, solo mascara de relleno) |
| Parametros totales | 33.656.098 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 320 tokens (entrenamiento: padding/truncado a 320) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (secuencias de aminoacidos de anticuerpos) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Capas de transformer | 12 |
| Tamano oculto | 480 |
| Cabezas de atencion | 20 |
| Paso de entrenamiento | 240.000 |
| Dataset de entrenamiento | Quarter dataset (412.182 secuencias de anticuerpos emparejadas) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ESM-2 de Meta, un transformer encoder con atencion bidireccional disenado originalmente para proteinas y adaptado aqui a secuencias de anticuerpos. La entrada combina la cadena pesada y la cadena ligera separadas por dos tokens `<cls>`, lo que permite al modelo aprender representaciones conjuntas de pares nativos de anticuerpos. El tokenizador es el ESM-2 estandar. Durante el entrenamiento, las secuencias se rellenaron o truncaron a 320 tokens.

El preentrenamiento se realizo sobre el denominado "quarter dataset", compuesto por 412.182 secuencias de anticuerpos emparejadas nativamente, dentro de un corpus total de aproximadamente 1,6 millones de secuencias. El estudio marco (preprint en bioRxiv, DOI 10.1101/2025.09.02.673765) investiga las leyes de escalado de AbLMs y concluye que el escalado efectivo requiere equilibrar el tamano del modelo con la disponibilidad de datos para evitar rendimientos decrecientes. No se especifica en la informacion disponible si hubo fases de RLHF, DPO u otras tecnicas de alineacion, ni innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Relleno de mascaras (`fill-mask`) sobre secuencias de aminoacidos de anticuerpos, prediciendo residuos enmascarados en cadenas pesada y ligera.
- Generacion de representaciones contextuales de secuencias de anticuerpos emparejadas, utiles como embeddings para tareas posteriores.
- Ajuste fino para clasificacion de secuencias (por ejemplo, especificidad o clasificacion de pares) mediante `EsmForSequenceClassification`.
- Modelado de pares nativos cadena pesada-cadena ligera mediante el separador de doble `<cls>`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de instrucciones).
- No dispone de capacidades multilingues en el sentido convencional; opera sobre el alfabeto de aminoacidos.
- No incluye modo de pensamiento (thinking), vision ni audio.

## Casos de uso

- Prediccion de residuos enmascarados en regiones variables de anticuerpos: util para identificar aminoacidos probables en posiciones desconocidas o mutadas, apoyando el diseno de variantes.
- Ajuste fino para clasificacion de especificidad: cargando el modelo con `EsmForSequenceClassification` y congelando el cuerpo base, se puede entrenar un clasificador para discriminar anticuerpos especificos frente a no especificos.
- Clasificacion de pares cadena pesada-ligera: el formato de entrada con doble `<cls>` permite entrenar modelos que predigan la compatibilidad o el emparejamiento correcto de cadenas.
- Extraccion de embeddings para agrupamiento y analisis de repertorios: las representaciones del encoder sirven para clustering de secuencias, deteccion de familias o busqueda de similitud en grandes repertorios inmunitarios.
- Filtrado previo en pipelines de descubrimiento terapeutico: como modelo compacto (33,6M parametros), puede ejecutarse a gran escala para prefiltrar candidatos antes de costosos ensayos experimentales.
- Investigacion sobre leyes de escalado: sirve como punto de referencia reproducible dentro de la coleccion de 15 modelos para estudiar el efecto del tamano y los datos en tareas de proteinas.
- Anotacion de secuencias en bases de datos de anticuerpos: prediccion de residuos faltantes o correccion de secuencias parciales en repositorios biologicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al preprint (DOI 10.1101/2025.09.02.673765) y a la Tabla S1 del articulo para los detalles de entrenamiento, pero no se incluyen metricas numericas (como precision de enmascaramiento, AUC en clasificacion o perplejidad) en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision FP32 (33,6M parametros, ~135 MB de pesos) y aproximadamente 70 MB en FP16.
- GPU recomendadas: cualquier GPU moderna es suficiente; se puede ejecutar en CPU sin problema. Para lotes grandes, una RTX 4090, A100 o H100 ofrecen throughput elevado, aunque el modelo no las requiere.
- Cabe en cualquier GPU de consumo, incluidas GTX 1060, RTX 3060 o superiores, y en GPUs integradas para inferencia puntual.
- Opciones de despliegue: `transformers` (con `EsmForMaskedLM` y `EsmTokenizer`), y potencialmente exportacion a ONNX; no se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano, se espera inferencia en milisegundos en GPU y decenas de milisegundos en CPU para secuencias de 320 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| brineylab/35M_quarter_checkpoint-240000 | 33,6M | 320 tokens | fill-mask (anticuerpos) | MIT | Hugging Face |
| ESM-2 (8M) | ~8M | 1024 tokens (tipico) | fill-mask (proteinas) | MIT | Hugging Face (facebook/esm2_t6_8M_UR50D) |
| ESM-2 (650M) | ~650M | 1024 tokens (tipico) | fill-mask (proteinas) | MIT | Hugging Face (facebook/esm2_t33_650M_UR50D) |
| Otros AbLMs del estudio | 8M–650M | 320 tokens | fill-mask (anticuerpos) | MIT | Coleccion brineylab/ablms-scaling-laws |

La comparativa con ESM-2 se basa en que este modelo deriva de dicha arquitectura; los datos de contexto de ESM-2 no se detallan en la informacion proporcionada y se indican como referencia general. Los 15 modelos del estudio de brineylab comparten licencia y formato, diferenciandose en tamano y escala de dataset.

## Limitaciones y advertencias

- Modelo de investigacion: no es un modelo de instrucciones ni de chat; su uso previsto es `fill-mask` y ajuste fino para clasificacion.
- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre un corpus concreto de anticuerpos, puede reflejar sesgos de composicion de ese dataset (por ejemplo, sesgo hacia ciertos organismos o familias de anticuerpos).
- Riesgo de alucinacion: en el contexto de prediccion de residuos, puede generar aminoacidos plausibles pero incorrectos biologicamente; las predicciones requieren validacion experimental.
- Limitaciones de contexto: ventana de 320 tokens, lo que restringe secuencias largas; las entradas se truncan o rellenan, lo que puede perder informacion en cadenas extensas.
- Limitaciones de idioma: opera exclusivamente sobre secuencias de aminoacidos; no procesa lenguaje natural.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificacion con atribucion; no obstante, el uso en produccion terapeutica requiere validacion regulatoria independiente.
- Caveat para produccion: el checkpoint esta detenido en el paso 240.000 y es uno de 15 variantes experimentales; no se garantiza que sea el mejor de la coleccion para una tarea concreta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brineylab/35M_quarter_checkpoint-240000
- Coleccion AbLMs Scaling Laws: https://huggingface.co/collections/brineylab/ablms-scaling-laws-6824e4beaabf4b16107cac4f
- Preprint en bioRxiv: https://doi.org/10.1101/2025.09.02.673765
- Paper de ESM-2: https://www.science.org/doi/10.1126/science.ade2574
- Datasets en Zenodo: https://doi.org/10.5281/zenodo.16938681
- Codigo en GitHub: https://github.com/brineylab/AbLMs-scaling-laws
