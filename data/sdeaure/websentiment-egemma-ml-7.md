# SDeaure/websentiment-egemma-ml-7

## Resumen

WebSentiment EmbeddingGemma ML-7 es un clasificador de sentimiento de siete niveles (de -3, muy negativo, a +3, muy positivo) para texto web en ingles, frances, espanol, aleman, italiano y portugues. Lo publica el usuario SDeaure y se construye como una sonda lineal (regresion logistica multinomial) sobre los embeddings congelados de google/embeddinggemma-300m. El encoder no se modifica: la cabeza es un unico fichero JSON de 119 KB con 7 x 768 pesos, 7 sesgos y un vector de medias.

El modelo resuelve un problema concreto de analisis de opinion en paginas web y entornos SEO: asignar una polaridad graduada, no binaria, a fragmentos de texto, manteniendo la posibilidad de reutilizar los mismos embeddings para busqueda y clustering. Al mantener el encoder congelado, el coste de inferencia se limita al de EmbeddingGemma-300m y la cabeza puede ejecutarse en el navegador mediante transformers.js.

Es relevante ahora porque demuestra un patron de bajo coste (sonda lineal sobre embeddings de proposito general) para tareas de clasificacion multilingue, con artefactos ligeros, licencia permisiva CC-BY-4.0 y despliegue tanto en Python como en JavaScript. No es un modelo generativo: es un cabezal de clasificacion acoplado a un encoder de 300 millones de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sonda lineal (regresion logistica multinomial) sobre embeddings congelados de google/embeddinggemma-300m |
| Parametros totales | 300M en el encoder (congelado) + 5.383 en la cabeza (7 x 768 pesos, 7 sesgos, 1 vector de medias) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Maximo 256 tokens por texto (recorte aplicado en la receta de encoding) |
| Tipos de cuantizacion | El encoder puede cuantizarse (en transformers.js se usa dtype q8); la cabeza es JSON en coma flotante |
| Idiomas soportados | Ingles, frances, espanol, aleman, italiano, portugues |
| Licencia | CC-BY-4.0 |
| Formato de pesos | head.json y head-noprefix.json (JSON); encoder en safetensors y ONNX (via onnx-community/embeddinggemma-300m-ONNX) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline en dos etapas. Primero, un encoder transformer (EmbeddingGemma-300m) genera embeddings de 768 dimensiones, L2-normalizados y sin truncamiento Matryoshka, a partir de textos de como maximo 256 tokens. Despues, una regresion logistica multinomial de 7 clases opera sobre esos embeddings centrados. La cabeza se entrena sobre embeddings congelados: el encoder no recibe ajuste fino, lo que reduce el coste de entrenamiento a la estimacion de 5.383 parametros.

La receta de encoding es parte del contrato del modelo: se antepone el prefijo `task: classification | query: ` a cada texto (equivalente a `prompt_name="Classification"` en sentence-transformers), se trunca a 256 tokens, se normaliza en L2 y no se aplica truncamiento Matryoshka. El modelo ofrece dos cabezas: head.json, que espera embeddings con ese prefijo, y head-noprefix.json, para embeddings sin prefijo. Mezclarlas degrada el macro-F1 entre 3 y 10 puntos. Antes de la cabeza se aplica centrado, bien con la media del propio corpus (`center="corpus"`, recomendado para lotes de cientos de textos o mas y para texto no web) o con la media de entrenamiento incluida en el fichero (`center="reference"`, para textos sueltos o lotes pequenos). El dataset de entrenamiento es SDeaure/websentiment-ml-7; no se detalla en la informacion disponible su composicion, numero de tokens ni si hubo tecnicas de RLHF o DPO.

## Capacidades

- Clasificacion de sentimiento en 7 niveles discretos (-3 a +3) con probabilidad por nivel.
- Salida `expected`: media ponderada por probabilidad, de -3 a +3, util para ranking y promediado.
- Salida `label` en 3 clases (negativo, neutro, positivo) por masa de probabilidad, sin umbral ajustado.
- Multilingue en seis idiomas: ingles, frances, espanol, aleman, italiano y portugues.
- Reutilizacion de los mismos embeddings para busqueda, clustering y sentimiento simultaneamente.
- Ejecucion en navegador o Node mediante transformers.js con encoder ONNX cuantizado a q8.
- Dos cabezas intercambiables segun se controle o no el prefijo de encoding.
- Modo de centrado configurable (corpus o referencia) para adaptar el sesgo del lote.

## Casos de uso

- Analisis de opinion en resenas de producto: procesar lotes de cientos de resenas por idioma con `center="corpus"` y ordenar por la puntuacion `expected` para priorizar las mas negativas en atencion al cliente.
- Monitorizacion de reputacion en foros y redes: clasificar menciones en seis idiomas con una sola cabeza y agregar la media ponderada por volumen para detectar cambios de tendencia.
- SEO y analisis de contenido web: puntuar fragmentos de paginas y comparar la polaridad de titulares, meta descripciones y cuerpo, reutilizando los mismos embeddings para busqueda semantica interna.
- Moderacion de comentarios: usar la etiqueta de 3 clases como primera capa de filtrado de contenido muy negativo (-3) y derivar el resto a revision humana.
- Enriquecimiento de un indice de busqueda: almacenar el embedding una sola vez y derivar tanto la similitud como el sentimiento, evitando duplicar inferencia.
- Analisis de encuestas abiertas: aplicar el modelo a respuestas cortas en varios idiomas y agregar la puntuacion `expected` por segmento de respondent.
- Clasificacion en el navegador: integracion con transformers.js para puntuar texto en cliente sin enviar datos a un servidor, con encoder ONNX q8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona variaciones de macro-F1 asociadas al uso del prefijo y al tipo de centrado (perdida de 3 a 10 puntos al mezclar cabezas; 3 puntos al usar centrado de referencia en textos cortos de benchmark), pero no incluye la tabla de resultados ni cifras absolutas.

## Requisitos de hardware

- VRAM estimada para inferencia: el encoder de 300M en fp16 ocupa aproximadamente 0,6 GB de pesos; en q8, alrededor de 0,3 GB. La cabeza anade unos pocos kilobytes.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM libre puede ejecutar el encoder en fp16; una RTX 3060, RTX 4060 o superior ofrece margen holgado. Para lotes grandes, A100 o H100 mejoran el throughput.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada reciente, e incluso en CPU para lotes moderados.
- Opciones de despliegue: sentence-transformers (Python), transformers.js con ONNX (navegador y Node), y cualquier runtime que permita ejecutar el encoder y aplicar la cabeza en JSON.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WebSentiment EmbeddingGemma ML-7 | 300M (encoder) + 5.383 (cabeza) | 256 tokens | Sonda lineal sobre embeddings | CC-BY-4.0 | HuggingFace |
| google/embeddinggemma-300m | 300M | No disponible en la informacion | Encoder de embeddings | No disponible en la informacion | HuggingFace (gated) |
| Modelos de sentimiento multilingue genericos | No disponible | No disponible | Clasificadores especificos | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El encoder esta congelado: la calidad depende por completo de EmbeddingGemma-300m y no se corrige con el entrenamiento de la cabeza.
- Mezclar head.json y head-noprefix.json con el tipo de embedding equivocado degrada el macro-F1 entre 3 y 10 puntos.
- El truncamiento a 256 tokens limita el analisis de documentos largos; los fragmentos deben segmentarse previamente.
- El centrado por referencia en textos cortos de benchmark desplaza la frontera del neutro y cuesta 3 puntos de macro-F1, aunque el ranking (Spearman) se mantiene.
- El modelo no genera texto: no sirve para resumen, extraccion ni razonamiento; solo clasifica polaridad.
- Riesgo de alucinacion no aplica como tal, pero si de calibracion: las probabilidades de una regresion logistica sobre embeddings pueden sobreconfiar en dominios alejados del entrenamiento.
- No se documentan sesgos especificos ni la composicion del dataset de entrenamiento, lo que dificulta evaluar su cobertura cultural y linguistica.
- La licencia CC-BY-4.0 permite uso comercial con atribucion; conviene verificar los terminos del encoder base (EmbeddingGemma es gated y requiere aceptar sus condiciones).
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, sin validacion externa conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SDeaure/websentiment-egemma-ml-7
- Variante con contexto de pagina: https://huggingface.co/SDeaure/websentiment-egemma-ml-7-ctx
- Encoder base: https://huggingface.co/google/embeddinggemma-300m
- Encoder ONNX para transformers.js: https://huggingface.co/onnx-community/embeddinggemma-300m-ONNX
- Dataset de entrenamiento: https://huggingface.co/datasets/SDeaure/websentiment-ml-7
