# brineylab/350M_full_checkpoint-500000

## Resumen

El modelo `brineylab/350M_full_checkpoint-500000` es un modelo de lenguaje de proteinas basado en la arquitectura ESM-2, desarrollado por el laboratorio brineylab para el estudio de leyes de escala en modelos de lenguaje de anticuerpos (AbLMs, *antibody language models*). Con 355.562.402 parametros, 32 capas de transformer, dimension oculta de 960 y 20 cabezas de atencion, se entrena sobre secuencias de anticuerpos emparejadas de forma nativa (cadena pesada y cadena ligera). Su proposito es servir como herramienta de representacion y prediccion de secuencias de anticuerpos para descubrimiento terapeutico e inmunologia computacional.

El modelo forma parte de un estudio sistematico que entrena AbLMs en cinco tamanos (de 8M a 650M parametros) y tres escalas de datos emparejados (~1,6M secuencias en total), con el objetivo de determinar como escalar de forma eficiente estos modelos sin caer en rendimientos decrecientes. Esta instancia concreta corresponde al checkpoint del paso de entrenamiento 500.000 usando el conjunto de datos completo de 1.648.726 secuencias emparejadas de anticuerpos.

La relevancia actual del modelo reside en su caracter abierto (licencia MIT), su integracion directa con la libreria `transformers` de Hugging Face y su utilidad como base para *fine-tuning* en tareas de clasificacion de anticuerpos, como especificidad y clasificacion de pares. No es un modelo generativo de texto general: es un modelo de enmascaramiento (*fill-mask*) especializado en biologia y secuencias de anticuerpos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ESM-2 (transformer encoder, 32 capas, hidden size 960, 20 cabezas de atencion) |
| Parametros totales | 355.562.402 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 320 tokens (longitud de entrenamiento; entradas rellenadas o truncadas a 320) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (secuencias de aminoacidos; el campo de idiomas no esta disponible) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ESM-2, un transformer encoder de tipo BERT adaptado a proteinas, con 32 capas, dimension oculta de 960 y 20 cabezas de atencion, sumando 355.562.402 parametros. Se entrena con el objetivo de *masked language modeling* (fill-mask) sobre secuencias de aminoacidos de anticuerpos. La entrada se compone de la secuencia de la cadena pesada, dos tokens `<cls>` como separador y la secuencia de la cadena ligera, con relleno o truncado a 320 tokens durante el entrenamiento.

El entrenamiento se realizo sobre el conjunto completo de 1.648.726 secuencias de anticuerpos emparejadas de forma nativa, y este checkpoint corresponde al paso 500.000, tal como se detalla en la Tabla S1 del preprint. El estudio del que forma parte analiza leyes de escala en AbLMs, comparando cinco tamanos de modelo (8M a 650M) y tres escalas de datos, y concluye que el escalado efectivo requiere equilibrar el tamano del modelo con la disponibilidad de datos para evitar rendimientos decrecientes. No se especifica en la informacion disponible si se emplearon tecnicas de RLHF, DPO u otras innovaciones de decodificacion.

## Capacidades

- Prediccion de tokens enmascarados (*fill-mask*) sobre secuencias de aminoacidos de anticuerpos.
- Representacion de secuencias de anticuerpos emparejadas (cadena pesada y ligera) mediante el esquema de separacion con doble `<cls>`.
- *Fine-tuning* para tareas de clasificacion de secuencias, como especificidad de anticuerpos y clasificacion de pares, cargando el modelo con `EsmForSequenceClassification` y congelando los pesos base.
- Modelado de lenguaje sobre proteinas en general, heredado de la base ESM-2.
- No soporta *tool calling*, ni razonamiento multi-paso, ni capacidades de agente.
- No es un modelo multilingue en el sentido convencional: opera sobre el alfabeto de aminoacidos, no sobre lenguaje natural.
- No dispone de modo *thinking*, vision ni audio.

## Casos de uso

- Prediccion de residuos enmascarados en anticuerpos: dado un par cadena pesada/ligera con posiciones ocultas, el modelo estima los aminoacidos mas probables, util para analizar regiones variables y complementariedades en el diseno de anticuerpos.
- Filtrado de repertorios inmunitarios: las representaciones del modelo permiten puntuar secuencias de anticuerpos y priorizar candidatos en pipelines de descubrimiento, aprovechando que fue entrenado sobre 1,6M de secuencias emparejadas nativas.
- Clasificacion de especificidad de anticuerpos: mediante *fine-tuning* con `EsmForSequenceClassification` y pesos base congelados, se puede entrenar un clasificador para predecir la especificidad de un anticuerpo a partir de su secuencia.
- Clasificacion de pares pesada-ligera: el formato de entrada con doble `<cls>` esta disenado para modelar la interaccion entre cadenas, lo que permite tareas de prediccion de emparejamiento correcto.
- Base para modelos especializados: al estar disponible bajo MIT y en `transformers`, sirve como punto de partida para *fine-tuning* en tareas downstream de inmunologia computacional sin costes de licencia.
- Investigacion en leyes de escala: el checkpoint es una pieza del conjunto de 15 modelos del estudio, util para reproducir experimentos de escalado y comparar el efecto del tamano y los datos.
- Anotacion de secuencias en laboratorio: integrado en scripts de Python con `EsmTokenizer` y `EsmForMaskedLM`, permite analisis rapidos de secuencias en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al preprint en bioRxiv (doi:10.1101/2025.09.02.673765) para los resultados del estudio, pero no se incluyen cifras concretas en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 1,4 GB en safetensors (pesos en fp32), por lo que se requiere aproximadamente 1,5-2 GB de VRAM para cargar el modelo completo en fp32, mas memoria adicional para activaciones segun el tamano de lote.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar inferencia en fp32; se puede reducir con cuantizacion, aunque no se documentan formatos cuantizados para este modelo.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares con 4 GB o mas.
- Opciones de despliegue: `transformers` (libreria nativa), con soporte de `endpoints_compatible` segun los tags; no se documenta soporte explicito para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| brineylab/350M_full_checkpoint-500000 | 355,5M | 320 tokens | MIT | Hugging Face | ESM-2 especializado en anticuerpos emparejados |
| ESM-2 (650M) | 650M | no disponible | MIT (segun publicacion original) | Hugging Face | Modelo base general de proteinas, no especifico de anticuerpos |
| Otros AbLMs del estudio (8M-650M) | 8M-650M | 320 tokens | MIT | Coleccion AbLMs Scaling Laws | Variantes del mismo estudio con distinto tamano y escala de datos |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada para establecer diferencias cuantitativas con estos modelos.

## Limitaciones y advertencias

- Es un modelo especializado en secuencias de anticuerpos y proteinas; no es adecuado para generacion de texto en lenguaje natural ni tareas generales.
- La longitud de entrada esta limitada a 320 tokens durante el entrenamiento; secuencias mas largas se truncan, lo que puede perder informacion en cadenas extensas.
- Riesgo de alucinacion en el sentido de predicciones de aminoacidos plausibles pero biologicamente invalidas; los resultados deben validarse experimentalmente.
- No se documentan sesgos especificos, pero el modelo hereda los sesgos del dataset de 1,6M de secuencias emparejadas, cuya composicion no se detalla en la informacion disponible.
- La licencia MIT permite uso comercial, pero no se especifican restricciones adicionales sobre los datos de entrenamiento ni sobre las secuencias de anticuerpos utilizadas.
- No se documentan formatos cuantizados ni soporte para motores de inferencia de alto rendimiento, lo que puede limitar el despliegue en produccion a gran escala.
- El modelo es un checkpoint intermedio (paso 500.000) de un estudio de escalado; su rendimiento final puede no ser el optimo de la familia.

## Enlaces

- Hugging Face: https://huggingface.co/brineylab/350M_full_checkpoint-500000
- Preprint bioRxiv: https://doi.org/10.1101/2025.09.02.673765
- Paper ESM-2 (Science): https://www.science.org/doi/10.1126/science.ade2574
- Datasets en Zenodo: https://doi.org/10.5281/zenodo.16938681
- Codigo en GitHub: https://github.com/brineylab/AbLMs-scaling-laws
- Coleccion AbLMs Scaling Laws: https://huggingface.co/collections/brineylab/ablms-scaling-laws-6824e4beaabf4b16107cac4f
