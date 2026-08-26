# Infonioknight/astrobridge-model-v1

## Resumen

AstroBridge Captioner es un adaptador LoRA multimodal desarrollado por Infonioknight (Gaurav S.) para generar descripciones en lenguaje natural de objetos astronómicos a partir de imágenes y espectros. El modelo se construye sobre el modelo base `Qwen/Qwen3.5-9B`, que permanece congelado, y añade un stack de fusión de modalidades (proyectores, Q-Former y adaptador) que permite combinar información visual y espectral con el modelo de lenguaje. El repositorio contiene únicamente el adaptador y el stack de fusión, no el modelo base, por lo que es necesario cargar Qwen3.5-9B por separado.

El proyecto se enmarca en el ecosistema AstroBridge, que incluye un sistema multiagente para investigación astronómica amateur y una librería Python de identificación de fuentes astronómicas. Este captioner específico está pensado para integrarse en pipelines de análisis astronómico donde se requiera convertir datos observacionales en descripciones textuales útiles para astrónomos aficionados o investigadores. Su relevancia radica en la combinación de dos modalidades (imagen y espectro) en un campo donde la mayoría de modelos multimodales se limitan a imagen y texto.

El tamaño del repositorio es de 0,3 GB, lo que indica que el adaptador es ligero y puede aplicarse sobre el modelo base sin necesidad de reentrenar los pesos completos. No se dispone de información sobre la licencia, los idiomas soportados ni los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adapter + fusion stack (projectors, Q-Former, adapter) sobre Qwen/Qwen3.5-9B congelado |
| Parametros totales | no disponible (el adaptador ocupa 0,3 GB; el modelo base Qwen3.5-9B tiene 9B parametros) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda la del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (el adaptador se carga en bfloat16 segun el codigo de ejemplo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se aplica sobre el modelo de lenguaje Qwen/Qwen3.5-9B, cuyos pesos permanecen congelados durante el entrenamiento. Sobre este modelo base se añade un stack de fusión multimodal compuesto por proyectores, un módulo de identidad de modalidad, un Q-Former y el adaptador LoRA. Este stack se encarga de transformar las representaciones de imagen y espectro en embeddings que el LLM puede procesar para generar descripciones textuales.

El entrenamiento se realiza en dos etapas, tal como se menciona en el código de referencia (`captioner/train/stage1.py`), aunque no se proporcionan detalles sobre el dataset, el número de tokens, ni si se utilizaron técnicas como RLHF o DPO. La arquitectura del stack de fusión requiere la clase `FusionStack` del paquete `captioner` para recargarse correctamente, lo que implica que el modelo no es autocontenido y depende de código externo para su uso completo.

## Capacidades

- Generacion de descripciones textuales de objetos astronomicos a partir de imagenes y espectros.
- Fusion multimodal: combina informacion visual (imagen) y espectral (espectro) en una unica representacion para el LLM.
- Integracion con el modelo base Qwen3.5-9B, que aporta capacidades generativas de texto generales.
- No se ha documentado soporte para tool calling, function calling, agentes o razonamiento multi-paso.
- No se especifican capacidades multilingues ni modos especiales de pensamiento.

## Casos de uso

- Generacion de informes de observacion astronomica: un astronomo aficionado sube una imagen y un espectro de una nebulosa, y el modelo genera una descripcion detallada de sus caracteristicas, tipo de objeto y posibles fenomenos fisicos.
- Anotacion automatica de datasets astronomicos: investigadores pueden usar el modelo para etiquetar miles de imagenes y espectros con descripciones en lenguaje natural, facilitando la busqueda y catalogacion.
- Asistencia en educacion cientifica: el modelo puede explicar de forma comprensible los datos de un objeto celeste a estudiantes, combinando informacion visual y espectral en un texto divulgativo.
- Integracion en pipelines de analisis multiagente: dentro del ecosistema AstroBridge, el captioner puede alimentar a otros agentes que necesiten descripciones textuales de objetos para planificar investigaciones.
- Documentacion de observaciones en tiempo real: durante una sesion de observacion, el modelo puede generar resumenes automaticos de cada objeto capturado, ahorrando tiempo de redaccion manual.
- Generacion de contenido para divulgacion: blogs, redes sociales o articulos de divulgacion pueden beneficiarse de descripciones automaticas de imagenes astronomicas con contexto espectral.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni metricas especificas de captioning astronomico.

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA es ligero (0,3 GB), pero el modelo base Qwen3.5-9B en bfloat16 requiere aproximadamente 18 GB de VRAM. Con cuantizacion de 4 bits podria reducirse a unos 6-8 GB, aunque no se ha confirmado compatibilidad con cuantizacion.
- GPU recomendadas: para inferencia con el modelo base completo, se recomienda una GPU con al menos 24 GB de VRAM (RTX 3090, RTX 4090, A100 40GB). Con cuantizacion podria ejecutarse en GPUs de 12-16 GB, pero no esta documentado.
- En consumer GPU: posible en RTX 3090/4090 con el modelo base en bfloat16; en GPUs de menor VRAM se requeriria cuantizacion adicional no especificada.
- Opciones de despliegue: el codigo de ejemplo usa `transformers` y `peft` (PeftModel). No se mencionan vLLM, llama.cpp, Ollama ni TGI. El stack de fusion requiere codigo personalizado del paquete `captioner`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con otros modelos de captioning astronomico multimodal. Existen alternativas genericas como LLaVA o BLIP-2 para captioning de imagenes, pero ninguna esta especializada en espectros astronomicos. El proyecto AstroBridge en su version multiagente utiliza Gemini 2.5 Flash, pero no es directamente comparable al ser un sistema cerrado. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- No se especifica la licencia del modelo, lo que impide conocer si su uso comercial esta permitido. Se debe contactar con el autor antes de utilizarlo en produccion.
- El modelo depende del modelo base Qwen/Qwen3.5-9B, que tiene su propia licencia (Apache 2.0 segun Qwen, pero no se confirma en esta ficha). Es necesario verificar la licencia del modelo base por separado.
- El stack de fusion requiere codigo externo del paquete `captioner` (no publicado en el repositorio de HuggingFace). Sin ese codigo, el adaptador no puede cargarse correctamente.
- No hay informacion sobre sesgos, alucinaciones o limitaciones de contexto. Al ser un modelo de lenguaje, puede generar descripciones inexactas o inventar detalles si los datos de entrada son ambiguos.
- El modelo esta especializado en astronomia; su rendimiento en otros dominios no esta garantizado.
- No se han publicado evaluaciones cuantitativas, por lo que la calidad de las descripciones no esta validada externamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Infonioknight/astrobridge-model-v1
- Repositorio AstroBridge (sistema multiagente): https://github.com/open-astro-lab/AstroBridge
- Libreria AstroBridge en PyPI: https://pypi.org/project/astrobridge/
- Perfil del autor en HuggingFace: https://huggingface.co/Infonioknight/models
