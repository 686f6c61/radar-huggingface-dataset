# serkanpeker/Turkish-Gemma-9b-T1-GGUF

## Resumen

Turkish-Gemma-9b-T1-GGUF es una colección de cuantizaciones en formato GGUF del modelo `ytu-ce-cosmos/Turkish-Gemma-9b-T1`, publicada por el usuario serkanpeker. El modelo base es un ajuste de Gemma 2 de 9B orientado al turco, y esta versión GGUF está pensada para su uso con llama.cpp y entornos compatibles (Ollama, LM Studio, etc.). La aportación principal no es el modelo en sí, sino el proceso de cuantización: se ha generado una importance matrix (imatrix) calculada sobre texto de Wikipedia en turco para reducir la degradación de las cuantizaciones de baja precisión.

El repositorio incluye siete archivos GGUF (Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS e IQ3_M, todos con sufijo `-tr` salvo Q8_0) más el propio archivo de importance matrix. El autor documenta con detalle la divergencia KL frente al modelo BF16 sobre 2.009 frases paralelas de FLORES+ (dev y devtest), lo que permite elegir el nivel de cuantización con criterio cuantitativo en lugar de por intuición. Es relevante para quien necesite desplegar un modelo conversacional en turco en hardware modesto sin renunciar en exceso a la calidad.

El modelo base tiene 9.241.705.984 parámetros y una ventana de contexto que no se especifica en la información disponible, aunque por herencia de Gemma 2 se espera un contexto largo; no se confirma en la documentación proporcionada. La licencia es la Gemma Terms of Use, con las restricciones de uso de la sección 3.2 y la Gemma Prohibited Use Policy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Gemma 2; no se detalla en la model card) |
| Parametros totales | 9.241.705.984 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ3_M (todos GGUF; Q6_K a IQ3_M con imatrix turca) |
| Idiomas soportados | tr, tur, en |
| Licencia | gemma (Gemma Terms of Use + Gemma Prohibited Use Policy) |
| Formato de pesos | GGUF (llama.cpp); el modelo base original en safetensors |

## Arquitectura y entrenamiento

La model card de esta versión GGUF no describe la arquitectura del modelo base; solo indica que es una cuantización de `ytu-ce-cosmos/Turkish-Gemma-9b-T1` (revisión `bc2e306`). Por el nombre y el tamaño (9.241.705.984 parámetros) se trata de un ajuste de Gemma 2 de 9B, un transformer decoder-only con atención por ventanas alternas y atención global, aunque estos detalles no se confirman en la documentación disponible. El modelo base está etiquetado como conversacional y con marcadores de razonamiento `<think>` y `</think>` en su vocabulario (ids 7 y 8), lo que sugiere un ajuste orientado a razonamiento paso a paso.

El trabajo técnico de esta publicación se centra en la cuantización. Se usó llama.cpp b12116 (`5851a8e`) para convertir y cuantizar. Todos los archivos excepto Q8_0 emplean una importance matrix calculada sobre 200 fragmentos de 512 tokens extraídos de Wikipedia en turco (`wikimedia/wikipedia` 20231101.tr), con artículos disjuntos del texto de evaluación. El autor reporta que, en cuatro muestras de calibración distintas, la imatrix turca redujo la divergencia KL media en turco a Q4_K_M en torno a un 3% frente a una imatrix inglesa, y aproximadamente un 34% frente a no usar imatrix (0,0358 frente a 0,0546). Como el repositorio base no incluía `tokenizer.model`, se usó el SentencePiece de Gemma 2 de `unsloth/gemma-2-9b` (revisión `9145841`); el vocabulario GGUF se verificó contra el `tokenizer.json` del base: los 256.000 ids coinciden, con 31 diferencias solo de notación.

## Capacidades

- Generación de texto conversacional en turco e inglés, con etiquetas de idioma `tr`, `tur` y `en`.
- Razonamiento paso a paso: el vocabulario incluye los marcadores `<think>` y `</think>`, lo que indica soporte de modo de razonamiento explícito.
- Respuestas concisas y siguiendo instrucciones, según la descripción del modelo base recogida en resultados de búsqueda.
- Capacidad matemática y de razonamiento lógico mejorada respecto al Gemma base, según la misma fuente secundaria (no confirmado en la model card oficial).
- Compatibilidad con llama.cpp y endpoints compatibles (etiqueta `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Asistente conversacional en turco en local: desplegando Q4_K_M-tr.gguf (5,76 GB) con llama-server se obtiene un chatbot que cabe en GPUs de consumo y mantiene una divergencia KL baja (0,0358 en turco) respecto al BF16.
- Generación de texto en turco para edición o redacción: el uso de imatrix calculada sobre Wikipedia turca preserva mejor el vocabulario y la morfología del idioma en cuantizaciones agresivas, adecuado para tareas de redacción y resumen.
- Razonamiento y resolución de problemas matemáticos: el modelo base está descrito como orientado a problemas matemáticos, inferencia paso a paso y planificación, por lo que puede usarse para tutoría o resolución guiada de ejercicios.
- Despliegue en entornos con recursos limitados: IQ3_M-tr.gguf (4,49 GB) permite ejecutar el modelo en GPUs de 6-8 GB, con una divergencia KL mayor (0,1284 en turco) que debe tenerse en cuenta.
- Evaluación y comparación de cuantizaciones: el repositorio y el dataset `serkanpeker/turkish-tax` permiten reproducir las mediciones de KL y comparar el efecto de la imatrix turca frente a la inglesa o a la ausencia de imatrix.
- Integración en pipelines de traducción o procesamiento bilingüe tr/en: FLORES+ se usó para medir la calidad, y el modelo soporta ambos idiomas, aunque no se documenta un rendimiento específico de traducción.
- Prototipado rápido con Ollama o LM Studio: al ser GGUF, se puede cargar directamente en herramientas de inferencia local sin conversión adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo proporciona métricas de divergencia KL frente al BF16 sobre 2.009 frases paralelas de FLORES+ (dev y devtest), con ventanas de 512 tokens:

| Archivo | Tamano (GB) | KLD vs BF16, turco | KLD vs BF16, ingles | Mismo token top, turco |
|---|---|---|---|---|
| Q8_0.gguf | 9,83 | 0,0013 | 0,0007 | 98,5% |
| Q6_K-tr.gguf | 7,59 | 0,0051 | 0,0028 | 97,1% |
| Q5_K_M-tr.gguf | 6,65 | 0,0112 | 0,0068 | 95,4% |
| Q4_K_M-tr.gguf | 5,76 | 0,0358 | 0,0220 | 92,3% |
| IQ4_XS-tr.gguf | 5,18 | 0,0525 | 0,0322 | 90,8% |
| IQ3_M-tr.gguf | 4,49 | 0,1284 | 0,0781 | 85,5% |
| Q4_K_M sin imatrix (referencia, no subido) | 5,76 | 0,0546 | 0,0324 | 90,5% |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del archivo más el overhead de contexto y caché KV. Q8_0 requiere unos 10 GB; Q4_K_M unos 6 GB; IQ3_M unos 4,5 GB. Para contexto largo hay que sumar la caché KV, cuyo tamaño no se especifica.
- GPU recomendadas: para Q8_0, una GPU de 12-16 GB (RTX 4070 Ti Super, RTX 4080, A100 40 GB); para Q4_K_M, una GPU de 8 GB (RTX 3060 Ti, RTX 4060 Ti) o incluso 6 GB con IQ3_M.
- Cabe en GPU de consumo: sí, en la mayoría de modelos recientes con 8 GB o más para Q4_K_M e IQ4_XS; IQ3_M puede caber en 6 GB.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli), y por extensión Ollama y LM Studio; la etiqueta `endpoints_compatible` sugiere compatibilidad con servidores de endpoints tipo OpenAI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Turkish-Gemma-9b-T1-GGUF (este) | 9,24B | no disponible | KLD Q4_K_M 0,0358 (turco) | Gemma Terms | GGUF en HF |
| titantv090/Turkish-Gemma-9b-T1-GGUF | 9,24B (mismo base) | no disponible | no disponible | Gemma Terms | GGUF en HF |
| ytu-ce-cosmos/Turkish-Gemma-9b-T1 (base) | 9,24B | no disponible | referencia BF16 | Gemma Terms | safetensors en HF |
| Gemma 2 9B (original) | 9,24B | no disponible | no disponible en esta ficha | Gemma Terms | safetensors y GGUF en HF |

## Limitaciones y advertencias

- La divergencia KL mide la distancia al modelo BF16 sobre texto no usado en calibración, no la precisión en tareas; un KLD bajo no garantiza buen rendimiento en tareas concretas.
- El texto en turco muestra mayor divergencia KL por token que el inglés en todas las cuantizaciones, por lo que la degradación relativa es mayor en turco.
- FLORES+ podría formar parte de los datos de entrenamiento del modelo base, lo que podría inflar la calidad aparente en esa evaluación.
- La imatrix se calculó sobre Wikipedia turca; el rendimiento en dominios alejados de ese registro (técnico, jurídico, coloquial) puede degradarse más de lo que indican las métricas.
- No se documentan sesgos específicos, pero al derivar de Gemma 2 y de un ajuste sobre datos turcos, es previsible que herede sesgos del corpus original; no hay evaluación al respecto en la información disponible.
- Riesgo de alucinación: no cuantificado en la documentación; es un modelo generativo y debe validarse en producción.
- Restricciones de licencia: uso sujeto a la Gemma Terms of Use y a la Gemma Prohibited Use Policy (sección 3.2); el archivo `NOTICE` y la copia de los términos están incluidos en el repositorio.
- Los archivos han sido modificados respecto a los pesos originales (conversión y cuantización); el autor indica que los datos de los tensores son idénticos a los medidos y publica los SHA-256 en el repositorio de GitHub.
- No se especifica la longitud de contexto soportada, lo que impide planificar despliegues con ventanas largas sin verificación previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/serkanpeker/Turkish-Gemma-9b-T1-GGUF
- Modelo base: https://huggingface.co/ytu-ce-cosmos/Turkish-Gemma-9b-T1
- Dataset de mediciones: https://huggingface.co/datasets/serkanpeker/turkish-tax
- Scripts y logs: https://github.com/speker/turkish-tax
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- Tokenizador usado en la conversión: https://huggingface.co/unsloth/gemma-2-9b
- Cuantización alternativa del mismo base: https://huggingface.co/titantv090/Turkish-Gemma-9b-T1-GGUF
- Ficha en local-ai-zone: https://local-ai-zone.github.io/models/turkish-gemma-9b-t1.html
