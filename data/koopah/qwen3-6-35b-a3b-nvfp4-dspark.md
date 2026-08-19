# Koopah/Qwen3.6-35B-A3B-NVFP4-DSPARK

## Resumen

Qwen3.6-35B-A3B-NVFP4-DSPARK es un modelo auxiliar de decodificación especulativa (draft model) desarrollado por Koopah, diseñado para acelerar la inferencia del modelo Qwen3.6-35B-A3B en su versión cuantizada NVFP4 publicada por Unsloth. Este modelo base es un MoE híbrido (atención y gated-DeltaNet) con 35 000 millones de parámetros totales y 3 000 millones activos, y el draft se ha entrenado específicamente para consumir los estados ocultos (hidden states) de ese checkpoint cuantizado, no de la versión bf16 original.

La técnica DSPARK permite generar un bloque completo de tokens en una sola pasada hacia delante, y el modelo objetivo verifica esos tokens mediante la regla de aceptación de ratio `min(1, q/p)`, lo que garantiza que la calidad de la salida sea idéntica a la del modelo base ejecutado sin especulación, independientemente de la temperatura de muestreo. El draft tiene 1 530 167 041 parámetros (aproximadamente 1,53 mil millones) y se distribuye en formato safetensors con licencia Apache 2.0.

Su relevancia radica en que ofrece una aceleración significativa de la inferencia: en las pruebas publicadas, alcanza hasta 3,1 veces la velocidad de decodificación sin especulación en vLLM (568 tokens por segundo en solicitudes individuales) y hasta 6 835 tokens por segundo agregados con 96 solicitudes concurrentes. Está pensado para entornos de producción que sirven Qwen3.6-35B-A3B NVFP4, y el autor ha publicado una versión v2 con mejoras adicionales, aunque este checkpoint v1 sigue disponible para quienes necesiten fijar una versión concreta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada (modelo de draft para decodificación especulativa, probablemente un transformer denso pequeño, no confirmado) |
| Parametros totales | 1 530 167 041 (1,53 mil millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificado; por el tamaño del repositorio (3,1 GB) se infiere precisión de 16 bits (bf16/fp16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un draft model entrenado para predecir bloques de tokens que el modelo objetivo Qwen3.6-35B-A3B NVFP4 verificará posteriormente. A diferencia de otros métodos de especulación como MTP (multi-token prediction), DSPARK genera todo el bloque en una sola pasada, lo que reduce la sobrecarga computacional. El entrenamiento se ha realizado capturando los estados ocultos del checkpoint NVFP4 congelado (revisión `612d523c58`), de modo que el draft está alineado con las activaciones reales del modelo cuantizado, no con las del bf16 original. Según el autor, el entrenamiento aún está en curso y este checkpoint representa la mejor puntuación obtenida hasta la fecha, con expectativas de mejoras adicionales.

No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni el método de optimización empleado. El autor indica que el modelo es compatible con los targets NVFP4 y NVFP4-Fast de Unsloth, y que es probablemente compatible con las variantes fp8 y bf16 de Qwen3.6-35B-A3B, aunque estas últimas no han sido probadas.

## Capacidades

- Generación de tokens especulativos: produce bloques de tokens (configurables con k=4, 6 u 8) que el modelo objetivo verifica con la regla de aceptación de ratio, manteniendo la calidad de salida idéntica al modelo sin especulación.
- Aceleración de inferencia: mejora el throughput y reduce la latencia en comparación con la decodificación autoregresiva estándar y con el método MTP integrado en vLLM y sglang.
- Compatibilidad con motores de inferencia: probado con sglang (fork específico) y vLLM 0.26, con soporte para despliegue en GPU única.
- Integración con el ecosistema Qwen3.6: diseñado específicamente para el checkpoint NVFP4 de Unsloth, aunque se espera que funcione con otras cuantizaciones del mismo modelo base.
- No es un modelo autónomo: no puede generar texto por sí mismo; requiere el modelo objetivo para funcionar.
- No incluye capacidades de visión, audio ni tool calling, ya que su función es exclusivamente acelerar la decodificación del modelo base.

## Casos de uso

- Servidores de inferencia de alta concurrencia: en entornos con muchas solicitudes simultáneas (por ejemplo, API de chat para múltiples usuarios), el draft permite aumentar el throughput agregado. Según las pruebas, en vLLM con 96 solicitudes concurrentes se alcanzan 6 835 tokens por segundo agregados frente a 4 790 sin especulación, lo que reduce el coste por token servido.
- Reducción de latencia en aplicaciones interactivas: para chatbots o asistentes que requieren respuestas rápidas, la decodificación especulativa con k=8 ofrece 568 tokens por segundo en solicitudes individuales (3,1 veces más rápido que sin especulación), mejorando la experiencia de usuario.
- Despliegue en GPU única con memoria limitada: al ser un modelo pequeño (1,53 mil millones de parámetros, ~3 GB), puede acompañar al modelo base NVFP4 en una GPU de 96 GB sin incrementar significativamente el uso de VRAM, permitiendo servir el modelo completo en un solo dispositivo.
- Evaluación de modelos y pruebas de rendimiento: los desarrolladores pueden utilizar este draft para comparar el rendimiento de Qwen3.6-35B-A3B NVFP4 con y sin especulación, y ajustar el parámetro k según la carga de trabajo.
- Integración en pipelines de generación de código o resumen: dado que el modelo base Qwen3.6 destaca en tareas de programación y razonamiento, el draft permite acelerar estas tareas en entornos de producción sin sacrificar calidad.
- Experimentación con técnicas de decodificación especulativa: el modelo sirve como referencia para investigar métodos alternativos de aceleración, ya que el autor ha publicado comparativas detalladas con MTP y sin especulación en dos motores distintos.

## Benchmarks y rendimiento

El autor ha publicado mediciones de rendimiento en GPU única (RTX PRO 6000 Blackwell 96 GB, Max-Q) utilizando un protocolo de referencia fijo: un lote de B solicitudes simultáneas, prompt fijo de 16 preguntas GSM8K concatenadas, salida forzada a 1024 tokens, temperatura 0,7 y caché de prompt deshabilitada. Los resultados se promedian sobre 3 rondas. Se presentan dos conjuntos de datos: uno para sglang (fork) y otro para vLLM 0.26, más un escenario de serving continuo. Las cifras se obtuvieron sin truncamiento por confianza, por lo que representan un límite inferior del rendimiento potencial.

| Motor | Configuracion | Velocidad por usuario (tok/s) | Throughput agregado (tok/s) |
|---|---|---|---|
| sglang | DSpark k=8, bs1 | 422 | - |
| sglang | DSpark k=8, bs16 | 202 | 3 237 |
| sglang | DSpark k=8, bs96 | 56 | 5 376 |
| sglang | Sin especulacion, bs1 | 156 | - |
| sglang | Sin especulacion, bs96 | 43 | 4 128 |
| vLLM | DSpark k=8, bs1 | 568 | - |
| vLLM | DSpark k=8, bs16 | 259 | 4 144 |
| vLLM | DSpark k=8, bs96 | 71 | 6 835 |
| vLLM | Sin especulacion, bs1 | 185 | - |
| vLLM | Sin especulacion, bs96 | 50 | 4 790 |

En el escenario de serving continuo (sglang, con caché radix activada), DSpark k=8 alcanza 443 tok/s en bs1 y 5 205 tok/s agregados en bs96, superando a MTP (3 226 tok/s agregados en bs96) y a la decodificación sin especulación (2 681 tok/s). No se han publicado benchmarks de calidad de lenguaje (MMLU, HumanEval, GSM8K) para este modelo, ya que no es un modelo de propósito general; su métrica principal es la tasa de aceptación y la velocidad de decodificación.

## Requisitos de hardware

- GPU recomendada: RTX PRO 6000 Blackwell 96 GB (utilizada en las pruebas). Se requiere al menos la memoria necesaria para el modelo base NVFP4 (aproximadamente 35 GB en cuantización NVFP4) más el draft (~3 GB), por lo que una GPU de 48 GB o superior es adecuada.
- VRAM estimada: el draft ocupa unos 3,1 GB en precisión de 16 bits; el modelo base NVFP4 ocupa aproximadamente 17,5 GB (35B × 4 bits), por lo que el conjunto completo cabe en GPUs con 24 GB o más, aunque las pruebas se realizaron en 96 GB.
- GPU compatibles: cualquier GPU con soporte para CUDA y suficiente VRAM, como RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB). No se han probado en hardware de consumo, pero es probable que funcione en una RTX 4090 con cuantización adicional.
- Opciones de despliegue: sglang (fork específico del autor), vLLM 0.26, y para la versión v2 también llama.cpp con binarios precompilados. No se menciona soporte para Ollama u otros servidores.
- Latencia y throughput: en las pruebas, DSpark k=8 ofrece 568 tok/s en vLLM para una sola solicitud y 6 835 tok/s agregados con 96 solicitudes. En sglang, 422 tok/s en bs1 y 5 376 tok/s agregados en bs96. Estas cifras dependen del hardware y de la configuración.

## Comparativa con modelos similares

La comparativa se realiza con el método MTP (multi-token prediction) integrado en vLLM y sglang, y con la decodificación sin especulación, ambos sobre el mismo modelo base Qwen3.6-35B-A3B NVFP4. No se dispone de datos de otros draft models como EAGLE o Medusa para este modelo base específico.

| Metodo | Parametros adicionales | Velocidad bs1 (vLLM) | Throughput bs96 (vLLM) | Licencia |
|---|---|---|---|---|
| DSpark k=8 | 1,53 mil millones | 568 tok/s | 6 835 tok/s | Apache 2.0 |
| MTP (k=4) | No especificado | 341 tok/s | 5 818 tok/s | Depende del motor |
| Sin especulacion | - | 185 tok/s | 4 790 tok/s | - |

En sglang, DSpark k=8 alcanza 422 tok/s en bs1 y 5 376 tok/s agregados en bs96, frente a 290 tok/s y 5 453 tok/s respectivamente para MTP (steps 4, k=6). El draft supera a MTP en todos los tamaños de lote probados en ambos motores. No se han encontrado comparaciones con otros draft models específicos para Qwen3.6.

## Limitaciones y advertencias

- Entrenamiento en curso: el autor indica que el modelo sigue en entrenamiento y que este checkpoint es una publicación anticipada; las actualizaciones futuras pueden mejorar la tasa de aceptación.
- No es un modelo independiente: requiere el modelo objetivo Qwen3.6-35B-A3B NVFP4 (o compatible) para funcionar; no puede generar texto por sí solo.
- Dependencia de un checkpoint específico: el draft está entrenado contra el checkpoint NVFP4 congelado (revisión `612d523c58`). El autor advierte que el repositorio upstream de Unsloth reemplazó silenciosamente los pesos el 2026-07-10 con una reexportación de precisión mixta que produce salidas degenerativas, por lo que se debe usar el repositorio congelado `Koopah/Qwen3.6-35B-A3B-NVFP4` en lugar del `main` de Unsloth.
- Sin soporte de confianza: ninguna de las versiones actuales de los motores integra la cabeza de confianza del draft, por lo que todas las verificaciones se realizan sobre el bloque completo. Las cifras publicadas son un límite inferior; el rendimiento real podría ser mayor cuando se implemente el truncamiento por confianza.
- Idiomas y sesgos: no se dispone de información sobre los idiomas soportados ni sobre posibles sesgos del modelo. Al ser un modelo auxiliar, su impacto en la calidad final depende del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero es necesario verificar la licencia del modelo base Qwen3.6-35B-A3B (que también es Apache 2.0 según los metadatos). No se han identificado restricciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Koopah/Qwen3.6-35B-A3B-NVFP4-DSPARK
- Modelo objetivo congelado: https://huggingface.co/Koopah/Qwen3.6-35B-A3B-NVFP4
- Modelo base original de Unsloth: https://huggingface.co/unsloth/Qwen3.6-35B-A3B-NVFP4
- Versión v2 del draft: https://huggingface.co/Koopah/Qwen3.6-35B-A3B-NVFP4-DSPARK-v2
- Versión v2 en GGUF: https://huggingface.co/Koopah/Qwen3.6-35B-A3B-NVFP4-DSPARK-v2-GGUF
- Binarios precompilados de llama.cpp: https://github.com/KoopahTManiac/speed.llama.cpp/releases
- Blog de lmsys sobre DSpark: https://lmsys.org/blog/ (referencia del protocolo de benchmark)
- Guía de Qwen 3.6 (insiderllm): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Página de Qwen3.6-35B-A3B en NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nim/teams/qwen/models/qwen3.6-35b-a3b
