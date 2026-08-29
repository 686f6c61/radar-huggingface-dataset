# dkeviv/Qwen3.5-0.8B-Text-ONNX-WebGPU-QDQ-bucket

## Resumen

Este repositorio contiene una conversión del modelo Qwen3.5-0.8B-Text a formato ONNX, específicamente adaptada para su ejecución en WebGPU mediante la reescritura de dos operadores personalizados que impedían la ejecución estándar en navegadores. El autor, dkeviv, parte del modelo `onnx-community/Qwen3.5-0.8B-Text-ONNX` y mantiene los pesos cuantizados `q4f16` (archivo externo de aproximadamente 469 MB), sustituyendo `GatherBlockQuantized` y `CausalConvWithState` por operadores ONNX estándar. El resultado es un modelo de 0.8B parámetros, con licencia Apache-2.0, pensado para inferencia local en el navegador o en entornos que soporten WebGPU.

La relevancia de este derivado radica en que permite ejecutar un modelo de razonamiento de la serie Qwen3.5 directamente en clientes web sin necesidad de servidor, aprovechando la aceleración por GPU del navegador. Sin embargo, al ser una adaptación técnica, no se proporcionan especificaciones detalladas del modelo original (arquitectura, contexto, datos de entrenamiento) en la información disponible. Es una pieza orientada a desarrolladores que necesitan desplegar LLMs en entornos de baja latencia y sin dependencias de backend.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Qwen3.5-0.8B-Text) |
| Parametros totales | 0.8B (según nombre del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4f16 (pesos empaquetados) |
| Idiomas soportados | no disponible (se infiere multilingüe por la serie Qwen, sin confirmar) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivo externo de ~469 MB) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo original. Por el nombre y la serie, se trata de un modelo de lenguaje de 0.8B parámetros de la familia Qwen3.5, que según referencias externas (Qualcomm AI Hub) presenta capacidades mejoradas de razonamiento e instrucción frente a Qwen3. El repositorio actual se centra en la conversión a ONNX y la adaptación de operadores para WebGPU, no en el proceso de entrenamiento. No se mencionan datos de entrenamiento, número de tokens, ni técnicas como RLHF o DPO.

La innovación técnica de este derivado es la reescritura de dos operadores personalizados: `GatherBlockQuantized` (búsqueda de embeddings) se expresa como Gather estándar, desempaquetado de nibbles y dequantización; y `CausalConvWithState` se implementa mediante concatenación de estado, convolución causal depthwise y SiLU con operadores ONNX estándar. Esto permite la compatibilidad con WebGPU, que no soporta operadores personalizados arbitrarios.

## Capacidades

- Generación de texto y razonamiento: al ser un modelo de la serie Qwen3.5, se espera capacidad de razonamiento y seguimiento de instrucciones, aunque no hay benchmarks específicos en este repositorio.
- Ejecución en navegador: gracias a la adaptación WebGPU, puede ejecutarse en clientes web con aceleración por GPU.
- Cuantización q4f16: pesos empaquetados que reducen el uso de memoria frente a precisión completa.
- Compatibilidad con ONNX Runtime: el modelo está diseñado para `onnxruntime`, lo que facilita su integración en aplicaciones que usen esta librería.
- No se confirma soporte de tool calling, agentes, visión o audio en la información disponible.

## Casos de uso

- Inferencia local en navegador: el modelo puede integrarse en aplicaciones web que necesiten un LLM sin backend, por ejemplo, asistentes de documentación o generación de texto en el cliente. La adaptación WebGPU permite usar la GPU del dispositivo.
- Prototipado rápido de aplicaciones con ONNX Runtime: desarrolladores que ya usan ONNX pueden cargar este modelo con pocas líneas de código y probar su comportamiento en entornos de escritorio o web.
- Despliegue en dispositivos edge: con 0.8B parámetros y cuantización q4f16, el modelo cabe en dispositivos con recursos limitados, como portátiles o mini-PCs, siempre que el runtime soporte los operadores estándar.
- Aplicaciones de chat o asistencia sin conexión: al ser un modelo pequeño, puede ejecutarse en equipos sin conexión a internet, aunque la calidad de respuesta será inferior a modelos más grandes.
- Evaluación de compatibilidad WebGPU: sirve como banco de pruebas para verificar si un navegador o runtime concreto soporta la ejecución de modelos ONNX con estos operadores reescritos.
- Integración en aplicaciones de escritorio: el repositorio de referencia `MushroomFleet/Qwen35-08B-onnx-desktop` muestra cómo empaquetar el modelo en un instalador MSI para Windows, descargando los pesos en el primer arranque.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos en el repositorio ni en las referencias encontradas.

## Requisitos de hardware

- VRAM estimada: para un modelo de 0.8B con cuantización q4f16, el uso de memoria es reducido; el archivo de pesos externo ocupa ~469 MB, por lo que se puede ejecutar en GPUs con 2 GB o menos, aunque no se especifica el consumo exacto en tiempo de inferencia.
- GPU recomendadas: cualquier GPU compatible con WebGPU (por ejemplo, integradas modernas de Intel, AMD o NVIDIA) o GPUs discretas con soporte de ONNX Runtime. No se indican modelos concretos.
- Compatibilidad con consumer GPU: sí, es probable que funcione en GPUs de gama baja y media, pero se recomienda validar la combinación navegador/runtime antes de producción.
- Opciones de despliegue: ONNX Runtime Web (para navegador), ONNX Runtime con ejecución local, o integración en aplicaciones de escritorio mediante ONNX Runtime. No se mencionan vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría. El modelo original Qwen3.5-0.8B podría compararse con otros LLMs pequeños como Phi-3-mini o Gemma-2-2B, pero no hay información suficiente en este repositorio para establecer una comparación rigurosa. Se recomienda consultar la documentación oficial de Qwen3.5 para obtener especificaciones y benchmarks.

## Limitaciones y advertencias

- Derivado técnico sin documentación de rendimiento: no hay garantías de calidad de generación ni de comportamiento en tareas específicas.
- Compatibilidad WebGPU no universal: la reescritura de operadores puede no funcionar en todos los navegadores o versiones de ONNX Runtime Web; se debe validar en el entorno objetivo.
- Sin información sobre sesgos o alucinaciones: al no haber evaluación publicada, se desconoce el riesgo de respuestas incorrectas o sesgadas.
- Licencia Apache-2.0: permite uso comercial, pero se debe mantener la atribución y el aviso de licencia del modelo original.
- Modelo pequeño: con 0.8B parámetros, la calidad de razonamiento y generación será limitada en comparación con modelos de mayor tamaño; no apto para tareas complejas sin evaluación previa.
- Sin datos de contexto: se desconoce la longitud máxima de entrada, lo que puede provocar errores si se supera el límite no documentado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dkeviv/Qwen3.5-0.8B-Text-ONNX-WebGPU-QDQ-bucket
- Modelo fuente: https://huggingface.co/onnx-community/Qwen3.5-0.8B-Text-ONNX
- Referencia de escritorio: https://github.com/MushroomFleet/Qwen35-08B-onnx-desktop
- Página en ModelScope: https://www.modelscope.cn/models/onnx-community/Qwen3.5-0.8B-ONNX
- Ficha en Qualcomm AI Hub: https://aihub.qualcomm.com/mobile/models/qwen3_5_0_8b
