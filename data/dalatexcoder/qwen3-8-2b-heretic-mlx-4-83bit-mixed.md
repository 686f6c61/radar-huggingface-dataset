# dalatexcoder/Qwen3.8-2B-Heretic-MLX-4.83bit-Mixed

## Resumen

El modelo `dalatexcoder/Qwen3.8-2B-Heretic-MLX-4.83bit-Mixed` es una versión cuantizada en formato MLX (Apple Silicon) de un modelo de lenguaje de 2B parámetros basado en la serie Qwen3.8, destilado por el laboratorio independiente Empero y posteriormente sometido a un proceso de eliminación de censura mediante la herramienta Heretic y abliteración. El resultado es un modelo conversacional y de razonamiento diseñado para ejecutarse en dispositivos edge, con soporte de function calling y sin los alineamientos de seguridad habituales.

El autor, dalatexcoder, publica este checkpoint con licencia Apache 2.0, orientado a desarrolladores que necesitan un modelo pequeño, rápido y "sin censura" para entornos locales o integraciones en las que el filtrado de contenido no es deseable. Aunque el nombre indica 2B parámetros, el archivo safetensors registra 362.165.056 parámetros, una discrepancia que conviene verificar antes de su uso. El repositorio ocupa 2.0 GB y está pensado para la librería MLX, lo que lo hace especialmente adecuado para Macs con Apple Silicon.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (basado en Qwen3.8, sin detalle oficial) |
| Parametros totales | 362.165.056 (según safetensors; el nombre sugiere 2B, posible discrepancia) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4.83bit mixto (MLX) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No se han publicado detalles técnicos sobre la arquitectura interna del modelo. Por el nombre y los tags, se infiere que parte de la serie Qwen3.8, que a su vez se basa en el diseño de Qwen3.5, pero no hay confirmación oficial sobre el número de capas, dimensiones o mecanismos de atención. El proceso de creación combina una destilación de Qwen3.8 a 2B realizada por Empero (modelo base `MihaiPopa-1/Qwen3.8-2B-Heretic-Balanced`), seguida de la aplicación de Heretic, una herramienta que elimina automáticamente la censura o "alineamiento de seguridad" de modelos transformer sin necesidad de post-entrenamiento costoso, y de una técnica de abliteración que modifica los pesos para anular los circuitos de rechazo. No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron métodos como RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento multi-step, según los tags de reasoning y sft.
- Soporte de function calling / tool calling.
- Capacidad de ejecución en entornos edge gracias a su tamaño reducido y cuantización MLX.
- Modelo "decensored" y "abliterated": no aplica los filtros de seguridad habituales, lo que permite generar contenido que otros modelos rechazarían.
- Integración con la librería MLX para Apple Silicon.

## Casos de uso

- Asistentes conversacionales locales en Mac: al estar cuantizado para MLX, puede ejecutarse en portátiles Apple con suficiente memoria unificada, ofreciendo respuestas rápidas sin conexión a internet.
- Prototipado de agentes con function calling: su soporte de tool calling permite integrarlo en pipelines de automatización que necesiten invocar APIs o ejecutar acciones, aunque su tamaño limitado puede restringir la complejidad de las tareas.
- Generación de contenido creativo sin restricciones: escritores o desarrolladores que necesiten explorar temas sensibles o controvertidos pueden usar este modelo sin que el sistema de seguridad bloquee las salidas.
- Evaluación de técnicas de eliminación de censura: al ser un ejemplo práctico de Heretic y abliteración, sirve como banco de pruebas para investigar cómo afectan estas técnicas al comportamiento del modelo.
- Despliegue en dispositivos con recursos limitados: su tamaño de 2 GB y cuantización mixta lo hacen apto para Raspberry Pi o sistemas embebidos con soporte MLX, aunque el rendimiento dependerá de la memoria disponible.
- Fine-tuning posterior: al ser un modelo abierto con licencia Apache 2.0, puede servir como base para ajustes específicos en dominios donde se requiera ausencia de censura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada: no disponible, pero al ser un modelo de ~2B cuantizado a 4.83bit, el uso de memoria debería rondar entre 1 y 2 GB, dependiendo de la longitud de contexto y el batch.
- GPU recomendadas: cualquier Mac con Apple Silicon (M1 o superior) y al menos 8 GB de memoria unificada para una experiencia fluida.
- No cabe en GPUs consumer de NVIDIA de forma nativa con MLX, pero podría convertirse a otros formatos (GGUF, etc.) para ejecutarse en tarjetas como RTX 3060 o superiores.
- Opciones de despliegue: MLX (librería nativa), posible conversión a llama.cpp u Ollama si se exportan los pesos a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos de 2B. Como referencia genérica, se podría comparar con Qwen2.5-1.5B, Llama-3.2-1B o SmolLM2-1.7B, pero no hay información sobre rendimiento relativo. La principal diferencia es la ausencia de censura y el formato MLX específico para Apple.

## Limitaciones y advertencias

- El modelo está diseñado para no tener censura, por lo que puede generar contenido ofensivo, ilegal o peligroso. Su uso en producción debe considerar políticas de seguridad y responsabilidad legal.
- Riesgo de alucinación elevado, especialmente en tareas de razonamiento complejo, debido a su tamaño reducido.
- Solo soporta inglés; no hay capacidades multilingües confirmadas.
- La discrepancia entre el nombre (2B) y los parámetros registrados (362M) sugiere que el modelo podría ser una versión destilada más pequeña de lo esperado, lo que afectaría a su capacidad real.
- No se han publicado benchmarks ni evaluaciones de robustez, por lo que su comportamiento en tareas específicas es incierto.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado sin filtros puede acarrear responsabilidades legales en ciertos contextos.

## Enlaces

- HuggingFace: https://huggingface.co/dalatexcoder/Qwen3.8-2B-Heretic-MLX-4.83bit-Mixed
- Modelo base: https://huggingface.co/MihaiPopa-1/Qwen3.8-2B-Heretic-Balanced
- Heretic (herramienta de eliminación de censura): https://github.com/p-e-w/heretic
- Empero (laboratorio de destilación): https://empero.org/
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
