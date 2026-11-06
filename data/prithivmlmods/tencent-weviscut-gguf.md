# prithivMLmods/tencent-WeVisCut-GGUF

## Resumen

WeVisCut es un agente de edicion de video de 9B parametros desarrollado por Tencent, construido sobre la base Qwen3.5-9B. A diferencia de los modelos generativos de video, no produce clips directamente: convierte articulos de conocimiento y guiones de narracion en videos editados de varios minutos mediante el uso de 12 herramientas que cubren planificacion, narracion, recuperacion de recursos, composicion, inspeccion y reparacion, con un runtime separado que ejecuta los flujos de edicion.

El modelo se ha entrenado sobre trayectorias de edicion ejecutables y soporta aprendizaje por refuerzo, lo que lo situa en la categoria de agentes de horizonte largo (long-horizon) con uso de herramientas. Incluye una interfaz Studio con linea de tiempo editable, revisiones manuales y por chat, re-renderizado por plano, pausa/reanudacion y rollback de versiones.

Esta ficha cubre la cuantizacion GGUF publicada por prithivMLmods (tencent-WeVisCut-GGUF), que permite ejecutar el modelo con llama.cpp y herramientas compatibles. La calidad del resultado final depende de los servicios externos configurados (recuperacion, TTS, renderizado y plantillas). Cabe destacar que, mientras el runtime es Apache-2.0, los pesos del modelo base llevan una licencia `other` con terminos de uso separados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en Qwen3.5-9B, agente multimodal (image-text-to-text) con uso de herramientas |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q3_K_L, Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K, Q8_0 (GGUF); mmproj en BF16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 (cuantizacion GGUF y runtime); pesos del modelo base: licencia `other` con terminos separados |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

WeVisCut parte de Qwen3.5-9B, un modelo transformer multimodal, al que se anade capacidad de agente para edicion de video mediante 12 herramientas especializadas. La arquitectura de sistema separa el razonamiento del modelo (planificacion y decision) de la ejecucion, que corre en un runtime dedicado de edicion. El pipeline incluye etapas de planificacion, narracion, recuperacion de assets, composicion, inspeccion y reparacion de los flujos de edicion generados.

El entrenamiento se realizo sobre trayectorias de edicion ejecutables, es decir, ejemplos completos de flujos de herramientas que producen videos reales. Ademas del entrenamiento supervisado inicial, el modelo soporta aprendizaje por refuerzo para mejorar sus decisiones de agente. La model card indica que no hay decodificacion especulativa MTP habilitada. La parte visual multimodal se sirve mediante un archivo de proyeccion (mmproj) en BF16 para su uso con llama.cpp.

## Capacidades

- Planificacion de edicion de video: convierte articulos de conocimiento y guiones de narracion en planes de edicion multi-minuto.
- Uso de herramientas (tool use): orquesta 12 herramientas para planificacion, narracion, recuperacion de assets, composicion, inspeccion y reparacion.
- Agente de horizonte largo (long-horizon): mantiene flujos de trabajo multi-paso completos de edicion.
- Capacidades multimodales: pipeline image-text-to-text con proyector multimodal (mmproj) incluido.
- Comprension y generacion de texto conversacional heredadas de la base Qwen3.5.
- Soporte de aprendizaje por refuerzo para afinar el comportamiento del agente.
- Interfaz Studio asociada: linea de tiempo editable, revisiones por chat, re-renderizado por plano, pausa/reanudacion y rollback de versiones.
- Ejecucion local mediante llama.cpp gracias a la cuantizacion GGUF.

## Casos de uso

- Produccion de video educativo: transformar articulos tecnicos o divulgativos en videos explicativos de varios minutos con narracion, adecuado por su entrenamiento sobre articulos de conocimiento.
- Automatizacion de contenido para redes sociales: generar guiones narrados y montajes a partir de textos de marketing, con revision posterior por chat en la interfaz Studio.
- Prototipado rapido de montajes: usar la planificacion y composicion automaticas para obtener un primer corte editable, que un editor humano refina en la linea de tiempo.
- Investigacion en agentes de horizonte largo: estudiar y afinar el comportamiento de agentes que encadenan muchas llamadas a herramientas con aprendizaje por refuerzo.
- Integracion en pipelines de contenido: conectar el runtime de edicion a servicios de TTS, recuperacion de assets y renderizado para producir videos de forma semiautomatizada.
- Reparacion y verificacion de ediciones: aprovechar las herramientas de inspeccion y repair para detectar y corregir errores en flujos de edicion generados.
- Ejecucion local y privada: gracias a los GGUF, ejecutar el agente en hardware propio sin depender de APIs externas para el razonamiento del agente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica expresamente que no hay datos cuantitativos y que la calidad del output depende de los servicios configurados de recuperacion, TTS, renderizado y plantillas.

## Requisitos de hardware

- Inferencia BF16 (pesos originales): aproximadamente 24 GB de VRAM; requiere Python 3.11 o superior.
- GGUF Q4_K_M (~5,63 GB) o Q4_K_S (~5,35 GB): cabe en GPUs de consumo con 8 GB de VRAM (por ejemplo RTX 3060 Ti, RTX 4060 Ti) o incluso en CPU con RAM suficiente.
- GGUF Q6_K (~7,36 GB): recomendable una GPU con 10-12 GB de VRAM (RTX 3080, RTX 4070).
- GGUF Q8_0 (~9,53 GB): GPU con 12-16 GB de VRAM (RTX 4070 Ti Super, RTX 4080).
- GGUF BF16 (~17,9 GB + mmproj de 922 MB): GPU con 24 GB de VRAM (RTX 3090, RTX 4090, A5000) o reparto en CPU/GPU.
- Despliegue: llama.cpp es el runtime de referencia para los GGUF; el modelo base es compatible con transformers y text-generation-inference. No se menciona soporte para vLLM, Ollama o TGI.
- Latencia y throughput: no disponible. Ten en cuenta que el flujo completo de edicion tambien depende del rendimiento de los servicios externos (TTS, renderizado, recuperacion).

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| WeVisCut (Tencent) | ~9B | Agente de edicion de video con 12 herramientas | Apache-2.0 (runtime); pesos `other` | GGUF y safetensors en Hugging Face |
| Qwen3.5-9B (base) | ~9B | Modelo multimodal generalista | no disponible | Hugging Face |
| Alternativas de edicion de video agenticas | no disponible | no disponible | no disponible | no disponible |

No se conocen alternativas directas publicadas de agentes de edicion de video de tamano comparable; la mayoria de modelos de video (Sora, CogVideo, HunyuanVideo) generan clips directamente en lugar de orquestar flujos de edicion con herramientas, lo que hace a WeVisCut una categoria propia.

## Limitaciones y advertencias

- Licencia mixta: el runtime y la cuantizacion GGUF son Apache-2.0, pero los pesos del modelo base (tencent/WeVisCut) llevan una licencia `other` con terminos de uso separados; revisa esos terminos antes de cualquier uso comercial.
- Sin benchmarks publicados: no hay datos cuantitativos de rendimiento; la evaluacion debe hacerse de forma empirica en tu caso de uso.
- Dependencia de servicios externos: la calidad del video final depende de la recuperacion de assets, el TTS, el renderizado y las plantillas configuradas; el modelo por si solo no produce video.
- Riesgo de alucinacion: como todo LLM agentic, puede planificar pasos incorrectos o narraciones inexactas; la propia model card recomienda revisar los videos generados por precision factual y calidad antes de publicarlos.
- Idioma: el modelo esta etiquetado solo para ingles (en); no hay soporte declarado para castellano ni otros idiomas.
- Contexto: la longitud de ventana no esta documentada, lo que dificulta planificar tareas de horizonte muy largo.
- Requisitos de software: la inferencia BF16 del modelo original exige Python 3.11 o superior.
- Sin decodificacion especulativa (MTP desactivado), lo que puede afectar a la latencia en flujos con muchas llamadas al modelo.

## Enlaces

- Modelo GGUF cuantizado: https://huggingface.co/prithivMLmods/tencent-WeVisCut-GGUF
- Modelo base: https://huggingface.co/tencent/WeVisCut
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper, blog oficial y demos: no disponibles en la informacion proporcionada.
