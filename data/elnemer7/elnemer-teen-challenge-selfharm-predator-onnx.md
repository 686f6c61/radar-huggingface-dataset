# elnemer7/ElNeMeR-Teen-Challenge-SelfHarm-Predator-ONNX

## Resumen

ElNeMeR-Teen-Challenge-SelfHarm-Predator-ONNX es un clasificador binario-multiclase exportado a formato ONNX, publicado por el autor elnemer7 (Eng. Mahmoud ElNemer, ElNeMeR Digital Solutions & AI) bajo licencia MIT. Forma parte de una flota declarada de 50 modelos orientados a IA humanitaria y forense digital, y su proposito concreto es la deteccion temprana de retos virales peligrosos ("midnight dare challenges"), practicas de asfixia y abuso psicologico coercitivo en conversaciones de menores.

El modelo recibe un tensor de caracteristicas `features` de tipo `float32` con forma `[batch_size, 512]` y devuelve probabilidades sobre tres clases: actividad juvenil saludable, reto letal o desafio de medianoche, y abuso psicologico coercitivo con componente de autolesion. Se distribuye exclusivamente como grafo ONNX con opset 14, compatible con `onnxruntime` y `onnxruntime-web` (WASM), lo que permite despliegue en navegador o en entornos sin GPU.

La relevancia del modelo es acotada y debe interpretarse con cautela: el repositorio tiene 0 GB de tamano declarado, 0 descargas y 0 likes en el momento de la consulta, y la model card no documenta arquitectura de red, datos de entrenamiento, tokenizador ni procedimiento de evaluacion. La unica metrica reportada es una "Calibration Accuracy" del 100,00 %, cifra que no viene acompanada de definicion de conjunto de validacion ni de metodologia, por lo que no debe tomarse como evidencia de rendimiento en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (grafo ONNX; la model card no describe la red subyacente) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible (la entrada es un vector de 512 caracteristicas, no una secuencia de tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 14) |

Especificaciones adicionales declaradas:

| Parametro | Valor |
|---|---|
| Entrada | tensor `features`, `float32`, `[batch_size, 512]` |
| Salida | `probabilities` sobre 3 clases |
| Clases | 0: `healthy_youth_activity`; 1: `lethal_dare_midnight_challenge`; 2: `coercive_selfharm_psychological_abuse` |
| Runtime | `onnxruntime`, `onnxruntime-web` (WASM) |
| Tamano del repositorio | 0,0 GB (segun Hugging Face) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. El unico dato estructural es la interfaz de inferencia: un vector de 512 dimensiones en `float32` que se transforma en un vector de probabilidades de tres clases. Esto es compatible con un cabezal de clasificacion sobre caracteristicas preextraidas (por ejemplo, embeddings de un modelo previo o descriptores estadisticos de la conversacion), pero la model card no especifica que extractor genera esas 512 dimensiones ni si el grafo incluye parte del procesamiento de texto.

Tampoco se documentan el volumen ni la composicion del corpus de entrenamiento, la presencia de RLHF, DPO o ajuste supervisado, ni el procedimiento de calibracion que respalda la cifra del 100,00 %. No hay informacion sobre el opset mas alla del 14, ni sobre optimizaciones del grafo (fusion de operadores, cuantizacion post-entrenamiento, poda). Cualquier afirmacion sobre innovaciones tecnicas seria especulativa y no se incluye.

## Capacidades

- Clasificacion de contenido conversacional en tres categorias predefinidas relacionadas con seguridad de menores.
- Deteccion de retos virales peligrosos y practicas de asfixia o "midnight challenges".
- Deteccion de abuso psicologico coercitivo con indicios de autolesion.
- Discriminacion frente a actividad juvenil considerada saludable (clase 0).
- Inferencia en navegador mediante `onnxruntime-web` con backend WASM, sin dependencia de GPU.
- Procesamiento por lotes (`batch_size` configurable en el tensor de entrada).
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- No se declara capacidad multilingue; los idiomas soportados figuran como no disponibles.

## Casos de uso

- Moderacion de chats en plataformas juveniles: el clasificador puede puntuar cada mensaje o ventana de conversacion y elevar una alerta cuando la probabilidad de la clase 1 o 2 supera un umbral configurable, integrandose en el pipeline de moderacion existente mediante `onnxruntime`.
- Aviso temprano a tutores: en aplicaciones de mensajeria supervisada, el modelo puede ejecutarse en el propio dispositivo con `onnxruntime-web` y notificar a la familia ante patrones de reto peligroso, sin enviar el contenido a un servidor.
- Triaje en lineas de ayuda a menores: uso como primera capa de filtrado para priorizar conversaciones que requieren intervencion humana de un psicologo o trabajador social.
- Forense digital en investigaciones: clasificacion masiva de historiales de chat incautados para localizar segmentos de coercion o incitacion a la autolesion que merezcan revision pericial.
- Filtrado previo en foros y comunidades de videojuegos: deteccion de hilos donde se propagan "dares" peligrosos para su retirada o despublicacion automatica.
- Investigacion academica sobre dinamicas de coercion entre iguales: etiquetado asistido de corpus anotados, siempre con validacion humana y supervision etica.
- Integracion en SDK de control parental: el grafo ONNX de bajo peso encaja en aplicaciones de escritorio o moviles que ya dispongan del extractor de caracteristicas de 512 dimensiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica declarada es una "Calibration Accuracy" del 100,00 %, sin definicion del conjunto de evaluacion, tamano de muestra ni metodologia, por lo que no se presenta como resultado comparable.

| Metrica | Valor | Observaciones |
|---|---|---|
| Calibration Accuracy | 100,00 % | Cifra declarada por el autor; sin metodologia ni conjunto de validacion documentado |
| MMLU / HumanEval / GSM8K | no disponible | No aplicables a un clasificador de este tipo |
| Descargas / likes | 0 / 0 | Indicador de adopcion nula en el momento de la consulta |

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio figura con 0,0 GB y la entrada es un vector de 512 `float32` (2 KB por muestra), por lo que el grafo es presumiblemente muy ligero, pero no se publica el tamano real del archivo `.onnx`.
- GPU recomendadas: no disponibles. Por la naturaleza del artefacto (ONNX opset 14, compatible con WASM), el despliegue tipico es en CPU.
- Compatibilidad con GPU de consumo: previsiblemente si en cualquier GPU con soporte de `onnxruntime` (CUDA o DirectML), aunque no hay datos de rendimiento que lo confirmen.
- Opciones de despliegue: `onnxruntime` (Python, C++, C#), `onnxruntime-web` con backend WASM en navegador, y servidores de inferencia compatibles con ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de la misma categoria (clasificadores ONNX de seguridad de menores) en la documentacion proporcionada. Se indica "no disponible".

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| ElNeMeR-Teen-Challenge-SelfHarm-Predator-ONNX | no disponible | no aplica (vector de 512) | MIT | ONNX | Hugging Face, 0 descargas |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de documentacion metodologica: no se especifica arquitectura, datos de entrenamiento, tokenizador ni procedimiento de evaluacion, lo que impide auditar el modelo.
- La cifra de "Calibration Accuracy" del 100,00 % es altamente sospechosa sin conjunto de validacion descrito; no debe usarse como garantia de fiabilidad.
- Riesgo elevado de falsos positivos y falsos negativos en un dominio sensible como la seguridad de menores; cualquier despliegue debe incluir revision humana obligatoria.
- El modelo clasifica a partir de un vector de 512 caracteristicas cuyo origen no se documenta; sin el extractor compatible, el grafo es inutilizable.
- No se declaran idiomas soportados, por lo que se desconoce su comportamiento fuera del idioma o idiomas de entrenamiento.
- Sesgos desconocidos: al no publicarse la composicion del corpus, no es posible evaluar sesgos culturales, de genero o de registro linguistico.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias ni asume responsabilidad sobre el uso en contextos de crisis.
- Advertencia etica: un clasificador de autolesion y coercion no sustituye la intervencion de profesionales de salud mental ni de servicios de emergencia; su uso como unico mecanismo de decision es inaceptable.
- Repositorio sin adopcion (0 descargas, 0 likes) y con fecha de creacion futura respecto a la consulta, lo que impide verificar su mantenimiento o soporte.
- La model card incluye datos de contacto comercial y enlaces a portales corporativos; deben tratarse como informacion promocional, no como aval tecnico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-Teen-Challenge-SelfHarm-Predator-ONNX
- Plataforma forense humanitaria del autor: https://detector.elnemer-ai.com
- Portal corporativo: https://elnemer-ai.com
- Repositorio de la flota de 50 modelos: no disponible
- Paper o publicacion tecnica: no disponible
- Demo interactiva: no disponible
