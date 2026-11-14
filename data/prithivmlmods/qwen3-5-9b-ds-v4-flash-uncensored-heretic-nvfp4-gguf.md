# prithivMLmods/Qwen3.5-9B-DS-v4-Flash-uncensored-heretic-NVFP4-GGUF

## Resumen

Qwen3.5-9B-DS-v4-Flash-uncensored-heretic-NVFP4-GGUF es una cuantizacion en formato GGUF con precision NVFP4 (FP4 de 4 bits nativo de NVIDIA) del modelo Qwen3.5-9B-DS-v4-Flash-uncensored-heretic, publicado por el usuario prithivMLmods. Se trata de una variante "abliterated" o "decensored" del modelo base Qwen3.5 de 9B parametros, es decir, con los mecanismos de rechazo internos neutralizados, y ademas cuantizada para ejecucion eficiente sobre hardware NVIDIA Blackwell con soporte nativo de tensor cores FP4.

El modelo conserva la arquitectura multimodal del original (pipeline image-text-to-text, con un proyector mmproj separado de 922 MB), un total de 9.197.094.384 parametros y una ventana de contexto verificada de 16.384 tokens en las pruebas del autor. Incorpora Multi-Token Prediction (MTP) integrado en los pesos, lo que permite decodificacion especulativa sin modelo borrador externo, acelerando la inferencia local de forma notable.

Su relevancia practica radica en dos factores: por un lado, demuestra el estado actual de las herramientas de cuantizacion (GPTQ aplicado a NVFP4) para reducir un modelo de 9B a 8,46 GB manteniendo precision cercana al original; por otro, su naturaleza "uncensored" lo hace interesante para investigacion sobre alineamiento y para casos donde los filtros estandar resultan excesivamente restrictivos, aunque con las advertencias de seguridad que ello implica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con MTP integrado; derivada de Qwen3.5 |
| Parametros totales | 9.197.094.384 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 16.384 tokens (verificado en pruebas del autor); maximo nativo no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, formato NVIDIA) via GPTQ; KV cache q8_0 en pruebas |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con fichero mmproj.gguf para vision) |
| Tamano del repositorio | 9,4 GB |
| Tamano del fichero principal | 8,46 GB (NVFP4) + 922 MB (mmproj) |
| Hardware objetivo | NVIDIA Blackwell (RTX Pro 6000, RTX 50-series, B200, B300) |
| Decodificacion especulativa | Si, MTP nativo (draft_n_max=2 en pruebas) |

## Arquitectura y entrenamiento

El modelo base es una variante de Qwen3.5 de 9B parametros, un transformer denso (no se documenta que sea MoE) con capacidad multimodal de entrada texto-imagen y salida de texto. Sobre el modelo original se ha aplicado una tecnica de "abliteration" o decensurado que elimina o atenua las direcciones de activacion responsables de los rechazos, dando lugar a la variante "uncensored-heretic". Posteriormente se ha cuantizado a NVFP4 mediante GPTQ, usando calibracion para estabilizar la compresion a 4 bits y preservar la precision respecto a los pesos originales.

La innovacion tecnica mas destacable de esta publicacion es la integracion de Multi-Token Prediction (MTP) en el propio fichero GGUF: la arquitectura incorpora cabezas de prediccion adicionales que permiten decodificacion especulativa sin necesidad de un modelo borrador separado. Esto reduce el coste de memoria y simplifica el despliegue en comparacion con esquemas especulativos clasicos. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto conversacional en ingles con contexto de hasta 16.384 tokens verificados.
- Razonamiento matematico y resolucion de problemas verbales (el autor documenta pruebas con problemas de cinematica, tanques, edades y combinatoria).
- Generacion de codigo, incluyendo estructuras de datos (insercion en listas enlazadas).
- Capacidades multimodales de entrada: procesa imagenes junto con texto mediante el proyector mmproj.
- Decodificacion especulativa MTP integrada, que acelera la generacion en hardware compatible.
- Comportamiento "uncensored": menor tasa de rechazos ante peticiones que los modelos alineados rechazarian.
- Compatibilidad con text-generation-inference y llama.cpp (llama-cli, llama-server), asi como endpoints compatibles.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Inferencia local acelerada en estaciones Blackwell: desplegar el modelo con llama-cli o llama-server sobre una RTX Pro 6000 o RTX 50-series para obtener velocidades de generacion de ~221 tokens/s con solo 7,61 GiB de VRAM pico, gracias a NVFP4 y MTP.
- Investigacion sobre alineamiento y seguridad: estudiar el efecto de la abliteration comparando respuestas del modelo heretic con las del Qwen3.5 original en conjuntos de prompts sensibles.
- Asistencia tecnica en ingles con contexto medio: gestionar conversaciones multi-turno de hasta 16K tokens para soporte de producto o documentacion, donde el contexto cubre manuales extensos.
- Generacion de codigo en local: usar el modelo en un flujo de trabajo con llama.cpp para autocompletar y explicar fragmentos de codigo, aprovechando el throughput alto en GPU consumer Blackwell.
- Analisis de imagenes con descripcion textual: cargar el mmproj y pasar capturas, diagramas o graficos para obtener descripciones o extraccion de informacion en ingles.
- Prototipado de pipelines multimodales: validar integraciones image-text-to-text en entornos de investigacion donde no se requiere licencia comercial restrictiva (Apache 2.0).
- Evaluacion de tecnicas de cuantizacion: usar este modelo como referencia para medir la degradacion de calidad de NVFP4 + GPTQ frente a los pesos originales en tareas de razonamiento y codigo.
- Despliegue en entornos con restricciones de memoria: el fichero de 8,46 GB cabe en GPUs de 12-16 GB, permitiendo servir el modelo en hardware de gama media-alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor unicamente documenta metricas de inferencia en su prueba sobre una NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB VRAM):

| Metrica | Valor |
|---|---|
| Velocidad media de procesamiento de prompt | 267,56 tokens/s |
| Velocidad media de generacion | 221,05 tokens/s |
| Tiempo total de ejecucion | 29,2 s |
| Longitud de contexto usada | 16.384 tokens |
| KV cache (K) | q8_0 |
| VRAM pico | 7,61 GiB |
| Utilizacion de GPU pico | 88% |
| Capas offloaded | 99 (-ngl 99) |
| Decodificacion especulativa | MTP (draft_n_max=2) |
| Semilla | 42 |
| Repeticiones | 5 |

Las pruebas consistieron en cinco problemas: insercion en lista enlazada, tiempo de cruce corredor-tren, llenado de tanque con dos tuberias, distribucion de estudiantes en aulas y edades padre-hijo. No se reportan tasas de acierto, solo velocidad.

## Requisitos de hardware

- VRAM estimada para inferencia: ~7,6 GiB pico con contexto de 16K y KV cache q8_0 en la configuracion probada; el fichero ocupa 8,46 GB en disco, por lo que se recomienda al menos 10-12 GB de VRAM para margen.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (probada), B200, B300, RTX 50-series (Blackwell, SM120) para aprovechar tensor cores FP4 nativos.
- GPUs no Blackwell: el formato NVFP4 no esta optimizado para ellas; puede requerir conversion o ejecucion en modo emulado, con perdida de rendimiento. No disponible confirmacion oficial de compatibilidad con Ampere o Ada.
- Cabe en GPU consumer: si, en tarjetas Blackwell de 12 GB o mas (RTX 5070 y superiores) segun el tamano del fichero; en generaciones anteriores el rendimiento sera menor.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), text-generation-inference (segun tags), endpoints compatibles; no se documenta soporte directo en vLLM u Ollama.
- Latencia y throughput: 221 tokens/s de generacion y 267,56 tokens/s de procesamiento de prompt en RTX PRO 6000 Blackwell con MTP activo; en GPUs inferiores se espera una caida proporcional no cuantificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-DS-v4-Flash-uncensored-heretic-NVFP4-GGUF (este) | 9,2B | 16.384 (verificado) | GGUF NVFP4 + mmproj | Apache 2.0 | Optimizado para Blackwell, MTP integrado, uncensored |
| Qwen3.5-9B-DS-v4-Flash-uncensored-heretic (base) | 9,2B | no disponible | safetensors | Apache 2.0 | Pesos completos, sin cuantizar, uncensored |
| Qwen3.5 9B (original, referencia) | ~9B | no disponible | safetensors / GGUF | Apache 2.0 (segun familia Qwen) | Modelo alineado, con rechazos, multimodal |
| Otros GGUF de 9B en llama.cpp (genericos) | ~9B | variable | GGUF Q4/Q5/Q8 | variable | Sin MTP ni NVFP4; comparacion de rendimiento no disponible |

No se dispone de datos de benchmarks que permitan comparar calidad frente a alternativas; la comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Modelo "uncensored": puede generar contenido inapropiado, ofensivo o peligroso; no es apto para produccion orientada al publico general sin filtros adicionales.
- Riesgo elevado de alucinacion: la model card advierte explicitamente que el comportamiento sin censura no garantiza precision factual y que las salidas deben evaluarse de forma independiente.
- Idiomas: solo ingles declarado; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- Contexto limitado a 16.384 tokens en la configuracion probada; no se documenta un maximo nativo superior.
- La cuantizacion NVFP4 puede introducir degradacion de calidad frente a los pesos originales, especialmente en tareas de razonamiento complejo; no se aportan metricas de dicha degradacion.
- Compatibilidad de hardware restringida: el formato NVFP4 esta pensado para NVIDIA Blackwell; en otras GPUs el rendimiento o incluso la ejecucion pueden verse comprometidos.
- Naturaleza experimental: el autor la califica como release experimental con posibles artefactos de razonamiento.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal y etica del contenido generado recae en el desplegador.
- Cero descargas y un solo "like" en el momento de la ficha: ecosistema de validacion practicamente inexistente, sin evidencia de uso en produccion.
- El modelo base es a su vez una modificacion no oficial de Qwen3.5; no hay garantia de que conserve todas las capacidades del original.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/prithivMLmods/Qwen3.5-9B-DS-v4-Flash-uncensored-heretic-NVFP4-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/Qwen3.5-9B-DS-v4-Flash-uncensored-heretic
- Fichero NVFP4: https://huggingface.co/prithivMLmods/Qwen3.5-9B-DS-v4-Flash-uncensored-heretic-NVFP4-GGUF/blob/main/Qwen3.5-9B-DS-v4-Flash-uncensored-heretic-NVFP4.gguf
- Fichero mmproj: https://huggingface.co/prithivMLmods/Qwen3.5-9B-DS-v4-Flash-uncensored-heretic-NVFP4-GGUF/blob/main/Qwen3.5-9B-DS-v4-Flash-uncensored-heretic.mmproj.gguf
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del autor: https://huggingface.co/prithivMLmods
