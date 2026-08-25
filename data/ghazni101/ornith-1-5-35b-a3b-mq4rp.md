# ghazni101/Ornith-1.5-35B-A3B-MQ4RP

## Resumen

Ornith-1.5-35B-A3B-MQ4RP es una cuantización de precisión mixta del modelo base Ornith-1.5-35B-A3B, un modelo de lenguaje de tipo mixture-of-experts (MoE) de 35.900 millones de parámetros totales con 3.000 millones activos por token, desarrollado por ornith-ai bajo licencia MIT. Esta versión concreta ha sido generada por ghazni101 utilizando el motor de inferencia hipfire, un runtime nativo en Rust diseñado específicamente para GPUs AMD RDNA, y empaquetada en el contenedor `.mq4r` con la receta MQ4RP.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 35B MoE en una GPU AMD de consumo como la RX 7900 XTX con aproximadamente 22 GB de VRAM, algo inviable con los pesos originales en bf16 (unos 70 GB). La receta MQ4RP protege las capas críticas del enrutamiento (router, shared expert y conv1d) en Q8F16, manteniendo la precisión en el camino denso por token, mientras que los expertos enrutados se cuantifican a 4,25 bits por peso. El modelo base soporta un contexto de 262.144 tokens (256K) y un vocabulario de 248.320 entradas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), 40 capas, 256 expertos top-8, hidden_size 2048, head_dim 256 |
| Parametros totales | 35.900 millones (35,9B) |
| Parametros activos | 3.000 millones (3B) por token |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | MQ4 uniforme (4,25 bits/peso) con capas protegidas en Q8F16 y F16 |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | `.mq4r` (contenedor hipfire), derivado de safetensors originales |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un MoE con 40 capas, 256 expertos de los que se activan 8 por token, hidden_size de 2048 y head_dim de 256. Según la documentación de ornith-ai, Ornith-1.5 se construye sobre Qwen3.5 y Gemma4 mediante continued pretraining, mid-training y post-training, y extiende el marco de auto-mejora de Ornith-1.0: el modelo propone nuevas tareas, genera scaffolds específicos y produce rollouts de soluciones para entrenamiento por refuerzo, creando un bucle continuo de auto-mejora.

La cuantización MQ4RP aplica un procesamiento de incoherencia FWHT-rotated con cabecera de grupo afín o codebook fp16 a tamaño de grupo 256. Los expertos enrutados (`gate_up_proj`, `down_proj`) se cuantifican en MQ4 uniforme, mientras que el router, el shared expert y la capa `linear_attn.conv1d` (camino denso por token) se protegen en Q8F16. Las normas, `A_log` y `dt_bias` se mantienen en F16. Esta protección garantiza que el enrutamiento se realice con precisión completa en cada token.

## Capacidades

- Generación de texto, razonamiento, matemáticas y código, al ser un modelo generalista de la familia Ornith.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible, aunque al estar basado en Qwen3.5 es probable que lo herede; se recomienda verificar con pruebas propias.
- Razonamiento multi-paso y capacidades de agente: el modelo base incorpora un bucle de auto-mejora y scaffolding, lo que sugiere aptitud para tareas que requieren planificación y ejecución secuencial.
- Capacidades multilingües: no especificadas; probablemente multilingüe por su base Qwen, pero sin confirmación.
- Capacidades multimodales: el modelo base está etiquetado como vision-language, aunque esta cuantización se publica con pipeline text-generation y no se detalla el soporte de imágenes en el runtime hipfire.
- Contexto largo de 256K tokens, adecuado para procesar documentos extensos o conversaciones de muchos turnos.

## Casos de uso

- Inferencia local en GPUs AMD de consumo: permite ejecutar un MoE de 35B en una RX 7900 XTX con ~22 GB de VRAM, ideal para desarrolladores que no disponen de hardware NVIDIA y quieren experimentar con modelos grandes.
- Asistentes conversacionales de largo alcance: gracias a los 256K tokens de contexto, puede mantener conversaciones muy extensas o procesar historiales completos de usuario sin truncamiento.
- Generación de código en entornos de desarrollo: aunque no se confirma tool calling, puede usarse para autocompletar, refactorizar o explicar fragmentos de código directamente en el editor.
- Análisis y resumen de documentos largos: el contexto de 256K permite ingerir libros, informes técnicos o expedientes completos en una sola pasada.
- Prototipado rápido de aplicaciones de IA en hardware AMD: con `hipfire serve` se levanta un endpoint compatible con OpenAI, facilitando la integración en aplicaciones existentes.
- Investigación en auto-mejora y scaffolding: el modelo base tiene capacidades de auto-generación de tareas y scaffolds, útil para experimentos en aprendizaje por refuerzo o generación de datos sintéticos.
- Despliegue en entornos con restricciones de VRAM: al estar cuantizado, cabe en GPUs de 24 GB, lo que reduce costes de infraestructura frente a los 70 GB del modelo en bf16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ni para el modelo base ni para esta cuantización. Los únicos datos de rendimiento provienen de la verificación del autor en una RX 7900 XTX (gfx1100, RDNA3) con hipfire:

- ~155 tokens/s en pre-warm
- ~216 tokens/s en decode

Estas cifras son orientativas y dependen de la configuración exacta del hardware y del software.

## Requisitos de hardware

- VRAM estimada: ~22 GB con KV cache en f32 (según la model card).
- GPU recomendadas: AMD RDNA3 o superior, concretamente gfx1100 (RX 7900 XTX), gfx1151 y gfx1201, con ROCm instalado.
- No es compatible con GPUs NVIDIA; hipfire está diseñado exclusivamente para AMD.
- Opciones de despliegue: motor hipfire (`hipfire serve`), que levanta un servidor OpenAI-compatible. No se menciona soporte para vLLM, llama.cpp u Ollama.
- Latencia y throughput: ~155 tok/s pre-warm y ~216 tok/s decode en RX 7900 XTX, según la verificación del autor.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas directas con otros modelos en la información proporcionada. El modelo base Ornith-1.5-35B-A3B es comparable en tamaño y arquitectura a otros MoE de ~35B con 3B activos, como Qwen3.5-35B-A3B (su base declarada), pero no hay cifras de rendimiento que permitan una comparación objetiva. La cuantización MQ4RP se puede contrastar con la versión FP8 del mismo modelo (ornith-ai/Ornith-1.5-35B-A3B-FP8), que requiere ~70 GB en bf16 y se sirve con tensor parallelism en 2×80 GB, mientras que esta versión cabe en una sola GPU de 24 GB.

## Limitaciones y advertencias

- Es una cuantización con pérdida (lossy); la calidad puede degradarse ligeramente respecto al modelo original en bf16, especialmente en tareas sensibles a la precisión numérica.
- El formato `.mq4r` y el motor hipfire son exclusivos de GPUs AMD RDNA; no es portable a NVIDIA ni a otros runtimes.
- No hay benchmarks publicados que validen el rendimiento de la cuantización frente al modelo base; las cifras de velocidad son del autor y no han sido replicadas de forma independiente.
- El modelo base tiene capacidades multimodales (vision-language), pero esta cuantización se publica como text-generation y no se documenta el soporte de imágenes en hipfire.
- No se especifican sesgos, riesgos de alucinación ni limitaciones idiomáticas; se recomienda realizar pruebas propias antes de usar en producción.
- La licencia MIT permite uso comercial, pero es responsabilidad del usuario verificar el cumplimiento de las licencias de los modelos base subyacentes (Qwen3.5, Gemma4) en su jurisdicción.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/ghazni101/Ornith-1.5-35B-A3B-MQ4RP
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Versión FP8 del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-FP8
- Página oficial de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- ModelScope: https://www.modelscope.cn/models/ornith-ai/Ornith-1.5-35B-A3B
- Repositorio de hipfire: https://github.com/Kaden-Schutt/hipfire
