# Drowsy-zZ/klue-bert-nsmc-finetuned

## Resumen

Drowsy-zZ/klue-bert-nsmc-finetuned es un modelo de clasificacion de texto publicado en Hugging Face por el usuario Drowsy-zZ. Segun el recuento real de pesos en safetensors, contiene 110.618.882 parametros, lo que lo situa en la categoria de los encoders tipo BERT-base, con una cabeza de clasificacion para la tarea de text-classification. El repositorio ocupa 0,4 GB y esta etiquetado con las tags transformers, safetensors, bert, text-classification, text-embeddings-inference y endpoints_compatible.

El identificador del repositorio sugiere que el modelo parte de klue/bert-base y se ha ajustado sobre NSMC (Naver Sentiment Movie Corpus), un corpus de resenas de peliculas en coreano con etiquetas binarias de sentimiento. Sin embargo, la model card es la plantilla autogenerada por Hugging Face y no confirma ni el modelo base, ni el dataset, ni el procedimiento de ajuste, ni el numero de etiquetas de salida. Cualquier afirmacion sobre estos puntos en esta ficha se marca explicitamente como inferencia.

Su relevancia practica es limitada y muy acotada: se trata de un clasificador pequeno, de coste de inferencia minimo, util como componente de sentimiento en coreano dentro de pipelines mayores (analitica de resenas, moderacion, preetiquetado de datos). No es un modelo generativo ni compite con los LLM actuales; su interes esta en el coste y la latencia, no en la capacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer bidireccional), inferido de la tag `bert`; no confirmado en la model card |
| Parametros totales | 110.618.882 (recuento real de safetensors, incluye cabeza de clasificacion) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el BERT original admite 512 tokens; no hay confirmacion para este ajuste) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32); convertible a fp16/int8/ONNX con herramientas externas |
| Idiomas soportados | no disponible (el nombre apunta a NSMC, corpus en coreano, por lo que cabe esperar coreano) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,4 GB |
| Pipeline declarado | text-classification |
| Numero de etiquetas | no disponible |
| Descargas / likes | 16 descargas, 0 likes |
| Fecha de creacion / actualizacion | 2026-09-17 (ambas) |

## Arquitectura y entrenamiento

La unica evidencia sobre la arquitectura son la tag `bert` y el recuento de parametros (110,6 M), compatibles con un BERT-base (tipicamente 12 capas, 768 de dimension oculta y 12 cabezas de atencion) mas una cabeza lineal de clasificacion. La model card no documenta la configuracion, el numero de etiquetas, la funcion de perdida ni el regimen de precision (fp32, fp16 o bf16 mezclada).

Tampoco hay informacion sobre datos ni procedimiento de entrenamiento. Por el identificador se infiere un ajuste supervisado sobre NSMC, un corpus de 200.000 resenas de cine en coreano (150.000 de entrenamiento y 50.000 de test) con polaridad positiva/negativa, pero esto no esta confirmado. No se trata de un modelo generativo, por lo que no hay RLHF, DPO ni decodificacion especulativa implicados. La referencia `arxiv:1910.09700` de las tags corresponde al articulo de Lacoste et al. sobre estimacion de emisiones de carbono, citado en la plantilla por defecto de Hugging Face, y no a un paper sobre este modelo.

## Capacidades

- Clasificacion de texto: la tarea declarada es `text-classification`; con el nombre del repositorio, lo esperable es clasificacion binaria de sentimiento (positivo/negativo).
- Extraccion de representaciones: la tag `text-embeddings-inference` indica que el modelo puede servirse como encoder para generar embeddings de frases mediante pooling, si la configuracion lo permite.
- Textos cortos: adecuado para resenas, titulos, comentarios y frases breves; el BERT estandar trunca a 512 tokens, valor no confirmado aqui.
- Idiomas: no disponible; previsiblemente coreano, sin confirmacion.
- Tool calling / function calling: no soportado (no es un modelo generativo ni instruct).
- Agentes y razonamiento multi-paso: no soportado.
- Vision, audio, thinking mode: no soportado.
- Generacion de texto, codigo o matematicas: no soportado.

## Casos de uso

- Analitica de resenas de cine o series en coreano: clasificar cada resena como positiva o negativa para calcular puntuaciones agregadas por titulo, con coste de inferencia muy bajo por documento.
- Monitorizacion de marca en redes sociales: puntuar automaticamente menciones y comentarios en coreano para detectar picos de sentimiento negativo y activar alertas.
- Triaje de resenas en tiendas de aplicaciones: etiquetar comentarios de usuarios de apps coreanas y enrutar los negativos a soporte o a producto.
- Preetiquetado de datasets: usar el modelo como anotador inicial sobre corpus no etiquetados y reservar la revision humana para los casos de baja confianza, reduciendo el coste de anotacion.
- Moderacion de comentarios: senalar contenido con tono marcadamente negativo como primer filtro antes de una revision humana o de un modelo mayor.
- Investigacion academica en PLN coreano: servir de linea base reproducible y ligera para comparar con otros clasificadores de sentimiento en NSMC.
- Clasificacion por lotes en CPU: al ser un modelo de 110 M de parametros, permite procesar grandes volumenes sin GPU en pipelines nocturnos.

En todos los casos, el uso en produccion exige verificar antes la licencia y validar el rendimiento real sobre el dominio concreto, dado que no hay evaluacion publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion con datos, y la busqueda web no aporto ningun resultado relevante sobre el modelo.

## Requisitos de hardware

- VRAM estimada para los pesos: en fp32 alrededor de 0,45 GB; en fp16 alrededor de 0,22 GB; en int8 alrededor de 0,11 GB. A ello hay que sumar activaciones y memoria del runtime, en general poco significativa para secuencias cortas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente (GTX 1050 Ti, GTX 1650, RTX 3050, T4). No requiere A100 ni H100.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas de los ultimos diez anos, e incluso en iGPU con memoria compartida para lotes pequenos.
- CPU: viable como opcion principal; con 110 M de parametros y secuencias cortas, la inferencia en CPU es perfectamente practica para lotes moderados.
- Opciones de despliegue: pipeline de transformers, Text Embeddings Inference (tag del repositorio), exportacion a ONNX Runtime o TorchScript, y servicio propio con FastAPI. vLLM no esta pensado para este tipo de encoder de clasificacion y su compatibilidad no esta confirmada.
- Latencia y throughput: no disponibles como dato medido. Como estimacion orientativa por tamano, milisegundos por secuencia en GPU y decenas de milisegundos por secuencia en CPU, muy dependiente del hardware y del lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea / idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Drowsy-zZ/klue-bert-nsmc-finetuned | 110,6 M | no disponible (BERT estandar: 512) | Clasificacion de sentimiento, previsiblemente coreano | no disponible | Hugging Face, safetensors |
| klue/bert-base | ~110 M (BERT-base) | 512 tokens | Encoder base para coreano, sin cabeza de tarea | no verificada en esta busqueda | Hugging Face |
| KcBERT-base | ~110 M (BERT-base con vocabulario coreano) | 512 tokens | Encoder base entrenado con texto coreano de internet | no verificada en esta busqueda | Hugging Face |
| KoELECTRA-base | ~110 M | 512 tokens | Encoder base con arquitectura ELECTRA para coreano | no verificada en esta busqueda | Hugging Face |

No hay datos de rendimiento comparado disponibles para este modelo, por lo que la comparacion se limita a tamano, contexto, idioma y disponibilidad. Las cifras de los modelos alternativos corresponden a sus arquitecturas de referencia y no se han contrastado en la busqueda realizada.

## Limitaciones y advertencias

- Licencia no disponible: no se puede asumir uso comercial. Es imprescindible contactar con el autor o localizar el modelo base y su licencia antes de cualquier despliegue productivo.
- Model card vacia: todos los campos relevantes (datos, hiperparametros, evaluacion, sesgos) figuran como "[More Information Needed]".
- Sin evaluacion publicada: no hay ninguna metrica verificable de exactitud, F1 ni calibracion.
- Modelo discriminativo: no genera texto, por lo que el riesgo de alucinacion en el sentido generativo no aplica. El riesgo equivalente es la clasificacion errónea con alta confianza.
- Sesgo de dominio: si el ajuste se hizo sobre NSMC, el modelo esta especializado en resenas de cine y su rendimiento caera en otros dominios (tecnico, legal, redes sociales).
- Cobertura idiomatica incierta: no hay confirmacion de que el modelo maneje coreano correctamente ni de como reacciona ante texto en otros idiomas; probablemente produzca etiquetas sin sentido fuera de su distribucion.
- Longitud de entrada no documentada: no se sabe si hubo truncado a 512 tokens ni con que estrategia.
- Posible desequilibrio de clases y sensibilidad a sarcasmo, ironia y negaciones, tipicos de la clasificacion de sentimiento.
- Metadatos anomalos: las fechas de creacion y actualizacion son identicas (2026-09-17) y no consta informacion del autor mas alla del nombre de usuario.
- Repositorio con 16 descargas y 0 likes: sin validacion por parte de la comunidad.
- La busqueda web realizada no devolvio ningun resultado relacionado con el modelo; la documentacion externa es inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Drowsy-zZ/klue-bert-nsmc-finetuned
- Paper citado en las tags (Lacoste et al., 2019, estimacion de emisiones de carbono, referenciado por la plantilla de Hugging Face, no por el modelo): https://arxiv.org/abs/1910.09700
- Documentacion de la calculadora de impacto usada en la plantilla: https://mlco2.github.io/impact#compute

No se encontraron otros enlaces relevantes en la busqueda web: los resultados devueltos correspondian a controladores de impresoras y no guardaban ninguna relacion con el modelo.
