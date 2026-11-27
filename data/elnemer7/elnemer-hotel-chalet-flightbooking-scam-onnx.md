# elnemer7/ElNeMeR-Hotel-Chalet-FlightBooking-Scam-ONNX

## Resumen

ElNeMeR-Hotel-Chalet-FlightBooking-Scam-ONNX es un clasificador binario-multiclase exportado a formato ONNX, publicado por el autor elnemer7 (Eng. Mahmoud ElNemer, ElNeMeR Digital Solutions & AI) dentro de una supuesta flota de 50 modelos de IA forense y humanitaria. El modelo se presenta como una herramienta de deteccion de fraude en el sector turistico: paginas clonadas de chalets en la costa norte del mar Rojo, promociones falsas de hoteles de cinco estrellas que exigen transferencias a monederos personales y billetes de avion con codigos PNR inexistentes.

La relevancia practica del artefacto es muy limitada tal y como esta publicado. El repositorio tiene un tamano de 0.0 GB, cero descargas y cero likes, y la model card no documenta arquitectura, datos de entrenamiento, tokenizador ni procedencia de los pesos. La unica especificacion tecnica concreta es el contrato de entrada: un tensor `features` de tipo `float32` con forma `[batch_size, 512]`, lo que sugiere un clasificador tabular o un extractor de caracteristicas de 512 dimensiones, no un modelo de lenguaje generativo.

El modelo se distribuye bajo licencia MIT y esta etiquetado con categorias como `humanitarian-ai`, `digital-forensics`, `travel-scam` y `booking-fraud`. No dispone de pipeline declarado en Hugging Face ni de idiomas documentados, por lo que su evaluacion independiente resulta imposible sin acceso a los ficheros de pesos y a la funcion de preprocesado que genera el vector de 512 dimensiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador con entrada `float32 [batch_size, 512]`; arquitectura interna no documentada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se declara como MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto; entrada de vector fijo de 512 dimensiones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 14; compatible con `onnxruntime` y `onnxruntime-web` WASM) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo. La model card unicamente especifica el contrato de inferencia: una entrada denominada `features` de tipo `float32` y forma `[batch_size, 512]`, y una salida de probabilidades sobre tres clases (`verified_travel_booking`, `fake_chalet_hotel_wallet_trap`, `bogus_airline_pnr_ticket_scam`). El formato de exportacion es ONNX con opset 14, lo que permite su ejecucion en `onnxruntime` nativo y en `onnxruntime-web` mediante WebAssembly, es decir, en navegador.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La afirmacion de la model card de una "Calibration Accuracy" del 100,00 % no viene acompanada de conjunto de validacion, particion, metrica detallada ni metodologia, por lo que no es verificable ni debe tomarse como evidencia de rendimiento real. Tampoco se documenta la funcion de extraccion de caracteristicas que transforma una pagina web o un billete en el vector de 512 dimensiones de entrada.

## Capacidades

- Clasificacion de contenido en tres clases: reserva verificada, trampa de monedero en falso chalet u hotel, y billete PNR falso.
- Inferencia sobre vectores de caracteristicas precalculados de 512 dimensiones; no procesa texto ni imagenes de forma nativa.
- Ejecucion en navegador mediante `onnxruntime-web` (WASM) y en servidor mediante `onnxruntime`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues.
- No dispone de modo de razonamiento (thinking), vision ni audio.
- No se declara soporte de generacion de texto.

## Casos de uso

- Filtrado de anuncios de alquiler vacacional en portales clasificados: el clasificador recibe un vector de caracteristicas de la pagina y marca los anuncios con probabilidad alta en la clase `fake_chalet_hotel_wallet_trap`, utiles para revision manual por parte del equipo de confianza y seguridad.
- Deteccion de promociones hoteleras con pago a monedero personal: integrado en un pipeline de moderacion que extrae caracteristicas del texto y los metadatos de la oferta y consulta el modelo antes de publicar.
- Verificacion de billetes de avion con PNR sospechoso: clasificacion de la clase `bogus_airline_pnr_ticket_scam` para priorizar la comprobacion contra las APIs de las aerolineas.
- Modulo de aviso en el navegador: al estar exportado a ONNX y ser compatible con WASM, puede ejecutarse en el cliente para mostrar una advertencia al usuario antes de completar una transferencia.
- Triaje en equipos de fraude de agencias de viaje: puntuacion automatica de reservas entrantes para derivar solo los casos de mayor riesgo a analistas humanos.
- Generacion de senales para modelos de risk scoring: la probabilidad de cada clase puede incorporarse como feature adicional en un sistema antifraude mas amplio.
- Investigacion forense digital: uso como linea base reproducible en estudios sobre fraude turistico, siempre que se documente y valide el pipeline de extraccion de caracteristicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica cifra aportada por el autor es una "Calibration Accuracy" del 100,00 %, sin conjunto de validacion, tamano de muestra ni metodologia, por lo que no constituye un benchmark verificable.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB y la arquitectura no esta documentada, por lo que no puede estimarse con rigor.
- GPU recomendadas: no disponible; por el formato ONNX y el tamano del repositorio, es probable que la inferencia sea viable en CPU, pero no hay datos que lo confirmen.
- Compatibilidad con GPU de consumo: no confirmada; el modelo esta pensado para ejecutarse con `onnxruntime` y `onnxruntime-web` (WASM), lo que sugiere despliegue en CPU o navegador.
- Opciones de despliegue: `onnxruntime` (Python, C++, C#), `onnxruntime-web` (WASM) y cualquier runtime compatible con ONNX opset 14.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de clasificacion de fraude turistico con el mismo contrato de entrada y formato de distribucion.

## Limitaciones y advertencias

- La model card no documenta arquitectura, datos de entrenamiento, tokenizador ni procedencia de los pesos; la reproducibilidad es nula sin esa informacion.
- La cifra de "Calibration Accuracy" del 100,00 % no es verificable y no debe usarse como criterio de seleccion en produccion.
- El modelo no procesa texto ni imagenes de forma nativa: requiere un pipeline externo de extraccion de caracteristicas de 512 dimensiones que no se distribuye ni se documenta.
- Riesgo de alucinacion no aplicable en sentido generativo, pero si riesgo de falsos positivos y falsos negativos sin datos de validacion publicados.
- Sesgos conocidos: no disponibles; el dataset de entrenamiento no se describe, por lo que no puede evaluarse el sesgo geografico ni linguistico (el dominio declarado es Egipto y el mar Rojo).
- Restricciones de licencia: MIT permite uso comercial, modificacion y redistribucion con atribucion; no se identifican clausulas adicionales en la informacion disponible.
- El repositorio tiene cero descargas y cero likes, y fue creado y actualizado con tres segundos de diferencia, lo que sugiere una publicacion automatizada sin validacion externa.
- Las referencias a una "flota de 50 modelos" y a un sello de verificacion del autor no constituyen evidencia tecnica independiente.
- No debe desplegarse en produccion sin una evaluacion propia sobre un conjunto de datos etiquetado y representativo del trafico real.

## Enlaces

- Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-Hotel-Chalet-FlightBooking-Scam-ONNX
- Plataforma forense del autor: https://detector.elnemer-ai.com
- Portal corporativo: https://elnemer-ai.com
- Contacto declarado por el autor: WhatsApp/telefono +20 150 755 9911
