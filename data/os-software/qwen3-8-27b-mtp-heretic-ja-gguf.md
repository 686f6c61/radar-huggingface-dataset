# OS-Software/Qwen3.8-27B-MTP-heretic-ja-GGUF

## Resumen

OS-Software/Qwen3.8-27B-MTP-heretic-ja-GGUF es una versión "decensored" (abliterada) del modelo Qwen3.8-27B de Unsloth, generada mediante la herramienta Heretic v1.4.0+custom con el método Arbitrary-Rank Ablation (ARA) sobre un adaptador LoRA. El objetivo es eliminar los mecanismos de rechazo y censura del modelo original, manteniendo sus capacidades generativas. El resultado es un modelo que no aplica filtros de seguridad y produce respuestas que normalmente serían bloqueadas, con una puntuación de keywords de rechazo de 0/100 frente a 100/100 del original.

El modelo base Qwen3.8-27B es un modelo de lenguaje causal con vision encoder, de 27 mil millones de parámetros, 64 capas, dimensión oculta 5120 y token embedding de 248 320. Incluye soporte nativo para imágenes y vídeos, control flexible de pensamiento (thinking mode) y capacidades de agente. Esta versión ablacionada se distribuye en formato GGUF, lo que permite su ejecución en entornos locales con llama.cpp, Ollama o similares.

La relevancia de este modelo radica en su utilidad para investigación en seguridad de IA, estudios de alineación y red-teaming, ya que permite analizar el comportamiento del modelo sin restricciones de seguridad. Sin embargo, su uso conlleva riesgos significativos y está restringido a entornos de investigación controlados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model with Vision Encoder (base Qwen3.8-27B) |
| Parametros totales | 27B (modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (varias cuantizaciones, no especificadas en la ficha) |
| Idiomas soportados | No disponible (el modelo base probablemente multilingüe, pero no se indica) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es una modificación del Qwen3.8-27B de Unsloth, que a su vez es una versión optimizada del Qwen3.8-27B original. La arquitectura base es un transformer denso con vision encoder, 64 capas, dimensión oculta 5120 y token embedding de 248 320. El modelo base fue preentrenado y postentrenado con datos multimodales (imagen, vídeo y texto), e incorpora un mecanismo de pensamiento flexible que puede activarse o desactivarse por petición.

El proceso de ablación se realizó con Heretic v1.4.0+custom, aplicando el método Arbitrary-Rank Ablation (ARA) sobre un adaptador LoRA con preservación de norma de fila. Los parámetros de ablación fueron: capas 9 a 51, peso de preservación de buen comportamiento 1.0, peso de dirección de mal comportamiento 0.3027, peso de sobrecorrección relativa 0.9481 y vecindario de 1. Este proceso elimina selectivamente las direcciones en el espacio de activaciones asociadas con comportamientos de rechazo, manteniendo el resto de capacidades. La divergencia KL respecto al modelo original es de 0.0528, lo que indica una alteración mínima en la distribución de salida.

## Capacidades

- Generacion de texto sin restricciones de contenido: el modelo no rechaza peticiones que el original bloquearía, incluyendo temas sensibles o controvertidos.
- Razonamiento y pensamiento flexible: hereda el modo de pensamiento del modelo base, que puede activarse o desactivarse por petición y ajustarse mediante `reasoning_effort`.
- Comprensión de imágenes y vídeos: al estar basado en Qwen3.8-27B, mantiene capacidades nativas de visión-lenguaje para analizar diagramas, documentos y vídeos de hasta una hora.
- Capacidades de agente: soporta planificación autónoma y manejo de retroalimentación del entorno, útil para tareas multi-paso.
- Tool calling y function calling: el modelo base incluye soporte para herramientas, aunque no se especifica si esta versión lo conserva íntegramente.
- Multilingüismo: no se especifican idiomas, pero el modelo base de Qwen es multilingüe; se asume que esta versión mantiene dicha capacidad.

## Casos de uso

- Investigación en seguridad de IA: el modelo permite estudiar cómo se comporta un LLM sin alineación de seguridad, identificando vulnerabilidades y patrones de sesgo en entornos controlados.
- Red-teaming de sistemas de moderación: se puede usar para generar contenido adversario y evaluar la robustez de filtros de contenido en aplicaciones de producción.
- Estudios de alineación: analizar el efecto de la ablación en la distribución de salida y comparar con el modelo original para entender qué mecanismos internos controlan el rechazo.
- Evaluación de sesgos y toxicidad: generar respuestas sin filtros para medir la prevalencia de sesgos implícitos en el modelo base.
- Desarrollo de técnicas de desablación: servir como referencia para investigar métodos de restauración de seguridad o ajuste fino posterior.
- Benchmarking de capacidades sin censura: comparar el rendimiento en tareas de razonamiento, código o matemáticas cuando se elimina la capa de rechazo, para aislar el efecto de la alineación.

## Benchmarks y rendimiento

La model card proporciona solo dos métricas comparativas entre esta versión y el modelo original:

| Metrica | Modelo ablacionado | Modelo original (unsloth/Qwen3.8-27B) |
| :------ | :----------------: | :-----------------------------------: |
| Keywords (rechazo) | 0/100 | 100/100 |
| Divergencia KL | 0.0528 | 0 (por definicion) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las pruebas de rendimiento se realizaron con datasets japoneses, según indica la nota de la model card.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 27B en formato GGUF, se requiere aproximadamente 16-20 GB de VRAM para una cuantización Q4, y hasta 30 GB para Q8. Con cuantizaciones más agresivas (Q2/Q3) podría caber en GPUs de 12 GB, aunque con pérdida de calidad.
- GPUs recomendadas: NVIDIA RTX 3090/4090 (24 GB), A100 (40/80 GB), H100 (80 GB). También puede ejecutarse en GPUs de 16 GB con cuantización Q4.
- Ejecución en consumer GPU: sí, con tarjetas de 16 GB o más, usando cuantizaciones bajas (Q4_K_M, Q5_K_M).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier runtime compatible con GGUF. Para inferencia en servidor, se puede usar vLLM con conversión a safetensors (aunque el repo solo contiene GGUF).
- Latencia y throughput: no disponibles. Se estima una velocidad de 20-40 tokens/s en una RTX 4090 con Q4, dependiendo de la longitud de contexto y el uso de aceleración.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos ablacionados comparables en la misma categoría. La comparación más directa es con el modelo original sin ablacionar:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Formato |
| :------ | :--------- | :------- | :---------- | :------- | :------ |
| OS-Software/Qwen3.8-27B-MTP-heretic-ja-GGUF | 27B | No disponible | Sin rechazo, KL 0.0528 | Apache-2.0 | GGUF |
| unsloth/Qwen3.8-27B | 27B | No disponible | Rechazo completo, KL 0 | Apache-2.0 | safetensors, GGUF |

No se dispone de datos de otros modelos ablacionados similares para una comparación más amplia.

## Limitaciones y advertencias

- Reducción sustancial de la alineación de seguridad: el modelo puede generar contenido dañino, inexacto, sesgado, ofensivo o inapropiado con mayor probabilidad que un modelo estándar.
- Riesgo de alucinación: al no tener filtros, las respuestas pueden ser más propensas a inventar información, especialmente en temas sensibles.
- Uso restringido: la model card indica explícitamente que el modelo es solo para investigación y experimentación, incluyendo seguridad, alineación y red-teaming. No debe desplegarse en servicios públicos o orientados al usuario final.
- Responsabilidad del usuario: todas las salidas deben tratarse como no fiables y verificarse de forma independiente. El usuario es responsable de implementar salvaguardas y supervisión humana.
- Limitaciones de idioma: las pruebas de rendimiento se realizaron con datasets japoneses; no hay evidencia de comportamiento en otros idiomas.
- Sin garantías: el autor no ofrece garantías de ningún tipo y no asume responsabilidad por daños directos o indirectos derivados del uso.
- Datos de contexto y benchmarks incompletos: no se han publicado la longitud de contexto ni resultados de benchmarks estándar, lo que dificulta evaluar su rendimiento en tareas convencionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OS-Software/Qwen3.8-27B-MTP-heretic-ja-GGUF
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen3.8-27B
- Proyecto Heretic: https://heretic-project.org
- Guía de ejecución de Qwen3.8 (Unsloth): https://unsloth.ai/docs/models/qwen3.8
