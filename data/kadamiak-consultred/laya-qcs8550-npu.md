# kadamiak-consultred/laya-qcs8550-npu

## Resumen

Laya-qcs8550-npu no es un modelo nuevo, sino la compilación de los pesos de Laya (modelo de decisión de Convai Innovations) como context binaries de QNN para la NPU Hexagon HTP V73 del SoC Qualcomm QCS8550, en precisión fp16. El repositorio lo publica kadamiak-consultred y su propósito es ejecutar las decisiones de Laya en la NPU del dispositivo en lugar de la CPU, reduciendo la latencia de forma drástica. Incluye tres context binaries: el checkpoint inglés (ModernBERT-large, 512 tokens), el multilingüe (mmBERT-base, 1024 tokens) y el de decisiones tipadas (ModernBERT-large, 1024 tokens).

La relevancia es de ingeniería de despliegue: demuestra que un clasificador de decisión basado en encoder puede compilarse para el HTP de Qualcomm y ejecutarse en el borde con latencias de decenas a centenares de milisegundos, manteniendo respuestas idénticas a la versión CPU (48/48 decisiones coincidentes por checkpoint). No mejora la precisión del modelo original; reproduce su comportamiento en hardware específico.

El paquete está atado al chip y a la versión de SDK: solo carga en QCS8550 (soc_model 66, HTP V73) con runtime QAIRT 2.51 o superior. El tamaño total del repo es de 2,4 GB y la licencia es Apache-2.0, heredada de Laya.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT-large en los checkpoints inglés y typed-decisions; mmBERT-base en el multilingüe), compilado como grafos QNN para Hexagon HTP V73 |
| Parametros totales | no disponible (el repo no publica el recuento; depende del checkpoint base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (english), 1024 tokens (multilingual y typed-decisions); longitudes de grafo 128/256/512 y 128/256/512/1024 respectivamente |
| Tipos de cuantizacion | fp16 (compilación QNN con nivel de optimización 3 y weight sharing); no se ofrecen variantes int8/int4 |
| Idiomas soportados | no disponible en la ficha; el checkpoint multilingüe deriva de mmBERT-base |
| Licencia | Apache-2.0 (pesos); el runtime QAIRT es software de Qualcomm bajo Qualcomm AI Stack License y no se redistribuye |
| Formato de pesos | context binaries QNN (`.bin`) en `ctx/`, con `SHA256SUMS`; no se incluyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente, Laya, es un modelo de decisión: recibe un texto y una serie de preguntas con opciones (choice, noul, etc.) y devuelve la opción seleccionada con su probabilidad. Los checkpoints inglés y typed-decisions se basan en ModernBERT-large; el multilingüe, en mmBERT-base. Este repositorio no entrena nada: exporta los pesos a ONNX con formas estáticas, los compila offline con QAIRT 2.51.200.261021 en un Linux x86_64 y genera un context binary por checkpoint con un grafo por longitud de entrada y los pesos almacenados una sola vez.

La innovación técnica está en el pipeline de despliegue, no en el modelo: compilación determinista (dos ejecuciones separadas un día produjeron binarios idénticos byte a byte), selección de grafo por longitud de entrada, y envoltorio `NPUAgent`/`NPURouter` que reutiliza el agente original de Laya para que tokenización, cabeza de clasificación, calibración y decodificación permanezcan sin cambios. Los scripts de exportación, compilación y runtime son de código abierto en el repositorio de Consult-Red-Ltd.

## Capacidades

- Clasificación de texto y toma de decisiones guiada por preguntas con opciones discretas (tipo `choice`) y respuestas sí/no/desconocido (tipo `noul`).
- Soporte de hasta 32 opciones por pregunta.
- Procesamiento de una sola muestra por llamada (batch 1).
- Checkpoint multilingüe disponible para entradas en varios idiomas (cobertura concreta no especificada).
- Decisiones tipadas (typed-decisions) para estructurar la salida según el esquema de la pregunta.
- No genera texto libre, no razona en varios pasos, no soporta tool calling ni agentes más allá del enrutado de decisiones.
- Ejecución en NPU Hexagon del QCS8550 con latencias de 12 a 416 ms por grafo.

## Casos de uso

- Triaje de tickets de soporte en el borde: el checkpoint inglés clasifica el departamento (billing, technical, other) y el riesgo de churn en una sola llamada de 49 ms end-to-end a 128 tokens, adecuado para dispositivos sin conexión a la nube.
- Enrutado de consultas en asistentes de voz embebidos: el checkpoint multilingüe decide la intención con grafos de 128 tokens en 21 ms end-to-end, lo que permite integrarlo en el bucle de diálogo sin bloquear la captura de audio.
- Moderación o etiquetado local de contenido: clasificación binaria con el tipo `noul` sobre textos de hasta 1024 tokens en 435 ms, útil en cámaras o gateways que no pueden enviar datos a un servidor.
- Automatización de formularios y encuestas en kioscos: el modelo typed-decisions mapea respuestas libres a opciones predefinidas con hasta 32 alternativas, con latencia de 49 ms a 128 tokens.
- Clasificación de documentos en dispositivos industriales (RB5 Gen2): con 20 decisiones por segundo sostenidas durante 5 minutos a 128 tokens, sirve para etiquetar flujos continuos de registros sin degradación.
- Prefiltrado en pipelines híbridos: usar la NPU para descartar o etiquetar casos triviales a 21-49 ms y reservar la CPU o la nube para los casos que requieran el modelo completo o revisión humana.
- Enrutado de intenciones en robótica o domótica: decisiones de bajo nivel (¿es una orden de parada?, ¿es una queja?) con latencia predecible y consumo contenido al ejecutarse en el HTP.

## Benchmarks y rendimiento

Datos del autor en Thundercomm RB5 Gen2 con runtime QAIRT 2.51; latencia mediana por llamada, CPU de referencia con `laya.Agent` en torch fp32 sobre Kryo.

| Checkpoint | Tokens | Grafo NPU | NPU end to end | CPU | Aceleración |
|---|---|---|---|---|---|
| english | 128 | 25 ms | 49 ms | 1,29 s | 27x |
| english | 512 | 127 ms | 148 ms | 4,62 s | 31x |
| multilingual | 128 | 12 ms | 21 ms | 0,54 s | 25x |
| multilingual | 1024 | 221 ms | 245 ms | 3,59 s | 15x |
| typed-decisions | 128 | 25 ms | 49 ms | 1,25 s | 26x |
| typed-decisions | 1024 | 416 ms | 435 ms | 8,00 s | 18x |

Concordancia con CPU: 48/48 respuestas idénticas por checkpoint (12 textos x 4 preguntas), con diferencia media de probabilidad de 0,0005-0,0007 entre fp16 y fp32. A 128 tokens se sostienen unas 20 decisiones por segundo durante 5 minutos sin degradación. No se publican resultados de benchmarks de precisión (MMLU, HumanEval, etc.) porque el modelo no es generativo.

## Requisitos de hardware

- SoC objetivo: Qualcomm QCS8550 (probado en Thundercomm RB5 Gen2), Hexagon HTP V73, `soc_model` 66. No carga en otros SoC (por ejemplo, SM8550 es `soc_model` 43) ni en otras arquitecturas DSP sin recompilar.
- Runtime: QAIRT 2.51 o superior en el dispositivo; versiones anteriores fallan con el error 5000 (`Using newer context binary on old SDK`). Hay que copiar `libQnnHtp.so`, `libQnnSystem.so`, `libQnnHtpV73Stub.so`, `libQnnHtpPrepare.so` y `libQnnHtpV73Skel.so` desde el SDK de Qualcomm (cuenta gratuita).
- VRAM: no aplica; el modelo se ejecuta en la NPU y la memoria compartida del SoC. Los binarios ocupan 857 MB (english), 664 MB (multilingual) y 876 MB (typed-decisions).
- GPU: no aplica; no hay ruta CUDA ni Metal. Para x86 con GPU habría que usar los pesos originales de Laya en PyTorch, no estos binarios.
- No cabe en GPU de consumo porque no está pensado para ellas; el despliegue es exclusivamente en el SoC Qualcomm.
- Opciones de despliegue: runtime propio `libqnnrt.so` más `NPURouter`/`NPUAgent` del repositorio de código; no hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Throughput: unas 20 decisiones por segundo a 128 tokens en el RB5 Gen2; latencia de 12 a 416 ms según checkpoint y longitud.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| laya-qcs8550-npu (este) | no disponible (ModernBERT-large / mmBERT-base) | 512-1024 tokens | fp16 en NPU QCS8550 | Apache-2.0 (pesos) + Qualcomm AI Stack License (runtime) | Hugging Face, solo QCS8550 |
| convaiinnovations/laya (original) | no disponible | 512-1024 tokens | fp32 en CPU/GPU | Apache-2.0 | Hugging Face, multiplataforma |
| ModernBERT-large (base) | no disponible en la ficha | hasta 8192 tokens en el modelo base | fp32/fp16 | Apache-2.0 | Hugging Face |
| mmBERT-base (base multilingüe) | no disponible en la ficha | no disponible | fp32/fp16 | no disponible | Hugging Face |

La comparación relevante es con Laya original: mismas respuestas, misma licencia, pero este paquete solo funciona en un SoC concreto y con un runtime concreto. Frente a ModernBERT o mmBERT sin ajustar, Laya aporta la cabeza de decisión y el formato de preguntas con opciones; los datos de precisión comparada no están publicados en la información disponible.

## Limitaciones y advertencias

- Portabilidad nula: el context binary está atado al chip (QCS8550, HTP V73, `soc_model` 66) y a QAIRT 2.51 o superior. Cualquier otro SoC o DSP requiere recompilar desde los scripts.
- Límites de entrada: batch 1, máximo 32 opciones por pregunta y entradas que superen la longitud máxima se rechazan, no se truncan. Hay que gestionar el troceado en la aplicación.
- No mejora la precisión de Laya: reproduce la CPU con una diferencia media de probabilidad de 0,0005-0,0007 por fp16. Los sesgos y errores del modelo base se heredan.
- Riesgo de alucinación en el sentido de clasificaciones erróneas o confianza mal calibrada; no hay datos publicados de calibración fuera de la comparación con CPU.
- Idiomas: la cobertura real del checkpoint multilingüe no está documentada en la ficha.
- Licencia: los pesos son Apache-2.0, pero el runtime QAIRT es software de Qualcomm bajo su propia licencia, que incluye casos de uso prohibidos y de alto riesgo (puntuación social, empleo, acceso a servicios esenciales). Al ser un modelo de decisión, estas restricciones son directamente aplicables.
- No hay SDK redistribuido: sin descargar QAIRT desde Qualcomm el modelo no arranca.
- Sin soporte de GPU de consumo ni de frameworks estándar (vLLM, llama.cpp, Ollama, TGI); la integración exige el runtime propio y código C/Python específico.
- Proyecto sin descargas ni likes en el momento de la consulta; madurez y soporte comunitario limitados.

## Enlaces

- Hugging Face: https://huggingface.co/kadamiak-consultred/laya-qcs8550-npu
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- Código de exportación, compilación, runtime y benchmarks: https://github.com/Consult-Red-Ltd/Laya-on-Qualcomm
- SDK QAIRT de Qualcomm (requiere cuenta): no disponible como URL directa en la información proporcionada
