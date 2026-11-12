# brineylab/650M_half_checkpoint-330000

## Resumen

El modelo `brineylab/650M_half_checkpoint-330000` es un modelo de lenguaje de proteinas basado en la arquitectura ESM-2, desarrollado por el laboratorio brineylab (Brines Lab) para el estudio de leyes de escalado en modelos de lenguaje de anticuerpos (AbLMs, *Antibody Language Models*). Forma parte de una familia de 15 modelos entrenados con cinco tamanos distintos (de 8M a 650M parametros) y tres escalas de datos emparejados de secuencias de anticuerpos, con el objetivo de determinar como escalar de forma eficiente estos modelos para el descubrimiento terapeutico. El modelo resuelve la tarea de *masked language modeling* (fill-mask) sobre secuencias de aminoacidos y puede adaptarse mediante *fine-tuning* a tareas de clasificacion.

Esta variante concreta tiene 651.456.470 parametros, 33 capas transformer, dimension oculta de 1280 y 20 cabezas de atencion. Se entreno sobre la mitad del conjunto de datos (824.363 secuencias pareadas de anticuerpos) y corresponde al checkpoint del paso de entrenamiento 330.000, tal como se documenta en la Tabla S1 del preprint asociado. Es relevante porque proporciona un punto de referencia abierto (licencia MIT) para investigacion en inmunologia computacional y diseno de anticuerpos, y porque su publicacion acompana un estudio sistematico sobre el equilibrio entre tamano de modelo y disponibilidad de datos.

La entrada del modelo es una secuencia nativa pareada de cadena pesada y cadena ligera de anticuerpo, separadas por dos tokens `<cls>`, con una longitud de 320 tokens tras padding o truncamiento. La salida es una prediccion de tokens enmascarados, lo que permite emplearlo como extractor de representaciones o como base para modelos de clasificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ESM-2 (encoder, *masked language modeling*) |
| Parametros totales | 651.456.470 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 320 tokens (longitud de entrenamiento, con padding o truncamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (secuencias de aminoacidos, no lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ESM-2 (*Evolutionary Scale Modeling*), un transformer tipo encoder con 33 capas, dimension oculta de 1280 y 20 cabezas de atencion, adaptado al dominio de secuencias de anticuerpos. La tarea de preentrenamiento es *masked language modeling* sobre secuencias de aminoacidos, de forma analoga al enmascaramiento de tokens en modelos de lenguaje natural. La entrada combina la cadena pesada y la cadena ligera del anticuerpo, separadas por dos tokens `<cls>`, lo que permite al modelo aprender representaciones conjuntas de la pareja nativa.

El entrenamiento se realizo sobre la mitad del conjunto de datos de secuencias pareadas de anticuerpos (824.363 secuencias de un total de aproximadamente 1,6 millones), y este checkpoint corresponde al paso 330.000. El estudio completo entrena 15 modelos (cinco tamanos por tres escalas de datos) para analizar las leyes de escalado de AbLMs. No se dispone en la informacion proporcionada de detalles sobre el uso de RLHF, DPO ni de innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal; el modelo es un encoder ESM-2 estandar.

## Capacidades

- Prediccion de tokens enmascarados (*fill-mask*) sobre secuencias de aminoacidos de anticuerpos.
- Generacion de representaciones contextuales de cadenas pesadas y ligeras emparejadas.
- *Fine-tuning* para tareas de clasificacion, como clasificacion de especificidad y clasificacion de pares (segun el paper).
- Extraccion de embeddings para analisis de repertorios inmunes.
- No soporta *tool calling*, *function calling*, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni de vision, audio o generacion de texto en lenguaje natural.
- No dispone de *thinking mode* ni de modos de razonamiento extendido.

## Casos de uso

- **Prediccion de mutaciones en anticuerpos**: enmascarar posiciones concretas de la secuencia y consultar las probabilidades del modelo para evaluar el impacto de sustituciones de aminoacidos en la cadena pesada o ligera, util en optimizacion de afinidad.
- **Clasificacion de especificidad de anticuerpos**: cargar el modelo con `EsmForSequenceClassification`, congelar el cuerpo base y entrenar la cabeza de clasificacion sobre datos etiquetados para predecir si un anticuerpo es especifico o no.
- **Clasificacion de pares cadena pesada / cadena ligera**: usar la representacion conjunta de la pareja para tareas de emparejamiento correcto, aprovechando el formato de entrada con separador `<cls><cls>`.
- **Extraccion de embeddings para agrupamiento de repertorios**: generar representaciones de secuencias y emplearlas en analisis de clustering o busqueda de similitud en repertorios inmunes.
- **Base para *fine-tuning* en tareas de diseno terapeutico**: partir de este checkpoint como inicializacion en lugar de un ESM-2 generico, reduciendo el coste de adaptacion a dominios de anticuerpos.
- **Investigacion sobre leyes de escalado**: utilizar el modelo como punto de comparacion dentro de la coleccion de 15 modelos para estudiar el efecto del tamano y de la escala de datos en el rendimiento downstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El preprint asociado (bioRxiv 2025.09.02.673765) contiene las tablas comparativas de los 15 modelos, pero los valores numericos no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- **VRAM estimada para inferencia**: aproximadamente 2,6 GB en precision completa (fp32, segun el tamano del repo); alrededor de 1,3 GB en fp16/bf16.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM para inferencia en fp16; una RTX 3060, RTX 4060 o superior es suficiente.
- **Cabe en GPU de consumo**: si, en practicamente cualquier GPU consumer moderna (RTX 20xx en adelante) e incluso en CPU para inferencia puntual.
- **Opciones de despliegue**: transformers (`EsmForMaskedLM`, `EsmForSequenceClassification`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| brineylab/650M_half_checkpoint-330000 | 651M | 320 tokens | fill-mask de anticuerpos | MIT | Hugging Face |
| ESM-2 (650M, facebook) | ~650M | 1024 tokens | fill-mask de proteinas generales | MIT | Hugging Face |
| Otros modelos de la coleccion AbLMs Scaling Laws | 8M–650M | 320 tokens | fill-mask de anticuerpos | MIT | Hugging Face |

La comparacion con ESM-2 de 650M es la mas directa: comparten arquitectura y tamano, pero el modelo de brineylab esta especializado en secuencias pareadas de anticuerpos y usa un contexto de 320 tokens en lugar de 1024. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en secuencias de anticuerpos; no es un modelo de lenguaje natural ni debe usarse para tareas de texto general.
- Longitud de contexto limitada a 320 tokens durante el entrenamiento; secuencias mas largas se truncan, lo que puede perder informacion en cadenas extensas.
- Riesgo de sesgo hacia la distribucion del conjunto de datos de entrenamiento (secuencias pareadas de anticuerpos), lo que puede limitar la generalizacion a otros tipos de proteinas o repertorios atipicos.
- Riesgo de alucinacion en el sentido de predicciones de aminoacidos poco fiables fuera de la distribucion de entrenamiento; las probabilidades deben interpretarse con cautela.
- Licencia MIT, que permite uso comercial, pero se recomienda revisar las condiciones del preprint y de los datos de entrenamiento (Zenodo) para cumplimiento.
- Es un checkpoint intermedio (paso 330.000) de un estudio de escalado; no se presenta como un modelo final optimizado para produccion.
- No se documentan procesos de alineacion ni evaluaciones de seguridad, algo esperable en un modelo de proteinas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brineylab/650M_half_checkpoint-330000
- Coleccion AbLMs Scaling Laws: https://huggingface.co/collections/brineylab/ablms-scaling-laws-6824e4beaabf4b16107cac4f
- Preprint en bioRxiv: https://doi.org/10.1101/2025.09.02.673765
- Datos de preentrenamiento en Zenodo: https://doi.org/10.5281/zenodo.16938681
- Codigo en GitHub: https://github.com/brineylab/AbLMs-scaling-laws
- Paper de ESM-2: https://www.science.org/doi/10.1126/science.ade2574
