# AntonDergunov/task-icon-encoder-e5-small-interim

## Resumen

Task icon encoder (e5-small, interim) es un modelo de embeddings de frases desarrollado por AntonDergunov que resuelve un problema muy concreto: seleccionar el icono de Material Symbols mas adecuado semanticamente para una tarea de una lista de pendientes (to-do). Se construye a partir de `intfloat/multilingual-e5-small` (118M parametros), afinado como codificador dual y destilado desde su hermano mayor `task-icon-encoder-e5-large-interim`, y exportado a ONNX para su uso en telefonos y tablets.

El modelo transforma el titulo de una tarea (opcionalmente con su encabezado padre) en un vector de 384 dimensiones que se compara por similitud coseno contra un banco de 2.862 vectores de iconos Material Symbols precalculados. Es, por tanto, un sistema de recuperacion (retrieval) de un solo paso, sin generacion de texto, pensado para inferencia local en dispositivos con recursos limitados.

Es relevante ahora por dos motivos: demuestra una aplicacion practica de destilacion de embeddings para una tarea de dominio estrecho, y ofrece una via de despliegue en movil con ONNX en fp16 (235 MB) o int8 (118 MB). Se trata de un checkpoint intermedio (2026-11-22), no definitivo, por lo que el autor advierte que los ficheros pueden ser reemplazados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (codificador dual), base `intfloat/multilingual-e5-small` |
| Parametros totales | 118M (modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (tokenizer XLM-R SentencePiece; padding y truncation desactivados) |
| Tipos de cuantizacion | fp16 (235 MB) e int8 dinamica (118 MB) |
| Idiomas soportados | en, es, ru (evaluado tambien en siete idiomas traducidos automaticamente) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model_fp16.onnx`, `model_int8.onnx`), `tokenizer.json`, `dense.npy` (fp16 `[2862, 384]`) |

## Arquitectura y entrenamiento

El modelo es un codificador dual basado en `multilingual-e5-small`, un transformer encoder de 118M parametros con tokenizer XLM-R SentencePiece. Los ficheros ONNX mapean `input_ids` y `attention_mask` (int64, `[batch, seq]`) a `last_hidden_state` (float32, `[batch, seq, 384]`). El uso previsto es: codificar `query: ` concatenado con el titulo de la tarea (opcionalmente `"<parent heading>: <title>"`), aplicar mean-pooling y normalizacion L2, y puntuar contra `dense.npy`.

El entrenamiento parte de los datos del modelo large: aproximadamente 11,9k tareas juzgadas por un LLM (tareas sinteticas de estilo personal y tareas de MS-LaTTE, con traducciones a es y ru) mas reescrituras graduadas de registro. Sobre ello se destilo el modelo large, aplicando sus puntuaciones sobre todos los iconos a 13,7k textos de tareas sin etiquetar. El resultado es un modelo small que aproxima el comportamiento del large a menor coste.

## Capacidades

- Recuperacion semantica de iconos: asigna a cada titulo de tarea el icono Material Symbols mas afin por significado.
- Embeddings de frases multilingues en en, es y ru.
- Codificador dual con similitud coseno sobre un banco de 2.862 iconos precalculado.
- Funcionamiento local en dispositivos moviles mediante ONNX.
- Soporte de contexto jerarquico ligero: permite prefijar el encabezado padre al titulo.
- No genera texto, no hace tool calling, no soporta agentes ni vision ni audio.

## Casos de uso

- Aplicaciones de to-do en movil: el modelo selecciona automaticamente el icono de cada tarea nueva a partir del titulo, con inferencia local en ONNX fp16 o int8 sin enviar datos a la nube.
- Clasificacion visual de tareas en apps de productividad: dado un titulo como "comprar leche", el modelo recupera el icono de compra o alimentacion por similitud semantica.
- Organizacion de listas en tablets: con el banco de iconos precalculado (`dense.npy`), la puntuacion es una multiplicacion de matrices de 2.862x384, viable en tiempo real.
- Soporte multilingue en es y ru: la app puede ofrecer la misma seleccion de iconos a usuarios hispanohablantes y rusohablantes sin modelos separados.
- Prototipado rapido de interfaces: util para equipos que quieran validar la idea de iconos semanticos antes de comprometerse con el modelo large (nDCG@5 0.567 frente a 0.534).
- Investigacion en destilacion de embeddings: sirve como ejemplo reproducible de destilacion de un modelo large a small para una tarea de dominio estrecho con etiquetas silver.

## Benchmarks y rendimiento

Evaluacion sobre tareas de dev reservadas, etiquetadas por un juez LLM (etiquetas "silver"), con titulo mas encabezado padre como consulta:

| Modelo | nDCG@5 | hit@1 |
|---|---|---|
| task-icon-encoder-e5-small (fp16) | 0.534 | 0.659 |
| task-icon-encoder-e5-large | 0.567 | 0.714 |

El modelo small pierde mas que el large en traduccion: nDCG@5 de 0.470 a 0.511 en siete idiomas traducidos automaticamente. La cuantizacion int8 reduce aproximadamente un 30% los aciertos top-1 y baja unos 0.03 puntos de nDCG@5 respecto a fp16.

## Requisitos de hardware

- VRAM estimada: minima; el modelo es de 118M parametros y los ficheros ONNX ocupan 235 MB (fp16) o 118 MB (int8).
- GPU recomendadas: no requiere GPU; disenado para CPU en telefonos y tablets. En servidor puede ejecutarse en cualquier GPU consumer o incluso en CPU.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) y en dispositivos moviles.
- Opciones de despliegue: ONNX Runtime (formato nativo); no se mencionan vLLM, llama.cpp ni Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada. Con int8, el autor advierte de no hacer batching de textos, ya que la cuantizacion dinamica escala las activaciones sobre toda la entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | nDCG@5 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| task-icon-encoder-e5-small (este) | 118M | no disponible | 0.534 | MIT | ONNX en HF |
| task-icon-encoder-e5-large | no disponible | no disponible | 0.567 | no disponible | HF |
| intfloat/multilingual-e5-small (base) | 118M | no disponible | no disponible (no especializado en iconos) | MIT | HF |

## Limitaciones y advertencias

- Checkpoint intermedio (2026-11-22): el autor advierte que los ficheros pueden ser reemplazados; conviene fijar una revision si se depende de el.
- La cuantizacion int8 cambia aproximadamente el 30% de las elecciones top-1 y baja unos 0.03 puntos de nDCG@5; usar fp16 si la precision importa.
- Con int8 no se deben procesar lotes de textos: la cuantizacion dinamica hace que el vector de un texto dependa de sus companeros de lote.
- El modelo small pierde rendimiento en idiomas traducidos automaticamente (nDCG@5 0.470-0.511 en siete idiomas) respecto a en, es y ru.
- Etiquetas de evaluacion "silver" generadas por un juez LLM, no por anotacion humana.
- Dominio muy estrecho: solo selecciona iconos Material Symbols; no es un modelo de proposito general.
- Licencia MIT para el modelo; los iconos Material Symbols son de Google bajo Apache 2.0 y el modelo base es de intfloat bajo MIT.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AntonDergunov/task-icon-encoder-e5-small-interim
- Modelo large hermano: https://huggingface.co/AntonDergunov/task-icon-encoder-e5-large-interim
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Material Symbols (Google Fonts): https://fonts.google.com/icons
- Dataset MS-LaTTE: https://github.com/microsoft/MS-LaTTE
