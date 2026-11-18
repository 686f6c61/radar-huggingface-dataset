# OliviaRossi/Qwen3.8-3.6-3.5-27B-GST-Agentic-Coder-MTPMerge-Q2_K-GGUF

## Resumen

Este repositorio contiene una cuantizacion GGUF en formato Q2_K del modelo `OliviaRossi/Qwen3.8-3.6-3.5-27B-GST-Agentic-Coder-MTPMerge`, un merge de modelos de la familia Qwen (etiquetado como qwen3.5, qwen3.6 y qwen3.8 en los tags) orientado a codificacion agentica y con pipeline multimodal `image-text-to-text`. El autor, OliviaRossi, ha generado la cuantizacion mediante el espacio GGUF-my-repo de ggml.ai sobre llama.cpp, lo que permite ejecutar el modelo en CPU, GPU o configuraciones hibridas sin necesidad de infraestructura de alto nivel.

El modelo base declara 27.320.697.856 parametros (aproximadamente 27,3 mil millones) y una licencia Apache 2.0. La cuantizacion Q2_K reduce el peso del repositorio a 10,9 GB, lo que lo hace viable en equipos con VRAM moderada, a costa de una perdida de precision notable frente a cuantizaciones superiores.

La relevancia de esta ficha es doble: por un lado, documenta un artefacto de cuantizacion agresiva para un modelo de ~27B con capacidades multimodales y de codigo; por otro lado, advierte de que la model card es practicamente inexistente en cuanto a datos de entrenamiento, benchmarks y composicion del dataset, por lo que cualquier evaluacion seria requiere pruebas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base es un merge de modelos de la familia Qwen; no se especifica la arquitectura concreta) |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `-c 2048`, pero es solo un ejemplo de invocacion, no una especificacion) |
| Tipos de cuantizacion | Q2_K (esta variante); el autor publica el modelo base sin cuantizar por separado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `qwen3.8-3.6-3.5-27b-gst-agentic-coder-mtpmerge-q2_k.gguf`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base. El nombre del repositorio indica que se trata de un merge (prefijo `GST-Merge` y sufijo `MTPMerge`) de modelos de las familias Qwen 3.5, 3.6 y 3.8, con un enfasis declarado en codificacion agentica (`Agentic-Coder`). El pipeline declarado es `image-text-to-text`, lo que sugiere que el modelo base incorpora un componente de vision, aunque no se detalla el mecanismo de fusion de modalidades.

Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o similar. La cuantizacion Q2_K se ha generado con llama.cpp a traves del espacio GGUF-my-repo de ggml.ai, un proceso automatico que no anade informacion sobre el entrenamiento. Cualquier afirmacion sobre innovaciones tecnicas (atencion lineal, decodificacion especulativa, etc.) seria especulativa y no se incluye.

## Capacidades

- Generacion de texto y codigo: el nombre del modelo (`Agentic-Coder`) sugiere especializacion en tareas de programacion, aunque no hay evaluacion publicada que lo respalde.
- Procesamiento multimodal imagen-texto: el pipeline `image-text-to-text` implica capacidad de recibir imagenes junto con texto, si bien no se detalla el soporte real en la cuantizacion GGUF (la conversion de componentes de vision a GGUF puede no estar completa).
- Razonamiento agentico: la etiqueta `agentic-coding` apunta a uso en flujos multi-paso y tool calling, sin documentacion de soporte formal.
- Tool calling / function calling: no disponible como capacidad verificada.
- Capacidades multilingues: no disponibles.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Pruebas de concepto de codificacion asistida en local: gracias a los 10,9 GB del archivo Q2_K, se puede desplegar en una estacion de trabajo con GPU de gama alta de consumo para experimentar con generacion de codigo sin depender de APIs externas.
- Evaluacion comparativa de merges: util para investigadores que quieran medir el efecto de un merge de modelos Qwen 3.5/3.6/3.8 frente a los modelos originales en tareas de programacion.
- Prototipado de agentes de codigo en entornos con recursos limitados: la cuantizacion Q2_K permite ejecutar el modelo con llama.cpp en CPU o GPU modestas para validar pipelines de agentes antes de migrar a cuantizaciones mayores.
- Analisis de imagenes con descripcion textual en local: si el componente de vision se conserva en el GGUF, podria usarse para tareas de image-to-text en entornos sin conectividad.
- Educacion e investigacion sobre cuantizacion: caso de estudio de como Q2_K afecta a un modelo de ~27B en tareas de codigo, comparando con Q4_K_M o Q8_0 del mismo base.
- Integracion en herramientas de desarrollo con llama-server: el binario `llama-server` permite exponer el modelo como endpoint compatible con OpenAI para editores de codigo o asistentes CLI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q2_K ocupa 10,9 GB, por lo que se necesita al menos ~11-12 GB de VRAM para cargar los pesos completos en GPU; con offloading parcial a CPU puede ejecutarse con menos.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para carga completa en GPU; A100/H100 no son necesarias pero ofrecerian mayor throughput.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB, justo) y posiblemente en RTX 4070 Ti Super (16 GB) con contexto reducido.
- Opciones de despliegue: llama.cpp (CLI y server), Ollama (previa conversion o importacion), y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput: no disponibles; dependen del hardware y del contexto. El ejemplo de la model card usa `-c 2048`, lo que sugiere que contextos mayores pueden requerir mas memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OliviaRossi/Qwen3.8-3.6-3.5-27B-GST-Agentic-Coder-MTPMerge-Q2_K-GGUF | ~27,3B | no disponible | Apache 2.0 | GGUF Q2_K | Merge multimodal orientado a codigo agentico; sin benchmarks |
| Qwen2.5-Coder-32B-Instruct (referencia de la familia Qwen) | ~32B | 128K (segun version) | Apache 2.0 | safetensors, GGUF | Modelo oficial de codigo; benchmarks publicados |
| Qwen2.5-VL-32B (referencia multimodal) | ~32B | 128K (segun version) | Apache 2.0 | safetensors | Modelo oficial multimodal con evaluacion publicada |

La comparacion es orientativa: no se dispone de datos de rendimiento del modelo de esta ficha, por lo que no es posible establecer una equivalencia cuantitativa con las alternativas.

## Limitaciones y advertencias

- La cuantizacion Q2_K es muy agresiva y degrada la calidad de generacion, especialmente en tareas de codigo y razonamiento, frente a Q4_K_M o Q8_0.
- No hay benchmarks publicados: no se puede afirmar que el modelo supere o iguale a los modelos Qwen originales.
- La model card no documenta sesgos, datos de entrenamiento ni evaluaciones de seguridad.
- Riesgo de alucinacion elevado en cuantizaciones de 2 bits, con posible generacion de APIs o funciones inexistentes en tareas de codigo.
- El soporte multimodal en GGUF no esta garantizado: la conversion puede haber omitido el proyector de vision.
- La licencia Apache 2.0 permite uso comercial, pero el merge puede heredar restricciones de los modelos originales; conviene verificar las licencias de Qwen 3.5/3.6/3.8.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- No se especifica la longitud de contexto soportada; el ejemplo de `-c 2048` no debe interpretarse como limite real.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/OliviaRossi/Qwen3.8-3.6-3.5-27B-GST-Agentic-Coder-MTPMerge-Q2_K-GGUF
- Modelo base: https://huggingface.co/OliviaRossi/Qwen3.8-3.6-3.5-27B-GST-Agentic-Coder-MTPMerge
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
