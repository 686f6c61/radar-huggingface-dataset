# manitcor/Qwen3.8-27B-Obliterated-E03-bnb-4bit

## Resumen

El modelo `manitcor/Qwen3.8-27B-Obliterated-E03-bnb-4bit` es una cuantización NF4 de 4 bits del checkpoint BF16 `manitcor/Qwen3.8-27B-Obliterated-E03`, que a su vez es una modificación del modelo base `Qwen/Qwen3.8-27B` de Alibaba. La modificación principal es la aplicación de la técnica de abliteración (OBLITERATUS E03), que elimina deliberadamente el comportamiento de rechazo del modelo, reduciendo su tasa de negativas a solicitudes que el modelo original rechazaría. Esta versión cuantizada está diseñada para ejecutarse en una GPU de 24 GB como la RTX 4090, manteniendo un comportamiento semántico y de capacidades cercano al BF16 original.

El modelo utiliza la arquitectura híbrida `qwen3_5` del Qwen3.8-27B, compuesta por 48 capas de atención lineal (Gated DeltaNet) y 16 capas de atención completa, con un total de aproximadamente 26,9 mil millones de parámetros. Es una versión solo texto, sin la torre de visión del modelo base. La cuantización se realizó con BitsAndBytes, aplicando doble cuantización y almacenamiento en UINT8, lo que reduce el tamaño del artefacto a unos 17,7 GB. La relevancia de este modelo radica en su uso para investigación sobre mecanismos de rechazo, interpretabilidad mecánica y evaluación de seguridad, aunque su naturaleza "obliterada" implica riesgos importantes para despliegues no controlados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida `qwen3_5`: 48 capas Gated DeltaNet (atención lineal) + 16 capas de atención completa |
| Parametros totales | 26.895.998.464 (≈26,9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NF4 (4-bit) con doble cuantización, compute dtype BF16, almacenamiento UINT8 |
| Idiomas soportados | Inglés (según etiqueta del modelo) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (con cuantización BitsAndBytes Linear4bit) |

## Arquitectura y entrenamiento

La arquitectura base es la del Qwen3.8-27B, que emplea un diseño híbrido con 48 capas de atención lineal Gated DeltaNet y 16 capas de atención completa. Este enfoque combina la eficiencia computacional de la atención lineal con la capacidad de modelado de la atención tradicional. El modelo es solo texto; la torre de visión del Qwen3.8-27B original no está incluida en esta versión.

El proceso de abliteración (OBLITERATUS E03) es una intervención de interpretabilidad mecánica que modifica los pesos del modelo para eliminar el comportamiento de rechazo. No se dispone de información sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO, etc.). La cuantización NF4 se realizó con BitsAndBytes, aplicando doble cuantización y almacenamiento en UINT8, sobre los pesos BF16 del checkpoint E03. La conversión se llevó a cabo con PyTorch 2.10.0, Transformers 5.8.1, BitsAndBytes 0.50.0, Accelerate 1.14.0 y Hugging Face Hub 1.28.0 en una NVIDIA A100 80 GB.

## Capacidades

- Generación de texto y conversación multi-turno mediante chat template.
- Razonamiento y resolución de problemas, incluyendo matemáticas y lógica (heredado del modelo base).
- Generación de código y soporte para tareas de programación (capacidad del Qwen3.8-27B, no verificada específicamente en esta versión).
- Capacidad de seguir instrucciones complejas, aunque la abliteración puede alterar el comportamiento en solicitudes sensibles.
- No incluye capacidades de visión (solo texto).
- No se ha confirmado soporte de tool calling o function calling en esta versión.
- No se ha confirmado soporte de agentes o multi-step reasoning más allá de lo estándar del modelo base.
- Multilingüismo: solo se declara inglés, aunque el modelo base podría tener capacidades multilingües; no hay evidencia en esta versión.

## Casos de uso

- Investigación en seguridad de IA: el modelo permite estudiar cómo la abliteración afecta el comportamiento de rechazo y qué mecanismos internos están involucrados, en entornos de laboratorio controlados.
- Evaluación de alineación y robustez: se puede utilizar para probar técnicas de detección de contenido dañino o para medir la degradación de capacidades tras la modificación de pesos.
- Análisis de interpretabilidad mecánica: al eliminar el rechazo, se pueden observar patrones de activación y representaciones internas relacionadas con la negativa, facilitando estudios de mechanistic interpretability.
- Generación de contenido creativo sin restricciones: en contextos legales y éticos, puede usarse para explorar estilos de escritura o narrativas que el modelo original rechazaría, siempre con supervisión humana.
- Desarrollo de sistemas de moderación: sirve como caso de prueba para clasificadores de contenido dañino, ya que produce respuestas que los modelos estándar no generarían.
- Benchmarking de cuantización: permite comparar el rendimiento de la cuantización NF4 frente al BF16 en tareas de generación y razonamiento, útil para optimizar despliegues en hardware limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sin embargo, la model card incluye una evaluación independiente del artefacto cuantizado frente al BF16 E03, con los siguientes resultados:

| Metrica | BF16 E03 | NF4 artifact |
|---|---:|---:|
| Tasa de rechazo | 1,0% | 0,5% |
| Coherencia | 100% | 100% |
| Comprobaciones de capacidad | 83,3% | 83,3% |
| Perplejidad de referencia | 3,2099 | 3,4106 |
| Incremento de perplejidad vs BF16 | — | 6,25% |
| Degeneración de salida dañina | 3,0% | 2,5% |
| KL media del primer token vs BF16 (33 prompts) | — | 0,01943 |
| KL máxima del primer token | — | 0,3652 |

Además, se verificó que los 496 módulos esperados se cargaron como `Linear4bit`, sin offload de CPU, y que todas las muestras de logits fueron finitas. La asignación máxima de CUDA durante la recarga en A100 fue de aproximadamente 22,74 GB.

## Requisitos de hardware

- VRAM estimada: aproximadamente 17,66 GB en estado estable y pico de 22,74 GB durante la recarga en A100.
- GPU recomendada: NVIDIA RTX 4090 (24 GB) o similar con al menos 24 GB de VRAM.
- También puede ejecutarse en A100 80 GB, aunque el diseño apunta a GPUs de consumo.
- No cabe en GPUs de 16 GB o menos sin offload, lo cual no está soportado.
- Opciones de despliegue: Transformers con BitsAndBytes (obligatorio), posiblemente vLLM o llama.cpp si soportan la arquitectura híbrida, pero no confirmado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks estándar para comparar con otros modelos de tamaño similar. La comparación más directa es con el checkpoint BF16 original y con el modelo base Qwen3.8-27B:

| Modelo | Parametros | Contexto | Licencia | Cuantizacion | Notas |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B | 26,9B | No disponible | Apache-2.0 | BF16 (original) | Modelo base multimodal, con visión |
| manitcor/Qwen3.8-27B-Obliterated-E03 | 26,9B | No disponible | Apache-2.0 | BF16 | Versión abliterada, solo texto |
| manitcor/Qwen3.8-27B-Obliterated-E03-bnb-4bit | 26,9B | No disponible | Apache-2.0 | NF4 4-bit | Cuantización de la versión abliterada |

No hay comparativas con otros modelos de 27B (p. ej., Llama-3-27B, Mistral-27B) en la información disponible.

## Limitaciones y advertencias

- El modelo fue modificado deliberadamente para reducir el comportamiento de rechazo. Puede cumplir solicitudes que el modelo original rechazaría, incluyendo contenido dañino o ilegal.
- La tasa de degeneración de salida dañina medida es del 2,5%, y una de las 33 comparaciones de primer token mostró una divergencia KL de 0,3652, lo que indica posibles inconsistencias.
- El evaluador de rechazo es léxico y la suite de capacidades es pequeña; se recomiendan evaluaciones humanas, con clasificadores, multilingües, de contexto largo y adversariales antes de cualquier despliegue.
- No se recomienda su uso en producción sin control de acceso, monitoreo y políticas de cumplimiento legal.
- La cuantización NF4 no es byte-equivalente al BF16; las secuencias de tokens pueden diferir, aunque las métricas semánticas sean similares.
- No se debe cargar sin soporte de BitsAndBytes; no se admite dequantización silenciosa ni offload de CPU.
- La licencia Apache-2.0 permite uso comercial, pero la responsabilidad legal y ética recae en el desplegador.
- No se dispone de información sobre sesgos específicos del modelo, aunque al ser una modificación del Qwen3.8-27B, puede heredar sesgos del modelo base.

## Enlaces

- [HuggingFace: manitcor/Qwen3.8-27B-Obliterated-E03-bnb-4bit](https://huggingface.co/manitcor/Qwen3.8-27B-Obliterated-E03-bnb-4bit)
- [HuggingFace: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [GitHub: Qwen3.8-27B](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [local-ai-zone: Qwen3.8 27b Obliterated GGUF](https://local-ai-zone.github.io/models/qwen3-8-27b-obliterated.html)
- [explainx.ai: Qwen3.8-27B OBLITERATED](https://www.explainx.ai/blog/pliny-qwen3-8-27b-obliterated-alex-finn-mac-august-2026)
