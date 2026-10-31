# mradermacher/VideoEdit-Qwen3.5-9B-GGUF

## Resumen

VideoEdit-Qwen3.5-9B es un modelo multimodal especializado en edicion de video, desarrollado por leizhao7 a partir de la familia Qwen3.5 de Alibaba. Se trata de un modelo de aproximadamente 9 mil millones de parametros (8.953.803.264 segun los safetensors del repositorio) entrenado con aprendizaje por refuerzo mediante GRPO (Group Relative Policy Optimization), tal como indican sus etiquetas. Su proposito es actuar como agente de edicion de video: interpreta contenido multimodal y genera acciones o instrucciones de edicion sobre material audiovisual.

La ficha aqui presentada corresponde a la version GGUF cuantizada por mradermacher, un cuantizador bien conocido en la comunidad que publica conversiones estaticas para su uso con llama.cpp y herramientas compatibles. Esta version incluye ademas los archivos mmproj (suplemento multimodal) en Q8_0 y f16, necesarios para explotar las capacidades de vision del modelo en inferencia local.

El modelo es relevante porque aborda un nicho concreto —la edicion de video asistida por modelos de lenguaje— con una licencia Apache 2.0 que permite uso comercial, y porque su tamano contenido (9B) lo hace viable en hardware de consumo. La referencia academica asociada es el arxiv:2610.35497.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal basado en Qwen3.5 (transformer con proyector de vision, detalle no disponible) |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (original en safetensors) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, una arquitectura transformer densa de la familia Qwen de Alibaba, a la que se anade un componente multimodal (evidenciado por los archivos mmproj incluidos en la cuantizacion, que contienen el proyector y el codificador de vision necesarios para procesar entradas visuales en llama.cpp). El tamano exacto del codificador de vision y el mecanismo de fusion con el LLM no estan detallados en la informacion disponible.

Segun las etiquetas del repositorio, el entrenamiento se realizo mediante aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization), una tecnica popularizada por proyectos como DeepSeek-R1 que optimiza el modelo comparando grupos de respuestas generadas sin necesidad de un modelo de valor critico. Esto sugiere un entrenamiento orientado a tareas de agente: generar secuencias de acciones de edicion de video verificables. El paper asociado (arxiv:2610.35497) contendria los detalles del dataset, el numero de tokens y el diseno de recompensas, pero estos datos no estan incluidos en la model card disponible.

## Capacidades

- Comprension multimodal de contenido de video: el modelo procesa entradas visuales (mediante el suplemento mmproj) y las relaciona con instrucciones en lenguaje natural.
- Edicion de video como agente: esta especializado en generar acciones o planes de edicion sobre material audiovisual, no en renderizar video directamente.
- Entrenamiento con RL (GRPO): afinado con aprendizaje por refuerzo, lo que suele mejorar el seguimiento de instrucciones y el razonamiento de multiples pasos en su dominio.
- Generacion de texto conversacional: etiquetado como conversational, heredando las capacidades de chat de la base Qwen3.5.
- Soporte de tool calling / function calling: no disponible (no consta en la informacion proporcionada).
- Capacidades multilingues: limitadas segun la model card, que declara unicamente ingles.

## Casos de uso

- Edicion de video por instrucciones en lenguaje natural: un usuario describe el cambio deseado ("recorta los primeros diez segundos y anade transicion") y el modelo genera la secuencia de acciones de edicion correspondiente, que un backend ejecuta sobre el archivo.
- Automatizacion de pipelines de postproduccion: integracion en flujos de trabajo automatizados que procesan grandes volumenes de clips (por ejemplo, resumir o reencuadrar grabaciones) delegando las decisiones de edicion al modelo.
- Agentes de edicion interactivos: gracias a su entrenamiento con GRPO orientado a tareas de agente, puede encadenar multiples pasos de edicion en conversaciones de varios turnos.
- Prototipado local de herramientas de IA para video: su formato GGUF permite a desarrolladores probar la logica de edicion en portatiles y estaciones sin GPU de servidor, acelerando la iteracion de productos.
- Generacion de metadatos y descripcion de material audiovisual: aprovechando su comprension multimodal, puede analizar clips y producir resumenes, etiquetas o marcas de tiempo utiles para archivos y buscadores internos.
- Investigacion en agentes multimodales: como modelo abierto con licencia Apache 2.0 y paper asociado, sirve como base reproducible para experimentos de RL aplicado a dominios audiovisuales.
- Asistentes de edicion embebidos en editores (tipo plugin): su tamano de 9B cuantizado en Q4_K_M (5,7 GB) cabe en GPUs de consumo, permitiendo integracion en aplicaciones de escritorio con latencia aceptable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del cuantizador no incluye metricas y los resultados del modelo original deberan consultarse en el paper referenciado (arxiv:2610.35497).

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del LLM, sin contar el mmproj):
  - Q2_K: ~3,9 GB
  - Q4_K_M: ~5,7 GB
  - Q6_K: ~7,5 GB
  - Q8_0: ~9,6 GB
  - f16: ~18 GB
  - El suplemento multimodal mmproj anade ~0,7 GB (Q8_0) o ~1,0 GB (f16).
- GPU recomendadas: cualquier GPU de consumo con 8 GB de VRAM o mas ejecuta con holgura las cuantizaciones Q4/Q5; para Q8_0 o f16 se recomiendan 12-24 GB (RTX 3090, RTX 4090, RTX 5090). No se requieren A100 ni H100 para inferencia.
- Cabe en consumer GPU: si. Con Q4_K_M (5,7 GB + ~1 GB de mmproj) cabe comodamente en una RTX 3060 de 12 GB, RTX 4060 Ti 16 GB o superiores; incluso en GPUs de 8 GB con Q3/Q4_S. Tambien es viable en CPU pura con RAM suficiente, a menor velocidad.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF y mmproj. Para el modelo original en safetensors: vLLM, TGI o transformers.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Multimodal | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| VideoEdit-Qwen3.5-9B | ~9B | Si (mmproj) | Edicion de video como agente, RL (GRPO) | Apache 2.0 | safetensors, GGUF |
| Qwen3.5-9B (base) | ~9B | No disponible | Modelo generalista | no disponible | safetensors |
| Qwen2.5-VL-7B | ~7B | Si (vision) | Comprension general de imagen/video | Apache 2.0 | safetensors, GGUF |

Comparado con la base Qwen3.5-9B, esta version anade la especializacion en edicion de video mediante RL. Frente a alternativas multimodales generalistas como Qwen2.5-VL-7B, VideoEdit-Qwen3.5-9B esta optimizado para un dominio concreto (acciones de edicion), a costa de un alcance mas estrecho. Datos de rendimiento comparativo: no disponible.

## Limitaciones y advertencias

- Idioma: la model card declara solo ingles; el rendimiento en castellano no esta documentado y puede ser degradado.
- Dominio estrecho: el entrenamiento con GRPO esta orientado a edicion de video; en tareas generales puede rendir peor que el modelo base Qwen3.5 sin especializar.
- Alucinacion: riesgo habitual en LLM; en tareas de agente sobre video puede generar acciones de edicion incorrectas o incoherentes con el contenido real del clip, por lo que conviene validar las acciones antes de ejecutarlas.
- Cuantizacion: las versiones Q2_K y Q3_K_S/M presentan perdida de calidad notable (el propio autor marca Q3_K_M como "lower quality"); para produccion se recomiendan Q4_K_M o superiores.
- Cuants imatrix/weighted: no disponibles en el momento de redaccion de la ficha, segun el autor.
- Contexto: la longitud de ventana no esta documentada en la informacion disponible; verificala en el modelo base antes de planificar cargas de trabajo con video largo.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar los terminos de la base Qwen3.5 y cualquier restriccion del paper original.
- Soporte multimodal en llama.cpp: requiere cargar el archivo mmproj correspondiente junto al GGUF principal; sin el, las capacidades visuales no funcionan.

## Enlaces

- Modelo cuantizado (GGUF): https://huggingface.co/mradermacher/VideoEdit-Qwen3.5-9B-GGUF
- Modelo original: https://huggingface.co/leizhao7/VideoEdit-Qwen3.5-9B
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#VideoEdit-Qwen3.5-9B-GGUF
- Paper asociado: arxiv:2610.35497 (https://arxiv.org/abs/2610.35497)
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas sobre cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
