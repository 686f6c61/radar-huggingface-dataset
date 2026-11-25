# GustavoDLRA/distilhubert-finetuned-gtzan

## Resumen

DistilHuBERT fine-tuned en GTZAN es un modelo de clasificacion de audio derivado de `ntu-spml/distilhubert`, un transformer destilado del modelo HuBERT original. El autor, identificado en Hugging Face como GustavoDLRA, ha ajustado el modelo sobre el conjunto de datos GTZAN, un corpus de referencia para la clasificacion de generos musicales compuesto por 1.000 fragmentos de audio de 30 segundos distribuidos en 10 generos. El resultado es un clasificador ligero de 23,7 millones de parametros que predice genero musical a partir de una señal de audio.

La relevancia de este modelo radica en su tamano reducido y su licencia Apache 2.0, que lo hacen adecuado para despliegues con recursos limitados, prototipado rapido y experimentacion academica. No obstante, se trata de un ajuste generado automaticamente con el `Trainer` de Hugging Face, con una model card incompleta y sin validacion externa de los resultados declarados. El modelo declara una precision del 85 % sobre el conjunto de evaluacion de GTZAN, aunque esa metrica no esta verificada y se calcula sobre el split de entrenamiento segun la model-index, lo que limita su valor como referencia de generalizacion.

Arquitectonicamente hereda la configuracion de DistilHuBERT: un transformer de 6 capas con representaciones ocultas de 768 dimensiones, entrenado originalmente mediante destilacion del HuBERT base. La tarea concreta que resuelve es la clasificacion de audio en 10 clases de genero musical, no la generacion de texto ni el razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (HuBERT destilado, 6 capas) |
| Parametros totales | 23.691.402 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (audio, ventanas de entrada dependientes del preprocesado) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de PyTorch) |
| Idiomas soportados | no disponible (modelo de audio, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `ntu-spml/distilhubert`, una version destilada de HuBERT que reduce el numero de capas del transformer original manteniendo las representaciones acusticas aprendidas mediante prediccion de unidades ocultas. Sobre esa base, el autor ha realizado un ajuste supervisado para clasificacion de generos musicales con 10 clases de salida, anadiendo una cabeza de clasificacion sobre las representaciones del encoder.

Segun los hiperparametros declarados en la model card, el entrenamiento utilizo una tasa de aprendizaje de 5e-05, un batch efectivo de 8 (batch de 2 con 4 pasos de acumulacion de gradientes), optimizador AdamW con betas (0.9, 0.999), scheduler lineal con 112 pasos de calentamiento, 10 epocas y precision mixta nativa (AMP). La semilla fue 42. No se especifica el numero de tokens de audio, la composicion exacta del dataset ni si se aplicaron tecnicas de aumento de datos o regularizacion adicionales. Tampoco se documenta si hubo fases de RLHF, DPO o ajuste por preferencias, algo esperable en un modelo de clasificacion y no de generacion.

La evolucion del entrenamiento muestra una perdida de validacion que desciende de 1,9010 en la primera epoca a 0,6023 en la decima, con una precision que pasa del 50 % al 85 %. Se observa una caida puntual de precision en la epoca 8 (78 %) seguida de recuperacion, lo que sugiere cierta inestabilidad en el ajuste fino.

## Capacidades

- Clasificacion de audio en 10 generos musicales (blues, classical, country, disco, hiphop, jazz, metal, pop, reggae, rock), segun las clases estandar de GTZAN.
- Extraccion de representaciones acusticas intermedias mediante el encoder DistilHuBERT, reutilizables para otras tareas de audio.
- Inferencia sobre fragmentos de audio de duracion fija (tipicamente 30 segundos en GTZAN), con el preprocesado adecuado del feature extractor de HuBERT.
- No soporta generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues en el sentido linguistico; opera sobre señales de audio.
- No dispone de modo "thinking", vision ni audio generativo.

## Casos de uso

- Clasificacion automatica de genero musical en bibliotecas personales: el modelo puede etiquetar pistas de audio en 10 generos con un coste computacional bajo, adecuado para ejecucion en CPU o GPU de gama baja.
- Etiquetado de catalogos musicales en plataformas de streaming o archivos: util para enriquecer metadatos cuando no se dispone de informacion editorial, aunque con la limitacion de solo 10 clases.
- Prototipado de sistemas de recomendacion musical: las representaciones del encoder y la prediccion de genero pueden servir como caracteristica auxiliar en un pipeline de recomendacion.
- Investigacion academica en music information retrieval (MIR): el modelo sirve como linea base ligera para experimentos de clasificacion de genero y para comparar con arquitecturas mas grandes.
- Filtrado y organizacion de datasets de audio: clasificacion rapida de grandes volumenes de clips para separar por genero antes de un procesamiento posterior.
- Demostraciones educativas de ajuste fino de modelos de audio: por su tamano reducido y su licencia permisiva, es util en cursos y talleres sobre transformers aplicados a audio.
- Deteccion de contenido musical en entornos con restricciones de recursos: al ocupar unos 0,1 GB en el repositorio, puede desplegarse en dispositivos edge o contenedores ligeros.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index (no verificados):

| Metrica | Dataset | Split | Valor |
|---|---|---|---|
| Accuracy | GTZAN (`marsyas/gtzan`, config `all`) | train | 0,85 |
| Loss (evaluacion) | GTZAN | evaluacion | 0,6023 |

Nota: la model-index declara el split `train`, no un split de test independiente, por lo que la cifra de precision no debe interpretarse como rendimiento de generalizacion. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision FP32 para los 23,7 millones de parametros, mas el overhead del feature extractor y del runtime. En FP16, por debajo de 0,5 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior ofrece margen amplio. Tambien funciona en CPU para inferencia por lotes pequenos.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: `transformers` con PyTorch (via `pipeline("audio-classification")`), ONNX Runtime, o exportacion a TorchScript. No se documenta soporte especifico para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles. Dependeran del hardware, de la duracion del audio de entrada y del tamano de lote.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GustavoDLRA/distilhubert-finetuned-gtzan | 23,7 M | Clasificacion de genero musical (GTZAN) | Audio de duracion fija | Apache 2.0 | Hugging Face |
| ntu-spml/distilhubert | no disponible en la informacion | Representaciones de audio (base) | Audio | Apache 2.0 | Hugging Face |
| facebook/hubert-base-ls960 | ~95 M (aprox., no confirmado en la informacion) | Representaciones de audio (base) | Audio | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparables de otros modelos sobre GTZAN en la informacion proporcionada, por lo que la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- La model card esta generada automaticamente e incompleta: no documenta la composicion del dataset, el preprocesado ni las limitaciones previstas por el autor.
- La precision del 85 % se declara sobre el split `train` segun la model-index, no sobre un conjunto de test independiente; puede estar sobreestimada por sobreajuste.
- GTZAN es un dataset conocido por sus problemas de calidad (fragmentos duplicados, etiquetas erroneas y solapamiento entre splits), lo que afecta a la fiabilidad de las metricas.
- El modelo solo distingue 10 generos musicales; no generaliza a subgeneros ni a categorias fuera de ese conjunto.
- Riesgo de confusion en generos acusticamente proximos (por ejemplo, rock y metal, o disco y pop) y en fragmentos con instrumentacion atipica.
- No se documentan sesgos especificos, pero al entrenarse sobre un corpus occidental de musica, puede presentar sesgo cultural hacia generos anglosajones.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, con la obligacion de conservar el aviso de licencia y la atribucion.
- Para produccion, conviene validar el modelo sobre un conjunto propio y representativo antes de confiar en las etiquetas, dado el caracter no verificado de los resultados.
- No apto para tareas de generacion, dialogo, codigo ni razonamiento; su uso esta acotado a clasificacion de audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GustavoDLRA/distilhubert-finetuned-gtzan
- Modelo base DistilHuBERT: https://huggingface.co/ntu-spml/distilhubert
- Dataset GTZAN en Hugging Face: https://huggingface.co/datasets/marsyas/gtzan
- Repositorio original de HuBERT (referencia): https://github.com/facebookresearch/fairseq/tree/main/examples/hubert
- Documentacion de `transformers` para audio-classification: https://huggingface.co/docs/transformers/tasks/audio_classification
