# ajensenwaud/inkspark-mini-2dgx

## Resumen

InkSpark-Mini-2DGX es una cuantización EXL3 del modelo multimodal Inkling-2-Mini de Thinking Machines, publicada por el usuario ajensenwaud. El modelo base es un transformer de mezcla de expertos (MoE) con 26,4 mil millones de parámetros totales y 3,4 mil millones activos por token, que incorpora una arquitectura con capas intermedias en bucle ("looped middle") y una torre de visión para entrada image-text-to-text. Esta versión cuantizada reduce los pesos a 15,6 GB distribuidos en tres shards, lo que permite ejecutar el modelo completo en dos NVIDIA DGX Spark (GB10) con paralelismo tensorial.

La relevancia de esta ficha reside en que demuestra la viabilidad de servir un MoE multimodal de 26B con contexto de 1 millón de tokens en hardware de sobremesa de gama alta (dos GB10), manteniendo una degradación de calidad mínima respecto al release original en NVFP4/MXFP8. El pack incluye además el drafter DSpark del propio modelo (decodificación especulativa) y la torre de visión, ambos en bf16 tal como se publicaron.

La cuantización se realizó con exllamav3 1.6.6 y un overlay de arquitectura específico para Inkling 2 Mini, con calibración de 250 muestras de 2048 tokens y códec mul1. El resultado es un pack de ~4,05 bits por peso en las capas, con expertos a 4 bpw, atención a 6 bpw y cabeza a 8 bpw.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas en bucle (looped middle) y torre de visión |
| Parametros totales | 26,4 B |
| Parametros activos | 3,4 B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | EXL3 (~4,05 bpw en capas; expertos 4 bpw, atención 6 bpw, cabeza 8 bpw); router, normas, convoluciones, gates y mensajes del bucle y embeddings en bf16 |
| Idiomas soportados | no disponible (evaluado en Global-MMLU-Lite con 23 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | EXL3 (exllamav3); drafter y torre de visión en bf16 (safetensors) |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini es un transformer de mezcla de expertos con 26,4B parámetros totales y 3,4B activos, que incorpora una innovación estructural denominada "looped middle": capas intermedias que se ejecutan en bucle, con gates y mensajes propios que se preservan en bf16 durante la cuantización. Dispone de torre de visión para entrada multimodal y de un drafter DSpark (`mtp.safetensors`) para decodificación especulativa. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

La cuantización se realizó con exllamav3 1.6.6 y un overlay de arquitectura para Inkling 2 Mini (familia `inkling2` con el bucle de Mini), calibrando las tres pasadas de las capas en bucle en cada matriz, con 250 muestras de 2048 tokens y códec mul1, partiendo del release NVFP4/MXFP8 en el commit `ed40e7da`. El pack requiere los parches TensorFold de InkSpark-Mini; ni TensorFold upstream ni exllamav3 upstream pueden cargarlo todavía.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento (reasoning effort configurable; el modelo razona antes de responder incluso en el nivel mínimo).
- Entrada multimodal image-text-to-text mediante torre de visión en bf16.
- Generación de código y matemáticas (evaluado en GSM8K, MMLU-Pro).
- Capacidades multilingües (evaluado en Global-MMLU-Lite con 23 idiomas).
- Decodificación especulativa mediante el drafter DSpark del propio modelo.
- Contexto largo de hasta 1M tokens, con reanudación desde caché de prompt en turnos de seguimiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: mencionado en los benchmarks de velocidad (escenario "agent"), pero sin detalles técnicos adicionales.

## Casos de uso

- Asistencia conversacional con contexto largo: el modelo puede mantener conversaciones multi-turno sobre documentos extensos gracias a su ventana de 1M tokens, con reanudación desde caché de prompt en segundos en turnos de seguimiento.
- Análisis de documentación técnica y codebases: con 1M de contexto y buen rendimiento en código (perplejidad de 2,06 en el conjunto de código evaluado), puede procesar repositorios completos o manuales extensos en una sola pasada.
- Procesamiento de imágenes con texto asociado: la torre de visión permite tareas image-text-to-text como descripción de figuras, extracción de información de capturas o análisis de documentos escaneados.
- Razonamiento matemático y resolución de problemas: GSM8K al 97,0 % en este pack lo hace adecuado para tutoría o verificación de cálculos, configurando reasoning effort alto.
- Despliegue en hardware de sobremesa de gama alta: dos DGX Spark (GB10) permiten servir el modelo a 77-94 tok/s por stream, viable para prototipos y entornos de investigación con presupuesto de hardware limitado.
- Servicio multiusuario ligero: con ocho streams concurrentes (ventanas de 128K) alcanza 232 tok/s agregados, adecuado para equipos pequeños o demos internas.
- Evaluación multilingüe: Global-MMLU-Lite al 82,2 % en 23 idiomas lo hace útil para tareas de comprensión lectora multilingüe.

## Benchmarks y rendimiento

| Tarea | Este pack | Model card de Thinking Machines |
|---|---|---|
| GSM8K (500) | 97,0 % | no reportado |
| Global-MMLU-Lite (500 items, 23 idiomas) | 82,2 % | no reportado |
| MMLU-Pro (500) | 81,4 % | no reportado |

Calidad de la cuantización frente al release NVFP4/MXFP8 (mismas filas, vía exllamav3):

| Texto (filas de 2.048 tokens) | KL media | Mismo token top | Perplejidad, release / este pack |
|---|---|---|---|
| wikitext-2 (64) | 0,0069 | 96,5 % | 6,4448 / 6,4536 (+0,14 %) |
| código (16) | 0,0058 | 98,1 % | 2,0634 / 2,0649 (+0,07 %) |

Velocidad en dos DGX Spark:

| Escenario | Rendimiento |
|---|---|
| Un stream, prompt corto, greedy (chat / código / agente) | 77 / 89 / 70 tok/s con drafter |
| Un stream a temperatura 1,0 (chat / código / agente) | 68 / 94 / 79 tok/s |
| Dos streams simultáneos, greedy | 116 tok/s totales con drafter |
| Ocho streams simultáneos (8 x 128K) | 232 tok/s totales |
| Decode a 128K / 512K / 1M de contexto | 59,0 / 25,1 / 16,7 tok/s |
| Lectura de prompt frío, 128K / 1M | 1.638 tok/s (80 s) / 899 tok/s (19 min) |

## Requisitos de hardware

- VRAM estimada: ~11,6 GiB por Spark a TP=2 (dos GPUs), con pesos totales de 15,6 GB (3 shards de 14,3 GB, drafter de 0,64 GB, torre de visión de 0,64 GB).
- GPU recomendadas: dos NVIDIA DGX Spark (GB10) con paralelismo tensorial; es el hardware objetivo del pack.
- Cabe en consumer GPU: no en una sola GPU de consumo convencional por el tamaño del pack y la necesidad de TP=2; requiere el par de GB10.
- Opciones de despliegue: InkSpark-Mini (motor con parches TensorFold para la familia `inkling2` con el bucle de Mini) sobre exllamav3; ni TensorFold upstream ni exllamav3 upstream cargan el pack todavía.
- Latencia y throughput: ver tabla de velocidad; decode degrada de 59,0 tok/s a 128K hasta 16,7 tok/s a 1M de contexto; prompt frío de 1M tarda unos 19 minutos en leerse.
- Caché KV en fp8.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de modelos comparables de la misma categoría (MoE multimodal de ~26B con contexto de 1M) para establecer una comparativa con parámetros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- El pack solo es cargable con los parches TensorFold de InkSpark-Mini; ni TensorFold upstream ni exllamav3 upstream lo soportan todavía, lo que limita la portabilidad.
- El modelo razona antes de responder incluso con el mínimo esfuerzo de razonamiento, por lo que hay que reservar miles de tokens por respuesta; esto incrementa latencia y coste.
- El rendimiento en prompts largos en frío es bajo: 1M de contexto tarda unos 19 minutos en leerse y el decode cae a 16,7 tok/s.
- Los benchmarks de calidad (GSM8K, Global-MMLU-Lite, MMLU-Pro) miden este pack, no la distancia respecto al release original; la model card de Thinking Machines no reporta esas tareas.
- La degradación respecto al release es pequeña pero medible (KL media 0,0069 en wikitext-2, 0,0058 en código; +0,14 % y +0,07 % de perplejidad).
- Idiomas soportados no documentados explícitamente; solo se conoce la evaluación en 23 idiomas vía Global-MMLU-Lite.
- Riesgo de alucinación, sesgos conocidos y restricciones adicionales de uso comercial: no disponibles en la información proporcionada; la licencia es Apache-2.0, igual que el modelo fuente.
- El autor reporta 0 descargas y 0 likes en el momento de la consulta, lo que indica que el pack es reciente y poco validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ajensenwaud/inkspark-mini-2dgx
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio del proyecto: https://github.com/ajensenwaud/inkspark-mini-2dgx
