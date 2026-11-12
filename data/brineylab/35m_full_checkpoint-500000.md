# brineylab/35M_full_checkpoint-500000

## Resumen

El modelo `brineylab/35M_full_checkpoint-500000` es un modelo de lenguaje de proteinas basado en la arquitectura ESM-2, desarrollado por el laboratorio brineylab para el analisis de secuencias de anticuerpos. Forma parte de un estudio sistematico sobre las leyes de escalado (scaling laws) de los modelos de lenguaje de anticuerpos (AbLMs), en el que se entrenaron 15 variantes que combinan cinco tamanos de modelo (de 8M a 650M parametros) con tres escalas de dataset de secuencias de anticuerpos emparejadas (hasta 1,6 millones de secuencias en total). El objetivo es determinar como equilibrar el tamano del modelo con la disponibilidad de datos para evitar rendimientos decrecientes en el dominio de la biologia computacional.

Esta variante concreta cuenta con 33,6 millones de parametros (12 capas transformer, dimension oculta de 480 y 20 cabezas de atencion) y fue entrenada sobre el dataset completo de 1.648.726 secuencias de anticuerpos emparejadas, alcanzando el paso de entrenamiento 500.000. Su tarea principal es el enmascaramiento de tokens (fill-mask) sobre secuencias de aminoacidos, lo que permite su uso tanto para representaciones de proteinas como para ajuste fino en tareas de clasificacion.

La relevancia de este modelo radica en su caracter abierto (licencia MIT) y en su inclusion dentro de una coleccion documentada y reproducible que aborda una pregunta practica: cuanto invertir en tamano de modelo frente a cantidad de datos en el dominio de anticuerpos. El checkpoint esta disponible en formato safetensors y es compatible con la libreria transformers de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ESM-2 (transformer encoder, masked language modeling) |
| Parametros totales | 33.656.098 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 320 tokens (longitud de entrenamiento; padding/truncado a 320) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de secuencias de aminoacidos, no de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ESM-2, un transformer encoder disenado para proteinas y entrenado con el objetivo de masked language modeling (fill-mask). En esta variante de 35M de parametros, la red consta de 12 capas transformer, una dimension oculta de 480 y 20 cabezas de atencion. El tokenizador es el ESM-2 estandar, y la entrada se construye concatenando la cadena pesada del anticuerpo, dos tokens `<cls>` como separador y la cadena ligera, con padding o truncado a 320 tokens durante el entrenamiento.

El entrenamiento se realizo sobre el dataset completo de 1.648.726 secuencias de anticuerpos nativamente emparejadas, y este checkpoint corresponde al paso 500.000, tal como se detalla en la Tabla S1 del preprint asociado. El estudio marco entrena 15 modelos que cruzan cinco tamanos (8M a 650M) con tres escalas de datos, con el objetivo de caracterizar las leyes de escalado especificas del dominio de anticuerpos. No se especifica en la informacion disponible si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion, algo poco habitual en modelos de proteinas.

## Capacidades

- Modelado de lenguaje enmascarado (fill-mask) sobre secuencias de aminoacidos de anticuerpos.
- Generacion de representaciones contextuales de cadenas pesadas y ligeras emparejadas.
- Prediccion de tokens enmascarados en secuencias de anticuerpos, util para imputacion o analisis de mutaciones.
- Ajuste fino para tareas de clasificacion de secuencias (por ejemplo, especificidad y clasificacion de pares), mediante `EsmForSequenceClassification`.
- Procesamiento de secuencias emparejadas heavy-light con separador de doble `<cls>`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje natural).
- No dispone de capacidades multimodales (vision, audio) ni de modo de razonamiento explicito.
- Capacidades multilingues no aplicables: opera sobre el alfabeto de aminoacidos, no sobre lenguaje natural.

## Casos de uso

- Prediccion de residuos enmascarados en secuencias de anticuerpos: el modelo puede rellenar posiciones ocultas en cadenas pesadas o ligeras para analizar la plausibilidad de mutaciones o completar regiones desconocidas en repertorios.
- Clasificacion de especificidad de anticuerpos: mediante ajuste fino con `EsmForSequenceClassification` y congelacion del modelo base, se puede entrenar un clasificador para predecir si un anticuerpo es especifico frente a un antigeno, replicando los experimentos del paper.
- Clasificacion de pares heavy-light: el formato de entrada con doble `<cls>` permite entrenar clasificadores que evaluen la compatibilidad o el emparejamiento correcto de cadenas pesadas y ligeras.
- Filtrado y priorizacion en pipelines de descubrimiento: el modelo puede puntuar secuencias candidatas de repertorios inmunitarios para descartar aquellas con baja verosimilitud bajo el modelo, reduciendo el espacio de busqueda antes de validacion experimental.
- Generacion de embeddings para clustering de repertorios: las representaciones internas del encoder pueden extraerse para agrupar anticuerpos por similitud funcional o estructural en estudios de repertorio.
- Punto de partida para ajuste fino en tareas downstream: al ser un checkpoint de 35M con licencia MIT, es adecuado como base ligera para experimentos academicos con recursos computacionales limitados.
- Estudio de scaling laws: util como referencia reproducible para comparar el efecto del tamano y los datos en tareas de anticuerpos, dado que forma parte de una coleccion documentada de 15 modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al preprint en bioRxiv y a la Tabla S1 para los resultados del estudio, pero no se incluyen cifras concretas en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (33,6M de parametros, aproximadamente 135 MB en fp32), y del orden de decenas de MB en cuantizaciones de 8 o 4 bits.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en tarjetas con 4 GB o menos, e incluso puede ejecutarse en CPU para inferencia puntual.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090, etc.) y en CPU.
- Opciones de despliegue: transformers (libreria nativa), y potencialmente ONNX o TorchScript si se exporta; no se documentan integraciones especificas con vLLM, llama.cpp u Ollama para este modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano reducido, se espera una latencia muy baja en GPU, pero no se aportan cifras oficiales.
- Tamano del repositorio: 0,2 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| brineylab/35M_full_checkpoint-500000 | 33,6M | 320 tokens | fill-mask (anticuerpos) | MIT | Hugging Face |
| ESM-2 (variante 35M) | ~35M | ~1024 tokens (segun variante) | fill-mask (proteinas generales) | MIT | Hugging Face (facebook/esm2) |
| Otras variantes de la coleccion AbLMs Scaling Laws (8M-650M) | 8M-650M | 320 tokens | fill-mask (anticuerpos) | MIT | Hugging Face (coleccion brineylab) |

La comparacion con ESM-2 generico es la mas directa, ya que el modelo deriva de esa arquitectura y tokenizador. La diferencia principal es el entrenamiento especifico sobre secuencias de anticuerpos emparejadas, que puede ofrecer mejores representaciones en ese dominio a costa de un contexto mas corto (320 frente a ~1024 tokens) y de un sesgo hacia el subdominio de anticuerpos. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado en secuencias de anticuerpos: su uso fuera de ese dominio (proteinas generales o lenguaje natural) no esta validado y probablemente ofrezca un rendimiento inferior a ESM-2 generico.
- Contexto limitado a 320 tokens, lo que restringe el analisis de cadenas muy largas o construcciones que excedan esa longitud.
- Riesgo de sobreajuste a la distribucion del dataset de entrenamiento (1,6 millones de secuencias emparejadas), con posible peor generalizacion a anticuerpos atipicos o de especies poco representadas.
- No se documentan sesgos especificos, pero el dataset puede reflejar sesgos de muestreo de los repertorios incluidos.
- Riesgo de alucinacion en el sentido de generar secuencias plausibles pero no funcionales; las predicciones deben validarse experimentalmente.
- Licencia MIT: permite uso comercial y modificacion con atribucion, sin restricciones adicionales conocidas.
- Modelo de investigacion con solo 80 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni de validacion externa independiente.
- No se especifican tecnicas de alineacion ni filtrado de datos mas alla de la descripcion del dataset; conviene revisar el preprint para conocer las limitaciones metodologicas.
- No dispone de cuantizaciones oficiales publicadas; cualquier cuantizacion seria responsabilidad del usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brineylab/35M_full_checkpoint-500000
- Coleccion AbLMs Scaling Laws: https://huggingface.co/collections/brineylab/ablms-scaling-laws-6824e4beaabf4b16107cac4f
- Preprint en bioRxiv: https://doi.org/10.1101/2025.09.02.673765
- Datasets en Zenodo: https://doi.org/10.5281/zenodo.16938681
- Codigo en GitHub: https://github.com/brineylab/AbLMs-scaling-laws
- Paper de ESM-2: https://www.science.org/doi/10.1126/science.ade2574
