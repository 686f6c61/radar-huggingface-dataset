# Leyten/Qwen3.5-9B-compute-q4f16_1-MLC

## Resumen

Este repositorio contiene una conversión a pesos MLC (Machine Learning Compilation) del modelo Kewk/Heretical-Qwen3.5-9B, una variante "decensurada" de Qwen3.5-9B, preparada específicamente para ejecutarse en navegador mediante WebGPU a través de la librería WebLLM. El autor, Leyten, ha adaptado el modelo para la red Compute Network, que sirve trabajos de inferencia en el nivel Pro de su plataforma. La cuantización utilizada es q4f16_1 (int4 para pesos, fp16 para escalas, grupo de 32), lo que reduce el tamaño a aproximadamente 5,06 GB distribuidos en 124 shards.

El modelo base Qwen3.5-9B, desarrollado por Alibaba, emplea una arquitectura híbrida que combina capas de atención lineal recurrente (GatedDeltaNet) con capas de atención softmax tradicional. La versión decensurada elimina los mecanismos de rechazo del modelo original, reduciendo las negativas de 100/100 a 3/100, con una divergencia KL de 0,0366 respecto al modelo base. Esta conversión MLC ajusta la ventana de contexto a 4096 tokens (frente a los 262144 nativos) para que la caché KV quepa en la memoria de un navegador, y corrige varios defectos de configuración presentes en las versiones publicadas de Qwen3.5 para MLC.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 24 capas GatedDeltaNet + 8 capas de atención completa (GQA softmax) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | q4f16_1 (int4 pesos, fp16 escalas, grupo 32) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLC (shards, 124 archivos) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B utiliza una arquitectura híbrida que combina atención lineal recurrente (GatedDeltaNet) con atención softmax tradicional. Según la documentación de MLC, el patrón es 8×(3×DeltaNet→FFN→1×Attention→FFN), resultando en 24 capas GatedDeltaNet y 8 capas de atención completa. Esta mezcla reduce el coste computacional de la atención a largo plazo manteniendo la calidad en tareas que requieren razonamiento profundo.

El proceso de decensurado aplicado por Kewk utiliza el método "Heretic", basado en ablación direccional guiada por TPE (Tree-structured Parzen Estimator), que elimina selectivamente los comportamientos de rechazo del modelo original. La conversión a MLC se realizó con `mlc-llm` compilado desde la fuente en el commit `2008fe83` (2026-05-11), con su TVM asociado `b628d91f`. No se han publicado detalles sobre el dataset de entrenamiento del modelo base ni sobre el proceso de entrenamiento específico de esta variante.

## Capacidades

- Generación de texto autónoma: el modelo produce respuestas de texto libre sin filtros de seguridad incorporados, al haber sido decensurado.
- Ejecución en navegador: los pesos están optimizados para WebGPU mediante WebLLM, permitiendo inferencia local en el cliente sin servidor.
- Soporte de modo "thinking" desactivado: la configuración usa el template `qwen2` con `enable_thinking: false`, lo que evita colisiones con el sistema de WebLLM para alternar el modo de razonamiento.
- Compatibilidad con WebLLM 0.2.84 o superior: requiere la ruta `create_rnn_state` para manejar el estado recurrente de las capas GatedDeltaNet.
- Sin capacidades multimodales en esta conversión: aunque el modelo base Qwen3.5-9B es multimodal, esta versión MLC está limitada a texto (pipeline `text-generation`).
- Multilingüismo no especificado: no se indica qué idiomas soporta, aunque Qwen3.5 suele cubrir múltiples lenguas.

## Casos de uso

- Aplicaciones de chat sin censura en el navegador: se puede integrar en una web para ofrecer conversaciones abiertas sobre cualquier tema, con la responsabilidad de moderación delegada al desarrollador.
- Prototipado rápido de asistentes de IA: al ejecutarse en WebGPU, permite validar flujos de conversación en el cliente sin necesidad de infraestructura backend, ideal para demos y pruebas de concepto.
- Generación de narrativa interactiva para juegos web: el modelo puede crear historias o diálogos dinámicos en tiempo real dentro de un juego o experiencia inmersiva, aprovechando la baja latencia de la inferencia local.
- Herramientas de escritura creativa sin restricciones: escritores y guionistas pueden usarlo para explorar contenido sensible o transgresor sin que el modelo se niegue a responder, gracias a su naturaleza decensurada.
- Investigación sobre alineación y seguridad: la comparación entre este modelo y la versión original permite estudiar el impacto de la ablación direccional en el comportamiento de rechazo y en la calidad de las respuestas.
- Educación en inferencia web: sirve como ejemplo práctico de despliegue de un modelo de 9B parámetros en el navegador, demostrando las capacidades de WebGPU y WebLLM para desarrolladores interesados en edge AI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor indica explícitamente que no existe ningún benchmark de capacidades para esta compilación concreta, y que la divergencia KL (0,0366) es solo una medida proxy del daño potencial, no una evaluación de rendimiento.

## Requisitos de hardware

- VRAM estimada: aproximadamente 5,1 GB para los pesos en cuantización q4f16_1, más 128 MiB para la caché KV con contexto de 4096 tokens. Se recomienda una GPU con al menos 6 GB de VRAM o memoria compartida suficiente.
- GPU recomendadas: cualquier GPU compatible con WebGPU, incluidas integradas modernas (Intel Iris Xe, AMD Radeon 680M) y discretas (NVIDIA RTX 30/40, AMD RX 6000/7000). No se requieren GPUs de datacenter.
- Compatibilidad con consumer GPU: sí, siempre que el navegador soporte WebGPU (Chrome, Edge, Firefox nightly).
- Opciones de despliegue: exclusivamente WebLLM en navegador (versión 0.2.84+). También podría usarse con MLC-LLM en servidor si se recompilan los pesos, pero el formato está pensado para web.
- Latencia y throughput: no se han publicado mediciones. La inferencia depende de la GPU del cliente y del ancho de banda de descarga de los 5,1 GB de pesos.

## Comparativa con modelos similares

| Modelo | Contexto | Decensurado | Cuantización | Licencia |
|---|---|---|---|---|
| Leyten/Qwen3.5-9B-compute-q4f16_1-MLC | 4096 | Sí | q4f16_1 (MLC) | Apache 2.0 |
| Qwen3.5-9B original (Alibaba) | 262144 | No | bf16 (original) | Apache 2.0 |
| Kewk/Heretical-Qwen3.5-9B (base) | 262144 | Sí | bf16 (original) | Apache 2.0 |

La principal diferencia frente al modelo original es la reducción drástica del contexto (4096 vs 262144) y la cuantización, que permiten su ejecución en navegador. Frente al modelo base decensurado, esta versión añade la capa de compresión para WebGPU, pero sacrifica la ventana de contexto larga. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Modelo decensurado: los mecanismos de rechazo han sido eliminados deliberadamente, por lo que puede generar contenido dañino, ilegal o éticamente cuestionable. No incluye alineación ni filtrado adicional.
- Sin benchmarks de capacidades: no hay evidencia pública de que el decensurado no haya degradado el rendimiento en tareas estándar. La KL de 0,0366 sugiere un impacto pequeño, pero no lo confirma.
- Contexto limitado a 4096 tokens: muy inferior al contexto nativo de 262144, lo que restringe su uso en tareas que requieren documentos largos o conversaciones extensas.
- Requisitos de runtime específicos: necesita WebLLM 0.2.84 o superior y un navegador con WebGPU. Versiones anteriores fallan con errores engañosos.
- Configuración no estándar: la plantilla de conversación es `qwen2` en lugar de `qwen3_5`, y los tokens de parada son `[248046, 248044]`. Cualquier integración debe respetar estos ajustes.
- Responsabilidad de moderación: quien despliegue el modelo es responsable de implementar sus propias salvaguardas si lo expone a usuarios no confiables.
- Idiomas no documentados: no se especifica qué lenguas soporta, lo que dificulta planificar su uso multilingüe.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Leyten/Qwen3.5-9B-compute-q4f16_1-MLC
- Modelo base decensurado: https://huggingface.co/Kewk/Heretical-Qwen3.5-9B
- Librería binaria MLC para WebLLM: https://github.com/mlc-ai/binary-mlc-llm-libs
- Ficha de Qwen3.5-9B en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-9b
- Especificaciones y requisitos VRAM: https://apxml.com/models/qwen35-9b
- Guía completa de Qwen 3.5: https://qwen-ai.com/qwen-3-5/
- Modelo en Ollama: https://ollama.com/library/qwen3.5:9b
