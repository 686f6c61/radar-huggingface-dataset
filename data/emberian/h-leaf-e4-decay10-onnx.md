# emberian/h-leaf-e4-decay10-onnx

## Resumen

El modelo `emberian/h-leaf-e4-decay10-onnx` es una exportación a ONNX de un checkpoint de Falcon-H1-Tiny, un modelo de lenguaje pequeño de 90 millones de parámetros desarrollado por TII (Technology Innovation Institute) y adaptado por el proyecto `h` de emberian. Se distribuye como un archivo ONNX optimizado para su uso con Transformers.js, la biblioteca de Hugging Face que permite ejecutar modelos directamente en el navegador o en Node.js mediante WebGPU o WebAssembly.

El modelo se deriva del checkpoint base `tiiuae/Falcon-H1-Tiny-90M-Base`, pero ha sido entrenado adicionalmente durante 4 épocas sobre un corpus propio de 1.498 mil millones de tokens (corpus-v1) con una tasa de aprendizaje constante de 1e-4, seguido de un enfriamiento sobre 37,4 millones de tokens. El resultado es un modelo de generación de texto compacto, con una pérdida de validación de 3.136 en secuencias de 512 tokens. Su relevancia radica en que ofrece una alternativa ligera y ejecutable en entornos con recursos muy limitados, como navegadores o dispositivos edge, manteniendo la compatibilidad con el ecosistema ONNX y Transformers.js.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Falcon-H1 (decoder transformer, variante Tiny de 90M) |
| Parametros totales | 91 131 072 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 512 tokens) |
| Tipos de cuantizacion | FP32 (model.onnx), 8-bit (MatMulNBits + block-quantized embedding), 4-bit (degradado, solo comparativo) |
| Idiomas soportados | no disponible |
| Licencia | Falcon-LLM License (falcon-llm-license) |
| Formato de pesos | ONNX (model.onnx, model_quantized.onnx) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Falcon-H1-Tiny, un transformer decoder con 90 millones de parámetros diseñado por TII. El proyecto `h` de emberian lo utiliza como punto de partida para experimentos de entrenamiento con datasets propios. El checkpoint exportado corresponde al entrenamiento final del tronco `trunk-wsd-lr1e-4-seed0`, que se entrenó durante 4 épocas sobre el corpus `corpus-v1` (1.498 mil millones de tokens) con una tasa de aprendizaje constante de 1e-4. Posteriormente se aplicó un enfriamiento (decay) sobre 37,4 millones de tokens adicionales. La validación reportada es de 3.136 en secuencias de 512 tokens.

El proceso de exportación a ONNX se realizó con `export_onnx.py` del repositorio `h`, generando dos archivos: `model.onnx` en FP32 y `model_quantized.onnx` con cuantización de 8 bits (MatMulNBits y embedding cuantizado por bloques). La cuantización de 8 bits se describe como "casi sin pérdida" para este modelo, mientras que la de 4 bits degrada significativamente su rendimiento, por lo que se incluye solo con fines comparativos. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Generación de texto: modelo causal de lenguaje capaz de completar secuencias y generar texto coherente en tareas simples.
- Ejecución en navegador: gracias a Transformers.js y ONNX, puede inferir en clientes web con WebGPU o WebAssembly.
- Compatibilidad multiplataforma: al estar en formato ONNX, es portable a múltiples runtimes (ONNX Runtime, WebGPU, etc.).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo thinking. Al ser un modelo de 90M, sus capacidades cognitivas son limitadas.

## Casos de uso

- Prototipado rápido en el navegador: los desarrolladores pueden integrar el modelo en una página web usando Transformers.js y WebGPU para demostrar generación de texto sin necesidad de servidores dedicados.
- Aplicaciones educativas: sirve como ejemplo práctico de cómo exportar y cuantizar un modelo pequeño a ONNX y ejecutarlo en clientes ligeros.
- Experimentación con modelos pequeños: investigadores pueden estudiar el comportamiento de un modelo de 90M entrenado con un corpus específico, comparándolo con el checkpoint base.
- Asistente de escritura básico: para sugerencias de palabras o frases cortas en aplicaciones con restricciones de memoria y latencia.
- Generación de texto en dispositivos edge: su tamaño reducido permite desplegarlo en móviles o microcontroladores con suficiente memoria.
- Validación de pipelines ONNX: útil para probar la cadena de exportación, cuantización y despliegue en entornos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada es la pérdida de validación (3.136) en secuencias de 512 tokens, pero no se ofrecen comparaciones con otros modelos en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 91M de parámetros, en FP32 ocupa aproximadamente 364 MB; en 8-bit, alrededor de 91 MB. Cabe en cualquier GPU moderna y en muchas CPUs.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, GTX 1050, RTX 2060, integradas). No requiere GPU de alta gama.
- Compatibilidad con consumer GPU: sí, incluso en iGPU o tarjetas antiguas.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), Transformers.js (WebGPU/WASM), Node.js con ONNX Runtime Web. No se mencionan vLLM, llama.cpp ni Ollama, pero al ser ONNX podría adaptarse a otros runtimes.
- Latencia y throughput: no disponibles. En un modelo tan pequeño, la latencia en CPU moderna suele ser inferior a 10 ms por token, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| emberian/h-leaf-e4-decay10-onnx | 91M | no disponible (512 en entrenamiento) | Falcon-LLM | ONNX | Exportación cuantizada para web |
| tiiuae/Falcon-H1-Tiny-90M-Base | 90M | no disponible | Falcon-LLM | safetensors | Modelo base original de TII |
| TinyLlama-1.1B | 1.1B | 2048 | Apache 2.0 | safetensors/GGUF | Mucho mayor, pero más capaz |

La comparación directa es difícil por la diferencia de tamaño. El modelo de emberian es una variante fina del Falcon-H1-Tiny, con la ventaja de estar en ONNX para despliegue web. TinyLlama es un modelo más grande y con mejor rendimiento, pero requiere más recursos.

## Limitaciones y advertencias

- Modelo muy pequeño (90M): su capacidad de razonamiento, comprensión y generación de texto es limitada en comparación con modelos de cientos de millones o miles de millones de parámetros.
- Riesgo de alucinaciones: al igual que otros modelos generativos, puede producir información falsa o incoherente, especialmente en tareas complejas.
- Contexto limitado: aunque no se especifica el contexto máximo del modelo base, el entrenamiento se realizó con secuencias de 512 tokens, lo que limita la coherencia en textos largos.
- Idiomas: no se dispone de información sobre los idiomas soportados; probablemente el corpus de entrenamiento sea predominantemente inglés.
- Licencia restrictiva: la Falcon-LLM License impone condiciones de uso aceptable y restricciones de redistribución. Es necesario revisar los términos completos antes de usar el modelo en producción comercial.
- Cuantización de 4 bits: la versión de 4 bits degrada notablemente el rendimiento, por lo que no se recomienda su uso.
- Soporte limitado: al ser un proyecto personal de emberian, no hay garantías de mantenimiento ni documentación extensa.

## Enlaces

- Repositorio del modelo: https://huggingface.co/emberian/h-leaf-e4-decay10-onnx
- Proyecto `h` en GitHub: https://github.com/emberian/h
- Modelo base: https://huggingface.co/tiiuae/Falcon-H1-Tiny-90M-Base
- Licencia Falcon-LLM: https://falconllm.tii.ae/falcon-terms-and-conditions.html
