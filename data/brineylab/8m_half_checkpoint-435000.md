# brineylab/8M_half_checkpoint-435000

## Resumen

El modelo `brineylab/8M_half_checkpoint-435000` es un modelo de lenguaje de proteinas basado en la arquitectura ESM-2, desarrollado por el laboratorio brineylab como parte de un estudio sistematico sobre las leyes de escalado de modelos de lenguaje de anticuerpos (AbLMs, por sus siglas en ingles). Concretamente, se trata del checkpoint del paso de entrenamiento 435.000 correspondiente al modelo de menor tamano (8M de parametros) entrenado sobre la mitad del corpus de secuencias de anticuerpos emparejadas (824.363 secuencias). El modelo resuelve la tarea de `fill-mask` sobre secuencias de aminoacidos de cadenas pesada y ligera de anticuerpos.

La relevancia de este modelo no reside en su rendimiento individual, sino en su papel dentro de un estudio mas amplio que entrena 15 modelos (5 tamanos x 3 escalas de datos) para determinar como escalan los AbLMs y donde aparecen los rendimientos decrecientes. El checkpoint permite reproducir los resultados del preprint y sirve como punto de partida para fine-tuning en tareas de clasificacion de anticuerpos, como especificidad o clasificacion de pares cadena pesada-cadena ligera.

El modelo tiene 7.615.562 parametros, 6 capas transformer, dimension oculta de 320 y 20 cabezas de atencion, con una longitud de contexto de entrenamiento de 320 tokens. La licencia es MIT y los pesos estan en formato safetensors, cargables directamente con la libreria `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ESM-2 (encoder, masked language modeling) |
| Parametros totales | 7.615.562 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 320 tokens (longitud de entrenamiento; padding/truncado a 320) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de secuencias biologicas, no de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ESM-2 (encoder transformer con atencion bidireccional y objetivo de masked language modeling). La configuracion concreta de esta variante de 8M es de 6 capas transformer, hidden size de 320 y 20 cabezas de atencion. La entrada consiste en la secuencia aminoacidica de la cadena pesada del anticuerpo, dos tokens `<cls>` como separador y la secuencia de la cadena ligera; durante el entrenamiento las entradas se rellenaron o truncaron a 320 tokens.

El entrenamiento se realizo sobre secuencias de anticuerpos nativamente emparejadas (cadena pesada + cadena ligera). Este checkpoint concreto corresponde a la mitad del dataset, con 824.363 secuencias emparejadas, y al paso de entrenamiento 435.000. El estudio completo entrena 15 modelos sobre cinco tamanos (8M a 650M) y tres escalas de datos, con un total de aproximadamente 1,6 millones de secuencias. No se indica en la informacion disponible si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento, algo esperable en un modelo de proteinas y no de lenguaje natural.

## Capacidades

- Enmascaramiento y prediccion de tokens (masked language modeling) sobre secuencias de aminoacidos de anticuerpos.
- Modelado conjunto de cadenas pesada y ligera mediante el separador de dos tokens `<cls>`.
- Generacion de representaciones contextuales de secuencias de anticuerpos, utiles como features para tareas posteriores.
- Fine-tuning para clasificacion de secuencias (por ejemplo, especificidad o clasificacion de pares) mediante `EsmForSequenceClassification`, con opcion de congelar el modelo base.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No es un modelo multilingue ni de lenguaje natural: opera exclusivamente sobre secuencias biologicas.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Prediccion de residuos enmascarados en secuencias de anticuerpos: dado un par cadena pesada/cadena ligera con posiciones ocultas, el modelo estima los aminoacidos mas probables, util para analisis de mutaciones y regiones variables.
- Fine-tuning para clasificacion de especificidad: cargando el modelo con `EsmForSequenceClassification` y congelando el backbone, se puede entrenar un clasificador binario o multiclase sobre un dataset etiquetado de anticuerpos.
- Clasificacion de pares cadena pesada/ligera: el formato de entrada con separador `<cls><cls>` permite entrenar modelos que discriminen si un par de cadenas es biologicamente plausible.
- Generacion de embeddings para clustering de repertorios: las representaciones internas del encoder sirven para agrupar secuencias de anticuerpos por similitud funcional o estructural.
- Reproduccion de experimentos de scaling laws: el checkpoint permite replicar los resultados del preprint sobre el efecto del tamano y la cantidad de datos en AbLMs.
- Baseline ligero en pipelines de anotacion: por su tamano reducido (7,6M de parametros), puede ejecutarse en CPU para tareas de filtrado o priorizacion previas a modelos mayores.
- Punto de partida para experimentos de destilacion o comparacion de arquitecturas en el dominio de anticuerpos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El preprint asociado (bioRxiv, DOI 10.1101/2025.09.02.673765) contiene las tablas de resultados del estudio de scaling laws, pero los valores concretos no se incluyen en la model card proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en precision completa (fp32), dado que el modelo tiene 7,6M de parametros (~30 MB de pesos) mas overhead de activaciones y tokenizer.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en GTX 1650, RTX 3060, RTX 4090, A100 o H100.
- Cabe en CPU sin problemas; es viable la inferencia en un portatil convencional.
- Opciones de despliegue: `transformers` (carga directa con `EsmForMaskedLM`), y en general cualquier runtime compatible con safetensors. No se documentan integraciones especificas con vLLM, llama.cpp, Ollama o TGI para este modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada, aunque por el tamano del modelo se espera latencia de milisegundos en GPU y decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| brineylab/8M_half_checkpoint-435000 | 7,6M | 320 tokens | fill-mask en anticuerpos | MIT | Hugging Face |
| Otros checkpoints de la coleccion AbLMs Scaling Laws (8M–650M) | 8M–650M | 320 tokens | fill-mask en anticuerpos | MIT (segun coleccion) | Hugging Face |
| ESM-2 base (facebook/esm2_t6_8M_UR50D) | ~8M | 1022 tokens | fill-mask en proteinas generales | MIT | Hugging Face |

La comparativa mas directa es con el ESM-2 de 8M original de Meta, del que este modelo deriva: misma arquitectura y orden de magnitud de parametros, pero entrenado especificamente sobre secuencias de anticuerpos emparejadas en lugar de proteinas generales. Frente a los demas checkpoints de la coleccion AbLMs Scaling Laws, este se distingue por ser el de menor tamano y por haberse entrenado con la mitad del corpus. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de dominio muy especifico: solo procesa secuencias de aminoacidos de anticuerpos; no es util para lenguaje natural ni para proteinas fuera de ese dominio sin reentrenamiento.
- Longitud de contexto limitada a 320 tokens; secuencias mas largas se truncan, lo que puede perder informacion en cadenas especialmente largas.
- Riesgo de alucinacion en el sentido de predicciones de aminoacidos plausibles pero biologicamente invalidas; las salidas deben validarse experimentalmente.
- Sesgos derivados del corpus de entrenamiento (824.363 secuencias emparejadas): la distribucion de repertorios puede no representar todas las especies, isotipos o condiciones patologicas.
- No se documentan evaluaciones de sesgo ni de robustez fuera de la distribucion de entrenamiento.
- Licencia MIT: permite uso comercial y modificacion, pero se recomienda citar el preprint y el repositorio original.
- Al ser un checkpoint intermedio (paso 435.000) de un estudio de scaling, no esta optimizado como modelo de produccion; para uso real conviene evaluar los checkpoints finales de la coleccion.
- No se especifican limitaciones de idioma porque el modelo no opera sobre texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brineylab/8M_half_checkpoint-435000
- Coleccion AbLMs Scaling Laws: https://huggingface.co/collections/brineylab/ablms-scaling-laws-6824e4beaabf4b16107cac4f
- Preprint en bioRxiv: https://doi.org/10.1101/2025.09.02.673765
- Paper de ESM-2: https://www.science.org/doi/10.1126/science.ade2574
- Datasets en Zenodo: https://doi.org/10.5281/zenodo.16938681
- Codigo en GitHub: https://github.com/brineylab/AbLMs-scaling-laws
