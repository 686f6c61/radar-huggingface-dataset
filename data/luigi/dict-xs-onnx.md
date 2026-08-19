# Luigi/dict-xs-onnx

## Resumen

`Luigi/dict-xs-onnx` es un modelo de generación de texto en formato ONNX cuantizado a int8, derivado de `ikhou/dict-xs`, un fine-tuning del modelo Qwen3-0.6B especializado en tareas de diccionario bilingüe y traducción. El modelo está optimizado para ejecutarse en CPU y WebAssembly mediante Transformers.js v4, lo que permite su despliegue directamente en navegadores o entornos Node.js sin necesidad de GPU.

La relevancia de este modelo radica en su enfoque práctico: ofrece capacidades de consulta de diccionario y traducción contextualizada en un paquete ligero (619 MB) que puede ejecutarse íntegramente en el cliente, eliminando la dependencia de servidores externos. Al estar basado en Qwen3-0.6B, hereda su arquitectura transformer con atención de grupo de consultas (GQA) y su tokenizador multilingüe, aunque el fine-tuning específico lo orienta a tareas de consulta léxica y traducción de expresiones con contexto.

El repositorio incluye los pesos ONNX autocontenidos, configuración y tokenizador con plantilla de chat integrada. El proceso de conversión fue verificado numéricamente contra el checkpoint original de PyTorch, con una diferencia máxima de logits de aproximadamente 5e-5 en fp32, lo que garantiza fidelidad en la conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-0.6B (transformer decoder-only con GroupQueryAttention) |
| Parametros totales | 0.6 mil millones (aprox.) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-0.6B, tipicamente 32768 tokens) |
| Tipos de cuantizacion | int8 dinámico (ONNX), q4f16 opcional via WebGPU |
| Idiomas soportados | no disponible (base Qwen3 es multilingüe, pero el fine-tuning se centra en diccionario bilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (model_quantized.onnx, 619 MB, autocontenido) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-0.6B, un transformer decoder-only con atención de grupo de consultas (GQA), que reduce el uso de memoria y mejora la eficiencia en inferencia en comparación con la atención multi-cabeza estándar. El fine-tuning `ikhou/dict-xs` se realizó sobre este base para especializarlo en tareas de diccionario y traducción de expresiones con contexto, utilizando el paso de entrenamiento 6568 de los pesos principales del repositorio.

La conversión a ONNX se realizó mediante un script propio (`scripts/export_onnx.py`) que genera un grafo de decoder fusionado con operadores contrib de GroupQueryAttention y RotaryEmbedding, con opset 18 y entrada de `position_ids`. Los pesos se cuantizaron a int8 dinámico, lo que reduce el tamaño y acelera la inferencia en CPU sin requerir datos de calibración estáticos. La verificación numérica contra el checkpoint de PyTorch mostró una diferencia máxima de logits de aproximadamente 5e-5 en fp32, y la decodificación greedy coincide con la referencia de Hugging Face dentro del ruido de int8.

## Capacidades

- Generación de texto orientada a consultas de diccionario: dado un término o expresión, produce definiciones, traducciones o explicaciones contextualizadas.
- Traducción bilingüe con contexto: acepta una expresión junto con contexto adicional para generar la traducción más apropiada.
- Soporte de chat multiuso: incluye plantilla de chat de Qwen3, permitiendo conversaciones con roles de sistema y usuario.
- Ejecución en navegador y Node.js: compatible con Transformers.js v4, funciona en CPU/WASM con dtype `q8` y opcionalmente en WebGPU con dtype `q4f16`.
- Inferencia autocontenida: el archivo ONNX no depende de datos externos, facilitando la distribución y el despliegue.
- Integración con pipelines estándar: se puede cargar directamente con `pipeline('text-generation', ...)` de Transformers.js.

## Casos de uso

- Diccionario integrado en aplicaciones web: un sitio de aprendizaje de idiomas puede cargar este modelo en el navegador del usuario para ofrecer definiciones y traducciones instantáneas sin latencia de red ni costes de servidor.
- Traducción contextualizada en editores de texto: un plugin de editor puede enviar la frase seleccionada junto con el párrafo completo como contexto, obteniendo traducciones más precisas que las de un diccionario estático.
- Asistente de vocabulario para estudiantes: una aplicación educativa puede generar ejemplos de uso, sinónimos y notas gramaticales para cada consulta, adaptándose al nivel del estudiante mediante el prompt del sistema.
- Herramienta de anotación léxica para investigadores: permite procesar corpus de texto y extraer definiciones o traducciones de términos especializados de forma automatizada, con la ventaja de ejecutarse localmente.
- Chatbot de referencia lingüística: integrar el modelo en un asistente conversacional que responda preguntas sobre significado, uso y traducción de expresiones, manteniendo el historial de la conversación.
- Aplicación offline de consulta de idiomas: al ser compatible con WASM, puede empaquetarse en una Progressive Web App (PWA) que funcione sin conexión, útil para viajeros o entornos con conectividad limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única verificación documentada es la comparación numérica con el checkpoint original de PyTorch: diferencia máxima de logits ≈ 5e-5 en fp32 y decodificación greedy coincidente con la referencia de Hugging Face dentro del ruido de int8. No hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks estándar para este fine-tuning específico.

## Requisitos de hardware

- VRAM: no requerida para el modo CPU/WASM; el modelo se ejecuta en memoria RAM. Con WebGPU, se necesita una GPU compatible con WebGPU y suficiente memoria para el dtype `q4f16` (aproximadamente 300-400 MB).
- RAM: aproximadamente 620 MB para cargar el modelo int8 en memoria, más overhead del runtime.
- GPU recomendadas: cualquier GPU compatible con WebGPU (por ejemplo, integradas Intel, AMD o NVIDIA modernas) para aceleración opcional; no se requiere GPU dedicada.
- CPU: cualquier CPU moderna con soporte WASM; la inferencia será más rápida en CPUs con instrucciones SIMD.
- Opciones de despliegue: Transformers.js v4 en navegador (WASM) o Node.js; también puede ejecutarse con ONNX Runtime en Python si se desea, aunque el repositorio está orientado a Transformers.js.
- Latencia y throughput: no se han publicado datos específicos; al ser un modelo de 0.6B cuantizado a int8, es esperable una generación de 10-50 tokens/segundo en CPUs modernas, dependiendo del hardware y el número de tokens generados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Uso principal |
|---|---|---|---|---|---|
| Luigi/dict-xs-onnx | 0.6B | no disponible (Qwen3 base: 32K) | ONNX int8 | Apache 2.0 | Diccionario/traducción en navegador |
| ikhou/dict-xs | 0.6B | no disponible (Qwen3 base: 32K) | Safetensors bf16 | Apache 2.0 | Diccionario/traducción (modelo original) |
| Qwen3-0.6B (base) | 0.6B | 32K | Safetensors | Apache 2.0 | Generación general, multilingüe |
| onnx-community/Qwen3-0.6B-ONNX | 0.6B | 32K | ONNX | Apache 2.0 | Generación general en ONNX |

La comparativa muestra que este modelo es una variante especializada y cuantizada del Qwen3-0.6B, con el mismo tamaño pero orientado a tareas de diccionario. Su ventaja principal es el formato ONNX int8 listo para Transformers.js, que facilita el despliegue en entornos web sin servidores dedicados.

## Limitaciones y advertencias

- El modelo es un fine-tuning de 0.6B, por lo que su capacidad general de razonamiento, generación de código o matemáticas es limitada en comparación con modelos más grandes.
- No se han publicado evaluaciones de sesgos ni de calidad de traducción para este modelo específico; los sesgos de Qwen3-0.6B pueden estar presentes.
- La especialización en diccionario puede reducir el rendimiento en tareas generales de generación de texto; no es un modelo de propósito general.
- El contexto máximo no está documentado en el repositorio; se asume el de Qwen3-0.6B (32768 tokens), pero no hay garantía de que el fine-tuning lo mantenga íntegro.
- Los idiomas soportados no están especificados; la base Qwen3 es multilingüe, pero el fine-tuning puede estar limitado a pares de idiomas concretos no documentados.
- La cuantización int8 dinámica introduce ruido en la salida; para aplicaciones que requieran precisión máxima, se recomienda usar el modelo original en bf16.
- El uso en producción requiere verificar la calidad de las traducciones/definiciones generadas, especialmente en dominios especializados o técnicos.
- No hay garantía de soporte o mantenimiento a largo plazo; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Luigi/dict-xs-onnx
- Modelo base: https://huggingface.co/ikhou/dict-xs
- Modelo base cuantizado (referencia): https://huggingface.co/ikhou/dict-xs (mismo enlace, incluye script de exportación)
- Demo en Space (mencionado en la model card): https://huggingface.co/spaces/ikhou/dict-xs-demo
- Transformers.js: https://huggingface.co/docs/transformers.js
- ONNX Model Zoo: https://github.com/onnx/models
- ONNX Runtime Models: https://onnxruntime.ai/models
