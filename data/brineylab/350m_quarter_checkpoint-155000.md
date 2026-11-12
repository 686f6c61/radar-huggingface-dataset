# brineylab/350M_quarter_checkpoint-155000

## Resumen

El modelo `brineylab/350M_quarter_checkpoint-155000` es un modelo de lenguaje de proteinas de tipo *masked language model* (fill-mask) basado en la arquitectura ESM-2, desarrollado por el laboratorio brineylab para el estudio de leyes de escalado (*scaling laws*) en modelos de lenguaje de anticuerpos (AbLMs). Con 355.562.402 parametros, forma parte de un conjunto de 15 modelos entrenados en cinco tamanos (8M-650M parametros) y tres escalas de datos emparejados de secuencias de anticuerpos (~1,6M secuencias en total). El objetivo del trabajo es determinar como balancear el tamano del modelo con la disponibilidad de datos para evitar rendimientos decrecientes en el dominio de las inmunoglobulinas.

Este checkpoint concreto corresponde al tamano de 350M con el dataset "quarter" (412.182 secuencias de anticuerpos emparejadas) y al paso de entrenamiento 155.000, tal como se documenta en la Tabla S1 del preprint asociado (bioRxiv, DOI 10.1101/2025.09.02.673765). El modelo procesa cadenas pesada y ligera de anticuerpos de forma nativa, usando dos tokens `<cls>` como separador entre ambas, y fue entrenado con entradas truncadas o rellenadas a 320 tokens.

Es relevante para investigadores en inmunoinformatica y descubrimiento terapeutico de anticuerpos: permite hacer *masked language modeling* sobre secuencias de anticuerpos emparejadas y sirve como base para *fine-tuning* en tareas de clasificacion como especificidad o prediccion de emparejamiento cadena pesada-ligera. La licencia MIT facilita su uso comercial y la integracion en pipelines de transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ESM-2 (transformer encoder, masked language model) |
| Parametros totales | 355.562.402 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 320 tokens (entradas truncadas/rellenadas a 320 durante el entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de secuencias de aminoacidos, no de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Capas transformer | 32 |
| Tamano oculto | 960 |
| Cabezas de atencion | 20 |
| Dataset de entrenamiento | Quarter dataset (412.182 secuencias de anticuerpos emparejadas) |
| Checkpoint | Paso de entrenamiento 155.000 |
| Tamano del repo | 1,4 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ESM-2, un transformer encoder entrenado con objetivo de *masked language modeling*. En este caso, las 32 capas transformer con tamano oculto 960 y 20 cabezas de atencion se entrenaron sobre secuencias de anticuerpos nativamente emparejadas: la cadena pesada, dos tokens `<cls>` como separador y la cadena ligera, con truncamiento o relleno a 320 tokens. El entrenamiento se realizo sobre el "quarter dataset", que contiene 412.182 secuencias emparejadas, una de las tres escalas de datos del estudio (que en total abarca ~1,6M secuencias).

El trabajo forma parte de un estudio sistematico de *scaling laws* para AbLMs que entrena 15 modelos cruzando cinco tamanos (8M-650M) con tres escalas de datos. No se especifica en la informacion disponible si hubo RLHF, DPO u otras fases de alineamiento (no aplicables tipicamente a modelos de proteinas). La innovacion principal del trabajo es la caracterizacion empirica del equilibrio entre tamano de modelo y datos en el dominio de anticuerpos, mostrando que el escalado efectivo requiere balancear ambos factores. Los datos de preentrenamiento estan publicados en Zenodo y el codigo en GitHub.

## Capacidades

- *Masked language modeling* sobre secuencias de aminoacidos de anticuerpos (prediccion de residuos enmascarados).
- Procesamiento de cadenas pesada y ligera de anticuerpos de forma nativa y emparejada, usando `<cls><cls>` como separador.
- Generacion de representaciones contextuales de secuencias de anticuerpos utiles como base para *fine-tuning*.
- *Fine-tuning* para clasificacion de secuencias (por ejemplo, especificidad y clasificacion de pares pesada-ligera) mediante `EsmForSequenceClassification`.
- No soporta *tool calling*, agentes, razonamiento multi-paso ni capacidades multilingues de lenguaje natural (es un modelo de proteinas).
- No dispone de modo *thinking*, vision ni audio.

## Casos de uso

- Prediccion de residuos enmascarados en secuencias de anticuerpos: enmascarar posiciones de la cadena pesada o ligera y usar el modelo para inferir el aminoacido mas probable, util en analisis de repertorios inmunes y estudio de regiones determinantes de complementariedad (CDR).
- Filtrado y priorizacion de candidatos terapeuticos: usar las representaciones del modelo como *features* para clasificar anticuerpos por especificidad tras *fine-tuning* con `EsmForSequenceClassification`, reduciendo el espacio de candidatos antes de validacion experimental.
- Prediccion de emparejamiento cadena pesada-ligera: aprovechar el entrenamiento nativo sobre pares para tareas de clasificacion de pares, relevante en ingenieria de anticuerpos y diseno de bibliotecas.
- Analisis de repertorios inmunes: calcular *embeddings* de secuencias para agrupar clones, detectar patrones de maduracion de afinidad o comparar repertorios entre muestras.
- Base para modelos especializados: *fine-tuning* con cabezas de clasificacion o regresion sobre propiedades biofisicas (estabilidad, expresabilidad, afinidad) partiendo de pesos preentrenados en el dominio de anticuerpos.
- Investigacion en *scaling laws*: servir como punto de referencia (350M, dataset quarter, paso 155k) para reproducir o extender el estudio de leyes de escalado en AbLMs, comparando con los otros 14 modelos de la coleccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El preprint asociado (bioRxiv, DOI 10.1101/2025.09.02.673765) y sus tablas suplementarias contienen los resultados del estudio de escalado, pero los valores numericos concretos no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,4 GB solo para pesos (355M parametros x 4 bytes), mas overhead de activaciones y tokenizador; en la practica, 2-3 GB de VRAM son suficientes.
- En FP16/BF16: aproximadamente 0,7 GB para pesos; cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM (RTX 3050, RTX 4060, RTX 4090, A100, H100). Para *fine-tuning*, se recomienda al menos 8-16 GB de VRAM segun el tamano de lote.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer de los ultimos anos.
- Opciones de despliegue: libreria `transformers` (carga directa con `EsmForMaskedLM` y `EsmTokenizer`), integracion en pipelines de Hugging Face. No se documentan opciones especificas para vLLM, llama.cpp u Ollama (no orientadas a modelos ESM).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| brineylab/350M_quarter_checkpoint-155000 | 355M | 320 tokens | Anticuerpos emparejados (AbLM) | MIT | Hugging Face |
| ESM-2 650M (Meta) | 650M | 1024 tokens (tipico en ESM-2) | Proteinas generales | MIT | Hugging Face |
| ESM-2 150M (Meta) | 150M | 1024 tokens (tipico en ESM-2) | Proteinas generales | MIT | Hugging Face |
| Otros modelos de la coleccion AbLMs Scaling Laws (8M-650M) | 8M-650M | 320 tokens | Anticuerpos emparejados | MIT | Hugging Face |

Los modelos de la coleccion AbLMs Scaling Laws del mismo autor (8M, 150M, 650M y variantes con distintos datasets) son las alternativas mas directamente comparables, ya que comparten arquitectura, datos y metodologia. Frente a ESM-2 original de Meta, este modelo esta especializado en anticuerpos emparejados, lo que puede ofrecer mejores representaciones en ese dominio a costa de menor generalidad. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en secuencias de anticuerpos emparejadas; no es adecuado para lenguaje natural ni para proteinas fuera de ese dominio sin *fine-tuning*.
- Longitud de contexto limitada a 320 tokens, lo que restringe el analisis de secuencias mas largas o de constructos multimodulares.
- Riesgo de sesgo derivado del dataset de entrenamiento (412.182 secuencias emparejadas), que puede no representar toda la diversidad de repertorios de anticuerpos humanos o de otras especies.
- Riesgo de alucinacion en el sentido de predicciones de residuos poco fiables en regiones con baja cobertura en los datos de entrenamiento; las predicciones deben validarse experimentalmente.
- Checkpoint intermedio (paso 155.000): no es necesariamente el punto optimo de entrenamiento; el estudio documenta la seleccion de checkpoints por modelo.
- Licencia MIT: permite uso comercial, pero se recomienda citar el preprint y revisar los terminos de los datasets de Zenodo.
- No se documentan cuantizaciones oficiales ni soporte para motores de inferencia de alto rendimiento; el despliegue se limita a `transformers`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brineylab/350M_quarter_checkpoint-155000
- Coleccion AbLMs Scaling Laws: https://huggingface.co/collections/brineylab/ablms-scaling-laws-6824e4beaabf4b16107cac4f
- Preprint en bioRxiv: https://doi.org/10.1101/2025.09.02.673765
- Paper de ESM-2 (referencia de arquitectura): https://www.science.org/doi/10.1126/science.ade2574
- Datasets de preentrenamiento en Zenodo: https://doi.org/10.5281/zenodo.16938681
- Codigo en GitHub: https://github.com/brineylab/AbLMs-scaling-laws
