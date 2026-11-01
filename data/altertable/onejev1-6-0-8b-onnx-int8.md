# altertable/onejev1.6-0.8b-onnx-int8

## Resumen

OneJev1.6-0.8B ONNX int8 es una version cuantizada a int8 y exportada a ONNX del decodificador de texto de OmniJev/OneJev1.6-0.8B, un modelo de decision desarrollado por el equipo OmniJev y afinado a partir de Qwen/Qwen3.5-0.8B. La publica el usuario altertable como artefacto orientado a CPU: recibe un estado (texto libre o JSON) y una bateria de preguntas tipadas, y devuelve una probabilidad para cada opcion de respuesta. No es un modelo generativo al uso: su salida es la distribucion sobre las letras A-Z de la cabeza de salida, lo que lo convierte en un clasificador zero-shot con opciones definidas en el propio prompt.

El interes practico esta en el empaquetado. Frente al modelo base en PyTorch, esta version ejecuta las 96 proyecciones como `DynamicQuantizeMatMul` de ONNX Runtime (pesos int8, activaciones cuantizadas en tiempo de ejecucion), lo que segun el autor rinde aproximadamente el triple que un GEMM fp32 en arm64. Todo el grafo, decodificador y cabeza de lectura, va en un unico `model.onnx` de 1,01 GB con embeddings en fp16, y se ejecuta con `onnxruntime>=1.31`, `tokenizers` y `numpy`, sin PyTorch.

La relevancia es doble: por un lado, demuestra un caso de clasificacion y enrutado multilingue (en, fr, de, es, ja, zh) ejecutable en CPU sin GPU; por otro, documenta con detalle el proceso de exportacion de una arquitectura hibrida (18 capas Gated DeltaNet mas 6 capas de atencion completa) a operadores contrib de ONNX Runtime. Conviene subrayar que solo incluye el decodificador de texto: el modelo original tambien procesa imagen y video, pero la torre de vision no forma parte de este artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 18 capas Gated DeltaNet (delta rule via `com.microsoft.LinearAttention`) + 6 capas de atencion completa; decodificador + cabeza de lectura en un unico grafo ONNX |
| Parametros totales | 0,8B (heredados de Qwen3.5-0.8B como base del afinado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 32.768 tokens por pregunta (`max_len` por defecto); entradas mas largas lanzan `onejev_onnx.Unsupported`, no se truncan |
| Tipos de cuantizacion | int8 en las 96 proyecciones (pesos int8, activaciones cuantizadas en runtime); embeddings en fp16 |
| Idiomas soportados | en, fr, de, es, ja, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model/model.onnx`, 1,01 GB) + `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo base OneJev1.6-0.8B es un transformer hibrido construido sobre Qwen3.5-0.8B. La parte recurrente son 18 capas Gated DeltaNet que aplican la delta rule mediante el operador `com.microsoft.LinearAttention` con `update_rule=gated_delta`, normalizando q y k en L2 antes de la operacion. La convolucion causal corta de estas capas se implementa como cuatro multiply-add desplazados, que segun el autor corren mas rapido en ONNX Runtime que `CausalConvWithState` o una `Conv` depthwise. A esas 18 capas se suman 6 capas de atencion completa, que son las responsables de que el coste de memoria crezca con el cuadrado de la longitud de entrada.

La exportacion se hizo en fp32 sobre los kernels de CPU de ONNX Runtime y despues se cuantizo a int8. El autor declara explicitamente que no hubo fine-tuning, destilacion ni calibracion durante este proceso: es una conversion pura del checkpoint original. El grafo usa operadores contrib (`com.microsoft.LinearAttention`, `GroupQueryAttention`, `RotaryEmbedding`, `DynamicQuantizeMatMul`), de ahi el requisito de ONNX Runtime 1.31 o superior. El prompt es fijo y reproducible: plantilla de chat con thinking desactivado, un turno de sistema fijo y un turno de usuario con el estado entre etiquetas `<state>`, la pregunta y las opciones listadas como `A. clave: descripcion` (version de prompt `onejev-labels-v2`). No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Clasificacion zero-shot con opciones definidas en el prompt: entre 2 y 26 opciones por pregunta, con una probabilidad por opcion.
- Preguntas de tipo `choice` (una probabilidad por cada opcion) y de tipo `noul` (si/no, devuelve p(yes)).
- Entrada de estado en texto libre o en JSON (el JSON se indenta con 2 espacios en el prompt).
- Multilingue en seis idiomas: ingles, frances, aleman, espanol, japones y chino, con rendimiento declarado similar al ingles en el conjunto de evaluacion del autor.
- Procesamiento por lotes: las preguntas de una misma llamada se ejecutan como filas con padding a la derecha en pasadas compartidas.
- Inferencia en CPU sin PyTorch, solo con onnxruntime, tokenizers y numpy.
- No soporta preguntas de tipo `score`, ni elecciones de mas de 26 opciones, ni imagen o video; para esas funciones hay que recurrir al servidor propio de OneJev (Flide).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Enrutado de tickets de soporte: el ejemplo oficial clasifica un ticket entre equipos (billing, tech, sales) con una descripcion corta por opcion; el modelo devuelve la distribucion de probabilidad, lo que permite umbralizar y derivar a revision humana los casos ambiguos.
- Deteccion de intencion de reembolso: con una pregunta `noul` ("Does the customer ask for money back?") se obtiene p(yes) y se decide si abrir un flujo de devolucion, sin necesidad de un clasificador entrenado a medida.
- Clasificacion multilingue en atencion al cliente: al responder de forma comparable en los seis idiomas soportados, permite usar un unico modelo para tickets en frances, aleman, espanol, japones o chino en lugar de mantener un clasificador por idioma.
- Etiquetado de datos y triaje previo: al ser zero-shot, sirve para prototipar taxonomias rapidamente antes de invertir en anotacion; las probabilidades por opcion permiten medir la confianza del etiquetado.
- Despliegue en entornos sin GPU: con 1,01 GB de grafo int8 y solo ONNX Runtime como dependencia, encaja en servicios de CPU, contenedores ligeros o dispositivos arm64 donde no hay acelerador disponible.
- Extraccion de decisiones estructuradas en pipelines de datos: el estado puede ser un objeto JSON, de modo que se puede encadenar la salida de un ETL o de una consulta a base de datos directamente como entrada del modelo y obtener una etiqueta por registro.
- Moderacion o filtrado por categorias: definir las categorias como opciones con descripcion y usar la probabilidad maxima como senal de asignacion, con la ventaja de que la taxonomia se cambia editando el prompt y no reentrenando.

## Benchmarks y rendimiento

El autor reporta una evaluacion propia sobre 216 decisiones de tickets de soporte en seis idiomas, con la conclusion cualitativa de que el modelo responde a tickets no ingleses de forma aproximadamente equivalente a los ingleses. No se publican cifras numericas por idioma ni comparaciones con MMLU, HumanEval, GSM8K u otros benchmarks estandar en la informacion disponible.

| Metrica | Resultado |
|---|---|
| Decisiones de soporte evaluadas | 216, en seis idiomas |
| Rendimiento por idioma | no disponible en cifras; el autor indica paridad aproximada con el ingles |
| Aceleracion int8 vs fp32 GEMM en arm64 | aproximadamente 3x (declarado por el autor) |
| Benchmarks estandar (MMLU, HumanEval, GSM8K) | no disponibles |

## Requisitos de hardware

- VRAM: no aplica, el artefacto esta pensado para CPU; el grafo ocupa 1,01 GB en disco y la memoria residente depende del numero de hilos y de la longitud de las secuencias.
- Memoria RAM: crece con el cuadrado de la longitud de entrada en las 6 capas de atencion completa, segun advierte el autor; con contexto corto el consumo es moderado, con secuencias cercanas a 32.768 tokens puede ser elevado.
- GPU: no son necesarias ni se documentan; el modelo esta optimizado para `DynamicQuantizeMatMul` en CPU. En arm64 se reporta la mayor ganancia frente a fp32.
- CPU: se recomienda un numero de hilos configurable (`threads=8` en el ejemplo oficial); no se especifican modelos concretos de CPU.
- Despliegue: ONNX Runtime 1.31 o superior con operadores contrib, mas `tokenizers>=0.20` y `numpy>=1.26`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras absolutas; solo la comparacion relativa de aproximadamente 3x frente a fp32 GEMM en arm64.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Ejecucion |
|---|---|---|---|---|---|
| OneJev1.6-0.8B ONNX int8 (este) | 0,8B | 32.768 tokens por pregunta | Clasificacion zero-shot por opciones, solo texto | Apache-2.0 | CPU via ONNX Runtime |
| OmniJev/OneJev1.6-0.8B (base) | 0,8B | no disponible | Decision multimodal (texto, imagen, video), incluye preguntas `score` | no disponible en la informacion proporcionada | Servidor propio (Flide) |
| Qwen/Qwen3.5-0.8B (modelo de partida) | 0,8B | no disponible | LLM generativo de proposito general | no disponible en la informacion proporcionada | PyTorch y ecosistema habitual |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, enfoque y formato de despliegue.

## Limitaciones y advertencias

- Solo texto: la torre de vision del modelo original no esta incluida, de modo que no procesa imagenes ni video.
- No soporta preguntas de tipo `score` ni elecciones de mas de 26 opciones, y no trunca entradas: si se supera `max_len` lanza una excepcion en lugar de recortar.
- El coste de memoria crece con el cuadrado de la longitud en las 6 capas de atencion completa, lo que limita el uso de contextos muy largos en maquinas modestas.
- No hubo calibracion en la cuantizacion int8; el autor declara que es una conversion directa, por lo que pueden existir perdidas de precision no cuantificadas en la model card.
- Riesgo de alucinacion y de calibracion deficiente en las probabilidades: al ser un modelo de decision pequeno, conviene validar los umbrales de confianza con datos propios antes de automatizar acciones.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible.
- La evaluacion del autor se limita a 216 decisiones de soporte en seis idiomas; es una muestra pequena y no cubre dominios fuera de atencion al cliente.
- Licencia Apache-2.0 permisiva para uso comercial, pero deben respetarse las atribuciones indicadas en NOTICE y LICENSES.md, que remiten a los autores originales de OneJev y a la base Qwen3.5.
- Requiere ONNX Runtime 1.31 o superior por el uso de operadores contrib; versiones anteriores no cargaran el grafo.
- El repositorio registra cero descargas y cero likes en el momento de la consulta, y fue creado y actualizado el mismo dia: no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/altertable/onejev1.6-0.8b-onnx-int8
- Modelo base: https://huggingface.co/OmniJev/OneJev1.6-0.8B
- Modelo de partida (Qwen3.5-0.8B): https://huggingface.co/Qwen/Qwen3.5-0.8B
- Codigo de exportacion: https://github.com/altertable-ai/duckdb-decision_tune/tree/2b50dab8fb282b7d9139b52c2ae0bd5c0cdf85d5/scripts/export
- Servidor de OneJev (Flide): https://github.com/OmniJev/Flide
