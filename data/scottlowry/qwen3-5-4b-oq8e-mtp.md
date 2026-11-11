# scottlowry/Qwen3.5-4B-oQ8e-mtp

## Resumen

Qwen3.5-4B-oQ8e-mtp es una cuantizacion mixta del modelo Qwen/Qwen3.5-4B, publicada por el usuario scottlowry en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos pensada para ejecucion en Apple Silicon mediante la libreria MLX. La cuantizacion se ha realizado con oQ (oMLX v0.7.4.dev1), una herramienta de cuantizacion de precision mixta que combina capas en 8 bits afines y capas en BF16 para preservar la calidad del checkpoint original.

El checkpoint resultante contiene 4.659.865.088 parametros logicos distribuidos en tres componentes: el modelo de lenguaje (4.206B), un modulo de vision (0.334B) y una cabeza MTP (multi-token prediction) de 0.121B. El promedio efectivo es de 9.059 bits por peso, con un 92.541% de los pesos almacenados en 8 bits afines con grupo de 64 y un 7.459% mantenido en BF16. El almacenamiento total del checkpoint es de 4.915 GiB.

La relevancia de esta publicacion es practica: permite ejecutar un modelo multimodal de la familia Qwen3.5 en equipos con memoria unificada limitada, manteniendo la cabeza de prediccion multi-token que habilita decodificacion especulativa. El modelo base Qwen3.5-4B no esta documentado en la informacion proporcionada, por lo que varios de sus atributos (contexto, licencia, idiomas) se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje + modulo de vision + cabeza MTP); detalles internos no disponibles |
| Parametros totales | 4.659.865.088 (4.660B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits afines con grupo de 64 (92.541% de pesos) + BF16 (7.459%); promedio efectivo 9.059 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria mlx) |

Desglose por componente segun la model card:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 4.206B | 4.470 GB / 4.163 GiB |
| Vision | 0.334B | 0.667 GB / 0.621 GiB |
| Cabeza MTP | 0.121B | 0.140 GB / 0.131 GiB |
| Total | 4.660B | 5.277 GB / 4.915 GiB |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base Qwen3.5-4B. Lo que si se deduce de la model card es la composicion del checkpoint: un modelo de lenguaje de 4.206B parametros, un codificador o modulo de vision de 0.334B y una cabeza MTP de 0.121B. La presencia de un modulo de vision confirma que el modelo base es multimodal (procesamiento de imagen y texto). La cabeza MTP (multi-token prediction) es un componente que predice varios tokens futuros de forma simultanea y suele emplearse para decodificacion especulativa, acelerando la generacion.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras etapas de alineamiento en el modelo base. La cuantizacion se realizo con oQ (oMLX v0.7.4.dev1) en modo de precision mixta: la mayor parte de los tensores se almacena en 8 bits afines con tamano de grupo 64, mientras que una fraccion (7.459%) se mantiene en BF16, presumiblemente en capas sensibles a la cuantizacion. La model card indica una actualizacion el 2026-11-11 con re-cuantizacion respecto a versiones anteriores.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.5-4B, aunque no se detallan en la informacion disponible.
- Procesamiento de vision: el checkpoint incluye un modulo de vision de 0.334B, por lo que cabe esperar capacidad de entender imagenes junto a texto.
- Prediccion multi-token (MTP): la cabeza dedicada permite decodificacion especulativa, con la ganancia de velocidad que ello implica.
- Ejecucion en Apple Silicon mediante MLX: el formato y la libreria estan orientados a memoria unificada de chips Apple (M-series).
- Tool calling, agentes, capacidades multilingues y modo thinking: no disponibles en la informacion proporcionada.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el checkpoint ocupa 4.915 GiB, por lo que puede cargarse en equipos Apple Silicon de 16 GB o mas, permitiendo ejecutar un modelo de 4.6B con vision sin depender de la nube.
- Prototipado de asistentes multimodales: gracias al modulo de vision integrado, se puede construir un asistente que reciba capturas de pantalla o fotografias y responda en texto, todo en local.
- Aceleracion de generacion con MTP: la cabeza de prediccion multi-token permite implementar decodificacion especulativa en pipelines MLX, reduciendo la latencia por token en tareas de generacion larga.
- Evaluacion comparativa de cuantizaciones: util para investigadores que quieran medir la perdida de calidad de una cuantizacion mixta de 9.059 bits/peso frente al BF16 original en tareas concretas.
- Desarrollo de aplicaciones de escritorio para macOS: al integrarse con MLX, el modelo puede embeberse en apps nativas que requieran privacidad de datos, sin enviar contenido a servidores externos.
- Docencia y experimentacion: su tamano moderado y su bajo requisito de memoria lo hacen adecuado para entornos academicos donde se ensenan tecnicas de cuantizacion y despliegue local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 4.915 GiB solo para los pesos; con overhead de ejecucion (KV cache, buffers de MLX) se recomienda un minimo de 8 GB y, de forma realista, 16 GB para contexto amplio.
- GPU recomendadas: chips Apple Silicon (M1, M2, M3 y M4, en variantes Pro, Max y Ultra) por ser el target de MLX. No hay soporte documentado para CUDA en esta publicacion.
- Cabe en GPU de consumo: si, en equipos Apple con memoria unificada de 16 GB o superior. En GPUs NVIDIA de consumo no es directamente utilizable sin conversion previa a otro formato.
- Opciones de despliegue: MLX y oMLX (herramienta con la que se genero el checkpoint). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI en el formato actual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| scottlowry/Qwen3.5-4B-oQ8e-mtp | 4.660B | no disponible | safetensors MLX, 9.059 bits/peso | no disponible | Cuantizacion mixta con vision y MTP |
| Qwen/Qwen3.5-4B | no disponible | no disponible | no disponible | no disponible | Modelo base sin cuantizar |
| Otras cuantizaciones de Qwen3.5-4B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de alternativas equivalentes |

No se dispone de informacion suficiente sobre modelos comparables de la misma categoria para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- La cuantizacion mixta a 9.059 bits/peso puede introducir degradaciones de calidad respecto al modelo base BF16, especialmente en tareas de razonamiento o codigo; no se han publicado mediciones al respecto.
- El checkpoint esta disenado para MLX y Apple Silicon; no es portable directamente a ecosistemas CUDA sin conversion.
- La licencia del modelo no esta indicada, lo que impide confirmar si se permite uso comercial. Es imprescindible verificar la licencia del modelo base Qwen/Qwen3.5-4B antes de cualquier despliegue en produccion.
- No se documentan idiomas soportados, por lo que no se puede garantizar un rendimiento multilingue concreto.
- No hay informacion sobre sesgos, alucinacion ni politicas de seguridad del modelo base.
- El modelo tiene solo 46 descargas y 0 likes en el momento de la consulta; es una publicacion de terceros sin validacion comunitaria amplia.
- El repositorio ocupa 21.1 GB, muy por encima del tamano del checkpoint (4.915 GiB), lo que sugiere la presencia de multiples ficheros o versiones; conviene revisar el contenido antes de descargar.
- Al ser una cuantizacion no oficial, no cuenta con el respaldo del equipo de Qwen.

## Enlaces

- Hugging Face: https://huggingface.co/scottlowry/Qwen3.5-4B-oQ8e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
