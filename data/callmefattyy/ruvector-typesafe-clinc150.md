# callmefattyy/ruvector-typesafe-clinc150

## Resumen

ruvector-typesafe-clinc150 no es un modelo de pesos neuronales, sino un banco de ejemplos etiquetados (bank.json) para la libreria @ruvector/typesafe, publicado por el usuario callmefattyy en HuggingFace. Contiene 150 intenciones repartidas en 10 dominios del dataset CLINC150, mas 1000 enunciados deliberadamente fuera de alcance (out-of-scope), y sirve para construir clasificadores de intenciones que se ejecutan en local, sin coste de API y sin red en la ruta de decision.

El artefacto almacena texto y etiquetas de split con hash de contenido, no pesos ni representaciones derivadas del encoder. La cabecera de clasificacion (prototipo mas cercano o sonda multinomial cuando una clase acumula suficientes ejemplos) y la calibracion de temperatura se reajustan desde el banco al cargarlo. Con el encoder bge-small-en-v1.5 alcanza un 91,0% de precision sobre el split test retenido (4500 enunciados, 150 clases), con latencias de 4 ms en p50 y 6 ms en p95.

Su relevancia actual esta en ofrecer un enfoque reproducible, determinista en coste y de ejecucion local para el enrutado de intenciones, con deteccion explicita de out-of-scope mediante una masa de abstencion (AUROC de 0,9011), como alternativa ligera a los clasificadores fine-tuned convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Banco de ejemplos etiquetados con cabecera de clasificacion reajustada en carga (nearest-prototype o sonda multinomial) sobre embeddings de un encoder de frases; no es un transformer con pesos propios |
| Parametros totales | no disponible (el artefacto no contiene pesos; solo ejemplos en JSON) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no se especifica; depende del encoder de frases empleado) |
| Tipos de cuantizacion | no disponible (el banco es JSON y no se cuantiza; la model card no detalla cuantizacion del encoder ONNX) |
| Idiomas soportados | ingles unicamente (ambos encoders incluidos son sentence encoders en ingles) |
| Licencia | CC-BY-3.0 para el banco y el texto del dataset redistribuido; el codigo de @ruvector/typesafe es MIT |
| Formato de pesos | JSON (bank.json con ejemplos y etiquetas de split; questions.json); no hay safetensors, GGUF ni binarios de pesos |

## Arquitectura y entrenamiento

El artefacto es un banco de 15.000 ejemplos etiquetados con asignaciones de split congeladas (splitsHash: cfe29e0a95ec973c…), generado con `node scripts/typesafe-banks/build-bank.mjs --dataset clinc150 --encoder bge-small-en-v1.5`. El banco es independiente del encoder: almacena texto y etiquetas de split con hash de contenido, nada derivado del encoder. En el banco equivalente de banking77 ambos encoders incluidos exportaron bancos identicos byte a byte; en este caso solo se ejecuto un encoder, por lo que unicamente la precision reportada es especifica de bge-small-en-v1.5.

La cabecera es una sonda entrenada con descenso de gradiente a batch completo y un numero de iteraciones fijo, mas calibracion de temperatura. Ese contador de iteraciones es el hiperparametro critico al anadir datos: el valor por defecto de 400 ajusta bien ~1000 ejemplos y subajusta gravemente ~10000. Este banco se entreno con `probeIterations: 4000`, `probeClassBalanced: true` y `head: probe`. Como el banco no almacena hiperparametros, hay que pasar esas mismas `engine-options` al cargarlo; omitirlas reajusta con los valores por defecto de la libreria (400 iteraciones, `head: auto`), lo que produce un modelo distinto y materialmente peor que el medido.

## Capacidades

- Clasificacion de texto en 150 intenciones cerradas distribuidas en 10 dominios (dominio del dataset CLINC150).
- Deteccion de out-of-scope: expone una masa de abstencion que permite separar enunciados que no pertenecen a ninguna intencion conocida.
- Decisiones tipadas localmente, sin llamada a API y sin red en la ruta de decision.
- Inferencia de bajisima latencia en estado estacionario: 4 ms p50 y 6 ms p95 medidas sobre el split test.
- Independencia del encoder: el mismo banco puede cargarse con distintos encoders incluidos, aunque solo se midio con uno.
- Reajuste de la cabecera al cargar y reajuste completo al anadir nuevas intenciones o ejemplos.
- CLI integrada: `npx typesafe decide --questions questions.json --bank bank.json --embedder onnx`.
- No ofrece generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni capacidades de agente.

## Casos de uso

- Enrutado de intenciones en asistentes conversacionales: el banco clasifica la consulta del usuario en una de las 150 intenciones de CLINC150 en 4-6 ms, lo que permite decidir el flujo de dialogo antes de invocar cualquier componente costoso.
- Triaje de tickets de soporte: cada mensaje entrante se etiqueta por intencion y dominio, de modo que el sistema puede asignar colas, prioridades o respuestas predefinidas sin enviar el texto a un servicio externo.
- Derivacion a humano por consulta fuera de alcance: ordenando por la masa de abstencion (AUROC 0,9011) se identifican peticiones que no encajan en ninguna intencion y se escalan a un operador en lugar de forzar una etiqueta incorrecta.
- Enrutado de herramientas en agentes: la intencion clasificada actua como selector de la herramienta o funcion a invocar, reduciendo el espacio de acciones que se pasa a un modelo generativo posterior.
- Procesamiento en el borde o en el navegador: al ejecutarse con un encoder ONNX local y un banco JSON, es viable en despliegues Node.js sin conectividad, util en entornos con requisitos de privacidad o redes restringidas.
- Prefiltrado de consultas para pipelines RAG: descartar o etiquetar consultas antes de la recuperacion evita gastar recuperacion y generacion en peticiones claramente fuera de catalogo.
- Regresion de taxonomias de intenciones: al ser un banco reproducible con splits congelados, sirve para detectar degradaciones al modificar el conjunto de etiquetas o al cambiar de encoder.
- Analitica de voz del cliente: clasificacion por lotes de transcripciones para agregar motivos de contacto por dominio e intencion sin coste por token.

## Benchmarks y rendimiento

Split `test` retenido de CLINC150: 4500 enunciados, 150 clases, 15.000 ejemplos de entrenamiento.

| Metrica | Valor |
|---|---|
| Precision (bge-small-en-v1.5) | 91,0% |
| Latencia p50 | 4 ms |
| Latencia p95 | 6 ms |
| Abstain AUROC (out-of-scope vs in-scope) | 0,9011 |
| Media de abstain, out-of-scope | 5,07e-7 |
| Media de abstain, in-scope | 2,55e-8 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible. Solo se midio el encoder bge-small-en-v1.5; el otro encoder incluido puede cargar el banco, pero no tiene cifra reportada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La ruta de inferencia usa un sentence encoder ONNX de tipo small sobre CPU; no se publican requisitos de memoria.
- GPU recomendadas: no aplica. No se documenta uso de GPU ni se aportan cifras para A100, H100 o RTX 4090.
- Cabe en GPU de consumo: no disponible, y en la practica innecesario, dado que las latencias medidas (4 ms p50) corresponden a un encoder small en la ruta local.
- Opciones de despliegue: paquete npm @ruvector/typesafe y CLI `npx typesafe decide`; encoder via `--embedder onnx`. No aplican vLLM, llama.cpp, Ollama ni TGI, porque no hay pesos de un LLM.
- Primer `decide` lento: el ajuste de la cabecera es perezoso y, con `probeIterations: 4000` sobre 15.000 ejemplos y 150 clases, tarda minutos. El resto de llamadas opera a la latencia de estado estacionario.
- Patron de despliegue recomendado: importar el banco una sola vez, calentar con una decision de descarte y mantener el motor vivo; no cargar un banco por peticion.
- Throughput estimado: no disponible.

## Comparativa con modelos similares

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Formato |
|---|---|---|---|---|---|
| ruvector-typesafe-clinc150 | no aplica (banco de ejemplos, sin pesos) | no disponible | 91,0% en el test de CLINC150; 4/6 ms p50/p95 | CC-BY-3.0 (banco); MIT (codigo) | JSON (bank.json) |
| Clasificador fine-tuned sobre CLINC150 (tipo BERT/DistilBERT) | no disponible | no disponible | no disponible en la informacion proporcionada | depende del checkpoint | safetensors/PyTorch |
| SetFit u otro enfoque few-shot con sentence transformers | no disponible | no disponible | no disponible en la informacion proporcionada | depende del encoder y del codigo | safetensors/PyTorch |
| kNN manual sobre embeddings con encoder de frases | no disponible | no disponible | no disponible en la informacion proporcionada | depende del encoder | artefactos propios |

Diferencias estructurales conocidas: este artefacto no distribuye pesos, es independiente del encoder y reajusta su cabecera en cada carga, mientras que las alternativas basadas en fine-tuning distribuyen un checkpoint fijado y suelen requerir GPU para el entrenamiento. No hay cifras comparativas publicadas en la informacion disponible.

## Limitaciones y advertencias

- Solo ingles: ambos encoders incluidos son sentence encoders en ingles, por lo que el rendimiento en otros idiomas no esta soportado ni medido.
- Conjunto de etiquetas cerrado: anadir intenciones nuevas exige ejemplos nuevos y un reajuste completo del banco.
- La precision del 91,0% corresponde al split test del propio dataset; no es una afirmacion sobre el trafico real de un despliegue.
- La masa de abstencion es diminuta en terminos absolutos (5,07e-7 fuera de alcance frente a 2,55e-8 dentro), aunque la separacion relativa sea de unas 20 veces. Un umbral fijo como `abstainTau` de 0,35 nunca se activara: hay que ordenar por abstain o calibrar el umbral con trafico propio.
- Omitir `engine-options` cambia el modelo: sin `probeIterations: 4000`, `probeClassBalanced: true` y `head: probe` se reajusta con los valores por defecto de la libreria, que subajustan conjuntos de ~10.000 ejemplos.
- La primera decision tras cargar el banco tarda minutos con la configuracion medida; cargar el banco por peticion es inviable en produccion.
- Licencia CC-BY-3.0 sobre el banco y el texto redistribuido: exige atribucion a Larson et al. y al dataset CLINC150. El codigo de la libreria es MIT, pero eso no cubre los datos.
- Sesgos heredados del dataset CLINC150 (intenciones, formulaciones y anotacion en ingles de un dominio acotado); no se documenta ninguna evaluacion de sesgo en la model card.
- Riesgo de error de clasificacion silencioso: el modelo no genera texto, pero asignar una intencion incorrecta puede enrutar una accion equivocada aguas abajo si no se combina con el orden por abstain.
- Estado del repositorio: 0 descargas y 0 me gusta, sin validacion de la comunidad, y creado/actualizado el 2026-10-05.
- Inconsistencia de espacio de nombres: la pagina vive en `callmefattyy/ruvector-typesafe-clinc150`, mientras que los comandos de descarga de la model card apuntan a `ruvnet/ruvector-typesafe-clinc150`. Conviene verificar la ruta antes de automatizar la descarga.
- La busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/callmefattyy/ruvector-typesafe-clinc150
- Descarga del banco citada en la model card: https://huggingface.co/ruvnet/ruvector-typesafe-clinc150/resolve/main/bank.json
- Descarga de preguntas citada en la model card: https://huggingface.co/ruvnet/ruvector-typesafe-clinc150/resolve/main/questions.json
- Paquete npm: https://www.npmjs.com/package/@ruvector/typesafe
- Dataset de origen: https://huggingface.co/datasets/clinc/clinc_oos
- Referencia citada en la model card: Larson et al., "An Evaluation Dataset for Intent Classification and Out-of-Scope Prediction" (EMNLP 2019); URL no disponible en la informacion proporcionada.
