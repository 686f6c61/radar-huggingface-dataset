# Mahendra99ar/trustlens-aspects

## Resumen

trustlens-aspects es un modelo de clasificacion de texto publicado en HuggingFace por el usuario Mahendra99ar, identificado en sus etiquetas como basado en BERT y exportado a ONNX para su ejecucion con Transformers.js. Forma parte del proyecto TrustLens, cuyo objetivo declarado es doble: detectar resenas de productos escritas por IA y resumir la opinion genuina de los usuarios desglosada por aspectos (por ejemplo, calidad, precio o envio).

El modelo esta pensado para inferencia en el navegador: el repositorio incluye una version cuantizada a INT8 (`onnx/model_quantized.onnx`), lo que permite ejecutarlo en cliente sin backend, con un peso de repositorio de 0,2 GB. Esto lo situa en la categoria de clasificadores ligeros orientados a despliegue edge, no en la de modelos generativos de gran tamano.

La relevancia actual del modelo es limitada y debe interpretarse con cautela: no tiene descargas ni likes registrados, no declara licencia ni idiomas soportados, y la model card no incluye los valores numericos de evaluacion, solo referencias a dos ficheros del repositorio (`metrics.json` y `export_report.json`) que no se han proporcionado en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (segun las etiquetas del repositorio; variante concreta no especificada); tarea de clasificacion de texto |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (fichero `onnx/model_quantized.onnx`); no se detallan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (exportacion para Transformers.js); no se indica presencia de safetensors ni GGUF |

## Arquitectura y entrenamiento

La informacion disponible indica que se trata de un modelo BERT empleado para clasificacion de texto y exportado a ONNX para su uso con Transformers.js, con al menos una variante cuantizada a INT8. El autor lo enmarca en el proyecto TrustLens, orientado a dos tareas: la deteccion de resenas de producto generadas por IA y la sintesis de opinion autentica por aspectos. No se especifica la variante exacta de BERT, el numero de parametros, la longitud de contexto ni si incorpora una cabeza de clasificacion multietiqueta o multiaspecto.

No hay datos en la informacion proporcionada sobre el corpus de entrenamiento: se desconoce el numero de tokens, la composicion del dataset, el idioma o idiomas de las resenas, si hubo anotacion humana de aspectos, y si se aplicaron tecnicas de ajuste como RLHF, DPO o destilacion. La model card unicamente remite a `metrics.json` y `export_report.json` para consultar los resultados de evaluacion, sin reproducir sus valores.

## Capacidades

- Clasificacion de texto aplicada a resenas de productos, segun el pipeline declarado (`text-classification`).
- Deteccion de resenas presuntamente generadas por IA, de acuerdo con la descripcion del proyecto TrustLens.
- Analisis de opinion por aspectos (aspect-based), orientado a resumir la opinion genuina de los usuarios.
- Inferencia en el navegador del cliente mediante Transformers.js sobre ONNX INT8, sin necesidad de servidor.
- Ejecucion en entornos con recursos limitados gracias a la cuantizacion INT8.
- No se ha documentado soporte de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni modo de razonamiento explicito (thinking mode).
- No se ha documentado el conjunto de idiomas soportados, por lo que las capacidades multilingues son no disponibles.

## Casos de uso

- Moderacion de marketplace: clasificar resenas entrantes en tiempo real para marcar aquellas con alta probabilidad de haber sido generadas por IA, reduciendo la carga de revision manual en plataformas de comercio electronico.
- Analitica de voz del cliente por aspectos: agregar la opinion de cientos de resenas y desglosar la percepcion por dimensiones (calidad del producto, envio, atencion), alimentando cuadros de mando de producto.
- Widget de navegador sin backend: al ejecutarse con Transformers.js sobre ONNX INT8, puede integrarse en una extension o pagina web que clasifique resenas en el propio dispositivo, evitando enviar texto del usuario a un servidor y reduciendo costes de infraestructura.
- Filtrado previo en pipelines de scraping: descartar resenas sinteticas antes de pasarlas a un analisis de sentimiento o a un modelo generativo de resumen, mejorando la calidad del corpus aguas abajo.
- Auditoria de reseñas en comercio electronico: ejecutar el clasificador sobre el catalogo historico para estimar que proporcion del contenido es automatizado y detectar picos anormales.
- Prototipado rapido en investigacion: usar el modelo cuantizado como linea base ligera en estudios sobre deteccion de texto generado, con la ventaja de poder reproducirse en un portatil o incluso en el navegador.
- Clasificacion por lotes en CPU: procesar volumenes moderados de resenas en servidores sin GPU, aprovechando el bajo coste computacional de una arquitectura tipo BERT cuantizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor remite a los ficheros `metrics.json` y `export_report.json` del propio repositorio para consultar los resultados de evaluacion, pero sus valores no se han facilitado, por lo que no se pueden reproducir cifras de exactitud, F1, precision o recall, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia, el repositorio completo ocupa 0,2 GB y el fichero desplegado es una exportacion ONNX cuantizada a INT8, por lo que la huella en memoria del modelo es muy inferior a la de un transformer de gran tamano.
- GPU recomendadas: no se requieren para el caso de uso declarado (navegador). Cualquier GPU consumer moderna (por ejemplo, gama RTX) es mas que suficiente si se opta por inferencia acelerada.
- GPU consumer: si, cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- CPU y navegador: es el escenario objetivo del modelo, mediante Transformers.js y WebAssembly/WebGPU en el cliente.
- Opciones de despliegue: Transformers.js (soporte nativo declarado), ONNX Runtime y, potencialmente, cualquier runtime compatible con ONNX. No se documenta soporte de vLLM, TGI, llama.cpp u Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Dependeran del dispositivo cliente, del runtime (WASM frente a WebGPU) y del tamano real del modelo, que no se especifica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Mahendra99ar/trustlens-aspects | no disponible (BERT segun etiquetas) | no disponible | Clasificacion de resenas y deteccion de texto IA | no disponible | ONNX (INT8) |
| distilbert-base-uncased-finetuned-sst-2-english | ~66 M | 512 tokens | Clasificacion de sentimiento (SST-2) | Apache-2.0 | safetensors |
| Clasificadores BERT/RoBERTa de resenas en HuggingFace | variable (tipicamente 110-125 M) | 512 tokens (habitual) | Sentimiento o clasificacion de resenas | variable segun autor | safetensors, ONNX |

Nota: no se dispone de resultados de benchmarks del modelo analizado, por lo que la comparacion se limita a aspectos estructurales y de licencia; no se puede establecer una comparacion de rendimiento con cifras. Los datos de los modelos alternativos corresponden a informacion publica general de sus respectivas fichas y deben verificarse en la fuente original antes de usarse.

## Limitaciones y advertencias

- No se declara licencia en el repositorio, lo que impide determinar si el uso comercial esta permitido. Cualquier uso en produccion requiere aclarar este punto con el autor.
- El modelo registra 0 descargas y 0 likes, y fue creado y actualizado en la misma fecha: no hay evidencia de validacion por parte de la comunidad ni de mantenimiento posterior.
- No se publican valores de evaluacion en la informacion disponible; se desconoce su precision real y su tasa de falsos positivos, algo critico en tareas de moderacion donde acusar erroneamente a un usuario tiene coste reputacional.
- No se especifican los idiomas soportados, por lo que su comportamiento en castellano o en resenas multilingues es desconocido.
- Riesgo de alucinacion: no aplica en sentido generativo, ya que es un clasificador; el riesgo equivalente es la clasificacion erronea o el sesgo en las etiquetas de salida.
- Sesgos conocidos: no disponibles. Al desconocerse el corpus de entrenamiento, no se puede evaluar el sesgo respecto a dominios, generos, tipos de producto o estilos de escritura.
- La deteccion de texto generado por IA es una tarea inherentemente fragil: los clasificadores de este tipo tienden a degradarse a medida que evolucionan los modelos generativos y suelen mostrar sesgos hacia textos no nativos o muy formateados.
- El modelo esta optimizado para navegador, no para alta concurrencia en servidor; si se necesita throughput elevado conviene evaluar un runtime ONNX en servidor con GPU.
- Longitud de contexto no documentada: resenas largas podrian truncarse, aunque no se especifica el limite real.

## Enlaces

- HuggingFace: https://huggingface.co/Mahendra99ar/trustlens-aspects
- Ficheros de evaluacion referenciados en la model card (dentro del repositorio): `metrics.json` y `export_report.json`
- Fichero de pesos cuantizado: `onnx/model_quantized.onnx`
- No se han encontrado en la busqueda web enlaces relevantes al modelo, al proyecto TrustLens ni a documentacion tecnica asociada; los resultados devueltos no guardan relacion con el modelo.
