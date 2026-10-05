# callmefattyy/wifi-densepose-pretrained

## Resumen

RuView (publicado en HuggingFace como `callmefattyy/wifi-densepose-pretrained`) es una familia de modelos de "sensing" por WiFi desarrollada por el autor `callmefattyy` dentro del ecosistema RuView (repositorio `ruvnet/RuView`). El objetivo es convertir las variaciones del canal de radio (CSI, Channel State Information) capturadas por un chip ESP32 de bajo coste en informacion espacial: detectar presencia, medir frecuencia respiratoria y cardiaca, clasificar movimiento y calidad del sueno, contar personas y detectar caidas, todo ello sin camaras y atravesando tabiques de pladur, madera o tela.

El componente central descrito es un encoder auto-supervisado (no un modelo de lenguaje) que transforma caracteristicas CSI de 8 dimensiones en un embedding L2-normalizado de 128 dimensiones. Se trata de una red de 2 capas fully-connected (BatchNorm + GELU) con 9.280 parametros, entrenada con un objetivo InfoNCE. El repositorio incluye ademas ficheros de pesos en `safetensors`, versiones cuantizadas (`model-q2/q4/q8.bin`), cabezas de tarea (`presence-head.json`) y metadatos de nodos.

Es relevante ahora porque el autor ha publicado una correccion publica de sus propias metricas: la version v1 anunciaba un "100% de precision de presencia" que resulto medirse sobre una grabacion de una sola clase (6.062 de 6.063 frames etiquetados como "presente"), por lo que un predictor constante obtendria un 99,98%. La v2 sustituye esa cifra por una metrica honesta, sin etiquetas y con separacion temporal (temporal-triplet accuracy = 82,3%).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder auto-supervisado de 2 capas fully-connected (BatchNorm + GELU) que produce embeddings L2-normalizados de 128 dimensiones; el tag del repositorio menciona tambien "spiking-neural-network", no descrito en la model card |
| Parametros totales | 9.280 (encoder `csi-embed-v2`); el resto de ficheros del repo no detallan recuento |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre ventanas de senal CSI) |
| Tipos de cuantizacion | q2, q4 y q8 (ficheros `model-q2.bin`, `model-q4.bin`, `model-q8.bin`) |
| Idiomas soportados | en (segun la model card); la tarea es de sensing, la lengua solo afecta a la documentacion |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), ONNX / onnxruntime, y binarios cuantizados `.bin`; tambien JSON auxiliares (`presence-head.json`, `node-1/2.json`, `config.json`, `training-metrics.json`) |

## Arquitectura y entrenamiento

La arquitectura descrita en la v2 es deliberadamente ligera: un codificador `8 -> 64 -> 128` con dos capas fully-connected, BatchNorm y activacion GELU, que termina en un embedding de 128 dimensiones normalizado con L2. El entrenamiento usa el objetivo contrastivo InfoNCE con temperatura 0,1, negativos in-batch y negativos temporalmente lejanos (>30 s), optimizador AdamW y 60 epocas. Los positivos temporales se definen como capturas separadas por menos de 2 segundos, y la particion de datos es temporal y disjunta (80/20): el ultimo 20% de la grabacion, ordenado por tiempo, no se usa en entrenamiento. La captura de referencia citada es `data/recordings/overnight-1775217646.csi.jsonl`.

Como proteccion frente al olvido catastrofico se aplica EWC (Elastic Weight Consolidation) con informacion de Fisher y fuerza de proteccion 2000 sobre cuatro tareas protegidas; el propio autor reconoce una tasa de olvido medida del 32,97%, es decir, no es "olvido resuelto". La model card tambien documenta una correccion (v2.0.1, fechada el 2026-09-09) de un bug en `scripts/train-ruvllm.js`: la `lossHistory` y `contrastive.durationMs` exportadas provenian de una pasada base desconectada que calculaba la perdida sin actualizar el encoder, por lo que publicaban una curva plana en torno a 0,1352. Tras el arreglo, la curva real desciende de 0,1037 a 0,0654 en 20 epocas y la duracion real del bucle de gradiente es de unos 40 s. El fix no altero `finalLoss`, `improvement` ni el 82,3% de exactitud temporal.

## Capacidades

- Deteccion de presencia: determina si hay alguien en la estancia (la cifra "100%" de la v1 fue retractada publicamente).
- Clasificacion de movimiento: distingue teclear, caminar o estar de pie.
- Frecuencia respiratoria: rango de 6 a 30 BPM, sin contacto.
- Frecuencia cardiaca: rango de 40 a 120 BPM, a traves de la ropa.
- Conteo de personas: de 1 a 4, mediante analisis de grafo de subportadoras.
- Penetracion de obstaculos: funciona a traves de pladur, madera y tela (sin linea de vision).
- Clasificacion de calidad del sueno: fases Deep / Light / REM / Awake.
- Deteccion de caidas: alerta en menos de 2 segundos.
- Embedding auto-supervisado: representacion de 128 dimensiones que preserva la estructura temporal del entorno de radio.
- No dispone de: generacion de texto, tool calling, capacidades de agente, vision, audio ni razonamiento multi-paso; no es un modelo de lenguaje.

## Casos de uso

- Monitorizacion de presencia en el hogar: el encoder detecta si hay alguien en una habitacion a partir de CSI de un ESP32, sin camara ni wearable, util para automatizacion de iluminacion o climatizacion.
- Teleasistencia y deteccion de caidas: con alertas en menos de 2 segundos y funcionamiento a traves de pladur, permite vigilar a personas mayores en residencias sin dispositivos que deban llevar puestos.
- Seguimiento de vitales sin contacto en clinica o domicilio: la medicion de respiracion (6-30 BPM) y pulso (40-120 BPM) a traves de la ropa sirve para monitorizacion continua durante el sueno, evitando correas toracicas o relojes.
- Analisis del sueno: la clasificacion Deep/Light/REM/Awake permite generar informes de calidad del sueno con hardware de bajo coste, sin sensor de colchon.
- Control de aforo en espacios: el conteo de 1 a 4 personas por analisis de subportadoras posibilita estimar ocupacion en salas, aseos o zonas de acceso sin camaras de conteo.
- Despliegue en dispositivos de borde: al tener 9.280 parametros y formato ONNX con variantes q2/q4/q8, puede ejecutarse en un ESP32 o en un nodo de borde, lo que habilita sensores autonomos de bajo consumo.
- Investigacion en sensing por radio: el encoder auto-supervisado y las metricas temporales publicadas sirven como base reproducible para experimentos de representacion de CSI y aprendizaje contrastivo sobre senal de RF.

## Benchmarks y rendimiento

Metrica declarada: exactitud de triplet temporal en held-out (probabilidad de que la distancia entre ancla y positivo temporal sea menor que entre ancla y negativo temporal), evaluada sobre el ultimo 20% de la grabacion por tiempo, sin fuga hacia entrenamiento.

| Encoder | Exactitud de triplet temporal (held-out) | Notas |
|---|---|---|
| Caracteristicas crudas de 8 dimensiones | 66,4% | linea base sin encoder |
| Encoder con inicializacion aleatoria | 69,6% | sin entrenar |
| Encoder entrenado v2 | 82,3% | +15,9 puntos sobre las caracteristicas crudas |

Otras cifras publicadas: tasa de olvido EWC del 32,97% sobre cuatro tareas protegidas; `lossHistory` real de 0,1037 a 0,0654 en 20 epocas. La cifra de "100% de precision de presencia" de la v1 fue retractada expresamente por el autor al medirse sobre una grabacion de clase unica. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: minima; el encoder tiene 9.280 parametros (del orden de decenas de kilobytes en precision completa y menos aun en q2/q4/q8), por lo que cabe en practicamente cualquier dispositivo.
- GPU recomendadas: no requiere GPU. Puede ejecutarse en CPU de escritorio, en placas de borde e incluso en el propio ESP32 que captura la senal.
- Consumer GPU: si, en cualquier GPU de consumo o incluso sin GPU dedicada.
- Opciones de despliegue: onnxruntime (libreria declarada en el repositorio), pesos `safetensors`, binarios cuantizados `.bin` y cabezas de tarea en JSON; el repositorio tambien menciona un pipeline propio de entrenamiento (`scripts/train-ruvllm.js`).
- Latencia y throughput: no disponibles en la informacion proporcionada (solo se cita un tiempo de bucle de gradiente de unos 40 s para el entrenamiento, no para inferencia).

## Comparativa con modelos similares

No disponible. La busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre alternativas comparables de sensing por WiFi; los enlaces recuperados no guardan relacion con la ficha. No se dispone de datos de arquitectura, contexto, rendimiento, licencia o disponibilidad de otros modelos de la misma categoria en la informacion proporcionada, por lo que no se puede construir una comparativa fiable sin inventar datos.

## Limitaciones y advertencias

- Metrica v1 retractada: el "100% de precision de presencia" procedia de una grabacion de una sola clase (6.062 de 6.063 frames "presente"), lo que invalida cualquier conclusion sobre generalizacion.
- Olvido catastrofico no resuelto: la tasa de olvido EWC medida es del 32,97%; quien ajuste adaptadores LoRA por habitacion debe esperar deriva en tareas anteriores.
- Dependencia de una unica captura: los resultados v2 se miden sobre la grabacion `overnight-1775217646.csi.jsonl`; no hay evidencia publicada de generalizacion a otros entornos, personas o disposiciones de antenas.
- Bug de exportacion corregido: hasta la v2.0.1 la `lossHistory` y `durationMs` publicadas en `training-metrics.json` provenian de una pasada desconectada, lo que podia inducir a error a quien auditase la convergencia desde el JSON.
- Idioma: solo se declara ingles (en) en los metadatos; la documentacion y los metadatos estan en ese idioma.
- Alcance: no es un modelo de lenguaje; no genera texto, no hace tool calling ni razonamiento multi-paso.
- Ambito de sensing acotado: conteo solo hasta 4 personas, respiracion 6-30 BPM y pulso 40-120 BPM; fuera de esos rangos no hay garantia.
- Privacidad: aunque el enfoque se etiqueta como "privacy-preserving" y no usa camaras, la senal CSI puede revelar presencia, movimiento y constantes vitales, por lo que su despliegue tiene implicaciones de privacidad y posiblemente regulatorias.
- Licencia: MIT, permisiva para uso comercial, pero conviene verificar la procedencia y el consentimiento de los datos de captura subyacentes.
- Cifras de descargas e interacciones: 0 descargas y 0 likes en el momento del registro, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/callmefattyy/wifi-densepose-pretrained
- Repositorio RuView citado en la model card: https://github.com/ruvnet/RuView
- Pull request del fix v2.0.1: https://github.com/ruvnet/RuView/pull/1879
- Busqueda web: no se encontraron enlaces relevantes al modelo (los resultados recuperados no guardan relacion con la ficha y se omiten).
