# litert-community/decider-0.8b-LiteRT

## Resumen

decider-0.8b-LiteRT es una conversión al formato LiteRT-LM del modelo Mapika/decider-0.8b, un modelo de decisión tipada de 0,8 mil millones de parámetros derivado de Qwen/Qwen3.5-0.8B-Base. No es un modelo generativo de texto: su función es recibir un estado (por ejemplo, el texto de un ticket de soporte) junto con una serie de preguntas tipadas y devolver directamente probabilidades calibradas sobre las opciones de respuesta. El autor de la conversión es la comunidad litert-community, y el modelo original procede de Mapika.

La arquitectura es híbrida, con 18 capas de atención lineal y 6 capas de atención completa, lo que reduce el coste computacional en contextos largos frente a un transformer denso convencional. El modelo soporta tres tipos de decisión: elección entre 2 y 255 opciones, puntuación en 2 a 10 niveles y probabilidad de sí/no. Cada fila de decisión se procesa de forma independiente, con prefill fragmentado de ajuste exacto y una única decodificación final por fila.

La relevancia de esta conversión radica en que permite ejecutar el modelo en CPU y en GPUs móviles mediante LiteRT-LM, con dos recetas de pesos (fp16 e int8 dinámico) y con métricas explícitas de fidelidad de probabilidades frente al oráculo fp32 original. Es una pieza adecuada para enrutamiento determinista y clasificación estructurada en entornos con recursos limitados, no para generación de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 18 capas de atención lineal (gated deltanet) + 6 capas de atención completa |
| Parametros totales | 0,8 mil millones (modelo base Qwen3.5-0.8B-Base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Máximo 4096 tokens por fila renderizada |
| Tipos de cuantizacion | FP16 (cast de pesos FC y embeddings, cómputo en float) e int8 dinámico (FC int8 + embedding int8 CHANNELWISE) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | .litertlm (bundle LiteRT-LM) |
| Tamano del repo | 2,6 GB |
| Tamano de los ficheros | fp16: 1.625.055.920 bytes; int8: 963.184.864 bytes |
| Libreria | litert-lm (requiere LiteRT-LM >= 0.15; operación verificada en 0.17.1) |
| Pipeline | text-classification |
| Token de parada | 248044 |
| Plantilla de prompt | Identidad, sin token de inicio |
| Estado híbrido | ExecutorMetadata para 48 buffers de estado |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida de 24 capas en total: 18 capas de atención lineal basadas en gated deltanet y 6 capas de atención completa. Esta combinación busca mantener la capacidad de modelado de dependencias globales de la atención completa mientras reduce el coste de memoria y cómputo en secuencias largas mediante las capas lineales. El modelo base es Qwen/Qwen3.5-0.8B-Base, y el ajuste fino que da lugar a decider-0.8b fue realizado por Mapika; la información disponible no detalla la composición del dataset de ajuste ni si se emplearon técnicas de RLHF o DPO.

La innovación operativa principal no está en el entrenamiento sino en el modo de inferencia: el modelo no genera texto libre, sino que realiza decisiones tipadas en una sola pasada. Cada pregunta de tipo elección se representa como una fila independiente; una pregunta de tipo score se expande en una fila sí/no por cada nivel; y una pregunta de tipo noul devuelve directamente la probabilidad de "sí". La implementación de referencia en CPU usa filas independientes, prefill fragmentado de ajuste exacto y una decodificación final por fila. La conversión a LiteRT-LM exige la versión 0.15 o superior para el binding generalizado de estado híbrido. Las convoluciones y la regla delta permanecen en float en ambas recetas de pesos.

## Capacidades

- Decisión de elección entre 2 y 255 opciones, devolviendo probabilidades por opción.
- Puntuación en 2 a 10 niveles, expandida internamente a filas sí/no por nivel.
- Probabilidad de sí/no (tipo noul) para preguntas binarias.
- Salida estructurada tipada: no genera texto de respuesta, solo probabilidades calibradas.
- Procesamiento de múltiples preguntas independientes sobre un mismo estado en una sola petición.
- Ejecución en CPU y en GPUs móviles (Metal en Mac, GPU CL en Galaxy S26) con el fichero int8.
- Soporte de filas de hasta 4096 tokens, incluyendo una fila de elección amplia de 2844 tokens en el corpus de referencia.
- Idioma: únicamente inglés.
- No soporta tool calling, agentes multi-paso ni generación de código o matemáticas, por su naturaleza de clasificador estructurado.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket como estado y preguntas tipadas sobre el departamento responsable (por ejemplo, facturación frente a soporte técnico) y devuelve la probabilidad de cada opción. En el ejemplo incluido, la probabilidad asignada a facturación es 0,9996.
- Detección de intención en atención al cliente: preguntas de tipo noul permiten determinar si el cliente ha solicitado un reembolso (probabilidad 0,9611 en el ejemplo de referencia) sin necesidad de generar texto.
- Medición de sentimiento o frustración por niveles: una pregunta de tipo score con 2 a 10 niveles permite cuantificar el grado de frustración del cliente de forma ordinal y calibrada.
- Clasificación por lotes en pipelines de datos: al procesar cada fila de forma independiente y admitir hasta 4096 tokens, se pueden clasificar grandes volúmenes de documentos cortos en CPU sin GPU dedicada.
- Moderación o triaje en el dispositivo: el fichero int8 (963 MB) se ejecuta en CPU Android y en GPUs móviles, lo que permite tomar decisiones de clasificación localmente sin enviar datos a un servidor.
- Extracción de atributos binarios de formularios o correos: preguntas noul encadenadas permiten responder sí/no a condiciones concretas (por ejemplo, si se adjuntó documentación) con una probabilidad asociada.
- Enrutamiento determinista en sistemas de agentes: el modelo puede actuar como componente de decisión previo a un LLM generativo, seleccionando la herramienta o el flujo adecuado entre hasta 255 opciones.

## Benchmarks y rendimiento

Los datos publicados no son benchmarks de tarea, sino mediciones de concordancia de conversión frente al oráculo fp32 original (Decider con torch fp32 en CPU Apple M4 Max, cuatro hilos), sobre 40 fixtures sintéticos en inglés que generan 120 filas independientes. Se usa T = 1,03 y el ensamblado original.

| Fichero | Backend / esquema | Filas | Argmax idéntico | Empates | Máx \|Δp\| | p95 \|Δp\| | Mediana \|Δp\| | Filas > 0,02 |
|---|---|---|---|---|---|---|---|
| fp16 | CPU / exact-fit | 120 | 120/120 | 0 | 6,61611557e-06 | 3,06963921e-06 | 1,1920929e-07 | 0 |
| int8 | CPU / exact-fit | 120 | 117/120 | 0 | 0,159999788 | 0,067937851 | 0,00210475922 | 27 |
| int8 | CPU / un prefill con padding | 119 | 116/119 | 0 | 0,129208088 | 0,0709148347 | 0,00181061029 | 25 |
| int8 | GPU Metal / un prefill con padding | 119 | 118/119 | 0 | 0,0731657743 | 0,0250394106 | 0,000544799026 | 10 |

Para fp16, la CLI de referencia coincide con las 40 respuestas de fixture dentro de 1e-4 tras el redondeo original (36 exactas) y con todos los recuentos de uso. Las puertas con padding de 119 filas excluyen G01/00, la fila de elección amplia de 2844 tokens; el error histórico multi-chunk en GPU int8 para esa fila fue de 0,0238454, por lo que se recomienda enrutar filas largas a CPU. La calibración de probabilidades en Android no se midió; los resultados en Galaxy S26 solo establecen el funcionamiento en tiempo de ejecución, no la igualdad con las probabilidades de Mac. No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero fp16 ocupa 1,63 GB y el int8 0,96 GB; el repositorio completo son 2,6 GB.
- CPU: ambos ficheros se ejecutan en CPU; el fp16 es la opción recomendada para fidelidad de probabilidades en escritorio y CPU.
- GPU: el int8 se ha probado en GPU Metal de Mac y en GPU CL de Galaxy S26; el fp16 no se ha validado en GPU según la información disponible.
- GPU de escritorio dedicadas (A100, H100, RTX 4090): no se han publicado resultados de despliegue en estas GPU en la información disponible.
- Despliegue: LiteRT-LM >= 0.15 (verificado en 0.17.1); el lector de grafos de referencia usa ai-edge-litert 2.2.0. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Restricción de GPU: la lectura de decisiones en GPU requiere la regla de un único chunk; las filas largas deben enrutarse a CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo de salida | Licencia | Formato |
|---|---|---|---|---|---|
| decider-0.8b-LiteRT | 0,8 B | 4096 tokens por fila | Probabilidades tipadas (elección, score, sí/no) | Apache 2.0 | .litertlm |
| Mapika/decider-0.8b (original) | 0,8 B | No disponible | Probabilidades tipadas | No disponible | Pesos PyTorch |
| Qwen/Qwen3.5-0.8B-Base | 0,8 B | No disponible | Generación de texto | No disponible | No disponible |

La comparación con alternativas de la misma categoría (modelos de decisión estructurada) no está disponible en la información proporcionada. Frente a su modelo base Qwen3.5-0.8B-Base, la diferencia clave es que decider-0.8b está ajustado para emitir decisiones tipadas con probabilidades calibradas en lugar de texto generado.

## Limitaciones y advertencias

- El modelo no genera texto: solo devuelve probabilidades sobre opciones; no puede usarse para respuestas conversacionales.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- La fidelidad de probabilidades del fichero int8 es limitada: en CPU, 27 de 120 filas superan una diferencia absoluta de 0,02 respecto al oráculo fp32, con un máximo de 0,16; debe usarse fp16 cuando la calibración sea crítica.
- Las mediciones de concordancia son de conversión, no de precisión en tráfico real ni de calibración en tareas concretas.
- La calibración de probabilidades en Android no se ha medido; solo se verificó el funcionamiento en Galaxy S26.
- Las filas largas (como la de 2844 tokens) deben procesarse en CPU; en GPU int8 se registró un error histórico de 0,0238454 en modo multi-chunk.
- Límite estricto de 4096 tokens por fila renderizada.
- Riesgo de sesgo y alucinación no evaluado en la información disponible; al tratarse de un clasificador, el riesgo se manifiesta como probabilidades mal calibradas más que como texto inventado.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo base y el ajuste fino upstream deben verificarse por separado.
- Requiere LiteRT-LM >= 0.15; versiones anteriores no soportan el binding de estado híbrido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/decider-0.8b-LiteRT
- Modelo base upstream: https://huggingface.co/Mapika/decider-0.8b
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Fichero de checksums: https://huggingface.co/litert-community/decider-0.8b-LiteRT/blob/main/SHA256SUMS
- Implementación de referencia en CPU: reference/systemone_litert.py (incluida en el repositorio)
- Fixtures de ejemplo: reference/fixtures/systemone_example.json (incluido en el repositorio)
- Corpus de 40 fixtures: reference/fixtures/fixtures.json (incluido en el repositorio)
- Salidas del oráculo fp32: reference/fixtures/oracle_fp32.json (incluido en el repositorio)
- Repositorio relacionado: https://huggingface.co/litert-community/Qwen3.5-0.8B
