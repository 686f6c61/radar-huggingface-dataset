# litert-community/Gemma3-1B-IT-Tensor-G4-NPU

## Resumen

Gemma3-1B-IT-Tensor-G4-NPU es un paquete cuantizado y recompilado del modelo `google/gemma-3-1b-it`, preparado por el usuario comunitario @xThr45hx bajo la organización `litert-community`. No se trata de un modelo nuevo ni de un reentrenamiento: es un artefacto precompilado (AOT, *ahead-of-time*) en formato `.litertlm` para ejecutarse sobre la NPU Google Tensor Edge TPU de los smartphones Pixel, mediante el runtime LiteRT-LM. El repositorio se creó originalmente con el nombre `Gemma3-1B-IT-Tensor-G4-NPU` y posteriormente pasó a llamarse `Gemma3-1B-IT-Tensor-NPU`, al alojar variantes para varias generaciones de chip.

El modelo base es un transformer de 26 capas con aproximadamente 1.000 millones de parámetros, ajustado para instrucciones (IT), y en este paquete se distribuye con una ventana de contexto de 4096 tokens y una caché KV embebida. La variante G4 (Pixel 9) usa cuantización int4 por canal con transformada de Hadamard y ocupa unos 875 MB; las variantes G5 y G6 emplean int8 (1,65 GB y 2,11 GB respectivamente) porque la ruta int4 no produce salidas coherentes en el compilador actual para Tensor G6.

Su relevancia es práctica: demuestra inferencia de un LLM de 1B íntegramente en la NPU de un teléfono de consumo, sin GPU ni servidor, con un tamaño a la mitad del bundle int8 oficial de Google para G5. Es un caso de referencia para quien quiera evaluar despliegue on-device en Android con aceleración NPU, aunque su utilidad queda acotada al hardware Tensor y a un runtime específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), 26 capas |
| Parametros totales | 1B (modelo base `google/gemma-3-1b-it`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (caché KV embebida, prefill 128) |
| Tipos de cuantizacion | int4 per-channel + Hadamard (G3/G4); int8 (G5/G6) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Gemma Terms of Use (acceso con gate) |
| Formato de pesos | `.litertlm` v1 (DGC precompilado DarwiNN) |

## Arquitectura y entrenamiento

El paquete no incluye entrenamiento propio: deriva del checkpoint QAT `google/gemma-3-1b-it-qat-int4-unquantized`, es decir, un modelo Gemma 3 de 1B parámetros ya entrenado y con *quantization-aware training*, que aquí se recuantiza y se compila AOT para la NPU Tensor. La arquitectura subyacente es un transformer decoder-only de 26 capas con tokenizador y plantilla de chat embebidos en el bundle. El artefacto resultante es un DGC (DarwiNN Graph Compiler) precompilado, con el grafo entero mapeado a operaciones de NPU.

La innovación técnica no está en el modelo sino en el pipeline de despliegue: compilación completa a NPU (en G5 se reportan 1295/1295 y 1226/1226 operaciones sin ninguna en CPU), caché KV embebida de 4096 tokens, y un estudio empírico de recetas de cuantización. Según la model card, en Tensor G6 hasta ocho variantes int4 (Hadamard, per-channel, cabezas mixtas int8/int4, blockwise-64 y combinaciones de flags del compilador) producen salidas incoherentes en NPU, mientras que int8 es coherente; de ahí la decisión de usar int8 en G5 y G6. También se documenta compatibilidad cruzada de DGC: los builds G3 y G4 compilan al mismo programa y difieren solo en un campo de tipo de dispositivo, mientras que un build G5 cargado en G4 ejecuta el prefill en NPU pero no el decode.

## Capacidades

- Generación de texto conversacional (chat) e instrucciones, heredadas de `gemma-3-1b-it`.
- Razonamiento básico y respuesta a preguntas de dominio general, limitado por el tamaño de 1B parámetros.
- Generación de código y matemáticas a nivel introductorio (capacidad del modelo base; no se aportan evaluaciones específicas en este paquete).
- Ejecución íntegra en NPU Google Tensor con backend `npu` de LiteRT-LM.
- Tokenizador y plantilla de chat embebidos en el bundle, sin dependencias externas de tokenización.
- Contexto de 4096 tokens con caché KV embebida, adecuado para conversaciones multi-turno cortas.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Asistente de chat offline en Pixel 9: cargar el bundle G4 int4 (875 MB) con la app Box y el backend NPU permite conversaciones multi-turno sin conexión, con latencia baja al no salir de la NPU.
- Funciones de resumen y reescritura dentro de una app Android: con 4096 tokens de contexto se pueden procesar notas, correos o mensajes largos y devolver un resumen en el propio dispositivo, sin enviar datos a la nube.
- Clasificación y extracción de entidades en local: usar el modelo como extractor de campos (fechas, importes, nombres) sobre texto de formularios, aprovechando que el contexto cubre documentos de varias páginas.
- Prototipado de asistentes de voz en el dispositivo: combinado con STT/TTS locales, el modelo sirve como capa de comprensión y generación de respuesta en un pipeline completamente on-device.
- Evaluación de despliegue NPU para investigación: el repositorio documenta recetas de cuantización, compatibilidad DGC entre G3/G4/G5/G6 y resultados de coherencia, lo que lo convierte en material de referencia para estudiar cuantización int4 frente a int8 en aceleradores móviles.
- Aplicaciones de privacidad estricta (salud, legal, finanzas personales): al no requerir red, el procesamiento de texto sensible permanece en el teléfono, lo que facilita el cumplimiento de requisitos de minimización de datos.
- Base para fine-tuning o destilación en el borde: el modelo base Gemma 3 1B-IT puede ajustarse y volver a compilarse con el SDK de Tensor, usando este bundle como línea base de rendimiento en NPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta datos de verificación funcional y de tamaño:

| Variante | SoC | Cuantizacion | Tamano | Estado |
|---|---|---|---|---|
| G3 | Tensor G3 (Pixel 8/8 Pro/8a) | int4 + Hadamard | ~875 MB | Verificado en dispositivo (Pixel 8 Pro, LineageOS, Box 3.5.6) |
| G4 | Tensor G4 (Pixel 9 series) | int4 + Hadamard | ~875 MB | Verificado en dispositivo |
| G5 | Tensor G5 (Pixel 10 series) | int8 | ~1,65 GB | No verificado en hardware; compilado 100 % a NPU |
| G6 | Tensor G6 (Pixel 11 series) | int8 | ~2,11 GB | Verificado en dispositivo (Pixel 11 Pro XL, `kodiak`) |

No se proporcionan cifras de tokens/s, latencia ni puntuaciones en MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Hardware objetivo: NPU Google Tensor Edge TPU. G3 para Pixel 8/8 Pro/8a; G4 para Pixel 9/9 Pro/9 Pro XL/9 Pro Fold; G5 para Pixel 10; G6 para Pixel 11.
- Almacenamiento: 875 MB (G3/G4 int4), 1,65 GB (G5 int8) y 2,11 GB (G6 int8).
- No requiere GPU dedicada ni servidor; no está pensado para A100, H100 ni RTX 4090, y no se documenta ejecución en GPU de escritorio.
- Runtime: LiteRT-LM con backend `npu` y un dispatch runtime de GoogleTensor que coincida con la generación del chip. Para G3/G4 se recomienda la app Box (github.com/jegly/Box), que incluye las librerías de runtime correctas.
- La app oficial Google AI Edge Gallery no funciona en G3/G4 según la model card (su dispatch runtime incluido no es compatible).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / destino | Licencia | Estado |
|---|---|---|---|---|---|
| Gemma3-1B-IT-Tensor-G4-NPU (este) | 1B | 4096 | `.litertlm` AOT para NPU Tensor | Gemma | Verificado en G3/G4/G6; G5 sin verificar |
| Gemma 3 1B int8 oficial de Google para Tensor G5 | 1B | no disponible | `.litertlm` int8 para NPU Tensor | Gemma | Bundle oficial; ~1678 MB |
| Gemma 3 1B int8 oficial de Google para Tensor G6 | 1B | 1280 | `.litertlm` int8 para NPU Tensor | Gemma | Bundle oficial; ~2,04 GB |
| `google/gemma-3-1b-it` (base) | 1B | no disponible | safetensors, GPU/CPU | Gemma | Modelo de referencia, no optimizado para NPU móvil |

Frente a los bundles oficiales, la variante G4 ofrece la mitad de tamaño (875 MB frente a 1678 MB del int8 de G5) y la variante G6 cuadruplica el contexto (4096 frente a 1280) con un tamaño similar. No se dispone de comparación de calidad o throughput con alternativas de otros fabricantes.

## Limitaciones y advertencias

- Build comunitario, no es una release oficial de Google ni está respaldado por la compañía; el mantenimiento depende de @xThr45hx.
- La variante G5 no está verificada en un Pixel 10 real: se desconoce si carga y genera texto coherente en ese hardware.
- La ruta int4 no funciona correctamente en Tensor G6 con el SDK actual (salidas incoherentes); solo int8 es fiable en esa generación.
- Los DGC no son portables entre generaciones: usar un build de otra generación puede provocar fallos en el decode o requerir fallback a CPU.
- El acceso está sujeto a gate de licencia Gemma: es necesario aceptar los Términos de Uso de Google y disponer de cuenta en Hugging Face.
- Restricciones de uso comercial: las impone la licencia Gemma; deben revisarse los términos antes de distribuir el modelo dentro de un producto.
- Capacidad limitada por el tamaño: 1B parámetros y 4096 tokens de contexto implican menor calidad en razonamiento complejo, matemáticas avanzadas y contextos largos que modelos mayores.
- Riesgo de alucinación inherente al modelo base; no se documentan evaluaciones de sesgo ni de seguridad específicas para este paquete.
- Idiomas soportados no documentados en la información disponible; no se debe asumir multilingüismo sin verificación.
- Dependencia de un runtime concreto (LiteRT-LM y dispatch GoogleTensor): la app oficial AI Edge Gallery no funciona en G3/G4, lo que limita las vías de despliegue.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/litert-community/Gemma3-1B-IT-Tensor-G4-NPU
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Checkpoint QAT de origen: https://huggingface.co/google/gemma-3-1b-it-qat-int4-unquantized
- LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- App Box para G3/G4: https://github.com/jegly/Box
- Discusión de verificación en Pixel 8 Pro: https://huggingface.co/litert-community/Gemma3-1B-IT-Tensor-NPU/discussions/2
