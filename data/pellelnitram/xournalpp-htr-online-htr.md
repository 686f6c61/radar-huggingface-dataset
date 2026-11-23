# PellelNitram/xournalpp-htr-online-htr

## Resumen

xournalpp-htr-online-htr es un modelo de reconocimiento de escritura manual (HTR, handwriting text recognition) basado en trazos, desarrollado por PellelNitram como componente del proyecto Xournal++ HTR. A diferencia de los sistemas HTR clasicos que trabajan sobre imagenes renderizadas, este modelo consume directamente las secuencias de puntos de tinta (trazos de boligrafo) de una palabra o linea, sin necesidad de rasterizar el contenido. Esta disenado para integrarse en el ecosistema de Xournal++, la aplicacion de toma de notas manuscritas de codigo abierto.

Tecnicamente se trata de una red neuronal recurrente: un LSTM bidireccional de 3 capas con 128 unidades por capa, entrenado con funcion de perdida CTC (Connectionist Temporal Classification), siguiendo el enfoque de Carbune et al. (2020) y portado desde el proyecto OnlineHTR del mismo autor. El modelo se distribuye en formato ONNX y es de tamano muy reducido (el repositorio ocupa 0.0 GB segun Hugging Face), lo que lo hace apto para ejecucion en CPU en entornos de escritorio.

Su relevancia actual es acotada pero especifica: cubre el nicho de reconocimiento de escritura online en aplicaciones de notas, donde no se dispone de imagenes ni de marcas temporales (Xournal++ no almacena timestamps), y donde el coste computacional debe ser minimo para ejecutarse localmente. El modelo solo realiza reconocimiento; requiere un detector de palabras previo que agrupe los trazos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM bidireccional de 3 capas, 128 unidades, con perdida CTC |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (secuencia variable de puntos por palabra/linea) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (entrenado sobre IAM-OnDB, que es principalmente ingles manuscrito) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx`) + `config.json` |

## Arquitectura y entrenamiento

El modelo es una red recurrente pura: un LSTM bidireccional de 3 capas con 128 unidades por capa y una capa de salida CTC. La entrada `ink` tiene forma `(T, N, 3)`, donde T es la longitud temporal de la secuencia, N el tamano de lote y 3 las caracteristicas por punto. Cada punto se representa como `(dx, dy, n)` tras escalar la tinta a altura unitaria y remuestrear por longitud de arco; el canal `n` marca el inicio de un trazo. No existe canal temporal porque Xournal++ no almacena timestamps. La salida `log_probs` tiene forma `(T, N, classes)`, con el simbolo en blanco de CTC como ultima clase; el conjunto de caracteres se define en `config.json`.

El entrenamiento se realizo sobre lineas y palabras de IAM-OnDB (las palabras se recortaron de las lineas en los huecos entre trazos), con un conjunto de 80 caracteres y una division basada en escritores dejando fuera el 10% de ellos. Se aplico aumento de datos mediante escalado en x, cizalladura y rotacion. El mejor CER de validacion fue del 5.2% en la epoca 30. No se utilizaron datos de benchmark de Xournal++ durante el entrenamiento. El modelo no incorpora RLHF ni DPO, al tratarse de una tarea de reconocimiento supervisado con CTC.

## Capacidades

- Reconocimiento de escritura manual online a partir de trazos de boligrafo, sin renderizado de imagen.
- Funcionamiento a nivel de palabra o de linea completa, segun la agrupacion de trazos que reciba.
- Decodificacion greedy (argmax por fotograma) y decodificacion beam search.
- Beam search opcional con restriccion a un lexico: `model.use_lexicon(words)` y `recognize(strokes, decoder="beam")` ajustan la salida a una lista de palabras.
- Entrada en unidades de documento con eje y hacia abajo, compatible con el modelo de datos de Xournal++.
- No soporta tool calling, agentes, vision, audio ni modos de razonamiento extendido.
- Capacidad multilingue no documentada; el entrenamiento se limita a IAM-OnDB.

## Casos de uso

- Digitalizacion de notas manuscritas en Xournal++: el modelo convierte los trazos de una palabra o linea en texto editable dentro de la propia aplicacion, sin salir del entorno de escritorio y sin conexion a red.
- Indexacion y busqueda de apuntes: al transcribir lineas manuscritas se puede construir un indice de texto que permita buscar contenido dentro de cuadernos escaneados o escritos a mano.
- Extraccion de texto para accesibilidad: convierte notas manuscritas en texto que lectores de pantalla u otras herramientas de accesibilidad pueden procesar.
- Procesamiento por lotes de cuadernos antiguos: con un detector de palabras que agrupe los trazos, se pueden transcribir documentos completos de forma automatizada y offline.
- Correccion asistida con lexico: en dominios con vocabulario cerrado (formularios, listas de comprobacion, apuntes de asignaturas concretas) el beam search con lista de palabras mejora la exactitud de lectura.
- Integracion en pipelines de investigacion sobre HTR online: al ser un modelo ONNX pequeno y con codigo MIT, sirve como linea base reproducible para comparar tecnicas de reconocimiento de trazos.
- Prototipado en aplicaciones de notas propias: cualquier editor que almacene trazos como secuencias de puntos puede reutilizar el modelo mediante la API `OnlineHTRModel` y adaptar el detector de palabras.

## Benchmarks y rendimiento

Benchmark sobre 7 documentos manuscritos de Xournal++ de 7 escritores distintos (406 palabras), con el detector de palabras online agrupando los trazos (precision 84.1%, recall 87.4%):

| Decodificacion | CER (sin distinguir mayusculas) | Recall × (1 − CER) | Recall exacto |
|---|---|---|---|
| Greedy | 28.5% | 62.5% | 38.4% |
| Beam + lista de palabras | 27.1% | 63.8% | 45.8% |

El recall exacto es la proporcion de todas las palabras localizadas y leidas correctamente, ignorando mayusculas y minusculas. En validacion sobre IAM-OnDB el mejor CER fue del 5.2% (epoca 30).

## Requisitos de hardware

- VRAM estimada: no disponible; por el tamano del modelo (LSTM de 3x128 unidades) la inferencia es viable en CPU sin GPU dedicada.
- GPU recomendadas: no se requieren; cualquier GPU consumer sirve si se desea acelerar, pero el cuello de botella no es el modelo.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU (ejecucion ONNX en CPU).
- Opciones de despliegue: ONNX Runtime a traves de la libreria `xournalpp_htr` (`OnlineHTRModel.from_pretrained()`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Licencia | Contexto | Notas |
|---|---|---|---|---|---|
| xournalpp-htr-online-htr | BiLSTM 3x128 + CTC | Trazos online | MIT | Secuencia variable | Especifico para Xournal++, muy ligero |
| OnlineHTR (proyecto origen) | BiLSTM + CTC | Trazos online | no disponible | no disponible | Origen del que se porta este modelo |
| Carbune et al. (2020) | Redes recurrentes + CTC | Trazos online | no disponible (paper) | no disponible | Referencia metodologica del diseno |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a arquitectura y licencia.

## Limitaciones y advertencias

- Fuera de dominio: entrenado sobre IAM-OnDB, no sobre notas de Xournal++; el CER en el benchmark propio (28.5% greedy) es muy superior al de validacion (5.2%).
- Puntuacion y simbolos se reconocen mal: aproximadamente el 10% de las palabras con estos elementos se leen correctamente incluso con agrupacion perfecta.
- Con beam search y lista de palabras, las palabras fuera del lexico casi nunca se leen correctamente.
- El benchmark es pequeno (406 palabras), por lo que diferencias de pocos puntos no son fiables.
- Requiere un detector de palabras previo; el modelo no segmenta la tinta por si mismo.
- No dispone de canal temporal, lo que limita el uso de senales temporales en el reconocimiento.
- Riesgo de alucinacion inherente a la decodificacion CTC: puede producir caracteres plausibles aunque incorrectos, especialmente en trazos ambiguos.
- Sesgos: no documentados por el autor; el conjunto IAM-OnDB condiciona el estilo de escritura y el idioma reconocidos.
- Licencia MIT para pesos y codigo, pero IAM-OnDB tiene sus propias condiciones de uso que deben respetarse.
- Para produccion: validar el CER sobre el dominio concreto y considerar el uso de lexico cuando el vocabulario sea cerrado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PellelNitram/xournalpp-htr-online-htr
- Codigo y entrenamiento: https://github.com/PellelNitram/xournalpp_htr
- Proyecto OnlineHTR (origen del port): https://github.com/PellelNitram/OnlineHTR
- Paper de referencia (Carbune et al., 2020): https://doi.org/10.1007/s10032-020-00350-4
