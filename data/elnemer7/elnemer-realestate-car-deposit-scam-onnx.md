# elnemer7/ElNeMeR-RealEstate-Car-Deposit-Scam-ONNX

## Resumen

ElNeMeR Real-Estate, Car & Marketplace Advance-Deposit Scam Detector es un modelo ONNX publicado por el ingeniero Mahmoud ElNemer (ElNeMeR Digital Solutions & AI) dentro de una flota de 25 modelos orientados a IA humanitaria y forense digital. El modelo resuelve una tarea de clasificacion de tres clases sobre anuncios de marketplace: distingue entre anuncios normales, trampas de deposito urgente fraudulento y clones de anuncios robados. Es relevante en el contexto de proteccion al consumidor y forense digital, ya que automatiza la deteccion de un patron de fraude muy comun en plataformas de compraventa de segunda mano (vivienda, coches y telefonos) en las que se exige un pago anticipado por transferencia movil.

La informacion disponible es muy escasa: la model card no especifica arquitectura interna, numero de parametros, longitud de contexto ni idiomas soportados. Se trata de un artefacto ONNX con un tensor de entrada fijo de 512 dimensiones de tipo float32 y salida de probabilidades sobre tres clases, lo que sugiere un clasificador tabular o un encoder ligero que consume un vector de caracteristicas previamente extraido, no un modelo generativo de lenguaje. El repositorio ocupa 0.0 GB y no registra descargas ni interacciones en Hugging Face.

El modelo se publica bajo licencia MIT y se distribuye en formato ONNX (opset 14), lo que permite ejecucion tanto en `onnxruntime` como en `onnxruntime-web` mediante WASM, es decir, en navegador o en entornos sin GPU. La model card declara una "calibracion" del 100,00 %, dato que debe interpretarse con cautela porque no se aporta informacion sobre el conjunto de evaluacion, el metodo de calibracion ni la separacion entre entrenamiento y prueba.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador ONNX de 3 clases, sin arquitectura declarada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada fija de `[batch_size, 512]` float32) |
| Tipos de cuantizacion | no disponible (distribucion ONNX opset 14; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 14), compatible con `onnxruntime` y `onnxruntime-web` WASM |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. La model card unicamente describe la interfaz de inferencia: un tensor de entrada llamado `features` de tipo `float32` con forma `[batch_size, 512]` y una salida `probabilities` sobre tres clases (`0`: `normal_marketplace_listing`, `1`: `fake_urgent_deposit_trap`, `2`: `stolen_listing_clone`). El hecho de que la entrada sea un vector fijo de 512 dimensiones indica que el modelo no procesa texto en bruto directamente, sino caracteristicas ya vectorizadas por un pipeline externo que no se documenta.

Tampoco se especifican el volumen de datos de entrenamiento, la composicion del dataset, si se aplicaron tecnicas de RLHF, DPO o ajuste fino supervisado, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La unica metrica declarada es una "calibration accuracy" del 100,00 %, sin definicion metodologica ni conjunto de validacion identificado, por lo que no es verificable de forma independiente.

## Capacidades

- Clasificacion de anuncios de marketplace en tres categorias: anuncio normal, trampa de deposito urgente fraudulento y clon de anuncio robado.
- Deteccion de patrones de fraude por pago anticipado (arabun de reserva) mediante monederos moviles en anuncios de vivienda, coches y telefonos.
- Inferencia en navegador o en entornos sin GPU gracias a la compatibilidad con `onnxruntime-web` WASM.
- Procesamiento por lotes (`batch_size` configurable) sobre vectores de caracteristicas de 512 dimensiones.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- No se documenta capacidad multilingue; los idiomas soportados figuran como no disponibles.

## Casos de uso

- Moderacion automatica en plataformas de anuncios clasificados: integrar el modelo en el pipeline de publicacion para marcar anuncios con patron de deposito urgente antes de que lleguen a los usuarios, usando el vector de caracteristicas de 512 dimensiones que ya genera el sistema de la plataforma.
- Filtro previo en aplicaciones de compraventa de coches de segunda mano: detectar anuncios que exigen transferencia movil anticipada por un vehiculo a precio anormalmente bajo y derivarlos a revision humana.
- Proteccion al consumidor en portales inmobiliarios: clasificar listados de alquiler con urgencia artificial y exigencia de arabun, reduciendo el riesgo de estafa en alquileres vacacionales o de corta estancia.
- Forense digital y analisis de denuncias: procesar lotes de anuncios reportados por usuarios y priorizar los casos etiquetados como `fake_urgent_deposit_trap` o `stolen_listing_clone` para investigacion.
- Extension de navegador o widget web: ejecutar el modelo en el cliente mediante `onnxruntime-web` WASM para advertir al usuario en tiempo real mientras navega por un marketplace.
- Investigacion academica sobre fraude en marketplaces: usar el clasificador como linea base reproducible (licencia MIT, formato ONNX) en estudios sobre deteccion de estafas con pago anticipado.
- Deteccion de clones de anuncios: identificar listados duplicados o robados de vendedores legitimos comparando la salida de clase 2 en flujos de revision de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica declarada por el autor es una "calibration accuracy" del 100,00 %, sin metodologia, conjunto de datos ni comparacion con alternativas, por lo que no se presenta como benchmark verificable.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB, lo que sugiere un artefacto de muy pocos megabytes compatible con CPU.
- GPU recomendadas: no se requiere GPU; el modelo esta pensado para `onnxruntime` en CPU y `onnxruntime-web` en navegador.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU (CPU, navegador, dispositivos embebidos), aunque no se publican requisitos oficiales.
- Opciones de despliegue: `onnxruntime` (Python, C++, C#), `onnxruntime-web` (WASM en navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (clasificadores ONNX de fraude en marketplaces) con parametros, contexto o rendimiento documentados.

## Limitaciones y advertencias

- Informacion tecnica minima: no se documentan arquitectura, parametros, datos de entrenamiento ni proceso de evaluacion, lo que impide auditar el comportamiento del modelo.
- La cifra de "calibration accuracy" del 100,00 % no es verificable y no deberia tomarse como garantia de rendimiento en produccion.
- Entrada restringida a un vector de 512 dimensiones: el modelo no procesa texto en bruto, por lo que depende de un pipeline de extraccion de caracteristicas externo no documentado; un desajuste en ese pipeline degradaria las predicciones.
- Idiomas soportados no disponibles: no puede confirmarse el rendimiento en castellano ni en otros idiomas distintos del contexto de entrenamiento original.
- Riesgo de sesgo y de falsos positivos/negativos no evaluado: no se publican matrices de confusion, curvas ROC ni analisis por subgrupos.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero el autor no ofrece garantias ni soporte; conviene conservar el aviso de copyright.
- Al tratarse de un modelo de un autor individual con cero descargas y sin pipeline declarado en Hugging Face, la madurez y el mantenimiento del artefacto no estan contrastados.
- No debe usarse como unico mecanismo de decision en casos con consecuencias legales o economicas para el usuario; se recomienda supervision humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-RealEstate-Car-Deposit-Scam-ONNX
- Plataforma forense humanitaria: https://detector.elnemer-ai.com
- Portal corporativo: https://elnemer-ai.com
