# abhishekkshah12987/fakeddit-bert-fake-news

## Resumen

El modelo `abhishekkshah12987/fakeddit-bert-fake-news` es un clasificador binario de titulares (real/falso) obtenido mediante fine-tuning de `distilbert-base-uncased` sobre una submuestra balanceada del corpus Fakeddit. Lo publica el usuario de HuggingFace abhishekkshah12987 bajo licencia MIT, con un total de 66.955.010 parametros (~67 M) almacenados en formato safetensors (~0,3 GB de repositorio). Su funcion es asignar una etiqueta de dos clases a titulares cortos en ingles, con una calibracion posterior de temperaturas para que la probabilidad de salida sea mas fiable.

El problema que aborda es el de la deteccion de desinformacion a escala de titular, un caso de uso clasico en moderacion de contenido y analisis de redes sociales. La relevancia practica esta en su tamano reducido: al ser un DistilBERT, se puede ejecutar en CPU o en cualquier GPU de consumo con latencia de milisegundos, lo que lo hace apto como filtro de primera etapa en pipelines de alto volumen. El autor advierte de forma explicita en la model card de que el modelo clasifica **estilo de titular**, no veracidad de afirmaciones, y que no es un verificador de hechos de proposito general.

La innovacion metodologica mas destacable no esta en la arquitectura, que es un transformer encoder estandar, sino en el protocolo de evaluacion: seleccion de checkpoint por F1 de validacion, evaluacion unica del conjunto de test y calibracion post-hoc con temperature scaling (T = 1,1099), que reduce el ECE de 0,0813 a 0,0656. El entrenamiento se realizo sobre una submuestra pequena (3500/500/1000 ejemplos) remuestreada respecto a los splits oficiales de Fakeddit.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilacion de BERT-base); `AutoModelForSequenceClassification` con cabeza de 2 clases |
| Parametros totales | 66.955.010 (~67 M) |
| Longitud de contexto | 512 tokens como maximo arquitectonico de DistilBERT; la model card trunca los ejemplos a 64 tokens |
| Tipos de cuantizacion | no disponible (no se documentan versiones cuantizadas ni GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (pesos de HuggingFace Transformers) |
| Tarea (pipeline) | text-classification |
| Dataset de entrenamiento | Fakeddit (submuestra balanceada, 5000 ejemplos) |
| Metricas declaradas | accuracy, F1 |
| Tamano del repositorio | 0,3 GB |
| Fecha de creacion | 2026-09-14 |
| Fecha de actualizacion | 2026-09-14 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un DistilBERT: un transformer encoder de 6 capas obtenido por destilacion de conocimiento a partir de BERT-base, que conserva aproximadamente el 97 % del rendimiento de su profesor con un 40 % menos de parametros. Sobre el cuerpo encoder se anade una cabeza de clasificacion de secuencia con dos etiquetas de salida (real / falso). No hay mecanismos de atencion lineal, decodificacion especulativa, mezcla de expertos ni componentes multimodales: es un encoder denso convencional orientado a clasificacion.

En cuanto a los datos, el autor parte de los TSV oficiales de train/validate/test de Fakeddit, los agrupa y los vuelve a dividir, lo que segun la propia model card impide la comparacion directa con articulos que usan el split oficial de test. El conjunto se balancea a 2500 ejemplos por clase (5000 en total) y se estratifica en 3500 de entrenamiento, 500 de validacion y 1000 de test. Se fine-tunearon candidatos con 3 semillas distintas para `bert-base-uncased` y `distilbert-base-uncased`, se selecciono el checkpoint por F1 de validacion (mejor epoca: 4) y se evaluo el test una sola vez. No se documenta uso de RLHF ni DPO, lo cual no seria esperable en un clasificador de este tipo. La unica tecnica de post-procesado destacable es el temperature scaling de Guo et al. (2017), ajustado sobre los logits de validacion con T = 1,1099.

## Capacidades

- Clasificacion binaria de titulares cortos en ingles en dos clases: real o falso, con salida de probabilidades sobre 2 etiquetas.
- Estimacion de confianza calibrada: aplicando la temperatura T = 1,1099 a los logits antes del softmax se obtiene una probabilidad mas cercana a la frecuencia empirica de acierto.
- Procesamiento por lotes (batching) de titulares con `padding="max_length"` y `truncation=True`, lo que permite throughput alto en grandes volumenes de texto.
- Ejecucion en CPU sin GPU dedicada, dado su tamano de ~67 M de parametros.
- Integracion directa con el ecosistema HuggingFace Transformers mediante `AutoTokenizer` y `AutoModelForSequenceClassification`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso: es un clasificador de una sola pasada, sin generacion de texto.
- No tiene capacidades multilingues: solo ingles.
- No tiene modo de pensamiento (thinking mode), vision, audio ni generacion autoregresiva de texto.

## Casos de uso

- Moderacion de contenido en foros y redes sociales: filtrado previo de titulares de posts para marcar candidatos sospechosos antes de una revision humana, aprovechando que el modelo procesa lotes de cientos de titulares por segundo en CPU.
- Triaje en pipelines de verificacion periodistica: usar la probabilidad calibrada como puntuacion de prioridad para ordenar una cola de titulares y asignar recursos de fact-checking donde la incertidumbre del modelo sea mayor.
- Investigacion academica sobre desinformacion: analisis de estilo editorial de titulares en corpus historicos de Reddit, dado que el modelo ofrece una linea base reproducible con semillas multiples y protocolo de evaluacion documentado.
- Monitorizacion de campanas de clickbait en medios digitales: deteccion de patrones de titular sensacionalista en feeds RSS o APIs de noticias, con umbrales ajustables sobre la probabilidad calibrada.
- Enriquecimiento de datasets para anotacion: preetiquetado automatico de grandes volumenes de titulares que despues se revisan y corrigen por anotadores humanos, reduciendo el coste de anotacion manual.
- Servicio de inferencia de bajo coste: despliegue como microservicio en una instancia sin GPU, con latencia de decenas de milisegundos por lote, adecuado para entornos con presupuesto de computo limitado.
- Analisis exploratorio en notebooks y prototipos: al caber holgadamente en memoria de un portatil, permite iterar sobre heuristicas de umbral y comparar con otros clasificadores sin infraestructura dedicada.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de test reservado (1000 ejemplos, evaluado una sola vez):

| Metrica | Valor |
|---|---|
| Accuracy | 0,7980 |
| F1 (weighted) | 0,7975 |
| Precision (weighted) | 0,8013 |
| Recall (weighted) | 0,7980 |
| ECE (calibrado) | 0,0656 |
| ECE (sin calibrar) | 0,0813 |
| Temperatura de calibracion | 1,1099 |

Comparativa multi-semilla declarada (media +/- desviacion tipica sobre 3 semillas):

| Modelo | Accuracy | F1 |
|---|---|---|
| bert-base-uncased | 0,7983 +/- 0,0078 | 0,7982 +/- 0,0079 |
| distilbert-base-uncased | 0,7897 +/- 0,0125 | 0,7885 +/- 0,0134 |

El checkpoint publicado corresponde a DistilBERT y fue seleccionado por F1 de validacion (mejor epoca: 4). Advertencia del propio autor: los datos no son comparables con articulos que emplean el split oficial de test de Fakeddit, ya que aqui se redivide el corpus.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 270 MB en FP32 (~4 bytes por parametro) y unos 135 MB en FP16; con el tokenizador y el overhead del runtime, menos de 1 GB en cualquier configuracion practica.
- GPU recomendadas: no requiere GPU. Cualquier GPU consumer sirve, incluidas GTX 1650, RTX 3060, RTX 4090 o inferiores; tambien tarjetas de datacenter como A100 o H100, aunque resultan enormemente sobredimensionadas para 67 M de parametros.
- Cabe en GPU de consumo: si, con margen amplio. Tambien cabe en CPU y en dispositivos de borde (Raspberry Pi, moviles de gama alta) siempre que se disponga de un runtime adecuado.
- Opciones de despliegue: HuggingFace Transformers (referencia), Text Generation Inference y vLLM no aplican de forma nativa a clasificacion de secuencia; son mas apropiadas alternativas como FastAPI + Transformers, TorchServe, ONNX Runtime, o exportacion a TorchScript/ONNX. Ollama y llama.cpp no son el cauce habitual para un modelo safetensors de clasificacion sin conversion previa a GGUF, conversion que el autor no documenta.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Como referencia cualitativa, un encoder de 6 capas y 67 M de parametros con secuencias de 64 tokens suele procesar lotes de centenares de ejemplos por segundo en CPU moderna, pero no hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto maximo | F1 (weighted) en esta tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| abhishekkshah12987/fakeddit-bert-fake-news (DistilBERT) | 66.955.010 | 512 tokens (64 en el ejemplo de la model card) | 0,7975 (test propio) | MIT | HuggingFace |
| bert-base-uncased fine-tuneado por el mismo autor | ~110 M | 512 tokens | 0,7982 +/- 0,0079 | Apache 2.0 (modelo base) | No publicado como checkpoint en la informacion disponible |
| distilbert-base-uncased (modelo base, sin fine-tuning) | 66.955.010 | 512 tokens | 0,7885 +/- 0,0134 segun el autor con fine-tuning equivalente | Apache 2.0 | HuggingFace |

No hay datos disponibles sobre otros clasificadores de deteccion de noticias falsas comparables evaluados sobre este mismo split, por lo que no se incluyen cifras adicionales. Cualquier comparacion con resultados publicados sobre el split oficial de Fakeddit seria invalida segun la propia model card.

## Limitaciones y advertencias

- **No es un verificador de hechos.** Las etiquetas provienen del esquema de supervision distante de Fakeddit (subreddit de origen), no de fact-checking humano por afirmacion. El modelo clasifica estilo de titular, no veracidad.
- **Sesgo de dominio:** entrenado exclusivamente con titulares cortos de Reddit en ingles. Su comportamiento en articulos completos, prensa profesional, otros idiomas o dominios distintos no ha sido probado.
- **Datos desactualizados:** no se ha evaluado sobre afirmaciones posteriores al periodo de recogida de Fakeddit, por lo que puede fallar ante desinformacion reciente o cambios de estilo.
- **Submuestra pequena:** solo 5000 ejemplos rebalanceados de un corpus mucho mayor, con 3500 usados para entrenamiento. La varianza entre semillas es apreciable (desviacion tipica de accuracy de ~0,0125 en DistilBERT).
- **Riesgo de alucinacion:** no genera texto, por lo que no alucina en sentido estricto; el riesgo equivalente es la clasificacion erronea con alta confianza. La calibracion reduce el exceso de confianza medio, no garantiza la correccion por ejemplo.
- **Comparabilidad limitada:** el redividido del corpus impide comparar directamente con resultados publicados sobre el split oficial de Fakeddit.
- **Inconsistencia en la documentacion:** el snippet de la model card referencia el identificador `abhinav-29/fakeddit-bert-fake-news`, distinto del ID real del repositorio (`abhishekkshah12987/fakeddit-bert-fake-news`). Conviene verificar el ID antes de usarlo en produccion.
- **Sin adopcion verificable:** 0 descargas y 0 likes en el momento de la consulta, sin senales de uso en produccion ni validacion independiente por terceros.
- **Licencia:** MIT, permisiva para uso comercial y modificacion, siempre que se conserve el aviso de copyright. El modelo base DistilBERT esta bajo Apache 2.0, por lo que conviene revisar ambas.
- **Idioma:** solo ingles. Aplicarlo a texto en castellano producira resultados sin significado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abhishekkshah12987/fakeddit-bert-fake-news
- Dataset Fakeddit: https://fakeddit.netlify.app/
- Articulo de Fakeddit: Nakamura, K., Levy, S., & Wang, W. Y. (2020). r/Fakeddit: A New Multimodal Benchmark Dataset for Fine-grained Fake News Detection. Proceedings of LREC 2020.
- Temperature scaling: Guo, C., Pleiss, G., Sun, Y., & Weinberger, K. Q. (2017). On Calibration of Modern Neural Networks. ICML 2017.
- DistilBERT (modelo base): https://huggingface.co/distilbert/distilbert-base-uncased
- BERT-base (modelo base alternativo): https://huggingface.co/google-bert/bert-base-uncased

Nota: los resultados de la busqueda web proporcionada no contenian informacion relevante sobre este modelo (enlaces a GitHub, Zhihu y articulos sin relacion), por lo que no se anaden mas referencias.
