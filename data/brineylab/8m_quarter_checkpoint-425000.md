# brineylab/8M_quarter_checkpoint-425000

## Resumen

El modelo `brineylab/8M_quarter_checkpoint-425000` es un modelo de lenguaje de proteinas de tipo ESM-2, desarrollado por el laboratorio brineylab, especializado en secuencias de anticuerpos (antibody language model, AbLM). Forma parte de un estudio sistematico sobre las leyes de escalado de modelos de lenguaje de anticuerpos, en el que se entrenaron 15 variantes que combinan cinco tamanos de modelo (de 8M a 650M parametros) con tres escalas de dataset de secuencias pareadas de anticuerpos (~1,6M secuencias en total). Este checkpoint concreto corresponde al tamano mas pequeno (8M) entrenado sobre el "quarter dataset" (412.182 secuencias pareadas de cadena pesada y ligera).

El modelo resuelve la tarea de enmascaramiento y relleno de tokens (fill-mask) sobre secuencias de aminoacidos, y puede reutilizarse como extractor de representaciones o ajustarse finamente para tareas de clasificacion (por ejemplo, especificidad o clasificacion de pares de cadenas). Su relevancia actual radica en que proporciona un punto de referencia empirico para decidir cuanto escalar un AbLM en funcion de los datos disponibles, evitando rendimientos decrecientes.

Arquitectonicamente es un transformer ESM-2 de 6 capas, con dimension oculta de 320 y 20 cabezas de atencion, lo que suma 7.615.562 parametros reales. La licencia MIT y su reducido tamano (repo de 0,1 GB) lo hacen facil de desplegar y de integrar en pipelines de biologia computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ESM-2 (encoder, 6 capas, hidden size 320, 20 cabezas de atencion) |
| Parametros totales | 7.615.562 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 320 tokens (longitud de entrenamiento: padding o truncado a 320) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion no documentada por el autor) |
| Idiomas soportados | no disponible (modelo de secuencias de aminoacidos, no de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ESM-2, un transformer encoder de tipo BERT con tokenizador estandar de ESM-2. En esta variante de 8M de parametros se emplean 6 capas, un tamano oculto de 320 y 20 cabezas de atencion. La entrada es la secuencia aminoacidica de la cadena pesada del anticuerpo, seguida de dos tokens `<cls>` como separador, y la secuencia de la cadena ligera; durante el entrenamiento las entradas se rellenaron o truncaron a 320 tokens.

El preentrenamiento se realizo sobre secuencias de anticuerpos pareadas de forma nativa, en concreto sobre el "quarter dataset" de 412.182 secuencias pareadas, que forma parte de un conjunto total de aproximadamente 1,6M secuencias. El checkpoint publicado corresponde al paso de entrenamiento 425.000, tal y como se detalla en la Tabla S1 del preprint. El estudio completo entrena 15 modelos cruzando cinco tamanos (8M-650M) con tres escalas de datos, y concluye que el escalado efectivo de un AbLM requiere equilibrar el tamano del modelo con la disponibilidad de datos para evitar rendimientos decrecientes. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Relleno de tokens enmascarados (fill-mask) sobre secuencias de aminoacidos de anticuerpos.
- Modelado de lenguaje de proteinas sobre secuencias pareadas cadena pesada / cadena ligera.
- Extraccion de representaciones (embeddings) de secuencias de anticuerpos.
- Ajuste fino para clasificacion de secuencias (por ejemplo, especificidad o clasificacion de pares), cargando `EsmForSequenceClassification` y congelando el modelo base.
- Procesamiento de secuencias de hasta 320 tokens.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues de lenguaje natural: es un modelo especializado en proteinas.

## Casos de uso

- Prediccion de residuos enmascarados en regiones variables de anticuerpos: util para tareas de diseno y maduracion de afinidad, donde el modelo propone aminoacidos plausibles en posiciones ocultas de la cadena pesada o ligera.
- Filtrado de repertorios de anticuerpos: uso de las representaciones del modelo para puntuar o clasificar secuencias pareadas y priorizar candidatos antes de validacion experimental.
- Clasificacion de especificidad: ajuste fino con `EsmForSequenceClassification` (congelando el modelo base) para discriminar anticuerpos con patrones de especificidad conocidos.
- Clasificacion de pares cadena pesada / cadena ligera: verificacion de emparejamientos plausibles en datasets donde la pareja nativa no esta garantizada.
- Baseline para estudios de escalado: referencia ligera (7,6M parametros) para comparar coste-rendimiento frente a variantes mayores del mismo estudio (hasta 650M).
- Prototipado rapido en entornos con recursos limitados: su tamano (repo de 0,1 GB) permite iterar en CPU o en GPUs de gama baja durante fases de investigacion.
- Generacion de embeddings para clustering de repertorios inmunitarios: agrupacion de secuencias similares para analisis exploratorio de diversidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al preprint en bioRxiv (doi:10.1101/2025.09.02.673765) y a su Tabla S1 para los detalles de entrenamiento, pero no se incluyen cifras de MMLU, HumanEval, GSM8K ni metricas especificas de proteinas en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (7,6M parametros, ~30 MB en fp32); en la practica cabe en cualquier GPU moderna e incluso en CPU.
- GPU recomendadas: cualquier GPU consumer (GTX 1060, RTX 3050, RTX 4090) es sobradamente suficiente; tambien A100/H100 si se integra en un pipeline mayor.
- Cabe en GPU consumer: si, en todas las gamas actuales; tambien en CPU sin problemas.
- Opciones de despliegue: transformers (carga directa con `EsmForMaskedLM` y `EsmTokenizer`); no se documentan integraciones especificas con vLLM, llama.cpp, Ollama o TGI para este modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| brineylab/8M_quarter_checkpoint-425000 | 7,6M | 320 tokens | fill-mask de anticuerpos | MIT | Hugging Face |
| Otras variantes del estudio AbLMs Scaling Laws (mismo autor) | hasta 650M | 320 tokens | fill-mask de anticuerpos | MIT (segun coleccion) | Hugging Face (coleccion AbLMs Scaling Laws) |
| ESM-2 (Meta) | 8M-15B (varias tallas) | variable | protein LM general | MIT (segun publicacion) | Hugging Face |

La comparativa detallada con modelos de terceros no esta disponible en la informacion proporcionada; la referencia natural son las otras 14 variantes del mismo estudio, que comparten arquitectura, tokenizador y datos pero difieren en tamano y escala de dataset.

## Limitaciones y advertencias

- Modelo especializado en secuencias de anticuerpos: no es un modelo de lenguaje natural y no debe emplearse para tareas de texto general.
- Contexto limitado a 320 tokens: secuencias mas largas se truncan, lo que puede perder informacion en cadenas extendidas.
- Riesgo de alucinacion en el sentido de predicciones aminoacidicas no validas biologicamente; los resultados deben validarse experimentalmente.
- Sesgos potenciales derivados del dataset de 412.182 secuencias pareadas: la distribucion de repertorios puede no representar todas las especies, isotipos o condiciones patologicas.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones del dataset original en Zenodo y citar el preprint correspondiente.
- Checkpoint intermedio (paso 425.000): no se garantiza que sea el optimo para todas las tareas; la model card indica que corresponde a la Tabla S1 del paper.
- No se documentan cuantizaciones oficiales ni soporte para motores de inferencia de alto rendimiento (vLLM, TGI, llama.cpp).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brineylab/8M_quarter_checkpoint-425000
- Coleccion AbLMs Scaling Laws: https://huggingface.co/collections/brineylab/ablms-scaling-laws-6824e4beaabf4b16107cac4f
- Preprint en bioRxiv: https://doi.org/10.1101/2025.09.02.673765
- Paper de ESM-2 (Science): https://www.science.org/doi/10.1126/science.ade2574
- Datasets en Zenodo: https://doi.org/10.5281/zenodo.16938681
- Codigo en GitHub: https://github.com/brineylab/AbLMs-scaling-laws
