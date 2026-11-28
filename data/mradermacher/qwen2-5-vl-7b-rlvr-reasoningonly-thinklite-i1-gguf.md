# mradermacher/Qwen2.5-VL-7B-RLVR-ReasoningOnly-ThinkLite-i1-GGUF

## Resumen

Qwen2.5-VL-7B-RLVR-ReasoningOnly-ThinkLite-i1-GGUF es una cuantizacion en formato GGUF del modelo vgandhi13/Qwen2.5-VL-7B-RLVR-ReasoningOnly-ThinkLite, un ajuste fino del Qwen2.5-VL-7B-Instruct de Alibaba orientado a razonamiento visual. El autor de la cuantizacion es mradermacher, conocido por publicar versiones cuantizadas de modelos open source con tecnicas de imatrix para preservar la calidad en rangos bajos de bits. El modelo conserva la arquitectura vision-language de Qwen2.5-VL, con aproximadamente 7.615 millones de parametros, y anade un entrenamiento de refuerzo con verificacion (RLVR) mediante GRPO y la libreria verl sobre el dataset ThinkLite-VL-70k.

El interes de esta ficha radica en que combina dos lineas de trabajo actuales: por un lado, el razonamiento explicito en modelos de vision-lenguaje, y por otro, la disponibilidad de pesos cuantizados para despliegue local en hardware de consumo. El resultado es un modelo capaz de generar cadenas de razonamiento antes de responder a preguntas sobre imagenes, empaquetado en 24 variantes de cuantizacion que van desde 2,0 GB (IQ1_S) hasta 4,6 GB (Q4_K_S) y superiores.

La licencia es la de Qwen (license: qwen), heredada del modelo base Qwen2.5-VL-7B-Instruct, por lo que las condiciones de uso comercial dependen de dicha licencia. El idioma declarado es unicamente ingles, aunque al derivar de Qwen2.5-VL es probable que conserve parte de las capacidades multilingues del original; no obstante, no hay confirmacion explicita en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (base Qwen2.5-VL) con ajuste RLVR/GRPO |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M y otras variantes de mayor tamano |
| Idiomas soportados | en (ingles declarado) |
| Licencia | qwen (license: other, license_name: qwen) |
| Formato de pesos | GGUF (cuantizacion i1 con imatrix) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-VL-7B-Instruct, un transformer decoder-only con codificador visual integrado que procesa imagenes y texto de forma conjunta. Sobre esa base, el autor del modelo original aplico un ajuste fino con RLVR (Reinforcement Learning with Verifiable Rewards) usando GRPO (Group Relative Policy Optimization) y la libreria verl. Este esquema de entrenamiento refuerza la generacion de cadenas de razonamiento verificables antes de emitir la respuesta final, en la linea de modelos como DeepSeek-R1 pero aplicado a tareas de vision-lenguaje.

El dataset de entrenamiento es russwang/ThinkLite-VL-70k, un conjunto de 70.000 ejemplos orientado a razonamiento visual. La cuantizacion i1 de mradermacher emplea una matriz de importancia (imatrix) generada a partir de datos de calibracion, lo que permite que las variantes de baja precision (IQ2, IQ3) conserven mas calidad que las cuantizaciones estaticas equivalentes. No se dispone de informacion sobre el numero total de tokens de entrenamiento ni sobre la composicion detallada del dataset mas alla de su nombre y tamano.

## Capacidades

- Generacion de texto y razonamiento explicito: el modelo produce cadenas de pensamiento antes de la respuesta final, orientadas a tareas que requieren verificacion.
- Comprension de imagenes: al derivar de Qwen2.5-VL, procesa imagenes junto con texto para responder preguntas visuales.
- Razonamiento visual multi-paso: el entrenamiento RLVR esta disenado para tareas donde la respuesta puede verificarse automaticamente, como conteo, comparacion o lectura de graficos.
- Conversacion multi-turno: el tag "conversational" indica soporte de dialogos.
- Capacidades multilingues: el modelo declara solo ingles; no hay confirmacion de otros idiomas.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Analisis de documentos escaneados: el modelo puede leer imagenes de facturas, formularios o capturas y razonar sobre los datos extraidos antes de responder, lo que reduce errores en tareas de extraccion estructurada.
- Respuesta a preguntas sobre graficos y tablas: gracias al razonamiento RLVR, es adecuado para interpretar ejes, leyendas y tendencias en imagenes de visualizaciones de datos y justificar la respuesta paso a paso.
- Asistencia educativa con material visual: puede explicar diagramas, mapas o figuras cientificas a estudiantes, mostrando el razonamiento intermedio para facilitar la comprension.
- Verificacion de capturas de pantalla en QA de software: integrado en pipelines de pruebas, el modelo puede inspeccionar capturas de interfaz y razonar si el estado visual coincide con el esperado.
- Moderacion de contenido visual con justificacion: el modelo puede describir y razonar por que una imagen cumple o incumple una politica, aportando la cadena de razonamiento como traza auditable.
- Despliegue local en estaciones de trabajo: las cuantizaciones IQ4_XS (4,3 GB) y Q4_K_S (4,6 GB) permiten ejecutar el modelo en GPU de consumo con 8 GB de VRAM, util para prototipado sin conexion.
- Procesamiento por lotes de imagenes en servidores modestos: las variantes IQ3 permiten ejecutar inferencia visual en GPUs de 6-8 GB con throughput aceptable para tareas no interactivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,0-2,1 GB con i1-IQ1_S/IQ1_M (calidad muy degradada), 2,9-3,1 GB con IQ2_M/Q2_K, 3,6-3,9 GB con IQ3_S/IQ3_M/Q3_K_M, 4,3-4,6 GB con IQ4_XS/Q4_K_S, y mas de 5 GB con Q5 y Q6.
- Nota: los tamanos indicados corresponden a los pesos; hay que sumar el overhead de contexto KV cache y, si aplica, el proyector visual (mmproj), que se distribuye en el repositorio estatico.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones medias y altas; A100/H100 para la version sin cuantizar o para servir a multiples usuarios.
- Cabe en GPU de consumo: si, desde IQ2 en GPUs de 4-6 GB y con IQ4_K_S en GPUs de 8 GB o superiores.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp) para GGUF; los archivos mmproj del repositorio estatico son necesarios para el procesamiento de imagenes.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen2.5-VL-7B-RLVR-ReasoningOnly-ThinkLite-i1-GGUF (este) | 7,6 B | no disponible | GGUF i1 | qwen | Razonamiento visual RLVR, solo ingles declarado |
| Qwen2.5-VL-7B-Instruct | 7,6 B | no disponible en esta ficha | safetensors, GGUF | qwen | Modelo base sin RLVR; vision-lenguaje generalista |
| Qwen2.5-VL-7B-RLVR-ReasoningOnly-ThinkLite (original) | 7,6 B | no disponible | safetensors | qwen | Version sin cuantizar del mismo ajuste |

No se dispone de datos de benchmarks para comparar el rendimiento relativo con estas alternativas.

## Limitaciones y advertencias

- El modelo declara unicamente ingles; el rendimiento en castellano no esta verificado y podria degradarse respecto al Qwen2.5-VL original.
- El ajuste RLVR sobre un dataset especifico (ThinkLite-VL-70k) puede estrechar la distribucion de tareas y reducir la generalidad frente al modelo base.
- Las cuantizaciones IQ1 e IQ2 tienen calidad muy baja segun la propia model card ("for the desperate", "very low quality"); no son recomendables para produccion.
- Riesgo de alucinacion inherente a los modelos de razonamiento: las cadenas de pensamiento pueden contener pasos plausibles pero incorrectos.
- La licencia qwen impone condiciones adicionales al uso comercial; es necesario revisar el LICENSE enlazado en la model card antes de desplegar en productos.
- El repositorio ocupa 89 GB por incluir todas las variantes; conviene descargar solo el archivo necesario.
- Para usar la capacidad de vision es imprescindible descargar los archivos mmproj del repositorio estatico; el repositorio i1 no los incluye.
- No hay informacion sobre sesgos especificos ni sobre evaluaciones de seguridad del ajuste.

## Enlaces

- Repositorio Hugging Face (cuantizacion i1): https://huggingface.co/mradermacher/Qwen2.5-VL-7B-RLVR-ReasoningOnly-ThinkLite-i1-GGUF
- Repositorio de cuantizaciones estaticas (incluye mmproj): https://huggingface.co/mradermacher/Qwen2.5-VL-7B-RLVR-ReasoningOnly-ThinkLite-GGUF
- Modelo original sin cuantizar: https://huggingface.co/vgandhi13/Qwen2.5-VL-7B-RLVR-ReasoningOnly-ThinkLite
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Licencia Qwen: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct/blob/main/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/russwang/ThinkLite-VL-70k
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen2.5-VL-7B-RLVR-ReasoningOnly-ThinkLite-i1-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
