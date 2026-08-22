# justinchuby/onnx-genai-example-gemma4-e2b-speculative

## Resumen

El paquete `justinchuby/onnx-genai-example-gemma4-e2b-speculative` es una implementación autocontenida de decodificación especulativa para el modelo Gemma-4 E2B-it, desarrollada por justinchuby sobre el runtime ONNX GenAI. Incluye el decodificador objetivo (target) y un modelo auxiliar (drafter) co-ubicados en un solo repositorio, con un único `inference_metadata.yaml` que define el flujo especulativo completo. La solución está pensada para acelerar la inferencia en entornos CUDA mediante la propuesta de múltiples tokens por paso, manteniendo la fidelidad determinista con el modelo original.

El paquete se publica bajo licencia Apache-2.0 y contiene los grafos ONNX en precisión fp16, derivados de los checkpoints oficiales de Gemma-4 E2B-it y su variante assistant. Su relevancia actual radica en ofrecer una referencia validada de empaquetado especulativo para ONNX Runtime, con contratos de metadatos verificados mediante el binario Rust de validación de onnx-genai (#1716). Aunque se trata de un ejemplo de referencia, su estructura puede servir como plantilla para integrar decodificación especulativa en entornos de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (full + sliding), 35 capas en el target y 4 capas en el drafter |
| Parámetros totales | no disponible (no se especifica el conteo exacto) |
| Parámetros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no se indica en la documentación) |
| Tipos de cuantización | fp16 (formato ONNX con pesos en precisión media) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`.onnx` + `.data`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura Transformer densa con atención híbrida: el decodificador objetivo (target) tiene 35 capas que alternan atención completa y atención deslizante (sliding attention), con un total de 20 celdas de KV compartidas. El drafter auxiliar es mucho más ligero, con 4 capas y sin caché propia, ya que lee las claves y valores del target mediante aliases de solo lectura (`read_only`). Esta configuración permite una propuesta rápida de tokens sin duplicar memoria.

El entrenamiento se basa en los pesos oficiales de Google Gemma-4 E2B-it y su asistente, pero no se ofrecen detalles sobre el dataset ni el proceso de entrenamiento (no hay información sobre tokens, composición o fases RLHF/DPO). La innovación principal reside en el contrato de decodificación especulativa: el drafter emite un estado proyectado que se fusiona con las embeddings del token objetivo, y el muestreo de rechazo estándar corrige cualquier discrepancia. El flujo es determinista (sin sampler aleatorio) y valida con paridad frente al modelo Hugging Face en fp16, aunque se documenta una deriva por diferencias de precisión (fp16 vs bf16) en la ejecución libre.

## Capacidades

- Generación de texto conversacional mediante decodificación especulativa, con propuesta de hasta 6 tokens por paso (máximo `max_proposal_width`).
- Soporte de decodificación especulativa estándar con muestreo de rechazo (`distribution_preserving: true`), garantizando que la salida final coincide con la del modelo objetivo en modo greedy.
- Integración con ONNX Runtime (onnxruntime) y su API GenAI, con metadatos canónicos que permiten la validación automática del grafo.
- Funcionamiento determinista: la generación de logits es reproducible, ya que la selección de tokens se realiza mediante argmax externo sin RNG.
- Capacidad multilingüe no documentada; se asume que hereda las capacidades del modelo base Gemma-4 E2B-it, pero no se detalla en el repositorio.
- No se documentan funciones de tool calling, agentes, visión ni audio en esta variante específica.

## Casos de uso

- Inferencia de baja latencia en entornos de servidor: la decodificación especulativa permite generar varios tokens por paso, reduciendo el número de iteraciones y mejorando el rendimiento en GPUs de alta gama como NVIDIA H200.
- Despliegue en producción con ONNX Runtime: el paquete autocontenido facilita la integración en pipelines que ya usan ONNX, evitando dependencias externas.
- Evaluación de calidad de decodificación especulativa: el paquete incluye evidencia de paridad (Jaccard 1.0, coseno 0.9998) que sirve como referencia para validar implementaciones propias.
- Investigación en eficiencia de inferencia: el diseño con KV compartido y aliases de solo lectura es un caso de estudio para optimizar el uso de memoria en modelos de contexto largo.
- Entrenamiento de drafter y ajuste de hiperparámetros: el repositorio permite comparar el rendimiento del drafter (4 capas) frente al target (35 capas) en términos de tasa de aceptación y velocidad.
- Integración en sistemas de chat con requisitos de determinismo: al ser determinista, es adecuado para entornos donde se necesita reproducibilidad exacta de salidas, como auditorías o test automáticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El repositorio solo incluye pruebas de paridad internas:

| Métrica | Resultado |
|---|---|
| Jaccard de rutas centroid (drafter L4) | 1.0 |
| Coincidencia de argmax (drafter L4) | correcta |
| Coseno de estado proyectado (drafter L4) | 0.9998 |
| Aceptación de propuestas (L5) | 8 aceptados / 37 rechazados (de 45 propuestos) |
| Paridad de salida final | igual a la greedy del target |

Estos datos provienen de `evidence/` del repositorio y se validan en una GPU NVIDIA H200. No hay comparaciones con otros modelos similares.

## Requisitos de hardware

- GPU con soporte fp16 (CUDA) es imprescindible; el modelo está optimizado para entornos NVIDIA.
- El repositorio de 10.7 GB incluye ambos grafos (target y drafter) en fp16. El tamaño en VRAM no se especifica, pero se estima que el target (35 capas) requiere al menos 4-6 GB en fp16, y el drafter añade una pequeña sobrecarga.
- GPU recomendada: NVIDIA H200 (utilizada en las pruebas de paridad), también compatible con A100, RTX 4090 o similares con ≥8 GB VRAM.
- Despliegue mediante ONNX Runtime (ort) con la API `onnxruntime-genai`; no se menciona compatibilidad con llama.cpp, vLLM u Ollama.
- La latencia no está documentada, pero la decodificación especulativa reduce el número de pasos de decodificación, lo que típicamente mejora el throughput en comparación con la generación autoregresiva simple.
- El paquete incluye metadatos de ejecución que permiten profiling mediante `ONNX_GENAI_TRACE` para medir tiempos por etapa.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo contexto (decodificación especulativa de Gemma-4 en ONNX). Alternativas genéricas en decodificación especulativa incluyen:

- **Medusa (de Google)**: usa cabezas de predicción múltiples en lugar de un drafter separado, pero no es directamente comparable en este paquete.
- **EAGLE (de Microsoft)**: emplea un modelo de extrapolación de características, pero no hay datos de comparación en el repositorio.

Dado que no hay benchmarks comunes ni parámetros públicos del modelo base, no es posible realizar una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- El repositorio es un **ejemplo de empaquetado** (prototipo) para validar el contrato de decodificación especulativa en onnx-genai. No se ha optimizado para uso en producción y puede carecer de optimizaciones de rendimiento (fusiones, kernel tuning).
- No se documentan los datos de entrenamiento, lo que impide evaluar sesgos o alucinaciones del modelo subyacente. Se recomienda revisar la documentación de Gemma-4 E2B-it.
- La precisión fp16 puede causar pequeñas desviaciones en la generación libre (observadas en las pruebas de paridad), aunque el flujo especulativo con rechazo mantiene la equivalencia con el greedy.
- El drafter usa KV compartido de solo lectura; cualquier modificación no autorizada del estado podría romper la integridad de la decodificación. Se recomienda no alterar el grafo sin actualizar los metadatos.
- No se garantiza compatibilidad con otras librerías de inferencia (vLLM, TGI) que no sean onnxruntime.
- El tamaño del repo (10.7 GB) puede ser excesivo para despliegues ligeros; se puede separar el target y el drafter si no se necesita el flujo especulativo completo.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar la licencia del modelo base (Gemma-4 E2B-it) en su repositorio original para cumplir con los términos de Google.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/justinchuby/onnx-genai-example-gemma4-e2b-speculative
- Target standalone: https://huggingface.co/justinchuby/onnx-genai-example-gemma4-e2b
- Assistant standalone: https://huggingface.co/justinchuby/onnx-genai-example-gemma4-e2b-assistant
- Código de onnx-genai (GitHub): https://github.com/justinchuby/onnx-genai
- Ejemplos de onnx-genai: https://github.com/justinchuby/onnx-genai/tree/main/examples
- Blog de Google Cloud sobre Gemma 4: https://cloud.google.com/blog/products/ai-machine-learning/gemma-4-available-on-google-cloud
