# AnkithaShivalinga/lakeshore-ticket-sorter

## Resumen

Lakeshore Ticket Sorter es un clasificador de texto basado en DistilBERT, publicado por AnkithaShivalinga, que sugiere una cola de soporte (facturacion, averia de bicicleta, estacion o cuenta) a partir de un mensaje corto de cliente en ingles. Se trata de un fine-tuning de `distilbert/distilbert-base-uncased` con una nueva cabeza de clasificacion de cuatro clases, desarrollado como ejercicio de laboratorio para el curso Humber AIGC 5005 (Lab 09), con el objetivo didactico de comparar el ajuste fino de un transformer con una linea base mas barata (TF-IDF + regresion logistica).

El modelo es deliberadamente pequeno y acotado: 66.956.548 parametros, un repositorio de 0,3 GB y un entrenamiento sobre tan solo 400 ejemplos sinteticos generados por script. No esta pensado para produccion ni para enrutar mensajes reales sin supervision humana; su interes radica en ser un ejemplo reproducible y honesto de evaluacion de un clasificador frente a baselines, con resultados publicados en test y en un conjunto de validacion manual.

Su relevancia actual es limitada fuera del ambito docente, pero resulta util como referencia metodologica: muestra como un DistilBERT fine-tuneado supera a TF-IDF en datos sinteticos (0,9167 frente a 0,8625 de accuracy) y, sin embargo, pierde frente a la linea base en mensajes escritos a mano (0,9500 frente a 0,9750), una leccion practica sobre generalizacion y sobreajuste a patrones artificiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT-base) con cabeza de clasificacion de 4 clases |
| Parametros totales | 66.956.548 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens maximos del modelo base; en entrenamiento se trunco a 64 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin variantes publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased`, un encoder transformer de 6 capas y 66 millones de parametros obtenido por destilacion de BERT-base, al que se anade una cabeza lineal de clasificacion con cuatro salidas (billing, bike_fault, station, account). El fine-tuning es completo (no LoRA ni adaptadores), con learning rate de 5e-05, 5 epocas, batch size 16 y truncamiento de mensajes a 64 tokens. La seleccion de hiperparametros se realizo unicamente sobre el conjunto de validacion.

Los datos de entrenamiento son 1.200 mensajes inventados generados por `tickets_data.py` (funcion `make_tickets()` con argumentos por defecto), divididos de forma estratificada con semilla 42 en 720 de entrenamiento, 240 de validacion y 240 de test. El modelo final se entreno sobre una muestra estratificada de solo 400 ejemplos de entrenamiento (semilla 0). No se menciona uso de RLHF, DPO ni tecnicas de alineacion; es un ajuste supervisado clasico de clasificacion. Como innovacion tecnica no hay ninguna destacable: el valor del trabajo esta en la evaluacion comparativa y en la reproducibilidad, no en la arquitectura.

## Capacidades

- Clasificacion de texto en cuatro categorias: facturacion, averia de bicicleta, estacion y cuenta.
- Asignacion de una etiqueta sugerida a mensajes cortos de soporte en ingles (hasta 64 tokens efectivos).
- Salida de probabilidades softmax por clase, que el autor advierte explicitamente que no constituyen una garantia de acierto.
- No soporta tool calling ni function calling.
- No esta disenado para razonamiento multi-paso ni para uso como agente.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue nula: solo ingles.
- No genera texto; es exclusivamente un clasificador.

## Casos de uso

- Clasificacion de tickets de soporte en un prototipo docente: el modelo sugiere una cola para mensajes cortos en ingles y una persona valida la asignacion, tal como indica el autor en la model card.
- Comparacion de metodos en un curso o taller de NLP: sirve como ejemplo de fine-tuning de DistilBERT frente a una linea base TF-IDF + regresion logistica, con metricas publicadas y reproducibles.
- Enrutamiento interno de baja criticidad: en un entorno controlado con mensajes muy similares a los sinteticos del dataset, podria preclasificar y reducir carga manual, siempre con revision humana.
- Generacion de datasets de prueba: util para validar pipelines de clasificacion antes de invertir en un modelo mayor o en datos reales etiquetados.
- Estudio de sobreajuste a datos sinteticos: el contraste entre el 0,9167 en test sintetico y el 0,9500 en mensajes manuales (frente al 0,9750 de TF-IDF) lo convierte en un caso practico para discutir generalizacion.
- Base para experimentos de destilacion o cuantizacion: al ser un DistilBERT pequeno, es un punto de partida barato para probar tecnicas de compresion o despliegue en CPU.
- Referencia de evaluacion con conjunto manual: el conjunto de 40 mensajes escritos a mano (10 por cola) puede reutilizarse como test externo en experimentos derivados.

## Benchmarks y rendimiento

Resultados publicados por el autor, entrenados sobre los mismos 400 ejemplos y evaluados sobre las mismas 240 filas de test:

| Metodo | Accuracy en test | Macro F1 en test |
|---|---|---|
| Etiqueta mas frecuente (baseline) | 0,2917 | 0,1129 |
| TF-IDF + regresion logistica (baseline) | 0,8625 | 0,8604 |
| Este modelo: DistilBERT, fine-tuning completo | 0,9167 | 0,9158 |

Resultados sobre 40 mensajes escritos a mano (10 por cola), nunca usados en entrenamiento ni ajuste:

| Metodo | Accuracy | Macro F1 |
|---|---|---|
| Etiqueta mas frecuente (baseline) | 0,2500 | 0,1000 |
| TF-IDF + regresion logistica (baseline) | 0,9750 | 0,9749 |
| Este modelo: DistilBERT, fine-tuning completo | 0,9500 | 0,9484 |

El autor indica que el metodo elegido en validacion fue `ft_full` y que las medias y rangos sobre tres semillas para cada tamano de entrenamiento estan en el repositorio del proyecto. No se publican resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) porque el modelo no esta orientado a esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,27 GB solo de pesos (66,9 M de parametros); en FP16, unos 0,13 GB. Con activaciones y overhead de runtime, cabe holgadamente en menos de 1 GB.
- GPU recomendadas: cualquier GPU moderna sirve; no requiere A100 ni H100. Una RTX 4090, RTX 3090 o incluso una GTX 1650 lo ejecutan sin problema.
- Cabe en GPU de consumo y tambien en CPU: es viable en inferencia por CPU para volumenes moderados, dado su tamano.
- Opciones de despliegue: Hugging Face `transformers` (pipeline `text-classification`), TorchServe, ONNX Runtime, o exportacion a GGUF para llama.cpp si se convierte manualmente (no se publican pesos GGUF).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera latencia de milisegundos por muestra en GPU y de decenas de milisegundos en CPU, aunque no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lakeshore Ticket Sorter (este modelo) | 66,9 M | 512 (64 en entrenamiento) | Clasificacion de tickets en 4 clases | Apache 2.0 | Hugging Face |
| distilbert-base-uncased | 66,9 M | 512 | Modelo base general (MLM) | Apache 2.0 | Hugging Face |
| bert-base-uncased | 110 M | 512 | Modelo base general (MLM) | Apache 2.0 | Hugging Face |
| TF-IDF + regresion logistica (baseline del autor) | no aplica | no aplica | Clasificacion de tickets en 4 clases | no aplica | Repositorio del proyecto |

Frente a `distilbert-base-uncased` y `bert-base-uncased`, la diferencia es que este modelo esta especializado en una tarea concreta de cuatro clases, mientras que los otros son modelos base sin cabeza de clasificacion ajustada. Frente al baseline TF-IDF, el modelo gana en test sintetico pero pierde en el conjunto manual, segun los datos del propio autor. No se dispone de comparaciones con clasificadores especializados de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- El texto de entrenamiento fue inventado por un script que repite un conjunto pequeno de patrones de frase; el rendimiento sobre mensajes reales de clientes sera probablemente inferior al publicado.
- Aproximadamente uno de cada ocho mensajes generados no dice nada sobre su tema, por lo que ningun modelo puede conocer su etiqueta; alrededor de uno de cada diez mezcla dos temas.
- Solo ingles y solo mensajes cortos: el texto mas largo se trunca a 64 tokens.
- Las puntuaciones son probabilidades softmax, no una garantia de que la respuesta sea correcta.
- El autor restringe explicitamente el uso: no debe enrutar mensajes reales de clientes sin una persona en el bucle ni emplearse con otro tipo de texto.
- Riesgo de sobreajuste a los patrones sinteticos, evidenciado por la caida relativa frente a TF-IDF en el conjunto escrito a mano.
- No se documentan sesgos especificos, pero al entrenarse con datos generados por script, la distribucion no representa el lenguaje real de clientes.
- Licencia Apache 2.0: permite uso comercial, pero las limitaciones anteriores desaconsejan su uso en produccion sin validacion adicional.
- Cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso externo ni validacion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnkithaShivalinga/lakeshore-ticket-sorter
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Resultado de busqueda web sobre tarifas del metro de Londres (no relacionado con el modelo): https://www.londontubemap.org/en-price-fares-tickets-tube-London.php
