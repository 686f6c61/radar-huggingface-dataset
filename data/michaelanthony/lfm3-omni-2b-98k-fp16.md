# MichaelAnthony/LFM3-Omni-2B-98K-FP16

## Resumen

LFM3-Omni-2B-98K-FP16 es un fine-tune comunitario de contexto largo construido sobre LiquidAI/LFM3-Omni-2B, el modelo omnimodal de 2B parametros de Liquid AI. El autor, MichaelAnthony, ha extendido la ventana de contexto del modelo base hasta aproximadamente 98.000 tokens mediante un entrenamiento SFT con LoRA (r=32, alfa=64) sobre datos sinteticos de contexto largo, fusionando despues los adaptadores en un unico checkpoint en FP16. El resultado es un modelo que conserva las capacidades multimodales del original (texto, vision y audio) y anade una ventana de contexto muy superior a la del base.

La relevancia de esta ficha radica en que demuestra un flujo de trabajo reproducible para extender el contexto de modelos pequenos con recursos modestos: el autor verifica la extension con pruebas needle-in-haystack hasta 109k tokens y publica tambien variantes GGUF funcionales en llama.cpp, incluyendo el proyector multimodal (mmproj) para entrada de audio. Es, por tanto, un caso practico de como un modelo de 2,17B parametros puede cubrir tareas de retrieval y razonamiento sobre documentos largos sin necesidad de GPUs de datacenter.

No obstante, conviene subrayar que se trata de un artefacto comunitario con 20 descargas y sin pipeline declarado, sujeto a la licencia del modelo base (LFM Open License) y sin datos publicados de benchmarks estandar. Su uso en produccion exige validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia LFM3 Omni de Liquid AI), con capas de atencion completa tras la conversion del fine-tune |
| Parametros totales | 2.166.928.384 (2,17B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | ~98k tokens entrenados (verificado hasta 109k en needle-in-haystack) |
| Tipos de cuantizacion | FP16 (checkpoint principal); GGUFs publicados por el autor en varios niveles (Q6_K verificado a 64k) |
| Idiomas soportados | no disponible |
| Licencia | other (LFM Open License del modelo base) |
| Formato de pesos | safetensors (repo principal); GGUF (variantes para llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de LFM3-Omni-2B, un transformer multimodal de Liquid AI que procesa texto, imagen y audio. El fine-tune realiza una conversion arquitectonica relevante: las 5 capas originales de `sliding_attention` se convierten en `full_attention` (theta 1e6, rotary parcial 0.5, sin ventana) durante el entrenamiento, de modo que los checkpoints HF llevan ya el campo `layer_types` correcto. El entrenamiento consistio en un SFT con LoRA (r=32, alfa=64) sobre datos sinteticos de contexto largo de 65k a 98k tokens, posteriormente fusionado en un unico checkpoint. La longitud efectiva entrenada es de aproximadamente 94k tokens, ya que los ultimos pasos de optimizador (94,5k-98,3k) se omitieron por OOM.

Un detalle tecnico critico es la adaptacion para llama.cpp: como dicho runtime exige al menos una capa con sliding window, los GGUFs etiquetan las antiguas capas sliding como SWA con `sliding_window=131072`, `freq_base_swa=1e6` y `n_rot_swa=64`, lo que numericamente equivale a atencion completa. El autor advierte explicitamente de que no debe "corregirse" esa metadata. No se documentan datos sobre composicion del dataset, numero total de tokens de entrenamiento ni uso de RLHF/DPO.

## Capacidades

- Generacion de texto y razonamiento sobre contextos muy largos (hasta ~98k-109k tokens verificados).
- Procesamiento multimodal: entrada de imagen y de audio (el proyector mmproj funciona en llama.cpp con mtmd).
- Recuperacion de informacion en documentos largos (needle-in-haystack superado en profundidades 10/50/90%).
- Conversacion multi-turno con historial extenso gracias a la ventana ampliada.
- Inferencia local eficiente en GPU de consumo mediante llama.cpp y Vulkan.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos legales o contractuales: el modelo puede ingerir contratos completos de decenas de miles de tokens en una sola pasada y responder preguntas sobre clausulas concretas, aprovechando la ventana de ~98k verificada con needle-in-haystack.
- Resumen de transcripciones largas de audio: al conservar la entrada de audio via mmproj, permite transcribir y resumir reuniones o clases extensas sin trocear el audio en segmentos.
- Asistente de lectura de repositorios o documentacion tecnica: con 98k tokens cabe un conjunto amplio de ficheros de codigo y documentacion, lo que facilita preguntas cruzadas sobre una base de codigo mediana.
- Procesamiento de historiales de atencion al cliente: la ventana larga permite mantener el contexto completo de una conversacion multi-turno sin resumir ni truncar, reduciendo perdida de informacion.
- Analisis de imagenes con contexto textual extenso: combinacion de vision con documentos largos, por ejemplo informes con graficos y texto adjunto en una sola consulta.
- Despliegue en estaciones de trabajo con GPU de consumo: las variantes GGUF y el rendimiento medido (~70-180 tok/s en una RX 6750 XT con Vulkan) lo hacen viable para prototipos locales y entornos sin acceso a GPUs de datacenter.
- Extraccion de datos de expedientes largos (por ejemplo, historiales medicos o financieros anonimizados) en flujos batch sobre hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor solo reporta pruebas de verificacion de contexto:

| Prueba | Resultado |
|---|---|
| Needle-in-haystack (HF, profundidades 10/50/90%) | 15/15 aciertos, 15k-109k tokens |
| Needle-in-haystack (GGUF a 32k, todas las cuantizaciones) | Superado en todas |
| Needle-in-haystack (GGUF a 64k, Q6_K) | Superado |
| mmproj Omni (audio de entrada, llama.cpp mtmd) | Funcional |
| Generacion en llama.cpp (Vulkan, RX 6750 XT) | ~70-180 tok/s |

## Requisitos de hardware

- VRAM estimada: en FP16, los 2,17B parametros ocupan aproximadamente 4,3 GB solo de pesos; con overhead de activaciones y cache KV para contexto largo, se recomienda al menos 8-12 GB para contextos moderados y mas para acercarse a 98k tokens.
- La cache KV crece linealmente con el contexto; a 98k tokens puede superar varios GB adicionales segun el numero de capas y cabezas, por lo que conviene usar cuantizaciones GGUF para contextos maximos.
- GPU recomendadas: RTX 4090, RTX 3090, A100 o H100 para FP16 con contexto largo; GPUs de 8-12 GB (RTX 3060, RTX 4060 Ti) para GGUF en contextos medios.
- Cabe en GPU de consumo: si, el autor reporta funcionamiento en una AMD RX 6750 XT (12 GB) con llama.cpp y Vulkan.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requiere `AutoModelForMultimodalLM` y `AutoProcessor`), llama.cpp (incluido mtmd para multimodal), y presumiblemente Ollama a partir de los GGUF; vLLM y TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: ~70-180 tok/s en RX 6750 XT con Vulkan segun el autor; no hay datos para otras GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-Omni-2B-98K-FP16 | 2,17B | ~98k (verificado a 109k) | Texto, vision, audio | LFM Open License (other) | Hugging Face, GGUF |
| LiquidAI/LFM3-Omni-2B (base) | ~2B | no disponible en la informacion | Texto, vision, audio | LFM Open License | Hugging Face |
| Qwen2.5-3B-Instruct | 3B | 32k (128k con RoPE scaling) | Solo texto | Apache 2.0 | Hugging Face, GGUF |
| Llama 3.2 3B Instruct | 3B | 128k | Solo texto | Llama 3.2 Community License | Hugging Face, GGUF |

La comparativa con Qwen2.5-3B y Llama 3.2 3B es orientativa por tamano y categoria; no se dispone de datos de benchmarks que permitan comparar rendimiento real entre ellos y este fine-tune.

## Limitaciones y advertencias

- Modelo comunitario con muy poca traccion (20 descargas, 0 likes) y sin pipeline declarado; no hay garantias de mantenimiento ni soporte.
- No se han publicado benchmarks estandar, por lo que el rendimiento en tareas generales (razonamiento, codigo, matematicas) es desconocido.
- La extension de contexto se entreno con datos sinteticos y los ultimos pasos (94,5k-98,3k) se omitieron por OOM; el contexto efectivo entrenado es ~94k, aunque la recuperacion se verifico hasta 109k.
- La licencia es "other" (LFM Open License); es imprescindible revisar sus terminos antes de uso comercial, ya que puede imponer restricciones.
- Riesgo de alucinacion inherente a modelos de 2B, especialmente en tareas de razonamiento complejo o contextos muy largos donde la atencion se diluye.
- Sesgos e idiomas soportados no documentados; se desconoce el comportamiento en castellano y en otras lenguas.
- La metadata de los GGUFs (capas SWA emuladas) es deliberada y critica; modificarla rompe la equivalencia numerica con atencion completa.
- El uso requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene auditar antes de desplegar en produccion.
- El rendimiento medido (~70-180 tok/s) corresponde a una unica GPU AMD con Vulkan; no hay datos de latencia en otras plataformas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MichaelAnthony/LFM3-Omni-2B-98K-FP16
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Liquid AI: https://www.liquid.ai/
- llama.cpp (runtime con soporte mtmd): https://github.com/ggml-org/llama.cpp
