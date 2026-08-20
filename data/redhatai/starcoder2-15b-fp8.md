# RedHatAI/starcoder2-15b-FP8

## Resumen

RedHatAI/starcoder2-15b-FP8 es una versión cuantizada del modelo de generación de código StarCoder2-15B, desarrollada por Neural Magic y publicada por Red Hat AI. El objetivo principal es reducir el consumo de memoria y acelerar la inferencia en producción mediante cuantización de pesos y activaciones a FP8, manteniendo un rendimiento prácticamente idéntico al original. La cuantización reduce el tamaño del modelo de 16 bits a 8 bits por parámetro, lo que implica aproximadamente un 50% menos de memoria y espacio en disco. El modelo está optimizado para su uso con vLLM (>=0.5.2) y es compatible con la API de Hugging Face para despliegue en entornos de inferencia.

Este modelo es relevante para desarrolladores que necesitan ejecutar un modelo de código de 15B parámetros en GPUs con recursos limitados, sin sacrificar la calidad de las respuestas. Su licencia bigcode-openrail-m permite uso comercial con ciertas restricciones, lo que facilita su adopción en aplicaciones empresariales. La cuantización fue realizada con AutoFP8 y LLM Compressor, utilizando 512 secuencias de UltraChat para calibración.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (StarCoder2-15B) |
| Parametros totales | 15.957.889.024 |
| Parametros activos | 15.957.889.024 (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base StarCoder2-15B soporta 16K tokens, pero no se especifica en la model card) |
| Tipos de cuantizacion | FP8 (pesos y activaciones, simétrica por tensor) |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | bigcode-openrail-m |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una versión cuantizada de StarCoder2-15B, un modelo de lenguaje de código abierto de la familia StarCoder2. La arquitectura base es un transformer decoder-only con 15.000 millones de parámetros, entrenado con un dataset masivo de código y texto técnico (The Stack v2). El modelo original fue desarrollado por BigCode y luego cuantizado por Neural Magic en colaboración con Red Hat.

La cuantización se realizó con AutoFP8 y LLM Compressor, aplicando una cuantización simétrica por tensor (tensor-wise) sobre los pesos y las activaciones de los operadores lineales dentro de los bloques transformer. Se usaron 512 secuencias de UltraChat para calibración. Esta técnica reduce el tamaño del modelo a la mitad, pasando de 16 bits a 8 bits por parámetro, lo que permite una inferencia más rápida y con menor consumo de VRAM. No se aplicó ningún entrenamiento posterior; la cuantización es una conversión directa que preserva la funcionalidad del modelo original.

## Capacidades

- Generación de código en múltiples lenguajes de programación (Python, Java, C++, JavaScript, etc.), gracias al entrenamiento del modelo base en The Stack v2.
- Autocompletado de código y generación de funciones completas a partir de comentarios o descripciones.
- Soporte para razonamiento lógico y resolución de problemas de programación, aunque el modelo está enfocado principalmente a tareas de código.
- Capacidad de procesamiento de texto técnico y documentación de código.
- Compatibilidad con vLLM para inferencia de alta eficiencia y despliegue en producción.
- No incluye soporte explícito para tool calling o agentes en la documentación disponible.

## Casos de uso

- Autocompletado de código en IDE: el modelo puede integrarse en editores como VS Code o JetBrains para sugerir líneas o bloques de código en tiempo real, reduciendo el tiempo de escritura.
- Generación de documentación técnica: dado un fragmento de código, el modelo puede generar explicaciones, comentarios y documentación de API.
- Refactorización asistida: puede proponer alternativas de código más eficientes o legibles, aunque no tiene un modo de razonamiento explícito.
- Creación de asistentes de programación: puede ser el núcleo de un chat especializado en preguntas y respuestas sobre código, con la ventaja de tener un tamaño reducido para desplegar en GPU de consumo.
- Generación de pruebas unitarias: a partir de una función, puede generar casos de prueba básicos.
- Traducción entre lenguajes de programación: puede convertir código de un lenguaje a otro, aunque la precisión puede variar según el par de lenguajes.

## Benchmarks y rendimiento

El modelo fue evaluado en HumanEval+, un benchmark que mide la capacidad de generar código correcto funcionalmente. La siguiente tabla compara el modelo cuantizado con el modelo original sin cuantizar:

| Modelo | HumanEval+ (pass@1) |
|---|---|
| starcoder2-15b-FP8 (cuantizado) | 50.70 |
| starcoder2-15b (sin cuantizar) | 50.25 |

La diferencia de rendimiento es mínima (0.45 puntos), lo que demuestra que la cuantización FP8 apenas degrada la calidad de las respuestas. No se han publicado otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos en FP8 ocupan aproximadamente 16 GB (15.9B parámetros × 8 bits). Además, se necesita memoria para activaciones y KV cache, por lo que se recomienda al menos 20 GB de VRAM para una ventana de contexto razonable.
- GPU recomendadas: GPU con 20 GB o más de VRAM, como NVIDIA RTX 4090 (24 GB), A100 40GB, o H100 (80 GB). En GPUs de menor VRAM (16 GB) podría funcionar con ventanas de contexto cortas.
- Despliegue: vLLM >= 0.5.2 es el backend recomendado, también compatible con Hugging Face Inference Endpoints y TGI (Text Generation Inference).
- Latencia y throughput: no se proporcionan datos exactos, pero al ser FP8 se espera un throughput mayor que el modelo de 16 bits, especialmente con batchs grandes y vLLM.

## Comparativa con modelos similares

El modelo se compara principalmente con su versión sin cuantizar y con otras cuantizaciones de modelos de código de tamaño similar. No se dispone de datos de benchmarks de otros modelos comparables en la información proporcionada.

| Modelo | Parámetros | Cuantización | HumanEval+ | Contexto | Licencia |
|-------|------------|--------------|------------|----------|----------|
| starcoder2-15b-FP8 | 15.9B | FP8 | 50.70 | no disponible | bigcode-openrail-m |
| starcoder2-15b | 15.9B | FP16/BF16 | 50.25 | 16K (no confirmado) | bigcode-openrail-m |
| starcoder2-15b-quantized.w8a8 | 15.9B | W8A8 | no disponible | no disponible | bigcode-openrail-m |

No hay información suficiente para comparar con modelos de otros desarrolladores (como CodeLlama o DeepSeek-Coder) en esta ficha.

## Limitaciones y advertencias

- La model card indica que el modelo está pensado para uso en inglés, por lo que el rendimiento en otros idiomas puede ser degradado o no estar soportado.
- No se recomienda su uso en contextos legales o regulatorios, como se indica en la sección "Out-of-scope".
- La cuantización FP8 puede introducir errores numéricos en tareas de precisión muy alta, aunque el benchmark HumanEval+ no muestra una degradación significativa.
- El modelo puede generar código incorrecto o inseguro, por lo que debe supervisarse en entornos de producción.
- No se documenta soporte para tool calling o agentes, por lo que si se necesita esa funcionalidad, habría que añadir capas adicionales.
- La licencia bigcode-openrail-m permite uso comercial, pero es necesario revisar sus condiciones específicas (por ejemplo, restricciones sobre uso militar).

## Enlaces

- [Hugging Face - RedHatAI/starcoder2-15b-FP8](https://huggingface.co/RedHatAI/starcoder2-15b-FP8)
- [Friendli.ai - RedHatAI/starcoder2-15b-FP8](https://friendli.ai/models/RedHatAI/starcoder2-15b-FP8)
- [Hugging Face - RedHatAI/starcoder2-15b-quantized.w8a8](https://huggingface.co/RedHatAI/starcoder2-15b-quantized.w8a8)
- [Hugging Face - BigCode/starcoder2-15b (modelo original)](https://huggingface.co/bigcode/starcoder2-15b)
