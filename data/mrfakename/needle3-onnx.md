# mrfakename/needle3-ONNX

## Resumen

needle3-ONNX es un port a ONNX del modelo Cactus-Compute/needle3, un modelo de 121 millones de parámetros especializado en tool calling y diseñado para ejecutarse en el propio dispositivo. Lo publica el desarrollador mrfakename y no implica ningún entrenamiento nuevo: los pesos son los del archivo `needle3.cact` desquantizado, es decir, los mismos números que ejecuta el motor oficial de Cactus Compute, no el checkpoint maestro sin cuantizar.

El modelo original solo se distribuye como `needle3.cact`, un archivo de 2 bits para el motor C++ de Cactus, sin lanzamiento en PyTorch ni en ONNX. Este repositorio reimplementa la arquitectura en PyTorch siguiendo el código de referencia en JAX del paquete `cactus-needle`, añade un lector independiente del formato `.cact` y un exportador que genera un grafo de paso incremental con caché KV. El resultado se ejecuta con onnxruntime sobre WebGPU en el navegador o sobre cualquier backend soportado.

Su relevancia práctica radica en que permite ejecutar un modelo de function calling de 121M íntegramente en el navegador con una descarga de solo 35 MB de pesos, ya que el manifiesto JSON permite reconstruir localmente el archivo `.onnx_data` de 243 MB. Está orientado a agentes ligeros y aplicaciones on-device donde priman la privacidad y la latencia por encima del razonamiento general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bloques de atención "laddered" (convoluciones causales Q/K/V), atención GQA con puerta, ventana deslizante con capas globales, MLP Monarch Hadamard, memoria n-grama "engram" y carriles residuales mHC con mezcla Sinkhorn |
| Parametros totales | 121M |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2 bits (archivo original `.cact`); fp16 (ONNX); fp32 (ONNX); el motor oficial de Cactus usa además activaciones int8 y caché KV int8 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model_fp16.onnx` + `.onnx_data`, y `model.onnx` + `.onnx_data`) y archivo original `.cact` (35 MB) |

Datos adicionales: vocabulario de 8192 tokens, tokenizador SentencePiece BPE almacenado en el propio archivo, token BOS con id 2, tokens especiales `<think>` (id 6), `</tool_call>` (id 11) y `<|im_end|>` (id 5). Tamaño del repositorio: 0.8 GB.

## Arquitectura y entrenamiento

La arquitectura sigue el diseño del modelo original de Cactus Compute. Incluye bloques de atención "laddered" con tomas convolucionales causales en Q, K y V, atención GQA con puerta, una combinación de ventana deslizante y capas globales, un MLP Monarch Hadamard, una memoria n-grama denominada engram (que indexa las filas de la tabla para los 9 tokens previos más los nuevos, en 6 columnas) y carriles residuales mHC con mezcla Sinkhorn. El puerto reproduce estos componentes a partir del código de referencia en JAX.

No se dispone de información sobre el entrenamiento del modelo original: ni el número de tokens, ni la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Este repositorio no entrena nada; su aportación es de ingeniería de conversión. El lector `.cact` reproduce exactamente el desquantizador de referencia (diferencia absoluta máxima de 0) y el grafo ONNX replica el port de PyTorch con tokens greedy idénticos y una similitud coseno del logit del primer token de 1,000000 en fp32 y 0,999999 en fp16. El exportador produce un único grafo que gestiona tanto el prefill como la decodificación, con entradas `input_ids`, `engram_idx`, `engram_ok`, `past_len`, `conv_state`, `past_key` y `past_value`, y salidas `logits` de forma `[1, 8192]`, `conv_state_out`, `present_key` y `present_value`.

## Capacidades

- Generación de texto orientada a la invocación de herramientas (tool calling / function calling) como capacidad principal.
- Salida estructurada de llamadas: el modelo emite `<think>`, una derivación en una línea, `</think>`, un salto de línea y `<tool_call>[...]</tool_call>`. Una lista vacía indica que no procede ninguna llamada.
- Ejecución on-device: funciona en el navegador mediante onnxruntime sobre WebGPU, así como en cualquier backend de onnxruntime (CPU, WASM).
- Inferencia incremental: el grafo mantiene caché KV y estado convolucional entre pasos, adecuado para decodificación token a token.
- Decodificación greedy obligatoria en el flujo previsto, forzando `<think>` (id 6) como primer token generado.
- Razonamiento en un solo paso acotado (cadena breve previa a la llamada), no razonamiento extenso.
- Capacidades multilingües: no disponible.
- Visión, audio u otras modalidades: no disponible.

## Casos de uso

- Asistentes en el navegador sin backend: el modelo se ejecuta sobre WebGPU y descarga solo 35 MB de pesos, por lo que puede integrarse en una aplicación web que resuelva llamadas a funciones locales (calendario, clima, cálculo) sin enviar datos a un servidor.
- Enrutamiento de funciones en aplicaciones móviles: dado un catálogo de herramientas en JSON y una consulta del usuario, el modelo decide qué función invocar y con qué argumentos, con un coste de memoria compatible con terminales de gama media.
- Agentes locales con requisitos de privacidad: al no requerir conexión externa, encaja en flujos donde la consulta y el catálogo de herramientas no pueden salir del dispositivo.
- Preprocesado y normalización de peticiones: usar el modelo como capa que convierte lenguaje natural en llamadas estructuradas antes de un sistema mayor, reduciendo el coste de un modelo grande para tareas de enrutamiento.
- Automatización doméstica y dispositivos edge: integración en asistentes de hogar o sistemas embebidos que necesiten mapear órdenes verbales a acciones concretas.
- Prototipado rápido de agentes: el formato de prompt documentado y el grafo único con caché KV simplifican la experimentación con pipelines de function calling sin infraestructura de GPU.
- Aplicaciones de escritorio offline: al disponer de versión fp32 para CPU/WASM, puede embeberse en herramientas de escritorio que operen sin red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí documenta una verificación frente al motor oficial de Cactus (`cactus-needle` 3.1.0, `needle.Needle.complete`) sobre 10 presets de sandbox con decodificación greedy:

| Comparacion | Resultado |
|---|---|
| Texto de razonamiento idéntico al motor oficial | 8 de 10 prompts |
| Misma llamada que el motor oficial (ignorando capitalización) | 8 de 10 prompts |
| Discrepancia 1 | "don't set a timer for 20 minutes": la puerta de negación del motor descarta la llamada y este port no |
| Discrepancia 2 | Petición de captura de datos con tres elementos: este port fp32 añade una tercera llamada espuria; un port que simula activaciones y caché KV int8 (`Needle3(..., quant=True)`) coincide con el motor |
| Fidelidad del lector `.cact` | Diferencia absoluta máxima 0 frente al desquantizador de referencia |
| Fidelidad ONNX frente al port PyTorch | Tokens greedy idénticos; coseno del primer logit 1,000000 (fp32) y 0,999999 (fp16) |

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 484 MB en fp32 (121M parámetros) y unos 243 MB en fp16; el archivo `.cact` original ocupa 35 MB.
- GPU recomendadas: cualquier GPU con soporte WebGPU puede ejecutar la variante fp16. No se requiere hardware de gama alta; una RTX 4090, A100 o H100 están sobradamente dimensionadas para este tamaño.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo moderna e incluso en iGPU con WebGPU. La variante fp32 está pensada para CPU y WASM.
- Opciones de despliegue: onnxruntime (WebGPU, CPU, WASM). No se distribuye en GGUF, por lo que no es directamente compatible con llama.cpp ni Ollama, y no se menciona soporte para vLLM ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato de pesos | Licencia |
|---|---|---|---|---|
| mrfakename/needle3-ONNX | 121M | no disponible | ONNX (fp16, fp32) + `.cact` | Apache-2.0 |
| Cactus-Compute/needle3 | 121M | no disponible | `.cact` (2 bits) | Apache-2.0 |

La comparación con alternativas de la misma categoría (modelos pequeños de function calling on-device) no está disponible en la información proporcionada. Respecto al modelo base, este port añade formatos fp16 y fp32 ejecutables en onnxruntime, pero omite pasos que sí realiza el motor oficial, tal y como se detalla en las limitaciones.

## Limitaciones y advertencias

- Los pesos son los del archivo `needle3.cact` desquantizado, no el checkpoint maestro sin cuantizar; la calidad está acotada por la cuantización a 2 bits del original.
- Este port no aplica la decodificación con restricciones gramaticales del motor oficial ni utiliza la cabeza de confianza, lo que puede degradar la validez formal de las llamadas.
- No reproduce el postprocesado del motor: no pone en mayúscula la primera letra de campos de texto libre (title, message, label) ni aplica la puerta de negación, lo que provoca discrepancias documentadas (por ejemplo, en la orden de no poner un temporizador).
- El motor oficial ejecuta activaciones int8 y caché KV int8; esta variante fp32 puede añadir llamadas espurias en casos concretos, como el ejemplo de captura de datos con tres elementos.
- Riesgo de alucinación del modelo base: no se documentan métricas de fiabilidad fuera de los 10 presets de verificación, por lo que no debe asumirse corrección general en producción.
- Sesgos conocidos: no disponible.
- Limitaciones de contexto e idioma: no disponible.
- Licencia Apache-2.0, que permite uso comercial; el crédito del modelo corresponde a Cactus Compute. Se debe conservar el aviso de licencia.
- Número de descargas y likes cero en el momento de la consulta, y repositorio creado el 2026-10-04: se trata de una conversión reciente y poco validada por la comunidad.
- La decodificación prevista es greedy y con `<think>` forzado como primer token; desviarse de ese flujo puede dar resultados no validados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mrfakename/needle3-ONNX
- Modelo base: https://huggingface.co/Cactus-Compute/needle3
- Demo en navegador sobre WebGPU: https://huggingface.co/spaces/mrfakename/needle3-webgpu
