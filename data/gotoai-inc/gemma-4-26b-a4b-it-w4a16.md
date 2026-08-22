# GotoAI-Inc/gemma-4-26B-A4B-it-W4A16

## Resumen

gemma-4-26B-A4B-it-W4A16 es una cuantizacion int4 weight-only del modelo multimodal [google/gemma-4-26B-A4B-it](https://huggingface.co/google/gemma-4-26B-A4B-it) de Google DeepMind, realizada por GotoAI-Inc. El modelo original es un MoE (Mixture-of-Experts) de 25.8B parametros totales con solo ~3.8B activos por token, con una ventana de contexto de hasta 256K tokens y soporte multimodal (imagen y texto). Esta version cuantizada reduce el peso de 51.61 GB a 15.65 GB, una reduccion del 70%, lo que permite ejecutar el modelo completo en una GPU de 24 GB con su contexto maximo.

La relevancia de esta ficha radica en que Google no publica una version `qat-w4a16-ct` para el tamano 26B A4B (solo ofrece GGUF para llama.cpp o NVFP4 para GPUs Blackwell), por lo que esta cuantizacion cubre un hueco: permite servir el modelo con vLLM en GPUs de compute capability 7.5 o superior. La cuantizacion se realizo sin datos de calibracion (PTQ) con grupo de 64, y mantiene la arquitectura, tokenizador y plantilla de chat originales sin modificaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture-of-Experts), 30 capas (25 sliding attention + 5 global attention) |
| Parametros totales | 25.805.936.206 (25.8B) |
| Parametros activos | ~3.8B por token |
| Longitud de contexto | 256K tokens (maximo) |
| Tipos de cuantizacion | int4 W4A16, group size 64, simetrico, weight-only (compressed-tensors) |
| Idiomas soportados | Mas de 140 idiomas (segun la ficha del modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors, formato `_packed`/`_scale` para vLLM) |

## Arquitectura y entrenamiento

El modelo base es un MoE con 30 capas: 25 capas de sliding attention con ventana de 1024 tokens, 8 KV heads y `head_dim` de 256, y 5 capas globales (cada 6ª capa) con 2 KV heads y `global_head_dim` de 512. Cada capa contiene 128 expertos MoE, un MLP compartido y routers. El modelo es multimodal: incluye un vision tower (con `intermediate_size` de 4304) y un `embed_vision`, pero no incluye torre de audio (`audio_config: null`), que solo esta disponible en los tamanos E2B, E4B y 12B.

La cuantizacion se realizo con `llmcompressor.model_free_ptq` sin datos de calibracion, operando directamente sobre los safetensors sin cargar el modelo. Se convirtieron 11.725 modulos Linear a int4 con grupo de 64, cubriendo el 83.1% de los bytes de salida. El grupo de 64 (en lugar de 128) es necesario porque las dimensiones de los expertos `down_proj` (704) y del MLP compartido (2112) no son divisibles por 128. Los componentes que permanecen en bfloat16 son: vision tower y `embed_vision` (por incompatibilidad con kernels Marlin), routers (por requerir fp32 para estabilidad en top-k) y `embed_tokens` (que esta atado al output head, `tie_word_embeddings: true`).

Los expertos se almacenan como 11.520 modulos individuales cuantizados (separados por experto) en lugar de tensores 3D fusionados, formato que vLLM maneja explicitamente en su loader de Gemma 4. El checkpoint tiene 35.923 tensores en total.

## Capacidades

- Generacion de texto multimodal: acepta entradas de imagen y texto, genera texto (pipeline `image-text-to-text`).
- Razonamiento y codigo: el modelo base esta entrenado para tareas de razonamiento, generacion de codigo y comprension de lenguaje natural.
- Tool calling / function calling: soportado via vLLM con `--enable-auto-tool-choice --tool-call-parser gemma4`.
- Razonamiento multi-paso: soporta `--reasoning-parser gemma4` para modos de pensamiento.
- Multilingue: soporte de mas de 140 idiomas.
- Contexto largo: ventana de 256K tokens, con KV cache eficiente gracias a la combinacion de sliding y global attention.
- Decodificacion especulativa: existe un drafter oficial de Google, `google/gemma-4-26B-A4B-it-assistant` (4 capas), compatible con vLLM.

## Casos de uso

- Atencion al cliente multimodal: el modelo puede procesar capturas de pantalla, fotos de productos o documentos escaneados junto con la conversacion, manteniendo el contexto completo de interacciones largas gracias a sus 256K tokens de ventana.
- Generacion de codigo en produccion: con soporte de tool calling, puede integrarse en pipelines de CI/CD para generar, revisar y documentar codigo, ejecutandose en GPUs de 24 GB con vLLM.
- Analisis de documentos extensos: su contexto de 256K tokens permite procesar libros completos, expedientes legales o codebases enteras en una sola pasada, con un coste de KV cache de solo ~20 KB/token en las capas globales.
- Asistente multimodal para soporte tecnico: puede diagnosticar problemas a partir de imagenes (errores de pantalla, diagramas, capturas) y proporcionar instrucciones paso a paso, con razonamiento multi-paso.
- Traduccion y localizacion: con soporte de mas de 140 idiomas, puede traducir documentos largos manteniendo coherencia terminologica a lo largo de todo el texto.
- Despliegue en entornos con restriccion de hardware: al caber en 24 GB con contexto completo, es viable para inferencia local en estaciones de trabajo con RTX 4090 o A5000, sin necesidad de GPUs de datacenter.
- Razonamiento visual para agentes: combinando vision, tool calling y razonamiento, puede actuar como agente que interpreta interfaces graficas y ejecuta acciones via herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor indica explicitamente que todas las capacidades, evaluaciones y limitaciones pertenecen al modelo base, y remite a la ficha de `google/gemma-4-26B-A4B-it` para esos datos. No se proporcionan cifras de MMLU, HumanEval, GSM8K u otros benchmarks en los materiales revisados.

## Requisitos de hardware

- VRAM estimada para inferencia: 15.65 GB de pesos + KV cache. A 32K contexto: ~16.5 GB totales; a 128K: ~18.5 GB; a 256K (maximo): ~21.1 GB.
- GPU recomendadas: cualquier GPU con compute capability 7.5 o superior (Turing, Ampere, Ada Lovelace, Hopper). Una RTX 4090 (24 GB) puede ejecutar el modelo a contexto completo. Para produccion con alta concurrencia, A100 o H100.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) y similares. Con `--language-model-only` se liberan 1.15 GB adicionales (vision tower) si no se necesita multimodalidad.
- Opciones de despliegue: vLLM (soporte nativo de compressed-tensors, deteccion automatica desde `config.json`), con Marlin kernels para int4. No usar llama.cpp para este formato especifico (el modelo base tiene una version GGUF separada).
- Latencia y throughput: no se proporcionan mediciones, pero al tener solo ~3.8B parametros activos por token, el throughput es significativamente mejor de lo que sugiere el tamano total. Los calculos de KV cache son teoricos, basados en `config.json`, no mediciones reales.
- Restriccion de versiones: requiere `transformers >= 5.10.1`. Con vLLM ≤ 0.27.1, usar `transformers < 5.15`; con vLLM ≥ 0.28, no hay restriccion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| google/gemma-4-26B-A4B-it (original) | 25.8B totales, ~3.8B activos | 256K | bfloat16 (51.61 GB) | Apache-2.0 | safetensors |
| GotoAI-Inc/gemma-4-26B-A4B-it-W4A16 (esta ficha) | 25.8B totales, ~3.8B activos | 256K | int4 W4A16 g64 (15.65 GB) | Apache-2.0 | compressed-tensors (vLLM) |
| bg-digitalservices/Gemma-4-26B-A4B-it-NVFP4 | 25.8B totales, ~3.8B activos | 256K | NVFP4 | Apache-2.0 | safetensors (requiere Blackwell) |
| google/gemma-4-26B-A4B-it-qat-q4_0-gguf | 25.8B totales, ~3.8B activos | 256K | QAT q4_0 | Apache-2.0 | GGUF (solo llama.cpp) |

La diferencia clave frente a las alternativas: la version NVFP4 requiere GPUs Blackwell (serie RTX 50, B100/B200), mientras que esta cuantizacion W4A16 funciona en cualquier GPU con compute capability 7.5+. La version GGUF de Google usa QAT (mayor calidad) pero solo es servible con llama.cpp, no con vLLM.

## Limitaciones y advertencias

- Cuantizacion sin calibracion (PTQ): no se usaron datos de calibracion, lo que puede degradar la calidad respecto a una cuantizacion QAT. El propio autor advierte que si se quiere calidad QAT bajo vLLM, se depende de conversiones de terceros.
- No es una version oficial de Google: es un trabajo no oficial y no afiliado. Las capacidades, evaluaciones y limitaciones del modelo base se aplican, pero la cuantizacion puede introducir degradaciones adicionales no documentadas.
- Sin torre de audio: a diferencia de otros tamanos de Gemma 4, este modelo no procesa entrada de audio.
- Riesgo de alucinacion y sesgos: los mismos que el modelo base, no documentados en esta ficha. Se recomienda consultar la model card de `google/gemma-4-26B-A4B-it`.
- Compatibilidad de versiones: existe una incompatibilidad conocida entre `transformers >= 5.15` y vLLM ≤ 0.27.1 que produce un error de configuracion. Es necesario elegir la combinacion de versiones adecuada.
- `embed_tokens` y vision tower permanecen en bfloat16: esto limita la reduccion total de memoria y puede ser un cuello de botella en algunos escenarios.
- Sin mediciones de rendimiento: los calculos de KV cache y ajuste en 24 GB son teoricos, basados en `config.json`, no en despliegues medidos.

## Enlaces

- [Modelo cuantizado en HuggingFace](https://huggingface.co/GotoAI-Inc/gemma-4-26B-A4B-it-W4A16)
- [Modelo base en HuggingFace](https://huggingface.co/google/gemma-4-26B-A4B-it)
- [Documentacion oficial de Gemma 4 (Google AI for Developers)](https://ai.google.dev/gemma/docs/core)
- [Pagina de Gemma 4 en Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [Version NVFP4 del modelo (bg-digitalservices)](https://huggingface.co/bg-digitalservices/Gemma-4-26B-A4B-it-NVFP4)
- [Ficha del modelo en Google Cloud (Gemini Enterprise Agent Platform)](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/google/gemma-4-26b-a4b-it)
