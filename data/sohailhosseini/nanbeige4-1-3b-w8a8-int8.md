# Sohailhosseini/Nanbeige4.1-3B-W8A8-INT8

## Resumen

Nanbeige4.1-3B-W8A8-INT8 es una cuantización de 8 bits (W8A8) del modelo Nanbeige4.1-3B, realizada por Sohailhosseini y publicada en HuggingFace. El modelo base, desarrollado por el equipo Nanbeige, es un modelo de lenguaje denso de 3,9 mil millones de parámetros construido sobre Nanbeige4-3B-Base, con post-entrenamiento mediante SFT y RL. Está diseñado para razonamiento, alineación y uso de herramientas, y destaca frente a otros modelos pequeños en tareas que requieren tool calling y razonamiento multi-paso.

Esta versión cuantizada reduce el peso de 7,9 GB a 4,8 GB (compresión de 1,64x) y está pensada para GPUs Ampere (A100, A40, A6000) que carecen de un camino rápido para FP8. El formato es compressed-tensors, compatible con vLLM, y conserva la licencia Apache 2.0 del modelo original. El contexto máximo es de 32.768 tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Llama, según tags de HuggingFace) |
| Parametros totales | 3.933.990.120 (3,9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | W8A8-INT8 (pesos y activaciones en 8 bits) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Nanbeige4.1-3B es un transformer denso de 3,9B parámetros, evolucionado a partir de Nanbeige4-3B-Base mediante una fase de post-entrenamiento que combina fine-tuning supervisado (SFT) y aprendizaje por refuerzo (RL). Según el paper del equipo, está orientado a razonamiento, alineación y acción con herramientas. Esta versión cuantizada aplica un esquema W8A8-INT8, donde tanto pesos como activaciones se reducen a 8 bits, usando el conjunto de calibración HuggingFaceH4/ultrachat_200k con 256 muestras. La capa `lm_head` se deja sin cuantizar para preservar la calidad de la salida. El autor advierte que, a diferencia de la cuantización FP8, este esquema requiere calibración previa.

## Capacidades

- Generación de texto y razonamiento multi-paso: el modelo base está entrenado para razonamiento lógico y matemático.
- Soporte de tool calling y uso de agentes: el paper destaca que supera a otros modelos pequeños con herramientas en todos los benchmarks.
- Capacidades multilingües: no confirmadas por el autor de la cuantización.
- Modo de pensamiento (thinking mode): el modelo base hereda la capacidad de razonamiento extendido de Nanbeige4-3B-Thinking-2511.
- Cuantización eficiente: W8A8-INT8 permite inferencia rápida en GPUs Ampere sin soporte FP8 nativo.

## Casos de uso

- Atención al cliente automatizada: con 32K tokens de contexto, puede gestionar conversaciones multi-turno largas y recordar detalles de interacciones previas, manteniendo un tono coherente.
- Generación de código en producción: su capacidad de tool calling permite integrarlo en pipelines de CI/CD para generar tests, documentar funciones o autocompletar snippets, con latencia reducida gracias a la cuantización 8-bit.
- Asistentes de razonamiento matemático: útil en plataformas educativas para resolver problemas paso a paso y explicar el proceso, gracias al entrenamiento específico en razonamiento.
- Agentes autónomos en entornos limitados: el tamaño de 3,9B y la cuantización permiten ejecutarlo en una sola GPU de gama media, ideal para prototipos de agentes que llaman APIs o herramientas.
- Despliegue en entornos de baja latencia: la cuantización W8A8 reduce el ancho de banda de memoria, acelerando la inferencia en GPUs Ampere como A40 o A6000, adecuadas para producción con vLLM.
- Evaluación de modelos en investigación: al mantener la licencia Apache 2.0, permite experimentar con fine-tuning o sistemas multi-agente sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para la versión cuantizada W8A8-INT8 en la información disponible. El modelo base Nanbeige4.1-3B afirma en su paper superar a otros modelos pequeños con herramientas en todos los benchmarks, pero no se detallan números en esta ficha. Se recomienda consultar el paper (arxiv 2602.13367) para datos de MMLU, HumanEval, GSM8K, etc. del modelo original.

## Requisitos de hardware

- VRAM estimada: ~5 GB para los 4,8 GB de pesos más overhead de ejecución; con contexto de 32K tokens puede aumentar a 6-8 GB.
- GPUs recomendadas: el autor cuantizó en una A40 y sugiere Ampere (A100, A40, A6000). También es viable en GPUs consumer con 8 GB o más (RTX 4060 Ti 16 GB, RTX 4090, etc.).
- No cabe en GPUs de 4 GB en configuraciones con contexto largo; para 32K tokens se necesita al menos 8 GB.
- Opciones de despliegue: vLLM (soporte nativo de compressed-tensors), llama.cpp, Ollama (convirtiendo a GGUF), SGLang.
- Latencia y throughput: no disponibles para esta cuantización específica; el autor indica que la ventaja frente a FP8 es la compatibilidad con Ampere, no la velocidad pura.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizacion | Disponibilidad |
|---|---|---|---|---|---|
| Nanbeige4.1-3B-W8A8-INT8 | 3,9B | 32K | Apache 2.0 | W8A8-INT8 | HuggingFace |
| Qwen2.5-3B | 3,1B | 32K | Apache 2.0 | FP8, INT8, GGUF | HuggingFace |
| Llama-3.2-3B | 3,2B | 128K | Llama 3.2 | FP8, INT8, GGUF | HuggingFace |

No se han publicado comparativas de rendimiento entre estas versiones cuantizadas en la información disponible. La ventaja de Nanbeige4.1-3B es su entrenamiento específico en razonamiento y tool calling, mientras que Llama-3.2-3B ofrece un contexto de 128K y ecosistema más amplio.

## Limitaciones y advertencias

- La cuantización W8A8 requiere calibración previa; si se usa sin ella, la degradación de calidad puede ser notable.
- Riesgo de alucinación: los modelos de 3,9B son propensos a inventar información en tareas complejas, especialmente en razonamiento de larga duración.
- Idiomas soportados: no confirmados, lo que limita el uso en entornos multilingües sin verificación previa.
- Contexto de 32K tokens: suficiente para muchas tareas, pero inferior a alternativas como Llama-3.2-3B (128K).
- Licencia Apache 2.0 permite uso comercial, pero la cuantización hereda la licencia del modelo base; se debe verificar que no haya restricciones adicionales en el modelo original.
- No se han publicado benchmarks de la versión cuantizada, por lo que el rendimiento real frente a la versión original no está validado.

## Enlaces

- Modelo cuantizado: https://huggingface.co/Sohailhosseini/Nanbeige4.1-3B-W8A8-INT8
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.1-3B
- Paper del modelo base: https://arxiv.org/html/2602.13367v1
- Benchmarks (BenchSift): https://benchsift.nxtaigen.com/models/nanbeige4-1-3b
- Guía de despliegue (Lambda): https://lambda.ai/inference-models/nanbeige/nanbeige4.1-3b
