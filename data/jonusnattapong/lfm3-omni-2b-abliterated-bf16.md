# JonusNattapong/LFM3-Omni-2B-abliterated-BF16

## Resumen

LFM3-Omni-2B-abliterated-BF16 es una variante derivada del modelo multimodal LiquidAI/LFM3-Omni-2B de Liquid AI, publicada por el usuario JonusNattapong. El modelo base es el primer modelo "omni" de Liquid AI: un unico modelo end-to-end que procesa texto, imagenes, video y audio, y responde en texto, voz o texto y voz intercalados, disenado para ejecucion en dispositivo (edge). Esta version concreta aplica una "abliteracion" (eliminacion de la direccion de rechazo) sobre el backbone de texto y fusiona un LoRA de codigo y uso de herramientas (v4.2), dando lugar a un modelo que produce intencionadamente contenido que el modelo original rechaza.

El checkpoint contiene 2.166.928.384 parametros en BF16, distribuidos en tres shards de safetensors, y mantiene la arquitectura del backbone LFM3 con 24 capas (13 de convolucion, 6 de atencion completa y 5 de atencion de ventana deslizante), tamano oculto de 2.048 y atencion GQA con 16 cabezas de consulta y 4 de clave-valor en las capas de atencion completa. La abliteracion se realizo mediante proyeccion ortogonal en las capas 12 y 22, sobre los modulos `o_proj`, `out_proj` y `w2`, con alpha 2.0, todo dentro del backbone de texto.

La relevancia de esta ficha es doble: por un lado documenta el modelo base omni de Liquid AI y su propuesta de unificar ASR, VLM, LLM y TTS en un solo modelo de 2B para edge; por otro, documenta un derivado sin censura pensado para investigacion de seguridad, red-teaming y estudio de mecanismos, con advertencias claras sobre validacion incompleta y comportamiento multimodal no verificado tras la fusion del LoRA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 Omni (backbone LFM3 hibrido: convolucion + atencion completa + atencion de ventana deslizante), clase `Lfm3OmniForConditionalGeneration` |
| Parametros totales | 2.166.928.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 en este repositorio; existe un repositorio GGUF del backbone de texto en Q8_0 |
| Idiomas soportados | no disponible (los prompts de abliteracion fueron solo en ingles) |
| Licencia | LFM Open License v1.0 (lfm1.0, licencia "other") |
| Formato de pesos | safetensors (tres shards `model-00001..00003-of-00003.safetensors`), codigo remoto (`custom_code`) |
| Capas | 24 (13 convolucion, 6 atencion completa, 5 atencion de ventana deslizante) |
| Tamano oculto | 2.048 |
| Atencion | GQA, 16 cabezas de consulta / 4 de clave-valor en capas de atencion completa |
| Tamano intermedio feed-forward | 7.680 |
| Tamano del repositorio | 4,4 GB |

## Arquitectura y entrenamiento

El backbone es un transformer hibrido LFM3 de 24 capas que combina capas de convolucion, capas de atencion completa y capas de atencion de ventana deslizante, con atencion GQA (16 cabezas de consulta frente a 4 de clave-valor) en las capas de atencion completa y un tamano oculto de 2.048. Sobre este backbone, el modelo base LFM3-Omni-2B anade componentes multimodales (procesamiento de imagen, video y audio, y salida de voz) para funcionar como un unico modelo omni end-to-end en lugar de encadenar un ASR, un VLM, un LLM y un TTS por separado. El modelo base es explicitamente no razonador (non-reasoning).

Este checkpoint concreto es un finetune derivado: primero se aplico abliteracion sobre el backbone de texto (proyeccion ortogonal en capas 12 y 22, objetivos `o_proj`/`out_proj`/`w2`, alpha 2.0) y despues se fusiono un adaptador LoRA de codigo y uso de herramientas (`JonusNattapong/lfm3-coding-tool-use-v4.2-pilot`, SHA-256 `556c6570...`) en los pesos BF16 completos. El LoRA tiene rango 16, alpha 32, dropout 0.05, learning rate 5e-5, 3 epocas, semilla 42, y se entreno en una RTX 4090 en bf16 con torch 2.9.1, transformers 5.22.1 y peft 0.21.2, con una perdida final de entrenamiento de 1.226 en 60 pasos. Los datos de entrenamiento fueron 39 filas de entrenamiento y 8 de validacion escritas por el autor, sin dataset externo. No se documentan tokens de preentrenamiento, composicion del dataset original ni si el modelo base uso RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en el backbone de texto.
- Comprension multimodal en el modelo base: texto, imagenes, video y audio.
- Salida de voz y de texto y voz intercalados en el modelo base (speech-to-speech).
- Uso de herramientas (tool calling): el modelo emite llamadas en XML de Liquid, aunque no las ejecuta.
- Capacidades de codigo reforzadas por el LoRA v4.2 fusionado (entrenado sobre 39 filas de codigo y uso de herramientas).
- Modo sin rechazo (abliterated): produce contenido que el modelo base rechaza, por diseno.
- Capacidades multilingues: no disponible.
- Modo de razonamiento explicito (thinking): el modelo base es no razonador; no disponible para este derivado.
- Capacidades de audio, vision y voz tras la fusion del LoRA: no verificadas y sin garantia de preservacion.

## Casos de uso

- Investigacion de seguridad y red-teaming: el modelo sirve para estudiar como la eliminacion de la direccion de rechazo afecta las respuestas, comparando con el modelo base en las mismas prompts.
- Estudio de mecanismos de rechazo: la metadata de abliteracion (capas 12 y 22, modulos `o_proj`/`out_proj`/`w2`, alpha 2.0) permite reproducir y analizar intervenciones en activaciones concretas.
- Evaluacion de robustez de filtros de seguridad: usar el modelo como generador adversario para probar clasificadores y guardrails de produccion.
- Pruebas de uso de herramientas en edge: el LoRA de codigo y tool calling permite experimentar con emision de llamadas XML en un modelo de 2B pensado para dispositivo.
- Prototipado de asistentes multimodales en local: el modelo base omni esta disenado para sustituir ASR, VLM, LLM y TTS en un solo modelo de 2B, util para demos en hardware limitado.
- Experimentacion con decodificacion y cuantizacion: el repositorio GGUF Q8_0 del backbone de texto permite probar despliegues cuantizados en CPU o GPU de gama baja.
- Analisis de fusion de adaptadores: comparar los pesos fusionados con el adaptador aplicado en tiempo de ejecucion para estudiar diferencias numericas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el benchmark de agente piloto se ejecuto contra otra revision del adaptador (`cdc5deba...`, 57 pasos) y que los pesos publicados aqui (60 pasos, perdida 1.226) no fueron reevaluados con ese benchmark, por lo que no se hace ninguna afirmacion de tasa de exito para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 4,3 GB solo para pesos, mas overhead de activaciones y del codigo remoto; en la practica se recomienda disponer de al menos 6-8 GB de VRAM para texto.
- Para el modelo base omni completo (audio, vision, voz), los requisitos de VRAM no estan disponibles en la informacion proporcionada.
- GPU recomendadas: una RTX 4090 basta para el entrenamiento del LoRA (asi se entreno) y para inferencia BF16 del backbone de texto; A100 y H100 son sobredimensionadas para 2B pero utiles para lotes grandes.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas para el backbone de texto en BF16; la version GGUF Q8_0 reduce aun mas el requisito.
- Opciones de despliegue: transformers con `trust_remote_code=True` (clase `AutoModelForMultimodalLM`); llama.cpp/Ollama a traves del repositorio GGUF del backbone de texto; vLLM y TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-Omni-2B-abliterated-BF16 (este) | 2,17 B | no disponible | texto, imagen, video, audio (no verificado tras LoRA) | LFM Open License v1.0 | Derivado sin rechazo, LoRA de codigo fusionado, sin benchmarks |
| LiquidAI/LFM3-Omni-2B (base) | 2,17 B | no disponible | texto, imagen, video, audio, salida de voz | LFM Open License v1.0 | Modelo omni oficial no razonador para edge, con rechazo intacto |
| JonusNattapong/LFM3-Omni-2B-abliterated | 2,17 B | no disponible | texto, imagen, video, audio | LFM Open License v1.0 | Misma abliteracion sin el LoRA v4.2 fusionado |
| JonusNattapong/LFM3-Omni-2B-abliterated-GGUF | 2,17 B (backbone de texto) | no disponible | texto (GGUF Q8_0) | LFM Open License v1.0 | Version cuantizada del backbone de texto con proyector Omni oficial |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo produce intencionadamente contenido que el modelo base rechaza; esta pensado para investigacion de seguridad, red-teaming y estudio de mecanismos, no para uso general.
- Entrenado sobre solo 39 filas de entrenamiento; no hay benchmark publicado para los pesos exactos de este repositorio.
- Los pesos fusionados no estan validados numericamente frente al adaptador aplicado en tiempo de ejecucion; solo se verifico la carga correcta y la generacion de texto.
- El comportamiento de audio, vision y voz tras la fusion del LoRA de texto no fue probado y no se garantiza que se preserve.
- Las llamadas a herramientas se emiten como XML de Liquid y el modelo no las ejecuta; no hay integracion verificada con Hermes-Agent, OpenClaw ni Grok.
- Los prompts de abliteracion fueron unicamente en ingles, por lo que el comportamiento sin rechazo en otros idiomas no esta caracterizado.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero es un modelo no razonador de 2B.
- Sesgos conocidos: no documentados en la informacion disponible.
- Restricciones de licencia: se aplica la LFM Open License v1.0 del modelo base; las redistribuciones deben incluir esa licencia, mantener los avisos de atribucion y marcar los archivos modificados. El autor no concede licencia MIT ni Apache adicional.
- El codigo remoto se copia sin cambios del modelo base; debe revisarse antes de habilitar `trust_remote_code=True`.
- El repositorio esta etiquetado `not-for-all-adversaries` (contenido no apto para todas las audiencias) y tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/JonusNattapong/LFM3-Omni-2B-abliterated-BF16
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Variante abliterada sin LoRA: https://huggingface.co/JonusNattapong/LFM3-Omni-2B-abliterated
- Version GGUF del backbone de texto: https://huggingface.co/JonusNattapong/LFM3-Omni-2B-abliterated-GGUF
- Adaptador LoRA v4.2: https://huggingface.co/JonusNattapong/lfm3-coding-tool-use-v4.2-pilot
- Documentacion de Liquid AI sobre LFM3-Omni-2B: https://docs.liquid.ai/lfm/models/lfm3-omni-2b
- Grafo de arquitectura (visor de terceros): https://hfviewer.com/JonusNattapong/LFM3-Omni-2B-abliterated
