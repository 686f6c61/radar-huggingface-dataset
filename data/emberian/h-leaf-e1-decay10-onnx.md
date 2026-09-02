# emberian/h-leaf-e1-decay10-onnx

## Resumen
El modelo `emberian/h-leaf-e1-decay10-onnx` es una exportación a formato ONNX de un checkpoint de `Falcon-H1-Tiny-90M-Base`, un modelo de lenguaje pequeño de la familia Falcon-H1 desarrollado por TII. El autor, emberian, lo ha generado como parte del proyecto `h` (github.com/emberian/h) para permitir su ejecución en navegadores y entornos de bajo consumo mediante la librería `transformers.js` 4.x y WebGPU. El checkpoint fuente fue entrenado sobre 374,6 millones de tokens del corpus-v1 con una tasa de aprendizaje constante de 1e-4, seguido de un enfriamiento de 37,4 millones de tokens, alcanzando una pérdida de validación de 3,234 en secuencias de 512 tokens.

Con 91.131.072 parámetros, este modelo es extremadamente reducido, lo que lo hace adecuado para prototipado, experimentación educativa y despliegue en dispositivos con recursos limitados. Se distribuye en dos variantes ONNX: una en precisión fp32 y otra cuantizada a 8 bits (MatMulNBits + embedding bloque-cuantizado), esta última descrita como "near-lossless" para este tamaño de modelo. La licencia es la Falcon-LLM License, que impone restricciones de uso aceptable.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Falcon-H1-Tiny (detalles de arquitectura no disponibles) |
| Parametros totales | 91.131.072 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (validación con secuencias de 512 tokens) |
| Tipos de cuantizacion | fp32, 8-bit (q8), 4-bit (solo comparación, degrada el modelo) |
| Idiomas soportados | no disponible |
| Licencia | Falcon-LLM License (https://falconllm.tii.ae/falcon-terms-and-conditions.html) |
| Formato de pesos | ONNX (model.onnx, model_quantized.onnx) |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de `Falcon-H1-Tiny-90M-Base`, un modelo de lenguaje causal de tamaño pequeño perteneciente a la familia Falcon-H1. No se proporcionan detalles estructurales concretos (número de capas, dimensiones de atención, etc.) en la información disponible. El entrenamiento del checkpoint original se realizó sobre 374,6 millones de tokens del corpus-v1, con una tasa de aprendizaje constante de 1e-4 y una etapa de enfriamiento adicional de 37,4 millones de tokens (denominada `leaf-e1-decay10`). La pérdida de validación reportada es 3,234 sobre secuencias de 512 tokens. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación.

La exportación a ONNX se realizó con el script `site/export/export_onnx.py` del proyecto `h`, usando PyTorch 2.13.0 y ONNX Runtime 1.29.0, con opset 18. La cuantización de 8 bits emplea MatMulNBits y embedding bloque-cuantizado, y se describe como prácticamente sin pérdida de calidad. La variante de 4 bits está disponible solo con fines comparativos, ya que la cuantización round-to-nearest degrada significativamente el rendimiento de un modelo tan pequeño.

## Capacidades
- Generación de texto causal (autoregresiva) a partir de un prompt.
- Ejecución en navegador mediante `transformers.js` 4.x con backend WebGPU (ejemplo de uso: `dtype: "q8", device: "webgpu"`).
- Inferencia eficiente en dispositivos de bajos recursos gracias a la cuantización de 8 bits.
- Exportación ONNX estándar, compatible con ONNX Runtime y otros runtimes que soporten opset 18.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso
- Prototipado rápido de aplicaciones de generación de texto en el navegador: al ser un modelo pequeño y estar disponible en formato ONNX cuantizado, se puede integrar directamente en páginas web con WebGPU para demos interactivas sin necesidad de servidor.
- Experimentación educativa en NLP: su tamaño reducido permite estudiar el comportamiento de un modelo causal, el efecto de la cuantización y las técnicas de exportación sin requerir infraestructura de alto rendimiento.
- Pruebas de integración de pipelines ONNX: sirve como banco de pruebas para validar herramientas de conversión, optimización y despliegue de modelos ONNX en entornos con restricciones de memoria.
- Generación de texto en dispositivos edge (Raspberry Pi, teléfonos de gama baja): con ~91 MB en fp32 y ~91 MB en 8 bits (estimado), puede ejecutarse en CPU o GPU integrada para tareas simples como completado de frases o generación de textos cortos.
- Evaluación de técnicas de cuantización: la comparación entre fp32, 8-bit y 4-bit permite medir el impacto de la pérdida de precisión en un modelo pequeño, útil para decidir estrategias de despliegue.
- Desarrollo de asistentes conversacionales sencillos sin conexión: aunque sus capacidades son limitadas, puede mantener conversaciones cortas y contextualmente básicas, lo que lo hace adecuado para entornos sin conectividad.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El único dato cuantitativo es la pérdida de validación de 3,234 sobre secuencias de 512 tokens, que no es comparable con métricas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware
- VRAM estimada: para fp32, ~365 MB (91,1M parámetros × 4 bytes); para 8-bit, ~91 MB. Estos valores son orientativos y no incluyen memoria para activaciones ni overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. En la práctica, el modelo puede ejecutarse en CPU sin problemas, dado su tamaño.
- Compatible con GPUs de consumo como la serie RTX 20/30/40, y también con GPUs integradas (Intel UHD, AMD Radeon Vega) cuando se usa WebGPU.
- Opciones de despliegue: `transformers.js` con WebGPU, ONNX Runtime Web, ONNX Runtime (Python/C++), y cualquier runtime que soporte ONNX opset 18.
- Latencia y throughput: no se proporcionan mediciones oficiales. En una GPU moderna, se esperan tiempos de generación de decenas de milisegundos por token; en CPU, del orden de 100-200 ms por token, dependiendo del hardware.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Formato | Licencia |
|---|---|---|---|---|
| emberian/h-leaf-e1-decay10-onnx | 91,1M | no disponible | ONNX | Falcon-LLM |
| tiiuae/Falcon-H1-Tiny-90M-Base | 90M | no disponible | safetensors (original) | Falcon-LLM |
| TinyLlama-1.1B | 1,1B | 2048 | safetensors, GGUF | Apache 2.0 |

No se dispone de benchmarks comparativos entre estos modelos. El modelo aquí descrito es una conversión del modelo base Falcon-H1-Tiny, por lo que su rendimiento es equivalente al original, pero en formato ONNX optimizado para despliegue en navegador. Otros modelos pequeños como TinyLlama ofrecen mayor capacidad pero también mayor huella de memoria.

## Limitaciones y advertencias
- Tamaño muy reducido (91M parámetros) que limita severamente la capacidad de razonamiento, coherencia y conocimiento general. Es probable que genere respuestas incoherentes o alucinadas en tareas complejas.
- La longitud de contexto no está documentada; la validación se realizó con 512 tokens, por lo que no se recomienda usarlo con entradas más largas sin verificar.
- La cuantización de 4 bits degrada notablemente la calidad; solo debe usarse con fines de comparación.
- La licencia Falcon-LLM incluye una política de uso aceptable que puede restringir aplicaciones comerciales o de alto riesgo. Es obligatorio revisar los términos completos antes de su uso en producción.
- No se especifican los idiomas soportados; el modelo base Falcon-H1 probablemente fue entrenado con datos multilingües, pero no hay confirmación oficial para esta variante.
- No se ha evaluado su comportamiento en tareas de seguridad, sesgos o toxicidad; el entrenamiento con un corpus reducido puede exacerbar estos problemas.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/emberian/h-leaf-e1-decay10-onnx
- Proyecto `h` en GitHub: https://github.com/emberian/h
- Licencia Falcon-LLM: https://falconllm.tii.ae/falcon-terms-and-conditions.html
- Modelo base: https://huggingface.co/tiiuae/Falcon-H1-Tiny-90M-Base
- ONNX Model Zoo (referencia general): https://github.com/onnx/models
