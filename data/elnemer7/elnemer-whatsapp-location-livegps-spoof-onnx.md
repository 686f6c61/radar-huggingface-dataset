# elnemer7/ElNeMeR-WhatsApp-Location-LiveGPS-Spoof-ONNX

## Resumen

ElNeMeR-WhatsApp-Location-LiveGPS-Spoof-ONNX es un clasificador binario-multiclase empaquetado en formato ONNX, desarrollado por el ingeniero Mahmoud ElNemer (ElNeMeR Digital Solutions & AI) y publicado bajo licencia MIT. Forma parte de una flota declarada de 60 modelos orientados a forense digital y ayuda humanitaria (version v17.0). El modelo aborda un problema concreto: detectar capturas de pantalla de ubicacion en vivo manipuladas, es decir, imagenes de mapas con pines falsos generadas mediante emuladores de GPS o superposiciones de mapas recortadas, que se emplean en fraudes de reparto y engaños con fines de captacion.

El modelo no es un transformer de lenguaje ni un modelo generativo: es un clasificador tabular que consume un tensor de caracteristicas (`gps_spoof_features`) de 20 dimensiones en `float32` y devuelve probabilidades sobre tres clases (captura autentica de pin de mapa, superposicion de emulador de GPS falso y captura de mapa de encuentro de reparto recortada). Su relevancia actual reside en el nicho: la verificacion forense de ubicaciones compartidas por mensajeria es un vector de fraude poco cubierto por modelos generalistas.

La informacion publicada es muy limitada: el repositorio ocupa 0.0 GB, no declara pipeline, no especifica idiomas y no incluye datos de arquitectura interna, parametros ni dataset de entrenamiento. La unica metrica declarada es una "calibration accuracy" del 94,88 %, sin detalle del conjunto de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador tabular empaquetado en ONNX, opset 14) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de vector fijo de 20 caracteristicas) |
| Tipos de cuantizacion | no disponible (pesos ONNX en float32 segun el tensor de entrada declarado) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 14), compatible con onnxruntime y onnxruntime-web WASM |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo (tipo de red, numero de capas, dimensiones ocultas ni funcion de activacion). Lo unico verificable es la interfaz de inferencia: una entrada `float32` con forma `[batch_size, 20]` denominada `gps_spoof_features` y una salida de probabilidades sobre tres clases. El empaquetado en ONNX opset 14 permite ejecucion tanto en `onnxruntime` nativo como en `onnxruntime-web` mediante WASM, lo que sugiere un diseno orientado a despliegue ligero en navegador o en el borde.

Tampoco se detallan los datos de entrenamiento: no hay numero de muestras, composicion del dataset, proceso de anotacion ni si se aplicaron tecnicas de ajuste fino, calibracion post-entrenamiento o aumentacion de datos. La unica referencia a calibracion es la cifra del 94,88 % de "calibration accuracy", sin especificar el conjunto de validacion, el equilibrio de clases ni la metrica exacta (exactitud global, F1 macro u otra). No se debe interpretar esa cifra como rendimiento generalizado sin esa informacion.

## Capacidades

- Clasificacion de capturas de ubicacion en tres clases: `authentic_map_pin_capture`, `mock_gps_emulator_overlay` y `spliced_delivery_meetup_map_screenshot`.
- Procesamiento por lotes: el tensor de entrada admite `batch_size` variable.
- Inferencia en navegador mediante `onnxruntime-web` (WASM), lo que habilita su uso en aplicaciones cliente sin backend dedicado.
- Inferencia en servidor mediante `onnxruntime` estandar.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision ni audio: es un clasificador tabular, no un modelo generativo.
- No se declara soporte de tool calling, function calling ni comportamiento agentico.
- No se declaran capacidades multilingues ni procesamiento de lenguaje natural.

## Casos de uso

- Verificacion de capturas de ubicacion en vivo en apps de mensajeria: el modelo recibe las 20 caracteristicas extraidas de la captura y devuelve la probabilidad de que sea una superposicion de emulador de GPS, lo que permite marcar conversaciones sospechosas antes de un encuentro.
- Prevencion de fraude en reparto: una plataforma de logistica puede puntuar las capturas de "mapa de encuentro" enviadas por repartidores o clientes y rechazar automaticamente las que el modelo clasifique como `spliced_delivery_meetup_map_screenshot`.
- Proteccion de familias y personas vulnerables: integrado en un flujo de revision de mensajes, alerta cuando una captura de ubicacion presenta indicios de manipulacion, como parte de una estrategia de seguridad personal.
- Forense digital en investigacion de incidentes: analisis por lotes de capturas recopiladas en una investigacion para priorizar las que requieren inspeccion manual, usando la salida de probabilidades como criterio de triaje.
- Moderacion en marketplaces de segunda mano: verificacion de las ubicaciones compartidas en negociaciones de entrega presencial para reducir estafas con puntos de encuentro falsos.
- Despliegue en el navegador como herramienta de autodefensa: gracias al formato ONNX y a `onnxruntime-web`, el clasificador puede ejecutarse localmente en el cliente sin enviar la captura a un servidor, lo que preserva la privacidad del usuario.
- Filtro previo en pipelines de analisis de imagenes: al ser un modelo ligero, puede actuar como primera etapa que descarta capturas claramente autenticas antes de pasar a un analisis forense mas costoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica cifra declarada por el autor es una "calibration accuracy" del 94,88 %, sin especificar el conjunto de evaluacion, la metrica exacta ni la comparacion con lineas base.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0.0 GB y la entrada es un vector de 20 `float32`, por lo que el modelo es presumiblemente muy ligero, pero no se publica el tamano real de los pesos.
- GPU recomendadas: no disponible; por la naturaleza del modelo, la inferencia en CPU es probablemente suficiente, pero no hay datos oficiales.
- Compatibilidad con GPU de consumo: no confirmada; el modelo esta pensado para `onnxruntime` y `onnxruntime-web`, lo que sugiere ejecucion en CPU o en navegador.
- Opciones de despliegue: `onnxruntime` (nativo) y `onnxruntime-web` (WASM). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (deteccion forense de capturas de ubicacion falsificadas) con los que establecer una comparacion de parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- La unica metrica de rendimiento es una "calibration accuracy" del 94,88 % sin metodologia publicada; no debe tomarse como garantia de generalizacion.
- No se documenta el dataset de entrenamiento, por lo que se desconoce el sesgo respecto a fabricantes de dispositivos, versiones de aplicaciones de mapas, resoluciones de pantalla o regiones geograficas.
- El modelo clasifica caracteristicas preextraidas, no imagenes en bruto; su rendimiento depende por completo del extractor de caracteristicas que genere el vector de 20 dimensiones, que no se documenta en la model card.
- Riesgo de falsos positivos y falsos negativos no cuantificado; en un contexto de acusacion de fraude, las decisiones automatizadas deben ir acompanadas de revision humana.
- No hay informacion sobre el equilibrio de clases ni sobre el comportamiento ante capturas atipicas (idiomas de mapa distintos, modos oscuros, recortes no estandar).
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo se publica como parte de una flota con fines declarados de ayuda humanitaria y forense.
- El repositorio no tiene descargas ni likes y fue creado y actualizado en el mismo instante, lo que indica una publicacion muy reciente y sin validacion externa por parte de la comunidad.
- No dispone de pipeline declarado en Hugging Face, por lo que no puede cargarse con `transformers` de forma estandar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-WhatsApp-Location-LiveGPS-Spoof-ONNX
- Plataforma forense del autor: https://detector.elnemer-ai.com
- Portal corporativo del autor: https://elnemer-ai.com
