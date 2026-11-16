# mlboydaisuke/Qwen2.5-3B-Instruct-LiteRT

## Resumen

Qwen2.5-3B-Instruct-LiteRT es una conversión del modelo Qwen2.5-3B-Instruct de Alibaba Cloud al formato `.litertlm` de Google, pensada para inferencia en dispositivo (on-device) mediante el runtime LiteRT-LM. Lo publica el usuario mlboydaisuke en Hugging Face y su rasgo diferencial es que los pesos int4 no se recuantizan desde cero: se transporta de forma sin pérdida la rejilla de calibración GPTQ oficial de Qwen mediante el algoritmo `dequantized_weight_recovery` de `ai-edge-quantizer`. El resultado es un bundle de aproximadamente 1,75 GB que conserva la calidad de la cuantización calibrada por el fabricante.

El modelo base es un transformer denso de tipo `Qwen2ForCausalLM` con 36 capas y 3.000 millones de parámetros, ajustado con instrucciones. La conversión fija la caché KV en 4096 tokens, cuantiza los pesos lineales a int4 simétrico con granularidad de bloque 128, y deja embeddings y lm_head en INT8 con granularidad por canal. El cómputo es entero, con activaciones int8 dinámicas.

Su relevancia actual reside en que permite ejecutar un modelo de 3B con calidad cercana a la referencia bf16 en hardware de consumo y en móviles Android, a través de la aplicación Google AI Edge Gallery, sin necesidad de servidores GPU. La velocidad de decodificación reportada es de unos 74 tok/s en un Mac con GPU de la serie M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (`Qwen2ForCausalLM`), 36 capas |
| Parametros totales | 3.000 millones (modelo base Qwen2.5-3B-Instruct) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4096 tokens (caché KV del bundle) |
| Tipos de cuantizacion | Pesos lineales int4 simetrico bloque 128 sobre rejilla GPTQ oficial; embeddings y lm_head INT8 por canal; activaciones int8 dinamicas; computo entero |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | qwen-research (etiquetada como `other` en Hugging Face) |
| Formato de pesos | `.litertlm` (bundle LiteRT-LM, ~1,75 GB), incluye tokenizer y plantilla de chat |
| Tamano del repositorio | 5,3 GB |
| Libreria | litert-lm |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Velocidad de decodificacion | ~74 tok/s (Mac serie M, backend GPU) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-3B-Instruct original: un transformer decoder-only denso de 36 capas con atención causal estándar. Esta ficha no describe un reentrenamiento, sino una conversión de formato y cuantización. El proceso parte del checkpoint GPTQ-Int4 oficial de Qwen, lo dequantiza a fp32 (operación exacta, ya que escala fp16 por int4 es representable en fp32) y `dequantized_weight_recovery` vuelve a derivar las escalas por bloque de forma bit-exacta, de modo que la rejilla int4 desplegada es la misma que calibró Qwen. La conversión se realizó con el conversor oficial `litert-torch` y requirió una versión nightly de `ai-edge-quantizer` (≥ 0.8.0.dev20260703) con soporte blockwise.

Los detalles de entrenamiento del modelo base (número de tokens, composición del dataset, fases de RLHF/DPO) no se detallan en la información proporcionada. La model card sí documenta dos cambios de metadatos posteriores a la conversión: el 2026-09-21 se actualizó la plantilla de chat para aceptar la forma de content-parts 0.18, y el 2026-08-29 se restauró el turno de sistema por defecto que la plantilla upstream emite cuando no se envía mensaje de sistema; este último añade 21 tokens de prefill a las conversaciones sin system message, sin alterar la velocidad por token ni los pesos.

## Capacidades

- Generación de texto conversacional con plantilla ChatML de Qwen2 (`<|im_start|>role\n…<|im_end|>`), incluida en el bundle junto con el tokenizer.
- Razonamiento aritmético y resolución de problemas matemáticos de varios pasos (validado en GSM8K con chain-of-thought 0-shot).
- Respuestas a preguntas factuales y traducción, según la prueba de humo de 8 preguntas reportada (8/8 correctas).
- Seguimiento de instrucciones y formato de respuesta conciso, derivado del ajuste de instrucciones del modelo base.
- Generación de código: capacidad heredada del modelo base, aunque no se documentan evaluaciones específicas en esta conversión.
- Inferencia en dispositivo con backend GPU o CPU a través del runtime LiteRT-LM.
- Integración en la app Google AI Edge Gallery (v1.0.16+ permite importar modelos litert-lm directamente desde Hugging Face).
- No se documenta soporte de tool calling, capacidades de agente, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Asistente conversacional en móvil Android: el bundle `.litertlm` se importa directamente en Google AI Edge Gallery y se ejecuta con backend GPU, sin necesidad de servidor ni conexión, gracias a sus ~1,75 GB y su caché KV de 4096 tokens para conversaciones multi-turno.
- Resolución de problemas matemáticos en el dispositivo: adecuado para aplicaciones educativas que necesitan chain-of-thought local; la model card valida el comportamiento en GSM8K con prompting 0-shot.
- Traducción y consultas factuales offline: la prueba de humo reportada incluye traducción y preguntas factuales correctas, lo que respalda su uso en apps de consulta sin conectividad.
- Prototipado de aplicaciones edge en Mac: con ~74 tok/s en GPU de la serie M, sirve para desarrollar y depurar flujos de inferencia local antes de portarlos a Android.
- Procesamiento de texto privado en el dispositivo: al no requerir envío de datos a la nube, encaja en escenarios con requisitos de privacidad, como resumen o reescritura de notas personales.
- Evaluación de pipelines de cuantización LiteRT: útil como referencia para equipos que quieran replicar el flujo `dequantized_weight_recovery` con otros modelos GPTQ y comparar la degradación de calidad introducida por el formato de ejecución.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre GSM8K (n=100, greedy, 0-shot chain-of-thought, max_tokens 512, mismo prompt y extracción de respuesta en todas las filas):

| Configuracion | GSM8K |
|---|---|
| bf16 (referencia) | 81,0% |
| Qwen GPTQ-Int4 oficial, dequantizado en PyTorch (n=50) | 82,0% |
| LiteRT int4 bloque 128 (este archivo) | 75,0% (−6 pt vs bf16) |

La model card atribuye la pérdida de 6 puntos al coste del formato de ejecución en dispositivo (cómputo entero), no a los pesos de 4 bits, ya que la calibración GPTQ oficial resulta sin pérdida en GSM8K. La prueba de humo de 8 preguntas arroja 8/8 correctas. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Espacio en disco: ~1,75 GB para el archivo `model.litertlm`; el repositorio completo ocupa 5,3 GB.
- VRAM/RAM estimada para inferencia: no disponible de forma explícita; el tamaño del bundle int4 (~1,75 GB) más la caché KV de 4096 tokens da una cota práctica en el rango de 2-3 GB, aunque no se confirma en la documentación.
- GPU recomendadas: no se listan modelos concretos; la medición de referencia se hizo en un Mac con GPU de la serie M.
- Dispositivos de consumo: diseñado explícitamente para edge y móvil; se ejecuta en Android mediante Google AI Edge Gallery con backend GPU.
- Opciones de despliegue: runtime LiteRT-LM (binario `litert_lm_main` con `--backend gpu`), app Google AI Edge Gallery en Android, o instalación manual vía `adb push` en versiones antiguas.
- Latencia y throughput: ~74 tok/s de decodificación en Mac serie M con GPU; el turno de sistema restaurado añade 21 tokens de prefill al time-to-first-token cuando no se envía system message, sin afectar a la velocidad por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Calidad reportada | Licencia |
|---|---|---|---|---|---|
| Qwen2.5-3B-Instruct-LiteRT (esta ficha) | 3B denso | 4096 | `.litertlm`, LiteRT-LM, edge | GSM8K 75,0% | qwen-research |
| Qwen2.5-3B-Instruct (bf16) | 3B denso | no disponible en esta informacion | safetensors, GPU servidor | GSM8K 81,0% | qwen-research |
| Qwen2.5-3B-Instruct-GPTQ-Int4 | 3B denso | no disponible en esta informacion | safetensors GPTQ, GPU | GSM8K 82,0% (n=50, dequantizado en PyTorch) | qwen-research |

Las tres variantes comparten pesos y calibración; la diferencia está en el formato de ejecución y en el coste de calidad asociado al cómputo entero del bundle LiteRT. No se dispone de datos de otras alternativas de 3B en formato on-device en la información proporcionada.

## Limitaciones y advertencias

- Degradación medible de calidad: −6 puntos en GSM8K frente a bf16, atribuida al formato de ejecución en dispositivo; conviene validar la tarea concreta antes de producción.
- Contexto limitado a 4096 tokens en la caché KV del bundle, inferior al contexto nativo del modelo base.
- Idiomas soportados no documentados en esta conversión; no se puede asumir cobertura multilingüe sin verificación.
- Riesgo de alucinación y sesgos heredados del modelo base Qwen2.5-3B-Instruct; no se documentan evaluaciones de sesgo específicas para esta conversión.
- Licencia `qwen-research`: restricciones de uso comercial según los términos de Qwen; revisar el archivo LICENSE antes de desplegar en producto.
- Dependencia de versiones nightly del toolchain (`ai-edge-quantizer` ≥ 0.8.0.dev20260703) para reproducir la conversión.
- El comportamiento sin system message cambió el 2026-08-29 (se restaura el turno por defecto); si se envía system message, el bloque no se emite, lo que puede afectar a la paridad con otras implementaciones.
- La app Google AI Edge Gallery requiere versión 1.0.15+ para `.litertlm` y 1.0.16+ para importar directamente desde Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/Qwen2.5-3B-Instruct-LiteRT
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Checkpoint GPTQ-Int4 oficial de Qwen: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct-GPTQ-Int4
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Conversor litert-torch: https://github.com/google-ai-edge/litert-torch
- App Google AI Edge Gallery: https://github.com/google-ai-edge/gallery
