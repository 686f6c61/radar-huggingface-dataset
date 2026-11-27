# elnemer7/ElNeMeR-ECommerce-FakeStore-ReviewFraud-ONNX

## Resumen

ElNeMeR-ECommerce-FakeStore-ReviewFraud-ONNX es un clasificador binario-multiclase exportado a formato ONNX, publicado por el autor elnemer7 (Eng. Mahmoud ElNemer, ElNeMeR Digital Solutions & AI). Su proposito declarado es detectar tiendas falsas en redes sociales (paginas de Facebook/Instagram con reclamos de descuentos abusivos, pago por monedero electronico por adelantado y sin inspeccion del producto) y anillos coordinados de resenas automatizadas (astroturfing). El modelo forma parte de una flota de 35 modelos que el autor denomina "Sovereign & Humanitarian Forensic AI Fleet".

Tecnicamente, el artefacto es un modelo ONNX (opset 14) que consume un tensor de entrada `features` de tipo `float32` con forma `[batch_size, 512]` y devuelve probabilidades sobre tres clases: `legitimate_retail_merchant`, `upfront_wallet_fake_store` y `astroturfed_bot_review_scam`. No se trata de un modelo generativo de lenguaje, sino de un clasificador tabular/vectorial que requiere un pipeline externo de extraccion de caracteristicas (feature engineering) para transformar texto, metadatos de la tienda o senales de resenas en el vector de 512 dimensiones.

La relevancia del modelo es acotada: la ficha del autor no documenta arquitectura interna, datos de entrenamiento, tokenizador ni el procedimiento de extraccion de caracteristicas, y el repositorio tiene 0 descargas y 0 likes en el momento de la consulta. La licencia MIT facilita su uso comercial, pero la ausencia de informacion sobre el pipeline de preprocesado limita seriamente su reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ONNX; no se documenta la topologia interna) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada fija de vector `float32` de 512 dimensiones) |
| Tipos de cuantizacion | no disponible (el artefacto se distribuye como ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 14; compatible con `onnxruntime` y `onnxruntime-web` WASM) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. La model card unicamente especifica el contrato de inferencia: una entrada denominada `features` de tipo `float32` con forma `[batch_size, 512]` y una salida `probabilities` sobre tres clases. El uso de un vector de 512 dimensiones sugiere un clasificador sobre caracteristicas precalculadas (posiblemente embeddings de texto de 512 dimensiones, como los producidos por algunos modelos de sentence embeddings, o un vector de caracteristicas de ingenieria manual), pero el autor no documenta cual es el pipeline de extraccion.

Tampoco se documentan el volumen ni la composicion del dataset de entrenamiento, la existencia de RLHF/DPO (improbable en un clasificador de este tipo), ni detalles sobre regularizacion, funcion de perdida o estrategia de validacion. El unico dato de rendimiento declarado es una "Calibration Accuracy" del 100,00 %, cifra que no viene acompanada de definicion del conjunto de evaluacion, tamano de muestra ni metodologia, por lo que no debe interpretarse como una metrica de generalizacion fiable.

## Capacidades

- Clasificacion de tiendas de comercio electronico en tres categorias: comerciante minorista legitimo, tienda falsa con pago por monedero electronico por adelantado, y estafa de resenas automatizadas coordinadas (astroturfing).
- Salida de probabilidades calibradas (segun el autor) sobre las tres clases, lo que permite umbralizar decisiones o priorizar casos para revision humana.
- Inferencia via `onnxruntime` en servidor y via `onnxruntime-web` (WASM) en navegador, lo que habilita despliegue en el cliente sin backend.
- Procesamiento por lotes (`batch_size` configurable) sobre vectores de 512 dimensiones.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, vision ni audio.
- Capacidades multilingues: no documentadas; el modelo opera sobre vectores numericos, por lo que el soporte idiomatico depende enteramente del pipeline de extraccion de caracteristicas que el usuario implemente.
- No dispone de modo "thinking" ni de capacidades generativas.

## Casos de uso

- Moderacion de marketplaces y grupos de compraventa: clasificar paginas de vendedores en Facebook o Instagram como legitimas o fraudulentas antes de permitir su publicacion, usando el vector de 512 caracteristicas generado a partir del texto de la pagina, el metodo de pago declarado y el historial de resenas.
- Filtro previo en pasarelas de pago o wallets: marcar transacciones o comercios con probabilidad alta de `upfront_wallet_fake_store` para revision manual o bloqueo preventivo, aprovechando la salida probabilistica para fijar umbrales de riesgo.
- Deteccion de anillos de resenas automatizadas: analizar lotes de resenas de un mismo producto o vendedor y clasificar el conjunto como `astroturfed_bot_review_scam` cuando las caracteristicas agregadas (similitud textual, temporalidad, perfiles) apunten a coordinacion.
- Extension de navegador para proteccion del consumidor: el soporte de `onnxruntime-web` WASM permite ejecutar el clasificador localmente en el navegador del usuario y mostrar una advertencia al visitar una tienda sospechosa, sin enviar datos a un servidor.
- Analisis forense y periodismo de datos: procesar un corpus de paginas de comercio electronico y generar un ranking de riesgo por comerciante para investigaciones sobre fraude al consumidor.
- Enriquecimiento de pipelines antifraude existentes: usar la salida de tres clases como feature adicional en un modelo de scoring de fraude de mayor alcance, combinando la senal del clasificador con reglas de negocio y datos transaccionales.
- Investigacion academica sobre astroturfing: servir como linea base reproducible (licencia MIT, formato ONNX portable) para comparar tecnicas de deteccion de resenas falsas, siempre que se documente el pipeline de caracteristicas empleado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente declara una "Calibration Accuracy" del 100,00 %, sin especificar el conjunto de evaluacion, el tamano de la muestra ni la metodologia de calculo, por lo que no se presenta como benchmark comparable.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 0,0 GB y no se documenta el tamano del grafo ONNX ni el numero de parametros; por la forma de la entrada (`[batch_size, 512]`) y la salida de tres clases, es probable que el modelo sea de muy pequeno tamano, pero no puede confirmarse.
- GPU recomendadas: no disponible. Un clasificador de este tipo suele ejecutarse satisfactoriamente en CPU; no se documentan requisitos de GPU.
- Compatibilidad con GPU de consumo: no confirmada; previsiblemente irrelevante dado el reducido perfil de entrada, pero no verificado.
- Opciones de despliegue: `onnxruntime` (Python, C++, C#, Java) y `onnxruntime-web` con backend WASM para navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (clasificadores ONNX de deteccion de fraude en comercio electronico) ni datos de rendimiento que permitan establecer una comparacion objetiva.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre arquitectura, datos de entrenamiento y pipeline de extraccion de caracteristicas: sin el preprocesado exacto que produce el vector de 512 dimensiones, el modelo no es reproducible fuera del entorno del autor.
- La cifra de "Calibration Accuracy: 100,00 %" carece de metodologia y conjunto de evaluacion; no debe tomarse como evidencia de rendimiento real ni de generalizacion.
- Riesgo de sesgo y de falsos positivos: un clasificador que marca tiendas por metodo de pago (monedero electronico por adelantado) puede penalizar practicas legitimas en determinadas regiones o sectores.
- Riesgo de deriva (drift): las tacticas de fraude evolucionan; sin reentrenamiento documentado, la utilidad del modelo puede degradarse con el tiempo.
- Idiomas soportados no documentados: el rendimiento en espanol o en mercados no cubiertos por los datos originales es desconocido.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso, validacion independiente ni mantenimiento por parte de terceros.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias; la responsabilidad legal de decisiones automatizadas (bloqueo de comercios, denuncias) recae en el integrador.
- No apto como modelo generativo ni para tareas de razonamiento, codigo o vision.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-ECommerce-FakeStore-ReviewFraud-ONNX
- Plataforma forense del autor: https://detector.elnemer-ai.com
- Portal corporativo: https://elnemer-ai.com
