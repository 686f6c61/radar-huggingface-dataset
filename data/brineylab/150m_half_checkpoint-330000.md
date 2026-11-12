# brineylab/150M_half_checkpoint-330000

## Resumen

El modelo `brineylab/150M_half_checkpoint-330000` es un modelo de lenguaje de proteinas basado en la arquitectura ESM-2, desarrollado por el laboratorio brineylab para el analisis de secuencias de anticuerpos. Forma parte de un estudio sistematico sobre las leyes de escalado de modelos de lenguaje de anticuerpos (AbLMs), en el que se entrenaron 15 variantes que combinan cinco tamanos de modelo (de 8M a 650M parametros) con tres escalas de dataset de secuencias pareadas de anticuerpos (~1,6M secuencias en total). Este checkpoint concreto corresponde al modelo de 150M de parametros entrenado sobre la mitad del dataset (824.363 secuencias pareadas de anticuerpos) y detenido en el paso de entrenamiento 330.000.

La relevancia de este modelo radica en su proposito de investigacion: permitir estudiar empiricamente como interactuan el tamano del modelo y la disponibilidad de datos en el dominio especializado de las secuencias de anticuerpos, un area de interes creciente para el descubrimiento terapeutico y el analisis de repertorios inmunitarios. A diferencia de los modelos de lenguaje generalistas, este modelo opera exclusivamente sobre secuencias de aminoacidos y emplea la tarea de fill-mask (enmascaramiento de residuos) como objetivo de preentrenamiento.

El modelo tiene 148.346.714 parametros, una profundidad de 30 capas transformer, dimension oculta de 640 y 20 cabezas de atencion. Se distribuye bajo licencia MIT en formato safetensors y es compatible con la libreria transformers de Hugging Face, con un tamano de repositorio de 0,6 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ESM-2 (encoder, masked language modeling) |
| Parametros totales | 148.346.714 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 320 tokens (longitud de entrenamiento; entradas rellenadas o truncadas a 320) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (opera sobre secuencias de aminoacidos, no lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Capas transformer | 30 |
| Dimension oculta | 640 |
| Cabezas de atencion | 20 |
| Dataset de entrenamiento | 824.363 secuencias pareadas de anticuerpos (mitad del dataset) |
| Paso de entrenamiento | 330.000 |
| Tamano del repositorio | 0,6 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ESM-2, un transformer encoder entrenado con el objetivo de masked language modeling (fill-mask) sobre secuencias de proteinas. En este caso, la entrada no es una proteina generica sino una secuencia pareada de anticuerpo: la cadena pesada (heavy chain) seguida de dos tokens `<cls>` como separador y la cadena ligera (light chain). Durante el entrenamiento, las entradas se rellenaron o truncaron a 320 tokens. El modelo dispone de 30 capas, dimension oculta de 640 y 20 cabezas de atencion, lo que arroja 148.346.714 parametros.

El entrenamiento se realizo sobre 824.363 secuencias pareadas de anticuerpos, correspondientes a la mitad del dataset total del estudio (~1,6M secuencias). Este checkpoint se detuvo en el paso 330.000, tal como se documenta en la Tabla S1 del preprint asociado. El estudio completo entreno 15 modelos que cruzan cinco tamanos (8M, 150M, 650M y otros intermedios) con tres escalas de dataset, con el objetivo de caracterizar las leyes de escalado especificas de los modelos de lenguaje de anticuerpos. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion adicionales; el objetivo es exclusivamente el preentrenamiento con masked language modeling. El tokenizador empleado es el tokenizador estandar de ESM-2.

## Capacidades

- Prediccion de residuos enmascarados (fill-mask) sobre secuencias de aminoacidos de anticuerpos, tanto en cadenas individuales como en pares heavy-light.
- Modelado de secuencias pareadas de cadena pesada y ligera mediante el separador `<cls><cls>`.
- Extraccion de representaciones (embeddings) de secuencias de anticuerpos para tareas posteriores.
- Fine-tuning para clasificacion de secuencias mediante `EsmForSequenceClassification`, incluyendo tareas de especificidad y clasificacion de pares, tal como se describe en el paper.
- Capacidad de congelar los pesos de la base (`base_model`) para fine-tuning eficiente de la cabeza de clasificacion.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues en el sentido de lenguaje natural: es un modelo especializado en bioinformatica de proteinas.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Prediccion de residuos enmascarados en anticuerpos: dado un par heavy-light con posiciones enmascaradas, el modelo estima los aminoacidos mas probables, util para analisis de mutaciones y estudio de regiones funcionales.
- Clasificacion de especificidad de anticuerpos: mediante fine-tuning con `EsmForSequenceClassification` y congelacion de la base, se puede entrenar un clasificador para predecir especificidad o propiedades de union a partir de la secuencia.
- Clasificacion de pares heavy-light: el modelo esta disenado para entradas pareadas, lo que permite tareas de emparejamiento y validacion de combinaciones de cadenas.
- Analisis de repertorios inmunitarios: extraccion de embeddings de secuencias para agrupar, visualizar o comparar repertorios de anticuerpos en estudios de inmunologia.
- Investigacion sobre leyes de escalado: como checkpoint intermedio del estudio, sirve para reproducir y comparar curvas de escalado frente a los otros 14 modelos de la coleccion AbLMs Scaling Laws.
- Generacion de candidatos en descubrimiento terapeutico: uso como modelo base para puntuar o filtrar secuencias de anticuerpos en pipelines de diseno computacional, siempre con validacion experimental posterior.
- Fine-tuning en tareas de proteinas especificas: al ser un modelo de 150M parametros, puede ajustarse con recursos moderados en un unico GPU para tareas de clasificacion o regresion sobre secuencias de anticuerpos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El preprint referenciado (bioRxiv) describe el estudio de leyes de escalado, pero los resultados numericos concretos de este checkpoint no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~148M parametros, lo que supone aproximadamente 0,6 GB en precision fp32, ~0,3 GB en fp16/bf16 y ~0,15-0,2 GB en cuantizaciones de 4-8 bits (estimacion a partir del numero de parametros; no se proporcionan datos oficiales de cuantizacion).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior puede ejecutar el modelo con holgura. Para fine-tuning, se recomienda al menos 8-12 GB de VRAM.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas de VRAM para inferencia.
- Opciones de despliegue: transformers (libreria nativa, con `EsmForMaskedLM` y `EsmForSequenceClassification`); no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| brineylab/150M_half_checkpoint-330000 | 148M | 320 tokens | Fill-mask en anticuerpos | MIT | Hugging Face |
| ESM-2 (modelo base de referencia) | 8M-650M (varias tallas) | hasta 1024 tokens (segun variante) | Fill-mask en proteinas generales | MIT | Hugging Face (facebook/esm2) |
| Otros modelos de la coleccion AbLMs Scaling Laws | 8M-650M | 320 tokens | Fill-mask en anticuerpos | MIT | Hugging Face (coleccion brineylab) |

La comparacion principal es con el ESM-2 original de Meta, del que este modelo deriva: la diferencia clave es el entrenamiento especializado en secuencias pareadas de anticuerpos y el uso del separador `<cls><cls>` para cadenas heavy-light. Frente a los demas modelos de la coleccion, este checkpoint se distingue por su tamano (150M) y por haberse entrenado con la mitad del dataset (824.363 secuencias) hasta el paso 330.000. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: disenado para estudiar leyes de escalado, no como producto listo para produccion.
- Dominio restringido: solo procesa secuencias de aminoacidos de anticuerpos; no es un modelo de lenguaje natural ni multilingue.
- Longitud de contexto limitada a 320 tokens, insuficiente para secuencias de anticuerpos completas que superen ese limite (se truncan).
- Riesgo de alucinacion en el sentido de predicciones de residuos incorrectas: las salidas de fill-mask son probabilisticas y requieren validacion experimental.
- Sesgos potenciales derivados de la composicion del dataset de 824.363 secuencias pareadas, cuya distribucion no se detalla en la informacion disponible.
- Sin datos publicados de benchmarks en la informacion proporcionada, lo que dificulta evaluar su rendimiento relativo.
- Licencia MIT: permite uso comercial, pero el modelo se distribuye sin garantias y el autor no ofrece soporte.
- No se documentan tecnicas de alineacion ni salvaguardas; su uso en pipelines terapeuticos requiere validacion independiente.
- Numero de descargas muy bajo (6) y sin likes, lo que sugiere escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brineylab/150M_half_checkpoint-330000
- Coleccion AbLMs Scaling Laws: https://huggingface.co/collections/brineylab/ablms-scaling-laws-6824e4beaabf4b16107cac4f
- Preprint en bioRxiv: https://doi.org/10.1101/2025.09.02.673765
- Paper de ESM-2: https://www.science.org/doi/10.1126/science.ade2574
- Dataset en Zenodo: https://doi.org/10.5281/zenodo.16938681
- Codigo en GitHub: https://github.com/brineylab/AbLMs-scaling-laws
