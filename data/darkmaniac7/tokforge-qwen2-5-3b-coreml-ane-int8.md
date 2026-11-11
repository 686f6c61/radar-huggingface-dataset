# darkmaniac7/TokForge-Qwen2.5-3B-CoreML-ANE-INT8

## Resumen
TokForge-Qwen2.5-3B-CoreML-ANE-INT8 es una conversión a Core ML del modelo Qwen2.5-3B-Instruct de Alibaba Qwen, publicada por TokForge para inferencia en dispositivo (on-device) sobre la Apple Neural Engine. Se trata de un artefacto de investigación y no de un modelo listo para producción: la model card indica explícitamente que la decodificación token a token todavía no funciona, por lo que no puede mantener una conversación. El modelo base es un transformer decoder de 3.000 millones de parámetros con 36 capas, atención con GQA y un vocabulario de 151.936 tokens.

La conversión mantiene la arquitectura original pero la adapta al runtime de Apple: pesos cuantizados a INT8 por bloques de 32, caché KV persistente en `MLState` (estado interno del modelo), y una ventana de contexto fija de 2.048 tokens con formas estáticas. El paquete ocupa 6,37 GB en el repositorio e incluye dos variantes del modelo (`.mlmodelc` precompilado de 3,08 GB y `.mlpackage` de 3,28 GB) más el tokenizer de Qwen2.5 y el script de conversión.

Su relevancia es doble: por un lado documenta el estado del arte de la conversión de LLMs a Core ML con estado y cuantización por bloques para ANE; por otro, sirve como referencia técnica de las limitaciones actuales de este pipeline (decodificación de un solo token no resuelta, requisito de iOS 18/macOS 15, chips A17 Pro o superiores). La licencia Qwen Research restringe el uso a fines no comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2.5): 36 capas, 16 cabezas de atención, 2 cabezas KV (GQA), head_dim 128, hidden 2048, vocab 151936 |
| Parametros totales | 3.000 millones (modelo base Qwen2.5-3B-Instruct) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens fijos (buffers KV de forma estática) |
| Tipos de cuantizacion | INT8 por bloques de 32 (`per_block(32)`, `linear_symmetric`), descomprimido a fp16 en la ANE en tiempo de cómputo; variante fp16 disponible (5.889 MB) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Qwen Research License (uso exclusivamente no comercial) |
| Formato de pesos | Core ML: `.mlmodelc` precompilado o `.mlpackage` (compilación en dispositivo); estado KV vía `MLState` |

## Arquitectura y entrenamiento
El modelo es una conversión directa de Qwen2.5-3B-Instruct, un transformer decoder con normalización RMSNorm, RoPE, atención con grouped-query attention (16 cabezas de consulta y 2 de clave/valor) y activación SwiGLU. La conversión no reentrena ni modifica los pesos más allá de la cuantización: se aplica INT8 simétrico por bloques de 32 sobre los pesos lineales, que la ANE descomprime a fp16 en tiempo de ejecución para ahorrar ancho de banda y RAM, no cómputo. El resultado se empaqueta como modelo Core ML con estado: 72 entradas de `MLState` (`key_cache_<i>` y `value_cache_<i>`, i = 0..35), cada una con forma `[1, 2, 2048, 128]` en fp16.

La interfaz de entrada/salida es explícita y de bajo nivel: `input_ids` `[1, S]` int32, `causal_mask` `[1, 1, S, 2048]` fp16 aditivo (0 para atender, -1e4 para enmascarar), `position_ids` `[1, S]` int32 con posiciones absolutas de RoPE y `cache_offset` `[1]` int32. La salida es un tensor `logits` fp16. No se documentan datos de entrenamiento adicionales, procesos de RLHF/DPO ni innovaciones de decodificación especulativa; el modelo base Qwen2.5-3B-Instruct ya incorpora el ajuste por instrucciones del equipo Qwen, pero la model card no detalla su composición de dataset.

## Capacidades
- Generación de texto y conversación: hereda las capacidades del modelo base Qwen2.5-3B-Instruct, aunque la model card advierte que esta conversión concreta **no conversa todavía** porque la decodificación de un solo token no se ejecuta.
- Razonamiento, código y matemáticas: capacidades propias del modelo base, no verificadas en esta conversión.
- Soporte multilingüe limitado a inglés y chino según los metadatos del modelo.
- Inferencia on-device en la Apple Neural Engine con caché KV persistente entre pasos (prefill y decode separados por `cache_offset`).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido en esta conversión.

## Casos de uso
- Investigación sobre conversión de LLMs a Core ML: el repositorio incluye `convert_qwen_coreml.py` y la firma completa de E/S, lo que permite reproducir y adaptar el pipeline de conversión para otros modelos Qwen.
- Estudio de cuantización INT8 por bloques en ANE: sirve para medir el impacto de `per_block(32)` frente a fp16 en RAM, ancho de banda y latencia en chips A17 Pro o superiores.
- Desarrollo de motores de inferencia iOS: la interfaz de `MLState` con 72 cachés KV y máscara causal aditiva es una referencia para implementar decodificación incremental en Swift.
- Benchmarking de hardware Apple: útil para comparar el rendimiento de la ANE frente a GPU/CPU en modelos de 3B con contexto de 2.048 tokens.
- Prototipado de asistentes offline en iPhone/iPad: una vez resuelta la decodificación, el modelo podría ejecutar tareas de resumen o clasificación sin conexión en dispositivos con 8 GB de RAM o más.
- Educación y análisis de licencias: ejemplo práctico de las restricciones de la Qwen Research License en despliegues comerciales.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM/RAM: el paquete INT8 ocupa 3.129 MB y el fp16 5.889 MB; el repositorio completo son 6,37 GB (9 archivos), pero solo se necesita uno de los dos zips del modelo más el tokenizer.
- Chips compatibles: Apple Neural Engine en A17 Pro, A18, A19 y series M; en iPhone/iPad se requiere A17 Pro o superior con 8 GB de RAM o más (requisito de TokForge para iOS).
- Sistemas operativos: iOS 18 o posterior y macOS 15 o posterior (los modelos con estado `MLState` y la cuantización INT8 por bloques son exclusivos de iOS 18).
- Carga: usar `MLComputeUnits.cpuAndNeuralEngine`; verificar el despacho a ANE en tiempo de ejecución, ya que Core ML puede recurrir silenciosamente a GPU o CPU si falla la especialización.
- Opciones de despliegue: Core ML nativo (`.mlmodelc` o `.mlpackage`), app TokForge para iOS vía TestFlight, y tokenizer de Hugging Face mediante `swift-transformers`.
- Latencia y throughput: no disponibles; la decodificación de un solo token no funciona en esta build.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| TokForge-Qwen2.5-3B-CoreML-ANE-INT8 | 3B | 2.048 | Core ML (INT8/fp16) | Qwen Research (no comercial) | Borrador de investigación, decode no funcional |
| Qwen/Qwen2.5-3B-Instruct | 3B | 32.768 (modelo original) | safetensors | Qwen Research / Apache 2.0 según variante | Modelo base listo para uso |
| Alternativas Core ML para LLM en ANE | no disponible | no disponible | Core ML | no disponible | no disponible |

## Limitaciones y advertencias
- **No es funcional para chat**: la model card indica que la decodificación de un solo token no se ejecuta; la app TokForge lo mantiene como entrada de laboratorio bloqueada.
- **Contexto muy limitado**: 2.048 tokens fijos frente a los 32.768 del modelo base, lo que restringe tareas de contexto largo.
- **Licencia no comercial**: la Qwen Research License prohíbe el uso comercial; cualquier despliegue en producción requiere una licencia alternativa.
- **Requisitos de hardware estrictos**: solo iOS 18+/macOS 15+ y chips A17 Pro o superiores con 8 GB de RAM; no funciona en GPUs de escritorio ni en hardware no Apple.
- **Riesgo de fallback silencioso**: Core ML puede ejecutar en GPU o CPU sin avisar si la especialización en ANE falla, degradando el rendimiento.
- **Idiomas limitados**: solo inglés y chino según los metadatos; no se garantiza un rendimiento adecuado en castellano.
- **Sesgos y alucinaciones**: heredados del modelo base Qwen2.5-3B-Instruct, sin evaluaciones específicas publicadas para esta conversión.
- **Madurez**: 0 descargas y 0 likes en el momento de la consulta; es un artefacto de investigación sin validación comunitaria.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/darkmaniac7/TokForge-Qwen2.5-3B-CoreML-ANE-INT8
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia Qwen Research: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Web de TokForge: https://tokforge.ai
- Discord de TokForge: https://discord.gg/Acv3CBtfVm
- Google Play (TokForge): https://play.google.com/store/apps/details?id=dev.tokforge
- TestFlight iOS (TokForge): https://testflight.apple.com/join/jnufjzRr
- Colección TokForge iOS Models: https://huggingface.co/collections/darkmaniac7/tokforge-ios-models-6a38cca9b57803e6168ce232
