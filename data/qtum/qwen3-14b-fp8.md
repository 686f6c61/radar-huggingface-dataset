# qtum/Qwen3-14B-FP8

## Resumen

El modelo `qtum/Qwen3-14B-FP8` es una cuantización en punto flotante de 8 bits (FP8, esquema W8A8 dinámico) del modelo denso `Qwen/Qwen3-14B`, realizada por el equipo de qtum mediante la herramienta `llm-compressor`. El resultado es un checkpoint en formato `compressed-tensors` (safetensors) diseñado para servir de forma eficiente con motores de inferencia como vLLM o SGLang, reduciendo a aproximadamente la mitad el uso de memoria respecto a la versión bf16 y aumentando el rendimiento, manteniendo una calidad cercana a la del modelo original. El modelo base, Qwen3-14B, es un transformer denso de 14.768 millones de parámetros con una ventana de contexto de 131.072 tokens, entrenado principalmente en inglés y chino, y destaca por su capacidad de razonamiento con modo "thinking" opcional y soporte para herramientas.

Esta ficha es relevante porque la cuantización FP8 es actualmente la opción preferida para desplegar modelos de 14B en GPUs Hopper y Blackwell, ya que permite ejecutar inferencias con menor huella de VRAM y mayor throughput sin cambios en la API ni en el prompt format. El checkpoint es un reemplazo directo del modelo base en entornos que soporten `compressed-tensors`, lo que facilita su adopción en pipelines de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-14B) |
| Parametros totales | 14.768.307.200 (14,8 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens (heredada del modelo base) |
| Tipos de cuantizacion | FP8 (W8A8 dinámico) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | Safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado desde cero; es una cuantización del checkpoint `Qwen/Qwen3-14B` en precisión FP8 con escalas de activación dinámicas (W8A8). El proceso se realizó con `llm-compressor`, que convierte los pesos a formato `compressed-tensors` manteniendo la estructura del transformer original. El esquema FP8 dinámico calcula las escalas de activación en tiempo de ejecución, lo que evita la necesidad de calibración con datos representativos y conserva la precisión en la mayoría de tareas. El modelo base, Qwen3-14B, fue entrenado por Alibaba con una arquitectura transformer densa, atención completa y un contexto de 131K tokens, con datos multilingües (principalmente inglés y chino) y un pipeline que incluye fases de preentrenamiento, fine-tuning supervisado y optimización con preferencias humanas. La cuantización no modifica los pesos más allá de la reducción de precisión, por lo que el comportamiento del modelo permanece prácticamente idéntico al original.

## Capacidades

- Generación de texto conversacional y completado de instrucciones en inglés y chino.
- Razonamiento multi-paso con modo "thinking" opcional (heredado del modelo base Qwen3-14B), que permite activar o desactivar la generación de cadenas de pensamiento explícitas.
- Soporte para tool calling y uso de agentes, según las capacidades del modelo base (documentadas en la familia Qwen3).
- Comprensión de contexto largo (hasta 131K tokens), adecuada para documentos extensos o conversaciones prolongadas.
- Capacidades de generación de código y resolución de problemas matemáticos, propias del modelo base.
- Multilingüe limitado a inglés y chino según la model card, aunque el modelo base puede tener cierto grado de transferencia a otros idiomas.

## Casos de uso

- Despliegue de chatbots de atención al cliente en producción: gracias al contexto de 131K tokens, puede mantener conversaciones multi-turno extensas sin perder el hilo, y la cuantización FP8 permite servirlo con menos GPUs que la versión bf16, reduciendo costes operativos.
- Asistentes de programación integrados en IDEs o pipelines CI/CD: el modelo base tiene buenas capacidades de código y soporte de tool calling, por lo que puede generar, revisar o completar fragmentos de código, y la versión FP8 es adecuada para entornos con restricciones de VRAM.
- Agentes autónomos con razonamiento multi-paso: el modo "thinking" permite al modelo planificar y ejecutar tareas complejas (por ejemplo, búsqueda de información, cálculo, uso de APIs) mediante llamadas a herramientas, y el formato `compressed-tensors` facilita su integración en frameworks de agentes como LangChain o LlamaIndex.
- Análisis y resumen de documentos largos: con 131K tokens de contexto, puede procesar informes, artículos o contratos completos en una sola pasada, generando resúmenes o extrayendo datos clave.
- Generación de contenido bilingüe (inglés-chino): útil para localización, traducción asistida o redacción de materiales en ambos idiomas, aprovechando el entrenamiento específico del modelo base.
- Inferencia de alto rendimiento en entornos con GPUs Hopper/Blackwell: al ser FP8 nativo, se puede servir con vLLM o SGLang obteniendo mayor throughput que con bf16, ideal para APIs de texto con alta demanda concurrente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye métricas comparativas entre la versión FP8 y el modelo base bf16, aunque se afirma que la calidad es "casi sin pérdidas" (near lossless). Se recomienda consultar los benchmarks oficiales del modelo base Qwen3-14B para una referencia de rendimiento cualitativo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB con pesos FP8 (14,8 GB de pesos + overhead de activaciones y KV cache). En la práctica, se recomienda al menos 24 GB para servir con contexto completo de 131K tokens.
- GPUs recomendadas: arquitecturas Hopper (H100, H200) y Blackwell (B200, GB200) por su soporte nativo de FP8. También puede ejecutarse en GPUs Ampere (A100) mediante emulación FP8, aunque con menor eficiencia.
- En GPUs consumer: no se recomienda para producción debido a la falta de soporte FP8 nativo en RTX 30/40 series; podría ejecutarse con conversión a otros formatos, pero pierde la ventaja de velocidad.
- Opciones de despliegue: vLLM (comando `vllm serve qtum/Qwen3-14B-FP8`) y SGLang, ambos compatibles con `compressed-tensors`. También puede convertirse a GGUF para usar con llama.cpp u Ollama, aunque no es el formato nativo.
- Latencia y throughput: no se dispone de mediciones específicas; en general, FP8 duplica el throughput respecto a bf16 en GPUs Hopper, con una latencia por token ligeramente inferior.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Formato | Licencia |
|---|---|---|---|---|---|
| qtum/Qwen3-14B-FP8 | 14,8 B | 131K | FP8 W8A8 dinámico | compressed-tensors | Apache-2.0 |
| Qwen/Qwen3-14B (base) | 14,8 B | 131K | bf16 | safetensors | Apache-2.0 |
| nvidia/Qwen3-14B-FP8 | 14,8 B | 131K | FP8 (posiblemente estático) | compressed-tensors | Apache-2.0 |
| Qwen/Qwen3-14B-FP8 (oficial) | 14,8 B | 131K | FP8 | compressed-tensors | Apache-2.0 |

Las tres variantes FP8 son equivalentes en arquitectura y tamaño; la diferencia principal radica en el método de cuantización (dinámico vs estático) y el autor del checkpoint. La versión de qtum usa escalas dinámicas, lo que simplifica el despliegue sin calibración previa. Todas mantienen la licencia Apache-2.0, permitiendo uso comercial sin restricciones adicionales.

## Limitaciones y advertencias

- Sesgos y alucinaciones: el modelo base puede presentar sesgos derivados de sus datos de entrenamiento y tendencia a generar información plausible pero incorrecta, especialmente en tareas de razonamiento complejo. La cuantización FP8 no corrige estos problemas.
- Limitaciones de idioma: la model card declara solo inglés y chino; el rendimiento en otros idiomas puede ser significativamente inferior.
- Precisión numérica: aunque se considera "near lossless", la cuantización FP8 puede degradar ligeramente resultados en tareas que requieren alta precisión aritmética (por ejemplo, cálculos científicos o financieros).
- Compatibilidad de formato: el checkpoint solo es directamente utilizable con motores que soporten `compressed-tensors` (vLLM, SGLang). Para otros frameworks es necesaria una conversión previa, que puede introducir pérdidas adicionales.
- Sin soporte oficial: el modelo es un artefacto de terceros (qtum); no hay garantías de mantenimiento ni de soporte técnico.
- Fecha de creación atípica: el repositorio indica fecha de creación en agosto de 2026, lo que sugiere que podría tratarse de un proyecto experimental o con metadatos incorrectos; se recomienda verificar la integridad del checkpoint antes de uso en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/qtum/Qwen3-14B-FP8
- Modelo base Qwen/Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
- Variante oficial FP8: https://huggingface.co/Qwen/Qwen3-14B-FP8
- Variante NVIDIA FP8: https://huggingface.co/nvidia/Qwen3-14B-FP8
- Herramienta de cuantización llm-compressor: https://github.com/vllm-project/llm-compressor
- Documentación de vLLM para compressed-tensors: https://docs.vllm.ai/en/latest/features/quantization/compressed_tensors.html
