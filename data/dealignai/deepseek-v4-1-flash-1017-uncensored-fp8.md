# dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8

## Resumen

DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8 es una versión sin mecanismos de rechazo del modelo DeepSeek-V4.1-Flash-1017, publicada por dealignai el 18 de octubre de 2026. Se distribuye en FP8 nativo (e4m3) con escalas de bloque ue8m0 y expertos FP4, conserva la ventana de contexto de 1 millón de tokens del modelo original y mantiene las capacidades multimodales (imagen y vídeo), el tool calling y los niveles de esfuerzo de razonamiento (low, high, max).

El repositorio declara 763.205.315.794 parámetros según los safetensors y ocupa 510,3 GB repartidos en 48 shards. La modificación es exclusivamente a nivel de pesos: no hay SFT, RLHF, DPO, LoRA ni cambios en el tokenizer o en la plantilla de chat, y el formato en disco es compatible byte a byte con el motor de inferencia de referencia de DeepSeek.

Es relevante porque combina tres cosas poco habituales en un modelo abierto de este tamaño: cuantización FP8 nativa en lugar de post-entrenamiento, contexto de 1M tokens con entrada visual y de vídeo, y una edición de pesos que elimina el comportamiento de rechazo sin sacrificar las capacidades del modelo base. El acceso está restringido mediante gate con confirmación de mayoría de edad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE de 40 capas con atención de contexto largo, multimodal (imagen y vídeo); FP8 e4m3 nativo con escalas de bloque ue8m0 y expertos FP4 |
| Parametros totales | 763.205.315.794 (según safetensors); algunas fuentes de terceros citan 552B para variantes del mismo modelo |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | FP8 e4m3 nativo con escalas ue8m0 por bloque y expertos FP4; el autor desaconseja derivar cuantizaciones de menos bits directamente de este checkpoint; existe una variante EXL3 de 2,9 bpw construida de forma independiente |
| Idiomas soportados | en, zh, es, fr, ru, it, th |
| Licencia | MIT, con acceso restringido (gate) que exige confirmar mayoría de edad, uso legal y aceptación de responsabilidad sobre las salidas |
| Formato de pesos | safetensors (48 shards), FP8 e4m3 + escalas ue8m0, expertos FP4; compatible con el motor `inference/` y el renderizador `encoding/` de DeepSeek |

## Arquitectura y entrenamiento

El modelo base es un MoE de 40 capas con capacidades multimodales (texto, imagen y vídeo), tool calling, niveles de esfuerzo de razonamiento y decodificación especulativa DSpark. El checkpoint se distribuye en la misma precisión que emplea DeepSeek en origen: pesos FP8 e4m3 con escalas de bloque ue8m0 y expertos en FP4, sin conversión intermedia a GGUF ni reempaquetado que reduzca la precisión.

Esta versión concreta no se ha entrenado: la edición es una ablación a nivel de pesos que elimina la dirección de rechazo aprendida por el modelo base. El autor indica explícitamente que no se ha introducido ningún dato nuevo, que no hay SFT, RLHF ni DPO, que no se ha modificado el tokenizer ni la plantilla Jinja y que no existe ningún adaptador ni hook en tiempo de carga. Al ser una edición sobre pesos ya cuantizados en FP8, el autor advierte de que las cuantizaciones de menos bits derivadas de este bundle acumulan error de cuantización sobre la ablación y pueden degradar el cumplimiento; para versiones de baja precisión recomienda rehacer el pipeline completo en la precisión objetivo.

## Capacidades

- Generación de texto y razonamiento con tres niveles de esfuerzo configurables (low, high, max), pensados para equilibar latencia y profundidad de cómputo.
- Comprensión de imágenes y vídeo, con pipeline `image-text-to-text`; acepta entradas multimodales junto con texto en la misma conversación.
- Tool calling y function calling, lo que permite integrarlo en pipelines con herramientas externas y APIs.
- Flujos agénticos y razonamiento multi-paso, apoyados en la ventana de 1M tokens para mantener estado de tareas largas.
- Multilingüe en siete idiomas declarados: inglés, chino, español, francés, ruso, italiano y tailandés.
- Decodificación especulativa DSpark heredada del modelo base, orientada a reducir la latencia en generación autoregresiva.
- Cumplimiento ampliado de peticiones: al haberse eliminado el comportamiento de rechazo, responde a solicitudes sobre categorías temáticas que el modelo original declinaba.

## Casos de uso

- Análisis de documentación técnica extensa: con 1M tokens de contexto se puede cargar un repositorio completo, un pliego de condiciones o un expediente y hacer preguntas cruzadas sin trocear el material ni perder referencias entre secciones.
- Atención al cliente multi-turno sobre catálogos y contratos: el modelo mantiene el hilo de conversaciones largas, consulta herramientas internas mediante tool calling y conserva el contexto de interacciones previas dentro de la misma ventana.
- Revisión de vídeo e imágenes en procesos de control de calidad: inspección de fotogramas o imágenes industriales con informe textual asociado, aprovechando la entrada multimodal y el razonamiento por niveles.
- Agentes de automatización de back-office: ejecución de tareas multi-paso que combinan lectura de documentos, llamadas a APIs y generación de respuestas, con el nivel de razonamiento `high` o `max` para los pasos críticos.
- Generación y revisión de código en pipelines de CI/CD: el tool calling permite conectar el modelo a linters, ejecutores de tests y sistemas de tickets; el contexto largo ayuda a razonar sobre diffs y dependencias entre módulos.
- Investigación sobre safety y alineación: al ser una variante ablacionada con el resto de capacidades intactas, sirve como contrapunto experimental frente al modelo base en estudios de rechazo, sesgo y cumplimiento.
- Asistencia editorial y redacción sin filtros temáticos: útil para ámbitos como ficción, criminología o divulgación médica donde el modelo base tiende a declinar por precaución excesiva.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son internos del autor, ejecutados con decodificación greedy (T=0) y sin trucos de sampler. La evaluación del bundle modificado se hizo extremo a extremo con el motor `inference/` de DeepSeek sobre 4×H200 (TP4); la del modelo base se hizo contra la API oficial de chat completions de DeepSeek sirviendo los mismos pesos 1017, con prompt y decodificación idénticos.

| Benchmark | Este repo (UNCENSORED FP8) | Base 1017 (API oficial) |
|---|---|---|
| MMLU, 57 materias × 20 preguntas (1140 en total), modo logit de 4 opciones, chat sin razonamiento, greedy T=0 | no disponible (el dato aparece truncado en la model card) | 87,63 % (999/1140) |

No se han publicado resultados de HumanEval, GSM8K, MMMU ni de otros benchmarks en la información disponible. Tampoco hay mediciones de throughput o latencia por token para este repositorio.

## Requisitos de hardware

- Huella en disco: 510,3 GB (48 shards de safetensors). En VRAM hay que sumar la caché KV, que con 1M tokens de contexto puede ser muy superior al peso de los pesos; no se dispone del detalle de atención ni del coste exacto de KV por token.
- Configuración de referencia del autor: 4×H200 (141 GB cada una, 564 GB en total) con tensor parallelism 4. El margen es ajustado, por lo que 4×B200 (192 GB) o 8×H100/H200 resultan opciones más holgadas.
- No cabe en GPU de consumo. Un hilo de Reddit afirma haber ejecutado una variante de 552B del modelo en una única RTX 4090 a unos 27 tokens/s mediante Xolotl/Strata con offloading; es un dato de terceros no verificado y no corresponde a este checkpoint FP8.
- Opciones de despliegue: el motor de inferencia de referencia incluido en el repo de DeepSeek (`inference/`), vLLM (existe un repositorio de terceros que lo ejecuta sobre cuatro DGX Spark GB10 con TP4) y TensorFold en la configuración TP4 citada en ese mismo repositorio.
- Despliegue en llama.cpp u Ollama: no hay GGUF publicado y el autor desaconseja cuantizar este bundle a menos bits de forma ingenua, por lo que no es una vía recomendada.
- Latencia y throughput: no disponibles para este repositorio. La decodificación especulativa DSpark del modelo base debería reducir la latencia, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8 (este repo) | 763,2 B (safetensors) | 1M | Texto, imagen, vídeo | MIT con gate 18+ | HuggingFace, FP8 nativo |
| DeepSeek-V4.1-Flash-1017 (base) | mismo modelo base; cifra no indicada en la información | 1M | Texto, imagen, vídeo | no disponible en la información | HuggingFace y API oficial de DeepSeek |
| DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-UNCENSORED (mismo autor) | mismo modelo base en 2,9 bpw | 1M | Texto, imagen, vídeo | MIT con gate (según el patrón del autor) | HuggingFace; pensado para menos VRAM |
| DeepSeek-V4.1-Flash-1017-ABLITERATED-FP8 (mismo autor) | idéntico a este repo | 1M | Texto, imagen, vídeo | MIT con gate | HuggingFace; alias canónico del mismo checkpoint |

## Limitaciones y advertencias

- Modelo sin censura: puede producir contenido violento, sexual, ilegal o peligroso bajo petición. El gate exige confirmar mayoría de edad y uso conforme a la ley aplicable, y la responsabilidad sobre las salidas recae en el usuario.
- Riesgo de alucinación inherente a un modelo de 763B sin verificación factual integrada; el contexto de 1M tokens no elimina este problema y puede aumentar la confianza aparente en respuestas largas.
- Los benchmarks publicados son internos del autor, con una sola métrica (MMLU en modo chat sin razonamiento) y sin replicación independiente; no hay datos de código, matemáticas ni multimodalidad.
- Discrepancia en el número de parámetros: los safetensors declaran 763,2B, mientras que fuentes de terceros citan 552B para variantes del mismo modelo. Conviene verificar la cifra antes de dimensionar infraestructura.
- El autor advierte de que cuantizar este FP8 a menos bits degrada la calidad y puede reintroducir rechazos; no es una base adecuada para generar GGUF de 4 bits de forma directa.
- La licencia del repositorio es MIT, pero no se detallan en la información disponible los términos del modelo base ni posibles restricciones adicionales heredadas; conviene revisarlos antes de un uso comercial.
- Idiomas declarados limitados a siete; no hay evaluación publicada de rendimiento por idioma, y el español figura en la lista sin métricas específicas.
- Requiere infraestructura multi-GPU de gama alta; no es desplegable en hardware de consumo en su formato FP8.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8
- Alias ABLITERATED del mismo checkpoint: https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-ABLITERATED-FP8
- Variante EXL3 2,9 bpw sin censura: https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-UNCENSORED
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Repositorio de despliegue en vLLM sobre DGX Spark: https://github.com/tonyd2wild/DeepSeek-V4.1-Flash-vLLM-DGX-Spark
- Hilo de Reddit sobre ejecución en una RTX 4090: https://www.reddit.com/r/LocalLLaMA/comments/1x8m0jj/xolotl_strata_based_deepseekv41flash_552b_on_a/
- Análisis de terceros sobre generación de contenido NSFW: https://unifuncs.com/s/YsvHCCJO
- Perfil del autor: https://twitter.com/dealignai
