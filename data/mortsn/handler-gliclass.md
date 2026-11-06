# mortsn/handler-gliclass

## Resumen

Handler-gliclass es un modelo de clasificación zero-shot derivado de knowledgator/gliclass-v4-edge, que a su vez se construye sobre microsoft/deberta-v3-large. Lo desarrolla el usuario mortsn como componente de inferencia del videojuego Handler, en el que el jugador guía verbalmente a dos espías a través de una misión. El modelo resuelve un problema acotado: mapear una orden hablada (transcrita a texto) contra un conjunto variable de opciones válidas definidas por el propio juego, sin necesidad de entrenar un clasificador específico por comando.

La relevancia técnica no está en el rendimiento generalista, sino en el patrón de despliegue: es una exportación ONNX en fp16 pensada para ejecutarse íntegramente en el navegador mediante onnxruntime-web sobre WebGPU, con una pasada por pregunta. El repositorio ocupa 0,9 GB y se publica bajo licencia Apache 2.0. No hay métricas publicadas, ni lista de idiomas declarada, ni datos de entrenamiento más allá de la referencia al pipeline uni-encoder de GLiClass 0.1.22.

Se trata, por tanto, de un artefacto de producción para un caso de uso concreto (comprensión de comandos en un juego) más que de un modelo de propósito general. Su interés para terceros es principalmente como ejemplo de empaquetado ONNX/WebGPU de un clasificador zero-shot y como referencia de calibración de logits en dominios cerrados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3-large como base, adaptado a clasificación zero-shot GLiClass v4 Edge) |
| Parametros totales | no disponible (el modelo base DeBERTa-v3-large ronda los 435 M, pero el autor no declara el recuento final) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Exportación fp16 en ONNX; no se documentan otras variantes |
| Idiomas soportados | no disponible (la model card no declara idiomas; el caso de uso es inglés hablado en el juego) |
| Licencia | Apache 2.0 (base DeBERTa-v3 bajo MIT) |
| Formato de pesos | ONNX (fp16), ejecutable con onnxruntime-web sobre WebGPU |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GLiClass v4 Edge, un clasificador zero-shot basado en un encoder DeBERTa-v3-large. La entrada se construye con el pipeline uni-encoder de GLiClass 0.1.22: se concatenan todas las opciones en el formato `<<LABEL>>clave: descripción`, separadas por `<<SEP>>`, seguidas de las instrucciones de la pregunta y del estado del juego. La salida son logits calibrados para 25 slots de opción; para una pregunta con n opciones se conservan los n primeros logits y se aplica la temperatura de `calibration.json` mediante `softmax(logits / T)`.

El ajuste fino se realizó sobre el modelo base knowledgator/gliclass-v4-edge para leer las órdenes habladas del juego Handler. No se documentan en la información disponible el volumen de datos de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO (poco probables en un clasificador de este tipo). La innovación destacable es de despliegue: exportación fp16 a ONNX con entradas `input_ids` y `attention_mask`, una ejecución por pregunta en el navegador vía onnxruntime-web y WebGPU, con calibración explícita de logits para estabilizar la decisión entre opciones.

## Capacidades

- Clasificación zero-shot de texto contra un conjunto variable de etiquetas definidas en tiempo de inferencia.
- Comprensión de órdenes habladas transcritas a texto en el dominio específico del juego Handler.
- Selección entre hasta 25 opciones por pregunta mediante logits calibrados con temperatura.
- Ejecución en navegador con ONNX Runtime Web sobre WebGPU, sin backend servidor.
- Entrada basada en pares `input_ids` / `attention_mask`, compatible con pipelines de tokenización estándar de transformers.
- No se documentan capacidades de generación de texto, razonamiento multi-paso, tool calling, agentes, visión ni audio.

## Casos de uso

- Clasificación de comandos en videojuegos: el modelo recibe la transcripción de una orden del jugador y la mapea a una de las acciones válidas del juego, usando el formato `<<LABEL>>clave: descripción` para definir el espacio de opciones en cada turno.
- Despliegue íntegro en cliente: al ser un ONNX fp16 ejecutable con onnxruntime-web sobre WebGPU, permite clasificar en el navegador sin enviar la transcripción a un servidor, lo que reduce latencia y coste de infraestructura.
- Enrutado de intenciones en asistentes conversacionales: con etiquetas definidas dinámicamente, puede sustituir a clasificadores entrenados específicamente cuando el catálogo de intenciones cambia con frecuencia.
- Moderación o etiquetado de contenido en dominios cerrados: útil cuando las categorías se especifican por configuración y no se quiere reentrenar el modelo al añadir clases.
- Prototipado rápido de clasificadores: sirve como referencia para empaquetar un zero-shot classifier en ONNX y calibrar logits con temperatura antes de invertir en un modelo propio.
- Filtrado previo en pipelines de agentes: puede actuar como primera etapa que decide qué herramienta o rama activar antes de invocar un LLM mayor, reduciendo llamadas costosas.
- Investigación sobre calibración: el artefacto incluye `calibration.json` y un esquema de temperatura aplicada a `softmax`, lo que lo hace útil como caso de estudio reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el repositorio pesa 0,9 GB en fp16, lo que sugiere un consumo en el orden de 1-2 GB al cargar en memoria, dependiendo del runtime y del overhead.
- GPU recomendadas: no se documentan. El destino declarado es WebGPU en navegador, por lo que la compatibilidad depende del soporte WebGPU del navegador y de la GPU del cliente.
- GPU de consumo: probablemente ejecutable en GPUs integradas y dedicadas recientes con WebGPU habilitado, pero no hay datos de latencia ni de compatibilidad verificada.
- Opciones de despliegue: onnxruntime-web sobre WebGPU (destino principal); también cabe onnxruntime nativo u otros runtimes compatibles con ONNX, aunque no están documentados por el autor.
- Latencia y throughput: no disponibles; la model card solo indica una ejecución por pregunta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mortsn/handler-gliclass | no disponible (base DeBERTa-v3-large, ~435 M) | no disponible | Clasificación zero-shot de órdenes de juego | Apache 2.0 | Hugging Face, ONNX fp16 |
| knowledgator/gliclass-v4-edge | no disponible | no disponible | Clasificación zero-shot general | Apache 2.0 (según referencia del autor) | Hugging Face |
| microsoft/deberta-v3-large | ~435 M | 512 tokens (arquitectura DeBERTa-v3) | Encoder generalista (NLU) | MIT | Hugging Face |

La comparación se limita a la genealogía del modelo, ya que no hay datos de rendimiento publicados para handler-gliclass ni para gliclass-v4-edge en la información disponible. Frente a DeBERTa-v3-large, el modelo añade la cabeza y el pipeline zero-shot de GLiClass y la exportación ONNX para navegador; frente a gliclass-v4-edge, incorpora el ajuste específico al dominio del juego Handler y la calibración de logits.

## Limitaciones y advertencias

- Modelo de dominio muy específico: ajustado para las órdenes habladas del juego Handler; el rendimiento fuera de ese vocabulario y esquema de opciones no está documentado.
- Sin datos de evaluación: no hay benchmarks, métricas de precisión ni análisis de errores publicados.
- Idiomas no declarados: la model card no especifica cobertura lingüística; asumir multilingüismo no está justificado.
- Dependencia del formato de entrada: requiere el esquema `<<LABEL>>clave: descripción` + `<<SEP>>` + instrucciones + estado; desviarse de él puede degradar la clasificación.
- Dependencia de la calibración: los logits deben dividirse por la temperatura de `calibration.json` antes del softmax; omitirlo altera las probabilidades.
- Riesgo de clasificación errónea en opciones semánticamente próximas, inherente a los clasificadores zero-shot, sin datos que cuantifiquen la tasa de error.
- Licencia Apache 2.0 permisiva para uso comercial, pero conviene verificar las condiciones del modelo base gliclass-v4-edge y de DeBERTa-v3 (MIT) si se redistribuye.
- Sin soporte documentado de tool calling, agentes, generación ni multimodalidad; no debe emplearse para esas tareas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mortsn/handler-gliclass
- Modelo base: https://huggingface.co/knowledgator/gliclass-v4-edge
- Modelo base de la arquitectura: https://huggingface.co/microsoft/deberta-v3-large
