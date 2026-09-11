# ngxson/fly-llm-onnx

## Resumen

fly-llm-onnx es la exportacion a ONNX del modelo ngxson/fly-hf, un experimento de "reservoir computing" en el que los bloques transformer de un LM de estilo GPT se sustituyen por el conectoma del cerebro central de la mosca de la fruta (Drosophila melanogaster). En concreto, se utiliza como reservorio fijo el conectoma MaleCNS, con 49.393 neuronas del cerebro central y aproximadamente 9 millones de sinapsis. Sobre ese reservorio congelado se entrena (y se sobreajusta) una salida de lectura para generar texto, usando el dataset TinyStories.

El modelo no es un producto de proposito general: el propio autor lo describe como un "toy model" construido por diversion y sin garantia de ningun tipo. Su interes es principalmente divulgativo y de investigacion: demuestra que un circuito biologico real puede exportarse como grafo ONNX y ejecutarse token a token, incluso dentro del navegador con onnxruntime-web (WebGPU o WASM), sin necesidad de llama.cpp ni de GPUs dedicadas.

Tecnicamente destaca por su tamano ridiculo (150 MB en la variante autocontenida, 60 MB mas 36 MB de aristas en la variante para navegador), su ventana de contexto de solo 8 tokens y un vocabulario de 1.024 piezas BPE. La generacion es puramente autorregresiva sobre un estado recurrente de 49.393 activaciones float32 que hay que realimentar en cada paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM estilo GPT con los bloques transformer sustituidos por el conectoma MaleCNS de mosca de la fruta (49.393 neuronas, ~9 M sinapsis) usado como reservorio fijo; lectura entrenada sobre el estado recurrente |
| Parametros totales | no disponible (el repositorio no publica el recuento; la matriz de lectura es de 49.393 x 1.024, unos 50,6 M de pesos, sin contar la proyeccion de entrada) |
| Longitud de contexto | 8 tokens (`window_ids` de forma `[batch, 8]`), mas un estado recurrente de 49.393 valores float32 |
| Tipos de cuantizacion | int8 (lectura cuantizada por columna con `DequantizeLinear` dentro del grafo), recuentos de sinapsis en int16 (exactos), indices de aristas en int32; estado y logits en float32 |
| Idiomas soportados | ingles (en) |
| Licencia | CC BY 4.0 (los pesos; el conectoma es CC BY 4.0, FlyEM / HHMI Janelia et al.) |
| Formato de pesos | ONNX, opset 18; ficheros `.onnx` acompanados de `edges_offsets.i32`, `edges_src.u16`, `edges_val.i16`, `edges.json` y `tokenizer.json` (BPE byte-level, vocab 1.024, `<pad>`=0, `<s>`=1, `</s>`=2) |

## Arquitectura y entrenamiento

La innovacion central es la sustitucion del bloque transformer por un reservorio biologico. El conectoma MaleCNS (49.393 neuronas del cerebro central, ~9 M sinapsis) se usa de forma fija, sin entrenamiento, y actua como matriz de recurrencia dispersa: en cada token se calcula `rec = W @ state`, se combina con la ventana de 8 tokens y se aplica una lectura lineal cuantizada para producir los 1.024 logits del vocabulario. Las operaciones del grafo son Gather, Mul, ScatterElements (con reduccion add), Cast, DequantizeLinear, MatMul, LayerNormalization, Tanh, Add, Slice y Concat, todo sobre opset 18.

El entrenamiento se realizo sobre TinyStories, un corpus de relatos infantiles sinteticos y simples, y el modelo esta explicitamente sobreajustado a ese dominio. No se documentan en la informacion disponible ni el numero de tokens de entrenamiento, ni la composicion exacta del dataset, ni si hubo fases de RLHF o DPO; dado el caracter de juguete del proyecto, lo mas probable es que no las haya. La exportacion a ONNX incluye dos estrategias: la v1 mete la matvec dispersa del conectoma dentro del grafo (Gather + ScatterElements), mientras que la v2 saca ese calculo al cliente y recibe `rec` como entrada adicional, lo que permite resolverlo con un bucle CSR en JavaScript de unos 20 ms.

## Capacidades

- Generacion de texto autorregresiva en ingles, limitada a continuaciones de estilo cuento infantil por el corpus de entrenamiento (TinyStories).
- Modelado de estado recurrente explicito: el usuario mantiene un vector de 49.393 activaciones float32 entre pasos, lo que permite inspeccionar y manipular el estado interno.
- Ejecucion por token como grafo ONNX puro, tanto en Python (onnxruntime) como en navegador (onnxruntime-web con WebGPU o WASM).
- Salida determinista verificada: la decodificacion greedy es identica al modelo PyTorch fp32 en las peticiones probadas, con una desviacion maxima de logits de 0,07.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni modo "thinking".
- No tiene capacidades multimodales (ni vision ni audio).
- Multilingue: no; solo ingles.

## Casos de uso

- Docencia sobre reservoir computing: el modelo permite mostrar en clase como un reservorio fijo (aqui un conectoma real) mas una lectura entrenada puede generar secuencias, sin necesidad de entrenar millones de parametros.
- Demostracion de inferencia en navegador: la variante v2 y el Space ngxson/fly-llm-demo permiten ejecutar el modelo en el navegador del usuario con WebGPU o WASM, util para articulos y talleres sobre despliegue ONNX en el cliente.
- Investigacion en redes neuronales inspiradas en biologia: sirve como banco de pruebas para medir cuanto texto coherente puede producir un circuito conectomico congelado frente a un transformer equivalente en parametros.
- Referencia para pipelines de exportacion ONNX: el repositorio documenta el grafo de un paso recurrente con operaciones dispersas (Gather, ScatterElements, CSR manual), un ejemplo practico para quien necesite exportar modelos con recurrencia y matrices dispersas.
- Benchmarking de runtimes: comparar latencias entre onnxruntime CPU, WASM y WebGPU usando el mismo grafo es un ejercicio reproducible; el propio autor reporta unos 20 ms por paso para la matvec CSR en JavaScript.
- Experimentos de cuantizacion extrema: con un vocabulario de 1.024 tokens y lectura int8, es un caso de estudio de compresion de pesos en modelos muy pequenos (de 150 MB a 60 MB mas 36 MB de aristas).
- Prototipos artisticos o ludicos: generacion de micro-relatos de una o dos frases en ingles, siempre con la advertencia de que se trata de un modelo de juguete sin garantia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de calidad reportado por el autor es una comparacion de fidelidad numerica: la salida greedy de la variante ONNX coincide con la del modelo PyTorch fp32 en las peticiones probadas, con una desviacion maxima de logits de 0,07.

| Medicion reportada | Valor |
|---|---|
| Desviacion maxima de logits frente a fp32 (greedy) | 0,07 |
| Matvec CSR del conectoma en JavaScript | ~20 ms por paso |
| `fly_step_v2_q8.onnx` frente a `fly_step_v2_dq8.onnx` en wasm | 30x mas lento |

## Comparativa con modelos similares

No se han identificado en la informacion disponible modelos de terceros comparables: se trata de un artefacto unico en su categoria (conectoma biologico usado como reservorio). La comparacion relevante es entre las propias variantes publicadas.

| Version | Formato | Tamano | Matvec del conectoma | Notas |
|---|---|---|---|---|
| ngxson/fly-hf (origen) | PyTorch fp32 | no disponible | dentro del modelo | Modelo de referencia del que se exporta |
| `fly_step_q8.onnx` (v1) | ONNX autocontenido | 150 MB | dentro del grafo (Gather + ScatterElements) | La opcion mas simple en Python; fidelidad fp32 verificada |
| `fly_step_v2_dq8.onnx` (v2) | ONNX + ficheros de aristas | 60 MB + 36 MB | fuera del grafo (bucle CSR en el cliente) | La usada por la demo del navegador; ~20 ms por paso en JS |
| `fly_step_v2_q8.onnx` (v2) | ONNX + ficheros de aristas | no disponible | fuera del grafo | `DequantizeLinear` + `MatMul`; 30x mas lenta en wasm |

## Limitaciones y advertencias

- Modelo de juguete declarado explicitamente por el autor, "no warranty of any kind"; no debe usarse en produccion.
- Sobreajuste a TinyStories: el estilo y el vocabulario estan sesgados hacia relatos infantiles sinteticos en ingles.
- Ventana de contexto de 8 tokens: no hay memoria textual a largo plazo mas alla del estado recurrente, y no hay mecanismo de atencion.
- Vocabulario diminuto (1.024 piezas BPE), lo que degrada la cobertura lexica y la ortografia.
- Solo ingles; cualquier uso en castellano u otros idiomas producira resultados degenerados.
- No soporta instrucciones, tool calling, agentes ni razonamiento multi-paso; no es un modelo de chat.
- No esta soportado por llama.cpp, por lo que no se puede integrar en los ecosistemas habituales de GGUF/Ollama.
- Riesgo alto de alucinacion y de texto incoherente, inherente a un modelo de este tamano y dominio.
- Licencia CC BY 4.0: permite uso comercial con atribucion, tanto de los pesos como del conectoma (FlyEM / HHMI Janelia et al.), pero sin garantia alguna.
- Discrepancia documental: las etiquetas de HuggingFace indican `base_model:ngxson/fly-llm-hf` mientras que la model card referencia `ngxson/fly-hf`; el ejemplo de Python usa el identificador de repositorio `ngxson/fly-onnx`, distinto del ID publico `ngxson/fly-llm-onnx`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ngxson/fly-llm-onnx
- Modelo base (PyTorch): https://huggingface.co/ngxson/fly-hf
- Demo en el navegador (Space): https://huggingface.co/spaces/ngxson/fly-llm-demo
- Paper o publicacion adicional: no disponible (la busqueda web no devolvio resultados relevantes)
- Repositorio de codigo adicional: no disponible
