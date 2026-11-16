# damienrider/scx-router-v0.1-onnx

## Resumen

scx-router-v0.1-onnx es la exportacion no oficial a formato ONNX del modelo scx-router-v0.1, un router de clasificacion zero-shot desarrollado por SCX en colaboracion con Knowledgator. Su funcion es decidir, a partir de un prompt de entrada, etiquetas como la dificultad de la tarea, el tipo de tarea, el modo de razonamiento requerido, la longitud esperada de salida o el modelo de destino en un pipeline de enrutamiento de LLM. La conversion la firma el usuario damienrider y permite ejecutar el modelo solo con ONNX Runtime, sin necesidad de PyTorch ni de la libreria `gliclass`.

El modelo se basa en una arquitectura GLiClass con backbone Qwen3-0.6B y una cabeza scorer compuesta por un encoder DeBERTa-v2 de dos capas mas un MLP. Al ser zero-shot, las etiquetas se pasan en tiempo de inferencia, de modo que puede usarse tanto con las familias de etiquetas entrenadas como con categorias propias. El repositorio ocupa 4,3 GB e incluye variantes del decoder en fp32, int8 y fp16, ademas de ejemplos en Python y .NET.

La relevancia actual reside en que los routers de LLM se han convertido en una pieza clave para reducir costes y latencia en sistemas multiagente: enviar cada consulta al modelo adecuado evita usar un modelo grande para tareas triviales. Esta version ONNX facilita el despliegue en entornos sin stack de PyTorch, incluidos servicios .NET o Node, con latencias de decenas de milisegundos en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiClass con backbone Qwen3-0.6B y cabeza scorer (encoder DeBERTa-v2 de 2 capas + MLP) |
| Parametros totales | no disponible (backbone de 0,6 mil millones; total del conjunto no publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32, int8 dinamica (pesos), fp16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (decoder.onnx + .data, scorer.onnx + .data); tokenizer.json y config.json en formato Hugging Face |

## Arquitectura y entrenamiento

El modelo original es un router de clasificacion zero-shot basado en GLiClass, una familia de modelos que combina un decoder (aqui Qwen3-0.6B) con una cabeza de scoring que evalua la compatibilidad entre el texto de entrada y cada etiqueta candidata. La exportacion ONNX separa el grafo en dos partes: `decoder.onnx`, que procesa la secuencia concatenada de contexto y etiquetas y devuelve los estados ocultos, y `scorer.onnx`, que recibe los estados ocultos correspondientes a la seccion de etiquetas y produce un logit por etiqueta. El llamador debe construir manualmente la secuencia con los tokens especiales `<<SEP>>` y `<<LABEL>>`, tal como hace el pipeline decoder-KV de `gliclass`.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; la model card original no se incluye en la informacion proporcionada. La innovacion tecnica destacable es la exportacion a dos grafos ONNX que elimina la dependencia de Python en tiempo de inferencia y permite ejecutar el router desde cualquier binding de ONNX Runtime. La validacion realizada compara 8 prompts por 3 conjuntos de etiquetas (24 clasificaciones) contra la implementacion PyTorch original, con equivalencia numerica en fp32 y acuerdo top-1 del 100 % en las tres variantes.

## Capacidades

- Clasificacion zero-shot de texto: acepta etiquetas arbitrarias en tiempo de inferencia, sin reentrenamiento.
- Enrutamiento de LLM: asigna un prompt a un modelo o nivel de servicio segun familias de etiquetas entrenadas (dificultad, tipo de tarea, modo de razonamiento, longitud de salida, routing de modelo).
- Clasificacion multi-etiqueta mediante activacion sigmoid (tipo de problema entrenado) y single-label mediante softmax.
- Clasificacion de dificultad en niveles configurables (por ejemplo, very easy / easy / medium / hard / extra hard, o simple / standard / complex).
- Distincion entre prompts que requieren razonamiento y los que no (reasoning / nonreasoning).
- Ejecucion sin PyTorch: funciona con ONNX Runtime en Python, .NET, Node y otros bindings.
- Tokenizacion reproducible fuera de Hugging Face: el ejemplo en .NET reconstruye el tokenizer Qwen2 con Microsoft.ML.Tokenizers y obtiene ids identicos, incluidos digitos, CJK, emoji, CRLF, tabuladores y codigo.
- No soporta tool calling, agentes, vision ni audio: es exclusivamente un clasificador de texto.

## Casos de uso

- Enrutamiento de coste en plataformas de inferencia: clasificar cada prompt entrante como simple, estandar o complejo y derivarlo a un modelo pequeno, mediano o grande. La latencia de 33-39 ms en CPU permite hacerlo en linea antes de la llamada al LLM principal.
- Puerta de escalado a razonamiento: usar las etiquetas reasoning / nonreasoning para decidir si la consulta se envia a un modelo con modo de pensamiento extendido o a uno rapido, reduciendo el gasto en tokens de razonamiento innecesarios.
- Despliegue en servicios .NET: el repositorio incluye un ejemplo en C# con Microsoft.ML.OnnxRuntime y Microsoft.ML.Tokenizers, adecuado para backends empresariales que no quieren introducir Python en produccion.
- Filtrado previo en pipelines de atencion al cliente: clasificar la dificultad y el tipo de tarea de cada ticket para asignarlo a un agente automatico o a un humano, con la variante int8 (0,60 GB) ejecutable en CPU.
- Estimacion de longitud de salida: predecir si la respuesta esperada es corta o larga para reservar presupuesto de tokens y ajustar timeouts en la API.
- Clasificacion de contenido con etiquetas propias: al ser zero-shot, se pueden definir categorias especificas del dominio (por ejemplo, tipos de consulta legal o financiera) sin entrenar un modelo nuevo, calibrando los umbrales sobre la variante int8.
- Enrutamiento en entornos edge o sin GPU: la variante int8 con 0,84 GB de memoria de trabajo y 33 ms de latencia p50 en CPU permite ejecutar el router en portatiles o contenedores ligeros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La unica validacion publicada es la paridad frente a la implementacion PyTorch original, medida en la CPU de un portatil Apple M5:

| Decoder | Acuerdo top-1 | Max \|Δ probabilidad\| | Latencia p50 / max | Memoria de trabajo |
|---|---|---|---|---|
| fp32 | 24/24 | 1,9 × 10⁻⁶ | 39 / 56 ms | 2,1 GB |
| int8 | 24/24 | 0,23 | 33 / 52 ms | 0,84 GB |
| fp16 | 24/24 | 1,1 × 10⁻³ | 56 / 84 ms | 1,8 GB |

La validacion cubre 8 prompts por 3 conjuntos de etiquetas (24 clasificaciones). La variante fp16 resulta mas lenta y pesada que int8 en CPU porque ONNX Runtime recurre a kernels fp32; esta pensada para execution providers de GPU.

## Requisitos de hardware

- VRAM/RAM para inferencia: 2,1 GB de memoria de trabajo con fp32, 0,84 GB con int8 y 1,8 GB con fp16 (medidos en CPU).
- GPU recomendadas: no se especifican; la variante fp16 esta pensada para execution providers de GPU/acelerador. Cualquier GPU consumer con al menos 1-2 GB libres es suficiente para el decoder, dado el tamano del modelo.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna (RTX 3060 o superior), aunque el caso natural es CPU.
- Opciones de despliegue: ONNX Runtime en Python, .NET, Node u otros bindings; no requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 33 ms p50 (max 52 ms) con int8, 39 ms p50 (max 56 ms) con fp32 y 56 ms p50 (max 84 ms) con fp16 en CPU Apple M5, por clasificacion tras el warm-up e incluyendo tokenizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scx-router-v0.1-onnx | backbone 0,6B (total no disponible) | no disponible | Router zero-shot GLiClass en ONNX | Apache 2.0 | Hugging Face |
| scx-router-v0.1 (original) | backbone 0,6B (total no disponible) | no disponible | Router zero-shot GLiClass en PyTorch | Apache 2.0 | Hugging Face |
| Modelos de routing propietarios (por ejemplo, RouteLLM) | no disponible | no disponible | Enrutamiento aprendido entre modelos | no disponible | no disponible |

La comparacion con alternativas de la misma categoria es limitada porque no se dispone de datos publicados de otros routers zero-shot en la informacion proporcionada. La diferencia principal frente al original es la eliminacion de la dependencia de PyTorch y `gliclass`, a cambio de asumir manualmente la construccion de la secuencia y el corte de la seccion de etiquetas.

## Limitaciones y advertencias

- Conversion no oficial: no esta respaldada por SCX ni por Knowledgator; para citar el trabajo deben citarse los autores originales.
- Solo ingles: el modelo declara unicamente el idioma `en`, por lo que el rendimiento en castellano u otros idiomas no esta garantizado.
- La cuantizacion int8 puede desplazar probabilidades individuales hasta ~0,23; si se usan umbrales de confianza (por ejemplo, escalar cuando la confianza sea menor que 0,7), deben calibrarse contra la propia variante int8.
- La validacion se limita a 24 clasificaciones, por lo que es una comprobacion de correctitud, no una evaluacion exhaustiva de calidad.
- El llamador debe implementar la construccion de la secuencia con `<<SEP>>` y `<<LABEL>>` y el corte de la seccion de etiquetas; un error en estos pasos invalida las predicciones.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso; solo emite puntuaciones por etiqueta.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de calibracion: las probabilidades no deben interpretarse como certeza absoluta sin validacion en el dominio de uso.
- Licencia Apache 2.0: permite uso comercial, pero al ser una conversion de un modelo de terceros conviene revisar la licencia y los terminos del modelo original.
- El repositorio pesa 4,3 GB; conviene descargar solo la variante de decoder necesaria mediante `allow_patterns`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/damienrider/scx-router-v0.1-onnx
- Modelo original: https://huggingface.co/scx-admin/scx-router-v0.1
- SCX: https://scx.ai
- Knowledgator en Hugging Face: https://huggingface.co/knowledgator
- ONNX: https://onnx.ai
- ONNX Runtime: https://onnxruntime.ai
