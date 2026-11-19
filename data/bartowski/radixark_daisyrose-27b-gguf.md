# bartowski/RadixArk_DaisyRose-27B-GGUF

## Resumen

DaisyRose-27B es un modelo multimodal de tipo image-text-to-text desarrollado por RadixArk, construido sobre Qwen3.8-27B y sometido a un proceso de post-entrenamiento mediante aprendizaje por refuerzo (RL) a gran escala. La versión aquí descrita es la cuantización GGUF realizada por bartowski con llama.cpp (release b12412), que incluye calibración con imatrix y soporte para decodificación especulativa mediante MTP (multi-token prediction). Con 27.320.697.856 parámetros reales (28B según el checkpoint de origen), el modelo se posiciona en la franja de tamaño que permite despliegue en hardware de gama alta de consumo con cuantizaciones agresivas.

El interés del modelo radica en su enfoque de entrenamiento: RadixArk lo entrenó con Miles, su framework open source de RL para post-entrenamiento a gran escala, en modo completamente asíncrono, con 128 H200 dedicadas a la inferencia sobre tareas de agente y 16 adicionales al entrenador, durante 18 días sobre 144 H200 en total. El resultado declarado es una mejora sustancial en tareas de agente y terminal, con Terminal Bench 4.1 pass@1 pasando del 5,6% al 12,0% respecto al modelo base, además de ganancias en otros seis benchmarks.

La relevancia actual del modelo está en su combinación de tres factores: licencia Apache 2.0 (permisiva para uso comercial), capacidades multimodales de entrada (texto e imagen mediante fichero mmproj) y un formato de prompt orientado a razonamiento explícito con niveles de esfuerzo configurables. La disponibilidad en GGUF con un abanico amplio de cuantizaciones (desde Q4_0 de 16,27 GB hasta bf16 de 54,66 GB) facilita su evaluación local sin infraestructura de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B); multimodal image-text-to-text |
| Parametros totales | 27.320.697.856 (28B segun checkpoint de origen) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, IQ4_NL, Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones de bartowski); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso de aproximadamente 28B parámetros, y añade capacidad multimodal de entrada: acepta texto e imagen, esta última mediante un fichero mmproj separado en el ecosistema GGUF. La innovación principal no está en la arquitectura base sino en el post-entrenamiento: RadixArk aplicó aprendizaje por refuerzo con Miles, su framework open source de RL para post-entrenamiento a gran escala, en modalidad totalmente asíncrona. En este esquema, el agente continúa generando trayectorias mientras el entrenador actualiza los pesos, sin bloqueos mutuos, lo que permite aprovechar de forma continua el clúster.

El entrenamiento se prolongó durante 18 días sobre 144 GPU H200: 128 dedicadas a inferencia sobre tareas de agente y 16 al entrenador. El modelo incorpora soporte de decodificación especulativa mediante MTP (multi-token prediction), lo que puede reducir la latencia de generación en despliegues compatibles. Las cuantizaciones de bartowski se generaron con llama.cpp b12412 e incluyen calibración imatrix, lo que mejora la fidelidad de las cuantizaciones de baja precisión respecto a una cuantización naïve. El formato de prompt emplea tokens estilo ChatML (`<|im_start|>`/`<|im_end|>`) con un bloque `<think>` para el razonamiento y un nivel de esfuerzo declarado explícitamente ("Reasoning effort is set to xhigh").

## Capacidades

- Generación de texto y razonamiento explícito con modo thinking: el prompt fuerza la apertura de un bloque `<think>` antes de la respuesta final, y el nivel de esfuerzo de razonamiento es configurable mediante el system prompt.
- Entrada multimodal de imagen junto con texto (image-text-to-text), requiriendo el fichero mmproj en despliegues GGUF.
- Tool calling / function calling con un formato XML estructurado: las llamadas se envuelven en `<tool_call>` con bloques `<function=...>` y `<parameter=...>`, y el modelo puede emitir razonamiento en lenguaje natural antes de la llamada.
- Capacidades de agente y razonamiento multi-paso, reforzadas específicamente mediante RL sobre tareas de agente y terminal (mejora medida en Terminal Bench 4.1).
- Decodificación especulativa mediante MTP, orientada a reducir latencia en inferencia.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de cuantizaciones GGUF con imatrix, incluyendo formatos legacy (Q4_0, Q4_1) optimizados para eficiencia energética en Apple Silicon.

## Casos de uso

- Automatización de tareas de terminal y shell: el modelo fue entrenado con RL específicamente sobre tareas de agente y terminal, con Terminal Bench 4.1 pass@1 elevado del 5,6% al 12,0%; resulta adecuado para agentes que ejecutan comandos, interpretan salidas y corrigen errores en entornos controlados.
- Agentes con tool calling en pipelines de datos: el formato XML de llamadas a función permite integrarlo en orquestadores que exponen APIs como herramientas, con razonamiento previo a la llamada para justificar la selección de parámetros.
- Asistencia técnica con razonamiento verificable: el bloque `<think>` separa el razonamiento de la respuesta final, lo que facilita auditar la cadena de decisión en dominios donde la trazabilidad importa.
- Procesamiento de documentos con imagen: al aceptar entrada image-text-to-text, puede extraer información de capturas, diagramas o formularios combinándola con instrucciones textuales.
- Evaluación local de modelos de 27B en hardware de consumo: las cuantizaciones Q4_K_M (17,33 GB) e IQ4_NL (17,33 GB) permiten probar el modelo en GPUs de 24 GB, útil para prototipado antes de escalar a despliegues mayores.
- Despliegue en Apple Silicon con eficiencia energética: las cuantizaciones Q4_1 y Q4_0 están descritas por el autor como con mejor rendimiento tokens/watt en silicio de Apple, adecuadas para inferencia local en portátiles y equipos de sobremesa.
- Generación de código asistida con razonamiento multi-paso: el modo thinking y el soporte de herramientas permiten ciclos de generar, ejecutar y corregir código dentro de un mismo flujo de agente.

## Benchmarks y rendimiento

Los datos disponibles provienen del blog de RadixArk y de la nota de prensa de lavx.hu, y comparan el modelo con su base Qwen3.8-27B.

| Benchmark | Qwen3.8-27B (base) | DaisyRose-27B | Mejora |
|---|---|---|---|
| Terminal Bench 4.1 (pass@1) | 5,6% | 12,0% | +6,4 puntos |

El autor declara ganancias en seis benchmarks adicionales, pero los valores concretos no están disponibles en la información proporcionada. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q4_0 16,27 GB; Q4_K_M 17,33 GB; IQ4_NL 17,33 GB; Q4_1 17,75 GB; Q4_K_L 18,74 GB; Q5_K_S 19,49 GB; Q5_K_M 20,79 GB; Q6_K_S 22,78 GB; Q6_K 23,78 GB; Q6_K_L 24,88 GB; Q8_0 29,05 GB; bf16 54,66 GB. Añadir margen para el contexto KV y, en su caso, el fichero mmproj de visión.
- GPU recomendadas: para bf16, A100 80 GB o H100; para Q8_0, A100 40 GB o RTX 6000 Ada; para Q6_K y Q5_K_M, RTX 4090 (24 GB) o A6000 (48 GB); para Q4_K_M e inferiores, RTX 4090, RTX 4080 (16 GB, con cuidado por el margen de contexto) o GPUs de 24 GB.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con cuantizaciones hasta Q6_K, y en GPUs de 16 GB solo con Q4_0 y contexto reducido.
- Opciones de despliegue: llama.cpp (release b12412 o posterior, usado para la cuantización), Ollama y otros frontends compatibles con GGUF; el autor etiqueta el repo como `endpoints_compatible`. Para el modelo base en safetensors, vLLM o TGI serían las opciones habituales, aunque no se confirman en la información disponible.
- Latencia y throughput estimados: no disponibles. El modelo soporta decodificación especulativa MTP, que puede reducir la latencia en implementaciones que la habiliten, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DaisyRose-27B (esta ficha) | 27,3B (28B) | no disponible | Apache 2.0 | GGUF, safetensors | Multimodal, RL sobre tareas de agente, MTP |
| Qwen3.8-27B (base) | ~28B | no disponible | no disponible | no disponible | Modelo de partida; Terminal Bench 4.1 pass@1 5,6% |
| Alternativas de ~27-32B densas | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

La única comparación con cifras concretas disponible es frente a Qwen3.8-27B en Terminal Bench 4.1. Para el resto de alternativas de la misma franja de tamaño no hay datos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; al derivar de Qwen3.8-27B, hereda los sesgos de los datos de preentrenamiento de la base, que no se detallan.
- Riesgo de alucinación: no cuantificado; el modo thinking con esfuerzo "xhigh" puede aumentar la longitud de las respuestas y, con ello, el coste de inferencia sin garantía de corrección.
- Limitaciones de contexto e idioma: la longitud de contexto no está especificada y los idiomas soportados no están disponibles; conviene validar ambos antes de producción.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.8-27B, cuyo enlace se referencia en la model card pero cuyos términos no se detallan aquí.
- La multimodalidad requiere el fichero mmproj adicional; sin él, el modelo funciona solo con texto.
- El formato de tool calling es XML propietario (`<tool_call>`, `<function=...>`), no JSON estándar de OpenAI; los orquestadores deben adaptar el parser.
- El modelo se ha publicado recientemente (18 de noviembre de 2026) con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación independiente de los benchmarks declarados.
- El repo GGUF ocupa 444,5 GB por incluir todas las cuantizaciones; descargar solo el fichero necesario.
- Las ganancias de RL se midieron en tareas de agente y terminal; no hay datos que confirmen que se mantengan en otros dominios.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/bartowski/RadixArk_DaisyRose-27B-GGUF
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Licencia del modelo base: https://huggingface.co/RadixArk/DaisyRose-27B/blob/main/LICENSE
- Blog de RadixArk: https://www.radixark.com/blog/daisyrose-27b
- Nota de prensa (lavx.hu): https://news.lavx.hu/article/radixark-releases-daisyrose-27b-built-on-qwen3-8-27b
- llama.cpp (release b12412): https://github.com/ggml-org/llama.cpp/releases/tag/b12412
- Framework Miles (RL de RadixArk): no disponible el enlace directo en la información proporcionada
