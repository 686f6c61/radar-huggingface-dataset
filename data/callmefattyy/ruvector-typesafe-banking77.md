# callmefattyy/ruvector-typesafe-banking77

## Resumen

ruvector-typesafe-banking77 es un banco de ejemplos etiquetados para la libreria `@ruvector/typesafe`, orientado a clasificacion de intenciones (intent classification) sobre texto bancario en ingles. No es un modelo neuronal con pesos: el artefacto contiene 9.993 utterances etiquetadas con sus asignaciones de split congeladas, y las cabezas de clasificacion (prototipo mas cercano o sonda multinomial) mas la calibracion de temperatura se reajustan desde el banco cada vez que el motor lo carga. El banco esta construido sobre el dataset PolyAI/banking77, con 77 intenciones bancarias finas.

El problema que resuelve es el de tomar decisiones de clasificacion de texto de forma local, sin factura de API y sin red en la ruta de decision. Se integra como dependencia npm y se ejecuta sobre un encoder de frases ONNX, de modo que la inferencia ocurre en la maquina del usuario. Es relevante para equipos que necesitan enrutado de intenciones de baja latencia (milisegundos) y coste marginal nulo, aceptando a cambio un conjunto de etiquetas cerrado y dependiente de ejemplos.

El autor declarado en HuggingFace es `callmefattyy`, aunque las URLs de descarga de la model card apuntan al espacio `ruvnet/ruvector-typesafe-banking77`. El artefacto es independiente del encoder: ambos encoders incluidos exportaron bancos identicos byte a byte; solo la precision reportada es especifica de cada encoder. La licencia del banco es CC-BY-4.0 (redistribuye el texto de las utterances) y el codigo de `@ruvector/typesafe` es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es una red neuronal con pesos. Banco de ejemplos etiquetados con splits congelados; cabezas de clasificacion reajustadas en carga (nearest-prototype o sonda multinomial) mas calibracion de temperatura |
| Parametros totales | No disponible (no aplica; el banco contiene 9.993 ejemplos etiquetados y 77 clases) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (clasificacion a nivel de utterance, sin ventana de contexto documentada) |
| Tipos de cuantizacion | No disponible (el embedder se usa en formato ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | Ingles unicamente (ambos encoders incluidos son sentence encoders en ingles) |
| Licencia | CC-BY-4.0 (banco y dataset); el codigo de `@ruvector/typesafe` es MIT |
| Formato de pesos | JSON: `bank.json` (ejemplos y splits) y `questions.json`. Encoders en ONNX |

## Arquitectura y entrenamiento

El artefacto no almacena pesos, sino ejemplos: texto etiquetado mas etiquetas de split derivadas de un hash de contenido. El motor `@ruvector/typesafe` reconstruye la cabeza de decision de forma perezosa en la primera llamada a `decide`. Para clases con suficientes ejemplos usa una sonda multinomial ajustada por descenso de gradiente a batch completo con un numero de iteraciones fijo; para el resto, una cabeza de prototipo mas cercano. Sobre esa cabeza se aplica una calibracion de temperatura. El banco es, por diseno, independiente del encoder: solo contiene texto y etiquetas de split, nada derivado del encoder.

El entrenamiento se ejecuta con `node scripts/typesafe-banks/build-bank.mjs --dataset banking77 --encoder all-MiniLM-L6-v2` sobre 9.993 ejemplos etiquetados, con `splitsHash: f51a48af2895c08d…`. Un detalle critico de reproducibilidad: el numero de iteraciones de la sonda es un hiperparametro que no viaja dentro del banco. La configuracion medida corresponde a `probeIterations: 4000` y `probeClassBalanced: true` con `head: probe`. Omitir estas opciones hace que se reajuste con los valores por defecto (400 iteraciones, `head: auto`), lo que produce un modelo materialmente peor: 400 iteraciones ajustan bien ~1.000 ejemplos y subajustan gravemente ~10.000. El round-trip de recarga del banco esta verificado por `test/bank-roundtrip.test.mjs`.

## Capacidades

- Clasificacion de texto en 77 intenciones bancarias finas (por ejemplo, disputa de tarjeta, limites, transferencias, estado de cuenta).
- Decision local sin red en la ruta de inferencia y sin coste por llamada.
- Reproducibilidad exacta: un banco recargado reproduce las respuestas del motor entrenado, segun el test de round-trip del propio repositorio.
- Independencia de encoder: el mismo banco funciona con distintos sentence encoders; solo cambia la precision resultante.
- Interfaz de linea de comandos (`npx typesafe decide`) y API programatica TypeScript (`createTypesafe({ embedder, engine })`).
- Calibracion de temperatura sobre las probabilidades de la cabeza.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (es un clasificador de intenciones, no un modelo generativo).
- Multilingue: no. Solo ingles.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Enrutado de tickets en atencion al cliente bancaria: cada mensaje entrante se clasifica en una de las 77 intenciones antes de asignarlo a un flujo o a un agente humano. La latencia de estado estacionario (6-15 ms p50) permite hacerlo en linea sin anadir espera perceptible.
- Pre-clasificacion en un pipeline RAG o de chatbot: usar el banco como primera etapa para decidir que base de conocimiento consultar, reduciendo el numero de llamadas a un LLM generativo y, con ello, el coste por consulta.
- Guardrail de intenciones sensibles: detectar de forma determinista, y con el motor siempre residente en memoria, utterances que correspondan a disputas, fraude o cancelaciones para forzar escalado humano.
- Clasificacion por lotes de transcripciones de soporte telefonico: el modelo se ejecuta en CPU a traves de ONNX, de modo que se puede procesar un historico completo sin GPU y sin enviar datos a terceros.
- Etiquetado asistido para ampliar la taxonomia: dado que la etiqueta es cerrada, las predicciones del banco se pueden usar como preetiquetado de nuevas utterances; las que caigan fuera del conjunto se convierten en candidatas a nuevas intenciones que requieren ejemplos y un reajuste.
- Cumplimiento y residencia de datos: despliegue en infraestructura propia donde el texto del cliente no puede salir del perimetro, gracias a que la decision no requiere red.
- Experimentacion y evaluacion de encoders: al ser un banco independiente del encoder, sirve para comparar sentence encoders sobre un mismo conjunto de 3.077 utterances de test sin reentrenar la cabeza.

## Benchmarks y rendimiento

Split `test` reservado del dataset: 3.077 utterances, 77 clases. Precision y latencia de estado estacionario reportadas por el autor:

| Encoder | Precision | Latencia p50 | Latencia p95 |
|---|---|---|---|
| `all-MiniLM-L6-v2` | 76,7% | 15 ms | 16 ms |
| `bge-small-en-v1.5` | 87,0% | 6 ms | 10 ms |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar, que por otra parte no aplican a un clasificador de intenciones. Los unicos numeros de rendimiento disponibles son los de la tabla anterior.

## Requisitos de hardware

- VRAM estimada: no disponible; la inferencia esta pensada para ejecutarse en CPU con un embedder ONNX, sin requisito de GPU documentado.
- GPU recomendadas: no disponible. El artefacto no declara requisitos de GPU.
- Compatibilidad con GPU de consumo: no aplica segun la documentacion; el motor esta orientado a ejecucion local en CPU dentro de Node.js.
- Opciones de despliegue: paquete npm `@ruvector/typesafe`, CLI `npx typesafe decide --questions questions.json --bank bank.json --embedder onnx`, y API programatica TypeScript. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia: 6 ms p50 / 10 ms p95 con `bge-small-en-v1.5`; 15 ms p50 / 16 ms p95 con `all-MiniLM-L6-v2`, en estado estacionario.
- Advertencia de latencia en arranque: la primera decision tras cargar el banco implica ajustar la cabeza y, con `probeIterations: 4000` sobre 9.993 ejemplos y 77 clases, tarda minutos, no milisegundos. El patron recomendado es importar una vez, calentar con una decision desechable y mantener el motor vivo; no cargar un banco por peticion.
- Throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada sobre modelos alternativos de clasificacion de intenciones con numeros verificables. La comparacion honesta disponible es interna al propio artefacto y a sus configuraciones:

| Alternativa | Precision | Latencia p50 | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este banco + `bge-small-en-v1.5` | 87,0% | 6 ms | No disponible | CC-BY-4.0 (banco), MIT (codigo) | HuggingFace + npm |
| Este banco + `all-MiniLM-L6-v2` | 76,7% | 15 ms | No disponible | CC-BY-4.0 (banco), MIT (codigo) | HuggingFace + npm |
| Este banco con opciones por defecto (400 iteraciones, `head: auto`) | No disponible (el autor indica que es materialmente peor) | No disponible | No disponible | CC-BY-4.0 | Mismo artefacto, distinta configuracion |
| Encoders duales de Casanueva et al. (2020) | No disponible | No disponible | No disponible | No disponible | Paper arXiv:2003.04807 |
| Fine-tuning de un encoder tipo BERT sobre Banking77 | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Solo ingles: ambos encoders incluidos son sentence encoders en ingles, por lo que el rendimiento en otros idiomas no esta soportado.
- Conjunto de etiquetas cerrado: las 77 intenciones son fijas. Cualquier intencion nueva exige nuevos ejemplos y un reajuste del banco.
- La precision reportada (76,7% y 87,0%) esta medida sobre el split de test del propio dataset, no sobre trafico real de produccion. El autor lo declara explicitamente.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea con confianza calibrada, especialmente en utterances ambiguas o fuera de dominio, que se forzaran a una de las 77 clases.
- Confusion de configuracion: omitir `--engine-options` provoca un reajuste con valores por defecto que produce un modelo distinto y peor que el medido. Es un error silencioso, no un fallo.
- Arranque costoso: la primera decision tras cargar el banco tarda minutos con `probeIterations: 4000`. Cargar un banco por peticion es inviable.
- Discrepancia de identificadores: el ID de HuggingFace es `callmefattyy/ruvector-typesafe-banking77`, mientras que las URLs `curl` de la model card apuntan a `ruvnet/ruvector-typesafe-banking77`. Conviene verificar cual es el repositorio canonico antes de integrarlo en un pipeline.
- Adopcion nula: el artefacto registra 0 descargas y 0 likes, sin senales de uso en produccion por terceros.
- Fecha de creacion y actualizacion declaradas: 2026-10-05 (identicas), dato aportado por los metadatos de HuggingFace.
- Licencia: el banco redistribuye texto de utterances bajo CC-BY-4.0, lo que exige atribucion. El codigo de la libreria es MIT. Verificar la compatibilidad con el uso comercial previsto.
- Sin garantias de mantenimiento: es un artefacto de ejemplo de una libreria, no un modelo con ciclo de versiones documentado.

## Enlaces

- HuggingFace: https://huggingface.co/callmefattyy/ruvector-typesafe-banking77
- Paquete npm `@ruvector/typesafe`: https://www.npmjs.com/package/@ruvector/typesafe
- Dataset PolyAI/banking77: https://huggingface.co/datasets/PolyAI/banking77
- Paper de referencia: Casanueva et al., *Efficient Intent Detection with Dual Sentence Encoders* (2020), arXiv:2003.04807 — https://arxiv.org/abs/2003.04807
- URLs de descarga citadas en la model card: https://huggingface.co/ruvnet/ruvector-typesafe-banking77/resolve/main/bank.json y https://huggingface.co/ruvnet/ruvector-typesafe-banking77/resolve/main/questions.json
- Nota: la busqueda web realizada no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos no guardan relacion con el artefacto y se descartan.
