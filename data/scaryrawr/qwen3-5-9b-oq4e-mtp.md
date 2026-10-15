# scaryrawr/Qwen3.5-9B-oQ4e-mtp

## Resumen

Qwen3.5-9B-oQ4e-mtp es un checkpoint cuantizado en precision mixta del modelo Qwen3.5-9B, publicado por el usuario scaryrawr en HuggingFace. La cuantizacion se ha realizado con la herramienta oQ (oMLX v0.7.1.dev1), que asigna distintos niveles de bits por tensor en lugar de aplicar una unica precision global. El resultado es un checkpoint de 9.653.104.368 parametros logicos con un promedio efectivo de 5,164 bits por peso y un peso total en disco de 5,803 GiB (6,231 GB).

El checkpoint esta pensado para ejecutarse con MLX, la libreria de Apple para inferencia en chips Apple Silicon, y se distribuye en formato safetensors. Su interes practico radica en la combinacion de tres componentes: el modelo de lenguaje (8.954B de parametros), un modulo de vision (0.456B) y una cabeza MTP (multi-token prediction, 0.243B), lo que apunta a un modelo multimodal con decodificacion especulativa integrada. Esa cabeza MTP permite proponer varios tokens por paso y verificar despues, reduciendo la latencia en hardware con ancho de banda de memoria limitado.

Al tratarse de un artefacto de cuantizacion, no incorpora datos propios de entrenamiento ni benchmarks publicados en la informacion disponible. El repositorio no registra descargas ni likes en el momento de la consulta y no declara licencia, idiomas soportados ni longitud de contexto, por lo que su evaluacion en produccion requiere verificar esos extremos con el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoint de pesos de Qwen3.5-9B; componentes de lenguaje, vision y cabeza MTP) |
| Parametros totales | 9.653.104.368 (9,653 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Afin 4 bits grupo 64 (88,044% de los pesos), afin 5 bits grupo 64 (5,830%), afin 6 bits grupo 64 (1,043%), BF16 (5,083%); promedio efectivo 5,164 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors para MLX |

Datos adicionales de almacenamiento:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 8,954B | 5,134 GB / 4,781 GiB |
| Vision | 0,456B | 0,912 GB / 0,849 GiB |
| Cabeza MTP | 0,243B | 0,185 GB / 0,172 GiB |
| Total | 9,653B | 6,231 GB / 5,803 GiB |

Otros metadatos del repositorio: tamano del repo 6,2 GB; creado y actualizado el 15 de octubre de 2026; 0 descargas y 0 likes; etiquetas mlx, safetensors, qwen3_5, oq, quantized, mtp, 4-bit, region:us.

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base ni su proceso de entrenamiento. Lo unico verificable es el desglose de componentes del checkpoint: 8,954B de parametros corresponden al modelo de lenguaje, 0,456B a un modulo de vision y 0,243B a una cabeza MTP. La presencia del modulo de vision implica capacidad multimodal de entrada de imagen, y la cabeza MTP es el componente tipico que habilita decodificacion especulativa con multiples tokens candidatos por paso. No se detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF o DPO: esos datos pertenecen al modelo base y no se incluyen en la model card.

La innovacion tecnica documentada es el propio esquema de cuantizacion. oQ (oMLX v0.7.1.dev1) aplica precision mixta por tensor: la mayor parte de los pesos (88,044%) queda en afin 4 bits con grupo de 64, mientras que un 5,830% sube a 5 bits, un 1,043% a 6 bits y un 5,083% se mantiene en BF16 sin cuantizar. Ese 5,083% en BF16 (0,491B de pesos) ocupa 0,914 GiB, mas que todo el bloque de 5 bits, lo que sugiere que se reserva para capas o tensores sensibles a la cuantizacion (posiblemente embeddings, normalizaciones o componentes de vision). El resultado es un ahorro sustancial frente a un checkpoint BF16 completo a costa de una perdida de precision no cuantificada en la informacion disponible.

## Capacidades

- Generacion de texto multimodal: el desglose de pesos incluye un modulo de vision de 0,456B de parametros, por lo que el checkpoint incorpora la torre visual del modelo base. No se documenta en la model card que tipos de entrada visual acepta.
- Decodificacion especulativa integrada: la cabeza MTP de 0,243B permite predecir varios tokens por paso de decodificacion y verificar despues, con la reduccion de latencia que eso implica en inferencia autoregresiva.
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base Qwen3.5-9B, no verificadas ni documentadas en este repositorio.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el repositorio no declara idiomas.
- Modo thinking o modos de razonamiento extendido: no disponible.
- Entrada de audio: no disponible; no hay componente de audio en el desglose de pesos.

## Casos de uso

- Inferencia local en Mac con memoria unificada limitada: el checkpoint ocupa 5,803 GiB en disco y cabe holgadamente en equipos Apple Silicon de 16 GB, lo que permite ejecutar un modelo de ~9,6B de parametros con una huella de memoria muy inferior a la de un checkpoint BF16 equivalente (que rondaria los 19 GB solo en pesos).
- Prototipado de asistentes multimodales en escritorio: al incluir torre de vision, permite experimentar con flujos de imagen mas texto sin depender de servicios en la nube, siempre que se valide previamente la calidad de la torre visual cuantizada.
- Reduccion de latencia en generacion larga: la cabeza MTP esta disenada para decodificacion especulativa, de modo que resulta adecuada en escenarios de generacion de texto extenso donde el cuello de botella es el ancho de banda de memoria, como resumen de documentos o redaccion asistida.
- Evaluacion comparativa de tecnicas de cuantizacion: al publicar la distribucion exacta de bits por bloque, el checkpoint sirve como referencia para medir el impacto de la precision mixta frente a cuantizaciones uniformes de 4 bits en tareas de razonamiento y codigo.
- Desarrollo de aplicaciones MLX con API compatible con OpenAI: mediante el servidor de mlx-lm se puede exponer el modelo como endpoint local para integrarlo en herramientas de desarrollo que ya consumen APIs de chat.
- Experimentacion academica en eficiencia de inferencia: la combinacion de MTP y pesos de 5,164 bits de media ofrece un banco de pruebas para estudiar el equilibrio entre velocidad, memoria y calidad en hardware de consumo.
- Fine-tuning ligero o adaptacion posterior sobre el checkpoint cuantizado: no recomendado en este formato, ya que la cuantizacion de 4 bits con grupo 64 degrada la calidad de actualizaciones de bajo rango; en su caso, se deberia partir del modelo base en BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del checkpoint unicamente documenta la distribucion de bits y el almacenamiento por componente; no incluye MMLU, HumanEval, GSM8K, MMMU ni ninguna otra metrica de calidad o velocidad.

## Requisitos de hardware

- VRAM o memoria unificada estimada: los pesos ocupan 5,803 GiB (6,231 GB). Sumando cache KV, estados intermedios y overhead del runtime, una estimacion razonable es un minimo de 8-10 GB de memoria unificada para texto; con entrada de imagen y contexto largo, 16 GB o mas es lo recomendable. Estas cifras son estimaciones de calculo, no datos publicados.
- GPU compatibles: el formato es MLX, por lo que requiere Apple Silicon (series M1, M2, M3, M4 o posteriores). No es ejecutable en GPU NVIDIA o AMD con las herramientas habituales.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con 16 GB o mas de memoria unificada. No se ha verificado el comportamiento en configuraciones de 8 GB.
- Opciones de despliegue: mlx-lm (incluido su servidor compatible con la API de OpenAI), mlx-swift para aplicaciones nativas de Apple y la propia herramienta oQ/oMLX para gestion del checkpoint. No hay soporte GGUF, por lo que llama.cpp y Ollama no son aplicables; tampoco hay soporte documentado para vLLM ni TGI.
- Latencia y throughput: no disponible. La cabeza MTP deberia mejorar el throughput de decodificacion respecto a una generacion token a token, pero no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. La comparacion natural seria contra el modelo base Qwen3.5-9B en BF16 y contra otras cuantizaciones del mismo modelo, pero sus especificaciones no se incluyen en la documentacion facilitada.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scaryrawr/Qwen3.5-9B-oQ4e-mtp | 9,653B (5,164 bits/peso) | no disponible | safetensors (MLX) | no disponible | repositorio publico, 0 descargas |
| Qwen3.5-9B (base, BF16) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Otras cuantizaciones del mismo base | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Perdida de calidad por cuantizacion: el 88,044% de los pesos esta en 4 bits con grupo de 64 y el promedio efectivo es de 5,164 bits por peso. No se ha publicado ninguna evaluacion que cuantifique la degradacion respecto al modelo base en BF16, por lo que el impacto real en tareas de razonamiento o codigo es desconocido.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; no se ha documentado ningun mecanismo adicional de mitigacion en este checkpoint.
- Licencia no declarada: el repositorio no indica licencia. Sin ese dato no se puede confirmar la legalidad del uso comercial, de la redistribucion ni de la creacion de obras derivadas. Es un bloqueo potencial para cualquier despliegue en produccion.
- Dependencia de plataforma: el formato MLX restringe la ejecucion a hardware Apple Silicon. No hay conversion a GGUF publicada, lo que excluye su uso en GPU NVIDIA, AMD o en servidores x86 convencionales.
- Idiomas y contexto no especificados: no se declaran idiomas soportados ni longitud de contexto, datos criticos para dimensionar cache KV, coste de memoria y calidad en idiomas distintos del ingles.
- Componente de vision sin validar: la torre visual esta cuantizada y no se documenta su comportamiento ni el formato de entrada admitido.
- Ausencia de validacion comunitaria: el repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo dia. No hay evidencia externa de que el checkpoint cargue correctamente o de que los pesos cuantizados sean fieles al modelo original.
- Fecha de publicacion anomala: los metadatos indican octubre de 2026, posterior a la fecha habitual de consulta, lo que conviene verificar antes de integrar el artefacto en cualquier flujo automatizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/scaryrawr/Qwen3.5-9B-oQ4e-mtp
- Herramienta de cuantizacion oQ / oMLX: https://github.com/jundot/omlx
- Busqueda web: los resultados devueltos no contienen informacion relevante sobre el modelo (unicamente paginas de inicio de sesion de Gmail). No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion disponible.
