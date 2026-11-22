# root-sys-n/Mima-2-Photon-15m

## Resumen

Mima 2 Photon es un modelo de lenguaje de tipo "small language model" desarrollado por el usuario root-sys-n, disenado especificamente para el idioma turco y pensado para ejecutarse de forma nativa en el navegador. Con 17,40 millones de parametros totales (15,77 millones sin contar los embeddings), es un modelo extremadamente compacto que se distribuye como un unico archivo ONNX en FP16 de aproximadamente 34 MB, lo que permite su ejecucion en cliente mediante `onnxruntime-web` sin necesidad de infraestructura de servidor.

El modelo aborda un problema concreto: la ausencia de modelos de lenguaje turcos ligeros que quepan en un navegador y que, a la vez, mantengan un comportamiento fiable en tareas de llamada a herramientas y en la evitacion de alucinaciones. Para ello incorpora un modo de razonamiento explicito delimitado por los tokens `<think>` y `</think>`, que el autor presenta como un mecanismo que mejora la seleccion correcta de herramientas y la honestidad ante preguntas sin respuesta en el corpus de entrenamiento.

Su relevancia actual radica en la combinacion de tres factores poco habituales en modelos de este tamano: arquitectura transformer moderna con Grouped-Query Attention y QK-Norm, soporte nativo de tool calling mediante una sintaxis propia (`@arac:`), y despliegue en el navegador como un unico artefacto ONNX. Esta orientado a aplicaciones de asistencia local, demos interactivas y entornos con requisitos estrictos de privacidad o de ausencia de backend.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA 5:1, QK-Norm, RoPE, Logit Soft-Cap (30.0) y ShortConv causal 1D (kernel=4) antes de QKV |
| Parametros totales | 17,40 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (ONNX y PyTorch); no se documentan otras |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (FP16, ~34 MB) y PyTorch `.pt` (FP16); tokenizer en `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 16 capas con `d_model = 320` y `d_ff = 768` con activacion SwiGLU. Emplea Grouped-Query Attention con una relacion 5:1, QK-Norm, embeddings rotatorios (RoPE) y un logit soft-cap de 30.0. Antes de las proyecciones QKV incorpora una convolucion causal 1D de kernel 4 (`ShortConv`) orientada a capturar morfologia turca local, un detalle relevante en una lengua aglutinante con alta productividad de sufijos. El vocabulario es un BPE turco de 16.384 tokens con `emb_dim = 96` y embeddings factorizados y atados (`tied factorized embedding`), lo que explica la diferencia entre parametros totales y no-embedding. Define tokens especiales explicitos: `<|bos|>` (0), `<|user|>` (1), `<|assistant|>` (2), `<|end|>` (3), `<|pad|>` (4), `<think>` (5) y `</think>` (6).

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste por instrucciones. El autor documenta un analisis de "logit lens" sobre las 16 capas que situa el procesamiento morfologico turco en las capas L00-L03 y la cristalizacion de las decisiones de llamada a herramienta (`@arac:`) y de caracter factual en L10-L15. Tambien reporta evaluaciones controladas en las que un paso breve de `<think>` mejora la seleccion de herramientas (clima, hora, aritmetica) y reduce la invencion de respuestas ante preguntas con premisas falsas o sobre eventos futuros.

## Capacidades

- Generacion de texto en turco con soporte de conversacion multi-turno mediante tokens de rol.
- Modo de razonamiento explicito (`<think>...</think>`) activable para tareas que requieren un paso intermedio antes de responder.
- Tool calling nativo con sintaxis propia `@arac:`; el autor documenta llamadas a `hava` (clima, con parametro `sehir`), `saat` (hora) y `hesap` (aritmetica, con parametro `ifade`).
- Aritmetica de varios digitos derivada a herramienta en lugar de resolverse de memoria (ejemplos reportados: `312 * 14 = 4368`, `78 * 19 = 1482`).
- Comportamiento de rechazo ante preguntas sin respuesta en el corpus o con premisas incorrectas (por ejemplo, "cual es la provincia numero 99 de Turquia" o el ganador del Nobel de Fisica de 2035).
- Respuesta directa sin abrir `<think>` en saludos y consultas simples, segun el autor.
- Ejecucion nativa en navegador mediante `onnxruntime-web` con un unico archivo ONNX.
- Capacidades multilingues: limitadas al turco segun la metadata del modelo.
- No se documentan capacidades de vision, audio ni agentes multi-paso complejos.

## Casos de uso

- Asistente conversacional embebido en una web turca: el modelo se carga como un ONNX de ~34 MB en el navegador y gestiona dialogos de saludo, preguntas simples y respuestas directas sin backend, lo que reduce costes de servidor y mantiene la conversacion en el cliente.
- Demo interactiva de un modelo de lenguaje sin infraestructura: util para talleres, articulos o prototipos donde se quiere mostrar generacion de texto en turco en tiempo real sin GPU ni API, aprovechando el formato ONNX y `onnxruntime-web`.
- Enrutado de herramientas en un panel de clima o de hora: el modelo interpreta la consulta del usuario y emite `@arac: hava | sehir=...` o `@arac: saat` para que el frontend ejecute la llamada real y devuelva el dato, evitando que el modelo invente cifras.
- Calculadora conversacional: para expresiones aritmeticas de varios digitos, el modelo deriva a `@arac: hesap | ifade=...` en lugar de calcular de memoria, lo que segun el autor elimina errores en operaciones como `312 * 14`.
- Filtro de honestidad en formularios o chatbots de atencion: el modo `<think>` permite que el modelo rechace preguntas con premisas falsas o sobre datos no disponibles, reduciendo respuestas inventadas en entornos donde la exactitud es critica.
- Prototipado de modelos turcos en investigacion: por su tamano (17,40 M) y su licencia Apache 2.0, sirve como banco de pruebas para estudiar morfologia turca, efectos del razonamiento explicito en modelos pequenos o tecnicas de logit lens capa a capa.
- Despliegue en entornos con privacidad estricta: al ejecutarse en el navegador y no requerir envio de datos a un servidor, encaja en aplicaciones donde la conversacion no puede salir del dispositivo del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor presenta unicamente una comparativa propia denominada "Mima-TR-MicroBench" y un analisis de logit lens por capas, sin cifras numericas reproducibles en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP16 (pesos de ~34 MB mas activaciones y cache de atencion, no cuantificados en la informacion disponible).
- GPU recomendadas: no se especifican; por tamano, cualquier GPU consumer moderna es sobradamente suficiente, e incluso la ejecucion en CPU resulta viable.
- Cabe en GPU consumer: si, en cualquier GPU consumer actual; tambien en CPU y en el propio navegador.
- Opciones de despliegue: `onnxruntime-web` (navegador, formato nativo del modelo), ONNX Runtime en servidor o escritorio, y PyTorch con los pesos `.pt` en FP16. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (small language models turcos o modelos de menos de 50 M de parametros con despliegue en navegador), por lo que no es posible establecer una comparativa con datos verificables.

## Limitaciones y advertencias

- Modelo disenado exclusivamente para turco; no se documenta soporte de otros idiomas y la metadata solo declara `tr`.
- Con 17,40 M de parametros, la capacidad de conocimiento general y de razonamiento es muy limitada; el propio autor enfatiza el uso de herramientas para aritmetica y datos actuales.
- Riesgo de alucinacion: el autor reporta que el modo `<think>` mitiga la invencion de respuestas, pero no se documentan tasas de error ni evaluaciones independientes.
- Longitud de contexto no disponible: no se puede garantizar el comportamiento en conversaciones largas ni en documentos extensos.
- No se documentan sesgos conocidos, composicion del dataset de entrenamiento ni proceso de alineacion, lo que dificulta evaluar riesgos de sesgo.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero el modelo se distribuye sin garantias y sin datos de entrenamiento publicados.
- Ausencia de benchmarks estandar y de evaluaciones de terceros: las afirmaciones de rendimiento provienen unicamente del autor.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- El soporte de tool calling depende de una sintaxis propietaria (`@arac:`) que el integrador debe parsear y ejecutar; no sigue el esquema estandar de function calling de OpenAI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/root-sys-n/Mima-2-Photon-15m
- No se han encontrado en la informacion disponible otros enlaces a papers, blogs, repositorios o demos.
