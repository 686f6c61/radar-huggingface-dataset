# MichaelAnthony/LFM3-Omni-2B-98K-INT8

## Resumen

LFM3-Omni-2B-98K-INT8 es un ajuste fino de la comunidad sobre LiquidAI/LFM3-Omni-2B, el modelo omni (texto, audio y vision) de 2.166 millones de parametros desarrollado por Liquid AI. Lo publica el usuario MichaelAnthony en Hugging Face y su proposito es extender la ventana de contexto nativa del modelo base hasta aproximadamente 98.000 tokens verificados, mediante un entrenamiento LoRA SFT sobre datos sinteticos de contexto largo y posterior fusion en un unico checkpoint.

El modelo conserva la arquitectura `lfm3_omni` del original (requiere `trust_remote_code` y `compressed-tensors`) y se distribuye en formato INT8 weight-only (W8A16), lo que reduce el peso del repositorio a 3,3 GB. Es relevante porque demuestra que es posible llevar un modelo omni de 2B a contextos de ~100k tokens con un coste de entrenamiento modesto (LoRA r=32, alpha=64) y porque incluye verificaciones publicadas de needle-in-haystack hasta 109k tokens.

La modificacion arquitectonica clave es la conversion de las 5 capas de atencion deslizante (`sliding_attention`) en atencion completa (`full_attention`) durante el entrenamiento, con theta 1e6 y rotary parcial 0.5. Esto convierte al modelo en una alternativa practica para tareas de recuperacion de informacion en documentos largos y para inferencia multimodal con audio en llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer `lfm3_omni` (multimodal: texto, audio y vision) con capas de atencion convertidas a full attention |
| Parametros totales | 2.166.928.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ~98k tokens entrenados; verificacion needle-in-haystack hasta 109k tokens |
| Tipos de cuantizacion | INT8 weight-only (W8A16) mediante compressed-tensors; existen GGUFs del autor (Q6_K y otras) |
| Idiomas soportados | no disponible |
| Licencia | other (LFM Open License del modelo base) |
| Formato de pesos | safetensors (INT8 compressed-tensors); GGUF para llama.cpp |

## Arquitectura y entrenamiento

El modelo parte de LFM3-Omni-2B de Liquid AI, un transformer multimodal de 2,17B parametros con capacidad de procesar texto, audio y vision. El ajuste fino convierte las 5 capas de atencion deslizante del modelo original en atencion completa, con theta de 1e6, rotary parcial de 0.5 y sin ventana deslizante. Los checkpoints de Hugging Face ya incorporan el campo `layer_types` correcto. Para los GGUFs, dado que llama.cpp exige al menos una capa con ventana deslizante, se emula el comportamiento etiquetando las antiguas capas deslizantes como SWA con `sliding_window=131072`, `freq_base_swa=1e6` y `n_rot_swa=64`, lo que es numericamente identico a atencion completa.

El entrenamiento consistio en un LoRA SFT con r=32 y alpha=64 sobre datos sinteticos de contexto largo de 65k a 98k tokens, fusionado despues en el modelo base. La longitud efectiva entrenada es de aproximadamente 94k tokens: los ultimos pasos de optimizacion sobre ejemplos de 94,5k a 98,3k se omitieron por OOM, aunque la recuperacion se verifico mas alla de ese limite. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento sobre contextos muy largos (hasta ~98k tokens entrenados).
- Procesamiento multimodal: entrada de audio y vision, segun la arquitectura omni del modelo base.
- Recuperacion de informacion en documentos largos (needle-in-haystack verificado en profundidades 10/50/90%).
- Inferencia con llama.cpp mediante GGUFs, incluyendo el proyecto mmproj para audio (mtmd).
- Compatibilidad con vLLM y runtimes que soporten compressed-tensors para los pesos INT8.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Modo thinking o agentes multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos extensos: el modelo puede procesar contratos, informes o expedientes de hasta ~98k tokens en una sola pasada, lo que permite preguntas y respuestas sobre el documento completo sin fragmentacion ni recuperacion externa.
- Resumen de transcripciones largas de audio: gracias a su entrada de audio y a la ventana extendida, puede resumir reuniones o entrevistas de varias horas en una sola inferencia.
- Recuperacion de informacion en bases documentales: el needle-in-haystack verificado hasta 109k tokens lo hace adecuado para localizar datos concretos en corpus largos, como normativas o documentacion tecnica.
- Asistencia sobre imagenes con contexto textual extenso: combinando vision y contexto largo, puede responder preguntas sobre capturas, diagramas o documentos escaneados acompanados de texto de referencia.
- Despliegue en hardware de consumo: con cuantizacion GGUF y llama.cpp, corre en GPUs de gama media como la RX 6750 XT con ~70-180 tok/s, lo que permite prototipos locales de asistentes sobre documentos largos.
- Investigacion en contextos largos: sirve como banco de pruebas para estudiar el comportamiento de modelos pequenos con ventanas de ~100k tokens y para comparar estrategias de atencion completa frente a deslizante.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Needle-in-haystack (HF, profundidades 10/50/90%) | 15/15 aciertos, 15k-109k tokens |
| Needle-in-haystack (GGUF a 32k, todas las cuantizaciones) | Superado en todas |
| Needle-in-haystack (GGUF a 64k, Q6_K) | Superado |
| Omni mmproj (audio de entrada, llama.cpp mtmd) | Funcional |
| Generacion llama.cpp (Vulkan, RX 6750 XT) | ~70-180 tok/s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos INT8 ocupan aproximadamente 2,2 GB; con overhead de activaciones y cache KV para contextos largos, se recomienda al menos 8-12 GB de VRAM para contextos moderados y 16 GB o mas para aprovechar los ~98k tokens.
- GPU recomendadas: RTX 4090, A100 o H100 para contextos largos completos; GPUs de gama media como RX 6750 XT funcionan con GGUFs cuantizados.
- Cabe en GPU de consumo: si, con cuantizaciones GGUF (Q6_K y otras) en GPUs de 8 GB o mas, segun los resultados del autor en RX 6750 XT.
- Opciones de despliegue: vLLM con compressed-tensors para los pesos INT8; llama.cpp (incluido mtmd para audio) con GGUFs; transformers con `trust_remote_code=True`. No se menciona soporte de Ollama ni TGI.
- Latencia y throughput: ~70-180 tok/s en llama.cpp con Vulkan sobre RX 6750 XT; no hay datos para otras configuraciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-Omni-2B-98K-INT8 | 2,17B | ~98k (verificado 109k) | Si (texto, audio, vision) | LFM Open License | safetensors INT8, GGUF |
| LiquidAI/LFM3-Omni-2B (base) | 2,17B | no disponible en esta informacion | Si | LFM Open License | safetensors |
| Alternativas de 2B con contexto largo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con otros modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Es un ajuste fino de la comunidad, no oficial de Liquid AI; no ha pasado por evaluaciones de seguridad ni de sesgo publicadas.
- Los pesos INT8 solo funcionan en vLLM y runtimes con compressed-tensors; no son compatibles con transformers estandar sin ese soporte.
- El entrenamiento efectivo llego a ~94k tokens; los ejemplos de 94,5k-98,3k se omitieron por OOM, por lo que el rendimiento en el extremo superior del contexto puede degradarse.
- En llama.cpp es imprescindible no modificar los metadatos SWA (`sliding_window=131072`, `freq_base_swa=1e6`, `n_rot_swa=64`); alterarlos rompe la equivalencia numerica con atencion completa.
- La licencia es "other" (LFM Open License); es necesario revisar sus terminos antes de uso comercial.
- No hay informacion sobre idiomas soportados, sesgos conocidos ni tasas de alucinacion.
- El modelo tiene solo 19 descargas y 0 likes, por lo que carece de validacion comunitaria amplia.
- El contexto de ~98k tokens exige mucha memoria para la cache KV; en GPUs de consumo habra que reducir la ventana o usar cuantizacion de cache.

## Enlaces

- Hugging Face: https://huggingface.co/MichaelAnthony/LFM3-Omni-2B-98K-INT8
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
