# flaukowski/gridlm-thegrid

## Resumen

gridlm es un par de modelos de lenguaje minimalistas (unos 0,8 millones de parámetros cada uno) entrenados sobre el registro fósil de thegrid, un laboratorio de vida artificial creado por Matt Eckman. thegrid ejecuta organismos como pequeños programas sobre un conjunto de instrucciones evolucionable que compiten por CPU, memoria y calor reales del host, y cada nacimiento queda registrado. gridlm aprende de qué mutaciones reprodujeron realmente, en lugar de generar genomas a partir de un prompt con el juego de instrucciones, un enfoque que según los propios hallazgos de thegrid fracasa: 4.554 genomas escritos por un LLM general no fundaron ninguna estirpe.

El proyecto incluye dos modelos: un *screen* (codificador sobre `[CLS] parent [SEP] child`) que estima la probabilidad de que un genoma hijo nazca al menos dos veces en su época, y un *generator* (LM causal) entrenado solo con hijos que se reprodujeron. Se acompaña de `gridlm_operator.py`, un operador listo para enchufar al mutador `odin` de thegrid, que muestrea 8 hijos, los puntúa con el screen y propone el mejor. Todo funciona en CPU en milisegundos y se distribuye bajo licencia MIT.

Es relevante como demostración de la idea de los modelos de lenguaje de ADN (como Carbon-X de Hugging Face) aplicada a vida artificial: cada opcode es un token y las etiquetas provienen de resultados reales de reproducción. Fue construido por Kannaka (una IA) con Nick Flach, y el entrenamiento completo costó unos 0,13 dólares en una RTX 4090.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder con `[CLS] parent [SEP] child` (screen) y LM causal sobre `[BOS] parent [SEP] child [EOS]` (generator) |
| Parametros totales | ~0,8M por modelo (dos modelos: screen y generator) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (opera sobre secuencias de opcodes, no lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`: `screen.pt`, `generator.pt`) |

## Arquitectura y entrenamiento

gridlm consta de dos redes independientes de ~0,8M de parámetros. El *screen* es un codificador que recibe el par padre-hijo y emite la probabilidad de que el hijo nazca al menos dos veces en su época (es decir, que se copiara a sí mismo y fundara algo). El *generator* es un modelo causal entrenado exclusivamente con hijos que se reprodujeron, y genera un hijo para un padre dado. La inspiración procede de los modelos de lenguaje de ADN: cada opcode recibe su propio token y el aprendizaje se basa en resultados observados.

Los datos provienen del registro fósil de *colony-one*, leído el 2026-10-27: 1.573.008 filas (una por par época/genoma hijo, excluyendo el padre más temprano y las copias exactas), con una tasa de positivos del 24,8% y 614 épocas. Es importante señalar que corresponde a una versión antigua de thegrid con una economía de hambruna (613 de 614 épocas terminaron en extinción). Se excluyeron deliberadamente del input el campo `mutation_type` (filtra la etiqueta) y el recuento de nacimientos del padre (contamina con datos posteriores); los inputs son solo las dos secuencias de instrucciones. La partición es temporal: entrenamiento épocas 1–565 (1,27M filas), validación 566–593 y test 594–614 (152k filas). El entrenamiento se realizó en una RTX 4090 en unos 7 minutos.

## Capacidades

- **Filtrado de mutaciones (screen):** puntúa pares padre-hijo según su probabilidad de fundar algo, alcanzando un AUROC de 0,667 en test temporal.
- **Generación de genomas (generator):** escribe un genoma hijo para un padre dado; el 100% de sus muestras en padres retenidos tienen longitud válida y el 83,2% contienen el patrón `alloc+copy+fork`.
- **Operador integrado:** `gridlm_operator.py` responde a las colas `request.json`/`proposal.json` del protocolo de thegrid, muestreando 8 hijos por petición y proponiendo el mejor puntuado.
- **Reentrenamiento end to end:** `extract.py` y `train.py` permiten reentrenar desde cualquier `history.sqlite3` de thegrid, en CPU o CUDA.
- **No es un modelo de lenguaje general:** no procesa texto natural, código convencional ni realiza razonamiento; su dominio es exclusivamente el juego de instrucciones evolucionable de thegrid.

## Casos de uso

- **Operador de mutación para colonias thegrid:** conectado a la cola de `odin`, propone el mejor de 8 hijos muestreados por petición; corre en CPU en milisegundos, por lo que puede servir varias colonias simultáneamente sin hardware dedicado.
- **Priorización de candidatos en evolución dirigida:** al recibir un lote de genomas candidatos, el screen ordena cuáles probar primero; su top 10% reproduce a 1,8x la tasa base (1,7x en genomas nunca vistos).
- **Investigación en vida artificial:** sirve como caso de estudio de aprendizaje de operadores de mutación a partir de resultados reales, en la línea de los modelos de ADN.
- **Reentrenamiento sobre flotas propias:** cualquier operador de thegrid puede extraer su registro fósil con `extract.py` y reentregar un modelo adaptado a su versión del ISA y su economía en minutos.
- **Generación de hipótesis evolutivas:** las muestras del generator reproducen patrones que la evolución real descubre (duplicaciones en tándem de motivos de ganancia, bloques `fork copy alloc` duplicados), útiles para analizar qué estrategias emergen.
- **Docencia y demos de ML aplicado:** el proyecto completo (datos, extracción, entrenamiento a 0,13 dólares y evaluación con líneas base) es un ejemplo didáctico compacto de pipeline de aprendizaje supervisado con partición temporal.

## Benchmarks y rendimiento

Resultados en partición temporal (épocas 594–614, 152k filas; "novel" usa solo genomas de test ausentes en entrenamiento, 145k):

| modelo | AUROC | avg precision | precision en top 10% | AUROC, novel | top 10%, novel |
|---|---|---|---|---|---|
| base rate | | 0,248 | 0,248 | | 0,240 |
| regla: tiene alloc+copy+fork | 0,526 | 0,267 | 0,283 | 0,528 | 0,265 |
| regresión logística, 15 rasgos manuales | 0,609 | 0,327 | 0,384 | 0,605 | 0,362 |
| **gridlm screen** | **0,667** | **0,385** | **0,452** | **0,659** | **0,418** |
| gridlm generator, log p(hijo \| padre) | 0,582 | 0,296 | 0,321 | 0,586 | 0,320 |

Muestras del generator sobre padres retenidos (1.000): 100% de longitud válida, 83,2% con alloc+copy+fork, 2,3% idénticas al padre. El screen las puntúa con media 0,525 frente a 0,469 de los mutantes reales de test, aunque los autores advierten que esto es un modelo juzgando a otro y no evidencia de aptitud.

## Requisitos de hardware

- **Inferencia:** funciona en CPU en milisegundos; no requiere GPU.
- **Entrenamiento:** una sola GPU de consumo (RTX 4090) durante unos 7 minutos (12,8 créditos, ~0,13 dólares en qBraid).
- **Dependencias:** `torch` y `numpy`.
- **Despliegue:** script propio `gridlm_operator.py` en modo petición única (`--once-genome`) o sirviendo colas de operador (`--queue`); no está pensado para vLLM, llama.cpp, Ollama ni TGI.
- No se han publicado cifras de latencia o throughput detalladas más allá de "milisegundos en CPU por propuesta".

## Comparativa con modelos similares

No existen modelos públicos directamente comparables (LM sobre genomas de thegrid). Como referencia conceptual dentro de la idea de "modelos de lenguaje de secuencias biológicas/artificiales":

| Modelo | Dominio | Tamano | Entrenamiento | Licencia |
|---|---|---|---|---|
| gridlm (screen + generator) | Genomas de thegrid (opcodes) | ~0,8M por modelo | 1,57M transiciones de colony-one | MIT |
| Carbon-X (referencia citada) | Secuencias de ADN | no disponible | Corpus de ADN de Hugging Face | no disponible |
| LLM general con prompt del ISA (línea base de thegrid) | Genomas vía prompt | no disponible | Sin entrenamiento específico | no disponible |

La comparación empírica relevante del propio proyecto es contra líneas base simples: la regla "tiene alloc+copy+fork" (AUROC 0,526) y una regresión logística con 15 rasgos manuales (AUROC 0,609), ambas superadas por el screen (0,667).

## Limitaciones y advertencias

- **Una sola colonia, una versión del ISA, una economía:** los opcodes que colony-one nunca usó son tokens desconocidos, y el "gusto" del modelo refleja un mundo de hambruna. Debe reentrenarse sobre el registro de la flota objetivo.
- **Sin colonias réplica:** la partición temporal está retenida, pero los datos provienen de una única colonia. La validación real exigiría varias colonias réplica con este operador frente a variación ciega, comparando estirpes fundadas por propuesta.
- **Evidencia incompleta del generator:** no se ha demostrado que los hijos del generator funden estirpes en una colonia viva; además, el screen puntúa mejor las muestras del generator que los mutantes reales, lo que sugiere autoconfianza del sistema y no aptitud.
- **El resultado de una mutación individual es mayormente ruido:** incluso el screen solo alcanza AUROC 0,667; su top 10% reproduce a 1,8x la tasa base, lejos de una predicción fiable.
- **La economía domina el resultado:** según LESSONS 11–12 de thegrid, la economía decide hacia dónde llega un mundo; un mejor mutador podría solo alcanzar el estancamiento más rápido.
- **Sin pipeline estándar de inferencia:** no hay soporte de transformers, cuantización ni formatos GGUF/safetensors; la integración requiere PyTorch y el protocolo de thegrid.
- **Cero descargas registradas:** proyecto de investigación incipiente, sin comunidad de usuarios ni validación externa publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/flaukowski/gridlm-thegrid
- Dataset: https://huggingface.co/datasets/flaukowski/thegrid-colony-one-transitions
- thegrid (repositorio de Matt Eckman): https://github.com/EckmanTechLLC/thegrid
