# matrixportalx/Qwen3-VL-4B-Instruct-heretic-Q4_0-GGUF

## Resumen

`matrixportalx/Qwen3-VL-4B-Instruct-heretic-Q4_0-GGUF` es una cuantizacion en formato GGUF (tipo Q4_0) del modelo multimodal `coder3101/Qwen3-VL-4B-Instruct-heretic`, que a su vez deriva de la familia Qwen3-VL de Alibaba en su variante Instruct de 4.000 millones de parametros. El modelo resultante conserva la capacidad de procesar imagen y texto (pipeline `image-text-to-text`) y anade el tratamiento "heretic" o "abliterated", una modificacion de los pesos orientada a reducir los rechazos del modelo ante determinadas peticiones.

La relevancia practica de esta ficha esta en el formato: al estar empaquetado en GGUF Q4_0, el modelo puede ejecutarse en CPU o en GPU de gama media mediante llama.cpp, Ollama o cualquier runtime compatible, sin necesidad de infraestructura de servidor. El repositorio ocupa 2,4 GB y las descargas registradas son 137, lo que lo situa como una publicacion de nicho, no como un artefacto de referencia mantenido por el equipo original de Qwen.

Conviene subrayar que el autor de este repositorio no es el desarrollador del modelo original: se trata de una conversion automatica realizada con el espacio `gguf-my-repo` de ggml.ai a partir del checkpoint de `coder3101`. La informacion publicada no incluye detalles sobre el proceso de abliteration, la composicion del dataset ni evaluaciones de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje) de la familia Qwen3-VL; detalles de capas y atencion no disponibles |
| Parametros totales | 4.022.468.096 (4,02 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_0 (unico fichero publicado en este repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`qwen3-vl-4b-instruct-heretic-q4_0.gguf`); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 2,4 GB |
| Pipeline | `image-text-to-text` |
| Libreria declarada | transformers |
| Modelo base | `coder3101/Qwen3-VL-4B-Instruct-heretic` |
| Descargas / likes | 137 / 0 |
| Fecha de creacion | 2026-10-27 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-VL en su variante de 4 B parametros, un transformer multimodal que combina un codificador visual con un decodificador de lenguaje para tareas de imagen-texto. El checkpoint intermedio (`coder3101/Qwen3-VL-4B-Instruct-heretic`) aplica una tecnica de tipo abliteration o "heretic", que modifica direcciones de activacion para atenuar el comportamiento de rechazo aprendido durante el ajuste por instrucciones. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO en el modelo original.

La contribucion de este repositorio concreto es unicamente la conversion a GGUF Q4_0 mediante llama.cpp y el espacio `gguf-my-repo`, un proceso de cuantizacion post-entrenamiento sin reentrenamiento adicional. No se documentan innovaciones tecnicas propias del autor de la conversion, ni parametros de calibracion de la cuantizacion mas alla del tipo Q4_0 indicado en el nombre del fichero.

## Capacidades

- Generacion de texto e instrucciones de proposito general, heredadas de Qwen3-VL-4B-Instruct.
- Comprension de imagenes y respuesta en texto (image-text-to-text): descripcion de imagenes, respuesta a preguntas visuales y extraccion de informacion de capturas o documentos.
- Conversacion multi-turno con rol de asistente (variante Instruct).
- Comportamiento "uncensored" o "decensored" declarado por el autor: menor tasa de rechazos ante peticiones que el modelo original declinaria.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible para esta variante cuantizada.
- Razonamiento multi-paso y modo "thinking": no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles; el modelo original Qwen3 cubre varios idiomas, pero esta ficha no aporta el listado.
- Capacidades de audio o video: no disponibles.

## Casos de uso

- Procesamiento local de imagenes en equipos sin GPU dedicada: al estar en GGUF Q4_0 y ocupar 2,4 GB, puede ejecutarse en CPU con llama.cpp para tareas de descripcion de imagenes o extraccion de texto de capturas en un portatil.
- Prototipado de asistentes visuales en estaciones de trabajo con GPU de consumo: un modelo de 4 B en Q4_0 encaja en GPUs con 6-8 GB de VRAM, lo que permite iterar sobre prompts y flujos multimodales sin alquilar instancias en la nube.
- Clasificacion y etiquetado de imagenes en lotes: el pipeline image-text-to-text permite generar descripciones o etiquetas para catalogos de imagenes, con la ventaja de que la cuantizacion reduce el coste por inferencia frente al checkpoint en precision completa.
- Investigacion sobre alineacion y censura: la variante "heretic" es util para estudiar como la abliteration afecta a la tasa de rechazos y a la calidad de las respuestas, comparando con el modelo Qwen3-VL-4B-Instruct original.
- Despliegue en entornos con restricciones de conectividad: al ser un fichero unico descargable y ejecutable con llama-server, encaja en escenarios de borde o air-gapped donde no se puede depender de APIs externas.
- Educacion y demos: el tamano reducido y la licencia Apache 2.0 facilitan su uso en talleres y demostraciones de modelos multimodales sin coste de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni metricas de tareas visuales, y tampoco se aportan comparaciones con el modelo base sin cuantizar.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,5-3,5 GB para el fichero Q4_0, mas el overhead de contexto y del codificador visual; el consumo real depende de la longitud de contexto configurada.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4070, RTX 4090, A100, H100). En GPUs de 4 GB puede requerir descarga parcial de capas a CPU.
- GPU de consumo: si cabe en RTX 3060 12 GB, RTX 4060 Ti 8 GB y superiores; en GPUs de 4 GB el margen es ajustado.
- CPU: viable con llama.cpp en modo CPU puro gracias al tamano de 2,4 GB, aunque la latencia sera mayor.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (importando el GGUF), y servidores compatibles con la API de llama.cpp. vLLM y TGI no se mencionan para este formato en la informacion disponible.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| matrixportalx/Qwen3-VL-4B-Instruct-heretic-Q4_0-GGUF | 4,02 B | no disponible | GGUF Q4_0 | Apache 2.0 | Variante abliterated cuantizada, 137 descargas |
| coder3101/Qwen3-VL-4B-Instruct-heretic | 4,02 B | no disponible | safetensors | Apache 2.0 | Checkpoint base del que deriva esta cuantizacion |
| Qwen3-VL-4B-Instruct (original de Alibaba) | 4,02 B | no disponible en esta ficha | safetensors | Apache 2.0 | Modelo de referencia sin modificacion heretic |
| Otros modelos multimodales de ~4 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificados en la informacion proporcionada |

La comparacion cuantitativa con alternativas de la misma categoria no es posible con los datos disponibles: no hay benchmarks publicados ni especificaciones de contexto del modelo original en la informacion facilitada.

## Limitaciones y advertencias

- La abliteration o "heretic" elimina parte de los mecanismos de rechazo, lo que incrementa el riesgo de generar contenido danino, sesgado o inapropiado; no es adecuado para aplicaciones de cara al publico sin filtros adicionales.
- La cuantizacion Q4_0 introduce perdida de precision respecto al checkpoint original; la degradacion afecta especialmente a tareas de razonamiento y a la fidelidad en la comprension de imagenes.
- Riesgo de alucinacion inherente a los modelos de 4 B, agravado por la cuantizacion y por la ausencia de datos de evaluacion.
- No se documentan los idiomas soportados ni el comportamiento multilingue de esta variante.
- No se especifica la longitud de contexto efectiva; el ejemplo de la model card usa `-c 2048`, lo que sugiere un uso conservador pero no confirma el maximo del modelo.
- La licencia Apache 2.0 permite uso comercial, pero el autor de la conversion no ofrece garantias sobre el comportamiento del modelo modificado; la responsabilidad legal del contenido generado recae en el desplegador.
- Repositorio de nicho con 0 likes y 137 descargas: no hay mantenimiento documentado ni issues resueltos que permitan evaluar su estabilidad a largo plazo.
- El pipeline declarado es image-text-to-text, pero no se confirma que la cuantizacion GGUF conserve integramente el codificador visual en todos los runtimes; conviene verificar el soporte multimodal de la version de llama.cpp utilizada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/matrixportalx/Qwen3-VL-4B-Instruct-heretic-Q4_0-GGUF
- Modelo base: https://huggingface.co/coder3101/Qwen3-VL-4B-Instruct-heretic
- Espacio de conversion GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
