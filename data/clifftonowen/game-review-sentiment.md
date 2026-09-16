# Clifftonowen/game-review-sentiment

## Resumen

Game-review-sentiment es un clasificador binario de sentimiento (etiquetas `negative` = 0 y `positive` = 1) especializado en resenas de videojuegos. Lo publica el usuario Clifftonowen y parte de `distilbert-base-uncased`, un transformer encoder de 6 capas y unos 66 millones de parametros entrenado por destilacion de conocimiento a partir de BERT-base. El modelo se ha ajustado sobre aproximadamente 4,2 millones de resenas de Steam, por lo que su dominio de aplicacion es deliberadamente estrecho: el registro linguistico de las resenas de Steam, en ingles.

La relevancia practica del modelo no esta en su tamano, sino en su formato de despliegue. El checkpoint se exporto a ONNX y se cuantizo dinamicamente a int8, reduciendo el peso de 268 MB en fp32 a 67 MB, y se publica con la libreria transformers.js para inferencia directamente en el navegador. La model card indica que la cuantizacion no degrada la metrica principal: tanto la version fp32 como la int8 obtienen 87,3% de exactitud en una muestra balanceada de 300 positivas y 300 negativas.

Es, por tanto, una pieza de infraestructura ligera para analitica de resenas a pie de cliente (extension de navegador, panel de comunidad, prototipos sin backend) antes que un modelo de proposito general. El repo tiene 0 descargas y 0 likes en el momento de la consulta, y su licencia es MIT, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo DistilBERT (destilado de BERT-base), 6 capas, 768 de dimension oculta, 12 cabezas de atencion |
| Parametros totales | Aproximadamente 66-67 millones (268 MB en fp32 en el checkpoint de origen) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (maximo posicional de DistilBERT; no confirmado de forma explicita en la model card) |
| Tipos de cuantizacion | int8 por cuantizacion dinamica (dtype `q8` en transformers.js); fp32 en el checkpoint original. Otros dtypes no disponibles |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | ONNX (artefacto int8 publicado, 67 MB). Modelo base en safetensors. Tamano del repo: 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es la de DistilBERT: un encoder transformer de 6 capas y 66 millones de parametros obtenido por destilacion de BERT-base, con vocabulario WordPiece de 30.522 tokens y un maximo de 512 posiciones. Sobre esa base se anadio una cabeza de clasificacion de dos clases y se ajusto con aproximadamente 4,2 millones de resenas de Steam, etiquetadas por polaridad. La model card no detalla la composicion exacta del dataset (proporcion de idiomas, filtros de deduplicacion, criterio de etiquetado) ni si se aplicaron fases de RLHF o DPO; en un clasificador de este tipo lo habitual es entrenamiento supervisado puro, pero ese punto no se documenta.

El elemento tecnico mas relevante es la exportacion a ONNX con cuantizacion dinamica a int8, pensada para transformers.js. La model card es transparente sobre la procedencia del artefacto: el modelo se exporto desde el checkpoint de entrenamiento 125000, que `trainer_state.json` marca como `best_model_checkpoint` con exactitud de evaluacion 0,9475 y F1 0,9473. Se menciona ademas que una copia anterior del modelo resulto degenerada (emitia un logit casi constante y puntuaba al azar en datos balanceados) y fue descartada, sin que ello afectase al entrenamiento original.

## Capacidades

- Clasificacion binaria de sentimiento en resenas de videojuegos, con salida de etiqueta y probabilidad (por ejemplo `negative, 0.985`).
- Inferencia en navegador mediante transformers.js y ONNX Runtime Web, sin backend ni llamadas a API.
- Ejecucion sobre CPU en entornos con recursos muy limitados, gracias al artefacto int8 de 67 MB.
- Procesamiento de textos cortos en ingles con el registro tipico de Steam (criticas, recomendaciones, quejas tecnicas).
- No soporta tool calling ni function calling: es un modelo de clasificacion, no generativo.
- No soporta agentes, razonamiento multi-paso, modo thinking, vision ni audio.
- Sin capacidades multilingues declaradas: el unico idioma soportado es el ingles.

## Casos de uso

- Moderacion y triaje de resenas en comunidades de Steam: clasificar automaticamente cada resena nueva como positiva o negativa para priorizar la revision humana de las negativas con mayor probabilidad, reduciendo el volumen de lectura manual.
- Panel de analitica de recepcion para un estudio indie: agregar el sentimiento de las resenas de los ultimos 30 dias por parche o actualizacion, usando el modelo en un job por lotes en Python o Node.
- Extension de navegador o widget web: al ser un modelo ONNX int8 de 67 MB integrado en transformers.js, puede ejecutarse en el cliente y mostrar la polaridad de una resena mientras el usuario la lee, sin enviar texto a un servidor.
- Filtro previo en un pipeline de soporte al jugador: detectar resenas negativas con probabilidad alta y enrutarlas a un sistema de tickets o a un canal de Discord de comunidad, separandolas de las criticas meramente informativas.
- Monitorizacion de lanzamiento en tiempo real: clasificar el flujo de resenas de las primeras horas de un juego para detectar un pico de negatividad asociado a problemas tecnicos (rendimiento, cierres inesperados) antes de que se consolide en la puntuacion global.
- Enriquecimiento de datasets propios: usar el modelo como etiquetador debil para pre-anotar corpus de resenas y despues revisar solo los casos con probabilidad intermedia, que son donde se concentra el error segun los propios numeros del autor.
- Prototipos y demos docentes: ejemplo de despliegue ONNX int8 en navegador con una latencia y un peso de artefacto minimos, util para ensenar cuantizacion y despliegue edge.
- Analisis comparativo de catalogo: puntuar agregados de resenas de varios titulos para construir rankings internos de recepcion, siempre teniendo en cuenta el sesgo positivo del corpus original.

## Benchmarks y rendimiento

Los unicos datos publicados son los de la model card del autor. No hay resultados frente a MMLU, HumanEval, GSM8K ni otros benchmarks estandar, y no se dispone de comparaciones con modelos de terceros medidas en el mismo conjunto.

| Evaluacion | Exactitud | F1 |
|---|---|---|
| Distribucion natural del corpus (aproximadamente 94% positivas) | 94,7% | 0,947 |
| Muestra balanceada 300/300, fp32 | 87,3% | no disponible |
| Muestra balanceada 300/300, int8 (este repo) | 87,3% | no disponible |
| Validacion en entrenamiento (checkpoint 125000) | 94,75% | 0,9473 |

La model card explicita que las dos cifras miden cosas distintas: la alta corresponde al desbalance natural del corpus (mayoria de resenas positivas) y la baja es el test honesto sobre datos balanceados. Se aporta ademas la probabilidad media asignada a la clase positiva: 0,969 para resenas positivas y 0,286 para negativas, lo que indica una separacion clara aunque con margen de solapamiento en los casos dificiles.

## Requisitos de hardware

- Inferencia int8: el artefacto ocupa 67 MB, por lo que la VRAM o RAM necesaria es inferior a 1 GB en la practica.
- Cabe en cualquier GPU de consumo, e incluso en GPUs integradas; tambien en CPU de portatil y en dispositivos tipo Raspberry Pi.
- Ejecucion en navegador mediante ONNX Runtime Web (backend WASM o WebGPU segun el cliente).
- Despliegue en servidor: transformers.js en Node, ONNX Runtime en Python, o conversiones a otros runtimes ONNX. No se documenta soporte especifico para vLLM, TGI u Ollama, que no aplican a un clasificador encoder de este tamano.
- Latencia y throughput medidos: no disponibles. La model card no publica tiempos por peticion ni tokens por segundo.

## Comparativa con modelos similares

No se dispone de comparaciones medidas en un conjunto comun, por lo que las cifras de rendimiento de las alternativas no son directamente comparables con las de este modelo. La tabla recoge solo caracteristicas verificables.

| Modelo | Parametros | Contexto | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| Clifftonowen/game-review-sentiment | ~66 M | 512 tokens | Sentimiento binario en resenas de Steam | MIT | ONNX int8, 67 MB, pensado para navegador |
| distilbert/distilbert-base-uncased-finetuned-sst-2-english | ~66 M | 512 tokens | Sentimiento binario generico (SST-2) | Apache-2.0 | Mismo backbone; entrenado en resenas de cine, no de videojuegos |
| Modelos RoBERTa-base ajustados a sentimiento (por ejemplo variantes de analisis de sentimiento en redes sociales) | ~125 M | 512 tokens | Sentimiento generico o de tres clases | No verificada en la informacion disponible | Mayor coste de inferencia y de peso de artefacto |
| DistilBERT base sin ajustar | ~66 M | 512 tokens | Representaciones generales de lenguaje | Apache-2.0 | No resuelve la tarea por si solo |

## Limitaciones y advertencias

- Dominio muy restringido: el modelo esta ajustado al registro especifico de las resenas de Steam. Fuera de ese dominio (resenas de productos, redes sociales, correo de soporte) el rendimiento no esta medido y previsiblemente cae.
- Las resenas cortas, sarcasticas o mixtas son el punto debil declarado por el autor; de ahi proviene precisamente la cifra de 87,3% en la muestra balanceada.
- Sesgo de distribucion: el corpus de entrenamiento es aproximadamente un 94% positivo, lo que puede empujar predicciones hacia la clase positiva en casos ambiguos. La propia model card advierte de que la exactitud del 94,7% esta inflada por ese desbalance.
- La probabilidad media de 0,286 en resenas negativas, frente a 0,969 en positivas, indica que hay negativas que reciben probabilidades relativamente altas de positividad; conviene fijar umbrales segun el caso de uso en lugar de confiar en el argmax por defecto.
- Solo ingles. Las resenas de Steam en otros idiomas no estan cubiertas y no hay datos sobre su comportamiento en ellos.
- Riesgo de error en textos largos: el limite de 512 tokens obliga a truncar o segmentar resenas extensas; no se documenta estrategia de agregacion.
- Incidencia de procedencia documentada: una exportacion previa del modelo era degenerada y puntuaba al azar. Si se replica el pipeline de exportacion, conviene validar de nuevo en un conjunto balanceado antes de desplegar.
- Posible discrepancia de artefactos: la model card describe un fp32 de 268 MB y un int8 de 67 MB, pero el tamano del repo (0,1 GB) sugiere que solo se publica la version cuantizada. Conviene verificar que el archivo fp32 esta realmente disponible antes de asumirlo.
- Trazabilidad baja: 0 descargas y 0 likes, sin paper, sin repositorio de entrenamiento enlazado y sin documentacion del dataset mas alla del numero de resenas. No ha pasado por una revision por pares ni por una evaluacion externa.
- Licencia MIT: permite uso comercial y modificacion sin restricciones adicionales, pero no exime de las obligaciones derivadas de los datos de entrenamiento ni del modelo base (DistilBERT se distribuye bajo Apache-2.0).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Clifftonowen/game-review-sentiment
- Demo en vivo: https://clifftonowen.me/demos
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Modelo base de referencia para comparacion: https://huggingface.co/distilbert/distilbert-base-uncased-finetuned-sst-2-english
- Documentacion de transformers.js: https://huggingface.co/docs/transformers.js
- Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo, su autor o su dataset; los unicos resultados obtenidos fueron paginas de ayuda de Google Maps, sin relacion con el contenido de esta ficha. Por tanto, no hay papers, blogs tecnicos ni repositorios adicionales que enlazar.
