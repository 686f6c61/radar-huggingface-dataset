# Aneurologic/afm-juri-lite-32m

## Resumen

AFM Juri Lite 32M es un modelo de decisión de muy pequeño tamano (32,3 millones de parametros) desarrollado por Aneurologic. No es un modelo generativo: recibe un contexto y una o varias preguntas con opciones (si/no o seleccion entre alternativas) y devuelve, en un unico forward pass, una probabilidad para cada opcion. Esta construido sobre el checkpoint `cross-encoder/ettin-reranker-32m-v1`, de arquitectura ModernBERT, y se distribuye bajo licencia Apache-2.0.

Su interes practico esta en el nicho que ocupa: clasificacion y enrutamiento de decisiones a muy baja latencia y en hardware modesto. Segun la model card, procesa una decision de 256 tokens con 4 opciones en 21 ms en la CPU de un Apple M1 y en 4,7 ms en un Jetson Orin Nano Super con el forward pass capturado como grafo CUDA. Esto lo situa como candidato para preprocesado on-device, deteccion de intencion, comprobaciones de llamadas a funciones y filtros de primera pasada.

El modelo se presenta acompanado de un indice de evaluacion propio, el Decision Index 0.3 (37 benchmarks en cinco areas, corregido por azar), en el que obtiene 34,48 puntos frente a los 33,19 de Amber 32M en la ejecucion del propio autor. Es relevante ahora porque ejemplifica una tendencia: modelos diminutos especializados en tareas de decision estructurada, en lugar de LLM generativos, para pipelines donde el coste por inferencia y el consumo energetico son criticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder, base `cross-encoder/ettin-reranker-32m-v1`) |
| Parametros totales | 32.326.273 (32,3 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (sin truncado segun la model card) |
| Tipos de cuantizacion | no disponible (la model card menciona ejecucion en fp32 y fp16; no se documentan pesos GGUF ni cuantizaciones de 4/8 bits) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de `cross-encoder/ettin-reranker-32m-v1`, un reranker Apache-2.0 construido sobre la arquitectura ModernBERT y derivado a su vez de `jhu-clsp/ettin-encoder-32m` (MIT). ModernBERT es un encoder transformer con attention de tipo full, pensado para secuencias largas y eficiente en hardware moderno; el checkpoint base conserva la cabeza de clasificacion adaptada a la tarea de decision.

El entrenamiento de decision consistio en 2 epocas, 100.790 pasos de optimizador y 3.000 millones de tokens, con secuencias de hasta 8.192 tokens y aproximadamente 1,26 millones de registros de decision. Cada pregunta se entreno con su respuesta correcta y, segun la model card, con opciones descritas de forma explicita para la mayoria de las preguntas. No se documenta en la informacion disponible el uso de RLHF, DPO ni de un proceso de alineacion adicional. La innovacion tecnica destacable no esta en la arquitectura sino en el modo de uso: multiples preguntas se agrupan en un unico forward pass batcheado, cada pregunta como su propia secuencia, y en el soporte de captura de grafo CUDA (`graph=True`) para eliminar el coste de lanzamiento por capa en dispositivos embebidos.

## Capacidades

- Clasificacion de decisiones con salida probabilistica: preguntas de tipo `yes_no` y de tipo `choice` (dos o mas opciones descritas).
- Deteccion de intencion en dominios de banca y servicios: segun la model card, skill 0.92 en BANKING77 y 0.87 en CLINC150.
- Decisiones de phishing sobre el benchmark PhishNChips: 0.88.
- Comprobacion de llamadas a funciones (function-call checks) con BFCL 0.77.
- Decisiones de llamar, preguntar o responder en el formato When2Call (0.68) y en API-Bank (0.63).
- Procesamiento de contexto como cadena de texto o diccionario plano, renderizado como lineas `clave: valor`.
- Batching de varias preguntas en una sola pasada.
- No genera texto; no soporta tool calling generativo ni razonamiento multi-paso en el sentido de un LLM.
- Solo ingles.

## Casos de uso

- Enrutamiento de intencion en atencion al cliente: dado el mensaje de un usuario, clasificarlo entre un conjunto cerrado de intenciones (tarjeta perdida, consulta de saldo, transferencia, comisiones) con una probabilidad asociada. La model card incluye exactamente este ejemplo y reporta 0,85 para `card_lost` en un caso de tarjeta perdida.
- Filtro de primera pasada en pipelines de clasificacion: usar el modelo como clasificador rapido on-device antes de invocar un LLM mayor, reduciendo coste y latencia en el caso mayoritario.
- Deteccion de phishing en correo electronico: clasificar un mensaje como sospechoso o legitimo con probabilidad, segun los resultados de PhishNChips (0.88). La model card advierte que con opciones descritas tambien puntua alto correos legitimos, por lo que debe calibrarse sobre datos propios.
- Verificacion de llamadas a funciones en agentes: comprobar si una llamada propuesta por un agente es correcta o pertinente (BFCL 0.77), como paso de validacion en un orquestador.
- Decisiones de interaccion en asistentes conversacionales: determinar si el agente debe llamar a una herramienta, preguntar al usuario o responder directamente, usando el formato When2Call o API-Bank.
- Analisis de sentimiento y clasificacion de tickets: el `example.py` del repositorio evalua intencion y sentimiento sobre mensajes de clientes, lo que sirve como plantilla para triaje de soporte.
- Despliegue en dispositivos embebidos: con `graph=True` en un Jetson Orin Nano Super, una decision end-to-end tarda entre 12 y 17 ms, lo que permite clasificacion en tiempo real en robots, camaras o pasarelas de borde.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. El Decision Index 0.3 es un indice propio, corregido por azar (0 = aleatorio), sobre 37 benchmarks en cinco areas, ejecutados con el mismo pipeline y la misma GPU (NVIDIA L40S).

| Modelo | Parametros | Indice publico | Licencia |
|---|---:|---:|---|
| AFM Juri Lite 32M (este checkpoint) | 32 M | 34,48 | Apache-2.0 |
| AFM Juri Lite 32M (media de 4 ejecuciones) | 32 M | 34,20 (rango 33,92 a 34,48) | |
| Amber 32M (ejecucion propia del autor) | 32 M | 33,19 | CC BY-NC 4.0 |

Desglose por area (0 = azar):

| Area | AFM Juri Lite 32M | Amber 32M (ejecucion del autor) |
|---|---:|---:|
| Conocimiento y razonamiento | 0,068 | 0,080 |
| Lenguaje | 0,298 | 0,268 |
| Recuperacion y clasificacion | 0,624 | 0,600 |
| Herramientas y automatizacion | 0,537 | 0,510 |
| Artes | 0,271 | 0,287 |

Tareas retenidas (6.179 preguntas de familias no vistas en entrenamiento): exactitud 0,51, Brier score 0,56, error de calibracion esperado 0,058.

Habilidades destacadas citadas en la model card: BANKING77 0,92, CLINC150 0,87, PhishNChips 0,88, BFCL 0,77, When2Call 0,68, API-Bank 0,63. En pruebas de conocimiento y razonamiento (HLE, GSM8K, MMLU-Pro, GPQA Diamond, WinoGrande, CLadder, ChessBench) el rendimiento es cercano al azar.

Latencia por decision (256 tokens de entrada, 4 opciones, batch 1, mediana de llamadas repetidas):

| Hardware | Configuracion | Tiempo por decision |
|---|---|---:|
| Apple M1 (2020), CPU | PyTorch fp32, `juri.py` end-to-end | 21 ms |
| Jetson Orin Nano Super | fp16, forward pass como grafo CUDA | 4,7 ms |
| Jetson Orin Nano Super | fp16, `juri.py` end-to-end, `graph=True` | 12 a 17 ms |
| Jetson Orin Nano Super | fp16, `juri.py` end-to-end, eager por defecto | 27 ms |

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa aproximadamente 0,1 GB en safetensors; en fp32 la inferencia requiere del orden de 130 MB de memoria de pesos mas activaciones, por lo que cabe holgadamente en cualquier GPU consumer. No se publican cifras oficiales de VRAM pico.
- GPU recomendadas: no requiere GPU dedicada. La model card documenta ejecucion en CPU (Apple M1) y en Jetson Orin Nano Super; se ha evaluado en NVIDIA L40S para los benchmarks. Cualquier RTX moderna lo ejecuta sin problema.
- Cabe en GPU consumer: si, en todas las RTX y en GPUs integradas, dado su tamano.
- Opciones de despliegue: transformers con PyTorch (fp32 o fp16), el script `juri.py` incluido en el repositorio, y captura de grafo CUDA (`graph=True`) para dispositivos embebidos. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; al no ser un modelo generativo, esas herramientas no son aplicables de forma directa.
- Latencia y throughput: 21 ms por decision en CPU M1 y 4,7 ms en Jetson Orin Nano Super con grafo CUDA; 12 a 17 ms end-to-end en el mismo dispositivo con `graph=True` y 27 ms en modo eager. No se publica throughput agregado con batch mayor que 1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Indice publico (Decision Index 0.3) | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| AFM Juri Lite 32M | 32,3 M | 8.192 | 34,48 | Apache-2.0 | Hugging Face |
| Amber 32M (ejecucion del autor) | 32 M | no disponible | 33,19 | CC BY-NC 4.0 | pesos publicados |
| `cross-encoder/ettin-reranker-32m-v1` (modelo base) | 32 M (aprox.) | no disponible | no disponible | Apache-2.0 | Hugging Face |

La comparacion con el modelo base no es directa: el reranker esta entrenado para ordenar pares consulta-documento, no para responder preguntas de decision con opciones descritas. No se dispone en la informacion proporcionada de otros modelos de decision del mismo orden de tamano con los que comparar de forma rigurosa.

## Limitaciones y advertencias

- Solo ingles. No hay soporte documentado de otros idiomas.
- No es un modelo de conocimiento: rendimiento cercano al azar en HLE, GSM8K, MMLU-Pro, GPQA Diamond, WinoGrande, CLadder y ChessBench.
- Las preguntas de tipo si/no sobre tareas nuevas son debiles segun las pruebas propias del autor: "¿es urgente?" y "¿necesita una herramienta?" dieron probabilidades similares para entradas claramente distintas.
- En phishing, una pregunta si/no simple fallo; con opciones descritas acerto el correo malicioso (1,00) pero puntuo un correo laboral normal entre 0,64 y 0,90 segun el orden de las descripciones, lo que indica sensibilidad al orden de las opciones.
- Las decisiones libres de agente (llamar a herramienta, preguntar, responder, rechazar) fueron poco fiables; ante una peticion de escribir malware no eligio "rechazar".
- No debe usarse como guardarrail de seguridad ni como filtro de contenido.
- No ha sido probado en decisiones de alto riesgo; el autor recomienda usarlo como clasificador de primera pasada y validarlo sobre datos propios.
- El checkpoint publicado es el mejor de cuatro ejecuciones con semillas distintas, lo que puede inflar ligeramente la metrica frente a la media de 34,20.
- La licencia Apache-2.0 permite uso comercial y no comercial, pero el modelo base arrastra las condiciones de sus propios predecesores (`ettin-reranker-32m-v1` Apache-2.0 y `ettin-encoder-32m` MIT), compatibles con uso comercial.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si de calibracion: probabilidades altas en entradas ambiguas, como muestra el caso del correo laboral.

## Enlaces

- Hugging Face: https://huggingface.co/Aneurologic/afm-juri-lite-32m
- Modelo base: https://huggingface.co/cross-encoder/ettin-reranker-32m-v1
- Encoder de origen: https://huggingface.co/jhu-clsp/ettin-encoder-32m
