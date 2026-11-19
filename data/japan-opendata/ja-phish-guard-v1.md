# japan-opendata/ja-phish-guard-v1

## Resumen

ja-phish-guard-v1 es un clasificador de texto en japones especializado en la deteccion de phishing, fraude y spam, desarrollado por Japan Open Data Lab (bajo el identificador japan-opendata). El modelo toma el cuerpo de un mensaje o correo y lo clasifica en cinco categorias (phishing, fraud, spam, benign_hard, benign), devolviendo ademas un risk score calculado como la suma de probabilidades de las tres clases de ataque. Se posiciona explicitamente como un scorer auxiliar de riesgo, no como sustituto de DMARC, inspeccion de URL o autenticacion de remitente.

Tecnicamente es un fine-tuning de tohoku-nlp/bert-base-japanese-v3, un transformer encoder BERT de 111.211.013 parametros (aproximadamente 111M), con una longitud de contexto de 512 tokens. Se distribuye en formato safetensors y ONNX (fp32), lo que facilita su despliegue en CPU mediante onnxruntime. La licencia es Apache 2.0 y el unico idioma soportado es el japones.

Su relevancia actual radica en dos factores: por un lado, cubre un nicho poco atendido como es la deteccion de fraude textual en japones con un modelo pequeno y desplegable en CPU; por otro, su model card es inusualmente transparente sobre las limitaciones, advirtiendo que tanto el entrenamiento como el conjunto de test estan compuestos integramente por datos sinteticos, por lo que las metricas perfectas reportadas no deben extrapolarse sin cautela a correos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT), fine-tuning de tohoku-nlp/bert-base-japanese-v3 |
| Parametros totales | 111.211.013 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (max_length en tokenizacion) |
| Tipos de cuantizacion | no disponible (se publica ONNX fp32; no se documentan variantes cuantizadas) |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y ONNX (onnx/model.onnx, fp32) |

## Arquitectura y entrenamiento

El modelo es un BERT base japones (tohoku-nlp/bert-base-japanese-v3) adaptado a clasificacion de secuencias con cinco etiquetas de salida. La entrada se trunca a 512 tokens y la salida es una distribucion softmax sobre las clases phishing, fraud, spam, benign_hard y benign. El risk score se obtiene sumando las probabilidades de las tres clases de ataque.

El entrenamiento se realizo exclusivamente con datos sinteticos en japones, generados por familias de tecnicas de ataque (manipulacion de metodos). Para medir generalizacion, los conjuntos de desarrollo y de test sellado incluyen familias de ataque no vistas durante el entrenamiento (por ejemplo, variantes de tipo codigo de verificacion por SMS y de fraude de alquiler). Parte del texto benigno proviene de HuggingFaceFW/fineweb-2 en japones (licencia ODC-By 1.0). No se emplearon correos reales ni datos personales, y los nombres de marca se sustituyeron por marcas ficticias y nombres de rol. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no disponible).

## Capacidades

- Clasificacion de texto en cinco clases: phishing, fraud, spam, benign_hard y benign.
- Calculo de un risk score continuo como suma de probabilidades de las tres clases de ataque.
- Deteccion de familias de ataque no vistas durante el entrenamiento, segun los resultados reportados en el test sellado.
- Inferencia rapida en CPU mediante el grafo ONNX incluido (aproximadamente 27,6 ms por muestra en un Core i7-11700F).
- Soporte de truncacion a 512 tokens para mensajes largos.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada al japones.

## Casos de uso

- Filtrado previo de correo entrante en pasarelas de correo corporativo: el modelo puede puntuar el cuerpo del mensaje y elevar la puntuacion de riesgo para que el sistema antispam existente aplique cuarentena o revision humana, aprovechando su baja latencia en CPU.
- Moderacion de mensajes en plataformas de mensajeria y foros en japones: integrado como microservicio ONNX, clasifica cada mensaje y activa flujos de revision cuando el risk score supera un umbral configurable.
- Senalizacion de SMS fraudulentos en aplicaciones moviles o pasarelas de operadores: el modelo detecta patrones de phishing y fraude en el texto, incluyendo variantes de tipo codigo de verificacion, segun los resultados del autor.
- Enriquecimiento de alertas en un SIEM: el risk score y las probabilidades por clase pueden incorporarse como campos adicionales en eventos de seguridad para priorizar la investigacion por analistas.
- Deteccion de fraude en comunicaciones de alquiler o inmobiliarias: el autor reporta deteccion de familias de fraude de alquiler no vistas en entrenamiento, lo que permite usarlo como capa adicional en portales de anuncios.
- Analisis por lotes de buzones historicos: al ser un modelo de 111M parametros ejecutable en CPU, puede procesarse grandes volumenes de correos archivados para etiquetar y priorizar casos sospechosos sin coste de GPU.
- Prototipado e investigacion en seguridad: sirve como baseline reproducible para experimentos de deteccion de fraude textual en japones, con pesos abiertos y licencia Apache 2.0.

## Benchmarks y rendimiento

Resultados reportados por el autor en el test sellado (2.990 muestras de datos sinteticos no usados en entrenamiento ni en seleccion de umbral):

| Metrica | Valor |
|---|---|
| Tasa de deteccion (clases de ataque, 1.640/1.640) | 1,0 |
| Tasa de falsos positivos con umbral 0,5 | 0,0 |
| Tasa de falsos positivos con umbral bajo fijado en dev (restriccion de 1 % de FP) | 0,0022 |
| Precision por clase (5 clases) | 1,0 en todas |
| Tasa de deteccion en familias no vistas (SMS de verificacion, fraude de alquiler) | 1,0 |
| AUC del risk score | 1,0 |
| Precision de la clase fraud en dev | 0,7483 |
| Latencia (ONNX, CPU, Core i7-11700F) | 27,6 ms por muestra (media) |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,45 GB solo para pesos (111M parametros x 4 bytes), mas activaciones; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (por ejemplo, RTX 3060 o superior) acelera la inferencia, pero el caso de uso principal es CPU.
- Cabe en GPU consumer: si, con margen amplio; tambien en CPU sin GPU dedicada.
- Opciones de despliegue: transformers (PyTorch), onnxruntime con el grafo ONNX incluido, y servidores de inferencia compatibles con modelos de clasificacion de transformers. No se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 27,6 ms por muestra en CPU (Core i7-11700F) segun el autor; el throughput no se documenta de forma explicita (no disponible).

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros clasificadores de phishing en japones en la informacion proporcionada. La siguiente tabla recoge solo los datos verificables del modelo y deja como no disponible la comparacion cuantitativa:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| ja-phish-guard-v1 | 111M | 512 tokens | ja | Apache 2.0 | Test sintetico propio: deteccion 1,0, FP 0,0 (umbral 0,5) |
| Alternativas de clasificacion de phishing en japones | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenamiento y test completamente sinteticos: las metricas perfectas del test sellado no deben extrapolarse a correos reales; el propio autor advierte que el rendimiento real sera inferior.
- Las familias "no vistas" del test proceden del mismo mecanismo de generacion, por lo que no representan tacticas nuevas del mundo real.
- Precision de la clase fraud en dev de 0,7483, inferior al resto de clases; el modelo es mas debil ante variaciones de redaccion en fraudes.
- Solo analiza el texto del mensaje: no sustituye a la autenticacion de remitente (DMARC), a la inspeccion de URL ni al analisis de adjuntos; debe usarse como scorer auxiliar combinado con otras defensas.
- No se entrenó con marcas reales (solo ficticias), por lo que el rendimiento ante suplantacion de marcas reales no esta verificado.
- Idioma limitado al japones; no se documenta rendimiento en otros idiomas.
- Riesgo de alucinacion no aplica en sentido generativo, pero si existe riesgo de clasificacion erronea (falsos negativos y positivos) en dominios distintos al sintetico.
- Sesgos conocidos: no documentados por el autor (no disponible).
- Licencia Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad de validar el modelo en su dominio antes de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/japan-opendata/ja-phish-guard-v1
- Pagina de presentacion del modelo: https://jpopendata.jp/models/ja-phish-guard-v1/
- Serie de modelos de Japan Open Data Lab: https://jpopendata.jp/models/
- Modelo base: https://huggingface.co/tohoku-nlp/bert-base-japanese-v3
- Dataset de texto benigno citado: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
