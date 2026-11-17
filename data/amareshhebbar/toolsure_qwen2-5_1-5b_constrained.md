# AmareshHebbar/ToolSure_Qwen2.5_1.5B_CONSTRAINED

## Resumen

ToolSure CONSTRAINED es un ajuste fino de `Qwen/Qwen2.5-1.5B-Instruct` orientado a la llamada fiable de funciones (function calling) en modelos pequenos. Lo desarrolla AmareshHebbar y forma parte de la coleccion ToolSure, que agrupa cinco metodos de entrenamiento sobre el mismo dataset mas esta variante con decodificacion restringida por gramatica. El problema que aborda es concreto: los modelos de 1.5B fallan al emitir llamadas a herramientas, produciendo JSON malformado, nombres de funcion inventados o argumentos ausentes, y ninguna capa de recuperacion (RAG) corrige ese fallo porque el error esta en la generacion de la llamada.

La arquitectura subyacente es un transformer decoder-only de Qwen2.5 con 1.543.714.304 parametros, entrenado sobre el dataset `AmareshHebbar/ToolSure_Calls_Qwen2.5_1.5B` y derivado del checkpoint ORPO del mismo autor. La innovacion principal no esta en los pesos, que son identicos a los del modelo fuente, sino en el modo de servicio: cuando el modelo abre una etiqueta `<tool_call>`, la decodificacion se restringe mediante xgrammar a un nombre de funcion ofrecido y a argumentos que validan contra su esquema JSON. El modelo conserva la capacidad de responder en texto plano cuando ninguna herramienta encaja.

Es relevante ahora porque demuestra que la garantia de formato y la calidad de la decision son problemas separables: la decodificacion restringida elimina el JSON invalido y los nombres inventados, pero no mejora la eleccion de la funcion ni la decision de no llamar, que es exactamente lo que aporta el entrenamiento previo. El resultado es un modelo de 1.5B con tasa de parseo JSON del 99.9% y 0.0% de funciones alucinadas, a costa de multiplicar por seis la latencia frente a la inferencia sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; el repositorio publica pesos en bf16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) en la raiz del repositorio; `adapter/` contiene el adaptador LoRA cuando se entreno |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-1.5B-Instruct`, un transformer decoder-only denso de 1.5B parametros, y se ajusta sobre el dataset `AmareshHebbar/ToolSure_Calls_Qwen2.5_1.5B`. El checkpoint publicado deriva de `AmareshHebbar/ToolSure_Qwen2.5_1.5B_ORPO`, cuyo score global registrado en la tabla de hiperparametros es 0.7643. La coleccion ToolSure compara cinco metodos de entrenamiento sobre los mismos datos (SFT, ORPO, GRPO y variantes) mas esta version con decodificacion restringida, lo que permite aislar el efecto del entrenamiento frente al del formateo forzado.

La innovacion tecnica esta en el pipeline de inferencia, no en los pesos. El fichero `toolsure_constrained.py` construye una etiqueta estructural de xgrammar a partir de las herramientas ofrecidas: el texto libre se permite sin restriccion, pero en el momento en que el modelo emite `<tool_call>`, el resto de la llamada queda forzado a un nombre de funcion real de la lista y a argumentos que cumplen el esquema JSON de esa funcion. Esto garantiza que toda llamada parsea y que no aparecen funciones inexistentes. La contrapartida es un coste computacional notable: la latencia p50 pasa de 0.21 s a 1.19 s en vLLM con batch size 1, y el coste por 1000 consultas de 0.0045 USD a 0.0621 USD asumiendo 1.0 USD/hora de GPU.

## Capacidades

- Generacion de texto conversacional en ingles sobre la base de Qwen2.5-1.5B-Instruct.
- Llamada a funciones (function calling) con validacion estricta de esquema JSON en el momento de la decodificacion.
- Garantia de nombre de funcion valido: tasa de funciones alucinadas del 0.0% segun la evaluacion del autor.
- Tasa de parseo JSON del 99.9% en salidas que intentan una llamada.
- Llamadas paralelas: soporta multiples llamadas en una misma respuesta (BFCL Parallel 83.5, Parallel multiple 79.5).
- Decision de no llamar: capacidad de responder en texto plano cuando ninguna herramienta encaja, con una tasa de irrelevancia correcta del 60.4%.
- Integracion con vLLM mediante el modulo auxiliar `toolsure_constrained.py` y xgrammar.
- Compatible con text-generation-inference y endpoints compatibles segun los tags del repositorio.
- No se documentan capacidades de vision, audio ni modo thinking extendido.

## Casos de uso

- **Atencion al cliente con herramientas internas**: el modelo puede decidir entre responder directamente o invocar funciones como consulta de pedido o estado de envio, y la decodificacion restringida garantiza que la llamada siempre parsea contra el esquema, lo que evita errores en el orquestador.
- **Agentes de bajo coste en produccion**: con 1.5B parametros y licencia Apache 2.0, es viable desplegar muchas instancias para tareas de enrutamiento de herramientas donde el coste por token importa mas que el razonamiento profundo.
- **Pipelines de automatizacion con API externas**: al forzar nombres de funcion reales y argumentos validos, se puede conectar directamente la salida a un despachador de funciones sin capa de reparacion de JSON.
- **Sistemas de consulta de datos estructurados**: traduccion de preguntas en lenguaje natural a llamadas a funciones de consulta (bases de datos, APIs REST) con esquemas estrictos, donde un argumento mal tipado rompe el flujo.
- **Prototipado rapido de asistentes con tool use**: util en entornos de desarrollo donde se quiere validar el diseno de herramientas y esquemas sin depender de modelos de 7B o superiores.
- **Evaluacion comparativa de metodos de entrenamiento**: al compartir datos y base con las otras variantes ToolSure, sirve como referencia para medir cuanto aporta la decodificacion restringida frente a SFT, ORPO o GRPO en la misma tarea.
- **Enrutamiento en cascada**: uso como primer nivel que resuelve llamadas simples y deriva a un modelo mayor solo cuando la confianza o la complejidad lo exigen, aprovechando su baja latencia sin restricciones (0.21 s p50) para el caso comun.

## Benchmarks y rendimiento

Resultados publicados por el autor, con decodificacion greedy y el mismo checker en todas las filas. Las columnas BFCL son precision AST sobre las categorias no live del Berkeley Function Calling Leaderboard. Irrelevancia es la proporcion de prompts donde el modelo correctamente no hace llamada. xLAM held out es precision exacta de llamada sobre 500 ejemplos nunca vistos en entrenamiento. La latencia es batch size 1 en vLLM.

| Modelo | BFCL Simple | BFCL Multiple | BFCL Parallel | BFCL Parallel multiple | BFCL AST mean | Irrelevancia | xLAM held out | JSON parse rate | Funciones alucinadas | Latencia p50 (s) | Coste/1k consultas (USD) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Qwen2.5 1.5B Instruct (prompted) | 91.5 | 86.5 | 80.0 | 79.0 | 84.2 | 64.6 | 84.2 | 99.2 | 0.7 | 0.21 | 0.0054 |
| Qwen2.5 1.5B Instruct (strict system prompt) | 91.5 | 88.0 | 80.0 | 76.5 | 84.0 | 29.2 | 83.8 | 99.2 | 0.9 | 0.21 | 0.0051 |
| Qwen2.5 1.5B Instruct (constrained decoding) | 92.0 | 87.0 | 80.5 | 79.0 | 84.6 | 63.7 | 83.2 | 99.6 | 0.0 | 1.21 | 0.0546 |
| Qwen2.5-7B-Instruct (prompted, referencia) | 94.5 | 93.5 | 89.0 | 85.5 | 90.6 | 67.5 | 86.8 | 99.8 | 0.5 | 0.73 | 0.0155 |
| ToolSure SFT | 91.8 | 90.5 | 82.0 | 79.5 | 85.9 | 29.6 | 86.2 | 99.3 | 1.0 | 0.20 | 0.0044 |
| ToolSure ORPO | 91.5 | 84.5 | 84.5 | 79.0 | 84.9 | 60.4 | 84.0 | 99.2 | 0.5 | 0.21 | 0.0045 |
| ToolSure GRPO | 92.2 | 85.0 | 82.0 | 82.5 | 85.4 | 43.8 | 84.0 | 99.3 | 0.8 | 0.21 | 0.0044 |
| **ToolSure CONSTRAINED** | **91.8** | **86.0** | **83.5** | **79.5** | **85.2** | **60.4** | **82.4** | **99.9** | **0.0** | **1.19** | **0.0621** |

Lectura de los datos: la restriccion por gramatica lleva el parseo JSON al 99.9% y elimina por completo las funciones alucinadas, pero no mejora la precision de llamada (AST mean 85.2 frente a 85.9 de SFT) y penaliza la generalizacion fuera de distribucion (xLAM held out 82.4, la mas baja de la tabla). El coste por consulta se multiplica aproximadamente por 14 respecto a las variantes sin restriccion. No se publican resultados de MMLU para ninguna fila.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3.1 GB de pesos mas overhead de contexto y cache KV; en la practica, unos 4-6 GB con contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1.6-2 GB de pesos; en 4 bits, alrededor de 1 GB. El autor no publica artefactos GGUF ni cuantizaciones oficiales.
- GPU recomendadas para produccion: A100 o H100 para despliegue por lotes con vLLM y decodificacion restringida, dado el coste de xgrammar. Una L4 o A10 tambien es suficiente por capacidad de memoria.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 4080, RTX 3090 y tarjetas con 8 GB o mas en bf16. En 4 bits cabria en GPUs de 4-6 GB.
- Opciones de despliegue: vLLM es la ruta documentada y la unica con el modulo `toolsure_constrained.py` para la decodificacion restringida. El repositorio declara compatibilidad con text-generation-inference y endpoints compatibles. No se documenta soporte de llama.cpp u Ollama para la variante restringida.
- Latencia medida: p50 de 1.19 s con batch size 1 en vLLM con decodificacion restringida, frente a 0.21 s sin restriccion. El coste asume 1.0 USD/hora de GPU al throughput medido en lote.
- Throughput: no se publica un valor explicito de tokens por segundo; solo la latencia p50 y el coste derivado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BFCL AST mean | Irrelevancia | JSON parse rate | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| ToolSure CONSTRAINED | 1.5B | no disponible | 85.2 | 60.4 | 99.9 | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct (prompted) | 1.5B | no disponible | 84.2 | 64.6 | 99.2 | Apache 2.0 | Hugging Face |
| ToolSure SFT | 1.5B | no disponible | 85.9 | 29.6 | 99.3 | Apache 2.0 | Hugging Face (coleccion ToolSure) |
| Qwen2.5-7B-Instruct (prompted) | 7B | no disponible | 90.6 | 67.5 | 99.8 | Apache 2.0 | Hugging Face |

Frente al modelo base sin ajustar, ToolSure CONSTRAINED mejora la garantia de formato (99.9% frente a 99.2%) y elimina las funciones alucinadas, pero no supera en precision AST media al modelo base (85.2 frente a 84.2 es una mejora marginal) ni a la variante SFT (85.9). Frente a Qwen2.5-7B-Instruct, el modelo de 7B mantiene una ventaja de unos 5 puntos en AST medio y 6 puntos en irrelevancia, a costa de un tamano 4.6 veces mayor. La eleccion entre ambos depende de si prima la latencia y el coste o la precision de decision.

## Limitaciones y advertencias

- Solo soporta ingles; no se declaran capacidades multilingues.
- La decodificacion restringida no mejora la eleccion de la funcion ni los valores de los argumentos: garantiza formato, no correccion semantica. El propio autor lo senala explicitamente.
- La generalizacion fuera de distribucion es la mas debil de la tabla: 82.4 en xLAM held out, por debajo del modelo base prompted (84.2) y de SFT (86.2).
- La tasa de irrelevancia correcta es del 60.4%, identica a la variante ORPO: en torno al 40% de los prompts sin herramienta adecuada podrian acabar en una llamada innecesaria.
- La latencia se multiplica por aproximadamente 5.7 (de 0.21 s a 1.19 s p50) y el coste por consulta por aproximadamente 14 respecto a la inferencia sin restricciones, lo que puede ser prohibitivo en produccion de alto volumen.
- El modelo tiene 1.5B parametros: el razonamiento multi-paso complejo y las tareas que exigen planificacion quedan fuera de su alcance frente a modelos de 7B o superiores.
- No se han publicado datos de sesgo, robustez ante prompts adversarios ni evaluaciones de seguridad.
- Riesgo de alucinacion en el texto libre: la restriccion solo aplica dentro de la etiqueta `<tool_call>`; fuera de ella el modelo puede generar contenido no verificado.
- El uso comercial esta permitido por la licencia Apache 2.0, pero no se ofrece garantia alguna por parte del autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de los resultados publicados.
- La integracion con vLLM requiere descargar y ejecutar `toolsure_constrained.py`, lo que anade una dependencia de codigo externo al pipeline de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AmareshHebbar/ToolSure_Qwen2.5_1.5B_CONSTRAINED
- Modelo base (ORPO): https://huggingface.co/AmareshHebbar/ToolSure_Qwen2.5_1.5B_ORPO
- Dataset de entrenamiento: https://huggingface.co/datasets/AmareshHebbar/ToolSure_Calls_Qwen2.5_1.5B
- Coleccion ToolSure: https://huggingface.co/collections/AmareshHebbar/toolsure-6af816d00a621b28fede6bab
- Modelo base original de Qwen: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
