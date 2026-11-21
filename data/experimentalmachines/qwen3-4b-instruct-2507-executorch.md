# experimentalmachines/Qwen3-4B-Instruct-2507-ExecuTorch

## Resumen

Esta ficha describe una exportación del modelo Qwen3-4B-Instruct-2507 de Alibaba Qwen al formato ExecuTorch, realizada por el usuario experimentalmachines. No se trata de un modelo nuevo ni de un reentrenamiento, sino de una conversión de pesos orientada a inferencia en dispositivo (on-device), pensada para ejecutarse en teléfonos Android mediante la aplicación openweights o cualquier runtime ExecuTorch 1.5.1. El modelo base es un transformer denso de 4 mil millones de parámetros con licencia Apache 2.0 y ventana de contexto nativa de 262.144 tokens; las exportaciones incluyen variantes de ventana fija entre 2.048 y 32.768 tokens.

El interés de esta conversión radica en que empaqueta el modelo en ficheros `.pte` listos para tres backends de hardware: XNNPACK sobre CPU arm64, Vulkan sobre GPU y MediaTek NeuroPilot sobre la NPU del SoC MT6991 (Dimensity 9400). Las cuantizaciones aplicadas son 8da4w con GPTQ para XNNPACK y Vulkan, y a16w8 para NeuroPilot, lo que reduce el peso de los ficheros a rangos de 1,10 GB a 3,61 GB según backend y ventana.

La relevancia de esta ficha es práctica: permite a desarrolladores Android desplegar un modelo de 4B con calidad de instrucción razonable sin conexión a red, con límites claros de memoria (el KV cache se reserva completo al cargar) y con un presupuesto de referencia de 5 GB por dispositivo. No hay resultados de benchmarks publicados para esta exportación concreta, por lo que la evaluación debe hacerse sobre el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-4B-Instruct-2507); exportado a ExecuTorch `.pte` |
| Parametros totales | 4 mil millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048, 4.096, 8.192, 16.384 y 32.768 tokens según fichero; ventana fija embebida en cada `.pte` |
| Tipos de cuantizacion | 8da4w con GPTQ (XNNPACK y Vulkan); a16w8 (MediaTek NeuroPilot); embeddings en fp32 para NeuroPilot |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pte` (ExecuTorch); tokenizer en `tokenizer.json`; embeddings NeuroPilot en `.bin` fp32 |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de Qwen3 en su variante Instruct-2507, con 4 mil millones de parámetros. Esta ficha no documenta el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, etapas de RLHF o DPO); esa información corresponde a la model card original de Qwen, no a esta exportación.

La innovación técnica de esta publicación es el pipeline de exportación a ExecuTorch. Cada fichero `.pte` fija una ventana de contexto concreta porque el runtime reserva la totalidad del KV cache al cargar el modelo: para XNNPACK a 2.048 tokens el KV cache consume 294.912 bytes por token en fp32, es decir, 603.979.776 bytes para la ventana completa; a 4.096 tokens asciende a 1.207.959.552 bytes. Esto implica que la elección de ventana es una decisión de memoria, no un parámetro en tiempo de ejecución. La carpeta de cada backend incluye un `config.json` con todas las variantes y un `export-report-<window>.json` con el registro completo de exportación. Los ficheros NeuroPilot se dividen en cuatro chunks por ventana y comparten una tabla de embeddings fp32 leída desde disco.

## Capacidades

- Generación de texto conversacional e instruccional, heredada del modelo base Qwen3-4B-Instruct-2507.
- Razonamiento y matemáticas de nivel medio, limitado por el tamaño de 4B y por la cuantización.
- Generación de código, con la misma salvedad de tamaño y cuantización.
- Ejecución totalmente local y offline en dispositivos Android, sin llamadas a servicios externos.
- Tres rutas de aceleración: CPU arm64 (XNNPACK), GPU (Vulkan) y NPU MediaTek (NeuroPilot en MT6991).
- Tool calling y capacidades de agente: no documentadas en esta exportación; dependen del runtime y del prompt, no hay evidencia publicada en la información disponible.
- Capacidades multilingües: no disponibles en esta ficha; deben consultarse en la model card del modelo base.
- Modo thinking, visión y audio: no disponibles en esta exportación.

## Casos de uso

- Asistentes de texto offline en Android: integración del `.pte` XNNPACK de 4k o 8k en una app que responda consultas sin red, aprovechando que el fichero pesa 2,66 GB y cabe en el presupuesto de 5 GB del dispositivo.
- Autocompletado y redacción en teclados o apps de notas: uso de la variante de 2.048 tokens con XNNPACK para latencia baja y consumo de memoria contenido, suficiente para sugerencias de párrafo corto.
- Procesamiento de documentos locales: con la ventana de 16k o 32k se pueden resumir correos, contratos o artículos dentro del propio teléfono, sin enviar el contenido a un servidor.
- Inferencia acelerada por GPU en terminales con Vulkan: la variante Vulkan de 8k (3,46 GB) permite descargar el trabajo de la CPU en escenarios de generación sostenida, a costa de mayor huella de memoria.
- Despliegue sobre NPU en Dimensity 9400: la variante NeuroPilot a16w8 en cuatro chunks (1,10 GB + 1,49 GB por ventana) está pensada para dispositivos con MT6991, donde la NPU ofrece mejor eficiencia energética que CPU o GPU.
- Prototipado de agentes locales con herramientas: el modelo base soporta instrucciones estructuradas; en esta exportación se puede usar para experimentar con flujos de varios pasos siempre que el runtime gestione el estado de conversación y el KV cache fijo.
- Evaluación comparativa de backends: los informes de exportación y los `config.json` permiten medir latencia y memoria de XNNPACK frente a Vulkan y NeuroPilot en el mismo dispositivo, útil para decidir la ruta de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta una prueba de humo ("smoke test") superada en las variantes XNNPACK, con la respuesta "Paris"; las variantes Vulkan y MediaTek solo tienen verificada la estructura del fichero, sin ejecución en runtime NPU de host.

## Requisitos de hardware

- VRAM/RAM estimada: XNNPACK entre 2,66 GB y 2,72 GB según ventana, más el KV cache reservado completo al cargar (604 MB a 2k, 1,21 GB a 4k, escalando proporcionalmente hasta 32k).
- Vulkan: entre 3,42 GB y 3,61 GB según ventana, con el mismo esquema de reserva completa del KV cache.
- MediaTek NeuroPilot: 1,10 GB por chunk más 1,49 GB en el cuarto chunk, más la tabla de embeddings fp32 compartida; solo válido en MT6991 (Dimensity 9400).
- Presupuesto de referencia del autor: 5 GB por dispositivo, con el campo `fits_phone_budget` en cada `config.json` como estimación.
- GPU de escritorio: no aplica; estas exportaciones están dirigidas a arm64 Android. Para servir el modelo base en servidor se requieren GPUs convencionales (no especificadas en esta ficha).
- Consumer GPU: no procede para esta exportación; el objetivo son SoCs móviles.
- Opciones de despliegue: app openweights para Android, o cualquier runtime ExecuTorch 1.5.1 con soporte XNNPACK, Vulkan o NeuroPilot.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-Instruct-2507-ExecuTorch (esta ficha) | 4B | 2k a 32k fijo por fichero | `.pte` ExecuTorch | Apache 2.0 | Hugging Face, 1.112 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4B | 262.144 tokens nativo | safetensors | Apache 2.0 | Hugging Face |
| Otras exportaciones ExecuTorch de modelos 3B-4B | no disponible | no disponible | `.pte` | variable | no disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de esta exportación con alternativas; la comparación se limita a parámetros, contexto, formato y licencia.

## Limitaciones y advertencias

- La cuantización 8da4w con GPTQ y a16w8 introduce pérdida de precisión respecto al modelo base; no hay evaluación publicada del degradado en esta exportación.
- La ventana de contexto es fija por fichero y el KV cache se reserva completo al cargar: elegir una ventana mayor de la que el dispositivo soporta provoca fallo de asignación de memoria.
- Las variantes Vulkan y MediaTek solo tienen verificada la estructura del fichero; no se han ejecutado en hardware real según la model card, por lo que su funcionamiento en producción no está validado.
- La variante NeuroPilot está restringida al SoC MT6991 (Dimensity 9400); no es portable a otras NPU.
- Riesgo de alucinación inherente a un modelo de 4B, agravado por la cuantización en tareas de razonamiento largo o matemáticas.
- Sesgos: no documentados en esta ficha; deben consultarse en la model card del modelo base Qwen3-4B-Instruct-2507.
- Idiomas soportados: no disponibles en esta ficha.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar la licencia del modelo base y de las dependencias del runtime ExecuTorch.
- El repositorio ocupa 86,1 GB por acumulación de variantes; descargar solo el fichero necesario para el dispositivo objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/Qwen3-4B-Instruct-2507-ExecuTorch
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507/blob/main/LICENSE
- App openweights: https://github.com/alpharomercoma/openweights
