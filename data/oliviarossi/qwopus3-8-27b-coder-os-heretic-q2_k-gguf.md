# OliviaRossi/Qwopus3.8-27B-Coder-OS-Heretic-Q2_K-GGUF

## Resumen

Qwopus3.8-27B-Coder-OS-Heretic-Q2_K-GGUF es una cuantizacion en formato GGUF de tipo Q2_K del modelo OliviaRossi/Qwopus3.8-27B-Coder-OS-Heretic, un merge de modelos orientado a programacion agentica y publicado bajo el paraguas de la familia Qwen 3.5/3.8. El modelo cuenta con 27.320.697.856 parametros totales (aproximadamente 27,3 mil millones) y ha sido convertido a GGUF mediante el espacio GGUF-my-repo de ggml.ai sobre llama.cpp, lo que permite su ejecucion en CPU y GPU con el ecosistema llama.cpp.

La relevancia de esta ficha radica en que se trata de una variante cuantizada a 2 bits, pensada para reducir drasticamente los requisitos de memoria frente a los pesos originales, a costa de una perdida de calidad que el autor no documenta. El modelo base combina etiquetas de merge, agentic-coding, uncensored y os-heretic, lo que sugiere un ajuste orientado a tareas de codigo con menor filtrado de contenido, aunque la model card no aporta detalles sobre el proceso de merge ni sobre los datos de entrenamiento.

La informacion publica disponible es muy limitada: la model card del repositorio GGUF es practicamente la plantilla generada automaticamente por GGUF-my-repo y remite al modelo original, del que no se incluyen especificaciones tecnicas, benchmarks ni detalles de arquitectura mas alla de las etiquetas. Esta ficha refleja exclusivamente los datos verificables del repositorio y marca como "no disponible" todo aquello que no aparece en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetas qwen3_5 y qwen3.8; se desconoce si es transformer denso o MoE) |
| Parametros totales | 27.320.697.856 (aproximadamente 27,3 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (los ejemplos de la model card usan `-c 2048`, pero es un valor de ejemplo, no una especificacion del modelo) |
| Tipos de cuantizacion | Q2_K (unica variante publicada en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (archivo `qwopus3.8-27b-coder-os-heretic-q2_k.gguf`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. Las etiquetas del repositorio (`qwen3_5`, `qwen3.8`) apuntan a una base de la familia Qwen, y la etiqueta `merge` indica que el modelo base OliviaRossi/Qwopus3.8-27B-Coder-OS-Heretic se obtuvo mediante la fusion de varios modelos, probablemente combinando un modelo de codigo con un modelo general. No se especifica si la arquitectura es un transformer denso, un MoE o un modelo hibrido, ni se documentan el numero de capas, las dimensiones ocultas o el mecanismo de atencion.

Tampoco hay datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal. La etiqueta `os-heretic` sugiere un proceso de "abliteration" o eliminacion de rechazos (uncensoring) sobre el modelo base, pero el autor no describe la metodologia. La unica informacion tecnica verificable es la conversion a GGUF mediante llama.cpp y el espacio GGUF-my-repo, que genera una cuantizacion Q2_K estandar sin ajustes documentados.

## Capacidades

- Generacion de texto conversacional: el repositorio esta etiquetado como `conversational` y el pipeline declarado es `image-text-to-text`.
- Procesamiento de imagen y texto: el pipeline `image-text-to-text` indica soporte de entrada multimodal (imagen mas texto), aunque no se detalla la resolucion, el codificador visual ni el formato de las imagenes aceptadas.
- Programacion agentica: la etiqueta `agentic-coding` sugiere un ajuste orientado a tareas de codigo con uso de herramientas y razonamiento multi-paso, sin que se documenten las capacidades concretas.
- Codigo: el nombre del modelo incluye "Coder", lo que indica especializacion en generacion y edicion de codigo, aunque no se especifican los lenguajes soportados.
- Contenido sin filtrado: la etiqueta `uncensored` y el sufijo "Heretic" indican que el autor ha reducido o eliminado las capas de rechazo del modelo base.
- Tool calling / function calling: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas del repositorio no esta cumplimentado).
- Modo thinking o razonamiento extendido: no disponible.

## Casos de uso

- Inferencia local en equipos con memoria limitada: la cuantizacion Q2_K reduce el peso del modelo a aproximadamente 10,9 GB de repositorio, lo que permite cargarlo en GPUs de consumo con 12-16 GB de VRAM o en sistemas con RAM suficiente, usando llama.cpp como motor.
- Asistencia de codigo en entornos aislados: al ejecutarse con llama.cpp sin dependencias de servicios en la nube, el modelo puede desplegarse en estaciones de trabajo sin conexion para autocompletado y generacion de fragmentos de codigo, siempre que se validen los resultados por la perdida de calidad de la cuantizacion a 2 bits.
- Prototipado de agentes de codigo: la etiqueta `agentic-coding` sugiere su uso en bucles de agente que editan archivos y ejecutan comandos, aunque la ausencia de datos sobre tool calling obliga a validar el soporte real de function calling antes de integrarlo.
- Experimentacion con modelos sin censura: para investigadores que estudian el comportamiento de modelos con capas de rechazo eliminadas, esta variante permite reproducir experimentos en hardware modesto gracias al formato GGUF.
- Procesamiento de imagenes y texto en local: el pipeline `image-text-to-text` permite probar flujos multimodales basicos (descripcion de imagenes, preguntas sobre capturas) con llama.cpp, aunque sin garantias documentadas de calidad.
- Evaluacion comparativa de cuantizaciones: util para medir la degradacion de un modelo de 27B al pasar a Q2_K frente a cuantizaciones mayores del mismo modelo base, en tareas de codigo y conversacion.
- Despliegue en servidor ligero: el binario `llama-server` permite exponer el modelo como API compatible con el formato de chat de llama.cpp para pruebas internas de integracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 10,9 GB, por lo que la cuantizacion Q2_K requiere del orden de 11-12 GB de memoria para los pesos, mas la memoria para el contexto KV (variable segun la longitud de contexto configurada).
- GPU recomendadas: no hay recomendaciones oficiales del autor. Por tamano, una RTX 4090 (24 GB) o una RTX 3090 (24 GB) permiten cargar el modelo con contexto amplio; una RTX 4080 (16 GB) o una RTX 4070 Ti Super (16 GB) permiten cargarlo con contexto moderado.
- GPU de consumo: si cabe en GPUs de 12 GB o mas (RTX 3060 de 12 GB, RTX 4070 de 12 GB) con contexto reducido; en GPUs de 8 GB no cabe en VRAM y requeriria descarga parcial a RAM.
- Despliegue: llama.cpp (CLI y servidor), tal como documenta la model card. No se mencionan vLLM, TGI ni Ollama en la informacion disponible; Ollama podria importar el GGUF, pero no esta documentado por el autor.
- Latencia y throughput: no disponibles. La model card solo muestra ejemplos con `-c 2048` como valor de contexto de ejemplo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones del modelo base que permitan una comparacion rigurosa con alternativas de la misma categoria. La siguiente tabla recoge unicamente los datos verificables de este repositorio frente a lo que se conoce de forma generica de otras familias, sin cifras de rendimiento:

| Modelo | Parametros | Contexto | Licencia | Formato | Datos de rendimiento |
|---|---|---|---|---|---|
| Qwopus3.8-27B-Coder-OS-Heretic-Q2_K-GGUF | 27,3 mil millones | no disponible | apache-2.0 | GGUF Q2_K | no disponible |
| Modelo base OliviaRossi/Qwopus3.8-27B-Coder-OS-Heretic | no disponible | no disponible | apache-2.0 | safetensors (presumible) | no disponible |
| Alternativas de la familia Qwen de tamano similar | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Cuantizacion agresiva: Q2_K es una de las cuantizaciones mas bajas de llama.cpp; la perdida de calidad frente a los pesos originales en FP16 o BF16 puede ser significativa, especialmente en tareas de codigo y razonamiento, y el autor no publica metricas de degradacion.
- Ausencia de documentacion tecnica: no hay datos sobre arquitectura, contexto nativo, idiomas, datos de entrenamiento ni proceso de merge, lo que impide evaluar el modelo con rigor antes de usarlo en produccion.
- Modelo sin censura: las etiquetas `uncensored` y `os-heretic` indican que se han reducido las capas de rechazo; esto aumenta el riesgo de generar contenido inapropiado, peligroso o legalmente problematico, y traslada al desplegador la responsabilidad del filtrado.
- Riesgo de alucinacion: no cuantificado por el autor; en modelos de codigo cuantizados a 2 bits la generacion de APIs o funciones inexistentes es un riesgo plausible que debe validarse con tests.
- Idiomas: no se declara el soporte multilingue; no se puede asumir un buen rendimiento en castellano sin evaluacion previa.
- Contexto: no se especifica la longitud de contexto nativa; los ejemplos de la model card usan 2048 tokens, un valor insuficiente para tareas de codigo con repositorios grandes.
- Licencia: apache-2.0 permite uso comercial, pero el modelo base es un merge de modelos de terceros cuyas licencias originales no se detallan en la informacion disponible; conviene verificar la procedencia de los modelos fusionados antes de un despliegue comercial.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado su comportamiento.
- Fecha de creacion: el repositorio figura creado el 2026-11-20, una fecha futura respecto a la informacion habitual de catalogos; conviene verificar la integridad del repositorio antes de confiar en el.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/OliviaRossi/Qwopus3.8-27B-Coder-OS-Heretic-Q2_K-GGUF
- Modelo base: https://huggingface.co/OliviaRossi/Qwopus3.8-27B-Coder-OS-Heretic
- Perfil del autor en Hugging Face: https://huggingface.co/OliviaRossi
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Otro modelo del autor (referencia): https://huggingface.co/OliviaRossi/QuadQwen
