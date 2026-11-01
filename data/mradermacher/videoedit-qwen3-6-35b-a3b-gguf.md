# mradermacher/VideoEdit-Qwen3.6-35B-A3B-GGUF

## Resumen

VideoEdit-Qwen3.6-35B-A3B es un modelo multimodal especializado en edicion de video, desarrollado por leizhao7 a partir de la familia Qwen3.6. El modelo combina una arquitectura de tipo Mixture of Experts con 34,7 mil millones de parametros totales y aproximadamente 3 mil millones activos (según la nomenclatura "A3B"), lo que permite inferencia rapida pese a su gran tamaño total. El repositorio aqui descrito es la cuantizacion GGUF publicada por mradermacher, un cuantizador conocido de la comunidad que ofrece versiones estáticas en multiples niveles de precision.

La relevancia de este modelo radica en su enfoque vertical: en lugar de ser un asistente generalista, ha sido entrenado con aprendizaje por refuerzo (concretamente GRPO, segun los tags del repositorio) para tareas de edicion de video, funcionando como agente capaz de planificar y ejecutar operaciones sobre contenido audiovisual. Incluye ademas un componente multimodal (mmproj) que le permite procesar entradas visuales.

La version GGUF facilita su ejecucion local en hardware de consumo, con cuants desde 13 GB (Q2_K) hasta 37 GB (Q8_0), mas suplementos multimodales de 0,7 y 1,0 GB. Esta publicado bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basado en Qwen3.6, multimodal |
| Parametros totales | 34.660.610.688 (34,66 B) |
| Parametros activos | Aproximadamente 3 B (indicado por la denominacion "A3B"; cifra exacta no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 (estaticas; imatrix no disponibles) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (original en safetensors/transformers) |

## Arquitectura y entrenamiento

El modelo base, leizhao7/VideoEdit-Qwen3.6-35B-A3B, es un transformer de tipo Mixture of Experts derivado de Qwen3.6, con 34,66 mil millones de parametros totales de los cuales solo una fraccion (en torno a 3 mil millones segun la nomenclatura) se activa por token. Esto reduce sustancialmente el coste de inferencia frente a un modelo denso de tamaño equivalente. La etiqueta "multimodal" y la presencia de archivos mmproj en el repo GGUF indican la existencia de un proyector multimodal que conecta un codificador visual con el modelo de lenguaje, necesario para interpretar contenido de video.

Segun los tags del repositorio, el entrenamiento incorpora aprendizaje por refuerzo mediante GRPO (Group Relative Policy Optimization), tecnica popularizada por el entrenamiento de modelos de razonamiento y agentes. La etiqueta "agent" sugiere que el modelo se ha optimizado para operar como agente que planifica y ejecuta secuencias de acciones de edicion. Los tags incluyen una referencia a arXiv (2610.35497), presumiblemente el paper asociado. Detalles como el numero de tokens de entrenamiento, la composicion del dataset o el uso de RLHF/DPO adicional no estan disponibles en la informacion proporcionada.

## Capacidades

- Edicion de video: capacidad especializada del modelo, actuando como agente que interpreta instrucciones en lenguaje natural y las traduce en operaciones de edicion.
- Comprension multimodal: procesa entradas visuales (video/imagenes) mediante el componente mmproj incluido en el repo de cuantizacion.
- Generacion de texto conversacional: etiquetado como "conversational", soporta dialogo multi-turno.
- Razonamiento con aprendizaje por refuerzo: el entrenamiento con GRPO sugiere capacidades de razonamiento paso a paso para planificar ediciones complejas.
- Comportamiento agéntico: diseñado para flujos de trabajo de multiples pasos en tareas de edicion.
- Soporte de tool calling / function calling: no disponible explicitamente en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos del repositorio.

## Casos de uso

- Edicion de video asistida por lenguaje natural: un usuario describe los cambios deseados ("recorta los primeros 10 segundos, anade transiciones") y el modelo genera el plan de edicion o los comandos correspondientes para un editor o pipeline automatizado.
- Automatizacion de postproduccion en pipelines: integracion en flujos de trabajo automatizados donde el modelo actua como agente que decide que operaciones aplicar sobre clips entrantes, reduciendo trabajo manual repetitivo.
- Generacion de metadatos y resumenes de video: aprovechando el componente multimodal, puede analizar contenido audiovisual y producir descripciones, capitulos o resumenes para plataformas de video.
- Asistente de edicion interactivo en aplicaciones de escritorio: con cuants Q4_K_M (21,3 GB) cabe en GPUs de gama alta de consumo, permitiendo integrarlo como copiloto local en herramientas de edicion sin depender de la nube.
- Prototipado de agentes multimodales: los investigadores pueden usarlo como base para estudiar agentes de RL aplicados a dominios audiovisuales, dada su licencia permisiva y disponibilidad en multiples cuants.
- Clasificacion y moderacion de contenido de video: analisis automatico de grandes volumenes de material para detectar segmentos relevantes o inapropiados antes de revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del cuantizador no incluye metricas y los datos del modelo base se remiten al paper (arXiv:2610.35497), cuyo contenido no esta incluido en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del LLM): 13 GB en Q2_K, 20-21,3 GB en Q4_K_S/Q4_K_M, 24,8 GB en Q5_K_M, 28,6 GB en Q6_K y 37 GB en Q8_0. Anadir 0,7-1 GB por el archivo mmproj.
- GPU recomendadas: RTX 4090 (24 GB) para cuants Q2_K a Q4_K_M; RTX 5090 (32 GB) o A100 40 GB para Q5/Q6; A100 80 GB u H100 para Q8_0 con contexto amplio.
- Consumer GPUs: si cabe en una RTX 4090 con Q4_K_M (21,3 GB) o inferior; tambien viable en Mac con memoria unificada de 32 GB o mas (M2/M3/M4 Pro/Max) via llama.cpp.
- Despliegue: llama.cpp y Ollama son las opciones naturales para GGUF; el modelo original en transformers puede desplegarse con vLLM o TGI (soporte concreto no verificado en la informacion proporcionada).
- Latencia y throughput: al ser un MoE con ~3 B de parametros activos, la velocidad de generacion deberia aproximarse a la de un modelo denso de 3 B en hardware equivalente, pero no hay mediciones publicadas en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| VideoEdit-Qwen3.6-35B-A3B | 34,66 B totales / ~3 B activos | no disponible | Edicion de video, agente multimodal | Apache 2.0 |
| Qwen3-30B-A3B | 30,5 B totales / 3,3 B activos | 32k-128k | Generalista, razonamiento | Apache 2.0 |
| Qwen2.5-VL-32B-Instruct | 32 B densos | 128k | Vision-general (imagenes/video) | Apache 2.0 |

Frente a Qwen3-30B-A3B comparte la filosofia MoE con ~3 B activos, pero esta especializado en edicion de video. Frente a Qwen2.5-VL-32B, que es denso y generalista en vision, VideoEdit-Qwen3.6 ofrece inferencia mas eficiente por token y un enfoque vertical en tareas de edicion, a costa de menor versatilidad general.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; al derivar de la familia Qwen, podria heredar los sesgos de sus datos de preentrenamiento.
- Riesgo de alucinacion: no cuantificado; al ser un modelo agéntico especializado, las alucinaciones podrian traducirse en operaciones de edicion incorrectas, por lo que se recomienda supervision humana en flujos criticos.
- Limitaciones de idioma: los metadatos indican solo ingles; el rendimiento en castellano no esta documentado.
- Limitaciones de contexto: la longitud de contexto no esta especificada en la informacion disponible.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar los terminos del modelo base y cualquier restriccion del paper asociado.
- Caveats de produccion: se trata de cuants estáticos (sin imatrix), por lo que las cuants bajas (Q2_K, Q3_K) pueden degradar apreciablemente la calidad. El soporte de modelos muy recientes en llama.cpp puede requerir versiones actualizadas de la libreria. El componente mmproj es necesario para las capacidades multimodales; sin el, el modelo funciona solo como LLM textual.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/VideoEdit-Qwen3.6-35B-A3B-GGUF
- Modelo base: https://huggingface.co/leizhao7/VideoEdit-Qwen3.6-35B-A3B
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#VideoEdit-Qwen3.6-35B-A3B-GGUF
- Paper asociado (referenciado en tags): https://arxiv.org/abs/2610.35497
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre calidad de cuants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
