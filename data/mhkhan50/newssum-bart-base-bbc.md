# MHkhan50/newssum-bart-base-bbc

## Resumen

NewsSum V2 es un checkpoint de BART-base afinado para resumen extractivo de noticias sobre el conjunto de datos BBC News Summary. Lo publica Muzammal Hussain (usuario MHkhan50) como parte de un estudio comparativo sin fuga de datos que enfrenta líneas base extractivas, transformers afinados y un modelo de lenguaje pequeno. El modelo parte de facebook/bart-base, un transformer encoder-decoder de 139,47 millones de parametros, y se distribuye con licencia Apache 2.0.

El modelo resuelve una tarea muy acotada: dada una noticia de la BBC de 2004-2005, seleccionar y copiar oraciones en el estilo de la casa para producir un resumen de aproximadamente 136 palabras. No es un resumidor abstractivo generalista; las referencias del conjunto de datos son en un 94,8 % oraciones copiadas literalmente del articulo, de modo que el modelo ha aprendido a extractar, no a parafrasear. La longitud de entrada admitida es de 1.024 tokens y la de salida de 320.

Su relevancia actual es metodologica mas que de producto: el paper asociado demuestra que una linea base TextRank sin entrenamiento (82,9 ROUGE-Lsum) supera a este BART afinado (67,8 ± 1,3 ROUGE-Lsum en tres semillas), lo que lo convierte en un caso de estudio util sobre como las referencias extractivas inflan o distorsionan la evaluacion de modelos generativos. Incluye una copia ONNX cuantizada que ejecuta en navegador con Transformers.js.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (BART), 6 capas de encoder y 6 de decoder |
| Parametros totales | 139.470.681 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens de entrada; 320 tokens de salida |
| Tipos de cuantizacion | fp16 (pesos publicados), ONNX cuantizado q8 para navegador |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

BART-base es un transformer encoder-decoder con 6 capas en cada torre, preentrenado por Facebook con un objetivo de denoising (corrupcion de texto y reconstruccion). El checkpoint se afino completamente con AdamW, learning rate 5e-5, batch de 8, schedule lineal con 5 % de warm-up, autocast fp16 sobre una NVIDIA T4 y early stopping sobre la perdida de validacion (8 epocas, mejor en la 6). No se menciona RLHF ni DPO; es un ajuste supervisado clasico sobre pares articulo-resumen.

Los datos proceden del dataset BBC News Summary (articulos de 2004 y 2005, cinco tematicas, un resumen por articulo). Se eliminaron 154 articulos casi duplicados de los 2.225 originales y se aplico un split fijo 70/15/15 estratificado por tematica: 1.449 de entrenamiento, 311 de validacion y 311 de test. Las cabeceras se retiraron de la entrada. La innovacion tecnica destacable no esta en el modelo sino en la metodologia del estudio: control de fuga de datos, publicacion del split y comparacion explicita contra una linea base extractiva con longitud equiparada.

## Capacidades

- Generacion de resumenes extractivos de noticias en ingles, con un objetivo de longitud de unas 136 palabras.
- Seleccion y copia de oraciones en estilo redaccional BBC, no parafrasis abstractiva.
- Generacion condicionada a texto largo de hasta 1.024 tokens de entrada.
- Decodificacion con beam search configurable (el ejemplo de uso emplea num_beams=4 y no_repeat_ngram_size=3).
- Ejecucion en navegador mediante Transformers.js con pesos ONNX cuantizados a q8.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito.
- Soporte multilingue limitado al ingles.

## Casos de uso

- Resumen de noticias en ingles para boletines internos: el modelo recibe un articulo de hasta 1.024 tokens y devuelve un resumen de unas 136 palabras en estilo BBC, util para equipos de monitorizacion de prensa que trabajan con fuentes britanicas.
- Linea base en investigacion sobre resumen: sirve como referencia afinada frente a metodos extractivos (TextRank) o LLM pequenos en experimentos academicos, gracias a que el split esta publicado y es reproducible.
- Demostracion educativa de resumen en navegador: la copia ONNX q8 permite desplegar un resumen funcional en una pagina web sin backend, con Transformers.js.
- Prototipado rapido de pipelines de sumarizacion: al ser un BART-base de 139 M de parametros, cabe en una sola GPU consumer y permite iterar sobre preprocesado y decodificacion sin coste elevado.
- Generacion de resumenes de referencia para anotacion: util para producir borradores extractivos que un humano revise antes de publicar.
- Evaluacion de sesgos de evaluacion: permite reproducir el hallazgo del paper sobre como las referencias extractivas favorecen a metodos de copia y penalizan a generadores abstractivos.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre los 311 articulos de test de este checkpoint:

| Metrica | Valor |
|---|---|
| ROUGE-1 | 69,3 |
| ROUGE-2 | 59,7 |
| ROUGE-L | 48,4 |
| ROUGE-Lsum | 68,4 |
| BERTScore | 55,1 |
| Longitud media (palabras) | 136 |

Media de ROUGE-Lsum en tres semillas de entrenamiento: 67,8 ± 1,3. Comparacion con la linea base extractiva del estudio (TextRank con longitud equiparada): 82,9 ROUGE-Lsum. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Inferencia en fp16: aproximadamente 0,3 GB de VRAM para los pesos, mas overhead de activaciones; cabe holgadamente en cualquier GPU consumer con 4 GB o mas.
- GPU recomendadas: NVIDIA T4 (la usada en entrenamiento), RTX 3060, RTX 4090, A100 o H100; el modelo es lo bastante pequeno para que la latencia venga dominada por la longitud de entrada y el beam search.
- Cabe en CPU para uso ocasional y en navegador con la variante ONNX q8.
- Opciones de despliegue: transformers pipeline, vLLM (soporte de BART), TGI, llama.cpp no aplica (no hay GGUF publicado), ONNX Runtime y Transformers.js.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MHkhan50/newssum-bart-base-bbc | 139 M | 1.024 entrada / 320 salida | Resumen extractivo afinado en BBC | Apache 2.0 | Hugging Face, ONNX |
| facebook/bart-base | 139 M | 1.024 | Preentrenamiento denoising, sin afinar para resumen | MIT | Hugging Face |
| TextRank (linea base del paper) | no aplica | no aplica | Extractivo sin entrenamiento | no aplica | Implementacion propia |
| BART afinado en CNN/DailyMail (referencia del articulo de Medium) | 139 M | 1.024 | Resumen abstractivo | no disponible | No disponible como checkpoint concreto |

La comparacion relevante es contra TextRank, que en el propio estudio supera a este modelo (82,9 frente a 67,8 ROUGE-Lsum), y contra el BART-base original, que sin afinar no produce resumenes de calidad. No se dispone de datos de benchmarks frente a otros resumidores afinados en BBC en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado solo con unas 1.450 noticias de la BBC de 2004 y 2005; el estilo y las tematicas son muy estrechos y no generalizan a prensa actual ni a otros dominios.
- Las metricas son ROUGE y BERTScore contra una unica referencia extractiva por articulo; no miden exactitud factual y no se realizo evaluacion humana.
- El propio autor advierte que una linea base TextRank sin entrenamiento obtiene mejores resultados en este dataset, lo que cuestiona el valor del checkpoint como resumidor de proposito general.
- Riesgo de alucinacion bajo en la practica porque tiende a copiar oraciones, pero puede producir resumenes incoherentes o truncados si la entrada excede 1.024 tokens o si el articulo se aleja del estilo BBC.
- Solo ingles; no soporta otros idiomas.
- Los articulos de la BBC estan protegidos por copyright; el modelo se declara para investigacion y educacion, lo que limita el uso comercial aunque la licencia del checkpoint sea Apache 2.0.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni de mantenimiento posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MHkhan50/newssum-bart-base-bbc
- Repositorio del estudio: https://github.com/MHKhan50/NewsSum-Bench
- Split de datos: https://github.com/MHKhan50/NewsSum-Bench/blob/main/results/splits.csv
- Paper (Zenodo): https://doi.org/10.5281/zenodo.24046039
- Demo Space: https://huggingface.co/spaces/MHkhan50/newssum-demo
- Dataset BBC News Summary: https://www.kaggle.com/datasets/pariza/bbc-news-summary
- Modelo base: https://huggingface.co/facebook/bart-base
- Articulo de referencia sobre BART y CNN/DailyMail: https://medium.com/@f223595/building-a-fine-tuned-bart-news-summarizer-a-practical-walkthrough-d302591759f0
- Proyecto relacionado en GitHub: https://github.com/mini12347/Study_Hub
