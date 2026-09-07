# medismera/Qwen3.8-27B-OBLITERATED-bucket

## Resumen

El modelo `medismera/Qwen3.8-27B-OBLITERATED-bucket` es una variante ablacionada (abliterated) del modelo Qwen3.8-27B de Alibaba. La técnica de ablación elimina los comportamientos de rechazo que el modelo base tiene integrados en los pesos, no solo en el prompt del sistema. Según la documentación disponible, el modelo original incorpora un entrenamiento de rechazo profundo codificado como direcciones en el espacio de activación, y el proceso de ablación elimina esas direcciones para que el modelo cumpla peticiones que el original rechazaría. El autor de esta variante es `medismera`, y el modelo está publicado en HuggingFace bajo la licencia Apache 2.0 (según los tags). Es un modelo multimodal (imagen-texto) con soporte para tool calling, razonamiento profundo y uso en agentes, orientado a tareas de ciberseguridad y generación de texto conversacional. No se dispone de información detallada sobre el tamaño exacto del contexto ni sobre los datos de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (según tags; arquitectura exacta no disponible) |
| Parametros totales | 27B (según nombre del modelo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (compatible con llama.cpp, vLLM y SGLang según tags) |
| Idiomas soportados | en, ar, zh (según tags); información completa no disponible |
| Licencia | Apache 2.0 (según tags) |
| Formato de pesos | no disponible (compatible con transformers, vLLM, SGLang y llama.cpp según tags) |

Nota: no se incluye la fila de parámetros activos porque no hay evidencia de que sea un modelo de mezcla de expertos (MoE).

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen3.8-27B, un modelo de lenguaje multimodal de Alibaba que combina procesamiento de texto e imágenes. Según la información encontrada, el modelo original tiene un entrenamiento de seguridad profundo, con comportamientos de rechazo codificados geométricamente en el espacio de activación a lo largo de varias capas. La variante `OBLITERATED` aplica una técnica de ablación (abliteration) que elimina esas direcciones de activación, de modo que el modelo resultante no rechaza peticiones que el modelo base sí rechazaría. No se ha proporcionado información sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. El modelo es compatible con las librerías transformers, vLLM, SGLang y llama.cpp, según los tags de HuggingFace.

## Capacidades

Según los tags de HuggingFace y la documentación disponible, el modelo presenta las siguientes capacidades:

- Comprensión y generación de texto e imágenes (multimodal, image-text-to-text).
- Soporte de tool calling y function calling.
- Capacidades para agentes y razonamiento multi-paso (agentic).
- Razonamiento profundo (deep-reasoning).
- Enfoque en ciberseguridad (cybersecurity).
- Conversación multilingüe en inglés, árabe y chino (según tags).
- Comportamiento sin censura: cumple peticiones que el modelo Qwen3.8-27B original rechazaría, incluyendo generación de código para investigación de seguridad y escenarios de red-team.

## Casos de uso

- Investigación en ciberseguridad ofensiva: el modelo puede generar código de explotación o técnicas de pentesting que el modelo base rechazaría. Es adecuado para entornos de red-team controlados donde se necesita explorar vulnerabilidades sin las restricciones de seguridad del modelo original.
- Agentes autónomos con tool calling: gracias a su soporte de tool calling, puede integrarse en pipelines de agentes que necesitan llamar a funciones externas, como consultas a APIs o ejecución de comandos, para automatizar tareas complejas.
- Análisis de imágenes técnicas: al ser multimodal, puede procesar capturas de pantalla, diagramas de arquitectura o imágenes de código para asistir en tareas de análisis técnico, como revisión de código o documentación visual.
- Generación de código sin restricciones: en entornos de desarrollo controlados, puede utilizarse para prototipar código rápidamente sin que el modelo rechace peticiones por contenido considerado sensible.
- Simulación de conversaciones sin filtro: permite estudiar cómo responde un modelo de lenguaje sin capas de seguridad, lo que es útil para investigar sesgos, alineación y comportamientos de rechazo en modelos de IA.
- Asistente técnico multilingüe: al soportar inglés, árabe y chino, puede desplegarse en equipos internacionales para tareas de soporte técnico o documentación en varios idiomas.
- Automatización de razonamiento profundo: para problemas que requieren múltiples pasos de razonamiento, como análisis de logs o planificación de tareas, el modelo puede generar cadenas de pensamiento detalladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia de un modelo denso de 27B (estimación orientativa):
  - FP16: ~54 GB.
  - 8 bits: ~27 GB.
  - 4 bits: ~14 GB.
- GPU recomendadas: A100 80GB, H100 80GB, o 2x RTX 4090 (para FP16); RTX 4090 de 24GB o similar (para cuantización de 4 bits).
- El modelo es compatible con consumer GPUs de alta gama en cuantización de 4 bits, pero no en FP16.
- Opciones de despliegue: vLLM, SGLang, llama.cpp y Ollama (según tags).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa con otros modelos. La siguiente tabla compara conceptualmente esta variante con el modelo base del que deriva:

| Modelo | Parametros | Contexto | Licencia | Diferencias |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | no disponible | no disponible | Mantiene los comportamientos de rechazo |
| Qwen3.8-27B-OBLITERATED | 27B | no disponible | Apache 2.0 (según tags) | Elimina los comportamientos de rechazo |

No se conocen otros modelos comparables de la misma categoría.

## Limitaciones y advertencias

- Al ser una versión ablacionada, el modelo puede generar contenido dañino, ilegal o peligroso sin las restricciones de seguridad del modelo original. No debe usarse sin supervisión humana.
- Riesgo de alucinación inherente a los modelos de lenguaje grandes, agravado por la falta de información sobre el proceso de entrenamiento.
- No se ha proporcionado información sobre el dataset de entrenamiento, la composición de los datos ni las técnicas de alineación, por lo que no se pueden evaluar sesgos específicos.
- Los idiomas soportados pueden ser limitados; la información completa sobre el multilingüismo no está disponible.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere una validación mínima por parte de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero el uso del modelo debe cumplir con las leyes aplicables, especialmente en tareas de ciberseguridad ofensiva.

## Enlaces

- https://huggingface.co/medismera/Qwen3.8-27B-OBLITERATED-bucket
- https://github.com/bigguy8585/ai/tree/main/Qwen3.8-27B-OBLITERATED
- https://huggingface.co/buckets/shivanandasai/Qwen3.8-27B-OBLITERATED-bucket
