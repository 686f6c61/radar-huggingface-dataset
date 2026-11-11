# electroglyph/elephant-1-onnx

## Resumen

elephant-1-onnx es una conversión a formato ONNX del modelo Baseten elephant-1, un modelo de decisión de 9B parámetros construido sobre la arquitectura Qwen3.5. A diferencia de un chatbot convencional, el modelo no genera texto libre: recibe un estado (un objeto o cadena que describe una situación) y un conjunto de preguntas tipadas (sí/no, elección única o rúbrica puntuada), y devuelve una distribución de probabilidad por pregunta en un único prefill. El autor de esta conversión es electroglyph, que distribuye los pesos en formato ONNX para su uso con onnxruntime 1.31.1 sin necesidad de PyTorch en inferencia.

La relevancia de esta ficha radica en su enfoque: es un modelo de decisión estructurado, no generativo, lo que lo hace adecuado para tareas de clasificación, enrutamiento y moderación con salidas calibradas y auditables. La conversión preserva el esquema de atención del checkpoint original: 8 capas de atención completa con máscara bidireccional por bloques (prefijo y sufijo) y 24 capas de atención lineal recurrente, un detalle que el autor señala como crítico para reproducir los resultados de referencia.

El repositorio ocupa 38,3 GB e incluye builds en INT8 e INT4 para GPU y una build para CPU, además de scripts de ejemplo en Python y un runner en C#. La licencia es MIT. No se han publicado idiomas soportados ni resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5: 8 capas de atención completa (bidireccional por bloques) y 24 capas de atención lineal recurrente |
| Parámetros totales | 9B (según la model card: "a 9B Qwen3.5 decision model") |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens por petición; rama de hasta 32.768 tokens |
| Tipos de cuantización | INT8, INT4 (GPU); build CPU |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (ejecutable con onnxruntime 1.31.1) |
| Pipeline | text-classification |
| Modelo base | baselabs/elephant-1 |
| Tamaño del repositorio | 38,3 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido de Qwen3.5 con 32 capas: 8 de atención completa y 24 de atención lineal recurrente. La conversión ONNX preserva un detalle de enmascaramiento poco habitual: las capas de atención completa operan de forma bidireccional por bloques, con el bloque de prefijo y el bloque de sufijo cada uno bidireccional, mientras que las capas lineales permanecen recurrentes. El autor indica que este esquema procede del checkpoint original (modeling_overrides y readout.json) y que es determinante para los resultados: en el ejemplo de soporte, la puntuación de reembolso es 0,79 con la máscara correcta.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card tampoco detalla innovaciones de decodificación especulativa ni mecanismos de atención adicionales más allá del esquema híbrido descrito. La temperatura de referencia es T = 1.0 y no se incluye fichero de calibración.

## Capacidades

- Clasificación binaria (tipo `noul`): devuelve una probabilidad para preguntas de sí/no, por ejemplo "¿debería el agente ofrecer un reembolso?" → 0,79.
- Elección única (tipo `choice`): selecciona una opción entre k alternativas y devuelve la distribución completa, por ejemplo prioridad → `urgent` con 0,88.
- Puntuación por rúbrica (tipo `score`): niveles de 0 a k-1 (máximo 10 niveles), devuelve la expectativa y la distribución completa.
- Procesamiento de estados estructurados: acepta objetos JSON como estado, no solo cadenas de texto (ejemplo de enrutamiento de incidentes con un objeto estructurado).
- Decisiones múltiples en un solo prefill: hasta 256 opciones por pregunta y varias preguntas por petición.
- Generación de texto libre secundaria mediante `generate.py` (no es el caso de uso principal).
- Sin soporte de imágenes en esta build ONNX: las imágenes requieren el serving con PyTorch del repositorio fuente.
- No se documenta soporte de tool calling, agentes multi-paso ni capacidades multilingües explícitas.

## Casos de uso

- Triaje de soporte al cliente: el modelo recibe el estado de la conversación (cliente, incidencia, historial) y responde en una sola pasada si procede reembolso, la prioridad del ticket, el tono del cliente y la satisfacción esperada. Es adecuado porque devuelve probabilidades calibradas por pregunta y permite fijar umbrales de derivación a humanos.
- Moderación de contenido: con un estado que describe la cuenta y la publicación, clasifica si viola la política (0,998 en el ejemplo), la categoría (scam, spam, abuso) y la severidad en una rúbrica de 0 a 4. La distribución completa permite distinguir entre casos límite y casos de auto-eliminación.
- Enrutamiento de incidentes: acepta un objeto estructurado con métricas, despliegues e información de guardia, y decide si paginar al equipo, a qué equipo asignar el incidente y la urgencia. La salida probabilística facilita reglas de escalado automático.
- Clasificación de riesgo en pipelines de decisión: cualquier flujo que requiera una etiqueta con probabilidad asociada (aprobación de crédito, priorización de colas, detección de fraude) puede beneficiarse del formato de preguntas tipadas y de la distribución completa para auditar decisiones.
- Evaluación de rúbricas automatizada: puntuación de respuestas, calidad de contenido o satisfacción con niveles 0..k-1, útil para sistemas de control de calidad que necesitan una expectativa numérica además de la etiqueta.
- Integración en servicios .NET: el runner en C# incluido permite desplegar el modelo en entornos .NET 10 con onnxruntime, con tokenización verificada byte a byte frente a HuggingFace, lo que facilita su adopción en stacks empresariales no Python.
- Despliegue en CPU sin GPU: la build `model-cpu` permite ejecutar decisiones en entornos sin acelerador, con resultados verificados idénticos a los de Python hasta 4 decimales en el ejemplo de reembolso (0,9069 en CPU frente a 0,9342 en CUDA INT4).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye ejemplos de salidas verificadas (reembolso 0,7853; moderación 0,998; enrutamiento 0,9483) y una comprobación de equivalencia entre implementaciones (Python y C# byte-idénticos, 19/19 en tokenización unicode/CJK/emoji), pero no tablas comparativas con MMLU, HumanEval, GSM8K ni métricas estándar.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Para un modelo de 9B, una build INT4 requiere aproximadamente 5-6 GB de VRAM y una INT8 en torno a 9-10 GB, aunque estas cifras son estimaciones generales y no datos publicados por el autor.
- GPU recomendadas: no se especifican modelos concretos; la model card menciona builds `model-cuda-int4` y `model-cuda-int8` ejecutables con `--cuda`.
- GPU de consumo: no se confirma compatibilidad con RTX 4090 u otras GPU de consumo; la información no lo detalla.
- Opciones de despliegue: onnxruntime 1.31.1 (Python y C#/.NET 10). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card indica que cada petición se resuelve en un único prefill y que el ejemplo de soporte consume 361 tokens de entrada y 4 de salida, pero no publica tiempos.
- Build CPU disponible para entornos sin GPU.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (modelos de decisión estructurados con salidas probabilísticas por pregunta) ni datos de rendimiento que permitan una comparación rigurosa con alternativas.

## Limitaciones y advertencias

- No es un chatbot: no debe usarse para generación de texto conversacional como caso principal; `generate.py` es secundario y no está optimizado.
- Sin soporte de imágenes en la build ONNX; requiere el serving con PyTorch del repositorio fuente.
- La calibración de probabilidades puede desplazarse con la cuantización INT4; el autor recomienda recalibrar sobre datos propios si el uso depende de umbrales.
- T = 1.0 sin fichero de calibración incluido.
- Límites estructurales: máximo 256 opciones por pregunta, rúbricas de hasta 10 niveles, rama de 32.768 tokens y petición de 65.536 tokens.
- No se documentan idiomas soportados ni sesgos conocidos; la ausencia de esta información impide evaluar el comportamiento multilingüe.
- Riesgo de alucinación no evaluado en la información disponible; al tratarse de un modelo de decisión, el riesgo se traslada a clasificaciones erróneas con alta confianza.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base baselabs/elephant-1, ya que la información disponible no detalla posibles restricciones adicionales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/electroglyph/elephant-1-onnx
- Modelo base: https://huggingface.co/baselabs/elephant-1
- Repositorio fuente del modelo (referenciado en la model card como `/home/anon/LLM/elephant-1`, sin URL pública disponible)
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
