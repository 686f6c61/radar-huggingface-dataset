# ruvnet/ruvector-typesafe-hwu64

## Resumen

ruvector-typesafe-hwu64 no es un modelo neuronal con pesos entrenados al uso, sino un banco de ejemplos etiquetados publicado por ruvnet para la librería `@ruvector/typesafe`. El artefacto almacena el texto de las utterances y etiquetas de partición congeladas (con hash de contenido), nunca matrices de pesos: las cabeceras de decisión (protótipos más cercanos o una sonda multinomial cuando una clase acumula ejemplos suficientes) y la calibración de temperatura se reajustan desde el banco cada vez que el motor lo carga. Se distribuye como dos ficheros JSON, `bank.json` y `questions.json`.

El problema que resuelve es la clasificación de intenciones en local, sin coste de API y sin red en la ruta de decisión, sobre el dataset HWU64 de intenciones de asistente doméstico. La model card declara 64 intenciones repartidas en 21 dominios, mientras que la tabla de exactitud reporta 68 clases; esa discrepancia no queda explicada en la documentación disponible. El banco se construyó a partir de 19.552 ejemplos etiquetados y se evalúa sobre una partición de test de 6.133 utterances.

Su interés actual es el de una alternativa de coste marginal casi nulo para enrutado de intenciones: con el encoder `bge-small-en-v1.5` mide un 79,9% de exactitud con 5 ms de latencia p50 y 7 ms p95 en régimen estable, a cambio de un ajuste inicial en la primera decisión que puede tardar minutos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica: banco de ejemplos etiquetados con cabecera reajustada en carga (protótipos más cercanos o sonda multinomial); el artefacto no contiene pesos |
| Parametros totales | no disponible (el artefacto no contiene parámetros; el encoder se aporta por separado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del encoder externo; ambos encoders incluidos son codificadores de frases en inglés) |
| Tipos de cuantizacion | no aplica (el artefacto se distribuye como JSON; la cuantización corresponde al encoder) |
| Idiomas soportados | inglés (la model card declara explícitamente «English only») |
| Licencia | cc-by-4.0 para el texto de las utterances redistribuido; el código de `@ruvector/typesafe` es MIT |
| Formato de pesos | no aplica: no hay safetensors ni GGUF; se distribuyen `bank.json` y `questions.json` |
| Dataset de origen | Bhuvaneshwari/hwu64 |
| Clases | 68 clases en la evaluación (la descripción menciona 64 intenciones en 21 dominios) |
| Ejemplos de entrenamiento | 19.552 (`splitsHash: 068e232f6f38b0c9…`) |
| Ejemplos de test | 6.133 utterances (partición `test` retenida) |
| Encoder medido | `bge-small-en-v1.5` (único encoder con número reportado) |
| Libreria | ruvector (`@ruvector/typesafe`, npm) |
| Pipeline declarado | text-classification |
| Fecha de creacion / actualizacion | 2026-09-22 (ambas, según los metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El banco es un artefacto de datos, no una red entrenada. Contiene ejemplos etiquetados y asignaciones de partición congeladas, y es independiente del encoder: no almacena nada derivado del codificador, solo texto y etiquetas de split con hash de contenido. La model card indica que esa independencia se verificó sobre el banco de banking77, donde los dos encoders incluidos exportaron bancos idénticos byte a byte; para este banco de HWU64 solo se ejecutó un encoder, por lo que únicamente la exactitud reportada es específica del encoder.

La cabecera de decisión se ajusta de forma perezosa en la primera llamada a `decide` mediante descenso de gradiente a batch completo con un número de iteraciones fijo, más una calibración de temperatura. El banco se entrenó con las opciones `probeIterations: 4000`, `probeClassBalanced: true` y `head: "probe"`; la model card advierte que omitir `--engine-options` hace que el motor reajuste con los valores por defecto de la librería (400 iteraciones, `head: auto`), lo que produce «un modelo diferente y materialmente peor» que el medido. El punto de ajuste relevante al añadir datos es precisamente el número de iteraciones: 400 ajusta bien en torno a 1.000 ejemplos y subajusta gravemente con unos 10.000. El comando de construcción documentado es `node scripts/typesafe-banks/build-bank.mjs --dataset hwu64 --encoder bge-small-en-v1.5`. La reproducibilidad del ciclo completo (cargar el banco y volver a decidir) está asertada por `test/bank-roundtrip.test.mjs`, no asumida.

## Capacidades

- Clasificación de intenciones sobre un conjunto cerrado de etiquetas: 68 clases según la evaluación, correspondientes al corpus HWU64 de asistente doméstico.
- Decisión totalmente local: la model card afirma que no hay red en la ruta de decisión ni coste de API.
- Calibración de temperatura de las puntuaciones, ajustada desde el propio banco al cargarlo.
- Independencia del encoder: el mismo banco puede cargarse con cualquiera de los dos encoders incluidos en la librería.
- Ejecución por CLI (`npx typesafe decide`) y por API (`createTypesafe`) con opciones de motor configurables, incluida `probeIterations`.
- Determinismo en el ciclo de recarga: un banco recargado reproduce exactamente las respuestas del motor entrenado.
- No dispone de generación de texto, razonamiento multi-paso, código, matemáticas, visión ni audio.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento encadenado.
- No dispone de capacidades multilingües: los dos encoders incluidos son codificadores de frases en inglés.

## Casos de uso

- Enrutado de comandos en asistentes domóticos: el banco está construido sobre HWU64, con intenciones de encendido, temporizadores, alarmas, música y consultas de estado, de modo que puede asignar una utterance entrante a uno de los intents del catálogo antes de invocar la habilidad correspondiente.
- Triaje previo a un LLM: usar el clasificador como primera etapa para decidir si una petición cae dentro del conjunto cerrado de intenciones y reservar el modelo generativo solo para los casos que no encajen, reduciendo llamadas a API.
- Sistemas con requisito de privacidad o despliegue en el borde: al no existir red en la ruta de decisión y ser el artefacto un JSON, la clasificación puede ejecutarse íntegramente en el dispositivo sin enviar texto del usuario a un servicio externo.
- Pruebas de regresión de NLU en CI: el ciclo banco‑recarga‑decisión es determinista y está cubierto por un test, por lo que sirve como referencia estable para detectar regresiones en el pipeline de clasificación.
- Prototipado y validación de taxonomías de intenciones: al ser el etiquetado un conjunto cerrado de ejemplos, se puede evaluar la separabilidad de una taxonomía concreta antes de invertir en anotación a gran escala.
- Automatización de bajo coste en producción: con 5 ms p50 y 7 ms p95 en régimen estable y sin coste por token, es viable enrutar volúmenes altos manteniendo el motor cargado en memoria.
- Clasificación de tickets o mensajes entrantes hacia un departamento concreto, con la salvedad de que requeriría sustituir el banco por uno entrenado con ejemplos propios, ya que el conjunto de etiquetas es cerrado.
- Filtrado rápido de entradas en un pipeline conversacional (por ejemplo, descartar consultas fuera de dominio) antes de etapas más costosas.

## Benchmarks y rendimiento

| Encoder | Exactitud (split test, 6.133 utterances, 68 clases) | Latencia p50 | Latencia p95 |
|---|---|---|---|
| `bge-small-en-v1.5` | 79,9% | 5 ms | 7 ms |

Solo se midió `bge-small-en-v1.5` para este banco; la model card indica que el otro encoder incluido cargará el banco, pero no tiene número asignado. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible, algo esperable dado que el artefacto no es un modelo generativo. Las latencias corresponden a régimen estable, no a la primera decisión tras cargar el banco. La exactitud se reporta sobre la partición de test del propio dataset y la model card advierte explícitamente que no es una afirmación sobre el tráfico real de un usuario.

## Requisitos de hardware

- VRAM estimada: no disponible. La model card no especifica requisitos de memoria ni de hardware para el banco ni para el encoder.
- GPU recomendadas: no disponible. El artefacto se ejecuta con un embedder ONNX (`--embedder onnx`), un modo habitualmente compatible con CPU.
- Encaje en GPU de consumo: no disponible; no se documenta requisito de GPU, y el flujo de ejemplo por CLI sugiere ejecución local en CPU.
- Memoria principal: no disponible, aunque debe tenerse en cuenta que el ajuste de la cabecera opera sobre 19.552 ejemplos y 68 clases.
- Opciones de despliegue: CLI mediante `npx typesafe decide` con `--questions` y `--bank`; integración como librería con `createTypesafe` y `EngineOptions`; embedder ONNX. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia: 5 ms p50 y 7 ms p95 en régimen estable con `bge-small-en-v1.5` (hardware no especificado). Throughput no disponible.
- Coste de arranque: la primera decisión tras cargar el banco es lenta; con `probeIterations: 4000` sobre 19.552 ejemplos y 68 clases, el ajuste tarda «minutos, no milisegundos». La recomendación del autor es importar el banco una sola vez, calentarlo con una decisión de descarte y mantener el motor vivo, evitando cargar un banco por petición.

## Comparativa con modelos similares

No se dispone de datos comparativos de otros artefactos en la información proporcionada. La tabla siguiente recoge únicamente lo documentado para este banco; las columnas de alternativas quedan como no disponibles porque la búsqueda web no devolvió resultados relevantes sobre modelos o bancos comparables.

| Artefacto | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ruvector-typesafe-hwu64 | no aplica (banco de ejemplos, sin pesos) | no disponible | 79,9% de exactitud en el test de HWU64 (6.133 utterances, 68 clases) | cc-by-4.0 (texto), MIT (código) | HuggingFace, 0 descargas y 0 likes |
| Alternativas de la misma categoría (clasificador de intenciones ajustado, prompt sobre LLM) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo inglés: los dos encoders incluidos en la librería son codificadores de frases en inglés, según declara la propia model card.
- Conjunto de etiquetas cerrado: cualquier intent nuevo exige añadir ejemplos y volver a ajustar la cabecera; no hay generalización a categorías no vistas.
- La exactitud (79,9%) se mide sobre la partición de test del propio HWU64 y no es una estimación del rendimiento sobre tráfico real.
- Riesgo de sobreajuste al banco: la model card indica que el número de iteraciones por defecto (400) ajusta bien en torno a 1.000 ejemplos y subajusta gravemente con unos 10.000, por lo que ignorar `--engine-options` degrada el modelo de forma material.
- Arranque costoso: la primera decisión puede tardar minutos; cargar el banco por petición es un antipatrón explícitamente señalado por el autor.
- Solo se ha medido un encoder; el rendimiento con el segundo encoder incluido es desconocido.
- Discrepancia sin explicar entre las 64 intenciones y 21 dominios de la descripción y las 68 clases de la tabla de evaluación.
- Ausencia de validación externa: 0 descargas y 0 likes, sin evidencia de uso en producción por terceros.
- El artefacto no contiene pesos y la librería es propia (`ruvector`), por lo que las herramientas estándar de transformers, safetensors o GGUF no sirven para cargarlo.
- Licencias distintas por componente: el texto redistribuido de las utterances queda bajo CC-BY-4.0 (requiere atribución) y el código de `@ruvector/typesafe` bajo MIT. Verificar la compatibilidad con el uso comercial previsto y mantener la atribución a Liu et al. (2019).
- Los metadatos de HuggingFace indican fecha de creación y actualización 2026-09-22, idénticas, sin historial de revisiones visible en la información proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ruvnet/ruvector-typesafe-hwu64
- Fichero del banco: https://huggingface.co/ruvnet/ruvector-typesafe-hwu64/resolve/main/bank.json
- Fichero de preguntas: https://huggingface.co/ruvnet/ruvector-typesafe-hwu64/resolve/main/questions.json
- Paquete npm de la librería: https://www.npmjs.com/package/@ruvector/typesafe
- Dataset de origen: https://huggingface.co/datasets/Bhuvaneshwari/hwu64
- Referencia citada en la model card: Liu et al., *Benchmarking Natural Language Understanding Services* (2019); no se proporciona URL en la información disponible.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados obtenidos trataban sobre la hora local en Delhi y no guardan relación con el artefacto).
