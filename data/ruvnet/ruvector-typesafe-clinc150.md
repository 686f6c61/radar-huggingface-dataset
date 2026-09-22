# ruvnet/ruvector-typesafe-clinc150

## Resumen

`ruvector-typesafe-clinc150` es un banco de ejemplos etiquetados entrenado para la librería `@ruvector/typesafe`, una herramienta de Node.js que resuelve clasificación de intenciones (intent classification) en local, sin llamadas a API y sin tráfico de red en la ruta de decisión. No es un modelo generativo ni un conjunto de pesos: es un artefacto de datos que contiene 15.000 ejemplos etiquetados con sus asignaciones de split congeladas, procedentes del dataset CLINC150 (150 intenciones repartidas en 10 dominios, más 1.000 enunciados deliberadamente fuera de alcance). Lo publica el usuario `ruvnet` y se distribuye bajo licencia CC-BY-3.0.

El funcionamiento es el de un clasificador por embeddings más una cabeza de decisión que se reajusta al cargar el banco: si una clase tiene suficientes ejemplos se usa una sonda multinomial; si no, un clasificador de prototipo más cercano. Sobre esa cabeza se aplica una calibración de temperatura. El banco es independiente del encoder, ya que solo almacena texto y etiquetas de split derivadas de un hash de contenido, de modo que puede cargarse con distintos encoders; la precisión medida, sin embargo, es específica del encoder usado.

Su relevancia práctica está en el nicho de clasificación de intenciones en producción: 91,0 % de accuracy sobre el split de test oficial (4.500 enunciados), 4 ms de latencia p50 y 6 ms p95 en estado estacionario, y detección de fuera de alcance mediante una masa de `abstain` con AUROC de 0,9011. La contrapartida es que el primer `decide` tras cargar el banco tarda minutos, porque la cabeza se ajusta de forma perezosa, y que el conjunto de etiquetas es cerrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es una red neuronal monolítica: banco de ejemplos etiquetados con splits congelados más cabeza de decisión reajustada en carga (clasificador de prototipo más cercano o sonda multinomial según número de ejemplos por clase) con calibración de temperatura; encoder de frases externo |
| Parametros totales | No disponible (el artefacto no contiene pesos; el banco ocupa el espacio de 15.000 ejemplos de texto) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (se procesa un enunciado por decisión; la model card no especifica límite de tokens) |
| Tipos de cuantizacion | No aplica / no disponible (no se distribuyen pesos cuantizables) |
| Idiomas soportados | Inglés únicamente (ambos encoders empaquetados son sentence encoders en inglés) |
| Licencia | CC-BY-3.0 para el banco de datos; el código de `@ruvector/typesafe` es MIT |
| Formato de pesos | No hay pesos. Se distribuyen `bank.json` (ejemplos y splits congelados) y `questions.json` |
| Encoder medido | `bge-small-en-v1.5` (único encoder con cifras publicadas en esta ficha) |
| Dataset de origen | `clinc/clinc_oos` (CLINC150), Larson et al., EMNLP 2019 |
| Ejemplos de entrenamiento | 15.000 (`splitsHash: cfe29e0a95ec973c…`) |
| Clases / intenciones | 150 intenciones en 10 dominios, más 1.000 enunciados fuera de alcance |
| Split de evaluación | `test`, 4.500 enunciados |
| Librería | `ruvector` (paquete npm `@ruvector/typesafe`) |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto no sigue la lógica de un transformer generativo. `@ruvector/typesafe` construye un pipeline de clasificación en dos etapas: un encoder de frases convierte el enunciado en un embedding y una cabeza ligera produce una distribución sobre las 150 intenciones más una masa de `abstain`. La cabeza puede ser un clasificador de prototipo más cercano o, cuando una clase acumula ejemplos suficientes, una sonda multinomial. La calibración de temperatura se recalcula también en el momento de la carga. El banco almacena únicamente texto y etiquetas de split derivadas de un hash de contenido, lo que lo hace independiente del encoder: en el banco hermano de banking77 ambos encoders empaquetados exportaron bancos idénticos byte a byte, aunque en este caso solo se ejecutó uno.

El entrenamiento se realiza con el script `scripts/typesafe-banks/build-bank.mjs --dataset clinc150 --encoder bge-small-en-v1.5`. La sonda se ajusta con descenso de gradiente a batch completo y un número de iteraciones fijo, que es el hiperparámetro crítico: los 400 valores por defecto ajustan bien en torno a 1.000 ejemplos y se quedan claramente cortos con 10.000. Este banco se entrenó con `probeIterations: 4000`, `probeClassBalanced: true` y `head: probe`, opciones que deben replicarse al cargar mediante `EngineOptions`; omitirlas reajusta con los valores por defecto y produce un modelo materialmente peor. Una consecuencia operativa relevante es que la primera decisión tras `importBankJson` es lenta (minutos con 15.000 ejemplos y 150 clases), y todas las posteriores operan a la latencia de régimen estacionario.

## Capacidades

- Clasificación de intenciones sobre texto en inglés con 150 etiquetas cerradas repartidas en 10 dominios.
- Detección de fuera de alcance (out-of-scope) mediante una masa de `abstain` que la API Jev a la que sustituye no exponía en absoluto; el ranking por ese valor alcanza AUROC 0,9011.
- Inferencia completamente local, sin coste de API y sin red en la ruta de decisión.
- Funcionamiento con encoder intercambiable: el banco no depende del encoder, aunque la precisión publicada sí.
- Reajuste de la cabeza y de la calibración de temperatura al cargar, de modo que el banco se puede adaptar con datos propios generando nuevos ejemplos y reajustando.
- Reproducibilidad verificada: recargar el banco reproduce exactamente las respuestas del motor entrenado, según afirma el test `test/bank-roundtrip.test.mjs`.
- No dispone de generación de texto, razonamiento multi-paso, tool calling, capacidades de agente, visión, audio ni modo de pensamiento. No es un modelo de propósito general.

## Casos de uso

- Enrutamiento de intenciones en asistentes conversacionales: cada turno del usuario se clasifica contra las 150 intenciones para decidir el flujo de diálogo, con la ventaja de que la decisión se resuelve en 4 ms p50 y sin salir del proceso Node.js.
- Triaje de tickets de soporte: los mensajes entrantes se etiquetan por dominio e intención antes de asignarse a un equipo, usando `probeClassBalanced: true` para compensar clases minoritarias.
- Derivación a agente humano mediante detección de fuera de alcance: las consultas que no encajan en ninguna intención se ordenan por la masa de `abstain` y se escalan las de mayor puntuación, en lugar de forzar una etiqueta incorrecta.
- Despliegues con requisitos estrictos de privacidad: como no hay red en la ruta de decisión ni pesos que enviar a un tercero, es apto para entornos sanitarios, financieros o aislados donde el texto del usuario no puede salir de la máquina.
- Clasificación de comandos en aplicaciones de escritorio o CLI: el binario `npx typesafe decide` permite invocarlo desde scripts y herramientas de línea de comandos, por ejemplo para mapear lenguaje natural a acciones concretas.
- Pretratamiento en pipelines de RAG o de agentes: clasificar la consulta antes de recuperar documentos reduce el espacio de búsqueda y permite seleccionar la herramienta o el índice adecuado.
- Pruebas de regresión de sistemas NLU: al ser el banco determinista y reproducible en la recarga, sirve como referencia para detectar degradaciones cuando se cambia de encoder o de versión de la librería.
- Clasificación en dispositivos con recursos limitados: la inferencia no requiere GPU y la latencia publicada es de milisegundos de un solo dígito, lo que permite ejecutarla en el mismo proceso que la aplicación.

## Benchmarks y rendimiento

Split `test` retenido, 4.500 enunciados, 150 clases, encoder `bge-small-en-v1.5`:

| Metrica | Valor |
|---|---|
| Accuracy (test) | 91,0 % |
| Latencia p50 | 4 ms |
| Latencia p95 | 6 ms |
| Abstain AUROC (fuera de alcance frente a dentro de alcance) | 0,9011 |
| Media de `abstain`, fuera de alcance | 5,07e-7 |
| Media de `abstain`, dentro de alcance | 2,55e-8 |

No se han publicado resultados de benchmarks de tipo MMLU, HumanEval o GSM8K en la información disponible, ni serían aplicables a un clasificador de intenciones. Solo se midió el encoder `bge-small-en-v1.5`; el segundo encoder empaquetado cargará el banco pero no tiene cifra asociada en la model card. Los valores de latencia corresponden a régimen estacionario y no incluyen el primer ajuste de la cabeza, que se mide en minutos.

## Requisitos de hardware

- VRAM: no aplica en sentido estricto; el artefacto no contiene pesos. El consumo depende del encoder ONNX seleccionado y del banco cargado en memoria (15.000 ejemplos de texto).
- GPU: no se especifica ninguna GPU recomendada en la información disponible. La ejecución está pensada para CPU con el embedder ONNX (`--embedder onnx`).
- GPU de consumo: irrelevante para este artefacto; cabe en cualquier equipo capaz de ejecutar Node.js y un encoder de frases pequeño.
- Opciones de despliegue: paquete npm `@ruvector/typesafe`, invocable desde TypeScript (`createTypesafe({ embedder: …, engine: { probeIterations: 4000 } })`) o mediante el binario `npx typesafe decide --questions questions.json --bank bank.json --embedder onnx`. vLLM, llama.cpp, Ollama y TGI no aplican, porque no hay pesos generativos.
- Latencia: 4 ms p50 y 6 ms p95 en estado estacionario con `bge-small-en-v1.5`. El primer `decide` tras cargar el banco tarda minutos con `probeIterations: 4000` sobre 15.000 ejemplos y 150 clases.
- Patrón de despliegue recomendado por el autor: importar el banco una sola vez, calentarlo con una decisión de descarte y mantener el motor vivo; no cargar un banco por petición.

## Comparativa con modelos similares

| Alternativa | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `ruvnet/ruvector-typesafe-clinc150` | Banco de ejemplos con cabeza reajustada | No aplica (sin pesos) | No disponible | 91,0 % accuracy en el test de CLINC150 con `bge-small-en-v1.5`; abstain AUROC 0,9011; 4 ms p50 | CC-BY-3.0 (datos), MIT (código) | HuggingFace y npm |
| API Jev (sustituida por esta librería) | Servicio de decisión sobre texto | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |
| Clasificadores fine-tuning de BERT sobre CLINC150 | Modelo supervisado con pesos | No disponible | No disponible | No disponible en la información proporcionada | No disponible | No disponible |
| Otros bancos de `@ruvector/typesafe` (p. ej. banking77) | Mismo formato, distinto dataset | No aplica | No disponible | No disponible en la información proporcionada | CC-BY-3.0 / MIT | HuggingFace |

La model card no incluye comparaciones numéricas contra alternativas; únicamente señala que la masa de `abstain` no tiene campo equivalente en la API Jev a la que reemplaza, lo que constituye una diferencia funcional más que de rendimiento.

## Limitaciones y advertencias

- Solo inglés: ambos encoders empaquetados son sentence encoders en inglés, por lo que el rendimiento en otros idiomas no está soportado.
- Conjunto de etiquetas cerrado: cualquier intención nueva exige ejemplos nuevos y un reajuste del banco.
- La accuracy del 91,0 % corresponde al split de test del propio dataset y no es una estimación del rendimiento sobre tráfico real.
- El umbral de `abstain` no debe copiarse de otro despliegue: el valor por defecto `abstainTau = 0.35` nunca se activará con este banco, porque las medias de `abstain` son del orden de 1e-7. Hay que ordenar por ese valor o calibrar un umbral contra tráfico propio.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea cuando una consulta cae cerca de los límites entre intenciones o cuando pertenece a un dominio no cubierto por las 150 clases.
- Las opciones de motor son obligatorias: cargar el banco sin `probeIterations: 4000`, `probeClassBalanced: true` y `head: probe` produce un modelo distinto y peor que el medido.
- Coste de arranque elevado: el primer `decide` tarda minutos; un patrón de carga por petición es inviable.
- Sesgos: no se documenta ningún análisis de sesgo demográfico, lingüístico o de dominio en la información disponible.
- Licencia: el banco redistribuye el texto de CLINC150 bajo CC-BY-3.0, lo que obliga a mantener la atribución a Larson et al. (EMNLP 2019); el código de la librería es MIT. Conviene verificar la compatibilidad con el uso comercial previsto, ya que CC-BY-3.0 exige atribución.
- El artefacto tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (22 de septiembre de 2026), por lo que no cuenta con validación independiente de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ruvnet/ruvector-typesafe-clinc150
- Banco de datos: https://huggingface.co/ruvnet/ruvector-typesafe-clinc150/resolve/main/bank.json
- Fichero de preguntas: https://huggingface.co/ruvnet/ruvector-typesafe-clinc150/resolve/main/questions.json
- Paquete npm de la librería: https://www.npmjs.com/package/@ruvector/typesafe
- Dataset de origen en HuggingFace: https://huggingface.co/datasets/clinc/clinc_oos
- Referencia del dataset: Larson et al., *An Evaluation Dataset for Intent Classification and Out-of-Scope Prediction*, EMNLP 2019 (citado en la model card; la model card no incluye URL del paper)
- Búsqueda web: no se han encontrado enlaces relevantes sobre este modelo en los resultados de búsqueda disponibles; los resultados obtenidos tratan sobre modelos Gemini y herramientas de traducción, sin relación con este artefacto.
