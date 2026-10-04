# asketeddy/gooo-record-field-tiny-v1

## Resumen

gooo-record-field-tiny-v1 es un modelo experimental de decision y ordenacion publicado por asketeddy (jooyoon kim) en HuggingFace bajo licencia MIT. No es un modelo de lenguaje generativo al uso, sino una red diminuta de 18.656 parametros que propone el orden de ensamblaje de piezas en el lenguaje Gooo, un DSL de metaprogramacion implementado sobre Go. El contexto de la tarea incluye condiciones, asignaciones locales, tres campos de registro, dos expresiones permitidas por campo, la intencion y ejemplos; el modelo ordena las ocho combinaciones posibles y el compilador de Go se encarga de ensamblar y verificar el resultado.

El modelo cubre tres roles concretos: copia del titulo, estado `ready` y sufijo de motivo. Se entreno con 240 actualizaciones de optimizador en FP32 y 240 en QAT sobre MPS (Apple Silicon), a partir de 768 vistas de codigo fuente divididas en 384 de entrenamiento, 192 de calibracion y 192 de test. La red descrita como "768/24/8" es coherente, por aritmetica (768x24 + 24 + 24x8 + 8 = 18.656), con un perceptron multicapa de dos capas con ocho puntuaciones de mascara a la salida.

Su relevancia actual es doble: por un lado explora cuantizacion ternaria extrema (aproximadamente 1,6 bits por peso, cerca del limite teorico de 1,58 bits), y por otro documenta de forma abierta sus fallos, en particular la brecha de intencion contraria: al invertir la intencion sobre las mismas opciones, la tasa de acierto del primer candidato cae al 50 %. Se trata de un piloto de investigacion, sin descargas ni validacion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red densa descrita como "768/24/8" (perceptron multicapa de dos capas, 8 puntuaciones de mascara); no es un transformer |
| Parametros totales | 18.656 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en tokens; el contexto es una estructura fija con ocho combinaciones posibles de campos de registro |
| Tipos de cuantizacion | FP32, ternaria PTQ y ternaria QAT (5 trits por byte, ~1,6 bits por peso; limite teorico ~1,58 bits) |
| Idiomas soportados | Coreano (ko) e ingles (en) |
| Licencia | MIT |
| Formato de pesos | Formato propio de modelo en Go (no safetensors ni GGUF); directorios `models/fp32`, `models/ptq_ternary` y `models/qat_ternary` con metadatos y pesos independientes |

## Arquitectura y entrenamiento

La red es una MLP de dos capas con dimensiones 768 de entrada, 24 en la capa oculta y 8 salidas, lo que da los 18.656 parametros reportados. Las ocho salidas son puntuaciones de mascara (mask scores) sobre un espacio de construccion pequeno: condiciones y asignaciones locales, tres campos de registro, dos expresiones permitidas por campo, intencion y ejemplos. El modelo no genera texto ni codigo: propone un orden de ensamblaje entre ocho combinaciones y el compilador de Gooo verifica cada retorno alcanzable, ambito de variable y tipo de asignacion. La inferencia ocurre una sola vez antes de la construccion; la ejecucion nativa y la ejecucion repetida realizan cero llamadas al modelo.

Los datos de entrenamiento son 768 vistas de codigo: ocho familias de expresion/cuerpo x seis ordenes de campo x ocho orientaciones primero/segundo x coreano/ingles. El split es por familia completa (384 entrenamiento, 192 calibracion, 192 test reservado) y los contextos y caracteristicas no se solapan entre splits. Se uso inicializacion sembrada por Go, con 240 actualizaciones FP32 y 240 QAT en MPS; la calibracion selecciona epoca y temperatura. La variante PTQ no anade actualizaciones. No se menciona RLHF ni DPO. La innovacion tecnica principal es la cuantizacion ternaria empaquetada a 5 trits por byte, con expansion a int8 en tiempo de ejecucion mediante Go, y una verificacion de exportacion con 192 comparaciones de logits y un error absoluto maximo de 0,00000304.

## Capacidades

- Ordenacion de combinaciones: propone el primer candidato y ordena las ocho combinaciones de campos de registro dentro del espacio de construccion de Gooo.
- Tres roles especificos: copia del titulo, estado `ready` y sufijo de motivo tras la razon.
- Seleccion condicionada por intencion: el contexto incluye la intencion y las alternativas completas, sin entradas de test ni salidas esperadas.
- Soporte de condiciones y asignaciones locales: `if` puede caer sin `else`, incluyendo guardas de retorno temprano y actualizaciones locales anidadas.
- Bilinguismo coreano/ingles en el contexto de la tarea.
- Inferencia local en CPU o MPS, con ejecucion nativa que no realiza llamadas al modelo.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio. No es un modelo conversacional ni de generacion de texto libre.

## Casos de uso

- Investigacion en cuantizacion ternaria extrema: comparar FP32, PTQ y QAT en una red de 18.656 parametros para estudiar el impacto de aproximadamente 1,6 bits por peso frente al limite teorico de 1,58 bits.
- Asistencia a la metaprogramacion en Gooo: usar el modelo para proponer el orden de ensamblaje de piezas y dejar que el compilador de Go verifique el resultado, reduciendo el espacio de busqueda a ocho combinaciones.
- Validacion de pipelines de exportacion: comprobar la fidelidad entre los logits exportados y los de Go mediante las 192 comparaciones publicadas, util como prueba de regresion de un formato propio de pesos.
- Inferencia local en dispositivos sin GPU: con 3.854 bytes de pesos empaquetados y unos 16.000 us de mediana en caliente, es viable en entornos embebidos donde no cabe un modelo convencional.
- Estudio de la brecha de intencion: replicar el experimento de intenciones opuestas emparejadas para medir la caida de acierto del primer candidato del 100 % al 50 % y disenar datos de entrenamiento que la corrijan.
- Punto de partida para aumento de datos controlado: generar pares de intenciones contrarias sobre el mismo conjunto de opciones para mejorar la robustez del orden propuesto.
- Docencia de compiladores y DSL: ilustrar como un modelo pequeno se integra en un compilador real con verificacion formal de tipos y ambitos.

## Benchmarks y rendimiento

Ordenacion de mascara completa sobre 192 vistas reservadas (datos de la model card):

| Exportacion | Primer candidato | Dentro de dos | Dentro de cuatro | Mediana de prediccion en caliente | Fichero de pesos | Tensores residentes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| FP32 | 192/192 | 192/192 | 192/192 | 15,958 us | 74.624 B | 74.624 B |
| Ternaria PTQ | 70/192 | 101/192 | 161/192 | 16,000 us | 3.854 B | 18.752 B + 8 B escalas |
| Ternaria QAT | 134/192 | 192/192 | 192/192 | 16,000 us | 3.854 B | 18.752 B + 8 B escalas |

Ejecucion nativa a presupuesto uno sobre cuatro vistas normales (48 campos observados):

| Estrategia | Campos coincidentes |
| --- | ---: |
| Ordenacion determinista | 32/48 |
| Modelo ordinal congelado | 36/48 |
| Modelo de campo fresco | 48/48 |
| A presupuesto ocho, todos los perfiles | 48/48 |

Intencion contraria a presupuesto uno: de 24 campos coincidentes, los 12 que aciertan corresponden a casos que devuelven la entrada sin cambios. En los campos que requieren transformacion real, los modelos frescos coincidieron 0/12, el orden determinista 8/12 y el control ordinal congelado 4/12.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible.

## Requisitos de hardware

- VRAM para FP32: 74.624 bytes de pesos; el consumo total del proceso supera el almacenamiento de tensores por los objetos temporales del parseo de caracteristicas.
- VRAM para ternaria: 18.752 bytes de tensores residentes mas 8 bytes de escalas, con 3.854 bytes de fichero empaquetado.
- GPU recomendadas: no se especifica ninguna; el entrenamiento se realizo en MPS (Apple Silicon). El modelo cabe con holgura en cualquier GPU consumer y en CPU.
- Si cabe en consumer GPU: si, en cualquier GPU consumer e incluso en CPU o entornos embebidos, dado el tamano.
- Opciones de despliegue: SDK de Go v0.2.22-experimental con los puntos de entrada `LoadRecordThree` y `PredictRecordInto`, o el ejemplo de CLI del compilador. No es compatible con vLLM, llama.cpp, Ollama ni TGI, al usar un formato propio de modelo en Go.
- Latencia y throughput: mediana de prediccion en caliente de 15,958 us en FP32 y 16,000 us en ternaria. La ejecucion nativa no realiza llamadas al modelo. No se publican cifras de throughput.

## Comparativa con modelos similares

Comparativa interna entre las tres exportaciones del mismo modelo:

| Variante | Parametros | Primer candidato (192) | Dentro de cuatro | Tamano de pesos | Latencia mediana | Licencia |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| FP32 | 18.656 | 192/192 | 192/192 | 74.624 B | 15,958 us | MIT |
| Ternaria QAT | 18.656 | 134/192 | 192/192 | 3.854 B | 16,000 us | MIT |
| Ternaria PTQ | 18.656 | 70/192 | 161/192 | 3.854 B | 16,000 us | MIT |

Modelos hermanos del mismo autor, de la misma familia experimental: `asketeddy/gooo-ir-operator-tiny-v1` y `asketeddy/gooo-compiler-prov-tiny-v2`. No se dispone de sus especificaciones tecnicas ni de resultados comparables en la informacion proporcionada, por lo que la comparativa de parametros, contexto y rendimiento frente a ellos queda como no disponible. Como referencia conceptual de cuantizacion ternaria se cita el paper "The Era of 1-bit LLMs: All Large Language Models are in 1.58 Bits" (arXiv 2402.17764), aunque no es un modelo comparable en tamano ni en tarea.

## Limitaciones y advertencias

- Modelo en fase piloto: 0 descargas y 0 likes en HuggingFace en el momento de la consulta; sin validacion en produccion.
- Brecha de intencion contraria: al invertir la intencion sobre las mismas opciones, la tasa de acierto del primer candidato cae al 50 %.
- Fallo en campos con transformacion real: a presupuesto uno, los modelos frescos coincidieron 0/12 en campos que requieren transformacion, frente a 8/12 del orden determinista y 4/12 del control ordinal congelado.
- PTQ claramente inferior a QAT: 70/192 frente a 134/192 en primer candidato; conviene usar QAT si se necesita rendimiento.
- El tamano del repositorio en HuggingFace figura como 0,0 GB, por lo que los pesos pueden requerir obtenerse desde los enlaces de GitHub indicados en la model card.
- Contexto estructurado y acotado: solo ocho combinaciones posibles; no admite entradas arbitrarias de texto libre ni conversacion.
- Idiomas limitados a coreano e ingles; no hay soporte documentado de castellano.
- Formato propio no estandar: no se puede desplegar con las herramientas habituales de inferencia (vLLM, llama.cpp, Ollama, TGI).
- Licencia MIT permite uso comercial, pero al ser un piloto de investigacion sin garantias de calidad, no se recomienda integrarlo en produccion sin verificacion adicional.
- El consumo total de memoria del proceso supera el almacenamiento de tensores por los objetos temporales del parseo de caracteristicas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/asketeddy/gooo-record-field-tiny-v1
- Perfil del autor: https://huggingface.co/asketeddy
- Fuente de preparacion y entrenamiento: https://github.com/kimjooyoon/gooo-neural-decision-experiments/tree/4441c221dfa1b13230d9469d56974b5d7742b174
- Fuente de evaluacion y publicacion en Go: https://github.com/kimjooyoon/gooo-neural-decision-experiments/tree/e85ca0adc429980169f92a334ed45a2bdca10661
- Modelo hermano: https://huggingface.co/asketeddy/gooo-ir-operator-tiny-v1
- Modelo hermano: https://huggingface.co/asketeddy/gooo-compiler-prov-tiny-v2
- Paper de referencia sobre cuantizacion ternaria (1.58 bits): https://arxiv.org/abs/2402.17764
