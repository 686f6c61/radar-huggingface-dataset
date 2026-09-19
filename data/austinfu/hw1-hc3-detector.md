# AustinFu/hw1-hc3-detector

## Resumen

AustinFu/hw1-hc3-detector es un clasificador binario de texto en ingles que distingue respuestas escritas por personas (etiqueta 0) de respuestas generadas por ChatGPT (etiqueta 1). Se trata del resultado de un experimento docente para la asignatura CS546 (Homework 1), no de un modelo orientado a produccion, y se publica con el unico proposito de reproducir un ejercicio academico de deteccion de texto generado.

Tecnicamente es un ajuste fino completo de `sentence-transformers/all-MiniLM-L6-v2`, un transformer encoder de tipo BERT de 6 capas y aproximadamente 22,7 millones de parametros, al que se anade una cabeza de clasificacion de secuencia. El entrenamiento se realiza sobre el corpus HC3 (Human ChatGPT Comparison Corpus) en su revision inglesa, con entradas de solo respuesta, longitud maxima de 256 wordpieces y una particion 80/10/10 por pregunta.

Su relevancia es limitada y fundamentalmente metodologica: sirve como referencia reproducible de como el ajuste fino de un encoder pequeno dispara la exactitud en un benchmark historico y balanceado (de 0,8449 a 0,9895 en test), pero el propio autor advierte de que ese resultado no demuestra fiabilidad frente a modelos actuales, dominios nuevos, texto multilingue, texto editado o entregas de estudiantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MiniLM-L6) con cabeza de clasificacion de secuencia |
| Parametros totales | 22.713.986 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 256 wordpieces (max_length usado en el entrenamiento; el modelo base tambien esta limitado a 256) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos safetensors en su precision original |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible (ni la model card ni los metadatos de HuggingFace la declaran) |
| Formato de pesos | safetensors |
| Tarea (pipeline) | text-classification |
| Etiquetas | 0 = humano, 1 = ChatGPT |
| Modelo base | sentence-transformers/all-MiniLM-L6-v2 |
| Dataset de entrenamiento | Hello-SimpleAI/HC3 (revision inglesa `4d0ff18143b5a7e1b1e79beb540c04549d1e59d3`) |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer bidireccional de 6 capas, derivado de MiniLM y distribuido habitualmente como modelo de similitud de frases, al que se anade una cabeza de clasificacion de secuencia y se ajustan todos los pesos del transformer junto con dicha cabeza. El ajuste es completo (full fine-tuning), no basado en adaptadores ni en capas congeladas.

El procedimiento de entrenamiento documentado en la model card es el siguiente: se parte de la revision inglesa de HC3, se toma la primera respuesta no vacia de cada clase para cada pregunta elegible, se excluyen preguntas duplicadas y pares identicos, y se divide por pregunta en 80/10/10 con semilla 42 antes de aplanar las respuestas (de modo que ninguna pregunta aparece a la vez en train y test). Las entradas contienen unicamente la respuesta, con longitud maxima de 256 wordpieces y padding dinamico. Se entrena con AdamW a 2e-5, weight decay 0,01, batch de 32 y cinco epocas, monitorizando validacion tras cada epoca; se evalua el modelo final de cinco epocas. No se documenta uso de RLHF, DPO ni decodificacion especulativa, algo esperable en un clasificador discriminativo.

## Capacidades

- Clasificacion binaria de texto: asigna a una respuesta la etiqueta "humano" o "ChatGPT" y devuelve logits o probabilidades para ambas clases.
- Deteccion de texto generado en el dominio concreto de HC3: respuestas a preguntas de tipo enciclopedico o de conocimiento general, en ingles y con una sola respuesta como entrada.
- Extraccion de una probabilidad calibrada (via softmax) utilizable como puntuacion continua para umbralizar.
- Inferencia muy ligera: 22,7 millones de parametros permiten ejecucion en CPU con latencias bajas.
- No soporta generacion de texto, razonamiento, codigo ni matematicas: es un clasificador, no un modelo generativo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: solo se ha entrenado con datos en ingles.
- No dispone de modo "thinking", vision, audio ni ninguna modalidad adicional.
- No acepta conversaciones multi-turno: el texto de entrada es una unica respuesta truncada a 256 wordpieces.

## Casos de uso

- Docencia sobre deteccion de texto generado: sirve como ejemplo completo y reproducible de ajuste fino de un encoder para clasificacion, con particion por pregunta y metricas documentadas, adecuado para practicas de posgrado.
- Curacion de corpus de investigacion: uso como etiquetador debil para prefiltrar respuestas potencialmente sinteticas antes de una revision humana, siempre dentro de dominios parecidos a HC3 y asumiendo una tasa de error no cuantificada fuera de ese benchmark.
- Reproduccion de resultados academicos: permite replicar el experimento del paper de Guo et al. (2023) sobre HC3 con un coste computacional minimo, comparando el baseline sin ajuste (0,8449) con el modelo ajustado (0,9895).
- Baseline ligero en experimentos de deteccion: al ejecutarse en CPU y ocupar menos de 100 MB, es util como punto de comparacion rapido frente a detectores mas grandes o basados en LLM en una bateria de pruebas.
- Preanotacion para anotadores humanos: los casos con probabilidad muy alta o muy baja pueden aceptarse automaticamente y reservar la revision manual para los casos cercanos al umbral, reduciendo el coste de anotacion.
- Analisis estilometrico exploratorio: como sonda para estudiar que senales de estilo y de recoleccion de datos separan las respuestas humanas de las de ChatGPT en HC3, tal y como advierte la propia model card.
- Pruebas de integracion en pipelines de NLP: util para validar extremo a extremo un servicio de clasificacion con `transformers`, con formato de pesos safetensors y sin dependencias pesadas.
- Demostraciones educativas de limitaciones de los detectores: el modelo puede emplearse precisamente para mostrar como un detector con 0,9895 de exactitud en su benchmark falla al cambiar de dominio o de modelo generador.

## Benchmarks y rendimiento

Los unicos datos publicados son los de la model card, medidos sobre el conjunto de test definido en el propio experimento (HC3 ingles, particion 10 % por pregunta, semilla 42):

| Metrica | Baseline | Modelo ajustado |
|---|---|---|
| Exactitud en test | 0,844901 | 0,989503 |
| Macro F1 en test | no disponible | 0,989502 |

La model card no especifica como se construyo el baseline (no detalla si es un clasificador sobre caracteristicas congeladas, una regresion logistica o una evaluacion cero disparos), por lo que ese 0,8449 debe interpretarse con cautela. No se han publicado resultados comparativos con MMLU, HumanEval, GSM8K ni con otros detectores en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 91 MB en fp32, 45 MB en fp16 y 23 MB en int8, calculado a partir de los 22.713.986 parametros; el consumo real dependera del framework y del tamano de lote.
- GPU recomendadas: ninguna en particular; el modelo es viable en cualquier GPU con al menos 1 GB de memoria, desde una GTX 1050 hasta una H100, y en la practica la GPU no es el cuello de botella.
- Cabe holgadamente en GPU de consumo: si, en cualquier tarjeta consumer actual o antigua, e incluso en CPU.
- CPU: la inferencia en CPU es perfectamente practica para lotes moderados; es el modo de despliegue mas razonable para un modelo de este tamano.
- Opciones de despliegue: `transformers` (pipeline de text-classification), ONNX Runtime, TorchScript, o un servicio FastAPI con inferencia por lotes. Los servidores orientados a LLM generativos (vLLM, TGI, llama.cpp, Ollama) no son aplicables, ya que no existe un decoder ni pesos GGUF.
- Latencia y throughput: no disponible; la model card no publica mediciones.

## Comparativa con modelos similares

No se dispone de resultados de benchmark comparables en la informacion proporcionada; la tabla recoge unicamente caracteristicas estructurales conocidas. Las cifras de rendimiento de los modelos alternativos se marcan como no disponibles porque no se han verificado en este contexto.

| Modelo | Parametros | Contexto | Licencia | Rendimiento en HC3 |
|---|---|---|---|---|
| AustinFu/hw1-hc3-detector | 22,7 M | 256 wordpieces | no disponible | 0,9895 de exactitud en test (benchmark propio) |
| Hello-SimpleAI/chatgpt-detector-roberta | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible |
| roberta-base-openai-detector | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible |
| Detector propietario tipo GPTZero | no disponible | no disponible | propietaria | no disponible |

La diferencia principal frente a alternativas basadas en RoBERTa es el tamano: 22,7 M de parametros frente al orden de 125 M de un `roberta-base`, lo que reduce coste de inferencia a cambio de una capacidad de representacion mucho menor y, previsiblemente, de una generalizacion mas fragil fuera del dominio HC3.

## Limitaciones y advertencias

- Dominio historico y balanceado: el corpus HC3 no representa el comportamiento de modelos generativos actuales, y el autor lo advierte explicitamente.
- Sin evidencia de fiabilidad en dominios nuevos, texto multilingue, texto editado o entregas de estudiantes.
- Riesgo de que las predicciones se apoyen en artefactos de estilo y de recoleccion del corpus, no en senales semanticas de autoria.
- Truncamiento: las respuestas largas se recortan a 256 wordpieces, por lo que parte del contenido no se tiene en cuenta.
- Solo ingles; cualquier entrada en otro idioma queda fuera de su ambito de entrenamiento.
- No debe utilizarse para decisiones de alto impacto, como acusaciones de plagio, atribucion de autoria o expedientes disciplinarios; la model card lo prohibe de forma explicita.
- Riesgo de alucinacion no aplica en el sentido generativo (el modelo no genera texto), pero si existe riesgo de falsos positivos y falsos negativos con consecuencias graves si se usa como oraculo.
- Licencia no declarada: al no especificarse, no hay autorizacion explicita de uso comercial. Conviene tener en cuenta que el modelo base `sentence-transformers/all-MiniLM-L6-v2` se distribuye bajo Apache-2.0, pero eso no determina la licencia de este ajuste fino.
- Modelo de experimento docente, sin mantenimiento, con 0 descargas y 0 likes en el momento de la consulta.
- El resultado de 0,9895 de exactitud procede de una particion concreta con semilla 42 y no debe extrapolarse a produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AustinFu/hw1-hc3-detector
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Dataset: https://huggingface.co/datasets/Hello-SimpleAI/HC3
- Paper de referencia: Guo et al. (2023), "How Close is ChatGPT to Human Experts? Comparison Corpus, Evaluation, and Detection": https://arxiv.org/abs/2301.07597
- No se han encontrado otros enlaces relevantes (repositorio, demo o blog del autor) en la informacion disponible.
