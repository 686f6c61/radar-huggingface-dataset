# gavinlaw/rasst-speech-llm-cap16-denoise-ttag-lora

## Resumen

RASST speech-LLM adapters es un conjunto de tres adaptadores LoRA de rango 32 publicados por el usuario gavinlaw para traduccion de voz en streaming (speech translation) desde ingles hacia chino, aleman y japones, con terminologia aumentada por recuperacion (retrieval-augmented terminology). Los adaptadores se montan sobre el modelo base Qwen/Qwen3-Omni-30B-A3B-Instruct, un modelo omni (texto, audio, vision) de arquitectura Mixture-of-Experts con 30 000 millones de parametros totales y 3 000 millones activos, lo que permite servir los tres pares de idiomas con una sola instancia del modelo base mediante multi-LoRA.

El interes tecnico del artefacto reside en su metodo de extraccion: en lugar de publicar los checkpoints fusionados completos, el autor deriva los adaptadores como la descomposicion en valores singulares de rango 32 de la diferencia entre el checkpoint fusionado y el modelo base (`lora_B = U_32 S_32`, `lora_A = V_32^T`), aplicada unicamente a las proyecciones de atencion y a las proyecciones de expertos del "thinker" de Qwen3-Omni. Esto reduce el coste de almacenamiento y permite conmutar de idioma en tiempo de peticion con vLLM 0.34 o superior.

El repositorio ocupa 10,1 GB y no registra descargas ni likes en el momento de la consulta, lo que sugiere un artefacto de investigacion reciente y poco difundido. La licencia es Apache 2.0, heredada del modelo base, y no se declaran idiomas soportados en los metadatos de Hugging Face mas alla de los pares de traduccion descritos en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen3-Omni-30B-A3B-Instruct (transformer MoE multimodal con modulo "thinker") |
| Parametros totales | No disponible para los adaptadores; el modelo base declara 30B totales (3B activos) |
| Parametros activos | 3B en el modelo base (MoE); no disponible el desglose de parametros del adaptador |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos se publican en safetensors, presumiblemente bf16) |
| Idiomas soportados | Ingles como origen; chino (zh), aleman (de) y japones (ja) como destino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |
| Rango LoRA | 32 (alpha 32) |
| Modulos adaptados | Proyecciones de atencion y proyecciones de expertos del thinker de Qwen3-Omni |
| Tamano del repositorio | 10,1 GB |
| Libreria | peft |
| Version minima de vLLM | 0.34 |

## Arquitectura y entrenamiento

Los adaptadores se entrenaron como LoRA de rango 32 con alpha 32 sobre todas las capas lineales del thinker de Qwen3-Omni-30B-A3B-Instruct y posteriormente se publicaron como checkpoints fusionados (`gavinlaw/rasst-speech-llm-{zh,de,ja}-cap16-denoise-ttag`). El artefacto de este repositorio no contiene esos checkpoints fusionados, sino su reexpresion como LoRA: para cada modulo adaptado se calcula la diferencia `merged - base` y se retiene su descomposicion en valores singulares de rango 32, de modo que `lora_B = U_32 S_32` y `lora_A = V_32^T`. Solo difieren de la base las proyecciones de atencion y las proyecciones de expertos; los adaptadores de expertos son por experto y con layout 2D.

El autor indica que el resto de la diferencia respecto al checkpoint fusionado corresponde al redondeo bf16 de los pesos fusionados, y que cada carpeta incluye un `extraction_report.json` con la fraccion de energia de la diferencia conservada por tipo de modulo. La extraccion se genero con `scripts/extract_lora_from_merged.py` del repositorio `luojiaxuan/autoterm-sst` (rama `explore/llm-router`). No se detallan en la informacion disponible el volumen de datos de entrenamiento, la composicion del corpus ni si se emplearon tecnicas de RLHF o DPO; el nombre del checkpoint sugiere el uso de "denoise" y "ttag" (probablemente terminology tagging) junto a una ventana de contexto de 16 (cap16).

## Capacidades

- Traduccion de voz en streaming de ingles a chino, aleman y japones, con un adaptador dedicado por par de idiomas.
- Terminologia aumentada por recuperacion (retrieval-augmented terminology), segun la model card.
- Conmutacion de idioma en tiempo de peticion mediante multi-LoRA en vLLM (`"model": "zh" | "de" | "ja"`).
- Servicio de los tres pares con una unica instancia del modelo base Qwen3-Omni-30B-A3B-Instruct.
- Capacidades heredadas del modelo base Qwen3-Omni (multimodalidad texto/audio/vision, razonamiento, tool calling) potencialmente disponibles, aunque no documentadas para estos adaptadores en la informacion proporcionada.
- No se documentan en la informacion disponible capacidades de agentes, modo thinking explicito ni soporte multilingue adicional.

## Casos de uso

- Subtitulado y traduccion simultanea de conferencias: el modelo traduce voz en streaming de ingles a chino, aleman o japones, y la naturaleza de streaming del entrenamiento encaja con la generacion incremental de subtitulos en directo.
- Interpretacion en reuniones multilingues: una sola instancia del modelo base con multi-LoRA permite atender asistentes de habla china, alemana y japonesa seleccionando el adaptador por peticion, reduciendo el coste de infraestructura frente a desplegar tres modelos.
- Traduccion con terminologia especializada: el uso de terminologia aumentada por recuperacion resulta adecuado para dominios con vocabulario tecnico controlado (medico, legal, industrial), donde la coherencia terminologica es critica.
- Localizacion de contenido audiovisual: traduccion de pistas de audio o transcripciones inglesas a los tres idiomas destino para doblaje o subtitulado posterior.
- Atencion al cliente internacional en tiempo real: traduccion de intervenciones de agentes angloparlantes hacia clientes en zh/de/ja, con el modelo base aportando comprension de audio directamente.
- Investigacion en traduccion de voz: el artefacto sirve como referencia reproducible para estudiar la extraccion de LoRA a partir de checkpoints fusionados y la preservacion de energia por tipo de modulo via `extraction_report.json`.
- Evaluacion de multi-LoRA en produccion: util para medir el rendimiento de vLLM 0.34 con `--enable-mixed-moe-lora-format` y `--max-loras 3` sobre un modelo MoE multimodal de 30B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del modelo base Qwen3-Omni-30B-A3B-Instruct (30B totales, 3B activos) y de la cuantizacion elegida, no de los adaptadores, que son ligeros en comparacion.
- GPU recomendadas: el ejemplo de servicio de la model card usa `--tensor-parallel-size 2`, lo que implica al menos dos GPU de gama alta (por ejemplo, A100 o H100) para servir el modelo base en bf16.
- Compatibilidad con GPU de consumo: no confirmada; un modelo MoE de 30B totales en bf16 no cabe en una unica GPU de consumo de 24 GB, aunque variantes cuantizadas podrian reducir el requisito (no documentado para estos adaptadores).
- Opciones de despliegue: vLLM 0.34 o superior con `--enable-lora`, `--enable-mixed-moe-lora-format`, `--max-lora-rank 32` y `--max-loras 3`. No se documentan otras opciones (llama.cpp, Ollama, TGI) para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RASST speech-LLM adapters (este) | LoRA sobre base 30B/3B activos | No disponible | Traduccion de voz EN→ZH/DE/JA con LoRA multi-idioma | Apache 2.0 | Hugging Face (gavinlaw) |
| Qwen3-Omni-30B-A3B-Instruct (base) | 30B totales / 3B activos | No disponible en esta ficha | Modelo omni multimodal sin adaptacion a traduccion | Apache 2.0 | Hugging Face (Qwen) |
| Checkpoints fusionados RASST (`-zh`, `-de`, `-ja`) | 30B totales / 3B activos | No disponible | Misma tarea, pesos fusionados completos | Apache 2.0 | Hugging Face (gavinlaw) |

No se dispone de datos de benchmarks que permitan comparar el rendimiento relativo frente a otras alternativas de traduccion de voz.

## Limitaciones y advertencias

- Solo cubre la direccion ingles → chino/aleman/japones; no se documenta traduccion inversa ni otros pares.
- El artefacto depende completamente del modelo base Qwen3-Omni-30B-A3B-Instruct; cualquier limitacion, sesgo o alucinacion del base se hereda.
- Al ser una reexpresion de rango 32 de los checkpoints fusionados, se descarta parte de la diferencia respecto a la base (la fraccion restante se atribuye al redondeo bf16, pero conviene verificar `extraction_report.json` para cada modulo).
- No se documentan datos de entrenamiento, composicion del corpus ni proceso de alineacion, lo que dificulta evaluar sesgos y robustez.
- Riesgo de alucinacion en terminologia especializada si el mecanismo de recuperacion no esta bien calibrado; no hay evaluacion publicada al respecto.
- Requiere vLLM 0.34 o superior y flags especificos (`--enable-mixed-moe-lora-format`), lo que limita la portabilidad a otros motores de inferencia.
- El repositorio no registra descargas ni likes, y la model card es escueta; se recomienda validacion propia antes de uso en produccion.
- Licencia Apache 2.0 permite uso comercial, pero debe respetarse tambien la licencia del modelo base.
- No se declaran idiomas soportados en los metadatos de Hugging Face; la informacion de idiomas proviene unicamente de la model card.

## Enlaces

- Hugging Face del artefacto: https://huggingface.co/gavinlaw/rasst-speech-llm-cap16-denoise-ttag-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct
- Checkpoint fusionado zh: https://huggingface.co/gavinlaw/rasst-speech-llm-zh-cap16-denoise-ttag
- Checkpoint fusionado de: https://huggingface.co/gavinlaw/rasst-speech-llm-de-cap16-denoise-ttag
- Checkpoint fusionado ja: https://huggingface.co/gavinlaw/rasst-speech-llm-ja-cap16-denoise-ttag
- Repositorio del script de extraccion: `luojiaxuan/autoterm-sst` (rama `explore/llm-router`), referenciado en la model card; no se proporciona URL directa en la informacion disponible.
