# bgoldfarb93/laya-int8

## Resumen

Laya INT8 es una cuantización de 8 bits (weight-only) del checkpoint en inglés de convaiinnovations/laya, un modelo de decisión denominado por sus autores "System 1 Decision Engine". La conversión la publica el usuario bgoldfarb93 a partir de la exportación ONNX en fp32 de receptron/laya-onnx, y mantiene exactamente las mismas entradas y salidas que el modelo original, por lo que se carga sin cambios con la librería `@receptron/laya` mediante `Laya.load({ modelDir })`.

El modelo base, desarrollado por Convai Innovations, está orientado a tomar decisiones acotadas sobre una entrada (un ticket de soporte, un correo, una conversación o un estado JSON) y devolver una respuesta estructurada junto con probabilidades, en lugar de generar texto libre. La familia Laya se anuncia como multilingüe y con latencias del orden de 33 ms, y la variante cuantizada que nos ocupa pesa 633 MB en disco y consume aproximadamente 0,9 GB de RAM al cargarse en Linux, frente a 1.685 MB y ~2,8 GB del export fp32.

Su relevancia práctica es doble: por un lado reduce el coste de servir un clasificador de decisión en CPU sin GPU; por otro, demuestra una metodología de cuantización conservadora (ONNX Runtime `MatMulNBits`, 8 bits, block size 32, simétrica) que preserva 21 de 22 respuestas del modelo original en un conjunto de validación etiquetado a mano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el autor no la documenta; el modelo base se describe como "System 1 decision model", no como transformer generativo) |
| Parametros totales | ~421 M (cifra reportada para el modelo base Laya en la prensa técnica; no confirmada de forma independiente para este bundle) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 weight-only (ONNX Runtime `MatMulNBits`, block size 32, simetrica, `accuracy_level=4` con computo int8); la tabla de embeddings de palabras permanece en fp32. Existe tambien la exportacion fp32 original |
| Idiomas soportados | Ingles (este checkpoint corresponde al checkpoint en ingles de convaiinnovations/laya). La familia Laya se comercializa como multilingue y existe una variante ONNX INT8 multilingue de terceros |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`laya.onnx`, 633 MB; sha256 `42b043dfd9ad0ceacae1629a7f030cae6a2d2c3c235e5e1ba87b4ee84a854e9a`) |
| Tamano del repositorio | 0,6 GB |
| Autor de la cuantizacion | bgoldfarb93 (no afiliado a Convai Innovations) |
| Modelo base | convaiinnovations/laya (via receptron/laya-onnx) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base: la model card de esta cuantizacion solo describe el proceso de conversion, no la topologia de red, el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO. Lo unico documentado es su caracter de "System 1" dentro de una familia de modelos de decision: recibe una peticion compuesta por una `Choice` con entre 3 y 8 opciones, mas un `Score` y un `Noul` (salida nula o de rechazo), y devuelve una opcion seleccionada acompanada de probabilidades.

El trabajo tecnico de este repositorio se centra en la cuantizacion. Se parte de la exportacion fp32 a ONNX y se aplica `MatMulNBits` de ONNX Runtime en modo 8 bits con block size 32, esquema simetrico y `accuracy_level=4`. Como innovacion metodologica destacable, el autor documenta que probo primero cuantizacion dinamica (`quantize_dynamic`) y la descarto porque alteraba 6 de cada 22 respuestas del conjunto de validacion; la aproximacion final con `MatMulNBits` solo cambio 1 de 22 respuestas y ninguna probabilidad se desplazo mas de 0,014. La tabla de embeddings de palabras se mantiene deliberadamente en fp32, lo que explica que la reduccion de tamano (de 1.685 MB a 633 MB) sea parcial.

## Capacidades

- Toma de decisiones acotadas: selecciona una opcion entre un conjunto cerrado (Choice) y devuelve la opcion elegida con su distribucion de probabilidad.
- Respuesta estructurada y probabilistica, apta para consumirse directamente desde una aplicacion sin postprocesar texto libre.
- Puntuacion de urgencia o relevancia (Score) sobre la entrada analizada.
- Capacidad de rechazo mediante la salida "Noul", que permite al modelo no elegir ninguna opcion cuando la entrada no encaja.
- Procesamiento de entradas heterogeneas: tickets de soporte, correos, conversaciones y estados JSON.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo esta disenado para un unico paso de decision).
- Capacidades multilingues: el checkpoint aqui publicado es el ingles; la familia dispone de variantes multilingues.
- Capacidades especiales: modo "thinking", vision o audio: no disponibles.
- Inferencia en CPU sin GPU, con un consumo de RAM en torno a 0,9 GB.

## Casos de uso

- Enrutado de tickets de soporte: dado un ticket, el modelo elige entre colas de destino (facturacion, tecnico, reclamaciones) y devuelve la probabilidad asociada a cada una; al ser una decision acotada, permite aplicar umbrales de confianza y derivar a revision humana los casos dudosos.
- Triaje de urgencia: sobre el mismo ticket o correo, la salida Score permite priorizar la cola de trabajo sin necesidad de un LLM generativo.
- Guardrails en pipelines de LLM: clasificar si una peticion o respuesta cumple una politica determinada y devolver una probabilidad de incumplimiento, integrable como paso previo o posterior a un modelo generativo.
- Clasificacion de intencion en asistentes conversacionales: con 0,9 GB de RAM y ejecucion en CPU, puede desplegarse junto al orquestador para decidir que herramienta o flujo activar en cada turno.
- Seleccion de creatividades publicitarias: el caso documentado por el autor, en el que se parte de una descripcion de marca y se elige entre 3 y 8 opciones de anuncio con una puntuacion asociada.
- Evaluacion de condiciones sobre estado JSON en agentes: comprobar si se cumple una condicion declarada antes de permitir que un agente ejecute una accion.
- Despliegue en edge o en servidores sin GPU: al caber en menos de 1 GB de RAM y usar ONNX Runtime, es viable en portatiles, mini-PC o contenedores de bajo coste.
- Clasificacion por lotes de alto volumen: el bajo coste por inferencia en CPU lo hace adecuado para procesar grandes volumenes de documentos o registros en pipelines ETL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de evaluacion es el test de fidelidad de la cuantizacion, realizado por el autor sobre 22 descripciones de marca etiquetadas a mano de un recomendador con objetivo publicitario:

| Metrica | fp32 (receptron/laya-onnx) | INT8 (este bundle) |
|---|---|---|
| Tamano de `laya.onnx` | 1.685 MB | 633 MB |
| RAM en Linux (cargado) | ~2,8 GB | ~0,9 GB |
| Respuestas coincidentes (22 ejemplos) | referencia | 21 / 22 |
| Desviacion maxima de probabilidad | referencia | 0,014 |
| Caso divergente | referencia | empate ajustado 28 % vs 27 % |
| `quantize_dynamic` (descartado) | referencia | 16 / 22 coincidentes (6 cambios) |

Ademas, la documentacion de la familia Laya cita una latencia de 33 ms, si bien no se especifica en que hardware, en que variante ni con que lote se midio esa cifra.

## Requisitos de hardware

- Almacenamiento: 633 MB para el fichero `laya.onnx`; 0,6 GB para el repositorio completo.
- RAM de inferencia: aproximadamente 0,9 GB en Linux una vez cargado el modelo (frente a ~2,8 GB de la version fp32).
- GPU: no necesaria. No se especifican GPU recomendadas para este bundle; el modelo esta pensado para ejecucion en CPU.
- GPU de consumo: cualquier GPU con mas de 1 GB de VRAM podria alojarlo, pero no aporta ventaja frente a CPU dado el tamano del modelo.
- Opciones de despliegue: ONNX Runtime (backend nativo del bundle), libreria `@receptron/laya` mediante `Laya.load({ modelDir })`, y conversion a OpenVINO para INT8 en CPU (existe una demo publica de terceros con este stack). Formatos como GGUF, llama.cpp, Ollama, vLLM o TGI no aplican a este artefacto en su estado actual.
- Latencia: no disponible de forma verificable para este bundle. La familia Laya anuncia 33 ms sin especificar hardware ni condiciones.
- Throughput: no disponible.
- Referencia de hardware probado por terceros: Intel Core i7 de 12ª generacion con OpenVINO INT8 en la demo de Flappy Bird.

## Comparativa con modelos similares

No se conocen alternativas publicas directamente comparables en la misma categoria (motores de decision acotada en formato ONNX). La comparativa mas util es contra los propios artefactos de la familia Laya:

| Modelo | Formato | Tamano | RAM | Idiomas | Licencia |
|---|---|---|---|---|---|
| bgoldfarb93/laya-int8 (este) | ONNX INT8 (MatMulNBits) | 633 MB | ~0,9 GB | Ingles | Apache-2.0 |
| receptron/laya-onnx | ONNX fp32 | 1.685 MB | ~2,8 GB | Ingles | Apache-2.0 |
| Sharjeelbaig/laya-multilingual-onnx-int8 | ONNX INT8 | no disponible | no disponible | Multilingue | Apache-2.0 |
| convaiinnovations/laya (modelo base) | no disponible | no disponible | no disponible | Ingles (checkpoint) | Apache-2.0 |

Nota: la variante multilingue de terceros se publica explicitamente como "untested" en su model card.

## Limitaciones y advertencias

- No es un modelo generativo: no redacta texto libre. Solo devuelve una eleccion entre opciones predefinidas mas puntuaciones, por lo que no sirve para tareas de resumen, traduccion o conversacion abierta.
- La validacion de la cuantizacion es muy limitada: 22 ejemplos de un unico dominio (descripciones de marca de un recomendador publicitario). No hay garantia de que el comportamiento se mantenga en otros dominios, idiomas o distribuciones de entrada.
- Compresion con perdida: aunque el autor reporta 21 de 22 coincidencias, existe una divergencia documentada (un empate 28 % vs 27 %) y desviaciones de probabilidad de hasta 0,014. En decisiones con umbrales ajustados, ese margen puede cambiar el resultado.
- La tabla de embeddings permanece en fp32, de modo que la reduccion de tamano y de RAM es parcial y no equivale a una cuantizacion completa del grafo.
- Repositorio publicado por un tercero no afiliado a Convai Innovations: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado. No hay garantia de mantenimiento ni de actualizaciones.
- Idiomas: este checkpoint concreto es el ingles. Para uso en castellano habria que recurrir al checkpoint multilingue del modelo base, cuya cuantizacion equivalente se publica sin verificar.
- Sesgos conocidos: no documentados. Al derivar de un modelo base sin ficha de datos publicada, no es posible auditar la composicion del dataset de entrenamiento ni los sesgos asociados.
- Riesgo de alucinacion: al operar sobre opciones cerradas, el fallo tipico no es inventar contenido, sino asignar una probabilidad alta a una opcion incorrecta. Se recomienda calibrar umbrales y monitorizar la confianza en produccion.
- Licencia Apache-2.0 en este bundle y en el modelo base, lo que permite uso comercial; conviene verificar igualmente los terminos del modelo base en su repositorio original por si se anaden condiciones adicionales.
- Latencia y throughput no verificados para este artefacto concreto; la cifra de 33 ms de la familia no especifica hardware ni lote.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bgoldfarb93/laya-int8
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Exportacion fp32 en ONNX: https://huggingface.co/receptron/laya-onnx
- Libreria de inferencia `@receptron/laya`: https://github.com/receptron/laya
- Sitio oficial de Laya (Convai Innovations): https://laya.convaiinnovations.com/
- Repositorio del modelo base (NandhaKishorM/laya): https://github.com/NandhaKishorM/laya
- Articulo de como funciona y como ejecutarlo en local: https://huggingface.co/blog/sora-2/laya-ai-model-how-it-works-run-it-locally-and-eval
- Variante multilingue ONNX INT8 de terceros (sin verificar): https://huggingface.co/Sharjeelbaig/laya-multilingual-onnx-int8
- Demo de Laya con OpenVINO INT8 en CPU (Flappy Bird): https://github.com/rupeshs/flappy-laya-openvino-cpu
- Cobertura de la demo OpenVINO: https://theneuralfeed.com/article/laya-model-playing-flappy-bird-on-a-cpu-using-openvino-int8-inference/5q0vyPpR
