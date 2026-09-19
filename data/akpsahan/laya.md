# akpsahan/laya

## Resumen

Laya es un modelo de decisión no autorregresivo de tipo "System 1" desarrollado por ConvAI Innovations. No genera texto: recibe un estado (texto libre, correo, ticket o JSON) junto con preguntas tipadas y devuelve, en una única pasada forward, respuestas también tipadas acompañadas de probabilidades calibradas. Está pensado para tareas de enrutamiento, clasificación, puntuación ordinal y guardrails donde lo que importa es la probabilidad honesta de cada opción y no la fluidez del texto generado. El checkpoint principal emplea un backbone ModernBERT-large de 395M de parámetros más una cabeza de decisión de 421M en total, con una ventana de 512 tokens por pregunta.

La innovación central es su entrenamiento mediante RLCD (Reinforcement Learning for Calibrated Decisions): la política emite una distribución sobre las opciones definidas en tiempo de petición, se añade ruido gaussiano de media cero a los logits durante la exploración y la recompensa es una regla de puntuación estrictamente propia (log + spherical, más ranked probability score para preguntas ordinales). Como el único modo de maximizar la recompensa esperada es reportar probabilidades sinceras, el modelo queda calibrado por construcción y, al no generar texto, no hay nada que parsear ni nada que alucinar. El repositorio aloja tres checkpoints: el inglés en la raíz, uno multilingüe (mmBERT-base, 322M, contexto 1024) y uno orientado a flujos de decisiones tipadas (ModernBERT-large, 421M, contexto 1024).

Es relevante ahora porque ofrece una alternativa de 33-39,5 ms por pregunta frente a los 236-276 ms p50 medidos de forma independiente para TypeSafe Jev, es decir, entre 6 y 7 veces más rápido, con licencia Apache 2.0 y uso comercial permitido. Según la model card, el espacio de respuestas se define en la petición, de modo que esquemas nuevos no requieren reentrenamiento. Existe una discrepancia de identidad: la página de HuggingFace consultada es `akpsahan/laya`, mientras que la model card y los ejemplos de código apuntan a `convaiinnovations/laya`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone ModernBERT-large (395M, bidireccional, fine-tuning completo) mas cabeza de decision entrenada desde cero: 2 capas transformer, un scorer de marcadores de opcion y una cabeza act/escalate. No autorregresiva |
| Parametros totales | 421.293.830 (421M) para el checkpoint ingles y el de typed-decisions; 322M para el checkpoint multilingue |
| Longitud de contexto | 512 tokens por pregunta (pregunta + opciones + estado) en el checkpoint ingles; 1024 tokens en los checkpoints multilingue y typed-decisions |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Checkpoint raiz: ingles. Subcarpeta `multilingual`: mas de 100 idiomas. El campo de idiomas de la pagina de HuggingFace figura como no disponible |
| Licencia | Apache 2.0 (uso comercial permitido) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura combina un encoder ModernBERT-large de 395M de parametros, bidireccional y afinado por completo, con una cabeza de decision entrenada desde cero que aporta 2 capas transformer adicionales, un scorer de marcadores de opcion y una cabeza act/escalate, hasta los 421M totales. Cada opcion se puntua en su propio token `[MASK]` y despues se aplica softmax sobre las opciones de esa pregunta; el espacio de respuesta se define en tiempo de peticion, por lo que esquemas nuevos no exigen reentrenamiento. Todas las preguntas de una misma llamada se responden en una sola pasada forward, con un presupuesto de 512 tokens por pregunta (pregunta + opciones + estado) en el checkpoint ingles.

El entrenamiento sigue el esquema RLCD: la politica emite una distribucion, la exploracion anade ruido gaussiano de media cero a los logits y la recompensa es una regla de puntuacion estrictamente propia (log + spherical, mas ranked probability score para preguntas ordinales). Las actualizaciones usan REINFORCE con baseline de media de grupo, al estilo GRPO. Las conversaciones multiturno se tratan con TD(λ=1.0) sobre porciones de prefijo. La model card cifra el entrenamiento en 7.313 actualizaciones, 1 epoca y aproximadamente 1,96 horas, con temperaturas ajustadas de [1.637, 1.251, 1.983] y escalado por numero de opciones. El modelo esta etiquetado como text-classification y no dispone de modo thinking, vision ni audio.

## Capacidades

- Clasificacion de eleccion (`choice`): devuelve la opcion seleccionada, la probabilidad de cada opcion y una medida de confianza.
- Puntuacion ordinal (`score`): devuelve el nivel esperado en una rubrica ordinal definida por el usuario, la distribucion completa y la confianza.
- Probabilidad calibrada de verdad (`noul`): devuelve P(true) calibrada, util para guardrails y moderacion.
- Inferencia no generativa: no produce texto libre, por lo que no hay salida que parsear ni riesgo de alucinacion en la respuesta.
- Definicion de esquemas en tiempo de peticion: opciones, rubricas y criterios se declaran en cada llamada sin reentrenar el modelo.
- Batching interno: todas las preguntas de una misma llamada se resuelven en una unica pasada forward.
- Multilingue: la subcarpeta `multilingual` cubre mas de 100 idiomas y resulta aproximadamente 2 veces mas rapida que el checkpoint ingles.
- Conversaciones multiturno mediante TD(λ=1.0) sobre porciones de prefijo.
- Enrutamiento entre checkpoints con la clase `Router`, que carga de forma perezosa solo lo que necesita cada peticion o precarga todos los checkpoints.
- Cabeza act/escalate para decidir si una peticion se resuelve o se escala a revision humana.
- No soporta tool calling ni function calling, no ejecuta razonamiento multi-paso generativo ni genera codigo.

## Casos de uso

- Enrutamiento de tickets de soporte: con una pregunta de tipo `choice` se asigna el ticket al equipo correcto (facturacion, tecnico, ventas) leyendo asunto y cuerpo, y con una pregunta `score` se estima la urgencia en una rubrica ordinal. El modelo resuelve ambas preguntas en una sola pasada y devuelve la probabilidad de cada opcion, lo que permite fijar umbrales de confianza.
- Deteccion de riesgo de abandono: una pregunta `noul` sobre el texto del cliente estima P(amenaza de cancelacion) de forma calibrada, de modo que el equipo de retencion puede priorizar por probabilidad real y no por una puntuacion sin significado probabilistico.
- Guardrails y moderacion de contenido: usando `noul` como clasificador binario calibrado se obtiene P(peligroso) para cada entrada y se decide el bloqueo con umbrales auditables. El modelo no genera texto, asi que no puede producir contenido nocivo por si mismo.
- Triaje de correo entrante: combinando `choice` para la categoria, `score` para la prioridad y `noul` para "requiere respuesta humana", se construye un clasificador de bandeja de entrada completo que procesa cada mensaje en una sola llamada con todas sus preguntas batchadas.
- Priorizacion de leads comerciales: una rubrica ordinal `score` sobre el historial de contacto devuelve el nivel esperado de cualificacion con su distribucion, lo que permite ordenar la cola de ventas y calcular el valor esperado de cada accion.
- Enrutamiento multilingue en produccion: con `Router(preload=True)` se encamina cada peticion al checkpoint ingles o al multilingue segun el idioma detectado; en una carga mixta con 50% de trafico no ingles el autor cifra la mejora en hasta 4,8 veces, y la precarga evita reconstruir el checkpoint en cada peticion (7,4 s de mediana en CPU y 10,3 s en T4 en frio).
- Escalado a revision humana: la cabeza act/escalate y las probabilidades calibradas permiten derivar a un operador las decisiones con confianza baja, dejando el resto en automatico.
- Clasificacion de formularios y JSON: al aceptar estados estructurados, el modelo puntua campos declarados en la peticion, lo que sirve para validacion de datos entrantes y deteccion de incoherencias con una probabilidad asociada.

## Benchmarks y rendimiento

Datos publicados por el autor, medidos en una Tesla T4 y con todos los checkpoints respondiendo preguntas identicas en la misma ejecucion.

| Preguntas por llamada | `laya` | `laya-multilingual` |
|---|---|---|
| 1 | 39,5 ms | 32,8 ms |
| 10 | 158,6 ms (15,9 ms/pregunta) | 72,3 ms (7,2 ms/pregunta) |
| 50 | 771 ms | 337 ms (6,8 ms/pregunta) |

Throughput declarado en modo batch: entre 103 y 332 preguntas por segundo. El resumen del modelo cita 33 ms por pasada forward. Frente a TypeSafe Jev, medido de forma independiente en 236-276 ms p50 por AbdelStark y nibzard, Laya responde una sola pregunta aproximadamente 6-7 veces mas rapido. La model card anuncia ademas una comparativa de precision, calibracion y coste de enrutamiento entre Laya (con routing) y Jev para todos los flujos de aplicacion y 51 idiomas, pero el contenido proporcionado esta truncado justo en ese punto, por lo que no se dispone de las cifras. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de conocimiento o generacion, y en cualquier caso no serian aplicables a un modelo no generativo.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. Como referencia derivada del recuento real de parametros (421,3M), los pesos ocuparian aproximadamente 1,7 GB en fp32, 0,85 GB en fp16/bf16, 0,42 GB en int8 y 0,21 GB en int4, antes de sumar activaciones y overhead del runtime. El repositorio completo ocupa 2,4 GB porque aloja tres checkpoints, pero solo se descarga el que se solicita.
- GPU recomendadas: no hay una lista publicada. El autor reporta mediciones en Tesla T4 y en CPU, lo que indica que el modelo funciona en hardware modesto; el checkpoint raiz tardo una mediana de 7,4 s en CPU y 10,3 s en T4 en la reconstruccion en frio del checkpoint.
- GPU de consumo: por tamano (0,85 GB en fp16 y ~0,21 GB en int4) cabe en practicamente cualquier GPU de consumo con 4 GB o mas de VRAM, incluidas GTX 1650, RTX 3060, RTX 4060 y superiores. No se han publicado mediciones especificas en estas tarjetas.
- Opciones de despliegue: el modelo esta en formato safetensors y se carga con la libreria `transformers` (pipeline `text-classification`), ademas del paquete propio `laya` (`pip install laya`), que expone `laya.load(...)` y la clase `Router`. La etiqueta `endpoints_compatible` esta presente, por lo que es compatible con HuggingFace Inference Endpoints. No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni GGUF, coherente con que no es un modelo generativo.
- Latencia y throughput: 39,5 ms para una pregunta y 158,6 ms para diez en T4 con el checkpoint ingles; 32,8 ms y 72,3 ms respectivamente con el multilingue; 771 ms y 337 ms para 50 preguntas. Entre 103 y 332 preguntas por segundo en batch.
- Advertencia de arranque: si `laya.load()` se queda colgado, se recomienda ejecutar con `USE_TF=0`, porque `transformers` sondea TensorFlow al importar y su runtime abseil puede bloquear la construccion del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Latencia publicada | Licencia |
|---|---|---|---|---|---|
| Laya (ingles) | 421M | 512 tokens por pregunta | Decision no autorregresiva, salida tipada con probabilidades | 39,5 ms por pregunta (T4) | Apache 2.0 |
| Laya multilingual | 322M | 1024 tokens por pregunta | Igual, con mmBERT-base y 100+ idiomas | 32,8 ms por pregunta (T4) | Apache 2.0 |
| Laya typed-decisions | 421M | 1024 tokens por pregunta | Igual, orientado a flujos de decisiones tipadas | no disponible | Apache 2.0 |
| TypeSafe Jev | no disponible | no disponible | Modelo de decision comparable | 236-276 ms p50 (medicion de terceros) | no disponible |

Las cifras de Jev provienen de benchmarks publicados por terceros (AbdelStark y nibzard) y se citan en la model card de Laya; no se dispone de sus parametros, contexto ni licencia en la informacion proporcionada. No se conocen otras alternativas comparables en la informacion disponible.

## Limitaciones y advertencias

- El modelo no genera texto: cualquier caso de uso que requiera resumen, redaccion, codigo o dialogo generativo queda fuera de su alcance.
- No soporta tool calling, function calling ni razonamiento multi-paso de tipo agente.
- La ventana es de 512 tokens por pregunta (1024 en los otros dos checkpoints) contando pregunta, opciones y estado; estados largos obligan a truncar o resumir previamente.
- El checkpoint raiz solo esta entrenado para ingles. El soporte de mas de 100 idiomas depende de cargar la subcarpeta `multilingual`.
- La calibracion es una propiedad estadistica, no una garantia por caso: en dominios muy alejados de la distribucion de entrenamiento las probabilidades pueden degradarse y conviene monitorizarlas.
- Las opciones y rubricas se definen en cada peticion, por lo que un esquema mal disenado o con opciones solapadas puede producir resultados ambiguos aunque las probabilidades esten calibradas.
- La model card reporta solo 1 epoca y 7.313 actualizaciones de entrenamiento sobre 421M de parametros, un regimen corto; no se documentan evaluaciones de sesgo, robustez ni seguridad mas alla de la comparativa con Jev.
- El rendimiento declarado esta medido en una Tesla T4; no hay cifras publicadas para A100, H100 u otras GPU.
- La licencia Apache 2.0 permite uso comercial, modificacion y redistribucion, pero no incluye garantias ni asuncion de responsabilidad por parte de los autores.
- Discrepancia de identidad relevante para trazabilidad: la pagina consultada es `akpsahan/laya`, mientras que la model card, los ejemplos de codigo y los checkpoints hermanos apuntan a `convaiinnovations/laya` y `convaiinnovations/laya-multilingual`. Conviene verificar cual es el repositorio canonico antes de integrarlo.
- El repositorio registra 0 descargas y 0 likes y una fecha de creacion de 2026-09-19, posterior a la fecha de consulta; estos metadatos no son fiables como senal de madurez o adopcion.

## Enlaces

- Pagina de HuggingFace del modelo: https://huggingface.co/akpsahan/laya
- Checkpoint multilingue referenciado en la model card: https://huggingface.co/convaiinnovations/laya-multilingual
- Benchmark independiente de TypeSafe Jev (AbdelStark): https://github.com/AbdelStark/jev-benchmarks
- Benchmark independiente de modelos de decision (nibzard): https://github.com/nibzard/decision-model-benchmark
- No se han encontrado en la busqueda web otros enlaces relevantes (paper, blog o repositorio del modelo). Los resultados devueltos corresponden a paginas corporativas de Microsoft y no guardan relacion con el modelo.
