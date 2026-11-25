# abhishekrawal/distilbert-welfake-fake-news

## Resumen

DistilBERT fine-tuned on WELFake es un clasificador binario de noticias (real frente a falsa) desarrollado por el usuario de Hugging Face abhishekrawal. Parte del checkpoint `distilbert-base-uncased` y se ha ajustado sobre el corpus WELFake, un conjunto de articulos periodisticos estadounidenses de tematica politica publicados mayoritariamente entre 2016 y 2017. El resultado se ha exportado a ONNX y cuantizado dinamicamente a int8, lo que reduce el peso del repositorio a unos 0,1 GB y permite su ejecucion en el navegador mediante transformers.js.

El modelo resuelve una tarea muy acotada: dada una noticia compuesta por titular y cuerpo, devuelve una etiqueta binaria (0 = REAL, 1 = FAKE). No realiza verificacion de hechos ni consulta fuentes externas; lo que aprende es a discriminar el estilo de escritura y las marcas editoriales asociadas a cada clase en el corpus de entrenamiento. Su relevancia practica esta en el despliegue ligero: al estar en formato ONNX int8 y empaquetado para transformers.js, puede integrarse en aplicaciones web sin backend de GPU.

La ficha se basa exclusivamente en la model card publicada por el autor. No hay informacion sobre licencia, idiomas declarados ni datos de benchmarks frente a otros modelos, por lo que esos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilacion de BERT-base) |
| Parametros totales | no disponible en la model card (DistilBERT-base tiene aproximadamente 66 millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens (longitud maxima usada en el fine-tuning) |
| Tipos de cuantizacion | int8 dinamica sobre ONNX (pesos exportados en ONNX; no se mencionan GGUF ni otras) |
| Idiomas soportados | no disponible (el modelo base es `distilbert-base-uncased`, entrenado principalmente en ingles) |
| Licencia | no disponible |
| Formato de pesos | ONNX (int8), pensado para transformers.js |

## Arquitectura y entrenamiento

El modelo es un encoder Transformer de tipo DistilBERT, la version destilada de BERT-base con la mitad de capas que el original. Sobre ese checkpoint se realizo un fine-tuning de clasificacion binaria con los siguientes hiperparametros declarados: longitud maxima de 256 tokens, optimizador AdamW con learning rate 2e-5, weight decay 0.01, 2 epocas y batch de 16.

El corpus de entrenamiento es WELFake, en su version deduplicada, con 50.616 articulos de entrenamiento y un split de test de 6.328 articulos. Antes de tokenizar se aplico un preprocesado especifico: concatenacion de titular y cuerpo con el separador `" . "`, y eliminacion de datelines de Reuters, etiquetas `(Reuters)`, lineas de credito del tipo `(Reporting by ...)` y URLs. Tras el entrenamiento, el modelo se exporto a ONNX y se cuantizo dinamicamente a int8. No se menciona uso de RLHF, DPO ni tecnicas de decodificacion especulativa, algo esperable en un clasificador.

## Capacidades

- Clasificacion binaria de texto: devuelve la etiqueta REAL (0) o FAKE (1) para una noticia compuesta por titular y cuerpo.
- Procesamiento de entradas de hasta 256 tokens; el texto mas largo se trunca.
- Inferencia en el navegador o en Node.js mediante transformers.js y el runtime ONNX.
- Ejecucion en CPU: la cuantizacion int8 y el tamano reducido del modelo permiten inferencia sin GPU.
- Capacidad multilingue: no disponible; el modelo base es uncased en ingles y el corpus es estadounidense.
- Tool calling, function calling, agentes y razonamiento multi-paso: no soportados (es un clasificador, no un modelo generativo).
- Vision, audio y modo thinking: no soportados.

## Casos de uso

- Moderacion de contenidos en plataformas de noticias: filtro previo que marca articulos sospechosos de estilo sensacionalista o de agencia falsa antes de la revision humana, con un coste de inferencia muy bajo al ejecutarse en CPU o en el navegador.
- Extension de navegador para etiquetar noticias: al estar empaquetado para transformers.js con pesos ONNX int8, puede correr del lado del cliente y mostrar un aviso al usuario sin enviar el texto a un servidor.
- Triaje en redacciones y fact-checkers: clasificacion automatica de grandes volumenes de articulos para priorizar la verificacion manual, usando la probabilidad de la clase FAKE como criterio de ordenacion.
- Investigacion sobre desinformacion: analisis de corpus historicos de noticias estadounidenses de 2016-2017 para estudiar patrones de estilo y procedencia editorial, siempre con la cautela de que el modelo aprende marcas de publicador.
- Deteccion de contenido agregado o sindicado: el modelo reacciona a frases especificas de fuente ("featured image", "via Getty"), por lo que puede usarse como senal complementaria para identificar articulos copiados o generados por agregadores.
- Pipeline de preprocesado en sistemas de analisis de medios: primera etapa de un pipeline mas amplio que combine este clasificador con verificacion de fuentes y busqueda de hechos, aportando una senal de estilo rapida y barata.
- Demostraciones educativas: ejemplo de fine-tuning de DistilBERT y de exportacion a ONNX int8 para cursos y talleres sobre NLP aplicado.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son los del split de test de WELFake (6.328 articulos):

| Version | Accuracy | Precision | Recall | F1 |
|---|---|---|---|---|
| PyTorch fp32 | 0.9926 | 0.9937 | 0.9899 | 0.9918 |
| ONNX int8 (este modelo) | 0.9926 | 0.9940 | 0.9895 | 0.9918 |

No se han publicado resultados frente a otros modelos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y esos benchmarks no aplican a un clasificador binario de este tipo.

## Requisitos de hardware

- VRAM estimada: no requiere GPU. El repositorio completo ocupa 0,1 GB y los pesos int8 son del orden de decenas de megabytes.
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente. En caso de querer aceleracion, una GPU consumer basica (por ejemplo, una GTX 1650 o superior) basta sobradamente.
- Cabe en cualquier GPU consumer y en la mayoria de dispositivos moviles y navegadores modernos.
- Opciones de despliegue: transformers.js (objetivo principal del autor), ONNX Runtime (CPU o WebGPU), y conversion a otros formatos si se necesita (no se proporcionan pesos PyTorch ni GGUF en el repositorio).
- Latencia y throughput: no disponibles en la model card. Por el tamano del modelo y la cuantizacion int8, se espera inferencia en el orden de milisegundos por muestra en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la informacion proporcionada. Como referencia estructural, se puede situar frente a alternativas genericas de la misma familia:

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|
| abhishekrawal/distilbert-welfake-fake-news | ~66 M (DistilBERT) | 256 tokens | ONNX int8 | no disponible | Clasificador binario REAL/FAKE sobre WELFake |
| distilbert-base-uncased | ~66 M | 512 tokens | safetensors | Apache 2.0 | Modelo base sin fine-tuning; no clasifica noticias |
| bert-base-uncased | ~110 M | 512 tokens | safetensors | Apache 2.0 | Mayor capacidad, mayor coste; requeriria fine-tuning propio |
| Modelos de deteccion de fake news en Hugging Face | variable | variable | variable | variable | No se dispone de comparacion cuantitativa en la informacion disponible |

## Limitaciones y advertencias

- El modelo juzga el estilo de escritura, no verifica hechos. No debe usarse como unico criterio para determinar la veracidad de una noticia.
- WELFake esta compuesto mayoritariamente por noticias politicas estadounidenses de 2016-2017. El rendimiento puede degradarse en otros dominios, idiomas o epocas.
- Parte de la precision observada refleja frases especificas de publicador ("featured image", "via Getty"), por lo que el modelo puede estar aprendiendo sesgos de estilo editorial en lugar de senales de falsedad.
- Riesgo de alucinacion: no aplica en sentido generativo, pero si existe riesgo de falsos positivos y falsos negativos por dominio y por estilo.
- Longitud de contexto limitada a 256 tokens: los articulos largos se truncan y la senal de la parte final del texto se pierde.
- Licencia no especificada en la model card: antes de un uso comercial es necesario contactar con el autor o verificar los terminos del modelo base (`distilbert-base-uncased`, Apache 2.0).
- Sin datos de idiomas declarados; el modelo base es uncased en ingles, por lo que el uso en castellano no esta validado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni de validacion independiente.
- Solo se distribuyen pesos ONNX int8; no hay checkpoint PyTorch ni GGUF en el repositorio, lo que limita la integracion con algunos stacks.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abhishekrawal/distilbert-welfake-fake-news
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Libreria transformers.js: https://github.com/huggingface/transformers.js
- ONNX Runtime: https://onnxruntime.ai/
- Paper de DistilBERT: https://arxiv.org/abs/1910.01108
- No se han encontrado en la informacion proporcionada enlaces al paper de WELFake, blogs del autor, repos de codigo ni demos adicionales.
